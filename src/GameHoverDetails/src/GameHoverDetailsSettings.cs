using System.Collections.Generic;
using System.Linq;
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
        private const int DefaultFieldBlockSpacingDip = 11;

        private static readonly string[] FactoryDefaultSelectedKeys = { "Icon", "Name", "LastPlayed" };

        [DontSerialize]
        private GameHoverDetailsPlugin plugin;

        private int hoverWidth = 360;
        private int showDelayMs;
        private int hoverFieldBlockSpacingDip = DefaultFieldBlockSpacingDip;
        private bool hoverDisabled;
        private bool hideFieldTitlesInHover;
        private bool showFieldInlineIconsInHover;
        private List<string> selectedFieldKeys = new List<string>(FactoryDefaultSelectedKeys);
        private List<string> disabledFieldKeysOrder = new List<string>();

        private int hoverWidthOriginal;
        private int showDelayMsOriginal;
        private int hoverFieldBlockSpacingDipOriginal;
        private bool hoverDisabledOriginal;
        private bool hideFieldTitlesInHoverOriginal;
        private bool showFieldInlineIconsInHoverOriginal;
        private List<string> selectedFieldKeysOriginal;
        private List<string> disabledFieldKeysOrderOriginal;

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

        /// <summary>When true, hover popups are turned off (persisted; default false for existing installs).</summary>
        public bool HoverDisabled
        {
            get => hoverDisabled;
            set => SetValue(ref hoverDisabled, value, nameof(HoverDisabled), nameof(HoverDetailsEnabled));
        }

        /// <summary>UI binding for "Enable hover details" (inverse of <see cref="HoverDisabled"/>).</summary>
        /// <remarks>Not serialized — persists via <see cref="HoverDisabled"/> only. Dual properties deserialize in arbitrary order and could corrupt the backing field.</remarks>
        [DontSerialize]
        public bool HoverDetailsEnabled
        {
            get => !hoverDisabled;
            set => HoverDisabled = !value;
        }

        /// <summary>When true, field labels (e.g. Publisher) are hidden in the hover panel.</summary>
        public bool HideFieldTitlesInHover
        {
            get => hideFieldTitlesInHover;
            set => SetValue(ref hideFieldTitlesInHover, value, nameof(HideFieldTitlesInHover), nameof(HoverTitlesInHover));
        }

        /// <summary>UI binding for "Show field titles in hover".</summary>
        /// <remarks>Not serialized — persists via <see cref="HideFieldTitlesInHover"/> only.</remarks>
        [DontSerialize]
        public bool HoverTitlesInHover
        {
            get => !hideFieldTitlesInHover;
            set => HideFieldTitlesInHover = !value;
        }

        /// <summary>When true, show a catalog icon beside text values (not used for cover/icon/background rows or platform icon strip).</summary>
        public bool ShowFieldInlineIconsInHover
        {
            get => showFieldInlineIconsInHover;
            set => SetValue(ref showFieldInlineIconsInHover, value, nameof(ShowFieldInlineIconsInHover));
        }

        public List<string> SelectedFieldKeys
        {
            get => selectedFieldKeys;
            set
            {
                var norm = NormalizeKeys(value ?? new List<string>());
                SetValue(ref selectedFieldKeys, norm, nameof(SelectedFieldKeys), nameof(SelectedFieldCount));
                CoalesceDisabledOrder();
            }
        }

        /// <summary>All non-enabled catalog keys, in UI order (for disabled list).</summary>
        public List<string> DisabledFieldKeysOrder
        {
            get => disabledFieldKeysOrder;
            set
            {
                disabledFieldKeysOrder = value ?? new List<string>();
                CoalesceDisabledOrder();
            }
        }

        [DontSerialize]
        public int SelectedFieldCount => selectedFieldKeys.Count;

        internal IPlayniteAPI TryGetPlayniteApi() => plugin?.GetPlayniteApi();

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
                    ? DefaultFieldBlockSpacingDip
                    : ClampFieldBlockSpacingDip(saved.HoverFieldBlockSpacingDip);
                hoverDisabled = saved.HoverDisabled;
                hideFieldTitlesInHover = saved.HideFieldTitlesInHover;
                showFieldInlineIconsInHover = saved.ShowFieldInlineIconsInHover;
                selectedFieldKeys = NormalizeKeys(saved.SelectedFieldKeys ?? new List<string>());
                disabledFieldKeysOrder = saved.DisabledFieldKeysOrder != null
                    ? new List<string>(saved.DisabledFieldKeysOrder)
                    : new List<string>();
            }

            CoalesceDisabledOrder();
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
            CoalesceDisabledOrder();
            return true;
        }

        public bool MoveDisabled(int fromIndex, int toIndex)
        {
            if (fromIndex < 0 || fromIndex >= disabledFieldKeysOrder.Count)
            {
                return false;
            }

            if (toIndex < 0 || toIndex > disabledFieldKeysOrder.Count)
            {
                return false;
            }

            if (fromIndex == toIndex)
            {
                return true;
            }

            var key = disabledFieldKeysOrder[fromIndex];
            disabledFieldKeysOrder.RemoveAt(fromIndex);
            var insert = toIndex;
            if (insert > fromIndex)
            {
                insert--;
            }

            insert = System.Math.Max(0, System.Math.Min(insert, disabledFieldKeysOrder.Count));
            disabledFieldKeysOrder.Insert(insert, key);
            SetValue(ref disabledFieldKeysOrder, new List<string>(disabledFieldKeysOrder), nameof(DisabledFieldKeysOrder));
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

            // Key is not selected; it should appear in the disabled pool after Coalesce, but tolerate
            // legacy or inconsistent state (still list it in GetAddableKeys) instead of failing the add.
            disabledFieldKeysOrder.Remove(key);

            var ins = System.Math.Max(0, System.Math.Min(enabledInsertIndex, selectedFieldKeys.Count));
            selectedFieldKeys.Insert(ins, key);
            SetValue(ref selectedFieldKeys, new List<string>(selectedFieldKeys), nameof(SelectedFieldKeys), nameof(SelectedFieldCount));
            CoalesceDisabledOrder();
            return true;
        }

        public bool DisableFieldAt(int enabledIndex, int disabledInsertIndex)
        {
            if (enabledIndex < 0 || enabledIndex >= selectedFieldKeys.Count)
            {
                return false;
            }

            var key = selectedFieldKeys[enabledIndex];
            selectedFieldKeys.RemoveAt(enabledIndex);
            var ins = System.Math.Max(0, System.Math.Min(disabledInsertIndex, disabledFieldKeysOrder.Count));
            disabledFieldKeysOrder.Insert(ins, key);
            if (selectedFieldKeys.Count == 0)
            {
                foreach (var d in FactoryDefaultSelectedKeys)
                {
                    selectedFieldKeys.Add(d);
                    disabledFieldKeysOrder.Remove(d);
                }
            }

            SetValue(ref selectedFieldKeys, new List<string>(selectedFieldKeys), nameof(SelectedFieldKeys), nameof(SelectedFieldCount));
            CoalesceDisabledOrder();
            return true;
        }

        public void BeginEdit()
        {
            hoverWidthOriginal = HoverWidth;
            showDelayMsOriginal = ShowDelayMs;
            hoverFieldBlockSpacingDipOriginal = HoverFieldBlockSpacingDip;
            hoverDisabledOriginal = HoverDisabled;
            hideFieldTitlesInHoverOriginal = HideFieldTitlesInHover;
            showFieldInlineIconsInHoverOriginal = ShowFieldInlineIconsInHover;
            selectedFieldKeysOriginal = new List<string>(SelectedFieldKeys);
            disabledFieldKeysOrderOriginal = new List<string>(DisabledFieldKeysOrder);
        }

        public void CancelEdit()
        {
            HoverWidth = hoverWidthOriginal;
            ShowDelayMs = showDelayMsOriginal;
            HoverFieldBlockSpacingDip = hoverFieldBlockSpacingDipOriginal;
            HoverDisabled = hoverDisabledOriginal;
            HideFieldTitlesInHover = hideFieldTitlesInHoverOriginal;
            ShowFieldInlineIconsInHover = showFieldInlineIconsInHoverOriginal;
            SelectedFieldKeys = new List<string>(selectedFieldKeysOriginal ?? new List<string>(FactoryDefaultSelectedKeys));
            DisabledFieldKeysOrder = new List<string>(disabledFieldKeysOrderOriginal ?? new List<string>());
        }

        public void EndEdit()
        {
            HoverWidth = ClampWidth(HoverWidth);
            ShowDelayMs = ClampShowDelayMs(ShowDelayMs);
            HoverFieldBlockSpacingDip = ClampFieldBlockSpacingDip(HoverFieldBlockSpacingDip);
            SelectedFieldKeys = NormalizeKeys(SelectedFieldKeys);
            CoalesceDisabledOrder();
            plugin.SavePluginSettings(ToPersistedState());
        }

        private GameHoverDetailsPersistedState ToPersistedState()
        {
            return new GameHoverDetailsPersistedState
            {
                HoverWidth = HoverWidth,
                ShowDelayMs = ShowDelayMs,
                HoverFieldBlockSpacingDip = HoverFieldBlockSpacingDip,
                HoverDisabled = HoverDisabled,
                HideFieldTitlesInHover = HideFieldTitlesInHover,
                ShowFieldInlineIconsInHover = ShowFieldInlineIconsInHover,
                SelectedFieldKeys = new List<string>(SelectedFieldKeys),
                DisabledFieldKeysOrder = new List<string>(DisabledFieldKeysOrder)
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

            if (SelectedFieldKeys.Count == 0)
            {
                errors.Add("Select at least one field.");
            }

            return errors.Count == 0;
        }

        private static int ClampWidth(int v)
        {
            if (v < MinWidth)
            {
                return MinWidth;
            }

            return v > MaxWidth ? MaxWidth : v;
        }

        private static int ClampShowDelayMs(int v)
        {
            if (v < MinShowDelayMs)
            {
                return MinShowDelayMs;
            }

            return v > MaxShowDelayMs ? MaxShowDelayMs : v;
        }

        private static int ClampFieldBlockSpacingDip(int v)
        {
            if (v < MinFieldBlockSpacingDip)
            {
                return MinFieldBlockSpacingDip;
            }

            return v > MaxFieldBlockSpacingDip ? MaxFieldBlockSpacingDip : v;
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

        private void CoalesceDisabledOrder()
        {
            var all = HoverFieldCatalog.GetAllKeysInCatalogOrder();
            var enabled = new HashSet<string>(selectedFieldKeys);
            var next = new List<string>();
            foreach (var k in disabledFieldKeysOrder)
            {
                if (HoverFieldCatalog.IsKnownKey(k) && !enabled.Contains(k) && !next.Contains(k))
                {
                    next.Add(k);
                }
            }

            foreach (var k in all)
            {
                if (!enabled.Contains(k) && !next.Contains(k))
                {
                    next.Add(k);
                }
            }

            SetValue(ref disabledFieldKeysOrder, next, nameof(DisabledFieldKeysOrder));
        }
    }
}
