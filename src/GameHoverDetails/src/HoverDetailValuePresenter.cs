using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Globalization;
using System.Net;
using System.Text.RegularExpressions;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Documents;
using System.Windows.Media;
using System.Windows.Navigation;

namespace GameHoverDetails
{
    /// <summary>
    /// Builds hover value UI: optional HTML to <see cref="TextBlock.Inlines"/>, max 3 lines with ellipsis.
    /// </summary>
    internal static class HoverDetailValuePresenter
    {
        public const int MaxValueLines = 3;

        private static readonly Regex TagRegex = new Regex(
            @"<\s*(/?)\s*([a-zA-Z][\w:.-]*)([^>]*)>",
            RegexOptions.Compiled | RegexOptions.CultureInvariant);

        private static readonly Regex ScriptStyleRegex = new Regex(
            @"<(script|style)[^>]*>[\s\S]*?</\1>",
            RegexOptions.IgnoreCase | RegexOptions.Compiled);

        private static readonly Regex XmlCommentRegex = new Regex(@"<!--[\s\S]*?-->", RegexOptions.Compiled);

        private static readonly Regex EmbeddedObjectRegex = new Regex(
            @"<(iframe|object|embed)[^>]*>[\s\S]*?</\1>|<(iframe|object|embed)[^>]*/>",
            RegexOptions.IgnoreCase | RegexOptions.Compiled);

        private sealed class ElementFrame
        {
            public ElementFrame(InlineCollection inlines, string tag)
            {
                Inlines = inlines;
                Tag = tag;
            }

            public InlineCollection Inlines { get; }
            public string Tag { get; }
        }

        public static void ConfigureBodyTextBlock(TextBlock block, double innerMax, Brush foreground)
        {
            block.Text = null;
            block.Inlines.Clear();
            block.FontSize = 13;
            block.Foreground = foreground;
            block.TextWrapping = TextWrapping.Wrap;
            block.MaxWidth = innerMax;
            block.TextTrimming = TextTrimming.CharacterEllipsis;
            block.LineHeight = 18;
            block.MaxHeight = block.LineHeight * MaxValueLines;
            block.ClipToBounds = true;
            block.IsHitTestVisible = true;
        }

        public static void ConfigureHeaderTextBlock(TextBlock header, double innerMax)
        {
            header.LineHeight = 16;
            header.MaxHeight = header.LineHeight * MaxValueLines;
            header.TextWrapping = TextWrapping.Wrap;
            header.TextTrimming = TextTrimming.CharacterEllipsis;
            header.ClipToBounds = true;
            header.MaxWidth = innerMax;
        }

        /// <summary>
        /// Muted field title (hover + settings preview): small caps, secondary color.
        /// </summary>
        public static void ConfigureFieldLabelTextBlock(TextBlock label, double innerMax)
        {
            label.FontWeight = FontWeights.Normal;
            label.FontSize = 10.5;
            label.Foreground = new SolidColorBrush(Color.FromRgb(152, 152, 157));
            label.LineHeight = 14;
            label.MaxHeight = label.LineHeight * MaxValueLines;
            label.TextWrapping = TextWrapping.Wrap;
            label.TextTrimming = TextTrimming.CharacterEllipsis;
            label.ClipToBounds = true;
            label.MaxWidth = innerMax;
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
            if (string.IsNullOrWhiteSpace(raw))
            {
                block.Inlines.Add(new Run("—"));
                return;
            }

            var decoded = WebUtility.HtmlDecode(raw);
            var cleaned = StripUnsafeAndComments(decoded);
            if (string.IsNullOrWhiteSpace(cleaned))
            {
                block.Inlines.Add(new Run("—"));
                return;
            }

            var flat = FlattenHtmlForMeasure(cleaned);
            var tf = new Typeface(block.FontFamily, block.FontStyle, block.FontWeight, block.FontStretch);
            var maxH = block.LineHeight * MaxValueLines - 1;

            if (FormattedTextHeight(flat, block.MaxWidth, tf, block.FontSize) > maxH)
            {
                var truncated = ClampPlainToMaxHeight(flat, block.MaxWidth, tf, block.FontSize, maxH);
                block.Inlines.Add(new Run(truncated));
                return;
            }

            if (cleaned.IndexOf('<') < 0)
            {
                block.Inlines.Add(new Run(cleaned));
                return;
            }

            try
            {
                ParseHtmlToInlines(block.Inlines, cleaned);
            }
            catch
            {
                block.Inlines.Clear();
                var plain = WebUtility.HtmlDecode(Regex.Replace(raw, "<[^>]+>", string.Empty));
                if (string.IsNullOrWhiteSpace(plain))
                {
                    block.Inlines.Add(new Run("—"));
                }
                else
                {
                    block.Inlines.Add(new Run(plain));
                }
            }
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
                CultureInfo.CurrentCulture,
                FlowDirection.LeftToRight,
                typeface,
                emSize,
                Brushes.Black);
#pragma warning restore 618
            ft.MaxTextWidth = w;
            return ft.Height;
        }

        private static string FlattenHtmlForMeasure(string html)
        {
            if (string.IsNullOrEmpty(html))
            {
                return string.Empty;
            }

            var s = Regex.Replace(html, @"<br\s*/?>", "\n", RegexOptions.IgnoreCase);
            s = Regex.Replace(s, @"</(p|div|h[1-6]|li|tr)\s*>", "\n", RegexOptions.IgnoreCase);
            s = Regex.Replace(s, @"<[^>]+>", " ");
            s = Regex.Replace(s, @"[ \t\f\v]+", " ");
            s = Regex.Replace(s, @"(\r?\n)\s*\1+", "\n");
            return s.Trim();
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

        private static string StripUnsafeAndComments(string s)
        {
            if (string.IsNullOrEmpty(s))
            {
                return s;
            }

            s = XmlCommentRegex.Replace(s, string.Empty);
            s = ScriptStyleRegex.Replace(s, string.Empty);
            s = EmbeddedObjectRegex.Replace(s, string.Empty);
            return s;
        }

        private static void ParseHtmlToInlines(InlineCollection rootInlines, string s)
        {
            var stack = new Stack<ElementFrame>();
            stack.Push(new ElementFrame(rootInlines, "#root"));
            var index = 0;
            while (index < s.Length)
            {
                var m = TagRegex.Match(s, index);
                if (!m.Success)
                {
                    AppendText(stack.Peek().Inlines, s.Substring(index));
                    break;
                }

                if (m.Index > index)
                {
                    AppendText(stack.Peek().Inlines, s.Substring(index, m.Index - index));
                }

                var isClose = m.Groups[1].Value.Length > 0;
                var tagName = m.Groups[2].Value.ToLowerInvariant();
                var attrs = m.Groups[3].Value ?? string.Empty;
                var selfClosing = attrs.TrimEnd().EndsWith("/", StringComparison.Ordinal);
                index = m.Index + m.Length;

                if (IsVoidElement(tagName) || selfClosing)
                {
                    if (tagName == "br" || tagName == "wbr")
                    {
                        stack.Peek().Inlines.Add(new LineBreak());
                    }
                    else if (tagName == "hr")
                    {
                        stack.Peek().Inlines.Add(new LineBreak());
                        stack.Peek().Inlines.Add(new Run("────────"));
                        stack.Peek().Inlines.Add(new LineBreak());
                    }
                    else if (tagName == "img")
                    {
                        var alt = TryParseAttribute(attrs, "alt");
                        if (!string.IsNullOrWhiteSpace(alt))
                        {
                            AppendText(stack.Peek().Inlines, "[" + alt.Trim() + "] ");
                        }
                    }

                    continue;
                }

                if (isClose)
                {
                    PopUntilTag(stack, tagName);
                    continue;
                }

                OpenTag(stack, tagName, attrs);
            }
        }

        private static bool IsVoidElement(string tag) =>
            tag == "br" || tag == "hr" || tag == "wbr" || tag == "meta" || tag == "link" ||
            tag == "img" || tag == "input" || tag == "area" || tag == "base" || tag == "col" ||
            tag == "source" || tag == "track";

        private static void OpenTag(Stack<ElementFrame> stack, string tag, string attrs)
        {
            var parent = stack.Peek().Inlines;
            switch (tag)
            {
                case "b":
                case "strong":
                    var bold = new Bold();
                    parent.Add(bold);
                    stack.Push(new ElementFrame(bold.Inlines, "b"));
                    break;
                case "i":
                case "em":
                    var italic = new Italic();
                    parent.Add(italic);
                    stack.Push(new ElementFrame(italic.Inlines, "i"));
                    break;
                case "u":
                    var under = new Span { TextDecorations = TextDecorations.Underline };
                    parent.Add(under);
                    stack.Push(new ElementFrame(under.Inlines, "u"));
                    break;
                case "a":
                    if (TryParseHref(attrs, out var uri))
                    {
                        var hl = new Hyperlink
                        {
                            NavigateUri = uri,
                            Foreground = new SolidColorBrush(Color.FromRgb(140, 180, 255)),
                            TextDecorations = null
                        };
                        hl.RequestNavigate += HyperlinkOnRequestNavigate;
                        parent.Add(hl);
                        stack.Push(new ElementFrame(hl.Inlines, "a"));
                    }
                    else
                    {
                        var span = new Span();
                        parent.Add(span);
                        stack.Push(new ElementFrame(span.Inlines, "a"));
                    }

                    break;
                case "p":
                case "div":
                case "section":
                case "article":
                case "header":
                case "footer":
                case "h1":
                case "h2":
                case "h3":
                case "h4":
                case "h5":
                case "h6":
                case "blockquote":
                    MaybePrefixLineBreak(parent);
                    var blockSpan = new Span();
                    parent.Add(blockSpan);
                    stack.Push(new ElementFrame(blockSpan.Inlines, tag));
                    break;
                case "ul":
                case "ol":
                    MaybePrefixLineBreak(parent);
                    var listWrap = new Span();
                    parent.Add(listWrap);
                    stack.Push(new ElementFrame(listWrap.Inlines, tag));
                    break;
                case "li":
                    MaybePrefixLineBreak(parent);
                    parent.Add(new Run("• "));
                    var li = new Span();
                    parent.Add(li);
                    stack.Push(new ElementFrame(li.Inlines, "li"));
                    break;
                case "pre":
                case "code":
                    MaybePrefixLineBreak(parent);
                    var mono = new Span { FontFamily = new FontFamily("Consolas") };
                    parent.Add(mono);
                    stack.Push(new ElementFrame(mono.Inlines, tag));
                    break;
                case "span":
                case "font":
                case "small":
                case "sup":
                case "sub":
                case "mark":
                case "del":
                case "ins":
                    var s2 = new Span();
                    parent.Add(s2);
                    stack.Push(new ElementFrame(s2.Inlines, tag));
                    break;
                default:
                    var unk = new Span();
                    parent.Add(unk);
                    stack.Push(new ElementFrame(unk.Inlines, tag));
                    break;
            }
        }

        private static void MaybePrefixLineBreak(InlineCollection col)
        {
            if (col.Count == 0)
            {
                return;
            }

            Inline last = null;
            foreach (Inline il in col)
            {
                last = il;
            }

            if (last is LineBreak)
            {
                return;
            }

            col.Add(new LineBreak());
        }

        private static void PopUntilTag(Stack<ElementFrame> stack, string closingTag)
        {
            var target = CanonicalCloseTag(closingTag);
            while (stack.Count > 1)
            {
                var top = stack.Peek();
                if (TagsMatchClose(top.Tag, target))
                {
                    var popped = stack.Pop();
                    if (IsBlockishAfterClose(popped.Tag))
                    {
                        stack.Peek().Inlines.Add(new LineBreak());
                    }

                    return;
                }

                stack.Pop();
            }
        }

        private static bool TagsMatchClose(string openTag, string closeCanon)
        {
            return CanonicalCloseTag(openTag) == closeCanon;
        }

        private static string CanonicalCloseTag(string tag)
        {
            switch (tag.ToLowerInvariant())
            {
                case "strong":
                    return "b";
                case "em":
                    return "i";
                default:
                    return tag.ToLowerInvariant();
            }
        }

        private static bool IsBlockishAfterClose(string tag)
        {
            switch (tag)
            {
                case "p":
                case "div":
                case "section":
                case "article":
                case "header":
                case "footer":
                case "h1":
                case "h2":
                case "h3":
                case "h4":
                case "h5":
                case "h6":
                case "blockquote":
                case "ul":
                case "ol":
                case "li":
                case "pre":
                case "code":
                    return true;
                default:
                    return false;
            }
        }

        private static void AppendText(InlineCollection col, string text)
        {
            if (string.IsNullOrEmpty(text))
            {
                return;
            }

            col.Add(new Run(text));
        }

        private static bool TryParseHref(string attrs, out Uri uri)
        {
            uri = null;
            var href = TryParseAttribute(attrs, "href");
            if (string.IsNullOrWhiteSpace(href))
            {
                return false;
            }

            href = href.Trim();
            if (href.StartsWith("//", StringComparison.Ordinal))
            {
                href = "https:" + href;
            }

            return Uri.TryCreate(href, UriKind.Absolute, out uri) &&
                   (uri.Scheme == Uri.UriSchemeHttp || uri.Scheme == Uri.UriSchemeHttps);
        }

        private static string TryParseAttribute(string attrs, string name)
        {
            if (string.IsNullOrEmpty(attrs))
            {
                return null;
            }

            var m = Regex.Match(
                attrs,
                name + @"\s*=\s*""([^""]*)""",
                RegexOptions.IgnoreCase | RegexOptions.CultureInvariant);
            if (m.Success)
            {
                return m.Groups[1].Value;
            }

            m = Regex.Match(
                attrs,
                name + @"\s*=\s*'([^']*)'",
                RegexOptions.IgnoreCase | RegexOptions.CultureInvariant);
            if (m.Success)
            {
                return m.Groups[1].Value;
            }

            return null;
        }

        private static void HyperlinkOnRequestNavigate(object sender, RequestNavigateEventArgs e)
        {
            try
            {
                Process.Start(new ProcessStartInfo(e.Uri.AbsoluteUri) { UseShellExecute = true });
            }
            catch
            {
                // ignore
            }

            e.Handled = true;
        }
    }
}
