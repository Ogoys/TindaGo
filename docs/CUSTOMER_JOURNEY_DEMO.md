# 🎬 TindaGo Customer Journey Demo
## From Registration to Payment - Complete Walkthrough

---

## 📱 Overview

This guide demonstrates the **complete customer experience** from creating an account to placing an order with payment (including Pay Later with debt reminders).

**Total Time:** ~5-10 minutes  
**Prerequisites:** App running in Expo, Firebase configured

---

## 🚀 Step-by-Step Demo

### **STEP 1: Customer Registration** 📝

**Screen:** `app/(auth)/register.tsx`

#### What Customer Does:
1. Opens the app
2. Taps "Sign up" (or navigates to register screen)
3. Fills in registration form:
   - **Name:** "Juan Dela Cruz"
   - **Email:** "juan@example.com"
   - **Password:** "password123"
   - **User Type:** Select "Customer" (NOT store owner)
   - **Terms:** Check "I accept..."
4. Taps "Sign up" button

#### What Happens Behind the Scenes:
```typescript
// Creates Firebase Auth account
const userCredential = await createUserWithEmailAndPassword(auth, email, password);

// Saves customer data to database
await set(ref(database, `users/${user.uid}`), {
  uid: user.uid,
  name: "Juan Dela Cruz",
  email: "juan@example.com",
  userType: 'customer',
  emailVerified: false,
  profile: { avatar: null, phone: null, address: null },
  preferences: { notifications: true, theme: 'light' }
});

// Sends verification email
await sendEmailVerification(user);
```

#### Customer Sees:
- Alert: "Account Created! We've sent a verification email..."
- Options: "Open Email App" or "I'll Check Later"

---

### **STEP 2: Email Verification** ✉️

**Screen:** `app/(auth)/verify-email-code.tsx`

#### What Customer Does:
1. Opens email inbox (Gmail, Yahoo, etc.)
2. Finds "Verify your email" email from TindaGo
3. Clicks verification link in email
4. Returns to app
5. Taps "Continue" (or app auto-detects verification)

#### What Happens:
```typescript
// Firebase marks email as verified
user.emailVerified = true

// App checks verification status
await user.reload();
if (user.emailVerified) {
  // Navigate to home screen
  router.push('/(main)/(customer)/home');
}
```

#### Customer Sees:
- ✅ "Email verified successfully!"
- Automatically navigated to **Home Screen**

---

### **STEP 3: Home Screen - Browse Products** 🏠

**Screen:** `app/(main)/(customer)/home.tsx`

#### What Customer Sees:
1. **Header Section:**
   - Profile picture
   - Location: "Getting location..." → "Km. 12, Buhangin, Davao City"
   - Notification bell
   - Search bar

2. **Category Carousel:**
   - Food, Beverages, Snacks, etc. (horizontal scroll)

3. **Product Sections:**
   - 🔥 **Best Selling** - Top 8 products (sorted by recent)
   - 🏪 **Featured Stores** - 4 nearby stores with ratings
   - ⭐ **Most Popular Picks** - 8 diverse products
   - 🆕 **Fresh Finds** - 8 newest products

4. **Bottom Navigation:**
   - Home, Stores, Orders, Profile

#### What Customer Does:
1. Scrolls through home screen
2. Sees products from various stores
3. Can tap on:
   - **Product Card** → View product details
   - **Store Card** → View store and all its products
   - **Category** → Filter by category
   - **Search** → Search for specific items

---

### **STEP 4: View Store Details** 🏪

**Screen:** `app/(main)/shared/store-details.tsx`

#### What Customer Does:
1. Taps on a store card (e.g., "Sari-Sari ni Maria")
2. Views store page

#### What Customer Sees:
- Store banner/cover image
- Store logo and name
- Rating: ⭐ 4.5 (12 reviews)
- Store description
- **All Products from This Store:**
  - Product grid (2 columns)
  - Each product shows image, name, price, stock
  - "Add to Cart" button on each product

#### Available Actions:
- Browse store products
- Add products to cart (quick add)
- View individual product details
- Read store reviews
- Check store operating hours

---

### **STEP 5: View Product Details** 📦

**Screen:** `app/(main)/shared/product-details.tsx`

#### What Customer Does:
1. Taps on a product (e.g., "Lucky Me Instant Noodles")
2. Views detailed product page

#### What Customer Sees:
- Large product image
- Product name: "Lucky Me Instant Noodles"
- Price: ₱15.00
- Size/Weight: "55g"
- Description: "Delicious chicken flavor instant noodles"
- Stock: "25 available"
- Store name: "Sari-Sari ni Maria"
- Quantity selector: +/- buttons (starts at 1)
- **"Add to Cart" button**

#### What Customer Does:
1. Adjusts quantity (e.g., 5 packs)
2. Taps "Add to Cart"

#### What Happens:
```typescript
// Validates stock
if (quantity > product.quantity) {
  Alert.alert("Out of Stock", "Only X items available");
  return;
}

// Adds to cart
await addToCartWithValidation(userId, {
  productId: product.id,
  productName: product.productName,
  price: product.price,
  quantity: 5,
  storeId: product.storeId,
  storeName: product.storeName,
  productImage: product.productImageUrl,
});
```

#### Customer Sees:
- Toast: "✅ Lucky Me added to cart!"
- Cart badge updates: (0) → (5)

---

### **STEP 6: Add More Products** 🛒

#### What Customer Does:
1. Continues shopping
2. Adds more items from **SAME store**:
   - 2x "Sky Flakes Crackers" - ₱30.00
   - 3x "C2 Green Tea" - ₱20.00
   - 1x "Lucky Me Cup Noodles" - ₱25.00

**Important:** All items must be from the same store for one order.

#### Cart Now Contains:
```
Store: Sari-Sari ni Maria
--------------------------
5x Lucky Me Noodles    ₱75.00
2x Sky Flakes          ₱60.00
3x C2 Green Tea        ₱60.00
1x Cup Noodles         ₱25.00
--------------------------
Subtotal:             ₱220.00
```

---

### **STEP 7: View Cart** 🛒

**Screen:** `app/(main)/(customer)/cart.tsx`

#### What Customer Does:
1. Taps cart icon (with badge showing "11")
2. Reviews cart items

#### What Customer Sees:
- **Store Header:** "Sari-Sari ni Maria"
- **Cart Items List:**
  - Each item with image, name, price, quantity
  - Can adjust quantity (+/-)
  - Can remove items (trash icon)

- **Order Summary Card:**
  ```
  Subtotal:      ₱220.00
  Discount:      ₱0.00
  ----------------
  Grand Total:   ₱220.00
  ```

- **"Proceed to Checkout" button** (green)

#### What Customer Does:
1. Reviews items
2. Adjusts quantities if needed
3. Taps "Proceed to Checkout"

---

### **STEP 8: Payment Screen** 💳

**Screen:** `app/(main)/(customer)/payment.tsx`

#### What Customer Sees:
1. **Order Summary:**
   ```
   Items: 11
   Subtotal: ₱220.00
   Discount: ₱0.00
   Grand Total: ₱220.00
   ```

2. **Payment Method Selection:**
   - 📱 **GCash** (online payment)
   - 💳 **PayMaya** (online payment)
   - 💵 **Cash on Pickup**
   - 🏦 **Pay Later** (debt payment)

3. **Each Payment Method Shows:**
   - Icon
   - Name
   - Description
   - Radio button (select one)

---

### **STEP 9A: Scenario - Pay Later (Debt Payment)** 🏦

**This demonstrates the debt reminder feature!**

#### What Customer Does:
1. Selects "Pay Later" payment method
2. Sees **"Select Due Date" button**
3. Taps to open calendar
4. Selects due date (e.g., 7 days from now)
5. Sees due date: "Dec 7, 2025"

#### What Customer Sees:
- Store debt settings info:
  ```
  💡 This store allows Pay Later up to 30 days
  📅 Reminder will be sent 3 days before due date
  ```

#### What Customer Does:
1. Reviews order one last time
2. Taps **"Place Order"** button

#### What Happens Behind the Scenes:
```typescript
// 1. Creates order in Firebase
const orderId = await createOrder({
  orderNumber: "ORD-2025-1234567890",
  customerId: user.id,
  storeId: "store123",
  items: [...cartItems],
  total: 220.00,
  paymentMethod: "Pay Later",
  paymentStatus: "unpaid",
  isDebtPayment: true,
  debtDueDate: "2025-12-07T23:59:59Z",
  debtStatus: "pending",
});

// 2. Schedules local notifications on customer's device
await DebtReminderScheduler.scheduleReminders({
  orderId: orderId,
  storeId: "store123",
  storeName: "Sari-Sari ni Maria",
  dueDate: "2025-12-07T23:59:59Z",
  reminderDaysBefore: 3, // From store settings
});

// Schedules 4 notifications:
// - Dec 4, 9:00 AM: "Payment due in 3 days"
// - Dec 5, 9:00 AM: "Payment due in 2 days!"
// - Dec 6, 9:00 AM: "Payment due in 1 day!"
// - Dec 7, 9:00 AM: "Payment due TODAY!"

// 3. Deducts stock for each product
for (item of cartItems) {
  await runTransaction(productRef, (product) => {
    product.quantity -= item.quantity;
    product.status = product.quantity === 0 ? 'out_of_stock' : 'available';
    return product;
  });
}

// 4. Clears cart
await clearCart(user.id);
```

#### Customer Sees:
- ✅ **Success Modal:**
  ```
  🎉 Order Placed Successfully!
  
  Order #ORD-2025-1234567890
  
  Your Pay Later order has been placed.
  Payment due: Dec 7, 2025
  
  You'll receive reminders before the due date.
  
  [View Order Details]  [Continue Shopping]
  ```

---

### **STEP 9B: Scenario - Online Payment (GCash/PayMaya)** 💳

#### What Customer Does:
1. Selects "GCash" (or "PayMaya")
2. Reviews order
3. Taps **"Place Order"** button

#### What Happens:
```typescript
// 1. Creates order in Firebase first
const orderId = await createOrder({...orderData});

// 2. Creates Xendit payment invoice
const paymentResponse = await xenditService.createPayment({
  orderId: orderId,
  amount: 220.00,
  customerEmail: user.email,
  paymentMethod: "gcash",
});

// 3. Opens payment page in browser
await Linking.openURL(paymentResponse.invoiceUrl);
// Example: https://checkout.xendit.co/web/xyz123
```

#### Customer Experience:
1. **Browser Opens:**
   - Xendit payment page loads
   - Shows order details
   - QR code for GCash app

2. **Customer Pays:**
   - Opens GCash app
   - Scans QR code
   - Enters PIN
   - Confirms payment

3. **Payment Completes:**
   - Xendit webhook notifies TindaGo
   - Order status → "PAID"

4. **Returns to App:**
   - App detects payment success
   - Shows success modal
   - Cart cleared
   - Stock deducted

---

### **STEP 9C: Scenario - Cash on Pickup** 💵

#### What Customer Does:
1. Selects "Cash on Pickup"
2. Reviews order
3. Taps **"Place Order"** button

#### What Happens:
```typescript
// Creates order with pending payment
const orderId = await createOrder({
  ...orderData,
  paymentMethod: "cash",
  paymentStatus: "pending",
});

// Deducts stock immediately
// (prevents double-booking)

// Clears cart
await clearCart(user.id);
```

#### Customer Sees:
- ✅ Success Modal:
  ```
  Order Placed!
  
  Please bring exact cash when picking up:
  ₱220.00
  
  Store: Sari-Sari ni Maria
  Location: [View Map]
  ```

---

### **STEP 10: After Order Placed** ✅

#### Customer Can Now:

1. **View Order Details:**
   - Navigate: Profile → Order History
   - See order status: "Pending" / "Completed"
   - Track payment status

2. **For Pay Later Orders:**
   - Navigate: Profile → Debt History
   - See unpaid debts
   - View due dates
   - Pay online anytime

3. **Receive Notifications:**
   - **Day 1 (3 days before):** 
     ```
     📅 Payment Reminder
     Your Pay Later balance from Sari-Sari ni Maria 
     is due in 3 days.
     ```
   
   - **Day 2 (2 days before):**
     ```
     ⚠️ Payment Due Soon
     Your Pay Later debt from Sari-Sari ni Maria 
     is due in 2 days! Please pay now.
     ```
   
   - **Day 3 (1 day before):**
     ```
     ⚠️ Payment Due Soon
     Your Pay Later debt from Sari-Sari ni Maria 
     is due in 1 day! Please pay now.
     ```
   
   - **Day 4 (due date):**
     ```
     🚨 Payment Due Today
     Your Pay Later debt from Sari-Sari ni Maria 
     is due TODAY! Please pay now to avoid issues.
     ```

4. **Pay Debt Online:**
   - Tap notification → Opens app
   - Navigate to Debt History
   - Tap "Pay Now"
   - Choose GCash/PayMaya
   - Complete payment
   - ✅ All reminders automatically canceled

---

## 🎯 Key Features Demonstrated

### ✅ **Customer Registration & Auth**
- Email/password signup
- Email verification
- Secure authentication

### ✅ **Product Discovery**
- Browse by category
- View featured stores
- Search products
- Real-time product updates

### ✅ **Shopping Cart**
- Add/remove items
- Adjust quantities
- Multi-item orders
- Single-store limitation

### ✅ **Payment Options**
- Online payment (GCash/PayMaya via Xendit)
- Cash on Pickup
- Pay Later (debt payment)

### ✅ **Debt Reminder System** (NEW!)
- Multi-stage notifications (4 reminders)
- Respects store settings
- Local notifications (FREE, no Cloud Functions)
- Auto-cancels when paid

### ✅ **Order Management**
- Order history
- Debt tracking
- Real-time status updates

---

## 📊 Database Changes During Demo

### After Registration:
```json
users/
  {userId}/
    uid: "abc123"
    name: "Juan Dela Cruz"
    email: "juan@example.com"
    userType: "customer"
    emailVerified: true
    pushToken: "ExponentPushToken[xyz...]"
```

### After Adding to Cart:
```json
cart/
  {userId}/
    {productId}: {
      productId: "prod123"
      quantity: 5
      price: 15.00
      ...
    }
```

### After Placing Order:
```json
orders/
  {orderId}/
    orderNumber: "ORD-2025-1234567890"
    customerId: "{userId}"
    storeId: "store123"
    items: [...]
    total: 220.00
    paymentMethod: "Pay Later"
    paymentStatus: "unpaid"
    debtDueDate: "2025-12-07T23:59:59Z"
    debtStatus: "pending"

localReminders/
  {orderId}/
    notificationIds: ["notif1", "notif2", "notif3", "notif4"]
    scheduledAt: "2025-11-30T10:00:00Z"
    dueDate: "2025-12-07T23:59:59Z"
    storeName: "Sari-Sari ni Maria"
```

### After Payment:
```json
orders/
  {orderId}/
    paymentStatus: "PAID"
    debtStatus: "paid"
    debtPaidDate: "2025-12-02T15:30:00Z"

localReminders/
  {orderId}/
    (DELETED - reminders canceled)
```

---

## 🧪 Testing Tips

### Quick Test Orders:

1. **Test Debt Reminders:**
   - Set due date to **tomorrow**
   - Place order
   - Check console: "✅ Local payment reminders scheduled"
   - Wait until tomorrow 9:00 AM
   - Should receive notification

2. **Test Multiple Orders:**
   - Place 3 orders from different stores
   - Each goes to cart separately
   - Can't mix stores in one cart

3. **Test Stock Deduction:**
   - Note product stock before order
   - Place order
   - Check product stock after
   - Should decrease by order quantity

4. **Test Payment Flow:**
   - GCash: Need real payment (use test account)
   - Cash: Instant success
   - Pay Later: Check debt history

---

## 🚨 Common Issues & Solutions

### Issue: "Cannot add to cart - different store"
**Solution:** Cart can only have items from ONE store at a time. Clear cart before adding from new store.

### Issue: "Out of stock"
**Solution:** Product quantity is 0 or status is 'out_of_stock'. Store owner needs to restock.

### Issue: "No push token registered"
**Solution:** User must grant notification permissions. Check Settings → TindaGo → Notifications.

### Issue: "Email not verified"
**Solution:** User must click verification link in email before signing in.

### Issue: "Payment failed"
**Solution:** Check Xendit logs, verify payment credentials, ensure internet connection.

---

## 📝 Summary

**Complete Customer Flow:**
```
Register → Verify Email → Browse Products → 
Add to Cart → Proceed to Checkout → 
Select Payment Method → Place Order → 
Receive Confirmation → Get Reminders (if Pay Later) → 
Pay Debt (if applicable) → Order Complete
```

**Time to Complete:** 5-10 minutes  
**Key Technologies:** Firebase Auth, Realtime Database, Xendit, Expo Notifications  
**Cost:** FREE (no Cloud Functions required for reminders)

---

**Questions?** Follow this demo step-by-step to experience the complete customer journey! 🎉
