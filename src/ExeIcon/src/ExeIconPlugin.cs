using System;
using System.Collections.Generic;
using Playnite.SDK;
using Playnite.SDK.Plugins;

namespace ExeIcon
{
    public class ExeIconPlugin : MetadataPlugin
    {
        private static readonly Guid PluginId = Guid.Parse("B2D0A72F-2597-48A9-8491-4A80C13DC36D");

        public override Guid Id => PluginId;

        public override string Name => "ExeIcon";

        // Icons only: covers and backgrounds are not stored in executables.
        public override List<MetadataField> SupportedFields { get; } = new List<MetadataField>
        {
            MetadataField.Icon
        };

        public ExeIconPlugin(IPlayniteAPI api) : base(api)
        {
            Properties = new MetadataPluginProperties
            {
                HasSettings = false
            };
        }

        public override OnDemandMetadataProvider GetMetadataProvider(MetadataRequestOptions options)
        {
            return new ExeIconMetadataProvider(options, PlayniteApi);
        }
    }
}
