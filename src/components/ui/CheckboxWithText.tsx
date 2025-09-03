import { View, StyleSheet, Pressable, Text } from "react-native";
import { Colors } from "../../constants/Colors";
import { Fonts } from "../../constants/Fonts";
import { responsive, s, vs } from "../../constants/responsive";

interface CheckboxWithTextProps {
  checked: boolean;
  onPress: () => void;
  text: string;
}

export function CheckboxWithText({ checked, onPress, text }: CheckboxWithTextProps) {
  return (
    <Pressable style={styles.container} onPress={onPress}>
      <View style={[styles.checkbox, checked && styles.checkedBox]}>
        {checked && <View style={styles.checkmark} />}
      </View>
      <Text style={styles.text}>{text}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    // Figma: width:361, height:44
    width: s(361),
    height: vs(44),
    flexDirection: "row",
    alignItems: "flex-start",
    gap: s(10),
  },
  checkbox: {
    // Figma: width:15, height:15
    width: s(15),
    height: s(15),
    borderRadius: s(7.5),
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    marginTop: vs(2), // Align with text baseline
  },
  checkedBox: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  checkmark: {
    width: s(8),
    height: s(8),
    borderRadius: s(4),
    backgroundColor: Colors.white,
  },
  text: {
    flex: 1,
    fontFamily: Fonts.primary,
    fontSize: responsive.fontSize.md,
    fontWeight: Fonts.weights.normal,
    color: Colors.white,
    lineHeight: vs(22), // 1.375em for 16px
  },
});