using System.Collections.Generic;
using System.Linq;
using System.Windows;
using System.Windows.Media;
using Playnite.SDK;
using Playnite.SDK.Data;


namespace GameHoverDetails
{
    public partial class GameHoverDetailsSettings : ObservableObject, ISettings
    {
        private const int MinWidth = 120;
        private const int MaxWidth = 500;
        private const int MinShowDelayMs = 0;
        private const int MaxShowDelayMs = 500;
        private const int MinFieldBlockSpacingDip = 4;
        private const int MaxFieldBlockSpacingDip = 36;
        private const int DefaultHoverWidth = 188;
        private const int DefaultShowDelayMs = 30;
        private const int DefaultFieldBlockSpacingDip = 10;
        internal const int MinFieldColumnCount = 1;
        internal const int MaxFieldColumnCount = 3;
        internal const int DefaultFieldColumnCount = 1;
        internal const int MinContentPaddingDip = 4;
        internal const int MaxContentPaddingDip = 32;
        internal const int DefaultContentPaddingDip = 12;
        private const int MinChromeOpacity = 0;
        private const int MaxChromeOpacity = 100;
        private const int DefaultChromeOpacity = 100;
        internal const int FactoryChromeOpacity = 90;
        internal const double DefaultBodyFontSize = 14;
        internal const double MinBodyFontSize = 9;
        internal const double MaxBodyFontSize = 20;
        internal const double DefaultTitleFontSize = 10;
        internal const double MinTitleFontSize = 8;
        internal const double MaxTitleFontSize = 16;
        /// <summary>Line-height scale is locked to these sizes so changing factory defaults does not change leading.</summary>
        internal const double BodyLineHeightReferenceFontSize = 13;
        internal const double TitleLineHeightReferenceFontSize = 10.5;
        internal const int DefaultIconChipSizeDip = 19;
        internal const int MinIconChipSizeDip = 8;
        internal const int MaxIconChipSizeDip = 40;
        internal const int DefaultIconChipPaddingDip = 8;
        private const int LegacyMissingFieldBlockSpacingDip = 11;
        private const int LegacyMissingContentPaddingDip = 14;
        private const double LegacyMissingBodyFontSize = 13;
        private const double LegacyMissingTitleFontSize = 10.5;
        private const int LegacyMissingIconChipSizeDip = 32;
        private const int LegacyMissingIconChipPaddingDip = 8;
        internal const int MinIconChipPaddingDip = 0;
        internal const int MaxIconChipPaddingDip = 16;
        public const string IconStylePhosphor = "Phosphor";
        public const string IconStyleUnicons = "Unicons";
        public const string IconStyleHugeIcons = "HugeIcons";
        public const string IconStyleSketchy = "Sketchy";
        public const string IconStyleIconsax = "Iconsax";
        public const string IconStylePixel = "Pixel";
        public const string IconStylePixelarticons = "Pixelarticons";
        public const string IconChipShapeCircle = "Circle";
        public const string IconChipShapeRectangle = "Rectangle";
        public const string IconChipShapeRounded = "Rounded";
        public const string IconChipShapeSoftRounded = "SoftRounded";
        public const string IconChipShapeSquircle = "Squircle";
        public const string IconChipShapeArch = "Arch";
        public const string IconChipShapeTile = "Tile";
        public const string IconChipShapeLeaf = "Leaf";

        private static readonly string[] FactoryDefaultSelectedKeys =
        {
            "TimePlayed",
            "LastPlayed",
            "Library",
            "Developer"
        };

        public const string BackgroundStyleRegular = "Regular";
        public const string BackgroundStyleGameCover = "GameCover";
        public const string EmptyFieldsDoNothing = "DoNothing";
        public const string EmptyFieldsHide = "Hide";
        public const string EmptyFieldsFallback = "Fallback";

        /// <summary>Turning <c>Use game background</c> on always snaps opacity here.</summary>
        internal const int FanartDefaultOpacity = 50;

        [DontSerialize]
        private GameHoverDetailsPlugin plugin;

        private int hoverWidth = DefaultHoverWidth;
        private int showDelayMs = DefaultShowDelayMs;
        private int hoverFieldBlockSpacingDip = DefaultFieldBlockSpacingDip;
        private int hoverFieldColumnCount = DefaultFieldColumnCount;
        private int hoverContentPaddingDip = DefaultContentPaddingDip;
        private bool hoverDisabled;
        private bool hoverDisabledInFullscreen = true;
        private bool hideFieldTitlesInHover;
        private bool showGameNameHeader;
        private bool showFieldInlineIconsInHover = true;
        private bool hideIconChipBackground;
        private bool hideFieldDividers;
        private bool hidePanelBorder = true;
        private string emptyFieldBehavior = EmptyFieldsDoNothing;
        private double hoverBodyFontSize = DefaultBodyFontSize;
        private double hoverTitleFontSize = DefaultTitleFontSize;
        private string hoverIconStyle = IconStyleHugeIcons;
        private int hoverIconChipSizeDip = DefaultIconChipSizeDip;
        private int hoverIconChipPaddingDip = DefaultIconChipPaddingDip;
        private string hoverIconChipShape = IconChipShapeSoftRounded;
        private bool useThemeChrome;
        private string hoverBackgroundStyle = BackgroundStyleRegular;
        private string hoverChromeBackgroundHex = HoverChromePalette.DefaultFillHex;
        private string hoverChromeBorderHex = HoverChromePalette.DefaultBorderHex;
        private string hoverChromeDividerHex = HoverChromePalette.DefaultDividerHex;
        private string hoverChromeIconBackgroundHex = HoverChromePalette.DefaultIconBackgroundHex;
        private int hoverChromeBackgroundOpacity = FactoryChromeOpacity;
        private List<string> selectedFieldKeys = new List<string>(FactoryDefaultSelectedKeys);

        [DontSerialize]
        private GameHoverDetailsPersistedState editSnapshot;

        public int HoverWidth
        {
            get => hoverWidth;
            set => SetValue(ref hoverWidth, ClampWidth(value));
        }

        /// <summary>Milliseconds to wait after the pointer rests on a game tile before opening the hover (0 = immediate).</summary>
        public int ShowDelayMs
        {
            get => showDelayMs;
            set => SetValue(ref showDelayMs, ClampShowDelayMs(value));
        }

        /// <summary>Vertical gap between field blocks in the hover panel (device-independent pixels).</summary>
        public int HoverFieldBlockSpacingDip
        {
            get => hoverFieldBlockSpacingDip;
            set => SetValue(ref hoverFieldBlockSpacingDip, ClampFieldBlockSpacingDip(value));
        }

        /// <summary>How many field columns the hover list uses (1 = stacked, as before).</summary>
        public int HoverFieldColumnCount
        {
            get => hoverFieldColumnCount;
            set => SetValue(ref hoverFieldColumnCount, ClampFieldColumnCount(value));
        }

        /// <summary>Inset around the field/icon list inside the hover panel (device-independent pixels).</summary>
        public int HoverContentPaddingDip
        {
            get => hoverContentPaddingDip;
            set => SetValue(ref hoverContentPaddingDip, ClampContentPaddingDip(value));
        }

        /// <summary>When true, hover popups are turned off (persisted; default false for existing installs).</summary>
        public bool HoverDisabled
        {
            get => hoverDisabled;
            set => SetValue(ref hoverDisabled, value);
        }

        /// <summary>When true, hover is off in Playnite Fullscreen (persisted; default true).</summary>
        public bool HoverDisabledInFullscreen
        {
            get => hoverDisabledInFullscreen;
            set => SetValue(ref hoverDisabledInFullscreen, value);
        }

        /// <summary>Show the game name above the fields without using a field slot.</summary>
        public bool ShowGameNameHeader
        {
            get => showGameNameHeader;
            set => SetValue(ref showGameNameHeader, value);
        }

        /// <summary>When true, field labels (e.g. Publisher) are hidden in the hover panel.</summary>
        public bool HideFieldTitlesInHover
        {
            get => hideFieldTitlesInHover;
            set => SetValue(ref hideFieldTitlesInHover, value);
        }

        /// <summary>When true, show a catalog icon beside text values (not used for cover/icon/background rows or platform icon strip).</summary>
        public bool ShowFieldInlineIconsInHover
        {
            get => showFieldInlineIconsInHover;
            set => SetValue(
                ref showFieldInlineIconsInHover,
                value,
                nameof(ShowFieldInlineIconsInHover),
                nameof(ShowIconBackgroundColorControls));
        }

        /// <summary>When true, inline icon chips have no fill.</summary>
        public bool HideIconChipBackground
        {
            get => hideIconChipBackground;
            set => SetValue(
                ref hideIconChipBackground,
                value,
                nameof(HideIconChipBackground),
                nameof(ShowIconBackgroundColorControls));
        }

        /// <summary>Icon-background color picker is only useful when icons and chip fill are on.</summary>
        [DontSerialize]
        public bool ShowIconBackgroundColorControls => showFieldInlineIconsInHover && !hideIconChipBackground;

        /// <summary>When true, no 1px divider between field blocks.</summary>
        public bool HideFieldDividers
        {
            get => hideFieldDividers;
            set => SetValue(
                ref hideFieldDividers,
                value,
                nameof(HideFieldDividers),
                nameof(ShowDividerColorControls));
        }

        /// <summary>Divider color picker is only useful when field dividers are shown.</summary>
        [DontSerialize]
        public bool ShowDividerColorControls => !hideFieldDividers;

        /// <summary>When true, the hover panel has no 1px outline.</summary>
        public bool HidePanelBorder
        {
            get => hidePanelBorder;
            set => SetValue(
                ref hidePanelBorder,
                value,
                nameof(HidePanelBorder),
                nameof(ShowBorderColorControls));
        }

        /// <summary>Border color picker is only useful when the panel outline is shown.</summary>
        [DontSerialize]
        public bool ShowBorderColorControls => !hidePanelBorder;

        /// <summary>One mutually exclusive choice; persisted through the existing flags for compatibility.</summary>
        [DontSerialize]
        public string EmptyFieldBehavior
        {
            get => emptyFieldBehavior;
            set => SetValue(ref emptyFieldBehavior,
                value == EmptyFieldsHide || value == EmptyFieldsFallback ? value : EmptyFieldsDoNothing,
                nameof(EmptyFieldBehavior), nameof(HideEmptyFields), nameof(UseFallbackFields));
        }

        /// <summary>Derived rendering flag; selecting Hide also turns automatic fallbacks off.</summary>
        [DontSerialize]
        public bool HideEmptyFields
        {
            get => emptyFieldBehavior == EmptyFieldsHide;
            set
            {
                if (value) EmptyFieldBehavior = EmptyFieldsHide;
                else if (HideEmptyFields) EmptyFieldBehavior = EmptyFieldsDoNothing;
            }
        }

        /// <summary>Derived rendering flag; selecting Fallback also turns empty-field hiding off.</summary>
        [DontSerialize]
        public bool UseFallbackFields
        {
            get => emptyFieldBehavior == EmptyFieldsFallback;
            set
            {
                if (value) EmptyFieldBehavior = EmptyFieldsFallback;
                else if (UseFallbackFields) EmptyFieldBehavior = EmptyFieldsDoNothing;
            }
        }

        [DontSerialize]
        public string FallbackFieldsTooltip => HoverFieldResolver.TooltipText();

        /// <summary>Body / value text size in the hover panel (device-independent pixels).</summary>
        public double HoverBodyFontSize
        {
            get => hoverBodyFontSize;
            set => SetValue(ref hoverBodyFontSize, ClampBodyFontSize(value));
        }

        /// <summary>Field-title text size when titles are shown.</summary>
        public double HoverTitleFontSize
        {
            get => hoverTitleFontSize;
            set => SetValue(ref hoverTitleFontSize, ClampTitleFontSize(value));
        }

        /// <summary>Catalog glyph family: HugeIcons (default), Unicons, Phosphor, Sketchy, Iconsax, Pixel, or Pixelarticons.</summary>
        public string HoverIconStyle
        {
            get => hoverIconStyle;
            set
            {
                var norm = NormalizeIconStyle(value);
                if (string.Equals(hoverIconStyle, norm, System.StringComparison.Ordinal))
                {
                    return;
                }

                SetValue(
                    ref hoverIconStyle,
                    norm,
                    nameof(HoverIconStyle));
            }
        }

        /// <summary>Glyph size for inline field icons (device-independent pixels). Padding grows the chip around this.</summary>
        public int HoverIconChipSizeDip
        {
            get => hoverIconChipSizeDip;
            set => SetValue(
                ref hoverIconChipSizeDip,
                ClampIconChipSizeDip(value),
                nameof(HoverIconChipSizeDip),
                nameof(HoverIconGlyphFontSize),
                nameof(HoverIconChipOuterSizeDip));
        }

        /// <summary>Space between the glyph and the chip edge. Does not change <see cref="HoverIconChipSizeDip"/>.</summary>
        public int HoverIconChipPaddingDip
        {
            get => hoverIconChipPaddingDip;
            set => SetValue(
                ref hoverIconChipPaddingDip,
                ClampIconChipPaddingDip(value),
                nameof(HoverIconChipPaddingDip),
                nameof(HoverIconChipOuterSizeDip));
        }

        /// <summary>Fill shape when icon background is on. Circle, Rectangle, Rounded, SoftRounded, Squircle, Arch, Tile, Leaf.</summary>
        public string HoverIconChipShape
        {
            get => hoverIconChipShape;
            set
            {
                var norm = NormalizeIconChipShape(value);
                if (string.Equals(hoverIconChipShape, norm, System.StringComparison.Ordinal))
                {
                    return;
                }

                SetValue(ref hoverIconChipShape, norm, nameof(HoverIconChipShape));
            }
        }

        [DontSerialize]
        public double HoverIconGlyphFontSize => HoverIconChipSizeDip;

        /// <summary>Chip box: icon size plus padding on each side.</summary>
        [DontSerialize]
        public int HoverIconChipOuterSizeDip => HoverIconChipSizeDip + (2 * HoverIconChipPaddingDip);

        internal CornerRadius ResolveIconChipCornerRadius()
        {
            return ResolveIconChipCornerRadius(HoverIconChipShape, HoverIconChipOuterSizeDip);
        }

        [DontSerialize]
        private bool syncingThemeIntoHex;

        /// <summary>True between <see cref="BeginEdit"/> and <see cref="EndEdit"/> / <see cref="CancelEdit"/>.</summary>
        [DontSerialize]
        internal bool SuppressHoverLiveUpdates { get; private set; }

        /// <summary>True while restoring snapshot values so the settings preview does not rebuild per field.</summary>
        [DontSerialize]
        internal bool SuppressSettingsViewRebuilds { get; private set; }

        /// <summary>Regular solid fill, or the hovered game's cover as the panel background.</summary>
        public string HoverBackgroundStyle
        {
            get => hoverBackgroundStyle;
            set
            {
                var norm = NormalizeBackgroundStyle(value);
                if (string.Equals(hoverBackgroundStyle, norm, System.StringComparison.Ordinal))
                {
                    return;
                }

                var turningFanartOn = !IsGameCoverBackgroundStyle
                    && string.Equals(norm, BackgroundStyleGameCover, System.StringComparison.Ordinal);
                SetValue(ref hoverBackgroundStyle, norm, nameof(HoverBackgroundStyle));
                OnPropertyChanged(nameof(IsGameCoverBackgroundStyle));
                OnPropertyChanged(nameof(UseGameBackground));
                OnPropertyChanged(nameof(ShowRegularBackgroundColorControls));
                if (turningFanartOn)
                {
                    HoverChromeBackgroundOpacity = FanartDefaultOpacity;
                }
            }
        }

        /// <summary>UI binding for "Use game background".</summary>
        [DontSerialize]
        public bool UseGameBackground
        {
            get => IsGameCoverBackgroundStyle;
            set => HoverBackgroundStyle = value ? BackgroundStyleGameCover : BackgroundStyleRegular;
        }

        [DontSerialize]
        public bool IsGameCoverBackgroundStyle =>
            string.Equals(hoverBackgroundStyle, BackgroundStyleGameCover, System.StringComparison.OrdinalIgnoreCase);

        /// <summary>Background color picker applies only to Regular fill.</summary>
        [DontSerialize]
        public bool ShowRegularBackgroundColorControls => !IsGameCoverBackgroundStyle;

        /// <summary>When true, popup chrome follows Playnite theme (accent-dark fill); pickers stay visible as a live mirror.</summary>
        public bool UseThemeChrome
        {
            get => useThemeChrome;
            set => SetValue(ref useThemeChrome, value, nameof(UseThemeChrome));
        }

        public string HoverChromeBackgroundHex
        {
            get => hoverChromeBackgroundHex;
            set => SetChromeHex(ref hoverChromeBackgroundHex, value, nameof(HoverChromeBackgroundHex), nameof(ChromeBackgroundSwatchBrush));
        }

        public string HoverChromeBorderHex
        {
            get => hoverChromeBorderHex;
            set => SetChromeHex(ref hoverChromeBorderHex, value, nameof(HoverChromeBorderHex), nameof(ChromeBorderSwatchBrush));
        }

        public string HoverChromeDividerHex
        {
            get => hoverChromeDividerHex;
            set => SetChromeHex(ref hoverChromeDividerHex, value, nameof(HoverChromeDividerHex), nameof(ChromeDividerSwatchBrush));
        }

        public string HoverChromeIconBackgroundHex
        {
            get => hoverChromeIconBackgroundHex;
            set => SetChromeHex(ref hoverChromeIconBackgroundHex, value, nameof(HoverChromeIconBackgroundHex), nameof(ChromeIconBackgroundSwatchBrush));
        }

        private void SetChromeHex(ref string field, string value, string hexPropertyName, string swatchPropertyName)
        {
            if (!HoverChromePalette.TryNormalizeHex(value, out var hex) ||
                string.Equals(field, hex, System.StringComparison.Ordinal))
            {
                return;
            }

            field = hex;
            OnPropertyChanged(hexPropertyName);
            OnPropertyChanged(swatchPropertyName);
            UncheckThemeChromeIfUserEdited();
        }

        /// <summary>Fill opacity (0–100) for theme and custom chrome.</summary>
        public int HoverChromeBackgroundOpacity
        {
            get => hoverChromeBackgroundOpacity;
            set => SetValue(ref hoverChromeBackgroundOpacity, ClampChromeOpacity(value));
        }

        [DontSerialize]
        public Brush ChromeBackgroundSwatchBrush => HoverChromePalette.SwatchFromHex(hoverChromeBackgroundHex);

        [DontSerialize]
        public Brush ChromeBorderSwatchBrush => HoverChromePalette.SwatchFromHex(hoverChromeBorderHex);

        [DontSerialize]
        public Brush ChromeDividerSwatchBrush => HoverChromePalette.SwatchFromHex(hoverChromeDividerHex);

        [DontSerialize]
        public Brush ChromeIconBackgroundSwatchBrush => HoverChromePalette.SwatchFromHex(hoverChromeIconBackgroundHex);

        /// <summary>Copy live accent-dark theme colors into the pickers without turning off theme-sync.</summary>
        public void ApplyThemeColorsToPickers()
        {
            var hexes = HoverChromePalette.ComputeThemeChromeHexes();

            RunWithThemeHexSync(() =>
            {
                HoverChromeBackgroundHex = hexes.Fill;
                HoverChromeBorderHex = hexes.Border;
                HoverChromeDividerHex = hexes.Divider;
                HoverChromeIconBackgroundHex = hexes.IconBackground;
            });
        }

        /// <summary>Restore factory colors and turn off theme-sync.</summary>
        public void ResetCustomChromeColors()
        {
            UseThemeChrome = false;
            HoverChromeBackgroundHex = HoverChromePalette.DefaultFillHex;
            HoverChromeBorderHex = HoverChromePalette.DefaultBorderHex;
            HoverChromeDividerHex = HoverChromePalette.DefaultDividerHex;
            HoverChromeIconBackgroundHex = HoverChromePalette.DefaultIconBackgroundHex;
            HoverChromeBackgroundOpacity = FactoryChromeOpacity;
        }

        private void UncheckThemeChromeIfUserEdited()
        {
            if (!syncingThemeIntoHex && useThemeChrome)
            {
                UseThemeChrome = false;
            }
        }

        internal void RunWithThemeHexSync(System.Action action)
        {
            syncingThemeIntoHex = true;
            try
            {
                action();
            }
            finally
            {
                syncingThemeIntoHex = false;
            }
        }

        internal IPlayniteAPI TryGetPlayniteApi() => plugin?.GetPlayniteApi();

        /// <summary>True when hover must not show (globally off, or Fullscreen with that option on).</summary>
        internal bool IsHoverSuppressed()
        {
            if (hoverDisabled)
            {
                return true;
            }

            if (!hoverDisabledInFullscreen)
            {
                return false;
            }

            return IsFullscreenApplicationMode(TryGetPlayniteApi());
        }

        internal static bool IsFullscreenApplicationMode(IPlayniteAPI api)
        {
            try
            {
                return api?.ApplicationInfo != null && api.ApplicationInfo.Mode == ApplicationMode.Fullscreen;
            }
            catch
            {
                return false;
            }
        }

        public GameHoverDetailsSettings()
        {
        }

        public GameHoverDetailsSettings(GameHoverDetailsPlugin plugin)
            : this()
        {
            this.plugin = plugin ?? throw new System.ArgumentNullException(nameof(plugin));
            LoadPersistedState(plugin.LoadPluginSettings<GameHoverDetailsPersistedState>());
        }
    }
}
