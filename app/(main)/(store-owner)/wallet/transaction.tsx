import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ref, get } from 'firebase/database';
import { database } from '../../../../FirebaseConfig';
import { useUser } from '../../../../src/contexts/UserContext';
import { Colors } from '../../../../src/constants/Colors';
import { Fonts } from '../../../../src/constants/Fonts';
import { s, vs } from '../../../../src/constants/responsive';

export default function TransactionsScreen() {
  const router = useRouter();
  const { user } = useUser();
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [filter, setFilter] = useState('all'); // all, paid, pending

  useEffect(() => {
    const load = async () => {
      const sid = user?.storeId || user?.id;
      if (!sid) {
        setLoading(false);
        return;
      }
      try {
        const ledgerRef = ref(database, `ledgers/stores/${sid}/transactions`);
        const snapshot = await get(ledgerRef);
        if (snapshot.exists()) {
          const data = snapshot.val();
          const txns = Object.values(data) as any[];
          setTransactions(txns.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
        } else {
          setTransactions([]);
        }
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user?.storeId, user?.id]);

  const filteredTransactions = transactions.filter(txn => {
    if (filter === 'paid') return txn.status === 'PAID' || txn.status === 'SETTLED';
    if (filter === 'pending') return txn.status === 'PENDING';
    return true;
  });

  const totalAmount = filteredTransactions.reduce((sum, txn) => sum + (txn.storeAmount || 0), 0);
  const totalCommission = filteredTransactions.reduce((sum, txn) => sum + (txn.commission || 0), 0);

  const renderTransaction = ({ item, index }: { item: any; index: number }) => (
    <View style={styles.transactionCard}>
      <View style={styles.txnLeft}>
        <Text style={styles.txnOrder}>{item.orderNumber}</Text>
        <Text style={styles.txnMethod}>{item.method || 'Online'}</Text>
        <Text style={styles.txnDate}>
          {new Date(item.paidAt || item.createdAt).toLocaleDateString()}
        </Text>
      </View>

      <View style={styles.txnCenter}>
        <View style={styles.amountRow}>
          <Text style={styles.amountLabel}>Amount:</Text>
          <Text style={styles.amountValue}>₱{(item.amount || 0).toFixed(2)}</Text>
        </View>
        <View style={styles.amountRow}>
          <Text style={styles.amountLabel}>Commission:</Text>
          <Text style={styles.commissionValue}>-₱{(item.commission || 0).toFixed(2)}</Text>
        </View>
        <View style={[styles.amountRow, { borderTopWidth: 1, borderTopColor: '#EEEEEE', paddingTop: vs(8), marginTop: vs(8) }]}> 
          <Text style={styles.storeAmountLabel}>Your Earning:</Text>
          <Text style={styles.storeAmountValue}>₱{(item.storeAmount || 0).toFixed(2)}</Text>
        </View>
      </View>

      <View style={styles.txnRight}>
        <Text style={[
          styles.status,
          item.status === 'PAID' || item.status === 'SETTLED' ? styles.statusPaid : styles.statusPending
        ]}>
          {item.status}
        </Text>
      </View>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Loading transactions...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Image
source={require('../../../../src/assets/images/payment/chevron-left.png')}
            style={styles.chevronIcon}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Transaction History</Text>
        <View style={styles.backButton} />
      </View>

      {/* Filter Buttons */}
      <View style={styles.filterRow}>
        <TouchableOpacity
          style={[styles.filterButton, filter === 'all' && styles.filterButtonActive]}
          onPress={() => setFilter('all')}
        >
          <Text style={[styles.filterText, filter === 'all' && styles.filterTextActive]}>
            All ({transactions.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterButton, filter === 'paid' && styles.filterButtonActive]}
          onPress={() => setFilter('paid')}
        >
          <Text style={[styles.filterText, filter === 'paid' && styles.filterTextActive]}>
            Paid ({transactions.filter(t => t.status === 'PAID' || t.status === 'SETTLED').length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterButton, filter === 'pending' && styles.filterButtonActive]}
          onPress={() => setFilter('pending')}
        >
          <Text style={[styles.filterText, filter === 'pending' && styles.filterTextActive]}>
            Pending ({transactions.filter(t => t.status === 'PENDING').length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Summary */}
      <View style={styles.summaryCard}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Total Amount</Text>
          <Text style={styles.summaryValue}>₱{(totalAmount + totalCommission).toFixed(2)}</Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Commission Deducted</Text>
          <Text style={styles.commissionSummary}>-₱{totalCommission.toFixed(2)}</Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Your Earnings</Text>
          <Text style={styles.earningsSummary}>₱{totalAmount.toFixed(2)}</Text>
        </View>
      </View>

      {/* Transactions List */}
      {filteredTransactions.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No transactions</Text>
        </View>
      ) : (
        <FlatList
          data={filteredTransactions}
          renderItem={renderTransaction}
          keyExtractor={(_, index) => index.toString()}
          scrollEnabled={false}
          contentContainerStyle={styles.listContainer}
        />
      )}

      <View style={styles.bottomPadding} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F6F6',
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
  filterRow: {
    flexDirection: 'row',
    marginHorizontal: s(20),
    marginBottom: vs(15),
    gap: s(10),
  },
  filterButton: {
    flex: 1,
    paddingVertical: vs(10),
    paddingHorizontal: s(12),
    borderRadius: s(20),
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: '#DDDDDD',
  },
  filterButtonActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterText: {
    fontFamily: Fonts.primary,
    fontSize: s(12),
    fontWeight: '500',
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  filterTextActive: {
    color: Colors.white,
  },
  summaryCard: {
    marginHorizontal: s(20),
    marginBottom: vs(20),
    backgroundColor: Colors.white,
    borderRadius: s(15),
    padding: s(15),
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryLabel: {
    fontFamily: Fonts.primary,
    fontSize: s(11),
    color: Colors.textSecondary,
    marginBottom: vs(5),
  },
  summaryValue: {
    fontFamily: Fonts.primary,
    fontSize: s(16),
    fontWeight: '600',
    color: Colors.darkGray,
  },
  commissionSummary: {
    fontFamily: Fonts.primary,
    fontSize: s(16),
    fontWeight: '600',
    color: '#FF9800',
  },
  earningsSummary: {
    fontFamily: Fonts.primary,
    fontSize: s(16),
    fontWeight: '600',
    color: Colors.primary,
  },
  summaryDivider: {
    width: 1,
    backgroundColor: '#EEEEEE',
  },
  listContainer: {
    paddingHorizontal: s(20),
    paddingBottom: vs(20),
  },
  transactionCard: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    borderRadius: s(15),
    padding: s(15),
    marginBottom: vs(12),
  },
  txnLeft: {
    flex: 0.3,
  },
  txnOrder: {
    fontFamily: Fonts.primary,
    fontSize: s(14),
    fontWeight: '600',
    color: Colors.darkGray,
  },
  txnMethod: {
    fontFamily: Fonts.primary,
    fontSize: s(11),
    color: Colors.textSecondary,
    marginTop: vs(3),
  },
  txnDate: {
    fontFamily: Fonts.primary,
    fontSize: s(10),
    color: '#999999',
    marginTop: vs(3),
  },
  txnCenter: {
    flex: 0.5,
    paddingHorizontal: s(10),
  },
  amountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: vs(5),
  },
  amountLabel: {
    fontFamily: Fonts.primary,
    fontSize: s(11),
    color: Colors.textSecondary,
  },
  amountValue: {
    fontFamily: Fonts.primary,
    fontSize: s(11),
    fontWeight: '500',
    color: Colors.darkGray,
  },
  commissionValue: {
    fontFamily: Fonts.primary,
    fontSize: s(11),
    fontWeight: '500',
    color: '#FF9800',
  },
  storeAmountLabel: {
    fontFamily: Fonts.primary,
    fontSize: s(11),
    fontWeight: '600',
    color: Colors.darkGray,
  },
  storeAmountValue: {
    fontFamily: Fonts.primary,
    fontSize: s(12),
    fontWeight: '600',
    color: Colors.primary,
  },
  txnRight: {
    flex: 0.2,
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  status: {
    fontFamily: Fonts.primary,
    fontSize: s(11),
    fontWeight: '600',
    paddingHorizontal: s(8),
    paddingVertical: vs(4),
    borderRadius: s(6),
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
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontFamily: Fonts.primary,
    fontSize: s(16),
    color: Colors.textSecondary,
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
  bottomPadding: {
    height: vs(20),
  },
});
