# Shared local build/deploy lifecycle. Dot-source after theme-tools.ps1.
function Get-PlayniteBuildContext {
    param(
        [string]$DataPath = "", [string]$DeployPath = "", [string]$PlayniteExe = "",
        [ValidateSet("Desktop", "Fullscreen")] [string]$Mode = "Desktop"
    )
    if ($env:OS -ne "Windows_NT" -or $env:CI -eq "true") { return $null }
    if ($DataPath -and -not (Test-Path -LiteralPath $DataPath -PathType Container)) { throw "Playnite data folder not found: $DataPath" }
    if ($PlayniteExe -and -not (Test-Path -LiteralPath $PlayniteExe -PathType Leaf)) { throw "Playnite executable not found: $PlayniteExe" }
    if ($DeployPath -and -not $DataPath -and -not (Get-PlayniteDataPath -DeployPath $DeployPath)) {
        throw "DeployPath '$DeployPath' is not next to a Playnite config.json. Refusing to deploy or restart another install."
    }

    $running = @(Get-PlayniteProcess | Where-Object { $_.ProcessName -in @("Playnite.DesktopApp", "Playnite.FullscreenApp") })
    $explicitTarget = $DataPath -or $DeployPath -or $PlayniteExe
    if (-not $PlayniteExe -and -not $explicitTarget -and $running.Count -gt 0) { $PlayniteExe = $running[0].Path }
    if (-not $PlayniteExe -and ($DataPath -or $DeployPath)) {
        $requestedData = Get-PlayniteDataPath -DataPath $DataPath -DeployPath $DeployPath
        $installedData = Get-PlayniteDataPath
        $matching = @($running | Where-Object {
            $directory = Split-Path $_.Path -Parent
            $processData = if (Test-Path -LiteralPath (Join-Path $directory "config.json")) { $directory } else { $installedData }
            $requestedData -and $processData -ieq $requestedData
        })
        if ($matching.Count -gt 0) { $PlayniteExe = $matching[0].Path }
    }
    if (-not $DataPath -and -not $DeployPath -and $PlayniteExe) {
        $exeDirectory = Split-Path $PlayniteExe -Parent
        if (Test-Path -LiteralPath (Join-Path $exeDirectory "config.json")) { $DataPath = $exeDirectory }
    }
    $resolvedData = Get-PlayniteDataPath -DataPath $DataPath -DeployPath $DeployPath
    $resolvedExe = Get-PlayniteExePath -PlayniteExe $PlayniteExe -Mode $Mode -DataPath $resolvedData
    if (-not $resolvedData) { return $null }
    if (($DataPath -or $DeployPath -or $PSBoundParameters.ContainsKey("PlayniteExe")) -and $resolvedExe) {
        $exeDir = Split-Path -Parent $resolvedExe
        $exeData = if (Test-Path -LiteralPath (Join-Path $exeDir "config.json")) { $exeDir } else { Get-PlayniteDataPath }
        if ($exeData -and ($resolvedData -ine $exeData)) {
            throw "Playnite executable '$resolvedExe' does not belong to data folder '$resolvedData'. Refusing to restart a different install."
        }
    }
    $sessions = @($running | Where-Object {
        $directory = Split-Path $_.Path -Parent
        if ($resolvedExe) { $directory -ieq (Split-Path $resolvedExe -Parent) }
        else { $directory -ieq $resolvedData }
    } | ForEach-Object {
        [pscustomobject]@{
            Exe = $_.Path
            Mode = $(if ($_.ProcessName -eq "Playnite.FullscreenApp") { "Fullscreen" } else { "Desktop" })
        }
    })
    [pscustomobject]@{ DataPath = $resolvedData; Exe = $resolvedExe; Mode = $Mode; Sessions = $sessions }
}

function Copy-PlayniteBuild {
    param(
        [Parameter(Mandatory = $true)] [string]$Source,
        [Parameter(Mandatory = $true)] [string]$Root,
        [Parameter(Mandatory = $true)] [string]$Folder
    )
    # Verify the absolute target before recursively replacing any installed add-on files.
    if ($Folder -in @(".", "..") -or $Folder.IndexOfAny([char[]]'\/:') -ge 0) { throw "Invalid add-on folder: $Folder" }
    $rootFull = [IO.Path]::GetFullPath($Root).TrimEnd('\', '/') + [IO.Path]::DirectorySeparatorChar
    $target = [IO.Path]::GetFullPath((Join-Path $Root $Folder))
    if (-not $target.StartsWith($rootFull, [StringComparison]::OrdinalIgnoreCase)) { throw "Deployment target escaped $Root" }
    if (-not (Test-Path -LiteralPath $Source -PathType Container)) { throw "Build drop not found: $Source" }
    $sourceFull = [IO.Path]::GetFullPath($Source).TrimEnd('\', '/')
    $targetPrefix = $target.TrimEnd('\', '/') + [IO.Path]::DirectorySeparatorChar
    if ($target -ieq $sourceFull -or $sourceFull.StartsWith($targetPrefix, [StringComparison]::OrdinalIgnoreCase) -or
        $target.StartsWith($sourceFull + [IO.Path]::DirectorySeparatorChar, [StringComparison]::OrdinalIgnoreCase)) {
        throw "Build source and deployment target overlap."
    }
    if ((Test-Path -LiteralPath $target) -and ((Get-Item -LiteralPath $target).Attributes -band [IO.FileAttributes]::ReparsePoint)) {
        throw "Refusing to replace linked add-on folder: $target"
    }
    # Copy beside the install, then swap. A failed copy must not wipe the folder Playnite restarts onto.
    $staged = Join-Path $Root ($Folder + ".deploying")
    $backup = Join-Path $Root ($Folder + ".previous")
    if (Test-Path -LiteralPath $staged) { Remove-Item -LiteralPath $staged -Recurse -Force }
    New-Item -ItemType Directory -Path $staged -Force | Out-Null
    try {
        Copy-Item -Path (Join-Path $Source "*") -Destination $staged -Recurse -Force
        if (Test-Path -LiteralPath $target) {
            if (Test-Path -LiteralPath $backup) { Remove-Item -LiteralPath $backup -Recurse -Force }
            Rename-Item -LiteralPath $target -NewName (Split-Path -Leaf $backup)
        }
        Rename-Item -LiteralPath $staged -NewName $Folder
    }
    catch {
        if (-not (Test-Path -LiteralPath $target) -and (Test-Path -LiteralPath $backup)) {
            Rename-Item -LiteralPath $backup -NewName $Folder
        }
        if (Test-Path -LiteralPath $staged) { Remove-Item -LiteralPath $staged -Recurse -Force -ErrorAction SilentlyContinue }
        throw
    }
    if (Test-Path -LiteralPath $backup) { Remove-Item -LiteralPath $backup -Recurse -Force }
    Write-Host "Deployed to $target"
}

function Invoke-PlayniteDeployment {
    param(
        [Parameter(Mandatory = $true)] $Context,
        [Parameter(Mandatory = $true)] [scriptblock]$Deploy,
        [switch]$NoRestart,
        [switch]$Launch
    )
    $restart = -not $NoRestart -and $Context.Sessions.Count -gt 0
    if ($Launch -and -not $Context.Exe) { throw "Playnite executable not found. Pass -PlayniteExe <path>." }
    try {
        if ($restart) { Stop-PlayniteApp -PlayniteExe $Context.Exe -DataPath $Context.DataPath }
        & $Deploy
    }
    finally {
        # A failed deployment must not leave an originally running Playnite closed.
        if ($restart) {
            foreach ($session in $Context.Sessions) {
                $alreadyRunning = @(Get-PlayniteProcess -Mode $session.Mode | Where-Object { $_.Path -ieq $session.Exe })
                if ($alreadyRunning.Count -eq 0) {
                    if (-not (Start-PlayniteApp -PlayniteExe $session.Exe -Mode $session.Mode -DataPath $Context.DataPath)) {
                        throw "Failed to restart Playnite: $($session.Exe)"
                    }
                }
            }
        }
    }
    if ($Launch -and -not $restart -and -not $NoRestart) {
        Start-PlayniteApp -PlayniteExe $Context.Exe -Mode $Context.Mode -DataPath $Context.DataPath | Out-Null
    }
}
