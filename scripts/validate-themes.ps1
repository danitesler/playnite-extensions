# Batch validation for every theme: the local equivalent of the CI "Validate and build themes" job.
# A shell, game-page, or sidebar fix touches all 29 copies (docs/theme-patch-workflow.md);
# this runs validate-extension.ps1 per theme and reports a summary instead of 29 manual calls.
[CmdletBinding()]
param(
    [ValidateSet("Ci", "Package")]
    [string]$Mode = "Ci",
    [string]$Configuration = "Release",
    # Optional subset, e.g. -Keys shade,primo. Defaults to every theme in src/extensions.json.
    [string[]]$Keys = @()
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

Write-Host "Validating $($themes.Count) theme(s) ($Mode)..."
$failed = [System.Collections.Generic.List[string]]::new()
foreach ($theme in $themes) {
    Write-Host ""
    Write-Host "== $($theme.key)"
    try {
        & (Join-Path $PSScriptRoot "validate-extension.ps1") -Extension $theme.key -Mode $Mode -Configuration $Configuration
    }
    catch {
        $failed.Add($theme.key) | Out-Null
    }
}

Write-Host ""
if ($failed.Count -gt 0) {
    Write-Host "Validation failed for $($failed.Count) of $($themes.Count) theme(s): $($failed -join ', ')"
    throw "Theme validation failed."
}
Write-Host "All $($themes.Count) theme(s) validated ($Mode)."
