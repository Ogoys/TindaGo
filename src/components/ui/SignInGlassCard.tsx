import { View, StyleSheet, ImageBackground } from "react-native";
import { BlurView } from "expo-blur";
import { ReactNode } from "react";
import { s, vs } from "../../constants/responsive";

interface SignInGlassCardProps {
  children: ReactNode;
}

export function SignInGlassCard({ children }: SignInGlassCardProps) {
  return (
    <View style={styles.container}>
      {/* Background Image - Figma: x:-197, y:0, width:1434, height:956 */}
      <ImageBackground
        source={require("../../assets/images/register/background-image-new.png")}
        style={styles.backgroundImage}
        blurRadius={10}
      />
      
      {/* 3D Logo - Figma signin: x:-30, y:19, width:500, height:500 */}
      <ImageBackground
        source={require("../../assets/images/register/logo-3d-new.png")}
        style={styles.logoOverlay}
        resizeMode="contain"
      />
      
      {/* Glass Card - Figma: x:20, y:162, width:400, height:597 */}
      <BlurView intensity={20} tint="dark" style={styles.glassCard}>
        {children}
      </BlurView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: "relative",
  },
  backgroundImage: {
    // Figma: x:-197, y:0, width:1434, height:956
    position: "absolute",
    left: s(-197),
    top: 0,
    width: s(1434),
    height: vs(956),
  },
  logoOverlay: {
    // Figma: x:-30, y:19, width:500, height:500
    position: "absolute",
    left: s(-30),
    top: vs(19),
    width: s(500),
    height: vs(500),
  },
  glassCard: {
    // Figma: x:20, y:162, width:400, height:597
    position: "absolute",
    left: s(20),
    top: vs(162),
    width: s(400),
    height: vs(597),
    borderRadius: s(30), // Figma border radius
    backgroundColor: "rgba(30, 30, 30, 0.1)",
    overflow: "hidden",
  },
});