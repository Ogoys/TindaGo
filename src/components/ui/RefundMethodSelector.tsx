/**
 * REFUND METHOD SELECTOR COMPONENT
 *
 * Card-based refund method selection component
 * Based on PaymentMethodSelector design pattern
 * Shows refund options: GCash, PayMaya, Loan (Pay Later)
 *
 * Design:
 * - Card layout with icons/logos
 * - Selected state with green border
 * - Radio button indicator
 * - Responsive scaling
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Colors } from '../../constants/Colors';
import { Fonts } from '../../constants/Fonts';
import { s, vs, ms } from '../../constants/responsive';

export type RefundMethodType = 'cash' | 'gcash' | 'paymaya' | 'loan';

interface RefundMethodSelectorProps {
  selectedMethod: RefundMethodType;
  onMethodSelect: (method: RefundMethodType) => void;
  disabled?: boolean;
  label?: string;
}

export const RefundMethodSelector: React.FC<RefundMethodSelectorProps> = ({
  selectedMethod,
  onMethodSelect,
  disabled = false,
  label = 'Refund Method',
}) => {
  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}

      {/* Cash Option */}
      <TouchableOpacity
        style={[
          styles.methodCard,
          selectedMethod === 'cash' && styles.methodCardSelected,
        ]}
        onPress={() => onMethodSelect('cash')}
        disabled={disabled}
        activeOpacity={0.7}
      >
        <View style={styles.methodContent}>
          {/* Cash Icon - Peso sign in green circle */}
          <View style={styles.cashIconCircle}>
            <Text style={styles.cashIconText}>₱</Text>
          </View>
          <View>
            <Text style={styles.methodText}>Cash</Text>
            <Text style={styles.methodSubtext}>Receive cash refund at store</Text>
          </View>
        </View>
        <View
          style={[
            styles.radioCircle,
            selectedMethod === 'cash' && styles.radioCircleSelected,
          ]}
        >
          {selectedMethod === 'cash' && <View style={styles.radioCircleInner} />}
        </View>
      </TouchableOpacity>

      {/* GCash Option */}
      <TouchableOpacity
        style={[
          styles.methodCard,
          selectedMethod === 'gcash' && styles.methodCardSelected,
        ]}
        onPress={() => onMethodSelect('gcash')}
        disabled={disabled}
        activeOpacity={0.7}
      >
        <View style={styles.methodContent}>
          <Image
            source={require('../../assets/images/payment/gcash-icon.png')}
            style={styles.methodIcon}
            resizeMode="contain"
          />
          <Text style={styles.methodText}>GCash</Text>
        </View>
        <View
          style={[
            styles.radioCircle,
            selectedMethod === 'gcash' && styles.radioCircleSelected,
          ]}
        >
          {selectedMethod === 'gcash' && <View style={styles.radioCircleInner} />}
        </View>
      </TouchableOpacity>

      {/* PayMaya Option */}
      <TouchableOpacity
        style={[
          styles.methodCard,
          selectedMethod === 'paymaya' && styles.methodCardSelected,
        ]}
        onPress={() => onMethodSelect('paymaya')}
        disabled={disabled}
        activeOpacity={0.7}
      >
        <View style={styles.methodContent}>
          <Image
            source={require('../../assets/images/payment/paymaya-icon.png')}
            style={styles.methodIcon}
            resizeMode="contain"
          />
          <Text style={styles.methodText}>PayMaya</Text>
        </View>
        <View
          style={[
            styles.radioCircle,
            selectedMethod === 'paymaya' && styles.radioCircleSelected,
          ]}
        >
          {selectedMethod === 'paymaya' && <View style={styles.radioCircleInner} />}
        </View>
      </TouchableOpacity>

      {/* Loan Option */}
      <TouchableOpacity
        style={[
          styles.methodCard,
          selectedMethod === 'loan' && styles.methodCardSelected,
        ]}
        onPress={() => onMethodSelect('loan')}
        disabled={disabled}
        activeOpacity={0.7}
      >
        <View style={styles.methodContent}>
          {/* Loan Icon - Credit card emoji */}
          <View style={styles.loanIconCircle}>
            <Text style={styles.loanIconText}>💳</Text>
          </View>
          <View>
            <Text style={styles.methodText}>Loan (Pay Later)</Text>
            <Text style={styles.methodSubtext}>Choose repayment date</Text>
          </View>
        </View>
        <View
          style={[
            styles.radioCircle,
            selectedMethod === 'loan' && styles.radioCircleSelected,
          ]}
        >
          {selectedMethod === 'loan' && <View style={styles.radioCircleInner} />}
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: vs(15),
  },

  label: {
    fontFamily: Fonts.primary,
    fontWeight: '600',
    fontSize: ms(15),
    color: '#1E1E1E',
    marginBottom: vs(5),
  },

  // Method card
  methodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.white,
    borderRadius: s(15),
    paddingHorizontal: s(20),
    paddingVertical: vs(15),
    minHeight: vs(60),
    shadowColor: 'rgba(0, 0, 0, 0.1)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: s(3),
    elevation: 2,
    borderWidth: 2,
    borderColor: 'transparent',
  },

  methodCardSelected: {
    borderColor: Colors.primary,
    shadowColor: 'rgba(59, 183, 126, 0.3)',
    shadowOpacity: 0.5,
    shadowRadius: s(5),
    elevation: 4,
  },

  methodContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: s(15),
  },

  // Icons
  methodIcon: {
    width: s(40),
    height: s(40),
  },

  // Cash icon
  cashIconCircle: {
    width: s(40),
    height: s(40),
    borderRadius: s(20),
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },

  cashIconText: {
    fontSize: ms(22),
    fontWeight: '700',
    color: '#FFFFFF',
  },

  loanIconCircle: {
    width: s(40),
    height: s(40),
    borderRadius: s(20),
    backgroundColor: Colors.lightGreen,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: Colors.primary,
  },

  loanIconText: {
    fontSize: ms(24),
  },

  // Method text
  methodText: {
    fontFamily: Fonts.primary,
    fontSize: ms(16),
    fontWeight: '500',
    color: Colors.darkGray,
  },

  methodSubtext: {
    fontFamily: Fonts.primary,
    fontSize: ms(12),
    fontWeight: '400',
    color: 'rgba(30, 30, 30, 0.6)',
    marginTop: vs(2),
  },

  // Radio button
  radioCircle: {
    width: s(20),
    height: s(20),
    borderRadius: s(10),
    borderWidth: 2,
    borderColor: '#9CA3AF',
    justifyContent: 'center',
    alignItems: 'center',
  },

  radioCircleSelected: {
    borderColor: Colors.primary,
    borderWidth: 2,
  },

  radioCircleInner: {
    width: s(10),
    height: s(10),
    borderRadius: s(5),
    backgroundColor: Colors.primary,
  },
});
