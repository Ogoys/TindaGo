import { View, StyleSheet } from "react-native";
import { Typography } from "../ui/Typography";
import { responsive, s, vs } from "../../constants/responsive";

export function OnboardingContent() {
  return (
    <View style={styles.container}>
      <Typography variant="h1" color="black" style={styles.title}>
        Start Shopping on TindaGo
      </Typography>
      
      <Typography variant="body" color="textSecondary" style={styles.description}>
        Order and buy nearby essentials with ease! Lorem ipsum dolor sit amet, consectetur adipiscing _sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
      </Typography>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    // Figma Label container: x:20, y:594, width:394, height:115
    paddingHorizontal: s(20),
    marginTop: vs(594 - 553), // 594 is label Y position, 553 is end of pictures
    marginBottom: vs(67), // Space before buttons (776 - 709)
  },
  title: {
    // Figma title: x:20, y:594, width:333, height:22
    marginBottom: vs(7), // 621 - 594 - 22 = 5 (approximated to 7)
  },
  description: {
    // Figma description: x:20, y:621, width:394, height:88
    lineHeight: vs(22), // 1.22 line height for 18px font = ~22
  },
});