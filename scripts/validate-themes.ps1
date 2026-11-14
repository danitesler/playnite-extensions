# Batch validation for every theme: the local equivalent of the CI "Validate and build themes" job.
# A shell, game-page, or sidebar fix touches every theme (docs/themes/theme-patch-workflow.md);
# this runs validate-extension.ps1 per theme and reports a summary instead of manual calls.
[CmdletBinding()]
param(
    [ValidateSet("Ci", "Package")]
    [string]$Mode = "Ci",
    [string]$Configuration = "Release",
    # Optional subset, e.g. -Keys shade,primo. Defaults to every theme in src/extensions.json.
    [string[]]$Keys = @(),
    [switch]$SkipPreviewChecks
)

$ErrorActionPreference = "Stop"
. (Join-Path $PSScriptRoot "lib/extension-profiles.ps1")

$index = Get-ExtensionIndex
$themes = @(Select-RegisteredExtensions -Extensions ($index.extensions | Where-Object kind -eq theme) -Keys $Keys)

Write-Host "Validating $($themes.Count) theme(s) ($Mode)..."
$failed = [System.Collections.Generic.List[string]]::new()
foreach ($theme in $themes) {
    Write-Host ""
    Write-Host "== $($theme.key)"
    try {
        & (Join-Path $PSScriptRoot "validate-extension.ps1") -Extension $theme.key -Mode $Mode -Configuration $Configuration -SkipPreviewChecks:$SkipPreviewChecks
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
