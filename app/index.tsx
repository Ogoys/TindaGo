import { useEffect, useState } from "react";
import { Redirect } from "expo-router";
import { View, ActivityIndicator } from "react-native";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { StoreRegistrationService } from "@/services/store";
import { STORE_STATUS } from "@/lib/constants";
import { Colors } from "../src/constants/Colors";

export default function Index() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [registrationStatus, setRegistrationStatus] = useState<string | null>(null);
  const [redirectPath, setRedirectPath] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      console.log('🔄 Auth state changed:', currentUser?.email || 'Not logged in');

      try {
        if (!currentUser) {
          // User not authenticated - go to onboarding
          console.log('👤 No user authenticated - redirecting to onboarding');
          setRedirectPath("/(auth)/onboarding");
        } else {
          // User is authenticated - check registration status
          console.log('✅ User authenticated:', currentUser.email);
          setUser(currentUser);

          try {
            const registrationData = await StoreRegistrationService.getRegistrationData(currentUser.uid);
            const status = registrationData?.status;

            console.log('📊 Registration status:', status);
            setRegistrationStatus(status || null);

            if (!status || !registrationData) {
              // No registration data - go to role selection
              console.log('📝 No registration found - redirecting to role selection');
              setRedirectPath("/(auth)/role-selection");
            } else {
              // Has registration - check status and route accordingly
              if (status === STORE_STATUS.APPROVED || status === STORE_STATUS.ACTIVE) {
                // Store is approved/active - go directly to dashboard
                console.log('✅ Store is approved/active - redirecting to dashboard');
                setRedirectPath("/(main)/(store-owner)/home");
              } else if (status === STORE_STATUS.PENDING ||
                         status === STORE_STATUS.REJECTED ||
                         status === STORE_STATUS.DOCUMENTS_VERIFIED ||
                         status === STORE_STATUS.DOCUMENTS_REJECTED) {
                // Other statuses - show RegistrationComplete
                console.log('📋 Store status:', status, '- redirecting to RegistrationComplete');
                setRedirectPath("/(auth)/(store-owner)/RegistrationComplete");
              } else {
                // Unknown status - go to role selection
                console.log('❓ Unknown status - redirecting to role selection');
                setRedirectPath("/(auth)/role-selection");
              }
            }
          } catch (error) {
            console.error('❌ Error checking registration status:', error);
            // On error, go to role selection as fallback
            setRedirectPath("/(auth)/role-selection");
          }
        }
      } catch (error) {
        console.error('❌ Error in auth state handler:', error);
        setRedirectPath("/(auth)/onboarding");
      } finally {
        setLoading(false);
      }
    });

    // Cleanup subscription
    return () => unsubscribe();
  }, []);

  // Show loading screen while checking authentication and status
  if (loading || !redirectPath) {
    return (
      <View style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: Colors.backgroundGray
      }}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  // Redirect to appropriate screen
  console.log('🎯 Redirecting to:', redirectPath);
  return <Redirect href={redirectPath as any} />;
}
