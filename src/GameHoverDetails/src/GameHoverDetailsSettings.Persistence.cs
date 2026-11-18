using System.Collections.Generic;
using System.Linq;
using System.Windows;
using System.Windows.Media;
using Playnite.SDK;
using Playnite.SDK.Data;


namespace GameHoverDetails
{
    public partial class GameHoverDetailsSettings
    {
        /// <summary>
        /// Applies saved JSON (including legacy shapes with missing / null fields) to the backing fields.
        /// Null keeps the factory defaults. Split from the constructor so it can be tested without a plugin.
        /// </summary>
        internal void LoadPersistedState(GameHoverDetailsPersistedState saved) =>
            ApplyPersistedState(saved, notify: false);

        public void BeginEdit()
        {
            SuppressHoverLiveUpdates = true;
            editSnapshot = ToPersistedState();
        }

        public void CancelEdit()
        {
            SuppressSettingsViewRebuilds = true;
            try
            {
                ApplyPersistedState(editSnapshot, notify: true);
            }
            finally
            {
                SuppressSettingsViewRebuilds = false;
                SuppressHoverLiveUpdates = false;
            }

            plugin.NotifyHoverSettingsApplied();
        }

        public void EndEdit()
        {
            // Persist only. Do not re-assign live properties here — that rebuilt the
            // settings preview (library art scans) on the UI thread and froze Save.
            plugin.SavePluginSettings(ToPersistedState());
            SuppressHoverLiveUpdates = false;
            // Idle so the settings dialog can close before any hover rebuild.
            plugin.NotifyHoverSettingsApplied();
        }

        private void ApplyPersistedState(GameHoverDetailsPersistedState saved, bool notify)
        {
            if (saved == null)
            {
                return;
            }

            var width = ClampWidth(saved.HoverWidth);
            var delayMs = ClampShowDelayMs(saved.ShowDelayMs);
            var blockSpacing = saved.HoverFieldBlockSpacingDip <= 0
                ? LegacyMissingFieldBlockSpacingDip
                : ClampFieldBlockSpacingDip(saved.HoverFieldBlockSpacingDip);
            var columnCount = saved.HoverFieldColumnCount == null || saved.HoverFieldColumnCount.Value <= 0
                ? DefaultFieldColumnCount
                : ClampFieldColumnCount(saved.HoverFieldColumnCount.Value);
            var contentPadding = saved.HoverContentPaddingDip == null
                ? LegacyMissingContentPaddingDip
                : ClampContentPaddingDip(saved.HoverContentPaddingDip.Value);
            var disabled = saved.HoverDisabled;
            var disabledInFullscreen = saved.HoverDisabledInFullscreen ?? true;
            var hideTitles = saved.HideFieldTitlesInHover;
            var gameNameHeader = saved.ShowGameNameHeader;
            var showInlineIcons = saved.ShowFieldInlineIconsInHover;
            var hideIconBg = saved.HideIconChipBackground;
            var hideDividers = saved.HideFieldDividers ?? true;
            var hideBorder = saved.HidePanelBorder ?? false;
            var emptyBehavior = saved.UseFallbackFields ? EmptyFieldsFallback
                : saved.HideEmptyFields == true ? EmptyFieldsHide : EmptyFieldsDoNothing;
            var bodyFont = saved.HoverBodyFontSize == null || saved.HoverBodyFontSize.Value <= 0
                ? LegacyMissingBodyFontSize
                : ClampBodyFontSize(saved.HoverBodyFontSize.Value);
            var titleFont = saved.HoverTitleFontSize == null || saved.HoverTitleFontSize.Value <= 0
                ? LegacyMissingTitleFontSize
                : ClampTitleFontSize(saved.HoverTitleFontSize.Value);
            var iconStyle = NormalizeIconStyle(saved.HoverIconStyle);
            var iconSize = saved.HoverIconChipSizeDip == null || saved.HoverIconChipSizeDip.Value <= 0
                ? LegacyMissingIconChipSizeDip
                : ClampIconChipSizeDip(saved.HoverIconChipSizeDip.Value);
            var iconPadding = saved.HoverIconChipPaddingDip == null
                ? LegacyMissingIconChipPaddingDip
                : ClampIconChipPaddingDip(saved.HoverIconChipPaddingDip.Value);
            var iconShape = NormalizeIconChipShape(saved.HoverIconChipShape);
            var themeChrome = saved.UseThemeChrome ?? true;
            var bgStyle = NormalizeBackgroundStyle(saved.HoverBackgroundStyle);
            var bgHex = HoverChromePalette.NormalizeHexOrDefault(
                saved.HoverChromeBackgroundHex,
                HoverChromePalette.DefaultFillHex);
            var borderHex = HoverChromePalette.NormalizeHexOrDefault(
                saved.HoverChromeBorderHex,
                HoverChromePalette.DefaultBorderHex);
            var dividerHex = HoverChromePalette.NormalizeHexOrDefault(
                string.IsNullOrWhiteSpace(saved.HoverChromeDividerHex)
                    ? saved.HoverChromeBorderHex
                    : saved.HoverChromeDividerHex,
                HoverChromePalette.DefaultDividerHex);
            var iconBgHex = HoverChromePalette.NormalizeHexOrDefault(
                saved.HoverChromeIconBackgroundHex,
                HoverChromePalette.DefaultIconBackgroundHex);
            var bgOpacity = saved.HoverChromeBackgroundOpacity == null
                ? DefaultChromeOpacity
                : ClampChromeOpacity(saved.HoverChromeBackgroundOpacity.Value);
            var fieldKeys = NormalizeKeys(saved.SelectedFieldKeys ?? new List<string>());

            if (!notify)
            {
                hoverWidth = width;
                showDelayMs = delayMs;
                hoverFieldBlockSpacingDip = blockSpacing;
                hoverFieldColumnCount = columnCount;
                hoverContentPaddingDip = contentPadding;
                hoverDisabled = disabled;
                hoverDisabledInFullscreen = disabledInFullscreen;
                hideFieldTitlesInHover = hideTitles;
                showGameNameHeader = gameNameHeader;
                showFieldInlineIconsInHover = showInlineIcons;
                hideIconChipBackground = hideIconBg;
                hideFieldDividers = hideDividers;
                hidePanelBorder = hideBorder;
                emptyFieldBehavior = emptyBehavior;
                hoverBodyFontSize = bodyFont;
                hoverTitleFontSize = titleFont;
                hoverIconStyle = iconStyle;
                hoverIconChipSizeDip = iconSize;
                hoverIconChipPaddingDip = iconPadding;
                hoverIconChipShape = iconShape;
                useThemeChrome = themeChrome;
                hoverBackgroundStyle = bgStyle;
                hoverChromeBackgroundHex = bgHex;
                hoverChromeBorderHex = borderHex;
                hoverChromeDividerHex = dividerHex;
                hoverChromeIconBackgroundHex = iconBgHex;
                hoverChromeBackgroundOpacity = bgOpacity;
                selectedFieldKeys = fieldKeys;
                return;
            }

            HoverWidth = width;
            ShowDelayMs = delayMs;
            HoverFieldBlockSpacingDip = blockSpacing;
            HoverFieldColumnCount = columnCount;
            HoverContentPaddingDip = contentPadding;
            HoverDisabled = disabled;
            HoverDisabledInFullscreen = disabledInFullscreen;
            HideFieldTitlesInHover = hideTitles;
            ShowGameNameHeader = gameNameHeader;
            ShowFieldInlineIconsInHover = showInlineIcons;
            HideIconChipBackground = hideIconBg;
            HideFieldDividers = hideDividers;
            HidePanelBorder = hideBorder;
            EmptyFieldBehavior = emptyBehavior;
            HoverBodyFontSize = bodyFont;
            HoverTitleFontSize = titleFont;
            HoverIconStyle = iconStyle;
            HoverIconChipSizeDip = iconSize;
            HoverIconChipPaddingDip = iconPadding;
            HoverIconChipShape = iconShape;
            HoverBackgroundStyle = bgStyle;
            RunWithThemeHexSync(() =>
            {
                UseThemeChrome = themeChrome;
                HoverChromeBackgroundHex = bgHex;
                HoverChromeBorderHex = borderHex;
                HoverChromeDividerHex = dividerHex;
                HoverChromeIconBackgroundHex = iconBgHex;
            });
            HoverChromeBackgroundOpacity = bgOpacity;
            SelectedFieldKeys = fieldKeys;
        }

        private GameHoverDetailsPersistedState ToPersistedState()
        {
            return new GameHoverDetailsPersistedState
            {
                HoverWidth = HoverWidth,
                ShowDelayMs = ShowDelayMs,
                HoverFieldBlockSpacingDip = HoverFieldBlockSpacingDip,
                HoverFieldColumnCount = HoverFieldColumnCount,
                HoverContentPaddingDip = HoverContentPaddingDip,
                HoverDisabled = HoverDisabled,
                HoverDisabledInFullscreen = HoverDisabledInFullscreen,
                HideFieldTitlesInHover = HideFieldTitlesInHover,
                ShowGameNameHeader = ShowGameNameHeader,
                ShowFieldInlineIconsInHover = ShowFieldInlineIconsInHover,
                HideIconChipBackground = HideIconChipBackground,
                HideFieldDividers = HideFieldDividers,
                HidePanelBorder = HidePanelBorder,
                HideEmptyFields = HideEmptyFields,
                UseFallbackFields = UseFallbackFields,
                HoverBodyFontSize = HoverBodyFontSize,
                HoverTitleFontSize = HoverTitleFontSize,
                HoverIconStyle = HoverIconStyle,
                HoverIconChipSizeDip = HoverIconChipSizeDip,
                HoverIconChipPaddingDip = HoverIconChipPaddingDip,
                HoverIconChipShape = HoverIconChipShape,
                UseThemeChrome = UseThemeChrome,
                HoverBackgroundStyle = HoverBackgroundStyle,
                HoverChromeBackgroundHex = HoverChromeBackgroundHex,
                HoverChromeBorderHex = HoverChromeBorderHex,
                HoverChromeDividerHex = HoverChromeDividerHex,
                HoverChromeIconBackgroundHex = HoverChromeIconBackgroundHex,
                HoverChromeBackgroundOpacity = HoverChromeBackgroundOpacity,
                SelectedFieldKeys = new List<string>(SelectedFieldKeys)
            };
        }

        public bool VerifySettings(out List<string> errors)
        {
            errors = new List<string>();
            return true;
        }
    }
}
