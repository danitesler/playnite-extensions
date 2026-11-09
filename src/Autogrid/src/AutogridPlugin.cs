using System;
using System.ComponentModel;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Threading;
using Playnite.SDK;
using Playnite.SDK.Events;
using Playnite.SDK.Plugins;

namespace Autogrid
{
    public class AutogridPlugin : GenericPlugin
    {
        private static readonly Guid PluginId = Guid.Parse("7F3E9B82-4D1C-4E8A-9F2B-6C5A891D0E2F");
        private static readonly ILogger Logger = LogManager.GetLogger();
        private const string GridItemWidthProperty = "GridItemWidth";
        private const string GridItemSpacingProperty = "GridItemSpacing";

        private readonly AutogridSettings settings;
        private Window hookedWindow;
        private DispatcherTimer debounceTimer;
        private DispatcherTimer saveSettingsTimer;
        private object pendingSaveAppSettings;
        private bool reflectionBroken;
        private bool reflectionBrokenLogged;
        private bool handlersAttached;
        private bool startupApplyComplete;
        private int startupApplyAttemptsRemaining;
        private bool settingsApplyPosted;
        private INotifyPropertyChanged watchedAppSettings;
        private bool detailsPanelFlagMissingLogged;
        private readonly GridWidthPin gridPin = new GridWidthPin();
        private bool gridPinMissingLogged;
        private bool wrapPanelResetBroken;
        private ScrollViewer trackedScrollViewer;
        private GridLayoutSignature? lastGridLayout;

        public override Guid Id => PluginId;

        public AutogridPlugin(IPlayniteAPI api) : base(api)
        {
            settings = new AutogridSettings(this);
            settings.PropertyChanged += OnSettingsPropertyChanged;
            Properties = new GenericPluginProperties
            {
                HasSettings = true
            };
        }

        public override ISettings GetSettings(bool firstRunSettings)
        {
            return settings;
        }

        public override System.Windows.Controls.UserControl GetSettingsView(bool firstRunSettings)
        {
            return new AutogridSettingsView();
        }

        public override void OnApplicationStarted(OnApplicationStartedEventArgs args)
        {
            PlayniteApi.MainView.UIDispatcher.BeginInvoke(
                new Action(AttachWhenReady),
                DispatcherPriority.Loaded);
        }

        public override void OnApplicationStopped(OnApplicationStoppedEventArgs args)
        {
            settings.PropertyChanged -= OnSettingsPropertyChanged;
            settings.PersistPluginSettings();
            FlushPendingAppSettingsSave();
            DetachWindowHooks();
        }

        private void OnSettingsPropertyChanged(object sender, PropertyChangedEventArgs e)
        {
            if (!settings.Enabled || !settings.KeepGridWhileDetailsOpen)
            {
                gridPin.Release();
            }

            if (reflectionBroken)
            {
                return;
            }

            var n = e.PropertyName;
            if (n != null &&
                n != nameof(AutogridSettings.SizingMode) &&
                n != nameof(AutogridSettings.TargetColumns) &&
                n != nameof(AutogridSettings.TargetRows) &&
                n != nameof(AutogridSettings.ViewportAdjustPx) &&
                n != nameof(AutogridSettings.KeepGridWhileDetailsOpen) &&
                n != nameof(AutogridSettings.Enabled))
            {
                return;
            }

            RequestApplyFromSettings();
        }

        private void RequestApplyFromSettings()
        {
            if (reflectionBroken || settingsApplyPosted)
            {
                return;
            }

            settingsApplyPosted = true;
            PlayniteApi.MainView.UIDispatcher.BeginInvoke(
                new Action(() =>
                {
                    settingsApplyPosted = false;
                    try
                    {
                        ApplyAutogrid();
                    }
                    catch (Exception ex)
                    {
                        LatchReflectionBroken(ex);
                    }
                }),
                DispatcherPriority.Loaded);
        }

        private void AttachWhenReady()
        {
            try
            {
                var app = Application.Current;
                if (app == null)
                {
                    return;
                }

                if (app.MainWindow != null)
                {
                    TryHookMainWindow(app.MainWindow);
                }
                else
                {
                    app.Activated += OnApplicationActivatedOnce;
                }
            }
            catch (Exception ex)
            {
                Logger.Error(ex, "Autogrid failed to attach to the main window.");
            }
        }

        private void OnApplicationActivatedOnce(object sender, EventArgs e)
        {
            try
            {
                Application.Current.Activated -= OnApplicationActivatedOnce;
                if (Application.Current?.MainWindow != null)
                {
                    TryHookMainWindow(Application.Current.MainWindow);
                }
            }
            catch (Exception ex)
            {
                Logger.Error(ex, "Autogrid failed on application activated.");
            }
        }

        private void TryHookMainWindow(Window window)
        {
            if (window == null || handlersAttached)
            {
                return;
            }

            hookedWindow = window;
            debounceTimer = new DispatcherTimer
            {
                Interval = TimeSpan.FromMilliseconds(50)
            };
            debounceTimer.Tick += DebounceTimerOnTick;

            window.SizeChanged += OnWindowSizeHint;
            window.SizeChanged += OnWindowSizeChanged;
            window.LayoutUpdated += OnWindowLayoutHint;
            window.StateChanged += OnWindowSizeHint;
            window.Loaded += WindowOnLoadedOnce;
            window.ContentRendered += WindowOnContentRenderedOnce;
            window.Closed += MainWindowOnClosed;

            handlersAttached = true;
            BeginStartupApply();
        }

        private void WindowOnLoadedOnce(object sender, RoutedEventArgs e)
        {
            if (hookedWindow != null)
            {
                hookedWindow.Loaded -= WindowOnLoadedOnce;
            }

            TryApplyStartupNow();
        }

        private void WindowOnContentRenderedOnce(object sender, EventArgs e)
        {
            if (hookedWindow != null)
            {
                hookedWindow.ContentRendered -= WindowOnContentRenderedOnce;
            }

            TryApplyStartupNow();
        }

        private void BeginStartupApply()
        {
            if (reflectionBroken)
            {
                return;
            }

            startupApplyComplete = false;
            startupApplyAttemptsRemaining = 8;
            TryApplyStartupNow();
        }

        private void TryApplyStartupNow()
        {
            if (startupApplyComplete || reflectionBroken)
            {
                return;
            }

            if (TryApplyOnce())
            {
                startupApplyComplete = true;
                return;
            }

            if (startupApplyAttemptsRemaining <= 0)
            {
                startupApplyComplete = true;
                return;
            }

            startupApplyAttemptsRemaining--;
            PlayniteApi.MainView.UIDispatcher.BeginInvoke(
                new Action(TryApplyStartupNow),
                DispatcherPriority.Render);
        }

        private bool TryApplyOnce()
        {
            try
            {
                return ApplyAutogrid();
            }
            catch (Exception ex)
            {
                LatchReflectionBroken(ex);
                return false;
            }
        }

        private void RequestDebouncedApply()
        {
            if (reflectionBroken)
            {
                return;
            }

            debounceTimer?.Stop();
            debounceTimer?.Start();
        }

        private void MainWindowOnClosed(object sender, EventArgs e)
        {
            DetachWindowHooks();
        }

        private void OnWindowSizeHint(object sender, EventArgs e)
        {
            if (!HandledByStartupApply())
            {
                RequestDebouncedApply();
            }
        }

        /// <summary>
        /// LayoutUpdated fires for any layout pass in the app, and something can re-lay out every
        /// frame (240 passes/s seen after using a filter). Restarting the debounce on each pass
        /// would starve it forever, so only a real change in the games list's size restarts it.
        /// </summary>
        private void OnWindowLayoutHint(object sender, EventArgs e)
        {
            if (HandledByStartupApply())
            {
                return;
            }

            if (trackedScrollViewer == null)
            {
                // Grid not measured yet: arm the timer once, never push it back.
                if (!reflectionBroken && debounceTimer?.IsEnabled == false)
                {
                    debounceTimer.Start();
                }

                return;
            }

            var current = GridLayoutSignature.Capture(trackedScrollViewer);
            if (lastGridLayout.HasValue && lastGridLayout.Value.Matches(current))
            {
                return;
            }

            lastGridLayout = current;
            RequestDebouncedApply();
        }

        private bool HandledByStartupApply()
        {
            if (startupApplyComplete)
            {
                return false;
            }

            if (TryApplyOnce())
            {
                startupApplyComplete = true;
            }

            return true;
        }

        private void OnWindowSizeChanged(object sender, SizeChangedEventArgs e)
        {
            // The details panel keeps its width, so the grid's full width moves with the window.
            if (e.WidthChanged && e.PreviousSize.Width > 0)
            {
                gridPin.Grow(e.NewSize.Width - e.PreviousSize.Width);
            }
        }

        private void DebounceTimerOnTick(object sender, EventArgs e)
        {
            debounceTimer?.Stop();
            try
            {
                ApplyAutogrid();
            }
            catch (Exception ex)
            {
                LatchReflectionBroken(ex);
            }
        }

        private bool ApplyAutogrid()
        {
            if (reflectionBroken)
            {
                return false;
            }

            if (!settings.Enabled)
            {
                RestoreUserCoverSize();
                return true;
            }

            if (PlayniteApi.MainView.ActiveDesktopView != DesktopView.Grid)
            {
                return false;
            }

            var window = hookedWindow ?? Application.Current?.MainWindow;
            if (window == null)
            {
                return false;
            }

            var appSettings = GridLayoutService.TryResolveAppSettings(window);
            if (appSettings == null)
            {
                return false;
            }

            WatchAppSettings(appSettings);
            if (IsPausedForDetailsPanel(appSettings))
            {
                // The details panel narrows the grid; keep the covers as they are and
                // re-fit when it closes (OnAppSettingsPropertyChanged).
                return true;
            }

            if (!GridLayoutService.TryGetGridLayoutInputs(appSettings, out var currentSpacing, out var currentWidth))
            {
                LatchReflectionBroken(null);
                return false;
            }

            CaptureUserLayoutIfNeeded(currentWidth, currentSpacing);

            var metrics = GridLayoutService.ResolveViewportMetrics(window, PlayniteApi, settings.ViewportAdjustPx);
            if (metrics.PickedScrollViewer != null)
            {
                trackedScrollViewer = metrics.PickedScrollViewer;
                lastGridLayout = GridLayoutSignature.Capture(trackedScrollViewer);
            }

            double targetWidth;
            var targetSpacing = settings.HasSavedUserLayout
                ? settings.SavedUserGridItemSpacing
                : currentSpacing;

            if (settings.SizingMode == GridSizingMode.Rows)
            {
                if (metrics.PickedScrollViewer == null ||
                    !GridLayoutService.TryMeasureTileVerticalPitch(metrics.PickedScrollViewer, out var tileMeasurements))
                {
                    return false;
                }

                var verticalMargin = GridLayoutService.SpacingToAxisMargin(targetSpacing);
                targetWidth = GridLayoutService.ComputeTargetGridItemWidthForRows(
                    metrics.ViewportHeight,
                    settings.TargetRows,
                    verticalMargin,
                    currentWidth,
                    tileMeasurements);
            }
            else
            {
                if (metrics.Viewport <= 0)
                {
                    return false;
                }

                if (!GridLayoutService.ComputeColumnLayout(
                        metrics.Viewport,
                        settings.TargetColumns,
                        targetSpacing,
                        out targetWidth,
                        out targetSpacing))
                {
                    return false;
                }
            }

            if (targetWidth <= 0)
            {
                return false;
            }

            var widthChanged = Math.Abs(currentWidth - targetWidth) >= 0.01;
            var spacingChanged = currentSpacing != targetSpacing;
            if (!widthChanged && !spacingChanged)
            {
                return true;
            }

            if (spacingChanged && !GridLayoutService.TrySetGridItemSpacing(appSettings, targetSpacing))
            {
                LatchReflectionBroken(null);
                return false;
            }

            if (widthChanged && !GridLayoutService.TrySetGridItemWidth(appSettings, targetWidth))
            {
                LatchReflectionBroken(null);
                return false;
            }

            ResetGridTileSizeCache(window);
            ScheduleSaveAppSettings(appSettings);
            return true;
        }

        /// <summary>
        /// Runs right after a cover size write, before the layout pass that re-measures the tiles,
        /// so the grid's wrap panel lays rows out with the new tile size instead of its cached one.
        /// </summary>
        private void ResetGridTileSizeCache(Window window)
        {
            if (wrapPanelResetBroken)
            {
                return;
            }

            var list = GridWidthPin.FindGamesList(window);
            if (list == null || GridLayoutService.ResetWrapPanelItemSize(list) >= 0)
            {
                return;
            }

            wrapPanelResetBroken = true;
            Logger.Warn("Autogrid cannot reset the grid panel's cached tile size; covers can misplace after large size changes.");
        }

        private bool IsPausedForDetailsPanel(object appSettings)
        {
            if (!settings.KeepGridWhileDetailsOpen)
            {
                return false;
            }

            if (GridLayoutService.TryGetGridDetailsPanelOpen(appSettings, out var open))
            {
                return open;
            }

            if (!detailsPanelFlagMissingLogged)
            {
                detailsPanelFlagMissingLogged = true;
                Logger.Warn(
                    $"Autogrid cannot read Playnite's {GridLayoutService.GridDetailsPanelProperty}; " +
                    "covers keep resizing while game details are open.");
            }

            return false;
        }

        private void WatchAppSettings(object appSettings)
        {
            if (ReferenceEquals(appSettings, watchedAppSettings))
            {
                return;
            }

            UnwatchAppSettings();
            watchedAppSettings = appSettings as INotifyPropertyChanged;
            if (watchedAppSettings != null)
            {
                watchedAppSettings.PropertyChanged += OnAppSettingsPropertyChanged;
            }
        }

        private void UnwatchAppSettings()
        {
            if (watchedAppSettings != null)
            {
                watchedAppSettings.PropertyChanged -= OnAppSettingsPropertyChanged;
            }

            watchedAppSettings = null;
        }

        private void OnAppSettingsPropertyChanged(object sender, PropertyChangedEventArgs e)
        {
            // Cover size changes don't move the list's size, so layout passes can't report them:
            // this is the confirmation pass after Autogrid's own write and what re-fits the zoom slider.
            if (e.PropertyName == GridItemWidthProperty || e.PropertyName == GridItemSpacingProperty)
            {
                PlayniteApi.MainView.UIDispatcher.BeginInvoke(
                    new Action(RequestDebouncedApply),
                    DispatcherPriority.Send);
                return;
            }

            if (!string.IsNullOrEmpty(e.PropertyName) &&
                e.PropertyName != GridLayoutService.GridDetailsPanelProperty)
            {
                return;
            }

            if (!GridLayoutService.TryGetGridDetailsPanelOpen(sender, out var open))
            {
                return;
            }

            // ShowGameSideBarCommand sets the flag on every game it shows, even when already open.
            if (open && gridPin.IsPinned)
            {
                return;
            }

            // Pin or release before Playnite's next layout pass, which is when the list would reflow.
            var dispatcher = PlayniteApi.MainView.UIDispatcher;
            if (dispatcher.CheckAccess())
            {
                OnGridDetailsPanelToggled(sender, open);
            }
            else
            {
                dispatcher.BeginInvoke(
                    new Action(() => OnGridDetailsPanelToggled(sender, open)),
                    DispatcherPriority.Send);
            }
        }

        private void OnGridDetailsPanelToggled(object appSettings, bool open)
        {
            if (open)
            {
                Logger.Debug("Autogrid: grid game details opened.");
                PinGridForDetailsPanel(appSettings);
                return;
            }

            Logger.Debug("Autogrid: grid game details closed.");
            gridPin.Release();

            // Loaded runs right after the layout pass that collapses the panel, so the scroll
            // viewport already has its full width. Applying there (not through the debounce, which
            // every layout pass of the reflow restarts) re-fits the covers in the next frame.
            PlayniteApi.MainView.UIDispatcher.BeginInvoke(
                new Action(ApplyAfterDetailsClosed),
                DispatcherPriority.Loaded);
        }

        private void ApplyAfterDetailsClosed()
        {
            debounceTimer?.Stop();
            if (TryApplyOnce())
            {
                Logger.Debug("Autogrid: grid re-fit after game details closed.");
                return;
            }

            RequestDebouncedApply();
        }

        private void PinGridForDetailsPanel(object appSettings)
        {
            if (reflectionBroken || !settings.Enabled || !settings.KeepGridWhileDetailsOpen)
            {
                return;
            }

            if (PlayniteApi.MainView.ActiveDesktopView != DesktopView.Grid)
            {
                return;
            }

            var window = hookedWindow ?? Application.Current?.MainWindow;
            var content = GridWidthPin.FindGamesListContent(window);
            if (gridPin.TryPin(content, GridLayoutService.IsGridDetailsPanelOnLeft(appSettings)))
            {
                Logger.Debug($"Autogrid: grid kept at {gridPin.PinnedWidth:0} px while game details are open.");
            }
            else if (!gridPinMissingLogged)
            {
                gridPinMissingLogged = true;
                Logger.Warn("Autogrid could not hold the grid view's games list; the grid reflows while game details are open.");
            }
        }

        private void CaptureUserLayoutIfNeeded(double currentWidth, int currentSpacing)
        {
            if (settings.HasSavedUserLayout)
            {
                return;
            }

            settings.HasSavedUserLayout = true;
            settings.SavedUserGridItemWidth = currentWidth;
            settings.SavedUserGridItemSpacing = currentSpacing;
        }

        private void RestoreUserCoverSize()
        {
            if (reflectionBroken || !settings.HasSavedUserLayout)
            {
                return;
            }

            var window = hookedWindow ?? Application.Current?.MainWindow;
            var appSettings = window != null ? GridLayoutService.TryResolveAppSettings(window) : null;
            if (appSettings == null)
            {
                return;
            }

            var widthOk = GridLayoutService.TrySetGridItemWidth(appSettings, settings.SavedUserGridItemWidth);
            var spacingOk = GridLayoutService.TrySetGridItemSpacing(appSettings, settings.SavedUserGridItemSpacing);
            if (!widthOk)
            {
                LatchReflectionBroken(null);
                return;
            }

            if (!spacingOk)
            {
                Logger.Warn("Autogrid restored cover width but could not write GridItemSpacing.");
            }

            GridLayoutService.TrySaveAppSettings(appSettings);
            CancelPendingAppSettingsSave();
            settings.HasSavedUserLayout = false;
        }

        private void LatchReflectionBroken(Exception ex)
        {
            reflectionBroken = true;
            if (!reflectionBrokenLogged)
            {
                reflectionBrokenLogged = true;
                if (ex != null)
                {
                    Logger.Error(ex, "Autogrid stopped: Playnite settings reflection failed.");
                }
                else
                {
                    Logger.Error("Autogrid stopped: Playnite settings reflection failed.");
                }
            }
        }

        private void ScheduleSaveAppSettings(object appSettings)
        {
            pendingSaveAppSettings = appSettings;
            if (saveSettingsTimer == null)
            {
                saveSettingsTimer = new DispatcherTimer
                {
                    Interval = TimeSpan.FromMilliseconds(250)
                };
                saveSettingsTimer.Tick += SaveSettingsTimerOnTick;
            }

            saveSettingsTimer.Stop();
            saveSettingsTimer.Start();
        }

        private void SaveSettingsTimerOnTick(object sender, EventArgs e)
        {
            saveSettingsTimer?.Stop();
            var appSettings = pendingSaveAppSettings;
            pendingSaveAppSettings = null;
            if (appSettings != null)
            {
                GridLayoutService.TrySaveAppSettings(appSettings);
            }
        }

        private void FlushPendingAppSettingsSave()
        {
            saveSettingsTimer?.Stop();
            var appSettings = pendingSaveAppSettings;
            pendingSaveAppSettings = null;
            if (appSettings != null)
            {
                GridLayoutService.TrySaveAppSettings(appSettings);
            }
        }

        private void CancelPendingAppSettingsSave()
        {
            saveSettingsTimer?.Stop();
            pendingSaveAppSettings = null;
        }

        private void DetachWindowHooks()
        {
            FlushPendingAppSettingsSave();
            UnwatchAppSettings();
            gridPin.Release();

            if (saveSettingsTimer != null)
            {
                saveSettingsTimer.Tick -= SaveSettingsTimerOnTick;
            }

            saveSettingsTimer = null;
            pendingSaveAppSettings = null;

            debounceTimer?.Stop();
            if (debounceTimer != null)
            {
                debounceTimer.Tick -= DebounceTimerOnTick;
            }

            debounceTimer = null;

            if (hookedWindow != null && handlersAttached)
            {
                hookedWindow.SizeChanged -= OnWindowSizeHint;
                hookedWindow.SizeChanged -= OnWindowSizeChanged;
                hookedWindow.LayoutUpdated -= OnWindowLayoutHint;
                hookedWindow.StateChanged -= OnWindowSizeHint;
                hookedWindow.Loaded -= WindowOnLoadedOnce;
                hookedWindow.ContentRendered -= WindowOnContentRenderedOnce;
                hookedWindow.Closed -= MainWindowOnClosed;
            }

            hookedWindow = null;
            handlersAttached = false;
            trackedScrollViewer = null;
            lastGridLayout = null;
            startupApplyComplete = false;

            try
            {
                Application.Current.Activated -= OnApplicationActivatedOnce;
            }
            catch
            {
                // ignore
            }
        }
    }
}
