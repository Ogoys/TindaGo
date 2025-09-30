# TindaGo Testing Guide - Store Registration & Admin Approval

## Overview
This guide covers comprehensive testing for the complete store registration flow between the React Native mobile app and web admin dashboard.

## 📱 REACT NATIVE APP TESTING

### Test 1: Fresh User Registration Flow
**Purpose:** Test new user onboarding and setup
**Steps:**
1. Open app → Should go to **Onboarding** (new user)
2. Complete onboarding → **Role Selection**
3. Select "Store Owner" → **Sign Up**
4. Enter email/password → **Email Verification**
5. Verify email → **StoreDetails** screen

**✅ Expected Success:**
- Smooth flow through all screens
- No crashes or loading issues
- Proper screen transitions

**❌ Failure Indicators:**
- App crashes or freezes
- Stuck on loading screens
- Skips required screens

### Test 2: Store Registration Flow (NEW ORDER)
**Purpose:** Test the updated registration flow order
**Steps:**
1. **StoreDetails** → Fill store info + upload logo/cover images
2. Click Continue → **BankDetails** (NEW: now comes before docs)
3. **BankDetails** → Select payment method + enter account details
4. Click Continue → **DocumentUpload**
5. **DocumentUpload** → Upload Business Permit + Valid ID (only 2 required)
6. Click Continue → **RegistrationComplete**

**✅ Expected Success:**
- Images convert to base64 and upload to Firebase
- Flow order: StoreDetails → BankDetails → DocumentUpload → RegistrationComplete
- Status shows "PENDING" with blue badge
- Can pull-to-refresh to check status
- All data saves to Firebase correctly

**❌ Failure Indicators:**
- Upload errors or timeouts
- Wrong flow order (documents before bank details)
- App crashes during upload
- Status not updating properly
- Missing data in Firebase

### Test 3: Smart Routing (CRITICAL TEST)
**Purpose:** Test the new authentication-aware routing system
**Steps:**
1. Complete registration → Exit app completely
2. Reopen app → **Should go directly to RegistrationComplete**
3. Sign out → Sign in with same credentials → **Should go to RegistrationComplete**

**✅ Expected Success:**
- No more onboarding for registered users
- Direct navigation to status screen
- Maintains user state correctly

**❌ Failure Indicators:**
- Goes back to onboarding flow
- Asks to register again
- Lost registration progress

### Test 4: Continuous App Usage (No Exit) - ANSWERS YOUR QUESTION
**Purpose:** Test what happens when user completes registration without exiting
**Steps:**
1. Complete full registration flow → Arrive at **RegistrationComplete**
2. Stay in app, don't exit
3. Pull-to-refresh to check status updates
4. Try "Continue to Dashboard" button

**✅ Expected Success:**
- **Stays on RegistrationComplete screen** (this answers your question!)
- Real-time status updates work
- Can refresh status manually
- Dashboard button shows "Coming Soon" message with sign out option

**❌ Failure Indicators:**
- App redirects away from RegistrationComplete
- Status updates stop working
- Refresh doesn't work

### Test 5: Real-time Status Updates
**Purpose:** Test Firebase real-time synchronization
**Steps:**
1. Stay on RegistrationComplete screen
2. Have someone approve from web admin
3. Pull-to-refresh or wait 2-3 seconds

**✅ Expected Success:**
- Status badge changes blue → green automatically
- Status message updates to "Approved!"
- Real-time sync within 2-3 seconds

**❌ Failure Indicators:**
- Status doesn't update automatically
- Needs app restart to see changes
- Takes more than 30 seconds to sync

## 💻 WEB ADMIN TESTING

### Test 6: Pending Store View
**Purpose:** Test pending registrations display
**Steps:**
1. Go to `http://localhost:3000/stores/pending`
2. Look for your registered store in the table
3. Click on the store row

**✅ Expected Success:**
- Your store appears with real data (not placeholder data)
- Shows actual store name, email, submission date
- Click opens detail view correctly

**❌ Failure Indicators:**
- Store not appearing in list
- Still showing fake/hardcoded data
- Table is empty or shows errors

### Test 7: Store Detail View (REAL DATA)
**Purpose:** Test the updated PendingApprovalDetails component
**Steps:**
1. Open store detail → Should show **PendingApprovalDetails**
2. Check business information section
3. Check submitted documents section
4. Verify UI layout and spacing

**✅ Expected Success:**
- **Real owner info:** Your actual name/email (not "Maynard Dotarot")
- **Real address:** Your actual store address + city
- **Real documents:** Your uploaded Business Permit + Valid ID
- **View links work:** Click "View" opens actual document files
- **Status badge:** Yellow "Pending" in upper right
- **Action buttons:** Properly spaced below documents (no overlap)

**❌ Failure Indicators:**
- Still showing hardcoded placeholder data
- Documents not appearing or broken
- View links don't work
- Buttons overlapping with documents section
- Status badge showing wrong color

### Test 8: Approval Workflow
**Purpose:** Test the approve functionality
**Steps:**
1. Click "Accept Application" ✓ button
2. Check Firebase database changes
3. Go to Active Stores view
4. Check mobile app for status update

**✅ Expected Success:**
- Store status changes to "approved" in Firebase
- Store appears in "Active Store View All" (`/stores?view=active`)
- Mobile app shows "APPROVED!" status immediately
- Real-time sync works across platforms

**❌ Failure Indicators:**
- Status doesn't change in Firebase
- Mobile app doesn't update
- Store doesn't appear in active view
- Admin panel shows errors

### Test 9: Rejection Workflow
**Purpose:** Test the reject functionality
**Steps:**
1. Register another store for testing
2. Click "Reject Application" ❌ button
3. Enter rejection reason
4. Check mobile app response

**✅ Expected Success:**
- Store status changes to "rejected" in Firebase
- Mobile app shows rejection message
- Rejection reason saved and accessible
- Status updates in real-time

**❌ Failure Indicators:**
- Status doesn't change
- No feedback to mobile user
- Rejection reason not saved

## 🔄 END-TO-END INTEGRATION TEST

### Test 10: Complete Workflow
**Purpose:** Test the entire system integration
**Steps:**
1. **Mobile:** Register store → Status: PENDING
2. **Web:** Find store in pending → View details with real data
3. **Web:** Approve store → Status: APPROVED
4. **Mobile:** Check status → Should show "APPROVED!"
5. **Web:** Check Active Stores → Store should appear there

**✅ Expected Success:**
- Complete integration working end-to-end
- Data consistency across platforms
- Real-time synchronization
- All features working as designed

**❌ Failure Indicators:**
- Any step breaks the integration chain
- Data inconsistency between platforms
- Sync delays longer than 30 seconds

## 🐛 COMMON ISSUES TO WATCH FOR

### Mobile App Issues:
- FileSystem import errors (should use legacy version)
- Upload failures during image/document conversion
- Routing loops (onboarding → sign in → onboarding)
- Status not updating (Firebase listeners not working)
- Network timeouts during uploads
- Permission issues with file access

### Web Admin Issues:
- TypeScript compilation errors
- Data not appearing due to Firebase mapping issues
- Button overlapping due to CSS positioning
- Approve/reject not working (Firebase update failures)
- Build errors preventing deployment
- Slow Firebase queries

### Integration Issues:
- Status sync delays (should be under 5 seconds)
- Data mismatch between mobile and web
- Document viewing broken (base64 URLs not accessible)
- Authentication state issues
- Firebase permissions problems

## 📊 SUCCESS CRITERIA

### ✅ COMPLETE PASS:
- All 10 tests pass without issues
- Real data flows correctly between mobile and web
- Real-time sync works reliably
- No critical bugs or crashes
- User experience is smooth and intuitive

### ⚠️ PARTIAL PASS:
- Most tests pass but minor issues exist
- Sync works but with delays
- Some UI issues but functionality works
- Requires minor fixes before production

### ❌ FAIL:
- Critical functionality broken
- Data not syncing between platforms
- App crashes or major errors
- Registration flow incomplete
- Admin approval not working

## 🚀 TESTING ORDER RECOMMENDATION

1. **Start with Test 1** (Fresh User Registration)
2. **Continue with Test 2** (Store Registration Flow)
3. **Test 3** (Smart Routing) - Critical for user experience
4. **Test 4** (Continuous Usage) - Normal user behavior
5. **Test 6-7** (Web Admin Display) - Verify data appears
6. **Test 8-9** (Approval/Rejection) - Core admin functionality
7. **Test 10** (End-to-End) - Complete integration verification

## 📝 DETAILED TESTING NOTES

### Data Fields to Verify in Mobile App:
- **StoreDetails:** Store name, address, phone, logo image, cover image
- **BankDetails:** Payment method (GCash/PayMaya/Bank), account name, account number
- **DocumentUpload:** Business Permit, Valid ID (base64 converted)
- **Personal Info:** Owner name, email (from registration)

### Data Fields to Verify in Web Admin:
- **Business Owner Info:** Real name/email (not "Maynard Dotarot")
- **Business Address:** Real store address + city (not "63 Jacinto Street")
- **Business Description:** Real description (not Lorem ipsum)
- **Documents:** Your actual uploaded files with working "View" links
- **Status Badge:** Yellow "Pending" initially, changes to green "Approved"

### Firebase Data Structure Check:
```
store_registrations/{userId}:
├── personalInfo: { name, email, mobile }
├── businessInfo: { storeName, address, city, description }
├── documents: { businessPermit, validId }
├── paymentInfo: { method, accountName, accountNumber }
├── status: "pending" → "approved" → "active"
└── timestamps: { createdAt, updatedAt, approvedAt }
```

### Real-time Sync Verification:
- **Mobile listeners:** useStoreRegistration hook should detect changes
- **Web admin:** Firebase real-time database subscriptions
- **Expected delay:** 2-3 seconds maximum for status updates
- **Fallback:** Pull-to-refresh if automatic updates fail

## 🔧 TROUBLESHOOTING GUIDE

### If Registration Flow Fails:
1. **Check Firebase Config:** Verify all EXPO_PUBLIC_ environment variables
2. **Check Permissions:** File access for image/document uploads
3. **Check Network:** Stable internet connection required
4. **Check Console:** Look for JavaScript errors in React Native debugger

### If Base64 Upload Fails:
1. **Check FileSystem Import:** Should use `expo-file-system/legacy`
2. **Check File Size:** Large files may timeout
3. **Check File Format:** Ensure proper image/PDF formats
4. **Check Firebase Rules:** Upload permissions must be enabled

### If Smart Routing Fails:
1. **Check Auth State:** Firebase auth.currentUser should exist
2. **Check Registration Data:** StoreRegistrationService.getRegistrationData()
3. **Check Status Values:** Must match STORE_STATUS constants
4. **Clear App Data:** Reset and try fresh registration

### If Web Admin Shows Hardcoded Data:
1. **Check Firebase Connection:** Admin service should fetch real data
2. **Check Data Mapping:** PendingApprovalDetails component field mapping
3. **Check User ID:** Ensure correct userId parameter passed
4. **Check Console Errors:** TypeScript or Firebase query errors

### If Approval/Reject Doesn't Work:
1. **Check AdminService:** approveStoreRegistration/rejectStoreRegistration functions
2. **Check Firebase Rules:** Admin write permissions
3. **Check Status Updates:** Both store_registrations and stores collections
4. **Check Mobile Listeners:** Real-time subscriptions active

## 📱 MOBILE APP TESTING DETAILS

### Device Requirements:
- **Development Build:** Required for full file system access
- **Expo Go Limitations:** Some features may not work (notifications, file system)
- **Network:** Stable internet for Firebase uploads
- **Storage:** Sufficient space for image/document storage

### Expected File Sizes:
- **Logo/Cover Images:** Converted to base64 (increases by ~33%)
- **Documents:** PDF files converted to base64
- **Upload Time:** 5-30 seconds depending on file size and network

### Status Screen Features:
- **Pull-to-refresh:** Swipe down to check status updates
- **Real-time updates:** Automatic badge color changes
- **Navigation:** Back button, continue to dashboard
- **Data display:** Store name, owner name, current status

## 💻 WEB ADMIN TESTING DETAILS

### URLs to Test:
- `http://localhost:3000/stores` - Main store management
- `http://localhost:3000/stores/pending` - Pending registrations list
- `http://localhost:3000/stores/pending/[userId]` - Individual store details
- `http://localhost:3000/stores?view=active` - Active stores view

### Expected Data Sources:
- **Pending registrations:** `store_registrations` collection
- **Active stores:** `stores` collection
- **Real-time updates:** Firebase database listeners
- **Document viewing:** Base64 data URLs or Firebase Storage URLs

### UI Components to Verify:
- **Status cards:** Pending, Active, Rejected, Suspended counts
- **Data tables:** Sortable, clickable rows with real data
- **Detail view:** PendingApprovalDetails with proper spacing
- **Action buttons:** Approve/Reject with proper positioning

## 🔄 INTEGRATION TESTING SPECIFICS

### Multi-day Approval Testing:
1. **Day 1:** Register store, exit app
2. **Day 2:** Open app → Should go to RegistrationComplete
3. **Day 3:** Admin approves → Mobile updates automatically
4. **Verify:** No need to re-register, status preserved

### Cross-platform Data Consistency:
- **Store name:** Must match between mobile registration and web display
- **Owner details:** Email, name should be identical
- **Documents:** Files uploaded on mobile should be viewable on web
- **Status:** Changes on web admin should reflect on mobile immediately

### Performance Expectations:
- **Registration time:** 2-5 minutes for complete flow
- **Upload time:** 10-60 seconds per file
- **Status sync:** 2-3 seconds between platforms
- **App startup:** Direct to correct screen within 5 seconds

## 📋 TEST RESULT DOCUMENTATION

### Success Checklist:
- [ ] Fresh user can complete full registration
- [ ] Flow order: StoreDetails → BankDetails → DocumentUpload → RegistrationComplete
- [ ] Smart routing works (no re-registration needed)
- [ ] Real data appears in web admin (not hardcoded)
- [ ] Approve/reject functionality works
- [ ] Real-time sync between mobile and web
- [ ] Status updates correctly across platforms
- [ ] Documents are viewable in web admin
- [ ] Active stores appear in correct view after approval

### Common Success Indicators:
- Console shows successful Firebase operations
- No TypeScript compilation errors
- No network timeout errors
- Smooth user experience without crashes
- Data consistency between platforms

---

**Created:** January 2025
**Version:** 1.0
**Project:** TindaGo Store Registration System
**Last Updated:** Added detailed troubleshooting and verification steps