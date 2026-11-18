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

        public IReadOnlyList<string> GetOrderedSelectedKeys()
        {
            return selectedFieldKeys.Where(HoverFieldCatalog.IsKnownKey).ToList();
        }

        internal bool ApplyFieldPreset(string presetId)
        {
            var preset = HoverFieldPresets.All.FirstOrDefault(p => p.Id == presetId);
            if (preset == null)
            {
                return false;
            }

            SelectedFieldKeys = new List<string>(preset.FieldKeys);
            return true;
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
    }
}
