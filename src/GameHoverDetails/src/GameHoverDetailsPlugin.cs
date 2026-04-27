using System;
using System.Windows;
using System.Windows.Threading;
using Playnite.SDK;
using Playnite.SDK.Events;
using Playnite.SDK.Plugins;

namespace GameHoverDetails
{
    public class GameHoverDetailsPlugin : GenericPlugin
    {
        private static readonly Guid PluginId = Guid.Parse("872BFD9A-CDF5-403A-9A02-2AA2F9BBF4CC");

        private readonly GameHoverDetailsSettings settings;
        private GameHoverDetailsHoverService hoverService;
        private bool handlersAttached;

        public override Guid Id => PluginId;

        /// <summary>Used by settings preview to read library games (same assembly).</summary>
        internal IPlayniteAPI GetPlayniteApi() => PlayniteApi;

        public GameHoverDetailsPlugin(IPlayniteAPI api) : base(api)
        {
            settings = new GameHoverDetailsSettings(this);
            settings.PropertyChanged += SettingsOnPropertyChanged;
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
            return new GameHoverDetailsSettingsView();
        }

        private void SettingsOnPropertyChanged(object sender, System.ComponentModel.PropertyChangedEventArgs e)
        {
            if (e.PropertyName == nameof(GameHoverDetailsSettings.HoverWidth) ||
                e.PropertyName == nameof(GameHoverDetailsSettings.ShowDelayMs) ||
                e.PropertyName == nameof(GameHoverDetailsSettings.HoverDisabled) ||
                e.PropertyName == nameof(GameHoverDetailsSettings.HoverDetailsEnabled) ||
                e.PropertyName == nameof(GameHoverDetailsSettings.HideFieldTitlesInHover) ||
                e.PropertyName == nameof(GameHoverDetailsSettings.HoverTitlesInHover) ||
                e.PropertyName == nameof(GameHoverDetailsSettings.ShowFieldInlineIconsInHover) ||
                e.PropertyName == nameof(GameHoverDetailsSettings.HoverFieldBlockSpacingDip) ||
                e.PropertyName == nameof(GameHoverDetailsSettings.SelectedFieldKeys) ||
                e.PropertyName == nameof(GameHoverDetailsSettings.DisabledFieldKeysOrder) ||
                e.PropertyName == nameof(GameHoverDetailsSettings.SelectedFieldCount))
            {
                hoverService?.NotifySettingsChanged();
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
            settings.PropertyChanged -= SettingsOnPropertyChanged;
            DetachWindowHooks();
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
                LogManager.GetLogger().Error(ex, "GameHoverDetails failed to schedule main window hook.");
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
                LogManager.GetLogger().Error(ex, "GameHoverDetails failed on application activated.");
            }
        }

        private void TryHookMainWindow(Window window)
        {
            if (window == null || handlersAttached)
            {
                return;
            }

            hoverService = new GameHoverDetailsHoverService(window, PlayniteApi, settings);
            hoverService.Attach();
            handlersAttached = true;
        }

        private void DetachWindowHooks()
        {
            if (hoverService != null)
            {
                hoverService.Detach();
                hoverService = null;
            }

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
