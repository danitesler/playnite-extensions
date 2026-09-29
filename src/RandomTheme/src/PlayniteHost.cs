using System;
using System.Reflection;
using Playnite.SDK;

namespace RandomTheme
{
    /// <summary>
    /// Reflection access to the parts of Playnite the public SDK keeps read-only or hidden.
    ///
    /// The SDK exposes the active themes only as getters (<c>IPlayniteSettingsAPI.DesktopTheme</c> /
    /// <c>FullscreenTheme</c>). Playnite keeps the real settings on <c>PlayniteApplication.Current.AppSettings</c>
    /// and rewrites <c>config.json</c> / <c>fullscreenConfig.json</c> from that in-memory object on every
    /// exit, so editing the files directly is always reverted. Changing the in-memory object and calling
    /// <c>SaveSettings()</c> is the only change that sticks.
    ///
    /// Note that <c>System.Windows.Application.Current</c> is NOT <c>PlayniteApplication</c>; it has no
    /// <c>AppSettings</c> property.
    /// </summary>
    internal static class PlayniteHost
    {
        private static readonly ILogger Logger = LogManager.GetLogger();

        private static Type applicationType;

        // ─── Type discovery ───────────────────────────────────────────────────

        internal static Type FindPlayniteType(string fullName)
        {
            foreach (var asm in AppDomain.CurrentDomain.GetAssemblies())
            {
                if (asm.IsDynamic || asm.GetName().Name != "Playnite")
                {
                    continue;
                }

                var type = asm.GetType(fullName, false);
                if (type != null)
                {
                    return type;
                }
            }

            return null;
        }

        private static object GetApplication()
        {
            applicationType = applicationType ?? FindPlayniteType("Playnite.PlayniteApplication");
            var current = applicationType?.GetProperty("Current", BindingFlags.Public | BindingFlags.Static);
            return current?.GetValue(null, null);
        }

        private static object GetAppSettings()
        {
            var app = GetApplication();
            return app?.GetType().GetProperty("AppSettings", BindingFlags.Public | BindingFlags.Instance)?.GetValue(app, null);
        }

        /// <summary>The object holding the theme id for the mode: PlayniteSettings (Desktop) or its Fullscreen settings.</summary>
        private static object GetThemeOwner(object appSettings, ApplicationMode mode)
        {
            if (appSettings == null)
            {
                return null;
            }

            return mode == ApplicationMode.Fullscreen
                ? appSettings.GetType().GetProperty("Fullscreen", BindingFlags.Public | BindingFlags.Instance)?.GetValue(appSettings, null)
                : appSettings;
        }

        // ─── Active theme ─────────────────────────────────────────────────────

        /// <summary>The theme id Playnite has configured for the mode (the running theme for the current mode).</summary>
        public static string GetTheme(ApplicationMode mode)
        {
            try
            {
                var owner = GetThemeOwner(GetAppSettings(), mode);
                return owner?.GetType().GetProperty("Theme", BindingFlags.Public | BindingFlags.Instance)?.GetValue(owner, null) as string;
            }
            catch (Exception ex)
            {
                Logger.Warn(ex, $"RandomTheme: Could not read the {mode} theme from Playnite's settings.");
                return null;
            }
        }

        /// <summary>Sets the theme Playnite will load the next time it starts in the mode. Does not save.</summary>
        public static bool SetTheme(ApplicationMode mode, string themeId)
        {
            try
            {
                var owner = GetThemeOwner(GetAppSettings(), mode);
                var prop = owner?.GetType().GetProperty("Theme", BindingFlags.Public | BindingFlags.Instance);
                if (prop == null || !prop.CanWrite)
                {
                    Logger.Error($"RandomTheme: Playnite's {mode} theme setting was not found (PlayniteApplication.Current.AppSettings is unavailable).");
                    return false;
                }

                prop.SetValue(owner, themeId, null);
                return true;
            }
            catch (Exception ex)
            {
                Logger.Error(ex, $"RandomTheme: Failed to set the {mode} theme.");
                return false;
            }
        }

        /// <summary>Writes Playnite's settings (config.json and fullscreenConfig.json) immediately.</summary>
        public static bool SaveSettings()
        {
            try
            {
                var settings = GetAppSettings();
                var save = settings?.GetType().GetMethod("SaveSettings", BindingFlags.Public | BindingFlags.Instance, null, Type.EmptyTypes, null);
                if (save == null)
                {
                    return false;
                }

                save.Invoke(settings, null);
                return true;
            }
            catch (Exception ex)
            {
                Logger.Error(ex, "RandomTheme: Failed to save Playnite's settings.");
                return false;
            }
        }

        // ─── Restart ──────────────────────────────────────────────────────────

        /// <summary>Restarts Playnite in the mode it is running in, saving settings first.</summary>
        public static bool Restart()
        {
            try
            {
                var app = GetApplication();
                var restart = app?.GetType().GetMethod("Restart", BindingFlags.Public | BindingFlags.Instance, null, new[] { typeof(bool) }, null);
                if (restart == null)
                {
                    return false;
                }

                restart.Invoke(app, new object[] { true });
                return true;
            }
            catch (Exception ex)
            {
                Logger.Error(ex, "RandomTheme: Failed to restart Playnite.");
                return false;
            }
        }
    }
}
