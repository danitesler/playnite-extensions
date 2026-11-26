using System;
using System.Windows.Controls;

namespace Autogrid
{
    /// <summary>
    /// Where the grid was scrolled before the game details panel toggled, kept as a share of the
    /// list rather than in pixels. VirtualizingWrapPanel 2.5.x stores a pixel offset and only ever
    /// clamps it down (EnsureValidScrollOffset). Toggling the panel with covers resizing passes
    /// through a layout where the covers still have their old size in the new width, so the list is
    /// briefly much shorter (more tiles per row) and a deep offset is clamped. When Autogrid then
    /// re-fits the covers the list grows back but the offset stays: from the bottom of the library
    /// the grid lands near the top. Mid-list, the unscaled offset also drifts to other rows.
    /// The column count is the same before and after the re-fit, so the same share of the extent
    /// is the same row.
    /// </summary>
    public struct GridScrollAnchor
    {
        private const double EdgeTolerancePx = 1;

        public bool AtTop { get; private set; }
        public bool AtBottom { get; private set; }

        /// <summary>Vertical offset divided by the extent height.</summary>
        public double Share { get; private set; }

        public static GridScrollAnchor? Capture(ScrollViewer scrollViewer)
        {
            if (scrollViewer == null)
            {
                return null;
            }

            return Capture(scrollViewer.VerticalOffset, scrollViewer.ExtentHeight, scrollViewer.ViewportHeight);
        }

        public static GridScrollAnchor? Capture(double offset, double extent, double viewport)
        {
            if (!IsUsable(extent) || !IsUsable(viewport) || double.IsNaN(offset))
            {
                return null;
            }

            if (offset < EdgeTolerancePx || extent <= viewport)
            {
                return new GridScrollAnchor { AtTop = true };
            }

            if (offset + viewport >= extent - EdgeTolerancePx)
            {
                return new GridScrollAnchor { AtBottom = true };
            }

            return new GridScrollAnchor { Share = offset / extent };
        }

        public double TargetOffset(double extent, double viewport)
        {
            var max = Math.Max(0, extent - viewport);
            if (AtTop)
            {
                return 0;
            }

            if (AtBottom)
            {
                return max;
            }

            return Math.Max(0, Math.Min(max, Share * extent));
        }

        /// <summary>Scrolls back to the anchor. Returns true when the offset had moved.</summary>
        public bool Restore(ScrollViewer scrollViewer)
        {
            if (scrollViewer == null || !IsUsable(scrollViewer.ExtentHeight) || !IsUsable(scrollViewer.ViewportHeight))
            {
                return false;
            }

            var target = TargetOffset(scrollViewer.ExtentHeight, scrollViewer.ViewportHeight);
            if (Math.Abs(target - scrollViewer.VerticalOffset) < EdgeTolerancePx)
            {
                return false;
            }

            scrollViewer.ScrollToVerticalOffset(target);
            return true;
        }

        private static bool IsUsable(double value) => value > 0 && !double.IsNaN(value) && !double.IsInfinity(value);
    }
}
