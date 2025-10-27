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
 * STORE OWNER - PREPARING ORDER DETAILS
 *
 * Figma File: 8I1Nr3vQZllDDknSevstvH
 * Node: 1057-4949 (Store Order/ Preparing)
 * Baseline: 440x1440
 *
 * Screen #3 - Store Order Management
 * Shows full order details for orders being prepared
 * Navigation: Orders (Preparing) → Click order → This screen
 *
 * Action:
 * - "Ready to Pickup" button: Changes status to "ready" (out for pickup)
 * - This screen is shown AFTER store owner accepts a pending order
 *
 * Design Notes:
 * - Layout identical to order-details-pending.tsx
 * - Only difference: Single "Ready to Pickup" button instead of Accept/Reject buttons
 * - Button color: Primary green (#3BB77E)
 * - Button width: 360px (Figma: locationRelativeToParent x:20, dimensions width:360)
 * - Button height: 40px
 */

export default function OrderDetailsPreparingScreen() {
  const params = useLocalSearchParams();
  const orderId = params.id as string;

  // Mock data for visualization (will be replaced with Firebase data later)
  const mockOrderDetails = {
    id: 'order-3',
    orderNumber: '#12347',
    customerName: 'Dotarot Maynard',
    customerPhone: '+6398 032 4213',
    items: [
      { id: '1', name: 'Cookie', quantity: 1, price: 150.00 },
      { id: '2', name: 'Oreo', quantity: 2, price: 50.00 },
      { id: '3', name: 'Nestle', quantity: 1, price: 25.00 },
      { id: '4', name: 'Honey', quantity: 1, price: 200.00 },
      { id: '5', name: 'Milo Drink', quantity: 1, price: 64.00 },
    ],
    subtotal: 539.00,
    tax: 2.43,
    total: 589.00,
    paymentMethod: 'paymaya',
    status: 'preparing',
    timeAgo: '1 min ago'
  };

  // Ready for Pickup button handler
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

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#F4F6F6" />

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* BACK BUTTON - Figma: 1057:4950, x:20, y:79, width:30, height:30 */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <View style={styles.backButtonCircle} />
          <Image
            source={require("../../../../src/assets/images/store-order-details-preparing/chevron-left.png")}
            style={styles.backButtonIcon}
            resizeMode="contain"
          />
        </TouchableOpacity>

        {/* TITLE - Figma: 1057:4952, x:173, y:83, width:94, height:22 */}
        <Text style={styles.title}>Preparing</Text>

        {/* ORDER INFO CARD - Figma: 1057:4964, x:20, y:195, width:400, height:260 */}
        <View style={styles.orderInfoCard}>
          {/* Card Background - Figma: 1057:4965 */}
          <View style={styles.orderInfoBackground} />

          {/* Logo/Icon - Figma: 1057:4967, x:40, y:215 (relative to card: x:20, y:20) */}
          <View style={styles.logoContainer}>
            <View style={styles.logoBackground} />
            <Image
              source={require("../../../../src/assets/images/store-order-details-preparing/cheque-icon.png")}
              style={styles.logoIcon}
              resizeMode="contain"
            />
          </View>

          {/* Order No Label - Figma: 1057:4970, x:95, y:217 (relative: x:75, y:22) */}
          <Text style={styles.orderNoLabel}>Order No</Text>

          {/* Time Ago - Figma: 1057:4971, x:343, y:217 (relative: x:323, y:22) */}
          <Text style={styles.timeAgo}>{mockOrderDetails.timeAgo}</Text>

          {/* Order Number - Figma: 1057:4972, x:95, y:239 (relative: x:75, y:44) */}
          <Text style={styles.orderNumber}>{mockOrderDetails.orderNumber}</Text>

          {/* Divider Line - Figma: 1057:4966, y:275 (relative: y:80) */}
          <View style={styles.dividerLine1} />

          {/* Customer Name - Figma: 1057:4973, x:61, y:293 (relative: x:41, y:98) */}
          <View style={styles.customerNameContainer}>
            <Image
              source={require("../../../../src/assets/images/store-order-details-preparing/person-icon.png")}
              style={styles.personIcon}
              resizeMode="contain"
            />
            <View style={styles.verticalDivider1} />
            <Text style={styles.customerName}>{mockOrderDetails.customerName}</Text>
          </View>

          {/* Customer Phone - Figma: 1057:4985, x:236, y:290 (relative: x:216, y:95) */}
          <View style={styles.customerPhoneContainer}>
            <Image
              source={require("../../../../src/assets/images/store-order-details-preparing/phone-icon.png")}
              style={styles.phoneIcon}
              resizeMode="contain"
            />
            <View style={styles.verticalDivider2} />
            <Text style={styles.customerPhone}>{mockOrderDetails.customerPhone}</Text>
          </View>

          {/* Total Price - Figma: 1057:4977, x:61, y:345 (relative: x:41, y:150) */}
          <View style={styles.totalPriceContainer}>
            <Image
              source={require("../../../../src/assets/images/store-order-details-preparing/coin-wallet-icon.png")}
              style={styles.coinWalletIcon}
              resizeMode="contain"
            />
            <View style={styles.verticalDivider3} />
            <Text style={styles.totalPrice}>₱{mockOrderDetails.total.toFixed(2)}</Text>
          </View>

          {/* Payment Method - Figma: 1057:4981, x:236, y:345 (relative: x:216, y:150) */}
          <View style={styles.paymentMethodContainer}>
            <Image
              source={require("../../../../src/assets/images/store-order-details-preparing/wallet-icon.png")}
              style={styles.walletIcon}
              resizeMode="contain"
            />
            <View style={styles.verticalDivider4} />
            <Text style={styles.paymentMethod}>
              {mockOrderDetails.paymentMethod.toUpperCase()}
            </Text>
          </View>

          {/* READY TO PICKUP BUTTON - Figma: 1057:4989, x:20, y:200 (relative to card: x:20, y:200) */}
          <TouchableOpacity
            style={styles.readyButton}
            onPress={handleReadyForPickup}
            activeOpacity={0.8}
          >
            <View style={styles.readyButtonBackground} />
            <Text style={styles.readyButtonText}>Ready to Pickup</Text>
          </TouchableOpacity>
        </View>

        {/* Bottom Padding */}
        <View style={styles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  // CONTAINER - Figma: 1057:4949, 440x1440, background:#F4F6F6
  container: {
    flex: 1,
    backgroundColor: "#F4F6F6", // Figma: fill_9E5STR
  },

  scrollView: {
    flex: 1,
  },

  scrollContent: {
    paddingBottom: vs(40),
  },

  // BACK BUTTON - Figma: 1057:4950, x:20, y:79, width:30, height:30
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

  // Back Button Icon - Figma: 1057:4951, 15x15
  backButtonIcon: {
    position: "absolute",
    left: s(7.5),
    top: s(7.5),
    width: s(15),
    height: s(15),
  },

  // TITLE - Figma: 1057:4952, x:173, y:83, width:94, height:22
  title: {
    position: "absolute",
    left: s(173),
    top: vs(83),
    width: s(94),
    height: vs(22),
    fontFamily: "Clash Grotesk Variable",
    fontWeight: "600",
    fontSize: ms(20),
    lineHeight: ms(20) * 1.1,
    textAlign: "center",
    color: "#1E1E1E", // Figma: fill_L6094X
  },

  // ORDER INFO CARD - Figma: 1057:4964, x:20, y:195, width:400, height:260
  orderInfoCard: {
    position: "absolute",
    left: s(20),
    top: vs(195),
    width: s(400),
    height: vs(260),
  },

  // Order Info Background - Figma: 1057:4965
  orderInfoBackground: {
    position: "absolute",
    width: s(400),
    height: vs(260),
    backgroundColor: "#FFFFFF",
    borderRadius: s(16),
    shadowColor: "rgba(0, 0, 0, 0.25)",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: s(5),
    elevation: 5,
  },

  // Logo Container - Figma: 1057:4967, x:40, y:215 (relative to card: x:20, y:20)
  logoContainer: {
    position: "absolute",
    left: s(20),
    top: vs(20),
    width: s(40),
    height: s(40),
  },

  // Logo Background - Figma: 1057:4968
  logoBackground: {
    position: "absolute",
    width: s(40),
    height: s(40),
    backgroundColor: "#02545F", // Figma: fill_8JT50F
    borderRadius: s(5),
  },

  // Logo Icon - Figma: 1057:4969, 25x25
  logoIcon: {
    position: "absolute",
    left: s(7),
    top: s(8),
    width: s(25),
    height: s(25),
  },

  // Order No Label - Figma: 1057:4970, x:95, y:217 (relative: x:75, y:22)
  orderNoLabel: {
    position: "absolute",
    left: s(75),
    top: vs(22),
    fontFamily: "Clash Grotesk Variable",
    fontWeight: "500",
    fontSize: ms(14),
    lineHeight: ms(14) * 1.23,
    color: "rgba(30, 30, 30, 0.5)", // Figma: fill_GBOGXR
  },

  // Time Ago - Figma: 1057:4971, x:343, y:217 (relative: x:323, y:22)
  timeAgo: {
    position: "absolute",
    left: s(323),
    top: vs(22),
    fontFamily: "Clash Grotesk Variable",
    fontWeight: "500",
    fontSize: ms(14),
    lineHeight: ms(14) * 1.23,
    textAlign: "right",
    color: "rgba(30, 30, 30, 0.5)", // Figma: fill_GBOGXR
  },

  // Order Number - Figma: 1057:4972, x:95, y:239 (relative: x:75, y:44)
  orderNumber: {
    position: "absolute",
    left: s(75),
    top: vs(44),
    fontFamily: "Clash Grotesk Variable",
    fontWeight: "500",
    fontSize: ms(12),
    lineHeight: ms(12) * 1.23,
    color: "#000000", // Figma: fill_FJ9MID
  },

  // Divider Line 1 - Figma: 1057:4966, y:275 (relative: y:80)
  dividerLine1: {
    position: "absolute",
    left: s(10),
    top: vs(80),
    width: s(380),
    height: 2,
    backgroundColor: "#02545F", // Figma: stroke_INU08C
  },

  // Customer Name Container - Figma: 1057:4973, x:61, y:293 (relative: x:41, y:98)
  customerNameContainer: {
    position: "absolute",
    left: s(41),
    top: vs(98),
    flexDirection: "row",
    alignItems: "center",
  },

  // Person Icon - Figma: 1057:4975, 30x30
  personIcon: {
    width: s(30),
    height: s(30),
  },

  // Vertical Divider 1 - Figma: 1057:4974
  verticalDivider1: {
    width: 2,
    height: vs(30),
    backgroundColor: "#02545F",
    marginLeft: s(20),
  },

  // Customer Name - Figma: 1057:4976
  customerName: {
    marginLeft: s(10),
    fontFamily: "Clash Grotesk Variable",
    fontWeight: "500",
    fontSize: ms(14),
    lineHeight: ms(14) * 1.23,
    color: "#000000", // Figma: fill_FJ9MID
  },

  // Customer Phone Container - Figma: 1057:4985, x:236, y:290 (relative: x:216, y:95)
  customerPhoneContainer: {
    position: "absolute",
    left: s(216),
    top: vs(95),
    flexDirection: "row",
    alignItems: "center",
  },

  // Phone Icon - Figma: 1057:4988, 30x30
  phoneIcon: {
    width: s(30),
    height: s(30),
  },

  // Vertical Divider 2 - Figma: 1057:4986
  verticalDivider2: {
    width: 2,
    height: vs(40),
    backgroundColor: "#02545F",
    marginLeft: s(20),
  },

  // Customer Phone - Figma: 1057:4987
  customerPhone: {
    marginLeft: s(10),
    fontFamily: "Clash Grotesk Variable",
    fontWeight: "500",
    fontSize: ms(16),
    lineHeight: ms(16) * 1.23,
    color: "#1E1E1E", // Figma: fill_L6094X
  },

  // Total Price Container - Figma: 1057:4977, x:61, y:345 (relative: x:41, y:150)
  totalPriceContainer: {
    position: "absolute",
    left: s(41),
    top: vs(150),
    flexDirection: "row",
    alignItems: "center",
  },

  // Coin Wallet Icon - Figma: 1057:4979, 30x30
  coinWalletIcon: {
    width: s(30),
    height: s(30),
  },

  // Vertical Divider 3 - Figma: 1057:4978
  verticalDivider3: {
    width: 2,
    height: vs(20),
    backgroundColor: "#02545F",
    marginLeft: s(20),
  },

  // Total Price - Figma: 1057:4980
  totalPrice: {
    marginLeft: s(10),
    fontFamily: "Clash Grotesk Variable",
    fontWeight: "500",
    fontSize: ms(16),
    lineHeight: ms(16) * 1.23,
    color: "#1E1E1E", // Figma: fill_L6094X
  },

  // Payment Method Container - Figma: 1057:4981, x:236, y:345 (relative: x:216, y:150)
  paymentMethodContainer: {
    position: "absolute",
    left: s(216),
    top: vs(150),
    flexDirection: "row",
    alignItems: "center",
  },

  // Wallet Icon - Figma: 1057:4983, 30x30
  walletIcon: {
    width: s(30),
    height: s(30),
  },

  // Vertical Divider 4 - Figma: 1057:4982
  verticalDivider4: {
    width: 2,
    height: vs(20),
    backgroundColor: "#02545F",
    marginLeft: s(20),
  },

  // Payment Method - Figma: 1057:4984
  paymentMethod: {
    marginLeft: s(10),
    fontFamily: "Clash Grotesk Variable",
    fontWeight: "500",
    fontSize: ms(16),
    lineHeight: ms(16) * 1.23,
    color: "#1E1E1E", // Figma: fill_L6094X
  },

  // READY TO PICKUP BUTTON - Figma: 1057:4989, x:20, y:200 (relative: x:20, y:200, width:360, height:40)
  readyButton: {
    position: "absolute",
    left: s(20),
    top: vs(200),
    width: s(360),
    height: vs(40),
    justifyContent: "center",
    alignItems: "center",
  },

  // Ready Button Background - Figma: fill_PULMF7, borderRadius:10px
  readyButtonBackground: {
    position: "absolute",
    width: s(360),
    height: vs(40),
    backgroundColor: "#3BB77E", // Figma: fill_PULMF7 (primary green)
    borderRadius: s(10),
    shadowColor: "rgba(0, 0, 0, 0.25)",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: s(4),
    elevation: 4,
  },

  // Ready Button Text - Figma: 1057:4990
  readyButtonText: {
    fontFamily: "Clash Grotesk Variable",
    fontWeight: "500",
    fontSize: ms(18),
    lineHeight: ms(18) * 1.22,
    textAlign: "center",
    color: "#FFFFFF", // Figma: fill_210227
  },

  // Bottom Padding - Ensure all content is visible
  bottomPadding: {
    height: vs(500), // Adjusted for single card layout
  },
});
