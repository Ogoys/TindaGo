/**
 * PURCHASE ORDER HISTORY SCREEN
 * 
 * View and manage all purchase orders
 * Features:
 * - Search by supplier name or PO number
 * - Filter by status (pending/received/cancelled)
 * - Mark orders as received (updates inventory)
 * - View order details
 * - Analytics summary
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
import { router, useLocalSearchParams } from 'expo-router';
import { auth } from '../../../../FirebaseConfig';
import { s, vs, ms } from '../../../../src/constants/responsive';
import { Colors } from '../../../../src/constants/Colors';
import { Fonts } from '../../../../src/constants/Fonts';
import {
  getPurchaseOrders,
  markAsReceived,
  updatePurchaseOrderStatus,
  deletePurchaseOrder,
} from '../../../../src/api/purchaseOrders';
import { PurchaseOrder, PurchaseOrderItem } from '../../../../src/models/PurchaseOrder';
import { getProductImageSource } from '../../../../src/lib/helpers/imageHelper';

type FilterStatus = 'all' | 'pending' | 'received' | 'cancelled';
type PaymentFilter = 'all' | 'paid' | 'unpaid' | 'overdue';

const PurchaseOrderHistoryScreen = () => {
  const params = useLocalSearchParams();
  const supplierParam = params.supplier as string | undefined;

  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<PurchaseOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState(supplierParam || '');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [paymentFilter, setPaymentFilter] = useState<PaymentFilter>('all');
  const [showFilter, setShowFilter] = useState(false);
  const [showPaymentFilter, setShowPaymentFilter] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<PurchaseOrder | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  useEffect(() => {
    fetchPurchaseOrders();
  }, []);

  // Update search query when supplier param changes
  useEffect(() => {
    if (supplierParam) {
      setSearchQuery(supplierParam);
    }
  }, [supplierParam]);

  useEffect(() => {
    applyFilters();
  }, [purchaseOrders, searchQuery, filterStatus, paymentFilter]);

  const fetchPurchaseOrders = async () => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) return;

      const orders = await getPurchaseOrders(currentUser.uid);
      setPurchaseOrders(orders);
    } catch (error) {
      console.error('Error fetching purchase orders:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...purchaseOrders];

    // Status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(order => order.status === filterStatus);
    }

    // Payment filter
    if (paymentFilter !== 'all') {
      filtered = filtered.filter(order => {
        const paymentStatus = getPaymentStatus(order);
        return paymentStatus === paymentFilter;
      });
    }

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(order => 
        order.purchaseOrderNumber.toLowerCase().includes(query) ||
        order.supplierName?.toLowerCase().includes(query)
      );
    }

    setFilteredOrders(filtered);
  };

  // Get payment status (paid, unpaid, or overdue)
  const getPaymentStatus = (order: PurchaseOrder): PaymentFilter => {
    if (order.paymentStatus === 'paid') return 'paid';
    if (order.paymentStatus === 'unpaid') {
      // Check if overdue
      if (order.debtDueDate) {
        const dueDate = new Date(order.debtDueDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        dueDate.setHours(0, 0, 0, 0);
        if (today > dueDate) {
          return 'overdue';
        }
      }
      return 'unpaid';
    }
    return 'paid'; // Default to paid for orders without payment status
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchPurchaseOrders();
  };

  const handleMarkAsReceived = async (order: PurchaseOrder) => {
    Alert.alert(
      'Mark as Received?',
      `This will add ${order.items.length} product(s) to your inventory. Continue?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Receive',
          onPress: async () => {
            try {
              const result = await markAsReceived(order.id);
              
              if (result.success) {
                Alert.alert('Success', 'Inventory updated successfully!');
                fetchPurchaseOrders();
                setShowDetailsModal(false);
              } else {
                Alert.alert('Error', result.error || 'Failed to update inventory');
              }
            } catch (error) {
              console.error('Error marking as received:', error);
              Alert.alert('Error', 'Failed to update inventory');
            }
          }
        }
      ]
    );
  };

  const handleCancelOrder = async (orderId: string) => {
    Alert.alert(
      'Cancel Order?',
      'Are you sure you want to cancel this purchase order?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: async () => {
            try {
              const result = await updatePurchaseOrderStatus(orderId, 'cancelled');
              
              if (result.success) {
                Alert.alert('Success', 'Purchase order cancelled');
                fetchPurchaseOrders();
                setShowDetailsModal(false);
              } else {
                Alert.alert('Error', result.error || 'Failed to cancel order');
              }
            } catch (error) {
              console.error('Error cancelling order:', error);
              Alert.alert('Error', 'Failed to cancel order');
            }
          }
        }
      ]
    );
  };

  const handleDeleteOrder = async (orderId: string) => {
    Alert.alert(
      'Delete Order?',
      'This will permanently delete this purchase order.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const result = await deletePurchaseOrder(orderId);
              
              if (result.success) {
                Alert.alert('Success', 'Purchase order deleted');
                fetchPurchaseOrders();
                setShowDetailsModal(false);
              } else {
                Alert.alert('Error', result.error || 'Failed to delete order');
              }
            } catch (error) {
              console.error('Error deleting order:', error);
              Alert.alert('Error', 'Failed to delete order');
            }
          }
        }
      ]
    );
  };

  const handleMarkAsPaid = async (order: PurchaseOrder) => {
    Alert.alert(
      'Mark as Paid?',
      `Mark payment of ₱${order.totalCost.toFixed(2)} to ${order.supplierName || 'supplier'} as paid?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Mark as Paid',
          onPress: async () => {
            try {
              const { ref, update } = await import('firebase/database');
              const { database } = await import('../../../../FirebaseConfig');
              const orderRef = ref(database, `purchase_orders/${order.id}`);
              await update(orderRef, {
                paymentStatus: 'paid',
                'paymentInfo/paidAt': new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              });
              Alert.alert('Success', 'Payment marked as paid');
              fetchPurchaseOrders();
              setShowDetailsModal(false);
            } catch (error) {
              console.error('Error marking as paid:', error);
              Alert.alert('Error', 'Failed to update payment status');
            }
          }
        }
      ]
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return '#FF9800';
      case 'received':
        return '#4CAF50';
      case 'cancelled':
        return '#EF5350';
      default:
        return Colors.textSecondary;
    }
  };

  const getStatusLabel = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const getPaymentStatusColor = (paymentStatus: PaymentFilter) => {
    switch (paymentStatus) {
      case 'paid':
        return '#4CAF50';
      case 'unpaid':
        return '#FF9800';
      case 'overdue':
        return '#E92B45';
      default:
        return Colors.textSecondary;
    }
  };

  const getPaymentStatusLabel = (paymentStatus: PaymentFilter) => {
    switch (paymentStatus) {
      case 'paid':
        return 'Paid';
      case 'unpaid':
        return 'Unpaid';
      case 'overdue':
        return 'Overdue';
      default:
        return 'Paid';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const renderSummary = () => {
    // Calculate totals from ALL orders (for overall stats)
    const allTotalSpent = purchaseOrders.reduce((sum, order) => sum + order.totalCost, 0);
    const allTotalOrders = purchaseOrders.length;
    const allPendingCount = purchaseOrders.filter(o => o.status === 'pending').length;
    const allReceivedCount = purchaseOrders.filter(o => o.status === 'received').length;
    const allUnpaidAmount = purchaseOrders
      .filter(o => o.paymentStatus === 'unpaid')
      .reduce((sum, order) => sum + order.totalCost, 0);
    const allOverdueCount = purchaseOrders.filter(o => getPaymentStatus(o) === 'overdue').length;

    // Calculate totals from filtered orders (for current view)
    const filteredTotalSpent = filteredOrders.reduce((sum, order) => sum + order.totalCost, 0);
    const filteredPendingCount = filteredOrders.filter(o => o.status === 'pending').length;
    const filteredReceivedCount = filteredOrders.filter(o => o.status === 'received').length;
    const filteredUnpaidAmount = filteredOrders
      .filter(o => o.paymentStatus === 'unpaid')
      .reduce((sum, order) => sum + order.totalCost, 0);
    const filteredOverdueCount = filteredOrders.filter(o => getPaymentStatus(o) === 'overdue').length;

    const isFiltered = searchQuery.trim() !== '' || filterStatus !== 'all' || paymentFilter !== 'all';

    return (
      <>
        {/* Overall Totals - Always shows all orders */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Overall Purchase Summary</Text>
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>₱{allTotalSpent.toFixed(2)}</Text>
              <Text style={styles.summaryLabel}>Total Spent</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>{allTotalOrders}</Text>
              <Text style={styles.summaryLabel}>Total Orders</Text>
            </View>
          </View>
          <View style={[styles.summaryRow, { marginTop: vs(10) }]}>
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryValue, { color: '#FF9800' }]}>{allPendingCount}</Text>
              <Text style={styles.summaryLabel}>Pending</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryValue, { color: '#4CAF50' }]}>{allReceivedCount}</Text>
              <Text style={styles.summaryLabel}>Received</Text>
            </View>
          </View>
          {allUnpaidAmount > 0 && (
            <View style={styles.unpaidSection}>
              <View style={styles.unpaidRow}>
                <Text style={styles.unpaidLabel}>💳 Unpaid Amount:</Text>
                <Text style={styles.unpaidAmount}>₱{allUnpaidAmount.toFixed(2)}</Text>
              </View>
              {allOverdueCount > 0 && (
                <Text style={styles.overdueWarning}>⚠️ {allOverdueCount} overdue payment{allOverdueCount > 1 ? 's' : ''}</Text>
              )}
            </View>
          )}
        </View>

        {/* Filtered Results Summary - Only shows when filtering is active */}
        {isFiltered && filteredOrders.length > 0 && (
          <View style={styles.filteredSummaryCard}>
            <Text style={styles.filteredSummaryTitle}>📊 Filtered Results</Text>
            <View style={styles.summaryRow}>
              <View style={styles.summaryItem}>
                <Text style={styles.filteredSummaryValue}>₱{filteredTotalSpent.toFixed(2)}</Text>
                <Text style={styles.summaryLabel}>Filtered Total</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={styles.filteredSummaryValue}>{filteredOrders.length}</Text>
                <Text style={styles.summaryLabel}>Orders Shown</Text>
              </View>
            </View>
            {filteredUnpaidAmount > 0 && (
              <View style={styles.unpaidRow}>
                <Text style={styles.unpaidLabel}>💳 Unpaid in Filter:</Text>
                <Text style={styles.unpaidAmount}>₱{filteredUnpaidAmount.toFixed(2)}</Text>
              </View>
            )}
          </View>
        )}
      </>
    );
  };

  const renderPurchaseOrderCard = (order: PurchaseOrder) => {
    const paymentStatus = getPaymentStatus(order);
    const paymentColor = getPaymentStatusColor(paymentStatus);
    const paymentLabel = getPaymentStatusLabel(paymentStatus);

    return (
      <TouchableOpacity
        key={order.id}
        style={styles.orderCard}
        onPress={() => {
          router.push(`/(main)/(store-owner)/profile/purchase-details?purchaseOrderId=${order.id}&fromHistory=true` as any);
        }}
        activeOpacity={0.7}
      >
        <View style={styles.orderHeader}>
          <View style={styles.orderHeaderLeft}>
            <Text style={styles.orderNumber}>{order.purchaseOrderNumber}</Text>
            <View style={styles.badgeRow}>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.status) }]}>
                <Text style={styles.statusText}>{getStatusLabel(order.status)}</Text>
              </View>
              {order.paymentMethod && (
                <View style={[styles.paymentBadge, { backgroundColor: paymentColor }]}>
                  <Text style={styles.paymentBadgeText}>{paymentLabel}</Text>
                </View>
              )}
            </View>
          </View>
          <Text style={styles.orderDate}>{formatDate(order.purchaseDate)}</Text>
        </View>

        {order.supplierName && (
          <View style={styles.supplierRow}>
            <Text style={styles.supplierLabel}>From: </Text>
            <Text style={styles.supplierName}>{order.supplierName}</Text>
          </View>
        )}

        {order.debtDueDate && paymentStatus === 'overdue' && (
          <Text style={styles.overdueText}>⚠️ Payment overdue since {formatDate(order.debtDueDate)}</Text>
        )}

        {order.debtDueDate && paymentStatus === 'unpaid' && (
          <Text style={styles.dueText}>Due: {formatDate(order.debtDueDate)}</Text>
        )}

        <View style={styles.orderFooter}>
          <Text style={styles.itemsCount}>{order.items.length} item(s)</Text>
          <Text style={styles.orderTotal}>₱{order.totalCost.toFixed(2)}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderDetailsModal = () => {
    if (!selectedOrder) return null;

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
                  <Text style={styles.modalTitle}>{selectedOrder.purchaseOrderNumber}</Text>
                  <View style={[styles.statusBadge, { backgroundColor: getStatusColor(selectedOrder.status) }]}>
                    <Text style={styles.statusText}>{getStatusLabel(selectedOrder.status)}</Text>
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

              {/* Purchase Info */}
              <View style={styles.infoSection}>
                <Text style={styles.infoLabel}>Purchase Date</Text>
                <Text style={styles.infoValue}>{formatDate(selectedOrder.purchaseDate)}</Text>

                {selectedOrder.supplierName && (
                  <>
                    <Text style={[styles.infoLabel, { marginTop: vs(12) }]}>Supplier</Text>
                    <Text style={styles.infoValue}>{selectedOrder.supplierName}</Text>
                  </>
                )}

                {selectedOrder.supplierContact && (
                  <>
                    <Text style={[styles.infoLabel, { marginTop: vs(12) }]}>Contact</Text>
                    <Text style={styles.infoValue}>{selectedOrder.supplierContact}</Text>
                  </>
                )}

                {selectedOrder.notes && (
                  <>
                    <Text style={[styles.infoLabel, { marginTop: vs(12) }]}>Notes</Text>
                    <Text style={styles.infoValue}>{selectedOrder.notes}</Text>
                  </>
                )}
              </View>

              {/* Items */}
              <Text style={styles.sectionTitle}>Items</Text>
              {selectedOrder.items.map((item, index) => {
                const imageSource = getProductImageSource({
                  productImageUrl: item.productImageUrl,
                  productImage: item.productImage
                });
                
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
                    <Text style={styles.itemCost}>
                      ₱{item.costPerUnit.toFixed(2)} × {item.quantity}
                    </Text>
                    </View>
                    <Text style={styles.itemSubtotal}>₱{item.subtotal.toFixed(2)}</Text>
                  </View>
                );
              })}

              {/* Total */}
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Total Cost</Text>
                <Text style={styles.totalValue}>₱{selectedOrder.totalCost.toFixed(2)}</Text>
              </View>

              {/* Payment Status */}
              {selectedOrder.paymentMethod && (
                <View style={styles.paymentStatusSection}>
                  <Text style={styles.paymentStatusLabel}>Payment Status:</Text>
                  <View style={[styles.paymentBadge, { backgroundColor: getPaymentStatusColor(getPaymentStatus(selectedOrder)) }]}>
                    <Text style={styles.paymentBadgeText}>{getPaymentStatusLabel(getPaymentStatus(selectedOrder))}</Text>
                  </View>
                </View>
              )}

              {/* Actions */}
              {selectedOrder.status === 'pending' && (
                <View style={styles.actionsContainer}>
                  <TouchableOpacity
                    style={styles.receiveButton}
                    onPress={() => handleMarkAsReceived(selectedOrder)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.receiveButtonText}>Mark as Received</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={() => handleCancelOrder(selectedOrder.id)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.cancelButtonText}>Cancel Order</Text>
                  </TouchableOpacity>
                </View>
              )}

              {/* Mark as Paid Button */}
              {selectedOrder.paymentStatus === 'unpaid' && (
                <TouchableOpacity
                  style={styles.markPaidButton}
                  onPress={() => handleMarkAsPaid(selectedOrder)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.markPaidButtonText}>✅ Mark as Paid</Text>
                </TouchableOpacity>
              )}

              {selectedOrder.status === 'pending' && (
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => handleDeleteOrder(selectedOrder.id)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.deleteButtonText}>Delete Order</Text>
                </TouchableOpacity>
              )}
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
        <Text style={styles.title}>Purchase History</Text>
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
              placeholder="Search PO# or supplier..."
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
            {filterStatus !== 'all' && <View style={styles.filterBadge} />}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.paymentFilterButton}
            onPress={() => setShowPaymentFilter(!showPaymentFilter)}
            activeOpacity={0.7}
          >
            <Text style={styles.paymentFilterIcon}>💳</Text>
            {paymentFilter !== 'all' && <View style={styles.filterBadge} />}
          </TouchableOpacity>
        </View>

        {/* Status Filter Options */}
        {showFilter && (
          <View style={styles.filterOptions}>
            {(['all', 'pending', 'received', 'cancelled'] as FilterStatus[]).map(status => (
              <TouchableOpacity
                key={status}
                style={[
                  styles.filterOption,
                  filterStatus === status && styles.filterOptionActive
                ]}
                onPress={() => {
                  setFilterStatus(status);
                  setShowFilter(false);
                }}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.filterOptionText,
                    filterStatus === status && styles.filterOptionTextActive
                  ]}
                >
                  {status === 'all' ? 'All' : getStatusLabel(status)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Payment Filter Options */}
        {showPaymentFilter && (
          <View style={styles.filterOptions}>
            {(['all', 'paid', 'unpaid', 'overdue'] as PaymentFilter[]).map(payment => (
              <TouchableOpacity
                key={payment}
                style={[
                  styles.filterOption,
                  paymentFilter === payment && styles.filterOptionActive
                ]}
                onPress={() => {
                  setPaymentFilter(payment);
                  setShowPaymentFilter(false);
                }}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.filterOptionText,
                    paymentFilter === payment && styles.filterOptionTextActive
                  ]}
                >
                  {payment.charAt(0).toUpperCase() + payment.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Summary */}
        {filteredOrders.length > 0 && renderSummary()}

        {/* Purchase Orders List */}
        {loading ? (
          <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: vs(40) }} />
        ) : filteredOrders.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>
              {searchQuery || filterStatus !== 'all' 
                ? 'No purchase orders found'
                : 'No purchase orders yet'}
            </Text>
            {!searchQuery && filterStatus === 'all' && (
              <TouchableOpacity
                style={styles.recordButton}
                onPress={() => router.push('/(main)/(store-owner)/profile/record-purchase-order')}
                activeOpacity={0.7}
              >
                <Text style={styles.recordButtonText}>Record Purchase Order</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          filteredOrders.map(order => renderPurchaseOrderCard(order))
        )}
      </ScrollView>

      {/* Floating Action Button */}
      {filteredOrders.length > 0 && (
        <TouchableOpacity
          style={styles.fab}
          onPress={() => router.push('/(main)/(store-owner)/profile/record-purchase-order')}
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

  orderCard: {
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

  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: vs(10),
  },

  orderHeaderLeft: {
    flex: 1,
  },

  orderNumber: {
    fontFamily: Fonts.primary,
    fontWeight: '700',
    fontSize: ms(16),
    color: Colors.darkGray,
    marginBottom: vs(6),
  },

  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: s(10),
    paddingVertical: vs(4),
    borderRadius: s(12),
  },

  statusText: {
    fontFamily: Fonts.primary,
    fontSize: ms(11),
    color: Colors.white,
    fontWeight: '600',
  },

  orderDate: {
    fontFamily: Fonts.primary,
    fontSize: ms(12),
    color: Colors.textSecondary,
  },

  supplierRow: {
    flexDirection: 'row',
    marginBottom: vs(10),
  },

  supplierLabel: {
    fontFamily: Fonts.primary,
    fontSize: ms(13),
    color: Colors.textSecondary,
  },

  supplierName: {
    fontFamily: Fonts.primary,
    fontSize: ms(13),
    color: Colors.darkGray,
    fontWeight: '500',
  },

  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.05)',
    paddingTop: vs(10),
  },

  itemsCount: {
    fontFamily: Fonts.primary,
    fontSize: ms(13),
    color: Colors.textSecondary,
  },

  orderTotal: {
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
    alignItems: 'center',
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

  itemCost: {
    fontFamily: Fonts.primary,
    fontSize: ms(12),
    color: Colors.textSecondary,
  },

  itemSubtotal: {
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

  actionsContainer: {
    gap: vs(12),
    marginBottom: vs(12),
  },

  receiveButton: {
    backgroundColor: '#4CAF50',
    borderRadius: s(12),
    paddingVertical: vs(14),
    alignItems: 'center',
  },

  receiveButtonText: {
    fontFamily: Fonts.primary,
    fontWeight: '600',
    fontSize: ms(15),
    color: Colors.white,
  },

  cancelButton: {
    backgroundColor: '#FF9800',
    borderRadius: s(12),
    paddingVertical: vs(14),
    alignItems: 'center',
  },

  cancelButtonText: {
    fontFamily: Fonts.primary,
    fontWeight: '600',
    fontSize: ms(15),
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

  // Payment Filter Button
  paymentFilterButton: {
    width: s(50),
    height: s(50),
    backgroundColor: Colors.white,
    borderRadius: s(12),
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: s(10),
  },

  paymentFilterIcon: {
    fontSize: ms(24),
  },

  // Payment Badge
  badgeRow: {
    flexDirection: 'row',
    gap: s(6),
    flexWrap: 'wrap',
  },

  paymentBadge: {
    paddingHorizontal: s(8),
    paddingVertical: vs(3),
    borderRadius: s(8),
  },

  paymentBadgeText: {
    fontFamily: Fonts.primary,
    fontSize: ms(10),
    color: Colors.white,
    fontWeight: '600',
  },

  // Due Date Text
  dueText: {
    fontFamily: Fonts.primary,
    fontSize: ms(11),
    color: '#FF9800',
    marginBottom: vs(8),
  },

  overdueText: {
    fontFamily: Fonts.primary,
    fontSize: ms(11),
    color: '#E92B45',
    fontWeight: '600',
    marginBottom: vs(8),
  },

  // Unpaid Section in Summary
  unpaidSection: {
    marginTop: vs(15),
    paddingTop: vs(15),
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
  },

  unpaidRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: vs(8),
  },

  unpaidLabel: {
    fontFamily: Fonts.primary,
    fontSize: ms(14),
    color: Colors.darkGray,
    fontWeight: '600',
  },

  unpaidAmount: {
    fontFamily: Fonts.primary,
    fontSize: ms(18),
    color: '#FF9800',
    fontWeight: '700',
  },

  overdueWarning: {
    fontFamily: Fonts.primary,
    fontSize: ms(12),
    color: '#E92B45',
    fontWeight: '500',
  },

  // Payment Status Section in Modal
  paymentStatusSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(0, 0, 0, 0.02)',
    borderRadius: s(12),
    padding: s(12),
    marginBottom: vs(20),
  },

  paymentStatusLabel: {
    fontFamily: Fonts.primary,
    fontSize: ms(14),
    color: Colors.darkGray,
    fontWeight: '600',
  },

  // Mark as Paid Button
  markPaidButton: {
    backgroundColor: '#4CAF50',
    borderRadius: s(12),
    paddingVertical: vs(14),
    alignItems: 'center',
    marginBottom: vs(12),
  },

  markPaidButtonText: {
    fontFamily: Fonts.primary,
    fontWeight: '600',
    fontSize: ms(15),
    color: Colors.white,
  },

  // Filtered Summary Card
  filteredSummaryCard: {
    backgroundColor: '#E3F2FD',
    borderRadius: s(16),
    padding: s(15),
    marginBottom: vs(20),
    borderWidth: 2,
    borderColor: '#2196F3',
    shadowColor: 'rgba(33, 150, 243, 0.2)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 3,
  },

  filteredSummaryTitle: {
    fontFamily: Fonts.primary,
    fontWeight: '700',
    fontSize: ms(15),
    color: '#1976D2',
    marginBottom: vs(12),
  },

  filteredSummaryValue: {
    fontFamily: Fonts.primary,
    fontWeight: '700',
    fontSize: ms(18),
    color: '#1976D2',
    marginBottom: vs(4),
  },
});

export default PurchaseOrderHistoryScreen;
