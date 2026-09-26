// Minimal SVG -> WPF converter for icon packs, used by scripts/render-icons.ps1.
// Compiled by Windows PowerShell's Add-Type (C# 5): no string interpolation, expression bodies or out var.
//
// Supports what icon sets use: <svg viewBox>, <g>, <path>, <circle>, <ellipse>, <rect rx/ry>, <line>, <polyline>,
// <polygon>; fill, stroke, stroke-width, stroke-linecap, stroke-linejoin, stroke-miterlimit, fill-rule, opacity,
// fill-opacity, stroke-opacity (as attributes or inline style, inherited through groups); transform (matrix,
// translate, scale, rotate, skewX, skewY). Not supported (reported as warnings): clipPath, mask, gradients, <use>, text.
using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Text;
using System.Text.RegularExpressions;
using System.Windows;
using System.Windows.Media;
using System.Xml.Linq;

namespace RepoIcons
{
    public class IconLayer
    {
        public Geometry Geometry;      // already in viewBox space, transforms applied
        public bool Filled;
        public double FillOpacity = 1;
        public bool Stroked;
        public double StrokeOpacity = 1;
        public double StrokeWidth = 1;
        public PenLineCap LineCap = PenLineCap.Flat;
        public PenLineJoin LineJoin = PenLineJoin.Miter;
        public double MiterLimit = 4;
        public Color? FillColor;       // null = use the render color
        public Color? StrokeColor;
    }

    public class SvgIcon
    {
        public Rect ViewBox;
        public List<IconLayer> Layers = new List<IconLayer>();
        public List<string> Warnings = new List<string>();

        static readonly CultureInfo Inv = CultureInfo.InvariantCulture;
        static readonly Regex Number = new Regex(@"[+-]?(\d+\.?\d*|\.\d+)([eE][+-]?\d+)?");

        public static SvgIcon Parse(string svgText)
        {
            var doc = XDocument.Parse(svgText);
            var root = doc.Root;
            var icon = new SvgIcon();
            var vb = Attr(root, "viewBox");
            if (vb != null)
            {
                var n = Numbers(vb);
                icon.ViewBox = new Rect(n[0], n[1], n[2], n[3]);
            }
            else
            {
                icon.ViewBox = new Rect(0, 0, Length(Attr(root, "width"), 24), Length(Attr(root, "height"), 24));
            }

            var style = new Dictionary<string, string>();
            style["fill"] = "black";
            icon.Walk(root, style, Matrix.Identity);
            return icon;
        }

        void Walk(XElement el, Dictionary<string, string> inherited, Matrix parent)
        {
            var style = new Dictionary<string, string>(inherited);
            style.Remove("opacity");
            foreach (var key in new[] { "fill", "stroke", "stroke-width", "stroke-linecap", "stroke-linejoin", "stroke-miterlimit",
                                        "fill-rule", "opacity", "fill-opacity", "stroke-opacity", "display", "visibility" })
            {
                var v = Attr(el, key);
                if (v != null) style[key] = v.Trim();
            }
            var inline = Attr(el, "style");
            if (inline != null)
            {
                foreach (var part in inline.Split(';'))
                {
                    var kv = part.Split(new[] { ':' }, 2);
                    if (kv.Length == 2) style[kv[0].Trim()] = kv[1].Trim();
                }
            }
            // Group opacity multiplies down the tree.
            double opacity = Prop(inherited, "_opacity", 1) * Prop(style, "opacity", 1);
            style["_opacity"] = opacity.ToString(Inv);

            if (Get(style, "display") == "none" || Get(style, "visibility") == "hidden") return;

            var matrix = parent;
            var t = Attr(el, "transform");
            if (t != null) matrix = Matrix.Multiply(ParseTransform(t), parent);

            var name = el.Name.LocalName;
            switch (name)
            {
                case "svg":
                case "g":
                case "a":
                    foreach (var child in el.Elements()) Walk(child, style, matrix);
                    return;
                case "title":
                case "desc":
                case "metadata":
                    return;
                case "defs":
                case "clipPath":
                case "mask":
                case "linearGradient":
                case "radialGradient":
                case "use":
                case "text":
                case "symbol":
                case "style":
                    Warnings.Add("<" + name + "> is not supported and was skipped");
                    return;
            }
            if (Attr(el, "clip-path") != null || Attr(el, "mask") != null)
                Warnings.Add("<" + name + "> uses clip-path/mask, which is ignored");

            Geometry geometry = BuildGeometry(el, name, Get(style, "fill-rule") == "evenodd");
            if (geometry == null) return;
            if (!matrix.IsIdentity)
            {
                geometry = geometry.Clone();
                geometry.Transform = new MatrixTransform(matrix);
            }

            var layer = new IconLayer { Geometry = geometry };
            var fill = Get(style, "fill");
            var stroke = Get(style, "stroke");
            layer.Filled = fill != null && fill != "none" && name != "line";
            layer.Stroked = stroke != null && stroke != "none";
            layer.FillColor = ParseColor(fill);
            layer.StrokeColor = ParseColor(stroke);
            layer.FillOpacity = opacity * Prop(style, "fill-opacity", 1);
            layer.StrokeOpacity = opacity * Prop(style, "stroke-opacity", 1);
            // Stroke width scales with the element transform.
            double scale = Math.Sqrt(Math.Abs(matrix.M11 * matrix.M22 - matrix.M12 * matrix.M21));
            layer.StrokeWidth = Length(Get(style, "stroke-width"), 1) * (scale > 0 ? scale : 1);
            layer.MiterLimit = Length(Get(style, "stroke-miterlimit"), 4);
            switch (Get(style, "stroke-linecap"))
            {
                case "round": layer.LineCap = PenLineCap.Round; break;
                case "square": layer.LineCap = PenLineCap.Square; break;
            }
            switch (Get(style, "stroke-linejoin"))
            {
                case "round": layer.LineJoin = PenLineJoin.Round; break;
                case "bevel": layer.LineJoin = PenLineJoin.Bevel; break;
            }
            if (layer.Filled || layer.Stroked) Layers.Add(layer);
        }

        Geometry BuildGeometry(XElement el, string name, bool evenOdd)
        {
            var rule = evenOdd ? FillRule.EvenOdd : FillRule.Nonzero;
            switch (name)
            {
                case "path":
                    var d = Attr(el, "d");
                    if (string.IsNullOrWhiteSpace(d)) return null;
                    var g = Geometry.Parse(NormalizePathData(d));
                    var pg = PathGeometry.CreateFromGeometry(g);
                    pg.FillRule = rule;
                    return pg;
                case "circle":
                    var r = Num(el, "r");
                    return new EllipseGeometry(new Point(Num(el, "cx"), Num(el, "cy")), r, r);
                case "ellipse":
                    return new EllipseGeometry(new Point(Num(el, "cx"), Num(el, "cy")), Num(el, "rx"), Num(el, "ry"));
                case "rect":
                    double rx = Attr(el, "rx") != null ? Num(el, "rx") : Num(el, "ry");
                    double ry = Attr(el, "ry") != null ? Num(el, "ry") : rx;
                    return new RectangleGeometry(new Rect(Num(el, "x"), Num(el, "y"), Num(el, "width"), Num(el, "height")), rx, ry);
                case "line":
                    return new LineGeometry(new Point(Num(el, "x1"), Num(el, "y1")), new Point(Num(el, "x2"), Num(el, "y2")));
                case "polyline":
                case "polygon":
                    var pts = Numbers(Attr(el, "points") ?? "");
                    if (pts.Length < 4) return null;
                    var sb = new StringBuilder(evenOdd ? "F0 M " : "F1 M ");
                    for (int i = 0; i + 1 < pts.Length; i += 2)
                    {
                        if (i == 2) sb.Append("L ");
                        sb.Append(F(pts[i])).Append(' ').Append(F(pts[i + 1])).Append(' ');
                    }
                    if (name == "polygon") sb.Append('Z');
                    return Geometry.Parse(sb.ToString());
            }
            Warnings.Add("<" + name + "> is not supported and was skipped");
            return null;
        }

        // Rewrites compact SVG path data (".75.75", arc flags "011") with explicit separators for WPF's parser.
        public static string NormalizePathData(string d)
        {
            var sb = new StringBuilder();
            int i = 0, arg = 0;
            char cmd = ' ';
            var num = new Regex(@"\G[+-]?(\d+\.?\d*|\.\d+)([eE][+-]?\d+)?");
            while (i < d.Length)
            {
                char c = d[i];
                if (char.IsWhiteSpace(c) || c == ',') { i++; continue; }
                if (char.IsLetter(c) && c != 'e' && c != 'E') { cmd = c; arg = 0; sb.Append(' ').Append(c); i++; continue; }
                int slot = arg % 7;
                if ((cmd == 'a' || cmd == 'A') && (slot == 3 || slot == 4)) { sb.Append(' ').Append(c); i++; arg++; continue; }
                var m = num.Match(d, i);
                if (!m.Success) throw new FormatException("Unexpected path data at " + i + ": " + d);
                sb.Append(' ').Append(m.Value);
                i += m.Length;
                arg++;
            }
            return sb.ToString().Trim();
        }

        static Matrix ParseTransform(string t)
        {
            var result = Matrix.Identity;
            foreach (Match m in Regex.Matches(t, @"(\w+)\s*\(([^)]*)\)"))
            {
                var n = Numbers(m.Groups[2].Value);
                var step = Matrix.Identity;
                switch (m.Groups[1].Value)
                {
                    case "matrix": step = new Matrix(n[0], n[1], n[2], n[3], n[4], n[5]); break;
                    case "translate": step.Translate(n[0], n.Length > 1 ? n[1] : 0); break;
                    case "scale": step.Scale(n[0], n.Length > 1 ? n[1] : n[0]); break;
                    case "rotate":
                        if (n.Length >= 3) step.RotateAt(n[0], n[1], n[2]); else step.Rotate(n[0]);
                        break;
                    case "skewX": step.Skew(n[0], 0); break;
                    case "skewY": step.Skew(0, n[0]); break;
                }
                // SVG applies the list right to left: the rightmost transform is closest to the element.
                result = Matrix.Multiply(step, result);
            }
            return result;
        }

        static Color? ParseColor(string value)
        {
            if (value == null || value == "none" || value == "currentColor" || value.StartsWith("url(")) return null;
            try { return (Color)ColorConverter.ConvertFromString(value); }
            catch (FormatException) { return null; }
        }

        // ---- output ----

        // Draws the icon into a size x size box (viewBox fitted and centered). keepColors: honor explicit SVG colors.
        public DrawingGroup ToDrawing(Color color, bool keepColors, double size)
        {
            var group = new DrawingGroup();
            foreach (var layer in Layers)
            {
                Brush fill = null;
                Pen pen = null;
                if (layer.Filled) fill = MakeBrush(keepColors && layer.FillColor.HasValue ? layer.FillColor.Value : color, layer.FillOpacity);
                if (layer.Stroked)
                {
                    pen = new Pen(MakeBrush(keepColors && layer.StrokeColor.HasValue ? layer.StrokeColor.Value : color, layer.StrokeOpacity), layer.StrokeWidth)
                    {
                        StartLineCap = layer.LineCap, EndLineCap = layer.LineCap, LineJoin = layer.LineJoin, MiterLimit = layer.MiterLimit
                    };
                }
                group.Children.Add(new GeometryDrawing(fill, pen, layer.Geometry));
            }
            group.Transform = new MatrixTransform(FitMatrix(size));
            return group;
        }

        Matrix FitMatrix(double size)
        {
            double s = size / Math.Max(ViewBox.Width, ViewBox.Height);
            var m = Matrix.Identity;
            m.Translate(-ViewBox.X, -ViewBox.Y);
            m.Scale(s, s);
            m.Translate((size - ViewBox.Width * s) / 2, (size - ViewBox.Height * s) / 2);
            return m;
        }

        static Brush MakeBrush(Color c, double opacity)
        {
            var b = new SolidColorBrush(c) { Opacity = opacity };
            b.Freeze();
            return b;
        }

        public void SavePng(string path, Color color, bool keepColors, int size)
        {
            var visual = new DrawingVisual();
            using (var ctx = visual.RenderOpen())
            {
                var drawing = ToDrawing(color, keepColors, size);
                ctx.DrawDrawing(drawing);
            }
            var bitmap = new System.Windows.Media.Imaging.RenderTargetBitmap(size, size, 96, 96, PixelFormats.Pbgra32);
            bitmap.Render(visual);
            var encoder = new System.Windows.Media.Imaging.PngBitmapEncoder();
            encoder.Frames.Add(System.Windows.Media.Imaging.BitmapFrame.Create(bitmap));
            using (var stream = System.IO.File.Create(path)) encoder.Save(stream);
        }

        // Filled-only icons collapse into one path string in viewBox space (translated to 0,0), for <Geometry> resources.
        public string ToGeometryData()
        {
            if (Layers.Any(l => l.Stroked))
                throw new InvalidOperationException("stroked icon: use -Format DrawingImage (or png), a Geometry resource can only be filled");
            var rules = Layers.Select(l => l.Geometry is PathGeometry ? ((PathGeometry)l.Geometry).FillRule : FillRule.Nonzero).Distinct().ToList();
            var combined = new PathGeometry { FillRule = rules.Count == 1 ? rules[0] : FillRule.Nonzero };
            foreach (var layer in Layers) combined.AddGeometry(layer.Geometry);
            if (ViewBox.X != 0 || ViewBox.Y != 0) combined.Transform = new TranslateTransform(-ViewBox.X, -ViewBox.Y);
            return PathGeometry.CreateFromGeometry(combined).ToString(Inv);
        }

        // A <DrawingImage> resource; brush is a XAML attribute value such as "{DynamicResource TextBrush}" or "#9198a1".
        public string ToDrawingImageXaml(string key, string brush, bool keepColors, string indent)
        {
            var sb = new StringBuilder();
            sb.Append(indent).Append("<DrawingImage x:Key=\"").Append(key).Append("\">\n");
            sb.Append(indent).Append("    <DrawingImage.Drawing>\n");
            sb.Append(indent).Append("        <DrawingGroup>\n");
            // Transparent frame: keeps the viewBox padding so every icon of a set has the same box.
            sb.Append(indent).Append("            <GeometryDrawing Brush=\"Transparent\" Geometry=\"M").Append(F(ViewBox.X)).Append(',').Append(F(ViewBox.Y))
              .Append(" h").Append(F(ViewBox.Width)).Append(" v").Append(F(ViewBox.Height)).Append(" h-").Append(F(ViewBox.Width)).Append(" Z\" />\n");
            foreach (var layer in Layers)
            {
                var data = PathGeometry.CreateFromGeometry(layer.Geometry).ToString(Inv);
                sb.Append(indent).Append("            <GeometryDrawing Geometry=\"").Append(data).Append('"');
                if (layer.Filled)
                {
                    sb.Append(" Brush=\"").Append(keepColors && layer.FillColor.HasValue ? Hex(layer.FillColor.Value) : brush).Append('"');
                }
                if (!layer.Stroked && layer.FillOpacity >= 1)
                {
                    sb.Append(" />\n");
                    continue;
                }
                sb.Append(">\n");
                if (layer.Stroked)
                {
                    sb.Append(indent).Append("                <GeometryDrawing.Pen>\n");
                    sb.Append(indent).Append("                    <Pen Brush=\"").Append(keepColors && layer.StrokeColor.HasValue ? Hex(layer.StrokeColor.Value) : brush)
                      .Append("\" Thickness=\"").Append(F(layer.StrokeWidth)).Append("\" StartLineCap=\"").Append(layer.LineCap)
                      .Append("\" EndLineCap=\"").Append(layer.LineCap).Append("\" LineJoin=\"").Append(layer.LineJoin).Append("\" />\n");
                    sb.Append(indent).Append("                </GeometryDrawing.Pen>\n");
                }
                sb.Append(indent).Append("            </GeometryDrawing>\n");
                if (layer.FillOpacity < 1 || (layer.Stroked && layer.StrokeOpacity < 1))
                    Warnings.Add("partial opacity is kept in PNG output only; DrawingImage uses full opacity");
            }
            sb.Append(indent).Append("        </DrawingGroup>\n");
            sb.Append(indent).Append("    </DrawingImage.Drawing>\n");
            sb.Append(indent).Append("</DrawingImage>\n");
            return sb.ToString();
        }

        // ---- helpers ----

        static string Attr(XElement el, string name)
        {
            var a = el.Attribute(name);
            return a == null ? null : a.Value;
        }

        static string Get(Dictionary<string, string> d, string key)
        {
            string v;
            return d.TryGetValue(key, out v) ? v : null;
        }

        static double Prop(Dictionary<string, string> d, string key, double fallback)
        {
            return Length(Get(d, key), fallback);
        }

        static double Num(XElement el, string name)
        {
            return Length(Attr(el, name), 0);
        }

        static double Length(string value, double fallback)
        {
            if (string.IsNullOrWhiteSpace(value)) return fallback;
            var m = Number.Match(value);
            if (!m.Success) return fallback;
            var n = double.Parse(m.Value, Inv);
            return value.Trim().EndsWith("%") ? n / 100 : n;
        }

        static double[] Numbers(string s)
        {
            return Number.Matches(s).Cast<Match>().Select(m => double.Parse(m.Value, Inv)).ToArray();
        }

        static string F(double v)
        {
            return Math.Round(v, 3).ToString(Inv);
        }

        static string Hex(Color c)
        {
            return c.A == 255 ? string.Format("#{0:x2}{1:x2}{2:x2}", c.R, c.G, c.B) : string.Format("#{0:x2}{1:x2}{2:x2}{3:x2}", c.A, c.R, c.G, c.B);
        }
    }
}
