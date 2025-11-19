# HOTFIX: Out-of-Stock Products Still Visible

## Issue
"Coco Mama" product with `quantity = 0` was still showing on customer home screen.

## Root Cause
Existing products in Firebase have:
- `quantity: 0`
- `status: 'available'` ❌ (should be `'out_of_stock'`)

The home screen was only checking `status !== 'available'`, so these legacy products with mismatched data were still showing.

## Fix Applied

### 1. Enhanced Home Screen Filter
**File:** `app/(main)/(customer)/home.tsx` (Line ~231)

Added quantity check to handle legacy data:
```typescript
if (product.status !== 'available') return false;
if (product.quantity === 0) return false; // NEW: Extra protection
```

### 2. Product Details Guard
**File:** `app/(main)/shared/product-details.tsx` (Line ~127-142)

Added check to prevent customers from viewing out-of-stock product details:
```typescript
const isCustomer = !user || user.role !== 'store-owner';
const isOutOfStock = productData.status === 'out_of_stock' || productData.quantity === 0;

if (isCustomer && isOutOfStock) {
  Alert.alert('Product Unavailable', 'This product is currently out of stock...');
  router.back();
  return;
}
```

## Result
✅ Out-of-stock products are now hidden from customers in:
- Home screen "Available at Store" section
- Home screen "Best Selling" section  
- Product details page (redirects back)
- All other product lists (already had filtering)

✅ Store owners can still see all products in Inventory Dashboard

## Testing
1. **As Customer**: 
   - Out-of-stock products should not appear on home screen
   - Attempting to view out-of-stock product details should show alert and go back
   
2. **As Store Owner**:
   - Can still see all products in Inventory Dashboard
   - Out-of-stock products clearly marked

## Optional: Clean Up Database
To fix the underlying data, run:
```bash
node scripts/fix-product-status.js
```

This will update all products with `quantity = 0` to have `status = 'out_of_stock'`.

**Note:** The app will work correctly with or without running this script due to the double-filtering protection.

## Files Changed
1. `app/(main)/(customer)/home.tsx` - Added quantity filter
2. `app/(main)/shared/product-details.tsx` - Added access guard
3. `scripts/fix-product-status.js` - Created cleanup script (optional)

## Prevention
All future inventory changes will automatically set the correct status:
- Edit product screen ✅
- Stock adjustment (+/- buttons) ✅  
- Walk-in sales ✅
- Customer orders ✅
- Damage records ✅
- Returns ✅
- Purchase orders ✅

See `OUT_OF_STOCK_AUTO_HIDE_IMPLEMENTATION.md` for full documentation.
