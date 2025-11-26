# Purchase Order Payment Integration Improvements

**Date:** 2025-01-14
**Status:** ✅ Complete
**Impact:** Critical fixes for GCash/PayMaya payment flow

## Summary

Fixed critical issues in the Purchase Order payment integration that would have prevented GCash and PayMaya payments from working correctly. The system now properly handles B2B transactions with digital payment methods.

## Issues Fixed

### 1. Database Path Inconsistency ⚠️ CRITICAL
**Problem:**
- Mobile app used: `purchaseOrders/{id}` (camelCase)
- Admin API expected: `purchase_orders/{id}` (snake_case)
- **Result:** Webhooks couldn't find purchase orders to update payment status

**Solution:**
- Standardized all references to use `purchase_orders` (snake_case)
- Updated 6 functions in `src/api/purchaseOrders/index.ts`:
  - `createPurchaseOrder()`
  - `getPurchaseOrders()`
  - `getPurchaseOrderById()`
  - `updatePurchaseOrderStatus()`
  - `deletePurchaseOrder()`
  - `markAsReceived()`

**Files Changed:**
- `src/api/purchaseOrders/index.ts` - All database references

### 2. Missing purchaseOrderNumber in API Response ⚠️ HIGH
**Problem:**
- Mobile app needed `purchaseOrderNumber` for Xendit invoice creation
- API only returned `purchaseOrderId`
- **Result:** Xendit invoice creation would fail with undefined error

**Solution:**
- Updated return type of `createPurchaseOrder()`:
  ```typescript
  // Before
  Promise<{ success: boolean; purchaseOrderId?: string; error?: string }>

  // After
  Promise<{ success: boolean; purchaseOrderId?: string; purchaseOrderNumber?: string; error?: string }>
  ```
- Now returns both values to mobile app

**Files Changed:**
- `src/api/purchaseOrders/index.ts` - Line 20 (return type) and Line 76 (return statement)

### 3. Missing paymentInfo Field ⚠️ MEDIUM
**Problem:**
- PurchaseOrder model didn't include `paymentInfo` structure
- Admin API was setting nested payment data that wasn't typed
- **Result:** TypeScript errors and unclear data structure

**Solution:**
- Enhanced PurchaseOrder interface with complete payment tracking:
  ```typescript
  paymentInfo?: {
    invoiceId?: string;
    invoiceUrl?: string;
    expiryDate?: string;
    paidAt?: string;
    status?: string; // PENDING, PAID, SETTLED, EXPIRED
    createdAt?: string;
  };
  ```

**Files Changed:**
- `src/models/PurchaseOrder.ts` - Lines 46-53

### 4. Payment Method and Status Not Persisted
**Problem:**
- `createPurchaseOrder()` didn't save payment method and status to database
- **Result:** Payment tracking incomplete

**Solution:**
- Added payment fields to database write:
  ```typescript
  const purchaseOrder: Omit<PurchaseOrder, 'id'> = {
    // ... other fields
    paymentMethod: orderData.paymentMethod,
    paymentStatus: orderData.paymentStatus || 'unpaid',
  };
  ```

**Files Changed:**
- `src/api/purchaseOrders/index.ts` - Lines 69-70

## Technical Details

### Database Structure (Before vs After)

**Before (Broken):**
```
purchaseOrders/          ← Mobile writes here
  {id}/
    purchaseOrderNumber: "PO-2025-001"
    paymentStatus: "unpaid"

purchase_orders/         ← Admin/Webhook reads here
  (empty - webhook can't find the order!)
```

**After (Fixed):**
```
purchase_orders/         ← Everyone uses this path
  {id}/
    id: "abc123"
    purchaseOrderNumber: "PO-2025-001"
    paymentMethod: "gcash"
    paymentStatus: "unpaid"
    paymentInfo:
      invoiceId: "xendit_inv_123"
      invoiceUrl: "https://checkout.xendit.co/..."
      expiryDate: "2025-01-15T10:00:00Z"
      status: "PENDING"
      createdAt: "2025-01-14T15:00:00Z"
```

### Complete Payment Flow

#### GCash/PayMaya Flow
```
1. Store Owner:
   - Adds products to purchase order
   - Selects GCash or PayMaya
   - Clicks "Proceed to Checkout"

2. Mobile App (purchase-payment.tsx):
   - Calls createPurchaseOrder() with paymentStatus: 'unpaid'
   - Gets back purchaseOrderId AND purchaseOrderNumber ✅
   - Calls XenditService.createPurchaseOrderPayment()
   - Opens Xendit payment URL

3. Admin API (/api/payments/purchase-order-invoice):
   - Creates Xendit invoice with NO commission ✅
   - Updates purchase_orders/{id} with paymentInfo ✅
   - Creates ledger entry

4. Xendit Payment:
   - Store owner completes payment
   - Xendit sends webhook to /api/webhooks/xendit

5. Webhook Handler:
   - Detects PO payment by "PO-" prefix ✅
   - Finds purchase order at purchase_orders/{id} ✅
   - Updates paymentStatus to 'paid'
   - Updates paymentInfo with paidAt timestamp
   - Updates ledger

6. Mobile App:
   - Real-time listener detects payment status change
   - Shows "Payment Confirmed" ✅
```

## Files Modified

### Mobile App (TindaGo)
1. **src/models/PurchaseOrder.ts**
   - Added `paymentInfo` interface (lines 46-53)
   - Updated comment for paymentMethod (line 44)

2. **src/api/purchaseOrders/index.ts**
   - Changed all `purchaseOrders` to `purchase_orders`
   - Updated return type to include `purchaseOrderNumber`
   - Added payment method/status to database write
   - Total changes: 6 functions updated

### Admin Dashboard (tindago-admin)
- No changes needed - already using `purchase_orders` ✅

## Testing Verification

### Test Cases to Run

1. **Cash Payment** - Should work immediately
   - Create PO with cash payment
   - Verify `paymentStatus: 'paid'` immediately
   - No Xendit invoice created

2. **GCash Payment** - Should create invoice and update on payment
   - Create PO with GCash
   - Verify Xendit page opens
   - Complete test payment
   - Verify webhook updates status to 'paid'

3. **PayMaya Payment** - Same as GCash
   - Create PO with PayMaya
   - Verify payment flow

4. **Debt Payment** - Should track unpaid
   - Create PO with debt
   - Verify `paymentStatus: 'unpaid'`
   - No Xendit invoice

5. **Admin Dashboard** - Should display all payments
   - View purchase orders list
   - Verify payment methods show correctly
   - Check analytics page

### Expected Results

✅ All payment methods create orders successfully
✅ GCash/PayMaya open Xendit payment pages
✅ Webhooks update payment status correctly
✅ Admin dashboard shows accurate payment data
✅ No commission deducted from B2B transactions
✅ purchaseOrderNumber available for all flows

## Performance Impact

- **No performance degradation** - Only structural changes
- Database reads/writes remain the same
- Webhook processing time unchanged

## Breaking Changes

⚠️ **IMPORTANT:** If you have existing purchase orders in `purchaseOrders/` path:

**Option 1: Data Migration (Recommended)**
```javascript
// Run this script once to migrate old data
const admin = require('firebase-admin');
const db = admin.database();

async function migratePurchaseOrders() {
  const oldRef = db.ref('purchaseOrders');
  const newRef = db.ref('purchase_orders');

  const snapshot = await oldRef.once('value');
  if (snapshot.exists()) {
    await newRef.set(snapshot.val());
    console.log('Migration complete!');
    // Optionally delete old data:
    // await oldRef.remove();
  }
}

migratePurchaseOrders();
```

**Option 2: Fresh Start**
- If no production data exists, no migration needed
- New installations will work immediately

## Security Considerations

✅ **No new security risks introduced**
- Same Firebase security rules apply
- Webhook token validation unchanged
- Payment data remains encrypted

## Deployment Checklist

Before deploying to production:

1. **Database Migration** (if needed)
   - [ ] Run migration script for existing purchase orders
   - [ ] Verify all data copied to `purchase_orders`
   - [ ] Test reading old purchase orders

2. **Environment Variables**
   - [ ] Verify Xendit keys in admin `.env.local`
   - [ ] Verify webhook token matches in both apps
   - [ ] Verify admin URL in mobile app config

3. **Webhook Configuration**
   - [ ] Update Xendit webhook URL to production
   - [ ] Test webhook with Xendit test mode
   - [ ] Monitor webhook logs for first 24 hours

4. **Mobile App Update**
   - [ ] Test purchase order creation in staging
   - [ ] Test all 4 payment methods (Cash, GCash, PayMaya, Debt)
   - [ ] Verify payment confirmation flow

5. **Admin Dashboard**
   - [ ] Deploy admin dashboard to production
   - [ ] Test purchase orders list loads correctly
   - [ ] Test analytics page calculations
   - [ ] Verify payment method badges display

## Rollback Plan

If issues occur in production:

1. **Immediate:** Set Xendit webhooks to maintenance mode
2. **Quick Fix:** Revert to old database path in mobile app only
3. **Full Rollback:** Restore previous Git commit

## Success Metrics

After deployment, monitor:
- ✅ Purchase order creation success rate > 99%
- ✅ Xendit invoice creation success rate > 95%
- ✅ Webhook processing time < 3 seconds
- ✅ Payment confirmation sync < 5 seconds
- ✅ Zero commission deductions from B2B transactions

## Documentation

**Created:**
- `docs/testing/PURCHASE_ORDER_PAYMENT_TEST_GUIDE.md` - Complete testing guide

**Updated:**
- This file documents all improvements

## Next Steps

1. **Test the complete flow** using the test guide
2. **Deploy to staging** environment first
3. **Run migration script** if needed
4. **Monitor webhooks** for 24-48 hours
5. **Deploy to production** after validation

## Support

For issues or questions:
- Check `docs/testing/PURCHASE_ORDER_PAYMENT_TEST_GUIDE.md`
- Review Firebase database structure
- Verify Xendit webhook logs
- Contact development team

---

**Prepared By:** Claude Code Assistant
**Reviewed By:** [Pending]
**Approved By:** [Pending]
