using System;
using System.Windows;
using System.Windows.Media;
using System.Windows.Media.Animation;

namespace Autogrid
{
    /// <summary>
    /// A small drawing of Playnite's grid for one <see cref="AutogridMode"/>. While
    /// <see cref="IsPlaying"/> it loops through a window resize, then the game details panel
    /// opening and closing, so each settings card shows what that mode does. The still frame is
    /// the loop's first frame (full window, panel closed), so hovering starts the resize at once.
    /// </summary>
    public sealed class GridModePreview : FrameworkElement
    {
        private const int Columns = 6;

        // The loop, in seconds. Each step starts where the previous one ends.
        internal const double NarrowEnd = 0.5;       // window narrows; starts the moment the pointer arrives
        internal const double WidenStart = 0.9;      // narrow window held
        internal const double WidenEnd = 1.4;        // window back to full width
        internal const double SelectAt = 1.5;        // a game is picked
        internal const double OpenStart = 1.7;
        internal const double OpenEnd = 2.0;         // details panel slides in
        internal const double CloseStart = 2.8;      // panel held open
        internal const double CloseEnd = 3.1;        // panel slides out
        internal const double LoopSeconds = 3.5;     // short pause, then the resize again

        internal const double RestProgress = 0;

        public static readonly DependencyProperty ModeProperty = DependencyProperty.Register(
            nameof(Mode), typeof(AutogridMode), typeof(GridModePreview),
            new FrameworkPropertyMetadata(AutogridMode.KeepGridUnderDetails, FrameworkPropertyMetadataOptions.AffectsRender));

        public static readonly DependencyProperty IsPlayingProperty = DependencyProperty.Register(
            nameof(IsPlaying), typeof(bool), typeof(GridModePreview),
            new PropertyMetadata(false, (d, e) => ((GridModePreview)d).UpdateAnimation()));

        public static readonly DependencyProperty ProgressProperty = DependencyProperty.Register(
            nameof(Progress), typeof(double), typeof(GridModePreview),
            new FrameworkPropertyMetadata(RestProgress, FrameworkPropertyMetadataOptions.AffectsRender));

        public static readonly DependencyProperty TileBrushProperty = RegisterBrush(nameof(TileBrush));
        public static readonly DependencyProperty FrameBrushProperty = RegisterBrush(nameof(FrameBrush));
        public static readonly DependencyProperty AccentBrushProperty = RegisterBrush(nameof(AccentBrush));

        public AutogridMode Mode
        {
            get => (AutogridMode)GetValue(ModeProperty);
            set => SetValue(ModeProperty, value);
        }

        public bool IsPlaying
        {
            get => (bool)GetValue(IsPlayingProperty);
            set => SetValue(IsPlayingProperty, value);
        }

        /// <summary>Loop position; only the fractional part is used.</summary>
        public double Progress
        {
            get => (double)GetValue(ProgressProperty);
            set => SetValue(ProgressProperty, value);
        }

        public Brush TileBrush
        {
            get => (Brush)GetValue(TileBrushProperty);
            set => SetValue(TileBrushProperty, value);
        }

        public Brush FrameBrush
        {
            get => (Brush)GetValue(FrameBrushProperty);
            set => SetValue(FrameBrushProperty, value);
        }

        public Brush AccentBrush
        {
            get => (Brush)GetValue(AccentBrushProperty);
            set => SetValue(AccentBrushProperty, value);
        }

        private static DependencyProperty RegisterBrush(string name) => DependencyProperty.Register(
            name, typeof(Brush), typeof(GridModePreview),
            new FrameworkPropertyMetadata(Brushes.Gray, FrameworkPropertyMetadataOptions.AffectsRender));

        private void UpdateAnimation()
        {
            // Respect Windows' "Show animations" setting: the card keeps its still frame.
            if (IsPlaying && SystemParameters.ClientAreaAnimation)
            {
                BeginAnimation(ProgressProperty, new DoubleAnimation(RestProgress, RestProgress + 1, TimeSpan.FromSeconds(LoopSeconds))
                {
                    RepeatBehavior = RepeatBehavior.Forever
                });
            }
            else
            {
                BeginAnimation(ProgressProperty, null);
            }
        }

        /// <summary>How far the window is narrowed (0..1) and the details panel is open (0..1).</summary>
        internal static void Timeline(double progress, out double narrowed, out double detailsOpen)
        {
            var s = Seconds(progress);
            // The narrowing is the first move after hovering, so it starts fast instead of easing in.
            narrowed = EaseOut(Ramp(s, 0, NarrowEnd)) - Ease(Ramp(s, WidenStart, WidenEnd));
            detailsOpen = Ease(Ramp(s, OpenStart, OpenEnd)) - Ease(Ramp(s, CloseStart, CloseEnd));
        }

        /// <summary>Position in the loop, in seconds from its start.</summary>
        internal static double Seconds(double progress) => (progress - Math.Floor(progress)) * LoopSeconds;

        private static double EaseOut(double t) => 1 - (1 - t) * (1 - t);

        private static double Ramp(double p, double start, double end) =>
            Math.Max(0, Math.Min(1, (p - start) / (end - start)));

        private static double Ease(double t) => t * t * (3 - 2 * t);

        protected override void OnRender(DrawingContext dc)
        {
            var width = ActualWidth;
            var height = ActualHeight;
            if (width < 20 || height < 20)
            {
                return;
            }

            Timeline(Progress, out var narrowed, out var detailsOpen);
            var s = Seconds(Progress);

            // Not frozen: theme brushes take their Color from a DynamicResource and cannot be.
            var framePen = new Pen(FrameBrush, 1);
            var accentPen = new Pen(AccentBrush, 1.5);

            // The window narrows from its right edge; the details panel keeps its own width.
            var windowWidth = Math.Round(width * (1 - 0.3 * narrowed));
            var frame = new Rect(0.5, 0.5, windowWidth - 1, height - 1);
            var titleHeight = Math.Round(height * 0.1);
            dc.DrawRectangle(null, framePen, frame);
            dc.PushOpacity(0.35);
            dc.DrawRectangle(FrameBrush, null, new Rect(frame.Left, frame.Top, frame.Width, titleHeight));
            dc.Pop();

            var pad = Math.Max(3, Math.Round(width * 0.025));
            var content = new Rect(frame.Left + pad, frame.Top + titleHeight + pad, frame.Width - 2 * pad, frame.Height - titleHeight - 2 * pad);
            var detailsWidth = Math.Round(width * 0.36);
            var detailsLeft = frame.Right - detailsWidth * detailsOpen;

            // Off keeps Playnite's cover size, fitted to the full-size window at rest.
            var fullPitch = (width - 1 - 2 * pad) / Columns;
            var besideDetails = Math.Max(fullPitch, detailsLeft - pad - content.Left);
            double pitch;
            int columns;
            switch (Mode)
            {
                case AutogridMode.Off:
                    pitch = fullPitch;
                    columns = Math.Max(1, (int)Math.Floor((besideDetails + 0.01) / pitch));
                    break;
                case AutogridMode.ResizeCovers:
                    pitch = besideDetails / Columns;
                    columns = Columns;
                    break;
                default:
                    // The grid ignores the panel, which covers its edge.
                    pitch = content.Width / Columns;
                    columns = Columns;
                    break;
            }

            var gap = Math.Max(1, pitch * 0.14);
            var tileWidth = pitch - gap;
            var tileHeight = tileWidth * 1.4;
            var rowPitch = tileHeight + gap;
            var selected = s >= SelectAt && s < CloseEnd;

            dc.PushClip(new RectangleGeometry(content));
            var index = 0;
            for (var y = content.Top; y < content.Bottom; y += rowPitch)
            {
                for (var c = 0; c < columns; c++, index++)
                {
                    var tile = new Rect(content.Left + c * pitch, y, tileWidth, tileHeight);
                    dc.PushOpacity(0.5);
                    dc.DrawRoundedRectangle(TileBrush, null, tile, 1.5, 1.5);
                    dc.Pop();
                    if (index == 0 && selected)
                    {
                        dc.DrawRoundedRectangle(null, accentPen, tile, 1.5, 1.5);
                    }
                }
            }

            dc.Pop();

            if (detailsOpen > 0.001)
            {
                var panel = new Rect(detailsLeft, content.Top - pad, frame.Right - detailsLeft, content.Height + 2 * pad);
                dc.PushClip(new RectangleGeometry(panel));
                dc.DrawRectangle(Background(), null, panel);
                dc.PushOpacity(0.35);
                dc.DrawRectangle(AccentBrush, null, panel);
                dc.Pop();
                dc.DrawLine(accentPen, new Point(panel.Left, panel.Top), new Point(panel.Left, panel.Bottom));

                // A banner and a few text lines, laid out at the panel's full width so they slide in.
                var inner = new Rect(detailsLeft + pad, panel.Top + pad, detailsWidth - 2 * pad, panel.Height - 2 * pad);
                dc.PushOpacity(0.5);
                dc.DrawRectangle(TileBrush, null, new Rect(inner.Left, inner.Top, inner.Width, inner.Height * 0.3));
                var line = Math.Max(1.5, inner.Height * 0.05);
                for (var i = 0; i < 4; i++)
                {
                    var lineWidth = inner.Width * (i == 0 ? 0.6 : 0.9 - i * 0.12);
                    dc.DrawRectangle(TileBrush, null, new Rect(inner.Left, inner.Top + inner.Height * (0.4 + i * 0.13), lineWidth, line));
                }

                dc.Pop();
                dc.Pop();
            }

            // A grip on the window's right edge while it is being resized.
            if (s > 0 && s < WidenEnd)
            {
                var gripTop = height * 0.38;
                dc.DrawLine(accentPen, new Point(frame.Right, gripTop), new Point(frame.Right, height - gripTop));
            }
        }

        /// <summary>The panel is opaque, like Playnite's: tiles under it are hidden, not tinted.</summary>
        private Brush Background()
        {
            return TryFindResource("WindowBackgourndBrush") as Brush
                ?? TryFindResource("PopupBackgroundBrush") as Brush
                ?? Brushes.Black;
        }
    }
}
