using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using System.Runtime.Serialization;
using System.Threading;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Threading;
using GameHoverDetails;
using Newtonsoft.Json;
using Xunit;

namespace PlayniteExtensions.Tests
{
    public class GameHoverDetailsPresetTests
    {
        [Theory]
        [InlineData("PlayTime", "TimePlayed,LastPlayed,CompletionStatus")]
        [InlineData("Discover", "Genre,ReleaseDate,CommunityScore,Description")]
        [InlineData("Info", "Library,Developer,Genre,ReleaseDate")]
        [InlineData("AtAGlance", "Icon,Genre,CommunityScore,TimePlayed,CompletionStatus")]
        [InlineData("Ratings", "CommunityScore,CriticScore,UserScore")]
        public void PresetsReplaceFieldsInOrderWithoutChangingOtherSettings(string id, string expected)
        {
            var settings = new GameHoverDetailsSettings
            {
                HoverWidth = 300,
                HoverFieldColumnCount = 2,
                ShowGameNameHeader = true,
                UseThemeChrome = true
            };
            var before = Persist(settings);
            var notifications = new List<string>();
            settings.PropertyChanged += (sender, args) => notifications.Add(args.PropertyName);

            Assert.True(settings.ApplyFieldPreset(id));

            Assert.Equal(expected.Split(','), settings.SelectedFieldKeys);
            Assert.Equal(id, HoverFieldPresets.Match(settings.SelectedFieldKeys));
            Assert.InRange(settings.SelectedFieldCount, 1, 5);
            Assert.All(settings.SelectedFieldKeys, key => Assert.True(HoverFieldCatalog.IsKnownKey(key)));
            Assert.Contains(nameof(GameHoverDetailsSettings.SelectedFieldKeys), notifications);
            var after = Persist(settings);
            after.SelectedFieldKeys = before.SelectedFieldKeys;
            Assert.Equal(JsonConvert.SerializeObject(before), JsonConvert.SerializeObject(after));
        }

        [Fact]
        public void EditingMakesPresetCustomAndReapplyingRestoresItsOwnCopy()
        {
            var settings = new GameHoverDetailsSettings();
            settings.ApplyFieldPreset("PlayTime");
            Assert.True(settings.MoveEnabled(0, 2));
            Assert.Null(HoverFieldPresets.Match(settings.SelectedFieldKeys));
            Assert.True(settings.DisableFieldAt(0));
            Assert.True(settings.EnableFieldAt("Description", 0));
            Assert.Null(HoverFieldPresets.Match(settings.SelectedFieldKeys));
            settings.ApplyFieldPreset("PlayTime");
            Assert.Equal(new[] { "TimePlayed", "LastPlayed", "CompletionStatus" }, settings.SelectedFieldKeys);
            Assert.Equal("PlayTime", HoverFieldPresets.Match(settings.SelectedFieldKeys));
            settings.ApplyFieldPreset("Ratings");
            settings.ApplyFieldPreset("PlayTime");
            Assert.Equal(new[] { "TimePlayed", "LastPlayed", "CompletionStatus" }, settings.SelectedFieldKeys);
        }

        [Fact]
        public void PresetFieldsRoundTripUsingExistingPersistenceAndCanBeEditedAgain()
        {
            var settings = new GameHoverDetailsSettings();
            settings.ApplyFieldPreset("AtAGlance");
            var json = JsonConvert.SerializeObject(Persist(settings));
            Assert.DoesNotContain("Preset", json);
            var restored = new GameHoverDetailsSettings();
            restored.LoadPersistedState(JsonConvert.DeserializeObject<GameHoverDetailsPersistedState>(json));
            Assert.Equal(settings.SelectedFieldKeys, restored.SelectedFieldKeys);
            Assert.Equal("AtAGlance", HoverFieldPresets.Match(restored.SelectedFieldKeys));
            restored.DisableFieldAt(0);
            Assert.Null(HoverFieldPresets.Match(restored.SelectedFieldKeys));
        }

        [Fact]
        public void CancelRestoresFieldsFromBeforeTheSession()
        {
            var settings = new GameHoverDetailsSettings();
            // Hostless plugin: the hover service is absent, so the final notification is a no-op.
            typeof(GameHoverDetailsSettings).GetField("plugin", BindingFlags.Instance | BindingFlags.NonPublic)
                .SetValue(settings, FormatterServices.GetUninitializedObject(typeof(GameHoverDetailsPlugin)));
            var original = Persist(settings);
            settings.BeginEdit();
            settings.ApplyFieldPreset("Discover");
            settings.ApplyFieldPreset("Ratings");
            settings.CancelEdit();
            Assert.Equal(original.SelectedFieldKeys, settings.SelectedFieldKeys);
            Assert.False(settings.SuppressHoverLiveUpdates);
            Assert.Null(HoverFieldPresets.Match(settings.SelectedFieldKeys));
        }

        [Theory]
        [InlineData(null)]
        [InlineData("Custom")]
        [InlineData("unknown")]
        public void InvalidPresetDoesNotChangeSettings(string id)
        {
            var settings = new GameHoverDetailsSettings();
            var before = JsonConvert.SerializeObject(Persist(settings));
            Assert.False(settings.ApplyFieldPreset(id));
            Assert.Equal(before, JsonConvert.SerializeObject(Persist(settings)));
        }

        [Theory]
        [InlineData(null)]
        [InlineData("PlayTime")]
        public void SelectorAppliesPresetsWithoutConfirmationAndKeepsCustomOutOfTheMenu(string initialPreset)
        {
            Exception failure = null;
            var thread = new Thread(() =>
            {
                try
                {
                    var settings = new GameHoverDetailsSettings();
                    if (initialPreset != null) settings.ApplyFieldPreset(initialPreset);
                    var original = settings.SelectedFieldKeys.ToArray();
                    // No host/dialog API: choosing a preset still applies without asking a modal question.
                    var view = new GameHoverDetailsSettingsView { DataContext = settings };
                    view.Resources["LOCGameHoverDetails_Settings_PresetCustom"] = "Custom";
                    var combo = (ComboBox)view.FindName("PresetCombo");
                    Assert.False(combo.IsEditable);
                    var customLabel = (TextBlock)view.FindName("CustomPresetLabel");
                    Assert.False(customLabel.IsHitTestVisible);
                    PumpDispatcher();
                    Assert.Equal(initialPreset, combo.SelectedValue);
                    Assert.Equal("Custom", customLabel.Text);
                    Assert.Equal(initialPreset == null ? Visibility.Visible : Visibility.Collapsed, customLabel.Visibility);
                    Assert.Null(view.FindName("ApplyPresetButton"));
                    Assert.Equal(5, combo.Items.Count);
                    Assert.DoesNotContain(combo.Items.Cast<ComboBoxItem>(), item => (string)item.Tag == "Custom");

                    combo.SelectedValue = "Info";
                    Assert.Equal(original, settings.SelectedFieldKeys);
                    PumpDispatcher();
                    Assert.Equal("Info", combo.SelectedValue);
                    Assert.Equal("Info", HoverFieldPresets.Match(settings.SelectedFieldKeys));
                    Assert.Equal(settings.SelectedFieldCount, ((ItemsControl)view.FindName("FieldsList")).Items.Count);

                    settings.MoveEnabled(0, 2);
                    PumpDispatcher();
                    Assert.Null(combo.SelectedItem);
                    Assert.Equal(Visibility.Visible, customLabel.Visibility);
                    settings.DisableFieldAt(0);
                    combo.SelectedValue = "Ratings";
                    PumpDispatcher();
                    Assert.Equal("Ratings", combo.SelectedValue);
                    Assert.Equal(Visibility.Collapsed, customLabel.Visibility);
                    Assert.Equal("Ratings", HoverFieldPresets.Match(settings.SelectedFieldKeys));
                    var ratings = settings.SelectedFieldKeys.ToArray();
                    combo.SelectedValue = "Ratings";
                    PumpDispatcher();
                    Assert.Equal(ratings, settings.SelectedFieldKeys);
                    settings.ApplyFieldPreset("Discover");
                    PumpDispatcher();
                    Assert.Equal("Discover", combo.SelectedValue);
                }
                catch (Exception error) { failure = error; }
            });
            thread.SetApartmentState(ApartmentState.STA);
            thread.Start();
            thread.Join();
            Assert.True(failure == null, failure?.ToString());
        }

        private static void PumpDispatcher()
        {
            Dispatcher.CurrentDispatcher.Invoke(new Action(() => { }), DispatcherPriority.ApplicationIdle);
        }

        private static GameHoverDetailsPersistedState Persist(GameHoverDetailsSettings settings)
        {
            return (GameHoverDetailsPersistedState)typeof(GameHoverDetailsSettings)
                .GetMethod("ToPersistedState", BindingFlags.Instance | BindingFlags.NonPublic).Invoke(settings, null);
        }
    }
}
