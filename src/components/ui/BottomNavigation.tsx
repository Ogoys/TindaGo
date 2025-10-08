import { router, usePathname } from "expo-router";
import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { s, vs } from "../../constants/responsive";

/**
 * BOTTOM NAVIGATION BAR
 *
 * Figma: 759:610 - Nav bar instance
 * Node: I759:610 (Component Instance)
 * Dimensions: 440x120px
 *
 * Complete rebuild from Figma with exact positioning
 */

interface BottomNavigationProps {
  activeTab?: "home" | "orders" | "category" | "profile";
}

export default function BottomNavigation({ activeTab = "home" }: BottomNavigationProps) {
  const pathname = usePathname();

  // Determine active tab from pathname if not provided
  const currentTab = activeTab || (() => {
    if (pathname.includes("/orders")) return "orders";
    if (pathname.includes("/category")) return "category";
    if (pathname.includes("/profile")) return "profile";
    return "home";
  })();

  return (
    <View style={styles.container}>
      {/* Background - Figma: I759:610;47:9 Rectangle 28 */}
      <View style={styles.background} />

      {/* HOME TAB - Figma: I759:610;61:45, x:35, y:50, width:31, height:52 */}
      <TouchableOpacity
        style={styles.homeTab}
        onPress={() => router.push("/(main)/(customer)/home")}
        activeOpacity={0.7}
      >
        {/* Home Icon - Figma: I759:610;61:18, width:30, height:30 */}
        <Image
          source={require("../../assets/images/customer-home/nav-home-active.png")}
          style={styles.homeIcon}
          resizeMode="contain"
        />
        {/* Home Label - Figma: I759:610;61:35, y:30 */}
        <Text style={[
          styles.tabLabel,
          currentTab === "home" && styles.tabLabelActive
        ]}>
          Home
        </Text>
      </TouchableOpacity>

      {/* ORDERS TAB - Figma: I759:610;61:47, x:126, y:51, width:38, height:51 */}
      <TouchableOpacity
        style={styles.ordersTab}
        onPress={() => router.push("/(main)/(customer)/orders")}
        activeOpacity={0.7}
      >
        {/* Orders Icon - Figma: I759:610;61:38, x:4, y:0, width:30, height:30 */}
        <Image
          source={require("../../assets/images/customer-home/nav-orders.png")}
          style={styles.ordersIcon}
          resizeMode="contain"
        />
        {/* Orders Label - Figma: I759:610;61:36, y:29 */}
        <Text style={[
          styles.tabLabel,
          currentTab === "orders" && styles.tabLabelActive
        ]}>
          Orders
        </Text>
      </TouchableOpacity>

      {/* CART BUTTON (CENTER) - White circle with green circle inside */}
      <TouchableOpacity
        style={styles.cartButton}
        onPress={() => router.push("/(main)/(customer)/cart")}
        activeOpacity={0.7}
      >
        {/* White Outer Circle Background */}
        <View style={styles.cartWhiteCircle} />
        {/* Cart Green Circle Background */}
        <View style={styles.cartCircle} />
        {/* Cart Icon */}
        <Image
          source={require("../../assets/images/customer-home/nav-cart.png")}
          style={styles.cartIcon}
          resizeMode="contain"
        />
      </TouchableOpacity>

      {/* CATEGORY TAB - Figma: I759:610;61:46, x:270, y:50, width:49, height:52 */}
      <TouchableOpacity
        style={styles.categoryTab}
        onPress={() => router.push("/(main)/(customer)/category")}
        activeOpacity={0.7}
      >
        {/* Category Icon - Figma: I759:610;61:29, x:10, y:0, width:30, height:30 */}
        <Image
          source={require("../../assets/images/customer-home/nav-category.png")}
          style={styles.categoryIcon}
          resizeMode="contain"
        />
        {/* Category Label - Figma: I759:610;61:40, y:30 */}
        <Text style={[
          styles.tabLabel,
          currentTab === "category" && styles.tabLabelActive
        ]}>
          Category
        </Text>
      </TouchableOpacity>

      {/* PROFILE TAB - Figma: I759:610;61:44, x:373, y:50, width:33, height:52 */}
      <TouchableOpacity
        style={styles.profileTab}
        onPress={() => router.push("/(main)/shared/profile")}
        activeOpacity={0.7}
      >
        {/* Profile Icon - Figma: I759:610;61:31, x:2, y:0, width:30, height:30 */}
        <Image
          source={require("../../assets/images/customer-home/nav-profile.png")}
          style={styles.profileIcon}
          resizeMode="contain"
        />
        {/* Profile Label - Figma: I759:610;61:42, y:30 */}
        <Text style={[
          styles.tabLabel,
          currentTab === "profile" && styles.tabLabelActive
        ]}>
          Profile
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  // Container - Navigation bar with extended height for overlap
  container: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    width: "100%",
    height: vs(120), // Extended to accommodate overlapping cart
  },

  // Background - White navigation bar with more space above icons
  background: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    width: "100%",
    height: vs(100), // Increased to 100 for more spacing above icons
    backgroundColor: "#FFFFFF",
  },

  // Home Tab - Aligned on white background with more top space
  homeTab: {
    position: "absolute",
    left: s(20),
    bottom: vs(15),
    width: s(60),
    height: vs(80),
    alignItems: "center",
    justifyContent: "flex-start",
  },

  // Home Icon - width:30, height:30
  homeIcon: {
    width: s(30),
    height: s(30),
    marginBottom: vs(4),
  },

  // Orders Tab - Aligned on white background with more top space
  ordersTab: {
    position: "absolute",
    left: s(100),
    bottom: vs(15),
    width: s(60),
    height: vs(80),
    alignItems: "center",
    justifyContent: "flex-start",
  },

  // Orders Icon - width:30, height:30
  ordersIcon: {
    width: s(30),
    height: s(30),
    marginBottom: vs(4),
  },

  // Cart Button - Centered on white background, overlapping
  cartButton: {
    position: "absolute",
    left: s(190),
    bottom: vs(50), // Centered on 100px white background
    width: s(60),
    height: s(60),
    alignItems: "center",
    justifyContent: "center",
  },

  // Cart White Outer Circle - Creates overlap effect
  cartWhiteCircle: {
    position: "absolute",
    width: s(60),
    height: s(60),
    borderRadius: s(30),
    backgroundColor: "#FFFFFF",
    shadowColor: "rgba(0, 0, 0, 0.15)",
    shadowOffset: { width: 0, height: vs(2) },
    shadowOpacity: 1,
    shadowRadius: s(8),
    elevation: 3,
  },

  // Cart Green Circle - Inside white circle
  cartCircle: {
    position: "absolute",
    width: s(50),
    height: s(50),
    borderRadius: s(25),
    backgroundColor: "#3BB77E",
    shadowColor: "rgba(0, 0, 0, 0.25)",
    shadowOffset: { width: 0, height: vs(4) },
    shadowOpacity: 1,
    shadowRadius: s(5),
    elevation: 5,
  },

  // Cart Icon - Figma: I759:610;61:25, x:12, y:12, width:25, height:25
  cartIcon: {
    width: s(25),
    height: s(25),
  },

  // Category Tab - Aligned on white background with more top space
  categoryTab: {
    position: "absolute",
    left: s(280),
    bottom: vs(15),
    width: s(60),
    height: vs(80),
    alignItems: "center",
    justifyContent: "flex-start",
  },

  // Category Icon - width:30, height:30
  categoryIcon: {
    width: s(30),
    height: s(30),
    marginBottom: vs(4),
  },

  // Profile Tab - Aligned on white background with more top space
  profileTab: {
    position: "absolute",
    left: s(360),
    bottom: vs(15),
    width: s(60),
    height: vs(80),
    alignItems: "center",
    justifyContent: "flex-start",
  },

  // Profile Icon - width:30, height:30
  profileIcon: {
    width: s(30),
    height: s(30),
    marginBottom: vs(4),
  },

  // Tab Label - fontSize:11, fontWeight:400
  tabLabel: {
    fontFamily: "Clash Grotesk Variable",
    fontWeight: "400",
    fontSize: 11,
    lineHeight: 11 * 1.5,
    color: "rgba(30, 30, 30, 0.5)",
    textAlign: "center",
  },

  // Active Tab Label
  tabLabelActive: {
    color: "#1E1E1E",
    fontWeight: "500",
  },
});
