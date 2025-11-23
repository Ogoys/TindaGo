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
import { getProductImageSource } from "../../../../src/lib/helpers/imageHelper";

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

    // Fixed button position based on fixed card height
    const buttonTop = 365 + 520 + 30; // Card top (365) + card height (520) + spacing (30) = 915

    switch (order.status) {
      case 'pending':
        return (
          <>
            {/* ACCEPT BUTTON */}
            <TouchableOpacity
              style={[styles.acceptButton, { top: vs(buttonTop) }]}
              onPress={handleAcceptOrder}
              activeOpacity={0.8}
            >
              <View style={styles.acceptButtonBackground} />
              <Text style={styles.acceptButtonText}>Accept</Text>
            </TouchableOpacity>

            {/* REJECT BUTTON */}
            <TouchableOpacity
              style={[styles.rejectButton, { top: vs(buttonTop + 70) }]}
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
            style={[styles.readyButton, { top: vs(buttonTop) }]}
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
            style={[styles.pickupButton, { top: vs(buttonTop) }]}
            onPress={handleOrderPickup}
            activeOpacity={0.8}
          >
            <View style={styles.pickupButtonBackground} />
            <Text style={styles.pickupButtonText}>Orders Complete</Text>
          </TouchableOpacity>
        );

      case 'picked_up':
      case 'completed':
        // No button needed - order is completed
        return null;

      case 'cancelled':
        return (
          <View style={[styles.cancelledContainer, { top: vs(buttonTop) }]}>
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
              {order.items.map((item, index) => (
                <View key={item.productId} style={styles.modernItemRow}>
                  {/* Item Info Section */}
                  <View style={styles.itemInfoSection}>
                    {/* Product Image */}
                    <View style={styles.productIconContainer}>
                      {(() => {
                        const imageSource = getProductImageSource({
                          productImageUrl: (item as any).productImageUrl,
                          productImage: item.productImage
                        }, 'small');

                        return imageSource ? (
                          <Image
                            source={imageSource}
                            style={styles.productImage}
                            resizeMode="cover"
                          />
                        ) : (
                          <View style={styles.productIcon}>
                            <Text style={styles.productIconText}>📦</Text>
                          </View>
                        );
                      })()}
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
              ))}
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

  // ========================================
  // MODERN ORDER ITEMS CARD - Professional Design with Scrolling
  // ========================================

  // ORDER LIST CARD - Fixed height with scrollable items
  orderListCard: {
    position: "absolute",
    left: s(20),
    top: vs(365),
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
    height: vs(250), // Max height for scrolling (fits ~3.5 items)
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
  },

  productIcon: {
    width: s(48),
    height: s(48),
    borderRadius: s(12),
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
  },

  productImage: {
    width: s(48),
    height: s(48),
    borderRadius: s(12),
  },

  productIconText: {
    fontSize: ms(24),
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

  // ACCEPT BUTTON - Dynamic position based on card height
  acceptButton: {
    position: "absolute",
    left: s(20),
    top: vs(385), // Will be adjusted dynamically in render
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

  // REJECT BUTTON - Dynamic position
  rejectButton: {
    position: "absolute",
    left: s(20),
    top: vs(385), // Will be adjusted dynamically in render
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
    top: vs(385), // Will be adjusted dynamically in render
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
    top: vs(385), // Will be adjusted dynamically in render
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
    top: vs(385), // Will be adjusted dynamically in render
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
    top: vs(385), // Will be adjusted dynamically in render
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
