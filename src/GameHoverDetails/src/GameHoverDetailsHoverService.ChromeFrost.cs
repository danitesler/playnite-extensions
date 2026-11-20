using System;
using System.Reflection;
using System.Runtime.InteropServices;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Controls.Primitives;
using System.Windows.Documents;
using System.Windows.Input;
using System.Windows.Interop;
using System.Windows.Media;
using System.Windows.Media.Media3D;
using System.Windows.Media.Animation;
using System.Windows.Media.Effects;
using System.Windows.Media.Imaging;
using System.Windows.Threading;
using Playnite.SDK;
using Playnite.SDK.Models;


namespace GameHoverDetails
{
    internal sealed partial class GameHoverDetailsHoverService
    {
        private void EnsurePopupShell()
        {
            if (popup != null)
            {
                return;
            }

            contentStack = new StackPanel
            {
                Margin = ContentListMargin(),
                VerticalAlignment = VerticalAlignment.Top,
                HorizontalAlignment = HorizontalAlignment.Stretch,
                IsHitTestVisible = true
            };

            coverHost = new Border
            {
                HorizontalAlignment = HorizontalAlignment.Stretch,
                VerticalAlignment = VerticalAlignment.Stretch,
                IsHitTestVisible = false,
                Visibility = Visibility.Collapsed
            };

            coverTint = new Border
            {
                Background = HoverChromePalette.CoverTintBrush,
                IsHitTestVisible = false,
                Visibility = Visibility.Collapsed
            };

            chromeBody = new Grid
            {
                IsHitTestVisible = true
            };
            chromeBody.Children.Add(coverHost);
            chromeBody.Children.Add(coverTint);
            chromeBody.Children.Add(contentStack);
            chromeBody.SizeChanged += ChromeBodyOnSizeChanged;

            frostImage = new Image
            {
                Stretch = Stretch.Fill,
                IsHitTestVisible = false
            };

            frostHost = new Border
            {
                CornerRadius = new CornerRadius(ChromeCornerRadiusDip),
                ClipToBounds = true,
                HorizontalAlignment = HorizontalAlignment.Stretch,
                VerticalAlignment = VerticalAlignment.Stretch,
                IsHitTestVisible = false,
                // Image.Source measures to the last snapshot; that locked the panel
                // height after fields were removed. Overlay paints frost without layout.
                Child = new NonMeasuringOverlay { Child = frostImage },
                Visibility = Visibility.Collapsed
            };

            chromeBorder = new Border
            {
                BorderThickness = new Thickness(1),
                CornerRadius = new CornerRadius(ChromeCornerRadiusDip),
                Child = chromeBody,
                HorizontalAlignment = HorizontalAlignment.Stretch,
                VerticalAlignment = VerticalAlignment.Top,
                IsHitTestVisible = true
            };
            chromeBorder.PreviewMouseMove += ChromeBorderOnPointerOverChrome;
            chromeBorder.MouseEnter += ChromeBorderOnPointerOverChrome;

            var shadow = new Border
            {
                Background = new SolidColorBrush(Color.FromArgb(72, 0, 0, 0)),
                CornerRadius = new CornerRadius(ChromeCornerRadiusDip),
                HorizontalAlignment = HorizontalAlignment.Stretch,
                VerticalAlignment = VerticalAlignment.Stretch,
                IsHitTestVisible = false,
                RenderTransform = new TranslateTransform(0, 2)
            };

            var layers = new Grid
            {
                VerticalAlignment = VerticalAlignment.Top
            };
            layers.Children.Add(shadow);
            layers.Children.Add(frostHost);
            layers.Children.Add(chromeBorder);

            chromeRoot = new Border
            {
                Background = Brushes.Transparent,
                CornerRadius = new CornerRadius(ChromeCornerRadiusDip),
                Child = layers,
                IsHitTestVisible = true
            };
            ApplyChromeFlowDirection();
            chromeRoot.SizeChanged += ChromeRootOnSizeChanged;

            popup = new Popup
            {
                AllowsTransparency = true,
                StaysOpen = true,
                PopupAnimation = PopupAnimation.None,
                Child = chromeRoot,
                IsHitTestVisible = true
            };

            ApplyChrome();
        }

        private void ChromeRootOnSizeChanged(object sender, SizeChangedEventArgs e)
        {
            UpdateFrostClip();
        }

        private void ChromeBodyOnSizeChanged(object sender, SizeChangedEventArgs e)
        {
            UpdateCoverClip();
        }

        private void UpdateCoverClip()
        {
            HoverChromePalette.ApplyRoundedClip(chromeBody, ChromeCornerRadiusDip - 1);
        }

        private void UpdateFrostClip()
        {
            if (frostHost == null || chromeRoot == null)
            {
                return;
            }

            var w = chromeRoot.ActualWidth;
            var h = chromeRoot.ActualHeight;
            if (w <= 0 || h <= 0)
            {
                frostHost.Clip = null;
                return;
            }

            frostHost.Clip = new RectangleGeometry(
                new Rect(0, 0, w, h),
                ChromeCornerRadiusDip,
                ChromeCornerRadiusDip);
        }

        private void UpdateFrostBackdrop()
        {
            if (frostHost == null || frostImage == null || chromeRoot == null)
            {
                return;
            }

            var useFrost = settings.HoverChromeBackgroundOpacity < 100;
            if (!useFrost)
            {
                frostHost.Visibility = Visibility.Collapsed;
                frostImage.Source = null;
                frostImage.Effect = null;
                return;
            }

            EnsureFrostBlurEffect();

            if (popup == null || !popup.IsOpen || chromeRoot.ActualWidth < 2 || chromeRoot.ActualHeight < 2)
            {
                return;
            }

            frostHost.Visibility = Visibility.Visible;

            // CopyFromScreen of a visible panel would snapshot the hover itself. Capture only
            // while the chrome is still transparent (enter animation / first layout).
            if (chromeRoot.Opacity >= 0.2)
            {
                if (frostImage.Source == null)
                {
                    frostHost.Visibility = Visibility.Collapsed;
                }

                return;
            }

            try
            {
                var snapshot = CapturePopupScreenRect();
                if (snapshot == null)
                {
                    frostHost.Visibility = Visibility.Collapsed;
                    frostImage.Source = null;
                    return;
                }

                frostImage.Source = snapshot;
            }
            catch (Exception ex)
            {
                Logger.Error(ex, "GameHoverDetails frost snapshot failed.");
                frostHost.Visibility = Visibility.Collapsed;
                frostImage.Source = null;
            }
        }

        private void EnsureFrostBlurEffect()
        {
            if (frostImage == null || frostImage.Effect != null)
            {
                return;
            }

            frostImage.Effect = new BlurEffect
            {
                Radius = FrostBlurRadius,
                KernelType = KernelType.Gaussian
            };
        }

        private BitmapSource CapturePopupScreenRect()
        {
            var w = chromeRoot.ActualWidth;
            var h = chromeRoot.ActualHeight;
            var dpiX = 96.0;
            var dpiY = 96.0;
            var source = PresentationSource.FromVisual(chromeRoot) ?? PresentationSource.FromVisual(mainWindow);
            if (source?.CompositionTarget != null)
            {
                var m = source.CompositionTarget.TransformToDevice;
                dpiX = 96.0 * m.M11;
                dpiY = 96.0 * m.M22;
            }

            var pixelW = Math.Max(1, (int)Math.Ceiling(w * dpiX / 96.0));
            var pixelH = Math.Max(1, (int)Math.Ceiling(h * dpiY / 96.0));
            if (pixelW > 4096 || pixelH > 4096)
            {
                return null;
            }

            var topLeft = chromeRoot.PointToScreen(new Point(0, 0));
            var screenX = (int)Math.Round(topLeft.X);
            var screenY = (int)Math.Round(topLeft.Y);

            using (var bmp = new System.Drawing.Bitmap(
                pixelW,
                pixelH,
                System.Drawing.Imaging.PixelFormat.Format32bppArgb))
            {
                using (var g = System.Drawing.Graphics.FromImage(bmp))
                {
                    g.CopyFromScreen(
                        screenX,
                        screenY,
                        0,
                        0,
                        new System.Drawing.Size(pixelW, pixelH),
                        System.Drawing.CopyPixelOperation.SourceCopy);
                }

                var hBitmap = bmp.GetHbitmap();
                try
                {
                    var image = Imaging.CreateBitmapSourceFromHBitmap(
                        hBitmap,
                        IntPtr.Zero,
                        Int32Rect.Empty,
                        BitmapSizeOptions.FromEmptyOptions());
                    image.Freeze();
                    return image;
                }
                finally
                {
                    DeleteObject(hBitmap);
                }
            }
        }

        [DllImport("gdi32.dll", ExactSpelling = true)]
        private static extern bool DeleteObject(IntPtr hObject);

        private HoverChromePalette Palette => palette ?? (palette = HoverChromePalette.Resolve(settings));

        private void InvalidatePopupToContentHeight()
        {
            contentStack?.InvalidateMeasure();
            chromeBody?.InvalidateMeasure();
            chromeBorder?.InvalidateMeasure();
            chromeRoot?.InvalidateMeasure();
        }

        private void ClearFrostSnapshot()
        {
            if (frostImage != null)
            {
                frostImage.Source = null;
            }

            if (frostHost != null)
            {
                frostHost.Visibility = Visibility.Collapsed;
            }
        }

        /// <summary>
        /// Overlay that paints at the parent's arrange size but reports 0×0 during measure.
        /// Frost snapshots must not keep the hover panel at the previous capture height.
        /// </summary>
        private sealed class NonMeasuringOverlay : Decorator
        {
            protected override Size MeasureOverride(Size constraint)
            {
                Child?.Measure(constraint);
                return new Size(0, 0);
            }

            protected override Size ArrangeOverride(Size arrangeSize)
            {
                Child?.Arrange(new Rect(arrangeSize));
                return arrangeSize;
            }
        }

        /// <returns>True when the overview fanart is showing (style is Game background and a bitmap loaded).</returns>
        private bool UpdateCoverBackground(Game game)
        {
            if (coverHost == null || coverTint == null)
            {
                return false;
            }

            if (!settings.IsGameCoverBackgroundStyle || game == null)
            {
                HoverChromePalette.ApplyCoverBackdrop(coverHost, coverTint, null, settings.HoverChromeBackgroundOpacity);
                lastCoverGameId = null;
                return false;
            }

            if (lastCoverGameId == game.Id && coverHost.Background is ImageBrush)
            {
                coverHost.Visibility = Visibility.Visible;
                coverTint.Visibility = Visibility.Visible;
                HoverChromePalette.ApplyCoverTintOpacity(coverTint, settings.HoverChromeBackgroundOpacity);
                return true;
            }

            var bmp = HoverBitmapLoader.TryLoadGameArt("BackgroundImage", game, playniteApi, FanartBackgroundDecodePx);
            if (!HoverChromePalette.ApplyCoverBackdrop(coverHost, coverTint, bmp, settings.HoverChromeBackgroundOpacity))
            {
                lastCoverGameId = null;
                return false;
            }

            lastCoverGameId = game.Id;
            UpdateCoverClip();
            return true;
        }

        private void ApplyChrome(Game coverGame = null)
        {
            palette = HoverChromePalette.Resolve(settings);
            var coverActive = UpdateCoverBackground(coverGame ?? lastShownGame);
            HoverChromePalette.ApplyToChromeBorder(chromeBorder, settings, coverActive);
            if (coverActive)
            {
                HoverChromePalette.ApplyCoverTintOpacity(coverTint, settings.HoverChromeBackgroundOpacity);
            }

            var appFont = HoverChromePalette.ResolvePlayniteFontFamily(mainWindow);
            if (chromeRoot != null)
            {
                TextElement.SetFontFamily(chromeRoot, appFont);
            }

            if (contentStack != null)
            {
                contentStack.Margin = ContentListMargin();
                TextElement.SetFontFamily(contentStack, appFont);
            }

            ApplyChromeFlowDirection();
        }

        private void ApplyChromeFlowDirection()
        {
            var flow = HoverLoc.LayoutFlow(playniteApi, mainWindow);
            // Popup HWND placement is physical (top-left origin). RTL on Popup mirrors
            // CustomPopupPlacementCallback points and drops the panel on the tile.
            if (popup != null)
            {
                popup.FlowDirection = FlowDirection.LeftToRight;
            }

            if (chromeRoot != null)
            {
                chromeRoot.FlowDirection = flow;
            }

            if (contentStack != null)
            {
                contentStack.FlowDirection = flow;
            }
        }
    }
}
