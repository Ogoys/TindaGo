import { View, StyleSheet } from "react-native";
import { Image } from "expo-image";
import { BlurView } from "expo-blur";
import { Colors } from "../../constants/Colors";
import { responsive, s, vs } from "../../constants/responsive";

export function HeroImageStack() {
  return (
    <View style={styles.container}>
      {/* Background blur rectangles */}
      <BlurView intensity={50} style={styles.blurRect1} />
      <BlurView intensity={50} style={styles.blurRect2} />
      
      {/* Main images */}
      <View style={styles.mainImage1}>
        <Image
          source={require("../../assets/images/onboarding/hero-image-1.png")}
          style={styles.image}
          contentFit="cover"
        />
      </View>
      
      <View style={styles.mainImage2}>
        <Image
          source={require("../../assets/images/onboarding/hero-image-2.png")}
          style={styles.image}
          contentFit="cover"
        />
      </View>
      
      {/* Profile circles */}
      <View style={styles.profileCircle1}>
        <Image
          source={require("../../assets/images/onboarding/profile-image-1.png")}
          style={styles.profileImage}
          contentFit="cover"
        />
      </View>
      
      <View style={styles.profileCircle2}>
        <Image
          source={require("../../assets/images/onboarding/profile-image-2.png")}
          style={styles.profileImage}
          contentFit="cover"
        />
      </View>
      
      {/* Decorative elements */}
      <View style={styles.decorCircle1} />
      <View style={styles.decorCircle2} />
      
      {/* Vector graphics */}
      <Image
        source={require("../../assets/images/onboarding/vector-1.svg")}
        style={styles.vector1}
        contentFit="contain"
      />
      
      <Image
        source={require("../../assets/images/onboarding/vector-2.svg")}
        style={styles.vector2}
        contentFit="contain"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    // Figma container: x:35, y:75, width:369.4, height:477.86
    width: s(369.4),
    height: vs(477.86),
    position: "relative",
    marginTop: vs(75),
    marginHorizontal: s(35),
  },
  
  // Blur background rectangles (exact Figma positions)
  blurRect1: {
    // Figma: left:73, top:12, width:201.59, height:251.27
    position: "absolute",
    left: s(73),
    top: vs(12),
    width: s(201.59),
    height: vs(251.27),
    borderRadius: s(15),
    backgroundColor: Colors.lightGreen,
  },
  blurRect2: {
    // Figma: left:57.33, top:189.41, width:250.93, height:288.46
    position: "absolute",
    left: s(57.33),
    top: vs(189.41),
    width: s(250.93),
    height: vs(288.46),
    borderRadius: s(15),
    backgroundColor: Colors.lightGreen,
  },
  
  // Main images (exact Figma positions)
  mainImage1: {
    // Figma: left:0, top:0, width:274.72, height:304.11
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
    overflow: "hidden",
  },
  mainImage2: {
    // Figma: left:120, top:152, width:249.4, height:287.38
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
    overflow: "hidden",
  },
  
  // Profile circles (exact Figma positions)
  profileCircle1: {
    // Figma: right:0, top:88, width:50, height:50 (313, 88 from left)
    position: "absolute",
    left: s(313),
    top: vs(88),
    width: s(50),
    height: s(50),
    borderRadius: s(25),
    backgroundColor: Colors.lightGreen,
    shadowColor: Colors.shadow,
    shadowOffset: { width: s(4), height: vs(4) },
    shadowOpacity: 0.25,
    shadowRadius: s(4),
    elevation: 5,
    overflow: "hidden",
  },
  profileCircle2: {
    // Figma: left:17, bottom:63, width:50, height:50 (bottom:63 = top:365 aprox)
    position: "absolute",
    left: s(17),
    top: vs(365),
    width: s(50),
    height: s(50),
    borderRadius: s(25),
    backgroundColor: Colors.lightGreen,
    shadowColor: Colors.shadow,
    shadowOffset: { width: s(4), height: vs(4) },
    shadowOpacity: 0.25,
    shadowRadius: s(4),
    elevation: 5,
    overflow: "hidden",
  },
  
  // Decorative circles (exact Figma positions)
  decorCircle1: {
    // Figma: right:10, top:92 (left:297, top:92)
    position: "absolute",
    left: s(297),
    top: vs(92),
    width: s(50),
    height: s(50),
    borderRadius: s(25),
    backgroundColor: Colors.lightGreen,
    shadowColor: Colors.shadow,
    shadowOffset: { width: s(4), height: vs(4) },
    shadowOpacity: 0.25,
    shadowRadius: s(10),
    elevation: 3,
  },
  decorCircle2: {
    // Figma: left:7, bottom:59 (left:7, top:361)
    position: "absolute",
    left: s(7),
    top: vs(361),
    width: s(50),
    height: s(50),
    borderRadius: s(25),
    backgroundColor: Colors.lightGreen,
    shadowColor: Colors.shadow,
    shadowOffset: { width: s(4), height: vs(4) },
    shadowOpacity: 0.25,
    shadowRadius: s(10),
    elevation: 3,
  },
  
  // Vector graphics (exact Figma positions)
  vector1: {
    // Figma: left:205.5, top:37.5, width:116.5, height:47
    position: "absolute",
    left: s(205.5),
    top: vs(37.5),
    width: s(116.5),
    height: vs(47),
  },
  vector2: {
    // Figma: left:43.5, bottom:24 (left:43.5, top:407)
    position: "absolute",
    left: s(43.5),
    top: vs(407),
    width: s(102),
    height: vs(55),
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