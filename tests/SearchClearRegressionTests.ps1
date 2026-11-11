# Run with pwsh -STA -File tests/SearchClearRegressionTests.ps1.
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName PresentationFramework, PresentationCore
if ([Threading.Thread]::CurrentThread.ApartmentState -ne 'STA') { throw 'Run with pwsh -STA.' }
$root = Split-Path $PSScriptRoot -Parent
$themes = (Get-Content "$root/src/extensions.json" -Raw | ConvertFrom-Json).extensions | Where-Object kind -eq theme
$failures = [Collections.Generic.List[string]]::new()
$count = 0
# InputHitTest needs a presentation source. Keep it offscreen and never show it.
$hostParameters = [Windows.Interop.HwndSourceParameters]::new('Search clear regression')
$hostParameters.Width = 280
$hostParameters.Height = 40
$hostParameters.PositionX = -10000
$hostParameters.PositionY = -10000
$hostParameters.WindowStyle = 0
$hostSource = [Windows.Interop.HwndSource]::new($hostParameters)
try {
foreach ($theme in $themes) {
    # Use the theme's real clear glyph, including decorative non-hit-testable children.
    [xml]$media = Get-Content "$root/$($theme.dir)/src/Media.xaml" -Raw
    $resources = '<Style x:Key="BareTextBox" TargetType="TextBox" /><Style x:Key="BaseTextBlockStyle" TargetType="TextBlock" />'
    $resources += '<SolidColorBrush x:Key="TextBrushDarker" Color="Gray" /><SolidColorBrush x:Key="TextBrush" Color="White" /><SolidColorBrush x:Key="GlyphBrush" Color="Gold" />'
    if (-not $media.SelectSingleNode('//*[@*[local-name()="Key"]="ClearTextIconTemplate"]')) {
        $resources += '<DataTemplate x:Key="ClearTextIconTemplate"><TextBlock Text="X" /></DataTemplate>'
    }
    foreach ($node in $media.DocumentElement.ChildNodes) {
        if ($node.LocalName -eq 'Geometry' -or ($node.LocalName -eq 'DataTemplate' -and $node.GetAttribute('Key', 'http://schemas.microsoft.com/winfx/2006/xaml') -in @('IconTemplate', 'IconSmallTemplate', 'ClearTextIconTemplate'))) {
            $resources += $node.OuterXml
        }
    }
    foreach ($relative in 'CustomControls/SearchBox.xaml', 'Views/TopPanel.xaml') {
        [xml]$xml = Get-Content "$root/$($theme.dir)/src/$relative" -Raw
        foreach ($template in $xml.SelectNodes('//*[local-name()="ControlTemplate" and contains(@TargetType,"SearchBox")]')) {
            # Exercise the actual visual tree without starting another Playnite process.
            $text = $template.OuterXml.Replace('{x:Type SearchBox}', '{x:Type ContentControl}').Replace('TargetType="SearchBox"', 'TargetType="ContentControl"')
            $text = $text.Replace('Property="Text"', 'Property="Tag"').Replace('Property="IsKeyboardFocusWithin"', 'Property="IsTabStop"').Replace('Property="ShowImage"', 'Property="Focusable"')
            $xaml = '<ContentControl Foreground="Gray" xmlns="http://schemas.microsoft.com/winfx/2006/xaml/presentation" xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml"><ContentControl.Resources>' + $resources + '</ContentControl.Resources><ContentControl.Template>' + $text + '</ContentControl.Template></ContentControl>'
            $control = [Windows.Markup.XamlReader]::Parse($xaml)
            $hostSource.RootVisual = $control
            $control.Focusable = $true
            $control.ApplyTemplate() | Out-Null
            $clear = $control.Template.FindName('PART_ClearTextIcon', $control)
            $textInput = $control.Template.FindName('PART_TextInpuText', $control)
            if (-not $clear -or -not $textInput) { throw "$($theme.key): missing search parts" }
            # Playnite attaches its clear handler to this ContentControl's mouse event.
            $clear.Add_MouseUp({ $textInput.Clear() }.GetNewClosure())
            foreach ($focused in $false, $true) {
                $control.IsTabStop = $focused
                $textInput.Text = 'new'
                $control.Tag = 'new'
                $clear.Visibility = 'Visible'
                $control.Measure([Windows.Size]::new(280, 40))
                $control.Arrange([Windows.Rect]::new(0, 0, 280, 40))
                $control.UpdateLayout()
                foreach ($fraction in @(@(0.1, 0.1), @(0.5, 0.5), @(0.9, 0.9))) {
                    $textInput.Text = 'new'
                    $point = $clear.TranslatePoint([Windows.Point]::new($clear.ActualWidth * $fraction[0], $clear.ActualHeight * $fraction[1]), $control)
                    $hit = $control.InputHitTest($point)
                    $inside = $false
                    for ($parent = $hit; $parent; $parent = [Windows.Media.VisualTreeHelper]::GetParent($parent)) {
                        if ($parent -eq $clear) { $inside = $true; break }
                    }
                    if (-not $inside) {
                        $failures.Add("$($theme.key) $relative focus=$focused point=$fraction misses clear icon")
                        continue
                    }
                    $event = [Windows.Input.MouseButtonEventArgs]::new([Windows.Input.Mouse]::PrimaryDevice, 0, [Windows.Input.MouseButton]::Left)
                    $event.RoutedEvent = [Windows.UIElement]::MouseUpEvent
                    $hit.RaiseEvent($event)
                    if ($textInput.Text -ne '') { throw "$($theme.key): clear mouse event did not reach the runtime part" }
                }
            }
            $clear.Visibility = 'Collapsed'
            $control.UpdateLayout()
            if ($clear.IsVisible) { throw "$($theme.key): runtime cannot hide clear icon for empty text" }
            $count++
        }
    }
}
} finally { $hostSource.Dispose() }
if ($failures.Count) { throw "$($failures.Count) clear hit-test failures across $count templates:`n$(($failures | Select-Object -First 8) -join "`n")" }
Write-Host "PASS: $count search templates clear typed text across the icon hit area, focused and unfocused."
