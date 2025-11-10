# 🗺️ Complete Map Setup - Step by Step Instructions

**Status:** expo-location is now installed ✅

Follow these steps in order. Do NOT skip steps.

---

## **PHASE 1: Get Google Maps API Key**

### **Step 1: Go to Google Cloud Console**

1. Open browser: https://console.cloud.google.com/
2. Sign in with your Google account
3. Click "Select a project" at the top
4. Click "NEW PROJECT"

### **Step 2: Create Project**

1. Project name: `TindaGo-Maps`
2. Click "CREATE"
3. Wait 30 seconds for project to be created
4. Select the project from dropdown

### **Step 3: Enable Maps SDK**

1. In the search bar at top, type: `Maps SDK for Android`
2. Click on "Maps SDK for Android"
3. Click "ENABLE"
4. Wait for it to enable (~10 seconds)

### **Step 4: Enable Maps SDK for iOS (for future)**

1. In the search bar, type: `Maps SDK for iOS`
2. Click on "Maps SDK for iOS"
3. Click "ENABLE"

### **Step 5: Create API Key**

1. Click hamburger menu (☰) → "APIs & Services" → "Credentials"
2. Click "+ CREATE CREDENTIALS" at top
3. Select "API key"
4. Copy the API key that appears (looks like: `AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX`)
5. **SAVE THIS KEY** - paste it in Notepad temporarily

### **Step 6: Restrict API Key (Security)**

1. Click "RESTRICT KEY" on the popup
2. Name: `TindaGo Android Key`
3. Under "Application restrictions":
   - Select "Android apps"
   - Click "+ ADD AN ITEM"
   - Package name: `com.tindago.app` (or your actual package name)
   - Leave SHA-1 blank for now
4. Under "API restrictions":
   - Select "Restrict key"
   - Check ✅ "Maps SDK for Android"
   - Check ✅ "Maps SDK for iOS"
5. Click "SAVE"

**✅ You now have your Google Maps API key!**

---

## **PHASE 2: Install Map Dependencies**

### **Step 7: Install react-native-maps**

```powershell
npm install react-native-maps
```

**Wait for:** "added 1 package" message

### **Step 8: Install geolib (for distance calculations)**

```powershell
npm install geolib
```

**Wait for:** "added 1 package" message

### **Step 9: Verify all packages installed**

```powershell
npm list expo-location react-native-maps geolib
```

**Expected output:**
```
TindaGo@ C:\CapsProj\TindaGo
├── expo-location@16.5.5
├── react-native-maps@1.18.0
└── geolib@3.3.4
```

**✅ All dependencies installed!**

---

## **PHASE 3: Configure app.json**

### **Step 10: Open app.json**

```powershell
notepad app.json
```

### **Step 11: Add Google Maps API Key**

Find the `"android"` section and add your API key:

**BEFORE:**
```json
"android": {
  "adaptiveIcon": {
    "foregroundImage": "./assets/images/adaptive-icon.png",
    "backgroundColor": "#ffffff"
  }
}
```

**AFTER:**
```json
"android": {
  "adaptiveIcon": {
    "foregroundImage": "./assets/images/adaptive-icon.png",
    "backgroundColor": "#ffffff"
  },
  "config": {
    "googleMaps": {
      "apiKey": "YOUR_GOOGLE_MAPS_API_KEY_HERE"
    }
  }
}
```

Replace `YOUR_GOOGLE_MAPS_API_KEY_HERE` with the actual API key you copied in Step 5.

### **Step 12: Add Location Permissions**

In the same `app.json`, find the `"permissions"` array and make sure these are included:

```json
"permissions": [
  "ACCESS_FINE_LOCATION",
  "ACCESS_COARSE_LOCATION"
]
```

If there's no `"permissions"` field, add it inside the `"android"` section:

```json
"android": {
  "adaptiveIcon": {
    "foregroundImage": "./assets/images/adaptive-icon.png",
    "backgroundColor": "#ffffff"
  },
  "permissions": [
    "ACCESS_FINE_LOCATION",
    "ACCESS_COARSE_LOCATION"
  ],
  "config": {
    "googleMaps": {
      "apiKey": "YOUR_GOOGLE_MAPS_API_KEY_HERE"
    }
  }
}
```

### **Step 13: Save and close app.json**

Press `Ctrl+S` to save, then close Notepad.

**✅ Configuration complete!**

---

## **PHASE 4: Setup EAS Build**

### **Step 14: Check if EAS CLI is installed**

```powershell
eas --version
```

**If you see a version number:** Skip to Step 16

**If you see error:** Continue to Step 15

### **Step 15: Install EAS CLI (if needed)**

```powershell
npm install -g eas-cli
```

**Wait for:** Installation to complete (~1 minute)

### **Step 16: Login to EAS**

```powershell
eas login
```

**Enter your Expo account email and password**

**If you don't have an Expo account:**
```powershell
eas register
```

### **Step 17: Configure EAS Build**

```powershell
eas build:configure
```

**What happens:**
- It will ask: "Select platform" → Choose `Android` (use arrow keys, press Enter)
- It creates `eas.json` file automatically

### **Step 18: Update eas.json for development build**

```powershell
notepad eas.json
```

**Replace the contents with:**

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
        "buildType": "apk",
        "gradleCommand": ":app:assembleDebug"
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

Save and close.

**✅ EAS is configured!**

---

## **PHASE 5: Build the App**

### **Step 19: Start the build**

```powershell
eas build --profile development --platform android
```

**What happens:**
1. Asks if you want to commit changes → Press `Y` (if using Git)
2. Uploads your project to EAS servers
3. Builds the APK (~10-20 minutes)
4. Gives you a download link

**Expected output:**
```
✔ Build started, it may take a few minutes to complete.
✔ You can monitor the build at:

https://expo.dev/accounts/YOUR_ACCOUNT/projects/tindago/builds/XXXX
```

### **Step 20: Wait for build to complete**

1. Click the URL from Step 19
2. Watch the build progress in your browser
3. Wait for "Build finished" (green checkmark)

### **Step 21: Download the APK**

1. On the build page, click "Download"
2. Save the `.apk` file to your computer
3. Transfer to your Android phone via USB or cloud storage

### **Step 22: Install on your phone**

1. On your Android phone, open the APK file
2. Allow installation from unknown sources (if prompted)
3. Install the app
4. Open TindaGo

**✅ Development build installed!**

---

## **PHASE 6: Create Map Components**

### **Step 23: Create maps folder**

```powershell
New-Item -ItemType Directory -Path "C:\CapsProj\TindaGo\src\components\maps" -Force
```

### **Step 24: Create StoreMapView component**

```powershell
notepad "C:\CapsProj\TindaGo\src\components\maps\StoreMapView.tsx"
```

**Paste this code:**

```typescript
import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator, Text } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';

interface Store {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  address: string;
}

interface StoreMapViewProps {
  stores: Store[];
  onStoreSelect?: (store: Store) => void;
}

export default function StoreMapView({ stores, onStoreSelect }: StoreMapViewProps) {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        // Request location permission
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setError('Location permission denied');
          setLoading(false);
          return;
        }

        // Get current location
        let currentLocation = await Location.getCurrentPositionAsync({});
        setLocation(currentLocation);
        setLoading(false);
      } catch (err) {
        setError('Failed to get location');
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Loading map...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  const initialRegion = {
    latitude: location?.coords.latitude || 7.0731, // Davao City default
    longitude: location?.coords.longitude || 125.6128,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  };

  return (
    <View style={styles.container}>
      <MapView
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={initialRegion}
        showsUserLocation={true}
        showsMyLocationButton={true}
      >
        {stores.map((store) => (
          <Marker
            key={store.id}
            coordinate={{
              latitude: store.latitude,
              longitude: store.longitude,
            }}
            title={store.name}
            description={store.address}
            onPress={() => onStoreSelect?.(store)}
          />
        ))}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: '100%',
    height: '100%',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  errorText: {
    fontSize: 16,
    color: '#f44336',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
});
```

Save and close.

### **Step 25: Create LocationPicker component (for store registration)**

```powershell
notepad "C:\CapsProj\TindaGo\src\components\maps\LocationPicker.tsx"
```

**Paste this code:**

```typescript
import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import { Colors } from '../../constants/Colors';
import { Fonts } from '../../constants/Fonts';

interface LocationPickerProps {
  onLocationSelect: (latitude: number, longitude: number, address: string) => void;
  initialLatitude?: number;
  initialLongitude?: number;
}

export default function LocationPicker({
  onLocationSelect,
  initialLatitude,
  initialLongitude,
}: LocationPickerProps) {
  const [selectedLocation, setSelectedLocation] = useState({
    latitude: initialLatitude || 7.0731,
    longitude: initialLongitude || 125.6128,
  });
  const [loading, setLoading] = useState(true);
  const [address, setAddress] = useState('');

  useEffect(() => {
    (async () => {
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setLoading(false);
          return;
        }

        if (!initialLatitude || !initialLongitude) {
          let currentLocation = await Location.getCurrentPositionAsync({});
          setSelectedLocation({
            latitude: currentLocation.coords.latitude,
            longitude: currentLocation.coords.longitude,
          });
        }

        setLoading(false);
      } catch (err) {
        setLoading(false);
      }
    })();
  }, []);

  const handleMapPress = async (event: any) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;
    setSelectedLocation({ latitude, longitude });

    // Reverse geocode to get address
    try {
      const result = await Location.reverseGeocodeAsync({ latitude, longitude });
      if (result.length > 0) {
        const loc = result[0];
        const addressText = `${loc.street || ''} ${loc.city || ''}, ${loc.region || ''}`;
        setAddress(addressText);
      }
    } catch (err) {
      console.error('Geocoding error:', err);
    }
  };

  const handleConfirm = () => {
    onLocationSelect(selectedLocation.latitude, selectedLocation.longitude, address);
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={{
          latitude: selectedLocation.latitude,
          longitude: selectedLocation.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
        onPress={handleMapPress}
        showsUserLocation={true}
      >
        <Marker coordinate={selectedLocation} draggable onDragEnd={handleMapPress} />
      </MapView>

      <View style={styles.infoContainer}>
        <Text style={styles.instructionText}>
          Tap on the map or drag the marker to select your store location
        </Text>
        {address ? <Text style={styles.addressText}>{address}</Text> : null}
        <TouchableOpacity style={styles.confirmButton} onPress={handleConfirm}>
          <Text style={styles.confirmButtonText}>Confirm Location</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: '100%',
    height: '100%',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  instructionText: {
    fontFamily: Fonts.primary,
    fontSize: 14,
    color: Colors.text,
    marginBottom: 10,
    textAlign: 'center',
  },
  addressText: {
    fontFamily: Fonts.primaryBold,
    fontSize: 16,
    color: Colors.primary,
    marginBottom: 15,
    textAlign: 'center',
  },
  confirmButton: {
    backgroundColor: Colors.primary,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  confirmButtonText: {
    fontFamily: Fonts.primaryBold,
    fontSize: 16,
    color: '#fff',
  },
});
```

Save and close.

**✅ Map components created!**

---

## **PHASE 7: Test the Map Components**

### **Step 26: Create a test screen**

```powershell
notepad "C:\CapsProj\TindaGo\app\test-map.tsx"
```

**Paste this code:**

```typescript
import React from 'react';
import { View, StyleSheet } from 'react-native';
import StoreMapView from '../src/components/maps/StoreMapView';

// Sample stores for testing
const sampleStores = [
  {
    id: '1',
    name: 'Sari-Sari Store 1',
    latitude: 7.0731,
    longitude: 125.6128,
    address: 'Davao City',
  },
  {
    id: '2',
    name: 'Sari-Sari Store 2',
    latitude: 7.0800,
    longitude: 125.6200,
    address: 'Near Davao City',
  },
];

export default function TestMapScreen() {
  const handleStoreSelect = (store: any) => {
    console.log('Selected store:', store);
    alert(`Selected: ${store.name}`);
  };

  return (
    <View style={styles.container}>
      <StoreMapView stores={sampleStores} onStoreSelect={handleStoreSelect} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
```

Save and close.

### **Step 27: Start development server**

```powershell
npm start
```

### **Step 28: Open app on your phone**

1. Make sure your phone has the development build installed (from Step 22)
2. Open the TindaGo app
3. Shake your phone to open dev menu
4. Tap "Go to /test-map" or use the URL bar to navigate to it

### **Step 29: Test the map**

You should see:
- ✅ Map loads with your current location
- ✅ Two store markers appear
- ✅ You can tap markers to see store info
- ✅ Blue dot shows your location

**If map doesn't load:**
- Check internet connection
- Verify API key in app.json is correct
- Check if location permission is granted

**✅ Maps are working!**

---

## **PHASE 8: Integrate with Your App**

### **Step 30: Update your store list screen**

Find your existing store list screen (probably in `app/(auth)/stores.tsx` or similar) and import the map component:

```typescript
import StoreMapView from '../../src/components/maps/StoreMapView';
```

### **Step 31: Add a map view toggle button**

Add a button to switch between list view and map view:

```typescript
const [viewMode, setViewMode] = useState<'list' | 'map'>('list');

// In your render:
{viewMode === 'map' ? (
  <StoreMapView stores={stores} onStoreSelect={handleStoreSelect} />
) : (
  // Your existing list view
)}
```

### **Step 32: Update store registration**

In your store registration form, add the location picker:

```typescript
import LocationPicker from '../../src/components/maps/LocationPicker';

// In your form:
<LocationPicker
  onLocationSelect={(lat, lng, addr) => {
    setStoreLatitude(lat);
    setStoreLongitude(lng);
    setStoreAddress(addr);
  }}
/>
```

---

## **PHASE 9: Add Distance Calculation**

### **Step 33: Create distance utility**

```powershell
New-Item -ItemType Directory -Path "C:\CapsProj\TindaGo\src\utils" -Force
notepad "C:\CapsProj\TindaGo\src\utils\distance.ts"
```

**Paste this code:**

```typescript
import { getDistance } from 'geolib';

interface Location {
  latitude: number;
  longitude: number;
}

/**
 * Calculate distance between two coordinates in kilometers
 */
export function calculateDistance(from: Location, to: Location): number {
  const distanceInMeters = getDistance(
    { latitude: from.latitude, longitude: from.longitude },
    { latitude: to.latitude, longitude: to.longitude }
  );
  
  return distanceInMeters / 1000; // Convert to kilometers
}

/**
 * Format distance for display
 */
export function formatDistance(distanceInKm: number): string {
  if (distanceInKm < 1) {
    return `${Math.round(distanceInKm * 1000)}m`;
  }
  return `${distanceInKm.toFixed(1)}km`;
}

/**
 * Sort stores by distance from user location
 */
export function sortStoresByDistance<T extends { latitude: number; longitude: number }>(
  stores: T[],
  userLocation: Location
): T[] {
  return [...stores].sort((a, b) => {
    const distanceA = calculateDistance(userLocation, a);
    const distanceB = calculateDistance(userLocation, b);
    return distanceA - distanceB;
  });
}
```

Save and close.

### **Step 34: Use distance in your store list**

```typescript
import { calculateDistance, formatDistance } from '../utils/distance';
import * as Location from 'expo-location';

// Get user location
const [userLocation, setUserLocation] = useState(null);

useEffect(() => {
  (async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status === 'granted') {
      const location = await Location.getCurrentPositionAsync({});
      setUserLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
    }
  })();
}, []);

// Calculate distance for each store
{stores.map((store) => {
  const distance = userLocation
    ? calculateDistance(userLocation, {
        latitude: store.latitude,
        longitude: store.longitude,
      })
    : null;

  return (
    <StoreCard
      key={store.id}
      store={store}
      distance={distance ? formatDistance(distance) : null}
    />
  );
})}
```

**✅ Distance calculation working!**

---

## **FINAL CHECKLIST**

Before you say "I'm done", verify:

- ✅ Google Maps API key is created and added to app.json
- ✅ expo-location, react-native-maps, geolib are installed
- ✅ Development build is created and installed on phone
- ✅ StoreMapView component shows stores on map
- ✅ LocationPicker component lets users pick location
- ✅ Distance calculation shows nearest stores
- ✅ Map integrates with existing store list
- ✅ Location permissions work correctly

---

## **TROUBLESHOOTING**

### **Map shows gray screen:**
- Check API key in app.json
- Verify API key has Maps SDK for Android enabled
- Check internet connection

### **"Location permission denied":**
- Go to phone Settings → Apps → TindaGo → Permissions → Location → Allow

### **Markers don't show:**
- Check if stores have valid latitude/longitude values
- Verify latitude is between -90 and 90
- Verify longitude is between -180 and 180

### **Build fails:**
```powershell
# Clear EAS cache and retry
eas build:clear-cache
eas build --profile development --platform android
```

### **App crashes on map screen:**
- Rebuild the development build (maps need native code)
- Make sure you're using the development build, not Expo Go

---

## **YOU'RE DONE! 🎉**

You now have:
- 🗺️ Google Maps integrated
- 📍 Store markers on map
- 📏 Distance calculation
- 🎯 Location picker for registration
- 📱 Working development build

**Next steps:**
- Test with real stores
- Add filters (distance, category)
- Add search on map
- Add directions to store

---

**Need help?** Tell me which step you're stuck on and what error you're seeing.
