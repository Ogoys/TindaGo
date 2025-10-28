import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  StatusBar,
  Alert,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { ref, get } from 'firebase/database';
import { database } from "../../../../FirebaseConfig";
import { updateOrderStatus, cancelOrder } from "../../../../src/api/orders";
import type { Order } from "../../../../src/models/Order";
import { s, vs, ms } from "../../../../src/constants/responsive";
import { Colors } from "../../../../src/constants/Colors";

/**
 * STORE OWNER - ORDER DETAILS (DYNAMIC)
 *
 * Figma File: 8I1Nr3vQZllDDknSevstvH
 * Node: 1057-4876 (Pending/Order Details)
 * Baseline: 440x956
 *
 * Dynamic screen that shows order details with different actions based on order status:
 * - pending: Accept/Reject buttons
 * - preparing: Ready to Pickup button
 * - ready: Order Pickup button (mark as completed)
 * - picked_up/completed: Read-only, no buttons
 * - cancelled: Read-only, shows cancellation reason
 */

export default function OrderDetailsScreen() {
  const params = useLocalSearchParams();
  const orderId = params.id as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch order data from Firebase
  useEffect(() => {
    const fetchOrderData = async () => {
      if (!orderId) {
        setLoading(false);
        return;
      }

      try {
        const orderRef = ref(database, `orders/${orderId}`);
        const snapshot = await get(orderRef);

        if (snapshot.exists()) {
          setOrder({ ...snapshot.val(), id: orderId });
        } else {
          Alert.alert("Error", "Order not found");
          router.back();
        }
      } catch (error) {
        console.error("Error fetching order:", error);
        Alert.alert("Error", "Failed to load order details");
      } finally {
        setLoading(false);
      }
    };

    fetchOrderData();
  }, [orderId]);

  // Format time ago
  const getTimeAgo = (dateString: string) => {
    const now = new Date();
    const orderDate = new Date(dateString);
    const diffMs = now.getTime() - orderDate.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  };

  // PENDING STATUS: Accept order handler
  const handleAcceptOrder = async () => {
    if (!order) return;

    Alert.alert(
      "Accept Order?",
      `Order ${order.orderNumber} will be marked as preparing. Customer will be notified.`,
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Accept",
          onPress: async () => {
            const success = await updateOrderStatus(orderId, 'preparing');
            if (success) {
              Alert.alert(
                "Order Accepted",
                "The order has been accepted and marked as preparing.",
                [
                  {
                    text: "OK",
                    onPress: () => router.back()
                  }
                ]
              );
            } else {
              Alert.alert("Error", "Failed to accept order. Please try again.");
            }
          }
        }
      ]
    );
  };

  // PENDING STATUS: Reject order handler
  const handleRejectOrder = () => {
    if (!order) return;

    Alert.alert(
      "Reject Order?",
      "Are you sure you want to reject this order? Please provide a reason.",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Reject",
          style: "destructive",
          onPress: async () => {
            // TODO: Add input field for rejection reason
            const reason = "Store rejected the order"; // Default reason
            const success = await cancelOrder(orderId, reason, 'store');
            if (success) {
              Alert.alert(
                "Order Rejected",
                "The order has been rejected and the customer will be notified.",
                [
                  {
                    text: "OK",
                    onPress: () => router.back()
                  }
                ]
              );
            } else {
              Alert.alert("Error", "Failed to reject order. Please try again.");
            }
          }
        }
      ]
    );
  };

  // PREPARING STATUS: Mark as ready for pickup
  const handleReadyForPickup = async () => {
    if (!order) return;

    Alert.alert(
      "Mark as Ready?",
      `Order ${order.orderNumber} will be marked as ready for pickup. Customer will be notified.`,
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
              Alert.alert(
                "Success",
                "Order is now ready for pickup. Customer has been notified.",
                [{ text: "OK", onPress: () => router.back() }]
              );
            } else {
              Alert.alert("Error", "Failed to update order status. Please try again.");
            }
          }
        }
      ]
    );
  };

  // READY STATUS: Mark as picked up/completed
  const handleOrderPickup = async () => {
    if (!order) return;

    Alert.alert(
      "Confirm Order Pickup?",
      `Has the customer picked up order ${order.orderNumber}?`,
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
              Alert.alert(
                "Order Completed",
                "The order has been marked as completed.",
                [{ text: "OK", onPress: () => router.back() }]
              );
            } else {
              Alert.alert("Error", "Failed to update order status. Please try again.");
            }
          }
        }
      ]
    );
  };

  // Render action buttons based on order status
  const renderActionButtons = () => {
    if (!order) return null;

    switch (order.status) {
      case 'pending':
        return (
          <>
            {/* ACCEPT BUTTON */}
            <TouchableOpacity
              style={styles.acceptButton}
              onPress={handleAcceptOrder}
              activeOpacity={0.8}
            >
              <View style={styles.acceptButtonBackground} />
              <Text style={styles.acceptButtonText}>Accept</Text>
            </TouchableOpacity>

            {/* REJECT BUTTON */}
            <TouchableOpacity
              style={styles.rejectButton}
              onPress={handleRejectOrder}
              activeOpacity={0.8}
            >
              <View style={styles.rejectButtonBackground} />
              <Text style={styles.rejectButtonText}>Reject</Text>
            </TouchableOpacity>
          </>
        );

      case 'preparing':
        return (
          <TouchableOpacity
            style={styles.readyButton}
            onPress={handleReadyForPickup}
            activeOpacity={0.8}
          >
            <View style={styles.readyButtonBackground} />
            <Text style={styles.readyButtonText}>Ready to Pickup</Text>
          </TouchableOpacity>
        );

      case 'ready':
        return (
          <TouchableOpacity
            style={styles.pickupButton}
            onPress={handleOrderPickup}
            activeOpacity={0.8}
          >
            <View style={styles.pickupButtonBackground} />
            <Text style={styles.pickupButtonText}>Order Pickup</Text>
          </TouchableOpacity>
        );

      case 'picked_up':
      case 'completed':
        return (
          <TouchableOpacity
            style={styles.completedButton}
            activeOpacity={0.8}
          >
            <View style={styles.completedButtonBackground} />
            <Text style={styles.completedButtonText}>Pickup</Text>
          </TouchableOpacity>
        );

      case 'cancelled':
        return (
          <View style={styles.cancelledContainer}>
            <View style={styles.cancelledButton}>
              <View style={styles.cancelledButtonBackground} />
              <Text style={styles.cancelledButtonText}>Order Cancelled</Text>
            </View>
            {order.cancellationReason && (
              <View style={styles.cancelReasonCard}>
                <Text style={styles.cancelReasonLabel}>Cancellation Reason:</Text>
                <Text style={styles.cancelReasonText}>{order.cancellationReason}</Text>
                {order.cancelledBy && (
                  <Text style={styles.cancelledByText}>
                    Cancelled by: {order.cancelledBy === 'store' ? 'Store' : 'Customer'}
                  </Text>
                )}
              </View>
            )}
          </View>
        );

      default:
        return null;
    }
  };

  // Show loading state
  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <StatusBar barStyle="dark-content" backgroundColor="#F4F6F6" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Loading order details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Show error if no order
  if (!order) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <StatusBar barStyle="dark-content" backgroundColor="#F4F6F6" />
        <View style={styles.loadingContainer}>
          <Text style={styles.emptyText}>Order not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#F4F6F6" />

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* BACK BUTTON - Figma: 1057:4877, x:20, y:79, width:30, height:30 */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <View style={styles.backButtonCircle} />
          <Image
            source={require("../../../../src/assets/images/store-order-details-pending/chevron-left.png")}
            style={styles.backButtonIcon}
            resizeMode="contain"
          />
        </TouchableOpacity>

        {/* TITLE - Figma: 1057:4879, x:158, y:83, width:124, height:22 */}
        <Text style={styles.title}>Order Details</Text>

        {/* ORDER INFO CARD - Using same design as order list cards */}
        <View style={styles.orderInfoCard}>
          {/* Card Background */}
          <View style={styles.orderInfoBackground} />

          {/* Logo Section */}
          <View style={styles.orderLogo}>
            <View style={styles.orderLogoBackground} />
            <Image
              source={require('../../../../src/assets/images/store-owner-dashboard/cheque-icon.png')}
              style={styles.orderLogoIcon}
              resizeMode="contain"
            />
          </View>

          {/* Order Header */}
          <View style={styles.orderHeader}>
            <View style={styles.orderHeaderLeft}>
              <Text style={styles.orderNoLabel}>Order No</Text>
              <Text style={styles.orderNumber}>{order.orderNumber}</Text>
            </View>
            <Text style={styles.timeAgo}>{getTimeAgo(order.createdAt)}</Text>
          </View>

          {/* Separator Line */}
          <View style={styles.orderSeparator} />

          {/* Order Details Row 1 - Customer Info */}
          <View style={styles.orderDetailsRow1}>
            {/* Customer Name */}
            <View style={styles.orderDetailCustomer}>
              <Image
                source={require('../../../../src/assets/images/store-owner-dashboard/person-icon.png')}
                style={styles.orderDetailIcon}
                resizeMode="contain"
              />
              <View style={styles.orderDetailText}>
                <Text style={styles.customerName}>{order.customerName}</Text>
              </View>
            </View>

            {/* Phone Number */}
            <View style={styles.orderDetailPhone}>
              <Image
                source={require('../../../../src/assets/images/store-owner-dashboard/phone-icon.png')}
                style={styles.orderDetailIcon}
                resizeMode="contain"
              />
              <View style={styles.orderDetailText}>
                <Text style={styles.customerPhone}>{order.customerPhone || 'N/A'}</Text>
              </View>
            </View>
          </View>

          {/* Order Details Row 2 - Payment Info */}
          <View style={styles.orderDetailsRow2}>
            {/* Price */}
            <View style={styles.orderDetailPrice}>
              <Image
                source={require('../../../../src/assets/images/store-owner-dashboard/coin-wallet-icon.png')}
                style={styles.orderDetailIcon}
                resizeMode="contain"
              />
              <View style={styles.orderDetailText}>
                <Text style={styles.orderPrice}>₱{order.total.toFixed(2)}</Text>
              </View>
            </View>

            {/* Payment Method */}
            <View style={styles.orderDetailPayment}>
              <Image
                source={require('../../../../src/assets/images/store-owner-dashboard/wallet-payment-icon.png')}
                style={styles.orderDetailIcon}
                resizeMode="contain"
              />
              <View style={styles.orderDetailText}>
                <Text style={styles.paymentMethod}>{order.paymentMethod.toUpperCase()}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* ORDER LIST CARD - Figma: 1057:4905, x:20, y:365, width:400, height:470 */}
        <View style={styles.orderListCard}>
          {/* Card Background - Figma: 1057:4906 */}
          <View style={styles.orderListBackground} />

          {/* Header Row - Figma: 1057:4907, 1057:4921, 1057:4914, y:395 */}
          <View style={styles.tableHeaderRow}>
            <Text style={styles.headerItems}>Order Items</Text>
            <Text style={styles.headerQnt}>Qnt.</Text>
            <Text style={styles.headerAmount}>Amount</Text>
          </View>

          {/* Divider under header - Figma: 1057:4928, y:425 */}
          <View style={styles.dividerLine2} />

          {/* Order Items List */}
          {order.items.map((item, index) => (
            <View
              key={item.productId}
              style={[
                styles.orderItemRow,
                { top: vs(60 + (index * 40)) } // Dynamic positioning
              ]}
            >
              <Text style={styles.itemName}>{item.productName}</Text>
              <Text style={styles.itemQnt}>{item.quantity}</Text>
              <Text style={styles.itemAmount}>₱{item.subtotal.toFixed(2)}</Text>
            </View>
          ))}

          {/* Divider before tax - Figma: 1057:4929, y:705 */}
          <View style={styles.dividerLine3} />
        </View>

        {/* TAX ROW - Figma: 1057:4930, x:40, y:725 */}
        <View style={styles.taxRow}>
          <Text style={styles.taxLabel}>Tax(10%)</Text>
          <Text style={styles.taxValue}>₱{order.tax.toFixed(2)}</Text>
        </View>

        {/* Divider before subtotal - Figma: 1057:4933, y:765 */}
        <View style={styles.dividerLine4} />

        {/* SUBTOTAL ROW - Figma: 1057:4934, x:40, y:785 */}
        <View style={styles.subtotalRow}>
          <Text style={styles.subtotalLabel}>Sub Total</Text>
          <Text style={styles.subtotalValue}>₱{order.subtotal.toFixed(2)}</Text>
        </View>

        {/* DYNAMIC ACTION BUTTONS based on order status */}
        {renderActionButtons()}

        {/* Bottom Padding */}
        <View style={styles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  // CONTAINER - Figma: 1057:4876, 440x956, background:#F4F6F6
  container: {
    flex: 1,
    backgroundColor: "#F4F6F6", // Figma: fill_6FEJSW
  },

  scrollView: {
    flex: 1,
  },

  scrollContent: {
    paddingBottom: vs(40),
  },

  // BACK BUTTON - Figma: 1057:4877, x:20, y:79, width:30, height:30
  backButton: {
    position: "absolute",
    left: s(20),
    top: vs(79),
    width: s(30),
    height: s(30),
    zIndex: 10,
  },

  // Back Button Circle Background
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

  // Back Button Icon - Figma: 1057:4878, 15x15
  backButtonIcon: {
    position: "absolute",
    left: s(7.5),
    top: s(7.5),
    width: s(15),
    height: s(15),
  },

  // TITLE - Figma: 1057:4879, x:158, y:83, width:124, height:22
  title: {
    position: "absolute",
    left: s(158),
    top: vs(83),
    width: s(124),
    height: vs(22),
    fontFamily: "Clash Grotesk Variable",
    fontWeight: "600",
    fontSize: ms(20),
    lineHeight: ms(20) * 1.1,
    textAlign: "center",
    color: "#1E1E1E", // Figma: fill_3TK9OA
  },

  // ORDER INFO CARD - Using same design as order list cards
  orderInfoCard: {
    position: "absolute",
    left: s(20),
    top: vs(145),
    width: s(400),
    height: vs(200),
  },

  orderInfoBackground: {
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

  // Order Logo - Same as list cards
  orderLogo: {
    position: 'absolute',
    top: vs(20),
    left: s(20),
    width: s(40),
    height: s(40),
  },

  orderLogoBackground: {
    width: '100%',
    height: '100%',
    backgroundColor: '#02545F',
    borderRadius: s(5),
  },

  orderLogoIcon: {
    position: 'absolute',
    top: s(7),
    left: s(7.5),
    width: s(25),
    height: s(25),
  },

  // Order Header - Same as list cards
  orderHeader: {
    position: 'absolute',
    top: vs(20),
    left: s(75),
    right: s(20),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },

  orderHeaderLeft: {
    flexDirection: 'column',
  },

  orderNoLabel: {
    fontFamily: 'Clash Grotesk Variable',
    fontWeight: '500',
    fontSize: ms(14),
    lineHeight: vs(17),
    color: 'rgba(30, 30, 30, 0.5)',
    marginBottom: vs(4),
  },

  orderNumber: {
    fontFamily: 'Clash Grotesk Variable',
    fontWeight: '500',
    fontSize: ms(12),
    lineHeight: vs(15),
    color: '#000000',
  },

  timeAgo: {
    fontFamily: 'Clash Grotesk Variable',
    fontWeight: '500',
    fontSize: ms(14),
    lineHeight: vs(17),
    color: 'rgba(30, 30, 30, 0.5)',
    textAlign: 'right',
  },

  // Separator Line - Same as list cards
  orderSeparator: {
    position: 'absolute',
    top: vs(80),
    left: s(10),
    right: s(10),
    height: 2,
    backgroundColor: '#02545F',
  },

  // Order Details Rows - Same as list cards
  orderDetailsRow1: {
    position: 'absolute',
    top: vs(98),
    left: s(20),
    right: s(20),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },

  orderDetailsRow2: {
    position: 'absolute',
    top: vs(150),
    left: s(20),
    right: s(20),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  orderDetailCustomer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    width: s(160),
  },

  orderDetailPhone: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    width: s(160),
  },

  orderDetailPrice: {
    flexDirection: 'row',
    alignItems: 'center',
    width: s(150),
  },

  orderDetailPayment: {
    flexDirection: 'row',
    alignItems: 'center',
    width: s(160),
  },

  orderDetailIcon: {
    width: s(24),
    height: vs(24),
    marginRight: s(12),
    marginTop: vs(2),
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

  customerPhone: {
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

  // ORDER LIST CARD - Figma: 1057:4905, x:20, y:365, width:400, height:470
  orderListCard: {
    position: "absolute",
    left: s(20),
    top: vs(365),
    width: s(400),
    height: vs(470),
  },

  // Order List Background - Figma: 1057:4906
  orderListBackground: {
    position: "absolute",
    width: s(400),
    height: vs(470),
    backgroundColor: "#FFFFFF",
    borderRadius: s(16),
    shadowColor: "rgba(0, 0, 0, 0.25)",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: s(5),
    elevation: 5,
  },

  // Table Header Row - Figma: y:395 (relative: y:30)
  tableHeaderRow: {
    position: "absolute",
    left: s(20),
    top: vs(30),
    width: s(360),
    flexDirection: "row",
    justifyContent: "space-between",
  },

  // Header Items - Figma: 1057:4908
  headerItems: {
    fontFamily: "Clash Grotesk Variable",
    fontWeight: "500",
    fontSize: ms(16),
    lineHeight: ms(16) * 1.23,
    color: "#1E1E1E", // Figma: fill_3TK9OA
    width: s(148),
  },

  // Header Qnt - Figma: 1057:4927
  headerQnt: {
    fontFamily: "Clash Grotesk Variable",
    fontWeight: "500",
    fontSize: ms(16),
    lineHeight: ms(16) * 1.23,
    textAlign: "center",
    color: "#1E1E1E", // Figma: style_98AHA5
    width: s(30),
  },

  // Header Amount - Figma: 1057:4920
  headerAmount: {
    fontFamily: "Clash Grotesk Variable",
    fontWeight: "500",
    fontSize: ms(16),
    lineHeight: ms(16) * 1.23,
    textAlign: "center",
    color: "#1E1E1E", // Figma: style_98AHA5
    width: s(63),
  },

  // Divider Line 2 - Figma: 1057:4928, y:425 (relative: y:60)
  dividerLine2: {
    position: "absolute",
    left: s(10),
    top: vs(60),
    width: s(380),
    height: 2,
    backgroundColor: "#02545F", // Figma: stroke_QIPMYT
  },

  // Order Item Row - Dynamic positioning based on index
  orderItemRow: {
    position: "absolute",
    left: s(20),
    width: s(360),
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },

  // Item Name - Figma: 1057:4909 and others
  itemName: {
    fontFamily: "Clash Grotesk Variable",
    fontWeight: "500",
    fontSize: ms(16),
    lineHeight: ms(16) * 1.23,
    color: "#1E1E1E", // Figma: fill_3TK9OA
    width: s(148),
  },

  // Item Quantity - Figma: 1057:4922 and others
  itemQnt: {
    fontFamily: "Clash Grotesk Variable",
    fontWeight: "500",
    fontSize: ms(16),
    lineHeight: ms(16) * 1.23,
    textAlign: "center",
    color: "#1E1E1E", // Figma: fill_3TK9OA
    width: s(30),
  },

  // Item Amount - Figma: 1057:4915 and others
  itemAmount: {
    fontFamily: "Clash Grotesk Variable",
    fontWeight: "500",
    fontSize: ms(16),
    lineHeight: ms(16) * 1.23,
    textAlign: "center",
    color: "#1E1E1E", // Figma: style_98AHA5
    width: s(63),
  },

  // Divider Line 3 - Figma: 1057:4929, y:705 (relative: y:340)
  dividerLine3: {
    position: "absolute",
    left: s(10),
    top: vs(340),
    width: s(380),
    height: 2,
    backgroundColor: "#02545F", // Figma: stroke_QIPMYT
  },

  // TAX ROW - Figma: 1057:4930, x:40, y:725
  taxRow: {
    position: "absolute",
    left: s(40),
    top: vs(725),
    width: s(328),
    flexDirection: "row",
    justifyContent: "space-between",
  },

  // Tax Label - Figma: 1057:4931
  taxLabel: {
    fontFamily: "Clash Grotesk Variable",
    fontWeight: "500",
    fontSize: ms(16),
    lineHeight: ms(16) * 1.23,
    color: "#1E1E1E", // Figma: fill_3TK9OA
  },

  // Tax Value - Figma: 1057:4932
  taxValue: {
    fontFamily: "Clash Grotesk Variable",
    fontWeight: "500",
    fontSize: ms(16),
    lineHeight: ms(16) * 1.23,
    textAlign: "center",
    color: "#1E1E1E", // Figma: style_98AHA5
  },

  // Divider Line 4 - Figma: 1057:4933, y:765
  dividerLine4: {
    position: "absolute",
    left: s(30),
    top: vs(765),
    width: s(380),
    height: 2,
    backgroundColor: "#02545F", // Figma: stroke_QIPMYT
  },

  // SUBTOTAL ROW - Figma: 1057:4934, x:40, y:785
  subtotalRow: {
    position: "absolute",
    left: s(40),
    top: vs(785),
    width: s(328),
    flexDirection: "row",
    justifyContent: "space-between",
  },

  // Subtotal Label - Figma: 1057:4935
  subtotalLabel: {
    fontFamily: "Clash Grotesk Variable",
    fontWeight: "600",
    fontSize: ms(16),
    lineHeight: ms(16) * 1.23,
    color: "#1E1E1E", // Figma: style_KEVKXA
  },

  // Subtotal Value - Figma: 1057:4936
  subtotalValue: {
    fontFamily: "Clash Grotesk Variable",
    fontWeight: "500",
    fontSize: ms(16),
    lineHeight: ms(16) * 1.23,
    textAlign: "center",
    color: "#1E1E1E", // Figma: style_98AHA5
  },

  // ACCEPT BUTTON - Figma: 1057:4937, x:20, y:875, width:400, height:50
  acceptButton: {
    position: "absolute",
    left: s(20),
    top: vs(875),
    width: s(400),
    height: vs(50),
    justifyContent: "center",
    alignItems: "center",
  },

  // Accept Button Background
  acceptButtonBackground: {
    position: "absolute",
    width: s(400),
    height: vs(50),
    backgroundColor: "#3BB77E", // Figma: fill_5SG5OK
    borderRadius: s(20),
    shadowColor: "rgba(0, 0, 0, 0.25)",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: s(4),
    elevation: 4,
  },

  // Accept Button Text - Figma: 1057:4938
  acceptButtonText: {
    fontFamily: "Clash Grotesk Variable",
    fontWeight: "500",
    fontSize: ms(20),
    lineHeight: ms(20) * 1.1,
    textAlign: "center",
    color: "#FFFFFF", // Figma: fill_H5ZU9S
  },

  // REJECT BUTTON - Positioned below Accept button
  rejectButton: {
    position: "absolute",
    left: s(20),
    top: vs(945), // 875 + 50 + 20 spacing
    width: s(400),
    height: vs(50),
    justifyContent: "center",
    alignItems: "center",
  },

  // Reject Button Background
  rejectButtonBackground: {
    position: "absolute",
    width: s(400),
    height: vs(50),
    backgroundColor: "#FFFFFF",
    borderRadius: s(20),
    borderWidth: 2,
    borderColor: "#FF4444",
    shadowColor: "rgba(0, 0, 0, 0.25)",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: s(4),
    elevation: 4,
  },

  // Reject Button Text
  rejectButtonText: {
    fontFamily: "Clash Grotesk Variable",
    fontWeight: "500",
    fontSize: ms(20),
    lineHeight: ms(20) * 1.1,
    textAlign: "center",
    color: "#FF4444",
  },

  // READY TO PICKUP BUTTON (for preparing status)
  readyButton: {
    position: "absolute",
    left: s(20),
    top: vs(875),
    width: s(400),
    height: vs(50),
    justifyContent: "center",
    alignItems: "center",
  },

  readyButtonBackground: {
    position: "absolute",
    width: s(400),
    height: vs(50),
    backgroundColor: "#3BB77E",
    borderRadius: s(20),
    shadowColor: "rgba(0, 0, 0, 0.25)",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: s(4),
    elevation: 4,
  },

  readyButtonText: {
    fontFamily: "Clash Grotesk Variable",
    fontWeight: "500",
    fontSize: ms(20),
    lineHeight: ms(20) * 1.1,
    textAlign: "center",
    color: "#FFFFFF",
  },

  // ORDER PICKUP BUTTON (for ready status)
  pickupButton: {
    position: "absolute",
    left: s(20),
    top: vs(875),
    width: s(400),
    height: vs(50),
    justifyContent: "center",
    alignItems: "center",
  },

  pickupButtonBackground: {
    position: "absolute",
    width: s(400),
    height: vs(50),
    backgroundColor: "#3BB77E",
    borderRadius: s(20),
    shadowColor: "rgba(0, 0, 0, 0.25)",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: s(4),
    elevation: 4,
  },

  pickupButtonText: {
    fontFamily: "Clash Grotesk Variable",
    fontWeight: "500",
    fontSize: ms(20),
    lineHeight: ms(20) * 1.1,
    textAlign: "center",
    color: "#FFFFFF",
  },

  // COMPLETED/PICKUP BUTTON (for picked_up status) - Light Green
  completedButton: {
    position: "absolute",
    left: s(20),
    top: vs(875),
    width: s(400),
    height: vs(50),
    justifyContent: "center",
    alignItems: "center",
  },

  completedButtonBackground: {
    position: "absolute",
    width: s(400),
    height: vs(50),
    backgroundColor: "#DCFCE7", // Light green background
    borderRadius: s(20),
    shadowColor: "rgba(0, 0, 0, 0.25)",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: s(4),
    elevation: 4,
  },

  completedButtonText: {
    fontFamily: "Clash Grotesk Variable",
    fontWeight: "500",
    fontSize: ms(20),
    lineHeight: ms(20) * 1.1,
    textAlign: "center",
    color: "#3BB77E", // Green text
  },

  // CANCELLED CONTAINER (for cancelled status)
  cancelledContainer: {
    position: "absolute",
    left: s(20),
    top: vs(875),
    width: s(400),
  },

  // CANCELLED BUTTON (for cancelled status) - Light Red
  cancelledButton: {
    width: s(400),
    height: vs(50),
    justifyContent: "center",
    alignItems: "center",
  },

  cancelledButtonBackground: {
    position: "absolute",
    width: s(400),
    height: vs(50),
    backgroundColor: "#FECACA", // Light red background
    borderRadius: s(20),
    shadowColor: "rgba(0, 0, 0, 0.25)",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: s(4),
    elevation: 4,
  },

  cancelledButtonText: {
    fontFamily: "Clash Grotesk Variable",
    fontWeight: "500",
    fontSize: ms(20),
    lineHeight: ms(20) * 1.1,
    textAlign: "center",
    color: "#DC2626", // Red text
  },

  // Cancellation Details Card
  cancelReasonCard: {
    marginTop: vs(20),
    backgroundColor: "#FFF5F5",
    padding: s(15),
    borderRadius: s(10),
    borderWidth: 1,
    borderColor: "#FECACA",
  },

  cancelReasonLabel: {
    fontFamily: "Clash Grotesk Variable",
    fontWeight: "600",
    fontSize: ms(14),
    color: "#DC2626",
    marginBottom: vs(5),
  },

  cancelReasonText: {
    fontFamily: "Clash Grotesk Variable",
    fontWeight: "500",
    fontSize: ms(14),
    color: "#1E1E1E",
    lineHeight: ms(14) * 1.5,
  },

  cancelledByText: {
    fontFamily: "Clash Grotesk Variable",
    fontWeight: "500",
    fontSize: ms(12),
    color: "rgba(30, 30, 30, 0.6)",
    marginTop: vs(5),
  },

  // Loading State
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: vs(100),
  },

  loadingText: {
    marginTop: vs(15),
    fontFamily: "Clash Grotesk Variable",
    fontWeight: "500",
    fontSize: ms(16),
    color: "rgba(30, 30, 30, 0.5)",
  },

  emptyText: {
    fontFamily: "Clash Grotesk Variable",
    fontWeight: "600",
    fontSize: ms(18),
    color: "rgba(30, 30, 30, 0.5)",
  },

  // Bottom Padding - Ensure all content is visible
  bottomPadding: {
    height: vs(1050), // Adjusted to include all button variants
  },
});
