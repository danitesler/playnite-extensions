# Run with pwsh -STA -File tests/wpf/SteamScreenshotsRegressionTests.ps1 on Windows.
# Exercise the actual theme eligibility styles in WPF, including stale plugin state
# and a child Visibility animation that outlives the selected game.
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName PresentationFramework
if ([Threading.Thread]::CurrentThread.ApartmentState -ne 'STA') { throw 'Run this test with pwsh -STA.' }
$root = Split-Path (Split-Path $PSScriptRoot -Parent) -Parent
$index = Get-Content (Join-Path $root 'src/extensions.json') -Raw | ConvertFrom-Json
$steam = [guid]'cb91dfc9-b977-43bf-8e70-55f46e410fab'
function Assert-Visibility($Element, $Expected, $Label) {
    $Element.Dispatcher.Invoke([Action]{}, [Windows.Threading.DispatcherPriority]::ApplicationIdle)
    if ($Element.Visibility.ToString() -ne $Expected) { throw "${Label}: expected $Expected, got $($Element.Visibility)" }
}
function Set-Game($Element, $PluginId, $Source, $Visible = $true) {
    $Element.DataContext = [pscustomobject]@{
        Game = [pscustomobject]@{ Id = [guid]::NewGuid(); PluginId = $PluginId; Source = [pscustomobject]@{ Name = $Source } }
        PluginVisible = $Visible
    }
}
function Pump-Dispatcher([int]$Milliseconds) {
    $frame = [Windows.Threading.DispatcherFrame]::new()
    $timer = [Windows.Threading.DispatcherTimer]::new()
    $timer.Interval = [TimeSpan]::FromMilliseconds($Milliseconds)
    $timer.Add_Tick({ $frame.Continue = $false; $timer.Stop() }.GetNewClosure())
    $timer.Start()
    [Windows.Threading.Dispatcher]::PushFrame($frame)
}
$count = 0
foreach ($theme in $index.extensions | Where-Object kind -eq 'theme') {
    foreach ($view in 'DetailsViewGameOverview', 'GridViewGameOverview') {
        $path = Join-Path $root "$($theme.dir)/src/Views/$view.xaml"
        [xml]$xml = Get-Content $path -Raw
        $scope = $xml.SelectSingleNode('//*[@*[local-name()="Name"]="SteamScreenshotsGameScope"]')
        # Before the fix, exercise the original section style to demonstrate the leak.
        if (-not $scope) {
            $scope = $xml.SelectSingleNode('//*[@*[local-name()="Name"]="SteamScreenshots_SteamScreenshotsViewControl"]')
            while ($scope -and -not $scope.SelectSingleNode('./*[contains(local-name(),".Style")]')) { $scope = $scope.ParentNode }
        }
        $style = $scope.SelectSingleNode('./*[contains(local-name(),".Style")]/*[local-name()="Style"]')
        if (-not $style) { throw "No screenshot style in $path" }
        $styleText = $style.OuterXml.Replace('{PluginSettings Plugin=SteamScreenshots, Path=IsControlVisible, FallbackValue=PluginUnavailable}', '{Binding PluginVisible}')
        $xaml = '<Grid xmlns="http://schemas.microsoft.com/winfx/2006/xaml/presentation" xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml"><Grid.Style>' + $styleText + '</Grid.Style><Border Width="10" Height="10" /></Grid>'
        $element = [Windows.Markup.XamlReader]::Parse($xaml)
        Set-Game $element ([guid]::NewGuid()) 'Battle.net'
        Assert-Visibility $element Collapsed "$($theme.key)/$view non-Steam with stale plugin=True"
        if (-not $scope.SelectSingleNode('.//*[@*[local-name()="Name"]="SteamScreenshots_SteamScreenshotsViewControl"]')) { throw "Gate does not contain plugin host: $path" }
        Set-Game $element $steam 'Steam' $false
        Assert-Visibility $element Visible 'Steam loading'
        # Keep an animation alive on the child: it must never override the parent gate.
        $animation = [Windows.Media.Animation.ObjectAnimationUsingKeyFrames]::new()
        $animation.KeyFrames.Add([Windows.Media.Animation.DiscreteObjectKeyFrame]::new([Windows.Visibility]::Visible, [Windows.Media.Animation.KeyTime]::FromTimeSpan([TimeSpan]::Zero))) | Out-Null
        $element.Children[0].BeginAnimation([Windows.UIElement]::VisibilityProperty, $animation)
        Set-Game $element ([guid]::NewGuid()) 'Battle.net' $false
        Assert-Visibility $element Collapsed 'Steam loading -> non-Steam'
        Set-Game $element ([guid]::NewGuid()) 'Battle.net' $true
        Assert-Visibility $element Collapsed 'Late plugin completion on non-Steam'
        Set-Game $element ([guid]::NewGuid()) 'Steam'
        Assert-Visibility $element Visible 'Manual Steam source'
        Set-Game $element $steam 'Renamed library source'
        Assert-Visibility $element Visible 'Steam library with renamed source'
        $element.DataContext = [pscustomobject]@{ Game = $null; PluginVisible = $true }
        Assert-Visibility $element Collapsed 'Cleared selection with stale plugin=True'
        $element.DataContext = $null
        Assert-Visibility $element Collapsed 'Initial empty view'
        Set-Game $element $steam 'Steam'
        Assert-Visibility $element Visible 'Selection restored after view change'
        $count++
    }
}
Write-Host "PASS: $count theme views reject stale screenshot visibility across game/view changes."

# ColdSeat also renders a localized empty result after its per-game timeout.
foreach ($view in 'DetailsViewGameOverview', 'GridViewGameOverview') {
    [xml]$xml = Get-Content (Join-Path $root "src/themes/ColdSeat/src/Views/$view.xaml") -Raw
    $scope = $xml.SelectSingleNode('//*[@*[local-name()="Name"]="SteamScreenshotsGameScope"]')
    $text = $scope.OuterXml.Replace('{PluginSettings Plugin=SteamScreenshots, Path=IsControlVisible, FallbackValue=PluginUnavailable}', '{Binding PluginVisible}').Replace('0:0:12', '0:0:2')
    $text = '<Grid xmlns="http://schemas.microsoft.com/winfx/2006/xaml/presentation" xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml">' + $text + '</Grid>'
    $testRoot = [Windows.Markup.XamlReader]::Parse($text)
    $element = $testRoot.Children[0]
    $window = [Windows.Window]::new()
    $window.Content = $testRoot
    $window.ShowInTaskbar = $false
    $window.WindowStyle = 'None'
    $window.Width = 1
    $window.Height = 1
    $window.Opacity = 0
    try {
        Set-Game $element $steam 'Steam' $false
        $window.Show()
        $skeleton = $testRoot.FindName('SteamScreenshotsSkeleton')
        $empty = $skeleton.Parent.Children[1]
        Assert-Visibility $skeleton Visible 'ColdSeat starts loading'
        Pump-Dispatcher 2200
        Assert-Visibility $skeleton Collapsed 'ColdSeat loading timeout'
        Assert-Visibility $empty Visible 'ColdSeat empty result'
        Set-Game $element $steam 'Steam' $false
        # WPF applies replacement animation clocks on the next render tick.
        Pump-Dispatcher 100
        Assert-Visibility $skeleton Visible 'ColdSeat next Steam game restarts loading'
        Assert-Visibility $empty Collapsed 'ColdSeat clears previous empty result'
        Set-Game $element ([guid]::NewGuid()) 'Battle.net' $true
        Assert-Visibility $element Collapsed 'ColdSeat late completion stays hidden'
        Set-Game $element $steam 'Steam' $true
        Assert-Visibility $skeleton.Parent Collapsed 'ColdSeat loaded hides placeholder and empty result'
        Set-Game $element $steam 'Steam' 'PluginUnavailable'
        Assert-Visibility $element.Children[0] Collapsed 'ColdSeat missing plugin hides entire section'
    } finally { $window.Close() }
}
Write-Host 'PASS: ColdSeat loading, timeout, empty result, reload, loaded and missing-plugin states in both views.'

