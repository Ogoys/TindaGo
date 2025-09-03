import { TextInput, StyleSheet, View, Text } from "react-native";
import { useState } from "react";
import { Colors } from "../../constants/Colors";
import { Fonts } from "../../constants/Fonts";
import { responsive, s, vs } from "../../constants/responsive";

interface FormInputProps {
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  secureTextEntry?: boolean;
  keyboardType?: "default" | "email-address" | "phone-pad";
  style?: any;
}

export function FormInput({
  placeholder,
  value,
  onChangeText,
  secureTextEntry = false,
  keyboardType = "default",
  style,
}: FormInputProps) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={[styles.container, style]}>
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor="rgba(255, 255, 255, 0.5)"
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    // Figma: width:380, height:50, borderRadius:20
    width: s(380),
    height: vs(50),
    borderRadius: s(20),
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.5)",
    justifyContent: "center",
    paddingHorizontal: s(15),
  },
  input: {
    fontFamily: Fonts.primary,
    fontSize: responsive.fontSize.sm,
    fontWeight: Fonts.weights.medium,
    color: Colors.white,
    flex: 1,
  },
});