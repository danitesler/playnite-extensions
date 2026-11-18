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
        private readonly KeyboardFocusChangedEventHandler keyboardFocusHandler;

        /// <summary>
        /// Hover was opened by keyboard or gamepad focus, not the pointer. A resting cursor must not
        /// steal it back; the next pointer move onto a tile clears this and takes over.
        /// </summary>
        private bool keyboardFollowActive;

        /// <summary>Delayed open must be confirmed against focus, not <see cref="Mouse.DirectlyOver"/>.</summary>
        private bool pendingShowFromKeyboard;

        public GameHoverDetailsHoverService(Window mainWindow, IPlayniteAPI playniteApi, GameHoverDetailsSettings settings)
        {
            this.mainWindow = mainWindow ?? throw new ArgumentNullException(nameof(mainWindow));
            this.playniteApi = playniteApi ?? throw new ArgumentNullException(nameof(playniteApi));
            this.settings = settings ?? throw new ArgumentNullException(nameof(settings));
            dispatcher = mainWindow.Dispatcher;
            contextMenuOpeningHandler = MainWindowOnContextMenuOpening;
            contextMenuClosingHandler = MainWindowOnContextMenuClosing;
            keyboardFocusHandler = MainWindowOnGotKeyboardFocus;
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
            mainWindow.PreviewMouseDown += MainWindowOnPreviewMouseDown;
            mainWindow.PreviewMouseWheel += MainWindowOnPreviewMouseWheel;
            mainWindow.PreviewKeyDown += MainWindowOnPreviewKeyDown;
            mainWindow.AddHandler(Keyboard.GotKeyboardFocusEvent, keyboardFocusHandler, true);
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
            mainWindow.PreviewMouseDown -= MainWindowOnPreviewMouseDown;
            mainWindow.PreviewMouseWheel -= MainWindowOnPreviewMouseWheel;
            mainWindow.PreviewKeyDown -= MainWindowOnPreviewKeyDown;
            mainWindow.RemoveHandler(Keyboard.GotKeyboardFocusEvent, keyboardFocusHandler);
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
    }
}
