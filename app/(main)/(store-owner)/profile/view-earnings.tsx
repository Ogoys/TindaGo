import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ref, get } from 'firebase/database';
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
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [monthlyEarnings, setMonthlyEarnings] = useState(0);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [allTransactions, setAllTransactions] = useState<any[]>([]);
  const [availableYears, setAvailableYears] = useState<number[]>([]);
  const [showYearPicker, setShowYearPicker] = useState(false);
  const [showMonthPicker, setShowMonthPicker] = useState(false);

  // Fetch earnings from Firebase
  useEffect(() => {
    const sid = user?.storeId || user?.id;
    if (!sid) {
      setLoading(false);
      return;
    }

    // OPTIMIZED: One-time fetch for ledger transactions
    const fetchLedger = async () => {
      const ledgerRef = ref(database, `ledgers/stores/${sid}/transactions`);
      const ledgerSnap = await get(ledgerRef);
      if (ledgerSnap.exists()) {
        const data = ledgerSnap.val();
        const txns = Object.values(data) as any[];

        // Calculate totals and collect years
        let total = 0;
        const years = new Set<number>();

        txns.forEach((txn: any) => {
          if (txn.status === 'PAID' || txn.status === 'SETTLED') {
            total += txn.storeAmount || 0;
            const txnDate = new Date(txn.paidAt || txn.createdAt);
            years.add(txnDate.getFullYear());
          }
        });

        setTotalEarned(total);
        setAllTransactions(txns.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
        setAvailableYears(Array.from(years).sort((a, b) => b - a));
      }
      setLoading(false);
    };
    
    fetchLedger();
  }, [user?.storeId, user?.id]);

  // Filter transactions by selected year and month
  useEffect(() => {
    const filtered = allTransactions.filter((txn: any) => {
      if (txn.status !== 'PAID' && txn.status !== 'SETTLED') return false;
      const txnDate = new Date(txn.paidAt || txn.createdAt);
      return txnDate.getFullYear() === selectedYear && txnDate.getMonth() === selectedMonth;
    });

    const monthTotal = filtered.reduce((sum, txn) => sum + (txn.storeAmount || 0), 0);
    setMonthlyEarnings(monthTotal);
    setTransactions(filtered);
  }, [selectedYear, selectedMonth, allTransactions]);

  // Wallet routes were removed. Route "View All" to sales history.
  const handleViewTransactions = () => {
    router.push('/(main)/(store-owner)/profile/transaction-history');
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

        {/* Period Selector */}
        <View style={styles.periodCard}>
          <View style={styles.periodHeader}>
            <Text style={styles.periodLabel}>Select Period</Text>
          </View>
          
          {/* Year Picker */}
          <TouchableOpacity 
            style={styles.pickerButton}
            onPress={() => setShowYearPicker(true)}
          >
            <Text style={styles.pickerLabel}>Year</Text>
            <Text style={styles.pickerValue}>{selectedYear}</Text>
            <Image
              source={require('../../../../src/assets/images/product-chart/chevron-right.png')}
              style={styles.chevronDown}
            />
          </TouchableOpacity>

          {/* Month Picker */}
          <TouchableOpacity 
            style={styles.pickerButton}
            onPress={() => setShowMonthPicker(true)}
          >
            <Text style={styles.pickerLabel}>Month</Text>
            <Text style={styles.pickerValue}>
              {[
                'January', 'February', 'March', 'April', 'May', 'June',
                'July', 'August', 'September', 'October', 'November', 'December'
              ][selectedMonth]}
            </Text>
            <Image
              source={require('../../../../src/assets/images/product-chart/chevron-right.png')}
              style={styles.chevronDown}
            />
          </TouchableOpacity>

          {/* Monthly Earnings Display */}
          <View style={styles.monthlyEarningsContainer}>
            <Text style={styles.monthlyEarningsLabel}>Earnings for this period</Text>
            <Text style={styles.monthlyEarningsAmount}>₱ {monthlyEarnings.toFixed(2)}</Text>
          </View>
        </View>

        {/* Transactions */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Transactions</Text>
            <TouchableOpacity onPress={handleViewTransactions}>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>

          {transactions.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No transactions for this period</Text>
            </View>
          ) : (
            transactions.map((txn: any, index: number) => (
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

        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* Year Picker Modal */}
      <Modal
        visible={showYearPicker}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowYearPicker(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowYearPicker(false)}
        >
          <View style={styles.pickerModal}>
            <View style={styles.pickerHeader}>
              <Text style={styles.pickerHeaderText}>Select Year</Text>
            </View>
            <ScrollView style={styles.pickerScroll}>
              {availableYears.map((year) => (
                <TouchableOpacity
                  key={year}
                  style={styles.pickerOption}
                  onPress={() => {
                    setSelectedYear(year);
                    setShowYearPicker(false);
                  }}
                >
                  <Text style={[
                    styles.pickerOptionText,
                    selectedYear === year && styles.pickerOptionTextActive
                  ]}>
                    {year}
                  </Text>
                  {selectedYear === year && (
                    <View style={styles.checkmark} />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Month Picker Modal */}
      <Modal
        visible={showMonthPicker}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowMonthPicker(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowMonthPicker(false)}
        >
          <View style={styles.pickerModal}>
            <View style={styles.pickerHeader}>
              <Text style={styles.pickerHeaderText}>Select Month</Text>
            </View>
            <ScrollView style={styles.pickerScroll}>
              {[
                'January', 'February', 'March', 'April', 'May', 'June',
                'July', 'August', 'September', 'October', 'November', 'December'
              ].map((month, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.pickerOption}
                  onPress={() => {
                    setSelectedMonth(index);
                    setShowMonthPicker(false);
                  }}
                >
                  <Text style={[
                    styles.pickerOptionText,
                    selectedMonth === index && styles.pickerOptionTextActive
                  ]}>
                    {month}
                  </Text>
                  {selectedMonth === index && (
                    <View style={styles.checkmark} />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
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
  cardSubLabel: {
    fontFamily: Fonts.primary,
    fontSize: s(12),
    color: Colors.textSecondary,
  },
  periodCard: {
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
  periodHeader: {
    marginBottom: vs(15),
  },
  periodLabel: {
    fontFamily: Fonts.primary,
    fontSize: s(16),
    fontWeight: '600',
    color: Colors.darkGray,
  },
  pickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: vs(12),
    paddingHorizontal: s(15),
    backgroundColor: '#F9F9F9',
    borderRadius: s(10),
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginBottom: vs(12),
  },
  pickerLabel: {
    fontFamily: Fonts.primary,
    fontSize: s(12),
    color: Colors.textSecondary,
    position: 'absolute',
    top: vs(-8),
    left: s(12),
    backgroundColor: Colors.white,
    paddingHorizontal: s(5),
  },
  pickerValue: {
    fontFamily: Fonts.primary,
    fontSize: s(16),
    fontWeight: '500',
    color: Colors.darkGray,
    flex: 1,
  },
  chevronDown: {
    width: s(12),
    height: vs(12),
    tintColor: Colors.textSecondary,
    transform: [{ rotate: '90deg' }],
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pickerModal: {
    width: '80%',
    maxHeight: '60%',
    backgroundColor: Colors.white,
    borderRadius: s(15),
    overflow: 'hidden',
  },
  pickerHeader: {
    paddingVertical: vs(15),
    paddingHorizontal: s(20),
    backgroundColor: Colors.primary,
    borderTopLeftRadius: s(15),
    borderTopRightRadius: s(15),
  },
  pickerHeaderText: {
    fontFamily: Fonts.primary,
    fontSize: s(16),
    fontWeight: '600',
    color: Colors.white,
    textAlign: 'center',
  },
  pickerScroll: {
    maxHeight: vs(400),
  },
  pickerOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: vs(15),
    paddingHorizontal: s(20),
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  pickerOptionText: {
    fontFamily: Fonts.primary,
    fontSize: s(16),
    color: Colors.darkGray,
  },
  pickerOptionTextActive: {
    fontWeight: '600',
    color: Colors.primary,
  },
  checkmark: {
    width: s(20),
    height: vs(20),
    borderRadius: s(10),
    backgroundColor: Colors.primary,
  },
  monthlyEarningsContainer: {
    marginTop: vs(10),
    paddingTop: vs(15),
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
    alignItems: 'center',
  },
  monthlyEarningsLabel: {
    fontFamily: Fonts.primary,
    fontSize: s(12),
    color: Colors.textSecondary,
    marginBottom: vs(5),
  },
  monthlyEarningsAmount: {
    fontFamily: Fonts.primary,
    fontSize: s(28),
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
  bottomPadding: {
    height: vs(100),
  },
});
