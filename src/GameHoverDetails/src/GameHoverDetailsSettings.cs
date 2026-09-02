using System.Collections.Generic;
using System.Linq;
using System.Windows;
using System.Windows.Media;
using Playnite.SDK;
using Playnite.SDK.Data;

namespace GameHoverDetails
{
    public class GameHoverDetailsSettings : ObservableObject, ISettings
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
        private bool showFieldInlineIconsInHover = true;
        private bool hideIconChipBackground;
        private bool hideFieldDividers;
        private bool hidePanelBorder = true;
        private bool hideEmptyFields;
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

        /// <summary>When true, field blocks with no value are hidden from the hover panel.</summary>
        public bool HideEmptyFields
        {
            get => hideEmptyFields;
            set => SetValue(ref hideEmptyFields, value);
        }

        /// <summary>Body / value text size in the hover panel (device-independent pixels).</summary>
        public double HoverBodyFontSize
        {
            get => hoverBodyFontSize;
            set => SetValue(ref hoverBodyFontSize, ClampBodyFontSize(value), nameof(HoverBodyFontSize), nameof(HoverBodyLineHeight));
        }

        /// <summary>Field-title text size when titles are shown.</summary>
        public double HoverTitleFontSize
        {
            get => hoverTitleFontSize;
            set => SetValue(ref hoverTitleFontSize, ClampTitleFontSize(value), nameof(HoverTitleFontSize), nameof(HoverTitleLineHeight));
        }

        [DontSerialize]
        public double HoverBodyLineHeight => HoverBodyFontSize * (18.0 / BodyLineHeightReferenceFontSize);

        [DontSerialize]
        public double HoverTitleLineHeight => HoverTitleFontSize * (14.0 / TitleLineHeightReferenceFontSize);

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
                    nameof(HoverIconStyle),
                    nameof(HoverIconFontFamily));
            }
        }

        [DontSerialize]
        public FontFamily HoverIconFontFamily => HoverFieldCatalog.GetGlyphFontFamily(hoverIconStyle);

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

        /// <summary>Hover panel width is the Layout slider for both Regular and fanart.</summary>
        internal int ResolveHoverPanelWidth() => HoverWidth;

        /// <summary>When true, popup chrome follows Playnite theme (accent-dark fill); pickers stay visible as a live mirror.</summary>
        public bool UseThemeChrome
        {
            get => useThemeChrome;
            set => SetValue(ref useThemeChrome, value, nameof(UseThemeChrome));
        }

        public string HoverChromeBackgroundHex
        {
            get => hoverChromeBackgroundHex;
            set
            {
                if (!HoverChromePalette.TryNormalizeHex(value, out var hex))
                {
                    return;
                }

                if (string.Equals(hoverChromeBackgroundHex, hex, System.StringComparison.Ordinal))
                {
                    return;
                }

                SetValue(ref hoverChromeBackgroundHex, hex, nameof(HoverChromeBackgroundHex), nameof(ChromeBackgroundSwatchBrush));
                UncheckThemeChromeIfUserEdited();
            }
        }

        public string HoverChromeBorderHex
        {
            get => hoverChromeBorderHex;
            set
            {
                if (!HoverChromePalette.TryNormalizeHex(value, out var hex))
                {
                    return;
                }

                if (string.Equals(hoverChromeBorderHex, hex, System.StringComparison.Ordinal))
                {
                    return;
                }

                SetValue(ref hoverChromeBorderHex, hex, nameof(HoverChromeBorderHex), nameof(ChromeBorderSwatchBrush));
                UncheckThemeChromeIfUserEdited();
            }
        }

        public string HoverChromeDividerHex
        {
            get => hoverChromeDividerHex;
            set
            {
                if (!HoverChromePalette.TryNormalizeHex(value, out var hex))
                {
                    return;
                }

                if (string.Equals(hoverChromeDividerHex, hex, System.StringComparison.Ordinal))
                {
                    return;
                }

                SetValue(ref hoverChromeDividerHex, hex, nameof(HoverChromeDividerHex), nameof(ChromeDividerSwatchBrush));
                UncheckThemeChromeIfUserEdited();
            }
        }

        public string HoverChromeIconBackgroundHex
        {
            get => hoverChromeIconBackgroundHex;
            set
            {
                if (!HoverChromePalette.TryNormalizeHex(value, out var hex))
                {
                    return;
                }

                if (string.Equals(hoverChromeIconBackgroundHex, hex, System.StringComparison.Ordinal))
                {
                    return;
                }

                SetValue(ref hoverChromeIconBackgroundHex, hex, nameof(HoverChromeIconBackgroundHex), nameof(ChromeIconBackgroundSwatchBrush));
                UncheckThemeChromeIfUserEdited();
            }
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
            if (!HoverChromePalette.TryComputeThemeChromeHexes(out var hexes))
            {
                return;
            }

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

        public List<string> SelectedFieldKeys
        {
            get => selectedFieldKeys;
            set
            {
                var norm = NormalizeKeys(value ?? new List<string>());
                if (ListsEqual(selectedFieldKeys, norm))
                {
                    return;
                }

                SetValue(ref selectedFieldKeys, norm, nameof(SelectedFieldKeys), nameof(SelectedFieldCount));
            }
        }

        [DontSerialize]
        public int SelectedFieldCount => selectedFieldKeys.Count;

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
            var saved = plugin.LoadPluginSettings<GameHoverDetailsPersistedState>();
            if (saved != null)
            {
                hoverWidth = ClampWidth(saved.HoverWidth);
                showDelayMs = ClampShowDelayMs(saved.ShowDelayMs);
                hoverFieldBlockSpacingDip = saved.HoverFieldBlockSpacingDip <= 0
                    ? LegacyMissingFieldBlockSpacingDip
                    : ClampFieldBlockSpacingDip(saved.HoverFieldBlockSpacingDip);
                hoverFieldColumnCount = saved.HoverFieldColumnCount == null || saved.HoverFieldColumnCount.Value <= 0
                    ? DefaultFieldColumnCount
                    : ClampFieldColumnCount(saved.HoverFieldColumnCount.Value);
                hoverContentPaddingDip = saved.HoverContentPaddingDip == null
                    ? LegacyMissingContentPaddingDip
                    : ClampContentPaddingDip(saved.HoverContentPaddingDip.Value);
                hoverDisabled = saved.HoverDisabled;
                hoverDisabledInFullscreen = saved.HoverDisabledInFullscreen ?? true;
                hideFieldTitlesInHover = saved.HideFieldTitlesInHover;
                showFieldInlineIconsInHover = saved.ShowFieldInlineIconsInHover;
                hideIconChipBackground = saved.HideIconChipBackground;
                hideFieldDividers = saved.HideFieldDividers ?? true;
                hidePanelBorder = saved.HidePanelBorder ?? false;
                hideEmptyFields = saved.HideEmptyFields ?? false;
                hoverBodyFontSize = saved.HoverBodyFontSize == null || saved.HoverBodyFontSize.Value <= 0
                    ? LegacyMissingBodyFontSize
                    : ClampBodyFontSize(saved.HoverBodyFontSize.Value);
                hoverTitleFontSize = saved.HoverTitleFontSize == null || saved.HoverTitleFontSize.Value <= 0
                    ? LegacyMissingTitleFontSize
                    : ClampTitleFontSize(saved.HoverTitleFontSize.Value);
                hoverIconStyle = NormalizeIconStyle(saved.HoverIconStyle);
                hoverIconChipSizeDip = saved.HoverIconChipSizeDip == null || saved.HoverIconChipSizeDip.Value <= 0
                    ? LegacyMissingIconChipSizeDip
                    : ClampIconChipSizeDip(saved.HoverIconChipSizeDip.Value);
                hoverIconChipPaddingDip = saved.HoverIconChipPaddingDip == null
                    ? LegacyMissingIconChipPaddingDip
                    : ClampIconChipPaddingDip(saved.HoverIconChipPaddingDip.Value);
                hoverIconChipShape = NormalizeIconChipShape(saved.HoverIconChipShape);
                useThemeChrome = saved.UseThemeChrome ?? true;
                hoverBackgroundStyle = NormalizeBackgroundStyle(saved.HoverBackgroundStyle);
                hoverChromeBackgroundHex = HoverChromePalette.NormalizeHexOrDefault(
                    saved.HoverChromeBackgroundHex,
                    HoverChromePalette.DefaultFillHex);
                hoverChromeBorderHex = HoverChromePalette.NormalizeHexOrDefault(
                    saved.HoverChromeBorderHex,
                    HoverChromePalette.DefaultBorderHex);
                hoverChromeDividerHex = HoverChromePalette.NormalizeHexOrDefault(
                    string.IsNullOrWhiteSpace(saved.HoverChromeDividerHex)
                        ? saved.HoverChromeBorderHex
                        : saved.HoverChromeDividerHex,
                    HoverChromePalette.DefaultDividerHex);
                hoverChromeIconBackgroundHex = HoverChromePalette.NormalizeHexOrDefault(
                    saved.HoverChromeIconBackgroundHex,
                    HoverChromePalette.DefaultIconBackgroundHex);
                hoverChromeBackgroundOpacity = saved.HoverChromeBackgroundOpacity == null
                    ? DefaultChromeOpacity
                    : ClampChromeOpacity(saved.HoverChromeBackgroundOpacity.Value);
                selectedFieldKeys = NormalizeKeys(saved.SelectedFieldKeys ?? new List<string>());
            }
        }

        public IReadOnlyList<string> GetOrderedSelectedKeys()
        {
            return selectedFieldKeys.Where(HoverFieldCatalog.IsKnownKey).ToList();
        }

        /// <summary>Catalog keys not currently selected, in catalog order (for Add-field UI).</summary>
        public IReadOnlyList<string> GetAddableKeys()
        {
            var selected = new HashSet<string>(selectedFieldKeys);
            return HoverFieldCatalog.GetAllKeysInCatalogOrder()
                .Where(k => !selected.Contains(k))
                .ToList();
        }

        public bool MoveEnabled(int fromIndex, int toIndex)
        {
            if (fromIndex < 0 || fromIndex >= selectedFieldKeys.Count)
            {
                return false;
            }

            if (toIndex < 0 || toIndex > selectedFieldKeys.Count)
            {
                return false;
            }

            if (fromIndex == toIndex)
            {
                return true;
            }

            var key = selectedFieldKeys[fromIndex];
            selectedFieldKeys.RemoveAt(fromIndex);
            var insert = toIndex;
            if (insert > fromIndex)
            {
                insert--;
            }

            insert = System.Math.Max(0, System.Math.Min(insert, selectedFieldKeys.Count));
            selectedFieldKeys.Insert(insert, key);
            SetValue(ref selectedFieldKeys, new List<string>(selectedFieldKeys), nameof(SelectedFieldKeys), nameof(SelectedFieldCount));
            return true;
        }

        public bool EnableFieldAt(string key, int enabledInsertIndex)
        {
            if (!HoverFieldCatalog.IsKnownKey(key))
            {
                return false;
            }

            if (selectedFieldKeys.Contains(key))
            {
                return true;
            }

            var ins = System.Math.Max(0, System.Math.Min(enabledInsertIndex, selectedFieldKeys.Count));
            selectedFieldKeys.Insert(ins, key);
            SetValue(ref selectedFieldKeys, new List<string>(selectedFieldKeys), nameof(SelectedFieldKeys), nameof(SelectedFieldCount));
            return true;
        }

        public bool DisableFieldAt(int enabledIndex)
        {
            if (enabledIndex < 0 || enabledIndex >= selectedFieldKeys.Count)
            {
                return false;
            }

            selectedFieldKeys.RemoveAt(enabledIndex);
            if (selectedFieldKeys.Count == 0)
            {
                foreach (var d in FactoryDefaultSelectedKeys)
                {
                    selectedFieldKeys.Add(d);
                }
            }

            SetValue(ref selectedFieldKeys, new List<string>(selectedFieldKeys), nameof(SelectedFieldKeys), nameof(SelectedFieldCount));
            return true;
        }

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
                ApplyPersistedState(editSnapshot);
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

        private void ApplyPersistedState(GameHoverDetailsPersistedState saved)
        {
            if (saved == null)
            {
                return;
            }

            HoverWidth = saved.HoverWidth;
            ShowDelayMs = saved.ShowDelayMs;
            HoverFieldBlockSpacingDip = saved.HoverFieldBlockSpacingDip <= 0
                ? LegacyMissingFieldBlockSpacingDip
                : saved.HoverFieldBlockSpacingDip;
            HoverFieldColumnCount = saved.HoverFieldColumnCount == null || saved.HoverFieldColumnCount.Value <= 0
                ? DefaultFieldColumnCount
                : saved.HoverFieldColumnCount.Value;
            HoverContentPaddingDip = saved.HoverContentPaddingDip == null
                ? LegacyMissingContentPaddingDip
                : saved.HoverContentPaddingDip.Value;
            HoverDisabled = saved.HoverDisabled;
            HoverDisabledInFullscreen = saved.HoverDisabledInFullscreen ?? true;
            HideFieldTitlesInHover = saved.HideFieldTitlesInHover;
            ShowFieldInlineIconsInHover = saved.ShowFieldInlineIconsInHover;
            HideIconChipBackground = saved.HideIconChipBackground;
            HideFieldDividers = saved.HideFieldDividers ?? true;
            HidePanelBorder = saved.HidePanelBorder ?? false;
            HideEmptyFields = saved.HideEmptyFields ?? false;
            HoverBodyFontSize = saved.HoverBodyFontSize == null || saved.HoverBodyFontSize.Value <= 0
                ? LegacyMissingBodyFontSize
                : saved.HoverBodyFontSize.Value;
            HoverTitleFontSize = saved.HoverTitleFontSize == null || saved.HoverTitleFontSize.Value <= 0
                ? LegacyMissingTitleFontSize
                : saved.HoverTitleFontSize.Value;
            HoverIconStyle = saved.HoverIconStyle;
            HoverIconChipSizeDip = saved.HoverIconChipSizeDip == null || saved.HoverIconChipSizeDip.Value <= 0
                ? LegacyMissingIconChipSizeDip
                : saved.HoverIconChipSizeDip.Value;
            HoverIconChipPaddingDip = saved.HoverIconChipPaddingDip == null
                ? LegacyMissingIconChipPaddingDip
                : saved.HoverIconChipPaddingDip.Value;
            HoverIconChipShape = saved.HoverIconChipShape;
            HoverBackgroundStyle = saved.HoverBackgroundStyle;
            RunWithThemeHexSync(() =>
            {
                UseThemeChrome = saved.UseThemeChrome ?? true;
                HoverChromeBackgroundHex = HoverChromePalette.NormalizeHexOrDefault(
                    saved.HoverChromeBackgroundHex,
                    HoverChromePalette.DefaultFillHex);
                HoverChromeBorderHex = HoverChromePalette.NormalizeHexOrDefault(
                    saved.HoverChromeBorderHex,
                    HoverChromePalette.DefaultBorderHex);
                HoverChromeDividerHex = HoverChromePalette.NormalizeHexOrDefault(
                    string.IsNullOrWhiteSpace(saved.HoverChromeDividerHex)
                        ? saved.HoverChromeBorderHex
                        : saved.HoverChromeDividerHex,
                    HoverChromePalette.DefaultDividerHex);
                HoverChromeIconBackgroundHex = HoverChromePalette.NormalizeHexOrDefault(
                    saved.HoverChromeIconBackgroundHex,
                    HoverChromePalette.DefaultIconBackgroundHex);
            });
            HoverChromeBackgroundOpacity = saved.HoverChromeBackgroundOpacity == null
                ? DefaultChromeOpacity
                : saved.HoverChromeBackgroundOpacity.Value;
            SelectedFieldKeys = new List<string>(saved.SelectedFieldKeys ?? new List<string>(FactoryDefaultSelectedKeys));
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
                ShowFieldInlineIconsInHover = ShowFieldInlineIconsInHover,
                HideIconChipBackground = HideIconChipBackground,
                HideFieldDividers = HideFieldDividers,
                HidePanelBorder = HidePanelBorder,
                HideEmptyFields = HideEmptyFields,
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
            if (HoverWidth < MinWidth || HoverWidth > MaxWidth)
            {
                errors.Add($"Hover width must be between {MinWidth} and {MaxWidth} pixels.");
            }

            if (HoverFieldBlockSpacingDip < MinFieldBlockSpacingDip || HoverFieldBlockSpacingDip > MaxFieldBlockSpacingDip)
            {
                errors.Add($"Field spacing must be between {MinFieldBlockSpacingDip} and {MaxFieldBlockSpacingDip} pixels.");
            }

            if (HoverFieldColumnCount < MinFieldColumnCount || HoverFieldColumnCount > MaxFieldColumnCount)
            {
                errors.Add($"Field columns must be between {MinFieldColumnCount} and {MaxFieldColumnCount}.");
            }

            if (HoverContentPaddingDip < MinContentPaddingDip || HoverContentPaddingDip > MaxContentPaddingDip)
            {
                errors.Add($"List padding must be between {MinContentPaddingDip} and {MaxContentPaddingDip} pixels.");
            }

            if (HoverChromeBackgroundOpacity < MinChromeOpacity || HoverChromeBackgroundOpacity > MaxChromeOpacity)
            {
                errors.Add($"Background opacity must be between {MinChromeOpacity} and {MaxChromeOpacity} percent.");
            }

            if (HoverBodyFontSize < MinBodyFontSize || HoverBodyFontSize > MaxBodyFontSize)
            {
                errors.Add($"Regular text size must be between {MinBodyFontSize} and {MaxBodyFontSize}.");
            }

            if (HoverTitleFontSize < MinTitleFontSize || HoverTitleFontSize > MaxTitleFontSize)
            {
                errors.Add($"Title text size must be between {MinTitleFontSize} and {MaxTitleFontSize}.");
            }

            if (HoverIconChipSizeDip < MinIconChipSizeDip || HoverIconChipSizeDip > MaxIconChipSizeDip)
            {
                errors.Add($"Icon size must be between {MinIconChipSizeDip} and {MaxIconChipSizeDip} pixels.");
            }

            if (HoverIconChipPaddingDip < MinIconChipPaddingDip || HoverIconChipPaddingDip > MaxIconChipPaddingDip)
            {
                errors.Add($"Icon padding must be between {MinIconChipPaddingDip} and {MaxIconChipPaddingDip} pixels.");
            }

            if (!HoverChromePalette.TryParseHex(HoverChromeBackgroundHex, out _))
            {
                errors.Add("Hover background color is not a valid hex color.");
            }

            if (!HoverChromePalette.TryParseHex(HoverChromeBorderHex, out _))
            {
                errors.Add("Hover border color is not a valid hex color.");
            }

            if (!HoverChromePalette.TryParseHex(HoverChromeDividerHex, out _))
            {
                errors.Add("Hover divider color is not a valid hex color.");
            }

            if (!HoverChromePalette.TryParseHex(HoverChromeIconBackgroundHex, out _))
            {
                errors.Add("Hover icon background color is not a valid hex color.");
            }

            if (SelectedFieldKeys.Count == 0)
            {
                errors.Add("Select at least one field.");
            }

            return errors.Count == 0;
        }

        internal static string NormalizeIconChipShape(string value)
        {
            if (string.Equals(value, IconChipShapeRectangle, System.StringComparison.OrdinalIgnoreCase)
                || string.Equals(value, "Square", System.StringComparison.OrdinalIgnoreCase))
            {
                return IconChipShapeRectangle;
            }

            if (string.Equals(value, IconChipShapeRounded, System.StringComparison.OrdinalIgnoreCase)
                || string.Equals(value, "RoundedRectangle", System.StringComparison.OrdinalIgnoreCase))
            {
                return IconChipShapeRounded;
            }

            if (string.Equals(value, IconChipShapeSoftRounded, System.StringComparison.OrdinalIgnoreCase))
            {
                return IconChipShapeSoftRounded;
            }

            if (string.Equals(value, IconChipShapeSquircle, System.StringComparison.OrdinalIgnoreCase))
            {
                return IconChipShapeSquircle;
            }

            if (string.Equals(value, IconChipShapeArch, System.StringComparison.OrdinalIgnoreCase))
            {
                return IconChipShapeArch;
            }

            if (string.Equals(value, IconChipShapeTile, System.StringComparison.OrdinalIgnoreCase))
            {
                return IconChipShapeTile;
            }

            if (string.Equals(value, IconChipShapeLeaf, System.StringComparison.OrdinalIgnoreCase))
            {
                return IconChipShapeLeaf;
            }

            return IconChipShapeCircle;
        }

        internal static CornerRadius ResolveIconChipCornerRadius(string shape, double chipSize)
        {
            var half = chipSize / 2.0;
            if (half < 0)
            {
                half = 0;
            }

            switch (NormalizeIconChipShape(shape))
            {
                case IconChipShapeRectangle:
                    return new CornerRadius(0);
                case IconChipShapeRounded:
                    return new CornerRadius(System.Math.Max(3, chipSize * 0.18));
                case IconChipShapeSoftRounded:
                    return new CornerRadius(System.Math.Max(4, chipSize * 0.28));
                case IconChipShapeSquircle:
                    return new CornerRadius(System.Math.Max(6, chipSize * 0.38));
                case IconChipShapeArch:
                    return new CornerRadius(half, half, 0, 0);
                case IconChipShapeTile:
                    return new CornerRadius(0, 0, half, half);
                case IconChipShapeLeaf:
                    return new CornerRadius(half, 0, half, 0);
                default:
                    return new CornerRadius(half);
            }
        }

        private static int ClampIconChipPaddingDip(int v) => Clamp(v, MinIconChipPaddingDip, MaxIconChipPaddingDip);

        internal static string NormalizeIconStyle(string value)
        {
            if (string.Equals(value, IconStylePhosphor, System.StringComparison.OrdinalIgnoreCase))
            {
                return IconStylePhosphor;
            }

            if (string.Equals(value, IconStyleHugeIcons, System.StringComparison.OrdinalIgnoreCase)
                || string.Equals(value, "Huge", System.StringComparison.OrdinalIgnoreCase)
                || string.Equals(value, "Hugeicons", System.StringComparison.OrdinalIgnoreCase))
            {
                return IconStyleHugeIcons;
            }

            if (string.Equals(value, IconStyleSketchy, System.StringComparison.OrdinalIgnoreCase)
                || string.Equals(value, "SketchyIcons", System.StringComparison.OrdinalIgnoreCase))
            {
                return IconStyleSketchy;
            }

            if (string.Equals(value, IconStyleIconsax, System.StringComparison.OrdinalIgnoreCase)
                || string.Equals(value, "IconsaxBulk", System.StringComparison.OrdinalIgnoreCase))
            {
                return IconStyleIconsax;
            }

            if (string.Equals(value, IconStylePixelarticons, System.StringComparison.OrdinalIgnoreCase)
                || string.Equals(value, "PixelArtIcons", System.StringComparison.OrdinalIgnoreCase)
                || string.Equals(value, "pixelart-icons", System.StringComparison.OrdinalIgnoreCase))
            {
                return IconStylePixelarticons;
            }

            if (string.Equals(value, IconStylePixel, System.StringComparison.OrdinalIgnoreCase)
                || string.Equals(value, "PixelIconLibrary", System.StringComparison.OrdinalIgnoreCase)
                || string.Equals(value, "HackerNoon", System.StringComparison.OrdinalIgnoreCase))
            {
                return IconStylePixel;
            }

            return IconStyleUnicons;
        }

        private static double ClampBodyFontSize(double v) => Clamp(v, MinBodyFontSize, MaxBodyFontSize);

        private static double ClampTitleFontSize(double v) => Clamp(v, MinTitleFontSize, MaxTitleFontSize);

        private static int ClampIconChipSizeDip(int v) => Clamp(v, MinIconChipSizeDip, MaxIconChipSizeDip);

        private static string NormalizeBackgroundStyle(string value)
        {
            if (string.Equals(value, BackgroundStyleGameCover, System.StringComparison.OrdinalIgnoreCase)
                || string.Equals(value, "GameBackground", System.StringComparison.OrdinalIgnoreCase)
                || string.Equals(value, "Background", System.StringComparison.OrdinalIgnoreCase))
            {
                return BackgroundStyleGameCover;
            }

            return BackgroundStyleRegular;
        }

        private static int ClampWidth(int v) => Clamp(v, MinWidth, MaxWidth);

        private static int ClampShowDelayMs(int v) => Clamp(v, MinShowDelayMs, MaxShowDelayMs);

        private static int ClampFieldBlockSpacingDip(int v) => Clamp(v, MinFieldBlockSpacingDip, MaxFieldBlockSpacingDip);

        private static int ClampFieldColumnCount(int v) => Clamp(v, MinFieldColumnCount, MaxFieldColumnCount);

        private static int ClampContentPaddingDip(int v) => Clamp(v, MinContentPaddingDip, MaxContentPaddingDip);

        private static int ClampChromeOpacity(int v) => Clamp(v, MinChromeOpacity, MaxChromeOpacity);

        private static int Clamp(int v, int min, int max)
        {
            if (v < min)
            {
                return min;
            }

            return v > max ? max : v;
        }

        private static double Clamp(double v, double min, double max)
        {
            if (v < min)
            {
                return min;
            }

            return v > max ? max : v;
        }

        private static List<string> NormalizeKeys(List<string> keys)
        {
            var seen = new HashSet<string>();
            var list = new List<string>();
            foreach (var k in keys ?? new List<string>())
            {
                if (string.IsNullOrEmpty(k) || !HoverFieldCatalog.IsKnownKey(k) || seen.Contains(k))
                {
                    continue;
                }

                seen.Add(k);
                list.Add(k);
            }

            if (list.Count == 0)
            {
                return new List<string>(FactoryDefaultSelectedKeys);
            }

            return list;
        }

        private static bool ListsEqual(List<string> a, List<string> b)
        {
            if (ReferenceEquals(a, b))
            {
                return true;
            }

            if (a == null || b == null || a.Count != b.Count)
            {
                return false;
            }

            for (var i = 0; i < a.Count; i++)
            {
                if (!string.Equals(a[i], b[i], System.StringComparison.Ordinal))
                {
                    return false;
                }
            }

            return true;
        }
    }
}
