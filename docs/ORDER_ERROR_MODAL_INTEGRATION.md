# Order Error Modal Integration Guide

## Overview

The `OrderErrorModal` is a reusable modal component for displaying error messages when order placement fails. It follows the same design pattern as the `OrderCompleteModal` with smooth animations and pixel-perfect Figma conversion.

## Component Details

**File Location:** `C:\Users\Toph\Desktop\Github\Projects\React Native Projects\TindaGo\src\components\ui\OrderErrorModal.tsx`

**Figma Reference:**
- File Key: 8I1Nr3vQZllDDknSevstvH
- Node ID: 1057-1494
- Component Name: Order Error
- Baseline: 400x500

## Component API

```typescript
interface OrderErrorModalProps {
  visible: boolean;        // Controls modal visibility
  onClose: () => void;     // Called when modal should close (backdrop press)
  onRetry: () => void;     // Called when user taps "Try Again" button
  errorMessage?: string;   // Optional custom error message
}
```

## Features

1. **Smooth Animations**
   - 300ms fade in with spring scale animation
   - 200ms fade out animation
   - Matches OrderCompleteModal animation timing

2. **User Actions**
   - Try Again: Retries the failed order placement
   - Back to Home: Navigates to customer home screen
   - Backdrop Dismiss: Closes modal when tapping outside

3. **Customizable Error Message**
   - Default message: "Sorry, somethings went wrong.\nPlease try again to continue your order."
   - Can be overridden with custom `errorMessage` prop

4. **Pixel-Perfect Design**
   - Uses exact Figma coordinates with baseline responsive scaling
   - Error icon (NotApproved) from Figma
   - Proper typography, spacing, and shadows

## Assets Downloaded

All assets are stored in: `src/assets/images/order-error/`

**Files:**
1. `error-icon.png` - Red/gradient error icon (180x180px @ 3x scale)
2. `figma-8I1Nr3vQZllDDknSevstvH-1057-1494-2025-10-19T17-54-23-219Z.json` - Figma design data

## Integration Example: Payment Screen

Here's how to integrate the OrderErrorModal into the payment.tsx screen:

### Step 1: Import the Component

```typescript
import { OrderErrorModal } from '../../../src/components/ui';
```

### Step 2: Add State Management

```typescript
const [showErrorModal, setShowErrorModal] = useState(false);
const [paymentError, setPaymentError] = useState<string | undefined>(undefined);
```

### Step 3: Update Payment Processing Logic

Replace the existing Alert.alert error handling with modal display:

```typescript
const handleProceedToCheckout = async () => {
  if (!selectedPayment) {
    Alert.alert('Select Payment Method', 'Please select a payment method to continue');
    return;
  }

  if (!user) {
    Alert.alert('Error', 'Please sign in to continue');
    router.push('/(auth)/signin');
    return;
  }

  setProcessing(true);

  try {
    if (selectedPayment === 'cash') {
      // Cash on Pickup - create order in Firebase
      const orderId = await createOrder(user.id, orderSummary, 'cash');

      if (orderId) {
        // Show success modal (OrderCompleteModal)
        setShowCompleteModal(true);
      } else {
        // Show error modal
        setPaymentError('Failed to create your order. Please try again.');
        setShowErrorModal(true);
      }
    } else if (selectedPayment === 'gcash') {
      // GCash payment - would integrate with GCash API
      try {
        const result = await processGCashPayment(orderSummary);
        if (result.success) {
          setShowCompleteModal(true);
        } else {
          setPaymentError('GCash payment failed. Please check your account and try again.');
          setShowErrorModal(true);
        }
      } catch (error) {
        setPaymentError('Unable to connect to GCash. Please try again later.');
        setShowErrorModal(true);
      }
    } else if (selectedPayment === 'paymaya') {
      // PayMaya payment - would integrate with PayMaya API
      try {
        const result = await processPayMayaPayment(orderSummary);
        if (result.success) {
          setShowCompleteModal(true);
        } else {
          setPaymentError('PayMaya payment failed. Please check your account and try again.');
          setShowErrorModal(true);
        }
      } catch (error) {
        setPaymentError('Unable to connect to PayMaya. Please try again later.');
        setShowErrorModal(true);
      }
    }
  } catch (error) {
    console.error('Error processing payment:', error);
    // Show error modal instead of Alert
    setPaymentError('An unexpected error occurred. Please try again.');
    setShowErrorModal(true);
  } finally {
    setProcessing(false);
  }
};
```

### Step 4: Add Retry Handler

```typescript
const handleRetryPayment = () => {
  // Reset error state
  setPaymentError(undefined);
  // Retry the payment
  handleProceedToCheckout();
};
```

### Step 5: Add Modal to JSX

Add this before the closing `</SafeAreaView>` tag:

```typescript
{/* Order Error Modal */}
<OrderErrorModal
  visible={showErrorModal}
  onClose={() => setShowErrorModal(false)}
  onRetry={handleRetryPayment}
  errorMessage={paymentError}
/>
```

## Complete Integration Example

Here's the complete modified payment.tsx with OrderErrorModal integration:

```typescript
import { OrderErrorModal, OrderCompleteModal } from '../../../src/components/ui';

const PaymentScreen = () => {
  const router = useRouter();
  const { user } = useUser();

  const [selectedPayment, setSelectedPayment] = useState<PaymentMethod>(null);
  const [processing, setProcessing] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [paymentError, setPaymentError] = useState<string | undefined>(undefined);
  const [orderId, setOrderId] = useState<string>('');

  // ... other code ...

  const handleProceedToCheckout = async () => {
    // Validation...

    setProcessing(true);

    try {
      // Attempt to create order
      const newOrderId = await createOrder(user.id, orderSummary, selectedPayment);

      if (newOrderId) {
        setOrderId(newOrderId);
        setShowCompleteModal(true);
      } else {
        setPaymentError('Failed to create your order. Please try again.');
        setShowErrorModal(true);
      }
    } catch (error) {
      console.error('Error processing payment:', error);
      setPaymentError('An unexpected error occurred. Please try again.');
      setShowErrorModal(true);
    } finally {
      setProcessing(false);
    }
  };

  const handleRetryPayment = () => {
    setPaymentError(undefined);
    handleProceedToCheckout();
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* ... existing UI ... */}

      {/* Order Complete Modal */}
      <OrderCompleteModal
        visible={showCompleteModal}
        onClose={() => setShowCompleteModal(false)}
        orderId={orderId}
      />

      {/* Order Error Modal */}
      <OrderErrorModal
        visible={showErrorModal}
        onClose={() => setShowErrorModal(false)}
        onRetry={handleRetryPayment}
        errorMessage={paymentError}
      />
    </SafeAreaView>
  );
};
```

## Usage Examples

### Basic Usage (Default Error Message)

```typescript
<OrderErrorModal
  visible={showError}
  onClose={() => setShowError(false)}
  onRetry={handleRetry}
/>
```

### With Custom Error Message

```typescript
<OrderErrorModal
  visible={showError}
  onClose={() => setShowError(false)}
  onRetry={handleRetry}
  errorMessage="Payment gateway timeout. Please check your connection."
/>
```

### Network Error Example

```typescript
<OrderErrorModal
  visible={showError}
  onClose={() => setShowError(false)}
  onRetry={handleRetry}
  errorMessage="Unable to connect to server.\nPlease check your internet connection."
/>
```

### Insufficient Funds Example

```typescript
<OrderErrorModal
  visible={showError}
  onClose={() => setShowError(false)}
  onRetry={handleRetry}
  errorMessage="Insufficient funds in your account.\nPlease add balance and try again."
/>
```

## Error Message Best Practices

1. **Be Specific**: Tell users exactly what went wrong
   - Good: "GCash payment failed. Please check your PIN."
   - Bad: "Something went wrong."

2. **Provide Action**: Tell users what they can do
   - Good: "Connection timeout. Please check your internet and try again."
   - Bad: "Error occurred."

3. **Keep It Concise**: Use 1-2 lines maximum
   - Good: "Order limit exceeded.\nPlease reduce items and try again."
   - Bad: Long paragraphs

4. **Use Line Breaks**: Use `\n` for better readability
   ```typescript
   errorMessage="Payment declined.\nPlease use a different payment method."
   ```

## Common Error Scenarios

### 1. Payment Gateway Failure

```typescript
catch (error) {
  if (error.code === 'GATEWAY_TIMEOUT') {
    setPaymentError('Payment gateway timeout.\nPlease try again in a moment.');
  } else if (error.code === 'INSUFFICIENT_FUNDS') {
    setPaymentError('Insufficient funds.\nPlease add balance to your account.');
  } else {
    setPaymentError('Payment failed.\nPlease try a different payment method.');
  }
  setShowErrorModal(true);
}
```

### 2. Network Errors

```typescript
catch (error) {
  if (!navigator.onLine) {
    setPaymentError('No internet connection.\nPlease check your connection and try again.');
  } else {
    setPaymentError('Connection error.\nPlease try again in a moment.');
  }
  setShowErrorModal(true);
}
```

### 3. Firebase Errors

```typescript
catch (error) {
  if (error.code === 'PERMISSION_DENIED') {
    setPaymentError('Access denied.\nPlease sign in and try again.');
  } else if (error.code === 'UNAVAILABLE') {
    setPaymentError('Service temporarily unavailable.\nPlease try again later.');
  } else {
    setPaymentError('Failed to save order.\nPlease try again.');
  }
  setShowErrorModal(true);
}
```

## Animation Details

The modal uses the same animation pattern as OrderCompleteModal:

**Opening Animation (300ms):**
- Fade: 0 → 1 opacity over 300ms
- Scale: 0.8 → 1 with spring physics (friction: 8, tension: 40)

**Closing Animation (200ms):**
- Fade: 1 → 0 opacity over 200ms
- Scale: 1 → 0.8 over 200ms

## Styling Notes

**Colors:**
- Error icon: Red gradient (#DF2525 → #791414)
- Try Again button: Primary green (#3BB77E)
- Back to Home button: Gray with 50% opacity
- Title text: Dark gray (#1E1E1E)
- Description text: Dark gray with 50% opacity

**Typography:**
- Title: Clash Grotesk Variable, 20px, medium weight
- Description: Clash Grotesk Variable, 12px, normal weight
- Buttons: Clash Grotesk Variable, 14px, medium weight

**Shadows:**
- Modal: Box shadow with 0.25 opacity, 5px radius
- Buttons: Box shadow with 0.25 opacity, 5px radius

## Testing Checklist

- [ ] Modal appears with smooth animation
- [ ] Error icon displays correctly
- [ ] Custom error message displays when provided
- [ ] Default error message displays when no custom message
- [ ] "Try Again" button calls onRetry callback
- [ ] "Back to Home" button navigates to customer home
- [ ] Backdrop press closes modal
- [ ] Modal dismisses with smooth animation
- [ ] Multiple consecutive errors work correctly
- [ ] Works on different screen sizes

## Troubleshooting

**Issue: Modal doesn't appear**
- Check that `visible` prop is true
- Verify state management is correct
- Check console for import errors

**Issue: Error icon missing**
- Verify asset path: `src/assets/images/order-error/error-icon.png`
- Check that image was downloaded from Figma
- Rebuild app if using Expo

**Issue: Animation stutters**
- Ensure `useNativeDriver: true` is set
- Check for heavy operations during render
- Verify no conflicting animations

**Issue: Retry doesn't work**
- Check onRetry callback is defined
- Verify payment processing logic
- Check console for errors in retry handler

## Related Components

- **OrderCompleteModal**: Success modal for completed orders
- **Button**: Reusable button component (not used here, inline buttons)
- **Typography**: Text styling components (not used here, inline styles)

## Future Enhancements

Potential improvements for future versions:

1. **Auto-dismiss Timer**: Optional timeout to auto-close after X seconds
2. **Error Type Icons**: Different icons for different error types
3. **Haptic Feedback**: Vibration on error display
4. **Sound Effects**: Optional error sound
5. **Analytics Integration**: Track error types and frequencies
6. **Retry Limit**: Disable retry after X attempts
7. **Alternative Actions**: Additional buttons for specific error types

## Summary

The OrderErrorModal provides a user-friendly way to handle order failures with:
- Pixel-perfect Figma design conversion
- Smooth animations matching OrderCompleteModal
- Customizable error messaging
- Clear user actions (retry or go home)
- Easy integration into any order flow

For questions or issues, refer to the main CLAUDE.md documentation.
