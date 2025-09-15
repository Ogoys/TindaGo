import { router } from "expo-router";
import { StyleSheet, View, StatusBar } from "react-native";
import { Image } from "expo-image";
import { Button } from "../../../src/components/ui/Button";
import { Typography } from "../../../src/components/ui/Typography";
import { Colors } from "../../../src/constants/Colors";
import { Fonts } from "../../../src/constants/Fonts";
import { s, vs } from "../../../src/constants/responsive";

export default function RegistrationCompleteScreen() {
  const handleContinueToDashboard = () => {
    // Navigate to store owner dashboard
    router.replace("/(main)/(store-owner)/home");
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
          {/* Figma: "Register Complete" text at x:114, y:59 */}
          <Typography variant="h2" style={styles.registerCompleteTitle}>
            Register Complete
          </Typography>

          {/* Figma: Illustration image at x:70, y:81, 260x260 */}
          <Image
            source={require("../../../src/assets/images/store-registration/registration-complete-illustration.png")}
            style={styles.illustrationImage}
            contentFit="contain"
          />

          {/* Figma: Congratulation text at x:101, y:81 (overlapping with image) */}
          <Typography variant="body" style={styles.congratulationText}>
            Congratulation you create a{'\n'}account
          </Typography>
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonSection}>
          <Button
            title="Continue to Dashboard"
            variant="primary"
            onPress={handleContinueToDashboard}
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
    // Figma frame: 400x380 with shadow
    width: s(400),
    height: vs(380),
    backgroundColor: Colors.white,
    borderRadius: s(20),
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: s(5),
    elevation: 5,
    marginBottom: vs(40),
    position: "relative", // For absolute positioning of children
  },

  // Register Complete Title
  registerCompleteTitle: {
    // Figma: x:114, y:59, width:172, height:22
    position: "absolute",
    left: s(114),
    top: vs(59),
    fontFamily: Fonts.primary,
    fontSize: s(20),
    fontWeight: Fonts.weights.semiBold,
    color: Colors.darkGray,
    textAlign: "center",
    lineHeight: s(20) * Fonts.lineHeights.tight,
  },

  // Illustration Image
  illustrationImage: {
    // Figma: x:70, y:81, width:260, height:260
    position: "absolute",
    left: s(70),
    top: vs(81),
    width: s(260),
    height: vs(260),
  },

  // Congratulation Text
  congratulationText: {
    // Figma: x:101, y:81, width:198, height:44 - adjusted for better visibility
    position: "absolute",
    left: s(101),
    top: vs(320), // Positioned below the image for better readability
    width: s(198),
    fontFamily: Fonts.primary,
    fontSize: s(16),
    fontWeight: Fonts.weights.medium,
    color: "rgba(30, 30, 30, 0.5)",
    textAlign: "center",
    lineHeight: s(16) * Fonts.lineHeights.relaxed,
  },

  // Button Section
  buttonSection: {
    width: "100%",
    paddingHorizontal: s(20),
  },
});