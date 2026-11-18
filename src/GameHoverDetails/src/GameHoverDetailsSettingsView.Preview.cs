using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Linq;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Input;
using System.Windows.Media;
using System.Windows.Threading;
using Playnite.SDK;
using Playnite.SDK.Models;


namespace GameHoverDetails
{
    public partial class GameHoverDetailsSettingsView
    {
        private void RefreshPreviewFields()
        {
            if (PreviewFieldsHost == null || boundSettings == null)
            {
                return;
            }

            var api = boundSettings.TryGetPlayniteApi();
            var game = previewSampleGame;
            var previewChromeWidth = System.Math.Max(120, boundSettings.HoverWidth);
            var pad = ClampPreviewContentPaddingDip(boundSettings.HoverContentPaddingDip);
            var innerMax = System.Math.Max(60.0, previewChromeWidth - (pad * 2.0));
            var palette = HoverChromePalette.Resolve(boundSettings);
            var keyList = boundSettings.SelectedFieldKeys.Where(HoverFieldCatalog.IsKnownKey).ToList();

            HoverFieldListBuilder.Fill(
                PreviewFieldsHost,
                boundSettings,
                palette,
                keyList,
                innerMax,
                new HoverFieldListSource
                {
                    OmitEmptyArt = false,
                    IgnoreEmptyFieldBehavior = true,
                    IsUnplayed = game != null && game.Playtime == 0 && game.LastActivity == null,
                    TryGetGameArt = key =>
                    {
                        if (game == null || api == null)
                        {
                            return null;
                        }

                        var art = GetCachedPreviewArt(key, game, api);
                        if (key == "Icon" && art == null)
                        {
                            art = TryLoadFallbackLibraryGameIcon(api, game);
                        }

                        return art;
                    },
                    TryGetPlatformIcons = () => HoverFieldListSource.LoadPlatformIcons(game, api),
                    FormatValue = key =>
                    {
                        if (game != null && api != null)
                        {
                            var raw = HoverFieldFormatter.Format(key, game, api);
                            var preview = HoverPreviewSampleText.FormatValueForPreview(key, raw);
                            if (!HoverPreviewSampleText.LooksLikeMissingData(preview))
                            {
                                return preview;
                            }
                        }

                        return HoverPreviewSampleText.ForKey(key);
                    }
                });
            PreviewFieldsHost.InvalidateMeasure();
            PreviewChromeBorder?.InvalidateMeasure();
            PreviewChromeBody?.InvalidateMeasure();
        }

        private ImageSource GetCachedPreviewArt(string fieldKey, Game game, IPlayniteAPI api)
        {
            if (previewArtByField.TryGetValue(fieldKey, out var cached))
            {
                return cached;
            }

            var art = HoverBitmapLoader.TryLoadGameArt(fieldKey, game, api);
            previewArtByField[fieldKey] = art;
            return art;
        }

        private const int MaxFallbackArtLoads = 8;
        private const int MaxFallbackArtScan = 32;
        private const int MaxSampleGameScan = 80;

        /// <summary>
        /// When the preview game has no usable icon, try a few other library games that have an icon path.
        /// Cached for the life of the settings view so slider churn does not hit disk again.
        /// </summary>
        private ImageSource TryLoadFallbackLibraryGameIcon(IPlayniteAPI api, Game previewGame)
        {
            if (cachedFallbackIcon != null)
            {
                return cachedFallbackIcon;
            }

            cachedFallbackIcon = TryLoadFirstLibraryArt(api, previewGame, "Icon");
            return cachedFallbackIcon;
        }

        private ImageSource TryLoadFirstLibraryArt(IPlayniteAPI api, Game skipGame, string fieldKey)
        {
            if (api?.Database?.Games == null)
            {
                return null;
            }

            var attempts = 0;
            var scanned = 0;
            foreach (var g in api.Database.Games)
            {
                if (g == null)
                {
                    continue;
                }

                scanned++;
                if (scanned > MaxFallbackArtScan)
                {
                    return null;
                }

                if (skipGame != null && g.Id == skipGame.Id)
                {
                    continue;
                }

                string path;
                switch (fieldKey)
                {
                    case "Icon":
                        path = g.Icon;
                        break;
                    case "CoverImage":
                        path = g.CoverImage;
                        break;
                    case "BackgroundImage":
                        path = g.BackgroundImage;
                        break;
                    default:
                        path = g.BackgroundImage;
                        break;
                }

                if (string.IsNullOrWhiteSpace(path))
                {
                    continue;
                }

                var bmp = HoverBitmapLoader.TryLoadGameArt(fieldKey, g, api);
                if (bmp != null)
                {
                    return bmp;
                }

                attempts++;
                if (attempts >= MaxFallbackArtLoads)
                {
                    return null;
                }
            }

            return null;
        }

        /// <summary>First library game with usable art metadata; does not walk the whole library.</summary>
        private void TryPickPreviewSampleGame()
        {
            if (previewSampleGame != null || boundSettings == null)
            {
                return;
            }

            var api = boundSettings.TryGetPlayniteApi();
            var games = api?.Database?.Games;
            if (games == null)
            {
                return;
            }

            try
            {
                var preferFanart = boundSettings.IsGameCoverBackgroundStyle;
                Game firstAny = null;
                Game withArt = null;
                var scanned = 0;
                foreach (var g in games)
                {
                    if (g == null)
                    {
                        continue;
                    }

                    if (firstAny == null)
                    {
                        firstAny = g;
                    }

                    var hasFanart = !string.IsNullOrWhiteSpace(g.BackgroundImage);
                    var hasCover = !string.IsNullOrWhiteSpace(g.CoverImage);
                    var hasIcon = !string.IsNullOrWhiteSpace(g.Icon);
                    if (preferFanart ? hasFanart : (hasIcon || hasCover))
                    {
                        withArt = g;
                        break;
                    }

                    scanned++;
                    if (scanned >= MaxSampleGameScan)
                    {
                        break;
                    }
                }

                previewSampleGame = withArt ?? firstAny;
                previewArtByField.Clear();
            }
            catch
            {
                previewSampleGame = null;
            }
        }

        private void ApplyPreviewChrome()
        {
            if (PreviewChromeBorder == null || boundSettings == null)
            {
                return;
            }

            var cover = boundSettings.IsGameCoverBackgroundStyle ? TryLoadPreviewCover() : null;
            var coverActive = cover != null;
            if (PreviewCoverHost != null)
            {
                if (coverActive)
                {
                    PreviewCoverHost.Background = new ImageBrush(cover)
                    {
                        Stretch = Stretch.UniformToFill,
                        AlignmentX = AlignmentX.Center,
                        AlignmentY = AlignmentY.Center,
                        TileMode = TileMode.None
                    };
                    PreviewCoverHost.Visibility = Visibility.Visible;
                }
                else
                {
                    PreviewCoverHost.Background = null;
                    PreviewCoverHost.Visibility = Visibility.Collapsed;
                }
            }

            if (PreviewCoverTint != null)
            {
                PreviewCoverTint.Background = HoverChromePalette.CoverTintBrush;
                var tintOpacity = boundSettings.HoverChromeBackgroundOpacity / 100.0;
                if (tintOpacity < 0)
                {
                    tintOpacity = 0;
                }
                else if (tintOpacity > 1)
                {
                    tintOpacity = 1;
                }

                PreviewCoverTint.Opacity = tintOpacity;
                PreviewCoverTint.Visibility = coverActive ? Visibility.Visible : Visibility.Collapsed;
            }

            HoverChromePalette.ApplyToChromeBorder(PreviewChromeBorder, boundSettings, coverActive);
            if (PreviewFieldsHost != null)
            {
                var pad = ClampPreviewContentPaddingDip(boundSettings.HoverContentPaddingDip);
                PreviewFieldsHost.Margin = new Thickness(pad, pad, pad, pad);
                PreviewFieldsHost.VerticalAlignment = VerticalAlignment.Top;
            }

            UpdatePreviewCoverClip();
        }

        private void PreviewChromeBodyOnSizeChanged(object sender, SizeChangedEventArgs e)
        {
            UpdatePreviewCoverClip();
        }

        private void UpdatePreviewCoverClip()
        {
            if (PreviewChromeBody == null)
            {
                return;
            }

            var w = PreviewChromeBody.ActualWidth;
            var h = PreviewChromeBody.ActualHeight;
            if (w <= 0 || h <= 0)
            {
                PreviewChromeBody.Clip = null;
                return;
            }

            PreviewChromeBody.Clip = new RectangleGeometry(new Rect(0, 0, w, h), 7, 7);
        }

        private ImageSource TryLoadPreviewCover()
        {
            if (cachedPreviewCover != null)
            {
                return cachedPreviewCover;
            }

            var api = boundSettings?.TryGetPlayniteApi();
            if (api == null)
            {
                return null;
            }

            var bmp = HoverBitmapLoader.TryLoadGameArt("BackgroundImage", previewSampleGame, api, 480);
            if (bmp != null)
            {
                cachedPreviewCover = bmp;
                return bmp;
            }

            cachedPreviewCover = TryLoadFirstLibraryArt(api, previewSampleGame, "BackgroundImage");
            return cachedPreviewCover;
        }

        private static int ClampPreviewContentPaddingDip(int pad)
        {
            if (pad < GameHoverDetailsSettings.MinContentPaddingDip)
            {
                return GameHoverDetailsSettings.MinContentPaddingDip;
            }

            return pad > GameHoverDetailsSettings.MaxContentPaddingDip
                ? GameHoverDetailsSettings.MaxContentPaddingDip
                : pad;
        }
    }
}
