using System;
using System.Collections.Generic;
using System.Linq;
using System.Windows;
using System.Windows.Controls;
using Playnite.SDK;
using Playnite.SDK.Events;
using Playnite.SDK.Plugins;

namespace RandomTheme
{
    public class RandomThemePlugin : GenericPlugin
    {
        // Stable plugin GUID: never change.
        private static readonly Guid PluginId = Guid.Parse("A4A17932-197C-4EFC-AB31-0F8D35732583");
        private static readonly ILogger Logger = LogManager.GetLogger();
        private static readonly ApplicationMode[] Modes = { ApplicationMode.Desktop, ApplicationMode.Fullscreen };

        private readonly Random random = new Random();
        private readonly RandomThemeSettings settings;

        // The theme this session was started with, so "avoid repeats" also skips it after a manual roll.
        private ApplicationMode runningMode = ApplicationMode.Desktop;
        private string runningThemeId;

        public override Guid Id => PluginId;

        public RandomThemePlugin(IPlayniteAPI api) : base(api)
        {
            settings = new RandomThemeSettings(this);
            Properties = new GenericPluginProperties
            {
                HasSettings = true
            };
        }

        // ─── Lifecycle ────────────────────────────────────────────────────────

        public override void OnApplicationStarted(OnApplicationStartedEventArgs args)
        {
            runningMode = PlayniteApi.ApplicationInfo.Mode;
            runningThemeId = PlayniteHost.GetTheme(runningMode);
            Logger.Info($"RandomTheme: Started in {runningMode} mode with theme '{runningThemeId ?? "(unknown)"}'.");

            OnUiThread(() =>
            {
                var changed = false;
                foreach (var mode in Modes)
                {
                    var category = settings.For(mode);
                    if (!category.Enabled)
                    {
                        Logger.Info($"RandomTheme [{mode}]: Randomization is off; leaving the theme alone.");
                        continue;
                    }

                    if (!category.IsDue(DateTime.Now))
                    {
                        Logger.Info($"RandomTheme [{mode}]: Not due yet (last change {category.LastPickedUtc:u}, cadence step {category.CadenceStep}); leaving the theme alone.");
                        continue;
                    }

                    try
                    {
                        var outcome = Pick(mode, out _);
                        if (outcome == PickOutcome.Picked)
                        {
                            changed = true;
                            category.LastPickedUtc = DateTime.UtcNow;
                        }

                        if (outcome == PickOutcome.ApplyFailed)
                        {
                            PlayniteApi.Notifications.Add(new NotificationMessage(
                                "RandomTheme_ApplyFailed_" + mode,
                                RandomThemeLoc.Format(
                                    "LOCRandomTheme_Error_Apply",
                                    "The {0} theme could not be changed because Playnite's settings could not be accessed. See extensions.log for details.",
                                    RandomThemeLoc.ModeName(mode)),
                                NotificationType.Error));
                        }
                    }
                    catch (Exception ex)
                    {
                        Logger.Error(ex, $"RandomTheme [{mode}]: Unexpected error while picking a theme. Playnite continues normally.");
                    }
                }

                if (changed)
                {
                    PlayniteHost.SaveSettings();
                    settings.Persist();
                }
            });
        }

        // ─── Main menu ────────────────────────────────────────────────────────

        public override IEnumerable<MainMenuItem> GetMainMenuItems(GetMainMenuItemsArgs args)
        {
            var section = "@" + RandomThemeLoc.Get("LOCRandomTheme_Section", "Random Theme");
            foreach (var mode in Modes)
            {
                var category = settings.For(mode);
                yield return new MainMenuItem
                {
                    Description = category.RandomizeNowMenuText,
                    MenuSection = section,
                    Action = _ => RandomizeNow(category)
                };
            }
        }

        // ─── Settings plumbing ────────────────────────────────────────────────

        public override ISettings GetSettings(bool firstRunSettings) => settings;

        public override UserControl GetSettingsView(bool firstRunSettings) => new RandomThemeSettingsView();

        internal List<ThemeInfo> GetInstalledThemes(ApplicationMode mode) => ThemeCatalog.GetThemes(PlayniteApi, mode);

        // ─── Randomizing ──────────────────────────────────────────────────────

        private enum PickOutcome
        {
            Picked,
            NoCandidates,
            ApplyFailed
        }

        /// <summary>
        /// Picks a random eligible theme for the mode and sets it as the theme for the next start.
        /// Does not save Playnite's settings; the caller does that once after all modes are done.
        /// </summary>
        private PickOutcome Pick(ApplicationMode mode, out ThemeInfo picked)
        {
            picked = null;
            var category = settings.For(mode);
            var installed = ThemeCatalog.GetThemes(PlayniteApi, mode);

            // The theme already set (queued for the next start) and, for the mode on screen, the one running now.
            var recent = new List<string> { PlayniteHost.GetTheme(mode) };
            if (mode == runningMode)
            {
                recent.Add(runningThemeId);
            }

            var choice = ThemePicker.Choose(installed, category.ExcludedThemeIds, category.AvoidRepeat, recent, random);
            Logger.Info($"RandomTheme [{mode}]: {installed.Count} compatible theme(s) installed, {category.ExcludedThemeIds.Count} unchecked.");
            if (choice == null)
            {
                Logger.Warn($"RandomTheme [{mode}]: No eligible themes; the theme is left unchanged.");
                return PickOutcome.NoCandidates;
            }

            if (!PlayniteHost.SetTheme(mode, choice.Id))
            {
                return PickOutcome.ApplyFailed;
            }

            Logger.Info($"RandomTheme [{mode}]: Next launch will use '{choice.Name}' ({choice.Id}).");
            picked = choice;
            return PickOutcome.Picked;
        }

        /// <summary>Manual "Randomize now" for one mode, from the settings view or the main menu.</summary>
        internal void RandomizeNow(ThemeCategorySettings category)
        {
            OnUiThread(() =>
            {
                var mode = category.Mode;
                var modeName = RandomThemeLoc.ModeName(mode);
                var title = RandomThemeLoc.Get("LOCRandomTheme_Section", "Random Theme");

                try
                {
                    switch (Pick(mode, out var picked))
                    {
                        case PickOutcome.NoCandidates:
                            PlayniteApi.Dialogs.ShowErrorMessage(
                                RandomThemeLoc.Format(
                                    "LOCRandomTheme_Error_NoThemes",
                                    "No {0} themes are available to choose from. Install a compatible theme or select at least one in the extension settings.",
                                    modeName),
                                title);
                            return;

                        case PickOutcome.ApplyFailed:
                            PlayniteApi.Dialogs.ShowErrorMessage(
                                RandomThemeLoc.Format(
                                    "LOCRandomTheme_Error_Apply",
                                    "The {0} theme could not be changed because Playnite's settings could not be accessed. See extensions.log for details.",
                                    modeName),
                                title);
                            return;

                        default:
                            PlayniteHost.SaveSettings();
                            category.LastPickedUtc = DateTime.UtcNow;
                            settings.Persist();
                            category.RefreshNextTheme();
                            AnnounceAndOfferRestart(mode, $"{modeName}: {picked.Name}", title);
                            return;
                    }
                }
                catch (Exception ex)
                {
                    Logger.Error(ex, $"RandomTheme [{mode}]: Error during manual randomization.");
                    PlayniteApi.Dialogs.ShowErrorMessage(ex.Message, title);
                }
            });
        }

        private void AnnounceAndOfferRestart(ApplicationMode mode, string summary, string title)
        {
            // Playnite loads its theme before extensions run, so it can only change on a restart.
            // Restarting is only worth offering for the mode that is on screen right now.
            if (mode != runningMode)
            {
                PlayniteApi.Dialogs.ShowMessage(
                    summary + "\n\n" + RandomThemeLoc.Get(
                        "LOCRandomTheme_AppliedLater",
                        "The new theme will be used the next time Playnite starts in that mode."),
                    title);
                return;
            }

            var answer = PlayniteApi.Dialogs.ShowMessage(
                summary + "\n\n" + RandomThemeLoc.Get(
                    "LOCRandomTheme_RestartQuestion",
                    "The new theme will be used after Playnite restarts. Restart now?"),
                title,
                MessageBoxButton.YesNo,
                MessageBoxImage.Question);
            if (answer != MessageBoxResult.Yes)
            {
                return;
            }

            // If this came from the settings dialog, keep whatever was changed there.
            settings.Persist();
            if (!PlayniteHost.Restart())
            {
                PlayniteApi.Dialogs.ShowErrorMessage(
                    RandomThemeLoc.Get("LOCRandomTheme_Error_Restart", "Playnite could not restart itself. Please restart it manually."),
                    title);
            }
        }

        private void OnUiThread(Action action)
        {
            var dispatcher = PlayniteApi.MainView?.UIDispatcher ?? Application.Current?.Dispatcher;
            if (dispatcher == null || dispatcher.CheckAccess())
            {
                action();
            }
            else
            {
                dispatcher.Invoke(action);
            }
        }
    }
}
