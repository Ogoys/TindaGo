# 🗺️ Testing Guide - Map Features

## Overview
This guide explains how to test the new map features for both **Store Owners** and **Customers**.

---

## 🏪 STORE OWNER - Testing Store Location Features

### Prerequisites
- Login as a **store owner** account
- Make sure you have location permissions enabled

### Features to Test:

#### 1. **Set Store Location (New Registration)**
**When:** During store registration

**Steps:**
1. Register as new store owner
2. Fill in store details (name, description, logo, etc.)
3. **NEW STEP:** Set Store Location screen appears
4. See map with fixed red pin in center
5. Drag map to select your store location
6. Watch address update automatically
7. OR tap blue GPS button to use current location
8. Tap "Confirm Location" button
9. Continue to bank details

**Expected Results:**
✅ Map loads centered on Davao City
✅ Address updates as you drag (with 500ms delay)
✅ GPS button gets current location
✅ Location saves to Firebase
✅ Can skip if needed

---

#### 2. **Edit Store Location (Existing Store)**
**When:** Already registered, want to update location

**Steps:**
1. Login as store owner
2. Go to **Profile**
3. Tap **"Store Location"** menu item
4. Edit screen opens with current location (if set)
5. Drag map to change location
6. Address updates automatically
7. Tap "Update Location" button

**Expected Results:**
✅ If location exists → map centers on it
✅ If no location → shows Davao City default
✅ Can drag to change location
✅ Unsaved changes warning when pressing back
✅ Location updates in Firebase
✅ Home page address updates immediately (real-time!)

---

#### 3. **View Store Location (Read-Only)**
**When:** Just want to see your location on map

**Steps:**
1. Login as store owner
2. Go to **Profile → Store Info**
3. Scroll to **Location** section
4. Tap **"Tap to view on map"** button
5. Read-only map opens with your store marker

**Expected Results:**
✅ Shows map with store marker (green storefront icon)
✅ Can zoom/pan but not edit
✅ Shows address card at bottom
✅ Pencil icon (edit button) opens edit screen
✅ If no location set → shows empty state + "Set Location" button

---

#### 4. **Store Home Page - Dynamic Location**
**When:** Check if location updates automatically

**Steps:**
1. Login as store owner
2. Check **"Current Location"** on home page
3. Go edit location (Profile → Store Location)
4. Change location and save
5. Go back to home page

**Expected Results:**
✅ Shows location from map picker (not manual entry)
✅ Updates in **real-time** when you change location
✅ Shows full address (no duplicate city)

---

## 👤 CUSTOMER - Testing Map View Features

### Prerequisites
- Login as a **customer** account
- Make sure you have location permissions enabled
- **IMPORTANT:** Need at least 1 store owner with location set to see markers!

### Features to Test:

#### 1. **Open Stores Map**
**Steps:**
1. Login as customer
2. On home screen, look for **green map button** (top right, next to notification)
3. Tap the green map button
4. Stores map opens

**Expected Results:**
✅ Map loads with your location (blue dot)
✅ Shows all active stores with locations
✅ Store markers have logos (or default storefront icon)
✅ Loading spinner while fetching stores

---

#### 2. **Distance Filtering**
**Steps:**
1. On stores map, see filter buttons at top:
   - **All** (shows all stores)
   - **1 km** (shows stores within 1km)
   - **3 km** (shows stores within 3km)
   - **5 km** (shows stores within 5km)
2. Tap each filter
3. Watch markers update

**Expected Results:**
✅ Filter updates markers immediately
✅ Shows store count (e.g., "6 stores")
✅ Markers disappear if outside range
✅ Sorted by distance (closest first)

---

#### 3. **View Store Info**
**Steps:**
1. Tap any store marker on map
2. Info card slides up from bottom
3. See store details (logo, name, address, distance)
4. Two action buttons appear

**Expected Results:**
✅ Map animates/centers on selected store
✅ Info card shows:
   - Store logo (or placeholder)
   - Store name
   - Address
   - Distance (e.g., "0.52 km away")
✅ Two buttons: "Navigate" (blue) and "View Products" (green)
✅ Can close card with X button

---

#### 4. **Navigate to Store**
**Steps:**
1. Tap a marker to open info card
2. Tap **"Navigate"** button (blue)

**Expected Results:**
✅ Opens external maps app (Google Maps on Android, Apple Maps on iOS)
✅ Shows route to store
✅ Uses store's exact coordinates

---

#### 5. **View Store Products**
**Steps:**
1. Tap a marker to open info card
2. Tap **"View Products"** button (green)

**Expected Results:**
✅ Navigates to store details page
✅ Shows store's products
✅ Can browse and add to cart

---

#### 6. **Center on User Location**
**Steps:**
1. Pan/zoom map to different location
2. Tap blue **"Center"** button (bottom right)

**Expected Results:**
✅ Map animates back to your GPS location
✅ Shows blue dot (your location)
✅ Zooms to appropriate level

---

#### 7. **Closed Store Indicator**
**Steps:**
1. Look for stores on map
2. Find stores with gray overlay on marker

**Expected Results:**
✅ Closed stores have gray/darkened overlay
✅ Can still tap to see info
✅ Info card shows they're closed

---

#### 8. **No Stores in Range**
**Steps:**
1. Set filter to "1 km"
2. If no stores within 1km:

**Expected Results:**
✅ Shows message: "No stores nearby"
✅ Suggests: "Try increasing the distance filter"
✅ White card in center of screen

---

## 🧪 Complete Testing Checklist

### Store Owner Features:
- [ ] Set location during new registration
- [ ] Edit location from profile
- [ ] View location (read-only) from store info
- [ ] Home page shows updated location
- [ ] Real-time updates work
- [ ] GPS button works
- [ ] Skip option works (registration)
- [ ] Unsaved changes warning works

### Customer Features:
- [ ] Green map button appears on home
- [ ] Map loads with store markers
- [ ] User location (blue dot) shows
- [ ] Distance filters work (All, 1km, 3km, 5km)
- [ ] Store count updates with filter
- [ ] Tap marker shows info card
- [ ] Distance displayed correctly
- [ ] Navigate button opens maps
- [ ] View Products button works
- [ ] Center button returns to user location
- [ ] Closed stores show gray overlay
- [ ] No stores message appears when empty

---

## 🐛 Common Issues & Solutions

### Issue: Map doesn't load
**Solution:** 
- Check location permissions
- Make sure Google Maps API key is configured
- Clear Metro cache: `npx expo start -c`

### Issue: No stores appear on customer map
**Solution:**
- Make sure at least 1 store owner has set their location
- Check store status is 'active'
- Check store has `location.coordinates` in Firebase

### Issue: "Unable to get address"
**Solution:**
- Check internet connection
- Nominatim API might be rate-limited (wait a moment)

### Issue: GPS button doesn't work
**Solution:**
- Grant location permissions
- Make sure device has GPS enabled
- Try on physical device (not emulator)

---

## 📱 Testing on Device

**Recommended:**
1. Build dev APK: `eas build --profile development --platform android`
2. Install on physical device
3. Test with real GPS locations
4. Try different locations in Davao City

**Why physical device?**
- Real GPS data
- Better map performance
- Test actual distance calculations
- External maps integration works better

---

## ✅ Success Criteria

**Store Owner:**
- ✅ Can set location during registration
- ✅ Can edit location anytime
- ✅ Location syncs to home page automatically
- ✅ Address updates from map picker

**Customer:**
- ✅ Can see all nearby stores on map
- ✅ Can filter by distance
- ✅ Can navigate to stores
- ✅ Can view store products
- ✅ Distance calculation is accurate

---

## 🎉 You're Done!

If all features work as expected, the map integration is complete and ready for production!

Need help? Check the console logs for debugging info.
