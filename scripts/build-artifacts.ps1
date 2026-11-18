# One-shot release flow for one add-on: validate, optionally verify the installer manifest, build, package.
[CmdletBinding()]
param(
    [Parameter(Mandatory = $true)]
    [string]$Extension,
    [string]$Configuration = "Release",
    [string]$ToolboxExe = $env:TOOLBOX_EXE,
    [switch]$VerifyInstaller,
    # Fail when PackageUrl is not reachable yet (use after the GitHub Release asset is uploaded).
    [switch]$StrictInstallerVerification
)

$ErrorActionPreference = "Stop"
. (Join-Path $PSScriptRoot "lib/extension-profiles.ps1")

$profile = Get-ExtensionProfile -Extension $Extension
$isTheme = (Get-ExtensionKind $profile) -eq "theme"

if ($VerifyInstaller) {
    $ToolboxExe = Get-PlayniteToolboxExe -ToolboxExe $ToolboxExe -Download
    & (Join-Path $PSScriptRoot "package-release.ps1") -Extension $Extension -ToolboxExe $ToolboxExe -VerifyOnly `
        -AllowUnpublishedPackageUrl:(-not $StrictInstallerVerification)
}

if ($isTheme) {
    & (Join-Path $PSScriptRoot "build-theme.ps1") -Extension $Extension -NoDeploy
}
else {
    & (Join-Path $PSScriptRoot "build-plugin.ps1") -Extension $Extension -Configuration $Configuration -NoDeploy
}
& (Join-Path $PSScriptRoot "package-release.ps1") -Extension $Extension -Configuration $Configuration -ToolboxExe $ToolboxExe
