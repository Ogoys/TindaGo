import { Redirect } from "expo-router";

export default function Index() {
  // Start with the onboarding flow
  // In production, this would check authentication status
  // and redirect to appropriate screen based on user state
  return <Redirect href="/(auth)/onboarding" />;
}
