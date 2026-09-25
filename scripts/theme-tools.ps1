# Shared helpers for Playnite theme add-ons (kind = "theme" in src/extensions.json).
# Dot-source after extension-profiles.ps1.
#
# A theme is standalone: everything it ships lives under src/<Theme>/ (AGENTS.md, info/, src/). Nothing is shared
# between themes at build time; these helpers only build and check one theme folder.

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
# Tokens: src/<Theme>/src/tokens.css holds the design system's CSS custom properties under their own names
# ---------------------------------------------------------------------------------------------------------------

function Read-ThemeTokens {
    <#
        Reads CSS custom properties from a theme's tokens.css. Declarations in :root and @theme blocks are the base;
        blocks whose selector mentions "dark" (.dark, [data-theme="dark"], [data-color-mode="dark"], ...) override
        them, because every theme here is dark. Returns an ordered name -> raw value map without the leading "--".
    #>
    param([Parameter(Mandatory = $true)] [string]$Path)

    if (-not (Test-Path $Path)) {
        throw "Tokens not found at $Path"
    }

    $css = Get-Content -Raw -Path $Path
    $css = [regex]::Replace($css, "/\*.*?\*/", "", [System.Text.RegularExpressions.RegexOptions]::Singleline)

    $base = [ordered]@{}
    $dark = [ordered]@{}
    foreach ($block in [regex]::Matches($css, "([^{}]+)\{([^{}]*)\}")) {
        # The text before "{" can carry earlier statements (@import ...;); the selector is what follows the last ";".
        $selector = ($block.Groups[1].Value -split ";")[-1].Trim()
        $target = $null
        if ($selector -match "dark") { $target = $dark }
        elseif ($selector -match "(^|,)\s*:root\b" -or $selector -match "^@theme\b") { $target = $base }
        if ($null -eq $target) { continue }

        foreach ($decl in [regex]::Matches($block.Groups[2].Value, "--([A-Za-z0-9_-]+)\s*:\s*([^;]+);?")) {
            $target[$decl.Groups[1].Value] = $decl.Groups[2].Value.Trim()
        }
    }

    foreach ($name in $dark.Keys) {
        $base[$name] = $dark[$name]
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
        Parses CSS colors: #hex (3, 4, 6, 8 digits), oklch(), hsl(), rgb(), bare "H S% L%" channels (shadcn v3 style),
        transparent, and var(--name) references into $Tokens.
    #>
    param(
        [Parameter(Mandatory = $true)] [string]$Value,
        $Tokens = $null,
        [int]$Depth = 0
    )

    $v = $Value.Trim()
    if ($Depth -gt 8) { throw "Color reference loop at '$Value'" }

    if ($v -match "^var\(\s*--([A-Za-z0-9_-]+)\s*(?:,\s*(.+))?\)$") {
        $ref = $Matches[1]
        $fallback = $Matches[2]
        if ($Tokens -and $Tokens.Contains($ref)) {
            return ConvertFrom-CssColor -Value $Tokens[$ref] -Tokens $Tokens -Depth ($Depth + 1)
        }
        if ($fallback) {
            return ConvertFrom-CssColor -Value $fallback -Tokens $Tokens -Depth ($Depth + 1)
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

    # Bare HSL channels (shadcn v3 stored colors this way): --background: 240 10% 3.9%;
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
    <#
        Length token -> px: rem (16px), px, bare numbers, var(--name) and calc() over those with + - * / and
        parentheses (shadcn's radius scale is calc(var(--radius) - 4px)).
    #>
    param(
        [Parameter(Mandatory = $true)] [string]$Value,
        $Tokens = $null,
        [int]$Depth = 0
    )

    if ($Depth -gt 8) { throw "Length reference loop at '$Value'" }

    $errors = [System.Collections.Generic.List[string]]::new()
    $expr = [regex]::Replace($Value.Trim(), "var\(\s*--([A-Za-z0-9_-]+)\s*(?:,\s*([^()]+))?\)", {
            param($m)
            $ref = $m.Groups[1].Value
            if ($Tokens -and $Tokens.Contains($ref)) {
                return (ConvertTo-Px -Value $Tokens[$ref] -Tokens $Tokens -Depth ($Depth + 1)).ToString($script:Invariant)
            }
            if ($m.Groups[2].Success) {
                return (ConvertTo-Px -Value $m.Groups[2].Value -Tokens $Tokens -Depth ($Depth + 1)).ToString($script:Invariant)
            }
            $errors.Add("unresolved var(--$ref)") | Out-Null
            return "0"
        })
    if ($errors.Count -gt 0) { throw ($errors -join "; ") }

    $expr = $expr -replace "calc\(", "("
    $expr = [regex]::Replace($expr, "(\d*\.?\d+)rem\b", { param($m) ([double]::Parse($m.Groups[1].Value, $script:Invariant) * 16).ToString($script:Invariant) })
    $expr = [regex]::Replace($expr, "(\d*\.?\d+)px\b", '$1')
    if ($expr -notmatch "^[\d.\s+\-*/()]+$") {
        throw "Unsupported length '$Value' (use rem, px, var() or calc())"
    }

    return [double][System.Data.DataTable]::new().Compute($expr, "")
}

# ---------------------------------------------------------------------------------------------------------------
# Template rendering (*.template.xaml + tokens.css -> *.xaml)
# ---------------------------------------------------------------------------------------------------------------

function Resolve-TemplateColor {
    # One color alternative: name, then @surface flattening (last surface first), then /NN alpha.
    param($Name, [string[]]$Surfaces, $AlphaPercent, $Tokens, [switch]$Literal)

    $color = if ($Literal) { ConvertFrom-CssColor -Value $Name } else { ConvertFrom-CssColor -Value $Tokens[$Name] -Tokens $Tokens }

    if ($Surfaces.Count -gt 0 -and $color.A -lt 1 -and $color.A -gt 0) {
        # Flatten onto the surface the color sits on. A translucent surface needs its own base after it:
        # {{divider@paper@background}} = divider over (paper over background). Fully transparent stays transparent.
        $surface = ConvertFrom-CssColor -Value $Tokens[$Surfaces[-1]] -Tokens $Tokens
        if ($surface.A -lt 1) {
            throw "surface --$($Surfaces[-1]) is translucent; name the surface under it too (@$($Surfaces[-1])@<opaque token>)"
        }
        for ($i = $Surfaces.Count - 2; $i -ge 0; $i--) {
            $surface = Merge-RgbaOver -Top (ConvertFrom-CssColor -Value $Tokens[$Surfaces[$i]] -Tokens $Tokens) -Bottom $surface
        }
        $color = Merge-RgbaOver -Top $color -Bottom $surface
    }

    if ($AlphaPercent) {
        # Tailwind "/NN" semantics: scales whatever alpha the color already has.
        $color = New-Rgba $color.R $color.G $color.B ($color.A * [int]$AlphaPercent / 100.0)
    }

    return $color
}

function Expand-ThemeTemplate {
    <#
        Fills the double-brace placeholders of a *.template.xaml from a token map (Read-ThemeTokens).

          {{name}}               color from --name, alpha kept (#hex, oklch(), hsl(), rgb(), var(), transparent)
          {{name@surface}}       translucent --name flattened onto --surface (chain surfaces: @paper@background)
          {{name/60}}            alpha scaled to 60% (Tailwind "/60")
          {{a?b@card?c/50}}      first alternative whose tokens all exist
          {{name|#F59E0B}}       literal CSS color when no alternative exists (optionally "|#hex/NN")
          {{px:name}}            length token in px as a plain number (rem, px, var(), calc(); below 0 clamps to 0)
          {{text:name|Segoe UI}} raw token text, XML-escaped, with an optional fallback

        Throws with every unresolved placeholder listed, each with its line and the x:Key on that line.
    #>
    param(
        [Parameter(Mandatory = $true)] [string]$Template,
        [Parameter(Mandatory = $true)] $Tokens,
        [string]$SourceName = "template"
    )

    $errors = [System.Collections.Generic.List[string]]::new()
    $fail = {
        param($Match, [string]$Reason)
        $line = ([regex]::Matches($Template.Substring(0, $Match.Index), "\n")).Count + 1
        $lineText = ($Template -split "\n")[$line - 1]
        $key = if ($lineText -match 'x:Key="([^"]+)"') { " ($($Matches[1]))" } else { "" }
        $errors.Add("${SourceName}:$line$key $($Match.Value): $Reason") | Out-Null
        return $Match.Value
    }

    $result = [regex]::Replace($Template, "\{\{\s*(.+?)\s*\}\}", {
            param($match)
            $expr = $match.Groups[1].Value

            if ($expr -eq "TODO") {
                return (& $fail $match "not mapped yet; name the design system's token for this key")
            }

            if ($expr -match "^px:(?<name>[A-Za-z0-9_-]+)(?:\|(?<fallback>-?[\d.]+))?$") {
                $name = $Matches["name"]
                $fallback = $Matches["fallback"]
                try {
                    $px = if ($Tokens.Contains($name)) { ConvertTo-Px -Value $Tokens[$name] -Tokens $Tokens }
                    elseif ($fallback) { [double]::Parse($fallback, $script:Invariant) }
                    else { return (& $fail $match "missing --$name") }
                    return ([Math]::Max([double]0, $px)).ToString($script:Invariant)
                }
                catch {
                    return (& $fail $match $_.Exception.Message)
                }
            }

            if ($expr -match "^text:(?<name>[A-Za-z0-9_-]+)(?:\|(?<fallback>.*))?$") {
                $name = $Matches["name"]
                if ($Tokens.Contains($name)) { return [System.Security.SecurityElement]::Escape($Tokens[$name].Trim('"', "'", ' ')) }
                if ($Matches["fallback"]) { return [System.Security.SecurityElement]::Escape($Matches["fallback"]) }
                return (& $fail $match "missing --$name")
            }

            # expr = alt ( "?" alt )* ( "|" literal )?     alt = name ( "@" surface )* ( "/" NN )?
            $parts = $expr -split "\|", 2
            $alts = @($parts[0] -split "\?")
            $literal = if ($parts.Count -gt 1) { $parts[1] } else { $null }
            $altPattern = "^(?<name>[A-Za-z0-9_-]+)(?<surfaces>(?:@[A-Za-z0-9_-]+)*)(?:/(?<alpha>\d{1,3}))?$"
            $parsedAlts = foreach ($alt in $alts) {
                if ($alt -notmatch $altPattern) {
                    return (& $fail $match "unrecognized placeholder syntax")
                }
                [pscustomobject]@{
                    Name     = $Matches["name"]
                    Surfaces = @($Matches["surfaces"] -split "@" | Where-Object { $_ })
                    Alpha    = $Matches["alpha"]
                }
            }

            try {
                foreach ($alt in $parsedAlts) {
                    $names = @($alt.Name) + $alt.Surfaces
                    if (@($names | Where-Object { -not $Tokens.Contains($_) }).Count -eq 0) {
                        return Format-XamlColor (Resolve-TemplateColor -Name $alt.Name -Surfaces $alt.Surfaces -AlphaPercent $alt.Alpha -Tokens $Tokens)
                    }
                }
                if ($literal) {
                    $literalParts = $literal -split "/", 2
                    $alpha = if ($literalParts.Count -gt 1) { $literalParts[1] } else { $null }
                    return Format-XamlColor (Resolve-TemplateColor -Name $literalParts[0] -Surfaces @() -AlphaPercent $alpha -Tokens $Tokens -Literal)
                }
            }
            catch {
                return (& $fail $match $_.Exception.Message)
            }

            $wanted = $parsedAlts | ForEach-Object { (@($_.Name) + $_.Surfaces | ForEach-Object { "--$_" }) -join " + " }
            return (& $fail $match ("missing " + ($wanted -join " / ")))
        })

    if ($errors.Count -gt 0) {
        throw ("Template rendering failed:`n  - " + ($errors -join "`n  - "))
    }

    return $result
}

# ---------------------------------------------------------------------------------------------------------------
# Build + checks
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

function Get-ThemeSourceDirectory {
    param([Parameter(Mandatory = $true)] $Profile)

    if (-not ($Profile.PSObject.Properties.Name -contains "themeSource") -or -not $Profile.themeSource) {
        throw "Theme profile '$($Profile.key)' has no themeSource (src/<Theme>/src)."
    }

    $source = Join-RepoPath $Profile.themeSource
    if (-not (Test-Path $source)) {
        throw "themeSource not found at $source"
    }

    return $source
}

function Invoke-ThemeBuild {
    <#
        Builds a loadable Playnite theme folder from one theme's sources (src/<Theme>/):
          1. every file under themeSource at the same relative path, except tokens.css and *.template.xaml
          2. each *.template.xaml rendered with themeSource/tokens.css into the same path without ".template"
          3. info/LICENSE*.txt and NOTICE*.txt third-party notices, at the theme root
          4. theme.yaml
    #>
    param(
        [Parameter(Mandatory = $true)] $Profile,
        [Parameter(Mandatory = $true)] [string]$OutDir
    )

    $manifest = Get-ThemeManifestInfo -Profile $Profile
    $source = Get-ThemeSourceDirectory -Profile $Profile

    if (Test-Path $OutDir) {
        Get-ChildItem -Path $OutDir -Force | Remove-Item -Recurse -Force
    }
    New-Item -ItemType Directory -Path $OutDir -Force | Out-Null

    $templates = [System.Collections.Generic.List[object]]::new()
    foreach ($file in Get-ChildItem -Path $source -Recurse -File) {
        $relative = Get-RelativePathCompat -Root $source -Path $file.FullName
        if ($file.Name -eq "tokens.css") { continue }
        if ($file.Name -like "*.template.xaml") {
            $templates.Add($file) | Out-Null
            continue
        }
        $target = Join-Path $OutDir $relative
        New-Item -ItemType Directory -Path (Split-Path -Parent $target) -Force | Out-Null
        Copy-Item -Path $file.FullName -Destination $target -Force
    }

    if ($templates.Count -gt 0) {
        $tokensPath = Join-Path $source "tokens.css"
        $tokens = Read-ThemeTokens -Path $tokensPath
        $tokensRel = ($Profile.themeSource.TrimEnd('/', '\')) + "/tokens.css"
        foreach ($templateFile in $templates) {
            $relative = Get-RelativePathCompat -Root $source -Path $templateFile.FullName
            $outRelative = $relative -replace "\.template\.xaml$", ".xaml"
            $target = Join-Path $OutDir $outRelative
            if (Test-Path $target) {
                throw "Both $outRelative and $relative exist in $($Profile.themeSource); keep one."
            }
            $sourceRel = ($Profile.themeSource.TrimEnd('/', '\')) + "/" + ($relative -replace "\\", "/")
            $rendered = Expand-ThemeTemplate -Template (Get-Content -Raw -Path $templateFile.FullName) -Tokens $tokens -SourceName $sourceRel
            $header = "<!-- Generated by scripts/build-theme.ps1 from $sourceRel and $tokensRel. Edit those, not this file. -->`n"
            New-Item -ItemType Directory -Path (Split-Path -Parent $target) -Force | Out-Null
            Set-Content -Path $target -Value ($header + $rendered) -NoNewline -Encoding utf8
        }
    }

    # Third-party notices (Playnite's Default theme, icon sets) ship inside the package.
    $infoDir = Split-Path -Parent $manifest.Path
    foreach ($notice in Get-ChildItem -Path $infoDir -File | Where-Object { $_.Name -like "LICENSE*.txt" -or $_.Name -like "NOTICE*.txt" }) {
        Copy-Item -Path $notice.FullName -Destination (Join-Path $OutDir $notice.Name) -Force
    }

    Copy-Item -Path $manifest.Path -Destination (Join-Path $OutDir "theme.yaml") -Force
    return $OutDir
}

function Test-ThemeBuild {
    <#
        Static checks for a built theme folder. Playnite fails quietly on most of these, so they are the closest
        thing to a compile step a theme has. Returns a list of error strings (empty = pass).
        -ResourcePrefix: every x:Key the theme defines that Playnite does not must start with it (the design
        system's name, e.g. "Primer"), so each theme keeps its own vocabulary.
    #>
    param(
        [Parameter(Mandatory = $true)] [string]$Directory,
        [ValidateSet("Desktop", "Fullscreen")] [string]$Mode = "Desktop",
        [string]$ResourcePrefix = ""
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
            $key = $m.Groups[1].Value
            $keys.Add($key) | Out-Null
            $allOverlayKeys.Add($key) | Out-Null
            if ($ResourcePrefix -and -not $playniteKeys.Contains($key) -and -not $key.StartsWith($ResourcePrefix, [System.StringComparison]::Ordinal)) {
                $errors.Add("$relative defines '$key'. Keys a theme adds must start with '$ResourcePrefix' (its design system's name); Playnite's own keys keep theirs.") | Out-Null
            }
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
