# Shared helpers for resolving extension profiles and small manifest fields.

function Get-RepoRoot {
    return (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
}

function Join-RepoPath {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Path
    )

    if ([System.IO.Path]::IsPathRooted($Path)) {
        return $Path
    }

    return (Join-Path (Get-RepoRoot) $Path)
}

function Get-ExtensionProfile {
    param(
        [string]$Extension = "autogrid"
    )

    $profilesPath = Join-RepoPath "src/extensions.json"
    if (-not (Test-Path $profilesPath)) {
        throw "Extension profile index not found at $profilesPath"
    }

    $profiles = Get-Content -Raw -Path $profilesPath | ConvertFrom-Json
    $profile = $profiles.extensions | Where-Object { $_.key -eq $Extension } | Select-Object -First 1
    if (-not $profile) {
        $available = ($profiles.extensions | ForEach-Object { $_.key }) -join ", "
        throw "Extension '$Extension' was not found in $profilesPath. Available extensions: $available"
    }

    return $profile
}

function Get-YamlScalar {
    param(
        # Untyped: [string[]] rejects arrays that contain blank lines from Get-Content on multi-line YAML.
        [Parameter(Mandatory = $true)]
        $Lines,

        [Parameter(Mandatory = $true)]
        [string]$Key
    )

    $pattern = "^{0}:\s*(.+)$" -f [regex]::Escape($Key)
    foreach ($line in @($Lines)) {
        if ($null -eq $line) { continue }
        if ($line -match $pattern) {
            return $Matches[1].Trim().Trim('"').Trim("'")
        }
    }

    return ""
}

function Get-YamlFirstPackageScalar {
    param(
        [Parameter(Mandatory = $true)]
        $Lines,

        [Parameter(Mandatory = $true)]
        [string]$Key
    )

    $inPackages = $false
    foreach ($line in @($Lines)) {
        if ($null -eq $line) { continue }
        if ($line -match "^Packages:\s*$") {
            $inPackages = $true
            continue
        }

        if (-not $inPackages) {
            continue
        }

        if ($line -match "^[A-Za-z][A-Za-z0-9]*:\s*" -and $line -notmatch "^Packages:\s*$") {
            break
        }

        if ($line -match "^\s+-\s+$([regex]::Escape($Key)):\s*(.+)$") {
            return $Matches[1].Trim().Trim('"').Trim("'")
        }

        if ($line -match "^\s+$([regex]::Escape($Key)):\s*(.+)$") {
            return $Matches[1].Trim().Trim('"').Trim("'")
        }
    }

    return ""
}

function Get-ExtensionManifestInfo {
    param(
        [Parameter(Mandatory = $true)]
        $Profile
    )

    $manifestPath = Join-RepoPath $Profile.extensionManifest
    if (-not (Test-Path $manifestPath)) {
        throw "extension.yaml not found at $manifestPath"
    }

    $lines = Get-Content -Path $manifestPath
    return [pscustomobject]@{
        Path    = $manifestPath
        Id      = Get-YamlScalar -Lines $lines -Key "Id"
        Name    = Get-YamlScalar -Lines $lines -Key "Name"
        Author  = Get-YamlScalar -Lines $lines -Key "Author"
        Version = Get-YamlScalar -Lines $lines -Key "Version"
        Module  = Get-YamlScalar -Lines $lines -Key "Module"
        Type    = Get-YamlScalar -Lines $lines -Key "Type"
    }
}

# PlayniteAddonDatabase `Type` values differ from extension.yaml plugin types.
function Get-AddonDatabaseType {
    param(
        [Parameter(Mandatory = $true)]
        [string]$PluginType
    )

    switch ($PluginType) {
        "GenericPlugin" { return "Generic" }
        "MetadataPlugin" { return "MetadataProvider" }
        "LibraryPlugin" { return "GameLibrary" }
        default { throw "Unsupported plugin type '$PluginType'." }
    }
}

function Get-ExpectedPextName {
    param(
        [Parameter(Mandatory = $true)]
        [string]$AddonId,

        [Parameter(Mandatory = $true)]
        [string]$Version
    )

    return "{0}_{1}.pext" -f $AddonId, ($Version -replace "\.", "_")
}

function Get-PlayniteToolboxExe {
    param(
        [string]$ToolboxExe = $env:TOOLBOX_EXE
    )

    if ($ToolboxExe -and (Test-Path -LiteralPath $ToolboxExe)) {
        return (Resolve-Path -LiteralPath $ToolboxExe).Path
    }

    $candidates = @(
        "$Env:LOCALAPPDATA\Playnite\Toolbox.exe",
        "$Env:ProgramFiles\Playnite\Toolbox.exe",
        "${Env:ProgramFiles(x86)}\Playnite\Toolbox.exe",
        "$Env:LOCALAPPDATA\Programs\Playnite\Toolbox.exe"
    )

    $onPath = Get-Command "Toolbox.exe" -ErrorAction SilentlyContinue
    if ($onPath -and $onPath.Source) {
        $candidates += $onPath.Source
    }

    foreach ($candidate in $candidates) {
        if ($candidate -and (Test-Path -LiteralPath $candidate)) {
            return (Resolve-Path -LiteralPath $candidate).Path
        }
    }

    return $null
}

