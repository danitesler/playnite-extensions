# --- AGENTS.md rule checks ---------------------------------------------------------------------------------------
# Static lints for rules that have regressed before. They read parsed XAML (comments are not nodes, so a comment
# that mentions IconPadding or CornerRadiusFull never trips them) and return error strings like Test-ThemeBuild.

$script:XamlNs = "http://schemas.microsoft.com/winfx/2006/xaml"
$script:PillRadiusThreshold = 999   # CornerRadiusFull is 9999 / 10000; anything this large is a pill radius.
$script:PeerTemplateFingerprintCache = @{}

function ConvertTo-NumberList {
    # "14,12" / "4 0 4 0" / "8" -> doubles; $null when any part is not a plain number (bindings, resources, placeholders).
    param([string]$Value)
    if (-not $Value -or $Value -match "[{}]") { return $null }
    $numbers = [System.Collections.Generic.List[double]]::new()
    foreach ($part in ($Value.Trim() -split "[,\s]+")) {
        if ($part -eq "") { continue }
        $n = 0.0
        if (-not [double]::TryParse($part, [System.Globalization.NumberStyles]::Float, [System.Globalization.CultureInfo]::InvariantCulture, [ref]$n)) {
            return $null
        }
        $numbers.Add($n)
    }
    if ($numbers.Count -eq 0) { return $null }
    return , $numbers.ToArray()
}

function Test-PillRadiusValue {
    param([string]$Value)
    if ($Value -match "CornerRadiusFull") { return $true }
    $numbers = ConvertTo-NumberList $Value
    return ($null -ne $numbers -and @($numbers | Where-Object { $_ -ge $script:PillRadiusThreshold }).Count -gt 0)
}

function Get-StyleSetterValue {
    param([System.Xml.XmlElement]$Style, [string]$Property)
    foreach ($child in $Style.ChildNodes) {
        if ($child -is [System.Xml.XmlElement] -and $child.LocalName -eq "Setter" -and $child.GetAttribute("Property") -eq $Property) {
            return $child.GetAttribute("Value")
        }
    }
    return ""
}

function Test-SquareSize {
    param([string]$Width, [string]$Height)
    $w = ConvertTo-NumberList $Width
    $h = ConvertTo-NumberList $Height
    return ($null -ne $w -and $null -ne $h -and $w.Count -eq 1 -and $h.Count -eq 1 -and $w[0] -gt 0 -and $w[0] -eq $h[0])
}

function Get-XamlTypeName {
    # "{x:Type Button}" / "local:SidebarItem" / "Button" -> "Button".
    param([string]$Value)
    if (-not $Value) { return "" }
    $name = $Value -replace "^\{x:Type\s+", "" -replace "\}$", ""
    return ($name -split ":")[-1].Trim()
}

function Get-SourceDisplayPath {
    # Built theme file -> the source file it came from (rendered *.template.xaml files lose ".template" in the drop,
    # and unoverridden defaults come from scripts/templates/theme-defaults).
    param([string]$SourceRoot, [string]$Relative)
    if (-not $SourceRoot) { return $Relative }
    $template = $Relative -replace "\.xaml$", ".template.xaml"
    if (Test-Path (Join-Path (Join-RepoPath $SourceRoot) $template)) { return "$SourceRoot/$template" }
    if (Test-Path (Join-Path (Join-RepoPath $SourceRoot) $Relative)) { return "$SourceRoot/$Relative" }
    $defaultRel = "scripts/templates/theme-defaults/$Relative"
    if (Test-Path (Join-RepoPath $defaultRel)) { return $defaultRel }
    return "$SourceRoot/$Relative"
}

function Get-ElementLabel {
    param([System.Xml.XmlElement]$Element)
    $name = $Element.GetAttribute("Name", $script:XamlNs)
    if (-not $name) { $name = $Element.GetAttribute("Name") }
    if ($name) { return "<$($Element.LocalName) x:Name=`"$name`">" }
    return "<$($Element.LocalName)>"
}

function Test-SidebarIconPadding {
    <#
        AGENTS.md "Sidebar Icon Sizing": an element bound to {Binding IconPadding} must not sit inside a fixed plate padding
        (e.g. Padding="14,12" on a 44x40 item). The two sum past the item size, the icon Viewbox collapses to 0px and add-on
        sidebar icons vanish. Also catches the plate padding arriving through {TemplateBinding Padding} from a Style setter.
    #>
    param([Parameter(Mandatory = $true)] [string]$Directory, [string]$SourceRoot)

    $errors = [System.Collections.Generic.List[string]]::new()
    foreach ($entry in Get-CachedThemeXamlEntries -Directory $Directory) {
        $clean = $entry.Clean
        $relative = $entry.Relative
        $where = Get-SourceDisplayPath -SourceRoot $SourceRoot -Relative $relative

        # Static regex linter check: stacked padding in SidebarItem.xaml (a fixed plate padding wrapping
        # an element bound to IconPadding). The structural check below catches every shape of this precisely;
        # this fast check names the file directly. Fixed = plain numbers only (bindings and resources are not plates).
        if ($entry.Name -eq "SidebarItem.xaml") {
            $hasFixedPlate = $clean -match 'Padding\s*=\s*"[0-9][0-9\s,\.]*"'
            $hasIconPadding = $clean -match 'Padding\s*=\s*"[^"]*IconPadding'
            if ($hasFixedPlate -and $hasIconPadding) {
                $errors.Add("${where}: Stacked padding in SidebarItem.xaml (a fixed plate padding wrapping IconPadding). Keep only one (AGENTS.md Sidebar Icon Sizing).") | Out-Null
            }
        }

        # XML structural check: any element bound to IconPadding nested in element with non-zero Padding
        $doc = $entry.Doc
        if (-not $doc) { continue }
        foreach ($bound in $doc.SelectNodes("//*[contains(@Padding, 'IconPadding')]")) {
            $parent = $bound.ParentNode
            while ($parent -is [System.Xml.XmlElement] -and $parent.LocalName -notin @("ControlTemplate", "DataTemplate")) {
                $padding = $parent.GetAttribute("Padding")
                if ($padding -match "TemplateBinding\s+Padding") {
                    $style = $parent.SelectSingleNode("ancestor::*[local-name()='Style'][1]")
                    if ($style) { $padding = Get-StyleSetterValue -Style $style -Property "Padding" }
                }
                $numbers = ConvertTo-NumberList $padding
                if ($null -ne $numbers -and @($numbers | Where-Object { $_ -ne 0 }).Count -gt 0) {
                    $errors.Add("${where}: $(Get-ElementLabel $parent) has Padding=`"$padding`" around $(Get-ElementLabel $bound) bound to IconPadding. Stacked paddings collapse the icon to 0px; keep only one (AGENTS.md Sidebar Icon Sizing).") | Out-Null
                    break
                }
                $parent = $parent.ParentNode
            }
        }
    }
    return @($errors | Select-Object -Unique)
}

function Test-PillCornerRadius {
    <#
        AGENTS.md "Control Corner Radii": CornerRadiusFull (or any pill-sized literal radius) clamps X and Y independently,
        so on anything that is not 1:1 it draws an oval. Base controls, action buttons, tag chips and thin tracks must use
        ControlCornerRadius / CornerRadiusSmall / half the track thickness. Allowed when the element, its Style setters or
        the control that owns the template declare Width == Height.
    #>
    param([Parameter(Mandatory = $true)] [string]$Directory, [string]$SourceRoot)

    $restrictedTypes = @(
        "Button", "RepeatButton", "ToggleButton", "Slider", "ProgressBar", "ScrollBar", "Thumb",
        "TabControl", "TabItem", "MenuItem", "SearchBox", "PlayButton", "PropertyItemButton"
    )
    $restrictedKeyPattern = "PlayButton|PropertyItemButton|SearchBox|Slider|ProgressBar|ScrollBar"
    $errors = [System.Collections.Generic.List[string]]::new()

    foreach ($entry in Get-CachedThemeXamlEntries -Directory $Directory) {
        $clean = $entry.Clean
        $relative = $entry.Relative
        $where = Get-SourceDisplayPath -SourceRoot $SourceRoot -Relative $relative

        # Static regex linter check: thin tracks and fills must NEVER use CornerRadiusFull (it clamps to
        # width/2, turning a 4-6px line into a needle). Use an explicit numeric radius equal to half the
        # track thickness. ScrollViewer.xaml is scoped to its ScrollBarThumb block: the file also hosts
        # square arrow buttons where a pill radius is legitimate (the square-walk below allows those).
        if ($entry.Name -in @("Slider.xaml", "ProgressBar.xaml", "Thumb.xaml")) {
            if ($clean -match 'CornerRadius\s*=\s*"[^"]*CornerRadiusFull' -or $clean -match 'Property\s*=\s*"CornerRadius"\s+Value\s*=\s*"[^"]*CornerRadiusFull') {
                $errors.Add("${where}: $($entry.Name) uses CornerRadiusFull on a thin track/fill. Use an explicit numeric radius equal to half the track thickness (AGENTS.md Control Corner Radii).") | Out-Null
            }
        }
        if ($entry.Name -eq "ScrollViewer.xaml") {
            $thumbBlock = [regex]::Match($clean, 'x:Key\s*=\s*"ScrollBarThumb"[\s\S]*?</Style>').Value
            if ($thumbBlock -and ($thumbBlock -match 'CornerRadius\s*=\s*"[^"]*CornerRadiusFull' -or $thumbBlock -match 'Property\s*=\s*"CornerRadius"\s+Value\s*=\s*"[^"]*CornerRadiusFull')) {
                $errors.Add("${where}: ScrollBarThumb uses CornerRadiusFull on a thin thumb. Use an explicit numeric radius equal to half the thumb thickness (AGENTS.md Control Corner Radii).") | Out-Null
            }
        }

        # Static regex linter check: base control styles must not use CornerRadiusFull. Plugins (SteamScreenshots
        # carousel < >, numeric spin buttons) and unconstrained dialogs inherit these styles, and a pill radius
        # on a non-square element draws an oval.
        if (($entry.Name -in @("Button.xaml", "ToggleButton.xaml", "RepeatButton.xaml", "TabControl.xaml") -and $relative -match "DefaultControls") -or
            ($entry.Name -eq "SearchBox.xaml" -and $relative -match "CustomControls")) {
            if ($clean -match 'Property\s*=\s*"CornerRadius"\s+Value\s*=\s*"[^"]*CornerRadiusFull') {
                $errors.Add("${where}: Base $($entry.Name) style uses CornerRadiusFull. Base controls must use ControlCornerRadius (AGENTS.md Control Corner Radii).") | Out-Null
            }
        }

        # ControlCornerRadius feeds every base control style, so it can never be a pill radius.
        $doc = $entry.Doc
        if (-not $doc) { continue }

        foreach ($definition in $doc.SelectNodes("//*[local-name()='CornerRadius']")) {
            if ($definition.GetAttribute("Key", $script:XamlNs) -ne "ControlCornerRadius") { continue }
            if (Test-PillRadiusValue $definition.InnerText) {
                $errors.Add("${where}: ControlCornerRadius is a pill radius ($($definition.InnerText.Trim())); base controls need a real radius (AGENTS.md Control Corner Radii).") | Out-Null
            }
        }

        foreach ($element in @($doc.SelectNodes("//*[@CornerRadius] | //*[local-name()='Setter'][@Property='CornerRadius']"))) {
            $value = if ($element.LocalName -eq "Setter") { $element.GetAttribute("Value") } else { $element.GetAttribute("CornerRadius") }
            if (-not (Test-PillRadiusValue $value)) { continue }

            # 1:1 on the element itself is the allowed case (badges, round icon buttons).
            if (Test-SquareSize $element.GetAttribute("Width") $element.GetAttribute("Height")) { continue }

            # Walk out to the nearest control definition: a Style, or the element that owns a *.Style / *.Template.
            $types = [System.Collections.Generic.List[string]]::new()
            $keys = [System.Collections.Generic.List[string]]::new()
            $square = $false
            $node = $element.ParentNode
            while ($node -is [System.Xml.XmlElement]) {
                if ($node.LocalName -eq "ControlTemplate") {
                    $types.Add((Get-XamlTypeName $node.GetAttribute("TargetType"))) | Out-Null
                    $keys.Add($node.GetAttribute("Key", $script:XamlNs)) | Out-Null
                }
                elseif ($node.LocalName -eq "Style") {
                    $types.Add((Get-XamlTypeName $node.GetAttribute("TargetType"))) | Out-Null
                    $keys.Add($node.GetAttribute("Key", $script:XamlNs)) | Out-Null
                    $keys.Add(($node.GetAttribute("BasedOn") -replace "^\{\w+Resource\s+", "" -replace "\}$", "")) | Out-Null
                    if (Test-SquareSize (Get-StyleSetterValue $node "Width") (Get-StyleSetterValue $node "Height")) { $square = $true }
                    $owner = $node.ParentNode
                    if ($owner -is [System.Xml.XmlElement] -and $owner.LocalName -like "*.Style" -and $owner.ParentNode -is [System.Xml.XmlElement]) {
                        $control = $owner.ParentNode
                        $types.Add($control.LocalName) | Out-Null
                        if (Test-SquareSize $control.GetAttribute("Width") $control.GetAttribute("Height")) { $square = $true }
                    }
                    break
                }
                elseif ($node.LocalName -like "*.Template" -and $node.ParentNode -is [System.Xml.XmlElement]) {
                    $control = $node.ParentNode
                    $types.Add($control.LocalName) | Out-Null
                    if (Test-SquareSize $control.GetAttribute("Width") $control.GetAttribute("Height")) { $square = $true }
                    break
                }
                $node = $node.ParentNode
            }
            if ($square) { continue }

            $hitType = @($types | Where-Object { $_ -and $restrictedTypes -contains $_ }) | Select-Object -First 1
            $hitKey = @($keys | Where-Object { $_ -and $_ -match $restrictedKeyPattern }) | Select-Object -First 1
            if (-not $hitType -and -not $hitKey) { continue }

            $context = if ($hitType) { $hitType } else { $hitKey }
            $errors.Add("${where}: $(Get-ElementLabel $element) in a $context template uses pill radius '$value' without Width == Height. Use ControlCornerRadius, CornerRadiusSmall or half the track thickness (AGENTS.md Control Corner Radii).") | Out-Null
        }
    }
    return @($errors | Select-Object -Unique)
}

function Test-GroupBoxContentSized {
    <#
        AGENTS.md "Statistics page": Playnite lays the statistics sections out as GroupBoxes in a wrapping panel, so each
        one is a compact card sized by its content. A GroupBox template with a child that reports a large desired width
        (a wide Path or a Stretch=Fill Line outside a Canvas, a fixed Width/MinWidth of 200 or more, or a Control whose template does either)
        makes every box ask for the whole page: the cards stack full width with large empty areas. Draw such decoration
        inside a Canvas (no desired size, the host clips it), or use Rectangles/Borders that stretch.
    #>
    param([Parameter(Mandatory = $true)] [string]$Directory, [string]$SourceRoot)

    $errors = [System.Collections.Generic.List[string]]::new()
    $entries = Get-CachedThemeXamlEntries -Directory $Directory
    $groupBoxEntry = $entries | Where-Object { $_.Relative -match "DefaultControls/GroupBox\.xaml$" } | Select-Object -First 1
    if (-not $groupBoxEntry -or -not $groupBoxEntry.Doc) { return @() }
    $where = Get-SourceDisplayPath -SourceRoot $SourceRoot -Relative $groupBoxEntry.Relative

    function Find-WideChild($root, $label) {
        $found = [System.Collections.Generic.List[string]]::new()
        foreach ($node in $root.SelectNodes(".//*")) {
            $name = $node.LocalName
            if ($name -match "\.") { continue }
            $inCanvas = $node.SelectSingleNode("ancestor::*[local-name()='Canvas']") -ne $null
            if (-not $inCanvas) {
                if ($name -eq "Path" -and $node.GetAttribute("Stretch") -in @("", "None")) {
                    $extent = 0.0
                    foreach ($m in [regex]::Matches($node.GetAttribute("Data"), "-?\d+(?:\.\d+)?")) { $extent = [Math]::Max($extent, [Math]::Abs([double]::Parse($m.Value, [Globalization.CultureInfo]::InvariantCulture))) }
                    if ($extent -ge 200) { $found.Add("$label has a Path outside a Canvas whose geometry spans $extent px") | Out-Null }
                }
                elseif ($name -eq "Line" -and $node.GetAttribute("Stretch") -eq "Fill" -and -not $node.GetAttribute("Width")) {
                    $found.Add("$label has a Line with Stretch=Fill and no Width outside a Canvas") | Out-Null
                }
            }
            foreach ($attr in @("Width", "MinWidth")) {
                $value = $node.GetAttribute($attr)
                $number = 0.0
                if ($value -and [double]::TryParse($value, [Globalization.NumberStyles]::Float, [Globalization.CultureInfo]::InvariantCulture, [ref]$number) -and $number -ge 200) {
                    $found.Add("$label has $name $attr=$value") | Out-Null
                }
            }
        }
        return $found
    }

    $template = $groupBoxEntry.Doc.SelectSingleNode("//*[local-name()='ControlTemplate'][@TargetType='{x:Type GroupBox}']")
    if (-not $template) { return @() }

    $problems = [System.Collections.Generic.List[string]]::new()
    foreach ($p in (Find-WideChild $template "the GroupBox template")) { $problems.Add($p) | Out-Null }

    # Control Template="{DynamicResource X}" inside the GroupBox template: look X up in the theme's other files.
    foreach ($control in $template.SelectNodes(".//*[@Template]")) {
        if ($control.GetAttribute("Template") -notmatch "\{(?:Dynamic|Static)Resource\s+(\w+)\}") { continue }
        $key = $Matches[1]
        foreach ($entry in $entries) {
            if (-not $entry.Doc) { continue }
            $definition = $entry.Doc.SelectSingleNode("//*[local-name()='ControlTemplate'][@*[local-name()='Key']='$key']")
            if ($definition) {
                foreach ($p in (Find-WideChild $definition "template '$key'")) { $problems.Add($p) | Out-Null }
                break
            }
        }
    }
    foreach ($problem in ($problems | Select-Object -Unique)) {
        $errors.Add("${where}: $problem, used by GroupBox. Its width becomes the card's desired width, so the statistics sections stack full width (AGENTS.md Statistics page). Put it in a Canvas.") | Out-Null
    }
    return @($errors | Select-Object -Unique)
}

function Test-ComboBoxChevronRoom {
    <#
        AGENTS.md "ComboBox chevron room": the selected-value ContentPresenter and the dropdown chevron share one cell,
        and a ComboBox is only as wide as its content, so a value with no space reserved on its right runs under the
        chevron (Blacklist: "English" with the arrow on top of the h). ContentSite (or a wrapper above it) must carry a
        right margin of at least 12px, or sit in its own grid column.
    #>
    param([Parameter(Mandatory = $true)] [string]$Directory, [string]$SourceRoot)

    $errors = [System.Collections.Generic.List[string]]::new()
    $entry = Get-CachedThemeXamlEntries -Directory $Directory | Where-Object { $_.Relative -match "DefaultControls/ComboBox\.xaml$" } | Select-Object -First 1
    if (-not $entry -or -not $entry.Doc) { return @() }
    $where = Get-SourceDisplayPath -SourceRoot $SourceRoot -Relative $entry.Relative
    $site = $entry.Doc.SelectSingleNode("//*[@*[local-name()='Name']='ContentSite']")
    if (-not $site) { return @() }

    $room = 0.0
    $node = $site
    $ownColumn = $false
    while ($node -and $node.LocalName -ne "ControlTemplate") {
        $margin = $node.GetAttribute("Margin")
        if ($margin -and $margin -notmatch "\{") {
            $parts = $margin -split "[,\s]+" | Where-Object { $_ -ne "" }
            $right = if ($parts.Count -eq 4) { $parts[2] } else { $parts[0] }
            $number = 0.0
            if ([double]::TryParse($right, [Globalization.NumberStyles]::Float, [Globalization.CultureInfo]::InvariantCulture, [ref]$number)) { $room += $number }
        }
        if ($node.GetAttribute("Grid.Column") -or $node.ParentNode.SelectSingleNode("*[local-name()='Grid.ColumnDefinitions']")) { $ownColumn = $true }
        $node = $node.ParentNode
    }
    if (-not $ownColumn -and $room -lt 12) {
        $errors.Add("${where}: the ComboBox value (ContentSite) reserves only ${room}px on its right, so it runs under the dropdown chevron. Wrap it in a Border with a right margin of chevron width + margin + 8px, or give it its own grid column (AGENTS.md ComboBox chevron room).") | Out-Null
    }
    return @($errors)
}

function Test-GameActionButtons {
    <#
        AGENTS.md "Game page action buttons": next to Play, the secondary buttons (More, Edit) are icon-only (a glyph,
        the label as ToolTip) and Edit is always visible, never shown only while the pointer is over the header.
    #>
    param([Parameter(Mandatory = $true)] [string]$Directory, [string]$SourceRoot)

    $errors = [System.Collections.Generic.List[string]]::new()
    foreach ($entry in (Get-CachedThemeXamlEntries -Directory $Directory | Where-Object { $_.Relative -match "Views/(Details|Grid)ViewGameOverview\.xaml$" })) {
        $where = Get-SourceDisplayPath -SourceRoot $SourceRoot -Relative $entry.Relative
        $doc = $entry.Doc
        if (-not $doc) { continue }

        $more = $doc.SelectSingleNode("//*[local-name()='Button'][@*[local-name()='Name']='PART_ButtonMoreActions']")
        if ($more) {
            $labelContent = $more.GetAttribute("Content") -match "LOCMoreAction"
            $labelText = $more.SelectSingleNode(".//*[local-name()='TextBlock'][contains(@Text,'LOC')]") -ne $null
            if ($labelContent -or $labelText) {
                $errors.Add("${where}: the More button carries a text label. Secondary buttons next to Play are icon-only; put the label in ToolTip (AGENTS.md Game page action buttons).") | Out-Null
            }
        }
        $edit = $doc.SelectSingleNode("//*[local-name()='Button'][@*[local-name()='Name']='PART_ButtonEditGame']")
        if ($edit) {
            $hidden = $edit.SelectSingleNode(".//*[local-name()='Setter'][@Property='Visibility'][@Value='Hidden' or @Value='Collapsed']") -ne $null
            $hover = $edit.SelectSingleNode(".//*[local-name()='DataTrigger'][contains(@Binding,'IsMouseOver')][contains(@Binding,'AncestorType')]") -ne $null
            if ($hidden -or $hover -or $edit.GetAttribute("Visibility") -match "Hidden|Collapsed") {
                $errors.Add("${where}: the Edit button is hidden until the pointer is over the header. It must always be visible (AGENTS.md Game page action buttons).") | Out-Null
            }
        }
        if ($more -and $edit) {
            $moreSize = "$($more.GetAttribute('Width'))x$($more.GetAttribute('Height'))"
            $editSize = "$($edit.GetAttribute('Width'))x$($edit.GetAttribute('Height'))"
            if ($more.GetAttribute("Width") -ne $more.GetAttribute("Height") -or $moreSize -ne $editSize -or $moreSize -eq "x") {
                $errors.Add("${where}: More is $moreSize and Edit is $editSize. Both must be the same fixed square (Width == Height, equal on both) (AGENTS.md Game page action buttons).") | Out-Null
            }
        }
        foreach ($pair in @(@($more, "More"), @($edit, "Edit"))) {
            if ($pair[0] -and -not $pair[0].GetAttribute("ToolTip")) {
                $errors.Add("${where}: the $($pair[1]) button has no ToolTip. Icon-only buttons need their label as ToolTip (LOCMoreAction / LOCEditGame) (AGENTS.md Game page action buttons).") | Out-Null
            }
        }
    }
    return @($errors | Select-Object -Unique)
}

function Test-ThemeAnimations {
    <#
        Crashes Playnite when game details open: a storyboard in an element's Style that animates through a sub-object, such
        as (UIElement.RenderTransform).(ScaleTransform.ScaleY). The game page is built with no game bound, so the Game = null
        trigger fires during template creation while that object is read-only. Build and load both succeed; the exception
        ("Cannot animate '(0).(1)' on an immutable object instance") only comes when the page opens.
    #>
    param([Parameter(Mandatory = $true)] [string]$Directory, [string]$SourceRoot)

    $errors = [System.Collections.Generic.List[string]]::new()
    foreach ($entry in Get-CachedThemeXamlEntries -Directory $Directory) {
        $doc = $entry.Doc
        if (-not $doc) { continue }
        $where = Get-SourceDisplayPath -SourceRoot $SourceRoot -Relative $entry.Relative
        # Check literal clock times with the same invariant TimeSpan parser used by WPF.
        # Other timing forms such as percentages, Uniform and Forever use different converters.
        foreach ($attribute in $doc.SelectNodes("//@BeginTime | //@Duration | //@KeyTime")) {
            $literal = $attribute.Value.Trim()
            if ($literal -notmatch '^-?\d+[.:]\d+:') { continue }
            $time = [TimeSpan]::Zero
            if (-not [TimeSpan]::TryParse($literal, [Globalization.CultureInfo]::InvariantCulture, [ref]$time)) {
                $errors.Add("${where}: invalid $($attribute.Name)='$literal'. WPF cannot load this animation.") | Out-Null
            }
        }
        foreach ($node in $doc.SelectNodes("//*[local-name()='Style.Triggers']//*[@*[local-name()='Storyboard.TargetProperty']]")) {
            $path = $node.GetAttribute("Storyboard.TargetProperty")
            if ($path -notmatch "\)\.\(" -or $node.GetAttribute("Storyboard.TargetName")) { continue }
            $errors.Add("${where}: a Style trigger animates '$path', which crashes Playnite when game details open (the transform is read-only while the page is built). Animate a plain property (Opacity, Margin, Height in a fixed-size host), or move the storyboard to the page's ControlTemplate.Triggers with an x:Name'd transform and Storyboard.TargetName (docs/themes/reference.md, Hard rules).") | Out-Null
        }
        foreach ($node in $doc.SelectNodes("//*[local-name()='ControlTemplate'][not(contains(@TargetType,'WindowBase'))]/*[local-name()='ControlTemplate.Triggers']/*[local-name()='EventTrigger'][contains(@RoutedEvent,'Loaded')]//*[@*[local-name()='Storyboard.TargetName']]")) {
            $target = $node.GetAttribute("Storyboard.TargetName")
            $errors.Add("${where}: ControlTemplate.Triggers has a Loaded EventTrigger targeting '$target', which crashes Playnite when a control using that template starts Collapsed (BroadcastLoadedEvent fires before ApplyTemplate builds the template's NameScope). Move the Loaded EventTrigger onto the target element's own Triggers inside the template visual tree.") | Out-Null
        }
    }
    return @($errors | Select-Object -Unique)
}

function Test-PathDataSyntax {
    <#
        Path data is parsed only when its template is built, so a malformed string passes the build and crashes Playnite when
        that page opens ("Unexpected token 'F1MM...'"). Catches the ways a pasted geometry breaks: no leading move command, or
        a command with no coordinates before the next letter. Z/z take no coordinates, and bindings and resources are skipped.
    #>
    param([Parameter(Mandatory = $true)] [string]$Directory, [string]$SourceRoot)

    $errors = [System.Collections.Generic.List[string]]::new()
    foreach ($entry in Get-CachedThemeXamlEntries -Directory $Directory) {
        $doc = $entry.Doc
        if (-not $doc) { continue }
        $where = Get-SourceDisplayPath -SourceRoot $SourceRoot -Relative $entry.Relative
        foreach ($node in $doc.SelectNodes("//@Data | //@Geometry | //@Figures | //*[local-name()='Geometry']/text() | //*[local-name()='Setter'][@Property='Data']/@Value")) {
            $data = "$($node.Value)".Trim()
            if (-not $data -or $data.StartsWith("{")) { continue }
            $body = $data -replace "^[Ff]\s*[01]\s*", ""
            $problem = $null
            if ($body -notmatch "^[Mm]") { $problem = "it must start with a move (M) command" }
            elseif ($body -match "[MmLlHhVvCcQqSsTtAa]\s*[A-Za-z]") { $problem = "'$($Matches[0])' is a command with no coordinates" }
            if ($problem) {
                $shown = $data.Substring(0, [Math]::Min(32, $data.Length))
                $errors.Add("${where}: path data '$shown...' is malformed: $problem. It passes the build but crashes Playnite when this page opens.") | Out-Null
            }
        }
    }
    return @($errors | Select-Object -Unique)
}

function Test-PlayniteListBoxTriggers {
    <#
        Playnite's list dropdowns (ComboBoxList, Filter*SelectionBox, DdItemListSelectionBox) are not ComboBoxes: they have no
        IsDropDownOpen. A template trigger on it parses, then Playnite crashes on startup while sealing the theme
        ("Property can not be null on Trigger"; hit Medallion, NightCity, Overworld). Trigger on the toggle instead:
        <Trigger SourceName="PART_ToggleDropDown" Property="IsChecked" Value="True">.
    #>
    param([Parameter(Mandatory = $true)] [string]$Directory, [string]$SourceRoot)

    $errors = [System.Collections.Generic.List[string]]::new()
    foreach ($entry in Get-CachedThemeXamlEntries -Directory $Directory) {
        $doc = $entry.Doc
        if (-not $doc) { continue }
        $where = Get-SourceDisplayPath -SourceRoot $SourceRoot -Relative $entry.Relative
        foreach ($template in $doc.SelectNodes("//*[local-name()='ControlTemplate'][@TargetType]")) {
            if ($template.GetAttribute('TargetType') -notmatch '(ComboBoxList|SelectionBox)\b') { continue }
            foreach ($trigger in $template.SelectNodes("*[local-name()='ControlTemplate.Triggers']//*[(local-name()='Trigger' or local-name()='Condition') and @Property='IsDropDownOpen' and not(@SourceName)]")) {
                $errors.Add("${where}: a $($template.GetAttribute('TargetType')) template triggers on IsDropDownOpen, which that Playnite control does not have; Playnite crashes on startup. Use SourceName=`"PART_ToggleDropDown`" Property=`"IsChecked`".") | Out-Null
            }
        }
    }
    return @($errors | Select-Object -Unique)
}

function Test-FormControlHeight {
    <#
        src/themes/AGENTS.md "Form field height": every form field and button is the same height in every theme, ControlHeight (32).
        Text boxes, dropdowns, Playnite's list dropdowns, date pickers, number and path boxes and buttons line up on one row.
        A padding applied twice (on PART_ContentHost or the Border around it) makes text boxes taller than their neighbours.
    #>
    param([Parameter(Mandatory = $true)] [string]$Directory, [string]$SourceRoot)

    $errors = [System.Collections.Generic.List[string]]::new()
    $value = "{DynamicResource ControlHeight}"
    $read = {
        param($relative)
        $path = Join-Path $Directory $relative
        if (Test-Path $path) { Read-XamlDocument $path } else { $null }
    }
    $common = & $read "Common.xaml"
    $height = if ($common) { $common.SelectSingleNode("//*[@*[local-name()='Key']='ControlHeight']") } else { $null }
    if (-not $height -or $height.InnerText.Trim() -ne "32") {
        $errors.Add("Common.xaml: ControlHeight must be 32, the shared form field height (src/themes/AGENTS.md Form field height).") | Out-Null
    }
    foreach ($item in @(@("DefaultControls/TextBox.xaml", "TextBox"), @("DefaultControls/PasswordBox.xaml", "PasswordBox"), @("DefaultControls/ComboBox.xaml", "ComboBox"), @("DefaultControls/Button.xaml", "Button"))) {
        $doc = & $read $item[0]
        $where = Get-SourceDisplayPath -SourceRoot $SourceRoot -Relative $item[0]
        if (-not $doc) { $errors.Add("${where}: missing; every theme restyles $($item[1]) so it can take ControlHeight (src/themes/AGENTS.md Form field height).") | Out-Null; continue }
        $style = $null
        foreach ($candidate in $doc.SelectNodes("//*[local-name()='Style']")) {
            if ($candidate.GetAttribute("TargetType") -match "^(\{x:Type $($item[1])\}|$($item[1]))$" -and -not $candidate.GetAttribute("Key", "http://schemas.microsoft.com/winfx/2006/xaml")) { $style = $candidate; break }
        }
        if (-not $style) { continue }
        if (-not $style.SelectSingleNode(".//*[local-name()='Setter'][@Property='MinHeight' and @Value='$value']")) {
            $errors.Add("${where}: the base $($item[1]) style needs MinHeight = ControlHeight, so it matches the other fields (src/themes/AGENTS.md Form field height).") | Out-Null
        }
        foreach ($setter in $style.SelectNodes("./*[local-name()='Setter'][(@Property='MinHeight' or @Property='Height') and @Value!='$value']")) {
            $errors.Add("${where}: the base $($item[1]) style sets $($setter.GetAttribute('Property')) to $($setter.GetAttribute('Value')); use ControlHeight only (src/themes/AGENTS.md Form field height).") | Out-Null
        }
        $host_ = $style.SelectSingleNode(".//*[@*[local-name()='Name']='PART_ContentHost']")
        if ($host_) {
            $parent = $host_.ParentNode
            if ($host_.GetAttribute("Margin") -match "TemplateBinding Padding" -or $parent.GetAttribute("Padding") -match "TemplateBinding Padding") {
                $errors.Add("${where}: Padding is applied twice. WPF already applies it to PART_ContentHost, so remove it from the host's Margin and from the Border around it (src/themes/AGENTS.md Form field height).") | Out-Null
            }
        }
    }
    foreach ($relative in "CustomControls/ComboBoxList.xaml", "CustomControls/FilterSelectionBox.xaml", "CustomControls/NumericBoxes.xaml", "CustomControls/PathSelectionBox.xaml", "DefaultControls/DatePicker.xaml") {
        $path = Join-Path $Directory $relative
        $entry = if (Test-Path $path) { Get-CachedXamlEntry -Path $path } else { $null }
        if (-not $entry -or -not ($entry.Raw -match "ControlHeight")) {
            $where = Get-SourceDisplayPath -SourceRoot $SourceRoot -Relative $relative
            $errors.Add("${where}: must set ControlHeight on Playnite's control (it defaults to 24). scripts/templates/theme-defaults supplies this file unless overridden (src/themes/AGENTS.md Form field height).") | Out-Null
        }
    }
    return @($errors | Select-Object -Unique)
}

function Test-TabItemColors {
    <#
        AGENTS.md "Tab colours": the game edit dialog's labels are TextBlocks with no colour, so they inherit the selected
        TabItem's Foreground, and its tab headers bind Foreground to an ancestor TextBlock. A selected tab that recolours
        itself therefore recolours the whole page (dark text for a bright plate made Backbeat's labels unreadable), and a
        header with no TextBlock around it renders black.
    #>
    param([Parameter(Mandatory = $true)] [string]$Directory, [string]$SourceRoot)

    $errors = [System.Collections.Generic.List[string]]::new()
    $relative = "DefaultControls/TabControl.xaml"
    $path = Join-Path $Directory $relative
    if (-not (Test-Path $path)) { return @() }
    $doc = Read-XamlDocument $path
    if (-not $doc) { return @() }
    $where = Get-SourceDisplayPath -SourceRoot $SourceRoot -Relative $relative
    $style = $null
    foreach ($candidate in $doc.SelectNodes("//*[local-name()='Style']")) {
        if ($candidate.GetAttribute("TargetType") -match "^(\{x:Type TabItem\}|TabItem)$" -and -not $candidate.GetAttribute("Key", "http://schemas.microsoft.com/winfx/2006/xaml")) { $style = $candidate; break }
    }
    if (-not $style) { return @() }

    $normal = "{DynamicResource TextBrush}"
    $selectedSetsIt = $false
    foreach ($setter in $style.SelectNodes(".//*[contains(local-name(), 'Triggers')]//*[local-name()='Setter'][@Property='Foreground' and not(@TargetName)]")) {
        $trigger = $setter.ParentNode
        if ($trigger.LocalName -eq "MultiTrigger.Setters") { $trigger = $trigger.ParentNode }
        $unselected = ($trigger.GetAttribute("Property") -eq "IsSelected" -and $trigger.GetAttribute("Value") -eq "False") -or
            $trigger.SelectSingleNode(".//*[local-name()='Condition'][@Property='IsSelected' and @Value='False']")
        if ($unselected) { continue }
        if ($trigger.GetAttribute("Property") -eq "IsSelected") { $selectedSetsIt = $true }
        if ($setter.GetAttribute("Value") -ne $normal) {
            $errors.Add("${where}: a TabItem trigger sets the tab's own Foreground to $($setter.GetAttribute('Value')). The tab page inherits it, so labels in the game edit dialog change colour. Set it on the header TextBlock with TargetName (AGENTS.md Tab colours).") | Out-Null
        }
    }
    if (-not $selectedSetsIt) {
        $base = $style.SelectSingleNode("./*[local-name()='Setter'][@Property='Foreground']")
        if ($base -and $base.GetAttribute("Value") -ne $normal) {
            $errors.Add("${where}: the TabItem style's Foreground is $($base.GetAttribute('Value')), but the selected tab's page inherits it. Keep TextBrush on the TabItem and put the header colour on its TextBlock (AGENTS.md Tab colours).") | Out-Null
        }
    }
    $presenter = $style.SelectSingleNode(".//*[local-name()='ContentPresenter'][@ContentSource='Header']")
    if ($presenter -and -not $presenter.SelectSingleNode("ancestor::*[local-name()='TextBlock']")) {
        $errors.Add("${where}: the tab header ContentPresenter needs a TextBlock around it. The game edit dialog binds its header colour to an ancestor TextBlock, and without one the text is black (AGENTS.md Tab colours).") | Out-Null
    }
    return @($errors | Select-Object -Unique)
}

function Test-SettingsChrome {
    <#
        AGENTS.md "Settings screen": every theme restyles the two parts that carry the Settings window's identity.
        DefaultControls/TreeView.xaml: the section list, full-width plates with separate hover and selected states and a
        fixed width in the Settings and Add-ons windows. DerivedStyles/StandardWindowStyle.xaml: the title band, with the
        caption height equal to the content offset and Playnite's PART_ names kept. Missing files, missing hover or
        selected triggers and a wrong content offset are errors; width, row height (28-32px, body font), band height (>= 36px)
        and the two-part selected mark come back as advisories when -Advisory is set.
    #>
    param([Parameter(Mandatory = $true)] [string]$Directory, [string]$SourceRoot, [switch]$Advisory)

    $errors = [System.Collections.Generic.List[string]]::new()
    $notes = [System.Collections.Generic.List[string]]::new()
    $xamlNs = "http://schemas.microsoft.com/winfx/2006/xaml"

    $treeRel = "DefaultControls/TreeView.xaml"
    $treePath = Join-Path $Directory $treeRel
    $treeWhere = Get-SourceDisplayPath -SourceRoot $SourceRoot -Relative $treeRel
    if (-not (Test-Path $treePath)) {
        $errors.Add("${treeWhere}: missing. The Settings section list must be restyled (full-width plates, hover and selected states, fixed width in the Settings window): docs/themes/settings-screens.md.") | Out-Null
    }
    else {
        $doc = Read-XamlDocument $treePath
        if ($doc) {
            $itemStyle = $null
            foreach ($candidate in $doc.SelectNodes("//*[local-name()='Style']")) {
                if ($candidate.GetAttribute("TargetType") -match "TreeViewItem" -and -not $candidate.GetAttribute("Key", $xamlNs)) { $itemStyle = $candidate; break }
            }
            if (-not $itemStyle) {
                $errors.Add("${treeWhere}: no TreeViewItem style.") | Out-Null
            }
            else {
                $hover = $itemStyle.SelectSingleNode(".//*[local-name()='Trigger'][@Property='IsMouseOver']")
                $selected = $itemStyle.SelectSingleNode(".//*[local-name()='Trigger'][@Property='IsSelected' and @Value='True']")
                if (-not $hover) { $errors.Add("${treeWhere}: the TreeViewItem template has no IsMouseOver trigger, so rows give no hover cue.") | Out-Null }
                if (-not $selected) { $errors.Add("${treeWhere}: the TreeViewItem template has no IsSelected trigger, so the current section is not marked.") | Out-Null }
                if ($selected -and $hover) {
                    $cueNames = @($selected.SelectNodes("./*[local-name()='Setter'][@TargetName]") | ForEach-Object { $_.GetAttribute("TargetName") }) + @($selected.SelectNodes(".//*[@*[local-name()='Storyboard.TargetName']]") | ForEach-Object { $_.GetAttribute("Storyboard.TargetName") })
                    $cues = @($cueNames | Where-Object { $_ } | Select-Object -Unique).Count
                    if ($cues -lt 2) { $notes.Add("settings chrome: $treeWhere the IsSelected trigger changes fewer than 2 named parts. Mark the current row with a plate plus a bar, notch or glyph, not a text colour alone.") | Out-Null }
                }
                $minHeights = @($itemStyle.SelectNodes(".//@MinHeight") | ForEach-Object { $n = 0.0; if ([double]::TryParse($_.Value, [System.Globalization.NumberStyles]::Float, [System.Globalization.CultureInfo]::InvariantCulture, [ref]$n)) { $n } })
                if ($minHeights.Count -gt 0 -and ($minHeights | Where-Object { $_ -ge 28 -and $_ -le 32 }).Count -eq 0) {
                    $notes.Add("settings chrome: $treeWhere rows are not 28-32px (MinHeight on the row grid). Settings rows are 28-32px plates in the body font.") | Out-Null
                }
                if (($itemStyle.SelectNodes(".//@Typography.Capitals") | Measure-Object).Count -gt 0 -or $itemStyle.OuterXml -match "HeadingFontFamily") {
                    $notes.Add("settings chrome: $treeWhere row labels use the heading face or small caps. Use the normal body font.") | Out-Null
                }
            }
            $widthOk = $false
            foreach ($trigger in $doc.SelectNodes("//*[local-name()='DataTrigger'][@Value='WindowSettings']")) {
                foreach ($setter in $trigger.SelectNodes("./*[local-name()='Setter'][@Property='Width']")) {
                    $n = 0.0
                    if ([double]::TryParse($setter.GetAttribute("Value"), [System.Globalization.NumberStyles]::Float, [System.Globalization.CultureInfo]::InvariantCulture, [ref]$n) -and $n -ge 220) { $widthOk = $true }
                }
            }
            $expander = $doc.SelectSingleNode("//*[@*[local-name()='Name' and namespace-uri()='$xamlNs' and .='Expander']]")
            if ($expander -and -not $expander.GetAttribute("Width")) {
                $errors.Add("${treeWhere}: the Expander ToggleButton has no Width. In a fixed-width tree an unsized glyph Viewbox scales to fill the row (giant arrows, no labels); give it a width of 14-16.") | Out-Null
            }
            $laneOk = $false
            foreach ($trigger in $doc.SelectNodes("//*[local-name()='DataTrigger'][@Value='WindowSettings' or @Value='WindowExtensions']")) {
                if ($trigger.SelectSingleNode("./*[local-name()='Setter'][@Property='ScrollViewer.VerticalScrollBarVisibility' and @Value='Visible']")) { $laneOk = $true }
            }
            if ($widthOk -and -not $laneOk) {
                $notes.Add("settings chrome: $treeWhere the WindowSettings / WindowExtensions triggers do not set ScrollViewer.VerticalScrollBarVisibility to Visible. With Auto, expanding a node past the window height makes the scroll bar appear and the window reflows; reserve the lane.") | Out-Null
            }
            if (-not $widthOk) {
                $notes.Add("settings chrome: $treeWhere has no DataTrigger on the ancestor Window's AutomationId 'WindowSettings' that sets the tree Width (>= 220). Without it the Settings section list sizes to its longest label.") | Out-Null
            }
        }
    }

    $winRel = "DerivedStyles/StandardWindowStyle.xaml"
    $winPath = Join-Path $Directory $winRel
    $winWhere = Get-SourceDisplayPath -SourceRoot $SourceRoot -Relative $winRel
    if (-not (Test-Path $winPath)) {
        $errors.Add("${winWhere}: missing. Dialog windows (Settings, game editor, add-ons) need the theme's own title band: docs/themes/settings-screens.md.") | Out-Null
    }
    else {
        $doc = Read-XamlDocument $winPath
        if ($doc) {
            foreach ($part in "PART_TextTitle", "PART_ButtonMinimize", "PART_ButtonMaximize", "PART_ButtonClose") {
                if (-not $doc.SelectSingleNode("//*[@*[local-name()='Name' and namespace-uri()='$xamlNs' and .='$part']]")) {
                    $errors.Add("${winWhere}: missing $part. Playnite binds the dialog's title and caption buttons by these names.") | Out-Null
                }
            }
            # Playnite switches PART_TextTitle to Visible once a window has a Title (ThemeModifier Settings, Settings): a hidden copy that is only
            # Collapsed itself then draws bare default text over the band's top-left corner. Hide it through a Collapsed parent.
            $titleNode = $doc.SelectSingleNode("//*[@*[local-name()='Name' and namespace-uri()='$xamlNs' and .='PART_TextTitle']]")
            if ($titleNode -and $titleNode.GetAttribute("Visibility") -match "Collapsed|Hidden" -and -not $titleNode.SelectSingleNode("ancestor::*[@Visibility='Collapsed']")) {
                $errors.Add("${winWhere}: PART_TextTitle is hidden only by its own Visibility. Playnite makes it visible again and it draws unstyled text over the title band; put it in a parent with Visibility=Collapsed (docs/themes/settings-screens.md, Title band).") | Out-Null
            }
            $chrome = $doc.SelectSingleNode("//*[local-name()='WindowChrome' and @CaptionHeight]")
            if ($chrome) {
                $caption = 0.0
                [void][double]::TryParse($chrome.GetAttribute("CaptionHeight"), [System.Globalization.NumberStyles]::Float, [System.Globalization.CultureInfo]::InvariantCulture, [ref]$caption)
                if ($caption -lt 36) { $notes.Add("settings chrome: $winWhere title band is $caption px; use 36-48 so the band can carry the theme's motif.") | Out-Null }
                $offset = $doc.SelectSingleNode("//*[local-name()='ContentPresenter' and @Margin and not(@ContentSource)]")
                if ($offset) {
                    $top = ($offset.GetAttribute("Margin") -split ",")
                    $topValue = 0.0
                    if ($top.Count -ge 2 -and [double]::TryParse($top[1].Trim(), [System.Globalization.NumberStyles]::Float, [System.Globalization.CultureInfo]::InvariantCulture, [ref]$topValue) -and ($topValue -lt ($caption - 0.5) -or $topValue -gt ($caption + 8))) {
                        $errors.Add("${winWhere}: content offset ($topValue) is not within 0-8px below WindowChrome CaptionHeight ($caption); the dialog body would overlap the band or leave a gap under it.") | Out-Null
                    }
                }
            }
        }
    }

    if ($Advisory) { return @($notes) }
    return @($errors | Select-Object -Unique)
}

function Test-TileButtonHitArea {
    <#
        AGENTS.md "Whole-button hit area": a Button template whose root has no Background only reacts over the glyph
        (hit testing ignores empty space), so the cover hover buttons light up only on their icon. The root of the
        GridTileButton template needs Background="Transparent" (or a brush).
    #>
    param([Parameter(Mandatory = $true)] [string]$Directory, [string]$SourceRoot)

    $relative = "DerivedStyles/GridViewItemTemplate.xaml"
    $path = Join-Path $Directory $relative
    if (-not (Test-Path $path)) { return @() }
    $doc = Read-XamlDocument $path
    if (-not $doc) { return @() }
    $where = Get-SourceDisplayPath -SourceRoot $SourceRoot -Relative $relative
    $xamlNs = "http://schemas.microsoft.com/winfx/2006/xaml"
    foreach ($style in $doc.SelectNodes("//*[local-name()='Style']")) {
        if ($style.GetAttribute("Key", $xamlNs) -ne "GridTileButton") { continue }
        $template = $style.SelectSingleNode(".//*[local-name()='ControlTemplate']")
        if (-not $template) { return @() }
        $root = $template.SelectSingleNode("./*[1]")
        if ($root -and -not $root.GetAttribute("Background")) {
            return @("${where}: the GridTileButton template's root ($($root.LocalName)) has no Background, so only the glyph is hoverable and clickable. Set Background=`"Transparent`" on it (AGENTS.md Whole-button hit area).")
        }
    }
    return @()
}

function Test-SidePanelCloseButton {
    <#
        src/themes/AGENTS.md "Side panel close button": the grid view's side panel close button (CloseGameSideBarCommand) is a
        28x28 plate in the panel's top-left corner, or left of the game icon when GameBannerHeight < 120 or the game background image setting is on.
        Both placements share the same template. It reads at rest (a plate, a rim, a bright glyph) and has a clear
        hover state (an IsMouseOver trigger). A bare glyph on the art, or a button under 28px, disappears into the banner.
    #>
    param([Parameter(Mandatory = $true)] [string]$Directory, [string]$SourceRoot)

    $relative = "Views/GridViewGameOverview.xaml"
    $path = Join-Path $Directory $relative
    if (-not (Test-Path $path)) { return @() }
    $doc = Read-XamlDocument $path
    if (-not $doc) { return @() }
    $where = Get-SourceDisplayPath -SourceRoot $SourceRoot -Relative $relative
    $button = $doc.SelectSingleNode("//*[local-name()='Button'][@*[local-name()='Name']='SidePanelCloseButton'][contains(@Command, 'CloseGameSideBarCommand')]")
    if (-not $button) {
        return @("${where}: no named SidePanelCloseButton bound to CloseGameSideBarCommand.")
    }
    $errors = [System.Collections.Generic.List[string]]::new()
    if ($button.GetAttribute("Width") -ne "28" -or $button.GetAttribute("Height") -ne "28") {
        $errors.Add("${where}: the close button is $($button.GetAttribute('Width'))x$($button.GetAttribute('Height')); it must be 28x28 (src/themes/AGENTS.md Side panel close button).") | Out-Null
    }
    if ($button.GetAttribute("HorizontalAlignment") -ne "Left" -or $button.GetAttribute("VerticalAlignment") -ne "Top") {
        $errors.Add("${where}: the close button must sit in the panel's top-left corner (HorizontalAlignment Left, VerticalAlignment Top).") | Out-Null
    }
    if (-not $button.SelectSingleNode(".//*[local-name()='Trigger'][@Property='IsMouseOver']")) {
        $errors.Add("${where}: the close button has no IsMouseOver trigger, so hovering it shows nothing.") | Out-Null
    }
    $inline = $doc.SelectSingleNode("//*[local-name()='Button'][@*[local-name()='Name']='InlineSidePanelCloseButton'][contains(@Command, 'CloseGameSideBarCommand')]")
    if (-not $inline -or $inline.GetAttribute('DockPanel.Dock') -ne 'Left' -or
        $inline.GetAttribute('VerticalAlignment') -ne 'Center' -or
        $inline.GetAttribute('Width') -ne '28' -or $inline.GetAttribute('Height') -ne '28' -or
        $inline.GetAttribute('Template') -ne '{Binding Template, ElementName=SidePanelCloseButton}') {
        $errors.Add("${where}: provide a 28x28 InlineSidePanelCloseButton left-docked beside the game icon, vertically centered and sharing SidePanelCloseButton.Template.") | Out-Null
    }
    if ($inline) {
        $scroll = $inline.SelectSingleNode("ancestor::*[local-name()='ScrollViewer'][1]")
        $transform = $inline.SelectSingleNode("./*[local-name()='Button.RenderTransform']/*[local-name()='TranslateTransform']")
        if (-not $scroll -or $scroll.GetAttribute('CanContentScroll') -ne 'False' -or -not $transform -or
            $transform.GetAttribute('Y') -ne '{Binding ContentVerticalOffset, ElementName=PART_ScrollViewHost}') {
            $errors.Add("${where}: pin the inline close using the physical content offset of PART_ScrollViewHost.") | Out-Null
        }
    }
    $styleRoot = "./*[local-name()='Button.Style']/*[local-name()='Style']"
    $visibilitySetter = $button.SelectSingleNode("$styleRoot/*[local-name()='Setter'][@Property='Visibility']")
    $emptyTrigger = $button.SelectSingleNode("$styleRoot/*[local-name()='Style.Triggers']/*[local-name()='DataTrigger'][contains(@Binding, 'Game') and contains(@Binding, 'FallbackValue={x:Null}')][@Value='{x:Null}']/*[local-name()='Setter'][@Property='Visibility' and @Value='Visible']")
    if ($button.HasAttribute('Visibility') -or -not $emptyTrigger) {
        $errors.Add("${where}: the corner close must stay visible for Game=null and null DataContext, independent of banner height. Put its normal visibility binding in a style setter so the empty-state trigger can override it.") | Out-Null
    }
    if ($button.GetAttribute('Tag') -ne '{DynamicResource GameBannerHeight}' -or -not $visibilitySetter -or
        $visibilitySetter.GetAttribute('Value') -notmatch 'x\s*<\s*120\s*\?\s*`Collapsed`\s*:\s*`Visible`') {
        $errors.Add("${where}: use configured GameBannerHeight to show only the inline close below 120px and only the corner close at 120px and above.") | Out-Null
    }
    # While "Use game background image as window background" is on, the banner is collapsed, so the close stays inline at any banner height.
    $inlineSetter = if ($inline) { $inline.SelectSingleNode("$styleRoot/*[local-name()='Setter'][@Property='Visibility']") }
    $inlineBackgroundTrigger = if ($inline) { $inline.SelectSingleNode("$styleRoot/*[local-name()='Style.Triggers']/*[local-name()='DataTrigger'][@Binding='{Settings ShowBackgroundImageOnWindow}'][@Value='True']/*[local-name()='Setter'][@Property='Visibility' and @Value='Visible']") }
    $cornerBackgroundTrigger = $button.SelectSingleNode("$styleRoot/*[local-name()='Style.Triggers']/*[local-name()='DataTrigger'][@Binding='{Settings ShowBackgroundImageOnWindow}'][@Value='True']/*[local-name()='Setter'][@Property='Visibility' and @Value='Collapsed']")
    $triggers = @($button.SelectNodes("$styleRoot/*[local-name()='Style.Triggers']/*[local-name()='DataTrigger']"))
    $backgroundFirst = $cornerBackgroundTrigger -and $triggers.Count -gt 1 -and [object]::ReferenceEquals($triggers[0], $cornerBackgroundTrigger.ParentNode)
    if (-not $inline -or $inline.HasAttribute('Visibility') -or -not $inlineSetter -or
        $inlineSetter.GetAttribute('Value') -notmatch 'ElementName=SidePanelCloseButton' -or
        $inlineSetter.GetAttribute('Value') -notmatch 'x\s*<\s*120\s*\?\s*`Visible`\s*:\s*`Collapsed`') {
        $errors.Add("${where}: the inline close needs a style setter that shows it below 120px (bound to SidePanelCloseButton.Tag).") | Out-Null
    }
    if (-not $inlineBackgroundTrigger -or -not $backgroundFirst) {
        $errors.Add("${where}: with {Settings ShowBackgroundImageOnWindow} on, show the inline close and collapse the corner close at any banner height (the corner DataTrigger goes before the Game=null trigger so an empty view can still be closed).") | Out-Null
    }
    return @($errors)
}

function Test-WindowBackground {
    <#
        src/themes/AGENTS.md "Window background": Playnite's "Use game background image as window background" is the only way a
        theme shows game art behind the library. Library.xaml shows PART_ImageBackground at full strength (no Opacity,
        Visibility or Effect on it, no OpacityMask around it, no ScrimBrush/ArtTintBrush layer after it; a fade at its own bottom edge is fine):
        Playnite's darken and blur are the only treatment. With the setting off, GameBannerDarken (ThemeModifier) darkens the banner. Both game pages collapse the banner while the setting is on, so
        GameBannerHeight has no effect, and the Slider style disables ThemeModifier's banner height slider then.
    #>
    param([Parameter(Mandatory = $true)] [string]$Directory, [string]$SourceRoot)

    $errors = [System.Collections.Generic.List[string]]::new()
    $setting = '{Settings ShowBackgroundImageOnWindow}'
    $xamlNs = "http://schemas.microsoft.com/winfx/2006/xaml"

    $relative = "Views/Library.xaml"
    $path = Join-Path $Directory $relative
    if (Test-Path $path) {
        $doc = Read-XamlDocument $path
        $where = Get-SourceDisplayPath -SourceRoot $SourceRoot -Relative $relative
        $image = if ($doc) { $doc.SelectSingleNode("//*[local-name()='FadeImage'][@*[local-name()='Name']='PART_ImageBackground']") }
        if ($image) {
            foreach ($attribute in @('Opacity', 'Visibility')) {
                if ($image.GetAttribute($attribute)) {
                    $errors.Add("${where}: PART_ImageBackground sets $attribute. Show the window art at full strength; Playnite's darken and blur settings are the only treatment (src/themes/AGENTS.md Window background).") | Out-Null
                }
            }
            if ($image.SelectSingleNode("./*[local-name()='FadeImage.Effect']")) {
                $errors.Add("${where}: PART_ImageBackground has an Effect. Playnite's blur setting blurs the window art; drop the theme's own (src/themes/AGENTS.md Window background).") | Out-Null
            }
            $ancestor = $image.ParentNode
            while ($ancestor -and $ancestor.LocalName -ne 'ControlTemplate') {
                if ($ancestor.SelectSingleNode("./*[local-name()='$($ancestor.LocalName).OpacityMask']")) {
                    $errors.Add("${where}: PART_ImageBackground sits inside an OpacityMask ($($ancestor.LocalName)). Show the whole art; no fades or feathering (src/themes/AGENTS.md Window background).") | Out-Null
                    break
                }
                $ancestor = $ancestor.ParentNode
            }
            $sibling = $image.NextSibling
            while ($sibling) {
                if ($sibling.NodeType -eq 'Element' -and $sibling.OuterXml -match '\{DynamicResource (ScrimBrush|ArtTintBrush)\}' -and $sibling.LocalName -notin @('TopPanel', 'DockPanel')) {
                    $errors.Add("${where}: a $($sibling.LocalName) in $($Matches[1]) covers PART_ImageBackground. No theme scrim or tint over the window art: Playnite's darken setting is the tint (src/themes/AGENTS.md Window background).") | Out-Null
                    break
                }
                $sibling = $sibling.NextSibling
            }
        }
    }

    foreach ($view in @('DetailsViewGameOverview', 'GridViewGameOverview')) {
        $relative = "Views/$view.xaml"
        $path = Join-Path $Directory $relative
        if (-not (Test-Path $path)) { continue }
        $doc = Read-XamlDocument $path
        if (-not $doc) { continue }
        $where = Get-SourceDisplayPath -SourceRoot $SourceRoot -Relative $relative
        $prefix = if ($view -eq 'DetailsViewGameOverview') { 'Details' } else { 'Grid' }
        $placementColumn = $doc.SelectSingleNode("//*[@*[local-name()='Name']='${prefix}MetadataColumn']")
        $placementMain = $doc.SelectSingleNode("//*[@*[local-name()='Name']='${prefix}MainColumn']")
        $placementBody = if ($placementColumn) { $placementColumn.ParentNode } else { $null }
        $bodyColumns = if ($placementBody) { @($placementBody.SelectNodes("./*[local-name()='Grid.ColumnDefinitions']/*")).Count } else { 0 }
        $hasStretchPlacement = $placementColumn -and $placementColumn.SelectSingleNode(".//*[local-name()='DataTrigger'][@Value='Stretch']")
        $groupsHost = $doc.SelectSingleNode("//*[@*[local-name()='Name']='${prefix}MetadataGroups']")
        $hasFlatStretchItems = $groupsHost -and $groupsHost.SelectSingleNode("./*[@*[local-name()='Name' and starts-with(.,'PART_Elem')]]") -and $groupsHost.SelectSingleNode("./*[@*[local-name()='Name']='MetaProgress']//*[local-name()='DataTrigger'][@Value='Center']") -and $groupsHost.SelectSingleNode("./*[@*[local-name()='Name']='MetaProgress']//*[local-name()='DataTrigger'][@Value='Stretch']")
        if (-not $placementColumn -or -not $placementMain -or $placementMain.ParentNode -ne $placementBody -or $placementColumn.GetAttribute('Tag') -ne '{DynamicResource GameDetailsPanePosition}' -or $bodyColumns -ne 3 -or -not $hasStretchPlacement -or -not $hasFlatStretchItems) {
            $errors.Add("${where}: the metadata pane cannot move (Left / Center / Stretch / Right) or lacks flat Stretch item-grid flow. ${prefix}MetadataColumn needs Tag=`"{DynamicResource GameDetailsPanePosition}`" with Stretch item-grid layout in a three-column body grid; run node scripts/game-page-breakpoints.mjs on the file (src/themes/AGENTS.md Game page).") | Out-Null
        }
        $banners = @($doc.SelectNodes("//*[@Height='{DynamicResource GameBannerHeight}' or @MaxHeight='{DynamicResource GameBannerHeight}']"))
        if ($banners.Count -gt 0 -and -not $doc.SelectSingleNode("//*[@Opacity='0.5' and @Tag='{DynamicResource GameBannerDarken}']")) {
            $errors.Add("${where}: no banner darkening floor. After the darkening layer add the same brush at Opacity=`"0.5`" with Tag=`"{DynamicResource GameBannerDarken}`", collapsed by a DataTrigger on Tag = 0, so any value above 0 starts at 50% (src/themes/AGENTS.md Window background).") | Out-Null
        }
        if ($banners.Count -gt 0 -and -not $doc.SelectSingleNode("//*[@Opacity='{DynamicResource GameBannerDarken}']")) {
            $errors.Add("${where}: no banner darkening layer. Add <Rectangle Fill=`"{DynamicResource GameBannerTintBrush}`" Opacity=`"{DynamicResource GameBannerDarken}`" IsHitTestVisible=`"False`" /> right after the banner's PART_ImageBackground (src/themes/AGENTS.md Window background).") | Out-Null
        }
        foreach ($banner in $banners) {
            $name = $banner.GetAttribute("Name", $xamlNs)
            $collapses = $banner.SelectSingleNode("./*[local-name()='$($banner.LocalName).Style']//*[local-name()='DataTrigger'][@Binding='$setting' and @Value='True']/*[local-name()='Setter'][@Property='Visibility' and @Value='Collapsed']")
            if (-not $collapses) {
                $label = if ($name) { $name } else { $banner.LocalName }
                $errors.Add("${where}: the banner ($label, GameBannerHeight) does not collapse while Playnite draws the game art behind the window. Add a DataTrigger Binding=`"$setting`" Value=`"True`" setting Visibility Collapsed to its Style (src/themes/AGENTS.md Window background).") | Out-Null
            }
        }
    }

    $relative = "DefaultControls/Slider.xaml"
    $path = Join-Path $Directory $relative
    if (Test-Path $path) {
        $doc = Read-XamlDocument $path
        $where = Get-SourceDisplayPath -SourceRoot $SourceRoot -Relative $relative
        foreach ($key in @('GameBannerHeight', 'GameBannerDarken')) {
            $ok = $false
            if ($doc) {
                foreach ($trigger in $doc.SelectNodes("//*[local-name()='Style'][@TargetType='{x:Type Slider}']/*[local-name()='Style.Triggers']/*[local-name()='MultiDataTrigger']")) {
                    $xml = $trigger.OuterXml
                    if ($xml -match 'Children\[0\]\.Tag' -and $xml -match "Value=`"$key`"" -and $xml.Contains($setting) -and
                        $trigger.SelectSingleNode("./*[local-name()='Setter'][@Property='IsEnabled' and @Value='False']")) { $ok = $true }
                }
            }
            if (-not $ok) {
                $errors.Add("${where}: the Slider style does not disable ThemeModifier's $key slider while Playnite's window background is on (MultiDataTrigger: Children[0].Tag of the ancestor Grid = $key and $setting = True -> IsEnabled False, Opacity 0.4; src/themes/AGENTS.md Window background).") | Out-Null
            }
        }
    }

    # The art runs under the whole window: a rail, a track or a header plate that is a solid brush turns see-through while it is on.
    $rail = Join-Path $Directory "Views/Sidebar.xaml"
    if (Test-Path $rail) {
        $text = (Get-CachedXamlEntry -Path $rail).Raw
        if ($text -match '<(Grid|Border)\b[^>]*\bBackground="\{DynamicResource (ShellBackgroundBrush|TopPanelBackgroundBrush)\}"' -and -not $text.Contains($setting)) {
            $where = Get-SourceDisplayPath -SourceRoot $SourceRoot -Relative "Views/Sidebar.xaml"
            $errors.Add("${where}: the rail keeps a solid background while Playnite's window background is on. Add a DataTrigger Binding=`"$setting`" Value=`"True`" to the Sidebar template setting that fill's Background Transparent, so the art shows under the rail (src/themes/AGENTS.md Window background).") | Out-Null
        }
    }
    $scroll = Join-Path $Directory "DefaultControls/ScrollViewer.xaml"
    if (Test-Path $scroll) {
        $text = (Get-CachedXamlEntry -Path $scroll).Raw
        if ($text -match '<(Border|Rectangle)\b[^>]*ScrollBarTrackBrush' -and -not $text.Contains($setting)) {
            $where = Get-SourceDisplayPath -SourceRoot $SourceRoot -Relative "DefaultControls/ScrollViewer.xaml"
            $errors.Add("${where}: the scroll bar track stays opaque while Playnite's window background is on. Name the track fill and add a DataTrigger Binding=`"$setting`" Value=`"True`" in the ScrollBar template setting its Opacity to 0.4 (src/themes/AGENTS.md Window background).") | Out-Null
        }
    }
    $expander = Join-Path $Directory "DefaultControls/Expander.xaml"
    $where = Get-SourceDisplayPath -SourceRoot $SourceRoot -Relative "DefaultControls/Expander.xaml"
    if (-not (Test-Path $expander) -or -not ((Get-CachedXamlEntry -Path $expander).Raw).Contains($setting)) {
        $errors.Add("${where}: Expander headers keep their plate while Playnite's window background is on. Overlay the Expander style with a DataTrigger Binding=`"$setting`" Value=`"True`" setting Background Transparent (src/themes/AGENTS.md Window background).") | Out-Null
    }
    return @($errors)
}

function Test-RunningIndicator {
    <#
        docs/themes/reference.md "Running game indicator": the running or launching game carries a quiet, animated mark in
        the details list row, the cover tile, the list view row and over the game page's Play / context action cell. Each
        template has a non-hit-testable element named RunningIndicator, shown by DataTriggers on IsRunning and IsLaunching
        whose named storyboards are removed on exit (no clock left running), drawn with RunningIndicatorBrush, and never
        touched by the selected or hover triggers, so it stays visible on a selected row.
    #>
    param([Parameter(Mandatory = $true)] [string]$Directory, [string]$SourceRoot)

    $xamlNs = "http://schemas.microsoft.com/winfx/2006/xaml"
    $errors = [System.Collections.Generic.List[string]]::new()
    $targets = @(
        @{ File = "DerivedStyles/DetailsViewItemStyle.xaml"; Key = "DetailsViewItemStyle"; Target = $null },
        @{ File = "DerivedStyles/GridViewItemStyle.xaml"; Key = "GridViewItemStyle"; Target = $null },
        @{ File = "DefaultControls/ListView.xaml"; Key = $null; Target = "ListViewItem" },
        @{ File = "DerivedStyles/PlayButton.xaml"; Key = "RunningActionIndicator"; Target = $null }
    )
    foreach ($t in $targets) {
        $where = Get-SourceDisplayPath -SourceRoot $SourceRoot -Relative $t.File
        $path = Join-Path $Directory $t.File
        $doc = if (Test-Path $path) { Read-XamlDocument $path } else { $null }
        $style = $null
        if ($doc) {
            foreach ($candidate in $doc.SelectNodes("//*[local-name()='Style']")) {
                if ($t.Key -and $candidate.GetAttribute("Key", $xamlNs) -eq $t.Key) { $style = $candidate; break }
                if ($t.Target -and -not $candidate.GetAttribute("Key", $xamlNs) -and $candidate.GetAttribute("TargetType") -match "\b$($t.Target)\}") { $style = $candidate; break }
            }
        }
        $label = if ($t.Key) { $t.Key } else { "$($t.Target) style" }
        if (-not $style) {
            $errors.Add("${where}: no $label with a running game indicator (docs/themes/reference.md Running game indicator).") | Out-Null
            continue
        }
        $indicator = $style.SelectSingleNode(".//*[@*[local-name()='Name']='RunningIndicator']")
        if (-not $indicator) {
            $errors.Add("${where}: ${label} has no element named RunningIndicator.") | Out-Null
            continue
        }
        # The whole item is highlighted, not only the motif: a frame around it, and on rows and the action cell a tint.
        $frame = $indicator.SelectSingleNode(".//*[@*[local-name()='Name']='RunningFrame']")
        if (-not $frame) {
            $errors.Add("${where}: ${label}'s RunningIndicator has no RunningFrame (the running colour framing the whole row, cover or button, inside RunningIndicator).") | Out-Null
        }
        elseif ($frame.OuterXml -notmatch "(BorderBrush|Stroke|Foreground)=`"\{DynamicResource RunningIndicatorBrush\}`"") {
            $errors.Add("${where}: ${label}'s RunningFrame must draw its edge with {DynamicResource RunningIndicatorBrush}.") | Out-Null
        }
        if ($t.Key -ne "GridViewItemStyle" -and -not $indicator.SelectSingleNode(".//*[@*[local-name()='Name']='RunningWash']")) {
            $errors.Add("${where}: ${label}'s RunningIndicator has no RunningWash (the running colour tinting the whole row or button background).") | Out-Null
        }
        $hitOff = $indicator.GetAttribute("IsHitTestVisible") -eq "False" -or
            $style.SelectSingleNode("./*[local-name()='Setter'][@Property='IsHitTestVisible' and @Value='False']")
        if (-not $hitOff) {
            $errors.Add("${where}: ${label}'s RunningIndicator must set IsHitTestVisible=`"False`".") | Out-Null
        }
        if ($style.OuterXml -notmatch "\{DynamicResource RunningIndicatorBrush\}") {
            $errors.Add("${where}: ${label} never uses {DynamicResource RunningIndicatorBrush}.") | Out-Null
        }
        foreach ($state in @("IsRunning", "IsLaunching")) {
            $trigger = $style.SelectSingleNode(".//*[local-name()='DataTrigger'][@Binding='{Binding $state}' and @Value='True']")
            if (-not $trigger) {
                $errors.Add("${where}: ${label} has no DataTrigger on {Binding $state} = True.") | Out-Null
                continue
            }
            $begin = $trigger.SelectSingleNode(".//*[local-name()='DataTrigger.EnterActions']/*[local-name()='BeginStoryboard']")
            $name = if ($begin) { $begin.GetAttribute("Name") } else { "" }
            if (-not $name) {
                $errors.Add("${where}: ${label}'s $state trigger needs a named BeginStoryboard in EnterActions (the ambient motion).") | Out-Null
            }
            elseif (-not $trigger.SelectSingleNode(".//*[local-name()='DataTrigger.ExitActions']/*[local-name()='RemoveStoryboard'][@BeginStoryboardName='$name']")) {
                $errors.Add("${where}: ${label}'s $state trigger must remove storyboard '$name' in ExitActions, so no clock keeps running after the game stops.") | Out-Null
            }
        }
        # Launching is a smooth pulse or sweep, never a blink: stepped keyframes read as an error.
        $launch = $style.SelectSingleNode(".//*[local-name()='BeginStoryboard'][@Name='RunningIndicatorLaunching' or @*[local-name()='Name']='RunningIndicatorLaunching']")
        if ($launch -and $launch.SelectSingleNode(".//*[local-name()='DiscreteDoubleKeyFrame' or local-name()='DiscreteObjectKeyFrame']")) {
            $errors.Add("${where}: ${label}'s launching storyboard steps (Discrete keyframes). Launching is a smooth pulse (RunningIndicator Opacity 0.55 to 1, 0.8s, SineEase, AutoReverse) or a smooth sweep, never a blink.") | Out-Null
        }
        # Launching shows progress, not only a pulse: something sweeps, fills or travels (a gradient stop Offset, a ScaleX, a translate, a dash offset).
        # An opacity pulse of the whole layer is the old motion and reads as "something is on", not "something is loading".
        if ($launch) {
            $travel = @($launch.SelectNodes(".//*[@*[local-name()='Storyboard.TargetProperty']]") | Where-Object {
                    $prop = $_.GetAttribute("Storyboard.TargetProperty")
                    $prop -match '^(Offset|ScaleX|ScaleY|X|Y|Angle|StrokeDashOffset|Rect|Width|Height)$' -or $prop -match '\((TranslateTransform|ScaleTransform|RotateTransform|SkewTransform)\.'
                })
            if ($travel.Count -eq 0) {
                $errors.Add("${where}: ${label}'s launching storyboard only pulses opacity. Launching must show progress: sweep a RunningScan band (animate its mask's GradientStop Offset), fill a foot line (ScaleX) or move a mark. See docs/themes/running-motion.md.") | Out-Null
            }
        }
        # Selection and hover layers must not draw over the running layer (they hid it on selected items), except accents above the content.
        if ($t.Key -ne "RunningActionIndicator") {
            $named = @($style.SelectNodes(".//*[local-name()='ControlTemplate']//*[@*[local-name()='Name']] | .//*[local-name()='ControlTemplate']//*[local-name()='ContentPresenter' or local-name()='GridViewRowPresenter']"))
            $names = @($named | ForEach-Object { if ($_.LocalName -in 'ContentPresenter', 'GridViewRowPresenter') { '#presenter' } else { $n = $_.GetAttribute('Name', $xamlNs); if (-not $n) { $n = $_.GetAttribute('Name') }; $n } })
            $ri = [array]::IndexOf($names, 'RunningIndicator')
            $pi = [array]::IndexOf($names, '#presenter'); if ($pi -lt 0) { $pi = $names.Count }
            $stateTargets = @($style.SelectNodes(".//*[local-name()='Trigger'][@Property='IsSelected' or @Property='Selector.IsSelected' or @Property='IsMouseOver']//*[@TargetName]") | ForEach-Object { $_.GetAttribute('TargetName') } | Select-Object -Unique)
            foreach ($target in $stateTargets) {
                $ti = [array]::IndexOf($names, $target)
                if ($ri -ge 0 -and $ti -gt $ri -and $ti -lt $pi) {
                    $node = $named[$ti]; $inside = $false
                    while ($node) { if ($node -eq $named[$ri]) { $inside = $true; break }; $node = $node.ParentNode }
                    $holdsContent = $named[$ti].SelectSingleNode(".//*[local-name()='ContentPresenter' or local-name()='GridViewRowPresenter']")
                    if (-not $inside -and -not $holdsContent) { $errors.Add("${where}: ${label}'s selection/hover layer '$target' is drawn above RunningIndicator, so selecting the item hides the running frame. Move RunningIndicator after it (and inset the frame where both outline the same edge).") | Out-Null }
                }
            }
        }
        foreach ($setter in $style.SelectNodes(".//*[local-name()='Trigger'][@Property='IsSelected' or @Property='Selector.IsSelected' or @Property='IsMouseOver']/*[local-name()='Setter'][@TargetName='RunningIndicator']")) {
            $errors.Add("${where}: ${label}'s selected or hover trigger changes RunningIndicator; the mark must stay the same on a selected or hovered item.") | Out-Null
        }
    }
    # The RUNNING button's Cancel label follows the BUTTON's own pointer state. The button sits inside the game page's ControlTemplate, so a
    # TemplatedParent binding is the whole page's IsMouseOver: Cancel appeared with the pointer anywhere on the page (and a TemplatedParent
    # hover trigger on Play lit it the same way). RelativeSource Self is the button.
    $playPath = Join-Path $Directory "DerivedStyles/PlayButton.xaml"
    if (Test-Path $playPath) {
        $playEntry = Get-CachedXamlEntry -Path $playPath
        $playText = $playEntry.Raw
        $playWhere = Get-SourceDisplayPath -SourceRoot $SourceRoot -Relative "DerivedStyles/PlayButton.xaml"
        if ($playText -match 'Binding\s+IsMouseOver\s*,\s*RelativeSource=\{RelativeSource\s+TemplatedParent\}') {
            $errors.Add("${playWhere}: a pointer binding uses RelativeSource TemplatedParent, which is the whole game page's IsMouseOver (Cancel shows with the pointer anywhere on the page). Use {RelativeSource Self}.") | Out-Null
        }
        # The slab itself (not only the overlay) shows progress while launching: its launching trigger animates a sweep, fill or travelling mark.
        $playDoc = $playEntry.Doc
        $playStyle = if ($playDoc) { $playDoc.SelectSingleNode("//*[local-name()='Style'][@*[local-name()='Key']='PlayButton']") } else { $null }
        if ($playStyle) {
            $slabLaunch = $playStyle.SelectSingleNode(".//*[local-name()='ControlTemplate.Triggers']/*[local-name()='DataTrigger'][@Binding='{Binding IsLaunching}' and @Value='True']")
            $slabTravel = if ($slabLaunch) {
                @($slabLaunch.SelectNodes(".//*[@*[local-name()='Storyboard.TargetProperty']]") | Where-Object {
                        $prop = $_.GetAttribute("Storyboard.TargetProperty")
                        $prop -match '^(Offset|ScaleX|ScaleY|X|Y|Angle|StrokeDashOffset|Rect|Width|Height)$' -or $prop -match '\((TranslateTransform|ScaleTransform|RotateTransform|SkewTransform)\.'
                    })
            }
            else { @() }
            if (-not $slabLaunch) {
                $errors.Add("${playWhere}: PlayButton has no {Binding IsLaunching} DataTrigger in its ControlTemplate (the slab shows LAUNCHING with progress: a scan, fill or travelling mark in its own shape).") | Out-Null
            }
            elseif ($slabTravel.Count -eq 0) {
                $errors.Add("${playWhere}: PlayButton's launching trigger only pulses. Sweep a band across the slab's own shape (RunningScan), fill it, or move a mark; see docs/themes/running-motion.md.") | Out-Null
            }
            if ($slabLaunch -and -not $slabLaunch.SelectSingleNode(".//*[local-name()='DataTrigger.ExitActions']/*[local-name()='RemoveStoryboard']")) {
                $errors.Add("${playWhere}: PlayButton's launching trigger must remove its named storyboards in ExitActions.") | Out-Null
            }
        }
        if ($playText -match '(?s)<MultiDataTrigger>(?:(?!</MultiDataTrigger>).)*?TargetName="PlayContent"\s+Property="Visibility"\s+Value="Collapsed"') {
            $errors.Add("${playWhere}: the Cancel trigger collapses PlayContent, so the button shrinks to the Cancel text when the pointer arrives. Use Visibility=`"Hidden`" (the label keeps its size).") | Out-Null
        }
        if ($playText -match 'CancelLabel') {
            $cancelSetter = [regex]::Match($playText, '<MultiDataTrigger>(?:(?!</MultiDataTrigger>)[\s\S])*?TargetName="CancelLabel"(?:(?!</MultiDataTrigger>)[\s\S])*?</MultiDataTrigger>')
            if (-not $cancelSetter.Success -or $cancelSetter.Value -notmatch 'Binding\s+IsRunning\}' -or $cancelSetter.Value -notmatch 'Binding\s+IsMouseOver\s*,\s*RelativeSource=\{RelativeSource\s+Self\}' -or $cancelSetter.Value -notmatch 'TargetName="PlayContent"') {
                $errors.Add("${playWhere}: the Cancel label must be shown by one MultiDataTrigger on {Binding IsRunning} = True and {Binding IsMouseOver, RelativeSource={RelativeSource Self}} = True, which also hides PlayContent. It never shows while launching, idle or with the pointer elsewhere.") | Out-Null
            }
        }
    }
    foreach ($view in @("Views/DetailsViewGameOverview.xaml", "Views/GridViewGameOverview.xaml")) {
        $path = Join-Path $Directory $view
        if (-not (Test-Path $path)) { continue }
        $viewText = (Get-CachedXamlEntry -Path $path).Raw
        $ctxTag = [regex]::Match($viewText, '<Button\b[^>]*Name="PART_ButtonContextAction"[^>]*>')
        if ($ctxTag.Success -and ($ctxTag.Value -notmatch 'Style="\{DynamicResource PlayButton\}"' -or $ctxTag.Value -notmatch 'Tag="ContextAction"')) {
            $where = Get-SourceDisplayPath -SourceRoot $SourceRoot -Relative $view
            $errors.Add("${where}: PART_ButtonContextAction must use Style=`"{DynamicResource PlayButton}`" and Tag=`"ContextAction`", so the RUNNING / INSTALL button keeps Play's form (PlayButton hides its Play-only glyphs on that Tag).") | Out-Null
        }
        if ($viewText -notmatch "\{DynamicResource RunningActionIndicator\}") {
            $where = Get-SourceDisplayPath -SourceRoot $SourceRoot -Relative $view
            $errors.Add("${where}: no <Control Style=`"{DynamicResource RunningActionIndicator}`" /> over the Play / context action cell.") | Out-Null
        }
    }
    return @($errors | Select-Object -Unique)
}

function Test-FilterActiveIndicator {
    <#
        AGENTS.md "Active-state indicators": the top panel's filter toggle never prints a word ("Filter Active") when a
        filter applies. A small mark (dot, square, diamond, slant: the theme's own shape) filled with the notification
        accent DataChangeNotifBrush sits on the icon's top-right corner and is shown while Playnite sets the toggle's
        Tag to True.
    #>
    param([Parameter(Mandatory = $true)] [string]$Directory, [string]$SourceRoot)

    $relative = "Views/TopPanel.xaml"
    $path = Join-Path $Directory $relative
    if (-not (Test-Path $path)) { return @() }
    $doc = Read-XamlDocument $path
    if (-not $doc) { return @() }
    $where = Get-SourceDisplayPath -SourceRoot $SourceRoot -Relative $relative
    $xamlNs = "http://schemas.microsoft.com/winfx/2006/xaml"
    $style = $null
    foreach ($candidate in $doc.SelectNodes("//*[local-name()='Style']")) {
        if ($candidate.GetAttribute("Key", $xamlNs) -eq "TopPanelFilterToggle") { $style = $candidate; break }
    }
    if (-not $style) { return @() }
    $errors = [System.Collections.Generic.List[string]]::new()
    if ($style.OuterXml -match "LOCFilterActiveLabel") {
        $errors.Add("${where}: the filter toggle prints the 'Filter Active' label. Show a small mark in the top-right corner of the icon instead (AGENTS.md Active-state indicators).") | Out-Null
    }
    $mark = $style.SelectSingleNode(".//*[@Fill='{DynamicResource DataChangeNotifBrush}']")
    if (-not $mark) {
        $errors.Add("${where}: the filter toggle has no active mark filled with {DynamicResource DataChangeNotifBrush} (a dot, square or the theme's own shape on the icon's top-right corner, visible while Tag is True).") | Out-Null
    }
    elseif (-not $style.SelectSingleNode(".//*[local-name()='Trigger'][@Property='Tag' and @Value='{StaticResource True}']/*[local-name()='Setter'][@Property='Visibility' and @Value='Visible']")) {
        $errors.Add("${where}: nothing shows the filter mark while Tag is True (Trigger Property=Tag Value={StaticResource True} setting Visibility Visible on the mark).") | Out-Null
    }
    return @($errors)
}

# Themes whose menus still use the shared menu look. Each one gets an advisory instead of an error until its own menus
# land (docs/themes/menus.md); remove the key when they do. Never add a key: new themes ship their own menus from the
# start.
$script:MenuPending = @()

function Get-XamlKeyedElement {
    param([System.Xml.XmlDocument]$Doc, [string]$Key)
    foreach ($node in $Doc.SelectNodes("//*[@*[local-name()='Key']]")) {
        if ($node.GetAttribute("Key", $script:XamlNs) -eq $Key) { return $node }
    }
    return $null
}

function ConvertTo-NormalizedTemplateFingerprint {
    param([string]$Xml)
    if (-not $Xml) { return "" }
    return [regex]::Replace($Xml, "<!--.*?-->|\s+", "", "Singleline")
}

function Get-ThemeTemplateFingerprint {
    param(
        [System.Xml.XmlDocument]$Doc,
        [string]$Key,
        [switch]$StyleTemplate
    )
    if (-not $Doc) { return "" }
    $keyed = Get-XamlKeyedElement -Doc $Doc -Key $Key
    if (-not $keyed) { return "" }
    $target = if ($StyleTemplate) {
        $ct = $keyed.SelectSingleNode(".//*[local-name()='ControlTemplate']")
        if ($ct) { $ct } else { $keyed }
    }
    else {
        $keyed
    }
    return ConvertTo-NormalizedTemplateFingerprint -Xml $target.OuterXml
}

function Get-PeerThemeFingerprints {
    param(
        [Parameter(Mandatory = $true)]
        [string]$RelativeFile,
        [Parameter(Mandatory = $true)]
        [string]$Key,
        [switch]$StyleTemplate
    )

    $cacheSlot = "$RelativeFile|$Key|$([bool]$StyleTemplate)"
    $slotMap = $script:PeerTemplateFingerprintCache[$cacheSlot]
    if (-not $slotMap) {
        $slotMap = @{}
        $script:PeerTemplateFingerprintCache[$cacheSlot] = $slotMap
    }

    $results = [System.Collections.Generic.List[object]]::new()
    foreach ($other in Get-ChildItem -LiteralPath (Join-RepoPath "src/themes") -Directory) {
        $otherFile = Join-Path $other.FullName "src/$RelativeFile"
        if (-not (Test-Path -LiteralPath $otherFile)) { continue }
        $item = Get-Item -LiteralPath $otherFile
        $ticks = $item.LastWriteTimeUtc.Ticks
        $cached = $slotMap[$other.FullName]
        if (-not $cached -or $cached.Ticks -ne $ticks) {
            $doc = Read-XamlDocument $otherFile
            $fp = Get-ThemeTemplateFingerprint -Doc $doc -Key $Key -StyleTemplate:$StyleTemplate
            $cached = [pscustomobject]@{
                ThemeName   = $other.Name
                ThemeDir    = $other.FullName
                Ticks       = $ticks
                Fingerprint = $fp
            }
            $slotMap[$other.FullName] = $cached
        }
        if ($cached.Fingerprint) {
            $results.Add($cached) | Out-Null
        }
    }
    return $results.ToArray()
}

function Test-ThemeMenus {
    <#
        docs/themes/menus.md: every popup menu (the hamburger menu and the top bar dropdowns through TopPanelMenu, the
        game, group and tray menus) and every ComboBox list is the theme's own design, compact, drawn from its source.
        Checks the panel (the implicit ContextMenu template), that TopPanelMenu does not swap in another template, the two
        row templates and the ComboBoxItem template (28-32px root, an animated highlight, a submenu popup), a group break
        no taller than 12px, and that the row template is not a copy of another finished theme's.
    #>
    param([Parameter(Mandatory = $true)] [string]$Directory, [string]$SourceRoot, [string]$Key, [switch]$Advisory)

    $doc = "docs/themes/menus.md"
    # PLAYNITE_MENUS_STRICT (comma-separated keys or '*') applies the full check to a theme still in MenuPending, so a
    # theme being converted can be checked before its key leaves the list.
    $strictKeys = @("$env:PLAYNITE_MENUS_STRICT" -split ',' | ForEach-Object { $_.Trim() } | Where-Object { $_ })
    $strict = ($strictKeys -contains '*') -or ($strictKeys -contains $Key)
    if (($script:MenuPending -contains $Key) -and -not $strict) {
        if ($Advisory) { return @("menus: still the shared menu look; design its own menus ($doc), then remove '$Key' from MenuPending in scripts/lib/theme-lints.ps1") }
        return @()
    }
    if ($Advisory) { return @() }

    $itemKey = "{x:Static MenuItem.SubmenuItemTemplateKey}"
    $headerKey = "{x:Static MenuItem.SubmenuHeaderTemplateKey}"
    $separatorKey = "{x:Static MenuItem.SeparatorStyleKey}"
    $menuPath = Join-Path $Directory "DefaultControls/Menu.xaml"
    $contextPath = Join-Path $Directory "DefaultControls/ContextMenu.xaml"
    $topPath = Join-Path $Directory "Views/TopPanel.xaml"
    $menuDoc = if (Test-Path $menuPath) { Read-XamlDocument $menuPath } else { $null }
    $contextDoc = if (Test-Path $contextPath) { Read-XamlDocument $contextPath } else { $null }
    $topDoc = if (Test-Path $topPath) { Read-XamlDocument $topPath } else { $null }
    $menuWhere = Get-SourceDisplayPath -SourceRoot $SourceRoot -Relative "DefaultControls/Menu.xaml"
    $contextWhere = Get-SourceDisplayPath -SourceRoot $SourceRoot -Relative "DefaultControls/ContextMenu.xaml"
    $topWhere = Get-SourceDisplayPath -SourceRoot $SourceRoot -Relative "Views/TopPanel.xaml"
    $errors = [System.Collections.Generic.List[string]]::new()

    # Panel: the implicit ContextMenu style's template, which every menu inherits.
    $panel = $null
    $rounded = $false
    if ($contextDoc) {
        foreach ($style in $contextDoc.SelectNodes("//*[local-name()='Style'][@TargetType='{x:Type ContextMenu}']")) {
            if ($style.GetAttribute("Key", $script:XamlNs)) { continue }
            $panel = $style.SelectSingleNode("./*[local-name()='Setter'][@Property='Template']//*[local-name()='ControlTemplate']")
            $rounded = [bool]$style.SelectSingleNode("./*[local-name()='Setter'][@Property='UseLayoutRounding'][@Value='True']")
        }
    }
    # Layout rounding keeps 30px rows and the 16px icon PNGs on whole device pixels at 125%/175% scaling (otherwise every
    # other row lands on half a pixel and its icon blurs). The setter inherits into submenus.
    if ($contextDoc -and -not $rounded) {
        $errors.Add("${contextWhere}: the implicit ContextMenu style needs <Setter Property=""UseLayoutRounding"" Value=""True"" /> so menu rows and icons sit on whole pixels at fractional display scaling (docs/themes/menu-icons.md).") | Out-Null
    }
    if (-not $panel) {
        $errors.Add("${contextWhere}: the implicit ContextMenu style sets no Template. It is the panel of every menu, designed per theme ($doc).") | Out-Null
    }
    elseif (-not $panel.SelectSingleNode(".//*[local-name()='ItemsPresenter']")) {
        $errors.Add("${contextWhere}: the ContextMenu template has no ItemsPresenter for the menu rows ($doc).") | Out-Null
    }

    # The hamburger menu and the top bar dropdowns (TopPanelMenu) wear the same menu as the rest.
    $topStyle = if ($topDoc) { Get-XamlKeyedElement -Doc $topDoc -Key "TopPanelMenu" } else { $null }
    if ($topStyle -and $topStyle.SelectSingleNode(".//*[local-name()='Setter'][@Property='Template']")) {
        $errors.Add("${topWhere}: TopPanelMenu sets its own Template. Base it on the ContextMenu style so the hamburger menu and the top bar dropdowns wear the theme's menu ($doc).") | Out-Null
    }

    if (-not $menuDoc) {
        $errors.Add("${menuWhere}: missing or unreadable; the menu row templates live there ($doc).") | Out-Null
        return @($errors)
    }
    foreach ($pair in @(@($itemKey, "SubmenuItem"), @($headerKey, "SubmenuHeader"))) {
        $name = $pair[0]; $role = $pair[1]
        $template = Get-XamlKeyedElement -Doc $menuDoc -Key $name
        if (-not $template) { $errors.Add("${menuWhere}: no $name template ($doc).") | Out-Null; continue }
        $root = $template.SelectSingleNode("./*[1]")
        $height = if ($root) { ConvertTo-NumberList $root.GetAttribute("Height") } else { $null }
        if (-not $height -or $height[0] -lt 28 -or $height[0] -gt 32) {
            $errors.Add("${menuWhere}: the $role template's root sets Height 28-32 (compact rows; found '$(if ($root) { $root.GetAttribute('Height') })') ($doc).") | Out-Null
        }
        $highlight = $template.SelectSingleNode(".//*[local-name()='Trigger'][@Property='IsHighlighted' and @Value='True']")
        if (-not $highlight -or -not $highlight.SelectSingleNode(".//*[local-name()='BeginStoryboard']") -or -not $highlight.SelectSingleNode("./*[local-name()='Trigger.ExitActions']")) {
            $errors.Add("${menuWhere}: the $role template animates its highlight in and out (IsHighlighted trigger with EnterActions and ExitActions storyboards) ($doc).") | Out-Null
        }
        elseif (-not $highlight.SelectSingleNode("./*[local-name()='Setter'][@TargetName='Icon' and @Property='TextElement.Foreground']")) {
            $errors.Add("${menuWhere}: the $role template's IsHighlighted trigger must set TextElement.Foreground on TargetName=`"Icon`" so menu icons invert/contrast on hover ($doc).") | Out-Null
        }
        if ($role -eq "SubmenuHeader" -and -not $template.SelectSingleNode(".//*[local-name()='Popup']")) {
            $errors.Add("${menuWhere}: the $role template has no Popup for its submenu ($doc).") | Out-Null
        }
        if ($template.OuterXml -match 'InputGestureText') {
            $emptyTrigger = $template.SelectSingleNode(".//*[local-name()='Trigger'][@Property='InputGestureText' and @Value='']")
            $nullTrigger = $template.SelectSingleNode(".//*[local-name()='Trigger'][@Property='InputGestureText' and @Value='{x:Null}']")
            if (-not $emptyTrigger -or -not $nullTrigger) {
                $errors.Add("${menuWhere}: the $role template binds InputGestureText without collapsing the shortcut container for both Value=`"`"`" and Value=`"{x:Null}`" ($doc).") | Out-Null
            }
        }
    }
    $separator = Get-XamlKeyedElement -Doc $menuDoc -Key $separatorKey
    $separatorRoot = if ($separator) { $separator.SelectSingleNode(".//*[local-name()='ControlTemplate']/*[1]") } else { $null }
    if (-not $separatorRoot) { $errors.Add("${menuWhere}: the MenuItem.SeparatorStyleKey style has no template (the group break) ($doc).") | Out-Null }
    else {
        $height = ConvertTo-NumberList $separatorRoot.GetAttribute("Height")
        if ($height -and $height[0] -gt 12) {
            $errors.Add("${menuWhere}: the group break is $($height[0])px tall; at most 12px ($doc).") | Out-Null
        }
    }

    # Menu item icons: every theme draws its own set (the PNGs Playnite loads for the *Icon string keys), never Playnite's
    # stock icofont glyphs. The eight core keys must be <sys:String> paths to PNGs that exist inside the theme.
    # Cross-theme uniqueness (no two themes drawing the same set) is `node scripts/render-menu-icons.mjs --check`.
    $mediaPath = Join-Path $Directory "Media.xaml"
    $mediaWhere = Get-SourceDisplayPath -SourceRoot $SourceRoot -Relative "Media.xaml"
    $mediaDoc = if (Test-Path $mediaPath) { Read-XamlDocument $mediaPath } else { $null }
    if ($mediaDoc) {
        $iconDoc = "docs/themes/menu-icons.md"
        $coreMenuIcons = @("AddGameIcon", "UpdateDbIcon", "DiceIcon", "SettingsIcon", "AddonsIcon", "FullscreenModeIcon", "AboutPlayniteIcon", "ExitIcon")
        $stockIcons = [System.Collections.Generic.List[string]]::new()
        $brokenIcons = [System.Collections.Generic.List[string]]::new()
        $smearedIcons = [System.Collections.Generic.List[string]]::new()
        # $Directory is the build drop; the recipe sits beside the theme's source folder ($SourceRoot, repo-relative).
        $recipeFile = if ($SourceRoot) { Join-Path (Split-Path (Join-Path (Split-Path (Split-Path $PSScriptRoot -Parent) -Parent) $SourceRoot) -Parent) "art/menu-icons.json" } else { $null }
        $pixelRecipe = $recipeFile -and (Test-Path $recipeFile) -and ((Get-Content -Raw $recipeFile) -match '"pixel"\s*:\s*[1-9]')
        foreach ($iconKey in $coreMenuIcons) {
            $el = Get-XamlKeyedElement -Doc $mediaDoc -Key $iconKey
            # A <sys:String> path (drawn HighQuality) or a BitmapImage with UriSource="{ThemeFile '...'}" (Playnite copies
            # its RenderOptions.BitmapScalingMode onto the menu Image; pixel sets need NearestNeighbor).
            if ($el -and $el.LocalName -eq "String") { $iconPath = $el.InnerText.Trim(); $scaling = "" }
            elseif ($el -and $el.LocalName -eq "BitmapImage") {
                $iconPath = if ($el.GetAttribute("UriSource") -match "^\{ThemeFile\s+'([^']+)'\}$") { $Matches[1] } else { $el.GetAttribute("UriSource") }
                $scaling = $el.GetAttribute("RenderOptions.BitmapScalingMode")
            }
            else { $stockIcons.Add($iconKey) | Out-Null; continue }
            if ($iconPath -notmatch "^Images/.+\.png$" -or -not (Test-Path (Join-Path $Directory $iconPath))) { $brokenIcons.Add("$iconKey -> $iconPath") | Out-Null }
            if ($pixelRecipe -and $scaling -ne "NearestNeighbor") { $smearedIcons.Add($iconKey) | Out-Null }
        }
        if ($smearedIcons.Count -gt 0) {
            $errors.Add("${mediaWhere}: art/menu-icons.json is a pixel recipe but $($smearedIcons -join ', ') are not BitmapImages with RenderOptions.BitmapScalingMode=NearestNeighbor, so Playnite smears them at 125%/175% scaling. Run node scripts/render-menu-icons.mjs <Theme> ($iconDoc).") | Out-Null
        }
        if ($stockIcons.Count -gt 0) {
            $errors.Add("${mediaWhere}: menu icons ($($stockIcons -join ', ')) are still Playnite's stock icofont glyphs. Every theme draws its own set: write art/menu-icons.json and run node scripts/render-menu-icons.mjs <Theme> ($iconDoc).") | Out-Null
        }
        if ($brokenIcons.Count -gt 0) {
            $errors.Add("${mediaWhere}: menu icon PNGs not found inside the theme: $($brokenIcons -join '; ') ($iconDoc).") | Out-Null
        }
    }

    # ComboBox lists wear the same rows: the ComboBoxItem template (28-32px root, animated highlight).
    $comboPath = Join-Path $Directory "DefaultControls/ComboBox.xaml"
    $comboWhere = Get-SourceDisplayPath -SourceRoot $SourceRoot -Relative "DefaultControls/ComboBox.xaml"
    $comboDoc = if (Test-Path $comboPath) { Read-XamlDocument $comboPath } else { $null }
    $itemTemplate = if ($comboDoc) { $comboDoc.SelectSingleNode("//*[local-name()='Style'][@TargetType='{x:Type ComboBoxItem}']/*[local-name()='Setter'][@Property='Template']//*[local-name()='ControlTemplate']") } else { $null }
    if (-not $itemTemplate) { $errors.Add("${comboWhere}: no ComboBoxItem template. ComboBox lists wear the menu rows ($doc).") | Out-Null }
    else {
        $root = $itemTemplate.SelectSingleNode("./*[1]")
        $height = if ($root) { ConvertTo-NumberList $root.GetAttribute("Height") } else { $null }
        if (-not $height -or $height[0] -lt 28 -or $height[0] -gt 32) {
            $errors.Add("${comboWhere}: the ComboBoxItem template's root sets Height 28-32 like the menu rows (found '$(if ($root) { $root.GetAttribute('Height') })') ($doc).") | Out-Null
        }
        $highlight = $itemTemplate.SelectSingleNode(".//*[local-name()='Trigger'][@Property='IsHighlighted' and @Value='True']")
        if (-not $highlight -or -not $highlight.SelectSingleNode(".//*[local-name()='BeginStoryboard']") -or -not $highlight.SelectSingleNode("./*[local-name()='Trigger.ExitActions']")) {
            $errors.Add("${comboWhere}: the ComboBoxItem template animates its highlight in and out like the menu rows ($doc).") | Out-Null
        }
    }

    # Uniqueness: the row template must not be a copy of a finished theme's (whitespace and comments ignored).
    $ownText = Get-ThemeTemplateFingerprint -Doc $menuDoc -Key $itemKey
    if ($ownText) {
        $selfDir = if ($SourceRoot) { (Resolve-Path (Split-Path (Join-RepoPath $SourceRoot) -Parent)).Path } else { $null }
        foreach ($peer in Get-PeerThemeFingerprints -RelativeFile "DefaultControls/Menu.xaml" -Key $itemKey) {
            if ($selfDir -and $peer.ThemeDir -eq $selfDir) { continue }
            if ($peer.Fingerprint -eq $ownText) {
                $errors.Add("${menuWhere}: the menu row template is identical to $($peer.ThemeName)'s. Each theme's menus are its own design ($doc).") | Out-Null
            }
        }
    }
    return @($errors)
}

function Test-ThemeSignatureUniqueness {
    <#
        docs/themes/creative-direction.md "Shell & Game Page Levers": a theme's primary PlayButton template, details list
        row template (DetailsViewItemStyle) and grid tile frame template (GridViewItemStyle) carry the theme's signature
        silhouette and selection mark, and must not be copied verbatim from another theme.
    #>
    param([Parameter(Mandatory = $true)] [string]$Directory, [string]$SourceRoot)

    $errors = [System.Collections.Generic.List[string]]::new()
    $selfDir = if ($SourceRoot) { (Resolve-Path (Split-Path (Join-RepoPath $SourceRoot) -Parent)).Path } else { $null }
    $targets = @(
        @{ File = "DerivedStyles/PlayButton.xaml"; Key = "PlayButton"; Label = "PlayButton template" },
        @{ File = "DerivedStyles/DetailsViewItemStyle.xaml"; Key = "DetailsViewItemStyle"; Label = "details list row template (DetailsViewItemStyle)" },
        @{ File = "DerivedStyles/GridViewItemStyle.xaml"; Key = "GridViewItemStyle"; Label = "grid tile frame template (GridViewItemStyle)" }
    )
    foreach ($target in $targets) {
        $path = Join-Path $Directory $target.File
        if (-not (Test-Path -LiteralPath $path)) { continue }
        $doc = Read-XamlDocument $path
        if (-not $doc) { continue }
        $ownFp = Get-ThemeTemplateFingerprint -Doc $doc -Key $target.Key -StyleTemplate
        if (-not $ownFp) { continue }
        $where = Get-SourceDisplayPath -SourceRoot $SourceRoot -Relative $target.File
        foreach ($peer in Get-PeerThemeFingerprints -RelativeFile $target.File -Key $target.Key -StyleTemplate) {
            if ($selfDir -and $peer.ThemeDir -eq $selfDir) { continue }
            if ($peer.Fingerprint -eq $ownFp) {
                $errors.Add("${where}: the $($target.Label) is identical to $($peer.ThemeName)'s. Each theme's signature controls must be designed from its own source (docs/themes/creative-direction.md).") | Out-Null
            }
        }
    }
    return @($errors | Select-Object -Unique)
}

function Test-ThemeModifierIconButtons {
    <#
        src/themes/AGENTS.md "ThemeModifier icon buttons": ThemeModifier hardcodes its pick (pencil) and restore (X) buttons at
        Width=41 (editor XAML and constants code), inside two fixed 41px columns, with no Height. A Width=41 style
        trigger pins an internal 41x41 square and uniformly layout-scales it by 32/41. The resulting button and its
        content occupy 32x32px, including explicitly sized child glyphs and theme decoration. Auto-width buttons keep
        their own padding. RenderTransform is insufficient because it leaves the old desired layout size.
    #>
    param([Parameter(Mandatory = $true)] [string]$Directory, [string]$SourceRoot)

    $errors = [System.Collections.Generic.List[string]]::new()
    foreach ($entry in (Get-CachedThemeXamlEntries -Directory $Directory | Where-Object { $_.Relative -match "DefaultControls/Button\.xaml$" })) {
        $where = Get-SourceDisplayPath -SourceRoot $SourceRoot -Relative $entry.Relative
        $doc = $entry.Doc
        if (-not $doc) { continue }
        $style = $doc.SelectSingleNode("//*[local-name()='Style'][@TargetType='{x:Type Button}'][not(@*[local-name()='Key'])]")
        if (-not $style) { continue }

        $trigger = $style.SelectSingleNode("*[local-name()='Style.Triggers']/*[local-name()='Trigger'][@Property='Width'][@Value='41']")
        if (-not $trigger) {
            $errors.Add("${where}: no Width=41 trigger for ThemeModifier's icon buttons. Add it to the base Button style with a uniform 32/41 LayoutTransform for a rendered 32x32 square (src/themes/AGENTS.md ThemeModifier icon buttons).") | Out-Null
            continue
        }

        $padding = ""
        $setter = $trigger.SelectSingleNode("*[local-name()='Setter'][@Property='Padding']")
        if ($setter) { $padding = $setter.GetAttribute("Value") }
        $paddingNumbers = ConvertTo-NumberList $padding
        $paddingIsZero = ($null -ne $paddingNumbers -and @($paddingNumbers | Where-Object { $_ -ne 0 }).Count -eq 0)
        if (-not $paddingIsZero) {
            $shown = if ($padding) { "'$padding'" } else { "not set" }
            $errors.Add("${where}: the Width=41 trigger does not set Padding=""0"" ($shown). A 41px button with the body padding leaves a few pixels for the glyph and clips it (src/themes/AGENTS.md ThemeModifier icon buttons).") | Out-Null
        }

        foreach ($property in @("HorizontalContentAlignment", "VerticalContentAlignment")) {
            $value = ""
            $setter = $trigger.SelectSingleNode("*[local-name()='Setter'][@Property='$property']")
            if ($setter) { $value = $setter.GetAttribute("Value") }
            if ($value -notmatch "Center") {
                $errors.Add("${where}: the Width=41 trigger does not set $property to Center. The glyph then draws in a corner instead of the middle of the 41x41 square (src/themes/AGENTS.md ThemeModifier icon buttons).") | Out-Null
            }
        }

        $minHeight = 0.0
        $minHeightShown = "not set"
        $setter = $trigger.SelectSingleNode("*[local-name()='Setter'][@Property='MinHeight']")
        if ($setter) {
            $minHeightShown = $setter.GetAttribute("Value")
            [void][double]::TryParse($minHeightShown, [System.Globalization.NumberStyles]::Float, [System.Globalization.CultureInfo]::InvariantCulture, [ref]$minHeight)
        }
        if ($minHeight -ne 41) {
            $errors.Add("${where}: the Width=41 trigger must pin internal MinHeight to 41 before scaling to 32px; got '$minHeightShown' (src/themes/AGENTS.md ThemeModifier icon buttons).") | Out-Null
        }

        $minWidth = 0.0
        $minWidthShown = "not set"
        $setter = $trigger.SelectSingleNode("*[local-name()='Setter'][@Property='MinWidth']")
        if ($setter) {
            $minWidthShown = $setter.GetAttribute("Value")
            [void][double]::TryParse($minWidthShown, [System.Globalization.NumberStyles]::Float, [System.Globalization.CultureInfo]::InvariantCulture, [ref]$minWidth)
        }
        if ($minWidth -ne 41) {
            $errors.Add("${where}: the Width=41 trigger sets MinWidth '$minWidthShown'; pin it to 41. A theme's own MinWidth (MUI-style buttons use 64) coerces the plugin's 41px buttons wider and the two overlap in Edit constants (src/themes/AGENTS.md ThemeModifier icon buttons).") | Out-Null
        }

        foreach ($property in @("Height", "MaxWidth", "MaxHeight")) {
            $setter = $trigger.SelectSingleNode("*[local-name()='Setter'][@Property='$property']")
            if (-not $setter -or $setter.GetAttribute("Value") -ne "41") {
                $errors.Add("${where}: the Width=41 trigger must pin internal $property to 41 so uniform 32/41 layout scaling produces a 32x32 square (src/themes/AGENTS.md ThemeModifier icon buttons).") | Out-Null
            }
        }
        $scale = $trigger.SelectSingleNode("*[local-name()='Setter'][@Property='LayoutTransform']/*[local-name()='Setter.Value']/*[local-name()='ScaleTransform']")
        foreach ($axis in @("ScaleX", "ScaleY")) {
            $value = 0.0
            if ($scale) { [void][double]::TryParse($scale.GetAttribute($axis), [System.Globalization.NumberStyles]::Float, [System.Globalization.CultureInfo]::InvariantCulture, [ref]$value) }
            if ([Math]::Abs($value - 32.0 / 41.0) -gt 0.000000001) {
                $errors.Add("${where}: the Width=41 trigger must set LayoutTransform ScaleTransform $axis to 0.7804878048780488 (32/41), scaling the button and its content proportionally to 32px (src/themes/AGENTS.md ThemeModifier icon buttons).") | Out-Null
            }
        }

        $fontSize = 0.0
        $setter = $trigger.SelectSingleNode("*[local-name()='Setter'][@Property='FontSize']")
        if ($setter) { [void][double]::TryParse($setter.GetAttribute("Value"), [System.Globalization.NumberStyles]::Float, [System.Globalization.CultureInfo]::InvariantCulture, [ref]$fontSize) }
        if ($fontSize -lt 12 -or $fontSize -gt 24) {
            $shown = if ($setter) { $setter.GetAttribute("Value") } else { "not set" }
            $errors.Add("${where}: the Width=41 trigger sets FontSize $shown, outside the small-icon 12-24 range. Use 16 so the glyph sits square in its container with breathing room (src/themes/AGENTS.md ThemeModifier icon buttons).") | Out-Null
        }
    }
    return @($errors | Select-Object -Unique)
}

function Test-WpfRuntimeTraps {
    <#
        Catches XAML patterns that parse cleanly in XmlDocument / static checks but throw at runtime in Playnite:
        1. Style TargetType="Window" BasedOn StandardWindowStyle/MainWindowStyle (WindowBase is a subclass of Window; Style.Seal throws InvalidOperationException on startup).
        2. Implicit ListBox style without ScrollViewer.CanContentScroll="True" (VirtualizingWrapPanel crashes Grid view with InvalidOperationException).
        3. PasswordBox ControlTemplate binding VerticalScrollBarVisibility / HorizontalScrollBarVisibility via TemplateBinding (PasswordBox lacks those properties; XamlParseException when opening a dialog).
        4. TextBlock.TextTrimming or TextBlock.TextWrapping used as attached attributes (not attached properties in WPF; XamlParseException on menu/ComboBox/TreeView open).
    #>
    param([Parameter(Mandatory = $true)] [string]$Directory, [string]$SourceRoot)

    $errors = [System.Collections.Generic.List[string]]::new()
    $xamlNs = "http://schemas.microsoft.com/winfx/2006/xaml"
    foreach ($entry in Get-CachedThemeXamlEntries -Directory $Directory) {
        $doc = $entry.Doc
        if (-not $doc) { continue }
        $where = Get-SourceDisplayPath -SourceRoot $SourceRoot -Relative $entry.Relative
        $raw = $entry.Text

        # 1. Window style BasedOn a WindowBase style
        foreach ($style in $doc.SelectNodes("//*[local-name()='Style'][@TargetType and @BasedOn]")) {
            $tt = $style.GetAttribute("TargetType")
            $bo = $style.GetAttribute("BasedOn")
            if ($tt -match '^(Window|\{x:Type\s+Window\})$' -and $bo -match '(StandardWindowStyle|MainWindowStyle)') {
                $errors.Add("${where}: Style targeting Window cannot be BasedOn '$bo' (which targets WindowBase, a subclass of Window); Playnite crashes on startup during Style.Seal. Remove BasedOn and set Background/Foreground/FontFamily directly.") | Out-Null
            }
        }

        # 2. Implicit ListBox style missing ScrollViewer.CanContentScroll="True"
        if ($entry.Relative -replace '\\', '/' -eq 'DefaultControls/ListBox.xaml') {
            foreach ($style in $doc.SelectNodes("//*[local-name()='Style'][@TargetType]")) {
                $tt = $style.GetAttribute("TargetType")
                $key = $style.GetAttribute("Key", $xamlNs)
                if (-not $key -and $tt -match '^(ListBox|\{x:Type\s+ListBox\})$') {
                    $canScroll = $style.SelectSingleNode("./*[local-name()='Setter'][@Property='ScrollViewer.CanContentScroll' and @Value='True']")
                    if (-not $canScroll) {
                        $errors.Add("${where}: implicit ListBox style must set ScrollViewer.CanContentScroll=`"True`". Playnite's Grid view uses VirtualizingWrapPanel, which throws InvalidOperationException when CanContentScroll is false.") | Out-Null
                    }
                }
            }
        }

        # 3. PasswordBox TemplateBinding to VerticalScrollBarVisibility / HorizontalScrollBarVisibility
        if ($entry.Relative -replace '\\', '/' -eq 'DefaultControls/PasswordBox.xaml') {
            if ($raw -match '\{TemplateBinding\s+(Vertical|Horizontal)ScrollBarVisibility\}') {
                $errors.Add("${where}: PasswordBox does not inherit from TextBoxBase and has no VerticalScrollBarVisibility/HorizontalScrollBarVisibility properties; TemplateBinding throws XamlParseException at runtime. Set them to `"Hidden`" instead.") | Out-Null
            }
        }

        # 4. Invalid attached TextBlock.TextTrimming / TextBlock.TextWrapping attributes
        if ($raw -match 'TextBlock\.(TextTrimming|TextWrapping)\s*=') {
            $errors.Add("${where}: TextBlock.$($Matches[1]) is not an attached property in WPF and throws XamlParseException at runtime. Apply it via <ContentPresenter.Resources><Style TargetType=`"TextBlock`"> instead.") | Out-Null
        }
    }
    return @($errors | Select-Object -Unique)
}
