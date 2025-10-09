/**
 * Customer Profile Screen Component
 *
 * Figma Design: https://www.figma.com/design/8I1Nr3vQZllDDknSevstvH/TindaGo-Share?node-id=759-4154
 * Node ID: 759-4154
 * Frame: Profile (440x990)
 *
 * Design Specifications:
 * - Background header: EBFBEA (light green) at y:1, height: 384
 * - Profile avatar: Blue circle (#3B82F6) at x:160, y:155, size: 120x120
 * - Menu items: White cards with 16px border radius, 75px height, 95px spacing
 * - Icons: 30x30px inside 50x50px circles with border
 * - Typography: Clash Grotesk Variable (various weights and sizes)
 *
 * Baseline: 440x956 (Figma design dimensions)
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  StatusBar,
} from 'react-native';
import { s, vs, ms } from '../../constants/responsive';
import { Colors } from '../../constants/Colors';
import { Fonts } from '../../constants/Fonts';

export interface MenuItem {
  id: string;
  label: string;
  icon: any;
  onPress: () => void;
}

export interface CustomerProfileScreenProps {
  userName?: string;
  userEmail?: string;
  userInitials?: string;
  avatarColor?: string;
  onBackPress: () => void;
  onNotificationPress: () => void;
  menuItems?: MenuItem[];
}

export const CustomerProfileScreen: React.FC<CustomerProfileScreenProps> = ({
  userName = 'Maynard Dotarot',
  userEmail = 'dotarot@gmail.com',
  userInitials = 'DO',
  avatarColor = '#3B82F6',
  onBackPress,
  onNotificationPress,
  menuItems = [],
}) => {
  // Default menu items based on Figma design
  const defaultMenuItems: MenuItem[] = [
    {
      id: 'my-account',
      label: 'My Account',
      icon: require('../../assets/images/customer-profile-nav/account-icon.png'),
      onPress: () => console.log('My Account pressed'),
    },
    {
      id: 'order-history',
      label: 'Order History',
      icon: require('../../assets/images/customer-profile-nav/order-history-icon.png'),
      onPress: () => console.log('Order History pressed'),
    },
    {
      id: 'e-wallet',
      label: 'E-Wallet Details',
      icon: require('../../assets/images/customer-profile-nav/wallet-icon.png'),
      onPress: () => console.log('E-Wallet Details pressed'),
    },
    {
      id: 'help-support',
      label: 'Help & Support',
      icon: require('../../assets/images/customer-profile-nav/support-icon.png'),
      onPress: () => console.log('Help & Support pressed'),
    },
    {
      id: 'terms-privacy',
      label: 'Term & Privacy Policy',
      icon: require('../../assets/images/customer-profile-nav/privacy-icon.png'),
      onPress: () => console.log('Terms & Privacy pressed'),
    },
    {
      id: 'logout',
      label: 'Log Out',
      icon: require('../../assets/images/customer-profile-nav/logout-icon.png'),
      onPress: () => console.log('Logout pressed'),
    },
  ];

  const items = menuItems.length > 0 ? menuItems : defaultMenuItems;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F4F6F6" />

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        {/* Header Background - Figma: x:0, y:1, w:440, h:384 */}
        <View style={styles.headerBackground}>
          <Image
            source={require('../../assets/images/customer-profile-nav/background-header.png')}
            style={styles.headerBackgroundImage}
            resizeMode="cover"
          />
        </View>

        {/* Top Navigation Bar - Figma: y:74-114 */}
        <View style={styles.topBar}>
          {/* Back Button - Figma: x:20, y:79, size:30x30 */}
          <TouchableOpacity
            style={styles.backButton}
            onPress={onBackPress}
            activeOpacity={0.7}
          >
            <Image
              source={require('../../assets/images/customer-profile-nav/chevron-left.png')}
              style={styles.backIcon}
              resizeMode="contain"
            />
          </TouchableOpacity>

          {/* Profile Title - Figma: x:190, y:83 */}
          <Text style={styles.profileTitle}>Profile</Text>

          {/* Notification Button - Figma: x:375, y:74, size:40x40 */}
          <TouchableOpacity
            style={styles.notificationButton}
            onPress={onNotificationPress}
            activeOpacity={0.7}
          >
            <Image
              source={require('../../assets/images/customer-profile-nav/notification-icon.png')}
              style={styles.notificationIcon}
              resizeMode="contain"
            />
          </TouchableOpacity>
        </View>

        {/* Profile Avatar - Figma: x:160, y:155, size:120x120 */}
        <View style={[styles.avatarContainer, { backgroundColor: avatarColor }]}>
          <Text style={styles.avatarText}>{userInitials}</Text>
        </View>

        {/* User Name - Figma: x:128, y:295, h:30 */}
        <Text style={styles.userName}>{userName}</Text>

        {/* User Email - Figma: x:149, y:325, h:20 */}
        <Text style={styles.userEmail}>{userEmail}</Text>

        {/* Menu Items Container - Figma: Starting at y:405 with 95px spacing */}
        <View style={styles.menuContainer}>
          {items.map((item, index) => (
            <MenuItemCard
              key={item.id}
              label={item.label}
              icon={item.icon}
              onPress={item.onPress}
              // Calculate exact Figma positions: 405, 500, 595, 690, 785, 880
              // Each item is 75px high with 20px margin between (95px total spacing)
              style={{ marginTop: index === 0 ? vs(20) : vs(20) }}
            />
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

/**
 * Menu Item Card Component
 * Figma: Rectangle cards with 16px border radius, 75px height, 400px width
 */
interface MenuItemCardProps {
  label: string;
  icon: any;
  onPress: () => void;
  style?: any;
}

const MenuItemCard: React.FC<MenuItemCardProps> = ({ label, icon, onPress, style }) => {
  return (
    <TouchableOpacity
      style={[styles.menuCard, style]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      {/* Icon Circle - Figma: 50x50 with 1px border, icon 30x30 inside */}
      <View style={styles.iconCircle}>
        <Image
          source={icon}
          style={styles.menuIcon}
          resizeMode="contain"
        />
      </View>

      {/* Label Text - Figma: x:100 (65px from icon), y:14 from top */}
      <Text style={styles.menuLabel}>{label}</Text>

      {/* Forward Arrow - Figma: x:355 (from card left), y:25 from top, 30x30 */}
      <Image
        source={require('../../assets/images/customer-profile-nav/forward-arrow.png')}
        style={styles.forwardArrow}
        resizeMode="contain"
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundGray, // #F4F6F6
  },
  scrollView: {
    flex: 1,
  },
  // Header Background - Figma: x:0, y:1, w:440, h:384
  headerBackground: {
    position: 'absolute',
    top: vs(1),
    left: 0,
    width: s(440),
    height: vs(384),
    backgroundColor: '#EBFBEA',
    overflow: 'hidden',
  },
  headerBackgroundImage: {
    width: '100%',
    height: '100%',
  },
  // Top Bar - Figma: y:74-114 (40px height including button)
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: s(20),
    marginTop: vs(74),
    height: vs(40),
    zIndex: 10,
  },
  // Back Button - Figma: x:20, y:79, size:30x30, borderRadius:20px
  backButton: {
    width: s(30),
    height: vs(30),
    borderRadius: s(20),
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
  backIcon: {
    width: s(15),
    height: vs(15),
  },
  // Profile Title - Figma: x:190, y:83, fontSize:20, fontWeight:600
  profileTitle: {
    fontFamily: Fonts.primary,
    fontSize: ms(20),
    fontWeight: Fonts.weights.semiBold,
    color: Colors.darkGray,
    lineHeight: ms(20) * Fonts.lineHeights.tight,
    textAlign: 'center',
  },
  // Notification Button - Figma: x:375, y:74, size:40x40
  notificationButton: {
    width: s(40),
    height: vs(40),
    borderRadius: s(20),
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10,
  },
  notificationIcon: {
    width: s(25),
    height: vs(25),
  },
  // Avatar Container - Figma: x:160, y:155, size:120x120
  avatarContainer: {
    width: s(120),
    height: vs(120),
    borderRadius: s(60),
    alignSelf: 'center',
    marginTop: vs(155 - 114), // 41px from top bar bottom
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 5,
  },
  // Avatar Text - Figma: fontSize:48, fontWeight:500
  avatarText: {
    fontFamily: Fonts.primary,
    fontSize: ms(48),
    fontWeight: Fonts.weights.medium,
    color: Colors.white,
    lineHeight: ms(48) * 1.23,
  },
  // User Name - Figma: x:128, y:295, fontSize:24, fontWeight:500
  userName: {
    fontFamily: Fonts.primary,
    fontSize: ms(24),
    fontWeight: Fonts.weights.medium,
    color: Colors.darkGray,
    lineHeight: ms(24) * 1.23,
    textAlign: 'center',
    marginTop: vs(295 - 155 - 120), // 20px from avatar bottom
  },
  // User Email - Figma: x:149, y:325, fontSize:16, fontWeight:500
  userEmail: {
    fontFamily: Fonts.primary,
    fontSize: ms(16),
    fontWeight: Fonts.weights.medium,
    color: 'rgba(30, 30, 30, 0.5)', // Figma: rgba(30, 30, 30, 0.5)
    lineHeight: ms(16) * 1.23,
    textAlign: 'center',
    marginTop: vs(5), // Small gap from userName
  },
  // Menu Container - Figma: Starting at y:405
  menuContainer: {
    paddingHorizontal: s(20),
    marginTop: vs(405 - 325 - 20 - 15), // Gap from email to first menu item
    paddingBottom: vs(30),
  },
  // Menu Card - Figma: w:400, h:75, borderRadius:16px
  menuCard: {
    width: s(400),
    height: vs(75),
    backgroundColor: Colors.white,
    borderRadius: s(16),
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: s(15),
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 5,
  },
  // Icon Circle - Figma: 50x50 with 1px border rgba(30, 30, 30, 0.08)
  iconCircle: {
    width: s(50),
    height: vs(50),
    borderRadius: s(25),
    borderWidth: 1,
    borderColor: 'rgba(30, 30, 30, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 2,
  },
  // Menu Icon - Figma: 30x30 inside the circle
  menuIcon: {
    width: s(30),
    height: vs(30),
  },
  // Menu Label - Figma: x:100 (65px from icon), fontSize:18, fontWeight:500
  menuLabel: {
    flex: 1,
    fontFamily: Fonts.primary,
    fontSize: ms(18),
    fontWeight: Fonts.weights.medium,
    color: Colors.darkGray,
    lineHeight: ms(18) * 1.23,
    marginLeft: s(15), // 15px gap from icon circle
  },
  // Forward Arrow - Figma: 30x30, positioned at right side of card
  forwardArrow: {
    width: s(30),
    height: vs(30),
  },
});
