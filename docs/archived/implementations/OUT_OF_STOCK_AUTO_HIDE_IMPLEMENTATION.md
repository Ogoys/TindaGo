# Out-of-Stock Product Auto-Hide Implementation

## Overview
Implemented comprehensive automatic status management to hide out-of-stock products from customers while maintaining full visibility for store owners in the Inventory Dashboard.

## What Was Already Working ✅

The system already had automatic status management in the following areas:

### 1. **Walk-in Sales** (`src/api/walkInSales/index.ts`)
- Automatically sets `status: 'out_of_stock'` when quantity reaches 0
- Sets `status: 'available'` when quantity > 0

### 2. **Customer Orders** (`app/(main)/(customer)/payment.tsx`)
- Deducts stock after payment confirmation
- Automatically sets `status: 'out_of_stock'` when quantity reaches 0
- Works for both Xendit payments and Cash on Pickup

### 3. **Damage Records** (`src/api/damages/index.ts`)
- Deducts damaged items from inventory
- Automatically sets `status: 'out_of_stock'` when quantity reaches 0

### 4. **Returns** (`src/api/returns/index.ts`)
- Restores sellable items to inventory
- Automatically sets `status: 'available'` when items are returned

### 5. **Purchase Orders** (`src/api/purchaseOrders/index.ts`)
- Adds stock when purchase order is marked as received
- Automatically sets `status: 'available'` when stock is received

### 6. **Customer-facing APIs** (`src/api/products/index.ts`)
All product fetching functions already filter out out-of-stock products:
- `fetchProductsByStore()` - filters by `status === 'available' && quantity > 0`
- `fetchProductsByCategory()` - filters by `status === 'available'`
- `fetchBestSellingProducts()` - filters by `status === 'available'`
- `fetchPopularPicks()` - filters by `status === 'available'`
- `searchProducts()` - filters by `status === 'available'`
- `fetchAllProducts()` - filters by `status === 'available'`

## What Was Fixed 🔧

### 1. **Edit Product Screen** (`app/(main)/(store-owner)/inventory/edit-product.tsx`)
**Issue:** When store owners manually edited a product and changed quantity to 0, the status field was not updated.

**Fix:** Added automatic status determination based on quantity:
```typescript
// Automatically set status based on quantity
const productStatus = formattedQuantity === 0 ? 'out_of_stock' : 'available';

const updateData = {
  // ... other fields
  status: productStatus, // Automatically set based on quantity
  updatedAt: new Date().toISOString(),
};
```

### 2. **Stock Adjustment Functions** (`app/(main)/(store-owner)/inventory/store-product.tsx`)
**Issue:** When store owners adjusted stock using the +/- buttons or manual input, the status was not updated.

**Fix:** Updated both `handleStockAdjustment` and `handleSetStock` functions:

```typescript
// Adjust stock quantity
const handleStockAdjustment = async (adjustment: number) => {
  if (!selectedProduct) return;

  const newQuantity = Math.max(0, selectedProduct.quantity + adjustment);
  const newStatus = newQuantity === 0 ? 'out_of_stock' : 'available';

  try {
    const productRef = ref(database, `products/${selectedProduct.id}`);
    await update(productRef, { 
      quantity: newQuantity,
      status: newStatus,
      updatedAt: new Date().toISOString()
    });
    console.log(`Product stock updated to ${newQuantity}, status: ${newStatus}`);
  } catch (error) {
    console.error('Error updating stock:', error);
    Alert.alert('Error', 'Failed to update stock. Please try again.');
  }
};

// Set stock quantity directly
const handleSetStock = async () => {
  // ... validation code

  const newStatus = newQuantity === 0 ? 'out_of_stock' : 'available';

  try {
    const productRef = ref(database, `products/${selectedProduct.id}`);
    await update(productRef, { 
      quantity: newQuantity,
      status: newStatus,
      updatedAt: new Date().toISOString()
    });
    // ... rest of code
  }
};
```

### 3. **Profile Store Product Screen** (`app/(main)/(store-owner)/profile/store-product.tsx`)
**Issue:** Same as above - the profile version also had stock adjustment functions without status updates.

**Fix:** Applied the same fixes to both `handleStockAdjustment` and `handleSetStock` functions in the profile version.

## How It Works

### Status Management Logic
```typescript
status = quantity === 0 ? 'out_of_stock' : 'available'
```

- When `quantity = 0` → `status = 'out_of_stock'` → Hidden from customers
- When `quantity > 0` → `status = 'available'` → Visible to customers

### Customer View Filtering
All customer-facing product queries filter products using:
```typescript
products.filter(p => p.status === 'available')
```

This ensures:
- ✅ Customers only see available products
- ✅ Out-of-stock products are automatically hidden
- ✅ Store owners can still see all products in Inventory Dashboard

### Store Owner View
Store owners maintain full visibility:
- Inventory Dashboard shows all products including out-of-stock
- Products with `quantity = 0` are clearly marked as "OUT OF STOCK"
- Color-coded indicators:
  - 🔴 Red = Out of stock (quantity = 0)
  - 🟠 Orange = Low stock (quantity < 10)
  - 🟢 Green = In stock (quantity ≥ 10)

## Files Modified

1. `app/(main)/(store-owner)/inventory/edit-product.tsx`
   - Added automatic status management to product updates

2. `app/(main)/(store-owner)/inventory/store-product.tsx`
   - Added status updates to `handleStockAdjustment()`
   - Added status updates to `handleSetStock()`

3. `app/(main)/(store-owner)/profile/store-product.tsx`
   - Added status updates to `handleStockAdjustment()`
   - Added status updates to `handleSetStock()`

4. `app/(main)/(customer)/home.tsx`
   - Added quantity check (quantity === 0) to product filter for legacy data protection

5. `app/(main)/shared/product-details.tsx`
   - Added out-of-stock guard to prevent customers from viewing unavailable products
   - Store owners can still view all products

## Testing Checklist

### Store Owner Tests
- [ ] Edit a product and set quantity to 0 → Check status becomes 'out_of_stock'
- [ ] Edit a product and set quantity > 0 → Check status becomes 'available'
- [ ] Use +/- buttons to adjust stock to 0 → Check status updates
- [ ] Use "Set exact quantity" input to set to 0 → Check status updates
- [ ] Record a walk-in sale that depletes stock → Check status updates
- [ ] Record damaged goods that depletes stock → Check status updates
- [ ] Mark purchase order as received → Check status becomes 'available'

### Customer Tests
- [ ] Browse products → Confirm out-of-stock products are hidden
- [ ] Search for products → Confirm out-of-stock products don't appear
- [ ] View store details → Confirm out-of-stock products aren't shown
- [ ] Browse by category → Confirm out-of-stock products are filtered out
- [ ] View "Best Selling" section → Confirm only available products shown
- [ ] View "Popular Picks" section → Confirm only available products shown

### Integration Tests
- [ ] Complete a purchase that depletes stock → Product disappears from customer view
- [ ] Store owner restocks → Product reappears in customer view
- [ ] Store owner marks product as out-of-stock manually → Hidden from customers
- [ ] Store owner marks product as available manually → Visible to customers

## Benefits

### For Customers
- ✅ Clean shopping experience - no frustration trying to order unavailable items
- ✅ All visible products are available for purchase
- ✅ No need to manually check stock availability

### For Store Owners
- ✅ Automatic inventory management - no manual status updates needed
- ✅ Full visibility of all products including out-of-stock items
- ✅ Clear visual indicators of stock levels
- ✅ Simplified workflow - just manage quantities, status updates automatically

## Technical Notes

### Product Model
The Product model (`src/models/Product.ts`) defines:
```typescript
export interface Product {
  // ... other fields
  stock: number;
  status: 'available' | 'out_of_stock';
}
```

### Firebase Structure
Products are stored at `/products/{productId}` with the following relevant fields:
```json
{
  "quantity": 0,
  "status": "out_of_stock",
  "updatedAt": "2025-01-17T06:40:00.000Z"
}
```

### Real-time Updates
- Status changes are immediately persisted to Firebase
- `updatedAt` timestamp is updated on every stock/status change
- Customer views automatically refresh to reflect current availability

## Future Enhancements

Potential improvements for future iterations:

1. **Low Stock Warnings**: Send notifications when products reach low stock threshold
2. **Restock Reminders**: Automatic reminders for frequently out-of-stock items
3. **Pre-orders**: Allow customers to pre-order out-of-stock items
4. **Stock Reservation**: Reserve stock for pending orders to prevent overselling
5. **Batch Status Updates**: Bulk status management for multiple products
6. **Stock History**: Track stock level changes over time for analytics

## Handling Legacy Data

### The Problem
Existing products in the database may have `quantity = 0` but `status = 'available'` because the automatic status management wasn't in place when they were created or last updated.

### The Solution
**Option 1: Enhanced Client-Side Filtering (Implemented)**
```typescript
// app/(main)/(customer)/home.tsx line 226-232
if (product.status !== 'available') return false;
if (product.quantity === 0) return false; // Extra check for legacy data
```

This double-checks both status AND quantity to ensure zero-stock products never show to customers, even if their status field wasn't updated.

**Option 2: One-Time Database Fix (Optional)**
Run the included script `scripts/fix-product-status.js` to update all existing products:
1. Configure your Firebase Admin SDK credentials
2. Run: `node scripts/fix-product-status.js`
3. The script will find and fix all products with mismatched status/quantity

**Recommendation**: Use Option 1 (already implemented) for immediate protection, then optionally run Option 2 to clean up the database for better performance and data consistency.

## Conclusion

The implementation is now complete and robust. Products automatically become invisible to customers when they run out of stock, while store owners maintain full control and visibility through the Inventory Dashboard. All manual and automatic inventory adjustments properly update the product status, ensuring data consistency across the entire platform.

**Key Protections:**
- ✅ All future inventory changes automatically update status
- ✅ Double-filtering protects against legacy data inconsistencies  
- ✅ Product details page blocks customer access to out-of-stock items
- ✅ Store owners retain full visibility for inventory management
