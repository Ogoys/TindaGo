import { Tabs, usePathname } from "expo-router";
import { View, Image, Text } from "react-native";
import { Colors } from "../../../src/constants/Colors";
import { s, vs } from "../../../src/constants/responsive";
import { Ionicons } from '@expo/vector-icons';

export default function StoreOwnerLayout() {
  const pathname = usePathname();

  // Hide bottom tabs when inside profile or inventory subdirectories
  // Show tabs ONLY on: /home, /orders, /supplier-dashboard (index), /profile (index), /inventory (index)
  // Keep tabs visible for ALL supplier routes so "Suppliers" tab stays highlighted
  const hideTabsProfile = pathname?.startsWith('/(main)/(store-owner)/profile/') && pathname !== '/(main)/(store-owner)/profile';
  const hideTabsInventory = pathname?.startsWith('/(main)/(store-owner)/inventory/') && pathname !== '/(main)/(store-owner)/inventory';
  const hideTabs = hideTabsProfile || hideTabsInventory;

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
      {/* Suppliers tab - points to supplier-dashboard but also highlights for suppliers/* routes */}
      <Tabs.Screen
        name="supplier-dashboard"
        options={{
          title: "Suppliers",
          tabBarIcon: ({ focused, color }) => (
            <Ionicons 
              name="people" 
              size={s(30)} 
              color={(focused || pathname?.includes('/suppliers/')) ? Colors.primary : Colors.textSecondary} 
            />
          ),
          tabBarLabel: ({ focused, color }) => (
            <Text style={{
              fontSize: 12,
              fontWeight: "500",
              marginTop: vs(4),
              color: (focused || pathname?.includes('/suppliers/')) ? Colors.primary : Colors.textSecondary,
            }}>
              Suppliers
            </Text>
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
      {/* Hide suppliers folder from tabs but enable icon highlighting for nested routes */}
      <Tabs.Screen
        name="suppliers"
        options={{
          href: null,
          // This hidden screen represents all suppliers/* sub-routes
          // When user is on suppliers/*, this tab is technically "active" in routing
          // but we visually show the supplier-dashboard tab as active instead
        }}
      />
    </Tabs>
  );
}
