#!/usr/bin/env bash
# Runs scripts/check-all.ps1 (every check, the old CI workflow's equivalent) on a Linux box.
# There is no hosted CI: never add GitHub Actions workflows.
#
#   scripts/check-all.sh            # everything
#   scripts/check-all.sh --quick    # skip the plugin and theme builds and the layout render
#
# Needs: PowerShell 7 (pwsh), the .NET 8 SDK, Mono (runs the net462 tests), Node 22.
#   curl -sSL https://dot.net/v1/dotnet-install.sh | bash -s -- --channel 8.0
#   dotnet tool install -g PowerShell --version 7.4.6 && sudo apt-get install mono-complete
set -euo pipefail
cd "$(dirname "$0")/.."
export PATH="$HOME/.dotnet:$HOME/.dotnet/tools:$PATH" DOTNET_ROOT="${DOTNET_ROOT:-$HOME/.dotnet}"
export DOTNET_CLI_TELEMETRY_OPTOUT=1 DOTNET_NOLOGO=1
[[ -d node_modules ]] || npm ci
args=()
[[ "${1:-}" == "--quick" ]] && args+=(-Quick)
exec pwsh -NoProfile -File scripts/check-all.ps1 "${args[@]}"
