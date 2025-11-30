# Debt Payment Status Webhook Fix

## Problem
When customers pay their debt through GCash/PayMaya via Xendit, the payment goes through successfully, but the debt status remains "pending" in:
- Customer's debt history
- Store owner's debt records

This happens because the Xendit webhook was only updating `paymentStatus` to 'PAID' but not updating the debt-specific fields (`debtStatus` and `debtPaidDate`).

## Root Cause
In the webhook handler (`tindago-admin/src/app/api/webhooks/xendit/route.ts`), when processing successful payments:

**Before:**
```typescript
// Only updated these fields:
orderUpdates = {
  paymentStatus: 'PAID',
  paymentMethod: 'gcash' or 'paymaya',
  updatedAt: timestamp
}
```

**Issue:** For debt orders, it needed to also update:
- `debtStatus` → 'paid'
- `debtPaidDate` → current timestamp

## Solution Applied

Updated the webhook handler to check if an order is a debt payment and update the debt fields accordingly:

```typescript
if (orderId) {
  const orderRef = ref(database, `orders/${orderId}`);
  const snap = await get(orderRef);
  if (snap.exists()) {
    const existingOrder = snap.val();
    
    // ✅ If this is a debt payment order and payment is successful, update debt status
    if ((existingOrder.isDebtPayment || existingOrder.debtStatus) && 
        (status === 'PAID' || status === 'SETTLED')) {
      orderUpdates.debtStatus = 'paid';
      orderUpdates.debtPaidDate = new Date().toISOString();
      console.log(`[💳 Debt Payment] Marking debt as paid for order ${orderId}`);
    }
    
    await update(orderRef, orderUpdates);
  }
}
```

This logic was added to **all three paths** in the webhook handler:
1. Primary path: When `orderId` is available
2. Fallback path: When only `orderNumber` is available
3. Query path: When using Firebase query to find the order

## What Changed

### Files Modified
- `tindago-admin/src/app/api/webhooks/xendit/route.ts`
  - Lines 233-255: Added debt status update for orderId path
  - Lines 256-269: Added debt status update for orderNumber path
  - Lines 271-290: Added debt status update for query fallback path

## How It Works Now

### Payment Flow
1. Customer views debt history → selects a debt order → clicks "Proceed to Pay"
2. Payment screen loads with debt settlement mode
3. Customer selects GCash or PayMaya
4. System creates Xendit invoice with existing order ID
5. Customer completes payment in Xendit
6. Xendit webhook fires with payment status 'PAID'
7. **Webhook now updates:**
   - `paymentStatus` → 'PAID' ✅
   - `paymentMethod` → 'gcash' or 'paymaya' ✅
   - `debtStatus` → 'paid' ✅ **NEW**
   - `debtPaidDate` → ISO timestamp ✅ **NEW**
   - `updatedAt` → ISO timestamp ✅
8. Customer sees "Paid" badge in debt history ✅
9. Store owner sees "Paid" status in debt records ✅

## Testing Instructions

### 1. Restart Admin Server (Required)
The admin server must be restarted to load the updated webhook handler:

```powershell
# Stop any running admin server
Get-Process -Name node | Where-Object { $_.Path -like "*tindago-admin*" } | Stop-Process -Force

# Start admin server
cd C:\CapsProj\tindago-admin
npm run dev
```

### 2. Test Debt Payment with GCash/PayMaya

**Steps:**
1. Create a debt order:
   - Customer: Add items to cart → Checkout → Select "Debt (Pay Later)"
   - Set a due date → Confirm order
   - Order created with `debtStatus: 'pending'`

2. Pay the debt:
   - Customer: Profile → Debt History → Select the debt order
   - Click "Proceed to Pay" button
   - Select GCash or PayMaya
   - Complete payment in Xendit

3. Verify the fix:
   - **Before Xendit payment:**
     - Firebase: `paymentStatus: 'pending'`, `debtStatus: 'pending'`
   - **After Xendit payment:**
     - Firebase: `paymentStatus: 'PAID'`, `debtStatus: 'paid'`, `debtPaidDate: [timestamp]`
   - **In debt history (customer side):**
     - Status badge shows "Paid" (green) ✅
   - **In debt records (store owner side):**
     - Status shows "Paid" (green) ✅

### 3. Check Firebase Database

Navigate to Firebase Console → Realtime Database → `orders/[orderId]`

**Expected fields after payment:**
```json
{
  "paymentStatus": "PAID",
  "paymentMethod": "gcash",
  "debtStatus": "paid",
  "debtPaidDate": "2025-11-30T09:35:00.000Z",
  "updatedAt": "2025-11-30T09:35:00.000Z"
}
```

### 4. Check Webhook Logs

In the admin server console, you should see:
```
[Webhook] Processing invoice: inv_xxx status: PAID orderNumber: ORD-2024-xxx
[💳 Debt Payment] Marking debt as paid for order -Nxxxxxx
[✅ Order] Updated payment status to 'PAID' for order -Nxxxxxx
```

## Related Files

### Mobile App (TindaGo)
- `app/(main)/(customer)/profile/debt-history.tsx` - Shows list of debt orders
- `app/(main)/(customer)/profile/debt-details.tsx` - Shows debt details and "Proceed to Pay" button
- `app/(main)/(customer)/payment.tsx` - Handles payment processing (lines 469-553)
- `app/(main)/(store-owner)/profile/debt-records.tsx` - Store owner's debt records view
- `src/models/Order.ts` - Order model with debt fields

### Admin Server (tindago-admin)
- `src/app/api/webhooks/xendit/route.ts` - Webhook handler (FIXED)
- `src/lib/xenditService.ts` - Creates Xendit invoices

### Documentation
- `DEBT_PAYMENT_IMPROVEMENTS.md` - General debt payment documentation
- `docs/archived/fixes/XENDIT_REDIRECT_AND_PAYMENT_STATUS_FIXES.md` - Previous payment fixes

## Additional Notes

### Why This Issue Happened
- The webhook was originally designed for regular orders (not debt orders)
- Debt payment feature was added later, but webhook wasn't updated
- Client-side listener in `payment.tsx` tried to update `debtStatus`, but there was a race condition
- If webhook processed first, it only updated `paymentStatus`, leaving `debtStatus` as 'pending'

### Client-Side Fallback
The mobile app still has a client-side listener (payment.tsx lines 520-541) that also updates `debtStatus`. This serves as a backup in case:
- The webhook fails or is delayed
- Network issues prevent webhook delivery
- User is actively watching the payment screen

### Redundancy is Good
Both the webhook and client-side listener now update `debtStatus`, which is actually beneficial because:
- Webhook is the primary source of truth (server-side)
- Client-side provides immediate feedback to the user
- If one fails, the other serves as a backup
- Firebase will handle the duplicate update gracefully (last write wins)

## Troubleshooting

### Issue: Debt status still shows "pending" after payment
**Check:**
1. Is admin server running with the updated code?
   ```powershell
   # Check if server is running
   Get-Process -Name node | Where-Object { $_.Path -like "*tindago-admin*" }
   ```
2. Check admin server console for webhook logs
3. Check Firebase order document for `debtStatus` field
4. Verify Xendit webhook is configured correctly with the callback token

### Issue: Payment succeeds but no webhook received
**Check:**
1. Xendit webhook URL is configured: `https://your-domain.com/api/webhooks/xendit`
2. Webhook callback token matches environment variable `XENDIT_WEBHOOK_TOKEN`
3. Admin server is accessible from the internet (if testing with real Xendit)
4. Check Xendit dashboard → Webhooks section for delivery status

### Issue: Webhook receives but doesn't update
**Check admin server logs for:**
- "Token mismatch" error → Fix XENDIT_WEBHOOK_TOKEN
- "Order not found" warning → Check order ID in metadata
- Permission errors → Check Firebase security rules

## Impact

**Before Fix:**
- ❌ Debt status stuck at "pending" after successful payment
- ❌ Confusing for customers (they paid but it shows unpaid)
- ❌ Store owners can't track which debts are actually paid

**After Fix:**
- ✅ Debt status correctly updates to "paid" after successful payment
- ✅ Customers see accurate payment status in debt history
- ✅ Store owners have accurate debt records
- ✅ Consistent data between payment status and debt status

---

**Fixed:** November 30, 2025  
**Tested:** Pending  
**Status:** ✅ Ready for testing
