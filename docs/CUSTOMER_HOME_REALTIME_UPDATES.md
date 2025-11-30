# Customer Home Page - Real-Time Updates

## Overview

The customer home page now uses **Firebase real-time listeners** to automatically update when stores add products, receive reviews, or make changes. No manual refresh needed!

## What Updates Automatically

### 1. **"Available at [Store Name]" Section** 
**Location:** Lines 860-900 in `home.tsx`

When a customer selects a store, this section shows products from that specific store.

**Updates automatically when:**
- ✅ Store owner adds new products
- ✅ Store owner removes products
- ✅ Store owner updates product info (price, quantity, etc.)
- ✅ Products go out of stock

**How it works:**
```typescript
const selectedStoreProducts = React.useMemo(() => {
  if (!selectedStoreId) return [] as Product[];
  return allProducts.filter(p => p.storeId === selectedStoreId).slice(0, 12);
}, [allProducts, selectedStoreId]);
```

When `allProducts` updates (from real-time listener), this automatically recalculates to show the latest products from the selected store.

### 2. **"Featured Stores Near You" Section**
**Location:** Lines 990-1015 in `home.tsx`

Shows store cards with:
- Store name and logo
- Rating (⭐ 4.5)
- Review count (e.g., "23 reviews")
- Product count (e.g., "45 products")

**Updates automatically when:**
- ✅ Store receives new reviews → Rating and review count update
- ✅ Store adds new products → Product count increases
- ✅ Store removes products → Product count decreases
- ✅ Store updates info (logo, name, etc.)

**How it works:**
```typescript
const StoreCard = ({ store }: { store: Store }) => {
  // Product count recalculates when allProducts changes
  const productCount = allProducts.filter(p => p.storeId === store.id).length;
  
  // Rating and reviews come from store data (auto-updated)
  return (
    <View>
      <Text>{store.rating.toFixed(1)}</Text>
      <Text>({store.totalReviews} reviews)</Text>
      <Text>• {productCount} products</Text>
    </View>
  );
};
```

### 3. **Other Sections**

All product sections also update in real-time:
- ✅ **Best Selling** - Shows newest products first
- ✅ **Most Popular Picks** - Diverse products from different categories
- ✅ **Fresh Finds** - Recently updated products

## How Real-Time Listeners Work

### Firebase Listeners Setup

**File:** `app/(main)/(customer)/home.tsx` (Lines 215-325)

```typescript
useEffect(() => {
  // Products listener - updates when ANY product changes
  const productsRef = ref(database, 'products');
  const productsUnsubscribe = onValue(productsRef, (snapshot) => {
    // Filter and process products
    setAllProducts(productsList);
  });
  
  // Stores listener - updates when ANY store changes
  const storesRef = ref(database, 'stores');
  const storesUnsubscribe = onValue(storesRef, (snapshot) => {
    // Filter and process stores
    setAllStores(storesList);
  });
  
  // Cleanup listeners on unmount
  return () => {
    off(productsRef, 'value', productsUnsubscribe);
    off(storesRef, 'value', storesUnsubscribe);
  };
}, []);
```

### When Store Adds Products

1. **Store Owner:** Adds product via store owner app
2. **Firebase:** Product added to `products/{productId}`
3. **Real-Time Listener:** Detects change immediately
4. **Customer Home:** Updates automatically:
   - Selected store products section shows new product
   - Featured stores show increased product count
   - Best Selling section may show new product
5. **Result:** Customer sees new product **instantly** ✨

### When Store Gets Reviews

1. **Customer:** Submits review via review screen
2. **Review API:** Calls `addStoreReview()` which:
   - Adds review to `reviews/{reviewId}`
   - Calls `updateStoreRating(storeId)` which updates:
     - `stores/{storeId}/rating` → New average rating
     - `stores/{storeId}/totalReviews` → Incremented count
3. **Real-Time Listener:** Detects store document change
4. **Customer Home:** Updates store card:
   - ⭐ Rating updates (e.g., 4.3 → 4.5)
   - Review count increases (e.g., "23 reviews" → "24 reviews")
5. **Result:** Rating visible to all customers **immediately** ⭐

## Data Flow Diagram

```
┌─────────────────────────────────────────────────────────┐
│                     FIREBASE DATABASE                    │
│                                                          │
│  products/                    stores/                    │
│  ├─ {productId}              ├─ {storeId}               │
│  │  ├─ productName           │  ├─ storeName            │
│  │  ├─ price                 │  ├─ rating ⭐            │
│  │  ├─ quantity              │  ├─ totalReviews         │
│  │  └─ storeId               │  └─ logo                 │
│                                                          │
└───────────────┬────────────────────────┬─────────────────┘
                │                        │
                │ Real-time listeners    │
                │ (onValue)              │
                ▼                        ▼
         ┌──────────────┐      ┌──────────────┐
         │  allProducts │      │  allStores   │
         │    state     │      │    state     │
         └──────┬───────┘      └──────┬───────┘
                │                     │
                │    Auto-updates     │
                ▼                     ▼
    ┌─────────────────────────────────────┐
    │                                      │
    │  Selected Store Products             │
    │  (filters allProducts by storeId)    │
    │                                      │
    │  Featured Stores                     │
    │  (shows rating, reviews, products)   │
    │                                      │
    │  Best Selling / Popular / Fresh      │
    │  (shows from allProducts)            │
    │                                      │
    └──────────────────────────────────────┘
```

## Performance & Optimization

### Filtered Listening
The listeners only load **active, available products** from **open stores**:

```typescript
.filter(product => {
  if (product.status !== 'available') return false;
  if (product.storeIsOpen === false) return false;
  if (product.quantity === 0) return false;
  return true;
})
```

This keeps data lean and performance fast.

### Automatic Cleanup
Listeners are automatically cleaned up when the component unmounts to prevent memory leaks:

```typescript
return () => {
  off(productsRef, 'value', productsUnsubscribe);
  off(storesRef, 'value', storesUnsubscribe);
};
```

### Memoized Calculations
Product filtering and store calculations use `React.useMemo` to prevent unnecessary re-renders:

```typescript
const selectedStoreProducts = React.useMemo(() => {
  return allProducts.filter(p => p.storeId === selectedStoreId).slice(0, 12);
}, [allProducts, selectedStoreId]);
```

## Testing Real-Time Updates

### Test 1: New Product Addition

1. **As Store Owner:**
   - Open store owner app
   - Add a new product (e.g., "Fresh Mango")
   - Save product

2. **As Customer (on different device):**
   - Open customer home page
   - Select that store
   - **Result:** New product appears in "Available at [Store Name]" section immediately
   - **Result:** Product count increases in Featured Stores section

### Test 2: Review Addition

1. **As Customer:**
   - Complete an order from a store
   - Submit a 5-star review with comment
   - Submit review

2. **As Another Customer (on different device):**
   - View customer home page
   - Check the store card in "Featured Stores Near You"
   - **Result:** Rating updates (e.g., 4.3 → 4.5)
   - **Result:** Review count increases (e.g., "10 reviews" → "11 reviews")

### Test 3: Product Stock Change

1. **As Store Owner:**
   - Edit a product
   - Set quantity to 0 (out of stock)
   - Save

2. **As Customer:**
   - Refresh or wait a moment
   - **Result:** Product disappears from all sections (automatically filtered out)

## Manual Refresh Still Available

Pull-to-refresh is still available for users who want to:
- Force a UI refresh
- Get immediate feedback that data is loading

The manual refresh now just shows a loading indicator - the real-time listeners handle the actual data updates.

## Comparison: Before vs After

### Before (One-Time Load)
```
❌ Data loaded once on page mount
❌ Needed manual refresh to see new products
❌ Review counts outdated
❌ Product counts outdated
❌ No way to know when store adds products
```

### After (Real-Time Listeners)
```
✅ Data updates automatically in real-time
✅ New products appear instantly
✅ Review counts always current
✅ Product counts always accurate
✅ Customer sees changes as they happen
```

## Benefits for Users

### For Customers
- ✨ Always see the latest products
- ⭐ Accurate, up-to-date store ratings
- 🔄 No manual refresh needed
- ⚡ Instant updates when stores change

### For Store Owners
- 📦 Products visible to customers immediately after adding
- ⏱️ No delay between adding product and customer seeing it
- 📈 Review counts update in real-time for social proof

## Related Files

- `/app/(main)/(customer)/home.tsx` - Customer home page with real-time listeners
- `/src/api/reviews/index.ts` - Review API that updates store ratings
- `/app/(main)/(store-owner)/products/add-product.tsx` - Store owner adds products
- `/app/(main)/(customer)/review.tsx` - Customer submits reviews

## Future Enhancements

Potential additions:
- 🔔 Push notifications when favorite store adds products
- 🎯 Personalized product recommendations based on purchase history
- 📊 "New this week" badge for recently added products
- 🔥 "Trending" indicator for products with rapid view/purchase increases

---

**Last Updated:** November 30, 2024
**Status:** ✅ Implemented and Tested
