# Purchase Order Payment Testing Guide

## Overview
This guide provides step-by-step instructions for testing the complete Purchase Order payment flow with GCash and PayMaya integration.

## Recent Improvements (2025)

### 1. **Database Path Standardization**
- ✅ Changed from `purchaseOrders` to `purchase_orders` (snake_case)
- ✅ Ensures consistency between mobile app and admin dashboard
- ✅ Enables proper webhook updates from Xendit

### 2. **Enhanced PurchaseOrder Model**
- ✅ Added `paymentInfo` field to track Xendit payment data:
  - `invoiceId` - Xendit invoice ID
  - `invoiceUrl` - Payment page URL
  - `expiryDate` - Invoice expiration
  - `paidAt` - Payment confirmation timestamp
  - `status` - Xendit payment status (PENDING, PAID, SETTLED, EXPIRED)

### 3. **API Response Enhancement**
- ✅ `createPurchaseOrder()` now returns both:
  - `purchaseOrderId` - Firebase database key
  - `purchaseOrderNumber` - Human-readable PO number (e.g., "PO-2025-001")
- ✅ Required for Xendit invoice creation

## Payment Flow Architecture

### **Cash Payment Flow**
```
1. Store Owner selects products
2. Fills in supplier details
3. Selects "Cash" payment method
4. Creates purchase order with:
   - paymentMethod: 'cash'
   - paymentStatus: 'paid' (immediate)
5. No Xendit invoice created
6. Order saved to database
```

### **GCash/PayMaya Payment Flow**
```
1. Store Owner selects products
2. Fills in supplier details
3. Selects "GCash" or "PayMaya"
4. Mobile app:
   - Creates PO with paymentStatus: 'unpaid'
   - Calls XenditService.createPurchaseOrderPayment()
   - Opens Xendit payment URL in browser
5. Admin API:
   - Creates Xendit invoice (NO commission)
   - Updates PO with paymentInfo
   - Creates ledger entry
6. Store Owner completes payment on Xendit
7. Xendit webhook:
   - Detects PO payment by "PO-" prefix
   - Updates paymentStatus to 'paid'
   - Records payment timestamp
```

### **Debt Payment Flow**
```
1. Store Owner selects products
2. Fills in supplier details
3. Selects "Debt" payment method
4. Creates purchase order with:
   - paymentMethod: 'debt'
   - paymentStatus: 'unpaid'
5. No Xendit invoice created
6. Store owner can track debt in history
```

## Database Structure

### Purchase Order Record
```javascript
purchase_orders/{purchaseOrderId}: {
  id: "abc123",
  purchaseOrderNumber: "PO-2025-001",
  storeId: "store123",
  storeOwnerId: "store123",
  storeName: "Tindahan ni Maria",

  // Supplier info
  supplierName: "Puregold Caloocan",
  supplierContact: "+63 912 345 6789",

  // Items
  items: [
    {
      productId: "prod123",
      productName: "Lucky Me Pancit Canton",
      quantity: 24,
      costPerUnit: 8.50,
      subtotal: 204.00,
      productSize: "60g",
      unit: "pcs"
    }
  ],

  // Payment tracking
  totalCost: 204.00,
  paymentMethod: "gcash", // or "cash", "paymaya", "debt"
  paymentStatus: "paid", // or "unpaid"
  paymentInfo: {
    invoiceId: "xendit_inv_123",
    invoiceUrl: "https://checkout.xendit.co/...",
    expiryDate: "2025-01-15T10:00:00Z",
    paidAt: "2025-01-14T15:30:00Z",
    status: "PAID",
    createdAt: "2025-01-14T15:00:00Z"
  },

  // Status
  status: "pending", // or "received", "cancelled"

  // Dates
  purchaseDate: "2025-01-14",
  createdAt: "2025-01-14T15:00:00Z",
  updatedAt: "2025-01-14T15:30:00Z",
  recordedBy: "store123"
}
```

### Ledger Entry
```javascript
ledgers/purchase_orders/{storeId}/transactions/{invoiceId}: {
  purchaseOrderId: "abc123",
  purchaseOrderNumber: "PO-2025-001",
  invoiceId: "xendit_inv_123",
  amount: 204.00,
  method: "gcash",
  status: "PAID",
  paidAt: "2025-01-14T15:30:00Z",
  createdAt: "2025-01-14T15:00:00Z",
  storeName: "Tindahan ni Maria",
  storeId: "store123",
  supplierName: "Puregold Caloocan",
  storeOwnerName: "Maria Santos",
  storeOwnerEmail: "maria@example.com"
}
```

## Testing Steps

### Prerequisites
1. **Xendit Configuration**
   - Xendit account with test mode enabled
   - Webhook URL configured: `https://your-admin.com/api/webhooks/xendit`
   - Webhook token set in `.env.local`

2. **Admin Dashboard**
   ```bash
   cd ../tindago-admin
   npm run dev  # Should run on http://localhost:3000
   ```

3. **Mobile App**
   ```bash
   cd TindaGo
   npm start
   npx expo start --android  # or --ios
   ```

### Test Case 1: Cash Payment (Immediate)

**Steps:**
1. Open mobile app as store owner
2. Navigate to Profile → Record Purchase Order
3. Add products:
   - Select 2-3 products from catalog
   - Set quantities and cost per unit
4. Fill supplier info (optional):
   - Supplier: "Puregold Caloocan"
   - Contact: "+63 912 345 6789"
5. Click "Place Order"
6. On payment screen, select **"Cash"**
7. Click "Proceed to Checkout"

**Expected Results:**
- ✅ Alert: "Purchase Order Created" with "Cash payment recorded"
- ✅ Database record at `purchase_orders/{id}`:
  - `paymentMethod: "cash"`
  - `paymentStatus: "paid"`
  - No `paymentInfo` field
- ✅ No Xendit invoice created
- ✅ Navigates to purchase details screen

### Test Case 2: GCash Payment (Digital)

**Steps:**
1. Open mobile app as store owner
2. Navigate to Profile → Record Purchase Order
3. Add products with total ~₱500
4. Fill supplier info
5. Click "Place Order"
6. On payment screen, select **"GCash"**
7. Click "Proceed to Checkout"

**Expected Results:**
- ✅ Purchase order created with `paymentStatus: "unpaid"`
- ✅ Xendit payment page opens in browser
- ✅ Database record includes:
  ```javascript
  {
    paymentMethod: "gcash",
    paymentStatus: "unpaid",
    paymentInfo: {
      invoiceId: "...",
      invoiceUrl: "https://checkout.xendit.co/...",
      expiryDate: "...",
      status: "PENDING",
      createdAt: "..."
    }
  }
  ```
- ✅ Ledger entry created at `ledgers/purchase_orders/{storeId}/transactions/{invoiceId}`
- ✅ Navigates to purchase details with "Payment Pending" status

**Complete Payment:**
1. On Xendit test page, click "Simulate Payment Success"
2. Wait 3-5 seconds for webhook

**Expected After Payment:**
- ✅ Webhook updates purchase order:
  - `paymentStatus: "paid"`
  - `paymentInfo.paidAt: "..."`
  - `paymentInfo.status: "PAID"`
- ✅ Mobile app shows "Payment Confirmed" when refreshed
- ✅ Admin dashboard shows payment as "Paid"

### Test Case 3: PayMaya Payment

**Steps:**
1. Same as GCash test but select **"PayMaya"**

**Expected Results:**
- ✅ Same as GCash flow
- ✅ PayMaya payment page opens
- ✅ Database shows `paymentMethod: "paymaya"`

### Test Case 4: Debt Payment (Unpaid Tracking)

**Steps:**
1. Open mobile app as store owner
2. Navigate to Profile → Record Purchase Order
3. Add products with total ~₱1,000
4. Fill supplier info
5. Click "Place Order"
6. On payment screen, select **"Debt"**
7. Review debt warning card
8. Click "Proceed to Checkout"

**Expected Results:**
- ✅ Alert shows: "Debt of ₱1,000.00 has been recorded"
- ✅ Database record:
  ```javascript
  {
    paymentMethod: "debt",
    paymentStatus: "unpaid"
  }
  ```
- ✅ No Xendit invoice created
- ✅ No `paymentInfo` field
- ✅ Store owner can track in purchase order history

### Test Case 5: Admin Dashboard Verification

**Steps:**
1. Open admin dashboard: `http://localhost:3000/purchase-orders`
2. Verify all purchase orders appear in table
3. Check payment status badges (Paid/Unpaid)
4. Click on GCash/PayMaya order
5. Verify payment details modal shows:
   - Invoice ID
   - Payment method
   - Payment status
   - Paid date/time

**Analytics Page:**
1. Navigate to `/purchase-orders/analytics`
2. Verify stats cards show:
   - Total Orders
   - Total Amount
   - Paid Amount
   - Unpaid Amount
3. Check payment method breakdown (Cash, GCash, PayMaya, Debt)
4. Verify top stores and suppliers

## Webhook Testing

### Verify Webhook Configuration

**Check Xendit Dashboard:**
1. Go to Settings → Webhooks
2. Verify URL: `https://your-domain.com/api/webhooks/xendit`
3. Verify events enabled:
   - Invoice Paid
   - Invoice Expired

**Test Webhook Locally (ngrok):**
```bash
# Terminal 1: Start admin server
cd tindago-admin
npm run dev

# Terminal 2: Start ngrok
ngrok http 3000

# Update Xendit webhook URL to ngrok URL
# Example: https://abc123.ngrok.io/api/webhooks/xendit
```

### Webhook Response Validation

**Check Logs:**
```bash
# Admin server logs should show:
[Webhook] Processing invoice: xendit_inv_123
[Webhook] Processing Purchase Order payment: PO-2025-001
[✅ Purchase Order] Updated payment status to 'paid' for PO abc123
[📊 Ledger] Updated purchase order ledger for store store123
```

**Database Checks:**
1. Purchase order updated within 3 seconds
2. Payment status changed from "unpaid" to "paid"
3. Ledger transaction updated with payment timestamp
4. No duplicate webhook processing (idempotency check)

## Common Issues & Solutions

### Issue 1: Webhook Not Updating Purchase Order
**Symptoms:**
- Payment completed on Xendit
- Purchase order still shows "unpaid"

**Solution:**
- Check webhook logs in admin console
- Verify `purchase_orders` path (not `purchaseOrders`)
- Confirm webhook token matches in both apps
- Check `indexes/invoice_to_purchase_order/{invoiceId}` exists

### Issue 2: Missing purchaseOrderNumber Error
**Symptoms:**
- Error: "purchaseOrderNumber is undefined"
- Xendit invoice creation fails

**Solution:**
- ✅ Already fixed! API now returns `purchaseOrderNumber`
- Update mobile app if using old version
- Clear AsyncStorage cache

### Issue 3: Payment Status Not Syncing
**Symptoms:**
- Webhook processes successfully
- Mobile app doesn't show updated status

**Solution:**
- Refresh purchase details screen
- Check Firebase Realtime Database listeners
- Verify database path consistency

### Issue 4: Commission Deducted (Should Not Happen)
**Symptoms:**
- Purchase order shows commission deduction
- Store owner sees reduced amount

**Solution:**
- Verify `/api/payments/purchase-order-invoice` route
- Check `fees: []` parameter (line 77)
- **B2B transactions should have ZERO commission**

## API Endpoints Reference

### Mobile App Endpoints

**XenditService.createPurchaseOrderPayment()**
- URL: `http://localhost:3000/api/payments/purchase-order-invoice`
- Method: POST
- Body:
  ```json
  {
    "purchaseOrderId": "abc123",
    "purchaseOrderNumber": "PO-2025-001",
    "total": 204.00,
    "method": "gcash",
    "store": { "id": "store123", "name": "Tindahan ni Maria" },
    "storeOwner": {
      "email": "maria@example.com",
      "name": "Maria Santos",
      "phone": "+63 912 345 6789"
    },
    "supplierName": "Puregold Caloocan",
    "items": [...]
  }
  ```

### Admin API Endpoints

**GET /api/admin/purchase-orders**
- Returns all purchase orders with store details

**GET /api/admin/purchase-orders/analytics**
- Returns analytics dashboard data

**POST /api/payments/purchase-order-invoice**
- Creates Xendit invoice for GCash/PayMaya

**POST /api/webhooks/xendit**
- Receives payment confirmation from Xendit

## Success Criteria

✅ **Cash payments** create immediate "paid" status
✅ **GCash/PayMaya** payments create Xendit invoices
✅ **Debt payments** track unpaid amounts
✅ **Webhooks** update payment status within 3 seconds
✅ **No commission** deducted from B2B transactions
✅ **Admin dashboard** displays all purchase orders correctly
✅ **Payment info** stored properly with invoice data
✅ **Ledger entries** created for tracking

## Performance Benchmarks

- Purchase order creation: < 2 seconds
- Xendit invoice creation: < 3 seconds
- Webhook processing: < 1 second
- Database query (list all POs): < 500ms
- Admin dashboard load: < 1 second

## Security Checklist

- ✅ Webhook token validation enabled
- ✅ HTTPS required for production webhooks
- ✅ Firebase security rules restrict PO creation to store owners
- ✅ No Xendit secret keys exposed in mobile app
- ✅ Payment data encrypted in transit
- ✅ Idempotency prevents duplicate processing

## Next Steps

After successful testing:
1. Deploy admin dashboard to production
2. Configure production Xendit webhook URL
3. Update mobile app with production admin URL
4. Monitor webhook logs for first week
5. Train store owners on payment options
6. Set up alerting for failed payments

---

**Last Updated:** 2025-01-14
**Tested By:** Development Team
**Status:** ✅ All tests passing
