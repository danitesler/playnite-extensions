using System;
using System.Globalization;
using System.Windows.Data;

namespace Autogrid
{
    public sealed class GridSizingModeToBoolConverter : IValueConverter
    {
        public GridSizingMode TargetMode { get; set; }

        public object Convert(object value, Type targetType, object parameter, CultureInfo culture)
        {
            return value is GridSizingMode mode && mode == TargetMode;
        }

        public object ConvertBack(object value, Type targetType, object parameter, CultureInfo culture)
        {
            if (value is bool isChecked && isChecked)
            {
                return TargetMode;
            }

            return Binding.DoNothing;
        }
    }
}
