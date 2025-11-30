# Firebase Rules for Debt Payment → Xendit Flow

## Overview
When a customer pays a debt order using GCash/PayMaya through Xendit, the admin API needs to write to multiple Firebase paths.

## Required Permissions

### What Happens During Debt Payment:

1. **Mobile App** → Calls `payment.tsx` with `orderId` param (debt settlement mode)
2. **payment.tsx** → Calls Admin API `/api/payments/invoice`
3. **Admin API** performs these Firebase operations:

| Path | Operation | Why | Permission Needed |
|------|-----------|-----|-------------------|
| `settings/commissions/stores/{storeId}` | READ | Get commission rate | ✅ `.read": true` (root) |
| `settings/platform/commissionRate` | READ | Get default commission | ✅ `.read": true` (root) |
| `orders/{orderId}` | UPDATE | Add `xenditInvoiceId`, `platformCommission`, `storeAmount` | ✅ `.write": true` |
| `ledgers/stores/{storeId}/transactions/{invoiceId}` | WRITE | Create ledger entry | ✅ `.write": true` |
| `indexes/invoice_to_store/{invoiceId}` | WRITE | Map invoice to store | ✅ `.write": true` |
| `indexes/invoice_to_order/{invoiceId}` | WRITE | Map invoice to order | ✅ `.write": true` |

## Current Rules Configuration

```json
{
  "rules": {
    ".read": true,                    // ✅ Allows reading settings, orders, etc.
    
    "orders": {
      ".write": true,                 // ✅ Admin API can update orders with Xendit data
      ".indexOn": ["customerId", "storeId", "storeOwnerId", "status", "paymentStatus"]
    },
    
    "ledgers": {
      ".write": true,                 // ✅ Admin API can write ledger entries
      "stores": {
        "$storeId": {
          "transactions": {
            ".indexOn": ["createdAt", "type"]
          }
        }
      }
    },
    
    "indexes": {
      ".write": true                  // ✅ Admin API can create invoice indexes
    },
    
    "settings": {
      ".write": true                  // ✅ For admin dashboard to update settings
    },
    
    ".write": "auth != null"          // ⚠️ Default: requires auth for other paths
  }
}
```

## Complete Debt Payment Flow

### Step 1: Customer Initiates Payment
```
debt-history.tsx → debt-details.tsx → "Proceed to Pay" button
```

### Step 2: Navigate to Payment Screen
```javascript
router.push({
  pathname: '/(main)/(customer)/payment',
  params: {
    orderId: order.id,              // Triggers debt settlement mode
    amount: order.total.toString(),
    isDebtPayment: 'true',
    storeName: order.storeName
  }
});
```

### Step 3: Payment Screen Loads Debt Order
```javascript
// payment.tsx line 106-140
if (isDebtSettlementMode) {
  const orderRef = ref(database, `orders/${settleOrderIdParam}`);
  const snap = await get(orderRef);  // ✅ Allowed by ".read": true
  setSettlementOrder(snap.val());
}
```

### Step 4: Customer Selects Payment Method
- Only GCash/PayMaya shown (debt/cash hidden in settlement mode)
- Customer clicks "Proceed to Checkout"

### Step 5: Create Xendit Invoice
```javascript
// payment.tsx line 462-544
if (isDebtSettlementMode && (selectedPayment === 'gcash' || selectedPayment === 'paymaya')) {
  // Call admin API
  const paymentResponse = await xenditService.createPayment({
    orderId: ord.id,
    orderNumber: ord.orderNumber,
    amount: ord.total,
    customerEmail: user.email,
    customerName: user.name,
    storeId, storeName,
    items: ord.items,
    paymentMethod: selectedPayment
  });
}
```

### Step 6: Admin API Creates Invoice & Updates Firebase
```javascript
// Admin API: src/app/api/payments/invoice/route.ts

// 1. Read commission rate
const storeRateSnap = await get(ref(database, `settings/commissions/stores/${store.id}`));
// ✅ Allowed by ".read": true

// 2. Create Xendit invoice
const data = await createInvoice({ ... });

// 3. Write ledger entry
await set(ref(database, `ledgers/stores/${store.id}/transactions/${invoiceId}`), { ... });
// ✅ Allowed by "ledgers": { ".write": true }

// 4. Write invoice indexes
await set(ref(database, `indexes/invoice_to_store/${invoiceId}`), { ... });
await set(ref(database, `indexes/invoice_to_order/${invoiceId}`), { ... });
// ✅ Allowed by "indexes": { ".write": true }

// 5. Update order with Xendit data
await update(ref(database, `orders/${orderId}`), {
  xenditInvoiceId: paymentResponse.invoiceId,
  platformCommission: paymentResponse.platformCommission,
  storeAmount: paymentResponse.storeAmount,
  paymentMethod: selectedPayment
});
// ✅ Allowed by "orders": { ".write": true }
```

### Step 7: Open Xendit Payment Page
```javascript
await Linking.openURL(paymentResponse.invoiceUrl);
```

### Step 8: Listen for Payment Confirmation
```javascript
// payment.tsx line 512-533
const orderRef = ref(database, `orders/${ord.id}`);
const unsubscribe = onValue(orderRef, async (snapshot) => {
  const updated = snapshot.val();
  if (updated?.paymentStatus === 'PAID' || updated?.paymentStatus === 'SETTLED') {
    // Mark debt as paid
    await update(orderRef, {
      debtStatus: 'paid',
      debtPaidDate: new Date().toISOString()
    });
    // ✅ Allowed by "orders": { ".write": true
    
    // Show success modal
    setCompletedOrderId(ord.id);
    setShowSuccessModal(true);
  }
});
```

## Testing the Flow

### Test Checklist:
- [ ] Add `.write": true` to `orders`, `ledgers`, `indexes`
- [ ] Deploy rules: `firebase deploy --only database`
- [ ] Navigate to debt history
- [ ] Click on unpaid debt order
- [ ] Click "Proceed to Pay"
- [ ] Select GCash or PayMaya
- [ ] Click "Proceed to Checkout"
- [ ] Verify Xendit payment page opens
- [ ] Check Firebase Console:
  - [ ] `orders/{orderId}` has `xenditInvoiceId`
  - [ ] `ledgers/stores/{storeId}/transactions/{invoiceId}` exists
  - [ ] `indexes/invoice_to_order/{invoiceId}` exists

### Expected Success:
```
✅ No PERMISSION_DENIED errors
✅ Xendit invoice created
✅ Payment page opens
✅ Order updated with invoice ID
✅ Ledger entry created
✅ Indexes created
```

## Common Issues

### "PERMISSION_DENIED" on orders
**Cause:** Missing `.write": true` in orders section
**Fix:** Add `.write": true` to orders (already done above)

### "PERMISSION_DENIED" on ledgers
**Cause:** Missing `.write": true` in ledgers section  
**Fix:** Add `.write": true` to ledgers (already done above)

### "PERMISSION_DENIED" on indexes
**Cause:** Missing `.write": true` in indexes section
**Fix:** Add `.write": true` to indexes (already done above)

### Webhook not updating order
**Cause:** Webhook endpoint not configured in Xendit dashboard
**Fix:** See `tindago-admin/XENDIT_INTEGRATION_GUIDE.md`

## Security Notes

### Current Setup (Development):
```json
"orders": { ".write": true }      // ⚠️ Anyone can write
"ledgers": { ".write": true }     // ⚠️ Anyone can write
"indexes": { ".write": true }     // ⚠️ Anyone can write
```

### Recommended for Production:
Use Firebase Admin SDK in the admin API to authenticate server-side:

```json
"orders": { 
  ".write": "auth != null && auth.token.admin === true"
},
"ledgers": { 
  ".write": "auth != null && auth.token.admin === true"
},
"indexes": { 
  ".write": "auth != null && auth.token.admin === true"
}
```

See `tindago-admin/FIREBASE_ADMIN_SETUP.md` for implementation.

## Summary

**All Required Paths Now Have Write Access:**
- ✅ `orders/{orderId}` - Update with Xendit invoice data
- ✅ `ledgers/stores/{storeId}/transactions/{invoiceId}` - Create ledger entry
- ✅ `indexes/invoice_to_store/{invoiceId}` - Map invoice to store
- ✅ `indexes/invoice_to_order/{invoiceId}` - Map invoice to order

**The debt payment → Xendit flow should now work completely!**

---

**Last Updated:** November 30, 2024
