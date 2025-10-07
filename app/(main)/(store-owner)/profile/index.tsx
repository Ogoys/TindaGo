import React, { useState, useEffect } from "react";
import { ScrollView, StyleSheet, View, Text, TouchableOpacity, Image } from "react-native";
import { router } from "expo-router";
import { auth, database } from "../../../../FirebaseConfig";
import { ref, get } from "firebase/database";
import { CustomStatusBar } from "../../../../src/components/ui/StatusBar";
import { Colors } from "../../../../src/constants/Colors";
import { s, vs } from "../../../../src/constants/responsive";
import { StoreRegistrationService } from "../../../../src/services/StoreRegistrationService";

interface SettingItemProps {
  title: string;
  icon: any;
  onPress?: () => void;
  isLast?: boolean;
}

function SettingItem({ title, icon, onPress, isLast = false }: SettingItemProps) {
  return (
    <TouchableOpacity
      style={[
        styles.settingItem,
        isLast && { borderBottomLeftRadius: s(16), borderBottomRightRadius: s(16) }
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.settingLeft}>
        {/* Icon Circle - Figma: x: 35, y: varies, width: 50, height: 50 */}
        <View style={styles.iconCircle}>
          <Image source={icon} style={styles.settingIcon} />
        </View>

        {/* Title - Figma: x: 100, y: varies, font: Clash Grotesk 500, size: 18 */}
        <Text style={styles.settingTitle}>{title}</Text>
      </View>

      {/* Forward Arrow - Figma: x: 375, y: varies, width: 30, height: 30 */}
      <Image
        source={require("../../../../src/assets/images/store-owner-profile/forward-arrow.png")}
        style={styles.forwardArrow}
      />
    </TouchableOpacity>
  );
}

export default function ProfileScreen() {
  // User data state
  const [userData, setUserData] = useState({
    ownerName: 'Store Owner',
    ownerEmail: 'owner@gmail.com',
    logo: null as string | null,
  });
  const [loading, setLoading] = useState(true);

  // Fetch user data from Firebase
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const user = auth.currentUser;
        console.log('🔥 Current user:', user?.uid);

        if (user) {
          // Get user data
          const userRef = ref(database, `users/${user.uid}`);
          const userSnapshot = await get(userRef);

          console.log('👤 User snapshot exists:', userSnapshot.exists());

          // Get store registration data for logo
          const registrationData = await StoreRegistrationService.getRegistrationData(user.uid);
          const logo = registrationData?.businessInfo?.logo || null;

          console.log('🏪 Store logo:', logo ? 'Logo exists' : 'No logo');

          if (userSnapshot.exists()) {
            const data = userSnapshot.val();
            console.log('👤 User data:', data);

            setUserData({
              ownerName: data.name || 'Store Owner',
              ownerEmail: data.email || user.email || 'owner@gmail.com',
              logo: logo,
            });
          } else {
            console.log('❌ No user data found');
            // Fallback to auth email if available
            setUserData({
              ownerName: 'Store Owner',
              ownerEmail: user.email || 'owner@gmail.com',
              logo: logo,
            });
          }
        } else {
          console.log('❌ No authenticated user');
        }
      } catch (error) {
        console.error('💥 Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleBack = () => {
    router.back();
  };

  const handleEditProfile = () => {
    // Navigate to edit profile screen
    console.log("Edit profile pressed");
  };

  const handleMyAccount = () => {
    console.log("My Account pressed");
  };

  const handleNotificationSettings = () => {
    console.log("Notification Settings pressed");
  };

  const handleEWalletDetails = () => {
    console.log("E-Wallet Details pressed");
  };

  const handleLicenseVerification = () => {
    console.log("License Verification pressed");
  };

  const handleStoreInfo = () => {
    console.log("Store Info pressed");
  };

  const handleStoreProduct = () => {
    router.push('/(main)/(store-owner)/profile/store-product');
  };

  const handleHelp = () => {
    console.log("Help pressed");
  };

  const handleLogout = () => {
    console.log("Logout pressed");
  };

  return (
    <View style={styles.container}>
      <CustomStatusBar />

      {/* Fixed Back Button and Settings Title */}
      <View style={styles.fixedHeader}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack} activeOpacity={0.7}>
          <Image
            source={require("../../../../src/assets/images/store-owner-profile/chevron-left.png")}
            style={styles.backIcon}
          />
        </TouchableOpacity>
        <Text style={styles.settingsTitle}>Settings</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

        {/* Profile Section - Figma: x: 20, y: 149, width: 400, height: 80 */}
        <View style={styles.profileSection}>
          {/* Profile Avatar / Store Logo - Dynamic from Firebase */}
          {userData.logo ? (
            <Image
              source={{ uri: userData.logo }}
              style={styles.profileAvatar}
              resizeMode="cover"
            />
          ) : (
            <Image
              source={require("../../../../src/assets/images/store-owner-profile/profile-avatar.png")}
              style={styles.profileAvatar}
              resizeMode="cover"
            />
          )}

          {/* Name Section - Figma: x: 100, y: 171 */}
          <View style={styles.nameSection}>
            <Text style={styles.userName}>{userData.ownerName}</Text>
            <Text style={styles.userEmail}>{userData.ownerEmail}</Text>
          </View>

          {/* Edit Button - Figma: x: 375, y: 174, width: 30, height: 30 */}
          <TouchableOpacity style={styles.editButton} onPress={handleEditProfile} activeOpacity={0.7}>
            <Image
              source={require("../../../../src/assets/images/store-owner-profile/edit-icon.png")}
              style={styles.editIcon}
            />
          </TouchableOpacity>
        </View>

        {/* Other Settings Label - Figma: x: 23, y: 249, font: Clash Grotesk 600, size: 20 */}
        <Text style={styles.sectionLabel}>Other Settings</Text>

        {/* Main Settings Group - Figma: x: 20, y: 291, width: 400, height: 450 */}
        <View style={styles.settingsGroup}>
          <SettingItem
            title="My Account"
            icon={require("../../../../src/assets/images/store-owner-profile/writer-male.png")}
            onPress={handleMyAccount}
          />
          <SettingItem
            title="Notification Setting"
            icon={require("../../../../src/assets/images/store-owner-profile/notification-icon.png")}
            onPress={handleNotificationSettings}
          />
          <SettingItem
            title="E-Wallet Details"
            icon={require("../../../../src/assets/images/store-owner-profile/card-wallet.png")}
            onPress={handleEWalletDetails}
          />
          <SettingItem
            title="License Verification"
            icon={require("../../../../src/assets/images/store-owner-profile/protect-icon.png")}
            onPress={handleLicenseVerification}
          />
          <SettingItem
            title="Store Info"
            icon={require("../../../../src/assets/images/store-owner-profile/shop-icon.png")}
            onPress={handleStoreInfo}
          />
          <SettingItem
            title="Store Product"
            icon={require("../../../../src/assets/images/store-owner-profile/product-icon.png")}
            onPress={handleStoreProduct}
            isLast={true}
          />
        </View>

        {/* Secondary Settings Group - Figma: x: 20, y: 761, width: 400, height: 150 */}
        <View style={styles.secondarySettingsGroup}>
          <SettingItem
            title="Help"
            icon={require("../../../../src/assets/images/store-owner-profile/writer-male.png")}
            onPress={handleHelp}
          />
          <SettingItem
            title="Logout"
            icon={require("../../../../src/assets/images/store-owner-profile/notification-icon.png")}
            onPress={handleLogout}
            isLast={true}
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundGray, // Figma: #F4F6F6
  },

  scrollContent: {
    flexGrow: 1,
    paddingTop: vs(90), // Reduced space for fixed header
    paddingBottom: vs(120), // Space below logout
  },

  // Fixed Header
  fixedHeader: {
    position: 'absolute',
    top: vs(50),
    left: 0,
    right: 0,
    height: vs(40),
    zIndex: 10,
    backgroundColor: Colors.backgroundGray,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Back Button - Fixed position
  backButton: {
    position: 'absolute',
    left: s(20),
    width: s(30),
    height: vs(30),
    borderRadius: s(20),
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 4,
  },

  backIcon: {
    width: s(15),
    height: vs(15),
  },

  // Settings Title - Fixed position
  settingsTitle: {
    fontFamily: 'Clash Grotesk Variable',
    fontWeight: '600',
    fontSize: s(20),
    lineHeight: vs(22),
    color: Colors.darkGray,
    textAlign: 'center',
  },

  // Profile Section - Scrollable
  profileSection: {
    marginLeft: s(20),
    marginTop: vs(10), // Reduced margin above profile
    width: s(400),
    height: vs(80),
    backgroundColor: Colors.white,
    borderRadius: s(16),
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: s(15),
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 5,
    elevation: 5,
  },

  // Profile Avatar - Figma: x: 35, y: 164 (relative to parent: x: 15, y: 15)
  profileAvatar: {
    width: s(50),
    height: vs(50),
    borderRadius: s(25),
  },

  // Name Section - Figma: x: 100, y: 171 (relative to parent: x: 80, y: 22)
  nameSection: {
    flex: 1,
    marginLeft: s(15),
  },

  // User Name - Figma: font: Clash Grotesk 500, size: 18
  userName: {
    fontFamily: 'Clash Grotesk Variable',
    fontWeight: '500',
    fontSize: s(18),
    lineHeight: vs(22),
    color: Colors.darkGray,
  },

  // User Email - Figma: font: Clash Grotesk 500, size: 12
  userEmail: {
    fontFamily: 'Clash Grotesk Variable',
    fontWeight: '500',
    fontSize: s(12),
    lineHeight: vs(15),
    color: 'rgba(30, 30, 30, 0.5)',
    marginTop: vs(2),
  },

  // Edit Button - Figma: x: 375, y: 174 (relative to parent: x: 355, y: 25)
  editButton: {
    width: s(30),
    height: vs(30),
    justifyContent: 'center',
    alignItems: 'center',
  },

  editIcon: {
    width: s(30),
    height: vs(30),
  },

  // Section Label - Scrollable
  sectionLabel: {
    marginLeft: s(23),
    marginTop: vs(20),
    fontFamily: 'Clash Grotesk Variable',
    fontWeight: '600',
    fontSize: s(20),
    lineHeight: vs(22),
    color: Colors.darkGray,
  },

  // Settings Group - Scrollable
  settingsGroup: {
    marginLeft: s(20),
    marginTop: vs(20),
    width: s(400),
    backgroundColor: Colors.white,
    borderRadius: s(16),
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 5,
    elevation: 5,
  },

  // Secondary Settings Group - Scrollable
  secondarySettingsGroup: {
    marginLeft: s(20),
    marginTop: vs(20),
    width: s(400),
    backgroundColor: Colors.white,
    borderRadius: s(16),
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 5,
    elevation: 5,
  },

  // Setting Item - Figma: width: 400, height: 75
  settingItem: {
    width: s(400),
    height: vs(75),
    backgroundColor: Colors.white,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: s(15),
  },

  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },

  // Icon Circle - Figma: x: 35, y: varies (relative: x: 15, y: 15), width: 50, height: 50
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
    shadowOpacity: 1,
    shadowRadius: 5,
    elevation: 5,
    backgroundColor: Colors.white,
  },

  // Setting Icon - Figma: width: 30, height: 30 (relative: x: 10, y: 10)
  settingIcon: {
    width: s(30),
    height: vs(30),
  },

  // Setting Title - Figma: x: 100, y: varies (relative: x: 65, y: 14), font: Clash Grotesk 500, size: 18
  settingTitle: {
    fontFamily: 'Clash Grotesk Variable',
    fontWeight: '500',
    fontSize: s(18),
    lineHeight: vs(22),
    color: Colors.darkGray,
    marginLeft: s(15),
  },

  // Forward Arrow - Figma: x: 375, y: varies (relative: x: 355, y: 25), width: 30, height: 30
  forwardArrow: {
    width: s(30),
    height: vs(30),
  },
});