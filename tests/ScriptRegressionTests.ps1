# Exercises the real packaging/deployment scripts against scratch files and mocked Playnite processes/Toolbox.
[CmdletBinding()]
param([ValidateSet("All", "PluginZip", "PortableDeploy", "BuildRestart", "ThemeDefaults", "TemplateText")] [string]$Case = "All")

$ErrorActionPreference = "Stop"
$repoRoot = Split-Path $PSScriptRoot -Parent
$scratch = Join-Path ([IO.Path]::GetTempPath()) ("audit-script-tests-" + [guid]::NewGuid().ToString("N"))
$originalEnv = @{}
foreach ($name in @("APPDATA", "LOCALAPPDATA", "CI", "OS")) {
    $originalEnv[$name] = [Environment]::GetEnvironmentVariable($name, "Process")
}

function Assert-Equal($Expected, $Actual, [string]$Message) {
    if ($Expected -cne $Actual) { throw "${Message}: expected '$Expected', got '$Actual'." }
}

try {
    $scripts = Join-Path $scratch "scripts"
    New-Item -ItemType Directory -Path $scripts -Force | Out-Null
    foreach ($file in @("package-release.ps1", "build-theme.ps1", "build-plugin.ps1")) {
        Copy-Item -LiteralPath (Join-Path $repoRoot "scripts/$file") -Destination $scripts
    }
    $lib = Join-Path $scripts "lib"
    New-Item -ItemType Directory -Path $lib | Out-Null
    Copy-Item -LiteralPath (Join-Path $repoRoot "scripts/lib/playnite-runtime.ps1") -Destination $lib
    # Only profile resolution and external side effects are replaced. The scripts under test are unchanged copies.
    @'
$script:fixtureRoot = Split-Path (Split-Path $PSScriptRoot -Parent) -Parent
function Get-RepoRoot { $script:fixtureRoot }
function Join-RepoPath([string]$Path) { Join-Path $script:fixtureRoot $Path }
function Get-ExtensionProfile([string]$Extension) {
    [pscustomobject]@{ slug = "fixture"; kind = $(if ($Extension -eq "plugin") { "plugin" } else { "theme" });
        outputPath = "build"; project = "fixture.csproj"; installerManifest = "installer.yaml"; databaseManifest = "addon.yaml" }
}
function Get-ExtensionKind($Profile) { $Profile.kind }
function Get-ExtensionManifestInfo($Profile) {
    @{ Version = "1.0.0"; Name = "Fixture"; Id = "FixtureTheme"; Module = "Fixture.dll"; Mode = "Desktop" }
}
function Get-ExtensionOutputPath($Profile, $Configuration) { "build" }
function Get-PlayniteToolboxExe($ToolboxExe, [switch]$Download) { $ToolboxExe }
function Get-ExpectedPackageUrl($Profile, $AddonId, $Version) { "https://example.invalid/fixture.pext" }
function Get-ExtensionReleaseTag($Profile, $Version) { "fixture-v$Version" }
function Get-YamlScalar($Lines, $Key) {
    foreach ($line in $Lines) { if ($line -match ('^' + [regex]::Escape($Key) + ':\s*(.+)$')) { return $Matches[1].Trim() } }
    ""
}
'@ | Set-Content -LiteralPath (Join-Path $lib "extension-profiles.ps1")
    @'
param($Extension, $Mode, $Configuration, [switch]$RequireBuildOutput)
'@ | Set-Content -LiteralPath (Join-Path $scripts "validate-extension.ps1")

    if ($Case -in @("All", "PluginZip")) {
        $build = Join-Path $scratch "build"
        New-Item -ItemType Directory -Path (Join-Path $build "Localization"), (Join-Path $build "fonts") -Force | Out-Null
        $runtimeFiles = @("extension.yaml", "Fixture.dll", "icon.png", "Localization/en_US.xaml", "fonts/icons.ttf", "fonts/LICENSE.txt")
        foreach ($file in $runtimeFiles) { Set-Content -LiteralPath (Join-Path $build $file) -Value "fixture" }
        Set-Content -LiteralPath (Join-Path $build "extension.yaml") -Value "Id: FixtureTheme`r`nVersion: 1.0.0`r`n"
        Set-Content -LiteralPath (Join-Path $scratch "installer.yaml") -Value "fixture"
        Set-Content -LiteralPath (Join-Path $scratch "addon.yaml") -Value "fixture"
        @'
param($Command, $BuildOutput, $ReleaseDrop)
if ($Command -ne "pack" -or -not (Test-Path (Join-Path $BuildOutput "Localization/en_US.xaml"))) {
    throw "Unexpected Toolbox input."
}
Set-Content -LiteralPath (Join-Path $ReleaseDrop "fixture.pext") -Value "packed"
$global:LASTEXITCODE = 0
'@ | Set-Content -LiteralPath (Join-Path $scripts "toolbox.ps1")
        & (Join-Path $scripts "package-release.ps1") -Extension plugin -ToolboxExe (Join-Path $scripts "toolbox.ps1")
        Add-Type -AssemblyName System.IO.Compression.FileSystem
        $zip = [IO.Compression.ZipFile]::OpenRead((Join-Path $scratch "artifacts/releases/fixture/fixture-1.0.0.zip"))
        try {
            $entries = @($zip.Entries | ForEach-Object { $_.FullName.Replace('\', '/') })
            foreach ($file in $runtimeFiles) {
                if ($file -cnotin $entries) { throw "Plugin ZIP is missing runtime resource '$file'. Entries: $($entries -join ', ')" }
            }
        }
        finally { $zip.Dispose() }
        Write-Host "PASS: plugin ZIP contains all runtime resources."

        Set-Content -LiteralPath (Join-Path $build "extension.yaml") -Value "Id: FixtureTheme`r`nVersion: 0.9.0`r`n"
        $stale = $false
        try { & (Join-Path $scripts "package-release.ps1") -Extension plugin -ToolboxExe (Join-Path $scripts "toolbox.ps1") }
        catch { $stale = $true }
        Assert-Equal $true $stale "Stale build drop version is rejected"
        Write-Host "PASS: package-release rejects a drop whose version disagrees with the source."

        @'
param($Command, $What, $Path)
Write-Output "Verifying $What manifest $Path ..."
if ($What -eq "addon") {
    Write-Output "Addon manifest passed verification."
    $global:LASTEXITCODE = 0
    return
}
Write-Output "Package > PackageUrl doesn't point to reachable HTTP location."
Write-Output "https://example.invalid/fixture.pext"
if (Test-Path -LiteralPath "$Path.error") { Write-Output "Changelog is missing" }
Write-Output "Installer manifest didn't pass verification."
$global:LASTEXITCODE = 1
'@ | Set-Content -LiteralPath (Join-Path $scripts "toolbox.ps1")
        $toolbox = Join-Path $scripts "toolbox.ps1"
        $extraError = Join-Path $scratch "installer.yaml.error"
        Set-Content -LiteralPath $extraError -Value "fixture"
        $mixed = $false
        try {
            & (Join-Path $scripts "package-release.ps1") -Extension plugin -ToolboxExe $toolbox -VerifyOnly -AllowUnpublishedPackageUrl
        } catch { $mixed = $_.Exception.Message -eq "Installer manifest verification failed." }
        Assert-Equal $true $mixed "Unreachable PackageUrl does not hide another verification error"
        Remove-Item -LiteralPath $extraError
        $strict = $false
        try {
            & (Join-Path $scripts "package-release.ps1") -Extension plugin -ToolboxExe $toolbox -VerifyOnly
        } catch { $strict = $_.Exception.Message -eq "Installer manifest verification failed." }
        Assert-Equal $true $strict "Strict verification rejects unreachable PackageUrl"
        & (Join-Path $scripts "package-release.ps1") -Extension plugin -ToolboxExe $toolbox -VerifyOnly -AllowUnpublishedPackageUrl
        Write-Host "PASS: only prerelease verification allows a standalone unreachable PackageUrl."
    }

    if ($Case -in @("All", "PortableDeploy")) {
        $realThemeTools = (Join-Path $repoRoot "scripts/lib/theme-tools.ps1").Replace("'", "''")
        @"
. '$realThemeTools'
"@ | Set-Content -LiteralPath (Join-Path $lib "theme-tools.ps1")
        @'
function Invoke-ThemeBuild($Profile, $OutDir) {
    New-Item -ItemType Directory -Path $OutDir -Force | Out-Null
    Set-Content -LiteralPath (Join-Path $OutDir "theme.yaml") -Value "fixture theme"
}
function Test-ThemeBuild($Directory, $Mode) { @() }
function Get-ThemeMissingRequiredKeys($Directory) { @() }
function Get-PlayniteProcess($Mode) { @() }
function Stop-PlayniteApp($PlayniteExe) {
    Set-Content -LiteralPath (Join-Path $script:fixtureRoot "stopped.txt") -Value $PlayniteExe
}
function Start-PlayniteApp($PlayniteExe, $Mode, $DataPath) {
    @{ Exe = $PlayniteExe; Data = $DataPath } | ConvertTo-Json |
        Set-Content -LiteralPath (Join-Path $script:fixtureRoot "launched.json")
    $true
}
'@ | Add-Content -LiteralPath (Join-Path $lib "theme-tools.ps1")
        $env:APPDATA = Join-Path $scratch "Roaming"
        $env:LOCALAPPDATA = Join-Path $scratch "Local"
        $env:CI = $null
        $env:OS = "Windows_NT"
        $installed = Join-Path $env:APPDATA "Playnite"
        $installedExe = Join-Path $env:LOCALAPPDATA "Playnite/Playnite.DesktopApp.exe"
        $portable = Join-Path $scratch "Portable"
        $portableThemes = Join-Path $portable "Themes"
        $portableExe = Join-Path $portable "Playnite.DesktopApp.exe"
        New-Item -ItemType Directory -Path $installed, (Split-Path $installedExe -Parent), $portableThemes -Force | Out-Null
        Set-Content -LiteralPath $installedExe -Value "dummy; never executed"
        Set-Content -LiteralPath $portableExe -Value "dummy; never executed"
        foreach ($useDataPath in @($false, $true)) {
            Set-Content -LiteralPath (Join-Path $installed "config.json") -Value '{"Theme":"installed-before"}'
            Set-Content -LiteralPath (Join-Path $portable "config.json") -Value '{"Theme":"portable-before"}'
            $arguments = @{ Extension = "theme"; Launch = $true }
            if ($useDataPath) { $arguments.DataPath = $portable }
            else { $arguments.DeployPath = $portableThemes }
            # Any recursive deployment replacement is confined to this known scratch root.
            $target = [IO.Path]::GetFullPath((Join-Path $portableThemes "Desktop/FixtureTheme"))
            if (-not $target.StartsWith([IO.Path]::GetFullPath($scratch) + [IO.Path]::DirectorySeparatorChar)) {
                throw "Deployment target escaped scratch."
            }
            & (Join-Path $scripts "build-theme.ps1") @arguments
            Assert-Equal "FixtureTheme" (Get-Content (Join-Path $portable "config.json") -Raw | ConvertFrom-Json).Theme "Portable config"
            Assert-Equal "installed-before" (Get-Content (Join-Path $installed "config.json") -Raw | ConvertFrom-Json).Theme "Installed config"
            $launched = Get-Content (Join-Path $scratch "launched.json") -Raw | ConvertFrom-Json
            Assert-Equal $portableExe $launched.Exe "Restart executable"
            Assert-Equal $portable $launched.Data "Restart data path"
            Assert-Equal $false (Test-Path (Join-Path $scratch "stopped.txt")) "Closed Playnite does not need shutdown"
            Assert-Equal "fixture theme" (Get-Content (Join-Path $target "theme.yaml") -Raw).Trim() "Deployed files"
        }
        Write-Host "PASS: portable deployment, activation and restart share the explicit target."

        Set-Content -LiteralPath (Join-Path $installed "config.json") -Value '{"Theme":"installed-before"}'
        if (Test-Path (Join-Path $scratch "stopped.txt")) { Remove-Item -LiteralPath (Join-Path $scratch "stopped.txt") }
        $orphanThemes = Join-Path $scratch "OrphanThemes"
        New-Item -ItemType Directory -Path $orphanThemes -Force | Out-Null
        $rejected = $false
        try { & (Join-Path $scripts "build-theme.ps1") -Extension theme -DeployPath $orphanThemes -Launch }
        catch { $rejected = $true }
        Assert-Equal $true $rejected "Unresolved DeployPath is rejected"
        Assert-Equal "installed-before" (Get-Content (Join-Path $installed "config.json") -Raw | ConvertFrom-Json).Theme "Unresolved DeployPath leaves the default install"
        Assert-Equal $false (Test-Path (Join-Path $scratch "stopped.txt")) "Unresolved DeployPath does not stop Playnite"
        Write-Host "PASS: unresolved DeployPath does not restart the default install."
    }

    if ($Case -in @("All", "BuildRestart")) {
        $realThemeTools = (Join-Path $repoRoot "scripts/lib/theme-tools.ps1").Replace("'", "''")
        ". '$realThemeTools'" | Set-Content -LiteralPath (Join-Path $lib "theme-tools.ps1")
        @'
function Get-PlayniteProcess($Mode = "Any", $InstallPath = "") {
    @($global:fixtureProcesses | Where-Object {
        ($Mode -eq "Any" -or $_.ProcessName -eq "Playnite.${Mode}App" -or $_.ProcessName -eq "Playnite.BrowserProcess") -and
        (-not $InstallPath -or (Split-Path $_.Path -Parent) -ieq $InstallPath)
    })
}
function Stop-PlayniteApp($PlayniteExe, $DataPath) {
    Add-Content -LiteralPath $global:fixtureLog -Value "stop:$PlayniteExe"
    if ($global:fixtureLockedDll) { $global:fixtureLockedDll.Dispose(); $global:fixtureLockedDll = $null }
    $directory = Split-Path $PlayniteExe -Parent
    $global:fixtureProcesses = @($global:fixtureProcesses | Where-Object { (Split-Path $_.Path -Parent) -ine $directory })
}
function Start-PlayniteApp($PlayniteExe, $Mode, $DataPath) {
    Add-Content -LiteralPath $global:fixtureLog -Value "start:${Mode}:$PlayniteExe"
    $global:fixtureProcesses += [pscustomobject]@{ ProcessName = "Playnite.${Mode}App"; Path = $PlayniteExe }
    $true
}
function Invoke-ThemeBuild($Profile, $OutDir) {
    Add-Content -LiteralPath $global:fixtureLog -Value "theme-build"
    New-Item -ItemType Directory -Path $OutDir -Force | Out-Null
    Set-Content -LiteralPath (Join-Path $OutDir "theme.yaml") -Value "fixture theme"
}
function Test-ThemeBuild($Directory, $Mode) { @() }
function Get-ThemeMissingRequiredKeys($Directory) { @() }
'@ | Add-Content -LiteralPath (Join-Path $lib "theme-tools.ps1")
        function dotnet {
            Add-Content -LiteralPath $global:fixtureLog -Value "plugin-build"
            $global:LASTEXITCODE = $(if ($global:fixtureBuildFails) { 1 } else { 0 })
        }
        $env:OS = "Windows_NT"
        $env:CI = $null
        $env:APPDATA = Join-Path $scratch "Roaming"
        $env:LOCALAPPDATA = Join-Path $scratch "Local"
        $portable = Join-Path $scratch "BuildPortable"
        $desktopExe = Join-Path $portable "Playnite.DesktopApp.exe"
        $fullscreenExe = Join-Path $portable "Playnite.FullscreenApp.exe"
        $installedExe = Join-Path $env:LOCALAPPDATA "Playnite/Playnite.DesktopApp.exe"
        $build = Join-Path $scratch "build"
        New-Item -ItemType Directory -Path $portable, (Split-Path $installedExe -Parent), (Join-Path $build "Localization"), (Join-Path $build "fonts") -Force | Out-Null
        foreach ($exe in @($desktopExe, $fullscreenExe, $installedExe)) { Set-Content -LiteralPath $exe -Value "fixture; never executed" }
        Set-Content -LiteralPath (Join-Path $portable "config.json") -Value '{"Theme":"before"}'
        foreach ($file in @("Fixture.dll", "Localization/en_US.xaml", "fonts/icons.ttf")) { Set-Content -LiteralPath (Join-Path $build $file) -Value "new runtime" }
        Set-Content -LiteralPath (Join-Path $build "extension.yaml") -Value "Id: FixtureTheme"
        $deployed = Join-Path $portable "Extensions/existing-plugin-directory"
        New-Item -ItemType Directory -Path $deployed -Force | Out-Null
        Set-Content -LiteralPath (Join-Path $deployed "extension.yaml") -Value "Id: FixtureTheme"
        Set-Content -LiteralPath (Join-Path $deployed "stale.txt") -Value "remove on deployment"
        $global:fixtureLog = Join-Path $scratch "build-events.txt"
        $global:fixtureBuildFails = $false
        function Reset-Fixture([string]$Mode = "Closed") {
            Set-Content -LiteralPath $global:fixtureLog -Value "" -NoNewline
            $global:fixtureProcesses = @()
            if ($Mode -ne "Closed") {
                $global:fixtureProcesses = @([pscustomobject]@{
                    ProcessName = "Playnite.${Mode}App";
                    Path = $(if ($Mode -eq "Fullscreen") { $fullscreenExe } else { $desktopExe })
                })
            }
        }
        function Assert-Events([string]$Expected) {
            $actual = @((Get-Content -LiteralPath $global:fixtureLog) | Where-Object { $_ }) -join "|"
            Assert-Equal $Expected $actual "Build/deploy lifecycle"
        }

        Reset-Fixture Fullscreen
        $global:fixtureProcesses += [pscustomobject]@{ ProcessName = "Playnite.DesktopApp"; Path = $installedExe }
        & (Join-Path $scripts "build-plugin.ps1") -Extension plugin
        Assert-Events "plugin-build|stop:$fullscreenExe|start:Fullscreen:$fullscreenExe"
        foreach ($file in @("Fixture.dll", "Localization/en_US.xaml", "fonts/icons.ttf")) {
            Assert-Equal "new runtime" (Get-Content -LiteralPath (Join-Path $deployed $file) -Raw).Trim() "Deployed runtime $file"
        }
        Assert-Equal $false (Test-Path -LiteralPath (Join-Path $deployed "stale.txt")) "Stale deployed files removed"
        Assert-Equal $false (Test-Path -LiteralPath (Join-Path $portable "Extensions/FixtureTheme")) "Existing plugin folder reused"
        Assert-Equal 1 @($global:fixtureProcesses | Where-Object { $_.Path -eq $installedExe }).Count "Other installation stays open"

        Reset-Fixture Desktop
        $global:fixtureLockedDll = [IO.File]::Open((Join-Path $scratch "artifacts/builds/fixture/Fixture.dll"),
            [IO.FileMode]::Open, [IO.FileAccess]::Read, [IO.FileShare]::Read)
        try { & (Join-Path $scripts "build-plugin.ps1") -Extension plugin -DataPath $portable }
        finally { if ($global:fixtureLockedDll) { $global:fixtureLockedDll.Dispose(); $global:fixtureLockedDll = $null } }
        Assert-Events "plugin-build|stop:$desktopExe|start:Desktop:$desktopExe"

        Reset-Fixture
        & (Join-Path $scripts "build-plugin.ps1") -Extension plugin -DataPath $portable
        Assert-Events "plugin-build"
        Reset-Fixture Desktop
        $global:fixtureLockedDll = [IO.File]::Open((Join-Path $scratch "artifacts/builds/fixture/Fixture.dll"),
            [IO.FileMode]::Open, [IO.FileAccess]::Read, [IO.FileShare]::Read)
        try { & (Join-Path $scripts "build-plugin.ps1") -Extension plugin -NoDeploy }
        finally { $global:fixtureLockedDll.Dispose(); $global:fixtureLockedDll = $null }
        Assert-Events "plugin-build"
        Reset-Fixture Desktop
        $failed = $false
        try { & (Join-Path $scripts "build-plugin.ps1") -Extension plugin -DataPath $portable -NoRestart } catch { $failed = $true }
        Assert-Equal $true $failed "Running plugin deployment requires restart"
        Assert-Events "plugin-build"
        $global:fixtureBuildFails = $true
        $failed = $false
        try { & (Join-Path $scripts "build-plugin.ps1") -Extension plugin -DataPath $portable } catch { $failed = $true }
        Assert-Equal $true $failed "Build failure is reported"
        Assert-Events "plugin-build|plugin-build"
        $global:fixtureBuildFails = $false

        Reset-Fixture Desktop
        $failed = $false
        try {
            # A destination inside the build drop is rejected before any recursive replacement.
            & (Join-Path $scripts "build-plugin.ps1") -Extension plugin -DataPath $portable -DeployPath (Join-Path $scratch "artifacts/builds/fixture")
        } catch { $failed = $true }
        Assert-Equal $true $failed "Unsafe/failed deployment is reported"
        Assert-Events "plugin-build|stop:$desktopExe|start:Desktop:$desktopExe"
        Assert-Equal $true (Test-Path -LiteralPath (Join-Path $scratch "artifacts/builds/fixture/Fixture.dll")) "Rejected deployment preserves source"

        Reset-Fixture Desktop
        Set-Content -LiteralPath (Join-Path $deployed "a-keep.txt") -Value "keep"
        $global:fixtureInstallLock = [IO.File]::Open((Join-Path $deployed "z-locked.bin"),
            [IO.FileMode]::Create, [IO.FileAccess]::ReadWrite, [IO.FileShare]::None)
        # Windows refuses to rename a folder holding an exclusively open file. Unix locks are advisory, so the
        # swap would succeed there; refuse the same rename of the installed folder instead. ($env:OS is faked above.)
        $simulateLock = [Environment]::OSVersion.Platform -ne [PlatformID]::Win32NT
        $global:fixtureLockedFolder = [IO.Path]::GetFullPath($deployed)
        $global:fixtureLockHit = $false
        if ($simulateLock) {
            function Rename-Item {
                if ($args -contains $global:fixtureLockedFolder) { $global:fixtureLockHit = $true; throw "Simulated locked install: $($global:fixtureLockedFolder)" }
                Microsoft.PowerShell.Management\Rename-Item @args
            }
        }
        $failed = $false
        try { & (Join-Path $scripts "build-plugin.ps1") -Extension plugin -DataPath $portable }
        catch { $failed = $true }
        finally {
            $global:fixtureInstallLock.Dispose(); $global:fixtureInstallLock = $null
            if ($simulateLock) { Remove-Item -LiteralPath Function:\Rename-Item }
        }
        Assert-Equal $true $failed "Locked install file fails the deploy"
        Assert-Equal $simulateLock $global:fixtureLockHit "Simulated lock refused the installed folder swap"
        Assert-Equal "keep" (Get-Content -LiteralPath (Join-Path $deployed "a-keep.txt") -Raw).Trim() "Failed deploy keeps the previous install"
        Assert-Events "plugin-build|stop:$desktopExe|start:Desktop:$desktopExe"

        Reset-Fixture Desktop
        $env:CI = "true"
        & (Join-Path $scripts "build-plugin.ps1") -Extension plugin -DataPath $portable
        Assert-Events "plugin-build"
        & (Join-Path $scripts "build-theme.ps1") -Extension theme -DataPath $portable
        Assert-Events "plugin-build|theme-build"
        $env:CI = $null
        Reset-Fixture
        $global:fixtureProcesses = @([pscustomobject]@{ ProcessName = "Playnite.BrowserProcess"; Path = (Join-Path $portable "Playnite.BrowserProcess.exe") })
        & (Join-Path $scripts "build-plugin.ps1") -Extension plugin -DataPath $portable
        Assert-Events "plugin-build"
        & (Join-Path $scripts "build-theme.ps1") -Extension theme -DataPath $portable
        Assert-Events "plugin-build|theme-build"

        Reset-Fixture Fullscreen
        & (Join-Path $scripts "build-theme.ps1") -Extension theme
        Assert-Events "theme-build|stop:$fullscreenExe|start:Fullscreen:$fullscreenExe"
        Assert-Equal "FixtureTheme" (Get-Content (Join-Path $portable "config.json") -Raw | ConvertFrom-Json).Theme "Default theme activation"
        Set-Content -LiteralPath (Join-Path $portable "config.json") -Value '{"Theme":"before"}'
        Reset-Fixture
        & (Join-Path $scripts "build-theme.ps1") -Extension theme -Deploy -DataPath $portable
        Assert-Events "theme-build"
        Assert-Equal "FixtureTheme" (Get-Content (Join-Path $portable "config.json") -Raw | ConvertFrom-Json).Theme "Explicit -Deploy also activates theme"
        Reset-Fixture
        & (Join-Path $scripts "build-theme.ps1") -Extension theme -Restart -DataPath $portable
        Assert-Events "theme-build"
        Reset-Fixture Desktop
        & (Join-Path $scripts "build-theme.ps1") -Extension theme -NoDeploy
        Assert-Events "theme-build"
        Reset-Fixture Desktop
        & (Join-Path $scripts "build-theme.ps1") -Extension theme -NoRestart -DataPath $portable
        Assert-Events "theme-build"

        $installedData = Join-Path $env:APPDATA "Playnite"
        $customExe = Join-Path $scratch "CustomInstall/Playnite.DesktopApp.exe"
        New-Item -ItemType Directory -Path $installedData, (Split-Path $customExe -Parent) -Force | Out-Null
        Set-Content -LiteralPath (Join-Path $installedData "config.json") -Value '{"Theme":"installed"}'
        Set-Content -LiteralPath $customExe -Value "fixture; never executed"
        Reset-Fixture
        $global:fixtureProcesses = @([pscustomobject]@{ ProcessName = "Playnite.DesktopApp"; Path = $customExe })
        & (Join-Path $scripts "build-plugin.ps1") -Extension plugin -DataPath $installedData
        Assert-Events "plugin-build|stop:$customExe|start:Desktop:$customExe"
        Write-Host "PASS: automatic deployment/restart, closed apps, failures, opt-outs, portable paths and preserved modes."
    }

    if ($Case -in @("All", "ThemeDefaults")) {
        $themeScratch = Join-Path $scratch "theme-defaults"
        $themeInfo = Join-Path $themeScratch "info"
        $themeSrc = Join-Path $themeScratch "src"
        $themeDrop = Join-Path $themeScratch "out"
        New-Item -ItemType Directory -Path $themeInfo, (Join-Path $themeSrc "DefaultControls"), (Join-Path $themeSrc "CustomControls") -Force | Out-Null
        Set-Content -LiteralPath (Join-Path $themeInfo "theme.yaml") -Value "Id: DefaultsTestTheme`r`nName: Defaults Test`r`nVersion: 1.0.0`r`nMode: Desktop`r`n"
        Set-Content -LiteralPath (Join-Path $themeSrc "tokens.css") -Value ":root { --height: 32px; }"
        Set-Content -LiteralPath (Join-Path $themeSrc "Constants.xaml") -Value '<ResourceDictionary xmlns="http://schemas.microsoft.com/winfx/2006/xaml/presentation" xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml"></ResourceDictionary>'
        Set-Content -LiteralPath (Join-Path $themeSrc "DefaultControls/Expander.xaml") -Value '<ResourceDictionary xmlns="http://schemas.microsoft.com/winfx/2006/xaml/presentation" xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml"><!-- custom-expander --></ResourceDictionary>'
        Set-Content -LiteralPath (Join-Path $themeSrc "CustomControls/ComboBoxList.template.xaml") -Value '<ResourceDictionary xmlns="http://schemas.microsoft.com/winfx/2006/xaml/presentation" xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml"><!-- custom-combobox-template --></ResourceDictionary>'
        Set-Content -LiteralPath (Join-Path $themeSrc "Common.xaml") -Value '<ResourceDictionary xmlns="http://schemas.microsoft.com/winfx/2006/xaml/presentation" xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml"><ControlTemplate x:Key="LocalDemoTemplate" /></ResourceDictionary>'
        & {
            . (Join-Path $repoRoot "scripts/lib/extension-profiles.ps1")
            . (Join-Path $repoRoot "scripts/lib/theme-tools.ps1")
            function Get-RepoRoot { $themeScratch }
            $profile = [pscustomobject]@{
                kind = "theme"
                themeSource = "src"
                extensionManifest = "info/theme.yaml"
            }
            Invoke-ThemeBuild -Profile $profile -OutDir $themeDrop | Out-Null
            $buildErrors = @(Test-ThemeBuild -Directory $themeDrop -Mode Desktop)
            Assert-Equal 0 $buildErrors.Count "Local* decorative key passes Test-ThemeBuild: $($buildErrors -join '; ')"
            Set-Content -LiteralPath (Join-Path $themeDrop "Common.xaml") -Value '<ResourceDictionary xmlns="http://schemas.microsoft.com/winfx/2006/xaml/presentation" xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml"><ControlTemplate x:Key="UnregisteredCustomTemplate" /></ResourceDictionary>'
            $unregisteredErrors = @(Test-ThemeBuild -Directory $themeDrop -Mode Desktop)
            Assert-Equal $true ($unregisteredErrors.Count -gt 0) "Non-Local unregistered key is still rejected by Test-ThemeBuild"
        }
        foreach ($defaultRel in @(
            "CustomControls/SliderEx.xaml",
            "CustomControls/GameMenu.xaml",
            "CustomControls/GameGroupMenu.xaml",
            "CustomControls/TrayContextMenu.xaml",
            "CustomControls/NumericBoxes.xaml",
            "CustomControls/PathSelectionBox.xaml",
            "CustomControls/FilterSelectionBox.xaml",
            "DefaultControls/DatePicker.xaml",
            "Views/LibraryGridView.xaml"
        )) {
            Assert-Equal $true (Test-Path -LiteralPath (Join-Path $themeDrop $defaultRel)) "Injected default $defaultRel"
        }
        $expanderOut = Get-Content -Raw -LiteralPath (Join-Path $themeDrop "DefaultControls/Expander.xaml")
        Assert-Equal $true ($expanderOut.Contains("custom-expander")) "Theme override Expander.xaml wins over shared default"
        $comboOut = Get-Content -Raw -LiteralPath (Join-Path $themeDrop "CustomControls/ComboBoxList.xaml")
        Assert-Equal $true ($comboOut.Contains("custom-combobox-template")) "Theme template ComboBoxList.template.xaml wins over shared default"
        Write-Host "PASS: Invoke-ThemeBuild supplies missing shared defaults and preserves theme overrides."
    }

    if ($Case -in @("All", "TemplateText")) {
        # {{text:}} renders a CSS font stack as a WPF FontFamily string. Stormrift's "Sora", "Segoe UI" used to build
        # as Sora&quot;, &quot;Segoe UI because only the value's outer quotes were dropped.
        $textScratch = Join-Path $scratch "template-text"
        New-Item -ItemType Directory -Path $textScratch -Force | Out-Null
        $textTokens = Join-Path $textScratch "tokens.css"
        Set-Content -LiteralPath $textTokens -Value @'
:root {
  --double: "Sora", "Segoe UI";
  --mixed: Sora, "Segoe UI";
  --single: 'Belwe Bd BT',  'Georgia' ;
  --one: "Segoe UI";
  --plain: Verdana, Tahoma, Arial;
  --amp: "A&B Sans", Georgia;
}
'@
        $rendered = & {
            . (Join-Path $repoRoot "scripts/lib/extension-profiles.ps1")
            . (Join-Path $repoRoot "scripts/lib/theme-tools.ps1")
            $tokens = Read-ThemeTokens -Path $textTokens
            @{
                Double   = Expand-ThemeTemplate -Tokens $tokens -Template './Typography/#Sora, {{text:double|Sora}}, Segoe UI'
                Mixed    = Expand-ThemeTemplate -Tokens $tokens -Template '{{text:mixed}}'
                Single   = Expand-ThemeTemplate -Tokens $tokens -Template '{{ text:single|Georgia }}'
                One      = Expand-ThemeTemplate -Tokens $tokens -Template '{{text:one}}'
                Plain    = Expand-ThemeTemplate -Tokens $tokens -Template '{{text:plain}}'
                Amp      = Expand-ThemeTemplate -Tokens $tokens -Template '{{text:amp}}'
                Fallback = Expand-ThemeTemplate -Tokens $tokens -Template '{{text:missing|"Bahnschrift SemiCondensed",Arial Narrow}}'
            }
        }
        Assert-Equal "./Typography/#Sora, Sora, Segoe UI, Segoe UI" $rendered.Double "Quoted multi-name stack"
        Assert-Equal "Sora, Segoe UI" $rendered.Mixed "Stack with one quoted name last"
        Assert-Equal "Belwe Bd BT, Georgia" $rendered.Single "Single-quoted stack with extra spaces"
        Assert-Equal "Segoe UI" $rendered.One "Single quoted name"
        Assert-Equal "Verdana, Tahoma, Arial" $rendered.Plain "Unquoted stack stays as written"
        Assert-Equal "A&amp;B Sans, Georgia" $rendered.Amp "Names stay XML-escaped"
        Assert-Equal "Bahnschrift SemiCondensed, Arial Narrow" $rendered.Fallback "Fallback stack is normalized the same way"
        Write-Host "PASS: {{text:}} renders quoted CSS font stacks as clean WPF FontFamily strings."
    }
}
finally {
    foreach ($name in $originalEnv.Keys) {
        [Environment]::SetEnvironmentVariable($name, $originalEnv[$name], "Process")
    }
    $resolvedScratch = [IO.Path]::GetFullPath($scratch)
    $tempRoot = [IO.Path]::GetFullPath([IO.Path]::GetTempPath()).TrimEnd('\', '/') + [IO.Path]::DirectorySeparatorChar
    if (-not $resolvedScratch.StartsWith($tempRoot) -or (Split-Path $resolvedScratch -Leaf) -notlike "audit-script-tests-*") {
        throw "Refusing to clean an unexpected scratch path: $resolvedScratch"
    }
    if (Test-Path $resolvedScratch) { Remove-Item -LiteralPath $resolvedScratch -Recurse -Force }
}
