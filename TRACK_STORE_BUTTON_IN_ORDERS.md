# 📍 Track Store Button - Added to Customer Orders

## Feature Added

**Track Store button** now appears in each order card's expanded section, allowing customers to quickly navigate to the map tracking screen.

---

## Implementation Details

### Location
**File:** `app/(main)/(customer)/orders.tsx`

### Changes Made

#### 1. Added Ionicons Import
```typescript
import { Ionicons } from '@expo/vector-icons';
```

#### 2. Added Track Store Button in Expanded Content
**Lines:** 427-438

```typescript
{/* Track Store Button */}
<TouchableOpacity
  style={styles.trackStoreButton}
  onPress={() => router.push(`/(main)/(customer)/track-store?orderId=${order.id}`)}
  activeOpacity={0.8}
>
  <Ionicons name="location" size={20} color="#FFFFFF" style={styles.trackStoreIcon} />
  <Text style={styles.trackStoreText}>Track Store</Text>
</TouchableOpacity>
```

#### 3. Added Button Styles
**Lines:** 867-892

```typescript
trackStoreButton: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: Colors.primary, // #02545F (teal)
  borderRadius: s(12),
  paddingVertical: vs(12),
  paddingHorizontal: s(20),
  marginTop: vs(15),
  marginBottom: vs(10),
  shadowColor: Colors.shadow,
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.15,
  shadowRadius: 4,
  elevation: 3,
},
trackStoreIcon: {
  marginRight: s(8),
},
trackStoreText: {
  fontSize: ms(15),
  fontFamily: Fonts.primary,
  fontWeight: '600',
  color: Colors.white,
},
```

---

## How It Works

### User Flow

1. **Customer Opens Orders Screen:**
   - See list of all orders
   - Each order card shows: Order ID, date, items count, total

2. **Expand Order Card:**
   - Tap dropdown arrow on order card
   - Card expands to show order progress timeline

3. **Track Store Button Appears:**
   - Button appears below the timeline
   - Shows location icon + "Track Store" text
   - Primary color (teal) with shadow

4. **Navigate to Tracking:**
   - Tap "Track Store" button
   - Navigate to `track-store.tsx` with `orderId` parameter
   - Map screen loads with order details

---

## Visual Design

### Button Appearance
```
┌─────────────────────────────────────┐
│                                     │
│   [Order Progress Timeline]         │
│                                     │
│   ┌───────────────────────────┐    │
│   │  📍  Track Store          │    │ ← NEW BUTTON
│   └───────────────────────────┘    │
│                                     │
└─────────────────────────────────────┘
```

### Button Specs
- **Width:** Full width with 20px horizontal padding
- **Height:** 44px (comfortable tap target)
- **Background:** Primary teal (#02545F)
- **Icon:** White location pin (Ionicons)
- **Text:** White, 15px, semi-bold
- **Spacing:** 15px top margin, 10px bottom margin
- **Shadow:** Subtle elevation for depth

---

## Navigation

### Route
```typescript
router.push(`/(main)/(customer)/track-store?orderId=${order.id}`)
```

### Parameters Passed
- `orderId`: The Firebase order ID (e.g., `-Oe8TE5MO...`)

### Track Store Screen Receives
The `track-store.tsx` screen receives the `orderId` via `useLocalSearchParams()` and:
1. Fetches order details from Firebase
2. Gets store location
3. Gets customer location
4. Displays map with both markers
5. Shows order status timeline
6. Provides navigation buttons

---

## Benefits

### For Customers
✅ **Quick Access:** One tap from orders to tracking
✅ **Context Preserved:** Already on order they're viewing
✅ **Visual Clarity:** Location icon makes purpose obvious
✅ **Consistent UX:** Matches other primary actions

### For App
✅ **Engagement:** Encourages customers to track orders
✅ **Reduces Support:** Customers can self-service tracking
✅ **Professional:** Matches modern delivery app patterns

---

## Testing Checklist

### Visual Testing
- ⬜ Button appears when order card expanded
- ⬜ Button has correct colors (teal background, white text)
- ⬜ Location icon displays correctly
- ⬜ Button has shadow/elevation
- ⬜ Button aligns properly (centered)

### Functional Testing
- ⬜ Tap button navigates to track-store screen
- ⬜ Correct orderId passed in URL
- ⬜ Track-store screen loads order data
- ⬜ Map displays with customer + store markers
- ⬜ Order status shows correctly

### Edge Cases
- ⬜ Works for all order statuses (pending, preparing, ready, picked_up)
- ⬜ Works with mock orders (test mode)
- ⬜ Works with real orders from Firebase
- ⬜ Button disabled/hidden if orderId invalid? (Not implemented - always shows)

---

## Future Enhancements

### Conditional Display
Could hide button if:
- Order is cancelled
- Order is picked up (completed)
- Store doesn't have location data

**Example:**
```typescript
{/* Only show Track Store for active orders */}
{['pending', 'preparing', 'ready'].includes(order.status) && (
  <TouchableOpacity style={styles.trackStoreButton} ...>
    ...
  </TouchableOpacity>
)}
```

### Alternative Icon Options
- `map-outline` - Map icon
- `navigate` - Compass icon
- `location-outline` - Outline version
- `pin` - Pin icon

---

## Related Files

### Primary Files
- `app/(main)/(customer)/orders.tsx` - Order list with Track Store button
- `app/(main)/(customer)/track-store.tsx` - Map tracking screen

### Related Features
- `app/(main)/(customer)/order-details.tsx` - Individual order view
- `src/components/ui/OrderCompleteModal.tsx` - Has Track Store button after payment
- `src/models/Order.ts` - Order type definitions

---

## Comparison: Track Store Buttons Across App

| Screen | Button Location | Context |
|--------|----------------|---------|
| **Payment (modal)** | OrderCompleteModal after payment | Just placed order |
| **Orders List** | Expanded order card | ⭐ NEW - Reviewing past orders |
| **Order Details** | Bottom of screen | Viewing specific order |

All three navigate to the same `track-store.tsx` screen with `orderId` parameter.

---

## Code Summary

**Lines Changed:** 3 sections
1. Import Ionicons (line 38)
2. Add button component (lines 427-438)
3. Add button styles (lines 867-892)

**Total Lines Added:** ~30 lines

**Dependencies:**
- `@expo/vector-icons` (already installed)
- `expo-router` (already used)
- Existing styles system (Colors, Fonts, responsive)

---

**Added:** 2025-01-16  
**Status:** ✅ Complete and ready for testing  
**Impact:** Improved customer order tracking UX
