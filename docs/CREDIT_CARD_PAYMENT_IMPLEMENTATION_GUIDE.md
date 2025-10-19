# Credit/Debit Card Payment Implementation Guide

## Overview

This guide explains how to add credit/debit card payment functionality to the TindaGo payment flow. Currently, the app supports:
- ✅ Cash on Pickup
- ⏳ GCash (placeholder)
- ⏳ PayMaya (placeholder)
- ❌ Credit/Debit Cards (not implemented)

---

## Payment Gateway Options for Philippines

### 1. **PayMongo** (Recommended for Philippines)
**Best for:** Philippine businesses, supports local and international cards

**Pros:**
- Philippine-based payment gateway
- Supports Visa, Mastercard, JCB, UnionPay
- Also supports GCash, GrabPay integration
- Developer-friendly API
- Reasonable fees (3.5% + ₱15 per transaction)
- Supports installments
- No monthly fees for basic plan

**Cons:**
- Requires business registration
- Payout takes 3-5 business days

**Implementation:**
```bash
npm install @paymongo/paymongo-js
```

**Code Example:**
```typescript
import Paymongo from '@paymongo/paymongo-js';

const paymongo = new Paymongo(process.env.PAYMONGO_SECRET_KEY);

// Create payment intent
const paymentIntent = await paymongo.paymentIntents.create({
  data: {
    attributes: {
      amount: orderSummary.grandTotal * 100, // Convert to centavos
      payment_method_allowed: ['card'],
      payment_method_options: {
        card: { request_three_d_secure: 'automatic' }
      },
      currency: 'PHP',
      description: `Order ${orderNumber}`,
      statement_descriptor: 'TindaGo Purchase'
    }
  }
});

// Create payment method (card details)
const paymentMethod = await paymongo.paymentMethods.create({
  data: {
    attributes: {
      type: 'card',
      details: {
        card_number: cardNumber,
        exp_month: expMonth,
        exp_year: expYear,
        cvc: cvc
      },
      billing: {
        name: customerName,
        email: customerEmail,
        phone: customerPhone
      }
    }
  }
});

// Attach payment method to intent
await paymongo.paymentIntents.attach(paymentIntent.id, {
  data: {
    attributes: {
      payment_method: paymentMethod.id
    }
  }
});
```

**Website:** https://paymongo.com

---

### 2. **Stripe** (International Standard)
**Best for:** International businesses, global reach

**Pros:**
- Industry standard, very reliable
- Excellent documentation
- React Native SDK available
- Supports 135+ currencies
- Advanced fraud detection
- Split payments, subscriptions

**Cons:**
- Higher fees (3.9% + ₱15 for Philippine cards)
- Requires USD bank account for payouts
- Complex setup for Philippine businesses

**Implementation:**
```bash
npm install @stripe/stripe-react-native
```

**Code Example:**
```typescript
import { useStripe } from '@stripe/stripe-react-native';

const { confirmPayment } = useStripe();

// Create payment intent on your backend
const response = await fetch('https://your-api.com/create-payment-intent', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ amount: orderSummary.grandTotal })
});
const { clientSecret } = await response.json();

// Confirm payment
const { error, paymentIntent } = await confirmPayment(clientSecret, {
  paymentMethodType: 'Card',
  paymentMethodData: {
    billingDetails: {
      name: customerName,
      email: customerEmail
    }
  }
});

if (error) {
  setErrorMessage(error.message);
  setShowErrorModal(true);
} else if (paymentIntent.status === 'Succeeded') {
  // Order successful
  setShowSuccessModal(true);
}
```

**Website:** https://stripe.com

---

### 3. **PayMaya Checkout (Maya Business)**
**Best for:** Integration with existing PayMaya ecosystem

**Pros:**
- Philippine customers already familiar with PayMaya
- Supports cards, PayMaya wallet, QR codes
- Good for mobile commerce
- Competitive fees (2.5-3.5%)
- Fast payouts (1-2 business days)

**Cons:**
- Requires Maya Business account verification
- Limited international card support compared to Stripe
- SDK documentation less comprehensive

**Implementation:**
```bash
npm install paymaya-js-sdk
```

**Website:** https://enterprise.paymaya.com

---

### 4. **Xendit**
**Best for:** Southeast Asian businesses

**Pros:**
- Supports Philippines, Indonesia, Malaysia
- Multiple payment methods (cards, e-wallets, bank transfers)
- Good API documentation
- Competitive fees
- Fast integration

**Cons:**
- Less known than Stripe/PayMongo
- Requires business verification

**Website:** https://xendit.co

---

## Implementation Steps for TindaGo

### Phase 1: Choose Payment Gateway
**Recommendation:** **PayMongo** - Best fit for Philippine sari-sari store marketplace

**Reasons:**
1. Philippine-focused
2. Supports both cards and e-wallets (GCash, GrabPay)
3. Easier business registration for Philippine entities
4. Good developer experience
5. Reasonable fees
6. Can handle both credit/debit cards AND GCash/PayMaya through one provider

---

### Phase 2: Setup and Configuration

#### 2.1 Register with PayMongo
1. Go to https://dashboard.paymongo.com/signup
2. Complete business verification:
   - Business name and address
   - Business registration documents (DTI/SEC)
   - Valid ID
   - Bank account for payouts
3. Get API keys:
   - Public key (for frontend)
   - Secret key (for backend - NEVER expose to frontend)

#### 2.2 Install Dependencies
```bash
# Install PayMongo SDK
npm install @paymongo/paymongo-js

# Install secure storage for payment info
npm install react-native-encrypted-storage
```

#### 2.3 Environment Variables
Add to `.env`:
```env
EXPO_PUBLIC_PAYMONGO_PUBLIC_KEY=pk_test_xxxxxxxxxxxxx
# NEVER put secret key in .env - use backend server instead
```

---

### Phase 3: Update Payment UI

#### 3.1 Add Credit Card Option to Payment Screen

Update `payment.tsx` to include credit/debit card option:

```typescript
type PaymentMethod = 'gcash' | 'paymaya' | 'cash' | 'card' | null;

// Add card payment option in JSX
<TouchableOpacity
  style={[
    styles.paymentOption,
    selectedPayment === 'card' && styles.paymentOptionSelected
  ]}
  onPress={() => handlePaymentMethodSelect('card')}
>
  <View style={styles.paymentOptionContent}>
    <Image
      source={require('../../../src/assets/images/payment/card-icon.png')}
      style={styles.paymentIcon}
    />
    <Text style={styles.paymentMethodText}>Credit / Debit Card</Text>
  </View>
  <View style={[
    styles.radioCircle,
    selectedPayment === 'card' && styles.radioCircleSelected
  ]}>
    {selectedPayment === 'card' && <View style={styles.radioCircleInner} />}
  </View>
</TouchableOpacity>
```

#### 3.2 Create Card Input Screen

Create `app/(main)/(customer)/card-payment.tsx`:

```typescript
import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

const CardPaymentScreen = () => {
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');
  const [cardholderName, setCardholderName] = useState('');

  const handlePayment = async () => {
    // Validate card details
    if (!validateCard()) {
      setErrorMessage('Invalid card details');
      setShowErrorModal(true);
      return;
    }

    // Process payment with PayMongo
    try {
      const result = await processCardPayment({
        cardNumber,
        expMonth: expiry.split('/')[0],
        expYear: expiry.split('/')[1],
        cvc,
        cardholderName,
        amount: orderSummary.grandTotal
      });

      if (result.success) {
        setShowSuccessModal(true);
      } else {
        setErrorMessage(result.error);
        setShowErrorModal(true);
      }
    } catch (error) {
      setErrorMessage('Payment processing failed');
      setShowErrorModal(true);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.formContainer}>
        {/* Card Number Input */}
        <TextInput
          style={styles.input}
          placeholder="Card Number"
          value={cardNumber}
          onChangeText={formatCardNumber}
          keyboardType="numeric"
          maxLength={19} // 16 digits + 3 spaces
          placeholderTextColor="#999"
        />

        {/* Expiry and CVC Row */}
        <View style={styles.row}>
          <TextInput
            style={[styles.input, styles.halfInput]}
            placeholder="MM/YY"
            value={expiry}
            onChangeText={formatExpiry}
            keyboardType="numeric"
            maxLength={5}
          />
          <TextInput
            style={[styles.input, styles.halfInput]}
            placeholder="CVC"
            value={cvc}
            onChangeText={setCvc}
            keyboardType="numeric"
            maxLength={4}
            secureTextEntry
          />
        </View>

        {/* Cardholder Name */}
        <TextInput
          style={styles.input}
          placeholder="Cardholder Name"
          value={cardholderName}
          onChangeText={setCardholderName}
          autoCapitalize="words"
        />

        {/* Security Badge */}
        <View style={styles.securityBadge}>
          <Text style={styles.securityText}>
            🔒 Your payment is secured with 256-bit SSL encryption
          </Text>
        </View>

        {/* Pay Button */}
        <TouchableOpacity
          style={styles.payButton}
          onPress={handlePayment}
        >
          <Text style={styles.payButtonText}>
            Pay ₱{orderSummary.grandTotal.toFixed(2)}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};
```

---

### Phase 4: Backend Integration (CRITICAL)

**⚠️ SECURITY WARNING:** Never process card payments entirely on the frontend!

You need a backend server to:
1. Securely store API secret keys
2. Create payment intents
3. Verify payment status
4. Handle webhooks
5. Prevent fraud

#### 4.1 Create Backend Server

**Option A: Firebase Cloud Functions**

Create `functions/src/payments.ts`:

```typescript
import * as functions from 'firebase-functions';
import Paymongo from '@paymongo/paymongo-js';

const paymongo = new Paymongo(functions.config().paymongo.secret_key);

export const createPaymentIntent = functions.https.onCall(async (data, context) => {
  // Verify user is authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { amount, orderId, description } = data;

  try {
    const paymentIntent = await paymongo.paymentIntents.create({
      data: {
        attributes: {
          amount: Math.round(amount * 100), // Convert to centavos
          payment_method_allowed: ['card'],
          currency: 'PHP',
          description: description || `Order ${orderId}`,
          statement_descriptor: 'TindaGo'
        }
      }
    });

    return {
      success: true,
      clientKey: paymentIntent.data.attributes.client_key,
      paymentIntentId: paymentIntent.data.id
    };
  } catch (error) {
    console.error('Payment intent creation failed:', error);
    throw new functions.https.HttpsError('internal', 'Payment processing failed');
  }
});

export const confirmPayment = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { paymentIntentId, paymentMethodId } = data;

  try {
    const result = await paymongo.paymentIntents.attach(paymentIntentId, {
      data: {
        attributes: {
          payment_method: paymentMethodId
        }
      }
    });

    return {
      success: result.data.attributes.status === 'succeeded',
      status: result.data.attributes.status
    };
  } catch (error) {
    throw new functions.https.HttpsError('internal', 'Payment confirmation failed');
  }
});
```

**Option B: Express.js Backend**

Create a separate Node.js server (recommended for production).

---

### Phase 5: Update Payment Flow Logic

Update `payment.tsx` checkout handler:

```typescript
const handleProceedToCheckout = async () => {
  if (!selectedPayment) {
    Alert.alert('Select Payment Method', 'Please select a payment method to continue');
    return;
  }

  setProcessing(true);

  try {
    if (selectedPayment === 'card') {
      // Navigate to card input screen
      router.push({
        pathname: '/(main)/(customer)/card-payment',
        params: {
          orderSummary: JSON.stringify(orderSummary),
          cartItems: JSON.stringify(cartItems)
        }
      });
      return;
    }

    if (selectedPayment === 'cash') {
      // Existing cash on pickup logic
      const orderId = await createOrder(orderData);
      if (orderId) {
        await remove(ref(database, `carts/${user.id}/items`));
        setCompletedOrderId(orderNumber);
        setShowSuccessModal(true);
      }
    }

    // ... rest of payment methods
  } catch (error) {
    setErrorMessage('Payment processing failed');
    setShowErrorModal(true);
  } finally {
    setProcessing(false);
  }
};
```

---

### Phase 6: Security Best Practices

#### 6.1 Never Store Raw Card Data
```typescript
// ❌ NEVER DO THIS
const cardData = {
  number: '4111111111111111',
  cvc: '123'
};
await set(ref(database, 'cards'), cardData); // ILLEGAL!
```

#### 6.2 Use Tokenization
```typescript
// ✅ CORRECT - Use tokens from PayMongo
const paymentMethod = await paymongo.paymentMethods.create({
  data: { attributes: { type: 'card', details: cardDetails } }
});

// Store only the token ID, never the actual card
await set(ref(database, `orders/${orderId}`), {
  paymentMethodId: paymentMethod.id, // Safe to store
  last4: paymentMethod.data.attributes.details.last4, // Safe to store
  brand: paymentMethod.data.attributes.details.brand // Safe to store
});
```

#### 6.3 Implement PCI DSS Compliance
- Never log card numbers
- Use HTTPS only
- Validate card input on frontend
- Process payments on secure backend
- Use tokenization
- Implement 3D Secure (required in Philippines)

---

## Recommended Implementation Order

### Phase 1: Basic Setup (Week 1)
1. ✅ Register PayMongo account
2. ✅ Complete business verification
3. ✅ Set up test API keys
4. ✅ Install PayMongo SDK

### Phase 2: UI Development (Week 2)
1. ✅ Add card payment option to payment screen
2. ✅ Create card input screen with validation
3. ✅ Add card brand detection (Visa, Mastercard, etc.)
4. ✅ Implement input formatting (spaces, expiry format)

### Phase 3: Backend Setup (Week 3)
1. ✅ Set up Firebase Cloud Functions OR Express server
2. ✅ Create payment intent endpoint
3. ✅ Create payment confirmation endpoint
4. ✅ Set up webhook handlers
5. ✅ Implement error handling

### Phase 4: Integration (Week 4)
1. ✅ Connect frontend to backend
2. ✅ Implement payment flow
3. ✅ Add 3D Secure authentication
4. ✅ Test with test cards

### Phase 5: Testing (Week 5)
1. ✅ Test successful payments
2. ✅ Test failed payments
3. ✅ Test 3D Secure flow
4. ✅ Test different card brands
5. ✅ Test error scenarios

### Phase 6: Production (Week 6)
1. ✅ Switch to production API keys
2. ✅ Complete final security audit
3. ✅ Deploy backend
4. ✅ Monitor transactions
5. ✅ Set up alerts

---

## Cost Estimation

### PayMongo Fees (Per Transaction)
- **Cards:** 3.5% + ₱15
- **GCash/GrabPay:** 2.5%

### Example Transaction:
- Order Total: ₱500
- Card Fee: ₱500 × 3.5% + ₱15 = ₱32.50
- You Receive: ₱467.50

### Monthly Costs (100 orders/month averaging ₱500):
- Total Sales: ₱50,000
- Total Fees: ₱3,250
- Net Revenue: ₱46,750

---

## Test Cards (PayMongo)

Use these for testing:

```
Successful Payment:
Card: 4123450131001381
Expiry: Any future date
CVC: Any 3 digits

3D Secure Authentication:
Card: 4120000000000007
Expiry: Any future date
CVC: Any 3 digits

Declined Payment:
Card: 4571736000000075
Expiry: Any future date
CVC: Any 3 digits
```

---

## Quick Start Guide

If you want to implement this NOW, here's the fastest path:

1. **Register PayMongo** (30 minutes)
   - Go to https://dashboard.paymongo.com/signup
   - Fill out business info
   - Get test API keys immediately

2. **Install SDK** (5 minutes)
   ```bash
   npm install @paymongo/paymongo-js
   ```

3. **Add Card Option** (30 minutes)
   - Add card icon to payment assets
   - Add card option to payment screen
   - Update PaymentMethod type

4. **Create Simple Card Form** (2 hours)
   - Create card input screen
   - Add validation
   - Add formatting

5. **Basic Backend** (3 hours)
   - Set up Firebase Cloud Function
   - Create payment intent endpoint
   - Test with PayMongo test cards

6. **Test End-to-End** (1 hour)
   - Test successful payment
   - Test failed payment
   - Verify order creation

**Total Time:** ~1 day of focused work

---

## Need Help?

**PayMongo Support:**
- Email: support@paymongo.com
- Chat: Available in dashboard
- Docs: https://developers.paymongo.com

**TindaGo Implementation Questions:**
- Check CLAUDE.md for project conventions
- Review existing payment.tsx for patterns
- Follow Firebase integration patterns from cart/orders

---

## Summary

**Best Option for TindaGo:** **PayMongo**

**Why:**
1. ✅ Philippine-focused
2. ✅ Supports cards + e-wallets (one provider for all)
3. ✅ Competitive fees
4. ✅ Easy integration
5. ✅ Good support
6. ✅ PCI-compliant (you don't handle raw card data)

**Implementation Complexity:** Medium (requires backend)

**Timeline:** 4-6 weeks for full production-ready implementation

**Alternative:** Start with Cash on Pickup + GCash/PayMaya, add cards later when business grows.
