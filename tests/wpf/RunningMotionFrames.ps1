# Run with pwsh -STA -File tests/wpf/RunningMotionFrames.ps1 -Keys tumbleweed -OutDir <folder> [-Scale 2].
# Look at a theme's launching and running motion without opening Playnite. Loads the built theme (artifacts/builds/themes/<key>;
# build first with build-theme.ps1 -NoDeploy) into plain WPF, drives a fake game and writes <key>-motion.png: one contact sheet
# with a block per surface (details row, cover tile, list view row, game page Play / RUNNING button). Each block has a row of
# frames while LAUNCHING (every 200 ms, so the scan reads as a sweep), a row of frames while RUNNING (every 600 ms, so the
# idle pulse reads), the same two states on a SELECTED item, and for the button the hover state (the label turns to Cancel
# only on hover while running; launching and idle running never show it). Hover is emulated on a scratch copy of the button
# (IsMouseOver -> IsKeyboardFocused) because WPF cannot force the pointer state. Docs: docs/themes/reference.md -> Running game indicator.
param([string[]]$Keys, [Parameter(Mandatory = $true)] [string]$OutDir, [int]$Scale = 2, [int]$LaunchFrames = 8, [int]$RunFrames = 6,
      [string[]]$Surfaces = @('details row', 'cover tile', 'list view row', 'game page action'))
$ErrorActionPreference = 'Stop'
$Surfaces = @($Surfaces | ForEach-Object { $_ -split ',' } | Where-Object { $_ })  # -Surfaces "cover tile,details row"
Add-Type -AssemblyName PresentationFramework, PresentationCore, WindowsBase, System.Xaml
if ([Threading.Thread]::CurrentThread.ApartmentState -ne 'STA') { throw 'Run with pwsh -STA.' }
if (-not ('MotionFakeGame' -as [type])) {
    Add-Type -TypeDefinition @"
using System.ComponentModel;
public class MotionFakeGame : INotifyPropertyChanged {
    bool r, l, i = true;
    public event PropertyChangedEventHandler PropertyChanged;
    void N(string p) { if (PropertyChanged != null) PropertyChanged(this, new PropertyChangedEventArgs(p)); }
    public bool IsRunning { get { return r; } set { r = value; N("IsRunning"); } }
    public bool IsLaunching { get { return l; } set { l = value; N("IsLaunching"); } }
    public bool IsInstalled { get { return i; } set { i = value; N("IsInstalled"); } }
    public string Name { get { return "World of Warcraft: Forever"; } }
    public override string ToString() { return "World of Warcraft: Forever"; }
}
"@
}
if (-not ('MotionUpperConverter' -as [type])) {
    Add-Type -ReferencedAssemblies PresentationFramework, WindowsBase, System.Xaml -TypeDefinition @"
public class MotionUpperConverter : System.Windows.Data.IValueConverter {
    public object Convert(object v, System.Type t, object p, System.Globalization.CultureInfo c) { return v == null ? null : v.ToString().ToUpperInvariant(); }
    public object ConvertBack(object v, System.Type t, object p, System.Globalization.CultureInfo c) { return v; }
}
"@
}
$root = Split-Path (Split-Path $PSScriptRoot -Parent) -Parent
$themes = (Get-Content "$root/src/extensions.json" -Raw | ConvertFrom-Json).extensions | Where-Object kind -eq theme
if ($Keys) { $Keys = @($Keys | ForEach-Object { $_ -split "," } | Where-Object { $_ }); $themes = $themes | Where-Object { $Keys -contains $_.key } }

function Pump([int]$ms) {
    $frame = New-Object Windows.Threading.DispatcherFrame
    $timer = New-Object Windows.Threading.DispatcherTimer
    $timer.Interval = [TimeSpan]::FromMilliseconds($ms)
    $timer.Add_Tick({ $frame.Continue = $false; $timer.Stop() }.GetNewClosure())
    $timer.Start()
    [Windows.Threading.Dispatcher]::PushFrame($frame)
}
function ConvertTo-TestXaml([string]$text, [bool]$hover) {
    $text = $text -replace '\{Settings [A-Za-z.]+\}', '4'
    $text = $text -replace '\{ThemeFile [^}]*\}', '{x:Null}'
    $text = $text -replace '<DataTrigger Binding="4"[^>]*>[\s\S]*?</DataTrigger>', ''
    if ($hover) {
        # Emulate the pointer with keyboard focus on a scratch copy of the button style.
        # A TemplatedParent hover binding (the old form) is the whole game page's pointer state in Playnite, never the button's: Self only.
        $text = $text -replace 'Binding IsMouseOver, RelativeSource=\{RelativeSource (TemplatedParent|Self)\}', 'Binding IsKeyboardFocused, RelativeSource={RelativeSource Self}'
        $text = $text -replace '<Trigger Property="IsMouseOver"', '<Trigger Property="IsKeyboardFocused"'
    }
    return $text
}
function Read-Dictionary([string]$path, [bool]$hover = $false) {
    return [Windows.Markup.XamlReader]::Parse((ConvertTo-TestXaml (Get-Content -Raw -LiteralPath $path) $hover))
}
function New-Items($game) {
    $items = New-Object 'System.Collections.ObjectModel.ObservableCollection[object]'
    $items.Add($game.psobject.BaseObject)
    return , $items
}

$app = [Windows.Application]::Current
if (-not $app) { $app = New-Object Windows.Application; $app.ShutdownMode = 'OnExplicitShutdown' }
if (-not $app.Resources.Contains('StringToUpperCaseConverter')) { $app.Resources.Add('StringToUpperCaseConverter', (New-Object MotionUpperConverter)) }
if (-not $app.Resources.Contains('LOCCancelLabel')) { $app.Resources.Add('LOCCancelLabel', 'Cancel') }
if (-not $app.Resources.Contains('BaseStyle')) { $app.Resources.Add('BaseStyle', (New-Object Windows.Style ([Windows.Controls.Control]))) }

function Load-Theme($theme, [bool]$hover) {
    $drop = Join-Path $root "artifacts/builds/themes/$($theme.key)"
    if (-not (Test-Path (Join-Path $drop 'Constants.xaml'))) { throw "no build drop for $($theme.key); run build-theme.ps1 -NoDeploy first" }
    $res = New-Object Windows.ResourceDictionary
    $res.MergedDictionaries.Add((Read-Dictionary (Join-Path $drop 'Constants.xaml')))
    for ($try = 0; $try -lt 12; $try++) {
        try { $res.MergedDictionaries.Add((Read-Dictionary (Join-Path $drop 'Common.xaml'))); break }
        catch {
            $msg = $_.Exception.GetBaseException().Message
            if ($msg -match "Cannot find resource named '([^']+)'" -and -not $app.Resources.Contains($Matches[1])) { $app.Resources.Add($Matches[1], (New-Object Windows.Style ([Windows.FrameworkElement]))) }
            else { Write-Host "note: $($theme.key) Common.xaml not loaded ($($msg.Split([char]10)[0]))"; break }
        }
    }
    foreach ($rel in 'DerivedStyles/DetailsViewItemStyle.xaml', 'DerivedStyles/GridViewItemStyle.xaml', 'DefaultControls/ListView.xaml', 'DerivedStyles/PlayButton.xaml') {
        $res.MergedDictionaries.Add((Read-Dictionary (Join-Path $drop $rel) $hover))
    }
    return $res
}

function Grab($visual, [double]$w, [double]$h, $back) {
    $pad = 8
    $bmp = New-Object Windows.Media.Imaging.RenderTargetBitmap ([int][math]::Ceiling(($w + 2 * $pad) * $Scale)), ([int][math]::Ceiling(($h + 2 * $pad) * $Scale)), 96, 96, ([Windows.Media.PixelFormats]::Pbgra32)
    $dv = New-Object Windows.Media.DrawingVisual
    $dc = $dv.RenderOpen()
    $dc.PushTransform((New-Object Windows.Media.ScaleTransform $Scale, $Scale))
    $dc.DrawRectangle($back, $null, (New-Object Windows.Rect 0, 0, ($w + 2 * $pad), ($h + 2 * $pad)))
    $dc.DrawRectangle((New-Object Windows.Media.VisualBrush $visual), $null, (New-Object Windows.Rect $pad, $pad, $w, $h))
    $dc.Pop(); $dc.Close(); $bmp.Render($dv)
    $bmp.Freeze()
    return $bmp
}


function Get-Luminance([byte]$r, [byte]$g, [byte]$b) {
    $c = foreach ($v in $r, $g, $b) { $x = $v / 255.0; if ($x -le 0.03928) { $x / 12.92 } else { [math]::Pow(($x + 0.055) / 1.055, 2.4) } }
    return 0.2126 * $c[0] + 0.7152 * $c[1] + 0.0722 * $c[2]
}
# Contrast of the Play / RUNNING label against the plate behind it, over every frame of a state: the label is removed (empty content),
# the middle of the plate is sampled, and the worst frame (plate closest to the label colour) is reported. Large bold text needs 3:1, body 4.5:1.
function Measure-LabelContrast($scene, $game, [string]$state, [int]$frames, [int]$interval) {
    $b = $scene.Button
    $game.IsLaunching = $state -eq 'launching'; $game.IsRunning = $state -eq 'running'
    Pump 60
    $fgBrush = $b.Foreground
    $fg = if ($fgBrush -is [Windows.Media.SolidColorBrush]) { $fgBrush.Color } else { [Windows.Media.Colors]::White }
    $lf = Get-Luminance $fg.R $fg.G $fg.B
    $worst = 99.0; $worstAt = 0
    for ($f = 0; $f -lt $frames; $f++) {
        $scene.Win.UpdateLayout()
        $bmp = Grab $scene.Target $scene.Target.ActualWidth $scene.Target.ActualHeight $scene.Back
        $pad = 8 * $Scale
        $x0 = [int]($pad + 0.3 * $scene.Target.ActualWidth * $Scale); $x1 = [int]($pad + 0.7 * $scene.Target.ActualWidth * $Scale)
        $y0 = [int]($pad + 0.35 * $scene.Target.ActualHeight * $Scale); $y1 = [int]($pad + 0.65 * $scene.Target.ActualHeight * $Scale)
        $w = $x1 - $x0; $h = $y1 - $y0
        $buf = New-Object byte[] ($w * $h * 4)
        $bmp.CopyPixels((New-Object Windows.Int32Rect $x0, $y0, $w, $h), $buf, $w * 4, 0)
        for ($i = 0; $i -lt $buf.Length; $i += 16) {
            $lb = Get-Luminance $buf[$i + 2] $buf[$i + 1] $buf[$i]
            $ratio = ([math]::Max($lf, $lb) + 0.05) / ([math]::Min($lf, $lb) + 0.05)
            if ($ratio -lt $worst) { $worst = $ratio; $worstAt = $f }
        }
        Pump $interval
    }
    $game.IsLaunching = $false; $game.IsRunning = $false; Pump 60
    return [pscustomobject]@{ State = $state; Fg = ('#{0:X2}{1:X2}{2:X2}' -f $fg.R, $fg.G, $fg.B); Worst = [math]::Round($worst, 2); Frame = $worstAt }
}

function New-Surface($res, [string]$name, $game, [bool]$hover) {
    $scene = @{ Host = $null; Element = $null; Target = $null; IsList = $false; Width = 0; Height = 0 }
    switch ($name) {
        'details row' { $c = New-Object Windows.Controls.ListBox; $c.ItemContainerStyle = $res['DetailsViewItemStyle']; $scene.Width = 360; $scene.Height = 34 }
        'cover tile' {
            $c = New-Object Windows.Controls.ListBox; $c.ItemContainerStyle = $res['GridViewItemStyle']; $scene.Width = 150; $scene.Height = 200
            # A stand-in cover so the tint, scan and band are judged over art, not a flat colour.
            $c.ItemTemplate = [Windows.Markup.XamlReader]::Parse('<DataTemplate xmlns="http://schemas.microsoft.com/winfx/2006/xaml/presentation"><Border><Border.Background><LinearGradientBrush StartPoint="0,0" EndPoint="1,1"><GradientStop Color="#FF3B6E8F" Offset="0"/><GradientStop Color="#FF8A5A2B" Offset="0.55"/><GradientStop Color="#FF1E2A1B" Offset="1"/></LinearGradientBrush></Border.Background><TextBlock Text="COVER" Foreground="#CCFFFFFF" FontSize="20" FontWeight="Bold" HorizontalAlignment="Center" VerticalAlignment="Center"/></Border></DataTemplate>')
        }
        'list view row' {
            $c = New-Object Windows.Controls.ListView; $gv = New-Object Windows.Controls.GridView
            $col = New-Object Windows.Controls.GridViewColumn; $col.DisplayMemberBinding = New-Object Windows.Data.Binding 'Name'
            $gv.Columns.Add($col); $c.View = $gv; $scene.Width = 360; $scene.Height = 34
        }
        'game page action' {
            $g = New-Object Windows.Controls.Grid; $g.Width = 190; $g.Height = 48
            $b = New-Object Windows.Controls.Button; $b.Content = 'Running'; $b.Tag = 'ContextAction'
            if ($res['PlayButton']) { $b.Style = $res['PlayButton'] }
            $o = New-Object Windows.Controls.Control; $o.Style = $res['RunningActionIndicator']
            $g.Children.Add($b) | Out-Null; $g.Children.Add($o) | Out-Null
            $c = $g; $scene.Width = 190; $scene.Height = 48; $scene.Button = $b
        }
    }
    $scene.IsList = $c -is [Windows.Controls.ItemsControl]
    if ($scene.IsList) { $c.ItemsSource = (New-Items $game) } else { $c.DataContext = $game }
    $win = New-Object Windows.Window
    $win.Resources = $res; $win.Width = 500; $win.Height = 360; $win.Left = -4000; $win.ShowInTaskbar = $false; $win.WindowStyle = 'None'
    $back = $res['ContentBackgroundBrush']; if (-not $back) { $back = $res['WindowBackgourndBrush'] }
    $win.Background = $back; if ($c -is [Windows.Controls.Control] -or $c -is [Windows.Controls.Panel]) { $c.Background = $back }
    $win.Content = $c; $win.Show(); Pump 80
    $scene.Win = $win; $scene.Control = $c; $scene.Back = $back
    if ($scene.IsList) {
        $scene.Element = $c.ItemContainerGenerator.ContainerFromIndex(0)
        $scene.Element.Width = $scene.Width; $scene.Element.Height = $scene.Height
        $win.UpdateLayout(); $scene.Target = $scene.Element
    }
    else { $scene.Target = $c }
    return $scene
}

function Capture-Sequence($scene, $game, [string]$state, [int]$frames, [int]$interval, [bool]$selected) {
    $game.IsLaunching = $state -eq 'launching'; $game.IsRunning = $state -eq 'running'
    if ($scene.IsList) { $scene.Control.SelectedIndex = $(if ($selected) { 0 } else { -1 }) }
    Pump 30
    $list = @()
    for ($f = 0; $f -lt $frames; $f++) {
        $scene.Win.UpdateLayout()
        $t = $scene.Target
        $list += , (Grab $t $t.ActualWidth $t.ActualHeight $scene.Back)
        Pump $interval
    }
    $game.IsLaunching = $false; $game.IsRunning = $false; Pump 60
    return , $list
}

New-Item -ItemType Directory -Force -Path $OutDir | Out-Null
foreach ($theme in $themes) {
    $blocks = New-Object System.Collections.Generic.List[object]
    $contrastLines = New-Object System.Collections.Generic.List[string]
    foreach ($hoverPass in $false, $true) {
        if ($hoverPass -and -not ($Surfaces -contains 'game page action')) { continue }
        $res = Load-Theme $theme $hoverPass
        foreach ($name in $Surfaces) {
            if ($hoverPass -and $name -ne 'game page action') { continue }
            $game = New-Object MotionFakeGame
            $scene = New-Surface $res $name $game $hoverPass
            try {
                if ($hoverPass) {
                    $scene.Button.Focusable = $true
                    [void][Windows.Input.Keyboard]::Focus($scene.Button); Pump 60
                    $blocks.Add(@{ Title = "$name  |  RUNNING + hover (Cancel on the label, nothing else changes)"; Frames = (Capture-Sequence $scene $game 'running' 2 400 $false) })
                    $blocks.Add(@{ Title = "$name  |  LAUNCHING + hover"; Frames = (Capture-Sequence $scene $game 'launching' 2 400 $false) })
                }
                else {
                    $blocks.Add(@{ Title = "$name  |  LAUNCHING (every 200 ms)"; Frames = (Capture-Sequence $scene $game 'launching' $LaunchFrames 200 $false) })
                    $blocks.Add(@{ Title = "$name  |  RUNNING (every 600 ms)"; Frames = (Capture-Sequence $scene $game 'running' $RunFrames 600 $false) })
                    if ($name -eq 'game page action') {
                        $scene.Button.Content = ''
                        $contrast = @((Measure-LabelContrast $scene $game 'launching' $LaunchFrames 200), (Measure-LabelContrast $scene $game 'running' $RunFrames 600))
                        foreach ($c in $contrast) {
                            $verdict = if ($c.Worst -ge 4.5) { 'ok' } elseif ($c.Worst -ge 3.0) { 'large text only (>= 3:1)' } else { 'FAIL (< 3:1)' }
                            $line = "$($theme.key) label contrast while $($c.State): worst $($c.Worst):1 (label $($c.Fg), frame $($c.Frame)) $verdict"
                            Write-Host $line; $contrastLines.Add($line) | Out-Null
                        }
                        $scene.Button.Content = 'Running'
                    }
                    if ($scene.IsList) {
                        $blocks.Add(@{ Title = "$name  |  LAUNCHING, selected"; Frames = (Capture-Sequence $scene $game 'launching' 4 300 $true) })
                        $blocks.Add(@{ Title = "$name  |  RUNNING, selected"; Frames = (Capture-Sequence $scene $game 'running' 3 900 $true) })
                    }
                }
            }
            finally { $scene.Win.Close() }
        }
    }
    # Contact sheet.
    $labelH = 20; $gap = 6
    $sheetW = 0; $sheetH = 0
    foreach ($b in $blocks) {
        $fw = $b.Frames[0].PixelWidth; $fh = $b.Frames[0].PixelHeight
        $w = $b.Frames.Count * ($fw + $gap); if ($w -gt $sheetW) { $sheetW = $w }
        $sheetH += $labelH + $fh + $gap
    }
    $sheetW = [math]::Max($sheetW, 720)
    $dv = New-Object Windows.Media.DrawingVisual
    $dc = $dv.RenderOpen()
    $dc.DrawRectangle((New-Object Windows.Media.SolidColorBrush ([Windows.Media.Color]::FromRgb(40, 40, 44))), $null, (New-Object Windows.Rect 0, 0, $sheetW, $sheetH))
    $y = 0
    foreach ($b in $blocks) {
        $ft = New-Object Windows.Media.FormattedText ("$($theme.key)  |  " + $b.Title), ([Globalization.CultureInfo]::InvariantCulture), ([Windows.FlowDirection]::LeftToRight), (New-Object Windows.Media.Typeface 'Segoe UI'), 12, ([Windows.Media.Brushes]::White), 1.0
        $dc.DrawText($ft, (New-Object Windows.Point 4, ($y + 2)))
        $y += $labelH; $x = 0
        foreach ($img in $b.Frames) { $dc.DrawImage($img, (New-Object Windows.Rect $x, $y, $img.PixelWidth, $img.PixelHeight)); $x += $img.PixelWidth + $gap }
        $y += $b.Frames[0].PixelHeight + $gap
    }
    $dc.Close()
    $sheet = New-Object Windows.Media.Imaging.RenderTargetBitmap ([int]$sheetW), ([int]$sheetH), 96, 96, ([Windows.Media.PixelFormats]::Pbgra32)
    $sheet.Render($dv)
    $enc = New-Object Windows.Media.Imaging.PngBitmapEncoder
    $enc.Frames.Add([Windows.Media.Imaging.BitmapFrame]::Create($sheet))
    $suffix = if (@($Surfaces).Count -lt 4) { '-' + ((@($Surfaces) -join '+') -replace ' ', '') } else { '' }
    $path = Join-Path $OutDir "$($theme.key)-motion$suffix.png"
    $fs = [IO.File]::Create($path); $enc.Save($fs); $fs.Close()
    if ($contrastLines.Count) { Set-Content -LiteralPath (Join-Path $OutDir "$($theme.key)-contrast.txt") -Value $contrastLines }
    Write-Host "wrote $path"
}
