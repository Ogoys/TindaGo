import { View, StyleSheet, Pressable, Text } from "react-native";
import { Colors } from "../../constants/Colors";
import { Fonts } from "../../constants/Fonts";
import { responsive, s, vs } from "../../constants/responsive";

interface UserTypePickerProps {
  selectedType: "user" | "store_owner";
  onSelect: (type: "user" | "store_owner") => void;
}

export function UserTypePicker({ selectedType, onSelect }: UserTypePickerProps) {
  return (
    <View style={styles.container}>
      <Pressable
        style={[
          styles.option,
          selectedType === "user" && styles.selectedOption,
        ]}
        onPress={() => onSelect("user")}
      >
        <Text
          style={[
            styles.optionText,
            selectedType === "user" && styles.selectedText,
          ]}
        >
          User
        </Text>
      </Pressable>

      <Pressable
        style={[
          styles.option,
          selectedType === "store_owner" && styles.selectedOption,
        ]}
        onPress={() => onSelect("store_owner")}
      >
        <Text
          style={[
            styles.optionText,
            selectedType === "store_owner" && styles.selectedText,
          ]}
        >
          Store owner
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    // Figma: width:380, height:50
    width: s(380),
    height: vs(50),
    flexDirection: "row",
    gap: s(20),
  },
  option: {
    // Figma: width:180, height:50
    width: s(180),
    height: vs(50),
    borderRadius: s(20),
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  selectedOption: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  optionText: {
    fontFamily: Fonts.primary,
    fontSize: responsive.fontSize.sm,
    fontWeight: Fonts.weights.medium,
    color: "rgba(255, 255, 255, 0.5)",
  },
  selectedText: {
    color: Colors.white,
  },
});