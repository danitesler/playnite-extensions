# Render the toolbar geometry for Playnite menu slots that accept image paths.
# Run with pwsh -STA -File src/themes/Reverie/art/render-menu-icons.ps1.
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName PresentationCore
$theme = Split-Path $PSScriptRoot -Parent
[xml]$media = Get-Content "$theme/src/Media.xaml" -Raw
$tokens = Get-Content "$theme/src/tokens.css" -Raw
$gold = [regex]::Match($tokens, '--dream-gold:\s*(#[0-9a-fA-F]{6})').Groups[1].Value
$brush = [Windows.Media.SolidColorBrush]::new([Windows.Media.ColorConverter]::ConvertFromString($gold))
$ns = 'http://schemas.microsoft.com/winfx/2006/xaml'
$output = New-Item -ItemType Directory -Force "$theme/src/Images/Menu"
foreach ($slot in $media.DocumentElement.ChildNodes | Where-Object InnerText -like 'Images/Menu/*.png') {
    $file = Split-Path $slot.InnerText -Leaf
    $key = 'Icon' + [IO.Path]::GetFileNameWithoutExtension($file)
    $node = $media.DocumentElement.ChildNodes | Where-Object { $_ -is [Xml.XmlElement] -and $_.GetAttribute('Key', $ns) -eq $key }
    $visual = [Windows.Media.DrawingVisual]::new()
    $drawing = $visual.RenderOpen()
    $drawing.PushTransform([Windows.Media.ScaleTransform]::new(3, 3))
    $drawing.DrawGeometry($brush, $null, [Windows.Media.Geometry]::Parse($node.InnerText))
    $drawing.Close()
    $bitmap = [Windows.Media.Imaging.RenderTargetBitmap]::new(48, 48, 96, 96, [Windows.Media.PixelFormats]::Pbgra32)
    $bitmap.Render($visual)
    $png = [Windows.Media.Imaging.PngBitmapEncoder]::new()
    $png.Frames.Add([Windows.Media.Imaging.BitmapFrame]::Create($bitmap))
    $stream = [IO.File]::Create((Join-Path $output.FullName $file))
    try { $png.Save($stream) } finally { $stream.Dispose() }
}
