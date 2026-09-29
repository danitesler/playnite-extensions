using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Linq;
using Playnite.SDK;
using Playnite.SDK.Data;
using Playnite.SDK.Models;

namespace AutoStatus
{
    public class StatusOption
    {
        public Guid Id { get; set; }
        public string Name { get; set; }
    }

    public class StatusChoice : ObservableObject
    {
        public Guid Id { get; set; }
        public string Name { get; set; }

        private bool isSelected;
        public bool IsSelected
        {
            get => isSelected;
            set => SetValue(ref isSelected, value);
        }
    }

    public class AutoStatusSettings : ObservableObject, ISettings
    {
        [DontSerialize]
        private readonly AutoStatusPlugin plugin;

        private bool enabled = true;
        public bool Enabled
        {
            get => enabled;
            set => SetValue(ref enabled, value);
        }

        private bool staleRuleEnabled = true;
        public bool StaleRuleEnabled
        {
            get => staleRuleEnabled;
            set => SetValue(ref staleRuleEnabled, value);
        }

        private Guid staleFromStatusId;
        public Guid StaleFromStatusId
        {
            get => staleFromStatusId;
            set => SetValue(ref staleFromStatusId, value);
        }

        private int staleDays = StatusRules.DefaultDays;
        public int StaleDays
        {
            get => staleDays;
            set => SetValue(ref staleDays, StatusRules.ClampDays(value));
        }

        private Guid staleToStatusId;
        public Guid StaleToStatusId
        {
            get => staleToStatusId;
            set => SetValue(ref staleToStatusId, value);
        }

        private bool resumeRuleEnabled = true;
        public bool ResumeRuleEnabled
        {
            get => resumeRuleEnabled;
            set => SetValue(ref resumeRuleEnabled, value);
        }

        private List<Guid> resumeFromStatusIds = new List<Guid>();
        public List<Guid> ResumeFromStatusIds
        {
            get => resumeFromStatusIds;
            set => SetValue(ref resumeFromStatusIds, value ?? new List<Guid>());
        }

        private Guid resumeToStatusId;
        public Guid ResumeToStatusId
        {
            get => resumeToStatusId;
            set => SetValue(ref resumeToStatusId, value);
        }

        // Set once the first-run status guesses ran, so clearing a combo later is not undone on restart.
        private bool defaultsApplied;
        public bool DefaultsApplied
        {
            get => defaultsApplied;
            set => SetValue(ref defaultsApplied, value);
        }

        private List<StatusOption> statusOptions = new List<StatusOption>();
        [DontSerialize]
        public List<StatusOption> StatusOptions
        {
            get => statusOptions;
            private set => SetValue(ref statusOptions, value);
        }

        private ObservableCollection<StatusChoice> resumeFromChoices = new ObservableCollection<StatusChoice>();
        [DontSerialize]
        public ObservableCollection<StatusChoice> ResumeFromChoices
        {
            get => resumeFromChoices;
            private set => SetValue(ref resumeFromChoices, value);
        }

        // The settings view binds to this live object; passes wait until Save/Cancel so half-made edits never apply.
        [DontSerialize]
        internal bool IsEditing { get; private set; }

        private bool enabledOriginal;
        private bool staleRuleEnabledOriginal;
        private Guid staleFromStatusIdOriginal;
        private int staleDaysOriginal;
        private Guid staleToStatusIdOriginal;
        private bool resumeRuleEnabledOriginal;
        private List<Guid> resumeFromStatusIdsOriginal;
        private Guid resumeToStatusIdOriginal;

        public AutoStatusSettings()
        {
        }

        public AutoStatusSettings(AutoStatusPlugin plugin) : this()
        {
            this.plugin = plugin;
            var saved = plugin.LoadPluginSettings<AutoStatusSettings>();
            if (saved != null)
            {
                Enabled = saved.Enabled;
                StaleRuleEnabled = saved.StaleRuleEnabled;
                StaleFromStatusId = saved.StaleFromStatusId;
                StaleDays = saved.StaleDays;
                StaleToStatusId = saved.StaleToStatusId;
                ResumeRuleEnabled = saved.ResumeRuleEnabled;
                ResumeFromStatusIds = saved.ResumeFromStatusIds?.ToList() ?? new List<Guid>();
                ResumeToStatusId = saved.ResumeToStatusId;
                DefaultsApplied = saved.DefaultsApplied;
            }
        }

        /// <summary>
        /// First run only: point the rules at Playnite's stock statuses (Playing, On Hold, Abandoned,
        /// Plan to Play). Anything not found stays empty and the user picks it in settings.
        /// </summary>
        internal void ApplyDefaultStatuses(IEnumerable<CompletionStatus> statuses)
        {
            var pairs = statuses?
                .Where(s => s != null)
                .Select(s => new KeyValuePair<Guid, string>(s.Id, s.Name))
                .ToList();
            if (DefaultsApplied || pairs == null || pairs.Count == 0)
            {
                return;
            }

            var playing = FindStock(pairs, "Playing", "LOCCompletionStatusPlaying");
            var onHold = FindStock(pairs, "On Hold", "LOCCompletionStatusOnHold");
            var abandoned = FindStock(pairs, "Abandoned", "LOCCompletionStatusAbandoned");
            var planToPlay = FindStock(pairs, "Plan to Play", "LOCCompletionStatusPlanToPlay");

            StaleFromStatusId = playing;
            StaleToStatusId = onHold;
            ResumeToStatusId = playing;
            ResumeFromStatusIds = new[] { onHold, abandoned, planToPlay }.Where(id => id != Guid.Empty).ToList();
            DefaultsApplied = true;
            plugin?.SavePluginSettings(this);
        }

        // English stock name, then Playnite's own localized label for it (best effort: key may not exist).
        private static Guid FindStock(List<KeyValuePair<Guid, string>> pairs, string englishName, string playniteLocKey)
        {
            return StatusRules.FindByName(pairs, englishName, AutoStatusLoc.TryGet(playniteLocKey));
        }

        public void BeginEdit()
        {
            enabledOriginal = Enabled;
            staleRuleEnabledOriginal = StaleRuleEnabled;
            staleFromStatusIdOriginal = StaleFromStatusId;
            staleDaysOriginal = StaleDays;
            staleToStatusIdOriginal = StaleToStatusId;
            resumeRuleEnabledOriginal = ResumeRuleEnabled;
            resumeFromStatusIdsOriginal = ResumeFromStatusIds.ToList();
            resumeToStatusIdOriginal = ResumeToStatusId;
            RefreshStatusLists();
            IsEditing = true;
        }

        public void CancelEdit()
        {
            Enabled = enabledOriginal;
            StaleRuleEnabled = staleRuleEnabledOriginal;
            StaleFromStatusId = staleFromStatusIdOriginal;
            StaleDays = staleDaysOriginal;
            StaleToStatusId = staleToStatusIdOriginal;
            ResumeRuleEnabled = resumeRuleEnabledOriginal;
            ResumeFromStatusIds = resumeFromStatusIdsOriginal ?? new List<Guid>();
            ResumeToStatusId = resumeToStatusIdOriginal;
            IsEditing = false;
        }

        public void EndEdit()
        {
            ResumeFromStatusIds = SelectedResumeFromIds();
            IsEditing = false;
            plugin.SavePluginSettings(this);
            plugin.OnSettingsSaved();
        }

        public bool VerifySettings(out List<string> errors)
        {
            errors = new List<string>();
            if (!Enabled)
            {
                return true;
            }

            if (StaleRuleEnabled
                && (StaleFromStatusId == Guid.Empty || StaleToStatusId == Guid.Empty || StaleFromStatusId == StaleToStatusId))
            {
                errors.Add(AutoStatusLoc.Get(
                    "LOCAutoStatus_Verify_StaleStatuses",
                    "Games I stopped playing: pick two different statuses."));
            }

            if (ResumeRuleEnabled && (ResumeToStatusId == Guid.Empty || SelectedResumeFromIds().Count == 0))
            {
                errors.Add(AutoStatusLoc.Get(
                    "LOCAutoStatus_Verify_ResumeStatuses",
                    "Games I start: pick at least one status and the status to change to."));
            }

            return errors.Count == 0;
        }

        private List<Guid> SelectedResumeFromIds()
        {
            return ResumeFromChoices.Count > 0
                ? ResumeFromChoices.Where(c => c.IsSelected).Select(c => c.Id).ToList()
                : ResumeFromStatusIds.ToList();
        }

        private void RefreshStatusLists()
        {
            var statuses = plugin?.GetCompletionStatuses()
                .Where(s => s != null)
                .OrderBy(s => s.Name, StringComparer.CurrentCultureIgnoreCase)
                .ToList() ?? new List<CompletionStatus>();

            StatusOptions = statuses.Select(s => new StatusOption { Id = s.Id, Name = s.Name }).ToList();
            ResumeFromChoices = new ObservableCollection<StatusChoice>(statuses.Select(s => new StatusChoice
            {
                Id = s.Id,
                Name = s.Name,
                IsSelected = ResumeFromStatusIds.Contains(s.Id)
            }));
        }
    }
}
