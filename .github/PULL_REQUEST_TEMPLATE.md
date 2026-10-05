# Pull Request

## Add-on

- Key from `src/extensions.json`:
- Kind: plugin / theme

## What changed

-

## Validation

- [ ] `./scripts/validate-extension.ps1 -Extension <key> -Mode Ci` (Windows)
- [ ] Build: `build-plugin.ps1` / `build-theme.ps1` (Windows)
- [ ] `dotnet test tests/Tests.csproj -c Release` (plugins, Windows)
- [ ] `npm run check:tokens` + `npm run check:layout` (themes)
- [ ] `npm run check:readmes` (if manifests, tags, or docs changed)
- [ ] Screenshots re-rendered (theme UI changes)

> Can't run the Windows steps (macOS/Linux)? Say so here and keep the PR
> to docs, previews, tokens, or static XAML so it can be reviewed without
> a Playnite run.
