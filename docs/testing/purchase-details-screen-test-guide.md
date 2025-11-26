# Purchase Details Screen - Testing Guide

## Quick Test Instructions

### Prerequisites
1. Logged in as a store owner
2. Have at least one purchase order in the system
3. Access via Purchase Order History screen

### Navigation Path
```
Store Owner Home → Profile → Purchase History → [Click any purchase order]
```

### Direct Route (for debugging)
```
/(main)/(store-owner)/profile/purchase-details?purchaseOrderId={ORDER_ID}
```

## Test Scenarios

### 1. Pending Purchase Order
**Setup**: Create a new purchase order with status "pending"

**Expected Behavior**:
- ✅ Status badge shows "Pending" in orange (#FFA500)
- ✅ Timeline shows first dot active, second dot inactive
- ✅ "Mark as Delivered" button is visible
- ✅ Payment status badge displays (if payment method set)
- ✅ All product items display with images
- ✅ Total cost calculates correctly

**Actions to Test**:
1. Click "Mark as Delivered"
2. Confirm in alert dialog
3. Verify success message
4. Check inventory was updated
5. Verify navigation back to history

### 2. Delivered Purchase Order
**Setup**: Have a purchase order with status "received"

**Expected Behavior**:
- ✅ Status badge shows "Delivered" in green (#3BB77E)
- ✅ Timeline shows both dots active
- ✅ "Mark as Delivered" button is hidden
- ✅ Received date displays in details section
- ✅ Timeline timestamp shows received time

### 3. Cancelled Purchase Order
**Setup**: Purchase order with status "cancelled"

**Expected Behavior**:
- ✅ Status badge shows "Cancelled" in red (#E92B45)
- ✅ Timeline shows cancelled notice
- ✅ Red text indicates cancellation
- ✅ No action buttons visible
- ✅ All other information still displays

### 4. Payment Method Variations

#### Cash Payment
- ✅ Payment method badge shows cash icon
- ✅ Payment status shows "Paid" or "Unpaid"

#### GCash Payment
- ✅ GCash icon displays correctly
- ✅ Payment method badge shows "GCash"

#### PayMaya Payment
- ✅ PayMaya icon displays correctly
- ✅ Payment method badge shows "PayMaya"

#### Debt/Loan
- ✅ Debt icon displays
- ✅ Shows "Debt/Loan" label

### 5. Supplier Information

#### With Supplier
**Data**: Purchase order has supplierName and supplierContact
- ✅ Supplier card displays
- ✅ Supplier name shows correctly
- ✅ Contact information visible
- ✅ Store emoji icon (🏪) displays

#### Without Supplier
**Data**: Purchase order has no supplier information
- ✅ Supplier card is hidden
- ✅ Layout adjusts gracefully
- ✅ No empty space or broken layout

### 6. Product Items List

#### Single Item
- ✅ Item card displays with all information
- ✅ Quantity badge shows correctly
- ✅ Subtotal calculates properly

#### Multiple Items (2-5)
- ✅ All items display in order
- ✅ Dividers appear between items
- ✅ Total cost sums correctly
- ✅ Item count badge shows correct number

#### Many Items (10+)
- ✅ List is scrollable
- ✅ Performance remains smooth
- ✅ All items accessible
- ✅ Total still accurate

#### Product Images
**Missing Image**:
- ✅ Placeholder shows "No Image" text
- ✅ Gray background displays

**With Image**:
- ✅ Product image loads and displays
- ✅ Image fits container (48x48)
- ✅ Proper aspect ratio maintained

### 7. Notes and Details

#### With Notes
**Data**: Purchase order has notes field populated
- ✅ Notes section displays
- ✅ Text wraps properly for long notes
- ✅ Multiline notes format correctly

#### Without Notes
**Data**: Purchase order has no notes
- ✅ Notes section is hidden
- ✅ No empty or broken layout

### 8. Edge Cases

#### Invalid Order ID
**Test**: Navigate with non-existent purchaseOrderId
- ✅ Shows "Purchase order not found" message
- ✅ "Go Back" button displays
- ✅ Clicking back returns to previous screen

#### Missing Data Fields
**Test**: Purchase order with minimal data
- ✅ All optional fields handle gracefully
- ✅ No crashes or undefined errors
- ✅ Default values display where appropriate

#### Very Long Product Names
**Test**: Product name with 100+ characters
- ✅ Text truncates with ellipsis (...)
- ✅ Maximum 2 lines display
- ✅ Layout doesn't break

#### Large Numbers
**Test**: Total cost > 1,000,000
- ✅ Currency formats with proper decimals
- ✅ Number doesn't overflow container
- ✅ Readable and properly formatted

### 9. Real-time Updates

**Setup**: Open purchase details on two devices

**Test Steps**:
1. Change status on device 1
2. Observe device 2

**Expected**:
- ✅ Status updates within 3 seconds
- ✅ Timeline reflects new status
- ✅ No manual refresh needed
- ✅ Action buttons update appropriately

### 10. Loading States

#### Initial Load
- ✅ Spinner displays with "Loading purchase details..." text
- ✅ Green primary color spinner
- ✅ Centered on screen

#### Mark as Delivered Action
- ✅ Button shows loading spinner
- ✅ Button is disabled during action
- ✅ No double-submission possible

### 11. Navigation

#### Back Button (Header)
- ✅ Returns to purchase order history
- ✅ Maintains history state
- ✅ Animation is smooth

#### After Successful Action
- ✅ Automatically navigates back
- ✅ History screen updates with new status
- ✅ Success alert displays first

### 12. Responsive Design

#### Small Devices (320px width)
- ✅ All elements fit without horizontal scroll
- ✅ Text remains readable
- ✅ Buttons remain clickable

#### Standard Devices (375px-430px)
- ✅ Layout uses full width effectively
- ✅ Proper spacing maintained
- ✅ Images display correctly

#### Large Devices (500px+)
- ✅ Content centers appropriately
- ✅ No excessive whitespace
- ✅ Elements remain proportional

### 13. Performance

#### Load Time
- ✅ Screen appears within 2 seconds
- ✅ Data populates within 3 seconds
- ✅ Images load progressively

#### Interaction Responsiveness
- ✅ Button presses respond immediately
- ✅ Scrolling is smooth (60 FPS)
- ✅ No lag or stutter

#### Memory Usage
- ✅ No memory leaks on repeated navigation
- ✅ Images release properly
- ✅ Firebase listeners cleanup on unmount

## Regression Testing Checklist

Run these tests after any changes to related code:

### Component Changes
- [ ] PaymentMethodBadge updates
- [ ] PurchaseOrder model changes
- [ ] Image helper modifications

### API Changes
- [ ] purchaseOrders API updates
- [ ] Firebase structure changes
- [ ] markAsReceived function modifications

### Navigation Changes
- [ ] Expo Router updates
- [ ] Route parameter changes
- [ ] Deep linking modifications

## Bug Report Template

```markdown
**Issue**: [Brief description]

**Steps to Reproduce**:
1. Navigate to Purchase Details
2. [Specific actions]
3. [Expected vs Actual]

**Purchase Order Data**:
- ID: [Order ID]
- Status: [pending/received/cancelled]
- Items: [Number of items]
- Payment Method: [cash/gcash/paymaya/debt]

**Device Info**:
- OS: [Android/iOS]
- Version: [OS version]
- Screen Size: [Width x Height]

**Screenshots**: [Attach if applicable]

**Console Errors**: [Copy any error messages]
```

## Performance Benchmarks

### Target Metrics
- **Initial Load**: < 2 seconds
- **Real-time Update**: < 3 seconds
- **Mark as Delivered**: < 5 seconds
- **Scroll Performance**: 60 FPS
- **Memory Usage**: < 50MB increase

### Measuring Performance
```javascript
// Add to component for debugging
console.time('PurchaseDetails:Load');
// ... after data loads
console.timeEnd('PurchaseDetails:Load');
```

## Accessibility Testing

### Screen Reader
- [ ] All text elements are readable
- [ ] Buttons have accessible labels
- [ ] Navigation is logical
- [ ] Status changes announced

### Touch Targets
- [ ] All buttons minimum 44x44 points
- [ ] Adequate spacing between elements
- [ ] No accidental taps

### Color Contrast
- [ ] Text readable against backgrounds
- [ ] Status colors distinguishable
- [ ] Meets WCAG AA standards

## Cross-Platform Testing

### iOS Testing
- [ ] Fonts render correctly
- [ ] Shadows display properly
- [ ] Navigation works smoothly
- [ ] Status bar styled correctly

### Android Testing
- [ ] Material design compliance
- [ ] Back button behavior correct
- [ ] Ripple effects work
- [ ] Status bar color matches

## Security Testing

### Data Validation
- [ ] Order ID validated
- [ ] User ownership verified
- [ ] No unauthorized access possible
- [ ] Firebase rules enforced

### Input Sanitization
- [ ] Notes field sanitized
- [ ] No XSS vulnerabilities
- [ ] Special characters handled

## Test Data Setup

### Sample Purchase Orders

#### Minimal Order
```typescript
{
  id: "PO-TEST-001",
  purchaseOrderNumber: "PO-2025-001",
  status: "pending",
  items: [
    {
      productId: "prod1",
      productName: "Test Product",
      quantity: 1,
      costPerUnit: 50,
      subtotal: 50,
      productSize: "500",
      unit: "g"
    }
  ],
  totalCost: 50,
  purchaseDate: "2025-11-25T10:00:00Z",
  createdAt: "2025-11-25T10:00:00Z",
  updatedAt: "2025-11-25T10:00:00Z"
}
```

#### Complete Order
```typescript
{
  id: "PO-TEST-002",
  purchaseOrderNumber: "PO-2025-002",
  status: "received",
  supplierName: "Puregold",
  supplierContact: "+63 912 345 6789",
  paymentMethod: "gcash",
  paymentStatus: "paid",
  notes: "Delivered on time. All items in good condition.",
  items: [
    // ... multiple items
  ],
  totalCost: 5500,
  purchaseDate: "2025-11-20T10:00:00Z",
  receivedDate: "2025-11-21T14:30:00Z",
  createdAt: "2025-11-20T10:00:00Z",
  updatedAt: "2025-11-21T14:30:00Z"
}
```

## Automated Testing Scripts

### Jest Unit Tests
```bash
npm test -- --testPathPattern=purchase-details
```

### E2E Tests (if implemented)
```bash
# Detox or Appium tests
npm run e2e:purchase-details
```

## Sign-off Checklist

Before marking as complete:
- [ ] All test scenarios pass
- [ ] No console errors
- [ ] TypeScript compiles without errors
- [ ] Performance meets benchmarks
- [ ] Works on iOS and Android
- [ ] Responsive on all screen sizes
- [ ] Documentation complete
- [ ] Code reviewed
- [ ] Deployed to staging
- [ ] User acceptance testing passed

## Known Issues / Limitations

Document any known issues here:

1. **None currently identified**

## Support Contacts

- **Developer**: [Your name]
- **Figma Design**: Reference 8I1Nr3vQZllDDknSevstvH:1681:163
- **Related Module**: Purchase Orders & Inventory Management
