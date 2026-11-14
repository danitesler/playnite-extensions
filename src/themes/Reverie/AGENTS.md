# Reverie — theme notes

## What this is
An unofficial Dreams (2020)-inspired Playnite Desktop theme, API 2.10.0, modeled on the game's My Preferences screen over the original deep violet backgrounds: near-black maroon capsule plates with an orange rim and gold label, cream selected plates, lilac-rimmed panels, bead sliders and pink/orange orbital linework. No game assets or logos. Shared anatomy: [../AGENTS.md](../AGENTS.md).

## Sources
[RESEARCH.md](RESEARCH.md) records captures, sampled colors, motion observations and adaptations. Playnite Default 10.60 supplies control behavior. The theme is standalone.

## Tokens
| Tokens | Roles |
|---|---|
| dream-night / page / surface / input | Shell and rail, window and library page, panels and metadata, fields |
| dream-plate / plateHover / ember | ButtonBackgroundBrush, its hover, and NormalBorderBrush (the orange rim of every plate and field) |
| dream-gold | GlyphBrush: label and glyph colour on dark plates |
| dream-cream / creamHover / creamPress | PrimaryButtonBackgroundBrush family: Play, selected tab, tree row, list row, rail item, toggled tool, checked bead, slider fill, window title |
| dream-pink / cyan | HighlightGlyphBrush and DataChangeNotifBrush: split fringe on plates, orbital art, filter mark, FocusBrush (cyan) |
| dream-text / muted / ink | Body, secondary labels, text on cream |
| dream-rim | Panel rim, popup border, dotted dividers |
| dream-scroll / track | ScrollBarThumbBrush and the dark scroll pill |

Segoe UI body, Segoe UI Black headings and window title, Semibold labels on plates. Radii: 20px controls (a true capsule at the 32px and 40px control heights, since WPF clamps the radius to half the height), 6px small, 10px panels and metadata. Effect masks are white RGB with alpha, colored through dynamic brushes.

## Component spacing
32px forms, 28px filter controls and preset actions. Button padding 18,5; input padding 14,5. Sidebar 44px, 44×40 items, 16px icons. Toolbar 52px with 36px tools. Settings title band 44px; tree rows 30px, dialog tree 250px. Play 160×40, More/Edit 40×40.

## Shell
Search → filter → sorting at the left. Sorting is explicitly ordered. Independent magnifier persists through focus, typing and blur. Caption buttons have full hit plates. Grid details width is capped by the viewport.

## Components
| Area | Treatment |
|---|---|
| Buttons | Maroon capsule, gold label, 1.5px orange rim, pink/cyan split fringe and a blurred glow that brightens on hover; pressed fills cream with ink text |
| Play | Cream capsule, orange rim and halo, split-color fringe, orbiting mote on hover and independent press layer |
| Tabs | Same capsule as buttons; selected is cream with a glow |
| Covers | Static cream selection ring; separate fading orange hover ring |
| Cover actions | Play is a cream circle, Info a maroon circle with a gold glyph (both orange rim, 60ms entrance stagger, warm halo, rippling chromatic rim) |
| Game pages | Heavy cream title over a soft orange glow, lilac-rimmed metadata pane, chips as maroon capsules with an orange rim, round More and Edit plates |
| Library rows, rail, top bar | Capsule rows (selected cream with ink text, hover maroon plate); 32px circular rail plates; toggled tools cream |
| Fields | Dark input capsules with the orange rim; check boxes and radios are 20px beads, cream when on |
| Slider | Orange line, cream filled part, bead ends, 22px cream thumb with a glowing ring and a small arrows mark |
| Scroll bars | Grey 8px thumb in a dark pill track |
| Empty page | Original orbital seed, 3s opacity breath while empty |
| Settings | Flat page with an orbital sun behind a heavy cream title with an orange glow; tree rows are bare muted text (30px, body-size Semibold); hover fades in a maroon capsule with an orange rim and the lens wobble, selected is a cream capsule with a bead and glow, and only the focused row (not its parents) shows the cyan focus ring; the title sun is clipped to the 56px band; dropdowns keep 16px left and 38px right room, fields 14-18px |
| Statistics | Content-sized rounded GroupBoxes: violet card, lilac rim, heavy white heading |
| Metadata | Rounded pane with body-size aligned labels, 4px row margins and six collapsing groups |
| Running game (`RunningIndicatorBrush` = `dream-spark`) | A dream spark in mint, slow and soft. **Launching** (2.6s loop, 1.9s travel, `SineEase`-like spline): a wide, very soft cloud (0.45 each side, symmetric mask) drifts across the row, cover or capsule, the orbit ring draws itself as an arc (`StrokeDashOffset` on a dashed ring, starting at the top) while the mote makes two turns and lands. **Running:** the ring stays whole, the mote takes one slow turn per 3.6s and frame, tint and orbit breathe 0.72 to 1. Capsule: mint plate under a faint `ScrimBrush` layer (0.05-0.14), brown ink label (6.5:1 worst); Cancel only on RUNNING + hover of the button (`Self`); the hover and press plates lift while launching or running. Plate scan, scrim and hover dim are siblings of `PlayFill` in the capsule's radius. |

Generate both game overviews:

    node src/themes/Reverie/art/gen-overviews.mjs src/themes/Reverie/src/Views

The generator owns Steam scope and loading reset, responsive metadata, banner floors, null-selection states and both close placements. At 119px the inline close is scroll-compensated; at 120px or with no selection the corner close stays visible.

The toolbar and popup use the same original glyphs. Regenerate menu images with pwsh -STA -File art/render-menu-icons.ps1 from this theme directory.

## Hover motion
Dreams outlines wobble and split like a cracked lens, so every plate shares one hover language: a cyan and a pink fringe (`FringeC`, `FringeP`) sit under the rim, then while hovered they fade up, blur about 1px, and loop out of phase (1.7s and 1.9s) by rotating under 1 degree and drifting 1 to 2px in opposite directions; the glow behind plates breathes between two blur radii (8 to 12, Play and cover buttons 10 to 15). Leaving starts a 0.25s settle storyboard on the same properties, which replaces the loop and eases everything back. The loop only starts when Windows `ClientAreaAnimation` is on (reduced motion keeps the static fringe and the fade). Applies to buttons (including More, Edit), Play, cover Play/Info, tabs, Settings tree rows, library rows, cover hover rings, rail items and top-bar tools. Loops animate fringe transforms and margins only; opacity and the blur effect come from trigger setters so a selected row keeps its look.

## Effects
Run art/generate-fx.mjs to regenerate masks (bloom, orbit, haze); its optional contact-sheet path must be scratch. Finite interactive storyboards replace prior clocks. Cover entrances target the GameListItem template; button hover targets its own template. The dedicated ReverieStoryboardRegressionTests.ps1 checks every template's animation targets and runs the button templates natively. The empty loop honors Windows ClientAreaAnimation at template creation and stops when selection returns. No moving library background.

## Previews
Both 1280×720 HTML previews use theme tokens and original floating-garden illustrations. Segoe UI uses the bundled Selawik stand-in. Sample games are illustrative; actual artwork comes from the user's library.

    .\scripts\take-screenshots.ps1 -Extension reverie -KeepLegacy

## Deviations
Dreams' controller cursor, floating categories and world are adapted to desktop controls. Exact font and timing are not claimed as official; Dreams' rounded display face is not bundled, so Segoe UI Black stands in for headings. WPF has no letter spacing or text transform, so the wide-tracked uppercase labels are not reproduced (the repo's Settings rule asks for body-size, non-caps tree rows anyway). Original art replaces proprietary assets.

## Verification
Package validation, preview token/layout checks, WPF metadata breakpoints, details/grid banner layouts, close actions, Steam isolation, toolbar order, persistent search glyphs and animation scope were checked. Deployed; startup log checked after fixing the animation scope.

## Not verified yet
The wobble loops were run in native WPF with the hover triggers forced on and two frames compared (they differ); real mouse hover, 125%/150% scaling and cost with a large grid are not checked. Live visual inspection of Settings, Statistics, the edit dialog tabs, ThemeModifier recoloring, and hover artifacts at 125%/150% scaling. The capsule redesign was rendered through native WPF with the real templates (tree, tabs, buttons, check, radio, slider, group box, text box, combo box) and compared against the HTML previews; the Settings window chrome (title glow, orbital sun, caption plates), the title glow on the game pages and the Info/Play cover buttons are only parse- and layout-checked. The app starts minimized and the computer-use surface could not attach to that window. Native WPF checks and HTML previews do not replace these checks.
