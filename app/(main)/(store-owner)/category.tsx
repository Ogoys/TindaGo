import React from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { CustomStatusBar } from "../../../src/components/ui/StatusBar";
import { Typography } from "../../../src/components/ui/Typography";
import { Colors } from "../../../src/constants/Colors";
import { s, vs } from "../../../src/constants/responsive";

export default function CategoryScreen() {
  return (
    <View style={styles.container}>
      <CustomStatusBar />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Typography variant="h1" style={styles.title}>
            Category
          </Typography>
          <Typography variant="body" style={styles.subtitle}>
            Manage product categories
          </Typography>
        </View>

        {/* Coming Soon */}
        <View style={styles.comingSoon}>
          <Typography variant="h2" style={styles.comingSoonText}>
            Category Management
          </Typography>
          <Typography variant="body" style={styles.comingSoonDescription}>
            This feature is coming soon. You'll be able to organize and manage your product categories here.
          </Typography>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },

  scrollContent: {
    flexGrow: 1,
    paddingBottom: vs(20),
  },

  header: {
    paddingHorizontal: s(20),
    paddingTop: vs(20),
    paddingBottom: vs(30),
  },

  title: {
    fontSize: s(28),
    fontWeight: '700',
    color: Colors.darkGray,
    marginBottom: vs(8),
  },

  subtitle: {
    fontSize: s(16),
    color: Colors.textSecondary,
  },

  comingSoon: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: s(40),
  },

  comingSoonText: {
    fontSize: s(24),
    fontWeight: '600',
    color: Colors.primary,
    textAlign: 'center',
    marginBottom: vs(16),
  },

  comingSoonDescription: {
    fontSize: s(16),
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: vs(24),
  },
});