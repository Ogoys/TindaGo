/**
 * STORE OWNER RETURN HISTORY SCREEN
 *
 * Figma File: 8I1Nr3vQZllDDknSevstvH
 * Node: 1428-6992 (Store Owner Return Items)
 * Baseline: 440x956
 *
 * PIXEL-PERFECT IMPLEMENTATION:
 * Shows all customer return requests for the store owner.
 * Features:
 * - Return request cards with status badges (Pending, Resolved, Rejected)
 * - Click to view return details
 * - Search by customer name or return number
 * - Filter by refund method
 * - Analytics summary
 * - Delete returns
 *
 * Design Pattern: Similar to customer return history with store owner specific features
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  StatusBar,
  TextInput,
  RefreshControl,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { auth } from '../../../../FirebaseConfig';
import { s, vs, ms } from '../../../../src/constants/responsive';
import { Colors } from '../../../../src/constants/Colors';
import { Fonts } from '../../../../src/constants/Fonts';
import { getStoreReturns } from '../../../../src/api/returns/storeReturns';
import { Return, ReturnStatus, REFUND_METHODS } from '../../../../src/models/Return';

type FilterRefundMethod = 'all' | 'gcash' | 'paymaya' | 'loan';

const StoreOwnerReturnHistoryScreen = () => {
  const [returns, setReturns] = useState<Return[]>([]);
  const [filteredReturns, setFilteredReturns] = useState<Return[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRefundMethod, setFilterRefundMethod] = useState<FilterRefundMethod>('all');
  const [showFilter, setShowFilter] = useState(false);

  useEffect(() => {
    fetchReturns();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [returns, searchQuery, filterRefundMethod]);

  const fetchReturns = async () => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) return;

      const data = await getStoreReturns(currentUser.uid);
      setReturns(data);
    } catch (error) {
      console.error('Error fetching returns:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...returns];

    // Refund method filter
    if (filterRefundMethod !== 'all') {
      filtered = filtered.filter(returnRecord => returnRecord.refundMethod === filterRefundMethod);
    }

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(returnRecord =>
        returnRecord.returnNumber.toLowerCase().includes(query) ||
        returnRecord.customerName?.toLowerCase().includes(query)
      );
    }

    setFilteredReturns(filtered);
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchReturns();
  };

  const handleReturnPress = (returnItem: Return) => {
    // Navigate to return details screen with returnId parameter
    router.push(`/(main)/(store-owner)/profile/return-details?returnId=${returnItem.id}` as any);
  };

  const getRefundMethodLabel = (method: string) => {
    return REFUND_METHODS.find(m => m.value === method)?.label || method;
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'N/A';
      return date.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' });
    } catch (error) {
      return 'N/A';
    }
  };

  const formatCurrency = (value: number | undefined): string => {
    if (value === undefined || value === null || isNaN(value)) {
      return '0.00';
    }
    return value.toFixed(2);
  };

  const getStatusConfig = (status: ReturnStatus) => {
    switch (status) {
      case 'pending':
        return {
          backgroundColor: '#FFA500',
          color: '#FFFFFF',
          label: 'Pending',
        };
      case 'resolved':
        return {
          backgroundColor: Colors.primary,
          color: '#FFFFFF',
          label: 'Resolved',
        };
      case 'rejected':
        return {
          backgroundColor: '#E92B45',
          color: '#FFFFFF',
          label: 'Rejected',
        };
      default:
        return {
          backgroundColor: '#9CA3AF',
          color: '#FFFFFF',
          label: status,
        };
    }
  };

  const renderSummary = () => {
    const totalReturns = filteredReturns.length;
    const totalRefunded = filteredReturns.reduce((sum, r) => sum + r.totalRefund, 0);
    const pendingCount = filteredReturns.filter(r => r.status === 'pending').length;

    return (
      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>Return Overview</Text>
        <View style={styles.summaryRow}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>₱{totalRefunded.toFixed(2)}</Text>
            <Text style={styles.summaryLabel}>Total Refunded</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryValue, { color: Colors.primary }]}>{totalReturns}</Text>
            <Text style={styles.summaryLabel}>Returns</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryValue, { color: '#FFA500' }]}>{pendingCount}</Text>
            <Text style={styles.summaryLabel}>Pending</Text>
          </View>
        </View>
      </View>
    );
  };

  const renderReturnCard = (returnItem: Return, index: number) => {
    const statusConfig = getStatusConfig(returnItem.status);
    const isFirst = index === 0;

    return (
      <TouchableOpacity
        key={returnItem.id}
        style={[
          styles.returnCard,
          isFirst && styles.returnCardFirst
        ]}
        onPress={() => handleReturnPress(returnItem)}
        activeOpacity={0.8}
      >
        {/* Logo Container - Brown background with return icon */}
        <View style={styles.logoContainer}>
          <View style={styles.logoBackground}>
            <Text style={styles.returnIconText}>↩</Text>
          </View>
        </View>

        {/* Return Info */}
        <View style={styles.returnInfo}>
          {/* Return Number */}
          <Text style={styles.returnNumber}>{returnItem.returnNumber || 'N/A'}</Text>

          {/* Customer Name */}
          {returnItem.customerName && (
            <Text style={styles.customerName}>{returnItem.customerName}</Text>
          )}

          {/* Status Badge */}
          <View style={[styles.statusBadge, { backgroundColor: statusConfig.backgroundColor }]}>
            <Text style={[styles.statusText, { color: statusConfig.color }]}>
              {statusConfig.label}
            </Text>
          </View>
        </View>

        {/* Right Section */}
        <View style={styles.rightSection}>
          {/* Date */}
          <Text style={styles.date}>
            {formatDate(returnItem.createdAt)}
          </Text>

          {/* Items Count */}
          <Text style={styles.itemsCount}>
            {returnItem.items.length} {returnItem.items.length === 1 ? 'item' : 'items'}
          </Text>

          {/* Total Refund */}
          <Text style={styles.total}>₱{formatCurrency(returnItem.totalRefund)}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.backgroundGray} />

      {/* Header - Figma: y:0-130 */}
      <View style={styles.headerContainer}>
        {/* Back Button - Figma: x:20, y:79, size:30x30 */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>

        {/* Title - Figma: centered */}
        <Text style={styles.title}>Return History</Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {/* Search and Filter */}
        <View style={styles.searchFilterRow}>
          <View style={styles.searchContainer}>
            <Text style={styles.searchIcon}>🔍</Text>
            <TextInput
              style={styles.searchInput}
              placeholder="Search returns..."
              placeholderTextColor="rgba(30, 30, 30, 0.5)"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          <TouchableOpacity
            style={styles.filterButton}
            onPress={() => setShowFilter(!showFilter)}
            activeOpacity={0.7}
          >
            <View style={styles.filterIcon}>
              <View style={[styles.filterLine, { width: s(20) }]} />
              <View style={[styles.filterLine, { width: s(14), marginTop: vs(3) }]} />
              <View style={[styles.filterLine, { width: s(8), marginTop: vs(3) }]} />
            </View>
            {filterRefundMethod !== 'all' && <View style={styles.filterBadge} />}
          </TouchableOpacity>
        </View>

        {/* Filter Options */}
        {showFilter && (
          <View style={styles.filterOptions}>
            {(['all', 'gcash', 'paymaya', 'loan'] as FilterRefundMethod[]).map(method => (
              <TouchableOpacity
                key={method}
                style={[
                  styles.filterOption,
                  filterRefundMethod === method && styles.filterOptionActive
                ]}
                onPress={() => {
                  setFilterRefundMethod(method);
                  setShowFilter(false);
                }}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.filterOptionText,
                    filterRefundMethod === method && styles.filterOptionTextActive
                  ]}
                >
                  {method === 'all' ? 'All' : getRefundMethodLabel(method)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Summary */}
        {filteredReturns.length > 0 && renderSummary()}

        {/* Returns List */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.primary} />
            <Text style={styles.loadingText}>Loading return history...</Text>
          </View>
        ) : filteredReturns.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📦</Text>
            <Text style={styles.emptyText}>
              {searchQuery || filterRefundMethod !== 'all'
                ? 'No returns found'
                : 'No return requests yet'}
            </Text>
            <Text style={styles.emptySubtext}>
              {searchQuery || filterRefundMethod !== 'all'
                ? 'Try adjusting your search or filters'
                : 'Customer return requests will appear here'}
            </Text>
            {!searchQuery && filterRefundMethod === 'all' && (
              <TouchableOpacity
                style={styles.recordButton}
                onPress={() => router.push('/(main)/(store-owner)/profile/record-return')}
                activeOpacity={0.7}
              >
                <Text style={styles.recordButtonText}>Record Return</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          filteredReturns.map((returnItem, index) => renderReturnCard(returnItem, index))
        )}
      </ScrollView>

      {/* Floating Action Button */}
      {filteredReturns.length > 0 && (
        <TouchableOpacity
          style={styles.fab}
          onPress={() => router.push('/(main)/(store-owner)/profile/record-return')}
          activeOpacity={0.7}
        >
          <Text style={styles.fabText}>+</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundGray,
  },

  // Header - Figma: y:0-130
  headerContainer: {
    backgroundColor: Colors.backgroundGray,
    paddingTop: vs(79),
    paddingBottom: vs(20),
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },

  // Back Button - Figma: x:20, y:79, size:30x30
  backButton: {
    position: 'absolute',
    left: s(20),
    top: vs(79),
    width: s(30),
    height: s(30),
    borderRadius: s(20),
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
    zIndex: 10,
  },

  backIcon: {
    fontSize: ms(20),
    color: Colors.darkGray,
    fontWeight: '600',
  },

  // Title - Figma: centered, fontSize:20
  title: {
    fontFamily: Fonts.primary,
    fontWeight: '600',
    fontSize: ms(20),
    lineHeight: vs(22),
    color: Colors.darkGray,
    textAlign: 'center',
  },

  scrollContent: {
    paddingHorizontal: s(20),
    paddingBottom: vs(100),
  },

  // Search and Filter Row
  searchFilterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: vs(15),
  },

  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: s(12),
    paddingHorizontal: s(15),
    paddingVertical: vs(12),
    marginRight: s(10),
    shadowColor: 'rgba(0, 0, 0, 0.15)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 3,
  },

  searchIcon: {
    fontSize: ms(16),
    marginRight: s(10),
  },

  searchInput: {
    flex: 1,
    fontFamily: Fonts.primary,
    fontSize: ms(14),
    color: Colors.darkGray,
  },

  filterButton: {
    width: s(50),
    height: s(50),
    backgroundColor: Colors.white,
    borderRadius: s(12),
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: 'rgba(0, 0, 0, 0.15)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 3,
  },

  filterIcon: {
    width: s(20),
    alignItems: 'flex-start',
  },

  filterLine: {
    height: vs(2.5),
    backgroundColor: Colors.primary,
    borderRadius: s(2),
  },

  filterBadge: {
    position: 'absolute',
    top: s(8),
    right: s(8),
    width: s(8),
    height: s(8),
    borderRadius: s(4),
    backgroundColor: '#E92B45',
  },

  filterOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: s(10),
    marginBottom: vs(15),
  },

  filterOption: {
    paddingHorizontal: s(16),
    paddingVertical: vs(8),
    backgroundColor: Colors.white,
    borderRadius: s(20),
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },

  filterOptionActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },

  filterOptionText: {
    fontFamily: Fonts.primary,
    fontSize: ms(13),
    color: Colors.darkGray,
    fontWeight: '500',
  },

  filterOptionTextActive: {
    color: Colors.white,
  },

  // Summary Card
  summaryCard: {
    backgroundColor: Colors.white,
    borderRadius: s(16),
    padding: s(15),
    marginBottom: vs(20),
    shadowColor: 'rgba(0, 0, 0, 0.15)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 3,
  },

  summaryTitle: {
    fontFamily: Fonts.primary,
    fontWeight: '600',
    fontSize: ms(16),
    color: Colors.darkGray,
    marginBottom: vs(15),
  },

  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },

  summaryItem: {
    alignItems: 'center',
  },

  summaryValue: {
    fontFamily: Fonts.primary,
    fontWeight: '700',
    fontSize: ms(20),
    color: Colors.primary,
    marginBottom: vs(4),
  },

  summaryLabel: {
    fontFamily: Fonts.primary,
    fontSize: ms(12),
    color: Colors.textSecondary,
  },

  // Return Card - Figma: width:400, height:100
  returnCard: {
    width: s(400),
    minHeight: vs(100),
    backgroundColor: Colors.white,
    borderRadius: s(16),
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 3,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: s(20),
    paddingVertical: vs(20),
    marginBottom: vs(15),
  },

  returnCardFirst: {
    marginTop: vs(0),
  },

  // Logo Container - Figma: size:40x40, brown background
  logoContainer: {
    marginRight: s(15),
  },

  logoBackground: {
    width: s(40),
    height: s(40),
    borderRadius: s(8),
    backgroundColor: '#8B4513', // Brown color for return icon
    justifyContent: 'center',
    alignItems: 'center',
  },

  returnIconText: {
    fontSize: ms(24),
    color: '#FFFFFF',
    fontWeight: '600',
  },

  // Return Info
  returnInfo: {
    flex: 1,
    justifyContent: 'center',
  },

  // Return Number - Figma: fontSize:14, fontWeight:600
  returnNumber: {
    fontSize: ms(14),
    fontFamily: Fonts.primary,
    fontWeight: '600',
    color: Colors.darkGray,
    lineHeight: ms(17.22),
    marginBottom: vs(5),
  },

  // Customer Name - Figma: fontSize:12, opacity:0.5
  customerName: {
    fontSize: ms(12),
    fontFamily: Fonts.primary,
    fontWeight: '500',
    color: 'rgba(30, 30, 30, 0.5)',
    lineHeight: ms(14.76),
    marginBottom: vs(6),
  },

  // Status Badge
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: s(10),
    paddingVertical: vs(4),
    borderRadius: s(8),
  },

  statusText: {
    fontSize: ms(11),
    fontFamily: Fonts.primary,
    fontWeight: '600',
    textTransform: 'capitalize',
  },

  // Right Section
  rightSection: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },

  // Date - Figma: fontSize:12, opacity:0.5
  date: {
    fontSize: ms(12),
    fontFamily: Fonts.primary,
    fontWeight: '500',
    color: 'rgba(30, 30, 30, 0.5)',
    lineHeight: ms(14.76),
    marginBottom: vs(3),
    textAlign: 'right',
  },

  // Items Count - Figma: fontSize:11, opacity:0.4
  itemsCount: {
    fontSize: ms(11),
    fontFamily: Fonts.primary,
    fontWeight: '500',
    color: 'rgba(30, 30, 30, 0.4)',
    lineHeight: ms(13.53),
    marginBottom: vs(4),
    textAlign: 'right',
  },

  // Total - Figma: fontSize:16, fontWeight:600, primary color
  total: {
    fontSize: ms(16),
    fontFamily: Fonts.primary,
    fontWeight: '600',
    color: Colors.primary,
    lineHeight: ms(19.68),
    textAlign: 'right',
  },

  // Loading State
  loadingContainer: {
    paddingVertical: vs(80),
    alignItems: 'center',
    justifyContent: 'center',
  },

  loadingText: {
    marginTop: vs(15),
    fontSize: ms(16),
    fontFamily: Fonts.primary,
    fontWeight: '500',
    color: 'rgba(30, 30, 30, 0.5)',
  },

  // Empty State
  emptyContainer: {
    paddingVertical: vs(80),
    paddingHorizontal: s(40),
    alignItems: 'center',
    justifyContent: 'center',
  },

  emptyIcon: {
    fontSize: ms(80),
    marginBottom: vs(20),
    opacity: 0.5,
  },

  emptyText: {
    fontSize: ms(18),
    fontFamily: Fonts.primary,
    fontWeight: '600',
    color: 'rgba(30, 30, 30, 0.5)',
    marginBottom: vs(10),
    textAlign: 'center',
  },

  emptySubtext: {
    fontSize: ms(14),
    fontFamily: Fonts.primary,
    fontWeight: '400',
    color: 'rgba(30, 30, 30, 0.4)',
    textAlign: 'center',
    lineHeight: ms(14) * 1.5,
    marginBottom: vs(20),
  },

  recordButton: {
    backgroundColor: Colors.primary,
    borderRadius: s(12),
    paddingVertical: vs(12),
    paddingHorizontal: s(24),
    marginTop: vs(10),
  },

  recordButtonText: {
    fontFamily: Fonts.primary,
    fontWeight: '600',
    fontSize: ms(14),
    color: Colors.white,
  },

  // Floating Action Button
  fab: {
    position: 'absolute',
    bottom: vs(30),
    right: s(20),
    width: s(60),
    height: s(60),
    borderRadius: s(30),
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },

  fabText: {
    fontSize: ms(32),
    color: Colors.white,
    fontWeight: '300',
  },
});

export default StoreOwnerReturnHistoryScreen;
