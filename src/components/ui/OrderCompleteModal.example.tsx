/**
 * ORDER COMPLETE MODAL - USAGE EXAMPLE
 *
 * This file demonstrates how to integrate the OrderCompleteModal
 * into your payment flow or any order confirmation screen.
 */

import React, { useState } from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import { OrderCompleteModal } from './OrderCompleteModal';

// Example 1: Simple usage with manual trigger
export function SimpleExample() {
  const [modalVisible, setModalVisible] = useState(false);
  const [orderId, setOrderId] = useState('2024-001');

  const handleOrderPlaced = () => {
    // After successfully placing an order
    const newOrderId = 'ORD-2024-' + Date.now();
    setOrderId(newOrderId);
    setModalVisible(true);
  };

  return (
    <View>
      <TouchableOpacity onPress={handleOrderPlaced}>
        <Text>Place Order</Text>
      </TouchableOpacity>

      <OrderCompleteModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        orderId={orderId}
      />
    </View>
  );
}

// Example 2: Integration with Payment Screen
/**
 * Integration steps for payment.tsx:
 *
 * 1. Import the modal at the top of your payment screen:
 *    import { OrderCompleteModal } from '../../../src/components/ui';
 *
 * 2. Add state variables to manage the modal:
 *    const [orderCompleteVisible, setOrderCompleteVisible] = useState(false);
 *    const [completedOrderId, setCompletedOrderId] = useState('');
 *
 * 3. Modify the handleProceedToCheckout function:
 */

// BEFORE (Old Alert.alert implementation):
/*
if (selectedPayment === 'cash') {
  Alert.alert(
    'Order Confirmed!',
    'Your order has been placed. Please pay cash when you pick up your items.',
    [
      {
        text: 'View Orders',
        onPress: () => router.push('/(main)/(customer)/orders'),
      },
      {
        text: 'Continue Shopping',
        onPress: () => router.push('/(main)/(customer)/home'),
      },
    ]
  );
}
*/

// AFTER (New Modal implementation):
/*
if (selectedPayment === 'cash') {
  // Generate order ID (in real app, this comes from Firebase)
  const newOrderId = `ORD-${new Date().getFullYear()}-${Date.now()}`;

  // TODO: Save order to Firebase here
  // const orderRef = await push(ref(database, 'orders'), orderData);

  // Show success modal
  setCompletedOrderId(newOrderId);
  setOrderCompleteVisible(true);
}
*/

// 4. Add the modal component in your JSX (after the main content, before </SafeAreaView>):
/*
<OrderCompleteModal
  visible={orderCompleteVisible}
  onClose={() => setOrderCompleteVisible(false)}
  orderId={completedOrderId}
/>
*/

// Example 3: Complete modified handleProceedToCheckout function
export const EXAMPLE_HANDLE_CHECKOUT = `
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
      // Generate order ID
      const timestamp = Date.now();
      const newOrderId = \`ORD-\${new Date().getFullYear()}-\${timestamp}\`;

      // TODO: Create order in Firebase
      // const orderData = {
      //   userId: user.id,
      //   items: cartItems,
      //   subtotal: orderSummary.subtotal,
      //   serviceFee: orderSummary.serviceFee,
      //   grandTotal: orderSummary.grandTotal,
      //   paymentMethod: 'cash',
      //   status: 'pending',
      //   createdAt: timestamp,
      // };
      // const orderRef = await push(ref(database, 'orders'), orderData);

      // Show success modal
      setCompletedOrderId(newOrderId);
      setOrderCompleteVisible(true);

    } else if (selectedPayment === 'gcash') {
      Alert.alert(
        'GCash Payment',
        'GCash integration coming soon! For now, please select Cash on Pickup.',
        [{ text: 'OK' }]
      );
    } else if (selectedPayment === 'paymaya') {
      Alert.alert(
        'PayMaya Payment',
        'PayMaya integration coming soon! For now, please select Cash on Pickup.',
        [{ text: 'OK' }]
      );
    }
  } catch (error) {
    console.error('Error processing payment:', error);
    Alert.alert('Error', 'Failed to process payment. Please try again.');
  } finally {
    setProcessing(false);
  }
};
`;

// Example 4: Full payment.tsx state additions
export const EXAMPLE_STATE_ADDITIONS = `
// Add these state variables at the top of your component
const [orderCompleteVisible, setOrderCompleteVisible] = useState(false);
const [completedOrderId, setCompletedOrderId] = useState('');
`;

// Example 5: Modal placement in JSX
export const EXAMPLE_JSX_ADDITION = `
{/* Add this before the closing </SafeAreaView> tag */}
<OrderCompleteModal
  visible={orderCompleteVisible}
  onClose={() => setOrderCompleteVisible(false)}
  orderId={completedOrderId}
/>
`;
