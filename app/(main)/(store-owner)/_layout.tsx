import { Tabs } from "expo-router";
import { View, Image } from "react-native";
import { Colors } from "../../../src/constants/Colors";
import { s, vs } from "../../../src/constants/responsive";

export default function StoreOwnerLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: Colors.white,
          height: vs(120),
          paddingBottom: vs(20),
          paddingTop: vs(20),
          borderTopWidth: 0,
          shadowColor: Colors.shadow,
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.25,
          shadowRadius: s(5),
          elevation: 10,
        },
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textSecondary,
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "500",
          marginTop: vs(4),
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
        name="category"
        options={{
          title: "Category",
          tabBarIcon: ({ focused }) => (
            <Image
              source={require('../../../src/assets/images/store-owner-dashboard/category-icon.png')}
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
    </Tabs>
  );
}