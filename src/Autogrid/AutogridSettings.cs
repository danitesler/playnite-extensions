using System.Collections.Generic;
using Playnite.SDK;
using Playnite.SDK.Data;

namespace Autogrid
{
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

        private int targetColumns = 8;
        public int TargetColumns
        {
            get => targetColumns;
            set => SetValue(ref targetColumns, value);
        }

        private int viewportAdjustPx;
        public int ViewportAdjustPx
        {
            get => viewportAdjustPx;
            set => SetValue(ref viewportAdjustPx, ClampViewportAdjust(value));
        }

        private bool logDebugMeasurements;
        public bool LogDebugMeasurements
        {
            get => logDebugMeasurements;
            set => SetValue(ref logDebugMeasurements, value);
        }

        private bool enabledOriginal;
        private int targetColumnsOriginal;
        private int viewportAdjustPxOriginal;
        private bool logDebugMeasurementsOriginal;

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
                TargetColumns = saved.TargetColumns;
                ViewportAdjustPx = saved.ViewportAdjustPx;
                LogDebugMeasurements = saved.LogDebugMeasurements;
            }

            TargetColumns = System.Math.Max(1, System.Math.Min(20, TargetColumns));
            viewportAdjustPx = ClampViewportAdjust(viewportAdjustPx);
        }

        private static int ClampViewportAdjust(int v)
        {
            return System.Math.Max(-200, System.Math.Min(200, v));
        }

        public void BeginEdit()
        {
            enabledOriginal = Enabled;
            targetColumnsOriginal = TargetColumns;
            viewportAdjustPxOriginal = ViewportAdjustPx;
            logDebugMeasurementsOriginal = LogDebugMeasurements;
        }

        public void CancelEdit()
        {
            Enabled = enabledOriginal;
            TargetColumns = targetColumnsOriginal;
            ViewportAdjustPx = viewportAdjustPxOriginal;
            LogDebugMeasurements = logDebugMeasurementsOriginal;
        }

        public void EndEdit()
        {
            ViewportAdjustPx = ClampViewportAdjust(ViewportAdjustPx);
            plugin.SavePluginSettings(this);
        }

        public bool VerifySettings(out List<string> errors)
        {
            errors = new List<string>();
            if (TargetColumns < 1 || TargetColumns > 20)
            {
                errors.Add("Target columns must be between 1 and 20.");
            }

            if (ViewportAdjustPx < -200 || ViewportAdjustPx > 200)
            {
                errors.Add("Viewport adjust must be between -200 and 200 pixels.");
            }

            return errors.Count == 0;
        }
    }
}
