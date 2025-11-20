/**
 * DROPDOWN COMPONENT
 *
 * Reusable dropdown/picker component with custom styling
 * Used for selecting from a list of options
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  FlatList,
  Pressable,
} from 'react-native';
import { s, vs, ms } from '../../constants/responsive';
import { Colors } from '../../constants/Colors';
import { Fonts } from '../../constants/Fonts';

export interface DropdownOption {
  label: string;
  value: string | number;
  icon?: string;
}

interface DropdownProps {
  label?: string;
  placeholder?: string;
  options: DropdownOption[];
  value: string | number | null;
  onSelect: (value: string | number) => void;
  disabled?: boolean;
  error?: string;
  style?: any;
}

export const Dropdown: React.FC<DropdownProps> = ({
  label,
  placeholder = 'Select an option',
  options,
  value,
  onSelect,
  disabled = false,
  error,
  style,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const selectedOption = options.find(opt => opt.value === value);

  return (
    <View style={[styles.container, style]}>
      {label && <Text style={styles.label}>{label}</Text>}

      <TouchableOpacity
        style={[
          styles.dropdown,
          disabled && styles.dropdownDisabled,
          error && styles.dropdownError,
        ]}
        onPress={() => !disabled && setIsOpen(true)}
        activeOpacity={0.7}
      >
        <Text
          style={[
            styles.dropdownText,
            !selectedOption && styles.dropdownPlaceholder,
          ]}
        >
          {selectedOption ? selectedOption.label : placeholder}
        </Text>
        <Text style={styles.dropdownArrow}>▼</Text>
      </TouchableOpacity>

      {error && <Text style={styles.errorText}>{error}</Text>}

      {/* Modal for options */}
      <Modal
        visible={isOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsOpen(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setIsOpen(false)}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {label || 'Select an option'}
              </Text>
              <TouchableOpacity
                onPress={() => setIsOpen(false)}
                style={styles.modalClose}
              >
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>

            <FlatList
              data={options}
              keyExtractor={(item) => String(item.value)}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.option,
                    item.value === value && styles.optionSelected,
                  ]}
                  onPress={() => {
                    onSelect(item.value);
                    setIsOpen(false);
                  }}
                  activeOpacity={0.7}
                >
                  {item.icon && (
                    <Text style={styles.optionIcon}>{item.icon}</Text>
                  )}
                  <Text
                    style={[
                      styles.optionText,
                      item.value === value && styles.optionTextSelected,
                    ]}
                  >
                    {item.label}
                  </Text>
                  {item.value === value && (
                    <Text style={styles.checkmark}>✓</Text>
                  )}
                </TouchableOpacity>
              )}
              showsVerticalScrollIndicator={false}
            />
          </View>
        </Pressable>
      </Modal>
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

  dropdown: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: s(10),
    paddingHorizontal: s(15),
    paddingVertical: vs(12),
    minHeight: vs(44),
  },

  dropdownDisabled: {
    backgroundColor: '#F3F4F6',
    opacity: 0.6,
  },

  dropdownError: {
    borderColor: '#EF4444',
  },

  dropdownText: {
    fontFamily: Fonts.primary,
    fontWeight: '500',
    fontSize: ms(14),
    color: '#1E1E1E',
    flex: 1,
  },

  dropdownPlaceholder: {
    color: 'rgba(30, 30, 30, 0.4)',
    fontWeight: '400',
  },

  dropdownArrow: {
    fontSize: ms(10),
    color: 'rgba(30, 30, 30, 0.5)',
    marginLeft: s(10),
  },

  errorText: {
    fontFamily: Fonts.primary,
    fontWeight: '400',
    fontSize: ms(12),
    color: '#EF4444',
    marginTop: vs(5),
  },

  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  modalContent: {
    width: s(350),
    maxHeight: vs(500),
    backgroundColor: '#FFFFFF',
    borderRadius: s(20),
    overflow: 'hidden',
    shadowColor: 'rgba(0, 0, 0, 0.25)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: s(8),
    elevation: 5,
  },

  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: s(20),
    paddingVertical: vs(15),
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },

  modalTitle: {
    fontFamily: Fonts.primary,
    fontWeight: '600',
    fontSize: ms(16),
    color: '#1E1E1E',
    flex: 1,
  },

  modalClose: {
    padding: s(5),
  },

  modalCloseText: {
    fontSize: ms(20),
    color: 'rgba(30, 30, 30, 0.5)',
    fontWeight: '400',
  },

  option: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: s(20),
    paddingVertical: vs(15),
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },

  optionSelected: {
    backgroundColor: '#F0FDF4',
  },

  optionIcon: {
    fontSize: ms(18),
    marginRight: s(12),
  },

  optionText: {
    fontFamily: Fonts.primary,
    fontWeight: '400',
    fontSize: ms(14),
    color: '#1E1E1E',
    flex: 1,
  },

  optionTextSelected: {
    fontWeight: '600',
    color: Colors.primary,
  },

  checkmark: {
    fontSize: ms(16),
    color: Colors.primary,
    fontWeight: '700',
  },
});
