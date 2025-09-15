import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from "react-native";
import { Colors } from "../../../src/constants/Colors";
import { s, vs } from "../../../src/constants/responsive";
import { Fonts } from "../../../src/constants/Fonts";

export default function StoreOwnerDashboard() {
  const handleFeaturePress = (featureName: string) => {
    Alert.alert("Coming Soon", `${featureName} feature is being developed and will be available soon!`);
  };


  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header Section */}
        <View style={styles.header}>
          <Text style={styles.welcomeText}>Welcome to TindaGo!</Text>
          <Text style={styles.subtitle}>Store Owner Dashboard</Text>
          <Text style={styles.description}>
            Your store is now live! Start managing your business with these powerful tools.
          </Text>
        </View>

        {/* Quick Stats Cards */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>0</Text>
            <Text style={styles.statLabel}>Active Orders</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>0</Text>
            <Text style={styles.statLabel}>Products</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>₱0</Text>
            <Text style={styles.statLabel}>Today&apos;s Sales</Text>
          </View>
        </View>

        {/* Features Grid */}
        <View style={styles.featuresContainer}>
          <Text style={styles.sectionTitle}>Manage Your Store</Text>

          <View style={styles.featuresGrid}>
            {[
              { title: "Inventory Management", icon: "📦", description: "Add and manage your products" },
              { title: "Order Management", icon: "📋", description: "View and process customer orders" },
              { title: "Sales Analytics", icon: "📊", description: "Track your business performance" },
              { title: "Store Settings", icon: "⚙️", description: "Update store information" },
              { title: "Customer Reviews", icon: "⭐", description: "Manage customer feedback" },
              { title: "Payment Setup", icon: "💳", description: "Configure payment methods" },
            ].map((feature, index) => (
              <TouchableOpacity
                key={index}
                style={styles.featureCard}
                onPress={() => handleFeaturePress(feature.title)}
                activeOpacity={0.8}
              >
                <Text style={styles.featureIcon}>{feature.icon}</Text>
                <Text style={styles.featureTitle}>{feature.title}</Text>
                <Text style={styles.featureDescription}>{feature.description}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Getting Started Section */}
        <View style={styles.gettingStartedContainer}>
          <Text style={styles.sectionTitle}>Getting Started</Text>
          <View style={styles.stepCard}>
            <Text style={styles.stepNumber}>1</Text>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Add Your First Product</Text>
              <Text style={styles.stepDescription}>Start by adding products to your inventory</Text>
            </View>
          </View>
          <View style={styles.stepCard}>
            <Text style={styles.stepNumber}>2</Text>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Set Up Store Hours</Text>
              <Text style={styles.stepDescription}>Configure when your store is open for orders</Text>
            </View>
          </View>
          <View style={styles.stepCard}>
            <Text style={styles.stepNumber}>3</Text>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Start Receiving Orders</Text>
              <Text style={styles.stepDescription}>Your store will be visible to customers</Text>
            </View>
          </View>
        </View>


      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundGray,
  },

  scrollView: {
    flex: 1,
  },

  // Header Section
  header: {
    backgroundColor: Colors.primary,
    paddingTop: vs(60),
    paddingBottom: vs(30),
    paddingHorizontal: s(20),
    borderBottomLeftRadius: s(25),
    borderBottomRightRadius: s(25),
  },
  welcomeText: {
    fontFamily: Fonts.primary,
    fontSize: s(28),
    fontWeight: Fonts.weights.bold,
    color: Colors.white,
    textAlign: "center",
    marginBottom: vs(8),
  },
  subtitle: {
    fontFamily: Fonts.primary,
    fontSize: s(16),
    fontWeight: Fonts.weights.medium,
    color: "rgba(255, 255, 255, 0.8)",
    textAlign: "center",
    marginBottom: vs(15),
  },
  description: {
    fontFamily: Fonts.primary,
    fontSize: s(14),
    fontWeight: Fonts.weights.normal,
    color: "rgba(255, 255, 255, 0.7)",
    textAlign: "center",
    lineHeight: vs(20),
  },

  // Stats Cards
  statsContainer: {
    flexDirection: "row",
    paddingHorizontal: s(20),
    paddingVertical: vs(25),
    gap: s(15),
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: s(15),
    paddingVertical: vs(20),
    paddingHorizontal: s(15),
    alignItems: "center",
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: s(4),
    elevation: 3,
  },
  statNumber: {
    fontFamily: Fonts.primary,
    fontSize: s(24),
    fontWeight: Fonts.weights.bold,
    color: Colors.primary,
    marginBottom: vs(5),
  },
  statLabel: {
    fontFamily: Fonts.primary,
    fontSize: s(12),
    fontWeight: Fonts.weights.normal,
    color: Colors.textSecondary,
    textAlign: "center",
  },

  // Features Section
  featuresContainer: {
    paddingHorizontal: s(20),
    marginBottom: vs(30),
  },
  sectionTitle: {
    fontFamily: Fonts.primary,
    fontSize: s(20),
    fontWeight: Fonts.weights.semiBold,
    color: Colors.black,
    marginBottom: vs(20),
  },
  featuresGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: s(15),
  },
  featureCard: {
    width: (s(400) - s(40) - s(15)) / 2, // Two columns with gap
    backgroundColor: Colors.white,
    borderRadius: s(15),
    padding: s(20),
    alignItems: "center",
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: s(4),
    elevation: 3,
  },
  featureIcon: {
    fontSize: s(32),
    marginBottom: vs(10),
  },
  featureTitle: {
    fontFamily: Fonts.primary,
    fontSize: s(14),
    fontWeight: Fonts.weights.semiBold,
    color: Colors.black,
    textAlign: "center",
    marginBottom: vs(5),
  },
  featureDescription: {
    fontFamily: Fonts.primary,
    fontSize: s(11),
    fontWeight: Fonts.weights.normal,
    color: Colors.textSecondary,
    textAlign: "center",
    lineHeight: vs(14),
  },

  // Getting Started Section
  gettingStartedContainer: {
    paddingHorizontal: s(20),
    paddingBottom: vs(30),
  },
  stepCard: {
    flexDirection: "row",
    backgroundColor: Colors.white,
    borderRadius: s(15),
    padding: s(20),
    marginBottom: vs(15),
    alignItems: "center",
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: s(4),
    elevation: 3,
  },
  stepNumber: {
    width: s(40),
    height: s(40),
    backgroundColor: Colors.primary,
    borderRadius: s(20),
    color: Colors.white,
    fontFamily: Fonts.primary,
    fontSize: s(18),
    fontWeight: Fonts.weights.bold,
    textAlign: "center",
    lineHeight: s(40),
    marginRight: s(15),
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontFamily: Fonts.primary,
    fontSize: s(16),
    fontWeight: Fonts.weights.semiBold,
    color: Colors.black,
    marginBottom: vs(5),
  },
  stepDescription: {
    fontFamily: Fonts.primary,
    fontSize: s(13),
    fontWeight: Fonts.weights.normal,
    color: Colors.textSecondary,
    lineHeight: vs(18),
  },

});