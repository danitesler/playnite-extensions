using System;
using System.Collections.Generic;
using Playnite.SDK;
using RandomTheme;
using Xunit;

namespace PlayniteExtensions.Tests
{
    public class RandomThemeTests
    {
        private static ThemeInfo Theme(string id)
        {
            return new ThemeInfo(id, id + " Theme", @"C:\Playnite\Themes\Desktop\" + id, ApplicationMode.Desktop);
        }

        /// <summary>Always returns the given index (clamped to the pool) and records the pool size it was asked for.</summary>
        private sealed class FixedRandom : Random
        {
            private readonly int index;

            public FixedRandom(int index)
            {
                this.index = index;
            }

            public int LastMaxValue { get; private set; } = -1;

            public override int Next(int maxValue)
            {
                LastMaxValue = maxValue;
                return Math.Min(index, maxValue - 1);
            }
        }

        // ─── ThemePicker.Choose ───────────────────────────────────────────────

        [Fact]
        public void Choose_NullInstalledList_ReturnsNull()
        {
            var result = ThemePicker.Choose(null, null, avoidRepeat: true, recentIds: null, random: new FixedRandom(0));

            Assert.Null(result);
        }

        [Fact]
        public void Choose_EmptyInstalledList_ReturnsNull()
        {
            var random = new FixedRandom(0);

            var result = ThemePicker.Choose(new List<ThemeInfo>(), new List<string>(), avoidRepeat: true, recentIds: new List<string>(), random: random);

            Assert.Null(result);
            // Nothing eligible, so no random draw happens
            Assert.Equal(-1, random.LastMaxValue);
        }

        [Fact]
        public void Choose_AllThemesExcluded_ReturnsNull()
        {
            var installed = new List<ThemeInfo> { Theme("A"), Theme("B") };
            var excluded = new List<string> { "A", "B" };

            var result = ThemePicker.Choose(installed, excluded, avoidRepeat: false, recentIds: null, random: new FixedRandom(0));

            Assert.Null(result);
        }

        [Fact]
        public void Choose_ExcludedIds_AreCaseInsensitive()
        {
            var installed = new List<ThemeInfo> { Theme("Alpha"), Theme("Beta") };
            var excluded = new List<string> { "alpha" };
            var random = new FixedRandom(0);

            var result = ThemePicker.Choose(installed, excluded, avoidRepeat: false, recentIds: null, random: random);

            Assert.Equal("Beta", result.Id);
            Assert.Equal(1, random.LastMaxValue);
        }

        [Fact]
        public void Choose_NullEntriesInInstalledList_AreIgnored()
        {
            var installed = new List<ThemeInfo> { null, Theme("A"), null };
            var random = new FixedRandom(0);

            var result = ThemePicker.Choose(installed, null, avoidRepeat: false, recentIds: null, random: random);

            Assert.Equal("A", result.Id);
            Assert.Equal(1, random.LastMaxValue);
        }

        [Fact]
        public void Choose_SingleEligibleTheme_ReturnsItEvenWhenItIsTheCurrentTheme()
        {
            var installed = new List<ThemeInfo> { Theme("A"), Theme("B") };
            var excluded = new List<string> { "B" };
            var recent = new List<string> { "A" };

            // Avoid-repeat only applies when more than one theme is eligible
            var result = ThemePicker.Choose(installed, excluded, avoidRepeat: true, recentIds: recent, random: new FixedRandom(0));

            Assert.Equal("A", result.Id);
        }

        [Fact]
        public void Choose_AvoidRepeat_LeavesOutTheCurrentTheme()
        {
            var installed = new List<ThemeInfo> { Theme("A"), Theme("B"), Theme("C") };
            var recent = new List<string> { "B" };
            var random = new FixedRandom(1);

            var result = ThemePicker.Choose(installed, null, avoidRepeat: true, recentIds: recent, random: random);

            // Pool is [A, C]; index 1 => C
            Assert.Equal("C", result.Id);
            Assert.Equal(2, random.LastMaxValue);
        }

        [Fact]
        public void Choose_AvoidRepeat_NeverPicksTheCurrentThemeAcrossSeeds()
        {
            var installed = new List<ThemeInfo> { Theme("A"), Theme("B"), Theme("C") };
            var recent = new List<string> { "b" };

            for (var seed = 0; seed < 100; seed++)
            {
                var result = ThemePicker.Choose(installed, null, avoidRepeat: true, recentIds: recent, random: new Random(seed));

                Assert.NotEqual("B", result.Id);
            }
        }

        [Fact]
        public void Choose_AvoidRepeat_WhenEveryEligibleThemeIsRecent_FallsBackToTheWholePool()
        {
            var installed = new List<ThemeInfo> { Theme("A"), Theme("B") };
            var recent = new List<string> { "A", "B" };
            var random = new FixedRandom(1);

            var result = ThemePicker.Choose(installed, null, avoidRepeat: true, recentIds: recent, random: random);

            Assert.Equal("B", result.Id);
            Assert.Equal(2, random.LastMaxValue);
        }

        [Fact]
        public void Choose_AvoidRepeatOff_CanPickTheCurrentTheme()
        {
            var installed = new List<ThemeInfo> { Theme("A"), Theme("B") };
            var recent = new List<string> { "A" };
            var random = new FixedRandom(0);

            var result = ThemePicker.Choose(installed, null, avoidRepeat: false, recentIds: recent, random: random);

            Assert.Equal("A", result.Id);
            Assert.Equal(2, random.LastMaxValue);
        }

        [Fact]
        public void Choose_NullOrEmptyRecentIds_DoNotShrinkThePool()
        {
            var installed = new List<ThemeInfo> { Theme("A"), Theme("B") };
            var recent = new List<string> { null, string.Empty };
            var random = new FixedRandom(0);

            var result = ThemePicker.Choose(installed, null, avoidRepeat: true, recentIds: recent, random: random);

            Assert.Equal("A", result.Id);
            Assert.Equal(2, random.LastMaxValue);
        }

        [Fact]
        public void Choose_ExcludedAndRecent_AreAppliedTogether()
        {
            var installed = new List<ThemeInfo> { Theme("A"), Theme("B"), Theme("C") };
            var excluded = new List<string> { "C" };
            var recent = new List<string> { "A" };
            var random = new FixedRandom(0);

            var result = ThemePicker.Choose(installed, excluded, avoidRepeat: true, recentIds: recent, random: random);

            Assert.Equal("B", result.Id);
            Assert.Equal(1, random.LastMaxValue);
        }

        // ─── ThemeCategorySettings.IsDue ──────────────────────────────────────
        // Cadence steps: 0 every launch, 1 every day, 2 every 3 days, 3 every 7 days, 4 every 30 days.
        // Times are built in local time so the tests do not depend on the machine's time zone.

        [Fact]
        public void IsDue_NeverPicked_ReturnsTrue()
        {
            var settings = new ThemeCategorySettings { CadenceStep = 4, LastPickedUtc = null };

            var result = settings.IsDue(new DateTime(2026, 6, 10, 12, 0, 0, DateTimeKind.Local));

            Assert.True(result);
        }

        [Fact]
        public void IsDue_EveryLaunch_ReturnsTrueEvenRightAfterAPick()
        {
            var now = new DateTime(2026, 6, 10, 12, 0, 0, DateTimeKind.Local);
            var settings = new ThemeCategorySettings { CadenceStep = 0, LastPickedUtc = now.ToUniversalTime() };

            var result = settings.IsDue(now);

            Assert.True(result);
        }

        [Fact]
        public void IsDue_DailyCadence_SameCalendarDay_ReturnsFalse()
        {
            var lastPicked = new DateTime(2026, 6, 10, 0, 30, 0, DateTimeKind.Local);
            var settings = new ThemeCategorySettings { CadenceStep = 1, LastPickedUtc = lastPicked.ToUniversalTime() };

            var result = settings.IsDue(new DateTime(2026, 6, 10, 23, 30, 0, DateTimeKind.Local));

            Assert.False(result);
        }

        [Fact]
        public void IsDue_DailyCadence_NextCalendarDay_ReturnsTrueEvenUnder24Hours()
        {
            // Picked late in the evening, launched early next morning: calendar days, not elapsed hours
            var lastPicked = new DateTime(2026, 6, 10, 23, 0, 0, DateTimeKind.Local);
            var settings = new ThemeCategorySettings { CadenceStep = 1, LastPickedUtc = lastPicked.ToUniversalTime() };

            var result = settings.IsDue(new DateTime(2026, 6, 11, 1, 0, 0, DateTimeKind.Local));

            Assert.True(result);
        }

        [Theory]
        [InlineData(2, 2, false)]
        [InlineData(2, 3, true)]
        [InlineData(3, 6, false)]
        [InlineData(3, 7, true)]
        [InlineData(4, 29, false)]
        [InlineData(4, 30, true)]
        [InlineData(4, 45, true)]
        public void IsDue_IntervalBoundary_DueOnlyOnceTheCalendarDaysHaveElapsed(int cadenceStep, int daysLater, bool expected)
        {
            var lastPicked = new DateTime(2026, 6, 1, 18, 0, 0, DateTimeKind.Local);
            var settings = new ThemeCategorySettings { CadenceStep = cadenceStep, LastPickedUtc = lastPicked.ToUniversalTime() };

            // Earlier clock time than the pick still counts as a full day
            var now = new DateTime(2026, 6, 1, 9, 0, 0, DateTimeKind.Local).AddDays(daysLater);

            Assert.Equal(expected, settings.IsDue(now));
        }

        [Fact]
        public void IsDue_ClockBeforeLastPick_ReturnsFalse()
        {
            var lastPicked = new DateTime(2026, 6, 10, 12, 0, 0, DateTimeKind.Local);
            var settings = new ThemeCategorySettings { CadenceStep = 1, LastPickedUtc = lastPicked.ToUniversalTime() };

            var result = settings.IsDue(new DateTime(2026, 6, 8, 12, 0, 0, DateTimeKind.Local));

            Assert.False(result);
        }

        [Theory]
        [InlineData(-5, 0)]
        [InlineData(0, 0)]
        [InlineData(4, 4)]
        [InlineData(99, 4)]
        public void CadenceStep_OutOfRange_IsClampedToTheSliderRange(int input, int expected)
        {
            var settings = new ThemeCategorySettings { CadenceStep = input };

            Assert.Equal(expected, settings.CadenceStep);
        }
    }
}
