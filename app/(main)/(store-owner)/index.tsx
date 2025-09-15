import { View, Text, StyleSheet } from "react-native";
import { Colors } from "../../../src/constants/Colors";
import { s, vs } from "../../../src/constants/responsive";
import { Fonts } from "../../../src/constants/Fonts";

export default function StoreOwnerDashboard() {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.welcomeText}>Welcome to TindaGo!</Text>
        <Text style={styles.subtitle}>Store Owner Dashboard</Text>
        <Text style={styles.description}>
          Your store registration has been completed successfully.
          This is where your store management dashboard will be.
        </Text>
        <Text style={styles.comingSoon}>Coming Soon:</Text>
        <Text style={styles.featureList}>
          • Inventory Management{'\n'}
          • Order Management{'\n'}
          • Sales Analytics{'\n'}
          • Customer Reviews{'\n'}
          • Store Settings
        </Text>
      </View>
    </View>
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
    paddingHorizontal: s(40),
  },
  welcomeText: {
    fontFamily: Fonts.primary,
    fontSize: s(32),
    fontWeight: Fonts.weights.bold,
    color: Colors.primary,
    textAlign: "center",
    marginBottom: vs(10),
  },
  subtitle: {
    fontFamily: Fonts.primary,
    fontSize: s(24),
    fontWeight: Fonts.weights.semiBold,
    color: Colors.black,
    textAlign: "center",
    marginBottom: vs(20),
  },
  description: {
    fontFamily: Fonts.primary,
    fontSize: s(16),
    fontWeight: Fonts.weights.regular,
    color: Colors.textSecondary,
    textAlign: "center",
    lineHeight: vs(24),
    marginBottom: vs(30),
  },
  comingSoon: {
    fontFamily: Fonts.primary,
    fontSize: s(18),
    fontWeight: Fonts.weights.semiBold,
    color: Colors.black,
    marginBottom: vs(15),
  },
  featureList: {
    fontFamily: Fonts.primary,
    fontSize: s(16),
    fontWeight: Fonts.weights.regular,
    color: Colors.textSecondary,
    lineHeight: vs(24),
    textAlign: "left",
  },
});