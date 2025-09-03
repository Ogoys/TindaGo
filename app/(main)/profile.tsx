import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "../../src/constants/Colors";
import { Fonts } from "../../src/constants/Fonts";

export default function ProfileScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Profile</Text>
        <Text style={styles.subtitle}>Manage your account settings</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundGray,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  title: {
    fontSize: Fonts.sizes.xl,
    fontFamily: Fonts.primary,
    fontWeight: Fonts.weights.semiBold,
    color: Colors.darkGray,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: Fonts.sizes.md,
    fontFamily: Fonts.primary,
    fontWeight: Fonts.weights.normal,
    color: Colors.textSecondary,
    textAlign: "center",
  },
});