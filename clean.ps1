# Clean and Restart AI Health Risk Predictor
Write-Host "🛑 Killing existing Node processes..." -ForegroundColor Red
taskkill /F /IM node.exe /T 2>$null

Write-Host "🧹 Cleaning Frontend Cache (.next)..." -ForegroundColor Cyan
Remove-Item -Path ".\frontend-web\.next" -Recurse -Force -ErrorAction SilentlyContinue

Write-Host "🧹 Cleaning Stale Service Workers..." -ForegroundColor Cyan
Remove-Item -Path ".\frontend-web\public\sw.js", ".\frontend-web\public\sw.js.map", ".\frontend-web\public\workbox-*.js", ".\frontend-web\public\workbox-*.js.map", ".\frontend-web\public\swe-worker-*.js" -Force -ErrorAction SilentlyContinue

Write-Host "🧹 Cleaning AI Service Cache..." -ForegroundColor Cyan
Remove-Item -Path ".\ai-service\__pycache__" -Recurse -Force -ErrorAction SilentlyContinue

Write-Host "🚀 Starting Backend..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd backend; npm run dev"

Write-Host "🚀 Starting Frontend..." -ForegroundColor Green
$env:NEXT_PRIVATE_LOCAL_SKIP_TRACE = "1"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd frontend-web; `$env:NEXT_PRIVATE_LOCAL_SKIP_TRACE='1'; npm run dev"

Write-Host "✅ Done! Check the new terminal windows." -ForegroundColor Yellow
