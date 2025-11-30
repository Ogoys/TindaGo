# Order Cleanup Guide - Complete Data Removal

When you delete an order from Firebase Realtime Database, you need to clean up related data in multiple locations to prevent data inconsistencies and orphaned records.

## 📊 Database Structure Overview

An order creates data in these locations:

```
Firebase Realtime Database
├── orders/
│   └── {orderId} ← Main order document
│
├── ledgers/
│   └── stores/
│       └── {storeId}/
│           └── transactions/
│               └── {invoiceId} ← Financial transaction record
│
├── wallets/
│   └── {storeId}/
│       └── transactions/
│           └── WALLET-{invoiceId} ← Wallet credit/debit record
│
├── indexes/
│   ├── invoice_to_order/
│   │   └── {invoiceId} → { orderId }
│   ├── invoice_to_store/
│   │   └── {invoiceId} → { storeId }
│   └── order_to_invoice/ (if exists)
│       └── {orderId} → { invoiceId }
│
└── processed_webhooks/
    └── {invoiceId} ← Webhook idempotency flag
```

## 🗑️ Complete Cleanup Checklist

To fully delete an order, you need to remove data from **6 locations**:

### 1. Main Order Document
**Path:** `/orders/{orderId}`

**Contains:**
- Order details, items, customer info
- Payment status, debt status
- Invoice ID reference

**Example:**
```
/orders/-NxxxxxxxxxYYYY
```

### 2. Store Ledger Transaction
**Path:** `/ledgers/stores/{storeId}/transactions/{invoiceId}`

**Contains:**
- Transaction amount, commission
- Payment method, status
- Customer info

**Example:**
```
/ledgers/stores/store123/transactions/inv_abc123xyz
```

### 3. Wallet Transaction (if paid)
**Path:** `/wallets/{storeId}/transactions/WALLET-{invoiceId}`

**Contains:**
- Credit amount to store wallet
- Invoice reference

**Example:**
```
/wallets/store123/transactions/WALLET-inv_abc123xyz
```

**Note:** This only exists if the order was paid via GCash/PayMaya

### 4. Wallet Balance Update (if paid)
**Path:** `/wallets/{storeId}`

**Action:** Need to **subtract** the order amount from:
- `available` - Current available balance
- `total` - Total wallet balance

**⚠️ Important:** Don't delete the whole wallet, just adjust the balance!

### 5. Invoice-to-Order Index
**Path:** `/indexes/invoice_to_order/{invoiceId}`

**Contains:**
```json
{
  "orderId": "-NxxxxxxxxxYYYY",
  "createdAt": "2025-11-30T..."
}
```

### 6. Invoice-to-Store Index
**Path:** `/indexes/invoice_to_store/{invoiceId}`

**Contains:**
```json
{
  "storeId": "store123",
  "createdAt": "2025-11-30T..."
}
```

### 7. Processed Webhook Flag
**Path:** `/processed_webhooks/{invoiceId}`

**Contains:**
```json
true
```

**Purpose:** Prevents duplicate webhook processing

---

## 🔍 How to Find All Related Data

### Step 1: Get Order Details
First, read the order to get the necessary IDs:

```javascript
// In Firebase Console or your app
const orderRef = ref(database, 'orders/{orderId}');
const orderSnap = await get(orderRef);
const order = orderSnap.val();

// Extract these values:
const orderId = order.id;
const storeId = order.storeId;
const invoiceId = order.xenditInvoiceId; // May not exist for debt orders not yet paid
```

### Step 2: Delete in This Order

**Important:** Delete in reverse dependency order (children before parents)

1. **Delete processed webhook flag** (if exists)
   ```
   /processed_webhooks/{invoiceId}
   ```

2. **Delete invoice indexes** (if exists)
   ```
   /indexes/invoice_to_order/{invoiceId}
   /indexes/invoice_to_store/{invoiceId}
   ```

3. **Update wallet balance** (if order was paid)
   ```
   /wallets/{storeId}
   - Subtract order amount from 'available' and 'total'
   ```

4. **Delete wallet transaction** (if exists)
   ```
   /wallets/{storeId}/transactions/WALLET-{invoiceId}
   ```

5. **Delete store ledger transaction** (if exists)
   ```
   /ledgers/stores/{storeId}/transactions/{invoiceId}
   ```

6. **Delete main order document**
   ```
   /orders/{orderId}
   ```

---

## 🛠️ Manual Cleanup in Firebase Console

### For Debt Orders (Not Yet Paid)

If the debt order was **never paid** (no `xenditInvoiceId`):

1. Go to Firebase Console → Realtime Database
2. Delete only: `/orders/{orderId}`
3. ✅ Done! (No invoice was created, so no other cleanup needed)

### For Paid Debt Orders (Has xenditInvoiceId)

If the debt order **was paid** via GCash/PayMaya:

1. Navigate to `/orders/{orderId}` and note:
   - `storeId`
   - `xenditInvoiceId`
   - `storeAmount` (amount credited to wallet)

2. Delete these paths:
   - `/orders/{orderId}` ✅
   - `/ledgers/stores/{storeId}/transactions/{xenditInvoiceId}` ✅
   - `/wallets/{storeId}/transactions/WALLET-{xenditInvoiceId}` ✅
   - `/indexes/invoice_to_order/{xenditInvoiceId}` ✅
   - `/indexes/invoice_to_store/{xenditInvoiceId}` ✅
   - `/processed_webhooks/{xenditInvoiceId}` ✅

3. Update wallet balance:
   - Navigate to `/wallets/{storeId}`
   - Manually subtract the `storeAmount` from both `available` and `total`
   
   Example:
   ```json
   Before:
   { "available": 500, "total": 500 }
   
   If storeAmount was 100:
   After:
   { "available": 400, "total": 400 }
   ```

---

## 🤖 Automated Cleanup Script

For easier cleanup, here's what paths to check:

```typescript
async function deleteOrderCompletely(orderId: string) {
  // 1. Get order details
  const orderRef = ref(database, `orders/${orderId}`);
  const orderSnap = await get(orderRef);
  
  if (!orderSnap.exists()) {
    console.log('Order not found');
    return;
  }
  
  const order = orderSnap.val();
  const storeId = order.storeId;
  const invoiceId = order.xenditInvoiceId;
  const storeAmount = order.storeAmount || 0;
  
  // 2. Delete related data (if invoice exists)
  if (invoiceId) {
    // Delete indexes
    await remove(ref(database, `indexes/invoice_to_order/${invoiceId}`));
    await remove(ref(database, `indexes/invoice_to_store/${invoiceId}`));
    
    // Delete webhook flag
    await remove(ref(database, `processed_webhooks/${invoiceId}`));
    
    // Delete ledger transaction
    await remove(ref(database, `ledgers/stores/${storeId}/transactions/${invoiceId}`));
    
    // Delete wallet transaction
    await remove(ref(database, `wallets/${storeId}/transactions/WALLET-${invoiceId}`));
    
    // Update wallet balance (if payment was completed)
    if (order.paymentStatus === 'PAID' && storeAmount > 0) {
      const walletRef = ref(database, `wallets/${storeId}`);
      const walletSnap = await get(walletRef);
      
      if (walletSnap.exists()) {
        const wallet = walletSnap.val();
        await update(walletRef, {
          available: (wallet.available || 0) - storeAmount,
          total: (wallet.total || 0) - storeAmount,
        });
      }
    }
  }
  
  // 3. Delete main order document
  await remove(orderRef);
  
  console.log('✅ Order and all related data deleted');
}
```

---

## ⚠️ Important Warnings

### 1. Wallet Balance Inconsistency
**Problem:** If you delete a paid order but don't update the wallet balance, the store will have **extra money** in their wallet that doesn't correspond to any real order.

**Solution:** Always subtract the order amount from wallet when deleting paid orders.

### 2. Orphaned Indexes
**Problem:** If you delete the order but leave the indexes, the system might try to look up orders that don't exist.

**Solution:** Always delete invoice-related indexes.

### 3. Duplicate Webhooks
**Problem:** If you delete the processed webhook flag and Xendit sends the webhook again, it will try to process a non-existent order.

**Solution:** Either keep the webhook flag OR ensure Xendit doesn't resend webhooks for deleted invoices.

---

## 🧪 Safe Testing Approach

Instead of deleting production orders, here's a better approach for testing:

### Option 1: Use Test Orders Only
- Create test orders with test email addresses (e.g., `test@example.com`)
- Use Xendit test mode
- Delete only test orders after testing

### Option 2: Mark Orders as "Test"
- Add a field: `isTestOrder: true`
- Filter out test orders in production views
- Bulk delete test orders periodically

### Option 3: Use Separate Test Environment
- Create a separate Firebase project for testing
- Test all features there
- Keep production database clean

---

## 📝 Quick Reference

**Unpaid Debt Order:**
```
Delete: /orders/{orderId}
That's it! ✅
```

**Paid Debt Order:**
```
Delete:
1. /orders/{orderId}
2. /ledgers/stores/{storeId}/transactions/{invoiceId}
3. /wallets/{storeId}/transactions/WALLET-{invoiceId}
4. /indexes/invoice_to_order/{invoiceId}
5. /indexes/invoice_to_store/{invoiceId}
6. /processed_webhooks/{invoiceId}

Update:
7. /wallets/{storeId} (subtract amounts)
```

---

## 🎯 Recommended: Keep Test Data Separate

Moving forward, to avoid cleanup issues:

1. **Use test flag:**
   ```typescript
   const order = {
     ...orderData,
     isTest: __DEV__ || process.env.NODE_ENV === 'development'
   };
   ```

2. **Filter in queries:**
   ```typescript
   // In production views
   const orders = allOrders.filter(o => !o.isTest);
   ```

3. **Bulk cleanup:**
   ```typescript
   // Delete all test orders at once
   const testOrders = query(
     ref(database, 'orders'),
     orderByChild('isTest'),
     equalTo(true)
   );
   ```

---

**Remember:** Always backup your database before doing bulk deletions! Firebase Console has export functionality.
