/**
 * PRODUCT DETAILS SCREEN - Dynamic Product Display with Horizontal Carousel
 *
 * Figma File: 8I1Nr3vQZllDDknSevstvH
 * Node: 903-785 (Product Details)
 * Baseline: 440x1798
 *
 * Features:
 * - Horizontal scrolling image carousel with seamless blending
 * - Diagonal decorative lines on navigation and product info
 * - Dynamic product loading from Firebase using route params
 * - Add to cart functionality with stock validation
 * - Related products fetching by category
 * - Store information display with logo and cover
 * - Quantity controls with stock limits
 * - Loading and error states
 */

import { useLocalSearchParams, router } from 'expo-router';
import React, { useState, useEffect, useRef } from 'react';
import {
  Image,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
} from 'react-native';
import { ProductCard, StoreCard, Toast } from '../../../src/components/ui';
import { Colors } from '../../../src/constants/Colors';
import { s, vs, ms } from '../../../src/constants/responsive';
import { useUser } from '../../../src/contexts/UserContext';
import { fetchProductById, fetchProductsByCategory } from '../../../src/api/products';
import { fetchStoreById, fetchFeaturedStores } from '../../../src/api/stores';
import { addToCartWithValidation } from '../../../src/api/cart';
import type { CartItem } from '../../../src/models/Cart';
import { ref, get } from 'firebase/database';
import { database } from '../../../FirebaseConfig';
import { getProductImageSource, getStoreLogoSource, getStoreCoverSource } from '../../../src/lib/helpers/imageHelper';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Firebase Product interface matching actual database structure
interface Product {
  id: string;
  productName: string;
  productImage: string; // Legacy base64 field
  productImageUrl?: string; // New Cloudinary URL field
  description: string;
  price: number;
  category: string;
  categoryId: string;
  storeId: string;
  storeName: string;
  quantity: number;  // Firebase uses 'quantity' for stock count
  productSize: string;
  unit: string;
  rating?: number;
  totalReviews?: number;
  storeOwnerId: string;
  createdAt: string;
  updatedAt: string;
  status: 'available' | 'out_of_stock';
}

// Firebase Store interface matching actual database structure
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
}

export default function ProductDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useUser();

  // State management
  const [product, setProduct] = useState<Product | null>(null);
  const [store, setStore] = useState<Store | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [otherStores, setOtherStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [addingRelatedId, setAddingRelatedId] = useState<string | null>(null);

  // Toast notification state
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error' | 'info'>('success');

  // Carousel animation
  const scrollX = useRef(new Animated.Value(0)).current;
  const carouselRef = useRef<ScrollView>(null);
  const mainScrollRef = useRef<ScrollView>(null);

  // Load product data
  useEffect(() => {
    const loadProductData = async () => {
      if (!id) {
        Alert.alert('Error', 'Product not found');
        router.back();
        return;
      }

      try {
        setLoading(true);

        // Fetch product details
        const productData = await fetchProductById(id) as any;
        if (!productData) {
          Alert.alert('Error', 'Product not found');
          router.back();
          return;
        }
        console.log('📱 Current product:', productData.productName, '| Category:', productData.category);
        setProduct(productData as Product);

        // Fetch store information
        if (productData.storeId) {
          const storeData = await fetchStoreById(productData.storeId) as any;

          // Debug: Log current store data to verify logo and coverImage
          console.log('🏪 Current Store:', {
            id: storeData?.id,
            name: storeData?.storeName,
            hasLogo: !!storeData?.logo,
            hasCoverImage: !!storeData?.coverImage,
            logoUrl: storeData?.logo ? storeData.logo.substring(0, 50) + '...' : 'No logo',
            coverImageUrl: storeData?.coverImage ? storeData.coverImage.substring(0, 50) + '...' : 'No cover',
          });

          setStore(storeData as Store);
        }

        // Fetch related products from same category
        // Use category name for more reliable matching
        if (productData.category) {
          try {
            // Fetch all products and filter by category name
            const productsRef = ref(database, 'products');
            const snapshot = await get(productsRef);

            let related: any[] = [];
            if (snapshot.exists()) {
              const allProducts = snapshot.val();
              related = Object.keys(allProducts)
                .map(key => ({
                  id: key,
                  ...allProducts[key]
                }))
                .filter(p => {
                  // Match category name (case-insensitive)
                  if (p.category?.toLowerCase() !== productData.category?.toLowerCase()) return false;

                  // Exclude current product
                  if (p.id === productData.id) return false;

                  // Only show available products from OPEN stores
                  if (p.status === 'out_of_stock' || p.quantity === 0) return false;
                  if (p.storeIsOpen === false) return false;

                  return true;
                })
                // Sort by relevance: prioritize similar price range
                .sort((a, b) => {
                  const aPriceDiff = Math.abs(a.price - productData.price);
                  const bPriceDiff = Math.abs(b.price - productData.price);
                  return aPriceDiff - bPriceDiff;
                })
                // Get top 8 most relevant items
                .slice(0, 8);
            }

            console.log(`📦 Related products for "${productData.productName}" (${productData.category}):`, related.length);
            setRelatedProducts(related as Product[]);
          } catch (error) {
            console.error('Error fetching related products:', error);
            setRelatedProducts([]);
          }
        }

        // Fetch other featured stores (limit to 4)
        const stores = await fetchFeaturedStores() as any[];
        const filteredStores = stores
          .filter(s => s.id !== productData.storeId) // Exclude current store
          .slice(0, 4);

        // Debug: Log store data to verify logo and coverImage are retrieved
        console.log('📦 Other Stores Retrieved:', filteredStores.length);
        filteredStores.forEach((store, index) => {
          console.log(`  Store ${index + 1}:`, {
            id: store.id,
            name: store.storeName,
            hasLogo: !!store.logo,
            hasCoverImage: !!store.coverImage,
            logoUrl: store.logo ? store.logo.substring(0, 50) + '...' : 'No logo',
            coverImageUrl: store.coverImage ? store.coverImage.substring(0, 50) + '...' : 'No cover',
          });
        });

        setOtherStores(filteredStores as Store[]);
      } catch (error) {
        console.error('Error loading product:', error);
        Alert.alert('Error', 'Failed to load product details');
      } finally {
        setLoading(false);
      }
    };

    loadProductData();
  }, [id]);

  // Get product images (use Cloudinary or fallback)
  const getProductImages = () => {
    if (!product) return [];
    const imageSource = getProductImageSource(product);
    if (!imageSource) return [];
    // Use the same image 3 times for carousel effect
    return [imageSource, imageSource, imageSource];
  };

  // Quantity controls with stock validation
  const increaseQuantity = () => {
    if (product && quantity < product.quantity) {
      setQuantity(prev => prev + 1);
    } else {
      Alert.alert('Stock Limit', `Only ${product?.quantity} items available`);
    }
  };

  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(prev => prev - 1);
    }
  };

  // Add to cart handler
  const handleAddToCart = async () => {
    if (!user) {
      Alert.alert('Sign In Required', 'Please sign in to add items to cart');
      router.push('/(auth)/signin');
      return;
    }

    if (!product) return;

    // Check stock availability
    if (product.quantity === 0) {
      Alert.alert('Out of Stock', 'This product is currently out of stock');
      return;
    }

    if (quantity > product.quantity) {
      Alert.alert('Stock Limit', `Only ${product.quantity} items available`);
      return;
    }

    try {
      const cartItem: CartItem = {
        productId: product.id,
        productName: product.productName,
        productImage: product.productImage,
        productImageUrl: product.productImageUrl,
        storeId: product.storeId,
        storeName: product.storeName,
        quantity: quantity,
        price: product.price,
        weight: product.productSize,
        unit: product.unit,
        stock: product.quantity,
        subtotal: product.price * quantity,
        isAvailable: product.quantity > 0,
      };

      const result = await addToCartWithValidation(user.id, cartItem);

      if (result.needsConfirmation) {
        Alert.alert(
          'Switch store?',
          `Your cart has items from ${result.currentStore?.storeName}. Replace with ${result.newStore?.storeName}?`,
          [
            { text: 'Keep current', style: 'cancel' },
            {
              text: 'Replace cart',
              style: 'destructive',
              onPress: async () => {
                const forced = await addToCartWithValidation(user.id, cartItem, true);
                if (forced.success) {
                  Alert.alert(
                    'Added to Cart',
                    `${quantity} ${quantity > 1 ? 'items' : 'item'} from ${product.storeName}`,
                    [
                      { text: 'Browse Store', onPress: () => handleStorePress(product.storeId) },
                      { text: 'View Cart', onPress: () => router.push('/(main)/(customer)/cart') },
                    ]
                  );
                  setQuantity(1);
                }
              }
            }
          ]
        );
      } else if (result.success) {
        Alert.alert(
          'Added to Cart',
          `${quantity} ${quantity > 1 ? 'items' : 'item'} from ${product.storeName}`,
          [
            { text: 'Browse Store', onPress: () => handleStorePress(product.storeId) },
            { text: 'View Cart', onPress: () => router.push('/(main)/(customer)/cart') },
          ]
        );
        setQuantity(1); // Reset quantity after adding
      } else {
        Alert.alert('Error', 'Failed to add item to cart. Please try again.');
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      Alert.alert('Error', 'An error occurred. Please try again.');
    }
  };

  // Quick add related product to cart
  const handleQuickAddRelated = async (relatedProduct: Product) => {
    if (!user) {
      setToastMessage('Please sign in to add items to cart');
      setToastType('info');
      setShowToast(true);
      setTimeout(() => {
        router.push('/(auth)/signin');
      }, 1500);
      return;
    }

    if (relatedProduct.quantity === 0) {
      setToastMessage('Product is out of stock');
      setToastType('error');
      setShowToast(true);
      return;
    }

    try {
      setAddingRelatedId(relatedProduct.id);

      const cartItem: CartItem = {
        productId: relatedProduct.id,
        productName: relatedProduct.productName,
        productImage: relatedProduct.productImage,
        productImageUrl: relatedProduct.productImageUrl,
        storeId: relatedProduct.storeId,
        storeName: relatedProduct.storeName,
        quantity: 1,
        price: relatedProduct.price,
        weight: relatedProduct.productSize,
        unit: relatedProduct.unit,
        stock: relatedProduct.quantity,
        subtotal: relatedProduct.price * 1,
        isAvailable: relatedProduct.quantity > 0,
      };

      const result = await addToCartWithValidation(user.id, cartItem);

      if (result.needsConfirmation) {
        setToastMessage(`Switch cart to ${result.newStore?.storeName}?`);
        setToastType('info');
        setShowToast(true);
        // For quick add, silently replace on confirm path could be a modal, keep toast for now
      } else if (result.success) {
        setToastMessage(`${relatedProduct.productName} added to cart!`);
        setToastType('success');
        setShowToast(true);
      } else {
        setToastMessage('Failed to add product to cart');
        setToastType('error');
        setShowToast(true);
      }
    } catch (error) {
      console.error('Error adding related product:', error);
      setToastMessage('Failed to add to cart. Please try again.');
      setToastType('error');
      setShowToast(true);
    } finally {
      setAddingRelatedId(null);
    }
  };

  // Navigate to store page
  const handleStorePress = (storeId: string) => {
    router.push(`/(main)/shared/store-details?id=${storeId}`);
  };

  // Convert category name to URL-safe format for navigation
  const getCategorySlug = (categoryName: string): string => {
    const categoryMap: Record<string, string> = {
      'Fruits & Vegetables': 'fruits-vegetables',
      'Dairy & Bakery': 'dairy-bakery',
      'Snacks & Sweets': 'snacks-sweets',
      'Beverages': 'beverages',
      'Personal & Baby Care': 'personal-baby-care',
      'Home & Kitchen': 'home-kitchen',
      'Staple Foods': 'staple-foods',
      'Condiments & Cooking': 'condiments-cooking',
      'Frozen Goods': 'frozen-goods',
      'Miscellaneous & Others': 'miscellaneous',
    };
    return categoryMap[categoryName] || 'fruits-vegetables';
  };

  // Carousel navigation
  const scrollToImage = (index: number) => {
    carouselRef.current?.scrollTo({
      x: SCREEN_WIDTH * index,
      animated: true,
    });
    setCurrentImageIndex(index);
  };

  const handlePrevImage = () => {
    const newIndex = currentImageIndex > 0 ? currentImageIndex - 1 : 2;
    scrollToImage(newIndex);
  };

  const handleNextImage = () => {
    const newIndex = currentImageIndex < 2 ? currentImageIndex + 1 : 0;
    scrollToImage(newIndex);
  };

  // Scroll to top handler
  const scrollToTop = () => {
    mainScrollRef.current?.scrollTo({ y: 0, animated: true });
  };

  // Handle scroll event to show/hide scroll-to-top button
  const handleScroll = (event: any) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    setShowScrollTop(offsetY > 500); // Show button after scrolling 500px
  };

  // Loading state
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar barStyle="dark-content" backgroundColor="#F4F6F6" />
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Loading product details...</Text>
      </View>
    );
  }

  // Error state
  if (!product) {
    return (
      <View style={styles.errorContainer}>
        <StatusBar barStyle="dark-content" backgroundColor="#F4F6F6" />
        <Text style={styles.errorText}>Product not found</Text>
        <TouchableOpacity style={styles.backToHomeButton} onPress={() => router.back()}>
          <Text style={styles.backToHomeText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const productImages = getProductImages();
  const isOutOfStock = product.quantity === 0;
  const isLowStock = product.quantity > 0 && product.quantity < 10;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F4F6F6" />

      {/* Header with back button - Fixed at top above everything */}
      <View style={styles.header}>
        {/* Back Button - Figma: x:20, y:79, width:30, height:30 */}
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Image
            source={require('../../../src/assets/images/product-details/back-button.png')}
            style={styles.backIcon}
          />
        </TouchableOpacity>

        {/* Title - Figma: x:149, y:83, width:143, height:22 */}
        <Text style={styles.headerTitle}>Product Details</Text>

        {/* Notification Button - Figma: x:375, y:74, width:40, height:40 */}
        <TouchableOpacity style={styles.notificationButton}>
          <Image
            source={require('../../../src/assets/images/product-details/notification-icon.png')}
            style={styles.notificationIcon}
          />
        </TouchableOpacity>
      </View>

      <ScrollView
        ref={mainScrollRef}
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        bounces={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        {/* Product Images Carousel - Figma: x:-142, y:0, width:725, height:480 */}
        <View style={styles.productImagesContainer}>
          {/* Background Rectangle - Figma: x:0, y:0, width:440, height:480 */}
          <View style={styles.imageBackground} />

          {/* Horizontal Scrolling Carousel */}
          <ScrollView
            ref={carouselRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={Animated.event(
              [{ nativeEvent: { contentOffset: { x: scrollX } } }],
              {
                useNativeDriver: false,
                listener: (event: any) => {
                  const offsetX = event.nativeEvent.contentOffset.x;
                  const index = Math.round(offsetX / SCREEN_WIDTH);
                  setCurrentImageIndex(index);
                },
              }
            )}
            scrollEventThrottle={16}
            style={styles.carousel}
            contentContainerStyle={styles.carouselContent}
          >
            {productImages.map((image, index) => (
              <View key={`carousel-${index}`} style={styles.carouselImageContainer}>
                <Image
                  source={image}
                  style={styles.carouselImage}
                  resizeMode="contain"
                />
              </View>
            ))}
          </ScrollView>

          {/* Left Navigation Arrow - Figma: Upper Left */}
          <TouchableOpacity
            style={styles.leftArrowContainer}
            onPress={handlePrevImage}
          >
            <Text style={styles.arrowText}>‹</Text>
          </TouchableOpacity>

          {/* Right Navigation Arrow - Figma: Upper Right */}
          <TouchableOpacity
            style={styles.rightArrowContainer}
            onPress={handleNextImage}
          >
            <Text style={styles.arrowText}>›</Text>
          </TouchableOpacity>

          {/* Small Image Thumbnails - Figma: x:185, y:415, width:70, height:20 */}
          <View style={styles.thumbnailContainer}>
            {productImages.slice(0, 3).map((image, index) => (
              <TouchableOpacity
                key={`thumbnail-${index}`}
                style={[
                  styles.thumbnail,
                  currentImageIndex === index && styles.selectedThumbnail
                ]}
                onPress={() => scrollToImage(index)}
              >
                <Image source={image} style={styles.thumbnailImage} resizeMode="cover" />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Indicator Lines - Figma: x:201, y:485, width:38, height:0 */}
        <View style={styles.indicatorLines}>
          {productImages.map((_, index) => (
            <View
              key={`indicator-${index}`}
              style={[
                styles.indicatorLine,
                currentImageIndex === index && styles.selectedLine
              ]}
            />
          ))}
        </View>

        {/* Product Information Section */}
        <View style={styles.productInfoContainer}>
          {/* Product Name and Details - Left side */}
          <View style={styles.productDetailsContainer}>
            <Text style={styles.productName} numberOfLines={3}>{product.productName}</Text>
            {product.storeName && (
              <Text style={styles.storeNameLabel}>from {product.storeName}</Text>
            )}
            {product.productSize && (
              <Text style={styles.productWeight}>{product.productSize} {product.unit}</Text>
            )}
            {/* Stock availability badge - Enhanced */}
            <View style={styles.stockBadgeContainer}>
              {isOutOfStock ? (
                <View style={styles.outOfStockBadge}>
                  <Text style={styles.outOfStockBadgeText}>⚠️ Out of Stock</Text>
                </View>
              ) : isLowStock ? (
                <View style={styles.lowStockBadge}>
                  <Text style={styles.lowStockBadgeText}>🔥 Only {product.quantity} left in stock!</Text>
                </View>
              ) : (
                <View style={styles.inStockBadge}>
                  <Text style={styles.inStockBadgeText}>✓ {product.quantity} available</Text>
                </View>
              )}
            </View>
          </View>

          {/* Price - Right side */}
          <View style={styles.priceContainer}>
            <Text style={styles.productPrice}>₱{product.price.toFixed(2)}</Text>
          </View>
        </View>

        {/* Rating Section - Full width below product info */}
        <View style={styles.ratingSection}>
          <View style={styles.ratingContainer}>
            <Image
              source={require('../../../src/assets/images/product-details/star-icon.png')}
              style={styles.starIcon}
            />
            <Text style={styles.ratingText}>
              {product.rating ? product.rating.toFixed(1) : '0.0'} / 5.0
            </Text>
            {product.totalReviews && (
              <Text style={styles.reviewCount}>({product.totalReviews} Reviews)</Text>
            )}
            {!product.rating && (
              <Text style={styles.noRatingText}>(No ratings yet)</Text>
            )}
          </View>
        </View>

        {/* Description Section - Figma: x:20, y:606, width:400, height:82 */}
        <View style={styles.descriptionContainer}>
          <Text style={styles.descriptionTitle}>Description</Text>
          <Text style={styles.descriptionText}>
            {product.description || 'Made with baby grade grains, real and fresh fruits and vegetables, and 18 essential vitamins and minerals. CERELAC Infant cereals undergoes 100+ quality and safe checks and it does not contain preservatives and artificial colors,... Read more'}
          </Text>
        </View>

        {/* Related Items Section - Products from same category */}
        {relatedProducts.length > 0 && (
          <>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Related Items</Text>
              <TouchableOpacity onPress={() => router.push(`/(main)/(customer)/category-detail?category=${getCategorySlug(product.category)}`)}>
                <Text style={styles.seeMoreText}>See more</Text>
              </TouchableOpacity>
            </View>

            {/* Related Products Horizontal Scroll - Using ProductCard component */}
            <ScrollView
              horizontal
              style={styles.relatedProductsContainer}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.relatedProductsContent}
            >
              {relatedProducts.map((relatedProduct) => (
                <ProductCard
                  key={relatedProduct.id}
                  title={relatedProduct.productName || 'Unnamed Product'}
                  subtitle={relatedProduct.storeName ? `(${relatedProduct.storeName})` : ''}
                  weight={relatedProduct.productSize && relatedProduct.unit ? `${relatedProduct.productSize} ${relatedProduct.unit}` : ''}
                  price={relatedProduct.price ? `₱${relatedProduct.price.toFixed(2)}` : '₱0.00'}
                  image={getProductImageSource(relatedProduct)}
                  variant="horizontal"
                  onAddPress={() => handleQuickAddRelated(relatedProduct)}
                  onPress={() => router.push(`/(main)/shared/product-details?id=${relatedProduct.id}`)}
                  isAdding={addingRelatedId === relatedProduct.id}
                />
              ))}
            </ScrollView>
          </>
        )}

        {/* Other Store Section - Same design as customer home Featured Stores */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Other Store</Text>
          <TouchableOpacity onPress={() => router.push(`/(main)/(customer)/stores-list?excludeStoreId=${product.storeId}`)}>
            <Text style={styles.seeMoreText}>See more</Text>
          </TouchableOpacity>
        </View>

        {/* Store Cards - Same design as customer home Featured Stores */}
        {otherStores.length > 0 && (
          <View style={styles.storesContainer}>
            {otherStores.map((otherStore, index) => (
              <TouchableOpacity
                key={`store-${otherStore.id}-${index}`}
                style={styles.storeCard}
                onPress={() => handleStorePress(otherStore.id)}
                activeOpacity={0.8}
              >
                {/* White Background */}
                <View style={styles.storeCardWhiteBackground} />

                {/* Store Cover Image or Default Background */}
                {getStoreCoverSource(otherStore) ? (
                  <Image
                    source={getStoreCoverSource(otherStore)!}
                    style={styles.storeImageBackground}
                    resizeMode="cover"
                  />
                ) : (
                  <Image
                    source={require('../../../src/assets/images/customer-home/stores/store-background.png')}
                    style={styles.storeImageBackground}
                    resizeMode="cover"
                  />
                )}

                {/* Store Logo */}
                <View style={styles.storeLogoContainer}>
                  {getStoreLogoSource(otherStore) ? (
                    <Image
                      source={getStoreLogoSource(otherStore)!}
                      style={styles.storeLogo}
                      resizeMode="cover"
                    />
                  ) : (
                    <Image
                      source={require('../../../src/assets/images/stores/store-profile-placeholder.png')}
                      style={styles.storeLogo}
                      resizeMode="contain"
                    />
                  )}
                </View>

                {/* Store Name */}
                <Text style={styles.storeName} numberOfLines={1}>{otherStore.storeName}</Text>

                {/* Rating and Meta Container */}
                <View style={styles.storeMetaContainer}>
                  <Image
                    source={require('../../../src/assets/images/customer-home/stores/star-icon.png')}
                    style={styles.storeStarIcon}
                  />
                  <Text style={styles.storeRatingText}>5.0</Text>
                  <Text style={styles.storeDistance}>• 1.3 km</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Spacer for bottom buttons */}
        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Bottom Action Bar - Figma: x:0, y:839, width:440, height:120 */}
      <View style={styles.bottomActionBar}>
        {/* Quantity Controls - Figma: x:20, y:884, width:180, height:50 */}
        <View style={styles.quantityContainer}>
          <TouchableOpacity
            style={styles.quantityButton}
            onPress={decreaseQuantity}
            disabled={quantity <= 1}
          >
            <Image
              source={require('../../../src/assets/images/product-details/minus-icon.png')}
              style={styles.quantityIcon}
            />
          </TouchableOpacity>

          <Text style={styles.quantityText}>{quantity}</Text>

          <TouchableOpacity
            style={styles.quantityButton}
            onPress={increaseQuantity}
            disabled={isOutOfStock || quantity >= product.quantity}
          >
            <Image
              source={require('../../../src/assets/images/product-details/plus-icon.png')}
              style={styles.quantityIcon}
            />
          </TouchableOpacity>
        </View>

        {/* Add to Cart Button - Figma: x:240, y:884, width:180, height:50 */}
        <TouchableOpacity
          style={[styles.addToCartButton, isOutOfStock && styles.disabledButton]}
          onPress={handleAddToCart}
          disabled={isOutOfStock}
        >
          <Image
            source={require('../../../src/assets/images/product-details/cart-icon.png')}
            style={styles.cartIcon}
          />
          <Text style={styles.addToCartText}>
            {isOutOfStock ? 'Out of Stock' : 'Add to cart'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Scroll to Top Button - Shows after scrolling down */}
      {showScrollTop && (
        <TouchableOpacity style={styles.scrollToTopButton} onPress={scrollToTop}>
          <Text style={styles.scrollToTopText}>↑</Text>
        </TouchableOpacity>
      )}

      {/* Toast Notification */}
      <Toast
        visible={showToast}
        message={toastMessage}
        type={toastType}
        onDismiss={() => setShowToast(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F6F6', // Figma background color
  },

  scrollContainer: {
    flex: 1,
  },

  // Loading state
  loadingContainer: {
    flex: 1,
    backgroundColor: '#F4F6F6',
    justifyContent: 'center',
    alignItems: 'center',
  },

  loadingText: {
    marginTop: vs(20),
    fontSize: ms(16),
    color: Colors.darkGray,
  },

  // Error state
  errorContainer: {
    flex: 1,
    backgroundColor: '#F4F6F6',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: s(40),
  },

  errorText: {
    fontSize: ms(18),
    fontWeight: '600',
    color: Colors.darkGray,
    marginBottom: vs(20),
  },

  backToHomeButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: s(30),
    paddingVertical: vs(12),
    borderRadius: s(20),
  },

  backToHomeText: {
    color: Colors.white,
    fontSize: ms(16),
    fontWeight: '500',
  },

  // Product Images Carousel - Reduced height to prevent overlap
  productImagesContainer: {
    width: '100%',
    height: vs(360),
    position: 'relative',
    overflow: 'hidden',
    marginTop: vs(120), // Space for fixed header
  },

  imageBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#F4F6F6', // Same as page background for seamless blending
  },

  // Horizontal Carousel
  carousel: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },

  carouselContent: {
    alignItems: 'center',
  },

  carouselImageContainer: {
    width: SCREEN_WIDTH,
    height: vs(360),
    justifyContent: 'center',
    alignItems: 'center',
  },

  carouselImage: {
    width: SCREEN_WIDTH,
    height: vs(280),
  },

  // Navigation Arrows with Diagonal Lines
  leftArrowContainer: {
    position: 'absolute',
    top: vs(160),
    left: s(10),
    width: s(40),
    height: s(40),
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },

  rightArrowContainer: {
    position: 'absolute',
    top: vs(160),
    right: s(10),
    width: s(40),
    height: s(40),
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },

  arrowText: {
    fontSize: ms(40),
    fontWeight: 'bold',
    color: Colors.primary,
  },

  // Thumbnail Container - Adjusted for smaller carousel
  thumbnailContainer: {
    position: 'absolute',
    left: s(185),
    top: vs(320),
    width: s(70),
    height: vs(20),
    flexDirection: 'row',
    justifyContent: 'space-between',
    zIndex: 5,
  },

  thumbnail: {
    width: s(20),
    height: vs(20),
    borderRadius: s(5),
    overflow: 'hidden',
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: s(10),
    elevation: 5,
  },

  selectedThumbnail: {
    borderWidth: 2,
    borderColor: Colors.primary,
  },

  thumbnailImage: {
    width: '100%',
    height: '100%',
  },

  // Header - Fixed at top above everything with solid background
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: vs(120),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: s(20),
    paddingTop: vs(50),
    zIndex: 1000,
    backgroundColor: '#F4F6F6', // Solid background - prevents image bleed-through
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: vs(2) },
    shadowOpacity: 0.1,
    shadowRadius: s(4),
    elevation: 3,
  },

  // Back Button - Figma: x:20, y:79, width:30, height:30
  backButton: {
    width: s(30),
    height: s(30),
    backgroundColor: Colors.white,
    borderRadius: s(20),
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: s(4),
    elevation: 5,
  },

  backIcon: {
    width: s(15),
    height: s(15),
  },

  // Header Title - Figma: x:149, y:83, width:143, height:22
  headerTitle: {
    fontSize: ms(20),
    fontWeight: '600',
    color: Colors.darkGray,
    textAlign: 'center',
  },

  // Notification Button - Figma: x:375, y:74, width:40, height:40
  notificationButton: {
    width: s(40),
    height: s(40),
    backgroundColor: Colors.white,
    borderRadius: s(20),
    justifyContent: 'center',
    alignItems: 'center',
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

  // Indicator Lines - Figma: x:201, y:485, width:38, height:0
  indicatorLines: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: vs(5),
    gap: s(5),
  },

  indicatorLine: {
    width: s(6),
    height: 4,
    backgroundColor: Colors.black,
    borderRadius: 2,
  },

  selectedLine: {
    width: s(16),
    backgroundColor: '#E92B45',
  },

  // Product Information Container - Adjusted spacing
  productInfoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: s(20),
    marginTop: vs(15),
    alignItems: 'flex-start',
  },

  // Product Details - Figma: x:20, y:520
  productDetailsContainer: {
    flex: 1,
    paddingRight: s(15),
    maxWidth: '65%',
  },

  productName: {
    fontSize: ms(20),
    fontWeight: '600',
    color: Colors.black,
    lineHeight: vs(24),
    marginBottom: vs(5),
    flexWrap: 'wrap',
  },

  storeNameLabel: {
    fontSize: ms(13),
    fontWeight: '500',
    color: Colors.primary,
    lineHeight: vs(18),
    marginBottom: vs(4),
    fontStyle: 'italic',
  },

  productWeight: {
    fontSize: ms(14),
    fontWeight: '400',
    color: 'rgba(0, 0, 0, 0.5)',
    lineHeight: vs(22),
  },

  outOfStockText: {
    fontSize: ms(12),
    fontWeight: '600',
    color: '#E92B45',
    marginTop: vs(4),
  },

  lowStockText: {
    fontSize: ms(12),
    fontWeight: '600',
    color: '#FF9800',
    marginTop: vs(4),
  },

  // Stock Badge Container - Enhanced visual indicators
  stockBadgeContainer: {
    marginTop: vs(8),
  },

  inStockBadge: {
    paddingHorizontal: s(12),
    paddingVertical: vs(6),
    backgroundColor: '#E8F5E9',
    borderRadius: s(8),
    borderWidth: 1,
    borderColor: '#4CAF50',
    alignSelf: 'flex-start',
  },

  inStockBadgeText: {
    fontSize: ms(12),
    fontWeight: '600',
    color: '#2E7D32',
  },

  lowStockBadge: {
    paddingHorizontal: s(12),
    paddingVertical: vs(6),
    backgroundColor: '#FFF3E0',
    borderRadius: s(8),
    borderWidth: 1,
    borderColor: '#FF9800',
    alignSelf: 'flex-start',
  },

  lowStockBadgeText: {
    fontSize: ms(12),
    fontWeight: '700',
    color: '#E65100',
  },

  outOfStockBadge: {
    paddingHorizontal: s(12),
    paddingVertical: vs(6),
    backgroundColor: '#FFEBEE',
    borderRadius: s(8),
    borderWidth: 1,
    borderColor: '#E92B45',
    alignSelf: 'flex-start',
  },

  outOfStockBadgeText: {
    fontSize: ms(12),
    fontWeight: '700',
    color: '#C62828',
  },

  // Price Container - Right side
  priceContainer: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },

  productPrice: {
    fontSize: ms(26),
    fontWeight: '700',
    color: Colors.primary,
    lineHeight: vs(30),
  },

  // Rating Section - Full width below product info
  ratingSection: {
    paddingHorizontal: s(20),
    marginTop: vs(10),
    marginBottom: vs(5),
  },

  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: s(8),
  },

  starIcon: {
    width: s(16),
    height: s(16),
  },

  ratingText: {
    fontSize: ms(14),
    fontWeight: '500',
    color: Colors.darkGray,
    lineHeight: vs(18),
  },

  reviewCount: {
    fontSize: ms(12),
    fontWeight: '400',
    color: 'rgba(0, 0, 0, 0.5)',
    lineHeight: vs(18),
    marginLeft: s(5),
  },

  noRatingText: {
    fontSize: ms(12),
    fontWeight: '400',
    color: 'rgba(0, 0, 0, 0.4)',
    fontStyle: 'italic',
    lineHeight: vs(18),
  },

  // Description Section - Figma: x:20, y:606, width:400, height:82
  descriptionContainer: {
    paddingHorizontal: s(20),
    marginTop: vs(18),
    marginBottom: vs(40), // Increased from 20 to 40 to create more space
  },

  descriptionTitle: {
    fontSize: ms(18),
    fontWeight: '500',
    color: Colors.black,
    lineHeight: vs(22),
    marginBottom: vs(4),
  },

  descriptionText: {
    fontSize: ms(14),
    fontWeight: '400',
    color: 'rgba(0, 0, 0, 0.5)',
    lineHeight: vs(20),
  },

  // Section Headers - Figma: x:22, y:728, width:397, height:26
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: s(22),
    marginTop: vs(30), // Space above section headers
    marginBottom: vs(15), // Space below section headers
  },

  sectionTitle: {
    fontSize: ms(20), // Reduced from 24 to 20 for better visibility
    fontWeight: '500',
    color: Colors.black,
    lineHeight: vs(24), // Adjusted line height to match font size
  },

  seeMoreText: {
    fontSize: ms(14),
    fontWeight: '500',
    color: 'rgba(0, 0, 0, 0.5)',
    lineHeight: vs(22),
  },

  // Related Products Container - Uses ProductCard component
  relatedProductsContainer: {
    marginBottom: vs(10),
  },

  relatedProductsContent: {
    paddingLeft: s(23),
    paddingRight: s(23),
  },

  // Store Cards Container - Same as customer home
  storesContainer: {
    marginLeft: s(20),
    marginRight: s(20),
    marginBottom: vs(20),
  },

  // Store Card - Same as customer home Featured Stores
  storeCard: {
    width: s(400),
    height: vs(150),
    marginBottom: vs(20),
    position: 'relative',
    borderRadius: s(20),
    overflow: 'hidden',
  },

  // Store White Background
  storeCardWhiteBackground: {
    position: 'absolute',
    width: s(399),
    height: vs(150),
    backgroundColor: Colors.white,
    borderRadius: s(20),
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: vs(4) },
    shadowOpacity: 0.25,
    shadowRadius: s(10),
    elevation: 10,
  },

  // Store Image Background
  storeImageBackground: {
    position: 'absolute',
    left: s(1),
    top: 0,
    width: s(399),
    height: vs(90),
    borderTopLeftRadius: s(20),
    borderTopRightRadius: s(20),
  },

  // Store Logo Container
  storeLogoContainer: {
    position: 'absolute',
    left: s(11),
    top: vs(50),
    width: s(30),
    height: s(30),
    borderRadius: s(15),
    backgroundColor: Colors.primary,
    overflow: 'hidden',
  },

  storeLogo: {
    width: s(30),
    height: s(30),
  },

  // Store Name
  storeName: {
    position: 'absolute',
    left: s(11),
    top: vs(96),
    fontFamily: 'Clash Grotesk Variable',
    fontWeight: '500',
    fontSize: ms(20),
    lineHeight: ms(20) * 1.1,
    color: Colors.darkGray,
  },

  // Store Meta Container
  storeMetaContainer: {
    position: 'absolute',
    left: s(11),
    top: vs(117),
    flexDirection: 'row',
    alignItems: 'center',
  },

  // Store Star Icon
  storeStarIcon: {
    width: s(10),
    height: s(10),
    marginTop: vs(6),
  },

  // Store Rating
  storeRatingText: {
    marginLeft: s(5),
    fontFamily: 'Clash Grotesk Variable',
    fontWeight: '400',
    fontSize: ms(12),
    lineHeight: ms(12) * 1.833,
    color: 'rgba(0, 0, 0, 0.5)',
  },

  // Store Distance
  storeDistance: {
    marginLeft: s(10),
    fontFamily: 'Clash Grotesk Variable',
    fontWeight: '400',
    fontSize: ms(12),
    lineHeight: ms(12) * 1.833,
    color: 'rgba(0, 0, 0, 0.5)',
  },

  // Bottom Spacer - Adjusted for better scrolling
  bottomSpacer: {
    height: vs(140),
  },

  // Bottom Action Bar - Reduced spacing
  bottomActionBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: vs(100),
    backgroundColor: Colors.white,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: s(20),
    paddingTop: vs(15),
    paddingBottom: vs(15),
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: vs(-2) },
    shadowOpacity: 0.25,
    shadowRadius: s(10),
    elevation: 10,
  },

  // Quantity Container - Figma: x:20, y:884, width:180, height:50
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.white,
    borderRadius: s(20),
    width: s(180),
    height: vs(50),
    paddingHorizontal: s(20),
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: s(5),
    elevation: 5,
  },

  quantityButton: {
    width: s(30),
    height: s(30),
    borderRadius: s(15),
    borderWidth: 1,
    borderColor: '#02545F',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.white,
  },

  quantityIcon: {
    width: s(15),
    height: s(15),
  },

  quantityText: {
    fontSize: ms(24),
    fontWeight: '500',
    color: Colors.darkGray,
  },

  // Add to Cart Button - Figma: x:240, y:884, width:180, height:50
  addToCartButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.white,
    borderRadius: s(20),
    width: s(180),
    height: vs(50),
    gap: s(10),
    shadowColor: '#02545F',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: s(5),
    elevation: 5,
  },

  disabledButton: {
    opacity: 0.5,
  },

  cartIcon: {
    width: s(25),
    height: s(25),
  },

  addToCartText: {
    fontSize: ms(16),
    fontWeight: '500',
    color: '#02545F',
    lineHeight: vs(22),
  },

  // Scroll to Top Button
  scrollToTopButton: {
    position: 'absolute',
    bottom: vs(120),
    right: s(20),
    width: s(50),
    height: s(50),
    borderRadius: s(25),
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: vs(4) },
    shadowOpacity: 0.3,
    shadowRadius: s(8),
    elevation: 8,
    zIndex: 100,
  },

  scrollToTopText: {
    fontSize: ms(28),
    fontWeight: 'bold',
    color: Colors.white,
  },
});
