# Every check this repo has, run locally (Windows, or Linux/macOS with PowerShell 7 and the .NET SDK).
# There is no hosted CI (never add GitHub Actions workflows): run this before merging or releasing.
# It replaces the old CI workflow: validate + build every plugin, unit tests, validate + build every
# theme, generated READMEs, and the preview token and layout checks.
#
#   pwsh scripts/check-all.ps1          # everything
#   pwsh scripts/check-all.ps1 -Quick   # skip the plugin and theme builds and the layout render
#
# On Linux and macOS (scripts/check-all.sh sets this up): the plugins build with
# EnableWindowsTargeting, the tests run on Mono, and the tests that load WPF
# (GameHoverDetailsSettingsMigrationTests needs PresentationCore) only run on Windows.
# Builds never deploy or restart Playnite.
[CmdletBinding()]
param(
    [switch]$Quick,
    [string]$Configuration = "Release"
)

$ErrorActionPreference = "Stop"
. (Join-Path $PSScriptRoot "extension-profiles.ps1")
$repoRoot = Get-RepoRoot
Set-Location $repoRoot
$onWindows = $IsWindows -or $env:OS -eq "Windows_NT"
if (-not $onWindows) { $env:EnableWindowsTargeting = "true" }

$failed = [System.Collections.Generic.List[string]]::new()
# -Native: the step is an external program, so its exit code decides. Repo scripts fail by throwing
# (they also run node for advisory notes whose exit code must not count).
function Step([string]$Name, [scriptblock]$Body, [switch]$Native) {
    Write-Host ""
    Write-Host "━━ $Name"
    try {
        $global:LASTEXITCODE = 0
        & $Body
        if ($Native -and $LASTEXITCODE -ne 0) { throw "exit code $LASTEXITCODE" }
        Write-Host "✓ $Name"
    }
    catch {
        Write-Host "  $($_.Exception.Message)"
        Write-Host "✗ $Name"
        $failed.Add($Name) | Out-Null
    }
}

$plugins = @((Get-ExtensionIndex).extensions | Where-Object { $_.kind -eq "plugin" })
foreach ($plugin in $plugins) {
    Step "validate plugin $($plugin.key)" { & (Join-Path $PSScriptRoot "validate-extension.ps1") -Extension $plugin.key -Mode Ci -Configuration $Configuration }
    if (-not $Quick) {
        Step "build plugin $($plugin.key)" { & (Join-Path $PSScriptRoot "build-plugin.ps1") -Extension $plugin.key -Configuration $Configuration }
    }
}

$testArgs = @("test", "tests/Tests.csproj", "-c", $Configuration)
$testName = "unit tests"
if (-not $onWindows) {
    $testArgs += @("--filter", "FullyQualifiedName!~GameHoverDetailsSettingsMigrationTests")
    $testName = "unit tests (Mono; WPF-dependent tests run on Windows only)"
}
Step $testName { dotnet @testArgs } -Native

Step "validate themes" { & (Join-Path $PSScriptRoot "validate-themes.ps1") -Mode Ci -Configuration $Configuration }
if (-not $Quick) {
    Step "build themes" { & (Join-Path $PSScriptRoot "build-themes.ps1") }
}

# Whether an add-on counts as released comes from its <key>-v<version> tag: fetch tags first.
Step "generated READMEs up to date" { node scripts/generate-readmes.mjs --check } -Native
Step "preview colours use theme tokens" { node scripts/preview-tokens.mjs check } -Native
if (-not $Quick) {
    Step "preview layout" { node scripts/preview-layout.mjs } -Native
}

Write-Host ""
if ($failed.Count -gt 0) {
    Write-Host "Failed: $($failed -join ', ')"
    exit 1
}
Write-Host "All checks passed."
