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
        internal const double SafetyPadding = 2;

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

        /// <summary>
        /// Horizontal margin budget per tile (left+right). Uses ItemSpacingMargin when available.
        /// </summary>
        public static double GetHorizontalMarginPerTile(object appSettings, int gridItemSpacingFallback)
        {
            if (appSettings == null)
            {
                return gridItemSpacingFallback;
            }

            try
            {
                var t = appSettings.GetType();
                var prop = t.GetProperty("ItemSpacingMargin", BindingFlags.Instance | BindingFlags.Public);
                if (prop?.GetValue(appSettings, null) is Thickness th)
                {
                    var sum = th.Left + th.Right;
                    if (sum > 0)
                    {
                        return sum;
                    }
                }
            }
            catch
            {
                // ignore
            }

            return gridItemSpacingFallback;
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

        /// <summary>
        /// Resolves usable library width: prefers ItemsPresenter under the games ScrollViewer, caps by scroll viewport, applies user adjust.
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

            ScrollViewer picked = null;
            if (TryPickGamesScrollViewer(window, api, out picked, out var scrollW))
            {
                result.ScrollWidth = scrollW;
            }

            if (picked != null)
            {
                result.PanelWidth = GetMaxItemsPresenterWidthUnder(picked);
            }

            double baseV;
            if (result.PanelWidth > 150 && result.PanelWidth <= window.ActualWidth + 1)
            {
                baseV = result.PanelWidth;
            }
            else if (result.ScrollWidth > 100)
            {
                baseV = Math.Max(result.ScrollWidth, expected);
            }
            else
            {
                baseV = expected;
            }

            if (result.ScrollWidth > 100)
            {
                baseV = Math.Min(baseV, result.ScrollWidth);
            }

            result.Viewport = Math.Max(100, baseV + viewportAdjustPx);
            return result;
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
            out double effectiveScrollWidth)
        {
            selected = null;
            effectiveScrollWidth = 0;

            var expected = GetExpectedLibraryWidth(window, api);
            var maxW = window.ActualWidth > 0 ? window.ActualWidth * 0.99 : double.MaxValue;

            double bestWidth = 0;
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
                    bestSv = sv;
                }
            }

            if (bestSv != null && bestWidth > 100)
            {
                selected = bestSv;
                effectiveScrollWidth = bestWidth;
                return true;
            }

            return false;
        }

        private static double GetMaxItemsPresenterWidthUnder(ScrollViewer scrollViewer)
        {
            if (scrollViewer == null)
            {
                return 0;
            }

            var best = 0.0;
            foreach (var d in EnumerateDescendants(scrollViewer))
            {
                if (d is ItemsPresenter ip && ip.IsVisible && !double.IsNaN(ip.ActualWidth))
                {
                    if (ip.ActualWidth > best)
                    {
                        best = ip.ActualWidth;
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
