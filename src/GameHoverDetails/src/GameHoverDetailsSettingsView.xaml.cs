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
    public partial class GameHoverDetailsSettingsView : UserControl
    {
        private const double InnerScrollEpsilon = 0.5;

        private GameHoverDetailsSettings boundSettings;
        private bool suppressAddComboSelectionChanged;
        /// <summary>Set when an add was triggered from item PreviewMouseDown so matching PreviewMouseUp does not dismiss the dropdown.</summary>
        private bool addFieldComboItemHandledMouseDown;
        private bool fieldsListWheelHooked;
        private Game previewSampleGame;

        /// <summary>Stable ItemsSource for Add field — sync in place so the open dropdown does not close/reopen on each add.</summary>
        private readonly ObservableCollection<AddFieldOption> addFieldComboItems = new ObservableCollection<AddFieldOption>();

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
                bool showFieldTitleRow,
                bool showTopSeparator,
                double separatorPadDip,
                bool isLastBlock,
                double fieldBlockSpacingDip,
                ImageSource previewArt,
                double previewInnerContentWidthDip,
                bool showIconBesideGameName,
                string besideIconGameName)
            {
                DisplayName = displayName;
                SampleValue = sampleValue ?? string.Empty;
                GlyphText = glyphText;
                ShowInlineGlyph = showInlineGlyph;
                ShowFieldTitleRow = showFieldTitleRow;
                ShowTopSeparator = showTopSeparator;
                SeparatorPadDip = separatorPadDip;
                ContentBlockMargin = new Thickness(0, 0, 0, isLastBlock ? 0 : fieldBlockSpacingDip * 0.5);
                PreviewArt = previewArt;
                ShowIconBesideGameName = showIconBesideGameName;
                BesideIconGameName = besideIconGameName ?? string.Empty;
                BesideIconNameMaxWidth = showIconBesideGameName
                    ? System.Math.Max(48.0, previewInnerContentWidthDip - 40.0 - 10.0)
                    : 0;
                StatTextMaxWidth = System.Math.Max(48.0, previewInnerContentWidthDip - 32.0 - 10.0);
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
            /// <summary>Title row matches hover: off for game-art keys (Icon, cover, background).</summary>
            public bool ShowFieldTitleRow { get; }
            public bool ShowTopSeparator { get; }
            public double SeparatorPadDip { get; }
            /// <summary>Bottom half-inset after each block (pairs with separator + next block top half); zero on last row (matches hover after <c>TrimLastContentBottomMargin</c>).</summary>
            public Thickness ContentBlockMargin { get; }
            public Thickness SeparatorMargin => new Thickness(0, SeparatorPadDip, 0, SeparatorPadDip);
            public ImageSource PreviewArt { get; }
            public bool ShowPreviewArt => PreviewArt != null;
            public bool ShowSampleText => !ShowPreviewArt || !string.IsNullOrWhiteSpace(SampleValue);
            public double PreviewArtMaxWidth { get; }
            public double PreviewArtMaxHeight { get; }
            public double StatTextMaxWidth { get; }
            /// <summary>When Icon is the only selected field and art loads, hover shows game name beside the icon (vertically centered).</summary>
            public bool ShowIconBesideGameName { get; }
            public string BesideIconGameName { get; }
            public double BesideIconNameMaxWidth { get; }
            public bool ShowArtVerticalStack => ShowPreviewArt && !ShowIconBesideGameName;
            public bool ShowIconBesideGameNameRow => ShowIconBesideGameName;

            public bool ShowStatRowLayout => !ShowPreviewArt && ShowFieldTitleRow && ShowInlineGlyph;

            public bool ShowTitleBodyNoIconLayout => !ShowPreviewArt && ShowFieldTitleRow && !ShowInlineGlyph;

            public bool ShowChipValueNoTitleLayout => !ShowPreviewArt && !ShowFieldTitleRow && ShowInlineGlyph;

            public bool ShowValueOnlyLayout => !ShowPreviewArt && !ShowFieldTitleRow && !ShowInlineGlyph;

            private const double FieldTitleToValueGapDip = 4;

            /// <summary>Muted title row: after a separator, top padding matches hover <c>AppendTextDetailInner</c> label <c>topInset</c> (half of field spacing).</summary>
            public Thickness PreviewFieldTitleMargin =>
                new Thickness(0, ShowTopSeparator ? SeparatorPadDip : 0, 0, FieldTitleToValueGapDip);

            /// <summary>Stat/chip row: whole grid gets top inset after a divider (hover applies <c>topInset</c> on the outer grid).</summary>
            public Thickness ContinuationRowOutermostMargin =>
                new Thickness(0, ShowTopSeparator ? SeparatorPadDip : 0, 0, 0);

        }

        public GameHoverDetailsSettingsView()
        {
            InitializeComponent();
        }

        private void UserControl_Loaded(object sender, RoutedEventArgs e)
        {
            if (FieldsList != null && !fieldsListWheelHooked)
            {
                FieldsList.PreviewMouseWheel += FieldsList_PreviewMouseWheel;
                fieldsListWheelHooked = true;
            }

            TryAttachSettings();
        }

        private void UserControl_DataContextChanged(object sender, DependencyPropertyChangedEventArgs e)
        {
            TryAttachSettings();
        }

        /// <summary>Subscribe to settings and refresh lists; safe if <see cref="DataContext"/> is set after <see cref="UserControl.Loaded"/>.</summary>
        private void TryAttachSettings()
        {
            if (boundSettings != null)
            {
                boundSettings.PropertyChanged -= BoundSettingsOnPropertyChanged;
                boundSettings = null;
            }

            var s = DataContext as GameHoverDetailsSettings;
            if (s == null)
            {
                return;
            }

            boundSettings = s;
            s.PropertyChanged += BoundSettingsOnPropertyChanged;
            TryPickPreviewSampleGame();
            RefreshFieldsList();
            RefreshAddCombo();
            RefreshPreviewFields();
        }

        private void UserControl_Unloaded(object sender, RoutedEventArgs e)
        {
            if (FieldsList != null && fieldsListWheelHooked)
            {
                FieldsList.PreviewMouseWheel -= FieldsList_PreviewMouseWheel;
                fieldsListWheelHooked = false;
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
            if (RootScrollViewer == null || !(sender is FrameworkElement listHost))
            {
                return;
            }

            var inner = FindVisualChild<ScrollViewer>(listHost);
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
            var showTitles = boundSettings.HoverTitlesInHover;
            var api = boundSettings.TryGetPlayniteApi();
            var game = previewSampleGame;
            var previewChromeWidth = System.Math.Min(216, System.Math.Max(120, boundSettings.HoverWidth));
            const double chromeHorizontalPadding = 28.0;
            var previewInnerContentWidth = System.Math.Max(48.0, previewChromeWidth - chromeHorizontalPadding);
            var separatorPad = spacing * 0.5;
            var rows = new List<PreviewFieldRow>();
            var keyList = boundSettings.SelectedFieldKeys.Where(HoverFieldCatalog.IsKnownKey).ToList();
            var iconOnlyBesideName = keyList.Count == 1 && keyList[0] == "Icon";
            for (var i = 0; i < keyList.Count; i++)
            {
                var key = keyList[i];
                var isLastBlock = i == keyList.Count - 1;

                var displayName = HoverFieldCatalog.GetDisplayName(key);
                var glyph = HoverFieldCatalog.GetSettingsGlyph(key);
                var inline = showGlyph && !HoverFieldCatalog.IsGameArtImageField(key);
                var showFieldTitleRow = showTitles && !HoverFieldCatalog.IsGameArtImageField(key);
                var showTopSeparator = i > 0;

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

                var showBesideName = iconOnlyBesideName && key == "Icon" && art != null;
                var besideName = !showBesideName
                    ? string.Empty
                    : game != null
                        ? HoverFieldFormatter.Format("Name", game, api)
                        : HoverPreviewSampleText.ForKey("Name");

                rows.Add(new PreviewFieldRow(
                    key,
                    displayName,
                    sample,
                    glyph,
                    inline,
                    showFieldTitleRow,
                    showTopSeparator,
                    separatorPad,
                    isLastBlock,
                    spacing,
                    art,
                    previewInnerContentWidth,
                    showBesideName,
                    besideName));
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

            if (!ReferenceEquals(AddFieldCombo.ItemsSource, addFieldComboItems))
            {
                AddFieldCombo.ItemsSource = addFieldComboItems;
            }

            suppressAddComboSelectionChanged = true;
            try
            {
                var desired = boundSettings.GetAddableKeys()
                    .Select(k => new AddFieldOption(k, HoverFieldCatalog.GetDisplayName(k)))
                    .OrderBy(o => o.DisplayName, StringComparer.CurrentCultureIgnoreCase)
                    .ToList();

                var desiredKeys = new HashSet<string>(desired.Select(o => o.Key));
                for (var i = addFieldComboItems.Count - 1; i >= 0; i--)
                {
                    if (!desiredKeys.Contains(addFieldComboItems[i].Key))
                    {
                        addFieldComboItems.RemoveAt(i);
                    }
                }

                var currentKeys = new HashSet<string>(addFieldComboItems.Select(o => o.Key));
                foreach (var opt in desired)
                {
                    if (currentKeys.Contains(opt.Key))
                    {
                        continue;
                    }

                    var insert = 0;
                    while (insert < addFieldComboItems.Count &&
                           string.Compare(
                               addFieldComboItems[insert].DisplayName,
                               opt.DisplayName,
                               StringComparison.CurrentCultureIgnoreCase) < 0)
                    {
                        insert++;
                    }

                    addFieldComboItems.Insert(insert, opt);
                    currentKeys.Add(opt.Key);
                }

                AddFieldCombo.SelectedIndex = -1;
                AddFieldCombo.IsEnabled = addFieldComboItems.Count > 0;
            }
            finally
            {
                suppressAddComboSelectionChanged = false;
            }
        }

        /// <summary>
        /// Add from keyboard without using <see cref="ComboBox.SelectionChanged"/> (that path closes the popup).
        /// </summary>
        private void AddFieldCombo_PreviewKeyDown(object sender, KeyEventArgs e)
        {
            if (suppressAddComboSelectionChanged || boundSettings == null || AddFieldCombo == null || !AddFieldCombo.IsDropDownOpen)
            {
                return;
            }

            if (e.Key != Key.Return && e.Key != Key.Enter)
            {
                return;
            }

            if (!(AddFieldCombo.SelectedItem is AddFieldOption opt))
            {
                return;
            }

            TryAddFieldFromCombo(opt);
            e.Handled = true;
        }

        /// <summary>
        /// Intercept item clicks before the ComboBox applies selection and closes the dropdown (avoids flicker).
        /// </summary>
        private void AddFieldComboItem_PreviewMouseLeftButtonDown(object sender, MouseButtonEventArgs e)
        {
            if (suppressAddComboSelectionChanged || boundSettings == null || AddFieldCombo == null)
            {
                return;
            }

            if (!(sender is ComboBoxItem item) || !(item.Content is AddFieldOption opt))
            {
                return;
            }

            addFieldComboItemHandledMouseDown = true;
            TryAddFieldFromCombo(opt);
            e.Handled = true;
        }

        private void AddFieldComboItem_PreviewMouseLeftButtonUp(object sender, MouseButtonEventArgs e)
        {
            if (!addFieldComboItemHandledMouseDown)
            {
                return;
            }

            addFieldComboItemHandledMouseDown = false;
            e.Handled = true;
        }

        private void AddFieldCombo_DropDownClosed(object sender, EventArgs e)
        {
            addFieldComboItemHandledMouseDown = false;
        }

        /// <summary>
        /// WPF often closes the dropdown when <see cref="RefreshAddCombo"/> removes the picked row from <see cref="addFieldComboItems"/>.
        /// Reopen after layout so multiple fields can be added without reopening the menu.
        /// </summary>
        private void ScheduleReopenAddFieldDropDownIfNeeded()
        {
            if (AddFieldCombo == null)
            {
                return;
            }

            void Reopen()
            {
                if (AddFieldCombo == null || addFieldComboItems.Count == 0 || !AddFieldCombo.IsEnabled)
                {
                    return;
                }

                AddFieldCombo.IsDropDownOpen = true;
            }

            AddFieldCombo.Dispatcher.BeginInvoke((Action)Reopen, DispatcherPriority.Loaded);
            AddFieldCombo.Dispatcher.BeginInvoke((Action)Reopen, DispatcherPriority.ApplicationIdle);
        }

        private void TryAddFieldFromCombo(AddFieldOption opt)
        {
            if (boundSettings == null || opt == null)
            {
                return;
            }

            boundSettings.EnableFieldAt(opt.Key, boundSettings.SelectedFieldKeys.Count);

            if (AddFieldCombo != null && addFieldComboItems.Count > 0)
            {
                AddFieldCombo.IsDropDownOpen = true;
            }

            ScheduleReopenAddFieldDropDownIfNeeded();
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
