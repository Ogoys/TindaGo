# Store Owner Wallet & Profile Structure

**STATUS:** ✅ COMPLETE AND WELL-STRUCTURED

---

## 📂 **FOLDER STRUCTURE**

```
app/(main)/(store-owner)/
├── _layout.tsx                   ← Main layout with 4-tab navigation
├── home.tsx                      ← Dashboard (visible in tabs)
├── orders.tsx                    ← Orders management (visible in tabs)
│
├── wallet/                       ← Wallet section (folder with nested routes)
│   ├── _layout.tsx              ← Nested Stack navigation ✅ CREATED
│   ├── index.tsx                ← Main wallet screen (325 lines) ✅ VISIBLE IN TABS
│   ├── earnings.tsx             ← Transaction history (450 lines) ✅ HIDDEN
│   ├── transaction.tsx          ← Individual transaction details (399 lines) ✅ HIDDEN
│   ├── payout-requests.tsx      ← Create payout requests (159 lines) ✅ HIDDEN
│   └── payout-history.tsx       ← Past payout records (144 lines) ✅ HIDDEN
│
└── profile/                     ← Profile section (folder with nested routes)
    ├── _layout.tsx              ← Nested Stack navigation ✅ EXISTS
    ├── index.tsx                ← Main profile screen (503 lines) ✅ VISIBLE IN TABS
    ├── store-product.tsx        ← Product management (945 lines) ✅ HIDDEN
    ├── add-product.tsx          ← Add new product (1040 lines) ✅ HIDDEN
    └── edit-product.tsx         ← Edit product (1029 lines) ✅ HIDDEN
```

---

## 🎯 **BOTTOM TAB NAVIGATION (4 TABS ONLY)**

### **What Store Owners See:**

```
┌─────────────────────────────────────────────────────────────┐
│ STORE OWNER APP - BOTTOM NAVIGATION                        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  [🏠 HOME]  [📦 ORDERS]  [💰 WALLET]  [👤 PROFILE]        │
│     ↑            ↑            ↑             ↑              │
│     │            │            │             │              │
│  Visible      Visible      Visible       Visible           │
│  Always       Always       Always        Always            │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### **Tab Behavior:**

| Tab | Shows Bottom Navigation? | Route |
|-----|-------------------------|-------|
| **Home** | ✅ YES | `/(main)/(store-owner)/home` |
| **Orders** | ✅ YES | `/(main)/(store-owner)/orders` |
| **Wallet** (index) | ✅ YES | `/(main)/(store-owner)/wallet` |
| **Profile** (index) | ✅ YES | `/(main)/(store-owner)/profile` |

### **Sub-screens Behavior:**

| Screen | Shows Bottom Navigation? | Route |
|--------|-------------------------|-------|
| Earnings | ❌ HIDDEN | `/(main)/(store-owner)/wallet/earnings` |
| Transaction | ❌ HIDDEN | `/(main)/(store-owner)/wallet/transaction` |
| Payout Requests | ❌ HIDDEN | `/(main)/(store-owner)/wallet/payout-requests` |
| Payout History | ❌ HIDDEN | `/(main)/(store-owner)/wallet/payout-history` |
| Store Products | ❌ HIDDEN | `/(main)/(store-owner)/profile/store-product` |
| Add Product | ❌ HIDDEN | `/(main)/(store-owner)/profile/add-product` |
| Edit Product | ❌ HIDDEN | `/(main)/(store-owner)/profile/edit-product` |

---

## 🔧 **HOW IT WORKS (CODE EXPLANATION)**

### **File: `app/(main)/(store-owner)/_layout.tsx`**

```typescript
export default function StoreOwnerLayout() {
  const pathname = usePathname();

  // Hide bottom tabs when inside wallet or profile subdirectories
  // Show tabs ONLY on: /home, /orders, /wallet (index), /profile (index)
  const hideTabsWallet = pathname?.startsWith('/(main)/(store-owner)/wallet/')
    && pathname !== '/(main)/(store-owner)/wallet';
  const hideTabsProfile = pathname?.startsWith('/(main)/(store-owner)/profile/')
    && pathname !== '/(main)/(store-owner)/profile';
  const hideTabs = hideTabsWallet || hideTabsProfile;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          display: hideTabs ? 'none' : 'flex', // ← Hides tabs when needed
        },
      }}
    >
      <Tabs.Screen name="home" options={{ title: "Home" }} />
      <Tabs.Screen name="orders" options={{ title: "Orders" }} />
      <Tabs.Screen name="wallet" options={{ title: "Wallet" }} />
      <Tabs.Screen name="profile" options={{ title: "Profile" }} />
    </Tabs>
  );
}
```

### **Logic Breakdown:**

1. **User on `/wallet`** → `pathname = '/(main)/(store-owner)/wallet'`
   - `hideTabsWallet = false` (pathname !== wallet check fails)
   - `hideTabs = false`
   - **✅ TABS VISIBLE**

2. **User on `/wallet/earnings`** → `pathname = '/(main)/(store-owner)/wallet/earnings'`
   - `hideTabsWallet = true` (starts with wallet/ AND not index)
   - `hideTabs = true`
   - **❌ TABS HIDDEN**

3. **User on `/profile`** → `pathname = '/(main)/(store-owner)/profile'`
   - `hideTabsProfile = false`
   - `hideTabs = false`
   - **✅ TABS VISIBLE**

4. **User on `/profile/add-product`** → `pathname = '/(main)/(store-owner)/profile/add-product'`
   - `hideTabsProfile = true`
   - `hideTabs = true`
   - **❌ TABS HIDDEN**

---

## 💰 **WALLET SCREENS BREAKDOWN**

### **1. `wallet/index.tsx` (Main Wallet)**

**Purpose:** Dashboard showing earnings summary and quick actions

**Features:**
- Available balance display
- Pending earnings
- Total withdrawn amount
- Real-time Firebase sync
- Quick navigation buttons to:
  - Payout Requests
  - Payout History
  - Earnings
  - Transactions

**Navigation:**
```typescript
router.push("/(main)/(store-owner)/wallet/payout-requests")
router.push("/(main)/(store-owner)/wallet/payout-history")
router.push("/(main)/(store-owner)/wallet/earnings")
router.push("/(main)/(store-owner)/wallet/transaction")
```

**Lines:** 325 ✅ **COMPLETE**

---

### **2. `wallet/earnings.tsx` (Transaction History)**

**Purpose:** View all transactions and earnings breakdown

**Features:**
- List of completed orders
- Earnings per order
- Date and customer info
- Filter by date range
- Total earnings calculation

**Lines:** 450 ✅ **COMPLETE**

---

### **3. `wallet/transaction.tsx` (Transaction Details)**

**Purpose:** View individual transaction details

**Features:**
- Order information
- Customer details
- Items purchased
- Commission breakdown
- Payment method
- Timestamps

**Lines:** 399 ✅ **COMPLETE**

---

### **4. `wallet/payout-requests.tsx` (Request Withdrawal)**

**Purpose:** Create new payout/withdrawal requests

**Features:**
- Enter withdrawal amount
- Select bank account
- Request submission to admin
- Validation checks
- Minimum payout amount

**Lines:** 159 ✅ **COMPLETE**

---

### **5. `wallet/payout-history.tsx` (Past Payouts)**

**Purpose:** View history of withdrawal requests

**Features:**
- List of all payout requests
- Status (pending, approved, rejected)
- Amount and date
- Bank details
- Admin notes

**Lines:** 144 ✅ **COMPLETE**

---

## 👤 **PROFILE SCREENS BREAKDOWN**

### **1. `profile/index.tsx` (Main Profile)**

**Purpose:** Store owner profile and settings menu

**Features:**
- Store information display
- Owner details
- Settings navigation
- Logout button
- Quick links to:
  - Store Products
  - Add Product
  - Edit Profile

**Lines:** 503 ✅ **COMPLETE**

---

### **2. `profile/store-product.tsx` (Product Management)**

**Purpose:** View and manage all store products

**Features:**
- Product list
- Edit/Delete actions
- Search and filter
- Stock levels
- Quick add button

**Lines:** 945 ✅ **COMPLETE**

---

### **3. `profile/add-product.tsx` (Add New Product)**

**Purpose:** Create new product listings

**Features:**
- Product form
- Image upload
- Price and stock
- Category selection
- Save to Firebase

**Lines:** 1040 ✅ **COMPLETE**

---

### **4. `profile/edit-product.tsx` (Edit Product)**

**Purpose:** Update existing product information

**Features:**
- Pre-filled form
- Update images
- Modify price/stock
- Save changes
- Delete option

**Lines:** 1029 ✅ **COMPLETE**

---

## ✅ **VERIFICATION CHECKLIST**

### **Wallet Structure:**

- [x] `_layout.tsx` created ✅ **JUST ADDED**
- [x] `index.tsx` exists (325 lines) ✅
- [x] `earnings.tsx` exists (450 lines) ✅
- [x] `transaction.tsx` exists (399 lines) ✅
- [x] `payout-requests.tsx` exists (159 lines) ✅
- [x] `payout-history.tsx` exists (144 lines) ✅
- [x] All screens registered in `_layout.tsx` ✅
- [x] Navigation routes working ✅

### **Profile Structure:**

- [x] `_layout.tsx` exists ✅
- [x] `index.tsx` exists (503 lines) ✅
- [x] `store-product.tsx` exists (945 lines) ✅
- [x] `add-product.tsx` exists (1040 lines) ✅
- [x] `edit-product.tsx` exists (1029 lines) ✅
- [x] All screens registered in `_layout.tsx` ✅

### **Bottom Tab Behavior:**

- [x] Only 4 tabs visible: HOME, ORDERS, WALLET, PROFILE ✅
- [x] Tabs hide on wallet subdirectories ✅ **JUST FIXED**
- [x] Tabs hide on profile subdirectories ✅ **JUST FIXED**
- [x] Tabs show on main wallet screen ✅
- [x] Tabs show on main profile screen ✅

---

## 🎯 **USER FLOW EXAMPLES**

### **Example 1: Check Earnings**

```
Store Owner opens app
  ↓
On Home screen (tabs visible: HOME ORDERS WALLET PROFILE)
  ↓
Taps "Wallet" tab
  ↓
Wallet index screen (tabs still visible)
  ↓
Taps "Earnings" button
  ↓
Earnings screen opens (tabs HIDDEN - full screen)
  ↓
Taps back button
  ↓
Returns to Wallet index (tabs visible again)
```

### **Example 2: Add Product**

```
Store Owner taps "Profile" tab
  ↓
Profile index screen (tabs visible)
  ↓
Taps "Store Products"
  ↓
Store Products screen (tabs HIDDEN)
  ↓
Taps "Add Product"
  ↓
Add Product screen (tabs HIDDEN)
  ↓
Fills form and saves
  ↓
Returns to Store Products (tabs HIDDEN)
  ↓
Taps back to Profile index (tabs visible)
```

### **Example 3: Request Payout**

```
Store Owner on Wallet index
  ↓
Sees "Available: ₱4,950.00"
  ↓
Taps "Request Payout" button
  ↓
Payout Requests screen opens (tabs HIDDEN)
  ↓
Enters withdrawal amount: ₱2,000
  ↓
Selects bank account
  ↓
Submits request
  ↓
Returns to Wallet index (tabs visible)
  ↓
Can check status in "Payout History"
```

---

## 📊 **STATISTICS**

### **Total Lines of Code:**

| Section | Files | Total Lines |
|---------|-------|-------------|
| **Wallet** | 6 files | 1,477 lines |
| **Profile** | 5 files | 3,517 lines |
| **Total** | 11 files | 4,994 lines |

### **Screen Breakdown:**

| Screen Type | Count | Visibility |
|-------------|-------|-----------|
| Main Tabs | 4 | Always visible in tabs |
| Wallet Sub-screens | 4 | Hidden from tabs |
| Profile Sub-screens | 3 | Hidden from tabs |
| **Total Screens** | **11** | |

---

## 🚀 **WHAT'S COMPLETE**

✅ **Wallet System:**
- [x] Nested navigation structure
- [x] Main wallet dashboard
- [x] Transaction history
- [x] Transaction details
- [x] Payout request system
- [x] Payout history
- [x] Proper tab hiding/showing

✅ **Profile System:**
- [x] Nested navigation structure
- [x] Main profile screen
- [x] Product management
- [x] Add product functionality
- [x] Edit product functionality
- [x] Proper tab hiding/showing

✅ **Navigation:**
- [x] 4-tab bottom navigation (HOME, ORDERS, WALLET, PROFILE)
- [x] Tabs hide on sub-screens
- [x] Tabs show on main screens
- [x] Smooth transitions between screens

---

## 🎓 **FOR YOUR CAPSTONE DEFENSE**

When demonstrating the wallet system:

1. **Show the 4-tab navigation** - Clean and organized
2. **Navigate to Wallet** - Tabs still visible
3. **Tap "Earnings"** - Tabs disappear (full-screen experience)
4. **Go back** - Tabs reappear
5. **Show payout request** - Demonstrate withdrawal flow
6. **Explain:** "We use nested navigation for better UX. Main screens show tabs for quick access, but detail screens hide tabs for focused experience."

This is a **professional navigation pattern** used by major apps like:
- Instagram (tabs on main, hidden on detail views)
- Facebook (tabs on feed, hidden on posts)
- Shopee (tabs on home, hidden on product details)

---

**Last Updated:** October 30, 2025
**Status:** ✅ COMPLETE AND WELL-STRUCTURED
**Total Screens:** 11 screens across wallet and profile
**Navigation Pattern:** Nested Stack with conditional tab hiding
