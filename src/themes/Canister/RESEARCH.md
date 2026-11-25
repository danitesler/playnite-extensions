# Canister — Research & Sources

Unofficial Playnite desktop theme inspired by *Teenage Mutant Ninja Turtles: Mutants Unleashed* (2024). All tokens, shapes, sprites, and vector icons are original recreations measured from public UI reference captures — no game files, logos, or copyrighted artwork are used.

## Sources

| What | Where | License / Notes |
| --- | --- | --- |
| UI Reference Gallery | [Game UI Database — TMNT: Mutants Unleashed (id=2358)](https://www.gameuidatabase.com/gameData.php?id=2358) | 53 screenshots across 6 categories (Title/System, Modals/Text, Game States, Stats/Resources, Info/Extras, HUD/Overlays); 12 full-size screens inspected |
| Display Heading Font | `scripts/fonts/anton/Anton-Regular.ttf` | SIL Open Font License 1.1 (no Reserved Font Name); stand-in for bold compressed street-marker brush display |
| Hand-Printed Comic Font | `scripts/fonts/patrickhand/PatrickHand-Regular.ttf` | SIL Open Font License 1.1 (no Reserved Font Name); stand-in for all-caps hand-lettered comic & notebook lettering |
| Body UI Font | `scripts/fonts/barlow/Barlow-{Regular,Medium,SemiBold,Bold}.ttf` | SIL Open Font License 1.1 (no Reserved Font Name); clean slightly-condensed sans for calm library lists, descriptions, and Settings trees |
| Monospace Font | Windows `Consolas` (preview alias `Cascadia Mono`, OFL-1.1) | Shortcut keycaps & numeric counters |
| Playnite Base XAML | Playnite Default Theme (API `2.9.0`, MIT) | `info/LICENSE-Playnite.txt` |

## Inspected Reference Screens (Game UI Database `id=2358`)

1. **`1/53` Title Screen & Mode Select:** Nocturnal sewer-lair backdrop with centered floating uppercase menu (`PLAY GAME`, `OPTIONS`, `< ENGLISH >`, `QUIT`). Active item shifts from warm off-white (`#F4F2EB`) to Golden Marker Yellow (`#F7DC28`); inline selector uses crisp hand-drawn `<` `>` arrowheads.
2. **`12/53` Credits:** Black aerosol spray-paint splatter clouds behind Golden Marker role headers and bright chalk-white names.
3. **`13/53` Dialogue & Speech:** Cut-out portrait with taped name tag and spiky comic speech bubble filled with matte ink (`#15171A`) and framed by crisp white + red/green chromatic aberration offset outlines.
4. **`23/53` Modal: Info & Tutorial (`HEALTH OOZE CANISTERS`):** Torn spiral-bound lined notebook sheet (`#F1EDE2`) with faint pale-blue horizontal rules, red thumbtack + red conspiracy string, red/green chromatic outer fringes, and `(A) OK` jagged prompt card.
5. **`27/53` Character Select:** Four jagged diagonal comic-panel shards over deep dark charcoal-chalk (`#111316`) with sketchy white double outlines and turtle identity hues (Leo Blue `#1C72E8`, Raph Red `#EE2836`, Donnie Purple `#8F3EE8`, Mikey Orange `#F58220`).
6. **`29/53` Level Select: World Map:** Spiral-bound graph-paper map topped by a torn Golden Marker masking-tape strip (`COEXISTING CENTER`) in bold black marker ink.
7. **`37/53` Results Screen:** Torn lined notepad (`HALF-SHELL HEROES`) paired with yellow clipboard sheets, red conspiracy string, Polaroids, and bold graffiti grade stamp (`A`).
8. **`39/53` Action Menu (`STREETS` / `HELL'S KITCHEN`):** Diegetic NYC street-sign forest-green plaques (`#1E5740`) with weathered cream rims and chromatic-fringed calendar clock.
9. **`41/53` Skill Tree (`LEO'S SKILL TREE`):** Graffiti corkboard framed by blazing Acid Mutagen Green (`#44E61D`) on the right and Tag Crimson (`#EE2836`) on the bottom-left; Vermilion painted masking-tape header (`#ED4F24`), sketchy circular white-outlined skill nodes, dark comic pointer bubble (`BUY UPGRADE (A)`), three tilted glass **Mutagen Ooze Vials** (`DAMAGE`, `HEALTH`, `ASSIST CHARGES`) with star pips, and a pinned **torn lined-notebook flyer (`PUSH KICK`)** on the right with a blue thumbtack, red string, Golden Marker tape header (`#F7DC28`), and dark comic ink copy.
10. **`44/53` & `51/53` Combat HUD:** Top-left tapered comic swoosh HP bar (Crimson `#EE2836` → Vermilion `#ED4F24` → Yellow `#F7DC28` → Acid Mutagen Green `#44E61D`), top-right graffiti rank (`B`) + mutagen splatter skull, bottom-right spiral-notebook tutorial cards.
11. **`46/53` Contextual Prompts & XP Counter:** Acid-green-outlined `(X) TALK` comic bubble, `LB` pill bumper badge, and `198` XP cassette counter splashed with glowing green mutagen.

## Measured Color System

| Role | Hex | Where observed |
| --- | --- | --- |
| Sewer Chalk Canvas | `#0D0F12` | Character Select & dark scene backdrop (`27/53`) |
| Alley Asphalt Chrome | `#13161A` | Deep shell & overlay framing (`13/53`, `41/53`) |
| Comic Ink Plate | `#191D22` | Speech bubbles, `BUY UPGRADE` pointer callout (`13/53`, `41/53`) |
| Raised Charcoal Plate | `#22272E` | Secondary plates & hover surfaces |
| Sunken Ink Well | `#101317` | Input wells, progress tracks, shortcut badges |
| Chalk Sketch Border | `#383F48` | Resting ink dividers and control frames |
| Sketchy White Rim | `#E6E3DA` | Hand-drawn double comic outlines (`27/53`, `41/53`) |
| Deep Sewer Tint (`GameBannerTintBrush`) | `#112316` | Nocturnal sewer-green shadow wash (solid, no alpha) |
| Torn Notebook Flyer (`ParchmentBrush`) | `#F1EDE2` | Lined notebook modals & pinned `PUSH KICK` flyer (`23/53`, `41/53`) |
| Notebook Rule Line | `#C7D4DC` | Faint blue horizontal notebook rules (`23/53`, `29/53`) |
| Flyer Kraft Tag Fill | `#E4DFD0` | Muted sticker chips on the paper dossier |
| Marker Ink (on Paper) | `#17191D` | High-contrast dark ink on notebook & tape headers (>14:1) |
| Faded Ink Caption | `#4C525A` | Secondary ink captions on notebook paper (6.8:1) |
| Ballpoint Cobalt Link | `#124C99` | Interactive links on notebook paper (7.4:1) |
| Acid Mutagen Green | `#44E61D` | Primary accent, right/bottom chromatic fringe, XP ooze, `(A)` glow |
| Deep Mutagen Green | `#259B14` | Pressed / deep mutagen fill |
| Mutagen Wash | `#1B2B1B` | Selected comic callout row fill |
| Golden Marker Yellow | `#F7DC28` | Active title item, masking-tape header, Play CTA (`1/53`, `41/53`) |
| Tape Fold Gold | `#DFB517` | Pressed golden tape tone |
| Vermilion Painted Tape | `#ED4F24` | `LEO'S SKILL TREE` painted tape banner, filter active star |
| Tag Crimson | `#EE2836` | Left/top chromatic fringe, locked padlocks, thumbtacks, red string, Danger/Exit |
| Deep Crimson | `#B81A26` | Pressed danger tone |
| NYC Street Green | `#1E5740` | Street sign plaques (`39/53`) |
| Leo Cobalt (`RunningIndicatorBrush`) | `#165DC4` | Distinct running/launching hue (5.85:1 bare with `#F4F1E8`, 7.4–10.8:1 under scrim) |
| Electric Cobalt Glint | `#4CA3FF` | Launching sweep highlight |
| Chalk White Text | `#F4F1E8` | Primary text on dark ink (16.5:1) |
| Muted Chalk Text | `#A4A9B0` | Secondary text on dark ink (7.1:1) |

## Geometry, Materials & Motion Notes

- **Dual Chromatic Offset Fringes:** Signature across modals, corkboards, speech bubbles, and street signs — Acid Mutagen Green offset right/down (`+2px`) paired with Tag Crimson offset left/up (`-2px`) behind a crisp white or ink outline. Pure XAML offset borders (no `DropShadowEffect`).
- **Torn Masking Tape & Spiral Paper:** Masking-tape titles have ragged ripped left/right ends; flyer panels carry ruled lines, punched spiral binding along the left edge, a corner pushpin + red string, and a jagged torn bottom edge.
- **Hand-Inked Comic Energy:** Crisp 2–3px structural corners (zero generic smooth pill rounding except 1:1 circular gamepad/skill badges), snappy `BackEase` pops (`110–190ms`) mirroring Mutant Mayhem's punchy frame-stepped sketchbook energy while keeping library lists, covers, and metadata text calm.
