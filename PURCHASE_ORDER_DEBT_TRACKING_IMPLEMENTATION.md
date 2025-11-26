# Purchase Order Debt Tracking - Complete Implementation

## Overview
Comprehensive payment status tracking for purchase orders, allowing store owners to easily track which suppliers they still owe money to ("debt" payment method).

## Problem Solved
Previously, when creating purchase orders with "debt" payment method:
- ✅ Order was created with `paymentStatus: 'unpaid'`
- ✅ Debt due date was recorded
- ✅ Order appeared in purchase history
- ❌ **BUT**: No easy way to filter or see unpaid orders
- ❌ **AND**: No visual indication of payment status
- ❌ **AND**: No way to mark as paid when debt is settled

## Solution Implemented

### 1. Enhanced Purchase Order History Screen (`purchase-order-history.tsx`)

#### New Features Added:
1. **Payment Status Badges** on each purchase order card:
   - 🟢 **Paid** - Green badge
   - 🟠 **Unpaid** - Orange badge
   - 🔴 **Overdue** - Red badge (when past due date)

2. **Payment Filter Button** (💳 icon):
   - Filter by: All, Paid, Unpaid, Overdue
   - Shows active filter badge when filtering

3. **Enhanced Summary Card**:
   - Total Spent (existing)
   - Pending Count (existing)
   - Received Count (existing)
   - **💳 Unpaid Amount** - Shows total money owed to suppliers
   - **⚠️ Overdue Count** - Number of overdue payments

4. **Due Date Display** on order cards:
   - Unpaid orders show: "Due: MM/DD/YYYY"
   - Overdue orders show: "⚠️ Payment overdue since MM/DD/YYYY"

5. **Mark as Paid Functionality**:
   - Button appears in order details modal for unpaid orders
   - Updates payment status to 'paid'
   - Records payment timestamp

#### UI Components:
- **Status Badge Row**: Shows both order status (Pending/Received) and payment status side by side
- **Payment Filter**: Separate filter button next to status filter
- **Unpaid Section**: Highlighted section in summary showing total debt
- **Payment Status Section**: In details modal, shows current payment status

### 2. Enhanced Supplier Details Screen (`supplier-details.tsx`)

#### New Features Added:
1. **Unpaid Warning Card** (when owing money to supplier):
   - 💳 Icon
   - **Unpaid to Supplier**: Shows exact amount owed
   - **⚠️ Overdue payments**: Shows count if any payments are overdue
   - Orange background with border for visibility

2. **Payment Status Badges** on each order card:
   - Shows Paid/Unpaid/Overdue status
   - Color-coded: Green/Orange/Red

3. **Overdue Warning** on order cards:
   - "⚠️ Overdue since MM/DD/YYYY" in red text

4. **Total Tracking**:
   - Total value of all orders (existing)
   - **Unpaid amount** to this specific supplier
   - **Overdue count** for this supplier

## Technical Implementation

### Data Flow

#### When Creating Purchase Order with Debt:
```
1. User selects "Debt" payment method
2. Enters debt due date
3. Purchase order created with:
   - paymentStatus: 'unpaid'
   - paymentMethod: 'debt'
   - debtDueDate: '2025-XX-XX'
4. Redirects to purchase-details page
```

#### Payment Status Calculation:
```typescript
function getPaymentStatus(order: PurchaseOrder): 'paid' | 'unpaid' | 'overdue' {
  if (order.paymentStatus === 'paid') return 'paid';
  if (order.paymentStatus === 'unpaid') {
    if (order.debtDueDate && new Date() > new Date(order.debtDueDate)) {
      return 'overdue';
    }
    return 'unpaid';
  }
  return 'paid'; // Default for orders without payment status
}
```

#### Mark as Paid:
```typescript
await update(orderRef, {
  paymentStatus: 'paid',
  'paymentInfo/paidAt': new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});
```

### Files Modified

1. **`app/(main)/(store-owner)/profile/purchase-order-history.tsx`**
   - Added payment filter state and logic
   - Enhanced summary to show unpaid amounts
   - Added payment status badges to order cards
   - Added mark as paid button in modal
   - Added all necessary styles

2. **`app/(main)/(store-owner)/profile/supplier-details.tsx`**
   - Added unpaid amount and overdue count tracking
   - Added unpaid warning card
   - Added payment status badges to order cards
   - Added overdue warnings
   - Added all necessary styles

3. **`app/payment/success.tsx`** (from previous fix)
   - Fixed Xendit redirect to properly handle purchase order payments

4. **`app/(main)/(store-owner)/profile/purchase-payment.tsx`** (from previous fix)
   - Simplified Xendit redirect flow

### Database Fields Used

Already existing in `PurchaseOrder` model:
- `paymentStatus`: 'paid' | 'unpaid'
- `paymentMethod`: 'cash' | 'gcash' | 'paymaya' | 'debt'
- `debtDueDate`: string (ISO date)
- `paymentInfo`: object with payment details

## User Workflows

### Scenario 1: Store Owner Buys from Supplier on Credit (Debt)
1. **Create Purchase Order**: Add supplier, products, select "Debt" payment
2. **Set Due Date**: When they need to pay supplier
3. **Order Created**: Marked as "Unpaid"
4. **View in History**: See orange "Unpaid" badge, due date displayed
5. **Filter View**: Use 💳 filter to see only unpaid orders
6. **Check Summary**: See total unpaid amount at top
7. **Pay Supplier**: When ready, mark as paid in order details
8. **Status Updated**: Badge changes to green "Paid"

### Scenario 2: Tracking Debts to Specific Supplier
1. **Navigate to Supplier Details**
2. **See Warning Card**: If owing money, shows total unpaid amount
3. **View Order List**: Each order shows payment status badge
4. **Identify Overdue**: Red badges and warnings for overdue payments
5. **Take Action**: Click order to view details and mark as paid

### Scenario 3: Managing Overdue Payments
1. **Open Purchase History**
2. **Check Summary**: See "⚠️ X overdue payments" warning
3. **Use Filter**: Select "Overdue" to see only overdue orders
4. **Review Each**: Red badges, overdue dates displayed
5. **Mark as Paid**: Update payment status when settled

## Benefits

### For Store Owners:
✅ **Clear Visibility**: Know exactly how much you owe to suppliers
✅ **Payment Tracking**: Never miss a payment deadline
✅ **Easy Filtering**: Quickly find unpaid or overdue orders
✅ **Supplier-Specific**: Track debts per supplier
✅ **Simple Management**: Mark as paid with one button

### For Business Operations:
✅ **Financial Tracking**: Better cash flow management
✅ **Relationship Management**: Maintain good supplier relationships
✅ **Record Keeping**: Full payment history maintained
✅ **Transparency**: Clear status on all purchase orders

## Color Coding

### Payment Status:
- 🟢 **Paid** - `#4CAF50` (Green)
- 🟠 **Unpaid** - `#FF9800` (Orange) 
- 🔴 **Overdue** - `#E92B45` (Red)

### UI Elements:
- **Unpaid Warning Card**: Orange background `#FFF3E0` with orange border
- **Summary Unpaid Amount**: Orange text
- **Overdue Warning**: Red text with warning icon

## Testing Checklist

### Purchase Order History:
- [ ] Create PO with "Cash" - Shows green "Paid" badge
- [ ] Create PO with "Debt" - Shows orange "Unpaid" badge
- [ ] Create PO with overdue debt - Shows red "Overdue" badge
- [ ] Use payment filter 💳 - Filters correctly
- [ ] Check summary - Shows total unpaid amount
- [ ] View overdue warning - Shows count correctly
- [ ] Open order details - Payment status displayed
- [ ] Mark as paid - Updates to green "Paid"

### Supplier Details:
- [ ] View supplier with no debts - No warning card
- [ ] View supplier with unpaid orders - Shows unpaid warning
- [ ] Check unpaid amount - Calculates correctly
- [ ] View overdue count - Shows correct count
- [ ] Check order badges - Shows correct payment status
- [ ] View overdue orders - Shows overdue warning text

### Edge Cases:
- [ ] Order without payment method - No payment badge shown
- [ ] Paid order - Green badge, no due date
- [ ] Unpaid but not overdue - Orange badge, shows due date
- [ ] GCash/PayMaya payment - Shows payment status after Xendit

## Notes

### Integration with Existing Systems:
- Works seamlessly with existing purchase order flow
- Compatible with all payment methods (Cash, GCash, PayMaya, Debt)
- Doesn't interfere with inventory management
- Maintains all existing functionality

### Future Enhancements Possible:
- Payment reminders/notifications
- Export unpaid orders report
- Payment history log
- Bulk payment marking
- Integration with accounting systems

## Summary

This implementation provides comprehensive debt tracking for purchase orders, making it easy for store owners to:
1. **See what they owe** to suppliers at a glance
2. **Filter and find** unpaid orders quickly
3. **Track overdue** payments to avoid issues
4. **Manage payments** per supplier
5. **Update status** when debts are settled

The solution is user-friendly, visually clear, and fully integrated with the existing purchase order system.
