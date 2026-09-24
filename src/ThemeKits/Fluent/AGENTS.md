# Fluent theme kit — agent notes

## What this is

Microsoft Fluent 2 component styles (Fluent UI React v9) for Playnite desktop themes. It **extends the Shadcn kit** (`kit.json` → `"extends": "src/ThemeKits/Shadcn"`) and replaces only what Fluent draws differently. Loading rules, token contract, and placeholder syntax: **`src/ThemeKits/Shadcn/AGENTS.md`**.

Current consumers: **Fluent 2 Theme** (`src/Fluent2Theme`).

## Two blues and a strong stroke

- `--primary` = Fluent's **compound brand** (`#479EF5` in dark): checked controls, focus underlines, tab indicators, slider progress, Playnite's `GlyphColor`. Its text pair is `colorNeutralForegroundInverted` (dark).
- `--primary-button` = **`colorBrandBackground`** (`#115EA3`) with white text: primary buttons and Play.
- `--border-strong` = **`colorNeutralStrokeAccessible`**: input bottom edges, checkbox/radio outlines, slider rail.
- `--ring` = **`colorStrokeFocus2`** (white).

## What differs from the Shadcn kit

Source: `@fluentui/react-theme` 9.2.2 `webDarkTheme`, and the style hooks of `@fluentui/react-button`, `react-input`, `react-combobox`, `react-tabs`, `react-checkbox`, `react-radio`, `react-slider`, `react-tabster` (`createFocusOutlineStyle`).

| File | Fluent behavior |
|------|-----------------|
| `Common.xaml` | Focus = 2px `colorStrokeFocus2` outline hugging the control. Repeats `PopupBorder`. |
| `DefaultControls/Button.xaml` | Default = Background1 fill, Stroke1 edge, Background1Hover on hover; `IsDefault` = brand primary. Semibold. |
| `DerivedStyles/PlayButton.xaml` | Brand primary. |
| `DefaultControls/TextBox.xaml`, `PasswordBox.xaml` | Background1 fill, Stroke1 edge with an accessible-stroke bottom (curved into the corners); focus = 2px compound-brand underline that **scales in from the center** (0.2s in, 0.1s out). Keeps `ShadcnBareTextBox`. |
| `DefaultControls/ComboBox.xaml` | Same underline chrome and focus animation around the Shadcn select; `ComboBoxItem` style carried over (the file replaces the base whole). |
| `DefaultControls/TabControl.xaml` | TabList: no rail, subtle hover fill, 3px rounded indicator inset by the tab padding (gray on hover, compound brand when selected), selected label semibold. |
| `DefaultControls/CheckBox.xaml` | 16px, 2px corners, transparent with an accessible edge; checked = compound brand fill, dark mark. |
| `DefaultControls/RadioButton.xaml` | Transparent circle, accessible edge; checked = brand edge + 10px brand dot. |
| `DefaultControls/Slider.xaml`, `CustomControls/SliderEx.xaml` | 4px rail in the accessible stroke, brand progress, 20px thumb = brand disc inside a Background1 ring with a Stroke1 edge. |

Inherited and close to Fluent: menus (Background1 popover, rounded rows, SubtleBackgroundHover), tooltip (Background1 with an edge), progress, scrollbars, sidebar, cover tiles.

## Known gaps

- No shadows (`shadow16` on menus and tooltips); popups get a `colorNeutralStroke2` edge instead.
- No Mica/acrylic: WPF layered popups and Playnite's window can't use the Windows 11 backdrop from a theme.
- Hover edge colors (`colorNeutralStroke1Hover`, `StrokeAccessibleHover`) use the ring white instead of the slightly dimmer Fluent grays.
- Fluent icons (Segoe Fluent Icons) are not swapped in; Playnite's icofont glyphs stay.
