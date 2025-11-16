import { Tabs, usePathname } from "expo-router";
import { View, Image } from "react-native";
import { Colors } from "../../../src/constants/Colors";
import { s, vs } from "../../../src/constants/responsive";

export default function StoreOwnerLayout() {
  const pathname = usePathname();

  // Hide bottom tabs when inside wallet, profile, or inventory subdirectories
  // Show tabs ONLY on: /home, /orders, /wallet (index), /profile (index), /inventory (index)
  const hideTabsWallet = pathname?.startsWith('/(main)/(store-owner)/wallet/') && pathname !== '/(main)/(store-owner)/wallet';
  const hideTabsProfile = pathname?.startsWith('/(main)/(store-owner)/profile/') && pathname !== '/(main)/(store-owner)/profile';
  const hideTabsInventory = pathname?.startsWith('/(main)/(store-owner)/inventory/') && pathname !== '/(main)/(store-owner)/inventory';
  const hideTabs = hideTabsWallet || hideTabsProfile || hideTabsInventory;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: Colors.white,
          height: hideTabs ? 0 : vs(80),
          paddingBottom: hideTabs ? 0 : vs(12),
          paddingTop: hideTabs ? 0 : vs(8),
          borderTopWidth: 1,
          borderTopColor: '#E5E7EB',
          shadowColor: Colors.shadow,
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: hideTabs ? 0 : 0.1,
          shadowRadius: hideTabs ? 0 : s(8),
          elevation: hideTabs ? 0 : 8,
          display: hideTabs ? 'none' : 'flex',
        },
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textSecondary,
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "500",
          marginTop: vs(4),
          display: hideTabs ? 'none' : 'flex',
        },
        tabBarIconStyle: {
          marginTop: vs(8),
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "Home",
          tabBarIcon: ({ focused }) => (
            <Image
              source={require('../../../src/assets/images/store-owner-dashboard/home-icon.png')}
              style={{
                width: s(30),
                height: s(30),
                tintColor: focused ? Colors.primary : Colors.textSecondary,
              }}
              resizeMode="contain"
            />
          ),
        }}
      />
      <Tabs.Screen
        name="orders"
        options={{
          title: "Orders",
          tabBarIcon: ({ focused }) => (
            <Image
              source={require('../../../src/assets/images/store-owner-dashboard/orders-icon.png')}
              style={{
                width: s(30),
                height: s(30),
                tintColor: focused ? Colors.primary : Colors.textSecondary,
              }}
              resizeMode="contain"
            />
          ),
        }}
      />
      <Tabs.Screen
        name="wallet"
        options={{
          title: "Wallet",
          tabBarIcon: ({ focused }) => (
            <Image
              source={require('../../../src/assets/images/store-owner-dashboard/wallet-icon.png')}
              style={{
                width: s(30),
                height: s(30),
                tintColor: focused ? Colors.primary : Colors.textSecondary,
              }}
              resizeMode="contain"
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ focused }) => (
            <Image
              source={require('../../../src/assets/images/store-owner-dashboard/person-icon.png')}
              style={{
                width: s(30),
                height: s(30),
                tintColor: focused ? Colors.primary : Colors.textSecondary,
              }}
              resizeMode="contain"
            />
          ),
        }}
      />
      <Tabs.Screen
        name="inventory"
        options={{
          title: "Inventory",
          tabBarIcon: ({ focused }) => (
            <Image
              source={require('../../../src/assets/images/store-owner-dashboard/purchase-order-icon.png')}
              style={{
                width: s(30),
                height: s(30),
                tintColor: focused ? Colors.primary : Colors.textSecondary,
              }}
              resizeMode="contain"
            />
          ),
        }}
      />
    </Tabs>
  );
}
