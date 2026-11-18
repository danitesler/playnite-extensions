using System;
using System.Reflection;
using System.Runtime.InteropServices;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Controls.Primitives;
using System.Windows.Documents;
using System.Windows.Input;
using System.Windows.Interop;
using System.Windows.Media;
using System.Windows.Media.Media3D;
using System.Windows.Media.Animation;
using System.Windows.Media.Effects;
using System.Windows.Media.Imaging;
using System.Windows.Threading;
using Playnite.SDK;
using Playnite.SDK.Models;


namespace GameHoverDetails
{
    internal sealed partial class GameHoverDetailsHoverService
    {
        private void ApplicationOnDeactivated(object sender, EventArgs e)
        {
            ClearContextMenuSuppress();
            HidePopupForForegroundLoss();
        }

        private void MainWindowOnDeactivated(object sender, EventArgs e)
        {
            // In-app plugin/dialog windows deactivate MainWindow but not Application.
            ClearContextMenuSuppress();
            HidePopupForForegroundLoss();
        }

        private void MainWindowOnStateChanged(object sender, EventArgs e)
        {
            if (mainWindow.WindowState == WindowState.Minimized)
            {
                ClearContextMenuSuppress();
                HidePopupForForegroundLoss();
            }
        }

        private void MainWindowOnContextMenuOpening(object sender, ContextMenuEventArgs e)
        {
            if (e.Handled)
            {
                return;
            }

            contextMenuOpen = true;
            contextMenuSeenOpen = false;
            contextMenuOpenedAtUtc = DateTime.UtcNow;
            openLibraryContextMenu = TryGetContextMenu(e);
            HidePopupForForegroundLoss();
        }

        private void MainWindowOnContextMenuClosing(object sender, ContextMenuEventArgs e)
        {
            ClearContextMenuSuppress();
        }

        private void ClearContextMenuSuppress()
        {
            contextMenuOpen = false;
            contextMenuSeenOpen = false;
            openLibraryContextMenu = null;
        }

        /// <summary>
        /// Hover is for the library under the pointer. Block only while a game context menu is open,
        /// or while another window of this process (plugin dialog) is active or in the foreground.
        /// Do not require MainWindow.IsActive — leaving Playnite and mousing back must work.
        /// </summary>
        private bool ShouldBlockHover()
        {
            return settings.IsHoverSuppressed()
                || IsLibraryContextMenuBlocking()
                || HasOtherApplicationWindowActive()
                || IsOtherInProcessWindowForeground();
        }

        private bool IsLibraryContextMenuBlocking()
        {
            if (!contextMenuOpen)
            {
                return false;
            }

            // ContextMenuClosing does not always fire (Escape, click-through, menu rebuilt by a
            // plugin). Without this bound the hover would stay blocked until Playnite restarts.
            var elapsedMs = (DateTime.UtcNow - contextMenuOpenedAtUtc).TotalMilliseconds;
            if (elapsedMs > ContextMenuSuppressMaxMs)
            {
                ClearContextMenuSuppress();
                return false;
            }

            var menu = openLibraryContextMenu;
            if (menu != null)
            {
                try
                {
                    if (menu.IsOpen)
                    {
                        contextMenuSeenOpen = true;
                        return true;
                    }
                }
                catch
                {
                    ClearContextMenuSuppress();
                    return false;
                }
            }

            if (contextMenuSeenOpen)
            {
                // Closed without ContextMenuClosing (common when the pointer leaves Playnite).
                ClearContextMenuSuppress();
                return false;
            }

            // Never reported open: the opening was cancelled, or the menu could not be resolved.
            // Hold hover only for the moment WPF needs to show it, not for the full timeout.
            if (elapsedMs > ContextMenuOpenGraceMs)
            {
                ClearContextMenuSuppress();
                return false;
            }

            return true;
        }

        private bool HasOtherApplicationWindowActive()
        {
            var app = Application.Current;
            if (app == null)
            {
                return false;
            }

            try
            {
                foreach (Window window in app.Windows)
                {
                    if (window == null || ReferenceEquals(window, mainWindow))
                    {
                        continue;
                    }

                    if (window.IsActive && window.IsVisible)
                    {
                        return true;
                    }
                }
            }
            catch
            {
                return false;
            }

            return false;
        }

        /// <summary>
        /// Catches in-process windows that never reach <see cref="Application.Windows"/> (plugin
        /// dialogs hosting WinForms/native content). Windows owned by *other* processes must not
        /// block: leaving Playnite and mousing back over a tile has to keep working.
        /// </summary>
        private bool IsOtherInProcessWindowForeground()
        {
            try
            {
                var foreground = GetForegroundWindow();
                if (foreground == IntPtr.Zero)
                {
                    return false;
                }

                if (foreground == new WindowInteropHelper(mainWindow).Handle)
                {
                    return false;
                }

                var wpfSource = HwndSource.FromHwnd(foreground);
                if (wpfSource != null)
                {
                    // Ours, and identifiable: only real windows count. Popup HWNDs (this hover,
                    // tooltips, menus, combo drop-downs) would otherwise make the panel hide and
                    // re-show itself in a loop.
                    return wpfSource.RootVisual is Window window
                        && !ReferenceEquals(window, mainWindow)
                        && window.IsVisible;
                }

                int processId;
                GetWindowThreadProcessId(foreground, out processId);
                return processId == CurrentProcessId;
            }
            catch
            {
                return false;
            }
        }

        private static ContextMenu TryGetContextMenu(ContextMenuEventArgs e)
        {
            if (e == null)
            {
                return null;
            }

            if (e.Source is ContextMenu fromSource)
            {
                return fromSource;
            }

            if (e.OriginalSource is ContextMenu fromOriginal)
            {
                return fromOriginal;
            }

            var fe = e.Source as FrameworkElement ?? e.OriginalSource as FrameworkElement;
            if (fe?.ContextMenu != null)
            {
                return fe.ContextMenu;
            }

            for (var current = e.OriginalSource as DependencyObject; current != null; current = GetTreeParent(current))
            {
                if (current is ContextMenu menu)
                {
                    return menu;
                }

                if (current is FrameworkElement currentFe && currentFe.ContextMenu != null)
                {
                    return currentFe.ContextMenu;
                }
            }

            return null;
        }

        private void HidePopupForForegroundLoss()
        {
            if (broken)
            {
                return;
            }

            try
            {
                hideDebounceTimer?.Stop();
                HidePopup();
            }
            catch (Exception ex)
            {
                HandleHoverError(ex);
            }
        }

        [DllImport("user32.dll", ExactSpelling = true)]
        private static extern IntPtr GetForegroundWindow();

        [DllImport("user32.dll", ExactSpelling = true)]
        private static extern int GetWindowThreadProcessId(IntPtr hWnd, out int processId);

        private static readonly int CurrentProcessId = System.Diagnostics.Process.GetCurrentProcess().Id;
    }
}
