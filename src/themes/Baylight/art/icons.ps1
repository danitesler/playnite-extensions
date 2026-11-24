<#
Baylight icons: monoline glyphs on a 24-unit grid with round caps and joins, the weight and rhythm of a macOS 27
toolbar or menu icon (drawn here, not copied from SF Symbols).

Each icon is a list of pieces:
  S  a stroke path, widened by WPF into a filled outline (pen 1.7 unless W is given, round caps and joins)
  F  a filled path, used as is
  X  a stroke path cut out of what is already there (a knockout, e.g. the x inside a filled circle)
WPF's own geometry engine (GetWidenedPathGeometry + Combine) turns the pieces into one filled geometry, so the XAML and
the HTML previews draw exactly the same outline. IconTemplate fills it with the host's Foreground.

Rewrites the block between the ICONS markers in src/Media.xaml and in art/preview-*.html (an inline <symbol> sheet),
and writes art/mark.svg. A contact sheet goes to -Sheet (keep it in the session scratch folder).

    powershell.exe -NoProfile -File src/themes/Baylight/art/icons.ps1 [-Sheet <scratch>\baylight-icons.svg]
#>
param([string]$Sheet = "")

$ErrorActionPreference = "Stop"
Add-Type -AssemblyName PresentationCore, WindowsBase
$inv = [System.Globalization.CultureInfo]::InvariantCulture
$theme = Split-Path -Parent $PSScriptRoot

$PEN = 1.7

function New-Pen([double]$w) {
    $p = New-Object System.Windows.Media.Pen([System.Windows.Media.Brushes]::Black, $w)
    $p.StartLineCap = 'Round'; $p.EndLineCap = 'Round'; $p.LineJoin = 'Round'
    return $p
}

function Get-Piece($piece) {
    $g = [System.Windows.Media.Geometry]::Parse($piece.d)
    if ($piece.k -eq 'F') { return [System.Windows.Media.PathGeometry]::CreateFromGeometry($g) }
    $w = if ($piece.w) { [double]$piece.w } else { $PEN }
    return $g.GetWidenedPathGeometry((New-Pen $w), 0.01, 'Relative')
}

function Build-Icon($pieces) {
    $acc = $null
    foreach ($p in $pieces) {
        $geo = Get-Piece $p
        if ($null -eq $acc) { $acc = [System.Windows.Media.PathGeometry]::CreateFromGeometry($geo); continue }
        $mode = if ($p.k -eq 'X') { 'Exclude' } else { 'Union' }
        $acc = [System.Windows.Media.Geometry]::Combine($acc, $geo, $mode, $null, 0.01, 'Relative')
    }
    $acc.FillRule = 'Nonzero'
    $s = $acc.ToString($inv)
    # Two decimals are plenty on a 24 grid.
    $s = [regex]::Replace($s, '-?\d+\.\d+(E-?\d+)?', { param($m) ([double]::Parse($m.Value, $inv)).ToString('0.##', $inv) })
    return $s
}

function Use-Stroke([string]$d, [double]$w = 0) { if ($w) { @{ k = 'S'; d = $d; w = $w } } else { @{ k = 'S'; d = $d } } }
function Use-Fill([string]$d) { @{ k = 'F'; d = $d } }
function Use-Knock([string]$d, [double]$w = 0) { if ($w) { @{ k = 'X'; d = $d; w = $w } } else { @{ k = 'X'; d = $d } } }
function Get-Circle([double]$cx, [double]$cy, [double]$r) {
    $a = ($cx - $r).ToString($inv); $b = ($cx + $r).ToString($inv); $y = $cy.ToString($inv); $rr = $r.ToString($inv)
    "M$a,$y A$rr,$rr 0 1 1 $b,$y A$rr,$rr 0 1 1 $a,$y Z"
}
function Get-RRect([double]$x0, [double]$y0, [double]$x1, [double]$y1, [double]$r) {
    $f = { param($v) $v.ToString($inv) }
    "M$(& $f ($x0+$r)),$(& $f $y0) H$(& $f ($x1-$r)) A$(& $f $r),$(& $f $r) 0 0 1 $(& $f $x1),$(& $f ($y0+$r)) V$(& $f ($y1-$r)) A$(& $f $r),$(& $f $r) 0 0 1 $(& $f ($x1-$r)),$(& $f $y1) H$(& $f ($x0+$r)) A$(& $f $r),$(& $f $r) 0 0 1 $(& $f $x0),$(& $f ($y1-$r)) V$(& $f ($y0+$r)) A$(& $f $r),$(& $f $r) 0 0 1 $(& $f ($x0+$r)),$(& $f $y0) Z"
}

$icons = [ordered]@{
    # magnifyingglass
    IconSearch         = @((Use-Stroke (Get-Circle 10.4 10.4 6.4)), (Use-Stroke 'M15.2,15.2 L20.4,20.4' 2.1))
    # xmark.circle.fill
    IconClear          = @((Use-Fill (Get-Circle 12 12 9.2)), (Use-Knock 'M8.9,8.9 L15.1,15.1 M15.1,8.9 L8.9,15.1' 1.9))
    # slider.horizontal.3
    IconViewSettings   = @((Use-Stroke 'M3.5,6.5 H20.5 M3.5,12 H20.5 M3.5,17.5 H20.5'), (Use-Fill (Get-Circle 15.5 6.5 2.6)), (Use-Fill (Get-Circle 8.5 12 2.6)), (Use-Fill (Get-Circle 13 17.5 2.6)))
    # bookmark
    IconFilterPresets  = @((Use-Stroke 'M6.5,4 H17.5 V20.2 L12,16.4 L6.5,20.2 Z'))
    # square.stack
    IconGroup          = @((Use-Stroke (Get-RRect 4 9.5 20 20 3.2)), (Use-Stroke 'M6.2,6.4 H17.8'), (Use-Stroke 'M8.4,3.4 H15.6'))
    # arrow.up.arrow.down
    IconSort           = @((Use-Stroke 'M8,19.5 V4.5 M4.2,8.3 L8,4.5 L11.8,8.3'), (Use-Stroke 'M16,4.5 V19.5 M12.2,15.7 L16,19.5 L19.8,15.7'))
    # sidebar.left with rows
    IconDetailsView    = @((Use-Stroke (Get-RRect 3 4.5 21 19.5 3.2)), (Use-Stroke 'M9.5,4.5 V19.5'), (Use-Stroke 'M5.4,8.4 H7.2 M5.4,11.4 H7.2 M5.4,14.4 H7.2' 1.5))
    # square.grid.2x2
    IconGridView       = @((Use-Stroke (Get-RRect 3.6 3.6 10.6 10.6 2.2)), (Use-Stroke (Get-RRect 13.4 3.6 20.4 10.6 2.2)), (Use-Stroke (Get-RRect 3.6 13.4 10.6 20.4 2.2)), (Use-Stroke (Get-RRect 13.4 13.4 20.4 20.4 2.2)))
    # list.bullet
    IconListView       = @((Use-Fill (Get-Circle 5 6.5 1.5)), (Use-Fill (Get-Circle 5 12 1.5)), (Use-Fill (Get-Circle 5 17.5 1.5)), (Use-Stroke 'M9.5,6.5 H20.5 M9.5,12 H20.5 M9.5,17.5 H20.5'))
    # arrow.clockwise
    IconUpdate         = @((Use-Stroke 'M19.2,12.6 A7.3,7.3 0 1 1 16.9,6.6'), (Use-Stroke 'M13.4,4.6 L17.6,5.3 L17.2,9.6'))
    # folder
    IconExplorer       = @((Use-Stroke 'M3.4,7.6 V17.2 A2.6,2.6 0 0 0 6,19.8 H18 A2.6,2.6 0 0 0 20.6,17.2 V10 A2.6,2.6 0 0 0 18,7.4 H11.6 L9.6,5 H6 A2.6,2.6 0 0 0 3.4,7.6 Z'))
    # die.face.5
    IconRandom         = @((Use-Stroke (Get-RRect 3.8 3.8 20.2 20.2 4.2)), (Use-Fill (Get-Circle 8.4 8.4 1.45)), (Use-Fill (Get-Circle 15.6 8.4 1.45)), (Use-Fill (Get-Circle 12 12 1.45)), (Use-Fill (Get-Circle 8.4 15.6 1.45)), (Use-Fill (Get-Circle 15.6 15.6 1.45)))
    # shuffle
    IconViewRandom     = @((Use-Stroke 'M3.5,7.5 H6.6 C10.4,7.5 12.2,16.5 16.4,16.5 H20'), (Use-Stroke 'M3.5,16.5 H6.6 C8.4,16.5 9.6,14.6 10.6,12.8 M13,10.2 C13.9,8.7 15,7.5 16.4,7.5 H20'), (Use-Stroke 'M17.4,4.9 L20,7.5 L17.4,10.1 M17.4,13.9 L20,16.5 L17.4,19.1'))
    # line.3.horizontal.decrease
    IconFilter         = @((Use-Stroke 'M3.8,6.5 H20.2 M6.8,12 H17.2 M9.8,17.5 H14.2'))
    # bell
    IconNotifications  = @((Use-Stroke 'M12,3.6 C8.6,3.6 6.6,6.2 6.6,9.4 V13.2 L4.6,16.8 H19.4 L17.4,13.2 V9.4 C17.4,6.2 15.4,3.6 12,3.6 Z'), (Use-Stroke 'M9.8,19.6 A2.4,2.4 0 0 0 14.2,19.6'))
    # line.3.horizontal (kept for other files; the main menu button draws the mark)
    IconMainMenu       = @((Use-Stroke 'M4,6.5 H20 M4,12 H20 M4,17.5 H20'))
    # books.vertical
    IconLibrary        = @((Use-Stroke (Get-RRect 3.4 4.2 7.6 20 1.6)), (Use-Stroke (Get-RRect 9.2 4.2 13.4 20 1.6)), (Use-Stroke 'M15.05,19.37 L17.73,4.2 L21.28,4.83 L18.6,20 Z'), (Use-Stroke 'M3.4,8.4 H7.6 M9.2,8.4 H13.4' 1.4))
    # chart.bar
    IconStatistics     = @((Use-Stroke (Get-RRect 4 12.5 8 20 1.6)), (Use-Stroke (Get-RRect 10 4 14 20 1.6)), (Use-Stroke (Get-RRect 16 8.5 20 20 1.6)))
    # traffic-light glyphs: minus, zoom (two triangles out), restore (two triangles in), xmark
    IconWindowMinimize = @((Use-Stroke 'M6,12 H18' 2.2))
    IconWindowMaximize = @((Use-Fill 'M6,13.4 V7.6 A1.6,1.6 0 0 1 7.6,6 H13.4 Z'), (Use-Fill 'M18,10.6 V16.4 A1.6,1.6 0 0 1 16.4,18 H10.6 Z'))
    IconWindowRestore  = @((Use-Fill 'M11.4,11.4 H6 A0.9,0.9 0 0 1 5.4,9.9 L9.9,5.4 A0.9,0.9 0 0 1 11.4,6 Z'), (Use-Fill 'M12.6,12.6 H18 A0.9,0.9 0 0 1 18.6,14.1 L14.1,18.6 A0.9,0.9 0 0 1 12.6,18 Z'))
    IconWindowClose    = @((Use-Stroke 'M6.6,6.6 L17.4,17.4 M17.4,6.6 L6.6,17.4' 2.1))
    # chevron.down / chevron.right / checkmark / plus
    IconDropDown       = @((Use-Stroke 'M6,9.2 L12,15.2 L18,9.2' 2.0))
    IconSubmenu        = @((Use-Stroke 'M9.2,6 L15.2,12 L9.2,18' 2.0))
    IconCheck          = @((Use-Stroke 'M5,12.6 L9.8,17.4 L19,6.8' 2.2))
    IconAdd            = @((Use-Stroke 'M12,4.5 V19.5 M4.5,12 H19.5' 2.0))
    # pencil
    IconEdit           = @((Use-Stroke 'M15.8,4.6 L19.4,8.2 L9.2,18.4 L4.6,19.4 L5.6,14.8 Z'), (Use-Stroke 'M13.6,6.8 L17.2,10.4'))
    # trash
    IconRemove         = @((Use-Stroke 'M4,6.4 H20'), (Use-Stroke 'M9,6.4 V4.8 A1.2,1.2 0 0 1 10.2,3.6 H13.8 A1.2,1.2 0 0 1 15,4.8 V6.4'), (Use-Stroke 'M6,6.4 L7,18.6 A1.8,1.8 0 0 0 8.8,20.3 H15.2 A1.8,1.8 0 0 0 17,18.6 L18,6.4'), (Use-Stroke 'M10.2,10 V16.6 M13.8,10 V16.6' 1.5))
    # ellipsis
    IconOptions        = @((Use-Fill (Get-Circle 5.2 12 1.9)), (Use-Fill (Get-Circle 12 12 1.9)), (Use-Fill (Get-Circle 18.8 12 1.9)))
    # play.fill (rounded triangle)
    IconPlay           = @((Use-Fill 'M7.6,5.3 C7.6,4.1 8.9,3.4 9.9,4 L19.4,10.4 C20.4,11.1 20.4,12.9 19.4,13.6 L9.9,20 C8.9,20.6 7.6,19.9 7.6,18.7 Z'))
    # info.circle
    IconInfo           = @((Use-Stroke (Get-Circle 12 12 8.6)), (Use-Fill (Get-Circle 12 7.9 1.3)), (Use-Stroke 'M12,11.2 V16.8' 2.0))
    # arrow.down.to.line
    IconDownload       = @((Use-Stroke 'M12,3.8 V15.2 M7.2,10.6 L12,15.4 L16.8,10.6' 2.0), (Use-Stroke 'M5,19.6 H19' 2.0))
}

# Theme-only geometries: the mark (whole and in parts, for the animated main menu mark), the popup chevron pair.
$markRing = 'M8.4,2 H15.6 A6.4,6.4 0 0 1 22,8.4 V15.6 A6.4,6.4 0 0 1 15.6,22 H8.4 A6.4,6.4 0 0 1 2,15.6 V8.4 A6.4,6.4 0 0 1 8.4,2 Z M8.5,3.9 A4.6,4.6 0 0 0 3.9,8.5 V15.5 A4.6,4.6 0 0 0 8.5,20.1 H15.5 A4.6,4.6 0 0 0 20.1,15.5 V8.5 A4.6,4.6 0 0 0 15.5,3.9 Z'
$markSun = 'M7.8,13.4 A4.2,4.2 0 0 1 16.2,13.4 Z'
$markSwell1 = 'M6,15.4 C8,14.3 10,16.5 12,15.4 C14,14.3 16,16.5 18,15.4 L18,17.1 C16,18.2 14,16 12,17.1 C10,18.2 8,16 6,17.1 Z'
$markSwell2 = 'M8,18.3 C9.4,17.5 10.6,19.1 12,18.3 C13.4,17.5 14.6,19.1 16,18.3 L16,19.8 C14.6,20.6 13.4,19 12,19.8 C10.6,20.6 9.4,19 8,19.8 Z'
$local = [ordered]@{
    LocalMarkGeometry       = "F0 $markRing $markSun $markSwell1 $markSwell2"
    LocalMarkRingGeometry   = "F0 $markRing"
    LocalMarkSunGeometry    = "F1 $markSun"
    LocalMarkSwell1Geometry = "F1 $markSwell1"
    LocalMarkSwell2Geometry = "F1 $markSwell2"
    LocalChevronsGeometry   = (Build-Icon @((Use-Stroke 'M8.2,9.4 L12,5.6 L15.8,9.4 M8.2,14.6 L12,18.4 L15.8,14.6' 2.0)))
}

$built = [ordered]@{}
foreach ($k in $icons.Keys) { $built[$k] = Build-Icon $icons[$k] }

function Strip-Rule([string]$d) { $d -replace '^F[01]\s*', '' }
function Rule-Of([string]$d) { if ($d -match '^F0') { 'evenodd' } else { 'nonzero' } }

$xaml = @('    <!-- ICONS:BEGIN (art/icons.ps1) -->')
foreach ($k in $built.Keys) { $xaml += "    <Geometry x:Key=""$k"">$($built[$k])</Geometry>" }
foreach ($k in $local.Keys) { $xaml += "    <Geometry x:Key=""$k"">$($local[$k])</Geometry>" }
$xaml += '    <!-- ICONS:END -->'
$xamlBlock = $xaml -join "`n"

$sym = @('<!-- ICONS:BEGIN (art/icons.ps1) -->', '<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs>')
foreach ($k in $built.Keys) { $sym += "<symbol id=""$k"" viewBox=""0 0 24 24""><path fill=""currentColor"" fill-rule=""$(Rule-Of $built[$k])"" d=""$(Strip-Rule $built[$k])""/></symbol>" }
foreach ($k in $local.Keys) { $sym += "<symbol id=""$k"" viewBox=""0 0 24 24""><path fill=""currentColor"" fill-rule=""$(Rule-Of $local[$k])"" d=""$(Strip-Rule $local[$k])""/></symbol>" }
$sym += '</defs></svg>'
$sym += '<!-- ICONS:END -->'
$symBlock = $sym -join "`n"

function Patch-File([string]$path, [string]$block, [string]$pattern) {
    if (-not (Test-Path $path)) { return }
    $text = [System.IO.File]::ReadAllText($path)
    $rx = New-Object System.Text.RegularExpressions.Regex($pattern, 'Singleline')
    if (-not $rx.IsMatch($text)) { Write-Host "no ICONS markers in $(Split-Path -Leaf $path)"; return }
    $new = $rx.Replace($text, [System.Text.RegularExpressions.MatchEvaluator] { param($m) $block }, 1)
    [System.IO.File]::WriteAllText($path, $new, (New-Object System.Text.UTF8Encoding($false)))
    Write-Host "patched $(Split-Path -Leaf $path)"
}

Patch-File (Join-Path $theme 'src/Media.xaml') $xamlBlock '[ \t]*<!-- ICONS:BEGIN.*?<!-- ICONS:END -->'
foreach ($n in 'preview-details.html', 'preview-settings.html') {
    Patch-File (Join-Path $theme "art/$n") $symBlock '<!-- ICONS:BEGIN.*?<!-- ICONS:END -->'
}
$markD = Strip-Rule $local.LocalMarkGeometry
[System.IO.File]::WriteAllText((Join-Path $theme 'art/mark.svg'),
    "<svg xmlns=""http://www.w3.org/2000/svg"" viewBox=""0 0 24 24""><path fill=""currentColor"" fill-rule=""evenodd"" d=""$markD""/></svg>`n",
    (New-Object System.Text.UTF8Encoding($false)))

if ($Sheet) {
    $all = @($built.GetEnumerator()) + @($local.GetEnumerator())
    $out = @('<svg xmlns="http://www.w3.org/2000/svg" width="960" height="520" style="background:#2c2a29">')
    $i = 0
    foreach ($e in $all) {
        $x = ($i % 10) * 92 + 14; $y = [math]::Floor($i / 10) * 100 + 10
        $out += "<g transform=""translate($x,$y) scale(2)""><path fill=""#e4e3e2"" fill-rule=""$(Rule-Of $e.Value)"" d=""$(Strip-Rule $e.Value)""/></g>"
        $out += "<g transform=""translate($($x+52),$($y+8))""><rect width=""20"" height=""20"" rx=""5"" fill=""#0a6cdf""/><g transform=""translate(2,2) scale(0.6667)""><path fill=""#fff"" fill-rule=""$(Rule-Of $e.Value)"" d=""$(Strip-Rule $e.Value)""/></g></g>"
        $label = $e.Key -replace '^Icon', '' -replace '^Local', '' -replace 'Geometry$', ''
        $out += "<text x=""$x"" y=""$($y+66)"" fill=""#9e9b98"" font-size=""10"" font-family=""sans-serif"">$label</text>"
        $i++
    }
    $out += '</svg>'
    [System.IO.File]::WriteAllText($Sheet, ($out -join "`n"))
    Write-Host "sheet $Sheet"
}
