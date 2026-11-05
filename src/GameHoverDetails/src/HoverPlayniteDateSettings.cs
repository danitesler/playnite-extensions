using System;
using System.Globalization;
using System.IO;
using System.Text.RegularExpressions;
using Playnite.SDK;

namespace GameHoverDetails
{
    /// <summary>One of Playnite's per-field date format settings (Settings → Appearance → Date and time formats).</summary>
    internal sealed class HoverDateFormatSetting
    {
        public static readonly HoverDateFormatSetting Default = new HoverDateFormatSetting("d", "y", false);

        public HoverDateFormatSetting(string format, string partialFormat, bool pastWeekRelative)
        {
            Format = string.IsNullOrWhiteSpace(format) ? "d" : format;
            PartialFormat = string.IsNullOrWhiteSpace(partialFormat) ? "y" : partialFormat;
            PastWeekRelative = pastWeekRelative;
        }

        /// <summary>.NET date format string used for a full date.</summary>
        public string Format { get; }

        /// <summary>.NET format used when only year + month are known (Release Date).</summary>
        public string PartialFormat { get; }

        /// <summary>Playnite's "relative format for the past week" option.</summary>
        public bool PastWeekRelative { get; }

        public string FormatDate(DateTime date, CultureInfo culture)
        {
            return Apply(date, Format, culture, "d");
        }

        public string FormatPartial(DateTime date, CultureInfo culture)
        {
            return Apply(date, PartialFormat, culture, "y");
        }

        private static string Apply(DateTime date, string format, CultureInfo culture, string fallback)
        {
            try
            {
                return date.ToString(format, culture);
            }
            catch (FormatException)
            {
                return date.ToString(fallback, culture);
            }
        }
    }

    /// <summary>
    /// Reads Playnite's date format settings. The SDK does not expose them, so they come from
    /// <c>config.json</c> (<c>DateTimeFormatAdded</c>, <c>DateTimeFormatRecentActivity</c>, ...). Falls back to
    /// Playnite's defaults when the file or a block is missing.
    /// </summary>
    internal static class HoverPlayniteDateSettings
    {
        private static readonly object Gate = new object();
        private static string cachedPath;
        private static DateTime cachedWriteUtc;
        private static string cachedText;

        public static HoverDateFormatSetting Get(IPlayniteAPI api, string blockName)
        {
            try
            {
                var text = ReadConfig(api);
                return text == null ? HoverDateFormatSetting.Default : Parse(text, blockName);
            }
            catch
            {
                return HoverDateFormatSetting.Default;
            }
        }

        /// <summary>A top-level true/false setting from Playnite's config.json (false when missing).</summary>
        public static bool GetBool(IPlayniteAPI api, string name)
        {
            try
            {
                var text = ReadConfig(api);
                return text != null && ParseBool(text, name);
            }
            catch
            {
                return false;
            }
        }

        internal static bool ParseBool(string configJson, string name)
        {
            if (string.IsNullOrEmpty(configJson) || string.IsNullOrEmpty(name))
            {
                return false;
            }

            var m = Regex.Match(
                configJson,
                "\"" + Regex.Escape(name) + "\"\\s*:\\s*(?<v>true|false)",
                RegexOptions.CultureInvariant | RegexOptions.IgnoreCase);
            return m.Success && string.Equals(m.Groups["v"].Value, "true", StringComparison.OrdinalIgnoreCase);
        }

        internal static HoverDateFormatSetting Parse(string configJson, string blockName)
        {
            if (string.IsNullOrEmpty(configJson) || string.IsNullOrEmpty(blockName))
            {
                return HoverDateFormatSetting.Default;
            }

            var block = Regex.Match(
                configJson,
                "\"" + Regex.Escape(blockName) + "\"\\s*:\\s*\\{(?<body>[^{}]*)\\}",
                RegexOptions.CultureInvariant);
            if (!block.Success)
            {
                return HoverDateFormatSetting.Default;
            }

            var body = block.Groups["body"].Value;
            return new HoverDateFormatSetting(
                ReadString(body, "Format"),
                ReadString(body, "PartialFormat"),
                string.Equals(ReadRaw(body, "PastWeekRelativeFormat"), "true", StringComparison.OrdinalIgnoreCase));
        }

        private static string ReadString(string body, string name)
        {
            var m = Regex.Match(
                body,
                "\"" + name + "\"\\s*:\\s*\"(?<v>(?:[^\"\\\\]|\\\\.)*)\"",
                RegexOptions.CultureInvariant);
            return m.Success ? Regex.Unescape(m.Groups["v"].Value) : null;
        }

        private static string ReadRaw(string body, string name)
        {
            var m = Regex.Match(
                body,
                "\"" + name + "\"\\s*:\\s*(?<v>[A-Za-z]+)",
                RegexOptions.CultureInvariant);
            return m.Success ? m.Groups["v"].Value : null;
        }

        private static string ReadConfig(IPlayniteAPI api)
        {
            var dir = api?.Paths?.ConfigurationPath;
            if (string.IsNullOrEmpty(dir))
            {
                return null;
            }

            var path = Path.Combine(dir, "config.json");
            if (!File.Exists(path))
            {
                return null;
            }

            var writeUtc = File.GetLastWriteTimeUtc(path);
            lock (Gate)
            {
                if (cachedText == null || cachedPath != path || cachedWriteUtc != writeUtc)
                {
                    using (var fs = new FileStream(path, FileMode.Open, FileAccess.Read, FileShare.ReadWrite | FileShare.Delete))
                    using (var reader = new StreamReader(fs))
                    {
                        cachedText = reader.ReadToEnd();
                    }

                    cachedPath = path;
                    cachedWriteUtc = writeUtc;
                }

                return cachedText;
            }
        }
    }
}
