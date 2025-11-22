# Supplier Details Screen Structure

## Visual Layout Reference

```
┌─────────────────────────────────────────────────────┐
│  ← Supplier Details                          🔄     │  ← Header
└─────────────────────────────────────────────────────┘
│                                                       │
│  ┌───────────────────────────────────────────────┐  │
│  │  🏪  Puregold Supermarket                     │  │
│  │      Last purchase: Nov 15, 2025              │  │  ← Supplier Info Card
│  │  ─────────────────────────────────────────    │  │
│  │  📞 0912-345-6789                             │  │
│  │  📧 supplier@puregold.com.ph                  │  │
│  │  📍 123 Main St, Manila                       │  │
│  └───────────────────────────────────────────────┘  │
│                                                       │
│  ┌─────────────────┐  ┌──────────────────────────┐  │
│  │   📦            │  │   💰                     │  │  ← Statistics Row 1
│  │   45            │  │   ₱125,450.00            │  │
│  │   Purchase      │  │   Total Spent            │  │
│  │   Orders        │  │                          │  │
│  └─────────────────┘  └──────────────────────────┘  │
│                                                       │
│  ┌─────────────────┐  ┌──────────────────────────┐  │
│  │   📋            │  │   📊                     │  │  ← Statistics Row 2
│  │   127           │  │   ₱2,787.78              │  │
│  │   Different     │  │   Avg Order Value        │  │
│  │   Products      │  │                          │  │
│  └─────────────────┘  └──────────────────────────┘  │
│                                                       │
│  ┌ Quick Actions ────────────────────────────────┐  │
│  │                                                │  │
│  │  ┌──────────────┐  ┌─────────────────────────┐│  │
│  │  │ 🛒 New Order │  │ 📜 View History         ││  │  ← Quick Actions
│  │  └──────────────┘  └─────────────────────────┘│  │
│  └───────────────────────────────────────────────┘  │
│                                                       │
│  ┌ Products from Puregold Supermarket ──────────┐  │
│  │  Showing 127 products with last purchase      │  │
│  │  prices                                        │  │
│  │                                                │  │
│  │  ┌────────────────────────────────────────┐  │  │
│  │  │ [IMG]  Lucky Me Pancit Canton          │  │  │
│  │  │        60g                              │  │  │
│  │  │  ┌──────────┬──────────┬──────────┐   │  │  │
│  │  │  │Last Price│ Total Qty│  Orders  │   │  │  │  ← Product Card
│  │  │  │ ₱12.50   │   1,250  │    35    │   │  │  │
│  │  │  └──────────┴──────────┴──────────┘   │  │  │
│  │  │  📅 Nov 15, 2025   [Buy Product 🛒]   │  │  │
│  │  └────────────────────────────────────────┘  │  │
│  │                                                │  │
│  │  ┌────────────────────────────────────────┐  │  │
│  │  │ [IMG]  Alaska Evaporated Milk          │  │  │
│  │  │        370ml                            │  │  │
│  │  │  ┌──────────┬──────────┬──────────┐   │  │  │
│  │  │  │Last Price│ Total Qty│  Orders  │   │  │  │  ← Product Card
│  │  │  │ ₱45.00   │    480   │    24    │   │  │  │
│  │  │  └──────────┴──────────┴──────────┘   │  │  │
│  │  │  📅 Nov 10, 2025   [Buy Product 🛒]   │  │  │
│  │  └────────────────────────────────────────┘  │  │
│  │                                                │  │
│  │  ... (more products) ...                      │  │
│  │                                                │  │
│  └───────────────────────────────────────────────┘  │
│                                                       │
│  ┌─────────────────────────────────────────────┐   │
│  │  View All Purchase Orders →                  │   │  ← View All Button
│  └─────────────────────────────────────────────┘   │
│                                                       │
└───────────────────────────────────────────────────────┘
```

## Component Breakdown

### 1. Header Section
```
Position: Top, fixed
Components:
  - ProfileScreenHeader (back button + title)
  - Refresh button (top-right)
```

### 2. Supplier Information Card
```
Background: White (#FFFFFF)
Border Radius: 16px
Shadow: Elevation 4
Content:
  - Icon container (60x60, light green background)
  - Supplier name (20px bold)
  - Last purchase date (13px secondary)
  - Contact items (phone, email, address)
    - Each with icon + tap action
```

### 3. Statistics Cards (2 rows, 2 cards each)
```
Grid Layout: 2 columns
Card Style:
  - White background
  - 14px border radius
  - Colored left border (4px)
  - Shadow elevation 3
  - Centered content

Cards:
  Row 1:
    - Purchase Orders (blue border)
    - Total Spent (teal border)
  Row 2:
    - Different Products (green border)
    - Avg Order Value (orange border)

Content per card:
  - Icon (30px emoji)
  - Value (18px bold)
  - Label (11px secondary)
```

### 4. Quick Actions Section
```
Title: "Quick Actions" (18px semibold)
Layout: Horizontal row, 2 buttons

Buttons:
  - New Order (primary, green fill)
  - View History (secondary, white with green border)

Style:
  - 12px border radius
  - Icon + text
  - Shadow elevation 3
```

### 5. Products Section
```
Title: "Products from {supplier}" (18px semibold)
Subtitle: Count + description (13px secondary)

Product Cards (repeated):
  Layout: Horizontal
  Components:
    - Product image (90x90, rounded 10px)
    - Product info (flex)
      - Name (15px semibold)
      - Size (12px secondary)
      - Stats row (last price, qty, orders)
      - Footer (date + buy button)

Stats Row:
  Background: Light green tint (rgba(59, 183, 126, 0.05))
  Border Radius: 8px
  Layout: 3 columns with dividers
  Content:
    - Last Price (green bold)
    - Total Qty (green bold)
    - Orders (green bold)

Buy Button:
  Background: Primary green
  Border Radius: 8px
  Icon: Cart outline
  Action: Navigate to purchase order
```

### 6. View All Button
```
Position: Bottom of product list
Style: White background, green border, outlined
Content: "View All Purchase Orders" + arrow icon
Action: Navigate to purchase history
```

## Color Coding

### Border Colors by Card Type
- **Blue** (#2196F3): Purchase Orders
- **Teal** (#02545F): Total Spent
- **Green** (#3BB77E): Different Products
- **Orange** (#FF9800): Average Order Value

### Background Layers
- **Screen**: #F6F6F6 (backgroundGray)
- **Cards**: #FFFFFF (white)
- **Stats Row**: rgba(59, 183, 126, 0.05) (light green tint)

### Text Hierarchy
- **Primary**: #1E1E1E (darkGray)
- **Secondary**: rgba(0, 0, 0, 0.6) (textSecondary)
- **Accent**: #3BB77E (primary green)

## Spacing & Sizing

### Horizontal Spacing
- Screen padding: 20px (s(20))
- Card internal padding: 16-20px
- Gap between elements: 10-15px

### Vertical Spacing
- Section margins: 15-20px (vs(15-20))
- Card margins: 12-15px
- Internal padding: 14-16px

### Card Dimensions
- Stat cards height: 110px minimum
- Product image: 90x90px
- Icon containers: 40-60px
- Button height: 40-50px

## Responsive Behavior

### Screen Sizes
```
Small (< 375px):
  - Single column statistics
  - Smaller card padding
  - Reduced font sizes

Medium (375-414px):
  - Standard 2-column layout
  - Default spacing
  - Full feature set

Large (> 414px):
  - Wider cards
  - More generous spacing
  - Enhanced shadows
```

### Scaling Functions
```typescript
s(20)   // Horizontal: 20px → scales with screen width
vs(15)  // Vertical: 15px → scales with screen height
ms(16)  // Moderate: 16px → scales with 0.5 factor
```

## Interactive Elements

### Tap Targets
1. **Back Button** → router.back()
2. **Refresh Button** → Reload data
3. **Phone Number** → Device dialer
4. **Email Address** → Email client
5. **New Order Button** → Purchase order with supplier
6. **View History Button** → Purchase history filtered
7. **Buy Product Button** → Purchase order with product
8. **View All Button** → Purchase history

### Visual Feedback
- Active opacity: 0.7
- Shadow on press: Reduced
- Loading states: ActivityIndicator
- Pull-to-refresh: RefreshControl

## Empty States

### No Supplier Data
```
┌─────────────────────────────┐
│         🏪                  │
│   Supplier Not Found        │
│   No purchase orders found  │
│   for this supplier         │
│                             │
│   ┌─────────────┐          │
│   │  Go Back    │          │
│   └─────────────┘          │
└─────────────────────────────┘
```

### No Products
```
┌─────────────────────────────┐
│         📦                  │
│   No products found         │
└─────────────────────────────┘
```

### Loading State
```
┌─────────────────────────────┐
│         ⏳                  │
│   Loading supplier          │
│   details...                │
└─────────────────────────────┘
```

## Data Flow Diagram

```
User taps supplier card in dashboard
           ↓
Route params: { supplier: "Puregold" }
           ↓
Fetch purchase orders for store owner
           ↓
Filter by supplier name
           ↓
Aggregate data:
  - Count orders
  - Sum total spent
  - Extract unique products
  - Calculate last prices
  - Track quantities
           ↓
Display supplier details
           ↓
User interactions:
  - Call/Email supplier
  - Create new order
  - Buy specific product
  - View purchase history
```

## Navigation Flow

```
Supplier Dashboard
       ↓ (tap supplier)
Supplier Details ──┬─→ Record Purchase Order (New Order)
       ↑           ├─→ Record Purchase Order (Buy Product)
       │           └─→ Purchase Order History (View History)
       │
   (back button)
```

## Asset Requirements

When Figma assets are available, replace:
- 🏪 → supplier-icon.png
- 📦 → purchase-order-icon.png
- 💰 → money-icon.png
- 📋 → products-icon.png
- 📊 → chart-icon.png
- 🛒 → cart-icon.png
- 📜 → history-icon.png
- 📞 → phone-icon.png (currently Ionicons)
- 📧 → email-icon.png (currently Ionicons)
- 📍 → location-icon.png (currently Ionicons)
- 📅 → calendar-icon.png (currently Ionicons)

## Performance Considerations

### Optimizations
1. Efficient data aggregation (single pass through orders)
2. Map-based product tracking (O(1) lookups)
3. Sorted product list (by last purchase date)
4. Memoized calculations (total spent, avg value)
5. Lazy loading (pagination for large product lists - future)

### Memory Usage
- Product map: ~10KB per 100 products
- Purchase orders: ~5KB per 50 orders
- Images: Deferred loading with Image component

## Accessibility Notes

Future enhancements:
- Screen reader labels for all interactive elements
- High contrast mode support
- Larger touch targets (min 44x44)
- Voice command integration
- Keyboard navigation for web

## Development Notes

### TypeScript Interfaces
```typescript
interface ProductFromSupplier {
  productId: string;
  productName: string;
  lastCostPerUnit: number;
  totalQuantityPurchased: number;
  purchaseCount: number;
  // ... more fields
}

interface SupplierDetails {
  name: string;
  contact?: string;
  totalPurchaseOrders: number;
  totalAmountSpent: number;
  products: Map<string, ProductFromSupplier>;
  // ... more fields
}
```

### Key Functions
```typescript
fetchSupplierDetails() // Main data loader
handleBuyProduct()     // Navigate to purchase order
handleCallSupplier()   // Device dialer integration
formatDate()           // Date formatting
formatCurrency()       // Money formatting
```

### Dependencies
```typescript
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { ref, get, query, orderByChild, equalTo } from 'firebase/database';
```

---

**Last Updated**: November 21, 2025
**Screen Status**: Production Ready
**TypeScript**: ✅ No errors
**Navigation**: ✅ Fully integrated
**Design System**: ✅ Compliant
