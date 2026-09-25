# Primer theme kit — agent notes

## What this is

GitHub Primer component styles and app shell for Playnite desktop themes. It **extends the Shadcn kit** (`kit.json` → `"extends": "src/ThemeKits/Shadcn"`) and replaces only what Primer draws differently. Loading rules, token contract, control metrics, and placeholder syntax: **`src/ThemeKits/Shadcn/AGENTS.md`**.

Current consumers: **Primer Theme** (`src/PrimerTheme`).

## Two accents

Primer uses **blue** (`accent`) for focus, checked controls, selection, and links, and **green** (`button-primary`) for primary buttons and progress. Palettes map blue to `--primary` (so Playnite's `GlyphColor`, checkboxes, sliders, and selected rows are blue) and green to the optional `--primary-button` / `--primary-button-hover` / `--primary-button-foreground`. The coral UnderlineNav bar is `--tab-indicator`.

## Shell

GitHub's page layout: `bgColor-default` everywhere except one dark band (`bgColor-inset`, palette `--header`) across the top, with no borders.

| File | Primer behavior |
|------|-----------------|
| `Views/MainWindow.xaml` | Flat: sidebar and view on `bgColor-default`. |
| `DerivedStyles/MainWindowStyle.xaml` | Window buttons as invisible IconButtons (32px, borderRadius-medium) on the band, 16px from the top. |
| `Views/Sidebar.xaml` | Navigation rail on the page color. Its top 64px is painted in the header color and holds the three-bars button (`PART_ElemMainMenu`), so the band spans the window like GitHub's AppHeader. |
| `CustomControls/SidebarItem.xaml` | NavList item, icon only: 32px, 16px octicons in fgColor-muted, transparent hover fill; the current item keeps the fill and gets NavList's current-item bar (4x24, accent, 8px outside the item). |
| `Views/TopPanel.xaml` | AppHeader: 64px band, 16px padding. Quiet left side; on the right the search input (TextInput medium, 272px), then Playnite's view controls, filters and notifications as invisible IconButtons. Notifications show GitHub's unread dot instead of a count. |
| `CustomControls/TopPanelItem.xaml` | Invisible IconButton, medium; toggled = `control-transparent-bgColor-selected` fill. |

Icons: Octicons 19.38.0 (MIT, `LICENSE-octicons.txt`), 16px set, in `Desktop/Media.xaml`.

## Controls

Source: `@primer/primitives` (functional dark tokens, border sizes) and Primer's Button, IconButton, TextInput, UnderlineNav, NavList, ActionList, ToggleSwitch, Radio, ProgressBar, Tooltip components.

| File | Primer behavior |
|------|-----------------|
| `Common.xaml` | Focus = 2px solid `focus-outlineColor` outline, offset −2px (inside the control edge). Metrics (medium control size): Button and TextInput 32px with 12px inline padding, ActionList items 6px 8px (radius 6) inside 8px overlay padding, overlays at `borderRadius-large` (12px), Box 16px at radius 6. Repeats `PopupBorder`. |
| `DefaultControls/Button.xaml` | `default` variant: control bg, `borderColor-default` edge, `control-bgColor-hover` on hover. `IsDefault` = `primary` variant (green). Medium weight. |
| `DerivedStyles/PlayButton.xaml` | `primary` variant (green). |
| `DefaultControls/TextBox.xaml`, `PasswordBox.xaml` | `bgColor-default` fill; focus = accent border + 1px inset accent, drawn as a 2px ring-colored edge. |
| `DefaultControls/TabControl.xaml` | UnderlineNav: default-colored items with a rounded transparent-hover pill; selected = semibold + 2px coral bar; no list border line. |
| `DefaultControls/RadioButton.xaml` | Checked = 4px accent ring around a white center. |
| `DefaultControls/Slider.xaml` (SliderEx follows it) | Primer has no slider; this one uses ProgressBar's track (8px, rounded, neutral-muted rail, accent fill to the thumb center) and the ToggleSwitch knob (upright 12x20 pill, `controlKnob-bgColor-rest` with a `control-borderColor-rest` edge, brighter edge on hover, 2px accent ring on keyboard focus). |
| `DefaultControls/ProgressBar.xaml` | Green bar on a `borderColor-default` track. |
| `DefaultControls/ToolTip.xaml` | `bgColor-emphasis`, white text, no border. |
| `DefaultControls/ScrollViewer.xaml` | GitHub's scrollbar: 12px, no rail, radius-3 thumb in `borderColor-default`, `fgColor-muted` on hover and drag. |

Inherited and close to Primer: checkbox (accent fill, white check), select, ActionMenu-style menus (translucent `control-transparent-bgColor-hover` rows), search box, cover tiles, details rows.

## Known gaps

- Header search and icon buttons are GitHub's shapes without their borders (invisible variant), to keep the band quiet; the search input keeps its edge.
- Font: Segoe UI (in Primer's system stack on Windows); Mona Sans is not bundled.
- `GlyphColor` is `accent-emphasis` (#1F6FEB) because Playnite uses it as a fill under white text too; Primer's link text color (`fgColor-accent`, #4493F8) is a little lighter.
