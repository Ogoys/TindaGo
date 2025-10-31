import React, { useState, useEffect } from "react";
import {
  ScrollView,
  StyleSheet,
  View,
  TouchableOpacity,
  ActivityIndicator,
  Text,
} from "react-native";
import { useRouter } from "expo-router";
import { ref, get } from "firebase/database";
import { database } from "../../../FirebaseConfig";
import { useUser } from "../../../src/contexts/UserContext";
import { Typography } from "../../../src/components/ui/Typography";
import { Colors } from "../../../src/constants/Colors";
import { s, vs } from "../../../src/constants/responsive";

interface WalletData {
  available: number;
  pending: number;
  totalWithdrawn: number;
}

export default function WalletScreen() {
  const router = useRouter();
  const { user } = useUser();
  const [walletData, setWalletData] = useState<WalletData>({
    available: 0,
    pending: 0,
    totalWithdrawn: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.storeId) {
      loadWalletData();
    }
  }, [user?.storeId]);

  const loadWalletData = async () => {
    if (!user?.storeId) return;
    try {
      setLoading(true);
      const walletRef = ref(database, `wallets/${user.storeId}`);
      const walletSnap = await get(walletRef);

      if (walletSnap.exists()) {
        const data = walletSnap.val();
        setWalletData({
          available: data.available || 0,
          pending: data.pending || 0,
          totalWithdrawn: data.totalWithdrawn || 0,
        });
      }
    } catch (error) {
      console.error("Error loading wallet data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Loading your wallet...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Typography variant="h1" style={styles.title}>
            My Wallet
          </Typography>
          <Typography variant="body" style={styles.subtitle}>
            Manage your balance and payouts
          </Typography>
        </View>

        {/* Main Balance Card */}
        <View style={styles.balanceCard}>
          <Typography variant="caption" style={styles.balanceLabel}>
            Available Balance
          </Typography>
          <Typography variant="h1" style={styles.balanceValue}>
            ₱{walletData.available.toFixed(2)}
          </Typography>
          <Typography variant="caption" style={styles.balanceHint}>
            Ready to withdraw
          </Typography>
        </View>

        {/* Secondary Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Typography variant="caption" style={styles.statLabel}>
              Pending
            </Typography>
            <Typography variant="h3" style={styles.statValue}>
              ₱{walletData.pending.toFixed(2)}
            </Typography>
          </View>
          <View style={styles.statBox}>
            <Typography variant="caption" style={styles.statLabel}>
              Total Withdrawn
            </Typography>
            <Typography variant="h3" style={styles.statValue}>
              ₱{walletData.totalWithdrawn.toFixed(2)}
            </Typography>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={[styles.actionButton, styles.actionButtonPrimary]}
            onPress={() => router.push("/(main)/(store-owner)/wallet/payout-request")}
          >
            <Typography variant="body" style={styles.actionButtonTextPrimary}>
              💰 Request Payout
            </Typography>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => router.push("/(main)/(store-owner)/wallet/payout-history")}
          >
            <Typography variant="body" style={styles.actionButtonText}>
              📜 Payout History
            </Typography>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => router.push("/(main)/(store-owner)/earnings/transactions")}
          >
            <Typography variant="body" style={styles.actionButtonText}>
              📋 View Transactions
            </Typography>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundGray,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: vs(20),
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: vs(15),
    fontSize: s(16),
    color: Colors.textSecondary,
  },
  header: {
    paddingHorizontal: s(20),
    paddingTop: vs(60),
    paddingBottom: vs(30),
  },
  title: {
    fontSize: s(28),
    fontWeight: '700',
    color: Colors.darkGray,
    marginBottom: vs(8),
  },
  subtitle: {
    fontSize: s(16),
    color: Colors.textSecondary,
  },
  balanceCard: {
    marginHorizontal: s(20),
    marginBottom: vs(24),
    backgroundColor: Colors.primary,
    borderRadius: s(16),
    padding: s(24),
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  balanceLabel: {
    fontSize: s(13),
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: vs(8),
  },
  balanceValue: {
    fontSize: s(40),
    fontWeight: '700',
    color: 'white',
    marginBottom: vs(4),
  },
  balanceHint: {
    fontSize: s(12),
    color: 'rgba(255, 255, 255, 0.7)',
  },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: s(20),
    marginBottom: vs(24),
    gap: s(12),
  },
  statBox: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: s(12),
    padding: s(16),
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  statLabel: {
    fontSize: s(12),
    color: Colors.textSecondary,
    marginBottom: vs(8),
  },
  statValue: {
    fontSize: s(18),
    fontWeight: '700',
    color: Colors.primary,
  },
  actionsContainer: {
    paddingHorizontal: s(20),
  },
  actionButton: {
    backgroundColor: 'white',
    borderRadius: s(12),
    padding: s(16),
    marginBottom: vs(10),
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  actionButtonText: {
    fontSize: s(16),
    fontWeight: '600',
    color: Colors.darkGray,
  },
  actionButtonPrimary: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  actionButtonTextPrimary: {
    fontSize: s(16),
    fontWeight: '600',
    color: 'white',
  },
});
