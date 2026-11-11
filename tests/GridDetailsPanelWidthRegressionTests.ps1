# Run with pwsh -STA -File tests/GridDetailsPanelWidthRegressionTests.ps1.
param([string]$PlaynitePath = (Join-Path $env:LOCALAPPDATA 'Playnite'), [string[]]$Keys = @())
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName PresentationFramework, PresentationCore
if ([Threading.Thread]::CurrentThread.ApartmentState -ne 'STA') { throw 'Run with pwsh -STA.' }
$root = Split-Path $PSScriptRoot -Parent
$themes = (Get-Content "$root/src/extensions.json" -Raw | ConvertFrom-Json).extensions | Where-Object kind -eq theme
if ($Keys.Count) { $themes = $themes | Where-Object key -in $Keys }
$namespace = 'http://schemas.microsoft.com/winfx/2006/xaml/presentation'
function Settle-Layout($control, [double]$width) {
    foreach ($iteration in 1..5) {
        $control.Measure([Windows.Size]::new($width, 600))
        $control.Arrange([Windows.Rect]::new(0, 0, $width, 600))
        $control.UpdateLayout()
        $control.Dispatcher.Invoke([Action]{}, [Windows.Threading.DispatcherPriority]::DataBind)
    }
}
$checks = 0
foreach ($theme in $themes) {
    $path = "$root/$($theme.dir)/src/Views/LibraryGridView.xaml"
    # Before the fix every theme inherits this installed Default template.
    if (-not (Test-Path $path)) { $path = Join-Path $PlaynitePath 'Themes/Desktop/Default/Views/LibraryGridView.xaml' }
    [xml]$xml = Get-Content $path -Raw
    $panelNode = $xml.SelectSingleNode('//*[@*[local-name()="Name"]="PART_ControlGameView"]')
    if ($panelNode.Width -ne '{Settings GrdiDetailsWitdh}') { throw "$($theme.key): configured panel width binding was lost" }
    foreach ($part in 'PART_ListGames', 'PART_SliderZoom') {
        if (-not $xml.SelectSingleNode('//*[@*[local-name()="Name"]="' + $part + '"]')) { throw "$($theme.key): missing $part" }
    }
    foreach ($dock in 'Left', 'Right') {
        # Preserve the real template's sizing bindings and DockPanel layout;
        # substitute plain WPF controls for Playnite's game and cover content.
        $attributes = ''
        foreach ($attribute in $panelNode.Attributes) {
            if ($attribute.LocalName -eq 'Name') { continue }
            $value = $attribute.Value.Replace('{Settings GrdiDetailsWitdh}', '{Binding Tag, RelativeSource={RelativeSource TemplatedParent}}').Replace('{Settings GridViewDetailsPosition}', $dock)
            $attributes += ' ' + $attribute.Name + '="' + [Security.SecurityElement]::Escape($value) + '"'
        }
        $markup = '<Grid xmlns="' + $namespace + '" xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml"><Grid.ColumnDefinitions><ColumnDefinition Width="44"/><ColumnDefinition Width="0"/><ColumnDefinition Width="*"/></Grid.ColumnDefinitions><ContentControl Name="LibraryViewport" Grid.Column="2"><ContentControl.Template><ControlTemplate TargetType="ContentControl"><DockPanel><Border x:Name="PART_ControlGameView"' + $attributes + '><TextBlock TextWrapping="Wrap" Text="A long description that must stay within the visible game details panel when the window shrinks."/></Border><Border x:Name="CoverGrid"/></DockPanel></ControlTemplate></ContentControl.Template></ContentControl></Grid>'
        $window = [Windows.Markup.XamlReader]::Parse($markup)
        $hostControl = $window.FindName('LibraryViewport')
        $hostControl.Tag = [double]1120
        $hostControl.ApplyTemplate() | Out-Null
        $panel = $hostControl.Template.FindName('PART_ControlGameView', $hostControl)
        $covers = $hostControl.Template.FindName('CoverGrid', $hostControl)
        foreach ($filterWidth in 0, 240) {
            $window.ColumnDefinitions[1].Width = [Windows.GridLength]::new($filterWidth)
            foreach ($preferredWidth in 300, 1120, 1800) {
                $hostControl.Tag = [double]$preferredWidth
                foreach ($windowWidth in 2000, 1400, 900, 640, 420, 1000, 2000) {
                    Settle-Layout $window $windowWidth
                    $available = $windowWidth - 44 - $filterWidth
                    $expected = [math]::Min($preferredWidth, $available)
                    $position = $panel.TranslatePoint([Windows.Point]::new(0, 0), $hostControl)
                    if ([math]::Abs($panel.ActualWidth - $expected) -gt 0.1 -or
                        $position.X -lt -0.1 -or $position.X + $panel.ActualWidth -gt $available + 0.1) {
                        throw "$($theme.key): $dock panel clipped at window=$windowWidth, filters=$filterWidth, preferred=$preferredWidth (actual=$($panel.ActualWidth), available=$available, x=$($position.X))"
                    }
                    if ([math]::Abs($covers.ActualWidth - ($available - $expected)) -gt 0.1 -or $panel.Width -ne $preferredWidth) {
                        throw "$($theme.key): cover space or preferred width changed during resize"
                    }
                    $checks++
                }
            }
        }
        $panel.Visibility = 'Collapsed'
        Settle-Layout $window 1000
        if ([math]::Abs($covers.ActualWidth - $hostControl.ActualWidth) -gt 0.1) { throw "$($theme.key): closing details did not restore cover space" }
        $panel.Visibility = 'Visible'
        Settle-Layout $window 1000
        if ($panel.ActualWidth -gt $hostControl.ActualWidth + 0.1) { throw "$($theme.key): reopened details overflow" }
    }
}
Write-Host "PASS: $(@($themes).Count) grid hosts, $checks window/filter/preferred-width/docking combinations, plus closing and reopening details."
