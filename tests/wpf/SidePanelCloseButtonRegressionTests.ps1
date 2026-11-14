# Run with pwsh -STA -File tests/wpf/SidePanelCloseButtonRegressionTests.ps1.
param([string]$PlaynitePath = (Join-Path $env:LOCALAPPDATA 'Playnite'))
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName PresentationFramework, PresentationCore
if ([Threading.Thread]::CurrentThread.ApartmentState -ne 'STA') { throw 'Run with pwsh -STA.' }
[Reflection.Assembly]::LoadFrom((Join-Path $PlaynitePath 'MathConverter.dll')) | Out-Null
$root = Split-Path (Split-Path $PSScriptRoot -Parent) -Parent
$themes = (Get-Content "$root/src/extensions.json" -Raw | ConvertFrom-Json).extensions | Where-Object kind -eq theme
$checks = 0
foreach ($theme in $themes) {
    [xml]$xml = Get-Content "$root/$($theme.dir)/src/Views/GridViewGameOverview.xaml" -Raw
    $cornerNode = $xml.SelectSingleNode('//*[local-name()="Button"][@*[local-name()="Name"]="SidePanelCloseButton"]')
    $inlineNode = $xml.SelectSingleNode('//*[local-name()="Button"][@*[local-name()="Name"]="InlineSidePanelCloseButton"]')
    $imageNode = $xml.SelectSingleNode('//*[local-name()="Image"][@*[local-name()="Name"]="PART_ImageIcon"]')
    if (-not $cornerNode -or -not $inlineNode -or -not $imageNode) { throw "$($theme.key): missing responsive close controls" }
    $header = $inlineNode.ParentNode
    $iconSlot = $imageNode
    while ($iconSlot.ParentNode -ne $header -and $iconSlot.ParentNode) { $iconSlot = $iconSlot.ParentNode }
    if ($header.LocalName -ne 'DockPanel' -or $iconSlot.ParentNode -ne $header) { throw "$($theme.key): close must be outside the icon slot, in the title DockPanel" }
    $previous = $iconSlot.PreviousSibling
    while ($previous -and $previous -isnot [Xml.XmlElement]) { $previous = $previous.PreviousSibling }
    if ($previous -ne $inlineNode) { throw "$($theme.key): inline close must immediately precede the game icon" }
    foreach ($button in $cornerNode, $inlineNode) {
        if ($button.GetAttribute('Command') -ne '{MainViewModel CloseGameSideBarCommand}' -or $button.GetAttribute('ToolTip') -ne '{DynamicResource LOCCloseLabel}') {
            throw "$($theme.key): close command or tooltip changed"
        }
    }
    # Use the real buttons, real shared template and real icon wrapper. Only the
    # Playnite command markup is removed; this test never operates the user's app.
    $corner = $cornerNode.CloneNode($true)
    $corner.RemoveAttribute('Command')
    $inline = $inlineNode.CloneNode($true)
    $inline.RemoveAttribute('Command')
    $testHeader = $header.CloneNode($false)
    $testHeader.AppendChild($inline) | Out-Null
    $testSlot = $iconSlot.CloneNode($true)
    $testHeader.AppendChild($testSlot) | Out-Null
    $title = $xml.CreateElement('TextBlock', 'http://schemas.microsoft.com/winfx/2006/xaml/presentation')
    $title.SetAttribute('Text', 'Game title')
    $testHeader.AppendChild($title) | Out-Null
    $scrollNode = $inlineNode.SelectSingleNode('ancestor::*[local-name()="ScrollViewer"][1]')
    $scroll = $scrollNode.CloneNode($false)
    $scroll.RemoveAttribute('Style')
    $scroll.IsEmpty = $true
    # Reproduce the header's stacking against later siblings at each level, using
    # solid WPF elements to stand in for the actions, screenshots and metadata.
    $scrollContent = $testHeader.OuterXml
    for ($node = $header; $node.ParentNode -ne $scrollNode; $node = $node.ParentNode) {
        $parent = $node.ParentNode
        $laterContent = $node.SelectSingleNode('following-sibling::*[not(contains(local-name(), "."))][1]')
        if ($laterContent) { $scrollContent += '<Border Height="900" Background="Gray" />' }
        $zIndex = $parent.GetAttribute('Panel.ZIndex')
        $zIndexAttribute = if ($zIndex) { ' Panel.ZIndex="' + $zIndex + '"' } else { '' }
        $scrollContent = '<StackPanel' + $zIndexAttribute + '>' + $scrollContent + '</StackPanel>'
    }
    $scrollContent = $scrollContent.Insert($scrollContent.IndexOf('>') + 1, '<Border Height="60" />')
    $markup = '<Grid xmlns="http://schemas.microsoft.com/winfx/2006/xaml/presentation" xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml">' +
        $scroll.OuterXml.Replace('/>', '>' + $scrollContent + '</ScrollViewer>') + $corner.OuterXml + '</Grid>'
    # StaticResource is resolved while parsing, so supply the installed converter
    # from the real assembly rather than a substitute implementation.
    $converterAssembly = [HexInnovation.MathConverter].Assembly.GetName().Name
    $markup = $markup.Replace('<Grid xmlns=', '<Grid xmlns:math="clr-namespace:HexInnovation;assembly=' + $converterAssembly + '" xmlns=')
    $markup = $markup.Replace('><ScrollViewer', '><Grid.Resources><math:MathConverter x:Key="MathConverter" /></Grid.Resources><ScrollViewer')
    # {Settings ...} only resolves inside Playnite; bind the same flag to the test DataContext instead.
    $markup = $markup.Replace('{Settings ShowBackgroundImageOnWindow}', '{Binding ShowBg, FallbackValue=False}')
    $control = [Windows.Markup.XamlReader]::Parse($markup)
    $surface = [Windows.Interop.HwndSource]::new([Windows.Interop.HwndSourceParameters]::new('Close button test', 800, 300))
    $surface.RootVisual = $control
    $cornerButton = $control.FindName('SidePanelCloseButton')
    $inlineButton = $control.FindName('InlineSidePanelCloseButton')
    $viewport = $control.FindName('PART_ScrollViewHost')
    $icon = $control.FindName('PART_ImageIcon')
    $icon.Source = [Windows.Media.DrawingImage]::new([Windows.Media.GeometryDrawing]::new(
        [Windows.Media.Brushes]::Gray, $null, [Windows.Media.RectangleGeometry]::new([Windows.Rect]::new(0, 0, 32, 32))))
    foreach ($showBg in $false, $true) {
        # ShowBackgroundImageOnWindow keeps the close inline at every banner height.
        $control.DataContext = [pscustomobject]@{ Game = [pscustomobject]@{ Id = 'selected' }; ShowBg = $showBg }
        foreach ($height in 320, 119, 120, 0, 5, 10, 20, 119.999, 121, 60, 600, 0, 320) {
            # Replacing the resource models a ThemeModifier edit while the view is open.
            $control.Resources['GameBannerHeight'] = [double]$height
            $control.Dispatcher.Invoke([Action]{}, [Windows.Threading.DispatcherPriority]::DataBind)
            $control.Measure([Windows.Size]::new(800, 300))
            $control.Arrange([Windows.Rect]::new(0, 0, 800, 300))
            $control.UpdateLayout()
            $small = ($height -lt 120) -or $showBg
            if (($inlineButton.Visibility -eq 'Visible') -ne $small -or ($cornerButton.Visibility -eq 'Visible') -eq $small) {
                throw "$($theme.key): incorrect close visibility at banner height $height, background image $showBg"
            }
            if ($inlineButton.Template -ne $cornerButton.Template) { throw "$($theme.key): inline close lost the theme's template" }
            $inlineButton.ApplyTemplate() | Out-Null
            $cornerButton.ApplyTemplate() | Out-Null
            $visibleButton = if ($small) { $inlineButton } else { $cornerButton }
            if ($visibleButton.ActualWidth -ne 28 -or $visibleButton.ActualHeight -ne 28) { throw "$($theme.key): close button changed size" }
            $point = $visibleButton.TranslatePoint([Windows.Point]::new(0, 0), $control)
            if ($small) {
                $iconPoint = $icon.TranslatePoint([Windows.Point]::new(0, 0), $control)
                if ($point.X + 28 -gt $iconPoint.X -or [math]::Abs(($point.Y + 14) - ($iconPoint.Y + $icon.ActualHeight / 2)) -gt 0.1) {
                    throw "$($theme.key): close is not aligned immediately left of the game icon at $height (close=$point, icon=$iconPoint, iconSize=$($icon.ActualWidth)x$($icon.ActualHeight))"
                }
                $icon.Visibility = 'Collapsed'
                $control.UpdateLayout()
                if ($inlineButton.Visibility -ne 'Visible') { throw "$($theme.key): hidden game icon also hides close" }
                $icon.Visibility = 'Visible'
                foreach ($offset in 32, 350, $viewport.ScrollableHeight, 0) {
                    $viewport.ScrollToVerticalOffset($offset)
                    $control.UpdateLayout()
                    $control.Dispatcher.Invoke([Action]{}, [Windows.Threading.DispatcherPriority]::Background)
                    if ($viewport.ContentVerticalOffset -ne $offset) { throw "$($theme.key): test viewport did not scroll to $offset" }
                    $scrolledPoint = $inlineButton.TranslatePoint([Windows.Point]::new(0, 0), $control)
                    if ([math]::Abs($scrolledPoint.Y - $point.Y) -gt 0.1) {
                        throw "$($theme.key): compact close moved at scroll offset $offset (before=$point, after=$scrolledPoint)"
                    }
                    $hit = $control.InputHitTest([Windows.Point]::new($scrolledPoint.X + 14, $scrolledPoint.Y + 14))
                    $hitType = if ($hit) { $hit.GetType().Name } else { 'nothing' }
                    while ($hit -and $hit -ne $inlineButton) { $hit = [Windows.Media.VisualTreeHelper]::GetParent($hit) }
                    if (-not $hit) { throw "$($theme.key): compact close is covered by $hitType at scroll offset $offset" }
                }
            } elseif ($point.X -ne 12 -or $point.Y -ne 12) {
                throw "$($theme.key): large-banner close moved away from the top-left corner"
            }
            $checks++
        }
    }
    foreach ($empty in @([pscustomobject]@{ Game = $null; ShowBg = $false }, [pscustomobject]@{ Game = $null; ShowBg = $true }, $null)) {
        $control.DataContext = $empty
        foreach ($height in 0, 5, 10, 20, 119, 120, 320) {
            $control.Resources['GameBannerHeight'] = [double]$height
            $control.Dispatcher.Invoke([Action]{}, [Windows.Threading.DispatcherPriority]::DataBind)
            $control.Measure([Windows.Size]::new(800, 300))
            $control.Arrange([Windows.Rect]::new(0, 0, 800, 300))
            $control.UpdateLayout()
            if ($cornerButton.Visibility -ne 'Visible') { throw "$($theme.key): empty view cannot be closed at banner height $height" }
            $point = $cornerButton.TranslatePoint([Windows.Point]::new(0, 0), $control)
            if ($point.X -ne 12 -or $point.Y -ne 12) { throw "$($theme.key): empty close is not at the top-left corner" }
            $checks++
        }
    }
    $surface.Dispose()
}
Write-Host "PASS: $(@($themes).Count) themes, $checks selected/empty banner-height states, shared templates, inline alignment, and scroll position and hit testing."
