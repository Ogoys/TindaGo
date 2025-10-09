/**
 * Example Usage of CustomerProfileScreen Component
 *
 * This file demonstrates how to integrate the CustomerProfileScreen
 * into an Expo Router screen with proper navigation and state management.
 */

import React from 'react';
import { Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { CustomerProfileScreen, MenuItem } from './CustomerProfileScreen';

/**
 * Example 1: Basic Usage with Default Menu Items
 */
export function BasicProfileExample() {
  const router = useRouter();

  return (
    <CustomerProfileScreen
      userName="Maynard Dotarot"
      userEmail="dotarot@gmail.com"
      userInitials="DO"
      avatarColor="#3B82F6"
      onBackPress={() => router.back()}
      onNotificationPress={() => {
        // Navigate to notifications screen
        router.push('/(main)/(customer)/notifications');
      }}
    />
  );
}

/**
 * Example 2: Custom Menu Items with Navigation
 */
export function CustomMenuProfileExample() {
  const router = useRouter();

  const customMenuItems: MenuItem[] = [
    {
      id: 'my-account',
      label: 'My Account',
      icon: require('../../assets/images/customer-profile-nav/account-icon.png'),
      onPress: () => {
        console.log('Navigating to My Account');
        router.push('/(main)/shared/profile/account');
      },
    },
    {
      id: 'order-history',
      label: 'Order History',
      icon: require('../../assets/images/customer-profile-nav/order-history-icon.png'),
      onPress: () => {
        console.log('Navigating to Order History');
        router.push('/(main)/(customer)/orders');
      },
    },
    {
      id: 'e-wallet',
      label: 'E-Wallet Details',
      icon: require('../../assets/images/customer-profile-nav/wallet-icon.png'),
      onPress: () => {
        console.log('Navigating to E-Wallet');
        router.push('/(main)/shared/profile/wallet');
      },
    },
    {
      id: 'help-support',
      label: 'Help & Support',
      icon: require('../../assets/images/customer-profile-nav/support-icon.png'),
      onPress: () => {
        console.log('Navigating to Help & Support');
        router.push('/(main)/shared/help');
      },
    },
    {
      id: 'terms-privacy',
      label: 'Term & Privacy Policy',
      icon: require('../../assets/images/customer-profile-nav/privacy-icon.png'),
      onPress: () => {
        console.log('Navigating to Terms & Privacy');
        router.push('/(main)/shared/terms');
      },
    },
    {
      id: 'logout',
      label: 'Log Out',
      icon: require('../../assets/images/customer-profile-nav/logout-icon.png'),
      onPress: () => handleLogout(),
    },
  ];

  const handleLogout = () => {
    Alert.alert(
      'Log Out',
      'Are you sure you want to log out?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Log Out',
          style: 'destructive',
          onPress: async () => {
            try {
              // Add your logout logic here
              console.log('Logging out...');
              // await signOut(auth);
              router.replace('/(auth)/signin');
            } catch (error) {
              console.error('Logout error:', error);
              Alert.alert('Error', 'Failed to log out. Please try again.');
            }
          },
        },
      ]
    );
  };

  return (
    <CustomerProfileScreen
      userName="John Doe"
      userEmail="john.doe@example.com"
      userInitials="JD"
      avatarColor="#10B981" // Custom green color
      onBackPress={() => router.back()}
      onNotificationPress={() => router.push('/(main)/(customer)/notifications')}
      menuItems={customMenuItems}
    />
  );
}

/**
 * Example 3: With Firebase Authentication
 */
export function FirebaseAuthProfileExample() {
  const router = useRouter();
  // import { auth } from '../../../FirebaseConfig';
  // import { signOut } from 'firebase/auth';

  // Simulated user data - replace with actual Firebase auth state
  const user = {
    displayName: 'Maria Santos',
    email: 'maria.santos@gmail.com',
    photoURL: null,
  };

  // Function to get initials from full name
  const getInitials = (name: string | null): string => {
    if (!name) return 'US';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  // Function to generate avatar color based on user ID or name
  const getAvatarColor = (name: string): string => {
    const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  const handleLogout = async () => {
    Alert.alert(
      'Log Out',
      'Are you sure you want to log out?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Log Out',
          style: 'destructive',
          onPress: async () => {
            try {
              // await signOut(auth);
              console.log('User signed out successfully');
              router.replace('/(auth)/signin');
            } catch (error) {
              console.error('Logout error:', error);
              Alert.alert('Error', 'Failed to log out. Please try again.');
            }
          },
        },
      ]
    );
  };

  const menuItems: MenuItem[] = [
    {
      id: 'my-account',
      label: 'My Account',
      icon: require('../../assets/images/customer-profile-nav/account-icon.png'),
      onPress: () => router.push('/(main)/shared/profile/account'),
    },
    {
      id: 'order-history',
      label: 'Order History',
      icon: require('../../assets/images/customer-profile-nav/order-history-icon.png'),
      onPress: () => router.push('/(main)/(customer)/orders'),
    },
    {
      id: 'e-wallet',
      label: 'E-Wallet Details',
      icon: require('../../assets/images/customer-profile-nav/wallet-icon.png'),
      onPress: () => router.push('/(main)/shared/profile/wallet'),
    },
    {
      id: 'help-support',
      label: 'Help & Support',
      icon: require('../../assets/images/customer-profile-nav/support-icon.png'),
      onPress: () => router.push('/(main)/shared/help'),
    },
    {
      id: 'terms-privacy',
      label: 'Term & Privacy Policy',
      icon: require('../../assets/images/customer-profile-nav/privacy-icon.png'),
      onPress: () => router.push('/(main)/shared/terms'),
    },
    {
      id: 'logout',
      label: 'Log Out',
      icon: require('../../assets/images/customer-profile-nav/logout-icon.png'),
      onPress: handleLogout,
    },
  ];

  return (
    <CustomerProfileScreen
      userName={user.displayName || 'User'}
      userEmail={user.email}
      userInitials={getInitials(user.displayName)}
      avatarColor={getAvatarColor(user.displayName || 'User')}
      onBackPress={() => router.back()}
      onNotificationPress={() => router.push('/(main)/(customer)/notifications')}
      menuItems={menuItems}
    />
  );
}

/**
 * Example 4: Integration in Expo Router Screen File
 *
 * File: app/(main)/(customer)/profile.tsx
 */
/*
import React from 'react';
import { CustomerProfileScreen, MenuItem } from '@/components/ui';
import { useRouter } from 'expo-router';
import { Alert } from 'react-native';

export default function CustomerProfile() {
  const router = useRouter();

  const handleLogout = () => {
    Alert.alert(
      'Log Out',
      'Are you sure you want to log out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Log Out',
          style: 'destructive',
          onPress: () => router.replace('/(auth)/signin'),
        },
      ]
    );
  };

  const menuItems: MenuItem[] = [
    {
      id: 'my-account',
      label: 'My Account',
      icon: require('@/assets/images/customer-profile-nav/account-icon.png'),
      onPress: () => router.push('/(main)/shared/profile/account'),
    },
    {
      id: 'order-history',
      label: 'Order History',
      icon: require('@/assets/images/customer-profile-nav/order-history-icon.png'),
      onPress: () => router.push('/(main)/(customer)/orders'),
    },
    {
      id: 'e-wallet',
      label: 'E-Wallet Details',
      icon: require('@/assets/images/customer-profile-nav/wallet-icon.png'),
      onPress: () => router.push('/(main)/shared/profile/wallet'),
    },
    {
      id: 'help-support',
      label: 'Help & Support',
      icon: require('@/assets/images/customer-profile-nav/support-icon.png'),
      onPress: () => router.push('/(main)/shared/help'),
    },
    {
      id: 'terms-privacy',
      label: 'Term & Privacy Policy',
      icon: require('@/assets/images/customer-profile-nav/privacy-icon.png'),
      onPress: () => router.push('/(main)/shared/terms'),
    },
    {
      id: 'logout',
      label: 'Log Out',
      icon: require('@/assets/images/customer-profile-nav/logout-icon.png'),
      onPress: handleLogout,
    },
  ];

  return (
    <CustomerProfileScreen
      userName="Maynard Dotarot"
      userEmail="dotarot@gmail.com"
      userInitials="DO"
      avatarColor="#3B82F6"
      onBackPress={() => router.back()}
      onNotificationPress={() => router.push('/(main)/(customer)/notifications')}
      menuItems={menuItems}
    />
  );
}
*/
