import { router, usePathname } from "expo-router";
import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { s, vs } from "../../constants/responsive";

interface StoreBottomNavigationProps {
  activeTab?: "home" | "orders" | "index" | "profile";
}

export default function StoreBottomNavigation({ activeTab = "home" }: StoreBottomNavigationProps) {
  const pathname = usePathname();

  const currentTab =
    activeTab ||
    (() => {
      if (pathname.includes("/orders")) return "orders";
      if (pathname.includes("/wallet")) return "wallet";
      if (pathname.includes("/profile")) return "profile";
      return "home";
    })();

  return (
    <View style={styles.container}>
      {/* Background */}
      <View style={styles.background} />

      {/* HOME TAB */}
      <TouchableOpacity
        style={styles.homeTab}
        onPress={() => router.push("/(main)/(store-owner)/home")}
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
        onPress={() => router.push("/(main)/(store-owner)/orders")}
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

      {/* WALLET TAB (replaces Category for store owners) */}
      <TouchableOpacity
        style={styles.walletTab}
        onPress={() => router.push("/(main)/(store-owner)/wallet")}
        activeOpacity={0.7}
      >
        <Image
          source={require("../../assets/images/store-owner-dashboard/wallet-icon.png")}
          style={styles.walletIcon}
          resizeMode="contain"
        />
        <Text style={[styles.tabLabel, currentTab === "index" && styles.tabLabelActive]}>
          Wallet
        </Text>
      </TouchableOpacity>

      {/* PROFILE TAB */}
      <TouchableOpacity
        style={styles.profileTab}
        onPress={() => router.push("/(main)/(store-owner)/profile")}
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
    height: vs(85),
    paddingBottom: vs(10),
  },

  background: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    width: "100%",
    height: vs(85),
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: s(20),
    borderTopRightRadius: s(20),
    shadowColor: "rgba(0, 0, 0, 0.1)",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 5,
  },

  homeTab: {
    position: "absolute",
    left: s(40),
    bottom: vs(22),
    alignItems: "center",
  },
  homeIcon: {
    width: s(26),
    height: s(26),
    marginBottom: vs(3),
  },

  ordersTab: {
    position: "absolute",
    left: s(130),
    bottom: vs(22),
    alignItems: "center",
  },
  ordersIcon: {
    width: s(26),
    height: s(26),
    marginBottom: vs(3),
  },

  walletTab: {
    position: "absolute",
    right: s(130),
    bottom: vs(22),
    alignItems: "center",
  },
  walletIcon: {
    width: s(26),
    height: s(26),
    marginBottom: vs(3),
  },

  profileTab: {
    position: "absolute",
    right: s(40),
    bottom: vs(22),
    alignItems: "center",
  },
  profileIcon: {
    width: s(26),
    height: s(26),
    marginBottom: vs(3),
  },

  tabLabel: {
    fontFamily: "Clash Grotesk Variable",
    fontWeight: "400",
    fontSize: 10,
    lineHeight: 12,
    color: "rgba(30, 30, 30, 0.5)",
    textAlign: "center",
    marginTop: 0,
    paddingBottom: 0,
  },
  tabLabelActive: {
    color: "#1E1E1E",
    fontWeight: "500",
  },
});
