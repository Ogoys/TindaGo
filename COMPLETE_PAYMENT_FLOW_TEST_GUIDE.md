# Complete Payment Flow - Test Guide

## ✅ Payment Flow Overview

This guide documents the **complete end-to-end payment flow** with all fixes implemented.

---

## 🔄 Complete Flow Steps

### 1. **Customer Places Order**
- Customer adds items to cart
- Goes to payment screen
- Selects **GCash** or **PayMaya**
- Taps "Proceed to Checkout"

### 2. **Payment Screen Processing** ✅ FIXED
**File**: `app/(main)/(customer)/payment.tsx`

```typescript
// Lines 292-332: After creating Xendit invoice
await Linking.openURL(paymentResponse.invoiceUrl);

// Store pending order and set up listener
setPendingOrderNumber(orderNumber);

// Listen for payment confirmation
const orderRef = ref(database, `orders/${orderId}`);
const unsubscribe = onValue(orderRef, async (snapshot) => {
  if (orderData?.paymentStatus === 'PAID' || orderData?.paymentStatus === 'SETTLED') {
    unsubscribe(); // Stop listening
    await clearCart(user.id);
    setCompletedOrderId(orderId);
    setShowSuccessModal(true); // Show modal!
    setProcessing(false);
  }
});

// Keep processing=true (stays in waiting state)
```

**What User Sees**:
```
[Loading Spinner]
Waiting for payment confirmation...

Please complete your payment in the browser.
This screen will update automatically.
```

**UI State**:
- ✅ Back button is **disabled** (`processing && styles.backButtonDisabled`)
- ✅ "Proceed to Checkout" button shows spinner
- ✅ Payment method selector is disabled
- ✅ User **cannot navigate away** until payment completes

---

### 3. **User Pays in Xendit**
- Browser opens with Xendit payment page
- Customer enters GCash/PayMaya details
- Completes payment
- Xendit processes payment

---

### 4. **Xendit Webhook Fires** ✅ FIXED
**File**: `tindago-admin/src/app/api/webhooks/xendit/route.ts`

```typescript
// Lines 51-59: Normalize payment method
let paymentMethod = metadata.method || payload.payment_method;
if (payload.payment_channel) {
  paymentMethod = payload.payment_channel.toLowerCase(); // PAYMAYA → paymaya
}

// Lines 66-68: Update ledger
ledgerUpdates.paymentMethod = paymentMethod; // "paymaya"
ledgerUpdates.customerName = metadata.customer_name;
ledgerUpdates.customerEmail = metadata.customer_email;
ledgerUpdates.customerPhone = metadata.customer_phone;

// Lines 140-147: Update order
const orderUpdates = { 
  paymentStatus: 'PAID', 
  updatedAt: new Date().toISOString() 
};
if (paymentMethod && paymentMethod !== 'EWALLET') {
  orderUpdates.paymentMethod = paymentMethod; // "paymaya"
}
await update(orderRef, orderUpdates);
```

**Database Updates**:
1. `orders/{orderId}`:
   - `paymentStatus: "PAID"`
   - `paymentMethod: "paymaya"` (normalized)
   - `updatedAt: timestamp`

2. `ledgers/stores/{storeId}/transactions/{ledgerId}`:
   - `paymentMethod: "paymaya"` (normalized)
   - `customerName: "John Doe"`
   - `customerEmail: "john@example.com"`
   - `customerPhone: "+639123456789"`

---

### 5. **Real-Time Listener Detects Payment** ✅ FIXED
**File**: `app/(main)/(customer)/payment.tsx`

```typescript
// Lines 302-323: Listener fires when webhook updates database
const unsubscribe = onValue(orderRef, async (snapshot) => {
  console.log('[Payment] Listener fired for orderId:', orderId);
  const orderData = snapshot.val();
  console.log('[Payment] Order paymentStatus:', orderData?.paymentStatus);
  
  // Check if payment confirmed
  if (orderData?.paymentStatus === 'PAID' || orderData?.paymentStatus === 'SETTLED') {
    console.log('[Payment] Payment confirmed! Showing modal...');
    unsubscribe(); // Stop listening
    await clearCart(user.id); // Clear cart
    setCompletedOrderId(orderId); // Set order ID for modal
    setShowSuccessModal(true); // Show success modal
    setCartItems([]);
    setPendingOrderNumber('');
    setProcessing(false); // Exit processing state
  }
});
```

**Flow**:
1. Webhook updates `orders/{orderId}.paymentStatus = "PAID"`
2. Real-time listener fires immediately
3. Detects `paymentStatus === 'PAID'`
4. Clears cart
5. Shows `OrderProcessCompleteModal`
6. Exits processing state

---

### 6. **Order Complete Modal Appears** ✅ FIXED
**File**: `src/components/ui/OrderCompleteModal.tsx`

**Correct Import** (Line 38 in payment.tsx):
```typescript
import { OrderCompleteModal } from '../../../src/components/ui/OrderCompleteModal';
```

**Modal Display** (Lines 499-504):
```typescript
<OrderCompleteModal
  visible={showSuccessModal}
  onClose={() => setShowSuccessModal(false)}
  orderId={completedOrderId}
/>
```

**What User Sees**:
```
┌─────────────────────────────────────┐
│   ✅ Thank you for your order!      │
│                                     │
│   Your order has been placed        │
│   successfully.                     │
│                                     │
│  [Track Store]                      │
│  [Back to Home]                     │
└─────────────────────────────────────┘
```

**2 Button Options**:
1. **Track Store** → Routes to `/(main)/(customer)/track-store?orderId=${orderId}`
2. **Back to Home** → Routes to `/(main)/(customer)/home`

**Note**: "Give Feedback" button only appears in `OrderProcessCompleteModal` which shows when order status is "picked_up" or "completed" (shown in order-details screen).

---

## 📱 Payment Screen States

### State 1: Normal View
```typescript
processing = false
pendingOrderNumber = ''
```
**Display**: Bill card + payment method selector + "Proceed to Checkout" button

### State 2: Processing (Xendit Open)
```typescript
processing = true
pendingOrderNumber = 'ORD-2025-001'
```
**Display**:
```
[Spinner]
Waiting for payment confirmation...
Please complete your payment in the browser.
This screen will update automatically.
```

### State 3: Payment Confirmed
```typescript
processing = false
showSuccessModal = true
completedOrderId = '-Oe8TE5MO...'
```
**Display**: OrderCompleteModal with 2 buttons (Track Store, Back to Home)

---

## 🎯 Key Fixes Implemented

### Fix #1: Use Correct OrderCompleteModal ✅
**Problem**: Need to show modal after payment (Track Store + Back to Home only)
**Solution**: Uses `OrderCompleteModal` (2 buttons - no feedback yet, that's for pickup)

### Fix #2: Stay in Processing State ✅
**Problem**: Payment screen would exit processing state too early
**Solution**: Keep `processing=true` until modal appears (line 318)

### Fix #3: Disable Back Button ✅
**Problem**: User could navigate away during payment
**Solution**: Disable back button when `processing=true` (lines 388-390)

### Fix #4: Real-Time Listener ✅
**Problem**: App didn't automatically detect payment
**Solution**: Set up `onValue()` listener on order (lines 302-323)

### Fix #5: Payment Method Normalization ✅
**Problem**: Database stored generic "EWALLET"
**Solution**: Webhook extracts specific channel (PAYMAYA → "paymaya")

### Fix #6: Customer Info in Ledger ✅
**Problem**: Ledger missing customer details
**Solution**: Webhook stores customerName, customerEmail, customerPhone

---

## 🧪 Testing Checklist

### Pre-Test Setup
- [ ] Admin server running: `cd C:\CapsProj\tindago-admin && npm run dev`
- [ ] Mobile app running: `cd C:\CapsProj\TindaGo && npx expo start --clear`
- [ ] Firebase Realtime Database rules deployed

### Test Steps
1. **Place Order**:
   - [ ] Log in as customer
   - [ ] Add items to cart
   - [ ] Go to payment screen
   - [ ] Select **PayMaya** or **GCash**
   - [ ] Tap "Proceed to Checkout"

2. **Check Processing State**:
   - [ ] Xendit page opens in browser
   - [ ] Payment screen shows "Waiting for payment confirmation..."
   - [ ] Back button is **disabled** (grayed out)
   - [ ] Cannot navigate away

3. **Complete Payment**:
   - [ ] In browser: Complete PayMaya/GCash payment
   - [ ] Use test credentials (if testing)
   - [ ] Wait for Xendit success page

4. **Check Modal Appears**:
   - [ ] Return to app (automatically or manually)
   - [ ] **OrderCompleteModal** appears automatically
   - [ ] Modal shows 2 buttons: **Track Store** and **Back to Home**
   - [ ] NO "Give Feedback" button (that's for pickup, not payment)
   - [ ] Processing state exits (no more spinner)

5. **Verify Database**:
   - [ ] Firebase Console → `orders/{orderId}`:
     - `paymentStatus: "PAID"` ✅
     - `paymentMethod: "paymaya"` (not "EWALLET") ✅
   - [ ] Firebase Console → `ledgers/stores/{storeId}/transactions/{ledgerId}`:
     - `paymentMethod: "paymaya"` ✅
     - `customerName: "John Doe"` ✅
     - `customerEmail: "john@example.com"` ✅
     - `customerPhone: "+639123456789"` ✅

6. **Verify Display**:
   - [ ] **Mobile - Order Details**: Shows "PayMaya" with green icon
   - [ ] **Mobile - Store Owner Orders**: Shows "PayMaya"
   - [ ] **Mobile - Sales History**: Filter by PayMaya works
   - [ ] **Admin - Transaction Summary**: Shows green "PayMaya" badge
   - [ ] **Admin - Transaction Management**: Shows green PayMaya logo

7. **Test Track Store Button**:
   - [ ] Tap "Track Store" in modal
   - [ ] Routes to `track-store` screen with correct orderId
   - [ ] Shows real order data (not test data)

---

## 🐛 Troubleshooting

### Modal doesn't appear
**Check**:
1. Console logs: `[Payment] Listener fired for orderId:`
2. Console logs: `[Payment] Order paymentStatus:`
3. Firebase Console: Verify `paymentStatus = "PAID"`
4. Webhook logs in admin terminal: Look for successful update

**Solution**: Webhook might have failed. Check Xendit webhook logs.

### Back button still enabled
**Check**: `processing` state should be `true` when waiting
**Solution**: Ensure line 331 doesn't set `processing=false`

### Wrong modal appears
**Check**: Import statement (line 38)
**Solution**: Should be `OrderCompleteModal` (2 buttons) for payment screen
**Note**: `OrderProcessCompleteModal` (3 buttons with feedback) is for order-details when picked up

### Payment method shows "EWALLET"
**Check**: Webhook normalization logic (lines 51-59)
**Solution**: Ensure Xendit sends `payment_channel` field

---

## 📊 Payment Flow Diagram

```
Customer
  │
  ├─→ Taps "Proceed to Checkout"
  │
  ├─→ Payment Screen
  │     • processing = true
  │     • pendingOrderNumber = 'ORD-001'
  │     • Opens Xendit in browser
  │     • Shows "Waiting..." UI
  │     • Sets up real-time listener
  │
  ├─→ Customer Pays in Browser
  │     • Enters GCash/PayMaya details
  │     • Completes payment
  │
  ├─→ Xendit Webhook Fires
  │     • POST /api/webhooks/xendit
  │     • Normalizes payment_channel: "PAYMAYA" → "paymaya"
  │     • Updates orders/{orderId}:
  │         - paymentStatus: "PAID"
  │         - paymentMethod: "paymaya"
  │     • Updates ledger with customer info
  │
  ├─→ Real-Time Listener Detects Change
  │     • onValue() fires
  │     • Detects paymentStatus = "PAID"
  │     • Clears cart
  │     • Shows OrderProcessCompleteModal
  │     • processing = false
  │
  └─→ Modal Appears (OrderCompleteModal)
        • 2 buttons available:
            - Track Store (track order status)
            - Back to Home
        
        Note: "Give Feedback" appears later when
        order is picked up (OrderProcessCompleteModal)
```

---

## ✅ Success Criteria

1. ✅ Payment screen stays in "Waiting..." state until payment confirmed
2. ✅ Back button disabled during processing
3. ✅ OrderCompleteModal appears automatically after payment
4. ✅ Modal has 2 buttons (Track Store, Back to Home) - correct for payment stage
5. ✅ Database stores normalized payment method ("paymaya"/"gcash")
6. ✅ Database stores customer info in ledger
7. ✅ All screens display "PayMaya" or "GCash" (not "EWALLET")
8. ✅ Track Store button navigates correctly with real data
9. ✅ Give Feedback appears later in OrderProcessCompleteModal (when picked up)

---

## 📝 Files Modified

1. **Payment Screen**: `app/(main)/(customer)/payment.tsx`
   - Uses `OrderCompleteModal` (line 38) - shows 2 buttons after payment
   - Component usage (line 500)

2. **Webhook**: `tindago-admin/src/app/api/webhooks/xendit/route.ts`
   - Added payment method normalization (lines 51-59)
   - Added order payment method update (lines 125-147)
   - Added customer info to ledger (lines 66-68)

3. **Store Owner Orders**: `TindaGo/app/(main)/(store-owner)/orders/index.tsx`
   - Added payment method formatting (lines 487-492)

4. **Sales History**: `TindaGo/app/(main)/(store-owner)/profile/sales-history.tsx`
   - Fixed filter logic (lines 176-181)
   - Added display formatting (lines 353-358)

---

**Date**: 2025-01-15  
**Status**: ✅ **COMPLETE - READY FOR TESTING**  
**Next**: Test complete payment flow end-to-end
