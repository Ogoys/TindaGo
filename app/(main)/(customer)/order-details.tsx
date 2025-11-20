import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  StatusBar,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { ref, onValue } from 'firebase/database';
import { database } from '../../../FirebaseConfig';
import { s, vs, ms } from "../../../src/constants/responsive";
import { Colors } from "../../../src/constants/Colors";
import type { Order } from '../../../src/models/Order';
import { OrderProcessCompleteModal } from '../../../src/components/ui';
import { getProductImageSource } from '../../../src/lib/helpers/imageHelper';

/**
 * ORDER DETAILS PAGE - PIXEL-PERFECT FIGMA CONVERSION
 *
 * Figma File: 8I1Nr3vQZllDDknSevstvH
 * Node: 759-4020 (Order History)
 * Baseline: 440x956
 *
 * Shows detailed order information including:
 * - Order status timeline
 * - Itemized bill breakdown
 * - Payment method
 */

export default function OrderDetailsScreen() {
  const params = useLocalSearchParams();
  const orderId = params.id as string;
  const testMode = params.test === 'true'; // Enable test mode via ?test=true

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [hasShownModal, setHasShownModal] = useState(false);

  // Fetch order data from Firebase (or use mock data in test mode)
  useEffect(() => {
    if (testMode) {
      // Mock order data for testing
      // You can change status to 'picked_up' to test the complete modal
      setOrder({
        id: 'TEST-ORDER-001',
        orderNumber: 'ORD-2025-001234',
        customerId: 'test-customer',
        customerName: 'Test Customer',
        customerPhone: '+63 912 345 6789',
        storeId: 'test-store-123',
        storeName: 'Sample Sari-Sari Store',
        items: [
          {
            productId: 'test-product-1',
            productName: 'Sample Product 1',
            productImage: '',
            quantity: 2,
            price: 50.00,
            subtotal: 100.00,
          },
          {
            productId: 'test-product-2',
            productName: 'Sample Product 2',
            productImage: '',
            quantity: 1,
            price: 250.50,
            subtotal: 250.50,
          },
        ],
        subtotal: 350.50,
        total: 350.50,
        status: 'preparing', // Change to 'picked_up' or 'completed' to test modal
        paymentMethod: 'gcash',
        paymentStatus: 'paid',
        xenditInvoiceId: 'XNDT-INV-2025-001234',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        completedAt: new Date().toISOString(),
      } as Order);
      setLoading(false);
      return;
    }

    if (!orderId) {
      setLoading(false);
      return;
    }

    const orderRef = ref(database, `orders/${orderId}`);
    const unsubscribe = onValue(orderRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const orderData = { ...data, id: orderId } as Order;
        setOrder(orderData);
        
        // Show modal when order is completed (picked_up or completed status)
        // AND user hasn't given feedback yet (feedbackGiven is not true)
        const shouldShowModal = 
          (orderData.status === 'picked_up' || orderData.status === 'completed') && 
          !orderData.feedbackGiven && 
          !hasShownModal;
        
        if (shouldShowModal) {
          setTimeout(() => {
            setShowCompleteModal(true);
            setHasShownModal(true);
          }, 500); // Small delay for smooth transition
        }
      } else {
        setOrder(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [orderId, testMode, hasShownModal]);

  // Format date and time
  const formatDate = (date: Date | string | undefined) => {
    if (!date) return 'N/A';
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
  };

  const formatTime = (date: Date | string | undefined) => {
    if (!date) return 'N/A';
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  // Get payment method display name
  const getPaymentMethodName = (method: string) => {
    switch (method) {
      case 'cash':
        return 'Cash on Pickup';
      case 'gcash':
        return 'GCash';
      case 'paymaya':
        return 'PayMaya';
      default:
        return method;
    }
  };

  // Render dynamic progress timeline based on order status
  const renderProgressTimeline = (order: Order) => {
    // Define progress steps
    const steps = [
      { status: 'pending', label: 'Order Placed', icon: '📋' },
      { status: 'preparing', label: 'Preparing Your Order', icon: '🛍️' },
      { status: 'ready', label: 'Ready for Pickup', icon: '✅' },
      { status: 'picked_up', label: 'Order Completed', icon: '📦' },
    ];

    // Determine which steps are completed
    const statusOrder = ['pending', 'preparing', 'ready', 'picked_up'];
    const currentStatusIndex = statusOrder.indexOf(order.status);

    return steps.map((step, index) => {
      const isCompleted = index <= currentStatusIndex;
      const isActive = index === currentStatusIndex;

      // Get timestamp for this step
      let timestamp = 'Pending';
      if (isCompleted) {
        if (index === 0) timestamp = formatTime(order.createdAt);
        else if (step.status === order.status) timestamp = formatTime(order.updatedAt);
        else if (step.status === 'picked_up' && order.completedAt) timestamp = formatTime(order.completedAt);
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
              isActive && styles.progressTextActive
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
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Loading order details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!order) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loadingContainer}>
          <Text style={styles.errorText}>Order not found</Text>
          <TouchableOpacity
            style={styles.backToOrdersButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backToOrdersText}>Back to Orders</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Normalize payment status for type-safe comparisons
  const isPaid = ['PAID', 'SETTLED'].includes(String(order.paymentStatus || '').toUpperCase());

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#F4F6F6" />

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* STATUS BAR - Figma: 759:4121, x:0, y:0, width:439.5, height:54 */}
        {/* iOS Status Bar rendered by SafeAreaView */}

        {/* BACK BUTTON - Figma: 759:4024, x:20, y:79, width:30, height:30 */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <View style={styles.backButtonCircle} />
          <Image
            source={require("../../../src/assets/images/customer-order-details/chevron-left.png")}
            style={styles.backButtonIcon}
            resizeMode="contain"
          />
        </TouchableOpacity>

        {/* NOTIFICATION BUTTON - Figma: 759:4021, x:375, y:74, width:40, height:40 */}
        <TouchableOpacity style={styles.notificationButton} activeOpacity={0.7}>
          <View style={styles.notificationCircle} />
          <Image
            source={require("../../../src/assets/images/customer-order-details/notification-icon.png")}
            style={styles.notificationIcon}
            resizeMode="contain"
          />
        </TouchableOpacity>

        {/* TITLE - Figma: 759:4026, x:156, y:83, width:129, height:22 */}
        <Text style={styles.title}>Order Details</Text>

        {/* ORDER ID SECTION - Figma: 759:4027 & 759:4028, y:149 */}
        <View style={styles.orderIdContainer}>
          <Text style={styles.orderIdLabel}>Order ID :</Text>
          <Text style={styles.orderIdValue}>{order.orderNumber}</Text>
        </View>

        {/* Payment status badge */}
        <View style={styles.paymentRow}>
          <Text style={styles.paymentLabel}>Payment:</Text>
          <View style={[
            styles.paymentBadge,
            isPaid ? styles.paymentBadgePaid : styles.paymentBadgePending
          ]}>
            <Text style={[
              styles.paymentBadgeText,
              isPaid ? styles.paymentBadgeTextPaid : styles.paymentBadgeTextPending
            ]}>
              {isPaid ? 'Paid' : 'Pending'}
            </Text>
          </View>
        </View>

        {/* Store name */}
        <View style={styles.storeRow}>
          <Text style={styles.storeLabel}>Store:</Text>
          <Text style={styles.storeValue}>{order.storeName}</Text>
        </View>

        {/* STATUS ORDER CARD - Figma: 759:4029, x:20, y:191, width:400, height:200 */}
        <View style={styles.statusOrderCard}>
          {/* Card Background - Figma: 759:4030 */}
          <View style={styles.statusCardBackground} />

          {/* DYNAMIC REAL-TIME STATUS TIMELINE */}
          <View style={styles.timelineContainer}>
            {renderProgressTimeline(order)}
          </View>
        </View>

        {/* ORDER ITEMS CARD - Enhanced Professional Design with Scrollable Items */}
        <View style={styles.orderListCard}>
          {/* Card Background */}
          <View style={styles.orderListBackground} />

          {/* Card Header */}
          <View style={styles.cardHeader}>
            <Text style={styles.cardHeaderTitle}>Order Summary</Text>
            <View style={styles.itemCountBadge}>
              <Text style={styles.itemCountText}>{order.items.length} {order.items.length === 1 ? 'Item' : 'Items'}</Text>
            </View>
          </View>

          {/* Header Divider */}
          <View style={styles.headerDivider} />

          {/* Scrollable Order Items List */}
          <ScrollView
            style={styles.itemsScrollView}
            showsVerticalScrollIndicator={true}
            nestedScrollEnabled={true}
          >
            <View style={styles.itemsListContainer}>
              {order.items.map((item, index) => {
                const imageSource = getProductImageSource({
                  productImageUrl: (item as any).productImageUrl,
                  productImage: item.productImage
                }, 'small');

                return (
                  <View key={item.productId} style={styles.modernItemRow}>
                    {/* Item Info Section */}
                    <View style={styles.itemInfoSection}>
                      {/* Product Image */}
                      <View style={styles.productIconContainer}>
                        <Image
                          source={imageSource}
                          style={styles.productImage}
                          resizeMode="cover"
                        />
                      </View>

                      {/* Product Details */}
                      <View style={styles.productDetails}>
                        <Text style={styles.modernItemName} numberOfLines={2}>
                          {item.productName}
                        </Text>
                        {item.weight && item.unit && (
                          <Text style={styles.itemWeight}>
                            {item.weight} {item.unit}
                          </Text>
                        )}
                        <Text style={styles.itemPrice}>
                          ₱{item.price.toFixed(2)} each
                        </Text>
                      </View>
                    </View>

                    {/* Quantity & Amount Section */}
                    <View style={styles.itemQuantitySection}>
                      <View style={styles.quantityBadge}>
                        <Text style={styles.quantityText}>×{item.quantity}</Text>
                      </View>
                      <Text style={styles.modernItemAmount}>₱{item.subtotal.toFixed(2)}</Text>
                    </View>

                    {/* Item Divider (not for last item) */}
                    {index < order.items.length - 1 && (
                      <View style={styles.itemDivider} />
                    )}
                  </View>
                );
              })}
            </View>
          </ScrollView>

          {/* Billing Section */}
          <View style={styles.billingSection}>
            <View style={styles.billingSeparator} />

            {/* Subtotal Row */}
            <View style={styles.billingRow}>
              <Text style={styles.billingLabel}>Subtotal</Text>
              <Text style={styles.billingValue}>₱{order.subtotal.toFixed(2)}</Text>
            </View>

            {/* Total Divider */}
            <View style={styles.totalDivider} />

            {/* Grand Total Row */}
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total Amount</Text>
              <Text style={styles.totalValue}>₱{order.total.toFixed(2)}</Text>
            </View>
          </View>
        </View>

        {/* BILL CARD - Invoice Link */}
        <View style={styles.billCard}>
          {/* Bill Background with Dashed Edges */}
          <View style={styles.billBackground} />

          {/* Invoice - Figma: 759:4082 & 759:4083 */}
          <View style={styles.billRowInvoice}>
            <Text style={styles.billLabel}>Invoice</Text>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => {
                if (testMode) {
                  router.push(`/(main)/(customer)/invoice?id=${order.id}&test=true` as any);
                } else {
                  router.push(`/(main)/(customer)/invoice?id=${order.id}` as any);
                }
              }}
            >
              <Text style={styles.viewInvoiceLink}>View Invoice</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* PAYMENT METHOD LABEL - Figma: 759:4112, x:20, y:751, width:153, height:22 */}
        <Text style={styles.paymentMethodLabel}>Payment Method</Text>

        {/* PAYMENT METHOD CARD - Figma: 759:4114, x:20, y:793, width:400, height:60 */}
        <View style={styles.paymentCard}>
          <View style={styles.paymentCardBackground} />
          <View style={styles.paymentContent}>
            {order.paymentMethod === 'cash' ? (
              <>
                <View style={styles.cashIconCircle}>
                  <Text style={styles.cashIconText}>₱</Text>
                </View>
                <Text style={styles.paymentText}>{getPaymentMethodName(order.paymentMethod)}</Text>
              </>
            ) : order.paymentMethod === 'gcash' ? (
              <>
                <Image
                  source={require("../../../src/assets/images/payment/gcash-icon.png")}
                  style={styles.paymentIcon}
                  resizeMode="contain"
                />
                <Text style={styles.paymentText}>{getPaymentMethodName(order.paymentMethod)}</Text>
              </>
            ) : order.paymentMethod === 'paymaya' ? (
              <>
                <Image
                  source={require("../../../src/assets/images/payment/paymaya-icon.png")}
                  style={styles.paymentIcon}
                  resizeMode="contain"
                />
                <Text style={styles.paymentText}>{getPaymentMethodName(order.paymentMethod)}</Text>
              </>
            ) : (
              <>
                <Image
                  source={require("../../../src/assets/images/customer-order-details/paypal-icon.png")}
                  style={styles.paypalIcon}
                  resizeMode="contain"
                />
                <Text style={styles.paymentText}>{getPaymentMethodName(order.paymentMethod)}</Text>
              </>
            )}
          </View>
        </View>

        {/* Bottom Padding */}
        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* Order Process Complete Modal */}
      <OrderProcessCompleteModal
        visible={showCompleteModal}
        onClose={() => setShowCompleteModal(false)}
        orderId={order.id}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  // CONTAINER - Figma: 759:4020, 440x956, background:#F4F6F6
  container: {
    flex: 1,
    backgroundColor: "#F4F6F6", // Figma: fill_WZP0OZ
  },

  scrollView: {
    flex: 1,
  },

  scrollContent: {
    paddingBottom: vs(40),
  },

  // BACK BUTTON - Figma: 759:4024, x:20, y:79, width:30, height:30
  backButton: {
    position: "absolute",
    left: s(20),
    top: vs(79),
    width: s(30),
    height: s(30),
    zIndex: 10,
  },

  // Back Button Circle Background - Figma: white circle with shadow
  backButtonCircle: {
    position: "absolute",
    width: s(30),
    height: s(30),
    borderRadius: s(20),
    backgroundColor: "#FFFFFF",
    shadowColor: "rgba(0, 0, 0, 0.25)",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: s(4),
    elevation: 4,
  },

  // Back Button Icon - Figma: 759:4025, 15x15
  backButtonIcon: {
    position: "absolute",
    left: s(7.5),
    top: s(7.5),
    width: s(15),
    height: s(15),
  },

  // NOTIFICATION BUTTON - Figma: 759:4021, x:375, y:74, width:40, height:40
  notificationButton: {
    position: "absolute",
    left: s(375),
    top: vs(74),
    width: s(40),
    height: s(40),
    zIndex: 10,
  },

  // Notification Circle - Figma: 759:4022
  notificationCircle: {
    position: "absolute",
    width: s(40),
    height: s(40),
    borderRadius: s(20),
    backgroundColor: "#FFFFFF",
    shadowColor: "rgba(0, 0, 0, 0.25)",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: s(10),
    elevation: 10,
  },

  // Notification Icon - Figma: 759:4023, 25x25
  notificationIcon: {
    position: "absolute",
    left: s(7),
    top: s(7),
    width: s(25),
    height: s(25),
  },

  // TITLE - Figma: 759:4026, x:156, y:83, width:129, height:22
  title: {
    position: "absolute",
    left: s(156),
    top: vs(83),
    width: s(129),
    height: vs(22),
    fontFamily: "Clash Grotesk Variable",
    fontWeight: "600",
    fontSize: ms(20),
    lineHeight: ms(20) * 1.1,
    textAlign: "center",
    color: "#1E1E1E", // Figma: fill_T5S7YD
  },

  // ORDER ID CONTAINER - Figma: y:149
  orderIdContainer: {
    position: "absolute",
    left: s(20),
    top: vs(149),
    flexDirection: "row",
    alignItems: "center",
  },

  // Order ID Label - Figma: 759:4027, x:20, y:149
  orderIdLabel: {
    fontFamily: "Clash Grotesk Variable",
    fontWeight: "500",
    fontSize: ms(16),
    lineHeight: ms(16) * 1.375,
    textAlign: "center",
    color: "rgba(30, 30, 30, 0.5)", // Figma: fill_X1Q1GT
  },

  // Order ID Value - Figma: 759:4028, x:97, y:149
  orderIdValue: {
    marginLeft: s(10),
    fontFamily: "Clash Grotesk Variable",
    fontWeight: "500",
    fontSize: ms(16),
    lineHeight: ms(16) * 1.375,
    textAlign: "center",
    color: "rgba(30, 30, 30, 0.5)", // Figma: fill_X1Q1GT
  },

  paymentRow: {
    position: "absolute",
    left: s(20),
    top: vs(175),
    flexDirection: 'row',
    alignItems: 'center',
  },
  paymentLabel: {
    fontFamily: "Clash Grotesk Variable",
    fontWeight: "500",
    fontSize: ms(14),
    color: 'rgba(30, 30, 30, 0.5)'
  },
  paymentBadge: {
    marginLeft: s(8),
    borderRadius: s(10),
    paddingHorizontal: s(10),
    paddingVertical: vs(4),
  },
  paymentBadgePaid: { backgroundColor: 'rgba(52,199,89,0.15)' },
  paymentBadgePending: { backgroundColor: 'rgba(128,128,128,0.15)' },
  paymentBadgeText: {
    fontFamily: "Clash Grotesk Variable",
    fontWeight: "700",
    fontSize: ms(12),
  },
  paymentBadgeTextPaid: { color: '#34C759' },
  paymentBadgeTextPending: { color: '#666666' },

  storeRow: {
    position: "absolute",
    left: s(20),
    top: vs(200),
    flexDirection: 'row',
    alignItems: 'center',
  },
  storeLabel: {
    fontFamily: "Clash Grotesk Variable",
    fontWeight: "500",
    fontSize: ms(14),
    color: 'rgba(30, 30, 30, 0.5)'
  },
  storeValue: {
    marginLeft: s(8),
    fontFamily: "Clash Grotesk Variable",
    fontWeight: "600",
    fontSize: ms(14),
    color: '#1E1E1E'
  },

  // STATUS ORDER CARD
  statusOrderCard: {
    position: "absolute",
    left: s(20),
    top: vs(230),
    width: s(400),
    height: vs(280), // Increased from 260 to 280 for more bottom space
  },

  // Status Card Background - Figma: 759:4030, white rectangle with shadow
  statusCardBackground: {
    position: "absolute",
    width: s(400),
    height: vs(280), // Increased from 260 to 280 to match card height
    backgroundColor: "#FFFFFF",
    borderRadius: s(20),
    shadowColor: "rgba(0, 0, 0, 0.25)",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: s(5),
    elevation: 5,
  },

  // Lines Container - Figma: 759:4031, x:46, y:226
  linesContainer: {
    position: "absolute",
    left: s(46),
    top: vs(35), // Adjusted from 226 to be relative to card
  },

  // Status Line - Figma: 759:4032, 759:4033, 759:4034 (vertical dashed lines)
  statusLine: {
    width: 1,
    height: vs(30),
    borderLeftWidth: 1,
    borderLeftColor: "#3BB77E",
    borderStyle: "dashed",
  },

  // STATUS ITEM 1 - Order Confirmed - Figma: x:36, y:206
  statusItem1: {
    position: "absolute",
    left: s(16), // 36 - 20 (card offset)
    top: vs(15), // 206 - 191 (card top)
    flexDirection: "row",
    alignItems: "center",
  },

  statusIconContainer: {
    width: s(20),
    height: s(20),
    justifyContent: "center",
    alignItems: "center",
  },

  // Check Circle - Figma: 759:4036
  checkCircle: {
    position: "absolute",
    width: s(20),
    height: s(20),
    borderRadius: s(10),
    backgroundColor: "#3BB77E", // Figma: fill_BHDJLP
  },

  // Check Icon Container - Figma: 759:4037
  checkIcon: {
    width: s(15),
    height: s(15),
    justifyContent: "center",
    alignItems: "center",
  },

  // Check Mark - Programmatically created since SVG wasn't available
  checkMark: {
    width: s(10),
    height: s(7),
    borderBottomWidth: 2,
    borderLeftWidth: 2,
    borderColor: "#FFFFFF",
    transform: [{ rotate: "-45deg" }],
    marginTop: -s(2),
  },

  // Status Text Confirmed - Figma: 759:4045, x:82, y:206
  statusTextConfirmed: {
    marginLeft: s(46), // 82 - 36
    fontFamily: "Clash Grotesk Variable",
    fontWeight: "500",
    fontSize: ms(16),
    lineHeight: ms(16) * 1.23,
    color: "#3BB77E",
  },

  // Status Time 1 - Figma: 759:4048, x:342, y:206
  statusTime1: {
    position: "absolute",
    left: s(306), // 342 - 36
    fontFamily: "Clash Grotesk Variable",
    fontWeight: "500",
    fontSize: ms(16),
    lineHeight: ms(16) * 1.23,
    color: "#3BB77E",
  },

  // STATUS ITEM 2 - Preparing Order - Figma: x:36, y:256
  statusItem2: {
    position: "absolute",
    left: s(16),
    top: vs(65), // 256 - 191
    flexDirection: "row",
    alignItems: "center",
  },

  // Process Circle - Figma: 759:4040
  processCircle: {
    position: "absolute",
    width: s(20),
    height: s(20),
    borderRadius: s(10),
    backgroundColor: "#3BB77E",
  },

  // Process Icon - Figma: 759:4041
  processIcon: {
    width: s(20),
    height: s(20),
    borderRadius: s(10),
  },

  // Status Text - Figma: 759:4046, 759:4047, 759:4054
  statusText: {
    marginLeft: s(46),
    fontFamily: "Clash Grotesk Variable",
    fontWeight: "500",
    fontSize: ms(16),
    lineHeight: ms(16) * 1.23,
    color: "#3BB77E",
  },

  // Status Time 2 - Figma: 759:4049, x:342, y:256
  statusTime2: {
    position: "absolute",
    left: s(306),
    fontFamily: "Clash Grotesk Variable",
    fontWeight: "500",
    fontSize: ms(16),
    lineHeight: ms(16) * 1.23,
    color: "#3BB77E",
  },

  // STATUS ITEM 3 - Ready to Pickup - Figma: x:36, y:306
  statusItem3: {
    position: "absolute",
    left: s(16),
    top: vs(115), // 306 - 191
    flexDirection: "row",
    alignItems: "center",
  },

  // Pickup Circle - Figma: 759:4043, 759:4052
  pickupCircle: {
    position: "absolute",
    width: s(20),
    height: s(20),
    borderRadius: s(10),
    backgroundColor: "#3BB77E",
  },

  // Pickup Icon - Figma: 759:4044, 759:4053
  pickupIcon: {
    width: s(14),
    height: s(12),
  },

  // Status Time 3 - Figma: 759:4050, x:342, y:306
  statusTime3: {
    position: "absolute",
    left: s(306),
    fontFamily: "Clash Grotesk Variable",
    fontWeight: "500",
    fontSize: ms(16),
    lineHeight: ms(16) * 1.23,
    color: "#3BB77E",
  },

  // STATUS ITEM 4 - Pickup Order - Figma: x:36, y:356
  statusItem4: {
    position: "absolute",
    left: s(16),
    top: vs(165), // 356 - 191
    flexDirection: "row",
    alignItems: "center",
  },

  // Status Time 4 - Figma: 759:4055, x:342, y:356
  statusTime4: {
    position: "absolute",
    left: s(306),
    fontFamily: "Clash Grotesk Variable",
    fontWeight: "500",
    fontSize: ms(16),
    lineHeight: ms(16) * 1.23,
    color: "#3BB77E",
  },
  // ORDER LIST CARD - Fixed height with scrollable items
  orderListCard: {
    position: "absolute",
    left: s(20),
    top: vs(520),
    width: s(400),
    height: vs(520), // Fixed height
  },

  // Order List Background - White card with shadow
  orderListBackground: {
    position: "absolute",
    width: s(400),
    height: vs(520), // Fixed height
    backgroundColor: "#FFFFFF",
    borderRadius: s(20),
    shadowColor: "rgba(0, 0, 0, 0.15)",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: s(12),
    elevation: 8,
  },

  // Card Header Section
  cardHeader: {
    position: "absolute",
    top: vs(20),
    left: s(20),
    right: s(20),
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  cardHeaderTitle: {
    fontFamily: "Clash Grotesk Variable",
    fontWeight: "600",
    fontSize: ms(18),
    color: "#1E1E1E",
  },

  itemCountBadge: {
    backgroundColor: "#E8F5E9",
    paddingHorizontal: s(12),
    paddingVertical: vs(4),
    borderRadius: s(12),
  },

  itemCountText: {
    fontFamily: "Clash Grotesk Variable",
    fontWeight: "500",
    fontSize: ms(12),
    color: "#3BB77E",
  },

  // Header Divider
  headerDivider: {
    position: "absolute",
    top: vs(55),
    left: s(20),
    right: s(20),
    height: 1,
    backgroundColor: "#E5E7EB",
  },

  // Items ScrollView - Scrollable container for items
  itemsScrollView: {
    position: "absolute",
    top: vs(70),
    left: 0,
    right: 0,
    height: vs(250), // Max height for scrolling
    paddingHorizontal: s(20),
  },

  // Items List Container
  itemsListContainer: {
    paddingBottom: vs(10),
  },

  // Modern Item Row - Each product row
  modernItemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: vs(12),
    minHeight: vs(70),
  },

  // Item Info Section (Left side)
  itemInfoSection: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: s(10),
  },

  // Product Icon Container
  productIconContainer: {
    marginRight: s(12),
    width: s(48),
    height: s(48),
    borderRadius: s(12),
    overflow: 'hidden',
    backgroundColor: "#F3F4F6",
  },

  productImage: {
    width: s(48),
    height: s(48),
  },

  // Product Details
  productDetails: {
    flex: 1,
  },

  modernItemName: {
    fontFamily: "Clash Grotesk Variable",
    fontWeight: "500",
    fontSize: ms(14),
    color: "#1E1E1E",
    lineHeight: ms(14) * 1.4,
    marginBottom: vs(2),
  },

  itemWeight: {
    fontFamily: "Clash Grotesk Variable",
    fontWeight: "400",
    fontSize: ms(11),
    color: "#6B7280",
    marginBottom: vs(2),
  },

  itemPrice: {
    fontFamily: "Clash Grotesk Variable",
    fontWeight: "400",
    fontSize: ms(12),
    color: "#9CA3AF",
  },

  // Item Quantity Section (Right side)
  itemQuantitySection: {
    alignItems: "flex-end",
  },

  quantityBadge: {
    backgroundColor: "#F3F4F6",
    paddingHorizontal: s(10),
    paddingVertical: vs(4),
    borderRadius: s(8),
    marginBottom: vs(6),
  },

  quantityText: {
    fontFamily: "Clash Grotesk Variable",
    fontWeight: "600",
    fontSize: ms(12),
    color: "#374151",
  },

  modernItemAmount: {
    fontFamily: "Clash Grotesk Variable",
    fontWeight: "600",
    fontSize: ms(16),
    color: "#3BB77E",
  },

  // Item Divider
  itemDivider: {
    position: "absolute",
    bottom: 0,
    left: s(60), // Start after icon
    right: 0,
    height: 1,
    backgroundColor: "#F3F4F6",
  },

  // Billing Section - Fixed at bottom of card
  billingSection: {
    position: "absolute",
    top: vs(330), // Fixed position from top of card
    left: 0,
    right: 0,
    paddingHorizontal: s(20),
  },

  billingSeparator: {
    height: 1,
    backgroundColor: "#E5E7EB",
    marginBottom: vs(15),
  },

  billingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: vs(10),
  },

  billingLabel: {
    fontFamily: "Clash Grotesk Variable",
    fontWeight: "400",
    fontSize: ms(14),
    color: "#6B7280",
  },

  billingValue: {
    fontFamily: "Clash Grotesk Variable",
    fontWeight: "500",
    fontSize: ms(14),
    color: "#1E1E1E",
  },

  // Total Divider
  totalDivider: {
    height: 2,
    backgroundColor: "#3BB77E",
    marginVertical: vs(12),
    marginHorizontal: s(-20),
    paddingHorizontal: s(20),
  },

  // Total Row
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: vs(5),
  },

  totalLabel: {
    fontFamily: "Clash Grotesk Variable",
    fontWeight: "600",
    fontSize: ms(16),
    color: "#1E1E1E",
  },

  totalValue: {
    fontFamily: "Clash Grotesk Variable",
    fontWeight: "700",
    fontSize: ms(20),
    color: "#3BB77E",
  },

  // BILL CARD - Invoice Link Only (smaller card)
  billCard: {
    position: "absolute",
    left: s(20),
    top: vs(1060), // Below order list card (520 + 520 + 20 spacing)
    width: s(400),
    height: vs(80),
  },

  // Bill Background - Figma: 759:4057 (Subtract boolean operation with dashed edges)
  billBackground: {
    position: "absolute",
    width: s(400),
    height: vs(80),
    backgroundColor: "#FFFFFF",
    borderRadius: s(20),
    shadowColor: "rgba(0, 0, 0, 0.25)",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: s(5),
    elevation: 5,
  },

  // Bill Label - For invoice row
  billLabel: {
    fontFamily: "Clash Grotesk Variable",
    fontWeight: "500",
    fontSize: ms(14),
    lineHeight: ms(14) * 1.23,
    color: "#1E1E1E",
  },

  // Bill Row Invoice - In smaller card
  billRowInvoice: {
    position: "absolute",
    left: s(20),
    top: vs(28), // Centered in 80px height card
    width: s(360),
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  // View Invoice Link - Figma: 759:4083
  viewInvoiceLink: {
    fontFamily: "Clash Grotesk Variable",
    fontWeight: "500",
    fontSize: ms(12),
    lineHeight: ms(12) * 1.23,
    color: "#02545F", // Figma: fill_EBPSOB
    textDecorationLine: "underline",
  },

  // PAYMENT METHOD LABEL
  paymentMethodLabel: {
    position: "absolute",
    left: s(20),
    top: vs(1160), // Below invoice card (1060 + 80 + 20 spacing)
    fontFamily: "Clash Grotesk Variable",
    fontWeight: "500",
    fontSize: ms(20),
    lineHeight: ms(20) * 1.1,
    color: "#1E1E1E",
  },

  // PAYMENT CARD
  paymentCard: {
    position: "absolute",
    left: s(20),
    top: vs(1202), // Below the label (1160 + 42 spacing)
    width: s(400),
    height: vs(60),
  },

  // Payment Card Background - Figma: 759:4116
  paymentCardBackground: {
    position: "absolute",
    width: s(400),
    height: vs(60),
    backgroundColor: "#FFFFFF",
    borderRadius: s(20),
    shadowColor: "rgba(0, 0, 0, 0.25)",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: s(5),
    elevation: 5,
  },

  // Payment Content - Figma: 759:4117
  paymentContent: {
    position: "absolute",
    left: s(20),
    top: vs(15),
    flexDirection: "row",
    alignItems: "center",
  },

  // PayPal Icon - Figma: 759:4119, 30x30
  paypalIcon: {
    width: s(30),
    height: s(30),
  },

  // Payment Icon - For GCash/PayMaya logos
  paymentIcon: {
    width: s(50),
    height: s(30),
  },

  // Payment Text - Figma: 759:4120
  paymentText: {
    marginLeft: s(20),
    fontFamily: "Clash Grotesk Variable",
    fontWeight: "600",
    fontSize: ms(20),
    lineHeight: ms(20) * 1.1,
    color: "#1E1E1E",
  },

  // Cash Icon Circle - Custom style for cash payment
  cashIconCircle: {
    width: s(30),
    height: s(30),
    borderRadius: s(15),
    backgroundColor: "#3BB77E",
    justifyContent: "center",
    alignItems: "center",
  },

  // Cash Icon Text
  cashIconText: {
    fontSize: ms(18),
    fontWeight: "700",
    color: "#FFFFFF",
  },

  // Bottom Padding
  bottomPadding: {
    height: vs(1350), // Increased to show all content (payment card at 1202 + 60 + padding)
  },

  // Loading Container
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: vs(60),
  },

  // Loading Text
  loadingText: {
    marginTop: vs(15),
    fontSize: ms(16),
    fontFamily: "Clash Grotesk Variable",
    fontWeight: "500",
    color: "rgba(30, 30, 30, 0.5)",
  },

  // Error Text
  errorText: {
    fontSize: ms(18),
    fontFamily: "Clash Grotesk Variable",
    fontWeight: "600",
    color: "rgba(30, 30, 30, 0.5)",
    marginBottom: vs(20),
    textAlign: "center",
  },

  // Back to Orders Button
  backToOrdersButton: {
    backgroundColor: "#3BB77E",
    borderRadius: s(20),
    paddingHorizontal: s(30),
    paddingVertical: vs(12),
  },

  // Back to Orders Text
  backToOrdersText: {
    fontSize: ms(16),
    fontFamily: "Clash Grotesk Variable",
    fontWeight: "600",
    color: "#FFFFFF",
  },

  // Inactive Circle - For pending status items
  inactiveCircle: {
    backgroundColor: "#D9D9D9",
  },

  // Inactive Icon - For pending status items
  inactiveIcon: {
    opacity: 0.5,
  },

  // Inactive Text - For pending status items
  inactiveText: {
    color: "rgba(30, 30, 30, 0.5)",
  },

  // DYNAMIC PROGRESS TIMELINE STYLES
  // Timeline Container - Wrapper for progress items
  timelineContainer: {
    paddingHorizontal: s(20),
    paddingVertical: vs(20), // Increased from 15 to 20 for better spacing
  },

  // Progress Item - Each status step
  progressItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: vs(22), // Increased from 18 to 22 for more breathing room
  },

  // Progress Icon Container - Dot and line wrapper
  progressIconContainer: {
    width: s(30),
    alignItems: 'center',
    marginRight: s(15),
    position: 'relative',
  },

  // Progress Dot - Active status indicator
  progressDot: {
    width: s(12),
    height: s(12),
    borderRadius: s(6),
    backgroundColor: Colors.primary,
    zIndex: 2,
  },

  // Progress Dot Active - Currently active step with pulsing effect
  progressDotActive: {
    width: s(16),
    height: s(16),
    borderRadius: s(8),
    backgroundColor: Colors.primary,
    borderWidth: 3,
    borderColor: '#E8F5E9',
  },

  // Progress Dot Inactive - Pending status indicator
  progressDotInactive: {
    backgroundColor: '#D9D9D9',
  },

  // Progress Line - Connects dots
  progressLine: {
    position: 'absolute',
    width: 2,
    height: vs(48), // Increased from 40 to 48 for more spacing
    top: vs(12),
    left: s(13),
    zIndex: 1,
  },

  // Progress Line Active - Completed connection
  progressLineActive: {
    backgroundColor: Colors.primary,
  },

  // Progress Line Inactive - Pending connection
  progressLineInactive: {
    backgroundColor: '#D9D9D9',
  },

  // Progress Content - Text container
  progressContent: {
    flex: 1,
    paddingTop: vs(0),
  },

  // Progress Text - Status label with icon
  progressText: {
    fontSize: ms(16),
    fontFamily: "Clash Grotesk Variable",
    fontWeight: '500',
    color: Colors.primary,
    lineHeight: ms(20),
    marginBottom: vs(2),
  },

  // Progress Text Active - Current step emphasis
  progressTextActive: {
    fontWeight: '600',
    color: Colors.primary,
  },

  // Progress Text Inactive - Pending status label
  progressTextInactive: {
    color: 'rgba(30, 30, 30, 0.5)',
  },

  // Progress Time - Status timestamp
  progressTime: {
    fontSize: ms(14),
    fontFamily: "Clash Grotesk Variable",
    fontWeight: '400',
    color: Colors.primary,
    lineHeight: ms(18),
  },

  // Progress Time Inactive - Pending timestamp
  progressTimeInactive: {
    color: 'rgba(30, 30, 30, 0.5)',
  },
});
