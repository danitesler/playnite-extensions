# Packs an already built add-on into artifacts/releases/: a zip and the Toolbox .pext / .pthm. Does not compile.
[CmdletBinding()]
param(
    [Parameter(Mandatory = $true)]
    [string]$Extension,
    [string]$Configuration = "Release",
    [string]$ToolboxExe = $env:TOOLBOX_EXE,
    [switch]$VerifyInstaller,
    # Verify the installer manifest only; no packaging.
    [switch]$VerifyOnly,
    [switch]$AllowUnpublishedPackageUrl
)

$ErrorActionPreference = "Stop"
. (Join-Path $PSScriptRoot "extension-profiles.ps1")

if ($VerifyOnly) {
    $VerifyInstaller = $true
}

$repoRoot = Get-RepoRoot
Push-Location $repoRoot
try {
    $profile = Get-ExtensionProfile -Extension $Extension
    $isTheme = (Get-ExtensionKind $profile) -eq "theme"
    $manifest = Get-ExtensionManifestInfo -Profile $profile
    foreach ($field in @("Version", "Name") + @(if (-not $isTheme) { "Module" })) {
        if (-not $manifest.$field) {
            throw "Unable to resolve $field from $($manifest.Path)"
        }
    }
    $version = $manifest.Version

    $ToolboxExe = Get-PlayniteToolboxExe -ToolboxExe $ToolboxExe -Download

    $installerManifestFull = Join-RepoPath $profile.installerManifest
    if (-not (Test-Path $installerManifestFull)) {
        throw "Installer manifest not found at $installerManifestFull"
    }

    if ($VerifyInstaller) {
        Write-Host "Verifying installer manifest..."
        $verifyOutput = & $ToolboxExe verify installer $installerManifestFull 2>&1
        $verifyText = $verifyOutput | Out-String
        Write-Host $verifyText.Trim()
        if ($LASTEXITCODE -ne 0 -or $verifyText -match "didn't pass verification") {
            if ($AllowUnpublishedPackageUrl -and $verifyText -match "PackageUrl doesn't point to reachable HTTP location") {
                Write-Warning "Installer manifest PackageUrl is not reachable yet. Continuing because package-only builds may run before the GitHub Release asset is uploaded."
            }
            else {
                throw "Installer manifest verification failed."
            }
        }
    }

    if ($VerifyOnly) {
        Write-Host "VerifyOnly: skipping packaging."
        return
    }

    & (Join-Path $PSScriptRoot "validate-extension.ps1") -Extension $Extension -Mode Package -Configuration $Configuration -RequireBuildOutput

    $buildOutput = Join-RepoPath (Get-ExtensionOutputPath -Profile $profile -Configuration $Configuration)
    if (-not (Test-Path $buildOutput)) {
        throw "Build output folder not found at $buildOutput. Run build-plugin.ps1 first."
    }

    $releaseSub = if ($isTheme) { "themes/$($profile.slug)" } else { $profile.slug }
    $releaseDrop = Join-Path $repoRoot "artifacts/releases/$releaseSub"
    New-Item -ItemType Directory -Path $releaseDrop -Force | Out-Null

    $zipPath = Join-Path $releaseDrop ("{0}-{1}.zip" -f $profile.slug, $version)
    if ($isTheme) {
        # The theme build drop is the whole theme; ship all of it in the zip.
        Compress-Archive -Path (Join-Path $buildOutput "*") -DestinationPath $zipPath -Force
    }
    else {
        $dllPath = Join-Path $buildOutput $manifest.Module
        $outputManifest = Join-Path $buildOutput "extension.yaml"
        Compress-Archive -LiteralPath @($outputManifest, $dllPath) -DestinationPath $zipPath -Force
    }

    $packageKind = if ($isTheme) { ".pthm" } else { ".pext" }
    Write-Host "Packing $packageKind with Playnite Toolbox..."
    & $ToolboxExe pack $buildOutput $releaseDrop

    $packageUrl = Get-ExpectedPackageUrl -Profile $profile -AddonId $manifest.Id -Version $version

    Write-Host ""
    Write-Host "Release artifacts created:"
    Write-Host "  Release zip: $zipPath"
    Write-Host "  Release drop: $releaseDrop"
    Write-Host "Manual GitHub Release details:"
    Write-Host "  Tag: $(Get-ExtensionReleaseTag -Profile $profile -Version $version)"
    Write-Host "  Expected ${packageKind}: $(Split-Path -Leaf $packageUrl)"
    Write-Host "  PackageUrl: $packageUrl"
}
finally {
    Pop-Location
}
