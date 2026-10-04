# Attache — research & sources

## Sources

| What | Where |
|------|-------|
| Options screen (tabs, rows, pewter plate, slider) | Language tab at 2560x1440, from caniplaythat.com, "Resident Evil 4 remake's approach to accessibility options" (2023-03-23). Colors measured with ImageMagick. |
| Pause / load screen (menu list, current item, amber dot, slots) | 1920x1080 capture from gameluster.com, "Resident Evil 4 Remake guide: unlock Professional mode / New Game+". |
| Main menu (word list at the left, scene behind, hint line) | Russian-language 720p YouTube thumbnail (OqUvWpAgdqs) and a low-res English frame. Layout only; no high-res English capture was found. |
| 2005 game | Title screen, attaché case and merchant thumbnails (residentevil.fandom.com, YouTube). Used for context only: the theme follows the remake. |
| Icons | Phosphor Icons, Light weight, `phosphor-icons/core` main, `assets/light` (MIT, `info/LICENSE-phosphor.txt`). |
| Smoke texture | `art/smoke.py` → `src/Images/smoke.png` (seeded value noise, white at low alpha). |
| Game pages | `art/gamepage.py` → `src/Views/DetailsViewGameOverview.xaml`, `GridViewGameOverview.xaml`. Edit the script, not the XAML. |

What the screenshots show, and what the theme follows:
- **The menus use no red.** Red appears only in the logo. The palette is warm greys on near black.
- **Main and pause menu:** the current item has no bar. It turns near white, gets larger and steps about 20px to the left. Other items are warm grey (#aaa9a7). An amber dot (#ab854d) marks items with something new.
- **Options:** tabs are condensed uppercase words separated by 1px vertical rules. The current tab is #ccc7ba over a 2–3px line that fades out at both ends, with a soft light above it. Rows are separated by #232323 hairlines.
- **The current options row** sits on a brushed pewter plate: dark in the middle (#1f1f20), lighter toward the edges, a bright hairline along the top and bottom (#8d877d), smoky mottling, and soft ends.
