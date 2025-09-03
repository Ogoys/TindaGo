import { Pressable, Text, StyleSheet, ViewStyle, TextStyle } from "react-native";
import { Colors } from "../../constants/Colors";
import { Fonts } from "../../constants/Fonts";
import { responsive, s, vs } from "../../constants/responsive";

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: "primary" | "secondary";
  style?: ViewStyle;
  textStyle?: TextStyle;
  disabled?: boolean;
}

export function Button({
  title,
  onPress,
  variant = "primary",
  style,
  textStyle,
  disabled = false,
}: ButtonProps) {
  const buttonStyle = [
    styles.base,
    variant === "primary" ? styles.primary : styles.secondary,
    disabled && styles.disabled,
    style,
  ];

  const textStyleCombined = [
    styles.text,
    variant === "primary" ? styles.primaryText : styles.secondaryText,
    disabled && styles.disabledText,
    textStyle,
  ];

  return (
    <Pressable
      style={({ pressed }) => [
        ...buttonStyle,
        pressed && styles.pressed,
      ]}
      onPress={onPress}
      disabled={disabled}
    >
      <Text style={textStyleCombined}>{title}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    height: responsive.button.height,
    borderRadius: responsive.button.borderRadius,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: responsive.spacing.sm,
    width: "100%", // Full width within container
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: vs(4) },
    shadowOpacity: 0.25,
    shadowRadius: s(20),
    elevation: 5,
  },
  primary: {
    backgroundColor: Colors.primary,
  },
  secondary: {
    backgroundColor: Colors.lightGray,
  },
  disabled: {
    opacity: 0.6,
  },
  pressed: {
    opacity: 0.8,
  },
  text: {
    fontFamily: Fonts.primary,
    fontSize: responsive.fontSize.lg,
    fontWeight: Fonts.weights.medium,
    lineHeight: responsive.fontSize.lg * Fonts.lineHeights.tight,
    textAlign: "center",
  },
  primaryText: {
    color: Colors.white,
  },
  secondaryText: {
    color: Colors.darkGray,
  },
  disabledText: {
    opacity: 0.6,
  },
});