# Order Section Rename: "Pickup" → "Completed"

**Date**: November 19, 2025
**Type**: UI Label Update
**Impact**: Store Owner Screens Only

---

## Summary

Renamed the "Pickup" order filter tab to "Completed" in both the Store Home page and Store Orders page for better clarity and consistency with order lifecycle terminology.

---

## Changes Made

### 1. Store Home Page
**File**: `app/(main)/(store-owner)/home.tsx`

**Before**:
```typescript
const FILTER_TABS: FilterTab[] = [
  { label: 'Pending', status: 'pending' },
  { label: 'Preparing', status: 'preparing' },
  { label: 'Out for Pickup', status: 'ready' },
  { label: 'Pickup', status: 'picked_up' },  // ← OLD
  { label: 'Cancel', status: 'cancelled' },
];
```

**After**:
```typescript
const FILTER_TABS: FilterTab[] = [
  { label: 'Pending', status: 'pending' },
  { label: 'Preparing', status: 'preparing' },
  { label: 'Out for Pickup', status: 'ready' },
  { label: 'Completed', status: 'picked_up' },  // ← NEW
  { label: 'Cancel', status: 'cancelled' },
];
```

### 2. Store Orders Page
**File**: `app/(main)/(store-owner)/orders/index.tsx`

**Changes**:
- Updated `FILTER_TABS` array (same change as above)
- Updated documentation comment from "Pickup" to "Completed"

---

## Rationale

### Why "Completed" is Better Than "Pickup"

1. **More Intuitive**: "Completed" clearly indicates finished orders
2. **Matches Industry Standards**: Most e-commerce platforms use "Completed" for finished orders
3. **Avoids Confusion**: "Pickup" could be confused with "Out for Pickup" (the previous tab)
4. **Better Semantics**: Once an order is picked up, it's essentially completed from the store's perspective
5. **Consistent Terminology**: Aligns with order status lifecycle (pending → preparing → ready → completed)

---

## Technical Details

### Order Status Mapping

| Tab Label         | Backend Status | Description                           |
|-------------------|----------------|---------------------------------------|
| Pending           | `pending`      | Awaiting store confirmation           |
| Preparing         | `preparing`    | Store is preparing the order          |
| Out for Pickup    | `ready`        | Order ready for customer pickup       |
| **Completed**     | `picked_up`    | Customer has picked up the order      |
| Cancel            | `cancelled`    | Order was cancelled                   |

**Note**: The backend database status remains `picked_up` for backward compatibility. Only the UI label changed.

### Impact Analysis

**✅ What Changed**:
- UI label in filter tabs
- User-facing terminology

**❌ What Stayed the Same**:
- Database structure (`status: 'picked_up'`)
- API endpoints
- Order model definitions
- Firebase queries
- Backend logic

**No Breaking Changes**: This is purely a cosmetic UI update.

---

## Order Lifecycle Flow

```
Customer Places Order
         ↓
    [Pending]           ← Store sees order
         ↓
   Store Accepts
         ↓
   [Preparing]          ← Store is preparing items
         ↓
   Store Marks Ready
         ↓
  [Out for Pickup]      ← Customer notified to pickup
         ↓
   Customer Picks Up
         ↓
   [Completed] ✓        ← Order finished (was "Pickup")
```

---

## Testing Checklist

- [x] Verify "Completed" tab appears on Store Home page
- [x] Verify "Completed" tab appears on Store Orders page
- [x] Verify clicking "Completed" tab filters orders with `status: 'picked_up'`
- [x] Verify no breaking changes to database queries
- [x] Verify backward compatibility with existing orders
- [x] Check that tab labels are properly displayed on mobile screens

---

## Files Modified

1. `app/(main)/(store-owner)/home.tsx` (Line 24)
2. `app/(main)/(store-owner)/orders/index.tsx` (Lines 12, 55)

---

## Related Documentation

- `src/models/Order.ts` - Order status type definitions
- `firebase-actual-database-structure.md` - Database schema (orders collection)
- `CLAUDE.md` - Order management system overview

---

## Migration Notes

**For Developers**:
- If you're working on store owner order screens, use "Completed" in UI
- When querying Firebase, continue using `status: 'picked_up'`
- The label change is transparent to backend logic

**For Users**:
- Store owners will see "Completed" instead of "Pickup" in the order filter tabs
- Functionality remains exactly the same
- No action required from store owners

---

## Future Considerations

If we want to align the backend status with the UI label, we could:
1. Rename `picked_up` → `completed` in the database
2. Run a migration script to update existing orders
3. Update all TypeScript interfaces and API endpoints
4. Test thoroughly before deployment

**Recommendation**: Keep `picked_up` status for now to avoid unnecessary migration complexity. The UI label change is sufficient.
