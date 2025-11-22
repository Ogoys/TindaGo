# Supplier Dashboard - Visual Reference

## Screen Layout

```
┌─────────────────────────────────────┐
│  ← [Back]  Supplier Dashboard  🔄  │  ← Header
├─────────────────────────────────────┤
│                                     │
│  Overview                           │  ← Section Title
│                                     │
│  ┌──────────┐  ┌──────────┐       │
│  │   👥     │  │   💰     │       │  ← Summary Cards Row 1
│  │    5     │  │ ₱15,000  │       │
│  │ Total    │  │  Total   │       │
│  │Suppliers │  │  Spent   │       │
│  └──────────┘  └──────────┘       │
│                                     │
│  ┌──────────┐  ┌──────────┐       │
│  │   📦     │  │   ⭐     │       │  ← Summary Cards Row 2
│  │   25     │  │ Puregold │       │
│  │Purchase  │  │   Top    │       │
│  │ Orders   │  │ Supplier │       │
│  └──────────┘  └──────────┘       │
│                                     │
│  ┌───────────────────────────────┐ │
│  │  ➕  Add New Supplier         │ │  ← Action Button
│  └───────────────────────────────┘ │
│                                     │
│  All Suppliers                      │  ← Section Title
│                                     │
│  ┌───────────────────────────────┐ │
│  │ 🏪 Puregold                   │ │  ← Supplier Card
│  │    Last purchase: Nov 15, 2025│ │
│  │ ┌───────────────────────────┐ │ │
│  │ │ PO: 12 │ Spent: ₱8,500    │ │ │
│  │ │ Products: 25              │ │ │
│  │ └───────────────────────────┘ │ │
│  │ Tap to view purchase history ›│ │
│  └───────────────────────────────┘ │
│                                     │
│  ┌───────────────────────────────┐ │
│  │ 🏪 SM Supermarket             │ │  ← Supplier Card
│  │    Last purchase: Nov 10, 2025│ │
│  │ ┌───────────────────────────┐ │ │
│  │ │ PO: 8  │ Spent: ₱4,200    │ │ │
│  │ │ Products: 18              │ │ │
│  │ └───────────────────────────┘ │ │
│  │ Tap to view purchase history ›│ │
│  └───────────────────────────────┘ │
│                                     │
│  Quick Actions                      │  ← Section Title
│                                     │
│  ┌───────────────────────────────┐ │
│  │ 📝 New Purchase Order         │ │  ← Action Card
│  │    Record a new inventory    │ │
│  │    purchase                  ›│ │
│  └───────────────────────────────┘ │
│                                     │
│  ┌───────────────────────────────┐ │
│  │ 📋 View All Purchase Orders   │ │  ← Action Card
│  │    See complete purchase     │ │
│  │    history                   ›│ │
│  └───────────────────────────────┘ │
│                                     │
└─────────────────────────────────────┘
```

---

## Empty State

```
┌─────────────────────────────────────┐
│  ← [Back]  Supplier Dashboard  🔄  │
├─────────────────────────────────────┤
│                                     │
│  Overview                           │
│                                     │
│  ┌──────────┐  ┌──────────┐       │
│  │   👥     │  │   💰     │       │
│  │    0     │  │   ₱0.00  │       │
│  │ Total    │  │  Total   │       │
│  │Suppliers │  │  Spent   │       │
│  └──────────┘  └──────────┘       │
│                                     │
│  ┌──────────┐  ┌──────────┐       │
│  │   📦     │  │   ⭐     │       │
│  │    0     │  │   N/A    │       │
│  │Purchase  │  │   Top    │       │
│  │ Orders   │  │ Supplier │       │
│  └──────────┘  └──────────┘       │
│                                     │
│  ┌───────────────────────────────┐ │
│  │  ➕  Add New Supplier         │ │
│  └───────────────────────────────┘ │
│                                     │
│  All Suppliers                      │
│                                     │
│  ┌───────────────────────────────┐ │
│  │         📋                    │ │
│  │  No suppliers found           │ │
│  │                               │ │
│  │  Create a purchase order to   │ │
│  │  start tracking suppliers     │ │
│  │                               │ │
│  │  ┌─────────────────────────┐ │ │
│  │  │ Create Purchase Order   │ │ │
│  │  └─────────────────────────┘ │ │
│  └───────────────────────────────┘ │
│                                     │
└─────────────────────────────────────┘
```

---

## Color Scheme

### Summary Cards
```
Card 1 (Total Suppliers):
  Background: White (#FFFFFF)
  Border: Left border 4px, Primary Green (#3BB77E)
  Shadow: rgba(0, 0, 0, 0.15)

Card 2 (Total Spent):
  Background: White (#FFFFFF)
  Border: Left border 4px, Teal (#02545F)
  Shadow: rgba(0, 0, 0, 0.15)

Card 3 (Purchase Orders):
  Background: White (#FFFFFF)
  Border: Left border 4px, Blue (#2196F3)
  Shadow: rgba(0, 0, 0, 0.15)

Card 4 (Top Supplier):
  Background: White (#FFFFFF)
  Border: Left border 4px, Green (#4CAF50)
  Shadow: rgba(0, 0, 0, 0.15)
```

### Supplier Cards
```
Background: White (#FFFFFF)
Border Radius: 16px
Shadow: rgba(0, 0, 0, 0.12), offset (0, 2), radius 6
Padding: 16px

Icon Container:
  Size: 50x50
  Border Radius: 25px (circle)
  Background: Light Green (#EFFBE7)
  Icon: 🏪 (emoji, size 28)

Stats Section:
  Background: rgba(59, 183, 126, 0.05) - Very light green tint
  Border Radius: 12px
  Padding: 12px vertical

Stat Values:
  Color: Primary Green (#3BB77E)
  Font Weight: 700
```

### Action Button (Add Supplier)
```
Background: Primary Green (#3BB77E)
Border Radius: 16px
Padding: 16px vertical, 20px horizontal
Shadow: rgba(0, 0, 0, 0.2)

Text:
  Color: White (#FFFFFF)
  Font Weight: 600
  Size: 16px
```

---

## Typography Breakdown

```
Section Title:
  Font: Clash Grotesk Variable
  Weight: 600
  Size: 18px (scaled with ms())
  Color: #1E1E1E (Dark Gray)
  Line Height: 22px
  Margin Bottom: 15px

Summary Card Amount:
  Font: Clash Grotesk Variable
  Weight: 700
  Size: 20px (scaled with ms())
  Color: #1E1E1E (Dark Gray)
  Margin Bottom: 4px

Summary Card Label:
  Font: Clash Grotesk Variable
  Weight: 400
  Size: 11px (scaled with ms())
  Color: rgba(0, 0, 0, 0.6)
  Text Align: Center

Supplier Name:
  Font: Clash Grotesk Variable
  Weight: 600
  Size: 16px (scaled with ms())
  Color: #1E1E1E (Dark Gray)

Supplier Last Purchase:
  Font: Clash Grotesk Variable
  Weight: 400
  Size: 12px (scaled with ms())
  Color: rgba(0, 0, 0, 0.6)

Stat Label:
  Font: Clash Grotesk Variable
  Weight: 400
  Size: 11px (scaled with ms())
  Color: rgba(0, 0, 0, 0.6)

Stat Value:
  Font: Clash Grotesk Variable
  Weight: 700
  Size: 14px (scaled with ms())
  Color: #3BB77E (Primary)
```

---

## Spacing & Dimensions

### Responsive Scaling
```javascript
// Baseline: 440x956 (TindaGo standard)
s(20)   // Horizontal padding
vs(15)  // Vertical spacing between cards
ms(18)  // Moderate scaling for font sizes
```

### Card Dimensions
```
Summary Cards:
  Flex: 1 (equal width in row)
  Border Radius: 16px
  Padding: 15px
  Min Height: 120px
  Gap between cards: 10px

Supplier Cards:
  Width: Full (minus 20px padding each side)
  Border Radius: 16px
  Padding: 16px
  Margin Bottom: 15px
```

### Icon Sizes
```
Header Refresh Icon: 20px
Summary Card Emoji: 32px
Supplier Icon (🏪): 28px
Action Button Icon (➕): 20px
Quick Action Icon: 32px
```

---

## Interactive Elements

### Tap Targets
```
Supplier Card:
  Full card is tappable
  Active opacity: 0.7
  Navigates to: Purchase Order History (filtered)

Add Supplier Button:
  Full button tappable
  Active opacity: 0.7
  Shows: Alert with info + navigation option

Header Refresh:
  40x40 circle
  Active opacity: 0.7
  Action: Re-fetch data, show loading icon (⏳)

Quick Action Cards:
  Full card tappable
  Active opacity: 0.7
  Navigates to: Respective screens
```

### Loading States
```
Initial Load:
  - Shows ActivityIndicator (primary color)
  - Text: "Loading supplier data..."
  - Center aligned

Pull to Refresh:
  - Standard RefreshControl
  - Tint color: Primary Green (#3BB77E)

Header Refresh:
  - Icon changes: 🔄 → ⏳
  - Button disabled during refresh
```

---

## Data Flow Visualization

```
┌─────────────────────────────────────┐
│     Supplier Dashboard Screen       │
└───────────────┬─────────────────────┘
                │
                │ fetchSupplierData()
                ▼
┌─────────────────────────────────────┐
│         Firebase Database           │
│                                     │
│  purchase_orders/                   │
│    {purchaseOrderId}/               │
│      storeOwnerId: "uid123"         │
│      supplierName: "Puregold"       │
│      totalCost: 5000                │
│      purchaseDate: "2025-11-15"     │
│      items: [...]                   │
└───────────────┬─────────────────────┘
                │
                │ Query: orderByChild('storeOwnerId')
                │        equalTo(currentUser.uid)
                ▼
┌─────────────────────────────────────┐
│      In-Memory Processing           │
│                                     │
│  1. Group by supplierName           │
│  2. Calculate per-supplier:         │
│     - Total POs                     │
│     - Total spent                   │
│     - Last purchase date            │
│     - Unique products               │
│  3. Calculate dashboard totals      │
│  4. Sort by total spent (desc)      │
└───────────────┬─────────────────────┘
                │
                │ setState()
                ▼
┌─────────────────────────────────────┐
│         Render Dashboard            │
│                                     │
│  - Overview cards                   │
│  - Supplier list                    │
│  - Quick actions                    │
└─────────────────────────────────────┘
```

---

## User Interaction Flow

```
Start: Store Owner Profile
  │
  ├─→ Tap "Supplier Dashboard"
  │     │
  │     ├─→ Dashboard loads
  │     │     │
  │     │     ├─→ Shows loading state
  │     │     │
  │     │     ├─→ Fetches purchase orders
  │     │     │
  │     │     └─→ Displays supplier data
  │     │
  │     ├─→ Pull to refresh
  │     │     └─→ Re-fetches data
  │     │
  │     ├─→ Tap header refresh button
  │     │     └─→ Re-fetches data
  │     │
  │     ├─→ Tap supplier card
  │     │     └─→ Navigate to Purchase Order History
  │     │           (filtered by supplier name)
  │     │
  │     ├─→ Tap "Add New Supplier"
  │     │     │
  │     │     └─→ Shows alert
  │     │           │
  │     │           ├─→ Cancel → Stay on dashboard
  │     │           │
  │     │           └─→ Create PO → Navigate to
  │     │                          Record Purchase Order
  │     │
  │     └─→ Tap Quick Action
  │           │
  │           ├─→ "New Purchase Order"
  │           │     └─→ Navigate to Record PO
  │           │
  │           └─→ "View All PO"
  │                 └─→ Navigate to PO History
  │
  └─→ Back to Profile
```

---

## Responsive Behavior

### Portrait Mode (Default)
```
Screen Width: 440px (baseline)
- Summary cards: 2 columns
- Supplier cards: 1 column (full width)
- All text scales proportionally
- Comfortable tap targets
```

### Landscape Mode
```
- Same layout (vertical scroll)
- Wider cards utilize horizontal space
- Maintains readability
- No layout shift
```

### Different Screen Sizes
```
Small (iPhone SE):
  - s(), vs(), ms() scale down
  - Maintains proportions
  - All elements remain accessible

Large (iPad):
  - s(), vs(), ms() scale up
  - Cards become larger
  - Text remains readable
  - More whitespace
```

---

## Edge Cases Handled

### No Suppliers
```
✅ Shows empty state card
✅ Displays zero counts
✅ Shows "N/A" for top supplier
✅ Provides CTA to create purchase order
```

### Single Supplier
```
✅ Shows 1 in "Total Suppliers"
✅ That supplier becomes "Top Supplier"
✅ All stats calculated correctly
```

### Missing Data
```
✅ Missing supplier name → "Unknown Supplier"
✅ Missing purchase date → "N/A"
✅ Missing items → Shows PO count only
✅ Missing totalCost → Counted as 0
```

### Large Numbers
```
✅ Currency formatted with 2 decimals
✅ Large amounts shown in full (no abbreviation)
✅ Counts shown as integers
```

### Firebase Errors
```
✅ Try-catch blocks prevent crashes
✅ Error alerts shown to user
✅ Console logging for debugging
✅ Graceful fallback to empty state
```

---

## Comparison with Other Dashboards

### Sales Dashboard
**Similarities**:
- Summary cards in 2x2 grid
- Color-coded borders
- Pull-to-refresh
- Header refresh button
- Transaction list with cards
- Time filters (Sales has Today/Week/Month)
- Modal details view

**Differences**:
- Supplier: Lists suppliers, not transactions
- Supplier: No time filters (shows all-time)
- Supplier: No modal (navigates to history)

### Inventory Dashboard
**Similarities**:
- Overview cards showing key metrics
- Alert cards for important info
- Quick Actions section
- Top items list (Products vs Suppliers)
- Same header style
- Same refresh mechanism

**Differences**:
- Inventory: More stat cards (6 vs 4)
- Inventory: Graph/chart visualizations
- Inventory: Color-coded status indicators
- Supplier: Simpler, cleaner layout

---

## Performance Notes

### Optimization
```
✅ Single Firebase query
✅ In-memory aggregation (no redundant queries)
✅ Memoized calculations
✅ Efficient sorting (Array.sort)
✅ Set for unique product tracking
```

### Data Size Considerations
```
Small dataset (< 50 POs):
  - Instant load
  - Smooth scrolling

Medium dataset (50-200 POs):
  - Sub-second load
  - No performance issues

Large dataset (200+ POs):
  - May take 1-2 seconds
  - Consider pagination in future
```

---

## Testing Screenshots (Placeholder)

```
[Screenshot 1: Dashboard with data]
- Multiple supplier cards
- All 4 summary cards filled
- Quick actions visible

[Screenshot 2: Empty state]
- Zero counts
- Empty state card
- CTA button prominent

[Screenshot 3: Pull to refresh]
- RefreshControl visible
- Loading state

[Screenshot 4: Supplier card detail]
- All stats visible
- Tap indicator present
```

---

**Last Updated**: November 21, 2025
**Status**: Complete visual documentation
