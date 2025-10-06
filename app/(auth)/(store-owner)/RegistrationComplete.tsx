import { useEffect, useState, useRef } from "react";
import { router, useLocalSearchParams } from "expo-router";
import { StyleSheet, View, StatusBar, Alert, RefreshControl, ScrollView, TouchableOpacity, Text } from "react-native";
import { Image } from "expo-image";
import { Button } from "../../../src/components/ui/Button";
import { Typography } from "../../../src/components/ui/Typography";
import { Colors } from "../../../src/constants/Colors";
import { Fonts } from "../../../src/constants/Fonts";
import { s, vs } from "../../../src/constants/responsive";
import { useStoreRegistration } from '../../../src/hooks/useStoreRegistration';
import { STORE_STATUS, STATUS_LABELS, STATUS_COLORS } from '../../../src/constants/StoreStatus';
import { useUser } from '../../../src/contexts/UserContext';

export default function RegistrationCompleteScreen() {
  // Get user context for role checking
  const { user } = useUser();

  // Get store info from previous screen
  const { storeName, ownerName, ownerEmail } = useLocalSearchParams<{
    storeName?: string;
    ownerName?: string;
    ownerEmail?: string;
  }>();

  // Real-time status monitoring
  const {
    registrationData,
    status,
    loading,
    error,
    isComplete,
    needsReview,
    refreshStatus
  } = useStoreRegistration();

  // Track previous status for real-time approval detection
  const previousStatusRef = useRef<string | null>(null);

  // Real-time approval alert - only when status changes while user is viewing
  useEffect(() => {
    // Skip if loading or no status yet
    if (loading || !status) return;

    // Check if status changed from pending to approved/active
    if (previousStatusRef.current === STORE_STATUS.PENDING &&
        (status === STORE_STATUS.APPROVED || status === STORE_STATUS.ACTIVE)) {
      console.log('🎉 Status changed from pending to approved/active - showing celebration alert');

      // Show celebration alert
      Alert.alert(
        "🎉 Congratulations!",
        `Your store has been approved! You can now access your dashboard and start managing your business.`,
        [
          {
            text: "View Dashboard",
            onPress: () => {
              console.log('✅ User chose to view dashboard after approval');
              router.replace("/(main)/(store-owner)/home");
            }
          },
          {
            text: "Stay Here",
            style: "cancel",
            onPress: () => {
              console.log('ℹ️ User chose to stay on RegistrationComplete after approval');
            }
          }
        ]
      );
    }

    // Update previous status for next comparison
    previousStatusRef.current = status;
  }, [status, loading]);

  // Navigation guard: Role-based and data-based protection
  useEffect(() => {
    // Wait for initial load to complete
    if (loading) return;

    // SECURITY CHECK 1: Verify user is a store owner
    if (user && user.role !== 'store-owner') {
      console.log('⚠️ Customer trying to access store owner screen - redirecting');
      Alert.alert(
        "Access Denied",
        "This screen is only accessible to store owners.",
        [
          {
            text: "OK",
            onPress: () => router.replace("/(main)/(customer)/home" as any)
          }
        ]
      );
      return;
    }

    // SECURITY CHECK 2: Verify registration data exists
    if (!registrationData && !loading) {
      console.log('⚠️ No registration data found - redirecting to role selection');
      Alert.alert(
        "No Registration Found",
        "Please complete the store registration process first.",
        [
          {
            text: "OK",
            onPress: () => router.replace("/role-selection" as any)
          }
        ]
      );
    }
  }, [loading, registrationData, user]);

  const handleSignOut = () => {
    Alert.alert(
      "Sign Out",
      "Are you sure you want to sign out? You can always sign back in to check your application status.",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Sign Out",
          style: "destructive",
          onPress: () => {
            console.log('👋 User signing out from RegistrationComplete');
            router.replace("/(auth)/signin");
          }
        }
      ]
    );
  };

  const handleCheckStatus = () => {
    const currentStatus = status || 'Unknown';
    const statusLabel = STATUS_LABELS[currentStatus as keyof typeof STATUS_LABELS] || currentStatus;
    const actualStoreName = registrationData?.businessInfo?.storeName || storeName || 'Your Store';
    const actualOwnerName = registrationData?.personalInfo?.name || ownerName || 'Store Owner';

    let statusMessage = '';
    switch (currentStatus) {
      case STORE_STATUS.PENDING:
        statusMessage = 'Your application is being reviewed by our admin team. You\'ll receive a notification once approved.';
        break;
      case STORE_STATUS.APPROVED:
        statusMessage = 'Congratulations! Your store has been approved and will be activated soon.';
        break;
      case STORE_STATUS.ACTIVE:
        statusMessage = 'Your store is now live and customers can place orders!';
        break;
      case STORE_STATUS.REJECTED:
        statusMessage = 'Your application needs some updates. Please check your email for details.';
        break;
      default:
        statusMessage = 'Your application is being processed. You\'ll receive updates via email.';
    }

    Alert.alert(
      "Application Status",
      `Store: ${actualStoreName}\nOwner: ${actualOwnerName}\nStatus: ${statusLabel}\n\n${statusMessage}`,
      [{ text: "OK" }]
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#652A70" />

      {/* Header Section */}
      <View style={styles.headerSection}>
        <Typography variant="h1" style={styles.getStartedText}>
          Get Started
        </Typography>
        <Typography variant="caption" style={styles.subtitleText}>
          Registration Complete
        </Typography>

        {/* Step Complete Icon */}
        <Image
          source={require("../../../src/assets/images/store-registration/step-4-icon.png")}
          style={styles.stepIcon}
          contentFit="contain"
        />
      </View>

      {/* Main Content Area */}
      <ScrollView
        style={styles.mainContent}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={refreshStatus}
            tintColor={Colors.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Registration Complete Card */}
        <View style={styles.completionCard}>
          {/* Figma: "Registration Complete" text at x:114, y:59 */}
          <Typography variant="h2" style={styles.registerCompleteTitle}>
            Registration Complete!
          </Typography>

          {/* Figma: Illustration image at x:70, y:81, 260x260 */}
          <Image
            source={require("../../../src/assets/images/store-registration/registration-complete-illustration.png")}
            style={styles.illustrationImage}
            contentFit="contain"
          />

          {/* Store information */}
          <View style={styles.storeInfoSection}>
            <Typography variant="body" style={styles.storeNameText}>
              {registrationData?.businessInfo?.storeName || storeName || 'Your Store'}
            </Typography>
            <Typography variant="caption" style={styles.ownerNameText}>
              Owner: {registrationData?.personalInfo?.name || ownerName || 'Store Owner'}
            </Typography>
          </View>

          {/* Dynamic Status Display */}
          <View style={styles.statusContainer}>
            <View style={[styles.statusBadge, { backgroundColor: (status && Object.keys(STATUS_COLORS).includes(status) ? STATUS_COLORS[status as keyof typeof STATUS_COLORS] : '#007AFF') }]}>
              <Typography variant="caption" style={styles.statusBadgeText}>
                {STATUS_LABELS[status as keyof typeof STATUS_LABELS] || 'Processing'}
              </Typography>
            </View>

            <Typography variant="body" style={styles.statusText}>
              {status === STORE_STATUS.PENDING && 'Your application is being reviewed by our admin team. You\'ll receive a notification once approved.'}
              {status === STORE_STATUS.APPROVED && 'Congratulations! Your store has been approved and will be activated soon.'}
              {status === STORE_STATUS.ACTIVE && 'Your store is now live and customers can place orders!'}
              {status === STORE_STATUS.REJECTED && 'Your application needs some updates. Please check your email for details.'}
              {(!status || !Object.values(STORE_STATUS).includes(status as any)) && 'Your application is being processed. You\'ll receive updates via email.'}
            </Typography>
          </View>
        </View>

        {/* Action Buttons - Dynamic based on status */}
        <View style={styles.buttonSection}>
          {/* Dynamic Primary Button */}
          {status === STORE_STATUS.PENDING ? (
            <Button
              title="🔄 Refresh Status"
              variant="primary"
              onPress={() => {
                console.log('🔄 Manual refresh requested');
                refreshStatus();
              }}
              style={styles.primaryButton}
            />
          ) : status === STORE_STATUS.APPROVED || status === STORE_STATUS.ACTIVE ? (
            <Button
              title="🚀 Enter Dashboard"
              variant="primary"
              onPress={() => {
                console.log('✅ Navigating to dashboard - store is approved/active');
                router.replace("/(main)/(store-owner)/home");
              }}
              style={styles.primaryButton}
            />
          ) : status === STORE_STATUS.REJECTED ? (
            <Button
              title="📝 Review Feedback"
              variant="primary"
              onPress={() => {
                console.log('📝 Showing rejection feedback');
                handleCheckStatus();
              }}
              style={styles.primaryButton}
            />
          ) : (
            <Button
              title="Check Status"
              variant="primary"
              onPress={handleCheckStatus}
              style={styles.primaryButton}
            />
          )}

          {/* Sign Out Link */}
          <TouchableOpacity
            onPress={handleSignOut}
            style={styles.signOutLink}
            activeOpacity={0.7}
          >
            <Text style={styles.signOutLinkText}>Sign Out</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#652A70", // Purple background matching other screens
  },

  // Header Section (Purple background area)
  headerSection: {
    // Maintain consistency with DocumentUpload screen
    paddingTop: vs(84 - 54 + 35), // Account for status bar + more padding
    paddingHorizontal: s(22),
    paddingBottom: vs(30), // Reduced bottom padding
  },
  getStartedText: {
    fontFamily: Fonts.primary,
    fontSize: s(24),
    fontWeight: Fonts.weights.semiBold,
    color: Colors.white,
    marginBottom: vs(22),
  },
  subtitleText: {
    fontFamily: Fonts.primary,
    fontSize: s(14),
    fontWeight: Fonts.weights.normal,
    color: "rgba(255, 255, 255, 0.5)",
    marginBottom: vs(39),
  },
  stepIcon: {
    // Figma: x:329, y:45, width:100, height:100
    position: "absolute",
    right: s(11), // 440 - 329 - 100 = 11
    top: vs(45 - 54 + 60), // Account for status bar + much more padding for logo
    width: s(100),
    height: vs(100),
  },

  // Main Content Area
  mainContent: {
    flex: 1,
    backgroundColor: Colors.backgroundGray,
    borderTopLeftRadius: s(20),
    borderTopRightRadius: s(20),
  },

  scrollContent: {
    paddingTop: vs(50),
    paddingHorizontal: s(20),
    alignItems: "center",
    paddingBottom: vs(50),
  },

  // Registration Complete Card
  completionCard: {
    // Figma frame: 400x480 with shadow (removed fixed height to prevent overflow)
    width: s(400),
    minHeight: vs(480), // Changed to minHeight to allow growth
    backgroundColor: Colors.white,
    borderRadius: s(20),
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: s(5),
    elevation: 5,
    marginBottom: vs(40),
    position: "relative", // For absolute positioning of children
    paddingHorizontal: s(20),
    paddingVertical: vs(20),
  },

  // Register Complete Title
  registerCompleteTitle: {
    fontFamily: Fonts.primary,
    fontSize: s(22),
    fontWeight: Fonts.weights.semiBold,
    color: Colors.darkGray,
    textAlign: "center",
    marginBottom: vs(20),
    marginTop: vs(10),
  },

  // Illustration Image
  illustrationImage: {
    alignSelf: "center",
    width: s(180),
    height: vs(180),
    marginBottom: vs(15),
  },

  // Store Information Section
  storeInfoSection: {
    alignItems: "center",
    marginBottom: vs(15),
    paddingVertical: vs(12),
    paddingHorizontal: s(20),
    backgroundColor: "rgba(59, 183, 126, 0.1)",
    borderRadius: s(12),
    borderWidth: 1,
    borderColor: "rgba(59, 183, 126, 0.3)",
  },

  storeNameText: {
    fontFamily: Fonts.primary,
    fontSize: s(18),
    fontWeight: Fonts.weights.semiBold,
    color: "#02545F",
    textAlign: "center",
    marginBottom: vs(5),
  },

  ownerNameText: {
    fontFamily: Fonts.primary,
    fontSize: s(14),
    fontWeight: Fonts.weights.normal,
    color: "rgba(30, 30, 30, 0.7)",
    textAlign: "center",
  },

  // Status Container
  statusContainer: {
    alignItems: 'center',
    marginBottom: vs(15),
    width: '100%',
  },

  statusBadge: {
    paddingHorizontal: s(16),
    paddingVertical: vs(8),
    borderRadius: s(20),
    marginBottom: vs(12),
  },

  statusBadgeText: {
    fontFamily: Fonts.primary,
    fontSize: s(13),
    fontWeight: Fonts.weights.semiBold,
    color: Colors.white,
    textAlign: 'center',
  },

  // Status Text
  statusText: {
    fontFamily: Fonts.primary,
    fontSize: s(13),
    fontWeight: Fonts.weights.normal,
    color: "rgba(30, 30, 30, 0.7)",
    textAlign: "center",
    lineHeight: s(13) * 1.5,
    paddingHorizontal: s(15),
    flexWrap: 'wrap',
  },

  // Button Section
  buttonSection: {
    width: "100%",
    paddingHorizontal: s(20),
    alignItems: "center",
    gap: vs(15),
  },

  // Primary Button - Full Width, Dynamic
  primaryButton: {
    width: "100%",
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: vs(4) },
    shadowOpacity: 0.3,
    shadowRadius: s(8),
    elevation: 8,
  },

  // Sign Out Link - Below Button
  signOutLink: {
    paddingVertical: vs(12),
    paddingHorizontal: s(20),
  },

  signOutLinkText: {
    fontFamily: Fonts.primary,
    fontSize: s(14),
    fontWeight: Fonts.weights.medium,
    color: "rgba(30, 30, 30, 0.6)",
    textAlign: "center",
    textDecorationLine: "underline",
  },
});