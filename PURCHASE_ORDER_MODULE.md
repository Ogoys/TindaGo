# 📦 Purchase Order Module Documentation

## **Objective**
To develop a purchase order module that allows store owners to record and manage items procured for sale. It acts as a digital log for tracking inventory replenishments, supplier details, and purchasing dates, helping store owners efficiently plan stock levels.

---

## **📋 Module Overview**

### **Purpose**
The Purchase Order Module enables sari-sari store owners to:
- Record inventory restocking from suppliers
- Track supplier information and purchasing history
- Monitor procurement costs and spending patterns
- Automatically update inventory levels when stock arrives
- Analyze purchasing trends for better business planning

### **Status**
✅ **FULLY IMPLEMENTED** - Production ready

**Implementation Date**: January 2025  
**Code Location**: 
- API: `src/api/purchaseOrders/index.ts`
- Model: `src/models/PurchaseOrder.ts`
- UI Screens: 
  - `app/(main)/(store-owner)/profile/record-purchase-order.tsx`
  - `app/(main)/(store-owner)/profile/purchase-order-history.tsx`
- Navigation: `app/(main)/(store-owner)/profile/index.tsx` (lines 160-166, 311-320)

---

## **🎯 Business Value**

### **Problems It Solves:**

1. **Manual Inventory Tracking**
   - ❌ Before: Store owners manually count and update stock levels
   - ✅ After: Automatic inventory updates when purchase orders are received

2. **No Cost Records**
   - ❌ Before: Can't calculate profit margins (don't know purchase costs)
   - ✅ After: Clear records of how much was paid for each product

3. **Unclear Spending**
   - ❌ Before: Don't know monthly procurement expenses
   - ✅ After: Track total spending, compare months, budget effectively

4. **Lost Supplier Information**
   - ❌ Before: No record of which supplier provides what products
   - ✅ After: Complete supplier history and contact information

---

## **✨ Key Features**

### **1. Record Purchase Orders**
- Add supplier details (name, contact, address)
- Select products from existing inventory
- Enter quantity purchased
- Record cost per unit
- Calculate total purchase cost
- Set purchase date
- Add notes/remarks

### **2. Purchase Order History**
- View all past purchase orders
- Search by supplier name
- Filter by date range
- Sort by amount, date, or supplier
- Tap to view full details

### **3. Supplier Management**
- Track supplier information
- View purchase history per supplier
- Compare supplier prices
- Store contact details

### **4. Inventory Integration**
- Automatically update product stock levels
- Track inventory movements
- View restocking history per product
- Monitor stock flow (in/out)

### **5. Cost Analytics**
- Monthly procurement spending
- Average order value
- Top suppliers by spending
- Cost trends over time
- Profit margin calculations (purchase cost vs selling price)

---

## **🖥️ User Interface Design**

### **Screen 1: Record Purchase Order**

```
┌─────────────────────────────────────────────┐
│ ← New Purchase Order                        │
├─────────────────────────────────────────────┤
│                                             │
│  Supplier Information                       │
│  ┌─────────────────────────────────────┐   │
│  │ Supplier Name                       │   │
│  │ [Enter supplier name...]            │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │ Contact Number                      │   │
│  │ [+63 912 345 6789]                  │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │ Purchase Date                       │   │
│  │ [Jan 7, 2025] 📅                    │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  ─────────────────────────────────────     │
│                                             │
│  Products                                   │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │ 🍚 Rice 25kg                        │   │
│  │                                     │   │
│  │ Quantity: [50] bags                 │   │
│  │ Cost per unit: [₱75.00]            │   │
│  │                                     │   │
│  │ Subtotal: ₱3,750.00            [×] │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  [+ Add Product]                            │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │ Notes (Optional)                    │   │
│  │ [Additional remarks...]             │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  ─────────────────────────────────────     │
│                                             │
│  Total Cost: ₱3,750.00                      │
│                                             │
│  [Record Purchase Order]                    │
│                                             │
└─────────────────────────────────────────────┘
```

### **Screen 2: Purchase Order History**

```
┌─────────────────────────────────────────────┐
│ ← Purchase Order History             [⚙]  │
├─────────────────────────────────────────────┤
│                                             │
│  [Search suppliers...]                      │
│                                             │
│  Summary                                    │
│  ┌─────────────────────────────────────┐   │
│  │ This Month     ₱45,000.00           │   │
│  │ 15 orders                           │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  Recent Orders                              │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │ Jan 7, 2025             ₱3,750.00   │   │
│  │ Metro Wholesale                     │   │
│  │ 3 products                          │   │
│  │ Status: Received ✓                  │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │ Jan 5, 2025             ₱1,200.00   │   │
│  │ Local Supplier                      │   │
│  │ 5 products                          │   │
│  │ Status: Pending 🕐                  │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │ Jan 3, 2025             ₱8,500.00   │   │
│  │ Food Distributors Inc.              │   │
│  │ 12 products                         │   │
│  │ Status: Received ✓                  │   │
│  └─────────────────────────────────────┘   │
│                                             │
└─────────────────────────────────────────────┘
```

### **Screen 3: Purchase Order Details (Modal)**

```
┌─────────────────────────────────────────────┐
│ Purchase Order Details              [×]    │
├─────────────────────────────────────────────┤
│                                             │
│  PO #: PO-2025-001                          │
│  Date: Jan 7, 2025, 3:45 PM                │
│  Status: [Received]                         │
│                                             │
│  ─────────────────────────────────────     │
│                                             │
│  Supplier: Metro Wholesale                  │
│  Contact: +63 912 345 6789                 │
│                                             │
│  ─────────────────────────────────────     │
│                                             │
│  Products:                                  │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │ 🍚 Rice 25kg                        │   │
│  │ 50 bags × ₱75.00                   │   │
│  │ Subtotal: ₱3,750.00                │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │ 🥤 Coke 1.5L                        │   │
│  │ 24 bottles × ₱45.00                │   │
│  │ Subtotal: ₱1,080.00                │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  ─────────────────────────────────────     │
│                                             │
│  Total Cost: ₱4,830.00                      │
│                                             │
│  Notes: Delivery next Monday                │
│                                             │
│  [Mark as Received] [Delete]                │
│                                             │
└─────────────────────────────────────────────┘
```

---

## **🔧 Technical Implementation**

### **Data Models**

#### **PurchaseOrder Interface**
```typescript
interface PurchaseOrder {
  id: string;
  storeOwnerId: string;
  purchaseOrderNumber: string; // e.g., "PO-2025-001"
  
  // Supplier Information
  supplierName: string;
  supplierContact?: string;
  supplierAddress?: string;
  
  // Products
  items: PurchaseOrderItem[];
  
  // Costs
  totalCost: number;
  
  // Status
  status: 'pending' | 'received' | 'cancelled';
  
  // Metadata
  notes?: string;
  purchaseDate: string; // ISO date
  receivedDate?: string; // When marked as received
  createdAt: string;
  updatedAt: string;
}

interface PurchaseOrderItem {
  productId: string;
  productName: string;
  productImage?: string;
  quantity: number;
  costPerUnit: number;
  subtotal: number;
  unit: string; // e.g., "pcs", "kg", "bottle"
}
```

### **Firebase Structure**
```
purchaseOrders/
  {purchaseOrderId}/
    id: "po123"
    storeOwnerId: "user123"
    purchaseOrderNumber: "PO-2025-001"
    supplierName: "Metro Wholesale"
    supplierContact: "+63 912 345 6789"
    items: [
      {
        productId: "prod123"
        productName: "Rice 25kg"
        quantity: 50
        costPerUnit: 75
        subtotal: 3750
        unit: "bag"
      }
    ]
    totalCost: 3750
    status: "received"
    purchaseDate: "2025-01-07T15:45:00Z"
    receivedDate: "2025-01-07T15:45:00Z"
    createdAt: "2025-01-07T15:45:00Z"
    updatedAt: "2025-01-07T15:45:00Z"
```

### **API Functions**

```typescript
// src/api/purchaseOrders/index.ts

/**
 * Create a new purchase order
 */
export async function createPurchaseOrder(
  storeOwnerId: string,
  orderData: Omit<PurchaseOrder, 'id' | 'createdAt' | 'updatedAt'>
): Promise<string>

/**
 * Get all purchase orders for a store owner
 */
export async function getPurchaseOrders(
  storeOwnerId: string
): Promise<PurchaseOrder[]>

/**
 * Get a single purchase order by ID
 */
export async function getPurchaseOrderById(
  orderId: string
): Promise<PurchaseOrder | null>

/**
 * Update purchase order status
 */
export async function updatePurchaseOrderStatus(
  orderId: string,
  status: 'pending' | 'received' | 'cancelled'
): Promise<void>

/**
 * Mark purchase order as received and update inventory
 */
export async function markAsReceived(
  orderId: string
): Promise<void>

/**
 * Delete a purchase order
 */
export async function deletePurchaseOrder(
  orderId: string
): Promise<void>

/**
 * Get total spending analytics
 */
export async function getPurchaseAnalytics(
  storeOwnerId: string,
  startDate?: Date,
  endDate?: Date
): Promise<{
  totalSpent: number;
  orderCount: number;
  averageOrderValue: number;
  topSuppliers: Array<{ name: string; amount: number }>;
}>
```

---

## **🔄 Business Logic**

### **Inventory Update Flow**

When a purchase order is marked as "Received":

1. **Fetch Purchase Order Data**
   ```typescript
   const purchaseOrder = await getPurchaseOrderById(orderId);
   ```

2. **Update Each Product's Inventory**
   ```typescript
   for (const item of purchaseOrder.items) {
     await updateProductInventory(item.productId, {
       quantityToAdd: item.quantity,
       costPrice: item.costPerUnit
     });
   }
   ```

3. **Update Product Data**
   ```typescript
   products/{productId}/
     quantity: currentQuantity + purchasedQuantity
     costPrice: newCostPrice // For profit margin calculation
     lastRestocked: timestamp
   ```

4. **Mark Purchase Order as Received**
   ```typescript
   await updatePurchaseOrderStatus(orderId, 'received');
   ```

---

## **📊 Analytics & Insights**

### **Metrics to Display**

1. **Spending Overview**
   - This Month: ₱45,000
   - Last Month: ₱38,500
   - Change: +16.9% ↑

2. **Order Statistics**
   - Total Orders: 15
   - Average Order Value: ₱3,000
   - Pending Orders: 2

3. **Top Suppliers**
   - Metro Wholesale: ₱22,000 (48.9%)
   - Local Supplier: ₱15,000 (33.3%)
   - Food Distributors: ₱8,000 (17.8%)

4. **Product Insights**
   - Most Restocked: Rice 25kg (5 orders)
   - Highest Spend: Rice (₱15,000)
   - Average Restock Frequency: Every 6 days

---

## **🎯 User Workflows**

### **Workflow 1: Record New Purchase**

```
1. Store owner goes to Settings
2. Taps "Purchase Orders"
3. Taps "Record New Purchase" button
4. Fills in supplier information
5. Taps "Add Product"
6. Selects product from inventory list
7. Enters quantity and cost per unit
8. System calculates subtotal
9. Repeats steps 5-8 for multiple products
10. Reviews total cost
11. Taps "Record Purchase Order"
12. System creates PO with status "Pending"
13. Confirmation message shown
```

### **Workflow 2: Mark Order as Received**

```
1. Store owner opens Purchase Order History
2. Taps on pending order
3. Views order details
4. Taps "Mark as Received"
5. System updates inventory for all items
6. System marks PO status as "Received"
7. Confirmation: "Inventory updated successfully"
```

### **Workflow 3: View Purchase Analytics**

```
1. Store owner opens Purchase Order History
2. Views summary card showing this month's spending
3. Scrolls to see recent orders
4. Can filter by date range or supplier
5. Views trends and insights
```

---

## **🔐 Security & Validation**

### **Input Validation**
- Supplier name: Required, max 100 characters
- Contact number: Optional, valid phone format
- Product quantity: Required, must be > 0
- Cost per unit: Required, must be > 0
- Purchase date: Required, cannot be future date

### **Firebase Security Rules**
```json
{
  "rules": {
    "purchaseOrders": {
      "$orderId": {
        ".read": "auth != null && data.child('storeOwnerId').val() === auth.uid",
        ".write": "auth != null && data.child('storeOwnerId').val() === auth.uid"
      }
    }
  }
}
```

### **Data Integrity**
- Prevent duplicate PO numbers
- Validate product exists before adding to PO
- Ensure inventory doesn't go negative
- Transaction-based updates for inventory changes

---

## **📱 Navigation Structure**

```
Settings
  └── Purchase Orders
       ├── Purchase Order History (List)
       │    ├── Filter Modal
       │    ├── Search Bar
       │    └── Order Details Modal
       │         └── Mark as Received
       └── Record New Purchase
            ├── Supplier Form
            ├── Product Selection
            └── Review & Submit
```

---

## **🚀 Implementation Steps**

### **Phase 1: Data Models & API (Day 1)**
1. Create `PurchaseOrder.ts` model
2. Create `src/api/purchaseOrders/index.ts`
3. Implement CRUD operations
4. Write Firebase security rules

### **Phase 2: UI Screens (Day 2)**
1. Create `record-purchase-order.tsx`
2. Create `purchase-order-history.tsx`
3. Create order details modal
4. Add navigation button in settings

### **Phase 3: Inventory Integration (Day 3)**
1. Implement `markAsReceived()` function
2. Connect to product inventory updates
3. Add validation and error handling
4. Test inventory flow

### **Phase 4: Polish & Analytics (Optional)**
1. Add purchase analytics
2. Implement search and filters
3. Add supplier management features
4. Create analytics dashboard

---

## **✅ Acceptance Criteria**

- [x] Store owners can record new purchase orders ✅
- [x] Supplier information is captured and stored ✅
- [x] Multiple products can be added to one order ✅
- [x] Total cost is calculated automatically ✅
- [x] Purchase history is viewable and searchable ✅
- [x] Orders can be marked as received ✅
- [x] Inventory is automatically updated when received ✅
- [x] Cost price is tracked for profit margin calculation ✅
- [x] Orders can be filtered by date and supplier ✅
- [x] Order details can be viewed in modal ✅
- [x] Navigation is intuitive and professional ✅

---

## **🔗 Related Modules**

- **Sales Module**: Uses cost data for profit calculation
- **Inventory Management**: Updated when PO is received
- **Damages & Spoilages**: Tracks losses after purchase
- **Return Goods**: May affect purchase decisions

---

## **📝 Notes**

- PO numbers should be auto-generated (e.g., PO-2025-001)
- Consider adding supplier autocomplete for repeat orders
- Future: Add supplier rating/notes feature
- Future: Export PO data to CSV/Excel
- Future: Send PO via SMS/Email to supplier

---

## **📅 Timeline**

**Estimated Time**: 2-3 days

**Day 1**: Data models, API functions, Firebase setup
**Day 2**: UI screens, forms, navigation
**Day 3**: Inventory integration, testing, polish

---

**Status**: ✅ **COMPLETED & PRODUCTION READY**
**Priority**: ⭐⭐⭐⭐⭐ (Critical - Core inventory management)
**Complexity**: 🟡 Medium
**Completion Date**: January 2025

**Bug Fix Applied**: Fixed data fetching bug in purchase-order-history.tsx (line 67) - API now correctly returns PurchaseOrder[] array instead of {success, data} object structure.
