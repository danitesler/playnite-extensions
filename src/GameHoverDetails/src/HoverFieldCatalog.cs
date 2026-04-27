using System.Collections.Generic;
using System.Linq;

namespace GameHoverDetails
{
    internal sealed class HoverFieldDefinition
    {
        public HoverFieldDefinition(string key, string displayName)
        {
            Key = key;
            DisplayName = displayName;
        }

        public string Key { get; }
        public string DisplayName { get; }
    }

    internal static class HoverFieldCatalog
    {
        /// <summary>Stable order matching Playnite details-panel columns (left to right).</summary>
        public static readonly IReadOnlyList<HoverFieldDefinition> All = new List<HoverFieldDefinition>
        {
            new HoverFieldDefinition("Icon", "Icon"),
            new HoverFieldDefinition("TimePlayed", "Time Played"),
            new HoverFieldDefinition("RecentActivity", "Recent Activity"),
            new HoverFieldDefinition("Library", "Library"),
            new HoverFieldDefinition("Publisher", "Publisher"),
            new HoverFieldDefinition("Features", "Features"),
            new HoverFieldDefinition("Series", "Series"),
            new HoverFieldDefinition("Version", "Version"),
            new HoverFieldDefinition("UserScore", "User Score"),
            new HoverFieldDefinition("Notes", "Notes"),
            new HoverFieldDefinition("InstallationFolder", "Installation Folder"),
            new HoverFieldDefinition("CoverImage", "Cover Image"),
            new HoverFieldDefinition("LastPlayed", "Last Played"),
            new HoverFieldDefinition("CompletionStatus", "Completion Status"),
            new HoverFieldDefinition("Genre", "Genre"),
            new HoverFieldDefinition("ReleaseDate", "Release Date"),
            new HoverFieldDefinition("Tags", "Tags"),
            new HoverFieldDefinition("Region", "Region"),
            new HoverFieldDefinition("CommunityScore", "Community Score"),
            new HoverFieldDefinition("Links", "Links"),
            new HoverFieldDefinition("Name", "Name"),
            new HoverFieldDefinition("BackgroundImage", "Background Image"),
            new HoverFieldDefinition("DateAdded", "Date Added"),
            new HoverFieldDefinition("Platform", "Platform"),
            new HoverFieldDefinition("Developer", "Developer"),
            new HoverFieldDefinition("Category", "Category"),
            new HoverFieldDefinition("AgeRating", "Age Rating"),
            new HoverFieldDefinition("Source", "Source"),
            new HoverFieldDefinition("CriticScore", "Critic Score"),
            new HoverFieldDefinition("Description", "Description"),
            new HoverFieldDefinition("InstallSize", "Install Size")
        };

        private static readonly HashSet<string> ValidKeys = new HashSet<string>();
        private static readonly Dictionary<string, int> KeyOrder = new Dictionary<string, int>();

        static HoverFieldCatalog()
        {
            for (var i = 0; i < All.Count; i++)
            {
                var k = All[i].Key;
                ValidKeys.Add(k);
                KeyOrder[k] = i;
            }
        }

        public static bool IsKnownKey(string key)
        {
            return !string.IsNullOrEmpty(key) && ValidKeys.Contains(key);
        }

        /// <summary>Cover / background / small tile art — no inline MDL2 glyph beside content.</summary>
        public static bool IsGameArtImageField(string key)
        {
            return key == "Icon" || key == "CoverImage" || key == "BackgroundImage";
        }

        public static string GetDisplayName(string key)
        {
            var d = All.FirstOrDefault(x => x.Key == key);
            return d?.DisplayName ?? key ?? string.Empty;
        }

        /// <summary>Single character from Segoe MDL2 Assets for settings list / Add field menu.</summary>
        public static string GetSettingsGlyph(string key)
        {
            if (string.IsNullOrEmpty(key))
            {
                return "\uE897";
            }

            switch (key)
            {
                case "Icon": return "\uE8B9";
                case "CoverImage": return "\uE91B";
                case "BackgroundImage": return "\uEF1F";
                case "Name": return "\uE77B";
                case "Description": return "\uE736";
                case "Platform": return "\uE7FC";
                case "Genre": return "\uE90B";
                case "Developer": return "\uE716";
                case "Publisher": return "\uE719";
                case "Category": return "\uE8FD";
                case "Tags": return "\uE8EC";
                case "Features": return "\uE713";
                case "Series": return "\uE786";
                case "Region": return "\uE909";
                case "AgeRating": return "\uEA18";
                case "Version": return "\uE895";
                case "Notes": return "\uE70B";
                case "InstallationFolder": return "\uE8B7";
                case "InstallSize": return "\uEDA2";
                case "ReleaseDate": return "\uE8BF";
                case "DateAdded": return "\uE710";
                case "TimePlayed": return "\uE916";
                case "RecentActivity": return "\uE81C";
                case "LastPlayed": return "\uE787";
                case "CompletionStatus": return "\uE73E";
                case "UserScore": return "\uE734";
                case "CriticScore": return "\uE9D2";
                case "CommunityScore": return "\uE728";
                case "Source": return "\uE8A5";
                case "Library": return "\uE8F1";
                case "Links": return "\uE71B";
                default: return "\uE897";
            }
        }

        public static int CompareKeys(string a, string b)
        {
            var ia = GetOrder(a);
            var ib = GetOrder(b);
            return ia.CompareTo(ib);
        }

        public static int GetOrder(string key)
        {
            return KeyOrder.TryGetValue(key, out var o) ? o : int.MaxValue;
        }

        public static List<string> GetAllKeysInCatalogOrder()
        {
            return All.Select(d => d.Key).ToList();
        }
    }
}
