using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading;
using Playnite.SDK;
using Playnite.SDK.Models;
using Playnite.SDK.Plugins;

namespace ExeIcon
{
    // Playnite creates one provider per game per download; resolve once and cache.
    public class ExeIconMetadataProvider : OnDemandMetadataProvider
    {
        private static readonly ILogger Logger = LogManager.GetLogger();

        private readonly MetadataRequestOptions options;
        private readonly IPlayniteAPI api;
        private bool resolved;
        private MetadataFile icon;

        public ExeIconMetadataProvider(MetadataRequestOptions options, IPlayniteAPI api)
        {
            this.options = options;
            this.api = api;
        }

        public override List<MetadataField> AvailableFields =>
            ResolveIcon(CancellationToken.None) != null
                ? new List<MetadataField> { MetadataField.Icon }
                : new List<MetadataField>();

        public override MetadataFile GetIcon(GetMetadataFieldArgs args)
        {
            return ResolveIcon(args?.CancelToken ?? CancellationToken.None);
        }

        private MetadataFile ResolveIcon(CancellationToken cancelToken)
        {
            if (resolved)
            {
                return icon;
            }

            var game = options?.GameData;
            if (game == null)
            {
                resolved = true;
                return null;
            }

            try
            {
                var playActionExecutables = GetPlayActionExecutables(game);
                if (playActionExecutables.Count == 0 && IsEmulated(game))
                {
                    // Emulated games point InstallDirectory at the ROM folder; any exe there is not the game.
                    resolved = true;
                    return null;
                }

                var installDirectory = Expand(game, game.InstallDirectory);
                var candidates = GameExecutableFinder.FindCandidates(game.Name, installDirectory, playActionExecutables, cancelToken);
                foreach (var candidate in candidates)
                {
                    if (cancelToken.IsCancellationRequested)
                    {
                        return null;
                    }

                    var ico = PeIconExtractor.TryExtractIco(candidate);
                    if (ico != null)
                    {
                        icon = new MetadataFile(Path.GetFileNameWithoutExtension(candidate) + ".ico", ico);
                        break;
                    }
                }
            }
            catch (Exception ex)
            {
                Logger.Warn(ex, $"ExeIcon could not read an icon for '{game.Name}'.");
            }

            resolved = !cancelToken.IsCancellationRequested;
            return icon;
        }

        private List<string> GetPlayActionExecutables(Game game)
        {
            var paths = new List<string>();
            if (game.GameActions == null)
            {
                return paths;
            }

            foreach (var action in game.GameActions.Where(a => a != null && a.IsPlayAction && a.Type == GameActionType.File))
            {
                var expanded = ExpandAction(game, action);
                var path = expanded?.Path?.Trim().Trim('"');
                if (string.IsNullOrWhiteSpace(path))
                {
                    continue;
                }

                try
                {
                    if (!Path.IsPathRooted(path))
                    {
                        var baseDirectory = !string.IsNullOrWhiteSpace(expanded.WorkingDir)
                            ? expanded.WorkingDir.Trim().Trim('"')
                            : Expand(game, game.InstallDirectory);
                        if (string.IsNullOrWhiteSpace(baseDirectory))
                        {
                            continue;
                        }

                        path = Path.Combine(baseDirectory, path);
                    }

                    paths.Add(Path.GetFullPath(path));
                }
                catch (Exception ex) when (ex is ArgumentException || ex is NotSupportedException || ex is PathTooLongException)
                {
                    // .NET Framework rejects paths with invalid characters; skip that action.
                    Logger.Debug($"ExeIcon skipped an invalid play action path for '{game.Name}'.");
                }
            }

            return paths;
        }

        private static bool IsEmulated(Game game)
        {
            return game.Roms?.Count > 0
                || game.GameActions?.Any(a => a != null && a.Type == GameActionType.Emulator) == true;
        }

        private GameAction ExpandAction(Game game, GameAction action)
        {
            try
            {
                return api.ExpandGameVariables(game, action);
            }
            catch (Exception ex)
            {
                Logger.Debug(ex, "ExeIcon could not expand play action variables.");
                return action;
            }
        }

        private string Expand(Game game, string value)
        {
            if (string.IsNullOrWhiteSpace(value))
            {
                return value;
            }

            try
            {
                return api.ExpandGameVariables(game, value);
            }
            catch (Exception ex)
            {
                Logger.Debug(ex, "ExeIcon could not expand install directory variables.");
                return value;
            }
        }
    }
}
