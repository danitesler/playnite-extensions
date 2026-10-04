using System;
using Autogrid;
using Xunit;

namespace PlayniteExtensions.Tests
{
    public class GridLayoutServiceTests
    {
        [Fact]
        public void ComputeColumnLayout_StandardDimensions_CalculatesExactTileWidth()
        {
            var success = GridLayoutService.ComputeColumnLayout(
                viewportWidth: 1200,
                targetColumns: 6,
                userGridItemSpacing: 8,
                out var gridItemWidth,
                out var gridItemSpacing);

            Assert.True(success);
            Assert.Equal(192.0, gridItemWidth);
            Assert.Equal(8, gridItemSpacing);
        }

        [Fact]
        public void ComputeColumnLayout_OddGridSpacing_TruncatesHalfMarginCorrectly()
        {
            // Odd spacing 11 => half = 5 => axis margin = 10
            // Usable: 1000 - (4 * 10) = 960 => 960 / 4 = 240
            var success = GridLayoutService.ComputeColumnLayout(
                viewportWidth: 1000,
                targetColumns: 4,
                userGridItemSpacing: 11,
                out var gridItemWidth,
                out var gridItemSpacing);

            Assert.True(success);
            Assert.Equal(240.0, gridItemWidth);
            Assert.Equal(11, gridItemSpacing);
        }

        [Fact]
        public void ComputeColumnLayout_WithSubColumnLeftover_FloorsWidthWithoutExtra()
        {
            // Margin = 8. Raw width = (1003 - 32) / 4 = 242.75 => floored = 242
            // Leftover = 1003 - 4 * (242 + 8) = 3 px (< 4 columns, so no +1 px extra)
            var success = GridLayoutService.ComputeColumnLayout(
                viewportWidth: 1003,
                targetColumns: 4,
                userGridItemSpacing: 8,
                out var gridItemWidth,
                out var gridItemSpacing);

            Assert.True(success);
            Assert.Equal(242.0, gridItemWidth);
            Assert.Equal(8, gridItemSpacing);
        }

        [Fact]
        public void ComputeColumnLayout_NarrowViewport_ClampsToMinGridItemWidth()
        {
            // Margin = 8. Raw width = (200 - 32) / 4 = 42 < Min (60)
            var success = GridLayoutService.ComputeColumnLayout(
                viewportWidth: 200,
                targetColumns: 4,
                userGridItemSpacing: 8,
                out var gridItemWidth,
                out var gridItemSpacing);

            Assert.True(success);
            Assert.Equal(GridLayoutService.MinGridItemWidth, gridItemWidth);
            Assert.Equal(8, gridItemSpacing);
        }

        [Fact]
        public void ComputeColumnLayout_ExcessiveViewport_ClampsToMaxGridItemWidth()
        {
            var success = GridLayoutService.ComputeColumnLayout(
                viewportWidth: 5000,
                targetColumns: 2,
                userGridItemSpacing: 8,
                out var gridItemWidth,
                out var gridItemSpacing);

            Assert.True(success);
            Assert.Equal(GridLayoutService.MaxGridItemWidth, gridItemWidth);
            Assert.Equal(8, gridItemSpacing);
        }

        [Theory]
        [InlineData(0, 4, 8)]
        [InlineData(-100, 4, 8)]
        public void ComputeColumnLayout_InvalidViewport_ReturnsFalse(double viewport, int cols, int spacing)
        {
            var success = GridLayoutService.ComputeColumnLayout(
                viewportWidth: viewport,
                targetColumns: cols,
                userGridItemSpacing: spacing,
                out var gridItemWidth,
                out var gridItemSpacing);

            Assert.False(success);
            Assert.Equal(0.0, gridItemWidth);
            Assert.Equal(spacing, gridItemSpacing);
        }

        [Theory]
        [InlineData(1000, 0, 8)]
        [InlineData(1000, -2, 8)]
        public void ComputeColumnLayout_InvalidTargetColumns_ReturnsFalse(double viewport, int cols, int spacing)
        {
            var success = GridLayoutService.ComputeColumnLayout(
                viewportWidth: viewport,
                targetColumns: cols,
                userGridItemSpacing: spacing,
                out var gridItemWidth,
                out var gridItemSpacing);

            Assert.False(success);
        }

        [Theory]
        [InlineData(0, 0)]
        [InlineData(-10, 0)]
        [InlineData(8, 8)]
        [InlineData(7, 6)]
        [InlineData(15, 14)]
        public void SpacingToAxisMargin_CalculatesExpectedMargins(int spacing, int expectedMargin)
        {
            var margin = GridLayoutService.SpacingToAxisMargin(spacing);
            Assert.Equal(expectedMargin, margin);
        }
    }
}
