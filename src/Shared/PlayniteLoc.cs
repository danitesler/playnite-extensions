using System;
using System.Globalization;
using Playnite.SDK;

namespace PlayniteExtensions
{
    internal static class PlayniteLoc
    {
        public static string Get(string key, string fallback)
        {
            return TryGet(key) ?? fallback ?? string.Empty;
        }

        public static string Format(string key, string fallbackFormat, params object[] args)
        {
            var translation = TryGet(key);
            if (translation != null)
            {
                try
                {
                    return string.Format(CultureInfo.CurrentCulture, translation, args);
                }
                catch (FormatException)
                {
                    // Use the English format if the translation has invalid placeholders.
                }
            }

            var fallback = fallbackFormat ?? string.Empty;
            try
            {
                return string.Format(CultureInfo.CurrentCulture, fallback, args);
            }
            catch (FormatException)
            {
                return fallback;
            }
        }

        public static string TryGet(string key)
        {
            if (string.IsNullOrEmpty(key))
            {
                return null;
            }

            try
            {
                var value = ResourceProvider.GetString(key);
                // Missing keys may be echoed or returned as "<!key!>".
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
