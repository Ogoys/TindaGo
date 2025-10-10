/**
 * CUSTOMER CATEGORIES SCREEN
 *
 * Figma File: 8I1Nr3vQZllDDknSevstvH
 * Node: 903-4072 (Category)
 * Baseline: 440x1480
 *
 * Displays all product categories for customer browsing with a 2-column grid layout
 */

import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ImageBackground,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { s, vs, ms } from "../../../src/constants/responsive";
import { Colors } from "../../../src/constants/Colors";

interface Category {
  id: string;
  name: string;
  displayName: string;
  color: string;
  circleColor: string;
  icon: any;
  background: any;
}

const categories: Category[] = [
  {
    id: "1",
    name: "Fruits & Vegetables",
    displayName: "Fruite &\nVegetables",
    color: "#3BB77E",
    circleColor: "rgba(59, 183, 126, 0.6)",
    icon: require("../../../src/assets/images/customer-categories/fruits-vegetables.png"),
    background: require("../../../src/assets/images/customer-categories/cat-bg-1.png"),
  },
  {
    id: "2",
    name: "Dairy & Bakery",
    displayName: "Dairy &\nBakery",
    color: "#D39447",
    circleColor: "rgba(211, 148, 71, 0.6)",
    icon: require("../../../src/assets/images/customer-categories/dairy-bakery.png"),
    background: require("../../../src/assets/images/customer-categories/cat-bg-2.png"),
  },
  {
    id: "3",
    name: "Snacks & Sweets",
    displayName: "Snacks &\nSweets",
    color: "#B34F2D",
    circleColor: "rgba(179, 79, 45, 0.6)",
    icon: require("../../../src/assets/images/customer-categories/snacks.png"),
    background: require("../../../src/assets/images/customer-categories/cat-bg-3.png"),
  },
  {
    id: "4",
    name: "Beverages",
    displayName: "Beverages",
    color: "#646A8A",
    circleColor: "rgba(100, 106, 138, 0.6)",
    icon: require("../../../src/assets/images/customer-categories/beverages.png"),
    background: require("../../../src/assets/images/customer-categories/cat-bg-4.png"),
  },
  {
    id: "5",
    name: "Personal & Baby Care",
    displayName: "Personal &\nBaby Care",
    color: "#945DA1",
    circleColor: "rgba(148, 93, 161, 0.6)",
    icon: require("../../../src/assets/images/customer-categories/personal-baby-care.png"),
    background: require("../../../src/assets/images/customer-categories/cat-bg-5.png"),
  },
  {
    id: "6",
    name: "Home & Kitchen",
    displayName: "Home &\nKitchen",
    color: "#2788BB",
    circleColor: "rgba(39, 136, 187, 0.6)",
    icon: require("../../../src/assets/images/customer-categories/home-kitchen.png"),
    background: require("../../../src/assets/images/customer-categories/cat-bg-6.png"),
  },
  {
    id: "7",
    name: "Staple Foods",
    displayName: "Staple\nFoods",
    color: "#F15A8D",
    circleColor: "rgba(241, 90, 141, 0.6)",
    icon: require("../../../src/assets/images/customer-categories/staple-foods.png"),
    background: require("../../../src/assets/images/customer-categories/cat-bg-7.png"),
  },
  {
    id: "8",
    name: "Condiments & Cooking",
    displayName: "Condiments &\nCooking ",
    color: "#787161",
    circleColor: "rgba(120, 113, 97, 0.6)",
    icon: require("../../../src/assets/images/customer-categories/condiments-cooking.png"),
    background: require("../../../src/assets/images/customer-categories/cat-bg-8.png"),
  },
  {
    id: "9",
    name: "Frozen Goods",
    displayName: "Fronzen \nGoods",
    color: "#A4E0E3",
    circleColor: "rgba(103, 204, 209, 0.6)",
    icon: require("../../../src/assets/images/customer-categories/frozen-goods.png"),
    background: require("../../../src/assets/images/customer-categories/cat-bg-9.png"),
  },
  {
    id: "10",
    name: "Miscellaneous & Others",
    displayName: "Miscellaneous &\nOthers",
    color: "#765640",
    circleColor: "rgba(118, 86, 64, 0.6)",
    icon: require("../../../src/assets/images/customer-categories/miscellaneous.png"),
    background: require("../../../src/assets/images/customer-categories/cat-bg-10.png"),
  },
];

export default function CategoryScreen() {
  const handleBackPress = () => {
    router.back();
  };

  const handleCategoryPress = (category: Category) => {
    // Navigate to category products screen (to be implemented)
    console.log("Selected category:", category.name);
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Header Section - Figma: y:74-114 */}
      <View style={styles.header}>
        {/* Back Button - Figma: x:20, y:79, width:30, height:30 */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleBackPress}
          activeOpacity={0.7}
        >
          <Image
            source={require("../../../src/assets/images/customer-categories/chevron-left.png")}
            style={styles.backIcon}
          />
        </TouchableOpacity>

        {/* Title - Figma: x:171, y:83, width:98, height:22 */}
        <Text style={styles.headerTitle}>Categories</Text>

        {/* Notification Button - Figma: x:375, y:74, width:40, height:40 */}
        <TouchableOpacity
          style={styles.notificationButton}
          activeOpacity={0.7}
        >
          <View style={styles.notificationCircle}>
            <Image
              source={require("../../../src/assets/images/customer-categories/notification-icon.png")}
              style={styles.notificationIcon}
            />
          </View>
        </TouchableOpacity>
      </View>

      {/* Categories Grid - Figma: Starting at y:164 */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.gridContainer}>
          {categories.map((category, index) => {
            // Calculate position in grid (2 columns)
            const isLeftColumn = index % 2 === 0;

            return (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.categoryCard,
                  isLeftColumn ? styles.categoryCardLeft : styles.categoryCardRight,
                ]}
                onPress={() => handleCategoryPress(category)}
                activeOpacity={0.9}
              >
                {/* Card Background - Figma: width:192, height:220 */}
                <View style={styles.cardWhiteBackground}>
                  {/* Category Name - Figma: varies by category */}
                  <Text
                    style={[styles.categoryName, { color: category.color }]}
                  >
                    {category.displayName}
                  </Text>

                  {/* Bottom Decorative Section - Figma: height:80 */}
                  <ImageBackground
                    source={category.background}
                    style={styles.bottomDecoration}
                    resizeMode="cover"
                  >
                    {/* Icon Circle - Figma: width:90, height:90 */}
                    <View
                      style={[
                        styles.iconCircle,
                        { backgroundColor: category.circleColor },
                      ]}
                    >
                      <Image
                        source={category.icon}
                        style={styles.categoryIcon}
                      />
                    </View>
                  </ImageBackground>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  // Container - Figma: width:440, height:1480
  container: {
    flex: 1,
    backgroundColor: "#F4F6F6",
  },

  // Header Section - Figma: y:74-114
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: s(20),
    paddingTop: vs(20),
    paddingBottom: vs(20),
  },

  // Back Button - Figma: x:20, y:79, width:30, height:30
  backButton: {
    width: s(30),
    height: vs(30),
    borderRadius: s(20),
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },

  backIcon: {
    width: s(15),
    height: vs(15),
  },

  // Header Title - Figma: x:171, y:83, width:98, height:22
  headerTitle: {
    fontFamily: "Clash Grotesk Variable",
    fontWeight: "500",
    fontSize: ms(20),
    lineHeight: ms(22),
    color: "#1E1E1E",
    textAlign: "center",
  },

  // Notification Button - Figma: x:375, y:74, width:40, height:40
  notificationButton: {
    width: s(40),
    height: vs(40),
  },

  notificationCircle: {
    width: s(40),
    height: vs(40),
    borderRadius: s(20),
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10,
  },

  notificationIcon: {
    width: s(25),
    height: vs(25),
  },

  // ScrollView
  scrollView: {
    flex: 1,
  },

  scrollContent: {
    paddingBottom: vs(20),
  },

  // Grid Container
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingHorizontal: s(20),
    paddingTop: vs(10),
  },

  // Category Card - Figma: width:192, height:220
  // Using percentage width for consistent 2-column layout on all devices
  categoryCard: {
    width: "48%", // Ensures exactly 2 columns with gap between
    aspectRatio: 192 / 220, // Maintain Figma aspect ratio
    marginBottom: vs(20),
  },

  // Left column - Figma: x:20
  categoryCardLeft: {
    // No margin needed with justifyContent: "space-between"
  },

  // Right column - Figma: x:228
  categoryCardRight: {
    // No margin needed with justifyContent: "space-between"
  },

  // Card White Background - Figma: width:192, height:220, borderRadius:20
  cardWhiteBackground: {
    width: "100%",
    height: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: s(20),
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 5,
    overflow: "hidden",
  },

  // Category Name - Figma: varies by category, generally centered with padding
  categoryName: {
    fontFamily: "Clash Grotesk Variable",
    fontWeight: "600",
    fontSize: ms(24),
    lineHeight: ms(22),
    textAlign: "center",
    paddingHorizontal: s(10),
    paddingTop: vs(20),
  },

  // Bottom Decoration - Figma: width:192, height:80, at bottom of card
  bottomDecoration: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    width: "100%",
    height: vs(80),
    justifyContent: "center",
    alignItems: "center",
  },

  // Icon Circle - Figma: width:90, height:90, positioned in center of decoration
  iconCircle: {
    width: s(90),
    height: vs(90),
    borderRadius: s(45),
    justifyContent: "center",
    alignItems: "center",
    marginTop: vs(-45), // Half the circle overlaps the decoration area
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 5,
  },

  // Category Icon - Figma: width:50, height:50, centered in circle
  categoryIcon: {
    width: s(50),
    height: vs(50),
  },
});
