# Hexfall: creative brief

Ambition: **Showcase**. Planetfall's interface is a game's own sci-fi language (cut-corner navy glass, brass action plates, orange pointers), not a clean system. Written after [`RESEARCH.md`](RESEARCH.md); decided before any XAML.

## 1. Source DNA

| Trait | Evidence (RESEARCH.md) | Lands on |
|-------|------------------------|----------|
| Shape: cut-corner navy glass in a 1px steel-cyan frame, crowned by a riveted gunmetal cap with three lamps | Options, Pause, Codex | Settings title band, metadata pane, group boxes, popups, tooltips |
| Light: two button species, cool outline plates and one warm brass plate that lights a yellow rim | Options (OK), Research | `Button` vs Play and default buttons |
| Colour: orange is the pointer (square bullets, `//` slashes, dropdown arrows, check marks) on a cyan-navy field | Codex, Options | List bullets, headings, check box, combo arrow, tree selection |
| Type: wide caps headings with a tiny tracked-out caps label above data, white body | Options, Planet scan | Title band, buttons, tabs, metadata labels, game title |
| Motion/targeting: thin hex rings and corner brackets locking onto a target, faint radar rings behind the title | World map, Title screen | Cover hover, Play hover, empty game page |

## 2. Game element map

| Source element | Playnite surface | How | Built |
|----------------|------------------|-----|-------|
| Options cap bar with lamps | Settings title band, metadata pane top | Gunmetal strip, centre notch, three lamps (amber, white, amber); the lamps light on focus within the window | Yes |
| Menu button (cool outline plate) | `Button`, `ToggleButton`, `RepeatButton` | `pf-plate`, 1px `pf-line`, caps label; hover `pf-plate-hi` with a cyan edge | Yes |
| Brass OK / START GAME plate | Play, default button | Brass plate with double rim; hover lights `pf-brass-hot` rim and cream label | Yes |
| Options nav (green selected button) | Settings `TreeView` | 30px outline plates; selected: deep green fill, green edge, an amber square pointer | Yes |
| Codex list with amber bullets | Details list rows, `ListBox`, menu items | Amber square before the name; selected row warm slate plate | Yes |
| `//Heading` | Game title, section headings, group box headers, title band | Amber slash run before caps | Yes |
| Dropdown with amber triangle | `ComboBox` | Dark well, caps value, amber triangle (36px reserved) | Yes |
| Slider with end chevrons | `Slider`, `SliderEx` | Dark rail, cyan fill, plate thumb, chevron range buttons | Yes |
| Amber check | `CheckBox`, `RadioButton` | Dark square with cyan edge; amber check stamps in | Yes |
| Olive tab (MILITARY) | `TabControl` | Flat tab; current = olive fill, pale edge | Yes |
| Resource counter | Top bar cells | 34px plates; toggled = olive tab language; filter active = orange hexagon | Yes |
| Ability hotbar slot | Cover hover Play / Info buttons | 40px dark slots, no key number, cyan rim; Play slot turns brass | Yes |
| Unit slot card / minimap brackets | Cover hover and selected | Four corner brackets lock in (hover), brass hex pip (selected) | Yes |
| Planet scan table | Metadata pane | Tiny caps labels in `pf-mist`, values white, hairlines between rows | Yes |
| Loading arc / progress bar | `ProgressBar`, empty page | Thin outlined bar, cyan fill with bright end | Yes |
| Radar rings behind the title | Empty game page | Concentric hexagons that ping outward, the mark in the centre | Yes |
| Hostile marker red | Delete / close hover | `DangerBrush` | Yes |
| Research node card | Cover tile | Not built: a node's emblem and cost badge would compete with cover art | **No** |

## 3. Signature moments

| Moment | Trigger | Layers | In / out | Easing | Brush |
|--------|---------|--------|----------|--------|-------|
| **Hero: Play** | Hover | Four brackets lock in from 8px out, a hex ping rings out behind, the plate lifts to lit brass, a sheen crosses once, rim goes hot | 180ms / 320ms | CubicEase out | `PrimaryButtonGlowBrush` |
| Hero: Play press | Press | Plate drops to the dark brass wash, brackets close in by 3px, label dips 1px | 100ms / 180ms | CubicEase out | `PrimaryButtonPressedBackgroundBrush` |
| Cover hover | Hover | Corner brackets lock in from 6px out, a cyan hairline frame fades up | 180ms / 320ms | CubicEase out | `GridViewItemHoverBorderBrush` |
| Cover buttons | Cover hover | Two hotbar slots rise 8px, 50ms stagger; the Play slot turns brass on hover | 180ms / 180ms | CubicEase out, BackEase 0.25 | `TextBrush` |
| Sidebar selection | Select | Green plate, a cyan bar grows from the middle of the rail edge, amber pointer | 180ms | CubicEase out | `SidebarItemSelectedGlowBrush` |
| Tree row selection | Select | Green fill fades in as it slides from the left over the amber pointer | 240ms / 100ms | CubicEase out | `SelectedBrush` |
| Tab switch | Select | Olive fill and pale edge fade in | 180ms / 100ms | linear | `TabItemIndicatorBrush` |
| Check box | Check | Amber check stamps in | 100ms | linear | `CheckBoxCheckMarkBkBrush` |
| Search focus | Focus | Edge turns cyan, a lit rule fades in under the field | 120ms / 350ms | linear | `TopPanelRuleEndBrush` |

Ambient (sparse areas only): the empty page's three hex rings ping outward in a 3.2s loop (width, height, opacity only). The Play hex ring breathes in a 2.4s loop while hovered. Nothing moves on lists or covers at rest.

## 4. Motion language

- Durations: fast 100ms, base 180ms, slow 320ms; ambient 3.2s.
- Easing personality: calm and precise, `CubicEase` EaseOut; `BackEase` 0.25 only on the cover buttons.
- Entrance direction: from above or locking inward (brackets); never from below the screen's centre.
- Stagger: 50ms.
- Not measured from the source (no video); see RESEARCH.md -> Motion.

## 5. Branding system

- Name: **Hexfall** (the hex map plus the fall in Planetfall; abstract, not the game's name). Also considered: Dolos, Vanguard Light, Cosmite.
- Mark: a hexagon ring broken at the top-right with a shard dropping out of the gap (`art/mark.svg`, `IconMainMenu`, empty page, tile). No spire, no owner mark.
- Title band: 44px band, gunmetal cap strip with three lamps (static), amber `//` before a caps title, the mark ghosted at 7%, cyan bottom rule with a brass notch.
- Empty game page: the mark in cyan inside three hex rings that ping outward, `//` and the empty text in caps below.
- Type voice: Sora caps (SemiBold) for titles, buttons, tabs and headings; Segoe UI body; 10px tracked caps for data labels.
- Banner darkening colour: `pf-void` `#06131e`, the darkest navy of the options and HUD frames, so a darkened banner keeps the cool cast.
- Preview staging: Play hovered, a selected list row, a toggled view switch (details); the band with the cap and lamps, the tree with selected and hovered rows, one of every control (settings).

## 6. Restraint

- Library list and cover grid backgrounds: flat `pf-hull`. No texture, ring or tint.
- Metadata and descriptions: Segoe UI, mixed case, `pf-white` or `pf-mist` on navy.
- Rings, brackets and lamps appear on hover, selection, focus, the cap bars and the empty page only.
- Amber is a pointer, never a fill. Brass is Play and the default button only. Green is selection in the tree. Red is destructive.

## Review

Previews were reviewed before any XAML (read-only reviewer, `docs/themes/theme-preview-review.md`): first pass "fix blocking items first", then "ready for XAML" after the fixes below. Blocking items fixed: cut corners only on Play (now on the metadata pane, group card and brass buttons, drawn by a size-independent `ChamferTemplate`), label contrast on lit brass (sheen and shadow dropped from the staged frame, lit gradient starts at `pf-brass-mid`), the settings tree (240px, 20px indent, cyan expanders, reserved scroll lane), and the scaffold sample rows.

| Criterion | Score | Evidence |
|-----------|-------|----------|
| Recognition | 4 | Navy glass, brass plate, amber `//` and pointers, olive tab, gunmetal cap with lamps in both screenshots |
| Game element map | 4 | 17 of 18 rows built; research-node card dropped (table above) |
| Hero moment | 3 | End state rendered and the template checked in a WPF harness; the hover, press and ping were never watched running |
| Motion coherence | 4 | 100 / 180 / 320ms across Play, covers, sidebar, tree, tabs, check box and slider |
| Brand cohesion | 4 | Mark in the rail, title band, empty page and tile; one `//` heading mark and one pointer shape throughout |
| Restraint and legibility | 4 | Flat `pf-hull` list and grid; the hex lattice sprite exists but is not placed behind any list |

**Nothing was run in Playnite** (the checks are the build, the validator, the WPF regression tests and a 32-bit WPF render of every restyled control), which caps every live-behaviour score.
