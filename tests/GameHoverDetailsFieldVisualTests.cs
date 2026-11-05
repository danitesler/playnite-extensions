using GameHoverDetails;
using Xunit;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Documents;
using System.Windows.Media;

namespace PlayniteExtensions.Tests
{
    public class GameHoverDetailsFieldVisualTests
    {
        [Theory]
        [InlineData(1, false)]
        [InlineData(1, true)]
        [InlineData(3, false)]
        [InlineData(3, true)]
        public void OptionalHeaderRendersAboveAllFiveFields(int columns, bool enabled)
        {
            Exception failure = null;
            var thread = new Thread(() =>
            {
                try
                {
                    var settings = new GameHoverDetailsSettings
                    {
                        ShowGameNameHeader = enabled,
                        HideFieldTitlesInHover = true,
                        ShowFieldInlineIconsInHover = false,
                        HoverFieldColumnCount = columns,
                        SelectedFieldKeys = new List<string> { "TimePlayed", "LastPlayed", "Library", "Developer", "Publisher" }
                    };
                    var host = new StackPanel();
                    HoverFieldListBuilder.Fill(host, settings, HoverChromePalette.Resolve(settings),
                        settings.SelectedFieldKeys, 160,
                        new HoverFieldListSource { FormatValue = key => key == "Name" ? "A long game name that wraps across lines" : (settings.SelectedFieldKeys.IndexOf(key) + 1).ToString() });
                    host.Measure(new Size(160, double.PositiveInfinity));
                    host.Arrange(new Rect(0, 0, 160, host.DesiredSize.Height));

                    var texts = Descendants(host).OfType<TextBlock>().ToList();
                    Assert.Equal(new[] { "1", "2", "3", "4", "5" }, texts
                        .Select(text => new TextRange(text.ContentStart, text.ContentEnd).Text)
                        .Where(text => text.Length == 1));
                    Assert.Equal(enabled ? 6 : 5, texts.Count);
                    if (enabled)
                    {
                        var header = Assert.IsType<TextBlock>(host.Children[0]);
                        Assert.StartsWith("A long game name", new TextRange(header.ContentStart, header.ContentEnd).Text);
                        Assert.InRange(header.ActualWidth, 1, 160);
                    }
                    Assert.Equal(5, settings.SelectedFieldCount);
                }
                catch (Exception error) { failure = error; }
            });
            thread.SetApartmentState(ApartmentState.STA);
            thread.Start();
            thread.Join();
            Assert.True(failure == null, failure?.ToString());
        }

        private static IEnumerable<DependencyObject> Descendants(DependencyObject parent)
        {
            for (var i = 0; i < VisualTreeHelper.GetChildrenCount(parent); i++)
            {
                var child = VisualTreeHelper.GetChild(parent, i);
                yield return child;
                foreach (var descendant in Descendants(child)) yield return descendant;
            }
        }

    }
}
