# IoT Web과 동일 패턴: lint + production build
$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
Set-Location $Root

Write-Host "== pro-presenter-front-end dev-test ==" -ForegroundColor Cyan

Write-Host "`n[1/2] ESLint" -ForegroundColor Yellow
npm run lint
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Write-Host "`n[2/2] Typecheck + Vite build" -ForegroundColor Yellow
npm run build
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Write-Host "`nAll checks passed." -ForegroundColor Green
