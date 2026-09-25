[CmdletBinding()]
param(
    [Parameter(Mandatory = $true)]
    [string]$Extension,

    # Copy the build drop into Playnite's user themes folder so a restart picks it up.
    [switch]$Deploy,

    # Themes root to deploy into (the folder that holds Desktop\ and Fullscreen\). Defaults to %AppData%\Playnite\Themes;
    # pass <Playnite folder>\Themes for portable installs.
    [string]$DeployPath = ""
)

$ErrorActionPreference = "Stop"
. (Join-Path $PSScriptRoot "extension-profiles.ps1")
. (Join-Path $PSScriptRoot "theme-tools.ps1")

$repoRoot = Get-RepoRoot
$profile = Get-ExtensionProfile -Extension $Extension
if ((Get-ExtensionKind $profile) -ne "theme") {
    throw "'$Extension' is not a theme. Use build-plugin.ps1."
}

$manifest = Get-ThemeManifestInfo -Profile $profile
$mode = if ($manifest.Mode) { $manifest.Mode } else { "Desktop" }
$slug = if ($profile.slug) { $profile.slug } else { $profile.key }
$buildDrop = Join-Path $repoRoot "artifacts/builds/$slug"

Write-Host "Building theme $($manifest.Name) $($manifest.Version) ($mode) from $($profile.themeSource)..."
try {
    Invoke-ThemeBuild -Profile $profile -OutDir $buildDrop | Out-Null
}
catch {
    Write-Host "Theme build failed for '$Extension':"
    Write-Host $_.Exception.Message
    throw "Theme build failed."
}

$errors = @(Test-ThemeBuild -Directory $buildDrop -Mode $mode -ResourcePrefix $profile.resourcePrefix)
if ($errors.Count -gt 0) {
    Write-Host "Theme checks failed for '$Extension':"
    foreach ($e in $errors) { Write-Host "  - $e" }
    throw "Theme checks failed."
}

$fileCount = @(Get-ChildItem -Path $buildDrop -Recurse -File).Count
Write-Host ""
Write-Host "Build drop: $buildDrop ($fileCount files)"

if ($Deploy) {
    $themesRoot = if ($DeployPath) { $DeployPath } else { Get-PlayniteThemesRoot }
    if (-not $themesRoot -or -not (Test-Path $themesRoot)) {
        throw "Playnite themes folder not found. Pass -DeployPath <Playnite folder>\Themes (portable) or install Playnite."
    }

    # Same folder name every time, so redeploys replace the previous copy instead of stacking duplicates.
    $target = Join-Path $themesRoot (Join-Path $mode $manifest.Id)
    if (Test-Path $target) {
        Get-ChildItem -Path $target -Force | Remove-Item -Recurse -Force
    }
    New-Item -ItemType Directory -Path $target -Force | Out-Null
    Copy-Item -Path (Join-Path $buildDrop "*") -Destination $target -Recurse -Force
    Write-Host "Deployed to $target"
    Write-Host "Restart Playnite, then pick '$($manifest.Name)' under Settings > Appearance > Theme."
}
