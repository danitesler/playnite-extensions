# Random Theme

A small [Playnite](https://playnite.link/) extension that picks a random installed theme every time Playnite starts. **Desktop** and **Fullscreen** themes are handled separately, because each mode has its own set of themes.

---

## How it works

Each time Playnite starts, **Random Theme** runs once for **each category that is switched on** (Desktop and Fullscreen, independently):

1. Lists the installed, compatible themes for that mode.
2. Leaves out the themes you unchecked.
3. Leaves out the theme that is already set, so you never get the same one twice in a row (when at least two themes are eligible).
4. Picks one of the rest at random.
5. Saves it as the theme Playnite will load **the next time it starts in that mode**.

> **Why the next start?**
> Playnite loads its theme before any extension runs and cannot swap it while running. Random Theme changes Playnite's own settings (not just the config files, which Playnite overwrites when it closes), so the pick sticks and loads cleanly on the next start with no flash.

Switching between Desktop and Fullscreen restarts Playnite, so every switch also rolls a new pick.

---

## Installation

### From the `.pext` package

1. Download `RandomTheme_C3F8A2D1_*.pext` from the [Releases](https://github.com/danitesler/playnite-extensions/releases) page.
2. Double-click the `.pext` file, drag it onto Playnite, or go to **Playnite Menu → Add-ons → Install from file**.
3. Restart Playnite when prompted.

### Development deployment

Close Playnite first (it locks the DLL while running), then:
```powershell
.\scripts\build-plugin.ps1 -Extension randomtheme -Deploy
```

---

## Configuration

Open **Playnite Menu → Add-ons → Extension settings → Generic → Random Theme**. There are two identical sections, one for **Desktop** and one for **Fullscreen**:

| Setting | Default | Description |
|---------|---------|-------------|
| **Pick a random … theme on every startup** | On | Turns randomization on or off for this mode only. The options below appear when it is on. |
| **… themes to choose from** | All checked | Uncheck any theme you never want picked. Newly installed themes are eligible until you uncheck them. **Select all** / **Select none** are shortcuts. |
| **Randomize now** | Button | Aligned to the right of Select all / none. Picks a theme right now (ignores the on/off switch) and offers to restart Playnite when the mode is the one currently running. |

The same **Randomize … theme now** actions are in the main menu under **Extensions → Random Theme**.

If you enable a mode but uncheck every theme in it, Playnite will not let you save the settings until you select at least one theme or turn that mode off.

---

## Randomization details

- Uniformly random over the eligible themes, different on every start.
- One eligible theme: it is used as is. No eligible themes (none installed, or all unchecked): the theme is left unchanged.
- Themes Playnite considers incompatible (unsupported theme API version) are never offered, because Playnite would refuse to load them.

---

## Supported Playnite version

| Requirement | Value |
|------------|-------|
| Playnite SDK | 6.6.0 |
| Target framework | .NET 4.6.2 |
| Minimum Playnite | 10.x (SDK 6.x) |

The extension reads and writes Playnite's theme settings through reflection because the public SDK exposes them read-only. If a future Playnite release moves them, the extension shows a notification and logs the reason instead of failing silently.

---

## Building from source

```powershell
# Validate
.\scripts\validate-extension.ps1 -Extension randomtheme

# Build and deploy to Playnite
.\scripts\build-plugin.ps1 -Extension randomtheme -Deploy

# Package release artifacts (.pext and .zip)
.\scripts\build-artifacts.ps1 -Extension randomtheme -VerifyInstaller
```

---

## Logging

Random Theme writes diagnostic entries to `%AppData%\Playnite\extensions.log`. Search for `RandomTheme`:

- the mode and theme Playnite started with
- per mode: installed / unchecked counts, and the theme picked for the next launch
- reflection failures (with the reason)

---

## License

MIT — see the repository root for details.
