[CmdletBinding()]
param(
    [string]$Extension = "autogrid",
    [string]$Configuration = "Release",
    [string]$ProjectOutputPath = "",
    [string]$ToolboxExe = $env:TOOLBOX_EXE,
    [switch]$VerifyInstaller,
    [switch]$VerifyOnly,
    [switch]$AllowUnpublishedPackageUrl,
    [string]$ExtensionManifest = "",
    [string]$InstallerManifest = ""
)

$ErrorActionPreference = "Stop"
. (Join-Path $PSScriptRoot "extension-profiles.ps1")

if ($VerifyOnly) {
    $VerifyInstaller = $true
}

$repoRoot = Resolve-Path (Join-Path $PSScriptRoot "..")
Push-Location $repoRoot
try {
    $profile = Get-ExtensionProfile -Extension $Extension
    $manifest = Get-ExtensionManifestInfo -Profile $profile

    if (-not $ProjectOutputPath) {
        $ProjectOutputPath = ($profile.outputPath -replace "/Release/", "/$Configuration/") -replace "\\Release\\", "\$Configuration\"
    }
    if (-not $ExtensionManifest) {
        $ExtensionManifest = $profile.extensionManifest
    }
    if (-not $InstallerManifest) {
        $InstallerManifest = $profile.installerManifest
    }

    $extensionManifestFull = Join-RepoPath $ExtensionManifest
    if (-not (Test-Path $extensionManifestFull)) {
        throw "extension.yaml not found at $extensionManifestFull"
    }

    $version = $manifest.Version
    if (-not $version) {
        throw "Unable to resolve Version from $extensionManifestFull"
    }

    $module = $manifest.Module
    if (-not $module) {
        throw "Unable to resolve Module from $extensionManifestFull"
    }

    $extensionName = $manifest.Name
    if (-not $extensionName) {
        throw "Unable to resolve Name from $extensionManifestFull"
    }

    if (-not $ToolboxExe) {
        $toolboxCandidates = @(
            "$Env:ProgramFiles\Playnite\Toolbox.exe",
            "${Env:ProgramFiles(x86)}\Playnite\Toolbox.exe",
            "$Env:LOCALAPPDATA\Programs\Playnite\Toolbox.exe"
        ) | Where-Object { $_ -and (Test-Path $_) }

        if ($toolboxCandidates.Count -gt 0) {
            $ToolboxExe = $toolboxCandidates[0]
        }
    }

    if (-not $ToolboxExe -or -not (Test-Path $ToolboxExe)) {
        Write-Host "Toolbox.exe not found locally; downloading Playnite to resolve Toolbox..."
        $release = Invoke-RestMethod -Uri "https://api.github.com/repos/JosefNemec/Playnite/releases/latest"
        $archiveAsset = $release.assets | Where-Object { $_.name -match "\.(zip|7z)$" } | Select-Object -First 1
        if (-not $archiveAsset) {
            throw "Unable to resolve Playnite archive asset (.zip or .7z) from latest release."
        }

        $archivePath = Join-Path $env:TEMP $archiveAsset.name
        $extractPath = Join-Path $env:TEMP "Playnite-Toolbox"
        Invoke-WebRequest -Uri $archiveAsset.browser_download_url -OutFile $archivePath

        if ($archiveAsset.name -match "\.zip$") {
            Expand-Archive -Path $archivePath -DestinationPath $extractPath -Force
        }
        else {
            $sevenZip = "C:\Program Files\7-Zip\7z.exe"
            if (-not (Test-Path $sevenZip)) {
                throw "7z.exe not found at $sevenZip. Install 7-Zip or pass -ToolboxExe."
            }
            New-Item -ItemType Directory -Path $extractPath -Force | Out-Null
            & $sevenZip x $archivePath "-o$extractPath" -y | Out-Null
        }

        $ToolboxExe = Get-ChildItem -Path $extractPath -Filter "Toolbox.exe" -Recurse | Select-Object -First 1 -ExpandProperty FullName
        if (-not $ToolboxExe -or -not (Test-Path $ToolboxExe)) {
            throw "Toolbox.exe not found after Playnite extraction. Pass -ToolboxExe to continue."
        }
    }

    $installerManifestFull = Join-RepoPath $InstallerManifest
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

    $buildOutput = Join-Path $repoRoot $ProjectOutputPath
    if (-not (Test-Path $buildOutput)) {
        throw "Build output folder not found at $buildOutput. Run build-plugin.ps1 first."
    }

    $dllPath = Join-Path $buildOutput $module
    $outputManifest = Join-Path $buildOutput "extension.yaml"
    if (-not (Test-Path $dllPath)) {
        throw "Expected module not found at $dllPath"
    }
    if (-not (Test-Path $outputManifest)) {
        throw "Expected extension manifest not found at $outputManifest"
    }

    $slug = if ($profile.slug) { $profile.slug } else { $profile.key }
    $releaseDrop = Join-Path $repoRoot "artifacts/releases/$slug"
    New-Item -ItemType Directory -Path $releaseDrop -Force | Out-Null

    $zipName = "{0}-{1}.zip" -f $extensionName.ToLowerInvariant(), $version
    $zipPath = Join-Path $releaseDrop $zipName
    Compress-Archive -LiteralPath @($outputManifest, $dllPath) -DestinationPath $zipPath -Force

    Write-Host "Packing .pext with Playnite Toolbox..."
    & $ToolboxExe pack $buildOutput $releaseDrop

    $expectedPext = Get-ExpectedPextName -AddonId $manifest.Id -Version $version
    $tagPattern = if ($profile.tagPattern) { $profile.tagPattern } else { "{key}-v{version}" }
    $tag = $tagPattern.Replace("{version}", $version).Replace("{key}", $profile.key)
    $expectedPackageUrl = "$($profile.releaseBaseUrl)/$tag/$expectedPext"

    Write-Host ""
    Write-Host "Release artifacts created:"
    Write-Host "  Release zip: $zipPath"
    Write-Host "  Release drop: $releaseDrop"
    Write-Host "Manual GitHub Release details:"
    Write-Host "  Tag: $tag"
    Write-Host "  Expected .pext: $expectedPext"
    Write-Host "  PackageUrl: $expectedPackageUrl"
}
finally {
    Pop-Location
}
