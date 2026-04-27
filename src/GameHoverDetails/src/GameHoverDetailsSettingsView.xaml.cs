using System;
using System.Collections.Generic;
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
    public partial class GameHoverDetailsSettingsView : UserControl
    {
        private const double InnerScrollEpsilon = 0.5;

        private GameHoverDetailsSettings boundSettings;
        private bool suppressAddComboSelectionChanged;
        private Game previewSampleGame;

        private sealed class AddFieldOption
        {
            public AddFieldOption(string key, string displayName)
            {
                Key = key;
                DisplayName = displayName;
            }

            public string Key { get; }
            public string DisplayName { get; }
            public string SettingsGlyph => HoverFieldCatalog.GetSettingsGlyph(Key);
        }

        private sealed class EnabledFieldRow
        {
            public EnabledFieldRow(string key, string displayName, int index, int count)
            {
                Key = key;
                DisplayName = displayName;
                Index = index;
                Count = count;
            }

            public string Key { get; }
            public string DisplayName { get; }
            public int Index { get; }
            public int Count { get; }
            public bool CanMoveUp => Index > 0;
            public bool CanMoveDown => Index < Count - 1;
            public string SettingsGlyph => HoverFieldCatalog.GetSettingsGlyph(Key);
        }

        private sealed class PreviewFieldRow
        {
            public PreviewFieldRow(
                string fieldKey,
                string displayName,
                string sampleValue,
                string glyphText,
                bool showInlineGlyph,
                Thickness outerMargin,
                ImageSource previewArt,
                double previewInnerContentWidthDip)
            {
                DisplayName = displayName;
                SampleValue = sampleValue ?? string.Empty;
                GlyphText = glyphText;
                ShowInlineGlyph = showInlineGlyph;
                OuterMargin = outerMargin;
                PreviewArt = previewArt;
                if (previewArt != null)
                {
                    switch (fieldKey)
                    {
                        case "Icon":
                            PreviewArtMaxWidth = 40;
                            PreviewArtMaxHeight = 40;
                            break;
                        case "CoverImage":
                            PreviewArtMaxWidth = previewInnerContentWidthDip;
                            PreviewArtMaxHeight = 220;
                            break;
                        default:
                            PreviewArtMaxWidth = previewInnerContentWidthDip;
                            PreviewArtMaxHeight = 140;
                            break;
                    }
                }
            }

            public string DisplayName { get; }
            public string SampleValue { get; }
            public string GlyphText { get; }
            public bool ShowInlineGlyph { get; }
            public Thickness OuterMargin { get; }
            public ImageSource PreviewArt { get; }
            public bool ShowPreviewArt => PreviewArt != null;
            public bool ShowSampleText => !ShowPreviewArt || !string.IsNullOrWhiteSpace(SampleValue);
            public double PreviewArtMaxWidth { get; }
            public double PreviewArtMaxHeight { get; }

            /// <summary>Game art in the real hover is full inner width; no 22px glyph gutter.</summary>
            public int ValueContentColumn => ShowPreviewArt ? 0 : 1;
            public int ValueContentColumnSpan => ShowPreviewArt ? 2 : 1;
        }

        public GameHoverDetailsSettingsView()
        {
            InitializeComponent();
        }

        private void UserControl_Loaded(object sender, RoutedEventArgs e)
        {
            if (FieldsList != null)
            {
                FieldsList.PreviewMouseWheel += FieldsList_PreviewMouseWheel;
            }

            boundSettings = DataContext as GameHoverDetailsSettings;
            if (boundSettings == null)
            {
                return;
            }

            boundSettings.PropertyChanged -= BoundSettingsOnPropertyChanged;
            boundSettings.PropertyChanged += BoundSettingsOnPropertyChanged;
            TryPickPreviewSampleGame();
            RefreshFieldsList();
            RefreshAddCombo();
            RefreshPreviewFields();
        }

        private void UserControl_Unloaded(object sender, RoutedEventArgs e)
        {
            if (FieldsList != null)
            {
                FieldsList.PreviewMouseWheel -= FieldsList_PreviewMouseWheel;
            }

            if (boundSettings != null)
            {
                boundSettings.PropertyChanged -= BoundSettingsOnPropertyChanged;
            }

            boundSettings = null;
            previewSampleGame = null;
        }

        private void FieldsList_PreviewMouseWheel(object sender, MouseWheelEventArgs e)
        {
            if (RootScrollViewer == null || !(sender is ListBox listBox))
            {
                return;
            }

            var inner = FindVisualChild<ScrollViewer>(listBox);
            if (inner == null || inner.ScrollableHeight <= InnerScrollEpsilon)
            {
                var delta = e.Delta;
                var wheelLine = Mouse.MouseWheelDeltaForOneLine;
                if (wheelLine == 0)
                {
                    wheelLine = 120;
                }

                var step = delta / (double)wheelLine * 48.0;
                var next = RootScrollViewer.VerticalOffset - step;
                if (next < 0)
                {
                    next = 0;
                }
                else if (next > RootScrollViewer.ScrollableHeight)
                {
                    next = RootScrollViewer.ScrollableHeight;
                }

                RootScrollViewer.ScrollToVerticalOffset(next);
                e.Handled = true;
            }
        }

        private void BoundSettingsOnPropertyChanged(object o, System.ComponentModel.PropertyChangedEventArgs e)
        {
            if (e.PropertyName == nameof(GameHoverDetailsSettings.SelectedFieldKeys) ||
                e.PropertyName == nameof(GameHoverDetailsSettings.DisabledFieldKeysOrder) ||
                e.PropertyName == nameof(GameHoverDetailsSettings.SelectedFieldCount))
            {
                RefreshFieldsList();
                RefreshAddCombo();
                RefreshPreviewFields();
                return;
            }

            if (e.PropertyName == nameof(GameHoverDetailsSettings.HideFieldTitlesInHover) ||
                e.PropertyName == nameof(GameHoverDetailsSettings.HoverTitlesInHover) ||
                e.PropertyName == nameof(GameHoverDetailsSettings.ShowFieldInlineIconsInHover) ||
                e.PropertyName == nameof(GameHoverDetailsSettings.HoverFieldBlockSpacingDip))
            {
                RefreshPreviewFields();
            }
        }

        private void RefreshPreviewFields()
        {
            if (PreviewFieldsList == null || boundSettings == null)
            {
                return;
            }

            var spacing = (double)System.Math.Max(4, System.Math.Min(36, boundSettings.HoverFieldBlockSpacingDip));
            var showGlyph = boundSettings.ShowFieldInlineIconsInHover;
            var api = boundSettings.TryGetPlayniteApi();
            var game = previewSampleGame;
            var previewChromeWidth = System.Math.Min(216, System.Math.Max(120, boundSettings.HoverWidth));
            var previewInnerContentWidth = System.Math.Max(48.0, previewChromeWidth - 24.0);
            var rows = new List<PreviewFieldRow>();
            var index = 0;
            foreach (var key in boundSettings.SelectedFieldKeys)
            {
                if (!HoverFieldCatalog.IsKnownKey(key))
                {
                    continue;
                }

                var displayName = HoverFieldCatalog.GetDisplayName(key);
                var glyph = HoverFieldCatalog.GetSettingsGlyph(key);
                var inline = showGlyph && !HoverFieldCatalog.IsGameArtImageField(key);
                var margin = index == 0 ? new Thickness(0) : new Thickness(0, spacing, 0, 0);

                string sample;
                ImageSource art = null;
                if (game != null && api != null)
                {
                    if (HoverFieldCatalog.IsGameArtImageField(key))
                    {
                        art = HoverBitmapLoader.TryLoadGameArt(key, game, api);
                        if (key == "Icon" && art == null)
                        {
                            art = TryLoadFallbackLibraryGameIcon(api, game);
                        }

                        sample = art != null ? string.Empty : HoverPreviewSampleText.ForKey(key);
                    }
                    else
                    {
                        var raw = HoverFieldFormatter.Format(key, game, api);
                        var preview = HoverPreviewSampleText.FormatValueForPreview(key, raw);
                        sample = HoverPreviewSampleText.LooksLikeMissingData(preview)
                            ? HoverPreviewSampleText.ForKey(key)
                            : preview;
                    }
                }
                else
                {
                    sample = HoverPreviewSampleText.ForKey(key);
                }

                rows.Add(new PreviewFieldRow(key, displayName, sample, glyph, inline, margin, art, previewInnerContentWidth));
                index++;
            }

            PreviewFieldsList.ItemsSource = rows;
        }

        /// <summary>
        /// When the preview game has no usable icon, pick a random other library game that has an icon path and load it.
        /// </summary>
        private static ImageSource TryLoadFallbackLibraryGameIcon(IPlayniteAPI api, Game previewGame)
        {
            if (api?.Database?.Games == null)
            {
                return null;
            }

            var rng = new Random(Environment.TickCount ^ unchecked((int)0x9E3779B9));
            Game donor = null;
            var n = 0;
            foreach (var g in api.Database.Games)
            {
                if (g == null || string.IsNullOrWhiteSpace(g.Icon))
                {
                    continue;
                }

                if (previewGame != null && g.Id == previewGame.Id)
                {
                    continue;
                }

                n++;
                if (rng.Next(n) == 0)
                {
                    donor = g;
                }
            }

            if (donor != null)
            {
                var bmp = HoverBitmapLoader.TryLoadGameArt("Icon", donor, api);
                if (bmp != null)
                {
                    return bmp;
                }
            }

            foreach (var g in api.Database.Games)
            {
                if (g == null || string.IsNullOrWhiteSpace(g.Icon))
                {
                    continue;
                }

                if (previewGame != null && g.Id == previewGame.Id)
                {
                    continue;
                }

                if (donor != null && g.Id == donor.Id)
                {
                    continue;
                }

                var b = HoverBitmapLoader.TryLoadGameArt("Icon", g, api);
                if (b != null)
                {
                    return b;
                }
            }

            return null;
        }

        /// <summary>Uniform random game, O(1) extra memory (reservoir).</summary>
        private void TryPickPreviewSampleGame()
        {
            previewSampleGame = null;
            if (boundSettings == null)
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
                var rng = new Random(Environment.TickCount);
                Game chosen = null;
                var n = 0;
                foreach (var g in games)
                {
                    if (g == null)
                    {
                        continue;
                    }

                    n++;
                    if (rng.Next(n) == 0)
                    {
                        chosen = g;
                    }
                }

                previewSampleGame = n > 0 ? chosen : null;
            }
            catch
            {
                previewSampleGame = null;
            }
        }

        private void RefreshFieldsList()
        {
            if (FieldsList == null || boundSettings == null)
            {
                return;
            }

            var keys = boundSettings.SelectedFieldKeys;
            var n = keys.Count;
            FieldsList.ItemsSource = keys
                .Select((k, i) => new EnabledFieldRow(k, HoverFieldCatalog.GetDisplayName(k), i, n))
                .ToList();
        }

        private void RefreshAddCombo()
        {
            if (AddFieldCombo == null || boundSettings == null)
            {
                return;
            }

            suppressAddComboSelectionChanged = true;
            try
            {
                var options = boundSettings.GetAddableKeys()
                    .Select(k => new AddFieldOption(k, HoverFieldCatalog.GetDisplayName(k)))
                    .OrderBy(o => o.DisplayName, StringComparer.CurrentCultureIgnoreCase)
                    .ToList();
                AddFieldCombo.ItemsSource = options;
                AddFieldCombo.SelectedIndex = -1;
                AddFieldCombo.IsEnabled = options.Count > 0;
            }
            finally
            {
                suppressAddComboSelectionChanged = false;
            }
        }

        private void AddFieldCombo_SelectionChanged(object sender, SelectionChangedEventArgs e)
        {
            if (suppressAddComboSelectionChanged || boundSettings == null)
            {
                return;
            }

            if (!(AddFieldCombo.SelectedItem is AddFieldOption opt))
            {
                return;
            }

            boundSettings.EnableFieldAt(opt.Key, boundSettings.SelectedFieldKeys.Count);

            // Reopen after the combo finishes closing so the user can add several fields in one go.
            Dispatcher.BeginInvoke(
                DispatcherPriority.ContextIdle,
                new Action(() =>
                {
                    if (AddFieldCombo == null || boundSettings == null)
                    {
                        return;
                    }

                    if (!AddFieldCombo.IsEnabled || AddFieldCombo.Items.Count == 0)
                    {
                        return;
                    }

                    AddFieldCombo.Focus();
                    AddFieldCombo.IsDropDownOpen = true;
                }));
        }

        private void EnabledMoveUp_Click(object sender, RoutedEventArgs e)
        {
            if (boundSettings == null || !(sender is FrameworkElement fe) || !(fe.DataContext is EnabledFieldRow row))
            {
                return;
            }

            if (row.Index <= 0)
            {
                return;
            }

            boundSettings.MoveEnabled(row.Index, row.Index - 1);
        }

        private void EnabledMoveDown_Click(object sender, RoutedEventArgs e)
        {
            if (boundSettings == null || !(sender is FrameworkElement fe) || !(fe.DataContext is EnabledFieldRow row))
            {
                return;
            }

            if (row.Index >= row.Count - 1)
            {
                return;
            }

            boundSettings.MoveEnabled(row.Index, row.Index + 2);
        }

        private void EnabledRemove_Click(object sender, RoutedEventArgs e)
        {
            if (boundSettings == null || !(sender is FrameworkElement fe) || !(fe.DataContext is EnabledFieldRow row))
            {
                return;
            }

            boundSettings.DisableFieldAt(row.Index, 0);
        }

        private static T FindVisualChild<T>(DependencyObject parent)
            where T : DependencyObject
        {
            if (parent == null)
            {
                return null;
            }

            var count = VisualTreeHelper.GetChildrenCount(parent);
            for (var i = 0; i < count; i++)
            {
                var child = VisualTreeHelper.GetChild(parent, i);
                if (child is T match)
                {
                    return match;
                }

                var nested = FindVisualChild<T>(child);
                if (nested != null)
                {
                    return nested;
                }
            }

            return null;
        }
    }
}
