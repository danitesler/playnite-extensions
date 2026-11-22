# Theme Roadmap

Prioritized backlog for upcoming Playnite desktop themes, ordered by visual contrast against the existing catalog and underrepresented categories.

## Current Catalog Snapshot (71 themes)

- **Polarity:** 10 light, 61 dark — light and high-contrast non-black themes are weighted higher below.
- **Categories:** 63 games, 6 dark web/OS design systems, 1 game launcher, 1 fictional TV UI (`Subspace`).
- **Biggest gaps:** retro/nostalgic OS & console launchers (0), Nintendo/handheld games (0), 1-bit / print / card-table aesthetics (0), and additional light/daylight themes.
- **Release backlog:** 38 themes in [README.md](../README.md) are still unreleased (`_not released yet_`) and need Windows WPF verification (`tests/wpf/`) before cutting `.pthm` releases.

---

## P1 — Next Up (Highest Visual Impact)

| # | Source | Polarity | Lane | Mode | Signature Playnite Hook |
| --- | --- | --- | --- | --- | --- |
| 2 | **Return of the Obra Dinn** | Light (1-Bit) | Game (1-Bit Print) | `Showcase` | Pure two-tone Bayer-dithered Macintosh palette (warm cream + deep espresso-ink), crisp 1px pixel frames, ship-manifest metadata ledger, pocket-watch compass-rose running indicator. |
| 3 | **Mirror's Edge** | Stark Light | Game (Minimalist) | `Hybrid` | Blinding architectural snow-white surfaces with razor-sharp **Runner Vision crimson** reserved strictly for Play and active selection, hairline Swiss grid rules, diagonal momentum accents. |
| 4 | **Severance (Lumon MDR)** | Dark Teal (or Clinical White) | Fictional TV UI | `Showcase` | Rounded CRT terminal bezel, cold cyan-green macrodata telemetry, five refinement-bin progress/score bars, sterile mid-century corporate Swiss typography. |

---

## P2 — Strong Additions (Untapped Lanes & Daylight Balance)

| # | Source | Polarity | Lane | Mode | Signature Playnite Hook |
| --- | --- | --- | --- | --- | --- |
| 5 | **Animal Crossing: New Horizons** | Warm Light | Game (Nintendo / Cozy) | `Showcase` | Cream, leaf-mint, and sunny-yellow NookPhone cards, rounded speech-bubble headers, Nook Miles stamp-card scores/metadata, bouncy spring motion. |
| 6 | **Papers, Please** | Warm Mid/Light | Game (Bureaucratic) | `Showcase` | Olive-drab border-booth desk & manila passport paper; mechanical green **APPROVED** rubber-stamp Play button, red **DENIED** alerts, dot-matrix citation slips for filters. |
| 7 | **Control (FBC)** | Light/Slate Concrete | Game (Brutalist) | `Hybrid` | Raw poured-concrete panels, bold tracked Helvetica headings, redacted black-bar metadata tags, 1960s pneumatic-dossier forms, inverted crimson triangle for Play and empty state. |
| 8 | **Zelda: Breath of the Wild / Tears of the Kingdom** | Dark Slate | Game (Nintendo / Adventure) | `Showcase` | Translucent obsidian Sheikah Slate (or Zonai limestone/jade) with cyan runic rings, amber diamond pips, inventory-slot covers, stamina-wheel running indicator. |
| 9 | **Windows 95 / 98 Classic** | Light | Retro OS | `Faithful` | `#C0C0C0` battleship grey, crisp 2px raised/sunken 3D bevels, `#000080` navy title bar, dotted focus rectangles, Start-style Play button. |
| 10 | **Pentiment** | Light | Game (Illuminated Print) | `Showcase` | 16th-century laid rag paper, Bavarian woodcut borders, rubricated vermilion drop-caps, contrasting blackletter/humanist/print type hierarchy. |

---

## P3 — Later / Deeper Cuts

| # | Source | Polarity | Lane | Mode | Signature Playnite Hook |
| --- | --- | --- | --- | --- | --- |
| 11 | **Outer Wilds** | Dark | Game (Timber & Brass) | `Showcase` | Deep starlight indigo, cobbled Hearthian wood paneling, brass ship-log metadata console, golden Nomai spirals, orbital-ring running indicator. |
| 12 | **Hades** | Dark | Game (Mythic Filigree) | `Showcase` | Obsidian, blood-crimson, and burnished gold, Art Nouveau Greek meander dividers, Olympian boon-rarity completion edges, ornate dialogue plaques. |
| 13 | **Frutiger Aero (Windows Vista / Wii)** | Light | Retro OS / Aesthetic | `Showcase` | Translucent sky-blue glass, curved specular highlights, aurora emerald/cyan glows, glossy glass-orb Play trigger. |
| 14 | **Monument Valley** | Pastel Light | Game (Architectural) | `Hybrid` | Escher isometric alabaster, coral-peach, and celadon-teal calm, soft stepped architectural shadows, serene minimal diamond controls. |
| 15 | **2001: A Space Odyssey (HAL 9000)** | Dark | Film UI | `Showcase` | Brushed black aluminum, 1968 Swiss diagnostic micro-grids, glowing ruby-red circular camera-lens Play and running centerpiece. |
| 16 | **PS3/PSP XMB** _or_ **Xbox 360 Blades** | Dark / Metallic | Console Launcher | `Hybrid` | Midnight-blue drifting silk wave with crisp horizontal/vertical icon rails (XMB), or sweeping metallic silver-and-lime curved vertical tabs (Blades). |

---

## Building From This List

Each entry starts with an original abstract name, `info/NOTICE-<Dir>.txt`, and unofficial fan-theme branding per [creative-direction.md](themes/creative-direction.md) and [new-theme.md](themes/new-theme.md):

```powershell
pwsh scripts/new-theme.ps1 -Name "<Original Name>" -Key <key> -DesignSystem "<Source>" -Ambition Showcase|Hybrid|Faithful
```
