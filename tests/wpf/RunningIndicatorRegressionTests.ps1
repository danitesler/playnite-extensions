# Run with pwsh -STA -File tests/wpf/RunningIndicatorRegressionTests.ps1 [-Keys emberline,ace].
# Loads each theme's built running-game indicator (artifacts/builds/themes/<key>; build first) into plain WPF and drives
# a fake game through launching -> running -> selected -> stopped on the details row, the cover tile, the list view row
# and the game page's RunningActionIndicator. docs/themes/reference.md -> Running game indicator.
# -RenderDir <folder> also saves <key>-<case>.png of each item running and selected (no art: a sizing and colour check).
param([string[]]$Keys, [string]$RenderDir)
$ErrorActionPreference = 'Stop'
. (Join-Path $PSScriptRoot 'RunningIndicatorHarness.ps1')

$root = Split-Path (Split-Path $PSScriptRoot -Parent) -Parent
$themes = (Get-Content "$root/src/extensions.json" -Raw | ConvertFrom-Json).extensions | Where-Object kind -eq theme
if ($Keys) { $Keys = @($Keys | ForEach-Object { $_ -split "," } | Where-Object { $_ }); $themes = $themes | Where-Object { $Keys -contains $_.key } }

# A ThemeFile brush in an item template must survive sanitizing and Show(). Empty ImageSource does not.
$themeFileFixture = ConvertTo-TestXaml @'
<ResourceDictionary xmlns="http://schemas.microsoft.com/winfx/2006/xaml/presentation" xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml">
  <Style x:Key="GridViewItemStyle" TargetType="ListBoxItem">
    <Setter Property="Template">
      <Setter.Value>
        <ControlTemplate TargetType="ListBoxItem">
          <Rectangle Width="40" Height="24">
            <Rectangle.OpacityMask><ImageBrush ImageSource="{ThemeFile 'Images/fx/slot-glow.png'}" /></Rectangle.OpacityMask>
          </Rectangle>
        </ControlTemplate>
      </Setter.Value>
    </Setter>
  </Style>
</ResourceDictionary>
'@
$fixtureResources = [Windows.Markup.XamlReader]::Parse($themeFileFixture)
$fixtureList = New-Object Windows.Controls.ListBox
$fixtureList.ItemContainerStyle = $fixtureResources['GridViewItemStyle']
$fixtureList.ItemsSource = @('Game')
$fixtureWindow = New-Object Windows.Window
$fixtureWindow.Resources = $fixtureResources
$fixtureWindow.Width = 200; $fixtureWindow.Height = 80; $fixtureWindow.Left = -4000
$fixtureWindow.ShowInTaskbar = $false; $fixtureWindow.WindowStyle = 'None'
$fixtureWindow.Content = $fixtureList
try { $fixtureWindow.Show() }
finally { $fixtureWindow.Close() }

$failures = [System.Collections.Generic.List[string]]::new()
$checks = 0
foreach ($theme in $themes) {
    try { $res = Load-Theme $theme }
    catch { $failures.Add("$($theme.key): XAML did not load: $($_.Exception.GetBaseException().Message)"); continue }

    $cases = @(
        @{ Name = 'details row'; Make = { $lb = New-Object Windows.Controls.ListBox; $lb.ItemContainerStyle = $res['DetailsViewItemStyle']; $lb } },
        @{ Name = 'cover tile'; Make = { $lb = New-Object Windows.Controls.ListBox; $lb.ItemContainerStyle = $res['GridViewItemStyle']; $lb } },
        @{ Name = 'list view row'; Make = {
                $lv = New-Object Windows.Controls.ListView
                $gv = New-Object Windows.Controls.GridView
                $col = New-Object Windows.Controls.GridViewColumn
                $col.DisplayMemberBinding = New-Object Windows.Data.Binding 'Name'
                $gv.Columns.Add($col); $lv.View = $gv; $lv } },
        @{ Name = 'game page action'; Make = {
                # The real cell: Play (collapsed while running, as Playnite leaves PART_ButtonPlayAction in the cell) + context action + overlay.
                $g = New-Object Windows.Controls.Grid; $g.Width = 190; $g.Height = 48
                $b = New-Object Windows.Controls.Button; $b.Content = 'Running'; $b.Tag = 'ContextAction'
                $bCollapsed = New-Object Windows.Controls.Button; $bCollapsed.Content = 'Play'; $bCollapsed.Visibility = [Windows.Visibility]::Collapsed
                if ($res['PlayButton']) { $b.Style = $res['PlayButton']; $bCollapsed.Style = $res['PlayButton'] }
                $c = New-Object Windows.Controls.Control; $c.Style = $res['RunningActionIndicator']
                $g.Children.Add($b) | Out-Null; $g.Children.Add($c) | Out-Null; $g.Children.Add($bCollapsed) | Out-Null; $g } }
    )
    foreach ($case in $cases) {
        $checks++
        $game = New-Object RunningTestGame
        $control = & $case.Make
        $isList = $control -is [Windows.Controls.ItemsControl]
        if ($isList) { $control.ItemsSource = (New-Items $game) } else { $control.DataContext = $game }
        $win = New-Object Windows.Window
        $win.Resources = $res
        $win.Width = 400; $win.Height = 300; $win.Left = -4000; $win.ShowInTaskbar = $false; $win.WindowStyle = 'None'
        $win.Content = $control
        $label = "$($theme.key) $($case.Name)"
        try {
            $win.Show(); Pump 80
            $el = if ($isList) { $control.ItemContainerGenerator.ContainerFromIndex(0) } elseif ($control -is [Windows.Controls.Grid]) { $control.Children[1] } else { $control }
            $ind = if ($el) { $el.Template.FindName('RunningIndicator', $el) } else { $null }
            if (-not $ind) { $failures.Add("${label}: RunningIndicator not found in the applied template"); continue }
            $rest = $ind.Opacity
            if ($ind.IsVisible) { $failures.Add("${label}: indicator visible with no game running") }
            foreach ($state in 'IsLaunching', 'IsRunning') {
                $game.IsLaunching = $state -eq 'IsLaunching'
                $game.IsRunning = $state -eq 'IsRunning'
                Pump 250; $a = $ind.Opacity; Pump 450; $b = $ind.Opacity
                if (-not $ind.IsVisible) { $failures.Add("${label}: indicator hidden while $state") }
                $moved = [math]::Abs($a - $b) -gt 0.01
                if (-not $moved) {
                    # A transform-only motion leaves Opacity alone; accept it when some animation clock is on the indicator's subtree.
                    $moved = $false
                    $stack = New-Object System.Collections.Stack; $stack.Push($ind)
                    while ($stack.Count -and -not $moved) {
                        $node = $stack.Pop()
                        if ($node -is [Windows.UIElement] -and $node.HasAnimatedProperties) { $moved = $true }
                        if ($node -is [Windows.UIElement] -and $node.RenderTransform -and $node.RenderTransform.HasAnimatedProperties) { $moved = $true }
                        foreach ($child in [Windows.LogicalTreeHelper]::GetChildren($node)) { if ($child -is [Windows.DependencyObject]) { $stack.Push($child) } }
                    }
                }
                if (-not $moved) { $failures.Add("${label}: no ambient motion while $state") }
            }
            if ($isList) {
                $control.SelectedIndex = 0; Pump 250
                if (-not $ind.IsVisible) { $failures.Add("${label}: indicator hidden on the selected item") }
            }
            if ($RenderDir) {
                if ($isList) {
                    if ($case.Name -eq 'cover tile') { $el.Width = 150; $el.Height = 200 } else { $el.Width = 360; $el.Height = 34 }
                }
                $back = $res['ContentBackgroundBrush']; if (-not $back) { $back = $res['WindowBackgourndBrush'] }
                $win.Background = $back; $control.Background = $back
                $win.UpdateLayout(); Pump 120
                $target = if ($isList) { $el } else { $control }
                $bmp = Get-TestBitmap $target $target.ActualWidth $target.ActualHeight $back -Pad 8
                New-Item -ItemType Directory -Force -Path $RenderDir | Out-Null
                $enc = New-Object Windows.Media.Imaging.PngBitmapEncoder
                $enc.Frames.Add([Windows.Media.Imaging.BitmapFrame]::Create($bmp))
                $fs = [IO.File]::Create((Join-Path $RenderDir "$($theme.key)-$($case.Name -replace ' ', '-').png")); $enc.Save($fs); $fs.Close()
            }
            # The whole item is highlighted: RunningFrame spans (nearly) the item and reads clearly while running.
            $frame = $el.Template.FindName('RunningFrame', $el)
            if (-not $frame) { $failures.Add("${label}: RunningFrame not found") }
            else {
                if (-not $frame.IsVisible) { $failures.Add("${label}: RunningFrame hidden while running") }
                $w = $frame.ActualWidth; $h = $frame.ActualHeight
                # Allow the item's own spacing margin and an inset of a few pixels on each side, nothing more.
                if ($w -lt $el.ActualWidth - 24 -or $h -lt $el.ActualHeight - 24) {
                    $failures.Add("${label}: RunningFrame is ${w}x${h} on a $($el.ActualWidth)x$($el.ActualHeight) item; it must frame the whole item")
                }
                $op = 1.0; $node = $frame
                while ($node -and $node -ne $el) { if ($node -is [Windows.UIElement]) { $op *= $node.Opacity }; $node = [Windows.Media.VisualTreeHelper]::GetParent($node) }
                if ($op -lt 0.35) { $failures.Add("${label}: RunningFrame effective opacity $([math]::Round($op,2)) is too faint (needs >= 0.35)") }
            }
            $game.IsRunning = $false; $game.IsLaunching = $false; Pump 150
            if ($ind.IsVisible) { $failures.Add("${label}: indicator still visible after the game stopped") }
            if ([math]::Abs($ind.Opacity - $rest) -gt 0.01) { $failures.Add("${label}: opacity left at $($ind.Opacity) after stop (storyboard not removed)") }
        }
        catch { $failures.Add("${label}: $($_.Exception.GetBaseException().Message)") }
        finally { $win.Close() }
    }
}

if ($failures.Count) {
    $failures | ForEach-Object { Write-Host "FAIL $_" }
    throw "$($failures.Count) running indicator failure(s) in $checks checks."
}
Write-Host "Running indicator: $checks checks passed across $(@($themes).Count) theme(s)."
