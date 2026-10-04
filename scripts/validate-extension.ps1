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

# --- AGENTS.md rule checks ---------------------------------------------------------------------------------------
# Static lints for rules that have regressed before. They read parsed XAML (comments are not nodes, so a comment
# that mentions IconPadding or CornerRadiusFull never trips them) and return error strings like Test-ThemeBuild.

$script:XamlNs = "http://schemas.microsoft.com/winfx/2006/xaml"
$script:PillRadiusThreshold = 999   # CornerRadiusFull is 9999 / 10000; anything this large is a pill radius.

function Read-XamlDocument {
    param([string]$Path)
    $doc = New-Object System.Xml.XmlDocument
    try { $doc.Load($Path) } catch { return $null }
    return $doc
}

function ConvertTo-NumberList {
    # "14,12" / "4 0 4 0" / "8" -> doubles; $null when any part is not a plain number (bindings, resources, placeholders).
    param([string]$Value)
    if (-not $Value -or $Value -match "[{}]") { return $null }
    $numbers = [System.Collections.Generic.List[double]]::new()
    foreach ($part in ($Value.Trim() -split "[,\s]+")) {
        if ($part -eq "") { continue }
        $n = 0.0
        if (-not [double]::TryParse($part, [System.Globalization.NumberStyles]::Float, [System.Globalization.CultureInfo]::InvariantCulture, [ref]$n)) {
            return $null
        }
        $numbers.Add($n)
    }
    if ($numbers.Count -eq 0) { return $null }
    return , $numbers.ToArray()
}

function Test-PillRadiusValue {
    param([string]$Value)
    if ($Value -match "CornerRadiusFull") { return $true }
    $numbers = ConvertTo-NumberList $Value
    return ($null -ne $numbers -and @($numbers | Where-Object { $_ -ge $script:PillRadiusThreshold }).Count -gt 0)
}

function Get-StyleSetterValue {
    param([System.Xml.XmlElement]$Style, [string]$Property)
    foreach ($child in $Style.ChildNodes) {
        if ($child -is [System.Xml.XmlElement] -and $child.LocalName -eq "Setter" -and $child.GetAttribute("Property") -eq $Property) {
            return $child.GetAttribute("Value")
        }
    }
    return ""
}

function Test-SquareSize {
    param([string]$Width, [string]$Height)
    $w = ConvertTo-NumberList $Width
    $h = ConvertTo-NumberList $Height
    return ($null -ne $w -and $null -ne $h -and $w.Count -eq 1 -and $h.Count -eq 1 -and $w[0] -gt 0 -and $w[0] -eq $h[0])
}

function Get-XamlTypeName {
    # "{x:Type Button}" / "local:SidebarItem" / "Button" -> "Button".
    param([string]$Value)
    if (-not $Value) { return "" }
    $name = $Value -replace "^\{x:Type\s+", "" -replace "\}$", ""
    return ($name -split ":")[-1].Trim()
}

function Get-SourceDisplayPath {
    # Built theme file -> the source file it came from (rendered *.template.xaml files lose ".template" in the drop).
    param([string]$SourceRoot, [string]$Relative)
    if (-not $SourceRoot) { return $Relative }
    $template = $Relative -replace "\.xaml$", ".template.xaml"
    if (Test-Path (Join-Path (Join-RepoPath $SourceRoot) $template)) { return "$SourceRoot/$template" }
    return "$SourceRoot/$Relative"
}

function Get-ElementLabel {
    param([System.Xml.XmlElement]$Element)
    $name = $Element.GetAttribute("Name", $script:XamlNs)
    if (-not $name) { $name = $Element.GetAttribute("Name") }
    if ($name) { return "<$($Element.LocalName) x:Name=`"$name`">" }
    return "<$($Element.LocalName)>"
}

function Test-SidebarIconPadding {
    <#
        AGENTS.md "Sidebar Icon Sizing": an element bound to {Binding IconPadding} must not sit inside a fixed plate padding
        (e.g. Padding="14,12" on a 44x40 item). The two sum past the item size, the icon Viewbox collapses to 0px and add-on
        sidebar icons vanish. Also catches the plate padding arriving through {TemplateBinding Padding} from a Style setter.
    #>
    param([Parameter(Mandatory = $true)] [string]$Directory, [string]$SourceRoot)

    $errors = [System.Collections.Generic.List[string]]::new()
    foreach ($file in Get-ChildItem -Path $Directory -Recurse -File -Filter "*.xaml") {
        $raw = Get-Content -Raw -Path $file.FullName
        $clean = [regex]::Replace($raw, '<!--.*?-->', '', [System.Text.RegularExpressions.RegexOptions]::Singleline)
        $relative = (Get-RelativePathCompat -Root $Directory -Path $file.FullName) -replace "\\", "/"
        $where = Get-SourceDisplayPath -SourceRoot $SourceRoot -Relative $relative

        # Static regex linter check: Stacked padding in SidebarItem.xaml (Padding="14,12" wrapping IconPadding)
        if ($file.Name -eq "SidebarItem.xaml") {
            if ($clean -match 'Padding\s*=\s*"14\s*,\s*12"[\s\S]*?Padding\s*=\s*"[^"]*IconPadding' -or
                $clean -match 'Padding\s*=\s*"[^"]*IconPadding[\s\S]*?Padding\s*=\s*"14\s*,\s*12"') {
                $errors.Add("${where}: Stacked padding in SidebarItem.xaml (Padding=`"14,12`" wrapping IconPadding). Keep only one (AGENTS.md Sidebar Icon Sizing).") | Out-Null
            }
        }

        # XML structural check: any element bound to IconPadding nested in element with non-zero Padding
        $doc = Read-XamlDocument $file.FullName
        if (-not $doc) { continue }
        foreach ($bound in $doc.SelectNodes("//*[contains(@Padding, 'IconPadding')]")) {
            $parent = $bound.ParentNode
            while ($parent -is [System.Xml.XmlElement] -and $parent.LocalName -notin @("ControlTemplate", "DataTemplate")) {
                $padding = $parent.GetAttribute("Padding")
                if ($padding -match "TemplateBinding\s+Padding") {
                    $style = $parent.SelectSingleNode("ancestor::*[local-name()='Style'][1]")
                    if ($style) { $padding = Get-StyleSetterValue -Style $style -Property "Padding" }
                }
                $numbers = ConvertTo-NumberList $padding
                if ($null -ne $numbers -and @($numbers | Where-Object { $_ -ne 0 }).Count -gt 0) {
                    $errors.Add("${where}: $(Get-ElementLabel $parent) has Padding=`"$padding`" around $(Get-ElementLabel $bound) bound to IconPadding. Stacked paddings collapse the icon to 0px; keep only one (AGENTS.md Sidebar Icon Sizing).") | Out-Null
                    break
                }
                $parent = $parent.ParentNode
            }
        }
    }
    return @($errors | Select-Object -Unique)
}

function Test-PillCornerRadius {
    <#
        AGENTS.md "Control Corner Radii": CornerRadiusFull (or any pill-sized literal radius) clamps X and Y independently,
        so on anything that is not 1:1 it draws an oval. Base controls, action buttons, tag chips and thin tracks must use
        ControlCornerRadius / CornerRadiusSmall / half the track thickness. Allowed when the element, its Style setters or
        the control that owns the template declare Width == Height.
    #>
    param([Parameter(Mandatory = $true)] [string]$Directory, [string]$SourceRoot)

    $restrictedTypes = @(
        "Button", "RepeatButton", "ToggleButton", "Slider", "ProgressBar", "ScrollBar", "Thumb",
        "TabControl", "TabItem", "MenuItem", "SearchBox", "PlayButton", "PropertyItemButton"
    )
    $restrictedKeyPattern = "PlayButton|PropertyItemButton|SearchBox|Slider|ProgressBar|ScrollBar"
    $errors = [System.Collections.Generic.List[string]]::new()

    foreach ($file in Get-ChildItem -Path $Directory -Recurse -File -Filter "*.xaml") {
        $raw = Get-Content -Raw -Path $file.FullName
        $clean = [regex]::Replace($raw, '<!--.*?-->', '', [System.Text.RegularExpressions.RegexOptions]::Singleline)
        $relative = (Get-RelativePathCompat -Root $Directory -Path $file.FullName) -replace "\\", "/"
        $where = Get-SourceDisplayPath -SourceRoot $SourceRoot -Relative $relative

        # Static regex linter check: Slider and ProgressBar are thin tracks/fills; they must NEVER use CornerRadiusFull.
        if ($file.Name -in @("Slider.xaml", "ProgressBar.xaml")) {
            if ($clean -match 'CornerRadius\s*=\s*"[^"]*CornerRadiusFull' -or $clean -match 'Property\s*=\s*"CornerRadius"\s+Value\s*=\s*"[^"]*CornerRadiusFull') {
                $errors.Add("${where}: $($file.Name) uses CornerRadiusFull on a thin track/fill. Use an explicit numeric radius equal to half the track thickness (AGENTS.md Control Corner Radii).") | Out-Null
            }
        }

        # Static regex linter check: Base button style in DefaultControls/Button.xaml must not use CornerRadiusFull.
        if ($file.Name -eq "Button.xaml" -and $relative -match "DefaultControls") {
            if ($clean -match 'Property\s*=\s*"CornerRadius"\s+Value\s*=\s*"[^"]*CornerRadiusFull') {
                $errors.Add("${where}: Base Button.xaml style uses CornerRadiusFull. Base controls must use ControlCornerRadius (AGENTS.md Control Corner Radii).") | Out-Null
            }
        }

        # ControlCornerRadius feeds every base control style, so it can never be a pill radius.
        $doc = Read-XamlDocument $file.FullName
        if (-not $doc) { continue }

        foreach ($definition in $doc.SelectNodes("//*[local-name()='CornerRadius']")) {
            if ($definition.GetAttribute("Key", $script:XamlNs) -ne "ControlCornerRadius") { continue }
            if (Test-PillRadiusValue $definition.InnerText) {
                $errors.Add("${where}: ControlCornerRadius is a pill radius ($($definition.InnerText.Trim())); base controls need a real radius (AGENTS.md Control Corner Radii).") | Out-Null
            }
        }

        foreach ($element in @($doc.SelectNodes("//*[@CornerRadius] | //*[local-name()='Setter'][@Property='CornerRadius']"))) {
            $value = if ($element.LocalName -eq "Setter") { $element.GetAttribute("Value") } else { $element.GetAttribute("CornerRadius") }
            if (-not (Test-PillRadiusValue $value)) { continue }

            # 1:1 on the element itself is the allowed case (badges, round icon buttons).
            if (Test-SquareSize $element.GetAttribute("Width") $element.GetAttribute("Height")) { continue }

            # Walk out to the nearest control definition: a Style, or the element that owns a *.Style / *.Template.
            $types = [System.Collections.Generic.List[string]]::new()
            $keys = [System.Collections.Generic.List[string]]::new()
            $square = $false
            $node = $element.ParentNode
            while ($node -is [System.Xml.XmlElement]) {
                if ($node.LocalName -eq "ControlTemplate") {
                    $types.Add((Get-XamlTypeName $node.GetAttribute("TargetType"))) | Out-Null
                    $keys.Add($node.GetAttribute("Key", $script:XamlNs)) | Out-Null
                }
                elseif ($node.LocalName -eq "Style") {
                    $types.Add((Get-XamlTypeName $node.GetAttribute("TargetType"))) | Out-Null
                    $keys.Add($node.GetAttribute("Key", $script:XamlNs)) | Out-Null
                    $keys.Add(($node.GetAttribute("BasedOn") -replace "^\{\w+Resource\s+", "" -replace "\}$", "")) | Out-Null
                    if (Test-SquareSize (Get-StyleSetterValue $node "Width") (Get-StyleSetterValue $node "Height")) { $square = $true }
                    $owner = $node.ParentNode
                    if ($owner -is [System.Xml.XmlElement] -and $owner.LocalName -like "*.Style" -and $owner.ParentNode -is [System.Xml.XmlElement]) {
                        $control = $owner.ParentNode
                        $types.Add($control.LocalName) | Out-Null
                        if (Test-SquareSize $control.GetAttribute("Width") $control.GetAttribute("Height")) { $square = $true }
                    }
                    break
                }
                elseif ($node.LocalName -like "*.Template" -and $node.ParentNode -is [System.Xml.XmlElement]) {
                    $control = $node.ParentNode
                    $types.Add($control.LocalName) | Out-Null
                    if (Test-SquareSize $control.GetAttribute("Width") $control.GetAttribute("Height")) { $square = $true }
                    break
                }
                $node = $node.ParentNode
            }
            if ($square) { continue }

            $hitType = @($types | Where-Object { $_ -and $restrictedTypes -contains $_ }) | Select-Object -First 1
            $hitKey = @($keys | Where-Object { $_ -and $_ -match $restrictedKeyPattern }) | Select-Object -First 1
            if (-not $hitType -and -not $hitKey) { continue }

            $context = if ($hitType) { $hitType } else { $hitKey }
            $errors.Add("${where}: $(Get-ElementLabel $element) in a $context template uses pill radius '$value' without Width == Height. Use ControlCornerRadius, CornerRadiusSmall or half the track thickness (AGENTS.md Control Corner Radii).") | Out-Null
        }
    }
    return @($errors | Select-Object -Unique)
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
            $themeSourceRoot = "$($profile.dir)/src"
            foreach ($ruleError in @(Test-SidebarIconPadding -Directory $scratch -SourceRoot $themeSourceRoot) + @(Test-PillCornerRadius -Directory $scratch -SourceRoot $themeSourceRoot)) {
                $errors.Add($ruleError)
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

# Preview drift: colors the HTML previews hard-code that are not in src/tokens.css, and layout that departs from the
# theme's own top panel, details view and Playnite's settings window. Advisory only; the screenshots are rendered from
# these files, so a stale color or layout here ships as a stale screenshot.
if ($isTheme -and (Get-Command node -ErrorAction SilentlyContinue)) {
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
    Write-Host "  Preview colors and layout (advisory; see playnite-theme-dev previews.md):"
    foreach ($note in $previewNotes) { Write-Host "    $note" }
}
