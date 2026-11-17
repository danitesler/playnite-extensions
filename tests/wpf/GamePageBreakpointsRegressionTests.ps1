# Native WPF layout checks for both game-page views, including real metadata frames/groups.
# Run with pwsh -STA -File tests/wpf/GamePageBreakpointsRegressionTests.ps1.
param([string]$PlaynitePath = (Join-Path $env:LOCALAPPDATA 'Playnite'), [string[]]$Keys = @())
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName PresentationFramework, PresentationCore
if ([Threading.Thread]::CurrentThread.ApartmentState -ne 'STA') { throw 'Run with pwsh -STA.' }
[Reflection.Assembly]::LoadFrom((Join-Path $PlaynitePath 'MathConverter.dll')) | Out-Null
$root = Split-Path (Split-Path $PSScriptRoot -Parent) -Parent
$themes = (Get-Content "$root/src/extensions.json" -Raw | ConvertFrom-Json).extensions | Where-Object kind -eq theme
if ($Keys.Count) { $themes = $themes | Where-Object key -in ($Keys -split ',') }
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
        $sepCount = 0
        $elemCount = 0
        foreach ($child in $node.ChildNodes | Where-Object { $_ -is [Xml.XmlElement] -and -not $_.LocalName.Contains('.') }) {
            $cname = Node-Name $child
            if ($cname -like 'Meta*') {
                $sepCount++
                $section = $child.CloneNode($false)
                Keep-Properties $child $section
                foreach ($sub in $child.ChildNodes | Where-Object { $_ -is [Xml.XmlElement] -and -not $_.LocalName.Contains('.') }) {
                    $placeholder = $node.OwnerDocument.CreateElement('Border', $namespace)
                    $placeholder.SetAttribute('Height', '9')
                    $section.AppendChild($placeholder) | Out-Null
                }
                $clone.AppendChild($section) | Out-Null
            } elseif ($cname -like 'PART_Elem*') {
                $elemCount++
                $row = $child.CloneNode($false)
                $row.RemoveAttribute('Style')
                foreach ($property in $child.ChildNodes | Where-Object { $_ -is [Xml.XmlElement] -and ($_.LocalName.EndsWith('.Width') -or $_.LocalName.EndsWith('.Style')) }) {
                    $row.AppendChild($property.CloneNode($true)) | Out-Null
                }
                $fieldLayout = $child
                $rowLayout = $row
                if ($child.LocalName -eq 'Border') {
                    $fieldLayout = $child.SelectSingleNode('./*[local-name()="Grid"]')
                    $rowLayout = $node.OwnerDocument.CreateElement('Grid', $namespace)
                    $row.AppendChild($rowLayout) | Out-Null
                }
                foreach ($property in $fieldLayout.ChildNodes | Where-Object { $_ -is [Xml.XmlElement] -and $_.LocalName.EndsWith('.ColumnDefinitions') }) {
                    $rowLayout.AppendChild($property.CloneNode($true)) | Out-Null
                }
                $columns = @($rowLayout.SelectNodes('./*[local-name()="Grid.ColumnDefinitions"]/*')).Count
                $origCaption = $fieldLayout.SelectSingleNode('./*[local-name()="TextBlock"]')
                $caption = $node.OwnerDocument.CreateElement('TextBlock', $namespace)
                $caption.SetAttribute('Text', 'A long metadata caption that must wrap')
                $caption.SetAttribute('TextWrapping', 'Wrap')
                if ($origCaption -and $origCaption.HasAttribute('MaxWidth')) { $caption.SetAttribute('MaxWidth', $origCaption.GetAttribute('MaxWidth')) }
                $value = $node.OwnerDocument.CreateElement('TextBlock', $namespace)
                $value.SetAttribute('Grid.Column', [string][math]::Max(0, $columns - 1))
                $value.SetAttribute('Text', 'A populated value with enough words to exercise wrapping on narrow screens')
                $value.SetAttribute('TextWrapping', 'Wrap')
                $rowLayout.AppendChild($caption) | Out-Null
                $rowLayout.AppendChild($value) | Out-Null
                $clone.AppendChild($row) | Out-Null
            }
        }
        if ($sepCount -ne 6 -or $elemCount -lt 20) { throw "Expected 6 metadata separators and item fields (got $sepCount separators, $elemCount fields)" }
    } else {
        foreach ($child in $node.ChildNodes | Where-Object { $_ -is [Xml.XmlElement] -and -not $_.LocalName.Contains('.') }) {
            if (Is-Within $child $groupsNode) { $clone.AppendChild((Metadata-Skeleton $child $groupsNode)) | Out-Null }
        }
    }
    return ,$clone
}
function Parse-Template([string]$body, [string]$scrollbarVisibility) {
    $resources = '<math:MathConverter x:Key="MathConverter" /><sys:Double x:Key="GameDetailsPaneWidth">300</sys:Double><sys:Double x:Key="GridDetailsPaneWidth">300</sys:Double><HorizontalAlignment x:Key="GameDetailsPanePosition">Right</HorizontalAlignment><Style TargetType="Border" /><Style x:Key="BaseTextBlockStyle" TargetType="TextBlock" /><Style x:Key="TextBlockGameScore" TargetType="TextBlock" /><Style x:Key="PropertyItemButton" TargetType="Button" />'
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
    # GameDetailsPanePosition: Left mirrors Right; Center and Stretch stretch full-width above the main column with dividers hidden
    # so every visible item flows sequentially in 3/2/1 columns (1 < 560, 2 at 560+, 3 at 900+). Stacked, Left, Center and Stretch put metadata first.
    $position = if ($null -ne $metadata.Tag) { [string]$metadata.Tag } else { 'Right' }
    $onLeft = $position -eq 'Left'
    $metadataFirst = $position -in 'Left', 'Center', 'Stretch'
    $stackedInOrder = if ($metadataFirst) { $mainPoint.Y -ge $metadataPoint.Y + $metadata.ActualHeight + 24 - $tolerance } else { $metadataPoint.Y -ge $mainPoint.Y + $main.ActualHeight + 24 - $tolerance }
    $besideInOrder = if ($onLeft) { $mainPoint.X -ge $metadataPoint.X + $metadata.ActualWidth - $tolerance } else { $metadataPoint.X -ge $mainPoint.X + $main.ActualWidth - $tolerance }
    if ($body.Tag -eq $true) {
        if (-not $stackedInOrder -or
            [math]::Abs($metadata.ActualWidth - $body.ActualWidth) -gt $tolerance -or
            -not [double]::IsNaN($preferred.Width) -or -not [double]::IsPositiveInfinity($preferred.MaxWidth)) {
            throw "${label}: stacked metadata did not fill the body/release preferred width (body=$($body.ActualWidth), metadata=$($metadata.ActualWidth), width=$($preferred.Width), max=$($preferred.MaxWidth))"
        }
    } elseif ($position -in 'Center', 'Stretch') {
        if (-not $stackedInOrder -or
            [math]::Abs($metadata.ActualWidth - $body.ActualWidth) -gt $tolerance -or
            -not [double]::IsNaN($preferred.Width) -or -not [double]::IsPositiveInfinity($preferred.MaxWidth) -or
            [math]::Abs($main.ActualWidth - $body.ActualWidth) -gt $tolerance) {
            throw "${label}: top-stretched metadata was not full-width above a full-width main column (metadata=$($metadata.ActualWidth), main=$($main.ActualWidth), body=$($body.ActualWidth), width=$($preferred.Width), max=$($preferred.MaxWidth))"
        }
    } elseif ([math]::Abs($metadataPoint.Y - $mainPoint.Y) -gt $tolerance -or -not $besideInOrder) {
        throw "${label}: wide metadata overlapped, stacked or sat on the wrong side (position=$position)"
    }
    $threeCutoff = 900
    $columns = if ($clip.ActualWidth -ge $threeCutoff) { 3 } elseif ($clip.ActualWidth -ge $cutoff) { 2 } else { 1 }
    $multiColumn = $columns -ge 2
    if (($groups.Tag -eq $true) -ne $multiColumn) { throw "${label}: wrong metadata breakpoint at $($clip.ActualWidth)px" }
    $separators = @($groups.Children | Where-Object { $_.Name -like 'Meta*' })
    $items = @($groups.Children | Where-Object { $_.Name -like 'PART_Elem*' })
    $visibleItems = @($items | Where-Object Visibility -eq Visible)
    $expectedWidth = if ($columns -eq 3) { ($clip.ActualWidth - 48) / 3 } elseif ($columns -eq 2) { ($clip.ActualWidth - 24) / 2 } else { $clip.ActualWidth }
    if ($position -in 'Center', 'Stretch') {
        foreach ($sep in $separators) {
            if ($sep.Visibility -ne 'Collapsed') { throw "${label}: $position mode left group separator $($sep.Name) visible" }
        }
        foreach ($item in $visibleItems) {
            $itemPoint = $item.TranslatePoint([Windows.Point]::new(0,0), $clip)
            if ([math]::Abs($item.ActualWidth - $expectedWidth) -gt $tolerance -or
                $itemPoint.X -lt -$tolerance -or $itemPoint.X + $item.ActualWidth -gt $clip.ActualWidth + $tolerance) {
                throw "${label}: Stretch item overflowed/left whitespace (item=$($item.Name), width=$($item.ActualWidth), expected=$expectedWidth, x=$($itemPoint.X), clip=$($clip.ActualWidth))"
            }
        }
        if ($visibleItems.Count -gt 0) {
            $first = $visibleItems[0].TranslatePoint([Windows.Point]::new(0,0), $clip)
            if ([math]::Abs($first.X) -gt $tolerance -or $first.Y -lt -$tolerance) {
                throw "${label}: Stretch first item misaligned or clipped ($first)"
            }
        }
        if ($visibleItems.Count -gt 1) {
            if ($columns -ge 2) {
                for ($col = 1; $col -lt [math]::Min($columns, $visibleItems.Count); $col++) {
                    $colPoint = $visibleItems[$col].TranslatePoint([Windows.Point]::new(0,0), $clip)
                    if ([math]::Abs($first.Y - $colPoint.Y) -gt $tolerance -or [math]::Abs($colPoint.X - $first.X - $col * ($expectedWidth + 24)) -gt $tolerance) {
                        throw "${label}: $columns-column Stretch did not align col $col on row 0 (first=$($visibleItems[0].Name)@$first col=$($visibleItems[$col].Name)@$colPoint expectedWidth=$expectedWidth)"
                    }
                }
                if ($visibleItems.Count -gt $columns) {
                    $nextRow = $visibleItems[$columns].TranslatePoint([Windows.Point]::new(0,0), $clip)
                    if ([math]::Abs($nextRow.X - $first.X) -gt $tolerance -or $nextRow.Y -le $first.Y + $tolerance) {
                        throw "${label}: $columns-column Stretch did not wrap item $columns onto row 1"
                    }
                }
            } else {
                $second = $visibleItems[1].TranslatePoint([Windows.Point]::new(0,0), $clip)
                if ([math]::Abs($second.X - $first.X) -gt $tolerance -or $second.Y -lt $first.Y + $visibleItems[0].ActualHeight - $tolerance) {
                    throw "${label}: 1-column Stretch metadata did not stack"
                }
            }
        }
    } else {
        foreach ($sep in ($separators | Where-Object Visibility -eq Visible)) {
            $sepPoint = $sep.TranslatePoint([Windows.Point]::new(0,0), $clip)
            if ([math]::Abs($sep.ActualWidth - $clip.ActualWidth) -gt $tolerance -or [math]::Abs($sepPoint.X) -gt $tolerance) {
                throw "${label}: metadata separator width mismatch ($($sep.Name) width=$($sep.ActualWidth), clip=$($clip.ActualWidth), x=$($sepPoint.X))"
            }
        }
        $groupItems = [System.Collections.Generic.List[object]]::new()
        $currentGroup = $null
        foreach ($child in $groups.Children) {
            if ($child.Name -like 'Meta*') {
                if ($currentGroup -and $currentGroup.Items.Count -gt 0) { $groupItems.Add($currentGroup) }
                $currentGroup = [pscustomobject]@{ Sep = $child; Items = [System.Collections.Generic.List[object]]::new() }
            } elseif ($child.Name -like 'PART_Elem*' -and $child.Visibility -eq 'Visible' -and $currentGroup) {
                $currentGroup.Items.Add($child)
            }
        }
        if ($currentGroup -and $currentGroup.Items.Count -gt 0) { $groupItems.Add($currentGroup) }
        foreach ($grp in $groupItems) {
            if ($grp.Sep.Visibility -ne 'Visible') { throw "${label}: separator $($grp.Sep.Name) collapsed while group has visible items" }
            foreach ($item in $grp.Items) {
                $itemPoint = $item.TranslatePoint([Windows.Point]::new(0,0), $clip)
                if ([math]::Abs($item.ActualWidth - $expectedWidth) -gt $tolerance -or
                    $itemPoint.X -lt -$tolerance -or $itemPoint.X + $item.ActualWidth -gt $clip.ActualWidth + $tolerance) {
                    throw "${label}: metadata item overflowed (item=$($item.Name), width=$($item.ActualWidth), expected=$expectedWidth, x=$($itemPoint.X), clip=$($clip.ActualWidth))"
                }
            }
            $first = $grp.Items[0].TranslatePoint([Windows.Point]::new(0,0), $clip)
            if ([math]::Abs($first.X) -gt $tolerance) { throw "${label}: first visible item in $($grp.Sep.Name) left an empty column" }
            if ($grp.Items.Count -gt 1) {
                if ($columns -ge 2) {
                    for ($col = 1; $col -lt [math]::Min($columns, $grp.Items.Count); $col++) {
                        $colPoint = $grp.Items[$col].TranslatePoint([Windows.Point]::new(0,0), $clip)
                        if ([math]::Abs($first.Y - $colPoint.Y) -gt $tolerance -or [math]::Abs($colPoint.X - $first.X - $col * ($expectedWidth + 24)) -gt $tolerance) {
                            throw "${label}: $columns-column group $($grp.Sep.Name) did not align col $col on row 0 (first=$($grp.Items[0].Name)@$first col=$($grp.Items[$col].Name)@$colPoint expectedWidth=$expectedWidth)"
                        }
                    }
                    if ($grp.Items.Count -gt $columns) {
                        $nextRow = $grp.Items[$columns].TranslatePoint([Windows.Point]::new(0,0), $clip)
                        if ([math]::Abs($nextRow.X - $first.X) -gt $tolerance -or $nextRow.Y -le $first.Y + $tolerance) {
                            throw "${label}: $columns-column group $($grp.Sep.Name) did not wrap item $columns onto row 1"
                        }
                    }
                } else {
                    $second = $grp.Items[1].TranslatePoint([Windows.Point]::new(0,0), $clip)
                    if ([math]::Abs($second.X - $first.X) -gt $tolerance -or $second.Y -lt $first.Y + $grp.Items[0].ActualHeight - $tolerance) {
                        throw "${label}: one-column metadata did not stack in $($grp.Sep.Name)"
                    }
                }
            }
        }
    }
}
$checks = 0
$boundaryChecks = 0
$hiddenChecks = 0
$paddingChecks = 0
$roundingChecks = 0
$leftChecks = 0
foreach ($theme in $themes) {
    $cutoff = 560
    foreach ($view in 'Details', 'Grid') {
        Write-Host "Checking $($theme.key) $view..."
        [xml]$xml = Get-Content "$root/$($theme.dir)/src/Views/${view}ViewGameOverview.xaml" -Raw
        $mainNode = $xml.SelectSingleNode('//*[@*[local-name()="Name"]="' + $view + 'MainColumn"]')
        $metadataNode = $xml.SelectSingleNode('//*[@*[local-name()="Name"]="' + $view + 'MetadataColumn"]')
        $groupsNode = $xml.SelectSingleNode('//*[@*[local-name()="Name"]="' + $view + 'MetadataGroups"]')
        if (-not $mainNode -or -not $metadataNode -or -not $groupsNode -or $mainNode.ParentNode -ne $metadataNode.ParentNode) { throw "$($theme.key) ${view}: missing responsive overview/metadata groups" }
        if ($theme.key -eq 'gumshoe') {
            $dividers = @($groupsNode.SelectNodes('./*[local-name()="Border" and @*[local-name()="Name" and starts-with(.,"Meta")]]'))
            $dotted = @($dividers | Where-Object { $_.SelectSingleNode('./*[local-name()="Border.BorderBrush"]/*[local-name()="DrawingBrush"]') })
            if ($dividers.Count -ne 6 -or $dotted.Count -ne 6) { throw "gumshoe ${view}: expected six dotted metadata dividers" }
        }
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
        foreach ($bp in @(
            @{ Target = $cutoff; Pref = 520; Start = 720.0 },
            @{ Target = 900; Pref = 600; Start = 1000.0 }
        )) {
            $hostControl.Resources[$widthKey] = [double]$bp.Pref
            $testWidth = [double]$bp.Start
            Settle-Layout $hostControl $testWidth
            foreach ($innerWidth in ($bp.Target - 1), $bp.Target, ($bp.Target + 1), $bp.Target, ($bp.Target - 1)) {
                foreach ($attempt in 1..4) {
                    $testWidth += $innerWidth - $groups.Parent.ActualWidth
                    Settle-Layout $hostControl $testWidth
                }
                if ([math]::Abs($groups.Parent.ActualWidth - $innerWidth) -gt 0.1) { throw "$($theme.key) ${view}: could not exercise exact metadata breakpoint $($bp.Target)" }
                Assert-Layout $hostControl $layout $mainControl $metadata $preferred $groups $cutoff "$($theme.key) $view inner=$innerWidth"
                $boundaryChecks++
            }
        }
        $itemChildren = @($groups.Children | Where-Object { $_.Name -like 'PART_Elem*' })
        $itemGroupIdx = @{}
        $gIdx = -1
        foreach ($child in $groups.Children) {
            if ($child.Name -like 'Meta*') { $gIdx++ }
            elseif ($child.Name -like 'PART_Elem*') { $itemGroupIdx[$child.Name] = $gIdx }
        }
        foreach ($hideCount in 1, 2, 4) {
            foreach ($item in $itemChildren) { $item.Visibility = if ($itemGroupIdx[$item.Name] -lt $hideCount) { 'Collapsed' } else { 'Visible' } }
            foreach ($width in 900, 600) {
                Settle-Layout $hostControl $width
                Assert-Layout $hostControl $layout $mainControl $metadata $preferred $groups $cutoff "$($theme.key) $view hidden=$hideCount viewport=$width"
                $hiddenChecks++
            }
        }
        foreach ($item in $itemChildren) { $item.Visibility = 'Visible' }
        # Other positions: Left mirrors Right. Center and Stretch put the divider-free item grid above the main content.
        if ($metadataNode.GetAttribute('Tag') -ne '{DynamicResource GameDetailsPanePosition}') { throw "$($theme.key) ${view}: ${view}MetadataColumn does not read GameDetailsPanePosition" }
        foreach ($position in 'Left', 'Center', 'Stretch') {
            $hostControl.Resources['GameDetailsPanePosition'] = [Windows.HorizontalAlignment]$position
            foreach ($preferredWidth in 180, 300, 520) {
                $hostControl.Resources[$widthKey] = [double]$preferredWidth
                foreach ($width in 1400, 1100, 900, 680, 600, 440) {
                    Settle-Layout $hostControl $width
                    if ([string]$metadata.Tag -ne $position) { throw "$($theme.key) ${view}: GameDetailsPanePosition did not reach the metadata column" }
                    Assert-Layout $hostControl $layout $mainControl $metadata $preferred $groups $cutoff "$($theme.key) $view $position viewport=$width preferred=$preferredWidth"
                    $leftChecks++
                }
            }
        }
        foreach ($pos in 'Center', 'Stretch') {
            $hostControl.Resources['GameDetailsPanePosition'] = [Windows.HorizontalAlignment]$pos
            $hostControl.Resources[$widthKey] = [double]300
            for ($i = 0; $i -lt $itemChildren.Count; $i++) {
                $itemChildren[$i].Visibility = if ($i -in 0, 2, 4, 5, 7) { 'Collapsed' } else { 'Visible' }
            }
            foreach ($width in 1100, 700) {
                Settle-Layout $hostControl $width
                Assert-Layout $hostControl $layout $mainControl $metadata $preferred $groups $cutoff "$($theme.key) $view $pos sparse-items viewport=$width"
                $hiddenChecks++
            }
        }
        foreach ($item in $itemChildren) { $item.Visibility = 'Visible' }
        $hostControl.Resources['GameDetailsPanePosition'] = [Windows.HorizontalAlignment]::Right
        $hostControl.Resources[$widthKey] = [double]300
        $hostControl.UseLayoutRounding = $true
        foreach ($width in 901, 899, 600) {
            Settle-Layout $hostControl $width
            Assert-Layout $hostControl $layout $mainControl $metadata $preferred $groups $cutoff "$($theme.key) $view device rounding viewport=$width" 1.0
            $roundingChecks++
        }
    }
}
Write-Host "PASS: $(@($themes).Count * 2) game-page views, $checks resize/preferred-width cases, $boundaryChecks exact metadata breakpoints, $paddingChecks changed-padding states, $hiddenChecks hidden-group layouts, $leftChecks left/center layouts and $roundingChecks device-rounding states."
