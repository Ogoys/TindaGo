/**
 * CUSTOMER PROFILE SCREEN
 *
 * Main profile screen for customer users
 * Uses CustomerProfileScreen component from Figma design
 *
 * Features:
 * - User information display with Firebase Auth integration
 * - Navigation menu items (My Account, Orders, E-Wallet, Help, Privacy, Logout)
 * - Back navigation to home
 * - Notification access
 */

import React from 'react';
import { Alert } from 'react-native';
import { router } from 'expo-router';
import { CustomerProfileScreen, MenuItem } from '@/components/ui';
import { useUser } from '@/contexts/UserContext';
import { signOut } from 'firebase/auth';
import { auth } from '../../../../FirebaseConfig';

export default function CustomerProfile() {
  const { user, logout } = useUser();

  // Extract user initials from email or name
  const getUserInitials = (): string => {
    if (user?.email) {
      const emailName = user.email.split('@')[0];
      return emailName.substring(0, 2).toUpperCase();
    }
    return 'CU';
  };

  // Handle logout with confirmation
  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut(auth);
              await logout();
              router.replace('/(auth)/onboarding');
            } catch (error) {
              console.error('Logout error:', error);
              Alert.alert('Error', 'Failed to logout. Please try again.');
            }
          },
        },
      ]
    );
  };

  // Custom menu items with navigation
  const menuItems: MenuItem[] = [
    {
      id: 'my-account',
      label: 'My Account',
      icon: require('../../../../src/assets/images/customer-profile-nav/account-icon.png'),
      onPress: () => {
        router.push('/(main)/(customer)/profile/account-settings');
      },
    },
    {
      id: 'order-history',
      label: 'Order History',
      icon: require('../../../../src/assets/images/customer-profile-nav/order-history-icon.png'),
      onPress: () => {
        router.push('/(main)/(customer)/orders');
      },
    },
    {
      id: 'e-wallet',
      label: 'E-Wallet Details',
      icon: require('../../../../src/assets/images/customer-profile-nav/wallet-icon.png'),
      onPress: () => {
        console.log('E-Wallet pressed');
        // TODO: Navigate to e-wallet screen
        // router.push('/(main)/(customer)/profile/e-wallet');
      },
    },
    {
      id: 'help-support',
      label: 'Help & Support',
      icon: require('../../../../src/assets/images/customer-profile-nav/support-icon.png'),
      onPress: () => {
        console.log('Help & Support pressed');
        // TODO: Navigate to help screen
        // router.push('/(main)/(customer)/profile/help');
      },
    },
    {
      id: 'terms-privacy',
      label: 'Term & Privacy Policy',
      icon: require('../../../../src/assets/images/customer-profile-nav/privacy-icon.png'),
      onPress: () => {
        console.log('Terms & Privacy pressed');
        // TODO: Navigate to terms and privacy screen
        // router.push('/(main)/(customer)/profile/terms-privacy');
      },
    },
    {
      id: 'logout',
      label: 'Log Out',
      icon: require('../../../../src/assets/images/customer-profile-nav/logout-icon.png'),
      onPress: handleLogout,
    },
  ];

  return (
    <CustomerProfileScreen
      userName={user?.email?.split('@')[0] || 'Customer'}
      userEmail={user?.email || 'customer@tindago.com'}
      userInitials={getUserInitials()}
      avatarColor="#3B82F6"
      onBackPress={() => router.back()}
      onNotificationPress={() => {
        console.log('Notifications pressed');
        // TODO: Navigate to notifications screen
        // router.push('/(main)/(customer)/notifications');
      }}
      menuItems={menuItems}
    />
  );
}
