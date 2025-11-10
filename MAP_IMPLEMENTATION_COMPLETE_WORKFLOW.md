# 🗺️ TindaGo Map Implementation - Complete Workflow Guide

## **The Right Way: From Zero to Working Maps**

This guide shows you the **CORRECT ORDER** to implement maps in TindaGo, avoiding common mistakes and saving time.

---

## 🎯 **Overview: The Complete Journey**

```
Phase 1: Preparation (30 min)
   ↓
Phase 2: Setup Dependencies (5 min)
   ↓
Phase 3: EAS Development Build (20 min)
   ↓
Phase 4: Code Implementation (2-3 days)
   ↓
Phase 5: Testing & Refinement (1 day)
```

**Total Time:** 3-4 days from start to fully working maps

---

## ⚠️ **CRITICAL: The Correct Order**

### **❌ WRONG Way (Don't Do This):**
```
1. Build app first
2. Try to add maps
3. Maps don't work
4. Waste time troubleshooting
5. Realize you need to rebuild
6. Rebuild with maps
7. Finally works (after wasting hours)
```

### **✅ RIGHT Way (Follow This):**
```
1. Get Google Maps API key
2. Install map dependencies
3. Configure app.json
4. Build app with maps included
5. Code map features
6. Test and refine
```

**Why this order?**
- react-native-maps is a **native module**
- Native modules must be **compiled into the app**
- Can't add native modules to existing builds
- Must include dependencies BEFORE building

---

# 📋 **PHASE 1: Preparation (30 minutes)**

## **Step 1.1: Check Prerequisites**

Open PowerShell and verify:

```powershell
# Check Node.js version
node --version
# Should show: v18.x.x or v20.x.x

# Check npm version
npm --version
# Should show: 9.x.x or 10.x.x

# Navigate to project
cd C:\CapsProj\TindaGo

# Verify it's an Expo project
Get-Content package.json | Select-String "expo"
# Should see: "expo": "~51.x.x"
```

✅ **All checks passed?** Continue to next step.

❌ **Failed?** Install Node.js from https://nodejs.org/ (LTS version)

---

## **Step 1.2: Install EAS CLI**

```powershell
# Install EAS CLI globally
npm install -g eas-cli

# Verify installation
eas --version
# Should show: eas-cli/X.X.X
```

✅ **Installed successfully**

---

## **Step 1.3: Login to Expo**

```powershell
# Login
eas login

# Verify login
eas whoami
# Should show your username
```

**Don't have an Expo account?**
1. Go to https://expo.dev
2. Click "Sign Up"
3. Verify email
4. Run `eas login` again

✅ **Logged in**

---

## **Step 1.4: Get Google Maps API Key** ⭐ IMPORTANT

### **Why you need this:**
- Enables map display on Android
- Free tier: 28,000 map loads/month
- Required before building

### **How to get it:**

**1. Go to Google Cloud Console**
```
https://console.cloud.google.com/
```

**2. Create New Project**
- Click "Select a project" (top bar)
- Click "New Project"
- Project name: `TindaGo-Maps`
- Click "Create"
- Wait 30 seconds for project creation

**3. Enable Required APIs**

**Enable Maps SDK for Android:**
- Go to "APIs & Services" → "Library"
- Search: "Maps SDK for Android"
- Click on it
- Click "Enable"
- Wait for confirmation

**Enable Geocoding API:**
- Still in "Library"
- Search: "Geocoding API"
- Click on it
- Click "Enable"
- Wait for confirmation

**4. Create API Key**
- Go to "APIs & Services" → "Credentials"
- Click "Create Credentials" → "API Key"
- API key appears (looks like: `AIzaSyABCDEFGH...`)
- **COPY THIS KEY** (you'll need it soon)

**5. Restrict API Key (Security)**

**Set Application Restrictions:**
- Click on your newly created API key
- Under "Application restrictions":
  - Select "Android apps"
  - Click "Add an app"
  - Package name: `com.tindago`
  - SHA-1: Leave blank for now (add later from EAS)
  - Click "Save"

**Set API Restrictions:**
- Still on same page
- Under "API restrictions":
  - Select "Restrict key"
  - Check these APIs:
    - ✅ Maps SDK for Android
    - ✅ Geocoding API
  - Click "Save"

✅ **API Key obtained and configured!**

**⚠️ IMPORTANT:** Save this API key somewhere safe. You'll need it in the next phase.

**Example API key format:**
```
AIzaSyC1234567890abcdefghijklmnopqrstuvwxyz
```

---

## **Step 1.5: Configure EAS for Your Project**

```powershell
cd C:\CapsProj\TindaGo
eas build:configure
```

**Interactive prompts:**

**Question 1:**
```
? Select a platform:
  › Android
    iOS
    All
```
**Answer:** Select `Android` (press Enter)

**Question 2:**
```
? Generate a new Android Keystore? (Y/n)
```
**Answer:** `Y` (press Enter)

**Result:** Creates `eas.json` file

✅ **EAS configured**

---

# 📦 **PHASE 2: Setup Dependencies (5 minutes)**

## **Step 2.1: Install Map Dependencies**

**⚠️ CRITICAL:** Do this BEFORE building!

```powershell
cd C:\CapsProj\TindaGo

# Install react-native-maps
npm install react-native-maps

# Install expo-location
npx expo install expo-location

# Install geolib for distance calculations
npm install geolib
```

**Wait for installation to complete (~2-3 minutes)**

---

## **Step 2.2: Verify Installation**

```powershell
# Check if packages are installed
Get-Content package.json | Select-String "react-native-maps|expo-location|geolib"
```

**Should see:**
```json
"react-native-maps": "^1.x.x",
"expo-location": "~16.x.x",
"geolib": "^3.x.x"
```

✅ **All packages installed**

---

## **Step 2.3: Configure app.json**

**⚠️ CRITICAL:** Add Google Maps API key and permissions

### **Open `app.json` and modify:**

**Before (current state):**
```json
{
  "expo": {
    "name": "TindaGo",
    "slug": "tindago",
    "version": "1.0.0",
    "android": {
      "package": "com.tindago",
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#ffffff"
      }
    }
  }
}
```

**After (add these sections):**
```json
{
  "expo": {
    "name": "TindaGo",
    "slug": "tindago",
    "version": "1.0.0",
    "android": {
      "package": "com.tindago",
      "permissions": [
        "ACCESS_COARSE_LOCATION",
        "ACCESS_FINE_LOCATION"
      ],
      "config": {
        "googleMaps": {
          "apiKey": "YOUR_GOOGLE_MAPS_API_KEY_HERE"
        }
      },
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#ffffff"
      }
    }
  }
}
```

**Replace:** `YOUR_GOOGLE_MAPS_API_KEY_HERE` with your actual API key from Step 1.4

**Example:**
```json
"apiKey": "AIzaSyC1234567890abcdefghijklmnopqrstuvwxyz"
```

---

## **Step 2.4: Validate app.json**

```powershell
# Verify JSON is valid
Get-Content app.json | ConvertFrom-Json
```

✅ **If no errors:** Your JSON is valid and ready!

❌ **If errors:** Common mistakes:
- Missing comma between properties
- Extra comma at end
- Unescaped quotes
- Wrong bracket placement

**Use this tool to validate:** https://jsonlint.com/

---

## **Step 2.5: Pre-Build Checklist**

Before building, verify everything:

**Run these checks:**

```powershell
# 1. Check packages installed
npm list react-native-maps expo-location geolib

# 2. Check app.json has API key
Get-Content app.json | Select-String "googleMaps"
# Should show: "googleMaps": { "apiKey": "AIza..." }

# 3. Check app.json has permissions
Get-Content app.json | Select-String "ACCESS_FINE_LOCATION"
# Should show: "ACCESS_FINE_LOCATION"

# 4. Verify logged into Expo
eas whoami
# Should show: your-username
```

**Checklist:**
- ✅ react-native-maps installed
- ✅ expo-location installed
- ✅ geolib installed
- ✅ Google Maps API key added to app.json
- ✅ Location permissions added to app.json
- ✅ app.json is valid JSON
- ✅ Logged into Expo

**All ✅?** → Ready to build!

---

# 🏗️ **PHASE 3: EAS Development Build (20 minutes)**

## **Step 3.1: Start the Build**

```powershell
cd C:\CapsProj\TindaGo
eas build --profile development --platform android
```

**What this does:**
- Uploads your code to Expo servers
- Compiles app with maps included
- Creates installable .apk file
- Takes 15-25 minutes

---

## **Step 3.2: Interactive Prompts**

**Prompt 1: Android Application ID**
```
? What would you like your Android application id to be?
  Default: com.tindago
```
**Answer:** Press Enter (accept default)

**Prompt 2: Confirm Build**
```
✔ Android application id: com.tindago
? Would you like to proceed? (Y/n)
```
**Answer:** `Y` (press Enter)

---

## **Step 3.3: Monitor Build Progress**

**You'll see:**
```
✔ Checking project configuration
✔ Syncing project configuration
✔ Uploading project to EAS Build
✔ Starting build process

🚀 Build started

Build details: https://expo.dev/accounts/[username]/projects/tindago/builds/[build-id]

Build queued... (queue position: 1)
```

**Build stages:**
```
⏳ Waiting in queue... (1-5 min)
   ↓
🔨 Preparing environment... (2-3 min)
   ↓
📦 Installing dependencies... (3-5 min)
   ↓
🏗️ Building Android app... (5-10 min)
   ↓
✅ Build completed!
```

**Total time:** 15-25 minutes (first build is slower)

---

## **Step 3.4: Monitor Options**

**Option 1: Watch in Terminal**
- Build progress shows in PowerShell
- Real-time updates

**Option 2: Watch in Browser**
- Click the build URL shown in terminal
- See detailed logs
- More visual

**Recommended:** Use browser (easier to follow)

---

## **Step 3.5: Build Success**

**When complete, you'll see:**

```
✔ Build finished

Build artifact:
https://expo.dev/artifacts/eas/[long-url].apk

Install and open the Expo Go app on your device and scan the QR code.
```

✅ **Your app with maps is ready!**

**Save these URLs:**
- Build details URL (to view logs later)
- APK download URL (to share with testers)

---

## **Step 3.6: Download APK**

**Method 1: Direct Download (Computer)**
1. Copy the artifact URL from terminal
2. Open in browser
3. Download APK (~50-100 MB)
4. Save to known location

**Method 2: QR Code (Phone)**
1. Open build details URL in browser
2. Scroll to "Download" section
3. Scan QR code with phone
4. APK downloads directly to phone

**Recommended:** Method 2 (QR code) is faster

---

## **Step 3.7: Install APK on Android Device**

**⚠️ IMPORTANT: Enable Unknown Sources**

**Android 8.0+ (Oreo and newer):**
1. Go to **Settings**
2. Search: "Install unknown apps"
3. Select your **File Manager** or **Chrome**
4. Toggle: **Allow from this source** → ON

**Older Android:**
1. Go to **Settings** → **Security**
2. Enable: **Unknown sources** → ON

**Install Steps:**
1. Open the downloaded APK file
2. Tap "Install"
3. Wait for installation (~30 seconds)
4. Tap "Open" or find "TindaGo" in app drawer

✅ **App installed!**

---

## **Step 3.8: First Launch**

**When you open the app:**

1. You'll see: **"Connect to Development Server"** screen
   - This is NORMAL for development builds
   - Not an error!

2. On your computer, start the dev server:
```powershell
cd C:\CapsProj\TindaGo
npx expo start --dev-client
```

3. In the app on your phone:
   - **Shake your phone** or press **Menu button**
   - Tap **"Connect to [your-computer-ip]:8081"**
   - Or tap **"Scan QR code"** and scan the QR from terminal

4. Your app loads! 🎉

✅ **Development build is working!**

---

# 💻 **PHASE 4: Code Implementation (2-3 days)**

Now that you have a working development build with maps, you can start coding!

## **Step 4.1: Create File Structure**

Create these new files:

```powershell
# Navigate to project
cd C:\CapsProj\TindaGo

# Create directories
New-Item -Path "src\types" -ItemType Directory -Force
New-Item -Path "src\constants" -ItemType Directory -Force
New-Item -Path "src\utils" -ItemType Directory -Force
New-Item -Path "src\components\map" -ItemType Directory -Force
New-Item -Path "src\hooks" -ItemType Directory -Force
```

✅ **Directories created**

---

## **Step 4.2: Implementation Order**

Follow this sequence for best results:

### **Day 1: Foundation (4-6 hours)**

**Morning:**
1. Create TypeScript types (`src/types/location.ts`)
2. Create map configuration (`src/constants/mapConfig.ts`)
3. Create location helpers (`src/utils/locationHelpers.ts`)
4. Create geocoding utilities (`src/utils/geocoding.ts`)

**Afternoon:**
5. Create LocationPicker component (`src/components/map/LocationPicker.tsx`)
6. Test basic map display

**Success criteria:** Map displays on screen

---

### **Day 2: Store Registration (6-8 hours)**

**Morning:**
1. Create set-store-location screen (`app/(main)/(store-owner)/auth/set-store-location.tsx`)
2. Implement GPS location detection
3. Implement address geocoding

**Afternoon:**
4. Implement pin positioning
5. Test location selection
6. Save location to Firebase

**Success criteria:** Store owners can set location and save to Firebase

---

### **Day 3: Customer Map View (6-8 hours)**

**Morning:**
1. Create distance calculation utils (`src/utils/distanceCalculation.ts`)
2. Create useNearbyStores hook (`src/hooks/useNearbyStores.ts`)
3. Create StoreMarker component (`src/components/customer/StoreMarker.tsx`)

**Afternoon:**
4. Create store-map screen (`app/(main)/(customer)/store-map.tsx`)
5. Display stores on map
6. Implement store selection

**Success criteria:** Customers can see stores on map and tap markers

---

### **Day 4: Polish & Testing (4-6 hours)**

**Morning:**
1. Add filters (distance, open/closed)
2. Add store details bottom sheet
3. Improve UI/UX

**Afternoon:**
4. Test all features
5. Fix bugs
6. Optimize performance

**Success criteria:** All features work smoothly

---

## **Step 4.3: Testing Workflow**

**While coding (hot reload):**
```powershell
# Keep this running
npx expo start --dev-client
```

**In your code editor:**
1. Make changes to code
2. Save file (Ctrl+S)
3. Changes appear on phone instantly! ✨
4. No need to rebuild!

**This works for:**
- ✅ UI changes
- ✅ JavaScript logic
- ✅ Adding new screens
- ✅ Styling changes
- ✅ Firebase operations
- ✅ 99% of code changes

**You ONLY rebuild when:**
- ❌ Installing new native packages
- ❌ Changing app.json
- ❌ Updating react-native-maps version

---

## **Step 4.4: Detailed Implementation Guide**

**Follow these guides for detailed code:**

1. **For TypeScript types and utilities:**
   - See: `MAP_FEATURES_IMPLEMENTATION_GUIDE.md` sections:
     - "TypeScript Types"
     - "Location Helpers"
     - "Geocoding Utilities"

2. **For Store Registration Map (Feature 1):**
   - See: `MAP_FEATURES_IMPLEMENTATION_GUIDE.md` section:
     - "Feature 1: Store Location Pin on Map"

3. **For Customer Map View (Feature 2):**
   - See: `MAP_FEATURES_IMPLEMENTATION_GUIDE.md` section:
     - "Feature 2: Map-Based Store Selection"

**Each section has:**
- Complete code examples
- Component architecture
- Props and interfaces
- Best practices

---

# 🧪 **PHASE 5: Testing & Refinement (1 day)**

## **Step 5.1: Feature Testing Checklist**

### **Store Registration Map:**
- [ ] Map loads without errors
- [ ] Pin stays centered when dragging
- [ ] "Use My Location" button works
- [ ] GPS coordinates are accurate
- [ ] Address geocoding is accurate (shows correct address)
- [ ] "Confirm Location" saves to Firebase
- [ ] Location appears in store owner document
- [ ] Permission prompts work correctly
- [ ] Error handling works (no GPS, no permission, etc.)

### **Customer Map View:**
- [ ] Map displays all verified stores
- [ ] User location shows (blue dot)
- [ ] Store markers are clickable
- [ ] Tap marker shows store details
- [ ] Distance calculations are accurate
- [ ] Stores sorted by distance
- [ ] Filter by distance works
- [ ] Filter by open/closed works
- [ ] "View Store" navigation works
- [ ] Performance is smooth (no lag)

---

## **Step 5.2: Performance Testing**

### **Test with multiple stores:**

**Simulate 20+ stores:**
1. Add test store data to Firebase
2. Open map on phone
3. Check performance:
   - Map loads in < 2 seconds?
   - Smooth pan/zoom?
   - Markers render quickly?
   - No stuttering?

**If slow:**
- Implement marker clustering (see guide)
- Optimize marker rendering
- Reduce marker icon size

---

## **Step 5.3: Real-World Testing**

### **Test outdoors:**
1. Go outside (for better GPS signal)
2. Test "Use My Location" button
3. Verify location accuracy
4. Walk around and see if location updates
5. Test in different locations in Davao City

### **Test different scenarios:**
- ✅ With GPS enabled
- ✅ With GPS disabled
- ✅ With location permission denied
- ✅ With no internet (should show error)
- ✅ With weak internet (should still work)
- ✅ In different barangays

---

## **Step 5.4: Common Issues & Fixes**

### **Issue 1: Map shows blank white screen**

**Cause:** API key not configured correctly

**Fix:**
```powershell
# 1. Verify API key in app.json
Get-Content app.json | Select-String "apiKey"

# 2. Check API key restrictions in Google Cloud Console
# Make sure "Maps SDK for Android" is enabled

# 3. Rebuild if API key was changed
eas build --profile development --platform android --clear-cache
```

---

### **Issue 2: "Use My Location" doesn't work**

**Cause:** Location permission not granted or GPS disabled

**Fix:**
1. On phone, go to **Settings** → **Apps** → **TindaGo** → **Permissions**
2. Enable **Location** → **Allow all the time** or **Allow only while using**
3. Enable GPS in phone settings
4. Restart app

---

### **Issue 3: Address not showing or geocoding fails**

**Cause:** Geocoding API not enabled or API key restricted

**Fix:**
1. Go to Google Cloud Console
2. APIs & Services → Library
3. Search "Geocoding API"
4. Click "Enable" if not enabled
5. Check API key restrictions allow Geocoding API

---

### **Issue 4: Maps work on phone but not in Expo Go**

**Cause:** Expo Go doesn't support react-native-maps

**Fix:**
- This is expected behavior
- Maps ONLY work in development builds
- Use the APK you built, not Expo Go

---

### **Issue 5: Distance calculations seem wrong**

**Cause:** Using wrong units or formula

**Fix:**
```typescript
// Verify you're using geolib correctly
import { getDistance } from 'geolib';

const distance = getDistance(
  { latitude: 7.1907, longitude: 125.4553 },
  { latitude: 7.2000, longitude: 125.4600 }
);

// distance is in METERS
console.log(distance); // e.g., 1234 meters

// Convert to kilometers
const km = distance / 1000; // 1.234 km
```

---

# 📊 **Success Metrics**

## **How to Know You're Done:**

### **Phase 3 Complete When:**
- ✅ Development build installs on phone
- ✅ App opens without crashing
- ✅ Can connect to dev server
- ✅ Hot reload works

### **Phase 4 Complete When:**
- ✅ Store owners can set location on map
- ✅ Location saves to Firebase with coordinates
- ✅ Customers can view stores on map
- ✅ Tapping markers shows store info
- ✅ Distance calculations work
- ✅ Navigation between screens works

### **Phase 5 Complete When:**
- ✅ All test checklist items pass
- ✅ Performance is acceptable (< 2s load)
- ✅ No critical bugs
- ✅ Real-world testing successful
- ✅ Edge cases handled (no GPS, no permission, etc.)

---

# 🎯 **Best Practices Summary**

## **Do's:**

✅ **Install dependencies BEFORE building**
- Saves time and build credits
- Ensures maps are included in build

✅ **Test basic functionality before rebuilding**
- Use console.logs to debug
- Test logic without rebuilding

✅ **Use development builds for all testing**
- Hot reload works
- Fast iteration
- Expo Go doesn't support maps

✅ **Keep API key secure**
- Don't commit to Git
- Restrict in Google Cloud Console
- Use environment variables for web version (if any)

✅ **Test on real device**
- GPS is more accurate
- Better performance testing
- Real-world conditions

---

## **Don'ts:**

❌ **Don't build without installing dependencies first**
- Wastes time rebuilding
- Wastes build credits

❌ **Don't test maps in Expo Go**
- Won't work
- Use development build instead

❌ **Don't commit API keys to Git**
- Security risk
- Use .env files
- Add to .gitignore

❌ **Don't rebuild for every code change**
- Only rebuild when adding native modules or changing config
- Use hot reload for 99% of changes

❌ **Don't exceed API free tier**
- Monitor usage in Google Cloud Console
- 28,000 loads/month is enough for development

---

# 📋 **Complete Workflow Summary**

## **One-Page Checklist:**

### **Before Building:**
- [ ] Google Maps API key obtained
- [ ] API key restrictions set in Google Cloud
- [ ] `npm install react-native-maps`
- [ ] `npx expo install expo-location`
- [ ] `npm install geolib`
- [ ] API key added to app.json
- [ ] Permissions added to app.json
- [ ] app.json validated (no JSON errors)
- [ ] Logged into Expo (`eas whoami`)

### **Building:**
- [ ] `eas build --profile development --platform android`
- [ ] Wait 15-25 minutes
- [ ] Download APK
- [ ] Install on Android device
- [ ] Enable unknown sources
- [ ] App opens successfully

### **Coding:**
- [ ] Create file structure
- [ ] Implement TypeScript types
- [ ] Implement utilities (location, geocoding)
- [ ] Implement LocationPicker component
- [ ] Implement store registration map screen
- [ ] Implement customer map view screen
- [ ] Test all features

### **Testing:**
- [ ] Store registration map works
- [ ] Customer map view works
- [ ] All checklist items pass
- [ ] Performance is good
- [ ] Real-world testing successful

### **Done!**
- [ ] Both map features working
- [ ] No critical bugs
- [ ] Ready for next objective

---

# ⏱️ **Time Estimates**

| Phase | Task | Time |
|-------|------|------|
| **Phase 1** | Get API key | 10 min |
| | Install EAS CLI | 5 min |
| | Login to Expo | 2 min |
| | Configure EAS | 3 min |
| **Phase 2** | Install dependencies | 3 min |
| | Configure app.json | 5 min |
| | Verify setup | 2 min |
| **Phase 3** | Start build | 1 min |
| | Wait for build | 15-25 min |
| | Download & install APK | 5 min |
| **Phase 4** | Day 1: Foundation | 4-6 hours |
| | Day 2: Store registration | 6-8 hours |
| | Day 3: Customer map | 6-8 hours |
| | Day 4: Polish | 4-6 hours |
| **Phase 5** | Testing & refinement | 4-8 hours |
| **Total** | | **3-4 days** |

---

# 🚀 **Ready to Start?**

## **Your Action Plan:**

### **Today (Setup Day):**
1. ✅ Get Google Maps API key (30 min)
2. ✅ Install dependencies (5 min)
3. ✅ Configure app.json (5 min)
4. ✅ Start EAS build (1 min)
5. ⏳ Wait for build (20 min)
6. ✅ Install APK on phone (5 min)
7. ✅ Verify app opens (2 min)

**End of day:** Development build ready for coding

---

### **Tomorrow (Day 1 of Coding):**
1. Create file structure
2. Implement foundation code
3. Test basic map display

---

### **Next 3 Days:**
Follow Phase 4 implementation schedule

---

### **Final Day:**
Testing and refinement

---

## **Need Help?**

**Guides available:**
1. `EAS_BUILD_SETUP_GUIDE.md` - Complete EAS build tutorial
2. `MAP_FEATURES_IMPLEMENTATION_GUIDE.md` - Detailed code implementation
3. This guide - Complete workflow overview

**If stuck:**
- Check troubleshooting sections
- Review success criteria for each phase
- Verify pre-build checklist

---

## **🎯 Final Reminder**

**The key to success:**
1. ✅ Follow the order exactly
2. ✅ Install dependencies BEFORE building
3. ✅ Test thoroughly at each phase
4. ✅ Don't skip the checklists

**Common mistake to avoid:**
❌ Building without dependencies → Wasting time rebuilding

**Time saved by doing it right:**
- Right way: 1 build (20 min)
- Wrong way: 2-3 builds (40-60 min)

---

**Good luck! You've got this! 🚀**

---

**Guide Version:** 1.0  
**Last Updated:** January 10, 2025  
**Status:** Complete and ready to follow  
**Estimated Success Rate:** 95%+ if followed exactly
