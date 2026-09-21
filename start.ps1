# TEACHER OS — PowerShell Startup Script
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptDir

Write-Host "====================================================================" -ForegroundColor Cyan
Write-Host "  TEACHER OS — نظام تشغيل المعلم الذكي (بوابة السناتر والدروس)" -ForegroundColor Yellow
Write-Host "====================================================================" -ForegroundColor Cyan
Write-Host ""

$nodeBin = Join-Path $scriptDir "..\tools\node-v20.18.0-win-x64\node.exe"

if (Test-Path $nodeBin) {
    Write-Host "[OK] Using portable Node.js runtime..." -ForegroundColor Green
    Start-Process "http://localhost:3000"
    & $nodeBin (Join-Path $scriptDir "backend\src\server.js")
} else {
    Write-Host "[OK] Using system Node.js..." -ForegroundColor Green
    Start-Process "http://localhost:3000"
    node (Join-Path $scriptDir "backend\src\server.js")
}
