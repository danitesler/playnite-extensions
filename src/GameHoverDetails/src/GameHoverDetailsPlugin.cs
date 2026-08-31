using System;
using System.Collections.Generic;
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

        internal void NotifyHoverSettingsApplied()
        {
            hoverService?.NotifySettingsChanged();
        }

        private static readonly HashSet<string> HoverRefreshPropertyNames = new HashSet<string>
        {
            nameof(GameHoverDetailsSettings.HoverWidth),
            nameof(GameHoverDetailsSettings.ShowDelayMs),
            nameof(GameHoverDetailsSettings.HoverDisabled),
            nameof(GameHoverDetailsSettings.HoverDisabledInFullscreen),
            nameof(GameHoverDetailsSettings.HideFieldTitlesInHover),
            nameof(GameHoverDetailsSettings.ShowFieldInlineIconsInHover),
            nameof(GameHoverDetailsSettings.HideIconChipBackground),
            nameof(GameHoverDetailsSettings.HideFieldDividers),
            nameof(GameHoverDetailsSettings.HidePanelBorder),
            nameof(GameHoverDetailsSettings.HideEmptyFields),
            nameof(GameHoverDetailsSettings.HoverBodyFontSize),
            nameof(GameHoverDetailsSettings.HoverTitleFontSize),
            nameof(GameHoverDetailsSettings.HoverIconStyle),
            nameof(GameHoverDetailsSettings.HoverIconChipSizeDip),
            nameof(GameHoverDetailsSettings.HoverIconChipPaddingDip),
            nameof(GameHoverDetailsSettings.HoverIconChipShape),
            nameof(GameHoverDetailsSettings.UseThemeChrome),
            nameof(GameHoverDetailsSettings.HoverBackgroundStyle),
            nameof(GameHoverDetailsSettings.UseGameBackground),
            nameof(GameHoverDetailsSettings.HoverChromeBackgroundHex),
            nameof(GameHoverDetailsSettings.HoverChromeBorderHex),
            nameof(GameHoverDetailsSettings.HoverChromeDividerHex),
            nameof(GameHoverDetailsSettings.HoverChromeIconBackgroundHex),
            nameof(GameHoverDetailsSettings.HoverChromeBackgroundOpacity),
            nameof(GameHoverDetailsSettings.HoverFieldBlockSpacingDip),
            nameof(GameHoverDetailsSettings.HoverFieldColumnCount),
            nameof(GameHoverDetailsSettings.HoverContentPaddingDip),
            nameof(GameHoverDetailsSettings.SelectedFieldKeys),
            nameof(GameHoverDetailsSettings.SelectedFieldCount)
        };

        private void SettingsOnPropertyChanged(object sender, System.ComponentModel.PropertyChangedEventArgs e)
        {
            if (settings.SuppressHoverLiveUpdates)
            {
                return;
            }

            if (e.PropertyName != null && HoverRefreshPropertyNames.Contains(e.PropertyName))
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
