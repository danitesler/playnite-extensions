using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using Playnite.SDK;
using Playnite.SDK.Data;

namespace AutoStatus
{
    /// <summary>
    /// When each game was last set to the watched status (by the user or by AutoStatus).
    /// Without this, a game you just re-marked "Playing" would be moved back on the next pass
    /// because its last play is still months old.
    /// </summary>
    internal class StatusMarks
    {
        private static readonly ILogger Logger = LogManager.GetLogger();

        private readonly string path;
        private readonly object sync = new object();
        private Dictionary<Guid, DateTime> marks = new Dictionary<Guid, DateTime>();
        private bool dirty;

        public StatusMarks(string path)
        {
            this.path = path;
        }

        public void Load()
        {
            try
            {
                if (!File.Exists(path))
                {
                    return;
                }

                var loaded = Serialization.FromJsonFile<Dictionary<Guid, DateTime>>(path);
                lock (sync)
                {
                    marks = loaded ?? new Dictionary<Guid, DateTime>();
                    dirty = false;
                }
            }
            catch (Exception ex)
            {
                Logger.Warn(ex, "AutoStatus could not read its status marks; starting fresh.");
            }
        }

        public void Save()
        {
            Dictionary<Guid, DateTime> snapshot;
            lock (sync)
            {
                if (!dirty)
                {
                    return;
                }

                snapshot = new Dictionary<Guid, DateTime>(marks);
                dirty = false;
            }

            try
            {
                Directory.CreateDirectory(Path.GetDirectoryName(path));
                File.WriteAllText(path, Serialization.ToJson(snapshot));
            }
            catch (Exception ex)
            {
                Logger.Warn(ex, "AutoStatus could not save its status marks.");
            }
        }

        public DateTime? Get(Guid gameId)
        {
            lock (sync)
            {
                return marks.TryGetValue(gameId, out var markedAt) ? markedAt : (DateTime?)null;
            }
        }

        public void Mark(Guid gameId, DateTime markedAt)
        {
            lock (sync)
            {
                marks[gameId] = markedAt;
                dirty = true;
            }
        }

        public void Clear(Guid gameId)
        {
            lock (sync)
            {
                dirty |= marks.Remove(gameId);
            }
        }

        /// <summary>Drops marks for games that left the watched status or the library.</summary>
        public void RetainOnly(ICollection<Guid> gameIds)
        {
            lock (sync)
            {
                foreach (var id in marks.Keys.Where(id => !gameIds.Contains(id)).ToList())
                {
                    marks.Remove(id);
                    dirty = true;
                }
            }
        }
    }
}
