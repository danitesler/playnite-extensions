# Shared helpers for resolving extension profiles and small manifest fields.
#
# src/extensions.json lists what cannot be derived (key, name, kind, dir, addonId, pluginType, requiredApiVersion) plus
# the repository URL. Get-ExtensionProfile fills in everything else from the add-on's folder, so paths and URLs follow
# one layout; a field set explicitly on a row still wins.

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

function Get-ExtensionIndex {
    $indexPath = Join-RepoPath "src/extensions.json"
    if (-not (Test-Path $indexPath)) {
        throw "Extension profile index not found at $indexPath"
    }

    return (Get-Content -Raw -Path $indexPath | ConvertFrom-Json)
}

function Save-ExtensionIndex {
    # One extension per line keeps the index short and diffs readable (ConvertTo-Json's layout in PowerShell 5.1 is not).
    param([Parameter(Mandatory = $true)] $Index)

    $rows = @($Index.extensions | ForEach-Object { "        " + (($_ | ConvertTo-Json -Compress) -replace "\\u0027", "'") })
    $json = @(
        "{"
        "    ""repository"": ""$($Index.repository)"","
        "    ""branch"": ""$($Index.branch)"","
        "    ""databasePrefix"": ""$($Index.databasePrefix)"","
        "    ""extensions"": ["
        ($rows -join ",`n")
        "    ]"
        "}"
    ) -join "`n"
    Set-Content -Path (Join-RepoPath "src/extensions.json") -Value $json -Encoding UTF8
}

function Complete-ExtensionProfile {
    param(
        [Parameter(Mandatory = $true)] $Profile,
        [Parameter(Mandatory = $true)] $Index
    )

    $dir = $Profile.dir.TrimEnd("/")
    $isTheme = $Profile.kind -eq "theme"
    $repository = $Index.repository.TrimEnd("/")
    $defaults = [ordered]@{
        slug               = $Profile.key
        extensionManifest  = if ($isTheme) { "$dir/info/theme.yaml" } else { "$dir/info/extension.yaml" }
        installerManifest  = "$dir/info/InstallerManifest.yaml"
        databaseManifest   = "$dir/info/$($Index.databasePrefix)$($Profile.key).yaml"
        sourceUrl          = "$repository/tree/$($Index.branch)/$dir"
        rawBaseUrl         = ($repository -replace "^https://github\.com/", "https://raw.githubusercontent.com/") + "/$($Index.branch)"
        releaseBaseUrl     = "$repository/releases/download"
        tagPattern         = "{key}-v{version}"
    }
    if ($isTheme) {
        $defaults.themeSource = "$dir/src"
        $defaults.outputPath = "artifacts/builds/themes/$($Profile.key)"
    }
    else {
        $defaults.project = "$dir/$(Split-Path -Leaf $dir).csproj"
        $defaults.outputPath = "$dir/bin/Release/net462"
        $defaults.directoryBuildProps = "$dir/Directory.Build.props"
    }

    foreach ($name in $defaults.Keys) {
        if (-not ($Profile.PSObject.Properties.Name -contains $name)) {
            $Profile | Add-Member -NotePropertyName $name -NotePropertyValue $defaults[$name]
        }
    }

    return $Profile
}

function Get-ExtensionProfile {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Extension
    )

    $index = Get-ExtensionIndex
    $profile = $index.extensions | Where-Object { $_.key -eq $Extension } | Select-Object -First 1
    if (-not $profile) {
        $available = ($index.extensions | ForEach-Object { $_.key }) -join ", "
        throw "Extension '$Extension' was not found in src/extensions.json. Available extensions: $available"
    }

    return (Complete-ExtensionProfile -Profile $profile -Index $index)
}

function Get-ExtensionKind {
    param([Parameter(Mandatory = $true)] $Profile)

    if ($Profile.kind) { return $Profile.kind }
    return "plugin"
}

function Get-ExtensionOutputPath {
    # Repo-relative build output for a configuration (the profile's outputPath is the Release one).
    param(
        [Parameter(Mandatory = $true)] $Profile,
        [string]$Configuration = "Release"
    )

    return ($Profile.outputPath -replace "([/\\])Release([/\\])", "`$1$Configuration`$2")
}

function Get-ExtensionReleaseTag {
    param(
        [Parameter(Mandatory = $true)] $Profile,
        [Parameter(Mandatory = $true)] [string]$Version
    )

    return $Profile.tagPattern.Replace("{version}", $Version).Replace("{key}", $Profile.key)
}

function Get-ExpectedPackageName {
    # Toolbox names packages <Id>_<version with dots as underscores>: .pext for plugins, .pthm for themes.
    param(
        [Parameter(Mandatory = $true)]
        [string]$AddonId,

        [Parameter(Mandatory = $true)]
        [string]$Version,

        [ValidateSet(".pext", ".pthm")]
        [string]$PackageExtension = ".pext"
    )

    return "{0}_{1}{2}" -f $AddonId, ($Version -replace "\.", "_"), $PackageExtension
}

function Get-ExpectedPackageUrl {
    param(
        [Parameter(Mandatory = $true)] $Profile,
        [Parameter(Mandatory = $true)] [string]$AddonId,
        [Parameter(Mandatory = $true)] [string]$Version
    )

    $extension = if ((Get-ExtensionKind $Profile) -eq "theme") { ".pthm" } else { ".pext" }
    $tag = Get-ExtensionReleaseTag -Profile $Profile -Version $Version
    return "$($Profile.releaseBaseUrl)/$tag/$(Get-ExpectedPackageName -AddonId $AddonId -Version $Version -PackageExtension $extension)"
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

        if ($line -match "^[A-Za-z][A-Za-z0-9]*:\s*") {
            break
        }

        if ($line -match "^\s+(-\s+)?$([regex]::Escape($Key)):\s*(.+)$") {
            return $Matches[2].Trim().Trim('"').Trim("'")
        }
    }

    return ""
}

function Get-ExtensionManifestInfo {
    # extension.yaml (plugins) or theme.yaml (themes); fields a kind does not use come back empty.
    param(
        [Parameter(Mandatory = $true)]
        $Profile
    )

    $manifestPath = Join-RepoPath $Profile.extensionManifest
    if (-not (Test-Path $manifestPath)) {
        throw "$(Split-Path -Leaf $manifestPath) not found at $manifestPath"
    }

    $lines = Get-Content -Path $manifestPath
    $info = [ordered]@{ Path = $manifestPath }
    foreach ($key in @("Id", "Name", "Author", "Version", "Module", "Type", "Mode", "ThemeApiVersion")) {
        $info[$key] = Get-YamlScalar -Lines $lines -Key $key
    }
    return [pscustomobject]$info
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

function Get-PlayniteToolboxExe {
    # An installed or given Toolbox.exe; with -Download, fetch the latest Playnite release into TEMP when none is found.
    param(
        [string]$ToolboxExe = $env:TOOLBOX_EXE,
        [switch]$Download
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

    # A copy downloaded by an earlier run.
    $extractPath = Join-Path $env:TEMP "Playnite-Toolbox"
    if (Test-Path $extractPath) {
        $cached = Get-ChildItem -Path $extractPath -Filter "Toolbox.exe" -Recurse | Select-Object -First 1 -ExpandProperty FullName
        if ($cached) { return $cached }
    }

    if (-not $Download) {
        return $null
    }

    Write-Host "Toolbox.exe not found locally; downloading Playnite to resolve Toolbox..."
    $release = Invoke-RestMethod -Uri "https://api.github.com/repos/JosefNemec/Playnite/releases/latest"
    $archiveAsset = $release.assets | Where-Object { $_.name -match "\.(zip|7z)$" } | Select-Object -First 1
    if (-not $archiveAsset) {
        throw "Unable to resolve Playnite archive asset (.zip or .7z) from latest release."
    }

    $archivePath = Join-Path $env:TEMP $archiveAsset.name
    Invoke-WebRequest -Uri $archiveAsset.browser_download_url -OutFile $archivePath

    if ($archiveAsset.name -match "\.zip$") {
        Expand-Archive -Path $archivePath -DestinationPath $extractPath -Force
    }
    else {
        $sevenZip = "C:\Program Files\7-Zip\7z.exe"
        if (-not (Test-Path $sevenZip)) {
            throw "7z.exe not found at $sevenZip. Install 7-Zip or pass -ToolboxExe."
        }
        New-Item -ItemType Directory -Path $extractPath -Force | Out-Null
        & $sevenZip x $archivePath "-o$extractPath" -y | Out-Null
    }

    $found = Get-ChildItem -Path $extractPath -Filter "Toolbox.exe" -Recurse | Select-Object -First 1 -ExpandProperty FullName
    if (-not $found) {
        throw "Toolbox.exe not found after Playnite extraction. Pass -ToolboxExe to continue."
    }
    return $found
}
