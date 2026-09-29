using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Linq;
using Playnite.SDK;
using Playnite.SDK.Data;

namespace RandomTheme
{
    /// <summary>One theme in a category's checklist. Checked = may be picked.</summary>
    public class ThemeChoice : ObservableObject
    {
        private readonly ThemeCategorySettings owner;
        private bool isIncluded;

        public string Id { get; }
        public string Name { get; }

        public bool IsIncluded
        {
            get => isIncluded;
            set
            {
                if (isIncluded == value)
                {
                    return;
                }

                isIncluded = value;
                OnPropertyChanged();
                owner.SetIncluded(Id, value);
            }
        }

        internal ThemeChoice(ThemeCategorySettings owner, string id, string name, bool isIncluded)
        {
            this.owner = owner;
            Id = id;
            Name = name;
            this.isIncluded = isIncluded;
        }
    }

    /// <summary>
    /// Everything RandomTheme remembers about one application mode. Desktop and Fullscreen each own one
    /// of these, so they are enabled, filtered and randomized independently: their themes are different sets.
    /// </summary>
    public class ThemeCategorySettings : ObservableObject
    {
        // ─── Persisted ────────────────────────────────────────────────────────

        private bool enabled = true;
        /// <summary>Pick a new random theme for this mode on every Playnite startup.</summary>
        public bool Enabled
        {
            get => enabled;
            set
            {
                enabled = value;
                OnPropertyChanged();
            }
        }

        private bool avoidRepeat = true;
        /// <summary>Do not pick the theme that is already set (when another eligible theme exists).</summary>
        public bool AvoidRepeat
        {
            get => avoidRepeat;
            set
            {
                avoidRepeat = value;
                OnPropertyChanged();
            }
        }

        /// <summary>Themes the user unchecked. New themes are eligible until unchecked.</summary>
        public List<string> ExcludedThemeIds { get; set; } = new List<string>();

        // ─── Runtime (bound by the settings view) ─────────────────────────────

        [DontSerialize]
        internal ApplicationMode Mode { get; private set; }

        [DontSerialize]
        private Action<ThemeCategorySettings> randomizeNow;

        [DontSerialize]
        private Func<ApplicationMode, List<ThemeInfo>> listInstalled;

        [DontSerialize]
        private List<ThemeInfo> installed = new List<ThemeInfo>();

        [DontSerialize]
        public ObservableCollection<ThemeChoice> Themes { get; } = new ObservableCollection<ThemeChoice>();

        [DontSerialize]
        public bool HasNoThemes => Themes.Count == 0;

        private string nextThemeText;
        [DontSerialize]
        public string NextThemeText
        {
            get => nextThemeText;
            private set
            {
                nextThemeText = value;
                OnPropertyChanged();
            }
        }

        // Resolved on demand: the extension's localization may not be loaded yet when settings are constructed.
        private string Key => Mode == ApplicationMode.Fullscreen ? "Fullscreen" : "Desktop";

        [DontSerialize]
        public string EnableText => RandomThemeLoc.Get("LOCRandomTheme_Enable_" + Key, $"Pick a random {RandomThemeLoc.ModeName(Mode)} theme on every startup");
        [DontSerialize]
        public string AvoidRepeatText => RandomThemeLoc.Get("LOCRandomTheme_AvoidRepeat", "Do not pick the theme that is already set");
        [DontSerialize]
        public string ThemesLabel => RandomThemeLoc.Get("LOCRandomTheme_ThemesLabel_" + Key, $"{RandomThemeLoc.ModeName(Mode)} themes to choose from");
        [DontSerialize]
        public string RandomizeNowText => RandomThemeLoc.Get("LOCRandomTheme_RandomizeNow", "Randomize now");
        [DontSerialize]
        public string RandomizeNowMenuText => RandomThemeLoc.Get("LOCRandomTheme_RandomizeNow_" + Key, $"Randomize {RandomThemeLoc.ModeName(Mode)} theme now");
        [DontSerialize]
        public string SelectAllText => RandomThemeLoc.Get("LOCRandomTheme_SelectAll", "Select all");
        [DontSerialize]
        public string SelectNoneText => RandomThemeLoc.Get("LOCRandomTheme_SelectNone", "Select none");
        [DontSerialize]
        public string NoThemesText => RandomThemeLoc.Get("LOCRandomTheme_NoThemes", "No compatible themes are installed.");

        [DontSerialize]
        public RelayCommand SelectAllCommand { get; private set; }
        [DontSerialize]
        public RelayCommand SelectNoneCommand { get; private set; }
        [DontSerialize]
        public RelayCommand RandomizeNowCommand { get; private set; }

        // ─── Wiring ───────────────────────────────────────────────────────────

        internal void Attach(ApplicationMode mode, Func<ApplicationMode, List<ThemeInfo>> listInstalled, Action<ThemeCategorySettings> randomizeNow)
        {
            Mode = mode;
            this.listInstalled = listInstalled;
            this.randomizeNow = randomizeNow;
            ExcludedThemeIds = ExcludedThemeIds ?? new List<string>();

            SelectAllCommand = new RelayCommand(() => SetAll(true));
            SelectNoneCommand = new RelayCommand(() => SetAll(false));
            RandomizeNowCommand = new RelayCommand(() => this.randomizeNow?.Invoke(this));
        }

        /// <summary>Re-reads the installed themes (so newly installed ones show up) and the queued theme.</summary>
        internal void Refresh()
        {
            installed = listInstalled?.Invoke(Mode) ?? new List<ThemeInfo>();
            var excluded = new HashSet<string>(ExcludedThemeIds, StringComparer.OrdinalIgnoreCase);

            Themes.Clear();
            foreach (var theme in installed)
            {
                Themes.Add(new ThemeChoice(this, theme.Id, theme.Name, !excluded.Contains(theme.Id)));
            }

            OnPropertyChanged(nameof(HasNoThemes));
            RefreshNextTheme();
        }

        /// <summary>Updates the "theme for the next launch" line from Playnite's current setting.</summary>
        internal void RefreshNextTheme()
        {
            var id = PlayniteHost.GetTheme(Mode);
            var name = installed.FirstOrDefault(t => string.Equals(t.Id, id, StringComparison.OrdinalIgnoreCase))?.Name ?? id ?? "-";
            NextThemeText = RandomThemeLoc.Format("LOCRandomTheme_NextTheme", "Theme for the next launch: {0}", name);
        }

        // ─── Eligibility ──────────────────────────────────────────────────────

        internal void SetIncluded(string themeId, bool included)
        {
            var excluded = new HashSet<string>(ExcludedThemeIds, StringComparer.OrdinalIgnoreCase);
            if (included)
            {
                excluded.Remove(themeId);
            }
            else
            {
                excluded.Add(themeId);
            }

            ExcludedThemeIds = excluded.ToList();
        }

        private void SetAll(bool included)
        {
            foreach (var choice in Themes)
            {
                choice.IsIncluded = included;
            }
        }

        /// <summary>True when the mode is on, themes are installed, and every one of them is unchecked.</summary>
        internal bool HasNothingToPick => Enabled && Themes.Count > 0 && Themes.All(t => !t.IsIncluded);

        // ─── Edit snapshot ────────────────────────────────────────────────────

        internal Snapshot Capture() => new Snapshot(Enabled, AvoidRepeat, ExcludedThemeIds);

        internal void Restore(Snapshot snapshot)
        {
            Enabled = snapshot.Enabled;
            AvoidRepeat = snapshot.AvoidRepeat;
            ExcludedThemeIds = new List<string>(snapshot.ExcludedThemeIds);
        }

        internal sealed class Snapshot
        {
            public bool Enabled { get; }
            public bool AvoidRepeat { get; }
            public List<string> ExcludedThemeIds { get; }

            public Snapshot(bool enabled, bool avoidRepeat, IEnumerable<string> excluded)
            {
                Enabled = enabled;
                AvoidRepeat = avoidRepeat;
                ExcludedThemeIds = new List<string>(excluded ?? Enumerable.Empty<string>());
            }
        }
    }
}
