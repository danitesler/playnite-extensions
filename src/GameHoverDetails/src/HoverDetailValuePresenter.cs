using System.Globalization;
using System.Net;
using System.Text.RegularExpressions;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Documents;
using System.Windows.Media;

namespace GameHoverDetails
{
    /// <summary>
    /// Builds hover value UI: plain text (HTML stripped), max 3 lines with ellipsis.
    /// </summary>
    internal static class HoverDetailValuePresenter
    {
        public const int MaxValueLines = 3;

        private static readonly Regex ScriptStyleRegex = new Regex(
            @"<(script|style)[^>]*>[\s\S]*?</\1>",
            RegexOptions.IgnoreCase | RegexOptions.Compiled);

        private static readonly Regex XmlCommentRegex = new Regex(@"<!--[\s\S]*?-->", RegexOptions.Compiled);

        private static readonly Regex EmbeddedObjectRegex = new Regex(
            @"<(iframe|object|embed)[^>]*>[\s\S]*?</\1>|<(iframe|object|embed)[^>]*/>",
            RegexOptions.IgnoreCase | RegexOptions.Compiled);

        public static void ConfigureBodyTextBlock(TextBlock block, double innerMax, Brush foreground)
        {
            ConfigureBodyTextBlock(block, innerMax, foreground, GameHoverDetailsSettings.DefaultBodyFontSize);
        }

        public static void ConfigureBodyTextBlock(TextBlock block, double innerMax, Brush foreground, double fontSize)
        {
            var size = fontSize > 0 ? fontSize : GameHoverDetailsSettings.DefaultBodyFontSize;
            block.Text = null;
            block.Inlines.Clear();
            block.FontFamily = HoverChromePalette.ResolvePlayniteFontFamily();
            block.FontSize = size;
            block.Foreground = foreground;
            block.TextWrapping = TextWrapping.Wrap;
            block.MaxWidth = innerMax;
            block.TextTrimming = TextTrimming.CharacterEllipsis;
            block.LineHeight = size * (18.0 / GameHoverDetailsSettings.BodyLineHeightReferenceFontSize);
            block.MaxHeight = block.LineHeight * MaxValueLines;
            block.ClipToBounds = true;
            block.IsHitTestVisible = true;
            block.FlowDirection = HoverLoc.LayoutFlow();
        }

        public static void ConfigureFieldLabelTextBlock(TextBlock label, double innerMax)
        {
            ConfigureFieldLabelTextBlock(label, innerMax, null);
        }

        /// <summary>
        /// Muted field title (hover + settings preview): small caps, secondary color.
        /// </summary>
        public static void ConfigureFieldLabelTextBlock(TextBlock label, double innerMax, Brush foreground)
        {
            ConfigureFieldLabelTextBlock(label, innerMax, foreground, GameHoverDetailsSettings.DefaultTitleFontSize);
        }

        public static void ConfigureFieldLabelTextBlock(TextBlock label, double innerMax, Brush foreground, double fontSize)
        {
            var size = fontSize > 0 ? fontSize : GameHoverDetailsSettings.DefaultTitleFontSize;
            label.FontFamily = HoverChromePalette.ResolvePlayniteFontFamily();
            label.FontWeight = FontWeights.Normal;
            label.FontSize = size;
            label.Foreground = foreground ?? new SolidColorBrush(Color.FromRgb(152, 152, 157));
            label.LineHeight = size * (14.0 / GameHoverDetailsSettings.TitleLineHeightReferenceFontSize);
            label.MaxHeight = label.LineHeight * MaxValueLines;
            label.TextWrapping = TextWrapping.Wrap;
            label.TextTrimming = TextTrimming.CharacterEllipsis;
            label.ClipToBounds = true;
            label.MaxWidth = innerMax;
            label.FlowDirection = HoverLoc.LayoutFlow();
            Typography.SetCapitals(label, FontCapitals.AllSmallCaps);
        }

        public static void SetHeaderText(TextBlock header, string label, double innerMax)
        {
            var text = label ?? string.Empty;
            var tf = new Typeface(header.FontFamily, header.FontStyle, header.FontWeight, header.FontStretch);
            var maxH = header.LineHeight * MaxValueLines;
            if (FormattedTextHeight(text, innerMax, tf, header.FontSize) <= maxH + 0.5)
            {
                header.Text = text;
                return;
            }

            header.Text = ClampPlainToMaxHeight(text, innerMax, tf, header.FontSize, maxH);
        }

        public static void SetBodyContent(TextBlock block, string raw)
        {
            block.Inlines.Clear();
            block.Text = null;
            var plain = HtmlToPlainText(raw);
            if (string.IsNullOrWhiteSpace(plain) || plain == HoverLoc.Empty)
            {
                block.Inlines.Add(new Run(HoverLoc.Empty));
                return;
            }

            var tf = new Typeface(block.FontFamily, block.FontStyle, block.FontWeight, block.FontStretch);
            var maxH = block.LineHeight * MaxValueLines - 1;
            if (FormattedTextHeight(plain, block.MaxWidth, tf, block.FontSize) > maxH)
            {
                plain = ClampPlainToMaxHeight(plain, block.MaxWidth, tf, block.FontSize, maxH);
            }

            block.Inlines.Add(new Run(plain));
        }

        /// <summary>Decode HTML, drop tags/comments/scripts, collapse whitespace. Safe for Description and other fields.</summary>
        public static string HtmlToPlainText(string raw)
        {
            if (string.IsNullOrWhiteSpace(raw))
            {
                return string.Empty;
            }

            var s = WebUtility.HtmlDecode(raw);
            if (string.IsNullOrEmpty(s))
            {
                return string.Empty;
            }

            s = XmlCommentRegex.Replace(s, string.Empty);
            s = ScriptStyleRegex.Replace(s, string.Empty);
            s = EmbeddedObjectRegex.Replace(s, string.Empty);
            s = Regex.Replace(s, @"<br\s*/?>", "\n", RegexOptions.IgnoreCase);
            s = Regex.Replace(s, @"</(p|div|h[1-6]|li|tr)\s*>", "\n", RegexOptions.IgnoreCase);
            s = Regex.Replace(s, @"<[^>]+>", " ");
            s = Regex.Replace(s, @"[ \t\f\v]+", " ");
            s = Regex.Replace(s, @"(\r?\n)\s*\1+", "\n");
            return s.Trim();
        }

        private static double FormattedTextHeight(string text, double maxWidth, Typeface typeface, double emSize)
        {
            if (string.IsNullOrEmpty(text))
            {
                return 0;
            }

            var w = double.IsNaN(maxWidth) || maxWidth <= 0 ? 256 : maxWidth;
#pragma warning disable 618
            var ft = new FormattedText(
                text,
                CultureInfo.CurrentUICulture,
                HoverLoc.LayoutFlow(),
                typeface,
                emSize,
                Brushes.Black);
#pragma warning restore 618
            ft.MaxTextWidth = w;
            return ft.Height;
        }

        private static string ClampPlainToMaxHeight(string flat, double maxWidth, Typeface typeface, double emSize, double maxHeight)
        {
            if (string.IsNullOrEmpty(flat))
            {
                return flat;
            }

            var w = double.IsNaN(maxWidth) || maxWidth <= 0 ? 256 : maxWidth;
            if (FormattedTextHeight(flat, w, typeface, emSize) <= maxHeight)
            {
                return flat;
            }

            var lo = 0;
            var hi = flat.Length;
            while (lo < hi)
            {
                var mid = (lo + hi + 1) / 2;
                var candidate = flat.Substring(0, mid).TrimEnd() + "\u2026";
                if (FormattedTextHeight(candidate, w, typeface, emSize) <= maxHeight)
                {
                    lo = mid;
                }
                else
                {
                    hi = mid - 1;
                }
            }

            if (lo <= 0)
            {
                return "\u2026";
            }

            return flat.Substring(0, lo).TrimEnd() + "\u2026";
        }
    }
}
