# Local verification gate (Windows, or Linux/macOS with PowerShell 7 and the .NET SDK).
# There is no hosted CI: run this before merging or releasing.
# It replaces the old CI workflow: validate + build every plugin, unit tests, validate + build every
# theme, generated READMEs, and the preview token and layout checks.
#
#   pwsh scripts/check-all.ps1          # everything
#   pwsh scripts/check-all.ps1 -Quick   # skip artifact builds and browser checks
#   pwsh scripts/check-all.ps1 -Keys hallowtide,emberline
#
# On Linux and macOS, the plugins build with EnableWindowsTargeting and the tests run on Mono.
# Tests that load WPF run only on Windows.
# Builds never deploy or restart Playnite.
[CmdletBinding()]
param(
    [switch]$Quick,
    [string]$Configuration = "Release",
    [string[]]$Keys = @(),
    [string]$PlaynitePath
)

$ErrorActionPreference = "Stop"
. (Join-Path $PSScriptRoot "lib/extension-profiles.ps1")
$repoRoot = Get-RepoRoot
$onWindows = $IsWindows -or $env:OS -eq "Windows_NT"
if (-not $onWindows) { $env:EnableWindowsTargeting = "true" }
$extensions = @(Select-RegisteredExtensions -Extensions (Get-ExtensionIndex).extensions -Keys $Keys)
$themes = @($extensions | Where-Object kind -eq theme)
$themePaths = @($themes | ForEach-Object { Join-RepoPath $_.dir })

if ($onWindows -and $PlaynitePath) {
    $PlaynitePath = (Resolve-Path -LiteralPath $PlaynitePath).Path
    if (-not (Test-Path -LiteralPath (Join-Path $PlaynitePath 'MathConverter.dll') -PathType Leaf)) {
        throw "MathConverter.dll was not found in '$PlaynitePath'. Pass the Playnite installation folder."
    }
}
Set-Location $repoRoot

$failed = [System.Collections.Generic.List[string]]::new()
$skipped = @()
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

$plugins = @($extensions | Where-Object kind -eq plugin)
foreach ($plugin in $plugins) {
    Step "validate plugin $($plugin.key)" { & (Join-Path $PSScriptRoot "validate-extension.ps1") -Extension $plugin.key -Mode Ci -Configuration $Configuration }
    if (-not $Quick) {
        Step "build plugin $($plugin.key)" { & (Join-Path $PSScriptRoot "build-plugin.ps1") -Extension $plugin.key -Configuration $Configuration -NoDeploy }
    }
}

$testArgs = @("test", "tests/Tests.csproj", "-c", $Configuration)
$testName = "unit tests"
if (-not $onWindows) {
    $testArgs += @("--filter", "FullyQualifiedName!~GameHoverDetailsSettingsMigrationTests&FullyQualifiedName!~AutogridSettingsTests")
    $testName = "unit tests (Mono; WPF-dependent tests run on Windows only)"
}
Step $testName { dotnet @testArgs } -Native
Step "script regressions" { & (Join-Path $repoRoot "tests/ScriptRegressionTests.ps1") }
if ($onWindows) {
    if (-not $PlaynitePath -and $env:LOCALAPPDATA) {
        $PlaynitePath = Join-Path $env:LOCALAPPDATA "Playnite"
    }
    $requiresPlaynite = @(
        'DetailsViewLayoutRegressionTests.ps1'
        'GamePageBreakpointsRegressionTests.ps1'
        'GridDetailsPanelWidthRegressionTests.ps1'
        'GridOverviewLayoutRegressionTests.ps1'
        'SidePanelCloseButtonRegressionTests.ps1'
    )
    $hasConverter = $PlaynitePath -and (Test-Path -LiteralPath (Join-Path $PlaynitePath 'MathConverter.dll') -PathType Leaf)
    foreach ($test in Get-ChildItem -LiteralPath (Join-Path $repoRoot "tests/wpf") -Filter '*RegressionTests.ps1' -File | Sort-Object Name) {
        $wpfArgs = @()
        if ($test.Name -in $requiresPlaynite) {
            if (-not $hasConverter) {
                $skipped += $test.Name
                continue
            }
            $wpfArgs += @('-PlaynitePath', $PlaynitePath)
        }
        Step "$($test.BaseName) (WPF)" { pwsh -NoProfile -STA -File $test.FullName @wpfArgs } -Native
    }
    if ($skipped.Count -gt 0) {
        Write-Warning "Skipped WPF tests requiring MathConverter.dll: $($skipped -join ', '). Pass -PlaynitePath to run them."
        $failed.Add('WPF regression prerequisites') | Out-Null
    }
} else {
    Write-Host "WPF regression scripts require Windows."
}

if ($themes.Count -gt 0) {
    Step "validate themes" { & (Join-Path $PSScriptRoot "validate-themes.ps1") -Keys $themes.key -Mode Ci -Configuration $Configuration -SkipPreviewChecks }
    if (-not $Quick) {
        Step "build themes" { & (Join-Path $PSScriptRoot "build-themes.ps1") -Keys $themes.key }
    }
}

# Whether an add-on counts as released comes from its <key>-v<version> tag: fetch tags first.
Step "generated READMEs up to date" { node scripts/generate-readmes.mjs --check } -Native
if (-not $Quick) {
    Step "preview tooling regressions" { node --test tests/PreviewToolsTests.mjs } -Native
    if ($themes.Count -gt 0) {
        Step "preview colours use theme tokens" { node scripts/preview-tokens.mjs check @themePaths } -Native
        Step "preview layout" { node scripts/preview-layout.mjs @themePaths } -Native
    }
}

Write-Host ""
if ($failed.Count -gt 0) {
    Write-Host "Failed: $($failed -join ', ')"
    exit 1
}
Write-Host "All checks passed."
