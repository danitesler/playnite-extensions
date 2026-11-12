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
    [string]$ThemeApiVersion = "2.9.0",

    # Creative ambition written into BRIEF.md (.claude/skills/playnite-theme-dev/creative-direction.md):
    # Showcase = games, films, fictional UIs; Faithful = real design systems and OS UIs; Hybrid = a game whose UI is a clean system.
    [ValidateSet("Showcase", "Hybrid", "Faithful")]
    [string]$Ambition = "Showcase"
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
ShortDescription: '$($Description -replace "'", "''")'
InstallerManifestUrl: $rawBaseUrl/$installerRel
SourceUrl: $sourceUrl
Description: |
  $Description
Tags: [Dark, $Mode]
IconUrl: $rawBaseUrl/$infoRel/icon.png
Screenshots:
  - Thumbnail: $rawBaseUrl/$artRel/screenshot-details.png
    Image: $rawBaseUrl/$artRel/screenshot-details.png
  - Thumbnail: $rawBaseUrl/$artRel/screenshot-settings.png
    Image: $rawBaseUrl/$artRel/screenshot-settings.png
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

    <!-- Typography (Playnite keys): $DesignSystem's type scale and font stack. A face Windows lacks is bundled in
         src/Typography (only the weights used) and leads its stack as ./Typography/#Family: see reference.md, Bundled fonts. -->
    <sys:Double x:Key="FontSizeSmall">12</sys:Double>
    <sys:Double x:Key="FontSize">14</sys:Double>
    <sys:Double x:Key="FontSizeLarge">15</sys:Double>
    <sys:Double x:Key="FontSizeLarger">20</sys:Double>
    <sys:Double x:Key="FontSizeLargest">29</sys:Double>
    <FontFamily x:Key="FontFamily">Segoe UI</FontFamily>
    <FontFamily x:Key="MonospaceFontFamily">Consolas</FontFamily>

    <!-- Usable metadata content width; apply inside the pane's horizontal padding and frame. -->
    <sys:Double x:Key="GameDetailsPaneWidth">300</sys:Double>
    <sys:Double x:Key="GridDetailsPaneWidth">300</sys:Double>

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

    <!-- Shared keys cover roles outside the Playnite palette. ThemeModifier lists the keys opted in through the shared catalog. -->
$sharedBlock
</ResourceDictionary>
"@ | Set-Content -Path (Join-Path $repoRoot "$sourceRel/Constants.template.xaml") -Encoding utf8

@"
# $Name — theme notes

## What this is

Playnite **$Mode** theme (``ThemeApiVersion`` $ThemeApiVersion) in the style of **$DesignSystem**. TODO: version and dark variant.

Shared anatomy (file map, shell rules, game page skeleton, metadata pane, build and first-run checks): **``../AGENTS.md``**. Loading rules and build checks: **``.claude/skills/playnite-theme-dev/reference.md``**.

## Sources

Reference notes, measurements, and asset sources are documented in [``RESEARCH.md``](RESEARCH.md). Creative brief (ambition, source DNA, game element map, signature moments, motion language, branding, review scores): [``BRIEF.md``](BRIEF.md).

## Tokens

Which $DesignSystem token plays each key (Playnite palette first, then shared keys), radii and fonts.

| Token | Key | Used for |
|-------|-----|----------|
| TODO | | |

## ThemeModifier

Keep the ThemeModifier Edit constants list focused on main backgrounds, button fills and text, selection, and inputs. Include existing sidebar and panel surface brushes through the shared catalog. When panels share a brush or are transparent, use the existing background control. Keep the existing layout controls. Use the shared opt-ins in scripts/data/theme-keys.json and let the build generate thememodifier.yaml. Hover, pressed, and decorative colors stay in the theme. The accent picker lives in the Editor tab.

## Component spacing (``src/Common.xaml``)

| Key | Value | $DesignSystem |
|-----|-------|---------------|
| TODO | | |

## Shell

| File | What it draws |
|------|---------------|
| TODO | |

## Components

Both game overview files must include a designed empty state using ``LOCErrorNoGameSelected``. Keep the details ``PART_ScrollViewHost`` explicitly ``Visibility="Visible"`` so the inherited ``DetailsScrollViewer`` style cannot hide it on a null DataContext. Verify an initially empty selection, selected game -> grid -> details with selection cleared, and selecting a game again. See the theme-development reference's Interactive layer.

``GameDetailsPaneWidth`` and ``GridDetailsPaneWidth`` both default to 300px of usable metadata content. Apply them inside horizontal padding and borders so the outer frame can size to content without shrinking the labels and properties. Preserve the exterior column gap and dynamic resizing through ThemeModifier.

Apply the responsive game-page breakpoints in both overview files. Keep metadata at the side when the body fits the preferred pane width, the theme's gap and 400px for content. Below that, use the full width under the content with two metadata columns at 560px of usable inner width and one below 560px. See the theme-development reference's Responsive game pages section.

| Playnite file | $DesignSystem component |
|---------------|-------------------------|
| TODO | |

## Previews

``art/preview-details.html`` and ``art/preview-settings.html`` are scaffold placeholders until rewritten (see ``.claude/skills/playnite-theme-dev/previews.md``). Signature motifs drawn: TODO. Stand-in fonts: TODO.

## Deviations

## Not verified yet
"@ | Set-Content -Path (Join-Path $themeRoot "AGENTS.md") -Encoding utf8

@"
# $Name — research & sources

## Sources

| What | Where (package, version, file) |
|------|--------------------------------|
| Tokens | TODO |
| Components | TODO |
| Icons | TODO (license file in ``info/``) |
"@ | Set-Content -Path (Join-Path $themeRoot "RESEARCH.md") -Encoding utf8

# Creative brief: what the theme does with the research. Sections and bar: .claude/skills/playnite-theme-dev/creative-direction.md.
@"
# $Name — creative brief

Ambition: **$Ambition** (creative-direction.md -> Ambition modes). Written after ``RESEARCH.md``, before the XAML. Numbers and element names, not adjectives.

## 1. Source DNA

| Trait | Evidence (RESEARCH.md) | Lands on |
|-------|------------------------|----------|
| TODO shape | | |
| TODO light | | |
| TODO texture | | |
| TODO type | | |
| TODO motion | | |

## 2. Game element map

8+ rows, 3+ a player names on sight (Faithful: map the system's own components instead).

| Source element | Playnite surface | How |
|----------------|------------------|-----|
| TODO | | |

## 3. Signature moments

| Moment | Trigger | Layers | In / out | Easing | Brush |
|--------|---------|--------|----------|--------|-------|
| Hero: TODO | | | | | |
| TODO | | | | | |

Ambient loops (sparse areas only): TODO

## 4. Motion language

- Durations: fast TODO ms, base TODO ms, slow TODO ms; idle TODO s
- Easing personality: TODO
- Entrance direction: TODO
- Stagger: TODO ms

## 5. Branding system

- Name candidates and pick: TODO
- Mark (vector motif, not the owner's logo): TODO
- Title band graphic: TODO
- Empty game page motif and idle: TODO
- Type voice (case, tracking, numerals, display face): TODO
- Preview staging (hero moment end state, mark in title band): TODO

## 6. Restraint

- Library list and cover grid backgrounds: TODO
- Metadata text: TODO
- Dense settings pages: TODO

## Review

| Criterion | Score 1-5 | Evidence | Fix |
|-----------|-----------|----------|-----|
| Recognition | | | |
| Game element map | | | |
| Hero moment | | | |
| Motion coherence | | | |
| Brand cohesion | | | |
| Restraint and legibility | | | |
"@ | Set-Content -Path (Join-Path $themeRoot "BRIEF.md") -Encoding utf8

# Previews start from scripts/templates (generic placeholders: rewrite per playnite-theme-dev/previews.md).
foreach ($previewName in @("details", "settings")) {
    $previewHtml = (Get-Content -Raw -Path (Join-Path $PSScriptRoot "templates/preview-$previewName.html")).Replace("{{NAME}}", $Name)
    Set-Content -Path (Join-Path $repoRoot "$artRel/preview-$previewName.html") -Value $previewHtml -Encoding utf8
}

# Playnite hard-codes 24px on these controls and no theme template reaches them: each overlay gives them the shared
# field height (ControlHeight in Common.xaml; root AGENTS.md -> Form field height).
function New-FieldOverlay([string]$Relative, [string]$What, [string[]]$Types, [string[]]$Setters) {
    $styles = foreach ($type in $Types) {
        $body = ($Setters | ForEach-Object { "        $_" }) -join "`n"
        "    <Style TargetType=`"{x:Type $type}`" BasedOn=`"{StaticResource {x:Type $type}}`">`n$body`n    </Style>"
    }
    $text = @"
<!--
    $Name`: gives Playnite's $What the shared field height (ControlHeight), so it lines up with text boxes and buttons.
-->
<ResourceDictionary xmlns="http://schemas.microsoft.com/winfx/2006/xaml/presentation"
                    xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml">
$($styles -join "`n")
</ResourceDictionary>
"@
    $target = Join-Path $repoRoot "$sourceRel/$Relative"
    New-Item -ItemType Directory -Path (Split-Path $target -Parent) -Force | Out-Null
    Set-Content -Path $target -Value $text -Encoding utf8
}
$fieldHeight = '<Setter Property="Height" Value="{DynamicResource ControlHeight}" />'
$fieldMinHeight = '<Setter Property="MinHeight" Value="{DynamicResource ControlHeight}" />'
$centerContent = '<Setter Property="VerticalContentAlignment" Value="Center" />'
New-FieldOverlay "CustomControls/ComboBoxList.xaml" "multi-select dropdowns" @("ComboBoxList", "DdItemListSelectionBox") @($fieldHeight)
New-FieldOverlay "CustomControls/FilterSelectionBox.xaml" "filter dropdowns" @("FilterEnumSelectionBox", "FilterStringSelectionBox", "FilterSelectionBox") @($fieldHeight)
New-FieldOverlay "CustomControls/NumericBoxes.xaml" "number boxes" @("LongNumericBox", "UlongNumericBox", "NullIntNumericBox", "DoubleNumericBox") @($fieldMinHeight, $centerContent)
New-FieldOverlay "CustomControls/PathSelectionBox.xaml" "path boxes" @("PathSelectionBox") @($fieldMinHeight, $centerContent)
New-Item -ItemType Directory -Path (Join-Path $repoRoot "$sourceRel/DefaultControls") -Force | Out-Null
@"
<!--
    $Name`: gives Playnite's date picker the shared field height (ControlHeight), so it lines up with text boxes and buttons.
-->
<ResourceDictionary xmlns="http://schemas.microsoft.com/winfx/2006/xaml/presentation"
                    xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml">
    <!-- The calendar button has its own flat style: this file loads before ToggleButton's, so it cannot be BasedOn one. -->
    <Style TargetType="{x:Type DatePicker}" BasedOn="{StaticResource {x:Type DatePicker}}">
        <Setter Property="Height" Value="{DynamicResource ControlHeight}" />
        <Setter Property="Padding" Value="3,0" />
        <Style.Resources>
            <Style TargetType="ToggleButton">
                <Setter Property="Foreground" Value="{DynamicResource GlyphBrush}" />
                <Setter Property="Background" Value="Transparent" />
                <Setter Property="Focusable" Value="False" />
                <Setter Property="Template">
                    <Setter.Value>
                        <ControlTemplate TargetType="ToggleButton">
                            <Border x:Name="Plate" Background="{TemplateBinding Background}" Padding="6,0">
                                <ContentPresenter HorizontalAlignment="Center" VerticalAlignment="Center" />
                            </Border>
                            <ControlTemplate.Triggers>
                                <Trigger Property="IsMouseOver" Value="True">
                                    <Setter TargetName="Plate" Property="Background" Value="{DynamicResource HoverBrush}" />
                                </Trigger>
                            </ControlTemplate.Triggers>
                        </ControlTemplate>
                    </Setter.Value>
                </Setter>
            </Style>
            <Style TargetType="DatePickerTextBox" BasedOn="{StaticResource {x:Type DatePickerTextBox}}">
                <Setter Property="VerticalContentAlignment" Value="Center" />
            </Style>
        </Style.Resources>
    </Style>
</ResourceDictionary>
"@ | Set-Content -Path (Join-Path $repoRoot "$sourceRel/DefaultControls/DatePicker.xaml") -Encoding utf8

$index.extensions += $newProfile
Save-ExtensionIndex -Index $index

Write-Host "Created theme '$Name' at $themeRoot"
Write-Host "Next steps (details: .claude/skills/playnite-theme-dev/SKILL.md):"
Write-Host "  1. Fill RESEARCH.md: $DesignSystem's token package, component specs, icon set, interface parts and motion."
Write-Host "     Then BRIEF.md ($Ambition): source DNA, game element map, signature moments, motion, branding (.claude/skills/playnite-theme-dev/creative-direction.md)."
Write-Host "  2. src/tokens.css: $DesignSystem's dark tokens under their own names."
Write-Host "  3. src/Constants.template.xaml: replace every {{TODO}} with the token for that key's role."
Write-Host "  4. Common.xaml, Media.xaml, the shell, then controls, each from Playnite's Default file at the tag in scripts/data/playnite-theme-api.json."
Write-Host "     Keys come from scripts/data/theme-keys.json; the build lists required ones still missing."
Write-Host "     In DefaultControls/Button.xaml add the ThemeModifier icon-button trigger: Width == 41 -> internal Height/MinWidth/MinHeight/MaxWidth/MaxHeight 41, Padding 0, content Center, FontSize 16, uniform LayoutTransform ScaleX/ScaleY 0.7804878048780488 (32/41) for 32x32 with proportional content (AGENTS.md ThemeModifier Icon Buttons; validate-extension.ps1 enforces it)."
Write-Host "     Window background (AGENTS.md): Views/Library.xaml shows PART_ImageBackground at full strength (no scrim, tint, mask, blur); a"
Write-Host "     {Settings ShowBackgroundImageOnWindow} trigger turns the top bar, side panels and game pages see-through and collapses HeroArt;"
Write-Host "     DefaultControls/Slider.xaml disables ThemeModifier's GameBannerHeight slider while it is on."
Write-Host "  5. Add info/icon.png (512x512), then .\scripts\build-theme.ps1 -Extension $Key -Deploy and restart Playnite."
Write-Host "  6. Rewrite art/preview-details.html and art/preview-settings.html from the research, with var(--token) colors from src/tokens.css"
Write-Host "     (they are generic placeholders), then .\scripts\take-screenshots.ps1 -Extension $Key. After token changes: .\scripts\validate-extension.ps1 lists preview colors that drifted."

