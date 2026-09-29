using System;
using System.Globalization;
using Playnite.SDK;

namespace RandomTheme
{
    /// <summary>Playnite loc strings (<c>LOCRandomTheme_*</c>) with English fallbacks: never shows raw keys.</summary>
    internal static class RandomThemeLoc
    {
        public static string Get(string key, string fallback)
        {
            try
            {
                var value = ResourceProvider.GetString(key);
                if (!string.IsNullOrEmpty(value) && !string.Equals(value, key, StringComparison.Ordinal))
                {
                    return value;
                }
            }
            catch
            {
                // Fall through to the English text.
            }

            return fallback;
        }

        public static string Format(string key, string fallbackFormat, params object[] args)
        {
            try
            {
                return string.Format(CultureInfo.CurrentCulture, Get(key, fallbackFormat), args);
            }
            catch (FormatException)
            {
                return string.Format(CultureInfo.CurrentCulture, fallbackFormat, args);
            }
        }

        /// <summary>"Desktop" / "Fullscreen" in the user's language.</summary>
        public static string ModeName(ApplicationMode mode) => mode == ApplicationMode.Fullscreen
            ? Get("LOCRandomTheme_Fullscreen", "Fullscreen")
            : Get("LOCRandomTheme_Desktop", "Desktop");
    }
}
