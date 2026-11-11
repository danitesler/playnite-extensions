using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Text;
using Playnite.SDK;
using Playnite.SDK.Models;
using Playnite.SDK.Plugins;

namespace GameHoverDetails
{
    internal static class HoverFieldFormatter
    {
        public static string Format(string key, Game game, IPlayniteAPI api)
        {
            if (game == null || string.IsNullOrEmpty(key))
            {
                return HoverLoc.Empty;
            }

            try
            {
                switch (key)
                {
                    case "Name":
                        return game.Name ?? HoverLoc.Empty;
                    case "Description":
                        return string.IsNullOrWhiteSpace(game.Description) ? HoverLoc.Empty : game.Description;
                    case "Platform":
                        return JoinNames(game.Platforms);
                    case "Genre":
                        return JoinNames(game.Genres);
                    case "Developer":
                        return JoinNames(game.Developers);
                    case "Publisher":
                        return JoinNames(game.Publishers);
                    case "Category":
                        return JoinNames(game.Categories);
                    case "Tags":
                        return JoinNames(game.Tags);
                    case "Features":
                        return JoinNames(game.Features);
                    case "Series":
                        return JoinNames(game.Series);
                    case "Region":
                        return JoinNames(game.Regions);
                    case "AgeRating":
                        return JoinNames(game.AgeRatings);
                    case "Version":
                        return string.IsNullOrWhiteSpace(game.Version) ? HoverLoc.Empty : game.Version;
                    case "Notes":
                        return string.IsNullOrWhiteSpace(game.Notes) ? HoverLoc.Empty : game.Notes;
                    case "InstallationFolder":
                        return string.IsNullOrWhiteSpace(game.InstallDirectory) ? HoverLoc.Empty : game.InstallDirectory;
                    case "InstallSize":
                        return FormatInstallSize(game.InstallSize);
                    case "ReleaseDate":
                        return FormatReleaseDateLong(game.ReleaseDate, api);
                    case "DateAdded":
                        return game.Added == null
                            ? HoverLoc.Empty
                            : FormatPlayniteDate(api, "DateTimeFormatAdded", game.Added.Value.ToLocalTime());
                    case "TimePlayed":
                        return FormatPlaytime(game.Playtime, api);
                    case "RecentActivity":
                        return game.RecentActivity == null
                            ? HoverLoc.Empty
                            : FormatPlayniteDate(api, "DateTimeFormatRecentActivity", game.RecentActivity.Value.ToLocalTime());
                    case "LastPlayed":
                        return FormatLastPlayedDate(game.LastActivity, api);
                    case "CompletionStatus":
                        return game.CompletionStatus?.Name ?? HoverLoc.Empty;
                    case "UserScore":
                        return FormatNullableScore(game.UserScore);
                    case "CriticScore":
                        return FormatNullableScore(game.CriticScore);
                    case "CommunityScore":
                        return FormatNullableScore(game.CommunityScore);
                    case "Source":
                        return game.Source?.Name ?? HoverLoc.Empty;
                    case "Library":
                        return FormatLibrary(game, api);
                    case "Links":
                        return FormatLinks(game);
                    case "Icon":
                    case "CoverImage":
                    case "BackgroundImage":
                        return string.Empty;
                    default:
                        return HoverLoc.Empty;
                }
            }
            catch
            {
                return HoverLoc.Empty;
            }
        }

        private static string FormatLibrary(Game game, IPlayniteAPI api)
        {
            // Playnite's built-in library is not included in the SDK add-on list.
            if (game.PluginId == Guid.Empty)
            {
                return "Playnite";
            }

            try
            {
                var plugins = api?.Addons?.Plugins;
                if (plugins != null)
                {
                    foreach (var plugin in plugins)
                    {
                        if (plugin == null || plugin.Id != game.PluginId)
                        {
                            continue;
                        }

                        if (plugin is LibraryPlugin library)
                        {
                            var name = library.Name;
                            if (!string.IsNullOrWhiteSpace(name))
                            {
                                return name;
                            }
                        }

                        break;
                    }
                }
            }
            catch
            {
                // ignore
            }

            return HoverLoc.Get("LOCGameHoverDetails_Value_UnknownLibrary", "Unknown library");
        }

        /// <summary>
        /// Date in the format chosen in Playnite's settings for that field (<paramref name="settingBlock"/> is the
        /// config.json block, e.g. <c>DateTimeFormatAdded</c>). With "relative format for the past week" on, Playnite's
        /// own strings are used: Today, Yesterday, then the weekday name for the rest of the past week.
        /// </summary>
        private static string FormatPlayniteDate(IPlayniteAPI api, string settingBlock, DateTime localDateTime)
        {
            var setting = HoverPlayniteDateSettings.Get(api, settingBlock);
            if (setting.PastWeekRelative)
            {
                var relative = FormatPastWeekRelative(localDateTime, DateTime.Now);
                if (relative != null)
                {
                    return relative;
                }
            }

            return setting.FormatDate(localDateTime, CultureInfo.CurrentCulture);
        }

        /// <summary>Playnite's past-week wording, or null when the date is older than a week (or in the future).</summary>
        internal static string FormatPastWeekRelative(DateTime localDateTime, DateTime now)
        {
            var days = (now.Date - localDateTime.Date).Days;
            if (days < 0 || days >= 7)
            {
                return null;
            }

            if (days == 0)
            {
                return HoverLoc.Get("LOCToday", "Today");
            }

            if (days == 1)
            {
                return HoverLoc.Get("LOCYesterday", "Yesterday");
            }

            var dow = localDateTime.DayOfWeek.ToString();
            return HoverLoc.Get("LOC" + dow, CultureInfo.CurrentCulture.DateTimeFormat.GetDayName(localDateTime.DayOfWeek));
        }

        private static string FormatReleaseDateLong(ReleaseDate? releaseDate, IPlayniteAPI api)
        {
            if (releaseDate == null)
            {
                return HoverLoc.Empty;
            }

            var rd = releaseDate.Value;
            if (rd.Equals(ReleaseDate.Empty))
            {
                return HoverLoc.Empty;
            }

            var culture = CultureInfo.CurrentCulture;
            try
            {
                var setting = HoverPlayniteDateSettings.Get(api, "DateTimeFormatReleaseDate");
                if (rd.Month != null && rd.Day != null)
                {
                    return setting.FormatDate(new DateTime(rd.Year, rd.Month.Value, rd.Day.Value), culture);
                }

                if (rd.Month != null)
                {
                    return setting.FormatPartial(new DateTime(rd.Year, rd.Month.Value, 1), culture);
                }

                return rd.Year.ToString(culture);
            }
            catch
            {
                return rd.Year.ToString(culture);
            }
        }

        private static string FormatLastPlayedDate(DateTime? lastActivityUtc, IPlayniteAPI api)
        {
            if (lastActivityUtc == null)
            {
                return HoverLoc.Empty;
            }

            return FormatPlayniteDate(api, "DateTimeFormatLastPlayed", lastActivityUtc.Value.ToLocalTime());
        }

        private static string FormatLinks(Game game)
        {
            if (game.Links == null || game.Links.Count == 0)
            {
                return HoverLoc.Empty;
            }

            var sb = new StringBuilder();
            foreach (var link in game.Links)
            {
                if (link == null)
                {
                    continue;
                }

                var name = string.IsNullOrWhiteSpace(link.Name)
                    ? HoverLoc.Get("LOCGameHoverDetails_Value_Link", "Link")
                    : link.Name;
                var url = link.Url ?? "";
                if (sb.Length > 0)
                {
                    sb.AppendLine();
                }

                sb.Append(name).Append(": ").Append(url);
            }

            return sb.Length == 0 ? HoverLoc.Empty : sb.ToString();
        }

        private static string FormatNullableScore(int? score)
        {
            return score == null || score.Value < 0 ? HoverLoc.Empty : score.Value.ToString(CultureInfo.CurrentCulture);
        }

        private static string FormatInstallSize(ulong? bytes)
        {
            if (bytes == null)
            {
                return HoverLoc.Empty;
            }

            var b = (double)bytes.Value;
            var order = 0;
            while (b >= 1024 && order < SizeUnitKeys.Length - 1)
            {
                order++;
                b /= 1024;
            }

            var unit = HoverLoc.Get(SizeUnitKeys[order], SizeUnitFallbacks[order]);
            return string.Format(CultureInfo.CurrentCulture, "{0:0.##} {1}", b, unit);
        }

        private static readonly string[] SizeUnitKeys =
        {
            "LOCGameHoverDetails_Value_UnitByte",
            "LOCGameHoverDetails_Value_UnitKilobyte",
            "LOCGameHoverDetails_Value_UnitMegabyte",
            "LOCGameHoverDetails_Value_UnitGigabyte",
            "LOCGameHoverDetails_Value_UnitTerabyte"
        };

        private static readonly string[] SizeUnitFallbacks = { "B", "KB", "MB", "GB", "TB" };

        private static string FormatPlaytime(ulong playtimeSeconds, IPlayniteAPI api)
        {
            if (playtimeSeconds == 0UL)
            {
                return HoverLoc.Empty;
            }

            return FormatPlaytimeText(playtimeSeconds, HoverPlayniteDateSettings.GetBool(api, "PlaytimeUseDaysFormat"));
        }

        /// <summary>
        /// Playnite's own playtime wording (its localized <c>LOCPlayed*</c> strings): seconds under a minute, minutes under
        /// an hour, then hours + minutes, or days + hours + minutes when "use days format" is on in Playnite's settings.
        /// </summary>
        internal static string FormatPlaytimeText(ulong playtimeSeconds, bool useDays)
        {
            // Like Playnite's converter, use integer arithmetic: SDK values can exceed TimeSpan's range.
            if (playtimeSeconds < 60)
            {
                return HoverLoc.Format("LOCPlayedSeconds", "{0} seconds", playtimeSeconds);
            }

            var minutes = playtimeSeconds / 60;
            if (minutes < 60)
            {
                return HoverLoc.Format("LOCPlayedMinutes", "{0} minutes", minutes);
            }

            var hours = minutes / 60;
            if (useDays && hours >= 24)
            {
                return HoverLoc.Format("LOCPlayedDays", "{0}d {1}h {2}min", hours / 24, hours % 24, minutes % 60);
            }

            return HoverLoc.Format("LOCPlayedHours", "{0}h {1}min", hours, minutes % 60);
        }

        private static string JoinNames(IEnumerable<object> items)
        {
            if (items == null)
            {
                return HoverLoc.Empty;
            }

            var names = new List<string>();
            foreach (var item in items)
            {
                if (item == null)
                {
                    continue;
                }

                var nameProp = item.GetType().GetProperty("Name");
                var n = nameProp?.GetValue(item, null) as string;
                if (!string.IsNullOrWhiteSpace(n))
                {
                    names.Add(n);
                }
            }

            return names.Count == 0 ? HoverLoc.Empty : string.Join(", ", names.Distinct());
        }
    }
}
