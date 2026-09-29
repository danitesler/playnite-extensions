[CmdletBinding()]
param(
    [Parameter(Mandatory = $true)]
    [string]$Extension,
    [string]$Configuration = "Release"
)

$ErrorActionPreference = "Stop"
. (Join-Path $PSScriptRoot "extension-profiles.ps1")

$profile = Get-ExtensionProfile -Extension $Extension

# Themes have no project to compile; build-theme.ps1 builds their drop from src/themes/<Theme>/src instead.
if ((Get-ExtensionKind $profile) -eq "theme") {
    & (Join-Path $PSScriptRoot "build-theme.ps1") -Extension $Extension
    return
}

$repoRoot = Get-RepoRoot
Push-Location $repoRoot
try {
    $buildsRoot = Join-Path $repoRoot "artifacts/builds/$($profile.slug)"
    New-Item -ItemType Directory -Path $buildsRoot -Force | Out-Null
    Get-ChildItem -Path $buildsRoot -Force | Remove-Item -Recurse -Force

    Write-Host "Building $Extension via $($profile.project) ($Configuration)..."
    dotnet build $profile.project -c $Configuration
    if ($LASTEXITCODE -ne 0) {
        throw "dotnet build failed ($LASTEXITCODE)."
    }

    $buildOutput = Join-RepoPath (Get-ExtensionOutputPath -Profile $profile -Configuration $Configuration)
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
