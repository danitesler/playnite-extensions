using System;
using System.Collections.Generic;
using System.Globalization;
using System.Runtime.Remoting.Messaging;
using System.Runtime.Remoting.Proxies;
using GameHoverDetails;
using Playnite.SDK;
using Playnite.SDK.Models;
using Playnite.SDK.Plugins;
using Xunit;

namespace PlayniteExtensions.Tests
{
    public class GameHoverDetailsFieldFormatterTests
    {
        [Fact]
        public void BuiltInLibraryDoesNotRequireAnAddon()
        {
            Assert.Equal("Playnite", HoverFieldFormatter.Format("Library", new Game(), null));
            Assert.Equal("Playnite", HoverFieldFormatter.Format("Library", new Game(), Api()));
        }

        [Fact]
        public void ImportedLibraryUsesTheMatchingLibraryPluginName()
        {
            var plugin = new TestLibrary();
            var api = Api(new TestLibrary(), plugin);
            Assert.Equal("Test library", HoverFieldFormatter.Format("Library", new Game { PluginId = plugin.Id }, api));
            Assert.Equal("Unknown library", HoverFieldFormatter.Format("Library", new Game { PluginId = Guid.NewGuid() }, api));
            Assert.Equal("Playnite", HoverFieldFormatter.Format("Library", new Game(), api));
        }

        [Theory]
        [InlineData("UserScore")]
        [InlineData("CriticScore")]
        [InlineData("CommunityScore")]
        public void ZeroScoresAreValuesAndNullScoresAreMissing(string key)
        {
            var game = new Game();
            Assert.Equal(HoverLoc.Empty, HoverFieldFormatter.Format(key, game, null));
            foreach (var score in new[] { 0, 1, 50, 100 })
            {
                typeof(Game).GetProperty(key).SetValue(game, score);
                Assert.Equal(score.ToString(CultureInfo.CurrentCulture), HoverFieldFormatter.Format(key, game, null));
            }
        }

        [Theory]
        [InlineData("DoNothing")]
        [InlineData("Hide")]
        [InlineData("Fallback")]
        public void EmptyFieldModesPreserveZeroScoresAndNativeLibrary(string mode)
        {
            var settings = new GameHoverDetailsSettings
            {
                EmptyFieldBehavior = mode,
                SelectedFieldKeys = new List<string> { "CriticScore", "Library" }
            };
            var source = HoverFieldListSource.ForLiveGame(new Game { CriticScore = 0, CommunityScore = 80 }, null);
            var keys = HoverFieldResolver.Resolve(settings, settings.SelectedFieldKeys, ref source);
            Assert.Equal(new[] { "CriticScore", "Library" }, keys);
            Assert.Equal("0", source.FormatValue("CriticScore"));
            Assert.Equal("Playnite", source.FormatValue("Library"));
            Assert.False(HoverFieldResolver.IsEmpty(source.FormatValue("CriticScore")));
        }

        [Fact]
        public void MissingSourceCanFallBackToNativeLibrary()
        {
            var settings = new GameHoverDetailsSettings
            {
                UseFallbackFields = true,
                SelectedFieldKeys = new List<string> { "Source" }
            };
            var source = HoverFieldListSource.ForLiveGame(new Game(), null);
            var keys = HoverFieldResolver.Resolve(settings, settings.SelectedFieldKeys, ref source);
            Assert.Equal(new[] { "Library" }, keys);
            Assert.Equal("Playnite", source.FormatValue("Library"));
        }

        [Fact]
        public void ZeroInstallSizeIsDifferentFromMissingSize()
        {
            Assert.Equal(HoverLoc.Empty, HoverFieldFormatter.Format("InstallSize", new Game(), null));
            Assert.Equal("0 B", HoverFieldFormatter.Format("InstallSize", new Game { InstallSize = 0 }, null));
        }

        [Fact]
        public void FutureLastPlayedDatesAreDisplayedLikeOtherDates()
        {
            var date = DateTime.UtcNow.AddDays(2);
            var game = new Game { LastActivity = date, Added = date };
            var expected = date.ToLocalTime().ToString("d", CultureInfo.CurrentCulture);
            Assert.Equal(expected, HoverFieldFormatter.Format("LastPlayed", game, null));
            Assert.Equal(expected, HoverFieldFormatter.Format("DateAdded", game, null));
            Assert.Equal(expected, HoverFieldFormatter.Format("RecentActivity", game, null));
        }

        [Theory]
        [InlineData(false, "5124095576030431h 0min")]
        [InlineData(true, "213503982334601d 7h 0min")]
        public void PlaytimeSupportsTheFullSdkRange(bool useDays, string expected)
        {
            Assert.Equal(expected, HoverFieldFormatter.FormatPlaytimeText(ulong.MaxValue, useDays));
        }

        private static IPlayniteAPI Api(params Plugin[] plugins)
        {
            var addons = new GetterProxy(typeof(IAddons), "get_Plugins", new List<Plugin>(plugins)).GetTransparentProxy();
            return (IPlayniteAPI)new GetterProxy(typeof(IPlayniteAPI), "get_Addons", addons).GetTransparentProxy();
        }

        private sealed class GetterProxy : RealProxy
        {
            private readonly string getter;
            private readonly object value;

            public GetterProxy(Type type, string getter, object value) : base(type)
            {
                this.getter = getter;
                this.value = value;
            }

            public override IMessage Invoke(IMessage message)
            {
                var call = (IMethodCallMessage)message;
                return call.MethodName == getter
                    ? new ReturnMessage(value, null, 0, call.LogicalCallContext, call)
                    : new ReturnMessage(new InvalidOperationException("Unexpected API call: " + call.MethodName), call);
            }
        }

        private sealed class TestLibrary : LibraryPlugin
        {
            public override Guid Id { get; } = Guid.NewGuid();
            public override string Name => "Test library";
            public TestLibrary() : base(null) { }
            public override IEnumerable<GameMetadata> GetGames(LibraryGetGamesArgs args) => throw new NotSupportedException();
        }
    }
}
