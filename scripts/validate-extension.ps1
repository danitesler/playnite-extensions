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
. (Join-Path $PSScriptRoot "theme-tools.ps1")

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
$kind = Get-ExtensionKind $profile
$isTheme = $kind -eq "theme"
$manifest = if ($isTheme) { Get-ThemeManifestInfo -Profile $profile } else { Get-ExtensionManifestInfo -Profile $profile }
$manifestName = Split-Path -Leaf $manifest.Path
$packageExtension = if ($isTheme) { ".pthm" } else { ".pext" }
$errors = [System.Collections.Generic.List[string]]::new()

$installerPath = Join-RepoPath $profile.installerManifest
if (-not (Test-Path $installerPath)) {
    Add-ValidationError $errors "Installer manifest not found at $installerPath"
}

$databasePath = if ($profile.databaseManifest) { Join-RepoPath $profile.databaseManifest } else { "" }
$directoryBuildPropsPath = if ($profile.directoryBuildProps) { Join-RepoPath $profile.directoryBuildProps } else { "" }
$outputPath = Join-RepoPath (($profile.outputPath -replace "/Release/", "/$Configuration/") -replace "\\Release\\", "\$Configuration\")

if (-not $manifest.Id) { Add-ValidationError $errors "$manifestName is missing Id." }
if (-not $manifest.Name) { Add-ValidationError $errors "$manifestName is missing Name." }
if (-not $manifest.Version) { Add-ValidationError $errors "$manifestName is missing Version." }
if ($profile.addonId -and $manifest.Id -and $manifest.Id -ne $profile.addonId) {
    Add-ValidationError $errors "Profile addonId '$($profile.addonId)' does not match $manifestName Id '$($manifest.Id)'."
}

if ($isTheme) {
    $parsedVersion = $null
    if ($manifest.Version -and -not [System.Version]::TryParse($manifest.Version, [ref]$parsedVersion)) {
        Add-ValidationError $errors "theme.yaml Version '$($manifest.Version)' is not a numeric version; Toolbox refuses to pack it."
    }
    if ($manifest.Mode -notin @("Desktop", "Fullscreen")) {
        Add-ValidationError $errors "theme.yaml Mode must be Desktop or Fullscreen (got '$($manifest.Mode)')."
    }
    if (-not $manifest.ThemeApiVersion) {
        Add-ValidationError $errors "theme.yaml is missing ThemeApiVersion."
    }
    elseif ($profile.requiredApiVersion -and $manifest.ThemeApiVersion -ne $profile.requiredApiVersion) {
        Add-ValidationError $errors "theme.yaml ThemeApiVersion '$($manifest.ThemeApiVersion)' does not match profile requiredApiVersion '$($profile.requiredApiVersion)'."
    }
    foreach ($legacy in @("themeKit", "palette", "themeDir")) {
        if ($profile.PSObject.Properties.Name -contains $legacy) {
            Add-ValidationError $errors "Theme profile still has '$legacy'. Themes are standalone: sources live in themeSource (src/<Theme>/src)."
        }
    }

    if ($manifest.Mode -in @("Desktop", "Fullscreen")) {
        $api = Get-PlayniteThemeApiData -Mode $manifest.Mode
        $supported = [System.Version]$api.ApiVersion
        $declared = $null
        if ($manifest.ThemeApiVersion -and [System.Version]::TryParse($manifest.ThemeApiVersion, [ref]$declared)) {
            if ($declared.Major -ne $supported.Major -or $declared -gt $supported) {
                Add-ValidationError $errors "ThemeApiVersion $declared will not load on Playnite $($api.PlayniteVersion) (theme API $supported): major must match and it must not be newer."
            }
        }

        # Build into a scratch folder and run the same checks build-theme.ps1 runs.
        $scratch = Join-Path ([System.IO.Path]::GetTempPath()) ("playnite-theme-validate-" + [guid]::NewGuid().ToString("N"))
        try {
            Invoke-ThemeBuild -Profile $profile -OutDir $scratch | Out-Null
            foreach ($themeError in @(Test-ThemeBuild -Directory $scratch -Mode $manifest.Mode -ResourcePrefix $profile.resourcePrefix)) {
                Add-ValidationError $errors $themeError
            }
        }
        catch {
            Add-ValidationError $errors "Theme build failed: $($_.Exception.Message)"
        }
        finally {
            if (Test-Path $scratch) { Remove-Item -Path $scratch -Recurse -Force }
        }
    }
}
elseif (-not $manifest.Module) {
    Add-ValidationError $errors "extension.yaml is missing Module."
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
        Add-ValidationError $errors "Installer AddonId '$installerAddonId' does not match $manifestName Id '$($manifest.Id)'."
    }

    if ($installerVersion -ne $manifest.Version) {
        Add-ValidationError $errors "Installer package Version '$installerVersion' does not match $manifestName Version '$($manifest.Version)'."
    }

    if ($profile.requiredApiVersion -and $installerRequiredApi -ne $profile.requiredApiVersion) {
        Add-ValidationError $errors "Installer RequiredApiVersion '$installerRequiredApi' does not match profile requiredApiVersion '$($profile.requiredApiVersion)'."
    }

    if ($profile.rawBaseUrl -and $installerManifestUrl) {
        $expectedInstallerUrl = "$($profile.rawBaseUrl)/$($profile.installerManifest)"
        if ($installerManifestUrl -ne $expectedInstallerUrl) {
            Add-ValidationError $errors "InstallerManifestUrl '$installerManifestUrl' does not match expected '$expectedInstallerUrl'."
        }
    }

    if ($profile.sourceUrl -and $sourceUrl -and $sourceUrl -ne $profile.sourceUrl) {
        Add-ValidationError $errors "SourceUrl '$sourceUrl' does not match profile sourceUrl '$($profile.sourceUrl)'."
    }

    if ($Mode -eq "Package" -and $profile.releaseBaseUrl) {
        $tagPattern = if ($profile.tagPattern) { $profile.tagPattern } else { "{key}-v{version}" }
        $tag = $tagPattern.Replace("{version}", $manifest.Version).Replace("{key}", $profile.key)
        $expectedPackage = Get-ExpectedPackageName -AddonId $manifest.Id -Version $manifest.Version -PackageExtension $packageExtension
        $expectedPackageUrl = "$($profile.releaseBaseUrl)/$tag/$expectedPackage"
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
        Add-ValidationError $errors "Database AddonId '$databaseAddonId' does not match $manifestName Id '$($manifest.Id)'."
    }

    if ($isTheme) {
        $databaseType = Get-YamlScalar -Lines $databaseLines -Key "Type"
        $expectedType = "Theme$($manifest.Mode)"
        if ($databaseType -ne $expectedType) {
            Add-ValidationError $errors "Database Type '$databaseType' should be '$expectedType' for a $($manifest.Mode) theme."
        }
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

if ($directoryBuildPropsPath -and -not $isTheme) {
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

if ($RequireBuildOutput -and $isTheme) {
    foreach ($required in @("theme.yaml", "Constants.xaml")) {
        if (-not (Test-Path (Join-Path $outputPath $required))) {
            Add-ValidationError $errors "Expected $required in theme build output at $outputPath. Run build-theme.ps1 first."
        }
    }
}
elseif ($RequireBuildOutput) {
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
if ($isTheme) {
    Write-Host "  Theme: $($manifest.Mode), API $($manifest.ThemeApiVersion)"
}
else {
    Write-Host "  Module: $($manifest.Module)"
}

