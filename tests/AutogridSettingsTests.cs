using System;
using System.Reflection;
using System.Runtime.Serialization;
using System.Threading;
using System.Windows;
using Autogrid;
using Xunit;

namespace PlayniteExtensions.Tests
{
    public class AutogridSettingsTests
    {
        [Fact]
        public void CancelTemporaryEnable_RestoresTheLiveLayoutSnapshot()
        {
            RunSta(() =>
            {
                var settings = new AutogridSettings { Enabled = false };
                var appSettings = new AppSettings { GridItemWidth = 240, GridItemSpacing = 12 };
                var plugin = CreatePlugin(settings, appSettings);

                settings.BeginEdit();
                settings.Enabled = true;
                Invoke(plugin, "CaptureUserLayoutIfNeeded", 240d, 12);
                appSettings.GridItemWidth = 125;
                appSettings.GridItemSpacing = 8;

                settings.CancelEdit();
                // The plugin's queued disabled apply runs after CancelEdit returns.
                Invoke(plugin, "RestoreUserCoverSize");

                Assert.False(settings.Enabled);
                Assert.Equal(240d, appSettings.GridItemWidth);
                Assert.Equal(12, appSettings.GridItemSpacing);
                Assert.False(settings.HasSavedUserLayout);
                Assert.Equal(1, appSettings.SaveCount);
            });
        }

        [Fact]
        public void CancelTemporaryDisable_DoesNotResurrectAnAlreadyRestoredSnapshot()
        {
            RunSta(() =>
            {
                var settings = new AutogridSettings { Enabled = true };
                var appSettings = new AppSettings { GridItemWidth = 125, GridItemSpacing = 8 };
                var plugin = CreatePlugin(settings, appSettings);
                Invoke(plugin, "CaptureUserLayoutIfNeeded", 240d, 12);

                settings.BeginEdit();
                settings.Enabled = false;
                Invoke(plugin, "RestoreUserCoverSize");
                appSettings.GridItemWidth = 300;
                settings.CancelEdit();

                Assert.True(settings.Enabled);
                Assert.False(settings.HasSavedUserLayout);
                // Re-enabling captures the current user layout, rather than the discarded one.
                Invoke(plugin, "CaptureUserLayoutIfNeeded", appSettings.GridItemWidth, appSettings.GridItemSpacing);
                appSettings.GridItemWidth = 125;
                settings.Enabled = false;
                Invoke(plugin, "RestoreUserCoverSize");
                Assert.Equal(300d, appSettings.GridItemWidth);
            });
        }

        [Fact]
        public void RestoreUserCoverSize_ClearsWrapPanelTileCache()
        {
            RunSta(() =>
            {
                var settings = new AutogridSettings { Enabled = false, HasSavedUserLayout = true };
                settings.SavedUserGridItemWidth = 240;
                settings.SavedUserGridItemSpacing = 12;
                var appSettings = new AppSettings { GridItemWidth = 180, GridItemSpacing = 8 };
                var plugin = CreatePlugin(settings, appSettings);

                Invoke(plugin, "RestoreUserCoverSize");

                Assert.Equal(240d, appSettings.GridItemWidth);
                Assert.Equal(1, typeof(AutogridPlugin).GetField("tileCacheResetCalls", BindingFlags.Instance | BindingFlags.NonPublic).GetValue(plugin));
            });
        }

        [Fact]
        public void FirstLayoutCapture_PersistsTheSnapshotBeforePlayniteCanSaveTheNewWidth()
        {
            RunSta(() =>
            {
                var settings = new AutogridSettings();
                var plugin = CreatePlugin(settings, new AppSettings());
                Invoke(plugin, "CaptureUserLayoutIfNeeded", 240d, 12);
                Assert.True(settings.HasSavedUserLayout);
                Assert.Equal(240d, settings.SavedUserGridItemWidth);
                Assert.Equal(1, settings.UserLayoutPersistCount);

                Invoke(plugin, "CaptureUserLayoutIfNeeded", 80d, 4);
                Assert.Equal(240d, settings.SavedUserGridItemWidth);
                Assert.Equal(1, settings.UserLayoutPersistCount);
            });
        }

        [Theory]
        [InlineData(true, true, true)]
        [InlineData(true, false, false)]
        [InlineData(false, true, false)]
        [InlineData(false, false, false)]
        public void DetailsPanel_PausesResizingOnlyWhenOpenAndEnabled(bool pauseSetting, bool panelOpen, bool expectPaused)
        {
            RunSta(() =>
            {
                var settings = new AutogridSettings { KeepGridWhileDetailsOpen = pauseSetting };
                var appSettings = new AppSettings { GridViewSideBarVisible = panelOpen };
                var plugin = CreatePlugin(settings, appSettings);

                Assert.Equal(expectPaused, InvokeBool(plugin, "IsPausedForDetailsPanel", appSettings));
            });
        }

        [Fact]
        public void DetailsPanel_MissingPlayniteFlag_KeepsResizing()
        {
            RunSta(() =>
            {
                var settings = new AutogridSettings { KeepGridWhileDetailsOpen = true };
                var plugin = CreatePlugin(settings, new AppSettings());

                Assert.False(InvokeBool(plugin, "IsPausedForDetailsPanel", new object()));
            });
        }

        [Fact]
        public void KeepGridWhileDetailsOpen_DefaultsOnForSettingsSavedBeforeIt()
        {
            var legacy = Newtonsoft.Json.JsonConvert.DeserializeObject<AutogridSettings>(
                "{\"Enabled\":true,\"SizingMode\":0,\"TargetColumns\":6}");

            Assert.True(legacy.KeepGridWhileDetailsOpen);
        }

        [Fact]
        public void CancelEdit_RestoresKeepGridWhileDetailsOpen()
        {
            var settings = new AutogridSettings { KeepGridWhileDetailsOpen = true };
            settings.BeginEdit();
            settings.KeepGridWhileDetailsOpen = false;
            settings.CancelEdit();

            Assert.True(settings.KeepGridWhileDetailsOpen);
        }

        [Fact]
        public void LayoutPass_WithUnchangedGridSize_DoesNotRestartTheDebounce()
        {
            // A theme or panel re-laying out every frame (240 passes/s seen after using a filter)
            // restarted the 50ms timer forever, so Autogrid never applied.
            RunSta(() =>
            {
                var h = CreateLayoutHarness(); var plugin = h.Plugin; var timer = h.Timer; var scroll = h.Scroll;
                Lay(scroll, 800);

                Invoke(plugin, "OnWindowLayoutHint", null, EventArgs.Empty);
                timer.Stop();
                Invoke(plugin, "OnWindowLayoutHint", null, EventArgs.Empty);

                Assert.False(timer.IsEnabled);
            });
        }

        [Fact]
        public void LayoutPass_WithChangedGridSize_RequestsApply()
        {
            RunSta(() =>
            {
                var h = CreateLayoutHarness(); var plugin = h.Plugin; var timer = h.Timer; var scroll = h.Scroll;
                Lay(scroll, 800);
                Invoke(plugin, "OnWindowLayoutHint", null, EventArgs.Empty);
                timer.Stop();

                Lay(scroll, 580); // the filter panel took 220px

                Invoke(plugin, "OnWindowLayoutHint", null, EventArgs.Empty);
                Assert.True(timer.IsEnabled);
                timer.Stop();
            });
        }

        [Fact]
        public void LayoutPass_BeforeGridIsKnown_StillRequestsApply()
        {
            RunSta(() =>
            {
                var h = CreateLayoutHarness(); var plugin = h.Plugin; var timer = h.Timer;
                SetField(plugin, "trackedScrollViewer", null);

                Invoke(plugin, "OnWindowLayoutHint", null, EventArgs.Empty);

                Assert.True(timer.IsEnabled);
                timer.Stop();
            });
        }

        private static LayoutHarness CreateLayoutHarness()
        {
            var plugin = CreatePlugin(new AutogridSettings(), new AppSettings());
            var timer = new System.Windows.Threading.DispatcherTimer { Interval = TimeSpan.FromHours(1) };
            var scroll = new System.Windows.Controls.ScrollViewer();
            SetField(plugin, "debounceTimer", timer);
            SetField(plugin, "startupApplyComplete", true);
            SetField(plugin, "trackedScrollViewer", scroll);
            return new LayoutHarness { Plugin = plugin, Timer = timer, Scroll = scroll };
        }

        private sealed class LayoutHarness
        {
            public AutogridPlugin Plugin;
            public System.Windows.Threading.DispatcherTimer Timer;
            public System.Windows.Controls.ScrollViewer Scroll;
        }

        private static void SetField(AutogridPlugin plugin, string name, object value)
        {
            typeof(AutogridPlugin).GetField(name, BindingFlags.Instance | BindingFlags.NonPublic)?.SetValue(plugin, value);
        }

        private static void Lay(FrameworkElement element, double width)
        {
            element.Measure(new Size(width, 600));
            element.Arrange(new Rect(0, 0, width, 600));
        }

        private static bool InvokeBool(AutogridPlugin plugin, string method, params object[] args)
        {
            return (bool)typeof(AutogridPlugin).GetMethod(method, BindingFlags.Instance | BindingFlags.NonPublic)
                .Invoke(plugin, args);
        }

        private static AutogridPlugin CreatePlugin(AutogridSettings settings, AppSettings appSettings)
        {
            // Bypass SDK initialization so this harness cannot load or save real Playnite settings.
            var plugin = (AutogridPlugin)FormatterServices.GetUninitializedObject(typeof(AutogridPlugin));
            typeof(AutogridPlugin).GetField("settings", BindingFlags.Instance | BindingFlags.NonPublic)
                .SetValue(plugin, settings);
            typeof(AutogridPlugin).GetField("hookedWindow", BindingFlags.Instance | BindingFlags.NonPublic)
                .SetValue(plugin, new Window { DataContext = new ViewModel { AppSettings = appSettings } });
            return plugin;
        }

        private static void Invoke(AutogridPlugin plugin, string method, params object[] args)
        {
            typeof(AutogridPlugin).GetMethod(method, BindingFlags.Instance | BindingFlags.NonPublic)
                .Invoke(plugin, args);
        }

        private static void RunSta(Action action)
        {
            Exception failure = null;
            var thread = new Thread(() =>
            {
                try { action(); }
                catch (Exception ex) { failure = ex; }
            });
            thread.SetApartmentState(ApartmentState.STA);
            thread.Start();
            thread.Join();
            Assert.True(failure == null, failure?.ToString());
        }

        public sealed class ViewModel
        {
            public AppSettings AppSettings { get; set; }
        }

        public sealed class AppSettings
        {
            public double GridItemWidth { get; set; }
            public int GridItemSpacing { get; set; }
            public bool GridViewSideBarVisible { get; set; }
            public int SaveCount { get; private set; }
            public void SaveSettings() => SaveCount++;
        }
    }
}
