# 🚀 Quick Test Commands

## Start Testing Environment

```bash
# 1. Start React Native app
npm start

# 2. Run on device/emulator
npm run android
# OR
npm run ios

# 3. Open Firebase Console
# Go to: https://console.firebase.google.com
# Navigate to your TindaGo project → Realtime Database
```

## Test Registration & Monitor

### Step 1: Complete Registration
1. Open TindaGo app
2. Select "Store Owner" role
3. Complete all registration forms
4. Wait for "⏳ Pending Approval" status

### Step 2: Verify Database Entry
Firebase Console → Realtime Database:
- Look for `store_registrations/{userId}`
- Confirm `status: "pending"`
- Copy userId for admin testing

### Step 3: Test Admin Approval
1. Open web admin dashboard
2. Find your pending registration
3. Click "Approve"
4. Watch mobile app update in real-time

## Expected Timeline
- Registration completion: Immediate
- Database write: 1-2 seconds
- Admin approval: Immediate
- Mobile app update: 2-3 seconds
- Push notification: 3-5 seconds

## Success Indicators
✅ Status changes from "⏳ Pending" to "✅ Approved"
✅ Push notification appears
✅ No manual refresh needed
✅ Data consistent in Firebase