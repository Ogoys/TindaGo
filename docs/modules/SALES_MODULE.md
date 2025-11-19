# 💰 Sales Module Documentation

## **Objective**
To develop a sales module that enables store owners to record both walk-in and in-app transactions. It tracks daily sales activities, provides transaction history, and supports better business decision-making through accurate and organized sales data.

---

## **📋 Module Overview**

### **Purpose**
The Sales Module enables sari-sari store owners to:
- Record walk-in customer purchases
- Track in-app orders from customers
- View comprehensive sales analytics
- Access detailed transaction history
- Make informed business decisions based on sales data
- Monitor commission and net earnings

### **Status**
🟢 **PARTIALLY IMPLEMENTED** - Core features exist, may need enhancements

---

## **🎯 Business Value**

### **Problems It Solves:**

1. **No Sales Records**
   - ❌ Before: Sales tracked on paper or not at all
   - ✅ After: Digital record of every transaction

2. **Mixed Transaction Types**
   - ❌ Before: Walk-in and app sales not tracked separately
   - ✅ After: Clear distinction and combined view

3. **No Business Insights**
   - ❌ Before: Can't analyze sales patterns or trends
   - ✅ After: Daily, weekly, monthly analytics

4. **Commission Confusion**
   - ❌ Before: Unclear how much is earned after platform commission
   - ✅ After: Transparent commission breakdown and net earnings

---

## **✨ Key Features (Implemented)**

### **1. Walk-in Sales Recording** ✅
- Record sales from customers who visit the physical store
- Select products from inventory
- Set quantities
- Add customer name (optional)
- Calculate total amount
- Automatic inventory reduction
- Cash payment only

**Location**: `app/(main)/(store-owner)/profile/record-walk-in-sale.tsx`

### **2. Sales Dashboard** ✅
- Summary cards: Today, This Week, This Month, All Time
- Combined view of walk-in + app order sales
- Time-based filtering
- Transaction count per period
- Commission breakdown for app orders
- Net earnings calculation
- Pull-to-refresh

**Location**: `app/(main)/(store-owner)/profile/sales-dashboard.tsx`

### **3. Sales History** ✅
- Complete transaction records
- Search by customer name
- Filter by transaction type (walk-in/app order)
- Filter by payment method
- Detailed transaction view modal
- Commission and net earnings display
- Summary analytics

**Location**: `app/(main)/(store-owner)/profile/sales-history.tsx`

### **4. In-App Order Tracking** ✅
- Automatic tracking of app orders
- Commission calculation from ledger
- Payment method display
- Order status integration
- Only includes completed/delivered orders

**Location**: Integrated into dashboard and history screens

---

## **🖥️ User Interface Design**

### **Screen 1: Record Walk-in Sale** (Implemented)

```
┌─────────────────────────────────────────────┐
│ ← Record Walk-in Sale                       │
├─────────────────────────────────────────────┤
│                                             │
│  Customer Name (Optional)                   │
│  [Enter name...]                            │
│                                             │
│  ─────────────────────────────────────     │
│                                             │
│  [+ Add Products]                           │
│                                             │
│  Sale Items:                                │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │ [×]                                 │   │
│  │ 🍚 Rice 25kg                        │   │
│  │ 5kg • Stock: 100                    │   │
│  │                                     │   │
│  │ [-] [5] [+]                         │   │
│  │                                     │   │
│  │ ₱95.00 × 5 = ₱475.00               │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  ─────────────────────────────────────     │
│                                             │
│  Total: ₱475.00                             │
│                                             │
│  [Complete Sale]                            │
│                                             │
└─────────────────────────────────────────────┘
```

### **Screen 2: Sales Dashboard** (Implemented)

```
┌─────────────────────────────────────────────┐
│ ← Sales Dashboard                           │
├─────────────────────────────────────────────┤
│                                             │
│  Sales Overview                             │
│                                             │
│  ┌──────────────┐  ┌──────────────┐        │
│  │ Today        │  │ This Week    │        │
│  │ ₱5,000.00    │  │ ₱32,000.00   │        │
│  │ -₱350 comm   │  │ -₱2,240 comm │        │
│  │ 12 trans     │  │ 78 trans     │        │
│  │ Net: ₱4,650  │  │ Net: ₱29,760 │        │
│  └──────────────┘  └──────────────┘        │
│                                             │
│  ┌──────────────┐  ┌──────────────┐        │
│  │ This Month   │  │ All Time     │        │
│  │ ₱125,000.00  │  │ ₱450,000.00  │        │
│  │ -₱8,750 comm │  │ -₱31,500 com │        │
│  │ 320 trans    │  │ 1,250 trans  │        │
│  │ Net: ₱116K   │  │ Net: ₱418K   │        │
│  └──────────────┘  └──────────────┘        │
│                                             │
│  Transaction History                        │
│  [Today] [Week] [Month] [All]              │
│                                             │
│  Today's Total: ₱5,000.00                   │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │ [Walk-in]    Today, 2:30 PM         │   │
│  │ Walk-in Customer                    │   │
│  │ 3 items • Cash                      │   │
│  │                          ₱500.00    │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │ [App Order]  Today, 1:15 PM         │   │
│  │ Juan Dela Cruz                      │   │
│  │ 5 items • GCash                     │   │
│  │                 ₱1,200.00           │   │
│  │                 -₱84.00             │   │
│  │                 Net: ₱1,116.00      │   │
│  └─────────────────────────────────────┘   │
└─────────────────────────────────────────────┘
```

### **Screen 3: Sales History** (Implemented)

```
┌─────────────────────────────────────────────┐
│ ← Sales History                      [⚙]   │
├─────────────────────────────────────────────┤
│                                             │
│  [Search by customer name...]               │
│                                             │
│  All Sales                                  │
│  ┌─────────────────────────────────────┐   │
│  │ Transactions: 1,250                 │   │
│  │ Gross Sales: ₱450,000.00            │   │
│  │ Commission: -₱31,500.00             │   │
│  │ Net Earnings: ₱418,500.00           │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  [Transaction cards with filtering...]      │
│                                             │
└─────────────────────────────────────────────┘
```

---

## **🔧 Technical Implementation**

### **Data Models**

#### **Walk-in Sale**
```typescript
interface WalkInSale {
  id: string;
  storeOwnerId: string;
  storeName: string;
  customerName?: string;
  items: WalkInSaleItem[];
  totalAmount: number;
  paymentMethod: 'Cash';
  createdAt: string;
}

interface WalkInSaleItem {
  productId: string;
  productName: string;
  productImage: string;
  productSize: number;
  unit: string;
  quantity: number;
  price: number;
  subtotal: number;
}
```

#### **App Order (from Orders collection)**
```typescript
interface Order {
  id: string;
  customerId: string;
  customerName: string;
  storeOwnerId: string;
  storeId: string;
  items: OrderItem[];
  totalAmount: number;
  paymentMethod: 'COD' | 'GCash' | 'PayMaya';
  status: 'pending' | 'confirmed' | 'completed' | 'delivered' | 'cancelled';
  createdAt: string;
}
```

#### **Transaction (Combined View)**
```typescript
interface Transaction {
  id: string;
  type: 'walk-in' | 'app-order';
  totalAmount: number;
  itemsCount: number;
  createdAt: string;
  customerName?: string;
  status?: string;
  commission?: number;
  storeAmount?: number;
  paymentMethod?: string;
}
```

### **Firebase Structure**

```
walkInSales/
  {saleId}/
    id: "sale123"
    storeOwnerId: "user123"
    storeName: "Juan's Store"
    customerName: "Maria"
    items: [...]
    totalAmount: 500
    paymentMethod: "Cash"
    createdAt: "2025-01-07T14:30:00Z"

orders/
  {orderId}/
    customerId: "cust123"
    customerName: "Juan Dela Cruz"
    storeOwnerId: "user123"
    items: [...]
    totalAmount: 1200
    paymentMethod: "GCash"
    status: "completed"
    createdAt: "2025-01-07T13:15:00Z"

ledgers/stores/
  {storeId}/transactions/
    {transactionId}/
      orderId: "order123"
      amount: 1200
      commission: 84
      storeAmount: 1116
      status: "PAID"
```

### **API Functions**

```typescript
// Walk-in Sales
export async function createWalkInSale(saleData: Omit<WalkInSale, 'id'>): Promise<string>
export async function getWalkInSales(storeOwnerId: string): Promise<WalkInSale[]>
export async function getWalkInSaleById(saleId: string): Promise<WalkInSale | null>

// Combined Sales Data
export async function getAllSalesTransactions(storeOwnerId: string): Promise<Transaction[]>
export async function getSalesByDateRange(storeOwnerId: string, start: Date, end: Date): Promise<Transaction[]>
export async function getSalesAnalytics(storeOwnerId: string): Promise<SalesAnalytics>
```

---

## **📊 Analytics & Insights**

### **Metrics Currently Tracked**

1. **Time-Based Sales**
   - Today's sales
   - This week's sales (last 7 days)
   - This month's sales (current calendar month)
   - All-time sales

2. **Commission Tracking**
   - Total commission deducted (app orders only)
   - Net earnings (gross - commission)
   - Commission percentage visible

3. **Transaction Counts**
   - Number of transactions per period
   - Split by type (walk-in vs app orders)

4. **Payment Methods**
   - Cash (walk-in)
   - COD, GCash, PayMaya (app orders)

---

## **🎯 User Workflows**

### **Workflow 1: Record Walk-in Sale** ✅

```
1. Store owner taps Settings → Record Walk-in Sale
2. Optionally enters customer name
3. Taps "Add Products"
4. Selects products from modal
5. Adjusts quantities with +/- buttons
6. Reviews items and total
7. Taps "Complete Sale"
8. Inventory automatically reduced
9. Sale recorded in Firebase
10. Success message shown
```

### **Workflow 2: View Sales Dashboard** ✅

```
1. Store owner taps Settings → Sales Dashboard
2. Views summary cards (Today/Week/Month/All)
3. Sees commission breakdown for each period
4. Taps filter button (Today/Week/Month/All)
5. Views filtered transaction list
6. Sees color-coded badges (Walk-in green, App blue)
7. Pulls down to refresh data
```

### **Workflow 3: Search Sales History** ✅

```
1. Store owner taps Settings → Sales History
2. Types customer name in search bar
3. Real-time filtering of transactions
4. Taps filter icon for advanced filters
5. Selects transaction type and/or payment method
6. Views filtered results with summary
7. Taps transaction to see details
8. Views full item list and commission breakdown
```

---

## **🔐 Security & Validation**

### **Firebase Security Rules**
```json
{
  "rules": {
    "walkInSales": {
      ".indexOn": ["storeOwnerId", "createdAt"],
      "$saleId": {
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
  ├── Sales Dashboard ✅
  │    ├── Summary Cards
  │    ├── Filter Buttons
  │    └── Transaction List
  │
  ├── Sales History ✅
  │    ├── Search Bar
  │    ├── Filter Modal
  │    ├── Summary Card
  │    ├── Transaction List
  │    └── Transaction Details Modal
  │
  └── Record Walk-in Sale ✅
       ├── Customer Name Input
       ├── Add Products
       ├── Quantity Controls
       └── Complete Sale
```

---

## **✅ Implementation Status**

### **Completed Features** ✅
- [x] Walk-in sales recording
- [x] Product selection with inventory integration
- [x] Quantity controls (+/- buttons with text input)
- [x] Automatic inventory reduction
- [x] Sales dashboard with time filters
- [x] Combined walk-in + app order view
- [x] Commission breakdown
- [x] Net earnings calculation
- [x] Sales history with search
- [x] Advanced filtering (type, payment method)
- [x] Transaction details modal
- [x] Pull-to-refresh
- [x] Professional UI/UX

### **Potential Enhancements** 💡
- [ ] Export sales data (CSV/Excel)
- [ ] Email/SMS receipts to customers
- [ ] Refund functionality
- [ ] Discount/promotion support
- [ ] Multi-payment methods for walk-in
- [ ] Sales forecasting
- [ ] Product performance analytics
- [ ] Customer purchase history
- [ ] Loyalty program integration

---

## **🔗 Related Modules**

- **Purchase Order Module**: Compare procurement costs vs sales prices (profit margin)
- **Inventory Management**: Auto-reduce stock on sales
- **Damages & Spoilages**: Track losses to understand true profitability
- **Return Goods**: Handle product returns and refunds
- **Wallet System**: Commission and earnings tracking

---

## **📝 Notes**

- Walk-in sales are 100% profit (no commission)
- App orders have 7% platform commission deducted
- Sales data syncs in real-time from Firebase
- Inventory automatically updates on sale completion
- Transaction history is sortable and filterable
- Multi-store support (filters by storeOwnerId)

---

## **📅 Current Status**

**Status**: 🟢 **IMPLEMENTED**
**Coverage**: ~95% complete
**Priority**: ⭐⭐⭐⭐⭐ (High - Core feature)
**Complexity**: 🟡 Medium

---

## **Files Implemented**

```
✅ src/models/WalkInSale.ts
✅ src/api/walkInSales/index.ts
✅ app/(main)/(store-owner)/profile/record-walk-in-sale.tsx
✅ app/(main)/(store-owner)/profile/walk-in-sales-history.tsx
✅ app/(main)/(store-owner)/profile/sales-dashboard.tsx
✅ app/(main)/(store-owner)/profile/sales-history.tsx
```

**Module Status**: ✅ **COMPLETE** - Ready for production use
