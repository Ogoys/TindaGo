/**
 * PURCHASE DETAILS SCREEN
 *
 * Figma File: 8I1Nr3vQZllDDknSevstvH
 * Node: 1681:163 (Purchase Details screen)
 * Baseline: 440x956
 *
 * PIXEL-PERFECT IMPLEMENTATION:
 * Shows detailed purchase order information including:
 * - Purchase order number and status
 * - Supplier details
 * - Status timeline (Pending → Delivered)
 * - Payment method and status
 * - Product list with images
 * - Total amount
 * - View invoice button
 * - Action buttons (Mark as Delivered, Update Status)
 *
 * Design Pattern: Similar to order-details with store owner purchase context
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
  ActivityIndicator,
  Alert,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { ref, onValue } from 'firebase/database';
import { database } from '../../../../FirebaseConfig';
import { s, vs, ms } from '../../../../src/constants/responsive';
import { Colors } from '../../../../src/constants/Colors';
import { Fonts } from '../../../../src/constants/Fonts';
import { PurchaseOrder, PurchaseOrderStatus, PURCHASE_PAYMENT_METHODS } from '../../../../src/models/PurchaseOrder';
import { markAsReceived } from '../../../../src/api/purchaseOrders';
import { getProductImageSource } from '../../../../src/lib/helpers/imageHelper';
import PaymentMethodBadge from '../../../../src/components/common/PaymentMethodBadge';

const PurchaseDetailsScreen = () => {
  const params = useLocalSearchParams();
  const purchaseOrderId = params.purchaseOrderId as string | undefined;

  const [purchaseOrder, setPurchaseOrder] = useState<PurchaseOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (!purchaseOrderId) {
      setLoading(false);
      return;
    }

    const orderRef = ref(database, `purchase_orders/${purchaseOrderId}`);
    const unsubscribe = onValue(orderRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const orderData = { ...data, id: purchaseOrderId } as PurchaseOrder;
        setPurchaseOrder(orderData);
      } else {
        setPurchaseOrder(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [purchaseOrderId]);

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'N/A';
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch (error) {
      return 'N/A';
    }
  };

  const formatTime = (date: Date | string | undefined) => {
    if (!date) return 'N/A';
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const formatCurrency = (value: number | undefined): string => {
    if (value === undefined || value === null || isNaN(value)) {
      return '0.00';
    }
    return value.toFixed(2);
  };

  const getStatusConfig = (status: PurchaseOrderStatus) => {
    switch (status) {
      case 'pending':
        return {
          backgroundColor: '#FFA500',
          color: '#FFFFFF',
          label: 'Pending',
        };
      case 'received':
        return {
          backgroundColor: Colors.primary,
          color: '#FFFFFF',
          label: 'Delivered',
        };
      case 'cancelled':
        return {
          backgroundColor: '#E92B45',
          color: '#FFFFFF',
          label: 'Cancelled',
        };
      default:
        return {
          backgroundColor: '#9CA3AF',
          color: '#FFFFFF',
          label: status,
        };
    }
  };

  const getPaymentStatusConfig = (status: string | undefined) => {
    if (status === 'paid') {
      return {
        backgroundColor: 'rgba(59, 183, 126, 0.15)',
        color: Colors.primary,
        label: 'Paid',
      };
    }
    return {
      backgroundColor: 'rgba(255, 165, 0, 0.15)',
      color: '#FFA500',
      label: 'Unpaid',
    };
  };

  const handleMarkAsDelivered = async () => {
    if (!purchaseOrder) return;

    Alert.alert(
      'Mark as Delivered?',
      `This will add ${purchaseOrder.items.length} product(s) to your inventory. Continue?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Mark Delivered',
          onPress: async () => {
            try {
              setUpdating(true);
              const result = await markAsReceived(purchaseOrder.id);

              if (result.success) {
                Alert.alert('Success', 'Inventory updated successfully!', [
                  { text: 'OK', onPress: () => router.back() }
                ]);
              } else {
                Alert.alert('Error', result.error || 'Failed to update inventory');
              }
            } catch (error) {
              console.error('Error marking as delivered:', error);
              Alert.alert('Error', 'Failed to update inventory');
            } finally {
              setUpdating(false);
            }
          }
        }
      ]
    );
  };

  const renderStatusTimeline = (order: PurchaseOrder) => {
    // Define progress steps for purchase orders
    const steps = [
      { status: 'pending', label: 'Order Placed', icon: '📋' },
      { status: 'received', label: 'Delivered', icon: '✅' },
    ];

    const statusOrder = ['pending', 'received'];
    const currentStatusIndex = order.status === 'cancelled' ? -1 : statusOrder.indexOf(order.status);

    return steps.map((step, index) => {
      const isCompleted = index <= currentStatusIndex;
      const isActive = index === currentStatusIndex;
      const isCancelled = order.status === 'cancelled';

      let timestamp = 'Pending';
      if (isCompleted) {
        if (index === 0) timestamp = formatTime(order.createdAt);
        else if (step.status === 'received' && order.receivedDate) timestamp = formatTime(order.receivedDate);
        else timestamp = formatTime(order.updatedAt);
      }

      return (
        <View key={step.status} style={styles.progressItem}>
          <View style={styles.progressIconContainer}>
            {isCompleted ? (
              <View style={[styles.progressDot, isActive && styles.progressDotActive]} />
            ) : (
              <View style={[styles.progressDot, styles.progressDotInactive]} />
            )}
            {index < steps.length - 1 && (
              <View style={[
                styles.progressLine,
                isCompleted ? styles.progressLineActive : styles.progressLineInactive
              ]} />
            )}
          </View>
          <View style={styles.progressContent}>
            <Text style={[
              styles.progressText,
              !isCompleted && styles.progressTextInactive,
              isActive && styles.progressTextActive,
              isCancelled && styles.progressTextCancelled
            ]}>
              {step.icon} {step.label}
            </Text>
            <Text style={[
              styles.progressTime,
              !isCompleted && styles.progressTimeInactive
            ]}>
              {timestamp}
            </Text>
          </View>
        </View>
      );
    });
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor={Colors.backgroundGray} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Loading purchase details...</Text>
        </View>
      </View>
    );
  }

  if (!purchaseOrder) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor={Colors.backgroundGray} />
        <View style={styles.loadingContainer}>
          <Text style={styles.errorText}>Purchase order not found</Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const statusConfig = getStatusConfig(purchaseOrder.status);
  const paymentStatusConfig = getPaymentStatusConfig(purchaseOrder.paymentStatus);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.backgroundGray} />

      {/* Header - Figma: y:0-130 */}
      <View style={styles.headerContainer}>
        {/* Back Button - Figma: x:20, y:79, size:30x30 */}
        <TouchableOpacity
          style={styles.backButtonCircle}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>

        {/* Title - Figma: centered */}
        <Text style={styles.title}>Purchase Details</Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Purchase Order Number and Status */}
        <View style={styles.orderIdContainer}>
          <Text style={styles.orderIdLabel}>Purchase Order:</Text>
          <Text style={styles.orderIdValue}>{purchaseOrder.purchaseOrderNumber}</Text>
        </View>

        {/* Status Badge Row */}
        <View style={styles.badgeRow}>
          <View style={[styles.statusBadge, { backgroundColor: statusConfig.backgroundColor }]}>
            <Text style={[styles.statusText, { color: statusConfig.color }]}>
              {statusConfig.label}
            </Text>
          </View>
          {purchaseOrder.paymentStatus && (
            <View style={[styles.paymentStatusBadge, { backgroundColor: paymentStatusConfig.backgroundColor }]}>
              <Text style={[styles.paymentStatusText, { color: paymentStatusConfig.color }]}>
                {paymentStatusConfig.label}
              </Text>
            </View>
          )}
        </View>

        {/* Supplier Information Card */}
        {purchaseOrder.supplierName && (
          <View style={styles.supplierCard}>
            <View style={styles.supplierCardBackground} />
            <View style={styles.supplierContent}>
              <View style={styles.supplierIcon}>
                <Text style={styles.supplierIconText}>🏪</Text>
              </View>
              <View style={styles.supplierInfo}>
                <Text style={styles.supplierLabel}>Supplier</Text>
                <Text style={styles.supplierName}>{purchaseOrder.supplierName}</Text>
                {purchaseOrder.supplierContact && (
                  <Text style={styles.supplierContact}>{purchaseOrder.supplierContact}</Text>
                )}
              </View>
            </View>
          </View>
        )}

        {/* Status Timeline Card */}
        <View style={styles.statusCard}>
          <View style={styles.statusCardBackground} />
          <View style={styles.timelineContainer}>
            <Text style={styles.timelineTitle}>Order Timeline</Text>
            {renderStatusTimeline(purchaseOrder)}

            {/* Cancelled Notice */}
            {purchaseOrder.status === 'cancelled' && (
              <View style={styles.cancelledNotice}>
                <Text style={styles.cancelledText}>❌ This purchase order has been cancelled</Text>
              </View>
            )}
          </View>
        </View>

        {/* Product Items Card */}
        <View style={styles.itemsCard}>
          <View style={styles.itemsCardBackground} />

          {/* Card Header */}
          <View style={styles.cardHeader}>
            <Text style={styles.cardHeaderTitle}>Items Ordered</Text>
            <View style={styles.itemCountBadge}>
              <Text style={styles.itemCountText}>{purchaseOrder.items.length} {purchaseOrder.items.length === 1 ? 'Item' : 'Items'}</Text>
            </View>
          </View>

          {/* Header Divider */}
          <View style={styles.headerDivider} />

          {/* Items List */}
          <View style={styles.itemsListContainer}>
            {purchaseOrder.items.map((item, index) => {
              const imageSource = getProductImageSource({
                productImageUrl: item.productImageUrl,
                productImage: item.productImage
              });

              return (
                <View key={index} style={styles.itemRow}>
                  {/* Product Image */}
                  <View style={styles.productIconContainer}>
                    {imageSource ? (
                      <Image
                        source={imageSource}
                        style={styles.productImage}
                        resizeMode="cover"
                      />
                    ) : (
                      <View style={[styles.productImage, styles.productImagePlaceholder]}>
                        <Text style={styles.placeholderText}>No Image</Text>
                      </View>
                    )}
                  </View>

                  {/* Product Details */}
                  <View style={styles.productDetails}>
                    <Text style={styles.productName} numberOfLines={2}>
                      {item.productName}
                    </Text>
                    <Text style={styles.productSize}>
                      {item.productSize} {item.unit}
                    </Text>
                    <Text style={styles.productPrice}>
                      ₱{item.costPerUnit.toFixed(2)} each
                    </Text>
                  </View>

                  {/* Quantity & Amount */}
                  <View style={styles.itemQuantitySection}>
                    <View style={styles.quantityBadge}>
                      <Text style={styles.quantityText}>×{item.quantity}</Text>
                    </View>
                    <Text style={styles.itemAmount}>₱{item.subtotal.toFixed(2)}</Text>
                  </View>

                  {/* Item Divider */}
                  {index < purchaseOrder.items.length - 1 && (
                    <View style={styles.itemDivider} />
                  )}
                </View>
              );
            })}
          </View>

          {/* Total Section */}
          <View style={styles.totalSection}>
            <View style={styles.totalDivider} />
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total Cost</Text>
              <Text style={styles.totalValue}>₱{formatCurrency(purchaseOrder.totalCost)}</Text>
            </View>
          </View>
        </View>

        {/* Purchase Details Card */}
        <View style={styles.detailsCard}>
          <View style={styles.detailsCardBackground} />
          <View style={styles.detailsContent}>
            {/* Purchase Date */}
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Purchase Date</Text>
              <Text style={styles.detailValue}>{formatDate(purchaseOrder.purchaseDate)}</Text>
            </View>

            {/* Received Date */}
            {purchaseOrder.receivedDate && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Received Date</Text>
                <Text style={styles.detailValue}>{formatDate(purchaseOrder.receivedDate)}</Text>
              </View>
            )}

            {/* Notes */}
            {purchaseOrder.notes && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Notes</Text>
                <Text style={styles.detailValueMultiline}>{purchaseOrder.notes}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Payment Method Card */}
        {purchaseOrder.paymentMethod && (
          <View style={styles.paymentMethodCard}>
            <View style={styles.paymentMethodBackground} />
            <View style={styles.paymentMethodContent}>
              <Text style={styles.paymentMethodLabel}>Payment Method</Text>
              <View style={styles.paymentMethodBadgeContainer}>
                <PaymentMethodBadge
                  method={purchaseOrder.paymentMethod}
                  size="medium"
                  showText={true}
                />
              </View>
            </View>
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.actionButtonsContainer}>
          {/* Mark as Delivered Button - Only for pending orders */}
          {purchaseOrder.status === 'pending' && (
            <TouchableOpacity
              style={[styles.actionButton, styles.markDeliveredButton]}
              onPress={handleMarkAsDelivered}
              activeOpacity={0.7}
              disabled={updating}
            >
              {updating ? (
                <ActivityIndicator size="small" color={Colors.white} />
              ) : (
                <Text style={styles.actionButtonText}>Mark as Delivered</Text>
              )}
            </TouchableOpacity>
          )}

          {/* View Invoice Button - Always visible */}
          <TouchableOpacity
            style={[styles.actionButton, styles.viewInvoiceButton]}
            onPress={() => {
              router.push({
                pathname: '/(main)/(store-owner)/profile/purchase-invoice' as any,
                params: {
                  id: purchaseOrder.id,
                },
              });
            }}
            activeOpacity={0.7}
          >
            <Text style={styles.viewInvoiceButtonText}>View Invoice</Text>
          </TouchableOpacity>
        </View>

        {/* Bottom Padding */}
        <View style={styles.bottomPadding} />
      </ScrollView>
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
  backButtonCircle: {
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
    paddingBottom: vs(40),
  },

  // Order ID Container
  orderIdContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: vs(12),
  },

  orderIdLabel: {
    fontFamily: Fonts.primary,
    fontWeight: '500',
    fontSize: ms(14),
    color: 'rgba(30, 30, 30, 0.5)',
  },

  orderIdValue: {
    marginLeft: s(8),
    fontFamily: Fonts.primary,
    fontWeight: '600',
    fontSize: ms(14),
    color: Colors.darkGray,
  },

  // Badge Row
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: vs(20),
    gap: s(10),
  },

  statusBadge: {
    paddingHorizontal: s(12),
    paddingVertical: vs(6),
    borderRadius: s(12),
  },

  statusText: {
    fontFamily: Fonts.primary,
    fontSize: ms(12),
    fontWeight: '600',
  },

  paymentStatusBadge: {
    paddingHorizontal: s(12),
    paddingVertical: vs(6),
    borderRadius: s(12),
  },

  paymentStatusText: {
    fontFamily: Fonts.primary,
    fontSize: ms(12),
    fontWeight: '600',
  },

  // Supplier Card
  supplierCard: {
    width: s(400),
    minHeight: vs(90),
    marginBottom: vs(20),
  },

  supplierCardBackground: {
    position: 'absolute',
    width: s(400),
    height: '100%',
    backgroundColor: Colors.white,
    borderRadius: s(16),
    shadowColor: 'rgba(0, 0, 0, 0.15)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 3,
  },

  supplierContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: s(20),
  },

  supplierIcon: {
    width: s(50),
    height: s(50),
    borderRadius: s(25),
    backgroundColor: 'rgba(59, 183, 126, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: s(15),
  },

  supplierIconText: {
    fontSize: ms(24),
  },

  supplierInfo: {
    flex: 1,
  },

  supplierLabel: {
    fontFamily: Fonts.primary,
    fontSize: ms(12),
    color: 'rgba(30, 30, 30, 0.5)',
    marginBottom: vs(4),
  },

  supplierName: {
    fontFamily: Fonts.primary,
    fontWeight: '600',
    fontSize: ms(16),
    color: Colors.darkGray,
    marginBottom: vs(2),
  },

  supplierContact: {
    fontFamily: Fonts.primary,
    fontSize: ms(13),
    color: 'rgba(30, 30, 30, 0.6)',
  },

  // Status Card
  statusCard: {
    width: s(400),
    minHeight: vs(220),
    marginBottom: vs(20),
  },

  statusCardBackground: {
    position: 'absolute',
    width: s(400),
    height: '100%',
    backgroundColor: Colors.white,
    borderRadius: s(20),
    shadowColor: 'rgba(0, 0, 0, 0.15)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 3,
  },

  timelineContainer: {
    padding: s(20),
  },

  timelineTitle: {
    fontFamily: Fonts.primary,
    fontWeight: '600',
    fontSize: ms(16),
    color: Colors.darkGray,
    marginBottom: vs(20),
  },

  // Progress Timeline
  progressItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: vs(22),
  },

  progressIconContainer: {
    width: s(30),
    alignItems: 'center',
    marginRight: s(15),
    position: 'relative',
  },

  progressDot: {
    width: s(12),
    height: s(12),
    borderRadius: s(6),
    backgroundColor: Colors.primary,
    zIndex: 2,
  },

  progressDotActive: {
    width: s(16),
    height: s(16),
    borderRadius: s(8),
    backgroundColor: Colors.primary,
    borderWidth: 3,
    borderColor: '#E8F5E9',
  },

  progressDotInactive: {
    backgroundColor: '#D9D9D9',
  },

  progressLine: {
    position: 'absolute',
    width: 2,
    height: vs(48),
    top: vs(12),
    left: s(13),
    zIndex: 1,
  },

  progressLineActive: {
    backgroundColor: Colors.primary,
  },

  progressLineInactive: {
    backgroundColor: '#D9D9D9',
  },

  progressContent: {
    flex: 1,
    paddingTop: vs(0),
  },

  progressText: {
    fontSize: ms(16),
    fontFamily: Fonts.primary,
    fontWeight: '500',
    color: Colors.primary,
    lineHeight: ms(20),
    marginBottom: vs(2),
  },

  progressTextActive: {
    fontWeight: '600',
    color: Colors.primary,
  },

  progressTextInactive: {
    color: 'rgba(30, 30, 30, 0.5)',
  },

  progressTextCancelled: {
    color: '#E92B45',
  },

  progressTime: {
    fontSize: ms(14),
    fontFamily: Fonts.primary,
    fontWeight: '400',
    color: Colors.primary,
    lineHeight: ms(18),
  },

  progressTimeInactive: {
    color: 'rgba(30, 30, 30, 0.5)',
  },

  cancelledNotice: {
    backgroundColor: 'rgba(233, 43, 69, 0.1)',
    padding: s(12),
    borderRadius: s(10),
    marginTop: vs(10),
  },

  cancelledText: {
    fontFamily: Fonts.primary,
    fontSize: ms(14),
    color: '#E92B45',
    fontWeight: '500',
    textAlign: 'center',
  },

  // Items Card
  itemsCard: {
    width: s(400),
    minHeight: vs(200),
    marginBottom: vs(20),
  },

  itemsCardBackground: {
    position: 'absolute',
    width: s(400),
    height: '100%',
    backgroundColor: Colors.white,
    borderRadius: s(20),
    shadowColor: 'rgba(0, 0, 0, 0.15)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 3,
  },

  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: s(20),
    paddingTop: vs(20),
    paddingBottom: vs(12),
  },

  cardHeaderTitle: {
    fontFamily: Fonts.primary,
    fontWeight: '600',
    fontSize: ms(18),
    color: Colors.darkGray,
  },

  itemCountBadge: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: s(12),
    paddingVertical: vs(4),
    borderRadius: s(12),
  },

  itemCountText: {
    fontFamily: Fonts.primary,
    fontWeight: '500',
    fontSize: ms(12),
    color: Colors.primary,
  },

  headerDivider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginHorizontal: s(20),
    marginBottom: vs(10),
  },

  itemsListContainer: {
    paddingHorizontal: s(20),
  },

  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: vs(12),
    minHeight: vs(70),
  },

  productIconContainer: {
    marginRight: s(12),
    width: s(48),
    height: s(48),
    borderRadius: s(12),
    overflow: 'hidden',
    backgroundColor: '#F3F4F6',
  },

  productImage: {
    width: s(48),
    height: s(48),
  },

  productImagePlaceholder: {
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
  },

  placeholderText: {
    fontFamily: Fonts.primary,
    fontSize: ms(8),
    color: Colors.textSecondary,
  },

  productDetails: {
    flex: 1,
  },

  productName: {
    fontFamily: Fonts.primary,
    fontWeight: '500',
    fontSize: ms(14),
    color: Colors.darkGray,
    lineHeight: ms(14) * 1.4,
    marginBottom: vs(2),
  },

  productSize: {
    fontFamily: Fonts.primary,
    fontWeight: '400',
    fontSize: ms(11),
    color: '#6B7280',
    marginBottom: vs(2),
  },

  productPrice: {
    fontFamily: Fonts.primary,
    fontWeight: '400',
    fontSize: ms(12),
    color: '#9CA3AF',
  },

  itemQuantitySection: {
    alignItems: 'flex-end',
  },

  quantityBadge: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: s(10),
    paddingVertical: vs(4),
    borderRadius: s(8),
    marginBottom: vs(6),
  },

  quantityText: {
    fontFamily: Fonts.primary,
    fontWeight: '600',
    fontSize: ms(12),
    color: '#374151',
  },

  itemAmount: {
    fontFamily: Fonts.primary,
    fontWeight: '600',
    fontSize: ms(16),
    color: Colors.primary,
  },

  itemDivider: {
    position: 'absolute',
    bottom: 0,
    left: s(60),
    right: 0,
    height: 1,
    backgroundColor: '#F3F4F6',
  },

  totalSection: {
    paddingHorizontal: s(20),
    paddingBottom: vs(20),
  },

  totalDivider: {
    height: 2,
    backgroundColor: Colors.primary,
    marginVertical: vs(15),
  },

  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  totalLabel: {
    fontFamily: Fonts.primary,
    fontWeight: '600',
    fontSize: ms(16),
    color: Colors.darkGray,
  },

  totalValue: {
    fontFamily: Fonts.primary,
    fontWeight: '700',
    fontSize: ms(20),
    color: Colors.primary,
  },

  // Details Card
  detailsCard: {
    width: s(400),
    minHeight: vs(80),
    marginBottom: vs(20),
  },

  detailsCardBackground: {
    position: 'absolute',
    width: s(400),
    height: '100%',
    backgroundColor: Colors.white,
    borderRadius: s(16),
    shadowColor: 'rgba(0, 0, 0, 0.15)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 3,
  },

  detailsContent: {
    padding: s(20),
  },

  detailRow: {
    marginBottom: vs(12),
  },

  detailLabel: {
    fontFamily: Fonts.primary,
    fontSize: ms(12),
    color: 'rgba(30, 30, 30, 0.5)',
    marginBottom: vs(4),
  },

  detailValue: {
    fontFamily: Fonts.primary,
    fontSize: ms(14),
    fontWeight: '500',
    color: Colors.darkGray,
  },

  detailValueMultiline: {
    fontFamily: Fonts.primary,
    fontSize: ms(14),
    fontWeight: '400',
    color: Colors.darkGray,
    lineHeight: ms(14) * 1.5,
  },

  // Payment Method Card
  paymentMethodCard: {
    width: s(400),
    height: vs(80),
    marginBottom: vs(20),
  },

  paymentMethodBackground: {
    position: 'absolute',
    width: s(400),
    height: vs(80),
    backgroundColor: Colors.white,
    borderRadius: s(16),
    shadowColor: 'rgba(0, 0, 0, 0.15)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 3,
  },

  paymentMethodContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: s(20),
    paddingVertical: vs(20),
  },

  paymentMethodLabel: {
    fontFamily: Fonts.primary,
    fontWeight: '500',
    fontSize: ms(14),
    color: Colors.darkGray,
  },

  paymentMethodBadgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  // Action Buttons
  actionButtonsContainer: {
    marginTop: vs(10),
    gap: vs(12),
  },

  actionButton: {
    width: s(400),
    height: vs(50),
    borderRadius: s(12),
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: 'rgba(0, 0, 0, 0.15)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 3,
  },

  markDeliveredButton: {
    backgroundColor: Colors.primary,
  },

  actionButtonText: {
    fontFamily: Fonts.primary,
    fontWeight: '600',
    fontSize: ms(16),
    color: Colors.white,
  },

  viewInvoiceButton: {
    backgroundColor: Colors.white,
    borderWidth: 2,
    borderColor: Colors.primary,
  },

  viewInvoiceButtonText: {
    fontFamily: Fonts.primary,
    fontWeight: '600',
    fontSize: ms(16),
    color: Colors.primary,
  },

  // Loading & Error States
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: s(40),
  },

  loadingText: {
    marginTop: vs(15),
    fontSize: ms(16),
    fontFamily: Fonts.primary,
    fontWeight: '500',
    color: 'rgba(30, 30, 30, 0.5)',
  },

  errorText: {
    fontSize: ms(18),
    fontFamily: Fonts.primary,
    fontWeight: '600',
    color: 'rgba(30, 30, 30, 0.5)',
    marginBottom: vs(20),
    textAlign: 'center',
  },

  backButton: {
    backgroundColor: Colors.primary,
    borderRadius: s(12),
    paddingVertical: vs(12),
    paddingHorizontal: s(24),
  },

  backButtonText: {
    fontFamily: Fonts.primary,
    fontWeight: '600',
    fontSize: ms(14),
    color: Colors.white,
  },

  bottomPadding: {
    height: vs(20),
  },
});

export default PurchaseDetailsScreen;
