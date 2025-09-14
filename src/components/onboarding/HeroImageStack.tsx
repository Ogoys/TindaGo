import { View, StyleSheet } from "react-native";
import { Image } from "expo-image";
import { BlurView } from "expo-blur";
import { Colors } from "../../constants/Colors";
import { s, vs } from "../../constants/responsive";

export function HeroImageStack() {
  return (
    <View style={styles.container}>
      {/* Background blur rectangles - Exact Figma positions */}
      <BlurView intensity={10} style={styles.blurRect1} />
      <BlurView intensity={10} style={styles.blurRect2} />

      {/* Main hero images - Exact Figma positions */}
      <View style={styles.heroImage1}>
        <Image
          source={require("../../assets/images/onboarding/hero-image-3.png")}
          style={styles.image}
          contentFit="cover"
        />
      </View>

      <View style={styles.heroImage2}>
        <Image
          source={require("../../assets/images/onboarding/hero-image-4.png")}
          style={styles.image}
          contentFit="cover"
        />
      </View>

      {/* Profile image circles - Aligned with arrows from square pictures */}
      <View style={styles.profileCircle1}>
        <Image
          source={require("../../assets/images/onboarding/profile-circle-1.png")}
          style={styles.profileImage}
          contentFit="cover"
        />
      </View>

      <View style={styles.profileCircle2}>
        <Image
          source={require("../../assets/images/onboarding/profile-circle-2.png")}
          style={styles.profileImage}
          contentFit="cover"
        />
      </View>

      {/* Vector arrow graphics - Exact Figma positions */}
      <Image
        source={require("../../assets/images/onboarding/arrow-vector-1.svg")}
        style={styles.vector1}
        contentFit="contain"
      />

      <Image
        source={require("../../assets/images/onboarding/arrow-vector-2.svg")}
        style={styles.vector2}
        contentFit="contain"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    // Figma Pictures group: x:35, y:75, width:369.4, height:477.86
    width: s(369.4),
    height: vs(477.86),
    position: "relative",
    marginTop: vs(75),
    marginHorizontal: s(35),
  },

  // Background blur rectangles (exact Figma positions relative to Pictures group)
  blurRect1: {
    // Figma Rectangle 3: x:108, y:87 -> relative to Pictures group: x:73, y:12
    position: "absolute",
    left: s(73),
    top: vs(12),
    width: s(201.59),
    height: vs(251.27),
    borderRadius: s(15),
    backgroundColor: Colors.lightGreen,
    zIndex: 1, // Behind arrows (zIndex: 2) - arrows will show in front of green squares
  },
  blurRect2: {
    // Figma Rectangle 4: x:92.33, y:264.41 -> relative to Pictures group: x:57.33, y:189.41
    position: "absolute",
    left: s(57.33),
    top: vs(189.41),
    width: s(250.93),
    height: vs(288.46),
    borderRadius: s(15),
    backgroundColor: Colors.lightGreen,
    zIndex: 1, // Behind arrows (zIndex: 2) - arrows will show in front of green squares
  },

  // Hero images with exact Figma positioning and shadows
  heroImage1: {
    // Figma Rectangle 1: x:35, y:75 -> relative to Pictures group: x:0, y:0
    position: "absolute",
    left: 0,
    top: 0,
    width: s(274.72),
    height: vs(304.11),
    borderRadius: s(15),
    shadowColor: Colors.shadow,
    shadowOffset: { width: s(4), height: vs(4) },
    shadowOpacity: 0.25,
    shadowRadius: s(10),
    elevation: 8,
    zIndex: 3, // Above arrows (zIndex: 2) - arrows will be behind colored hero images
    overflow: "hidden",
  },
  heroImage2: {
    // Figma Rectangle 2: x:155, y:227 -> relative to Pictures group: x:120, y:152
    position: "absolute",
    left: s(120),
    top: vs(152),
    width: s(249.4),
    height: vs(287.38),
    borderRadius: s(15),
    shadowColor: Colors.shadow,
    shadowOffset: { width: s(4), height: vs(4) },
    shadowOpacity: 0.25,
    shadowRadius: s(10),
    elevation: 8,
    zIndex: 3, // Above arrows (zIndex: 2) - arrows will be behind colored hero images
    overflow: "hidden",
  },


  // Profile circles - Exact Figma positions
  profileCircle1: {
    // Figma: x:332, y:167 (relative to Pictures group)
    position: "absolute",
    left: s(297), // Figma: 332 - 35 (Pictures group offset) = 297
    top: vs(92), // Figma: 167 - 75 (Pictures group offset) = 92
    width: s(50),
    height: s(50),
    borderRadius: s(25),
    backgroundColor: Colors.primary,
    shadowColor: Colors.shadow,
    shadowOffset: { width: s(4), height: vs(4) },
    shadowOpacity: 0.25,
    shadowRadius: s(4),
    elevation: 10,
    zIndex: 10,
    overflow: "hidden",
  },
  profileCircle2: {
    // Figma: x:52, y:390 (relative to Pictures group)
    position: "absolute",
    left: s(17), // Figma: 52 - 35 (Pictures group offset) = 17
    top: vs(315), // Figma: 390 - 75 (Pictures group offset) = 315
    width: s(50),
    height: s(50),
    borderRadius: s(25),
    backgroundColor: Colors.primary,
    shadowColor: Colors.shadow,
    shadowOffset: { width: s(4), height: vs(4) },
    shadowOpacity: 0.25,
    shadowRadius: s(4),
    elevation: 10,
    zIndex: 10,
    overflow: "hidden",
  },

  // Vector arrows - Behind colored hero images but in front of green blur squares
  vector1: {
    // Figma Vector 1: x:240.5, y:112.5, width:116.5, height:47
    position: "absolute",
    left: s(205.5), // Figma: 240.5 - 35 (Pictures group offset) = 205.5
    top: vs(37.5), // Figma: 112.5 - 75 (Pictures group offset) = 37.5
    width: s(116.5), // Exact Figma width
    height: vs(47), // Exact Figma height
    zIndex: 2, // Behind colored hero images (zIndex: 3) but in front of green squares (zIndex: 1)
  },
  vector2: {
    // Figma Vector 2: x:78.5, y:454, width:102, height:55
    position: "absolute",
    left: s(43.5), // Figma: 78.5 - 35 (Pictures group offset) = 43.5
    top: vs(379), // Figma: 454 - 75 (Pictures group offset) = 379
    width: s(102), // Exact Figma width
    height: vs(55), // Exact Figma height
    zIndex: 2, // Behind colored hero images (zIndex: 3) but in front of green squares (zIndex: 1)
  },

  // Image styles
  image: {
    width: "100%",
    height: "100%",
  },
  profileImage: {
    width: "100%",
    height: "100%",
  },
});