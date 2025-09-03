import { Text, TextStyle, StyleSheet } from "react-native";
import { ReactNode } from "react";
import { Colors } from "../../constants/Colors";
import { Fonts } from "../../constants/Fonts";
import { responsive } from "../../constants/responsive";

interface TypographyProps {
  children: ReactNode;
  variant?: "h1" | "h2" | "body" | "caption";
  color?: "black" | "textSecondary";
  style?: TextStyle;
  numberOfLines?: number;
}

export function Typography({
  children,
  variant = "body",
  color = "black",
  style,
  numberOfLines,
}: TypographyProps) {
  const textStyle = [
    styles.base,
    styles[variant],
    { color: Colors[color] },
    style,
  ];

  return (
    <Text style={textStyle} numberOfLines={numberOfLines}>
      {children}
    </Text>
  );
}

const styles = StyleSheet.create({
  base: {
    fontFamily: Fonts.primary,
  },
  h1: {
    fontSize: responsive.fontSize.xl,
    fontWeight: Fonts.weights.medium,
    lineHeight: responsive.fontSize.xl * Fonts.lineHeights.tight,
  },
  h2: {
    fontSize: responsive.fontSize.lg,
    fontWeight: Fonts.weights.medium,
    lineHeight: responsive.fontSize.lg * Fonts.lineHeights.tight,
  },
  body: {
    fontSize: responsive.fontSize.md,
    fontWeight: Fonts.weights.normal,
    lineHeight: responsive.fontSize.md * Fonts.lineHeights.normal,
  },
  caption: {
    fontSize: responsive.fontSize.sm,
    fontWeight: Fonts.weights.normal,
    lineHeight: responsive.fontSize.sm * Fonts.lineHeights.relaxed,
  },
});