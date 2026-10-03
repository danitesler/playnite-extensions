[CmdletBinding()]
param(
    [Parameter(Mandatory = $true)]
    [string]$Extension,
    [ValidateSet("Ci", "Package")]
    [string]$Mode = "Ci",
    [string]$Configuration = "Release",
    [switch]$RequireBuildOutput
)

$ErrorActionPreference = "Stop"
. (Join-Path $PSScriptRoot "extension-profiles.ps1")
. (Join-Path $PSScriptRoot "theme-tools.ps1")

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
$isTheme = (Get-ExtensionKind $profile) -eq "theme"
$manifest = Get-ExtensionManifestInfo -Profile $profile
$manifestName = Split-Path -Leaf $manifest.Path
$errors = [System.Collections.Generic.List[string]]::new()

$installerPath = Join-RepoPath $profile.installerManifest
if (-not (Test-Path $installerPath)) {
    $errors.Add("Installer manifest not found at $installerPath")
}

$databasePath = Join-RepoPath $profile.databaseManifest
$outputPath = Join-RepoPath (Get-ExtensionOutputPath -Profile $profile -Configuration $Configuration)

if (-not $manifest.Id) { $errors.Add("$manifestName is missing Id.") }
if (-not $manifest.Name) { $errors.Add("$manifestName is missing Name.") }
if (-not $manifest.Version) { $errors.Add("$manifestName is missing Version.") }
if ($profile.addonId -and $manifest.Id -and $manifest.Id -ne $profile.addonId) {
    $errors.Add("Profile addonId '$($profile.addonId)' does not match $manifestName Id '$($manifest.Id)'.")
}

# PlayniteAddonDatabase Type: ThemeDesktop / ThemeFullscreen for themes, the database name of the plugin type otherwise.
$expectedDatabaseType = ""

if ($isTheme) {
    $parsedVersion = $null
    if ($manifest.Version -and -not [System.Version]::TryParse($manifest.Version, [ref]$parsedVersion)) {
        $errors.Add("theme.yaml Version '$($manifest.Version)' is not a numeric version; Toolbox refuses to pack it.")
    }
    if ($manifest.Mode -notin @("Desktop", "Fullscreen")) {
        $errors.Add("theme.yaml Mode must be Desktop or Fullscreen (got '$($manifest.Mode)').")
    }
    if (-not $manifest.ThemeApiVersion) {
        $errors.Add("theme.yaml is missing ThemeApiVersion.")
    }
    elseif ($profile.requiredApiVersion -and $manifest.ThemeApiVersion -ne $profile.requiredApiVersion) {
        $errors.Add("theme.yaml ThemeApiVersion '$($manifest.ThemeApiVersion)' does not match profile requiredApiVersion '$($profile.requiredApiVersion)'.")
    }

    if ($manifest.Mode -in @("Desktop", "Fullscreen")) {
        $expectedDatabaseType = "Theme$($manifest.Mode)"
        $api = Get-PlayniteThemeApiData -Mode $manifest.Mode
        $supported = [System.Version]$api.ApiVersion
        $declared = $null
        if ($manifest.ThemeApiVersion -and [System.Version]::TryParse($manifest.ThemeApiVersion, [ref]$declared)) {
            if ($declared.Major -ne $supported.Major -or $declared -gt $supported) {
                $errors.Add("ThemeApiVersion $declared will not load on Playnite $($api.PlayniteVersion) (theme API $supported): major must match and it must not be newer.")
            }
        }

        # Build into a scratch folder and run the same checks build-theme.ps1 runs.
        $scratch = Join-Path ([System.IO.Path]::GetTempPath()) ("playnite-theme-validate-" + [guid]::NewGuid().ToString("N"))
        try {
            Invoke-ThemeBuild -Profile $profile -OutDir $scratch | Out-Null
            foreach ($themeError in @(Test-ThemeBuild -Directory $scratch -Mode $manifest.Mode)) {
                $errors.Add($themeError)
            }
            $missing = @(Get-ThemeMissingRequiredKeys -Directory $scratch)
            if ($missing.Count -gt 0) {
                $errors.Add("Required shared keys missing (scripts/data/theme-keys.json): $($missing -join ', ')")
            }
        }
        catch {
            $errors.Add("Theme build failed: $($_.Exception.Message)")
        }
        finally {
            if (Test-Path $scratch) { Remove-Item -Path $scratch -Recurse -Force }
        }
    }
}
else {
    if (-not $manifest.Module) {
        $errors.Add("extension.yaml is missing Module.")
    }
    if (-not $manifest.Type) {
        $errors.Add("extension.yaml is missing Type.")
    }
    elseif ($profile.pluginType -and $manifest.Type -ne $profile.pluginType) {
        $errors.Add("Profile pluginType '$($profile.pluginType)' does not match extension.yaml Type '$($manifest.Type)'.")
    }
    else {
        try {
            $expectedDatabaseType = Get-AddonDatabaseType -PluginType $manifest.Type
        }
        catch {
            $errors.Add("extension.yaml Type '$($manifest.Type)' is not GenericPlugin, MetadataPlugin, or LibraryPlugin.")
        }
    }
}

$expectedInstallerUrl = "$($profile.rawBaseUrl)/$($profile.installerManifest)"

if (Test-Path $installerPath) {
    $installerLines = Get-Content -Path $installerPath
    $installerAddonId = Get-YamlScalar -Lines $installerLines -Key "AddonId"
    $installerVersion = Get-YamlFirstPackageScalar -Lines $installerLines -Key "Version"
    $installerRequiredApi = Get-YamlFirstPackageScalar -Lines $installerLines -Key "RequiredApiVersion"
    $packageUrl = Get-YamlFirstPackageScalar -Lines $installerLines -Key "PackageUrl"
    $installerManifestUrl = Get-YamlScalar -Lines $installerLines -Key "InstallerManifestUrl"
    $sourceUrl = Get-YamlScalar -Lines $installerLines -Key "SourceUrl"

    if ($installerAddonId -ne $manifest.Id) {
        $errors.Add("Installer AddonId '$installerAddonId' does not match $manifestName Id '$($manifest.Id)'.")
    }
    if ($installerVersion -ne $manifest.Version) {
        $errors.Add("Installer package Version '$installerVersion' does not match $manifestName Version '$($manifest.Version)'.")
    }
    if ($profile.requiredApiVersion -and $installerRequiredApi -ne $profile.requiredApiVersion) {
        $errors.Add("Installer RequiredApiVersion '$installerRequiredApi' does not match profile requiredApiVersion '$($profile.requiredApiVersion)'.")
    }

    # The installer manifest is minimal (AddonId + Packages); these URLs are checked only if someone adds them back.
    if ($installerManifestUrl -and $installerManifestUrl -ne $expectedInstallerUrl) {
        $errors.Add("InstallerManifestUrl '$installerManifestUrl' does not match expected '$expectedInstallerUrl'.")
    }
    if ($sourceUrl -and $sourceUrl -ne $profile.sourceUrl) {
        $errors.Add("SourceUrl '$sourceUrl' does not match profile sourceUrl '$($profile.sourceUrl)'.")
    }

    if ($Mode -eq "Package") {
        $expectedPackageUrl = Get-ExpectedPackageUrl -Profile $profile -AddonId $manifest.Id -Version $manifest.Version
        if ($packageUrl -ne $expectedPackageUrl) {
            $errors.Add("PackageUrl '$packageUrl' does not match expected '$expectedPackageUrl'.")
        }
    }
}

if (Test-Path $databasePath) {
    $databaseLines = Get-Content -Path $databasePath
    $databaseAddonId = Get-YamlScalar -Lines $databaseLines -Key "AddonId"
    $databaseInstallerManifestUrl = Get-YamlScalar -Lines $databaseLines -Key "InstallerManifestUrl"
    $databaseSourceUrl = Get-YamlScalar -Lines $databaseLines -Key "SourceUrl"
    $databaseIconUrl = Get-YamlScalar -Lines $databaseLines -Key "IconUrl"
    $databaseType = Get-YamlScalar -Lines $databaseLines -Key "Type"

    if ($databaseAddonId -ne $manifest.Id) {
        $errors.Add("Database AddonId '$databaseAddonId' does not match $manifestName Id '$($manifest.Id)'.")
    }
    if ($expectedDatabaseType -and $databaseType -ne $expectedDatabaseType) {
        $errors.Add("Database Type '$databaseType' should be '$expectedDatabaseType'.")
    }
    if ($databaseInstallerManifestUrl -ne $expectedInstallerUrl) {
        $errors.Add("Database InstallerManifestUrl '$databaseInstallerManifestUrl' does not match expected '$expectedInstallerUrl'.")
    }
    $expectedIconUrl = "$($profile.rawBaseUrl)/$($profile.dir)/info/icon.png"
    if ($databaseIconUrl -and $databaseIconUrl -ne $expectedIconUrl) {
        $errors.Add("Database IconUrl '$databaseIconUrl' does not match expected '$expectedIconUrl'.")
    }
    if ($databaseSourceUrl -ne $profile.sourceUrl) {
        $errors.Add("Database SourceUrl '$databaseSourceUrl' does not match profile sourceUrl '$($profile.sourceUrl)'.")
    }

    # Icon and screenshot URLs that point into this repo must resolve once main is pushed; before a
    # database PR (Package mode) every such file has to exist in the working tree.
    if ($Mode -eq "Package") {
        $rawPrefix = [regex]::Escape($profile.rawBaseUrl.TrimEnd("/") + "/")
        $linked = [System.Collections.Generic.HashSet[string]]::new()
        foreach ($line in $databaseLines) {
            foreach ($match in [regex]::Matches($line, "$rawPrefix(\S+)")) {
                $relative = $match.Groups[1].Value
                if ($relative -eq $profile.installerManifest -or -not $linked.Add($relative)) { continue }
                if (-not (Test-Path (Join-RepoPath $relative))) {
                    $errors.Add("Database manifest links $relative, which does not exist. Add the file (screenshots: render them with .\scripts\take-screenshots.ps1) before submitting.")
                }
            }
        }
    }
}
else {
    $errors.Add("Database manifest not found at $databasePath")
}

if (-not $isTheme) {
    $propsPath = Join-RepoPath $profile.directoryBuildProps
    foreach ($property in @("Version", "AssemblyVersion", "FileVersion")) {
        # AssemblyVersion / FileVersion carry a fourth ".0" part.
        $value = Get-XmlProperty -Path $propsPath -PropertyName $property
        if ($value -and ($value -replace "^(\d+\.\d+\.\d+)\.0$", '$1') -ne $manifest.Version) {
            $errors.Add("Directory.Build.props $property '$value' does not match extension.yaml Version '$($manifest.Version)'.")
        }
    }
}

if ($RequireBuildOutput) {
    $required = if ($isTheme) { @("theme.yaml", "Constants.xaml") } else { @($manifest.Module, "extension.yaml") }
    foreach ($file in $required) {
        if (-not (Test-Path (Join-Path $outputPath $file))) {
            $errors.Add("Expected $file in the build output at $outputPath. Build it first (build-plugin.ps1 / build-theme.ps1).")
        }
    }
}

if ($errors.Count -gt 0) {
    Write-Host "Extension validation failed for '$Extension':"
    foreach ($validationError in $errors) {
        Write-Host "  - $validationError"
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
