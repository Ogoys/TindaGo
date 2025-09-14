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
import { s, vs } from "../../../src/constants/responsive";
import { ProductCard } from "../../../src/components/ui/ProductCard";

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
        {/* Status Bar - Figma: x:0, y:0, width:439.5, height:54 */}
        <View style={styles.statusBar}>
          <Text style={styles.timeText}>9:41</Text>
          <View style={styles.statusIndicators}>
            <Text style={styles.batteryText}>100%</Text>
          </View>
        </View>

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

        {/* Title - Figma: x:157, y:83, width:126, height:22 */}
        <Text style={styles.headerTitle}>Daily Essential</Text>

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
  
  // Header Background - Figma: x:0, y:0, width:440, height:180
  headerBackground: {
    backgroundColor: "#02545F",
    height: vs(205), // Adjusted to include search bar spacing
    paddingBottom: vs(20),
  },
  
  // Status Bar - Figma: x:0, y:0, width:439.5, height:54
  statusBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    height: vs(54),
    paddingHorizontal: s(20),
    paddingTop: vs(10),
  },
  timeText: {
    color: Colors.white,
    fontSize: 17,
    fontFamily: Fonts.secondary, // ABeeZee from Figma
    fontWeight: "400",
  },
  statusIndicators: {
    flexDirection: "row",
    alignItems: "center",
  },
  batteryText: {
    color: Colors.white,
    fontSize: 16,
    fontFamily: Fonts.primary,
    fontWeight: Fonts.weights.medium,
  },
  
  // Back Button - Figma: x:20, y:79, width:30, height:30
  backButton: {
    position: "absolute",
    left: s(20),
    top: vs(79),
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
  
  // Header Title - Figma: x:157, y:83, width:126, height:22
  headerTitle: {
    position: "absolute",
    left: s(157),
    top: vs(83),
    width: s(126),
    height: vs(22),
    color: Colors.white,
    fontSize: 20,
    fontFamily: Fonts.primary,
    fontWeight: Fonts.weights.medium,
    textAlign: "center",
    lineHeight: 20 * 1.1, // Figma line height
  },
  
  // Notification Button - Figma: x:375, y:74, width:40, height:40
  notificationButton: {
    position: "absolute",
    left: s(375),
    top: vs(74),
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
  
  // Search Container - Figma: x:20, y:155, width:400, height:50
  searchContainer: {
    position: "absolute",
    left: s(20),
    top: vs(155),
    width: s(400),
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
    fontSize: 16,
    fontFamily: Fonts.primary,
    fontWeight: Fonts.weights.medium,
    color: "#7A7B7B",
    height: vs(50),
  },
  
  scrollContainer: {
    flex: 1,
  },
  
  // Section Label Container - Figma: x:23, y:225, width:80, height:22
  sectionLabelContainer: {
    marginLeft: s(23),
    marginTop: vs(20),
    marginBottom: vs(20),
  },
  sectionLabel: {
    fontSize: 20,
    fontFamily: Fonts.primary,
    fontWeight: Fonts.weights.semiBold, // 600 from Figma
    color: Colors.darkGray,
    lineHeight: 20 * 1.1, // Figma line height
  },
  
  // Products Grid - Starting from Figma: y:267
  productsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: s(22),
    justifyContent: "space-between",
  },
  
  bottomPadding: {
    height: vs(120), // Space for navigation
  },
});