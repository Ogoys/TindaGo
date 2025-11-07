/**
 * ProfileScreenHeader Component
 * 
 * Reusable header component for store owner profile screens
 * Provides consistent styling and layout across all profile-related screens
 */

import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { Fonts } from '@/constants/Fonts';
import { s, vs, ms } from '@/constants/responsive';

interface ProfileScreenHeaderProps {
  title: string;
  icon?: keyof typeof Ionicons.glyphMap;
  onBack?: () => void;
}

export const ProfileScreenHeader: React.FC<ProfileScreenHeaderProps> = ({
  title,
  icon,
  onBack,
}) => {
  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  };

  return (
    <View style={styles.headerContainer}>
      {/* Back Button */}
      <TouchableOpacity 
        style={styles.backButton} 
        onPress={handleBack} 
        activeOpacity={0.7}
      >
        <Image
          source={require('../../assets/images/store-product/chevron-left.png')}
          style={styles.backIcon}
        />
      </TouchableOpacity>

      {/* Title with optional icon */}
      <View style={styles.titleContainer}>
        {icon && (
          <Ionicons 
            name={icon} 
            size={ms(22)} 
            color={Colors.primary} 
            style={styles.titleIcon}
          />
        )}
        <Text style={styles.title}>{title}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    backgroundColor: Colors.backgroundGray,
    paddingTop: vs(79),
    paddingBottom: vs(20),
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  backButton: {
    position: 'absolute',
    left: s(20),
    top: vs(79),
    width: s(30),
    height: vs(30),
    borderRadius: s(20),
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: 'rgba(0, 0, 0, 0.25)',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 4,
    zIndex: 10,
  },
  backIcon: {
    width: s(15),
    height: vs(15),
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleIcon: {
    marginRight: s(8),
  },
  title: {
    fontFamily: Fonts.primary,
    fontWeight: '600',
    fontSize: ms(20),
    lineHeight: vs(22),
    color: Colors.darkGray,
  },
});
