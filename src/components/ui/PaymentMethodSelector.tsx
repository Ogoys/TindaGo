/**
 * PaymentMethodSelector Component
 *
 * Reusable payment method selection component
 * Shows three payment options: PayMaya, GCash, Cash on Pickup
 * Can be used across multiple screens (Payment, Checkout, etc.)
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Colors } from '../../constants/Colors';
import { Fonts } from '../../constants/Fonts';
import { s, vs, ms } from '../../constants/responsive';

export type PaymentMethod = 'gcash' | 'paymaya' | 'cash' | null;

interface PaymentMethodSelectorProps {
  selectedPayment: PaymentMethod;
  onPaymentSelect: (method: PaymentMethod) => void;
  disabled?: boolean;
}

export const PaymentMethodSelector: React.FC<PaymentMethodSelectorProps> = ({
  selectedPayment,
  onPaymentSelect,
  disabled = false,
}) => {
  return (
    <View style={styles.container}>
      {/* PayMaya - First option */}
      <TouchableOpacity
        style={[
          styles.paymentOption,
          selectedPayment === 'paymaya' && styles.paymentOptionSelected
        ]}
        onPress={() => onPaymentSelect('paymaya')}
        disabled={disabled}
        activeOpacity={0.7}
      >
        <View style={styles.paymentOptionContent}>
          <Image
            source={require('../../assets/images/payment/paymaya-icon.png')}
            style={styles.paymentIcon}
            resizeMode="contain"
          />
          <Text style={styles.paymentMethodText}>PayMaya</Text>
        </View>
        <View style={[
          styles.radioCircle,
          selectedPayment === 'paymaya' && styles.radioCircleSelected
        ]}>
          {selectedPayment === 'paymaya' && <View style={styles.radioCircleInner} />}
        </View>
      </TouchableOpacity>

      {/* GCash - Second option */}
      <TouchableOpacity
        style={[
          styles.paymentOption,
          selectedPayment === 'gcash' && styles.paymentOptionSelected
        ]}
        onPress={() => onPaymentSelect('gcash')}
        disabled={disabled}
        activeOpacity={0.7}
      >
        <View style={styles.paymentOptionContent}>
          <Image
            source={require('../../assets/images/payment/gcash-icon.png')}
            style={styles.paymentIcon}
            resizeMode="contain"
          />
          <Text style={styles.paymentMethodText}>Gcash</Text>
        </View>
        <View style={[
          styles.radioCircle,
          selectedPayment === 'gcash' && styles.radioCircleSelected
        ]}>
          {selectedPayment === 'gcash' && <View style={styles.radioCircleInner} />}
        </View>
      </TouchableOpacity>

      {/* Cash on Pickup - Third option */}
      <TouchableOpacity
        style={[
          styles.paymentOption,
          selectedPayment === 'cash' && styles.paymentOptionSelected
        ]}
        onPress={() => onPaymentSelect('cash')}
        disabled={disabled}
        activeOpacity={0.7}
      >
        <View style={styles.paymentOptionContent}>
          {/* Green peso circle icon */}
          <View style={styles.cashIconCircle}>
            <Text style={styles.cashIconText}>₱</Text>
          </View>
          <Text style={styles.paymentMethodText}>Cash on Pickup</Text>
        </View>
        <View style={[
          styles.radioCircle,
          selectedPayment === 'cash' && styles.radioCircleSelected
        ]}>
          {selectedPayment === 'cash' && <View style={styles.radioCircleInner} />}
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: vs(20),
  },

  // Payment option - width: 400, height: 60, gap between options: 20px
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.white,
    borderRadius: s(20),
    paddingHorizontal: s(20),
    paddingVertical: vs(15),
    height: vs(60),
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 3,
    borderWidth: 2,
    borderColor: 'transparent',
  },

  paymentOptionSelected: {
    borderColor: Colors.primary,
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 5,
  },

  paymentOptionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: s(20),
  },

  // Payment icon - Increased size for better visibility
  paymentIcon: {
    width: s(40),
    height: s(40),
  },

  // Payment method text
  paymentMethodText: {
    fontFamily: Fonts.primary,
    fontSize: ms(16),
    fontWeight: '500',
    color: Colors.darkGray,
  },

  // Radio circle
  radioCircle: {
    width: s(15),
    height: vs(15),
    borderRadius: s(7.5),
    borderWidth: 1,
    borderColor: '#7A7B7B',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioCircleSelected: {
    borderColor: Colors.primary,
    borderWidth: 2,
  },
  radioCircleInner: {
    width: s(7),
    height: vs(7),
    borderRadius: s(3.5),
    backgroundColor: Colors.primary,
  },

  // Cash Icon Circle - Green peso circle for Cash on Pickup
  cashIconCircle: {
    width: s(40),
    height: s(40),
    borderRadius: s(20),
    backgroundColor: Colors.primary, // #3BB77E
    justifyContent: 'center',
    alignItems: 'center',
  },
  cashIconText: {
    fontSize: ms(20),
    fontWeight: '700',
    color: Colors.white,
  },
});
