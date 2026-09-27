<#
.SYNOPSIS
Draws a Playnite add-on icon in the danitesler.com/projects tile style.

.DESCRIPTION
Dark rounded square, hairline inset outline, flat mark, glow only in the background.
This is the add-on icon (src/<AddOn>/info/icon.png), not the theme menu icons from
scripts/render-icons.ps1.

  .\scripts\render-addon-icon.ps1 -Svg logo.svg -Extension mytheme
  .\scripts\render-addon-icon.ps1 -Svg logo.svg -Out src\MyTheme\info\icon.png

The SVG should be the mark only. Needs python3 and Pillow. On macOS, Quick Look
rasterizes the SVG so logo holes stay correct.
#>
[CmdletBinding()]
param(
    [Parameter(Mandatory = $true)]
    [string]$Svg,

    [string]$Extension = "",

    [string]$Out = "",

    [string]$Color = "#FF7A1A",

    [double]$MarkScale = 0.62,

    [int]$Size = 512
)

$ErrorActionPreference = "Stop"
. (Join-Path $PSScriptRoot "extension-profiles.ps1")

if (-not (Test-Path $Svg)) { throw "No such file: $Svg" }
if ($Extension -and -not $Out) {
    $profile = Get-ExtensionProfile -Extension $Extension
    $info = Split-Path (Join-RepoPath $profile.extensionManifest)
    $Out = Join-Path $info "icon.png"
}
if (-not $Out) { throw "Pass -Out or -Extension." }

$python = @(
    (Get-Command python3 -ErrorAction SilentlyContinue),
    (Get-Command python -ErrorAction SilentlyContinue),
    (Get-Command py -ErrorAction SilentlyContinue)
) | Where-Object { $_ } | Select-Object -First 1
if (-not $python) { throw "python3 is required, with Pillow installed." }

$script = Join-Path $PSScriptRoot "render-addon-icon.py"
& $python.Source $script --svg $Svg --out $Out --color $Color --mark-scale $MarkScale --size $Size
if ($LASTEXITCODE) { throw "render-addon-icon.py failed ($LASTEXITCODE)" }
