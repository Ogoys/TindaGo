/**
 * CUSTOMER ORDERS SCREEN
 *
 * Figma File: 8I1Nr3vQZllDDknSevstvH
 * Node: 759-4131 (Order)
 * Component: 256-62 (Component 2 - Before/After variants)
 * Baseline: 440x1219
 *
 * Design Specs:
 * - Before (collapsed): 400x150px
 * - After (expanded): 400x250px (+100px height)
 *
 * Features:
 * - Displays list of customer orders with expandable/collapsible cards
 * - Shows order ID, date, items count, total price
 * - Pickup order status indicator with expanded progress view
 * - Click card to navigate to full order details
 * - Responsive design with pixel-perfect alignment
 */

import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Image,
  Animated,
  LayoutAnimation,
  Platform,
  UIManager,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { ref, onValue, query, orderByChild, equalTo } from 'firebase/database';
import { database } from '../../../FirebaseConfig';
import { useUser } from '../../../src/contexts/UserContext';
import { Colors } from "../../../src/constants/Colors";
import { Fonts } from "../../../src/constants/Fonts";
import { s, vs, ms } from "../../../src/constants/responsive";
import { BottomNavigation } from "../../../src/components/ui";
import type { Order } from '../../../src/models/Order';
import { useCartCount } from "../../../src/hooks";

// Enable LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// MOCK DATA - 1 sample order for visualization
const MOCK_ORDERS: Partial<Order>[] = [
  {
    id: 'mock-customer-order-1',
    orderNumber: '#DEMO-2024-001',
    customerId: 'demo',
    customerName: 'Demo Customer',
    customerPhone: '+63 912 345 6789',
    storeId: 'demo-store',
    storeName: 'Sample Sari-Sari Store',
    items: [
      {
        productId: 'demo-1',
        productName: 'Sample Product',
        productImage: '',
        quantity: 2,
        price: 50,
        subtotal: 100,
      },
    ],
    subtotal: 100,
    total: 105,
    status: 'preparing',
    paymentMethod: 'cash',
    paymentStatus: 'pending',
    createdAt: new Date(Date.now() - 30 * 60000).toISOString(), // 30 min ago
    updatedAt: new Date(Date.now() - 30 * 60000).toISOString(),
  },
];

export default function OrdersScreen() {
  const { user } = useUser();
  const [realOrders, setRealOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  // Get cart count for badge
  const cartCount = useCartCount(user?.id);

  // Fetch user orders from Firebase with REAL-TIME updates
  // OPTIMIZED: Query only user's orders instead of fetching all orders
  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    // Query Firebase for orders WHERE customerId = user.id
    const ordersRef = ref(database, 'orders');
    const userOrdersQuery = query(
      ordersRef,
      orderByChild('customerId'),
      equalTo(user.id)
    );

    const unsubscribe = onValue(userOrdersQuery, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        // Map to array and sort by date (newest first)
        const userOrders = Object.keys(data)
          .map(orderId => ({
            ...data[orderId],
            id: orderId,
          }))
          .sort((a: Order, b: Order) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );

        setRealOrders(userOrders as Order[]);
      } else {
        setRealOrders([]);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  // Merge mock orders with real orders
  const orders = [...(MOCK_ORDERS as Order[]), ...realOrders];

  const toggleOrder = (orderId: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedOrderId(expandedOrderId === orderId ? null : orderId);
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Status Bar */}
      <View style={styles.statusBarPlaceholder} />

      {/* Header */}
      <View style={styles.header}>
        {/* Back Button - Figma: x:20, y:79, size:30x30 */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleBack}
        >
          <Image
            source={require("../../../src/assets/images/customer-orders/chevron-left.png")}
            style={styles.chevronIcon}
          />
        </TouchableOpacity>

        {/* Title - Figma: x:171, y:83 */}
        <Text style={styles.title}>My Orders</Text>

        {/* Notification Icon - Figma: x:375, y:74, size:40x40 */}
        <TouchableOpacity style={styles.notifButton}>
          <View style={styles.notifCircle}>
            <Image
              source={require("../../../src/assets/images/customer-orders/notification-icon.png")}
              style={styles.notifIcon}
            />
          </View>
        </TouchableOpacity>
      </View>

      {/* Orders List */}
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.primary} />
            <Text style={styles.loadingText}>Loading orders...</Text>
          </View>
        ) : orders.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No orders yet</Text>
            <TouchableOpacity
              style={styles.shopButton}
              onPress={() => router.push('/(main)/(customer)/home')}
            >
              <Text style={styles.shopButtonText}>Start Shopping</Text>
            </TouchableOpacity>
          </View>
        ) : (
          orders.map((order, index) => (
            <OrderCard
              key={order.id}
              order={order}
              isExpanded={expandedOrderId === order.id}
              onToggle={() => toggleOrder(order.id)}
              index={index}
            />
          ))
        )}
      </ScrollView>

      {/* Bottom Navigation */}
      <BottomNavigation activeTab="orders" cartCount={cartCount} />
    </SafeAreaView>
  );
}

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

  // Format time
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  return steps.map((step, index) => {
    const isCompleted = index <= currentStatusIndex;
    const isActive = index === currentStatusIndex;
    const isCancelled = order.status === 'cancelled';

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
            !isCompleted && styles.progressTextInactive
          ]}>
            {timestamp}
          </Text>
        </View>
      </View>
    );
  });
};

interface OrderCardProps {
  order: Order;
  isExpanded: boolean;
  onToggle: () => void;
  index: number;
}

const OrderCard: React.FC<OrderCardProps> = ({ order, isExpanded, onToggle, index }) => {
  // Calculate Y position based on Figma layout
  // First card: y=145, spacing between cards: 170px (150 card height + 20 margin)
  const baseY = 145;
  const spacing = 170;

  // Format date
  const formatDate = (date: Date | string | undefined) => {
    if (!date) return 'N/A';
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
  };

  const handleCardPress = () => {
    // Navigate to order details screen with order ID
    router.push(`/(main)/(customer)/order-details?id=${order.id}`);
  };

  const handleDropdownPress = (e: any) => {
    // Stop propagation to prevent card press
    e.stopPropagation();
    onToggle();
  };

  return (
    <TouchableOpacity
      style={[
        styles.orderCard,
        { marginTop: index === 0 ? vs(baseY - 114) : vs(20) } // Adjust for first card
      ]}
      onPress={handleCardPress}
      activeOpacity={0.8}
    >
      {/* Main Card Container - Figma: 400x150 (collapsed) / 400x250 (expanded) */}
      <View style={styles.cardContent}>

        {/* Store Icon - Figma: x:40, y:25 (relative to card) */}
        <View style={styles.storeIconContainer}>
          <View style={styles.outerCircle}>
            <View style={styles.innerCircle}>
              <Image
                source={require("../../../src/assets/images/customer-orders/grocery-bag.png")}
                style={styles.groceryIcon}
              />
            </View>
          </View>
        </View>

        {/* Order Details - Figma: x:110, y:24 */}
        <View style={styles.orderDetails}>
          <Text style={styles.orderId}>Order ID: {order.orderNumber}</Text>
          <Text style={styles.placedDate}>Placed on {formatDate(order.createdAt)}</Text>
          <View style={styles.itemTotalRow}>
            <Text style={styles.itemsText}>Items: {order.items.length}</Text>
            <Text style={styles.totalText}>Total: ₱{order.total.toFixed(2)}</Text>
          </View>
        </View>

        {/* Dropdown Arrow - Figma: x:380, y:40 */}
        <TouchableOpacity
          style={styles.dropdownContainer}
          onPress={handleDropdownPress}
          activeOpacity={0.7}
        >
          <View style={styles.dropdownBox}>
            <Animated.Image
              source={require("../../../src/assets/images/customer-orders/dropdown-arrow.png")}
              style={[
                styles.dropdownArrow,
                {
                  transform: [{
                    rotate: isExpanded ? '180deg' : '0deg'
                  }]
                }
              ]}
            />
          </View>
        </TouchableOpacity>
      </View>

      {/* Expanded Content - REAL-TIME Order Progress/Status */}
      {isExpanded && (
        <View style={styles.expandedContent}>
          {/* Dynamic Order Progress Timeline */}
          <View style={styles.progressContainer}>
            {renderProgressTimeline(order)}
          </View>
        </View>
      )}

      {/* Lower Section - Dynamic Status Display */}
      <View style={styles.lowerSection}>
        <View style={[styles.statusIndicator, { backgroundColor: getStatusColor(order.status) }]} />
        <Text style={styles.pickupText}>{getStatusText(order.status)}</Text>
        <Text style={styles.pickupDate}>
          {order.status === 'picked_up' && order.completedAt
            ? `Completed ${formatDate(order.completedAt)}`
            : order.status === 'cancelled'
            ? `Cancelled ${formatDate(order.cancelledAt || order.updatedAt)}`
            : order.pickupTime
            ? `Pickup: ${formatDate(order.pickupTime)}`
            : `Placed ${formatDate(order.createdAt)}`}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

// Get dynamic status text
const getStatusText = (status: string): string => {
  switch (status) {
    case 'pending':
      return 'Waiting for Confirmation';
    case 'preparing':
      return 'Preparing Your Order';
    case 'ready':
      return 'Ready for Pickup!';
    case 'picked_up':
      return 'Order Completed';
    case 'cancelled':
      return 'Order Cancelled';
    default:
      return 'Processing Order';
  }
};

// Get status color with real-time updates
const getStatusColor = (status: string): string => {
  switch (status) {
    case 'pending':
      return '#FFA500'; // Orange - waiting
    case 'preparing':
      return '#3BB77E'; // Green - active
    case 'ready':
      return '#00C853'; // Bright green - ready
    case 'picked_up':
      return '#4CAF50'; // Success green
    case 'cancelled':
      return '#DC2626'; // Red
    default:
      return Colors.darkGray;
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundGray, // #F4F6F6
  },
  statusBarPlaceholder: {
    height: vs(0),
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: s(20),
    paddingVertical: vs(25),
    backgroundColor: Colors.backgroundGray,
  },
  // Back Button - Figma: x:20, y:79
  backButton: {
    position: 'absolute',
    left: s(20),
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
  },
  chevronIcon: {
    width: s(15),
    height: s(15),
    resizeMode: 'contain',
  },
  // Title - Figma: x:171, y:83
  title: {
    fontSize: ms(20),
    fontFamily: Fonts.primary,
    fontWeight: '600',
    color: Colors.darkGray,
    lineHeight: ms(22),
    textAlign: 'center',
  },
  // Notification - Figma: x:375, y:74
  notifButton: {
    position: 'absolute',
    right: s(20),
  },
  notifCircle: {
    width: s(40),
    height: s(40),
    borderRadius: s(20),
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 5,
  },
  notifIcon: {
    width: s(25),
    height: s(25),
    resizeMode: 'contain',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: s(20),
    paddingBottom: vs(100), // Space for bottom navigation
  },
  // Order Card - Figma: 400x150
  orderCard: {
    width: s(400),
    backgroundColor: Colors.white,
    borderRadius: s(20),
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 3,
    overflow: 'hidden',
  },
  cardContent: {
    height: vs(100),
    paddingVertical: vs(24),
    paddingHorizontal: s(20),
    flexDirection: 'row',
    alignItems: 'center',
  },
  // Store Icon Container - Figma: x:40, y:510
  storeIconContainer: {
    marginRight: s(20),
  },
  outerCircle: {
    width: s(50),
    height: s(50),
    borderRadius: s(25),
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 3,
  },
  innerCircle: {
    width: s(40),
    height: s(40),
    borderRadius: s(20),
    backgroundColor: 'rgba(59, 183, 126, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: 'rgba(59, 183, 126, 0.2)',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 5,
  },
  groceryIcon: {
    width: s(30),
    height: s(30),
    resizeMode: 'contain',
  },
  // Order Details - Figma: x:110, y:509
  orderDetails: {
    flex: 1,
    justifyContent: 'center',
  },
  orderId: {
    fontSize: ms(16),
    fontFamily: Fonts.primary,
    fontWeight: '500',
    color: Colors.darkGray,
    lineHeight: ms(20),
    marginBottom: vs(2),
  },
  placedDate: {
    fontSize: ms(12),
    fontFamily: Fonts.primary,
    fontWeight: '500',
    color: 'rgba(30, 30, 30, 0.5)',
    lineHeight: ms(15),
    marginBottom: vs(2),
  },
  paymentBadge: {
    alignSelf: 'flex-start',
    marginTop: vs(6),
    borderRadius: s(10),
    paddingHorizontal: s(8),
    paddingVertical: vs(4),
  },
  paymentBadgePaid: {
    backgroundColor: 'rgba(52,199,89,0.15)',
  },
  paymentBadgePending: {
    backgroundColor: 'rgba(128,128,128,0.15)',
  },
  paymentBadgeText: {
    fontSize: ms(12),
    fontFamily: Fonts.primary,
    fontWeight: '700',
  },
  paymentBadgeTextPaid: {
    color: '#34C759',
  },
  paymentBadgeTextPending: {
    color: '#666666',
  },
  itemTotalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: vs(2),
  },
  itemsText: {
    fontSize: ms(10),
    fontFamily: Fonts.primary,
    fontWeight: '500',
    color: Colors.darkGray,
    lineHeight: ms(12),
    marginRight: s(20),
  },
  totalText: {
    fontSize: ms(10),
    fontFamily: Fonts.primary,
    fontWeight: '500',
    color: Colors.darkGray,
    lineHeight: ms(12),
  },
  // Dropdown Container - Bigger touchable area for easier tapping
  dropdownContainer: {
    marginLeft: s(10),
    padding: s(8), // Add padding to increase tap area
  },
  dropdownBox: {
    width: s(32), // Increased from 20 to 32 for easier tapping
    height: s(32), // Increased from 20 to 32 for easier tapping
    borderRadius: s(8), // Increased from 5 to 8
    backgroundColor: '#D9D9D9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dropdownArrow: {
    width: s(14), // Increased from 8 to 14 (bigger arrow icon)
    height: s(8), // Increased from 4 to 8 (bigger arrow icon)
    resizeMode: 'contain',
  },
  // Lower Section - Figma: y:585
  lowerSection: {
    height: vs(50),
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: s(20),
    backgroundColor: Colors.white,
    borderBottomLeftRadius: s(20),
    borderBottomRightRadius: s(20),
  },
  statusIndicator: {
    width: s(10),
    height: s(10),
    borderRadius: s(5),
    backgroundColor: Colors.primary,
    marginRight: s(20),
  },
  pickupText: {
    fontSize: ms(14),
    fontFamily: Fonts.primary,
    fontWeight: '500',
    color: 'rgba(30, 30, 30, 0.5)',
    lineHeight: ms(22),
    flex: 1,
  },
  pickupDate: {
    fontSize: ms(14),
    fontFamily: Fonts.primary,
    fontWeight: '500',
    color: 'rgba(30, 30, 30, 0.5)',
    lineHeight: ms(22),
  },
  // Expanded Content - Figma: After variant adds 100px height (250px total)
  expandedContent: {
    backgroundColor: Colors.white,
    paddingHorizontal: s(20),
    paddingTop: vs(10),
    paddingBottom: vs(0), // Reduced to 0 to minimize space between timeline and status
  },
  // Progress Container - Order Status Timeline
  progressContainer: {
    paddingTop: vs(10),
    paddingBottom: vs(2), // Reduced to 2 for minimal space after last item
  },
  // Progress Item - Each status step
  progressItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: vs(15),
  },
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
  // Progress Dot Active - Currently active step
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
    height: vs(40),
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
  // Progress Content - Text container
  progressContent: {
    flex: 1,
    paddingTop: vs(0),
  },
  // Progress Text - Status label
  progressText: {
    fontSize: ms(14),
    fontFamily: Fonts.primary,
    fontWeight: '500',
    color: Colors.primary,
    lineHeight: ms(20),
    marginBottom: vs(2),
  },
  // Progress Text Active - Current step
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
    fontSize: ms(12),
    fontFamily: Fonts.primary,
    fontWeight: '400',
    color: 'rgba(30, 30, 30, 0.6)',
    lineHeight: ms(18),
  },
  // Loading Container
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: vs(60),
  },
  loadingText: {
    marginTop: vs(15),
    fontSize: ms(16),
    fontFamily: Fonts.primary,
    fontWeight: '500',
    color: 'rgba(30, 30, 30, 0.5)',
  },
  // Empty State Container
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: vs(80),
    paddingHorizontal: s(40),
  },
  emptyText: {
    fontSize: ms(18),
    fontFamily: Fonts.primary,
    fontWeight: '600',
    color: 'rgba(30, 30, 30, 0.5)',
    marginBottom: vs(20),
    textAlign: 'center',
  },
  shopButton: {
    backgroundColor: Colors.primary,
    borderRadius: s(20),
    paddingHorizontal: s(30),
    paddingVertical: vs(12),
  },
  shopButtonText: {
    fontSize: ms(16),
    fontFamily: Fonts.primary,
    fontWeight: '600',
    color: Colors.white,
  },
});
