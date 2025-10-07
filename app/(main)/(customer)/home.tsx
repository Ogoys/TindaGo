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
import { s, vs } from "../../../src/constants/responsive";
import { BottomNavigation } from "../../../src/components/ui";

/**
 * CUSTOMER HOME PAGE - PIXEL-PERFECT FIGMA REBUILD
 *
 * Figma File: 8I1Nr3vQZllDDknSevstvH
 * Node: 759-203 (Home Page)
 * Baseline: 440x1827
 *
 * Complete rebuild from scratch matching exact Figma design
 */

export default function HomeScreen() {
  // Category data with exact Figma specs
  // Figma: 759:213 - Category section with horizontal scroll
  const categoryData = [
    {
      id: "all",
      label: "All",
      icon: require("../../../src/assets/images/customer-home/categories/all-icon.png"),
      active: true
    },
    {
      id: "fruits-vegetables",
      label: "Fruits &\nVegetables",
      icon: require("../../../src/assets/images/customer-home/categories/fruits-vegetables-icon.png")
    },
    {
      id: "dairy-bakery",
      label: "Dairy &\nBakery",
      icon: require("../../../src/assets/images/customer-home/categories/dairy-bakery-icon.png")
    },
    {
      id: "snacks",
      label: "Snacks",
      icon: require("../../../src/assets/images/customer-home/categories/snacks-icon.png")
    },
    {
      id: "beverages",
      label: "Baverages",
      icon: require("../../../src/assets/images/customer-home/categories/beverages-icon.png")
    },
    {
      id: "personal-care",
      label: "Personal\nCare",
      icon: require("../../../src/assets/images/customer-home/categories/personal-care-icon.png")
    },
    {
      id: "home-kitchen",
      label: "Home &\nKitchen",
      icon: require("../../../src/assets/images/customer-home/categories/home-kitchen-icon.png")
    },
    {
      id: "home-care",
      label: "Home \nCare",
      icon: require("../../../src/assets/images/customer-home/categories/home-care-icon.png")
    },
    {
      id: "baby-care",
      label: "Baby\nCare",
      icon: require("../../../src/assets/images/customer-home/categories/baby-care-icon.png")
    },
    {
      id: "coffee",
      label: "Coffee",
      icon: require("../../../src/assets/images/customer-home/categories/coffee-icon.png")
    },
  ];

  // Best Selling Products data
  // Figma: 759:266 - Product card structure
  const bestSellingProducts = [
    { id: "1", name: "Garlic", shop: "(Local shop)", weight: "500g", image: require("../../../src/assets/images/customer-home/products/garlic.png") },
    { id: "2", name: "Garlic", shop: "(Local shop)", weight: "500g", image: require("../../../src/assets/images/customer-home/products/garlic.png") },
    { id: "3", name: "Garlic", shop: "(Local shop)", weight: "500g", image: require("../../../src/assets/images/customer-home/products/garlic.png") },
    { id: "4", name: "Garlic", shop: "(Local shop)", weight: "500g", image: require("../../../src/assets/images/customer-home/products/garlic.png") },
  ];

  // Featured Stores data
  // Figma: 759:487 - Store card structure
  const featuredStores = [
    { id: "1", name: "Golis Sari-sari", rating: "5.0", distance: "1.3 km" },
    { id: "2", name: "Golis Sari-sari", rating: "5.0", distance: "1.3 km" },
    { id: "3", name: "Golis Sari-sari", rating: "5.0", distance: "1.3 km" },
    { id: "4", name: "Golis Sari-sari", rating: "5.0", distance: "1.3 km" },
  ];

  // Popular Picks data
  // Figma: 759:520 - Popular picks card structure
  const popularPicks = [
    { id: "1", name: "Brocoli", description: "Fresh from farm", price: "₱100", image: require("../../../src/assets/images/customer-home/popular-picks/broccoli.png") },
    { id: "2", name: "Brocoli", description: "Fresh from farm", price: "₱100", image: require("../../../src/assets/images/customer-home/popular-picks/broccoli.png") },
    { id: "3", name: "Brocoli", description: "Fresh from farm", price: "₱100", image: require("../../../src/assets/images/customer-home/popular-picks/broccoli.png") },
    { id: "4", name: "Brocoli", description: "Fresh from farm", price: "₱100", image: require("../../../src/assets/images/customer-home/popular-picks/broccoli.png") },
  ];

  // Fresh Finds Products data
  const freshFindsProducts = [
    { id: "1", name: "Garlic", shop: "(Local shop)", weight: "500g", image: require("../../../src/assets/images/customer-home/products/garlic.png") },
    { id: "2", name: "Garlic", shop: "(Local shop)", weight: "500g", image: require("../../../src/assets/images/customer-home/products/garlic.png") },
    { id: "3", name: "Garlic", shop: "(Local shop)", weight: "500g", image: require("../../../src/assets/images/customer-home/products/garlic.png") },
    { id: "4", name: "Garlic", shop: "(Local shop)", weight: "500g", image: require("../../../src/assets/images/customer-home/products/garlic.png") },
  ];

  /**
   * PRODUCT CARD COMPONENT
   * Figma: 759:266 - Product0
   * Dimensions: 120x222px
   * Contains: Background, Picture, Label, Add Button
   */
  const ProductCard = ({ name, shop, weight, image }: { name: string; shop: string; weight: string; image: any }) => (
    <TouchableOpacity
      style={styles.productCard}
      onPress={() => router.push("/product-details" as any)}
      activeOpacity={0.8}
    >
      {/* Background - Figma: 759:267 Rectangle 16 */}
      <View style={styles.productCardBackground} />

      {/* Picture Container - Figma: 759:268 */}
      <View style={styles.productPictureContainer}>
        {/* Gray background - Figma: 759:269 Rectangle 17 */}
        <View style={styles.productPictureBackground} />
        {/* Product Image - Figma: 759:270 */}
        <Image source={image} style={styles.productImage} resizeMode="contain" />
      </View>

      {/* Label Group - Figma: 759:271 */}
      <View style={styles.productLabelContainer}>
        {/* Product Name - Figma: 759:272 */}
        <Text style={styles.productName}>{name}</Text>
        {/* Shop Name - Figma: 759:273 */}
        <Text style={styles.productShop}>{shop}</Text>
        {/* Weight - Figma: 759:274 */}
        <Text style={styles.productWeight}>{weight}</Text>
      </View>

      {/* Add Button - Figma: 759:275 */}
      <TouchableOpacity style={styles.productAddButton}>
        {/* Button Background - Figma: 759:276 Rectangle 19 */}
        <View style={styles.productAddButtonBackground} />
        {/* Plus Icon - Figma: 759:277 */}
        <Image
          source={require("../../../src/assets/images/customer-home/products/plus-icon.png")}
          style={styles.productPlusIcon}
        />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  /**
   * STORE CARD COMPONENT
   * Figma: 759:487 - Store
   * Dimensions: 400x150px
   * Contains: Background, Store Image, Logo, Name, Rating, Distance
   */
  const StoreCard = ({ name, rating, distance }: { name: string; rating: string; distance: string }) => (
    <View style={styles.storeCard}>
      {/* White Background - Figma: 759:488 Rectangle 20 */}
      <View style={styles.storeCardWhiteBackground} />

      {/* Store Image Background - Figma: 759:489 Rectangle 21 */}
      <Image
        source={require("../../../src/assets/images/customer-home/stores/store-background.png")}
        style={styles.storeImageBackground}
        resizeMode="cover"
      />

      {/* Store Logo - Figma: 759:490 Ellipse 8 */}
      <View style={styles.storeLogoContainer}>
        <Image
          source={require("../../../src/assets/images/customer-home/stores/store-logo.png")}
          style={styles.storeLogo}
          resizeMode="cover"
        />
      </View>

      {/* Store Name - Figma: 759:491 */}
      <Text style={styles.storeName}>{name}</Text>

      {/* Rating and Distance Container */}
      <View style={styles.storeMetaContainer}>
        {/* Star Icon - Figma: 759:494 */}
        <Image
          source={require("../../../src/assets/images/customer-home/stores/star-icon.png")}
          style={styles.storeStarIcon}
        />
        {/* Rating - Figma: 759:493 */}
        <Text style={styles.storeRating}>{rating}</Text>
        {/* Distance - Figma: 759:492 */}
        <Text style={styles.storeDistance}>{distance}</Text>
      </View>
    </View>
  );

  /**
   * POPULAR PICK CARD COMPONENT
   * Figma: 759:520 - Popular picks
   * Dimensions: 180x80px
   * Contains: Background, Picture, Labels (Name, Description, Price)
   */
  const PopularPickCard = ({ name, description, price, image }: { name: string; description: string; price: string; image: any }) => (
    <TouchableOpacity style={styles.popularPickCard} activeOpacity={0.8}>
      {/* Background - Figma: 759:521 Rectangle 22 */}
      <View style={styles.popularPickBackground} />

      {/* Picture Container - Figma: 759:522 */}
      <View style={styles.popularPickPictureContainer}>
        {/* Picture Background - Figma: 759:523 Rectangle 24 */}
        <View style={styles.popularPickPictureBackground} />
        {/* Product Image - Figma: 759:524 */}
        <Image source={image} style={styles.popularPickImage} resizeMode="contain" />
      </View>

      {/* Labels Group - Figma: 759:525 */}
      <View style={styles.popularPickLabels}>
        {/* Product Name - Figma: 759:527 */}
        <Text style={styles.popularPickName}>{name}</Text>
        {/* Description - Figma: 759:528 */}
        <Text style={styles.popularPickDescription}>{description}</Text>
        {/* Price - Figma: 759:526 */}
        <Text style={styles.popularPickPrice}>{price}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor="#02545F" />

      {/* HEADER SECTION - Figma: x:0, y:0, width:440, height:230 */}
      <View style={styles.headerSection}>
        {/* Header Background Image - Figma: 759:204 Rectangle 11 */}
        <Image
          source={require("../../../src/assets/images/customer-home/header-background.png")}
          style={styles.headerBackground}
          resizeMode="cover"
        />

        {/* Profile Section - Figma: 759:593, x:20, y:74, width:179, height:40 */}
        <View style={styles.profileSection}>
          {/* Logo - Figma: 759:594 */}
          <View style={styles.profileLogo}>
            <Text style={styles.profileLogoText}>DO</Text>
          </View>

          <View style={styles.profileInfo}>
            {/* User Name - Figma: 759:599 */}
            <Text style={styles.profileName}>Daniel Oppa</Text>

            {/* Location - Figma: 759:6373 */}
            <View style={styles.profileLocation}>
              {/* Location Icon - Figma: 759:598 */}
              <Image
                source={require("../../../src/assets/images/customer-home/location-icon.png")}
                style={styles.locationIcon}
              />
              {/* Location Text - Figma: 759:597 */}
              <Text style={styles.locationText}>Jacinto st. Davao City</Text>
            </View>
          </View>
        </View>

        {/* Notification Button - Figma: 759:205, x:375, y:74, width:40, height:40 */}
        <TouchableOpacity style={styles.notificationButton}>
          {/* Circle Background - Figma: 759:206 */}
          <View style={styles.notificationCircle} />
          {/* Notification Icon - Figma: 759:207 */}
          <Image
            source={require("../../../src/assets/images/customer-home/notification-icon.png")}
            style={styles.notificationIcon}
          />
        </TouchableOpacity>

        {/* Search Bar - Figma: 759:208, x:20, y:134, width:400, height:50 */}
        <View style={styles.searchContainer}>
          {/* Search Background - Figma: 759:209 Rectangle 12 */}
          <View style={styles.searchBackground} />
          {/* Search Icon - Figma: 759:210 */}
          <Image
            source={require("../../../src/assets/images/customer-home/search-icon.png")}
            style={styles.searchIcon}
          />
          {/* Search Input - Figma: 759:211 */}
          <TextInput
            placeholder='Search for "Items"'
            placeholderTextColor="#7A7B7B"
            style={styles.searchInput}
          />
        </View>
      </View>

      {/* SCROLLABLE CONTENT */}
      <ScrollView
        style={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContentContainer}
      >
        {/* CATEGORY SECTION - Figma: 759:212, x:1, y:198, width:439, height:90 */}
        <View style={styles.categorySection}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryScrollContent}
          >
            {categoryData.map((category, index) => (
              <TouchableOpacity key={category.id} style={styles.categoryItem}>
                {/* Category Icon Circle - Figma: Ellipse (50x50) */}
                <View style={[
                  styles.categoryIconCircle,
                  category.active && styles.categoryIconCircleActive
                ]}>
                  <Image source={category.icon} style={styles.categoryIcon} resizeMode="contain" />
                </View>
                {/* Category Label */}
                <Text style={[
                  styles.categoryLabel,
                  category.active && styles.categoryLabelActive
                ]}>
                  {category.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* BEST SELLING SECTION - Figma: 759:256, x:23, y:296 */}
        <View style={styles.sectionHeader}>
          {/* Section Title - Figma: 759:257 */}
          <Text style={styles.sectionTitle}>Best Selling</Text>
          {/* See More - Figma: 759:258 */}
          <TouchableOpacity onPress={() => router.push("/(main)/(customer)/see-more")}>
            <Text style={styles.seeMoreText}>See more</Text>
          </TouchableOpacity>
        </View>

        {/* BEST SELLING PRODUCTS - Figma: 759:265, x:1, y:330, width:440, height:244 */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.productsSection}
          contentContainerStyle={styles.productsScrollContent}
        >
          {bestSellingProducts.map((product) => (
            <ProductCard
              key={product.id}
              name={product.name}
              shop={product.shop}
              weight={product.weight}
              image={product.image}
            />
          ))}
        </ScrollView>

        {/* FEATURED STORES SECTION - Figma: 759:259, x:23, y:584 */}
        <View style={styles.sectionHeader}>
          {/* Section Title - Figma: 759:260 */}
          <Text style={styles.sectionTitle}>Feature store near you</Text>
          {/* See More - Figma: 759:261 */}
          <TouchableOpacity>
            <Text style={styles.seeMoreText}>See more</Text>
          </TouchableOpacity>
        </View>

        {/* FEATURED STORES - Figma: 759:486, x:20, y:628, width:400, height:660 */}
        <View style={styles.storesSection}>
          {featuredStores.map((store) => (
            <StoreCard
              key={store.id}
              name={store.name}
              rating={store.rating}
              distance={store.distance}
            />
          ))}
        </View>

        {/* MOST POPULAR PICKS SECTION - Figma: 759:262, x:23, y:1308 */}
        {/* MOVED BELOW FEATURED STORES TO REDUCE EMPTY BLACK SPACE */}
        <View style={styles.sectionHeader}>
          {/* Section Title - Figma: 759:263 */}
          <Text style={styles.sectionTitle}>Most popular picks</Text>
          {/* See More - Figma: 759:264 */}
          <TouchableOpacity onPress={() => router.push("/(main)/(customer)/see-more")}>
            <Text style={styles.seeMoreText}>See more</Text>
          </TouchableOpacity>
        </View>

        {/* POPULAR PICKS - Figma: 759:519, x:0, y:1332, width:440, height:100 */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.popularPicksSection}
          contentContainerStyle={styles.popularPicksScrollContent}
        >
          {popularPicks.map((pick) => (
            <PopularPickCard
              key={pick.id}
              name={pick.name}
              description={pick.description}
              price={pick.price}
              image={pick.image}
            />
          ))}
        </ScrollView>

        {/* FRESH FINDS SECTION - Figma: 759:483, x:24, y:1442 */}
        <View style={styles.sectionHeader}>
          {/* Section Title - Figma: 759:484 */}
          <Text style={styles.sectionTitle}>Fresh finds of the day</Text>
          {/* See More - Figma: 759:485 */}
          <TouchableOpacity onPress={() => router.push("/(main)/(customer)/see-more")}>
            <Text style={styles.seeMoreText}>See more</Text>
          </TouchableOpacity>
        </View>

        {/* FRESH FINDS PRODUCTS - Figma: 759:374, x:0, y:1486, width:440, height:244 */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.productsSection}
          contentContainerStyle={styles.productsScrollContent}
        >
          {freshFindsProducts.map((product) => (
            <ProductCard
              key={product.id}
              name={product.name}
              shop={product.shop}
              weight={product.weight}
              image={product.image}
            />
          ))}
        </ScrollView>

        {/* END MESSAGE - Figma: 759:592, x:174, y:1750 */}
        <Text style={styles.endMessage}>That&apos;s all for now!</Text>

        {/* Bottom Padding for Tab Navigation */}
        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* BOTTOM NAVIGATION BAR - Figma: 759:610 */}
      <BottomNavigation activeTab="home" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  // CONTAINER
  container: {
    flex: 1,
    backgroundColor: "#F4F6F6", // Figma: fill_378Q6F
  },

  // ============ HEADER SECTION ============
  // Figma: x:0, y:0, width:440, height:230
  headerSection: {
    width: s(440),
    height: vs(230),
    position: "relative",
  },

  // Header Background - Figma: 759:204, width:440, height:230
  headerBackground: {
    position: "absolute",
    top: 0,
    left: 0,
    width: s(440),
    height: vs(230),
  },

  // Profile Section - Figma: 759:593, x:20, y:74, width:179, height:40
  profileSection: {
    position: "absolute",
    left: s(20),
    top: vs(74),
    width: s(179),
    height: vs(40),
    flexDirection: "row",
    alignItems: "center",
  },

  // Profile Logo - Figma: 759:594, width:40, height:40
  profileLogo: {
    width: s(40),
    height: s(40),
    borderRadius: s(20),
    backgroundColor: "#3B82F6", // Figma: fill_ZGKKRY
    justifyContent: "center",
    alignItems: "center",
  },

  // Profile Logo Text - Figma: 759:596
  profileLogoText: {
    fontFamily: "Clash Grotesk Variable",
    fontWeight: "500",
    fontSize: 16,
    lineHeight: 16 * 1.23,
    color: "#FFFFFF",
  },

  profileInfo: {
    marginLeft: s(10),
    flex: 1,
  },

  // Profile Name - Figma: 759:599, x:70, y:74
  profileName: {
    fontFamily: "Clash Grotesk Variable",
    fontWeight: "500",
    fontSize: 20,
    lineHeight: 20 * 1.1,
    color: "#FFFFFF",
  },

  // Profile Location - Figma: 759:6373, x:70, y:92, width:129, height:22
  profileLocation: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: vs(4),
  },

  // Location Icon - Figma: 759:598, width:15, height:15
  locationIcon: {
    width: s(15),
    height: s(15),
    marginRight: s(5),
  },

  // Location Text - Figma: 759:597
  locationText: {
    fontFamily: "Clash Grotesk Variable",
    fontWeight: "400",
    fontSize: 12,
    lineHeight: 12 * 1.833,
    color: "#FFFFFF",
  },

  // Notification Button - Figma: 759:205, x:375, y:74, width:40, height:40
  notificationButton: {
    position: "absolute",
    left: s(375),
    top: vs(74),
    width: s(40),
    height: s(40),
  },

  // Notification Circle - Figma: 759:206, Ellipse with shadow
  notificationCircle: {
    position: "absolute",
    width: s(40),
    height: s(40),
    borderRadius: s(20),
    backgroundColor: "#FFFFFF",
    shadowColor: "rgba(0, 0, 0, 0.25)",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: s(10),
    elevation: 10,
  },

  // Notification Icon - Figma: 759:207, x:7, y:7, width:25, height:25
  notificationIcon: {
    position: "absolute",
    left: s(7),
    top: s(7),
    width: s(25),
    height: s(25),
  },

  // Search Container - Figma: 759:208, x:20, y:134, width:400, height:50
  searchContainer: {
    position: "absolute",
    left: s(20),
    top: vs(134),
    width: s(400),
    height: vs(50),
    flexDirection: "row",
    alignItems: "center",
  },

  // Search Background - Figma: 759:209, Rectangle 12 with shadow
  searchBackground: {
    position: "absolute",
    width: s(400),
    height: vs(50),
    backgroundColor: "#FFFFFF",
    borderRadius: s(20),
    shadowColor: "rgba(0, 0, 0, 0.25)",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: s(10),
    elevation: 10,
  },

  // Search Icon - Figma: 759:210, x:20, y:15, width:20, height:20
  searchIcon: {
    marginLeft: s(20),
    width: s(20),
    height: s(20),
    zIndex: 1,
  },

  // Search Input - Figma: 759:211, x:60, y:15
  searchInput: {
    flex: 1,
    marginLeft: s(20),
    fontFamily: "Clash Grotesk Variable",
    fontWeight: "500",
    fontSize: 16,
    lineHeight: 16 * 1.375,
    color: "#7A7B7B",
    zIndex: 1,
  },

  // ============ SCROLLABLE CONTENT ============
  scrollContent: {
    flex: 1,
  },

  scrollContentContainer: {
    paddingBottom: vs(100), // Space for bottom navigation
  },

  // ============ CATEGORY SECTION ============
  // Figma: 759:212, x:1, y:198, width:439, height:90
  categorySection: {
    marginTop: vs(14), // Adjusted from 198-184=14
    height: vs(90),
  },

  categoryScrollContent: {
    paddingLeft: s(20),
    paddingRight: s(20),
  },

  // Category Item - each category is 50px circle + label
  categoryItem: {
    alignItems: "center",
    marginRight: s(10),
    width: s(70), // Accommodates multi-line text
  },

  // Category Icon Circle - Figma: Ellipse 50x50 with shadow
  categoryIconCircle: {
    width: s(50),
    height: s(50),
    borderRadius: s(25),
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "rgba(0, 0, 0, 0.25)",
    shadowOffset: { width: 0, height: vs(4) },
    shadowOpacity: 1,
    shadowRadius: s(10),
    elevation: 10,
  },

  categoryIconCircleActive: {
    backgroundColor: "#3BB77E", // Figma: fill_GG0VKA
  },

  // Category Icon - Figma: 30x30 inside circle
  categoryIcon: {
    width: s(30),
    height: s(30),
  },

  // Category Label - Figma: below circle, y:50
  categoryLabel: {
    marginTop: vs(4),
    fontFamily: "Clash Grotesk Variable",
    fontWeight: "500",
    fontSize: 14,
    lineHeight: 14 * 1.23,
    color: "#1E1E1E",
    textAlign: "center",
    width: s(70),
  },

  categoryLabelActive: {
    color: "#3BB77E",
  },

  // ============ SECTION HEADERS ============
  // Figma: x:23, various y positions, width:395, height:24
  sectionHeader: {
    marginTop: vs(20),
    marginLeft: s(23),
    marginRight: s(23),
    marginBottom: vs(10),
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    height: vs(24),
  },

  // Section Title - Figma: fontWeight:600, fontSize:20
  sectionTitle: {
    fontFamily: "Clash Grotesk Variable",
    fontWeight: "600",
    fontSize: 20,
    lineHeight: 20 * 1.1,
    color: "#1E1E1E",
  },

  // See More Text - Figma: fontWeight:500, fontSize:14
  seeMoreText: {
    fontFamily: "Clash Grotesk Variable",
    fontWeight: "500",
    fontSize: 14,
    lineHeight: 14 * 1.571,
    color: "rgba(0, 0, 0, 0.5)",
  },

  // ============ PRODUCTS SECTION ============
  // Figma: 759:265, x:1, y:330, width:440, height:244
  productsSection: {
    height: vs(244),
    marginBottom: vs(10),
  },

  productsScrollContent: {
    paddingLeft: s(23),
    paddingRight: s(23),
  },

  // Product Card - Figma: 759:266, width:120, height:222
  productCard: {
    width: s(120),
    height: vs(222),
    marginRight: s(20),
    position: "relative",
  },

  // Product Card Background - Figma: 759:267, Rectangle 16 with shadow
  productCardBackground: {
    position: "absolute",
    width: s(120),
    height: vs(222),
    backgroundColor: "#FFFFFF",
    borderRadius: s(20),
    shadowColor: "rgba(0, 0, 0, 0.25)",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: s(10),
    elevation: 10,
  },

  // Product Picture Container - Figma: 759:268, x:0, y:12, width:120, height:88
  productPictureContainer: {
    position: "absolute",
    top: vs(12),
    left: 0,
    width: s(120),
    height: vs(88),
  },

  // Product Picture Background - Figma: 759:269, x:10, y:0, width:100, height:88
  productPictureBackground: {
    position: "absolute",
    left: s(10),
    top: 0,
    width: s(100),
    height: vs(88),
    backgroundColor: "#E9E9E9",
    borderRadius: s(10),
    shadowColor: "rgba(0, 0, 0, 0.25)",
    shadowOffset: { width: 0, height: vs(4) },
    shadowOpacity: 1,
    shadowRadius: s(10),
    elevation: 10,
  },

  // Product Image - Figma: 759:270, x:0, y:4, width:120, height:80
  productImage: {
    position: "absolute",
    left: 0,
    top: vs(4),
    width: s(120),
    height: vs(80),
  },

  // Product Label Container - Figma: 759:271, x:27, y:111, width:65, height:66
  productLabelContainer: {
    position: "absolute",
    left: s(27),
    top: vs(111),
    width: s(65),
    height: vs(66),
  },

  // Product Name - Figma: 759:272, x:12, y:0, fontSize:16
  productName: {
    position: "absolute",
    left: s(12),
    top: 0,
    fontFamily: "Clash Grotesk Variable",
    fontWeight: "500",
    fontSize: 16,
    lineHeight: 16 * 1.375,
    color: "#1E1E1E",
  },

  // Product Shop - Figma: 759:273, x:0, y:22, fontSize:12
  productShop: {
    position: "absolute",
    left: 0,
    top: vs(22),
    fontFamily: "Clash Grotesk Variable",
    fontWeight: "500",
    fontSize: 12,
    lineHeight: 12 * 1.833,
    color: "#1E1E1E",
  },

  // Product Weight - Figma: 759:274, x:17, y:44, fontSize:12
  productWeight: {
    position: "absolute",
    left: s(17),
    top: vs(44),
    fontFamily: "Clash Grotesk Variable",
    fontWeight: "500",
    fontSize: 12,
    lineHeight: 12 * 1.833,
    color: "rgba(0, 0, 0, 0.5)",
  },

  // Product Add Button - Figma: 759:275, x:10, y:179, width:100, height:30
  productAddButton: {
    position: "absolute",
    left: s(10),
    top: vs(179),
    width: s(100),
    height: vs(30),
    justifyContent: "center",
    alignItems: "center",
  },

  // Add Button Background - Figma: 759:276, Rectangle 19 with shadow
  productAddButtonBackground: {
    position: "absolute",
    width: s(100),
    height: vs(30),
    backgroundColor: "#EBF3DA",
    borderRadius: s(5),
    shadowColor: "rgba(0, 0, 0, 0.25)",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: s(5),
    elevation: 5,
  },

  // Plus Icon - Figma: 759:277, x:45, y:12, width:10, height:10
  productPlusIcon: {
    width: s(10),
    height: s(10),
  },

  // ============ STORES SECTION ============
  // Figma: 759:486, x:20, y:628, width:400, height:660
  storesSection: {
    marginLeft: s(20),
    marginRight: s(20),
    marginBottom: vs(20),
  },

  // Store Card - Figma: 759:487, width:400, height:150
  storeCard: {
    width: s(400),
    height: vs(150),
    marginBottom: vs(20),
    position: "relative",
    borderRadius: s(20),
    overflow: "hidden",
  },

  // Store White Background - Figma: 759:488, Rectangle 20
  storeCardWhiteBackground: {
    position: "absolute",
    width: s(399),
    height: vs(150),
    backgroundColor: "#FFFFFF",
    borderRadius: s(20),
    shadowColor: "rgba(0, 0, 0, 0.25)",
    shadowOffset: { width: 0, height: vs(4) },
    shadowOpacity: 1,
    shadowRadius: s(10),
    elevation: 10,
  },

  // Store Image Background - Figma: 759:489, x:1, y:0, width:399, height:90
  storeImageBackground: {
    position: "absolute",
    left: s(1),
    top: 0,
    width: s(399),
    height: vs(90),
    borderTopLeftRadius: s(20),
    borderTopRightRadius: s(20),
  },

  // Store Logo Container - Figma: 759:490, x:10.97, y:50, width:29.93, height:30
  storeLogoContainer: {
    position: "absolute",
    left: s(11),
    top: vs(50),
    width: s(30),
    height: s(30),
    borderRadius: s(15),
    backgroundColor: "#3BB77E",
    overflow: "hidden",
  },

  storeLogo: {
    width: s(30),
    height: s(30),
  },

  // Store Name - Figma: 759:491, x:10.97, y:96
  storeName: {
    position: "absolute",
    left: s(11),
    top: vs(96),
    fontFamily: "Clash Grotesk Variable",
    fontWeight: "500",
    fontSize: 20,
    lineHeight: 20 * 1.1,
    color: "#1E1E1E",
  },

  // Store Meta Container - Figma: y:117
  storeMetaContainer: {
    position: "absolute",
    left: s(11),
    top: vs(117),
    flexDirection: "row",
    alignItems: "center",
  },

  // Store Star Icon - Figma: 759:494, x:10.97, y:123, width:9.98, height:10
  storeStarIcon: {
    width: s(10),
    height: s(10),
    marginTop: vs(6),
  },

  // Store Rating - Figma: 759:493, x:25.94, y:117
  storeRating: {
    marginLeft: s(5),
    fontFamily: "Clash Grotesk Variable",
    fontWeight: "400",
    fontSize: 12,
    lineHeight: 12 * 1.833,
    color: "rgba(0, 0, 0, 0.5)",
  },

  // Store Distance - Figma: 759:492, x:52.87, y:117
  storeDistance: {
    marginLeft: s(10),
    fontFamily: "Clash Grotesk Variable",
    fontWeight: "400",
    fontSize: 12,
    lineHeight: 12 * 1.833,
    color: "rgba(0, 0, 0, 0.5)",
  },

  // ============ POPULAR PICKS SECTION ============
  // Figma: 759:519, x:0, y:1332, width:440, height:100
  popularPicksSection: {
    height: vs(100),
    marginBottom: vs(20),
  },

  popularPicksScrollContent: {
    paddingLeft: s(20),
    paddingRight: s(20),
  },

  // Popular Pick Card - Figma: 759:520, width:180, height:80
  popularPickCard: {
    width: s(180),
    height: vs(80),
    marginRight: s(10),
    position: "relative",
  },

  // Popular Pick Background - Figma: 759:521, Rectangle 22 with shadow
  popularPickBackground: {
    position: "absolute",
    width: s(180),
    height: vs(80),
    backgroundColor: "#FFFFFF",
    borderRadius: s(20),
    shadowColor: "rgba(0, 0, 0, 0.25)",
    shadowOffset: { width: 0, height: vs(4) },
    shadowOpacity: 1,
    shadowRadius: s(10),
    elevation: 10,
  },

  // Popular Pick Picture Container - Figma: 759:522, x:10, y:10, width:60, height:60
  popularPickPictureContainer: {
    position: "absolute",
    left: s(10),
    top: vs(10),
    width: s(60),
    height: s(60),
  },

  // Popular Pick Picture Background - Figma: 759:523, Rectangle 24 with shadow
  popularPickPictureBackground: {
    position: "absolute",
    width: s(60),
    height: s(60),
    backgroundColor: "#FFFFFF",
    borderRadius: s(16),
    shadowColor: "rgba(0, 0, 0, 0.25)",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: s(4),
    elevation: 4,
  },

  // Popular Pick Image - Figma: 759:524, x:13, y:10, width:33, height:40
  popularPickImage: {
    position: "absolute",
    left: s(13),
    top: s(10),
    width: s(33),
    height: s(40),
  },

  // Popular Pick Labels - Figma: 759:525, x:80, y:13, width:75, height:55
  popularPickLabels: {
    position: "absolute",
    left: s(80),
    top: vs(13),
    width: s(75),
    height: vs(55),
  },

  // Popular Pick Name - Figma: 759:527, x:0, y:0, fontSize:16
  popularPickName: {
    position: "absolute",
    top: 0,
    fontFamily: "Clash Grotesk Variable",
    fontWeight: "500",
    fontSize: 16,
    lineHeight: 16 * 1.375,
    color: "#1E1E1E",
  },

  // Popular Pick Description - Figma: 759:528, x:0, y:16, fontSize:10
  popularPickDescription: {
    position: "absolute",
    top: vs(16),
    fontFamily: "Clash Grotesk Variable",
    fontWeight: "500",
    fontSize: 10,
    lineHeight: 10 * 2.2,
    color: "rgba(0, 0, 0, 0.5)",
  },

  // Popular Pick Price - Figma: 759:526, x:0, y:33, fontSize:12
  popularPickPrice: {
    position: "absolute",
    top: vs(33),
    fontFamily: "Clash Grotesk Variable",
    fontWeight: "500",
    fontSize: 12,
    lineHeight: 12 * 1.833,
    color: "#1E1E1E",
  },

  // ============ END MESSAGE ============
  // Figma: 759:592, x:174, y:1750
  endMessage: {
    marginTop: vs(20),
    fontFamily: "Clash Grotesk Variable",
    fontWeight: "500",
    fontSize: 12,
    lineHeight: 12 * 1.833,
    color: "rgba(0, 0, 0, 0.5)",
    textAlign: "center",
  },

  // Bottom Padding
  bottomPadding: {
    height: vs(20),
  },
});
