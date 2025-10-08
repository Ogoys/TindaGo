import { router, usePathname } from "expo-router";
import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { s, vs } from "../../constants/responsive";

interface BottomNavigationProps {
  activeTab?: "home" | "orders" | "category" | "profile" | "cart";
}

export default function BottomNavigation({ activeTab = "home" }: BottomNavigationProps) {
  const pathname = usePathname();

  const currentTab =
    activeTab ||
    (() => {
      if (pathname.includes("/orders")) return "orders";
      if (pathname.includes("/category")) return "category";
      if (pathname.includes("/profile")) return "profile";
      if (pathname.includes("/cart")) return "cart";
      return "home";
    })();

  return (
    <View style={styles.container}>
      {/* Background */}
      <View style={styles.background} />

      {/* HOME TAB */}
      <TouchableOpacity
        style={styles.homeTab}
        onPress={() => router.push("/(main)/(customer)/home")}
        activeOpacity={0.7}
      >
        <Image
          source={require("../../assets/images/customer-home/nav-home-active.png")}
          style={styles.homeIcon}
          resizeMode="contain"
        />
        <Text style={[styles.tabLabel, currentTab === "home" && styles.tabLabelActive]}>
          Home
        </Text>
      </TouchableOpacity>

      {/* ORDERS TAB */}
      <TouchableOpacity
        style={styles.ordersTab}
        onPress={() => router.push("/(main)/(customer)/orders")}
        activeOpacity={0.7}
      >
        <Image
          source={require("../../assets/images/customer-home/nav-orders.png")}
          style={styles.ordersIcon}
          resizeMode="contain"
        />
        <Text style={[styles.tabLabel, currentTab === "orders" && styles.tabLabelActive]}>
          Orders
        </Text>
      </TouchableOpacity>

      {/* CART BUTTON (center floating) */}
      <TouchableOpacity
        style={styles.cartButton}
        onPress={() => router.push("/(main)/(customer)/cart")}
        activeOpacity={0.7}
      >
        <View style={styles.cartWhiteCircle} />
        <View style={styles.cartCircle} />
        <Image
          source={require("../../assets/images/customer-home/nav-cart.png")}
          style={styles.cartIcon}
          resizeMode="contain"
        />
        {/* Cart Label */}
        <Text style={[styles.tabLabel, currentTab === "cart" && styles.tabLabelActive]}>
          Cart
        </Text>
      </TouchableOpacity>

      {/* CATEGORY TAB */}
      <TouchableOpacity
        style={styles.categoryTab}
        onPress={() => router.push("/(main)/(customer)/category")}
        activeOpacity={0.7}
      >
        <Image
          source={require("../../assets/images/customer-home/nav-category.png")}
          style={styles.categoryIcon}
          resizeMode="contain"
        />
        <Text style={[styles.tabLabel, currentTab === "category" && styles.tabLabelActive]}>
          Category
        </Text>
      </TouchableOpacity>

      {/* PROFILE TAB */}
      <TouchableOpacity
        style={styles.profileTab}
        onPress={() => router.push("/(main)/shared/profile")}
        activeOpacity={0.7}
      >
        <Image
          source={require("../../assets/images/customer-home/nav-profile.png")}
          style={styles.profileIcon}
          resizeMode="contain"
        />
        <Text style={[styles.tabLabel, currentTab === "profile" && styles.tabLabelActive]}>
          Profile
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    width: "100%",
    height: vs(130), // slightly reduced
  },

  background: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    width: "100%",
    height: vs(100), // reduced from 110 → 100 to remove some white space
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: s(20),
    borderTopRightRadius: s(20),
    shadowColor: "rgba(0, 0, 0, 0.1)",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 5,
  },

  /** Move icons slightly higher to balance white space */
  homeTab: {
    position: "absolute",
    left: s(25),
    bottom: vs(36), // was 32
    alignItems: "center",
  },
  homeIcon: {
    width: s(30),
    height: s(30),
    marginBottom: vs(4),
  },

  ordersTab: {
    position: "absolute",
    left: s(100),
    bottom: vs(36), // was 32
    alignItems: "center",
  },
  ordersIcon: {
    width: s(30),
    height: s(30),
    marginBottom: vs(4),
  },

  categoryTab: {
    position: "absolute",
    right: s(100),
    bottom: vs(36), // was 32
    alignItems: "center",
  },
  categoryIcon: {
    width: s(30),
    height: s(30),
    marginBottom: vs(4),
  },

  profileTab: {
    position: "absolute",
    right: s(25),
    bottom: vs(36), // was 32
    alignItems: "center",
  },
  profileIcon: {
    width: s(30),
    height: s(30),
    marginBottom: vs(4),
  },

  /** Cart button slightly lower but visually centered */
  cartButton: {
    position: "absolute",
    alignSelf: "center",
    bottom: vs(45), // slightly lower to look natural
    width: s(70),
    height: s(85),
    alignItems: "center",
    justifyContent: "flex-start",
  },
  cartWhiteCircle: {
    position: "absolute",
    top: 0,
    width: s(70),
    height: s(70),
    borderRadius: s(35),
    backgroundColor: "#FFFFFF",
    shadowColor: "rgba(0, 0, 0, 0.15)",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 6,
  },
  cartCircle: {
    position: "absolute",
    top: s(6),
    width: s(58),
    height: s(58),
    borderRadius: s(29),
    backgroundColor: "#3BB77E",
    shadowColor: "rgba(0, 0, 0, 0.25)",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 6,
  },
  cartIcon: {
    width: s(28),
    height: s(28),
    marginTop: vs(22),
    marginBottom: vs(20),
  },

  tabLabel: {
    fontFamily: "Clash Grotesk Variable",
    fontWeight: "400",
    fontSize: 11,
    lineHeight: 16,
    color: "rgba(30, 30, 30, 0.5)",
    textAlign: "center",
  },
  tabLabelActive: {
    color: "#1E1E1E",
    fontWeight: "500",
  },
});