import React, { useEffect, useMemo, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Image } from 'react-native';
import { ref, get } from 'firebase/database';
import { database } from '../../../../FirebaseConfig';
import { useUser } from '../../../../src/contexts/UserContext';
import { Colors } from '../../../../src/constants/Colors';
import { Fonts } from '../../../../src/constants/Fonts';
import { s, vs } from '../../../../src/constants/responsive';
import { useRouter } from 'expo-router';
import { CommissionService } from '@/services/commission';

function fmt(n: number): string {
  try {
    return (n || 0).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  } catch {
    const v = Math.round((n || 0) * 100) / 100;
    const [i, d] = v.toFixed(2).split('.');
    return i.replace(/\B(?=(\d{3})+(?!\d))/g, ',') + '.' + d;
  }
}

// Types for enriched transaction rows
interface TxnRow {
  id: string;
  orderId?: string;
  orderNumber?: string;
  paymentMethod?: string; // gcash | paymaya | cash
  amount: number; // gross
  platformCommission: number; // 1%
  storeAmount: number; // net
  status: 'PAID' | 'SETTLED' | 'PENDING' | string;
  createdAt: number | string;
}

type TabKey = 'all' | 'paid' | 'pending';

export default function TransactionHistoryScreen() {
  const router = useRouter();
  const { user } = useUser();
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<TxnRow[]>([]);
  const [tab, setTab] = useState<TabKey>('all');

  useEffect(() => {
    async function load() {
      try {
        const sid = user?.storeId || user?.id;
        if (!sid) { setLoading(false); return; }

        // 1) Read ledger transactions
        const ledgerSnap = await get(ref(database, `ledgers/stores/${sid}/transactions`));
        if (ledgerSnap.exists()) {
          const txns = Object.entries<any>(ledgerSnap.val());
          // Fetch commission rate once for fallback
          const rate = await CommissionService.getCommissionRate();
          // 2) Enrich each txn with order fields (orderNumber, paymentMethod)
          const enriched = await Promise.all(txns.map(async ([id, t]) => {
            let orderNumber: string | undefined;
            let paymentMethod: string | undefined;
            if (t?.orderId) {
              const orderSnap = await get(ref(database, `orders/${t.orderId}`));
              if (orderSnap.exists()) {
                const o = orderSnap.val();
                orderNumber = o?.orderNumber;
                paymentMethod = o?.paymentMethod;
              }
            }
            const amount = Number(t?.amount || 0);
            let platformCommission = Number(t?.platformCommission || 0);
            let storeAmount = Number(t?.storeAmount || 0);
            // Fallbacks: if commission missing or zero, derive from amount & storeAmount or rate
            if (!platformCommission && amount) {
              if (storeAmount) {
                platformCommission = Math.max(amount - storeAmount, 0);
              } else {
                platformCommission = Math.round(amount * rate * 100) / 100;
                storeAmount = Math.round((amount - platformCommission) * 100) / 100;
              }
            }

            const row: TxnRow = {
              id,
              orderId: t?.orderId,
              orderNumber,
              paymentMethod,
              amount,
              platformCommission,
              storeAmount,
              status: String(t?.status || '').toUpperCase(),
              createdAt: t?.paidAt || t?.createdAt || Date.now(),
            };
            return row;
          }));

          enriched.sort((a, b) => new Date(b.createdAt as any).getTime() - new Date(a.createdAt as any).getTime());
          setRows(enriched);
        }
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [user?.storeId, user?.id]);

  const filtered = useMemo(() => {
    if (tab === 'paid') return rows.filter(r => r.status === 'PAID' || r.status === 'SETTLED');
    if (tab === 'pending') return rows.filter(r => r.status === 'PENDING');
    return rows;
  }, [rows, tab]);

  const totals = useMemo(() => {
    const totalAmount = filtered.reduce((sum, r) => sum + (r.amount || 0), 0);
    // If a row somehow still lacks commission, derive from amount - storeAmount
    const totalCommission = filtered.reduce((sum, r) => {
      const c = (r.platformCommission ?? 0);
      if (c && c > 0) return sum + c;
      const derived = (r.amount || 0) - (r.storeAmount || 0);
      return sum + Math.max(derived, 0);
    }, 0);
    const totalEarnings = filtered.reduce((sum, r) => sum + (r.storeAmount || Math.max((r.amount||0) - (r.platformCommission||0), 0)), 0);
    return { totalAmount, totalCommission, totalEarnings };
  }, [filtered]);

  const handleBack = () => router.back();

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
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <Image source={require('../../../../src/assets/images/payment/chevron-left.png')} style={styles.chevronIcon} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Transaction History</Text>
          <View style={styles.backButton} />
        </View>

        {/* Tabs */}
        <View style={styles.tabs}>
          <TabButton label={`All (${rows.length})`} active={tab==='all'} onPress={() => setTab('all')} />
          <TabButton label={`Paid (${rows.filter(r => r.status==='PAID'||r.status==='SETTLED').length})`} active={tab==='paid'} onPress={() => setTab('paid')} />
          <TabButton label={`Pending (${rows.filter(r => r.status==='PENDING').length})`} active={tab==='pending'} onPress={() => setTab('pending')} />
        </View>

        {/* Summary */}
        <View style={styles.summaryCard}>
          <SummaryItem label="Total Amount" valueLabel={`₱ ${fmt(totals.totalAmount)}`} color={Colors.darkGray} />
          <SummaryItem label="Commission Deducted" valueLabel={`-₱ ${fmt(Math.abs(totals.totalCommission))}`} color="#FF9800" />
          <SummaryItem label="Your Earnings" valueLabel={`₱ ${fmt(totals.totalEarnings)}`} color={Colors.primary} />
        </View>

        {/* List */}
        {filtered.map((r) => (
          <View key={r.id} style={styles.rowCard}>
            <View style={{flex:1}}>
              <Text style={styles.orderNo}>{r.orderNumber || r.orderId || r.id}</Text>
              {!!r.paymentMethod && (
                <Text style={styles.method}>{r.paymentMethod}</Text>
              )}
              <Text style={styles.date}>{new Date(r.createdAt as any).toLocaleDateString()}</Text>
            </View>
            <View style={{flex:1}}>
              <KV label="Amount:" value={`₱ ${fmt(r.amount||0)}`} />
              <KV label="Commission:" value={`-₱ ${fmt(r.platformCommission||0)}`} color="#FF9800" />
              <View style={styles.rule} />
              <KV label="Your Earning:" value={`₱ ${fmt(r.storeAmount||0)}`} color={Colors.primary} />
            </View>
            <StatusPill status={r.status} />
          </View>
        ))}

        <View style={{height: vs(100)}} />
      </ScrollView>
    </SafeAreaView>
  );
}

function TabButton({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <TouchableOpacity style={[styles.tab, active && styles.tabActive]} onPress={onPress}>
      <Text style={[styles.tabText, active && styles.tabTextActive]}>{label}</Text>
    </TouchableOpacity>
  );
}

function SummaryItem({ label, valueLabel, color }: { label: string; valueLabel: string; color: string }) {
  return (
    <View style={styles.summaryItem}>
      <Text style={styles.summaryLabel}>{label}</Text>
      <Text style={[styles.summaryValue, { color }]}>{valueLabel}</Text>
    </View>
  );
}

function KV({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <View style={styles.kvRow}>
      <Text style={styles.kvLabel}>{label}</Text>
      <Text style={[styles.kvValue, !!color && { color }]}>{value}</Text>
    </View>
  );
}

function StatusPill({ status }: { status: string }) {
  const paid = status === 'PAID' || status === 'SETTLED';
  const bg = paid ? '#E8F5E9' : '#FFF3E0';
  const col = paid ? '#34C759' : '#FF9800';
  return (
    <View style={[styles.statusPill, { backgroundColor: bg }] }>
      <Text style={[styles.statusPillText, { color: col }]}>{paid ? 'PAID' : 'PENDING'}</Text>
    </View>
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
  chevronIcon: { width: s(15), height: vs(15) },
  headerTitle: {
    fontFamily: Fonts.primary,
    fontSize: s(20),
    fontWeight: '600',
    color: Colors.darkGray,
  },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: vs(15), fontSize: s(16), color: Colors.textSecondary },

  tabs: { flexDirection: 'row', gap: s(10), paddingHorizontal: s(20), marginBottom: vs(10) },
  tab: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: s(25),
    paddingVertical: vs(10),
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  tabActive: { backgroundColor: '#E6FAEF', borderColor: '#A7F3D0' },
  tabText: { fontFamily: Fonts.primary, fontSize: s(14), color: Colors.darkGray },
  tabTextActive: { color: Colors.primary, fontWeight: '600' },

  summaryCard: {
    marginHorizontal: s(20),
    marginBottom: vs(15),
    backgroundColor: Colors.white,
    borderRadius: s(16),
    padding: s(16),
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryItem: { alignItems: 'center', flex: 1 },
  summaryLabel: { fontFamily: Fonts.primary, fontSize: s(12), color: Colors.textSecondary, marginBottom: vs(6) },
  summaryValue: { fontFamily: Fonts.primary, fontSize: s(18), fontWeight: '600' },

  rowCard: {
    marginHorizontal: s(20),
    marginBottom: vs(12),
    backgroundColor: Colors.white,
    borderRadius: s(16),
    padding: s(16),
    flexDirection: 'row',
    gap: s(12),
    alignItems: 'flex-start',
  },
  orderNo: { fontFamily: Fonts.primary, fontSize: s(14), fontWeight: '600', color: Colors.darkGray },
  method: { fontFamily: Fonts.primary, fontSize: s(12), color: Colors.textSecondary, marginTop: vs(2) },
  date: { fontFamily: Fonts.primary, fontSize: s(12), color: Colors.textSecondary, marginTop: vs(4) },

  kvRow: { flexDirection: 'row', justifyContent: 'space-between' },
  kvLabel: { fontFamily: Fonts.primary, fontSize: s(12), color: Colors.textSecondary },
  kvValue: { fontFamily: Fonts.primary, fontSize: s(12), color: Colors.darkGray, fontWeight: '600' },
  rule: { height: 1, backgroundColor: '#EEEEEE', marginVertical: vs(6) },

  statusPill: { alignSelf: 'center', borderRadius: s(12), paddingHorizontal: s(10), paddingVertical: vs(4) },
  statusPillText: { fontFamily: Fonts.primary, fontSize: s(12), fontWeight: '600' },
});
