import { View, StyleSheet, ImageBackground } from "react-native";
import { BlurView } from "expo-blur";
import { ReactNode } from "react";
import { s, vs } from "../../constants/responsive";

interface GlassMorphismCardProps {
  children: ReactNode;
}

export function GlassMorphismCard({ children }: GlassMorphismCardProps) {
  return (
    <View style={styles.container}>
      {/* Background Image */}
      <ImageBackground
        source={require("../../assets/images/register/background-image-new.png")}
        style={styles.backgroundImage}
        blurRadius={10}
      />
      
      {/* 3D Logo */}
      <ImageBackground
        source={require("../../assets/images/register/logo-3d-new.png")}
        style={styles.glassOverlay}
        resizeMode="contain"
      />
      
      {/* Main Content Card */}
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
  glassOverlay: {
    // Figma register: x:-30, y:-46, width:500, height:500
    position: "absolute",
    left: s(-30),
    top: vs(-46),
    width: s(500),
    height: vs(500),
  },
  glassCard: {
    // Figma: x:20, y:97, width:400, height:740
    position: "absolute",
    left: s(20),
    top: vs(97),
    width: s(400),
    height: vs(740),
    borderRadius: s(20),
    backgroundColor: "rgba(30, 30, 30, 0.1)",
    overflow: "hidden",
  },
});