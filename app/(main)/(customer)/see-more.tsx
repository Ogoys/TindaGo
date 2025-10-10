import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Colors } from "../../../src/constants/Colors";
import { Fonts } from "../../../src/constants/Fonts";
import { s, vs, ms } from "../../../src/constants/responsive";
import { ProductCard } from "../../../src/components/ui/ProductCard";

/**
 * SEE MORE SCREEN - PRODUCT GRID VIEW
 *
 * Baseline: 440x956 (standard TindaGo viewport)
 * Uses responsive scaling for all devices
 *
 * Features:
 * - Header with search and navigation
 * - Product grid layout (2-3 columns based on device width)
 * - Scrollable product list
 */

export default function SeeMoreScreen() {
  // Sample product data for the grid
  const products = Array.from({ length: 12 }, (_, index) => ({
    id: index + 1,
    title: "Garlic",
    subtitle: "(Local shop)",
    weight: "500g",
    image: require("../../../src/assets/images/see-more/product-image.png"),
  }));

  const handleAddProduct = (productId: number) => {
    // Add to cart functionality
    console.log("Add product to cart:", productId);
  };

  const handleProductPress = (productId: number) => {
    // Navigate to product details
    console.log("Navigate to product details:", productId);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#02545F" />
      
      {/* Header Background - Figma: x:0, y:0, width:440, height:180 */}
      <View style={styles.headerBackground}>
        {/* Back Button - Figma: x:20, y:79, width:30, height:30 */}
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Image 
            source={require("../../../src/assets/images/see-more/chevron-left.png")} 
            style={styles.chevronIcon} 
          />
        </TouchableOpacity>

        {/* Title - Fixed positioning to prevent text cropping */}
        <Text style={styles.headerTitle} numberOfLines={1} allowFontScaling={false}>
          Daily Essential
        </Text>

        {/* Notification Button - Figma: x:375, y:74, width:40, height:40 */}
        <TouchableOpacity style={styles.notificationButton}>
          <Image 
            source={require("../../../src/assets/images/see-more/notification-icon.png")} 
            style={styles.notificationIcon} 
          />
        </TouchableOpacity>

        {/* Search Bar - Figma: x:20, y:155, width:400, height:50 */}
        <View style={styles.searchContainer}>
          <Image 
            source={require("../../../src/assets/images/see-more/search-icon.png")} 
            style={styles.searchIcon} 
          />
          <TextInput
            placeholder={'Search for "Items"'}
            placeholderTextColor="#7A7B7B"
            style={styles.searchInput}
          />
        </View>
      </View>

      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Section Label - Figma: x:23, y:225, width:80, height:22 */}
        <View style={styles.sectionLabelContainer}>
          <Text style={styles.sectionLabel}>All Items</Text>
        </View>

        {/* Products Grid - Starting from Figma: y:267 */}
        <View style={styles.productsGrid}>
          {products.map((product) => (
            <ProductCard
              key={product.id}
              title={product.title}
              subtitle={product.subtitle}
              weight={product.weight}
              image={product.image}
              variant="grid"
              onAddPress={() => handleAddProduct(product.id)}
              onPress={() => handleProductPress(product.id)}
            />
          ))}
        </View>

        {/* Bottom padding for navigation */}
        <View style={styles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F4F6F6", // Figma background color
  },
  
  // Header Background - Adjusted height for better spacing
  headerBackground: {
    backgroundColor: "#02545F",
    height: vs(165), // Reduced height after removing status bar
    paddingTop: vs(20),
    paddingBottom: vs(20),
  },

  // Back Button - Adjusted position
  backButton: {
    position: "absolute",
    left: s(20),
    top: vs(30),
    width: s(30),
    height: vs(30),
    backgroundColor: Colors.white,
    borderRadius: s(20),
    justifyContent: "center",
    alignItems: "center",
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: s(4),
    elevation: 4,
  },
  chevronIcon: {
    width: s(15),
    height: s(15),
  },

  // Header Title - Fixed to prevent text cropping
  headerTitle: {
    position: "absolute",
    left: s(120), // Adjusted left position to center properly
    top: vs(32),
    width: s(200), // Increased width to prevent horizontal cropping of "Daily"
    height: vs(28), // Increased height to prevent vertical cropping
    color: Colors.white,
    fontSize: ms(20),
    fontFamily: Fonts.primary,
    fontWeight: Fonts.weights.medium,
    textAlign: "center",
    lineHeight: vs(24),
    includeFontPadding: false,
    overflow: "visible", // Ensure text doesn't get clipped
  },

  // Notification Button - Adjusted position
  notificationButton: {
    position: "absolute",
    left: s(375),
    top: vs(25),
    width: s(40),
    height: vs(40),
    backgroundColor: Colors.white,
    borderRadius: s(20),
    justifyContent: "center",
    alignItems: "center",
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: s(10),
    elevation: 5,
  },
  notificationIcon: {
    width: s(25),
    height: s(25),
  },

  // Search Container - Adjusted position for better spacing
  // Optimized for small devices: reduced to 390px for compatibility
  searchContainer: {
    position: "absolute",
    left: s(20),
    top: vs(95),
    width: s(390), // Reduced from 400 to 390 for small device compatibility
    height: vs(50),
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.white,
    borderRadius: s(20),
    paddingHorizontal: s(20),
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: s(10),
    elevation: 5,
  },
  searchIcon: {
    width: s(20),
    height: s(20),
    marginRight: s(20),
  },
  searchInput: {
    flex: 1,
    fontSize: ms(16),
    fontFamily: Fonts.primary,
    fontWeight: Fonts.weights.medium,
    color: "#7A7B7B",
    height: vs(50),
  },
  
  scrollContainer: {
    flex: 1,
  },
  
  // Section Label Container - Better spacing
  sectionLabelContainer: {
    marginLeft: s(23),
    marginTop: vs(25),
    marginBottom: vs(25),
  },
  sectionLabel: {
    fontSize: ms(20),
    fontFamily: Fonts.primary,
    fontWeight: Fonts.weights.semiBold, // 600 from Figma
    color: Colors.darkGray,
    lineHeight: ms(20) * 1.1, // Figma line height
  },
  
  // Products Grid - ALWAYS 3 COLUMNS on all devices (consistent layout)
  productsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: s(20),
    justifyContent: "space-between", // Evenly distribute 3 columns
  },
  
  bottomPadding: {
    height: vs(120), // Space for navigation
  },
});