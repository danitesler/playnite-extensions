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
    internal sealed class GameHoverDetailsHoverService
    {
        private static readonly ILogger Logger = LogManager.GetLogger();

        private double ContentPaddingDip()
        {
            var s = settings.HoverContentPaddingDip;
            if (s < GameHoverDetailsSettings.MinContentPaddingDip)
            {
                return GameHoverDetailsSettings.MinContentPaddingDip;
            }

            return s > GameHoverDetailsSettings.MaxContentPaddingDip
                ? GameHoverDetailsSettings.MaxContentPaddingDip
                : s;
        }

        /// <summary>Horizontal inner inset: twice the content-stack margin (left + right).</summary>
        private double ChromePadding() => ContentPaddingDip() * 2;

        private Thickness ContentListMargin()
        {
            var p = ContentPaddingDip();
            return new Thickness(p, p, p, p);
        }

        private const double PlacementGapDip = 8;
        private const double EnterAnimationMs = 80;
        private const double HideDebounceMs = 70;

        /// <summary>Safety net for popups that outlive their trigger (plugin windows, overlays, view swaps).</summary>
        private const double VisibilityWatchdogMs = 500;

        /// <summary>A single odd visual tree must not kill hover until Playnite restarts.</summary>
        private const int MaxConsecutiveHoverErrors = 5;

        /// <summary>Last resort if a context menu opened but never reports Closing.</summary>
        private const double ContextMenuSuppressMaxMs = 20000;

        /// <summary>How long a menu may take to report <c>IsOpen</c> after ContextMenuOpening.</summary>
        private const double ContextMenuOpenGraceMs = 1000;

        private const double ChromeCornerRadiusDip = 8;
        private const double FrostBlurRadius = 24;
        private const int FanartBackgroundDecodePx = 960;

        private readonly Window mainWindow;
        private readonly IPlayniteAPI playniteApi;
        private readonly GameHoverDetailsSettings settings;
        private readonly Dispatcher dispatcher;

        private bool broken;
        private int consecutiveHoverErrors;
        private bool attached;
        private DispatcherTimer hideDebounceTimer;
        private DispatcherTimer showDelayTimer;
        private DispatcherTimer visibilityWatchdogTimer;
        private Game pendingShowGame;
        private FrameworkElement pendingShowAnchor;
        private Popup popup;
        private Border chromeRoot;
        private Border chromeBorder;
        private Grid chromeBody;
        private Border coverHost;
        private Border coverTint;
        private Guid? lastCoverGameId;
        private Border frostHost;
        private Image frostImage;
        private TranslateTransform chromeFlyTransform;
        private StackPanel contentStack;
        private Game lastShownGame;
        private FrameworkElement lastShownAnchor;
        private Storyboard enterStoryboard;
        private int layoutInvokeGeneration;
        private string lastBuiltFieldsFingerprint;
        private HoverChromePalette palette;
        private bool settingsNotifyQueued;
        private int deferredHoverSyncGeneration;
        private bool contextMenuOpen;
        private bool contextMenuSeenOpen;
        private DateTime contextMenuOpenedAtUtc;
        private ContextMenu openLibraryContextMenu;
        private readonly ContextMenuEventHandler contextMenuOpeningHandler;
        private readonly ContextMenuEventHandler contextMenuClosingHandler;

        public GameHoverDetailsHoverService(Window mainWindow, IPlayniteAPI playniteApi, GameHoverDetailsSettings settings)
        {
            this.mainWindow = mainWindow ?? throw new ArgumentNullException(nameof(mainWindow));
            this.playniteApi = playniteApi ?? throw new ArgumentNullException(nameof(playniteApi));
            this.settings = settings ?? throw new ArgumentNullException(nameof(settings));
            dispatcher = mainWindow.Dispatcher;
            contextMenuOpeningHandler = MainWindowOnContextMenuOpening;
            contextMenuClosingHandler = MainWindowOnContextMenuClosing;
        }

        public void NotifySettingsChanged()
        {
            if (broken)
            {
                return;
            }

            if (settingsNotifyQueued)
            {
                return;
            }

            settingsNotifyQueued = true;
            dispatcher.BeginInvoke(new Action(FlushSettingsChanged), DispatcherPriority.ApplicationIdle);
        }

        private void FlushSettingsChanged()
        {
            settingsNotifyQueued = false;
            if (!attached || broken)
            {
                return;
            }

            ApplySettingsChanged();
        }

        private void ApplySettingsChanged()
        {
            if (!broken && settings.IsHoverSuppressed())
            {
                showDelayTimer?.Stop();
                pendingShowGame = null;
                pendingShowAnchor = null;
                HidePopup();
                return;
            }

            if (broken)
            {
                return;
            }

            lastBuiltFieldsFingerprint = null;

            // Settings Save closes a modal dialog. Do not decode fanart or rebuild
            // chrome while the popup is closed — that froze Playnite for seconds.
            if (popup == null || !popup.IsOpen || lastShownGame == null)
            {
                return;
            }

            try
            {
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

            consecutiveHoverErrors = 0;
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

            visibilityWatchdogTimer = new DispatcherTimer
            {
                Interval = TimeSpan.FromMilliseconds(VisibilityWatchdogMs)
            };
            visibilityWatchdogTimer.Tick += VisibilityWatchdogOnTick;

            mainWindow.PreviewMouseMove += MainWindowOnPreviewMouseMove;
            mainWindow.PreviewMouseWheel += MainWindowOnPreviewMouseWheel;
            mainWindow.PreviewKeyDown += MainWindowOnPreviewKeyDown;
            mainWindow.StateChanged += MainWindowOnStateChanged;
            mainWindow.Deactivated += MainWindowOnDeactivated;
            mainWindow.Closed += MainWindowOnClosed;
            mainWindow.AddHandler(FrameworkElement.ContextMenuOpeningEvent, contextMenuOpeningHandler, true);
            mainWindow.AddHandler(FrameworkElement.ContextMenuClosingEvent, contextMenuClosingHandler, true);
            if (Application.Current != null)
            {
                Application.Current.Deactivated += ApplicationOnDeactivated;
            }

            attached = true;

            dispatcher.BeginInvoke(new Action(WarmupPopupShell), DispatcherPriority.ContextIdle);
        }

        private void WarmupPopupShell()
        {
            if (broken || !attached)
            {
                return;
            }

            try
            {
                EnsurePopupShell();
            }
            catch (Exception ex)
            {
                Logger.Error(ex, "GameHoverDetails popup shell warmup failed.");
            }
        }

        public void Detach()
        {
            if (!attached)
            {
                return;
            }

            mainWindow.PreviewMouseMove -= MainWindowOnPreviewMouseMove;
            mainWindow.PreviewMouseWheel -= MainWindowOnPreviewMouseWheel;
            mainWindow.PreviewKeyDown -= MainWindowOnPreviewKeyDown;
            mainWindow.StateChanged -= MainWindowOnStateChanged;
            mainWindow.Deactivated -= MainWindowOnDeactivated;
            mainWindow.Closed -= MainWindowOnClosed;
            mainWindow.RemoveHandler(FrameworkElement.ContextMenuOpeningEvent, contextMenuOpeningHandler);
            mainWindow.RemoveHandler(FrameworkElement.ContextMenuClosingEvent, contextMenuClosingHandler);
            ClearContextMenuSuppress();
            deferredHoverSyncGeneration++;
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

            visibilityWatchdogTimer?.Stop();
            if (visibilityWatchdogTimer != null)
            {
                visibilityWatchdogTimer.Tick -= VisibilityWatchdogOnTick;
            }

            visibilityWatchdogTimer = null;

            StopEnterStoryboard();
            HidePopup();
            if (chromeRoot != null)
            {
                chromeRoot.SizeChanged -= ChromeRootOnSizeChanged;
            }

            if (chromeBody != null)
            {
                chromeBody.SizeChanged -= ChromeBodyOnSizeChanged;
            }

            if (chromeBorder != null)
            {
                chromeBorder.PreviewMouseMove -= ChromeBorderOnPointerOverChrome;
                chromeBorder.MouseEnter -= ChromeBorderOnPointerOverChrome;
            }

            popup = null;
            chromeRoot = null;
            chromeBorder = null;
            chromeBody = null;
            coverHost = null;
            coverTint = null;
            lastCoverGameId = null;
            frostHost = null;
            frostImage = null;
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
            ClearContextMenuSuppress();
            HidePopupForForegroundLoss();
        }

        private void MainWindowOnDeactivated(object sender, EventArgs e)
        {
            // In-app plugin/dialog windows deactivate MainWindow but not Application.
            ClearContextMenuSuppress();
            HidePopupForForegroundLoss();
        }

        private void MainWindowOnStateChanged(object sender, EventArgs e)
        {
            if (mainWindow.WindowState == WindowState.Minimized)
            {
                ClearContextMenuSuppress();
                HidePopupForForegroundLoss();
            }
        }

        private void MainWindowOnContextMenuOpening(object sender, ContextMenuEventArgs e)
        {
            if (e.Handled)
            {
                return;
            }

            contextMenuOpen = true;
            contextMenuSeenOpen = false;
            contextMenuOpenedAtUtc = DateTime.UtcNow;
            openLibraryContextMenu = TryGetContextMenu(e);
            HidePopupForForegroundLoss();
        }

        private void MainWindowOnContextMenuClosing(object sender, ContextMenuEventArgs e)
        {
            ClearContextMenuSuppress();
        }

        private void ClearContextMenuSuppress()
        {
            contextMenuOpen = false;
            contextMenuSeenOpen = false;
            openLibraryContextMenu = null;
        }

        /// <summary>
        /// Hover is for the library under the pointer. Block only while a game context menu is open,
        /// or while another window of this process (plugin dialog) is active or in the foreground.
        /// Do not require MainWindow.IsActive — leaving Playnite and mousing back must work.
        /// </summary>
        private bool ShouldBlockHover()
        {
            return settings.IsHoverSuppressed()
                || IsLibraryContextMenuBlocking()
                || HasOtherApplicationWindowActive()
                || IsOtherInProcessWindowForeground();
        }

        private bool IsLibraryContextMenuBlocking()
        {
            if (!contextMenuOpen)
            {
                return false;
            }

            // ContextMenuClosing does not always fire (Escape, click-through, menu rebuilt by a
            // plugin). Without this bound the hover would stay blocked until Playnite restarts.
            var elapsedMs = (DateTime.UtcNow - contextMenuOpenedAtUtc).TotalMilliseconds;
            if (elapsedMs > ContextMenuSuppressMaxMs)
            {
                ClearContextMenuSuppress();
                return false;
            }

            var menu = openLibraryContextMenu;
            if (menu != null)
            {
                try
                {
                    if (menu.IsOpen)
                    {
                        contextMenuSeenOpen = true;
                        return true;
                    }
                }
                catch
                {
                    ClearContextMenuSuppress();
                    return false;
                }
            }

            if (contextMenuSeenOpen)
            {
                // Closed without ContextMenuClosing (common when the pointer leaves Playnite).
                ClearContextMenuSuppress();
                return false;
            }

            // Never reported open: the opening was cancelled, or the menu could not be resolved.
            // Hold hover only for the moment WPF needs to show it, not for the full timeout.
            if (elapsedMs > ContextMenuOpenGraceMs)
            {
                ClearContextMenuSuppress();
                return false;
            }

            return true;
        }

        private bool HasOtherApplicationWindowActive()
        {
            var app = Application.Current;
            if (app == null)
            {
                return false;
            }

            try
            {
                foreach (Window window in app.Windows)
                {
                    if (window == null || ReferenceEquals(window, mainWindow))
                    {
                        continue;
                    }

                    if (window.IsActive && window.IsVisible)
                    {
                        return true;
                    }
                }
            }
            catch
            {
                return false;
            }

            return false;
        }

        /// <summary>
        /// Catches in-process windows that never reach <see cref="Application.Windows"/> (plugin
        /// dialogs hosting WinForms/native content). Windows owned by *other* processes must not
        /// block: leaving Playnite and mousing back over a tile has to keep working.
        /// </summary>
        private bool IsOtherInProcessWindowForeground()
        {
            try
            {
                var foreground = GetForegroundWindow();
                if (foreground == IntPtr.Zero)
                {
                    return false;
                }

                if (foreground == new WindowInteropHelper(mainWindow).Handle)
                {
                    return false;
                }

                var wpfSource = HwndSource.FromHwnd(foreground);
                if (wpfSource != null)
                {
                    // Ours, and identifiable: only real windows count. Popup HWNDs (this hover,
                    // tooltips, menus, combo drop-downs) would otherwise make the panel hide and
                    // re-show itself in a loop.
                    return wpfSource.RootVisual is Window window
                        && !ReferenceEquals(window, mainWindow)
                        && window.IsVisible;
                }

                int processId;
                GetWindowThreadProcessId(foreground, out processId);
                return processId == CurrentProcessId;
            }
            catch
            {
                return false;
            }
        }

        private static ContextMenu TryGetContextMenu(ContextMenuEventArgs e)
        {
            if (e == null)
            {
                return null;
            }

            if (e.Source is ContextMenu fromSource)
            {
                return fromSource;
            }

            if (e.OriginalSource is ContextMenu fromOriginal)
            {
                return fromOriginal;
            }

            var fe = e.Source as FrameworkElement ?? e.OriginalSource as FrameworkElement;
            if (fe?.ContextMenu != null)
            {
                return fe.ContextMenu;
            }

            for (var current = e.OriginalSource as DependencyObject; current != null; current = GetTreeParent(current))
            {
                if (current is ContextMenu menu)
                {
                    return menu;
                }

                if (current is FrameworkElement currentFe && currentFe.ContextMenu != null)
                {
                    return currentFe.ContextMenu;
                }
            }

            return null;
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
                HandleHoverError(ex);
            }
        }

        private void MainWindowOnPreviewKeyDown(object sender, KeyEventArgs e)
        {
            if (broken || e.IsRepeat || e.Key == Key.None)
            {
                return;
            }

            QueueDeferredHoverSync();
        }

        /// <summary>
        /// Details/list wheel scroll moves games under a still cursor — <see cref="UIElement.PreviewMouseMove"/>
        /// does not fire. Sync after the scroll is applied so the open tooltip swaps content instead of blinking.
        /// </summary>
        private void MainWindowOnPreviewMouseWheel(object sender, MouseWheelEventArgs e)
        {
            if (broken)
            {
                return;
            }

            QueueDeferredHoverSync();
        }

        /// <summary>
        /// After Playnite handles a key or wheel (list scroll, F4/F9), hit-test the pointer.
        /// Still over a game → keep the tooltip and switch content; otherwise hide.
        /// </summary>
        private void QueueDeferredHoverSync()
        {
            var popupOpen = popup != null && popup.IsOpen;
            var showPending = pendingShowGame != null || (showDelayTimer != null && showDelayTimer.IsEnabled);
            if (!popupOpen && !showPending)
            {
                return;
            }

            var generation = ++deferredHoverSyncGeneration;
            dispatcher.BeginInvoke(
                new Action(() => DeferredHoverSync(generation)),
                DispatcherPriority.ContextIdle);
        }

        private void DeferredHoverSync(int generation)
        {
            if (broken || !attached || generation != deferredHoverSyncGeneration)
            {
                return;
            }

            if (ShouldBlockHover())
            {
                hideDebounceTimer?.Stop();
                HidePopup();
                return;
            }

            try
            {
                var hit = Mouse.DirectlyOver as DependencyObject;
                Game game;
                FrameworkElement anchor;
                TryResolveGameAndAnchor(hit, playniteApi, out game, out anchor);
                consecutiveHoverErrors = 0;
                if (game != null)
                {
                    hideDebounceTimer?.Stop();
                    if (IsAlreadyShowing(game, anchor))
                    {
                        showDelayTimer?.Stop();
                        pendingShowGame = null;
                        pendingShowAnchor = null;
                        return;
                    }

                    ScheduleShowAfterDelay(game, anchor);
                    return;
                }

                hideDebounceTimer?.Stop();
                HidePopup();
            }
            catch (Exception ex)
            {
                HandleHoverError(ex);
            }
        }

        private void MainWindowOnPreviewMouseMove(object sender, MouseEventArgs e)
        {
            TryHandlePointerHover();
        }

        /// <summary>
        /// Resolve the game under the pointer and show, switch, or debounce-hide.
        /// Switching while the popup is already open skips appear delay and enter fade.
        /// </summary>
        private void TryHandlePointerHover()
        {
            if (broken)
            {
                return;
            }

            if (ShouldBlockHover())
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
                consecutiveHoverErrors = 0;

                if (game != null)
                {
                    hideDebounceTimer?.Stop();
                    if (IsAlreadyShowing(game, anchor))
                    {
                        showDelayTimer?.Stop();
                        pendingShowGame = null;
                        pendingShowAnchor = null;
                        return;
                    }

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
                HandleHoverError(ex);
            }
        }

        /// <summary>
        /// Every move over the same tile used to re-run the show pipeline (palette resolve, fanart
        /// decode, placement, fade). Nothing about the panel changes, so skip the whole pass.
        /// </summary>
        private bool IsAlreadyShowing(Game game, FrameworkElement anchor)
        {
            return game != null
                && popup != null
                && popup.IsOpen
                && lastShownGame != null
                && lastShownGame.Id == game.Id
                && ReferenceEquals(lastShownAnchor, anchor);
        }

        private void ScheduleShowAfterDelay(Game game, FrameworkElement anchor)
        {
            if (ShouldBlockHover())
            {
                showDelayTimer?.Stop();
                pendingShowGame = null;
                pendingShowAnchor = null;
                return;
            }

            pendingShowGame = game;
            pendingShowAnchor = anchor;
            showDelayTimer?.Stop();

            // Appear delay is first-open only. An already-visible tooltip must swap
            // content immediately — waiting restarts the fade and looks like blink.
            var alreadyOpen = popup != null && popup.IsOpen;
            var delay = alreadyOpen ? 0 : settings.ShowDelayMs;
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

                if (ShouldBlockHover())
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
                HandleHoverError(ex);
            }
        }

        /// <summary>
        /// Last line of defence for a panel that outlived its trigger: a plugin window opened from the
        /// context menu, the view switched, or the tile was recycled while the pointer never moved.
        /// Runs only while the popup is open. Hides when the pointer is off games; switches content
        /// when the pointer is over a different game (wheel scroll in details view).
        /// </summary>
        private void VisibilityWatchdogOnTick(object sender, EventArgs e)
        {
            if (broken || popup == null || !popup.IsOpen)
            {
                visibilityWatchdogTimer?.Stop();
                return;
            }

            try
            {
                if (ShouldBlockHover() || lastShownGame == null)
                {
                    hideDebounceTimer?.Stop();
                    HidePopup();
                    return;
                }

                Game game;
                FrameworkElement anchor;
                TryResolveGameAndAnchor(Mouse.DirectlyOver as DependencyObject, playniteApi, out game, out anchor);
                if (game == null)
                {
                    hideDebounceTimer?.Stop();
                    HidePopup();
                    return;
                }

                // Pointer is still on a game (possibly a different row after scroll).
                // Switch content in place — hiding here is what made fast sweeps blink.
                if (!IsAlreadyShowing(game, anchor))
                {
                    ScheduleShowAfterDelay(game, anchor);
                }
            }
            catch (Exception ex)
            {
                HandleHoverError(ex);
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
                FrameworkElement anchor;
                TryResolveGameAndAnchor(hit, playniteApi, out g, out anchor);
                if (g != null && !ShouldBlockHover())
                {
                    if (!IsAlreadyShowing(g, anchor))
                    {
                        ScheduleShowAfterDelay(g, anchor);
                    }

                    return;
                }

                HidePopup();
            }
            catch (Exception ex)
            {
                HandleHoverError(ex);
            }
        }

        /// <summary>
        /// One unexpected element in a third-party view used to disable hover for the rest of the
        /// session. Recover from isolated failures and only give up when they keep repeating.
        /// </summary>
        private void HandleHoverError(Exception ex)
        {
            if (broken)
            {
                return;
            }

            consecutiveHoverErrors++;
            if (consecutiveHoverErrors < MaxConsecutiveHoverErrors)
            {
                Logger.Warn(
                    ex,
                    "GameHoverDetails hover error " + consecutiveHoverErrors + "/" + MaxConsecutiveHoverErrors + "; recovering.");
                try
                {
                    hideDebounceTimer?.Stop();
                    showDelayTimer?.Stop();
                    HidePopup();
                }
                catch
                {
                    // ignore
                }

                return;
            }

            broken = true;
            Logger.Error(ex, "GameHoverDetails hover UI disabled after repeated errors.");
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

            if (IsHitOnMenu(hit))
            {
                return;
            }

            Game resolvedGame = null;
            FrameworkElement outerGameFe = null;
            for (var current = hit; current != null; current = GetTreeParent(current))
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
                for (var current = hit; current != null; current = GetTreeParent(current))
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

        /// <summary>
        /// Playnite game context-menu items often share the tile's <see cref="Game"/> DataContext.
        /// Treat those hits as "not on a tile" so the hover cannot stick to the menu.
        /// </summary>
        private static bool IsHitOnMenu(DependencyObject hit)
        {
            for (var current = hit; current != null; current = GetTreeParent(current))
            {
                if (current is ContextMenu || current is MenuItem || current is Menu)
                {
                    return true;
                }
            }

            return false;
        }

        /// <summary>
        /// Parent of a hit-test or focus result. <see cref="VisualTreeHelper.GetParent"/> throws on
        /// <see cref="ContentElement"/> (e.g. a <c>Run</c> inside a TextBlock).
        /// </summary>
        internal static DependencyObject GetTreeParent(DependencyObject child)
        {
            if (child == null)
            {
                return null;
            }

            if (child is Visual || child is Visual3D)
            {
                return VisualTreeHelper.GetParent(child);
            }

            if (child is FrameworkContentElement fce)
            {
                return fce.Parent;
            }

            if (child is ContentElement ce)
            {
                var parent = ContentOperations.GetParent(ce);
                if (parent != null)
                {
                    return parent;
                }
            }

            return LogicalTreeHelper.GetParent(child);
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
            hideDebounceTimer?.Stop();
            visibilityWatchdogTimer?.Stop();
            pendingShowGame = null;
            pendingShowAnchor = null;
            StopEnterStoryboard();
            if (popup != null)
            {
                popup.IsOpen = false;
            }

            if (chromeRoot != null)
            {
                chromeRoot.Opacity = 1;
            }

            if (chromeFlyTransform != null)
            {
                chromeFlyTransform.X = 0;
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
            var w = Math.Max(120, settings.ResolveHoverPanelWidth());
            var fieldsFingerprint =
                BuildFieldsFingerprint(orderedKeys)
                + "\x1e" + w.ToString(System.Globalization.CultureInfo.InvariantCulture)
                + "\x1e" + (settings.HideFieldTitlesInHover ? "1" : "0")
                + "\x1e" + (settings.ShowFieldInlineIconsInHover ? "1" : "0")
                + "\x1e" + (settings.HideIconChipBackground ? "1" : "0")
                + "\x1e" + (settings.HideFieldDividers ? "1" : "0")
                + "\x1e" + (settings.HidePanelBorder ? "1" : "0")
                + "\x1e" + (settings.HideEmptyFields ? "1" : "0")
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
            if (wasOpen)
            {
                chromeRoot.Opacity = 1;
                chromeFlyTransform.X = 0;
            }
            else
            {
                chromeRoot.Opacity = 0;
                chromeFlyTransform.X = 0;
            }

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
                NudgeRtlPopupOutsideAnchor();
                ClampPopupToVirtualScreen();
                UpdateFrostBackdrop();
                if (!runEnterAnimation)
                {
                    chromeRoot.Opacity = 1;
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
                if (chromeRoot != null)
                {
                    chromeRoot.Opacity = 1;
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

        /// <summary>
        /// RTL side placement: put the panel fully left of the tile, top-aligned. WPF custom placement
        /// often reports width 0 on first open, which parks the HWND on the tile.
        /// </summary>
        private void NudgeRtlPopupOutsideAnchor()
        {
            if (popup?.Child == null || lastShownAnchor == null || popup.Placement != PlacementMode.Custom)
            {
                return;
            }

            if (IsListViewDesktop() || !HoverLoc.IsRightToLeftLayout(playniteApi, mainWindow))
            {
                return;
            }

            var child = popup.Child;
            var width = child.RenderSize.Width;
            var height = child.RenderSize.Height;
            var tileW = lastShownAnchor.ActualWidth;
            var tileH = lastShownAnchor.ActualHeight;
            if (width < 8 || height < 8 || tileW < 8 || tileH < 8)
            {
                return;
            }

            var source = PresentationSource.FromVisual(child) as HwndSource;
            if (source?.CompositionTarget == null)
            {
                return;
            }

            var fromDevice = source.CompositionTarget.TransformFromDevice;
            var popupRect = GetVisualScreenRectDip(child, width, height, fromDevice, out _, out _);
            var tileRect = GetVisualScreenRectDip(lastShownAnchor, tileW, tileH, fromDevice, out _, out _);
            if (popupRect.Width < 1 || tileRect.Width < 1)
            {
                return;
            }

            const double margin = 8;
            var vsLeft = SystemParameters.VirtualScreenLeft;
            var vsRight = vsLeft + SystemParameters.VirtualScreenWidth;
            var gap = PlacementGapDip;

            var desiredLeft = tileRect.Left - popupRect.Width - gap;
            if (desiredLeft < vsLeft + margin)
            {
                desiredLeft = tileRect.Right + gap;
                if (desiredLeft + popupRect.Width > vsRight - margin)
                {
                    desiredLeft = vsRight - margin - popupRect.Width;
                }
            }

            var desiredTop = tileRect.Top;
            var deltaX = desiredLeft - popupRect.X;
            var deltaY = desiredTop - popupRect.Y;
            if (Math.Abs(deltaX) < 0.5 && Math.Abs(deltaY) < 0.5)
            {
                return;
            }

            // Offset apply removed: it fought ShowOrUpdatePopup's offset reset (jumping). Placement math is the fix.
        }

        private static Rect GetVisualScreenRectDip(Visual visual, double layoutWidth, double layoutHeight, System.Windows.Media.Matrix fromDevice, out Point a, out Point b)
        {
            a = fromDevice.Transform(visual.PointToScreen(new Point(0, 0)));
            b = fromDevice.Transform(visual.PointToScreen(new Point(layoutWidth, layoutHeight)));
            var x1 = Math.Min(a.X, b.X);
            var y1 = Math.Min(a.Y, b.Y);
            return new Rect(x1, y1, Math.Abs(b.X - a.X), Math.Abs(b.Y - a.Y));
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

            chromeFlyTransform = new TranslateTransform();
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
                IsHitTestVisible = true,
                RenderTransform = chromeFlyTransform,
                RenderTransformOrigin = new Point(0, 0)
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
            if (chromeBody == null)
            {
                return;
            }

            var w = chromeBody.ActualWidth;
            var h = chromeBody.ActualHeight;
            if (w <= 0 || h <= 0)
            {
                chromeBody.Clip = null;
                return;
            }

            var innerRadius = Math.Max(0, ChromeCornerRadiusDip - 1);
            chromeBody.Clip = new RectangleGeometry(new Rect(0, 0, w, h), innerRadius, innerRadius);
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

        [DllImport("user32.dll", ExactSpelling = true)]
        private static extern IntPtr GetForegroundWindow();

        [DllImport("user32.dll", ExactSpelling = true)]
        private static extern int GetWindowThreadProcessId(IntPtr hWnd, out int processId);

        private static readonly int CurrentProcessId = System.Diagnostics.Process.GetCurrentProcess().Id;

        private HoverChromePalette Palette => palette ?? (palette = HoverChromePalette.Resolve(settings));

        /// <summary>Fanart and Regular both size to the field list. Fanart uses <c>Stretch.UniformToFill</c> (aspect preserved; overflow cropped, typically the sides).</summary>
        private void ClearArtPanelHeightLimit()
        {
            if (chromeBorder == null)
            {
                return;
            }

            chromeBorder.MaxHeight = double.PositiveInfinity;
            chromeBorder.MinHeight = 0;
            chromeBorder.ClearValue(FrameworkElement.HeightProperty);
            if (chromeRoot != null)
            {
                chromeRoot.MaxHeight = double.PositiveInfinity;
                chromeRoot.MinHeight = 0;
                chromeRoot.ClearValue(FrameworkElement.HeightProperty);
            }

            if (contentStack != null)
            {
                contentStack.VerticalAlignment = VerticalAlignment.Top;
                contentStack.ClearValue(FrameworkElement.HeightProperty);
                contentStack.ClearValue(FrameworkElement.MinHeightProperty);
            }
        }

        private void InvalidatePopupToContentHeight()
        {
            ClearArtPanelHeightLimit();
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
                coverHost.Background = null;
                coverHost.Visibility = Visibility.Collapsed;
                coverTint.Visibility = Visibility.Collapsed;
                lastCoverGameId = null;
                return false;
            }

            if (lastCoverGameId == game.Id && coverHost.Background is ImageBrush)
            {
                coverHost.Visibility = Visibility.Visible;
                coverTint.Visibility = Visibility.Visible;
                return true;
            }

            var bmp = HoverBitmapLoader.TryLoadGameArt("BackgroundImage", game, playniteApi, FanartBackgroundDecodePx);
            if (bmp == null)
            {
                coverHost.Background = null;
                coverHost.Visibility = Visibility.Collapsed;
                coverTint.Visibility = Visibility.Collapsed;
                lastCoverGameId = null;
                return false;
            }

            coverHost.Background = new ImageBrush(bmp)
            {
                Stretch = Stretch.UniformToFill,
                AlignmentX = AlignmentX.Center,
                AlignmentY = AlignmentY.Center,
                TileMode = TileMode.None
            };
            coverHost.Visibility = Visibility.Visible;
            coverTint.Visibility = Visibility.Visible;
            lastCoverGameId = game.Id;
            ApplyFanartTintOpacity();
            UpdateCoverClip();
            return true;
        }

        private void ApplyFanartTintOpacity()
        {
            if (coverTint == null)
            {
                return;
            }

            var o = settings.HoverChromeBackgroundOpacity / 100.0;
            if (o < 0)
            {
                o = 0;
            }
            else if (o > 1)
            {
                o = 1;
            }

            coverTint.Opacity = o;
        }

        private void ApplyChrome(Game coverGame = null)
        {
            palette = HoverChromePalette.Resolve(settings);
            var coverActive = UpdateCoverBackground(coverGame ?? lastShownGame);
            HoverChromePalette.ApplyToChromeBorder(chromeBorder, settings, coverActive);
            if (coverActive)
            {
                ApplyFanartTintOpacity();
            }

            ClearArtPanelHeightLimit();
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
            UpdateFrostBackdrop();
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
