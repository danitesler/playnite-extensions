using System;
using System.Globalization;
using Playnite.SDK;

namespace AutoStatus
{
    /// <summary>Playnite loc strings (<c>LOCAutoStatus_*</c>) with English fallbacks — never shows raw keys.</summary>
    internal static class AutoStatusLoc
    {
        public static string Get(string key, string fallback)
        {
            return TryGet(key) ?? fallback ?? string.Empty;
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

        /// <summary>Null when the key is missing (Playnite returns the key or a marker instead of throwing).</summary>
        public static string TryGet(string key)
        {
            if (string.IsNullOrEmpty(key))
            {
                return null;
            }

            try
            {
                var value = ResourceProvider.GetString(key);
                if (string.IsNullOrWhiteSpace(value)
                    || string.Equals(value, key, StringComparison.Ordinal)
                    || value.StartsWith("<!", StringComparison.Ordinal))
                {
                    return null;
                }

                return value;
            }
            catch
            {
                return null;
            }
        }
    }
}
