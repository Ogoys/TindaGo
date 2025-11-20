/**
 * QUANTITY SELECTOR COMPONENT
 *
 * Reusable quantity selector with increment/decrement buttons
 * Layout: [-] [Quantity Number] [+]
 * Features:
 * - Min/max validation
 * - Disabled states for boundaries
 * - Touch feedback
 * - Editable quantity input (tap to type)
 * - TindaGo design system styling
 */

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { Colors } from '../../constants/Colors';
import { Fonts } from '../../constants/Fonts';
import { s, vs, ms } from '../../constants/responsive';

interface QuantitySelectorProps {
  value: number;
  min?: number;
  max?: number;
  onChange: (value: number) => void;
  disabled?: boolean;
  label?: string;
}

export const QuantitySelector: React.FC<QuantitySelectorProps> = ({
  value,
  min = 1,
  max = 99,
  onChange,
  disabled = false,
  label,
}) => {
  const [inputValue, setInputValue] = useState(value.toString());
  const [isEditing, setIsEditing] = useState(false);

  // Update input value when value prop changes
  useEffect(() => {
    if (!isEditing) {
      setInputValue(value.toString());
    }
  }, [value, isEditing]);

  const handleDecrement = () => {
    if (value > min && !disabled) {
      onChange(value - 1);
    }
  };

  const handleIncrement = () => {
    if (value < max && !disabled) {
      onChange(value + 1);
    }
  };

  const handleInputChange = (text: string) => {
    // Allow only numbers
    const numericText = text.replace(/[^0-9]/g, '');
    setInputValue(numericText);
  };

  const handleInputBlur = () => {
    setIsEditing(false);
    const numValue = parseInt(inputValue, 10);

    // Validate and apply constraints
    if (isNaN(numValue) || numValue < min) {
      // If invalid or below min, set to min
      onChange(min);
      setInputValue(min.toString());
    } else if (numValue > max) {
      // If above max, set to max
      onChange(max);
      setInputValue(max.toString());
    } else {
      // Valid value
      onChange(numValue);
      setInputValue(numValue.toString());
    }
  };

  const handleInputFocus = () => {
    setIsEditing(true);
  };

  const isMinReached = value <= min;
  const isMaxReached = value >= max;

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}

      <View style={styles.selectorContainer}>
        {/* Decrement Button */}
        <TouchableOpacity
          style={[
            styles.button,
            styles.decrementButton,
            (isMinReached || disabled) && styles.buttonDisabled,
          ]}
          onPress={handleDecrement}
          disabled={isMinReached || disabled}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.buttonText,
              (isMinReached || disabled) && styles.buttonTextDisabled,
            ]}
          >
            −
          </Text>
        </TouchableOpacity>

        {/* Quantity Input (Editable) */}
        <View style={[styles.quantityContainer, isEditing && styles.quantityContainerFocused]}>
          <TextInput
            style={styles.quantityInput}
            value={inputValue}
            onChangeText={handleInputChange}
            onBlur={handleInputBlur}
            onFocus={handleInputFocus}
            keyboardType="number-pad"
            selectTextOnFocus
            maxLength={3}
            editable={!disabled}
          />
        </View>

        {/* Increment Button */}
        <TouchableOpacity
          style={[
            styles.button,
            styles.incrementButton,
            (isMaxReached || disabled) && styles.buttonDisabled,
          ]}
          onPress={handleIncrement}
          disabled={isMaxReached || disabled}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.buttonText,
              (isMaxReached || disabled) && styles.buttonTextDisabled,
            ]}
          >
            +
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: vs(15),
  },

  label: {
    fontFamily: Fonts.primary,
    fontWeight: '500',
    fontSize: ms(13),
    color: 'rgba(30, 30, 30, 0.7)',
    marginBottom: vs(8),
  },

  selectorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: s(15),
  },

  // Button base styles
  button: {
    width: s(40),
    height: s(40),
    borderRadius: s(20),
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: 'rgba(0, 0, 0, 0.15)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: s(3),
    elevation: 2,
  },

  decrementButton: {
    backgroundColor: '#F3F4F6',
    borderWidth: 1.5,
    borderColor: '#D1D5DB',
  },

  incrementButton: {
    backgroundColor: Colors.primary,
    borderWidth: 1.5,
    borderColor: Colors.primary,
  },

  buttonDisabled: {
    backgroundColor: '#E5E7EB',
    borderColor: '#E5E7EB',
    opacity: 0.5,
    shadowOpacity: 0,
    elevation: 0,
  },

  buttonText: {
    fontFamily: Fonts.primary,
    fontWeight: '700',
    fontSize: ms(20),
    color: '#1E1E1E',
  },

  buttonTextDisabled: {
    color: '#9CA3AF',
  },

  // Quantity display
  quantityContainer: {
    minWidth: s(50),
    paddingHorizontal: s(15),
    paddingVertical: vs(8),
    backgroundColor: '#F9FAFB',
    borderRadius: s(10),
    borderWidth: 1,
    borderColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center',
  },

  quantityContainerFocused: {
    borderColor: Colors.primary,
    borderWidth: 2,
    backgroundColor: '#FFFFFF',
  },

  quantityInput: {
    fontFamily: Fonts.primary,
    fontWeight: '600',
    fontSize: ms(18),
    color: '#1E1E1E',
    textAlign: 'center',
    minWidth: s(20),
    padding: 0,
  },
});
