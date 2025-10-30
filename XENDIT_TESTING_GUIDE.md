# Xendit Sandbox Testing Guide for TindaGo

This guide will walk you through testing Xendit payments in your TindaGo app using **TEST MODE** (completely FREE).

---

## 📋 **Pre-Testing Checklist**

Before testing, make sure you've completed:

- ✅ Signed up for Xendit account
- ✅ Copied TEST API keys to `.env` file
- ✅ Installed `xendit-node` package (`npm install xendit-node`)
- ✅ Xendit service file created (`src/services/payment/XenditService.ts`)
- ✅ Payment screen updated with Xendit integration

---

## 🧪 **Test Mode: How It Works**

### **Sandbox Environment**
```
Customer pays ₱100 (fake transaction)
  ↓
Xendit creates invoice (test mode)
  ↓
Customer pays with TEST payment method
  ↓
Xendit auto-splits:
  ├─ ₱1 (1%) → Admin Wallet (simulated)
  └─ ₱99 → Store Wallet (simulated)
  ↓
TOTAL COST: ₱0 (Completely FREE!)
```

---

## 🚀 **Step-by-Step Testing Process**

### **Step 1: Start Your App**

```bash
# Open terminal in TindaGo folder
cd C:\CapsProj\TindaGo

# Start Expo development server
npx expo start

# Choose your platform:
# Press 'a' for Android emulator
# Press 'i' for iOS simulator
# Press 'w' for web browser
# Or scan QR code with Expo Go app
```

Wait for app to load on your device/emulator.

---

### **Step 2: Create Test Order**

1. **Sign in** to your app (as customer)

2. **Browse products** and add items to cart

3. **Go to Cart** screen

4. **Click "Proceed to Payment"**

5. **On Payment Screen:**
   - You'll see order summary (no tax)
   - Subtotal = Total (simple!)

---

### **Step 3: Select Payment Method**

**Choose one of these options:**

#### **Option A: GCash Test Payment**
- Select **"GCash"** payment method
- Click **"Proceed to Checkout"**

#### **Option B: PayMaya Test Payment**
- Select **"PayMaya"** payment method
- Click **"Proceed to Checkout"**

#### **Option C: Cash on Pickup** (skips Xendit)
- Select **"Cash on Pickup"**
- Order created immediately without online payment

---

### **Step 4: Xendit Payment Page Opens**

When you select GCash/PayMaya:

1. **App will open your browser** with Xendit payment page

2. **You'll see:**
   ```
   ┌─────────────────────────────┐
   │  TindaGo Invoice            │
   ├─────────────────────────────┤
   │  Order: ORD-2025-XXX        │
   │  Amount: ₱100.00            │
   │                             │
   │  [Pay with GCash]           │
   │  [Pay with PayMaya]         │
   └─────────────────────────────┘
   ```

3. **The invoice shows:**
   - Order items
   - Total amount
   - Available payment methods
   - **NO commission shown** (hidden from customer)

---

### **Step 5: Complete Test Payment**

#### **Using Xendit Test Mode:**

**Method 1: Auto-Payment in Dashboard**
1. Keep the invoice page open
2. Open **Xendit Dashboard** in another tab
3. Go to **"Invoices"** section
4. Find your invoice (should say "PENDING")
5. Click **"..."** menu → **"Simulate Payment"**
6. Invoice status changes to **"PAID"**

**Method 2: Test Payment Methods**

Xendit provides test credentials:

**For GCash Test:**
```
Phone Number: 09123456789 (any test number)
OTP Code: 123456
```

**For PayMaya Test:**
```
Card Number: 4000 0000 0000 0002
Expiry: 12/25
CVV: 123
Name: TEST USER
```

**For Test Credit Card:**
```
Card Number: 4000 0000 0000 0002 (Visa - Success)
Expiry: Any future date
CVV: Any 3 digits
```

---

### **Step 6: Return to App**

After completing payment in browser:

1. **Return to TindaGo app**

2. **You'll see an alert:**
   ```
   "Payment Page Opened"

   Complete your payment in the browser
   that just opened. Once paid, return to
   the app to see your order.

   [I Completed Payment]  [Cancel]
   ```

3. **Click "I Completed Payment"**

4. **Order Success Modal appears!** 🎉
   - Shows order number
   - Cart is cleared
   - Order created in Firebase

---

## 📊 **What Happens Behind the Scenes**

### **Customer Side:**
```
1. Selects GCash/PayMaya
2. App calls Xendit API
3. Xendit invoice created
4. Browser opens with payment page
5. Customer completes payment
6. Returns to app
7. Order confirmed
```

### **Database Side:**
```javascript
Order created in Firebase:
{
  orderNumber: "ORD-2025-1234567890",
  total: 100,
  platformCommission: 1,        // ₱1 (1% of ₱100)
  storeAmount: 99,               // ₱99 (99% to store)
  xenditInvoiceId: "invoice_123",
  paymentMethod: "gcash",
  paymentStatus: "pending" → "paid",
  status: "pending"
}
```

### **Commission Split:**
```
Customer Paid:     ₱100
  ↓
Xendit Auto-Split:
  ├─ Platform (1%):  ₱1   → Admin Wallet
  └─ Store Owner:    ₱99  → Store Wallet

Commission deducted automatically!
```

---

## 🔍 **Verify Payment in Xendit Dashboard**

1. **Go to:** https://dashboard.xendit.co (make sure you're in **TEST MODE**)

2. **Navigate to "Invoices"**

3. **Find your invoice:**
   - Search by order number (e.g., "ORD-2025-XXX")
   - Status should be **"PAID"** or **"SETTLED"**

4. **Click on the invoice to see details:**
   ```
   Amount: ₱100.00
   Status: PAID

   Platform Fee: ₱1.00 (1%)
   Store Receives: ₱99.00

   Payment Method: GCash
   Paid At: [timestamp]
   ```

5. **Commission is automatically deducted!** 🎉

---

## 🐛 **Troubleshooting Common Issues**

### **Issue 1: "Cannot connect to Xendit" Error**

**Solutions:**
1. Check `.env` file has correct API key
2. Make sure key starts with `xnd_development_`
3. Restart Expo server (`npx expo start --clear`)
4. Check internet connection

---

### **Issue 2: Payment Page Doesn't Open**

**Solutions:**
1. Check if browser/linking is blocked
2. Try in Expo Go app instead of simulator
3. Check console for errors: `npx expo start --tunnel`

---

### **Issue 3: Invoice Not Found in Dashboard**

**Solutions:**
1. Make sure you're in **TEST MODE** (not Live Mode)
2. Wait 10-15 seconds for invoice to appear
3. Refresh dashboard page
4. Check "All Invoices" filter (not just "Paid")

---

### **Issue 4: Commission Not Calculated**

**Solutions:**
1. Check `.env` has: `EXPO_PUBLIC_PLATFORM_COMMISSION_RATE=0.01`
2. Restart app after changing `.env`
3. Check Xendit service console logs
4. Verify in dashboard under invoice details

---

## 📱 **Testing on Different Platforms**

### **Android Emulator**
```bash
npx expo start
Press 'a'
```
- Opens browser within emulator
- Can test GCash/PayMaya
- Best for full testing

### **iOS Simulator**
```bash
npx expo start
Press 'i'
```
- Opens Safari
- Test credit card works best
- GCash/PayMaya may have issues (use dashboard simulation)

### **Physical Device (Expo Go)**
```bash
npx expo start
Scan QR code with Expo Go app
```
- Real phone/tablet
- Most realistic testing
- Can use actual GCash app (test mode still!)

### **Web Browser**
```bash
npx expo start
Press 'w'
```
- Opens in Chrome/Firefox/Safari
- Good for quick testing
- Linking to external URL works well

---

## ✅ **Testing Checklist**

Use this checklist to ensure everything works:

### **GCash Payment:**
- [ ] Select GCash payment method
- [ ] Invoice created successfully
- [ ] Browser opens with Xendit page
- [ ] Payment page shows correct amount
- [ ] Can complete test payment
- [ ] Return to app shows success
- [ ] Order appears in Firebase
- [ ] Commission calculated correctly (1%)

### **PayMaya Payment:**
- [ ] Select PayMaya payment method
- [ ] Invoice created successfully
- [ ] Browser opens with Xendit page
- [ ] Payment page shows correct amount
- [ ] Can complete test payment
- [ ] Return to app shows success
- [ ] Order appears in Firebase
- [ ] Commission calculated correctly (1%)

### **Cash on Pickup:**
- [ ] Select Cash on Pickup
- [ ] Order created immediately (no Xendit)
- [ ] No browser opens
- [ ] Success modal appears
- [ ] Order appears in Firebase
- [ ] No commission deducted (cash payment)

### **Commission Verification:**
- [ ] Check Xendit dashboard invoice
- [ ] Platform Fee shows ₱1 (for ₱100 order)
- [ ] Store Amount shows ₱99
- [ ] Commission rate is 1%
- [ ] Math is correct: total × 0.01 = commission

---

## 📊 **Test Data Examples**

### **Example Order 1: Small Order**
```
Items: ₱50
Commission (1%): ₱0.50
Store Receives: ₱49.50
```

### **Example Order 2: Medium Order**
```
Items: ₱500
Commission (1%): ₱5.00
Store Receives: ₱495.00
```

### **Example Order 3: Large Order**
```
Items: ₱2,000
Commission (1%): ₱20.00
Store Receives: ₱1,980.00
```

---

## 🎓 **For Capstone Demo**

When demonstrating to professors:

1. **Show the customer flow:**
   - Browse products
   - Add to cart
   - Checkout with GCash/PayMaya
   - Invoice page opens
   - Payment completed
   - Order confirmed

2. **Show the Xendit dashboard:**
   - Invoice created
   - Payment received
   - **Commission automatically deducted** (1%)
   - Store owner receives 99%

3. **Show the Firebase data:**
   - Order with commission details
   - `platformCommission: 1`
   - `storeAmount: 99`
   - `xenditInvoiceId: "xxx"`

4. **Explain the business model:**
   - No subscription fees
   - Pure commission-based (1%)
   - Fair for sari-sari stores
   - Automated by Xendit
   - FREE in test mode for capstone

---

## 📚 **Additional Resources**

- **Xendit API Docs:** https://developers.xendit.co/api-reference/
- **Xendit Dashboard:** https://dashboard.xendit.co
- **Test Cards:** https://developers.xendit.co/api-reference/#test-mode
- **Support:** https://help.xendit.co/

---

## 🎉 **Success Criteria**

You've successfully integrated Xendit when:

✅ GCash payment works in test mode
✅ PayMaya payment works in test mode
✅ Invoice appears in Xendit dashboard
✅ 1% commission calculated automatically
✅ Store owner receives 99% of payment
✅ Orders saved to Firebase with commission data
✅ Payment status updates correctly
✅ Cart clears after successful payment
✅ All of this is **100% FREE** in test mode!

---

**Last Updated:** January 2025
**Xendit SDK Version:** Latest
**Commission Rate:** 1%
**Cost:** FREE (Sandbox/Test Mode)
