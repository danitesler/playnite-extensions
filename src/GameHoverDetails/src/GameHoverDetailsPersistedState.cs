using System.Collections.Generic;

namespace GameHoverDetails
{
    /// <summary>
    /// JSON shape for Playnite plugin settings save/load.
    /// Only canonical fields — no inverse UI bindings — so legacy JSON with duplicate keys cannot corrupt booleans.
    /// </summary>
    public sealed class GameHoverDetailsPersistedState
    {
        public int HoverWidth { get; set; }
        public int ShowDelayMs { get; set; }
        public int HoverFieldBlockSpacingDip { get; set; }
        /// <summary>Null in legacy JSON — treated as 1 (single column).</summary>
        public int? HoverFieldColumnCount { get; set; }
        /// <summary>Null in legacy JSON — treated as 14.</summary>
        public int? HoverContentPaddingDip { get; set; }
        public bool HoverDisabled { get; set; }
        /// <summary>Null in legacy JSON — treated as true (off in Fullscreen).</summary>
        public bool? HoverDisabledInFullscreen { get; set; }
        public bool HideFieldTitlesInHover { get; set; }
        public bool ShowFieldInlineIconsInHover { get; set; }
        /// <summary>When true, field icon chips have no fill (glyph only).</summary>
        public bool HideIconChipBackground { get; set; }
        /// <summary>When true, no 1px line between field blocks (spacing stays). Null in legacy JSON — treated as true (off).</summary>
        public bool? HideFieldDividers { get; set; }
        /// <summary>When true, hover panel has no outline. Null in legacy JSON — treated as false (on).</summary>
        public bool? HidePanelBorder { get; set; }
        /// <summary>When true, field blocks with no value are omitted. Null in legacy JSON — treated as false.</summary>
        public bool? HideEmptyFields { get; set; }
        /// <summary>Null in legacy JSON — treated as 13.</summary>
        public double? HoverBodyFontSize { get; set; }
        /// <summary>Null in legacy JSON — treated as 10.5.</summary>
        public double? HoverTitleFontSize { get; set; }
        /// <summary>Null in legacy JSON — treated as Unicons. Values: Phosphor, Unicons, HugeIcons.</summary>
        public string HoverIconStyle { get; set; }
        /// <summary>Null in legacy JSON — treated as 32.</summary>
        public int? HoverIconChipSizeDip { get; set; }
        /// <summary>Null in legacy JSON — treated as 8.</summary>
        public int? HoverIconChipPaddingDip { get; set; }
        /// <summary>Null in legacy JSON — treated as Circle. Values: Circle, Rectangle, Rounded, SoftRounded, Squircle, Arch, Tile, Leaf.</summary>
        public string HoverIconChipShape { get; set; }
        /// <summary>Null in legacy JSON — treated as true (Playnite theme chrome).</summary>
        public bool? UseThemeChrome { get; set; }
        /// <summary>Null in legacy JSON — treated as Regular. Values: Regular, GameCover.</summary>
        public string HoverBackgroundStyle { get; set; }
        public string HoverChromeBackgroundHex { get; set; }
        public string HoverChromeBorderHex { get; set; }
        public string HoverChromeDividerHex { get; set; }
        /// <summary>Legacy JSON only — no longer written. Icons always use Playnite TextBrush.</summary>
        public string HoverChromeIconHex { get; set; }
        public string HoverChromeIconBackgroundHex { get; set; }
        /// <summary>Legacy JSON only — no longer written. Text always uses Playnite TextBrush.</summary>
        public string HoverChromeTextHex { get; set; }
        /// <summary>Null in legacy JSON — treated as 100. Zero is a valid saved value.</summary>
        public int? HoverChromeBackgroundOpacity { get; set; }
        public List<string> SelectedFieldKeys { get; set; }
        /// <summary>Legacy JSON only — no longer written. Add-field order is catalog minus selected.</summary>
        public List<string> DisabledFieldKeysOrder { get; set; }
    }
}
