# Checks and renders a theme's menus (docs/themes/menus.md). Builds a real Playnite MainMenu with Playnite's rows and a
# top bar dropdown, both styled with the theme's TopPanelMenu like Playnite does, plus a game context menu on the plain
# ContextMenu style, and a ComboBox list. Fails (exit 1) when a menu misses the theme's menu panel, when a row at any
# depth or a group break misses the theme's row / separator template, when a menu or ComboBox row is not 28-32px tall,
# or when the main menu is taller than 680px. With -Out it writes a PNG: Settings highlighted; Exit highlighted with Add
# Game's submenu open; the sort dropdown; the game menu; the ComboBox list.
# Needs Playnite installed (its x86 assemblies define MainMenu) and a build drop (build-theme.ps1 -NoDeploy):
#   C:\Windows\SysWOW64\WindowsPowerShell\v1.0\powershell.exe -NoProfile -STA -File tests\wpf\MenuRender.ps1 -Key hearthside [-Out <png>]
param(
    [Parameter(Mandatory)] [string]$Key,
    [string]$Out,
    [string]$Repo
)
if (-not $Repo) { $Repo = Split-Path (Split-Path (Split-Path $MyInvocation.MyCommand.Path -Parent) -Parent) -Parent }
$ErrorActionPreference = 'Continue'
$ext = (Get-Content (Join-Path $Repo 'src\extensions.json') -Raw | ConvertFrom-Json).extensions | Where-Object { $_.key -eq $Key }
if (-not $ext) { throw "unknown key $Key" }
$Src = Join-Path $Repo ($ext.dir + '\src')
$Drop = Join-Path $Repo "artifacts\builds\themes\$Key"
Add-Type -AssemblyName PresentationFramework, PresentationCore, WindowsBase, System.Xaml
$play = Join-Path $env:LOCALAPPDATA 'Playnite'
foreach ($n in 'MathConverter.dll', 'Playnite.SDK.dll', 'Playnite.dll', 'Playnite.DesktopApp.exe') {
    try { [Reflection.Assembly]::LoadFrom((Join-Path $play $n)) | Out-Null } catch { Write-Host "assembly $n : $($_.Exception.Message)" }
}
$app = [Windows.Application]::new()
$app.ShutdownMode = 'OnExplicitShutdown'
function Read-Xaml([string]$path) {
    $text = [IO.File]::ReadAllText($path)
    $drop = $Drop.Replace('\', '/')
    $text = [regex]::Replace($text, "\{ThemeFile\s+'([^']+)'\}", { param($m) 'file:///' + $drop + '/' + $m.Groups[1].Value })
    $text = [regex]::Replace($text, '<MultiDataTrigger>(?:(?!</MultiDataTrigger>).)*?\{Settings(?:(?!</MultiDataTrigger>).)*</MultiDataTrigger>', '', 'Singleline')
    $text = [regex]::Replace($text, '<DataTrigger\s+Binding="\{Settings[^>]*>(?:(?!</DataTrigger>).)*</DataTrigger>', '', 'Singleline')
    $text = $text.Replace('./Typography/#', 'file:///' + $Src.Replace('\', '/') + '/Typography/#')
    [regex]::Replace($text, '\{Settings\s+[^}]+\}', '0')
}
$globals = @'
<ResourceDictionary xmlns="http://schemas.microsoft.com/winfx/2006/xaml/presentation" xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml" xmlns:math="clr-namespace:HexInnovation;assembly=MathConverter" xmlns:pc="clr-namespace:Playnite.Converters;assembly=Playnite">
  <pc:ObjectToStringConverter x:Key="ObjectToStringConverter" />
  <pc:StringToUpperCaseConverter x:Key="StringToUpperCaseConverter" />
  <math:MathConverter x:Key="MathConverter" />
  <BooleanToVisibilityConverter x:Key="BooleanToVisibilityConverter" />
  <FontFamily x:Key="FontIcoFont">Segoe MDL2 Assets</FontFamily>
  <Style x:Key="SimpleButton" TargetType="Button" />
</ResourceDictionary>
'@
$app.Resources.MergedDictionaries.Add([Windows.Markup.XamlReader]::Parse($globals))
$order = @('Constants.xaml', 'Common.xaml', 'Media.xaml')
$order += (Get-ChildItem (Join-Path $Src 'DefaultControls') -Filter *.xaml | Sort-Object Name | ForEach-Object { "DefaultControls/$($_.Name)" })
$failed = @()
foreach ($rel in $order) {
    $p = if ($rel -eq 'Constants.xaml') { Join-Path $Drop $rel } else { Join-Path $Src $rel }
    if (-not (Test-Path $p)) { continue }
    $defaultFile = Join-Path (Join-Path $play 'Themes\Desktop\Default') $rel
    if (($rel -ne 'Constants.xaml') -and (Test-Path $defaultFile)) {
        try { $app.Resources.MergedDictionaries.Add([Windows.Markup.XamlReader]::Parse((Read-Xaml $defaultFile))) } catch { }
    }
    try { $app.Resources.MergedDictionaries.Add([Windows.Markup.XamlReader]::Parse((Read-Xaml $p))) }
    catch { $m = $_.Exception.Message; if ($_.Exception.InnerException) { $m += ' || ' + $_.Exception.InnerException.Message }; $failed += "$rel : $m" }
}
# TopPanelMenu lives in Views/TopPanel.xaml, which needs the whole shell: lift the style out on its own.
$tp = Read-Xaml (Join-Path $Src 'Views\TopPanel.xaml')
$mt = [regex]::Match($tp, '<Style\s+x:Key="TopPanelMenu"[^>]*?(/>|>.*?</Style>)', 'Singleline')
if (-not $mt.Success) { $failed += 'TopPanelMenu not found in Views/TopPanel.xaml' }
else {
    $dict = '<ResourceDictionary xmlns="http://schemas.microsoft.com/winfx/2006/xaml/presentation" xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml" xmlns:sys="clr-namespace:System;assembly=mscorlib">' + $mt.Value + '</ResourceDictionary>'
    try { $app.Resources.MergedDictionaries.Add([Windows.Markup.XamlReader]::Parse($dict)) } catch { $failed += "TopPanelMenu : $($_.Exception.Message)" }
}
if ($failed) { Write-Host '--- FAILED TO LOAD ---'; $failed | ForEach-Object { Write-Host $_ } } else { Write-Host 'all merged files parsed' }

function Get-Icon([string]$name) {
    if (-not $name) { return $null }
    $file = $null
    if ($name -like 'Images/*' -and (Test-Path (Join-Path $play $name))) { $file = Join-Path $play $name }
    else {
        $r = $app.TryFindResource($name)
        if ($r -is [string]) { $file = Join-Path $Drop $r }
        elseif ($r -is [Windows.Controls.TextBlock]) {
            $t = [Windows.Controls.TextBlock]::new(); $t.Text = $r.Text; $t.FontFamily = $r.FontFamily
            if ($r.ReadLocalValue([Windows.Controls.TextBlock]::ForegroundProperty) -ne [Windows.DependencyProperty]::UnsetValue) { $t.Foreground = $r.Foreground }
            return $t
        }
    }
    if ($file -and (Test-Path $file)) {
        $img = [Windows.Controls.Image]::new(); $img.Width = 16; $img.Height = 16
        $img.Source = [Windows.Media.Imaging.BitmapImage]::new([Uri]::new($file)); return $img
    }
    return $null
}
function Add-Row($parent, [string]$header, [string]$icon = $null, [string]$gesture = $null, [switch]$Sub) {
    $mi = [Windows.Controls.MenuItem]::new(); $mi.Header = $header
    if ($gesture) { $mi.InputGestureText = $gesture } else { $mi.InputGestureText = $null }
    $ic = Get-Icon $icon; if ($ic) { $mi.Icon = $ic }
    if ($Sub) { $c = [Windows.Controls.MenuItem]::new(); $c.Header = 'Placeholder'; $mi.Items.Add($c) | Out-Null }
    $parent.Items.Add($mi) | Out-Null; return $mi
}
function Add-Sep($parent) { $parent.Items.Add([Windows.Controls.Separator]::new()) | Out-Null }
function Wait-Ms([int]$ms) {
    $f = [Windows.Threading.DispatcherFrame]::new()
    $t = [Windows.Threading.DispatcherTimer]::new(); $t.Interval = [TimeSpan]::FromMilliseconds($ms)
    $t.Add_Tick({ $f.Continue = $false; $t.Stop() }.GetNewClosure()); $t.Start()
    [Windows.Threading.Dispatcher]::PushFrame($f)
}
$hlKey = [Windows.Controls.MenuItem].GetField('IsHighlightedPropertyKey', [Reflection.BindingFlags]'NonPublic,Static').GetValue($null)
function Set-Highlight($mi, [bool]$on) { $mi.SetValue($hlKey, $on) }

$win = [Windows.Window]::new(); $win.Width = 200; $win.Height = 200; $win.Left = -3000; $win.ShowInTaskbar = $false; $win.WindowStyle = 'None'
$panel = [Windows.Controls.StackPanel]::new()
$mainBtn = [Windows.Controls.Border]::new(); $mainBtn.Name = 'PART_ElemMainMenu'; $mainBtn.Width = 44; $mainBtn.Height = 40
$sortBtn = [Windows.Controls.Border]::new(); $sortBtn.Name = 'SortButton'; $sortBtn.Width = 44; $sortBtn.Height = 40
$panel.Children.Add($mainBtn) | Out-Null; $panel.Children.Add($sortBtn) | Out-Null
$win.Content = $panel; $win.Show()

$mm = [Playnite.DesktopApp.Controls.MainMenu]::new()
$add = Add-Row $mm 'Add Game' 'AddGameIcon'
foreach ($h in 'Manual...', 'Scan Automatically...', 'Emulated Game...', 'Microsoft Store Application...') { Add-Row $add $h | Out-Null }
Add-Sep $mm
Add-Row $mm 'Library' -Sub | Out-Null
Add-Row $mm 'Update Game Library' 'UpdateDbIcon' -Sub | Out-Null
Add-Row $mm 'Pick a Random Game' 'DiceIcon' 'F6' | Out-Null
Add-Row $mm 'Add-ons...' 'AddonsIcon' 'F9' | Out-Null
$settings = Add-Row $mm 'Settings...' 'SettingsIcon' 'F4'
$view = Add-Row $mm 'View'
$sb = Add-Row $view 'Sidebar'; $en = Add-Row $sb 'Enabled'; $en.IsCheckable = $true; $en.IsChecked = $true
Add-Sep $mm
Add-Row $mm '3rd Party Clients' -Sub | Out-Null
Add-Row $mm 'Tools' -Sub | Out-Null
Add-Row $mm 'Extensions' -Sub | Out-Null
Add-Sep $mm
Add-Row $mm 'Switch to Fullscreen Mode' 'FullscreenModeIcon' 'F11' | Out-Null
Add-Sep $mm
Add-Row $mm 'Links' -Sub | Out-Null
Add-Row $mm 'Help' -Sub | Out-Null
Add-Row $mm 'About Playnite' 'AboutPlayniteIcon' 'F1' | Out-Null
Add-Row $mm 'Check for Updates' | Out-Null
Add-Sep $mm
Add-Row $mm 'Support on Patreon' 'Images/patreon.png' | Out-Null
Add-Row $mm 'Support on Ko-fi' 'Images/kofi.png' | Out-Null
Add-Sep $mm
$exit = Add-Row $mm 'Exit' 'ExitIcon' 'Alt+Q'
$mm.SetResourceReference([Windows.Controls.ContextMenu]::StyleProperty, 'TopPanelMenu')
$mainBtn.ContextMenu = $mm; $mm.PlacementTarget = $mainBtn

$cm = [Windows.Controls.ContextMenu]::new()
foreach ($h in 'Name', 'Last Played', 'Play Time') { $r = Add-Row $cm $h; $r.IsCheckable = $true }
$cm.Items[0].IsChecked = $true
Add-Sep $cm
Add-Row $cm 'Ascending' | Out-Null
$cm.SetResourceReference([Windows.Controls.ContextMenu]::StyleProperty, 'TopPanelMenu')
$sortBtn.ContextMenu = $cm; $cm.PlacementTarget = $sortBtn

$gm = [Windows.Controls.ContextMenu]::new()
Add-Row $gm 'Play' 'PlayIcon' | Out-Null
Add-Row $gm 'Open Game Location' 'OpenFolderIcon' | Out-Null
Add-Row $gm 'Set Category...' 'CategoryIcon' | Out-Null
Add-Row $gm 'Set Completion Status' -Sub | Out-Null
Add-Sep $gm
Add-Row $gm 'Edit...' 'EditGameIcon' 'F3' | Out-Null
Add-Row $gm 'Remove...' 'RemoveGameIcon' 'Delete' | Out-Null

function Snap($visual) {
    $visual.UpdateLayout()
    $m = if ($visual -is [Windows.FrameworkElement]) { $visual.Margin } else { [Windows.Thickness]::new(0) }
    $w = [Math]::Max(1, [int][Math]::Ceiling($visual.ActualWidth + $m.Left + $m.Right)); $h = [Math]::Max(1, [int][Math]::Ceiling($visual.ActualHeight + $m.Top + $m.Bottom))
    $rtb = [Windows.Media.Imaging.RenderTargetBitmap]::new($w, $h, 96, 96, [Windows.Media.PixelFormats]::Pbgra32)
    $rtb.Render($visual); return $rtb
}
$frames = @()
$mm.IsOpen = $true; Wait-Ms 300
Set-Highlight $settings $true; Wait-Ms 600
$frames += , @((Snap $mm), $null)
Set-Highlight $settings $false
Set-Highlight $exit $true
$add.IsSubmenuOpen = $true; Wait-Ms 600
$subRoot = $null
$pop = $null
if ($true) {
    # find the first Popup in the header's template
    $stack = [Collections.Stack]::new(); $stack.Push($add)
    while ($stack.Count -and -not $pop) {
        $n = $stack.Pop()
        for ($i = 0; $i -lt [Windows.Media.VisualTreeHelper]::GetChildrenCount($n); $i++) {
            $c = [Windows.Media.VisualTreeHelper]::GetChild($n, $i)
            if ($c -is [Windows.Controls.Primitives.Popup]) { $pop = $c; break }
            $stack.Push($c)
        }
    }
}
if ($pop -and $pop.Child) { $subRoot = Snap $pop.Child } else { Write-Host 'submenu popup not found' }
$frames += , @((Snap $mm), $subRoot)
$mm.IsOpen = $false; Wait-Ms 200
$cm.IsOpen = $true; Wait-Ms 300
Set-Highlight $cm.Items[1] $true; Wait-Ms 600
$frames += , @((Snap $cm), $null)
$cm.IsOpen = $false; Wait-Ms 200
$gm.IsOpen = $true; Wait-Ms 300
Set-Highlight $gm.Items[0] $true; Wait-Ms 600
$frames += , @((Snap $gm), $null)
$gm.IsOpen = $false

# A ComboBox list (Settings > General "When game starts"): opens on the same board with the same rows.
$cb = [Windows.Controls.ComboBox]::new(); $cb.Width = 180
foreach ($h in 'Do nothing', 'Minimize', 'Close') { $cb.Items.Add([Windows.Controls.ComboBoxItem]@{ Content = $h }) | Out-Null }
$cb.SelectedIndex = 1
$panel.Children.Add($cb) | Out-Null; $cb.UpdateLayout()
$cb.IsDropDownOpen = $true; Wait-Ms 300
$cbKey = [Windows.Controls.ComboBoxItem].GetField('IsHighlightedPropertyKey', [Reflection.BindingFlags]'NonPublic,Static')
if ($cbKey) { $cb.Items[0].SetValue($cbKey.GetValue($null), $true) }
Wait-Ms 600
$cbPop = $cb.Template.FindName('PART_Popup', $cb)
if ($cbPop -and $cbPop.Child) { $frames += , @((Snap $cbPop.Child), $null) } else { Write-Host 'ComboBox popup not found' }
$cbRowHeight = if ([Windows.Media.VisualTreeHelper]::GetChildrenCount($cb.Items[1]) -gt 0) { [Windows.Media.VisualTreeHelper]::GetChild($cb.Items[1], 0).ActualHeight } else { 0 }
$cb.IsDropDownOpen = $false

# Compose side by side on the window background
$gap = 24; $W = $gap; $H = 0
foreach ($f in $frames) { $W += $f[0].PixelWidth + $gap; if ($f[1]) { $W += $f[1].PixelWidth + 6 }; $H = [Math]::Max($H, $f[0].PixelHeight) }
$H += 2 * $gap
$dv = [Windows.Media.DrawingVisual]::new(); $dc = $dv.RenderOpen()
$bg = $app.TryFindResource('WindowBackgourndBrush'); if (-not $bg) { $bg = [Windows.Media.Brushes]::Gray }
$dc.DrawRectangle($bg, $null, [Windows.Rect]::new(0, 0, $W, $H))
$x = $gap
foreach ($f in $frames) {
    $dc.DrawImage($f[0], [Windows.Rect]::new($x, $gap, $f[0].PixelWidth, $f[0].PixelHeight)); $x += $f[0].PixelWidth
    if ($f[1]) { $x += 6; $dc.DrawImage($f[1], [Windows.Rect]::new($x, $gap + 4, $f[1].PixelWidth, $f[1].PixelHeight)); $x += $f[1].PixelWidth }
    $x += $gap
}
$dc.Close()
if ($Out) {
    $rtb = [Windows.Media.Imaging.RenderTargetBitmap]::new($W, $H, 96, 96, [Windows.Media.PixelFormats]::Pbgra32); $rtb.Render($dv)
    $enc = [Windows.Media.Imaging.PngBitmapEncoder]::new(); $enc.Frames.Add([Windows.Media.Imaging.BitmapFrame]::Create($rtb))
    $fs = [IO.File]::Create($Out); $enc.Save($fs); $fs.Close()
    "wrote $Out"
}
$problems = [Collections.Generic.List[string]]::new()
$cmStyle = $app.TryFindResource([Windows.Controls.ContextMenu])
$tplMenu = if ($cmStyle) { ($cmStyle.Setters | Where-Object { $_.Property -eq [Windows.Controls.Control]::TemplateProperty }).Value }
$tplRow = $app.TryFindResource([Windows.Controls.MenuItem]::SubmenuItemTemplateKey)
$tplHead = $app.TryFindResource([Windows.Controls.MenuItem]::SubmenuHeaderTemplateKey)
$sepStyle = $app.TryFindResource([Windows.Controls.MenuItem]::SeparatorStyleKey)
$tplSep = if ($sepStyle) { ($sepStyle.Setters | Where-Object { $_.Property -eq [Windows.Controls.Control]::TemplateProperty }).Value }
if ($failed) { $problems.Add('theme files failed to load') }
if (-not $tplMenu) { $problems.Add('the implicit ContextMenu style sets no Template (the menu panel)') }
foreach ($m in @(@('the main menu', $mm), @('the sort dropdown', $cm), @('the game menu', $gm))) {
    if ($m[1].Template -ne $tplMenu) { $problems.Add("$($m[0]) does not use the ContextMenu panel template (TopPanelMenu must not set its own)") }
}
if (-not $tplRow -or $settings.Template -ne $tplRow) { $problems.Add('main menu rows do not use the SubmenuItem template') }
if (-not $tplHead -or $add.Template -ne $tplHead) { $problems.Add('submenu headers do not use the SubmenuHeader template') }
if ($add.Items[0].Template -ne $tplRow) { $problems.Add('submenu rows (Add Game > Manual) do not use the SubmenuItem template') }
if ($en.Template -ne $tplRow) { $problems.Add('third-level rows (View > Sidebar > Enabled) do not use the SubmenuItem template') }
if ($cm.Items[0].Template -ne $tplRow -or $gm.Items[0].Template -ne $tplRow) { $problems.Add('dropdown or game menu rows do not use the SubmenuItem template') }
if (-not $tplSep -or $mm.Items[1].Template -ne $tplSep -or $gm.Items[4].Template -ne $tplSep) { $problems.Add('group breaks do not use the MenuItem.SeparatorStyleKey template') }
foreach ($r in @($settings, $add, $cm.Items[0], $gm.Items[0])) {
    if ([Windows.Media.VisualTreeHelper]::GetChildrenCount($r) -gt 0) {
        $rowRoot = [Windows.Media.VisualTreeHelper]::GetChild($r, 0)
        if ($rowRoot.ActualHeight -lt 28 -or $rowRoot.ActualHeight -gt 32) { $problems.Add(("a row is {0}px tall (28-32)" -f [int]$rowRoot.ActualHeight)) }
    }
}
if ($cbRowHeight -lt 28 -or $cbRowHeight -gt 32) { $problems.Add(("ComboBox list rows are {0}px tall (28-32 like the menu rows)" -f [int]$cbRowHeight)) }
if ($mm.ActualHeight -gt 680) { $problems.Add(("the main menu is {0}px tall (compact: 680 or less)" -f [int]$mm.ActualHeight)) }
"main menu {0}x{1}, dropdown {2}x{3}, game menu {4}x{5}" -f [int]$mm.ActualWidth, [int]$mm.ActualHeight, [int]$cm.ActualWidth, [int]$cm.ActualHeight, [int]$gm.ActualWidth, [int]$gm.ActualHeight
$win.Close(); $app.Shutdown()
if ($problems.Count) { $problems | ForEach-Object { Write-Host "FAIL ${Key}: $_" }; exit 1 }
Write-Host "PASS ${Key}: every menu and ComboBox list wears the theme's menu, compact"
