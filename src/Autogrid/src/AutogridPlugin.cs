using System;
using System.Collections.Generic;
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

        private readonly AutogridSettings settings;
        private Window hookedWindow;
        private DispatcherTimer debounceTimer;
        private bool reflectionBroken;
        private bool handlersAttached;
        private double lastWindowActualWidth = double.NaN;
        private double lastWindowActualHeight = double.NaN;
        private TopPanelItem autogridTopPanelItem;
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

        public override IEnumerable<TopPanelItem> GetTopPanelItems()
        {
            if (autogridTopPanelItem == null)
            {
                autogridTopPanelItem = new TopPanelItem
                {
                    Title = "Autogrid",
                    Icon = new TextBlock
                    {
                        Text = "\uE713",
                        FontSize = 20,
                        FontFamily = new System.Windows.Media.FontFamily("Segoe MDL2 Assets")
                    },
                    Activated = () => OpenSettingsView()
                };
            }

            autogridTopPanelItem.Visible = settings.ShowTopPanelSettingsButton;
            yield return autogridTopPanelItem;
        }

        internal void UpdateTopPanelItemVisibility()
        {
            if (autogridTopPanelItem != null)
            {
                autogridTopPanelItem.Visible = settings.ShowTopPanelSettingsButton;
            }
        }

        public override void OnApplicationStarted(OnApplicationStartedEventArgs args)
        {
            PlayniteApi.MainView.UIDispatcher.BeginInvoke(
                new Action(AttachWhenReady),
                DispatcherPriority.ApplicationIdle);
        }

        public override void OnApplicationStopped(OnApplicationStoppedEventArgs args)
        {
            settings.PropertyChanged -= OnSettingsPropertyChanged;
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
                n != nameof(AutogridSettings.TargetColumns) &&
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
                DispatcherPriority.Normal);
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
            window.StateChanged += OnWindowLayoutHint;
            window.Closed += MainWindowOnClosed;

            handlersAttached = true;
        }

        private void MainWindowOnClosed(object sender, EventArgs e)
        {
            DetachWindowHooks();
        }

        private void OnWindowLayoutHint(object sender, EventArgs e)
        {
            if (reflectionBroken || !settings.Enabled)
            {
                return;
            }

            debounceTimer?.Stop();
            debounceTimer?.Start();
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

        private void ApplyAutogrid()
        {
            if (!settings.Enabled || reflectionBroken)
            {
                return;
            }

            if (PlayniteApi.MainView.ActiveDesktopView != DesktopView.Grid)
            {
                return;
            }

            var window = hookedWindow ?? Application.Current?.MainWindow;
            if (window == null)
            {
                return;
            }

            var appSettings = GridLayoutService.TryResolveAppSettings(window);
            if (appSettings == null)
            {
                return;
            }

            if (!GridLayoutService.TryGetGridLayoutInputs(appSettings, out var spacing, out var currentWidth))
            {
                reflectionBroken = true;
                return;
            }

            var metrics = GridLayoutService.ResolveViewportMetrics(window, PlayniteApi, settings.ViewportAdjustPx);
            var perTileMargin = GridLayoutService.GetHorizontalMarginPerTile(appSettings, spacing);
            var target = GridLayoutService.ComputeTargetGridItemWidth(
                metrics.Viewport,
                settings.TargetColumns,
                perTileMargin);

            if (target <= 0)
            {
                return;
            }

            var windowSizeChanged =
                double.IsNaN(lastWindowActualWidth) ||
                double.IsNaN(lastWindowActualHeight) ||
                Math.Abs(window.ActualWidth - lastWindowActualWidth) > 0.5 ||
                Math.Abs(window.ActualHeight - lastWindowActualHeight) > 0.5;
            lastWindowActualWidth = window.ActualWidth;
            lastWindowActualHeight = window.ActualHeight;

            if (!windowSizeChanged && Math.Abs(currentWidth - target) < 0.01)
            {
                return;
            }

            if (!GridLayoutService.TrySetGridItemWidth(appSettings, target))
            {
                reflectionBroken = true;
            }
        }

        private void DetachWindowHooks()
        {
            debounceTimer?.Stop();
            if (debounceTimer != null)
            {
                debounceTimer.Tick -= DebounceTimerOnTick;
            }

            debounceTimer = null;

            if (hookedWindow != null && handlersAttached)
            {
                hookedWindow.SizeChanged -= OnWindowLayoutHint;
                hookedWindow.StateChanged -= OnWindowLayoutHint;
                hookedWindow.Closed -= MainWindowOnClosed;
            }

            hookedWindow = null;
            handlersAttached = false;

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
