# Shadcn UI Theme — theme notes

## What this is

Playnite **Desktop** theme (`ThemeApiVersion` 2.9.0, loads on Playnite 10.45+) in the style of **shadcn/ui** (new-york-v4), fully dark on the **zinc** base color. Standalone: every file it ships lives in this folder. Resource keys it adds start with `Shadcn` (profile `resourcePrefix`) and follow shadcn's CSS variables and Tailwind classes.

Playnite loading rules, overlay mechanics and the build checks are in **`.cursor/rules/playnite-themes.mdc`** and skill **`playnite-theme-dev`**.

## Sources

| What | Where |
|------|-------|
| Tokens | shadcn registry `apps/v4/public/r/colors/zinc.json` (`cssVarsV4.dark`), radius scale from shadcn's `globals.css` (`@theme inline`) |
| Components | `shadcn-ui/ui` `apps/v4/registry/new-york-v4/ui/*.tsx` (Button, Input, Select, Checkbox, RadioGroup, Slider, Progress, Tabs, Tooltip, DropdownMenu, Card, Sidebar, ScrollArea, Toggle, Command); blocks `sidebar-07`, `dashboard-01` |
| Icons | lucide 1.48.0 (ISC), `info/LICENSE-lucide.txt` |

## Files

| Path | Role |
|------|------|
| `src/tokens.css` | shadcn's CSS variables, verbatim (zinc dark + radius scale). Another shadcn palette can replace it whole. |
| `src/Constants.template.xaml` | Tokens → `Shadcn*` Color/Brush keys and Playnite's palette keys; rendered into `Constants.xaml`. |
| `src/Common.xaml` | `PopupBorder`, `ShadcnFocusVisual`, component spacing. |
| `src/Media.xaml` | lucide icons, search / clear icon templates, menu icon colors. |
| `src/Views/*`, `src/DerivedStyles/MainWindowStyle.xaml`, `src/CustomControls/SidebarItem.xaml`, `TopPanelItem.xaml` | Shell (inset dashboard). |
| `src/DefaultControls/*`, other `src/CustomControls/*` and `src/DerivedStyles/*` | Controls. |
| `info/` | `theme.yaml`, `InstallerManifest.yaml`, `danitesler_shadcnuitheme.yaml`, `icon.png`, `LICENSE-Playnite.txt`, `LICENSE-lucide.txt`. |

## Tokens

One `Color` + one `Brush` per shadcn variable: `--sidebar-accent-foreground` → `ShadcnSidebarAccentForegroundColor` / `...Brush`. Variables: background, foreground, card(-foreground), popover(-foreground), primary(-foreground), secondary(-foreground), muted(-foreground), accent(-foreground), destructive, border, input, ring, sidebar, sidebar-foreground, sidebar-primary(-foreground), sidebar-accent(-foreground), sidebar-border. Optional ones fall back the way shadcn pairs them (`popover` → `card`, `sidebar-*` → the base token), so a pasted palette without them still renders.

Opacity variants are named after the Tailwind class the component uses:

| Key | Class | Used by |
|-----|-------|---------|
| `ShadcnPrimary90` | `hover:bg-primary/90` | default Button, Play |
| `ShadcnPrimary20` | `bg-primary/20` | Progress track |
| `ShadcnSecondary80` | `hover:bg-secondary/80` | secondary Button |
| `ShadcnAccent50` | `dark:hover:bg-accent/50` | ghost hover, list and details rows |
| `ShadcnInput30` / `ShadcnInput50` | `dark:bg-input/30` / `dark:hover:bg-input/50` | Input, Select, Checkbox, RadioGroup, outline Button, active tab |
| `ShadcnRing50` | `ring-ring/50` | 3px focus ring, slider halo |
| `ShadcnDestructive60` | `dark:bg-destructive/60` | close button hover |
| `ShadcnWhite` | `bg-white` | slider thumb |

`border` and `input` stay translucent white, as in shadcn; only popup edges (`PopupBorderColor`) are flattened onto the popover, because WPF popups are layered windows. Radii: `ShadcnRadius{Sm,Md,Lg,Xl}` = Tailwind `rounded-*` from the `--radius-*` tokens, `ShadcnRadiusFull` = pill. Fonts: `--font-sans` / `--font-mono` when a palette sets them, else Segoe UI / Consolas.

## Component spacing (`src/Common.xaml`)

| Key | Value | shadcn |
|-----|-------|--------|
| `ShadcnButtonPadding` | 16,8 | Button size default (h-9, px-4) |
| `ShadcnInputPadding` | 12,7 | Input, SelectTrigger (h-9, px-3, 1px border) |
| `ShadcnDropdownMenuPadding` | 4 | DropdownMenuContent / SelectContent p-1 |
| `ShadcnDropdownMenuItemPadding` | 8,6 | DropdownMenuItem / SelectItem px-2 py-1.5 |
| `ShadcnCommandItemPadding` | 8,6 | CommandItem (list rows) |
| `ShadcnCardPadding`, `ShadcnCardHeaderMargin` | 24, 0,0,0,24 | Card py-6 px-6, gap-6 |
| `ShadcnTooltipPadding` | 12,6 | TooltipContent px-3 py-1.5 |
| `ShadcnIconSize` | 16 | size-4 |

## Shell

shadcn's inset layout (blocks `sidebar-07` / `dashboard-01`):

| File | What it draws |
|------|---------------|
| `Views/MainWindow.xaml` | Window frame in `sidebar`; the active view on a `background` card, rounded-xl, inset 8px (m-2, ml-0 beside the sidebar). Four frame-colored corner masks (`ShadcnInsetCorner`) round the card over the view's content. |
| `DerivedStyles/MainWindowStyle.xaml` | Playnite's window template with minimize / maximize / close (`ShadcnWindowButton`, 32px ghost) centered on the card header. |
| `Views/Sidebar.xaml` | Sidebar `collapsible="icon"`: no fill, no border, 16px padding. Main menu = the sidebar-07 TeamSwitcher logo (`ShadcnLogoTile`: size-8, rounded-lg, `sidebar-primary`); the top bar reuses it when the sidebar is hidden. |
| `CustomControls/SidebarItem.xaml` | SidebarMenuButton, icon mode: 32px, rounded-md, `sidebar-accent` on hover and when active. Library and Statistics draw lucide icons. |
| `Views/TopPanel.xaml` | site-header inside the card: 48px, px-4; search on the left (`ShadcnHeaderSearch`: card fill, borderless, h-8, w-64), ghost 32px icon buttons on the right, progress in the middle. |
| `CustomControls/TopPanelItem.xaml` | Button ghost, size icon-sm (32px); accent when toggled. |
| `Views/FilterPanelView.xaml`, `Views/ExplorerPanel.xaml` | Playnite's panels on p-4 spacing without separators. |
| `Views/Library.xaml` | Background art under the top bar, feathered on every edge (bitmap-cached opacity masks). |

The top bar's right padding (132px = 16px + 108px of window buttons + an 8px gap) keeps it clear of the window buttons; keep it in step with `MainWindowStyle.xaml`.

## Components

| Playnite file | shadcn component |
|---------------|------------------|
| `DefaultControls/Button.xaml` | Button: `secondary` for regular buttons, `default` for `IsDefault`; font-medium |
| `DerivedStyles/PlayButton.xaml` | Button `default` |
| `DefaultControls/ToggleButton.xaml` | Toggle `outline` (transparent, border-input, accent on hover and when on) |
| `DefaultControls/RepeatButton.xaml` | Button `outline` (dark: input/30 fill, input edge) |
| `DefaultControls/TextBox.xaml`, `PasswordBox.xaml` | Input (+ `ShadcnBareTextBox` for hosts that draw their own chrome) |
| `DefaultControls/ComboBox.xaml` | Select (trigger, SelectContent, SelectItem with the check on the right) |
| `DefaultControls/CheckBox.xaml`, `RadioButton.xaml` | Checkbox, RadioGroupItem (no hover state) |
| `DefaultControls/Slider.xaml`, `CustomControls/SliderEx.xaml` | Slider: h-1.5 muted track, primary range to the thumb center, size-4 white thumb with a primary edge and ring-4 `ring/50` on hover, drag and focus. SliderEx is `BasedOn` the Slider style. |
| `DefaultControls/ProgressBar.xaml` | Progress (primary/20 track; indeterminate = sliding segment) |
| `DefaultControls/ScrollViewer.xaml`, `Thumb.xaml` | ScrollArea scrollbar: w-2.5, no rail, rounded-full `bg-border` thumb (`ShadcnScrollAreaThumb`) |
| `DefaultControls/ToolTip.xaml` | Tooltip: `bg-foreground` / `text-background`, rounded-md, text-xs |
| `DefaultControls/ContextMenu.xaml`, `Menu.xaml` | DropdownMenu (content, items, muted icons and shortcuts, sub-menus) |
| `CustomControls/GameMenu.xaml`, `GameGroupMenu.xaml`, `TrayContextMenu.xaml` | DropdownMenu surfaces, one-line styles `BasedOn` the ContextMenu |
| `DefaultControls/TabControl.xaml` | Tabs, default variant (muted list; active trigger `input/30` with an `input` edge) |
| `DefaultControls/GroupBox.xaml` | Card, without the border line |
| `DefaultControls/ListBox.xaml` | CommandItem states (accent/50 hover, accent selected) |
| `CustomControls/SearchBox.xaml` | Input with a leading search icon and a "Search" placeholder |
| `DerivedStyles/DetailsViewItemStyle.xaml` | Details rows as CommandItems |
| `DerivedStyles/GridViewItemStyle.xaml` | Cover ring (ring-2 ring-offset-2) on hover and selection only |
| `DerivedStyles/WindowBarButton.xaml` | Ghost icon buttons; close = `destructive/60` |
| `DerivedStyles/HighlightBorder.xaml` | Input chrome for Default templates the theme does not replace |

Everything else (DataGrid, DatePicker, TreeView, Expander, game details) is Playnite's template recolored through the palette keys.

## Deviations from shadcn

- No borders on cards, the sidebar or the header, and no layout separators: surfaces and spacing carry the structure. Regular buttons are `secondary` (filled, borderless) rather than `outline`.
- No shadows (`shadow-xs`, `shadow-md`): WPF popups are layered windows and Playnite's lists redraw often.
- The logo tile dims to 90% on hover; the block has no hover state of its own there.
- Menu icons Playnite copies stay icofont glyphs (Playnite rebuilds them from `Text`/`FontFamily`), recolored to muted-foreground.

## Build and try it

```powershell
.\scripts\build-theme.ps1 -Extension shadcnuitheme -Deploy   # builds artifacts/builds/shadcnuitheme and copies it to %AppData%\Playnite\Themes\Desktop\<Id>
# restart Playnite -> Settings -> Appearance -> Theme: Shadcn UI Theme
```

Portable Playnite: add `-DeployPath <Playnite folder>\Themes`.

## Not verified yet

Built and statically checked on Linux (XML, file allowlist, resource keys, StaticResource scope, key prefix); **not yet loaded in Playnite**. First run on Windows: library (grid, details, list), game context menu, top panel dropdowns, settings tabs, game edit dialog, search (Ctrl+F), a progress dialog, keyboard focus on buttons and inputs. If Playnite rejects the theme it falls back to Default and logs the XAML error in `playnite.log`.

Layout checks: the inset card's rounded corners over the library background image (details view), window buttons centered in the card header, the sidebar at each position (Settings → Appearance → Layout), the search placeholder hiding while typing, lucide icons in the top bar and on Library / Statistics, the blue logo tile, and slider ranges ending under the thumb (grid zoom slider).
