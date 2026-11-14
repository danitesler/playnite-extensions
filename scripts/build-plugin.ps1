[CmdletBinding()]
param(
    [Parameter(Mandatory = $true)]
    [string]$Extension,
    [string]$Configuration = "Release",
    # Compile only into bin/<Configuration>/net462; do not touch a possibly loaded local build drop.
    [switch]$NoDeploy,
    [switch]$NoRestart,
    [string]$DeployPath = "",
    [string]$PlayniteExe = "",
    [string]$DataPath = ""
)

$ErrorActionPreference = "Stop"
. (Join-Path $PSScriptRoot "lib/extension-profiles.ps1")
. (Join-Path $PSScriptRoot "lib/theme-tools.ps1")
. (Join-Path $PSScriptRoot "lib/playnite-runtime.ps1")

$profile = Get-ExtensionProfile -Extension $Extension

# Themes have no project to compile; build-theme.ps1 builds their drop from src/themes/<Theme>/src instead.
if ((Get-ExtensionKind $profile) -eq "theme") {
    & (Join-Path $PSScriptRoot "build-theme.ps1") -Extension $Extension -NoDeploy:$NoDeploy -NoRestart:$NoRestart `
        -DeployPath $DeployPath -PlayniteExe $PlayniteExe -DataPath $DataPath
    return
}

$repoRoot = Get-RepoRoot
$context = if (-not $NoDeploy) { Get-PlayniteBuildContext -DataPath $DataPath -DeployPath $DeployPath -PlayniteExe $PlayniteExe }
Push-Location $repoRoot
try {
    $buildsRoot = Join-Path $repoRoot "artifacts/builds/$($profile.slug)"
    Write-Host "Building $Extension via $($profile.project) ($Configuration)..."
    dotnet build $profile.project -c $Configuration
    if ($LASTEXITCODE -ne 0) {
        throw "dotnet build failed ($LASTEXITCODE)."
    }

    $buildOutput = Join-RepoPath (Get-ExtensionOutputPath -Profile $profile -Configuration $Configuration)
    if (-not (Test-Path $buildOutput)) {
        throw "Build output folder not found at $buildOutput"
    }
    if ($NoDeploy) {
        Write-Host "Build output: $buildOutput (deployment skipped)."
        return
    }

    if ($context) {
        $manifest = Get-ExtensionManifestInfo -Profile $profile
        $extensionsRoot = if ($DeployPath) { $DeployPath } else { Join-Path $context.DataPath "Extensions" }
        $folder = $manifest.Id
        # Reuse an existing installation even when its directory differs from the manifest Id.
        $matches = @(Get-ChildItem -LiteralPath $extensionsRoot -Directory -ErrorAction SilentlyContinue | Where-Object {
            $installedManifest = Join-Path $_.FullName "extension.yaml"
            (Test-Path -LiteralPath $installedManifest) -and
                (Get-YamlScalar -Lines (Get-Content -LiteralPath $installedManifest) -Key "Id") -eq $manifest.Id
        })
        if ($matches.Count -gt 1) { throw "Multiple installed copies of '$($manifest.Id)' found in $extensionsRoot." }
        if ($matches.Count -eq 1) { $folder = $matches[0].Name }
        if ($NoRestart -and $context.Sessions.Count -gt 0) { throw "Playnite is running; plugin deployment requires a restart. Omit -NoRestart or use -NoDeploy." }
        Invoke-PlayniteDeployment -Context $context -NoRestart:$NoRestart -Deploy {
            Copy-PlayniteBuild -Source $buildOutput -Root (Join-Path $repoRoot "artifacts/builds") -Folder $profile.slug
            Copy-PlayniteBuild -Source $buildsRoot -Root $extensionsRoot -Folder $folder
        }
    } else {
        Copy-PlayniteBuild -Source $buildOutput -Root (Join-Path $repoRoot "artifacts/builds") -Folder $profile.slug
        if (-not $NoDeploy) { Write-Host "No local Playnite installation available (or non-Windows/CI); kept the build drop only." }
    }
    Write-Host ""
    Write-Host "Build drop: $buildsRoot"
}
finally {
    Pop-Location
}
