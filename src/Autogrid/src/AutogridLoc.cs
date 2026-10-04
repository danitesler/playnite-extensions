using System;
using Playnite.SDK;

namespace Autogrid
{
    /// <summary>Playnite loc strings (<c>LOCAutogrid_*</c>) with English fallbacks — never shows raw keys.</summary>
    internal static class AutogridLoc
    {
        public static string Get(string key, string fallback)
        {
            if (string.IsNullOrEmpty(key))
            {
                return fallback ?? string.Empty;
            }

            try
            {
                var value = ResourceProvider.GetString(key);
                if (string.IsNullOrEmpty(value)
                    || string.Equals(value, key, StringComparison.Ordinal)
                    || value.StartsWith("<!", StringComparison.Ordinal))
                {
                    return fallback ?? string.Empty;
                }

                return value;
            }
            catch
            {
                return fallback ?? string.Empty;
            }
        }
    }
}
