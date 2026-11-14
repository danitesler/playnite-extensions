# Run with pwsh -STA -File tests/wpf/TopPanelLayoutRegressionTests.ps1.
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName PresentationFramework
if ([Threading.Thread]::CurrentThread.ApartmentState -ne 'STA') { throw 'Run with pwsh -STA.' }
$root = Split-Path (Split-Path $PSScriptRoot -Parent) -Parent
$themes = (Get-Content "$root/src/extensions.json" -Raw | ConvertFrom-Json).extensions | Where-Object kind -eq theme
$runtimeOrder = @('SearchButton', 'GeneralViewSettings', 'FilterPresetsSelection', 'GroupSettings', 'SortSettings', 'SwitchDetailsView', 'SwitchGridView', 'SwitchListView', 'UpdateButton', 'SelectRandomGameButton', 'ViewSelectRandomGameButton', 'ExplorerSwitch')
foreach ($theme in $themes) {
    [xml]$xml = Get-Content "$root/$($theme.dir)/src/Views/TopPanel.xaml" -Raw
    $search = $xml.SelectSingleNode('//*[@*[local-name()="Name"]="PART_TextMainSearch"]')
    $filter = $xml.SelectSingleNode('//*[@*[local-name()="Name"]="PART_ToggleFilter"]')
    $panel = $xml.SelectSingleNode('//*[@*[local-name()="Name"]="PART_PanelMainItems"]')
    if ($search.ParentNode -ne $filter.ParentNode -or $filter.ParentNode -ne $panel.ParentNode) { throw "$($theme.key): controls have different parents" }
    $parts = @($search.ParentNode.ChildNodes | Where-Object { $_ -is [Xml.XmlElement] } | ForEach-Object { $_.GetAttribute('Name', 'http://schemas.microsoft.com/winfx/2006/xaml') })
    if ([array]::IndexOf($parts, 'PART_ToggleFilter') -ne [array]::IndexOf($parts, 'PART_TextMainSearch') + 1 -or [array]::IndexOf($parts, 'PART_PanelMainItems') -ne [array]::IndexOf($parts, 'PART_ToggleFilter') + 1) { throw "$($theme.key): wrong control order" }
    foreach ($part in $search, $filter, $panel) {
        if ($part.GetAttribute('DockPanel.Dock') -ne 'Left') { throw "$($theme.key): part is not left-docked" }
    }
    $height = [double]$panel.GetAttribute('Height')
    [xml]$items = Get-Content "$root/$($theme.dir)/src/CustomControls/TopPanelItem.xaml" -Raw
    $itemHeight = $items.SelectSingleNode('//*[local-name()="Style"]/*[local-name()="Setter" and @Property="Height"]').Value
    foreach ($key in 'TopPanelFilterToggle', 'TopPanelNotificationsToggle') {
        $toggleHeight = $xml.SelectSingleNode('//*[@*[local-name()="Key"]="' + $key + '"]/*[local-name()="Setter" and @Property="Height"]').Value
        if ([double]$toggleHeight -ne $height) { throw "$($theme.key): $key height differs" }
    }
    if ([double]$itemHeight -ne $height) { throw "$($theme.key): item height differs" }
    # Exercise the real panel and template triggers with stock controls. Only the
    # Playnite-specific control type and its visual templates are substituted.
    $text = $panel.OuterXml.Replace('{x:Type TopPanelItem}', '{x:Type ContentControl}')
    $templates = ($runtimeOrder | ForEach-Object { '<DataTemplate x:Key="TopPanel' + $_ + 'Template"><Border Width="16" Height="16" /></DataTemplate>' }) -join ''
    $text = $text.Replace('<Grid.Resources>', '<Grid.Resources>' + $templates)
    $xaml = '<Border xmlns="http://schemas.microsoft.com/winfx/2006/xaml/presentation" xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml"><Border.Resources><Style TargetType="ContentControl"><Setter Property="Width" Value="36" /></Style></Border.Resources>' + $text + '</Border>'
    $testRoot = [Windows.Markup.XamlReader]::Parse($xaml)
    $grid = $testRoot.Child
    $buttons = @{}
    foreach ($key in $runtimeOrder) {
        $button = [Windows.Controls.ContentControl]::new()
        $button.ContentTemplate = $grid.Resources["TopPanel${key}Template"]
        $grid.Children.Add($button) | Out-Null
        $buttons[$key] = $button
    }
    foreach ($hide in $false, $true) {
        foreach ($key in 'SearchButton', 'SwitchDetailsView', 'SwitchListView') { $buttons[$key].Visibility = $(if ($hide) { 'Collapsed' } else { 'Visible' }) }
        $testRoot.Measure([Windows.Size]::new(1600, 100))
        $testRoot.Arrange([Windows.Rect]::new(0, 0, 1600, 100))
        $testRoot.UpdateLayout()
        $sortX = $buttons.SortSettings.TranslatePoint([Windows.Point]::new(0, 0), $grid).X
        if ($sortX -ne 0) { throw "$($theme.key): sorting is not first" }
        foreach ($key in $runtimeOrder) {
            if ($buttons[$key].Visibility -eq 'Collapsed') { continue }
            if ([math]::Abs($buttons[$key].ActualHeight - $height) -gt 0.1) { throw "$($theme.key): $key shrank" }
            if ($key -ne 'SortSettings' -and $buttons[$key].TranslatePoint([Windows.Point]::new(0, 0), $grid).X -lt $buttons.SortSettings.ActualWidth) { throw "$($theme.key): $key overlaps sorting" }
        }
    }
    Write-Host "PASS: $($theme.key), sorting first, matching ${height}px buttons, hidden items collapse."
}
Write-Host "PASS: all $(@($themes).Count) theme toolbars."

# The Cold Seat regression is visible on active plates, so exercise its real
# filter and item templates in both states, including their actual margins.
[xml]$coldPanel = Get-Content "$root/src/themes/ColdSeat/src/Views/TopPanel.xaml" -Raw
[xml]$coldItem = Get-Content "$root/src/themes/ColdSeat/src/CustomControls/TopPanelItem.xaml" -Raw
$filterStyle = $coldPanel.SelectSingleNode('//*[@*[local-name()="Key"]="TopPanelFilterToggle"]').OuterXml
$itemStyle = $coldItem.SelectSingleNode('//*[local-name()="Style"]').OuterXml.Replace('{x:Type TopPanelItem}', '{x:Type ToggleButton}').Replace('Property="IsToggled"', 'Property="IsChecked"')
$xaml = '<Grid xmlns="http://schemas.microsoft.com/winfx/2006/xaml/presentation" xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml" xmlns:sys="clr-namespace:System;assembly=mscorlib"><Grid.Resources><sys:Boolean x:Key="True">True</sys:Boolean><sys:Boolean x:Key="False">False</sys:Boolean><sys:Double x:Key="IconSize">16</sys:Double>' + $filterStyle + $itemStyle + '</Grid.Resources><CheckBox Name="Filter" Style="{StaticResource TopPanelFilterToggle}" /><ToggleButton Name="Item" /></Grid>'
$testRoot = [Windows.Markup.XamlReader]::Parse($xaml)
$filterControl = $testRoot.FindName('Filter')
$itemControl = $testRoot.FindName('Item')
foreach ($active in $false, $true) {
    $filterControl.IsChecked = $active
    $filterControl.Tag = $active
    $itemControl.IsChecked = $active
    $testRoot.Measure([Windows.Size]::new(300, 48))
    $testRoot.Arrange([Windows.Rect]::new(0, 0, 300, 48))
    $testRoot.UpdateLayout()
    if ($filterControl.ActualHeight -ne 36 -or $itemControl.ActualHeight -ne 36) { throw 'Cold Seat active plates changed height' }
}
Write-Host 'PASS: Cold Seat filter and item plates stay 36px in idle and active states.'

