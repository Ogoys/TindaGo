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
 * - Filter tabs: Pending, Preparing, Out for Pickup, Completed, Cancel
 * - Order cards matching Store Home page design
 * - Click order card → Navigate to status-specific detail screen
 *
 * **CURRENT VERSION: HARDCODED DATA FOR DESIGN VISUALIZATION**
 */

import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useFocusEffect } from "expo-router";
import { useCallback } from "react";
import { ref, get, query, orderByChild, equalTo } from 'firebase/database';
import { database } from "../../../../FirebaseConfig";
import { useUser } from "../../../../src/contexts/UserContext";
import { updateOrderStatus, cancelOrder } from "../../../../src/api/orders";
import type { Order } from "../../../../src/models/Order";
import { Typography } from "../../../../src/components/ui/Typography";
import { Colors } from "../../../../src/constants/Colors";
import { Fonts } from "../../../../src/constants/Fonts";
import { s, vs, ms } from "../../../../src/constants/responsive";

type FilterStatus = 'pending' | 'preparing' | 'ready' | 'picked_up' | 'cancelled';

interface FilterTab {
  label: string;
  status: FilterStatus;
}

const FILTER_TABS: FilterTab[] = [
  { label: 'Pending', status: 'pending' },
  { label: 'Preparing', status: 'preparing' },
  { label: 'Out for Pickup', status: 'ready' },
  { label: 'Completed', status: 'picked_up' },
  { label: 'Cancel', status: 'cancelled' },
];

export default function StoreOrdersScreen() {
  const { user } = useUser();
  const [selectedFilter, setSelectedFilter] = useState<FilterStatus>('pending');
  const [realOrders, setRealOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [headerRefreshing, setHeaderRefreshing] = useState(false);

  // Fetch store orders from Firebase (ONE-TIME FETCH - prevents spam reads)
  // OPTIMIZED: Query only this store's orders + use get() instead of onValue()
  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const fetchOrders = async () => {
      try {
        setLoading(true);
        const storeId = user.id;

        const ordersRef = ref(database, 'orders');
        const storeOrdersQuery = query(
          ordersRef,
          orderByChild('storeId'),
          equalTo(storeId)
        );

        const snapshot = await get(storeOrdersQuery);

        if (snapshot.exists()) {
          const data = snapshot.val();
          const storeOrders = Object.keys(data)
            .map(orderId => ({
              ...data[orderId],
              id: orderId,
            }))
            .sort((a: Order, b: Order) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );

          setRealOrders(storeOrders as Order[]);
        } else {
          setRealOrders([]);
        }
      } catch (error) {
        console.error('Error fetching store orders:', error);
        setRealOrders([]);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user]);

  // Refresh orders when screen gains focus (e.g., after accepting/rejecting order in details)
  useFocusEffect(
    useCallback(() => {
      if (!user) return;

      const refreshOnFocus = async () => {
        try {
          const storeId = user.id;
          const ordersRef = ref(database, 'orders');
          const storeOrdersQuery = query(
            ordersRef,
            orderByChild('storeId'),
            equalTo(storeId)
          );

          const snapshot = await get(storeOrdersQuery);

          if (snapshot.exists()) {
            const data = snapshot.val();
            const storeOrders = Object.keys(data)
              .map(orderId => ({
                ...data[orderId],
                id: orderId,
              }))
              .sort((a: Order, b: Order) =>
                new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
              );

            setRealOrders(storeOrders as Order[]);
          } else {
            setRealOrders([]);
          }
        } catch (error) {
          console.error('Error refreshing orders on focus:', error);
        }
      };

      refreshOnFocus();
    }, [user])
  );

  // Pull-to-refresh handler
  const onRefresh = async () => {
    if (!user) return;

    setRefreshing(true);
    try {
      const storeId = user.id;
      const ordersRef = ref(database, 'orders');
      const storeOrdersQuery = query(
        ordersRef,
        orderByChild('storeId'),
        equalTo(storeId)
      );

      const snapshot = await get(storeOrdersQuery);

      if (snapshot.exists()) {
        const data = snapshot.val();
        const storeOrders = Object.keys(data)
          .map(orderId => ({
            ...data[orderId],
            id: orderId,
          }))
          .sort((a: Order, b: Order) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );

        setRealOrders(storeOrders as Order[]);
      } else {
        setRealOrders([]);
      }
    } catch (error) {
      console.error('Error refreshing orders:', error);
    } finally {
      setRefreshing(false);
    }
  };
  
  // Header refresh button handler
  const handleHeaderRefresh = async () => {
    if (!user) return;
    
    setHeaderRefreshing(true);
    try {
      const storeId = user.id;
      const ordersRef = ref(database, 'orders');
      const storeOrdersQuery = query(
        ordersRef,
        orderByChild('storeId'),
        equalTo(storeId)
      );

      const snapshot = await get(storeOrdersQuery);

      if (snapshot.exists()) {
        const data = snapshot.val();
        const storeOrders = Object.keys(data)
          .map(orderId => ({
            ...data[orderId],
            id: orderId,
          }))
          .sort((a: Order, b: Order) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );

        setRealOrders(storeOrders as Order[]);
      } else {
        setRealOrders([]);
      }
    } catch (error) {
      console.error('Error refreshing orders:', error);
    } finally {
      setHeaderRefreshing(false);
    }
  };

  // Filter orders based on selected status
  const filteredOrders = realOrders.filter(order => order.status === selectedFilter);

  const handleBack = () => {
    router.push('/(main)/(store-owner)/home');
  };

  const handleOrderPress = (orderId: string, status: FilterStatus) => {
    // Navigate to dynamic details screen with status parameter
    router.push(`/(main)/(store-owner)/orders/details?id=${orderId}&status=${status}` as any);
  };

  // PREPARING STATUS: Mark order as ready for pickup
  const handleReadyForPickup = async (orderId: string, orderNumber: string) => {
    Alert.alert(
      "Mark as Ready?",
      `Order ${orderNumber} will be marked as ready for pickup. Customer will be notified.`,
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Confirm",
          onPress: async () => {
            const success = await updateOrderStatus(orderId, 'ready');
            if (success) {
              // Refresh orders list to show updated status
              await onRefresh();
              Alert.alert(
                "Success",
                "Order is now ready for pickup. Customer has been notified."
              );
            } else {
              Alert.alert("Error", "Failed to update order status. Please try again.");
            }
          }
        }
      ]
    );
  };

  // READY STATUS: Confirm customer picked up the order
  const handleOrderPickup = async (orderId: string, orderNumber: string) => {
    Alert.alert(
      "Confirm Order Pickup?",
      `Has the customer picked up order ${orderNumber}?`,
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Confirm Pickup",
          onPress: async () => {
            const success = await updateOrderStatus(orderId, 'picked_up');
            if (success) {
              // Refresh orders list to show updated status
              await onRefresh();
              Alert.alert(
                "Order Completed",
                "The order has been marked as completed."
              );
            } else {
              Alert.alert("Error", "Failed to update order status. Please try again.");
            }
          }
        }
      ]
    );
  };

  // PICKED_UP STATUS: View order details (button for consistency)
  const handlePickupComplete = (orderId: string, orderNumber: string) => {
    // Navigate to details to view completed order
    handleOrderPress(orderId, 'picked_up');
  };

  // CANCELLED STATUS: View cancellation details
  const handleViewCancellation = (orderId: string, orderNumber: string) => {
    // Navigate to details to view cancellation reason
    handleOrderPress(orderId, 'cancelled');
  };

  // Get title based on selected filter
  const getTitle = () => {
    const tab = FILTER_TABS.find(t => t.status === selectedFilter);
    return tab ? tab.label : 'Orders';
  };

  // Format time ago - ACCURATE calculation based on actual order date
  const getTimeAgo = (dateString: string): string => {
    if (!dateString) return 'Unknown';

    try {
      const now = new Date();
      const orderDate = new Date(dateString);

      // Validate the date
      if (isNaN(orderDate.getTime())) {
        return 'Unknown';
      }

      // Calculate difference in milliseconds
      const diffMs = now.getTime() - orderDate.getTime();

      // Handle future dates (shouldn't happen but just in case)
      if (diffMs < 0) {
        return 'Just now';
      }

      // Convert to different units
      const diffSeconds = Math.floor(diffMs / 1000);
      const diffMinutes = Math.floor(diffSeconds / 60);
      const diffHours = Math.floor(diffMinutes / 60);
      const diffDays = Math.floor(diffHours / 24);
      const diffWeeks = Math.floor(diffDays / 7);
      const diffMonths = Math.floor(diffDays / 30);

      // Return appropriate string based on time difference
      if (diffSeconds < 60) {
        return 'Just now';
      } else if (diffMinutes < 60) {
        return `${diffMinutes} min${diffMinutes !== 1 ? 's' : ''} ago`;
      } else if (diffHours < 24) {
        return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
      } else if (diffDays === 1) {
        return 'Yesterday';
      } else if (diffDays < 7) {
        return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
      } else if (diffWeeks < 4) {
        return `${diffWeeks} week${diffWeeks !== 1 ? 's' : ''} ago`;
      } else if (diffMonths < 12) {
        return `${diffMonths} month${diffMonths !== 1 ? 's' : ''} ago`;
      } else {
        // For very old orders, show the actual date
        return orderDate.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        });
      }
    } catch (error) {
      console.error('Error parsing date:', error);
      return 'Unknown';
    }
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
        
        {/* Refresh Button */}
        <TouchableOpacity
          style={styles.refreshButton}
          onPress={handleHeaderRefresh}
          disabled={headerRefreshing}
          activeOpacity={0.7}
        >
          <Text style={styles.refreshIcon}>{headerRefreshing ? '⏳' : '🔄'}</Text>
        </TouchableOpacity>
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
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.primary} />
            <Text style={styles.loadingText}>Loading orders...</Text>
          </View>
        ) : filteredOrders.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No {getTitle().toLowerCase()} orders</Text>
            <Text style={styles.emptySubtext}>Orders will appear here when customers place them</Text>
          </View>
        ) : (
          <View style={styles.orderListContainer}>
            {filteredOrders.map((order) => (
              <TouchableOpacity
                key={order.id}
                style={[
                  styles.orderCard,
                  (order.status === 'preparing' || order.status === 'ready' || order.status === 'picked_up' || order.status === 'cancelled') && styles.orderCardWithButton
                ]}
                onPress={() => handleOrderPress(order.id, selectedFilter)}
                activeOpacity={0.8}
              >
                {/* Order Card Background - Figma: Rectangle 64 400x200 with 16px radius (260px with button) */}
                <View style={[
                  styles.orderCardBackground,
                  (order.status === 'preparing' || order.status === 'ready' || order.status === 'picked_up' || order.status === 'cancelled') && styles.orderCardBackgroundWithButton
                ]} />

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
                  <Typography style={styles.orderTime}>{getTimeAgo(order.createdAt)}</Typography>
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
                      <Typography style={styles.phoneNumber}>{order.customerPhone || 'N/A'}</Typography>
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
                      <Typography style={styles.paymentMethod}>
                        {order.paymentMethod === 'gcash' ? 'GCash' :
                         order.paymentMethod === 'paymaya' ? 'PayMaya' :
                         order.paymentMethod === 'cash' ? 'Cash' :
                         order.paymentMethod.toUpperCase()}
                      </Typography>
                    </View>
                  </View>
                </View>

                {/* Action Buttons - Figma: Continue button at 20,200 360x40 */}
                {order.status === 'preparing' && (
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={(e) => {
                      e.stopPropagation(); // Prevent card press
                      handleReadyForPickup(order.id, order.orderNumber);
                    }}
                    activeOpacity={0.8}
                  >
                    <View style={styles.actionButtonBackground} />
                    <Text style={styles.actionButtonText}>Ready to Pickup</Text>
                  </TouchableOpacity>
                )}
                {order.status === 'ready' && (
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={(e) => {
                      e.stopPropagation(); // Prevent card press
                      handleOrderPickup(order.id, order.orderNumber);
                    }}
                    activeOpacity={0.8}
                  >
                    <View style={styles.actionButtonBackground} />
                    <Text style={styles.actionButtonText}>Order Pickup</Text>
                  </TouchableOpacity>
                )}
                {order.status === 'picked_up' && (
                  <TouchableOpacity
                    style={styles.pickupActionButton}
                    onPress={(e) => {
                      e.stopPropagation(); // Prevent card press
                      handlePickupComplete(order.id, order.orderNumber);
                    }}
                    activeOpacity={0.8}
                  >
                    <View style={styles.pickupActionButtonBackground} />
                    <Text style={styles.pickupActionButtonText}>Pickup</Text>
                  </TouchableOpacity>
                )}
                {order.status === 'cancelled' && (
                  <TouchableOpacity
                    style={styles.cancelActionButton}
                    onPress={(e) => {
                      e.stopPropagation(); // Prevent card press
                      handleViewCancellation(order.id, order.orderNumber);
                    }}
                    activeOpacity={0.8}
                  >
                    <View style={styles.cancelActionButtonBackground} />
                    <Text style={styles.cancelActionButtonText}>Cancel</Text>
                  </TouchableOpacity>
                )}
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
  
  // Refresh Button
  refreshButton: {
    position: 'absolute',
    right: s(20),
    width: s(40),
    height: s(40),
    borderRadius: s(20),
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: 'rgba(0, 0, 0, 0.25)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 5,
  },
  
  refreshIcon: {
    fontSize: ms(20),
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

  // Order card with button (preparing/ready) - Figma: height:260 (increased from 200 for button)
  orderCardWithButton: {
    height: vs(260),
  },

  orderCardBackgroundWithButton: {
    height: vs(260),
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

  // Loading State
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: vs(100),
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

  // Action Button (Ready to Pickup / Order Pickup) - Figma: Continue button at 20,200 360x40
  actionButton: {
    position: 'absolute',
    left: s(20),
    top: vs(200),
    width: s(360),
    height: vs(40),
    justifyContent: 'center',
    alignItems: 'center',
  },

  actionButtonBackground: {
    position: 'absolute',
    width: s(360),
    height: vs(40),
    backgroundColor: '#3BB77E', // Figma: fill_879QBJ
    borderRadius: s(10),
    shadowColor: 'rgba(0, 0, 0, 0.25)',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: s(4),
    elevation: 4,
  },

  actionButtonText: {
    fontFamily: 'Clash Grotesk Variable',
    fontWeight: '500',
    fontSize: ms(18),
    lineHeight: ms(18) * 1.22,
    textAlign: 'center',
    color: '#FFFFFF',
  },

  // Pickup Button (Light Green) - Figma: pickup card node 1057-5215
  pickupActionButton: {
    position: 'absolute',
    left: s(20),
    top: vs(200),
    width: s(360),
    height: vs(40),
    justifyContent: 'center',
    alignItems: 'center',
  },

  pickupActionButtonBackground: {
    position: 'absolute',
    width: s(360),
    height: vs(40),
    backgroundColor: '#DCFCE7', // Light green background
    borderRadius: s(10),
    shadowColor: 'rgba(0, 0, 0, 0.25)',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: s(4),
    elevation: 4,
  },

  pickupActionButtonText: {
    fontFamily: 'Clash Grotesk Variable',
    fontWeight: '500',
    fontSize: ms(18),
    lineHeight: ms(18) * 1.22,
    textAlign: 'center',
    color: '#3BB77E', // Green text
  },

  // Cancel Button (Light Red) - Figma: cancel card node 1057-5348
  cancelActionButton: {
    position: 'absolute',
    left: s(20),
    top: vs(200),
    width: s(360),
    height: vs(40),
    justifyContent: 'center',
    alignItems: 'center',
  },

  cancelActionButtonBackground: {
    position: 'absolute',
    width: s(360),
    height: vs(40),
    backgroundColor: '#FECACA', // Light red background
    borderRadius: s(10),
    shadowColor: 'rgba(0, 0, 0, 0.25)',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: s(4),
    elevation: 4,
  },

  cancelActionButtonText: {
    fontFamily: 'Clash Grotesk Variable',
    fontWeight: '500',
    fontSize: ms(18),
    lineHeight: ms(18) * 1.22,
    textAlign: 'center',
    color: '#DC2626', // Red text
  },
});
