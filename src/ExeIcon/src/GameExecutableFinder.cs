using System;
using System.Collections.Generic;
using System.Globalization;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading;

namespace ExeIcon
{
    /// <summary>
    /// Picks the executables most likely to be the game itself: explicit play actions first,
    /// then a shallow, bounded scan of the install folder ranked by name match and depth.
    /// </summary>
    internal static class GameExecutableFinder
    {
        internal const int MaxDepth = 3;
        internal const int MaxDirectories = 300;
        internal const int MaxExecutables = 200;

        // Substrings of exe names that are never the game (installers, runtimes, crash tools, anti-cheat).
        private static readonly string[] ExcludedNameParts =
        {
            "unins", "setup", "install", "redist", "dxweb", "directx", "dotnet", "netfx", "prereq",
            "crashhandler", "crashreport", "crashpad", "crashsender", "crashdump", "crashupload",
            "bugreport", "errorreport", "easyanticheat", "battleye", "beservice", "cefprocess",
            "subprocess", "webhelper", "qtwebengine", "notification", "overlay", "physx", "oalinst",
            "vulkan", "touchup", "cleanup", "updater", "servicehost"
        };

        // Folder names that hold redistributables or engine tooling rather than the game.
        private static readonly HashSet<string> ExcludedDirectories = new HashSet<string>(StringComparer.OrdinalIgnoreCase)
        {
            "_commonredist", "commonredist", "redist", "redists", "redistributables", "__installer", "_installer",
            "installer", "installers", "directx", "dotnet", "vcredist", "prerequisites", "prereqs", "support",
            "easyanticheat", "battleye", "engine", "thirdparty", "crashreportclient", "uninstall", "logs",
            "cache", "saves", "mods", "__overlay"
        };

        private static readonly string[] StrippedStemSuffixes =
        {
            "win64shipping", "win32shipping", "wingdkshipping", "shipping",
            "win64", "win32", "x64", "x86", "dx11", "dx12", "64", "32"
        };

        private static readonly HashSet<string> StopWords = new HashSet<string>(StringComparer.OrdinalIgnoreCase)
        {
            "the", "of", "and", "an", "edition"
        };

        private static readonly HashSet<string> RomanNumerals = new HashSet<string>(StringComparer.OrdinalIgnoreCase)
        {
            "i", "ii", "iii", "iv", "v", "vi", "vii", "viii", "ix", "x"
        };

        public static List<string> FindCandidates(
            string gameName,
            string installDirectory,
            IEnumerable<string> playActionExecutables,
            CancellationToken cancelToken)
        {
            var result = new List<string>();
            var seen = new HashSet<string>(StringComparer.OrdinalIgnoreCase);

            foreach (var path in playActionExecutables ?? Enumerable.Empty<string>())
            {
                var fullPath = SafeFullPath(path);
                if (fullPath != null && IsExecutable(fullPath) && File.Exists(fullPath) && seen.Add(fullPath))
                {
                    result.Add(fullPath);
                }
            }

            if (!CanScan(installDirectory))
            {
                return result;
            }

            var scored = ScanInstallDirectory(gameName, installDirectory, cancelToken)
                .Select(c => new { c.Path, Score = Score(gameName, c.Path, c.Depth, c.Length) })
                .OrderByDescending(c => c.Score)
                .ThenBy(c => c.Path, StringComparer.OrdinalIgnoreCase);

            foreach (var candidate in scored)
            {
                var fullPath = SafeFullPath(candidate.Path);
                if (fullPath != null && seen.Add(fullPath))
                {
                    result.Add(fullPath);
                }
            }

            return result;
        }

        internal static int Score(string gameName, string exePath, int depth, long length)
        {
            var nameKey = NormalizeKey(gameName);
            var stem = Path.GetFileNameWithoutExtension(exePath) ?? string.Empty;
            var stemKey = NormalizeKey(stem);
            var strippedKey = StripStemSuffixes(stemKey);
            var score = 0;

            if (nameKey.Length > 0)
            {
                if (stemKey == nameKey || strippedKey == nameKey)
                {
                    score += 100;
                }
                else if (Initials(gameName) is var initials && initials.Length >= 2 && (stemKey == initials || strippedKey == initials))
                {
                    score += 70;
                }
                else if ((strippedKey.Length >= 4 && nameKey.Contains(strippedKey)) || (nameKey.Length >= 3 && strippedKey.Contains(nameKey)))
                {
                    score += 50;
                }

                var tokenScore = Words(gameName)
                    .Where(w => w.Length >= 3 && !StopWords.Contains(w))
                    .Select(NormalizeKey)
                    .Distinct()
                    .Count(w => stemKey.Contains(w)) * 15;
                score += Math.Min(45, tokenScore);
            }

            if (stemKey.Contains("launcher") || stemKey.Contains("config") || stemKey.Contains("settings"))
            {
                score -= 15;
            }

            score -= depth * 8;
            score += (int)Math.Min(10, length / (5L * 1024 * 1024));
            return score;
        }

        internal static bool IsExcludedExecutable(string fileName, string gameName)
        {
            var key = NormalizeKey(Path.GetFileNameWithoutExtension(fileName));
            if (key.Length == 0)
            {
                return true;
            }

            // "CrashBandicoot.exe" or "SetupSimulator.exe" is the game, whatever the exclusion list says.
            var nameKey = NormalizeKey(gameName);
            if (nameKey.Length >= 4 && key.Contains(nameKey))
            {
                return false;
            }

            return ExcludedNameParts.Any(key.Contains);
        }

        internal static string NormalizeKey(string value)
        {
            if (string.IsNullOrWhiteSpace(value))
            {
                return string.Empty;
            }

            var decomposed = value.Replace("&", " and ").Normalize(NormalizationForm.FormD);
            var builder = new StringBuilder(decomposed.Length);
            foreach (var c in decomposed)
            {
                if (CharUnicodeInfo.GetUnicodeCategory(c) != UnicodeCategory.NonSpacingMark && char.IsLetterOrDigit(c))
                {
                    builder.Append(char.ToLowerInvariant(c));
                }
            }

            return builder.ToString();
        }

        // "Grand Theft Auto V" -> "gtav", "Red Dead Redemption 2" -> "rdr2".
        internal static string Initials(string gameName)
        {
            var builder = new StringBuilder();
            foreach (var word in Words(gameName))
            {
                var key = NormalizeKey(word);
                if (key.Length == 0)
                {
                    continue;
                }

                if (key.All(char.IsDigit) || RomanNumerals.Contains(key))
                {
                    builder.Append(key);
                }
                else
                {
                    builder.Append(key[0]);
                }
            }

            return builder.ToString();
        }

        private static IEnumerable<string> Words(string value)
        {
            if (string.IsNullOrWhiteSpace(value))
            {
                return Enumerable.Empty<string>();
            }

            return value
                .Replace("&", " and ")
                .Replace("'", string.Empty)
                .Replace("\u2019", string.Empty)
                .Split((char[])null, StringSplitOptions.RemoveEmptyEntries)
                .SelectMany(w => w.Split(new[] { ':', '-', '_', '.', ',', '/', '(', ')', '[', ']', '!', '?' }, StringSplitOptions.RemoveEmptyEntries));
        }

        private static string StripStemSuffixes(string stemKey)
        {
            foreach (var suffix in StrippedStemSuffixes)
            {
                if (stemKey.EndsWith(suffix, StringComparison.Ordinal) && stemKey.Length - suffix.Length >= 3)
                {
                    return stemKey.Substring(0, stemKey.Length - suffix.Length);
                }
            }

            return stemKey;
        }

        private static bool IsExecutable(string path)
        {
            return !string.IsNullOrWhiteSpace(path)
                && path.EndsWith(".exe", StringComparison.OrdinalIgnoreCase);
        }

        // .NET Framework throws on invalid path characters (quotes, pipes) instead of returning a value.
        private static string SafeFullPath(string path)
        {
            if (string.IsNullOrWhiteSpace(path))
            {
                return null;
            }

            try
            {
                return Path.GetFullPath(path.Trim().Trim('"'));
            }
            catch (Exception ex) when (ex is ArgumentException || ex is NotSupportedException || ex is PathTooLongException || ex is System.Security.SecurityException)
            {
                return null;
            }
        }

        private static bool CanScan(string installDirectory)
        {
            if (string.IsNullOrWhiteSpace(installDirectory))
            {
                return false;
            }

            try
            {
                var fullPath = Path.GetFullPath(installDirectory);
                var root = Path.GetPathRoot(fullPath);

                // A drive root is a misconfigured install folder; scanning it would pick random programs.
                return Directory.Exists(fullPath)
                    && !string.Equals(fullPath.TrimEnd('\\', '/'), (root ?? string.Empty).TrimEnd('\\', '/'), StringComparison.OrdinalIgnoreCase);
            }
            catch (Exception)
            {
                return false;
            }
        }

        private static List<ScannedExecutable> ScanInstallDirectory(string gameName, string installDirectory, CancellationToken cancelToken)
        {
            var found = new List<ScannedExecutable>();
            var queue = new Queue<KeyValuePair<string, int>>();
            queue.Enqueue(new KeyValuePair<string, int>(installDirectory, 0));
            var visited = 0;

            while (queue.Count > 0 && visited < MaxDirectories && found.Count < MaxExecutables)
            {
                if (cancelToken.IsCancellationRequested)
                {
                    break;
                }

                var next = queue.Dequeue();
                var directory = next.Key;
                var depth = next.Value;
                visited++;

                foreach (var file in SafeEnumerate(() => Directory.EnumerateFiles(directory, "*.exe", SearchOption.TopDirectoryOnly)))
                {
                    if (!IsExecutable(file) || IsExcludedExecutable(file, gameName))
                    {
                        continue;
                    }

                    long length;
                    try
                    {
                        length = new FileInfo(file).Length;
                    }
                    catch (Exception)
                    {
                        continue;
                    }

                    found.Add(new ScannedExecutable { Path = file, Depth = depth, Length = length });
                    if (found.Count >= MaxExecutables)
                    {
                        break;
                    }
                }

                if (depth >= MaxDepth)
                {
                    continue;
                }

                foreach (var child in SafeEnumerate(() => Directory.EnumerateDirectories(directory, "*", SearchOption.TopDirectoryOnly)))
                {
                    if (!ExcludedDirectories.Contains(Path.GetFileName(child)))
                    {
                        queue.Enqueue(new KeyValuePair<string, int>(child, depth + 1));
                    }
                }
            }

            return found;
        }

        private sealed class ScannedExecutable
        {
            public string Path { get; set; }
            public int Depth { get; set; }
            public long Length { get; set; }
        }

        private static List<string> SafeEnumerate(Func<IEnumerable<string>> enumerate)
        {
            try
            {
                return enumerate().ToList();
            }
            catch (Exception)
            {
                // Access denied, broken junctions, or a folder removed mid-scan.
                return new List<string>();
            }
        }
    }
}
