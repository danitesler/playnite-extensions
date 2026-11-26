# Local verification gate (Windows, or Linux/macOS with PowerShell 7 and the .NET SDK).
# There is no hosted CI: run this before merging or releasing.
# It replaces the old CI workflow: validate + build every plugin, unit tests, validate + build every
# theme, generated READMEs, and the preview token and layout checks.
#
#   pwsh scripts/check-all.ps1          # everything
#   pwsh scripts/check-all.ps1 -Quick   # skip plugin artifact builds and browser checks
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
    [string]$PlaynitePath,
    # How many WPF regression suites run at once (0 = half the CPU cores, at most 8).
    [int]$WpfThrottle = 0
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
    $watch = [System.Diagnostics.Stopwatch]::StartNew()
    try {
        $global:LASTEXITCODE = 0
        & $Body
        if ($Native -and $LASTEXITCODE -ne 0) { throw "exit code $LASTEXITCODE" }
        Write-Host "✓ $Name ($(Format-Elapsed $watch.Elapsed))"
    }
    catch {
        Write-Host "  $($_.Exception.Message)"
        Write-Host "✗ $Name ($(Format-Elapsed $watch.Elapsed))"
        $failed.Add($Name) | Out-Null
    }
}
function Format-Elapsed([TimeSpan]$Span) {
    if ($Span.TotalMinutes -ge 1) { return "{0}m {1:00}s" -f [int][Math]::Floor($Span.TotalMinutes), $Span.Seconds }
    return "{0:0.0}s" -f $Span.TotalSeconds
}
$gateWatch = [System.Diagnostics.Stopwatch]::StartNew()

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
$buildThemes = $themes.Count -gt 0 -and ($onWindows -or -not $Quick)
if ($buildThemes) {
    Step "build themes" { & (Join-Path $PSScriptRoot "build-themes.ps1") -Keys $themes.key }
}
if ($themes.Count -gt 0 -and -not $failed.Contains("build themes")) {
    Step "validate themes" {
        & (Join-Path $PSScriptRoot "validate-themes.ps1") -Keys $themes.key -Mode Ci -Configuration $Configuration -SkipPreviewChecks -RequireBuildOutput:$buildThemes
    }
}
if ($onWindows -and $themes.Count -gt 0 -and -not $failed.Contains("build themes")) {
    if (-not $PlaynitePath) {
        $candidates = @(
            $(if ($env:LOCALAPPDATA) { Join-Path $env:LOCALAPPDATA "Playnite" }),
            $(if ($env:ProgramFiles) { Join-Path $env:ProgramFiles "Playnite" }),
            $(if (${env:ProgramFiles(x86)}) { Join-Path ${env:ProgramFiles(x86)} "Playnite" })
        )
        $PlaynitePath = $candidates | Where-Object { $_ -and (Test-Path -LiteralPath (Join-Path $_ 'MathConverter.dll') -PathType Leaf) } | Select-Object -First 1
    }
    $requiresPlaynite = @(
        'DetailsViewLayoutRegressionTests.ps1'
        'GamePageBreakpointsRegressionTests.ps1'
        'GridDetailsPanelWidthRegressionTests.ps1'
        'GridOverviewLayoutRegressionTests.ps1'
        'SidePanelCloseButtonRegressionTests.ps1'
        'ThemeLoadRegressionTests.ps1'
    )
    $hasConverter = $PlaynitePath -and (Test-Path -LiteralPath (Join-Path $PlaynitePath 'MathConverter.dll') -PathType Leaf)
    # Suites that sample animations in real time (~40s per theme) are split into shards of themes, one process each.
    $shards = @{ 'RunningLabelOverlapRegressionTests.ps1' = 6; 'RunningIndicatorRegressionTests.ps1' = 2 }
    $wpfRuns = foreach ($test in Get-ChildItem -LiteralPath (Join-Path $repoRoot "tests/wpf") -Filter '*RegressionTests.ps1' -File | Sort-Object Name) {
        $extraArgs = @()
        if ($test.Name -in $requiresPlaynite) {
            if (-not $hasConverter) {
                $skipped += $test.Name
                continue
            }
            $extraArgs = @('-PlaynitePath', $PlaynitePath)
        }
        $count = [Math]::Max(1, [Math]::Min([int]$shards[$test.Name], $themes.Count))
        for ($shard = 0; $shard -lt $count; $shard++) {
            $shardKeys = @(for ($i = $shard; $i -lt $themes.Count; $i += $count) { $themes[$i].key })
            $label = if ($count -gt 1) { "$($test.BaseName) (WPF, part $($shard + 1)/$count)" } else { "$($test.BaseName) (WPF)" }
            [pscustomobject]@{ Name = $label; File = $test.FullName; Args = @('-Keys', ($shardKeys -join ',')) + $extraArgs }
        }
    }
    # The suites only read the build drops, each in its own process, so they run side by side.
    # Output is printed per suite as it finishes; -WpfThrottle 1 restores the old serial order.
    $throttle = if ($WpfThrottle -gt 0) { $WpfThrottle } else { [Math]::Max(1, [Math]::Min(8, [int]([Environment]::ProcessorCount / 2))) }
    Write-Host ""
    Write-Host "━━ $(@($wpfRuns).Count) WPF regression suites, $throttle at a time"
    $runSuite = {
        param($Run)
        $watch = [System.Diagnostics.Stopwatch]::StartNew()
        $output = & pwsh -NoProfile -STA -File $Run.File @($Run.Args) 2>&1 | Out-String
        [pscustomobject]@{ Name = $Run.Name; ExitCode = $LASTEXITCODE; Output = $output; Elapsed = $watch.Elapsed }
    }
    $jobs = @(foreach ($run in $wpfRuns) {
        if (Get-Command Start-ThreadJob -ErrorAction SilentlyContinue) {
            Start-ThreadJob -ScriptBlock $runSuite -ArgumentList $run -ThrottleLimit $throttle
        } else {
            Start-Job -ScriptBlock $runSuite -ArgumentList $run
        }
    })
    $pending = [System.Collections.Generic.List[object]]::new()
    $jobs | ForEach-Object { $pending.Add($_) }
    while ($pending.Count -gt 0) {
        $job = Wait-Job -Job $pending.ToArray() -Any
        $pending.Remove($job) | Out-Null
        $result = Receive-Job -Job $job
        Remove-Job -Job $job
        Write-Host ""
        if (-not $result) {
            Write-Host "✗ WPF suite job $($job.Name) returned nothing"
            $failed.Add("WPF suite job $($job.Name)") | Out-Null
            continue
        }
        Write-Host "━━ $($result.Name)"
        Write-Host ($result.Output.TrimEnd())
        if ($result.ExitCode -ne 0) {
            Write-Host "  exit code $($result.ExitCode)"
            Write-Host "✗ $($result.Name) ($(Format-Elapsed $result.Elapsed))"
            $failed.Add($result.Name) | Out-Null
        } else {
            Write-Host "✓ $($result.Name) ($(Format-Elapsed $result.Elapsed))"
        }
    }
    if ($skipped.Count -gt 0) {
        Write-Warning "Skipped WPF tests requiring MathConverter.dll: $($skipped -join ', '). Pass -PlaynitePath to run them."
        $failed.Add('WPF regression prerequisites') | Out-Null
    }
} elseif (-not $onWindows) {
    Write-Host "WPF regression scripts require Windows."
}

# Whether an add-on counts as released comes from its <key>-v<version> tag: fetch tags first.
Step "generated READMEs up to date" { node scripts/generate-readmes.mjs --check } -Native
Step "every theme draws its own menu icons" { node scripts/render-menu-icons.mjs --check } -Native
if (-not $Quick) {
    Step "preview tooling regressions" { node --test tests/PreviewToolsTests.mjs } -Native
    if ($themes.Count -gt 0) {
        Step "preview colours use theme tokens" { node scripts/preview-tokens.mjs check @themePaths } -Native
        Step "preview layout" { node scripts/preview-layout.mjs @themePaths } -Native
    }
}

Write-Host ""
Write-Host "Total time: $(Format-Elapsed $gateWatch.Elapsed)"
if ($failed.Count -gt 0) {
    Write-Host "Failed: $($failed -join ', ')"
    exit 1
}
Write-Host "All checks passed."
