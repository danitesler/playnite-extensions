[CmdletBinding()]
param(
    [Parameter(Mandatory = $true)]
    [string]$Name,

    [Parameter(Mandatory = $true)]
    [string]$Key,

    # The design system's name, for comments and AGENTS.md (defaults to Name without "Theme"). Resource keys do not
    # carry it: every theme uses Playnite's keys and the shared keys in scripts/data/theme-keys.json.
    [string]$DesignSystem = "",

    # Optional: a stylesheet with the design system's CSS custom properties (its published dark theme CSS, a
    # generated globals.css, ...). Copied verbatim into src/tokens.css; otherwise tokens.css starts empty.
    [string]$TokensCss = "",

    [ValidateSet("Desktop")]
    [string]$Mode = "Desktop",

    [string]$Author = $env:USERNAME,
    [string]$Description = "A dark Playnite desktop theme.",
    [string]$Version = "0.1.0",

    # 2.9.0 = Playnite 10.45+. Raise it only when the theme starts using something newer.
    [string]$ThemeApiVersion = "2.9.0"
)

# Scaffolds a standalone theme: the folder layout every theme here shares (AGENTS.md, info/, src/), its manifests,
# and a Constants template listing Playnite's palette keys and the required shared keys as {{TODO}} placeholders.
# It copies nothing from other themes: tokens, shell and controls come from the new design system's own spec; only the
# key names are shared (scripts/data/theme-keys.json).

$ErrorActionPreference = "Stop"
. (Join-Path $PSScriptRoot "extension-profiles.ps1")
. (Join-Path $PSScriptRoot "theme-tools.ps1")

$repoRoot = Get-RepoRoot
# "Material UI" -> MaterialUi: all-caps words become Pascal case, like the existing folders.
$dirName = -join (($Name -split "[^A-Za-z0-9]+" | Where-Object { $_ }) | ForEach-Object {
        if ($_.Length -gt 1 -and $_ -ceq $_.ToUpperInvariant()) { $_.Substring(0, 1) + $_.Substring(1).ToLowerInvariant() }
        else { $_.Substring(0, 1).ToUpperInvariant() + $_.Substring(1) }
    })
if (-not $dirName -or $dirName[0] -match "[0-9]") {
    throw "Name '$Name' must start with a letter."
}
if (-not $DesignSystem) {
    $DesignSystem = ($Name -replace "\s*Theme$", "").Trim()
}
$Key = $Key.ToLowerInvariant()
$themeRoot = Join-Path $repoRoot "src/themes/$dirName"
if (Test-Path $themeRoot) {
    throw "Theme directory already exists at $themeRoot"
}

$index = Get-ExtensionIndex
if ($index.extensions | Where-Object { $_.key -eq $Key }) {
    throw "An extension with key '$Key' already exists."
}
if ($TokensCss) {
    Read-ThemeTokens -Path $TokensCss | Out-Null
}

$addonId = "{0}_{1}" -f $dirName, (([guid]::NewGuid()).ToString("N").Substring(0, 8).ToUpperInvariant())

# The index row holds only what cannot be derived; paths and URLs below come from the completed profile.
$newProfile = [pscustomobject]@{
    key                = $Key
    name               = $Name
    kind               = "theme"
    dir                = "src/themes/$dirName"
    addonId            = $addonId
    requiredApiVersion = $ThemeApiVersion
}
$profile = Complete-ExtensionProfile -Profile ($newProfile.PSObject.Copy()) -Index $index
$sourceUrl = $profile.sourceUrl
$issuesUrl = "$($index.repository.TrimEnd('/'))/issues"
$rawBaseUrl = $profile.rawBaseUrl
$infoRel = "$($profile.dir)/info"
$sourceRel = $profile.themeSource
$manifestRel = $profile.extensionManifest
$installerRel = $profile.installerManifest
$databaseRel = $profile.databaseManifest
$packageUrl = Get-ExpectedPackageUrl -Profile $profile -AddonId $addonId -Version $Version

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
 * $Name tokens: $DesignSystem's own CSS custom properties, under the names $DesignSystem publishes them with.
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

# Required shared brushes, straight from the vocabulary so the scaffold never drifts from the build check.
$catalog = Get-ThemeKeyCatalog
$sharedLines = foreach ($group in $catalog.Groups) {
    $entries = @($catalog.Entries | Where-Object { $_.group -eq $group -and $_.required -and $_.type -eq "Brush" })
    if ($entries.Count -eq 0) { continue }
    "    <!-- $group -->"
    foreach ($entry in $entries) {
        '    <SolidColorBrush x:Key="{0}" Color="{{{{TODO}}}}" />  <!-- {1} -->' -f $entry.key, $entry.description
    }
}
$sharedBlock = $sharedLines -join "`n"

@"
<!--
    $Name`: Constants.xaml template. scripts/build-theme.ps1 renders it with tokens.css into Constants.xaml.

    Keys are the shared theme vocabulary (scripts/data/theme-keys.json), the same in every theme of this repo.
    $DesignSystem's token names stay in tokens.css; here each placeholder names the token that plays the key's role.
    1. Playnite's palette keys: every view and control the theme does not restyle reads them, and ThemeModifier edits
       them. Map each to $DesignSystem's token for that role.
    2. Shared keys: the required ones are listed; add optional ones from theme-keys.json as the controls need them.
       Use a Playnite key whenever the design uses that key's token for the role; a shared key otherwise.
    Each TODO placeholder fails the build until it names a token. Theme XAML reads brushes only, never Color keys.

    Placeholder syntax: .claude/skills/playnite-theme-dev/reference.md. Keep double braces out of comments here: the build renders
    them too.
-->
<ResourceDictionary xmlns="http://schemas.microsoft.com/winfx/2006/xaml/presentation"
                    xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml"
                    xmlns:sys="clr-namespace:System;assembly=mscorlib">

    <!-- Typography (Playnite keys): $DesignSystem's type scale and font stack. -->
    <sys:Double x:Key="FontSizeSmall">12</sys:Double>
    <sys:Double x:Key="FontSize">14</sys:Double>
    <sys:Double x:Key="FontSizeLarge">15</sys:Double>
    <sys:Double x:Key="FontSizeLarger">20</sys:Double>
    <sys:Double x:Key="FontSizeLargest">29</sys:Double>
    <FontFamily x:Key="FontFamily">Segoe UI</FontFamily>
    <FontFamily x:Key="MonospaceFontFamily">Consolas</FontFamily>

    <!-- Shape (Playnite keys). ControlCornerRadius is the medium step of the radius scale. -->
    <Thickness x:Key="PopupBorderThickness">1</Thickness>
    <Thickness x:Key="ControlBorderThickness">1</Thickness>
    <sys:Double x:Key="EllipseBorderThickness">1</sys:Double>
    <CornerRadius x:Key="ControlCornerRadius">{{TODO}}</CornerRadius> <!-- a px placeholder on the medium radius token -->
    <Thickness x:Key="SidebarItemPadding">8</Thickness>

    <!-- Radius scale (shared, as the design needs them): CornerRadiusSmall, CornerRadiusLarge, CornerRadiusXLarge, CornerRadiusFull -->

    <!-- Playnite palette -->
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
    <Color x:Key="WindowPanelSeparatorColor">{{TODO}}</Color>  <!-- dividers and card edges -->
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
    <SolidColorBrush x:Key="ButtonBackgroundBrush" Color="{{TODO}}" />   <!-- button fill -->
    <SolidColorBrush x:Key="GridItemBackgroundBrush" Color="{DynamicResource GridItemBackgroundColor}" />
    <SolidColorBrush x:Key="PanelSeparatorBrush" Color="{DynamicResource PanelSeparatorColor}" />
    <SolidColorBrush x:Key="WindowPanelSeparatorBrush" Color="{DynamicResource WindowPanelSeparatorColor}" />
    <SolidColorBrush x:Key="PopupBackgroundBrush" Color="{DynamicResource PopupBackgroundColor}" />
    <SolidColorBrush x:Key="CheckBoxCheckMarkBkBrush" Color="{{TODO}}" /> <!-- unchecked check box and radio fill -->
    <SolidColorBrush x:Key="DataChangeNotifBrush" Color="{DynamicResource DataChangeNotifColor}" />

    <SolidColorBrush x:Key="PositiveRatingBrush" Color="{{TODO}}" />     <!-- success -->
    <SolidColorBrush x:Key="NegativeRatingBrush" Color="{{TODO}}" />     <!-- danger -->
    <SolidColorBrush x:Key="MixedRatingBrush" Color="{{TODO}}" />        <!-- warning -->

    <SolidColorBrush x:Key="WarningBrush" Color="{{TODO}}" />            <!-- warnings, errors, the update icon -->

    <SolidColorBrush x:Key="ExpanderBackgroundBrush" Color="{{TODO}}" /> <!-- cards: group boxes and expanders -->
    <SolidColorBrush x:Key="WindowBackgourndBrush" Color="{{TODO}}" />   <!-- window background (Playnite's spelling) -->

    <!-- Shared keys: roles Playnite's palette has no key for. ThemeModifier lists them under Edit constants. -->
$sharedBlock
</ResourceDictionary>
"@ | Set-Content -Path (Join-Path $repoRoot "$sourceRel/Constants.template.xaml") -Encoding utf8

@"
# $Name — theme notes

## What this is

Playnite **$Mode** theme (``ThemeApiVersion`` $ThemeApiVersion) in the style of **$DesignSystem**. TODO: version and dark variant.

Shared anatomy (file map, shell rules, game page skeleton, metadata pane, build and first-run checks): **``../AGENTS.md``**. Loading rules and build checks: **``.claude/skills/playnite-theme-dev/reference.md``**.

## Sources

| What | Where (package, version, file) |
|------|--------------------------------|
| Tokens | TODO |
| Components | TODO |
| Icons | TODO (license file in ``info/``) |

## Tokens

Which $DesignSystem token plays each key (Playnite palette first, then shared keys), radii and fonts.

| Token | Key | Used for |
|-------|-----|----------|
| TODO | | |

## Component spacing (``src/Common.xaml``)

| Key | Value | $DesignSystem |
|-----|-------|---------------|
| TODO | | |

## Shell

| File | What it draws |
|------|---------------|
| TODO | |

## Components

| Playnite file | $DesignSystem component |
|---------------|-------------------------|
| TODO | |

## Deviations

## Not verified yet
"@ | Set-Content -Path (Join-Path $themeRoot "AGENTS.md") -Encoding utf8

$index.extensions += $newProfile
Save-ExtensionIndex -Index $index

Write-Host "Created theme '$Name' at $themeRoot"
Write-Host "Next steps (details: .claude/skills/playnite-theme-dev/SKILL.md):"
Write-Host "  1. Fill AGENTS.md > Sources: $DesignSystem's token package, component specs and icon set."
Write-Host "  2. src/tokens.css: $DesignSystem's dark tokens under their own names."
Write-Host "  3. src/Constants.template.xaml: replace every {{TODO}} with the token for that key's role."
Write-Host "  4. Common.xaml, Media.xaml, the shell, then controls, each from Playnite's Default file at the tag in scripts/data/playnite-theme-api.json."
Write-Host "     Keys come from scripts/data/theme-keys.json; the build lists required ones still missing."
Write-Host "  5. Add info/icon.png (512x512), then .\scripts\build-theme.ps1 -Extension $Key -Deploy and restart Playnite."
