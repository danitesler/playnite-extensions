using System;
using System.Collections.Generic;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Media;

namespace Autogrid
{
    /// <summary>
    /// Holds the grid view's games list at its current width while the game details panel is open.
    /// Playnite docks that panel beside the list (LibraryGridView's DockPanel), so the list narrows,
    /// VirtualizingWrapPanel recomputes items per line from its measure width and every tile moves:
    /// containers are re-realized, covers reload and the scroll position jumps. With the list's
    /// scroll content pinned, the wrap panel keeps its columns and the panel covers the grid's edge.
    /// </summary>
    internal sealed class GridWidthPin
    {
        private FrameworkElement pinned;
        private bool alignmentChanged;

        public bool IsPinned => pinned != null;

        public double PinnedWidth => pinned != null ? pinned.Width : 0;

        /// <summary>
        /// Pins <paramref name="content"/> (the games list's ScrollViewer content) at its current width.
        /// A panel on the left also aligns it right, so the left columns go under the panel and the
        /// visible tiles keep their screen position.
        /// </summary>
        public bool TryPin(FrameworkElement content, bool panelOnLeft)
        {
            Release();
            if (content == null || content.ActualWidth <= 0)
            {
                return false;
            }

            // A theme that sets or binds Width itself owns it; leave that alone.
            if (content.ReadLocalValue(FrameworkElement.WidthProperty) != DependencyProperty.UnsetValue)
            {
                return false;
            }

            content.Width = content.ActualWidth;
            alignmentChanged = panelOnLeft &&
                content.ReadLocalValue(FrameworkElement.HorizontalAlignmentProperty) == DependencyProperty.UnsetValue;
            if (alignmentChanged)
            {
                content.HorizontalAlignment = HorizontalAlignment.Right;
            }

            pinned = content;
            return true;
        }

        /// <summary>Follows a main window resize so the grid's full width tracks the window.</summary>
        public void Grow(double delta)
        {
            if (pinned == null || Math.Abs(delta) < 0.5)
            {
                return;
            }

            pinned.Width = Math.Max(1, pinned.Width + delta);
        }

        public void Release()
        {
            if (pinned == null)
            {
                return;
            }

            pinned.ClearValue(FrameworkElement.WidthProperty);
            if (alignmentChanged)
            {
                pinned.ClearValue(FrameworkElement.HorizontalAlignmentProperty);
            }

            pinned = null;
            alignmentChanged = false;
        }

        /// <summary>
        /// Finds the visible LibraryGridView's PART_ListGames and returns its ScrollViewer's content
        /// (the ItemsPresenter in the stock ListBox template).
        /// </summary>
        public static FrameworkElement FindGamesListContent(DependencyObject root)
        {
            var list = FindGamesList(root);
            if (list == null)
            {
                return null;
            }

            var scrollViewer = FindVisible(list, d => d is ScrollViewer) as ScrollViewer;
            return scrollViewer?.Content as FrameworkElement;
        }

        /// <summary>The visible LibraryGridView's PART_ListGames, or null outside Grid view.</summary>
        public static ItemsControl FindGamesList(DependencyObject root)
        {
            var gridView = FindVisible(root, d => d.GetType().Name == "LibraryGridView") as Control;
            return gridView?.Template?.FindName("PART_ListGames", gridView) as ItemsControl;
        }

        private static DependencyObject FindVisible(DependencyObject root, Func<DependencyObject, bool> match)
        {
            if (root == null)
            {
                return null;
            }

            var stack = new Stack<DependencyObject>();
            stack.Push(root);
            while (stack.Count > 0)
            {
                var node = stack.Pop();
                if (node is UIElement element && !element.IsVisible)
                {
                    continue;
                }

                if (!ReferenceEquals(node, root) && match(node))
                {
                    return node;
                }

                var count = VisualTreeHelper.GetChildrenCount(node);
                for (var i = count - 1; i >= 0; i--)
                {
                    stack.Push(VisualTreeHelper.GetChild(node, i));
                }
            }

            return null;
        }
    }
}
