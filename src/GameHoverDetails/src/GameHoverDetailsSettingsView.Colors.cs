using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Linq;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Input;
using System.Windows.Media;
using System.Windows.Threading;
using Playnite.SDK;
using Playnite.SDK.Models;


namespace GameHoverDetails
{
    public partial class GameHoverDetailsSettingsView
    {
        private void BackgroundSwatch_Click(object sender, RoutedEventArgs e) =>
            PickChromeColor(s => s.HoverChromeBackgroundHex, (s, hex) => s.HoverChromeBackgroundHex = hex);

        private void BorderSwatch_Click(object sender, RoutedEventArgs e) =>
            PickChromeColor(s => s.HoverChromeBorderHex, (s, hex) => s.HoverChromeBorderHex = hex);

        private void DividerSwatch_Click(object sender, RoutedEventArgs e) =>
            PickChromeColor(s => s.HoverChromeDividerHex, (s, hex) => s.HoverChromeDividerHex = hex);

        private void IconBackgroundSwatch_Click(object sender, RoutedEventArgs e) =>
            PickChromeColor(s => s.HoverChromeIconBackgroundHex, (s, hex) => s.HoverChromeIconBackgroundHex = hex);

        private void PickChromeColor(
            Func<GameHoverDetailsSettings, string> getHex,
            Action<GameHoverDetailsSettings, string> setHex)
        {
            if (boundSettings != null && TryPickHexColor(getHex(boundSettings), out var hex))
            {
                setHex(boundSettings, hex);
            }
        }

        private void ResetChromeColors_Click(object sender, RoutedEventArgs e)
        {
            boundSettings?.ResetCustomChromeColors();
        }

        private static bool TryPickHexColor(string currentHex, out string hex)
        {
            hex = null;
            if (!HoverChromePalette.TryParseHex(currentHex, out var wpf))
            {
                wpf = HoverChromePalette.FallbackFillColor;
            }

            using (var dlg = new System.Windows.Forms.ColorDialog())
            {
                dlg.AllowFullOpen = true;
                dlg.FullOpen = true;
                dlg.Color = System.Drawing.Color.FromArgb(wpf.R, wpf.G, wpf.B);
                if (dlg.ShowDialog() != System.Windows.Forms.DialogResult.OK)
                {
                    return false;
                }

                var picked = dlg.Color;
                hex = HoverChromePalette.ToHex(Color.FromRgb(picked.R, picked.G, picked.B));
                return true;
            }
        }
    }
}
