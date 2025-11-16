# 🔍 Quick Test Status Checker
# This script performs basic checks to verify the test environment is ready

Write-Host "🔍 TindaGo Test Status Check" -ForegroundColor Cyan
Write-Host "=" * 50
Write-Host ""

# Check 1: Admin Server
Write-Host "1️⃣  Checking Admin Server (port 3000)..." -ForegroundColor Yellow
try {
    $adminPort = Get-NetTCPConnection -LocalPort 3000 -State Listen -ErrorAction SilentlyContinue
    if ($adminPort) {
        Write-Host "   ✅ Admin server is running" -ForegroundColor Green
    } else {
        Write-Host "   ❌ Admin server is NOT running" -ForegroundColor Red
        Write-Host "      Run: cd C:\CapsProj\tindago-admin; npm run dev" -ForegroundColor Gray
    }
} catch {
    Write-Host "   ❌ Admin server is NOT running" -ForegroundColor Red
}
Write-Host ""

# Check 2: Expo Dev Server
Write-Host "2️⃣  Checking Expo Dev Server (port 8081)..." -ForegroundColor Yellow
try {
    $expoPort = Get-NetTCPConnection -LocalPort 8081 -State Listen -ErrorAction SilentlyContinue
    if ($expoPort) {
        Write-Host "   ✅ Expo dev server is running" -ForegroundColor Green
    } else {
        Write-Host "   ❌ Expo dev server is NOT running" -ForegroundColor Red
        Write-Host "      Run: cd C:\CapsProj\TindaGo; npx expo start --clear" -ForegroundColor Gray
    }
} catch {
    Write-Host "   ❌ Expo dev server is NOT running" -ForegroundColor Red
}
Write-Host ""

# Check 3: Key Files
Write-Host "3️⃣  Checking key implementation files..." -ForegroundColor Yellow

$files = @(
    "C:\CapsProj\TindaGo\app\(main)\(customer)\payment.tsx",
    "C:\CapsProj\TindaGo\app\(main)\(customer)\order-details.tsx",
    "C:\CapsProj\tindago-admin\src\app\api\webhooks\xendit\route.ts",
    "C:\CapsProj\TindaGo\FINAL_TEST_GUIDE.md",
    "C:\CapsProj\TindaGo\TEST_EXECUTION_RESULTS.md"
)

foreach ($file in $files) {
    if (Test-Path $file) {
        Write-Host "   ✅ $(Split-Path $file -Leaf)" -ForegroundColor Green
    } else {
        Write-Host "   ❌ $(Split-Path $file -Leaf) NOT FOUND" -ForegroundColor Red
    }
}
Write-Host ""

# Check 4: Environment Variables (Admin)
Write-Host "4️⃣  Checking .env configuration..." -ForegroundColor Yellow
$envFile = "C:\CapsProj\tindago-admin\.env.local"
if (Test-Path $envFile) {
    $envContent = Get-Content $envFile -Raw
    
    $requiredVars = @(
        "XENDIT_API_KEY",
        "XENDIT_WEBHOOK_TOKEN",
        "NEXT_PUBLIC_FIREBASE_API_KEY"
    )
    
    foreach ($var in $requiredVars) {
        if ($envContent -match $var) {
            Write-Host "   ✅ $var is set" -ForegroundColor Green
        } else {
            Write-Host "   ⚠️  $var not found in .env.local" -ForegroundColor Yellow
        }
    }
} else {
    Write-Host "   ❌ .env.local not found in tindago-admin" -ForegroundColor Red
}
Write-Host ""

# Summary
Write-Host "=" * 50
Write-Host "📊 Summary:" -ForegroundColor Cyan
Write-Host ""
Write-Host "If all checks are ✅, you're ready to start testing!" -ForegroundColor Green
Write-Host "Open TEST_EXECUTION_RESULTS.md to begin the test procedures." -ForegroundColor Yellow
Write-Host ""
Write-Host "Useful URLs:" -ForegroundColor Cyan
Write-Host "  • Admin Dashboard: http://localhost:3000" -ForegroundColor Gray
Write-Host "  • Firebase Console: https://console.firebase.google.com" -ForegroundColor Gray
Write-Host ""
