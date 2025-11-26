# Purchase Order Xendit Payment Implementation

## Overview
Complete implementation of Xendit payment integration for Purchase Orders in TindaGo, allowing store owners to pay suppliers via GCash/PayMaya with proper tracking and record-keeping.

## Implementation Date
2025-01-XX

## Components Modified/Created

### 1. **XenditService.ts** - Mobile App
**Location:** `src/services/payment/XenditService.ts`

**New Interface Added:**
```typescript
export interface PurchaseOrderPaymentRequest {
  purchaseOrderId: string;
  purchaseOrderNumber: string;
  amount: number;
  storeOwnerEmail: string;
  storeOwnerName: string;
  storeOwnerPhone: string;
  storeId: string;
  storeName: string;
  supplierName: string;
  items: {
    name: string;
    quantity: number;
    price: number;
  }[];
  paymentMethod: 'gcash' | 'paymaya';
}
```

**New Method Added:**
```typescript
async createPurchaseOrderPayment(request: PurchaseOrderPaymentRequest): Promise<PaymentResponse>
```

**Key Features:**
- Separate API endpoint for Purchase Order payments
- No commission/split (B2B transaction)
- Simple payment tracking
- Error handling and logging

### 2. **purchase-payment.tsx** - Mobile App
**Location:** `app/(main)/(store-owner)/profile/purchase-payment.tsx`

**New Imports:**
```typescript
import { xenditService } from '../../../../src/services/payment/XenditService';
import * as Linking from 'expo-linking';
```

**New Functions:**
- `handleXenditPayment()` - Process GCash/PayMaya via Xendit
- `handleCashPayment()` - Record cash payment (manual tracking)
- `handleDebtPayment()` - Record debt/loan for later payment

**Payment Flow:**
1. Store owner selects payment method
2. Creates purchase order
3. For GCash/PayMaya: Opens Xendit payment URL
4. Navigates to purchase-details screen
5. Payment status tracked in Firebase

### 3. **purchase-details.tsx** - Mobile App
**Location:** `app/(main)/(store-owner)/profile/purchase-details.tsx`

**Features:**
- Displays purchase order details
- Status timeline (Pending → Delivered)
- Payment method badge
- Product list with images
- Manual status updates
- View invoice button

### 4. **PurchaseOrder.ts** - Model
**Location:** `src/models/PurchaseOrder.ts`

**Type Updated:**
```typescript
export type PurchasePaymentMethod = 'cash' | 'gcash' | 'paymaya' | 'debt';
```

**Array Updated:**
```typescript
export const PURCHASE_PAYMENT_METHODS = [
  { value: 'cash', label: 'Cash', icon: 'cash' },
  { value: 'gcash', label: 'GCash', icon: 'gcash' },
  { value: 'paymaya', label: 'PayMaya', icon: 'paymaya' },
  { value: 'debt', label: 'Debt/Loan', icon: 'debt' },
];
```

## Admin API Endpoint Required

### **NEW ENDPOINT:** `/api/payments/purchase-order-invoice`

**Location:** `tindago-admin/src/app/api/payments/purchase-order-invoice/route.ts`

**Implementation:**

```typescript
import { NextRequest, NextResponse } from 'next/server';
import Xendit from 'xendit-node';

const xendit = new Xendit({
  secretKey: process.env.XENDIT_SECRET_KEY!,
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      purchaseOrderId,
      purchaseOrderNumber,
      total,
      method,
      store,
      storeOwner,
      supplierName,
      items,
    } = body;

    console.log('[Purchase Order Payment] Creating invoice:', purchaseOrderNumber);

    // Create Xendit invoice for B2B payment tracking
    const invoice = await xendit.Invoice.createInvoice({
      externalId: `PO-${purchaseOrderId}`,
      amount: total,
      payerEmail: storeOwner.email,
      description: `Purchase Order ${purchaseOrderNumber} - Supplier: ${supplierName}`,
      invoiceDuration: 86400, // 24 hours
      successRedirectUrl: `tindago://purchase-details?purchaseOrderId=${purchaseOrderId}&payment=success`,
      failureRedirectUrl: `tindago://purchase-details?purchaseOrderId=${purchaseOrderId}&payment=failed`,
      currency: 'PHP',
      items: items.map((item: any) => ({
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        category: 'Inventory Purchase',
      })),
      customer: {
        given_names: storeOwner.name,
        email: storeOwner.email,
        mobile_number: storeOwner.phone,
      },
      customerNotificationPreference: {
        invoice_created: ['email'],
        invoice_reminder: ['email'],
        invoice_paid: ['email'],
        invoice_expired: ['email'],
      },
      paymentMethods: [method.toUpperCase()],
    });

    console.log('[Purchase Order Payment] Invoice created:', invoice.id);

    // Update Firebase purchase order with invoice ID
    // (This should be done in a webhook handler)

    return NextResponse.json({
      success: true,
      invoiceId: invoice.id,
      invoiceUrl: invoice.invoice_url,
      expiryDate: invoice.expiry_date,
    });
  } catch (error: any) {
    console.error('[Purchase Order Payment] Error:', error.message);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
```

### **Webhook Handler Updates**

**Location:** `tindago-admin/src/app/api/webhooks/xendit/route.ts`

**Add to existing webhook handler:**

```typescript
// Handle Purchase Order invoice paid
if (event.external_id.startsWith('PO-')) {
  const purchaseOrderId = event.external_id.replace('PO-', '');

  // Update purchase order payment status
  await admin.database().ref(`purchase_orders/${purchaseOrderId}`).update({
    paymentStatus: 'paid',
    'paymentInfo/invoiceId': event.id,
    'paymentInfo/paidAt': event.paid_at,
    'paymentInfo/paidAmount': event.paid_amount,
    updatedAt: new Date().toISOString(),
  });

  console.log('[Webhook] Purchase Order marked as paid:', purchaseOrderId);
}
```

## Payment Flows

### 1. **GCash/PayMaya Payment Flow**
```
1. Store Owner creates Purchase Order
2. Selects GCash or PayMaya
3. Taps "Proceed to Checkout"
4. System creates purchase order (status: unpaid)
5. System calls Xendit API via admin endpoint
6. Xendit returns payment URL
7. App opens payment URL in browser
8. Store owner completes payment
9. Xendit webhook updates purchase order (status: paid)
10. Store owner sees updated status in app
```

### 2. **Cash Payment Flow**
```
1. Store Owner creates Purchase Order
2. Selects Cash
3. Taps "Proceed to Checkout"
4. System creates purchase order (status: paid)
5. Alert: "Cash payment recorded"
6. Navigates to purchase details
7. Store owner pays supplier manually
```

### 3. **Debt/Loan Payment Flow**
```
1. Store Owner creates Purchase Order
2. Selects Debt/Loan
3. Taps "Proceed to Checkout"
4. System creates purchase order (status: unpaid)
5. Alert: "Debt of ₱X recorded"
6. Navigates to purchase details
7. Purchase order tracked as unpaid
8. Store owner pays supplier later
9. Manually marks as delivered when paid
```

## Key Differences from Customer Orders

| Feature | Customer Orders | Purchase Orders |
|---------|----------------|-----------------|
| **Payment Direction** | Customer → Store | Store → Supplier |
| **Commission Split** | Yes (1% platform) | No (B2B tracking) |
| **Money Destination** | Platform + Store Wallet | Payment tracking only |
| **Payment Status** | Updates order status | Updates PO status |
| **Webhook Action** | Split commission, update wallet | Update PO status only |

## Firebase Database Updates

### Purchase Order Structure
```json
{
  "purchase_orders": {
    "PO123": {
      "id": "PO123",
      "purchaseOrderNumber": "PO-2025-001",
      "storeId": "store123",
      "supplierName": "Puregold",
      "totalCost": 5000,
      "paymentMethod": "gcash",
      "paymentStatus": "paid",
      "paymentInfo": {
        "invoiceId": "xendit-invoice-123",
        "paidAt": "2025-01-15T10:30:00Z",
        "paidAmount": 5000
      },
      "status": "pending",
      "createdAt": "2025-01-15T09:00:00Z"
    }
  }
}
```

## Testing Checklist

### Mobile App Testing
- [ ] Create purchase order with GCash payment
- [ ] Xendit payment URL opens correctly
- [ ] Complete payment on Xendit
- [ ] Verify status updates to paid
- [ ] Create purchase order with PayMaya payment
- [ ] Create purchase order with Cash payment
- [ ] Verify cash payment marked as paid immediately
- [ ] Create purchase order with Debt payment
- [ ] Verify debt tracked as unpaid
- [ ] Navigate to purchase details after payment
- [ ] View invoice button works
- [ ] Mark as delivered functionality
- [ ] Status timeline displays correctly

### Admin API Testing
- [ ] POST /api/payments/purchase-order-invoice
- [ ] Verify Xendit invoice created
- [ ] Check invoice URL is valid
- [ ] Test webhook receives payment confirmation
- [ ] Verify Firebase updates correctly
- [ ] Test error handling (invalid data)
- [ ] Test error handling (Xendit API down)

### Edge Cases
- [ ] Network error during Xendit call
- [ ] User closes payment page without paying
- [ ] Payment expires after 24 hours
- [ ] Multiple payment attempts
- [ ] Concurrent purchase orders
- [ ] Very large order amounts
- [ ] Missing supplier information

## Environment Variables Required

### Mobile App (.env)
```env
EXPO_PUBLIC_ADMIN_API_BASE=https://your-admin-url.com
```

### Admin API (.env.local)
```env
XENDIT_SECRET_KEY=your_xendit_secret_key
XENDIT_WEBHOOK_TOKEN=your_webhook_verification_token
FIREBASE_SERVICE_ACCOUNT=path/to/serviceAccount.json
```

## Security Considerations

1. **API Key Protection**
   - Never expose Xendit secret key in mobile app
   - All Xendit calls go through admin API
   - Admin API validates requests

2. **Webhook Verification**
   - Verify webhook signature from Xendit
   - Validate external_id format
   - Check payment amounts match

3. **User Authentication**
   - Verify Firebase auth token
   - Check store owner permissions
   - Validate purchase order ownership

## Known Limitations

1. **No Real Money Transfer**
   - Xendit payment is for tracking only
   - Store owner manually pays supplier
   - Platform doesn't hold/transfer funds

2. **24-Hour Expiry**
   - Xendit invoices expire after 24 hours
   - Store owner must create new PO if expired

3. **Manual Confirmation**
   - Store owner must manually mark as delivered
   - No automated supplier confirmation

## Future Enhancements

1. **Supplier Integration**
   - Add suppliers to system
   - Automated notifications
   - Supplier confirms delivery

2. **Wallet Deduction**
   - Pay from store wallet balance
   - No external payment needed

3. **Recurring Orders**
   - Schedule regular supplier orders
   - Automated purchase orders

4. **Payment Reminders**
   - Notify about unpaid debts
   - Payment due dates

5. **Analytics**
   - Purchase order trends
   - Supplier cost analysis
   - Payment method preferences

## Documentation Links

- [Xendit API Docs](https://developers.xendit.co/api-reference/)
- [Firebase Realtime Database](https://firebase.google.com/docs/database)
- [Expo Linking](https://docs.expo.dev/guides/linking/)
- [TindaGo Purchase Order Module](../modules/PURCHASE_ORDER_MODULE.md)

## Support

For issues or questions:
- Check Firebase logs for errors
- Review Xendit dashboard for payment status
- Test with Xendit test mode first
- Verify webhook endpoint is accessible

## Changelog

**2025-01-XX** - Initial implementation
- Added Xendit integration for Purchase Orders
- Implemented Cash and Debt payment tracking
- Created purchase-details screen with status management
- Added admin API endpoint for Purchase Order invoices
