# Runeskald

Dark Playnite Desktop theme, version 0.1.0, theme API 2.9.0. Follow the [shared theme rules](../AGENTS.md). The [research notes](RESEARCH.md) record capture measurements and art credits. The [Showcase brief](BRIEF.md) maps the source UI to Playnite.

## Finish and type

The near-black rail and blue-black page recede behind brushed silver choices. A fixed-seed white alpha mask in `Images/fx/silver-leaf.png` picks up the current brush. Regenerate it with `art/sprites.py`. Jost supplies the body and display faces. The regular and medium weights ship under the SIL Open Font License in `src/Typography`.

## Controls

The loading screen lends the empty page its low bank of mist. The original interlocking clasp appears in the title band, two opposing cover fittings, marked menu rows and the empty game page. The cloudy silver strip from the Options screen extends from the left edge of each menu. A thin fork-ended rail divides the icon gutter from the black tray and a clasp closes each group divider. Shortcuts are flush right with an engraved underline. The global main menu, context menus, submenus, dropdowns and multi-select rows use these templates. Exit uses oxide red.

Rows polish on hover and catch a travelling glint on selection. Cover sockets draw inward on selection. Play shows two chased lines and retains its footprint while launching and running. A green fill passes beneath the three socket pins on launch. The bar holds while the game runs.

## Game pages and customization

`GameDetailsPanePosition` defaults to Right in both views and also accepts Left, Center and Stretch. Center and Stretch place metadata above the page in three columns at 900 pixels, two at 560 and one below. Left stacks above media on narrow pages. The window background uses Playnite’s own setting. The banner collapses and its ThemeModifier sliders disable while that setting is on. Colors, banner sizing and panel geometry use the shared ThemeModifier resource keys.

## Previews

The two 1280×720 HTML previews share the theme’s fonts, tokens and metal mask. The fictional game *The Last Crossing* uses a public-domain painting for its banner, cover and three sample thumbnails. Playnite supplies the selected game’s actual media. Refresh with `scripts/take-screenshots.ps1 -Extension runeskald`.
