# AutoStatus — extension notes

## What this extension does

Playnite **GenericPlugin** (`net462`, WPF settings view). Two completion-status rules:

1. **Stopped playing** — games in the watched status (default **Playing**) whose last play is older than **N days** (default 30, 1–365) move to the target status (default **On Hold**).
2. **Started again** — when a game starts and its status is one of the watched set (default **On Hold**, **Abandoned**, **Plan to Play**), it moves to the target (default **Playing**).

Requested in Playnite issues #2828 (status rules from last played), #1028 (Abandoned), #3377 (status not updated when a Plan to Play game is played).

## Implementation

- **Stale pass** — `AutoStatusPlugin.RunStalePass` on the UI dispatcher: at `ApplicationIdle` after startup, every **6 h** (`DispatcherTimer`, Playnite can run for days in Fullscreen), after settings `EndEdit`, and from **Extensions → AutoStatus → Apply status rules now** (shows a dialog with the count). Automatic passes post one replaceable notification (`AutoStatus_StaleMoved`) only when something changed. Updates go through `Database.BufferedUpdate()`.
- **Stale decision** — `StatusRules.IsStale`: requires `LastActivity` (never played in Playnite → never touched; covers console / manually tracked games). Reference time = max(`LastActivity`, mark time).
- **Marks** — `StatusMarks` (`status-marks.json` in the plugin data folder) records when a game **entered** the watched status, from `Games.ItemUpdated` (old status ≠ new status). Without it, re-marking an old game as Playing would be undone on the next pass. Marks for games that left the status are dropped each pass; saves are debounced 5 s and flushed on stop.
- **Resume** — `OnGameStarted` → dispatcher → `StatusRules.ShouldResume` → `Games.Update`.
- **Defaults** — first `OnApplicationStarted` with statuses in the DB: match Playnite stock names (English, then Playnite's `LOCCompletionStatus*` strings, best effort) and set `DefaultsApplied`. Unmatched statuses stay empty; `VerifySettings` asks the user to pick them when the rule is on.

## Key files

| Area | Path |
|------|------|
| Plugin lifecycle, passes, events | `src/AutoStatus/src/AutoStatusPlugin.cs` |
| Rule decisions (no Playnite types) | `src/AutoStatus/src/StatusRules.cs` |
| Mark persistence | `src/AutoStatus/src/StatusMarks.cs` |
| Settings model | `src/AutoStatus/src/AutoStatusSettings.cs` |
| Settings UI | `src/AutoStatus/src/AutoStatusSettingsView.xaml` |
| Loc helper | `src/AutoStatus/src/AutoStatusLoc.cs` |
| Localization | `src/AutoStatus/Localization/*.xaml` (Playnite Crowdin set; English fallback) |

## Settings

**Add-ons → Extension settings → Generic → AutoStatus.** Stock controls only, Autogrid margins. Each rule's options nest **25 DIP** under its checkbox and collapse when it is off.

| Control | Default | Notes |
|---------|---------|-------|
| Enable AutoStatus | on | |
| Change the status of games I stopped playing | on | watched status, days slider, target status |
| Not played for this many days | 30 | 1–365 |
| Change the status of a game when I start it | on | checkbox list of watched statuses, target status |

## Gotchas

- Keep **`AutoStatus_66B775F8`**, **`AutoStatus.dll`**, and plugin **`Guid`** stable once shipped.
- Completion statuses are user data (renamable, deletable). Store **Ids**, never names; skip a rule when its target Id no longer exists.
- Do not treat "never played" as stale. Do not drop the marks file: it is what keeps a freshly re-marked game from bouncing back.
- New UI copy: `en_US.xaml` first, then **every** locale (**`.cursor/rules/playnite-localization.mdc`**), and keep the English fallbacks in code identical to `en_US.xaml`.
- `StatusRules` stays free of Playnite/WPF types so it can be unit-tested off Windows.
