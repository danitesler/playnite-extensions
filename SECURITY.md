# Security Policy

## Supported versions

Only the latest released version of each add-on is supported
(tags like `autogrid-v1.1.1` in
[Releases](https://github.com/danitesler/playnite-extensions/releases)).
Unreleased code on `main` / feature branches is not supported.

## Reporting a vulnerability

Do not open a public issue for anything sensitive
(RCE, arbitrary file write, credential exfiltration, supply-chain compromise).

Use **GitHub > Security > Report a vulnerability**
(private vulnerability reporting) on this repo.
If that is unavailable, open a minimal issue asking for a contact
without including details.

Include: affected add-on and version/tag, Playnite version,
reproduction steps or PoC, and impact.

## Response

This is a solo-maintained project. I aim to acknowledge reports
within 7 days and will keep you updated on fix and release timing.
If a fix needs a Playnite client change or upstream package,
I will say so.

## Scope

In scope: plugin C# code under `src/*/`, theme XAML under
`src/themes/*/`, packaging and install scripts under `scripts/`,
and this repo's GitHub Actions workflows.

Out of scope: Playnite itself, third-party themes/plugins,
and social-engineering or physical-access reports.

## Hardening in place

- Plugin releases are built by `scripts/build-artifacts.ps1 -VerifyInstaller`
  via `.github/workflows/release.yml`.
- Per-add-on releases are tagged `{key}-v{version}` so a fix ships
  as a new tag users can verify.
- Do not submit PRs with prebuilt `.pext`/`.pthm`, `bin/`, or `obj/`.
