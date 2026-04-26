[CmdletBinding()]
param(
    [string]$Extension = "autogrid",
    [string]$Configuration = "Release",
    [string]$SolutionPath = "",
    [string]$ProjectOutputPath = "",
    [string]$ToolboxExe = $env:TOOLBOX_EXE,
    [switch]$VerifyInstaller,
    [switch]$StrictInstallerVerification,
    [string]$ExtensionManifest = "",
    [string]$InstallerManifest = ""
)

$ErrorActionPreference = "Stop"
. (Join-Path $PSScriptRoot "extension-profiles.ps1")

$profile = Get-ExtensionProfile -Extension $Extension
if (-not $SolutionPath) {
    $SolutionPath = $profile.project
}
if (-not $ProjectOutputPath) {
    $ProjectOutputPath = ($profile.outputPath -replace "/Release/", "/$Configuration/") -replace "\\Release\\", "\$Configuration\"
}
if (-not $ExtensionManifest) {
    $ExtensionManifest = $profile.extensionManifest
}
if (-not $InstallerManifest) {
    $InstallerManifest = $profile.installerManifest
}

& (Join-Path $PSScriptRoot "validate-extension.ps1") -Extension $Extension -Mode Package -Configuration $Configuration

if ($VerifyInstaller) {
    $verifyParams = @{
        Extension         = $Extension
        ToolboxExe        = $ToolboxExe
        VerifyInstaller   = $true
        VerifyOnly        = $true
        ExtensionManifest = $ExtensionManifest
        InstallerManifest = $InstallerManifest
    }
    if (-not $StrictInstallerVerification) {
        $verifyParams.AllowUnpublishedPackageUrl = $true
    }
    & (Join-Path $PSScriptRoot "package-release.ps1") @verifyParams
}

$buildParams = @{
    Extension         = $Extension
    Configuration   = $Configuration
    SolutionPath      = $SolutionPath
    ExtensionManifest = $ExtensionManifest
}
if ($ProjectOutputPath) {
    $buildParams.ProjectOutputPath = $ProjectOutputPath
}
& (Join-Path $PSScriptRoot "build-plugin.ps1") @buildParams

$releaseParams = @{
    Extension         = $Extension
    Configuration   = $Configuration
    ToolboxExe        = $ToolboxExe
    ExtensionManifest = $ExtensionManifest
    InstallerManifest = $InstallerManifest
    VerifyInstaller   = $false
}
if ($ProjectOutputPath) {
    $releaseParams.ProjectOutputPath = $ProjectOutputPath
}
& (Join-Path $PSScriptRoot "package-release.ps1") @releaseParams
