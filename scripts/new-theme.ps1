[CmdletBinding()]
param(
    [Parameter(Mandatory = $true)]
    [string]$Name,

    [Parameter(Mandatory = $true)]
    [string]$Key,

    # Folder under src/ThemeKits/ that provides the component overlay and Constants template.
    [string]$Kit = "Shadcn",

    # Start from another theme's palette.css (extension key). Defaults to the first theme that uses the same kit.
    [string]$CopyPaletteFrom = "",

    # Or start from any shadcn-style stylesheet (ui.shadcn.com/themes, tweakcn.com export, globals.css).
    [string]$PaletteCss = "",

    [ValidateSet("Desktop")]
    [string]$Mode = "Desktop",

    [string]$Author = $env:USERNAME,
    [string]$Description = "A dark Playnite desktop theme.",
    [string]$Version = "0.1.0",

    # 2.9.0 = Playnite 10.45+. Raise it only when the kit starts using something newer.
    [string]$ThemeApiVersion = "2.9.0",

    [string]$TagPattern = "{key}-v{version}"
)

$ErrorActionPreference = "Stop"
. (Join-Path $PSScriptRoot "extension-profiles.ps1")
. (Join-Path $PSScriptRoot "theme-tools.ps1")

$repoRoot = Get-RepoRoot
$dirName = ($Name -replace "[^A-Za-z0-9]", "")
if (-not $dirName -or $dirName[0] -match "[0-9]") {
    throw "Name '$Name' must start with a letter."
}
$Key = $Key.ToLowerInvariant()
$themeRoot = Join-Path $repoRoot "src/$dirName"
$kitPath = "src/ThemeKits/$Kit"

if (-not (Test-Path (Join-Path $repoRoot "$kitPath/$Mode"))) {
    throw "Kit '$Kit' has no $Mode overlay at $kitPath/$Mode."
}
if (Test-Path $themeRoot) {
    throw "Theme directory already exists at $themeRoot"
}

$profilesPath = Join-RepoPath "src/extensions.json"
$profiles = Get-Content -Raw -Path $profilesPath | ConvertFrom-Json
if ($profiles.extensions | Where-Object { $_.key -eq $Key }) {
    throw "An extension with key '$Key' already exists."
}

# Palette source: explicit CSS, explicit theme, or the first theme on the same kit.
$paletteSource = $PaletteCss
if (-not $paletteSource) {
    $donor = if ($CopyPaletteFrom) {
        $profiles.extensions | Where-Object { $_.key -eq $CopyPaletteFrom } | Select-Object -First 1
    }
    else {
        $profiles.extensions | Where-Object { $_.kind -eq "theme" -and $_.themeKit -eq $kitPath -and $_.palette } | Select-Object -First 1
    }
    if (-not $donor -or -not $donor.palette) {
        throw "No palette to start from. Pass -PaletteCss <file> or -CopyPaletteFrom <theme key>."
    }
    $paletteSource = Join-RepoPath $donor.palette
}
Read-ThemePalette -Path $paletteSource | Out-Null

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
$manifestRel = "$infoRel/theme.yaml"
$installerRel = "$infoRel/InstallerManifest.yaml"
$databaseRel = "$infoRel/danitesler_$Key.yaml"
$paletteRel = "src/$dirName/palette.css"
$tag = $TagPattern.Replace("{key}", $Key).Replace("{version}", $Version)
$packageUrl = "$releaseBaseUrl/$tag/$(Get-ExpectedPackageName -AddonId $addonId -Version $Version -PackageExtension '.pthm')"

New-Item -ItemType Directory -Path (Join-Path $repoRoot $infoRel) -Force | Out-Null
Copy-Item -Path $paletteSource -Destination (Join-Path $repoRoot $paletteRel)

$donorIcon = if ($donor) { Join-Path (Split-Path -Parent (Join-RepoPath $donor.extensionManifest)) "icon.png" } else { $null }
$iconStep = "Add info/icon.png (512x512 PNG; the add-on database IconUrl points at it)."
if ($donorIcon -and (Test-Path $donorIcon)) {
    Copy-Item -Path $donorIcon -Destination (Join-Path $repoRoot "$infoRel/icon.png")
    $iconStep = "Replace info/icon.png (copied from '$($donor.key)' as a placeholder)."
}

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

@"
# $Name — theme notes

Playnite **$Mode** theme on the **$Kit** kit (``$kitPath``). Kit conventions and the token contract live in **``$kitPath/AGENTS.md``**.

- **Palette** — ``palette.css`` (shadcn CSS variables). This is the only file most palette changes touch.
- **Overrides** — none yet. To restyle one control for this theme only, add ``"themeDir": "src/$dirName/theme"`` to its profile in ``src/extensions.json`` and put the file at the same relative path Playnite's Default theme uses (it replaces the kit's file).
- **Build** — ``.\scripts\build-theme.ps1 -Extension $Key -Deploy``, restart Playnite, pick **$Name** in Settings > Appearance.
"@ | Set-Content -Path (Join-Path $themeRoot "AGENTS.md") -Encoding utf8

$newProfile = [pscustomobject]@{
    key                = $Key
    slug               = $Key
    name               = $Name
    kind               = "theme"
    addonId            = $addonId
    type               = "Theme$Mode"
    themeKit           = $kitPath
    palette            = $paletteRel
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
Write-Host "Next steps:"
Write-Host "  1. Replace palette.css with your colors (paste a shadcn theme; .dark wins over :root)."
Write-Host "  2. $iconStep"
Write-Host "  3. .\scripts\build-theme.ps1 -Extension $Key -Deploy, then restart Playnite."
Write-Host "  4. .\scripts\validate-extension.ps1 -Extension $Key"
