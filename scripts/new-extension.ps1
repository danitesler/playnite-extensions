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
    [string]$Version = "0.1.0",
    [string]$SourceUrl = "",
    [string]$RawBaseUrl = "",
    [string]$ReleaseBaseUrl = "",
    [string]$TagPattern = "{key}/v{version}"
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

function Convert-ToDatabaseType {
    param([string]$PluginType)
    switch ($PluginType) {
        "GenericPlugin" { return "Generic" }
        "MetadataPlugin" { return "Metadata" }
        "LibraryPlugin" { return "Library" }
    }
}

$repoRoot = Get-RepoRoot
$className = Convert-ToIdentifier $Name
$extensionDir = Join-Path $repoRoot "src/$className"
$projectPath = "src/$className/$className.csproj"
$manifestPath = "src/$className/info/extension.yaml"
$installerPath = "src/$className/info/InstallerManifest.yaml"
$databasePath = "src/$className/info/danitesler_$($Key.ToLowerInvariant()).yaml"
$propsPath = "src/$className/Directory.Build.props"
$outputPath = "src/$className/bin/Release/net462"
$databaseType = Convert-ToDatabaseType $Type

if (-not $AddonId) {
    $AddonId = "{0}_{1}" -f $className, (([guid]::NewGuid()).ToString("N").Substring(0, 8).ToUpperInvariant())
}

$profilesPath = Join-RepoPath "src/extensions.json"
$profiles = Get-Content -Raw -Path $profilesPath | ConvertFrom-Json
if ($profiles.extensions | Where-Object { $_.key -eq $Key -or $_.addonId -eq $AddonId }) {
    throw "An extension with key '$Key' or AddonId '$AddonId' already exists."
}

if (Test-Path $extensionDir) {
    throw "Extension directory already exists at $extensionDir"
}

New-Item -ItemType Directory -Path (Join-Path $extensionDir "src") -Force | Out-Null
New-Item -ItemType Directory -Path (Join-Path $extensionDir "info") -Force | Out-Null

$assemblyVersion = if ($Version -match "^\d+\.\d+\.\d+$") { "$Version.0" } else { $Version }
$installerUrl = if ($RawBaseUrl) { "$RawBaseUrl/$installerPath" } else { "https://raw.githubusercontent.com/<owner>/<repo>/main/$installerPath" }
$iconUrl = if ($RawBaseUrl) { "$RawBaseUrl/src/$className/info/icon.png" } else { "https://raw.githubusercontent.com/<owner>/<repo>/main/src/$className/info/icon.png" }
$packageTag = $TagPattern.Replace("{key}", $Key).Replace("{version}", $Version)
$packageUrlBase = if ($ReleaseBaseUrl) { $ReleaseBaseUrl } else { "https://github.com/<owner>/<repo>/releases/download" }
$packageUrl = "$packageUrlBase/$packageTag/$(Get-ExpectedPextName -AddonId $AddonId -Version $Version)"
$source = if ($SourceUrl) { $SourceUrl } else { "https://github.com/<owner>/<repo>" }
$propertiesBlock = if ($Type -eq "GenericPlugin") {
@"
            Properties = new GenericPluginProperties
            {
                HasSettings = false
            };
"@
}
else {
@"
            // Add type-specific Playnite plugin properties and overrides here.
"@
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
using System;
using Playnite.SDK;
using Playnite.SDK.Plugins;

namespace $className
{
    public class ${className}Plugin : $Type
    {
        private static readonly Guid PluginId = Guid.Parse("$(([guid]::NewGuid()).ToString().ToUpperInvariant())");

        public override Guid Id => PluginId;

        public ${className}Plugin(IPlayniteAPI api) : base(api)
        {
$propertiesBlock
        }
    }
}
"@ | Set-Content -Path (Join-Path $extensionDir "src/${className}Plugin.cs") -Encoding UTF8

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
Type: $databaseType
Name: $Name
Author: $Author
ShortDescription: "$Description"
InstallerManifestUrl: $installerUrl
SourceUrl: $source
Description: |
  $Description
Packages:
  - Version: $Version
    RequiredApiVersion: $RequiredApiVersion
    ReleaseDate: $((Get-Date).ToString("yyyy-MM-dd"))
    PackageUrl: $packageUrl
    Changelog:
      - Initial release.
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

$newProfile = [pscustomobject]@{
    key                 = $Key
    slug                = $Key
    name                = $Name
    addonId             = $AddonId
    type                = $databaseType
    pluginType          = $Type
    project             = $projectPath
    extensionManifest   = $manifestPath
    installerManifest   = $installerPath
    databaseManifest    = $databasePath
    outputPath          = $outputPath
    directoryBuildProps = $propsPath
    requiredApiVersion  = $RequiredApiVersion
    sourceUrl           = $source
    rawBaseUrl          = $RawBaseUrl
    releaseBaseUrl      = $ReleaseBaseUrl
    tagPattern          = $TagPattern
}

$profiles.extensions += $newProfile
$profiles | ConvertTo-Json -Depth 8 | Set-Content -Path $profilesPath -Encoding UTF8

Write-Host "Created extension '$Name' at $extensionDir"
Write-Host "Next steps:"
Write-Host "  1. Replace info/icon.png."
Write-Host "  2. Add $projectPath to playnite-extensions.sln if you use Visual Studio solution builds."
Write-Host "  3. Run ./scripts/validate-extension.ps1 -Extension $Key"

