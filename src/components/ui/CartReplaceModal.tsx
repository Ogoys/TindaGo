/**
 * Cart Replace Modal Component
 *
 * Shows when user tries to add items from a different store
 * Asks user to confirm if they want to replace their current cart
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Image,
} from 'react-native';
import { Colors } from '../../constants/Colors';
import { Fonts } from '../../constants/Fonts';
import { s, vs, ms } from '../../constants/responsive';

interface CartReplaceModalProps {
  visible: boolean;
  currentStore: string;
  newStore: string;
  onReplace: () => void;
  onCancel: () => void;
}

export const CartReplaceModal: React.FC<CartReplaceModalProps> = ({
  visible,
  currentStore,
  newStore,
  onReplace,
  onCancel,
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {/* Icon */}
          <View style={styles.iconContainer}>
            <Text style={styles.iconText}>🛒</Text>
          </View>

          {/* Title */}
          <Text style={styles.title}>Replace Cart Items?</Text>

          {/* Message */}
          <Text style={styles.message}>
            Your cart contains items from{' '}
            <Text style={styles.storeName}>{currentStore}</Text>.
          </Text>
          <Text style={styles.message}>
            Do you want to replace them with items from{' '}
            <Text style={styles.storeName}>{newStore}</Text>?
          </Text>

          {/* Buttons */}
          <View style={styles.buttonContainer}>
            {/* Cancel Button */}
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={onCancel}
              activeOpacity={0.8}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>

            {/* Replace Button */}
            <TouchableOpacity
              style={[styles.button, styles.replaceButton]}
              onPress={onReplace}
              activeOpacity={0.8}
            >
              <Text style={styles.replaceButtonText}>Replace Cart</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: s(20),
  },

  modalContainer: {
    width: '100%',
    maxWidth: s(400),
    backgroundColor: Colors.white,
    borderRadius: s(20),
    paddingHorizontal: s(30),
    paddingVertical: vs(30),
    alignItems: 'center',
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
  },

  iconContainer: {
    width: s(80),
    height: s(80),
    borderRadius: s(40),
    backgroundColor: '#FFF3E0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: vs(20),
  },

  iconText: {
    fontSize: ms(40),
  },

  title: {
    fontFamily: Fonts.primary,
    fontSize: ms(22),
    fontWeight: '700',
    color: Colors.darkGray,
    marginBottom: vs(15),
    textAlign: 'center',
  },

  message: {
    fontFamily: Fonts.primary,
    fontSize: ms(15),
    fontWeight: '400',
    color: 'rgba(30, 30, 30, 0.7)',
    textAlign: 'center',
    lineHeight: ms(15) * 1.5,
    marginBottom: vs(8),
  },

  storeName: {
    fontWeight: '600',
    color: Colors.primary,
  },

  buttonContainer: {
    flexDirection: 'row',
    gap: s(12),
    marginTop: vs(25),
    width: '100%',
  },

  button: {
    flex: 1,
    height: vs(50),
    borderRadius: s(25),
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },

  cancelButton: {
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },

  cancelButtonText: {
    fontFamily: Fonts.primary,
    fontSize: ms(16),
    fontWeight: '600',
    color: Colors.darkGray,
  },

  replaceButton: {
    backgroundColor: Colors.primary,
  },

  replaceButtonText: {
    fontFamily: Fonts.primary,
    fontSize: ms(16),
    fontWeight: '600',
    color: Colors.white,
  },
});
