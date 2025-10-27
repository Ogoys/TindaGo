import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  StatusBar,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
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

type OrderStatus = 'pending' | 'preparing' | 'ready' | 'picked_up' | 'completed' | 'cancelled';

export default function OrderDetailsScreen() {
  const params = useLocalSearchParams();
  const orderId = params.id as string;

  // Mock data for visualization (will be replaced with Firebase data later)
  // TODO: Fetch order data from Firebase using orderId
  const mockOrderDetails = {
    id: orderId || 'order-1',
    orderNumber: '#12345',
    customerName: 'Dotarot Maynard',
    customerPhone: '+6398 032 4213',
    customerAddress: 'Jacinto St. 32-D',
    orderDate: '2025-10-27T10:30:00Z',
    pickupTime: '2025-10-27T14:00:00Z',
    items: [
      {
        id: 'item-1',
        name: 'Order Number 1',
        quantity: 1,
        price: 23.24,
      },
      {
        id: 'item-2',
        name: 'Order Drink Number 2',
        quantity: 1,
        price: 321.00,
      },
      {
        id: 'item-3',
        name: 'Order Food Number 3',
        quantity: 2,
        price: 894.98,
      },
      {
        id: 'item-4',
        name: 'Order Number 1',
        quantity: 2,
        price: 123.30,
      },
      {
        id: 'item-5',
        name: 'Order Drink Number 2',
        quantity: 2,
        price: 23.43,
      },
    ],
    subtotal: 539.00,
    tax: 2.43,
    total: 589.00,
    paymentMethod: 'paymaya',
    status: (params.status as OrderStatus) || 'pending', // Status determines which buttons to show
    timeAgo: '1 min ago',
    cancellationReason: 'Customer requested cancellation', // Only shown if status is cancelled
  };

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
  const handleAcceptOrder = () => {
    Alert.alert(
      "Accept Order?",
      `Order ${mockOrderDetails.orderNumber} will be marked as preparing. Customer will be notified.`,
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Accept",
          onPress: () => {
            // TODO: Update order status to "preparing" in Firebase
            console.log("Order accepted:", orderId);
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
          }
        }
      ]
    );
  };

  // PENDING STATUS: Reject order handler
  const handleRejectOrder = () => {
    Alert.alert(
      "Reject Order?",
      "Are you sure you want to reject this order? This action cannot be undone.",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Reject",
          style: "destructive",
          onPress: () => {
            // TODO: Update order status to "cancelled" in Firebase
            console.log("Order rejected:", orderId);
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
          }
        }
      ]
    );
  };

  // PREPARING STATUS: Mark as ready for pickup
  const handleReadyForPickup = () => {
    Alert.alert(
      "Mark as Ready?",
      `Order ${mockOrderDetails.orderNumber} will be marked as ready for pickup. Customer will be notified.`,
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Confirm",
          onPress: () => {
            // TODO: Update order status to "ready" in Firebase
            console.log("Order marked as ready for pickup:", orderId);
            Alert.alert(
              "Success",
              "Order is now ready for pickup. Customer has been notified.",
              [{ text: "OK", onPress: () => router.back() }]
            );
          }
        }
      ]
    );
  };

  // READY STATUS: Mark as picked up/completed
  const handleOrderPickup = () => {
    Alert.alert(
      "Confirm Order Pickup?",
      `Has the customer picked up order ${mockOrderDetails.orderNumber}?`,
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Confirm Pickup",
          onPress: () => {
            // TODO: Update order status to "picked_up" or "completed" in Firebase
            console.log("Order marked as picked up:", orderId);
            Alert.alert(
              "Order Completed",
              "The order has been marked as completed.",
              [{ text: "OK", onPress: () => router.back() }]
            );
          }
        }
      ]
    );
  };

  // Render action buttons based on order status
  const renderActionButtons = () => {
    switch (mockOrderDetails.status) {
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
          <View style={styles.completedBadge}>
            <Text style={styles.completedText}>✓ Order Completed</Text>
          </View>
        );

      case 'cancelled':
        return (
          <View style={styles.cancelledContainer}>
            <Text style={styles.cancelledLabel}>Cancellation Reason:</Text>
            <Text style={styles.cancelledReason}>{mockOrderDetails.cancellationReason}</Text>
          </View>
        );

      default:
        return null;
    }
  };

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

        {/* ORDER INFO CARD - Figma: 1057:4880, x:20, y:145, width:400, height:200 */}
        <View style={styles.orderInfoCard}>
          {/* Card Background - Figma: 1057:4881 */}
          <View style={styles.orderInfoBackground} />

          {/* Logo/Icon - Figma: 1057:4883, x:40, y:165, width:40, height:40 */}
          <View style={styles.logoContainer}>
            <View style={styles.logoBackground} />
            <Image
              source={require("../../../../src/assets/images/store-order-details-pending/cheque-icon.png")}
              style={styles.logoIcon}
              resizeMode="contain"
            />
          </View>

          {/* Order No Label - Figma: 1057:4886, x:95, y:167 */}
          <Text style={styles.orderNoLabel}>Order No</Text>

          {/* Time Ago - Figma: 1057:4887, x:343, y:167 */}
          <Text style={styles.timeAgo}>{mockOrderDetails.timeAgo}</Text>

          {/* Order Number - Figma: 1057:4888, x:95, y:189 */}
          <Text style={styles.orderNumber}>{mockOrderDetails.orderNumber}</Text>

          {/* Divider Line - Figma: 1057:4882, y:225 */}
          <View style={styles.dividerLine1} />

          {/* Customer Name - Figma: 1057:4889, x:61, y:243 */}
          <View style={styles.customerNameContainer}>
            <Image
              source={require("../../../../src/assets/images/store-order-details-pending/person-icon.png")}
              style={styles.personIcon}
              resizeMode="contain"
            />
            <View style={styles.verticalDivider1} />
            <Text style={styles.customerName}>{mockOrderDetails.customerName}</Text>
          </View>

          {/* Customer Phone - Figma: 1057:4901, x:236, y:240 */}
          <View style={styles.customerPhoneContainer}>
            <Image
              source={require("../../../../src/assets/images/store-order-details-pending/phone-icon.png")}
              style={styles.phoneIcon}
              resizeMode="contain"
            />
            <View style={styles.verticalDivider2} />
            <Text style={styles.customerPhone}>{mockOrderDetails.customerPhone}</Text>
          </View>

          {/* Total Price - Figma: 1057:4893, x:61, y:295 */}
          <View style={styles.totalPriceContainer}>
            <Image
              source={require("../../../../src/assets/images/store-order-details-pending/coin-wallet-icon.png")}
              style={styles.coinWalletIcon}
              resizeMode="contain"
            />
            <View style={styles.verticalDivider3} />
            <Text style={styles.totalPrice}>₱{mockOrderDetails.total.toFixed(2)}</Text>
          </View>

          {/* Payment Method - Figma: 1057:4897, x:236, y:295 */}
          <View style={styles.paymentMethodContainer}>
            <Image
              source={require("../../../../src/assets/images/store-order-details-pending/wallet-icon.png")}
              style={styles.walletIcon}
              resizeMode="contain"
            />
            <View style={styles.verticalDivider4} />
            <Text style={styles.paymentMethod}>
              {mockOrderDetails.paymentMethod.toUpperCase()}
            </Text>
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
          {mockOrderDetails.items.map((item, index) => (
            <View
              key={item.id}
              style={[
                styles.orderItemRow,
                { top: vs(60 + (index * 40)) } // Dynamic positioning
              ]}
            >
              <Text style={styles.itemName}>{item.name}</Text>
              <Text style={styles.itemQnt}>{item.quantity}</Text>
              <Text style={styles.itemAmount}>₱{item.price.toFixed(2)}</Text>
            </View>
          ))}

          {/* Divider before tax - Figma: 1057:4929, y:705 */}
          <View style={styles.dividerLine3} />
        </View>

        {/* TAX ROW - Figma: 1057:4930, x:40, y:725 */}
        <View style={styles.taxRow}>
          <Text style={styles.taxLabel}>Tax(10%)</Text>
          <Text style={styles.taxValue}>₱{mockOrderDetails.tax.toFixed(2)}</Text>
        </View>

        {/* Divider before subtotal - Figma: 1057:4933, y:765 */}
        <View style={styles.dividerLine4} />

        {/* SUBTOTAL ROW - Figma: 1057:4934, x:40, y:785 */}
        <View style={styles.subtotalRow}>
          <Text style={styles.subtotalLabel}>Sub Total</Text>
          <Text style={styles.subtotalValue}>₱{mockOrderDetails.subtotal.toFixed(2)}</Text>
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

  // ORDER INFO CARD - Figma: 1057:4880, x:20, y:145, width:400, height:200
  orderInfoCard: {
    position: "absolute",
    left: s(20),
    top: vs(145),
    width: s(400),
    height: vs(200),
  },

  // Order Info Background - Figma: 1057:4881
  orderInfoBackground: {
    position: "absolute",
    width: s(400),
    height: vs(200),
    backgroundColor: "#FFFFFF",
    borderRadius: s(16),
    shadowColor: "rgba(0, 0, 0, 0.25)",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: s(5),
    elevation: 5,
  },

  // Logo Container - Figma: 1057:4883, x:40, y:165 (relative to card: x:20, y:20)
  logoContainer: {
    position: "absolute",
    left: s(20),
    top: vs(20),
    width: s(40),
    height: s(40),
  },

  // Logo Background - Figma: 1057:4884
  logoBackground: {
    position: "absolute",
    width: s(40),
    height: s(40),
    backgroundColor: "#02545F", // Figma: fill_4E6249
    borderRadius: s(5),
  },

  // Logo Icon - Figma: 1057:4885, 25x25
  logoIcon: {
    position: "absolute",
    left: s(7),
    top: s(8),
    width: s(25),
    height: s(25),
  },

  // Order No Label - Figma: 1057:4886, x:95, y:167 (relative: x:75, y:22)
  orderNoLabel: {
    position: "absolute",
    left: s(75),
    top: vs(22),
    fontFamily: "Clash Grotesk Variable",
    fontWeight: "500",
    fontSize: ms(14),
    lineHeight: ms(14) * 1.23,
    color: "rgba(30, 30, 30, 0.5)", // Figma: fill_7254A2
  },

  // Time Ago - Figma: 1057:4887, x:343, y:167 (relative: x:323, y:22)
  timeAgo: {
    position: "absolute",
    left: s(323),
    top: vs(22),
    fontFamily: "Clash Grotesk Variable",
    fontWeight: "500",
    fontSize: ms(14),
    lineHeight: ms(14) * 1.23,
    textAlign: "right",
    color: "rgba(30, 30, 30, 0.5)", // Figma: fill_7254A2
  },

  // Order Number - Figma: 1057:4888, x:95, y:189 (relative: x:75, y:44)
  orderNumber: {
    position: "absolute",
    left: s(75),
    top: vs(44),
    fontFamily: "Clash Grotesk Variable",
    fontWeight: "500",
    fontSize: ms(12),
    lineHeight: ms(12) * 1.23,
    color: "#000000", // Figma: fill_6DUZDG
  },

  // Divider Line 1 - Figma: 1057:4882, y:225 (relative: y:80)
  dividerLine1: {
    position: "absolute",
    left: s(10),
    top: vs(80),
    width: s(380),
    height: 2,
    backgroundColor: "#02545F", // Figma: stroke_QIPMYT
  },

  // Customer Name Container - Figma: 1057:4889, x:61, y:243 (relative: x:41, y:98)
  customerNameContainer: {
    position: "absolute",
    left: s(41),
    top: vs(98),
    flexDirection: "row",
    alignItems: "center",
  },

  // Person Icon - Figma: 1057:4891, 30x30
  personIcon: {
    width: s(30),
    height: s(30),
  },

  // Vertical Divider 1 - Figma: 1057:4890
  verticalDivider1: {
    width: 2,
    height: vs(30),
    backgroundColor: "#02545F",
    marginLeft: s(20),
  },

  // Customer Name - Figma: 1057:4892
  customerName: {
    marginLeft: s(10),
    fontFamily: "Clash Grotesk Variable",
    fontWeight: "500",
    fontSize: ms(14),
    lineHeight: ms(14) * 1.23,
    color: "#000000", // Figma: fill_6DUZDG
  },

  // Customer Phone Container - Figma: 1057:4901, x:236, y:240 (relative: x:216, y:95)
  customerPhoneContainer: {
    position: "absolute",
    left: s(216),
    top: vs(95),
    flexDirection: "row",
    alignItems: "center",
  },

  // Phone Icon - Figma: 1057:4904, 30x30
  phoneIcon: {
    width: s(30),
    height: s(30),
  },

  // Vertical Divider 2 - Figma: 1057:4902
  verticalDivider2: {
    width: 2,
    height: vs(40),
    backgroundColor: "#02545F",
    marginLeft: s(20),
  },

  // Customer Phone - Figma: 1057:4903
  customerPhone: {
    marginLeft: s(10),
    fontFamily: "Clash Grotesk Variable",
    fontWeight: "500",
    fontSize: ms(16),
    lineHeight: ms(16) * 1.23,
    color: "#1E1E1E", // Figma: fill_3TK9OA
  },

  // Total Price Container - Figma: 1057:4893, x:61, y:295 (relative: x:41, y:150)
  totalPriceContainer: {
    position: "absolute",
    left: s(41),
    top: vs(150),
    flexDirection: "row",
    alignItems: "center",
  },

  // Coin Wallet Icon - Figma: 1057:4895, 30x30
  coinWalletIcon: {
    width: s(30),
    height: s(30),
  },

  // Vertical Divider 3 - Figma: 1057:4894
  verticalDivider3: {
    width: 2,
    height: vs(20),
    backgroundColor: "#02545F",
    marginLeft: s(20),
  },

  // Total Price - Figma: 1057:4896
  totalPrice: {
    marginLeft: s(10),
    fontFamily: "Clash Grotesk Variable",
    fontWeight: "500",
    fontSize: ms(16),
    lineHeight: ms(16) * 1.23,
    color: "#1E1E1E", // Figma: fill_3TK9OA
  },

  // Payment Method Container - Figma: 1057:4897, x:236, y:295 (relative: x:216, y:150)
  paymentMethodContainer: {
    position: "absolute",
    left: s(216),
    top: vs(150),
    flexDirection: "row",
    alignItems: "center",
  },

  // Wallet Icon - Figma: 1057:4899, 30x30
  walletIcon: {
    width: s(30),
    height: s(30),
  },

  // Vertical Divider 4 - Figma: 1057:4898
  verticalDivider4: {
    width: 2,
    height: vs(20),
    backgroundColor: "#02545F",
    marginLeft: s(20),
  },

  // Payment Method - Figma: 1057:4900
  paymentMethod: {
    marginLeft: s(10),
    fontFamily: "Clash Grotesk Variable",
    fontWeight: "500",
    fontSize: ms(16),
    lineHeight: ms(16) * 1.23,
    color: "#1E1E1E", // Figma: fill_3TK9OA
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

  // COMPLETED BADGE (for completed/picked_up status)
  completedBadge: {
    position: "absolute",
    left: s(20),
    top: vs(875),
    width: s(400),
    height: vs(50),
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#E8F5E9",
    borderRadius: s(20),
    borderWidth: 2,
    borderColor: "#4CAF50",
  },

  completedText: {
    fontFamily: "Clash Grotesk Variable",
    fontWeight: "600",
    fontSize: ms(20),
    lineHeight: ms(20) * 1.1,
    textAlign: "center",
    color: "#4CAF50",
  },

  // CANCELLED CONTAINER (for cancelled status)
  cancelledContainer: {
    position: "absolute",
    left: s(20),
    top: vs(875),
    width: s(400),
    backgroundColor: "#FFEBEE",
    borderRadius: s(20),
    borderWidth: 2,
    borderColor: "#FF4444",
    padding: s(20),
  },

  cancelledLabel: {
    fontFamily: "Clash Grotesk Variable",
    fontWeight: "600",
    fontSize: ms(16),
    lineHeight: ms(16) * 1.23,
    color: "#FF4444",
    marginBottom: vs(8),
  },

  cancelledReason: {
    fontFamily: "Clash Grotesk Variable",
    fontWeight: "500",
    fontSize: ms(14),
    lineHeight: ms(14) * 1.23,
    color: "#1E1E1E",
  },

  // Bottom Padding - Ensure all content is visible
  bottomPadding: {
    height: vs(1050), // Adjusted to include all button variants
  },
});
