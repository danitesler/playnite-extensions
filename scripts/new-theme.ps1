[CmdletBinding()]
param(
    [Parameter(Mandatory = $true)]
    [string]$Name,

    [Parameter(Mandatory = $true)]
    [string]$Key,

    # The design system's name. Every resource key the theme adds starts with it (PrimerButtonPrimaryBgBrush,
    # FluentNeutralBackground1Brush, ...); build-theme.ps1 rejects keys that do not.
    [Parameter(Mandatory = $true)]
    [string]$Prefix,

    # Optional: a stylesheet with the design system's CSS custom properties (its published dark theme CSS, a
    # generated globals.css, ...). Copied verbatim into src/tokens.css; otherwise tokens.css starts empty.
    [string]$TokensCss = "",

    [ValidateSet("Desktop")]
    [string]$Mode = "Desktop",

    [string]$Author = $env:USERNAME,
    [string]$Description = "A dark Playnite desktop theme.",
    [string]$Version = "0.1.0",

    # 2.9.0 = Playnite 10.45+. Raise it only when the theme starts using something newer.
    [string]$ThemeApiVersion = "2.9.0",

    [string]$TagPattern = "{key}-v{version}"
)

# Scaffolds a standalone theme: the folder layout every theme here shares (AGENTS.md, info/, src/), its manifests,
# and a Constants template listing Playnite's palette keys as {{TODO}} placeholders. It copies nothing from other
# themes: the tokens, keys, shell and controls come from the new design system's own spec.

$ErrorActionPreference = "Stop"
. (Join-Path $PSScriptRoot "extension-profiles.ps1")
. (Join-Path $PSScriptRoot "theme-tools.ps1")

$repoRoot = Get-RepoRoot
# "Material UI Theme" -> MaterialUiTheme: all-caps words become Pascal case, like the existing folders.
$dirName = -join (($Name -split "[^A-Za-z0-9]+" | Where-Object { $_ }) | ForEach-Object {
        if ($_.Length -gt 1 -and $_ -ceq $_.ToUpperInvariant()) { $_.Substring(0, 1) + $_.Substring(1).ToLowerInvariant() }
        else { $_.Substring(0, 1).ToUpperInvariant() + $_.Substring(1) }
    })
if (-not $dirName -or $dirName[0] -match "[0-9]") {
    throw "Name '$Name' must start with a letter."
}
if ($Prefix -notmatch "^[A-Z][A-Za-z0-9]*$") {
    throw "Prefix '$Prefix' must be PascalCase letters and digits (e.g. Carbon, Radix, Ant)."
}
$Key = $Key.ToLowerInvariant()
$themeRoot = Join-Path $repoRoot "src/$dirName"
if (Test-Path $themeRoot) {
    throw "Theme directory already exists at $themeRoot"
}

$profilesPath = Join-RepoPath "src/extensions.json"
$profiles = Get-Content -Raw -Path $profilesPath | ConvertFrom-Json
if ($profiles.extensions | Where-Object { $_.key -eq $Key }) {
    throw "An extension with key '$Key' already exists."
}
if ($profiles.extensions | Where-Object { $_.resourcePrefix -eq $Prefix }) {
    throw "Another theme already uses the resource prefix '$Prefix'."
}
if ($TokensCss) {
    Read-ThemeTokens -Path $TokensCss | Out-Null
}

# URLs follow the existing add-ons so every manifest points at the same repo.
$reference = $profiles.extensions | Where-Object { $_.rawBaseUrl -and $_.releaseBaseUrl -and $_.sourceUrl } | Select-Object -First 1
if (-not $reference) {
    throw "No existing profile with rawBaseUrl / releaseBaseUrl / sourceUrl to copy repo URLs from."
}
$rawBaseUrl = $reference.rawBaseUrl
$releaseBaseUrl = $reference.releaseBaseUrl
$sourceUrl = ($reference.sourceUrl -replace "/src/[^/]+/?$", "") + "/src/$dirName"
$issuesUrl = ($sourceUrl -replace "/tree/.*$", "") + "/issues"

$addonId = "{0}_{1}" -f $dirName, (([guid]::NewGuid()).ToString("N").Substring(0, 8).ToUpperInvariant())
$infoRel = "src/$dirName/info"
$sourceRel = "src/$dirName/src"
$manifestRel = "$infoRel/theme.yaml"
$installerRel = "$infoRel/InstallerManifest.yaml"
$databaseRel = "$infoRel/danitesler_$Key.yaml"
$tag = $TagPattern.Replace("{key}", $Key).Replace("{version}", $Version)
$packageUrl = "$releaseBaseUrl/$tag/$(Get-ExpectedPackageName -AddonId $addonId -Version $Version -PackageExtension '.pthm')"

New-Item -ItemType Directory -Path (Join-Path $repoRoot $infoRel) -Force | Out-Null
New-Item -ItemType Directory -Path (Join-Path $repoRoot $sourceRel) -Force | Out-Null

# Theme XAML starts from Playnite's Default theme files (MIT); the notice ships inside the package.
Copy-Item -Path (Join-Path $PSScriptRoot "data/LICENSE-Playnite.txt") -Destination (Join-Path $repoRoot "$infoRel/LICENSE-Playnite.txt")

@"
Id: $addonId
Name: $Name
Author: $Author
Version: $Version
Mode: $Mode
ThemeApiVersion: $ThemeApiVersion
Links:
  - Name: github
    Url: $sourceUrl
  - Name: issues
    Url: $issuesUrl
"@ | Set-Content -Path (Join-Path $repoRoot $manifestRel) -Encoding utf8

@"
AddonId: $addonId
Packages:
  - Version: $Version
    RequiredApiVersion: $ThemeApiVersion
    ReleaseDate: $((Get-Date).ToString("yyyy-MM-dd"))
    PackageUrl: $packageUrl
    Changelog:
      - Initial release
"@ | Set-Content -Path (Join-Path $repoRoot $installerRel) -Encoding utf8

@"
AddonId: $addonId
Type: Theme$Mode
Name: $Name
Author: $Author
ShortDescription: $Description
InstallerManifestUrl: $rawBaseUrl/$installerRel
SourceUrl: $sourceUrl
Description: |
  $Description
Tags: [Dark, $Mode]
IconUrl: $rawBaseUrl/$infoRel/icon.png
Links:
  Theme homepage: $sourceUrl
  Report issue: $issuesUrl
"@ | Set-Content -Path (Join-Path $repoRoot $databaseRel) -Encoding utf8

$tokensTarget = Join-Path $repoRoot "$sourceRel/tokens.css"
if ($TokensCss) {
    Copy-Item -Path $TokensCss -Destination $tokensTarget
}
else {
    @"
/*
 * $Name tokens: $Prefix's own CSS custom properties, under the names $Prefix publishes them with.
 * Source: <package, file and version the values come from>
 *
 * :root and @theme blocks hold scheme-independent tokens (radii, spacing, font stacks); .dark holds the dark
 * values and wins. Constants.template.xaml reads them with {{token}} placeholders.
 */

:root {
}

.dark {
}
"@ | Set-Content -Path $tokensTarget -Encoding utf8
}

@"
<!--
    $Name`: Constants.xaml template. scripts/build-theme.ps1 renders it with tokens.css into Constants.xaml.

    1. $Prefix tokens: one Color + one Brush per token the theme's XAML uses, keyed $Prefix<TokenName>Color and
       $Prefix<TokenName>Brush after the token's own name. Add them as the controls need them.
    2. Playnite's palette keys below: map each to the $Prefix token for that role. Every Playnite view and control
       the theme does not restyle reads only these. Each TODO placeholder fails the build until it names a token.

    Placeholder syntax: .cursor/skills/playnite-theme-dev/SKILL.md. Keep double braces out of comments here: the
    build renders them too.
-->
<ResourceDictionary xmlns="http://schemas.microsoft.com/winfx/2006/xaml/presentation"
                    xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml"
                    xmlns:sys="clr-namespace:System;assembly=mscorlib">

    <!-- Typography (Playnite keys): $Prefix's type scale and font stack. -->
    <sys:Double x:Key="FontSizeSmall">12</sys:Double>
    <sys:Double x:Key="FontSize">14</sys:Double>
    <sys:Double x:Key="FontSizeLarge">15</sys:Double>
    <sys:Double x:Key="FontSizeLarger">20</sys:Double>
    <sys:Double x:Key="FontSizeLargest">29</sys:Double>
    <FontFamily x:Key="FontFamily">Segoe UI</FontFamily>
    <FontFamily x:Key="MonospaceFontFamily">Consolas</FontFamily>

    <!-- Shape (Playnite keys) -->
    <Thickness x:Key="PopupBorderThickness">1</Thickness>
    <Thickness x:Key="ControlBorderThickness">1</Thickness>
    <sys:Double x:Key="EllipseBorderThickness">1</sys:Double>
    <CornerRadius x:Key="ControlCornerRadius">{{TODO}}</CornerRadius> <!-- control radius: a px placeholder on the radius token -->
    <Thickness x:Key="SidebarItemPadding">8</Thickness>

    <!-- $Prefix tokens -->

    <!-- Playnite palette keys -->
    <Color x:Key="BlackColor">#FF000000</Color>
    <Color x:Key="WhiteColor">#FFFFFFFF</Color>
    <Color x:Key="TextColor">{{TODO}}</Color>                  <!-- default text -->
    <Color x:Key="TextColorDarker">{{TODO}}</Color>            <!-- secondary / muted text -->
    <Color x:Key="TextColorDark">{{TODO}}</Color>              <!-- text on GlyphColor fills (selected rows, play button) -->
    <Color x:Key="MainColor">{{TODO}}</Color>                  <!-- control fill -->
    <Color x:Key="MainColorDark">{{TODO}}</Color>              <!-- raised surface (panels, cards) -->
    <Color x:Key="HoverColor">{{TODO}}</Color>                 <!-- hover fill -->
    <Color x:Key="GlyphColor">{{TODO}}</Color>                 <!-- accent: selection, checked, links -->
    <Color x:Key="HighlightGlyphColor">{{TODO}}</Color>        <!-- accent at partial strength -->
    <Color x:Key="PopupBackgroundColor">{{TODO}}</Color>       <!-- menus, popovers, dropdowns -->
    <Color x:Key="PopupBorderColor">{{TODO}}</Color>           <!-- popup edge; flatten translucent strokes onto the popup (@surface) -->
    <Color x:Key="BackgroundToneColor">{{TODO}}</Color>        <!-- tinted areas in Playnite's views -->
    <Color x:Key="GridItemBackgroundColor">#00000000</Color>   <!-- frame around covers; transparent = no frame -->
    <Color x:Key="PanelSeparatorColor">#00000000</Color>       <!-- lines between library panels -->
    <Color x:Key="WindowPanelSeparatorColor">{{TODO}}</Color>  <!-- dividers inside dialogs -->
    <Color x:Key="DataChangeNotifColor">{{TODO}}</Color>       <!-- "data changed" warning text -->

    <SolidColorBrush x:Key="ControlBackgroundBrush" Color="Transparent" />
    <SolidColorBrush x:Key="TextBrush" Color="{DynamicResource TextColor}" />
    <SolidColorBrush x:Key="TextBrushDarker" Color="{DynamicResource TextColorDarker}" />
    <SolidColorBrush x:Key="TextBrushDark" Color="{DynamicResource TextColorDark}" />
    <SolidColorBrush x:Key="NormalBrush" Color="{DynamicResource MainColor}" />
    <SolidColorBrush x:Key="NormalBrushDark" Color="{DynamicResource MainColorDark}" />
    <SolidColorBrush x:Key="NormalBorderBrush" Color="{{TODO}}" />       <!-- control edge -->
    <SolidColorBrush x:Key="HoverBrush" Color="{DynamicResource HoverColor}" />
    <SolidColorBrush x:Key="GlyphBrush" Color="{DynamicResource GlyphColor}" />
    <SolidColorBrush x:Key="HighlightGlyphBrush" Color="{DynamicResource HighlightGlyphColor}" />
    <SolidColorBrush x:Key="PopupBorderBrush" Color="{DynamicResource PopupBorderColor}" />
    <SolidColorBrush x:Key="TooltipBackgroundBrush" Color="{{TODO}}" />  <!-- tooltip fill -->
    <SolidColorBrush x:Key="ButtonBackgroundBrush" Color="{{TODO}}" />   <!-- Playnite's own button fill -->
    <SolidColorBrush x:Key="GridItemBackgroundBrush" Color="{DynamicResource GridItemBackgroundColor}" />
    <SolidColorBrush x:Key="PanelSeparatorBrush" Color="{DynamicResource PanelSeparatorColor}" />
    <SolidColorBrush x:Key="WindowPanelSeparatorBrush" Color="{DynamicResource WindowPanelSeparatorColor}" />
    <SolidColorBrush x:Key="PopupBackgroundBrush" Color="{DynamicResource PopupBackgroundColor}" />
    <SolidColorBrush x:Key="CheckBoxCheckMarkBkBrush" Color="{{TODO}}" /> <!-- unchecked box fill -->
    <SolidColorBrush x:Key="DataChangeNotifBrush" Color="{DynamicResource DataChangeNotifColor}" />

    <SolidColorBrush x:Key="PositiveRatingBrush" Color="{{TODO}}" />     <!-- success -->
    <SolidColorBrush x:Key="NegativeRatingBrush" Color="{{TODO}}" />     <!-- danger -->
    <SolidColorBrush x:Key="MixedRatingBrush" Color="{{TODO}}" />        <!-- warning -->

    <SolidColorBrush x:Key="WarningBrush" Color="{{TODO}}" />            <!-- danger / warning text and icons -->

    <SolidColorBrush x:Key="ExpanderBackgroundBrush" Color="{{TODO}}" /> <!-- expander header fill -->
    <SolidColorBrush x:Key="WindowBackgourndBrush" Color="{{TODO}}" />   <!-- window background (Playnite's spelling) -->
</ResourceDictionary>
"@ | Set-Content -Path (Join-Path $repoRoot "$sourceRel/Constants.template.xaml") -Encoding utf8

@"
# $Name — theme notes

## What this is

Playnite **$Mode** theme (``ThemeApiVersion`` $ThemeApiVersion) in the style of **$Prefix**. Standalone: every file it ships lives in this folder. Resource keys it adds start with ``$Prefix`` and follow $Prefix's own token and component names.

## Sources

| What | Where (package, version, file) |
|------|--------------------------------|
| Tokens | TODO |
| Components | TODO |
| Icons | TODO (license file in ``info/``) |

## Files

| Path | Role |
|------|------|
| ``src/tokens.css`` | $Prefix's CSS custom properties under their own names; ``.dark`` wins over ``:root``. |
| ``src/Constants.template.xaml`` | Tokens -> ``$Prefix*`` Color/Brush keys and Playnite's palette keys; rendered into ``Constants.xaml``. |
| ``src/Common.xaml`` | ``PopupBorder``, the focus visual, and $Prefix's component metrics. |
| ``src/Media.xaml`` | $Prefix's icon set. |
| ``src/Views/*``, ``src/DerivedStyles/MainWindowStyle.xaml``, ``src/CustomControls/SidebarItem.xaml``, ``TopPanelItem.xaml`` | Shell: how $Prefix lays out an app. |
| ``src/DefaultControls/*``, other ``src/CustomControls/*``, ``src/DerivedStyles/*`` | Controls, each from a $Prefix component. |
| ``info/`` | ``theme.yaml``, installer and add-on database manifests, ``icon.png`` (512x512), ``LICENSE-*.txt`` notices shipped in the package. |

## Components

| Playnite file | $Prefix component | Notes |
|---------------|-------------------|-------|
| TODO | | |

## Known gaps

## Build and try it

``````powershell
.\scripts\build-theme.ps1 -Extension $Key -Deploy
# restart Playnite -> Settings -> Appearance -> Theme: $Name
``````
"@ | Set-Content -Path (Join-Path $themeRoot "AGENTS.md") -Encoding utf8

$newProfile = [pscustomobject]@{
    key                = $Key
    slug               = $Key
    name               = $Name
    kind               = "theme"
    addonId            = $addonId
    type               = "Theme$Mode"
    themeSource        = $sourceRel
    resourcePrefix     = $Prefix
    extensionManifest  = $manifestRel
    installerManifest  = $installerRel
    databaseManifest   = $databaseRel
    outputPath         = "artifacts/builds/$Key"
    requiredApiVersion = $ThemeApiVersion
    sourceUrl          = $sourceUrl
    rawBaseUrl         = $rawBaseUrl
    releaseBaseUrl     = $releaseBaseUrl
    tagPattern         = $TagPattern
}

$profiles.extensions += $newProfile
$profiles | ConvertTo-Json -Depth 8 | Set-Content -Path $profilesPath -Encoding UTF8

Write-Host "Created theme '$Name' at $themeRoot"
Write-Host "Next steps (details: .cursor/skills/playnite-theme-dev/SKILL.md):"
Write-Host "  1. Fill AGENTS.md > Sources: $Prefix's token package, component specs and icon set."
Write-Host "  2. src/tokens.css: $Prefix's dark tokens under their own names."
Write-Host "  3. src/Constants.template.xaml: replace every {{TODO}}, add the $Prefix* tokens the controls need."
Write-Host "  4. Common.xaml, Media.xaml, the shell, then controls, each from Playnite's Default file at the tag in scripts/data/playnite-theme-api.json."
Write-Host "  5. Add info/icon.png (512x512), then .\scripts\build-theme.ps1 -Extension $Key -Deploy and restart Playnite."
