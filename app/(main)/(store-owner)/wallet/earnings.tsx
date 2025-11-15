import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ref, onValue, get } from 'firebase/database';
import { database } from '../../../../FirebaseConfig';
import { useUser } from '../../../../src/contexts/UserContext';
import { Colors } from '../../../../src/constants/Colors';
import { Fonts } from '../../../../src/constants/Fonts';
import { s, vs } from '../../../../src/constants/responsive';

export default function EarningsScreen() {
  const router = useRouter();
  const { user } = useUser();
  const [loading, setLoading] = useState(true);
  const [totalEarned, setTotalEarned] = useState(0);
  const [thisMonth, setThisMonth] = useState(0);
  const [available, setAvailable] = useState(0);
  const [pending, setPending] = useState(0);
  const [transactions, setTransactions] = useState<any[]>([]);

  // Fetch earnings from Firebase
  useEffect(() => {
    const sid = user?.storeId || user?.id;
    if (!sid) {
      setLoading(false);
      return;
    }

    // Subscribe to ledger transactions
    const ledgerRef = ref(database, `ledgers/stores/${sid}/transactions`);
    const unsubscribeLedger = onValue(ledgerRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const txns = Object.values(data) as any[];

        // Calculate totals
        let total = 0;
        let month = 0;
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        txns.forEach((txn: any) => {
          if (txn.status === 'PAID' || txn.status === 'SETTLED') {
            total += txn.storeAmount || 0;

            // Check if transaction is from this month
            const txnDate = new Date(txn.paidAt || txn.createdAt);
            if (txnDate.getMonth() === currentMonth && txnDate.getFullYear() === currentYear) {
              month += txn.storeAmount || 0;
            }
          }
        });

        setTotalEarned(total);
        setThisMonth(month);
        setTransactions(txns.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
      }
      setLoading(false);
    });

    // Subscribe to wallet (if exists)
    const walletRef = ref(database, `wallets/${sid}`);
    const unsubscribeWallet = onValue(walletRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        setAvailable(Number(data.available || 0));
        setPending(Number(data.pending || 0));
      } else {
        // Fallback compute from ledgers + payouts
        computeFallback();
      }
    });

    const payoutsRef = ref(database, 'payouts');
    const unsubscribePayouts = onValue(payoutsRef, () => {
      if (!walletRef) computeFallback();
    });

    async function computeFallback() {
      try {
        const [ledgerSnap, payoutsSnap] = await Promise.all([
          get(ledgerRef),
          get(payoutsRef),
        ]);
        let earned = 0;
        let pendingTxn = 0;
        if ((ledgerSnap as any)?.exists?.()) {
          const txns = Object.values((ledgerSnap as any).val() || {}) as any[];
          txns.forEach((t: any) => {
            const amt = Number(t?.storeAmount || 0);
            const s = String(t?.status || '').toUpperCase();
            if (s === 'PENDING') pendingTxn += amt;
            else if (s === 'PAID' || s === 'SETTLED') earned += amt;
          });
        }
        let totalWithdrawn = 0;
        let pendingWithdrawal = 0;
        if ((payoutsSnap as any)?.exists?.()) {
          const list = Object.values((payoutsSnap as any).val() || {}) as any[];
          list.forEach((p: any) => {
            if (p?.storeId !== sid) return;
            const amt = Number(p?.amount || 0);
            const s = String(p?.status || '').toLowerCase();
            if (s === 'completed') totalWithdrawn += amt;
            else if (s === 'pending' || s === 'approved') pendingWithdrawal += amt;
          });
        }
        const availableCalc = Math.max(earned - totalWithdrawn - pendingWithdrawal, 0);
        setAvailable(availableCalc);
        setPending(pendingTxn);
      } catch {}
    }

    return () => {
      unsubscribeLedger();
      unsubscribeWallet();
      unsubscribePayouts();
    };
  }, [user?.storeId, user?.id]);

  const handleViewTransactions = () => {
    router.push('/(main)/(store-owner)/wallet/transaction');
  };

  const handleRequestPayout = () => {
    router.push('/(main)/(store-owner)/wallet/payout-requests');
  };

  const handleBack = () => {
    router.back();
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Loading earnings...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <Image
source={require('../../../../src/assets/images/payment/chevron-left.png')}
              style={styles.chevronIcon}
            />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Earnings</Text>
          <View style={styles.backButton} />
        </View>

        {/* Total Earned Card */}
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Total Earned</Text>
          <Text style={styles.largeAmount}>₱ {totalEarned.toFixed(2)}</Text>
          <Text style={styles.cardSubLabel}>Lifetime earnings</Text>
        </View>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={[styles.statBox, { backgroundColor: '#E8F5E9' }]}>
            <Text style={styles.statLabel}>This Month</Text>
            <Text style={styles.statAmount}>₱ {thisMonth.toFixed(2)}</Text>
          </View>

          <View style={[styles.statBox, { backgroundColor: '#FFF3E0' }]}>
            <Text style={styles.statLabel}>Available</Text>
            <Text style={styles.statAmount}>₱ {available.toFixed(2)}</Text>
          </View>
        </View>

        {/* Pending Card */}
        {pending > 0 && (
          <View style={[styles.card, { backgroundColor: '#FCE4EC' }]}>
            <Text style={styles.cardLabel}>Pending Balance</Text>
            <Text style={styles.mediumAmount}>₱ {pending.toFixed(2)}</Text>
            <Text style={styles.cardSubLabel}>Will be available soon</Text>
          </View>
        )}

        {/* Recent Transactions */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Transactions</Text>
            <TouchableOpacity onPress={handleViewTransactions}>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>

          {transactions.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No transactions yet</Text>
            </View>
          ) : (
            transactions.slice(0, 3).map((txn: any, index: number) => (
              <View key={index} style={styles.transactionRow}>
                <View>
                  <Text style={styles.txnOrder}>Order {txn.orderNumber}</Text>
                  <Text style={styles.txnDate}>
                    {new Date(txn.paidAt || txn.createdAt).toLocaleDateString()}
                  </Text>
                </View>
                <View style={styles.txnAmount}>
                  <Text style={styles.txnAmountText}>₱ {(txn.storeAmount || 0).toFixed(2)}</Text>
                  <Text style={[
                    styles.txnStatus,
                    txn.status === 'PAID' ? styles.statusPaid : styles.statusPending
                  ]}>
                    {txn.status}
                  </Text>
                </View>
              </View>
            ))
          )}
        </View>

        {/* Action Button */}
        <TouchableOpacity style={styles.payoutButton} onPress={handleRequestPayout}>
          <Text style={styles.payoutButtonText}>Request Payout</Text>
        </TouchableOpacity>

        <View style={styles.bottomPadding} />
      </ScrollView>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F6F6',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: s(20),
    paddingVertical: vs(20),
  },
  backButton: {
    width: s(30),
    height: vs(30),
    borderRadius: s(20),
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chevronIcon: {
    width: s(15),
    height: vs(15),
  },
  headerTitle: {
    fontFamily: Fonts.primary,
    fontSize: s(20),
    fontWeight: '600',
    color: Colors.darkGray,
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
  card: {
    marginHorizontal: s(20),
    marginBottom: vs(15),
    backgroundColor: Colors.white,
    borderRadius: s(20),
    padding: s(20),
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 3,
  },
  cardLabel: {
    fontFamily: Fonts.primary,
    fontSize: s(14),
    color: Colors.textSecondary,
    marginBottom: vs(5),
  },
  largeAmount: {
    fontFamily: Fonts.primary,
    fontSize: s(32),
    fontWeight: '600',
    color: Colors.primary,
    marginBottom: vs(5),
  },
  mediumAmount: {
    fontFamily: Fonts.primary,
    fontSize: s(24),
    fontWeight: '600',
    color: '#FF9800',
  },
  cardSubLabel: {
    fontFamily: Fonts.primary,
    fontSize: s(12),
    color: Colors.textSecondary,
  },
  statsRow: {
    flexDirection: 'row',
    marginHorizontal: s(20),
    marginBottom: vs(15),
    gap: s(10),
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
    fontFamily: Fonts.primary,
    fontSize: s(12),
    color: Colors.darkGray,
    marginBottom: vs(5),
  },
  statAmount: {
    fontFamily: Fonts.primary,
    fontSize: s(18),
    fontWeight: '600',
    color: Colors.primary,
  },
  section: {
    marginHorizontal: s(20),
    marginBottom: vs(20),
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: vs(15),
  },
  sectionTitle: {
    fontFamily: Fonts.primary,
    fontSize: s(16),
    fontWeight: '600',
    color: Colors.darkGray,
  },
  viewAllText: {
    fontFamily: Fonts.primary,
    fontSize: s(14),
    color: Colors.primary,
    fontWeight: '500',
  },
  transactionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: vs(12),
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  txnOrder: {
    fontFamily: Fonts.primary,
    fontSize: s(14),
    fontWeight: '500',
    color: Colors.darkGray,
  },
  txnDate: {
    fontFamily: Fonts.primary,
    fontSize: s(12),
    color: Colors.textSecondary,
    marginTop: vs(3),
  },
  txnAmount: {
    alignItems: 'flex-end',
  },
  txnAmountText: {
    fontFamily: Fonts.primary,
    fontSize: s(14),
    fontWeight: '600',
    color: Colors.primary,
  },
  txnStatus: {
    fontFamily: Fonts.primary,
    fontSize: s(11),
    marginTop: vs(3),
    paddingHorizontal: s(8),
    paddingVertical: vs(2),
    borderRadius: s(5),
  },
  statusPaid: {
    backgroundColor: '#E8F5E9',
    color: '#34C759',
  },
  statusPending: {
    backgroundColor: '#FFF3E0',
    color: '#FF9800',
  },
  emptyState: {
    padding: s(20),
    alignItems: 'center',
  },
  emptyText: {
    fontFamily: Fonts.primary,
    fontSize: s(14),
    color: Colors.textSecondary,
  },
  payoutButton: {
    marginHorizontal: s(20),
    marginBottom: vs(20),
    backgroundColor: Colors.primary,
    borderRadius: s(20),
    paddingVertical: vs(15),
    alignItems: 'center',
  },
  payoutButtonText: {
    fontFamily: Fonts.primary,
    fontSize: s(16),
    fontWeight: '600',
    color: Colors.white,
  },
  bottomPadding: {
    height: vs(100),
  },
});
