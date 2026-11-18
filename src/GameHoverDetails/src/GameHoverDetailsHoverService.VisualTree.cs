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
        /// <summary>
        /// Keyboard/gamepad focus should open the hover only when the user navigated onto a tile.
        /// Restoring the window (minimize/maximize, alt-tab) puts focus back on the selected tile
        /// with no key and no previous tile — that must not open the hover. A click, a menu closing
        /// back onto the tile, or the pointer already sitting on that tile stays on the pointer path.
        /// </summary>
        internal static bool ShouldFollowKeyboardFocus(
            bool mouseButtonDown,
            bool oldFocusInsideMenu,
            bool newFocusIsGameTile,
            bool pointerOnSameGame,
            bool movedFromAnotherTile,
            bool navigationKeyDown)
        {
            return newFocusIsGameTile
                && !mouseButtonDown
                && !oldFocusInsideMenu
                && !pointerOnSameGame
                && (movedFromAnotherTile || navigationKeyDown);
        }

        /// <summary>
        /// Game list tile that currently has keyboard focus, while keyboard-follow is the active source.
        /// A selected tile that merely retained focus after a click does not count.
        /// </summary>
        private bool TryGetKeyboardFollowTarget(out Game game, out FrameworkElement anchor)
        {
            game = null;
            anchor = null;
            if (!keyboardFollowActive)
            {
                return false;
            }

            return TryResolveFocusedGameTile(Keyboard.FocusedElement as DependencyObject, out game, out anchor);
        }

        /// <summary>
        /// List item under keyboard focus. The details pane also carries a <see cref="Game"/> data context
        /// and must not open a hover; only a <see cref="ListBoxItem"/> tile/row counts. Playnite's grid,
        /// list, and fullscreen browser all focus those containers (arrow keys and gamepad).
        /// </summary>
        internal static bool TryResolveFocusedGameTile(DependencyObject focus, out Game game, out FrameworkElement anchor)
        {
            game = null;
            anchor = null;
            if (focus == null || IsHitOnMenu(focus))
            {
                return false;
            }

            for (var current = focus; current != null; current = GetTreeParent(current))
            {
                if (!(current is ListBoxItem item))
                {
                    continue;
                }

                var resolved = TryGetGameFromDataContext(item.DataContext);
                if (resolved == null)
                {
                    continue;
                }

                game = resolved;
                anchor = item;
                return true;
            }

            return false;
        }

        /// <summary>
        /// Outer-most visual ancestor that still carries the same game (stable anchor). Outside grid view,
        /// suppresses hover when the pointer is on an embedded ButtonBase under that host (play/info/toggles).
        /// Grid view keeps the hover so moving from cover to those icons does not dismiss the popup.
        /// </summary>
        private static void TryResolveGameAndAnchor(DependencyObject hit, IPlayniteAPI api, out Game game, out FrameworkElement anchor)
        {
            game = null;
            anchor = null;
            if (hit == null)
            {
                return;
            }

            if (IsHitOnMenu(hit))
            {
                return;
            }

            Game resolvedGame = null;
            FrameworkElement outerGameFe = null;
            for (var current = hit; current != null; current = GetTreeParent(current))
            {
                if (!(current is FrameworkElement fe))
                {
                    continue;
                }

                var g = TryGetGameFromDataContext(fe.DataContext);
                if (g == null)
                {
                    continue;
                }

                if (resolvedGame == null)
                {
                    resolvedGame = g;
                    outerGameFe = fe;
                }
                else if (resolvedGame.Id == g.Id)
                {
                    outerGameFe = fe;
                }
                else
                {
                    break;
                }
            }

            if (resolvedGame == null || outerGameFe == null)
            {
                return;
            }

            if (!IsGridDesktopView(api))
            {
                for (var current = hit; current != null; current = GetTreeParent(current))
                {
                    if (ReferenceEquals(current, outerGameFe))
                    {
                        break;
                    }

                    if (current is ButtonBase)
                    {
                        return;
                    }
                }
            }

            game = resolvedGame;
            anchor = outerGameFe;
        }

        /// <summary>
        /// Playnite game context-menu items often share the tile's <see cref="Game"/> DataContext.
        /// Treat those hits as "not on a tile" so the hover cannot stick to the menu.
        /// </summary>
        private static bool IsHitOnMenu(DependencyObject hit)
        {
            for (var current = hit; current != null; current = GetTreeParent(current))
            {
                if (current is ContextMenu || current is MenuItem || current is Menu)
                {
                    return true;
                }
            }

            return false;
        }

        /// <summary>
        /// Parent of a hit-test or focus result. <see cref="VisualTreeHelper.GetParent"/> throws on
        /// <see cref="ContentElement"/> (e.g. a <c>Run</c> inside a TextBlock).
        /// </summary>
        internal static DependencyObject GetTreeParent(DependencyObject child)
        {
            if (child == null)
            {
                return null;
            }

            if (child is Visual || child is Visual3D)
            {
                return VisualTreeHelper.GetParent(child);
            }

            if (child is FrameworkContentElement fce)
            {
                return fce.Parent;
            }

            if (child is ContentElement ce)
            {
                var parent = ContentOperations.GetParent(ce);
                if (parent != null)
                {
                    return parent;
                }
            }

            return LogicalTreeHelper.GetParent(child);
        }

        private static bool IsGridDesktopView(IPlayniteAPI api)
        {
            try
            {
                return api?.MainView != null && api.MainView.ActiveDesktopView == DesktopView.Grid;
            }
            catch
            {
                return false;
            }
        }

        private static Game TryGetGameFromDataContext(object dc)
        {
            if (dc == null)
            {
                return null;
            }

            if (dc is Game g)
            {
                return g;
            }

            try
            {
                var t = dc.GetType();
                var p = t.GetProperty("Game", BindingFlags.Instance | BindingFlags.Public);
                if (p != null && typeof(Game).IsAssignableFrom(p.PropertyType))
                {
                    return p.GetValue(dc, null) as Game;
                }
            }
            catch
            {
                // ignore reflection failures for unknown VMs
            }

            return null;
        }
    }
}
