# Chakra theme kit — agent notes

## What this is

Chakra UI v3 component styles and app shell for Playnite desktop themes. It **extends the Shadcn kit** (`kit.json` → `"extends": "src/ThemeKits/Shadcn"`): the build copies every Shadcn overlay file first, then this kit's files on top, and renders the Shadcn kit's `Constants.template.xaml`. So this folder only holds what Chakra draws differently.

Read **`src/ThemeKits/Shadcn/AGENTS.md`** first: Playnite's loading rules, the token contract, the control metrics and the placeholder syntax all apply unchanged. The `Shadcn*` resource keys are the shared token vocabulary; a Chakra palette maps Chakra's semantic tokens onto them (see `src/ChakraUiTheme/palette.css`).

Current consumers: **Chakra UI Theme** (`src/ChakraUiTheme`).

## Shell

One flat surface (`bg`) for the window, sidebar and top bar; no borders or panel fills. Structure comes from spacing and teal "subtle" states.

| File | Chakra behavior |
|------|-----------------|
| `Views/MainWindow.xaml` | Flat: sidebar and view on `bg`, no inset. |
| `DerivedStyles/MainWindowStyle.xaml` | Window buttons as ghost IconButtons, size sm (36px), centered on the 64px bar, 24px from the right. |
| `Views/Sidebar.xaml` | px-4 around 40px items, gap-2. Main menu = rounded-full teal `solid` IconButton (40px, white icon). |
| `CustomControls/SidebarItem.xaml` | IconButton md (40px, rounded l2): ghost at rest, gray.subtle hover; active view = teal `subtle` (colorPalette.subtle fill, colorPalette.fg icon). |
| `Views/TopPanel.xaml` | 64px bar, px-6. Playnite's view controls in one SegmentGroup on the left (bg.muted track, rounded l3); search on the right as an Input `subtle` (bg.muted, no visible border, h-10, 320px); ghost IconButtons for filters and notifications, teal `subtle` while active; red solid Badge for the count. |
| `CustomControls/TopPanelItem.xaml` | SegmentGroup items: 40px, 20px icons, checked = bg.emphasized indicator, hover = half of it. |

Icons: lucide from the Shadcn kit's `Media.xaml` (Chakra's docs use `react-icons/lu`), drawn at 20px (IconButton md).

## Controls

Source: `chakra-ui/chakra-ui` `packages/react/src/theme` (`recipes/button.ts`, `input.ts`, `tabs.ts`, `slider.ts`, `segment-group.ts`, `menu.ts`, `tooltip.ts`, `card.ts`, `preset-base.ts` `createFocusRing`).

| File | Chakra behavior |
|------|-----------------|
| `Common.xaml` | `ShadcnFocusVisual` = `focusVisibleRing="outside"` (2px focusRing, 2px offset). Metrics: Button md 16,10 (h-10), Input md 12,9 (h-10), menu p-1.5 with px-2 py-1.5 items (rounded l1), popovers l2, cards 24px padding and l3 radius, tooltip px-2.5 py-1. Repeats `PopupBorder`. |
| `DefaultControls/Button.xaml` | Borderless. Regular = gray `subtle` (secondary fill, accent on hover); `IsDefault` = `solid` (primary, primary/90 on hover). |
| `DefaultControls/ToggleButton.xaml` | Off = gray `subtle`; on = brand `subtle` (`ShadcnPrimarySubtle*`). |
| `DefaultControls/TextBox.xaml`, `PasswordBox.xaml` | Input `subtle` variant: bg.muted fill, transparent 1px border (palette `--input-background`, `--input-border`); focus = `focusVisibleRing="inside"` (2px ring-colored edge). Keeps `ShadcnBareTextBox`. The inherited select and search box pick up the same fill and edge through the palette. |
| `DefaultControls/TabControl.xaml` | `line` variant without the list's edge line: muted triggers, 2px primary indicator. |
| `DefaultControls/Slider.xaml`, `CustomControls/SliderEx.xaml` | md `outline` variant: 8px rounded-full bg.emphasized track, colorPalette.solid range to the thumb center, 20px thumb (bg fill, 2px colorPalette.solid border), 3px focusRing/50 ring on keyboard focus. |

Inherited and close enough: select, checkbox, radio, progress, menus, tooltip (inverted: `bg.inverted` / `fg.inverted` through the token fallback), scrollbars, cover tiles, details rows.

## Palette notes for Chakra themes

- `--radius: 0.375rem` makes the kit scale line up with Chakra's semantic radii: sm = `l1` (2px), md = `l2` (4px), lg = `l3` (6px).
- Brand palette → `--primary` (`<color>.solid`), `--primary-foreground` (`.contrast`), `--primary-subtle` / `--primary-subtle-foreground` (`.subtle` / `.fg`), `--ring` (`.focusRing`), `--sidebar-accent*` for the selected sidebar item.
- Gray scale → `--secondary` (`gray.subtle`, button fill and ghost hover), `--muted` (`bg.muted`, segment track), `--accent` (`bg.emphasized`, hover and segment indicator), `--border` (`border`), `--input` (`border.emphasized`, checkbox and radio edges).
- Inputs → `--input-background` (`bg.muted`) and `--input-border: transparent` for the `subtle` variant; drop both for `outline` inputs.
- To make a sibling theme (blue, purple, ...), copy `src/ChakraUiTheme/palette.css` and swap the brand values from `tokens/colors.ts` / `semantic-tokens/colors.ts`.

## Rules

Same as the Shadcn kit. Additionally: an override file **replaces** the base kit's file of the same path, so it must carry every key the base file defined (for example `ShadcnBareTextBox` in `TextBox.xaml`, `PopupBorder`, `ShadcnFocusVisual` and all metric keys in `Common.xaml`, `ShadcnLogoTile` in `Views/Sidebar.xaml`). Build output lists each override (`Chakra overrides ...`).
