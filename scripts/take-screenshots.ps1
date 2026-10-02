[CmdletBinding()]
param(
    [Parameter(Mandatory = $true)]
    [string]$Extension,

    # Output directory. Defaults to <add-on dir>\info\screenshots.
    [string]$OutDir = "",

    # Keep legacy screenshots (grid.png) instead of cleaning them up.
    [switch]$KeepLegacy
)

# Generates release screenshots (details.png and settings.png) for a theme from its
# HTML preview templates in art/ (preview-details.html and preview-settings.html)
# using Chromium / Playwright. Does not start Playnite.

$ErrorActionPreference = "Stop"
. (Join-Path $PSScriptRoot "extension-profiles.ps1")

$profile = Get-ExtensionProfile -Extension $Extension
if ((Get-ExtensionKind $profile) -ne "theme") {
    throw "'$Extension' is not a theme."
}

$themeDir = Join-RepoPath $profile.dir
$artDir = Join-Path $themeDir "art"
$detailsHtml = Join-Path $artDir "preview-details.html"
$settingsHtml = Join-Path $artDir "preview-settings.html"

if (-not (Test-Path $detailsHtml)) {
    throw "Missing details preview template: $detailsHtml. Create art/preview-details.html before taking screenshots."
}
if (-not (Test-Path $settingsHtml)) {
    throw "Missing settings preview template: $settingsHtml. Create art/preview-settings.html before taking screenshots."
}

if (-not $OutDir) {
    $OutDir = Join-Path $themeDir "info\screenshots"
}
New-Item -ItemType Directory -Path $OutDir -Force | Out-Null

$nodeScript = Join-Path $PSScriptRoot "render-theme-preview.mjs"

Write-Host "Rendering screenshots for $($profile.name) ($Extension)..."

$detailsOut = Join-Path $OutDir "details.png"
$settingsOut = Join-Path $OutDir "settings.png"

& node $nodeScript $detailsHtml $detailsOut
if ($LASTEXITCODE -ne 0) { throw "Failed to render $detailsHtml" }

& node $nodeScript $settingsHtml $settingsOut
if ($LASTEXITCODE -ne 0) { throw "Failed to render $settingsHtml" }

if (-not $KeepLegacy) {
    $legacyGrid = Join-Path $OutDir "grid.png"
    if (Test-Path $legacyGrid) {
        Remove-Item -Path $legacyGrid -Force
        Write-Host "Cleaned up obsolete screenshot: $legacyGrid"
    }
    $legacyArtGrid = Get-ChildItem -Path (Join-Path $artDir "preview-grid*") -ErrorAction SilentlyContinue
    if ($legacyArtGrid) {
        $legacyArtGrid | Remove-Item -Force
        Write-Host "Cleaned up obsolete art preview grid files."
    }
}

$base = "https://raw.githubusercontent.com/danitesler/playnite-extensions/main/" + (($profile.dir -replace "\\", "/").TrimEnd("/")) + "/info/screenshots"
Write-Host ""
Write-Host "Screenshots generated in $OutDir"
Write-Host "Manifest configuration for info/danitesler_$Extension.yaml:"
Write-Host "Screenshots:"
Write-Host "  - Thumbnail: $base/details.png"
Write-Host "    Image: $base/details.png"
Write-Host "  - Thumbnail: $base/settings.png"
Write-Host "    Image: $base/settings.png"
