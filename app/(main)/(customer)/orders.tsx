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
  products: Product[];
}

interface Product {
  id: string;
  name: string;
  quantity: number;
  price: string;
  image?: any;
}

// Mock data - Replace with actual data from Firebase
const mockOrders: OrderItem[] = [
  {
    id: '1',
    orderId: '#OD1234',
    placedDate: 'Sept 04, 2025',
    itemsCount: 3,
    total: '100.54',
    pickupDate: 'Sept 04, 2025',
    status: 'pending',
    products: [
      { id: 'p1', name: 'Garlic', quantity: 2, price: '25.00' },
      { id: 'p2', name: 'Onion', quantity: 3, price: '35.50' },
      { id: 'p3', name: 'Tomato', quantity: 1, price: '40.04' },
    ]
  },
  {
    id: '2',
    orderId: '#OD1235',
    placedDate: 'Sept 04, 2025',
    itemsCount: 4,
    total: '250.00',
    pickupDate: 'Sept 05, 2025',
    status: 'ready',
    products: [
      { id: 'p1', name: 'Rice (5kg)', quantity: 1, price: '150.00' },
      { id: 'p2', name: 'Cooking Oil', quantity: 2, price: '50.00' },
      { id: 'p3', name: 'Salt', quantity: 1, price: '25.00' },
      { id: 'p4', name: 'Sugar', quantity: 1, price: '25.00' },
    ]
  },
  {
    id: '3',
    orderId: '#OD1236',
    placedDate: 'Sept 03, 2025',
    itemsCount: 5,
    total: '450.75',
    pickupDate: 'Sept 04, 2025',
    status: 'completed',
    products: [
      { id: 'p1', name: 'Eggs (1 dozen)', quantity: 2, price: '120.00' },
      { id: 'p2', name: 'Bread', quantity: 3, price: '90.00' },
      { id: 'p3', name: 'Milk', quantity: 2, price: '100.00' },
      { id: 'p4', name: 'Butter', quantity: 1, price: '80.75' },
      { id: 'p5', name: 'Cheese', quantity: 1, price: '60.00' },
    ]
  },
  {
    id: '4',
    orderId: '#OD1237',
    placedDate: 'Sept 02, 2025',
    itemsCount: 2,
    total: '180.30',
    pickupDate: 'Sept 03, 2025',
    status: 'pending',
    products: [
      { id: 'p1', name: 'Chicken (1kg)', quantity: 1, price: '120.00' },
      { id: 'p2', name: 'Soy Sauce', quantity: 2, price: '60.30' },
    ]
  },
  {
    id: '5',
    orderId: '#OD1238',
    placedDate: 'Sept 01, 2025',
    itemsCount: 3,
    total: '95.00',
    pickupDate: 'Sept 02, 2025',
    status: 'completed',
    products: [
      { id: 'p1', name: 'Instant Noodles', quantity: 5, price: '50.00' },
      { id: 'p2', name: 'Canned Goods', quantity: 2, price: '45.00' },
    ]
  },
  {
    id: '6',
    orderId: '#OD1239',
    placedDate: 'Aug 31, 2025',
    itemsCount: 6,
    total: '320.50',
    pickupDate: 'Sept 01, 2025',
    status: 'completed',
    products: [
      { id: 'p1', name: 'Fish (1kg)', quantity: 1, price: '180.00' },
      { id: 'p2', name: 'Vegetables', quantity: 3, price: '90.50' },
      { id: 'p3', name: 'Fruits', quantity: 2, price: '50.00' },
    ]
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

  const handleCardPress = () => {
    // Navigate to order details screen
    router.push("/(main)/(customer)/order-details");
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
          <Text style={styles.orderId}>Order ID: {order.orderId}</Text>
          <Text style={styles.placedDate}>Placed on {order.placedDate}</Text>
          <View style={styles.itemTotalRow}>
            <Text style={styles.itemsText}>Items: {order.itemsCount}</Text>
            <Text style={styles.totalText}>Total: ₱{order.total}</Text>
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

      {/* Expanded Content - Order Progress/Status */}
      {isExpanded && (
        <View style={styles.expandedContent}>
          {/* Order Progress Timeline - Figma: After variant shows status progress */}
          <View style={styles.progressContainer}>
            {/* Progress Item 1: Order Confirmed */}
            <View style={styles.progressItem}>
              <View style={styles.progressIconContainer}>
                <View style={styles.progressDot} />
              </View>
              <Text style={styles.progressText}>Order Confirmed</Text>
              <Text style={styles.progressTime}>12:30 PM</Text>
            </View>

            {/* Progress Item 2: Preparing Order */}
            <View style={styles.progressItem}>
              <View style={styles.progressIconContainer}>
                <View style={styles.progressDot} />
              </View>
              <Text style={styles.progressText}>Preparing Order</Text>
              <Text style={styles.progressTime}>12:35 PM</Text>
            </View>

            {/* Progress Item 3: Ready for Pickup */}
            <View style={styles.progressItem}>
              <View style={styles.progressIconContainer}>
                <View style={[styles.progressDot, styles.progressDotInactive]} />
              </View>
              <Text style={[styles.progressText, styles.progressTextInactive]}>Ready for Pickup</Text>
              <Text style={[styles.progressTime, styles.progressTextInactive]}>Pending</Text>
            </View>
          </View>
        </View>
      )}

      {/* Lower Section - Figma: y:100 (relative to card) */}
      <View style={styles.lowerSection}>
        <View style={styles.statusIndicator} />
        <Text style={styles.pickupText}>Pickup Order</Text>
        <Text style={styles.pickupDate}>{order.pickupDate}</Text>
      </View>
    </TouchableOpacity>
  );
};

// Helper function to get status color (for future use)
const getStatusColor = (status: string): string => {
  switch (status) {
    case 'pending':
      return '#FFA500';
    case 'ready':
      return Colors.primary;
    case 'completed':
      return '#4CAF50';
    case 'cancelled':
      return '#E92B45';
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
    paddingBottom: vs(15),
  },
  // Progress Container - Order Status Timeline
  progressContainer: {
    paddingVertical: vs(10),
  },
  // Progress Item - Each status step
  progressItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: vs(12),
  },
  progressIconContainer: {
    width: s(20),
    height: s(20),
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: s(15),
  },
  // Progress Dot - Active status indicator
  progressDot: {
    width: s(10),
    height: s(10),
    borderRadius: s(5),
    backgroundColor: Colors.primary,
  },
  // Progress Dot Inactive - Pending status indicator
  progressDotInactive: {
    backgroundColor: '#D9D9D9',
  },
  // Progress Text - Status label
  progressText: {
    flex: 1,
    fontSize: ms(14),
    fontFamily: Fonts.primary,
    fontWeight: '500',
    color: Colors.primary,
    lineHeight: ms(22),
  },
  // Progress Text Inactive - Pending status label
  progressTextInactive: {
    color: 'rgba(30, 30, 30, 0.5)',
  },
  // Progress Time - Status timestamp
  progressTime: {
    fontSize: ms(12),
    fontFamily: Fonts.primary,
    fontWeight: '500',
    color: Colors.primary,
    lineHeight: ms(22),
  },
});
