# Emberline — creative brief

Ambition: **Showcase**. Gears 5 is a game with a strong, textured menu language of its own, not a clean system. Written after [`RESEARCH.md`](RESEARCH.md); approved by the user on 2026-11-13 before any XAML.

## 1. Source DNA

| Trait | Evidence (RESEARCH.md) | Lands on |
|-------|------------------------|----------|
| Shape/light: a smouldering frame around the selection, never a filled accent | Options, Campaign cards, Classes | Cover hover and selected, settings tree, default button, toggles, Play |
| Shape: black plates with a hairline, stacked with small gaps | Options rows | Buttons, inputs, tree rows, cards, chips |
| Light: a flare on a panel's opening and closing rule | Options, Upgrading Jack | Title band, top bar, search focus, empty page |
| Type/shape: white key caps and a white slanted tab before titles | Footers, screen titles | Tooltips, toggled toolbar items, check box, cover buttons, headings, main menu |
| Type: heavy squared caps over a DIN body | Main menu, Options | Game title, window titles, buttons, tabs, headings |

## 2. Game element map

| Source element | Playnite surface | How | Built |
|----------------|------------------|-----|-------|
| Ember selection frame | Cover hover and selected, tree selection, default button, toggle, combo and list selection | `EmberFrameTemplate` (four tiled strips); hover flickers, selected is static | Yes |
| Main menu red streak | Sidebar current item, details list selected row | Glow and a hot line from the left edge, slides in 200ms | Yes |
| START GAME plate + prompt cap | Play | Black plate; hover adds the frame, a key cap with the play glyph and the reload bar | Yes |
| Active reload bar | Play press, `ProgressBar` | Marker run sweeps into the white "perfect" zone on press; progress fill carries a white leading marker | Yes |
| Options row | `Button`, `TextBox`, `ComboBox`, chips | Black plate, hairline, bare chevron | Yes |
| Options slider | `Slider` | 1px rule, end ticks, vertical tick thumb | Yes |
| Options list | Settings `TreeView` | 28px plates 3px apart; selected in the frame with a red slanted tab | Yes |
| Panel flare rule | Title band, top bar, search focus, empty page | `GlowLineTemplate` | Yes |
| White slanted title tab | Title band, game title, section and group headings, main menu button | Parallelogram before the heading | Yes |
| Key cap | `ToolTip`, toggled top bar items, `CheckBox`, cover buttons on hover, Play prompt | White plate, ink content | Yes |
| Bottom tray trapezoid | Top bar | Decor under the flare; not a wrapper around the toolbar (repo rule) | Yes |
| New-item badge | Filter mark, notification count | 8px / 16px orange squares | Yes |
| Ice loading screen | Empty game page | The theme's mark in frost over a breathing cold glow | Yes |
| Tour objective bars | `GroupBox` header | Thin gold rule, content-sized | Yes |
| Rarity tiers | Completion status / score | Tier-colored edge | **No.** Scores use the rating brushes (green, gold, red) only. Dropped: the tiers would need a restyled `TextBlockGameScore` and add color where the page is meant to stay calm. |

## 3. Signature moments

| Moment | Trigger | Layers | In / out | Easing | Brush |
|--------|---------|--------|----------|--------|-------|
| **Hero: Play** | Hover | Frame ignites, cinder wash, bloom, reload bar, prompt cap slides 8px; frame flickers on a 2.4s loop | 200ms / 350ms | PowerEase 4 out | `PrimaryButtonGlowBrush` |
| Hero: Play press | Press | Marker run to 0.68, perfect zone flash, dried-blood plate | 120ms / 200ms | PowerEase 4 out | `PrimaryButtonForegroundBrush`, `PrimaryButtonPressedBackgroundBrush` |
| Cover hover | Hover | White hairline, frame catches fire and flickers, low ember light | 120-200ms / 350ms | PowerEase 4 out | `GridViewItemHoverBorderBrush` |
| Cover buttons | Cover hover | Two black plates rise 10px, scale 0.86 to 1, 60ms stagger; each turns into a key cap on hover | 200ms / 200ms | PowerEase 4, BackEase 0.3 | `TextBrush` |
| Sidebar selection | Select | Red streak scales in from the rail's edge | 200ms | PowerEase 4 out | `SidebarItemSelectedGlowBrush` |
| List row selection | Select | Streak scales in from the left | 200ms | PowerEase 4 out | `SelectedBorderBrush` |
| Tab switch | Select | White underline sweeps in from the left | 200ms / 120ms | PowerEase 4 out | `TabItemIndicatorBrush` |
| Check box | Check | White cap stamps in | 120ms | linear | `TextBrush` |
| Slider grab | Drag | Tick heats ember | 120ms / 350ms | linear | `SliderThumbHoverBorderBrush` |
| Search focus | Focus | Flare rule fades in under the field | 120ms / 350ms | linear | `TopPanelRuleEndBrush` |

Ambient: the title band's flare breathes (5s loop) and the empty page's frost glow breathes (4s loop). Nothing moves on lists or covers at rest.

## 4. Motion language

- Durations: fast 120ms, base 200ms, slow 350ms; idle 2.4s (flicker), 4s and 5s (ambient). The press sweep uses 40ms sub-steps inside its 120ms.
- Easing personality: heavy and mechanical, `PowerEase` power 4 out for entrances; `BackEase` 0.3 only on the cover buttons.
- Entrance direction: from the left, or ignite in place.
- Stagger: 60ms.
- Not measured from the source (no video); see RESEARCH.md -> Motion.

## 5. Branding system

- Name: **Emberline** (picked), Sawtooth, Perfect Reload, Ironclad, Cinderplate. It names the burning outline on the selected item, the one thing everyone remembers.
- Mark: a broken cog-tooth ring with a slanted gap and one shard in it (`art/mark.svg`, `IconMainMenu`). No skull, no owner mark.
- Title band: 44px black band, white slanted tab off the left edge, uppercase title in the display face, mark ghosted at 7%, flare rule.
- Empty game page: the mark in frost blue over a crystalline glow, a flare rule under the text.
- Type voice: Russo One caps for titles, buttons, tabs and headings; Bahnschrift body.
- Banner darkening color: `em-blood` `#210302`, the dried-blood red of the class headers, so a darkened banner keeps the menus' red cast.
- Preview staging: Play hovered, the selected list row on its streak, a toggled view switch as a key cap (details); the band with the mark, the tree with a selected and a hovered row (settings).

## 6. Restraint

- Library list and cover grid backgrounds: flat `em-panel`. No texture, glow or tint.
- Metadata and descriptions: Bahnschrift, mixed case, white or `em-label` on black.
- The ember texture appears only on selection, hover and focus. Game list rows take the streak, not the frame.
- Scratches (`grime`) only on the rail, the title band and Play.
- Red is selection. Frost is the empty page. Orange is "something is on". Gold is the group box rule and mixed ratings.

## Review

Scored after the first full build and render. Evidence is the two rendered screenshots, the sprite sheet, the icon sheet and the validator. **Nothing was run in Playnite** (the build machine is Linux), which caps every score that depends on live behaviour.

| Criterion | First pass | After fixes | Evidence |
|-----------|-----------|-------------|----------|
| Recognition | 4 | 4 | `screenshot-details.png`, `screenshot-settings.png`: frame, flare rule, slanted tab, key caps, caps type |
| Game element map | 4 | 4 | 14 of 15 rows built; rarity tiers dropped (table above) |
| Hero moment | 3 | 3 | End state rendered; in/out, flicker and press never seen running |
| Motion coherence | 3 | 4 | Duration inventory: every hover and press now uses 120 / 200 / 350ms (was 0.15, 0.18, 0.22, 0.3 in six files) |
| Brand cohesion | 4 | 4 | Mark in the rail, band, empty page, tile; one tab shape throughout |
| Restraint and legibility | 4 | 4 | Validator clean; flat list and grid; preview list colors corrected to the XAML's (installed white, others grey) |

Fixed (the two lowest): motion coherence (timings unified across Sidebar, SidebarItem, TopPanel, TopPanelItem, SearchBox, MainWindowStyle and the close button), and the hero (added the source's prompt cap to Play and uppercase labels, both in the brief's element map but missing from the first build). The hero's score stays at 3 until it is watched in Playnite at 125% and 150%.
