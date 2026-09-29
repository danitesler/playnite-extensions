using System;
using System.Collections.Generic;
using System.Linq;

namespace RandomTheme
{
    /// <summary>The selection rules, kept free of Playnite so they can be tested on their own.</summary>
    public static class ThemePicker
    {
        /// <summary>
        /// Picks one theme uniformly at random from the installed themes the user has not unchecked.
        /// When <paramref name="avoidRepeat"/> is set and more than one theme is eligible, themes whose
        /// id is in <paramref name="recentIds"/> are left out, unless that would leave nothing to pick.
        /// Returns null when no theme is eligible (nothing installed, or everything unchecked).
        /// </summary>
        public static ThemeInfo Choose(
            IEnumerable<ThemeInfo> installed,
            IEnumerable<string> excludedIds,
            bool avoidRepeat,
            IEnumerable<string> recentIds,
            Random random)
        {
            var excluded = new HashSet<string>(excludedIds ?? Enumerable.Empty<string>(), StringComparer.OrdinalIgnoreCase);
            var pool = (installed ?? Enumerable.Empty<ThemeInfo>())
                .Where(t => t != null && !excluded.Contains(t.Id))
                .ToList();

            if (pool.Count == 0)
            {
                return null;
            }

            if (avoidRepeat && pool.Count > 1)
            {
                var recent = new HashSet<string>(
                    (recentIds ?? Enumerable.Empty<string>()).Where(id => !string.IsNullOrEmpty(id)),
                    StringComparer.OrdinalIgnoreCase);
                var fresh = pool.Where(t => !recent.Contains(t.Id)).ToList();
                if (fresh.Count > 0)
                {
                    pool = fresh;
                }
            }

            return pool[random.Next(pool.Count)];
        }
    }
}
