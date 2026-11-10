@echo off
title InterviewIQ Launcher
echo ====================================================
echo Starting InterviewIQ Platform (Backend, AI, Frontend)
echo ====================================================

echo [1/3] Starting Python AI Microservice on port 8000...
start "InterviewIQ - AI Microservice (Port 8000)" cmd /k "cd ai-service && python main.py"

echo [2/3] Starting Express Backend on port 5000...
start "InterviewIQ - Express Backend (Port 5000)" cmd /k "cd backend && npm run dev"

echo [3/3] Starting Vite Frontend on port 5173...
start "InterviewIQ - Vite Frontend (Port 5173)" cmd /k "cd frontend && npm run dev"

echo.
echo ====================================================
echo All 3 services are running!
echo Frontend:    http://localhost:5173
echo Backend API: http://localhost:5000/health
echo AI Engine:   http://localhost:8000/health
echo ====================================================
pause

