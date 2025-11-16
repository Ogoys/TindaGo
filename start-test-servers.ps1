# 🚀 Start Test Servers Script
# This script starts both the admin server and mobile app for testing

Write-Host "🧪 Starting TindaGo Test Environment..." -ForegroundColor Cyan
Write-Host ""

# Check if admin server is already running
$adminRunning = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue
if ($adminRunning) {
    Write-Host "⚠️  Admin server already running on port 3000" -ForegroundColor Yellow
} else {
    Write-Host "📦 Starting Admin Server..." -ForegroundColor Green
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd C:\CapsProj\tindago-admin; Write-Host '🔧 Admin Server' -ForegroundColor Green; npm run dev"
    Start-Sleep -Seconds 3
}

# Start Mobile App (Expo)
Write-Host "📱 Starting Mobile App (Expo)..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd C:\CapsProj\TindaGo; Write-Host '📱 Mobile App (Expo)' -ForegroundColor Cyan; npx expo start --clear"

Write-Host ""
Write-Host "✅ Servers starting in separate windows..." -ForegroundColor Green
Write-Host ""
Write-Host "📋 Next Steps:" -ForegroundColor Yellow
Write-Host "  1. Wait for admin server to show: 'Ready on http://localhost:3000'"
Write-Host "  2. Wait for Expo to show QR code"
Write-Host "  3. Open Firebase Console: https://console.firebase.google.com"
Write-Host "  4. Open TEST_EXECUTION_RESULTS.md and start testing"
Write-Host ""
Write-Host "Press any key to open Firebase Console..." -ForegroundColor Cyan
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

# Open Firebase Console
Start-Process "https://console.firebase.google.com"

Write-Host "✨ Test environment ready!" -ForegroundColor Green
Write-Host ""
