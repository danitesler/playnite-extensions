using System;
using System.Collections.Generic;
using System.IO;
using System.Reflection;
using System.Runtime.Remoting.Messaging;
using System.Runtime.Remoting.Proxies;
using Newtonsoft.Json;
using Newtonsoft.Json.Serialization;
using Playnite.SDK;
using Playnite.SDK.Data;
using RandomTheme;
using Xunit;

namespace PlayniteExtensions.Tests
{
    [CollectionDefinition("SDK serialization", DisableParallelization = true)]
    public sealed class SdkSerializationCollection { }

    [Collection("SDK serialization")]
    public class RandomThemeSettingsTests
    {
        [Theory]
        [InlineData(ApplicationMode.Desktop)]
        [InlineData(ApplicationMode.Fullscreen)]
        public void CancelAfterManualPick_RestoresPersistedPreferencesAndKeepsPickTimestamp(ApplicationMode mode)
        {
            var directory = Path.Combine(Path.GetTempPath(), "audit-randomtheme-" + Guid.NewGuid().ToString("N"));
            var serializerField = typeof(Serialization).GetField("serializer", BindingFlags.Static | BindingFlags.NonPublic);
            var previousSerializer = serializerField.GetValue(null);
            try
            {
                serializerField.SetValue(null, new PathsProxy(typeof(IDataSerializer), directory).GetTransparentProxy());
                var api = (IPlayniteAPI)new PathsProxy(typeof(IPlayniteAPI), directory).GetTransparentProxy();
                var plugin = new RandomThemePlugin(api);
                var settings = (RandomThemeSettings)plugin.GetSettings(false);
                settings.Desktop.CadenceStep = 4;
                settings.Desktop.ExcludedThemeIds = new List<string> { "desktop-original" };
                settings.Fullscreen.Enabled = false;
                settings.Fullscreen.CadenceStep = 3;
                settings.Fullscreen.ExcludedThemeIds = new List<string> { "fullscreen-original" };
                settings.Persist();

                settings.BeginEdit();
                settings.Desktop.Enabled = false;
                settings.Desktop.CadenceStep = 0;
                settings.Desktop.ExcludedThemeIds.Clear();
                settings.Fullscreen.Enabled = true;
                settings.Fullscreen.CadenceStep = 1;
                settings.Fullscreen.ExcludedThemeIds.Clear();
                var pickedAt = new DateTime(2026, 11, 4, 12, 0, 0, DateTimeKind.Utc);
                // Successful RandomizeNow persists this timestamp and the shared settings before the restart prompt.
                settings.For(mode).LastPickedUtc = pickedAt;
                settings.Persist();
                settings.CancelEdit();

                var saved = JsonConvert.DeserializeObject<RandomThemeSettings>(
                    File.ReadAllText(Path.Combine(plugin.GetPluginUserDataPath(), "config.json")));
                Assert.True(saved.Desktop.Enabled);
                Assert.Equal(4, saved.Desktop.CadenceStep);
                Assert.Equal(new[] { "desktop-original" }, saved.Desktop.ExcludedThemeIds);
                Assert.False(saved.Fullscreen.Enabled);
                Assert.Equal(3, saved.Fullscreen.CadenceStep);
                Assert.Equal(new[] { "fullscreen-original" }, saved.Fullscreen.ExcludedThemeIds);
                Assert.Equal(pickedAt, saved.For(mode).LastPickedUtc);
            }
            finally
            {
                serializerField.SetValue(null, previousSerializer);
                if (Directory.Exists(directory))
                {
                    Directory.Delete(directory, true);
                }
            }
        }

        // Exercise the SDK save path with scratch directories and a JSON serializer that honors DontSerialize.
        private sealed class PathsProxy : RealProxy
        {
            private readonly string directory;

            public PathsProxy(Type interfaceType, string directory) : base(interfaceType)
            {
                this.directory = directory;
            }

            public override IMessage Invoke(IMessage message)
            {
                var call = (IMethodCallMessage)message;
                object result;
                if (call.MethodName == "get_Paths")
                {
                    result = new PathsProxy(typeof(IPlaynitePathsAPI), directory).GetTransparentProxy();
                }
                else if (call.MethodName == "get_ExtensionsDataPath" ||
                         call.MethodName == "get_ConfigurationPath" || call.MethodName == "get_ApplicationPath")
                {
                    result = directory;
                }
                else if (call.MethodName == "ToJson")
                {
                    result = JsonConvert.SerializeObject(call.Args[0], new JsonSerializerSettings
                    {
                        ContractResolver = new SettingsContractResolver()
                    });
                }
                else
                {
                    return new ReturnMessage(new InvalidOperationException("Unexpected API call: " + call.MethodName), call);
                }

                return new ReturnMessage(result, null, 0, call.LogicalCallContext, call);
            }
        }

        private sealed class SettingsContractResolver : DefaultContractResolver
        {
            protected override JsonProperty CreateProperty(MemberInfo member, MemberSerialization serialization)
            {
                var property = base.CreateProperty(member, serialization);
                property.Ignored |= member.IsDefined(typeof(DontSerializeAttribute), true);
                return property;
            }
        }
    }
}
