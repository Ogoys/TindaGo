import { useEffect, useState } from "react";
import { Redirect } from "expo-router";
import { View, ActivityIndicator } from "react-native";
import { onAuthStateChanged } from "firebase/auth";
import { auth, database } from "../FirebaseConfig";
import { ref, get } from "firebase/database";
import { useUser } from "../src/contexts/UserContext";
import { Colors } from "../src/constants/Colors";
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Index() {
  const { setUser: setUserContext } = useUser();
  const [loading, setLoading] = useState(true);
  const [redirectPath, setRedirectPath] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      console.log('🔄 [index.tsx] Auth state changed:', currentUser?.email || 'Not logged in');

      try {
        if (!currentUser) {
          // User not authenticated - clear UserContext and go to onboarding
          console.log('👤 [index.tsx] No user authenticated - redirecting to onboarding');
          await setUserContext(null);
          setRedirectPath("/(auth)/onboarding");
        } else {
          // User is authenticated - fetch user data from database
          console.log('✅ [index.tsx] User authenticated:', currentUser.email);

          try {
            // Fetch user data from database
            const userRef = ref(database, `users/${currentUser.uid}`);
            const userSnapshot = await get(userRef);

            if (userSnapshot.exists()) {
              const userData = userSnapshot.val();
              console.log('📊 [index.tsx] User data fetched:', userData.userType);

              // Sync with UserContext
              await setUserContext({
                id: currentUser.uid,
                name: userData.name || currentUser.displayName || '',
                email: userData.email || currentUser.email || '',
                role: userData.userType === 'store_owner' ? 'store-owner' : 'customer',
                isEmailVerified: currentUser.emailVerified || false,
                isPhoneVerified: userData.phoneVerified || false,
                profileComplete: true,
                storeId: userData.userType === 'store_owner' ? currentUser.uid : undefined,
              });

              // Route based on user type
              if (userData.userType === 'customer') {
                console.log('🛍️ [index.tsx] Customer user - redirecting to home');
                setRedirectPath("/(main)/(customer)/home");
              } else if (userData.userType === 'store_owner') {
                // ✅ Check for pending purchase order navigation (after Xendit payment)
                const pendingNavKey = `pending_purchase_order_navigation_${currentUser.uid}`;
                const pendingPurchaseOrderId = await AsyncStorage.getItem(pendingNavKey);
                
                if (pendingPurchaseOrderId) {
                  console.log('💳 [index.tsx] Pending purchase order navigation found - redirecting to purchase details');
                  console.log('💳 [index.tsx] Purchase Order ID:', pendingPurchaseOrderId);
                  
                  // Clear the pending navigation
                  await AsyncStorage.removeItem(pendingNavKey);
                  
                  // Redirect to purchase details instead of home
                  setRedirectPath(`/(main)/(store-owner)/profile/purchase-details?purchaseOrderId=${pendingPurchaseOrderId}` as any);
                } else {
                  console.log('🏪 [index.tsx] Store owner - redirecting to store home');
                  setRedirectPath("/(main)/(store-owner)/home");
                }
              } else {
                console.log('❓ [index.tsx] Unknown user type - redirecting to onboarding');
                setRedirectPath("/(auth)/onboarding");
              }
            } else {
              console.log('📝 [index.tsx] No user data found - redirecting to onboarding');
              await setUserContext(null);
              setRedirectPath("/(auth)/onboarding");
            }
          } catch (error) {
            console.error('❌ [index.tsx] Error fetching user data:', error);
            await setUserContext(null);
            setRedirectPath("/(auth)/onboarding");
          }
        }
      } catch (error) {
        console.error('❌ [index.tsx] Error in auth state handler:', error);
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
