# Chakra theme kit — agent notes

## What this is

Chakra UI v3 component styles for Playnite desktop themes. It **extends the Shadcn kit** (`kit.json` → `"extends": "src/ThemeKits/Shadcn"`): the build copies every Shadcn overlay file first, then this kit's files on top, and renders the Shadcn kit's `Constants.template.xaml`. So this folder only holds what Chakra draws differently.

Read **`src/ThemeKits/Shadcn/AGENTS.md`** first: Playnite's loading rules, the token contract, and the placeholder syntax all apply unchanged. The `Shadcn*` resource keys are the shared token vocabulary; a Chakra palette maps Chakra's semantic tokens onto them (see `src/ChakraUiTheme/palette.css`).

Current consumers: **Chakra UI Theme** (`src/ChakraUiTheme`).

## What differs from the Shadcn kit

Source: `chakra-ui/chakra-ui` `packages/react/src/theme` (`recipes/button.ts`, `recipes/input.ts`, `recipes/tabs.ts`, `preset-base.ts` `createFocusRing`).

| File | Chakra behavior |
|------|-----------------|
| `Common.xaml` | `ShadcnFocusVisual` = `focusVisibleRing="outside"`: 2px solid `colorPalette.focusRing`, 2px offset (Shadcn: 3px ring/50 halo). Repeats `PopupBorder` because the whole file is replaced. |
| `DefaultControls/Button.xaml` | Borderless. Regular buttons = gray `subtle` variant (secondary fill, accent on hover); `IsDefault` = `solid` variant (primary, primary/90 on hover). |
| `DefaultControls/ToggleButton.xaml` | Off = gray `subtle`; on = brand `subtle` (`ShadcnPrimarySubtle*`). |
| `DefaultControls/TextBox.xaml`, `PasswordBox.xaml` | `outline` input: transparent fill; focus = `focusVisibleRing="inside"` (2px ring-colored edge over the control, no outer halo). Keeps `ShadcnBareTextBox`. |
| `DefaultControls/TabControl.xaml` | `line` variant: 1px border edge on the list, muted triggers, 2px primary indicator overlapping the edge by 1px. |

Everything else (select, checkbox, radio, slider, progress, menus, tooltip, scrollbars, sidebar, top panel, cover tiles) is inherited from the Shadcn kit and follows the palette. Chakra's shapes there are close enough (radius comes from `--radius`).

## Palette notes for Chakra themes

- `--radius: 0.375rem` makes the kit scale line up with Chakra's semantic radii: sm = `l1` (2px), md = `l2` (4px), lg = `l3` (6px).
- Brand palette → `--primary` (`<color>.solid`), `--primary-foreground` (`.contrast`), `--primary-subtle` / `--primary-subtle-foreground` (`.subtle` / `.fg`), `--ring` (`.focusRing`), and optionally `--sidebar-accent*` for a tinted selected sidebar item.
- Gray scale → `--secondary` (`gray.subtle`, button fill), `--accent` (`bg.emphasized`, hover), `--border` (`border`), `--input` (`border.emphasized`, control edges).
- To make a sibling theme (blue, purple, ...), copy `src/ChakraUiTheme/palette.css` and swap the brand values from `tokens/colors.ts` / `semantic-tokens/colors.ts`.

## Rules

Same as the Shadcn kit. Additionally: an override file **replaces** the base kit's file of the same path, so it must carry every key the base file defined (for example `ShadcnBareTextBox` in `TextBox.xaml`, `PopupBorder` in `Common.xaml`). Build output lists each override (`Chakra overrides ...`).
