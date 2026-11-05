using System;
using System.Collections.Generic;
using System.Linq;

namespace GameHoverDetails
{
    internal static class HoverFieldResolver
    {
        internal static bool IsEmpty(string value) => string.IsNullOrWhiteSpace(value) || value == HoverLoc.Empty;

        private static readonly string[] PrimaryKeys =
        {
            "CriticScore", "CommunityScore", "UserScore", "LastPlayed", "RecentActivity", "Developer", "Source"
        };

        private static IReadOnlyList<string> Fallbacks(string key)
        {
            switch (key)
            {
                case "CriticScore": return new[] { "CommunityScore", "UserScore" };
                case "CommunityScore": return new[] { "CriticScore", "UserScore" };
                case "UserScore": return new[] { "CommunityScore", "CriticScore" };
                case "LastPlayed":
                case "RecentActivity": return new[] { "DateAdded" };
                case "Developer": return new[] { "Publisher" };
                case "Source": return new[] { "Library" };
                default: return new string[0];
            }
        }

        internal static string TooltipText()
        {
            var mappings = string.Join("\n", PrimaryKeys.Select(key => string.Join(" → ",
                new[] { key }.Concat(Fallbacks(key)).Select(HoverFieldCatalog.GetDisplayName))));
            var unplayed = HoverFieldCatalog.GetDisplayName("TimePlayed") + " → "
                + HoverLoc.Get("LOCGameHoverDetails_Value_NotPlayed", "Not played yet");
            return HoverLoc.Format("LOCGameHoverDetails_Settings_FallbackFieldsHint",
                "Missing values use the first available replacement:\n{0}\n\nFor games with no recorded playtime or last-played date:\n{1}\n\nReplacements keep their own labels and are not repeated. If no replacement is available, the field stays unchanged.",
                mappings, unplayed);
        }

        internal static IReadOnlyList<string> Resolve(GameHoverDetailsSettings settings, IReadOnlyList<string> keys,
            ref HoverFieldListSource source)
        {
            if (source.IgnoreEmptyFieldBehavior) return keys;
            if (!settings.UseFallbackFields)
            {
                // Hide uses real availability, before the preview fills gaps with sample text.
                if (settings.HideEmptyFields && source.FormatRawValue != null)
                {
                    source = WithFormatter(source, source.FormatRawValue);
                }
                return keys;
            }

            var original = source;
            var rawValues = new Dictionary<string, string>();
            string Raw(string key)
            {
                if (!rawValues.TryGetValue(key, out var value))
                {
                    value = (original.FormatRawValue ?? original.FormatValue)?.Invoke(key);
                    rawValues[key] = value;
                }
                return value;
            }
            bool Available(string key) => key == "TimePlayed" && original.IsUnplayed ? false : !IsEmpty(Raw(key));

            // Populated primary fields win even when they occur after a fallback slot.
            var reserved = new HashSet<string>(keys.Where(Available));
            var used = new HashSet<string>();
            var values = new Dictionary<string, string>();
            var resolved = new List<string>();
            foreach (var key in keys)
            {
                if ((key != "TimePlayed" && Fallbacks(key).Count == 0) ||
                    (key == "TimePlayed" && !original.IsUnplayed) || Available(key))
                {
                    resolved.Add(key);
                    used.Add(key);
                    continue;
                }

                if (key == "TimePlayed" && original.IsUnplayed)
                {
                    values[key] = HoverLoc.Get("LOCGameHoverDetails_Value_NotPlayed", "Not played yet");
                }
                else
                {
                    var replacement = Fallbacks(key).FirstOrDefault(candidate =>
                        !reserved.Contains(candidate) && !used.Contains(candidate) && Available(candidate));
                    if (replacement != null)
                    {
                        resolved.Add(replacement);
                        used.Add(replacement);
                        values[replacement] = Raw(replacement);
                        continue;
                    }
                    // No replacement: the existing global hide-empty setting decides what remains.
                    values[key] = Raw(key);
                }
                resolved.Add(key);
                used.Add(key);
            }

            source = WithFormatter(original, key => values.TryGetValue(key, out var value) ? value : original.FormatValue?.Invoke(key));
            return resolved;
        }

        private static HoverFieldListSource WithFormatter(HoverFieldListSource source, Func<string, string> formatter)
        {
            return new HoverFieldListSource
            {
                OmitEmptyArt = source.OmitEmptyArt,
                IsUnplayed = source.IsUnplayed,
                IgnoreEmptyFieldBehavior = source.IgnoreEmptyFieldBehavior,
                TryGetGameArt = source.TryGetGameArt,
                TryGetPlatformIcons = source.TryGetPlatformIcons,
                FormatRawValue = source.FormatRawValue,
                FormatValue = formatter
            };
        }
    }
}
