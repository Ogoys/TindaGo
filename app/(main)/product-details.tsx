import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  Image,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { ProductCard, StoreCard } from '../../src/components/ui';
import { Colors } from '../../src/constants/Colors';
import { s, vs } from '../../src/constants/responsive';

export default function ProductDetailsScreen() {
  const [quantity, setQuantity] = useState(0);
  const [selectedImageIndex, setSelectedImageIndex] = useState(1); // Middle image selected by default

  const productImages = [
    require('../../src/assets/images/product-details/product-image-3.png'),
    require('../../src/assets/images/product-details/product-image-2.png'),
    require('../../src/assets/images/product-details/product-image-1.png'),
  ];

  const relatedProducts = [
    {
      id: 1,
      title: 'Product 1',
      price: '₱50.00',
      image: require('../../src/assets/images/see-more/product-image.png'),
    },
    {
      id: 2,
      title: 'Product 2',
      price: '₱75.00',
      image: require('../../src/assets/images/see-more/product-image.png'),
    },
  ];

  const stores = [
    {
      id: 1,
      name: 'Golis Sari-sari',
      rating: '5.0',
      distance: '1.3 km',
      backgroundImage: require('../../src/assets/images/product-details/store-bg-image.png'),
      profileImage: require('../../src/assets/images/product-details/store-profile.png'),
    },
    {
      id: 2,
      name: 'Golis Sari-sari',
      rating: '5.0',
      distance: '1.3 km',
      backgroundImage: require('../../src/assets/images/product-details/store-bg-image.png'),
      profileImage: require('../../src/assets/images/product-details/store-profile.png'),
    },
    {
      id: 3,
      name: 'Golis Sari-sari',
      rating: '5.0',
      distance: '1.3 km',
      backgroundImage: require('../../src/assets/images/product-details/store-bg-image.png'),
      profileImage: require('../../src/assets/images/product-details/store-profile.png'),
    },
    {
      id: 4,
      name: 'Golis Sari-sari',
      rating: '5.0',
      distance: '1.3 km',
      backgroundImage: require('../../src/assets/images/product-details/store-bg-image.png'),
      profileImage: require('../../src/assets/images/product-details/store-profile.png'),
    },
  ];

  const increaseQuantity = () => setQuantity(prev => prev + 1);
  const decreaseQuantity = () => setQuantity(prev => Math.max(0, prev - 1));

  const handleAddToCart = () => {
    if (quantity > 0) {
      console.log('Added to cart:', quantity);
      router.push('/cart');
    }
  };

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
            <Image
              source={productImages[selectedImageIndex]}
              style={styles.mainProductImage}
              resizeMode="contain"
            />
          </View>
          
          {/* Small Image Thumbnails - Figma: x:185, y:415, width:70, height:20 */}
          <View style={styles.thumbnailContainer}>
            {productImages.map((image, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.thumbnail,
                  selectedImageIndex === index && styles.selectedThumbnail
                ]}
                onPress={() => setSelectedImageIndex(index)}
              >
                <Image source={image} style={styles.thumbnailImage} resizeMode="cover" />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Header with back button and notification */}
        <View style={styles.header}>
          {/* Back Button - Figma: x:20, y:79, width:30, height:30 */}
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Image
              source={require('../../src/assets/images/product-details/chevron-left.png')}
              style={styles.backIcon}
            />
          </TouchableOpacity>
          
          {/* Title - Figma: x:152, y:83, width:137, height:22 */}
          <Text style={styles.headerTitle}>Product Details</Text>
          
          {/* Notification Button - Figma: x:375, y:74, width:40, height:40 */}
          <TouchableOpacity style={styles.notificationButton}>
            <Image
              source={require('../../src/assets/images/product-details/notification-icon.png')}
              style={styles.notificationIcon}
            />
          </TouchableOpacity>
        </View>

        {/* Indicator Lines - Figma: x:201, y:485, width:38, height:0 */}
        <View style={styles.indicatorLines}>
          <View style={[styles.indicatorLine, styles.selectedLine]} />
          <View style={styles.indicatorLine} />
          <View style={styles.indicatorLine} />
        </View>

        {/* Product Information Section */}
        <View style={styles.productInfoContainer}>
          {/* Product Name and Details - Figma: x:20, y:520, width:162, height:68 */}
          <View style={styles.productDetailsContainer}>
            <Text style={styles.productName}>Nestle Cerelac</Text>
            <Text style={styles.productSubtitle}>Wheat Apple Cheery</Text>
            <Text style={styles.productWeight}>500g</Text>
          </View>

          {/* Rating and Price Section - Figma: x:305, y:520, width:115, height:46 */}
          <View style={styles.ratingPriceContainer}>
            <Text style={styles.productPrice}>₱100.54</Text>
            <View style={styles.ratingContainer}>
              <Image
                source={require('../../src/assets/images/product-details/star-icon.png')}
                style={styles.starIcon}
              />
              <Text style={styles.ratingText}>4.5/5</Text>
              <Text style={styles.reviewCount}>(500+Review)</Text>
            </View>
          </View>
        </View>

        {/* Description Section - Figma: x:20, y:606, width:400, height:82 */}
        <View style={styles.descriptionContainer}>
          <Text style={styles.descriptionTitle}>Description</Text>
          <Text style={styles.descriptionText}>
            Made with baby grade grains, real and fresh fruits and vegetables, and 18 essential vitamins and minerals. CERELAC Infant cereals undergoes 100+ quality and safe checks and it does not contain preservatives and artificial colors,... Read more
          </Text>
        </View>

        {/* Related Items Section - Figma: x:22, y:728, width:397, height:26 */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Related Items</Text>
          <TouchableOpacity>
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
          {relatedProducts.map((product) => (
            <ProductCard
              key={product.id}
              title={product.title}
              price={product.price}
              image={product.image}
              variant="horizontal"
              onPress={() => {}}
              onAddPress={() => {}}
            />
          ))}
        </ScrollView>

        {/* Other Store Section - Figma: x:22, y:965, width:397, height:26 */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Other Store</Text>
          <TouchableOpacity>
            <Text style={styles.seeMoreText}>See more</Text>
          </TouchableOpacity>
        </View>

        {/* Store Cards Section - Figma: x:20, y:1011, width:400, height:660 */}
        <View style={styles.storesContainer}>
          {stores.map((store, index) => (
            <StoreCard
              key={store.id}
              id={store.id}
              name={store.name}
              rating={store.rating}
              distance={store.distance}
              backgroundImage={store.backgroundImage}
              profileImage={store.profileImage}
              hasLowerPrice={index % 2 === 0} // Alternate stores have lower prices
              onPress={() => console.log('Store pressed:', store.name)}
            />
          ))}
        </View>

        {/* Spacer for bottom buttons */}
        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Bottom Action Bar - Figma: x:0, y:839, width:440, height:120 */}
      <View style={styles.bottomActionBar}>
        {/* Quantity Controls - Figma: x:20, y:884, width:180, height:50 */}
        <View style={styles.quantityContainer}>
          <TouchableOpacity style={styles.quantityButton} onPress={decreaseQuantity}>
            <Image
              source={require('../../src/assets/images/product-details/minus-icon.png')}
              style={styles.quantityIcon}
            />
          </TouchableOpacity>
          
          <Text style={styles.quantityText}>{quantity}</Text>
          
          <TouchableOpacity style={styles.quantityButton} onPress={increaseQuantity}>
            <Image
              source={require('../../src/assets/images/product-details/plus-icon.png')}
              style={styles.quantityIcon}
            />
          </TouchableOpacity>
        </View>

        {/* Add to Cart Button - Figma: x:240, y:884, width:180, height:50 */}
        <TouchableOpacity style={styles.addToCartButton} onPress={handleAddToCart}>
          <Image
            source={require('../../src/assets/images/product-details/cart-icon.png')}
            style={styles.cartIcon}
          />
          <Text style={styles.addToCartText}>Add to cart</Text>
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
    fontSize: 20,
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
  },

  productName: {
    fontSize: 24,
    fontWeight: '600',
    color: Colors.black,
    lineHeight: 22,
    marginBottom: vs(2),
  },

  productSubtitle: {
    fontSize: 14,
    fontWeight: '400',
    color: 'rgba(0, 0, 0, 0.5)',
    lineHeight: 22,
    marginBottom: vs(2),
  },

  productWeight: {
    fontSize: 14,
    fontWeight: '400',
    color: 'rgba(0, 0, 0, 0.5)',
    lineHeight: 22,
  },

  // Rating and Price - Figma: x:305, y:520, width:115, height:46
  ratingPriceContainer: {
    alignItems: 'flex-end',
  },

  productPrice: {
    fontSize: 24,
    fontWeight: '600',
    color: Colors.black,
    lineHeight: 22,
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
    fontSize: 14,
    fontWeight: '400',
    color: Colors.darkGray,
    lineHeight: 22,
  },

  reviewCount: {
    fontSize: 10,
    fontWeight: '400',
    color: 'rgba(0, 0, 0, 0.5)',
    lineHeight: 22,
  },

  // Description Section - Figma: x:20, y:606, width:400, height:82
  descriptionContainer: {
    paddingHorizontal: s(20),
    marginTop: vs(18),
  },

  descriptionTitle: {
    fontSize: 18,
    fontWeight: '500',
    color: Colors.black,
    lineHeight: 22,
    marginBottom: vs(4),
  },

  descriptionText: {
    fontSize: 14,
    fontWeight: '400',
    color: 'rgba(0, 0, 0, 0.5)',
    lineHeight: 20,
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
    fontSize: 24,
    fontWeight: '500',
    color: Colors.black,
    lineHeight: 22,
  },

  seeMoreText: {
    fontSize: 14,
    fontWeight: '500',
    color: 'rgba(0, 0, 0, 0.5)',
    lineHeight: 22,
  },

  // Related Products Container - Figma: x:0, y:764, width:440, height:191
  relatedProductsContainer: {
    marginTop: vs(6),
  },

  relatedProductsContent: {
    paddingHorizontal: s(20),
    gap: s(20),
  },

  // Stores Container - Figma: x:20, y:1011, width:400, height:660
  storesContainer: {
    paddingHorizontal: s(20),
    marginTop: vs(10),
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
    fontSize: 24,
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

  cartIcon: {
    width: s(25),
    height: s(25),
  },

  addToCartText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#02545F',
    lineHeight: 22,
  },
});