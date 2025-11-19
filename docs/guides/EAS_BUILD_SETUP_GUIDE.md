# 🚀 EAS Build Setup Guide for TindaGo - Complete Tutorial

## **What is EAS Build?**

**EAS (Expo Application Services) Build** is a cloud service that compiles your React Native app with native code (like maps) into an installable `.apk` file for Android.

**Think of it as:**
- Your code → Upload to Expo servers → Expo compiles it → You download `.apk` → Install on phone

**Why we need it:**
- Expo Go can't run apps with native modules (like react-native-maps)
- EAS Build creates a custom version of your app with maps included
- No need to install Android Studio locally (Expo does it in the cloud)

---

## 📋 **Prerequisites Checklist**

Before starting, make sure you have:

- ✅ Node.js installed (check: `node --version`)
- ✅ npm or yarn installed (check: `npm --version`)
- ✅ Expo account (create at https://expo.dev)
- ✅ Android device or emulator for testing
- ✅ Internet connection (for cloud builds)
- ✅ Terminal/PowerShell access

---

## 🎯 **Step-by-Step Guide**

---

## **STEP 1: Check Your Current Setup**

### **1.1 Verify Node.js and npm**

Open PowerShell and run:

```powershell
node --version
# Should show: v18.x.x or v20.x.x

npm --version
# Should show: 9.x.x or 10.x.x
```

**If not installed:**
- Download from: https://nodejs.org/
- Install LTS version (Long Term Support)
- Restart PowerShell after installation

---

### **1.2 Check if you have an Expo project**

```powershell
# Navigate to your project
cd C:\CapsProj\TindaGo

# Check if package.json exists
Get-Content package.json | Select-String "expo"
```

**Should see:**
```json
"expo": "~51.x.x" or similar
```

---

## **STEP 2: Install EAS CLI (Command Line Interface)**

### **2.1 Install EAS CLI globally**

```powershell
npm install -g eas-cli
```

**What this does:**
- Installs EAS command-line tool on your computer
- Makes `eas` command available everywhere
- Takes ~1-2 minutes

**Wait for:** `added 1 package` message

---

### **2.2 Verify EAS CLI installation**

```powershell
eas --version
```

**Should show:**
```
eas-cli/X.X.X win32-x64 node-vXX.X.X
```

✅ **If you see a version number, EAS CLI is installed!**

❌ **If command not found:**
```powershell
# Try this:
npm list -g eas-cli

# If not listed, reinstall:
npm uninstall -g eas-cli
npm install -g eas-cli
```

---

## **STEP 3: Login to Expo Account**

### **3.1 Create Expo account (if you don't have one)**

1. Go to https://expo.dev
2. Click "Sign Up"
3. Use email or GitHub
4. Verify your email
5. Remember your username and password

---

### **3.2 Login via CLI**

```powershell
eas login
```

**You'll be prompted:**
```
Email or username: [your-email@example.com]
Password: [your-password]
```

**Success message:**
```
✔ Logged in as: your-username
```

✅ **You're now logged in to Expo!**

---

### **3.3 Verify login**

```powershell
eas whoami
```

**Should show:**
```
your-username
```

---

## **STEP 4: Configure Your Project for EAS**

### **4.1 Initialize EAS in your project**

```powershell
cd C:\CapsProj\TindaGo
eas build:configure
```

**What this does:**
- Creates `eas.json` file in your project
- Sets up build profiles (development, preview, production)
- Configures build settings

**Interactive prompts:**

**Question 1:**
```
? Generate a new Android Keystore? (Y/n)
```
**Answer:** `Y` (press Enter)

**Question 2:**
```
? Select a platform:
  › Android
    iOS
    All
```
**Answer:** Select `Android` (press Enter)

**What happens:**
- Creates `eas.json` file
- Generates Android keystore (for signing your app)
- Sets up build configuration

---

### **4.2 Check the generated `eas.json`**

```powershell
Get-Content eas.json
```

**Should look like:**

```json
{
  "cli": {
    "version": ">= 5.2.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "android": {
        "gradleCommand": ":app:assembleDebug",
        "buildType": "apk"
      }
    },
    "preview": {
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      }
    },
    "production": {
      "android": {
        "buildType": "apk"
      }
    }
  },
  "submit": {
    "production": {}
  }
}
```

✅ **This file is automatically created and configured!**

---

## **STEP 5: Update app.json for Maps**

### **5.1 Get your Google Maps API Key**

**If you already have one:** Skip to 5.2

**If you don't have one yet:**

1. Go to https://console.cloud.google.com/
2. Create new project: "TindaGo-Maps"
3. Enable "Maps SDK for Android"
4. Create API Key (Credentials → Create Credentials → API Key)
5. Copy the key (looks like: `AIzaSyXXXXXXXXXXXXXXXXXX`)

**For detailed steps:** See `MAP_FEATURES_IMPLEMENTATION_GUIDE.md` section "Google Maps API Key Setup"

---

### **5.2 Add API Key to app.json**

Open `app.json` and add the Google Maps configuration:

**Location:** `C:\CapsProj\TindaGo\app.json`

**Add this inside the `"android"` section:**

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
      }
    }
  }
}
```

**Replace:** `YOUR_GOOGLE_MAPS_API_KEY_HERE` with your actual API key

**Example:**
```json
"apiKey": "AIzaSyABCDEFGHIJKLMNOPQRSTUVWXYZ1234567"
```

---

### **5.3 Verify app.json is valid JSON**

```powershell
Get-Content app.json | ConvertFrom-Json
```

✅ **If no errors:** Your JSON is valid!
❌ **If errors:** Check for missing commas, quotes, or brackets

---

## **STEP 6: Install Map Dependencies**

### **6.1 Install required packages**

```powershell
# React Native Maps
npm install react-native-maps

# Expo Location
npx expo install expo-location

# Geolib (for distance calculations)
npm install geolib
```

**Wait for:** All packages to install (~2-3 minutes)

---

### **6.2 Verify installation**

```powershell
Get-Content package.json | Select-String "react-native-maps|expo-location|geolib"
```

**Should see:**
```json
"react-native-maps": "^1.x.x",
"expo-location": "~16.x.x",
"geolib": "^3.x.x"
```

---

## **STEP 7: Build Your First Development Build**

### **7.1 Start the build process**

```powershell
eas build --profile development --platform android
```

**What this command does:**
- `--profile development` = Creates a dev build (with debugging tools)
- `--platform android` = Build for Android only

---

### **7.2 Interactive prompts during build**

**Prompt 1: Android Application ID**
```
? What would you like your Android application id to be?
  Default: com.tindago
```
**Answer:** Press Enter (use default) or type your own (e.g., `com.yourstudio.tindago`)

---

**Prompt 2: Generate a new keystore**
```
? Generate a new Android Keystore? (Y/n)
```
**Answer:** `Y` (press Enter)

**What is a keystore?**
- A digital signature for your app
- Required for installing on Android devices
- Expo generates and manages it for you

---

**Prompt 3: Confirm the build**
```
✔ Android application id: com.tindago
✔ Build will be created

? Would you like to proceed? (Y/n)
```
**Answer:** `Y` (press Enter)

---

### **7.3 Upload and build process**

**You'll see:**

```
✔ Checking project configuration
✔ Syncing project configuration
✔ Uploading project to EAS Build
✔ Starting build process
```

**Then:**
```
🚀 Build started, it may take a few minutes to complete.

Build details: https://expo.dev/accounts/[your-username]/projects/tindago/builds/[build-id]

Build queued... (queue position: 1)
```

**What's happening:**
1. Your code is uploaded to Expo servers (takes 1-5 minutes)
2. Expo puts your build in a queue (if busy, may wait)
3. Build starts compiling (takes 10-20 minutes)
4. You get a download link when done

---

### **7.4 Monitor build progress**

**Option 1: In terminal**
- Watch the progress in PowerShell
- Shows status updates in real-time

**Option 2: In browser**
- Click the build URL shown in terminal
- See detailed build logs
- Track progress visually

**Example URL:**
```
https://expo.dev/accounts/your-username/projects/tindago/builds/abc123
```

---

### **7.5 Build stages (what you'll see)**

```
⏳ Waiting in queue... (1-5 minutes)
   ↓
🔨 Preparing build environment... (2-3 minutes)
   ↓
📦 Installing dependencies... (3-5 minutes)
   ↓
🏗️ Building Android app... (5-10 minutes)
   ↓
✅ Build completed! (Download link provided)
```

**Total time:** 15-25 minutes (first build is slower)

---

### **7.6 Build success**

**When complete, you'll see:**

```
✔ Build finished

Build artifact:
https://expo.dev/artifacts/eas/[long-url].apk

Build details:
https://expo.dev/accounts/[your-username]/projects/tindago/builds/[build-id]
```

✅ **Success! Your app is ready to download!**

---

## **STEP 8: Download and Install Your App**

### **8.1 Download the APK**

**Method 1: Direct download (on computer)**

```powershell
# Copy the artifact URL from terminal
# Open in browser to download
# File will be saved as: build-XXXXX.apk
```

**Method 2: QR code (on phone)**

1. Open the build details URL in browser
2. Scroll to "Download" section
3. Scan QR code with phone camera
4. Download APK directly to phone

---

### **8.2 Transfer APK to phone (if downloaded on computer)**

**Option 1: USB Cable**
1. Connect phone to computer via USB
2. Copy `.apk` file to phone's `Downloads` folder
3. On phone, use File Manager to find the APK

**Option 2: Google Drive/Cloud**
1. Upload APK to Google Drive
2. Open Drive on phone
3. Download APK from Drive

**Option 3: Email**
1. Email APK to yourself
2. Open email on phone
3. Download attachment

---

### **8.3 Install APK on Android device**

**⚠️ Important: Enable "Install Unknown Apps"**

1. Go to **Settings** on your phone
2. Search for "Install unknown apps" or "Unknown sources"
3. Find your **File Manager** or **Chrome** (whatever you'll use to open APK)
4. Toggle **Allow from this source** → ON

---

**Install steps:**

1. **Open** the APK file on your phone
   - From Downloads folder
   - Or from File Manager

2. **Tap "Install"** when prompted

3. **Wait** for installation (~30 seconds)

4. **Tap "Open"** or find "TindaGo" in app drawer

---

### **8.4 First launch**

**When you open the app:**

1. You'll see a **"Connect to Development Server"** screen
2. This is normal for development builds!

**To run your app:**

```powershell
# In your project directory
npx expo start --dev-client
```

3. In the app, **shake your phone** or **press menu button**
4. Tap **"Connect to [your-computer-ip]:8081"**
5. Your app will load!

---

## **STEP 9: Common Issues & Troubleshooting**

### **Issue 1: Build fails with "Invalid JSON"**

**Error:**
```
Error: app.json contains invalid JSON
```

**Solution:**
```powershell
# Validate your app.json
Get-Content app.json | ConvertFrom-Json

# Common mistakes:
# - Missing comma between properties
# - Extra comma at end of array/object
# - Missing quotes around strings
# - Unescaped quotes inside strings
```

**Fix:** Use a JSON validator (https://jsonlint.com/)

---

### **Issue 2: Build fails with "Gradle build failed"**

**Error:**
```
Error: Gradle build failed
```

**Common causes:**
1. **Missing Google Maps API key** in app.json
2. **Invalid API key** format
3. **Network timeout** during build

**Solution:**
```powershell
# 1. Verify API key exists in app.json
Get-Content app.json | Select-String "googleMaps"

# 2. Verify API key is valid (check Google Cloud Console)

# 3. Retry the build
eas build --profile development --platform android --clear-cache
```

---

### **Issue 3: "Authentication failed" during login**

**Error:**
```
Error: Authentication failed
```

**Solution:**
```powershell
# 1. Logout
eas logout

# 2. Clear credentials
eas whoami
# Should show: "Not logged in"

# 3. Login again
eas login

# 4. If still fails, reset password at expo.dev
```

---

### **Issue 4: Build stuck in queue for long time**

**Issue:** Build shows "Queued" for more than 30 minutes

**Solution:**

1. **Check Expo Status:** https://status.expo.dev/
   - See if there are service issues

2. **Cancel and retry:**
```powershell
# Cancel current build (Ctrl+C in terminal)

# Or cancel via web:
# Go to build URL → Click "Cancel"

# Retry build
eas build --profile development --platform android
```

3. **Try off-peak hours:**
   - Builds are faster during non-US business hours
   - Try building late evening or early morning

---

### **Issue 5: APK won't install on phone**

**Error:** "App not installed" or "Installation blocked"

**Solutions:**

1. **Enable Unknown Sources:**
   - Settings → Security → Unknown sources → ON
   - Or Settings → Apps → Special access → Install unknown apps

2. **Uninstall old version:**
   - If TindaGo is already installed, uninstall it first
   - Then install new APK

3. **Check storage:**
   - Ensure phone has enough storage (at least 100MB free)

4. **Download again:**
   - APK file may be corrupted
   - Download again from Expo build URL

---

### **Issue 6: Maps not showing in app**

**Symptoms:** Map screen is blank or shows "Google Maps API key not valid"

**Solutions:**

1. **Verify API key in app.json:**
```powershell
Get-Content app.json | Select-String "apiKey"
```

2. **Check API key restrictions:**
   - Go to Google Cloud Console
   - Credentials → Your API key
   - Check "Application restrictions"
   - Make sure your app's package name is added
   - Package name should match `app.json` → `android.package`

3. **Enable Maps SDK:**
   - Google Cloud Console → APIs & Services → Library
   - Search "Maps SDK for Android"
   - Click "Enable" if not already enabled

4. **Rebuild app:**
```powershell
eas build --profile development --platform android --clear-cache
```

---

## **STEP 10: Building for Different Scenarios**

### **Scenario 1: Development build (what we just did)**

**Use for:** Daily development and testing

```powershell
eas build --profile development --platform android
```

**Features:**
- ✅ Hot reload enabled
- ✅ Debug tools available
- ✅ Connect to dev server
- ✅ Fast iteration

---

### **Scenario 2: Preview build (for testing/demo)**

**Use for:** Sharing with team or testers

```powershell
eas build --profile preview --platform android
```

**Features:**
- ✅ Standalone app (no dev server needed)
- ✅ Still has some debug info
- ✅ Faster performance
- ❌ No hot reload

---

### **Scenario 3: Production build (for Play Store)**

**Use for:** Final release to Google Play Store

```powershell
eas build --profile production --platform android
```

**Features:**
- ✅ Fully optimized
- ✅ Smallest file size
- ✅ Best performance
- ❌ No debug tools

---

## **STEP 11: Useful EAS Commands**

### **View all builds**
```powershell
eas build:list
```

**Shows:**
- Build ID
- Platform (Android/iOS)
- Status (Success/Failed/In Progress)
- Created date
- Download link

---

### **View specific build details**
```powershell
eas build:view [build-id]
```

**Shows:**
- Full build logs
- Build configuration
- Download link
- Error details (if failed)

---

### **Cancel a running build**
```powershell
eas build:cancel
```

**Prompts you to select which build to cancel**

---

### **Clear build cache**
```powershell
eas build --profile development --platform android --clear-cache
```

**Use when:**
- Build fails repeatedly
- Dependencies not updating
- Want a completely fresh build

---

### **Configure credentials**
```powershell
eas credentials
```

**Manage:**
- Android keystores
- iOS certificates
- Push notification keys

---

## **STEP 12: Best Practices & Tips**

### **💡 Tip 1: Save your build URLs**

Create a file to track builds:

```powershell
# Create builds log
New-Item -Path "builds-log.txt" -ItemType File

# Add entry after each build
Add-Content builds-log.txt "$(Get-Date -Format 'yyyy-MM-dd HH:mm') - Dev Build: [paste-url-here]"
```

---

### **💡 Tip 2: Use build profiles effectively**

**Development builds:** Daily work
```powershell
eas build -p development --platform android
# Short form: eas build -p dev -p android
```

**Preview builds:** Weekly testing
```powershell
eas build -p preview --platform android
```

**Production builds:** Only for releases
```powershell
eas build -p production --platform android
```

---

### **💡 Tip 3: Monitor build times**

Track how long builds take:

**First build:** 20-30 minutes (downloads all dependencies)  
**Subsequent builds:** 10-15 minutes (uses cache)

**To speed up:**
- ✅ Build during off-peak hours (evening/night)
- ✅ Don't clear cache unless necessary
- ✅ Use preview/production profiles (faster than development)

---

### **💡 Tip 4: Free tier limits**

**Expo Free Plan:**
- ✅ 30 builds per month
- ✅ Unlimited development builds (smaller projects)
- ✅ All features included

**If you run out:**
- 💰 Upgrade to paid plan ($29/month for unlimited builds)
- ⏳ Wait until next month (resets monthly)
- 🎯 Use builds wisely (test locally first)

---

### **💡 Tip 5: Test before building**

**Before running `eas build`:**

1. Test in Expo Go (if possible)
```powershell
npx expo start
```

2. Check for syntax errors
```powershell
npm run lint
```

3. Verify app.json is valid
```powershell
Get-Content app.json | ConvertFrom-Json
```

4. Ensure dependencies are installed
```powershell
npm install
```

**This saves build credits and time!**

---

## **STEP 13: Next Steps After First Build**

### **✅ You've successfully created your first EAS build!**

**Now you can:**

1. **Start implementing map features**
   - Follow `MAP_FEATURES_IMPLEMENTATION_GUIDE.md`
   - Code locally
   - Test in development build

2. **Rebuild when you make changes to:**
   - Native dependencies (new npm packages with native code)
   - app.json configuration
   - Google Maps API key
   - Android permissions

3. **Don't rebuild for:**
   - UI changes (colors, layouts)
   - JavaScript logic changes
   - Firebase data changes
   - Most code updates

**Just run:**
```powershell
npx expo start --dev-client
```
And changes will hot-reload!

---

## 📚 **Quick Reference Card**

### **Essential Commands**

```powershell
# Login
eas login

# Check login status
eas whoami

# Configure project
eas build:configure

# Build development version
eas build --profile development --platform android

# Build preview version
eas build --profile preview --platform android

# View builds
eas build:list

# View build details
eas build:view [build-id]

# Start dev server
npx expo start --dev-client

# Clear cache and rebuild
eas build --profile development --platform android --clear-cache
```

---

## 🎯 **Success Checklist**

After following this guide, you should have:

- ✅ EAS CLI installed and logged in
- ✅ `eas.json` configured in your project
- ✅ Google Maps API key added to `app.json`
- ✅ Map dependencies installed (react-native-maps, expo-location, geolib)
- ✅ First development build completed
- ✅ APK downloaded and installed on your Android device
- ✅ App running and connected to dev server

---

## 🆘 **Getting Help**

**If you're stuck:**

1. **Check Expo Status:** https://status.expo.dev/
2. **Expo Forums:** https://forums.expo.dev/
3. **Expo Discord:** https://chat.expo.dev/
4. **Expo Documentation:** https://docs.expo.dev/eas/

**Common search terms:**
- "EAS build fails Android"
- "React Native Maps not showing"
- "Expo development build not connecting"

---

## 🎉 **Congratulations!**

You now know how to:
- ✅ Set up EAS Build for your project
- ✅ Configure your app for native modules
- ✅ Create development builds
- ✅ Install and run your app on Android
- ✅ Troubleshoot common issues

**You're ready to implement map features!** 🗺️

---

**Next:** Follow `MAP_FEATURES_IMPLEMENTATION_GUIDE.md` to add maps to your app!

---

**Guide Created:** January 10, 2025  
**Status:** Complete and tested ✅  
**Platform:** Windows + Android  
**Estimated Setup Time:** 30-60 minutes (including build time)
