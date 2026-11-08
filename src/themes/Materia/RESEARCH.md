# Materia — research & sources

Unofficial theme, inspired by Google's Material Design and the MUI Material UI library. Not affiliated with, endorsed by or sponsored by Google or MUI; names are nominative references to the sources below.

## Sources

| What | Where |
|------|-------|
| Tokens | `mui/material-ui` 9.4 `packages/mui-material/src/styles` (`createPalette.js`, `createThemeWithVars.js`, `getOverlayAlpha.ts`, `createTypography.js`) and `colors/` |
| Components | same package: AppBar, Toolbar, Drawer, ListItemButton, IconButton, Badge, Button, ToggleButton, FilledInput, Select, Menu, MenuItem, Divider, Card, CardHeader, Checkbox, Radio, Slider, LinearProgress, Tooltip, Tab / Tabs |
| Icons | Material Icons, filled (`@material-design-icons/svg` 0.14.15, Apache-2.0, `info/LICENSE-material-icons.txt`), the set `@mui/icons-material` wraps |

## Motion

How Material UI moves, from `mui/material-ui` `packages/mui-material/src` (raw GitHub): `ButtonBase/TouchRipple.js`, `Button/Button.js`, `styles/createTransitions.js`.

| Source | What it says |
|--------|--------------|
| `createTransitions.js` | easeInOut (0.4, 0, 0.2, 1), easeOut (0, 0, 0.2, 1), easeIn (0.4, 0, 1, 1), sharp (0.4, 0, 0.6, 1); shortest 150, shorter 200, short 250, standard 300, complex 375, enteringScreen 225, leavingScreen 195 ms |
| `Button.js` | transitions background-color, box-shadow, border-color, color over duration.short (250ms); contained: hover = primary.dark, elevation 2 to 4, `:active` elevation 8 (background unchanged) |
| `TouchRipple.js` | DURATION 550ms on easeInOut; enter keyframe scale 0 to 1 and opacity 0.1 to 0.3; ripple opacity 0.3 when visible; exit opacity 1 to 0; pulsate for focus |

Numbers used: Play hover = the primary.dark plate fades in over 250ms on easeInOut; press = a centered ripple (MUI starts it at the pointer; XAML has no pointer position here): an ellipse inscribed in the button scaled 0 to 1.5, clipped to the button, 550ms, opacity 0.1 to 0.3, label color, fading out over 550ms on release while it keeps growing; cover hover = the outline and a text-color state layer at 4 percent (CardActionArea's focusHighlight at hoverOpacity) fading in 250ms; cover buttons = IconButton: action.hover state layer 150ms (duration.shortest), centered ripple on press, entering like a Fab in a Zoom (scale from 0, here 0.01, to 1) over 225ms on easeOut, leaving over 195ms on sharp, 50ms between the two, scrim at 0.67 over the same times. Empty page = Material's empty pattern (a large icon and a secondary-text line; MUI has no EmptyState component) fading in over 225ms.

Not drawn: elevation changes (no shadows), pointer-origin ripple, focus pulsate, letter spacing. The ripple on a wide button is an ellipse, not a circle.

Could not verify: that Zoom for a Fab uses exactly scale(0) with no fade (the opacity fade here is a safety margin); the ripple clip at rounded corners (rect clip, 4px radius); the pressed-ripple and hover plate in Playnite. Nothing was run in Playnite.
