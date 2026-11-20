using System;
using System.Globalization;
using System.Windows.Data;

namespace Autogrid
{
    public sealed class AutogridModeToBoolConverter : IValueConverter
    {
        public AutogridMode TargetMode { get; set; }

        public object Convert(object value, Type targetType, object parameter, CultureInfo culture)
        {
            return value is AutogridMode mode && mode == TargetMode;
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
