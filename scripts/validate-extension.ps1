[CmdletBinding()]
param(
    [string]$Extension = "autogrid",
    [ValidateSet("Ci", "Package")]
    [string]$Mode = "Ci",
    [string]$Configuration = "Release",
    [switch]$RequireBuildOutput
)

$ErrorActionPreference = "Stop"
. (Join-Path $PSScriptRoot "extension-profiles.ps1")

function Add-ValidationError {
    param(
        [System.Collections.Generic.List[string]]$Errors,
        [string]$Message
    )

    $Errors.Add($Message) | Out-Null
}

function Get-XmlProperty {
    param(
        [string]$Path,
        [string]$PropertyName
    )

    if (-not (Test-Path $Path)) {
        return ""
    }

    $content = Get-Content -Raw -Path $Path
    if ($content -match "<$PropertyName>([^<]+)</$PropertyName>") {
        return $Matches[1].Trim()
    }

    return ""
}

$profile = Get-ExtensionProfile -Extension $Extension
$manifest = Get-ExtensionManifestInfo -Profile $profile
$errors = [System.Collections.Generic.List[string]]::new()

$installerPath = Join-RepoPath $profile.installerManifest
if (-not (Test-Path $installerPath)) {
    Add-ValidationError $errors "Installer manifest not found at $installerPath"
}

$databasePath = if ($profile.databaseManifest) { Join-RepoPath $profile.databaseManifest } else { "" }
$directoryBuildPropsPath = if ($profile.directoryBuildProps) { Join-RepoPath $profile.directoryBuildProps } else { "" }
$outputPath = Join-RepoPath (($profile.outputPath -replace "/Release/", "/$Configuration/") -replace "\\Release\\", "\$Configuration\")

if (-not $manifest.Id) { Add-ValidationError $errors "extension.yaml is missing Id." }
if (-not $manifest.Name) { Add-ValidationError $errors "extension.yaml is missing Name." }
if (-not $manifest.Version) { Add-ValidationError $errors "extension.yaml is missing Version." }
if (-not $manifest.Module) { Add-ValidationError $errors "extension.yaml is missing Module." }
if ($profile.addonId -and $manifest.Id -and $manifest.Id -ne $profile.addonId) {
    Add-ValidationError $errors "Profile addonId '$($profile.addonId)' does not match extension.yaml Id '$($manifest.Id)'."
}

if (Test-Path $installerPath) {
    $installerLines = Get-Content -Path $installerPath
    $installerAddonId = Get-YamlScalar -Lines $installerLines -Key "AddonId"
    $installerVersion = Get-YamlFirstPackageScalar -Lines $installerLines -Key "Version"
    $installerRequiredApi = Get-YamlFirstPackageScalar -Lines $installerLines -Key "RequiredApiVersion"
    $packageUrl = Get-YamlFirstPackageScalar -Lines $installerLines -Key "PackageUrl"
    $installerManifestUrl = Get-YamlScalar -Lines $installerLines -Key "InstallerManifestUrl"
    $sourceUrl = Get-YamlScalar -Lines $installerLines -Key "SourceUrl"

    if ($installerAddonId -ne $manifest.Id) {
        Add-ValidationError $errors "Installer AddonId '$installerAddonId' does not match extension.yaml Id '$($manifest.Id)'."
    }

    if ($installerVersion -ne $manifest.Version) {
        Add-ValidationError $errors "Installer package Version '$installerVersion' does not match extension.yaml Version '$($manifest.Version)'."
    }

    if ($profile.requiredApiVersion -and $installerRequiredApi -ne $profile.requiredApiVersion) {
        Add-ValidationError $errors "Installer RequiredApiVersion '$installerRequiredApi' does not match profile requiredApiVersion '$($profile.requiredApiVersion)'."
    }

    if ($profile.rawBaseUrl) {
        $expectedInstallerUrl = "$($profile.rawBaseUrl)/$($profile.installerManifest)"
        if ($installerManifestUrl -ne $expectedInstallerUrl) {
            Add-ValidationError $errors "InstallerManifestUrl '$installerManifestUrl' does not match expected '$expectedInstallerUrl'."
        }
    }

    if ($profile.sourceUrl -and $sourceUrl -ne $profile.sourceUrl) {
        Add-ValidationError $errors "SourceUrl '$sourceUrl' does not match profile sourceUrl '$($profile.sourceUrl)'."
    }

    if ($Mode -eq "Package" -and $profile.releaseBaseUrl) {
        $tagPattern = if ($profile.tagPattern) { $profile.tagPattern } else { "v{version}" }
        $tag = $tagPattern.Replace("{version}", $manifest.Version).Replace("{key}", $profile.key)
        $expectedPext = Get-ExpectedPextName -AddonId $manifest.Id -Version $manifest.Version
        $expectedPackageUrl = "$($profile.releaseBaseUrl)/$tag/$expectedPext"
        if ($packageUrl -ne $expectedPackageUrl) {
            Add-ValidationError $errors "PackageUrl '$packageUrl' does not match expected '$expectedPackageUrl'."
        }
    }
}

if ($databasePath -and (Test-Path $databasePath)) {
    $databaseLines = Get-Content -Path $databasePath
    $databaseAddonId = Get-YamlScalar -Lines $databaseLines -Key "AddonId"
    $databaseInstallerManifestUrl = Get-YamlScalar -Lines $databaseLines -Key "InstallerManifestUrl"
    $databaseSourceUrl = Get-YamlScalar -Lines $databaseLines -Key "SourceUrl"
    $databaseIconUrl = Get-YamlScalar -Lines $databaseLines -Key "IconUrl"

    if ($databaseAddonId -ne $manifest.Id) {
        Add-ValidationError $errors "Database AddonId '$databaseAddonId' does not match extension.yaml Id '$($manifest.Id)'."
    }

    if ($profile.rawBaseUrl) {
        $expectedInstallerUrl = "$($profile.rawBaseUrl)/$($profile.installerManifest)"
        $expectedIconUrl = "$($profile.rawBaseUrl)/$((Split-Path -Parent $profile.extensionManifest) -replace "\\", "/")/icon.png"
        if ($databaseInstallerManifestUrl -ne $expectedInstallerUrl) {
            Add-ValidationError $errors "Database InstallerManifestUrl '$databaseInstallerManifestUrl' does not match expected '$expectedInstallerUrl'."
        }
        if ($databaseIconUrl -and $databaseIconUrl -ne $expectedIconUrl) {
            Add-ValidationError $errors "Database IconUrl '$databaseIconUrl' does not match expected '$expectedIconUrl'."
        }
    }

    if ($profile.sourceUrl -and $databaseSourceUrl -ne $profile.sourceUrl) {
        Add-ValidationError $errors "Database SourceUrl '$databaseSourceUrl' does not match profile sourceUrl '$($profile.sourceUrl)'."
    }
}
elseif ($databasePath) {
    Add-ValidationError $errors "Database manifest not found at $databasePath"
}

if ($directoryBuildPropsPath) {
    $propsVersion = Get-XmlProperty -Path $directoryBuildPropsPath -PropertyName "Version"
    $assemblyVersion = Get-XmlProperty -Path $directoryBuildPropsPath -PropertyName "AssemblyVersion"
    $fileVersion = Get-XmlProperty -Path $directoryBuildPropsPath -PropertyName "FileVersion"
    $assemblyVersionPrefix = if ($assemblyVersion) { ($assemblyVersion -replace "\.0$", "") } else { "" }
    $fileVersionPrefix = if ($fileVersion) { ($fileVersion -replace "\.0$", "") } else { "" }

    if ($propsVersion -and $propsVersion -ne $manifest.Version) {
        Add-ValidationError $errors "Directory.Build.props Version '$propsVersion' does not match extension.yaml Version '$($manifest.Version)'."
    }
    if ($assemblyVersionPrefix -and $assemblyVersionPrefix -ne $manifest.Version) {
        Add-ValidationError $errors "AssemblyVersion '$assemblyVersion' does not align with extension.yaml Version '$($manifest.Version)'."
    }
    if ($fileVersionPrefix -and $fileVersionPrefix -ne $manifest.Version) {
        Add-ValidationError $errors "FileVersion '$fileVersion' does not align with extension.yaml Version '$($manifest.Version)'."
    }
}

if ($RequireBuildOutput) {
    $modulePath = Join-Path $outputPath $manifest.Module
    $outputManifest = Join-Path $outputPath "extension.yaml"
    if (-not (Test-Path $modulePath)) {
        Add-ValidationError $errors "Expected module output not found at $modulePath"
    }
    if (-not (Test-Path $outputManifest)) {
        Add-ValidationError $errors "Expected copied extension manifest not found at $outputManifest"
    }
}

if ($errors.Count -gt 0) {
    Write-Host "Extension validation failed for '$Extension':"
    foreach ($error in $errors) {
        Write-Host "  - $error"
    }
    throw "Extension validation failed."
}

Write-Host "Extension validation passed for '$Extension' ($Mode)."
Write-Host "  Name: $($manifest.Name)"
Write-Host "  AddonId: $($manifest.Id)"
Write-Host "  Version: $($manifest.Version)"
Write-Host "  Module: $($manifest.Module)"

