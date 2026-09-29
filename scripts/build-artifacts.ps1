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

& (Join-Path $PSScriptRoot "validate-extension.ps1") -Extension $Extension -Mode Package -Configuration $Configuration

if ($VerifyInstaller) {
    & (Join-Path $PSScriptRoot "package-release.ps1") -Extension $Extension -ToolboxExe $ToolboxExe -VerifyOnly `
        -AllowUnpublishedPackageUrl:(-not $StrictInstallerVerification)
}

& (Join-Path $PSScriptRoot "build-plugin.ps1") -Extension $Extension -Configuration $Configuration
& (Join-Path $PSScriptRoot "package-release.ps1") -Extension $Extension -Configuration $Configuration -ToolboxExe $ToolboxExe
