# Run with pwsh -STA -File tests/SearchGlyphRegressionTests.ps1.
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName PresentationFramework
if ([Threading.Thread]::CurrentThread.ApartmentState -ne 'STA') { throw 'Run with pwsh -STA.' }
$root = Split-Path $PSScriptRoot -Parent
$themes = (Get-Content "$root/src/extensions.json" -Raw | ConvertFrom-Json).extensions | Where-Object kind -eq theme
$count = 0
foreach ($theme in $themes) {
    foreach ($relative in 'CustomControls/SearchBox.xaml', 'Views/TopPanel.xaml') {
        [xml]$xml = Get-Content "$root/$($theme.dir)/src/$relative" -Raw
        foreach ($template in $xml.SelectNodes('//*[local-name()="ControlTemplate" and contains(@TargetType,"SearchBox")]')) {
            $placeholder = $template.SelectSingleNode('.//*[@*[local-name()="Name"]="PART_SeachIcon"]')
            $glyph = $template.SelectSingleNode('.//*[@*[local-name()="Name"]="Glyph"]')
            if (-not $placeholder -or -not $glyph) { throw "$($theme.key): missing search parts" }
            for ($parent = $glyph.ParentNode; $parent; $parent = $parent.ParentNode) {
                if ($parent -eq $placeholder) { throw "$($theme.key): magnifier is inside the runtime-hidden placeholder" }
            }
            # Exercise each real visual template on a stock ContentControl. Tag
            # represents search text; writable booleans simulate focus/ShowImage.
            $text = $template.OuterXml.Replace('{x:Type SearchBox}', '{x:Type ContentControl}').Replace('TargetType="SearchBox"', 'TargetType="ContentControl"')
            $text = $text.Replace('Property="Text"', 'Property="Tag"').Replace('Property="IsKeyboardFocusWithin"', 'Property="IsEnabled"').Replace('Property="ShowImage"', 'Property="IsTabStop"')
            $xaml = '<ContentControl xmlns="http://schemas.microsoft.com/winfx/2006/xaml/presentation" xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml"><ContentControl.Resources><SolidColorBrush x:Key="TextBrushDarker" Color="Gray" /><SolidColorBrush x:Key="GlyphBrush" Color="Gold" /><Style x:Key="BareTextBox" TargetType="TextBox" /><Style x:Key="BaseTextBlockStyle" TargetType="TextBlock" /></ContentControl.Resources><ContentControl.Template>' + $text + '</ContentControl.Template></ContentControl>'
            $control = [Windows.Markup.XamlReader]::Parse($xaml)
            $control.IsTabStop = $true
            $control.ApplyTemplate() | Out-Null
            $icon = $control.Template.FindName('Glyph', $control)
            $hint = $control.Template.FindName('PART_SeachIcon', $control)
            foreach ($scenario in @(@('', $false, 'Gray'), @('', $true, 'Gold'), @('Stardew', $true, 'Gold'), @('Stardew', $false, 'Gold'))) {
                $control.Tag = $scenario[0]
                $control.IsEnabled = $scenario[1]
                # Playnite hides this part when focused or nonempty.
                $hint.Visibility = $(if ($scenario[1] -or $scenario[0]) { 'Collapsed' } else { 'Visible' })
                $control.Measure([Windows.Size]::new(280, 40))
                $control.Arrange([Windows.Rect]::new(0, 0, 280, 40))
                $control.UpdateLayout()
                if ($icon.Visibility -ne 'Visible') { throw "$($theme.key): search glyph hidden" }
                $expected = [Windows.Media.ColorConverter]::ConvertFromString($scenario[2])
                if ($icon.Foreground.Color -ne $expected) { throw "$($theme.key): wrong magnifier color for text='$($scenario[0])', focus=$($scenario[1])" }
            }
            $control.IsTabStop = $false
            $control.UpdateLayout()
            if ($icon.Visibility -ne 'Collapsed') { throw "$($theme.key): ShowImage=False ignored" }
            $control.IsTabStop = $true
            $control.UpdateLayout()
            if ($icon.Visibility -ne 'Visible') { throw "$($theme.key): magnifier not restored" }
            $count++
        }
    }
}
Write-Host "PASS: $count search templates keep their magnifier visible with idle, focused, typed and blurred text."
