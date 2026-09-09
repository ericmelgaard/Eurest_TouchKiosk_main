# Packages only the files the kiosk actually loads at runtime into release/ (+ release.zip),
# leaving supabase/, docs/, and dev tooling (package.json, vite.config.js, .git) out of the CMS asset.
param(
    [string]$OutDir = "release"
)

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
Set-Location $root

# OneDrive syncs this workspace and can transiently lock a just-written release/ folder, so retry.
function Remove-ItemWithRetry($path) {
    for ($i = 0; $i -lt 5; $i++) {
        try {
            Remove-Item $path -Recurse -Force -ErrorAction Stop
            return
        } catch {
            Start-Sleep -Milliseconds 500
        }
    }
    Write-Warning "Could not fully remove $path (likely OneDrive sync lock) - continuing anyway."
}

if (Test-Path $OutDir) { Remove-ItemWithRetry $OutDir }
New-Item -ItemType Directory -Path $OutDir -Force | Out-Null

$includePaths = @(
    "index.html",
    "style.css",
    "sw.js",
    "resources",
    "fonts",
    "dependencies",
    "js",
    "media"
)

foreach ($p in $includePaths) {
    if (Test-Path $p) {
        Copy-Item $p -Destination $OutDir -Recurse -Force
    } else {
        Write-Warning "Skipping missing path: $p"
    }
}

$zipPath = "$OutDir.zip"
if (Test-Path $zipPath) { Remove-ItemWithRetry $zipPath }
for ($i = 0; $i -lt 5; $i++) {
    try {
        Compress-Archive -Path "$OutDir\*" -DestinationPath $zipPath -ErrorAction Stop
        break
    } catch {
        if ($i -eq 4) { throw }
        Start-Sleep -Milliseconds 500
    }
}

$sizeMB = [math]::Round((Get-ChildItem $zipPath).Length / 1MB, 2)
Write-Host "Packaged asset -> $zipPath ($sizeMB MB)"
