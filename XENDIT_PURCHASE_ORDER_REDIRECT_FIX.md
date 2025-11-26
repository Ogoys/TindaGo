# Xendit Purchase Order Redirect Fix

## Problem
After completing a Xendit payment for a purchase order (store-owner paying supplier via GCash/PayMaya), the app was:
1. Showing the purchase-details page briefly
2. Then redirecting to the customer home page
3. User loses context and can't see their purchase order

## Root Cause
The `app/payment/success.tsx` file was hardcoded to ALWAYS redirect to `/(main)/(customer)/home` after any Xendit payment, regardless of whether it was:
- A customer order payment (should go to customer home)
- A purchase order payment (should go to store-owner purchase-details)

## Solution

### Changes Made

#### 1. Fixed `app/payment/success.tsx`
**Before:**
```typescript
useEffect(() => {
  const timer = setTimeout(() => {
    router.replace('/(main)/(customer)/home');
  }, 1000);
  return () => clearTimeout(timer);
}, [router]);
```

**After:**
```typescript
useEffect(() => {
  const handleRedirect = async () => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        router.replace('/(auth)/onboarding');
        return;
      }

      // Check if this is a purchase order payment
      const pendingNavKey = `pending_purchase_order_navigation_${currentUser.uid}`;
      const pendingPurchaseOrderId = await AsyncStorage.getItem(pendingNavKey);
      
      if (pendingPurchaseOrderId) {
        // Purchase order payment - redirect to store-owner purchase details
        await AsyncStorage.removeItem(pendingNavKey);
        router.replace({
          pathname: '/(main)/(store-owner)/profile/purchase-details',
          params: { purchaseOrderId: pendingPurchaseOrderId }
        });
      } else {
        // Customer order payment - redirect to customer home
        router.replace('/(main)/(customer)/home');
      }
    } catch (error) {
      console.error('[Payment Success] Error handling redirect:', error);
      router.replace('/(main)/(customer)/home');
    }
  };

  const timer = setTimeout(() => {
    handleRedirect();
  }, 1000);
  return () => clearTimeout(timer);
}, [router]);
```

#### 2. Simplified `app/(main)/(store-owner)/profile/purchase-payment.tsx`
**Before:**
```typescript
onPress: async () => {
  // Navigate to purchase-details first
  router.replace({
    pathname: '/(main)/(store-owner)/profile/purchase-details',
    params: { purchaseOrderId: poResult.purchaseOrderId, fromPayment: 'true' }
  });
  
  // Then open Xendit (with delay)
  setTimeout(async () => {
    await Linking.openURL(paymentResult.invoiceUrl!);
  }, 500);
}
```

**After:**
```typescript
onPress: async () => {
  // Open Xendit directly
  // When user returns, payment/success.tsx will handle the redirect
  await Linking.openURL(paymentResult.invoiceUrl!);
}
```

## How It Works Now

### Flow for Purchase Order Payment (Store-Owner)
1. Store owner creates purchase order, selects GCash/PayMaya payment
2. `purchase-payment.tsx` creates the purchase order
3. Saves purchase order ID to AsyncStorage: `pending_purchase_order_navigation_{userId}`
4. Opens Xendit payment URL directly
5. User completes payment on Xendit
6. Xendit redirects back to app via deep link: `tindago://payment/success`
7. `payment/success.tsx` checks AsyncStorage
8. Finds pending purchase order ID
9. Redirects to store-owner purchase-details page with the purchase order ID
10. ✅ User stays on purchase-details page

### Flow for Customer Order Payment (Customer)
1. Customer creates order, proceeds to payment
2. Opens Xendit payment URL
3. User completes payment on Xendit
4. Xendit redirects back to app via deep link: `tindago://payment/success`
5. `payment/success.tsx` checks AsyncStorage
6. No pending purchase order found
7. Redirects to customer home page
8. ✅ Payment listener shows OrderCompleteModal

## Testing Checklist

### Purchase Order Payment (Store-Owner)
- [ ] Create purchase order with supplier info
- [ ] Select GCash or PayMaya as payment method
- [ ] Click "Proceed to Checkout"
- [ ] Verify alert shows "Redirecting to Payment"
- [ ] Click "Continue"
- [ ] Verify Xendit payment page opens
- [ ] Complete payment (use test mode)
- [ ] Verify app redirects back
- [ ] ✅ Verify lands on store-owner purchase-details page
- [ ] ✅ Verify purchase order details are displayed
- [ ] ✅ Verify does NOT navigate to customer home page

### Customer Order Payment (Customer)
- [ ] Create customer order
- [ ] Proceed to payment
- [ ] Complete Xendit payment
- [ ] Verify app redirects to customer home
- [ ] Verify OrderCompleteModal appears

## Key Files Changed
1. `app/payment/success.tsx` - Added logic to distinguish purchase orders vs customer orders
2. `app/(main)/(store-owner)/profile/purchase-payment.tsx` - Simplified Xendit redirect flow

## AsyncStorage Keys Used
- `pending_purchase_order_navigation_{userId}` - Stores purchase order ID when awaiting Xendit return
- Set in: `purchase-payment.tsx` (line 308-311)
- Read in: `payment/success.tsx` (new code)
- Also read in: `app/index.tsx` (line 56-68) - as fallback for app restarts

## Deep Link Configuration
The app uses the `tindago://` scheme configured in `app.json` (line 8).

Xendit redirect URLs should be configured in the admin API as:
- Success: `tindago://payment/success`
- Failure: `tindago://payment/success` (same - we handle status internally)

## Notes
- The `index.tsx` file already had similar logic for handling purchase order navigation on app restart
- This fix ensures the redirect works even when the app is already running
- The AsyncStorage key is cleaned up after successful navigation to prevent stale data
