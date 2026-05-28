using System.Collections.Generic;
using Playnite.SDK;
using Playnite.SDK.Data;

namespace Autogrid
{
    public enum GridSizingMode
    {
        Columns,
        Rows
    }

    public class AutogridSettings : ObservableObject, ISettings
    {
        [DontSerialize]
        private readonly AutogridPlugin plugin;

        private bool enabled = true;
        public bool Enabled
        {
            get => enabled;
            set => SetValue(ref enabled, value);
        }

        private GridSizingMode sizingMode = GridSizingMode.Columns;
        public GridSizingMode SizingMode
        {
            get => sizingMode;
            set => SetValue(ref sizingMode, value);
        }

        private int targetColumns = 8;
        public int TargetColumns
        {
            get => targetColumns;
            set => SetValue(ref targetColumns, value);
        }

        private int targetRows = 4;
        public int TargetRows
        {
            get => targetRows;
            set => SetValue(ref targetRows, value);
        }

        private int viewportAdjustPx;
        public int ViewportAdjustPx
        {
            get => viewportAdjustPx;
            set => SetValue(ref viewportAdjustPx, ClampViewportAdjust(value));
        }

        private bool enabledOriginal;
        private GridSizingMode sizingModeOriginal;
        private int targetColumnsOriginal;
        private int targetRowsOriginal;
        private int viewportAdjustPxOriginal;

        public AutogridSettings()
        {
        }

        public AutogridSettings(AutogridPlugin plugin) : this()
        {
            this.plugin = plugin;
            var saved = plugin.LoadPluginSettings<AutogridSettings>();
            if (saved != null)
            {
                Enabled = saved.Enabled;
                SizingMode = saved.SizingMode;
                TargetColumns = saved.TargetColumns;
                TargetRows = saved.TargetRows;
                ViewportAdjustPx = saved.ViewportAdjustPx;
            }

            TargetColumns = System.Math.Max(1, System.Math.Min(20, TargetColumns));
            TargetRows = System.Math.Max(1, System.Math.Min(10, TargetRows));
            viewportAdjustPx = ClampViewportAdjust(viewportAdjustPx);
        }

        private static int ClampViewportAdjust(int v)
        {
            return System.Math.Max(-200, System.Math.Min(200, v));
        }

        public void BeginEdit()
        {
            enabledOriginal = Enabled;
            sizingModeOriginal = SizingMode;
            targetColumnsOriginal = TargetColumns;
            targetRowsOriginal = TargetRows;
            viewportAdjustPxOriginal = ViewportAdjustPx;
        }

        public void CancelEdit()
        {
            Enabled = enabledOriginal;
            SizingMode = sizingModeOriginal;
            TargetColumns = targetColumnsOriginal;
            TargetRows = targetRowsOriginal;
            ViewportAdjustPx = viewportAdjustPxOriginal;
        }

        public void EndEdit()
        {
            ViewportAdjustPx = ClampViewportAdjust(ViewportAdjustPx);
            TargetColumns = System.Math.Max(1, System.Math.Min(20, TargetColumns));
            TargetRows = System.Math.Max(1, System.Math.Min(10, TargetRows));
            plugin.SavePluginSettings(this);
        }

        public bool VerifySettings(out List<string> errors)
        {
            errors = new List<string>();
            if (TargetColumns < 1 || TargetColumns > 20)
            {
                errors.Add("Target columns must be between 1 and 20.");
            }

            if (TargetRows < 1 || TargetRows > 10)
            {
                errors.Add("Target rows must be between 1 and 10.");
            }

            if (ViewportAdjustPx < -200 || ViewportAdjustPx > 200)
            {
                errors.Add("Viewport adjust must be between -200 and 200 pixels.");
            }

            return errors.Count == 0;
        }
    }
}
