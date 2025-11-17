import React, { useState, useEffect } from "react";
import {
  ScrollView,
  StyleSheet,
  View,
  TouchableOpacity,
  ActivityIndicator,
  Text,
  RefreshControl,
} from "react-native";
import { useRouter } from "expo-router";
import { ref, get, onValue } from "firebase/database";
import { database } from "../../../../FirebaseConfig";
import { useUser } from "../../../../src/contexts/UserContext";
import { Typography } from "../../../../src/components/ui/Typography";
import { Colors } from "../../../../src/constants/Colors";
import { s, vs } from "../../../../src/constants/responsive";

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
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const sid = user?.storeId || user?.id;
    if (!sid) {
      setLoading(false);
      return;
    }

    console.log('🔑 Wallet useEffect - Using storeId:', sid);
    console.log('🔑 user object:', { storeId: user?.storeId, id: user?.id, uid: user?.uid });

    const walletRef = ref(database, `wallets/${sid}`);
    const payoutsRef = ref(database, 'payouts');
    const ledgerRef = ref(database, `ledgers/stores/${sid}/transactions`);

    // Realtime wallet listener with fallback
    const unsubWallet = onValue(walletRef, async (snap) => {
      if (snap.exists()) {
        const data = snap.val();
        
        // Always fetch accurate totalWithdrawn from completed payouts
        let actualTotalWithdrawn = 0;
        try {
          const payoutsSnap = await get(payoutsRef);
          console.log('🔍 Fetching payouts for storeId:', sid);
          
          if (payoutsSnap.exists()) {
            const allPayouts = payoutsSnap.val();
            const list = Object.entries(allPayouts) as [string, any][];
            console.log('📦 Total payouts in database:', list.length);
            
            let completedCount = 0;
            let myPayoutsCount = 0;
            
            list.forEach(([payoutId, p]) => {
              console.log('Checking payout:', {
                payoutId,
                storeId: p.storeId,
                amount: p.amount,
                status: p.status,
                matchesStore: p?.storeId === sid,
                ourStoreId: sid
              });
              
              if (p?.storeId === sid) {
                myPayoutsCount++;
                const amt = Number(p?.amount || 0);
                const s = String(p?.status || '').toLowerCase();
                
                console.log(`  ↳ This is MY payout #${myPayoutsCount} - Status: ${s}, Amount: ${amt}`);
                
                if (s === 'approved' || s === 'completed') {
                  actualTotalWithdrawn += amt;
                  completedCount++;
                  console.log('  ✅ APPROVED/COMPLETED! Total so far:', actualTotalWithdrawn);
                }
              }
            });
            
            console.log('💰 FINAL RESULT:');
            console.log('  - My payouts:', myPayoutsCount);
            console.log('  - Approved/Completed:', completedCount);
            console.log('  - Total Withdrawn: ₱' + actualTotalWithdrawn);
          } else {
            console.log('⚠️ No payouts found in database');
          }
        } catch (e) {
          console.error('Error fetching completed payouts:', e);
          // Fallback to wallet node value if fetch fails
          actualTotalWithdrawn = Number(data.totalWithdrawn || 0);
        }
        
        setWalletData({
          available: Number(data.available || 0),
          pending: Number(data.pending || 0),
          totalWithdrawn: actualTotalWithdrawn,
        });
        setLoading(false);
      } else {
        // compute fallback when wallet node missing
        computeFallback();
      }
    });

    // OPTIMIZED: Removed real-time listeners for payouts and ledger (rarely change)
    // They are now only fetched in computeFallback when wallet is missing

    async function computeFallback(fromListener = false) {
      try {
        // fetch latest once for accuracy when wallet missing
        const [ledgerSnap, payoutsSnap] = await Promise.all([
          get(ledgerRef),
          get(payoutsRef),
        ]);
        let earned = 0;
        let pendingTxn = 0;
        if (ledgerSnap.exists()) {
          const txns = Object.values(ledgerSnap.val() || {}) as any[];
          txns.forEach((t: any) => {
            const amt = Number(t?.storeAmount || 0);
            const s = String(t?.status || '').toUpperCase();
            if (s === 'PENDING') pendingTxn += amt;
            else if (s === 'PAID' || s === 'SETTLED') earned += amt;
          });
        }
        let totalWithdrawn = 0;
        let pendingWithdrawal = 0;
        if (payoutsSnap.exists()) {
          const list = Object.values(payoutsSnap.val() || {}) as any[];
          list.forEach((p: any) => {
            if (p?.storeId !== sid) return;
            const amt = Number(p?.amount || 0);
            const s = String(p?.status || '').toLowerCase();
            if (s === 'approved' || s === 'completed') totalWithdrawn += amt;
            else if (s === 'pending') pendingWithdrawal += amt;
          });
        }
        const availableCalc = Math.max(earned - totalWithdrawn - pendingWithdrawal, 0);
        setWalletData({ available: availableCalc, pending: pendingTxn, totalWithdrawn });
      } catch (e) {
        // ignore fallback errors in UI
      } finally {
        if (!fromListener) setLoading(false);
      }
    }

    return () => {
      unsubWallet();
    };
  }, [user?.storeId, user?.id]);

  const onRefresh = async () => {
    setRefreshing(true);
    const sid = user?.storeId || user?.id;
    if (!sid) {
      setRefreshing(false);
      return;
    }

    try {
      const walletRef = ref(database, `wallets/${sid}`);
      const payoutsRef = ref(database, 'payouts');

      const [walletSnap, payoutsSnap] = await Promise.all([
        get(walletRef),
        get(payoutsRef)
      ]);

      let actualTotalWithdrawn = 0;
      if (payoutsSnap.exists()) {
        const list = Object.values(payoutsSnap.val() || {}) as any[];
        list.forEach((p: any) => {
          if (p?.storeId !== sid) return;
          const amt = Number(p?.amount || 0);
          const s = String(p?.status || '').toLowerCase();
          if (s === 'approved' || s === 'completed') {
            actualTotalWithdrawn += amt;
          }
        });
      }

      if (walletSnap.exists()) {
        const data = walletSnap.val();
        setWalletData({
          available: Number(data.available || 0),
          pending: Number(data.pending || 0),
          totalWithdrawn: actualTotalWithdrawn,
        });
      }
    } catch (error) {
      console.error('Error refreshing wallet:', error);
    } finally {
      setRefreshing(false);
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
      {/* Fixed Header with Refresh */}
      <View style={styles.fixedHeader}>
        <View style={styles.headerSpacer} />
        <Typography variant="h1" style={styles.headerTitle}>
          My Wallet
        </Typography>
        <TouchableOpacity style={styles.refreshButton} onPress={onRefresh}>
          <Text style={styles.refreshIcon}>🔄</Text>
        </TouchableOpacity>
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh} 
            tintColor={Colors.primary}
          />
        }
      >
        {/* Subtitle */}
        <View style={styles.subtitleContainer}>
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
            <Typography variant="h2" style={styles.statValue}>
              ₱{walletData.pending.toFixed(2)}
            </Typography>
          </View>
          <View style={styles.statBox}>
            <Typography variant="caption" style={styles.statLabel}>
              Total Withdrawn
            </Typography>
            <Typography variant="h2" style={styles.statValue}>
              ₱{walletData.totalWithdrawn.toFixed(2)}
            </Typography>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={[styles.actionButton, styles.actionButtonPrimary]}
            onPress={() => router.push("/(main)/(store-owner)/wallet/payout-requests")}
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
            onPress={() => router.push("/(main)/(store-owner)/wallet/earnings")}
          >
            <Typography variant="body" style={styles.actionButtonText}>
              📈 View Earnings
            </Typography>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => router.push("/(main)/(store-owner)/wallet/transaction")}
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
  fixedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: s(20),
    paddingTop: vs(60),
    paddingBottom: vs(20),
    backgroundColor: Colors.backgroundGray,
  },
  headerSpacer: {
    width: s(30),
  },
  headerTitle: {
    fontSize: s(28),
    fontWeight: '700',
    color: Colors.darkGray,
  },
  refreshButton: {
    width: s(30),
    height: s(30),
    justifyContent: 'center',
    alignItems: 'center',
  },
  refreshIcon: {
    fontSize: s(20),
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: vs(20),
  },
  subtitleContainer: {
    paddingHorizontal: s(20),
    marginBottom: vs(10),
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
    fontSize: s(32),
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