using System;
using System.Globalization;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Documents;
using System.Windows.Media;

namespace GameHoverDetails
{
    /// <summary>
    /// Resolves hover panel chrome and text brushes from Playnite theme resources or custom settings.
    /// </summary>
    internal sealed class HoverChromePalette
    {
        /// <summary>Opaque black overlay; live opacity comes from the background-opacity slider (100% = #000000).</summary>
        public const byte CoverTintAlpha = 255;

        public const string DefaultFillHex = "#FF1C1C1E";
        public const string DefaultBorderHex = "#FF48484E";
        public const string DefaultDividerHex = "#FF444444";
        public const string DefaultIconBackgroundHex = "#FF121212";

        public static readonly Color FallbackFillColor = Color.FromRgb(28, 28, 30);
        public static readonly Color FallbackBorderColor = Color.FromRgb(72, 72, 78);
        public static readonly Color FallbackBodyColor = Color.FromRgb(230, 230, 230);
        public static readonly Color FallbackChipBackgroundColor = Color.FromRgb(18, 18, 18);

        private static readonly SolidColorBrush FallbackFillBrush = Freeze(FallbackFillColor);
        private static readonly SolidColorBrush FallbackBodyBrush = Freeze(FallbackBodyColor);
        private static readonly SolidColorBrush CoverTintSolid = Freeze(Color.FromArgb(CoverTintAlpha, 0, 0, 0));

        public static Brush CoverTintBrush => CoverTintSolid;

        public Brush Fill { get; private set; }
        public Brush Border { get; private set; }
        public Brush BodyText { get; private set; }
        public Brush LabelText { get; private set; }
        public Brush GlyphChipBackground { get; private set; }
        public Brush GlyphChipGlyph { get; private set; }
        public Brush Separator { get; private set; }

        public static HoverChromePalette Resolve(GameHoverDetailsSettings settings)
        {
            var palette = settings == null || settings.UseThemeChrome
                ? ResolveTheme(settings)
                : ResolveCustom(settings);

            if (settings != null && settings.HideIconChipBackground)
            {
                palette.GlyphChipBackground = Brushes.Transparent;
            }

            return palette;
        }

        /// <summary>Theme-derived picker colors (opaque ARGB hex).</summary>
        public sealed class ThemeChromeHexes
        {
            public string Fill { get; set; }
            public string Border { get; set; }
            public string Divider { get; set; }
            public string IconBackground { get; set; }
        }

        /// <summary>Accent-dark fill/border plus icon-chip hex for theme-sync pickers. Text and icons always follow Playnite <c>TextBrush</c>.</summary>
        public static bool TryComputeThemeChromeHexes(out ThemeChromeHexes hexes)
        {
            var accent = TryGetThemeAccentColor();
            var fill = ThemeFillFromAccent(accent);
            var border = ThemeBorderFromFillAndAccent(fill, accent);
            var divider = ThemeDividerFromBorder(border);
            var iconBg = DarkenTowardBlack(accent, 0.62);

            fill.A = 255;
            border.A = 255;
            divider.A = 255;
            iconBg.A = 255;

            hexes = new ThemeChromeHexes
            {
                Fill = ToHex(fill),
                Border = ToHex(border),
                Divider = ToHex(divider),
                IconBackground = ToHex(iconBg)
            };
            return true;
        }

        public static void ApplyToChromeBorder(Border border, GameHoverDetailsSettings settings, bool coverImageActive = false)
        {
            if (border == null)
            {
                return;
            }

            var palette = Resolve(settings);
            border.Background = coverImageActive ? Brushes.Transparent : palette.Fill;
            border.BorderBrush = palette.Border;
            border.BorderThickness = settings != null && settings.HidePanelBorder
                ? new Thickness(0)
                : new Thickness(1);
        }

        public static string ContentFingerprint(GameHoverDetailsSettings settings)
        {
            if (settings == null)
            {
                return "theme|100";
            }

            var opacity = settings.HoverChromeBackgroundOpacity.ToString(CultureInfo.InvariantCulture);
            var style = settings.HoverBackgroundStyle ?? GameHoverDetailsSettings.BackgroundStyleRegular;
            var chipBg = settings.HideIconChipBackground ? "off" : "on";
            var panelBorder = settings.HidePanelBorder ? "off" : "on";
            if (settings.UseThemeChrome)
            {
                return "theme|" + opacity + "|" + style + "|" + chipBg + "|" + panelBorder;
            }

            return "custom|"
                + (settings.HoverChromeBackgroundHex ?? string.Empty)
                + "|"
                + (settings.HoverChromeBorderHex ?? string.Empty)
                + "|"
                + (settings.HoverChromeDividerHex ?? string.Empty)
                + "|"
                + (settings.HoverChromeIconBackgroundHex ?? string.Empty)
                + "|"
                + opacity
                + "|"
                + style
                + "|"
                + chipBg
                + "|"
                + panelBorder;
        }

        public static Brush SwatchFromHex(string hex)
        {
            if (!TryParseHex(hex, out var color))
            {
                color = FallbackFillColor;
            }

            color.A = 255;
            return Freeze(color);
        }

        public static string ToHex(Color color)
        {
            return string.Format(
                CultureInfo.InvariantCulture,
                "#{0:X2}{1:X2}{2:X2}{3:X2}",
                color.A,
                color.R,
                color.G,
                color.B);
        }

        public static bool TryNormalizeHex(string value, out string hex)
        {
            hex = null;
            if (!TryParseHex(value, out var color))
            {
                return false;
            }

            color.A = 255;
            hex = ToHex(color);
            return true;
        }

        public static string NormalizeHexOrDefault(string value, string fallbackHex)
        {
            if (TryNormalizeHex(value, out var hex))
            {
                return hex;
            }

            if (TryNormalizeHex(fallbackHex, out var fb))
            {
                return fb;
            }

            return DefaultFillHex;
        }

        public static bool TryParseHex(string value, out Color color)
        {
            color = default;
            if (string.IsNullOrWhiteSpace(value))
            {
                return false;
            }

            var s = value.Trim();
            if (s[0] == '#')
            {
                s = s.Substring(1);
            }

            if (s.Length == 3)
            {
                if (!IsHexChar(s[0]) || !IsHexChar(s[1]) || !IsHexChar(s[2]))
                {
                    return false;
                }

                var r = HexNibble(s[0]);
                var g = HexNibble(s[1]);
                var b = HexNibble(s[2]);
                color = Color.FromRgb((byte)((r << 4) | r), (byte)((g << 4) | g), (byte)((b << 4) | b));
                return true;
            }

            uint packed;
            if (s.Length == 6)
            {
                if (!uint.TryParse(s, NumberStyles.HexNumber, CultureInfo.InvariantCulture, out packed))
                {
                    return false;
                }

                color = Color.FromRgb(
                    (byte)((packed >> 16) & 0xFF),
                    (byte)((packed >> 8) & 0xFF),
                    (byte)(packed & 0xFF));
                return true;
            }

            if (s.Length == 8)
            {
                if (!uint.TryParse(s, NumberStyles.HexNumber, CultureInfo.InvariantCulture, out packed))
                {
                    return false;
                }

                color = Color.FromArgb(
                    (byte)((packed >> 24) & 0xFF),
                    (byte)((packed >> 16) & 0xFF),
                    (byte)((packed >> 8) & 0xFF),
                    (byte)(packed & 0xFF));
                return true;
            }

            return false;
        }

        private static bool IsHexChar(char c)
        {
            return (c >= '0' && c <= '9') || (c >= 'A' && c <= 'F') || (c >= 'a' && c <= 'f');
        }

        private static int HexNibble(char c)
        {
            if (c >= '0' && c <= '9')
            {
                return c - '0';
            }

            if (c >= 'A' && c <= 'F')
            {
                return c - 'A' + 10;
            }

            return c - 'a' + 10;
        }

        private static HoverChromePalette ResolveTheme(GameHoverDetailsSettings settings)
        {
            var accent = TryGetThemeAccentColor();
            var fillColor = ThemeFillFromAccent(accent);
            var borderColor = ThemeBorderFromFillAndAccent(fillColor, accent);
            var chipBg = DarkenTowardBlack(accent, 0.62);
            var opacity = settings == null ? 100 : settings.HoverChromeBackgroundOpacity;
            ResolvePlayniteTextBrushes(out var body, out var label);
            var border = Freeze(borderColor);
            var divider = Freeze(ThemeDividerFromBorder(borderColor));

            return new HoverChromePalette
            {
                Fill = WithFillOpacity(Freeze(fillColor), opacity),
                Border = border,
                BodyText = body,
                LabelText = label,
                GlyphChipBackground = Freeze(chipBg),
                GlyphChipGlyph = body,
                Separator = divider
            };
        }

        private static HoverChromePalette ResolveCustom(GameHoverDetailsSettings settings)
        {
            if (!TryParseHex(settings.HoverChromeBackgroundHex, out var fillColor))
            {
                fillColor = FallbackFillColor;
            }

            fillColor.A = 255;
            var borderColor = ParseOpaqueOr(settings.HoverChromeBorderHex, FallbackBorderColor);
            var dividerColor = ParseOpaqueOr(settings.HoverChromeDividerHex, FallbackBorderColor);
            var iconBgColor = ParseOpaqueOr(settings.HoverChromeIconBackgroundHex, FallbackChipBackgroundColor);
            ResolvePlayniteTextBrushes(out var body, out var label);
            var border = Freeze(borderColor);

            return new HoverChromePalette
            {
                Fill = WithFillOpacity(Freeze(fillColor), settings.HoverChromeBackgroundOpacity),
                Border = border,
                BodyText = body,
                LabelText = label,
                GlyphChipBackground = Freeze(iconBgColor),
                GlyphChipGlyph = body,
                Separator = Freeze(dividerColor)
            };
        }

        /// <summary>Body, labels, and icon glyphs always use Playnite <c>TextBrush</c>.</summary>
        private static void ResolvePlayniteTextBrushes(out Brush body, out Brush label)
        {
            body = FindBrush("TextBrush") ?? FallbackBodyBrush;
            label = body;
        }

        /// <summary>
        /// Playnite injects the user/app typeface as <c>FontFamily</c> (default Trebuchet MS).
        /// WPF <c>Popup</c> does not inherit the main window font.
        /// </summary>
        public static FontFamily ResolvePlayniteFontFamily(DependencyObject inheritFrom = null)
        {
            var fromApp = FindFontFamily("FontFamily");
            if (fromApp != null)
            {
                return fromApp;
            }

            if (inheritFrom != null)
            {
                var inherited = TextElement.GetFontFamily(inheritFrom);
                if (inherited != null)
                {
                    return inherited;
                }
            }

            var window = Application.Current?.MainWindow;
            if (window != null)
            {
                return window.FontFamily;
            }

            return new FontFamily("Trebuchet MS");
        }

        /// <summary>Darker, slightly desaturated accent mixed further toward black for panel fill.</summary>
        private static Color ThemeFillFromAccent(Color accent)
        {
            return DarkenTowardBlack(Desaturate(accent, 0.22), 0.92);
        }

        private static Color ThemeBorderFromFillAndAccent(Color fill, Color accent)
        {
            var border = Lerp(fill, accent, 0.38);
            var popupBorder = TryGetSolidColor(FindBrush("PopupBorderBrush"));
            if (popupBorder.HasValue)
            {
                border = Lerp(popupBorder.Value, accent, 0.45);
            }

            return border;
        }

        private static Color ThemeDividerFromBorder(Color border)
        {
            return Lerp(border, Colors.White, 0.18);
        }

        private static Color Desaturate(Color c, double amount)
        {
            var gray = (byte)Math.Round((0.299 * c.R) + (0.587 * c.G) + (0.114 * c.B));
            return Lerp(c, Color.FromRgb(gray, gray, gray), amount);
        }

        private static Color ParseOpaqueOr(string hex, Color fallback)
        {
            if (!TryParseHex(hex, out var color))
            {
                return fallback;
            }

            color.A = 255;
            return color;
        }

        private static Color TryGetThemeAccentColor()
        {
            var fromGlyph = TryGetSolidColor(FindBrush("GlyphBrush"));
            if (fromGlyph.HasValue)
            {
                return fromGlyph.Value;
            }

            var glyphColor = FindColor("GlyphColor");
            if (glyphColor.HasValue)
            {
                return glyphColor.Value;
            }

            var popup = TryGetSolidColor(FindBrush("PopupBackgroundBrush"));
            if (popup.HasValue)
            {
                return popup.Value;
            }

            return FallbackFillColor;
        }

        private static Color DarkenTowardBlack(Color c, double blackAmount)
        {
            return Lerp(c, Colors.Black, blackAmount);
        }

        private static Color Lerp(Color a, Color b, double t)
        {
            if (t < 0)
            {
                t = 0;
            }
            else if (t > 1)
            {
                t = 1;
            }

            return Color.FromRgb(
                LerpByte(a.R, b.R, t),
                LerpByte(a.G, b.G, t),
                LerpByte(a.B, b.B, t));
        }

        private static byte LerpByte(byte a, byte b, double t)
        {
            return (byte)Math.Round(a + ((b - a) * t));
        }

        private static Color? TryGetSolidColor(Brush brush)
        {
            if (brush is SolidColorBrush scb)
            {
                return scb.Color;
            }

            return null;
        }

        private static Color? FindColor(string key)
        {
            try
            {
                var app = Application.Current;
                if (app == null)
                {
                    return null;
                }

                if (app.TryFindResource(key) is Color c)
                {
                    return c;
                }
            }
            catch
            {
                // ignore
            }

            return null;
        }

        private static Brush WithFillOpacity(Brush source, int opacityPercent)
        {
            if (source == null)
            {
                return FallbackFillBrush;
            }

            var o = opacityPercent;
            if (o < 0)
            {
                o = 0;
            }
            else if (o > 100)
            {
                o = 100;
            }

            var factor = o / 100.0;
            if (factor >= 0.999 && source.Opacity >= 0.999)
            {
                return source;
            }

            var clone = source.IsFrozen ? source.Clone() : source.CloneCurrentValue();
            clone.Opacity = factor;
            if (clone.CanFreeze)
            {
                clone.Freeze();
            }

            return clone;
        }

        private static Brush FindBrush(string key)
        {
            try
            {
                var app = Application.Current;
                if (app == null)
                {
                    return null;
                }

                return app.TryFindResource(key) as Brush;
            }
            catch
            {
                return null;
            }
        }

        private static FontFamily FindFontFamily(string key)
        {
            try
            {
                var app = Application.Current;
                if (app == null)
                {
                    return null;
                }

                return app.TryFindResource(key) as FontFamily;
            }
            catch
            {
                return null;
            }
        }

        private static SolidColorBrush Freeze(Color color)
        {
            var b = new SolidColorBrush(color);
            if (b.CanFreeze)
            {
                b.Freeze();
            }

            return b;
        }
    }
}
