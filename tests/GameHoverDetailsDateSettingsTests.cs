using System;
using System.Globalization;
using GameHoverDetails;
using Xunit;

namespace PlayniteExtensions.Tests
{
    public class GameHoverDetailsDateSettingsTests
    {
        private const string Config = @"{
  ""DateTimeFormatAdded"": {
    ""Format"": ""d"",
    ""PastWeekRelativeFormat"": false
  },
  ""DateTimeFormatReleaseDate"": {
    ""PartialFormat"": ""MMM yyyy"",
    ""Format"": ""dd/MM/yyyy"",
    ""PastWeekRelativeFormat"": false
  },
  ""DateTimeFormatLastPlayed"": {
    ""Format"": ""d MMM, yyyy"",
    ""PastWeekRelativeFormat"": true
  }
}";

        [Fact]
        public void Parse_ReadsFormatPartialAndRelative()
        {
            var release = HoverPlayniteDateSettings.Parse(Config, "DateTimeFormatReleaseDate");
            Assert.Equal("dd/MM/yyyy", release.Format);
            Assert.Equal("MMM yyyy", release.PartialFormat);
            Assert.False(release.PastWeekRelative);

            var last = HoverPlayniteDateSettings.Parse(Config, "DateTimeFormatLastPlayed");
            Assert.Equal("d MMM, yyyy", last.Format);
            Assert.True(last.PastWeekRelative);
        }

        [Fact]
        public void ParseBool_ReadsPlaytimeDaysFlag()
        {
            Assert.True(HoverPlayniteDateSettings.ParseBool("{ \"PlaytimeUseDaysFormat\": true }", "PlaytimeUseDaysFormat"));
            Assert.False(HoverPlayniteDateSettings.ParseBool("{ \"PlaytimeUseDaysFormat\": false }", "PlaytimeUseDaysFormat"));
            Assert.False(HoverPlayniteDateSettings.ParseBool("{ }", "PlaytimeUseDaysFormat"));
        }

        [Fact]
        public void FormatPlaytimeText_FollowsPlayniteUnits()
        {
            Assert.Equal("30 seconds", HoverFieldFormatter.FormatPlaytimeText(30UL, false));
            Assert.Equal("45 minutes", HoverFieldFormatter.FormatPlaytimeText(45UL * 60UL, false));
            Assert.Equal("12h 30min", HoverFieldFormatter.FormatPlaytimeText(45000UL, false));
            Assert.Equal("30h 0min", HoverFieldFormatter.FormatPlaytimeText(30UL * 3600UL, false));
            Assert.Equal("1d 6h 0min", HoverFieldFormatter.FormatPlaytimeText(30UL * 3600UL, true));
        }

        [Fact]
        public void FormatPastWeekRelative_TodayYesterdayWeekdayThenNull()
        {
            var now = new DateTime(2026, 11, 4, 15, 0, 0);
            Assert.Equal("Today", HoverFieldFormatter.FormatPastWeekRelative(now.AddHours(-5), now));
            Assert.Equal("Yesterday", HoverFieldFormatter.FormatPastWeekRelative(now.AddDays(-1), now));
            Assert.Equal("Saturday", HoverFieldFormatter.FormatPastWeekRelative(new DateTime(2026, 10, 31), now));
            Assert.Null(HoverFieldFormatter.FormatPastWeekRelative(now.AddDays(-7), now));
            Assert.Null(HoverFieldFormatter.FormatPastWeekRelative(now.AddDays(1), now));
        }

        [Fact]
        public void Parse_MissingBlock_UsesPlayniteDefaults()
        {
            var s = HoverPlayniteDateSettings.Parse(Config, "DateTimeFormatModified");
            Assert.Equal("d", s.Format);
            Assert.Equal("y", s.PartialFormat);
            Assert.False(s.PastWeekRelative);
        }

        [Fact]
        public void FormatDate_AppliesConfiguredFormat_AndSurvivesBadFormat()
        {
            var culture = CultureInfo.InvariantCulture;
            var date = new DateTime(2025, 9, 8);
            Assert.Equal("8 Sep, 2025", new HoverDateFormatSetting("d MMM, yyyy", "y", false).FormatDate(date, culture));
            Assert.Equal(date.ToString("d", culture), new HoverDateFormatSetting("d", "y", false).FormatDate(date, culture));
            Assert.False(string.IsNullOrEmpty(new HoverDateFormatSetting("%", "y", false).FormatDate(date, culture)));
        }
    }
}
