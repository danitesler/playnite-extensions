using System;
using System.Collections;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Reflection;
using System.Text;
using Playnite.SDK;

namespace RandomTheme
{
    /// <summary>
    /// Lists the themes installed for an application mode. Desktop and Fullscreen themes are separate
    /// sets: a theme only ever appears under the mode it was built for.
    /// </summary>
    internal static class ThemeCatalog
    {
        private static readonly ILogger Logger = LogManager.GetLogger();

        public static List<ThemeInfo> GetThemes(IPlayniteAPI api, ApplicationMode mode)
        {
            var themes = TryGetFromThemeManager(mode);
            if (themes == null)
            {
                Logger.Warn($"RandomTheme: Playnite's ThemeManager is unavailable; scanning the {mode} theme folders instead.");
                themes = ScanDisk(api, mode);
            }

            return themes
                .OrderBy(t => t.Name, StringComparer.CurrentCultureIgnoreCase)
                .ToList();
        }

        // ─── Playnite's own theme list ────────────────────────────────────────

        /// <summary>
        /// <c>ThemeManager.GetAvailableThemes(mode)</c> is the exact list Playnite resolves the configured
        /// theme id against at startup, so anything it returns can be loaded. Incompatible themes
        /// (unsupported theme API version) are skipped because Playnite refuses to apply them.
        /// </summary>
        private static List<ThemeInfo> TryGetFromThemeManager(ApplicationMode mode)
        {
            try
            {
                var managerType = PlayniteHost.FindPlayniteType("Playnite.ThemeManager");
                var method = managerType?
                    .GetMethods(BindingFlags.Public | BindingFlags.Static)
                    .FirstOrDefault(m => m.Name == "GetAvailableThemes"
                        && m.GetParameters().Length == 1
                        && m.GetParameters()[0].ParameterType.IsEnum);
                if (method == null)
                {
                    return null;
                }

                var modeArg = Enum.ToObject(method.GetParameters()[0].ParameterType, (int)mode);
                var manifests = method.Invoke(null, new[] { modeArg }) as IEnumerable;
                if (manifests == null)
                {
                    return null;
                }

                var result = new List<ThemeInfo>();
                var seen = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
                foreach (var manifest in manifests)
                {
                    var type = manifest?.GetType();
                    var id = type?.GetProperty("Id")?.GetValue(manifest, null) as string;
                    if (string.IsNullOrEmpty(id) || !seen.Add(id))
                    {
                        continue;
                    }

                    var name = type.GetProperty("Name")?.GetValue(manifest, null) as string;
                    var directory = type.GetProperty("DirectoryPath")?.GetValue(manifest, null) as string;
                    var compatible = type.GetProperty("IsCompatible")?.GetValue(manifest, null) as bool? ?? true;
                    if (!compatible)
                    {
                        Logger.Info($"RandomTheme: Skipping incompatible {mode} theme '{name ?? id}'.");
                        continue;
                    }

                    result.Add(new ThemeInfo(id, string.IsNullOrWhiteSpace(name) ? id : name, directory ?? string.Empty, mode));
                }

                // Playnite always ships a built-in Default theme, so an empty list means the lookup did not work.
                return result.Count > 0 ? result : null;
            }
            catch (Exception ex)
            {
                Logger.Warn(ex, "RandomTheme: ThemeManager.GetAvailableThemes failed.");
                return null;
            }
        }

        // ─── Disk fallback ────────────────────────────────────────────────────

        private static List<ThemeInfo> ScanDisk(IPlayniteAPI api, ApplicationMode mode)
        {
            var result = new List<ThemeInfo>();
            var seen = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
            var modeDir = mode == ApplicationMode.Fullscreen ? "Fullscreen" : "Desktop";

            // User-installed themes shadow the built-in ones with the same id.
            AddFromFolder(Path.Combine(api?.Paths?.ConfigurationPath ?? string.Empty, "Themes", modeDir), mode, result, seen);
            AddFromFolder(Path.Combine(api?.Paths?.ApplicationPath ?? string.Empty, "Themes", modeDir), mode, result, seen);
            return result;
        }

        private static void AddFromFolder(string folder, ApplicationMode mode, List<ThemeInfo> result, HashSet<string> seen)
        {
            if (!Directory.Exists(folder))
            {
                return;
            }

            foreach (var themeDir in Directory.GetDirectories(folder))
            {
                try
                {
                    var manifest = Path.Combine(themeDir, "theme.yaml");
                    if (!File.Exists(manifest))
                    {
                        continue;
                    }

                    var id = ReadYamlScalar(manifest, "Id");
                    if (string.IsNullOrEmpty(id) || !seen.Add(id))
                    {
                        continue;
                    }

                    result.Add(new ThemeInfo(id, ReadYamlScalar(manifest, "Name") ?? id, themeDir, mode));
                }
                catch (Exception ex)
                {
                    Logger.Warn(ex, $"RandomTheme: Could not read theme folder '{themeDir}'.");
                }
            }
        }

        private static string ReadYamlScalar(string path, string key)
        {
            var prefix = key + ":";
            foreach (var line in File.ReadLines(path, Encoding.UTF8))
            {
                if (!line.StartsWith(prefix, StringComparison.OrdinalIgnoreCase))
                {
                    continue;
                }

                var value = line.Substring(prefix.Length).Trim();
                if (value.Length >= 2 && (value[0] == '"' || value[0] == '\'') && value[value.Length - 1] == value[0])
                {
                    value = value.Substring(1, value.Length - 2);
                }

                return value.Length == 0 ? null : value;
            }

            return null;
        }
    }
}
