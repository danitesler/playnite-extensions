using System;
using System.Reflection;
using System.Runtime.Serialization;
using System.Threading;
using System.Windows.Controls;
using GameHoverDetails;
using Playnite.SDK.Models;
using Xunit;

namespace PlayniteExtensions.Tests
{
    public class GameHoverDetailsKeyboardFocusTests
    {
        [Theory]
        [InlineData(false, false, true, false, false, false, false)]
        [InlineData(false, false, true, false, true, false, true)]
        [InlineData(false, false, true, false, false, true, true)]
        [InlineData(true, false, true, false, true, true, false)]
        [InlineData(false, true, true, false, true, true, false)]
        [InlineData(false, false, false, false, false, true, false)]
        [InlineData(false, false, true, true, true, true, false)]
        public void KeyboardFollowOnlyOnTileNavigation(
            bool mouseButtonDown,
            bool oldFocusInsideMenu,
            bool newFocusIsGameTile,
            bool pointerOnSameGame,
            bool movedFromAnotherTile,
            bool navigationKeyDown,
            bool expected)
        {
            Assert.Equal(
                expected,
                GameHoverDetailsHoverService.ShouldFollowKeyboardFocus(
                    mouseButtonDown,
                    oldFocusInsideMenu,
                    newFocusIsGameTile,
                    pointerOnSameGame,
                    movedFromAnotherTile,
                    navigationKeyDown));
        }

        [Fact]
        public void FocusedListItemResolvesToItsGameAndIgnoresDetailsPaneAndMenus()
        {
            Exception caught = null;
            var thread = new Thread(() =>
            {
                try
                {
                    var game = new Game("Halo") { Id = Guid.NewGuid() };
                    var tile = new ListBoxItem { DataContext = game };
                    Assert.True(GameHoverDetailsHoverService.TryResolveFocusedGameTile(tile, out var resolved, out var anchor));
                    Assert.Equal(game.Id, resolved.Id);
                    Assert.Same(tile, anchor);

                    var holder = new GameHolder { Game = game };
                    var wrapped = new ListBoxItem { DataContext = holder };
                    Assert.True(GameHoverDetailsHoverService.TryResolveFocusedGameTile(wrapped, out resolved, out anchor));
                    Assert.Equal(game.Id, resolved.Id);
                    Assert.Same(wrapped, anchor);

                    var detailsButton = new Button { DataContext = game };
                    Assert.False(GameHoverDetailsHoverService.TryResolveFocusedGameTile(detailsButton, out _, out _));

                    var menuItem = new MenuItem { DataContext = game };
                    Assert.False(GameHoverDetailsHoverService.TryResolveFocusedGameTile(menuItem, out _, out _));

                    Assert.False(GameHoverDetailsHoverService.TryResolveFocusedGameTile(null, out _, out _));
                }
                catch (Exception ex)
                {
                    caught = ex;
                }
            });
            thread.SetApartmentState(ApartmentState.STA);
            thread.Start();
            Assert.True(thread.Join(TimeSpan.FromSeconds(15)), "STA focus resolve timed out");
            if (caught != null)
            {
                throw new Exception(caught.Message, caught);
            }
        }

        [Fact]
        public void PointerClickReleasesKeyboardFollow()
        {
            var service = (GameHoverDetailsHoverService)FormatterServices.GetUninitializedObject(
                typeof(GameHoverDetailsHoverService));
            var flags = BindingFlags.Instance | BindingFlags.NonPublic;
            var type = typeof(GameHoverDetailsHoverService);
            type.GetField("keyboardFollowActive", flags).SetValue(service, true);
            type.GetField("pendingShowFromKeyboard", flags).SetValue(service, true);

            var release = type.GetMethod("ReleaseKeyboardFollowForPointer", flags);
            Assert.NotNull(release);
            release.Invoke(service, null);

            Assert.False((bool)type.GetField("keyboardFollowActive", flags).GetValue(service));
            Assert.False((bool)type.GetField("pendingShowFromKeyboard", flags).GetValue(service));
        }

        private sealed class GameHolder
        {
            public Game Game { get; set; }
        }
    }
}
