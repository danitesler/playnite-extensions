using System.Collections.Generic;
using Playnite.SDK;
using Playnite.SDK.Data;

namespace RandomTheme
{
    /// <summary>
    /// Plugin settings. Playnite sets this object as the <c>DataContext</c> of the settings view, so
    /// everything the view binds to hangs off it.
    /// </summary>
    public class RandomThemeSettings : ObservableObject, ISettings
    {
        [DontSerialize]
        private readonly RandomThemePlugin plugin;

        [DontSerialize]
        private ThemeCategorySettings.Snapshot desktopBackup;

        [DontSerialize]
        private ThemeCategorySettings.Snapshot fullscreenBackup;

        public ThemeCategorySettings Desktop { get; set; } = new ThemeCategorySettings();

        public ThemeCategorySettings Fullscreen { get; set; } = new ThemeCategorySettings();

        /// <summary>Required for deserialization.</summary>
        public RandomThemeSettings()
        {
        }

        public RandomThemeSettings(RandomThemePlugin plugin)
        {
            this.plugin = plugin;

            var saved = plugin.LoadPluginSettings<RandomThemeSettings>();
            if (saved != null)
            {
                Desktop = saved.Desktop ?? Desktop;
                Fullscreen = saved.Fullscreen ?? Fullscreen;
            }

            // "Do not pick the theme that is already set" is enabled by default in the background
            Desktop.AvoidRepeat = true;
            Fullscreen.AvoidRepeat = true;

            Desktop.Attach(ApplicationMode.Desktop, plugin.GetInstalledThemes, plugin.RandomizeNow);
            Fullscreen.Attach(ApplicationMode.Fullscreen, plugin.GetInstalledThemes, plugin.RandomizeNow);
        }

        public ThemeCategorySettings For(ApplicationMode mode) =>
            mode == ApplicationMode.Fullscreen ? Fullscreen : Desktop;

        // ─── ISettings ────────────────────────────────────────────────────────

        public void BeginEdit()
        {
            desktopBackup = Desktop.Capture();
            fullscreenBackup = Fullscreen.Capture();

            // The settings dialog is the moment to re-scan, so a theme installed since startup shows up.
            Desktop.Refresh();
            Fullscreen.Refresh();
        }

        public void CancelEdit()
        {
            if (desktopBackup != null)
            {
                Desktop.Restore(desktopBackup);
            }

            if (fullscreenBackup != null)
            {
                Fullscreen.Restore(fullscreenBackup);
            }
        }

        public void EndEdit()
        {
            Persist();
        }

        public bool VerifySettings(out List<string> errors)
        {
            errors = new List<string>();
            foreach (var category in new[] { Desktop, Fullscreen })
            {
                if (category.HasNothingToPick)
                {
                    var name = RandomThemeLoc.ModeName(category.Mode);
                    errors.Add(RandomThemeLoc.Format(
                        "LOCRandomTheme_Error_Verify",
                        "Select at least one {0} theme, or turn off {0} randomization.",
                        name));
                }
            }

            return errors.Count == 0;
        }

        internal void Persist()
        {
            plugin?.SavePluginSettings(this);
        }
    }
}
