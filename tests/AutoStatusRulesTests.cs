using System;
using System.Collections.Generic;
using AutoStatus;
using Xunit;

namespace PlayniteExtensions.Tests
{
    public class AutoStatusRulesTests
    {
        [Fact]
        public void IsStale_NeverPlayed_ReturnsFalse()
        {
            var now = new DateTime(2026, 10, 4);
            var markedAt = now.AddDays(-60);

            // Games never played in Playnite are untouched
            var result = StatusRules.IsStale(lastActivity: null, markedAt: markedAt, days: 30, now: now);

            Assert.False(result);
        }

        [Fact]
        public void IsStale_PlayedRecently_ReturnsFalse()
        {
            var now = new DateTime(2026, 10, 4);
            var lastActivity = now.AddDays(-15);

            var result = StatusRules.IsStale(lastActivity: lastActivity, markedAt: null, days: 30, now: now);

            Assert.False(result);
        }

        [Fact]
        public void IsStale_PlayedPastThreshold_ReturnsTrue()
        {
            var now = new DateTime(2026, 10, 4);
            var lastActivity = now.AddDays(-31);

            var result = StatusRules.IsStale(lastActivity: lastActivity, markedAt: null, days: 30, now: now);

            Assert.True(result);
        }

        [Fact]
        public void IsStale_PlayedExactlyOnThreshold_ReturnsTrue()
        {
            var now = new DateTime(2026, 10, 4);
            var lastActivity = now.AddDays(-30);

            var result = StatusRules.IsStale(lastActivity: lastActivity, markedAt: null, days: 30, now: now);

            Assert.True(result);
        }

        [Fact]
        public void IsStale_MarkedAtMoreRecentThanPlay_UsesMarkedAtReference()
        {
            var now = new DateTime(2026, 10, 4);
            // Played long ago (50 days), but marked only 10 days ago
            var lastActivity = now.AddDays(-50);
            var markedAt = now.AddDays(-10);

            var result = StatusRules.IsStale(lastActivity: lastActivity, markedAt: markedAt, days: 30, now: now);

            // Within 30 days of markedAt, so not stale
            Assert.False(result);
        }

        [Fact]
        public void IsStale_MarkedAtOlderThanPlay_UsesLastActivityReference()
        {
            var now = new DateTime(2026, 10, 4);
            // Marked 50 days ago, but played 5 days ago
            var markedAt = now.AddDays(-50);
            var lastActivity = now.AddDays(-5);

            var result = StatusRules.IsStale(lastActivity: lastActivity, markedAt: markedAt, days: 30, now: now);

            // Within 30 days of lastActivity, so not stale
            Assert.False(result);
        }

        [Theory]
        [InlineData(0, 1)]
        [InlineData(-15, 1)]
        [InlineData(1, 1)]
        [InlineData(30, 30)]
        [InlineData(365, 365)]
        [InlineData(500, 365)]
        public void ClampDays_EnforcesMinAndMaxBounds(int input, int expected)
        {
            Assert.Equal(expected, StatusRules.ClampDays(input));
        }

        [Fact]
        public void ShouldResume_WhenCurrentInWatchedAndDifferentFromTarget_ReturnsTrue()
        {
            var playingId = Guid.NewGuid();
            var backlogId = Guid.NewGuid();
            var watched = new HashSet<Guid> { backlogId };

            var result = StatusRules.ShouldResume(currentStatusId: backlogId, watchedStatusIds: watched, targetStatusId: playingId);

            Assert.True(result);
        }

        [Fact]
        public void ShouldResume_WhenCurrentAlreadyTarget_ReturnsFalse()
        {
            var playingId = Guid.NewGuid();
            var watched = new HashSet<Guid> { playingId };

            var result = StatusRules.ShouldResume(currentStatusId: playingId, watchedStatusIds: watched, targetStatusId: playingId);

            Assert.False(result);
        }

        [Fact]
        public void ShouldResume_WhenTargetIsEmpty_ReturnsFalse()
        {
            var backlogId = Guid.NewGuid();
            var watched = new HashSet<Guid> { backlogId };

            var result = StatusRules.ShouldResume(currentStatusId: backlogId, watchedStatusIds: watched, targetStatusId: Guid.Empty);

            Assert.False(result);
        }

        [Fact]
        public void ShouldResume_WhenCurrentNotInWatched_ReturnsFalse()
        {
            var completedId = Guid.NewGuid();
            var backlogId = Guid.NewGuid();
            var playingId = Guid.NewGuid();
            var watched = new HashSet<Guid> { backlogId };

            var result = StatusRules.ShouldResume(currentStatusId: completedId, watchedStatusIds: watched, targetStatusId: playingId);

            Assert.False(result);
        }

        [Fact]
        public void ShouldResume_WhenWatchedListNull_ReturnsFalse()
        {
            var backlogId = Guid.NewGuid();
            var playingId = Guid.NewGuid();

            var result = StatusRules.ShouldResume(currentStatusId: backlogId, watchedStatusIds: null, targetStatusId: playingId);

            Assert.False(result);
        }

        [Fact]
        public void FindByName_MatchesInsensitiveToCaseSpacesAndPunctuation()
        {
            var playingId = Guid.NewGuid();
            var onHoldId = Guid.NewGuid();
            var list = new List<KeyValuePair<Guid, string>>
            {
                new KeyValuePair<Guid, string>(playingId, "Playing"),
                new KeyValuePair<Guid, string>(onHoldId, "On-Hold")
            };

            var match1 = StatusRules.FindByName(list, "playing");
            var match2 = StatusRules.FindByName(list, "on hold");
            var match3 = StatusRules.FindByName(list, "ON_HOLD");

            Assert.Equal(playingId, match1);
            Assert.Equal(onHoldId, match2);
            Assert.Equal(onHoldId, match3);
        }

        [Fact]
        public void FindByName_FallsBackThroughCandidateListInOrder()
        {
            var targetId = Guid.NewGuid();
            var list = new List<KeyValuePair<Guid, string>>
            {
                new KeyValuePair<Guid, string>(targetId, "In Progress")
            };

            // First candidate doesn't match; second candidate matches
            var found = StatusRules.FindByName(list, "Playing", "In Progress");

            Assert.Equal(targetId, found);
        }

        [Fact]
        public void FindByName_WhenNoCandidateMatches_ReturnsEmptyGuid()
        {
            var list = new List<KeyValuePair<Guid, string>>
            {
                new KeyValuePair<Guid, string>(Guid.NewGuid(), "Completed")
            };

            var found = StatusRules.FindByName(list, "Playing", "Backlog");

            Assert.Equal(Guid.Empty, found);
        }
    }
}
