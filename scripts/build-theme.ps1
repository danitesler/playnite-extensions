[CmdletBinding()]
param(
    [Parameter(Mandatory = $true)]
    [string]$Extension,

    # Copy the build drop into Playnite's user themes folder so a restart picks it up.
    [switch]$Deploy,

    # Themes root to deploy into (the folder that holds Desktop\ and Fullscreen\). Defaults to %AppData%\Playnite\Themes;
    # pass <Playnite folder>\Themes for portable installs.
    [string]$DeployPath = "",

    # Close Playnite if running, deploy the theme, set it as active in config.json, and launch/restart Playnite.
    [switch]$Restart,

    # Alias for -Restart (launches if closed, restarts if running).
    [switch]$Launch,

    # Update config.json to activate this theme without launching/restarting Playnite.
    [switch]$SetTheme,

    # Path to Playnite executable (auto-detected if omitted).
    [string]$PlayniteExe = "",

    # Path to Playnite user data folder holding config.json (auto-detected if omitted).
    [string]$DataPath = ""
)

$ErrorActionPreference = "Stop"
. (Join-Path $PSScriptRoot "extension-profiles.ps1")
. (Join-Path $PSScriptRoot "theme-tools.ps1")

if ($Restart -or $Launch) {
    $Deploy = $true
    $SetTheme = $true
}

$profile = Get-ExtensionProfile -Extension $Extension
if ((Get-ExtensionKind $profile) -ne "theme") {
    throw "'$Extension' is not a theme. Use build-plugin.ps1."
}

$manifest = Get-ExtensionManifestInfo -Profile $profile
$mode = if ($manifest.Mode) { $manifest.Mode } else { "Desktop" }

$buildDrop = Join-RepoPath $profile.outputPath

Write-Host "Building theme $($manifest.Name) $($manifest.Version) ($mode) from $($profile.themeSource)..."
try {
    Invoke-ThemeBuild -Profile $profile -OutDir $buildDrop | Out-Null
}
catch {
    Write-Host "Theme build failed for '$Extension':"
    Write-Host $_.Exception.Message
    throw "Theme build failed."
}

$errors = @(Test-ThemeBuild -Directory $buildDrop -Mode $mode)
if ($errors.Count -gt 0) {
    Write-Host "Theme checks failed for '$Extension':"
    foreach ($e in $errors) { Write-Host "  - $e" }
    throw "Theme checks failed."
}

# Allowed while a theme is in progress; validate-extension.ps1 fails on them before a release.
$missing = @(Get-ThemeMissingRequiredKeys -Directory $buildDrop)
if ($missing.Count -gt 0) {
    Write-Warning "Required shared keys not defined yet (scripts/data/theme-keys.json): $($missing -join ', ')"
}

$fileCount = @(Get-ChildItem -Path $buildDrop -Recurse -File).Count
Write-Host ""
Write-Host "Build drop: $buildDrop ($fileCount files)"

# If restarting/launching, close any running Playnite first so file locks are released and config.json won't be overwritten.
$resolvedExe = $null
if ($Restart -or $Launch) {
    if ($env:OS -ne "Windows_NT") {
        Write-Warning "Playnite launch/restart is only supported on Windows."
    } elseif ($env:CI -eq "true") {
        Write-Warning "CI environment detected; skipping Playnite launch/restart."
    } else {
        $resolvedExe = Get-PlayniteExePath -PlayniteExe $PlayniteExe -Mode $mode -DataPath $DataPath
        Stop-PlayniteApp -PlayniteExe $resolvedExe
    }
}

if ($Deploy) {
    $themesRoot = if ($DeployPath) { $DeployPath } else { Get-PlayniteThemesRoot -DataPath $DataPath }
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
}

if ($SetTheme) {
    $applied = Set-PlayniteActiveTheme -ThemeId $manifest.Id -Mode $mode -DataPath $DataPath
    if ($applied) {
        Write-Host "Set active $mode theme in config.json to '$($manifest.Name)' ($($manifest.Id))."
    }
}

if ($Restart -or $Launch) {
    if ($env:OS -eq "Windows_NT" -and $env:CI -ne "true") {
        Start-PlayniteApp -PlayniteExe $resolvedExe -Mode $mode -DataPath $DataPath | Out-Null
    }
} elseif ($Deploy) {
    $running = @(Get-PlayniteProcess -Mode $mode)
    if ($running.Count -gt 0) {
        Write-Host "Playnite is currently open. Restart Playnite to view changes (or use -Restart to automate)."
    } else {
        Write-Host "Playnite is closed. Launch Playnite to view changes, and pick '$($manifest.Name)' under Settings > Appearance > Theme (or use -Restart to automate)."
    }
}
