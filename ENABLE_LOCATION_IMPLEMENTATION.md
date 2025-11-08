# Enable Location Screen - Implementation Guide

## Overview
The Enable Location screen is displayed after a customer signs in, prompting them to grant location permissions for nearby store discovery.

## File Location
- **Screen**: `app/(auth)/enable-location.tsx`
- **Images**: `src/assets/images/enable-location/`

## Figma Design
- **Link**: https://www.figma.com/design/8I1Nr3vQZllDDknSevstvH/TindaGo-Share?node-id=1196-2259&m=dev
- **Node ID**: 1196-2259

## Features

### 1. **Location Permission Request**
- Uses `expo-location` to request foreground location permissions
- Handles both iOS and Android permission flows
- Provides fallback to Settings if permission is denied

### 2. **User Actions**
- **Enable Location**: Requests permission and navigates to home on success
- **Skip for Now**: Allows user to proceed without location (can enable later)

### 3. **UI Components**
- Hero illustration (location/map graphic)
- Title: "Enable Your Location"
- Descriptive text explaining why location is needed
- Location pin icon with circular background
- Two action buttons (primary and secondary)

## Layout Structure

```
┌─────────────────────────────┐
│                             │
│    [Location Illustration]  │  ← Hero image
│                             │
│   Enable Your Location      │  ← Title (28px, bold)
│                             │
│   Description text about    │  ← Description (16px)
│   why location is needed    │
│                             │
│        ┌─────┐              │
│        │ 📍  │              │  ← Location pin icon
│        └─────┘              │     (120x120 circle)
│                             │
├─────────────────────────────┤
│  [Enable Location Button]   │  ← Primary (green)
│  [Skip for Now Button]      │  ← Secondary (outline)
└─────────────────────────────┘
```

## Styling Details

### Colors
- **Background**: White (#FFFFFF)
- **Primary Button**: TindaGo Green (#3BB77E)
- **Text**: Dark Gray (#1E1E1E)
- **Icon Circle Background**: rgba(59, 183, 126, 0.1) - light green

### Typography
- **Title**: Clash Grotesk 700, 28px
- **Description**: Clash Grotesk 400, 16px
- **Button Text**: Clash Grotesk 600, 18px (primary), 16px (secondary)

### Spacing
- **Content Padding**: 40px horizontal
- **Illustration**: 300x250px
- **Icon Circle**: 120x120px
- **Button Height**: 56px
- **Button Gap**: 16px

### Shadows
- **Enable Button**: 
  - Color: rgba(59, 183, 126, 0.3)
  - Offset: (0, 4)
  - Radius: 12
  - Elevation: 6 (Android)

## Navigation Flow

```
Customer Sign In
      ↓
Enable Location Screen ← YOU ARE HERE
      ↓
   [Allow]     [Skip]
      ↓           ↓
   Get Location  |
      ↓           ↓
Customer Home Screen
```

## Integration Steps

### 1. Update Customer Sign-In Flow

In your customer sign-in file (e.g., `app/(auth)/(customer)/signin.tsx`), update navigation:

```typescript
// After successful customer login
router.replace('/(auth)/enable-location');
```

### 2. Required Dependencies

Ensure `expo-location` is installed:

```bash
npx expo install expo-location
```

### 3. Add Images

Export from Figma and place in `src/assets/images/enable-location/`:
- `location-illustration.png` (900x750px @ 3x)
- `location-pin.png` (180x180px @ 3x)

See `src/assets/images/enable-location/README.md` for detailed export instructions.

### 4. iOS Configuration

Add to `app.json` or `app.config.js`:

```json
{
  "expo": {
    "ios": {
      "infoPlist": {
        "NSLocationWhenInUseUsageDescription": "TindaGo needs your location to show nearby stores and provide better shopping experience."
      }
    }
  }
}
```

### 5. Android Configuration

Add to `app.json` or `app.config.js`:

```json
{
  "expo": {
    "android": {
      "permissions": [
        "ACCESS_COARSE_LOCATION",
        "ACCESS_FINE_LOCATION"
      ]
    }
  }
}
```

## Code Explanation

### Permission Request Flow

```typescript
const handleEnableLocation = async () => {
  // 1. Request permission
  const { status } = await Location.requestForegroundPermissionsAsync();
  
  // 2. If granted, get location and navigate
  if (status === 'granted') {
    const location = await Location.getCurrentPositionAsync({});
    router.replace('/(main)/(customer)/home');
  }
  
  // 3. If denied, show alert with option to open settings
  else {
    Alert.alert('Permission Denied', 'You can enable it later...');
  }
};
```

### Skip Functionality

```typescript
const handleSkip = () => {
  // Navigate without requesting permission
  // Location can be enabled later from settings
  router.replace('/(main)/(customer)/home');
};
```

## Testing Checklist

- [ ] Screen displays correctly on iOS
- [ ] Screen displays correctly on Android
- [ ] Location permission dialog appears when "Enable Location" is tapped
- [ ] App navigates to home when permission is granted
- [ ] Alert shows when permission is denied
- [ ] "Skip for Now" button navigates to home without permission request
- [ ] Images load correctly (illustration and icon)
- [ ] Button states work (loading, disabled)
- [ ] Text is readable and properly aligned
- [ ] Spacing matches Figma design

## Temporary Solution (If Images Not Ready)

If you need to test before images are exported, replace the Image components with Ionicons:

```typescript
// Replace location-illustration
import { Ionicons } from '@expo/vector-icons';

<Ionicons name="location" size={200} color={Colors.primary} />

// Replace location-pin
<Ionicons name="location-sharp" size={60} color={Colors.primary} />
```

## Related Files
- Customer Sign-In: `app/(auth)/(customer)/signin.tsx`
- Customer Home: `app/(main)/(customer)/home.tsx`
- Location Service: (to be created) `src/services/location.ts`

## Future Enhancements
1. Save location permission status to AsyncStorage
2. Add ability to re-enable location from customer settings
3. Show location accuracy indicator
4. Add loading animation while getting location
5. Handle location errors (GPS disabled, timeout, etc.)
