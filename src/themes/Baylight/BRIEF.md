# Baylight 27 — creative brief

Mode: **Faithful** (macOS 27 Dark: the real tokens, shapes, states and motion; every moment below is a behaviour macOS itself has, none invented). Short working notes (`docs/themes/creative-direction.md`); the reviewed previews are the real spec.

## Candidate lenses

- **(a) Diegetic / Artifact — the Mac desktop:** menu bar across the top, games standing in a Dock along the bottom. Dropped: a bottom Dock fights Playnite's left rail and the details layout, and it would turn the library into a launcher gimmick.
- **(b) HUD / Telemetry — Control Center and widgets:** glass modules and circular gauges as the whole shell. Dropped: a grid of tiles reads like Fluence and Chakram, and it loses the window chrome that identifies a Mac.
- **(c) Title / Menu — a macOS 27 app window (chosen):** Playnite as a first-party Mac app in Dark mode (think Apple's own Games app): an edge-to-edge sidebar tinted by the bronze desktop, a uniform glass toolbar, traffic lights, grouped System Settings sections for the metadata, Dock behaviour on the covers and Siri's glow on Play. Against the last five themes (Wildhand, Starlane, Checkpost, Greenfield XP, Silver 98) it is the only dark OS shell, the only glass, and the only one whose colour comes from a desktop picture.

## Source DNA

| Trait | Where it lands |
|-------|----------------|
| **Liquid Glass, refined** (translucent plate, bright 1px upper rim, faint lower rim, wallpaper diffused behind; "uniform refraction") | top bar buttons and search, Play, More / Edit, menus, tooltips, the cover hover buttons, the empty-page Dock |
| **Golden Gate desktop picture** (bronze, gold and slate silk folds) seen through tinted glass | the 44px edge-to-edge rail (wallpaper under a dark tint), the empty page, the banner darkening colour |
| **Traffic lights** (red / yellow / green dots, glyphs on hover, grey when the window is inactive) | `MainWindowStyle` caption buttons, the Settings title band, the grid panel close plate turning red |
| **System Settings grouped form** (rounded sections on the window, caption left, value right, inset hairlines) | the metadata pane, `GroupBox`, the Settings page, the tree's inset pill selection |
| **Dock + Siri motion** (magnify, bounce while launching, running dot; the multicolor Siri edge glow) | cover hover, the launching / running indicator, Play hover |

## Element map (macOS part -> Playnite surface)

| macOS 27 part | Playnite surface |
|---------------|------------------|
| Traffic lights | main window caption buttons, Settings title band |
| Edge-to-edge sidebar with wallpaper tinting | 44px rail (`Sidebar.xaml`) |
| Sidebar selection: neutral inset pill, accent icon | current rail item, Settings tree selection |
| Uniform toolbar glass buttons | top bar items, filter toggle, view switches |
| Spotlight capsule | search box |
| Notification badge (red dot) | filter-active mark, notification count |
| Table selection: inset blue pill | details list rows, list view rows |
| Dock magnification + launch bounce + running dot | cover hover, launching / running indicator on covers, rows and Play |
| Siri AI edge glow | Play hover (hero) |
| System Settings grouped sections | metadata pane, `GroupBox`, settings page |
| Finder tags (colored dot + label) | metadata chips (`PropertyItemButton`) |
| Weather / Health range bar | scores (number + capsule gauge) |
| Segmented control | `TabControl` headers |
| Popup button with up/down chevrons | `ComboBox` |
| Checkbox, radio, capsule-knob slider, overlay scroller | the form controls |
| Menu with SF-style icons, ⌥ shortcuts, chevron submenus | every popup menu and dropdown list |
| Scroll edge effect (progressive blur) | hero banner fade |

## Signature levers

1. **Hero banner transition:** the scroll edge effect: the art keeps its upper half sharp, then a blurred copy takes over through a gradient mask and fades into the window, so the title sits on soft, darkened art (the Apple TV / Games app hero).
2. **Play button:** a Liquid Glass prominent button: deepened blue plate, upper specular rim and sheen, lower rim; hover lights the Siri glow (a rotating five-colour rim plus a soft halo); press squashes the glass (1.04 x 0.93) and springs back.
3. **Metadata container & group break:** System Settings sections: each `Meta*` group is its own rounded section (14px) on the window; the break between groups is a gap of window colour with the sections' corners rounded on both sides. Captions in secondary label colour on the left, values right-aligned.
4. **Chip & score silhouette:** Finder tags: capsule chips with a coloured tag dot (genres orange, categories green, features purple, tags blue, platforms grey). Scores: the number plus a 4px capsule range bar filled in the rating colour.
5. **Row & cover selection mark:** rows: macOS table selection, an inset blue pill (radius 8, 6px inset) with white text; covers: the macOS focus ring (accent ring just outside the rounded cover) settling in from 4% larger.
6. **28x28 close plate:** a glass circle with a thin x that turns into the red traffic light on hover.

## Moments

- **Hero:** Play hover = Siri glow: the iridescent rim starts rotating (3.2s a turn), the halo fades up behind the glass, the plate brightens; press squashes and springs.
- **Secondary:** cover hover = Dock magnification (1.07, spring) with a soft lift shadow; cover selection = focus ring settle; launching = Dock bounce on the cover and the row dot, running = the running dot breathing under a green frame; row hover pill fade and selection pill grow (0.96 -> 1); rail selection pill with the icon turning blue; tree selection pill; segmented tab slide; checkbox fill pop; slider glass knob stretch on drag; traffic-light glyphs appearing together; menu highlight snap.
- **Ambient:** none in lists. The empty page's Dock idles (the middle tile bounces every few seconds) only while visible.

## Motion

Three durations: fast 110ms (hover fills, menu highlight, glyph reveal), base 200ms (selection pills, focus ring, segmented slide), slow 360ms (magnification spring, glass squash release, sheet). One personality: macOS springs, `BackEase` (amplitude 0.2-0.35) on transforms and `CubicEase` out on opacity. Entrance direction: up (the Dock bounce, the sun in the mark). Stagger 60ms (cover Play then Info).

## Brand

Name **Baylight 27** (golden-hour light over a bay; echoes the release name without using it). Mark: a continuous-corner squircle holding a sun disc rising over two swells of water, drawn here (`art/mark.svg`), used as the main menu mark (hover: the sun rises and the water ripples; open: the sun sits up with a slow breathing glow ring), in the Settings title band beside the traffic lights, on the empty page's Dock and as the add-on tile. `GameBannerTintBrush` = `--silk-umber-deep`, the shadow fold of the desktop picture, so a darkened banner sinks into the wallpaper's own brown, not grey.

## Kept calm

Library lists, the cover grid and the metadata sections sit on the plain window colour; the wallpaper shows only through the rail and the empty page. No glow outside Play hover; no looping motion in lists except the running indicator.
