using System.Collections.Generic;
using System.Linq;
using System.Windows;
using System.Windows.Media;
using Playnite.SDK;
using Playnite.SDK.Data;


namespace GameHoverDetails
{
    public partial class GameHoverDetailsSettings
    {
        internal static string NormalizeIconChipShape(string value)
        {
            if (string.Equals(value, IconChipShapeRectangle, System.StringComparison.OrdinalIgnoreCase)
                || string.Equals(value, "Square", System.StringComparison.OrdinalIgnoreCase))
            {
                return IconChipShapeRectangle;
            }

            if (string.Equals(value, IconChipShapeRounded, System.StringComparison.OrdinalIgnoreCase)
                || string.Equals(value, "RoundedRectangle", System.StringComparison.OrdinalIgnoreCase))
            {
                return IconChipShapeRounded;
            }

            if (string.Equals(value, IconChipShapeSoftRounded, System.StringComparison.OrdinalIgnoreCase))
            {
                return IconChipShapeSoftRounded;
            }

            if (string.Equals(value, IconChipShapeSquircle, System.StringComparison.OrdinalIgnoreCase))
            {
                return IconChipShapeSquircle;
            }

            if (string.Equals(value, IconChipShapeArch, System.StringComparison.OrdinalIgnoreCase))
            {
                return IconChipShapeArch;
            }

            if (string.Equals(value, IconChipShapeTile, System.StringComparison.OrdinalIgnoreCase))
            {
                return IconChipShapeTile;
            }

            if (string.Equals(value, IconChipShapeLeaf, System.StringComparison.OrdinalIgnoreCase))
            {
                return IconChipShapeLeaf;
            }

            return IconChipShapeCircle;
        }

        internal static CornerRadius ResolveIconChipCornerRadius(string shape, double chipSize)
        {
            var half = chipSize / 2.0;
            if (half < 0)
            {
                half = 0;
            }

            switch (NormalizeIconChipShape(shape))
            {
                case IconChipShapeRectangle:
                    return new CornerRadius(0);
                case IconChipShapeRounded:
                    return new CornerRadius(System.Math.Max(3, chipSize * 0.18));
                case IconChipShapeSoftRounded:
                    return new CornerRadius(System.Math.Max(4, chipSize * 0.28));
                case IconChipShapeSquircle:
                    return new CornerRadius(System.Math.Max(6, chipSize * 0.38));
                case IconChipShapeArch:
                    return new CornerRadius(half, half, 0, 0);
                case IconChipShapeTile:
                    return new CornerRadius(0, 0, half, half);
                case IconChipShapeLeaf:
                    return new CornerRadius(half, 0, half, 0);
                default:
                    return new CornerRadius(half);
            }
        }

        private static int ClampIconChipPaddingDip(int v) => Clamp(v, MinIconChipPaddingDip, MaxIconChipPaddingDip);

        internal static string NormalizeIconStyle(string value)
        {
            if (string.Equals(value, IconStylePhosphor, System.StringComparison.OrdinalIgnoreCase))
            {
                return IconStylePhosphor;
            }

            if (string.Equals(value, IconStyleHugeIcons, System.StringComparison.OrdinalIgnoreCase)
                || string.Equals(value, "Huge", System.StringComparison.OrdinalIgnoreCase)
                || string.Equals(value, "Hugeicons", System.StringComparison.OrdinalIgnoreCase))
            {
                return IconStyleHugeIcons;
            }

            if (string.Equals(value, IconStyleSketchy, System.StringComparison.OrdinalIgnoreCase)
                || string.Equals(value, "SketchyIcons", System.StringComparison.OrdinalIgnoreCase))
            {
                return IconStyleSketchy;
            }

            if (string.Equals(value, IconStyleIconsax, System.StringComparison.OrdinalIgnoreCase)
                || string.Equals(value, "IconsaxBulk", System.StringComparison.OrdinalIgnoreCase))
            {
                return IconStyleIconsax;
            }

            if (string.Equals(value, IconStylePixelarticons, System.StringComparison.OrdinalIgnoreCase)
                || string.Equals(value, "PixelArtIcons", System.StringComparison.OrdinalIgnoreCase)
                || string.Equals(value, "pixelart-icons", System.StringComparison.OrdinalIgnoreCase))
            {
                return IconStylePixelarticons;
            }

            if (string.Equals(value, IconStylePixel, System.StringComparison.OrdinalIgnoreCase)
                || string.Equals(value, "PixelIconLibrary", System.StringComparison.OrdinalIgnoreCase)
                || string.Equals(value, "HackerNoon", System.StringComparison.OrdinalIgnoreCase))
            {
                return IconStylePixel;
            }

            return IconStyleUnicons;
        }

        private static double ClampBodyFontSize(double v) => Clamp(v, MinBodyFontSize, MaxBodyFontSize);

        private static double ClampTitleFontSize(double v) => Clamp(v, MinTitleFontSize, MaxTitleFontSize);

        private static int ClampIconChipSizeDip(int v) => Clamp(v, MinIconChipSizeDip, MaxIconChipSizeDip);

        private static string NormalizeBackgroundStyle(string value)
        {
            if (string.Equals(value, BackgroundStyleGameCover, System.StringComparison.OrdinalIgnoreCase)
                || string.Equals(value, "GameBackground", System.StringComparison.OrdinalIgnoreCase)
                || string.Equals(value, "Background", System.StringComparison.OrdinalIgnoreCase))
            {
                return BackgroundStyleGameCover;
            }

            return BackgroundStyleRegular;
        }

        private static int ClampWidth(int v) => Clamp(v, MinWidth, MaxWidth);

        private static int ClampShowDelayMs(int v) => Clamp(v, MinShowDelayMs, MaxShowDelayMs);

        private static int ClampFieldBlockSpacingDip(int v) => Clamp(v, MinFieldBlockSpacingDip, MaxFieldBlockSpacingDip);

        private static int ClampFieldColumnCount(int v) => Clamp(v, MinFieldColumnCount, MaxFieldColumnCount);

        private static int ClampContentPaddingDip(int v) => Clamp(v, MinContentPaddingDip, MaxContentPaddingDip);

        private static int ClampChromeOpacity(int v) => Clamp(v, MinChromeOpacity, MaxChromeOpacity);

        private static int Clamp(int v, int min, int max)
        {
            if (v < min)
            {
                return min;
            }

            return v > max ? max : v;
        }

        private static double Clamp(double v, double min, double max)
        {
            if (v < min)
            {
                return min;
            }

            return v > max ? max : v;
        }

        private static List<string> NormalizeKeys(List<string> keys)
        {
            var seen = new HashSet<string>();
            var list = new List<string>();
            foreach (var k in keys ?? new List<string>())
            {
                if (string.IsNullOrEmpty(k) || !HoverFieldCatalog.IsKnownKey(k) || seen.Contains(k))
                {
                    continue;
                }

                seen.Add(k);
                list.Add(k);
            }

            if (list.Count == 0)
            {
                return new List<string>(FactoryDefaultSelectedKeys);
            }

            return list;
        }

        private static bool ListsEqual(List<string> a, List<string> b)
        {
            if (ReferenceEquals(a, b))
            {
                return true;
            }

            if (a == null || b == null || a.Count != b.Count)
            {
                return false;
            }

            for (var i = 0; i < a.Count; i++)
            {
                if (!string.Equals(a[i], b[i], System.StringComparison.Ordinal))
                {
                    return false;
                }
            }

            return true;
        }
    }
}
