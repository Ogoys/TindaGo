# 🧪 Complete Payment Flow - Final Test Guide

## ✅ Implementation Verified

All code has been scanned and verified correct:

### ✅ Payment Screen (`payment.tsx`)
- Line 38: ✅ Uses `OrderCompleteModal` (2 buttons: Track Store, Back to Home)
- Lines 302-323: ✅ Real-time listener watches for `paymentStatus = 'PAID'`
- Lines 413-421: ✅ Shows "Waiting for payment confirmation..." during processing
- Lines 388-390: ✅ Back button disabled when `processing = true`
- Line 318: ✅ Sets `processing = false` only when modal shows

### ✅ Order Details Screen (`order-details.tsx`)
- Line 19: ✅ Uses `OrderProcessCompleteModal` (3 buttons: Track Store, Feedback, Back to Home)
- Lines 102-106: ✅ Shows modal when status = 'picked_up' or 'completed'

### ✅ Webhook (`xendit/route.ts`)
- Lines 51-59: ✅ Normalizes payment method (PAYMAYA → paymaya, GCASH → gcash)
- Lines 66-68: ✅ Updates ledger with customer info
- Lines 125-147: ✅ Updates order with normalized payment method

---

## 🚀 Step-by-Step Test Procedure

### **Pre-Test Setup**

1. **Start Admin Server**
   ```powershell
   cd C:\CapsProj\tindago-admin
   npm run dev
   ```
   ✅ Verify: "Ready on http://localhost:3000"

2. **Start Mobile App**
   ```powershell
   cd C:\CapsProj\TindaGo
   npx expo start --clear
   ```
   ✅ Verify: QR code appears

3. **Open Firebase Console**
   - Go to: https://console.firebase.google.com
   - Select your TindaGo project
   - Open: Realtime Database
   - Keep this tab open for monitoring

---

## 📱 Test 1: Complete Payment Flow (Main Test)

### **Step 1: Place Order** 🛒

1. Open TindaGo app on your device
2. Log in as **customer**
3. Browse stores and add items to cart (at least 2 items)
4. Go to cart
5. Tap "Checkout"
6. Go to Payment screen

**✅ Verify:**
- Payment screen shows bill summary
- See: "Item", "Sub Total", "Total"
- Payment methods visible: GCash, PayMaya, Cash

---

### **Step 2: Select Payment Method** 💳

1. Tap **PayMaya** or **GCash**
2. Tap "Proceed to Checkout"

**✅ Verify:**
- Button shows loading spinner immediately
- Console log: `Xendit invoice created: XNDT-INV-...`

---

### **Step 3: Processing State** ⏳

**IMPORTANT: This is the KEY test!**

After tapping "Proceed to Checkout":

**✅ Verify Screen Shows:**
```
🔄 [Spinner]
Waiting for payment confirmation...

Please complete your payment in the browser.
This screen will update automatically.
```

**✅ Verify UI State:**
- Back button is GRAYED OUT (can't tap it)
- "Proceed to Checkout" button shows spinner
- Payment method selector is disabled
- **You CANNOT navigate away**

**✅ Console Logs:**
```
[Payment] Listener fired for orderId: -Oe8TE5MO...
[Payment] Order paymentStatus: pending
```

---

### **Step 4: Complete Payment in Xendit** 💰

1. **Browser should open automatically** with Xendit page
2. If not, manually open the Xendit URL from console

**On Xendit Page:**

#### For PayMaya Test:
1. Select "E-Wallets"
2. Select "PayMaya"
3. Enter test credentials:
   - Email: `test@paymaya.com`
   - Number: `+639171234567`
4. Click "Pay"
5. Click "Success" on test page

#### For GCash Test:
1. Select "E-Wallets"
2. Select "GCash"
3. Enter test credentials:
   - Mobile: `09171234567`
4. Click "Pay"
5. Enter OTP: `123456`
6. Click "Confirm"

**✅ Verify Xendit:**
- Payment successful page appears
- Shows "Payment Successful" or similar

---

### **Step 5: Return to App** 📲

**Return to TindaGo app** (switch back or tap app)

**✅ Verify - Automatic Modal Appearance:**

Within **1-3 seconds**, you should see:

```
┌─────────────────────────────────────┐
│                                     │
│       [Checkmark Icon]              │
│                                     │
│   Thank you for your order!         │
│                                     │
│   Your order has been placed        │
│   successfully. Your order ID is    │
│   #ORD-2025-001234                  │
│                                     │
│   ┌─────────────────────────────┐   │
│   │     Track Store             │   │
│   └─────────────────────────────┘   │
│                                     │
│   ┌─────────────────────────────┐   │
│   │     Back to Home            │   │
│   └─────────────────────────────┘   │
│                                     │
└─────────────────────────────────────┘
```

**✅ Verify Modal:**
- ✅ Shows "Thank you for your order!"
- ✅ Shows order ID (e.g., #ORD-2025-001234)
- ✅ Has **2 buttons ONLY**:
  - Track Store
  - Back to Home
- ❌ NO "Give Feedback" button (too early!)

**✅ Console Logs:**
```
[Payment] Listener fired for orderId: -Oe8TE5MO...
[Payment] Order paymentStatus: PAID
[Payment] Payment confirmed! Showing modal...
```

---

### **Step 6: Test Track Store Button** 🗺️

1. Tap "Track Store" button
2. Should navigate to track-store screen

**✅ Verify:**
- Track-store screen opens
- Shows real order data (not test data)
- Order ID in URL: `?orderId=-Oe8TE5MO...`
- Shows order status (preparing/ready/picked_up)

---

### **Step 7: Verify Database** 🔥

**Open Firebase Console:**

1. **Check `orders/{orderId}`:**
   ```json
   {
     "orderNumber": "ORD-2025-001234",
     "paymentStatus": "PAID",          ✅
     "paymentMethod": "paymaya",        ✅ (not "EWALLET")
     "xenditInvoiceId": "XNDT-INV-...",
     "total": 350.50,
     "status": "preparing"
   }
   ```

2. **Check `ledgers/stores/{storeId}/transactions/{invoiceId}`:**
   ```json
   {
     "invoiceId": "XNDT-INV-...",
     "orderNumber": "ORD-2025-001234",
     "amount": 350.50,
     "status": "PAID",
     "method": "paymaya",               ✅ (not "EWALLET")
     "customerName": "John Doe",        ✅
     "customerEmail": "john@test.com",  ✅
     "customerPhone": "+639123456789",  ✅
     "paidAt": "2025-01-15T..."
   }
   ```

**✅ Verify:**
- `paymentMethod` = "paymaya" or "gcash" (NOT "EWALLET")
- `customerName`, `customerEmail`, `customerPhone` present
- `paymentStatus` = "PAID"

---

### **Step 8: Check Display in Other Screens** 📊

#### A. Customer Order Details
1. Go to Orders (customer view)
2. Tap on the order you just placed
3. Scroll down to "Payment Method" section

**✅ Verify:**
- Shows "PayMaya" with green icon OR
- Shows "GCash" with blue icon
- NOT "EWALLET" or generic text

---

#### B. Store Owner Orders (if you have store owner account)
1. Log in as store owner
2. Go to Orders tab
3. Find the order

**✅ Verify:**
- Shows "PayMaya" or "GCash" in payment method field
- NOT "EWALLET"

---

#### C. Store Owner Sales History
1. Go to Profile → Sales History
2. Filter by "PayMaya" or "GCash"

**✅ Verify:**
- Filter works correctly
- Shows "PayMaya" or "GCash" in transaction list
- NOT "EWALLET"

---

#### D. Admin Dashboard - Transaction Summary
1. Open http://localhost:3000 in browser
2. Log in as admin
3. Go to Transaction Summary

**✅ Verify:**
- Shows green "PayMaya" badge OR blue "GCash" badge
- Filter dropdown works
- Can filter by GCash or PayMaya

---

#### E. Admin Dashboard - Transaction Management
1. Go to Transaction Management page

**✅ Verify:**
- Shows PayMaya logo (green) or GCash logo (blue)
- Transaction details show correct payment method

---

## 📱 Test 2: Order Pickup Flow (Feedback Modal)

### **Simulate Order Completion**

1. **In Firebase Console:**
   - Go to `orders/{orderId}`
   - Change `status` from "preparing" to **"picked_up"**
   - Save

2. **In Mobile App:**
   - Go to customer order-details screen
   - **Wait 1-2 seconds**

**✅ Verify - Different Modal Appears:**

```
┌─────────────────────────────────────┐
│                                     │
│       [Celebration Icon]            │
│                                     │
│   Order Process Complete!           │
│                                     │
│   Thank you for your order!         │
│   We hope you enjoyed our service.  │
│                                     │
│   ┌─────────────────────────────┐   │
│   │     Track Store             │   │
│   └─────────────────────────────┘   │
│                                     │
│   ┌─────────────────────────────┐   │
│   │   Give Feedback Now         │   │
│   └─────────────────────────────┘   │
│                                     │
│   ┌─────────────────────────────┐   │
│   │     Back to Home            │   │
│   └─────────────────────────────┘   │
│                                     │
└─────────────────────────────────────┘
```

**✅ Verify This Modal:**
- Shows "Order Process Complete!"
- Has **3 buttons**:
  - Track Store
  - **Give Feedback Now** ✅ (NOW it appears!)
  - Back to Home

---

## 🐛 Troubleshooting

### Issue: Modal doesn't appear after payment

**Check:**
1. Console logs: Look for `[Payment] Payment confirmed!`
2. Firebase: Check if `paymentStatus = "PAID"`
3. Admin terminal: Check webhook logs for errors

**Solution:**
- Webhook might have failed
- Check Xendit webhook is configured correctly
- Verify XENDIT_WEBHOOK_TOKEN in `.env`

---

### Issue: Shows "Give Feedback" right after payment

**Check:**
- Line 38 in `payment.tsx` should import `OrderCompleteModal`
- NOT `OrderProcessCompleteModal`

**Fix:**
```typescript
// ✅ CORRECT
import { OrderCompleteModal } from '../../../src/components/ui/OrderCompleteModal';

// ❌ WRONG
import { OrderProcessCompleteModal } from '...';
```

---

### Issue: Payment method shows "EWALLET"

**Check:**
1. Webhook code lines 51-59
2. Console log: `payload.payment_channel`
3. Xendit is sending the correct data

**Solution:**
- Ensure Xendit sends `payment_channel` field
- Check webhook is using latest code
- Restart admin server

---

### Issue: Back button still works during processing

**Check:**
- Lines 388-390 in `payment.tsx`
- `processing` state should be `true`

**Fix:**
```typescript
<TouchableOpacity
  style={[styles.backButton, processing && styles.backButtonDisabled]}
  onPress={() => !processing && router.back()}
  disabled={processing}  // ✅ Must have this
>
```

---

### Issue: Customer info missing in ledger

**Check:**
- Webhook lines 66-68
- Xendit metadata includes customer info

**Fix:**
- Invoice creation (line 256-258 in `payment.tsx`) sends:
  - `customerEmail`
  - `customerName`
  - `customerPhone`

---

## ✅ Success Criteria Checklist

After testing, all these should be ✅:

### Payment Flow
- [ ] ✅ Tap "Proceed to Checkout" → Xendit opens
- [ ] ✅ Payment screen shows "Waiting for payment confirmation..."
- [ ] ✅ Back button is disabled (grayed out)
- [ ] ✅ Complete payment in Xendit
- [ ] ✅ Return to app → OrderCompleteModal appears automatically
- [ ] ✅ Modal has 2 buttons: Track Store, Back to Home
- [ ] ❌ Modal does NOT have "Give Feedback" button

### Database
- [ ] ✅ `orders/{orderId}.paymentStatus = "PAID"`
- [ ] ✅ `orders/{orderId}.paymentMethod = "paymaya"` or `"gcash"` (not "EWALLET")
- [ ] ✅ `ledgers/.../method = "paymaya"` or `"gcash"` (not "EWALLET")
- [ ] ✅ `ledgers/.../customerName` exists
- [ ] ✅ `ledgers/.../customerEmail` exists
- [ ] ✅ `ledgers/.../customerPhone` exists

### Display
- [ ] ✅ Customer order-details shows "PayMaya" or "GCash" with icon
- [ ] ✅ Store owner orders shows "PayMaya" or "GCash"
- [ ] ✅ Sales history filter by PayMaya/GCash works
- [ ] ✅ Admin transaction summary shows colored badge
- [ ] ✅ Admin transaction management shows logo

### Pickup Flow
- [ ] ✅ Change status to "picked_up" in Firebase
- [ ] ✅ OrderProcessCompleteModal appears automatically
- [ ] ✅ Modal has 3 buttons: Track Store, Feedback, Back to Home
- [ ] ✅ "Give Feedback" button works

---

## 📊 Expected Console Logs

### During Payment:
```
Xendit invoice created: XNDT-INV-2025-001234
[Payment] Listener fired for orderId: -Oe8TE5MO...
[Payment] Order paymentStatus: pending
```

### After Payment Completes:
```
[Payment] Listener fired for orderId: -Oe8TE5MO...
[Payment] Order paymentStatus: PAID
[Payment] Payment confirmed! Showing modal...
```

### Admin Terminal (Webhook):
```
[Webhook] Received POST, token: present expected: set
[Webhook] Processing invoice: XNDT-INV-2025-001234 status: PAID orderNumber: ORD-2025-001234
[Webhook] Normalizing payment method: PAYMAYA → paymaya
```

---

## 🎯 Final Verification

If ALL checklist items are ✅, then:

✅ **Payment flow is working correctly**
✅ **Modal system is correct** (2 buttons after payment, 3 after pickup)
✅ **Payment method normalization is working**
✅ **Customer info is saved correctly**
✅ **All screens display payment methods correctly**

---

## 📝 Test Summary Template

After testing, fill this out:

```
Test Date: _____________
Tester: _____________

Payment Flow Test:
- Payment completed: ✅ / ❌
- Modal appeared: ✅ / ❌
- Modal had 2 buttons (not 3): ✅ / ❌
- Track Store worked: ✅ / ❌

Database Verification:
- paymentMethod normalized: ✅ / ❌
- Customer info saved: ✅ / ❌

Display Verification:
- Order details shows correctly: ✅ / ❌
- Admin dashboard shows correctly: ✅ / ❌

Pickup Flow Test:
- Pickup modal appeared: ✅ / ❌
- Feedback button present: ✅ / ❌

Issues Found:
_________________________________
_________________________________

Overall Status: PASS / FAIL
```

---

**Good luck with testing!** 🚀

If everything works as documented, you have a fully functional payment system with proper modal flow!
