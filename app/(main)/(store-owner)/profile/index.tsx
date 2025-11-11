import React, { useState, useEffect } from "react";
import { ScrollView, StyleSheet, View, Text, TouchableOpacity, Image, Alert } from "react-native";
import { router } from "expo-router";
import { Ionicons } from '@expo/vector-icons';
import { auth, database } from "@/lib/firebase";
import { ref, get } from "firebase/database";
import { signOut } from "firebase/auth";
import { Colors } from "../../../../src/constants/Colors";
import { s, vs, ms } from "../../../../src/constants/responsive";
import { StoreRegistrationService } from "@/services/store";
import { useUser } from "../../../../src/contexts/UserContext";

interface SettingItemProps {
  title: string;
  iconName: keyof typeof Ionicons.glyphMap;
  onPress?: () => void;
  isLast?: boolean;
  iconColor?: string;
}

function SettingItem({ title, iconName, onPress, isLast = false, iconColor }: SettingItemProps) {
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
        {/* Icon Circle */}
        <View style={styles.iconCircle}>
          <Ionicons name={iconName} size={ms(24)} color={iconColor || '#1E1E1E'} />
        </View>

        {/* Title */}
        <Text style={styles.settingTitle}>{title}</Text>
      </View>

      {/* Forward Arrow */}
      <Ionicons name="chevron-forward" size={ms(20)} color="rgba(30, 30, 30, 0.5)" />
    </TouchableOpacity>
  );
}

export default function ProfileScreen() {
  // Get logout from UserContext
  const { logout: contextLogout } = useUser();

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
    router.push('/(main)/(store-owner)/profile/store-info');
  };

  const handleStoreLocation = () => {
    router.push('/(main)/(store-owner)/profile/edit-store-location');
  };

  const handleStoreProduct = () => {
    router.push('/(main)/(store-owner)/profile/store-product');
  };

  const handleRecordWalkInSale = () => {
    router.push('/(main)/(store-owner)/profile/record-walk-in-sale');
  };

  const handleRecordDamage = () => {
    router.push('/(main)/(store-owner)/profile/record-damage');
  };

  const handleSalesDashboard = () => {
    router.push('/(main)/(store-owner)/profile/sales-dashboard');
  };

  const handleSalesHistory = () => {
    router.push('/(main)/(store-owner)/profile/sales-history');
  };

  const handleRecordPurchaseOrder = () => {
    router.push('/(main)/(store-owner)/profile/record-purchase-order');
  };

  const handlePurchaseOrderHistory = () => {
    router.push('/(main)/(store-owner)/profile/purchase-order-history');
  };

  const handleRecordReturn = () => {
    router.push('/(main)/(store-owner)/profile/record-return');
  };

  const handleReturnHistory = () => {
    router.push('/(main)/(store-owner)/profile/return-history');
  };

  const handleHelp = () => {
    console.log("Help pressed");
  };

  const handleLogout = async () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Logout",
          style: "destructive",
          onPress: async () => {
            try {
              console.log("🚪 Logging out...");

              // Sign out from Firebase
              await signOut(auth);
              console.log("✅ Firebase signOut successful");

              // Clear user context
              await contextLogout();
              console.log("✅ Context logout successful");

              // Navigate to onboarding
              router.replace("/(auth)/onboarding");
              console.log("✅ Navigated to onboarding");
            } catch (error) {
              console.error("💥 Error during logout:", error);
              Alert.alert("Error", "Failed to logout. Please try again.");
            }
          }
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
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
          {/* Profile Avatar / Store Logo - Dynamic from Firebase - Default to store logo icon */}
          {userData.logo && !loading ? (
            <Image
              source={{ uri: userData.logo }}
              style={styles.profileAvatar}
              resizeMode="cover"
            />
          ) : (
            <Image
              source={require("../../../../src/assets/images/stores/store-profile-placeholder.png")}
              style={styles.profileAvatar}
              resizeMode="contain"
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

        {/* Main Settings Group */}
        <View style={styles.settingsGroup}>
          <SettingItem
            title="My Account"
            iconName="person"
            onPress={handleMyAccount}
          />
          <SettingItem
            title="Notification Setting"
            iconName="notifications"
            onPress={handleNotificationSettings}
          />
          <SettingItem
            title="E-Wallet Details"
            iconName="wallet"
            onPress={handleEWalletDetails}
          />
          <SettingItem
            title="License Verification"
            iconName="shield-checkmark"
            onPress={handleLicenseVerification}
          />
          <SettingItem
            title="Store Info"
            iconName="storefront"
            onPress={handleStoreInfo}
          />
          <SettingItem
            title="Store Location"
            iconName="location"
            onPress={handleStoreLocation}
          />
          <SettingItem
            title="Store Product"
            iconName="cube"
            onPress={handleStoreProduct}
          />
          <SettingItem
            title="Sales Dashboard"
            iconName="stats-chart"
            onPress={handleSalesDashboard}
          />
          <SettingItem
            title="Sales History"
            iconName="time"
            onPress={handleSalesHistory}
          />
          <SettingItem
            title="Record Walk-in Sale"
            iconName="cash"
            onPress={handleRecordWalkInSale}
          />
          <SettingItem
            title="Record Damages & Spoilages"
            iconName="alert-circle"
            onPress={handleRecordDamage}
          />
          <SettingItem
            title="Record Purchase Order"
            iconName="add-circle"
            onPress={handleRecordPurchaseOrder}
          />
          <SettingItem
            title="Purchase Order History"
            iconName="receipt"
            onPress={handlePurchaseOrderHistory}
          />
          <SettingItem
            title="Record Customer Return"
            iconName="return-down-back"
            onPress={handleRecordReturn}
          />
          <SettingItem
            title="Return History"
            iconName="list"
            onPress={handleReturnHistory}
            isLast={true}
          />
        </View>

        {/* Secondary Settings Group */}
        <View style={styles.secondarySettingsGroup}>
          <SettingItem
            title="Help"
            iconName="help-circle"
            onPress={handleHelp}
          />
          <SettingItem
            title="Logout"
            iconName="log-out"
            iconColor="#EF4444"
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
    paddingTop: vs(119), // Match ProfileScreenHeader height (79 + 20 + 20)
    paddingBottom: vs(120), // Space below logout
  },

  // Fixed Header
  fixedHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingTop: vs(79),
    paddingBottom: vs(20),
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


  // Setting Title - Figma: x: 100, y: varies (relative: x: 65, y: 14), font: Clash Grotesk 500, size: 18
  settingTitle: {
    fontFamily: 'Clash Grotesk Variable',
    fontWeight: '500',
    fontSize: s(18),
    lineHeight: vs(22),
    color: Colors.darkGray,
    marginLeft: s(15),
  },

});