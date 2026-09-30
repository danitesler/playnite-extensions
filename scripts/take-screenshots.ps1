[CmdletBinding()]
param(
    [Parameter(Mandatory = $true)]
    [string]$Extension,

    # Playnite.DesktopApp.exe. Auto-detected (installed, then a portable copy next to -DataPath) when omitted.
    [string]$PlayniteExe = "",

    # Folder that holds config.json and Themes\. Defaults to %AppData%\Playnite; pass the portable folder for portable installs.
    [string]$DataPath = "",

    # Games views to capture, one file each. Grid -> grid.png, Details -> details.png.
    [string[]]$Views = @("Grid", "Details"),

    [int]$Width = 1600,
    [int]$Height = 900,

    # How long to let Playnite finish loading (library, covers, theme) before each capture.
    [int]$WaitSeconds = 12,

    # Where the PNGs go. Defaults to <add-on dir>\info\screenshots.
    [string]$OutDir = "",

    # Skip the build + deploy step (the theme is already deployed and current).
    [switch]$NoDeploy,

    # Close a running Playnite instead of stopping with an error.
    [switch]$CloseRunning
)

# Local Windows only. Never run this in a cloud/Linux session (repo rule: Playnite is never started on a server).
# Starts Playnite by itself, switches it to the theme, captures the main window, restores the user's settings.
# Uses Playnite's config.json keys Theme and ViewSettings.GamesViewType; if a Playnite release renames them the script
# warns and captures whatever view is showing.

$ErrorActionPreference = "Stop"
. (Join-Path $PSScriptRoot "extension-profiles.ps1")
. (Join-Path $PSScriptRoot "theme-tools.ps1")

if ($env:OS -ne "Windows_NT") {
    throw "take-screenshots.ps1 needs Windows and a local Playnite. It never runs in a cloud session (Playnite is not started on servers)."
}

$profile = Get-ExtensionProfile -Extension $Extension
if ((Get-ExtensionKind $profile) -ne "theme") {
    throw "'$Extension' is not a theme."
}

$manifest = Get-ExtensionManifestInfo -Profile $profile
$mode = if ($manifest.Mode) { $manifest.Mode } else { "Desktop" }
if ($mode -ne "Desktop") {
    throw "Only Desktop themes are supported."
}

if (-not $DataPath) { $DataPath = Join-Path $env:APPDATA "Playnite" }
if (-not $PlayniteExe) {
    $candidates = @(
        (Join-Path $env:LOCALAPPDATA "Playnite\Playnite.DesktopApp.exe"),
        (Join-Path $DataPath "Playnite.DesktopApp.exe")
    )
    $PlayniteExe = $candidates | Where-Object { Test-Path $_ } | Select-Object -First 1
}
if (-not $PlayniteExe -or -not (Test-Path $PlayniteExe)) {
    throw "Playnite.DesktopApp.exe not found. Pass -PlayniteExe <path>."
}

$configPath = Join-Path $DataPath "config.json"
if (-not (Test-Path $configPath)) { throw "Playnite config not found at $configPath. Pass -DataPath <folder with config.json>." }
if (-not $OutDir) { $OutDir = Join-Path (Join-RepoPath $profile.dir) "info\screenshots" }
New-Item -ItemType Directory -Path $OutDir -Force | Out-Null

$running = @(Get-Process -Name "Playnite.DesktopApp" -ErrorAction SilentlyContinue)
if ($running.Count -gt 0) {
    if (-not $CloseRunning) { throw "Playnite is running. Close it or pass -CloseRunning." }
    $running | ForEach-Object { $_.CloseMainWindow() | Out-Null }
    Start-Sleep -Seconds 3
    Get-Process -Name "Playnite.DesktopApp" -ErrorAction SilentlyContinue | Stop-Process -Force
}

if (-not $NoDeploy) {
    $deployRoot = Join-Path $DataPath "Themes"
    & (Join-Path $PSScriptRoot "build-theme.ps1") -Extension $Extension -Deploy -DeployPath $deployRoot
}

Add-Type -AssemblyName System.Drawing
Add-Type @"
using System;
using System.Runtime.InteropServices;
public static class PlayniteShot {
    [StructLayout(LayoutKind.Sequential)] public struct RECT { public int Left, Top, Right, Bottom; }
    [DllImport("user32.dll")] public static extern bool GetWindowRect(IntPtr h, out RECT r);
    [DllImport("user32.dll")] public static extern bool MoveWindow(IntPtr h, int x, int y, int w, int hgt, bool repaint);
    [DllImport("user32.dll")] public static extern bool SetForegroundWindow(IntPtr h);
    [DllImport("user32.dll")] public static extern bool ShowWindow(IntPtr h, int cmd);
    [DllImport("user32.dll")] public static extern bool PrintWindow(IntPtr h, IntPtr hdc, uint flags);
}
"@

function Set-JsonValue($obj, [string[]]$path, $value) {
    for ($i = 0; $i -lt $path.Length - 1; $i++) {
        if (-not ($obj.PSObject.Properties.Name -contains $path[$i])) { return $false }
        $obj = $obj.($path[$i])
    }
    $leaf = $path[-1]
    if (-not ($obj.PSObject.Properties.Name -contains $leaf)) { return $false }
    $obj.$leaf = $value
    return $true
}

function Save-WindowShot([IntPtr]$hwnd, [string]$file) {
    $r = New-Object PlayniteShot+RECT
    [PlayniteShot]::GetWindowRect($hwnd, [ref]$r) | Out-Null
    $w = $r.Right - $r.Left; $h = $r.Bottom - $r.Top
    $bmp = New-Object System.Drawing.Bitmap $w, $h
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $hdc = $g.GetHdc()
    # 2 = PW_RENDERFULLCONTENT: captures WPF/DWM-composited content.
    [PlayniteShot]::PrintWindow($hwnd, $hdc, 2) | Out-Null
    $g.ReleaseHdc($hdc); $g.Dispose()
    $bmp.Save($file, [System.Drawing.Imaging.ImageFormat]::Png)
    $bmp.Dispose()
}

$backup = "$configPath.screenshots.bak"
Copy-Item $configPath $backup -Force
$viewValues = @{ Grid = "Grid"; Details = "Standard" }

try {
    foreach ($view in $Views) {
        if (-not $viewValues.ContainsKey($view)) { throw "Unknown view '$view'. Use Grid or Details." }

        $cfg = Get-Content $backup -Raw | ConvertFrom-Json
        if (-not (Set-JsonValue $cfg @("Theme") $manifest.Id)) { Write-Warning "config.json has no Theme key; the theme may not be active." }
        if (-not (Set-JsonValue $cfg @("ViewSettings", "GamesViewType") $viewValues[$view])) {
            Write-Warning "config.json has no ViewSettings.GamesViewType; capturing whatever view Playnite opens with."
        }
        $cfg | ConvertTo-Json -Depth 32 | Set-Content $configPath -Encoding UTF8

        Write-Host "Starting Playnite ($view view)..."
        $proc = Start-Process -FilePath $PlayniteExe -ArgumentList "--hidesplashscreen" -PassThru
        $deadline = (Get-Date).AddSeconds(60)
        while ((Get-Date) -lt $deadline) {
            $proc.Refresh()
            if ($proc.MainWindowHandle -ne [IntPtr]::Zero) { break }
            Start-Sleep -Milliseconds 500
        }
        if ($proc.MainWindowHandle -eq [IntPtr]::Zero) { throw "Playnite did not open a window within 60 seconds." }

        $hwnd = $proc.MainWindowHandle
        [PlayniteShot]::ShowWindow($hwnd, 9) | Out-Null   # SW_RESTORE
        [PlayniteShot]::MoveWindow($hwnd, 40, 40, $Width, $Height, $true) | Out-Null
        [PlayniteShot]::SetForegroundWindow($hwnd) | Out-Null
        Start-Sleep -Seconds $WaitSeconds

        $file = Join-Path $OutDir ("{0}.png" -f $view.ToLowerInvariant())
        Save-WindowShot $hwnd $file
        Write-Host "Saved $file"

        $proc.CloseMainWindow() | Out-Null
        if (-not $proc.WaitForExit(15000)) { $proc | Stop-Process -Force }
        Start-Sleep -Seconds 2
    }
}
finally {
    # Playnite rewrites config.json on exit; put the user's original settings back.
    Get-Process -Name "Playnite.DesktopApp" -ErrorAction SilentlyContinue | Stop-Process -Force
    Start-Sleep -Seconds 1
    Copy-Item $backup $configPath -Force
    Remove-Item $backup -Force
}

$base = "https://raw.githubusercontent.com/danitesler/playnite-extensions/main/" + (($profile.dir -replace "\\", "/").TrimEnd("/")) + "/info/screenshots"
Write-Host ""
Write-Host "Check the images (layout, no personal games or notifications), then list them in info/danitesler_$Extension.yaml:"
Write-Host "Screenshots:"
foreach ($view in $Views) {
    $n = $view.ToLowerInvariant()
    Write-Host "  - Thumbnail: $base/$n.png"
    Write-Host "    Image: $base/$n.png"
}
Write-Host "Then add them to the GitHub Release notes and the README (see skill playnite-release)."
