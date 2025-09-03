import { router } from "expo-router";
import { Image, StyleSheet, TouchableOpacity, View } from "react-native";
import { Typography } from "../../src/components/ui/Typography";
import { Colors } from "../../src/constants/Colors";
import { Fonts } from "../../src/constants/Fonts";
import { s, vs } from "../../src/constants/responsive";

export default function RegisterCompleteScreen() {
  const handleGetStarted = () => {
    // Navigate to store home page after successful registration
    router.replace("/(main)/store-home");
  };

  return (
    <View style={styles.container}>
      {/* Main Completion Card - Figma: x:0, y:0, width:400, height:380, borderRadius:20px */}
      <View style={styles.completionCard}>
        {/* Title - Figma: x:114, y:59, width:172, height:22 */}
        <Typography variant="h2" style={styles.title}>
          Register Complete
        </Typography>
        
        {/* Success Illustration - Figma: x:70, y:81, width:260, height:260 */}
        <View style={styles.illustrationContainer}>
          <Image 
            source={require("../../src/assets/images/register-complete/success-illustration.png")}
            style={styles.illustration}
            resizeMode="contain"
          />
        </View>
        
        {/* Congratulations Text - Figma: x:101, y:81, width:198, height:44 */}
        <Typography variant="body" style={styles.congratulationsText}>
          Congratulation you create a{'\n'}account
        </Typography>
      </View>
      
      {/* Get Started Button */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.getStartedButton} onPress={handleGetStarted}>
          <Typography variant="h2" style={styles.buttonText}>
            Get Started
          </Typography>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.lightGray,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: s(20),
  },
  
  // Main Completion Card - Figma: width:400, height:380, borderRadius:20px, white background with shadow
  completionCard: {
    width: s(400),
    height: vs(380),
    backgroundColor: Colors.white, // Figma: fill_XOGJ3Y
    borderRadius: s(20),
    shadowColor: Colors.shadow, // Figma: effect_63LV3C - rgba(0, 0, 0, 0.25)
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: s(7), // 5px + 2px spread = ~7px radius
    elevation: 5,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  
  // Title - Figma: x:114, y:59, fontSize:20, fontWeight:600, textAlign:center
  title: {
    position: 'absolute',
    top: vs(59),
    fontSize: s(20), // Figma: style_ETMWXK
    fontWeight: '600', // Figma: fontWeight:600
    color: Colors.darkGray, // Figma: fill_MDJ9XI #1E1E1E
    textAlign: 'center',
    fontFamily: Fonts.primary, // Clash Grotesk Variable
    lineHeight: s(20) * Fonts.lineHeights.tight, // 1.1em
  },
  
  // Success Illustration - Figma: x:70, y:81, width:260, height:260
  illustrationContainer: {
    position: 'absolute',
    left: s(70),
    top: vs(81),
    width: s(260),
    height: vs(260),
  },
  illustration: {
    width: s(260),
    height: vs(260),
  },
  
  // Congratulations Text - Figma: x:101, y:81, width:198, height:44
  congratulationsText: {
    position: 'absolute',
    left: s(101),
    top: vs(81),
    width: s(198),
    fontSize: s(16), // Figma: style_ARO1YE
    fontWeight: '500', // Figma: fontWeight:500
    color: 'rgba(30, 30, 30, 0.5)', // Figma: fill_1BS7UW
    textAlign: 'center',
    fontFamily: Fonts.primary, // Clash Grotesk Variable
    lineHeight: s(16) * 1.375, // 1.375em from Figma
  },
  
  // Button Container
  buttonContainer: {
    marginTop: vs(40),
    width: s(400),
  },
  
  // Get Started Button
  getStartedButton: {
    backgroundColor: Colors.primary,
    borderRadius: s(20),
    paddingVertical: vs(15),
    alignItems: 'center',
    justifyContent: 'center',
    height: vs(50),
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: s(4),
    elevation: 3,
  },
  buttonText: {
    fontSize: s(20),
    fontWeight: '500',
    color: Colors.white,
    textAlign: 'center',
  },
});