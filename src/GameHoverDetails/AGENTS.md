# GameHoverDetails — extension notes

## What this extension does

Playnite **GenericPlugin** (`net462`, WPF). Hover popup anchored to a library tile whose `DataContext` is a **`Game`**. Width and up to five detail fields are user-configurable.

## Implementation

- **Lifecycle** — `GameHoverDetailsPlugin` attaches on `OnApplicationStarted` via `UIDispatcher` / `ApplicationIdle` (same as Autogrid). Detaches on `OnApplicationStopped`.
- **Show / switch** — `GameHoverDetailsHoverService` on `PreviewMouseMove`: resolve `Game` + anchor and update immediately (no show/switch debounce). First open waits `ShowDelayMs` and plays the opacity enter storyboard. Same `Game.Id` and unchanged field keys skip rebuild; placement still updates. Already-shown game+anchor returns before the show pipeline. Switching games while open skips appear delay and enter fade (opacity stays 1; only content + placement change). Never sets `IsOpen = false` on switch (HWND recreate blinks); re-place with `NudgePopupToApplyNewSize`. `PreviewMouseWheel` and `PreviewKeyDown` defer a pointer sync until after Playnite applies the scroll/key. Pointer on the panel dismisses immediately.
- **Hide** — ~70ms trailing debounce after leaving game tiles (gaps). Debounce tick still over a game → switch in place, do not hide. `PreviewKeyDown` / wheel hide only if the pointer is no longer on a game (F4/F9). Hide on `Application.Deactivated`, `MainWindow.Deactivated`, minimize, and `ContextMenuOpening`. Context-menu suppress clears on close/deactivate and self-expires after **20s**. Also blocked while another in-app `Window` is active or another in-process HWND is foreground (`GetForegroundWindow`; ignore WPF popup HWNDs and other processes). A **500ms watchdog** runs only while open: hide if the pointer is off games or hover is blocked; if it resolves to a **different** game, switch content in place. Skip `ContextMenu` / `MenuItem` hits even when `DataContext` is `Game`.
- **Suppress** — globally disabled, or Fullscreen with **Show hover in Fullscreen** off (`ApplicationInfo.Mode`). Desktop and Fullscreen are separate processes; toggle Fullscreen from Desktop add-on settings. Default off in Fullscreen (`HoverDisabledInFullscreen`).
- **Placement** — `PlacementMode.Custom` + `CustomPopupPlacementCallback`: prefer the **end** side (right LTR / left RTL), else start. List view stays start-aligned under the row. `FlowDirection` on **inner chrome only** — never the `Popup` (RTL on the popup mirrors placement onto the tile). `ClampPopupToVirtualScreen` is **vertical-only**. `PopupAnimation.None` + short opacity storyboard on **first open only** (not on game switch).
- **Chrome** — `HoverChromePalette`. Theme-sync fill = darkened, slightly desaturated `GlyphBrush` mixed toward black (not `PopupBackgroundBrush`); icons stay accent. Custom = picker hex. **Use game background**: overview `BackgroundImage` as `ImageBrush` (`UniformToFill`) under `#000000` tint from **Background opacity** (checkbox on resets to 50%; 100% = solid black). Same Layout width as Regular; height follows the field list; missing fanart uses Regular fill (`#FF1C1C1E` @ 90%). Frost (opacity < 100%) is **live hover only**: GDI `CopyFromScreen` of the popup rect while chrome opacity is near 0 — never `VisualBrush` / `RenderTargetBitmap` of MainWindow. `BlurEffect` only when frost is on. Shadow = offset border, not `DropShadowEffect`. Labels, values, and glyphs always Playnite `TextBrush`. Body/label `FontFamily` from Playnite (default Trebuchet MS; Popup HWNDs do not inherit). Dividers = `HoverChromePalette.Separator` (own color).
- **Field list** — `HoverFieldListBuilder.Fill` is the only builder. Live: `HoverFieldListSource.ForLiveGame` (`OmitEmptyArt = true`). Preview chrome stays in XAML (`PreviewChromeBorder`, fanart, tint); `PreviewFieldsHost` is filled by the same `Fill` (`OmitEmptyArt = false`, sample-text / art-cache fallbacks). Description is plain text (HTML stripped), 3-line clamp. Shared `HoverFieldColumnCount` (1–3, L→R then down); Cover / background / description span full width. No inner scroll. Checklist: **Preview vs hover parity** below.
- **Fragility** — Playnite does not document item `DataContext` shapes. `HandleHoverError` hides + warns; latches `broken` / detaches after **5 consecutive** errors. A successful pointer resolve resets the counter.

## Key files

| Area | Path |
|------|------|
| Plugin lifecycle | `src/GameHoverDetails/src/GameHoverDetailsPlugin.cs` |
| Hover UI | `src/GameHoverDetails/src/GameHoverDetailsHoverService.cs` |
| Field list (hover + preview) | `HoverFieldListBuilder.cs` (`Fill` + `HoverFieldListSource`) |
| Settings | `GameHoverDetailsSettings.cs`, `GameHoverDetailsSettingsView.xaml` |
| Chrome / theme | `HoverChromePalette.cs` |
| Field catalog / text | `HoverFieldCatalog.cs`, `HoverFieldFormatter.cs`, `HoverDetailValuePresenter.cs`, `HoverLoc.cs` |
| Art decode | `HoverBitmapLoader.cs` (no cache — do not probe twice) |
| Localization | `Localization/*.xaml` (Playnite Crowdin set; English fallback) |
| Glyphs | `fonts/` Phosphor, Unicons Line, Huge Icons Stroke Rounded, Pixel Icon Library (copied next to the DLL). Sketchy Icons, Iconsax Bulk, and Pixelarticons are catalog path subsets in `HoverIconSvgCatalog.cs`. |
| Manifest | `src/GameHoverDetails/info/extension.yaml` |

## Settings

**Add-ons → Extension settings → Generic → GameHoverDetails.** Enable + Fullscreen toggles sit above a non-clickable **Settings** heading and a native Playnite `TabControl` (**Fields**, **Display**, **Styling**, **Layout**; no custom `TabControl`/`TabItem` templates). Live preview on the right.

- **Strings** — `Localization/{locale}.xaml`; English fallback. RTL (e.g. Hebrew) sets **inner** hover/settings `FlowDirection` from Playnite language / main window and mirrors placement. New UI copy: `en_US.xaml` first, then **every** locale (skill **`playnite-plugin-dev`** → Localization).
- **Nesting** — checkbox-owned options indent **25 DIP** so they line up with the checkbox **label**. Dependent controls go in a `SettingsNestedGroup` (`Margin="25,12,0,0"`, `Visibility` bound to the parent checkbox) right after that checkbox, recursively (Show icons → style / size / Show icon background → color picker). Always-on controls come first. `SettingsParentCheckBox` and `SettingsFieldTitle` must stay `BasedOn` the Playnite `CheckBox` / `Label` type (Autogrid-like margins `0,0,0,4` / `0,16,0,4`, no custom `FontSize` / `FontWeight`). Stock `Label` / `CheckBox` only.
- **Fields tab** — ordered list (top = first in hover), **↑↓** / **Remove**, **Add field** (unused list + live search; stays open for multi-pick). Compact. Max **five**. Factory: Time Played, Last Played, Library, Developer.
- **Styling** — fanart mode hides the fill color picker. Editing a swatch/hex or **Reset to default colors** turns theme-sync off.

| Control | Default | Notes |
|---------|---------|-------|
| Enable hover details | on | |
| Show hover in Fullscreen | off | Toggle from Desktop; processes are separate |
| Use game background | off | Regular fill `#FF1C1C1E` @ 90%; on → opacity 50% |
| Use Playnite theme colors | off | |
| Show border | off | Color nested under the checkbox |
| Show dividers | on | 1px between blocks; nested color `#FF444444` |
| Appear delay | 30 ms | 0–500 |
| Width | 188 px | 120–500 |
| Field columns | 1 | 1–3; Cover / background / description span full width |
| Field spacing | 10 | 4–36 DIP |
| Padding | 12 DIP | 4–32 |
| Regular text size | 14 | 9–20 |
| Hide empty fields | off | Omit blocks with no value / no art |
| Show titles | on | Title size nested, default 10 (8–16) |
| Show icons | on | Huge Icons Stroke Rounded; also Unicons, Phosphor, Sketchy Icons, Iconsax Bulk, Pixel Icon Library, Pixelarticons |
| Icon size | 19 DIP | 8–40 chip; padding 0–16 around glyph (default 8; chip grows) |
| Show icon background | on | Soft rounded default; Circle / Rectangle / Rounded / Squircle / Arch / Tile / Leaf; fill `#FF121212` |

## Gotchas

- Keep **`GameHoverDetails_BA249C5D`**, **`GameHoverDetails.dll`**, and plugin **`Guid`** stable for shipped users.
- Do not add a second XAML `DataTemplate` for field rows — `Fill` is the only field-list tree.
- **`EndEdit`** only persists JSON. Re-assigning hex/field lists on Save unchecks theme-sync and rebuilds the preview. Flush hover at **ApplicationIdle**; skip chrome/fanart decode while the popup is closed (Save used to freeze Playnite 1–3s). Settings attach once (`Loaded` + `DataContextChanged`). Preview art is cached; fallback library image loads are capped. Preview shadow is an offset border, not `DropShadowEffect`. Hover live-updates are suppressed for the settings session and flushed once on Save/Cancel.
- Do not set **`FontWeight`** on **`TabItem`** (selected-tab SemiBold inherits into every checkbox and label). Bold only the tab **header chrome**. Slider titles are theme `Label`s, not SemiBold. CheckBox/Label keyed styles without `BasedOn` fall back to WPF’s 12px chrome.
- Do not use **`MainWindow.MouseLeave`** to close the popup (spurious leave when a `Popup` opens).
- Do not set **`Popup.IsOpen = false`** to re-place when switching games. Re-assign `PlacementTarget` and call **`NudgePopupToApplyNewSize`**.
- Do not replay the enter opacity storyboard (or appear delay) when switching games while the popup is open — setting opacity to 0 for layout is the details-mode blink. Fade and `ShowDelayMs` are **first open only**. Watchdog / hide-debounce must **switch in place** when the pointer is over a different game, not hide.
- Do not rely on **`Application.Deactivated`** alone: in-app plugin windows deactivate **`MainWindow`** only. Do not block re-show whenever **`MainWindow.IsActive`** is false (that broke hover after leaving Playnite and mousing back). Clear context-menu suppress on deactivate.
- Foreground check must ignore HWNDs whose **`HwndSource.RootVisual`** is not a **`Window`**. Our own popup, tooltips, menus, and combo drop-downs are in-process popup HWNDs; counting them as rivals loops hide/show.
- Sticky suppress flags must expire, and errors must not latch on the first exception — both look like “hover died until I restarted Playnite”.
- **`HideEmptyFields`** must not probe a field by loading its art: **`HoverBitmapLoader`** has no cache, so emptiness check + render would decode twice. Image-backed fields decide emptiness after their single load; text fields use **`ShouldOmitEmptyText`**.
- Do not call **`VisualTreeHelper.GetParent`** on **`Mouse.DirectlyOver`** (or keyboard focus). Text inlines (`Run`, `Span`, `Hyperlink`) are not Visuals. Use **`GetTreeParent`**.
- Do not poll hit-testing to close on hotkeys; **`PreviewKeyDown`** hides only after the key is processed **and** the pointer is no longer on a game.

## Preview vs hover parity

The settings preview and the live hover must look the same. Checklist when editing either:

- **One builder.** `HoverFieldListBuilder.Fill` is the single field-list visual tree. `GameHoverDetailsHoverService` owns fingerprint, width, chrome, frost and placement, then calls `Fill` with `HoverFieldListSource.ForLiveGame` (`OmitEmptyArt = true`). `GameHoverDetailsSettingsView` XAML only wraps preview chrome (`PreviewChromeBorder`, fanart, tint, dim-when-disabled); field rows go in `PreviewFieldsHost` (`StackPanel`) via the same `Fill`.
- **Preview source.** `OmitEmptyArt = false`: missing Icon/Cover/Background fall through to sample text (a normal row). Art uses the settings cache / fallback library icon. Values use `HoverFieldFormatter`, then `HoverPreviewSampleText` when the library game has no data. Platform icons come from the sample game when present.
- **Titles.** Game-art keys (`HoverFieldCatalog.IsGameArtImageField`: Icon, Cover Image, Background Image) have no title row (`TryAppendGameArtRow`). Do not add titles for them in a parallel preview path.
- **Icon-only.** When Icon is the only selected field and the bitmap loads, show Name beside the 40 DIP icon (`onlyIconSelected`), text `VerticalAlignment="Center"`.
- **Columns.** `HoverFieldColumnCount` (1–3, default 1) packs non-spanning fields left to right, then down. Cover, Background and Description span the full inner width (flush the current row first). Omitted-art slots leave no hole. One-column mode keeps the original stacked separators and insets.
- **Icons.** Inline catalog glyphs (Phosphor / Unicons / Huge Icons via `HoverIconStyle`) sit in a chip column sized `HoverIconChipOuterSizeDip` (size + 2× padding; default 32 DIP) with a 10 DIP gap to text, when `ShowFieldInlineIconsInHover` and the field is not game-art. Glyph size `HoverIconGlyphFontSize`; chip corners from `HoverIconChipShape` (`ResolveIconChipCornerRadius`); `HideIconChipBackground` makes `HoverChromePalette.GlyphChipBackground` transparent. With icons off the body is full width (no reserved column).
- **Stat row.** Titles and inline icons both on: one grid row, chip | stacked label + value (`ConfigureFieldLabelTextBlock` + body). No full-width title above the chip.
- **Separators.** `AppendFieldBlockSeparator` uses `SeparatorPadDip` (0.5× block spacing) and `HoverChromePalette.Separator`. `HideFieldDividers` drops the 1px line (`Height` 0) but keeps spacer margins. The last-block bottom inset is always trimmed (`TrimLastContentBottomMargin`).
- **Description.** Plain text only: `HoverDetailValuePresenter.HtmlToPlainText`, then the 3-line `FormattedText` clamp + ellipsis. No HTML inlines, bold or links (hover dismisses when the pointer enters the panel).
- **Fanart chrome.** Paint overview art with an `ImageBrush` on a stretch `Border` (`PreviewCoverHost` / hover `coverHost`). Never a layout-participating `Image`/`Canvas` in the chrome (the panel became as tall as the bitmap). Frost snapshots use a non-measuring overlay around the `Image` for the same reason. `Stretch.UniformToFill` crops overflow; height follows the field list; fanart covers the panel edge to edge under the padding (clip to the 8 DIP corner radius).
- **Width.** Preview and hover both use `HoverWidth` (`ResolveHoverPanelWidth()`). Do not scale fanart wider than the slider or cap the preview at 216/280.
- **Settings kept in sync in the preview:** `HideFieldTitlesInHover`, `ShowFieldInlineIconsInHover`, `HideIconChipBackground`, `HideFieldDividers`, `HidePanelBorder`, `HoverChromeDividerHex`, `HoverBodyFontSize` / `HoverTitleFontSize` (line heights `18/13` and `14/10.5`), `HoverIconStyle` / `HoverIconChipSizeDip` / `HoverIconChipPaddingDip` / `HoverIconChipShape`, `HoverFieldColumnCount` / `HoverFieldBlockSpacingDip` / `HoverContentPaddingDip`, `UseGameBackground` / `HoverBackgroundStyle` (fanart + opacity-scaled `#000000` tint), `HoverChromeBackgroundOpacity`, `UseThemeChrome` / custom chrome (`HoverChromePalette`), and inner width relative to `HoverWidth` (`HoverContentPaddingDip` each side; hover inset is 2× that).

