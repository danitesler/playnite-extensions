[CmdletBinding()]
param(
    [Parameter(Mandatory = $true)]
    [string]$Name,

    [Parameter(Mandatory = $true)]
    [string]$Key,

    [string]$AddonId = "",

    [ValidateSet("GenericPlugin", "MetadataPlugin", "LibraryPlugin")]
    [string]$Type = "GenericPlugin",

    [string]$Author = $env:USERNAME,
    [string]$Description = "A Playnite extension.",
    [string]$RequiredApiVersion = "6.6.0",
    [string]$Version = "0.1.0"
)

$ErrorActionPreference = "Stop"
. (Join-Path $PSScriptRoot "extension-profiles.ps1")

function Convert-ToIdentifier {
    param([string]$Value)
    $identifier = ($Value -replace "[^A-Za-z0-9_]", "")
    if (-not $identifier) {
        throw "Name '$Value' cannot be converted to a C# identifier."
    }
    if ($identifier[0] -match "[0-9]") {
        $identifier = "Extension$identifier"
    }
    return $identifier
}

$repoRoot = Get-RepoRoot
$className = Convert-ToIdentifier $Name
$Key = $Key.ToLowerInvariant()
$extensionDir = Join-Path $repoRoot "src/$className"
$databaseType = Get-AddonDatabaseType -PluginType $Type

if (-not $AddonId) {
    $AddonId = "{0}_{1}" -f $className, (([guid]::NewGuid()).ToString("N").Substring(0, 8).ToUpperInvariant())
}

$index = Get-ExtensionIndex
if ($index.extensions | Where-Object { $_.key -eq $Key -or $_.addonId -eq $AddonId }) {
    throw "An extension with key '$Key' or AddonId '$AddonId' already exists."
}

if (Test-Path $extensionDir) {
    throw "Extension directory already exists at $extensionDir"
}

# The index row holds only what cannot be derived; paths and URLs below come from the completed profile.
$newProfile = [pscustomobject][ordered]@{
    key                = $Key
    name               = $Name
    kind               = "plugin"
    dir                = "src/$className"
    addonId            = $AddonId
    pluginType         = $Type
    requiredApiVersion = $RequiredApiVersion
}
$profile = Complete-ExtensionProfile -Profile ($newProfile.PSObject.Copy()) -Index $index
$projectPath = $profile.project
$manifestPath = $profile.extensionManifest
$installerPath = $profile.installerManifest
$databasePath = $profile.databaseManifest
$propsPath = $profile.directoryBuildProps

New-Item -ItemType Directory -Path (Join-Path $extensionDir "src") -Force | Out-Null
New-Item -ItemType Directory -Path (Join-Path $extensionDir "info") -Force | Out-Null

$assemblyVersion = if ($Version -match "^\d+\.\d+\.\d+$") { "$Version.0" } else { $Version }
$installerUrl = "$($profile.rawBaseUrl)/$installerPath"
$iconUrl = "$($profile.rawBaseUrl)/$($profile.dir)/info/icon.png"
$packageUrl = Get-ExpectedPackageUrl -Profile $profile -AddonId $AddonId -Version $Version
$source = $profile.sourceUrl
$pluginGuid = ([guid]::NewGuid()).ToString().ToUpperInvariant()

# Each Playnite plugin type has different abstract members; emit a skeleton that compiles as-is.
switch ($Type) {
    "GenericPlugin" {
        $pluginUsings = @"
using System;
using Playnite.SDK;
using Playnite.SDK.Plugins;
"@
        $pluginMembers = ""
        $propertiesType = "GenericPluginProperties"
    }
    "MetadataPlugin" {
        $pluginUsings = @"
using System;
using System.Collections.Generic;
using Playnite.SDK;
using Playnite.SDK.Plugins;
"@
        $pluginMembers = @"

        public override string Name => "$Name";

        // Fields this source can ever provide; Playnite lists the source only for these fields.
        public override List<MetadataField> SupportedFields { get; } = new List<MetadataField>();

        public override OnDemandMetadataProvider GetMetadataProvider(MetadataRequestOptions options)
        {
            return new ${className}MetadataProvider(options);
        }

"@
        $propertiesType = "MetadataPluginProperties"
    }
    "LibraryPlugin" {
        $pluginUsings = @"
using System;
using System.Collections.Generic;
using Playnite.SDK;
using Playnite.SDK.Models;
using Playnite.SDK.Plugins;
"@
        $pluginMembers = @"

        public override string Name => "$Name";

        public override IEnumerable<GameMetadata> GetGames(LibraryGetGamesArgs args)
        {
            return new List<GameMetadata>();
        }

"@
        $propertiesType = "LibraryPluginProperties"
    }
}

@"
<Project Sdk="Microsoft.NET.Sdk.WindowsDesktop">
  <PropertyGroup>
    <TargetFramework>net462</TargetFramework>
    <OutputType>Library</OutputType>
    <UseWPF>true</UseWPF>
    <CopyLocalLockFileAssemblies>false</CopyLocalLockFileAssemblies>
    <RootNamespace>$className</RootNamespace>
    <AssemblyName>$className</AssemblyName>
    <LangVersion>latest</LangVersion>
    <Nullable>disable</Nullable>
  </PropertyGroup>
  <ItemGroup>
    <PackageReference Include="PlayniteSDK" Version="$RequiredApiVersion">
      <PrivateAssets>all</PrivateAssets>
    </PackageReference>
  </ItemGroup>
  <ItemGroup>
    <None Include="info\extension.yaml">
      <Link>extension.yaml</Link>
      <CopyToOutputDirectory>PreserveNewest</CopyToOutputDirectory>
    </None>
    <None Include="info\icon.png">
      <Link>icon.png</Link>
      <CopyToOutputDirectory>PreserveNewest</CopyToOutputDirectory>
    </None>
  </ItemGroup>
</Project>
"@ | Set-Content -Path (Join-Path $repoRoot $projectPath) -Encoding UTF8

@"
<Project>
  <PropertyGroup>
    <Version>$Version</Version>
    <AssemblyVersion>$assemblyVersion</AssemblyVersion>
    <FileVersion>$assemblyVersion</FileVersion>
  </PropertyGroup>
</Project>
"@ | Set-Content -Path (Join-Path $repoRoot $propsPath) -Encoding UTF8

@"
$pluginUsings

namespace $className
{
    public class ${className}Plugin : $Type
    {
        private static readonly Guid PluginId = Guid.Parse("$pluginGuid");

        public override Guid Id => PluginId;
$pluginMembers
        public ${className}Plugin(IPlayniteAPI api) : base(api)
        {
            Properties = new $propertiesType
            {
                HasSettings = false
            };
        }
    }
}
"@ | Set-Content -Path (Join-Path $extensionDir "src/${className}Plugin.cs") -Encoding UTF8

if ($Type -eq "MetadataPlugin") {
@"
using System.Collections.Generic;
using Playnite.SDK.Plugins;

namespace $className
{
    // Playnite creates one provider per game per download; resolve lazily and cache per instance.
    public class ${className}MetadataProvider : OnDemandMetadataProvider
    {
        private readonly MetadataRequestOptions options;

        public ${className}MetadataProvider(MetadataRequestOptions options)
        {
            this.options = options;
        }

        public override List<MetadataField> AvailableFields { get; } = new List<MetadataField>();
    }
}
"@ | Set-Content -Path (Join-Path $extensionDir "src/${className}MetadataProvider.cs") -Encoding UTF8
}

@"
Id: $AddonId
Name: $Name
Author: $Author
Version: $Version
Module: $className.dll
Type: $Type
Icon: icon.png
Links:
  - Name: Plugin homepage
    Url: $source
  - Name: Installer manifest
    Url: $installerUrl
"@ | Set-Content -Path (Join-Path $repoRoot $manifestPath) -Encoding UTF8

@"
AddonId: $AddonId
Packages:
  - Version: $Version
    RequiredApiVersion: $RequiredApiVersion
    ReleaseDate: $((Get-Date).ToString("yyyy-MM-dd"))
    PackageUrl: $packageUrl
    Changelog:
      - Initial release
"@ | Set-Content -Path (Join-Path $repoRoot $installerPath) -Encoding UTF8

@"
AddonId: $AddonId
Type: $databaseType
Name: $Name
Author: $Author
ShortDescription: $Description
InstallerManifestUrl: $installerUrl
SourceUrl: $source
Description: |
  $Description
IconUrl: $iconUrl
Links:
  Plugin homepage: $source
"@ | Set-Content -Path (Join-Path $repoRoot $databasePath) -Encoding UTF8

$placeholderIcon = Join-RepoPath "src/Autogrid/info/icon.png"
if (Test-Path $placeholderIcon) {
    Copy-Item -Path $placeholderIcon -Destination (Join-Path $extensionDir "info/icon.png")
}

$index.extensions += $newProfile
Save-ExtensionIndex -Index $index

dotnet sln (Join-Path $repoRoot "playnite-extensions.sln") add (Join-Path $repoRoot $projectPath) | Out-Null

Write-Host "Created extension '$Name' at $extensionDir"
Write-Host "Next steps:"
Write-Host "  1. Replace info/icon.png (.\scripts\render-addon-icon.ps1 -Svg <mark.svg> -Extension $Key)."
Write-Host "  2. Write src/$className/AGENTS.md (what it does, files, settings, how to test)."
Write-Host "  3. Run .\scripts\validate-extension.ps1 -Extension $Key"
