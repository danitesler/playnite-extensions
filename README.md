# Playnite Extensions Monorepo

This repository contains reusable build, validation, and package automation for Playnite extensions. Each extension lives under `src/<PluginName>/` and is registered in `src/extensions.json`.
Visual Studio / Rider: open **`playnite-extensions.sln`** at the repo root (adds more projects here as the monorepo grows).


## Installation

1. Download the latest `.pext` from the [Releases page](https://github.com/danitesler/playnite-extensions/releases).
2. Drag and drop the file into your Playnite window.
3. Click **Install** when prompted.
4. Restart Playnite.

### Generic Addons

| Icon | Name | Description | Database | Help |
| --- | --- | --- | --- | --- |
| ![Autogrid](https://raw.githubusercontent.com/danitesler/playnite-extensions/main/src/Autogrid/info/icon.png) | **Autogrid** (`autogrid`) | Tight Desktop Grid with stable columns—auto-adjusts cover width on resize. | [Link](https://playnite.link/addons.html#Autogrid_7F3E9B82) | [Help](https://github.com/danitesler/playnite-extensions#autogrid-usage) |

## Autogrid

<details>
<summary><img src="https://raw.githubusercontent.com/danitesler/playnite-extensions/main/src/Autogrid/info/icon.png" width="24" height="24" alt="Autogrid" /> <strong>Autogrid</strong> — overview and before/after</summary>

Tight Desktop Grid with stable columns—auto-adjusts cover width on resize.

Autogrid keeps your Playnite Desktop Grid visually tight and easy to scan: you can pull covers together so the grid reads as a continuous wall of art, with far less empty gutter between tiles than the default layout.

Set a target column count once. When you resize the window, the extension adjusts cover width so that column count stays stable and the grid does not constantly reflow.

| Before | After |
| --- | --- |
| ![Before](https://media.githubusercontent.com/media/danitesler/playnite-extensions/main/src/Autogrid/info/before.gif) | ![After](https://media.githubusercontent.com/media/danitesler/playnite-extensions/main/src/Autogrid/info/after.gif) |

</details>

## Autogrid Usage

1. In Playnite, open **Main Menu > Add-ons > Extension settings**.
2. Go to **Generic > Autogrid**.
3. Set your preferred **Target columns** value.
4. Click **Save**.

Optional:
- Use **Viewport adjust (pixels)** if your theme leaves side gutters.