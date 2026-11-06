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
