/**
 * STORE OWNER - ORDERS MANAGEMENT SCREEN
 *
 * Figma File: 8I1Nr3vQZllDDknSevstvH
 * Node: 1057-4776 (Store Order/ Pending)
 * Baseline: 440x956
 *
 * Main orders screen with filter tabs for all order statuses
 * Navigation: Store Home → Orders
 *
 * Features:
 * - Filter tabs: Pending, Preparing, Out for Pickup, Pickup, Cancel
 * - Order cards matching Store Home page design
 * - Click order card → Navigate to status-specific detail screen
 *
 * **CURRENT VERSION: HARDCODED DATA FOR DESIGN VISUALIZATION**
 */

import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Typography } from "../../../../src/components/ui/Typography";
import { Colors } from "../../../../src/constants/Colors";
import { Fonts } from "../../../../src/constants/Fonts";
import { s, vs, ms } from "../../../../src/constants/responsive";

type FilterStatus = 'pending' | 'preparing' | 'ready' | 'picked_up' | 'cancelled';

interface FilterTab {
  label: string;
  status: FilterStatus;
}

interface MockOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  total: number;
  paymentMethod: string;
  timeAgo: string;
  status: FilterStatus;
}

const FILTER_TABS: FilterTab[] = [
  { label: 'Pending', status: 'pending' },
  { label: 'Preparing', status: 'preparing' },
  { label: 'Out for Pickup', status: 'ready' },
  { label: 'Pickup', status: 'picked_up' },
  { label: 'Cancel', status: 'cancelled' },
];

// MOCK DATA - Matches Store Home page design
const MOCK_ORDERS: MockOrder[] = [
  // Pending orders
  {
    id: 'order-1',
    orderNumber: '#12345',
    customerName: 'Dotarot\nMaynard',
    customerPhone: '+6398 032\n4213',
    total: 589.00,
    paymentMethod: 'PAYMAYA',
    timeAgo: '1 min ago',
    status: 'pending',
  },
  {
    id: 'order-2',
    orderNumber: '#12346',
    customerName: 'Juan Dela\nCruz',
    customerPhone: '+6391 234\n5678',
    total: 800.00,
    paymentMethod: 'GCASH',
    timeAgo: '5 min ago',
    status: 'pending',
  },
  // Preparing orders
  {
    id: 'order-3',
    orderNumber: '#12347',
    customerName: 'Maria\nSantos',
    customerPhone: '+6392 345\n6789',
    total: 500.00,
    paymentMethod: 'CASH',
    timeAgo: '15 min ago',
    status: 'preparing',
  },
  {
    id: 'order-4',
    orderNumber: '#12348',
    customerName: 'Pedro\nGarcia',
    customerPhone: '+6393 456\n7890',
    total: 1250.00,
    paymentMethod: 'GCASH',
    timeAgo: '20 min ago',
    status: 'preparing',
  },
  // Ready for pickup orders
  {
    id: 'order-5',
    orderNumber: '#12349',
    customerName: 'Ana\nReyes',
    customerPhone: '+6394 567\n8901',
    total: 700.00,
    paymentMethod: 'PAYMAYA',
    timeAgo: '1 hour ago',
    status: 'ready',
  },
  // Picked up orders
  {
    id: 'order-6',
    orderNumber: '#12350',
    customerName: 'Carlos\nLopez',
    customerPhone: '+6395 678\n9012',
    total: 900.00,
    paymentMethod: 'CASH',
    timeAgo: '2 hours ago',
    status: 'picked_up',
  },
  {
    id: 'order-7',
    orderNumber: '#12351',
    customerName: 'Lisa\nFernandez',
    customerPhone: '+6396 789\n0123',
    total: 600.00,
    paymentMethod: 'GCASH',
    timeAgo: '3 hours ago',
    status: 'picked_up',
  },
  // Cancelled orders
  {
    id: 'order-8',
    orderNumber: '#12352',
    customerName: 'Ramon\nCruz',
    customerPhone: '+6397 890\n1234',
    total: 450.00,
    paymentMethod: 'PAYMAYA',
    timeAgo: '1 day ago',
    status: 'cancelled',
  },
];

export default function StoreOrdersScreen() {
  const [selectedFilter, setSelectedFilter] = useState<FilterStatus>('pending');

  // Filter mock orders based on selected status
  const filteredOrders = MOCK_ORDERS.filter(order => order.status === selectedFilter);

  const handleBack = () => {
    router.back();
  };

  const handleOrderPress = (orderId: string, status: FilterStatus) => {
    // Map status to detail screen route - UPDATED PATHS
    const detailScreenMap: Record<FilterStatus, string> = {
      'pending': '/(main)/(store-owner)/orders/pending',
      'preparing': '/(main)/(store-owner)/orders/preparing',
      'ready': '/(main)/(store-owner)/orders/ready',
      'picked_up': '/(main)/(store-owner)/orders/pickup',
      'cancelled': '/(main)/(store-owner)/orders/cancelled'
    };
    router.push(`${detailScreenMap[status]}?id=${orderId}` as any);
  };

  // Get title based on selected filter
  const getTitle = () => {
    const tab = FILTER_TABS.find(t => t.status === selectedFilter);
    return tab ? tab.label : 'Orders';
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header - Figma: y:79 */}
      <View style={styles.header}>
        {/* Back Button - Figma: x:20, y:79, size:30x30 */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleBack}
        >
          <Image
            source={require("../../../../src/assets/images/store-orders/back-icon.png")}
            style={styles.backIcon}
          />
        </TouchableOpacity>

        {/* Title - Figma: x:183, y:83 */}
        <Text style={styles.title}>{getTitle()}</Text>
      </View>

      {/* Filter Tabs - Figma: x:-23, y:145, width:463, height:30 */}
      <View style={styles.filterContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScrollContent}
        >
          {FILTER_TABS.map((tab) => (
            <TouchableOpacity
              key={tab.status}
              style={[
                styles.filterTab,
                selectedFilter === tab.status && styles.filterTabActive
              ]}
              onPress={() => setSelectedFilter(tab.status)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.filterTabText,
                  selectedFilter === tab.status && styles.filterTabTextActive
                ]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Orders List */}
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {filteredOrders.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No {getTitle().toLowerCase()} orders</Text>
            <Text style={styles.emptySubtext}>Orders will appear here when customers place them</Text>
          </View>
        ) : (
          <View style={styles.orderListContainer}>
            {filteredOrders.map((order) => (
              <TouchableOpacity
                key={order.id}
                style={styles.orderCard}
                onPress={() => handleOrderPress(order.id, selectedFilter)}
                activeOpacity={0.8}
              >
                {/* Order Card Background - Figma: Rectangle 64 400x200 with 16px radius */}
                <View style={styles.orderCardBackground} />

                {/* Logo Section - Figma: Logo Group at 40,984 40x40 (relative to card) */}
                <View style={styles.orderLogo}>
                  <View style={styles.orderLogoBackground} />
                  <Image
                    source={require('../../../../src/assets/images/store-owner-dashboard/cheque-icon.png')}
                    style={styles.orderLogoIcon}
                    resizeMode="contain"
                  />
                </View>

                {/* Order Header - Figma: Order No at 95,986 and time at 343,986 */}
                <View style={styles.orderHeader}>
                  <View style={styles.orderHeaderLeft}>
                    <Typography style={styles.orderNoLabel}>Order No</Typography>
                    <Typography style={styles.orderNoValue}>{order.orderNumber}</Typography>
                  </View>
                  <Typography style={styles.orderTime}>{order.timeAgo}</Typography>
                </View>

                {/* Separator Line - Figma: Vector 43 at 30,1044 */}
                <View style={styles.orderSeparator} />

                {/* Order Details Row 1 - Customer Info */}
                <View style={styles.orderDetailsRow1}>
                  {/* Customer Name - Figma: Name Group at 61,1062 116x34 */}
                  <View style={styles.orderDetailCustomer}>
                    <Image
                      source={require('../../../../src/assets/images/store-owner-dashboard/person-icon.png')}
                      style={styles.orderDetailIcon}
                      resizeMode="contain"
                    />
                    <View style={styles.orderDetailText}>
                      <Typography style={styles.customerName}>{order.customerName}</Typography>
                    </View>
                  </View>

                  {/* Phone Number - Figma: Call Group at 236,1059 142x40 */}
                  <View style={styles.orderDetailPhone}>
                    <Image
                      source={require('../../../../src/assets/images/store-owner-dashboard/phone-icon.png')}
                      style={styles.orderDetailIcon}
                      resizeMode="contain"
                    />
                    <View style={styles.orderDetailText}>
                      <Typography style={styles.phoneNumber}>{order.customerPhone}</Typography>
                    </View>
                  </View>
                </View>

                {/* Order Details Row 2 - Payment Info */}
                <View style={styles.orderDetailsRow2}>
                  {/* Price - Figma: Price Group at 61,1114 125x30 */}
                  <View style={styles.orderDetailPrice}>
                    <Image
                      source={require('../../../../src/assets/images/store-owner-dashboard/coin-wallet-icon.png')}
                      style={styles.orderDetailIcon}
                      resizeMode="contain"
                    />
                    <View style={styles.orderDetailText}>
                      <Typography style={styles.orderPrice}>₱{order.total.toFixed(2)}</Typography>
                    </View>
                  </View>

                  {/* Payment Method - Figma: Mode of payment Group at 236,1114 130x30 */}
                  <View style={styles.orderDetailPayment}>
                    <Image
                      source={require('../../../../src/assets/images/store-owner-dashboard/wallet-payment-icon.png')}
                      style={styles.orderDetailIcon}
                      resizeMode="contain"
                    />
                    <View style={styles.orderDetailText}>
                      <Typography style={styles.paymentMethod}>{order.paymentMethod}</Typography>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundGray, // #F4F6F6
  },

  // Header - Figma: y:79
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: s(20),
    paddingVertical: vs(25),
    backgroundColor: Colors.backgroundGray,
  },

  // Back Button - Figma: x:20, y:79, size:30x30
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

  backIcon: {
    width: s(15),
    height: s(15),
    resizeMode: 'contain',
  },

  // Title - Figma: x:183, y:83
  title: {
    fontSize: ms(20),
    fontFamily: Fonts.primary,
    fontWeight: '600',
    color: Colors.darkGray,
    lineHeight: ms(22),
    textAlign: 'center',
  },

  // Filter Container - Figma: x:-23, y:145, width:463, height:30
  filterContainer: {
    marginTop: vs(10),
    marginBottom: vs(20),
  },

  filterScrollContent: {
    paddingHorizontal: s(20),
    gap: s(10),
  },

  // Filter Tab - Figma: borderRadius:8px, padding:5px 15px
  filterTab: {
    paddingHorizontal: s(15),
    paddingVertical: vs(5),
    borderRadius: s(8),
    backgroundColor: 'rgba(30, 30, 30, 0.5)', // Figma: fill_GD32A0
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Active Filter Tab - Figma: fill_D8UOAC
  filterTabActive: {
    backgroundColor: '#02545F',
  },

  // Filter Tab Text - Figma: style_RNBL1F
  filterTabText: {
    fontSize: ms(16),
    fontFamily: Fonts.primary,
    fontWeight: '500',
    color: Colors.white,
    lineHeight: ms(20),
  },

  filterTabTextActive: {
    color: Colors.white,
  },

  // Scroll View
  scrollView: {
    flex: 1,
  },

  scrollContent: {
    paddingBottom: vs(20),
  },

  // Order List Container - Matches Store Home page
  orderListContainer: {
    paddingHorizontal: s(20),
    gap: vs(20),
  },

  // Order Card - Matches Store Home page - Figma: Rectangle 64 400x200 with 16px radius
  orderCard: {
    width: s(400),
    height: vs(200),
    position: 'relative',
  },

  orderCardBackground: {
    width: '100%',
    height: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: s(16),
    shadowColor: 'rgba(0, 0, 0, 0.25)',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 5,
    elevation: 5,
  },

  // Order Logo - Figma: Logo Group at 40,984 40x40 (relative to card)
  orderLogo: {
    position: 'absolute',
    top: vs(20),
    left: s(20),
    width: s(40),
    height: vs(40),
  },

  orderLogoBackground: {
    width: '100%',
    height: '100%',
    backgroundColor: '#02545F',
    borderRadius: s(5),
  },

  orderLogoIcon: {
    position: 'absolute',
    top: vs(8),
    left: s(7),
    width: s(25),
    height: vs(25),
  },

  // Order Header - Figma: Order No at 95,986 and time at 343,986
  orderHeader: {
    position: 'absolute',
    top: vs(22),
    left: s(75),
    right: s(20),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },

  orderHeaderLeft: {
    flex: 1,
  },

  orderNoLabel: {
    fontFamily: 'Clash Grotesk Variable',
    fontWeight: '500',
    fontSize: ms(14),
    lineHeight: vs(17),
    color: 'rgba(30, 30, 30, 0.5)',
    height: vs(17),
  },

  orderNoValue: {
    fontFamily: 'Clash Grotesk Variable',
    fontWeight: '500',
    fontSize: ms(12),
    lineHeight: vs(15),
    color: '#000000',
    height: vs(15),
    marginTop: vs(6),
  },

  orderTime: {
    fontFamily: 'Clash Grotesk Variable',
    fontWeight: '500',
    fontSize: ms(14),
    lineHeight: vs(17),
    color: 'rgba(30, 30, 30, 0.5)',
    textAlign: 'right',
    height: vs(17),
  },

  // Order Separator - Figma: Vector 43 at 30,1044 (relative to card)
  orderSeparator: {
    position: 'absolute',
    top: vs(80),
    left: s(10),
    width: s(380),
    height: 2,
    backgroundColor: '#02545F',
  },

  // Order Details Row 1 - Customer and Phone Info
  orderDetailsRow1: {
    position: 'absolute',
    top: vs(95), // Position after separator
    left: s(20),
    right: s(20),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },

  // Order Details Row 2 - Price and Payment Info
  orderDetailsRow2: {
    position: 'absolute',
    top: vs(140), // Position below first row
    left: s(20),
    right: s(20),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },

  // Customer Name Section
  orderDetailCustomer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    width: s(160), // More space for customer name
  },

  // Phone Number Section
  orderDetailPhone: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    width: s(160), // More space for phone
  },

  // Price Section
  orderDetailPrice: {
    flexDirection: 'row',
    alignItems: 'center',
    width: s(150), // Adequate space for price
  },

  // Payment Method Section
  orderDetailPayment: {
    flexDirection: 'row',
    alignItems: 'center',
    width: s(160), // Space for payment method
  },

  orderDetailIcon: {
    width: s(24),
    height: vs(24),
    marginRight: s(12),
    marginTop: vs(2), // Slight vertical adjustment for better alignment
  },

  orderDetailText: {
    flex: 1,
    justifyContent: 'center',
  },

  customerName: {
    fontFamily: 'Clash Grotesk Variable',
    fontWeight: '500',
    fontSize: ms(14),
    lineHeight: vs(17),
    color: '#000000',
  },

  phoneNumber: {
    fontFamily: 'Clash Grotesk Variable',
    fontWeight: '500',
    fontSize: ms(16),
    lineHeight: vs(20),
    color: '#1E1E1E',
  },

  orderPrice: {
    fontFamily: 'Clash Grotesk Variable',
    fontWeight: '500',
    fontSize: ms(16),
    lineHeight: vs(20),
    color: '#1E1E1E',
  },

  paymentMethod: {
    fontFamily: 'Clash Grotesk Variable',
    fontWeight: '500',
    fontSize: ms(16),
    lineHeight: vs(20),
    color: '#1E1E1E',
  },

  // Empty State
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: vs(100),
    paddingHorizontal: s(40),
  },

  emptyText: {
    fontSize: ms(18),
    fontFamily: Fonts.primary,
    fontWeight: '600',
    color: 'rgba(30, 30, 30, 0.5)',
    marginBottom: vs(10),
    textAlign: 'center',
  },

  emptySubtext: {
    fontSize: ms(14),
    fontFamily: Fonts.primary,
    fontWeight: '500',
    color: 'rgba(30, 30, 30, 0.4)',
    textAlign: 'center',
  },
});
