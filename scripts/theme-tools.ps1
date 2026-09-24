# Shared helpers for Playnite theme add-ons (kind = "theme" in src/extensions.json).
# Dot-source after extension-profiles.ps1.

$script:ThemeApiDataPath = Join-Path $PSScriptRoot "data/playnite-theme-api.json"
$script:Invariant = [System.Globalization.CultureInfo]::InvariantCulture

function Get-RelativePathCompat {
    # [IO.Path]::GetRelativePath is .NET Core only; these scripts also run under Windows PowerShell 5.1.
    param([Parameter(Mandatory = $true)] [string]$Root, [Parameter(Mandatory = $true)] [string]$Path)

    $rootFull = [System.IO.Path]::GetFullPath($Root).TrimEnd('\', '/') + [System.IO.Path]::DirectorySeparatorChar
    $full = [System.IO.Path]::GetFullPath($Path)
    if (-not $full.StartsWith($rootFull, [System.StringComparison]::OrdinalIgnoreCase)) {
        throw "$Path is not under $Root"
    }

    return $full.Substring($rootFull.Length)
}

function Get-ExtensionKind {
    param([Parameter(Mandatory = $true)] $Profile)

    if ($Profile.PSObject.Properties.Name -contains "kind" -and $Profile.kind) {
        return $Profile.kind
    }

    return "plugin"
}

function Get-PlayniteThemeApiData {
    param([ValidateSet("Desktop", "Fullscreen")] [string]$Mode = "Desktop")

    if (-not (Test-Path $script:ThemeApiDataPath)) {
        throw "Playnite theme API data not found at $script:ThemeApiDataPath. Run scripts/update-playnite-theme-api.ps1."
    }

    $data = Get-Content -Raw -Path $script:ThemeApiDataPath | ConvertFrom-Json
    $modeData = $data.modes.$Mode
    if (-not $modeData) {
        throw "No '$Mode' theme data in $script:ThemeApiDataPath. Run scripts/update-playnite-theme-api.ps1 -Mode $Mode."
    }

    return [pscustomobject]@{
        PlayniteVersion = $data.playniteVersion
        ApiVersion      = $modeData.apiVersion
        Files           = @($modeData.files)
        Keys            = @($modeData.keys) + @($data.globalKeys)
    }
}

# ---------------------------------------------------------------------------------------------------------------
# Palette (shadcn CSS variables)
# ---------------------------------------------------------------------------------------------------------------

function Read-ThemePalette {
    <#
        Reads CSS custom properties from a shadcn-style stylesheet. Variables in :root are the base, variables in
        .dark override them (themes here are dark-only). Returns an ordered name -> raw value map without "--".
    #>
    param([Parameter(Mandatory = $true)] [string]$Path)

    if (-not (Test-Path $Path)) {
        throw "Palette not found at $Path"
    }

    $css = Get-Content -Raw -Path $Path
    $css = [regex]::Replace($css, "/\*.*?\*/", "", [System.Text.RegularExpressions.RegexOptions]::Singleline)

    $base = [ordered]@{}
    $dark = [ordered]@{}
    foreach ($block in [regex]::Matches($css, "([^{}]+)\{([^{}]*)\}")) {
        $selector = $block.Groups[1].Value.Trim()
        $target = $null
        if ($selector -match "(^|[\s,])\.dark\b") { $target = $dark }
        elseif ($selector -match ":root") { $target = $base }
        if ($null -eq $target) { continue }

        foreach ($decl in [regex]::Matches($block.Groups[2].Value, "--([A-Za-z0-9-]+)\s*:\s*([^;]+);?")) {
            $target[$decl.Groups[1].Value] = $decl.Groups[2].Value.Trim()
        }
    }

    foreach ($name in $dark.Keys) {
        $base[$name] = $dark[$name]
    }

    if ($base.Count -eq 0) {
        throw "No CSS variables found in $Path (expected :root and/or .dark blocks)."
    }

    return $base
}

function New-Rgba {
    param([double]$R, [double]$G, [double]$B, [double]$A = 1.0)

    # Doubles on purpose: [Math]::Max(0, 0.1) binds the Int32 overload in PowerShell and returns 0.
    $clamp = { param([double]$v, [double]$max) [Math]::Min($max, [Math]::Max([double]0, $v)) }
    return [pscustomobject]@{
        R = [int][Math]::Round((& $clamp $R 255))
        G = [int][Math]::Round((& $clamp $G 255))
        B = [int][Math]::Round((& $clamp $B 255))
        A = [double](& $clamp $A 1)
    }
}

function ConvertTo-CssNumber {
    param([string]$Text, [double]$PercentScale = 1.0)

    $t = $Text.Trim()
    if ($t -eq "none") { return 0.0 }
    if ($t.EndsWith("%")) {
        return [double]::Parse($t.TrimEnd("%"), $script:Invariant) / 100.0 * $PercentScale
    }
    if ($t -match "^(-?[\d.]+)deg$") {
        return [double]::Parse($Matches[1], $script:Invariant)
    }
    return [double]::Parse($t, $script:Invariant)
}

function Split-CssColorArgs {
    # "0.14 0.005 285 / 10%" or "240, 10%, 3.9%, 0.5" -> channel strings + optional alpha string
    param([string]$Inner)

    $alpha = $null
    $parts = $Inner
    if ($Inner -match "^(.*)/(.*)$") {
        $parts = $Matches[1]
        $alpha = $Matches[2].Trim()
    }

    $channels = @($parts -split "[,\s]+" | Where-Object { $_ -ne "" })
    if (-not $alpha -and $channels.Count -eq 4) {
        $alpha = $channels[3]
        $channels = $channels[0..2]
    }

    return [pscustomobject]@{ Channels = $channels; Alpha = $alpha }
}

function ConvertFrom-Oklch {
    param([double]$L, [double]$C, [double]$H, [double]$A = 1.0)

    # OKLCH -> OKLab -> linear sRGB -> sRGB (Björn Ottosson). Out-of-gamut channels are clamped.
    # PowerShell variables are case-insensitive: keep locals clear of the L/C/H/A parameters.
    $hueRad = $H * [Math]::PI / 180.0
    $labA = $C * [Math]::Cos($hueRad)
    $labB = $C * [Math]::Sin($hueRad)

    $l1 = $L + 0.3963377774 * $labA + 0.2158037573 * $labB
    $m1 = $L - 0.1055613458 * $labA - 0.0638541728 * $labB
    $s1 = $L - 0.0894841775 * $labA - 1.2914855480 * $labB
    $l3 = $l1 * $l1 * $l1
    $m3 = $m1 * $m1 * $m1
    $s3 = $s1 * $s1 * $s1

    $linear = @(
        (4.0767416621 * $l3 - 3.3077115913 * $m3 + 0.2309699292 * $s3),
        (-1.2684380046 * $l3 + 2.6097574011 * $m3 - 0.3413193965 * $s3),
        (-0.0041960863 * $l3 - 0.7034186147 * $m3 + 1.7076147010 * $s3)
    )

    $srgb = foreach ($x in $linear) {
        $x = [Math]::Min(1.0, [Math]::Max(0.0, $x))
        if ($x -le 0.0031308) { 12.92 * $x } else { 1.055 * [Math]::Pow($x, 1.0 / 2.4) - 0.055 }
    }

    return New-Rgba ($srgb[0] * 255) ($srgb[1] * 255) ($srgb[2] * 255) $A
}

function ConvertFrom-Hsl {
    param([double]$H, [double]$S, [double]$L, [double]$A = 1.0)

    $hn = (($H % 360) + 360) % 360 / 360.0
    if ($S -eq 0) {
        return New-Rgba ($L * 255) ($L * 255) ($L * 255) $A
    }

    $q = if ($L -lt 0.5) { $L * (1 + $S) } else { $L + $S - $L * $S }
    $p = 2 * $L - $q
    $hue = {
        param($t)
        if ($t -lt 0) { $t += 1 }
        if ($t -gt 1) { $t -= 1 }
        if ($t -lt 1 / 6) { return $p + ($q - $p) * 6 * $t }
        if ($t -lt 1 / 2) { return $q }
        if ($t -lt 2 / 3) { return $p + ($q - $p) * (2 / 3 - $t) * 6 }
        return $p
    }

    return New-Rgba ((& $hue ($hn + 1 / 3)) * 255) ((& $hue $hn) * 255) ((& $hue ($hn - 1 / 3)) * 255) $A
}

function ConvertFrom-CssColor {
    <#
        Parses the color formats shadcn palettes use: #hex, oklch(), hsl(), rgb(), bare shadcn v3 "H S% L%",
        transparent, and var(--name) references into $Palette.
    #>
    param(
        [Parameter(Mandatory = $true)] [string]$Value,
        $Palette = $null,
        [int]$Depth = 0
    )

    $v = $Value.Trim()
    if ($Depth -gt 8) { throw "Color reference loop at '$Value'" }

    if ($v -match "^var\(\s*--([A-Za-z0-9-]+)\s*(?:,\s*(.+))?\)$") {
        $ref = $Matches[1]
        if ($Palette -and $Palette.Contains($ref)) {
            return ConvertFrom-CssColor -Value $Palette[$ref] -Palette $Palette -Depth ($Depth + 1)
        }
        if ($Matches[2]) {
            return ConvertFrom-CssColor -Value $Matches[2] -Palette $Palette -Depth ($Depth + 1)
        }
        throw "Unresolved var(--$ref)"
    }

    if ($v -eq "transparent") { return New-Rgba 0 0 0 0 }

    if ($v -match "^#([0-9a-fA-F]{3,8})$") {
        $hex = $Matches[1]
        if ($hex.Length -in 3, 4) { $hex = -join ($hex.ToCharArray() | ForEach-Object { "$_$_" }) }
        if ($hex.Length -notin 6, 8) { throw "Invalid hex color '$Value'" }
        $alpha = if ($hex.Length -eq 8) { [Convert]::ToInt32($hex.Substring(6, 2), 16) / 255.0 } else { 1.0 }
        return New-Rgba ([Convert]::ToInt32($hex.Substring(0, 2), 16)) ([Convert]::ToInt32($hex.Substring(2, 2), 16)) ([Convert]::ToInt32($hex.Substring(4, 2), 16)) $alpha
    }

    if ($v -match "^(oklch|hsla?|rgba?)\((.*)\)$") {
        $fn = $Matches[1].ToLowerInvariant()
        $parsed = Split-CssColorArgs $Matches[2]
        if ($parsed.Channels.Count -ne 3) { throw "Expected 3 channels in '$Value'" }
        $alpha = if ($parsed.Alpha) { ConvertTo-CssNumber $parsed.Alpha } else { 1.0 }
        $c = $parsed.Channels
        switch -Regex ($fn) {
            "^oklch$" { return ConvertFrom-Oklch (ConvertTo-CssNumber $c[0]) (ConvertTo-CssNumber $c[1] 0.4) (ConvertTo-CssNumber $c[2]) $alpha }
            "^hsla?$" { return ConvertFrom-Hsl (ConvertTo-CssNumber $c[0]) (ConvertTo-CssNumber $c[1]) (ConvertTo-CssNumber $c[2]) $alpha }
            "^rgba?$" { return New-Rgba (ConvertTo-CssNumber $c[0] 255) (ConvertTo-CssNumber $c[1] 255) (ConvertTo-CssNumber $c[2] 255) $alpha }
        }
    }

    # shadcn v3 stored bare HSL channels: --background: 240 10% 3.9%;
    if ($v -match "^-?[\d.]+(deg)?\s+[\d.]+%\s+[\d.]+%(\s*/\s*[\d.]+%?)?$") {
        $parsed = Split-CssColorArgs $v
        $alpha = if ($parsed.Alpha) { ConvertTo-CssNumber $parsed.Alpha } else { 1.0 }
        return ConvertFrom-Hsl (ConvertTo-CssNumber $parsed.Channels[0]) (ConvertTo-CssNumber $parsed.Channels[1]) (ConvertTo-CssNumber $parsed.Channels[2]) $alpha
    }

    throw "Unsupported color '$Value'"
}

function Merge-RgbaOver {
    param([Parameter(Mandatory = $true)] $Top, [Parameter(Mandatory = $true)] $Bottom)

    $a = $Top.A
    return New-Rgba ($Top.R * $a + $Bottom.R * (1 - $a)) ($Top.G * $a + $Bottom.G * (1 - $a)) ($Top.B * $a + $Bottom.B * (1 - $a)) 1.0
}

function Format-XamlColor {
    param([Parameter(Mandatory = $true)] $Rgba)

    $alpha = [int][Math]::Round($Rgba.A * 255)
    return "#{0:X2}{1:X2}{2:X2}{3:X2}" -f $alpha, $Rgba.R, $Rgba.G, $Rgba.B
}

function ConvertTo-Px {
    param([Parameter(Mandatory = $true)] [string]$Value)

    $v = $Value.Trim()
    if ($v -match "^([\d.]+)rem$") { return [double]::Parse($Matches[1], $script:Invariant) * 16 }
    if ($v -match "^([\d.]+)px$") { return [double]::Parse($Matches[1], $script:Invariant) }
    if ($v -match "^([\d.]+)$") { return [double]::Parse($Matches[1], $script:Invariant) }
    throw "Unsupported length '$Value' (use rem or px)"
}

# ---------------------------------------------------------------------------------------------------------------
# Template rendering
# ---------------------------------------------------------------------------------------------------------------

function Expand-ThemeTemplate {
    <#
        Fills double-brace placeholders in a kit template from a palette map (Read-ThemePalette).
        See src/ThemeKits/<Kit>/AGENTS.md for the syntax. Throws with every unresolved placeholder listed.
    #>
    param(
        [Parameter(Mandatory = $true)] [string]$Template,
        [Parameter(Mandatory = $true)] $Palette
    )

    if (-not $Palette.Contains("background")) {
        throw "Palette must define --background (alpha colors are flattened over it)."
    }
    $background = ConvertFrom-CssColor -Value $Palette["background"] -Palette $Palette
    if ($background.A -lt 1) {
        throw "--background must be opaque."
    }

    $radius = 10.0
    if ($Palette.Contains("radius")) {
        $radius = ConvertTo-Px $Palette["radius"]
    }
    else {
        Write-Warning "Palette has no --radius; using shadcn's default 0.625rem."
    }
    $radiusScale = @{ sm = $radius - 4; md = $radius - 2; lg = $radius; xl = $radius + 4 }

    $errors = [System.Collections.Generic.List[string]]::new()
    $result = [regex]::Replace($Template, "\{\{\s*(.+?)\s*\}\}", {
            param($match)
            $expr = $match.Groups[1].Value

            if ($expr -match "^radius:(sm|md|lg|xl)$") {
                return ([Math]::Max([double]0, $radiusScale[$Matches[1]])).ToString($script:Invariant)
            }

            if ($expr -match "^text:([A-Za-z0-9-]+)(?:\|(.*))?$") {
                $name = $Matches[1]
                if ($Palette.Contains($name)) { return [System.Security.SecurityElement]::Escape($Palette[$name].Trim('"', "'", ' ')) }
                if ($null -ne $Matches[2]) { return [System.Security.SecurityElement]::Escape($Matches[2]) }
                $errors.Add("missing --$name for '$($match.Value)'") | Out-Null
                return $match.Value
            }

            if ($expr -notmatch "^(?<names>[A-Za-z0-9?-]+)(?:@(?<over>[A-Za-z0-9-]+))?(?:\|(?<fallback>[^/]+))?(?:/(?<alpha>\d{1,3}))?$") {
                $errors.Add("unrecognized placeholder '$($match.Value)'") | Out-Null
                return $match.Value
            }
            $names = $Matches["names"] -split "\?"
            $over = $Matches["over"]
            $fallback = $Matches["fallback"]
            $alphaPercent = $Matches["alpha"]

            $color = $null
            try {
                foreach ($name in $names) {
                    if ($Palette.Contains($name)) {
                        $color = ConvertFrom-CssColor -Value $Palette[$name] -Palette $Palette
                        break
                    }
                }
                if (-not $color -and $fallback) {
                    $color = ConvertFrom-CssColor -Value $fallback
                }
            }
            catch {
                $errors.Add("'$($match.Value)': $($_.Exception.Message)") | Out-Null
                return $match.Value
            }

            if (-not $color) {
                $errors.Add("missing " + (($names | ForEach-Object { "--$_" }) -join " / ") + " for '$($match.Value)'") | Out-Null
                return $match.Value
            }

            if ($color.A -lt 1 -and $color.A -gt 0) {
                # Flatten over the surface the color sits on: @name when given, else --background.
                $surface = $background
                if ($over -and $Palette.Contains($over)) {
                    $surface = ConvertFrom-CssColor -Value $Palette[$over] -Palette $Palette
                    if ($surface.A -lt 1) { $surface = Merge-RgbaOver -Top $surface -Bottom $background }
                }
                $color = Merge-RgbaOver -Top $color -Bottom $surface
            }
            if ($alphaPercent) {
                $color = New-Rgba $color.R $color.G $color.B ([int]$alphaPercent / 100.0)
            }

            return Format-XamlColor $color
        })

    if ($errors.Count -gt 0) {
        throw ("Template rendering failed:`n  - " + ($errors -join "`n  - "))
    }

    return $result
}

# ---------------------------------------------------------------------------------------------------------------
# Compose + validate
# ---------------------------------------------------------------------------------------------------------------

function Get-ThemeManifestInfo {
    param([Parameter(Mandatory = $true)] $Profile)

    $manifestPath = Join-RepoPath $Profile.extensionManifest
    if (-not (Test-Path $manifestPath)) {
        throw "theme.yaml not found at $manifestPath"
    }

    $lines = Get-Content -Path $manifestPath
    return [pscustomobject]@{
        Path            = $manifestPath
        Id              = Get-YamlScalar -Lines $lines -Key "Id"
        Name            = Get-YamlScalar -Lines $lines -Key "Name"
        Author          = Get-YamlScalar -Lines $lines -Key "Author"
        Version         = Get-YamlScalar -Lines $lines -Key "Version"
        Mode            = Get-YamlScalar -Lines $lines -Key "Mode"
        ThemeApiVersion = Get-YamlScalar -Lines $lines -Key "ThemeApiVersion"
    }
}

function Get-ThemeKitChain {
    <#
        Resolves a kit and the kits it extends (kit.json "extends": "src/ThemeKits/<Base>"), base first.
        A derived kit only holds the files that differ from its base.
    #>
    param([Parameter(Mandatory = $true)] [string]$KitPath)

    $chain = [System.Collections.Generic.List[string]]::new()
    $current = $KitPath
    while ($current) {
        if ($chain.Contains($current) -or $chain.Count -gt 8) {
            throw "Theme kit inheritance loop at $current"
        }
        $root = Join-RepoPath $current
        if (-not (Test-Path $root)) {
            throw "Theme kit not found at $current"
        }
        $chain.Insert(0, $current)

        $kitJson = Join-Path $root "kit.json"
        $current = $null
        if (Test-Path $kitJson) {
            $meta = Get-Content -Raw -Path $kitJson | ConvertFrom-Json
            if ($meta.PSObject.Properties.Name -contains "extends" -and $meta.extends) {
                $current = $meta.extends
            }
        }
    }

    return , $chain.ToArray()
}

function Invoke-ThemeCompose {
    <#
        Builds a loadable Playnite theme directory:
          1. kit overlays, base kit first (<kit>/<Mode>/**), plus each kit's LICENSE*.txt notices
          2. Constants.xaml rendered from the nearest kit's Constants.template.xaml + <palette>
          3. theme overlay (<themeDir>/**), which wins over 1 and 2 file by file
          4. theme.yaml
    #>
    param(
        [Parameter(Mandatory = $true)] $Profile,
        [Parameter(Mandatory = $true)] [string]$OutDir
    )

    $manifest = Get-ThemeManifestInfo -Profile $Profile
    $mode = if ($manifest.Mode) { $manifest.Mode } else { "Desktop" }

    if (Test-Path $OutDir) {
        Get-ChildItem -Path $OutDir -Force | Remove-Item -Recurse -Force
    }
    New-Item -ItemType Directory -Path $OutDir -Force | Out-Null

    $copyTree = {
        param([string]$Source, [string]$Label)
        foreach ($file in Get-ChildItem -Path $Source -Recurse -File) {
            $relative = Get-RelativePathCompat -Root $Source -Path $file.FullName
            $target = Join-Path $OutDir $relative
            if (Test-Path $target) {
                Write-Host "  $Label overrides $relative"
            }
            New-Item -ItemType Directory -Path (Split-Path -Parent $target) -Force | Out-Null
            Copy-Item -Path $file.FullName -Destination $target -Force
        }
    }

    if ($Profile.themeKit) {
        $template = $null
        $templateKit = $null
        $hasOverlay = $false
        foreach ($kit in (Get-ThemeKitChain -KitPath $Profile.themeKit)) {
            $kitRoot = Join-RepoPath $kit
            $kitOverlay = Join-Path $kitRoot $mode
            if (Test-Path $kitOverlay) {
                & $copyTree $kitOverlay (Split-Path -Leaf $kit)
                $hasOverlay = $true
            }

            # Kit templates derive from third-party XAML; their notices ship inside the package.
            foreach ($notice in Get-ChildItem -Path $kitRoot -File -Filter "LICENSE*.txt") {
                Copy-Item -Path $notice.FullName -Destination (Join-Path $OutDir $notice.Name) -Force
            }

            $candidate = Join-Path $kitRoot "Constants.template.xaml"
            if (Test-Path $candidate) {
                $template = $candidate
                $templateKit = $kit
            }
        }
        if (-not $hasOverlay) {
            throw "Theme kit $($Profile.themeKit) (and its base kits) has no '$mode' overlay."
        }

        if ($Profile.palette -and $template) {
            $palette = Read-ThemePalette -Path (Join-RepoPath $Profile.palette)
            $rendered = Expand-ThemeTemplate -Template (Get-Content -Raw -Path $template) -Palette $palette
            $header = "<!-- Generated by scripts/build-theme.ps1 from $templateKit/Constants.template.xaml and $($Profile.palette). Edit those, not this file. -->`n"
            Set-Content -Path (Join-Path $OutDir "Constants.xaml") -Value ($header + $rendered) -NoNewline -Encoding utf8
        }
    }

    if ($Profile.PSObject.Properties.Name -contains "themeDir" -and $Profile.themeDir) {
        $themeDir = Join-RepoPath $Profile.themeDir
        if (Test-Path $themeDir) {
            & $copyTree $themeDir "theme"
        }
    }

    Copy-Item -Path $manifest.Path -Destination (Join-Path $OutDir "theme.yaml") -Force
    return $OutDir
}

function Test-ThemeOverlay {
    <#
        Static checks for a composed theme directory. Playnite fails quietly on most of these, so they are the
        closest thing to a compile step a theme has. Returns a list of error strings (empty = pass).
    #>
    param(
        [Parameter(Mandatory = $true)] [string]$Directory,
        [ValidateSet("Desktop", "Fullscreen")] [string]$Mode = "Desktop"
    )

    $api = Get-PlayniteThemeApiData -Mode $Mode
    $errors = [System.Collections.Generic.List[string]]::new()
    $acceptedFiles = [System.Collections.Generic.HashSet[string]]::new([System.StringComparer]::OrdinalIgnoreCase)
    foreach ($f in $api.Files) { $acceptedFiles.Add(($f -replace "\\", "/")) | Out-Null }
    $playniteKeys = [System.Collections.Generic.HashSet[string]]::new([System.StringComparer]::Ordinal)
    foreach ($k in $api.Keys) { $playniteKeys.Add($k) | Out-Null }

    $xamlFiles = @(Get-ChildItem -Path $Directory -Recurse -File -Filter "*.xaml")
    $definedByFile = @{}
    $allOverlayKeys = [System.Collections.Generic.HashSet[string]]::new([System.StringComparer]::Ordinal)
    $keyPattern = 'x:Key="([^"{}]+)"'
    $refPattern = '\{(StaticResource|DynamicResource)\s+([^\s{}]+)\s*\}'

    foreach ($file in $xamlFiles) {
        $relative = (Get-RelativePathCompat -Root $Directory -Path $file.FullName) -replace "\\", "/"
        $text = Get-Content -Raw -Path $file.FullName

        if (-not $acceptedFiles.Contains($relative)) {
            $errors.Add("$relative is not a Playnite $Mode theme file (API $($api.ApiVersion)); Playnite never loads it.") | Out-Null
        }

        if ($text -match "\{\{") {
            $errors.Add("$relative still contains an unrendered {{placeholder}}.") | Out-Null
        }

        try {
            (New-Object System.Xml.XmlDocument).LoadXml($text)
        }
        catch {
            $reason = $_.Exception.Message
            if ($_.Exception.InnerException) { $reason = $_.Exception.InnerException.Message }
            $errors.Add("$relative is not well-formed XML: $reason") | Out-Null
            continue
        }

        $keys = [System.Collections.Generic.HashSet[string]]::new([System.StringComparer]::Ordinal)
        foreach ($m in [regex]::Matches($text, $keyPattern)) {
            $keys.Add($m.Groups[1].Value) | Out-Null
            $allOverlayKeys.Add($m.Groups[1].Value) | Out-Null
        }
        $definedByFile[$relative] = $keys
    }

    foreach ($file in $xamlFiles) {
        $relative = (Get-RelativePathCompat -Root $Directory -Path $file.FullName) -replace "\\", "/"
        if (-not $definedByFile.ContainsKey($relative)) { continue }
        $text = Get-Content -Raw -Path $file.FullName

        foreach ($m in [regex]::Matches($text, $refPattern)) {
            $kind = $m.Groups[1].Value
            $key = $m.Groups[2].Value
            if ($key.StartsWith("LOC")) { continue }

            $known = $playniteKeys.Contains($key) -or $allOverlayKeys.Contains($key)
            if (-not $known) {
                $errors.Add("$relative references unknown resource '$key' ($kind). Typo, or a key this Playnite version does not define.") | Out-Null
                continue
            }

            if ($kind -eq "StaticResource" -and -not $playniteKeys.Contains($key) -and -not $definedByFile[$relative].Contains($key)) {
                $errors.Add("$relative uses {StaticResource $key}, but '$key' only exists in another theme file. Playnite parses each theme file alone before merging, so this breaks the theme; use DynamicResource.") | Out-Null
            }
        }
    }

    $fontsDir = Join-Path $Directory "Fonts"
    if (Test-Path $fontsDir) {
        $errors.Add("Fonts/ exists, but Toolbox pack skips that folder, so the fonts would not ship. Use another folder name.") | Out-Null
    }

    if (-not (Test-Path (Join-Path $Directory "theme.yaml"))) {
        $errors.Add("theme.yaml is missing from the theme root.") | Out-Null
    }

    return @($errors | Select-Object -Unique)
}

function Get-PlayniteThemesRoot {
    # Installed Playnite keeps user themes under %AppData%\Playnite\Themes; portable installs keep them next to Playnite.exe.
    if ($env:APPDATA) {
        $candidate = Join-Path $env:APPDATA "Playnite/Themes"
        if (Test-Path $candidate) {
            return (Resolve-Path $candidate).Path
        }
    }

    return $null
}
