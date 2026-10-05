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
        private readonly object saveSync = new object();
        private Dictionary<Guid, DateTime> marks = new Dictionary<Guid, DateTime>();
        private bool dirty;

        public StatusMarks(string path)
        {
            this.path = path;
        }

        /// <summary>
        /// True when the marks file exists but could not be read. The stale pass must not run then (every
        /// re-marked game would look stale), and Save leaves the file alone so it can still be recovered.
        /// A missing file (first run) is not a failure.
        /// </summary>
        public bool LoadFailed { get; private set; }

        public void Load()
        {
            try
            {
                if (!File.Exists(path))
                {
                    LoadFailed = false;
                    return;
                }

                var loaded = Serialization.FromJsonFile<Dictionary<Guid, DateTime>>(path);
                if (loaded == null)
                {
                    throw new InvalidDataException("The status marks file is empty.");
                }

                lock (sync)
                {
                    marks = loaded;
                    dirty = false;
                }

                LoadFailed = false;
            }
            catch (Exception ex)
            {
                LoadFailed = true;
                Logger.Warn(ex, $"AutoStatus could not read its status marks ({path}); the stale rule is paused until the file is fixed or deleted and Playnite restarts.");
            }
        }

        public void Save()
        {
            if (LoadFailed)
            {
                return;
            }

            lock (saveSync)
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

                // Write a temp file and swap it in, so a crash mid-write never leaves a truncated marks file.
                var tempPath = path + ".tmp";
                try
                {
                    Directory.CreateDirectory(Path.GetDirectoryName(path));
                    File.WriteAllText(tempPath, Serialization.ToJson(snapshot));
                    if (File.Exists(path))
                    {
                        File.Replace(tempPath, path, null);
                    }
                    else
                    {
                        File.Move(tempPath, path);
                    }
                }
                catch (Exception ex)
                {
                    Logger.Warn(ex, "AutoStatus could not save its status marks.");
                    lock (sync)
                    {
                        dirty = true;
                    }

                    try
                    {
                        if (File.Exists(tempPath))
                        {
                            File.Delete(tempPath);
                        }
                    }
                    catch
                    {
                        // Best effort: the next save overwrites a leftover temp file anyway.
                    }
                }
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
