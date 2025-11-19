# 🔄 Return Goods Stock Module Documentation

## **Objective**
To develop a return goods stock module that allows store owners to log items returned by customers due to defects, expiration, or dissatisfaction. It helps maintain customer trust and manages inventory adjustments associated with returns.

---

## **📋 Module Overview**

### **Purpose**
The Return Goods Stock Module enables sari-sari store owners to:
- Record customer returns with reasons
- Process refunds (cash, app wallet, or store credit)
- Restore inventory for sellable returns
- Track return patterns for quality control
- Maintain customer satisfaction through professional return handling
- Generate return history reports

### **Status**
🔴 **NOT IMPLEMENTED** - To be developed

---

## **🎯 Business Value**

### **Problems It Solves:**

1. **No Return Process**
   - ❌ Before: No formal way to handle customer returns
   - ✅ After: Professional return process builds customer trust

2. **Inventory Confusion**
   - ❌ Before: Unclear if returned items should go back to stock
   - ✅ After: Clear inventory restoration for sellable returns

3. **No Refund Tracking**
   - ❌ Before: Cash refunds not recorded, affecting cash flow
   - ✅ After: All refunds tracked with payment method

4. **Quality Issues Hidden**
   - ❌ Before: Don't know which products have high return rates
   - ✅ After: Return analytics reveal defective products

5. **Customer Disputes**
   - ❌ Before: No proof of returns or refunds
   - ✅ After: Complete return history with timestamps

---

## **✨ Key Features (To Implement)**

### **1. Record Customer Returns**
- Select returned products from past orders
- Enter return quantity
- Choose return reason (defective, expired, wrong item, changed mind, etc.)
- Add notes/details
- Set return condition (sellable / unsellable)
- Process refund or store credit

### **2. Return Reasons**
- **Defective/Damaged**: Product doesn't work or arrived broken
- **Expired**: Product past expiration date
- **Wrong Item**: Customer received incorrect product
- **Changed Mind**: Customer no longer wants item
- **Quality Issues**: Product quality below expectations
- **Other**: Other reasons

### **3. Refund Processing**
- **Cash Refund**: For walk-in purchases
- **App Wallet Refund**: Credit back to customer's wallet
- **Store Credit**: Issue voucher for future purchases
- **No Refund**: Item exchanged only

### **4. Inventory Management**
- **Sellable Returns**: Add back to inventory
- **Unsellable Returns**: Do NOT restore stock (damaged/expired)
- Automatic stock updates
- Track return impact on inventory

### **5. Return History**
- View all past returns
- Search by customer or product
- Filter by return reason or status
- Export return reports

---

## **🖥️ User Interface Design**

### **Screen 1: Record Customer Return**

```
┌─────────────────────────────────────────────┐
│ ← Record Customer Return                    │
├─────────────────────────────────────────────┤
│                                             │
│  Customer Information                       │
│  ┌─────────────────────────────────────┐   │
│  │ Customer Name (Optional)            │   │
│  │ [Juan Dela Cruz]                    │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │ Order Number (Optional)             │   │
│  │ [ORD-2025-001]                      │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  ─────────────────────────────────────     │
│                                             │
│  [+ Add Products]                           │
│                                             │
│  Returned Items:                            │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │ [×]                                 │   │
│  │ 🍚 Rice 25kg                        │   │
│  │ 5kg • Price: ₱95.00                │   │
│  │                                     │   │
│  │ Reason: [Defective/Damaged ▼]      │   │
│  │                                     │   │
│  │ Condition:                          │   │
│  │ ◉ Sellable    ○ Unsellable         │   │
│  │                                     │   │
│  │ Notes: [Package torn...]           │   │
│  │                                     │   │
│  │ [-] [1] [+]                         │   │
│  │                                     │   │
│  │ Refund: ₱95.00                     │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  ─────────────────────────────────────     │
│                                             │
│  Refund Method                              │
│  ┌─────────────────────────────────────┐   │
│  │ ◉ Cash                              │   │
│  │ ○ App Wallet                        │   │
│  │ ○ Store Credit                      │   │
│  │ ○ No Refund (Exchange Only)         │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  Total Refund: ₱95.00                       │
│                                             │
│  [Process Return]                           │
│                                             │
└─────────────────────────────────────────────┘
```

### **Screen 2: Return History**

```
┌─────────────────────────────────────────────┐
│ ← Return History                     [⚙]   │
├─────────────────────────────────────────────┤
│                                             │
│  [Search by customer or product...]         │
│                                             │
│  Summary                                    │
│  ┌─────────────────────────────────────┐   │
│  │ This Month     15 returns           │   │
│  │ Total Refunded ₱4,200.00            │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  Recent Returns                             │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │ Jan 7, 2025             ₱95.00      │   │
│  │ Juan Dela Cruz                      │   │
│  │ Rice 25kg • Defective               │   │
│  │ Refund: Cash ✓                      │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │ Jan 6, 2025             ₱240.00     │   │
│  │ Maria Santos                        │   │
│  │ 3 items • Expired                   │   │
│  │ Refund: App Wallet ✓                │   │
│  └─────────────────────────────────────┘   │
│                                             │
└─────────────────────────────────────────────┘
```

### **Screen 3: Return Details Modal**

```
┌─────────────────────────────────────────────┐
│ Return Details                      [×]    │
├─────────────────────────────────────────────┤
│                                             │
│  Return #: RET-2025-001                     │
│  Date: Jan 7, 2025, 2:30 PM                │
│                                             │
│  ─────────────────────────────────────     │
│                                             │
│  Customer: Juan Dela Cruz                   │
│  Order: ORD-2025-001                        │
│                                             │
│  ─────────────────────────────────────     │
│                                             │
│  Returned Items:                            │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │ 🍚 Rice 25kg                        │   │
│  │ 1 bag × ₱95.00                     │   │
│  │ Reason: Defective/Damaged           │   │
│  │ Condition: Sellable                 │   │
│  │ Notes: Package torn                 │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  ─────────────────────────────────────     │
│                                             │
│  Refund Method: Cash                        │
│  Total Refunded: ₱95.00                     │
│                                             │
│  Processed by: Store Owner                  │
│                                             │
└─────────────────────────────────────────────┘
```

---

## **🔧 Technical Implementation**

### **Data Models**

#### **Return Interface**
```typescript
interface Return {
  id: string;
  returnNumber: string; // e.g., "RET-2025-001"
  storeOwnerId: string;
  storeName: string;
  
  // Customer Info
  customerName?: string;
  customerId?: string; // For app orders
  orderNumber?: string; // Original order reference
  
  // Items
  items: ReturnItem[];
  
  // Refund
  refundMethod: 'cash' | 'wallet' | 'store_credit' | 'none';
  totalRefund: number;
  
  // Status
  status: 'pending' | 'processed' | 'rejected';
  
  // Metadata
  createdAt: string;
  processedAt?: string;
  processedBy: string;
  notes?: string;
}

interface ReturnItem {
  productId: string;
  productName: string;
  productImage?: string;
  quantity: number;
  price: number;
  refundAmount: number;
  
  // Return Details
  reason: ReturnReason;
  condition: 'sellable' | 'unsellable';
  notes?: string;
  
  // Inventory Impact
  restoreToInventory: boolean; // true if sellable
}

type ReturnReason = 
  | 'defective' 
  | 'expired' 
  | 'wrong_item' 
  | 'changed_mind' 
  | 'quality_issues' 
  | 'other';
```

### **Firebase Structure**
```
returns/
  {returnId}/
    id: "ret123"
    returnNumber: "RET-2025-001"
    storeOwnerId: "user123"
    storeName: "Juan's Store"
    customerName: "Maria Santos"
    customerId: "cust123"
    orderNumber: "ORD-2025-001"
    items: [
      {
        productId: "prod123"
        productName: "Rice 25kg"
        quantity: 1
        price: 95
        refundAmount: 95
        reason: "defective"
        condition: "sellable"
        notes: "Package torn"
        restoreToInventory: true
      }
    ]
    refundMethod: "cash"
    totalRefund: 95
    status: "processed"
    createdAt: "2025-01-07T14:30:00Z"
    processedAt: "2025-01-07T14:30:00Z"
    processedBy: "user123"
```

### **API Functions**

```typescript
// src/api/returns/index.ts

/**
 * Create a new return record
 */
export async function createReturn(
  storeOwnerId: string,
  returnData: Omit<Return, 'id' | 'returnNumber' | 'createdAt'>
): Promise<{ success: boolean; returnId?: string; error?: string }>

/**
 * Get all returns for a store owner
 */
export async function getReturns(
  storeOwnerId: string
): Promise<Return[]>

/**
 * Get a single return by ID
 */
export async function getReturnById(
  returnId: string
): Promise<Return | null>

/**
 * Process return and update inventory
 */
export async function processReturn(
  returnId: string
): Promise<{ success: boolean; error?: string }>

/**
 * Calculate total refunds
 */
export async function getTotalRefunds(
  storeOwnerId: string,
  startDate?: Date,
  endDate?: Date
): Promise<number>

/**
 * Get return analytics
 */
export async function getReturnAnalytics(
  storeOwnerId: string
): Promise<{
  totalReturns: number;
  totalRefunded: number;
  returnsByReason: Record<ReturnReason, number>;
  mostReturnedProducts: Array<{ productName: string; count: number }>;
}>
```

---

## **🔄 Business Logic**

### **Return Processing Flow**

1. **Record Return**
   ```typescript
   const returnData = {
     customerName: "Maria Santos",
     items: [
       {
         productId: "prod123",
         quantity: 1,
         reason: "defective",
         condition: "sellable",
         restoreToInventory: true
       }
     ],
     refundMethod: "cash",
     totalRefund: 95
   };
   await createReturn(storeOwnerId, returnData);
   ```

2. **Process Refund**
   ```typescript
   if (refundMethod === 'wallet') {
     await creditCustomerWallet(customerId, totalRefund);
   } else if (refundMethod === 'store_credit') {
     await issueStoreCredit(customerId, totalRefund);
   }
   // Cash refunds are recorded but not processed digitally
   ```

3. **Update Inventory**
   ```typescript
   for (const item of returnData.items) {
     if (item.restoreToInventory && item.condition === 'sellable') {
       const product = await getProduct(item.productId);
       const newQuantity = product.quantity + item.quantity;
       
       await updateProduct(item.productId, {
         quantity: newQuantity,
         status: 'available',
         updatedAt: new Date().toISOString()
       });
     }
   }
   ```

4. **Mark as Processed**
   ```typescript
   await updateReturn(returnId, {
     status: 'processed',
     processedAt: new Date().toISOString()
   });
   ```

---

## **📊 Analytics & Insights**

### **Metrics to Display**

1. **Return Rate**
   - Returns / Total Sales × 100%
   - Monthly trend

2. **Return Reasons**
   - Breakdown by reason category
   - Identify quality issues

3. **Most Returned Products**
   - Products with highest return rate
   - Flag problematic suppliers

4. **Refund Totals**
   - Total refunded this month
   - Breakdown by refund method

5. **Return Condition**
   - Sellable vs Unsellable ratio
   - Impact on inventory

---

## **🎯 User Workflows**

### **Workflow: Process Customer Return**

```
1. Customer brings item back to store
2. Store owner opens Settings → Record Customer Return
3. Optionally enters customer name and order number
4. Taps "Add Products"
5. Searches for and selects returned product
6. Sets quantity (usually 1)
7. Selects return reason
8. Chooses condition (Sellable / Unsellable)
9. Adds notes if needed
10. Selects refund method (Cash/Wallet/Credit/None)
11. Reviews total refund amount
12. Taps "Process Return"
13. System validates product exists
14. Records return in Firebase
15. If sellable, restores inventory
16. If wallet refund, credits customer account
17. If store credit, generates voucher code
18. Shows success message with return number
19. Customer receives refund
```

---

## **🔐 Security & Validation**

### **Input Validation**
- Return quantity must be > 0
- Return quantity should not exceed original purchase
- Product must exist in inventory
- Refund amount cannot be negative
- Return reason is required

### **Firebase Security Rules**
```json
{
  "rules": {
    "returns": {
      ".indexOn": ["storeOwnerId", "createdAt"],
      "$returnId": {
        ".read": "auth != null && data.child('storeOwnerId').val() === auth.uid",
        ".write": "auth != null && (!data.exists() || data.child('storeOwnerId').val() === auth.uid)"
      }
    }
  }
}
```

---

## **📱 Navigation Structure**

```
Settings
  └── Record Customer Return
       ├── Customer Info Form
       ├── Add Products Button
       │    └── Product Selector Modal
       ├── Return Item Cards
       │    ├── Reason Selector
       │    ├── Condition Toggle
       │    ├── Notes Input
       │    └── Quantity Controls
       ├── Refund Method Selector
       └── Process Return Button
       
  └── Return History
       ├── Search Bar
       ├── Filter Modal
       ├── Summary Card
       ├── Return List
       └── Return Details Modal
```

---

## **✅ Acceptance Criteria**

- [ ] Store owners can record customer returns
- [ ] Return reasons are categorized
- [ ] Refund method is captured (cash/wallet/credit)
- [ ] Sellable returns restore inventory
- [ ] Unsellable returns do NOT restore inventory
- [ ] Total refund is calculated automatically
- [ ] Return history is viewable and searchable
- [ ] Return details modal shows complete information
- [ ] Multi-store support (isolated by storeOwnerId)
- [ ] Firebase security rules protect data
- [ ] Professional UI matches existing patterns

---

## **🔗 Related Modules**

- **Sales Module**: Returns reduce net sales/profit
- **Inventory Management**: Sellable returns increase stock
- **Damages & Spoilages**: Unsellable returns similar to damages
- **Purchase Order Module**: High returns may indicate supplier issues
- **Customer Module**: Track return history per customer

---

## **📝 Notes**

- Returns are customer-initiated (vs Damages which are store-initiated)
- Sellable returns restore inventory, unsellable do not
- Refunds impact cash flow and should be tracked
- High return rates indicate quality or supplier problems
- Store credit builds customer loyalty

---

## **🚀 Implementation Steps**

### **Phase 1: Data Models & API (Day 1)**
1. Create `Return.ts` model
2. Create `src/api/returns/index.ts`
3. Implement CRUD operations
4. Write Firebase security rules

### **Phase 2: UI Screens (Day 2)**
1. Create `record-return.tsx`
2. Create `return-history.tsx`
3. Create return details modal
4. Add navigation button in settings

### **Phase 3: Business Logic (Day 3)**
1. Implement inventory restoration logic
2. Add refund processing for wallet/credit
3. Add validation and error handling
4. Test return flow end-to-end

---

## **📅 Timeline**

**Estimated Time**: 2-3 days

**Day 1**: Data models, API functions, Firebase setup
**Day 2**: UI screens, forms, navigation
**Day 3**: Business logic, refunds, testing

---

**Status**: 🔴 **Pending Implementation**
**Priority**: ⭐⭐⭐⭐ (High - Builds customer trust)
**Complexity**: 🟡 Medium

---

## **🎯 Success Metrics**

- Return processing time < 2 minutes
- 100% of returns tracked digitally
- Clear inventory impact (sellable vs unsellable)
- Customer satisfaction maintained
- Reduced return disputes
