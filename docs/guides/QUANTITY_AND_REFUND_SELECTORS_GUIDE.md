# QuantitySelector & RefundMethodSelector Component Guide

Quick reference guide for using the new QuantitySelector and RefundMethodSelector components.

---

## QuantitySelector

### Usage

```typescript
import { QuantitySelector } from '@/components/ui';

// Basic usage
<QuantitySelector
  value={quantity}
  onChange={(newValue) => setQuantity(newValue)}
/>

// With label and custom min/max
<QuantitySelector
  label="Quantity to Return"
  value={selectedItem.quantityToReturn}
  min={1}
  max={item.quantity}
  onChange={(value) => updateQuantity(value)}
/>

// Disabled state
<QuantitySelector
  value={quantity}
  disabled={true}
  onChange={(value) => setQuantity(value)}
/>
```

### Props Reference

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| value | number | Yes | - | Current quantity value |
| onChange | (value: number) => void | Yes | - | Callback when value changes |
| min | number | No | 1 | Minimum allowed value |
| max | number | No | 99 | Maximum allowed value |
| disabled | boolean | No | false | Disable all interactions |
| label | string | No | - | Optional label above selector |

### Visual States

```
Normal:        [ - ]  [ 5 ]  [ + ]
Min reached:   [---]  [ 1 ]  [ + ]  (minus disabled)
Max reached:   [ - ]  [10 ]  [---] (plus disabled)
Disabled:      [---]  [ 5 ]  [---] (both disabled, faded)
```

### Design Specs

- Button size: 40x40px circular
- Decrement: Gray background (#F3F4F6)
- Increment: Primary green (#3BB77E)
- Quantity box: 50px min-width with gray background
- Font: Clash Grotesk Variable, 18px, weight 600

---

## RefundMethodSelector

### Usage

```typescript
import { RefundMethodSelector, RefundMethodType } from '@/components/ui';

// Basic usage
const [refundMethod, setRefundMethod] = useState<RefundMethodType>('wallet');

<RefundMethodSelector
  selectedMethod={refundMethod}
  onMethodSelect={(method) => setRefundMethod(method)}
/>

// With custom label
<RefundMethodSelector
  label="Choose Refund Method"
  selectedMethod={refundMethod}
  onMethodSelect={(method) => setRefundMethod(method)}
/>

// Disabled state
<RefundMethodSelector
  selectedMethod={refundMethod}
  onMethodSelect={(method) => setRefundMethod(method)}
  disabled={true}
/>
```

### Props Reference

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| selectedMethod | RefundMethodType | Yes | - | Currently selected refund method |
| onMethodSelect | (method: RefundMethodType) => void | Yes | - | Callback when selection changes |
| label | string | No | 'Refund Method' | Label shown above cards |
| disabled | boolean | No | false | Disable all interactions |

### RefundMethodType

```typescript
type RefundMethodType = 'wallet' | 'gcash' | 'paymaya' | 'cash' | 'store_credit';
```

### Visual Layout

```
┌──────────────────────────────────────┐
│  💰  App Wallet              ( )     │  ← Unselected
└──────────────────────────────────────┘

┌══════════════════════════════════════┐
│  [G]  GCash                  (●)     │  ← Selected (green border)
╘══════════════════════════════════════╛

┌──────────────────────────────────────┐
│  [P]  PayMaya                ( )     │
└──────────────────────────────────────┘

┌──────────────────────────────────────┐
│  ₱  Cash                     ( )     │
└──────────────────────────────────────┘
```

### Design Specs

- Card height: 60px
- Spacing between cards: 15px vertical gap
- Border: 2px (transparent → green on selection)
- Border radius: 15px
- Icon size: 40x40px
- Font: Clash Grotesk Variable, 16px, weight 500
- Selected shadow: Enhanced with green tint

### Icon Details

| Method | Icon Type | Source |
|--------|-----------|--------|
| wallet | Emoji | 💰 in green circle |
| gcash | Image | `src/assets/images/payment/gcash-icon.png` |
| paymaya | Image | `src/assets/images/payment/paymaya-icon.png` |
| cash | Text | ₱ symbol in green circle |
| store_credit | Not implemented | Future enhancement |

---

## Integration Examples

### Return Request Screen

```typescript
// State
const [selectedItems, setSelectedItems] = useState<Map<string, SelectedReturnItem>>(new Map());
const [refundMethod, setRefundMethod] = useState<RefundMethodType>('wallet');

// Update quantity handler
const updateQuantityToReturn = (productId: string, quantity: number) => {
  setSelectedItems(prev => {
    const newMap = new Map(prev);
    const item = newMap.get(productId);
    if (item) {
      newMap.set(productId, { ...item, quantityToReturn: quantity });
    }
    return newMap;
  });
};

// Render
{selectedItems.has(item.productId) && (
  <>
    <QuantitySelector
      label="Quantity to Return"
      value={selectedItems.get(item.productId)!.quantityToReturn}
      min={1}
      max={item.quantity}
      onChange={(value) => updateQuantityToReturn(item.productId, value)}
    />

    {/* Other fields... */}
  </>
)}

{/* Refund Method Section */}
<RefundMethodSelector
  label="Refund Method"
  selectedMethod={refundMethod}
  onMethodSelect={(method) => setRefundMethod(method)}
/>
```

### Cart/Checkout Screen

```typescript
// Cart item quantity adjustment
<QuantitySelector
  value={cartItem.quantity}
  min={1}
  max={availableStock}
  onChange={(newQty) => updateCartQuantity(cartItem.id, newQty)}
/>
```

### Exchange/Swap Screen

```typescript
// Exchange item quantity
<QuantitySelector
  label="Items to Exchange"
  value={exchangeQty}
  min={1}
  max={purchasedQty}
  onChange={setExchangeQty}
/>
```

---

## Styling Customization

Both components follow TindaGo design system and are responsive. Customization should be done by:

1. **Modifying component files directly** for permanent changes
2. **Wrapping in custom container** for screen-specific spacing
3. **Using props** for behavioral changes

### Example: Custom Spacing

```typescript
<View style={{ marginBottom: 30 }}>
  <QuantitySelector
    value={qty}
    onChange={setQty}
  />
</View>
```

---

## Accessibility Notes

### Touch Targets
- All buttons meet minimum 40x40px touch target
- Adequate spacing between interactive elements

### Visual Feedback
- Clear disabled states with reduced opacity
- Selected states with enhanced borders and shadows
- Touch feedback with activeOpacity={0.7}

### Future Improvements
- Add screen reader labels
- Implement haptic feedback
- Add keyboard navigation support

---

## Performance Considerations

### QuantitySelector
- No heavy computations
- Direct state updates
- Minimal re-renders

### RefundMethodSelector
- Images loaded once and cached
- No dynamic image loading
- Single selection state

---

## Common Patterns

### Validation with QuantitySelector

```typescript
const [quantity, setQuantity] = useState(1);
const [error, setError] = useState('');

const handleQuantityChange = (newQty: number) => {
  if (newQty > availableStock) {
    setError(`Only ${availableStock} available`);
    return;
  }
  setError('');
  setQuantity(newQty);
};

<QuantitySelector
  value={quantity}
  max={availableStock}
  onChange={handleQuantityChange}
/>
{error && <Text style={styles.error}>{error}</Text>}
```

### Conditional Refund Methods

```typescript
// Show only certain refund methods based on context
const getAvailableMethods = (): RefundMethodType[] => {
  if (originalPaymentMethod === 'cash') {
    return ['wallet', 'cash'];
  }
  return ['wallet', 'gcash', 'paymaya', 'cash'];
};

// Note: Current component shows all methods
// For conditional display, modify RefundMethodSelector.tsx
```

---

## Testing Checklist

### QuantitySelector
- [ ] Increment increases value
- [ ] Decrement decreases value
- [ ] Min boundary prevents further decrement
- [ ] Max boundary prevents further increment
- [ ] Disabled state prevents interaction
- [ ] onChange callback fires correctly
- [ ] Visual states render properly

### RefundMethodSelector
- [ ] All methods display correctly
- [ ] Selection changes on tap
- [ ] Radio button updates
- [ ] Green border appears on selection
- [ ] Icons/logos display correctly
- [ ] Disabled state prevents interaction
- [ ] onMethodSelect callback fires correctly

---

## Troubleshooting

### QuantitySelector Issues

**Problem**: Buttons don't respond
- Check: `disabled` prop not set to true
- Check: `onChange` callback is provided
- Check: Parent component state updates properly

**Problem**: Value doesn't update
- Check: Parent component updates state in `onChange`
- Check: `value` prop is controlled correctly

### RefundMethodSelector Issues

**Problem**: Icons don't display
- Check: Image assets exist in `src/assets/images/payment/`
- Check: Correct file paths in component
- Check: Images are PNG format

**Problem**: Selection doesn't change
- Check: `selectedMethod` state updates in `onMethodSelect`
- Check: Component receives updated `selectedMethod` prop

---

## Related Components

- **PaymentMethodSelector**: Similar pattern for payment selection
- **Dropdown**: Alternative for longer option lists
- **CheckboxWithText**: For multi-select scenarios
- **Button**: For primary actions after selection

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2025-11-20 | Initial release with both components |

---

## Support

For issues or questions:
1. Check this guide first
2. Review component source code
3. Check TindaGo design system docs
4. Refer to `RETURN_REQUEST_UI_UPDATE.md` for implementation details
