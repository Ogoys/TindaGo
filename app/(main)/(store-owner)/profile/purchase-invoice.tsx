/**
 * PURCHASE INVOICE SCREEN
 *
 * Displays invoice/receipt for purchase orders from suppliers
 * Shows supplier info, multiple product items, payment method, and totals
 *
 * Features:
 * - Receipt-style invoice with scalloped edges
 * - Multiple product items list
 * - Payment method indicator (Cash/Debt)
 * - Share/Print invoice functionality
 * - Date and time of purchase
 *
 * Based on customer invoice.tsx patterns adapted for purchase orders
 * Baseline: 440x956
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Image,
  Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ref, get } from 'firebase/database';
import { database } from '../../../../FirebaseConfig';
import { s, vs, ms } from '../../../../src/constants/responsive';
import { Colors } from '../../../../src/constants/Colors';
import { Fonts } from '../../../../src/constants/Fonts';
import type { PurchaseOrder, PurchaseOrderItem } from '../../../../src/models/PurchaseOrder';
import { getProductImageSource } from '../../../../src/lib/helpers/imageHelper';

export default function PurchaseInvoiceScreen() {
  const params = useLocalSearchParams();
  const purchaseOrderId = params.id as string;
  const testMode = params.test === 'true';
  const previewMode = params.preview === 'true';
  const paymentMethodParam = params.paymentMethod as string;

  const [purchaseOrder, setPurchaseOrder] = useState<PurchaseOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [sharing, setSharing] = useState(false);
  const invoiceRef = useRef<View>(null);

  useEffect(() => {
    if (previewMode) {
      // Preview mode - load from params
      try {
        const itemsString = typeof params.items === 'string' ? params.items : '[]';
        const items: PurchaseOrderItem[] = JSON.parse(itemsString);
        const totalCost = typeof params.totalCost === 'string' ? parseFloat(params.totalCost) : 0;
        
        setPurchaseOrder({
          id: 'PREVIEW',
          purchaseOrderNumber: 'PREVIEW',
          storeId: '',
          storeOwnerId: '',
          storeName: '',
          supplierName: typeof params.supplierName === 'string' ? params.supplierName : '',
          supplierContact: typeof params.supplierContact === 'string' ? params.supplierContact : '',
          items,
          totalCost,
          status: 'pending',
          purchaseDate: typeof params.purchaseDate === 'string' ? params.purchaseDate : new Date().toISOString().split('T')[0],
          notes: typeof params.notes === 'string' ? params.notes : '',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        } as PurchaseOrder);
      } catch (error) {
        console.error('Error parsing preview params:', error);
        Alert.alert('Error', 'Invalid invoice data');
      }
      setLoading(false);
      return;
    }

    if (testMode) {
      // Test data for development
      setPurchaseOrder({
        id: 'TEST-PO-001',
        purchaseOrderNumber: 'PO-2025-001',
        storeId: 'test-store-123',
        storeOwnerId: 'test-owner',
        storeName: 'Test Sari-Sari Store',
        supplierName: 'Puregold Caloocan',
        supplierContact: '+63 912 345 6789',
        items: [
          {
            productId: '1',
            productName: 'Lucky Me Pancit Canton Original',
            quantity: 24,
            costPerUnit: 8.50,
            subtotal: 204.00,
            productSize: '60g',
            unit: 'pack',
          },
          {
            productId: '2',
            productName: 'Coca-Cola 1.5L',
            quantity: 12,
            costPerUnit: 45.00,
            subtotal: 540.00,
            productSize: '1.5L',
            unit: 'bottle',
          },
          {
            productId: '3',
            productName: 'Bear Brand Adult Plus',
            quantity: 48,
            costPerUnit: 12.00,
            subtotal: 576.00,
            productSize: '33g',
            unit: 'sachet',
          },
        ],
        totalCost: 1320.00,
        status: 'received',
        purchaseDate: '2025-01-15',
        receivedDate: '2025-01-15',
        notes: 'Wholesale purchase for the week',
        createdAt: '2025-01-15T09:00:00Z',
        updatedAt: '2025-01-15T10:30:00Z',
        recordedBy: 'test-owner',
      } as PurchaseOrder);
      setLoading(false);
      return;
    }

    if (!purchaseOrderId) {
      setLoading(false);
      return;
    }

    loadPurchaseOrder();
  }, [purchaseOrderId, testMode]);

  const loadPurchaseOrder = async () => {
    try {
      const poRef = ref(database, `purchase_orders/${purchaseOrderId}`);
      const snapshot = await get(poRef);
      if (snapshot.exists()) {
        setPurchaseOrder({ ...snapshot.val(), id: purchaseOrderId } as PurchaseOrder);
      }
    } catch (error) {
      console.error('Error loading purchase order:', error);
      Alert.alert('Error', 'Failed to load invoice');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const handleShare = async () => {
    if (!purchaseOrder) return;

    try {
      setSharing(true);

      const invoiceText = `
PURCHASE ORDER INVOICE
=============================

PO #: ${purchaseOrder.purchaseOrderNumber}
Date: ${formatDate(purchaseOrder.purchaseDate)}
${purchaseOrder.createdAt ? `Time: ${formatTime(purchaseOrder.createdAt)}` : ''}

SUPPLIER INFORMATION
-----------------------------
${purchaseOrder.supplierName || 'N/A'}
${purchaseOrder.supplierContact ? `Contact: ${purchaseOrder.supplierContact}` : ''}

ITEMS PURCHASED
-----------------------------
${purchaseOrder.items.map((item, i) =>
  `${i + 1}. ${item.productName}
   ${item.productSize} ${item.unit}
   Qty: ${item.quantity} x P${item.costPerUnit.toFixed(2)} = P${item.subtotal.toFixed(2)}`
).join('\n\n')}

=============================
TOTAL: P${purchaseOrder.totalCost.toFixed(2)}
=============================

Status: ${purchaseOrder.status.toUpperCase()}
${purchaseOrder.notes ? `\nNotes: ${purchaseOrder.notes}` : ''}

Generated by TindaGo
      `.trim();

      await Share.share(
        {
          message: invoiceText,
          title: `Purchase Invoice ${purchaseOrder.purchaseOrderNumber}`,
        },
        {
          dialogTitle: 'Share Purchase Invoice',
        }
      );
    } catch (error) {
      console.error('Error sharing invoice:', error);
      Alert.alert('Share Failed', 'Could not share invoice. Please try again.');
    } finally {
      setSharing(false);
    }
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

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Loading invoice...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!purchaseOrder) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>Invoice not found</Text>
          <TouchableOpacity style={styles.errorButton} onPress={() => router.back()}>
            <Text style={styles.errorButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const totalItems = purchaseOrder.items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color={Colors.darkGray} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Purchase Invoice</Text>
        <View style={styles.backBtn} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Invoice Card */}
        <View ref={invoiceRef} collapsable={false} style={styles.captureContainer}>

          {/* Receipt Card with Bill Summary */}
          <View style={styles.receiptCard}>
            {/* Scalloped Top */}
            <View style={styles.scallopTop}>
              {[...Array(13)].map((_, i) => (
                <View key={`top-${i}`} style={styles.scallopCircle} />
              ))}
            </View>

            {/* Invoice Header */}
            <View style={styles.invoiceHeader}>
              <Text style={styles.invoiceTitle}>PURCHASE ORDER</Text>
              <Text style={styles.poNumber}>{purchaseOrder.purchaseOrderNumber}</Text>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(purchaseOrder.status) }]}>
                <Text style={styles.statusText}>{getStatusLabel(purchaseOrder.status)}</Text>
              </View>
            </View>

            {/* Supplier Info */}
            {purchaseOrder.supplierName && (
              <View style={styles.supplierSection}>
                <Text style={styles.supplierLabel}>Supplier</Text>
                <Text style={styles.supplierName}>{purchaseOrder.supplierName}</Text>
                {purchaseOrder.supplierContact && (
                  <Text style={styles.supplierContact}>{purchaseOrder.supplierContact}</Text>
                )}
              </View>
            )}

            {/* Divider */}
            <View style={styles.divider} />

            {/* Items List */}
            <View style={styles.itemsSection}>
              <Text style={styles.itemsSectionTitle}>Items Purchased</Text>

              {purchaseOrder.items.map((item, index) => (
                <View key={index} style={styles.itemRow}>
                  <View style={styles.itemLeft}>
                    <Text style={styles.itemName} numberOfLines={2}>{item.productName}</Text>
                    <Text style={styles.itemDetails}>
                      {item.productSize} {item.unit} x {item.quantity}
                    </Text>
                    <Text style={styles.itemUnitPrice}>@ P{item.costPerUnit.toFixed(2)}</Text>
                  </View>
                  <Text style={styles.itemSubtotal}>P{item.subtotal.toFixed(2)}</Text>
                </View>
              ))}
            </View>

            {/* Dashed Line */}
            <View style={styles.dashedContainer}>
              {[...Array(22)].map((_, i) => (
                <View key={i} style={styles.dash} />
              ))}
            </View>

            {/* Summary */}
            <View style={styles.summarySection}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Total Items</Text>
                <Text style={styles.summaryValue}>{totalItems} items</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Products</Text>
                <Text style={styles.summaryValue}>{purchaseOrder.items.length} types</Text>
              </View>
            </View>

            {/* Dashed Line */}
            <View style={styles.dashedContainer}>
              {[...Array(22)].map((_, i) => (
                <View key={i} style={styles.dash} />
              ))}
            </View>

            {/* Grand Total */}
            <View style={styles.totalSection}>
              <Text style={styles.totalLabel}>Grand Total</Text>
              <Text style={styles.totalValue}>P{purchaseOrder.totalCost.toFixed(2)}</Text>
            </View>

            {/* Scalloped Bottom */}
            <View style={styles.scallopBottom}>
              {[...Array(13)].map((_, i) => (
                <View key={`bot-${i}`} style={styles.scallopCircle} />
              ))}
            </View>
          </View>

          {/* Details Card */}
          <View style={styles.detailsCard}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>PO Number</Text>
              <Text style={styles.detailColon}>:</Text>
              <Text style={styles.detailValue}>{purchaseOrder.purchaseOrderNumber}</Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Date</Text>
              <Text style={styles.detailColon}>:</Text>
              <Text style={styles.detailValue}>{formatDate(purchaseOrder.purchaseDate)}</Text>
            </View>

            {purchaseOrder.createdAt && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Time</Text>
                <Text style={styles.detailColon}>:</Text>
                <Text style={styles.detailValue}>{formatTime(purchaseOrder.createdAt)}</Text>
              </View>
            )}

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Supplier</Text>
              <Text style={styles.detailColon}>:</Text>
              <Text style={styles.detailValue}>{purchaseOrder.supplierName || 'Not specified'}</Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Status</Text>
              <Text style={styles.detailColon}>:</Text>
              <Text style={[styles.detailValue, { color: getStatusColor(purchaseOrder.status), fontWeight: '600' }]}>
                {getStatusLabel(purchaseOrder.status)}
              </Text>
            </View>

            {/* Payment Method */}
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Payment</Text>
              <Text style={styles.detailColon}>:</Text>
              <View style={styles.paymentBadgeContainer}>
                {(() => {
                  const method = paymentMethodParam || purchaseOrder.paymentMethod;
                  let bgColor = '#E8F5E9';
                  let textColor = '#4CAF50';
                  let displayText = '💵 CASH';

                  if (method === 'debt') {
                    bgColor = '#FFF3E0';
                    textColor = '#FF8D2F';
                    displayText = '💳 DEBT (Unpaid)';
                  } else if (method === 'gcash') {
                    bgColor = '#E3F2FD';
                    textColor = '#1976D2';
                    displayText = '💳 GCASH (Paid)';
                  } else if (method === 'paymaya') {
                    bgColor = '#E8F5E9';
                    textColor = '#00D632';
                    displayText = '💳 PAYMAYA (Paid)';
                  } else if (method === 'cash') {
                    bgColor = '#E8F5E9';
                    textColor = '#4CAF50';
                    displayText = '💵 CASH (Paid)';
                  }

                  return (
                    <View style={[styles.paymentBadge, { backgroundColor: bgColor }]}>
                      <Text style={[styles.paymentBadgeText, { color: textColor }]}>
                        {displayText}
                      </Text>
                    </View>
                  );
                })()}
              </View>
            </View>

            {purchaseOrder.notes && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Notes</Text>
                <Text style={styles.detailColon}>:</Text>
                <Text style={styles.detailValue}>{purchaseOrder.notes}</Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>

      {/* Share/Print Button */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.shareBtn}
          onPress={handleShare}
          disabled={sharing}
        >
          {sharing ? (
            <ActivityIndicator color={Colors.white} />
          ) : (
            <>
              <Ionicons name="share-outline" size={20} color={Colors.white} style={{ marginRight: s(8) }} />
              <Text style={styles.shareText}>Share / Print Invoice</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundGray,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: vs(10),
    fontSize: ms(14),
    fontFamily: Fonts.primary,
    color: Colors.textSecondary,
  },
  errorText: {
    fontSize: ms(16),
    fontFamily: Fonts.primary,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginBottom: vs(20),
  },
  errorButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: s(30),
    paddingVertical: vs(12),
    borderRadius: s(10),
  },
  errorButtonText: {
    color: Colors.white,
    fontSize: ms(16),
    fontFamily: Fonts.primary,
    fontWeight: '600',
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: s(20),
    paddingVertical: vs(15),
    backgroundColor: Colors.white,
  },
  backBtn: {
    width: s(40),
    height: s(40),
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: ms(20),
    fontFamily: Fonts.primary,
    fontWeight: '600',
    color: Colors.darkGray,
  },

  // Scroll
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: s(20),
    paddingBottom: vs(100),
  },
  captureContainer: {
    backgroundColor: Colors.backgroundGray,
  },

  // Receipt Card
  receiptCard: {
    backgroundColor: Colors.white,
    borderRadius: s(20),
    marginBottom: vs(20),
    paddingHorizontal: s(20),
    paddingTop: vs(30),
    paddingBottom: vs(35),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  scallopTop: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    position: 'absolute',
    top: -10,
    left: 0,
    right: 0,
    height: 20,
    zIndex: 1,
  },
  scallopBottom: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    position: 'absolute',
    bottom: -10,
    left: 0,
    right: 0,
    height: 20,
    zIndex: 1,
  },
  scallopCircle: {
    width: s(26),
    height: vs(20),
    backgroundColor: Colors.backgroundGray,
    borderRadius: s(13),
  },

  // Invoice Header
  invoiceHeader: {
    alignItems: 'center',
    marginBottom: vs(20),
  },
  invoiceTitle: {
    fontSize: ms(12),
    fontFamily: Fonts.primary,
    fontWeight: '500',
    color: Colors.textSecondary,
    letterSpacing: 2,
    marginBottom: vs(4),
  },
  poNumber: {
    fontSize: ms(20),
    fontFamily: Fonts.primary,
    fontWeight: '700',
    color: Colors.darkGray,
    marginBottom: vs(10),
  },
  statusBadge: {
    paddingHorizontal: s(16),
    paddingVertical: vs(6),
    borderRadius: s(20),
  },
  statusText: {
    fontSize: ms(12),
    fontFamily: Fonts.primary,
    fontWeight: '600',
    color: Colors.white,
  },

  // Supplier Section
  supplierSection: {
    backgroundColor: 'rgba(59, 183, 126, 0.08)',
    borderRadius: s(12),
    padding: s(15),
    marginBottom: vs(15),
  },
  supplierLabel: {
    fontSize: ms(11),
    fontFamily: Fonts.primary,
    color: Colors.textSecondary,
    marginBottom: vs(4),
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  supplierName: {
    fontSize: ms(16),
    fontFamily: Fonts.primary,
    fontWeight: '600',
    color: Colors.darkGray,
    marginBottom: vs(2),
  },
  supplierContact: {
    fontSize: ms(13),
    fontFamily: Fonts.primary,
    color: Colors.textSecondary,
  },

  // Divider
  divider: {
    height: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.08)',
    marginVertical: vs(10),
  },

  // Items Section
  itemsSection: {
    marginBottom: vs(10),
  },
  itemsSectionTitle: {
    fontSize: ms(13),
    fontFamily: Fonts.primary,
    fontWeight: '600',
    color: Colors.darkGray,
    marginBottom: vs(12),
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: vs(10),
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.04)',
  },
  itemLeft: {
    flex: 1,
    marginRight: s(15),
  },
  itemName: {
    fontSize: ms(14),
    fontFamily: Fonts.primary,
    fontWeight: '500',
    color: Colors.darkGray,
    marginBottom: vs(3),
  },
  itemDetails: {
    fontSize: ms(12),
    fontFamily: Fonts.primary,
    color: Colors.textSecondary,
    marginBottom: vs(2),
  },
  itemUnitPrice: {
    fontSize: ms(11),
    fontFamily: Fonts.primary,
    color: Colors.textSecondary,
    fontStyle: 'italic',
  },
  itemSubtotal: {
    fontSize: ms(14),
    fontFamily: Fonts.primary,
    fontWeight: '600',
    color: Colors.primary,
    minWidth: s(80),
    textAlign: 'right',
  },

  // Dashed Line
  dashedContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: vs(15),
    paddingHorizontal: s(5),
  },
  dash: {
    width: s(7),
    height: 2,
    backgroundColor: Colors.darkGray,
    borderRadius: 1,
  },

  // Summary Section
  summarySection: {
    marginBottom: vs(5),
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: vs(10),
  },
  summaryLabel: {
    fontSize: ms(14),
    fontFamily: Fonts.primary,
    fontWeight: '500',
    color: Colors.darkGray,
  },
  summaryValue: {
    fontSize: ms(14),
    fontFamily: Fonts.primary,
    fontWeight: '600',
    color: Colors.darkGray,
  },

  // Total Section
  totalSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: vs(5),
  },
  totalLabel: {
    fontSize: ms(16),
    fontFamily: Fonts.primary,
    fontWeight: '600',
    color: '#FF8D2F',
  },
  totalValue: {
    fontSize: ms(22),
    fontFamily: Fonts.primary,
    fontWeight: '700',
    color: '#FF8D2F',
  },

  // Details Card
  detailsCard: {
    backgroundColor: Colors.white,
    padding: s(20),
    borderRadius: s(20),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: vs(14),
  },
  detailLabel: {
    fontSize: ms(14),
    fontFamily: Fonts.primary,
    fontWeight: '600',
    color: Colors.darkGray,
    width: s(80),
  },
  detailColon: {
    fontSize: ms(14),
    fontFamily: Fonts.primary,
    fontWeight: '500',
    color: Colors.darkGray,
    marginHorizontal: s(8),
  },
  detailValue: {
    flex: 1,
    fontSize: ms(14),
    fontFamily: Fonts.primary,
    fontWeight: '400',
    color: Colors.textSecondary,
    lineHeight: ms(20),
  },

  // Payment Badge
  paymentBadgeContainer: {
    flex: 1,
  },
  paymentBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: s(12),
    paddingVertical: vs(6),
    borderRadius: s(12),
  },
  paymentBadgeText: {
    fontSize: ms(12),
    fontFamily: Fonts.primary,
    fontWeight: '600',
  },

  // Button Container
  buttonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.white,
    paddingHorizontal: s(20),
    paddingVertical: vs(15),
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  shareBtn: {
    backgroundColor: Colors.primary,
    height: vs(50),
    borderRadius: s(15),
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  shareText: {
    fontSize: ms(16),
    fontFamily: Fonts.primary,
    fontWeight: '600',
    color: Colors.white,
  },
});
