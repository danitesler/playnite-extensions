using System;
using System.Collections.Generic;
using System.Reflection;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Media;
using Playnite.SDK;

namespace Autogrid
{
    internal sealed class ViewportMetrics
    {
        public double Viewport;
        public double PanelWidth;
        public double ScrollWidth;
        public double ViewportHeight;
        public double ScrollHeight;
        public ScrollViewer PickedScrollViewer;
    }

    internal sealed class TileVerticalMeasurements
    {
        public double TileHeight;
        public double CoverHeight;
    }

    internal static class GridLayoutService
    {
        private struct ScrollViewerDepth
        {
            public ScrollViewer Viewer;
            public int Depth;
        }

        internal const double MinGridItemWidth = 60;
        internal const double MaxGridItemWidth = 900;
        internal const double SafetyPadding = 0;

        /// <summary>Approximate width of the narrow platform-icon sidebar strip (not the wide labeled sidebar).</summary>
        private const double IconSidebarWidthApprox = 80;

        private const double WindowEdgeMargin = 12;

        public static object TryResolveAppSettings(Window mainWindow)
        {
            if (mainWindow?.DataContext == null)
            {
                return null;
            }

            var dcType = mainWindow.DataContext.GetType();
            var appSettingsProp = dcType.GetProperty("AppSettings", BindingFlags.Instance | BindingFlags.Public);
            return appSettingsProp?.GetValue(mainWindow.DataContext, null);
        }

        public static bool TryGetGridLayoutInputs(object appSettings, out int gridItemSpacing, out double currentGridItemWidth)
        {
            gridItemSpacing = 8;
            currentGridItemWidth = 0;
            if (appSettings == null)
            {
                return false;
            }

            var t = appSettings.GetType();
            try
            {
                var spacingProp = t.GetProperty("GridItemSpacing", BindingFlags.Instance | BindingFlags.Public);
                if (spacingProp?.GetValue(appSettings, null) is int s)
                {
                    gridItemSpacing = s;
                }

                var widthProp = t.GetProperty("GridItemWidth", BindingFlags.Instance | BindingFlags.Public);
                if (widthProp?.GetValue(appSettings, null) is double w)
                {
                    currentGridItemWidth = w;
                }

                return widthProp != null;
            }
            catch
            {
                return false;
            }
        }

        public static bool TrySetGridItemWidth(object appSettings, double width)
        {
            if (appSettings == null)
            {
                return false;
            }

            var prop = appSettings.GetType().GetProperty("GridItemWidth", BindingFlags.Instance | BindingFlags.Public);
            if (prop == null || !prop.CanWrite)
            {
                return false;
            }

            prop.SetValue(appSettings, width, null);
            return true;
        }

        public static bool TrySetGridItemSpacing(object appSettings, int spacing)
        {
            if (appSettings == null)
            {
                return false;
            }

            var prop = appSettings.GetType().GetProperty("GridItemSpacing", BindingFlags.Instance | BindingFlags.Public);
            if (prop == null || !prop.CanWrite)
            {
                return false;
            }

            prop.SetValue(appSettings, spacing, null);
            return true;
        }

        /// <summary>
        /// Playnite sets ItemSpacingMargin to GridItemSpacing/2 on each side (integer divide).
        /// </summary>
        public static int SpacingToAxisMargin(int gridItemSpacing)
        {
            var half = Math.Max(0, gridItemSpacing) / 2;
            return half + half;
        }

        /// <summary>
        /// Column-mode width. Leftover pixels go into cover width (not spacing —
        /// spacing bumps add left/right tile margin). A +1 px width is used only
        /// when it still fits in the viewport.
        /// </summary>
        public static bool ComputeColumnLayout(
            double viewportWidth,
            int targetColumns,
            int userGridItemSpacing,
            out double gridItemWidth,
            out int gridItemSpacing)
        {
            gridItemSpacing = userGridItemSpacing;
            var margin = SpacingToAxisMargin(userGridItemSpacing);
            gridItemWidth = ComputeTargetGridItemWidth(viewportWidth, targetColumns, margin);
            if (gridItemWidth <= 0 || targetColumns < 1)
            {
                return gridItemWidth > 0;
            }

            var leftover = viewportWidth - targetColumns * (gridItemWidth + margin);
            if (leftover >= targetColumns)
            {
                var extra = Math.Floor(leftover / targetColumns);
                gridItemWidth = Math.Min(MaxGridItemWidth, gridItemWidth + extra);
            }

            return true;
        }

        /// <summary>
        /// Persists Playnite application settings (config.json) after grid width changes.
        /// </summary>
        public static bool TrySaveAppSettings(object appSettings)
        {
            if (appSettings == null)
            {
                return false;
            }

            try
            {
                var method = appSettings.GetType().GetMethod(
                    "SaveSettings",
                    BindingFlags.Instance | BindingFlags.Public,
                    null,
                    Type.EmptyTypes,
                    null);
                if (method == null)
                {
                    return false;
                }

                method.Invoke(appSettings, null);
                return true;
            }
            catch
            {
                return false;
            }
        }

        private static double GetEffectiveScrollViewerWidth(ScrollViewer sv)
        {
            if (sv == null)
            {
                return 0;
            }

            if (sv.ViewportWidth > 0)
            {
                return Math.Min(sv.ViewportWidth, sv.ActualWidth);
            }

            return sv.ActualWidth;
        }

        private static double GetEffectiveScrollViewerHeight(ScrollViewer sv)
        {
            if (sv == null)
            {
                return 0;
            }

            if (sv.ViewportHeight > 0)
            {
                return Math.Min(sv.ViewportHeight, sv.ActualHeight);
            }

            return sv.ActualHeight;
        }

        public static double ComputeTargetGridItemWidth(
            double viewportWidth,
            int targetColumns,
            double horizontalMarginPerTile)
        {
            if (viewportWidth <= 0 || targetColumns < 1)
            {
                return 0;
            }

            var usable = Math.Max(0, viewportWidth - SafetyPadding);
            var raw = (usable - targetColumns * horizontalMarginPerTile) / targetColumns;
            var floored = Math.Floor(raw);
            return Math.Max(MinGridItemWidth, Math.Min(MaxGridItemWidth, floored));
        }

        public static double ComputeTargetGridItemWidthForRows(
            double viewportHeight,
            int targetRows,
            double verticalMarginPerTile,
            double currentGridItemWidth,
            TileVerticalMeasurements measurements)
        {
            if (viewportHeight <= 0 || targetRows < 1 || measurements == null)
            {
                return 0;
            }

            if (measurements.TileHeight <= 0 || currentGridItemWidth <= 0)
            {
                return 0;
            }

            var usable = Math.Max(0, viewportHeight - SafetyPadding);
            var targetRowPitch = usable / targetRows;
            var targetTileHeight = targetRowPitch;

            double targetWidth;
            if (measurements.CoverHeight > 1)
            {
                var fixedChrome = measurements.TileHeight - measurements.CoverHeight - verticalMarginPerTile;
                var targetCoverHeight = targetTileHeight - verticalMarginPerTile - fixedChrome;
                if (targetCoverHeight <= 0)
                {
                    return 0;
                }

                targetWidth = targetCoverHeight * (currentGridItemWidth / measurements.CoverHeight);
            }
            else
            {
                var pitchPerWidth = (measurements.TileHeight - verticalMarginPerTile) / currentGridItemWidth;
                if (pitchPerWidth <= 0)
                {
                    return 0;
                }

                targetWidth = (targetTileHeight - verticalMarginPerTile) / pitchPerWidth;
            }

            var floored = Math.Floor(targetWidth);
            return Math.Max(MinGridItemWidth, Math.Min(MaxGridItemWidth, floored));
        }

        /// <summary>
        /// Resolves usable library width and height from the games ScrollViewer
        /// viewport (available space). ItemsPresenter width is not used as the
        /// wrap target — it follows the tiles and locks in side gutters.
        /// Presenter MaxWidth / margin still constrain the measure.
        /// </summary>
        public static ViewportMetrics ResolveViewportMetrics(Window window, IPlayniteAPI api, int viewportAdjustPx)
        {
            var result = new ViewportMetrics();
            if (window == null)
            {
                return result;
            }

            var expected = GetExpectedLibraryWidth(window, api);
            result.ScrollWidth = 0;
            result.PanelWidth = 0;
            result.ScrollHeight = 0;
            result.ViewportHeight = 0;

            ScrollViewer picked = null;
            if (TryPickGamesScrollViewer(window, api, out picked, out var scrollW, out var scrollH))
            {
                result.ScrollWidth = scrollW;
                result.ScrollHeight = scrollH;
                result.PickedScrollViewer = picked;
            }

            FrameworkElement presenter = null;
            if (picked != null)
            {
                presenter = FindWidestItemsPresenterUnder(picked);
                result.PanelWidth = presenter != null ? presenter.ActualWidth : 0;
            }

            double baseV;
            if (result.ScrollWidth > 100)
            {
                baseV = result.ScrollWidth;
                if (presenter != null)
                {
                    baseV -= presenter.Margin.Left + presenter.Margin.Right;
                    if (!double.IsNaN(presenter.MaxWidth) &&
                        !double.IsInfinity(presenter.MaxWidth) &&
                        presenter.MaxWidth > 0)
                    {
                        baseV = Math.Min(baseV, presenter.MaxWidth);
                    }
                }
            }
            else
            {
                baseV = expected;
            }

            result.Viewport = Math.Max(100, baseV + viewportAdjustPx);

            if (result.ScrollHeight > 100)
            {
                result.ViewportHeight = Math.Max(100, result.ScrollHeight + viewportAdjustPx);
            }
            else if (window.ActualHeight > 0)
            {
                result.ViewportHeight = Math.Max(100, window.ActualHeight * 0.65 + viewportAdjustPx);
            }

            return result;
        }

        public static bool TryMeasureTileVerticalPitch(ScrollViewer scrollViewer, out TileVerticalMeasurements measurements)
        {
            measurements = null;
            if (scrollViewer == null)
            {
                return false;
            }

            foreach (var descendant in EnumerateDescendants(scrollViewer))
            {
                if (!IsVisibleGridItemContainer(descendant))
                {
                    continue;
                }

                if (!(descendant is FrameworkElement fe) || fe.ActualHeight <= 0)
                {
                    continue;
                }

                var coverHeight = GetLargestImageHeightUnder(fe);
                measurements = new TileVerticalMeasurements
                {
                    TileHeight = fe.ActualHeight,
                    CoverHeight = coverHeight
                };
                return true;
            }

            return false;
        }

        private static bool IsVisibleGridItemContainer(DependencyObject node)
        {
            if (node == null || !(node is FrameworkElement fe))
            {
                return false;
            }

            if (!fe.IsVisible || fe.Visibility != Visibility.Visible)
            {
                return false;
            }

            if (fe.ActualHeight < 40 || fe.ActualWidth < 40)
            {
                return false;
            }

            var typeName = fe.GetType().Name;
            return typeName.IndexOf("ListBoxItem", StringComparison.OrdinalIgnoreCase) >= 0 ||
                   typeName.IndexOf("GridGame", StringComparison.OrdinalIgnoreCase) >= 0 ||
                   typeName.IndexOf("GameGrid", StringComparison.OrdinalIgnoreCase) >= 0;
        }

        private static double GetLargestImageHeightUnder(FrameworkElement root)
        {
            var best = 0.0;
            foreach (var descendant in EnumerateDescendants(root))
            {
                if (descendant is Image img && img.IsVisible && img.ActualHeight > best)
                {
                    best = img.ActualHeight;
                }
            }

            return best;
        }

        private static double GetExpectedLibraryWidth(Window window, IPlayniteAPI api)
        {
            var w = window.ActualWidth;
            if (api?.ApplicationSettings == null)
            {
                return Math.Max(100, w - WindowEdgeMargin * 2);
            }

            if (api.ApplicationSettings.SidebarVisible)
            {
                w -= IconSidebarWidthApprox;
            }

            return Math.Max(100, w - WindowEdgeMargin);
        }

        private static bool TryPickGamesScrollViewer(
            Window window,
            IPlayniteAPI api,
            out ScrollViewer selected,
            out double effectiveScrollWidth,
            out double effectiveScrollHeight)
        {
            selected = null;
            effectiveScrollWidth = 0;
            effectiveScrollHeight = 0;

            var expected = GetExpectedLibraryWidth(window, api);
            var maxW = window.ActualWidth > 0 ? window.ActualWidth * 0.99 : double.MaxValue;

            double bestWidth = 0;
            double bestHeight = 0;
            var bestScore = double.MaxValue;
            var bestDepth = -1;
            ScrollViewer bestSv = null;

            foreach (var entry in EnumerateScrollViewersWithDepth(window, 0))
            {
                var sv = entry.Viewer;
                var depth = entry.Depth;
                if (sv.Visibility != Visibility.Visible || !sv.IsVisible)
                {
                    continue;
                }

                if (sv.ActualHeight < 280)
                {
                    continue;
                }

                var effectiveW = GetEffectiveScrollViewerWidth(sv);
                if (effectiveW < 200 || effectiveW > maxW)
                {
                    continue;
                }

                var score = Math.Abs(effectiveW - expected);
                if (score < bestScore - 1e-6 || (Math.Abs(score - bestScore) <= 1e-6 && depth > bestDepth))
                {
                    bestScore = score;
                    bestDepth = depth;
                    bestWidth = effectiveW;
                    bestHeight = GetEffectiveScrollViewerHeight(sv);
                    bestSv = sv;
                }
            }

            if (bestSv != null && bestWidth > 100)
            {
                selected = bestSv;
                effectiveScrollWidth = bestWidth;
                effectiveScrollHeight = bestHeight;
                return true;
            }

            return false;
        }

        private static FrameworkElement FindWidestItemsPresenterUnder(ScrollViewer scrollViewer)
        {
            if (scrollViewer == null)
            {
                return null;
            }

            FrameworkElement best = null;
            var bestWidth = 0.0;
            foreach (var d in EnumerateDescendants(scrollViewer))
            {
                if (d is ItemsPresenter ip && ip.IsVisible && !double.IsNaN(ip.ActualWidth))
                {
                    if (ip.ActualWidth > bestWidth)
                    {
                        bestWidth = ip.ActualWidth;
                        best = ip;
                    }
                }
            }

            return best;
        }

        private static IEnumerable<DependencyObject> EnumerateDescendants(DependencyObject root)
        {
            if (root == null)
            {
                yield break;
            }

            var count = VisualTreeHelper.GetChildrenCount(root);
            for (var i = 0; i < count; i++)
            {
                var child = VisualTreeHelper.GetChild(root, i);
                yield return child;
                foreach (var nested in EnumerateDescendants(child))
                {
                    yield return nested;
                }
            }
        }

        private static IEnumerable<ScrollViewerDepth> EnumerateScrollViewersWithDepth(DependencyObject root, int depth)
        {
            if (root == null)
            {
                yield break;
            }

            var count = VisualTreeHelper.GetChildrenCount(root);
            for (var i = 0; i < count; i++)
            {
                var child = VisualTreeHelper.GetChild(root, i);
                var childDepth = depth + 1;
                if (child is ScrollViewer sv)
                {
                    yield return new ScrollViewerDepth { Viewer = sv, Depth = childDepth };
                }

                foreach (var nested in EnumerateScrollViewersWithDepth(child, childDepth))
                {
                    yield return nested;
                }
            }
        }
    }
}
