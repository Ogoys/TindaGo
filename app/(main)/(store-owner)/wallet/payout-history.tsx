import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator, Text, FlatList } from 'react-native';
import { useRouter } from 'expo-router';
import { ref, get } from 'firebase/database';
import { database } from '../../../../FirebaseConfig';
import { useUser } from '../../../../src/contexts/UserContext';
import { Typography } from '../../../../src/components/ui/Typography';
import { Colors } from '../../../../src/constants/Colors';
import { s, vs } from '../../../../src/constants/responsive';

interface Payout {
  id: string;
  amount: number;
  method: string;
  accountName: string;
  status: string;
  createdAt: string;
}

const PayoutHistory = () => {
  const router = useRouter();
  const { user } = useUser();
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    if (user?.storeId) loadPayouts();
  }, [user?.storeId]);

  const loadPayouts = async () => {
    if (!user?.storeId) return;
    try {
      setLoading(true);
      const payoutsRef = ref(database, 'payouts');
      const payoutsSnap = await get(payoutsRef);

      if (payoutsSnap.exists()) {
        const data = payoutsSnap.val();
        const userPayouts: Payout[] = Object.entries(data)
          .filter(([_, p]: [string, any]) => p.storeId === user.storeId)
          .map(([id, p]: [string, any]) => ({
            id,
            amount: p.amount || 0,
            method: p.method || 'bank',
            accountName: p.accountName || '',
            status: p.status || 'pending',
            createdAt: p.createdAt || new Date().toISOString(),
          }))
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setPayouts(userPayouts);
      }
    } catch (error) {
      console.error('Error loading payouts:', error);
    } finally {
      setLoading(false);
    }
  };

  const filtered = statusFilter === 'all' ? payouts : payouts.filter(p => p.status === statusFilter);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return '#34C759';
      case 'approved':
        return '#007AFF';
      case 'pending':
        return '#FF9500';
      case 'rejected':
        return '#FF3B30';
      default:
        return Colors.textSecondary;
    }
  };

  if (loading) return <View style={styles.container}><ActivityIndicator size="large" color={Colors.primary} /></View>;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}><Text style={styles.back}>Back</Text></TouchableOpacity>
        <Typography variant="h2" style={styles.title}>Payout History</Typography>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterContainer}>
        {['all', 'pending', 'approved', 'completed', 'rejected'].map(filter => (
          <TouchableOpacity key={filter} style={[styles.filterTab, statusFilter === filter && styles.filterTabActive]} onPress={() => setStatusFilter(filter)}>
            <Text style={[styles.filterText, statusFilter === filter && styles.filterTextActive]}>{filter}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <FlatList data={filtered} renderItem={({ item }) => (
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.cardInfo}>
              <Text style={styles.amount}>P {item.amount.toFixed(2)}</Text>
              <Text style={styles.method}>{item.method} - {item.accountName}</Text>
              <Text style={styles.date}>{new Date(item.createdAt).toLocaleDateString()}</Text>
            </View>
            <View style={[styles.badge, { backgroundColor: getStatusColor(item.status) }]}>
              <Text style={styles.badgeText}>{item.status}</Text>
            </View>
          </View>
        </View>
      )} keyExtractor={item => item.id} scrollEnabled={false} contentContainerStyle={styles.list} ListEmptyComponent={
        <View style={styles.empty}>
          <Typography variant="body" style={styles.emptyText}>No payout requests yet</Typography>
          <TouchableOpacity style={styles.createButton} onPress={() => router.push('/(main)/(store-owner)/wallet/payout-request')}>
            <Text style={styles.createButtonText}>Create Request</Text>
          </TouchableOpacity>
        </View>
      } />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.backgroundGray, padding: s(20) },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: vs(20) },
  back: { fontSize: s(14), color: Colors.primary, fontWeight: '600', marginRight: s(10) },
  title: { fontSize: s(24), fontWeight: '700', color: Colors.darkGray },
  filterContainer: { marginBottom: vs(20), paddingBottom: vs(10) },
  filterTab: { paddingHorizontal: s(12), paddingVertical: vs(8), borderRadius: s(20), backgroundColor: 'white', borderWidth: 1, borderColor: '#E0E0E0', marginRight: s(8) },
  filterTabActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  filterText: { fontSize: s(12), fontWeight: '600', color: Colors.textSecondary },
  filterTextActive: { color: 'white' },
  list: { paddingBottom: vs(20) },
  card: { backgroundColor: 'white', borderRadius: s(12), padding: s(16), marginBottom: vs(12), borderWidth: 1, borderColor: '#F0F0F0' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  cardInfo: { flex: 1 },
  amount: { fontSize: s(16), fontWeight: '700', color: Colors.primary, marginBottom: vs(4) },
  method: { fontSize: s(12), color: Colors.textSecondary, marginBottom: vs(4) },
  date: { fontSize: s(11), color: 'rgba(0, 0, 0, 0.5)' },
  badge: { paddingHorizontal: s(10), paddingVertical: vs(6), borderRadius: s(12) },
  badgeText: { fontSize: s(11), fontWeight: '600', color: 'white' },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: vs(60) },
  emptyText: { fontSize: s(16), color: Colors.textSecondary, marginBottom: vs(16) },
  createButton: { backgroundColor: Colors.primary, borderRadius: s(12), paddingHorizontal: s(24), paddingVertical: vs(12) },
  createButtonText: { fontSize: s(14), fontWeight: '600', color: 'white' },
});

export default PayoutHistory;