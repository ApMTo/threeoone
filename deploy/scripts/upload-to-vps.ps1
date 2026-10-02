# Upload deploy payload to Contabo (run from repo root in PowerShell).
# Excludes node_modules / .next / dist to keep the transfer small.
# Usage: .\deploy\scripts\upload-to-vps.ps1

$ErrorActionPreference = "Stop"
$Server = "root@84.247.168.48"
$Remote = "/opt/three-o-one"
$Root = (Resolve-Path (Join-Path $PSScriptRoot "..\..")).Path

Write-Host "Creating remote dir..."
ssh $Server "mkdir -p $Remote"

$Excludes = @(
  "--exclude=node_modules",
  "--exclude=.next",
  "--exclude=dist",
  "--exclude=.git",
  "--exclude=coverage",
  "--exclude=*.log",
  "--exclude=deploy/certbot/conf/*",
  "--exclude=deploy/certbot/www/*",
  "--exclude=backups/*",
  "--exclude=.env",
  "--exclude=.env.local"
)

# Prefer tar over ssh if available (Git Bash / WSL tar). Fallback: scp selective.
$tar = Get-Command tar -ErrorAction SilentlyContinue
if ($tar) {
  Write-Host "Streaming archive via tar+ssh..."
  $paths = @("backend", "frontend", "deploy", "docker-compose.prod.yml")
  Push-Location $Root
  try {
    $tarArgs = @("-czf", "-") + $Excludes + $paths
    & tar @tarArgs | ssh $Server "mkdir -p $Remote && tar -xzf - -C $Remote"
  } finally {
    Pop-Location
  }
} else {
  Write-Host "tar not found; using scp (slower). Install Git for Windows for tar."
  ssh $Server "mkdir -p $Remote/deploy $Remote/backend $Remote/frontend $Remote/backups"
  scp (Join-Path $Root "docker-compose.prod.yml") "${Server}:${Remote}/"
  scp -r (Join-Path $Root "deploy") "${Server}:${Remote}/"
  # Warning: may include heavy folders if present
  scp -r (Join-Path $Root "backend") "${Server}:${Remote}/"
  scp -r (Join-Path $Root "frontend") "${Server}:${Remote}/"
}

ssh $Server "mkdir -p $Remote/deploy/certbot/conf $Remote/deploy/certbot/www $Remote/backups && cp -n $Remote/deploy/.env.production.example $Remote/.env || true"

Write-Host ""
Write-Host "Upload done. Next on server:"
Write-Host "  ssh $Server"
Write-Host "  cd $Remote && nano .env"
Write-Host "  # then Docker bootstrap from deploy/README.md"
