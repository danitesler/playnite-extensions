# Run with pwsh -STA -File tests/DetailsViewLayoutRegressionTests.ps1.
param([string]$PlaynitePath = (Join-Path $env:LOCALAPPDATA 'Playnite'))
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName PresentationFramework, PresentationCore
if ([Threading.Thread]::CurrentThread.ApartmentState -ne 'STA') { throw 'Run with pwsh -STA.' }
[Reflection.Assembly]::LoadFrom((Join-Path $PlaynitePath 'MathConverter.dll')) | Out-Null
$root = Split-Path $PSScriptRoot -Parent
$themes = (Get-Content "$root/src/extensions.json" -Raw | ConvertFrom-Json).extensions | Where-Object kind -eq theme
$namespace = 'http://schemas.microsoft.com/winfx/2006/xaml/presentation'
$xNamespace = 'http://schemas.microsoft.com/winfx/2006/xaml'
$assembly = [HexInnovation.MathConverter].Assembly.GetName().Name
function Parse-Template([string]$content) {
    $resources = '<math:MathConverter x:Key="MathConverter" /><sys:Double x:Key="GameBannerHeight">320</sys:Double><sys:Double x:Key="GameDetailsPaneWidth">300</sys:Double><sys:Double x:Key="GridDetailsPaneWidth">300</sys:Double><Style x:Key="BaseTextBlockStyle" TargetType="TextBlock" /><Style x:Key="TextBlockGameScore" TargetType="TextBlock" /><Style x:Key="PropertyItemButton" TargetType="Button" />'
    $markup = '<ContentControl xmlns="' + $namespace + '" xmlns:x="' + $xNamespace + '" xmlns:sys="clr-namespace:System;assembly=mscorlib" xmlns:math="clr-namespace:HexInnovation;assembly=' + $assembly + '"><ContentControl.Resources>' + $resources + '</ContentControl.Resources><ContentControl.Template><ControlTemplate TargetType="ContentControl"><Grid>' + $content + '</Grid></ControlTemplate></ContentControl.Template></ContentControl>'
    $control = [Windows.Markup.XamlReader]::Parse($markup)
    $control.ApplyTemplate() | Out-Null
    return $control
}
function Settle($control) {
    foreach ($iteration in 1..4) {
        $control.Dispatcher.Invoke([Action]{}, [Windows.Threading.DispatcherPriority]::DataBind)
        $control.Measure([Windows.Size]::new(800, 2400))
        $control.Arrange([Windows.Rect]::new(0,0,800,2400))
        $control.UpdateLayout()
    }
}
$bannerChecks = 0
foreach ($theme in $themes) {
    [xml]$xml = Get-Content "$root/$($theme.dir)/src/Views/DetailsViewGameOverview.xaml" -Raw
    $height = $xml.SelectSingleNode('//*[local-name()="Setter"][@Property="Height" and contains(@Value,"HeroArt") and contains(@Value,"x *")]')
    $spacer = $height
    while ($spacer.LocalName -ne 'Border') { $spacer = $spacer.ParentNode }
    if (-not $spacer.HasAttribute('MinHeight')) { throw "$($theme.key): details view has no minimum gutter" }
    $floor = [double]$spacer.MinHeight
    if ($theme.key -eq 'ace' -and $floor -ne 20) { throw 'Ace details gutter must match its 20px side inset.' }
    $name = $spacer.GetAttribute('Name', $xNamespace)
    if (-not $name) { $name = $spacer.Name }
    $expression = [regex]::Match($height.Value,"ConverterParameter='([^']+)'").Groups[1].Value
    $math = [HexInnovation.MathConverter]::new()
    $control = Parse-Template ('<Border Name="HeroArt" Height="{DynamicResource GameBannerHeight}" VerticalAlignment="Top" />' + $spacer.OuterXml)
    $hero = $control.Template.FindName('HeroArt',$control)
    $gap = $control.Template.FindName($name,$control)
    foreach ($value in 320, 20, 10, 5, 0, 120, 600, 0, 320) {
        $control.Resources['GameBannerHeight'] = [double]$value
        Settle $control
        $expected = [math]::Max($floor,$math.Convert([double]$value,[double],$expression,[Globalization.CultureInfo]::InvariantCulture))
        if ([math]::Abs($gap.ActualHeight-$expected) -gt 0.1) { throw "$($theme.key): incorrect details gutter at $value (actual=$($gap.ActualHeight), expected=$expected)" }
        $bannerChecks++
    }
    $hero.Visibility = 'Collapsed'
    Settle $control
    if ([math]::Abs($gap.ActualHeight-$floor) -gt 0.1) { throw "$($theme.key): details gutter retained stale hidden-art height" }
    $bannerChecks++
}
$spacingChecks = 0
foreach ($view in 'Details','Grid') {
    [xml]$xml = Get-Content "$root/src/themes/Ace/src/Views/${view}ViewGameOverview.xaml" -Raw
    $first = $xml.SelectSingleNode('//*[@*[local-name()="Name"]="MetaProgress"]')
    $groupsHost = $first.ParentNode
    $clip = $groupsHost.ParentNode.CloneNode($true)
    $clipName = $clip.GetAttribute('Name', $xNamespace)
    if (-not $clipName) { $clipName = $clip.GetAttribute('Name') }
    if (-not $clipName) {
        $clipName = 'MetadataClip'
        $clip.SetAttribute('Name', $xNamespace, $clipName) | Out-Null
    }
    # Check the original row spacing in the preferred-width side pane. The
    # breakpoint regression covers the full-width stacked pane separately.
    $clip.SetAttribute('Width', '300')
    # Populate the existing fields, including wrapping captions. The theme's real
    # row/group margins, collapse triggers and clip compensation remain intact.
    foreach ($text in $clip.SelectNodes('.//*[local-name()="TextBlock"]')) {
        $text.SetAttribute('Text','A wrapping caption or value')
    }
    foreach ($button in $clip.SelectNodes('.//*[local-name()="Button"]')) { $button.SetAttribute('Content','Value') }
    $control = Parse-Template $clip.OuterXml
    $clipControl = $control.Template.FindName($clipName,$control)
    $rowNodes = @($clip.SelectNodes('.//*[local-name()="Grid"][@*[starts-with(local-name(),"Name") and starts-with(.,"PART_Elem")]]'))
    $groups = @($clip.SelectNodes('.//*[local-name()="Border"][@*[starts-with(.,"Meta") and local-name()="Name"]]'))
    foreach ($hideCount in 0, 1, 2) {
        foreach ($groupIndex in 0..($groups.Count-1)) {
            foreach ($node in $groups[$groupIndex].SelectNodes('.//*[local-name()="Grid"][@*[local-name()="Name" and starts-with(.,"PART_Elem")]]')) {
                $rowName = $node.GetAttribute('Name',$xNamespace)
                if (-not $rowName) { $rowName = $node.GetAttribute('Name') }
                $control.Template.FindName($rowName,$control).Visibility = $(if ($groupIndex -lt $hideCount) { 'Collapsed' } else { 'Visible' })
            }
        }
        Settle $control
        $previous = $null
        $previousGroup = $null
        foreach ($node in $rowNodes) {
            $rowName = $node.GetAttribute('Name',$xNamespace)
            if (-not $rowName) { $rowName = $node.GetAttribute('Name') }
            $row = $control.Template.FindName($rowName,$control)
            if ($row.Visibility -eq 'Collapsed') { continue }
            $group = $node.ParentNode.ParentNode
            $point = $row.TranslatePoint([Windows.Point]::new(0,0),$clipControl)
            if (-not $previous) {
                if ([math]::Abs($point.Y) -gt 0.1) { throw "Ace $view first visible metadata row is clipped or offset ($($point.Y))" }
            } else {
                $before = $previous.TranslatePoint([Windows.Point]::new(0,0),$clipControl)
                $gap = $point.Y-$before.Y-$previous.ActualHeight
                $expected = if ($group -eq $previousGroup) { 8 } else { 25 }
                if ([math]::Abs($gap-$expected) -gt 0.1) { throw "Ace $view metadata gap is $gap; expected $expected" }
            }
            $previous = $row
            $previousGroup = $group
            $spacingChecks++
        }
    }
}
Write-Host "PASS: $(@($themes).Count) details views, $bannerChecks live banner states, and $spacingChecks compact Ace metadata row/section checks."
