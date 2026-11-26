# Loads every XAML file of each theme's build drop the way Playnite's ThemeManager.ApplyTheme does: XamlReader.Load
# on the file stream with Playnite's own assemblies, then merges the dictionary into Application resources on top of
# the Default theme, which seals every style and template. A file that throws here makes Playnite log
# "Failed to load theme" and start on the Default theme (or crash on startup), e.g. a Setter TargetName pointing at a
# Transform, a trigger on a property the control lacks (TopPanelItem has IsToggled, not IsChecked), or
# {x:Static ScoreGroup.Positive} (the enum is ScoreRating).
# Needs Playnite installed (x86 assemblies) and build drops (build-theme.ps1 -NoDeploy). Relaunches itself under
# 32-bit Windows PowerShell, since Playnite's .NET Framework assemblies do not load into pwsh:
#   pwsh -STA -File tests/wpf/ThemeLoadRegressionTests.ps1 [-Keys canister,foldcraft]
param([string]$PlaynitePath = (Join-Path $env:LOCALAPPDATA 'Playnite'), [string[]]$Keys = @())
$root = Split-Path (Split-Path $PSScriptRoot -Parent) -Parent
$wow = Join-Path $env:WINDIR 'SysWOW64\WindowsPowerShell\v1.0\powershell.exe'
if ($PSVersionTable.PSEdition -ne 'Desktop' -or [Environment]::Is64BitProcess) {
    $relay = @('-NoProfile', '-ExecutionPolicy', 'Bypass', '-STA', '-File', $PSCommandPath, '-PlaynitePath', $PlaynitePath)
    if ($Keys.Count) { $relay += @('-Keys', ($Keys -join ',')) }
    & $wow @relay
    exit $LASTEXITCODE
}
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName PresentationFramework, PresentationCore, WindowsBase, System.Xaml
foreach ($file in @(Get-ChildItem -LiteralPath $PlaynitePath -Filter *.dll) + @(Get-Item -LiteralPath (Join-Path $PlaynitePath 'Playnite.DesktopApp.exe'))) {
    try { [Reflection.Assembly]::LoadFrom($file.FullName) | Out-Null } catch { }
}
$app = [Windows.Application]::new()
$app.ShutdownMode = 'OnExplicitShutdown'
function Read-ThemeXaml([string]$path, [string]$themeRoot) {
    $context = [Windows.Markup.ParserContext]::new()
    $context.BaseUri = [Uri]::new($path)
    $text = [IO.File]::ReadAllText($path)
    if ($themeRoot -and $text.Contains('{ThemeFile')) {
        # {ThemeFile 'x'} needs a running Playnite to find the active theme; point it at the drop's file instead,
        # which also fails a BitmapImage whose image is missing.
        $text = [regex]::Replace($text, "\{ThemeFile\s+'([^']+)'\}", {
            param($m) ([Uri]::new((Join-Path $themeRoot $m.Groups[1].Value))).AbsoluteUri
        })
    }
    $stream = [IO.MemoryStream]::new([Text.Encoding]::UTF8.GetBytes($text))
    try { [Windows.Markup.XamlReader]::Load($stream, $context) } finally { $stream.Close() }
}
# Resources PlayniteApplication adds before any theme.
$app.Resources.MergedDictionaries.Add([Windows.Markup.XamlReader]::Parse(@'
<ResourceDictionary xmlns="http://schemas.microsoft.com/winfx/2006/xaml/presentation" xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml" xmlns:sys="clr-namespace:System;assembly=mscorlib" xmlns:math="clr-namespace:HexInnovation;assembly=MathConverter" xmlns:pc="clr-namespace:Playnite.Converters;assembly=Playnite">
  <sys:Boolean x:Key="True">True</sys:Boolean>
  <sys:Boolean x:Key="False">False</sys:Boolean>
  <pc:ObjectToStringConverter x:Key="ObjectToStringConverter" />
  <pc:StringToUpperCaseConverter x:Key="StringToUpperCaseConverter" />
  <math:MathConverter x:Key="MathConverter" />
  <BooleanToVisibilityConverter x:Key="BooleanToVisibilityConverter" />
  <FontFamily x:Key="FontIcoFont">Segoe MDL2 Assets</FontFamily>
</ResourceDictionary>
'@))
foreach ($file in Get-ChildItem -LiteralPath (Join-Path $PlaynitePath 'Themes\Desktop\Default') -Recurse -Filter *.xaml) {
    try { $app.Resources.MergedDictionaries.Add((Read-ThemeXaml $file.FullName)) } catch { }
}
$themes = (Get-Content (Join-Path $root 'src/extensions.json') -Raw | ConvertFrom-Json).extensions | Where-Object kind -eq theme
if ($Keys.Count) { $themes = $themes | Where-Object key -in ($Keys -split ',') }
$failures = [Collections.Generic.List[string]]::new()
$checked = 0
foreach ($theme in $themes) {
    $drop = Join-Path $root "artifacts/builds/themes/$($theme.key)"
    if (-not (Test-Path -LiteralPath (Join-Path $drop 'theme.yaml'))) { $failures.Add("$($theme.key): no build drop at $drop (run build-theme.ps1 -NoDeploy)"); continue }
    foreach ($file in Get-ChildItem -LiteralPath $drop -Recurse -Filter *.xaml) {
        $relative = $file.FullName.Substring((Resolve-Path -LiteralPath $drop).Path.Length + 1)
        try {
            $dictionary = Read-ThemeXaml $file.FullName (Resolve-Path -LiteralPath $drop).Path
            if ($dictionary -is [Windows.ResourceDictionary]) {
                $app.Resources.MergedDictionaries.Add($dictionary)
                [void]$app.Resources.MergedDictionaries.Remove($dictionary)
            }
        } catch {
            $e = $_.Exception
            while ($e.InnerException -and -not ($e -is [Windows.Markup.XamlParseException])) { $e = $e.InnerException }
            $message = $e.Message
            if ($e.InnerException) { $message += ' (' + $e.InnerException.Message + ')' }
            $failures.Add("$($theme.key) $relative : $message")
        }
    }
    $checked++
}
if ($failures.Count) {
    $failures | ForEach-Object { Write-Host "FAIL $_" }
    Write-Host "Theme load: $($failures.Count) failure(s) across $checked theme(s)."
    exit 1
}
Write-Host "Theme load: every XAML file of $checked theme(s) loads and seals."
exit 0
