import { Tabs } from "expo-router";
import { View } from "react-native";
import { Colors } from "../../../src/constants/Colors";
import { s, vs } from "../../../src/constants/responsive";

export default function CustomerLayout() {
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
            <View style={{
              width: s(31),
              height: s(52),
              justifyContent: "center",
              alignItems: "center",
            }}>
              <View style={{
                width: s(24),
                height: s(24),
                backgroundColor: focused ? Colors.primary : Colors.textSecondary,
              }} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="orders"
        options={{
          title: "Orders",
          tabBarIcon: ({ focused }) => (
            <View style={{
              width: s(38),
              height: s(51),
              justifyContent: "center",
              alignItems: "center",
            }}>
              <View style={{
                width: s(24),
                height: s(24),
                backgroundColor: focused ? Colors.primary : Colors.textSecondary,
              }} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="cart"
        options={{
          title: "Cart",
          tabBarIcon: ({ focused }) => (
            <View style={{
              width: s(50),
              height: s(50),
              backgroundColor: focused ? Colors.primary : Colors.lightGray,
              borderRadius: s(25),
              justifyContent: "center",
              alignItems: "center",
              shadowColor: Colors.shadow,
              shadowOffset: { width: 0, height: vs(4) },
              shadowOpacity: 0.25,
              shadowRadius: s(5),
              elevation: 5,
              marginTop: vs(-10),
            }}>
              <View style={{
                width: s(24),
                height: s(24),
                backgroundColor: focused ? Colors.white : Colors.textSecondary,
              }} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="category"
        options={{
          title: "Category",
          tabBarIcon: ({ focused }) => (
            <View style={{
              width: s(49),
              height: s(52),
              justifyContent: "center",
              alignItems: "center",
            }}>
              <View style={{
                width: s(24),
                height: s(24),
                backgroundColor: focused ? Colors.primary : Colors.textSecondary,
              }} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="see-more"
        options={{
          href: null, // Hidden from tabs, accessible via navigation
        }}
      />
    </Tabs>
  );
}