# HTML previews - how to build them

`art/preview-details.html` and `art/preview-settings.html` are the only source of the release screenshots (`art/details.png`, `art/settings.png`). They are 1280x720 replicas of the theme, not Playnite captures. `new-theme.ps1` writes generic placeholders (indigo, Segoe UI, 8px radius); **every theme must replace them** with a replica of its own look. Netrunner, Payload and Tumbleweed are the worked examples: read one before writing.

## Build order

1. Finish the reference research first (`src/<theme>/AGENTS.md` -> Sources: colors, type, chrome and selection styles, icons). The preview is written from those notes, not from the scaffold.
2. Put the colors in `src/tokens.css` (they drive the XAML too), then write the preview against them.
3. Style the shell the way the theme's XAML does, then add what makes the source recognisable.
4. `.\scripts\take-screenshots.ps1 -Extension <key>`, look at both PNGs, fix, repeat.

## Colors: tokens, not hex

- `render-theme-preview.mjs` injects the theme's `src/tokens.css` into the page (`:root` with `.dark` overrides applied, same as the build). Use `var(--token)` with the token's own name (`var(--cp-row-selected)`), not a hex copy.
- Local aliases are fine (`--bg: var(--cp-page)`) but an alias must not reuse a token's name.
- Gradients, glows and art placeholders may use literal colors that are not tokens (a banner gradient). Keep them few.
- After editing tokens or XAML colors: `.\scripts\validate-extension.ps1 -Extension <key>` lists preview colors that are not tokens (drift), then re-render. `node scripts/preview-tokens.mjs link src/themes/<Name>` rewrites hex that equals a token into `var(--token)`.
- Tokens given as `oklch()`, `hsl()` or `rgb()` work; the scripts resolve them in Chromium.

## Match the real UI

- Page size is `body { width: 1280px; height: 720px; overflow: hidden }`, the renderer viewport is the same. Nothing may be cut off at the edges: check the bottom (footers, panels) and the right.
- Use the theme's real values from XAML and tokens: sidebar rail 44px wide, 44x40 items, 16px glyphs (AGENTS.md mandate), corner radii, font sizes, row heights, control sizes. Do not invent new ones.
- Same shell as the theme: sidebar on the left, top panel, game list or grid, game page layout per `src/themes/AGENTS.md` (screenshots left above the description, metadata right, banner and title scrim).
- Font stack copies the theme's `FontFamily` keys. A font Playnite users may not have is fine as the first entry as long as the fallbacks match XAML. Say in AGENTS.md -> Previews which face stands in for which.
- Use the theme's own icon set, rendered from the same source as `art/` icons (SVG inline or the generated glyphs), not emoji or unicode stand-ins where a real glyph exists. Unicode glyphs are acceptable only where the theme itself uses text glyphs.
- Selection, hover, focus, checked and disabled looks are copied from the control templates (edge bars, fills, outlines), not guessed. The settings preview must show a checked box, a radio, a slider, a text box, a combo box and a primary and plain button in the theme's real states.
- Corner radii follow the AGENTS.md mandate: never `CornerRadiusFull` on non-square elements; capsule shapes are not used unless the source UI has them and the XAML draws them.

## Layout: copy the real structure

The previews replicate two real Playnite screens. Tag the regions below with `data-part` so `scripts/preview-layout.mjs` (run by `validate-extension.ps1`, advisory) can check them in Chromium.

### Details preview (Game Details view)

| Region | `data-part` | Rule |
|--------|-------------|------|
| Sidebar | `sidebar` | Left, compact: 44px wide, 44x40 items, 16px glyphs. Main menu button at its top: `PART_ElemMainMenu` |
| Top panel | `top-panel` | Parts below, in the order **this theme's `src/Views/TopPanel.xaml`** draws them |
| Search box | `PART_TextMainSearch` | |
| View switches, group, sort, view settings | `PART_PanelMainItems` | **Icons only**: details, grid, list (`IconDetailsView`, `IconGridView`, `IconListView`), group, sort. Never words like "Grid" or "Details" |
| Filter toggle | `PART_ToggleFilter` | Icon |
| Notifications toggle | `PART_ToggleNotifications` | Icon |
| Game list | `game-list` | **Left of the game page**, below the top panel: one row per game (icon plate + name), one row selected the way the theme's `DetailsViewItemStyle` draws it |
| Game page | `game-page` | Banner, title and actions, then screenshots + description left and the metadata pane right (`src/themes/AGENTS.md` -> Game page) |
| Metadata pane | `metadata` | One pane, groups in the order of Metadata pane in `src/themes/AGENTS.md`, caption column beside the value |

Top panel order: open `src/Views/TopPanel.xaml`. The `DockPanel` that holds `PART_TextMainSearch` decides it: children docked Left run left to right in document order, children docked Right run right to left (the first one at the window edge). Playnite Default is all Left: menu, search, main items, filter, notifications, plugin items. Themes change it (Ancient puts search at the far right, Primer docks everything right, ChakraUi puts search after the main items), so read the file, do not copy another theme's bar. `PART_ElemMainMenu` lives in the sidebar while the sidebar is visible. `PART_PanelMainPluginItems` may be left out.

Sizes in the top bar (height, button size, gaps, search width) come from the same file and the theme's `Common.xaml` keys.

### Settings preview (Settings window)

Playnite's Settings is a standard window (`SettingsWindow.xaml`, 800x620 minimum), not a full-screen page and not a tab strip. Draw it as that window, centered on a dark backdrop at about 920x680 so it fits the 1280x720 frame. Nothing may touch or pass the frame edge.

| Region | `data-part` | Rule |
|--------|-------------|------|
| Window | `settings-window` | Title bar ("Settings", close button) the way the theme draws `StandardWindowStyle` |
| Section tree | `settings-nav` | **Left**, at least 160px wide, a `TreeView`: General, Appearance (expanded: General, Advanced, Details View, Grid View, List View, Layout, Top panel), Search, Updating, Metadata, Sorting, Scripts, Auto Close Clients, Import Exclusion List, Backup, For developers, Input, Advanced (Performance). One node selected, drawn as the theme's `TreeViewItem` |
| Section page | `settings-content` | Right of the tree, 1px separators; the controls showcase: checked and unchecked check box, radio pair, slider, text box, combo box, primary and plain buttons |
| Bottom bar | `settings-buttons` | Full width under tree and page, 1px top rule. "* Requires restart to apply" on the left; **Save, then Cancel** on the right (Cancel right-most) |

Labels are Playnite's English strings (`LocSource.xaml`), not invented ones.

### Keep in the frame

Every tagged region stays inside 1280x720. A footer or panel that runs past the bottom, or a dialog taller than 720, is a distortion, fix it before rendering. The linter reports regions that leave the frame.

## Keep it unique

- Pull 3 to 5 signature motifs out of the source material and draw each one: Netrunner's scanline haze, 2px red edge on selected rows, uppercase condensed headings with a short underline, clipped button corners and a footer note. Name them in AGENTS.md -> Previews.
- Do not reuse another theme's preview as a base and recolor it. Start from the scaffold shell or from scratch.
- No leftover scaffold content: the indigo `#6366f1`, "Eldritch Void" sample data copied verbatim in every theme, the generic header comment. Give the sample game, metadata and settings labels that suit the theme.
- Unofficial replicas of a game or brand: no logos, no game assets; say so in the footer note, as Netrunner does.

## Checklist before finishing

- [ ] Written after the Sources research, motifs listed in AGENTS.md -> Previews
- [ ] Colors are `var(--token)`; `validate-extension.ps1` shows no unexplained drift
- [ ] 1280x720, nothing clipped, both PNGs looked at
- [ ] `data-part` tags in place and `validate-extension.ps1` shows `layout ok` for both previews (top bar order from `TopPanel.xaml`, icon-only view switches, game list, settings window)
- [ ] Real sizes, fonts, icons and control states, not scaffold defaults
- [ ] Re-rendered after the last token or XAML change
