/**
 * CUSTOMER ORDER DETAILS SCREEN (From Order History - Profile Flow)
 *
 * Figma File: 8I1Nr3vQZllDDknSevstvH
 * Node: 903-5770 (Order Details - History)
 * Baseline: 440x956
 *
 * Displays detailed information for a selected order from Order History.
 * This is accessed from the profile -> order history flow.
 * Different from the main order-details.tsx which is for active orders.
 */

import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { s, vs, ms } from "../../../../src/constants/responsive";
import { Colors } from "../../../../src/constants/Colors";
import { Fonts } from "../../../../src/constants/Fonts";

export default function OrderDetailsHistoryScreen() {
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#F4F6F6" />

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* BACK BUTTON - Figma: 903:5772, x:20, y:79, width:30, height:30 */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <View style={styles.backButtonCircle} />
          <Image
            source={require("../../../../src/assets/images/customer-order-details-history/chevron-left.png")}
            style={styles.backButtonIcon}
            resizeMode="contain"
          />
        </TouchableOpacity>

        {/* TITLE - Figma: 903:5771, x:158, y:83, width:124, height:22 */}
        <Text style={styles.title}>Order Details</Text>

        {/* BILL CARD - Figma: 903:5774, x:20, y:166, width:400, height:300 */}
        <View style={styles.billCard}>
          {/* Bill Background with Dashed Edges - Figma: 903:5775 */}
          <View style={styles.billBackground} />

          {/* BILL ITEMS */}
          {/* Item Count - Figma: 903:5802 & 903:5803, y:189 */}
          <View style={styles.billRow1}>
            <Text style={styles.billLabel}>Item</Text>
            <Text style={styles.billValue}>12</Text>
          </View>

          {/* Sub Total - Figma: 903:5793 & 903:5801, y:226 */}
          <View style={styles.billRow2}>
            <Text style={styles.billLabel}>Sub Total</Text>
            <Text style={styles.billValue}>₱ 500.25</Text>
          </View>

          {/* Service Fee - Figma: 903:5794 & 903:5800, y:263 */}
          <View style={styles.billRow3}>
            <Text style={styles.billLabel}>Service Fee</Text>
            <Text style={styles.billValue}>₱ 50.25</Text>
          </View>

          {/* Discount - Figma: 903:5795 & 903:5797, y:300 */}
          <View style={styles.billRow4}>
            <Text style={styles.billLabel}>Discount (20%)</Text>
            <Text style={styles.billValue}>₱ 50.25</Text>
          </View>

          {/* Discount Note - Figma: 903:5796, y:322 */}
          <Text style={styles.discountNote}>
            Discount depend on what you are{"\n"}senior of pwd.
          </Text>

          {/* Dashed Divider Line - Figma: 903:5804, y:372 */}
          <View style={styles.dashedDivider}>
            {[...Array(18)].map((_, i) => (
              <View key={i} style={styles.dash} />
            ))}
          </View>

          {/* Grand Total - Figma: 903:5798 & 903:5799, y:394 */}
          <View style={styles.billRowGrandTotal}>
            <Text style={styles.grandTotalLabel}>Grand Total</Text>
            <Text style={styles.grandTotalValue}>₱ 50.25</Text>
          </View>
        </View>

        {/* DETAILS CARD - Figma: 903:5828, x:20, y:486, width:400, height:150 */}
        <View style={styles.detailsCard}>
          {/* Card Background - Figma: 903:5829 */}
          <View style={styles.detailsCardBackground} />

          {/* Order ID Row - Figma: 903:5830, y:512 */}
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Order ID</Text>
            <Text style={styles.detailColon}>:</Text>
            <Text style={styles.detailValue}>213322RW23FSAWW</Text>
          </View>

          {/* Date Row - Figma: 903:5838, y:539 */}
          <View style={styles.detailRow2}>
            <Text style={styles.detailLabel}>Date</Text>
            <Text style={styles.detailColon}>:</Text>
            <Text style={styles.detailValueRight}>08 August, 2025</Text>
          </View>

          {/* Shop Row - Figma: 903:5834, y:566 */}
          <View style={styles.detailRow3}>
            <Text style={styles.detailLabel}>Shop</Text>
            <Text style={styles.detailColon}>:</Text>
            <Text style={styles.detailValueRight}>Golis sari-sari store</Text>
          </View>

          {/* Buyer Row - Figma: 903:5842, y:593 */}
          <View style={styles.detailRow4}>
            <Text style={styles.detailLabel}>Buyer</Text>
            <Text style={styles.detailColon}>:</Text>
            <Text style={styles.detailValueRight}>Daniel Oppa</Text>
          </View>
        </View>

        {/* PAYMENT METHOD LABEL - Figma: 903:5846, x:20, y:656, width:153, height:22 */}
        <Text style={styles.paymentMethodLabel}>Payment Method</Text>

        {/* PAYMENT METHOD CARD - Figma: 903:5848, x:20, y:698, width:400, height:60 */}
        <View style={styles.paymentCard}>
          <View style={styles.paymentCardBackground} />
          <View style={styles.paymentContent}>
            <Image
              source={require("../../../../src/assets/images/customer-order-details-history/paypal-icon.png")}
              style={styles.paypalIcon}
              resizeMode="contain"
            />
            <Text style={styles.paymentText}>Pay Pal</Text>
          </View>
        </View>

        {/* REORDER BUTTON - Figma: 903:5855, x:20, y:839, width:400, height:50 */}
        <TouchableOpacity
          style={styles.reorderButton}
          activeOpacity={0.7}
          onPress={() => {
            // TODO: Implement reorder functionality
            console.log("Reorder pressed");
          }}
        >
          <Text style={styles.reorderButtonText}>Reorder</Text>
        </TouchableOpacity>

        {/* Bottom Padding */}
        <View style={styles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  // CONTAINER - Figma: 903:5770, 440x956, background:#F4F6F6
  container: {
    flex: 1,
    backgroundColor: "#F4F6F6", // Figma: fill_CZI7OZ
  },

  scrollView: {
    flex: 1,
  },

  scrollContent: {
    paddingBottom: vs(40),
  },

  // BACK BUTTON - Figma: 903:5772, x:20, y:79, width:30, height:30
  backButton: {
    position: "absolute",
    left: s(20),
    top: vs(79),
    width: s(30),
    height: s(30),
    zIndex: 10,
  },

  // Back Button Circle Background - Figma: white circle with shadow
  backButtonCircle: {
    position: "absolute",
    width: s(30),
    height: s(30),
    borderRadius: s(20),
    backgroundColor: "#FFFFFF", // Figma: fill_4RZIIB
    shadowColor: "rgba(0, 0, 0, 0.25)",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: s(4),
    elevation: 4,
  },

  // Back Button Icon - Figma: 903:5773, 15x15
  backButtonIcon: {
    position: "absolute",
    left: s(7.5),
    top: s(7.5),
    width: s(15),
    height: s(15),
  },

  // TITLE - Figma: 903:5771, x:158, y:83, width:124, height:22
  title: {
    position: "absolute",
    left: s(158),
    top: vs(83),
    width: s(124),
    height: vs(22),
    fontFamily: Fonts.primary,
    fontWeight: "600",
    fontSize: ms(20),
    lineHeight: ms(20) * 1.1,
    textAlign: "center",
    color: "#1E1E1E", // Figma: fill_51FS4Y
  },

  // BILL CARD - Figma: 903:5774, x:20, y:166, width:400, height:300
  billCard: {
    position: "absolute",
    left: s(20),
    top: vs(166),
    width: s(400),
    height: vs(300),
  },

  // Bill Background - Figma: 903:5775 (Subtract boolean operation with dashed edges)
  billBackground: {
    position: "absolute",
    width: s(400),
    height: vs(300),
    backgroundColor: "#FFFFFF", // Figma: fill_4RZIIB
    borderRadius: s(20),
    shadowColor: "rgba(0, 0, 0, 0.25)",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: s(5),
    elevation: 5,
  },

  // Bill Row 1 - Item - Figma: y:189 (903:5802, 903:5803)
  billRow1: {
    position: "absolute",
    left: s(20), // 40 - 20 (card offset)
    top: vs(23), // 189 - 166
    width: s(360),
    flexDirection: "row",
    justifyContent: "space-between",
  },

  // Bill Label - Figma: style_4GMDZC
  billLabel: {
    fontFamily: Fonts.primary,
    fontWeight: "500",
    fontSize: ms(14),
    lineHeight: ms(14) * 1.23,
    color: "#1E1E1E", // Figma: fill_51FS4Y
  },

  // Bill Value
  billValue: {
    fontFamily: Fonts.primary,
    fontWeight: "500",
    fontSize: ms(14),
    lineHeight: ms(14) * 1.23,
    color: "#1E1E1E",
  },

  // Bill Row 2 - Sub Total - Figma: y:226 (903:5793, 903:5801)
  billRow2: {
    position: "absolute",
    left: s(20),
    top: vs(60), // 226 - 166
    width: s(360),
    flexDirection: "row",
    justifyContent: "space-between",
  },

  // Bill Row 3 - Service Fee - Figma: y:263 (903:5794, 903:5800)
  billRow3: {
    position: "absolute",
    left: s(20),
    top: vs(97), // 263 - 166
    width: s(360),
    flexDirection: "row",
    justifyContent: "space-between",
  },

  // Bill Row 4 - Discount - Figma: y:300 (903:5795, 903:5797)
  billRow4: {
    position: "absolute",
    left: s(20),
    top: vs(134), // 300 - 166
    width: s(360),
    flexDirection: "row",
    justifyContent: "space-between",
  },

  // Discount Note - Figma: 903:5796, x:40, y:322
  discountNote: {
    position: "absolute",
    left: s(20),
    top: vs(156), // 322 - 166
    fontFamily: Fonts.primary,
    fontWeight: "500",
    fontSize: ms(12),
    lineHeight: ms(12) * 1.23,
    color: "rgba(30, 30, 30, 0.5)", // Figma: fill_SIPPVY
  },

  // Dashed Divider - Figma: 903:5804, y:372
  dashedDivider: {
    position: "absolute",
    left: s(20),
    top: vs(206), // 372 - 166
    width: s(360),
    height: vs(2),
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  // Individual Dash
  dash: {
    width: s(10.71),
    height: 2,
    backgroundColor: "#1E1E1E",
  },

  // Bill Row Grand Total - Figma: y:394 (903:5798, 903:5799)
  billRowGrandTotal: {
    position: "absolute",
    left: s(20),
    top: vs(228), // 394 - 166
    width: s(360),
    flexDirection: "row",
    justifyContent: "space-between",
  },

  // Grand Total Label - Figma: 903:5798
  grandTotalLabel: {
    fontFamily: Fonts.primary,
    fontWeight: "500",
    fontSize: ms(14),
    lineHeight: ms(14) * 1.23,
    color: "#FF8D2F", // Figma: fill_RAEZY2
  },

  // Grand Total Value - Figma: 903:5799
  grandTotalValue: {
    fontFamily: Fonts.primary,
    fontWeight: "500",
    fontSize: ms(14),
    lineHeight: ms(14) * 1.23,
    color: "#FF8D2F",
  },

  // DETAILS CARD - Figma: 903:5828, x:20, y:486, width:400, height:150
  detailsCard: {
    position: "absolute",
    left: s(20),
    top: vs(486),
    width: s(400),
    height: vs(150),
  },

  // Details Card Background - Figma: 903:5829
  detailsCardBackground: {
    position: "absolute",
    width: s(400),
    height: vs(150),
    backgroundColor: "#FFFFFF", // Figma: fill_4RZIIB
    borderRadius: s(20),
    shadowColor: "rgba(0, 0, 0, 0.25)",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: s(5),
    elevation: 5,
  },

  // Detail Row - Order ID - Figma: 903:5830, y:512
  detailRow: {
    position: "absolute",
    left: s(20),
    top: vs(26), // 512 - 486
    width: s(360),
    flexDirection: "row",
    alignItems: "center",
  },

  // Detail Label - Figma: style_4GMDZC
  detailLabel: {
    fontFamily: Fonts.primary,
    fontWeight: "500",
    fontSize: ms(14),
    lineHeight: ms(14) * 1.23,
    color: "#1E1E1E", // Figma: fill_51FS4Y
  },

  // Detail Colon - Figma: positioned at x:114 (94px from label start)
  detailColon: {
    fontFamily: Fonts.primary,
    fontWeight: "500",
    fontSize: ms(14),
    lineHeight: ms(14) * 1.23,
    color: "rgba(30, 30, 30, 0.5)", // Figma: fill_SIPPVY
    marginLeft: s(20),
  },

  // Detail Value - Figma: positioned at x:261 (right-aligned)
  detailValue: {
    fontFamily: Fonts.primary,
    fontWeight: "500",
    fontSize: ms(14),
    lineHeight: ms(14) * 1.23,
    color: "rgba(30, 30, 30, 0.5)", // Figma: fill_SIPPVY
    flex: 1,
    textAlign: "right",
  },

  // Detail Value Right-aligned - Figma: style_0F97GH
  detailValueRight: {
    fontFamily: Fonts.primary,
    fontWeight: "500",
    fontSize: ms(14),
    lineHeight: ms(14) * 1.23,
    color: "rgba(30, 30, 30, 0.5)", // Figma: fill_SIPPVY
    flex: 1,
    textAlign: "right",
  },

  // Detail Row 2 - Date - Figma: 903:5838, y:539
  detailRow2: {
    position: "absolute",
    left: s(20),
    top: vs(53), // 539 - 486
    width: s(360),
    flexDirection: "row",
    alignItems: "center",
  },

  // Detail Row 3 - Shop - Figma: 903:5834, y:566
  detailRow3: {
    position: "absolute",
    left: s(20),
    top: vs(80), // 566 - 486
    width: s(360),
    flexDirection: "row",
    alignItems: "center",
  },

  // Detail Row 4 - Buyer - Figma: 903:5842, y:593
  detailRow4: {
    position: "absolute",
    left: s(20),
    top: vs(107), // 593 - 486
    width: s(360),
    flexDirection: "row",
    alignItems: "center",
  },

  // PAYMENT METHOD LABEL - Figma: 903:5846, x:20, y:656, width:153, height:22
  paymentMethodLabel: {
    position: "absolute",
    left: s(20),
    top: vs(656),
    fontFamily: Fonts.primary,
    fontWeight: "500",
    fontSize: ms(20),
    lineHeight: ms(20) * 1.1,
    color: "#1E1E1E", // Figma: fill_51FS4Y
  },

  // PAYMENT CARD - Figma: 903:5848, x:20, y:698, width:400, height:60
  paymentCard: {
    position: "absolute",
    left: s(20),
    top: vs(698),
    width: s(400),
    height: vs(60),
  },

  // Payment Card Background - Figma: 903:5850
  paymentCardBackground: {
    position: "absolute",
    width: s(400),
    height: vs(60),
    backgroundColor: "#FFFFFF", // Figma: fill_4RZIIB
    borderRadius: s(20),
    shadowColor: "rgba(0, 0, 0, 0.25)",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: s(5),
    elevation: 5,
  },

  // Payment Content - Figma: 903:5851
  paymentContent: {
    position: "absolute",
    left: s(20),
    top: vs(15),
    flexDirection: "row",
    alignItems: "center",
  },

  // PayPal Icon - Figma: 903:5853, 30x30
  paypalIcon: {
    width: s(30),
    height: s(30),
  },

  // Payment Text - Figma: 903:5854
  paymentText: {
    marginLeft: s(20),
    fontFamily: Fonts.primary,
    fontWeight: "600",
    fontSize: ms(20),
    lineHeight: ms(20) * 1.1,
    color: "#1E1E1E", // Figma: fill_51FS4Y
  },

  // REORDER BUTTON - Figma: 903:5855, x:20, y:839, width:400, height:50
  reorderButton: {
    position: "absolute",
    left: s(20),
    top: vs(839),
    width: s(400),
    height: vs(50),
    backgroundColor: "#3BB77E", // Figma: fill_JG8MQE
    borderRadius: s(20),
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "rgba(0, 0, 0, 0.25)",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: s(4),
    elevation: 4,
  },

  // Reorder Button Text - Figma: 903:5856
  reorderButtonText: {
    fontFamily: Fonts.primary,
    fontWeight: "500",
    fontSize: ms(20),
    lineHeight: ms(20) * 1.1,
    textAlign: "center",
    color: "#FFFFFF", // Figma: fill_4RZIIB
  },

  // Bottom Padding
  bottomPadding: {
    height: vs(950), // Ensure all absolutely positioned content is visible
  },
});
