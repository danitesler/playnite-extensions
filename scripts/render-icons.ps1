<#
.SYNOPSIS
Renders SVG icons from any icon pack into PNGs or XAML resources for Playnite themes and plugins.

.DESCRIPTION
Two ways to run it:

  From an add-on's icons.json (src/<Folder>/icons.json), re-rendering everything that add-on ships:
    .\scripts\render-icons.ps1 -Extension primertheme

  Ad hoc:
    .\scripts\render-icons.ps1 -Pack lucide -Icons settings,play=PlayIcon -OutDir <folder> -Color "#e4e4e7"
    .\scripts\render-icons.ps1 -Pack octicons -Icons trash,pencil -Format Geometry -KeyPrefix PrimerOcticon
    .\scripts\render-icons.ps1 -Pack tabler -Variant filled -Icons star -Format DrawingImage -Brush "{DynamicResource TextBrush}"
    .\scripts\render-icons.ps1 -SvgDir <folder of .svg files> -Icons logo -OutDir <folder>

Packs live in scripts/data/icon-packs.json (octicons, lucide, tabler, heroicons, phosphor, feather,
material-symbols, fluent); any other source works with -UrlTemplate or -SvgDir. Stroked and filled SVGs are both
supported; see scripts/lib/SvgIconRenderer.cs for the SVG subset.

Formats:
  Png           <OutDir>/<output>.png at -Size px in -Color. For anything Playnite loads by file path: theme menu
                icons (string resources resolved through ThemeFile), plugin menu item icons, images.
  Geometry      <Geometry x:Key="<KeyPrefix><Output>"> path data in the pack's own grid. Filled icons only.
  DrawingImage  <DrawingImage x:Key="<KeyPrefix><Output>"> with fills and strokes in -Brush. For Image.Source.
XAML goes to -XamlOut (a whole ResourceDictionary is written) or to the console for pasting.

.PARAMETER Icons
Icon names in the pack. "name=Output" renames the output (file name for Png, key suffix for XAML).
#>
[CmdletBinding(DefaultParameterSetName = "Adhoc")]
param(
    # Render every job in src/<Folder>/icons.json of this extension key.
    [Parameter(Mandatory = $true, ParameterSetName = "Extension")]
    [string]$Extension,

    [Parameter(ParameterSetName = "List")]
    [switch]$ListPacks,

    [Parameter(ParameterSetName = "Adhoc")]
    [string[]]$Icons,

    # Pack name from scripts/data/icon-packs.json.
    [Parameter(ParameterSetName = "Adhoc")]
    [string]$Pack = "",

    # Git ref / variant / pack size placeholder override for the pack's URL.
    [Parameter(ParameterSetName = "Adhoc")]
    [string]$Ref = "",
    [Parameter(ParameterSetName = "Adhoc")]
    [string]$Variant = "",
    [Parameter(ParameterSetName = "Adhoc")]
    [string]$PackSize = "",

    # Any SVG source: URL with {name} (and optionally {ref}, {variant}, {size}), or a local folder of <name>.svg.
    [Parameter(ParameterSetName = "Adhoc")]
    [string]$UrlTemplate = "",
    [Parameter(ParameterSetName = "Adhoc")]
    [string]$SvgDir = "",

    [Parameter(ParameterSetName = "Adhoc")]
    [ValidateSet("Png", "Geometry", "DrawingImage")]
    [string]$Format = "Png",

    [Parameter(ParameterSetName = "Adhoc")]
    [string]$OutDir = "",

    # PNG pixel size (Playnite scales menu icons to 16px; 48 stays sharp at 300% scaling).
    [Parameter(ParameterSetName = "Adhoc")]
    [int]$Size = 48,

    [Parameter(ParameterSetName = "Adhoc")]
    [string]$Color = "#ffffff",

    # Keep explicit colors from the SVG instead of painting everything in -Color / -Brush.
    [Parameter(ParameterSetName = "Adhoc")]
    [switch]$KeepColors,

    # Appended to every output name, e.g. "-danger".
    [Parameter(ParameterSetName = "Adhoc")]
    [string]$Suffix = "",

    [Parameter(ParameterSetName = "Adhoc")]
    [string]$XamlOut = "",
    [Parameter(ParameterSetName = "Adhoc")]
    [string]$KeyPrefix = "",
    # XAML brush for DrawingImage, e.g. "{DynamicResource TextBrush}" or "#9198a1". Defaults to -Color.
    [Parameter(ParameterSetName = "Adhoc")]
    [string]$Brush = ""
)

$ErrorActionPreference = "Stop"
. (Join-Path $PSScriptRoot "extension-profiles.ps1")

$packsPath = Join-Path $PSScriptRoot "data/icon-packs.json"
$packs = (Get-Content -Raw $packsPath | ConvertFrom-Json).packs

if ($ListPacks) {
    foreach ($p in $packs.PSObject.Properties) {
        $v = if ($p.Value.variants) { " variants: " + ($p.Value.variants -join ", ") } else { "" }
        Write-Host ("{0,-18} {1} ({2}){3}" -f $p.Name, $p.Value.url, $p.Value.license, $v)
    }
    return
}

if ($PSCmdlet.ParameterSetName -eq "Extension") {
    $profile = Get-ExtensionProfile -Extension $Extension
    $folder = Split-Path (Split-Path (Join-RepoPath $profile.extensionManifest))
    $manifestPath = Join-Path $folder "icons.json"
    if (-not (Test-Path $manifestPath)) { throw "No icons.json in $folder." }
    $manifest = Get-Content -Raw $manifestPath | ConvertFrom-Json
    $pathKeys = @("outDir", "xamlOut", "svgDir")
    foreach ($job in $manifest.jobs) {
        $params = @{}
        foreach ($prop in $job.PSObject.Properties) {
            if ($prop.Name.StartsWith("_")) { continue }
            $value = $prop.Value
            if ($pathKeys -contains $prop.Name) { $value = Join-Path $folder $value }
            if ($prop.Name -eq "keepColors") { $value = [bool]$value }
            $params[$prop.Name] = $value
        }
        & $PSCommandPath @params
    }
    return
}

if (-not $Icons) { throw "Pass -Icons, -Extension or -ListPacks." }
if ($Format -eq "Png" -and -not $OutDir) { throw "-OutDir is required for Png output." }

Add-Type -AssemblyName PresentationCore, PresentationFramework, WindowsBase, System.Xml.Linq
if (-not ("RepoIcons.SvgIcon" -as [type])) {
    Add-Type -Path (Join-Path $PSScriptRoot "lib/SvgIconRenderer.cs") -ReferencedAssemblies PresentationCore, PresentationFramework, WindowsBase, System.Xaml, System.Xml, System.Xml.Linq
}

# Resolve the SVG source.
$packInfo = $null
if ($Pack) {
    $packInfo = $packs.$Pack
    if (-not $packInfo) { throw "Unknown pack '$Pack'. Known: $(($packs.PSObject.Properties.Name) -join ', ')" }
    if (-not $UrlTemplate) { $UrlTemplate = $packInfo.url }
}
if (-not $UrlTemplate -and -not $SvgDir) { throw "Pass -Pack, -UrlTemplate or -SvgDir." }

function Get-PackValue([string]$override, [string]$key) {
    if ($override) { return $override }
    if ($packInfo -and $packInfo.$key) { return [string]$packInfo.$key }
    return ""
}
$refValue = Get-PackValue $Ref "ref"
$variantValue = Get-PackValue $Variant "variant"
$sizeValue = Get-PackValue $PackSize "size"
if ($packInfo -and $packInfo.variants -and $variantValue -and ($packInfo.variants -notcontains $variantValue)) {
    throw "Pack '$Pack' has no variant '$variantValue'. Variants: $($packInfo.variants -join ', ')"
}
$variantSuffix = if ($packInfo -and $packInfo.variantSuffix -and $packInfo.variantSuffix.$variantValue) { $packInfo.variantSuffix.$variantValue } else { "" }

function Get-SvgText([string]$name) {
    if ($SvgDir) {
        $path = Join-Path $SvgDir "$name.svg"
        if (-not (Test-Path $path)) { throw "Missing $path" }
        return Get-Content -Raw $path
    }
    $folderName = (Get-Culture).TextInfo.ToTitleCase(($name -replace "[_-]", " "))
    $url = $UrlTemplate.Replace("{ref}", $refValue).Replace("{variant}", $variantValue).Replace("{variantSuffix}", $variantSuffix).
        Replace("{size}", $sizeValue).Replace("{folder}", [uri]::EscapeDataString($folderName)).Replace("{name}", $name)
    try {
        $bytes = (Invoke-WebRequest -Uri $url -UseBasicParsing).RawContentStream.ToArray()
        return [System.Text.Encoding]::UTF8.GetString($bytes)
    }
    catch {
        throw "Could not download '$name' from $url ($($_.Exception.Message))"
    }
}

function ConvertTo-PascalCase([string]$s) {
    return (($s -split "[^A-Za-z0-9]+" | Where-Object { $_ } | ForEach-Object { $_.Substring(0, 1).ToUpperInvariant() + $_.Substring(1) }) -join "")
}

$color = [System.Windows.Media.ColorConverter]::ConvertFromString($Color)
$xamlBrush = if ($Brush) { $Brush } else { $Color }
$source = if ($SvgDir) { $SvgDir } elseif ($Pack) { "$Pack $refValue $variantValue".Trim() } else { $UrlTemplate }
if ($OutDir) { New-Item -ItemType Directory -Force $OutDir | Out-Null }
Write-Host "Rendering $($Icons.Count) icon(s) from $source as $Format"

$xaml = New-Object System.Text.StringBuilder
foreach ($entry in $Icons) {
    $parts = $entry -split "=", 2
    $name = $parts[0].Trim()
    $output = if ($parts.Count -gt 1) { $parts[1].Trim() } else { $name }
    $output += $Suffix

    $icon = [RepoIcons.SvgIcon]::Parse((Get-SvgText $name))
    switch ($Format) {
        "Png" {
            $icon.SavePng((Join-Path $OutDir "$output.png"), $color, [bool]$KeepColors, $Size)
            Write-Host "  $name -> $output.png"
        }
        "Geometry" {
            $key = $KeyPrefix + (ConvertTo-PascalCase $output)
            [void]$xaml.AppendLine("    <!-- $source`: $name -->")
            [void]$xaml.AppendLine("    <Geometry x:Key=`"$key`">$($icon.ToGeometryData())</Geometry>")
            Write-Host "  $name -> $key"
        }
        "DrawingImage" {
            $key = $KeyPrefix + (ConvertTo-PascalCase $output)
            [void]$xaml.AppendLine("    <!-- $source`: $name -->")
            [void]$xaml.Append($icon.ToDrawingImageXaml($key, $xamlBrush, [bool]$KeepColors, "    ").Replace("`n", "`r`n"))
            Write-Host "  $name -> $key"
        }
    }
    foreach ($warning in ($icon.Warnings | Select-Object -Unique)) { Write-Warning "$name`: $warning" }
}

if ($Format -ne "Png") {
    if ($XamlOut) {
        $header = "<!-- Generated by scripts/render-icons.ps1 from $source. Re-run it instead of editing by hand. -->`r`n" +
                  "<ResourceDictionary xmlns=`"http://schemas.microsoft.com/winfx/2006/xaml/presentation`"`r`n" +
                  "                    xmlns:x=`"http://schemas.microsoft.com/winfx/2006/xaml`">`r`n"
        New-Item -ItemType Directory -Force (Split-Path $XamlOut) | Out-Null
        [System.IO.File]::WriteAllText($XamlOut, $header + $xaml.ToString() + "</ResourceDictionary>`r`n", (New-Object System.Text.UTF8Encoding $false))
        Write-Host "Wrote $XamlOut"
    }
    else {
        Write-Output $xaml.ToString()
    }
}
