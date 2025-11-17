/**
 * PAYMENT METHOD BADGE
 * 
 * Displays payment method with appropriate icon
 * Supports: Cash, GCash, PayMaya, COD, PayPal
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
  
  // Get icon source
  const getIconSource = () => {
    switch (normalizedMethod) {
      case 'gcash':
        return require('../../assets/images/payment/gcash-icon.png');
      case 'paymaya':
        return require('../../assets/images/payment/paymaya-icon.png');
      case 'cash':
      case 'cod':
        return require('../../assets/images/payment/cash-icon.png');
      case 'paypal':
        return require('../../assets/images/payment/paypal-icon.png');
      default:
        return require('../../assets/images/payment/cash-icon.png');
    }
  };

  // Get display name
  const getDisplayName = () => {
    switch (normalizedMethod) {
      case 'gcash':
        return 'GCash';
      case 'paymaya':
        return 'PayMaya';
      case 'cash':
        return 'Cash';
      case 'cod':
        return 'COD';
      case 'paypal':
        return 'PayPal';
      default:
        return method || 'Cash';
    }
  };

  // Get size styles
  const getSizeStyles = () => {
    switch (size) {
      case 'large':
        return {
          iconSize: s(28),
          fontSize: ms(15),
          padding: s(10),
        };
      case 'medium':
        return {
          iconSize: s(20),
          fontSize: ms(13),
          padding: s(8),
        };
      case 'small':
      default:
        return {
          iconSize: s(16),
          fontSize: ms(12),
          padding: s(6),
        };
    }
  };

  const sizeStyles = getSizeStyles();

  return (
    <View style={styles.container}>
      <Image 
        source={getIconSource()} 
        style={[styles.icon, { width: sizeStyles.iconSize, height: sizeStyles.iconSize }]}
        resizeMode="contain"
      />
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
  },
  icon: {
    width: s(16),
    height: s(16),
    marginRight: s(6),
  },
  text: {
    fontFamily: Fonts.primary,
    fontWeight: '600',
    fontSize: ms(12),
    color: '#1E1E1E',
  },
});

export default PaymentMethodBadge;
