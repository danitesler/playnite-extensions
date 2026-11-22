# Shared WPF fixtures for the running indicator, overlap and motion capture scripts.
Add-Type -AssemblyName PresentationFramework, PresentationCore, WindowsBase, System.Xaml
if ([Threading.Thread]::CurrentThread.ApartmentState -ne 'STA') { throw 'Run with pwsh -STA.' }
if (-not ('RunningTestGame' -as [type])) {
    Add-Type -TypeDefinition @"
using System.ComponentModel;
public class RunningTestGame : INotifyPropertyChanged {
    bool r, l, i = true;
    public event PropertyChangedEventHandler PropertyChanged;
    void N(string p) { if (PropertyChanged != null) PropertyChanged(this, new PropertyChangedEventArgs(p)); }
    public bool IsRunning { get { return r; } set { r = value; N("IsRunning"); } }
    public bool IsLaunching { get { return l; } set { l = value; N("IsLaunching"); } }
    public bool IsInstalled { get { return i; } set { i = value; N("IsInstalled"); } }
    public string Name { get; set; } = "Game";
    public override string ToString() { return Name; }
}
"@
}
if (-not ('RunningTestUpperConverter' -as [type])) {
    Add-Type -ReferencedAssemblies PresentationFramework, WindowsBase, System.Xaml -TypeDefinition @"
public class RunningTestUpperConverter : System.Windows.Data.IValueConverter {
    public object Convert(object v, System.Type t, object p, System.Globalization.CultureInfo c) { return v == null ? null : v.ToString().ToUpperInvariant(); }
    public object ConvertBack(object v, System.Type t, object p, System.Globalization.CultureInfo c) { return v; }
}
"@
}
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
    $text = $text -replace '\{MainViewModel [^}]*\}', '{x:Null}'
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
if (-not $app.Resources.Contains('StringToUpperCaseConverter')) { $app.Resources.Add('StringToUpperCaseConverter', (New-Object RunningTestUpperConverter)) }
if (-not $app.Resources.Contains('LOCCancelLabel')) { $app.Resources.Add('LOCCancelLabel', 'Cancel') }
if (-not $app.Resources.Contains('BaseStyle')) { $app.Resources.Add('BaseStyle', (New-Object Windows.Style ([Windows.Controls.Control]))) }

function Load-Theme($theme, [bool]$hover = $false, [switch]$SkipGrid, [switch]$Quiet) {
    $drop = Join-Path $root "artifacts/builds/themes/$($theme.key)"
    if (-not (Test-Path (Join-Path $drop 'Constants.xaml'))) { throw "no build drop for $($theme.key); run build-theme.ps1 -NoDeploy first" }
    $res = New-Object Windows.ResourceDictionary
    $res.MergedDictionaries.Add((Read-Dictionary (Join-Path $drop 'Constants.xaml')))
    for ($try = 0; $try -lt 12; $try++) {
        try { $res.MergedDictionaries.Add((Read-Dictionary (Join-Path $drop 'Common.xaml'))); break }
        catch {
            $msg = $_.Exception.GetBaseException().Message
            if ($msg -match "Cannot find resource named '([^']+)'" -and -not $app.Resources.Contains($Matches[1])) { $app.Resources.Add($Matches[1], (New-Object Windows.Style ([Windows.FrameworkElement]))) }
            else { if (-not $Quiet) { Write-Host "note: $($theme.key) Common.xaml not loaded ($($msg.Split([char]10)[0]))" }; break }
        }
    }
    foreach ($rel in 'DerivedStyles/DetailsViewItemStyle.xaml', 'DerivedStyles/GridViewItemStyle.xaml', 'DefaultControls/ListView.xaml', 'DerivedStyles/PlayButton.xaml') {
        if ($SkipGrid -and $rel -eq 'DerivedStyles/GridViewItemStyle.xaml') { continue }
        $res.MergedDictionaries.Add((Read-Dictionary (Join-Path $drop $rel) $hover))
    }
    return $res
}

function Get-TestBitmap($visual, [double]$w, [double]$h, $back, [int]$Scale = 1, [int]$Pad = 0) {
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
