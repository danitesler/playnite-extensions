using System.Net;
using System.Text.RegularExpressions;

namespace GameHoverDetails
{
    /// <summary>Static placeholder lines for the settings preview (not live game data).</summary>
    internal static class HoverPreviewSampleText
    {
        public static string ForKey(string key)
        {
            if (string.IsNullOrEmpty(key))
            {
                return "—";
            }

            switch (key)
            {
                case "Name":
                    return "Sample Game";
                case "Description":
                    return "Example description text for the hover preview.";
                case "Platform":
                    return "Windows";
                case "Genre":
                    return "Action, RPG";
                case "Developer":
                    return "Example Studio";
                case "Publisher":
                    return "Blizzard Entertainment";
                case "Category":
                    return "Installed";
                case "Tags":
                    return "Single-player, Steam";
                case "Features":
                    return "Achievements, Cloud saves";
                case "Series":
                    return "Sample Series";
                case "Region":
                    return "Worldwide";
                case "AgeRating":
                    return "Teen";
                case "Version":
                    return "1.0.0";
                case "Notes":
                    return "Your notes appear here.";
                case "InstallationFolder":
                    return @"C:\Games\Sample";
                case "InstallSize":
                    return "42.5 GB";
                case "ReleaseDate":
                    return "April 15, 2020";
                case "DateAdded":
                    return "January 1, 2025";
                case "TimePlayed":
                    return "12h 30m";
                case "RecentActivity":
                    return "April 10, 2026";
                case "LastPlayed":
                    return "April 15, 2026";
                case "CompletionStatus":
                    return "Playing";
                case "UserScore":
                    return "85";
                case "CriticScore":
                    return "82";
                case "CommunityScore":
                    return "8.1";
                case "Source":
                    return "Steam";
                case "Library":
                    return "Steam library";
                case "Links":
                    return "Store page";
                case "Icon":
                    return "(game icon)";
                case "CoverImage":
                    return "(cover image)";
                case "BackgroundImage":
                    return "(background image)";
                default:
                    return "—";
            }
        }

        /// <summary>Plain one-block preview string from formatted hover text (strips HTML for description).</summary>
        public static string FormatValueForPreview(string key, string formatted)
        {
            if (string.IsNullOrWhiteSpace(formatted))
            {
                return "—";
            }

            if (formatted == "—")
            {
                return "—";
            }

            if (key == "Description")
            {
                var plain = WebUtility.HtmlDecode(Regex.Replace(formatted, "<[^>]+>", " "));
                plain = Regex.Replace(plain, @"\s+", " ").Trim();
                return string.IsNullOrEmpty(plain) ? "—" : plain;
            }

            return formatted;
        }

        /// <summary>True when the hover formatter would show no real value (preview should use <see cref="ForKey"/> instead).</summary>
        public static bool LooksLikeMissingData(string formattedPreview)
        {
            if (string.IsNullOrWhiteSpace(formattedPreview))
            {
                return true;
            }

            var t = formattedPreview.Trim();
            if (t.Length == 0)
            {
                return true;
            }

            if (t.Length == 1 && (t[0] == '\u2014' || t[0] == '\u2013'))
            {
                return true;
            }

            foreach (var c in t)
            {
                if (c != '-' && c != '\u2014' && c != '\u2013' && c != '\u2212' && !char.IsWhiteSpace(c))
                {
                    return false;
                }
            }

            return t.Length > 0;
        }
    }
}
