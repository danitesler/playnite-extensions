using System;
using System.Collections.Generic;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Media;
using Playnite.SDK;
using Playnite.SDK.Models;

namespace GameHoverDetails
{
    internal sealed class HoverFieldListSource
    {
        public bool OmitEmptyArt { get; set; }

        public Func<string, ImageSource> TryGetGameArt { get; set; }

        public Func<IReadOnlyList<ImageSource>> TryGetPlatformIcons { get; set; }

        public Func<string, string> FormatValue { get; set; }

        public static HoverFieldListSource ForLiveGame(Game game, IPlayniteAPI api)
        {
            return new HoverFieldListSource
            {
                OmitEmptyArt = true,
                TryGetGameArt = key => HoverBitmapLoader.TryLoadGameArt(key, game, api),
                TryGetPlatformIcons = () => LoadPlatformIcons(game, api),
                FormatValue = key => HoverFieldFormatter.Format(key, game, api)
            };
        }

        private static IReadOnlyList<ImageSource> LoadPlatformIcons(Game game, IPlayniteAPI api)
        {
            var list = new List<ImageSource>();
            if (game?.Platforms == null)
            {
                return list;
            }

            foreach (var platform in game.Platforms)
            {
                var iconBmp = HoverBitmapLoader.TryLoadPlatformIcon(platform, api);
                if (iconBmp != null)
                {
                    list.Add(iconBmp);
                }
            }

            return list;
        }
    }

    /// <summary>Single field-list visual tree for live hover and the settings preview.</summary>
    internal static class HoverFieldListBuilder
    {
        private const double LabelToValueGapDip = 4;
        private const double FirstBlockHeaderTopDip = 0;
        private const double StatRowGlyphToTextGapDip = 10;
        private const double HoverIconBoxPx = 40;

        public static void Fill(
            Panel target,
            GameHoverDetailsSettings settings,
            HoverChromePalette palette,
            IReadOnlyList<string> keys,
            double innerMax,
            HoverFieldListSource source)
        {
            if (target == null || settings == null || source == null)
            {
                return;
            }

            target.Children.Clear();
            if (keys == null || keys.Count == 0)
            {
                return;
            }

            var onlyIconSelected = keys.Count == 1 && keys[0] == "Icon";
            var columns = FieldColumnCount(settings);
            if (columns <= 1)
            {
                foreach (var key in keys)
                {
                    AppendKeyedField(
                        target,
                        settings,
                        palette,
                        source,
                        key,
                        innerMax,
                        target.Children.Count == 0,
                        onlyIconSelected,
                        compactCell: false);
                }
            }
            else
            {
                FillMultiColumn(target, settings, palette, source, keys, innerMax, columns, onlyIconSelected);
            }

            TrimLastContentBottomMargin(target);
        }

        private static void FillMultiColumn(
            Panel target,
            GameHoverDetailsSettings settings,
            HoverChromePalette palette,
            HoverFieldListSource source,
            IReadOnlyList<string> keys,
            double innerMax,
            int columns,
            bool onlyIconSelected)
        {
            var gap = FieldBlockSpacingDip(settings);
            var cellInnerMax = Math.Max(16, (innerMax - ((columns - 1) * gap)) / columns);
            var pending = new List<StackPanel>(columns);

            foreach (var key in keys)
            {
                if (IsFullWidthField(key))
                {
                    FlushFieldRow(target, pending, columns, innerMax, gap, settings, palette);
                    AppendKeyedField(
                        target,
                        settings,
                        palette,
                        source,
                        key,
                        innerMax,
                        target.Children.Count == 0,
                        onlyIconSelected,
                        compactCell: false);
                    continue;
                }

                var cell = TryCreateFieldCell(
                    settings,
                    palette,
                    source,
                    key,
                    cellInnerMax,
                    onlyIconSelected);
                if (cell == null)
                {
                    continue;
                }

                pending.Add(cell);
                if (pending.Count >= columns)
                {
                    FlushFieldRow(target, pending, columns, innerMax, gap, settings, palette);
                }
            }

            FlushFieldRow(target, pending, columns, innerMax, gap, settings, palette);
        }

        private static void FlushFieldRow(
            Panel target,
            List<StackPanel> cells,
            int columns,
            double innerMax,
            double gap,
            GameHoverDetailsSettings settings,
            HoverChromePalette palette)
        {
            if (cells.Count == 0)
            {
                return;
            }

            AppendFieldBlockSeparator(target, settings, palette, target.Children.Count == 0);
            var grid = new Grid
            {
                MaxWidth = innerMax,
                HorizontalAlignment = HorizontalAlignment.Stretch
            };

            for (var i = 0; i < columns; i++)
            {
                if (i > 0)
                {
                    grid.ColumnDefinitions.Add(new ColumnDefinition { Width = new GridLength(gap) });
                }

                grid.ColumnDefinitions.Add(new ColumnDefinition { Width = new GridLength(1, GridUnitType.Star) });
            }

            for (var i = 0; i < cells.Count; i++)
            {
                Grid.SetColumn(cells[i], i * 2);
                grid.Children.Add(cells[i]);
            }

            target.Children.Add(grid);
            cells.Clear();
        }

        private static StackPanel TryCreateFieldCell(
            GameHoverDetailsSettings settings,
            HoverChromePalette palette,
            HoverFieldListSource source,
            string key,
            double cellInnerMax,
            bool onlyIconSelected)
        {
            var host = new StackPanel
            {
                VerticalAlignment = VerticalAlignment.Top,
                HorizontalAlignment = HorizontalAlignment.Stretch
            };
            AppendKeyedField(
                host,
                settings,
                palette,
                source,
                key,
                cellInnerMax,
                isFirstBlock: true,
                onlyIconSelected,
                compactCell: true);
            return host.Children.Count == 0 ? null : host;
        }

        private static void AppendKeyedField(
            Panel target,
            GameHoverDetailsSettings settings,
            HoverChromePalette palette,
            HoverFieldListSource source,
            string key,
            double innerMax,
            bool isFirstBlock,
            bool onlyIconSelected,
            bool compactCell)
        {
            switch (key)
            {
                case "Icon":
                case "CoverImage":
                case "BackgroundImage":
                    TryAppendGameArtRow(target, settings, palette, source, key, innerMax, isFirstBlock, onlyIconSelected, compactCell);
                    break;
                case "Platform":
                    AppendPlatformRow(target, settings, palette, source, key, innerMax, isFirstBlock, compactCell);
                    break;
                default:
                    if (ShouldOmitEmptyText(settings, source, key))
                    {
                        return;
                    }

                    AppendTextDetailRow(target, settings, palette, source, key, innerMax, isFirstBlock, compactCell);
                    break;
            }
        }

        /// <summary>
        /// Image-backed fields decide this themselves once they have loaded their art, so a
        /// "Hide empty fields" check never decodes the same bitmap twice per hover.
        /// </summary>
        private static bool ShouldOmitEmptyText(
            GameHoverDetailsSettings settings,
            HoverFieldListSource source,
            string key)
        {
            if (settings == null || source == null || !settings.HideEmptyFields)
            {
                return false;
            }

            var valueText = source.FormatValue != null ? source.FormatValue(key) : null;
            return string.IsNullOrWhiteSpace(valueText) || valueText == HoverLoc.Empty;
        }

        private static bool IsFullWidthField(string key)
        {
            return key == "CoverImage" || key == "BackgroundImage" || key == "Description";
        }

        private static int FieldColumnCount(GameHoverDetailsSettings settings)
        {
            var n = settings.HoverFieldColumnCount;
            if (n < GameHoverDetailsSettings.MinFieldColumnCount)
            {
                return GameHoverDetailsSettings.MinFieldColumnCount;
            }

            return n > GameHoverDetailsSettings.MaxFieldColumnCount
                ? GameHoverDetailsSettings.MaxFieldColumnCount
                : n;
        }

        private static double GlyphChipSizeDip(GameHoverDetailsSettings settings)
        {
            var s = settings.HoverIconChipOuterSizeDip;
            if (s < GameHoverDetailsSettings.MinIconChipSizeDip)
            {
                return GameHoverDetailsSettings.MinIconChipSizeDip;
            }

            return s;
        }

        private static double FieldBlockSpacingDip(GameHoverDetailsSettings settings)
        {
            var s = settings.HoverFieldBlockSpacingDip;
            if (s < 4)
            {
                return 4;
            }

            return s > 36 ? 36 : s;
        }

        private static double FieldBlockSpacingHalfDip(GameHoverDetailsSettings settings)
        {
            return FieldBlockSpacingDip(settings) * 0.5;
        }

        private static void TrimLastContentBottomMargin(Panel panel)
        {
            if (panel.Children.Count == 0)
            {
                return;
            }

            if (!(panel.Children[panel.Children.Count - 1] is FrameworkElement last))
            {
                return;
            }

            var m = last.Margin;
            if (m.Bottom <= 0.01)
            {
                return;
            }

            last.Margin = new Thickness(m.Left, m.Top, m.Right, 0);
        }

        private static void AppendFieldBlockSeparator(Panel target, GameHoverDetailsSettings settings, HoverChromePalette palette, bool isFirstBlock)
        {
            if (isFirstBlock)
            {
                return;
            }

            var pad = FieldBlockSpacingHalfDip(settings);
            var hideLine = settings.HideFieldDividers;
            target.Children.Add(
                new Border
                {
                    Height = hideLine ? 0 : 1,
                    Margin = new Thickness(0, pad, 0, pad),
                    Background = hideLine ? Brushes.Transparent : palette.Separator,
                    IsHitTestVisible = false
                });
        }

        private static Border CreateGlyphChip(GameHoverDetailsSettings settings, HoverChromePalette palette, string glyph)
        {
            var chip = GlyphChipSizeDip(settings);
            var glyphTb = new TextBlock
            {
                Text = glyph,
                FontFamily = HoverFieldCatalog.GetGlyphFontFamily(settings.HoverIconStyle),
                FontSize = settings.HoverIconGlyphFontSize,
                FontWeight = FontWeights.Normal,
                Foreground = palette.GlyphChipGlyph,
                HorizontalAlignment = HorizontalAlignment.Center,
                VerticalAlignment = VerticalAlignment.Center,
                FlowDirection = FlowDirection.LeftToRight,
                IsHitTestVisible = false
            };

            return new Border
            {
                Width = chip,
                Height = chip,
                CornerRadius = settings.ResolveIconChipCornerRadius(),
                Background = palette.GlyphChipBackground,
                Child = glyphTb,
                VerticalAlignment = VerticalAlignment.Center,
                HorizontalAlignment = HorizontalAlignment.Left,
                FlowDirection = FlowDirection.LeftToRight,
                IsHitTestVisible = false
            };
        }

        private static string ValueText(HoverFieldListSource source, string key)
        {
            var text = source.FormatValue != null ? source.FormatValue(key) : null;
            return string.IsNullOrEmpty(text) ? HoverLoc.Empty : text;
        }

        private static void AppendTextDetailInner(
            Panel target,
            GameHoverDetailsSettings settings,
            HoverChromePalette palette,
            HoverFieldListSource source,
            string key,
            double innerMax,
            bool isFirstBlock,
            bool compactCell)
        {
            var showTitle = !settings.HideFieldTitlesInHover;
            var useInlineGlyph = settings.ShowFieldInlineIconsInHover && !HoverFieldCatalog.IsGameArtImageField(key);
            var labelText = HoverFieldCatalog.GetDisplayName(key);
            var valueText = ValueText(source, key);
            var topInset = compactCell ? 0 : (isFirstBlock ? FirstBlockHeaderTopDip : FieldBlockSpacingHalfDip(settings));
            var bottomInset = compactCell ? 0 : FieldBlockSpacingHalfDip(settings);
            var chipSize = GlyphChipSizeDip(settings);
            var textMaxStat = Math.Max(16, innerMax - chipSize - StatRowGlyphToTextGapDip);
            var bodySize = settings.HoverBodyFontSize;
            var titleSize = settings.HoverTitleFontSize;

            if (showTitle && useInlineGlyph)
            {
                var row = new Grid
                {
                    MaxWidth = innerMax,
                    Margin = new Thickness(0, topInset, 0, bottomInset)
                };
                row.ColumnDefinitions.Add(new ColumnDefinition { Width = new GridLength(chipSize) });
                row.ColumnDefinitions.Add(new ColumnDefinition { Width = new GridLength(1, GridUnitType.Star) });

                var chip = CreateGlyphChip(settings, palette, HoverFieldCatalog.GetGlyph(key, settings.HoverIconStyle));
                Grid.SetColumn(chip, 0);

                var label = new TextBlock { Margin = new Thickness(0, 0, 0, LabelToValueGapDip) };
                HoverDetailValuePresenter.ConfigureFieldLabelTextBlock(label, textMaxStat, palette.LabelText, titleSize);
                HoverDetailValuePresenter.SetHeaderText(label, labelText, textMaxStat);

                var body = new TextBlock();
                HoverDetailValuePresenter.ConfigureBodyTextBlock(body, textMaxStat, palette.BodyText, bodySize);
                HoverDetailValuePresenter.SetBodyContent(body, valueText);

                var textCol = new StackPanel { Margin = new Thickness(StatRowGlyphToTextGapDip, 0, 0, 0) };
                textCol.Children.Add(label);
                textCol.Children.Add(body);
                Grid.SetColumn(textCol, 1);

                row.Children.Add(chip);
                row.Children.Add(textCol);
                target.Children.Add(row);
                return;
            }

            if (showTitle && !useInlineGlyph)
            {
                var label = new TextBlock { Margin = new Thickness(0, topInset, 0, LabelToValueGapDip) };
                HoverDetailValuePresenter.ConfigureFieldLabelTextBlock(label, innerMax, palette.LabelText, titleSize);
                HoverDetailValuePresenter.SetHeaderText(label, labelText, innerMax);

                var body = new TextBlock { Margin = new Thickness(0, 0, 0, bottomInset) };
                HoverDetailValuePresenter.ConfigureBodyTextBlock(body, innerMax, palette.BodyText, bodySize);
                HoverDetailValuePresenter.SetBodyContent(body, valueText);

                target.Children.Add(label);
                target.Children.Add(body);
                return;
            }

            if (useInlineGlyph)
            {
                var row = new Grid
                {
                    MaxWidth = innerMax,
                    Margin = new Thickness(0, topInset, 0, bottomInset)
                };
                row.ColumnDefinitions.Add(new ColumnDefinition { Width = new GridLength(chipSize) });
                row.ColumnDefinitions.Add(new ColumnDefinition { Width = new GridLength(1, GridUnitType.Star) });

                var chip = CreateGlyphChip(settings, palette, HoverFieldCatalog.GetGlyph(key, settings.HoverIconStyle));
                Grid.SetColumn(chip, 0);

                var body = new TextBlock
                {
                    VerticalAlignment = VerticalAlignment.Center
                };
                HoverDetailValuePresenter.ConfigureBodyTextBlock(body, textMaxStat, palette.BodyText, bodySize);
                HoverDetailValuePresenter.SetBodyContent(body, valueText);
                Grid.SetColumn(body, 1);
                body.Margin = new Thickness(StatRowGlyphToTextGapDip, 0, 0, 0);

                row.Children.Add(chip);
                row.Children.Add(body);
                target.Children.Add(row);
                return;
            }

            var bodyOnly = new TextBlock
            {
                Margin = new Thickness(0, topInset, 0, bottomInset)
            };
            HoverDetailValuePresenter.ConfigureBodyTextBlock(bodyOnly, innerMax, palette.BodyText, bodySize);
            HoverDetailValuePresenter.SetBodyContent(bodyOnly, valueText);
            target.Children.Add(bodyOnly);
        }

        private static void AppendTextDetailRow(
            Panel target,
            GameHoverDetailsSettings settings,
            HoverChromePalette palette,
            HoverFieldListSource source,
            string key,
            double innerMax,
            bool isFirstBlock,
            bool compactCell)
        {
            if (!compactCell)
            {
                AppendFieldBlockSeparator(target, settings, palette, isFirstBlock);
            }

            AppendTextDetailInner(target, settings, palette, source, key, innerMax, isFirstBlock, compactCell);
        }

        private static void TryAppendGameArtRow(
            Panel target,
            GameHoverDetailsSettings settings,
            HoverChromePalette palette,
            HoverFieldListSource source,
            string key,
            double innerMax,
            bool isFirstBlock,
            bool showGameNameBesideIcon,
            bool compactCell)
        {
            var bmp = source.TryGetGameArt != null ? source.TryGetGameArt(key) : null;
            if (bmp == null)
            {
                if (source.OmitEmptyArt || settings.HideEmptyFields)
                {
                    return;
                }

                AppendTextDetailRow(target, settings, palette, source, key, innerMax, isFirstBlock, compactCell);
                return;
            }

            if (!compactCell)
            {
                AppendFieldBlockSeparator(target, settings, palette, isFirstBlock);
            }

            double maxW;
            double maxH;
            switch (key)
            {
                case "Icon":
                    maxW = HoverIconBoxPx;
                    maxH = HoverIconBoxPx;
                    break;
                case "CoverImage":
                    maxW = innerMax;
                    maxH = 220;
                    break;
                default:
                    maxW = innerMax;
                    maxH = 140;
                    break;
            }

            var top = compactCell ? 0 : (isFirstBlock ? FirstBlockHeaderTopDip : FieldBlockSpacingHalfDip(settings));
            var bottom = compactCell ? 0 : FieldBlockSpacingHalfDip(settings);

            if (key == "Icon" && showGameNameBesideIcon)
            {
                var textMax = Math.Max(16, innerMax - HoverIconBoxPx - StatRowGlyphToTextGapDip);
                var row = new Grid
                {
                    MaxWidth = innerMax,
                    Margin = new Thickness(0, top, 0, bottom)
                };
                row.ColumnDefinitions.Add(new ColumnDefinition { Width = GridLength.Auto });
                row.ColumnDefinitions.Add(new ColumnDefinition { Width = new GridLength(1, GridUnitType.Star) });

                var img = new Image
                {
                    Source = bmp,
                    Stretch = Stretch.Uniform,
                    MaxWidth = maxW,
                    MaxHeight = maxH,
                    Width = HoverIconBoxPx,
                    Height = HoverIconBoxPx,
                    HorizontalAlignment = HorizontalAlignment.Left,
                    VerticalAlignment = VerticalAlignment.Center,
                    IsHitTestVisible = false
                };
                Grid.SetColumn(img, 0);

                var nameTb = new TextBlock
                {
                    Margin = new Thickness(StatRowGlyphToTextGapDip, 0, 0, 0),
                    VerticalAlignment = VerticalAlignment.Center
                };
                HoverDetailValuePresenter.ConfigureBodyTextBlock(nameTb, textMax, palette.BodyText, settings.HoverBodyFontSize);
                HoverDetailValuePresenter.SetBodyContent(nameTb, ValueText(source, "Name"));
                Grid.SetColumn(nameTb, 1);

                row.Children.Add(img);
                row.Children.Add(nameTb);
                target.Children.Add(row);
                return;
            }

            var imgOnly = new Image
            {
                Source = bmp,
                Stretch = Stretch.Uniform,
                StretchDirection = StretchDirection.DownOnly,
                MaxWidth = maxW,
                MaxHeight = maxH,
                HorizontalAlignment = HorizontalAlignment.Left,
                Margin = new Thickness(0, top, 0, bottom),
                IsHitTestVisible = false
            };

            target.Children.Add(imgOnly);
        }

        private static void AppendPlatformRow(
            Panel target,
            GameHoverDetailsSettings settings,
            HoverChromePalette palette,
            HoverFieldListSource source,
            string key,
            double innerMax,
            bool isFirstBlock,
            bool compactCell)
        {
            var icons = source.TryGetPlatformIcons != null
                ? source.TryGetPlatformIcons()
                : null;
            if (icons == null || icons.Count == 0)
            {
                if (ShouldOmitEmptyText(settings, source, key))
                {
                    return;
                }

                AppendTextDetailRow(target, settings, palette, source, key, innerMax, isFirstBlock, compactCell);
                return;
            }

            if (!compactCell)
            {
                AppendFieldBlockSeparator(target, settings, palette, isFirstBlock);
            }

            var showTitle = !settings.HideFieldTitlesInHover;
            var labelText = HoverFieldCatalog.GetDisplayName(key);
            var topInset = compactCell ? 0 : (isFirstBlock ? FirstBlockHeaderTopDip : FieldBlockSpacingHalfDip(settings));
            var bottomInset = compactCell ? 0 : FieldBlockSpacingHalfDip(settings);
            var panel = new StackPanel
            {
                Orientation = Orientation.Horizontal,
                HorizontalAlignment = HorizontalAlignment.Left,
                MaxWidth = innerMax,
                Margin = new Thickness(0, topInset, 0, bottomInset)
            };

            foreach (var iconBmp in icons)
            {
                if (iconBmp == null)
                {
                    continue;
                }

                panel.Children.Add(
                    new Image
                    {
                        Source = iconBmp,
                        Height = HoverIconBoxPx,
                        Width = HoverIconBoxPx,
                        MaxHeight = HoverIconBoxPx,
                        MaxWidth = HoverIconBoxPx,
                        Margin = new Thickness(0, 0, 6, 0),
                        Stretch = Stretch.Uniform,
                        HorizontalAlignment = HorizontalAlignment.Left
                    });
            }

            if (panel.Children.Count == 0)
            {
                AppendTextDetailInner(target, settings, palette, source, key, innerMax, isFirstBlock, compactCell);
                return;
            }

            if (showTitle)
            {
                var label = new TextBlock { Margin = new Thickness(0, topInset, 0, LabelToValueGapDip) };
                HoverDetailValuePresenter.ConfigureFieldLabelTextBlock(label, innerMax, palette.LabelText, settings.HoverTitleFontSize);
                HoverDetailValuePresenter.SetHeaderText(label, labelText, innerMax);
                target.Children.Add(label);
                panel.Margin = new Thickness(0, 0, 0, bottomInset);
            }

            target.Children.Add(panel);
        }
    }
}
