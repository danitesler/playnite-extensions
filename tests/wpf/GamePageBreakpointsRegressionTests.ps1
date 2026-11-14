# Native WPF layout checks for both game-page views, including real metadata frames/groups.
# Run with pwsh -STA -File tests/wpf/GamePageBreakpointsRegressionTests.ps1.
param([string]$PlaynitePath = (Join-Path $env:LOCALAPPDATA 'Playnite'), [string[]]$Keys = @())
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName PresentationFramework, PresentationCore
if ([Threading.Thread]::CurrentThread.ApartmentState -ne 'STA') { throw 'Run with pwsh -STA.' }
[Reflection.Assembly]::LoadFrom((Join-Path $PlaynitePath 'MathConverter.dll')) | Out-Null
$root = Split-Path (Split-Path $PSScriptRoot -Parent) -Parent
$themes = (Get-Content "$root/src/extensions.json" -Raw | ConvertFrom-Json).extensions | Where-Object kind -eq theme
if ($Keys.Count) { $themes = $themes | Where-Object key -in $Keys }
$namespace = 'http://schemas.microsoft.com/winfx/2006/xaml/presentation'
$xNamespace = 'http://schemas.microsoft.com/winfx/2006/xaml'
$converterAssembly = [HexInnovation.MathConverter].Assembly.GetName().Name
function Node-Name($node) {
    $value = $node.GetAttribute('Name', $xNamespace)
    if (-not $value) { $value = $node.GetAttribute('Name') }
    return $value
}
function Is-Within($ancestor, $node) {
    while ($node) { if ($node -eq $ancestor) { return $true }; $node = $node.ParentNode }
    return $false
}
function Keep-Properties($source, $clone) {
    foreach ($child in $source.ChildNodes) {
        if ($child -is [Xml.XmlElement] -and $child.LocalName.Contains('.')) {
            $clone.AppendChild($child.CloneNode($true)) | Out-Null
        }
    }
}
function Metadata-Skeleton($node, $groupsNode) {
    $clone = $node.CloneNode($false)
    $clone.RemoveAttribute('Style')
    $clone.RemoveAttribute('Template')
    Keep-Properties $node $clone
    if ($node -eq $groupsNode) {
        foreach ($group in $node.ChildNodes | Where-Object { $_ -is [Xml.XmlElement] -and $_.LocalName -eq 'Border' }) {
            $section = $group.CloneNode($false)
            Keep-Properties $group $section
            $rows = $node.OwnerDocument.CreateElement('StackPanel', $namespace)
            $fieldNodes = @($group.SelectNodes('.//*[@*[local-name()="Name" and starts-with(.,"PART_Elem")]]'))
            if (-not $fieldNodes.Count) { throw "Metadata group $(Node-Name $group) has no fields" }
            foreach ($field in $fieldNodes) {
                $row = $field.CloneNode($false)
                $row.RemoveAttribute('Style')
                $fieldLayout = $field
                $rowLayout = $row
                if ($field.LocalName -eq 'Border') {
                    $fieldLayout = $field.SelectSingleNode('./*[local-name()="Grid"]')
                    $rowLayout = $node.OwnerDocument.CreateElement('Grid', $namespace)
                    $row.AppendChild($rowLayout) | Out-Null
                }
                foreach ($property in $fieldLayout.ChildNodes | Where-Object { $_ -is [Xml.XmlElement] -and $_.LocalName.EndsWith('.ColumnDefinitions') }) {
                    $rowLayout.AppendChild($property.CloneNode($true)) | Out-Null
                }
                $columns = @($rowLayout.SelectNodes('./*[local-name()="Grid.ColumnDefinitions"]/*')).Count
                $caption = $node.OwnerDocument.CreateElement('TextBlock', $namespace)
                $caption.SetAttribute('Text', 'A long metadata caption that must wrap')
                $caption.SetAttribute('TextWrapping', 'Wrap')
                $value = $caption.CloneNode($true)
                $value.SetAttribute('Grid.Column', [string][math]::Max(0, $columns - 1))
                $value.SetAttribute('Text', 'A populated value with enough words to exercise wrapping on narrow screens')
                $rowLayout.AppendChild($caption) | Out-Null
                $rowLayout.AppendChild($value) | Out-Null
                $rows.AppendChild($row) | Out-Null
            }
            $section.AppendChild($rows) | Out-Null
            $clone.AppendChild($section) | Out-Null
        }
    } else {
        foreach ($child in $node.ChildNodes | Where-Object { $_ -is [Xml.XmlElement] -and -not $_.LocalName.Contains('.') }) {
            if (Is-Within $child $groupsNode) { $clone.AppendChild((Metadata-Skeleton $child $groupsNode)) | Out-Null }
        }
    }
    return ,$clone
}
function Parse-Template([string]$body, [string]$scrollbarVisibility) {
    $resources = '<math:MathConverter x:Key="MathConverter" /><sys:Double x:Key="GameDetailsPaneWidth">300</sys:Double><sys:Double x:Key="GridDetailsPaneWidth">300</sys:Double><Style TargetType="Border" /><Style x:Key="BaseTextBlockStyle" TargetType="TextBlock" /><Style x:Key="TextBlockGameScore" TargetType="TextBlock" /><Style x:Key="PropertyItemButton" TargetType="Button" />'
    $markup = '<ContentControl xmlns="' + $namespace + '" xmlns:x="' + $xNamespace + '" xmlns:sys="clr-namespace:System;assembly=mscorlib" xmlns:math="clr-namespace:HexInnovation;assembly=' + $converterAssembly + '"><ContentControl.Resources>' + $resources + '</ContentControl.Resources><ContentControl.Template><ControlTemplate TargetType="ContentControl"><ScrollViewer x:Name="TestViewport" HorizontalScrollBarVisibility="Disabled" VerticalScrollBarVisibility="' + $scrollbarVisibility + '">' + $body + '</ScrollViewer></ControlTemplate></ContentControl.Template></ContentControl>'
    $control = [Windows.Markup.XamlReader]::Parse($markup)
    $control.ApplyTemplate() | Out-Null
    return $control
}
function Settle-Layout($control, [double]$width) {
    foreach ($iteration in 1..8) {
        $control.Dispatcher.Invoke([Action]{}, [Windows.Threading.DispatcherPriority]::DataBind)
        $control.Measure([Windows.Size]::new($width, 600))
        $control.Arrange([Windows.Rect]::new(0, 0, $width, 600))
        $control.UpdateLayout()
    }
}
function Assert-Layout($hostControl, $body, $main, $metadata, $preferred, $groups, [int]$cutoff, [string]$label, [double]$tolerance = 0.1) {
    $viewport = $hostControl.Template.FindName('TestViewport', $hostControl)
    $clip = $groups.Parent
    if ($body.ActualWidth -gt $viewport.ViewportWidth + $tolerance -or $metadata.ActualWidth -gt $body.ActualWidth + $tolerance) {
        throw "${label}: outer content overflowed (body=$($body.ActualWidth), viewport=$($viewport.ViewportWidth), metadata=$($metadata.ActualWidth))"
    }
    $mainPoint = $main.TranslatePoint([Windows.Point]::new(0,0), $body)
    $metadataPoint = $metadata.TranslatePoint([Windows.Point]::new(0,0), $body)
    if ($body.Tag -eq $true) {
        if ($metadataPoint.Y -lt $mainPoint.Y + $main.ActualHeight + 24 - $tolerance -or
            [math]::Abs($metadata.ActualWidth - $body.ActualWidth) -gt $tolerance -or
            -not [double]::IsNaN($preferred.Width) -or -not [double]::IsPositiveInfinity($preferred.MaxWidth)) {
            throw "${label}: stacked metadata did not fill the body/release preferred width (body=$($body.ActualWidth), metadata=$($metadata.ActualWidth), width=$($preferred.Width), max=$($preferred.MaxWidth))"
        }
    } elseif ([math]::Abs($metadataPoint.Y - $mainPoint.Y) -gt $tolerance -or $metadataPoint.X -lt $mainPoint.X + $main.ActualWidth - $tolerance) {
        throw "${label}: wide metadata overlapped or stacked"
    }
    $twoColumns = $clip.ActualWidth -ge $cutoff
    if (($groups.Tag -eq $true) -ne $twoColumns) { throw "${label}: wrong metadata breakpoint at $($clip.ActualWidth)px" }
    $visible = @($groups.Children | Where-Object Visibility -eq Visible)
    $expectedWidth = if ($twoColumns) { ($clip.ActualWidth - 24) / 2 } else { $clip.ActualWidth }
    foreach ($section in $visible) {
        $position = $section.TranslatePoint([Windows.Point]::new(0,0), $clip)
        if ([math]::Abs($section.ActualWidth - $expectedWidth) -gt $tolerance -or
            $position.X -lt -$tolerance -or $position.X + $section.ActualWidth -gt $clip.ActualWidth + $tolerance) {
            throw "${label}: metadata group overflowed/left side whitespace (group=$($section.Name), width=$($section.ActualWidth), expected=$expectedWidth, x=$($position.X), clip=$($clip.ActualWidth))"
        }
    }
    if ($visible.Count -gt 0) {
        $first = $visible[0].TranslatePoint([Windows.Point]::new(0,0), $clip)
        if ([math]::Abs($first.X) -gt $tolerance) { throw "${label}: first visible group left an empty column" }
    }
    if ($visible.Count -gt 1) {
        $second = $visible[1].TranslatePoint([Windows.Point]::new(0,0), $clip)
        if ($twoColumns) {
            if ([math]::Abs($first.Y - $second.Y) -gt $tolerance -or [math]::Abs($second.X - $first.X - $expectedWidth - 24) -gt $tolerance) { throw "${label}: two metadata columns did not share the first row/gutter (first=$($visible[0].Name)@$first second=$($visible[1].Name)@$second expectedWidth=$expectedWidth)" }
        } elseif ([math]::Abs($second.X - $first.X) -gt $tolerance -or $second.Y -lt $first.Y + $visible[0].ActualHeight - $tolerance) { throw "${label}: one-column metadata did not stack" }
    }
}
$checks = 0
$boundaryChecks = 0
$hiddenChecks = 0
$paddingChecks = 0
$roundingChecks = 0
foreach ($theme in $themes) {
    $cutoff = 560
    foreach ($view in 'Details', 'Grid') {
        Write-Host "Checking $($theme.key) $view..."
        [xml]$xml = Get-Content "$root/$($theme.dir)/src/Views/${view}ViewGameOverview.xaml" -Raw
        $mainNode = $xml.SelectSingleNode('//*[@*[local-name()="Name"]="' + $view + 'MainColumn"]')
        $metadataNode = $xml.SelectSingleNode('//*[@*[local-name()="Name"]="' + $view + 'MetadataColumn"]')
        $groupsNode = $xml.SelectSingleNode('//*[@*[local-name()="Name"]="' + $view + 'MetadataGroups"]')
        if (-not $mainNode -or -not $metadataNode -or -not $groupsNode -or $mainNode.ParentNode -ne $metadataNode.ParentNode) { throw "$($theme.key) ${view}: missing responsive overview/metadata groups" }
        $bodyNode = $mainNode.ParentNode
        $body = $bodyNode.CloneNode($false)
        Keep-Properties $bodyNode $body
        $main = $mainNode.CloneNode($false)
        Keep-Properties $mainNode $main
        $probe = $xml.CreateElement('TextBlock', $namespace)
        $probe.SetAttribute('Text', 'A long description that must reflow within the available main content width. ' * 15)
        $probe.SetAttribute('TextWrapping', 'Wrap')
        $probe.SetAttribute('MinHeight', '100')
        $main.AppendChild($probe) | Out-Null
        $body.AppendChild($main) | Out-Null
        $body.AppendChild((Metadata-Skeleton $metadataNode $groupsNode)) | Out-Null
        $scrollHost = $xml.SelectSingleNode('//*[local-name()="ScrollViewer"][@*[local-name()="Name"]="PART_ScrollViewHost"]')
        if ($scrollHost.VerticalScrollBarVisibility -ne 'Visible') { throw "$($theme.key) ${view}: scrollbar width must stay reserved during reflow" }
        $hostControl = Parse-Template $body.OuterXml $scrollHost.VerticalScrollBarVisibility
        $layout = $hostControl.Template.FindName((Node-Name $bodyNode), $hostControl)
        $mainControl = $hostControl.Template.FindName((Node-Name $mainNode), $hostControl)
        $metadata = $hostControl.Template.FindName((Node-Name $metadataNode), $hostControl)
        $groups = $hostControl.Template.FindName((Node-Name $groupsNode), $hostControl)
        $widthKey = if ($view -eq 'Details') { 'GameDetailsPaneWidth' } else { 'GridDetailsPaneWidth' }
        $widthNode = $metadataNode.SelectSingleNode('.//*[@Tag="{DynamicResource ' + $widthKey + '}"]')
        $preferred = $hostControl.Template.FindName((Node-Name $widthNode), $hostControl)
        foreach ($preferredWidth in 180, 300, 520) {
            $hostControl.Resources[$widthKey] = [double]$preferredWidth
            foreach ($width in 1400, 1000, 900, 760, 720, 680, 640, 600, 440, 280, 700, 1100) {
                Settle-Layout $hostControl $width
                Assert-Layout $hostControl $layout $mainControl $metadata $preferred $groups $cutoff "$($theme.key) $view viewport=$width preferred=$preferredWidth"
                if ($preferredWidth -eq 300 -and $width -eq 1400 -and $layout.Tag -eq $true) { throw "$($theme.key) ${view}: metadata stacked in a wide view" }
                if ($width -eq 440 -and $layout.Tag -ne $true) { throw "$($theme.key) ${view}: metadata stayed beside a narrow view" }
                $checks++
            }
        }
        # The frame's padding is outside the configured usable content width.
        # Changing it must move the inner breakpoint rather than squeeze rows.
        $frame = $preferred.Parent
        while ($frame -and $frame -ne $metadata) {
            if ($frame.PSObject.Properties['Padding'] -and ($frame.Padding.Left + $frame.Padding.Right) -gt 0) { break }
            $frame = $frame.Parent
        }
        if ($frame -and $frame -ne $metadata) {
            $originalPadding = $frame.Padding
            $frame.Padding = [Windows.Thickness]::new($originalPadding.Left + 12, $originalPadding.Top, $originalPadding.Right + 12, $originalPadding.Bottom)
            $hostControl.Resources[$widthKey] = [double]520
            foreach ($width in 900, 700, 600) {
                Settle-Layout $hostControl $width
                Assert-Layout $hostControl $layout $mainControl $metadata $preferred $groups $cutoff "$($theme.key) $view extra frame padding viewport=$width"
                $paddingChecks++
            }
            $frame.Padding = $originalPadding
        }
        # Force exact INNER-width transitions rather than assuming an outer
        # window threshold: frame padding and scrollbar chrome differ by theme.
        $hostControl.Resources[$widthKey] = [double]520
        $testWidth = 720.0
        Settle-Layout $hostControl $testWidth
        foreach ($innerWidth in ($cutoff - 1), $cutoff, ($cutoff + 1), $cutoff, ($cutoff - 1)) {
            foreach ($attempt in 1..4) {
                $testWidth += $innerWidth - $groups.Parent.ActualWidth
                Settle-Layout $hostControl $testWidth
            }
            if ([math]::Abs($groups.Parent.ActualWidth - $innerWidth) -gt 0.1) { throw "$($theme.key) ${view}: could not exercise exact metadata breakpoint" }
            Assert-Layout $hostControl $layout $mainControl $metadata $preferred $groups $cutoff "$($theme.key) $view inner=$innerWidth"
            $boundaryChecks++
        }
        foreach ($hideCount in 1, 2, 4) {
            for ($index = 0; $index -lt $groups.Children.Count; $index++) { $groups.Children[$index].Visibility = if ($index -lt $hideCount) { 'Collapsed' } else { 'Visible' } }
            foreach ($width in 900, 600) {
                Settle-Layout $hostControl $width
                Assert-Layout $hostControl $layout $mainControl $metadata $preferred $groups $cutoff "$($theme.key) $view hidden=$hideCount viewport=$width"
                $hiddenChecks++
            }
        }
        foreach ($group in $groups.Children) { $group.Visibility = 'Visible' }
        $hostControl.UseLayoutRounding = $true
        foreach ($width in 901, 899, 600) {
            Settle-Layout $hostControl $width
            Assert-Layout $hostControl $layout $mainControl $metadata $preferred $groups $cutoff "$($theme.key) $view device rounding viewport=$width" 1.0
            $roundingChecks++
        }
    }
}
Write-Host "PASS: $(@($themes).Count * 2) game-page views, $checks resize/preferred-width cases, $boundaryChecks exact metadata breakpoints, $paddingChecks changed-padding states, $hiddenChecks hidden-group layouts and $roundingChecks device-rounding states."
