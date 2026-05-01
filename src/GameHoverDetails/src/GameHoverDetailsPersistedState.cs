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
        public bool HoverDisabled { get; set; }
        public bool HideFieldTitlesInHover { get; set; }
        public bool ShowFieldInlineIconsInHover { get; set; }
        public List<string> SelectedFieldKeys { get; set; }
        public List<string> DisabledFieldKeysOrder { get; set; }
    }
}
