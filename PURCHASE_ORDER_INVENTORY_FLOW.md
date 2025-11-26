# Purchase Order Inventory Flow Documentation

## Overview
This document explains how purchase orders work in relation to inventory management and the recent payment icon consistency updates.

## Current Flow (Working Correctly ✅)

### 1. Purchase Order Creation (Pending Status)
**File**: `app/(main)/(store-owner)/profile/purchase-payment.tsx`
- When user creates a purchase order and proceeds to checkout
- Calls `createPurchaseOrder()` in `src/api/purchaseOrders/index.ts`
- Creates record in `purchase_orders` table with status: `"pending"`
- **DOES NOT** update `products` table
- **DOES NOT** add products to inventory yet

### 2. Purchase Details Screen
**File**: `app/(main)/(store-owner)/profile/purchase-details.tsx`
- Shows purchase order details
- Displays items, supplier info, payment method, status
- Shows "Mark as Delivered" button ONLY when status is `"pending"`
- Uses `PaymentMethodBadge` component for consistent payment icons

### 3. Mark as Delivered (Receives Inventory)
**File**: `src/api/purchaseOrders/index.ts` - `markAsReceived()`
- When user clicks "Mark as Delivered" button
- Updates purchase order status from `"pending"` to `"received"`
- **NOW** updates `products` table
- Adds purchased quantities to existing product quantities
- Sets product status to `"available"`
- Updates `costPrice`, `lastRestocked`, and `updatedAt` fields

### 4. Inventory Dashboard & Store Product
**Files**: 
- `app/(main)/(store-owner)/inventory/index.tsx`
- `app/(main)/(store-owner)/inventory/store-product.tsx`

- These screens read from `products` table ONLY
- Products ONLY appear after purchase order is marked as "received/delivered"
- Pending purchase orders do NOT affect inventory counts

## Key Points ✅

1. **Pending Purchase Orders** = Products NOT in inventory
2. **Delivered/Received Purchase Orders** = Products ADDED to inventory
3. Products appear in Store Product & Inventory Dashboard ONLY after delivery

## Payment Icon Consistency Update

### Problem
`purchase-invoice.tsx` was using custom inline payment badge logic instead of the shared `PaymentMethodBadge` component.

### Solution
Updated `purchase-invoice.tsx` to use `PaymentMethodBadge` component for consistency.

### Files Using PaymentMethodBadge
1. ✅ `purchase-details.tsx` - Already using it
2. ✅ `purchase-invoice.tsx` - Updated to use it
3. ✅ `PaymentMethodBadge.tsx` - Shared component

### Payment Method Icons Location
`src/assets/images/store-owner-purchase-payment/`
- `gcash-icon.png` - GCash logo
- `paymaya-icon.png` - PayMaya logo
- `debt-icon.png` - Debt/loan icon
- Cash - Uses green circle with ₱ symbol (no image file)

## Changes Made

### `purchase-invoice.tsx`
**Before**: Custom inline payment badge with hard-coded styles and emojis
```typescript
{(() => {
  const method = paymentMethodParam || purchaseOrder.paymentMethod;
  let bgColor = '#E8F5E9';
  let textColor = '#4CAF50';
  let displayText = '💵 CASH';
  // ... more custom logic
})()}
```

**After**: Using shared PaymentMethodBadge component
```typescript
<PaymentMethodBadge
  method={paymentMethodParam || purchaseOrder.paymentMethod || 'cash'}
  size="medium"
  showText={true}
/>
```

## Testing Checklist

### Inventory Flow
- [ ] Create a purchase order with status "pending"
- [ ] Verify products do NOT appear in Store Product screen
- [ ] Verify products do NOT appear in Inventory Dashboard
- [ ] Mark purchase order as "Delivered"
- [ ] Verify products NOW appear in Store Product screen
- [ ] Verify products NOW appear in Inventory Dashboard
- [ ] Verify product quantities increased correctly

### Payment Icons
- [ ] Create purchase order with Cash payment
- [ ] View purchase details - verify payment icon shows green circle with ₱
- [ ] View purchase invoice - verify payment icon shows green circle with ₱
- [ ] Create purchase order with GCash payment
- [ ] View purchase details - verify GCash logo appears
- [ ] View purchase invoice - verify GCash logo appears
- [ ] Create purchase order with PayMaya payment
- [ ] View purchase details - verify PayMaya logo appears
- [ ] View purchase invoice - verify PayMaya logo appears
- [ ] Create purchase order with Debt payment
- [ ] View purchase details - verify Debt icon appears
- [ ] View purchase invoice - verify Debt icon appears

## Code Flow Diagram

```
┌─────────────────────────────────────────┐
│  Purchase Payment Screen                │
│  (purchase-payment.tsx)                 │
│                                         │
│  - Select payment method                │
│  - Preview invoice                      │
│  - Click "Proceed to Checkout"          │
└──────────────────┬──────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────┐
│  createPurchaseOrder()                  │
│  (src/api/purchaseOrders/index.ts)     │
│                                         │
│  - Creates purchase_orders record       │
│  - Status: "pending"                    │
│  - Does NOT update products table       │
└──────────────────┬──────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────┐
│  Purchase Details Screen                │
│  (purchase-details.tsx)                 │
│                                         │
│  - Shows order details                  │
│  - Payment method badge (icons)         │
│  - "Mark as Delivered" button           │
└──────────────────┬──────────────────────┘
                   │
                   │ (User clicks "Mark as Delivered")
                   ▼
┌─────────────────────────────────────────┐
│  markAsReceived()                       │
│  (src/api/purchaseOrders/index.ts)     │
│                                         │
│  - Updates purchase_orders status       │
│  - Status: "received"                   │
│  - NOW updates products table           │
│  - Adds quantities to inventory         │
└──────────────────┬──────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────┐
│  Products NOW visible in:               │
│                                         │
│  - Store Product Screen                 │
│  - Inventory Dashboard                  │
│  - All inventory-related views          │
└─────────────────────────────────────────┘
```

## Related Files

### Purchase Order Management
- `src/api/purchaseOrders/index.ts` - API functions
- `src/models/PurchaseOrder.ts` - TypeScript models
- `app/(main)/(store-owner)/profile/purchase-payment.tsx` - Payment selection
- `app/(main)/(store-owner)/profile/purchase-details.tsx` - Order details
- `app/(main)/(store-owner)/profile/purchase-invoice.tsx` - Invoice view

### Inventory Management
- `app/(main)/(store-owner)/inventory/index.tsx` - Inventory dashboard
- `app/(main)/(store-owner)/inventory/store-product.tsx` - Product list

### Shared Components
- `src/components/common/PaymentMethodBadge.tsx` - Payment method display

## Summary

The purchase order inventory flow is working correctly:
1. ✅ Pending orders do NOT affect inventory
2. ✅ Only delivered/received orders add to inventory
3. ✅ Payment icons now consistent across all screens
4. ✅ Uses shared `PaymentMethodBadge` component

No changes were needed to the inventory logic - it already works as intended!
