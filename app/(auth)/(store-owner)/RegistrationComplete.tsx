import { router, useLocalSearchParams } from "expo-router";
import { StyleSheet, View, StatusBar, Alert } from "react-native";
import { Image } from "expo-image";
import { Button } from "../../../src/components/ui/Button";
import { Typography } from "../../../src/components/ui/Typography";
import { Colors } from "../../../src/constants/Colors";
import { Fonts } from "../../../src/constants/Fonts";
import { s, vs } from "../../../src/constants/responsive";

export default function RegistrationCompleteScreen() {
  // Get store info from previous screen
  const { storeName, ownerName, ownerEmail } = useLocalSearchParams<{
    storeName?: string;
    ownerName?: string;
    ownerEmail?: string;
  }>();

  const handleContinueToDashboard = () => {
    Alert.alert(
      "Dashboard Coming Soon",
      "The store owner dashboard is currently under development. You'll be notified once your store is approved and the dashboard is ready.",
      [
        {
          text: "Sign Out",
          onPress: () => {
            router.replace("/(auth)/signin");
          }
        },
        {
          text: "Stay Here",
          style: "cancel"
        }
      ]
    );
  };

  const handleCheckStatus = () => {
    Alert.alert(
      "Application Status",
      `Store: ${storeName || 'Your Store'}\nOwner: ${ownerName || 'Store Owner'}\nStatus: Pending Admin Approval\n\nYour application is being reviewed. You'll receive an email notification once approved.`,
      [{ text: "OK" }]
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#652A70" />

      {/* Header Section */}
      <View style={styles.headerSection}>
        <Typography variant="h1" style={styles.getStartedText}>
          Get Started
        </Typography>
        <Typography variant="caption" style={styles.subtitleText}>
          Register to create an account
        </Typography>

        {/* Step Complete Icon */}
        <Image
          source={require("../../../src/assets/images/store-registration/step-4-icon.png")}
          style={styles.stepIcon}
          contentFit="contain"
        />
      </View>

      {/* Main Content Area */}
      <View style={styles.mainContent}>
        {/* Registration Complete Card */}
        <View style={styles.completionCard}>
          {/* Figma: "Registration Complete" text at x:114, y:59 */}
          <Typography variant="h2" style={styles.registerCompleteTitle}>
            Registration Complete!
          </Typography>

          {/* Figma: Illustration image at x:70, y:81, 260x260 */}
          <Image
            source={require("../../../src/assets/images/store-registration/registration-complete-illustration.png")}
            style={styles.illustrationImage}
            contentFit="contain"
          />

          {/* Store information */}
          <View style={styles.storeInfoSection}>
            <Typography variant="body" style={styles.storeNameText}>
              {storeName || 'Your Store'}
            </Typography>
            <Typography variant="caption" style={styles.ownerNameText}>
              Owner: {ownerName || 'Store Owner'}
            </Typography>
          </View>

          {/* Status message */}
          <Typography variant="body" style={styles.statusText}>
            Your application is now pending admin approval. You'll receive an email notification once verified.
          </Typography>
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonSection}>
          <Button
            title="Check Application Status"
            variant="secondary"
            onPress={handleCheckStatus}
            style={styles.statusButton}
          />
          <Button
            title="Continue to Dashboard"
            variant="primary"
            onPress={handleContinueToDashboard}
            style={styles.dashboardButton}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#652A70", // Purple background matching other screens
  },

  // Header Section (Purple background area)
  headerSection: {
    // Maintain consistency with DocumentUpload screen
    paddingTop: vs(84 - 54), // Account for status bar
    paddingHorizontal: s(22),
    paddingBottom: vs(45),
  },
  getStartedText: {
    fontFamily: Fonts.primary,
    fontSize: s(24),
    fontWeight: Fonts.weights.semiBold,
    color: Colors.white,
    marginBottom: vs(22),
  },
  subtitleText: {
    fontFamily: Fonts.primary,
    fontSize: s(14),
    fontWeight: Fonts.weights.normal,
    color: "rgba(255, 255, 255, 0.5)",
    marginBottom: vs(39),
  },
  stepIcon: {
    // Figma: x:329, y:45, width:100, height:100
    position: "absolute",
    right: s(11), // 440 - 329 - 100 = 11
    top: vs(45 - 54), // Account for status bar
    width: s(100),
    height: vs(100),
  },

  // Main Content Area
  mainContent: {
    flex: 1,
    backgroundColor: Colors.backgroundGray,
    borderTopLeftRadius: s(20),
    borderTopRightRadius: s(20),
    paddingTop: vs(50),
    paddingHorizontal: s(20),
    alignItems: "center",
  },

  // Registration Complete Card
  completionCard: {
    // Figma frame: 400x480 with shadow (increased height for more content)
    width: s(400),
    height: vs(480),
    backgroundColor: Colors.white,
    borderRadius: s(20),
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: s(5),
    elevation: 5,
    marginBottom: vs(40),
    position: "relative", // For absolute positioning of children
    paddingHorizontal: s(20),
    paddingVertical: vs(20),
  },

  // Register Complete Title
  registerCompleteTitle: {
    fontFamily: Fonts.primary,
    fontSize: s(22),
    fontWeight: Fonts.weights.semiBold,
    color: Colors.darkGray,
    textAlign: "center",
    marginBottom: vs(20),
    marginTop: vs(10),
  },

  // Illustration Image
  illustrationImage: {
    alignSelf: "center",
    width: s(200),
    height: vs(200),
    marginBottom: vs(20),
  },

  // Store Information Section
  storeInfoSection: {
    alignItems: "center",
    marginBottom: vs(20),
    paddingVertical: vs(15),
    paddingHorizontal: s(20),
    backgroundColor: "rgba(59, 183, 126, 0.1)",
    borderRadius: s(12),
    borderWidth: 1,
    borderColor: "rgba(59, 183, 126, 0.3)",
  },

  storeNameText: {
    fontFamily: Fonts.primary,
    fontSize: s(18),
    fontWeight: Fonts.weights.semiBold,
    color: "#02545F",
    textAlign: "center",
    marginBottom: vs(5),
  },

  ownerNameText: {
    fontFamily: Fonts.primary,
    fontSize: s(14),
    fontWeight: Fonts.weights.normal,
    color: "rgba(30, 30, 30, 0.7)",
    textAlign: "center",
  },

  // Status Text
  statusText: {
    fontFamily: Fonts.primary,
    fontSize: s(14),
    fontWeight: Fonts.weights.normal,
    color: "rgba(30, 30, 30, 0.7)",
    textAlign: "center",
    lineHeight: s(14) * 1.4,
    paddingHorizontal: s(10),
  },

  // Button Section
  buttonSection: {
    width: "100%",
    paddingHorizontal: s(20),
    gap: vs(15),
  },

  // Individual Button Styles
  statusButton: {
    backgroundColor: "transparent",
    borderWidth: 2,
    borderColor: "#3BB77E",
  },

  dashboardButton: {
    // Uses default primary button styling
  },
});