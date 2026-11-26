# Run with pwsh -STA -File tests/wpf/RunningLabelOverlapRegressionTests.ps1 [-Keys shade,tumbleweed] [-Report <file>].
# Fails when the running / launching mark drawn over the game page Play cell (RunningActionIndicator) touches the button's label.
# Loads each built theme (artifacts/builds/themes/<key>; build with build-theme.ps1 -NoDeploy first) into plain WPF, lays out the
# real Play button the way the game page does (content sized, label from the string Playnite shows), and for LAUNCHING, RUNNING and
# RUNNING + hover (Cancel) samples frames over a full animation loop: the label's pixels (the render with the label minus the render
# without it) against the bounds of every small shape the overlay draws (ping rings, bars, brackets, dots; the wash, frame, scan, foot
# line and scrim layers are the plate, not marks). Any intersection, or a gap under -MinGap px, is a failure.
# Fix a failure by reserving room for the mark in the button (right Padding on Tag=ContextAction while launching / running), never
# by shrinking the label. Rule: docs/themes/running-motion.md -> Label and mark never overlap.
param([string[]]$Keys, [string]$Report, [string[]]$Surfaces = @('button', 'details row', 'list row'), [double]$MinGap = 2, [switch]$Quiet,
      [string[]]$Labels = @('Launching', 'Running'))
$ErrorActionPreference = 'Stop'
$Surfaces = @($Surfaces | ForEach-Object { $_ -split ',' } | Where-Object { $_ })
. (Join-Path $PSScriptRoot 'RunningIndicatorHarness.ps1')
$root = Split-Path (Split-Path $PSScriptRoot -Parent) -Parent
$themes = (Get-Content "$root/src/extensions.json" -Raw | ConvertFrom-Json).extensions | Where-Object kind -eq theme
if ($Keys) { $Keys = @($Keys | ForEach-Object { $_ -split ',' } | Where-Object { $_ }); $themes = $themes | Where-Object { $Keys -contains $_.key } }

function Grab($visual, [double]$w, [double]$h, $back) {
    $bmp = Get-TestBitmap $visual $w $h $back
    $buf = New-Object byte[] ($bmp.PixelWidth * $bmp.PixelHeight * 4)
    $bmp.CopyPixels($buf, $bmp.PixelWidth * 4, 0)
    return [pscustomobject]@{ W = $bmp.PixelWidth; H = $bmp.PixelHeight; Buf = $buf }
}
# Bounds of the pixels that differ between two renders (the label is the only difference).
function Get-DiffRect($a, $b) {
    $x0 = 99999; $y0 = 99999; $x1 = -1; $y1 = -1
    for ($y = 0; $y -lt $a.H; $y++) {
        for ($x = 0; $x -lt $a.W; $x++) {
            $i = ($y * $a.W + $x) * 4
            $d = [math]::Max([math]::Abs($a.Buf[$i] - $b.Buf[$i]), [math]::Max([math]::Abs($a.Buf[$i + 1] - $b.Buf[$i + 1]), [math]::Abs($a.Buf[$i + 2] - $b.Buf[$i + 2])))
            if ($d -gt 90) { if ($x -lt $x0) { $x0 = $x }; if ($x -gt $x1) { $x1 = $x }; if ($y -lt $y0) { $y0 = $y }; if ($y -gt $y1) { $y1 = $y } }
        }
    }
    if ($x1 -lt 0) { return $null }
    return New-Object Windows.Rect $x0, $y0, ($x1 - $x0 + 1), ($y1 - $y0 + 1)
}
$plateNames = 'RunningIndicator', 'RunningWash', 'RunningScan', 'RunningFrame', 'RunningFill', 'RunningBreath', 'RunningHoverDim', 'RunningMarkPlate'
function Get-EffectiveOpacity($el, $stop) {
    $o = 1.0; $c = $el
    while ($c -and $c -ne $stop) { if ($c -is [Windows.UIElement]) { $o *= $c.Opacity; if ($c.Visibility -ne 'Visible') { return 0 } }; $c = [Windows.Media.VisualTreeHelper]::GetParent($c) }
    return $o
}
# Bounds (in the overlay root's space) of every mark-like leaf: a shape, glyph or filled border that is not a plate layer and is
# narrower than half the cell (a full-width hairline is a foot line, not a mark).
function Get-MarkRects($root, [double]$cellW) {
    $out = New-Object System.Collections.Generic.List[object]
    $stack = New-Object System.Collections.Stack; $stack.Push($root)
    while ($stack.Count) {
        $v = $stack.Pop()
        for ($i = 0; $i -lt [Windows.Media.VisualTreeHelper]::GetChildrenCount($v); $i++) { $stack.Push([Windows.Media.VisualTreeHelper]::GetChild($v, $i)) }
        if ($v -eq $root -or $v -isnot [Windows.FrameworkElement]) { continue }
        if ($plateNames -contains $v.Name) { continue }
        $leaf = ($v -is [Windows.Shapes.Shape]) -or ($v -is [Windows.Controls.TextBlock]) -or ($v -is [Windows.Controls.Image]) -or
                (($v -is [Windows.Controls.Border]) -and ($v.Background -or $v.BorderThickness.Left -gt 0 -or $v.BorderThickness.Top -gt 0))
        if (-not $leaf -or $v.ActualWidth -le 0 -or $v.ActualHeight -le 0) { continue }
        $name = $v.Name
        # Plate layers copy the button shape: skip anything as wide as most of the cell and as tall as most of it.
        $r = $v.TransformToAncestor($root).TransformBounds((New-Object Windows.Rect 0, 0, $v.ActualWidth, $v.ActualHeight))
        if ($r.Width -ge 0.5 * $cellW) { continue }
        if ($r.Height -le 3.5 -and $r.Width -ge 8) { continue }   # a hairline or foot line under the label is the progress foot, not a mark
        $op = Get-EffectiveOpacity $v $root
        if ($op -lt 0.08) { continue }
        $out.Add([pscustomobject]@{ Name = $name; Rect = $r; Opacity = $op })
    }
    return $out
}

function Measure-State($theme, $res, [string]$state, [string]$label, [bool]$hover) {
    $game = (New-Object RunningTestGame -Property @{ Name = 'World of Warcraft: Forever and Ever, Extended Deluxe Edition' })
    $g = New-Object Windows.Controls.Grid; $g.DataContext = $game; $g.HorizontalAlignment = 'Left'; $g.VerticalAlignment = 'Top'
    $b = New-Object Windows.Controls.Button; $b.Tag = 'ContextAction'; $b.Content = $label
    if ($res['PlayButton']) { $b.Style = $res['PlayButton'] }
    $o = New-Object Windows.Controls.Control
    if ($res['RunningActionIndicator']) { $o.Style = $res['RunningActionIndicator'] }
    $g.Children.Add($b) | Out-Null; $g.Children.Add($o) | Out-Null
    $win = New-Object Windows.Window
    $win.Resources = $res; $win.Width = 600; $win.Height = 300; $win.Left = -4000; $win.ShowInTaskbar = $false; $win.WindowStyle = 'None'
    $back = $res['WindowBackgourndBrush']; if (-not $back) { $back = [Windows.Media.Brushes]::Black }
    $win.Background = $back; $win.Content = $g; $win.Show(); Pump 80
    try {
        $b.Focusable = $true
        if ($hover) { [void][Windows.Input.Keyboard]::Focus($b); Pump 60 }
        $game.IsLaunching = $state -eq 'launching'; $game.IsRunning = $state -eq 'running'
        Pump 120; $win.UpdateLayout()
        $cellW = $g.ActualWidth; $cellH = $g.ActualHeight
        $frames = if ($state -eq 'launching') { 9 } else { 7 }; $interval = if ($state -eq 'launching') { 200 } else { 500 }
        $worst = $null; $needR = 0.0; $needL = 0.0
        for ($f = 0; $f -lt $frames; $f++) {
            $win.UpdateLayout()
            # Label pixels: with the label, then with the overlay hidden and the label blanked (the plate stays the same).
            $o.Visibility = 'Collapsed'
            $with = Grab $g $cellW $cellH $back
            # Blank the label by its colour, not its content: an empty button would shrink and shift everything.
            $b.Foreground = [Windows.Media.Brushes]::Transparent; $win.UpdateLayout()
            $without = Grab $g $cellW $cellH $back
            $b.ClearValue([Windows.Controls.Control]::ForegroundProperty); $o.Visibility = 'Visible'; $win.UpdateLayout()
            $text = Get-DiffRect $with $without
            $marks = Get-MarkRects ([Windows.Media.VisualTreeHelper]::GetChild($o, 0)) $cellW
            if ($text) {
                foreach ($m in $marks) {
                    # Room to reserve (px): how far the label has to move for this mark to clear it by MinGap.
                    $dyBand = [math]::Max($m.Rect.Top - $text.Bottom, $text.Top - $m.Rect.Bottom)
                    if ($dyBand -lt $MinGap) {
                        if (($m.Rect.Left + $m.Rect.Right) / 2 -ge $cellW / 2) { $needR = [math]::Max($needR, $text.Right + $MinGap - $m.Rect.Left) }
                        else { $needL = [math]::Max($needL, $m.Rect.Right + $MinGap - $text.Left) }
                    }
                    $gap = $null
                    $dx = [math]::Max($m.Rect.Left - $text.Right, $text.Left - $m.Rect.Right)
                    $dy = [math]::Max($m.Rect.Top - $text.Bottom, $text.Top - $m.Rect.Bottom)
                    $gap = [math]::Max($dx, $dy)   # negative = overlapping on both axes
                    if (-not $worst -or $gap -lt $worst.Gap) { $worst = [pscustomobject]@{ Gap = [math]::Round($gap, 1); Mark = $m.Name; MarkRect = $m.Rect; Text = $text; Frame = $f; CellW = $cellW } }
                }
            }
            Pump $interval
        }
        return [pscustomobject]@{ Worst = $worst; CellW = $cellW; CellH = $cellH; NeedRight = [math]::Ceiling($needR); NeedLeft = [math]::Ceiling($needL) }
    }
    finally { $win.Close() }
}

# A library row (details view ListBoxItem or list view ListViewItem) narrower than its name, so the name runs to the row's end.
function Measure-Row($res, [string]$surface, [string]$state, [bool]$selected) {
    $game = (New-Object RunningTestGame -Property @{ Name = 'World of Warcraft: Forever and Ever, Extended Deluxe Edition' })
    if ($surface -eq 'details row') {
        $c = New-Object Windows.Controls.ListBox; $c.ItemContainerStyle = $res['DetailsViewItemStyle']; $c.DisplayMemberPath = 'Name'
    }
    else {
        $c = New-Object Windows.Controls.ListView; $gv = New-Object Windows.Controls.GridView
        $col = New-Object Windows.Controls.GridViewColumn; $col.Width = 252; $col.DisplayMemberBinding = New-Object Windows.Data.Binding 'Name'
        $gv.Columns.Add($col); $c.View = $gv
    }
    $items = New-Object 'System.Collections.ObjectModel.ObservableCollection[object]'; $items.Add($game.psobject.BaseObject); $c.ItemsSource = $items
    $win = New-Object Windows.Window
    $win.Resources = $res; $win.Width = 300; $win.Height = 200; $win.Left = -4000; $win.ShowInTaskbar = $false; $win.WindowStyle = 'None'
    $back = $res['ContentBackgroundBrush']; if (-not $back) { $back = $res['WindowBackgourndBrush'] }; if (-not $back) { $back = [Windows.Media.Brushes]::Black }
    $win.Background = $back; if ($c -is [Windows.Controls.Control]) { $c.Background = $back }
    $win.Content = $c; $win.Show(); Pump 80
    try {
        $el = $c.ItemContainerGenerator.ContainerFromIndex(0); $el.Width = 264
        $game.IsLaunching = $state -eq 'launching'; $game.IsRunning = $state -eq 'running'
        Pump 120; $win.UpdateLayout()
        $cellW = $el.ActualWidth; $cellH = $el.ActualHeight
        $ind = $el.Template.FindName('RunningIndicator', $el)
        $frames = if ($state -eq 'launching') { 9 } else { 7 }; $interval = if ($state -eq 'launching') { 200 } else { 500 }
        $worst = $null; $needR = 0.0; $needL = 0.0
        # The name does not move while the mark plays: measure its pixels once, on the unselected row (a selected row's plates draw with the row's Foreground).
        # Select only afterwards: deselecting here would start the row's selection-exit fade, and the two grabs would differ across the whole plate.
        $win.UpdateLayout()
        $ind.Visibility = 'Collapsed'
        $with = Grab $el $cellW $cellH $back
        $el.Foreground = [Windows.Media.Brushes]::Transparent; $win.UpdateLayout()
        $without = Grab $el $cellW $cellH $back
        $el.ClearValue([Windows.Controls.Control]::ForegroundProperty); $ind.Visibility = 'Visible'
        if ($selected) { $c.SelectedIndex = 0; Pump 300 }; $win.UpdateLayout()
        $textFixed = Get-DiffRect $with $without
        for ($f = 0; $f -lt $frames; $f++) {
            $win.UpdateLayout()
            $text = $textFixed
            $marks = Get-MarkRects $ind $cellW
            if ($text) {
                foreach ($m in $marks) {
                    $dyBand = [math]::Max($m.Rect.Top - $text.Bottom, $text.Top - $m.Rect.Bottom)
                    if ($dyBand -lt $MinGap) {
                        if (($m.Rect.Left + $m.Rect.Right) / 2 -ge $cellW / 2) { $needR = [math]::Max($needR, $text.Right + $MinGap - $m.Rect.Left) }
                        else { $needL = [math]::Max($needL, $m.Rect.Right + $MinGap - $text.Left) }
                    }
                    $dx = [math]::Max($m.Rect.Left - $text.Right, $text.Left - $m.Rect.Right)
                    $gap = [math]::Max($dx, $dyBand)
                    if (-not $worst -or $gap -lt $worst.Gap) { $worst = [pscustomobject]@{ Gap = [math]::Round($gap, 1); Mark = $m.Name; MarkRect = $m.Rect; Text = $text; Frame = $f } }
                }
            }
            Pump $interval
        }
        return [pscustomobject]@{ Worst = $worst; CellW = $cellW; CellH = $cellH; NeedRight = [math]::Ceiling($needR); NeedLeft = [math]::Ceiling($needL) }
    }
    finally { $win.Close() }
}

$rows = New-Object System.Collections.Generic.List[object]
$failed = 0
foreach ($theme in $themes) {
    try {
        $res = Load-Theme $theme $false -SkipGrid -Quiet; $resHover = Load-Theme $theme $true -SkipGrid -Quiet
        $cases = @()
        if ($Surfaces -contains 'button') {
            $cases += @(
                @{ Surface = 'button'; Name = 'launching'; State = 'launching'; Label = $Labels[0]; Hover = $false; Res = $res },
                @{ Surface = 'button'; Name = 'running'; State = 'running'; Label = $Labels[1]; Hover = $false; Res = $res },
                @{ Surface = 'button'; Name = 'running+hover'; State = 'running'; Label = $Labels[1]; Hover = $true; Res = $resHover })
        }
        foreach ($rowSurface in 'details row', 'list row') {
            if ($Surfaces -contains $rowSurface) {
                foreach ($sel in $false, $true) {
                    foreach ($st in 'launching', 'running') {
                        $cases += @{ Surface = $rowSurface; Name = ($st + $(if ($sel) { '+selected' } else { '' })); State = $st; Selected = $sel; Res = $res }
                    }
                }
            }
        }
        foreach ($c in $cases) {
            $m = if ($c.Surface -eq 'button') { Measure-State $theme $c.Res $c.State $c.Label $c.Hover } else { Measure-Row $c.Res $c.Surface $c.State $c.Selected }
            $w = $m.Worst
            $bad = $w -and $w.Gap -lt $MinGap
            if ($c.Surface -eq 'button' -and $m.CellW -gt 400) { $bad = $false; Write-Host ("{0} button: cell is {1:N0}px wide (an overlay layer has no natural size), not measurable here" -f $theme.key, $m.CellW) }
            if ($bad) { $failed++ }
            $rows.Add([pscustomobject]@{ Theme = $theme.key; Surface = $c.Surface; State = $c.Name; Cell = ('{0:N0}x{1:N0}' -f $m.CellW, $m.CellH); Gap = $(if ($w) { $w.Gap } else { 'n/a' }); Mark = $(if ($w) { $w.Mark } else { '' }); NeedRight = $m.NeedRight; NeedLeft = $m.NeedLeft; Ok = (-not $bad) })
            if (-not $Quiet -or $bad) {
                if ($env:OVERLAP_DEBUG -and $w) { Write-Host ("   text {0}  mark {1} frame {2}" -f $w.Text, $w.MarkRect, $w.Frame) }
                Write-Host ('{0,-12} {1,-12} {2,-20} cell {3,-9} gap {4,6}  mark {5,-22} {6}' -f $theme.key, $c.Surface, $c.Name, ('{0:N0}x{1:N0}' -f $m.CellW, $m.CellH), $(if ($w) { $w.Gap } else { 'n/a' }), $(if ($w) { $w.Mark } else { '' }), $(if ($bad) { 'OVERLAP' } else { 'ok' }))
            }
        }
    }
    catch { Write-Host "$($theme.key): skipped ($($_.Exception.GetBaseException().Message.Split([char]10)[0]))"; $rows.Add([pscustomobject]@{ Theme = $theme.key; State = 'error'; Cell = ''; Gap = ''; Mark = ''; Ok = $false }); $failed++ }
}
if ($Report) { $rows | Export-Csv -NoTypeInformation -Path $Report }
Write-Host ("{0} theme(s), {1} failing state(s)" -f @($themes).Count, $failed)
exit $(if ($failed) { 1 } else { 0 })
