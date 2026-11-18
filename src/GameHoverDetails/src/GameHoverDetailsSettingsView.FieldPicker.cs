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
        private void PresetCombo_SelectionChanged(object sender, SelectionChangedEventArgs e)
        {
            if (suppressPresetSelectionChanged || boundSettings == null || attaching || unloading)
            {
                return;
            }

            var item = PresetCombo.SelectedItem as ComboBoxItem;
            var id = item?.Tag as string;
            var settings = boundSettings;
            if (id == null || id == HoverFieldPresets.Match(settings.SelectedFieldKeys))
            {
                return;
            }

            // Finish WPF's selection transaction before rebuilding the field editor.
            Dispatcher.BeginInvoke(new Action(() =>
            {
                if (unloading || boundSettings != settings || PresetCombo.SelectedItem != item ||
                    id == HoverFieldPresets.Match(settings.SelectedFieldKeys))
                {
                    return;
                }

                settings.ApplyFieldPreset(id);
                RefreshPresetSelection();
            }), DispatcherPriority.Background);
        }

        private void RefreshPresetSelection()
        {
            suppressPresetSelectionChanged = true;
            try
            {
                var id = HoverFieldPresets.Match(boundSettings.SelectedFieldKeys);
                PresetCombo.SelectedValue = id;
            }
            finally
            {
                suppressPresetSelectionChanged = false;
            }
        }

        private void RefreshFieldsList()
        {
            if (FieldsList == null || boundSettings == null)
            {
                return;
            }

            var keys = boundSettings.SelectedFieldKeys;
            RefreshPresetSelection();
            var n = keys.Count;
            var style = boundSettings.HoverIconStyle;
            var glyphBrush = SettingsGlyphBrush;
            FieldsList.ItemsSource = keys
                .Select((k, i) => new EnabledFieldRow(k, HoverFieldCatalog.GetDisplayName(k), i, n, style, glyphBrush))
                .ToList();
        }

        private void EnsureAddFieldSearchHooked()
        {
            if (addFieldTextHandlerAttached || AddFieldCombo == null)
            {
                return;
            }

            AddFieldCombo.AddHandler(
                TextBox.TextChangedEvent,
                new TextChangedEventHandler(AddFieldCombo_TextChanged),
                true);
            addFieldTextHandlerAttached = true;
        }

        private static bool MatchesAddFieldSearch(AddFieldOption option, string filter)
        {
            if (option == null)
            {
                return false;
            }

            if (string.IsNullOrEmpty(filter))
            {
                return true;
            }

            if (option.DisplayName.IndexOf(filter, StringComparison.CurrentCultureIgnoreCase) >= 0)
            {
                return true;
            }

            return option.Key.IndexOf(filter, StringComparison.OrdinalIgnoreCase) >= 0;
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

            suppressAddFieldTextChanged = true;
            try
            {
                var style = boundSettings.HoverIconStyle;
                if (addFieldComboItems.Count > 0 &&
                    !string.Equals(addFieldComboItems[0].IconStyle, style, StringComparison.Ordinal))
                {
                    addFieldComboItems.Clear();
                }

                var filter = (addFieldSearchText ?? string.Empty).Trim();
                var glyphBrush = SettingsGlyphBrush;
                var addable = boundSettings.GetAddableKeys()
                    .Select(k => new AddFieldOption(k, HoverFieldCatalog.GetDisplayName(k), style, glyphBrush))
                    .ToList();
                var desired = addable
                    .Where(o => MatchesAddFieldSearch(o, filter))
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
                AddFieldCombo.IsEnabled = addable.Count > 0;
                if (!string.Equals(AddFieldCombo.Text ?? string.Empty, addFieldSearchText ?? string.Empty, StringComparison.Ordinal))
                {
                    AddFieldCombo.Text = addFieldSearchText ?? string.Empty;
                }

                UpdateAddFieldSearchHint();
            }
            finally
            {
                suppressAddFieldTextChanged = false;
            }
        }

        private void UpdateAddFieldSearchHint()
        {
            if (AddFieldSearchHint == null)
            {
                return;
            }

            AddFieldSearchHint.Visibility = string.IsNullOrEmpty(addFieldSearchText)
                ? Visibility.Visible
                : Visibility.Collapsed;
        }

        private void OpenAddFieldSelector()
        {
            if (AddFieldCombo == null || !AddFieldCombo.IsEnabled)
            {
                return;
            }

            RefreshAddCombo();
            if (!AddFieldCombo.IsDropDownOpen)
            {
                AddFieldCombo.IsDropDownOpen = true;
            }
        }

        private void AddFieldCombo_TextChanged(object sender, TextChangedEventArgs e)
        {
            if (suppressAddFieldTextChanged || attaching || AddFieldCombo == null)
            {
                return;
            }

            var text = AddFieldCombo.Text ?? string.Empty;
            if (string.Equals(text, addFieldSearchText, StringComparison.Ordinal))
            {
                return;
            }

            addFieldSearchText = text;
            UpdateAddFieldSearchHint();
            RefreshAddCombo();
            if (AddFieldCombo.IsEnabled && !AddFieldCombo.IsDropDownOpen)
            {
                AddFieldCombo.IsDropDownOpen = true;
            }
        }

        private void ClearAddFieldSearch()
        {
            addFieldSearchText = string.Empty;
            if (AddFieldCombo == null)
            {
                return;
            }

            suppressAddFieldTextChanged = true;
            try
            {
                AddFieldCombo.Text = string.Empty;
            }
            finally
            {
                suppressAddFieldTextChanged = false;
            }

            UpdateAddFieldSearchHint();
            RefreshAddCombo();
        }

        /// <summary>
        /// Add from keyboard without using <see cref="ComboBox.SelectionChanged"/> (that path closes the popup).
        /// </summary>
        private void AddFieldCombo_PreviewKeyDown(object sender, KeyEventArgs e)
        {
            if (boundSettings == null || AddFieldCombo == null)
            {
                return;
            }

            if (e.Key == Key.Escape)
            {
                ClearAddFieldSearch();
                return;
            }

            if (e.Key != Key.Return && e.Key != Key.Enter)
            {
                return;
            }

            var opt = AddFieldCombo.SelectedItem as AddFieldOption ?? addFieldComboItems.FirstOrDefault();
            if (opt == null)
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
            if (boundSettings == null || AddFieldCombo == null)
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

        private void AddFieldCombo_PreviewMouseLeftButtonDown(object sender, MouseButtonEventArgs e)
        {
            if (FindAncestor<ComboBoxItem>(e.OriginalSource as DependencyObject) != null)
            {
                return;
            }

            OpenAddFieldSelector();
        }

        private void AddFieldCombo_GotKeyboardFocus(object sender, KeyboardFocusChangedEventArgs e)
        {
            if (FindAncestor<ComboBoxItem>(e.NewFocus as DependencyObject) != null)
            {
                return;
            }

            OpenAddFieldSelector();
        }

        private void AddFieldCombo_DropDownOpened(object sender, EventArgs e)
        {
            if (AddFieldCombo == null)
            {
                return;
            }

            RefreshAddCombo();
            Dispatcher.BeginInvoke(
                (Action)(() =>
                {
                    if (AddFieldCombo.Template.FindName("PART_EditableTextBox", AddFieldCombo) is TextBox box)
                    {
                        box.Focus();
                        box.CaretIndex = box.Text != null ? box.Text.Length : 0;
                    }
                }),
                DispatcherPriority.Input);
        }

        private void AddFieldCombo_DropDownClosed(object sender, EventArgs e)
        {
            addFieldComboItemHandledMouseDown = false;
            if (keepAddFieldSearchOnClose || (AddFieldCombo != null && AddFieldCombo.IsKeyboardFocusWithin))
            {
                return;
            }

            ClearAddFieldSearch();
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

            keepAddFieldSearchOnClose = true;
            boundSettings.EnableFieldAt(opt.Key, boundSettings.SelectedFieldKeys.Count);

            if (AddFieldCombo != null && addFieldComboItems.Count > 0)
            {
                AddFieldCombo.IsDropDownOpen = true;
            }

            ScheduleReopenAddFieldDropDownIfNeeded();
            Dispatcher.BeginInvoke(
                (Action)(() => keepAddFieldSearchOnClose = false),
                DispatcherPriority.ApplicationIdle);
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

            boundSettings.DisableFieldAt(row.Index);
        }
    }
}
