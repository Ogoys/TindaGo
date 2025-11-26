/**
 * PAYMENT METHOD BADGE
 *
 * Displays payment method with appropriate icon
 * Matches design from purchase-payment.tsx
 * Supports: Cash, GCash, PayMaya, Debt
 */

import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { s, vs, ms } from '../../constants/responsive';
import { Fonts } from '../../constants/Fonts';

interface PaymentMethodBadgeProps {
  method: string;
  size?: 'small' | 'medium' | 'large';
  showText?: boolean;
}

const PaymentMethodBadge: React.FC<PaymentMethodBadgeProps> = ({
  method,
  size = 'small',
  showText = true
}) => {
  const normalizedMethod = method?.toLowerCase() || 'cash';

  // Get icon source - using purchase-payment icons
  const getIconSource = () => {
    switch (normalizedMethod) {
      case 'gcash':
        return require('../../assets/images/store-owner-purchase-payment/gcash-icon.png');
      case 'paymaya':
        return require('../../assets/images/store-owner-purchase-payment/paymaya-icon.png');
      case 'debt':
        return require('../../assets/images/store-owner-purchase-payment/debt-icon.png');
      case 'cash':
      default:
        return null; // Cash uses green circle with ₱ symbol
    }
  };

  // Get display name
  const getDisplayName = () => {
    switch (normalizedMethod) {
      case 'gcash':
        return 'GCash';
      case 'paymaya':
        return 'PayMaya';
      case 'debt':
        return 'Debt';
      case 'cash':
        return 'Cash';
      default:
        return method || 'Cash';
    }
  };

  // Get size styles (matching purchase-payment.tsx: 30x30 icon, 18px text)
  const getSizeStyles = () => {
    switch (size) {
      case 'large':
        return {
          iconSize: s(30),
          fontSize: ms(18),
          cashIconSize: s(18),
        };
      case 'medium':
        return {
          iconSize: s(30),
          fontSize: ms(18),
          cashIconSize: s(18),
        };
      case 'small':
      default:
        return {
          iconSize: s(30),
          fontSize: ms(18),
          cashIconSize: s(18),
        };
    }
  };

  const sizeStyles = getSizeStyles();
  const iconSource = getIconSource();

  return (
    <View style={styles.container}>
      {/* Cash uses green circle with ₱ symbol */}
      {normalizedMethod === 'cash' ? (
        <View style={[styles.cashIconContainer, { width: sizeStyles.iconSize, height: sizeStyles.iconSize }]}>
          <Text style={[styles.cashIcon, { fontSize: sizeStyles.cashIconSize }]}>₱</Text>
        </View>
      ) : (
        <Image
          source={iconSource!}
          style={[styles.icon, { width: sizeStyles.iconSize, height: sizeStyles.iconSize }]}
          resizeMode="contain"
        />
      )}
      {showText && (
        <Text style={[styles.text, { fontSize: sizeStyles.fontSize }]}>
          {getDisplayName()}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: s(10),
  },
  icon: {
    width: s(30),
    height: s(30),
  },
  cashIconContainer: {
    width: s(30),
    height: s(30),
    borderRadius: s(15),
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cashIcon: {
    fontFamily: Fonts.primary,
    fontSize: s(18),
    fontWeight: '700',
    color: '#FFFFFF',
  },
  text: {
    fontFamily: Fonts.primary,
    fontWeight: '600',
    fontSize: ms(18),
    color: '#1E1E1E',
  },
});

export default PaymentMethodBadge;
