/**
 * CUSTOMER ORDER HISTORY SCREEN (From Profile)
 *
 * Figma File: 8I1Nr3vQZllDDknSevstvH
 * Node: 903-5683 (Order History)
 * Baseline: 440x956
 *
 * Displays past order history accessible from customer profile navigation.
 * Shows simple list of completed orders with store name, date, address, and total.
 * This is different from the main Orders screen which has expandable cards.
 */

import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { ref, onValue } from 'firebase/database';
import { database } from '../../../../FirebaseConfig';
import { useUser } from '../../../../src/contexts/UserContext';
import type { Order } from '../../../../src/models/Order';
import { Colors } from "../../../../src/constants/Colors";
import { Fonts } from "../../../../src/constants/Fonts";
import { s, vs, ms } from "../../../../src/constants/responsive";

export default function OrderHistoryScreen() {
  const { user } = useUser();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch completed orders from Firebase
  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const ordersRef = ref(database, 'orders');
    const unsubscribe = onValue(ordersRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        // Filter for completed/picked_up orders for current user
        const completedOrders = Object.keys(data)
          .map(orderId => ({ ...data[orderId], id: orderId }))
          .filter((order: Order) =>
            order.customerId === user.id &&
            (order.status === 'picked_up' || order.status === 'completed')
          )
          .sort((a: Order, b: Order) =>
            new Date(b.completedAt || b.updatedAt).getTime() -
            new Date(a.completedAt || a.updatedAt).getTime()
          );

        setOrders(completedOrders as Order[]);
      } else {
        setOrders([]);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const handleBack = () => {
    router.back();
  };

  const handleOrderPress = (orderId: string) => {
    // Navigate to order details screen with order ID
    router.push(`/(main)/(customer)/profile/order-details-history?id=${orderId}`);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header - Figma: y:0-130 */}
      <View style={styles.header}>
        {/* Back Button - Figma: x:20, y:79, size:30x30 */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleBack}
        >
          <Image
            source={require("../../../../src/assets/images/customer-order-history/chevron-left.png")}
            style={styles.chevronIcon}
          />
        </TouchableOpacity>

        {/* Title - Figma: x:155, y:83 */}
        <Text style={styles.title}>Order HIstory</Text>
      </View>

      {/* Order List - Figma: x:20, y:145 */}
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.primary} />
            <Text style={styles.loadingText}>Loading order history...</Text>
          </View>
        ) : orders.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No completed orders yet</Text>
            <Text style={styles.emptySubtext}>Your order history will appear here once you complete orders</Text>
          </View>
        ) : (
          orders.map((order, index) => (
            <OrderHistoryCard
              key={order.id}
              order={order}
              onPress={() => handleOrderPress(order.id)}
              isFirst={index === 0}
            />
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

interface OrderHistoryCardProps {
  order: Order;
  onPress: () => void;
  isFirst: boolean;
}

const OrderHistoryCard: React.FC<OrderHistoryCardProps> = ({ order, onPress, isFirst }) => {
  // Format date
  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'N/A';
      return date.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' });
    } catch (error) {
      return 'N/A';
    }
  };

  // Safe currency formatter
  const formatCurrency = (value: number | undefined): string => {
    if (value === undefined || value === null || isNaN(value)) {
      return '0.00';
    }
    return value.toFixed(2);
  };

  return (
    <TouchableOpacity
      style={[
        styles.orderCard,
        isFirst && styles.orderCardFirst
      ]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      {/* Order Card - Figma: 400x80 */}

      {/* Logo - Figma: x:20, y:20 (relative to card), size:40x40 */}
      <View style={styles.logoContainer}>
        <View style={styles.logoBackground}>
          <Image
            source={require("../../../../src/assets/images/customer-order-history/cheque-icon.png")}
            style={styles.chequeIcon}
          />
        </View>
      </View>

      {/* Store Info - Figma: x:75, y:22 (relative to card) */}
      <View style={styles.storeInfo}>
        {/* Store Name - Figma: width:126, height:17 */}
        <Text style={styles.storeName}>{order.storeName || 'N/A'}</Text>

        {/* Order Number - Figma: y:44 (relative to card) */}
        <Text style={styles.address}>{order.orderNumber || 'N/A'}</Text>
      </View>

      {/* Right Section */}
      <View style={styles.rightSection}>
        {/* Date - Figma: x:296, y:22 (relative to card) */}
        <Text style={styles.date}>
          {formatDate(order.completedAt || order.updatedAt || order.createdAt)}
        </Text>

        {/* Total - Figma: x:315, y:45 (relative to card) */}
        <Text style={styles.total}>₱{formatCurrency(order.total)}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundGray, // #F4F6F6
  },
  // Header - Figma: y:0-130
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
  chevronIcon: {
    width: s(15),
    height: s(15),
    resizeMode: 'contain',
  },
  // Title - Figma: x:155, y:83, width:130, height:22
  title: {
    fontSize: ms(20),
    fontFamily: Fonts.primary,
    fontWeight: '600',
    color: Colors.darkGray, // #1E1E1E
    lineHeight: ms(22),
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: s(20),
    paddingBottom: vs(20),
  },
  // Order Card - Figma: x:20, y:145, width:400, height:80
  orderCard: {
    width: s(400),
    height: vs(80),
    backgroundColor: Colors.white,
    borderRadius: s(16),
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 3,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: s(20),
    paddingVertical: vs(20),
    marginBottom: vs(20),
  },
  orderCardFirst: {
    marginTop: vs(0),
  },
  // Logo Container - Figma: x:20, y:20 (relative to card), size:40x40
  logoContainer: {
    marginRight: s(15),
  },
  logoBackground: {
    width: s(40),
    height: s(40),
    borderRadius: s(5),
    backgroundColor: '#02545F', // Figma: fill_1BXGZX
    justifyContent: 'center',
    alignItems: 'center',
  },
  chequeIcon: {
    width: s(25),
    height: s(25),
    resizeMode: 'contain',
  },
  // Store Info - Figma: x:75, y:22 (relative to card)
  storeInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  // Store Name - Figma: width:126, height:17, fontSize:14
  storeName: {
    fontSize: ms(14),
    fontFamily: Fonts.primary,
    fontWeight: '500',
    color: Colors.darkGray, // #1E1E1E
    lineHeight: ms(17.22), // 1.23em
    marginBottom: vs(5),
  },
  // Address - Figma: fontSize:12, lineHeight:1.23em
  address: {
    fontSize: ms(12),
    fontFamily: Fonts.primary,
    fontWeight: '500',
    color: 'rgba(30, 30, 30, 0.5)', // Figma: fill_Z688EZ
    lineHeight: ms(14.76), // 1.23em
  },
  // Right Section
  rightSection: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  // Date - Figma: x:296, y:22, width:84, height:17, fontSize:14
  date: {
    fontSize: ms(14),
    fontFamily: Fonts.primary,
    fontWeight: '500',
    color: 'rgba(30, 30, 30, 0.5)', // Figma: fill_Z688EZ
    lineHeight: ms(17.22), // 1.23em
    marginBottom: vs(3),
    textAlign: 'right',
  },
  // Total - Figma: x:315, y:45, width:65, height:20, fontSize:16
  total: {
    fontSize: ms(16),
    fontFamily: Fonts.primary,
    fontWeight: '500',
    color: Colors.darkGray, // #1E1E1E
    lineHeight: ms(19.68), // 1.23em
    textAlign: 'right',
  },
  // Loading State
  loadingContainer: {
    paddingVertical: vs(80),
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: vs(15),
    fontSize: ms(16),
    fontFamily: Fonts.primary,
    fontWeight: '500',
    color: 'rgba(30, 30, 30, 0.5)',
  },
  // Empty State
  emptyContainer: {
    paddingVertical: vs(80),
    paddingHorizontal: s(40),
    alignItems: 'center',
    justifyContent: 'center',
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
    fontWeight: '400',
    color: 'rgba(30, 30, 30, 0.4)',
    textAlign: 'center',
    lineHeight: ms(14) * 1.5,
  },
});
