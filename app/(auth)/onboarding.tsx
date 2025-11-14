import { View, StyleSheet, ScrollView } from "react-native";
import { HeroImageStack } from "../../src/components/onboarding/HeroImageStack";
import { OnboardingContent } from "../../src/components/onboarding/OnboardingContent";
import { ActionButtons } from "../../src/components/onboarding/ActionButtons";
import { Colors } from "../../src/constants/Colors";

export default function OnboardingScreen() {
  return (
    <View style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        bounces={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.content}>
          <HeroImageStack />
          <OnboardingContent />
          <ActionButtons />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
  },
});
