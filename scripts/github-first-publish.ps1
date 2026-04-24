#Requires -Version 5.1
<#
.SYNOPSIS
  After `gh auth login`, creates a private GitHub repo, pushes main + PR branch, opens PR #1, approves, merges.

.USAGE
  cd repo root
  gh auth login
  ./scripts/github-first-publish.ps1
  ./scripts/github-first-publish.ps1 -RepoName My-Autogrid-Fork
#>
param(
    [string] $RepoName = "playnite-autogrid"
)

$ErrorActionPreference = "Stop"
$gh = "${env:ProgramFiles}\GitHub CLI\gh.exe"
if (-not (Test-Path $gh)) {
    $gh = "gh"
}

$null = & $gh auth token 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Error "GitHub CLI is not logged in. Run: gh auth login`nOr set GH_TOKEN for a classic PAT with repo scope."
}

$root = Split-Path -Parent $PSScriptRoot
Set-Location $root

if (git remote get-url origin 2>$null) {
    Write-Warning "Remote 'origin' already exists: $(git remote get-url origin). Skipping repo create."
    Write-Host "Pushing main..."
    git checkout main 2>$null
    git push -u origin main
} else {
    Write-Host "Creating private repo $RepoName and pushing main..."
    git checkout main 2>$null
    & $gh repo create $RepoName --private --source=. --remote=origin --push -d "Playnite extension: auto-adjust desktop grid column width"
    if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
}

if (git show-ref --verify --quiet refs/heads/chore/add-editorconfig) {
    Write-Host "Pushing chore/add-editorconfig..."
    git push -u origin chore/add-editorconfig

    $prUrl = & $gh pr create --base main --head chore/add-editorconfig --title "chore: add EditorConfig" --body "Adds [.editorconfig](.editorconfig) for consistent C# / XAML formatting."
    if ($LASTEXITCODE -ne 0) {
        Write-Error "gh pr create failed: $prUrl"
    }
    Write-Host $prUrl

    $prNum = (& $gh pr list --state open --limit 1 --json number --jq ".[0].number")
    if (-not $prNum) {
        Write-Error "Could not resolve PR number."
    }
    Write-Host "Approving PR #$prNum..."
    & $gh pr review $prNum --approve --body "Approved via github-first-publish.ps1"
    if ($LASTEXITCODE -ne 0) {
        Write-Warning "Self-approve may be blocked by repo rules. Merge from the PR page or run: gh pr merge $prNum --merge"
    }

    Write-Host "Merging PR #$prNum..."
    & $gh pr merge $prNum --merge --delete-branch
    if ($LASTEXITCODE -ne 0) {
        Write-Warning "Merge failed (permissions or review rules). Finish in the GitHub UI."
        exit $LASTEXITCODE
    }
    Write-Host "Done. Pull main: git checkout main && git pull origin main"
} else {
    Write-Warning "Branch chore/add-editorconfig not found; skipped PR. Only main was pushed."
}
