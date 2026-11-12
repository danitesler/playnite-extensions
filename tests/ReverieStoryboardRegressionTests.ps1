# Cover hover animation targets must belong to the template that owns the trigger.
# Run with pwsh -STA -File tests/ReverieStoryboardRegressionTests.ps1.
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName PresentationFramework, PresentationCore
if ([Threading.Thread]::CurrentThread.ApartmentState -ne 'STA') { throw 'Run with pwsh -STA.' }
$src = Join-Path (Split-Path $PSScriptRoot -Parent) 'src/themes/Reverie/src'
# Every ControlTemplate in the theme: hover wobble, glow and settle storyboards must target names of their own template.
$templates = foreach ($path in (Get-ChildItem -LiteralPath $src -Recurse -Filter *.xaml | Where-Object { $_.Name -ne 'Constants.xaml' })) {
    [xml]$document = Get-Content -LiteralPath $path.FullName -Raw
    $document.SelectNodes("//*[local-name()='ControlTemplate']")
}
foreach ($template in $templates) {
    $names = @($template.SelectNodes(".//*[@Name or @*[local-name()='Name']]") | ForEach-Object {
        $_.GetAttribute('Name')
        $_.GetAttribute('Name', 'http://schemas.microsoft.com/winfx/2006/xaml')
    })
    foreach ($animation in $template.SelectNodes(".//*[@Storyboard.TargetName]")) {
        $target = $animation.GetAttribute('Storyboard.TargetName')
        if ($target -notin $names) { throw "Animation target '$target' is outside its owning $($template.TargetType) template." }
    }
}
foreach ($buttonTemplate in ($templates | Where-Object { $_.TargetType -eq "Button" -and $_.OuterXml -match "Storyboard" })) {
    $markup = '<Button xmlns="http://schemas.microsoft.com/winfx/2006/xaml/presentation" xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml" xmlns:sys="clr-namespace:System;assembly=mscorlib" IsEnabled="False"><Button.Template>' +
        $buttonTemplate.OuterXml.Replace('Property="IsMouseOver"', 'Property="IsEnabled"').Replace('Binding IsMouseOver,', 'Binding IsEnabled,').Replace('{x:Static SystemParameters.ClientAreaAnimation}', '{x:Static sys:Boolean.TrueString}') + '</Button.Template></Button>'
    $button = [Windows.Markup.XamlReader]::Parse($markup)
    $button.ApplyTemplate() | Out-Null
    foreach ($enabled in @($true, $false, $true, $false)) {
        $button.IsEnabled = $enabled
        $button.Measure([Windows.Size]::new(40,40))
        $button.Arrange([Windows.Rect]::new(0,0,40,40))
        $button.UpdateLayout()
    }
}
Write-Host "PASS: every theme template keeps its hover, wobble and settle storyboards inside its own names, and the button templates run them without exceptions."
