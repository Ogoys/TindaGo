# Store Details & Home Page Updates

## Overview
Updated the customer home page to show real-time location and enhanced store details page with map integration, ProductCard components, and improved navigation.

---

## 1. Customer Home Page - Real Location Display

### File: `app/(main)/(customer)/home.tsx`

**Changes:**
- Added `expo-location` import for GPS tracking
- Added `userAddress` state to store customer's current location
- Implemented `useEffect` to get user's location on mount:
  - Checks location permission
  - Gets current GPS coordinates
  - Uses reverse geocoding to convert coordinates to readable address
  - Formats as "Street, City" or "District, City"
- Updated location text (line 694) to display `{userAddress}` instead of hardcoded "Jacinto st. Davao City"
- Fixed store card navigation from `/(main)/(customer)/store-details` to `/(main)/shared/store-details`

**Location States:**
- ✅ "Main St, Davao City" - If street available
- ✅ "Poblacion, Davao City" - If district available
- ✅ "Davao City" - Fallback
- ℹ️ "Getting location..." - Loading state
- ⚠️ "Location permission needed" - Permission denied

---

## 2. Store Details Page - Complete Redesign

### File: `app/(main)/shared/store-details.tsx`

**Major Changes:**

### A. Navigation Support
- Now accepts both `id` and `storeId` URL parameters
- Works with routes:
  - `/(main)/shared/store-details?id={storeId}` (original)
  - `/(main)/shared/store-details?storeId={storeId}` (new - from featured stores)

### B. Store Location Map Integration
- Added `react-native-maps` import for MapView
- Shows store's exact location on an embedded map (200px height)
- Map features:
  - Pinned marker at store coordinates
  - Store name and address in marker popup
  - "Get Directions" button overlay
  - Disabled scroll/zoom/rotate for preview mode
  - Clicking "Get Directions" shows confirmation dialog
- Only displays if store has `location.coordinates` data
- Map positioned between store info and products section

**Map Data Source:**
```typescript
store.location?.coordinates?.latitude
store.location?.coordinates?.longitude
```

### C. Product Cards - 3 Column Grid Layout
- **Replaced** custom product cards with `ProductCard` component
- Changed from 2-column (185px cards) to **3-column layout** (120px cards)
- Benefits:
  - Consistent design with home page
  - Better space utilization
  - More products visible without scrolling
  - Built-in loading states
  - Synchronized styling across app

**Product Grid:**
```typescript
productsGrid: {
  flexDirection: 'row',
  flexWrap: 'wrap',
  justifyContent: 'space-between',
  gap: s(10),
}
```

### D. Cart Integration
- Added `useUser()` hook for user context
- Added `addToCartWithValidation` import
- Implemented full cart validation flow:
  - Sign-in check
  - Stock availability check
  - Single-store cart validation
  - Confirmation dialog for store switching
  - Success/error alerts
- Added `addingProductId` state for loading indicators

**Add to Cart Flow:**
1. Check if user signed in → redirect to signin
2. Check stock availability → show out of stock alert
3. Validate cart store → show confirmation if different store
4. Add to cart → show success message
5. Reset loading state

### E. Updated Imports
```typescript
import MapView, { PROVIDER_GOOGLE, Marker } from 'react-native-maps';
import { ProductCard } from '../../../src/components/ui';
import { useUser } from '../../../src/contexts/UserContext';
import { addToCartWithValidation } from '../../../src/api/cart';
```

### F. Store Interface Extended
```typescript
interface Store {
  // ... existing fields
  location?: {
    address?: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
}
```

---

## 3. Navigation Flow

### Feature Stores → Store Details
```
Home Page (Featured Stores Section)
  ↓ (Click Store Card)
  router.push(`/(main)/shared/store-details?storeId=${store.id}`)
  ↓
Store Details Page
  - Display store info
  - Show store location on map
  - List products in 3-column grid
```

### Store Details → Product Details
```
Store Details (Product Card)
  ↓ (Click Product)
  router.push(`/(main)/shared/product-details?id=${product.id}`)
  ↓
Product Details Page
```

---

## 4. User Experience Improvements

### Home Page
✅ **Real-time location tracking** - Shows customer's actual address
✅ **Automatic updates** - Location updates on app launch
✅ **Permission handling** - Clear messaging if permission denied
✅ **Fallback states** - Graceful degradation if location unavailable

### Store Details
✅ **Visual map** - See exactly where store is located
✅ **Directions button** - Quick access to navigation
✅ **3-column grid** - More products visible (9 vs 6 per screen)
✅ **Consistent cards** - Same ProductCard as home page
✅ **Cart validation** - Prevents mixed-store carts
✅ **Loading states** - Visual feedback for add-to-cart actions
✅ **Responsive** - Works on all screen sizes with scaling

---

## 5. Technical Details

### Location Accuracy
- Uses `Location.Accuracy.Balanced` for good performance/accuracy trade-off
- Reverse geocoding provides human-readable addresses
- Handles permission requests gracefully
- Falls back to "Location unavailable" on errors

### Map Configuration
- Provider: Google Maps (`PROVIDER_GOOGLE`)
- Initial zoom: 0.005 delta (very close zoom, ~500m view)
- Static preview mode (no user interaction)
- Marker shows store name and address on tap

### Product Grid Responsiveness
- Gap: 10px between cards
- Cards: 120px width × 222px height
- Auto-wraps to 3 columns on standard 440px baseline
- Responsive scaling with `s()` and `vs()` functions

---

## 6. Testing Checklist

### Home Page
- [ ] Location permission granted → shows actual address
- [ ] Location permission denied → shows "Location permission needed"
- [ ] GPS unavailable → shows "Location unavailable"
- [ ] Address format correct (Street, City or District, City)
- [ ] Click featured store → navigates to store details

### Store Details
- [ ] Navigation from featured stores works (`storeId` param)
- [ ] Navigation from other screens works (`id` param)
- [ ] Map displays if store has coordinates
- [ ] Map hidden if store has no coordinates
- [ ] Marker shows store name and address
- [ ] "Get Directions" button shows confirmation
- [ ] Products display in 3-column grid
- [ ] ProductCard matches home page styling
- [ ] Add to cart validates single-store rule
- [ ] Loading indicator shows during add-to-cart
- [ ] Stock validation works (out of stock alert)
- [ ] Sign-in redirect works for guest users

---

## 7. Files Modified

1. **app/(main)/(customer)/home.tsx**
   - Added location tracking
   - Fixed store card navigation route

2. **app/(main)/shared/store-details.tsx**
   - Added map integration
   - Replaced product cards with ProductCard component
   - Added cart validation
   - Implemented 3-column grid
   - Fixed navigation parameter handling

---

## 8. Dependencies

Existing dependencies (no new installations needed):
- ✅ `expo-location` - GPS and reverse geocoding
- ✅ `react-native-maps` - Map display
- ✅ `@/components/ui/ProductCard` - Consistent product cards
- ✅ `@/api/cart/addToCartWithValidation` - Cart validation

---

## 9. Future Enhancements

### Potential Improvements:
1. **Linking Integration** - Actually open Google Maps/Apple Maps for directions
2. **Distance Display** - Show distance from customer to store
3. **Store Hours** - Display opening/closing times
4. **Live Updates** - Real-time product availability
5. **Store Rating** - Show actual customer ratings instead of hardcoded 5.0
6. **Favorite Stores** - Allow customers to save favorite stores
7. **Store Search** - Filter products within store
8. **Category Filter** - Filter store products by category

---

## Summary

This update provides a much better user experience:
- **Customers see their real location** on the home page
- **Store locations are visualized** on an embedded map
- **Products are displayed consistently** using the same ProductCard component
- **3-column layout** shows more products at once
- **Cart validation** prevents errors from mixed-store orders
- **Navigation works seamlessly** between featured stores and store details

The changes maintain backward compatibility while adding significant new features for better customer engagement and easier store discovery.
