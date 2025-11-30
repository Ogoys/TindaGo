# Store Location Visibility Fix Guide

## Problem Description

**Issue:** Stores are not showing on the map (`stores-map.tsx`) after admin activates them, even though the store owner set their location during registration.

**Expected Behavior:**
1. Store owner sets location during registration (via `set-store-location.tsx`)
2. Location is saved to Firebase
3. Admin activates the store
4. Store should appear on the map immediately with the saved location
5. Location should be visible in all map components:
   - `stores-map.tsx`
   - `store-info.tsx`
   - `view-store-location.tsx`
   - `edit-store-location.tsx`
   - `store-details.tsx`

## Root Causes

### 1. **Location Data Not Persisted During Registration**
   - The `updateStoreLocation` method saves to both `stores/${userId}` and `store_registrations/${userId}`
   - But if the store owner skips the location step or there's a save error, location data won't exist

### 2. **Admin Activation Doesn't Validate Location**
   - Previous admin code only updated `status` field without checking if location exists
   - This allowed activation of stores without location data

### 3. **Data Structure Mismatch**
   - Legacy stores might have coordinates in different formats:
     - `store.coordinates` (old format)
     - `store.locationCoordinates` (another old format)
     - `store.location.coordinates` (current correct format)

## The Fix

### Changes Made

#### 1. **Admin Dashboard - Store Activation Validation** 
   **File:** `tindago-admin/src/lib/storeService.ts`
   
   The `updateStoreStatus` method now:
   - ✅ Validates location data exists before activation
   - ✅ Throws error if trying to activate a store without location
   - ✅ Sets `isOpen: true` and `adminApproved: true` when activating
   - ✅ Syncs status to both `stores/` and `store_registrations/` collections
   - ✅ Logs old status for better tracking

   ```typescript
   // Before activation, validates:
   if (status === 'active') {
     const hasLocation = currentData.location?.coordinates?.latitude && 
                       currentData.location?.coordinates?.longitude;
     
     if (!hasLocation) {
       throw new Error('Store must have a location set before activation...');
     }
   }
   ```

#### 2. **Mobile App - Enhanced Location Detection**
   **File:** `TindaGo/app/(main)/(customer)/stores-map.tsx`
   
   Now checks for location in multiple formats:
   - ✅ `store.location.coordinates` (current format)
   - ✅ `store.coordinates` (legacy format)
   - ✅ `store.locationCoordinates` (another legacy format)
   - ✅ Provides detailed logging for debugging
   - ✅ Warns when stores have status but no location

   ```typescript
   const hasLocationNew = store.location?.coordinates?.latitude && ...;
   const hasLocationLegacy = store.coordinates?.latitude && ...;
   const hasLocationCoords = store.locationCoordinates?.latitude && ...;
   
   const hasLocation = hasLocationNew || hasLocationLegacy || hasLocationCoords;
   ```

#### 3. **Location Migration Utility**
   **File:** `TindaGo/scripts/fix-store-locations.ts`
   
   Utility script to fix stores with incorrect location format:
   - ✅ Scans all stores in Firebase
   - ✅ Identifies stores with legacy location formats
   - ✅ Migrates to current standard format
   - ✅ Updates both `stores/` and `store_registrations/`
   - ✅ Provides detailed report of changes

## How to Use

### For New Stores (Going Forward)

Everything should work automatically now:

1. **Store Owner:** Complete registration → Set location via map
2. **System:** Saves location to `stores/${userId}` and `store_registrations/${userId}`
3. **Admin:** Reviews registration → Activates store
4. **System:** Validates location exists → Sets status to 'active'
5. **Result:** Store appears on map immediately ✅

If admin tries to activate a store without location, they'll get an error:
```
"Store must have a location set before activation. 
Please ensure the store owner has completed location setup."
```

### For Existing Stores (Fix Required)

If you have stores that are already active but not showing on the map:

#### Option 1: Run the Migration Script

```bash
cd C:\CapsProj\TindaGo
npx ts-node scripts/fix-store-locations.ts
```

This will:
- Find all stores with legacy location formats
- Migrate them to the correct format
- Preserve all existing data
- Provide a detailed report

#### Option 2: Manual Fix via Firebase Console

1. Open Firebase Console → Realtime Database
2. Navigate to `stores/{storeId}`
3. Check if `location` object exists with this structure:
   ```json
   {
     "location": {
       "coordinates": {
         "latitude": 7.1234,
         "longitude": 125.5678
       },
       "address": "123 Main St, Davao City",
       "formattedAddress": "123 Main St, Davao City, Davao del Sur",
       "city": "Davao City",
       "setAt": "2024-01-15T12:00:00.000Z",
       "setMethod": "manual"
     }
   }
   ```
4. If missing or in wrong format, ask store owner to:
   - Go to Profile → Store Information
   - Tap "View on Map" or "Edit Location"
   - Set/confirm their location

#### Option 3: Diagnostic Check

Run the diagnostic script to see what's wrong:

```bash
cd C:\CapsProj\TindaGo
node scripts/check-store-location.js
```

This will show you:
- Which stores have location data
- Which format they're using
- Which stores should show on map but don't
- Detailed data structure for debugging

## Debugging Steps

### Check if Location Was Saved During Registration

1. Open browser console during store registration
2. Complete the "Set Store Location" step
3. Look for these log messages:
   ```
   📍 Saving store location:
      - Coordinates: { latitude: 7.xxx, longitude: 125.xxx }
      - Address: ...
      - City: ...
   ✅ Store location saved to Firebase successfully
   ```

### Check if Store Appears on Map

1. Open stores-map.tsx in the app
2. Check browser console for:
   ```
   🏪 [Store xxx...] StoreName { 
     status: 'active',
     hasLocationNew: true,  // Should be true
     hasLocationLegacy: false,
     hasLocationCoords: false
   }
   ✅ [Store StoreName] Added to map (1.23 km away)
   ```

3. If you see:
   ```
   ⚠️ [Store StoreName] Has status 'active' but NO LOCATION DATA!
   ```
   Then location wasn't saved properly.

### Check Firebase Data Directly

1. Firebase Console → Realtime Database
2. Check `stores/{userId}/location/coordinates`
3. Should have `latitude` and `longitude` numbers
4. Also check `stores/{userId}/businessInfo/address`

## Common Issues & Solutions

### Issue 1: "Store not showing after activation"

**Check:**
```javascript
// In Firebase Console
stores/{userId}/location/coordinates/latitude  // Must exist
stores/{userId}/location/coordinates/longitude // Must exist
stores/{userId}/status                        // Must be 'active'
```

**Fix:** Run migration script or ask store owner to re-set location

### Issue 2: "Admin can't activate store"

**Error:** "Store must have a location set before activation"

**Solution:** Store owner needs to:
1. Sign in to the app
2. Go to Profile → Edit Store Location
3. Set their location on the map
4. Save
5. Then admin can activate

### Issue 3: "Location shows in one place but not others"

**Possible Cause:** Location saved in legacy format

**Fix:** Run the migration script to standardize all location data

### Issue 4: "Store showed as pending, now doesn't show at all"

**Cause:** Admin changed status but store has no location

**Fix:**
1. Admin changes status back to 'pending'
2. Store owner sets location
3. Admin re-activates (will now succeed with validation)

## Data Structure Reference

### Correct Format (Current)

```javascript
{
  "stores": {
    "{userId}": {
      "status": "active",
      "isOpen": true,
      "adminApproved": true,
      "businessInfo": {
        "storeName": "Cat Store",
        "address": "123 Main St, Davao City",
        "city": "Davao City"
      },
      "location": {
        "coordinates": {
          "latitude": 7.0731,
          "longitude": 125.6128
        },
        "address": "123 Main St, Davao City",
        "formattedAddress": "123 Main St, Davao City, Davao del Sur",
        "city": "Davao City",
        "setAt": "2024-01-15T12:00:00.000Z",
        "setMethod": "manual"
      }
    }
  }
}
```

### Legacy Formats (Need Migration)

```javascript
// Format 1: coordinates at root
{
  "coordinates": { "latitude": 7.0731, "longitude": 125.6128 },
  "address": "123 Main St"
}

// Format 2: locationCoordinates
{
  "locationCoordinates": { "latitude": 7.0731, "longitude": 125.6128 }
}
```

## Testing Checklist

After applying the fix, test:

- [ ] New store registration with location → Shows on map as "pending" (orange pin)
- [ ] Admin activates store → Shows on map as "active" (red pin)
- [ ] Store without location → Admin gets error when trying to activate
- [ ] Legacy store location → Migration script fixes it
- [ ] Store location visible in:
  - [ ] `stores-map.tsx`
  - [ ] `store-info.tsx`  
  - [ ] `view-store-location.tsx`
  - [ ] `edit-store-location.tsx`
  - [ ] `store-details.tsx`

## Additional Notes

- **Pending stores with location:** Show on map with orange pin ⌛
- **Active stores with location:** Show on map with red pin 📍
- **Stores without location:** Don't show on map (regardless of status)
- **Closed stores:** Show with gray pin (but still on map)

## Support

If issues persist:

1. Check console logs in both app and admin dashboard
2. Verify Firebase security rules allow read/write to `stores/` and `store_registrations/`
3. Ensure Firebase database URL is correct in both projects
4. Run diagnostic scripts to identify specific issues
5. Check that store owner actually completed the location step (didn't skip it)

---

**Last Updated:** November 30, 2024
**Related Files:**
- `/tindago-admin/src/lib/storeService.ts`
- `/TindaGo/app/(main)/(customer)/stores-map.tsx`
- `/TindaGo/src/services/store/StoreRegistrationService.ts`
- `/TindaGo/app/(auth)/(store-owner)/set-store-location.tsx`
