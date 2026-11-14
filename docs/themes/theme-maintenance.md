# Playnite theme maintenance

## Retrofit the interactive layer into an existing theme

Themes made before Cloudbank have flat Play buttons, a static cover hover, Default's cover buttons and a text-only empty game page. To bring one up to the required interactive layer (the list under New theme, step 8):

1. **Research the source again, for motion.** Read the theme's `AGENTS.md` and `RESEARCH.md`, then look at how the source *moves*: game UI (hover, press and confirm feedback, idle animation, sounds-as-light), or for a design system its motion tokens (durations, easings) and its interactive-state spec (ripple, ring, elevation, reveal highlight, none). Add the findings to `RESEARCH.md` under "Motion" with the sources. No guessing from the static look.
   If the theme has no `BRIEF.md`, write one first ([creative-direction.md](creative-direction.md)); a retrofit is the moment to add the game element map and signature moments.
2. **Pick the language, not Cloudbank's.** Cloudbank's glow, arcs and brackets are Transistor's. Pick the equivalent for this source (see reference.md -> Motion by source type) and keep the theme's existing radii, tokens, fonts and icon set. A design-system theme moves like its system: short, restrained, no ornament it does not have. A game theme gets the game's signature (bloom, ink slash, sheen, pixel step, rust flare, frost).
3. **Build the five items** (Play hover, cover hover, cover hover controls with themed glyphs, designed empty page in both overviews, generated assets only where the source has them) following reference.md -> Effects and motion and Interactive layer. Use Cloudbank's files as a wiring example only (`PlayButton.xaml`, `GridViewItemStyle.xaml`, `GridViewItemTemplate.xaml`); never copy its look, sprites, glyphs or numbers.
4. **Keep everything the theme already guarantees:** its tokens and `ThemeModifier` recoloring (brush-filled masks, no baked colors), the validator rules (no `CornerRadiusFull` on non-square, Statistics GroupBox untouched, Width=41 detection and 32/41 layout scale, action buttons, sidebar sizing), localization (no new strings: reuse `LOC*` keys), and Default's parts and triggers in `GridViewItemTemplate.xaml`.
5. **Previews follow:** if the new motifs are visible in the end state (empty page is not; hover states are not), update `art/preview-*.html` and re-render. Otherwise leave screenshots alone.
6. **Per-theme notes:** update the theme's `AGENTS.md` (Components table, Effects if sprites ship, Not verified yet) in its own words.

Check the result with `.\scripts\validate-extension.ps1 -Extension <key>` and `.\scripts\build-theme.ps1 -Extension <key> -NoDeploy`; deploy and look at it in Playnite last.

## Token-only change (sibling dark theme, brand swap)

Edit values in `tokens.css`, keep names, rebuild. A missing token gets a `?fallback` in the template. Keys never change.

## Steam screenshot loading or stale content

Use a current-game eligibility parent around the complete section, outside any loading animations. The plugin's shared `IsControlVisible` can complete late after switching to a non-Steam game. Preserve the gate in overview generators, cancel/reset loading clocks, and run `pwsh -STA -File tests/wpf/SteamScreenshotsRegressionTests.ps1`. Conditions, empty results and manual reproduction: [reference.md](reference.md) -> Steam screenshots.

## Top bar layout and search

Every theme keeps **search → filters → sorting** together at the top left. Preserve each theme's toolbar button height across idle, hover, checked and active states; keep the search magnifier visible during focus and typing, changing only its color. Implementation details, template overrides and required regression checks: [reference.md](reference.md#top-bar-layout-and-search). Previews must show this same order and sizing.

## Restyle one control

Edit or add `src/themes/<Theme>/src/<Default path>.xaml`: start from Playnite's Default file, keep part names, include only the styles you change. Colors: palette brush if the design uses that key's token for the role, else a shared brush (`{DynamicResource SelectedBrush}`); a brush the theme lacks gets one template line with its token; a role the vocabulary lacks is added to `theme-keys.json` first. Spacing from the theme's `Common.xaml` keys. Brushes only, never `*Color`.

## Window background (game art behind the whole window)

Rules: [reference.md](reference.md#thememodifier) -> Window background and `src/themes/AGENTS.md` -> Window background. Checklist for a new theme or a change across themes:

1. **One art layer.** In `Views/Library.xaml` put the swatch, `PART_ImageBackground` and any decor in one `Grid` before `TopPanel` (`Grid.RowSpan="2"`, `IsHitTestVisible="False"`). Its Background is the fade color only while `{Settings ShowBackgroundImageOnWindow}` is True, so the look with the setting off does not change. Its Margin is `-44,0,0,0` (mirrored by `{Settings SidebarPosition}`, `-56` top or bottom) so the art runs under the rail. A framed card (Shade) leaves the margin off.
2. **Nothing opaque above the art.** Any later element with a solid `Background` over the layer (a library `Border`, the top bar, the rail) hides it: give it a style or template trigger that sets `Transparent` on the setting. Decor that only makes sense on the solid fill (a torn rail edge, a rounded layer corner) collapses in the same trigger.
3. **Four small things that are easy to miss:** the rail's fill (`Views/Sidebar.xaml`, trigger last in the Sidebar template), Expander headers (`DefaultControls/Expander.xaml`, which every theme ships), the scroll bar track fill (name it `TrackFill`, `Opacity` 0.4 in a `ControlTemplate` trigger; a track made of a transparent `Track` needs nothing), and the Slider ThemeModifier rows.
4. **Count nested templates when editing by script.** `ControlTemplate.Triggers` looks like `ControlTemplate`: match `<ControlTemplate(?=[\s>])` or the depth count never closes. Parse the file as XML after every edit, keep each file's line endings, and read a file before reverting it with git (the working tree holds uncommitted work).
5. **Verify.** `validate-extension.ps1` (`Test-WindowBackground`), `build-themes.ps1` (builds only), then deploy a few structurally different themes (`build-theme.ps1 -Extension <key> -Deploy -Restart`) and read `playnite.log` for `Failed to load theme`. A theme that parses can still fail at load. Finish by deploying the theme the user is on. Look at the real window with the setting on: the rail, top bar, group headers and scroll bars over a game with art.

Plain `build-theme.ps1` deploys and restarts Playnite; use `-NoDeploy` or `build-themes.ps1` for builds you do not want live, and `-Deploy -NoRestart` for the rest (it can still change the active theme: check `config.json`).

## Playnite update

`.\scripts\update-playnite-theme-api.ps1 -PlayniteSource <checkout> -PlayniteVersion <tag>`, then diff the Default theme against every file each theme ships.

## Reading build errors

| Message | Fix |
|---------|-----|
| `is not a Playnite Desktop theme file` | Path/name differs from Default's (case-insensitive). Rename or merge into the right file. |
| `defines 'X', which is neither a Playnite key nor a shared key` | Use the role's key from `theme-keys.json`; new role -> add the entry there. Design-system names belong in `tokens.css`. |
| `defines 'X' as ...; theme-keys.json lists it as ...` | Wrong resource type for that key. |
| `reads the Color 'X'` | Use the brush. Gradient: brush fill + gradient `OpacityMask`. |
| `Required shared keys not defined yet` (warning) / `missing` (validate) | Define the vocabulary's `required` entries. |
| `uses {StaticResource X}, but 'X' only exists in another theme file` | Switch to `DynamicResource`. |
| `references unknown resource 'X'` | Typo, or key missing from this Playnite version / the template. |
| `Template rendering failed` (file:line key) | Token missing from `tokens.css`, `{{TODO}}` left, or translucent surface: add token or fallback. |
| `still contains an unrendered {{placeholder}}` | Braces in a comment or malformed placeholder. |
| `ThemeApiVersion ... will not load` | Declared API newer than snapshot's Playnite, or major differs. |
| `An XML comment cannot contain '--'` | A comment mentions a CSS variable (`--name`); reword. |

## Builds but looks wrong in Playnite

- Reverts to Default: XAML threw at load. Check `%AppData%\Playnite\playnite.log` (portable: next to `Playnite.exe`) for file and line.
- Playnite crashes or never finishes starting after a deploy: an unknown XAML member on an element (the build does not validate property names). Check the log tail for `XamlParseException: Cannot set unknown member '...'` — it names the bad attribute. Fix it in the theme source, rebuild, redeploy, restart.
- Playnite crashes when game details open (grid side panel, or details view with nothing selected) and the log says `Cannot animate '(0).(1)' on an immutable object instance`: the empty state's idle loop animates a `RenderTransform` from a `Style` `DataTrigger`. Playnite builds the page before a game is bound, so `Game = null` fires the trigger during template creation, when the transform is read-only. The build passes and details view with a game selected looks fine, so open details from grid view to test it. `validate-extension.ps1` (`Test-StyleTriggerComplexAnimation`) fails it with the file and path. Fix: either animate a plain property of the element (`Opacity`, `Margin`, or `Height` in a fixed-size host), or move the loop into the page's `ControlTemplate.Triggers` with an `x:Name`d transform and `Storyboard.TargetName` (needed for rotation). Change a generator too if the theme has one. Details: [reference.md](reference.md) -> Hard rules.
- Same crash moment, log says `Unexpected token 'F1MM...'`: a pasted icon path in the overview doubles the `M` (`Data="F1MM6,7.5..."`). Make it `F1M6,7.5...`. The build does not parse path data; `validate-extension.ps1` (`Test-PathDataSyntax`) fails it.
- Labels in the game edit dialog are barely visible or the wrong colour, or its tab names are invisible: the labels inherit the selected `TabItem`'s `Foreground`, and the tab names bind to an ancestor `TextBlock`. Keep `TextBrush` on the `TabItem`, and put header colours on the header `TextBlock` with `TargetName`. `validate-extension.ps1` (`Test-TabItemColors`) fails both.
- A control ignores tokens: its Default template hard-codes a color or reads a Playnite key; override that style.
- No change visible: themes load at startup only; restart after `-Deploy`.

