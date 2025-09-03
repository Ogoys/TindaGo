import { View, StyleSheet } from "react-native";
import { Button } from "../ui/Button";
import { router } from "expo-router";
import { responsive, s, vs } from "../../constants/responsive";

export function ActionButtons() {
  return (
    <View style={styles.container}>
      <Button
        title="Register"
        variant="primary"
        onPress={() => router.push("/(auth)/register")}
      />
      
      <Button
        title="Sign in"
        variant="secondary"
        onPress={() => router.push("/(auth)/signin")}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    // Figma buttons: Register at y:776, Sign in at y:841, both with width:400, height:50
    paddingHorizontal: s(20), // (440 - 400) / 2 = 20px horizontal padding
    gap: vs(15), // 841 - 776 - 50 = 15px gap between buttons
    paddingBottom: vs(65), // 956 - 841 - 50 = 65px bottom padding
  },
});