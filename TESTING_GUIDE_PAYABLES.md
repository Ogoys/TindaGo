# 🧪 Quick Testing Guide - Payables & Debt Management

## ✅ Ready to Test!

Everything has been built according to your requirements. Here's how to test each scenario:

---

## 🎯 Test Scenario A: Cash Payment (Simple)

### Steps:
1. **Create Purchase Order**
   - Go to: Store Owner → Profile → Record Purchase Order
   - Add supplier: "Test Supplier"
   - Add products
   - **Select Payment Method**: Cash ✅
   - Create order

2. **Mark as Delivered**
   - Open Purchase Details
   - Click "📦 Mark as Delivered"
   - Inventory updated ✅

3. **Expected Result**:
   - ✅ Status: Received (green)
   - ✅ Payment: Paid (green)
   - ❌ NO warnings shown
   - ❌ NO "Mark as Paid" button (hidden because already paid)

---

## 🎯 Test Scenario B: Debt/Utang (Main Feature)

### Steps:
1. **Create Purchase Order with Debt**
   - Go to: Record Purchase Order
   - Add supplier: "Puregold"
   - Add products (Rice, Sugar, Oil)
   - Total: ₱15,000
   - **Select Payment Method**: Debt ✅
   - **Set Due Date**: 30 days from today ✅
   - Create order

2. **Check Initial State**
   - Open Purchase Details
   - Expected:
     - Status: Pending (orange)
     - Payment: Unpaid (orange)
     - No warnings yet (not delivered)
     - ❌ NO "Mark as Paid" button yet (appears only after delivery)

3. **Mark as Delivered**
   - Click "📦 Mark as Delivered"
   - Confirm
   - Expected:
     - ✅ Status: Received (green)
     - ⚠️ Payment: Unpaid (orange)
     - ⚠️ **UNPAID DELIVERY WARNING appears** (orange card)
     - ✅ **"💳 Mark as Paid" button NOW appears** (after delivery)
     - ✅ Inventory updated (check your products)

4. **Check Warning Card**
   - You should see:
   ```
   ⚠️ UNPAID DELIVERY WARNING
   You owe ₱15,000.00 to Puregold
   Due: [Your due date]
   Please pay this supplier soon...
   ```

5. **Check All Screens**:
   - **Purchase History**: Should show orange "Unpaid" badge
   - **Supplier Details** (Puregold): Should show unpaid warning card
   - **Payables Dashboard**: Should show total ₱15,000 owed

6. **Mark as Paid**
   - Back to Purchase Details
   - Click "💳 Mark as Paid"
   - Confirm
   - Expected:
     - ✅ Payment: Paid (green)
     - ✅ Warning card disappears
     - ✅ Removed from Payables Dashboard

---

## 🎯 Test Scenario C: Overdue Payment (Urgent)

### Steps:
1. **Create Purchase Order with Past Due Date**
   - Record Purchase Order
   - Supplier: "SM Mart"
   - Products: ₱10,000
   - Payment: Debt
   - **Due Date**: Yesterday's date ✅
   - Create order

2. **Mark as Delivered**
   - Click "Mark as Delivered"

3. **Check Overdue Warning** (RED CARD):
   - You should see:
   ```
   🔴 PAYMENT OVERDUE!
   You owe ₱10,000.00 to SM Mart
   Due date PASSED: [Yesterday]
   Overdue by: 1 day
   ⚠️ Pay immediately to avoid...
   ```

4. **Check Payables Dashboard**:
   - Should show:
     - "🔴 URGENT: 1 overdue payment"
     - Red badge on order card
     - Listed in aging report

5. **Mark as Paid**:
   - Click "💳 Mark as Paid"
   - Overdue warning disappears
   - Removed from urgent list

---

## 🎯 Test Scenario D: Payables Dashboard

### Steps:
1. **Create 3-5 Unpaid Orders** (mix of dates)
   - Some current (due in future)
   - Some due soon (within 7 days)
   - Some overdue (past due date)

2. **Open Payables Dashboard**
   - Go to: Store Owner → Profile → Payables Dashboard
   - (Note: You may need to add a menu item to access it)

3. **Check Features**:
   - ✅ Total payables shown at top
   - ✅ Urgent banner if any overdue
   - ✅ Due soon alert if any
   - ✅ Aging Report breakdown
   - ✅ By Supplier section
   - ✅ All Payables list

4. **Test Mark as Paid**:
   - Click "✅ MARK AS PAID" on any order
   - Confirm
   - Should refresh and remove from list

---

## 📋 Quick Checklist

### Purchase Details Screen:
- [ ] Unpaid delivery warning shows (orange)
- [ ] Overdue warning shows (red)
- [ ] "Mark as Paid" button HIDDEN before delivery
- [ ] "Mark as Paid" button appears AFTER delivery
- [ ] Button works and updates status
- [ ] Warnings disappear when paid
- [ ] "Mark as Delivered" still works

### Payables Dashboard:
- [ ] Shows total payables
- [ ] Urgent banner for overdue
- [ ] Due soon alert works
- [ ] Aging report accurate
- [ ] Supplier breakdown correct
- [ ] Mark as paid works
- [ ] Refreshes properly

### Integration:
- [ ] Purchase History shows badges
- [ ] Supplier Details shows warnings
- [ ] All screens sync properly
- [ ] No TypeScript errors
- [ ] App compiles successfully

---

## 🐛 If Something Doesn't Work:

### Check These:
1. **Firebase Connection**: Make sure Firebase is connected
2. **Order Status**: Ensure order is marked as delivered
3. **Payment Method**: Must be "debt" for warnings to show
4. **Due Date**: Set correctly for overdue testing
5. **Refresh**: Pull down to refresh if data doesn't update

---

## 📱 Access Points

### Current Access:
- Purchase Details: Already exists ✅
- Purchase History: Already exists ✅
- Supplier Details: Already exists ✅

### Need to Add:
- **Payables Dashboard**: Currently only accessible via direct navigation
  - TODO: Add menu item in Store Owner Profile
  - Temporary: Can navigate via code/deep link

---

## ✅ Expected Behavior Summary

### Cash Payment:
- ✅ Delivered → Paid → No warnings

### Debt Payment (Current):
- ⚠️ Delivered → Unpaid → Orange warning

### Debt Payment (Overdue):
- 🔴 Delivered → Unpaid → Red urgent warning

### After Marking as Paid:
- ✅ All warnings disappear
- ✅ Green "Paid" badges everywhere

---

## 🎉 You're Ready!

**Test all scenarios and let me know if you find any issues!**

The system is built to match real Filipino sari-sari store operations (utang/credit system).

**Note**: The other TypeScript errors you saw are **pre-existing** and not related to this implementation. The payables system is clean and ready! ✅
