@echo off
title Billing System - Rajaram Hodawadekar
echo ========================================================
echo Starting Billing & Invoicing System Server...
echo Proprietor: RAJARAM HODAWADEKAR ^| Phone: 1234567890
echo ========================================================
start "" "http://localhost:3000"
node "%~dp0server.js"
pause
