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

export default function HomeScreen() {
  const categoryData = [
    { id: "all", label: "All", icon: require("../../../src/assets/images/home/menu-icon.png"), active: true },
    { id: "cleaners", label: "Cleaners", icon: require("../../../src/assets/images/home/cleaners-icon.png") },
    { id: "canned", label: "Canned", icon: require("../../../src/assets/images/home/canned-icon.png") },
    { id: "shampoos", label: "Shampoos", icon: require("../../../src/assets/images/home/shampoo-icon.png") },
    { id: "chips", label: "Chips", icon: require("../../../src/assets/images/home/chips-icon.png") },
    { id: "coffee", label: "Coffee", icon: require("../../../src/assets/images/home/coffee-icon.png") },
  ];

  const ProductCard = ({ title, price, image }: { title: string; price: string; image?: any }) => (
    <TouchableOpacity 
      style={styles.productCard} 
      onPress={() => router.push("/product-details" as any)}
      activeOpacity={0.8}
    >
      <View style={styles.productImageContainer}>
        {image && <Image source={image} style={styles.productImage} />}
      </View>
      <Text style={styles.productTitle}>{title}</Text>
      <Text style={styles.productPrice}>{price}</Text>
    </TouchableOpacity>
  );

  const StoreCard = ({ name, description, rating }: { name: string; description: string; rating: string }) => (
    <View style={styles.storeCard}>
      <View style={styles.storeImageContainer}>
        {/* Store image placeholder */}
      </View>
      <View style={styles.storeInfo}>
        <Text style={styles.storeName}>{name}</Text>
        <Text style={styles.storeDescription}>{description}</Text>
        <Text style={styles.storeRating}>{rating}</Text>
      </View>
    </View>
  );

  const PopularPickCard = ({ title, category }: { title: string; category: string }) => (
    <View style={styles.popularPickCard}>
      <Text style={styles.popularPickTitle}>{title}</Text>
      <Text style={styles.popularPickCategory}>{category}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#02545F" />
      
      {/* Header Background */}
      <View style={styles.headerBackground}>
        {/* Status Bar - Figma: x:0, y:0, width:439.5, height:54 */}
        <View style={styles.statusBar}>
          <Text style={styles.timeText}>9:41</Text>
          <View style={styles.statusIndicators}>
            <Text style={styles.batteryText}>100%</Text>
          </View>
        </View>

        {/* Profile Section - Figma: x:20, y:74, width:179, height:40 */}
        <View style={styles.profileSection}>
          <Image 
            source={require("../../../src/assets/images/home/profile-picture.png")} 
            style={styles.profilePicture} 
          />
          <View style={styles.profileInfo}>
            <Text style={styles.userName}>Daniel Oppa</Text>
            <View style={styles.locationContainer}>
              <Image 
                source={require("../../../src/assets/images/home/location-icon.png")} 
                style={styles.locationIcon} 
              />
              <Text style={styles.locationText}>Jacinto st. Davao City</Text>
            </View>
          </View>
        </View>

        {/* Notification Button - Figma: x:375, y:74, width:40, height:40 */}
        <TouchableOpacity style={styles.notificationButton}>
          <Image 
            source={require("../../../src/assets/images/home/notification-icon.png")} 
            style={styles.notificationIcon} 
          />
        </TouchableOpacity>

        {/* Search Bar - Figma: x:20, y:134, width:400, height:50 */}
        <View style={styles.searchContainer}>
          <Image 
            source={require("../../../src/assets/images/home/search-icon.png")} 
            style={styles.searchIcon} 
          />
          <TextInput
            placeholder="Search for 'Items'"
            placeholderTextColor="#7A7B7B"
            style={styles.searchInput}
          />
        </View>
      </View>

      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Category Section - Figma: x:20, y:204, width:400, height:72 */}
        <View style={styles.categorySection}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScrollView}>
            {categoryData.map((category, index) => (
              <TouchableOpacity key={category.id} style={styles.categoryItem}>
                <View style={[styles.categoryIcon, category.active && styles.categoryIconActive]}>
                  <Image source={category.icon} style={styles.categoryImage} />
                </View>
                <Text style={[styles.categoryLabel, category.active && styles.categoryLabelActive]}>
                  {category.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Best Selling Section - Figma: x:23, y:296, width:395, height:24 */}
        <View style={[styles.sectionHeader, { marginTop: vs(20) }]}>
          <Text style={styles.sectionTitle}>Best Selling</Text>
          <TouchableOpacity onPress={() => router.push("/(main)/(customer)/see-more")}>
            <Text style={styles.seeMoreText}>See more</Text>
          </TouchableOpacity>
        </View>

        {/* Best Selling Products - Figma: x:1, y:330, width:440, height:244 */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.productsScrollView}>
          <ProductCard title="Sample Product 1" price="₱25.00" />
          <ProductCard title="Sample Product 2" price="₱30.00" />
          <ProductCard title="Sample Product 3" price="₱45.00" />
          <ProductCard title="Sample Product 4" price="₱35.00" />
        </ScrollView>

        {/* Featured Stores Section - Figma: x:23, y:584, width:395, height:24 */}
        <View style={[styles.sectionHeader, { marginTop: vs(30) }]}>
          <Text style={styles.sectionTitle}>Feature store near you</Text>
          <TouchableOpacity>
            <Text style={styles.seeMoreText}>See more</Text>
          </TouchableOpacity>
        </View>

        {/* Featured Stores - Figma: x:20, y:628, width:400, height:660 */}
        <View style={styles.storesContainer}>
          <StoreCard name="Sample Store 1" description="Fresh groceries and household items" rating="4.5 ⭐" />
          <StoreCard name="Sample Store 2" description="Quality products at affordable prices" rating="4.8 ⭐" />
          <StoreCard name="Sample Store 3" description="Your neighborhood convenience store" rating="4.2 ⭐" />
          <StoreCard name="Sample Store 4" description="Wide selection of daily essentials" rating="4.7 ⭐" />
        </View>

        {/* Navigation Bar Section - Figma: x:0, y:838, width:440, height:120 */}
        {/* This creates the spacing where the nav bar would be in the design */}
        <View style={styles.navigationBarSpacer} />

        {/* Popular Picks Section - Figma: x:23, y:1308, width:395, height:24 */}
        <View style={[styles.sectionHeader, { marginTop: vs(20) }]}>
          <Text style={styles.sectionTitle}>Most popular picks</Text>
          <TouchableOpacity onPress={() => router.push("/(main)/(customer)/see-more")}>
            <Text style={styles.seeMoreText}>See more</Text>
          </TouchableOpacity>
        </View>

        {/* Popular Picks - Figma: x:0, y:1332, width:440, height:100 */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.popularPicksScrollView}>
          <PopularPickCard title="Instant Noodles" category="Food" />
          <PopularPickCard title="Shampoo" category="Personal Care" />
          <PopularPickCard title="Coffee" category="Beverages" />
          <PopularPickCard title="Snacks" category="Food" />
        </ScrollView>

        {/* Fresh Finds Section - Figma: x:24, y:1442, width:395, height:24 */}
        <View style={[styles.sectionHeader, { marginTop: vs(50) }]}>
          <Text style={styles.sectionTitle}>Fresh finds of the day</Text>
          <TouchableOpacity onPress={() => router.push("/(main)/(customer)/see-more")}>
            <Text style={styles.seeMoreText}>See more</Text>
          </TouchableOpacity>
        </View>

        {/* Fresh Finds Products - Figma: x:0, y:1486, width:440, height:244 */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.productsScrollView}>
          <ProductCard title="Fresh Product 1" price="₱20.00" />
          <ProductCard title="Fresh Product 2" price="₱25.00" />
          <ProductCard title="Fresh Product 3" price="₱30.00" />
          <ProductCard title="Fresh Product 4" price="₱15.00" />
        </ScrollView>

        {/* End Message - Figma: x:174, y:1750, width:93, height:22 */}
        <Text style={styles.endMessage}>That's all for now!</Text>
        
        {/* Bottom padding for tab navigation */}
        <View style={styles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundGray, // Figma: #F4F6F6
  },
  
  // Header Background - Figma: x:0, y:0, width:440, height:230
  headerBackground: {
    backgroundColor: "#02545F", // Figma header color
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
    fontSize: 16,
    fontFamily: Fonts.primary,
    fontWeight: Fonts.weights.medium,
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
  
  // Profile Section - Figma: x:20, y:74, width:179, height:40
  profileSection: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: s(20),
    marginTop: vs(20),
    width: s(179),
    height: vs(40),
  },
  profilePicture: {
    width: s(40),
    height: s(40),
    borderRadius: s(20),
  },
  profileInfo: {
    marginLeft: s(10),
    flex: 1,
  },
  userName: {
    color: Colors.white,
    fontSize: 20,
    fontFamily: Fonts.primary,
    fontWeight: Fonts.weights.medium,
    lineHeight: 20 * Fonts.lineHeights.tight,
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: vs(4),
  },
  locationIcon: {
    width: s(15),
    height: s(15),
    marginRight: s(5),
  },
  locationText: {
    color: Colors.white,
    fontSize: 12,
    fontFamily: Fonts.primary,
    fontWeight: Fonts.weights.normal,
    lineHeight: 12 * 1.83,
  },
  
  // Notification Button - Figma: x:375, y:74, width:40, height:40
  notificationButton: {
    position: "absolute",
    right: s(25),
    top: vs(94), // 74 + 20 status bar adjustment
    width: s(40),
    height: s(40),
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
  
  // Search Container - Figma: x:20, y:134, width:400, height:50
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.white,
    borderRadius: s(20),
    marginHorizontal: s(20),
    marginTop: vs(20),
    height: vs(50),
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
  
  // Category Section - Figma: x:20, y:204, width:400, height:72
  categorySection: {
    marginTop: vs(10), // Reduced to match Figma spacing from search bar
    height: vs(72),
  },
  categoryScrollView: {
    paddingHorizontal: s(20),
  },
  categoryItem: {
    alignItems: "center",
    marginRight: s(20),
    width: s(50),
  },
  categoryIcon: {
    width: s(50),
    height: s(50),
    borderRadius: s(25),
    backgroundColor: Colors.white,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: vs(4) },
    shadowOpacity: 0.25,
    shadowRadius: s(10),
    elevation: 5,
  },
  categoryIconActive: {
    backgroundColor: Colors.primary,
  },
  categoryImage: {
    width: s(30),
    height: s(30),
  },
  categoryLabel: {
    fontSize: 14,
    fontFamily: Fonts.primary,
    fontWeight: Fonts.weights.medium,
    color: Colors.darkGray,
    marginTop: vs(4),
    textAlign: "center",
  },
  categoryLabelActive: {
    color: Colors.primary,
  },
  
  // Section Headers - Figma: various y positions
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginHorizontal: s(23),
    marginTop: vs(20),
    marginBottom: vs(10),
    height: vs(24),
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: Fonts.primary,
    fontWeight: Fonts.weights.semiBold,
    color: Colors.darkGray,
    lineHeight: 20 * Fonts.lineHeights.tight,
  },
  seeMoreText: {
    fontSize: 14,
    fontFamily: Fonts.primary,
    fontWeight: Fonts.weights.medium,
    color: "rgba(0, 0, 0, 0.5)",
    lineHeight: 14 * 1.57,
  },
  
  // Products ScrollView - Figma: width:440, height:244
  productsScrollView: {
    paddingLeft: s(22),
    marginBottom: vs(30), // Increased for better section spacing
  },
  productCard: {
    width: s(120),
    height: vs(222),
    backgroundColor: Colors.white,
    borderRadius: s(15),
    marginRight: s(20),
    padding: s(10),
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: vs(4) },
    shadowOpacity: 0.1,
    shadowRadius: s(8),
    elevation: 3,
  },
  productImageContainer: {
    flex: 1,
    backgroundColor: Colors.lightGray,
    borderRadius: s(10),
    marginBottom: vs(8),
  },
  productImage: {
    width: "100%",
    height: "100%",
    borderRadius: s(10),
  },
  productTitle: {
    fontSize: 14,
    fontFamily: Fonts.primary,
    fontWeight: Fonts.weights.medium,
    color: Colors.darkGray,
    marginBottom: vs(4),
  },
  productPrice: {
    fontSize: 16,
    fontFamily: Fonts.primary,
    fontWeight: Fonts.weights.semiBold,
    color: Colors.primary,
  },
  
  // Stores Container - Figma: x:20, y:628, width:400, height:660
  storesContainer: {
    paddingHorizontal: s(20),
    marginBottom: vs(10), // Reduced bottom margin for proper spacing
  },
  storeCard: {
    backgroundColor: Colors.white,
    borderRadius: s(15),
    padding: s(15),
    marginBottom: vs(15),
    height: vs(150),
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: vs(4) },
    shadowOpacity: 0.25,
    shadowRadius: s(10),
    elevation: 5,
    flexDirection: "row",
  },
  storeImageContainer: {
    width: s(80),
    height: vs(120),
    backgroundColor: Colors.lightGray,
    borderRadius: s(10),
    marginRight: s(15),
  },
  storeInfo: {
    flex: 1,
    justifyContent: "space-between",
  },
  storeName: {
    fontSize: 18,
    fontFamily: Fonts.primary,
    fontWeight: Fonts.weights.semiBold,
    color: Colors.darkGray,
    marginBottom: vs(5),
  },
  storeDescription: {
    fontSize: 14,
    fontFamily: Fonts.primary,
    fontWeight: Fonts.weights.normal,
    color: Colors.textSecondary,
    lineHeight: 14 * 1.4,
    flex: 1,
  },
  storeRating: {
    fontSize: 14,
    fontFamily: Fonts.primary,
    fontWeight: Fonts.weights.medium,
    color: Colors.primary,
  },
  
  // Popular Picks - Figma: x:0, y:1332, width:440, height:100
  popularPicksScrollView: {
    paddingLeft: s(20),
    marginBottom: vs(30), // Increased for proper spacing to fresh finds
  },
  popularPickCard: {
    width: s(180),
    height: vs(80),
    backgroundColor: Colors.white,
    borderRadius: s(15),
    marginRight: s(20),
    padding: s(15),
    justifyContent: "center",
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: vs(2) },
    shadowOpacity: 0.1,
    shadowRadius: s(5),
    elevation: 2,
  },
  popularPickTitle: {
    fontSize: 16,
    fontFamily: Fonts.primary,
    fontWeight: Fonts.weights.medium,
    color: Colors.darkGray,
    marginBottom: vs(4),
  },
  popularPickCategory: {
    fontSize: 12,
    fontFamily: Fonts.primary,
    fontWeight: Fonts.weights.normal,
    color: Colors.textSecondary,
  },
  
  // End Message - Figma: x:174, y:1750, width:93, height:22
  endMessage: {
    fontSize: 12,
    fontFamily: Fonts.primary,
    fontWeight: Fonts.weights.medium,
    color: "rgba(0, 0, 0, 0.5)",
    textAlign: "center",
    marginVertical: vs(20),
    lineHeight: 12 * 1.83,
  },
  
  // Navigation Bar Spacer - Figma: y:838, height:120 
  // This represents the space where the nav bar appears in the design
  navigationBarSpacer: {
    height: vs(120),
    marginTop: vs(50), // Space between stores and nav bar area
    marginBottom: vs(250), // Adjusted space from nav bar to popular picks section
  },
  
  bottomPadding: {
    height: vs(120), // Space for bottom navigation
  },
});