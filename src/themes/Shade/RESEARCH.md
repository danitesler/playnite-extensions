# Shade — research & sources

Unofficial theme inspired by shadcn/ui; not affiliated with, endorsed by or sponsored by shadcn or the shadcn/ui project. The names below are references to what inspired the look.

## Sources

| What | Where |
|------|-------|
| Tokens | shadcn registry `apps/v4/public/r/colors/zinc.json` (`cssVarsV4.dark`), radius scale from shadcn's `globals.css` (`@theme inline`) |
| Components | `shadcn-ui/ui` `apps/v4/registry/new-york-v4/ui/*.tsx` (Button, Input, Select, Checkbox, RadioGroup, Slider, Progress, Tabs, Tooltip, DropdownMenu, Card, Sidebar, ScrollArea, Toggle, Command); blocks `sidebar-07`, `dashboard-01` |
| Icons | lucide 1.48.0 (ISC), `info/LICENSE-lucide.txt` |

## Motion

How shadcn/ui moves, for the interactive layer (Play hover, cover hover, cover buttons, empty page). shadcn is deliberately quiet: Tailwind transitions, a focus ring, and tw-animate-css entrances for overlays. No ripple, glow or lift.

| Source | What it says |
|--------|--------------|
| `new-york-v4/ui/button.tsx` (raw GitHub) | base `transition-all`, `focus-visible:ring-[3px] ring-ring/50`; `default` variant `hover:bg-primary/90`; `outline` `hover:bg-accent`; no active classes |
| Tailwind docs, transition-property | `transition-all` = `all`, 150ms, `cubic-bezier(0.4, 0, 0.2, 1)` |
| `new-york-v4/ui/popover.tsx` | open: `animate-in fade-in-0 zoom-in-95` plus slide-in-from-side classes; closed: `animate-out fade-out-0 zoom-out-95` |
| `new-york-v4/ui/empty.tsx` | `Empty` p-6/md:p-12 centered column gap-6; `EmptyMedia` icon variant `size-10 rounded-lg bg-muted`, 24px icon; `EmptyTitle` `text-lg font-medium tracking-tight`; no animation |

Numbers used: 150ms and `0.4,0,0.2,1` everywhere (KeySpline); Play hover = the plate fades to 90 percent (`hover:bg-primary/90`; the theme's hover brush is the same color at alpha, so the plate itself dims, not a plate over a plate); secondary tile 80 percent; hover ring on covers fades in 150ms; cover buttons enter like a popover (opacity, scale 0.95 to 1, 8px rise = `slide-in-from-*-2` at 0.5rem) with 30ms between the two; the cover image scales to 1.05 over 150ms (the shadcn artwork examples use `hover:scale-105`; not re-read in this pass, so treat that one as from memory); scrim at 0.5 like the dialog overlay.

Left out on purpose: pressed layer (shadcn defines no active style), glow, lift, loops, generated sprites.

Could not verify: slide distance (`-2`) and the artwork `hover:scale-105` from source this pass; how the 3px ring `FocusVisual` and the animated hover ring read together in Playnite; everything in Playnite itself.
