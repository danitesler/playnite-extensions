[CmdletBinding()]
param(
    [Parameter(Mandatory = $true)]
    [string]$Extension,
    [ValidateSet("Ci", "Package")]
    [string]$Mode = "Ci",
    [string]$Configuration = "Release",
    [switch]$RequireBuildOutput,
    [switch]$SkipPreviewChecks
)

$ErrorActionPreference = "Stop"
. (Join-Path $PSScriptRoot "lib/extension-profiles.ps1")
. (Join-Path $PSScriptRoot "lib/theme-tools.ps1")
. (Join-Path $PSScriptRoot "lib/theme-lints.ps1")

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

function Get-LocalizationKeys {
    # Static regex extraction of x:Key values from Localization/*.xaml
    param([string]$Path)
    if (-not (Test-Path $Path)) { return $null }
    $raw = Get-Content -Raw -Path $Path
    $clean = [regex]::Replace($raw, '<!--.*?-->', '', [System.Text.RegularExpressions.RegexOptions]::Singleline)
    $keys = [System.Collections.Generic.List[string]]::new()
    foreach ($match in [regex]::Matches($clean, 'x:Key\s*=\s*["'']([^"'']+)["'']')) {
        $keys.Add($match.Groups[1].Value) | Out-Null
    }
    return , $keys
}

function Format-KeyList {
    param([string[]]$Keys, [int]$Max = 8)
    $shown = @($Keys | Select-Object -First $Max) -join ", "
    if ($Keys.Count -gt $Max) { $shown += " (+$($Keys.Count - $Max) more)" }
    return $shown
}

function Test-LocalizationParity {
    # AGENTS.md "Localization": every Localization/*.xaml carries exactly the keys of en_US.xaml, once each.
    param([Parameter(Mandatory = $true)] [string]$ExtensionRoot, [string]$DisplayRoot)

    $errors = [System.Collections.Generic.List[string]]::new()
    $locDir = Join-Path $ExtensionRoot "Localization"
    if (-not (Test-Path $locDir)) { return @() }

    $basePath = Join-Path $locDir "en_US.xaml"
    if (-not (Test-Path $basePath)) {
        $errors.Add("$DisplayRoot/Localization has no en_US.xaml to compare the other locales against.") | Out-Null
        return @($errors)
    }

    $baseSet = $null
    foreach ($file in @(Get-Item $basePath) + @(Get-ChildItem -Path $locDir -File -Filter "*.xaml" | Where-Object { $_.Name -ne "en_US.xaml" } | Sort-Object Name)) {
        $label = "$DisplayRoot/Localization/$($file.Name)"
        $keys = Get-LocalizationKeys $file.FullName
        if ($null -eq $keys) {
            $errors.Add("$label could not be read.") | Out-Null
            if ($null -eq $baseSet) { break }
            continue
        }
        $duplicates = @($keys | Group-Object -CaseSensitive | Where-Object { $_.Count -gt 1 } | ForEach-Object { $_.Name })
        if ($duplicates.Count -gt 0) { $errors.Add("$label defines duplicate keys: $(Format-KeyList $duplicates)") | Out-Null }

        $set = [System.Collections.Generic.HashSet[string]]::new([string[]]$keys.ToArray(), [System.StringComparer]::Ordinal)
        if ($null -eq $baseSet) { $baseSet = $set; continue }

        $missing = @($baseSet | Where-Object { -not $set.Contains($_) })
        $extra = @($set | Where-Object { -not $baseSet.Contains($_) })
        if ($missing.Count -gt 0) { $errors.Add("$label is missing $($missing.Count) key(s) from en_US.xaml: $(Format-KeyList $missing)") | Out-Null }
        if ($extra.Count -gt 0) { $errors.Add("$label has $($extra.Count) key(s) not in en_US.xaml: $(Format-KeyList $extra)") | Out-Null }
    }
    return @($errors)
}

$profile = Get-ExtensionProfile -Extension $Extension
$isTheme = (Get-ExtensionKind $profile) -eq "theme"
$manifest = Get-ExtensionManifestInfo -Profile $profile
$manifestName = Split-Path -Leaf $manifest.Path
$errors = [System.Collections.Generic.List[string]]::new()
$previewNotes = [System.Collections.Generic.List[string]]::new()

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

        # Standalone validation builds in scratch. The verification gate supplies a fresh build drop.
        $tempRoot = [System.IO.Path]::GetTempPath()
        $scratch = if (-not $RequireBuildOutput) {
            Join-Path $tempRoot ("playnite-theme-validate-" + [guid]::NewGuid().ToString("N"))
        }
        $themeDrop = if ($RequireBuildOutput) { $outputPath } else { $scratch }
        try {
            if ($scratch) { Invoke-ThemeBuild -Profile $profile -OutDir $scratch | Out-Null }
            Invoke-WithPinnedThemeDirectory -Directory $themeDrop -ScriptBlock {
                foreach ($themeError in @(Test-ThemeBuild -Directory $themeDrop -Mode $manifest.Mode)) {
                    $errors.Add($themeError)
                }
                $missing = @(Get-ThemeMissingRequiredKeys -Directory $themeDrop)
                if ($missing.Count -gt 0) {
                    $errors.Add("Required shared keys missing (scripts/data/theme-keys.json): $($missing -join ', ')")
                }
                $themeSourceRoot = "$($profile.dir)/src"
                foreach ($ruleError in @(Test-SidebarIconPadding -Directory $themeDrop -SourceRoot $themeSourceRoot) + @(Test-PillCornerRadius -Directory $themeDrop -SourceRoot $themeSourceRoot) + @(Test-ThemeModifierIconButtons -Directory $themeDrop -SourceRoot $themeSourceRoot) + @(Test-GroupBoxContentSized -Directory $themeDrop -SourceRoot $themeSourceRoot) + @(Test-ComboBoxChevronRoom -Directory $themeDrop -SourceRoot $themeSourceRoot) + @(Test-GameActionButtons -Directory $themeDrop -SourceRoot $themeSourceRoot) + @(Test-ThemeAnimations -Directory $themeDrop -SourceRoot $themeSourceRoot) + @(Test-PathDataSyntax -Directory $themeDrop -SourceRoot $themeSourceRoot) + @(Test-PlayniteListBoxTriggers -Directory $themeDrop -SourceRoot $themeSourceRoot) + @(Test-WpfRuntimeTraps -Directory $themeDrop -SourceRoot $themeSourceRoot) + @(Test-FormControlHeight -Directory $themeDrop -SourceRoot $themeSourceRoot) + @(Test-TabItemColors -Directory $themeDrop -SourceRoot $themeSourceRoot) + @(Test-SettingsChrome -Directory $themeDrop -SourceRoot $themeSourceRoot) + @(Test-FilterActiveIndicator -Directory $themeDrop -SourceRoot $themeSourceRoot) + @(Test-RunningIndicator -Directory $themeDrop -SourceRoot $themeSourceRoot) + @(Test-WindowBackground -Directory $themeDrop -SourceRoot $themeSourceRoot) + @(Test-TileButtonHitArea -Directory $themeDrop -SourceRoot $themeSourceRoot) + @(Test-SidePanelCloseButton -Directory $themeDrop -SourceRoot $themeSourceRoot) + @(Test-ThemeMenus -Directory $themeDrop -SourceRoot $themeSourceRoot -Key $profile.key) + @(Test-ThemeSignatureUniqueness -Directory $themeDrop -SourceRoot $themeSourceRoot)) {
                    $errors.Add($ruleError)
                }
                foreach ($ruleError in @(Test-SettingsChrome -Directory $themeDrop -SourceRoot $themeSourceRoot -Advisory) + @(Test-ThemeMenus -Directory $themeDrop -SourceRoot $themeSourceRoot -Key $profile.key -Advisory)) {
                    $previewNotes.Add($ruleError)
                }
            }
        }
        catch {
            $errors.Add("Theme build failed: $($_.Exception.Message)")
        }
        finally {
            if ($scratch -and (Test-Path -LiteralPath $scratch)) {
                $cleanup = Get-Item -LiteralPath $scratch
                if ($cleanup.Parent.FullName -eq (Get-Item -LiteralPath $tempRoot).FullName -and
                    -not ($cleanup.Attributes -band [IO.FileAttributes]::ReparsePoint)) {
                    Remove-Item -LiteralPath $cleanup.FullName -Recurse -Force
                }
            }
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

foreach ($localizationError in @(Test-LocalizationParity -ExtensionRoot (Join-RepoPath $profile.dir) -DisplayRoot $profile.dir)) {
    $errors.Add($localizationError)
}

$expectedInstallerUrl = "$($profile.rawBaseUrl)/$($profile.installerManifest)"

if (Test-Path $installerPath) {
    $installerLines = Get-Content -Path $installerPath
    $installerAddonId = Get-YamlScalar -Lines $installerLines -Key "AddonId"
    $installerVersion = Get-YamlFirstPackageScalar -Lines $installerLines -Key "Version"
    $installerRequiredApi = Get-YamlFirstPackageScalar -Lines $installerLines -Key "RequiredApiVersion"
    $packageUrl = Get-YamlFirstPackageScalar -Lines $installerLines -Key "PackageUrl"

    if ($installerAddonId -ne $manifest.Id) {
        $errors.Add("Installer AddonId '$installerAddonId' does not match $manifestName Id '$($manifest.Id)'.")
    }
    if ($installerVersion -ne $manifest.Version) {
        $errors.Add("Installer package Version '$installerVersion' does not match $manifestName Version '$($manifest.Version)'.")
    }
    if ($profile.requiredApiVersion -and $installerRequiredApi -ne $profile.requiredApiVersion) {
        $errors.Add("Installer RequiredApiVersion '$installerRequiredApi' does not match profile requiredApiVersion '$($profile.requiredApiVersion)'.")
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
    if ($isTheme) {
        $shortLine = @($databaseLines | Where-Object { $_ -match "^ShortDescription:" }) | Select-Object -First 1
        if ($shortLine) {
            $shortValue = $shortLine -replace "^ShortDescription:\s*", ""
            if ($shortValue -notmatch "^['""]" -and $shortValue -match ":\s") {
                $errors.Add("Database ShortDescription contains ': ' but is not quoted; Toolbox rejects the manifest. Quote it (single quotes).")
            }
        }
        if (@($databaseLines | Where-Object { $_ -match "^Screenshots:" }).Count -eq 0) {
            $errors.Add("Database manifest has no Screenshots: block. Themes always list screenshot-details.png and screenshot-settings.png (render them with take-screenshots.ps1).")
        }
    }
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

# Preview drift: colors the HTML previews hard-code that are not in src/tokens.css, and layout that departs from the
# theme's own top panel, details view and Playnite's settings window. Advisory only; the screenshots are rendered from
# these files, so a stale color or layout here ships as a stale screenshot.
if ($isTheme -and -not $SkipPreviewChecks -and (Get-Command node -ErrorAction SilentlyContinue)) {
    $themeRoot = Join-RepoPath $profile.dir
    if (Test-Path (Join-Path $themeRoot "art/preview-details.html")) {
        try {
            foreach ($line in @(& node (Join-Path $PSScriptRoot "preview-tokens.mjs") check $themeRoot 2>&1)) {
                $previewNotes.Add("$line")
            }
            # Layout: top bar order from src/Views/TopPanel.xaml, icon-only view switches, game list, settings window.
            foreach ($line in @(& node (Join-Path $PSScriptRoot "preview-layout.mjs") $themeRoot 2>&1)) {
                $previewNotes.Add("$line")
            }
        }
        catch { $previewNotes.Add("preview token check could not run: $($_.Exception.Message)") }
    }
}

# Fonts: Playnite must draw the faces the previews draw. A stack led by a font Windows lacks falls back at runtime
# while the preview shows its stand-in, so such faces are bundled in src/Typography (theme-fonts.mjs).
if ($isTheme -and (Get-Command node -ErrorAction SilentlyContinue)) {
    foreach ($line in @(& node (Join-Path $PSScriptRoot "theme-fonts.mjs") (Join-RepoPath $profile.dir) 2>&1)) {
        $errors.Add("Fonts: $("$line" -replace '^error: ', '')") | Out-Null
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
if ($previewNotes.Count -gt 0) {
    Write-Host "  Preview colors and layout (advisory; see docs/themes/previews.md):"
    foreach ($note in $previewNotes) { Write-Host "    $note" }
}
