# Packages only the files the kiosk actually loads at runtime into release/ (+ release.zip),
# leaving supabase/, docs/, and dev tooling (package.json, vite.config.js, .git) out of the CMS asset.
param(
    [string]$OutDir = "release"
)

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
Set-Location $root

if (Test-Path $OutDir) { Remove-Item $OutDir -Recurse -Force }
New-Item -ItemType Directory -Path $OutDir | Out-Null

$includePaths = @(
    "index.html",
    "style.css",
    "sw.js",
    "resources",
    "fonts",
    "dependencies",
    "js",
    "media",
    "public"
)

foreach ($p in $includePaths) {
    if (Test-Path $p) {
        Copy-Item $p -Destination $OutDir -Recurse -Force
    } else {
        Write-Warning "Skipping missing path: $p"
    }
}

$zipPath = "$OutDir.zip"
if (Test-Path $zipPath) { Remove-Item $zipPath -Force }
Compress-Archive -Path "$OutDir\*" -DestinationPath $zipPath

$sizeMB = [math]::Round((Get-ChildItem $zipPath).Length / 1MB, 2)
Write-Host "Packaged asset -> $zipPath ($sizeMB MB)"
