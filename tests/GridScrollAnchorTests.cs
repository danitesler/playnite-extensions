using System;
using System.Threading;
using System.Windows;
using System.Windows.Controls;
using Autogrid;
using Xunit;

namespace PlayniteExtensions.Tests
{
    public class GridScrollAnchorTests
    {
        [Fact]
        public void Capture_Bottom_RestoresToNewBottom()
        {
            var anchor = GridScrollAnchor.Capture(offset: 9400, extent: 10000, viewport: 600).Value;
            Assert.True(anchor.AtBottom);
            Assert.Equal(15400, anchor.TargetOffset(extent: 16000, viewport: 600));
        }

        [Fact]
        public void Capture_MidList_KeepsShareOfExtent()
        {
            var anchor = GridScrollAnchor.Capture(offset: 2500, extent: 10000, viewport: 600).Value;
            Assert.False(anchor.AtTop);
            Assert.False(anchor.AtBottom);
            Assert.Equal(4000, anchor.TargetOffset(extent: 16000, viewport: 600));
        }

        [Fact]
        public void Capture_Top_StaysAtTop()
        {
            var anchor = GridScrollAnchor.Capture(offset: 0, extent: 10000, viewport: 600).Value;
            Assert.True(anchor.AtTop);
            Assert.Equal(0, anchor.TargetOffset(extent: 16000, viewport: 600));
        }

        [Fact]
        public void Capture_NotLaidOut_IsNull()
        {
            Assert.Null(GridScrollAnchor.Capture(offset: 0, extent: 0, viewport: 0));
            Assert.Null(GridScrollAnchor.Capture(null));
        }

        [Fact]
        public void Restore_AfterListShrankAndGrewBack_ReturnsToBottom()
        {
            RunSta(() =>
            {
                // The details panel toggle passes through a short list (old covers, new width), which
                // clamps the offset; the re-fit covers make it long again without moving the offset.
                var content = new Border { Height = 10000 };
                var viewer = new ScrollViewer { Content = content, Height = 600, Width = 400 };
                Lay(viewer);
                viewer.ScrollToBottom();
                Lay(viewer);
                Assert.Equal(9400, viewer.VerticalOffset);

                var anchor = GridScrollAnchor.Capture(viewer).Value;

                content.Height = 3000;
                Lay(viewer);
                Assert.Equal(2400, viewer.VerticalOffset);
                // VirtualizingWrapPanel overwrites its offset with the clamped one; the stock
                // ScrollContentPresenter keeps the requested offset unless told otherwise.
                viewer.ScrollToVerticalOffset(viewer.VerticalOffset);
                Lay(viewer);
                content.Height = 10000;
                Lay(viewer);
                Assert.Equal(2400, viewer.VerticalOffset);

                Assert.True(anchor.Restore(viewer));
                Lay(viewer);
                Assert.Equal(9400, viewer.VerticalOffset);
                Assert.False(anchor.Restore(viewer));
            });
        }

        private static void Lay(FrameworkElement element)
        {
            element.Measure(new Size(400, 600));
            element.Arrange(new Rect(0, 0, 400, 600));
            element.UpdateLayout();
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
    }
}
