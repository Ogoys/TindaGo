/**
 * CUSTOMER ORDERS SCREEN
 *
 * Figma File: 8I1Nr3vQZllDDknSevstvH
 * Node: 759-4131 (Order)
 * Baseline: 440x1219
 *
 * Features:
 * - Displays list of customer orders with expandable/collapsible cards
 * - Shows order ID, date, items count, total price
 * - Pickup order status indicator
 * - Responsive design with pixel-perfect alignment
 */

import React, { useState } from "react";
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
  UIManager
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Colors } from "../../../src/constants/Colors";
import { Fonts } from "../../../src/constants/Fonts";
import { s, vs, ms } from "../../../src/constants/responsive";
import { BottomNavigation } from "../../../src/components/ui";

// Enable LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface OrderItem {
  id: string;
  orderId: string;
  placedDate: string;
  itemsCount: number;
  total: string;
  pickupDate: string;
  status: 'pending' | 'ready' | 'completed' | 'cancelled';
}

// Mock data - Replace with actual data from Firebase
const mockOrders: OrderItem[] = [
  {
    id: '1',
    orderId: '#OD1234',
    placedDate: 'Sept 04, 2025',
    itemsCount: 25,
    total: '100.54',
    pickupDate: 'Sept 04, 2025',
    status: 'pending'
  },
  {
    id: '2',
    orderId: '#OD1235',
    placedDate: 'Sept 04, 2025',
    itemsCount: 15,
    total: '250.00',
    pickupDate: 'Sept 05, 2025',
    status: 'ready'
  },
  {
    id: '3',
    orderId: '#OD1236',
    placedDate: 'Sept 03, 2025',
    itemsCount: 30,
    total: '450.75',
    pickupDate: 'Sept 04, 2025',
    status: 'completed'
  },
  {
    id: '4',
    orderId: '#OD1237',
    placedDate: 'Sept 02, 2025',
    itemsCount: 12,
    total: '180.30',
    pickupDate: 'Sept 03, 2025',
    status: 'pending'
  },
  {
    id: '5',
    orderId: '#OD1238',
    placedDate: 'Sept 01, 2025',
    itemsCount: 8,
    total: '95.00',
    pickupDate: 'Sept 02, 2025',
    status: 'completed'
  },
  {
    id: '6',
    orderId: '#OD1239',
    placedDate: 'Aug 31, 2025',
    itemsCount: 20,
    total: '320.50',
    pickupDate: 'Sept 01, 2025',
    status: 'completed'
  }
];

export default function OrdersScreen() {
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

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
        {mockOrders.map((order, index) => (
          <OrderCard
            key={order.id}
            order={order}
            isExpanded={expandedOrderId === order.id}
            onToggle={() => toggleOrder(order.id)}
            index={index}
          />
        ))}
      </ScrollView>

      {/* Bottom Navigation */}
      <BottomNavigation activeTab="orders" />
    </SafeAreaView>
  );
}

interface OrderCardProps {
  order: OrderItem;
  isExpanded: boolean;
  onToggle: () => void;
  index: number;
}

const OrderCard: React.FC<OrderCardProps> = ({ order, isExpanded, onToggle, index }) => {
  // Calculate Y position based on Figma layout
  // First card: y=145, spacing between cards: 170px (150 card height + 20 margin)
  const baseY = 145;
  const spacing = 170;

  return (
    <TouchableOpacity
      style={[
        styles.orderCard,
        { marginTop: index === 0 ? vs(baseY - 114) : vs(20) } // Adjust for first card
      ]}
      onPress={onToggle}
      activeOpacity={0.8}
    >
      {/* Main Card Container - Figma: 400x150 */}
      <View style={styles.cardContent}>

        {/* Store Icon - Figma: x:40, y:510 (relative to card) */}
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

        {/* Order Details - Figma: x:110, y:509 */}
        <View style={styles.orderDetails}>
          <Text style={styles.orderId}>Order ID: {order.orderId}</Text>
          <Text style={styles.placedDate}>Placed on {order.placedDate}</Text>
          <View style={styles.itemTotalRow}>
            <Text style={styles.itemsText}>Items: {order.itemsCount}</Text>
            <Text style={styles.totalText}>Total: ₱{order.total}</Text>
          </View>
        </View>

        {/* Dropdown Arrow - Figma: x:380, y:525 */}
        <View style={styles.dropdownContainer}>
          <View style={styles.dropdownBox}>
            <Animated.Image
              source={require("../../../src/assets/images/customer-orders/dropdown-arrow.svg")}
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
        </View>
      </View>

      {/* Lower Section - Figma: y:585 (relative to card) */}
      <View style={styles.lowerSection}>
        <View style={styles.statusIndicator} />
        <Text style={styles.pickupText}>Pickup Order</Text>
        <Text style={styles.pickupDate}>{order.pickupDate}</Text>
      </View>

      {/* Expanded Content */}
      {isExpanded && (
        <View style={styles.expandedContent}>
          <View style={styles.divider} />
          <Text style={styles.expandedTitle}>Order Details</Text>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Status:</Text>
            <Text style={[styles.detailValue, { color: getStatusColor(order.status) }]}>
              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Items:</Text>
            <Text style={styles.detailValue}>{order.itemsCount} items</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Total Amount:</Text>
            <Text style={[styles.detailValue, styles.totalAmount]}>₱{order.total}</Text>
          </View>

          {/* View Details Button */}
          <TouchableOpacity style={styles.viewDetailsButton}>
            <Text style={styles.viewDetailsText}>View Full Details</Text>
          </TouchableOpacity>
        </View>
      )}
    </TouchableOpacity>
  );
};

const getStatusColor = (status: string): string => {
  switch (status) {
    case 'pending':
      return '#FFA500';
    case 'ready':
      return Colors.primary;
    case 'completed':
      return '#4CAF50';
    case 'cancelled':
      return Colors.red;
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
  // Dropdown Container - Figma: x:380, y:525
  dropdownContainer: {
    marginLeft: s(10),
  },
  dropdownBox: {
    width: s(20),
    height: s(20),
    borderRadius: s(5),
    backgroundColor: '#D9D9D9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dropdownArrow: {
    width: s(8),
    height: s(4),
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
  // Expanded Content
  expandedContent: {
    backgroundColor: Colors.white,
    paddingHorizontal: s(20),
    paddingBottom: vs(20),
    borderBottomLeftRadius: s(20),
    borderBottomRightRadius: s(20),
  },
  divider: {
    height: 1,
    backgroundColor: Colors.lightGray,
    marginVertical: vs(15),
  },
  expandedTitle: {
    fontSize: ms(14),
    fontFamily: Fonts.primary,
    fontWeight: '600',
    color: Colors.darkGray,
    marginBottom: vs(12),
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: vs(8),
  },
  detailLabel: {
    fontSize: ms(12),
    fontFamily: Fonts.primary,
    fontWeight: '500',
    color: Colors.textSecondary,
  },
  detailValue: {
    fontSize: ms(12),
    fontFamily: Fonts.primary,
    fontWeight: '600',
    color: Colors.darkGray,
  },
  totalAmount: {
    color: Colors.primary,
    fontSize: ms(14),
  },
  viewDetailsButton: {
    marginTop: vs(15),
    height: vs(40),
    backgroundColor: Colors.primary,
    borderRadius: s(10),
    justifyContent: 'center',
    alignItems: 'center',
  },
  viewDetailsText: {
    fontSize: ms(14),
    fontFamily: Fonts.primary,
    fontWeight: '600',
    color: Colors.white,
  },
});
