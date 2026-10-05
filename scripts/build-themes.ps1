# Batch build for every theme (docs/theme-patch-workflow.md): one call instead of 29 manual builds.
# Builds never deploy: deploying sets Playnite's active theme, so only one theme can be active.
# Pass -DeployKey <key> to deploy + restart just that theme after all builds succeed
# (root AGENTS.md: "build each, then deploy+restart only the theme currently being worked on").
[CmdletBinding()]
param(
    # Optional subset, e.g. -Keys shade,primo. Defaults to every theme in src/extensions.json.
    [string[]]$Keys = @(),
    # Single theme to deploy and activate after the batch build (implies -Deploy -Restart for that key only).
    [string]$DeployKey = "",
    # Passthrough for the single-theme deploy (portable installs, explicit paths).
    [string]$DeployPath = "",
    [string]$PlayniteExe = "",
    [string]$DataPath = ""
)

$ErrorActionPreference = "Stop"
. (Join-Path $PSScriptRoot "extension-profiles.ps1")

$index = Get-ExtensionIndex
$themes = @($index.extensions | Where-Object { $_.kind -eq "theme" })
if ($Keys.Count -gt 0) {
    $wanted = @($Keys | ForEach-Object { $_.ToLowerInvariant() })
    $themes = @($themes | Where-Object { $wanted -contains $_.key.ToLowerInvariant() })
    $missing = @($wanted | Where-Object { $key = $_; @($themes | Where-Object { $_.key.ToLowerInvariant() -eq $key }).Count -eq 0 })
    if ($missing.Count -gt 0) {
        throw "Unknown theme key(s): $($missing -join ', '). Available: $(($index.extensions | Where-Object { $_.kind -eq 'theme' } | ForEach-Object { $_.key }) -join ', ')"
    }
}
if ($DeployKey) {
    $match = @($index.extensions | Where-Object { $_.kind -eq "theme" -and $_.key -eq $DeployKey })
    if ($match.Count -eq 0) {
        throw "-DeployKey '$DeployKey' is not a theme in src/extensions.json."
    }
}

Write-Host "Building $($themes.Count) theme(s)..."
$failed = [System.Collections.Generic.List[string]]::new()
foreach ($theme in $themes) {
    Write-Host ""
    Write-Host "== $($theme.key)"
    try {
        & (Join-Path $PSScriptRoot "build-theme.ps1") -Extension $theme.key
    }
    catch {
        $failed.Add($theme.key) | Out-Null
    }
}

Write-Host ""
if ($failed.Count -gt 0) {
    Write-Host "Build failed for $($failed.Count) of $($themes.Count) theme(s): $($failed -join ', ')"
    throw "Theme build failed."
}
Write-Host "All $($themes.Count) theme(s) built."

if ($DeployKey) {
    Write-Host ""
    Write-Host "Deploying active theme '$DeployKey'..."
    $deployArgs = @{ Extension = $DeployKey; Deploy = $true; Restart = $true }
    if ($DeployPath) { $deployArgs["DeployPath"] = $DeployPath }
    if ($PlayniteExe) { $deployArgs["PlayniteExe"] = $PlayniteExe }
    if ($DataPath) { $deployArgs["DataPath"] = $DataPath }
    & (Join-Path $PSScriptRoot "build-theme.ps1") @deployArgs
}
