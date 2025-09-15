import { Stack } from "expo-router";

export default function StoreOwnerLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        gestureEnabled: true,
        animation: "slide_from_right",
      }}
    >
      <Stack.Screen
        name="register"
        options={{
          title: "Store Owner Registration",
        }}
      />
    </Stack>
  );
}