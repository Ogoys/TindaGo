import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  StatusBar,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { ref, get, query, orderByChild, equalTo } from "firebase/database";
import { database } from "../../../FirebaseConfig";
import { s, vs, ms } from "../../../src/constants/responsive";
import { BottomNavigation, Toast, ProductCard } from "../../../src/components/ui";
import { DevTestButton } from "../../../src/components/dev/DevTestButton";
import { useUser } from "../../../src/contexts/UserContext";
import { addToCart, addToCartWithValidation } from "../../../src/api/cart";
import { getProductImageSource } from "../../../src/lib/helpers/imageHelper";
import { useCartCount } from "../../../src/hooks";
import { getSelectedStoreId } from "../../../src/lib/storage/selectedStore";
import * as Location from 'expo-location';

/**
 * CUSTOMER HOME PAGE - PIXEL-PERFECT FIGMA REBUILD
 *
 * Figma File: 8I1Nr3vQZllDDknSevstvH
 * Node: 903-203 (Home Page)
 * Baseline: 440x956 (viewport), Total scrollable height: 1827px
 *
 * Complete rebuild from scratch matching exact Figma design
 * Uses standard TindaGo baseline (440x956) for responsive scaling
 *
 * Key Sections:
 * - Header: (0, 0, 440x230) - Background image, profile, notification, search
 * - Category: (0, 198, 440x90) - Horizontal scroll with category icons
 * - Best Selling: (23, 296) - Product carousel
 * - Featured Stores: (23, 584) - Store cards list
 * - Most Popular Picks: (23, 1308) - Popular picks carousel
 * - Fresh Finds: (24, 1442) - Product carousel
 */

// Product interface matching Firebase schema
interface Product {
  id: string;
  productName: string;
  description: string;
  category: string;
  price: number;
  quantity: number;
  productSize: string;
  unit: string;
  productImage: string;
  storeOwnerId: string;
  storeId: string;
  storeName: string;
  storeOwnerName: string;
  createdAt: string;
  updatedAt: string;
  status: 'available' | 'out_of_stock';
}

// Store interface matching Firebase schema
interface Store {
  id: string;
  storeName: string;
  ownerName: string;
  logo?: string;
  coverImage?: string;
  address?: string;
  city?: string;
  description?: string;
  status: 'pending' | 'approved' | 'active' | 'rejected' | 'suspended';
  isOpen?: boolean; // Store open/close status
}

export default function HomeScreen() {
  // Get user data from context
  const { user } = useUser();

  // Get cart count for badge
  const cartCount = useCartCount(user?.id);

  // State for Firebase data
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [allStores, setAllStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Selected store personalization
  const [selectedStoreId, setSelectedStoreIdState] = useState<string | null>(null);

  // State for quick add to cart
  const [addingProductId, setAddingProductId] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // User location state
  const [userAddress, setUserAddress] = useState<string>('Getting location...');

  // Load selected store id (personalization) with Firebase sync
  useEffect(() => {
    (async () => {
      // Try Firebase first (cross-device), fallback to local
      const id = await getSelectedStoreId(user?.id);
      setSelectedStoreIdState(id);
    })();
  }, [user?.id]);

  // Get user's current location
  useEffect(() => {
    (async () => {
      try {
        // Check permission
        const { status } = await Location.getForegroundPermissionsAsync();
        
        if (status !== 'granted') {
          setUserAddress('Location permission needed');
          return;
        }

        // Get current position with highest accuracy for better reverse geocoding
        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Highest, // Use highest for better street-level accuracy
        });

        const coords = {
          lat: location.coords.latitude,
          lng: location.coords.longitude,
          accuracy: location.coords.accuracy,
        };

        console.log('📍 GPS Coordinates:', coords);

        // Reverse geocode to get address
        const addresses = await Location.reverseGeocodeAsync({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });

        console.log('🗺️ Reverse Geocoding Results:', addresses);

        if (addresses && addresses.length > 0) {
          // Try all results to find the best street-level address
          let bestAddress = addresses[0];
          
          // Prefer addresses with street names over generic areas
          for (const addr of addresses) {
            if (addr.street && addr.street !== bestAddress.street) {
              bestAddress = addr;
              break;
            }
          }

          const { street, name, streetNumber, district, subregion, city, region } = bestAddress;
          
          // Helper function to generate Plus Code (Open Location Code)
          const generatePlusCode = (lat: number, lng: number): string => {
            // Simple Plus Code generation for display
            // Format: XXXX+XX City
            const latCode = Math.floor((lat + 90) * 8000).toString(36).toUpperCase().slice(-4);
            const lngCode = Math.floor((lng + 180) * 8000).toString(36).toUpperCase().slice(-2);
            return `${latCode}+${lngCode}`;
          };
          
          // Priority: 
          // 1. Use name + district for more specific location (e.g. "Km. 12, Buhangin")
          // 2. Use streetNumber + street for street addresses
          // 3. Use district with approximate landmark
          // 4. Generate Plus Code if no good address available
          let formattedAddress;
          
          if (name && district && name !== street) {
            // Best: Landmark/location name with district ("Km. 12, Buhangin, Davao City")
            formattedAddress = `${name}, ${district}, ${city || 'Davao City'}`;
          } else if (streetNumber && street && !street.includes('Highway') && !street.includes('Road')) {
            // Good: Street number + street name (only if it's a real street, not highway)
            formattedAddress = `${streetNumber} ${street}, ${city || 'Davao City'}`;
          } else if (name && name !== district && !name.includes('Km')) {
            // OK: Just the location name with city (if it's not just a kilometer marker)
            formattedAddress = `${name}, ${city || 'Davao City'}`;
          } else if (district && district !== city) {
            // Fallback: District name with nearby landmark if available
            const landmark = name && name.includes('Km') ? ` (near ${name})` : '';
            formattedAddress = `${district}${landmark}, ${city || 'Davao City'}`;
          } else {
            // Last resort: District or Plus Code for unmapped areas
            const plusCode = generatePlusCode(coords.lat, coords.lng);
            formattedAddress = district 
              ? `${district}, ${city || 'Davao City'}`
              : `${plusCode} ${city || 'Davao City'}`;
          }
          
          setUserAddress(formattedAddress);
          console.log('✅ Final Address:', formattedAddress);
        } else {
          setUserAddress('Location found');
        }
      } catch (error) {
        console.error('Error getting location:', error);
        setUserAddress('Location unavailable');
      }
    })();
  }, []);

  // Fetch products and stores from Firebase (one-time load)
  const loadData = React.useCallback(async (cancelled: { current: boolean }) => {
    try {
      console.log('🔥 Loading products and stores from Firebase...');

      // 1) PRODUCTS (single read)
      const productsSnap = await get(ref(database, 'products'));
      if (!cancelled.current && productsSnap.exists()) {
        const data = productsSnap.val();
        const productsList: Product[] = Object.keys(data)
          .map(key => ({
            id: key,
            ...data[key],
          }))
          .filter(product => {
            // Only show available products from OPEN stores
            if (product.status !== 'available') return false;
            if (product.storeIsOpen === false) return false;

            // Log products with missing data
            if (!product.productName || !product.price || !product.storeName) {
              console.warn(`⚠️ Product ${product.id} has incomplete data:`, {
                productName: product.productName || 'MISSING',
                price: product.price || 'MISSING',
                storeName: product.storeName || 'MISSING',
                productSize: product.productSize || 'MISSING',
                unit: product.unit || 'MISSING',
              });
              return false;
            }

            return true;
          });

        console.log(`✅ Fetched ${productsList.length} complete available products`);
        setAllProducts(productsList);
      } else if (!cancelled.current) {
        console.log('⚠️ No products found');
        setAllProducts([]);
      }

      // 2) STORES (single read)
      const storesSnap = await get(ref(database, 'stores'));
      if (!cancelled.current && storesSnap.exists()) {
        const data = storesSnap.val();
        const storesList: Store[] = Object.keys(data)
          .map(key => {
            const storeData = data[key];

            const logo = storeData.logo || storeData.businessInfo?.logo || null;
            const coverImage = storeData.coverImage || storeData.businessInfo?.coverImage || null;
            const storeName = storeData.storeName || storeData.businessInfo?.storeName || 'Unknown Store';
            const ownerName = storeData.ownerName || storeData.personalInfo?.name || 'Unknown Owner';
            const address = storeData.address || storeData.businessInfo?.address || '';
            const city = storeData.city || storeData.businessInfo?.city || '';
            const description = storeData.description || storeData.businessInfo?.description || '';

            return {
              id: key,
              storeName,
              ownerName,
              logo,
              coverImage,
              address,
              city,
              description,
              status: storeData.status || 'active',
              isOpen: storeData.isOpen ?? true,
            };
          })
          .filter(store => {
            const isActiveStore = store.status === 'approved' || store.status === 'active';
            const isOpenStore = data[store.id]?.isOpen !== false;

            if (isActiveStore && !isOpenStore) {
              console.log(`🔴 Store HIDDEN (closed): ${store.storeName}`);
            } else if (isActiveStore && isOpenStore) {
              console.log(`🟢 Store VISIBLE (open): ${store.storeName}`);
            }

            return isActiveStore && isOpenStore;
          });

        console.log(`✅ Fetched ${storesList.length} open stores (filtered by isOpen status)`);

        storesList.forEach(store => {
          console.log(`📦 Store: ${store.storeName}`);
          console.log(`   - Logo: ${store.logo ? '✓ Has logo' : '✗ No logo'}`);
          console.log(`   - Cover: ${store.coverImage ? '✓ Has cover' : '✗ No cover'}`);
          if (store.logo) {
            console.log(`   - Logo URL (first 100 chars): ${store.logo.substring(0, 100)}...`);
          }
          if (store.coverImage) {
            console.log(`   - Cover URL (first 100 chars): ${store.coverImage.substring(0, 100)}...`);
          }
        });

        setAllStores(storesList);
      } else if (!cancelled.current) {
        console.log('⚠️ No stores found');
        setAllStores([]);
      }
    } catch (error) {
      console.error('Error loading home data:', error);
      if (!cancelled.current) {
        setAllProducts([]);
        setAllStores([]);
      }
    } finally {
      if (!cancelled.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    const cancelled = { current: false };
    loadData(cancelled);
    return () => {
      cancelled.current = true;
    };
  }, [loadData]);

  // Pull to refresh - now actually reloads data
  const onRefresh = async () => {
    setRefreshing(true);
    const cancelled = { current: false };
    await loadData(cancelled);
    setRefreshing(false);
  };

  // Extract user initials from name or email
  const getUserInitials = (): string => {
    if (user?.name) {
      // Get initials from actual name (first letter of first two words)
      const nameParts = user.name.trim().split(' ');
      if (nameParts.length >= 2) {
        return (nameParts[0][0] + nameParts[1][0]).toUpperCase();
      }
      return user.name.substring(0, 2).toUpperCase();
    }
    if (user?.email) {
      const emailName = user.email.split('@')[0];
      return emailName.substring(0, 2).toUpperCase();
    }
    return 'CU'; // Default: Customer User
  };

  // Get display name from user data
  const getDisplayName = (): string => {
    if (user?.name) {
      return user.name;
    }
    if (user?.email) {
      const emailName = user.email.split('@')[0];
      // Capitalize first letter
      return emailName.charAt(0).toUpperCase() + emailName.slice(1);
    }
    return 'Customer';
  };

  // Quick add to cart function
  const handleQuickAdd = async (product: Product) => {
    if (!user) {
      router.push('/(auth)/signin' as any);
      return;
    }

    if (product.quantity <= 0) {
      setToastMessage('Product is out of stock');
      setShowToast(true);
      return;
    }

    setAddingProductId(product.id);

    try {
      const result = await addToCartWithValidation(user.id, {
        productId: product.id,
        productName: product.productName,
        productImage: product.productImage,
        productImageUrl: product.productImageUrl,
        storeId: product.storeId,
        storeName: product.storeName,
        quantity: 1,
        price: product.price,
        weight: product.productSize,
        unit: product.unit,
        subtotal: product.price,
        stock: product.quantity,
        isAvailable: product.quantity > 0,
      });

      if (result.needsConfirmation) {
        // Prompt to replace cart
        Alert.alert(
          'Switch store?',
          `Your cart has items from ${result.currentStore?.storeName}. Replace with ${result.newStore?.storeName}?`,
          [
            { text: 'Keep current', style: 'cancel' },
            {
              text: 'Replace cart',
              style: 'destructive',
              onPress: async () => {
                const forced = await addToCartWithValidation(user.id, {
                  productId: product.id,
                  productName: product.productName,
                  productImage: product.productImage,
                  productImageUrl: product.productImageUrl,
                  storeId: product.storeId,
                  storeName: product.storeName,
                  quantity: 1,
                  price: product.price,
                  weight: product.productSize,
                  unit: product.unit,
                  subtotal: product.price,
                  stock: product.quantity,
                  isAvailable: product.quantity > 0,
                }, true);
                if (forced.success) {
                  setToastMessage(`${product.productName} added to cart!`);
                  setShowToast(true);
                }
              }
            }
          ]
        );
      } else if (result.success) {
        setToastMessage(`${product.productName} added to cart!`);
        setShowToast(true);
      } else {
        setToastMessage('Failed to add to cart. Please try again.');
        setShowToast(true);
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      setToastMessage('Failed to add to cart. Please try again.');
      setShowToast(true);
    } finally {
      setAddingProductId(null);
    }
  };

  // Category data - ALIGNED WITH CATEGORY NAVIGATION BAR
  // Matches categories from app/(main)/(customer)/category.tsx
  // Each category has a white circular background (50x50) with centered icon
  // Updated to use Figma-downloaded images from customer-home/categories/
  const categoryData = [
    {
      id: "all",
      label: "All",
      icon: require("../../../src/assets/images/customer-home/categories/all-icon.png"),
      active: true,
      categoryName: "All"
    },
    {
      id: "fruits-vegetables",
      label: "Fruits &\nVegetables",
      icon: require("../../../src/assets/images/customer-home/categories/fruits-vegetables.png"),
      categoryName: "Fruits & Vegetables"
    },
    {
      id: "dairy-bakery",
      label: "Dairy &\nBakery",
      icon: require("../../../src/assets/images/customer-home/categories/dairy-bakery.png"),
      categoryName: "Dairy & Bakery"
    },
    {
      id: "snacks-sweets",
      label: "Snacks &\nSweets",
      icon: require("../../../src/assets/images/customer-home/categories/snacks.png"),
      categoryName: "Snacks & Sweets"
    },
    {
      id: "beverages",
      label: "Beverages",
      icon: require("../../../src/assets/images/customer-home/categories/beverages.png"),
      categoryName: "Beverages"
    },
    {
      id: "personal-baby-care",
      label: "Personal &\nBaby Care",
      icon: require("../../../src/assets/images/customer-home/categories/personal-care.png"),
      categoryName: "Personal & Baby Care"
    },
    {
      id: "home-kitchen",
      label: "Home &\nKitchen",
      icon: require("../../../src/assets/images/customer-home/categories/home-kitchen.png"),
      categoryName: "Home & Kitchen"
    },
    {
      id: "staple-foods",
      label: "Staple\nFoods",
      icon: require("../../../src/assets/images/customer-home/categories/staple-foods.png"),
      categoryName: "Staple Foods"
    },
    {
      id: "condiments-cooking",
      label: "Condiments &\nCooking",
      icon: require("../../../src/assets/images/customer-home/categories/condiments-cooking.png"),
      categoryName: "Condiments & Cooking"
    },
    {
      id: "frozen-goods",
      label: "Frozen\nGoods",
      icon: require("../../../src/assets/images/customer-home/categories/frozen-goods.png"),
      categoryName: "Frozen Goods"
    },
    {
      id: "miscellaneous",
      label: "Miscellaneous\n& Others",
      icon: require("../../../src/assets/images/customer-home/categories/miscellaneous.png"),
      categoryName: "Miscellaneous & Others"
    },
  ];

  // ============ SMART PRODUCT RECOMMENDATION LOGIC ============

  // Selected store reference and products
  const selectedStore = React.useMemo(() => {
    if (!selectedStoreId) return null;
    return allStores.find(s => s.id === selectedStoreId) || null;
  }, [selectedStoreId, allStores]);

  const selectedStoreProducts = React.useMemo(() => {
    if (!selectedStoreId) return [] as Product[];
    return allProducts.filter(p => p.storeId === selectedStoreId).slice(0, 12);
  }, [allProducts, selectedStoreId]);

  // Best Selling Products - Show recently added products (newest first)
  const bestSellingProducts = React.useMemo(() => {
    if (allProducts.length === 0) return [];

    return [...allProducts]
      .filter(p => p != null && p.id && p.productName && p.price) // Remove null/undefined products
      .sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA;
      })
      .slice(0, 8); // Show up to 8 products
  }, [allProducts]);

  // Featured Stores - Show verified stores
  const featuredStores = React.useMemo(() => {
    if (allStores.length === 0) return [];

    return [...allStores]
      .slice(0, 4); // Show up to 4 stores
  }, [allStores]);

  // Most Popular Picks - Show diverse products from different categories
  const popularPicks = React.useMemo(() => {
    if (allProducts.length === 0) return [];

    // Filter out null/undefined products first
    const validProducts = allProducts.filter(p => p != null && p.id && p.productName && p.price && p.category);

    // Group products by category
    const categoriesMap = new Map<string, Product[]>();
    validProducts.forEach(product => {
      const products = categoriesMap.get(product.category) || [];
      products.push(product);
      categoriesMap.set(product.category, products);
    });

    // Get one product from each category
    const diverse: Product[] = [];
    categoriesMap.forEach(products => {
      if (products.length > 0 && products[0] != null) {
        diverse.push(products[0]);
      }
    });

    // Shuffle and take up to 8
    return diverse
      .filter(p => p != null) // Extra safety check
      .sort(() => Math.random() - 0.5)
      .slice(0, 8);
  }, [allProducts]);

  // Fresh Finds - Show most recent products with different logic than best selling
  const freshFindsProducts = React.useMemo(() => {
    if (allProducts.length === 0) return [];

    return [...allProducts]
      .filter(p => p != null && p.id && p.productName && p.price) // Remove null/undefined products
      .sort((a, b) => {
        const dateA = (a.updatedAt || a.createdAt) ? new Date(a.updatedAt || a.createdAt).getTime() : 0;
        const dateB = (b.updatedAt || b.createdAt) ? new Date(b.updatedAt || b.createdAt).getTime() : 0;
        return dateB - dateA;
      })
      .slice(0, 8); // Show up to 8 products
  }, [allProducts]);

  /**
   * STORE CARD COMPONENT
   * Figma: 903:443 Store (20, 628, 400x150)
   * Dimensions: 400x150px
   * Contains: Background, Store Image, Logo, Name, Rating, Distance
   */
  const StoreCard = ({ store }: { store: Store }) => {
    // Calculate number of products for this store
    const productCount = allProducts.filter(p => p.storeId === store.id).length;

    return (
      <TouchableOpacity
        style={styles.storeCard}
        onPress={() => router.push(`/(main)/shared/store-details?storeId=${store.id}` as any)}
        activeOpacity={0.8}
      >
        {/* White Background - Figma: 759:488 Rectangle 20 */}
        <View style={styles.storeCardWhiteBackground} />

        {/* Store Cover Image or Default Background - Figma: 759:489 Rectangle 21 */}
        {store.coverImage ? (
          <Image
            source={{ uri: store.coverImage }}
            style={styles.storeImageBackground}
            resizeMode="cover"
          />
        ) : (
          <Image
            source={require("../../../src/assets/images/customer-home/stores/store-background.png")}
            style={styles.storeImageBackground}
            resizeMode="cover"
          />
        )}

        {/* Store Logo - Figma: 759:490 Ellipse 8 */}
        <View style={styles.storeLogoContainer}>
          {store.logo ? (
            <Image
              source={{ uri: store.logo }}
              style={styles.storeLogo}
              resizeMode="cover"
            />
          ) : (
            <Image
              source={require("../../../src/assets/images/stores/store-profile-placeholder.png")}
              style={styles.storeLogo}
              resizeMode="contain"
            />
          )}
        </View>

        {/* Store Name - Figma: 759:491 */}
        <Text style={styles.storeName} numberOfLines={1}>{store.storeName}</Text>

        {/* Rating and Product Count Container */}
        <View style={styles.storeMetaContainer}>
          {/* Star Icon - Figma: 759:494 */}
          <Image
            source={require("../../../src/assets/images/customer-home/stores/star-icon.png")}
            style={styles.storeStarIcon}
          />
          {/* Rating - Figma: 759:493 */}
          <Text style={styles.storeRating}>0.0</Text>
          {/* Product Count */}
          <Text style={styles.storeDistance}>• {productCount} products</Text>
        </View>
      </TouchableOpacity>
    );
  };

  /**
   * POPULAR PICK CARD COMPONENT
   * Figma: 903:476 Popular picks (20, 1342, 180x80)
   * Dimensions: 180x80px (increased to 180x100 for better text spacing)
   * Contains: Background, Picture, Labels (Name, Description, Price)
   */
  const PopularPickCard = ({ product }: { product: Product }) => (
    <TouchableOpacity
      style={styles.popularPickCard}
      activeOpacity={0.8}
      onPress={() => router.push(`/(main)/shared/product-details?id=${product.id}` as any)}
    >
      {/* Background - Figma: 759:521 Rectangle 22 */}
      <View style={styles.popularPickBackground} />

      {/* Picture Container - Figma: 759:522 */}
      <View style={styles.popularPickPictureContainer}>
        {/* Picture Background - Figma: 759:523 Rectangle 24 */}
        <View style={styles.popularPickPictureBackground} />
        {/* Product Image - Figma: 759:524 */}
        {getProductImageSource(product) && (
          <Image
            source={getProductImageSource(product)!}
            style={styles.popularPickImage}
            resizeMode="contain"
          />
        )}
      </View>

      {/* Labels Group - Figma: 759:525 */}
      <View style={styles.popularPickLabels}>
        {/* Product Name - Figma: 759:527 */}
        <Text style={styles.popularPickName} numberOfLines={1}>{product.productName}</Text>
        {/* Description - Figma: 759:528 */}
        <Text style={styles.popularPickDescription} numberOfLines={1}>
          {product.description || `${product.productSize} ${product.unit}`}
        </Text>
        {/* Price - Figma: 759:526 */}
        <Text style={styles.popularPickPrice}>₱{product.price ? product.price.toFixed(2) : '0.00'}</Text>
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
        <TouchableOpacity
          style={styles.profileSection}
          onPress={() => router.push("/(main)/(customer)/profile" as any)}
          activeOpacity={0.7}
        >
          {/* Logo - Figma: 759:594 */}
          <View style={styles.profileLogo}>
            <Text style={styles.profileLogoText}>{getUserInitials()}</Text>
          </View>

          <View style={styles.profileInfo}>
            {/* User Name - Figma: 759:599 */}
            <Text style={styles.profileName} numberOfLines={1}>{getDisplayName()}</Text>

            {/* Location - Figma: 759:6373 */}
            <View style={styles.profileLocation}>
              {/* Location Icon - Figma: 759:598 */}
              <Image
                source={require("../../../src/assets/images/customer-home/location-icon.png")}
                style={styles.locationIcon}
              />
              {/* Location Text - Figma: 759:597 */}
              <Text style={styles.locationText} numberOfLines={1} ellipsizeMode="tail">
                {userAddress}
              </Text>
            </View>
          </View>
        </TouchableOpacity>

        {/* Map View Button - NEW: Access nearby stores map */}
        <TouchableOpacity 
          style={styles.mapButton}
          onPress={() => router.push("/(main)/(customer)/stores-map" as any)}
        >
          <View style={styles.mapCircle} />
          <Image
            source={require("../../../src/assets/images/customer-home/location-icon.png")}
            style={styles.mapIcon}
          />
        </TouchableOpacity>

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
        <TouchableOpacity
          style={styles.searchContainer}
          activeOpacity={0.8}
          onPress={() => router.push("/(main)/(customer)/search" as any)}
        >
          {/* Search Background - Figma: 759:209 Rectangle 12 */}
          <View style={styles.searchBackground} />
          {/* Search Icon - Figma: 759:210 */}
          <Image
            source={require("../../../src/assets/images/customer-home/search-icon.png")}
            style={styles.searchIcon}
          />
          {/* Search Placeholder Text - Figma: 759:211 */}
          <Text style={styles.searchPlaceholder}>Search for "Items"</Text>
        </TouchableOpacity>
      </View>

      {/* Selected Store Banner */}
      {selectedStore ? (
        <View style={styles.storeBanner}>
          <View style={{ flex: 1 }}>
            <Text style={styles.bannerTitle}>Shopping at</Text>
            <Text style={styles.bannerStoreName} numberOfLines={1}>{selectedStore.storeName}</Text>
          </View>
          <TouchableOpacity style={styles.changeStoreBtn} onPress={() => router.push("/(main)/(customer)/stores-map" as any)}>
            <Text style={styles.changeStoreText}>Change Store</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity style={styles.storeBanner} onPress={() => router.push("/(main)/(customer)/stores-map" as any)}>
          <View style={{ flex: 1 }}>
            <Text style={styles.bannerTitle}>No store selected</Text>
            <Text style={styles.bannerStoreName}>Pick a nearby store</Text>
          </View>
          <View style={styles.changeStoreBtn}><Text style={styles.changeStoreText}>Select</Text></View>
        </TouchableOpacity>
      )}

      {/* SCROLLABLE CONTENT */}
      <ScrollView
        style={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContentContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#3BB77E" />
        }
      >
        {/* PERSONALIZED SECTION: Available at selected store */}
        {selectedStore && (
          <>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Available at {selectedStore.storeName}</Text>
              <TouchableOpacity onPress={() => router.push(`/(main)/shared/store-details?id=${selectedStore.id}` as any)}>
                <Text style={styles.seeMoreText}>See store</Text>
              </TouchableOpacity>
            </View>
            {loading ? (
              <View style={[styles.productsSection, { justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color="#3BB77E" />
              </View>
            ) : selectedStoreProducts.length === 0 ? (
              <View style={[styles.productsSection, { justifyContent: 'center', alignItems: 'center', paddingHorizontal: s(40) }]}>
                <Text style={styles.emptyText}>No products available in this store</Text>
              </View>
            ) : (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.productsSection}
                contentContainerStyle={styles.productsScrollContent}
              >
                {selectedStoreProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    title={product.productName || 'Unnamed Product'}
                    subtitle={product.productSize && product.unit ? `${product.productSize} ${product.unit}` : ''}
                    weight={''}
                    price={product.price ? `₱${product.price.toFixed(2)}` : '₱0.00'}
                    image={getProductImageSource(product)}
                    variant="horizontal"
                    onAddPress={() => handleQuickAdd(product)}
                    onPress={() => router.push(`/(main)/shared/product-details?id=${product.id}` as any)}
                    isAdding={addingProductId === product.id}
                  />
                ))}
              </ScrollView>
            )}
          </>
        )}

        {/* CATEGORY SECTION - Figma: 903:556 Category (0, 198, 440x90) */}
        {/* Horizontal scrollable category navigation with icons */}
        <View style={styles.categorySection}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryScrollContent}
          >
            {categoryData.map((category, index) => (
              <TouchableOpacity
                key={category.id}
                style={styles.categoryItem}
                onPress={() => {
                  // Navigate to dynamic category detail screen with category parameter
                  if (category.id === 'all') {
                    // "All" goes to regular category grid view
                    router.push("/(main)/(customer)/category" as any);
                  } else {
                    // Specific category goes to filtered category detail view
                    router.push(`/(main)/(customer)/category-detail?category=${category.id}` as any);
                  }
                }}
                activeOpacity={0.7}
              >
                {/* Category Icon Circle - Figma: 50x50 white background ellipse with shadow */}
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

        {/* BEST SELLING SECTION - Figma: 903:212 Label (23, 296) */}
        <View style={styles.sectionHeader}>
          {/* Section Title - Figma: 903:213 Best Selling */}
          <Text style={styles.sectionTitle}>Best Selling</Text>
          {/* See More - Figma: 903:214 See more */}
          <TouchableOpacity onPress={() => router.push("/(main)/(customer)/see-more?section=bestSelling" as any)}>
            <Text style={styles.seeMoreText}>See more</Text>
          </TouchableOpacity>
        </View>

        {/* BEST SELLING PRODUCTS - Figma: 903:221 Products (1, 330, 440x244) */}
        {loading ? (
          <View style={[styles.productsSection, { justifyContent: 'center', alignItems: 'center' }]}>
            <ActivityIndicator size="large" color="#3BB77E" />
          </View>
        ) : bestSellingProducts.length === 0 ? (
          <View style={[styles.productsSection, { justifyContent: 'center', alignItems: 'center', paddingHorizontal: s(40) }]}>
            <Text style={styles.emptyText}>No products available yet</Text>
          </View>
        ) : (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.productsSection}
            contentContainerStyle={styles.productsScrollContent}
          >
            {bestSellingProducts
              .filter(product => product && product.id) // Extra safety: remove any null/undefined
              .map((product) => (
                <ProductCard
                  key={product.id}
                  title={product.productName || 'Unnamed Product'}
                  subtitle={product.storeName ? `(${product.storeName})` : ''}
                  weight={product.productSize && product.unit ? `${product.productSize} ${product.unit}` : ''}
                  price={product.price ? `₱${product.price.toFixed(2)}` : '₱0.00'}
                  image={getProductImageSource(product)}
                  variant="horizontal"
                  onAddPress={() => handleQuickAdd(product)}
                  onPress={() => router.push(`/(main)/shared/product-details?id=${product.id}` as any)}
                  isAdding={addingProductId === product.id}
                />
              ))}
          </ScrollView>
        )}

        {/* FEATURED STORES SECTION - Figma: 903:215 Label (23, 584) */}
        <View style={styles.sectionHeader}>
          {/* Section Title - Figma: 903:216 Feature store near you */}
          <Text style={styles.sectionTitle}>Feature store near you</Text>
          {/* See More - Figma: 903:217 See more */}
          <TouchableOpacity onPress={() => router.push("/(main)/(customer)/stores-list" as any)}>
            <Text style={styles.seeMoreText}>See more</Text>
          </TouchableOpacity>
        </View>

        {/* FEATURED STORES - Figma: 903:442 Store (20, 628, 400x660) */}
        {loading ? (
          <View style={[styles.storesSection, { justifyContent: 'center', alignItems: 'center', minHeight: vs(150) }]}>
            <ActivityIndicator size="large" color="#3BB77E" />
          </View>
        ) : featuredStores.length === 0 ? (
          <View style={[styles.storesSection, { justifyContent: 'center', alignItems: 'center', minHeight: vs(150) }]}>
            <Text style={styles.emptyText}>No stores available yet</Text>
          </View>
        ) : (
          <View style={styles.storesSection}>
            {featuredStores.map((store) => (
              <StoreCard key={store.id} store={store} />
            ))}
          </View>
        )}

        {/* MOST POPULAR PICKS SECTION - Figma: 903:218 Label (23, 1308) */}
        <View style={styles.sectionHeader}>
          {/* Section Title - Figma: 903:219 Most popular picks */}
          <Text style={styles.sectionTitle}>Most popular picks</Text>
          {/* See More - Figma: 903:220 See more */}
          <TouchableOpacity onPress={() => router.push("/(main)/(customer)/see-more?section=mostPopular" as any)}>
            <Text style={styles.seeMoreText}>See more</Text>
          </TouchableOpacity>
        </View>

        {/* POPULAR PICKS - Figma: 903:475 Frame 1 (0, 1332, 440x100) */}
        {loading ? (
          <View style={[styles.popularPicksSection, { justifyContent: 'center', alignItems: 'center' }]}>
            <ActivityIndicator size="large" color="#3BB77E" />
          </View>
        ) : popularPicks.length === 0 ? (
          <View style={[styles.popularPicksSection, { justifyContent: 'center', alignItems: 'center', paddingHorizontal: s(40) }]}>
            <Text style={styles.emptyText}>No popular picks available yet</Text>
          </View>
        ) : (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.popularPicksSection}
            contentContainerStyle={styles.popularPicksScrollContent}
          >
            {popularPicks.map((product) => (
              <PopularPickCard key={product.id} product={product} />
            ))}
          </ScrollView>
        )}

        {/* FRESH FINDS SECTION - Figma: 903:439 Label (24, 1442) */}
        <View style={styles.sectionHeader}>
          {/* Section Title - Figma: 903:440 Fresh finds of the day */}
          <Text style={styles.sectionTitle}>Fresh finds of the day</Text>
          {/* See More - Figma: 903:441 See more */}
          <TouchableOpacity onPress={() => router.push("/(main)/(customer)/see-more?section=freshFinds" as any)}>
            <Text style={styles.seeMoreText}>See more</Text>
          </TouchableOpacity>
        </View>

        {/* FRESH FINDS PRODUCTS - Figma: 903:330 Products (0, 1486, 440x244) */}
        {loading ? (
          <View style={[styles.productsSection, { justifyContent: 'center', alignItems: 'center' }]}>
            <ActivityIndicator size="large" color="#3BB77E" />
          </View>
        ) : freshFindsProducts.length === 0 ? (
          <View style={[styles.productsSection, { justifyContent: 'center', alignItems: 'center', paddingHorizontal: s(40) }]}>
            <Text style={styles.emptyText}>No fresh finds available yet</Text>
          </View>
        ) : (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.productsSection}
            contentContainerStyle={styles.productsScrollContent}
          >
            {freshFindsProducts
              .filter(product => product && product.id) // Extra safety: remove any null/undefined
              .map((product) => (
                <ProductCard
                  key={product.id}
                  title={product.productName || 'Unnamed Product'}
                  subtitle={product.storeName ? `(${product.storeName})` : ''}
                  weight={product.productSize && product.unit ? `${product.productSize} ${product.unit}` : ''}
                  price={product.price ? `₱${product.price.toFixed(2)}` : '₱0.00'}
                  image={getProductImageSource(product)}
                  variant="horizontal"
                  onAddPress={() => handleQuickAdd(product)}
                  onPress={() => router.push(`/(main)/shared/product-details?id=${product.id}` as any)}
                  isAdding={addingProductId === product.id}
                />
              ))}
          </ScrollView>
        )}

        {/* END MESSAGE - Figma: 903:548 That's all for now! (174, 1750) */}
        <Text style={styles.endMessage}>That&apos;s all for now!</Text>

        {/* Bottom Padding for Tab Navigation */}
        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* BOTTOM NAVIGATION BAR - Figma: 903:612 Nav bar */}
      <BottomNavigation activeTab="home" cartCount={cartCount} />

      {/* Toast Notification */}
      <Toast
        visible={showToast}
        message={toastMessage}
        type="success"
        onDismiss={() => setShowToast(false)}
      />

      {/* Dev Test Button - Only visible in development */}
      <DevTestButton />
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
  // Figma: 903:203 - Header section (0, 0, 440x230)
  headerSection: {
    width: s(440),
    height: vs(150), // Reduced from 230 to match compact layout
    position: "relative",
  },

  // Header Background - Figma: 903:204 Rectangle 11 (0, 0, 440x230)
  headerBackground: {
    position: "absolute",
    top: 0,
    left: 0,
    width: s(440),
    height: vs(150), // Reduced from 230 to match new compact layout
  },

  // Profile Section - Figma: 903:549 Profile (20, 74, 179x40)
  // Made flexible to prevent cutoff on smaller devices
  profileSection: {
    position: "absolute",
    left: s(20),
    top: vs(20), // Moved up from 74 to reduce empty space
    right: s(70), // Leave space for notification button
    height: vs(40),
    flexDirection: "row",
    alignItems: "center",
  },

  // Profile Logo - Figma: 903:550 Logo (20, 74, 40x40)
  profileLogo: {
    width: s(40),
    height: s(40),
    borderRadius: s(20),
    backgroundColor: "#3B82F6",
    justifyContent: "center",
    alignItems: "center",
  },

  // Profile Logo Text
  profileLogoText: {
    fontFamily: "Clash Grotesk Variable",
    fontWeight: "500",
    fontSize: ms(16),
    lineHeight: ms(16) * 1.23,
    color: "#FFFFFF",
  },

  profileInfo: {
    marginLeft: s(10),
    flex: 1,
  },

  // Profile Name - Figma: 903:555 Daniel Oppa (70, 74)
  profileName: {
    fontFamily: "Clash Grotesk Variable",
    fontWeight: "500",
    fontSize: ms(18), // Reduced from 20 to 18 for better fit on small devices
    lineHeight: ms(18) * 1.2,
    color: "#FFFFFF",
  },

  // Profile Location - Figma: 903:553 + 903:554 (70, 92)
  profileLocation: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: vs(2),
    flexWrap: "nowrap",
  },

  // Location Icon - Figma: 903:554 Location (70, 96, 15x15)
  locationIcon: {
    width: s(15),
    height: s(15),
    marginRight: s(5),
  },

  // Location Text - Figma: 903:553 Jacinto st. Davao City (90, 92)
  locationText: {
    fontFamily: "Clash Grotesk Variable",
    fontWeight: "400",
    fontSize: ms(10),
    lineHeight: ms(10) * 1.5,
    color: "#FFFFFF",
    flex: 1,
    flexShrink: 1,
  },

  // Notification Button - Figma: 903:205 Notif (375, 74, 40x40)
  notificationButton: {
    position: "absolute",
    left: s(375),
    top: vs(20), // Moved up from 74 to align with profile
    width: s(40),
    height: s(40),
  },

  // Notification Circle - Figma: 903:206 Notif Ellipse (375, 74, 40x40)
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

  // Notification Icon - Figma: 903:207 Notification (382, 81, 25x25)
  notificationIcon: {
    position: "absolute",
    left: s(7),
    top: s(7),
    width: s(25),
    height: s(25),
  },

  // Map Button - NEW: Access nearby stores map
  mapButton: {
    position: "absolute",
    left: s(325), // Positioned before notification button
    top: vs(20),
    width: s(40),
    height: s(40),
  },

  // Map Circle - Same style as notification circle
  mapCircle: {
    position: "absolute",
    width: s(40),
    height: s(40),
    borderRadius: s(20),
    backgroundColor: "#3BB77E", // Green for map/location
    shadowColor: "rgba(0, 0, 0, 0.25)",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: s(10),
    elevation: 10,
  },

  // Map Icon
  mapIcon: {
    position: "absolute",
    left: s(7),
    top: s(7),
    width: s(25),
    height: s(25),
    tintColor: "#FFFFFF", // White icon on green background
  },

  // Search Container - Figma: 903:208 Search (20, 134, 400x50)
  // Optimized for small devices: reduced to 390px for better fit
  searchContainer: {
    position: "absolute",
    left: s(20),
    top: vs(80), // Moved up from 134 to reduce spacing
    width: s(390), // Reduced from 400 to 390 for small device compatibility
    height: vs(50),
    flexDirection: "row",
    alignItems: "center",
  },

  // Search Background - Figma: 903:209 Rectangle 12 (20, 134, 400x50)
  searchBackground: {
    position: "absolute",
    width: s(390), // Matches container width
    height: vs(50),
    backgroundColor: "#FFFFFF",
    borderRadius: s(20),
    shadowColor: "rgba(0, 0, 0, 0.25)",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: s(10),
    elevation: 10,
  },

  // Search Icon - Figma: 903:210 Search (40, 149, 20x20)
  searchIcon: {
    marginLeft: s(20),
    width: s(20),
    height: s(20),
    zIndex: 1,
  },

  // Search Placeholder - Figma: 903:211 Search for "Items" (80, 149)
  searchPlaceholder: {
    flex: 1,
    marginLeft: s(20),
    fontFamily: "Clash Grotesk Variable",
    fontWeight: "500",
    fontSize: ms(16),
    lineHeight: ms(16) * 1.375,
    color: "#7A7B7B",
    zIndex: 1,
  },

  // Selected Store Banner styles
  storeBanner: {
    marginHorizontal: s(20),
    marginTop: vs(10),
    marginBottom: vs(10),
    backgroundColor: '#FFFFFF',
    borderRadius: s(12),
    paddingVertical: vs(12),
    paddingHorizontal: s(14),
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
    gap: s(10),
  },
  bannerTitle: {
    fontFamily: "Clash Grotesk Variable",
    fontSize: ms(12),
    color: '#666',
  },
  bannerStoreName: {
    fontFamily: "Clash Grotesk Variable",
    fontSize: ms(16),
    fontWeight: '700',
    color: '#1E1E1E',
  },
  changeStoreBtn: {
    backgroundColor: '#3BB77E',
    borderRadius: s(8),
    paddingVertical: vs(8),
    paddingHorizontal: s(12),
  },
  changeStoreText: {
    color: '#FFF',
    fontWeight: '600',
  },

  // ============ SCROLLABLE CONTENT ============
  scrollContent: {
    flex: 1,
  },

  scrollContentContainer: {
    paddingBottom: vs(60), // Aggressively reduced from 80 to 60
  },

  // ============ CATEGORY SECTION ============
  // Figma: 903:556 Category (0, 198, 440x90)
  // Contains horizontal scroll group 903:557 (19, 204, 866x84)
  categorySection: {
    marginTop: vs(10), // Reduced spacing for compact header
    height: vs(100), // Increased from 90 to 100 for better spacing
    marginBottom: vs(10), // Add bottom margin for separation
  },

  categoryScrollContent: {
    paddingLeft: s(20),
    paddingRight: s(20),
  },

  // Category Item - each category is 50px circle + label
  categoryItem: {
    alignItems: "center",
    marginRight: s(15), // Increased spacing between items
    width: s(80), // Increased width to accommodate multi-line text better
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
    marginTop: vs(6), // Increased spacing from circle
    fontFamily: "Clash Grotesk Variable",
    fontWeight: "500",
    fontSize: ms(10), // Smaller font for longer text
    lineHeight: ms(10) * 1.5, // Better line height for multi-line text
    color: "#1E1E1E",
    textAlign: "center",
    width: s(80), // Match container width
    minHeight: vs(30), // Minimum height to accommodate 2 lines
    flexWrap: "wrap", // Allow text to wrap
  },

  categoryLabelActive: {
    color: "#3BB77E",
  },

  // ============ SECTION HEADERS ============
  // Figma: 903:212 Label (23, 296) - Best Selling
  // Figma: 903:215 Label (23, 584) - Featured Stores
  // Figma: 903:218 Label (23, 1308) - Most Popular Picks
  // Figma: 903:439 Label (24, 1442) - Fresh Finds
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

  // Section Title - Figma: 903:213, 903:216, 903:219, 903:440 (fontWeight:600, fontSize:20)
  sectionTitle: {
    fontFamily: "Clash Grotesk Variable",
    fontWeight: "600",
    fontSize: ms(20),
    lineHeight: ms(20) * 1.1,
    color: "#1E1E1E",
  },

  // See More Text - Figma: 903:214, 903:217, 903:220, 903:441 (fontWeight:500, fontSize:14)
  seeMoreText: {
    fontFamily: "Clash Grotesk Variable",
    fontWeight: "500",
    fontSize: ms(14),
    lineHeight: ms(14) * 1.571,
    color: "rgba(0, 0, 0, 0.5)",
  },

  // ============ PRODUCTS SECTION ============
  // Figma: 903:221 Products (1, 330, 440x244) - Best Selling
  // Figma: 903:330 Products (0, 1486, 440x244) - Fresh Finds
  productsSection: {
    height: vs(244),
    marginBottom: vs(10),
  },

  productsScrollContent: {
    paddingLeft: s(23),
    paddingRight: s(23),
  },

  // Products Grid - Same as see-more for synchronized design
  productsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: s(22),
    columnGap: s(18),
    rowGap: vs(20),
    justifyContent: "flex-start",
    marginBottom: vs(20),
  },

  // Product Card - Figma: 903:222 Product0 (23, 341, 120x222)
  productCard: {
    width: s(120),
    height: vs(222),
    marginRight: s(20),
    position: "relative",
  },

  // Product Card Background - Figma: Rectangle 16 with shadow
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

  // Product Picture Background - Seamless blend with white card background
  productPictureBackground: {
    position: "absolute",
    left: s(10),
    top: 0,
    width: s(100),
    height: vs(88),
    backgroundColor: "#FFFFFF", // Pure white to match card background - NO visible box
    borderRadius: s(10),
    // No shadow to ensure complete invisibility - images blend seamlessly
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
  // Improved layout for consistent text alignment regardless of product name length
  productLabelContainer: {
    position: "absolute",
    left: s(10),
    top: vs(105),
    width: s(100),
    height: vs(74), // Increased height to prevent text cutoff
    justifyContent: "flex-start", // Align from top for consistent spacing
    paddingHorizontal: s(4), // Add horizontal padding for better text display
  },

  // Product Name - Figma: 759:272, positioned relative to container
  productName: {
    fontFamily: "Clash Grotesk Variable",
    fontWeight: "600", // Bold
    fontSize: ms(12), // Reduced from 14 to 12 for better fit
    lineHeight: ms(12) * 1.3,
    color: "#000000", // Pure black
    marginBottom: vs(3),
    textAlign: "center",
    width: "100%",
  },

  // Product Shop - Figma: 759:273, positioned relative to container
  productShop: {
    fontFamily: "Clash Grotesk Variable",
    fontWeight: "600", // Bold
    fontSize: ms(10), // Reduced from 11 to 10 for better fit
    lineHeight: ms(10) * 1.4,
    color: "#000000", // Pure black
    marginBottom: vs(3),
    textAlign: "center",
    width: "100%",
  },

  // Product Weight - Figma: 759:274, positioned relative to container
  productWeight: {
    fontFamily: "Clash Grotesk Variable",
    fontWeight: "400",
    fontSize: ms(10), // Reduced from 11 to 10 for consistency
    lineHeight: ms(10) * 1.4,
    color: "rgba(0, 0, 0, 0.5)",
    textAlign: "center",
    width: "100%",
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
  // Figma: 903:442 Store (20, 628, 400x660)
  // Contains 4 store cards: 903:443, 903:451, 903:459, 903:467
  storesSection: {
    marginLeft: s(20),
    marginRight: s(20),
    marginBottom: vs(20),
  },

  // Store Card - Figma: 903:443 Store (20, 628, 400x150)
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
    fontSize: ms(20),
    lineHeight: ms(20) * 1.1,
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
    fontSize: ms(12),
    lineHeight: ms(12) * 1.833,
    color: "rgba(0, 0, 0, 0.5)",
  },

  // Store Distance - Figma: 759:492, x:52.87, y:117
  storeDistance: {
    marginLeft: s(10),
    fontFamily: "Clash Grotesk Variable",
    fontWeight: "400",
    fontSize: ms(12),
    lineHeight: ms(12) * 1.833,
    color: "rgba(0, 0, 0, 0.5)",
  },

  // ============ POPULAR PICKS SECTION ============
  // Figma: 903:475 Frame 1 (0, 1332, 440x100)
  // Contains popular pick cards: 903:476, 903:485, 903:494, etc.
  popularPicksSection: {
    height: vs(120), // Increased from 100 to accommodate taller cards
    marginBottom: vs(20),
  },

  popularPicksScrollContent: {
    paddingLeft: s(20),
    paddingRight: s(20),
  },

  // Popular Pick Card - Figma: 903:476 Popular picks (20, 1342, 180x80)
  popularPickCard: {
    width: s(180),
    height: vs(100), // Increased from 80 to prevent text overlap
    marginRight: s(10),
    position: "relative",
  },

  // Popular Pick Background - Figma: 759:521, Rectangle 22 with shadow
  popularPickBackground: {
    position: "absolute",
    width: s(180),
    height: vs(100), // Increased from 80 to match card height
    backgroundColor: "#FFFFFF",
    borderRadius: s(20),
    shadowColor: "rgba(0, 0, 0, 0.25)",
    shadowOffset: { width: 0, height: vs(4) },
    shadowOpacity: 1,
    shadowRadius: s(10),
    elevation: 10,
  },

  // Popular Pick Picture Container - Figma: 759:522, x:10, y:10, width:60, height:80 (increased)
  popularPickPictureContainer: {
    position: "absolute",
    left: s(10),
    top: vs(10),
    width: s(60),
    height: vs(80), // Increased to meet card height
  },

  // Popular Pick Picture Background - Seamless blend with white card background
  popularPickPictureBackground: {
    position: "absolute",
    width: s(60),
    height: vs(80), // Increased to match container
    backgroundColor: "#FFFFFF", // Pure white to match card background - NO visible box
    borderRadius: s(16),
    // No shadow to ensure complete invisibility - images blend seamlessly
  },

  // Popular Pick Image - Figma: 759:524, increased to fill height
  popularPickImage: {
    position: "absolute",
    left: s(8),
    top: vs(10),
    width: s(44), // Increased width
    height: vs(60), // Increased height to meet card
  },

  // Popular Pick Labels - Figma: 759:525, x:80, y:13, width:75, height:55
  popularPickLabels: {
    position: "absolute",
    left: s(80),
    top: vs(15),
    width: s(90),
    height: vs(75),
    justifyContent: "space-between",
  },

  // Popular Pick Name - Figma: 759:527, fontSize:16
  popularPickName: {
    fontFamily: "Clash Grotesk Variable",
    fontWeight: "500",
    fontSize: ms(14),
    lineHeight: ms(14) * 1.4,
    color: "#1E1E1E",
    marginBottom: vs(4),
  },

  // Popular Pick Description - Figma: 759:528, fontSize:10
  popularPickDescription: {
    fontFamily: "Clash Grotesk Variable",
    fontWeight: "400",
    fontSize: ms(10),
    lineHeight: ms(10) * 1.5,
    color: "rgba(0, 0, 0, 0.5)",
    marginBottom: vs(4),
  },

  // Popular Pick Price - Figma: 759:526, fontSize:12
  popularPickPrice: {
    fontFamily: "Clash Grotesk Variable",
    fontWeight: "600",
    fontSize: ms(12),
    lineHeight: ms(12) * 1.5,
    color: "#3BB77E",
  },

  // ============ END MESSAGE ============
  // Figma: 903:548 That's all for now! (174, 1750)
  endMessage: {
    marginTop: vs(20),
    fontFamily: "Clash Grotesk Variable",
    fontWeight: "500",
    fontSize: ms(12),
    lineHeight: ms(12) * 1.833,
    color: "rgba(0, 0, 0, 0.5)",
    textAlign: "center",
  },

  // Empty State Text
  emptyText: {
    fontFamily: "Clash Grotesk Variable",
    fontWeight: "500",
    fontSize: ms(14),
    lineHeight: ms(14) * 1.5,
    color: "rgba(0, 0, 0, 0.5)",
    textAlign: "center",
  },

  // Bottom Padding
  bottomPadding: {
    height: vs(5), // Aggressively reduced from 10 to 5
  },
});
