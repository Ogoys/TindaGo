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
        {/* BACK BUTTON - Figma: 759:4024, x:20, y:79, width:30, height:30 */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <View style={styles.backButtonCircle} />
          <Image
            source={require("../../../../src/assets/images/customer-order-history/chevron-left.png")}
            style={styles.backButtonIcon}
            resizeMode="contain"
          />
        </TouchableOpacity>

        {/* TITLE - Figma: 759:4026, x:156, y:83, width:129, height:22 */}
        <Text style={styles.title}>Order Details</Text>

        {/* ORDER ID SECTION - Figma: 759:4027 & 759:4028, y:149 */}
        <View style={styles.orderIdContainer}>
          <Text style={styles.orderIdLabel}>Order ID :</Text>
          <Text style={styles.orderIdValue}>123456789</Text>
        </View>

        {/* STATUS ORDER CARD - Figma: 759:4029, x:20, y:191, width:400, height:200 */}
        <View style={styles.statusOrderCard}>
          {/* Card Background - Figma: 759:4030 */}
          <View style={styles.statusCardBackground} />

          {/* STATUS TIMELINE */}
          {/* Lines connecting status items - Figma: 759:4031 */}
          <View style={styles.linesContainer}>
            <View style={styles.statusLine} />
            <View style={styles.statusLine} />
            <View style={styles.statusLine} />
          </View>

          {/* STATUS ITEM 1: ORDER CONFIRMED - Figma: 759:4035, x:36, y:206 */}
          <View style={styles.statusItem1}>
            <View style={styles.statusIconContainer}>
              {/* Check Icon Background - Figma: 759:4036 */}
              <View style={styles.checkCircle} />
              {/* Check Icon - Figma: 759:4037 */}
              <View style={styles.checkIcon}>
                <View style={styles.checkMark} />
              </View>
            </View>
            <Text style={styles.statusTextConfirmed}>Order Confirmed</Text>
            <Text style={styles.statusTime1}>12:30 PM</Text>
          </View>

          {/* STATUS ITEM 2: PREPARING ORDER - Figma: 759:4039, x:36, y:256 */}
          <View style={styles.statusItem2}>
            <View style={styles.statusIconContainer}>
              {/* Process Circle - Figma: 759:4040 */}
              <View style={styles.processCircle} />
              {/* Process Icon - Figma: 759:4041 */}
              <Image
                source={require("../../../../src/assets/images/customer-order-details/process-icon.png")}
                style={styles.processIcon}
                resizeMode="cover"
              />
            </View>
            <Text style={styles.statusText}>Preparing your Order</Text>
            <Text style={styles.statusTime2}>12:35 PM</Text>
          </View>

          {/* STATUS ITEM 3: READY TO PICKUP - Figma: 759:4042, x:36, y:306 */}
          <View style={styles.statusItem3}>
            <View style={styles.statusIconContainer}>
              {/* Pickup Circle - Figma: 759:4043 */}
              <View style={styles.pickupCircle} />
              {/* Pickup Icon - Figma: 759:4044 */}
              <Image
                source={require("../../../../src/assets/images/customer-order-details/pickup-icon.png")}
                style={styles.pickupIcon}
                resizeMode="contain"
              />
            </View>
            <Text style={styles.statusText}>Your Order is Ready to Pickup</Text>
            <Text style={styles.statusTime3}>12:37 PM</Text>
          </View>

          {/* STATUS ITEM 4: PICKUP ORDER - Figma: 759:4051, x:36, y:356 */}
          <View style={styles.statusItem4}>
            <View style={styles.statusIconContainer}>
              {/* Pickup Circle - Figma: 759:4052 */}
              <View style={styles.pickupCircle} />
              {/* Pickup Icon - Figma: 759:4053 */}
              <Image
                source={require("../../../../src/assets/images/customer-order-details/pickup-icon.png")}
                style={styles.pickupIcon}
                resizeMode="contain"
              />
            </View>
            <Text style={styles.statusText}>Pickup Order</Text>
            <Text style={styles.statusTime4}>12:45 PM</Text>
          </View>
        </View>

        {/* BILL CARD - Figma: 759:4056, x:20, y:411, width:400, height:320 */}
        <View style={styles.billCard}>
          {/* Bill Background with Dashed Edges - Figma: 759:4057 */}
          <View style={styles.billBackground} />

          {/* BILL ITEMS */}
          {/* Item Count - Figma: 759:4086 & 759:4087, y:434 */}
          <View style={styles.billRow1}>
            <Text style={styles.billLabel}>Item</Text>
            <Text style={styles.billValue}>12</Text>
          </View>

          {/* Sub Total - Figma: 759:4075 & 759:4085, y:471 */}
          <View style={styles.billRow2}>
            <Text style={styles.billLabel}>Sub Total</Text>
            <Text style={styles.billValue}>₱ 500.25</Text>
          </View>

          {/* Service Fee - Figma: 759:4076 & 759:4084, y:508 */}
          <View style={styles.billRow3}>
            <Text style={styles.billLabel}>Service Fee</Text>
            <Text style={styles.billValue}>₱ 50.25</Text>
          </View>

          {/* Discount - Figma: 759:4077 & 759:4079, y:545 */}
          <View style={styles.billRow4}>
            <Text style={styles.billLabel}>Discount (20%)</Text>
            <Text style={styles.billValue}>₱ 50.25</Text>
          </View>

          {/* Discount Note - Figma: 759:4078, y:567 */}
          <Text style={styles.discountNote}>
            Discount depend on what you are{"\n"}senior of pwd.
          </Text>

          {/* Dashed Divider Line - Figma: 759:4088, y:617 */}
          <View style={styles.dashedDivider}>
            {[...Array(18)].map((_, i) => (
              <View key={i} style={styles.dash} />
            ))}
          </View>

          {/* Grand Total - Figma: 759:4080 & 759:4081, y:639 */}
          <View style={styles.billRowGrandTotal}>
            <Text style={styles.grandTotalLabel}>Grand Total</Text>
            <Text style={styles.grandTotalValue}>₱ 50.25</Text>
          </View>

          {/* Invoice - Figma: 759:4082 & 759:4083, y:676 */}
          <View style={styles.billRowInvoice}>
            <Text style={styles.billLabel}>Invoice</Text>
            <TouchableOpacity activeOpacity={0.7}>
              <Text style={styles.viewInvoiceLink}>View Invoice</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* PAYMENT METHOD LABEL - Figma: 759:4112, x:20, y:751, width:153, height:22 */}
        <Text style={styles.paymentMethodLabel}>Payment Method</Text>

        {/* PAYMENT METHOD CARD - Figma: 759:4114, x:20, y:793, width:400, height:60 */}
        <View style={styles.paymentCard}>
          <View style={styles.paymentCardBackground} />
          <View style={styles.paymentContent}>
            <Image
              source={require("../../../../src/assets/images/customer-order-details/paypal-icon.png")}
              style={styles.paypalIcon}
              resizeMode="contain"
            />
            <Text style={styles.paymentText}>Pay Pal</Text>
          </View>
        </View>

        {/* Bottom Padding */}
        <View style={styles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  // CONTAINER - Figma: 759:4020, 440x956, background:#F4F6F6
  container: {
    flex: 1,
    backgroundColor: "#F4F6F6", // Figma: fill_WZP0OZ
  },

  scrollView: {
    flex: 1,
  },

  scrollContent: {
    paddingBottom: vs(40),
  },

  // BACK BUTTON - Figma: 759:4024, x:20, y:79, width:30, height:30
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
    backgroundColor: "#FFFFFF",
    shadowColor: "rgba(0, 0, 0, 0.25)",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: s(4),
    elevation: 4,
  },

  // Back Button Icon - Figma: 759:4025, 15x15
  backButtonIcon: {
    position: "absolute",
    left: s(7.5),
    top: s(7.5),
    width: s(15),
    height: s(15),
  },

  // TITLE - Figma: 759:4026, x:156, y:83, width:129, height:22
  title: {
    position: "absolute",
    left: s(140),
    top: vs(83),
    width: s(160),
    height: vs(22),
    fontFamily: Fonts.primary,
    fontWeight: "600",
    fontSize: ms(20),
    lineHeight: ms(20) * 1.1,
    textAlign: "center",
    color: "#1E1E1E", // Figma: fill_T5S7YD
  },

  // ORDER ID CONTAINER - Figma: y:149
  orderIdContainer: {
    position: "absolute",
    left: s(20),
    top: vs(149),
    flexDirection: "row",
    alignItems: "center",
  },

  // Order ID Label - Figma: 759:4027, x:20, y:149
  orderIdLabel: {
    fontFamily: Fonts.primary,
    fontWeight: "500",
    fontSize: ms(16),
    lineHeight: ms(16) * 1.375,
    textAlign: "center",
    color: "rgba(30, 30, 30, 0.5)", // Figma: fill_X1Q1GT
  },

  // Order ID Value - Figma: 759:4028, x:97, y:149
  orderIdValue: {
    marginLeft: s(10),
    fontFamily: Fonts.primary,
    fontWeight: "500",
    fontSize: ms(16),
    lineHeight: ms(16) * 1.375,
    textAlign: "center",
    color: "rgba(30, 30, 30, 0.5)", // Figma: fill_X1Q1GT
  },

  // STATUS ORDER CARD - Figma: 759:4029, x:20, y:191, width:400, height:200
  statusOrderCard: {
    position: "absolute",
    left: s(20),
    top: vs(191),
    width: s(400),
    height: vs(200),
  },

  // Status Card Background - Figma: 759:4030, white rectangle with shadow
  statusCardBackground: {
    position: "absolute",
    width: s(400),
    height: vs(200),
    backgroundColor: "#FFFFFF",
    borderRadius: s(20),
    shadowColor: "rgba(0, 0, 0, 0.25)",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: s(5),
    elevation: 5,
  },

  // Lines Container - Figma: 759:4031, x:46, y:226
  linesContainer: {
    position: "absolute",
    left: s(46),
    top: vs(35), // Adjusted from 226 to be relative to card
  },

  // Status Line - Figma: 759:4032, 759:4033, 759:4034 (vertical dashed lines)
  statusLine: {
    width: 1,
    height: vs(30),
    borderLeftWidth: 1,
    borderLeftColor: Colors.primary,
    borderStyle: "dashed",
  },

  // STATUS ITEM 1 - Order Confirmed - Figma: x:36, y:206
  statusItem1: {
    position: "absolute",
    left: s(16), // 36 - 20 (card offset)
    top: vs(15), // 206 - 191 (card top)
    flexDirection: "row",
    alignItems: "center",
  },

  statusIconContainer: {
    width: s(20),
    height: s(20),
    justifyContent: "center",
    alignItems: "center",
  },

  // Check Circle - Figma: 759:4036
  checkCircle: {
    position: "absolute",
    width: s(20),
    height: s(20),
    borderRadius: s(10),
    backgroundColor: Colors.primary, // Figma: fill_BHDJLP
  },

  // Check Icon Container - Figma: 759:4037
  checkIcon: {
    width: s(15),
    height: s(15),
    justifyContent: "center",
    alignItems: "center",
  },

  // Check Mark - Programmatically created since SVG wasn't available
  checkMark: {
    width: s(10),
    height: s(7),
    borderBottomWidth: 2,
    borderLeftWidth: 2,
    borderColor: "#FFFFFF",
    transform: [{ rotate: "-45deg" }],
    marginTop: -s(2),
  },

  // Status Text Confirmed - Figma: 759:4045, x:82, y:206
  statusTextConfirmed: {
    marginLeft: s(46), // 82 - 36
    fontFamily: Fonts.primary,
    fontWeight: "500",
    fontSize: ms(16),
    lineHeight: ms(16) * 1.23,
    color: Colors.primary,
  },

  // Status Time 1 - Figma: 759:4048, x:342, y:206
  statusTime1: {
    position: "absolute",
    left: s(306), // 342 - 36
    fontFamily: Fonts.primary,
    fontWeight: "500",
    fontSize: ms(16),
    lineHeight: ms(16) * 1.23,
    color: Colors.primary,
  },

  // STATUS ITEM 2 - Preparing Order - Figma: x:36, y:256
  statusItem2: {
    position: "absolute",
    left: s(16),
    top: vs(65), // 256 - 191
    flexDirection: "row",
    alignItems: "center",
  },

  // Process Circle - Figma: 759:4040
  processCircle: {
    position: "absolute",
    width: s(20),
    height: s(20),
    borderRadius: s(10),
    backgroundColor: Colors.primary,
  },

  // Process Icon - Figma: 759:4041
  processIcon: {
    width: s(20),
    height: s(20),
    borderRadius: s(10),
  },

  // Status Text - Figma: 759:4046, 759:4047, 759:4054
  statusText: {
    marginLeft: s(46),
    fontFamily: Fonts.primary,
    fontWeight: "500",
    fontSize: ms(16),
    lineHeight: ms(16) * 1.23,
    color: Colors.primary,
  },

  // Status Time 2 - Figma: 759:4049, x:342, y:256
  statusTime2: {
    position: "absolute",
    left: s(306),
    fontFamily: Fonts.primary,
    fontWeight: "500",
    fontSize: ms(16),
    lineHeight: ms(16) * 1.23,
    color: Colors.primary,
  },

  // STATUS ITEM 3 - Ready to Pickup - Figma: x:36, y:306
  statusItem3: {
    position: "absolute",
    left: s(16),
    top: vs(115), // 306 - 191
    flexDirection: "row",
    alignItems: "center",
  },

  // Pickup Circle - Figma: 759:4043, 759:4052
  pickupCircle: {
    position: "absolute",
    width: s(20),
    height: s(20),
    borderRadius: s(10),
    backgroundColor: Colors.primary,
  },

  // Pickup Icon - Figma: 759:4044, 759:4053
  pickupIcon: {
    width: s(14),
    height: s(12),
  },

  // Status Time 3 - Figma: 759:4050, x:342, y:306
  statusTime3: {
    position: "absolute",
    left: s(306),
    fontFamily: Fonts.primary,
    fontWeight: "500",
    fontSize: ms(16),
    lineHeight: ms(16) * 1.23,
    color: Colors.primary,
  },

  // STATUS ITEM 4 - Pickup Order - Figma: x:36, y:356
  statusItem4: {
    position: "absolute",
    left: s(16),
    top: vs(165), // 356 - 191
    flexDirection: "row",
    alignItems: "center",
  },

  // Status Time 4 - Figma: 759:4055, x:342, y:356
  statusTime4: {
    position: "absolute",
    left: s(306),
    fontFamily: Fonts.primary,
    fontWeight: "500",
    fontSize: ms(16),
    lineHeight: ms(16) * 1.23,
    color: Colors.primary,
  },

  // BILL CARD - Figma: 759:4056, x:20, y:411, width:400, height:320
  billCard: {
    position: "absolute",
    left: s(20),
    top: vs(411),
    width: s(400),
    height: vs(320),
  },

  // Bill Background - Figma: 759:4057 (Subtract boolean operation with dashed edges)
  billBackground: {
    position: "absolute",
    width: s(400),
    height: vs(320),
    backgroundColor: "#FFFFFF",
    borderRadius: s(20),
    shadowColor: "rgba(0, 0, 0, 0.25)",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: s(5),
    elevation: 5,
  },

  // Bill Row 1 - Item - Figma: y:434
  billRow1: {
    position: "absolute",
    left: s(20),
    top: vs(23), // 434 - 411
    width: s(360),
    flexDirection: "row",
    justifyContent: "space-between",
  },

  // Bill Label - Figma: style_ZS8322
  billLabel: {
    fontFamily: Fonts.primary,
    fontWeight: "500",
    fontSize: ms(14),
    lineHeight: ms(14) * 1.23,
    color: "#1E1E1E", // Figma: fill_T5S7YD
  },

  // Bill Value
  billValue: {
    fontFamily: Fonts.primary,
    fontWeight: "500",
    fontSize: ms(14),
    lineHeight: ms(14) * 1.23,
    color: "#1E1E1E",
  },

  // Bill Row 2 - Sub Total - Figma: y:471
  billRow2: {
    position: "absolute",
    left: s(20),
    top: vs(60), // 471 - 411
    width: s(360),
    flexDirection: "row",
    justifyContent: "space-between",
  },

  // Bill Row 3 - Service Fee - Figma: y:508
  billRow3: {
    position: "absolute",
    left: s(20),
    top: vs(97), // 508 - 411
    width: s(360),
    flexDirection: "row",
    justifyContent: "space-between",
  },

  // Bill Row 4 - Discount - Figma: y:545
  billRow4: {
    position: "absolute",
    left: s(20),
    top: vs(134), // 545 - 411
    width: s(360),
    flexDirection: "row",
    justifyContent: "space-between",
  },

  // Discount Note - Figma: 759:4078, x:40, y:567
  discountNote: {
    position: "absolute",
    left: s(20),
    top: vs(156), // 567 - 411
    fontFamily: Fonts.primary,
    fontWeight: "500",
    fontSize: ms(12),
    lineHeight: ms(12) * 1.23,
    color: "rgba(30, 30, 30, 0.5)", // Figma: fill_X1Q1GT
  },

  // Dashed Divider - Figma: 759:4088, y:617
  dashedDivider: {
    position: "absolute",
    left: s(20),
    top: vs(206), // 617 - 411
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

  // Bill Row Grand Total - Figma: y:639
  billRowGrandTotal: {
    position: "absolute",
    left: s(20),
    top: vs(228), // 639 - 411
    width: s(360),
    flexDirection: "row",
    justifyContent: "space-between",
  },

  // Grand Total Label - Figma: 759:4080
  grandTotalLabel: {
    fontFamily: Fonts.primary,
    fontWeight: "500",
    fontSize: ms(14),
    lineHeight: ms(14) * 1.23,
    color: "#FF8D2F", // Figma: fill_PSM8ZG
  },

  // Grand Total Value - Figma: 759:4081
  grandTotalValue: {
    fontFamily: Fonts.primary,
    fontWeight: "500",
    fontSize: ms(14),
    lineHeight: ms(14) * 1.23,
    color: "#FF8D2F",
  },

  // Bill Row Invoice - Figma: y:676
  billRowInvoice: {
    position: "absolute",
    left: s(20),
    top: vs(265), // 676 - 411
    width: s(360),
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  // View Invoice Link - Figma: 759:4083
  viewInvoiceLink: {
    fontFamily: Fonts.primary,
    fontWeight: "500",
    fontSize: ms(12),
    lineHeight: ms(12) * 1.23,
    color: "#02545F", // Figma: fill_EBPSOB
    textDecorationLine: "underline",
  },

  // PAYMENT METHOD LABEL - Figma: 759:4112, x:20, y:751, width:153, height:22
  paymentMethodLabel: {
    position: "absolute",
    left: s(20),
    top: vs(751),
    fontFamily: Fonts.primary,
    fontWeight: "500",
    fontSize: ms(20),
    lineHeight: ms(20) * 1.1,
    color: "#1E1E1E",
  },

  // PAYMENT CARD - Figma: 759:4114, x:20, y:793, width:400, height:60
  paymentCard: {
    position: "absolute",
    left: s(20),
    top: vs(793),
    width: s(400),
    height: vs(60),
  },

  // Payment Card Background - Figma: 759:4116
  paymentCardBackground: {
    position: "absolute",
    width: s(400),
    height: vs(60),
    backgroundColor: "#FFFFFF",
    borderRadius: s(20),
    shadowColor: "rgba(0, 0, 0, 0.25)",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: s(5),
    elevation: 5,
  },

  // Payment Content - Figma: 759:4117
  paymentContent: {
    position: "absolute",
    left: s(20),
    top: vs(15),
    flexDirection: "row",
    alignItems: "center",
  },

  // PayPal Icon - Figma: 759:4119, 30x30
  paypalIcon: {
    width: s(30),
    height: s(30),
  },

  // Payment Text - Figma: 759:4120
  paymentText: {
    marginLeft: s(20),
    fontFamily: Fonts.primary,
    fontWeight: "600",
    fontSize: ms(20),
    lineHeight: ms(20) * 1.1,
    color: "#1E1E1E",
  },

  // Bottom Padding
  bottomPadding: {
    height: vs(900), // Ensure all absolutely positioned content is visible
  },
});
