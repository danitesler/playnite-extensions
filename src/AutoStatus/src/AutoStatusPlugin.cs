using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Windows.Threading;
using Playnite.SDK;
using Playnite.SDK.Events;
using Playnite.SDK.Models;
using Playnite.SDK.Plugins;

namespace AutoStatus
{
    public class AutoStatusPlugin : GenericPlugin
    {
        private static readonly Guid PluginId = Guid.Parse("D44E682B-03CD-49CE-A1E6-0A0AF0BFF87F");
        private static readonly ILogger Logger = LogManager.GetLogger();
        private const string StaleNotificationId = "AutoStatus_StaleMoved";

        // Playnite can stay open for days (Fullscreen / HTPC), so the stale rule re-runs periodically.
        private static readonly TimeSpan PassInterval = TimeSpan.FromHours(6);
        private static readonly TimeSpan MarksSaveDelay = TimeSpan.FromSeconds(5);

        private readonly AutoStatusSettings settings;
        private readonly StatusMarks marks;
        private DispatcherTimer passTimer;
        private DispatcherTimer marksSaveTimer;
        private bool attached;

        public override Guid Id => PluginId;

        public AutoStatusPlugin(IPlayniteAPI api) : base(api)
        {
            settings = new AutoStatusSettings(this);
            marks = new StatusMarks(Path.Combine(GetPluginUserDataPath(), "status-marks.json"));
            Properties = new GenericPluginProperties
            {
                HasSettings = true
            };
        }

        public override ISettings GetSettings(bool firstRunSettings)
        {
            return settings;
        }

        public override System.Windows.Controls.UserControl GetSettingsView(bool firstRunSettings)
        {
            return new AutoStatusSettingsView();
        }

        public override IEnumerable<MainMenuItem> GetMainMenuItems(GetMainMenuItemsArgs args)
        {
            yield return new MainMenuItem
            {
                MenuSection = "@AutoStatus",
                Description = AutoStatusLoc.Get("LOCAutoStatus_Menu_ApplyNow", "Apply status rules now"),
                Action = _ => ApplyNowFromMenu()
            };
        }

        public override void OnApplicationStarted(OnApplicationStartedEventArgs args)
        {
            marks.Load();
            settings.ApplyDefaultStatuses(GetCompletionStatuses());
            PlayniteApi.Database.Games.ItemUpdated += OnGamesUpdated;
            attached = true;

            PlayniteApi.MainView.UIDispatcher.BeginInvoke(
                new Action(() =>
                {
                    StartTimers();
                    RunStalePassAndNotify();
                }),
                DispatcherPriority.ApplicationIdle);
        }

        public override void OnApplicationStopped(OnApplicationStoppedEventArgs args)
        {
            if (attached)
            {
                PlayniteApi.Database.Games.ItemUpdated -= OnGamesUpdated;
                attached = false;
            }

            passTimer?.Stop();
            marksSaveTimer?.Stop();
            marks.Save();
        }

        public override void OnGameStarted(OnGameStartedEventArgs args)
        {
            var gameId = args?.Game?.Id ?? Guid.Empty;
            if (gameId == Guid.Empty)
            {
                return;
            }

            PlayniteApi.MainView.UIDispatcher.BeginInvoke(new Action(() => ApplyResumeRule(gameId)));
        }

        internal IEnumerable<CompletionStatus> GetCompletionStatuses()
        {
            return PlayniteApi.Database.CompletionStatuses?.ToList() ?? new List<CompletionStatus>();
        }

        internal void OnSettingsSaved()
        {
            PlayniteApi.MainView.UIDispatcher.BeginInvoke(
                new Action(RunStalePassAndNotify),
                DispatcherPriority.ApplicationIdle);
        }

        private void StartTimers()
        {
            if (passTimer == null)
            {
                passTimer = new DispatcherTimer { Interval = PassInterval };
                passTimer.Tick += (s, e) => RunStalePassAndNotify();
            }

            if (marksSaveTimer == null)
            {
                marksSaveTimer = new DispatcherTimer { Interval = MarksSaveDelay };
                marksSaveTimer.Tick += (s, e) =>
                {
                    marksSaveTimer.Stop();
                    marks.Save();
                };
            }

            passTimer.Start();
        }

        private void ApplyNowFromMenu()
        {
            var moved = RunStalePass();
            PlayniteApi.Dialogs.ShowMessage(
                moved > 0 ? MovedMessage(moved) : AutoStatusLoc.Get("LOCAutoStatus_Result_NothingToDo", "No games needed a status change."),
                "AutoStatus");
        }

        private void RunStalePassAndNotify()
        {
            var moved = RunStalePass();
            if (moved > 0)
            {
                PlayniteApi.Notifications.Add(new NotificationMessage(StaleNotificationId, MovedMessage(moved), NotificationType.Info));
            }
        }

        private string MovedMessage(int moved)
        {
            var target = PlayniteApi.Database.CompletionStatuses.Get(settings.StaleToStatusId)?.Name ?? string.Empty;
            return AutoStatusLoc.Format(
                "LOCAutoStatus_Result_Moved",
                "Changed to {1} after {2} days without play: {0}",
                moved,
                target,
                settings.StaleDays);
        }

        /// <summary>Moves watched-status games that have not been played (or re-marked) within the window.</summary>
        private int RunStalePass()
        {
            try
            {
                var from = settings.StaleFromStatusId;
                var to = settings.StaleToStatusId;
                var database = PlayniteApi.Database;
                if (settings.IsEditing || !settings.Enabled || !settings.StaleRuleEnabled
                    || from == Guid.Empty || to == Guid.Empty || from == to
                    || database.CompletionStatuses.Get(to) == null)
                {
                    return 0;
                }

                var now = DateTime.Now;
                var watched = new HashSet<Guid>();
                var stale = new List<Game>();
                foreach (var game in database.Games)
                {
                    if (game.CompletionStatusId != from)
                    {
                        continue;
                    }

                    watched.Add(game.Id);
                    if (StatusRules.IsStale(game.LastActivity, marks.Get(game.Id), settings.StaleDays, now))
                    {
                        stale.Add(game);
                    }
                }

                marks.RetainOnly(watched);
                if (stale.Count > 0)
                {
                    using (database.BufferedUpdate())
                    {
                        foreach (var game in stale)
                        {
                            game.CompletionStatusId = to;
                            database.Games.Update(game);
                        }
                    }
                }

                marks.Save();
                return stale.Count;
            }
            catch (Exception ex)
            {
                Logger.Error(ex, "AutoStatus stale-status pass failed.");
                return 0;
            }
        }

        private void ApplyResumeRule(Guid gameId)
        {
            try
            {
                if (settings.IsEditing || !settings.Enabled || !settings.ResumeRuleEnabled)
                {
                    return;
                }

                var game = PlayniteApi.Database.Games.Get(gameId);
                var to = settings.ResumeToStatusId;
                if (game == null
                    || !StatusRules.ShouldResume(game.CompletionStatusId, settings.ResumeFromStatusIds, to)
                    || PlayniteApi.Database.CompletionStatuses.Get(to) == null)
                {
                    return;
                }

                game.CompletionStatusId = to;
                PlayniteApi.Database.Games.Update(game);
            }
            catch (Exception ex)
            {
                Logger.Error(ex, "AutoStatus could not update the status of a started game.");
            }
        }

        // Records when a game enters the watched status, whoever changed it.
        private void OnGamesUpdated(object sender, ItemUpdatedEventArgs<Game> e)
        {
            var watched = settings.StaleFromStatusId;
            if (watched == Guid.Empty || e?.UpdatedItems == null)
            {
                return;
            }

            var changed = false;
            foreach (var update in e.UpdatedItems)
            {
                var game = update?.NewData;
                var oldStatus = update?.OldData?.CompletionStatusId ?? Guid.Empty;
                if (game == null || game.CompletionStatusId == oldStatus)
                {
                    continue;
                }

                if (game.CompletionStatusId == watched)
                {
                    marks.Mark(game.Id, DateTime.Now);
                    changed = true;
                }
                else if (oldStatus == watched)
                {
                    marks.Clear(game.Id);
                    changed = true;
                }
            }

            if (changed)
            {
                PlayniteApi.MainView.UIDispatcher.BeginInvoke(new Action(() =>
                {
                    if (marksSaveTimer != null)
                    {
                        marksSaveTimer.Stop();
                        marksSaveTimer.Start();
                    }
                }));
            }
        }
    }
}
