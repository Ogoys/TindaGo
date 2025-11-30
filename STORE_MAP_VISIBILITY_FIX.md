# Store Map Visibility Fix

## 🔍 Why Stores Weren't Showing

The stores with locations weren't appearing on the customer map because of a **status filter issue**.

### The Problem
The original code only showed stores with `status === 'active'`:
```typescript
if (
  store.status === 'active' &&
  store.location?.coordinates?.latitude &&
  store.location?.coordinates?.longitude
) {
  // Show store on map
}
```

### Store Status Flow
When a store owner sets their location during registration, the store status is:
1. **'pending'** - Waiting for admin approval (has location but not visible)
2. **'approved'** - Admin approved but not yet activated
3. **'active'** - Fully activated and operational

**The issue:** Stores with `status === 'pending'` have their location set, but weren't showing on the map!

## ✅ What Was Fixed

### 1. Changed Filter Logic
Now the map shows stores with **'active' OR 'pending'** status that have a location:

```typescript
const hasLocation = store.location?.coordinates?.latitude && 
                   store.location?.coordinates?.longitude;
const isActiveOrPending = store.status === 'active' || 
                         store.status === 'pending';

if (hasLocation && isActiveOrPending) {
  // Show store on map
}
```

This allows newly registered stores to appear immediately after setting their location, even before admin approval.

### 2. Added Visual Indicators

**Pending Store Badge:**
- Stores with `status === 'pending'` now show an "⌛ Pending Approval" badge
- Orange color scheme to distinguish from active stores

**Map Marker Indicators:**
- Pending stores have an orange border (instead of green)
- Small ⌛ icon on top-right of marker
- Easy to identify pending vs active stores at a glance

### 3. Added Debug Logging

Added comprehensive console logs to help debug store visibility:

```
🏪 [StoresMap] Firebase snapshot received
📊 [StoresMap] Total stores in Firebase: 3
🏪 [Store abc12345...] {
  status: 'pending',
  hasLocation: true,
  storeName: 'My Sari-Sari Store'
}
✅ Loaded 2 stores with location
  - My Sari-Sari Store: pending (0.45 km)
  - TindaGo Test Store: active (1.23 km)
```

## 🧪 How to Test

### For Store Owners:
1. Register a new store and set location using the map pin
2. After saving location, the store should immediately appear on the customer map
3. It will show "⌛ Pending Approval" badge until admin approves

### For Customers:
1. Open "Stores Map" from customer menu
2. You should now see:
   - ✅ Active stores (green border)
   - ⌛ Pending stores (orange border with ⌛ icon)
3. Tap on any store to see details
4. Pending stores will show "⌛ Pending Approval" in the info card

### Check Console Logs:
To verify what's happening, check the console output:
```bash
npx expo run:android
# Watch for [StoresMap] logs
```

Look for:
- Total stores count
- Each store's status and location
- Final count of loaded stores

## 📊 Store Visibility Rules

| Status | Has Location | Shows on Map? | Visual Indicator |
|--------|-------------|---------------|------------------|
| pending | ✅ Yes | ✅ **YES** | Orange border + ⌛ |
| pending | ❌ No | ❌ No | N/A |
| active | ✅ Yes | ✅ **YES** | Green border |
| active | ❌ No | ❌ No | N/A |
| rejected | ✅ Yes | ❌ No | N/A |

## 🔧 If Stores Still Don't Show

### 1. Check Console Logs
Look for these messages:
```
🏪 [StoresMap] loadStores() started
🏪 [StoresMap] Fetching stores from Firebase...
🏪 [StoresMap] Firebase snapshot received
📊 [StoresMap] Total stores in Firebase: X
```

If you see `Total stores: 0`, the issue is with Firebase data.

### 2. Verify Store Data in Firebase
Check Firebase Console → Realtime Database → `stores/{userId}`:

**Required fields:**
```json
{
  "status": "pending" OR "active",
  "location": {
    "coordinates": {
      "latitude": 7.0731,
      "longitude": 125.6128
    },
    "address": "Store address"
  },
  "businessInfo": {
    "storeName": "My Store"
  }
}
```

### 3. Check Location Permission
If map is blank:
- Make sure location permission is granted
- Check if you see "Location Permission Required" screen
- Grant permission and tap refresh button

### 4. Use Refresh Button
Tap the refresh button (🔄) in the top-right corner of the map to reload stores.

## 🎨 Visual Changes Summary

### Before:
- Only 'active' stores visible
- No way to see pending stores
- No visual distinction

### After:
- Both 'active' AND 'pending' stores visible
- Orange ⌛ indicator for pending stores
- Clear visual distinction on map and info card
- Better debugging with console logs

## 🔄 Admin Workflow Impact

This change means:
1. ✅ Stores appear on map immediately after setting location
2. ✅ Customers can see pending stores (but they show as pending)
3. ✅ When admin approves, badge disappears and border turns green
4. ✅ No need to wait for admin approval to be visible

This is better UX because:
- Store owners can verify their location is correct
- Customers can discover new stores before they're fully active
- Clear visual distinction between pending and active

## 📝 Alternative: Only Show Active Stores

If you want to go back to only showing active stores (hide pending stores):

Change line 214 in `stores-map.tsx`:
```typescript
// Current (shows pending):
const isActiveOrPending = store.status === 'active' || store.status === 'pending';

// Change to (only active):
const isActiveOrPending = store.status === 'active';
```

But I recommend keeping the current behavior so stores appear immediately after registration.
