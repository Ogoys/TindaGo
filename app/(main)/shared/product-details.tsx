/**
 * PRODUCT DETAILS SCREEN - Dynamic Product Display
 *
 * Figma File: 8I1Nr3vQZllDDknSevstvH
 * Node: 903-785 (Product Details)
 * Baseline: 440x1798
 *
 * Features:
 * - Dynamic product loading from Firebase using route params
 * - Add to cart functionality with stock validation
 * - Related products fetching by category
 * - Store information display
 * - Image gallery with thumbnail selection
 * - Quantity controls with stock limits
 * - Loading and error states
 */

import { useLocalSearchParams, router } from 'expo-router';
import React, { useState, useEffect } from 'react';
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
} from 'react-native';
import { ProductCard, StoreCard } from '../../../src/components/ui';
import { Colors } from '../../../src/constants/Colors';
import { s, vs, ms } from '../../../src/constants/responsive';
import { useUser } from '../../../src/contexts/UserContext';
import { fetchProductById, fetchProductsByCategory } from '../../../src/api/products';
import { fetchStoreById } from '../../../src/api/stores';
import { addToCart } from '../../../src/api/cart';
import type { Product } from '../../../src/models/Product';
import type { Store } from '../../../src/models/Store';
import type { CartItem } from '../../../src/models/Cart';

export default function ProductDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useUser();

  // State management
  const [product, setProduct] = useState<Product | null>(null);
  const [store, setStore] = useState<Store | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

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
        const productData = await fetchProductById(id);
        if (!productData) {
          Alert.alert('Error', 'Product not found');
          router.back();
          return;
        }
        setProduct(productData);

        // Fetch store information
        if (productData.storeId) {
          const storeData = await fetchStoreById(productData.storeId);
          setStore(storeData);
        }

        // Fetch related products from same category
        if (productData.categoryId) {
          const related = await fetchProductsByCategory(productData.categoryId);
          // Filter out current product and limit to 4 items
          const filteredRelated = related
            .filter(p => p.id !== productData.id)
            .slice(0, 4);
          setRelatedProducts(filteredRelated);
        }
      } catch (error) {
        console.error('Error loading product:', error);
        Alert.alert('Error', 'Failed to load product details');
      } finally {
        setLoading(false);
      }
    };

    loadProductData();
  }, [id]);

  // Get product images
  const getProductImages = () => {
    if (!product) return [];
    if (product.images && product.images.length > 0) {
      return product.images;
    }
    return product.imageUrl ? [product.imageUrl] : [];
  };

  // Quantity controls with stock validation
  const increaseQuantity = () => {
    if (product && quantity < product.stock) {
      setQuantity(prev => prev + 1);
    } else {
      Alert.alert('Stock Limit', `Only ${product?.stock} items available`);
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
    if (product.stock === 0) {
      Alert.alert('Out of Stock', 'This product is currently out of stock');
      return;
    }

    if (quantity > product.stock) {
      Alert.alert('Stock Limit', `Only ${product.stock} items available`);
      return;
    }

    try {
      const cartItem: CartItem = {
        productId: product.id,
        productName: product.name,
        productImage: product.imageUrl,
        storeId: product.storeId,
        storeName: product.storeName,
        quantity: quantity,
        price: product.price,
        weight: product.weight,
        unit: product.unit,
        stock: product.stock,
        subtotal: product.price * quantity,
        isAvailable: product.stock > 0,
      };

      const success = await addToCart(user.id, cartItem);

      if (success) {
        Alert.alert(
          'Success',
          `${quantity} ${quantity > 1 ? 'items' : 'item'} added to cart`,
          [
            { text: 'Continue Shopping', style: 'cancel' },
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

  // Navigate to store page
  const handleStorePress = () => {
    if (store) {
      // TODO: Implement store details screen
      Alert.alert('Store Info', `View ${store.name} details`);
    }
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
  const isOutOfStock = product.stock === 0;
  const isLowStock = product.stock > 0 && product.stock < 10;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F4F6F6" />

      <ScrollView
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        {/* Product Images Section - Figma: x:-142, y:0, width:725, height:480 */}
        <View style={styles.productImagesContainer}>
          {/* Background Rectangle */}
          <View style={styles.imageBackground} />

          {/* Red Blur Circle - Figma: x:121, y:140, width:200, height:200 */}
          <View style={styles.redBlurCircle} />

          {/* Main Product Image */}
          <View style={styles.mainImageContainer}>
            {productImages.length > 0 ? (
              <Image
                source={{ uri: productImages[selectedImageIndex] }}
                style={styles.mainProductImage}
                resizeMode="contain"
              />
            ) : (
              <View style={styles.placeholderImage}>
                <Text style={styles.placeholderText}>No Image</Text>
              </View>
            )}
          </View>

          {/* Small Image Thumbnails - Figma: x:185, y:415, width:70, height:20 */}
          {productImages.length > 1 && (
            <View style={styles.thumbnailContainer}>
              {productImages.slice(0, 3).map((image, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.thumbnail,
                    selectedImageIndex === index && styles.selectedThumbnail
                  ]}
                  onPress={() => setSelectedImageIndex(index)}
                >
                  <Image source={{ uri: image }} style={styles.thumbnailImage} resizeMode="cover" />
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Header with back button */}
        <View style={styles.header}>
          {/* Back Button - Figma: x:20, y:79, width:30, height:30 */}
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Image
              source={require('../../../src/assets/images/product-details/chevron-left.svg')}
              style={styles.backIcon}
            />
          </TouchableOpacity>

          {/* Title - Figma: x:152, y:83, width:137, height:22 */}
          <Text style={styles.headerTitle}>Product Details</Text>

          {/* Notification Button - Figma: x:375, y:74, width:40, height:40 */}
          <TouchableOpacity style={styles.notificationButton}>
            <Image
              source={require('../../../src/assets/images/product-details/notification-icon.svg')}
              style={styles.notificationIcon}
            />
          </TouchableOpacity>
        </View>

        {/* Indicator Lines - Figma: x:201, y:485, width:38, height:0 */}
        {productImages.length > 1 && (
          <View style={styles.indicatorLines}>
            {productImages.slice(0, 3).map((_, index) => (
              <View
                key={index}
                style={[
                  styles.indicatorLine,
                  selectedImageIndex === index && styles.selectedLine
                ]}
              />
            ))}
          </View>
        )}

        {/* Product Information Section */}
        <View style={styles.productInfoContainer}>
          {/* Product Name and Details - Figma: x:20, y:520, width:162, height:68 */}
          <View style={styles.productDetailsContainer}>
            <Text style={styles.productName}>{product.name}</Text>
            {product.description && (
              <Text style={styles.productSubtitle} numberOfLines={1}>
                {product.description}
              </Text>
            )}
            {product.weight && (
              <Text style={styles.productWeight}>{product.weight}</Text>
            )}
            {/* Stock indicator */}
            {isOutOfStock && (
              <Text style={styles.outOfStockText}>Out of Stock</Text>
            )}
            {isLowStock && (
              <Text style={styles.lowStockText}>Only {product.stock} left!</Text>
            )}
          </View>

          {/* Rating and Price Section - Figma: x:305, y:520, width:115, height:46 */}
          <View style={styles.ratingPriceContainer}>
            <Text style={styles.productPrice}>₱{product.price.toFixed(2)}</Text>
            {product.rating && (
              <View style={styles.ratingContainer}>
                <Image
                  source={require('../../../src/assets/images/product-details/star-icon.svg')}
                  style={styles.starIcon}
                />
                <Text style={styles.ratingText}>{product.rating.toFixed(1)}/5</Text>
                {product.totalReviews && (
                  <Text style={styles.reviewCount}>({product.totalReviews}+Review)</Text>
                )}
              </View>
            )}
          </View>
        </View>

        {/* Category Badge */}
        {product.category && (
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{product.category}</Text>
          </View>
        )}

        {/* Store Information */}
        {store && (
          <TouchableOpacity style={styles.storeInfoContainer} onPress={handleStorePress}>
            <Text style={styles.storeLabel}>Sold by:</Text>
            <Text style={styles.storeName}>{store.name}</Text>
            {store.rating && (
              <View style={styles.storeRating}>
                <Image
                  source={require('../../../src/assets/images/product-details/star-icon.svg')}
                  style={styles.storeStarIcon}
                />
                <Text style={styles.storeRatingText}>{store.rating.toFixed(1)}</Text>
              </View>
            )}
          </TouchableOpacity>
        )}

        {/* Description Section - Figma: x:20, y:606, width:400, height:82 */}
        <View style={styles.descriptionContainer}>
          <Text style={styles.descriptionTitle}>Description</Text>
          <Text style={styles.descriptionText}>{product.description}</Text>
        </View>

        {/* Related Items Section - Figma: x:22, y:728, width:397, height:26 */}
        {relatedProducts.length > 0 && (
          <>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Related Items</Text>
              <TouchableOpacity onPress={() => router.push(`/(main)/(customer)/category?id=${product.categoryId}`)}>
                <Text style={styles.seeMoreText}>See more</Text>
              </TouchableOpacity>
            </View>

            {/* Related Products Horizontal Scroll - Figma: x:0, y:764, width:440, height:191 */}
            <ScrollView
              horizontal
              style={styles.relatedProductsContainer}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.relatedProductsContent}
            >
              {relatedProducts.map((relatedProduct) => (
                <ProductCard
                  key={relatedProduct.id}
                  title={relatedProduct.name}
                  price={`₱${relatedProduct.price.toFixed(2)}`}
                  image={{ uri: relatedProduct.imageUrl }}
                  variant="horizontal"
                  onPress={() => router.push(`/(main)/shared/product-details?id=${relatedProduct.id}`)}
                  onAddPress={() => {}}
                />
              ))}
            </ScrollView>
          </>
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
              source={require('../../../src/assets/images/product-details/minus-icon.svg')}
              style={styles.quantityIcon}
            />
          </TouchableOpacity>

          <Text style={styles.quantityText}>{quantity}</Text>

          <TouchableOpacity
            style={styles.quantityButton}
            onPress={increaseQuantity}
            disabled={isOutOfStock || quantity >= product.stock}
          >
            <Image
              source={require('../../../src/assets/images/product-details/plus-icon.svg')}
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
            source={require('../../../src/assets/images/product-details/cart-icon.svg')}
            style={styles.cartIcon}
          />
          <Text style={styles.addToCartText}>
            {isOutOfStock ? 'Out of Stock' : 'Add to cart'}
          </Text>
        </TouchableOpacity>
      </View>
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

  // Product Images Section - Figma: x:-142, y:0, width:725, height:480
  productImagesContainer: {
    width: '100%',
    height: vs(480),
    position: 'relative',
    overflow: 'hidden',
  },

  imageBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: Colors.white,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: s(10),
    elevation: 5,
  },

  // Red Blur Circle - Figma: x:121, y:140, width:200, height:200
  redBlurCircle: {
    position: 'absolute',
    left: s(121),
    top: vs(140),
    width: s(200),
    height: s(200),
    backgroundColor: '#E2101C',
    borderRadius: s(100),
    opacity: 0.1,
  },

  // Main Product Image Container - Figma: x:104, y:155, width:233, height:250
  mainImageContainer: {
    position: 'absolute',
    left: s(104),
    top: vs(155),
    width: s(233),
    height: vs(250),
    justifyContent: 'center',
    alignItems: 'center',
  },

  mainProductImage: {
    width: '100%',
    height: '100%',
  },

  placeholderImage: {
    width: '100%',
    height: '100%',
    backgroundColor: Colors.lightGray,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: s(10),
  },

  placeholderText: {
    color: Colors.textSecondary,
    fontSize: ms(14),
  },

  // Thumbnail Container - Figma: x:185, y:415, width:70, height:20
  thumbnailContainer: {
    position: 'absolute',
    left: s(185),
    top: vs(415),
    width: s(70),
    height: vs(20),
    flexDirection: 'row',
    justifyContent: 'space-between',
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

  // Header - positioned over image
  header: {
    position: 'absolute',
    top: vs(74),
    left: 0,
    right: 0,
    height: vs(40),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: s(20),
    zIndex: 10,
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

  // Header Title - Figma: x:152, y:83, width:137, height:22
  headerTitle: {
    fontSize: ms(20),
    fontWeight: '500',
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

  // Product Information Container - Figma: x:20, y:520
  productInfoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: s(20),
    marginTop: vs(35),
    alignItems: 'flex-start',
  },

  // Product Details - Figma: x:20, y:520, width:162, height:68
  productDetailsContainer: {
    flex: 1,
    paddingRight: s(10),
  },

  productName: {
    fontSize: ms(24),
    fontWeight: '600',
    color: Colors.black,
    lineHeight: vs(22),
    marginBottom: vs(2),
  },

  productSubtitle: {
    fontSize: ms(14),
    fontWeight: '400',
    color: 'rgba(0, 0, 0, 0.5)',
    lineHeight: vs(22),
    marginBottom: vs(2),
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

  // Rating and Price - Figma: x:305, y:520, width:115, height:46
  ratingPriceContainer: {
    alignItems: 'flex-end',
  },

  productPrice: {
    fontSize: ms(24),
    fontWeight: '600',
    color: Colors.black,
    lineHeight: vs(22),
    marginBottom: vs(4),
  },

  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: s(5),
  },

  starIcon: {
    width: s(10),
    height: s(10),
  },

  ratingText: {
    fontSize: ms(14),
    fontWeight: '400',
    color: Colors.darkGray,
    lineHeight: vs(22),
  },

  reviewCount: {
    fontSize: ms(10),
    fontWeight: '400',
    color: 'rgba(0, 0, 0, 0.5)',
    lineHeight: vs(22),
  },

  // Category Badge
  categoryBadge: {
    alignSelf: 'flex-start',
    marginHorizontal: s(20),
    marginTop: vs(10),
    paddingHorizontal: s(12),
    paddingVertical: vs(6),
    backgroundColor: Colors.lightGreen,
    borderRadius: s(15),
  },

  categoryText: {
    fontSize: ms(12),
    fontWeight: '500',
    color: Colors.primary,
  },

  // Store Information
  storeInfoContainer: {
    marginHorizontal: s(20),
    marginTop: vs(12),
    padding: s(12),
    backgroundColor: Colors.white,
    borderRadius: s(10),
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: s(4),
    elevation: 3,
  },

  storeLabel: {
    fontSize: ms(12),
    color: Colors.textSecondary,
    marginRight: s(8),
  },

  storeName: {
    fontSize: ms(14),
    fontWeight: '600',
    color: Colors.primary,
    flex: 1,
  },

  storeRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: s(4),
  },

  storeStarIcon: {
    width: s(12),
    height: s(12),
  },

  storeRatingText: {
    fontSize: ms(12),
    fontWeight: '500',
    color: Colors.darkGray,
  },

  // Description Section - Figma: x:20, y:606, width:400, height:82
  descriptionContainer: {
    paddingHorizontal: s(20),
    marginTop: vs(18),
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
    marginTop: vs(40),
    marginBottom: vs(10),
  },

  sectionTitle: {
    fontSize: ms(24),
    fontWeight: '500',
    color: Colors.black,
    lineHeight: vs(22),
  },

  seeMoreText: {
    fontSize: ms(14),
    fontWeight: '500',
    color: 'rgba(0, 0, 0, 0.5)',
    lineHeight: vs(22),
  },

  // Related Products Container - Figma: x:0, y:764, width:440, height:191
  relatedProductsContainer: {
    marginTop: vs(6),
  },

  relatedProductsContent: {
    paddingHorizontal: s(20),
    gap: s(20),
  },

  // Bottom Spacer
  bottomSpacer: {
    height: vs(140),
  },

  // Bottom Action Bar - Figma: x:0, y:839, width:440, height:120
  bottomActionBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: vs(120),
    backgroundColor: Colors.white,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: s(20),
    paddingTop: vs(20),
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
});
