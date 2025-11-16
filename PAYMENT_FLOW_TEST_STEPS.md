# 🧪 Payment Flow Test - Step-by-Step Guide

**Purpose:** Verify complete payment flow with stock deduction and order tracking
**Date:** 2025-01-16
**Tester:** _________________
**Status:** ⬜ PASS / ⬜ FAIL

---

## 📋 Pre-Test Setup

### 1. Start Admin Server
```powershell
cd C:\CapsProj\tindago-admin
npm run dev
```
**✅ Verify:** Console shows "Ready on http://localhost:3000"

### 2. Start Mobile App
```powershell
cd C:\CapsProj\TindaGo
npx expo start --clear
```
**✅ Verify:** QR code appears, scan with Expo Go app

### 3. Open Firebase Console
- URL: https://console.firebase.google.com
- Select: TindaGo project
- Open: Realtime Database tab
- Keep this browser tab open for monitoring

---

## 📱 Test 1: Complete Payment Flow (GCash/PayMaya)

### Step 1: Prepare Test Product ✅
**As Store Owner:**

1. Open TindaGo app
2. Log in as **Store Owner**
3. Go to **Profile → Store Product**
4. Pick a product to test (note its current stock)
5. Record:
   - Product Name: _________________
   - Current Stock: _____ units
   - Price: ₱_______

**✅ Checkpoint:** You know the product and its stock level

---

### Step 2: Add to Cart ✅
**As Customer:**

1. Log out from store owner
2. Log in as **Customer** account
3. Browse stores → Find the store owner's store
4. Find the test product
5. Tap "Add to Cart"
6. Add quantity: **2 units**
7. Go to Cart screen

**✅ Verify:**
- ⬜ Cart shows 2 units of the product
- ⬜ Subtotal calculated correctly
- ⬜ Stock badge shows current stock level

---

### Step 3: Navigate to Payment ✅

1. In Cart, tap **"Checkout"**
2. Confirm you're on Payment screen

**✅ Verify Payment Screen Shows:**
- ⬜ Item count
- ⬜ Sub Total
- ⬜ Total amount
- ⬜ Payment method options (GCash, PayMaya, Cash)

---

### Step 4: Select Payment Method ✅

1. Select **GCash** or **PayMaya**
2. Tap **"Proceed to Checkout"**

**✅ Verify Immediately:**
- ⬜ Button shows loading spinner
- ⬜ Browser opens with Xendit page (or console shows Xendit URL)

**Console Log Should Show:**
```
Xendit invoice created: XNDT-INV-...
```

---

### Step 5: Processing State (CRITICAL TEST) ⚠️

**After tapping "Proceed to Checkout", the app should show:**

```
🔄 [Spinner Animation]
Waiting for payment confirmation...

Please complete your payment in the browser.
This screen will update automatically.
```

**✅ Verify UI State:**
- ⬜ Processing message visible
- ⬜ Spinner is animating
- ⬜ Back button is GRAYED OUT (disabled)
- ⬜ Cannot navigate away from screen
- ⬜ Payment method selector is disabled

**Console Logs:**
```
[Payment] Listener fired for orderId: -Oe8TE5MO...
[Payment] Order paymentStatus: pending
```

**✅ CRITICAL:** You CANNOT leave this screen (back button disabled)

---

### Step 6: Complete Payment in Xendit ✅

**In Browser (Xendit Test Page):**

#### For GCash:
1. Select "E-Wallets"
2. Select "GCash"
3. Enter test mobile: `09171234567`
4. Click "Pay"
5. Enter OTP: `123456`
6. Click "Confirm"

#### For PayMaya:
1. Select "E-Wallets"
2. Select "PayMaya"
3. Enter test email: `test@paymaya.com`
4. Enter test number: `+639171234567`
5. Click "Pay"
6. Click "Success" on test page

**✅ Verify:**
- ⬜ Xendit shows "Payment Successful" page

---

### Step 7: Return to App (AUTOMATIC MODAL) ✅

**Switch back to TindaGo app (or wait if already there)**

**⏱️ Within 1-3 seconds, modal should appear automatically:**

```
┌─────────────────────────────────┐
│        ✅ [Checkmark Icon]      │
│                                 │
│  Thank you for your order!      │
│                                 │
│  Your order has been placed     │
│  successfully. Your order ID is │
│  #ORD-2025-001234               │
│                                 │
│  ┌─────────────────────────┐   │
│  │     Track Store         │   │
│  └─────────────────────────┘   │
│                                 │
│  ┌─────────────────────────┐   │
│  │     Back to Home        │   │
│  └─────────────────────────┘   │
└─────────────────────────────────┘
```

**✅ Verify Modal Has:**
- ⬜ "Thank you for your order!" message
- ⬜ Order ID displayed (e.g., #ORD-2025-001234)
- ⬜ **2 buttons ONLY**: "Track Store" and "Back to Home"
- ⬜ **NO** "Give Feedback" button (too early!)

**Console Logs:**
```
[Payment] Listener fired for orderId: -Oe8TE5MO...
[Payment] Order paymentStatus: PAID
[Payment] Payment confirmed! Deducting stock...
[📦 Stock] Product -Abc123: 10 → 8
[Payment] Payment confirmed! Showing modal...
```

---

### Step 8: Verify Stock Deduction ✅

**In Firebase Console:**

1. Navigate to: `Realtime Database → products → [productId]`
2. Check the `quantity` field

**✅ Verify:**
- ⬜ Stock reduced by 2 units
- ⬜ If stock was 10, now shows 8
- ⬜ `updatedAt` timestamp is recent
- ⬜ If stock = 0, `status` changed to "out_of_stock"

**Record:**
- Previous Stock: _____ units
- New Stock: _____ units
- Deducted: _____ units ✅

---

### Step 9: Check Store Owner Side ✅

**As Store Owner:**

1. Log out from customer account
2. Log in as **Store Owner**
3. Go to **Profile → Store Product**
4. **Pull down to refresh** (swipe down on screen)
5. Find the test product

**✅ Verify:**
- ⬜ Stock shows the reduced number (e.g., 8 instead of 10)
- ⬜ Product card reflects new stock level
- ⬜ If low stock (< 10), shows orange badge
- ⬜ If out of stock (0), shows red badge

---

### Step 10: Check Order in Firebase ✅

**In Firebase Console:**

Navigate to: `orders → [orderId]`

**✅ Verify Order Data:**
```json
{
  "orderNumber": "ORD-2025-001234",
  "paymentStatus": "PAID",           ✅
  "paymentMethod": "gcash",          ✅ (or "paymaya")
  "xenditInvoiceId": "XNDT-INV-...",
  "total": 350.50,
  "status": "preparing",
  "items": [
    {
      "productId": "-Abc123",
      "quantity": 2,
      "price": 175.25
    }
  ]
}
```

**✅ Verify Ledger Entry:**
Navigate to: `ledgers/stores/[storeId]/transactions/[invoiceId]`

```json
{
  "invoiceId": "XNDT-INV-...",
  "orderNumber": "ORD-2025-001234",
  "amount": 350.50,
  "status": "PAID",
  "method": "gcash",                 ✅ (not "EWALLET")
  "customerName": "John Doe",        ✅
  "customerEmail": "john@test.com",  ✅
  "customerPhone": "+639123456789",  ✅
  "commission": 17.53,
  "storeAmount": 332.97,
  "paidAt": "2025-01-16T..."
}
```

**✅ Record:**
- Order ID: _________________
- Payment Method: _________________
- Total: ₱_______
- Commission: ₱_______
- Store Amount: ₱_______

---

## 📱 Test 2: Cash on Pickup Flow

### Step 11: Test Cash Payment ✅

**As Customer:**

1. Add the same product to cart (2 units)
2. Go to Cart → Checkout → Payment
3. Select **"Cash on Pickup"**
4. Tap "Proceed to Checkout"

**✅ Verify:**
- ⬜ OrderCompleteModal appears **immediately** (no waiting)
- ⬜ Modal shows order ID
- ⬜ Has 2 buttons: Track Store, Back to Home

**✅ Verify Stock Deduction (Cash):**
- ⬜ Check Firebase: Stock reduced immediately
- ⬜ Store owner can pull-to-refresh to see update

---

## 📱 Test 3: Order Tracking

### Step 12: Test Track Store Button ✅

1. In OrderCompleteModal, tap **"Track Store"**

**✅ Verify Track Store Screen:**
- ⬜ Shows order ID in URL: `?orderId=-Oe8TE5MO...`
- ⬜ Displays order status (preparing/ready/picked_up)
- ⬜ Shows store location on map
- ⬜ Displays order items and total
- ⬜ Real-time status updates work

---

### Step 13: Simulate Order Completion ✅

**In Firebase Console:**

1. Navigate to: `orders/[orderId]`
2. Change `status` from "preparing" to **"picked_up"**
3. Click "Save"

**In Mobile App (Customer Order Details):**

1. Go to: **Orders → [Your Order]**
2. Wait 1-2 seconds

**✅ Verify Different Modal Appears:**

```
┌─────────────────────────────────┐
│        🎉 [Celebration Icon]    │
│                                 │
│  Order Process Complete!        │
│                                 │
│  Thank you for your order!      │
│  We hope you enjoyed our service│
│                                 │
│  ┌─────────────────────────┐   │
│  │     Track Store         │   │
│  └─────────────────────────┘   │
│                                 │
│  ┌─────────────────────────┐   │
│  │   Give Feedback Now     │   │  ← NOW IT APPEARS!
│  └─────────────────────────┘   │
│                                 │
│  ┌─────────────────────────┐   │
│  │     Back to Home        │   │
│  └─────────────────────────┘   │
└─────────────────────────────────┘
```

**✅ Verify:**
- ⬜ Shows "Order Process Complete!" message
- ⬜ **3 buttons**: Track Store, Give Feedback Now, Back to Home
- ⬜ "Give Feedback" button is present (only after pickup)

---

## ✅ Final Checklist

### Payment Flow
- ⬜ Xendit payment page opens
- ⬜ Processing screen shows with disabled back button
- ⬜ Payment completes in Xendit
- ⬜ Modal appears automatically within 3 seconds
- ⬜ Modal has 2 buttons (no feedback yet)
- ⬜ Cash payment works immediately

### Stock Management
- ⬜ Stock validated before payment
- ⬜ Stock deducted after payment confirmed
- ⬜ Store owner sees update via pull-to-refresh
- ⬜ Out-of-stock products show red badge
- ⬜ Low-stock products show orange badge

### Database
- ⬜ Order created with correct data
- ⬜ `paymentStatus` = "PAID"
- ⬜ `paymentMethod` = "gcash" or "paymaya" (not "EWALLET")
- ⬜ Ledger has customer info (name, email, phone)
- ⬜ Ledger shows commission breakdown

### Order Tracking
- ⬜ Track Store screen works
- ⬜ Shows real order data
- ⬜ Real-time status updates work
- ⬜ After pickup, feedback modal appears

---

## 🐛 Issues Found

Record any issues here:

| Issue | Screen | Severity | Notes |
|-------|--------|----------|-------|
| | | ⬜ Critical / ⬜ Major / ⬜ Minor | |
| | | ⬜ Critical / ⬜ Major / ⬜ Minor | |
| | | ⬜ Critical / ⬜ Major / ⬜ Minor | |

---

## 📊 Test Summary

**Test Date:** 2025-01-16  
**Test Duration:** _____ minutes  
**Tester:** _________________

**Results:**
- Payment Flow: ⬜ PASS / ⬜ FAIL
- Stock Deduction: ⬜ PASS / ⬜ FAIL
- Database Verification: ⬜ PASS / ⬜ FAIL
- Order Tracking: ⬜ PASS / ⬜ FAIL

**Overall Status:** ⬜ PASS / ⬜ FAIL

**Notes:**
_____________________________________________
_____________________________________________
_____________________________________________

---

## 📸 Screenshots to Take

Capture these for documentation:

1. ⬜ Cart screen with items
2. ⬜ Payment screen with methods
3. ⬜ Processing screen (waiting message)
4. ⬜ Xendit payment page
5. ⬜ OrderCompleteModal (2 buttons)
6. ⬜ Firebase: Order with paymentStatus=PAID
7. ⬜ Firebase: Product with reduced stock
8. ⬜ Store owner: Updated stock in product list
9. ⬜ Track Store screen
10. ⬜ OrderProcessCompleteModal (3 buttons after pickup)

---

## 🎯 Success Criteria

**All these must be TRUE:**
- ✅ Payment completes successfully
- ✅ Modal appears automatically (no manual refresh)
- ✅ Modal has correct number of buttons (2 after payment, 3 after pickup)
- ✅ Stock deducts correctly in Firebase
- ✅ Store owner can see updated stock via pull-to-refresh
- ✅ Order data saved correctly with normalized payment method
- ✅ Ledger has customer information
- ✅ Track Store works with real-time updates
- ✅ No errors in console
- ✅ User cannot leave processing screen (back disabled)

---

**If all criteria met → Payment flow is production-ready! 🚀**
