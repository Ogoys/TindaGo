# Remaining Features Implementation Guide

**Status**: 4/15 features completed  
**Remaining**: 11 critical features  
**Priority**: Implement in order listed below

---

## ✅ COMPLETED FEATURES (4/15)

1. ✅ Disable Add to Cart for out-of-stock products
2. ✅ Low stock warnings in product details
3. ✅ Stock quantity display in cart
4. ✅ Maximum 10 items per order limit

---

## 🔴 CRITICAL - MUST IMPLEMENT (Priority 1)

### 1. Auto-Toggle Expired Products to Out-of-Stock ⭐⭐⭐⭐⭐

**Why**: Prevents customers from ordering expired products, reduces refunds

**Implementation**:
- Create a Cloud Function (or client-side check) that runs daily
- Query all products with `expiryDate < today`
- Auto-set `status = 'out_of_stock'`
- Send notification to store owners

**Option A: Client-Side (Simple, Immediate)**
```typescript
// Add to: app/(main)/(store-owner)/home.tsx
// Run on store owner app launch

useEffect(() => {
  const checkExpiredProducts = async () => {
    if (!user) return;
    
    const productsRef = ref(database, 'products');
    const userProductsQuery = query(
      productsRef,
      orderByChild('storeOwnerId'),
      equalTo(user.id)
    );
    
    const snapshot = await get(userProductsQuery);
    if (!snapshot.exists()) return;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const updates = {};
    Object.keys(snapshot.val()).forEach(productId => {
      const product = snapshot.val()[productId];
      if (product.expiryDate) {
        const expiryDate = new Date(product.expiryDate);
        if (expiryDate < today && product.status === 'available') {
          updates[`products/${productId}/status`] = 'out_of_stock';
          console.log(`Auto-disabled expired product: ${product.productName}`);
        }
      }
    });
    
    if (Object.keys(updates).length > 0) {
      await update(ref(database), updates);
      Alert.alert(
        'Expired Products Disabled',
        `${Object.keys(updates).length} expired product(s) have been automatically marked as out of stock.`
      );
    }
  };
  
  checkExpiredProducts();
}, [user]);
```

**Option B: Cloud Function (Better, Automated)**
```javascript
// Firebase Cloud Function (deploy to Firebase Functions)
const functions = require('firebase-functions');
const admin = require('firebase-admin');

exports.disableExpiredProducts = functions.pubsub
  .schedule('every day 00:00')
  .timeZone('Asia/Manila')
  .onRun(async (context) => {
    const db = admin.database();
    const productsRef = db.ref('products');
    const snapshot = await productsRef.once('value');
    
    if (!snapshot.exists()) return null;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const updates = {};
    const expiredProducts = [];
    
    snapshot.forEach((childSnapshot) => {
      const product = childSnapshot.val();
      const productId = childSnapshot.key;
      
      if (product.expiryDate && product.status === 'available') {
        const expiryDate = new Date(product.expiryDate);
        if (expiryDate < today) {
          updates[`products/${productId}/status`] = 'out_of_stock';
          expiredProducts.push({
            id: productId,
            name: product.productName,
            storeOwnerId: product.storeOwnerId
          });
        }
      }
    });
    
    if (Object.keys(updates).length > 0) {
      await db.ref().update(updates);
      console.log(`Disabled ${expiredProducts.length} expired products`);
      
      // Send notifications to store owners
      // TODO: Implement push notifications
    }
    
    return null;
  });
```

---

### 2. Order Cancellation with Stock Restoration ⭐⭐⭐⭐⭐

**Why**: Essential for customer trust and inventory accuracy

**Files to Modify**:
- `app/(main)/(customer)/order-details.tsx`
- Create new API: `src/api/orderCancellation.ts`

**Implementation**:

```typescript
// src/api/orderCancellation.ts
import { ref, get, update, runTransaction } from 'firebase/database';
import { database } from '../../FirebaseConfig';

export interface CancelOrderResult {
  success: boolean;
  message: string;
}

export async function cancelOrder(orderId: string, userId: string, reason: string): Promise<CancelOrderResult> {
  try {
    // 1. Get order details
    const orderRef = ref(database, `orders/${orderId}`);
    const orderSnap = await get(orderRef);
    
    if (!orderSnap.exists()) {
      return { success: false, message: 'Order not found' };
    }
    
    const order = orderSnap.val();
    
    // 2. Validate order can be cancelled
    if (order.customerId !== userId) {
      return { success: false, message: 'Unauthorized' };
    }
    
    if (order.status !== 'pending' && order.status !== 'confirmed') {
      return { success: false, message: 'Order cannot be cancelled at this stage' };
    }
    
    // 3. Restore stock for each item
    const stockUpdates = {};
    for (const item of order.items) {
      const productRef = ref(database, `products/${item.productId}`);
      await runTransaction(productRef, (product) => {
        if (product) {
          product.quantity = (product.quantity || 0) + item.quantity;
        }
        return product;
      });
    }
    
    // 4. Update order status
    await update(orderRef, {
      status: 'cancelled',
      cancelledAt: new Date().toISOString(),
      cancellationReason: reason,
      cancelledBy: 'customer'
    });
    
    // 5. Log cancellation for audit
    const logRef = ref(database, `orderCancellations/${orderId}`);
    await update(logRef, {
      orderId,
      customerId: userId,
      storeId: order.storeId,
      cancelledAt: new Date().toISOString(),
      reason,
      itemsRestored: order.items.map(item => ({
        productId: item.productId,
        productName: item.productName,
        quantityRestored: item.quantity
      }))
    });
    
    // 6. Send notification to store owner
    // TODO: Implement push notification
    const notificationRef = ref(database, `notifications/${order.storeOwnerId}/${Date.now()}`);
    await update(notificationRef, {
      type: 'order_cancelled',
      orderId,
      orderNumber: order.orderNumber,
      customerName: order.customerName,
      reason,
      createdAt: new Date().toISOString(),
      read: false
    });
    
    return { success: true, message: 'Order cancelled successfully. Stock has been restored.' };
  } catch (error) {
    console.error('Error cancelling order:', error);
    return { success: false, message: 'Failed to cancel order. Please try again.' };
  }
}
```

**Add Cancel Button to Order Details**:
```typescript
// In app/(main)/(customer)/order-details.tsx
// Add after the existing order details display

import { cancelOrder } from '../../../src/api/orderCancellation';

const [showCancelModal, setShowCancelModal] = useState(false);
const [cancelling, setCancelling] = useState(false);

const handleCancelOrder = async () => {
  Alert.alert(
    'Cancel Order?',
    'Are you sure you want to cancel this order? Stock will be restored.',
    [
      { text: 'No', style: 'cancel' },
      {
        text: 'Yes, Cancel',
        style: 'destructive',
        onPress: async () => {
          setCancelling(true);
          const result = await cancelOrder(order.id, user.id, 'Customer requested cancellation');
          setCancelling(false);
          
          if (result.success) {
            Alert.alert('Order Cancelled', result.message);
            router.back();
          } else {
            Alert.alert('Error', result.message);
          }
        }
      }
    ]
  );
};

// Add button in render (only for pending/confirmed orders)
{(order.status === 'pending' || order.status === 'confirmed') && (
  <TouchableOpacity 
    style={styles.cancelButton}
    onPress={handleCancelOrder}
    disabled={cancelling}
  >
    {cancelling ? (
      <ActivityIndicator color="#FFF" />
    ) : (
      <Text style={styles.cancelButtonText}>Cancel Order</Text>
    )}
  </TouchableOpacity>
)}
```

---

### 3. Failed Payment Stock Restoration ⭐⭐⭐⭐

**Why**: Prevents inventory errors when payments fail

**Files to Modify**:
- `tindago-admin/src/app/api/webhooks/xendit/route.ts`

**Implementation**:

```typescript
// Add to xendit webhook handler

// Handle EXPIRED status
if (status === 'EXPIRED') {
  console.log(`[Webhook] Invoice ${invoiceId} expired - restoring stock`);
  
  // Get order details
  const orderSnap = await get(ref(database, `orders/${orderId}`));
  if (orderSnap.exists()) {
    const order = orderSnap.val();
    
    // Restore stock for each item
    for (const item of order.items) {
      await runTransaction(ref(database, `products/${item.productId}`), (product) => {
        if (product) {
          product.quantity = (product.quantity || 0) + item.quantity;
          console.log(`Restored ${item.quantity} to ${item.productName}`);
        }
        return product;
      });
    }
    
    // Update order status
    await update(ref(database, `orders/${orderId}`), {
      paymentStatus: 'EXPIRED',
      status: 'cancelled',
      stockRestored: true,
      restoredAt: new Date().toISOString()
    });
    
    // Log restoration
    const logRef = ref(database, `stockRestorations/${orderId}`);
    await set(logRef, {
      orderId,
      reason: 'Payment expired',
      restoredAt: new Date().toISOString(),
      items: order.items
    });
  }
}

// Also handle payment FAILED
if (status === 'FAILED') {
  // Same logic as EXPIRED
}
```

---

## 🟡 HIGH VALUE - IMPLEMENT NEXT (Priority 2)

### 4. Simple Inventory Dashboard for Store Owners ⭐⭐⭐⭐

**Implementation**: Add to `app/(main)/(store-owner)/home.tsx`

```typescript
// Add after existing alerts section (around line 387)

{/* Inventory Overview Card */}
<View style={styles.inventoryOverviewCard}>
  <Text style={styles.inventoryOverviewTitle}>📦 Inventory Overview</Text>
  
  <View style={styles.inventoryStatsRow}>
    <View style={styles.inventoryStat}>
      <Text style={styles.inventoryStatNumber}>{products.length}</Text>
      <Text style={styles.inventoryStatLabel}>Total Products</Text>
    </View>
    
    <View style={styles.inventoryStat}>
      <Text style={[styles.inventoryStatNumber, { color: '#FF9800' }]}>
        {products.filter(p => p.quantity > 0 && p.quantity < 10).length}
      </Text>
      <Text style={styles.inventoryStatLabel}>Low Stock</Text>
    </View>
    
    <View style={styles.inventoryStat}>
      <Text style={[styles.inventoryStatNumber, { color: '#E92B45' }]}>
        {products.filter(p => p.quantity === 0).length}
      </Text>
      <Text style={styles.inventoryStatLabel}>Out of Stock</Text>
    </View>
    
    <View style={styles.inventoryStat}>
      <Text style={[styles.inventoryStatNumber, { color: '#FF6B00' }]}>
        {products.filter(p => {
          if (!p.expiryDate) return false;
          const daysUntilExpiry = Math.ceil((new Date(p.expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
          return daysUntilExpiry >= 0 && daysUntilExpiry <= 7;
        }).length}
      </Text>
      <Text style={styles.inventoryStatLabel}>Expiring Soon</Text>
    </View>
  </View>
  
  <View style={styles.inventoryValueRow}>
    <Text style={styles.inventoryValueLabel}>Total Inventory Value:</Text>
    <Text style={styles.inventoryValueAmount}>
      ₱{products.reduce((sum, p) => sum + (p.price * p.quantity), 0).toLocaleString()}
    </Text>
  </View>
</View>

// Add styles
inventoryOverviewCard: {
  backgroundColor: Colors.white,
  borderRadius: s(16),
  padding: s(16),
  marginHorizontal: s(20),
  marginBottom: vs(20),
  shadowColor: 'rgba(0, 0, 0, 0.15)',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 1,
  shadowRadius: 8,
  elevation: 4,
},
inventoryOverviewTitle: {
  fontFamily: Fonts.primary,
  fontWeight: '700',
  fontSize: ms(18),
  color: Colors.darkGray,
  marginBottom: vs(16),
},
inventoryStatsRow: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  marginBottom: vs(16),
},
inventoryStat: {
  alignItems: 'center',
  flex: 1,
},
inventoryStatNumber: {
  fontFamily: Fonts.primary,
  fontWeight: '700',
  fontSize: ms(24),
  color: Colors.primary,
  marginBottom: vs(4),
},
inventoryStatLabel: {
  fontFamily: Fonts.primary,
  fontWeight: '500',
  fontSize: ms(11),
  color: Colors.textSecondary,
  textAlign: 'center',
},
inventoryValueRow: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  paddingTop: vs(12),
  borderTopWidth: 1,
  borderTopColor: 'rgba(0, 0, 0, 0.1)',
},
inventoryValueLabel: {
  fontFamily: Fonts.primary,
  fontWeight: '600',
  fontSize: ms(14),
  color: Colors.darkGray,
},
inventoryValueAmount: {
  fontFamily: Fonts.primary,
  fontWeight: '700',
  fontSize: ms(18),
  color: Colors.primary,
},
```

---

### 5. Search Functionality in Store Product Screen ⭐⭐⭐⭐

**Implementation**: Add to `app/(main)/(store-owner)/profile/store-product.tsx`

```typescript
// Add state
const [searchQuery, setSearchQuery] = useState('');

// Update filtering logic
useEffect(() => {
  let filtered = products;

  // Apply search filter
  if (searchQuery.trim()) {
    filtered = filtered.filter(product =>
      product.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.category.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }

  // Apply category filter
  if (selectedCategoryFilter) {
    filtered = filtered.filter(product => product.category === selectedCategoryFilter);
  }

  // Apply stock filter
  if (selectedStockFilter !== 'all') {
    // ... existing stock filter logic
  }

  setFilteredProducts(filtered);
}, [products, searchQuery, selectedCategoryFilter, selectedStockFilter]);

// Add search bar UI after header
<View style={styles.searchContainer}>
  <Image
    source={require('../../../../src/assets/images/customer-home/search-icon.png')}
    style={styles.searchIcon}
  />
  <TextInput
    style={styles.searchInput}
    placeholder="Search products..."
    value={searchQuery}
    onChangeText={setSearchQuery}
    placeholderTextColor="rgba(0, 0, 0, 0.4)"
  />
  {searchQuery.length > 0 && (
    <TouchableOpacity onPress={() => setSearchQuery('')}>
      <Text style={styles.clearSearchText}>✕</Text>
    </TouchableOpacity>
  )}
</View>

// Add styles
searchContainer: {
  flexDirection: 'row',
  alignItems: 'center',
  backgroundColor: Colors.white,
  borderRadius: s(12),
  paddingHorizontal: s(15),
  paddingVertical: vs(12),
  marginHorizontal: s(20),
  marginBottom: vs(16),
  shadowColor: 'rgba(0, 0, 0, 0.1)',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 1,
  shadowRadius: 4,
  elevation: 3,
},
searchIcon: {
  width: s(20),
  height: s(20),
  marginRight: s(10),
},
searchInput: {
  flex: 1,
  fontFamily: Fonts.primary,
  fontSize: ms(16),
  color: Colors.darkGray,
},
clearSearchText: {
  fontFamily: Fonts.primary,
  fontSize: ms(20),
  color: Colors.textSecondary,
  paddingHorizontal: s(8),
},
```

---

## 🟢 NICE TO HAVE (Priority 3)

### 6. Stock History/Audit Log

**Database Structure**:
```json
{
  "stockHistory": {
    "productId_timestamp": {
      "productId": "prod123",
      "productName": "Pancit Canton",
      "previousQuantity": 50,
      "newQuantity": 45,
      "change": -5,
      "reason": "Order #ORD-2025-12345",
      "changedBy": "customer",
      "changedAt": "2025-01-15T10:30:00Z"
    }
  }
}
```

**Log Stock Changes**: Add to all stock update functions

```typescript
async function logStockChange(productId: string, productName: string, oldQty: number, newQty: number, reason: string, userId: string) {
  const logRef = ref(database, `stockHistory/${productId}_${Date.now()}`);
  await set(logRef, {
    productId,
    productName,
    previousQuantity: oldQty,
    newQuantity: newQty,
    change: newQty - oldQty,
    reason,
    changedBy: userId,
    changedAt: new Date().toISOString()
  });
}
```

---

### 7. Notify Me Feature

**Database Structure**:
```json
{
  "productNotifications": {
    "productId": {
      "userId1": { email: "...", createdAt: "..." },
      "userId2": { email: "...", createdAt: "..." }
    }
  }
}
```

**Implementation**:
1. Add "Notify Me" button in product details when out of stock
2. Store user subscription in database
3. When stock updated > 0, send push notification to all subscribers
4. Clear subscriptions after notification sent

---

### 8. Sort by Availability

**Implementation**: Add to customer product listings

```typescript
const [sortBy, setSortBy] = useState<'default' | 'availability' | 'price-asc' | 'price-desc'>('default');

const sortedProducts = useMemo(() => {
  let sorted = [...filteredProducts];
  
  switch (sortBy) {
    case 'availability':
      sorted.sort((a, b) => {
        // In stock first, then low stock, then out of stock
        if (a.quantity === 0 && b.quantity > 0) return 1;
        if (a.quantity > 0 && b.quantity === 0) return -1;
        return b.quantity - a.quantity;
      });
      break;
    case 'price-asc':
      sorted.sort((a, b) => a.price - b.price);
      break;
    case 'price-desc':
      sorted.sort((a, b) => b.price - a.price);
      break;
  }
  
  return sorted;
}, [filteredProducts, sortBy]);
```

---

## 📝 TESTING CHECKLIST

### Critical Features (Must Test)
- [ ] Expired products auto-disabled daily
- [ ] Order cancellation restores stock correctly
- [ ] Failed/expired payments restore stock
- [ ] Inventory dashboard shows accurate counts
- [ ] Search finds products by name/category

### Business Rules (Verify)
- [ ] Maximum 10 items per product enforced
- [ ] Stock cannot go negative
- [ ] Cart shows accurate stock availability
- [ ] Multiple users cannot exceed stock
- [ ] Stock deduction happens at correct time

### Edge Cases (Test)
- [ ] Cancel order with multiple items
- [ ] Payment expires after 24 hours
- [ ] Webhook arrives out of order
- [ ] Product deleted while in cart
- [ ] Store owner adjusts stock while customer checking out

---

## 🚀 DEPLOYMENT STEPS

1. **Test locally** with dev Firebase database
2. **Deploy Cloud Functions** for expired products check
3. **Update webhook handler** for failed payments
4. **Test end-to-end** payment flow
5. **Monitor logs** for first 48 hours
6. **Gather feedback** from store owners

---

## 💡 FUTURE ENHANCEMENTS

1. **Predictive Reordering**: Alert when stock likely to run out based on sales velocity
2. **Supplier Integration**: Direct reorder from suppliers
3. **Waste Tracking**: Log expired products for analysis
4. **Price Optimization**: Suggest price adjustments for slow-moving items
5. **Batch Expiry Management**: Set expiry dates for multiple items at once

---

**Next Steps**: Implement Critical features (#1-3) first, then High Value (#4-5), then Nice to Have as time permits.
