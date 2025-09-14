import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Colors } from "../../../src/constants/Colors";
import { Fonts } from "../../../src/constants/Fonts";
import { s, vs } from "../../../src/constants/responsive";
import { useUser } from "../../../src/contexts/UserContext";

export default function ProfileScreen() {
  const { user, logout } = useUser();

  const handleLogout = () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Logout",
          style: "destructive",
          onPress: async () => {
            await logout();
            router.replace("/(auth)/onboarding");
          }
        }
      ]
    );
  };

  const handleRoleSwitch = () => {
    Alert.alert(
      "Switch Role",
      "You can switch between Customer and Store Owner modes",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Switch Role",
          onPress: () => router.push("/role-selection")
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Profile</Text>
        <Text style={styles.subtitle}>Manage your account settings</Text>

        {user && (
          <View style={styles.userInfo}>
            <Text style={styles.userText}>Email: {user.email}</Text>
            <Text style={styles.userText}>Role: {user.role}</Text>
            {user.phoneNumber && (
              <Text style={styles.userText}>Phone: {user.phoneNumber}</Text>
            )}
          </View>
        )}

        <View style={styles.actions}>
          <TouchableOpacity style={styles.actionButton} onPress={handleRoleSwitch}>
            <Text style={styles.actionText}>Switch Role</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.actionButton, styles.logoutButton]} onPress={handleLogout}>
            <Text style={[styles.actionText, styles.logoutText]}>Logout</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: s(20),
  },
  title: {
    fontSize: s(24),
    fontFamily: Fonts.primary,
    fontWeight: "bold",
    color: Colors.black,
    marginBottom: vs(10),
  },
  subtitle: {
    fontSize: s(16),
    fontFamily: Fonts.primary,
    fontWeight: "normal",
    color: Colors.textSecondary,
    textAlign: "center",
    marginBottom: vs(30),
  },
  userInfo: {
    backgroundColor: Colors.lightGray,
    padding: s(20),
    borderRadius: s(10),
    marginBottom: vs(30),
    minWidth: s(250),
  },
  userText: {
    fontFamily: Fonts.primary,
    fontSize: s(14),
    color: Colors.black,
    marginBottom: vs(5),
  },
  actions: {
    gap: vs(15),
    minWidth: s(200),
  },
  actionButton: {
    backgroundColor: Colors.primary,
    paddingVertical: vs(12),
    paddingHorizontal: s(20),
    borderRadius: s(8),
    alignItems: "center",
  },
  logoutButton: {
    backgroundColor: Colors.darkGray,
  },
  actionText: {
    fontFamily: Fonts.primary,
    fontSize: s(16),
    fontWeight: "600",
    color: Colors.white,
  },
  logoutText: {
    color: Colors.white,
  },
});