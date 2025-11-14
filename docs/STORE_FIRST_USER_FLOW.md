# Store-First User Flow & Store Switching Behavior

## Complete Implementation Guide

This document explains the complete "store-first" user experience in TindaGo, including how users select stores, what happens when they view products from other stores, and how store switching works throughout the app.

---

## 🎯 Core Philosophy

**TindaGo is a store-first grocery app**: Customers pick a nearby sari-sari store and shop from its inventory. This personalizes their experience and ensures efficient pickup from ONE store per order.

---

## 📱 Complete User Journey

### 1. **First Launch (New User)**

#### A. User logs in
- User completes authentication (sign up or sign in)
- System checks: Does user have a role selected?
  - ❌ No → redirect to `/role-selection`
  - ✅ Yes (customer) → **Continue to B**

#### B. Router Guard Checks Selected Store
**Location**: `app/(main)/_layout.tsx` lines 28-36

```typescript
if (user.role === 'customer') {
  const selected = await getSelectedStoreId();
  if (selected) {
    router.replace('/(main)/(customer)/home');  // Has store → Home
  } else {
    router.replace('/(main)/(customer)/stores-map');  // No store → Map
  }
}
```

**Result**: User without selected store is redirected to **Stores Map**

#### C. Location Permission Request
**Location**: `stores-map.tsx` lines 99-156

- App requests location permission
- If **Granted** → User location shown on map
- If **Denied** → Alert with option to open Settings
  - User can still browse map but won't see distances

#### D. Nearest Store Suggestion Modal
**Location**: `stores-map.tsx` lines 223-253

When stores load and user has NO selected store:

```
┌─────────────────────────────────────┐
│  Shop at nearest store?             │
│                                     │
│  Sari-Sari ni Aling Rosa            │
│  0.45 km away · Open now            │
│                                     │
│  [See others]    [Shop here]        │
└─────────────────────────────────────┘
```

**User choices**:
1. **"Shop here"** → Store saved, redirect to personalized Home
2. **"See others"** → Browse map freely

**Technical**: 
- Modal shows only once per session (`hasSuggestedNearest.current` flag)
- Suggests nearest **open** store with valid distance
- Only shows if `selectedStoreId` is null

---

### 2. **Browsing Stores Map**

Users can:
- **View all stores** with logo markers
- **Apply distance filters**: 1km, 3km, 5km, All
- **Tap marker** → Info card appears showing:
  - Store name and status (Open/Closed)
  - Address and distance
  - Action buttons

#### Info Card Actions:
```
┌─────────────────────────────────────┐
│  [Store Logo]  Sari-Sari ni Rosa   │
│                Open now              │
│                123 Main St           │
│                📍 0.45 km away       │
│                                     │
│  [Show Route]  [Navigate]           │
│  [View Products] [Set as My Store]  │
└─────────────────────────────────────┘
```

**Buttons**:
- **Show Route** → Displays OSRM static route polyline (no live tracking)
- **Navigate** → Opens Google Maps for turn-by-turn navigation
- **View Products** → `/(main)/shared/store-details` (browse without committing)
- **Set as My Store** → **Saves store** and redirects to **Home**

**What "Set as My Store" does**:
```typescript
await setSelectedStoreId(storeId);  // Save to AsyncStorage
Alert.alert('Store selected', `${storeName} set as your store.`);
router.push('/(main)/(customer)/home');  // Navigate to personalized Home
```

---

### 3. **Personalized Home Screen**

Once user has selected a store, Home shows:

#### Header Banner
```
┌─────────────────────────────────────┐
│  Shopping at Sari-Sari ni Rosa  ⓘ  │
│  [Change Store]                     │
└─────────────────────────────────────┘
```

**"Change Store"** button → Opens stores-map again

#### Product Sections (in order):
1. **"Available at [Store Name]"** → Products from selected store ONLY
2. **Best Selling** → Cross-store (recently added products)
3. **Fresh Finds** → Cross-store (recently updated products)
4. **Featured Stores Near You** → Discover other stores

**Why this order?**
- Users see their store's products FIRST (personalized)
- But still have discovery options (cross-store sections)

---

### 4. **Search Results (NEW: Prioritized Ranking)**

**Location**: `app/(main)/(customer)/search.tsx`

When user searches for "banana":

```
┌─────────────────────────────────────┐
│  5 results found                    │
│                                     │
│  ✓ Your Store                       │
│  ┌─────────────────────────────┐   │
│  │  Saba Banana                │   │
│  │  (Sari-Sari ni Rosa)        │   │
│  │  1 kg · ₱50.00              │   │
│  └─────────────────────────────┘   │
│                                     │
│  ─────── Other Stores ───────       │
│  ┌─────────────────────────────┐   │
│  │  Cavendish Banana           │   │
│  │  (Tindahan ni Mang Ben)     │   │
│  │  1 kg · ₱55.00              │   │
│  └─────────────────────────────┘   │
└─────────────────────────────────────┘
```

**How it works**:
1. Search filters all products matching query
2. **Sort logic** (lines 136-149):
   - Selected store products → TOP
   - Other store products → BELOW
   - Within each group: alphabetically by name
3. **Visual indicators**:
   - "✓ Your Store" badge (green) for selected store section
   - "Other Stores" divider line separating sections
   - Store name always shown in subtitle

**Technical**:
```typescript
const sorted = results.sort((a, b) => {
  if (selectedStoreId) {
    const aIsSelected = a.storeId === selectedStoreId;
    const bIsSelected = b.storeId === selectedStoreId;
    
    if (aIsSelected && !bIsSelected) return -1;  // Selected first
    if (!aIsSelected && bIsSelected) return 1;
  }
  
  return a.productName.localeCompare(b.productName);  // Alphabetical
});
```

---

### 5. **Viewing Product from Another Store**

**Scenario**: User is shopping at Store A, but searches for a product and finds it at Store B.

#### What User Sees:
```
Product Details Page
┌─────────────────────────────────────┐
│  Cavendish Banana                   │
│  1 kg · ₱55.00                      │
│                                     │
│  From: Tindahan ni Mang Ben        │  ← Clearly labeled
│  Open now                           │
│                                     │
│  [View Store] [Add to Cart]         │
└─────────────────────────────────────┘
```

#### When User Clicks "Add to Cart":

**Single-Store Cart Validation Kicks In**:
```
┌─────────────────────────────────────┐
│  Switch store?                      │
│                                     │
│  Your cart has items from           │
│  Sari-Sari ni Rosa.                 │
│                                     │
│  Replace with                       │
│  Tindahan ni Mang Ben?              │
│                                     │
│  [Keep current]  [Replace cart]     │
└─────────────────────────────────────┘
```

**User choices**:
1. **"Keep current"** (Cancel)
   - Cart unchanged
   - Product NOT added
   - User stays on product details page
   - Can continue shopping at current store

2. **"Replace cart"** (Destructive action)
   - **Cart cleared completely**
   - Product from Store B added
   - **Selected store NOT changed** (important!)
   - Success alert shown
   - User can continue shopping at Store B

**What gets changed**:
- ✅ Cart contents (cleared, then new item added)
- ✅ Cart metadata (storeId, storeName)
- ❌ **selectedStoreId stays the same** (Home still shows Store A)

**Why selectedStoreId doesn't change?**
- User might just be exploring
- Doesn't permanently commit to new store
- Home personalization remains stable
- User can explicitly "Set as My Store" later if they want

---

### 6. **Store Switching: Three Ways**

#### Method 1: Via "Set as My Store" (Stores Map)
**Result**: 
- ✅ Changes `selectedStoreId`
- ✅ Redirects to Home (now personalized to new store)
- ⚠️ Cart remains unchanged (might cause conflict later)

**Best for**: Deliberately choosing a new favorite store

#### Method 2: Via Cart Replacement (Add to Cart)
**Result**:
- ❌ Does NOT change `selectedStoreId`
- ✅ Clears cart and adds new store items
- ⚠️ Home banner still shows old store

**Best for**: One-time purchases from another store

#### Method 3: Via "Change Store" Button (Home Header)
**Result**:
- Opens stores-map
- User can browse and select new store
- Same as Method 1

**Best for**: Quickly switching favorite store

---

## 🛒 Cart Behavior Deep Dive

### Single-Store Cart Enforcement

**Rule**: Cart can only contain items from ONE store at a time.

**Validation Points** (all screens use `addToCartWithValidation`):
1. ✅ Home screen quick add
2. ✅ Search screen quick add
3. ✅ See More screen quick add
4. ✅ Category Detail screen quick add
5. ✅ Product Details main add
6. ✅ Order History reorder

**API Function**: `addToCartWithValidation(userId, cartItem, forceReplace?)`

```typescript
// Returns:
{
  success: boolean;
  needsConfirmation: boolean;  // true if store conflict detected
  currentStore?: { storeId, storeName };
  newStore?: { storeId, storeName };
}
```

**Flow**:
```
User adds product
    ↓
Check cart storeId
    ↓
┌─────────────────┬───────────────────┐
│ Same store      │ Different store   │
│ OR empty cart   │                   │
│    ↓            │    ↓              │
│ Add directly    │ Return            │
│ Success!        │ needsConfirmation │
│                 │    ↓              │
│                 │ Show Alert        │
│                 │    ↓              │
│                 │ ┌────────────┬────┐
│                 │ │ Cancel     │ OK │
│                 │ │  ↓         │  ↓ │
│                 │ │ Do nothing │ Clear cart │
│                 │ │            │ Add item   │
└─────────────────┴─────────────┴────┴────────┘
```

---

## 🔄 Complete Store Switching Scenarios

### Scenario A: Tourist Exploring Multiple Stores
**Behavior**:
1. User selects Store A initially (nearest)
2. Home shows Store A products
3. User searches for specific product, finds at Store B
4. Adds to cart → Cart switches to Store B
5. **Home banner still shows Store A**
6. User can continue shopping at Store B via search/categories
7. Checkout → Order placed at Store B
8. After order, Home still shows Store A (for next time)

**Why**: One-time purchase doesn't change favorite store

### Scenario B: Customer Permanently Switching Stores
**Behavior**:
1. User currently shops at Store A
2. Discovers Store B has better prices/selection
3. Goes to stores-map → "Set as My Store" on Store B
4. Home now shows Store B products
5. Cart cleared (if had Store A items)
6. All future sessions default to Store B

**Why**: Explicit "Set as My Store" changes personalization

### Scenario C: Reordering Past Order from Different Store
**Behavior**:
1. User currently at Store A
2. Views order history, sees past order from Store B
3. Clicks "Reorder"
4. **Pre-validation** checks cart store
5. If conflict → Alert: "Replace cart with order from Store B?"
6. User confirms → Cart cleared, all items from Store B added
7. **selectedStoreId still Store A** (Home unchanged)
8. User can checkout at Store B

**Why**: Reorder is a deliberate action, but doesn't change default store

---

## 📊 Data Storage

### AsyncStorage
```typescript
// Key: 'selectedStoreId'
// Value: string (store ID) or null

await AsyncStorage.setItem('selectedStoreId', 'store-abc-123');
const id = await AsyncStorage.getItem('selectedStoreId');
```

### Firebase Cart Structure
```json
{
  "carts": {
    "user-xyz-789": {
      "storeId": "store-abc-123",
      "storeName": "Sari-Sari ni Rosa",
      "subtotal": 150.00,
      "total": 150.00,
      "itemCount": 3,
      "updatedAt": "2025-01-14T12:00:00Z",
      "items": {
        "product-1": {
          "productId": "product-1",
          "productName": "Saba Banana",
          "storeId": "store-abc-123",
          "storeName": "Sari-Sari ni Rosa",
          "quantity": 2,
          "price": 50.00,
          "subtotal": 100.00,
          ...
        }
      }
    }
  }
}
```

**Important**: Cart `storeId` is separate from `selectedStoreId`!

---

## 🎨 UX Principles

### Clear Communication
- ✅ Always show which store user is shopping at
- ✅ Store name visible on every product
- ✅ Confirmation dialogs before cart changes
- ✅ Success feedback after actions

### Predictable Behavior
- ✅ Router guard ensures store selection first
- ✅ Single-store cart rule enforced everywhere
- ✅ selectedStoreId persists across sessions
- ✅ Cart validation prevents accidental mixing

### Flexible Discovery
- ✅ Users can browse any store's products
- ✅ Search shows cross-store results
- ✅ Featured stores section on Home
- ✅ Easy to switch stores when needed

### Safe Defaults
- ✅ Nearest open store suggested first
- ✅ Closed stores disabled but visible
- ✅ Cart cleared only with explicit confirmation
- ✅ Default store preserved after one-time purchases

---

## 🧪 Testing Scenarios

### Test 1: First-Time User Flow
1. ✅ New user logs in
2. ✅ Redirected to stores-map (no selected store)
3. ✅ Location permission requested
4. ✅ Nearest store modal appears
5. ✅ User accepts → redirected to Home
6. ✅ Home shows selected store banner

### Test 2: Cross-Store Add to Cart
1. ✅ User at Store A
2. ✅ Search finds product at Store B
3. ✅ Add to cart → Alert appears
4. ✅ User confirms → Cart cleared
5. ✅ Product from Store B added
6. ✅ Home still shows Store A

### Test 3: Search Ranking
1. ✅ User at Store A
2. ✅ Search for "rice"
3. ✅ Results show Store A products first
4. ✅ "Your Store" badge visible
5. ✅ Other stores below divider line

### Test 4: Store Switching
1. ✅ User at Store A
2. ✅ "Change Store" → Opens map
3. ✅ "Set as My Store" on Store B
4. ✅ Home updates to Store B
5. ✅ Cart cleared if had Store A items

### Test 5: Reorder from Different Store
1. ✅ User at Store A
2. ✅ View order from Store B
3. ✅ Click reorder → Alert
4. ✅ Confirm → Cart cleared
5. ✅ All Store B items added
6. ✅ Home still shows Store A

---

## 🚀 Production Readiness

### Implemented ✅
- Router guard for store-first onboarding
- Nearest store modal on first launch
- Search ranking by selected store
- Visual store indicators (badges, dividers)
- Single-store cart validation (all screens)
- Store switching via map
- Cross-store product browsing
- Reorder with validation

### Recommended Next Steps
1. **Crashlytics Integration** - Track Google Maps crashes in production
2. **Analytics Events** - Track store selections, switches, cart conflicts
3. **Cache Layer** - Preload store logos and product images
4. **Offline Mode** - List view fallback if maps fail
5. **User Education** - Onboarding tooltips explaining store-first concept

---

## 📚 Related Documentation
- `docs/CART_VALIDATION_COMPLETE.md` - Cart validation implementation
- `docs/SINGLE_STORE_CART_IMPLEMENTATION.md` - Original cart design
- `src/lib/storage/selectedStore.ts` - Storage helpers
- `src/api/cart/index.ts` - Cart API with validation

---

**Version**: 1.0  
**Last Updated**: January 2025  
**Status**: ✅ Production Ready
