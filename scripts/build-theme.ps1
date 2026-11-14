[CmdletBinding()]
param(
    [Parameter(Mandatory = $true)]
    [string]$Extension,

    # Copy the build drop into Playnite's user themes folder so a restart picks it up.
    [switch]$Deploy,
    # Build artifacts only: no deployment, activation or restart (used by validation/packaging).
    [switch]$NoDeploy,
    # Copy files without restarting a running Playnite (for batched theme redeploys).
    [switch]$NoRestart,

    # Themes root to deploy into (the folder that holds Desktop\ and Fullscreen\). Defaults to %AppData%\Playnite\Themes;
    # pass <Playnite folder>\Themes for portable installs.
    [string]$DeployPath = "",

    # Deploy and activate the theme; restart Playnite only if it was already running.
    [switch]$Restart,

    # Explicitly launch Playnite even when it was closed.
    [switch]$Launch,

    # Update config.json to activate this theme without launching/restarting Playnite.
    [switch]$SetTheme,

    # Path to Playnite executable (auto-detected if omitted).
    [string]$PlayniteExe = "",

    # Path to Playnite user data folder holding config.json (auto-detected if omitted).
    [string]$DataPath = ""
)

$ErrorActionPreference = "Stop"
. (Join-Path $PSScriptRoot "lib/extension-profiles.ps1")
. (Join-Path $PSScriptRoot "lib/theme-tools.ps1")
. (Join-Path $PSScriptRoot "lib/playnite-runtime.ps1")

if ($NoDeploy -and ($Deploy -or $Restart -or $Launch -or $SetTheme)) { throw "-NoDeploy cannot be combined with deployment/activation flags." }
if ($NoRestart -and ($Restart -or $Launch)) { throw "-NoRestart cannot be combined with -Restart or -Launch." }

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
$context = if (-not $NoDeploy) { Get-PlayniteBuildContext -DataPath $DataPath -DeployPath $DeployPath -PlayniteExe $PlayniteExe -Mode $mode }
if ($context -and -not $Deploy) {
    $Deploy = $true
    if (-not $NoRestart) { $SetTheme = $true }
}

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

if ($context -and $Deploy) {
    $themesRoot = if ($DeployPath) { $DeployPath } else { Join-Path $context.DataPath "Themes" }
    Invoke-PlayniteDeployment -Context $context -NoRestart:$NoRestart -Launch:$Launch -Deploy {
        Copy-PlayniteBuild -Source $buildDrop -Root (Join-Path $themesRoot $mode) -Folder $manifest.Id
        if ($SetTheme) {
            if (-not (Set-PlayniteActiveTheme -ThemeId $manifest.Id -Mode $mode -DataPath $context.DataPath -PlayniteExe $context.Exe)) {
                throw "Could not activate the deployed theme."
            }
            Write-Host "Set active $mode theme to '$($manifest.Name)' ($($manifest.Id))."
        }
    }
} elseif ($Deploy -or $SetTheme -or $Restart -or $Launch) {
    if ($env:OS -eq "Windows_NT" -and $env:CI -ne "true") {
        throw "Playnite installation not found. Pass -DataPath, -DeployPath or -PlayniteExe."
    }
    Write-Host "Non-Windows/CI: kept the build drop without deployment or restart."
}
