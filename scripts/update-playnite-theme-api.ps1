[CmdletBinding()]
param(
    # Root of a Playnite source checkout (https://github.com/JosefNemec/Playnite), at the release tag you target.
    [Parameter(Mandatory = $true)]
    [string]$PlayniteSource,

    # Playnite release the checkout is at, recorded for humans (e.g. 10.60).
    [Parameter(Mandatory = $true)]
    [string]$PlayniteVersion,

    [ValidateSet("Desktop", "Fullscreen")]
    [string[]]$Mode = @("Desktop")
)

# Snapshots what Playnite's ThemeManager accepts so validate-extension / build-theme can check themes offline:
#   - the theme XAML paths Playnite loads (App.xaml merged dictionaries under Themes/<Mode>/Default/)
#   - every x:Key the Default theme defines, plus GlobalResources.xaml keys (converters, FontIcoFont, True/False)
#   - the theme API version from source/Playnite/Themes.cs
# Re-run when targeting a new Playnite release, then review the diff of scripts/data/playnite-theme-api.json.

$ErrorActionPreference = "Stop"
. (Join-Path $PSScriptRoot "extension-profiles.ps1")

$source = (Resolve-Path $PlayniteSource).Path
$themesCs = Join-Path $source "source/Playnite/Themes.cs"
if (-not (Test-Path $themesCs)) {
    throw "Not a Playnite source checkout (missing $themesCs)."
}
$themesCsText = Get-Content -Raw -Path $themesCs

$keyPattern = 'x:Key="([^"{}]+)"'
$outPath = Join-Path $PSScriptRoot "data/playnite-theme-api.json"
$existing = if (Test-Path $outPath) { Get-Content -Raw -Path $outPath | ConvertFrom-Json } else { $null }

$modes = [ordered]@{}
if ($existing -and $existing.modes) {
    foreach ($prop in $existing.modes.PSObject.Properties) {
        $modes[$prop.Name] = $prop.Value
    }
}

$globalKeys = [System.Collections.Generic.SortedSet[string]]::new([System.StringComparer]::Ordinal)

foreach ($m in $Mode) {
    $appProject = Join-Path $source "source/Playnite.$($m)App"
    $appXaml = Join-Path $appProject "App.xaml"
    $defaultDir = Join-Path $appProject "Themes/$m/Default"
    $globalXaml = Join-Path $appProject "GlobalResources.xaml"
    foreach ($required in @($appXaml, $defaultDir, $globalXaml)) {
        if (-not (Test-Path $required)) {
            throw "Missing $required"
        }
    }

    if ($themesCsText -notmatch "$($m)ApiVersion\s*=>\s*new System\.Version\(`"([\d.]+)`"\)") {
        throw "Could not read $($m)ApiVersion from $themesCs"
    }
    $apiVersion = $Matches[1]

    $prefix = "Themes/$m/Default/"
    $files = [System.Collections.Generic.List[string]]::new()
    foreach ($match in [regex]::Matches((Get-Content -Raw -Path $appXaml), 'Source="([^"]+)"')) {
        $value = $match.Groups[1].Value
        if ($value.StartsWith($prefix)) {
            $files.Add($value.Substring($prefix.Length)) | Out-Null
        }
    }

    $keys = [System.Collections.Generic.SortedSet[string]]::new([System.StringComparer]::Ordinal)
    foreach ($file in Get-ChildItem -Path $defaultDir -Recurse -File -Filter "*.xaml") {
        foreach ($match in [regex]::Matches((Get-Content -Raw -Path $file.FullName), $keyPattern)) {
            $keys.Add($match.Groups[1].Value) | Out-Null
        }
    }

    foreach ($match in [regex]::Matches((Get-Content -Raw -Path $globalXaml), $keyPattern)) {
        $globalKeys.Add($match.Groups[1].Value) | Out-Null
    }

    $modes[$m] = [ordered]@{
        apiVersion = $apiVersion
        files      = @($files)
        keys       = @($keys)
    }
    Write-Host "$m theme API $apiVersion - $($files.Count) files, $($keys.Count) keys"
}

if ($existing -and $existing.globalKeys) {
    foreach ($k in $existing.globalKeys) { $globalKeys.Add($k) | Out-Null }
}

$data = [ordered]@{
    playniteVersion = $PlayniteVersion
    source          = "https://github.com/JosefNemec/Playnite/tree/$PlayniteVersion"
    modes           = $modes
    globalKeys      = @($globalKeys)
}

New-Item -ItemType Directory -Path (Split-Path -Parent $outPath) -Force | Out-Null
$data | ConvertTo-Json -Depth 6 | Set-Content -Path $outPath -Encoding utf8
Write-Host "Wrote $outPath"
