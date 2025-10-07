import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import { router, usePathname } from "expo-router";
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

      {/* CART BUTTON (CENTER) - Figma: I759:610;61:34, x:195, y:20, width:50, height:50 */}
      <TouchableOpacity
        style={styles.cartButton}
        onPress={() => router.push("/(main)/(customer)/cart")}
        activeOpacity={0.7}
      >
        {/* Cart Circle Background - Figma: I759:610;61:33, Ellipse with shadow */}
        <View style={styles.cartCircle} />
        {/* Cart Icon - Figma: I759:610;61:25, x:12, y:12, width:25, height:25 */}
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
  // Container - Figma: 759:610, width:440, height:120
  container: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    width: "100%",
    height: vs(120),
  },

  // Background - Figma: I759:610;47:9, Rectangle 28
  background: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    width: "100%",
    height: vs(120),
    backgroundColor: "#FFFFFF", // Figma: fill_7CHBW6
  },

  // Home Tab - Figma: I759:610;61:45, x:35, y:50, width:31, height:52
  homeTab: {
    position: "absolute",
    left: s(35),
    bottom: vs(18), // 120 - 50 - 52 = 18
    width: s(31),
    height: vs(52),
    alignItems: "center",
    justifyContent: "flex-start",
  },

  // Home Icon - Figma: I759:610;61:18, width:30, height:30
  homeIcon: {
    width: s(30),
    height: s(30),
  },

  // Orders Tab - Figma: I759:610;61:47, x:126, y:51, width:38, height:51
  ordersTab: {
    position: "absolute",
    left: s(126),
    bottom: vs(17), // 120 - 51 - 52 = 17
    width: s(38),
    height: vs(51),
    alignItems: "center",
    justifyContent: "flex-start",
  },

  // Orders Icon - Figma: I759:610;61:38, x:4, y:0, width:30, height:30
  ordersIcon: {
    width: s(30),
    height: s(30),
    marginLeft: s(4),
  },

  // Cart Button - Figma: I759:610;61:34, x:195, y:20, width:50, height:50
  cartButton: {
    position: "absolute",
    left: s(195),
    bottom: vs(50), // 120 - 20 - 50 = 50
    width: s(50),
    height: s(50),
    alignItems: "center",
    justifyContent: "center",
  },

  // Cart Circle - Figma: I759:610;61:33, Ellipse 1 with shadow
  cartCircle: {
    position: "absolute",
    width: s(50),
    height: s(50),
    borderRadius: s(25),
    backgroundColor: "#3BB77E", // Figma: fill_S68V5W
    shadowColor: "rgba(0, 0, 0, 0.25)", // Figma: effect_WEP1BK
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

  // Category Tab - Figma: I759:610;61:46, x:270, y:50, width:49, height:52
  categoryTab: {
    position: "absolute",
    left: s(270),
    bottom: vs(18), // 120 - 50 - 52 = 18
    width: s(49),
    height: vs(52),
    alignItems: "center",
    justifyContent: "flex-start",
  },

  // Category Icon - Figma: I759:610;61:29, x:10, y:0, width:30, height:30
  categoryIcon: {
    width: s(30),
    height: s(30),
    marginLeft: s(10),
  },

  // Profile Tab - Figma: I759:610;61:44, x:373, y:50, width:33, height:52
  profileTab: {
    position: "absolute",
    left: s(373),
    bottom: vs(18), // 120 - 50 - 52 = 18
    width: s(33),
    height: vs(52),
    alignItems: "center",
    justifyContent: "flex-start",
  },

  // Profile Icon - Figma: I759:610;61:31, x:2, y:0, width:30, height:30
  profileIcon: {
    width: s(30),
    height: s(30),
    marginLeft: s(2),
  },

  // Tab Label - Figma: fontSize:12, fontWeight:400
  tabLabel: {
    marginTop: vs(0),
    fontFamily: "Clash Grotesk Variable",
    fontWeight: "400", // Figma: style_DEANF8
    fontSize: 12,
    lineHeight: 12 * 1.833,
    color: "rgba(30, 30, 30, 0.5)", // Figma: fill_9N9TWO
    textAlign: "center",
  },

  // Active Tab Label - Figma: fill_3YQ32C
  tabLabelActive: {
    color: "#1E1E1E",
    fontWeight: "400",
  },
});
