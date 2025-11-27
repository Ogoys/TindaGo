/**
 * SUPPLIER DETAILS SCREEN
 *
 * Figma File: 8I1Nr3vQZllDDknSevstvH
 * Node: 1571-244 (Add Supplier)
 * Baseline: 440x956
 *
 * Individual supplier view showing:
 * - Supplier contact information (name, type, phone, location)
 * - Purchase order history cards with product details
 * - Total value calculation per order
 * - Quick action: Buy Product button
 *
 * Navigation Flow:
 * - From: Supplier Dashboard (tap supplier card)
 * - To: Record Purchase Order (with supplier pre-selected)
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
  RefreshControl,
  Alert,
  Linking,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { ref, get, query, orderByChild, equalTo } from 'firebase/database';
import { database, auth } from '../../../../FirebaseConfig';
import { s, vs, ms } from '../../../../src/constants/responsive';
import { Colors } from '../../../../src/constants/Colors';
import { Fonts } from '../../../../src/constants/Fonts';
import { PurchaseOrder, PurchaseOrderItem } from '../../../../src/models/PurchaseOrder';

// Define extended colors for this screen based on Figma design
const ScreenColors = {
  ...Colors,
  supplierCardBg: '#DEECFE', // Light blue background for supplier details card
  tealText: '#02545F', // Teal color for total value
  textMuted: 'rgba(30, 30, 30, 0.5)', // Muted text color
};

interface SupplierPurchaseOrder {
  id: string;
  orderNumber: string;
  purchaseDate: string;
  items: {
    productName: string;
    quantity: number;
    subtotal: number;
  }[];
  totalCost: number;
  paymentStatus?: 'paid' | 'unpaid';
  paymentMethod?: string;
  debtDueDate?: string;
}

interface SupplierData {
  name: string;
  type?: string;
  contact?: string;
  address?: string;
  purchaseOrders: SupplierPurchaseOrder[];
  totalValue: number;
  unpaidAmount: number;
  overdueCount: number;
}

const SupplierDetailsScreen = () => {
  const params = useLocalSearchParams();
  const supplierName = params.supplier as string;

  const [supplierData, setSupplierData] = useState<SupplierData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (supplierName) {
      fetchSupplierDetails();
    } else {
      Alert.alert('Error', 'Supplier name is required', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    }
  }, [supplierName]);

  const fetchSupplierDetails = async () => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        setLoading(false);
        setRefreshing(false);
        return;
      }

      let supplierType: string | undefined;
      let supplierContact: string | undefined;
      let supplierAddress: string | undefined;
      const supplierPurchaseOrders: SupplierPurchaseOrder[] = [];
      let totalValue = 0;
      let unpaidAmount = 0;
      let overdueCount = 0;

      // 1. First, try to get supplier info from suppliers collection
      const suppliersRef = ref(database, 'suppliers');
      const suppliersSnapshot = await get(suppliersRef);

      if (suppliersSnapshot.exists()) {
        const suppliers = suppliersSnapshot.val();
        Object.keys(suppliers).forEach((supplierId) => {
          const supplier = suppliers[supplierId];
          if (
            supplier.storeOwnerId === currentUser.uid &&
            supplier.name === supplierName
          ) {
            supplierType = supplier.type || supplier.supplierType || 'General Supplier';
            supplierContact = supplier.contact || supplier.phone || supplier.phoneNumber;
            supplierAddress = supplier.address || supplier.location;
          }
        });
      }

      // 2. Fetch all purchase orders for this supplier
      const purchaseOrdersRef = ref(database, 'purchase_orders');
      const userPurchaseOrdersQuery = query(
        purchaseOrdersRef,
        orderByChild('storeOwnerId'),
        equalTo(currentUser.uid)
      );

      const snapshot = await get(userPurchaseOrdersQuery);

      if (snapshot.exists()) {
        const purchaseOrders = snapshot.val();

        // Process each purchase order for this supplier
        Object.keys(purchaseOrders).forEach((poId) => {
          const po: PurchaseOrder = purchaseOrders[poId];

          // Only process orders from this supplier
          if (po.supplierName === supplierName) {
            totalValue += po.totalCost || 0;

            // Get supplier contact info from purchase order if not already found
            if (po.supplierContact && !supplierContact) {
              supplierContact = po.supplierContact;
            }

            // Build items array
            const items = (po.items || []).map((item: PurchaseOrderItem) => ({
              productName: item.productName,
              quantity: item.quantity,
              subtotal: item.subtotal,
            }));

            // Generate order number (use ID or date-based number)
            const purchaseDate = po.purchaseDate || po.createdAt;
            const orderYear = purchaseDate ? new Date(purchaseDate).getFullYear() : 2025;
            const orderNumber = `${orderYear}-${String(supplierPurchaseOrders.length + 1).padStart(3, '0')}`;

            // Track unpaid amounts and overdue payments
            const isUnpaid = po.paymentStatus === 'unpaid';
            if (isUnpaid) {
              unpaidAmount += po.totalCost || 0;
              
              // Check if overdue
              if (po.debtDueDate) {
                const dueDate = new Date(po.debtDueDate);
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                dueDate.setHours(0, 0, 0, 0);
                if (today > dueDate) {
                  overdueCount++;
                }
              }
            }

            supplierPurchaseOrders.push({
              id: poId,
              orderNumber,
              purchaseDate: purchaseDate || '',
              items,
              totalCost: po.totalCost || 0,
              paymentStatus: po.paymentStatus,
              paymentMethod: po.paymentMethod,
              debtDueDate: po.debtDueDate,
            });
          }
        });

        // Sort by date (most recent first)
        supplierPurchaseOrders.sort(
          (a, b) => new Date(b.purchaseDate).getTime() - new Date(a.purchaseDate).getTime()
        );
      }

      // Set supplier type if still not found
      if (!supplierType) {
        supplierType = 'General Supplier';
      }

      // Always set supplier data (even if no purchase orders)
      setSupplierData({
        name: supplierName,
        type: supplierType,
        contact: supplierContact,
        address: supplierAddress,
        purchaseOrders: supplierPurchaseOrders,
        totalValue,
        unpaidAmount,
        overdueCount,
      });
    } catch (error) {
      console.error('Error fetching supplier details:', error);
      Alert.alert('Error', 'Failed to load supplier details');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchSupplierDetails();
  };

  const handleBack = () => {
    router.back();
  };

  const handleBuyProduct = () => {
    // Navigate to order supplies screen with supplier pre-selected
    router.push({
      pathname: '/(main)/(store-owner)/profile/order-supplies',
      params: {
        supplierName: supplierName,
        supplierContact: supplierData?.contact || '',
      },
    });
  };

  const handleCallSupplier = () => {
    if (supplierData?.contact) {
      const phoneNumber = supplierData.contact.replace(/[^0-9+]/g, '');
      Linking.openURL(`tel:${phoneNumber}`);
    } else {
      Alert.alert('No Contact', 'No contact number available for this supplier');
    }
  };

  const formatDate = (isoString: string) => {
    if (!isoString) return 'N/A';
    const date = new Date(isoString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatCurrency = (amount: number) => {
    return `₱${amount.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor={ScreenColors.backgroundGray} />
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={handleBack} activeOpacity={0.7}>
            <Image
              source={require('../../../../src/assets/images/store-product/chevron-left.png')}
              style={styles.backIcon}
            />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Supplier</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Loading supplier details...</Text>
        </View>
      </View>
    );
  }

  if (!supplierData) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor={ScreenColors.backgroundGray} />
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={handleBack} activeOpacity={0.7}>
            <Image
              source={require('../../../../src/assets/images/store-product/chevron-left.png')}
              style={styles.backIcon}
            />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Supplier</Text>
        </View>
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateIcon}>🏪</Text>
          <Text style={styles.emptyStateText}>Supplier Not Found</Text>
          <Text style={styles.emptyStateSubtext}>Could not find supplier details</Text>
          <TouchableOpacity
            style={styles.emptyStateButton}
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <Text style={styles.emptyStateButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={ScreenColors.backgroundGray} />

      {/* Header - Figma: top: 79, left: 20 for back button, center for title */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack} activeOpacity={0.7}>
          <Image
            source={require('../../../../src/assets/images/store-product/chevron-left.png')}
            style={styles.backIcon}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Supplier</Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.primary]} />
        }
      >
        {/* Supplier Details Card - Figma: blue background #DEECFE, 400x150, borderRadius: 16 */}
        <View style={styles.supplierDetailsCard}>
          <Text style={styles.supplierDetailsTitle}>Supplier Details</Text>
          <Text style={styles.supplierName}>{supplierData.name}</Text>
          {supplierData.type && (
            <Text style={styles.supplierInfoText}>Supplier Type: {supplierData.type}</Text>
          )}
          {supplierData.contact && (
            <TouchableOpacity onPress={handleCallSupplier} activeOpacity={0.7}>
              <Text style={styles.supplierInfoText}>Phone Number: {supplierData.contact}</Text>
            </TouchableOpacity>
          )}
          {supplierData.address && (
            <Text style={styles.supplierInfoText}>Location: {supplierData.address}</Text>
          )}
        </View>

        {/* Unpaid Amount Warning */}
        {supplierData.unpaidAmount > 0 && (
          <View style={styles.unpaidWarningCard}>
            <Text style={styles.unpaidWarningIcon}>💳</Text>
            <View style={styles.unpaidWarningContent}>
              <Text style={styles.unpaidWarningTitle}>Unpaid to Supplier</Text>
              <Text style={styles.unpaidWarningAmount}>{formatCurrency(supplierData.unpaidAmount)}</Text>
              {supplierData.overdueCount > 0 && (
                <Text style={styles.unpaidWarningOverdue}>
                  ⚠️ {supplierData.overdueCount} overdue payment{supplierData.overdueCount > 1 ? 's' : ''}
                </Text>
              )}
            </View>
          </View>
        )}

        {/* Restock Button - Only show if supplier has purchase history */}
        {supplierData.purchaseOrders.length > 0 && (
          <TouchableOpacity
            style={styles.restockButton}
            onPress={() => router.push({
              pathname: '/(main)/(store-owner)/profile/restock-from-supplier' as any,
              params: {
                supplierId: params.supplierId,
                supplierName: supplierData.name,
                supplierContact: supplierData.contact || '',
              }
            })}
            activeOpacity={0.7}
          >
            <View style={styles.restockButtonContent}>
              <View style={styles.restockIconCircle}>
                <Text style={styles.restockIcon}>🔄</Text>
              </View>
              <Text style={styles.restockButtonText}>Restock from {supplierData.name}</Text>
            </View>
            <Text style={styles.restockButtonArrow}>→</Text>
          </TouchableOpacity>
        )}

        {/* Purchase Order Cards - Figma: white background, 400x168, borderRadius: 16 */}
        {supplierData.purchaseOrders.length === 0 ? (
          <View style={styles.noPurchaseOrdersCard}>
            <Text style={styles.noPurchaseOrdersIcon}>📦</Text>
            <Text style={styles.noPurchaseOrdersText}>No Purchase Orders Yet</Text>
            <Text style={styles.noPurchaseOrdersSubtext}>
              Tap "Buy Product" below to create your first order from this supplier
            </Text>
          </View>
        ) : (
          supplierData.purchaseOrders.map((order, index) => {
            const isOverdue = order.paymentStatus === 'unpaid' && order.debtDueDate && 
              new Date() > new Date(order.debtDueDate);
            const isUnpaid = order.paymentStatus === 'unpaid';

            return (
              <TouchableOpacity
                key={order.id}
                style={styles.purchaseOrderCard}
                onPress={() => router.push({
                  pathname: '/profile/purchase-details',
                  params: { purchaseOrderId: order.id }
                })}
                activeOpacity={0.7}
              >
                {/* Order Header */}
                <View style={styles.orderHeaderRow}>
                  <Text style={styles.orderNumber}>{order.orderNumber}</Text>
                  {order.paymentMethod && (
                    <View style={[
                      styles.paymentStatusBadge,
                      { backgroundColor: isOverdue ? '#E92B45' : (isUnpaid ? '#FF9800' : '#4CAF50') }
                    ]}>
                      <Text style={styles.paymentStatusText}>
                        {isOverdue ? 'Overdue' : (isUnpaid ? 'Unpaid' : 'Paid')}
                      </Text>
                    </View>
                  )}
                </View>
                <Text style={styles.orderDate}>{formatDate(order.purchaseDate)}</Text>
                {isOverdue && order.debtDueDate && (
                  <Text style={styles.overdueWarningText}>
                    ⚠️ Overdue since {formatDate(order.debtDueDate)}
                  </Text>
                )}

              {/* Order Items */}
              {order.items.map((item, itemIndex) => (
                <View key={itemIndex} style={styles.orderItemRow}>
                  <Text style={styles.orderItemName}>
                    {item.productName}: (x{item.quantity})
                  </Text>
                  <Text style={styles.orderItemPrice}>{formatCurrency(item.subtotal)}</Text>
                </View>
              ))}

              {/* Separator Line */}
              <Image
                source={require('../../../../src/assets/images/store-owner-supplier-details/separator-line.png')}
                style={styles.separatorLine}
                resizeMode="stretch"
              />

              {/* Total Section */}
              <View style={styles.totalSection}>
                <Text style={styles.totalLabel}>Total Value:</Text>
                <Text style={styles.totalValue}>{formatCurrency(order.totalCost)}</Text>
              </View>
            </TouchableOpacity>
            );
          })
        )}
      </ScrollView>

      {/* Buy Product Button - Figma: bottom button, 400x50, green #3BB77E, borderRadius: 20 */}
      <View style={styles.bottomButtonContainer}>
        <TouchableOpacity style={styles.buyProductButton} onPress={handleBuyProduct} activeOpacity={0.7}>
          <Text style={styles.buyProductButtonText}>Buy Product</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  // Container
  container: {
    flex: 1,
    backgroundColor: ScreenColors.backgroundGray, // #F4F6F6
  },

  // Header - Figma coordinates: title centered, back button at left:20, top:79
  header: {
    backgroundColor: ScreenColors.backgroundGray,
    paddingTop: vs(79),
    paddingBottom: vs(20),
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },

  // Back Button - Figma: 30x30, borderRadius: 20, white bg with shadow
  backButton: {
    position: 'absolute',
    left: s(20),
    top: vs(79),
    width: s(30),
    height: s(30),
    borderRadius: s(20),
    backgroundColor: ScreenColors.white,
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
    height: s(15),
  },

  // Header Title - Figma: font-size 20, font-weight 600, color #1E1E1E
  headerTitle: {
    fontFamily: Fonts.primary,
    fontWeight: '600',
    fontSize: ms(20),
    lineHeight: vs(22),
    color: ScreenColors.darkGray, // #1E1E1E
    textAlign: 'center',
  },

  // Scroll Content
  scrollContent: {
    paddingHorizontal: s(20),
    paddingBottom: vs(100), // Space for bottom button
  },

  // Loading State
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: vs(100),
  },

  loadingText: {
    fontFamily: Fonts.primary,
    fontSize: ms(16),
    color: ScreenColors.textSecondary,
    marginTop: vs(15),
  },

  // Empty State
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: s(40),
  },

  emptyStateIcon: {
    fontSize: ms(80),
    marginBottom: vs(20),
  },

  emptyStateText: {
    fontFamily: Fonts.primary,
    fontWeight: '600',
    fontSize: ms(20),
    color: ScreenColors.darkGray,
    marginBottom: vs(10),
    textAlign: 'center',
  },

  emptyStateSubtext: {
    fontFamily: Fonts.primary,
    fontSize: ms(14),
    color: ScreenColors.textSecondary,
    textAlign: 'center',
    marginBottom: vs(30),
  },

  emptyStateButton: {
    backgroundColor: Colors.primary,
    borderRadius: s(12),
    paddingVertical: vs(12),
    paddingHorizontal: s(32),
  },

  emptyStateButtonText: {
    fontFamily: Fonts.primary,
    fontWeight: '600',
    fontSize: ms(15),
    color: ScreenColors.white,
  },

  // No Purchase Orders Card
  noPurchaseOrdersCard: {
    width: s(400),
    backgroundColor: ScreenColors.white,
    borderRadius: s(16),
    padding: s(30),
    marginBottom: vs(15),
    alignItems: 'center',
    shadowColor: 'rgba(0, 0, 0, 0.15)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 4,
  },

  noPurchaseOrdersIcon: {
    fontSize: ms(48),
    marginBottom: vs(15),
  },

  noPurchaseOrdersText: {
    fontFamily: Fonts.primary,
    fontWeight: '600',
    fontSize: ms(16),
    color: ScreenColors.darkGray,
    marginBottom: vs(8),
    textAlign: 'center',
  },

  noPurchaseOrdersSubtext: {
    fontFamily: Fonts.primary,
    fontSize: ms(13),
    color: ScreenColors.textSecondary,
    textAlign: 'center',
    lineHeight: vs(18),
  },

  // Supplier Details Card - Figma: 400x150, #DEECFE bg, borderRadius: 16, shadow
  supplierDetailsCard: {
    width: s(400),
    minHeight: vs(150),
    backgroundColor: ScreenColors.supplierCardBg, // #DEECFE
    borderRadius: s(16),
    padding: s(20),
    marginBottom: vs(15),
    shadowColor: 'rgba(0, 0, 0, 0.25)',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 5,
    elevation: 5,
  },

  // Supplier Details Title - Figma: font-size 18, font-weight 500, color #000000
  supplierDetailsTitle: {
    fontFamily: Fonts.primary,
    fontWeight: '500',
    fontSize: ms(18),
    lineHeight: vs(22),
    color: ScreenColors.black, // #000000
    marginBottom: vs(10),
  },

  // Supplier Name - Figma: font-size 16, font-weight 500, color #1E1E1E
  supplierName: {
    fontFamily: Fonts.primary,
    fontWeight: '500',
    fontSize: ms(16),
    lineHeight: vs(22),
    color: ScreenColors.darkGray, // #1E1E1E
    marginBottom: vs(8),
  },

  // Supplier Info Text - Figma: font-size 14, font-weight 500, color #1E1E1E
  supplierInfoText: {
    fontFamily: Fonts.primary,
    fontWeight: '500',
    fontSize: ms(14),
    lineHeight: vs(17),
    color: ScreenColors.darkGray, // #1E1E1E
    marginBottom: vs(4),
  },

  // Purchase Order Card - Figma: 400x168, white bg, borderRadius: 16, shadow
  purchaseOrderCard: {
    width: s(400),
    minHeight: vs(168),
    backgroundColor: ScreenColors.white,
    borderRadius: s(16),
    padding: s(20),
    marginBottom: vs(15),
    shadowColor: 'rgba(0, 0, 0, 0.25)',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 5,
    elevation: 5,
  },

  // Order Number - Figma: font-size 18, font-weight 500, color #000000
  orderNumber: {
    fontFamily: Fonts.primary,
    fontWeight: '500',
    fontSize: ms(18),
    lineHeight: vs(22),
    color: ScreenColors.black,
    marginBottom: vs(4),
  },

  // Order Date - Figma: font-size 14, font-weight 500, color rgba(30,30,30,0.5)
  orderDate: {
    fontFamily: Fonts.primary,
    fontWeight: '500',
    fontSize: ms(14),
    lineHeight: vs(22),
    color: ScreenColors.textMuted, // rgba(30, 30, 30, 0.5)
    marginBottom: vs(12),
  },

  // Order Item Row
  orderItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: vs(6),
  },

  // Order Item Name - Figma: font-size 14, font-weight 500, color rgba(30,30,30,0.5)
  orderItemName: {
    fontFamily: Fonts.primary,
    fontWeight: '500',
    fontSize: ms(14),
    lineHeight: vs(17),
    color: ScreenColors.textMuted,
    flex: 1,
  },

  // Order Item Price - Figma: font-size 14, font-weight 500, color rgba(30,30,30,0.5)
  orderItemPrice: {
    fontFamily: Fonts.primary,
    fontWeight: '500',
    fontSize: ms(14),
    lineHeight: vs(17),
    color: ScreenColors.textMuted,
    textAlign: 'right',
  },

  // Separator Line
  separatorLine: {
    width: s(360),
    height: vs(2),
    marginVertical: vs(12),
    alignSelf: 'center',
    opacity: 0.5,
  },

  // Total Section
  totalSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  // Total Label - Figma: font-size 12, font-weight 500, color #1E1E1E
  totalLabel: {
    fontFamily: Fonts.primary,
    fontWeight: '500',
    fontSize: ms(12),
    lineHeight: vs(15),
    color: ScreenColors.darkGray,
  },

  // Total Value - Figma: font-size 12, font-weight 500, color #02545F (teal)
  totalValue: {
    fontFamily: Fonts.primary,
    fontWeight: '500',
    fontSize: ms(12),
    lineHeight: vs(15),
    color: ScreenColors.tealText, // #02545F
  },

  // Bottom Button Container
  bottomButtonContainer: {
    position: 'absolute',
    bottom: vs(30),
    left: s(20),
    right: s(20),
  },

  // Buy Product Button - Figma: 400x50, #3BB77E bg, borderRadius: 20, shadow
  buyProductButton: {
    width: s(400),
    height: vs(50),
    backgroundColor: Colors.primary, // #3BB77E
    borderRadius: s(20),
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: 'rgba(0, 0, 0, 0.25)',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 4,
  },

  // Buy Product Button Text - Figma: font-size 20, font-weight 500, color white
  buyProductButtonText: {
    fontFamily: Fonts.primary,
    fontWeight: '500',
    fontSize: ms(20),
    lineHeight: vs(22),
    color: ScreenColors.white,
    textAlign: 'center',
  },

  // Unpaid Warning Card
  unpaidWarningCard: {
    width: s(400),
    backgroundColor: '#FFF3E0',
    borderRadius: s(16),
    padding: s(20),
    marginBottom: vs(15),
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FF9800',
    shadowColor: 'rgba(0, 0, 0, 0.15)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 4,
  },

  unpaidWarningIcon: {
    fontSize: ms(40),
    marginRight: s(15),
  },

  unpaidWarningContent: {
    flex: 1,
  },

  unpaidWarningTitle: {
    fontFamily: Fonts.primary,
    fontWeight: '600',
    fontSize: ms(14),
    color: ScreenColors.darkGray,
    marginBottom: vs(4),
  },

  unpaidWarningAmount: {
    fontFamily: Fonts.primary,
    fontWeight: '700',
    fontSize: ms(24),
    color: '#FF9800',
    marginBottom: vs(4),
  },

  unpaidWarningOverdue: {
    fontFamily: Fonts.primary,
    fontSize: ms(12),
    color: '#E92B45',
    fontWeight: '600',
  },

  // Restock Button
  restockButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.primary,
    marginHorizontal: s(20),
    marginBottom: vs(20),
    paddingVertical: vs(16),
    paddingHorizontal: s(20),
    borderRadius: s(16),
    shadowColor: 'rgba(0, 0, 0, 0.15)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 4,
  },

  restockButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },

  restockIconCircle: {
    width: s(40),
    height: s(40),
    borderRadius: s(20),
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: s(12),
  },

  restockIcon: {
    fontSize: ms(20),
  },

  restockButtonText: {
    fontFamily: Fonts.primary,
    fontSize: ms(16),
    fontWeight: '600',
    color: Colors.white,
    flex: 1,
  },

  restockButtonArrow: {
    fontFamily: Fonts.primary,
    fontSize: ms(20),
    color: Colors.white,
    fontWeight: '600',
  },

  // Order Header Row
  orderHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: vs(4),
  },

  // Payment Status Badge
  paymentStatusBadge: {
    paddingHorizontal: s(10),
    paddingVertical: vs(4),
    borderRadius: s(8),
  },

  paymentStatusText: {
    fontFamily: Fonts.primary,
    fontSize: ms(11),
    color: ScreenColors.white,
    fontWeight: '600',
  },

  // Overdue Warning Text
  overdueWarningText: {
    fontFamily: Fonts.primary,
    fontSize: ms(12),
    color: '#E92B45',
    fontWeight: '600',
    marginBottom: vs(8),
  },
});

export default SupplierDetailsScreen;
