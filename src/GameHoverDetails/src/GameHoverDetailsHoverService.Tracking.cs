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
        private void MainWindowOnPreviewKeyDown(object sender, KeyEventArgs e)
        {
            if (broken || e.IsRepeat || e.Key == Key.None)
            {
                return;
            }

            QueueDeferredHoverSync(preferFocusedTile: true);
        }

        /// <summary>
        /// Details/list wheel scroll moves games under a still cursor — <see cref="UIElement.PreviewMouseMove"/>
        /// does not fire. Sync after the scroll is applied so the open tooltip swaps content instead of blinking.
        /// </summary>
        private void MainWindowOnPreviewMouseWheel(object sender, MouseWheelEventArgs e)
        {
            if (broken)
            {
                return;
            }

            QueueDeferredHoverSync(preferFocusedTile: false);
        }

        /// <summary>
        /// Arrow keys and gamepad navigation move focus onto a grid/list tile without a pointer move.
        /// A click (mouse button down) and a menu closing back onto the tile stay on the pointer path,
        /// so leaving the tile with the mouse still hides.
        /// </summary>
        private void MainWindowOnGotKeyboardFocus(object sender, KeyboardFocusChangedEventArgs e)
        {
            if (broken || !attached)
            {
                return;
            }

            try
            {
                var mouseDown = IsAnyMouseButtonDown();
                var oldInMenu = IsHitOnMenu(e.OldFocus as DependencyObject);
                Game focusedGame;
                FrameworkElement focusedAnchor;
                var hasTile = TryResolveFocusedGameTile(e.NewFocus as DependencyObject, out focusedGame, out focusedAnchor);
                Game pointerGame;
                FrameworkElement pointerAnchor;
                TryResolveGameAndAnchor(Mouse.DirectlyOver as DependencyObject, playniteApi, out pointerGame, out pointerAnchor);
                var pointerOnSame = hasTile && pointerGame != null && pointerGame.Id == focusedGame.Id;
                Game previousGame;
                var movedFromAnotherTile = hasTile
                    && TryResolveFocusedGameTile(e.OldFocus as DependencyObject, out previousGame, out _)
                    && previousGame.Id != focusedGame.Id;
                var navigationKeyDown = IsNavigationKeyDown();
                if (mainWindow.WindowState == WindowState.Minimized)
                {
                    return;
                }

                if (mouseDown && hasTile && keyboardFollowActive)
                {
                    // A click focuses the tile the pointer is on, including a tile that already
                    // had focus. Leave keyboard-follow so a later mouse-leave still hides.
                    ReleaseKeyboardFollowForPointer();
                    hideDebounceTimer?.Stop();
                    if (pointerOnSame && !ShouldBlockHover() && !IsAlreadyShowing(focusedGame, focusedAnchor))
                    {
                        ScheduleShowAfterDelay(focusedGame, focusedAnchor);
                    }

                    return;
                }

                if (hasTile && pointerOnSame && !mouseDown && !oldInMenu && !ShouldBlockHover()
                    && (movedFromAnotherTile || navigationKeyDown))
                {
                    // Focus landed on the tile the pointer is already on. Hand back to the pointer
                    // path so a later mouse-leave still hides (arrowing onto a rested cursor).
                    keyboardFollowActive = false;
                    pendingShowFromKeyboard = false;
                    hideDebounceTimer?.Stop();
                    if (!IsAlreadyShowing(focusedGame, focusedAnchor))
                    {
                        ScheduleShowAfterDelay(focusedGame, focusedAnchor);
                    }

                    return;
                }

                if (!ShouldFollowKeyboardFocus(
                    mouseDown,
                    oldInMenu,
                    hasTile,
                    pointerOnSame,
                    movedFromAnotherTile,
                    navigationKeyDown))
                {
                    if (keyboardFollowActive && !hasTile && !oldInMenu)
                    {
                        keyboardFollowActive = false;
                        pendingShowFromKeyboard = false;
                        if (pointerGame != null && !ShouldBlockHover())
                        {
                            hideDebounceTimer?.Stop();
                            ScheduleShowAfterDelay(pointerGame, pointerAnchor);
                            return;
                        }

                        HidePopup();
                    }

                    return;
                }

                if (ShouldBlockHover())
                {
                    return;
                }

                consecutiveHoverErrors = 0;
                keyboardFollowActive = true;
                hideDebounceTimer?.Stop();
                if (IsAlreadyShowing(focusedGame, focusedAnchor))
                {
                    showDelayTimer?.Stop();
                    pendingShowGame = null;
                    pendingShowAnchor = null;
                    pendingShowFromKeyboard = false;
                    return;
                }

                ScheduleShowAfterDelay(focusedGame, focusedAnchor, fromKeyboard: true);
            }
            catch (Exception ex)
            {
                HandleHoverError(ex);
            }
        }

        private static bool IsAnyMouseButtonDown()
        {
            return Mouse.LeftButton == MouseButtonState.Pressed
                || Mouse.RightButton == MouseButtonState.Pressed
                || Mouse.MiddleButton == MouseButtonState.Pressed;
        }

        /// <summary>
        /// Keys that move the library selection. Gamepad browsing does not set these; it moves focus
        /// from one tile to another, which is tracked separately. Window restore sets neither.
        /// </summary>
        private static bool IsNavigationKeyDown()
        {
            return Keyboard.IsKeyDown(Key.Left)
                || Keyboard.IsKeyDown(Key.Right)
                || Keyboard.IsKeyDown(Key.Up)
                || Keyboard.IsKeyDown(Key.Down)
                || Keyboard.IsKeyDown(Key.Tab)
                || Keyboard.IsKeyDown(Key.PageUp)
                || Keyboard.IsKeyDown(Key.PageDown)
                || Keyboard.IsKeyDown(Key.Home)
                || Keyboard.IsKeyDown(Key.End);
        }

        /// <summary>
        /// After Playnite handles a key or wheel (list scroll, F4/F9), sync the open tooltip.
        /// A key that moved focus onto a tile keeps that tile even if the pointer is elsewhere.
        /// Wheel still follows the pointer; a key that left the list hides when the pointer is not on a game.
        /// </summary>
        private void QueueDeferredHoverSync(bool preferFocusedTile)
        {
            var popupOpen = popup != null && popup.IsOpen;
            var showPending = pendingShowGame != null || (showDelayTimer != null && showDelayTimer.IsEnabled);
            if (!popupOpen && !showPending)
            {
                return;
            }

            var generation = ++deferredHoverSyncGeneration;
            dispatcher.BeginInvoke(
                new Action(() => DeferredHoverSync(generation, preferFocusedTile)),
                DispatcherPriority.ContextIdle);
        }

        private void DeferredHoverSync(int generation, bool preferFocusedTile)
        {
            if (broken || !attached || generation != deferredHoverSyncGeneration)
            {
                return;
            }

            if (ShouldBlockHover())
            {
                hideDebounceTimer?.Stop();
                HidePopup();
                return;
            }

            try
            {
                Game focusedGame;
                FrameworkElement focusedAnchor;
                if (preferFocusedTile
                    && TryGetKeyboardFollowTarget(out focusedGame, out focusedAnchor))
                {
                    hideDebounceTimer?.Stop();
                    consecutiveHoverErrors = 0;
                    if (IsAlreadyShowing(focusedGame, focusedAnchor))
                    {
                        showDelayTimer?.Stop();
                        pendingShowGame = null;
                        pendingShowAnchor = null;
                        pendingShowFromKeyboard = false;
                        return;
                    }

                    ScheduleShowAfterDelay(focusedGame, focusedAnchor, fromKeyboard: true);
                    return;
                }

                var hit = Mouse.DirectlyOver as DependencyObject;
                Game game;
                FrameworkElement anchor;
                TryResolveGameAndAnchor(hit, playniteApi, out game, out anchor);
                consecutiveHoverErrors = 0;
                if (game != null)
                {
                    keyboardFollowActive = false;
                    pendingShowFromKeyboard = false;
                    hideDebounceTimer?.Stop();
                    if (IsAlreadyShowing(game, anchor))
                    {
                        showDelayTimer?.Stop();
                        pendingShowGame = null;
                        pendingShowAnchor = null;
                        return;
                    }

                    ScheduleShowAfterDelay(game, anchor);
                    return;
                }

                if (!preferFocusedTile
                    && TryGetKeyboardFollowTarget(out focusedGame, out focusedAnchor))
                {
                    return;
                }

                hideDebounceTimer?.Stop();
                HidePopup();
            }
            catch (Exception ex)
            {
                HandleHoverError(ex);
            }
        }

        private void MainWindowOnPreviewMouseMove(object sender, MouseEventArgs e)
        {
            TryHandlePointerHover();
        }

        /// <summary>
        /// A click on the already-focused tile does not raise <see cref="Keyboard.GotKeyboardFocusEvent"/>.
        /// </summary>
        private void MainWindowOnPreviewMouseDown(object sender, MouseButtonEventArgs e)
        {
            if (broken || !attached || !keyboardFollowActive)
            {
                return;
            }

            try
            {
                TryResolveGameAndAnchor(e.OriginalSource as DependencyObject, playniteApi, out var game, out var anchor);
                if (game == null)
                {
                    return;
                }

                ReleaseKeyboardFollowForPointer();
                hideDebounceTimer?.Stop();
                if (!ShouldBlockHover() && !IsAlreadyShowing(game, anchor))
                {
                    ScheduleShowAfterDelay(game, anchor);
                }
            }
            catch (Exception ex)
            {
                HandleHoverError(ex);
            }
        }

        private void ReleaseKeyboardFollowForPointer()
        {
            keyboardFollowActive = false;
            pendingShowFromKeyboard = false;
        }

        /// <summary>
        /// Resolve the game under the pointer and show, switch, or debounce-hide.
        /// Switching while the popup is already open skips appear delay and enter fade.
        /// </summary>
        private void TryHandlePointerHover()
        {
            if (broken)
            {
                return;
            }

            if (ShouldBlockHover())
            {
                showDelayTimer?.Stop();
                pendingShowGame = null;
                pendingShowAnchor = null;
                HidePopup();
                return;
            }

            try
            {
                var hit = Mouse.DirectlyOver as DependencyObject;
                Game game;
                FrameworkElement anchor;
                TryResolveGameAndAnchor(hit, playniteApi, out game, out anchor);
                consecutiveHoverErrors = 0;

                if (game != null)
                {
                    keyboardFollowActive = false;
                    pendingShowFromKeyboard = false;
                    hideDebounceTimer?.Stop();
                    if (IsAlreadyShowing(game, anchor))
                    {
                        showDelayTimer?.Stop();
                        pendingShowGame = null;
                        pendingShowAnchor = null;
                        return;
                    }

                    ScheduleShowAfterDelay(game, anchor);
                }
                else if (TryGetKeyboardFollowTarget(out var focusedGame, out var focusedAnchor))
                {
                    // Pointer drifted off tiles while arrow/gamepad browsing. Do not start the hide debounce.
                    hideDebounceTimer?.Stop();
                    if (!IsAlreadyShowing(focusedGame, focusedAnchor))
                    {
                        ScheduleShowAfterDelay(focusedGame, focusedAnchor, fromKeyboard: true);
                    }
                }
                else
                {
                    keyboardFollowActive = false;
                    pendingShowFromKeyboard = false;
                    showDelayTimer?.Stop();
                    pendingShowGame = null;
                    pendingShowAnchor = null;
                    hideDebounceTimer?.Stop();
                    hideDebounceTimer?.Start();
                }
            }
            catch (Exception ex)
            {
                HandleHoverError(ex);
            }
        }

        /// <summary>
        /// Every move over the same tile used to re-run the show pipeline (palette resolve, fanart
        /// decode, placement, fade). Nothing about the panel changes, so skip the whole pass.
        /// </summary>
        private bool IsAlreadyShowing(Game game, FrameworkElement anchor)
        {
            return game != null
                && popup != null
                && popup.IsOpen
                && lastShownGame != null
                && lastShownGame.Id == game.Id
                && ReferenceEquals(lastShownAnchor, anchor);
        }

        private void ScheduleShowAfterDelay(Game game, FrameworkElement anchor, bool fromKeyboard = false)
        {
            if (ShouldBlockHover())
            {
                showDelayTimer?.Stop();
                pendingShowGame = null;
                pendingShowAnchor = null;
                pendingShowFromKeyboard = false;
                return;
            }

            pendingShowGame = game;
            pendingShowAnchor = anchor;
            pendingShowFromKeyboard = fromKeyboard;
            showDelayTimer?.Stop();

            // Appear delay is first-open only. An already-visible tooltip must swap
            // content immediately — waiting restarts the fade and looks like blink.
            var alreadyOpen = popup != null && popup.IsOpen;
            var delay = alreadyOpen ? 0 : settings.ShowDelayMs;
            if (delay <= 0)
            {
                pendingShowGame = null;
                pendingShowAnchor = null;
                pendingShowFromKeyboard = false;
                ShowOrUpdatePopup(game, anchor);
                return;
            }

            showDelayTimer.Interval = TimeSpan.FromMilliseconds(delay);
            showDelayTimer.Start();
        }

        private void ShowDelayTimerOnTick(object sender, EventArgs e)
        {
            if (broken)
            {
                return;
            }

            try
            {
                showDelayTimer?.Stop();
                var confirmFromKeyboard = pendingShowFromKeyboard;
                Game g;
                FrameworkElement anchor;
                if (confirmFromKeyboard)
                {
                    TryResolveFocusedGameTile(Keyboard.FocusedElement as DependencyObject, out g, out anchor);
                }
                else
                {
                    TryResolveGameAndAnchor(Mouse.DirectlyOver as DependencyObject, playniteApi, out g, out anchor);
                }

                if (g == null || pendingShowGame == null || g.Id != pendingShowGame.Id)
                {
                    pendingShowGame = null;
                    pendingShowAnchor = null;
                    pendingShowFromKeyboard = false;
                    return;
                }

                if (ShouldBlockHover())
                {
                    pendingShowGame = null;
                    pendingShowAnchor = null;
                    pendingShowFromKeyboard = false;
                    return;
                }

                var useAnchor = anchor ?? pendingShowAnchor;
                pendingShowGame = null;
                pendingShowAnchor = null;
                pendingShowFromKeyboard = false;
                ShowOrUpdatePopup(g, useAnchor);
            }
            catch (Exception ex)
            {
                HandleHoverError(ex);
            }
        }

        /// <summary>
        /// Last line of defence for a panel that outlived its trigger: a plugin window opened from the
        /// context menu, the view switched, or the tile was recycled while the pointer never moved.
        /// Runs only while the popup is open. Pointer-driven: hides when the pointer is off games and
        /// switches when it is over a different game. Keyboard-driven: keeps the focused tile even if
        /// the pointer is elsewhere, and hides once focus leaves the list.
        /// </summary>
        private void VisibilityWatchdogOnTick(object sender, EventArgs e)
        {
            if (broken || popup == null || !popup.IsOpen)
            {
                visibilityWatchdogTimer?.Stop();
                return;
            }

            try
            {
                if (ShouldBlockHover() || lastShownGame == null)
                {
                    hideDebounceTimer?.Stop();
                    HidePopup();
                    return;
                }

                Game game;
                FrameworkElement anchor;
                if (TryGetKeyboardFollowTarget(out game, out anchor))
                {
                    if (!IsAlreadyShowing(game, anchor))
                    {
                        ScheduleShowAfterDelay(game, anchor, fromKeyboard: true);
                    }

                    return;
                }

                if (keyboardFollowActive)
                {
                    keyboardFollowActive = false;
                    pendingShowFromKeyboard = false;
                }

                TryResolveGameAndAnchor(Mouse.DirectlyOver as DependencyObject, playniteApi, out game, out anchor);
                if (game == null)
                {
                    hideDebounceTimer?.Stop();
                    HidePopup();
                    return;
                }

                // Pointer is still on a game (possibly a different row after scroll).
                // Switch content in place — hiding here is what made fast sweeps blink.
                if (!IsAlreadyShowing(game, anchor))
                {
                    ScheduleShowAfterDelay(game, anchor);
                }
            }
            catch (Exception ex)
            {
                HandleHoverError(ex);
            }
        }

        private void HideDebounceTimerOnTick(object sender, EventArgs e)
        {
            if (broken)
            {
                return;
            }

            try
            {
                hideDebounceTimer?.Stop();
                Game g;
                FrameworkElement anchor;
                if (TryGetKeyboardFollowTarget(out g, out anchor) && !ShouldBlockHover())
                {
                    if (!IsAlreadyShowing(g, anchor))
                    {
                        ScheduleShowAfterDelay(g, anchor, fromKeyboard: true);
                    }

                    return;
                }

                TryResolveGameAndAnchor(Mouse.DirectlyOver as DependencyObject, playniteApi, out g, out anchor);
                if (g != null && !ShouldBlockHover())
                {
                    keyboardFollowActive = false;
                    pendingShowFromKeyboard = false;
                    if (!IsAlreadyShowing(g, anchor))
                    {
                        ScheduleShowAfterDelay(g, anchor);
                    }

                    return;
                }

                HidePopup();
            }
            catch (Exception ex)
            {
                HandleHoverError(ex);
            }
        }

        /// <summary>
        /// One unexpected element in a third-party view used to disable hover for the rest of the
        /// session. Recover from isolated failures and only give up when they keep repeating.
        /// </summary>
        private void HandleHoverError(Exception ex)
        {
            if (broken)
            {
                return;
            }

            consecutiveHoverErrors++;
            if (consecutiveHoverErrors < MaxConsecutiveHoverErrors)
            {
                Logger.Warn(
                    ex,
                    "GameHoverDetails hover error " + consecutiveHoverErrors + "/" + MaxConsecutiveHoverErrors + "; recovering.");
                try
                {
                    hideDebounceTimer?.Stop();
                    showDelayTimer?.Stop();
                    HidePopup();
                }
                catch
                {
                    // ignore
                }

                return;
            }

            broken = true;
            Logger.Error(ex, "GameHoverDetails hover UI disabled after repeated errors.");
            try
            {
                Detach();
            }
            catch
            {
                // ignore
            }
        }
    }
}
