<#
.SYNOPSIS
Draws a Playnite add-on icon in the danitesler.com/projects tile style.

.DESCRIPTION
Dark rounded square, hairline inset outline, flat mark, glow only in the background.
This is the add-on icon (src/<AddOn>/info/icon.png), not the theme menu icons from
scripts/render-icons.ps1.

  .\scripts\render-addon-icon.ps1 -Svg logo.svg -Extension mytheme
  .\scripts\render-addon-icon.ps1 -Svg logo.svg -Out src\themes\MyTheme\info\icon.png

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
. (Join-Path $PSScriptRoot "lib/extension-profiles.ps1")

if (-not (Test-Path $Svg)) { throw "No such file: $Svg" }
if ($Extension -and -not $Out) {
    $Out = Join-RepoPath "$((Get-ExtensionProfile -Extension $Extension).dir)/info/icon.png"
}
if (-not $Out) { throw "Pass -Out or -Extension." }

$python = @(
    (Get-Command python3 -ErrorAction SilentlyContinue),
    (Get-Command python -ErrorAction SilentlyContinue),
    (Get-Command py -ErrorAction SilentlyContinue)
) | Where-Object { $_ } | Select-Object -First 1
if (-not $python) { throw "python3 is required, with Pillow installed." }

$script = Join-Path $PSScriptRoot "render-addon-icon.py"
# The Python side prints notices (e.g. "Quick Look is not available") to stderr. In Windows PowerShell 5.1 a
# captured or redirected stderr line becomes an ErrorRecord, and under "Stop" that aborts the run before the icon is
# written. Run it under "Continue", pass stderr lines on as plain messages, and judge success by the exit code only.
$previousPreference = $ErrorActionPreference
$ErrorActionPreference = "Continue"
try {
    & $python.Source $script --svg $Svg --out $Out --color $Color --mark-scale $MarkScale --size $Size 2>&1 |
        ForEach-Object {
            if ($_ -is [System.Management.Automation.ErrorRecord]) { Write-Host $_.Exception.Message }
            else { $_ }
        }
    $exitCode = $LASTEXITCODE
}
finally {
    $ErrorActionPreference = $previousPreference
}
if ($exitCode) { throw "render-addon-icon.py failed ($exitCode)" }
