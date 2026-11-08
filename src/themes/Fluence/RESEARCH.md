# Fluence — research & sources

Unofficial theme inspired by Microsoft's Fluent 2 design system; not affiliated with or endorsed by Microsoft. Fluent 2 is cited below only as the source of the measured look.

## Sources

| What | Where |
|------|-------|
| Tokens | `@fluentui/react-theme` 9.2.2 (`@fluentui/tokens` 1.0.0-alpha.24), `webDarkTheme`, evaluated from the package |
| Components | Style hooks of `@fluentui/react-button`, `react-input`, `react-combobox` (Dropdown, Option), `react-menu` (MenuPopover, MenuItem), `react-tabs`, `react-checkbox`, `react-radio`, `react-slider`, `react-progress`, `react-tooltip`, `react-card`, `react-table` (TableRow), `react-tabster` (`createFocusOutlineStyle`) |
| Shell | Windows 11 / WinUI: NavigationView (LeftCompact), title bar, caption buttons, content layer (`OverlayCornerRadius` 8px) |
| Icons | Fluent UI System Icons, `@fluentui/svg-icons` 1.1.342 (MIT, `info/LICENSE-fluentui-system-icons.txt`): Regular 20px, `checkmark_16_filled` |

## Motion

How Fluent 2 (web, Fluent UI React v9) moves, from `microsoft/fluentui` (raw GitHub): `packages/tokens/src/global/durations.ts`, `curves.ts`, `alias/darkColor.ts`, `react-button/.../useButtonStyles.styles.ts`.

| Source | What it says |
|--------|--------------|
| `durations.ts` | UltraFast 50, Faster 100, Fast 150, Normal 200, Gentle 250, Slow 300, Slower 400, UltraSlow 500 ms |
| `curves.ts` | EasyEase (0.33, 0, 0.67, 1), EasyEaseMax (0.8, 0, 0.2, 1), DecelerateMid (0, 0, 0, 1), AccelerateMid (1, 0, 1, 1), plus Min/Max variants and linear |
| `useButtonStyles.styles.ts` | root transitions background, border, color over durationFaster on curveEasyEase; hover and pressed only change those colors (default: Background1Hover / Pressed; primary: BrandBackgroundHover / Pressed); no transform or scale on press |
| `alias/darkColor.ts` | colorBrandBackground = brand[70], Hover = brand[80], Pressed = brand[40]; colorSubtleBackgroundHover = grey[22], Pressed = grey[18]; colorNeutralBackground1Pressed = grey[12] |

Numbers used: Play hover and pressed = their own layers fading in 100ms on EasyEase (pressed fades with `colorBrandBackgroundPressed`, `#0c3b5e`: brand[40] taken from the ramp that the tokens already follow, brand[70] `#115ea3` and brand[80] `#0f6cbd`; added to `tokens.css` and `Constants.template.xaml` as `PrimaryButtonPressedBackgroundBrush`); cover ring fades in 100ms; subtle tile buttons fade `colorSubtleBackgroundHover` in 100ms; cover scrim and buttons enter over 200ms on DecelerateMid with a 6px rise and 40ms stagger, leave over 100ms on AccelerateMid (Fluent's guidance is decelerate for arriving, accelerate for leaving; the rise and the exact curves for a hover overlay are assumptions); the empty page fades in over 250ms (durationGentle, DecelerateMid).

Not drawn: card hover shadow, reveal highlight (Fluent 1), press scale (Fluent 2 web has none). The pressed tile uses `SelectedBrush` (colorSubtleBackgroundSelected, grey[20]) because `colorSubtleBackgroundPressed` (grey[18], `#2e2e2e`) has no vocabulary key; the two greys differ by two steps.

Could not verify: grey[18] / brand[40] hex values were derived from the ramp, not read from a palette file; nothing was run in Playnite.
