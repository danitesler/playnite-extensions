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
        private bool suppressPresetSelectionChanged;
        private bool suppressAddFieldTextChanged;
        private bool addFieldTextHandlerAttached;
        private string addFieldSearchText = string.Empty;
        /// <summary>Skip clearing search when the dropdown closes because a field was just added.</summary>
        private bool keepAddFieldSearchOnClose;
        /// <summary>Set when an add was triggered from item PreviewMouseDown so matching PreviewMouseUp does not dismiss the dropdown.</summary>
        private bool addFieldComboItemHandledMouseDown;
        private bool fieldsListWheelHooked;
        private Game previewSampleGame;
        private ImageSource cachedFallbackIcon;
        private ImageSource cachedPreviewCover;
        private readonly Dictionary<string, ImageSource> previewArtByField = new Dictionary<string, ImageSource>();
        private bool attaching;
        private bool unloading;
        private bool previewRefreshQueued;

        /// <summary>Stable ItemsSource for Add field — sync in place so the open dropdown does not close/reopen on each add.</summary>
        private readonly ObservableCollection<AddFieldOption> addFieldComboItems = new ObservableCollection<AddFieldOption>();

        private sealed class AddFieldOption
        {
            public AddFieldOption(string key, string displayName, string iconStyle, Brush glyphBrush)
            {
                Key = key;
                DisplayName = displayName;
                IconStyle = iconStyle ?? GameHoverDetailsSettings.IconStyleUnicons;
                SettingsIcon = HoverFieldCatalog.CreateGlyphVisual(Key, IconStyle, 15, glyphBrush ?? Brushes.White);
            }

            public string Key { get; }
            public string DisplayName { get; }
            public string IconStyle { get; }
            public FrameworkElement SettingsIcon { get; }

            public override string ToString()
            {
                return DisplayName;
            }
        }

        private sealed class EnabledFieldRow
        {
            public EnabledFieldRow(string key, string displayName, int index, int count, string iconStyle, Brush glyphBrush)
            {
                Key = key;
                DisplayName = displayName;
                Index = index;
                Count = count;
                IconStyle = iconStyle ?? GameHoverDetailsSettings.IconStyleUnicons;
                SettingsIcon = HoverFieldCatalog.CreateGlyphVisual(Key, IconStyle, 15, glyphBrush ?? Brushes.White);
            }

            public string Key { get; }
            public string DisplayName { get; }
            public int Index { get; }
            public int Count { get; }
            public string IconStyle { get; }
            public bool CanMoveUp => Index > 0;
            public bool CanMoveDown => Index < Count - 1;
            public FrameworkElement SettingsIcon { get; }
        }

        public GameHoverDetailsSettingsView()
        {
            InitializeComponent();
        }

        private void UserControl_Loaded(object sender, RoutedEventArgs e)
        {
            unloading = false;
            ApplyLayoutFlow();
            if (FieldsList != null && !fieldsListWheelHooked)
            {
                FieldsList.PreviewMouseWheel += FieldsList_PreviewMouseWheel;
                fieldsListWheelHooked = true;
            }

            if (PreviewChromeBody != null)
            {
                PreviewChromeBody.SizeChanged -= PreviewChromeBodyOnSizeChanged;
                PreviewChromeBody.SizeChanged += PreviewChromeBodyOnSizeChanged;
            }

            EnsureAddFieldSearchHooked();
            TryAttachSettings();
        }

        private void ApplyLayoutFlow()
        {
            var api = (DataContext as GameHoverDetailsSettings)?.TryGetPlayniteApi();
            var flow = HoverLoc.LayoutFlow(api, this);
            FlowDirection = flow;
            if (AddFieldCombo != null)
            {
                AddFieldCombo.HorizontalContentAlignment = flow == FlowDirection.RightToLeft
                    ? HorizontalAlignment.Right
                    : HorizontalAlignment.Left;
            }
            if (PreviewChromeBorder != null)
            {
                PreviewChromeBorder.FlowDirection = flow;
                PreviewChromeBorder.HorizontalAlignment = flow == FlowDirection.RightToLeft
                    ? HorizontalAlignment.Right
                    : HorizontalAlignment.Left;
            }
        }

        private void UserControl_DataContextChanged(object sender, DependencyPropertyChangedEventArgs e)
        {
            TryAttachSettings();
        }

        /// <summary>Subscribe to settings and refresh lists; safe if <see cref="DataContext"/> is set after <see cref="UserControl.Loaded"/>.</summary>
        private void TryAttachSettings()
        {
            var s = DataContext as GameHoverDetailsSettings;
            if (s == null)
            {
                if (boundSettings != null)
                {
                    boundSettings.PropertyChanged -= BoundSettingsOnPropertyChanged;
                    boundSettings = null;
                }

                return;
            }

            if (ReferenceEquals(boundSettings, s))
            {
                return;
            }

            if (boundSettings != null)
            {
                boundSettings.PropertyChanged -= BoundSettingsOnPropertyChanged;
            }

            attaching = true;
            try
            {
                boundSettings = s;
                s.PropertyChanged += BoundSettingsOnPropertyChanged;
                if (s.UseThemeChrome)
                {
                    s.ApplyThemeColorsToPickers();
                }

                ApplyLayoutFlow();
                TryPickPreviewSampleGame();
                RefreshFieldsList();
                RefreshAddCombo();
                RefreshPreviewFields();
                ApplyPreviewChrome();
            }
            finally
            {
                attaching = false;
            }
        }

        private void UserControl_Unloaded(object sender, RoutedEventArgs e)
        {
            unloading = true;
            previewRefreshQueued = false;
            if (FieldsList != null && fieldsListWheelHooked)
            {
                FieldsList.PreviewMouseWheel -= FieldsList_PreviewMouseWheel;
                fieldsListWheelHooked = false;
            }

            if (boundSettings != null)
            {
                boundSettings.PropertyChanged -= BoundSettingsOnPropertyChanged;
            }

            if (PreviewChromeBody != null)
            {
                PreviewChromeBody.SizeChanged -= PreviewChromeBodyOnSizeChanged;
            }

            boundSettings = null;
            previewSampleGame = null;
            cachedFallbackIcon = null;
            cachedPreviewCover = null;
            previewArtByField.Clear();
        }

        private void FieldsList_PreviewMouseWheel(object sender, MouseWheelEventArgs e)
        {
            if (FieldsScrollViewer == null || !(sender is FrameworkElement listHost))
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
                var next = FieldsScrollViewer.VerticalOffset - step;
                if (next < 0)
                {
                    next = 0;
                }
                else if (next > FieldsScrollViewer.ScrollableHeight)
                {
                    next = FieldsScrollViewer.ScrollableHeight;
                }

                FieldsScrollViewer.ScrollToVerticalOffset(next);
                e.Handled = true;
            }
        }

        private void BoundSettingsOnPropertyChanged(object o, System.ComponentModel.PropertyChangedEventArgs e)
        {
            if (attaching || unloading || boundSettings == null || boundSettings.SuppressSettingsViewRebuilds)
            {
                return;
            }

            if (e.PropertyName == nameof(GameHoverDetailsSettings.SelectedFieldKeys) ||
                e.PropertyName == nameof(GameHoverDetailsSettings.SelectedFieldCount))
            {
                RefreshFieldsList();
                RefreshAddCombo();
                QueuePreviewRefresh();
                return;
            }

            if (e.PropertyName == nameof(GameHoverDetailsSettings.UseThemeChrome))
            {
                if (boundSettings.UseThemeChrome)
                {
                    boundSettings.ApplyThemeColorsToPickers();
                }

                QueuePreviewRefresh();
                return;
            }

            if (e.PropertyName == nameof(GameHoverDetailsSettings.HoverIconStyle))
            {
                RefreshFieldsList();
                RefreshAddCombo();
                QueuePreviewRefresh();
                return;
            }

            if (e.PropertyName == nameof(GameHoverDetailsSettings.HideFieldTitlesInHover) ||
                e.PropertyName == nameof(GameHoverDetailsSettings.ShowGameNameHeader) ||
                e.PropertyName == nameof(GameHoverDetailsSettings.ShowFieldInlineIconsInHover) ||
                e.PropertyName == nameof(GameHoverDetailsSettings.HideIconChipBackground) ||
                e.PropertyName == nameof(GameHoverDetailsSettings.HideFieldDividers) ||
                e.PropertyName == nameof(GameHoverDetailsSettings.HidePanelBorder) ||
                e.PropertyName == nameof(GameHoverDetailsSettings.HoverFieldBlockSpacingDip) ||
                e.PropertyName == nameof(GameHoverDetailsSettings.HoverFieldColumnCount) ||
                e.PropertyName == nameof(GameHoverDetailsSettings.HoverContentPaddingDip) ||
                e.PropertyName == nameof(GameHoverDetailsSettings.HoverWidth) ||
                e.PropertyName == nameof(GameHoverDetailsSettings.HoverChromeBackgroundHex) ||
                e.PropertyName == nameof(GameHoverDetailsSettings.HoverChromeBorderHex) ||
                e.PropertyName == nameof(GameHoverDetailsSettings.HoverChromeDividerHex) ||
                e.PropertyName == nameof(GameHoverDetailsSettings.HoverChromeIconBackgroundHex) ||
                e.PropertyName == nameof(GameHoverDetailsSettings.HoverChromeBackgroundOpacity) ||
                e.PropertyName == nameof(GameHoverDetailsSettings.HoverBackgroundStyle) ||
                e.PropertyName == nameof(GameHoverDetailsSettings.UseGameBackground) ||
                e.PropertyName == nameof(GameHoverDetailsSettings.HoverBodyFontSize) ||
                e.PropertyName == nameof(GameHoverDetailsSettings.HoverTitleFontSize) ||
                e.PropertyName == nameof(GameHoverDetailsSettings.HoverIconChipSizeDip) ||
                e.PropertyName == nameof(GameHoverDetailsSettings.HoverIconChipPaddingDip) ||
                e.PropertyName == nameof(GameHoverDetailsSettings.HoverIconChipOuterSizeDip) ||
                e.PropertyName == nameof(GameHoverDetailsSettings.HoverIconChipShape) ||
                e.PropertyName == nameof(GameHoverDetailsSettings.HoverIconGlyphFontSize))
            {
                QueuePreviewRefresh();
            }
        }

        private void QueuePreviewRefresh()
        {
            if (previewRefreshQueued || attaching || unloading || boundSettings == null || boundSettings.SuppressSettingsViewRebuilds)
            {
                return;
            }

            previewRefreshQueued = true;
            Dispatcher.BeginInvoke(
                (Action)(() =>
                {
                    previewRefreshQueued = false;
                    if (unloading || boundSettings == null || attaching || boundSettings.SuppressSettingsViewRebuilds)
                    {
                        return;
                    }

                    RefreshPreviewFields();
                    ApplyPreviewChrome();
                }),
                DispatcherPriority.Background);
        }

        private Brush SettingsGlyphBrush =>
            TryFindResource("TextBrush") as Brush ?? SystemColors.ControlTextBrush;

        private static T FindAncestor<T>(DependencyObject start) where T : DependencyObject
        {
            var current = start;
            while (current != null)
            {
                if (current is T match)
                {
                    return match;
                }

                current = GameHoverDetailsHoverService.GetTreeParent(current);
            }

            return null;
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
