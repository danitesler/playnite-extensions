# Plumbline — theme notes

## What this is

Playnite **Desktop** theme (`ThemeApiVersion` 2.9.0), a **light** theme in the style of **The Sims 4's menus**: Sims-blue
faceted rail, white plates on a pale page, blue ink, gloss green for whatever is selected, checked or filled, and an
orange lozenge over the running game. No dark variant. Unofficial fan theme, not affiliated with or endorsed by
Electronic Arts or Maxis; it carries no game art, logo or font ([notice](info/NOTICE-Plumbline.txt)). The name only
echoes the source (a plumb line hangs from a plumb bob) and the mark is an original plumb bob, not EA's plumbob.

**Status: XAML phase written 2026-11-16: validator and layout tests pass, deployed; not yet reviewed live in Playnite (play hover bloom, sheen, gem animation, settings window).** Read [`HANDOFF.md`](HANDOFF.md) first.

Shared anatomy (file map, shell rules, game page skeleton, metadata pane, build and first-run checks): **`../AGENTS.md`**.
Loading rules and build checks: **`docs/themes/reference.md`**.

## Sources

Reference notes, measurements and captures: [`RESEARCH.md`](RESEARCH.md). Creative brief (Hybrid mode, source DNA, game
element map, hero and secondary moments, motion, brand): [`BRIEF.md`](BRIEF.md).

## Tokens

Token names are this theme's own (`pl-*`); the game publishes none. Full list with sampled regions in `RESEARCH.md`.

| Token | Key | Used for |
|-------|-----|----------|
| `pl-ink` | `TextColor`, `TabItemForegroundBrush`, `WindowTitleForegroundBrush` | all text, titles, tabs |
| `pl-ink-muted` | `TextColorDarker` | secondary text (5.9:1 on white) |
| `pl-ink-deep` | `TextColorDark`, `SelectedForegroundBrush`, `HeaderBandForegroundBrush` | text on green gloss and on the band |
| `pl-white` | `MainColor`, `PopupBackgroundColor`, `InputBackgroundBrush`, `ExpanderBackgroundBrush` | plates, rows, inputs, cards |
| `pl-mist` | `MainColorDark`, `BackgroundToneColor`, `ContentBackgroundBrush` | sunken wells, the library layer |
| `pl-paper` | `WindowBackgourndBrush`, `GameOverviewBackgroundBrush`, `GameBannerTintBrush` | page, game page, banner fade |
| `pl-sky` | `ShellBackgroundBrush`, `GridViewItemHoverBorderBrush` | rail and frame (with facets), cover hover frame |
| `pl-disc` | `SidebarItemSelectedForegroundBrush` | rail discs, the current glyph |
| `pl-green-bright` / `-hi` / `pl-green` | `GlyphColor`, `SelectedBrush`, `SelectedHoverBrush`, `SelectedBorderBrush` | selection gloss, checked, progress |
| `pl-green-tool` | `TopPanelItemCheckedBackgroundBrush`, `ToggleButtonCheckedBackgroundBrush` | toggled top bar cells |
| `pl-green-deep` | `ProgressBarTrackBrush` | need bar track |
| `pl-orange-mark` | `RunningIndicatorBrush`, `DataChangeNotifColor`, `WarningBrush` | running lozenge, filter mark, update icon |
| `pl-band` | `HeaderBandBrush`, `ScrollBarThumbBrush` | section bands, thumbs |
| `pl-pill-hi` / `-lo` / `-rim` | `ButtonBackgroundBrush`, `ButtonPressedBackgroundBrush`, `NormalBorderBrush` | pale capsules |
| `pl-hover` | `HoverColor`, `ListItemHoverBrush` | hovered rows and cells |
| `pl-red` | `DangerBrush`, `NegativeRatingBrush` | close hover, errors |

Radii: `ControlCornerRadius` 6 (plates, rows, inputs), `CornerRadiusSmall` 3, `CornerRadiusLarge` 16 (32px capsules),
`CornerRadiusXLarge` 22 (the 44px Play capsule), `CornerRadiusFull` for discs only (square elements). Fonts: Segoe UI,
Semibold for headings (`HeadingFontFamily`); nothing bundled.

## Component spacing (`src/Common.xaml`)

Not written yet. Target values: `ControlHeight` 32, `ButtonPadding` 16,5, `InputPadding` 10,5, `MenuPadding` 4, `MenuItemPadding`
12,6, `ComboBoxDropDownPadding` 4, `ComboBoxItemPadding` 10,5, `ListBoxItemPadding` 10,6, `GroupBoxPadding` 14,10, `TooltipPadding`
10,6, `IconSize` 16, `GameBannerHeight` 320, `GameBannerDarken` 0. Taken from the previews (settings rows, plates).

## Shell

Per the previews (`art/preview-details.html`); files not written yet.

| File | What it draws |
|------|---------------|
| `Views/Sidebar.xaml`, `CustomControls/SidebarItem.xaml` | 44px rail in `ShellBackgroundBrush` with `facets-rail.png` as a white mask; 32px disc items (`pl-disc`, white glyph), the current one a white disc with a blue glyph and a sky ring; main menu a white disc holding the green gem |
| `Views/TopPanel.xaml`, `CustomControls/TopPanelItem.xaml` | 52px white strip, hairline and soft shadow below; pill search well (mist, inset); 34px white gloss discs; toggled = green gloss with deep ink glyph; filter mark = orange lozenge on the icon's top-right corner |
| `Views/Library.xaml` | Library layer `ContentBackgroundBrush`; window background art per the shared rules |
| `DerivedStyles/MainWindowStyle.xaml` | 28px round window buttons on mist, close turns red |

## Game page

Skeleton per the shared guide. Differences: icon plate (white, 10px radius, soft shadow) beside a 30px Semibold title; Play capsule
with its overhanging disc; More and Edit are 40px round discs (square, so `CornerRadiusFull` is allowed); description is a card
with a grey-blue band header; the metadata pane is a plain white card with scores drawn as need bars.

## Components

Playnite file to Sims component, per the game element map in `BRIEF.md`. Tree and title band: `TreeView.xaml` (28px centered plates,
green gloss), `StandardWindowStyle.xaml` (48px band, gem medallion, round close). Headings that are caps in the preview (bands)
use Playnite's `ToUpperCaseConverter`, not a text copy.

## Previews

`art/preview-details.html` and `art/preview-settings.html` are the real design. Signature motifs drawn: facet field (rail,
Settings backdrop), white gloss discs with a soft shadow, green gloss selection, grey-blue section bands, need bars, the
plumb-bob lozenge (running row, filter mark, medallion, notification), the Play capsule in its hovered end state. Stand-in
fonts: Segoe UI and Segoe UI Semibold are drawn with Selawik by the renderer. Sample games are invented. Game icon letter plates
use five hex colors that are not tokens (art placeholders).

## Deviations

- The game prints white on light green, on the grey-blue band and on orange (2.2 to 3 to 1). This theme prints deep ink on all three.
- The game's headings are true small caps; Segoe UI has none, so band headers are uppercase at 11px, bold, tracked.
- Drop shadows are sprites (`src/Images/shadow-*.png`) through an `OpacityMask`; no `DropShadowEffect` in this repo.

## Not verified yet

Everything in XAML: no theme file other than `Constants.template.xaml`, the four field overlays and `DatePicker.xaml` exists, and
none of it has been built or loaded in Playnite (no PowerShell and no Windows in the authoring sandbox). `Constants.template.xaml`
placeholders and key names were checked against `tokens.css` and the key catalog with a script, not by `build-theme.ps1`.
Motion was not measured (stills only). Settings labels in the preview are approximations of Playnite's English strings.
