/**
 * RETURN HISTORY SCREEN
 * 
 * View and manage all customer returns
 * Features:
 * - Search by customer name or return number
 * - Filter by refund method
 * - Analytics summary
 * - Return details modal
 * - Delete returns
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
  Modal,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { auth } from '../../../../FirebaseConfig';
import { s, vs, ms } from '../../../../src/constants/responsive';
import { Colors } from '../../../../src/constants/Colors';
import { Fonts } from '../../../../src/constants/Fonts';
import {
  getReturns,
  deleteReturn,
} from '../../../../src/api/returns';
import { Return, RETURN_REASONS, REFUND_METHODS } from '../../../../src/models/Return';
import { getProductImageSource } from '../../../../src/lib/helpers/imageHelper';

type FilterRefundMethod = 'all' | 'cash' | 'wallet' | 'store_credit' | 'none';

const ReturnHistoryScreen = () => {
  const [returns, setReturns] = useState<Return[]>([]);
  const [filteredReturns, setFilteredReturns] = useState<Return[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRefundMethod, setFilterRefundMethod] = useState<FilterRefundMethod>('all');
  const [showFilter, setShowFilter] = useState(false);
  const [selectedReturn, setSelectedReturn] = useState<Return | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

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

      const data = await getReturns(currentUser.uid);
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

  const handleDeleteReturn = async (returnId: string) => {
    Alert.alert(
      'Delete Return?',
      'This will permanently delete this return record. Inventory will NOT be affected.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const result = await deleteReturn(returnId);
              
              if (result.success) {
                Alert.alert('Success', 'Return deleted');
                fetchReturns();
                setShowDetailsModal(false);
              } else {
                Alert.alert('Error', result.error || 'Failed to delete return');
              }
            } catch (error) {
              console.error('Error deleting return:', error);
              Alert.alert('Error', 'Failed to delete return');
            }
          }
        }
      ]
    );
  };

  const getReasonLabel = (reason: string) => {
    return RETURN_REASONS.find(r => r.value === reason)?.label || reason;
  };

  const getRefundMethodLabel = (method: string) => {
    return REFUND_METHODS.find(m => m.value === method)?.label || method;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const renderSummary = () => {
    const totalReturns = filteredReturns.length;
    const totalRefunded = filteredReturns.reduce((sum, r) => sum + r.totalRefund, 0);
    const sellableCount = filteredReturns.reduce((count, r) => 
      count + r.items.filter(item => item.condition === 'sellable').length, 0
    );

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
            <Text style={[styles.summaryValue, { color: Colors.primary }]}>{sellableCount}</Text>
            <Text style={styles.summaryLabel}>Restored</Text>
          </View>
        </View>
      </View>
    );
  };

  const renderReturnCard = (returnRecord: Return) => {
    const sellableItems = returnRecord.items.filter(item => item.condition === 'sellable').length;
    
    return (
      <TouchableOpacity
        key={returnRecord.id}
        style={styles.returnCard}
        onPress={() => {
          setSelectedReturn(returnRecord);
          setShowDetailsModal(true);
        }}
        activeOpacity={0.7}
      >
        <View style={styles.returnHeader}>
          <View style={styles.returnHeaderLeft}>
            <Text style={styles.returnNumber}>{returnRecord.returnNumber}</Text>
            <View style={styles.refundBadge}>
              <Text style={styles.refundBadgeText}>{getRefundMethodLabel(returnRecord.refundMethod)}</Text>
            </View>
          </View>
          <Text style={styles.returnDate}>{formatDate(returnRecord.createdAt)}</Text>
        </View>

        {returnRecord.customerName && (
          <View style={styles.customerRow}>
            <Text style={styles.customerLabel}>Customer: </Text>
            <Text style={styles.customerName}>{returnRecord.customerName}</Text>
          </View>
        )}

        <View style={styles.itemsRow}>
          <Text style={styles.itemsCount}>
            {returnRecord.items.length} item(s)
            {sellableItems > 0 && ` • ${sellableItems} restored`}
          </Text>
        </View>

        <View style={styles.returnFooter}>
          <Text style={styles.refundLabel}>Refund:</Text>
          <Text style={styles.refundAmount}>₱{returnRecord.totalRefund.toFixed(2)}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderDetailsModal = () => {
    if (!selectedReturn) return null;

    return (
      <Modal
        visible={showDetailsModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowDetailsModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.detailsModal}>
            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Header */}
              <View style={styles.modalHeader}>
                <View>
                  <Text style={styles.modalTitle}>{selectedReturn.returnNumber}</Text>
                  <View style={styles.refundBadge}>
                    <Text style={styles.refundBadgeText}>{getRefundMethodLabel(selectedReturn.refundMethod)}</Text>
                  </View>
                </View>
                <TouchableOpacity
                  onPress={() => setShowDetailsModal(false)}
                  style={styles.closeButton}
                  activeOpacity={0.7}
                >
                  <Text style={styles.closeButtonText}>✕</Text>
                </TouchableOpacity>
              </View>

              {/* Return Info */}
              <View style={styles.infoSection}>
                <Text style={styles.infoLabel}>Return Date</Text>
                <Text style={styles.infoValue}>{formatDate(selectedReturn.createdAt)}</Text>

                {selectedReturn.customerName && (
                  <>
                    <Text style={[styles.infoLabel, { marginTop: vs(12) }]}>Customer</Text>
                    <Text style={styles.infoValue}>{selectedReturn.customerName}</Text>
                  </>
                )}

                {selectedReturn.orderNumber && (
                  <>
                    <Text style={[styles.infoLabel, { marginTop: vs(12) }]}>Order Number</Text>
                    <Text style={styles.infoValue}>{selectedReturn.orderNumber}</Text>
                  </>
                )}

                {selectedReturn.notes && (
                  <>
                    <Text style={[styles.infoLabel, { marginTop: vs(12) }]}>Notes</Text>
                    <Text style={styles.infoValue}>{selectedReturn.notes}</Text>
                  </>
                )}
              </View>

              {/* Items */}
              <Text style={styles.sectionTitle}>Returned Items</Text>
              {selectedReturn.items.map((item, index) => {
                const imageSource = getProductImageSource(
                  item.productImageUrl,
                  item.productImage
                );
                
                return (
                  <View key={index} style={styles.itemCard}>
                    {imageSource ? (
                      <Image source={imageSource} style={styles.itemImage} />
                    ) : (
                      <View style={[styles.itemImage, styles.itemImagePlaceholder]}>
                        <Text style={styles.placeholderText}>No Image</Text>
                      </View>
                    )}
                    <View style={styles.itemInfo}>
                    <Text style={styles.itemName}>{item.productName}</Text>
                    <Text style={styles.itemSize}>{item.productSize} {item.unit}</Text>
                    <Text style={styles.itemReason}>
                      Reason: {getReasonLabel(item.reason)}
                    </Text>
                    <Text style={[
                      styles.itemCondition,
                      { color: item.condition === 'sellable' ? Colors.primary : '#E92B45' }
                    ]}>
                      {item.condition === 'sellable' ? '✓ Sellable' : '✗ Unsellable'}
                    </Text>
                    {item.notes && (
                      <Text style={styles.itemNotes}>Note: {item.notes}</Text>
                    )}
                  </View>
                  <View style={styles.itemRight}>
                    <Text style={styles.itemQuantity}>×{item.quantity}</Text>
                      <Text style={styles.itemRefund}>₱{item.refundAmount.toFixed(2)}</Text>
                    </View>
                  </View>
                );
              })}

              {/* Total */}
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Total Refund</Text>
                <Text style={styles.totalValue}>₱{selectedReturn.totalRefund.toFixed(2)}</Text>
              </View>

              {/* Delete Button */}
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => handleDeleteReturn(selectedReturn.id)}
                activeOpacity={0.7}
              >
                <Text style={styles.deleteButtonText}>Delete Return</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.backgroundGray} />

      {/* Header */}
      <View style={styles.headerContainer}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <Image
            source={require('../../../../src/assets/images/store-product/chevron-left.png')}
            style={styles.backIcon}
          />
        </TouchableOpacity>
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
            <Ionicons
              name="search"
              size={s(20)}
              color="rgba(30, 30, 30, 0.5)"
              style={styles.searchIcon}
            />
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
            {(['all', 'cash', 'wallet', 'store_credit', 'none'] as FilterRefundMethod[]).map(method => (
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
          <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: vs(40) }} />
        ) : filteredReturns.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>
              {searchQuery || filterRefundMethod !== 'all' 
                ? 'No returns found'
                : 'No returns yet'}
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
          filteredReturns.map(returnRecord => renderReturnCard(returnRecord))
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

      {/* Details Modal */}
      {renderDetailsModal()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundGray,
  },

  headerContainer: {
    backgroundColor: Colors.backgroundGray,
    paddingTop: vs(79),
    paddingBottom: vs(20),
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },

  backButton: {
    position: 'absolute',
    left: s(20),
    top: vs(79),
    width: s(30),
    height: vs(30),
    borderRadius: s(20),
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: 'rgba(0, 0, 0, 0.25)',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 4,
    zIndex: 10,
  },

  backIcon: {
    width: s(15),
    height: vs(15),
  },

  title: {
    fontFamily: Fonts.primary,
    fontWeight: '600',
    fontSize: ms(20),
    lineHeight: vs(22),
    color: Colors.darkGray,
  },

  scrollContent: {
    paddingHorizontal: s(20),
    paddingBottom: vs(100),
  },

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
  },

  searchIcon: {
    width: s(20),
    height: s(20),
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
    backgroundColor: '#EF5350',
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

  returnCard: {
    backgroundColor: Colors.white,
    borderRadius: s(16),
    padding: s(15),
    marginBottom: vs(12),
    shadowColor: 'rgba(0, 0, 0, 0.15)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 3,
  },

  returnHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: vs(10),
  },

  returnHeaderLeft: {
    flex: 1,
  },

  returnNumber: {
    fontFamily: Fonts.primary,
    fontWeight: '700',
    fontSize: ms(16),
    color: Colors.darkGray,
    marginBottom: vs(6),
  },

  refundBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: s(10),
    paddingVertical: vs(4),
    borderRadius: s(12),
    backgroundColor: Colors.primary,
  },

  refundBadgeText: {
    fontFamily: Fonts.primary,
    fontSize: ms(11),
    color: Colors.white,
    fontWeight: '600',
  },

  returnDate: {
    fontFamily: Fonts.primary,
    fontSize: ms(12),
    color: Colors.textSecondary,
  },

  customerRow: {
    flexDirection: 'row',
    marginBottom: vs(10),
  },

  customerLabel: {
    fontFamily: Fonts.primary,
    fontSize: ms(13),
    color: Colors.textSecondary,
  },

  customerName: {
    fontFamily: Fonts.primary,
    fontSize: ms(13),
    color: Colors.darkGray,
    fontWeight: '500',
  },

  itemsRow: {
    marginBottom: vs(10),
  },

  itemsCount: {
    fontFamily: Fonts.primary,
    fontSize: ms(13),
    color: Colors.textSecondary,
  },

  returnFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.05)',
    paddingTop: vs(10),
  },

  refundLabel: {
    fontFamily: Fonts.primary,
    fontSize: ms(13),
    color: Colors.textSecondary,
  },

  refundAmount: {
    fontFamily: Fonts.primary,
    fontWeight: '700',
    fontSize: ms(18),
    color: Colors.primary,
  },

  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: vs(60),
  },

  emptyStateText: {
    fontFamily: Fonts.primary,
    fontSize: ms(14),
    color: Colors.textSecondary,
    marginBottom: vs(20),
  },

  recordButton: {
    backgroundColor: Colors.primary,
    borderRadius: s(12),
    paddingVertical: vs(12),
    paddingHorizontal: s(24),
  },

  recordButtonText: {
    fontFamily: Fonts.primary,
    fontWeight: '600',
    fontSize: ms(14),
    color: Colors.white,
  },

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

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },

  detailsModal: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: s(20),
    borderTopRightRadius: s(20),
    paddingTop: vs(20),
    paddingHorizontal: s(20),
    paddingBottom: vs(30),
    maxHeight: '90%',
  },

  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: vs(20),
  },

  modalTitle: {
    fontFamily: Fonts.primary,
    fontWeight: '700',
    fontSize: ms(20),
    color: Colors.darkGray,
    marginBottom: vs(8),
  },

  closeButton: {
    width: s(30),
    height: s(30),
    borderRadius: s(15),
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  closeButtonText: {
    fontSize: ms(20),
    fontWeight: '600',
    color: Colors.textSecondary,
  },

  infoSection: {
    backgroundColor: 'rgba(59, 183, 126, 0.08)',
    borderRadius: s(12),
    padding: s(15),
    marginBottom: vs(20),
  },

  infoLabel: {
    fontFamily: Fonts.primary,
    fontSize: ms(12),
    color: Colors.textSecondary,
    marginBottom: vs(4),
  },

  infoValue: {
    fontFamily: Fonts.primary,
    fontSize: ms(14),
    color: Colors.darkGray,
    fontWeight: '500',
  },

  sectionTitle: {
    fontFamily: Fonts.primary,
    fontWeight: '600',
    fontSize: ms(16),
    color: Colors.darkGray,
    marginBottom: vs(12),
  },

  itemCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(0, 0, 0, 0.02)',
    borderRadius: s(12),
    padding: s(12),
    marginBottom: vs(10),
  },

  itemImage: {
    width: s(60),
    height: s(60),
    borderRadius: s(8),
    marginRight: s(12),
  },

  itemImagePlaceholder: {
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
  },

  placeholderText: {
    fontFamily: Fonts.primary,
    fontSize: ms(10),
    color: Colors.textSecondary,
  },

  itemInfo: {
    flex: 1,
  },

  itemName: {
    fontFamily: Fonts.primary,
    fontWeight: '600',
    fontSize: ms(14),
    color: Colors.darkGray,
    marginBottom: vs(2),
  },

  itemSize: {
    fontFamily: Fonts.primary,
    fontSize: ms(11),
    color: Colors.textSecondary,
    marginBottom: vs(2),
  },

  itemReason: {
    fontFamily: Fonts.primary,
    fontSize: ms(12),
    color: Colors.textSecondary,
    marginBottom: vs(2),
  },

  itemCondition: {
    fontFamily: Fonts.primary,
    fontSize: ms(12),
    fontWeight: '600',
    marginBottom: vs(2),
  },

  itemNotes: {
    fontFamily: Fonts.primary,
    fontSize: ms(11),
    color: Colors.textSecondary,
    fontStyle: 'italic',
  },

  itemRight: {
    alignItems: 'flex-end',
  },

  itemQuantity: {
    fontFamily: Fonts.primary,
    fontSize: ms(14),
    color: Colors.darkGray,
    marginBottom: vs(4),
  },

  itemRefund: {
    fontFamily: Fonts.primary,
    fontWeight: '600',
    fontSize: ms(14),
    color: Colors.primary,
  },

  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    borderRadius: s(12),
    padding: s(15),
    marginTop: vs(10),
    marginBottom: vs(20),
  },

  totalLabel: {
    fontFamily: Fonts.primary,
    fontWeight: '600',
    fontSize: ms(16),
    color: Colors.white,
  },

  totalValue: {
    fontFamily: Fonts.primary,
    fontWeight: '700',
    fontSize: ms(22),
    color: Colors.white,
  },

  deleteButton: {
    backgroundColor: 'rgba(239, 83, 80, 0.1)',
    borderWidth: 1,
    borderColor: '#EF5350',
    borderRadius: s(12),
    paddingVertical: vs(12),
    alignItems: 'center',
  },

  deleteButtonText: {
    fontFamily: Fonts.primary,
    fontWeight: '600',
    fontSize: ms(14),
    color: '#EF5350',
  },
});

export default ReturnHistoryScreen;
