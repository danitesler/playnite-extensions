# GameHoverDetails — extension notes

## What this extension does

**GameHoverDetails** is a **Playnite** **GenericPlugin** (`net462`, **WPF**) that shows a **hover popup** anchored to the library tile when the cursor is over an item whose `DataContext` resolves to a **`Game`**. Content is **user-configurable** (width, up to five detail fields).

## Implementation

1. **Lifecycle** — `GameHoverDetailsPlugin` attaches on `OnApplicationStarted` via `UIDispatcher` / `ApplicationIdle`, mirroring Autogrid’s main-window readiness pattern. Detaches on `OnApplicationStopped`.
2. **Hover** — `GameHoverDetailsHoverService` handles **`PreviewMouseMove`**: resolves **`Game`** and anchor synchronously and updates the popup immediately (no trailing debounce for show/switch). A **separate ~70ms trailing debounce** hides the popup after the pointer leaves game tiles (reduces flicker over gaps). With an anchor, placement uses **`PlacementMode.Custom`** and **`CustomPopupPlacementCallback`**: prefer **to the right** of the target, else **to the left** (WPF picks the first option that fits on-screen). **`ClampPopupToVirtualScreen`** only adjusts **vertical** position in that mode so horizontal side choice is preserved. **`PopupAnimation.None`** plus a short **opacity-only** storyboard runs when opening or switching games; **same `Game.Id`** with unchanged field keys skips rebuilding inner content and replays no enter animation (placement/anchor still updates). Do **not** use **`MainWindow.MouseLeave`** to close the popup: opening a **`Popup`** caused spurious leave events and flicker.
3. **Fragility** — Playnite does not document item `DataContext` shapes; templates may change between versions. Failures are latched and logged once; the service detaches.

## Key files

| Area | Path |
|------|------|
| Plugin lifecycle | `src/GameHoverDetails/src/GameHoverDetailsPlugin.cs` |
| Hover UI | `src/GameHoverDetails/src/GameHoverDetailsHoverService.cs` |
| Settings | `src/GameHoverDetails/src/GameHoverDetailsSettings.cs`, `GameHoverDetailsSettingsView.xaml` |
| Field catalog / text | `HoverFieldCatalog.cs`, `HoverFieldFormatter.cs` |
| Manifest | `src/GameHoverDetails/info/extension.yaml` |

## Settings

- **Add-ons → Extension settings → Generic → GameHoverDetails**: **tooltip appear delay** (0–500 ms, 0 = immediate), hover width (120–500 px), up to **five** detail fields (same catalog as Playnite’s details panel; factory default **Icon**, **Name**, **Last Played** on first run). The hover popup **dismisses as soon as the pointer moves onto the panel** (hit-testable chrome; you cannot “rest” the cursor on the tooltip). Body is a single stacked column with no inner scroll. Settings use a **single ordered list** (top = first in hover): **↑ / ↓** and **Remove** per row; **Add field** is a dropdown of catalog entries not yet selected (appends to the bottom when fewer than five are shown).

## Gotchas

- Keep **`GameHoverDetails_BA249C5D`**, **`GameHoverDetails.dll`**, and plugin **`Guid`** stable for shipped users.
- Do not use **`MainWindow.MouseLeave`** to close the hover popup (spurious leave when a `Popup` opens).
