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

$artRel = "$($profile.dir)/art"
New-Item -ItemType Directory -Path (Join-Path $repoRoot $infoRel) -Force | Out-Null
New-Item -ItemType Directory -Path (Join-Path $repoRoot $sourceRel) -Force | Out-Null
New-Item -ItemType Directory -Path (Join-Path $repoRoot $artRel) -Force | Out-Null


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

@"
<!doctype html>
<!-- ${Name}: approximate HTML replica of Playnite Game Details view -->
<html>
<head>
<meta charset="utf-8">
<title>$Name - Details Preview</title>
<style>
  :root {
    --bg: #121214; --surface: #1a1a1e; --panel: #202026; --border: #33333d;
    --text: #ffffff; --text-muted: #9e9ea8; --accent: #6366f1; --accent-hover: #4f46e5;
    --accent-text: #ffffff; --radius: 8px; --chip-bg: #282830;
  }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { width: 1600px; height: 900px; overflow: hidden; background: var(--bg); color: var(--text); font-family: "Segoe UI", system-ui, sans-serif; font-size: 14px; display: flex; }
  .rail { width: 44px; background: var(--surface); border-right: 1px solid var(--border); display: flex; flex-direction: column; align-items: center; padding-top: 12px; gap: 8px; z-index: 10; }
  .rail-btn { width: 36px; height: 36px; border-radius: var(--radius); display: flex; align-items: center; justify-content: center; color: var(--text-muted); cursor: pointer; }
  .rail-btn.active { background: var(--accent); color: var(--accent-text); }
  .rail-btn svg { width: 18px; height: 18px; fill: currentColor; }
  .main { flex: 1; display: flex; flex-direction: column; overflow: hidden; position: relative; }
  .top-bar { height: 48px; background: var(--surface); border-bottom: 1px solid var(--border); display: flex; align-items: center; padding: 0 16px; gap: 12px; }
  .nav-tabs { display: flex; gap: 4px; }
  .tab { padding: 6px 14px; border-radius: var(--radius); color: var(--text-muted); font-size: 13px; font-weight: 500; }
  .tab.active { background: var(--panel); color: var(--text); }
  .search { margin-left: auto; width: 260px; height: 32px; background: var(--bg); border: 1px solid var(--border); border-radius: var(--radius); padding: 0 10px; color: var(--text); font-size: 13px; display: flex; align-items: center; }
  .hero-banner { height: 320px; position: relative; background: radial-gradient(ellipse at 70% 30%, #3730a3 0%, #1e1b4b 60%, var(--bg) 100%); overflow: hidden; }
  .hero-wash { position: absolute; inset: 0; background: linear-gradient(to bottom, transparent 30%, var(--bg) 95%); }
  .hero-content { position: absolute; bottom: 24px; left: 32px; right: 32px; z-index: 5; }
  .game-title { font-size: 42px; font-weight: 800; line-height: 1.1; margin-bottom: 16px; text-shadow: 0 2px 10px rgba(0,0,0,0.5); }
  .action-row { display: flex; gap: 12px; align-items: center; }
  .play-btn { height: 44px; padding: 0 32px; background: var(--accent); color: var(--accent-text); border: none; border-radius: var(--radius); font-weight: 700; font-size: 16px; cursor: pointer; display: flex; align-items: center; gap: 8px; }
  .sub-btn { height: 44px; width: 44px; background: var(--panel); border: 1px solid var(--border); border-radius: var(--radius); color: var(--text); display: flex; align-items: center; justify-content: center; }
  .sub-btn svg { width: 18px; height: 18px; fill: currentColor; }
  .content-columns { flex: 1; display: flex; gap: 32px; padding: 24px 32px; overflow: hidden; }
  .left-col { flex: 1; display: flex; flex-direction: column; gap: 20px; }
  .screenshots-row { display: flex; gap: 12px; }
  .screen-thumb { flex: 1; height: 140px; border-radius: var(--radius); border: 1px solid var(--border); background: var(--panel); overflow: hidden; position: relative; }
  .desc-heading { font-size: 16px; font-weight: 600; margin-bottom: 8px; color: var(--text); }
  .desc-text { color: var(--text-muted); line-height: 1.6; font-size: 14px; }
  .right-col { width: 340px; background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); padding: 18px; height: fit-content; }
  .meta-group { margin-bottom: 16px; }
  .meta-group:last-child { margin-bottom: 0; }
  .meta-label { font-size: 11px; text-transform: uppercase; font-weight: 700; color: var(--text-muted); margin-bottom: 6px; letter-spacing: 0.5px; }
  .chips { display: flex; flex-wrap: wrap; gap: 6px; }
  .chip { background: var(--chip-bg); border: 1px solid var(--border); border-radius: 4px; padding: 4px 10px; font-size: 12px; color: var(--text); }
  .meta-value { font-size: 13px; color: var(--text); }
</style>
</head>
<body>
<div class="rail">
  <div class="rail-btn active"><svg viewBox="0 0 24 24"><path d="M4 18h16v-2H4v2zm0-5h16v-2H4v2zm0-7v2h16V6H4z"/></svg></div>
  <div class="rail-btn"><svg viewBox="0 0 24 24"><path d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/></svg></div>
</div>
<div class="main">
  <div class="top-bar">
    <div class="nav-tabs">
      <div class="tab">Grid</div>
      <div class="tab active">Details</div>
    </div>
    <div class="search">Search library...</div>
  </div>
  <div class="hero-banner">
    <div class="hero-wash"></div>
    <div class="hero-content">
      <div class="game-title">Cyber Strike: Genesis</div>
      <div class="action-row">
        <button class="play-btn">&#9658; PLAY</button>
        <div class="sub-btn"><svg viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg></div>
        <div class="sub-btn"><svg viewBox="0 0 24 24"><path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/></svg></div>
      </div>
    </div>
  </div>
  <div class="content-columns">
    <div class="left-col">
      <div class="screenshots-row">
        <div class="screen-thumb" style="background: radial-gradient(circle at 50% 50%, #2e1065, #0f172a);"></div>
        <div class="screen-thumb" style="background: radial-gradient(circle at 60% 40%, #1e1b4b, #020617);"></div>
        <div class="screen-thumb" style="background: radial-gradient(circle at 40% 60%, #312e81, #0f172a);"></div>
      </div>
      <div>
        <div class="desc-heading">About this game</div>
        <p class="desc-text">Step into an immersive neo-cybernetic universe. Master high-speed orbital combat, customize tactical exosuits, and unravel the secrets of the central node in a deeply reactive single-player campaign.</p>
      </div>
    </div>
    <div class="right-col">
      <div class="meta-group">
        <div class="meta-label">Genres</div>
        <div class="chips"><div class="chip">Action</div><div class="chip">Sci-Fi</div><div class="chip">Tactical</div></div>
      </div>
      <div class="meta-group">
        <div class="meta-label">Developer</div>
        <div class="meta-value">Vector Shift Studios</div>
      </div>
      <div class="meta-group">
        <div class="meta-label">Play Time</div>
        <div class="meta-value">48 hours &bull; Last played yesterday</div>
      </div>
      <div class="meta-group">
        <div class="meta-label">Score</div>
        <div class="meta-value" style="font-weight: 700; color: #4ade80;">92 / 100</div>
      </div>
    </div>
  </div>
</div>
</body>
</html>
"@ | Set-Content -Path (Join-Path $repoRoot "$artRel/preview-details.html") -Encoding utf8

@"
<!doctype html>
<!-- ${Name}: approximate HTML replica of Playnite Settings view -->
<html>
<head>
<meta charset="utf-8">
<title>$Name - Settings Preview</title>
<style>
  :root {
    --bg: #121214; --surface: #1a1a1e; --panel: #22222a; --border: #33333d;
    --text: #ffffff; --text-muted: #9e9ea8; --accent: #6366f1; --accent-hover: #4f46e5;
    --accent-text: #ffffff; --radius: 8px; --input-bg: #16161a;
  }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { width: 1600px; height: 900px; overflow: hidden; background: #0a0a0c; color: var(--text); font-family: "Segoe UI", system-ui, sans-serif; font-size: 14px; display: flex; align-items: center; justify-content: center; }
  .dialog { width: 1200px; height: 750px; background: var(--bg); border: 1px solid var(--border); border-radius: var(--radius); display: flex; flex-direction: column; box-shadow: 0 20px 50px rgba(0,0,0,0.6); overflow: hidden; }
  .title-bar { height: 42px; background: var(--surface); border-bottom: 1px solid var(--border); display: flex; align-items: center; padding: 0 16px; font-weight: 600; font-size: 14px; }
  .win-controls { margin-left: auto; display: flex; gap: 8px; }
  .win-dot { width: 12px; height: 12px; border-radius: 50%; background: var(--border); }
  .dialog-body { flex: 1; display: flex; overflow: hidden; }
  .sidebar { width: 240px; background: var(--surface); border-right: 1px solid var(--border); padding: 16px 8px; display: flex; flex-direction: column; gap: 4px; }
  .nav-item { padding: 9px 14px; border-radius: var(--radius); color: var(--text-muted); font-size: 13px; font-weight: 500; cursor: pointer; }
  .nav-item.active { background: var(--panel); color: var(--text); font-weight: 600; }
  .content { flex: 1; padding: 28px 36px; overflow-y: auto; display: flex; flex-direction: column; gap: 24px; }
  .section-title { font-size: 20px; font-weight: 700; margin-bottom: 4px; color: var(--text); }
  .section-desc { font-size: 13px; color: var(--text-muted); margin-bottom: 16px; }
  .card { background: var(--panel); border: 1px solid var(--border); border-radius: var(--radius); padding: 20px; display: flex; flex-direction: column; gap: 16px; }
  .field { display: flex; flex-direction: column; gap: 6px; }
  .field-label { font-size: 13px; font-weight: 600; color: var(--text); }
  .field-help { font-size: 12px; color: var(--text-muted); }
  .input-text { height: 36px; background: var(--input-bg); border: 1px solid var(--border); border-radius: var(--radius); padding: 0 12px; color: var(--text); font-size: 13px; outline: none; width: 340px; }
  .input-text:focus { border-color: var(--accent); }
  .row { display: flex; align-items: center; gap: 12px; }
  .checkbox { width: 18px; height: 18px; border-radius: 4px; border: 1px solid var(--accent); background: var(--accent); display: flex; align-items: center; justify-content: center; cursor: pointer; color: var(--accent-text); }
  .checkbox.unchecked { background: var(--input-bg); border-color: var(--border); }
  .radio { width: 18px; height: 18px; border-radius: 50%; border: 1px solid var(--accent); display: flex; align-items: center; justify-content: center; cursor: pointer; }
  .radio-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--accent); }
  .radio.unselected { border-color: var(--border); }
  .radio.unselected .radio-dot { display: none; }
  .slider-bar { width: 300px; height: 6px; background: var(--border); border-radius: 3px; position: relative; display: flex; align-items: center; }
  .slider-fill { width: 60%; height: 100%; background: var(--accent); border-radius: 3px; }
  .slider-thumb { width: 16px; height: 16px; border-radius: 50%; background: var(--accent-text); border: 2px solid var(--accent); position: absolute; left: 60%; transform: translateX(-50%); box-shadow: 0 2px 4px rgba(0,0,0,0.3); }
  .dialog-footer { height: 60px; background: var(--surface); border-top: 1px solid var(--border); display: flex; align-items: center; justify-content: flex-end; padding: 0 24px; gap: 12px; }
  .btn { height: 36px; padding: 0 20px; border-radius: var(--radius); font-size: 13px; font-weight: 600; cursor: pointer; border: none; }
  .btn-primary { background: var(--accent); color: var(--accent-text); }
  .btn-secondary { background: transparent; border: 1px solid var(--border); color: var(--text); }
</style>
</head>
<body>
<div class="dialog">
  <div class="title-bar">
    <span>Settings</span>
    <div class="win-controls"><div class="win-dot"></div></div>
  </div>
  <div class="dialog-body">
    <div class="sidebar">
      <div class="nav-item">General</div>
      <div class="nav-item active">Appearance</div>
      <div class="nav-item">Layout</div>
      <div class="nav-item">Input</div>
      <div class="nav-item">Advanced</div>
    </div>
    <div class="content">
      <div>
        <div class="section-title">Theme Configuration</div>
        <div class="section-desc">Customize UI elements, controls, and visual effects for $Name.</div>
      </div>
      <div class="card">
        <div class="field">
          <div class="field-label">Library Title Display</div>
          <input class="input-text" type="text" placeholder="Enter custom display name..." value="Personal Playnite Collection" />
        </div>
        <div class="row">
          <div class="checkbox">✓</div>
          <div>
            <div class="field-label">Enable high contrast borders</div>
            <div class="field-help">Sharpen panel outlines for increased visibility.</div>
          </div>
        </div>
        <div class="row">
          <div class="checkbox unchecked"></div>
          <div>
            <div class="field-label">Compact game details pane</div>
            <div class="field-help">Reduce vertical margin around screenshots and tags.</div>
          </div>
        </div>
        <div class="field">
          <div class="field-label">Banner Blur Intensity</div>
          <div class="slider-bar">
            <div class="slider-fill"></div>
            <div class="slider-thumb"></div>
          </div>
        </div>
        <div class="row">
          <div class="radio"><div class="radio-dot"></div></div>
          <div class="field-label">Smooth animations</div>
          <div class="radio unselected" style="margin-left: 16px;"><div class="radio-dot"></div></div>
          <div class="field-label">Reduced motion</div>
        </div>
      </div>
    </div>
  </div>
  <div class="dialog-footer">
    <button class="btn btn-secondary">Cancel</button>
    <button class="btn btn-primary">Save Changes</button>
  </div>
</div>
</body>
</html>
"@ | Set-Content -Path (Join-Path $repoRoot "$artRel/preview-settings.html") -Encoding utf8

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
Write-Host "  6. Style art/preview-details.html and art/preview-settings.html, then .\scripts\take-screenshots.ps1 -Extension $Key."

