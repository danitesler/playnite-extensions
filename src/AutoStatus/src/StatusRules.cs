using System;
using System.Collections.Generic;
using System.Linq;

namespace AutoStatus
{
    /// <summary>Rule decisions only; no Playnite types so the logic can be tested off Windows.</summary>
    internal static class StatusRules
    {
        public const int MinDays = 1;
        public const int MaxDays = 365;
        public const int DefaultDays = 30;

        /// <summary>
        /// A game is stale once it has been played in Playnite and neither that play nor the moment it was
        /// last set to the watched status falls inside the window. Games never played in Playnite are left
        /// alone: they may be tracked by hand (console, other PCs) and have no activity to judge.
        /// </summary>
        public static bool IsStale(DateTime? lastActivity, DateTime? markedAt, int days, DateTime now)
        {
            if (!lastActivity.HasValue)
            {
                return false;
            }

            var reference = lastActivity.Value;
            if (markedAt.HasValue && markedAt.Value > reference)
            {
                reference = markedAt.Value;
            }

            return now - reference >= TimeSpan.FromDays(ClampDays(days));
        }

        public static bool ShouldResume(Guid currentStatusId, ICollection<Guid> watchedStatusIds, Guid targetStatusId)
        {
            return targetStatusId != Guid.Empty
                && currentStatusId != targetStatusId
                && watchedStatusIds != null
                && watchedStatusIds.Contains(currentStatusId);
        }

        public static int ClampDays(int days)
        {
            return Math.Max(MinDays, Math.Min(MaxDays, days));
        }

        /// <summary>First status whose name matches any candidate, ignoring case, spaces, and punctuation.</summary>
        public static Guid FindByName(IEnumerable<KeyValuePair<Guid, string>> statuses, params string[] candidateNames)
        {
            var list = statuses?.ToList() ?? new List<KeyValuePair<Guid, string>>();
            foreach (var candidate in candidateNames ?? new string[0])
            {
                var key = NameKey(candidate);
                if (key.Length == 0)
                {
                    continue;
                }

                foreach (var status in list)
                {
                    if (NameKey(status.Value) == key)
                    {
                        return status.Key;
                    }
                }
            }

            return Guid.Empty;
        }

        private static string NameKey(string value)
        {
            return new string((value ?? string.Empty).Where(char.IsLetterOrDigit).Select(char.ToLowerInvariant).ToArray());
        }
    }
}
