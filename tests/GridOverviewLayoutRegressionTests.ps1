# Run with pwsh -STA -File tests/GridOverviewLayoutRegressionTests.ps1.
param([string]$PlaynitePath = (Join-Path $env:LOCALAPPDATA 'Playnite'), [string[]]$Keys = @())
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName PresentationFramework, PresentationCore
if ([Threading.Thread]::CurrentThread.ApartmentState -ne 'STA') { throw 'Run with pwsh -STA.' }
[Reflection.Assembly]::LoadFrom((Join-Path $PlaynitePath 'MathConverter.dll')) | Out-Null
$root = Split-Path $PSScriptRoot -Parent
$themes = (Get-Content "$root/src/extensions.json" -Raw | ConvertFrom-Json).extensions | Where-Object kind -eq theme
if ($Keys.Count) { $themes = $themes | Where-Object key -in $Keys }
$namespace = 'http://schemas.microsoft.com/winfx/2006/xaml/presentation'
$converterAssembly = [HexInnovation.MathConverter].Assembly.GetName().Name
function Parse-TestControl([string]$body, [string]$tag = 'Grid') {
    $resources = '<math:MathConverter x:Key="MathConverter" /><sys:Double x:Key="GridDetailsPaneWidth">300</sys:Double><sys:Double x:Key="GameBannerHeight">320</sys:Double>'
    [Windows.Markup.XamlReader]::Parse('<' + $tag + ' xmlns="' + $namespace + '" xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml" xmlns:math="clr-namespace:HexInnovation;assembly=' + $converterAssembly + '" xmlns:sys="clr-namespace:System;assembly=mscorlib"><' + $tag + '.Resources>' + $resources + '</' + $tag + '.Resources>' + $body + '</' + $tag + '>')
}
function Settle-Layout($control, [double]$width, [double]$height = 600) {
    # ActualWidth, resource and converter bindings can each invalidate layout.
    foreach ($iteration in 1..5) {
        $frame = [Windows.Threading.DispatcherFrame]::new()
        $timer = [Windows.Threading.DispatcherTimer]::new([Windows.Threading.DispatcherPriority]::Send)
        $timer.Interval = [TimeSpan]::FromMilliseconds(5)
        $timer.Add_Tick({ $timer.Stop(); $frame.Continue = $false }.GetNewClosure())
        $timer.Start()
        [Windows.Threading.Dispatcher]::PushFrame($frame)
        $control.Measure([Windows.Size]::new($width, $height))
        $control.Arrange([Windows.Rect]::new(0, 0, $width, $height))
        $control.UpdateLayout()
    }
}
function Metadata-Skeleton($node, $widthNode) {
    $clone = $node.CloneNode($false)
    $clone.RemoveAttribute('Style')
    foreach ($child in $node.ChildNodes) {
        if ($child -isnot [Xml.XmlElement]) { continue }
        if ($child.LocalName -match '\.(ColumnDefinitions|RowDefinitions)$' -or
            ($node -eq $widthNode -and $child.LocalName.EndsWith('.Style'))) {
            $clone.AppendChild($child.CloneNode($true)) | Out-Null
        } elseif ($child -eq $widthNode -or $child.SelectSingleNode('.//*[@*[local-name()="Name"]="' + $widthNode.GetAttribute('Name', 'http://schemas.microsoft.com/winfx/2006/xaml') + '"]')) {
            $clone.AppendChild((Metadata-Skeleton $child $widthNode)) | Out-Null
        }
    }
    if ($node -eq $widthNode) {
        $probe = $node.OwnerDocument.CreateElement('TextBlock', $namespace)
        $probe.SetAttribute('Text', 'Metadata with a long value that must wrap on a narrow panel')
        $probe.SetAttribute('TextWrapping', 'Wrap')
        $probe.SetAttribute('MinHeight', '80')
        $clone.AppendChild($probe) | Out-Null
    }
    return ,$clone
}
$resizeChecks = 0
$gutterChecks = 0
foreach ($theme in $themes) {
    Write-Host "Checking $($theme.key)..."
    [xml]$xml = Get-Content "$root/$($theme.dir)/src/Views/GridViewGameOverview.xaml" -Raw
    $mainNode = $xml.SelectSingleNode('//*[@*[local-name()="Name"]="GridMainColumn"]')
    $metaNode = $xml.SelectSingleNode('//*[@*[local-name()="Name"]="GridMetadataColumn"]')
    if (-not $mainNode -or -not $metaNode -or $mainNode.ParentNode -ne $metaNode.ParentNode) { throw "$($theme.key): missing responsive columns" }
    $bodyNode = $mainNode.ParentNode
    $body = $bodyNode.CloneNode($false)
    foreach ($property in $bodyNode.ChildNodes | Where-Object { $_ -is [Xml.XmlElement] -and $_.LocalName.Contains('.') }) {
        $body.AppendChild($property.CloneNode($true)) | Out-Null
    }
    $main = $mainNode.CloneNode($false)
    foreach ($property in $mainNode.ChildNodes | Where-Object { $_ -is [Xml.XmlElement] -and $_.LocalName.Contains('.') }) {
        $main.AppendChild($property.CloneNode($true)) | Out-Null
    }
    $probe = $xml.CreateElement('StackPanel', $namespace)
    $probe.InnerXml = '<TextBlock xmlns="' + $namespace + '" Name="ProbeDescription" TextWrapping="Wrap" Text="' + ('LongDescriptionWithoutBreaks' * 30) + '" /><Image xmlns="' + $namespace + '" Name="ProbeScreenshot" Stretch="Uniform" />'
    $main.AppendChild($probe) | Out-Null
    $body.AppendChild($main) | Out-Null
    $widthNode = $metaNode.SelectSingleNode('.//*[@Tag="{DynamicResource GridDetailsPaneWidth}"]')
    $meta = $metaNode.CloneNode($false)
    foreach ($child in $metaNode.ChildNodes | Where-Object { $_ -is [Xml.XmlElement] }) {
        if ($child.LocalName.Contains('.')) { $meta.AppendChild($child.CloneNode($true)) | Out-Null }
        else { $meta.AppendChild((Metadata-Skeleton $child $widthNode)) | Out-Null }
    }
    $body.AppendChild($meta) | Out-Null
    $bodyMarkup = $body.OuterXml
    # Exercise the real deferred ControlTemplate namescope: during template
    # creation the responsive state can still be null, even though widths exist.
    $maxWidthBinding = $mainNode.SelectSingleNode('./*[local-name()="Grid.MaxWidth"]/*[local-name()="MultiBinding"]')
    $math = [Windows.Data.IMultiValueConverter][HexInnovation.MathConverter]::new()
    $initial = $math.Convert([object[]]@(0.0, 0.0, $null), [double], $maxWidthBinding.ConverterParameter, [Globalization.CultureInfo]::InvariantCulture)
    if ($initial -ne 0) { throw "$($theme.key): invalid width during template initialization" }
    $templateMarkup = '<ContentControl.Template><ControlTemplate TargetType="ContentControl"><ScrollViewer x:Name="LayoutViewport" HorizontalScrollBarVisibility="Disabled" VerticalScrollBarVisibility="Auto">' + $bodyMarkup + '</ScrollViewer></ControlTemplate></ContentControl.Template>'
    $hostControl = Parse-TestControl $templateMarkup 'ContentControl'
    $hostControl.ApplyTemplate() | Out-Null
    $control = $hostControl.Template.FindName('LayoutViewport', $hostControl)
    $control.HorizontalScrollBarVisibility = 'Disabled'
    $control.VerticalScrollBarVisibility = 'Auto'
    $layout = $control.Content
    $mainColumn = $hostControl.Template.FindName('GridMainColumn', $hostControl)
    $metaColumn = $hostControl.Template.FindName('GridMetadataColumn', $hostControl)
    $description = $hostControl.Template.FindName('ProbeDescription', $hostControl)
    $screenshot = $hostControl.Template.FindName('ProbeScreenshot', $hostControl)
    $screenshot.Source = [Windows.Media.DrawingImage]::new([Windows.Media.GeometryDrawing]::new(
        [Windows.Media.Brushes]::Gray, $null, [Windows.Media.RectangleGeometry]::new([Windows.Rect]::new(0, 0, 1600, 900))))
    foreach ($metadataWidth in 300, 520, 180) {
        $hostControl.Resources['GridDetailsPaneWidth'] = [double]$metadataWidth
        foreach ($width in 1400, 900, 720, 600, 400, 280, 500, 1000) {
            Settle-Layout $hostControl $width
            $mainPoint = $mainColumn.TranslatePoint([Windows.Point]::new(0, 0), $layout)
            $metaPoint = $metaColumn.TranslatePoint([Windows.Point]::new(0, 0), $layout)
            if ($layout.ActualWidth -gt $control.ViewportWidth + 0.1 -or $mainColumn.ActualWidth -le 0 -or
                $description.ActualWidth -gt $mainColumn.ActualWidth + 0.1 -or $screenshot.ActualWidth -gt $mainColumn.ActualWidth + 0.1 -or
                $metaColumn.ActualWidth -gt $layout.ActualWidth + 0.1) {
                throw "$($theme.key): content overflows at viewport=$width, metadata=$metadataWidth, body=$($layout.ActualWidth), main=$($mainColumn.ActualWidth), meta=$($metaColumn.ActualWidth)"
            }
            if ($layout.Tag) {
                if ([math]::Abs($mainColumn.ActualWidth - $layout.ActualWidth) -gt 0.1 -or
                    $metaPoint.Y -lt $mainPoint.Y + $mainColumn.ActualHeight + 23.9) { throw "$($theme.key): narrow content did not fill width and stack metadata below (viewport=$width, body=$($layout.ActualWidth), main=$($mainColumn.ActualWidth)x$($mainColumn.ActualHeight), WidthBinding=$($mainColumn.Width), meta=$($metaColumn.ActualWidth) at $metaPoint, extent=$($control.ExtentHeight))" }
            } elseif ($metaPoint.X -lt $mainPoint.X + $mainColumn.ActualWidth + 0.1 -or $metaPoint.Y -ne $mainPoint.Y) {
                throw "$($theme.key): wide layout columns overlap or stack"
            }
            $resizeChecks++
        }
    }
    $spacer = $xml.SelectSingleNode('//*[@*[local-name()="Name"]="GridBannerSpacer"]')
    if ($theme.key -ne 'materia') {
        if (-not $spacer) { throw "$($theme.key): missing banner spacer" }
        $test = Parse-TestControl ('<Border Name="HeroArt" Height="{DynamicResource GameBannerHeight}" VerticalAlignment="Top" />' + $spacer.OuterXml)
        $hero = $test.FindName('HeroArt')
        $gap = $test.FindName('GridBannerSpacer')
        $floor = [double]$spacer.MinHeight
        if ($floor -le 0 -or ($theme.key -eq 'ace' -and $floor -ne 20)) { throw "$($theme.key): invalid top gutter floor" }
        $heightBinding = $spacer.SelectSingleNode('.//*[local-name()="Setter"][@Property="Height" and contains(@Value,"ConverterParameter")]').Value
        $expression = [regex]::Match($heightBinding, "ConverterParameter='([^']+)'").Groups[1].Value
        $math = [HexInnovation.MathConverter]::new()
        foreach ($height in 0, 5, 10, 20, 0, 320, 600) {
            $test.Resources['GameBannerHeight'] = [double]$height
            Settle-Layout $test 800
            $expected = [math]::Max($floor, $math.Convert([double]$height, [double], $expression, [Globalization.CultureInfo]::InvariantCulture))
            if ([math]::Abs($gap.ActualHeight - $expected) -gt 0.1) {
                throw "$($theme.key): top gutter collapsed at banner=$height (actual=$($gap.ActualHeight), floor=$floor)"
            }
            $gutterChecks++
        }
        $hero.Visibility = 'Collapsed'
        Settle-Layout $test 800
        if ($gap.ActualHeight -ne $floor) { throw "$($theme.key): missing art lost the top gutter" }
        $gutterChecks++
    } else {
        $media = '<Border Name="GridCardMedia" Height="180" MaxHeight="{DynamicResource GameBannerHeight}"><Border.Style><Style TargetType="Border"><Setter Property="Margin" Value="0,0,0,16" /><Style.Triggers><DataTrigger Binding="{Binding ActualHeight, RelativeSource={RelativeSource Self}}" Value="0"><Setter Property="Margin" Value="0" /></DataTrigger></Style.Triggers></Style></Border.Style></Border>'
        $test = Parse-TestControl ('<StackPanel>' + $media + $spacer.OuterXml + '<Border Name="ProbeHeader" Height="40" /></StackPanel>')
        foreach ($height in 0, 5, 10, 20, 120, 320) {
            $test.Resources['GameBannerHeight'] = [double]$height
            Settle-Layout $test 800
            $top = $test.FindName('ProbeHeader').TranslatePoint([Windows.Point]::new(0,0), $test).Y
            if ($top -lt 24 -or ($height -le 5 -and $top -ne 24)) { throw "materia: short banner lost top gutter at $height (actual=$top)" }
            $gutterChecks++
        }
        $test.FindName('GridCardMedia').Visibility = 'Collapsed'
        Settle-Layout $test 800
        if ($test.FindName('GridBannerSpacer').ActualHeight -ne 24) { throw 'materia: missing art lost the top gutter' }
        $gutterChecks++
    }
}
Write-Host "PASS: $(@($themes).Count) grid layouts, $resizeChecks resize/metadata-width combinations and $gutterChecks short/zero/missing-banner states."
