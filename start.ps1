# InterviewIQ PowerShell Launcher
Write-Host "====================================================" -ForegroundColor Cyan
Write-Host "Starting InterviewIQ Platform (Backend, AI, Frontend)" -ForegroundColor Green
Write-Host "====================================================" -ForegroundColor Cyan

$root = $PSScriptRoot

Start-Process cmd -ArgumentList "/k cd /d `"$root\ai-service`" && python main.py"
Start-Process cmd -ArgumentList "/k cd /d `"$root\backend`" && npm run dev"
Start-Process cmd -ArgumentList "/k cd /d `"$root\frontend`" && npm run dev"

Write-Host ""
Write-Host "All 3 services launched in separate windows!" -ForegroundColor Green
Write-Host "Frontend:    http://localhost:5173" -ForegroundColor Cyan
Write-Host "Backend API: http://localhost:5000/health" -ForegroundColor Cyan
Write-Host "AI Engine:   http://localhost:8000/health" -ForegroundColor Cyan
Write-Host "====================================================" -ForegroundColor Cyan

