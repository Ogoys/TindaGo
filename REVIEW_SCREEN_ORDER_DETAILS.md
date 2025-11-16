# Review Screen - Order Details Enhancement

## Overview
Enhanced the review screen to display comprehensive order information, helping customers remember the context of their order when leaving feedback.

## What Was Added

### New Order Details Card
A new card has been added between the Store Info Card and Rating Section that displays:

1. **Customer Name** 👤
   - Shows who placed the order
   - Helps verify they're reviewing the correct order
   - Falls back to user context name if not in order data

2. **Order Date** 📅
   - When the order was placed
   - Format: "Jan 15, 2024"
   - Helps customer remember the timeframe

3. **Items Count** 🛒
   - Number of items in the order
   - Example: "3 item(s)"
   - Quick context about order size

4. **Total Amount** 💵
   - How much customer paid
   - Format: "₱350.00"
   - Helps identify the order

## Visual Layout

```
┌────────────────────────────────────────┐
│  [←] Reviews                           │
├────────────────────────────────────────┤
│                                        │
│  ┌────────────────────────────────┐   │
│  │  [🏪]  Sample Sari-Sari Store │   │  ← Store Info Card
│  │        Order #ORD-2024-001     │   │
│  └────────────────────────────────┘   │
│                                        │
│  ┌────────────────────────────────┐   │
│  │  👤 Customer: Juan Dela Cruz  │   │
│  │  📅 Order Date: Jan 15, 2024  │   │  ← NEW: Order Details Card
│  │  🛒 Items: 3 item(s)          │   │
│  │  💵 Total: ₱350.00            │   │
│  └────────────────────────────────┘   │
│                                        │
│  ┌────────────────────────────────┐   │
│  │  How was your experience?      │   │
│  │  ⭐⭐⭐⭐⭐                    │   │  ← Rating Section
│  └────────────────────────────────┘   │
│                                        │
│  ┌────────────────────────────────┐   │
│  │  Share your thoughts           │   │  ← Comment Section
│  │  [Text Input Area]             │   │
│  └────────────────────────────────┘   │
│                                        │
│  ┌────────────────────────────────┐   │
│  │  Add photos (optional)         │   │  ← Image Upload
│  │  [Add Photo Button]            │   │
│  └────────────────────────────────┘   │
│                                        │
│           [Rate Now Button]            │
└────────────────────────────────────────┘
```

## Code Implementation

### JSX Structure
```typescript
{/* Order Details Card */}
<View style={styles.orderDetailsCard}>
  <View style={styles.orderDetailRow}>
    <Ionicons name="person-outline" size={s(18)} color="#666666" />
    <Text style={styles.orderDetailLabel}>Customer:</Text>
    <Text style={styles.orderDetailValue}>
      {order?.customerName || user?.name || 'N/A'}
    </Text>
  </View>
  
  <View style={styles.orderDetailRow}>
    <Ionicons name="calendar-outline" size={s(18)} color="#666666" />
    <Text style={styles.orderDetailLabel}>Order Date:</Text>
    <Text style={styles.orderDetailValue}>
      {order?.createdAt 
        ? new Date(order.createdAt).toLocaleDateString('en-US', { 
            month: 'short', 
            day: '2-digit', 
            year: 'numeric' 
          })
        : 'N/A'
      }
    </Text>
  </View>
  
  <View style={styles.orderDetailRow}>
    <Ionicons name="cart-outline" size={s(18)} color="#666666" />
    <Text style={styles.orderDetailLabel}>Items:</Text>
    <Text style={styles.orderDetailValue}>
      {order?.items?.length || 0} item(s)
    </Text>
  </View>
  
  <View style={styles.orderDetailRow}>
    <Ionicons name="cash-outline" size={s(18)} color="#666666" />
    <Text style={styles.orderDetailLabel}>Total:</Text>
    <Text style={styles.orderDetailValue}>
      ₱{order?.total?.toFixed(2) || '0.00'}
    </Text>
  </View>
</View>
```

### Styling
```typescript
orderDetailsCard: {
  backgroundColor: '#F9F9F9',
  marginHorizontal: s(20),
  marginBottom: vs(20),
  padding: s(16),
  borderRadius: s(15),
  borderWidth: 1,
  borderColor: 'rgba(0, 0, 0, 0.05)',
},
orderDetailRow: {
  flexDirection: 'row',
  alignItems: 'center',
  marginBottom: vs(10),
},
orderDetailLabel: {
  fontSize: ms(13),
  fontWeight: '500',
  color: '#666666',
  marginLeft: s(8),
  marginRight: s(8),
  minWidth: s(90),
},
orderDetailValue: {
  fontSize: ms(13),
  fontWeight: '600',
  color: '#1E1E1E',
  flex: 1,
},
```

## Design Details

### Card Style
- **Background**: Light gray (#F9F9F9)
- **Border**: Subtle 1px border with 5% opacity
- **Border Radius**: 15px
- **Padding**: 16px
- **Margin**: 20px horizontal, 20px bottom

### Row Layout
- **Icons**: 18px Ionicons in gray (#666666)
- **Labels**: 13px medium weight in gray (#666666)
- **Values**: 13px semi-bold in dark gray (#1E1E1E)
- **Icon → Label → Value** layout with proper spacing

### Icons Used
- `person-outline` - Customer name
- `calendar-outline` - Order date
- `cart-outline` - Items count
- `cash-outline` - Total amount

## Benefits

### 1. Better Context
- Customer can verify they're reviewing the right order
- Helps remember the specific transaction
- Reduces confusion with multiple orders

### 2. Improved UX
- All relevant information in one place
- No need to navigate back to order details
- Professional, organized layout

### 3. Accurate Reviews
- Customer can reference order details while writing review
- Better feedback quality with full context
- Reduces "I don't remember" reviews

### 4. Trust Building
- Shows customer name = transparency
- Display order total = accountability
- Professional presentation = credibility

## Data Sources

### Order Data (Primary)
```typescript
order?.customerName    // Customer who placed order
order?.createdAt      // ISO timestamp
order?.items          // Array of order items
order?.total          // Order total amount
```

### User Context (Fallback)
```typescript
user?.name            // If customerName not in order
```

### Formatting
- **Date**: `toLocaleDateString()` with short month format
- **Amount**: `toFixed(2)` for currency precision
- **Items**: Array length with "(s)" plural handling

## Optional Enhancements (Future)

### 1. Expandable Item List
```
🛒 Items: 3 item(s) [▼]
  ├─ Product A (x2) - ₱100.00
  ├─ Product B (x1) - ₱150.00
  └─ Product C (x1) - ₱100.50
```

### 2. Order Status Badge
```
✅ Order Status: Completed
```

### 3. Payment Method
```
💳 Payment: GCash
```

### 4. Store Rating Display
```
⭐ Store Rating: 4.5 (120 reviews)
```

### 5. Previous Review Check
```
ℹ️ You already reviewed this store
   [View Previous Review]
```

## Files Modified

**app/(main)/(customer)/review.tsx**
- Added order details card JSX (lines 287-318)
- Added styling for orderDetailsCard (lines 533-561)
- Uses existing order and user data from props/context

## Testing Checklist

### Display Tests
- [ ] Customer name shows correctly
- [ ] Order date formats properly (e.g., "Jan 15, 2024")
- [ ] Items count is accurate
- [ ] Total amount shows with ₱ symbol and 2 decimals
- [ ] Icons align properly with text
- [ ] Card has proper spacing and styling

### Data Tests
- [ ] Order with customerName in data
- [ ] Order without customerName (uses user context)
- [ ] Order with missing createdAt (shows 'N/A')
- [ ] Order with 0 items (shows "0 item(s)")
- [ ] Order with 1 item (shows "1 item(s)")
- [ ] Order with multiple items (shows "X item(s)")

### Edge Cases
- [ ] Very long customer name (truncates properly)
- [ ] Very large total amount (formats correctly)
- [ ] Missing order data (shows fallbacks)
- [ ] Undefined user context (shows 'N/A')

## Summary

The review screen now provides complete order context with:
- ✅ Customer name for verification
- ✅ Order date for reference
- ✅ Items count for context
- ✅ Total amount for identification

This enhancement helps customers write better, more accurate reviews by providing all the information they need right on the review screen.
