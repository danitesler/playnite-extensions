using System;
using System.Reflection;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Controls.Primitives;
using System.Windows.Input;
using System.Windows.Interop;
using System.Windows.Media;
using System.Windows.Media.Animation;
using System.Windows.Media.Effects;
using System.Windows.Threading;
using Playnite.SDK;
using Playnite.SDK.Models;

namespace GameHoverDetails
{
    internal sealed class GameHoverDetailsHoverService
    {
        private static readonly ILogger Logger = LogManager.GetLogger();

        /// <summary>Horizontal inner inset: must match <see cref="EnsurePopupShell"/> stack margin (14 + 14).</summary>
        private const double ChromePadding = 28;
        private const double PlacementGapDip = 8;
        private const double EnterAnimationMs = 80;
        private const double HideDebounceMs = 70;

        private static readonly FontFamily HoverFieldInlineIconFontFamily = new FontFamily("Segoe MDL2 Assets");

        private static readonly SolidColorBrush SeparatorLineBrush = FreezeBrush(Color.FromRgb(60, 60, 64));
        private static readonly SolidColorBrush GlyphChipBackgroundBrush = FreezeBrush(Color.FromRgb(58, 58, 62));
        private static readonly SolidColorBrush GlyphChipGlyphBrush = FreezeBrush(Color.FromRgb(210, 210, 215));
        private static readonly SolidColorBrush BodyTextBrush = FreezeBrush(Color.FromRgb(230, 230, 230));

        private static SolidColorBrush FreezeBrush(Color c)
        {
            var b = new SolidColorBrush(c);
            b.Freeze();
            return b;
        }

        private const double LabelToValueGapDip = 4;
        private const double FirstBlockHeaderTopDip = 0;
        private const double GlyphChipSizeDip = 32;
        private const double GlyphChipGlyphFontSize = 15;
        private const double StatRowGlyphToTextGapDip = 10;
        private const double ChromeCornerRadiusDip = 8;

        /// <summary>Half of field block spacing: used above and below each divider and as top/bottom inset per block so the spacing slider affects both sides.</summary>
        private double FieldBlockSpacingHalfDip()
        {
            return FieldBlockSpacingDip() * 0.5;
        }

        private double FieldBlockSpacingDip()
        {
            var s = settings.HoverFieldBlockSpacingDip;
            if (s < 4)
            {
                return 4;
            }

            return s > 36 ? 36 : s;
        }

        private readonly Window mainWindow;
        private readonly IPlayniteAPI playniteApi;
        private readonly GameHoverDetailsSettings settings;
        private readonly Dispatcher dispatcher;

        private bool broken;
        private bool attached;
        private DispatcherTimer hideDebounceTimer;
        private DispatcherTimer showDelayTimer;
        private Game pendingShowGame;
        private FrameworkElement pendingShowAnchor;
        private Popup popup;
        private Border chromeBorder;
        private TranslateTransform chromeFlyTransform;
        private StackPanel contentStack;
        private Game lastShownGame;
        private FrameworkElement lastShownAnchor;
        private Storyboard enterStoryboard;
        private int layoutInvokeGeneration;
        private string lastBuiltFieldsFingerprint;

        public GameHoverDetailsHoverService(Window mainWindow, IPlayniteAPI playniteApi, GameHoverDetailsSettings settings)
        {
            this.mainWindow = mainWindow ?? throw new ArgumentNullException(nameof(mainWindow));
            this.playniteApi = playniteApi ?? throw new ArgumentNullException(nameof(playniteApi));
            this.settings = settings ?? throw new ArgumentNullException(nameof(settings));
            dispatcher = mainWindow.Dispatcher;
        }

        public void NotifySettingsChanged()
        {
            if (!broken && settings.HoverDisabled)
            {
                showDelayTimer?.Stop();
                pendingShowGame = null;
                pendingShowAnchor = null;
                HidePopup();
                return;
            }

            if (broken || popup == null || !popup.IsOpen || lastShownGame == null)
            {
                return;
            }

            try
            {
                lastBuiltFieldsFingerprint = null;
                ShowOrUpdatePopup(lastShownGame, lastShownAnchor);
            }
            catch (Exception ex)
            {
                Logger.Error(ex, "GameHoverDetails failed to refresh hover content.");
            }
        }

        public void Attach()
        {
            if (attached || broken)
            {
                return;
            }

            hideDebounceTimer = new DispatcherTimer
            {
                Interval = TimeSpan.FromMilliseconds(HideDebounceMs)
            };
            hideDebounceTimer.Tick += HideDebounceTimerOnTick;

            showDelayTimer = new DispatcherTimer
            {
                Interval = TimeSpan.FromMilliseconds(1)
            };
            showDelayTimer.Tick += ShowDelayTimerOnTick;

            mainWindow.PreviewMouseMove += MainWindowOnPreviewMouseMove;
            mainWindow.StateChanged += MainWindowOnStateChanged;
            mainWindow.Closed += MainWindowOnClosed;
            if (Application.Current != null)
            {
                Application.Current.Deactivated += ApplicationOnDeactivated;
            }

            attached = true;
        }

        public void Detach()
        {
            if (!attached)
            {
                return;
            }

            mainWindow.PreviewMouseMove -= MainWindowOnPreviewMouseMove;
            mainWindow.StateChanged -= MainWindowOnStateChanged;
            mainWindow.Closed -= MainWindowOnClosed;
            if (Application.Current != null)
            {
                Application.Current.Deactivated -= ApplicationOnDeactivated;
            }

            hideDebounceTimer?.Stop();
            if (hideDebounceTimer != null)
            {
                hideDebounceTimer.Tick -= HideDebounceTimerOnTick;
            }

            hideDebounceTimer = null;

            showDelayTimer?.Stop();
            if (showDelayTimer != null)
            {
                showDelayTimer.Tick -= ShowDelayTimerOnTick;
            }

            showDelayTimer = null;

            StopEnterStoryboard();
            HidePopup();
            if (chromeBorder != null)
            {
                chromeBorder.PreviewMouseMove -= ChromeBorderOnPointerOverChrome;
                chromeBorder.MouseEnter -= ChromeBorderOnPointerOverChrome;
            }

            popup = null;
            chromeBorder = null;
            chromeFlyTransform = null;
            contentStack = null;
            lastShownGame = null;
            lastShownAnchor = null;
            lastBuiltFieldsFingerprint = null;

            attached = false;
        }

        private void MainWindowOnClosed(object sender, EventArgs e)
        {
            Detach();
        }

        private void ApplicationOnDeactivated(object sender, EventArgs e)
        {
            HidePopupForForegroundLoss();
        }

        private void MainWindowOnStateChanged(object sender, EventArgs e)
        {
            if (mainWindow.WindowState == WindowState.Minimized)
            {
                HidePopupForForegroundLoss();
            }
        }

        private void HidePopupForForegroundLoss()
        {
            if (broken)
            {
                return;
            }

            try
            {
                hideDebounceTimer?.Stop();
                HidePopup();
            }
            catch (Exception ex)
            {
                LatchBroken(ex);
            }
        }

        private void MainWindowOnPreviewMouseMove(object sender, MouseEventArgs e)
        {
            if (broken)
            {
                return;
            }

            if (settings.HoverDisabled)
            {
                showDelayTimer?.Stop();
                pendingShowGame = null;
                pendingShowAnchor = null;
                HidePopup();
                return;
            }

            try
            {
                var hit = Mouse.DirectlyOver as DependencyObject;
                Game game;
                FrameworkElement anchor;
                TryResolveGameAndAnchor(hit, playniteApi, out game, out anchor);

                if (game != null)
                {
                    hideDebounceTimer?.Stop();
                    ScheduleShowAfterDelay(game, anchor);
                }
                else
                {
                    showDelayTimer?.Stop();
                    pendingShowGame = null;
                    pendingShowAnchor = null;
                    hideDebounceTimer?.Stop();
                    hideDebounceTimer?.Start();
                }
            }
            catch (Exception ex)
            {
                LatchBroken(ex);
            }
        }

        private void ScheduleShowAfterDelay(Game game, FrameworkElement anchor)
        {
            if (settings.HoverDisabled)
            {
                showDelayTimer?.Stop();
                pendingShowGame = null;
                pendingShowAnchor = null;
                return;
            }

            pendingShowGame = game;
            pendingShowAnchor = anchor;
            showDelayTimer?.Stop();
            var delay = settings.ShowDelayMs;
            if (delay <= 0)
            {
                pendingShowGame = null;
                pendingShowAnchor = null;
                ShowOrUpdatePopup(game, anchor);
                return;
            }

            showDelayTimer.Interval = TimeSpan.FromMilliseconds(delay);
            showDelayTimer.Start();
        }

        private void ShowDelayTimerOnTick(object sender, EventArgs e)
        {
            if (broken)
            {
                return;
            }

            try
            {
                showDelayTimer?.Stop();
                var hit = Mouse.DirectlyOver as DependencyObject;
                Game g;
                FrameworkElement anchor;
                TryResolveGameAndAnchor(hit, playniteApi, out g, out anchor);
                if (g == null || pendingShowGame == null || g.Id != pendingShowGame.Id)
                {
                    pendingShowGame = null;
                    pendingShowAnchor = null;
                    return;
                }

                if (settings.HoverDisabled)
                {
                    pendingShowGame = null;
                    pendingShowAnchor = null;
                    return;
                }

                var useAnchor = anchor ?? pendingShowAnchor;
                pendingShowGame = null;
                pendingShowAnchor = null;
                ShowOrUpdatePopup(g, useAnchor);
            }
            catch (Exception ex)
            {
                LatchBroken(ex);
            }
        }

        private void HideDebounceTimerOnTick(object sender, EventArgs e)
        {
            if (broken)
            {
                return;
            }

            try
            {
                hideDebounceTimer?.Stop();
                var hit = Mouse.DirectlyOver as DependencyObject;
                Game g;
                FrameworkElement unused;
                TryResolveGameAndAnchor(hit, playniteApi, out g, out unused);
                if (g != null)
                {
                    return;
                }

                HidePopup();
            }
            catch (Exception ex)
            {
                LatchBroken(ex);
            }
        }

        private void LatchBroken(Exception ex)
        {
            if (broken)
            {
                return;
            }

            broken = true;
            Logger.Error(ex, "GameHoverDetails hover UI disabled after an error.");
            try
            {
                Detach();
            }
            catch
            {
                // ignore
            }
        }

        /// <summary>
        /// Outer-most visual ancestor that still carries the same game (stable anchor). Outside grid view,
        /// suppresses hover when the pointer is on an embedded ButtonBase under that host (play/info/toggles).
        /// Grid view keeps the hover so moving from cover to those icons does not dismiss the popup.
        /// </summary>
        private static void TryResolveGameAndAnchor(DependencyObject hit, IPlayniteAPI api, out Game game, out FrameworkElement anchor)
        {
            game = null;
            anchor = null;
            if (hit == null)
            {
                return;
            }

            Game resolvedGame = null;
            FrameworkElement outerGameFe = null;
            for (var current = hit; current != null; current = VisualTreeHelper.GetParent(current))
            {
                if (!(current is FrameworkElement fe))
                {
                    continue;
                }

                var g = TryGetGameFromDataContext(fe.DataContext);
                if (g == null)
                {
                    continue;
                }

                if (resolvedGame == null)
                {
                    resolvedGame = g;
                    outerGameFe = fe;
                }
                else if (resolvedGame.Id == g.Id)
                {
                    outerGameFe = fe;
                }
                else
                {
                    break;
                }
            }

            if (resolvedGame == null || outerGameFe == null)
            {
                return;
            }

            if (!IsGridDesktopView(api))
            {
                for (var current = hit; current != null; current = VisualTreeHelper.GetParent(current))
                {
                    if (ReferenceEquals(current, outerGameFe))
                    {
                        break;
                    }

                    if (current is ButtonBase)
                    {
                        return;
                    }
                }
            }

            game = resolvedGame;
            anchor = outerGameFe;
        }

        private static bool IsGridDesktopView(IPlayniteAPI api)
        {
            try
            {
                return api?.MainView != null && api.MainView.ActiveDesktopView == DesktopView.Grid;
            }
            catch
            {
                return false;
            }
        }

        private static Game TryGetGameFromDataContext(object dc)
        {
            if (dc == null)
            {
                return null;
            }

            if (dc is Game g)
            {
                return g;
            }

            try
            {
                var t = dc.GetType();
                var p = t.GetProperty("Game", BindingFlags.Instance | BindingFlags.Public);
                if (p != null && typeof(Game).IsAssignableFrom(p.PropertyType))
                {
                    return p.GetValue(dc, null) as Game;
                }
            }
            catch
            {
                // ignore reflection failures for unknown VMs
            }

            return null;
        }

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
            pendingShowGame = null;
            pendingShowAnchor = null;
            StopEnterStoryboard();
            if (popup != null)
            {
                popup.IsOpen = false;
            }

            if (chromeBorder != null)
            {
                chromeBorder.Opacity = 1;
            }

            if (chromeFlyTransform != null)
            {
                chromeFlyTransform.X = 0;
            }

            lastShownGame = null;
            lastShownAnchor = null;
            lastBuiltFieldsFingerprint = null;
        }

        /// <summary>
        /// Points are relative to the placement target's top-left (net462 CustomPopupPlacementCallback).
        /// List view: below the row, left-aligned; if that does not fit on-screen, above the row, left-aligned.
        /// Other views: prefer right of target, then left.
        /// </summary>
        private CustomPopupPlacement[] PlacePopupForCurrentDesktopView(Size popupSize, Size targetSize, Point offset)
        {
            if (IsListViewDesktop())
            {
                return PlacePopupListViewBottomThenTopLeft(popupSize, targetSize, offset);
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
        /// List row: popup top-left at (0, rowHeight+gap) — left edges match, open downward; fallback above row.
        /// </summary>
        private static CustomPopupPlacement[] PlacePopupListViewBottomThenTopLeft(Size popupSize, Size targetSize, Point offset)
        {
            var gap = PlacementGapDip;
            var below = new Point(offset.X, targetSize.Height + gap + offset.Y);
            var above = new Point(offset.X, -popupSize.Height - gap + offset.Y);
            return new[]
            {
                new CustomPopupPlacement(below, PopupPrimaryAxis.Vertical),
                new CustomPopupPlacement(above, PopupPrimaryAxis.Vertical)
            };
        }

        /// <summary>
        /// Grid (and other) views: prefer right of target, then left.
        /// </summary>
        private static CustomPopupPlacement[] PlacePopupGridOrDefault(Size popupSize, Size targetSize, Point offset)
        {
            var gap = PlacementGapDip;
            var right = new Point(targetSize.Width + gap + offset.X, offset.Y);
            var left = new Point(-popupSize.Width - gap + offset.X, offset.Y);
            return new[]
            {
                new CustomPopupPlacement(right, PopupPrimaryAxis.Horizontal),
                new CustomPopupPlacement(left, PopupPrimaryAxis.Horizontal)
            };
        }

        private void ShowOrUpdatePopup(Game game, FrameworkElement anchor)
        {
            if (settings.HoverDisabled)
            {
                HidePopup();
                return;
            }

            EnsurePopupShell();
            var wasOpen = popup.IsOpen;
            var previousId = lastShownGame?.Id;
            var sameGameContinue = wasOpen && previousId != null && previousId == game.Id;
            var gameChanged = lastShownGame == null || lastShownGame.Id != game.Id;

            var orderedKeys = settings.GetOrderedSelectedKeys();
            var w = Math.Max(120, settings.HoverWidth);
            var fieldsFingerprint =
                BuildFieldsFingerprint(orderedKeys)
                + "\x1e" + w.ToString(System.Globalization.CultureInfo.InvariantCulture)
                + "\x1e" + (settings.HideFieldTitlesInHover ? "1" : "0")
                + "\x1e" + (settings.ShowFieldInlineIconsInHover ? "1" : "0")
                + "\x1e" + settings.HoverFieldBlockSpacingDip.ToString(System.Globalization.CultureInfo.InvariantCulture);
            var canSkipContentRebuild =
                popup.IsOpen &&
                lastShownGame != null &&
                lastShownGame.Id == game.Id &&
                lastBuiltFieldsFingerprint == fieldsFingerprint;

            if (popup.IsOpen && gameChanged)
            {
                popup.IsOpen = false;
            }

            chromeBorder.MinWidth = w;
            chromeBorder.MaxWidth = w;
            var innerMax = Math.Max(60, w - ChromePadding);

            if (!canSkipContentRebuild)
            {
                contentStack.Children.Clear();
                var onlyIconSelected = orderedKeys.Count == 1 && orderedKeys[0] == "Icon";
                foreach (var key in orderedKeys)
                {
                    var isFirstBlock = contentStack.Children.Count == 0;
                    switch (key)
                    {
                        case "Icon":
                        case "CoverImage":
                        case "BackgroundImage":
                            TryAppendGameArtRow(key, game, innerMax, isFirstBlock, onlyIconSelected);
                            break;
                        case "Platform":
                            AppendPlatformRow(game, key, innerMax, isFirstBlock);
                            break;
                        default:
                            AppendTextDetailRow(key, game, innerMax, isFirstBlock);
                            break;
                    }
                }

                TrimLastContentBottomMargin(contentStack);

                lastBuiltFieldsFingerprint = fieldsFingerprint;
            }

            if (anchor != null && anchor.IsVisible)
            {
                popup.PlacementTarget = anchor;
                popup.Placement = PlacementMode.Custom;
                popup.HorizontalOffset = 0;
                popup.VerticalOffset = 0;
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
            if (sameGameContinue)
            {
                chromeBorder.Opacity = 1;
                chromeFlyTransform.X = 0;
            }
            else
            {
                chromeBorder.Opacity = 0;
                chromeFlyTransform.X = 0;
            }

            popup.IsOpen = true;
            lastShownGame = game;
            lastShownAnchor = anchor;

            var runEnterAnimation = !sameGameContinue;
            var invokeGen = ++layoutInvokeGeneration;
            dispatcher.BeginInvoke(
                new Action(() => AfterPopupLayout(runEnterAnimation, invokeGen)),
                DispatcherPriority.Loaded);
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
                ClampPopupToVirtualScreen();
                if (!runEnterAnimation)
                {
                    chromeBorder.Opacity = 1;
                    chromeFlyTransform.X = 0;
                    return;
                }

                popup.Child.UpdateLayout();
                chromeFlyTransform.X = 0;
                BeginEnterStoryboard();
            }
            catch (Exception ex)
            {
                Logger.Error(ex, "GameHoverDetails hover layout/animation failed.");
                StopEnterStoryboard();
                if (chromeBorder != null)
                {
                    chromeBorder.Opacity = 1;
                }

                chromeFlyTransform.X = 0;
            }
        }

        private void BeginEnterStoryboard()
        {
            StopEnterStoryboard();
            chromeFlyTransform.X = 0;
            var ease = new QuadraticEase { EasingMode = EasingMode.EaseOut };
            var duration = TimeSpan.FromMilliseconds(EnterAnimationMs);

            var opacityAnim = new DoubleAnimation
            {
                From = 0,
                To = 1,
                Duration = duration,
                EasingFunction = ease
            };
            Storyboard.SetTarget(opacityAnim, chromeBorder);
            Storyboard.SetTargetProperty(opacityAnim, new PropertyPath(UIElement.OpacityProperty));

            enterStoryboard = new Storyboard();
            enterStoryboard.Children.Add(opacityAnim);
            enterStoryboard.Begin();
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

                if (brDip.X > vsRight - margin)
                {
                    deltaX -= brDip.X - (vsRight - margin);
                }

                if (tlDip.X + deltaX < vsLeft + margin)
                {
                    deltaX += vsLeft + margin - tlDip.X - deltaX;
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

        private static void TrimLastContentBottomMargin(Panel panel)
        {
            if (panel.Children.Count == 0)
            {
                return;
            }

            if (!(panel.Children[panel.Children.Count - 1] is FrameworkElement last))
            {
                return;
            }

            var m = last.Margin;
            if (m.Bottom <= 0.01)
            {
                return;
            }

            last.Margin = new Thickness(m.Left, m.Top, m.Right, 0);
        }

        private void AppendFieldBlockSeparator(bool isFirstBlock)
        {
            if (isFirstBlock)
            {
                return;
            }

            var pad = FieldBlockSpacingHalfDip();
            contentStack.Children.Add(
                new Border
                {
                    Height = 1,
                    Margin = new Thickness(0, pad, 0, pad),
                    Background = SeparatorLineBrush,
                    IsHitTestVisible = false
                });
        }

        private Border CreateGlyphChip(string glyph)
        {
            var glyphTb = new TextBlock
            {
                Text = glyph,
                FontFamily = HoverFieldInlineIconFontFamily,
                FontSize = GlyphChipGlyphFontSize,
                Foreground = GlyphChipGlyphBrush,
                HorizontalAlignment = HorizontalAlignment.Center,
                VerticalAlignment = VerticalAlignment.Center,
                IsHitTestVisible = false
            };

            return new Border
            {
                Width = GlyphChipSizeDip,
                Height = GlyphChipSizeDip,
                CornerRadius = new CornerRadius(GlyphChipSizeDip / 2),
                Background = GlyphChipBackgroundBrush,
                Child = glyphTb,
                VerticalAlignment = VerticalAlignment.Center,
                HorizontalAlignment = HorizontalAlignment.Left,
                IsHitTestVisible = false
            };
        }

        /// <summary>Text/stat row layouts (separator is caller's responsibility).</summary>
        private void AppendTextDetailInner(string key, Game game, double innerMax, bool isFirstBlock)
        {
            var showTitle = !settings.HideFieldTitlesInHover;
            var useInlineGlyph = settings.ShowFieldInlineIconsInHover && !HoverFieldCatalog.IsGameArtImageField(key);
            var labelText = HoverFieldCatalog.GetDisplayName(key);
            var valueText = HoverFieldFormatter.Format(key, game, playniteApi);
            var topInset = isFirstBlock ? FirstBlockHeaderTopDip : FieldBlockSpacingHalfDip();
            var bottomInset = FieldBlockSpacingHalfDip();
            var textMaxStat = Math.Max(48, innerMax - GlyphChipSizeDip - StatRowGlyphToTextGapDip);

            if (showTitle && useInlineGlyph)
            {
                var row = new Grid
                {
                    MaxWidth = innerMax,
                    Margin = new Thickness(0, topInset, 0, bottomInset)
                };
                row.ColumnDefinitions.Add(new ColumnDefinition { Width = new GridLength(GlyphChipSizeDip) });
                row.ColumnDefinitions.Add(new ColumnDefinition { Width = new GridLength(1, GridUnitType.Star) });

                var chip = CreateGlyphChip(HoverFieldCatalog.GetSettingsGlyph(key));
                Grid.SetColumn(chip, 0);

                var label = new TextBlock { Margin = new Thickness(0, 0, 0, LabelToValueGapDip) };
                HoverDetailValuePresenter.ConfigureFieldLabelTextBlock(label, textMaxStat);
                HoverDetailValuePresenter.SetHeaderText(label, labelText, textMaxStat);

                var body = new TextBlock();
                HoverDetailValuePresenter.ConfigureBodyTextBlock(body, textMaxStat, BodyTextBrush);
                HoverDetailValuePresenter.SetBodyContent(body, valueText);

                var textCol = new StackPanel { Margin = new Thickness(StatRowGlyphToTextGapDip, 0, 0, 0) };
                textCol.Children.Add(label);
                textCol.Children.Add(body);
                Grid.SetColumn(textCol, 1);

                row.Children.Add(chip);
                row.Children.Add(textCol);
                contentStack.Children.Add(row);
                return;
            }

            if (showTitle && !useInlineGlyph)
            {
                var label = new TextBlock { Margin = new Thickness(0, topInset, 0, LabelToValueGapDip) };
                HoverDetailValuePresenter.ConfigureFieldLabelTextBlock(label, innerMax);
                HoverDetailValuePresenter.SetHeaderText(label, labelText, innerMax);

                var body = new TextBlock { Margin = new Thickness(0, 0, 0, bottomInset) };
                HoverDetailValuePresenter.ConfigureBodyTextBlock(body, innerMax, BodyTextBrush);
                HoverDetailValuePresenter.SetBodyContent(body, valueText);

                contentStack.Children.Add(label);
                contentStack.Children.Add(body);
                return;
            }

            if (useInlineGlyph)
            {
                var row = new Grid
                {
                    MaxWidth = innerMax,
                    Margin = new Thickness(0, topInset, 0, bottomInset)
                };
                row.ColumnDefinitions.Add(new ColumnDefinition { Width = new GridLength(GlyphChipSizeDip) });
                row.ColumnDefinitions.Add(new ColumnDefinition { Width = new GridLength(1, GridUnitType.Star) });

                var chip = CreateGlyphChip(HoverFieldCatalog.GetSettingsGlyph(key));
                Grid.SetColumn(chip, 0);

                var body = new TextBlock
                {
                    VerticalAlignment = VerticalAlignment.Center
                };
                HoverDetailValuePresenter.ConfigureBodyTextBlock(body, textMaxStat, BodyTextBrush);
                HoverDetailValuePresenter.SetBodyContent(body, valueText);
                Grid.SetColumn(body, 1);
                body.Margin = new Thickness(StatRowGlyphToTextGapDip, 0, 0, 0);

                row.Children.Add(chip);
                row.Children.Add(body);
                contentStack.Children.Add(row);
                return;
            }

            var bodyOnly = new TextBlock
            {
                Margin = new Thickness(0, topInset, 0, bottomInset)
            };
            HoverDetailValuePresenter.ConfigureBodyTextBlock(bodyOnly, innerMax, BodyTextBrush);
            HoverDetailValuePresenter.SetBodyContent(bodyOnly, valueText);
            contentStack.Children.Add(bodyOnly);
        }

        private void AppendTextDetailRow(string key, Game game, double innerMax, bool isFirstBlock)
        {
            AppendFieldBlockSeparator(isFirstBlock);
            AppendTextDetailInner(key, game, innerMax, isFirstBlock);
        }

        private const double HoverIconBoxPx = 40;

        private void TryAppendGameArtRow(string key, Game game, double innerMax, bool isFirstBlock, bool showGameNameBesideIcon)
        {
            var bmp = HoverBitmapLoader.TryLoadGameArt(key, game, playniteApi);
            if (bmp == null)
            {
                return;
            }

            AppendFieldBlockSeparator(isFirstBlock);

            double maxW;
            double maxH;
            switch (key)
            {
                case "Icon":
                    maxW = HoverIconBoxPx;
                    maxH = HoverIconBoxPx;
                    break;
                case "CoverImage":
                    maxW = innerMax;
                    maxH = 220;
                    break;
                default:
                    maxW = innerMax;
                    maxH = 140;
                    break;
            }

            var top = isFirstBlock ? FirstBlockHeaderTopDip : FieldBlockSpacingHalfDip();
            var bottom = FieldBlockSpacingHalfDip();

            if (key == "Icon" && showGameNameBesideIcon)
            {
                var textMax = Math.Max(48, innerMax - HoverIconBoxPx - StatRowGlyphToTextGapDip);
                var row = new Grid
                {
                    MaxWidth = innerMax,
                    Margin = new Thickness(0, top, 0, bottom)
                };
                row.ColumnDefinitions.Add(new ColumnDefinition { Width = GridLength.Auto });
                row.ColumnDefinitions.Add(new ColumnDefinition { Width = new GridLength(1, GridUnitType.Star) });

                var img = new Image
                {
                    Source = bmp,
                    Stretch = Stretch.Uniform,
                    MaxWidth = maxW,
                    MaxHeight = maxH,
                    Width = HoverIconBoxPx,
                    Height = HoverIconBoxPx,
                    HorizontalAlignment = HorizontalAlignment.Left,
                    VerticalAlignment = VerticalAlignment.Center,
                    IsHitTestVisible = false
                };
                Grid.SetColumn(img, 0);

                var nameTb = new TextBlock
                {
                    Margin = new Thickness(StatRowGlyphToTextGapDip, 0, 0, 0),
                    VerticalAlignment = VerticalAlignment.Center
                };
                HoverDetailValuePresenter.ConfigureBodyTextBlock(nameTb, textMax, BodyTextBrush);
                HoverDetailValuePresenter.SetBodyContent(nameTb, HoverFieldFormatter.Format("Name", game, playniteApi));
                Grid.SetColumn(nameTb, 1);

                row.Children.Add(img);
                row.Children.Add(nameTb);
                contentStack.Children.Add(row);
                return;
            }

            var imgOnly = new Image
            {
                Source = bmp,
                Stretch = Stretch.Uniform,
                MaxWidth = maxW,
                MaxHeight = maxH,
                HorizontalAlignment = HorizontalAlignment.Left,
                Margin = new Thickness(0, top, 0, bottom),
                IsHitTestVisible = false
            };

            contentStack.Children.Add(imgOnly);
        }

        private void AppendPlatformRow(Game game, string key, double innerMax, bool isFirstBlock)
        {
            AppendFieldBlockSeparator(isFirstBlock);

            var showTitle = !settings.HideFieldTitlesInHover;
            var labelText = HoverFieldCatalog.GetDisplayName(key);

            var topInset = isFirstBlock ? FirstBlockHeaderTopDip : FieldBlockSpacingHalfDip();
            var bottomInset = FieldBlockSpacingHalfDip();
            var panel = new StackPanel
            {
                Orientation = Orientation.Horizontal,
                HorizontalAlignment = HorizontalAlignment.Left,
                MaxWidth = innerMax,
                Margin = new Thickness(0, topInset, 0, bottomInset)
            };

            if (game.Platforms != null)
            {
                foreach (var platform in game.Platforms)
                {
                    var iconBmp = HoverBitmapLoader.TryLoadPlatformIcon(platform, playniteApi);
                    if (iconBmp == null)
                    {
                        continue;
                    }

                    panel.Children.Add(
                        new Image
                        {
                            Source = iconBmp,
                            Height = HoverIconBoxPx,
                            Width = HoverIconBoxPx,
                            MaxHeight = HoverIconBoxPx,
                            MaxWidth = HoverIconBoxPx,
                            Margin = new Thickness(0, 0, 6, 0),
                            Stretch = Stretch.Uniform,
                            HorizontalAlignment = HorizontalAlignment.Left
                        });
                }
            }

            if (panel.Children.Count > 0)
            {
                if (showTitle)
                {
                    var label = new TextBlock { Margin = new Thickness(0, topInset, 0, LabelToValueGapDip) };
                    HoverDetailValuePresenter.ConfigureFieldLabelTextBlock(label, innerMax);
                    HoverDetailValuePresenter.SetHeaderText(label, labelText, innerMax);
                    contentStack.Children.Add(label);
                    panel.Margin = new Thickness(0, 0, 0, bottomInset);
                }

                contentStack.Children.Add(panel);
                return;
            }

            AppendTextDetailInner(key, game, innerMax, isFirstBlock);
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
                LatchBroken(ex);
            }
        }

        private void EnsurePopupShell()
        {
            if (popup != null)
            {
                return;
            }

            contentStack = new StackPanel
            {
                Margin = new Thickness(14, 12, 14, 12),
                IsHitTestVisible = true
            };

            chromeFlyTransform = new TranslateTransform();
            chromeBorder = new Border
            {
                Background = new SolidColorBrush(Color.FromRgb(28, 28, 30)),
                BorderBrush = new SolidColorBrush(Color.FromRgb(72, 72, 78)),
                BorderThickness = new Thickness(1),
                CornerRadius = new CornerRadius(ChromeCornerRadiusDip),
                Child = contentStack,
                IsHitTestVisible = true,
                RenderTransform = chromeFlyTransform,
                RenderTransformOrigin = new Point(0, 0),
                Effect = new DropShadowEffect
                {
                    Color = Colors.Black,
                    BlurRadius = 14,
                    ShadowDepth = 2,
                    Opacity = 0.32,
                    Direction = 270
                }
            };
            chromeBorder.PreviewMouseMove += ChromeBorderOnPointerOverChrome;
            chromeBorder.MouseEnter += ChromeBorderOnPointerOverChrome;

            popup = new Popup
            {
                AllowsTransparency = true,
                StaysOpen = true,
                PopupAnimation = PopupAnimation.None,
                Child = chromeBorder,
                IsHitTestVisible = true
            };
        }
    }
}
