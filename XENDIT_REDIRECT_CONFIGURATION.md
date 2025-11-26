# Xendit Redirect URL Configuration for Purchase Orders

## Overview
When a store-owner pays for a purchase order using GCash or PayMaya through Xendit, the redirect URL must be configured to send them back to the **store-owner's purchase-details page**, NOT the customer's order-details page.

## Changes Made to Mobile App

### Updated Files
- `app/(main)/(store-owner)/profile/purchase-payment.tsx`

### Key Changes

#### 1. Added Alert Before Xendit Redirect
```typescript
Alert.alert(
  'Redirecting to Payment',
  'You will be redirected to complete your payment. After payment, you will return to the purchase order details.',
  [{
    text: 'Continue',
    onPress: async () => {
      await Linking.openURL(paymentResult.invoiceUrl!);
      router.replace({
        pathname: '/(main)/(store-owner)/profile/purchase-details',
        params: { purchaseOrderId: poResult.purchaseOrderId, fromPayment: 'true' }
      });
    }
  }]
);
```

#### 2. Explicit Pathname Navigation
Changed from:
```typescript
router.replace(`/(main)/(store-owner)/profile/purchase-details?purchaseOrderId=${id}`)
```

To:
```typescript
router.replace({
  pathname: '/(main)/(store-owner)/profile/purchase-details',
  params: { purchaseOrderId: id }
})
```

## Route Clarification

### Store-Owner Routes (Purchase Orders)
- **Path**: `/(main)/(store-owner)/profile/purchase-details`
- **File**: `app/(main)/(store-owner)/profile/purchase-details.tsx`
- **Purpose**: Display purchase order details (supplier orders)
- **Used for**: Purchase orders, inventory restocking

### Customer Routes (Customer Orders)
- **Path**: `/(main)/(customer)/order-details`
- **File**: `app/(main)/(customer)/order-details.tsx`
- **Purpose**: Display customer order details
- **Used for**: Customer purchases from store

## Admin API Configuration

The redirect URL for Xendit needs to be configured in the `tindago-admin` API.

### File to Update
`tindago-admin/src/routes/payments.ts` (or similar)

### Redirect URL Configuration
When creating a Xendit invoice for purchase orders, set the redirect URL to:

```typescript
// For Purchase Orders (Store-Owner)
successRedirectUrl: 'tindago://main/store-owner/profile/purchase-details?purchaseOrderId={PURCHASE_ORDER_ID}',
failureRedirectUrl: 'tindago://main/store-owner/profile/purchase-details?purchaseOrderId={PURCHASE_ORDER_ID}&status=failed',
```

### Example Admin API Code
```typescript
// In /api/payments/purchase-order-invoice endpoint
const invoice = await xendit.Invoice.createInvoice({
  externalId: purchaseOrderId,
  amount: total,
  description: `Purchase Order ${purchaseOrderNumber}`,
  successRedirectUrl: `tindago://main/store-owner/profile/purchase-details?purchaseOrderId=${purchaseOrderId}`,
  failureRedirectUrl: `tindago://main/store-owner/profile/purchase-details?purchaseOrderId=${purchaseOrderId}&status=failed`,
  // ... other parameters
});
```

**IMPORTANT**: 
- DO NOT use `tindago://main/customer/order-details` for purchase orders
- DO NOT confuse purchase orders (supplier) with customer orders

## Deep Link Configuration

Make sure your `app.json` or `app.config.js` has the correct deep link scheme:

```json
{
  "expo": {
    "scheme": "tindago",
    "android": {
      "intentFilters": [
        {
          "action": "VIEW",
          "data": {
            "scheme": "tindago"
          }
        }
      ]
    },
    "ios": {
      "bundleIdentifier": "com.tindago.app",
      "associatedDomains": ["applinks:tindago.com"]
    }
  }
}
```

## Testing Checklist

### Mobile App Testing
- [ ] Create purchase order with GCash payment
- [ ] Click "Proceed to Checkout"
- [ ] Verify alert shows "Redirecting to Payment"
- [ ] Click "Continue" - verify Xendit page opens
- [ ] Verify app navigates to store-owner purchase-details page
- [ ] Complete payment on Xendit
- [ ] Verify Xendit redirects back to app
- [ ] Verify lands on store-owner purchase-details page (NOT customer order-details)

### Admin API Testing
- [ ] Verify purchase order invoice endpoint sets correct redirect URLs
- [ ] Check Xendit dashboard for created invoices
- [ ] Verify redirect URLs point to store-owner routes
- [ ] Test payment completion and redirect

### Route Verification
- [ ] Store-owner purchases a product → goes to purchase-details
- [ ] Customer orders a product → goes to order-details
- [ ] No cross-contamination between routes

## Debugging Tips

### Check Current URL
Add logging to see where navigation goes:
```typescript
console.log('[Navigation] Going to:', pathname, params);
```

### Check Deep Link
When app opens from Xendit, log the URL:
```typescript
Linking.addEventListener('url', (event) => {
  console.log('[Deep Link] Received:', event.url);
});
```

### Verify Route Matches
Check that the route file exists:
- ✅ `app/(main)/(store-owner)/profile/purchase-details.tsx` - EXISTS
- ❌ `app/(main)/(customer)/purchase-details.tsx` - SHOULD NOT EXIST

## Summary

1. ✅ Mobile app now explicitly navigates to store-owner purchase-details
2. ✅ Alert dialog confirms redirect before opening Xendit
3. ⚠️ Admin API needs to set correct Xendit redirect URLs
4. ✅ Clear separation between store-owner and customer routes

The mobile app changes are complete. Make sure to update the admin API redirect URLs to match!
