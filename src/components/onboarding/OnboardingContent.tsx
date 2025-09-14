import { View, StyleSheet, Text } from "react-native";
import { Typography } from "../ui/Typography";
import { Colors } from "../../constants/Colors";
import { Fonts } from "../../constants/Fonts";
import { responsive, s, vs } from "../../constants/responsive";

export function OnboardingContent() {
  return (
    <View style={styles.container}>
      <View style={styles.titleContainer}>
        <Text style={styles.titleStart}>Start Shopping on </Text>
        <Text style={styles.titleTinda}>Tinda</Text>
        <Text style={styles.titleGo}>Go</Text>
      </View>

      <Typography variant="body" color="textSecondary" style={styles.description}>
        Discover local sari-sari stores and order your daily essentials with ease. From groceries to household items, get everything you need delivered right to your doorstep.
      </Typography>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    // Figma Label container: x:20, y:594, width:394, height:115
    paddingHorizontal: s(20),
    marginTop: vs(594 - 552.86), // Pictures end at y:75+477.86=552.86, Label starts at y:594
    marginBottom: vs(67), // Space before buttons (776 - 594 - 115 = 67)
  },
  titleContainer: {
    // Figma title: x:20, y:594, width:333, height:22
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: vs(27), // 621 - 594 = 27px gap between title and description
  },
  titleStart: {
    fontFamily: Fonts.primary, // User-friendly font instead of stiff Clash Grotesk
    fontSize: s(26), // Smaller, more appropriate size
    fontWeight: Fonts.weights.bold, // Bold for emphasis
    color: Colors.black,
  },
  titleTinda: {
    fontFamily: Fonts.primary, // User-friendly font instead of stiff Clash Grotesk
    fontSize: s(26), // Smaller, more appropriate size
    fontWeight: Fonts.weights.bold, // Bold for emphasis
    color: "#E92B45", // Red color as specified
  },
  titleGo: {
    fontFamily: Fonts.primary, // User-friendly font instead of stiff Clash Grotesk
    fontSize: s(26), // Smaller, more appropriate size
    fontWeight: Fonts.weights.bold, // Bold for emphasis
    color: "#C0E862", // Green color as specified
  },
  description: {
    // Figma description: x:20, y:621, width:394, height:88
    lineHeight: vs(22), // Calculated line height for proper text spacing
  },
});