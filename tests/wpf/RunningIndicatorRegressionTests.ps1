# Run with pwsh -STA -File tests/wpf/RunningIndicatorRegressionTests.ps1 [-Keys emberline,ace].
# Loads each theme's built running-game indicator (artifacts/builds/themes/<key>; build first) into plain WPF and drives
# a fake game through launching -> running -> selected -> stopped on the details row, the cover tile, the list view row
# and the game page's RunningActionIndicator. docs/themes/reference.md -> Running game indicator.
# -RenderDir <folder> also saves <key>-<case>.png of each item running and selected (no art: a sizing and colour check).
param([string[]]$Keys, [string]$RenderDir)
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName PresentationFramework, PresentationCore, WindowsBase, System.Xaml
if ([Threading.Thread]::CurrentThread.ApartmentState -ne 'STA') { throw 'Run with pwsh -STA.' }
if (-not ('RunningIndicatorFakeGame' -as [type])) {
    Add-Type -TypeDefinition @"
using System.ComponentModel;
public class RunningIndicatorFakeGame : INotifyPropertyChanged {
    bool r, l, i = true;
    public event PropertyChangedEventHandler PropertyChanged;
    void N(string p) { if (PropertyChanged != null) PropertyChanged(this, new PropertyChangedEventArgs(p)); }
    public bool IsRunning { get { return r; } set { r = value; N("IsRunning"); } }
    public bool IsLaunching { get { return l; } set { l = value; N("IsLaunching"); } }
    public bool IsInstalled { get { return i; } set { i = value; N("IsInstalled"); } }
    public string Name { get { return "Game"; } }
    public override string ToString() { return "Game"; }
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
function ConvertTo-TestXaml([string]$text) {
    # Playnite-only markup has no meaning here: {Settings} values become literals, their triggers go.
    # {x:Null} is a real ImageSource. Leaving the attribute empty makes Show() throw ImageSourceConverter.
    $text = $text -replace '\{Settings [A-Za-z.]+\}', '4'
    $text = $text -replace '\{ThemeFile [^}]*\}', '{x:Null}'
    $text = $text -replace '<DataTrigger Binding="4"[^>]*>[\s\S]*?</DataTrigger>', ''
    return $text
}
function Read-Dictionary([string]$path) {
    return [Windows.Markup.XamlReader]::Parse((ConvertTo-TestXaml (Get-Content -Raw -LiteralPath $path)))
}
function New-Items($game) {
    $items = New-Object 'System.Collections.ObjectModel.ObservableCollection[object]'
    $items.Add($game.psobject.BaseObject)
    return , $items
}

if (-not ('RunningIndicatorUpperConverter' -as [type])) {
    Add-Type -ReferencedAssemblies PresentationFramework, WindowsBase, System.Xaml -TypeDefinition @"
public class RunningIndicatorUpperConverter : System.Windows.Data.IValueConverter {
    public object Convert(object v, System.Type t, object p, System.Globalization.CultureInfo c) { return v == null ? null : v.ToString().ToUpperInvariant(); }
    public object ConvertBack(object v, System.Type t, object p, System.Globalization.CultureInfo c) { return v; }
}
"@
}
# StaticResource BaseStyle resolves while parsing, so it lives in Application resources.
$app = [Windows.Application]::Current
if (-not $app) { $app = New-Object Windows.Application; $app.ShutdownMode = 'OnExplicitShutdown' }
if (-not $app.Resources.Contains('StringToUpperCaseConverter')) { $app.Resources.Add('StringToUpperCaseConverter', (New-Object RunningIndicatorUpperConverter)) }
if (-not $app.Resources.Contains('BaseStyle')) { $app.Resources.Add('BaseStyle', (New-Object Windows.Style ([Windows.Controls.Control]))) }

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
    $drop = Join-Path $root "artifacts/builds/themes/$($theme.key)"
    if (-not (Test-Path (Join-Path $drop 'Constants.xaml'))) { $failures.Add("$($theme.key): no build drop; run build-theme.ps1 -NoDeploy first"); continue }
    $res = New-Object Windows.ResourceDictionary
    try {
        $res.MergedDictionaries.Add((Read-Dictionary (Join-Path $drop 'Constants.xaml')))
        # Shared templates (chamfers, slants, glows) live in Common.xaml. Load it when it parses on its own, so shaped frames draw.
        # Playnite-side base styles it names (BaseTextBlockStyle, ...) are stubbed as empty FrameworkElement styles.
        for ($try = 0; $try -lt 12; $try++) {
            try { $res.MergedDictionaries.Add((Read-Dictionary (Join-Path $drop 'Common.xaml'))); break }
            catch {
                $msg = $_.Exception.GetBaseException().Message
                if ($msg -match "Cannot find resource named '([^']+)'" -and -not $app.Resources.Contains($Matches[1])) {
                    $app.Resources.Add($Matches[1], (New-Object Windows.Style ([Windows.FrameworkElement])))
                }
                else { Write-Host "note: $($theme.key) Common.xaml not loaded ($($msg.Split([char]10)[0]))"; break }
            }
        }
        foreach ($rel in 'DerivedStyles/DetailsViewItemStyle.xaml', 'DerivedStyles/GridViewItemStyle.xaml', 'DefaultControls/ListView.xaml', 'DerivedStyles/PlayButton.xaml') {
            $res.MergedDictionaries.Add((Read-Dictionary (Join-Path $drop $rel)))
        }
    }
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
                # The real cell: the context action drawn with the theme's PlayButton (Tag ContextAction), the overlay on top.
                $g = New-Object Windows.Controls.Grid; $g.Width = 190; $g.Height = 48
                $b = New-Object Windows.Controls.Button; $b.Content = 'Running'; $b.Tag = 'ContextAction'
                if ($res['PlayButton']) { $b.Style = $res['PlayButton'] }
                $c = New-Object Windows.Controls.Control; $c.Style = $res['RunningActionIndicator']
                $g.Children.Add($b) | Out-Null; $g.Children.Add($c) | Out-Null; $g } }
    )
    foreach ($case in $cases) {
        $checks++
        $game = New-Object RunningIndicatorFakeGame
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
                $bmp = New-Object Windows.Media.Imaging.RenderTargetBitmap ([int][math]::Ceiling($target.ActualWidth + 16)), ([int][math]::Ceiling($target.ActualHeight + 16)), 96, 96, ([Windows.Media.PixelFormats]::Pbgra32)
                $dv = New-Object Windows.Media.DrawingVisual
                $dc = $dv.RenderOpen()
                $dc.DrawRectangle($back, $null, (New-Object Windows.Rect 0, 0, ($target.ActualWidth + 16), ($target.ActualHeight + 16)))
                $vb = New-Object Windows.Media.VisualBrush $target
                $dc.DrawRectangle($vb, $null, (New-Object Windows.Rect 8, 8, $target.ActualWidth, $target.ActualHeight))
                $dc.Close(); $bmp.Render($dv)
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
