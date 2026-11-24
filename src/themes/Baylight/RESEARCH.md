# Baylight 27 — research & sources

Baylight 27 is an unofficial theme inspired by **macOS 27 "Golden Gate"** (announced at WWDC, June 2026; Apple's macOS 27 UI kit for Figma updated 2026-10-28) in its **Dark** appearance. No Apple assets are used: no SF Pro, no SF Symbols, no wallpaper image, no logo. Every glyph, the mark and the wallpaper are drawn here; colors are sampled from Apple's public pages or taken from the published system palette.

## Sources

| What | Where (package, version, file) |
|------|--------------------------------|
| Product page | apple.com/os/macos (viewed 2026-11-24 in the browser pane): "More refined design with enhanced Liquid Glass"; "Uniform toolbars, edge-to-edge sidebars, and updated window shapes and menu bar icons"; a slider that moves Liquid Glass "from ultraclear to fully tinted"; Siri AI as the headline feature |
| UI kit | developer.apple.com/design/resources, macOS 27 UI Kit (Figma, Sketch). Thumbnail `Thumbnail-UIKit-macOS27_2x.png` (2046x1248) sampled with a canvas in the browser, nothing downloaded. Figma community file 1651309434229735362 "macOS 27" by Apple: components, text styles, color styles, materials, vibrancy; licensed under the License Agreement for Apple Design Resources, so nothing from it is copied |
| Press | MacRumors (2026-06-09, corners less dramatically rounded than Tahoe), 9to5Mac (2026-09-22, one glass opacity control covering Dock, widgets and window chrome), MacStories review (toolbar buttons stay visible at full transparency; toolbar handling made consistent across apps) |
| Tokens | Apple system palette, Dark appearance (macOS / iOS 26-27 values), plus colors sampled from the kit thumbnail and the product page |
| Components | Rebuilt from the kit thumbnail and the product page captures (grouped form rows, toggle, stepper, popup button, text field, push button, radio pair, sidebar list, glass toolbar capsule) |
| Icons | Drawn for this theme (`art/icons.py`, `art/menu-icons.json`): monoline, rounded caps and joins in the manner of SF Symbols, not copied from them. No icon license needed |
| Fonts | SF Pro is not redistributable. Stand-in: Segoe UI Variable Text / Display (ships with Windows 11; WPF exposes Light, 350, Regular, SemiBold, Bold), falling back to Segoe UI. Previews draw it with Selawik |

## Palette

Sampled (canvas on the kit thumbnail, 2046x1248):

| Sample | Hex | Use |
|--------|-----|-----|
| Wallpaper, upper left fold | `#7C5B42` | `--silk-bronze` |
| Wallpaper, lit fold | `#A37F51` | `--silk-gold` |
| Wallpaper, shadow fold | `#544643` / `#6E5746` | `--silk-umber` |
| Wallpaper, lower band | `#4F4F68` | `--silk-slate` |
| Wallpaper, lower right mist | `#AAAEB0` | `--silk-mist` |
| Toggle on | `#0087FF` | the kit's light accent (Apple's 2025+ systemBlue `#0088FF`) |
| Grouped section on white window | `#F7F7F7` | light only; the dark section step is `--section` |

Dark system palette (Apple's published dark values): blue `#0091FF`, red `#FF453A`, orange `#FF9F0A`, yellow `#FFD60A`, green `#30D158`, mint `#63E6E2`, teal `#40C8E0`, cyan `#64D2FF`, indigo `#5E5CE6`, purple `#BF5AF2`, pink `#FF375F`. Label 85% white, secondary label 55%, tertiary 25%, separator 10% white. Selected content background `#0058D0`. Window traffic lights `#FF5F57` / `#FEBC2E` / `#28C840` with rims `#E0443E` / `#DEA123` / `#1AAB29`; inactive windows draw them `#3D3B3A`.

Contrast fixes (WCAG 4.5:1 for labels): white on `#0091FF` is 3.2:1, so Play and selected rows use `--blue-deep` `#0A6CDF` (5.0:1); white on `#FF453A` is 3.4:1, so danger plates use `--red-deep` `#D7322A` (4.8:1) and the red Exit label on the menu uses `--red-lit` `#FF6961` (5.0:1). Ink `#0B2A14` on running green `#30D158` is 7.5:1.

Wallpaper tinting: macOS tints window backgrounds with the desktop picture. Under the bronze Golden Gate wallpaper the dark window reads very slightly warm, so the neutral `#1E1E1E` becomes `#1F1D1C` and the steps follow.

## Type

SF Pro scale (macOS points): Large Title 26 bold, Title 1 22, Title 2 17, Title 3 15 semibold, Headline 13 bold, Body 13, Callout 12, Subheadline 11, Footnote 10. Playnite runs a larger body, so the theme uses 12 / 14 / 15 / 20 / 28 with Display Bold 30 for the game title (the Apple TV and Games app hero title).

## Shapes

- Window corners: "less dramatically rounded" than Tahoe and the same in every app. Popovers and menus about 12-14px; grouped sections 12-14px; regular controls about 6pt at 22pt height in the kit (ratio 0.27), large controls near capsule.
- Liquid Glass capsule (product page toolbar: trash, folder, reply): a translucent plate with a bright 1px upper rim, a fainter lower rim and the wallpaper diffused behind it. Uniform toolbar items are separate glass circles or capsules.
- Sidebar: edge-to-edge (Tahoe floated it as an inset glass panel); selection is an inset neutral pill with the icon in the accent.
- Grouped form (System Settings, kit right panel): a rounded section on the window, rows 36-40pt, caption left, control right, inset hairlines between rows.
- Popup button: value plus a stacked up/down chevron pair. Stepper: a capsule with up/down chevrons. Toggle: a blue capsule with a white knob. Slider (Tahoe and later): thin track, capsule glass knob.

## Motion observed (macOS 26-27)

- Springs, not linear fades: Liquid Glass buttons stretch toward the pointer and squash on press, then settle.
- Dock: magnification on hover (icons grow toward the pointer), a launching app bounces until it opens, a running app shows a small dot under its icon.
- Siri AI: a multicolor glow (orange, pink, purple, blue, cyan) travels around the edge of the screen while Siri listens.
- Menus open in about 100ms with a fade; the highlight follows the pointer with no visible transition.
- Focus ring: the accent color drawn just outside the control, animating in from slightly larger.
