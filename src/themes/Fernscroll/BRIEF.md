# Fernscroll — creative brief

Mode: **Showcase**. Unofficial storybook parchment theme inspired by *Snufkin: Melody of Moominvalley* (see [`RESEARCH.md`](RESEARCH.md)).

## 1. Source DNA (5 traits -> where each lands)

| Trait | Evidence (`RESEARCH.md`) | Lands on |
|---|---|---|
| **Warm Nordic Watercolor Parchment & Paper Tooth** | `[1]`, `[5]`, `[6]`, `[7]` (`#edebd6`–`#e3e0ca`) | `WindowBackgourndBrush`, `ContentBackgroundBrush`, `GameOverviewBackgroundBrush`, `TopPanel`, `Sidebar` rail, `StandardWindowStyle` body (`paper-grain.png` at <= 3.5% on sparse canvas) |
| **Botanical Curly Scroll Flourishes (`~o Title o~`) & Tapered Ink Rules** | `[1]`, `[2]`, `[4]`, `[6]`, `[7]` | Active `TabControl` tabs, `GroupBox` & overview section headings, `StandardWindowStyle` title band, game title divider (`taper-rule.png`), `ScrollBarThumb` tapered ink needle |
| **Dark Plum-Espresso Plaques (`#3b2c2f`) with Inset Cream Hairline & Print Speckles** | `[3]` (`SAVE #1`), `[6]` (`HARMONICA`), `[7]` (`SAVING SNIFF`) | Right-hand **Metadata Quest Card** (`ParchmentBrush`), `SelectedBrush` / `ListItemSelectedBrush` rows, secondary `Button` (`More`, `Edit`, `Cancel`), `ToolTip`, double-framed selected cover tile |
| **Snufkin Pine-Green Swallowtail Ribbon (`#336149`) & Sunbeam Gold Glow** | `[4]` (*Melody of Moominvalley* banner, sun halo) | `PlayButton` & primary `Save` button (pointed ribbon silhouette in `#336149` with inset cream border, flanking scroll curls, and warm `#e2a84b` hover bloom) |
| **Crimson `!` Quest Shield (`#b5453e`) & Twilight Nocturne Indigo (`#2a547e`)** | `[7]` (`!` shield), `[2]` (night fjord), `[6]` (`♪`) | Filter toggle active shield (`DataChangeNotifBrush`), Metadata Quest crest, `DangerBrush` close hover; `RunningIndicatorBrush` = `#2a547e` twilight indigo sweep & rising musical notes |

## 2. Game element map (11 source UI parts -> Playnite surfaces)

| Source element | Playnite surface | How |
|---|---|---|
| **Settings Watercolor Parchment & Tapered Rules** (`[1]`) | `Library`, `TopPanel`, `Sidebar`, `DetailsViewGameOverview` | Calm `#edebd6` parchment workspace, `#e3e0ca` rail & tree column, tapered ink rules (`taper-rule.png`) closing top bar and section headings |
| **`MELODY OF MOOMINVALLEY` Pine Swallowtail Ribbon** (`[4]`) | `PlayButton`, Primary `Button` (`Save`) | Pointed/chamfered Snufkin pine-green (`#336149`) ribbon plaque with `0.85` inset cream hairline, flanking scroll curls, and `Pathway Gothic One` label |
| **`SAVING SNIFF` Dark Plum Quest Card** (`[7]`) | Metadata pane (both overviews) | `#3b2c2f` dark plum folio with inset `#e6e2ce` hairline border, faint `plaque-distress.png` print flecks, crowned by crimson `!` quest shield, `#f6e3aa` captions, `#fbf9eb` values, framed plum chips |
| **`HARMONICA` Double-Framed Inventory Slot** (`[6]`) | `GridViewItemStyle` (selected) & `More` / `Edit` (`40x40`) | Thick `#3b2c2f` outer frame + crisp `1px` inset cream hairline around selected covers and `40x40` action squares |
| **`SAVE #1` Pointed Hex Save Plaque** (`[3]`) | `DetailsViewItemStyle`, `ListViewItem`, `TreeViewItem`, `MenuItem` | Dark plum `#3b2c2f` selection bar with inset cream rule, `2px` pine/gold left bar, and botanical curl indicator |
| **Crimson `!` Quest Shield Badge** (`[7]`) | `TopPanelFilterToggle` active mark, Notification dot, Metadata crest, Close hover | Shield-shaped `DataChangeNotifBrush` (`#b5453e`) badge perched on top-right of active filter button & metadata card top rim |
| **`MISC` / `COMPLETED` Curly Flourish Tab** (`[1]`, `[7]`) | `TabControl` (`TabItem`), `TopPanelItem`, `SidebarItem` | Muted taupe at rest; deep ink `#261d17` flanked by curl flourishes + tapered ink underline when selected (`TabControl`) or dark plum double-framed slot (`TopPanel`/`Sidebar`) |
| **Audio Ink-Blot Slider** (`[5]`) | `Slider`, `SliderEx` | Thin `#9c9482` track with pine/indigo fill and a `16px` hand-inked dark plum blot disc thumb that lights a warm gold halo on hover |
| **Audio Tapered Ink Needle Scrollbar** (`[5]`) | `ScrollViewer` / `ScrollBarThumb` | Slender tapered ink stroke (`Path` needle, thicker center tapering softly at both ends) sliding in a quiet reserved rail |
| **Hand-Inked Option CheckBox** (`[1]`, `[7]`) | `CheckBox` | Crisp `18x18` organic ink box filling dark plum/pine when checked with bold brushed `IconCheck` |
| **`LOADING` Tip Card & Harmonica `♪` Note** (`[2]`, `[6]`) | `EmptyGameTemplate`, `ToolTip`, `RunningIndicator` | Centered ivory/plum inset-framed storybook card with the Fernscroll fern-treble mark & drifting musical notes when no game is selected; twilight indigo (`#2a547e`) melodic sweep when running |

## 3. Moments & Motion language

- **Hero Moment (`PlayButton` hover & press):**
  - Rest: Snufkin Pine Green (`#336149`) ribbon plaque (`ChamferTemplate`) with inset cream hairline, flanking scroll curls, crisp cream `Pathway Gothic One` label and hand-inked play triangle.
  - Hover (`180ms` `CubicEase` in, `300ms` out): sunlit fern (`#3e7357`) plate fades in, warm Sunbeam Gold (`#e2a84b`) 9-slice watercolor bloom (`bloom.png`) expands softly around the ribbon, a faint golden sheen crosses once, and the flanking scroll curls glide `3px` outward.
  - Press (`90ms`): dark forest `#244a36` pressed plate settles smoothly.
- **Secondary Moments (7):**
  1. Cover hover (`GridViewItemStyle`): warm pine & sunbeam-gold hand-inked double frame + subtle golden bloom fade in (`180ms`, elevated `ZIndex`) vs static dark plum + cream inner frame on selected covers.
  2. Cover action buttons (`GridTilePlayButton`, `GridTileButton`): `42x42` dark plum/pine double-framed inventory slots rise `10px` and scale `0.86 -> 1` (`BackEase` `0.30`), staggered `60ms`.
  3. Sidebar selection (`SidebarItem`): `44px` `#e3e0ca` rail with `MainMenuButton` holding the **Fernscroll** seal; active slot lights as a `32x32` dark plum double-framed square with pine bookmark edge tab (`180ms`).
  4. Settings `TreeView`: minimal `28px` bare rows in `Barlow Semi Condensed` (`14px`); soft ink wash hover (`110ms`); selected row fades in `#3b2c2f` plum plate, `2px` pine left bar, and miniature scroll curl pointer (`180ms`).
  5. Tabs (`TabControl`): smooth fade to deep ink `#261d17` + animated tapered underline & curly end accents (`180ms`).
  6. CheckBox & RadioButton: crisp `110ms` ink fill + brushed `✓` checkmark / inner pine jewel dot.
  7. Slider & Scrollbar: `16px` ink-blot disc lights an amber focus/hover ring; tapered ink needle brightens to deep plum on hover.
- **Ambient Loops (2, sparse regions only):**
  1. `EmptyGameTemplate` (both overviews): centered Loading-style storybook card with `Fernscroll` botanical fern-treble seal gently breathing behind drifting `♪` eighth-note wisps (`3.6s` sine cycle, active only when `{Binding Game} = null`).
  2. `RunningIndicator`: Twilight Indigo (`#2a547e`) melodic sweep (`RunningScan`, `1.65s` launch loop) + tapered foot line + 3 staggered rising `♪` / star motes; calm `3.2s` idle breathing frame while running.
- **Motion Vocabulary:**
  - `fast = 110ms` (press, checkbox, hover tint), `base = 180ms` (plate fades, tab rule, curl reveal), `slow = 300ms` (exits); ambient `3.2s–3.6s`.
  - Easing: `CubicEase` (`EaseOut` / `EaseInOut`) across ink & paper settles; `BackEase` (`Amplitude="0.30"`) exclusively on cover tile action button entrances (`10px` rise, `60ms` stagger).

## 4. Brand & Restraint

- **Brand Name & Mark (`Fernscroll`):** Unofficial fan theme. Vector mark (`art/mark.svg` & `BrandMarkTemplate`): an original **botanical fern-frond spiral curled around a delicate musical treble stem and five-petal meadow blossom** — zero Moomin/Snufkin logos or character likenesses. Used in `IconMainMenu`, `StandardWindowStyle` title band, `EmptyGameTemplate`, and `info/icon.png` (default `#FF7A1A`).
- **`GameBannerTintBrush`:** `--mv-paper` (`#edebd6`), solid storybook parchment so ThemeModifier banner darkening veils hero art smoothly into warm cream paper rather than dark mud.
- **Kept Calm:** Dense Library game rows, filter/explorer trees, cover grid wells, and game descriptions stay clean matte `#edebd6` / `#e3e0ca` parchment (`paper-grain.png` kept <= 3.5% on sparse backgrounds/chrome only; `plaque-distress.png` reserved strictly for dark plum metadata plaques and headers).
