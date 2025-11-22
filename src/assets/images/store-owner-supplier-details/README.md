# Supplier Details Screen Assets

## Directory Purpose
This directory contains image assets for the Store Owner Supplier Details screen.

## Figma Design Reference
- **File Key**: 8I1Nr3vQZllDDknSevstvH
- **Node ID**: 1571-244
- **Screen**: Supplier Details (Individual Supplier View)

## Note on Figma API Access
Due to Figma API 403 Forbidden error during implementation, the screen was built following established TindaGo design patterns without direct Figma asset extraction.

## Assets Needed (When Figma Access is Restored)

### Icons
- `supplier-icon.png` - Supplier avatar/icon
- `phone-icon.png` - Call supplier icon
- `email-icon.png` - Email supplier icon
- `location-icon.png` - Address/location icon
- `purchase-order-icon.png` - Purchase order statistics icon
- `money-icon.png` - Total spent icon
- `products-icon.png` - Products count icon
- `cart-icon.png` - Buy product button icon

### Buttons
- `buy-product-button.png` - Primary action button for purchasing products
- `new-order-button.png` - Create new purchase order button
- `view-history-button.png` - View purchase history button

### Backgrounds
- `stat-card-bg.png` - Statistics card backgrounds (if custom)
- `product-card-bg.png` - Product list card backgrounds (if custom)

### Product Placeholders
- `product-placeholder.png` - Default product image when no image available

## Current Implementation
The screen currently uses:
- **Emoji icons** (🏪, 📦, 💰, 📋, etc.) as temporary placeholders
- **Ionicons** for standard UI elements (call, email, location, cart)
- **Text-based UI** following TindaGo design system
- **Color constants** from `src/constants/Colors.ts`
- **Responsive scaling** using s(), vs(), ms() functions

## Asset Extraction Instructions

When Figma API access is restored, use the following MCP command:

```javascript
mcp__Framelink_Figma_MCP__download_figma_images({
  fileKey: "8I1Nr3vQZllDDknSevstvH",
  nodes: [
    { nodeId: "1571-244", fileName: "supplier-icon.png" },
    // Add other node IDs as needed
  ],
  localPath: "C:\\CapsProj\\TindaGo\\src\\assets\\images\\store-owner-supplier-details",
  pngScale: 2
})
```

## Implementation Details

### Screen File
`app/(main)/(store-owner)/profile/supplier-details.tsx`

### Features Implemented
1. **Supplier Information Card**
   - Name, contact, email, address
   - Last purchase date
   - Call and email quick actions

2. **Statistics Dashboard**
   - Total purchase orders
   - Total amount spent
   - Number of different products
   - Average order value

3. **Product List**
   - All products purchased from supplier
   - Last purchase price per product
   - Total quantity purchased
   - Number of orders containing product
   - "Buy Product" button for each item

4. **Quick Actions**
   - New Purchase Order (with supplier pre-selected)
   - View Purchase History

### Navigation Flow
```
Supplier Dashboard → (tap supplier card) → Supplier Details
                                          ↓
                         Buy Product → Record Purchase Order (with supplier pre-filled)
                         View History → Purchase Order History (filtered by supplier)
```

### Data Source
The screen aggregates data from:
- `purchase_orders` collection in Firebase
- Filters by `storeOwnerId` and `supplierName`
- Calculates statistics from historical purchase data
- Shows last purchase price for each product

## Design System Compliance

### Colors Used
- Primary: `#3BB77E`
- White: `#FFFFFF`
- Dark Gray: `#1E1E1E`
- Text Secondary: `rgba(0, 0, 0, 0.6)`
- Light Green: `#EFFBE7`
- Background Gray: `#F6F6F6`

### Typography
- Font Family: Clash Grotesk Variable
- Title: 20px, weight 700
- Section Headers: 18px, weight 600
- Body Text: 14-15px, weight 400-500
- Caption: 11-13px, weight 400

### Responsive Scaling
- Baseline: 440x956 (standard TindaGo)
- Horizontal scaling: `s(value)`
- Vertical scaling: `vs(value)`
- Moderate scaling: `ms(value)`

### Component Patterns
- White cards with rounded corners (16px radius)
- Shadow elevation for depth
- Statistics cards with colored left borders
- Product cards with image + info layout
- Primary action buttons in green
- Secondary action buttons with border outline

## Future Enhancements

### Phase 1: Visual Polish
- [ ] Extract exact icons from Figma
- [ ] Replace emoji icons with proper SVG/PNG assets
- [ ] Add custom illustrations for empty states
- [ ] Implement exact color gradients from design

### Phase 2: Feature Additions
- [ ] Edit supplier information inline
- [ ] Add notes/tags to suppliers
- [ ] Export supplier data to CSV
- [ ] Add supplier performance metrics (delivery time, quality)
- [ ] Implement supplier comparison view

### Phase 3: Advanced Features
- [ ] Supplier favorites/pinning
- [ ] Price history charts per product
- [ ] Automatic reorder suggestions based on history
- [ ] Supplier contact sync with device contacts
- [ ] Multi-supplier product comparison

## Testing Checklist

- [ ] Screen loads successfully from supplier dashboard
- [ ] All supplier statistics display correctly
- [ ] Product list shows all items from purchase orders
- [ ] "Buy Product" button navigates with correct params
- [ ] Call/email buttons work with device integrations
- [ ] Refresh functionality works properly
- [ ] Empty states display when no data
- [ ] Navigation back to dashboard works
- [ ] All responsive scaling functions correctly on different devices
- [ ] Images load properly (when assets are added)

## Related Files

### Screens
- `app/(main)/(store-owner)/profile/supplier-dashboard.tsx` - Parent screen
- `app/(main)/(store-owner)/profile/record-purchase-order.tsx` - Navigation target
- `app/(main)/(store-owner)/profile/purchase-order-history.tsx` - Navigation target

### API
- `src/api/suppliers/index.ts` - Supplier data operations
- `src/api/purchaseOrders/index.ts` - Purchase order operations

### Models
- `src/models/Supplier.ts` - Supplier data types
- `src/models/PurchaseOrder.ts` - Purchase order data types

### Constants
- `src/constants/Colors.ts` - Color palette
- `src/constants/Fonts.ts` - Typography system
- `src/constants/responsive.ts` - Scaling functions

## Contact & Support
For issues with this screen or asset requirements, refer to:
- TindaGo project documentation: `C:\CapsProj\TindaGo\CLAUDE.md`
- Figma integration guide: `C:\CapsProj\TindaGo\doc\TindaGo-Design-to-Code-Agent.md`
