using System;
using System.ComponentModel;
using System.Threading;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Threading;
using Autogrid;
using Xunit;

namespace PlayniteExtensions.Tests
{
    public class GridWidthPinTests
    {
        [Fact]
        public void TryPin_HoldsCurrentWidthUntilReleased()
        {
            RunSta(() =>
            {
                var content = Laid(new Border(), 1840);
                var pin = new GridWidthPin();

                Assert.True(pin.TryPin(content, panelOnLeft: false));
                Assert.True(pin.IsPinned);
                Assert.Equal(1840, content.Width);
                Assert.Equal(HorizontalAlignment.Stretch, content.HorizontalAlignment);

                // The panel narrows the slot; the pinned content keeps its width.
                Laid(content, 720);
                Assert.Equal(1840, content.ActualWidth);

                pin.Release();
                Assert.False(pin.IsPinned);
                Assert.Equal(DependencyProperty.UnsetValue, content.ReadLocalValue(FrameworkElement.WidthProperty));
            });
        }

        [Fact]
        public void TryPin_PanelOnLeft_AlignsRightAndRestores()
        {
            RunSta(() =>
            {
                var content = Laid(new Border(), 1200);
                var pin = new GridWidthPin();

                Assert.True(pin.TryPin(content, panelOnLeft: true));
                Assert.Equal(HorizontalAlignment.Right, content.HorizontalAlignment);

                pin.Release();
                Assert.Equal(DependencyProperty.UnsetValue, content.ReadLocalValue(FrameworkElement.HorizontalAlignmentProperty));
            });
        }

        [Fact]
        public void TryPin_LeavesThemeOwnedWidthAlone()
        {
            RunSta(() =>
            {
                var content = Laid(new Border { Width = 900 }, 900);
                var pin = new GridWidthPin();

                Assert.False(pin.TryPin(content, panelOnLeft: false));
                Assert.False(pin.IsPinned);
                pin.Release();
                Assert.Equal(900, content.Width);
            });
        }

        [Fact]
        public void TryPin_NotLaidOut_DoesNothing()
        {
            RunSta(() =>
            {
                var pin = new GridWidthPin();
                Assert.False(pin.TryPin(new Border(), panelOnLeft: false));
                Assert.False(pin.TryPin(null, panelOnLeft: false));
            });
        }

        [Fact]
        public void Grow_FollowsWindowResizeWhilePinned()
        {
            RunSta(() =>
            {
                var content = Laid(new Border(), 1000);
                var pin = new GridWidthPin();
                pin.Grow(200);
                Assert.Equal(DependencyProperty.UnsetValue, content.ReadLocalValue(FrameworkElement.WidthProperty));

                pin.TryPin(content, panelOnLeft: false);
                pin.Grow(240);
                WaitForResize();
                Assert.Equal(1240, content.Width);
                pin.Grow(-300);
                WaitForResize();
                Assert.Equal(940, content.Width);
                pin.Release();
            });
        }

        [Fact]
        public void Grow_CoalescesResizeBurstInsteadOfReflowingEveryEvent()
        {
            RunSta(() =>
            {
                var content = Laid(new Border(), 1200);
                var pin = new GridWidthPin();
                pin.TryPin(content, panelOnLeft: false);
                var changes = 0;
                var widthProperty = DependencyPropertyDescriptor.FromProperty(FrameworkElement.WidthProperty, typeof(Border));
                EventHandler changed = (_, __) => changes++;
                widthProperty.AddValueChanged(content, changed);

                for (var i = 0; i < 300; i++)
                {
                    pin.Grow(-1);
                    // Let WPF process layout between resize messages, as a real drag does.
                    Laid(content, 500);
                    Assert.Equal(1200, content.Width);
                }

                WaitForResize();
                Assert.Equal(900, content.Width);
                Assert.Equal(1, changes);
                widthProperty.RemoveValueChanged(content, changed);
                pin.Release();
            });
        }

        [Fact]
        public void Release_CancelsPendingResizeBeforeAnotherGameDetailsPanelOpens()
        {
            RunSta(() =>
            {
                var content = Laid(new Border(), 1200);
                var pin = new GridWidthPin();
                pin.TryPin(content, panelOnLeft: true);
                pin.Grow(-400);
                pin.Release();

                Laid(content, 600);
                pin.TryPin(content, panelOnLeft: false);
                WaitForResize();
                Assert.Equal(600, content.Width);
                Assert.Equal(HorizontalAlignment.Stretch, content.HorizontalAlignment);
                pin.Release();
            });
        }

        private static void WaitForResize()
        {
            var frame = new DispatcherFrame();
            var timer = new DispatcherTimer(DispatcherPriority.Background)
            {
                Interval = TimeSpan.FromMilliseconds(120)
            };
            timer.Tick += (_, __) => { timer.Stop(); frame.Continue = false; };
            timer.Start();
            Dispatcher.PushFrame(frame);
        }

        [Theory]
        [InlineData(Dock.Left, true)]
        [InlineData(Dock.Right, false)]
        public void IsGridDetailsPanelOnLeft_ReadsPlayniteDock(Dock dock, bool expected)
        {
            Assert.Equal(expected, GridLayoutService.IsGridDetailsPanelOnLeft(new FakeAppSettings { GridViewDetailsPosition = dock }));
        }

        [Fact]
        public void IsGridDetailsPanelOnLeft_MissingSetting_IsFalse()
        {
            Assert.False(GridLayoutService.IsGridDetailsPanelOnLeft(new object()));
            Assert.False(GridLayoutService.IsGridDetailsPanelOnLeft(null));
        }

        [Fact]
        public void ResetWrapPanelItemSize_ClearsCachedTileSizeAndSkipsTiles()
        {
            RunSta(() =>
            {
                var outer = new VirtualizingWrapPanel();
                var inner = new VirtualizingWrapPanel();
                var tile = new ListBoxItem { Content = new Grid { Children = { new TileOnly.VirtualizingWrapPanel() } } };
                outer.Children.Add(new Border { Child = inner });
                outer.Children.Add(tile);
                var root = new Border { Child = outer };
                tile.Measure(new Size(300, 300)); // applies the template so the tile's panel is in the visual tree
                Assert.Equal(1, GridLayoutService.ResetWrapPanelItemSize(tile.Content as Grid));

                // Outer and inner (grouping) panels reset; nothing inside a tile is walked.
                Assert.Equal(2, GridLayoutService.ResetWrapPanelItemSize(root));
                Assert.True(outer.Cached.IsEmpty);
                Assert.True(inner.Cached.IsEmpty);
            });
        }

        [Fact]
        public void ResetWrapPanelItemSize_MissingField_ReportsBroken()
        {
            RunSta(() =>
            {
                var root = new Border { Child = new Renamed.VirtualizingWrapPanel() };
                Assert.Equal(-1, GridLayoutService.ResetWrapPanelItemSize(root));
                Assert.Equal(0, GridLayoutService.ResetWrapPanelItemSize(new Border()));
            });
        }

        /// <summary>Stands in for WpfToolkit's VirtualizingWrapPanel 2.5.x (private cached first-item size).</summary>
        public class VirtualizingWrapPanel : Panel
        {
            private Size sizeOfFirstItem = new Size(210, 315);
            public Size Cached => sizeOfFirstItem;
        }

        public static class TileOnly
        {
            public class VirtualizingWrapPanel : Panel
            {
                private Size sizeOfFirstItem = new Size(1, 1);
            }
        }

        public static class Renamed
        {
            public class VirtualizingWrapPanel : Panel
            {
            }
        }

        private static FrameworkElement Laid(FrameworkElement element, double width)
        {
            element.Measure(new Size(width, 600));
            element.Arrange(new Rect(0, 0, width, 600));
            return element;
        }

        private static void RunSta(Action action)
        {
            Exception failure = null;
            var thread = new Thread(() =>
            {
                try { action(); }
                catch (Exception ex) { failure = ex; }
            });
            thread.SetApartmentState(ApartmentState.STA);
            thread.Start();
            thread.Join();
            Assert.True(failure == null, failure?.ToString());
        }

        public sealed class FakeAppSettings
        {
            public Dock GridViewDetailsPosition { get; set; }
        }
    }
}
