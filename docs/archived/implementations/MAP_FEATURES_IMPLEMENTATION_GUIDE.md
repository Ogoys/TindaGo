# 🗺️ Complete Implementation Guide: Map Features for TindaGo

## **Overview: Two Map Features to Implement**

This guide covers the complete implementation of map-based features for TindaGo, enabling store owners to pin their location during registration and allowing customers to discover nearby stores on an interactive map.

---

## 📍 **FEATURE 1: Store Location Pin on Map (Registration)**
**Priority:** Implement this FIRST (used during store registration)

**Purpose:** Allow store owners to set their exact GPS location on a map during the registration process.

**Key Capabilities:**
- Interactive map with draggable pin
- GPS location detection
- Address geocoding (coordinates → address)
- Visual location confirmation
- Save coordinates to Firebase

---

## 🗺️ **FEATURE 2: Map-Based Store Selection (Customer View)**
**Priority:** Implement this SECOND (uses data from Feature 1)

**Purpose:** Display all verified stores on an interactive map so customers can find and select nearby stores.

**Key Capabilities:**
- Display multiple stores on map
- Calculate distances from user
- Filter by distance and status
- Tap markers to view store details
- Navigate to store profile

---

# 🔧 **LIBRARIES & DEPENDENCIES TO INSTALL**

## **1. React Native Maps**

**Installation:**
```bash
npm install react-native-maps
```

**Purpose:** Display interactive maps on Android/iOS

**Features:**
- Map display with Google Maps (Android) / Apple Maps (iOS)
- Custom markers and overlays
- User location tracking
- Region/zoom controls
- Map gestures (pan, zoom, rotate)

**Platform Support:**
- ✅ Android (Google Maps)
- ✅ iOS (Apple Maps)
- ❌ Expo Go (requires development build)

**Documentation:** https://github.com/react-native-maps/react-native-maps

---

## **2. Expo Location**

**Installation:**
```bash
npx expo install expo-location
```

**Purpose:** Access device GPS and handle location permissions

**Features:**
- Get current user coordinates
- Request location permissions
- Background location (if needed)
- Location accuracy controls
- Geocoding support

**Platform Support:**
- ✅ Android
- ✅ iOS
- ✅ Expo Go (basic features)
- ✅ Development build (full features)

**Documentation:** https://docs.expo.dev/versions/latest/sdk/location/

---

## **3. Geolib**

**Installation:**
```bash
npm install geolib
```

**Purpose:** Calculate distances between coordinates and perform geographic calculations

**Features:**
- Distance calculation (Haversine formula)
- Find nearest location
- Check if point is within radius
- Convert units (meters, kilometers, miles)
- Lightweight and fast

**Platform Support:**
- ✅ All platforms (Pure JavaScript)

**Documentation:** https://github.com/manuelbieh/geolib

---

## **4. Google Maps API (Optional but Recommended)**

**Purpose:** Geocoding (address ↔ coordinates conversion)

**Setup Required:**
1. Create Google Cloud Platform account
2. Enable APIs:
   - Maps SDK for Android
   - Geocoding API
   - Places API (optional)
3. Generate API key
4. Configure billing (free tier available)

**Cost:**
- Free tier: 28,000 requests/month
- After free tier: $5 per 1,000 requests
- Typical usage: ~100-500 requests/month

**Documentation:** https://developers.google.com/maps/documentation

---

# 🔑 **GOOGLE MAPS API KEY SETUP**

## **Step 1: Create Google Cloud Project**

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Sign in with Google account
3. Click "Select a project" → "New Project"
4. Project name: `TindaGo-Maps`
5. Click "Create"
6. Wait for project creation (~30 seconds)

---

## **Step 2: Enable Required APIs**

1. In Google Cloud Console, go to "APIs & Services" → "Library"
2. Search and enable these APIs:

### **Maps SDK for Android** (Required)
- Click "Enable"
- Allows map display on Android devices

### **Geocoding API** (Recommended)
- Click "Enable"
- Converts addresses to coordinates and vice versa

### **Places API** (Optional)
- Click "Enable"
- Address autocomplete during registration

---

## **Step 3: Generate API Key**

1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "API Key"
3. API key will be generated (e.g., `AIzaSyXXXXXXXXXXXXXXXXXX`)
4. **IMPORTANT:** Immediately restrict the key (security)

---

## **Step 4: Restrict API Key (Security)**

### **Application Restrictions:**
1. Click on your API key
2. Under "Application restrictions":
   - Select "Android apps"
3. Click "Add an app"
4. Package name: `com.tindago` (or your app's package name)
5. SHA-1 certificate fingerprint:
   - For development: Get from Android Studio or `keytool`
   - For production: Get from Play Console

### **API Restrictions:**
1. Under "API restrictions":
   - Select "Restrict key"
2. Check only needed APIs:
   - ✅ Maps SDK for Android
   - ✅ Geocoding API
   - ✅ Places API (if using)
3. Click "Save"

---

## **Step 5: Configure API Key in Project**

### **For Android** (`android/app/src/main/AndroidManifest.xml`):

```xml
<manifest>
  <application>
    <!-- Add inside <application> tag -->
    <meta-data
      android:name="com.google.android.geo.API_KEY"
      android:value="YOUR_GOOGLE_MAPS_API_KEY_HERE"/>
  </application>
</manifest>
```

### **For Expo (app.json)**:

```json
{
  "expo": {
    "android": {
      "config": {
        "googleMaps": {
          "apiKey": "YOUR_GOOGLE_MAPS_API_KEY_HERE"
        }
      }
    }
  }
}
```

### **For Environment Variables** (`.env` file):

```env
GOOGLE_MAPS_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
GOOGLE_GEOCODING_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

**Add to `.gitignore`:**
```
.env
```

**Never commit API keys to Git!**

---

# 📍 **FEATURE 1: STORE LOCATION PIN ON MAP (REGISTRATION)**

## **When to Use:**
During store owner registration process, after business details input and before document upload.

---

## **🎨 UI/UX Design**

### **Screen Flow:**
```
Store Registration Form
  ↓
Business Details Input
  ↓
📍 SET STORE LOCATION (New Screen) ← We'll create this
  ↓
Document Upload (Business Permit, ID)
  ↓
Submit for Admin Approval
```

### **Screen Layout:**

```
┌─────────────────────────────────────┐
│  ← Set Store Location        [?]    │  ← Header with help icon
├─────────────────────────────────────┤
│                                     │
│         🗺️ MAP VIEW                 │  ← Full screen map
│     (Draggable underneath pin)      │
│                                     │
│                                     │
│            📍                        │  ← Fixed center pin
│         (Pin Marker)                │
│                                     │
│                                     │
│                                     │
├─────────────────────────────────────┤
│  ┌─────────────────────────────┐   │  ← Bottom card (overlay)
│  │ 📍 Current Location         │   │
│  │ 123 Example St, Davao City  │   │
│  │ Lat: 7.1907  Lng: 125.4553  │   │
│  │                             │   │
│  │ [📍 Use My GPS Location]    │   │  ← GPS button
│  │ [✓ Confirm Location]        │   │  ← Confirm button
│  └─────────────────────────────┘   │
└─────────────────────────────────────┘
```

**Map Interaction:**
- User drags map underneath fixed pin
- Pin stays in center of screen
- Address updates in real-time as map moves
- Smooth animations

---

## **📂 File Structure**

Create these new files:

```
app/(main)/(store-owner)/auth/
├── set-store-location.tsx              ← Main screen

src/components/map/
├── LocationPicker.tsx                  ← Reusable map component
├── LocationMarker.tsx                  ← Custom pin marker
└── AddressDisplay.tsx                  ← Address info card

src/utils/
├── geocoding.ts                        ← Address ↔ Coordinates
└── locationHelpers.ts                  ← Permission checks, validation

src/types/
└── location.ts                         ← TypeScript interfaces

src/constants/
└── mapConfig.ts                        ← Map settings, default locations
```

---

## **🛠️ Technical Implementation**

### **TypeScript Types** (`src/types/location.ts`)

```typescript
export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface StoreLocation {
  coordinates: Coordinates;
  address: string;
  city: string;
  province: string;
  postalCode?: string;
  landmark?: string;
  formattedAddress: string;
}

export interface MapRegion {
  latitude: number;
  longitude: number;
  latitudeDelta: number;   // Zoom level (smaller = closer)
  longitudeDelta: number;
}
```

---

### **Map Configuration** (`src/constants/mapConfig.ts`)

```typescript
// Default map center (Davao City)
export const DEFAULT_LOCATION: Coordinates = {
  latitude: 7.1907,
  longitude: 125.4553
};

// Default zoom level
export const DEFAULT_REGION: MapRegion = {
  ...DEFAULT_LOCATION,
  latitudeDelta: 0.05,    // City view
  longitudeDelta: 0.05
};

// Davao City boundaries (for validation)
export const DAVAO_CITY_BOUNDS = {
  north: 7.3,
  south: 6.9,
  east: 125.8,
  west: 125.2
};

// Map styling
export const MAP_STYLE = [
  {
    featureType: "poi.business",
    stylers: [{ visibility: "off" }]  // Hide POIs
  }
];
```

---

### **Location Helpers** (`src/utils/locationHelpers.ts`)

**Functions to implement:**

```typescript
/**
 * Request location permission from user
 * @returns Permission status
 */
export async function requestLocationPermission(): Promise<PermissionStatus>;

/**
 * Get user's current GPS coordinates
 * @returns Coordinates or null if failed
 */
export async function getCurrentLocation(): Promise<Coordinates | null>;

/**
 * Validate if coordinates are valid numbers
 * @param lat Latitude
 * @param lng Longitude
 * @returns Boolean
 */
export function validateCoordinates(lat: number, lng: number): boolean;

/**
 * Check if coordinates are within Davao City
 * @param coordinates Location to check
 * @returns Boolean
 */
export function isLocationInDavaoCity(coordinates: Coordinates): boolean;

/**
 * Format coordinates for display
 * @param coordinates Coordinates to format
 * @returns Formatted string "7.1907, 125.4553"
 */
export function formatCoordinates(coordinates: Coordinates): string;
```

---

### **Geocoding Utilities** (`src/utils/geocoding.ts`)

**Functions to implement:**

```typescript
/**
 * Convert coordinates to human-readable address
 * @param latitude Latitude
 * @param longitude Longitude
 * @returns Address object
 */
export async function getAddressFromCoordinates(
  latitude: number,
  longitude: number
): Promise<StoreLocation | null>;

/**
 * Convert address to coordinates
 * @param address Address string
 * @returns Coordinates or null
 */
export async function getCoordinatesFromAddress(
  address: string
): Promise<Coordinates | null>;

/**
 * Example API call to Google Geocoding
 */
const GEOCODING_API = 'https://maps.googleapis.com/maps/api/geocode/json';

// Usage:
// GET ${GEOCODING_API}?latlng=${lat},${lng}&key=${API_KEY}
```

---

### **LocationPicker Component** (`src/components/map/LocationPicker.tsx`)

**Component Props:**

```typescript
interface LocationPickerProps {
  initialLocation?: Coordinates;
  onLocationSelect: (location: StoreLocation) => void;
  showCurrentLocationButton?: boolean;
  restrictToDavaoCity?: boolean;
  height?: number;
}
```

**Component Features:**

1. **Map Display:**
   - Full screen interactive map
   - Initial region: Davao City center
   - Zoom controls enabled
   - Rotate/tilt disabled for simplicity

2. **Center Pin:**
   - Custom green pin image
   - Fixed in center of screen
   - Doesn't move when map drags
   - Animated bounce on load

3. **Map Interaction:**
   - Drag map to change location
   - Pin stays centered
   - Get coordinates from map center
   - Smooth animations

4. **Current Location Button:**
   - Floating circular button (bottom-right)
   - GPS icon
   - Tap to center map on user location
   - Loading state while fetching GPS

5. **Address Display:**
   - Bottom overlay card
   - Shows current address
   - Updates on map drag (debounced)
   - Shows coordinates
   - Loading state while geocoding

6. **Confirm Button:**
   - Large green button in bottom card
   - Validates location before confirming
   - Disabled if invalid location
   - Calls `onLocationSelect` callback

---

### **Main Screen** (`app/(main)/(store-owner)/auth/set-store-location.tsx`)

**Screen Responsibilities:**

```typescript
export default function SetStoreLocationScreen() {
  // State
  const [selectedLocation, setSelectedLocation] = useState<StoreLocation | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Hooks
  const router = useRouter();
  const { storeOwner } = useAuth();

  // Methods
  const handleLocationSelect = async (location: StoreLocation) => {
    // Validate location
    // Save to Firebase
    // Navigate to next step
  };

  return (
    <View>
      <LocationPicker
        initialLocation={DEFAULT_LOCATION}
        onLocationSelect={handleLocationSelect}
        showCurrentLocationButton={true}
        restrictToDavaoCity={true}
      />
    </View>
  );
}
```

**Error Handling:**

```typescript
// Permission denied
if (permissionStatus !== 'granted') {
  Alert.alert(
    'Location Permission Required',
    'TindaGo needs your location to help customers find your store.',
    [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Open Settings', onPress: () => Linking.openSettings() }
    ]
  );
}

// GPS disabled
if (!locationEnabled) {
  Alert.alert(
    'GPS Disabled',
    'Please enable GPS to set your store location accurately.',
    [{ text: 'OK' }]
  );
}

// Geocoding failed
if (!address) {
  Alert.alert(
    'Address Not Found',
    'Could not determine address for this location. Please try again.',
    [{ text: 'OK' }]
  );
}

// Location outside Davao City
if (!isLocationInDavaoCity(coordinates)) {
  Alert.alert(
    'Location Outside Service Area',
    'TindaGo is currently available only in Davao City.',
    [{ text: 'OK' }]
  );
}
```

---

## **🗄️ Firebase Data Structure**

### **Update Store Owner Document**

**Collection:** `storeOwners/{ownerId}`

**Add these fields:**

```typescript
{
  // Existing fields...
  storeName: "Sari-Sari Ni Juan",
  ownerName: "Juan Dela Cruz",
  businessPermitNumber: "BP-2024-12345",
  
  // NEW: Location fields
  location: {
    coordinates: {
      latitude: 7.1907,
      longitude: 125.4553
    },
    address: "123 Example Street",
    city: "Davao City",
    province: "Davao del Sur",
    postalCode: "8000",
    barangay: "Poblacion District",
    landmark: "Near Gaisano Mall",
    formattedAddress: "123 Example Street, Poblacion District, Davao City, Davao del Sur 8000",
    setAt: "2025-01-10T10:30:00Z",
    setMethod: "gps" | "manual"  // How location was set
  },
  
  // Existing fields...
  verificationStatus: "pending",
  createdAt: "2025-01-10T09:00:00Z"
}
```

### **Firestore Indexes Required**

For geo-queries (find nearby stores):

```javascript
// Composite index
{
  collection: "storeOwners",
  fields: [
    { field: "verificationStatus", order: "ASCENDING" },
    { field: "location.city", order: "ASCENDING" },
    { field: "location.coordinates.latitude", order: "ASCENDING" }
  ]
}
```

**Create via Firebase Console:**
1. Go to Firestore → Indexes
2. Add composite index with above fields
3. Wait for index to build (~5 minutes)

---

## **🎨 Visual Design Specifications**

### **Map Styling:**

```typescript
const mapStyle = {
  width: '100%',
  height: '100%'
};
```

### **Pin Marker:**

**Design:**
```
Size: 40px width × 50px height
Color: #3BB77E (Colors.primary - green)
Icon: Store/shop icon in center
Shadow: Light gray shadow for depth
```

**Implementation:**
- Use custom PNG image: `src/assets/images/map/store-pin-green.png`
- Or use `<Svg>` component for vector graphics
- Add subtle drop shadow

### **Current Location Button:**

```typescript
{
  position: 'absolute',
  bottom: 180,  // Above address card
  right: 20,
  width: 50,
  height: 50,
  borderRadius: 25,
  backgroundColor: Colors.white,
  shadowColor: 'rgba(0, 0, 0, 0.25)',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 1,
  shadowRadius: 4,
  elevation: 4,
  justifyContent: 'center',
  alignItems: 'center'
}
```

**Icon:** GPS crosshair, green color

### **Address Display Card:**

```typescript
{
  position: 'absolute',
  bottom: 0,
  left: 0,
  right: 0,
  backgroundColor: Colors.white,
  borderTopLeftRadius: 20,
  borderTopRightRadius: 20,
  padding: 20,
  shadowColor: 'rgba(0, 0, 0, 0.15)',
  shadowOffset: { width: 0, height: -2 },
  shadowOpacity: 1,
  shadowRadius: 8,
  elevation: 5
}
```

**Content:**
- 📍 Icon + Address (bold)
- Coordinates (small, gray text)
- GPS button (outlined, green)
- Confirm button (solid, green)

### **Confirm Button:**

```typescript
{
  width: '100%',
  height: 50,
  backgroundColor: Colors.primary,
  borderRadius: 12,
  justifyContent: 'center',
  alignItems: 'center',
  marginTop: 15
}
```

---

# 🗺️ **FEATURE 2: MAP-BASED STORE SELECTION (CUSTOMER VIEW)**

## **When to Use:**
Customer home screen or dedicated "Find Stores Nearby" screen.

---

## **🎨 UI/UX Design**

### **Screen Layout (Recommended: Dedicated Map Screen)**

```
┌─────────────────────────────────────┐
│  ← Find Stores       🔍 Search       │  ← Header
├─────────────────────────────────────┤
│                                     │
│         🗺️ FULL SCREEN MAP          │  ← Interactive map
│                                     │
│  📍 (Store 1 - Green pin)           │
│         📍 (Store 2)                │
│  You 🔵                             │  ← User location (blue dot)
│                                     │
│     📍 (Store 3)                    │
│                                     │
│                                     │
├─────────────────────────────────────┤
│  ┌─────────────────────────────┐   │  ← Bottom sheet (slides up)
│  │ 📍 Sari-Sari Ni Juan        │   │  (Shows when marker tapped)
│  │ ⭐ 4.5 (23 reviews)          │   │
│  │ 📍 500m away • Open Now      │   │
│  │ [View Store →]              │   │
│  └─────────────────────────────┘   │
└─────────────────────────────────────┘

[🗺️] Map View    [📋] List View      ← Toggle at top
```

**Key Elements:**
- Full-screen interactive map
- Multiple store markers (green pins)
- User location (blue pulsing dot)
- Bottom sheet shows store details on tap
- Toggle between map and list view

---

## **📂 File Structure**

```
app/(main)/(customer)/
├── store-map.tsx                      ← New map screen

src/components/customer/
├── StoreMapView.tsx                   ← Main map component
├── StoreMarker.tsx                    ← Custom store marker
├── StoreBottomSheet.tsx               ← Store info popup
├── StoreListView.tsx                  ← Alternative list view
└── MapListToggle.tsx                  ← View switcher

src/utils/
└── distanceCalculation.ts             ← Distance/sorting logic

src/hooks/
└── useNearbyStores.ts                 ← Fetch stores hook

src/api/stores/
└── locationQueries.ts                 ← Firebase geo queries
```

---

## **🛠️ Technical Implementation**

### **Distance Calculation** (`src/utils/distanceCalculation.ts`)

```typescript
import { getDistance } from 'geolib';

/**
 * Calculate distance between two points
 * @param from Origin coordinates
 * @param to Destination coordinates
 * @returns Distance in meters
 */
export function calculateDistance(
  from: Coordinates,
  to: Coordinates
): number {
  return getDistance(from, to);
}

/**
 * Format distance for display
 * @param meters Distance in meters
 * @returns Formatted string "500 m" or "1.2 km"
 */
export function formatDistance(meters: number): string {
  if (meters < 1000) {
    return `${Math.round(meters)} m`;
  }
  return `${(meters / 1000).toFixed(1)} km`;
}

/**
 * Sort stores by distance from user
 * @param stores Array of stores
 * @param userLocation User's coordinates
 * @returns Sorted stores with distance property added
 */
export function sortStoresByDistance(
  stores: Store[],
  userLocation: Coordinates
): StoreWithDistance[] {
  return stores
    .map(store => ({
      ...store,
      distance: calculateDistance(
        userLocation,
        store.location.coordinates
      )
    }))
    .sort((a, b) => a.distance - b.distance);
}

/**
 * Check if store is within radius
 * @param storeLocation Store coordinates
 * @param userLocation User coordinates
 * @param radiusKm Radius in kilometers
 * @returns Boolean
 */
export function isStoreNearby(
  storeLocation: Coordinates,
  userLocation: Coordinates,
  radiusKm: number = 5
): boolean {
  const distance = calculateDistance(userLocation, storeLocation);
  return distance <= radiusKm * 1000;
}
```

---

### **Nearby Stores Hook** (`src/hooks/useNearbyStores.ts`)

```typescript
interface UseNearbyStoresResult {
  stores: StoreWithDistance[];
  loading: boolean;
  error: string | null;
  userLocation: Coordinates | null;
  refreshStores: () => void;
  filterRadius: number;
  setFilterRadius: (radius: number) => void;
}

export function useNearbyStores(
  initialRadius: number = 5
): UseNearbyStoresResult {
  // State
  const [stores, setStores] = useState<StoreWithDistance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<Coordinates | null>(null);
  const [filterRadius, setFilterRadius] = useState(initialRadius);

  // Get user location
  useEffect(() => {
    getCurrentLocation().then(setUserLocation);
  }, []);

  // Fetch stores
  useEffect(() => {
    if (!userLocation) return;

    const fetchStores = async () => {
      try {
        // Query Firebase
        const allStores = await getVerifiedStores('Davao City');
        
        // Calculate distances
        const storesWithDistance = sortStoresByDistance(
          allStores,
          userLocation
        );
        
        // Filter by radius
        const nearby = storesWithDistance.filter(
          store => store.distance <= filterRadius * 1000
        );
        
        setStores(nearby);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStores();
  }, [userLocation, filterRadius]);

  return {
    stores,
    loading,
    error,
    userLocation,
    refreshStores: () => {/* refetch */},
    filterRadius,
    setFilterRadius
  };
}
```

---

### **Store Marker Component** (`src/components/customer/StoreMarker.tsx`)

```typescript
interface StoreMarkerProps {
  store: StoreWithDistance;
  onPress: (store: Store) => void;
  isSelected?: boolean;
}

export function StoreMarker({ store, onPress, isSelected }: StoreMarkerProps) {
  // Marker color based on status
  const pinColor = store.isOpen ? Colors.primary : Colors.darkGray;
  
  return (
    <Marker
      coordinate={store.location.coordinates}
      onPress={() => onPress(store)}
      pinColor={pinColor}
    >
      {/* Custom marker with store icon */}
      <View style={styles.markerContainer}>
        <MaterialIcons 
          name="store" 
          size={24} 
          color={Colors.white} 
        />
        {isSelected && (
          <View style={styles.selectedIndicator} />
        )}
      </View>
      
      {/* Callout on tap */}
      <Callout>
        <View style={styles.callout}>
          <Text style={styles.storeName}>{store.storeName}</Text>
          <Text style={styles.distance}>
            {formatDistance(store.distance)} away
          </Text>
        </View>
      </Callout>
    </Marker>
  );
}
```

---

### **Store Bottom Sheet** (`src/components/customer/StoreBottomSheet.tsx`)

**Library:** `@gorhom/bottom-sheet`

```bash
npm install @gorhom/bottom-sheet
```

```typescript
interface StoreBottomSheetProps {
  store: Store | null;
  distance: number;
  onViewStore: (storeId: string) => void;
  onClose: () => void;
}

export function StoreBottomSheet({
  store,
  distance,
  onViewStore,
  onClose
}: StoreBottomSheetProps) {
  if (!store) return null;

  return (
    <BottomSheet
      index={0}
      snapPoints={['30%', '60%']}
      onClose={onClose}
    >
      <View style={styles.content}>
        {/* Store name */}
        <Text style={styles.storeName}>{store.storeName}</Text>
        
        {/* Rating */}
        <View style={styles.rating}>
          <Text>⭐ {store.averageRating.toFixed(1)}</Text>
          <Text>({store.reviewCount} reviews)</Text>
        </View>
        
        {/* Distance & Status */}
        <View style={styles.info}>
          <Text>📍 {formatDistance(distance)} away</Text>
          <Text style={store.isOpen ? styles.open : styles.closed}>
            {store.isOpen ? '• Open Now' : '• Closed'}
          </Text>
        </View>
        
        {/* Operating hours */}
        {!store.isOpen && (
          <Text style={styles.opensAt}>
            Opens at {store.operatingHours.open}
          </Text>
        )}
        
        {/* Featured products preview */}
        <View style={styles.products}>
          {store.featuredProducts.slice(0, 3).map(product => (
            <Image 
              key={product.id}
              source={{ uri: product.image }}
              style={styles.productImage}
            />
          ))}
        </View>
        
        {/* Actions */}
        <TouchableOpacity
          style={styles.viewButton}
          onPress={() => onViewStore(store.id)}
        >
          <Text style={styles.buttonText}>View Store →</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.directionsButton}
          onPress={() => openInMaps(store.location.coordinates)}
        >
          <Text>Get Directions</Text>
        </TouchableOpacity>
      </View>
    </BottomSheet>
  );
}
```

---

### **Main Map Screen** (`app/(main)/(customer)/store-map.tsx`)

```typescript
export default function StoreMapScreen() {
  // Hooks
  const {
    stores,
    loading,
    userLocation,
    filterRadius,
    setFilterRadius
  } = useNearbyStores();
  
  // State
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');
  
  // Map ref
  const mapRef = useRef<MapView>(null);
  
  // Handlers
  const handleMarkerPress = (store: Store) => {
    setSelectedStore(store);
    // Center map on selected store
    mapRef.current?.animateToRegion({
      ...store.location.coordinates,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01
    });
  };
  
  const handleViewStore = (storeId: string) => {
    router.push(`/(customer)/store/${storeId}`);
  };
  
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <MaterialIcons name="arrow-back" size={24} />
        </TouchableOpacity>
        <Text style={styles.title}>Find Stores Nearby</Text>
        <TouchableOpacity onPress={() => setShowFilters(true)}>
          <MaterialIcons name="tune" size={24} />
        </TouchableOpacity>
      </View>
      
      {/* View Toggle */}
      <View style={styles.toggleContainer}>
        <TouchableOpacity
          style={[styles.toggleButton, viewMode === 'map' && styles.active]}
          onPress={() => setViewMode('map')}
        >
          <MaterialIcons name="map" size={20} />
          <Text>Map</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.toggleButton, viewMode === 'list' && styles.active]}
          onPress={() => setViewMode('list')}
        >
          <MaterialIcons name="list" size={20} />
          <Text>List</Text>
        </TouchableOpacity>
      </View>
      
      {/* Map View */}
      {viewMode === 'map' && (
        <MapView
          ref={mapRef}
          style={styles.map}
          initialRegion={{
            ...userLocation || DEFAULT_LOCATION,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05
          }}
          showsUserLocation={true}
          showsMyLocationButton={false}
        >
          {/* Store Markers */}
          {stores.map(store => (
            <StoreMarker
              key={store.id}
              store={store}
              onPress={handleMarkerPress}
              isSelected={selectedStore?.id === store.id}
            />
          ))}
        </MapView>
      )}
      
      {/* List View */}
      {viewMode === 'list' && (
        <StoreListView
          stores={stores}
          onStorePress={handleViewStore}
        />
      )}
      
      {/* Current Location Button */}
      <TouchableOpacity
        style={styles.locationButton}
        onPress={() => {
          if (userLocation) {
            mapRef.current?.animateToRegion({
              ...userLocation,
              latitudeDelta: 0.05,
              longitudeDelta: 0.05
            });
          }
        }}
      >
        <MaterialIcons name="my-location" size={24} color={Colors.primary} />
      </TouchableOpacity>
      
      {/* Bottom Sheet */}
      {selectedStore && (
        <StoreBottomSheet
          store={selectedStore}
          distance={selectedStore.distance}
          onViewStore={handleViewStore}
          onClose={() => setSelectedStore(null)}
        />
      )}
      
      {/* Filter Modal */}
      {showFilters && (
        <FilterModal
          radius={filterRadius}
          onRadiusChange={setFilterRadius}
          onClose={() => setShowFilters(false)}
        />
      )}
    </View>
  );
}
```

---

## **🗄️ Firebase Queries**

### **Get Verified Stores in City**

```typescript
export async function getVerifiedStores(city: string): Promise<Store[]> {
  const storesRef = collection(firestore, 'storeOwners');
  
  const q = query(
    storesRef,
    where('verificationStatus', '==', 'verified'),
    where('location.city', '==', city),
    where('isOpen', '==', true)  // Optional: only open stores
  );
  
  const snapshot = await getDocs(q);
  
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as Store[];
}
```

### **Real-time Store Updates**

```typescript
export function subscribeToNearbyStores(
  city: string,
  callback: (stores: Store[]) => void
): Unsubscribe {
  const storesRef = collection(firestore, 'storeOwners');
  
  const q = query(
    storesRef,
    where('verificationStatus', '==', 'verified'),
    where('location.city', '==', city)
  );
  
  return onSnapshot(q, (snapshot) => {
    const stores = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Store[];
    
    callback(stores);
  });
}
```

---

## **🎨 Visual Design Specifications**

### **Store Marker Styles**

**Open Store (Green):**
```typescript
{
  backgroundColor: Colors.primary,  // #3BB77E
  width: 40,
  height: 40,
  borderRadius: 20,
  justifyContent: 'center',
  alignItems: 'center',
  borderWidth: 3,
  borderColor: Colors.white,
  shadowColor: 'rgba(0, 0, 0, 0.25)',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 1,
  shadowRadius: 4,
  elevation: 4
}
```

**Closed Store (Gray):**
```typescript
{
  backgroundColor: Colors.darkGray,  // #666666
  // ... same styling
}
```

### **User Location Marker:**
- Blue pulsing dot (built-in with `showsUserLocation`)
- Accuracy circle (light blue, transparent)

### **Bottom Sheet:**
```typescript
{
  backgroundColor: Colors.white,
  borderTopLeftRadius: 20,
  borderTopRightRadius: 20,
  padding: 20,
  shadowColor: 'rgba(0, 0, 0, 0.15)',
  shadowOffset: { width: 0, height: -2 },
  shadowOpacity: 1,
  shadowRadius: 8,
  elevation: 5
}
```

---

## **📱 Navigation Integration**

### **Add to Customer Home Screen**

```tsx
{/* Find Stores Button */}
<TouchableOpacity
  style={styles.findStoresButton}
  onPress={() => router.push('/(customer)/store-map')}
>
  <MaterialIcons name="map" size={24} color={Colors.white} />
  <Text style={styles.buttonText}>Find Stores on Map</Text>
</TouchableOpacity>
```

### **Add to Navigation Menu**

```tsx
{
  title: 'Stores Near Me',
  icon: 'map',
  route: '/(customer)/store-map',
  badge: nearbyStoresCount
}
```

---

## **⚡ Performance Optimizations**

### **1. Marker Clustering (Optional)**

For many stores (20+):

```bash
npm install react-native-maps-super-cluster
```

```typescript
<MapView>
  <ClusteredMarker
    data={stores}
    renderMarker={(store) => (
      <StoreMarker store={store} onPress={handleMarkerPress} />
    )}
    renderCluster={(cluster) => (
      <ClusterMarker count={cluster.pointCount} />
    )}
  />
</MapView>
```

### **2. Debounce Map Movements**

```typescript
import { useDebouncedCallback } from 'use-debounce';

const handleRegionChange = useDebouncedCallback((region) => {
  // Update visible stores
}, 300);
```

### **3. Image Optimization**

- Use compressed marker icons (< 10KB)
- Cache store images
- Lazy load product images in bottom sheet

---

## **🧪 Testing Checklist**

### **Feature 1: Store Registration Map**

- [ ] Map loads correctly
- [ ] Pin stays centered
- [ ] Current location button works
- [ ] Address updates on drag
- [ ] Geocoding is accurate
- [ ] Location saves to Firebase
- [ ] Works without GPS (manual fallback)
- [ ] Permission handling works
- [ ] Error messages display correctly

### **Feature 2: Customer Map View**

- [ ] Map displays all stores
- [ ] User location shows correctly
- [ ] Distance calculations accurate
- [ ] Markers tap-able
- [ ] Bottom sheet appears
- [ ] Filter by distance works
- [ ] Open/closed status correct
- [ ] Navigate to store profile works
- [ ] Performance smooth with 20+ stores

---

## **📦 Implementation Order**

### **Week 1: Setup & Feature 1**
- Day 1-2: Install dependencies, get API key, create dev build
- Day 3-4: Implement store registration map
- Day 5: Test and fix bugs

### **Week 2: Feature 2**
- Day 1-2: Implement customer map view
- Day 3: Add filters and bottom sheet
- Day 4: Testing and optimization
- Day 5: Polish and documentation

---

## **🎯 Success Criteria**

### **Feature 1 Complete:**
- ✅ Store owners can set location on map
- ✅ Location saved with coordinates & address
- ✅ Geocoding works reliably
- ✅ GPS detection functional
- ✅ UI smooth and intuitive

### **Feature 2 Complete:**
- ✅ All stores display on map
- ✅ Distances calculated accurately
- ✅ Filters work (distance, open/closed)
- ✅ Tap markers shows store info
- ✅ Navigate to store profile works
- ✅ Performance acceptable (< 2s load)

---

## **📚 Additional Resources**

**Documentation:**
- [React Native Maps](https://github.com/react-native-maps/react-native-maps)
- [Expo Location](https://docs.expo.dev/versions/latest/sdk/location/)
- [Geolib](https://github.com/manuelbieh/geolib)
- [Google Maps Platform](https://developers.google.com/maps)

**Tutorials:**
- [Implementing Maps in React Native](https://reactnative.dev/docs/maps)
- [Geocoding with Google APIs](https://developers.google.com/maps/documentation/geocoding/start)

---

**Total Estimated Time:** 1-2 weeks for both features

**Ready to implement when you give the command!** 🚀

---

**Last Updated:** January 10, 2025  
**Status:** Documentation Complete - Awaiting Implementation
