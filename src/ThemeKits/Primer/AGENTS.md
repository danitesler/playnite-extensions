# Primer theme kit — agent notes

## What this is

GitHub Primer component styles for Playnite desktop themes. It **extends the Shadcn kit** (`kit.json` → `"extends": "src/ThemeKits/Shadcn"`) and replaces only what Primer draws differently. Loading rules, token contract, and placeholder syntax: **`src/ThemeKits/Shadcn/AGENTS.md`**.

Current consumers: **Primer Theme** (`src/PrimerTheme`).

## Two accents

Primer uses **blue** (`accent`) for focus, checked controls, selection, and links, and **green** (`button-primary`) for primary buttons and progress. Palettes map blue to `--primary` (so Playnite's `GlyphColor`, checkboxes, sliders, and selected rows are blue) and green to the optional `--primary-button` / `--primary-button-hover` / `--primary-button-foreground`. The coral UnderlineNav bar is `--tab-indicator`.

## What differs from the Shadcn kit

Source: `@primer/primitives` (functional dark tokens, border sizes) and Primer's Button, TextInput, UnderlineNav, Radio, ProgressBar, Tooltip components.

| File | Primer behavior |
|------|-----------------|
| `Common.xaml` | Focus = 2px solid `focus-outlineColor` outline, offset −2px (inside the control edge). Repeats `PopupBorder`. |
| `DefaultControls/Button.xaml` | `default` variant: control bg, `borderColor-default` edge, `control-bgColor-hover` on hover. `IsDefault` = `primary` variant (green). Medium weight. |
| `DerivedStyles/PlayButton.xaml` | `primary` variant (green). |
| `DefaultControls/TextBox.xaml`, `PasswordBox.xaml` | `bgColor-default` fill; focus = accent border + 1px inset accent, drawn as a 2px ring-colored edge. |
| `DefaultControls/TabControl.xaml` | UnderlineNav: default-colored items with a rounded transparent-hover pill; selected = semibold + 2px coral bar over the list border. |
| `DefaultControls/RadioButton.xaml` | Checked = 4px accent ring around a white center. |
| `DefaultControls/ProgressBar.xaml` | Green bar on a `borderColor-default` track. |
| `DefaultControls/ToolTip.xaml` | `bgColor-emphasis`, white text, no border. |

Inherited and close to Primer: checkbox (accent fill, white check), select, ActionMenu-style menus (translucent `control-transparent-bgColor-hover` rows), scrollbars, sidebar, cover tiles.

## Known gaps

- Primer overlays use `borderRadius-large` (12px); the inherited menus use md (6px).
- The ActionList selected-item bar (4px accent stripe on the left of the selected sidebar/menu row) is not drawn.
- Font: Segoe UI (in Primer's system stack on Windows); Mona Sans is not bundled.
- `GlyphColor` is `accent-emphasis` (#1F6FEB) because Playnite uses it as a fill under white text too; Primer's link text color (`fgColor-accent`, #4493F8) is a little lighter.
