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
        private static string BuildFieldsFingerprint(System.Collections.Generic.IReadOnlyList<string> keys)
        {
            return keys == null || keys.Count == 0 ? string.Empty : string.Join("\x1e", keys);
        }

        private void StopEnterStoryboard()
        {
            if (enterStoryboard != null)
            {
                enterStoryboard.Stop();
                enterStoryboard = null;
            }

            // Storyboard.Stop() does not always release the animation clock on Opacity; without this,
            // assigning Opacity = 1 can be ignored and the hover stays invisible (see debug opacity stuck at 0).
            if (chromeBorder != null)
            {
                chromeBorder.BeginAnimation(UIElement.OpacityProperty, null);
            }
        }

        private void HidePopup()
        {
            showDelayTimer?.Stop();
            hideDebounceTimer?.Stop();
            visibilityWatchdogTimer?.Stop();
            pendingShowGame = null;
            pendingShowAnchor = null;
            pendingShowFromKeyboard = false;
            keyboardFollowActive = false;
            StopEnterStoryboard();
            if (popup != null)
            {
                popup.IsOpen = false;
            }

            if (chromeRoot != null)
            {
                chromeRoot.Opacity = 1;
            }

            ClearFrostSnapshot();
            lastShownGame = null;
            lastShownAnchor = null;
            lastBuiltFieldsFingerprint = null;
        }

        /// <summary>
        /// Points are relative to the placement target's top-left (net462 CustomPopupPlacementCallback).
        /// List view: below the row, start-aligned (left in LTR, right in RTL); fallback above the row.
        /// Other views: prefer the end side of the target (right in LTR, left in RTL), then the start side.
        /// </summary>
        private CustomPopupPlacement[] PlacePopupForCurrentDesktopView(Size popupSize, Size targetSize, Point offset)
        {
            if (IsListViewDesktop())
            {
                return PlacePopupListViewBottomThenTopStart(popupSize, targetSize, offset);
            }

            return PlacePopupGridOrDefault(popupSize, targetSize, offset);
        }

        private bool IsListViewDesktop()
        {
            try
            {
                return playniteApi?.MainView != null && playniteApi.MainView.ActiveDesktopView == DesktopView.List;
            }
            catch
            {
                return false;
            }
        }

        /// <summary>
        /// List row: open downward with start edges aligned; fallback above the row.
        /// </summary>
        private CustomPopupPlacement[] PlacePopupListViewBottomThenTopStart(Size popupSize, Size targetSize, Point offset)
        {
            var gap = PlacementGapDip;
            var popupW = popupSize.Width;
            if (popupW < 8)
            {
                popupW = Math.Max(120, settings.HoverWidth);
            }

            // RTL target origin is top-right; -popupW aligns the popup's start (visual right) with the row.
            var startX = HoverLoc.IsRightToLeftLayout(playniteApi, mainWindow)
                ? -popupW + offset.X
                : offset.X;
            var below = new Point(startX, targetSize.Height + gap + offset.Y);
            var above = new Point(startX, -popupSize.Height - gap + offset.Y);
            return new[]
            {
                new CustomPopupPlacement(below, PopupPrimaryAxis.Vertical),
                new CustomPopupPlacement(above, PopupPrimaryAxis.Vertical)
            };
        }

        /// <summary>
        /// Grid (and other) views: prefer the end side of the tile, then the start side.
        /// Left-side math must use a real width — a 0-width callback places x≈0 and the panel grows over the tile.
        /// </summary>
        private CustomPopupPlacement[] PlacePopupGridOrDefault(Size popupSize, Size targetSize, Point offset)
        {
            var gap = PlacementGapDip;
            var popupW = popupSize.Width;
            if (popupW < 8)
            {
                popupW = Math.Max(120, settings.HoverWidth);
            }

            // LTR PlacementTarget origin is top-left. RTL targets (Hebrew UI) use top-right;
            // -popupW-gap from that origin still overlaps the tile (runtime: popupX ≈ tileRight - popupW).
            Point right;
            Point left;
            var rtl = HoverLoc.IsRightToLeftLayout(playniteApi, mainWindow);
            if (rtl)
            {
                left = new Point(-targetSize.Width - popupW - gap + offset.X, offset.Y);
                right = new Point(gap + offset.X, offset.Y);
            }
            else
            {
                right = new Point(targetSize.Width + gap + offset.X, offset.Y);
                left = new Point(-popupW - gap + offset.X, offset.Y);
            }
            if (rtl)
            {
                return new[]
                {
                    new CustomPopupPlacement(left, PopupPrimaryAxis.Horizontal),
                    new CustomPopupPlacement(right, PopupPrimaryAxis.Horizontal)
                };
            }

            return new[]
            {
                new CustomPopupPlacement(right, PopupPrimaryAxis.Horizontal),
                new CustomPopupPlacement(left, PopupPrimaryAxis.Horizontal)
            };
        }

        private void ShowOrUpdatePopup(Game game, FrameworkElement anchor)
        {
            if (ShouldBlockHover())
            {
                HidePopup();
                return;
            }

            EnsurePopupShell();
            ApplyChrome(game);
            var wasOpen = popup.IsOpen;
            var previousId = lastShownGame?.Id;
            var sameGameContinue = wasOpen && previousId != null && previousId == game.Id;

            var orderedKeys = settings.GetOrderedSelectedKeys();
            var w = Math.Max(120, settings.HoverWidth);
            var fieldsFingerprint =
                BuildFieldsFingerprint(orderedKeys)
                + "\x1e" + w.ToString(System.Globalization.CultureInfo.InvariantCulture)
                + "\x1e" + (settings.HideFieldTitlesInHover ? "1" : "0")
                + "\x1e" + (settings.ShowFieldInlineIconsInHover ? "1" : "0")
                + "\x1e" + (settings.HideIconChipBackground ? "1" : "0")
                + "\x1e" + (settings.HideFieldDividers ? "1" : "0")
                + "\x1e" + (settings.HidePanelBorder ? "1" : "0")
                + "\x1e" + (settings.HideEmptyFields ? "1" : "0")
                + "\x1e" + (settings.UseFallbackFields ? "1" : "0")
                + "\x1e" + settings.HoverFieldBlockSpacingDip.ToString(System.Globalization.CultureInfo.InvariantCulture)
                + "\x1e" + settings.HoverFieldColumnCount.ToString(System.Globalization.CultureInfo.InvariantCulture)
                + "\x1e" + settings.HoverContentPaddingDip.ToString(System.Globalization.CultureInfo.InvariantCulture)
                + "\x1e" + settings.HoverBodyFontSize.ToString("0.##", System.Globalization.CultureInfo.InvariantCulture)
                + "\x1e" + settings.HoverTitleFontSize.ToString("0.##", System.Globalization.CultureInfo.InvariantCulture)
                + "\x1e" + (settings.HoverIconStyle ?? string.Empty)
                + "\x1e" + settings.HoverIconChipSizeDip.ToString(System.Globalization.CultureInfo.InvariantCulture)
                + "\x1e" + settings.HoverIconChipPaddingDip.ToString(System.Globalization.CultureInfo.InvariantCulture)
                + "\x1e" + (settings.HoverIconChipShape ?? string.Empty)
                + "\x1e" + HoverChromePalette.ContentFingerprint(settings);
            var canSkipContentRebuild =
                popup.IsOpen &&
                lastShownGame != null &&
                lastShownGame.Id == game.Id &&
                lastBuiltFieldsFingerprint == fieldsFingerprint;

            chromeBorder.Width = w;
            chromeBorder.MinWidth = w;
            chromeBorder.MaxWidth = w;
            if (chromeRoot != null)
            {
                chromeRoot.Width = w;
                chromeRoot.MinWidth = w;
                chromeRoot.MaxWidth = w;
            }
            var innerMax = Math.Max(60, w - ChromePadding());

            if (!canSkipContentRebuild)
            {
                HoverFieldListBuilder.Fill(
                    contentStack,
                    settings,
                    Palette,
                    orderedKeys,
                    innerMax,
                    HoverFieldListSource.ForLiveGame(game, playniteApi));
                lastBuiltFieldsFingerprint = fieldsFingerprint;
                InvalidatePopupToContentHeight();
            }

            if (contentStack.Children.Count == 0)
            {
                HidePopup();
                return;
            }

            var needsReposition = true;
            if (anchor != null && anchor.IsVisible)
            {
                var sameAnchorContinue = sameGameContinue
                    && popup.IsOpen
                    && ReferenceEquals(popup.PlacementTarget, anchor)
                    && popup.Placement == PlacementMode.Custom;
                needsReposition = !sameAnchorContinue;
                popup.PlacementTarget = anchor;
                popup.Placement = PlacementMode.Custom;
                if (!sameAnchorContinue)
                {
                    popup.HorizontalOffset = 0;
                    popup.VerticalOffset = 0;
                }

                popup.CustomPopupPlacementCallback = PlacePopupForCurrentDesktopView;
            }
            else
            {
                popup.CustomPopupPlacementCallback = null;
                popup.PlacementTarget = mainWindow;
                popup.Placement = PlacementMode.Mouse;
                popup.HorizontalOffset = 8;
                popup.VerticalOffset = 8;
            }

            StopEnterStoryboard();
            // Fade only on first open. Switching games while open must stay at opacity 1 —
            // dropping to 0 for the enter storyboard is the blink during fast details scroll.
            chromeRoot.Opacity = wasOpen ? 1 : 0;

            popup.IsOpen = true;
            lastShownGame = game;
            lastShownAnchor = anchor;
            StartVisibilityWatchdog();

            // Switching games deliberately leaves the HWND alive: closing and reopening it is the
            // teardown that makes the card blink during fast sweeps. The popup therefore keeps its
            // old screen position until something asks WPF to re-place it, and the offsets above
            // were reset to the value they already had, so nudge explicitly.
            if (wasOpen && needsReposition)
            {
                NudgePopupToApplyNewSize();
            }

            var runEnterAnimation = !wasOpen;
            var invokeGen = ++layoutInvokeGeneration;
            dispatcher.BeginInvoke(
                new Action(() => AfterPopupLayout(runEnterAnimation, invokeGen)),
                DispatcherPriority.Loaded);
        }

        private void StartVisibilityWatchdog()
        {
            if (visibilityWatchdogTimer == null || visibilityWatchdogTimer.IsEnabled)
            {
                return;
            }

            visibilityWatchdogTimer.Start();
        }

        private void AfterPopupLayout(bool runEnterAnimation, int invokedGeneration)
        {
            if (invokedGeneration != layoutInvokeGeneration)
            {
                return;
            }

            if (broken || popup?.Child == null || !popup.IsOpen)
            {
                return;
            }

            try
            {
                popup.Child.InvalidateMeasure();
                popup.Child.UpdateLayout();
                NudgePopupToApplyNewSize();
                ClampPopupToVirtualScreen();
                UpdateFrostBackdrop();
                if (!runEnterAnimation)
                {
                    chromeRoot.Opacity = 1;
                    return;
                }

                popup.Child.UpdateLayout();
                BeginEnterStoryboard();
            }
            catch (Exception ex)
            {
                Logger.Error(ex, "GameHoverDetails hover layout/animation failed.");
                StopEnterStoryboard();
                if (chromeRoot != null)
                {
                    chromeRoot.Opacity = 1;
                }
            }
        }

        private void BeginEnterStoryboard()
        {
            StopEnterStoryboard();
            var ease = new QuadraticEase { EasingMode = EasingMode.EaseOut };
            var duration = TimeSpan.FromMilliseconds(EnterAnimationMs);

            var opacityAnim = new DoubleAnimation
            {
                From = 0,
                To = 1,
                Duration = duration,
                EasingFunction = ease
            };
            Storyboard.SetTarget(opacityAnim, chromeRoot);
            Storyboard.SetTargetProperty(opacityAnim, new PropertyPath(UIElement.OpacityProperty));

            enterStoryboard = new Storyboard();
            enterStoryboard.Children.Add(opacityAnim);
            enterStoryboard.Begin();
        }

        /// <summary>
        /// WPF <see cref="Popup"/> often keeps the last HWND size when content shrinks.
        /// Toggling offset forces a position/size pass without closing the popup.
        /// </summary>
        private void NudgePopupToApplyNewSize()
        {
            if (popup == null || !popup.IsOpen)
            {
                return;
            }

            var x = popup.HorizontalOffset;
            popup.HorizontalOffset = x + 0.1;
            popup.HorizontalOffset = x;
        }

        private void ClampPopupToVirtualScreen()
        {
            if (popup?.Child == null || !popup.IsOpen)
            {
                return;
            }

            try
            {
                popup.Child.UpdateLayout();
                var child = popup.Child;
                var width = child.RenderSize.Width;
                var height = child.RenderSize.Height;
                if (width <= 0 || height <= 0)
                {
                    return;
                }

                var source = PresentationSource.FromVisual(child) as HwndSource;
                if (source?.CompositionTarget == null)
                {
                    return;
                }

                var fromDevice = source.CompositionTarget.TransformFromDevice;

                var tlPx = child.PointToScreen(new Point(0, 0));
                var brPx = child.PointToScreen(new Point(width, height));
                var tlDip = fromDevice.Transform(tlPx);
                var brDip = fromDevice.Transform(brPx);

                const double margin = 8;
                var vsLeft = SystemParameters.VirtualScreenLeft;
                var vsTop = SystemParameters.VirtualScreenTop;
                var vsRight = vsLeft + SystemParameters.VirtualScreenWidth;
                var vsBottom = vsTop + SystemParameters.VirtualScreenHeight;

                var deltaX = 0.0;
                var deltaY = 0.0;
                var customSidePlacement = popup.Placement == PlacementMode.Custom;

                if (!customSidePlacement)
                {
                    if (brDip.X > vsRight - margin)
                    {
                        deltaX -= brDip.X - (vsRight - margin);
                    }

                    if (tlDip.X + deltaX < vsLeft + margin)
                    {
                        deltaX += vsLeft + margin - tlDip.X - deltaX;
                    }
                }

                if (brDip.Y > vsBottom - margin)
                {
                    deltaY -= brDip.Y - (vsBottom - margin);
                }

                if (tlDip.Y + deltaY < vsTop + margin)
                {
                    deltaY += vsTop + margin - tlDip.Y - deltaY;
                }

                if (Math.Abs(deltaX) > 0.01 || Math.Abs(deltaY) > 0.01)
                {
                    popup.HorizontalOffset += deltaX;
                    popup.VerticalOffset += deltaY;
                }
            }
            catch
            {
                // ignore clamp failures
            }
        }

        private void ChromeBorderOnPointerOverChrome(object sender, MouseEventArgs e)
        {
            if (broken)
            {
                return;
            }

            try
            {
                hideDebounceTimer?.Stop();
                HidePopup();
                e.Handled = true;
            }
            catch (Exception ex)
            {
                HandleHoverError(ex);
            }
        }
    }
}
