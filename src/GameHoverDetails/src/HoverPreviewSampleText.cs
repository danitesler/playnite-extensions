namespace GameHoverDetails
{
    /// <summary>Static placeholder lines for the settings preview (not live game data).</summary>
    internal static class HoverPreviewSampleText
    {
        public static string ForKey(string key)
        {
            if (string.IsNullOrEmpty(key))
            {
                return HoverLoc.Empty;
            }

            string fallback;
            switch (key)
            {
                case "Name":
                    fallback = "Sample Game";
                    break;
                case "Description":
                    fallback = "Example description text for the hover preview.";
                    break;
                case "Platform":
                    fallback = "Windows";
                    break;
                case "Genre":
                    fallback = "Action, RPG";
                    break;
                case "Developer":
                    fallback = "Example Studio";
                    break;
                case "Publisher":
                    fallback = "Blizzard Entertainment";
                    break;
                case "Category":
                    fallback = "Installed";
                    break;
                case "Tags":
                    fallback = "Single-player, Steam";
                    break;
                case "Features":
                    fallback = "Achievements, Cloud saves";
                    break;
                case "Series":
                    fallback = "Sample Series";
                    break;
                case "Region":
                    fallback = "Worldwide";
                    break;
                case "AgeRating":
                    fallback = "Teen";
                    break;
                case "Version":
                    fallback = "1.0.0";
                    break;
                case "Notes":
                    fallback = "Your notes appear here.";
                    break;
                case "InstallationFolder":
                    fallback = @"C:\Games\Sample";
                    break;
                case "InstallSize":
                    fallback = "42.5 GB";
                    break;
                case "ReleaseDate":
                    fallback = new System.DateTime(2020, 4, 15).ToString("d", System.Globalization.CultureInfo.CurrentCulture);
                    break;
                case "DateAdded":
                    fallback = new System.DateTime(2025, 1, 1).ToString("d", System.Globalization.CultureInfo.CurrentCulture);
                    break;
                case "TimePlayed":
                    fallback = HoverFieldFormatter.FormatPlaytimeText(45000UL, false);
                    break;
                case "RecentActivity":
                    fallback = new System.DateTime(2026, 4, 10).ToString("d", System.Globalization.CultureInfo.CurrentCulture);
                    break;
                case "LastPlayed":
                    fallback = HoverLoc.Get("LOCYesterday", "Yesterday");
                    break;
                case "CompletionStatus":
                    fallback = "Playing";
                    break;
                case "UserScore":
                    fallback = "85";
                    break;
                case "CriticScore":
                    fallback = "82";
                    break;
                case "CommunityScore":
                    fallback = "8.1";
                    break;
                case "Source":
                    fallback = "Steam";
                    break;
                case "Library":
                    fallback = "Steam library";
                    break;
                case "Links":
                    fallback = "Store page";
                    break;
                case "Icon":
                    fallback = "(game icon)";
                    break;
                case "CoverImage":
                    fallback = "(cover image)";
                    break;
                case "BackgroundImage":
                    fallback = "(background image)";
                    break;
                default:
                    return HoverLoc.Empty;
            }

            return HoverLoc.Get("LOCGameHoverDetails_PreviewSample_" + key, fallback);
        }

        /// <summary>Plain one-block preview string from formatted hover text (strips HTML for description).</summary>
        public static string FormatValueForPreview(string key, string formatted)
        {
            if (string.IsNullOrWhiteSpace(formatted))
            {
                return HoverLoc.Empty;
            }

            if (formatted == HoverLoc.Empty || formatted == "—")
            {
                return HoverLoc.Empty;
            }

            if (key == "Description")
            {
                var plain = HoverDetailValuePresenter.HtmlToPlainText(formatted);
                return string.IsNullOrEmpty(plain) ? HoverLoc.Empty : plain;
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
