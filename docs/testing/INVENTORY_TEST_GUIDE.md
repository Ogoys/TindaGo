# 🧪 Inventory Management - Complete Test Guide

## Overview
This guide will walk you through testing all 13 inventory management features implemented in TindaGo. Follow the steps in order for the best testing experience.

---

## 📋 Prerequisites

### 1. **Start the Development Server**
```powershell
# In your TindaGo directory
cd C:\CapsProj\TindaGo
npx expo start
```

### 2. **Connect Your Device**
- Open Expo Go app on your Android phone
- Scan the QR code from the terminal
- Wait for the app to load

### 3. **Login as Store Owner**
- Use a test store owner account
- Make sure you have some products in your store
- Recommended: Have products with varying stock levels (high, low, out of stock)
- Recommended: Have at least 1-2 products with expired dates

### 4. **Setup Test Data (Optional)**
If you don't have products, create a few with:
- Different stock levels: 50, 5, 0, 15, 2
- Different categories: Beverages, Snacks, Dairy
- Some with expiry dates: past, soon, future

---

## 🎯 Testing Checklist

### Phase 1: Core Inventory Management (6 Features)

#### ✅ Test 1: Stock Validation Before Payment
**Location:** Customer cart → Checkout

**Steps:**
1. Login as a **customer** account (not store owner)
2. Add products to cart
3. Go to cart and tap "Checkout"
4. Choose "Cash" payment method
5. Try to place order

**Expected Results:**
- ✅ If products are in stock → Order created successfully
- ✅ If any product is out of stock → Error message shows
- ✅ Stock is checked in real-time from Firebase before order creation
- ✅ No overselling occurs

**Advanced Test Scenario:**
```
While customer is in checkout, have another person 
(or use a second device) as store owner mark product 
as out of stock. Customer should get error when 
trying to complete order.
```

---

#### ✅ Test 2: Manual Stock Adjustment
**Location:** Store Owner → Profile → Store Product → Product Details

**Steps:**
1. Login as **store owner**
2. Navigate to Profile → Store Product
3. Tap any product to open details modal
4. Look for stock adjustment section

**Expected Results:**
- ✅ See current stock quantity displayed
- ✅ Buttons visible: **-10, -1, +1, +10**
- ✅ Direct input field for setting exact quantity
- ✅ Stock updates in real-time
- ✅ Can't go below 0
- ✅ Changes persist after closing modal

**Test Actions:**
- Tap **+10** → Stock increases by 10
- Tap **-1** → Stock decreases by 1
- Enter **"50"** in input field → Stock sets to 50
- Try entering negative number → Should prevent or default to 0

---

#### ✅ Test 3: Stock Badges on Product Cards
**Location:** Store Owner → Profile → Store Product

**Steps:**
1. Stay in Store Product screen
2. Scroll through your product list
3. Look at the badges on each product card

**Expected Results:**
- ✅ **Green "In Stock"** badge → Products with quantity ≥ 10
- ✅ **Orange "Low Stock"** badge → Products with 1-9 quantity
- ✅ **Red "Out of Stock"** badge → Products with 0 quantity
- ✅ Badges update in real-time when stock changes

**Verify:**
```
Change a product stock to 15 → Badge turns GREEN
Change stock to 5 → Badge turns ORANGE  
Change stock to 0 → Badge turns RED
```

---

#### ✅ Test 4: Stock Filter Tabs
**Location:** Store Owner → Profile → Store Product

**Steps:**
1. Look for filter tabs below categories section
2. Tap each tab: All, In Stock, Low Stock, Out of Stock

**Expected Results:**
- ✅ **All** → Shows all products
- ✅ **In Stock** → Shows only products with ≥10 quantity
- ✅ **Low Stock** → Shows only products with 1-9 quantity
- ✅ **Out of Stock** → Shows only products with 0 quantity
- ✅ Active tab is highlighted
- ✅ Product count updates correctly

**Test Scenario:**
```
If you have 20 products total:
- 12 in stock
- 5 low stock
- 3 out of stock

All tab: 20 products shown
In Stock tab: 12 products shown
Low Stock tab: 5 products shown
Out of Stock tab: 3 products shown
```

---

#### ✅ Test 5: Expired Product Indicators
**Location:** Store Owner → Profile → Store Product

**Steps:**
1. Look for products with expiry dates
2. Check if any are expired (past today's date)

**Expected Results:**
- ✅ Expired products show **red "⚠️ EXPIRED"** badge
- ✅ Badge only visible to store owner (not customers)
- ✅ Badge appears on product card

**Setup for Testing:**
```
If you don't have expired products:
1. Go to Profile → Store Product
2. Tap a product → Edit Product
3. Set expiry date to yesterday
4. Save and check if red badge appears
```

---

#### ✅ Test 6: Auto-Disable Expired Products
**Location:** Store Owner → Home Screen (on app launch)

**Steps:**
1. Ensure you have products with expired dates and status = "available"
2. Force close the TindaGo app completely
3. Reopen the app
4. Login as store owner
5. Watch for alert on home screen

**Expected Results:**
- ✅ Alert popup appears: **"Expired Products Disabled"**
- ✅ Message shows count: "X expired product(s) have been automatically marked as out of stock"
- ✅ Expired products' status changed to "out_of_stock"
- ✅ Customers cannot see or purchase these products

**Verify in Firebase:**
```
Open Firebase Console → Realtime Database → products
Find the expired product → status should = "out_of_stock"
```

---

### Phase 2: Customer Experience (4 Features)

#### ✅ Test 7: Disable Add to Cart for Out of Stock
**Location:** Customer → Store → Product Details

**Steps:**
1. Login as **customer**
2. Browse store products
3. Find an out-of-stock product (0 quantity)
4. Tap to view details

**Expected Results:**
- ✅ "Add to Cart" button is **disabled/grayed out**
- ✅ Shows "Out of Stock" message
- ✅ Cannot add to cart
- ✅ Quantity selector disabled

---

#### ✅ Test 8: Low Stock Warnings
**Location:** Customer → Product Details

**Steps:**
1. Stay as customer
2. Find a product with low stock (1-5 units)
3. View product details

**Expected Results:**
- ✅ Shows urgency message: **"🔥 Only X left!"** (where X = quantity)
- ✅ Message appears near quantity
- ✅ Orange/red color to grab attention

**Example Messages:**
```
3 units left → "🔥 Only 3 left!"
1 unit left → "🔥 Only 1 left!"
```

---

#### ✅ Test 9: Stock Display in Cart
**Location:** Customer → Cart

**Steps:**
1. Add several products to cart
2. Include mix of high stock and low stock products
3. Go to cart

**Expected Results:**
- ✅ Each cart item shows stock availability
- ✅ **Green indicator** → High stock available
- ✅ **Orange indicator** → Low stock (hurry!)
- ✅ **Red indicator** → Out of stock (can't checkout)
- ✅ Color-coded visual feedback

---

#### ✅ Test 10: Order Cancellation with Stock Restoration
**Location:** Customer → Orders → Order Details

**Steps:**
1. Place an order as customer
2. Note the product quantities ordered
3. Go to Orders/Order History
4. Find a "Pending" order
5. Tap "Cancel Order"
6. Confirm cancellation

**Expected Results:**
- ✅ Order status changes to "Cancelled"
- ✅ Stock is **restored automatically** to inventory
- ✅ Uses Firebase transactions (atomic update)
- ✅ If ordered 3 units of Product A → 3 units added back to stock

**Verification:**
```
Before Cancel: Product has 10 stock
Order: 3 units of product
After Order: Product has 7 stock
After Cancel: Product has 10 stock (restored!)
```

---

### Phase 3: Priority 2 Features (3 Features - NEW!)

#### ✅ Test 11: Inventory Dashboard ⭐ NEW
**Location:** Store Owner → Home Screen

**Steps:**
1. Login as **store owner**
2. Look at home screen
3. Scroll down to find **"📦 Inventory Overview"** section

**Expected Results:**

**Dashboard Card Displays:**
- ✅ White background card with shadow
- ✅ Header: "📦 Inventory Overview" with "View All" button

**Primary Stats (4 boxes in grid):**
- ✅ **Total Products** (blue background, white text)
- ✅ **In Stock** (gray background, green number) - products ≥10 units
- ✅ **Out of Stock** (gray background, red number) - products = 0 units
- ✅ **Low Stock** (gray background, orange number) - products 1-9 units

**Secondary Stats (3 items in row):**
- ✅ **⚠️ Expired** - count of expired products
- ✅ **⏰ Expiring Soon** - expiring within 30 days
- ✅ **💰 Total Value** - ₱ sum of all inventory

**Interactive Elements:**
- ✅ Tap **"View All"** → Goes to Store Product screen
- ✅ Tap **"Expired"** stat → Goes to Expired Products screen
- ✅ Tap **"Low Stock"** stat → Goes to Store Product (low stock filter)

**Real-time Test:**
```
1. Open app on 2 devices with same store owner account
2. On Device 1: Change a product stock from 15 to 5
3. On Device 2: Watch dashboard update automatically
   - "In Stock" count decreases
   - "Low Stock" count increases
```

---

#### ✅ Test 12: Product Search ⭐ NEW
**Location:** Store Owner → Profile → Store Product

**Steps:**
1. Go to Profile → Store Product
2. Look for **search bar** below "Add Product" card
3. Tap search bar to activate

**Expected Results:**
- ✅ Search bar visible with **🔍 icon**
- ✅ Placeholder text: "Search by product name or category..."
- ✅ Type product name → Filters in real-time
- ✅ Type category name → Shows all products in that category
- ✅ Case-insensitive search (works with uppercase/lowercase)
- ✅ **X button** appears when typing → Tap to clear search

**Test Scenarios:**

**Search by Product Name:**
```
Type "lucky me" → Shows all Lucky Me noodle products
Type "coca" → Shows Coca-Cola and similar products
```

**Search by Category:**
```
Type "beverages" → Shows all beverage products
Type "snacks" → Shows all snack products
```

**Combined Filters:**
```
1. Type "chips" in search
2. Select "In Stock" filter tab
3. Select "Snacks" category filter
Result: Shows only in-stock snack products with "chips" in name
```

**Clear Search:**
```
Type "rice" → Products filtered
Tap X button → All products show again
```

---

#### ✅ Test 13: Expired Products Management Panel ⭐ NEW
**Location:** Store Owner → Profile → Expired Products

**Steps:**
1. Go to Profile menu
2. Look for **"Expired Products"** item with **red ⚠️ icon**
3. Tap to open

**Expected Results:**

**Summary Section:**
- ✅ Shows **"⚠️ Expiry Summary"** header
- ✅ **3 Statistics displayed:**
  - **Expired Products** count (red number)
  - **Total Units** affected (orange number)
  - **Potential Loss** in ₱ (red number)
- ✅ **"Refresh"** button on top right
- ✅ **"Record Damages"** button

**Product List:**
Each expired product shows:
- ✅ Product image with **"EXPIRED"** badge overlay
- ✅ Product name, category, size/unit
- ✅ **Days expired** (e.g., "5 days ago")
- ✅ Expiry date in readable format
- ✅ Current stock quantity
- ✅ **Loss value** (₱ = quantity × price)
- ✅ Status badge if disabled ("✓ Disabled")

**Actions Available:**
- ✅ **Disable button** (orange) → Marks product as out of stock
- ✅ **Record Damage button** (red) → Opens damage form with pre-filled data

**Empty State:**
```
If no expired products:
✅ Shows green checkmark ✅
✅ Title: "No Expired Products"
✅ Message: "Great! You don't have any expired products in your inventory."
```

**Test Actions:**

**1. Disable Product:**
```
1. Tap "Disable" on any expired product
2. Alert appears: "Disable Product?"
3. Tap "Disable" to confirm
4. Product status changes to "✓ Disabled"
5. Product hidden from customers
6. Disabled button no longer shown for this product
```

**2. Record Damage:**
```
1. Tap "Record Damage" on expired product
2. Navigates to Record Damage screen
3. Product name is pre-filled
4. Quantity is pre-filled
5. Reason is set to "expired"
6. Complete the damage recording form
7. Stock is reduced from inventory
```

**3. Pull to Refresh:**
```
1. Pull down on the product list
2. Loading spinner shows
3. Data reloads from Firebase
4. Statistics update
```

**4. View Total Loss:**
```
Example:
- Product A: 5 units × ₱20 = ₱100
- Product B: 2 units × ₱50 = ₱100
- Product C: 10 units × ₱10 = ₱100
Total Potential Loss: ₱300 (shown in summary)
```

---

## 🔗 Integration Tests

### Test: Dashboard → Expired Products Flow
```
1. Open Store Owner Home
2. Look at Inventory Dashboard
3. Note "Expired" count (e.g., 3)
4. Tap on the "⚠️ Expired" stat
5. Should navigate to Expired Products screen
6. Count should match (3 expired products shown)
```

### Test: Search + Filters + Stock Management
```
1. Go to Store Product
2. Type "rice" in search
3. Select "Low Stock" filter tab
4. Should show only rice products with low stock
5. Tap a product to open details
6. Adjust stock to 50 (now high stock)
7. Product disappears from filtered view
8. Clear search to see all products again
```

### Test: Auto-Expire → Dashboard → Action
```
1. Force close app completely
2. Reopen as store owner
3. Alert shows "X products disabled"
4. Check Inventory Dashboard
5. "Expired" count should be updated
6. "Out of Stock" count increased
7. Tap "Expired" stat
8. See newly disabled products in list
9. Tap "Record Damage" for one of them
10. Complete damage recording
```

---

## 📊 Test Data Setup

### Creating Test Scenarios

**1. Products with Various Stock Levels:**
```
Product A: 50 units (In Stock)
Product B: 5 units (Low Stock)
Product C: 0 units (Out of Stock)
Product D: 15 units (In Stock)
Product E: 2 units (Low Stock)
```

**2. Products with Expiry Dates:**
```
Product F: Expiry = 2025-11-10 (Expired - 6 days ago)
Product G: Expiry = 2025-12-05 (Expiring Soon - 19 days)
Product H: Expiry = 2026-06-01 (Fresh - 6 months)
Product I: Expiry = 2025-11-15 (Expired yesterday)
```

**3. Different Categories:**
```
Beverages: Coke, Sprite, Water
Snacks: Chips, Cookies, Candy
Dairy: Milk, Cheese, Yogurt
```

**How to Set Up:**
1. Go to Profile → Store Product
2. Use "Add Product" or "Edit Product"
3. Set stock levels and expiry dates as needed
4. Save and test

---

## ✅ Expected Results Summary

### All Features Working = ✅
- Stock validation prevents overselling ✅
- Manual adjustments work smoothly ✅
- Badges show correct colors ✅
- Filters work as expected ✅
- Expired products automatically disabled ✅
- Customer can't buy out-of-stock items ✅
- Low stock warnings appear ✅
- Cart shows stock status ✅
- Order cancellation restores stock ✅
- **Dashboard shows live statistics** ✅
- **Search filters products instantly** ✅
- **Expired products panel manages expiries** ✅

---

## 🐛 Troubleshooting

### Issue: Dashboard not showing
**Solution:** 
- Pull down to refresh home screen
- Check if products exist in Firebase
- Restart the app (force close and reopen)

### Issue: Search not working
**Solution:**
- Clear search with X button and try again
- Check if products have productName field
- Restart app if needed

### Issue: Expired products not auto-disabling
**Solution:**
- Check product expiry dates are in correct format
- Force close app completely and reopen
- Check Firebase Console for status updates

### Issue: Stock not updating in dashboard
**Solution:**
- Check internet connection
- Verify Firebase rules allow reads
- Pull to refresh
- Check console for errors

### Issue: "Expired Products" screen empty but you have expired products
**Solution:**
- Check expiry date format in Firebase (should be ISO string like "2025-11-15")
- Ensure dates are actually past today
- Pull to refresh on the screen
- Check if product belongs to your store (storeOwnerId matches)

---

## 📱 Testing on Different Scenarios

### Test 1: Multiple Users (Prevent Overselling)
```
1. Login as Customer A on Phone 1
2. Login as Customer B on Phone 2
3. Both add same product to cart (only 1 unit left in stock)
4. Customer A checks out first → Order succeeds
5. Customer B tries to checkout → Gets error "Out of stock"
✅ System prevents overselling
```

### Test 2: Offline → Online
```
1. Turn off WiFi/Mobile Data
2. Try to adjust stock → Should show error or loading
3. Turn on WiFi/Mobile Data
4. Try again → Should work now
✅ Handles network issues gracefully
```

### Test 3: Real-time Updates
```
1. Open app on 2 devices with same store owner account
2. Device 1: Go to Store Product, change a product stock
3. Device 2: Watch Inventory Dashboard
4. Dashboard updates within 1-2 seconds automatically
✅ Real-time Firebase sync works
```

---

## 🎯 Success Criteria

### All Tests Pass ✅ = Production Ready!

You can confidently say:
- ✅ Inventory management is accurate
- ✅ No overselling possible
- ✅ Expired products are managed properly
- ✅ Stock levels are always current
- ✅ Dashboard provides real-time insights
- ✅ Search makes product management easy
- ✅ Customers have smooth shopping experience

---

## 📝 Test Results Template

Use this to track your testing:

```
==============================================
INVENTORY MANAGEMENT TESTING
Date: _______________
Tester: _______________
==============================================

Phase 1: Core Features
[✅] Test 1: Stock Validation - PASS / FAIL
[✅] Test 2: Manual Adjustment - PASS / FAIL
[✅] Test 3: Stock Badges - PASS / FAIL
[✅] Test 4: Filter Tabs - PASS / FAIL
[✅] Test 5: Expired Indicators - PASS / FAIL
[✅] Test 6: Auto-Disable - PASS / FAIL

Phase 2: Customer Experience
[✅] Test 7: Disable Add to Cart - PASS / FAIL
[✅] Test 8: Low Stock Warnings - PASS / FAIL
[✅] Test 9: Cart Stock Display - PASS / FAIL
[✅] Test 10: Order Cancellation - PASS / FAIL

Phase 3: Priority 2 Features (NEW)
[✅] Test 11: Inventory Dashboard - PASS / FAIL
[✅] Test 12: Product Search - PASS / FAIL
[✅] Test 13: Expired Products Panel - PASS / FAIL

Integration Tests
[✅] Dashboard → Expired Flow - PASS / FAIL
[✅] Search + Filters - PASS / FAIL
[✅] Auto-Expire → Actions - PASS / FAIL

Issues Found:
_____________________________________________
_____________________________________________
_____________________________________________

OVERALL RESULT: ✅ PASS / ❌ FAIL
```

---

## 🚀 Quick Start Testing (10 Minutes)

**For a quick smoke test:**

1. **Launch app** → Login as store owner
2. **Check Home Screen Dashboard** → See all 7 inventory stats
3. **Go to Store Product** → Type something in search bar
4. **Tap Profile → Expired Products** → View any expired items
5. **Change a product stock** → Watch dashboard update automatically
6. **Login as customer** → Try to buy out-of-stock item (should be blocked)
7. **Place and cancel order** → Stock should restore automatically

**If all 7 steps work = ✅ System is fully functional!**

---

## 🎓 Understanding the Features

### Why These Features Matter for Sari-Sari Stores:

**Stock Management:**
- Prevents selling products you don't have
- Helps you know when to restock
- Tracks your inventory value

**Expired Products:**
- Saves money by catching expiries early
- Prevents selling expired items to customers
- Helps plan discounts or promotions

**Dashboard:**
- See business health at a glance
- Quick decision making
- Track inventory trends

**Search:**
- Find products quickly
- Manage large inventories easily
- Fast customer service

---

## 📞 Need Help?

If you encounter issues during testing:

1. **Check Firebase Console** → Verify data is being saved
2. **Check Expo Console** → Look for error messages
3. **Restart Development Server** → `Ctrl+C` then `npx expo start`
4. **Clear App Cache** → Force close app and reopen
5. **Check Internet Connection** → Firebase needs internet

---

**Happy Testing! 🎉**

Your inventory management system is comprehensive and ready for real-world sari-sari store operations!
