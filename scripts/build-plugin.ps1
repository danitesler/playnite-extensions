[CmdletBinding()]
param(
    [string]$Extension = "autogrid",
    [string]$Configuration = "Release",
    [string]$SolutionPath = "",
    [string]$ProjectOutputPath = "",
    [string]$ExtensionManifest = ""
)

$ErrorActionPreference = "Stop"
. (Join-Path $PSScriptRoot "extension-profiles.ps1")

$repoRoot = Resolve-Path (Join-Path $PSScriptRoot "..")
Push-Location $repoRoot
try {
    $profile = Get-ExtensionProfile -Extension $Extension
    $manifest = Get-ExtensionManifestInfo -Profile $profile

    if (-not $SolutionPath) {
        $SolutionPath = $profile.project
    }
    if (-not $ProjectOutputPath) {
        $ProjectOutputPath = ($profile.outputPath -replace "/Release/", "/$Configuration/") -replace "\\Release\\", "\$Configuration\"
    }
    if (-not $ExtensionManifest) {
        $ExtensionManifest = $profile.extensionManifest
    }

    $version = $manifest.Version
    if (-not $version) {
        throw "Unable to resolve Version from $($manifest.Path)"
    }

    $slug = if ($profile.slug) { $profile.slug } else { $profile.key }
    $buildsRoot = Join-Path $repoRoot "artifacts/builds/$slug"
    New-Item -ItemType Directory -Path $buildsRoot -Force | Out-Null
    Get-ChildItem -Path $buildsRoot -Force | Remove-Item -Recurse -Force

    Write-Host "Building $Extension via $SolutionPath ($Configuration)..."
    dotnet build $SolutionPath -c $Configuration

    $buildOutput = Join-Path $repoRoot $ProjectOutputPath
    if (-not (Test-Path $buildOutput)) {
        throw "Build output folder not found at $buildOutput"
    }

    Copy-Item -Path (Join-Path $buildOutput "*") -Destination $buildsRoot -Recurse -Force

    Write-Host ""
    Write-Host "Build drop: $buildsRoot"
}
finally {
    Pop-Location
}
