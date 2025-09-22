import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  StatusBar,
} from 'react-native';
import { router } from 'expo-router';
import { s, vs } from '../../../../src/constants/responsive';
import { Colors } from '../../../../src/constants/Colors';
import { Fonts } from '../../../../src/constants/Fonts';

interface CategoryItem {
  id: string;
  name: string;
  image: any;
  width: number; // Category name width for text alignment
}

const StoreProductScreen = () => {
  // Product categories data with exact names from Figma
  const categories: CategoryItem[] = [
    {
      id: '1',
      name: 'Fruits &\nVegetables',
      image: require('../../../../src/assets/images/store-product/fruits-vegetables.png'),
      width: 70, // Figma: width: 70, height: 34
    },
    {
      id: '2',
      name: 'Dairy &\nBakery',
      image: require('../../../../src/assets/images/store-product/dairy-bakery.png'),
      width: 46, // Figma: width: 46, height: 34
    },
    {
      id: '3',
      name: 'Snacks',
      image: require('../../../../src/assets/images/store-product/snacks.png'),
      width: 46, // Figma: width: 46, height: 17
    },
    {
      id: '4',
      name: 'Beverages', // Note: Figma shows "Baverages" but using correct spelling
      image: require('../../../../src/assets/images/store-product/beverages.png'),
      width: 67, // Figma: width: 67, height: 17
    },
    {
      id: '5',
      name: 'Personal \nCare',
      image: require('../../../../src/assets/images/store-product/personal-care.png'),
      width: 58, // Figma: width: 58, height: 34
    },
    {
      id: '6',
      name: 'Home &\nKitchen',
      image: require('../../../../src/assets/images/store-product/home-kitchen.png'),
      width: 46, // Figma: width: 46, height: 34
    },
    {
      id: '7',
      name: 'Home Care',
      image: require('../../../../src/assets/images/store-product/home-care.png'),
      width: 70, // Figma: width: 70, height: 17
    },
    {
      id: '8',
      name: 'Baby Care',
      image: require('../../../../src/assets/images/store-product/baby-care.png'),
      width: 67, // Figma: width: 67, height: 17
    },
  ];

  const handleBack = () => {
    router.back();
  };

  const handleAddProduct = () => {
    router.push('/(main)/(store-owner)/profile/add-product');
  };

  const handleCategoryPress = (categoryId: string, categoryName: string) => {
    console.log(`Category pressed: ${categoryName}`);
  };

  return (
    <View style={styles.container}>
      {/* Status Bar - Figma: 9:41 AM status */}
      <StatusBar barStyle="dark-content" backgroundColor={Colors.backgroundGray} />

      {/* Time Display - Figma: x: 71, y: 10, font: ABeeZee 500, size: 15 */}
      <Text style={styles.timeText}>9:41</Text>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Back Button - Figma: x: 20, y: 79, width: 30, height: 30 */}
        <TouchableOpacity style={styles.backButton} onPress={handleBack} activeOpacity={0.7}>
          <Image
            source={require('../../../../src/assets/images/store-product/chevron-left.png')}
            style={styles.backIcon}
          />
        </TouchableOpacity>

        {/* Title - Figma: x: 20, y: 149, font: Clash Grotesk 600, size: 24 */}
        <Text style={styles.title}>Store Product</Text>

        {/* Add Product Card - Figma: x: 20, y: 199, width: 400, height: 80 */}
        <TouchableOpacity style={styles.addProductCard} onPress={handleAddProduct} activeOpacity={0.7}>
          <View style={styles.addProductLeft}>
            {/* Add Icon - Figma: x: 35, y: 219, width: 40, height: 40 */}
            <View style={styles.addIconContainer}>
              <Image
                source={require('../../../../src/assets/images/store-product/add-new-icon.png')}
                style={styles.addIcon}
              />
            </View>
            {/* Add Product Text - Figma: x: 95, y: 227, font: Clash Grotesk 500, size: 18 */}
            <Text style={styles.addProductText}>Add Product</Text>
          </View>
          {/* Forward Arrow - Figma: x: 375, y: 224, width: 30, height: 30 */}
          <Image
            source={require('../../../../src/assets/images/store-product/forward-arrow.png')}
            style={styles.forwardArrow}
          />
        </TouchableOpacity>

        {/* Categories Section Title - Figma: x: 20, y: 299, font: Clash Grotesk 600, size: 24 */}
        <Text style={styles.categoriesTitle}>Categories</Text>

        {/* Categories Horizontal ScrollView - Figma: x: 20, y: 349, height: 141 */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesContainer}
          style={styles.categoriesScrollView}
        >
          {categories.map((category, index) => (
            <View
              key={category.id}
              style={[
                styles.categoryItem,
                { marginRight: index === categories.length - 1 ? s(20) : s(20) } // Figma: 20px spacing
              ]}
            >
              {/* Category Card with Icon */}
              <TouchableOpacity
                style={styles.categoryCard}
                onPress={() => handleCategoryPress(category.id, category.name)}
                activeOpacity={0.7}
              >
                {/* Category Icon - Figma: width: 50, height: 50, centered in 80x80 card */}
                <Image source={category.image} style={styles.categoryIcon} />
              </TouchableOpacity>

              {/* Category Name - Figma: various widths, font: Clash Grotesk 500, size: 12 */}
              <Text style={[styles.categoryText, { width: s(category.width) }]}>
                {category.name}
              </Text>
            </View>
          ))}
        </ScrollView>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundGray, // Figma: #F4F6F6
  },

  // Status Bar Time - Figma: x: 71, y: 10, font: ABeeZee 500, size: 15
  timeText: {
    position: 'absolute',
    left: s(71),
    top: vs(10),
    fontFamily: 'ABeeZee',
    fontWeight: '500',
    fontSize: s(15),
    lineHeight: vs(17),
    color: Colors.darkGray,
    zIndex: 10,
  },

  scrollContent: {
    flexGrow: 1,
    paddingBottom: vs(50), // Ensure content doesn't get cut off
  },

  // Back Button - Figma: x: 20, y: 79, width: 30, height: 30
  backButton: {
    position: 'absolute',
    left: s(20),
    top: vs(79),
    width: s(30),
    height: vs(30),
    borderRadius: s(20),
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 4,
    zIndex: 10,
  },

  backIcon: {
    width: s(15),
    height: vs(15),
  },

  // Title - Figma: x: 20, y: 149, font: Clash Grotesk 600, size: 24
  title: {
    position: 'absolute',
    left: s(20),
    top: vs(149),
    fontFamily: 'Clash Grotesk Variable',
    fontWeight: '600',
    fontSize: s(24),
    lineHeight: vs(29),
    color: Colors.darkGray,
  },

  // Add Product Card - Figma: x: 20, y: 199, width: 400, height: 80
  addProductCard: {
    position: 'absolute',
    left: s(20),
    top: vs(199),
    width: s(400),
    height: vs(80),
    backgroundColor: Colors.white,
    borderRadius: s(16),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: s(15),
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 5,
    elevation: 5,
  },

  addProductLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },

  // Add Icon Container - Figma: x: 35, y: 219 (relative: x: 15, y: 20), width: 40, height: 40
  addIconContainer: {
    width: s(40),
    height: vs(40),
    borderRadius: s(20),
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },

  addIcon: {
    width: s(20),
    height: vs(20),
  },

  // Add Product Text - Figma: x: 95, y: 227 (relative: x: 75, y: 28), font: Clash Grotesk 500, size: 18
  addProductText: {
    fontFamily: 'Clash Grotesk Variable',
    fontWeight: '500',
    fontSize: s(18),
    lineHeight: vs(22),
    color: Colors.darkGray,
    marginLeft: s(20),
  },

  // Forward Arrow - Figma: x: 375, y: 224 (relative: x: 355, y: 25), width: 30, height: 30
  forwardArrow: {
    width: s(30),
    height: vs(30),
  },

  // Categories Title - Figma: x: 20, y: 299, font: Clash Grotesk 600, size: 24
  categoriesTitle: {
    position: 'absolute',
    left: s(20),
    top: vs(299),
    fontFamily: 'Clash Grotesk Variable',
    fontWeight: '600',
    fontSize: s(24),
    lineHeight: vs(29),
    color: Colors.darkGray,
  },

  // Categories ScrollView - Figma: x: 20, y: 349, height: 141 (increased for text space)
  categoriesScrollView: {
    position: 'absolute',
    top: vs(349),
    left: s(0),
    height: vs(180), // Increased height to accommodate text below cards
  },

  categoriesContainer: {
    paddingLeft: s(20),
    alignItems: 'flex-start',
  },

  // Category Item Container - holds card + text
  categoryItem: {
    alignItems: 'center',
    width: s(80),
  },

  // Category Card - Figma: width: 80, height: 80
  categoryCard: {
    width: s(80),
    height: vs(80),
    backgroundColor: Colors.white,
    borderRadius: s(16),
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 5,
    elevation: 5,
    marginBottom: vs(8), // Small space between card and text
  },

  // Category Icon - Figma: width: 50, height: 50 (centered in 80x80 card)
  categoryIcon: {
    width: s(50),
    height: vs(50),
    marginBottom: vs(5),
  },

  // Category Text - Figma: various widths, font: Clash Grotesk 500, size: 12
  categoryText: {
    fontFamily: 'Clash Grotesk Variable',
    fontWeight: '500',
    fontSize: s(12),
    lineHeight: vs(15),
    color: Colors.darkGray,
    textAlign: 'center',
  },
});

export default StoreProductScreen;