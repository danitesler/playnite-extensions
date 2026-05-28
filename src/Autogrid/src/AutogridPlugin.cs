using System;
using System.ComponentModel;
using System.Windows;
using System.Windows.Threading;
using Playnite.SDK;
using Playnite.SDK.Events;
using Playnite.SDK.Plugins;

namespace Autogrid
{
    public class AutogridPlugin : GenericPlugin
    {
        private static readonly Guid PluginId = Guid.Parse("7F3E9B82-4D1C-4E8A-9F2B-6C5A891D0E2F");

        private readonly AutogridSettings settings;
        private Window hookedWindow;
        private DispatcherTimer debounceTimer;
        private DispatcherTimer saveSettingsTimer;
        private object pendingSaveAppSettings;
        private bool reflectionBroken;
        private bool handlersAttached;
        private bool startupApplyComplete;
        private int startupApplyAttemptsRemaining;
        private bool settingsApplyPosted;

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
            FlushPendingAppSettingsSave();
            DetachWindowHooks();
        }

        private void OnSettingsPropertyChanged(object sender, PropertyChangedEventArgs e)
        {
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
                    catch
                    {
                        reflectionBroken = true;
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
            catch
            {
                // ignore
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
            catch
            {
                // ignore
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

            window.SizeChanged += OnWindowLayoutHint;
            window.LayoutUpdated += OnWindowLayoutHint;
            window.StateChanged += OnWindowLayoutHint;
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
            if (reflectionBroken || !settings.Enabled)
            {
                return;
            }

            startupApplyComplete = false;
            startupApplyAttemptsRemaining = 8;
            TryApplyStartupNow();
        }

        private void TryApplyStartupNow()
        {
            if (startupApplyComplete || reflectionBroken || !settings.Enabled)
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
            catch
            {
                reflectionBroken = true;
                return false;
            }
        }

        private void RequestDebouncedApply()
        {
            if (reflectionBroken || !settings.Enabled)
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

        private void OnWindowLayoutHint(object sender, EventArgs e)
        {
            if (!startupApplyComplete)
            {
                if (TryApplyOnce())
                {
                    startupApplyComplete = true;
                }

                return;
            }

            RequestDebouncedApply();
        }

        private void DebounceTimerOnTick(object sender, EventArgs e)
        {
            debounceTimer?.Stop();
            try
            {
                ApplyAutogrid();
            }
            catch
            {
                reflectionBroken = true;
            }
        }

        private bool ApplyAutogrid()
        {
            if (!settings.Enabled || reflectionBroken)
            {
                return false;
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

            if (!GridLayoutService.TryGetGridLayoutInputs(appSettings, out var spacing, out var currentWidth))
            {
                reflectionBroken = true;
                return false;
            }

            var metrics = GridLayoutService.ResolveViewportMetrics(window, PlayniteApi, settings.ViewportAdjustPx);
            double target;
            if (settings.SizingMode == GridSizingMode.Rows)
            {
                if (metrics.PickedScrollViewer == null ||
                    !GridLayoutService.TryMeasureTileVerticalPitch(metrics.PickedScrollViewer, out var tileMeasurements))
                {
                    return false;
                }

                var verticalMargin = GridLayoutService.GetVerticalMarginPerTile(appSettings, spacing);
                target = GridLayoutService.ComputeTargetGridItemWidthForRows(
                    metrics.ViewportHeight,
                    settings.TargetRows,
                    verticalMargin,
                    currentWidth,
                    tileMeasurements);
            }
            else
            {
                var perTileMargin = GridLayoutService.GetHorizontalMarginPerTile(appSettings, spacing);
                target = GridLayoutService.ComputeTargetGridItemWidth(
                    metrics.Viewport,
                    settings.TargetColumns,
                    perTileMargin);
            }

            if (target <= 0)
            {
                return false;
            }

            if (Math.Abs(currentWidth - target) < 0.01)
            {
                return true;
            }

            if (!GridLayoutService.TrySetGridItemWidth(appSettings, target))
            {
                reflectionBroken = true;
                return false;
            }

            ScheduleSaveAppSettings(appSettings);
            return true;
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

        private void DetachWindowHooks()
        {
            FlushPendingAppSettingsSave();

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
                hookedWindow.SizeChanged -= OnWindowLayoutHint;
                hookedWindow.LayoutUpdated -= OnWindowLayoutHint;
                hookedWindow.StateChanged -= OnWindowLayoutHint;
                hookedWindow.Loaded -= WindowOnLoadedOnce;
                hookedWindow.ContentRendered -= WindowOnContentRenderedOnce;
                hookedWindow.Closed -= MainWindowOnClosed;
            }

            hookedWindow = null;
            handlersAttached = false;
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
