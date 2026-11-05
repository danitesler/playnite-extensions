using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using System.Runtime.Serialization;
using System.Threading;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Documents;
using System.Windows.Media;
using System.Windows.Threading;
using GameHoverDetails;
using Newtonsoft.Json;
using Playnite.SDK.Models;
using Xunit;

namespace PlayniteExtensions.Tests
{
    public class GameHoverDetailsFallbackTests
    {
        private static GameHoverDetailsSettings Settings(params string[] keys) => new GameHoverDetailsSettings
        {
            SelectedFieldKeys = keys.ToList(), ShowFieldInlineIconsInHover = false, UseFallbackFields = true
        };

        private static HoverFieldListSource Source(params string[] pairs)
        {
            var values = new Dictionary<string, string>();
            for (var i = 0; i < pairs.Length; i += 2) values[pairs[i]] = pairs[i + 1];
            return new HoverFieldListSource { FormatValue = key => values.TryGetValue(key, out var value) ? value : HoverLoc.Empty };
        }

        private static IReadOnlyList<string> Resolve(GameHoverDetailsSettings settings, HoverFieldListSource source)
            => HoverFieldResolver.Resolve(settings, settings.SelectedFieldKeys, ref source);

        [Theory]
        [InlineData("90", "84", "75", "CriticScore")]
        [InlineData(null, "84", "75", "CommunityScore")]
        [InlineData(null, null, "75", "UserScore")]
        [InlineData(null, null, null, "CriticScore")]
        public void ScoresPreferPrimaryThenStandardFallbacks(string critic, string community, string user, string expected)
        {
            Assert.Equal(new[] { expected }, Resolve(Settings("CriticScore"), Source("CriticScore", critic, "CommunityScore", community, "UserScore", user)));
        }

        [Theory]
        [InlineData("CommunityScore", "CriticScore")]
        [InlineData("UserScore", "CommunityScore")]
        [InlineData("LastPlayed", "DateAdded")]
        [InlineData("RecentActivity", "DateAdded")]
        [InlineData("Developer", "Publisher")]
        [InlineData("Source", "Library")]
        public void StandardMappingsWorkWithoutFieldConfiguration(string primary, string fallback)
        {
            Assert.Equal(new[] { fallback }, Resolve(Settings(primary), Source(fallback, "value")));
            Assert.Equal(new[] { primary }, Resolve(Settings(primary), Source(primary, "primary value", fallback, "value")));
        }

        [Theory]
        [InlineData("CriticScore", "CommunityScore")]
        [InlineData("CommunityScore", "CriticScore")]
        public void PopulatedPrimaryWinsOverFallbackRegardlessOfPosition(string first, string second)
        {
            Assert.Equal(new[] { first == "CriticScore" ? "UserScore" : first, second == "CriticScore" ? "UserScore" : second },
                Resolve(Settings(first, second), Source("CommunityScore", "84", "UserScore", "75")));
        }

        [Fact]
        public void TwoSlotsCannotConsumeTheSameFallbackAndResolutionDoesNotRecurse()
        {
            Assert.Equal(new[] { "DateAdded", "RecentActivity" },
                Resolve(Settings("LastPlayed", "RecentActivity"), Source("DateAdded", "Yesterday")));
            Assert.Equal(new[] { "UserScore", "CommunityScore" },
                Resolve(Settings("CriticScore", "CommunityScore"), Source("UserScore", "70")));
        }

        [Theory]
        [InlineData(true, 0)]
        [InlineData(false, 1)]
        public void ExhaustedFallbacksRespectGlobalHiding(bool hideEmpty, int count) => OnSta(() =>
        {
            var settings = Settings("CriticScore");
            settings.HideEmptyFields = hideEmpty;
            var host = new StackPanel();
            HoverFieldListBuilder.Fill(host, settings, HoverChromePalette.Resolve(settings), settings.SelectedFieldKeys, 160, Source());
            Assert.Equal(count, Texts(host).Count(text => text == HoverFieldCatalog.GetDisplayName("CriticScore")));
        });

        [Theory]
        [InlineData(1)]
        [InlineData(2)]
        [InlineData(3)]
        public void ReplacementUsesItsOwnLabelValueAndGlyphBeforeColumnLayout(int columns) => OnSta(() =>
        {
            var settings = Settings("CriticScore", "Library");
            settings.HoverFieldColumnCount = columns;
            settings.ShowFieldInlineIconsInHover = true;
            var source = Source("CommunityScore", "84", "Library", "Steam");
            // Preview sample text must not mask missing real game data.
            source.FormatRawValue = source.FormatValue;
            var actual = source.FormatValue;
            source.FormatValue = key => key == "CriticScore" ? "Sample critic score" : actual(key);
            var host = new StackPanel();
            HoverFieldListBuilder.Fill(host, settings, HoverChromePalette.Resolve(settings), settings.SelectedFieldKeys, 300, source);
            host.Measure(new Size(300, double.PositiveInfinity));
            host.Arrange(new Rect(0, 0, 300, host.DesiredSize.Height));
            var text = Texts(host);
            Assert.Contains(HoverFieldCatalog.GetDisplayName("CommunityScore"), text);
            Assert.Contains("84", text);
            Assert.DoesNotContain(HoverFieldCatalog.GetDisplayName("CriticScore"), text);
            Assert.DoesNotContain("Sample critic score", text);
            Assert.Contains(HoverFieldCatalog.GetGlyph("CommunityScore", settings.HoverIconStyle), text);
            Assert.DoesNotContain(HoverFieldCatalog.GetGlyph("CriticScore", settings.HoverIconStyle), text);
            Assert.Equal(new[] { "CriticScore", "Library" }, settings.SelectedFieldKeys);
        });

        [Theory]
        [InlineData(0, false, true)]
        [InlineData(1, false, false)]
        [InlineData(0, true, false)]
        public void UnplayedMessageRequiresNoPlaytimeAndNoLastPlayedDate(int playtime, bool hasLastPlayed, bool expected)
        {
            var settings = Settings("TimePlayed");
            var source = HoverFieldListSource.ForLiveGame(new Game
            {
                Playtime = (ulong)playtime, LastActivity = hasLastPlayed ? DateTime.Now.AddDays(-1) : (DateTime?)null
            }, null);
            Assert.Equal(expected, source.IsUnplayed);
            HoverFieldResolver.Resolve(settings, settings.SelectedFieldKeys, ref source);
            Assert.Equal(expected, source.FormatValue("TimePlayed") == "Not played yet");
        }

        [Fact]
        public void UnplayedMessageRemainsVisibleInFallbackMode() => OnSta(() =>
        {
            var settings = Settings("TimePlayed", "LastPlayed");
            settings.EmptyFieldBehavior = GameHoverDetailsSettings.EmptyFieldsFallback;
            var host = new StackPanel();
            var source = Source("DateAdded", "Yesterday");
            source.IsUnplayed = true;
            HoverFieldListBuilder.Fill(host, settings, HoverChromePalette.Resolve(settings), settings.SelectedFieldKeys, 300, source);
            Assert.Contains("Not played yet", Texts(host));
            Assert.Contains(HoverFieldCatalog.GetDisplayName("DateAdded"), Texts(host));
        });

        [Fact]
        public void FallbacksAreOffByDefaultAndIgnorePreviousPerFieldConfiguration()
        {
            var settings = new GameHoverDetailsSettings();
            Assert.False(settings.UseFallbackFields);
            settings.LoadPersistedState(JsonConvert.DeserializeObject<GameHoverDetailsPersistedState>(
                "{\"SelectedFieldKeys\":[\"CriticScore\"],\"FieldRules\":{\"CriticScore\":{\"Mode\":\"Replace\",\"FallbackKeys\":[\"CommunityScore\"]}}}"));
            Assert.False(settings.UseFallbackFields);
            Assert.Equal(new[] { "CriticScore" }, Resolve(settings, Source("CommunityScore", "84")));
            var source = Source();
            source.IsUnplayed = true;
            settings.SelectedFieldKeys = new List<string> { "TimePlayed" };
            HoverFieldResolver.Resolve(settings, settings.SelectedFieldKeys, ref source);
            Assert.Equal(HoverLoc.Empty, source.FormatValue("TimePlayed"));
            settings.UseFallbackFields = true;
            HoverFieldResolver.Resolve(settings, settings.SelectedFieldKeys, ref source);
            Assert.Equal("Not played yet", source.FormatValue("TimePlayed"));
        }

        [Theory]
        [InlineData(true)]
        [InlineData(false)]
        public void ToggleRoundTripsAndCancelRestoresItsOriginalValue(bool enabled)
        {
            var settings = Settings("CriticScore", "Library");
            settings.UseFallbackFields = enabled;
            var state = Persist(settings);
            var restored = new GameHoverDetailsSettings();
            restored.LoadPersistedState(JsonConvert.DeserializeObject<GameHoverDetailsPersistedState>(JsonConvert.SerializeObject(state)));
            Assert.Equal(enabled, restored.UseFallbackFields);
            Assert.DoesNotContain("FieldRules", JsonConvert.SerializeObject(state));
            Assert.DoesNotContain("FallbackFieldsTooltip", JsonConvert.SerializeObject(state));
            typeof(GameHoverDetailsSettings).GetField("plugin", BindingFlags.Instance | BindingFlags.NonPublic)
                .SetValue(settings, FormatterServices.GetUninitializedObject(typeof(GameHoverDetailsPlugin)));
            settings.BeginEdit();
            settings.UseFallbackFields = !enabled;
            settings.ApplyFieldPreset("Ratings");
            settings.MoveEnabled(0, 2);
            settings.DisableFieldAt(0);
            Assert.Equal(!enabled, settings.UseFallbackFields);
            settings.CancelEdit();
            Assert.Equal(enabled, settings.UseFallbackFields);
            Assert.Equal(new[] { "CriticScore", "Library" }, settings.SelectedFieldKeys);
        }

        [Fact]
        public void DisplayDropdownCombinesBothCheckboxesAndDescribesFallbacksOnHover() => OnSta(() =>
        {
            var settings = Settings("TimePlayed", "LastPlayed", "CriticScore");
            settings.UseFallbackFields = false;
            var view = new GameHoverDetailsSettingsView { DataContext = settings };
            Layout(view);
            var list = (ItemsControl)view.FindName("FieldsList");
            Assert.Empty(Descendants(list).OfType<ComboBox>());
            var tabs = Descendants(view).OfType<TabControl>().Single();
            tabs.SelectedIndex = 1;
            Layout(view);
            Assert.Null(view.FindName("UseFallbackFieldsCheckBox"));
            var combo = (ComboBox)view.FindName("EmptyFieldBehaviorCombo");
            Assert.Equal(GameHoverDetailsSettings.EmptyFieldsDoNothing, combo.SelectedValue);
            Assert.Equal(new[] { "DoNothing", "Hide", "Fallback" }, combo.Items.Cast<ComboBoxItem>().Select(item => (string)item.Tag));
            Assert.Equal(3, combo.Items.Count);
            combo.SelectedValue = GameHoverDetailsSettings.EmptyFieldsHide;
            Pump();
            Assert.True(settings.HideEmptyFields);
            Assert.False(settings.UseFallbackFields);
            combo.SelectedValue = GameHoverDetailsSettings.EmptyFieldsFallback;
            Pump();
            Assert.True(settings.UseFallbackFields);
            Assert.False(settings.HideEmptyFields);
            combo.SelectedValue = GameHoverDetailsSettings.EmptyFieldsDoNothing;
            Pump();
            Assert.False(settings.HideEmptyFields);
            Assert.False(settings.UseFallbackFields);
            foreach (var owner in new FrameworkElement[] { combo, (ComboBoxItem)view.FindName("FallbackFieldsOption") })
            {
                var tooltip = Assert.IsType<ToolTip>(owner.ToolTip);
                tooltip.PlacementTarget = owner;
                Pump();
                Assert.Equal(settings.FallbackFieldsTooltip, ((TextBlock)tooltip.Content).Text);
            }
            Assert.DoesNotContain(Descendants((DependencyObject)tabs.SelectedContent).OfType<CheckBox>(),
                checkbox => checkbox.GetBindingExpression(System.Windows.Controls.Primitives.ToggleButton.IsCheckedProperty)?.ParentBinding.Path.Path == "HideEmptyFields");
            Assert.Contains("Critic Score → Community Score → User Score", settings.FallbackFieldsTooltip);
            Assert.Contains("Last Played → Date Added", settings.FallbackFieldsTooltip);
            Assert.Contains("Developer → Publisher", settings.FallbackFieldsTooltip);
            Assert.Contains("Source → Library", settings.FallbackFieldsTooltip);
            Assert.Contains("Time Played → Not played yet", settings.FallbackFieldsTooltip);
            Assert.Contains("the field stays unchanged", settings.FallbackFieldsTooltip);
            Assert.True(combo.Focusable && combo.IsTabStop);
            Assert.True(combo.ActualWidth > 0);
        });

        [Theory]
        [InlineData(false, false, "DoNothing")]
        [InlineData(true, false, "Hide")]
        [InlineData(false, true, "Fallback")]
        [InlineData(true, true, "Fallback")]
        public void ExistingCheckboxSettingsMigrateToOneExclusiveChoice(bool hide, bool fallback, string expected)
        {
            var settings = new GameHoverDetailsSettings();
            settings.LoadPersistedState(new GameHoverDetailsPersistedState { HideEmptyFields = hide, UseFallbackFields = fallback });
            Assert.Equal(expected, settings.EmptyFieldBehavior);
            Assert.False(settings.HideEmptyFields && settings.UseFallbackFields);
            var state = Persist(settings);
            var restored = new GameHoverDetailsSettings();
            restored.LoadPersistedState(state);
            Assert.Equal(expected, restored.EmptyFieldBehavior);
        }

        [Theory]
        [InlineData("DoNothing")]
        [InlineData("Hide")]
        [InlineData("Fallback")]
        public void ExclusiveModesApplyDifferentBehaviorToTheSameSparseGame(string mode) => OnSta(() =>
        {
            var settings = Settings("CriticScore");
            settings.EmptyFieldBehavior = mode;
            var host = new StackPanel();
            HoverFieldListBuilder.Fill(host, settings, HoverChromePalette.Resolve(settings), settings.SelectedFieldKeys, 160,
                Source("CommunityScore", "84"));
            var text = Texts(host);
            if (mode == "Hide") Assert.Empty(text);
            else if (mode == "Fallback")
            {
                Assert.Contains("84", text);
                Assert.Contains(HoverFieldCatalog.GetDisplayName("CommunityScore"), text);
            }
            else
            {
                Assert.Contains(HoverLoc.Empty, text);
                Assert.Contains(HoverFieldCatalog.GetDisplayName("CriticScore"), text);
            }
        });

        private static void Layout(FrameworkElement view)
        {
            view.Measure(new Size(760, 520));
            view.Arrange(new Rect(0, 0, 760, 520));
            view.UpdateLayout();
            Pump();
        }

        [Fact]
        public void EmptyFieldModesDoNotChangeSidePreviewEvenAfterOtherSettingsRefreshIt() => OnSta(() =>
        {
            var settings = Settings("CriticScore", "TimePlayed", "LastPlayed");
            settings.EmptyFieldBehavior = GameHoverDetailsSettings.EmptyFieldsDoNothing;
            var view = new GameHoverDetailsSettingsView { DataContext = settings };
            var game = new Game { CommunityScore = 84, Added = DateTime.Now.AddDays(-1) };
            typeof(GameHoverDetailsSettingsView).GetField("previewSampleGame", BindingFlags.Instance | BindingFlags.NonPublic)
                .SetValue(view, game);
            var refresh = typeof(GameHoverDetailsSettingsView).GetMethod("RefreshPreviewFields", BindingFlags.Instance | BindingFlags.NonPublic);
            refresh.Invoke(view, null);
            Layout(view);
            var preview = (StackPanel)view.FindName("PreviewFieldsHost");
            var baseline = Texts(preview);
            Assert.Contains(HoverFieldCatalog.GetDisplayName("CriticScore"), baseline);
            foreach (var mode in new[] { "Hide", "Fallback", "DoNothing", "Fallback" })
            {
                var originalChildren = preview.Children.Cast<UIElement>().ToArray();
                settings.EmptyFieldBehavior = mode;
                Pump();
                Assert.Equal(originalChildren, preview.Children.Cast<UIElement>());
                Assert.Equal(baseline, Texts(preview));
                settings.HoverWidth++;
                Pump();
                Assert.Equal(baseline, Texts(preview));

                var reopened = new GameHoverDetailsSettingsView { DataContext = settings };
                typeof(GameHoverDetailsSettingsView).GetField("previewSampleGame", BindingFlags.Instance | BindingFlags.NonPublic)
                    .SetValue(reopened, game);
                refresh.Invoke(reopened, null);
                Layout(reopened);
                Assert.Equal(baseline, Texts((StackPanel)reopened.FindName("PreviewFieldsHost")));
            }
            var live = HoverFieldListSource.ForLiveGame(game, null);
            Assert.Equal(new[] { "CommunityScore", "TimePlayed", "DateAdded" }, Resolve(settings, live));
        });

        [Fact]
        public void HideModeUsesActualPreviewAvailabilityInsteadOfSampleText() => OnSta(() =>
        {
            var settings = Settings("CriticScore", "Developer");
            settings.EmptyFieldBehavior = GameHoverDetailsSettings.EmptyFieldsHide;
            var source = Source("Developer", "Real Studio");
            source.FormatRawValue = source.FormatValue;
            source.FormatValue = key => "Sample " + key;
            var host = new StackPanel();
            HoverFieldListBuilder.Fill(host, settings, HoverChromePalette.Resolve(settings), settings.SelectedFieldKeys, 160, source);
            Assert.DoesNotContain(HoverFieldCatalog.GetDisplayName("CriticScore"), Texts(host));
            Assert.Contains("Real Studio", Texts(host));
            Assert.DoesNotContain(Texts(host), text => text.StartsWith("Sample "));
        });

        private static GameHoverDetailsPersistedState Persist(GameHoverDetailsSettings settings) =>
            (GameHoverDetailsPersistedState)typeof(GameHoverDetailsSettings).GetMethod("ToPersistedState", BindingFlags.Instance | BindingFlags.NonPublic)
                .Invoke(settings, null);

        private static string[] Texts(DependencyObject parent) => Descendants(parent).OfType<TextBlock>()
            .Select(text => new TextRange(text.ContentStart, text.ContentEnd).Text).ToArray();

        private static IEnumerable<DependencyObject> Descendants(DependencyObject parent)
        {
            for (var i = 0; i < VisualTreeHelper.GetChildrenCount(parent); i++)
            {
                var child = VisualTreeHelper.GetChild(parent, i);
                yield return child;
                foreach (var descendant in Descendants(child)) yield return descendant;
            }
        }

        private static void Pump() => Dispatcher.CurrentDispatcher.Invoke(new Action(() => { }), DispatcherPriority.ApplicationIdle);

        private static void OnSta(Action action)
        {
            Exception failure = null;
            var thread = new Thread(() => { try { action(); } catch (Exception error) { failure = error; } });
            thread.SetApartmentState(ApartmentState.STA);
            thread.Start();
            thread.Join();
            Assert.True(failure == null, failure?.ToString());
        }
    }
}
