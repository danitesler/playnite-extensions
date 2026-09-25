# Fluent theme kit — agent notes

## What this is

Microsoft Fluent 2 component styles (Fluent UI React v9) and a Windows 11 app shell for Playnite desktop themes. It **extends the Shadcn kit** (`kit.json` → `"extends": "src/ThemeKits/Shadcn"`) and replaces only what Fluent draws differently. Loading rules, token contract, control metrics, and placeholder syntax: **`src/ThemeKits/Shadcn/AGENTS.md`**.

Current consumers: **Fluent 2 Theme** (`src/Fluent2Theme`).

## Two blues and a strong stroke

- `--primary` = Fluent's **compound brand** (`#479EF5` in dark): checked controls, focus underlines, tab and nav indicators, slider progress, hovered subtle icons, Playnite's `GlyphColor`. Its text pair is `colorNeutralForegroundInverted` (dark).
- `--primary-button` = **`colorBrandBackground`** (`#115EA3`) with white text: primary buttons, Play, the notification CounterBadge.
- `--border-strong` = **`colorNeutralStrokeAccessible`**: input bottom edges, checkbox/radio outlines, slider rail.
- `--ring` = **`colorStrokeFocus2`** (white).

## Shell

Windows 11 layering: the window is the base layer (`colorNeutralBackground2`, standing in for Mica) holding the title-bar row and the navigation rail; the library sits on a lighter content layer.

| File | Fluent behavior |
|------|-----------------|
| `Views/MainWindow.xaml` | Flat base layer. |
| `DerivedStyles/MainWindowStyle.xaml` | Windows 11 caption buttons: 46x32, square, flush with the top-right corner; subtle fill on hover, red for close. |
| `Views/Sidebar.xaml` | NavigationView, LeftCompact: 48px rail, no border; the pane toggle (hamburger, `PART_ElemMainMenu`) in the title-bar row; 40x36 items with a 4px gutter. |
| `CustomControls/SidebarItem.xaml` | NavigationViewItem: 40x36, borderRadiusMedium, 20px icons, subtle hover fill; selected = subtle fill + 3x16 brand pill on the left edge. |
| `Views/TopPanel.xaml` | 48px title-bar row on the base layer: search centered (up to 468px, shrinks when tight), subtle 32px icon buttons with 20px icons on the right; brand CounterBadge for notifications. |
| `CustomControls/TopPanelItem.xaml` | Button subtle, icon only: 32px; hover and checked = subtle fill + brand icon. |
| `CustomControls/SearchBox.xaml` | SearchBox (outline): Input chrome with a 20px search icon and a dismiss icon. |
| `Views/Library.xaml` | Content layer: everything under the title-bar row on `colorNeutralBackground1`, top-left corner rounded 8px where it meets the rail (frame-colored mask); square when the rail is elsewhere or hidden. The background art is faded out on every edge so it never meets the rail or title-bar row in a hard line. |

Icons: Fluent UI System Icons, Regular, 20px (`@fluentui/svg-icons` 1.1.342, MIT, `LICENSE-fluentui-system-icons.txt`), in `Desktop/Media.xaml`.

## Controls

Source: `@fluentui/react-theme` 9.2.2 `webDarkTheme`, and the style hooks of `@fluentui/react-button`, `react-input`, `react-combobox`, `react-tabs`, `react-checkbox`, `react-radio`, `react-slider`, `react-menu`, `react-tooltip`, `react-card`, `react-tabster` (`createFocusOutlineStyle`).

| File | Fluent behavior |
|------|-----------------|
| `Common.xaml` | Focus = 2px `colorStrokeFocus2` outline hugging the control. Metrics (medium, 32px controls): Button 5px 12px, Input 32px, MenuPopover 4px with 32px items (radius 4) at radius 8, Card 12px at radius 4, Tooltip 4px 11px 6px. Repeats `PopupBorder`. |
| `DefaultControls/Button.xaml` | Default = Background1 fill, Stroke1 edge; hover = Background1Hover + Stroke1Hover edge, pressed = Background1Pressed; `IsDefault` = brand primary (BrandBackgroundHover / Pressed). Semibold. |
| `DerivedStyles/PlayButton.xaml` | Brand primary. |
| `DefaultControls/TextBox.xaml`, `PasswordBox.xaml` | Background1 fill, Stroke1 edge with an accessible-stroke bottom (curved into the corners); focus = 2px compound-brand underline that **scales in from the center** (0.2s in, 0.1s out). Keeps `ShadcnBareTextBox`. |
| `DefaultControls/ComboBox.xaml` | Same underline chrome and focus animation around the Shadcn select, spacing from the metrics; `ComboBoxItem` style carried over (the file replaces the base whole). |
| `DefaultControls/TabControl.xaml` | TabList: no rail, subtle hover fill, 3px rounded indicator inset by the tab padding (Stroke1Hover on hover, compound brand when selected, CompoundBrandStrokeHover when selected and hovered), selected label semibold. |
| `DefaultControls/CheckBox.xaml` | 16px, 2px corners, transparent with an accessible edge; checked = compound brand fill, dark mark. |
| `DefaultControls/RadioButton.xaml` | Transparent circle, accessible edge; checked = brand edge + 10px brand dot. |
| `DefaultControls/ScrollViewer.xaml` | Windows 11 scrollbar: a 2px line at rest that widens to a 6px rounded thumb while the pointer is over the bar; brighter while dragging; no rail. |
| `DefaultControls/Slider.xaml` (SliderEx follows it) | 4px rounded rail in the accessible stroke; brand progress from the rail start to the thumb center (square end under the thumb); 20px thumb = brand disc inside a Background1 ring with a Stroke1 edge; hover moves thumb and progress to the hover brand; 2px focus outline on keyboard focus. |

Hover edges follow the tokens: inputs and dropdowns get Stroke1Hover sides and a StrokeAccessibleHover bottom; unchecked checkbox and radio get StrokeAccessibleHover, checked ones CompoundBrandBackgroundHover. Rows use SubtleBackgroundHover / SubtleBackgroundSelected.

Inherited and close to Fluent: menus (Background1 popover, rounded rows, SubtleBackgroundHover), tooltip (Background1, no edge), progress, cover tiles, details rows.

## Known gaps

- No shadows (`shadow16` on menus and tooltips); popups get a `colorNeutralStroke2` edge instead.
- No Mica/acrylic: WPF layered popups and Playnite's window can't use the Windows 11 backdrop from a theme; the base layer is a flat color.
- Menu icons stay icofont glyphs: Playnite copies menu icon resources as text (see the Shadcn kit notes).
- Views other than the library (Statistics, add-on views) sit on the base layer; only the library gets the content layer.
