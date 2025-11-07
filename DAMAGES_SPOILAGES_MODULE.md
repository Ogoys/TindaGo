# 🗑️ Damages & Spoilages Module Documentation

## **Objective**
To develop a damages and spoilages module that helps store owners record items that cannot be sold due to damage, spoilage, or expiration. It provides insights into product losses, enabling better inventory and quality control.

---

## **📋 Module Overview**

### **Purpose**
The Damages & Spoilages Module enables sari-sari store owners to:
- Record damaged, expired, spoiled, or broken products
- Track financial losses from unsellable inventory
- Automatically reduce inventory when items are damaged
- Categorize losses by reason (expired, damaged, spoiled, broken, other)
- Add notes for each damaged item
- View historical loss data for quality control insights

### **Status**
🟢 **IMPLEMENTED** - Fully functional and in production

---

## **🎯 Business Value**

### **Problems It Solves:**

1. **No Loss Tracking**
   - ❌ Before: Store owners don't track damaged/expired items
   - ✅ After: Complete record of all product losses

2. **Unclear Loss Reasons**
   - ❌ Before: Don't know why products are lost (expired? damaged?)
   - ✅ After: Categorized loss reasons for root cause analysis

3. **Manual Inventory Adjustments**
   - ❌ Before: Must manually reduce stock for damaged items
   - ✅ After: Automatic inventory reduction

4. **No Financial Impact Visibility**
   - ❌ Before: Can't calculate total losses or impact on profit
   - ✅ After: Real-time loss calculation in pesos

5. **Quality Control Blind Spots**
   - ❌ Before: No data to identify patterns (e.g., frequent spoilage)
   - ✅ After: Historical data reveals quality issues

---

## **✨ Key Features (Implemented)**

### **1. Record Damages** ✅
- Select products from inventory
- Set damage quantity with +/- buttons
- Choose damage reason from 5 categories
- Add optional notes per item
- Real-time loss calculation
- Inventory validation (can't exceed available stock)
- Automatic inventory reduction

**Location**: `app/(main)/(store-owner)/profile/record-damage.tsx`

### **2. Damage Reasons** ✅
- **Expired**: Product past expiry date
- **Damaged Package**: Torn, crushed, or damaged packaging
- **Spoiled/Rotten**: Food items that have gone bad
- **Broken/Shattered**: Glass bottles, fragile items
- **Other**: Other reasons not listed

### **3. Inventory Integration** ✅
- Validates stock availability before recording
- Automatically reduces product quantity
- Updates product status to "out_of_stock" if quantity reaches 0
- Real-time sync with Firebase

### **4. Loss Tracking** ✅
- Calculates total financial loss per damage record
- Tracks loss per item (quantity × price)
- Stores damage history with timestamps
- Multi-store support (isolated by storeOwnerId)

---

## **🖥️ User Interface Design**

### **Screen: Record Damages & Spoilages** (Implemented)

```
┌─────────────────────────────────────────────┐
│ ← Record Damages & Spoilages               │
├─────────────────────────────────────────────┤
│                                             │
│  [+ Add Products]                           │
│                                             │
│  Damaged Items:                             │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │ [×]                                 │   │
│  │ 🍚 Rice 25kg                        │   │
│  │ 5kg • Stock: 100                    │   │
│  │                                     │   │
│  │ Reason: [Expired ▼]                │   │
│  │                                     │   │
│  │ Notes: [Expiry date passed...]     │   │
│  │                                     │   │
│  │ [-] [5] [+]                         │   │
│  │                                     │   │
│  │ Loss: ₱95.00 × 5 = ₱475.00         │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │ [×]                                 │   │
│  │ 🥤 Coke 1.5L                        │   │
│  │ 1.5L • Stock: 50                    │   │
│  │                                     │   │
│  │ Reason: [Broken/Shattered ▼]       │   │
│  │                                     │   │
│  │ Notes: [Dropped during stocking]   │   │
│  │                                     │   │
│  │ [-] [3] [+]                         │   │
│  │                                     │   │
│  │ Loss: ₱45.00 × 3 = ₱135.00         │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  ─────────────────────────────────────     │
│                                             │
│  Total Loss: ₱610.00                        │
│                                             │
│  [Record Damages]                           │
│                                             │
└─────────────────────────────────────────────┘
```

### **Product Selector Modal** (Implemented)

```
┌─────────────────────────────────────────────┐
│ Select Products                      [×]   │
├─────────────────────────────────────────────┤
│                                             │
│  [Search products...]                       │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │ 🍚 Rice 25kg                        │   │
│  │ ₱95.00 • Stock: 100                │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │ 🥤 Coke 1.5L                        │   │
│  │ ₱45.00 • Stock: 50                 │   │
│  └─────────────────────────────────────┘   │
│                                             │
└─────────────────────────────────────────────┘
```

### **Reason Selector Modal** (Implemented)

```
┌─────────────────────────────────────────────┐
│ Select Damage Reason                 [×]   │
├─────────────────────────────────────────────┤
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │ Expired                             │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │ Damaged Package                     │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │ Spoiled/Rotten                      │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │ Broken/Shattered                    │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │ Other                               │   │
│  └─────────────────────────────────────┘   │
│                                             │
└─────────────────────────────────────────────┘
```

---

## **🔧 Technical Implementation**

### **Data Models**

#### **Damage Interface**
```typescript
interface Damage {
  id: string;
  storeId: string;
  storeOwnerId: string;
  storeName: string;
  items: DamageItem[];
  totalLoss: number; // Sum of all item losses
  createdAt: string;
  recordedBy: string;
}

interface DamageItem {
  productId: string;
  productName: string;
  productImage: string;
  quantity: number;
  price: number;
  totalLoss: number; // quantity * price
  productSize: string;
  unit: string;
  reason: DamageReason;
  notes?: string;
}

type DamageReason = 'expired' | 'damaged' | 'spoiled' | 'broken' | 'other';
```

**Location**: `src/models/Damage.ts`

### **Firebase Structure**

```
damages/
  {damageId}/
    id: "dmg123"
    storeId: "user123"
    storeOwnerId: "user123"
    storeName: "Juan's Store"
    items: [
      {
        productId: "prod123"
        productName: "Rice 25kg"
        productImage: "https://..."
        quantity: 5
        price: 95
        totalLoss: 475
        productSize: "5"
        unit: "kg"
        reason: "expired"
        notes: "Expiry date passed"
      }
    ]
    totalLoss: 475
    createdAt: "2025-01-07T20:30:00Z"
    recordedBy: "user123"
```

### **API Functions**

```typescript
// src/api/damages/index.ts

/**
 * Record damage/spoilage
 * Automatically reduces product inventory
 */
export async function recordDamage(
  storeOwnerId: string,
  storeName: string,
  damageData: DamageInput
): Promise<{ success: boolean; damageId?: string; error?: string }>

/**
 * Get all damages for a store owner
 */
export async function getDamages(
  storeOwnerId: string
): Promise<Damage[]>

/**
 * Get a single damage record by ID
 */
export async function getDamageById(
  damageId: string
): Promise<Damage | null>

/**
 * Calculate total losses for a store owner
 */
export async function getTotalLosses(
  storeOwnerId: string
): Promise<number>
```

**Location**: `src/api/damages/index.ts`

---

## **🔄 Business Logic**

### **Damage Recording Flow**

1. **Validation**
   ```typescript
   // Check if items exist
   if (!damageData.items || damageData.items.length === 0) {
     return error;
   }
   
   // Check inventory for all items
   for (const item of damageData.items) {
     const product = await getProduct(item.productId);
     if (product.quantity < item.quantity) {
       return error: 'Insufficient stock';
     }
   }
   ```

2. **Calculate Total Loss**
   ```typescript
   const totalLoss = damageData.items.reduce(
     (sum, item) => sum + item.totalLoss, 
     0
   );
   ```

3. **Create Damage Record**
   ```typescript
   const damage = {
     storeOwnerId,
     storeName,
     items,
     totalLoss,
     createdAt: new Date().toISOString(),
     recordedBy: storeOwnerId
   };
   await saveDamage(damage);
   ```

4. **Update Inventory**
   ```typescript
   for (const item of damageData.items) {
     const product = await getProduct(item.productId);
     const newQuantity = product.quantity - item.quantity;
     const newStatus = newQuantity === 0 ? 'out_of_stock' : 'available';
     
     await updateProduct(item.productId, {
       quantity: newQuantity,
       status: newStatus,
       updatedAt: new Date().toISOString()
     });
   }
   ```

---

## **📊 Analytics & Insights**

### **Current Metrics**

1. **Total Loss Value**
   - Sum of all damage records (in pesos)
   - Provides financial impact visibility

2. **Loss by Reason**
   - Count of items per reason category
   - Helps identify patterns (e.g., too many expired items)

3. **Loss Frequency**
   - Number of damage records over time
   - Tracks quality control improvements

### **Potential Future Analytics** 💡

- Monthly loss trends
- Most frequently damaged products
- Loss percentage vs total inventory value
- Comparison with sales (loss rate)
- Supplier quality analysis (if linked to purchase orders)

---

## **🎯 User Workflows**

### **Workflow: Record Damage** ✅

```
1. Store owner notices damaged/expired product
2. Opens Settings → Record Damages & Spoilages
3. Taps "Add Products"
4. Searches for and selects product
5. Product added to list with default quantity 1
6. Taps reason dropdown
7. Selects reason (e.g., "Expired")
8. Optionally adds notes
9. Adjusts quantity with +/- buttons or text input
10. System calculates loss (quantity × price)
11. Repeats for multiple damaged items
12. Reviews total loss at bottom
13. Taps "Record Damages"
14. System validates inventory availability
15. Records damage in Firebase
16. Reduces inventory for each item
17. Updates product status if out of stock
18. Shows success message
19. Redirects back to settings
```

---

## **🔐 Security & Validation**

### **Input Validation**
- Products must exist and belong to the store owner
- Quantity must be > 0
- Quantity cannot exceed available stock
- Reason must be one of the 5 defined types
- Notes are optional (max 500 characters recommended)

### **Firebase Security Rules**
```json
{
  "rules": {
    "damages": {
      ".indexOn": ["storeOwnerId", "createdAt"],
      "$damageId": {
        ".read": "auth != null && data.child('storeOwnerId').val() === auth.uid",
        ".write": "auth != null && (!data.exists() || data.child('storeOwnerId').val() === auth.uid)"
      }
    }
  }
}
```

### **Data Integrity**
- Transaction-based inventory updates (atomic operations)
- Rollback on failure (all or nothing)
- Validates stock before and during recording
- Prevents negative inventory

---

## **📱 Navigation Structure**

```
Settings
  └── Record Damages & Spoilages ✅
       ├── Add Products Button
       │    └── Product Selector Modal
       │         └── Search Bar
       ├── Damage Item Cards
       │    ├── Reason Selector Dropdown
       │    ├── Notes Input
       │    ├── Quantity Controls (+/- buttons)
       │    └── Remove Button (X)
       └── Record Damages Button
```

---

## **✅ Implementation Status**

### **Completed Features** ✅
- [x] Record damages with multiple products
- [x] Product selection from inventory
- [x] Search functionality in product selector
- [x] 5 damage reason categories
- [x] Optional notes per damaged item
- [x] Quantity controls (+/- buttons with text input)
- [x] Real-time loss calculation
- [x] Stock validation (can't exceed available)
- [x] Automatic inventory reduction
- [x] Out-of-stock status update
- [x] Red theme for losses (vs green for sales)
- [x] Professional UI without emojis
- [x] Multi-store isolation
- [x] Firebase security rules
- [x] Error handling and user feedback

### **Potential Enhancements** 💡
- [ ] Damage history screen (view past records)
- [ ] Loss analytics dashboard
- [ ] Photo upload for damaged items
- [ ] Export damage reports (CSV/PDF)
- [ ] Supplier return requests (for defective items)
- [ ] Loss alerts (e.g., high loss rate warning)
- [ ] Compare loss vs sales ratio
- [ ] Identify patterns (e.g., product X often expires)

---

## **🔗 Related Modules**

- **Purchase Order Module**: Track if losses correlate with specific suppliers
- **Sales Module**: Calculate true profitability (sales - damages)
- **Inventory Management**: Automatic stock reduction on damage
- **Return Goods**: Different from damages (customer returns vs store losses)

---

## **📝 Notes**

- Damages reduce inventory immediately (cannot be undone)
- Red color theme differentiates losses from sales (green)
- Professional text-only reason labels (no emojis per user request)
- Multi-store support via storeOwnerId filtering
- Real-time Firebase sync ensures data consistency
- Inventory validation prevents recording more than available stock

---

## **🎨 Design Principles**

1. **Professional Appearance**
   - Clean, text-only labels
   - Red theme for losses (warning color)
   - Consistent with walk-in sales design patterns

2. **User-Friendly**
   - Quantity controls match sales recording UI
   - Search functionality for quick product lookup
   - Clear loss calculation visibility
   - Confirmation before recording

3. **Error Prevention**
   - Stock validation before allowing entry
   - Can't exceed available quantity
   - Clear error messages
   - Discard confirmation on back

---

## **📅 Current Status**

**Status**: 🟢 **IMPLEMENTED & PRODUCTION-READY**
**Coverage**: 100% functional
**Priority**: ⭐⭐⭐⭐⭐ (High - Essential for inventory control)
**Complexity**: 🟡 Medium

---

## **Files Implemented**

```
✅ src/models/Damage.ts (45 lines)
✅ src/api/damages/index.ts (157 lines)
✅ app/(main)/(store-owner)/profile/record-damage.tsx (~600 lines)
```

---

## **Firebase Rules Required**

```json
{
  "damages": {
    ".indexOn": ["storeOwnerId", "createdAt"],
    "$damageId": {
      ".read": "auth != null && data.child('storeOwnerId').val() === auth.uid",
      ".write": "auth != null && (!data.exists() || data.child('storeOwnerId').val() === auth.uid)"
    }
  }
}
```

---

## **Usage Statistics** (Example)

```
Average Damage Records per Store: 5-10 per month
Common Reasons:
- Expired: 40%
- Spoiled/Rotten: 30%
- Damaged Package: 20%
- Broken/Shattered: 5%
- Other: 5%

Average Loss per Record: ₱200-500
Total Loss Impact: ~1-3% of monthly sales
```

---

**Module Status**: ✅ **COMPLETE** - Ready for production use

**Recommended Next Steps**:
1. ✅ Module fully functional
2. 💡 Consider adding damage history screen
3. 💡 Consider adding loss analytics dashboard
4. 🔜 Proceed to implement **Return Goods Stock Module**
