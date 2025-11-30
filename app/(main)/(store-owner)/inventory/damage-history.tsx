/**
 * DAMAGE HISTORY SCREEN
 * 
 * View all recorded damages and spoilages
 * Features:
 * - Chronological list of damage records
 * - Total losses calculation
 * - Detailed view of each damage record
 * - Filter by reason (expired, damaged, spoiled, broken)
 * - Date range filtering
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  RefreshControl,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { auth } from '@/lib/firebase';
import { getDamages } from '../../../../src/api/damages';
import { Damage, DamageReason, DAMAGE_REASONS } from '../../../../src/models/Damage';
import { Colors } from '../../../../src/constants/Colors';
import { Fonts } from '../../../../src/constants/Fonts';
import { s, vs, ms } from '../../../../src/constants/responsive';
import { getProductImageSource } from '../../../../src/lib/helpers/imageHelper';

export default function DamageHistoryScreen() {
  const params = useLocalSearchParams();
  const fromInventory = params.fromInventory as string | undefined; // Track if coming from inventory
  const fromProfile = params.fromProfile as string | undefined; // Track if coming from profile

  const [damages, setDamages] = useState<Damage[]>([]);
  const [filteredDamages, setFilteredDamages] = useState<Damage[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedDamage, setSelectedDamage] = useState<Damage | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<DamageReason | 'all'>('all');

  useEffect(() => {
    fetchDamages();
  }, []);

  useEffect(() => {
    if (selectedFilter === 'all') {
      setFilteredDamages(damages);
    } else {
      setFilteredDamages(
        damages.filter(damage =>
          damage.items.some(item => item.reason === selectedFilter)
        )
      );
    }
  }, [damages, selectedFilter]);

  const fetchDamages = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      const damagesData = await getDamages(user.uid);
      setDamages(damagesData);
    } catch (error) {
      console.error('Error fetching damages:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchDamages();
  };

  const calculateTotalLoss = () => {
    return filteredDamages.reduce((sum, d) => sum + d.totalLoss, 0);
  };

  const calculateTotalItems = () => {
    return filteredDamages.reduce(
      (sum, d) => sum + d.items.reduce((itemSum, item) => itemSum + item.quantity, 0),
      0
    );
  };

  const getReasonColor = (reason: DamageReason) => {
    switch (reason) {
      case 'expired':
        return '#E92B45';
      case 'damaged':
        return '#FF9800';
      case 'spoiled':
        return '#9C27B0';
      case 'broken':
        return '#607D8B';
      default:
        return Colors.textSecondary;
    }
  };

  const getReasonIcon = (reason: DamageReason) => {
    switch (reason) {
      case 'expired':
        return '⏰';
      case 'damaged':
        return '💥';
      case 'spoiled':
        return '🦠';
      case 'broken':
        return '🔨';
      default:
        return '❌';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Image
            source={require('../../../../src/assets/images/store-owner-profile/chevron-left.png')}
            style={styles.backIcon}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Damage History</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => router.push('/(main)/(store-owner)/inventory/record-damage')}
          activeOpacity={0.7}
        >
          <Text style={styles.addButtonText}>+</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />
        }
      >
        {/* Summary Card */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>📊 Summary</Text>

          <View style={styles.summaryStats}>
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: '#E92B45' }]} numberOfLines={1}>
                {filteredDamages.length}
              </Text>
              <Text style={styles.statLabel}>Records</Text>
            </View>

            <View style={styles.statDivider} />

            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: '#FF9800' }]} numberOfLines={1}>
                {calculateTotalItems()}
              </Text>
              <Text style={styles.statLabel}>Total Items</Text>
            </View>

            <View style={styles.statDivider} />

            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: '#E92B45' }]} numberOfLines={1} adjustsFontSizeToFit>
                ₱{calculateTotalLoss().toFixed(2)}
              </Text>
              <Text style={styles.statLabel}>Total Loss</Text>
            </View>
          </View>
        </View>

        {/* Filter Tabs */}
        <View style={styles.filterSection}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
            <TouchableOpacity
              style={[styles.filterTab, selectedFilter === 'all' && styles.filterTabActive]}
              onPress={() => setSelectedFilter('all')}
            >
              <Text style={[styles.filterText, selectedFilter === 'all' && styles.filterTextActive]}>
                All
              </Text>
            </TouchableOpacity>

            {DAMAGE_REASONS.map((reason) => (
              <TouchableOpacity
                key={reason.value}
                style={[styles.filterTab, selectedFilter === reason.value && styles.filterTabActive]}
                onPress={() => setSelectedFilter(reason.value)}
              >
                <Text style={[styles.filterText, selectedFilter === reason.value && styles.filterTextActive]}>
                  {getReasonIcon(reason.value)} {reason.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Damage Records List */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.primary} />
            <Text style={styles.loadingText}>Loading damage records...</Text>
          </View>
        ) : filteredDamages.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📋</Text>
            <Text style={styles.emptyTitle}>No Damage Records</Text>
            <Text style={styles.emptyText}>
              {selectedFilter === 'all'
                ? 'No damages or spoilages have been recorded yet.'
                : `No ${selectedFilter} items found.`}
            </Text>
          </View>
        ) : (
          <>
            <Text style={styles.sectionTitle}>
              {filteredDamages.length} Record{filteredDamages.length !== 1 ? 's' : ''}
            </Text>

            {filteredDamages.map((damage) => (
              <TouchableOpacity
                key={damage.id}
                style={styles.damageCard}
                onPress={() => {
                  setSelectedDamage(damage);
                  setShowDetailsModal(true);
                }}
                activeOpacity={0.7}
              >
                {/* Header Row */}
                <View style={styles.cardHeader}>
                  <View style={styles.dateContainer}>
                    <Text style={styles.dateText}>{formatDate(damage.createdAt)}</Text>
                    <Text style={styles.timeText}>{formatTime(damage.createdAt)}</Text>
                  </View>
                  <View style={styles.lossContainer}>
                    <Text style={styles.lossLabel}>Loss</Text>
                    <Text style={styles.lossAmount}>₱{damage.totalLoss.toFixed(2)}</Text>
                  </View>
                </View>

                {/* Items Preview */}
                <View style={styles.itemsPreview}>
                  <Text style={styles.itemsCount}>
                    {damage.items.length} Item{damage.items.length !== 1 ? 's' : ''}
                  </Text>
                  <View style={styles.reasonBadges}>
                    {Array.from(new Set(damage.items.map(item => item.reason))).map((reason) => (
                      <View
                        key={reason}
                        style={[styles.reasonBadge, { backgroundColor: getReasonColor(reason) + '20' }]}
                      >
                        <Text style={[styles.reasonBadgeText, { color: getReasonColor(reason) }]}>
                          {getReasonIcon(reason)} {reason}
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>

                {/* Products List with Images */}
                <View style={styles.productsPreview}>
                  {damage.items.slice(0, 2).map((item, index) => (
                    <View key={index} style={styles.productRowWithImage}>
                      {/* Product Image */}
                      <View style={styles.productImageWrapper}>
                        {getProductImageSource(item) ? (
                          <Image
                            source={getProductImageSource(item)!}
                            style={styles.productImageSmall}
                            resizeMode="cover"
                          />
                        ) : (
                          <View style={[styles.productImageSmall, styles.placeholderImage]}>
                            <Text style={styles.placeholderIcon}>📦</Text>
                          </View>
                        )}
                      </View>
                      
                      {/* Product Info */}
                      <View style={styles.productInfo}>
                        <Text style={styles.productName} numberOfLines={1}>
                          {item.productName}
                        </Text>
                        <Text style={styles.productQuantity}>×{item.quantity} units</Text>
                      </View>
                    </View>
                  ))}
                  {damage.items.length > 2 && (
                    <Text style={styles.moreItems}>
                      +{damage.items.length - 2} more item{damage.items.length - 2 !== 1 ? 's' : ''}
                    </Text>
                  )}
                </View>

                {/* View Details Arrow */}
                <View style={styles.viewDetailsRow}>
                  <Text style={styles.viewDetailsText}>View Details</Text>
                  <Text style={styles.arrowIcon}>›</Text>
                </View>
              </TouchableOpacity>
            ))}
          </>
        )}

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Details Modal */}
      <Modal
        visible={showDetailsModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowDetailsModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Damage Details</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowDetailsModal(false)}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {selectedDamage && (
                <>
                  {/* Date & Loss */}
                  <View style={styles.modalSection}>
                    <View style={styles.modalRow}>
                      <Text style={styles.modalLabel}>Date</Text>
                      <Text style={styles.modalValue}>
                        {formatDate(selectedDamage.createdAt)} at {formatTime(selectedDamage.createdAt)}
                      </Text>
                    </View>
                    <View style={styles.modalRow}>
                      <Text style={styles.modalLabel}>Total Loss</Text>
                      <Text style={[styles.modalValue, { color: '#E92B45', fontWeight: '700' }]}>
                        ₱{selectedDamage.totalLoss.toFixed(2)}
                      </Text>
                    </View>
                  </View>

                  {/* Items */}
                  <Text style={styles.modalSectionTitle}>Items ({selectedDamage.items.length})</Text>
                  {selectedDamage.items.map((item, index) => (
                    <View key={index} style={styles.modalItemCard}>
                      <View style={styles.modalItemRow}>
                        {/* Product Image */}
                        <View style={styles.modalProductImageWrapper}>
                          {getProductImageSource(item) ? (
                            <Image
                              source={getProductImageSource(item)!}
                              style={styles.modalProductImage}
                              resizeMode="cover"
                            />
                          ) : (
                            <View style={[styles.modalProductImage, styles.modalPlaceholderImage]}>
                              <Text style={styles.modalPlaceholderIcon}>📦</Text>
                            </View>
                          )}
                        </View>

                        {/* Product Info */}
                        <View style={styles.modalProductInfo}>
                          <View style={styles.modalItemHeader}>
                            <Text style={styles.modalItemName}>{item.productName}</Text>
                            <View
                              style={[
                                styles.modalReasonBadge,
                                { backgroundColor: getReasonColor(item.reason) + '20' },
                              ]}
                            >
                              <Text style={[styles.modalReasonText, { color: getReasonColor(item.reason) }]}>
                                {getReasonIcon(item.reason)} {item.reason}
                              </Text>
                            </View>
                          </View>

                          <View style={styles.modalItemDetails}>
                            <View style={styles.modalDetailRow}>
                              <Text style={styles.modalItemLabel}>Quantity:</Text>
                              <Text style={styles.modalItemValue}>{item.quantity} units</Text>
                            </View>
                            <View style={styles.modalDetailRow}>
                              <Text style={styles.modalItemLabel}>Loss:</Text>
                              <Text style={[styles.modalItemValue, { color: '#E92B45', fontWeight: '600' }]}>
                                ₱{item.totalLoss.toFixed(2)}
                              </Text>
                            </View>
                          </View>
                        </View>
                      </View>

                      {item.notes && (
                        <View style={styles.notesContainer}>
                          <Text style={styles.notesLabel}>Notes:</Text>
                          <Text style={styles.notesText}>{item.notes}</Text>
                        </View>
                      )}
                    </View>
                  ))}
                </>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundGray,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: s(20),
    paddingTop: vs(60),
    paddingBottom: vs(20),
    backgroundColor: Colors.backgroundGray,
  },
  backButton: {
    width: s(30),
    height: s(30),
    borderRadius: s(20),
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: 'rgba(0, 0, 0, 0.25)',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 4,
  },
  backIcon: {
    width: s(15),
    height: s(15),
  },
  headerTitle: {
    fontFamily: Fonts.primary,
    fontWeight: '600',
    fontSize: ms(18),
    color: Colors.darkGray,
  },
  placeholder: {
    width: s(30),
  },
  addButton: {
    width: s(40),
    height: s(40),
    borderRadius: s(20),
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: 'rgba(59, 183, 126, 0.4)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 4,
  },
  addButtonText: {
    fontSize: ms(24),
    color: Colors.white,
    fontWeight: '700',
    marginTop: -2,
  },
  scrollView: {
    flex: 1,
  },
  summaryCard: {
    backgroundColor: Colors.white,
    borderRadius: s(16),
    marginHorizontal: s(20),
    marginTop: vs(20),
    padding: s(20),
    shadowColor: 'rgba(0, 0, 0, 0.1)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 4,
  },
  summaryTitle: {
    fontFamily: Fonts.primary,
    fontWeight: '700',
    fontSize: ms(18),
    color: Colors.darkGray,
    marginBottom: vs(16),
  },
  summaryStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
    paddingHorizontal: s(4),
  },
  statNumber: {
    fontFamily: Fonts.primary,
    fontWeight: '700',
    fontSize: ms(20),
    marginBottom: vs(4),
    textAlign: 'center',
  },
  statLabel: {
    fontFamily: Fonts.primary,
    fontWeight: '500',
    fontSize: ms(11),
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  statDivider: {
    width: 1,
    height: vs(40),
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },
  filterSection: {
    marginTop: vs(20),
    paddingLeft: s(20),
  },
  filterScroll: {
    flexDirection: 'row',
  },
  filterTab: {
    paddingHorizontal: s(16),
    paddingVertical: vs(8),
    borderRadius: s(20),
    backgroundColor: Colors.white,
    marginRight: s(10),
    borderWidth: 1,
    borderColor: '#E8E8E8',
  },
  filterTabActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterText: {
    fontFamily: Fonts.primary,
    fontSize: ms(13),
    color: Colors.darkGray,
    fontWeight: '500',
  },
  filterTextActive: {
    color: Colors.white,
    fontWeight: '600',
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: vs(60),
  },
  loadingText: {
    fontFamily: Fonts.primary,
    fontSize: ms(14),
    color: Colors.textSecondary,
    marginTop: vs(16),
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: vs(60),
    paddingHorizontal: s(40),
  },
  emptyIcon: {
    fontSize: ms(64),
    marginBottom: vs(16),
  },
  emptyTitle: {
    fontFamily: Fonts.primary,
    fontWeight: '700',
    fontSize: ms(20),
    color: Colors.darkGray,
    marginBottom: vs(8),
  },
  emptyText: {
    fontFamily: Fonts.primary,
    fontSize: ms(14),
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: vs(20),
  },
  sectionTitle: {
    fontFamily: Fonts.primary,
    fontWeight: '600',
    fontSize: ms(16),
    color: Colors.darkGray,
    marginHorizontal: s(20),
    marginTop: vs(24),
    marginBottom: vs(12),
  },
  damageCard: {
    backgroundColor: Colors.white,
    borderRadius: s(16),
    marginHorizontal: s(20),
    marginBottom: vs(16),
    padding: s(16),
    shadowColor: 'rgba(0, 0, 0, 0.1)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: vs(12),
  },
  dateContainer: {
    flex: 1,
  },
  dateText: {
    fontFamily: Fonts.primary,
    fontWeight: '600',
    fontSize: ms(15),
    color: Colors.darkGray,
  },
  timeText: {
    fontFamily: Fonts.primary,
    fontSize: ms(12),
    color: Colors.textSecondary,
    marginTop: vs(2),
  },
  lossContainer: {
    alignItems: 'flex-end',
  },
  lossLabel: {
    fontFamily: Fonts.primary,
    fontSize: ms(11),
    color: Colors.textSecondary,
  },
  lossAmount: {
    fontFamily: Fonts.primary,
    fontWeight: '700',
    fontSize: ms(16),
    color: '#E92B45',
    marginTop: vs(2),
  },
  itemsPreview: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: vs(12),
    paddingBottom: vs(12),
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  itemsCount: {
    fontFamily: Fonts.primary,
    fontSize: ms(13),
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  reasonBadges: {
    flexDirection: 'row',
    gap: s(6),
  },
  reasonBadge: {
    paddingHorizontal: s(8),
    paddingVertical: vs(4),
    borderRadius: s(12),
  },
  reasonBadgeText: {
    fontFamily: Fonts.primary,
    fontSize: ms(11),
    fontWeight: '600',
  },
  productsPreview: {
    marginBottom: vs(12),
  },
  productRowWithImage: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: vs(10),
  },
  productImageWrapper: {
    marginRight: s(12),
  },
  productImageSmall: {
    width: s(50),
    height: s(50),
    borderRadius: s(8),
  },
  placeholderImage: {
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderIcon: {
    fontSize: ms(20),
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontFamily: Fonts.primary,
    fontSize: ms(13),
    fontWeight: '600',
    color: Colors.darkGray,
    marginBottom: vs(2),
  },
  productQuantity: {
    fontFamily: Fonts.primary,
    fontSize: ms(12),
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  moreItems: {
    fontFamily: Fonts.primary,
    fontSize: ms(12),
    color: Colors.textSecondary,
    fontStyle: 'italic',
    marginTop: vs(4),
  },
  viewDetailsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingTop: vs(8),
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  viewDetailsText: {
    fontFamily: Fonts.primary,
    fontSize: ms(13),
    color: Colors.primary,
    fontWeight: '600',
  },
  arrowIcon: {
    fontSize: ms(20),
    color: Colors.primary,
    marginLeft: s(4),
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: s(24),
    borderTopRightRadius: s(24),
    maxHeight: '85%',
    paddingBottom: vs(40),
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: s(20),
    paddingTop: vs(24),
    paddingBottom: vs(16),
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  modalTitle: {
    fontFamily: Fonts.primary,
    fontWeight: '700',
    fontSize: ms(20),
    color: Colors.darkGray,
  },
  closeButton: {
    width: s(32),
    height: s(32),
    borderRadius: s(16),
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: ms(20),
    color: Colors.textSecondary,
  },
  modalSection: {
    paddingHorizontal: s(20),
    paddingTop: vs(20),
    paddingBottom: vs(12),
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  modalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: vs(12),
  },
  modalLabel: {
    fontFamily: Fonts.primary,
    fontSize: ms(14),
    color: Colors.textSecondary,
  },
  modalValue: {
    fontFamily: Fonts.primary,
    fontSize: ms(14),
    color: Colors.darkGray,
    fontWeight: '600',
  },
  modalSectionTitle: {
    fontFamily: Fonts.primary,
    fontWeight: '700',
    fontSize: ms(16),
    color: Colors.darkGray,
    marginHorizontal: s(20),
    marginTop: vs(20),
    marginBottom: vs(12),
  },
  modalItemCard: {
    backgroundColor: '#F8F9FA',
    borderRadius: s(12),
    marginHorizontal: s(20),
    marginBottom: vs(12),
    padding: s(14),
  },
  modalItemRow: {
    flexDirection: 'row',
    marginBottom: vs(10),
  },
  modalProductImageWrapper: {
    marginRight: s(12),
  },
  modalProductImage: {
    width: s(70),
    height: s(70),
    borderRadius: s(10),
  },
  modalPlaceholderImage: {
    backgroundColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalPlaceholderIcon: {
    fontSize: ms(28),
  },
  modalProductInfo: {
    flex: 1,
  },
  modalItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: vs(8),
  },
  modalItemName: {
    fontFamily: Fonts.primary,
    fontWeight: '600',
    fontSize: ms(14),
    color: Colors.darkGray,
    flex: 1,
    marginRight: s(8),
  },
  modalReasonBadge: {
    paddingHorizontal: s(10),
    paddingVertical: vs(4),
    borderRadius: s(12),
  },
  modalReasonText: {
    fontFamily: Fonts.primary,
    fontSize: ms(11),
    fontWeight: '600',
  },
  modalItemDetails: {
    marginTop: vs(4),
  },
  modalDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: vs(4),
  },
  modalItemLabel: {
    fontFamily: Fonts.primary,
    fontSize: ms(13),
    color: Colors.textSecondary,
  },
  modalItemValue: {
    fontFamily: Fonts.primary,
    fontSize: ms(13),
    color: Colors.darkGray,
    fontWeight: '500',
  },
  notesContainer: {
    marginTop: vs(8),
    paddingTop: vs(8),
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.05)',
  },
  notesLabel: {
    fontFamily: Fonts.primary,
    fontSize: ms(12),
    color: Colors.textSecondary,
    marginBottom: vs(4),
  },
  notesText: {
    fontFamily: Fonts.primary,
    fontSize: ms(13),
    color: Colors.darkGray,
    lineHeight: vs(18),
  },
  bottomSpacer: {
    height: vs(40),
  },
});
