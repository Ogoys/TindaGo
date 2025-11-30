# Google Maps Refresh & Rebuild Guide

## ✅ What Has Been Fixed

I've added refresh functionality to all map screens in your app:

### Customer Side
- **stores-map.tsx**: Added refresh button in the header (green refresh icon)

### Store Owner Side
- **view-store-location.tsx**: Added refresh button in the header
- **edit-store-location.tsx**: Added refresh button in the header
- **LocationPicker.tsx**: Improved map initialization and loading indicators

## 🔧 Why Maps Might Not Be Showing

Your Google Maps API key is configured in `app.json`:
```json
"googleMaps": {
  "apiKey": "AIzaSyAL7kC_3jIPra7L-AqmSKudve-KNWFllpA"
}
```

However, **the API key is compiled into the native Android app at build time**. This means:
- If you updated the API key recently, you need to rebuild the app
- The old build still has the old/missing API key
- Simply restarting the app won't pick up the new key

## 🚀 How to Fix - Rebuild Your App

### For Development Build

Run this command to create a new development build:
```bash
# Clear cache and rebuild
npx expo prebuild --clean

# Create new development build
eas build --profile development --platform android
```

### For Local Development (if using Expo Go)

**Note:** Google Maps doesn't work well with Expo Go. You need a development build.

If you're currently using Expo Go, switch to a development build:
```bash
eas build --profile development --platform android --local
```

### For Production/Preview Build

```bash
eas build --profile preview --platform android
```

## 🔄 Using the New Refresh Button

After rebuilding, you can use the refresh button (🔄) on any map screen to:
- Reload the map if it doesn't appear initially
- Refresh store locations
- Reset the map after any errors

### Where to Find Refresh Buttons:
1. **Customer Stores Map**: Top-right corner of the screen (green refresh icon)
2. **Store Location View**: Top-right corner next to the edit button
3. **Store Location Edit**: Top-right corner of the screen

## 📍 Verify Your Google Maps API Key

Make sure your API key has these APIs enabled in Google Cloud Console:
1. Maps SDK for Android
2. Maps JavaScript API (if using web)
3. Geocoding API (for address lookup)
4. Directions API (for route calculation)

### Check API Key Restrictions:
- Go to [Google Cloud Console](https://console.cloud.google.com/)
- Navigate to "APIs & Services" > "Credentials"
- Click on your API key
- Under "API restrictions", make sure the above APIs are enabled
- Under "Application restrictions", add your app's package name: `com.tindagoproject.TindaGO`

## 🧪 Testing After Rebuild

1. Install the new build on your device
2. Open the app
3. Navigate to "Stores Map" (customer side)
4. If the map doesn't load immediately, tap the refresh button (🔄)
5. Check store owner profile > "View Store Location" to see your store on the map

## 📱 Platform-Specific Notes

### Android
- The API key must be in `app.json` under `android.config.googleMaps.apiKey`
- After changing the key, you MUST rebuild (not just restart)
- The key is embedded in `AndroidManifest.xml` during build

### iOS (Future)
- Will need API key in `app.json` under `ios.config.googleMapsApiKey`
- Similar rebuild requirement

## 🐛 Troubleshooting

### Maps Still Not Showing After Rebuild?

1. **Check Logs**: Look for Google Maps errors in the console
   ```bash
   npx expo run:android
   # Watch for "Google Maps" or "API key" errors
   ```

2. **Verify API Key is Active**: 
   - Go to Google Cloud Console
   - Check if the key has any usage today
   - If no usage, the key might not be properly configured

3. **Check Billing**: 
   - Google Maps requires a billing account
   - Even with free tier, billing must be enabled

4. **Try Different API Key**: 
   - Create a new API key
   - Update `app.json`
   - Rebuild the app

### Permission Denied Error?

If you see "Location Permission Required":
1. Tap "Allow Location Access" 
2. Grant location permissions in your device settings
3. Maps won't show without location access

## ✨ New Features Added

1. **Refresh Buttons**: Manual refresh on all map screens
2. **Better Loading States**: Improved loading indicators
3. **Map Ready Detection**: Ensures map is fully loaded before showing markers
4. **Error Recovery**: Better error boundaries and retry mechanisms

## 📝 Summary

**To make maps work:**
1. Verify your API key is enabled in Google Cloud Console
2. Make sure all required APIs are enabled (Maps SDK, Geocoding, Directions)
3. **Rebuild your app** using one of the commands above
4. Install the new build
5. Use the refresh button (🔄) if maps don't load initially

The refresh buttons will help, but **rebuilding is essential** after changing the API key!
