# Playnite extensions monorepo — agent handoff

## What this repo is

This repository is a reusable **Playnite extension monorepo**. Each extension owns its code, project file, manifests, icon, and release metadata under **`src/<PluginName>/`** and is registered in **`src/extensions.json`**.

## Current extensions

- **Autogrid** (`autogrid`) — GenericPlugin, `net462`, WPF. Extension-specific notes live in **`src/Autogrid/AGENTS.md`**.

## Repository layout

| Area | Path |
|------|------|
| Extension index | `src/extensions.json` |
| Extension project | `src/<PluginName>/<PluginName>.csproj` |
| Extension source | `src/<PluginName>/src/` |
| Extension manifests | `src/<PluginName>/info/` |
| Build scripts | `scripts/*.ps1` |
| Package artifacts | `artifacts/releases/<key>/` |
| Build artifacts | `artifacts/builds/<key>/` |

## Build and package commands

- Validate one extension: **`.\scripts\validate-extension.ps1 -Extension <key>`**
- Build one extension: **`.\scripts\build-plugin.ps1 -Extension <key>`**
- Package one extension: **`.\scripts\build-artifacts.ps1 -Extension <key> -VerifyInstaller`**
- Scaffold a new extension: **`.\scripts\new-extension.ps1 -Name MyPlugin -Key myplugin -Type GenericPlugin -Author <name>`**

The package flow is intentionally **package-only**: it creates `.pext` and `.zip` artifacts and prints the expected GitHub Release tag / `PackageUrl`, but it does not create a GitHub Release.

## Cursor rules (project)

Under **`.cursor/rules/`** (apply when matching files are in context):

- **`playnite-extensions.mdc`** — Playnite .NET / WPF / `extension.yaml` / settings / threading / reflection cautions.
- **`playnite-ci-packaging.mdc`** — GitHub Actions on Windows, scripts / packaging hints.

Copy these rules into other Playnite plugin repos if you want the same agent behavior.

## Skills in this repo

Generic Playnite skills (prefer these for new work):

| Skill | Use when |
|-------|----------|
| **`playnite-extension-build`** | Compile, `artifacts/builds/`, csproj / SDK |
| **`playnite-extension-debug`** | Logs, UI thread, view gates, reflection / “does nothing” |
| **`playnite-extension-release`** | `.pext`, per-extension installer manifests, release artifacts, PlayniteAddonDatabase YAML |

## Reusing rules and skills in other projects

- Shared rules and skills are tracked in this repo. Keep them generic and avoid Autogrid-only paths in shared guidance.
- Use **`src/extensions.json`** rather than hardcoded paths when adding automation.

Read the **`SKILL.md`** files under **`.cursor/skills/`** when the user asks to build, debug, release, or extend Playnite extensions.
