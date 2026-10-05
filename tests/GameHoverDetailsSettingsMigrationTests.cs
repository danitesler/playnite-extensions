using System.Collections.Generic;
using GameHoverDetails;
using Newtonsoft.Json;
using Xunit;

namespace PlayniteExtensions.Tests
{
    public class GameHoverDetailsSettingsMigrationTests
    {
        private static readonly List<string> FactoryDefaultKeys = new List<string> { "TimePlayed", "LastPlayed", "Library", "Developer" };

        /// <summary>Same path as the plugin: Playnite deserializes the saved JSON, then the settings migrate it.</summary>
        private static GameHoverDetailsSettings LoadFromJson(string json)
        {
            var saved = JsonConvert.DeserializeObject<GameHoverDetailsPersistedState>(json);
            var settings = new GameHoverDetailsSettings();
            settings.LoadPersistedState(saved);
            return settings;
        }

        [Fact]
        public void LoadPersistedState_NoSavedSettings_KeepsFactoryDefaults()
        {
            var settings = new GameHoverDetailsSettings();

            settings.LoadPersistedState(null);

            Assert.Equal(188, settings.HoverWidth);
            Assert.Equal(30, settings.ShowDelayMs);
            Assert.Equal(10, settings.HoverFieldBlockSpacingDip);
            Assert.Equal(1, settings.HoverFieldColumnCount);
            Assert.Equal(12, settings.HoverContentPaddingDip);
            Assert.Equal(14.0, settings.HoverBodyFontSize);
            Assert.Equal(10.0, settings.HoverTitleFontSize);
            Assert.Equal(19, settings.HoverIconChipSizeDip);
            Assert.Equal(GameHoverDetailsSettings.IconStyleHugeIcons, settings.HoverIconStyle);
            Assert.Equal(GameHoverDetailsSettings.IconChipShapeSoftRounded, settings.HoverIconChipShape);
            Assert.Equal(90, settings.HoverChromeBackgroundOpacity);
            Assert.True(settings.HidePanelBorder);
            Assert.False(settings.UseThemeChrome);
            Assert.True(settings.HoverDisabledInFullscreen);
            Assert.Equal(FactoryDefaultKeys, settings.SelectedFieldKeys);
        }

        [Fact]
        public void LoadPersistedState_OldestShape_MissingFieldsGetLegacyDefaults()
        {
            // First release: no columns, padding, font sizes, icon chip, chrome or fullscreen fields
            var settings = LoadFromJson(@"{
                ""HoverWidth"": 260,
                ""ShowDelayMs"": 100,
                ""HoverDisabled"": false,
                ""HideFieldTitlesInHover"": true,
                ""ShowFieldInlineIconsInHover"": true,
                ""SelectedFieldKeys"": [ ""Genre"", ""Developer"" ]
            }");

            Assert.Equal(260, settings.HoverWidth);
            Assert.Equal(100, settings.ShowDelayMs);
            Assert.False(settings.HoverDisabled);
            Assert.True(settings.HideFieldTitlesInHover);
            Assert.True(settings.ShowFieldInlineIconsInHover);
            Assert.Equal(new List<string> { "Genre", "Developer" }, settings.SelectedFieldKeys);

            // Legacy look is preserved for users who never touched the newer options
            Assert.Equal(11, settings.HoverFieldBlockSpacingDip);
            Assert.Equal(1, settings.HoverFieldColumnCount);
            Assert.Equal(14, settings.HoverContentPaddingDip);
            Assert.Equal(13.0, settings.HoverBodyFontSize);
            Assert.Equal(10.5, settings.HoverTitleFontSize);
            Assert.Equal(32, settings.HoverIconChipSizeDip);
            Assert.Equal(8, settings.HoverIconChipPaddingDip);
            Assert.Equal(GameHoverDetailsSettings.IconStyleUnicons, settings.HoverIconStyle);
            Assert.Equal(GameHoverDetailsSettings.IconChipShapeCircle, settings.HoverIconChipShape);
            Assert.Equal(GameHoverDetailsSettings.BackgroundStyleRegular, settings.HoverBackgroundStyle);
            Assert.True(settings.HoverDisabledInFullscreen);
            Assert.True(settings.HideFieldDividers);
            Assert.False(settings.HidePanelBorder);
            Assert.False(settings.HideEmptyFields);
            Assert.True(settings.UseThemeChrome);
            Assert.Equal(100, settings.HoverChromeBackgroundOpacity);
            Assert.Equal("#FF1C1C1E", settings.HoverChromeBackgroundHex);
            Assert.Equal("#FF48484E", settings.HoverChromeBorderHex);
            Assert.Equal("#FF444444", settings.HoverChromeDividerHex);
            Assert.Equal("#FF121212", settings.HoverChromeIconBackgroundHex);
        }

        [Fact]
        public void LoadPersistedState_ExplicitNulls_BehaveLikeMissingFields()
        {
            var settings = LoadFromJson(@"{
                ""HoverWidth"": 200,
                ""HoverFieldColumnCount"": null,
                ""HoverContentPaddingDip"": null,
                ""HoverDisabledInFullscreen"": null,
                ""HideFieldDividers"": null,
                ""HidePanelBorder"": null,
                ""HideEmptyFields"": null,
                ""HoverBodyFontSize"": null,
                ""HoverTitleFontSize"": null,
                ""HoverIconStyle"": null,
                ""HoverIconChipSizeDip"": null,
                ""HoverIconChipPaddingDip"": null,
                ""HoverIconChipShape"": null,
                ""UseThemeChrome"": null,
                ""HoverBackgroundStyle"": null,
                ""HoverChromeBackgroundHex"": null,
                ""HoverChromeBorderHex"": null,
                ""HoverChromeDividerHex"": null,
                ""HoverChromeIconBackgroundHex"": null,
                ""HoverChromeBackgroundOpacity"": null,
                ""SelectedFieldKeys"": null
            }");

            Assert.Equal(1, settings.HoverFieldColumnCount);
            Assert.Equal(14, settings.HoverContentPaddingDip);
            Assert.True(settings.HoverDisabledInFullscreen);
            Assert.True(settings.HideFieldDividers);
            Assert.False(settings.HidePanelBorder);
            Assert.False(settings.HideEmptyFields);
            Assert.Equal(13.0, settings.HoverBodyFontSize);
            Assert.Equal(10.5, settings.HoverTitleFontSize);
            Assert.Equal(GameHoverDetailsSettings.IconStyleUnicons, settings.HoverIconStyle);
            Assert.Equal(32, settings.HoverIconChipSizeDip);
            Assert.Equal(8, settings.HoverIconChipPaddingDip);
            Assert.Equal(GameHoverDetailsSettings.IconChipShapeCircle, settings.HoverIconChipShape);
            Assert.True(settings.UseThemeChrome);
            Assert.Equal(GameHoverDetailsSettings.BackgroundStyleRegular, settings.HoverBackgroundStyle);
            Assert.Equal("#FF1C1C1E", settings.HoverChromeBackgroundHex);
            Assert.Equal("#FF48484E", settings.HoverChromeBorderHex);
            Assert.Equal("#FF444444", settings.HoverChromeDividerHex);
            Assert.Equal("#FF121212", settings.HoverChromeIconBackgroundHex);
            Assert.Equal(100, settings.HoverChromeBackgroundOpacity);
            Assert.Equal(FactoryDefaultKeys, settings.SelectedFieldKeys);
        }

        [Fact]
        public void LoadPersistedState_UnknownAndUiOnlyFields_AreIgnored()
        {
            // Older builds serialized UI helper properties next to the canonical ones
            var settings = LoadFromJson(@"{
                ""HoverWidth"": 300,
                ""HoverBackgroundStyle"": ""Regular"",
                ""UseGameBackground"": true,
                ""IsGameCoverBackgroundStyle"": true,
                ""ShowBorderColorControls"": true,
                ""SomeRemovedSetting"": 42,
                ""Nested"": { ""Anything"": [ 1, 2, 3 ] }
            }");

            Assert.Equal(300, settings.HoverWidth);
            Assert.Equal(GameHoverDetailsSettings.BackgroundStyleRegular, settings.HoverBackgroundStyle);
            Assert.False(settings.UseGameBackground);
        }

        [Fact]
        public void LoadPersistedState_ZeroSpacingInOldJson_UsesLegacySpacing()
        {
            // HoverFieldBlockSpacingDip is a plain int, so a missing value arrives as 0
            var settings = LoadFromJson(@"{ ""HoverWidth"": 200, ""HoverFieldBlockSpacingDip"": 0 }");

            Assert.Equal(11, settings.HoverFieldBlockSpacingDip);
        }

        [Fact]
        public void LoadPersistedState_ExplicitZeroOpacityAndIconPadding_AreKept()
        {
            var settings = LoadFromJson(@"{
                ""HoverWidth"": 200,
                ""HoverChromeBackgroundOpacity"": 0,
                ""HoverIconChipPaddingDip"": 0
            }");

            Assert.Equal(0, settings.HoverChromeBackgroundOpacity);
            Assert.Equal(0, settings.HoverIconChipPaddingDip);
        }

        [Fact]
        public void LoadPersistedState_OutOfRangeValues_AreClamped()
        {
            var settings = LoadFromJson(@"{
                ""HoverWidth"": 9999,
                ""ShowDelayMs"": -50,
                ""HoverFieldBlockSpacingDip"": 100,
                ""HoverFieldColumnCount"": 7,
                ""HoverContentPaddingDip"": 1,
                ""HoverBodyFontSize"": 99.0,
                ""HoverTitleFontSize"": 2.0,
                ""HoverIconChipSizeDip"": 80,
                ""HoverIconChipPaddingDip"": 40,
                ""HoverChromeBackgroundOpacity"": 150
            }");

            Assert.Equal(500, settings.HoverWidth);
            Assert.Equal(0, settings.ShowDelayMs);
            Assert.Equal(36, settings.HoverFieldBlockSpacingDip);
            Assert.Equal(3, settings.HoverFieldColumnCount);
            Assert.Equal(4, settings.HoverContentPaddingDip);
            Assert.Equal(20.0, settings.HoverBodyFontSize);
            Assert.Equal(8.0, settings.HoverTitleFontSize);
            Assert.Equal(40, settings.HoverIconChipSizeDip);
            Assert.Equal(16, settings.HoverIconChipPaddingDip);
            Assert.Equal(100, settings.HoverChromeBackgroundOpacity);
        }

        [Fact]
        public void LoadPersistedState_SavedSettingsStillPassVerify()
        {
            var settings = LoadFromJson(@"{ ""HoverWidth"": 9999, ""HoverChromeBackgroundOpacity"": -10 }");

            var valid = settings.VerifySettings(out var errors);

            Assert.True(valid);
            Assert.Empty(errors);
        }

        [Theory]
        [InlineData("Phosphor", GameHoverDetailsSettings.IconStylePhosphor)]
        [InlineData("hugeicons", GameHoverDetailsSettings.IconStyleHugeIcons)]
        [InlineData("Huge", GameHoverDetailsSettings.IconStyleHugeIcons)]
        [InlineData("SketchyIcons", GameHoverDetailsSettings.IconStyleSketchy)]
        [InlineData("IconsaxBulk", GameHoverDetailsSettings.IconStyleIconsax)]
        [InlineData("pixelart-icons", GameHoverDetailsSettings.IconStylePixelarticons)]
        [InlineData("HackerNoon", GameHoverDetailsSettings.IconStylePixel)]
        [InlineData("PixelIconLibrary", GameHoverDetailsSettings.IconStylePixel)]
        [InlineData("RemovedIconSet", GameHoverDetailsSettings.IconStyleUnicons)]
        public void LoadPersistedState_LegacyIconStyleNames_AreNormalized(string saved, string expected)
        {
            var settings = LoadFromJson(@"{ ""HoverWidth"": 200, ""HoverIconStyle"": " + JsonConvert.ToString(saved) + " }");

            Assert.Equal(expected, settings.HoverIconStyle);
        }

        [Theory]
        [InlineData("Square", GameHoverDetailsSettings.IconChipShapeRectangle)]
        [InlineData("RoundedRectangle", GameHoverDetailsSettings.IconChipShapeRounded)]
        [InlineData("softrounded", GameHoverDetailsSettings.IconChipShapeSoftRounded)]
        [InlineData("Leaf", GameHoverDetailsSettings.IconChipShapeLeaf)]
        [InlineData("Hexagon", GameHoverDetailsSettings.IconChipShapeCircle)]
        public void LoadPersistedState_LegacyIconChipShapeNames_AreNormalized(string saved, string expected)
        {
            var settings = LoadFromJson(@"{ ""HoverWidth"": 200, ""HoverIconChipShape"": " + JsonConvert.ToString(saved) + " }");

            Assert.Equal(expected, settings.HoverIconChipShape);
        }

        [Theory]
        [InlineData("GameCover", GameHoverDetailsSettings.BackgroundStyleGameCover)]
        [InlineData("GameBackground", GameHoverDetailsSettings.BackgroundStyleGameCover)]
        [InlineData("background", GameHoverDetailsSettings.BackgroundStyleGameCover)]
        [InlineData("Blur", GameHoverDetailsSettings.BackgroundStyleRegular)]
        public void LoadPersistedState_LegacyBackgroundStyleNames_AreNormalized(string saved, string expected)
        {
            var settings = LoadFromJson(@"{ ""HoverWidth"": 200, ""HoverBackgroundStyle"": " + JsonConvert.ToString(saved) + " }");

            Assert.Equal(expected, settings.HoverBackgroundStyle);
        }

        [Fact]
        public void LoadPersistedState_MissingDividerColor_InheritsBorderColor()
        {
            // Divider color was split from the border color later
            var settings = LoadFromJson(@"{ ""HoverWidth"": 200, ""HoverChromeBorderHex"": ""#123456"" }");

            Assert.Equal("#FF123456", settings.HoverChromeBorderHex);
            Assert.Equal("#FF123456", settings.HoverChromeDividerHex);
        }

        [Fact]
        public void LoadPersistedState_HexColors_AreNormalizedToOpaqueArgb()
        {
            var settings = LoadFromJson(@"{
                ""HoverWidth"": 200,
                ""HoverChromeBackgroundHex"": ""#80112233"",
                ""HoverChromeBorderHex"": ""abc"",
                ""HoverChromeDividerHex"": ""#00FF00"",
                ""HoverChromeIconBackgroundHex"": ""not-a-color""
            }");

            Assert.Equal("#FF112233", settings.HoverChromeBackgroundHex);
            Assert.Equal("#FFAABBCC", settings.HoverChromeBorderHex);
            Assert.Equal("#FF00FF00", settings.HoverChromeDividerHex);
            Assert.Equal("#FF121212", settings.HoverChromeIconBackgroundHex);
        }

        [Fact]
        public void LoadPersistedState_FieldKeys_DropUnknownAndDuplicatesKeepingOrder()
        {
            var settings = LoadFromJson(@"{
                ""HoverWidth"": 200,
                ""SelectedFieldKeys"": [ ""Publisher"", ""RemovedField"", ""Genre"", ""Publisher"", """", ""Developer"" ]
            }");

            Assert.Equal(new List<string> { "Publisher", "Genre", "Developer" }, settings.SelectedFieldKeys);
        }

        [Fact]
        public void LoadPersistedState_OnlyUnknownFieldKeys_FallBackToFactoryDefaults()
        {
            var settings = LoadFromJson(@"{ ""HoverWidth"": 200, ""SelectedFieldKeys"": [ ""RemovedField"" ] }");

            Assert.Equal(FactoryDefaultKeys, settings.SelectedFieldKeys);
        }

        [Fact]
        public void LoadPersistedState_CurrentShape_RoundTripsWithoutChanges()
        {
            var original = new GameHoverDetailsPersistedState
            {
                HoverWidth = 240,
                ShowDelayMs = 120,
                HoverFieldBlockSpacingDip = 6,
                HoverFieldColumnCount = 2,
                HoverContentPaddingDip = 20,
                HoverDisabled = true,
                HoverDisabledInFullscreen = false,
                HideFieldTitlesInHover = true,
                ShowFieldInlineIconsInHover = true,
                HideIconChipBackground = true,
                HideFieldDividers = false,
                HidePanelBorder = true,
                HideEmptyFields = true,
                HoverBodyFontSize = 16,
                HoverTitleFontSize = 12,
                HoverIconStyle = GameHoverDetailsSettings.IconStylePhosphor,
                HoverIconChipSizeDip = 24,
                HoverIconChipPaddingDip = 4,
                HoverIconChipShape = GameHoverDetailsSettings.IconChipShapeSquircle,
                UseThemeChrome = false,
                HoverBackgroundStyle = GameHoverDetailsSettings.BackgroundStyleGameCover,
                HoverChromeBackgroundHex = "#FF101010",
                HoverChromeBorderHex = "#FF202020",
                HoverChromeDividerHex = "#FF303030",
                HoverChromeIconBackgroundHex = "#FF404040",
                HoverChromeBackgroundOpacity = 60,
                SelectedFieldKeys = new List<string> { "Name", "ReleaseDate", "InstallSize" }
            };

            var settings = LoadFromJson(JsonConvert.SerializeObject(original));

            Assert.Equal(240, settings.HoverWidth);
            Assert.Equal(120, settings.ShowDelayMs);
            Assert.Equal(6, settings.HoverFieldBlockSpacingDip);
            Assert.Equal(2, settings.HoverFieldColumnCount);
            Assert.Equal(20, settings.HoverContentPaddingDip);
            Assert.True(settings.HoverDisabled);
            Assert.False(settings.HoverDisabledInFullscreen);
            Assert.True(settings.HideFieldTitlesInHover);
            Assert.True(settings.ShowFieldInlineIconsInHover);
            Assert.True(settings.HideIconChipBackground);
            Assert.False(settings.HideFieldDividers);
            Assert.True(settings.HidePanelBorder);
            Assert.True(settings.HideEmptyFields);
            Assert.Equal(16.0, settings.HoverBodyFontSize);
            Assert.Equal(12.0, settings.HoverTitleFontSize);
            Assert.Equal(GameHoverDetailsSettings.IconStylePhosphor, settings.HoverIconStyle);
            Assert.Equal(24, settings.HoverIconChipSizeDip);
            Assert.Equal(4, settings.HoverIconChipPaddingDip);
            Assert.Equal(GameHoverDetailsSettings.IconChipShapeSquircle, settings.HoverIconChipShape);
            Assert.False(settings.UseThemeChrome);
            Assert.Equal(GameHoverDetailsSettings.BackgroundStyleGameCover, settings.HoverBackgroundStyle);
            Assert.Equal("#FF101010", settings.HoverChromeBackgroundHex);
            Assert.Equal("#FF202020", settings.HoverChromeBorderHex);
            Assert.Equal("#FF303030", settings.HoverChromeDividerHex);
            Assert.Equal("#FF404040", settings.HoverChromeIconBackgroundHex);
            Assert.Equal(60, settings.HoverChromeBackgroundOpacity);
            Assert.Equal(new List<string> { "Name", "ReleaseDate", "InstallSize" }, settings.SelectedFieldKeys);
        }
    }
}
