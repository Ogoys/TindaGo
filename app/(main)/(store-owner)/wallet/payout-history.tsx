/**
 * STORE OWNER - PAYOUT HISTORY SCREEN
 *
 * Shows all payout/withdrawal requests with status filtering
 * Matches the design structure of Orders screen for consistency
 *
 * Features:
 * - Filter tabs: All, Pending, Approved, Completed, Rejected
 * - Payout cards with amount, method, account name, and status
 * - Empty state with "Create Request" button
 * - Real-time Firebase sync
 */

import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ref, get, onValue } from 'firebase/database';
import { database } from '../../../../FirebaseConfig';
import { useUser } from '../../../../src/contexts/UserContext';
import { Typography } from '../../../../src/components/ui/Typography';
import { Colors } from '../../../../src/constants/Colors';
import { Fonts } from '../../../../src/constants/Fonts';
import { s, vs, ms } from '../../../../src/constants/responsive';

interface Payout {
  id: string;
  amount: number;
  method: string;
  accountName: string;
  status: string;
  createdAt: string;
}

type FilterStatus = 'all' | 'pending' | 'approved' | 'completed' | 'rejected';

interface FilterTab {
  label: string;
  status: FilterStatus;
}

const FILTER_TABS: FilterTab[] = [
  { label: 'All', status: 'all' },
  { label: 'Pending', status: 'pending' },
  { label: 'Approved', status: 'approved' },
  { label: 'Completed', status: 'completed' },
  { label: 'Rejected', status: 'rejected' },
];

export default function PayoutHistory() {
  const { user } = useUser();
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState<FilterStatus>('all');

  // Real-time listener for payout status updates
  useEffect(() => {
    const sid = user?.storeId || user?.id;
    if (!sid) {
      setPayouts([]);
      setLoading(false);
      return;
    }

    const payoutsRef = ref(database, 'payouts');
    const unsubscribe = onValue(
      payoutsRef,
      (snapshot) => {
        try {
          if (snapshot.exists()) {
            const data = snapshot.val();
            const userPayouts: Payout[] = Object.entries(data)
              .filter(([_, p]: [string, any]) => p.storeId === sid)
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
          } else {
            setPayouts([]);
          }
        } catch (err) {
          console.error('Error processing payouts:', err);
          setPayouts([]);
        } finally {
          setLoading(false);
        }
      },
      (error) => {
        console.error('Error listening to payouts:', error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user?.storeId, user?.id]);

  // Handle back navigation
  const handleBack = () => {
    router.back();
  };

  // Filter payouts based on selected status
  const filteredPayouts = selectedFilter === 'all'
    ? payouts
    : payouts.filter(p => p.status === selectedFilter);

  // Simple client-side pagination
  const [showCount, setShowCount] = useState(20);
  const visiblePayouts = filteredPayouts.slice(0, showCount);

  // Get title based on selected filter
  const getTitle = () => {
    const tab = FILTER_TABS.find(t => t.status === selectedFilter);
    return tab ? `${tab.label} Payouts` : 'Payout History';
  };

  // Get status badge color
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

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header - Matching Orders screen structure */}
      <View style={styles.header}>
        {/* Back Button with Icon */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleBack}
        >
          <Image
            source={require("../../../../src/assets/images/store-orders/back-icon.png")}
            style={styles.backIcon}
          />
        </TouchableOpacity>

        {/* Title */}
        <Text style={styles.title}>{getTitle()}</Text>
      </View>

      {/* Filter Tabs - Matching Orders screen */}
      <View style={styles.filterContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScrollContent}
        >
          {FILTER_TABS.map((tab) => (
            <TouchableOpacity
              key={tab.status}
              style={[
                styles.filterTab,
                selectedFilter === tab.status && styles.filterTabActive
              ]}
              onPress={() => setSelectedFilter(tab.status)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.filterTabText,
                  selectedFilter === tab.status && styles.filterTabTextActive
                ]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Payouts List */}
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.primary} />
            <Text style={styles.loadingText}>Loading payout history...</Text>
          </View>
        ) : filteredPayouts.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Image
              source={require('../../../../src/assets/images/store-owner-dashboard/wallet-icon.png')}
              style={styles.emptyIcon}
              resizeMode="contain"
            />
            <Text style={styles.emptyText}>No {selectedFilter !== 'all' ? selectedFilter : ''} payouts yet</Text>
            <Text style={styles.emptySubtext}>
              {selectedFilter === 'all'
                ? 'Create a payout request to withdraw your earnings'
                : `No ${selectedFilter} payout requests found`}
            </Text>
            <TouchableOpacity
              style={styles.createButton}
              onPress={() => router.push('/(main)/(store-owner)/wallet/payout-requests')}
            >
              <Text style={styles.createButtonText}>Create Payout Request</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.payoutListContainer}>
            {visiblePayouts.map((payout) => (
              <View key={payout.id} style={styles.payoutCard}>
                {/* Amount with Icon */}
                <View style={styles.amountSection}>
                  <View style={styles.amountIconContainer}>
                    <Image
                      source={require('../../../../src/assets/images/store-owner-dashboard/wallet-icon.png')}
                      style={styles.amountIcon}
                      resizeMode="contain"
                    />
                  </View>
                  <View style={styles.amountTextContainer}>
                    <Typography style={styles.amountLabel}>Amount</Typography>
                    <Typography style={styles.amountValue}>₱{payout.amount.toFixed(2)}</Typography>
                  </View>
                  {/* Status Badge */}
                  <View style={[styles.statusBadge, { backgroundColor: getStatusColor(payout.status) }]}>
                    <Text style={styles.statusBadgeText}>
                      {payout.status.charAt(0).toUpperCase() + payout.status.slice(1)}
                    </Text>
                  </View>
                </View>

                {/* Divider */}
                <View style={styles.cardDivider} />

                {/* Details Section */}
                <View style={styles.detailsSection}>
                  {/* Method */}
                  <View style={styles.detailRow}>
                    <View style={styles.detailIconWrapper}>
                      <Image
                        source={require('../../../../src/assets/images/store-owner-dashboard/cheque-icon.png')}
                        style={styles.detailIcon}
                        resizeMode="contain"
                      />
                    </View>
                    <View style={styles.detailContent}>
                      <Typography style={styles.detailLabel}>Method</Typography>
                      <Typography style={styles.detailValue}>
                        {payout.method.charAt(0).toUpperCase() + payout.method.slice(1)}
                      </Typography>
                    </View>
                  </View>

                  {/* Account */}
                  <View style={styles.detailRow}>
                    <View style={styles.detailIconWrapper}>
                      <Image
                        source={require('../../../../src/assets/images/store-owner-dashboard/person-icon.png')}
                        style={styles.detailIcon}
                        resizeMode="contain"
                      />
                    </View>
                    <View style={styles.detailContent}>
                      <Typography style={styles.detailLabel}>Account</Typography>
                      <Typography style={styles.detailValue} numberOfLines={1}>
                        {payout.accountName || 'N/A'}
                      </Typography>
                    </View>
                  </View>

                  {/* Date */}
                  <View style={styles.detailRow}>
                    <View style={styles.detailIconWrapper}>
                      <Image
                        source={require('../../../../src/assets/images/store-owner-dashboard/cheque-icon.png')}
                        style={styles.detailIcon}
                        resizeMode="contain"
                      />
                    </View>
                    <View style={styles.detailContent}>
                      <Typography style={styles.detailLabel}>Date</Typography>
                      <Typography style={styles.detailValue} numberOfLines={1}>
                        {formatDate(payout.createdAt)}
                      </Typography>
                    </View>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}

        {showCount < filteredPayouts.length && (
          <TouchableOpacity style={[styles.createButton, { alignSelf: 'center', marginTop: vs(8) }]} onPress={() => setShowCount(prev => prev + 20)}>
            <Text style={styles.createButtonText}>Load more</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundGray || '#F8F9FA',
  },

  // Header Styles (Matching Orders)
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center', // Center the content
    paddingHorizontal: s(20),
    paddingVertical: vs(16),
    backgroundColor: Colors.white,
    position: 'relative', // For absolute positioning of back button
  },
  backButton: {
    position: 'absolute', // Position absolutely
    left: s(20), // Align to left
    width: s(30),
    height: s(30),
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1, // Ensure it's above other content
  },
  backIcon: {
    width: s(24),
    height: s(24),
    tintColor: Colors.darkGray,
  },
  title: {
    fontFamily: Fonts.primary,
    fontSize: ms(20),
    lineHeight: vs(24),
    color: Colors.darkGray,
    fontWeight: '600',
    textAlign: 'center', // Center text
  },

  // Filter Tabs (Matching Orders)
  filterContainer: {
    backgroundColor: Colors.white,
    paddingVertical: vs(12),
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  filterScrollContent: {
    paddingHorizontal: s(20),
    gap: s(8),
  },
  filterTab: {
    paddingHorizontal: s(16),
    paddingVertical: vs(8),
    borderRadius: s(20),
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  filterTabActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterTabText: {
    fontFamily: Fonts.primary,
    fontSize: ms(13),
    fontWeight: '500',
    color: Colors.textSecondary,
  },
  filterTabTextActive: {
    color: Colors.white,
  },

  // Scroll View
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: s(20),
  },

  // Loading State
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: vs(60),
  },
  loadingText: {
    marginTop: vs(12),
    fontFamily: Fonts.primary,
    fontSize: ms(14),
    color: Colors.textSecondary,
  },

  // Empty State
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: vs(80),
    paddingHorizontal: s(40),
  },
  emptyIcon: {
    width: s(80),
    height: s(80),
    tintColor: Colors.textSecondary,
    opacity: 0.5,
    marginBottom: vs(20),
  },
  emptyText: {
    fontFamily: Fonts.primary,
    fontSize: ms(18),
    fontWeight: '600',
    color: Colors.darkGray,
    marginBottom: vs(8),
    textAlign: 'center',
  },
  emptySubtext: {
    fontFamily: Fonts.primary,
    fontSize: ms(14),
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: vs(24),
    lineHeight: vs(20),
  },
  createButton: {
    backgroundColor: Colors.primary,
    borderRadius: s(12),
    paddingHorizontal: s(32),
    paddingVertical: vs(14),
  },
  createButtonText: {
    fontFamily: Fonts.primary,
    fontSize: ms(14),
    fontWeight: '600',
    color: Colors.white,
  },

  // Payout List
  payoutListContainer: {
    gap: vs(16),
  },

  // Payout Card - Improved design
  payoutCard: {
    backgroundColor: Colors.white,
    borderRadius: s(16),
    padding: s(20),
    marginBottom: vs(12),
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: s(8),
    elevation: 2,
  },

  // Amount Section (Top of card)
  amountSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: vs(16),
  },
  amountIconContainer: {
    width: s(48),
    height: s(48),
    borderRadius: s(12),
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: s(12),
  },
  amountIcon: {
    width: s(24),
    height: s(24),
    tintColor: Colors.white,
  },
  amountTextContainer: {
    flex: 1,
  },
  amountLabel: {
    fontFamily: Fonts.primary,
    fontSize: ms(12),
    color: Colors.textSecondary,
    marginBottom: vs(2),
  },
  amountValue: {
    fontFamily: Fonts.primary,
    fontSize: ms(22),
    fontWeight: '700',
    color: Colors.primary,
  },
  statusBadge: {
    paddingHorizontal: s(14),
    paddingVertical: vs(6),
    borderRadius: s(16),
    alignSelf: 'flex-start',
  },
  statusBadgeText: {
    fontFamily: Fonts.primary,
    fontSize: ms(11),
    fontWeight: '700',
    color: Colors.white,
    textTransform: 'capitalize',
  },

  // Card Divider
  cardDivider: {
    height: 1,
    backgroundColor: '#F0F0F0',
    marginBottom: vs(16),
  },

  // Details Section
  detailsSection: {
    gap: vs(14),
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailIconWrapper: {
    width: s(36),
    height: s(36),
    borderRadius: s(8),
    backgroundColor: '#F8F9FA',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: s(12),
  },
  detailIcon: {
    width: s(18),
    height: s(18),
    tintColor: Colors.textSecondary,
  },
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    fontFamily: Fonts.primary,
    fontSize: ms(11),
    color: Colors.textSecondary,
    marginBottom: vs(3),
  },
  detailValue: {
    fontFamily: Fonts.primary,
    fontSize: ms(14),
    fontWeight: '600',
    color: Colors.darkGray,
  },
});
