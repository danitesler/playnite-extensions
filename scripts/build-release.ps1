$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
$proj = Join-Path $root "src\Autogrid\Autogrid.csproj"
$out = Join-Path $root "artifacts\Release"
New-Item -ItemType Directory -Force -Path $out | Out-Null
& dotnet build $proj -c Release -o $out
Write-Host "Output: $out (Autogrid.dll + extension.yaml for Playnite)"
