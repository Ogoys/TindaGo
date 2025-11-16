import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image, ActivityIndicator } from "react-native";
import { Colors } from "../../constants/Colors";
import { Fonts } from "../../constants/Fonts";
import { s, vs } from "../../constants/responsive";

export interface ProductCardProps {
  title: string;
  subtitle?: string;
  weight?: string;
  price?: string;
  image?: any;
  onAddPress?: () => void;
  onPress?: () => void;
  variant?: "grid" | "horizontal";
  isAdding?: boolean;
  quantity?: number;  // Add quantity prop for stock badge
}

export const ProductCard: React.FC<ProductCardProps> = ({
  title,
  subtitle,
  weight,
  price,
  image,
  onAddPress,
  onPress,
  variant = "grid",
  isAdding = false,
  quantity,
}) => {
  const cardStyles = variant === "grid" ? styles.gridCard : styles.horizontalCard;
  const imageStyles = variant === "grid" ? styles.gridImageContainer : styles.horizontalImageContainer;
  const labelStyles = variant === "grid" ? styles.gridLabels : styles.horizontalLabels;

  // Get stock badge info
  const getStockBadge = () => {
    if (quantity === undefined) return null;
    
    if (quantity === 0) {
      return { text: 'Out of Stock', color: '#E92B45' };
    } else if (quantity < 10) {
      return { text: `${quantity} left`, color: '#FF9800' };
    } else {
      return { text: 'In Stock', color: '#2E7D32' };
    }
  };

  const stockBadge = getStockBadge();

  return (
    <TouchableOpacity style={cardStyles} onPress={onPress} activeOpacity={0.8}>
      {/* Product Image Container */}
      <View style={imageStyles}>
        {image && <Image source={image} style={styles.productImage} resizeMode="contain" />}
        {/* Stock Badge */}
        {stockBadge && (
          <View style={[styles.stockBadge, { backgroundColor: stockBadge.color }]}>
            <Text style={styles.stockBadgeText}>{stockBadge.text}</Text>
          </View>
        )}
      </View>

      {/* Product Labels */}
      <View style={labelStyles}>
        <Text style={[styles.productTitle, variant === "grid" && styles.productTitleGrid]} numberOfLines={1}>
          {title}
        </Text>
        {subtitle && (
          <Text style={[styles.productSubtitle, variant === "grid" && styles.productSubtitleGrid]} numberOfLines={1}>
            {subtitle}
          </Text>
        )}
        {weight && (
          <Text style={[styles.productWeight, variant === "grid" && styles.productWeightGrid]} numberOfLines={1}>
            {weight}
          </Text>
        )}
        {price && (
          <Text style={[styles.productPrice, variant === "grid" && styles.productPriceGrid]} numberOfLines={1}>
            {price}
          </Text>
        )}
      </View>

      {/* Add Button */}
      <TouchableOpacity
        style={[
          styles.addButton,
          variant === "horizontal" && styles.addButtonHorizontal,
          variant === "grid" && styles.addButtonGrid
        ]}
        onPress={onAddPress}
        activeOpacity={0.7}
        disabled={isAdding}
      >
        {isAdding ? (
          <ActivityIndicator size="small" color={Colors.primary} />
        ) : (
          <View style={styles.plusIcon}>
            <View style={styles.plusHorizontal} />
            <View style={styles.plusVertical} />
          </View>
        )}
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  // Grid Card - Exact Figma dimensions: 120px width × 222px height
  // Better internal alignment with flexbox layout
  gridCard: {
    width: s(120),
    height: vs(222),
    backgroundColor: Colors.white,
    borderRadius: s(20),
    paddingTop: vs(10),
    paddingBottom: vs(10),
    paddingHorizontal: s(10),
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: s(10),
    elevation: 5,
    justifyContent: "space-between", // Distribute content evenly
    alignItems: "center",
  },

  // Horizontal Card - Same structure as grid card
  horizontalCard: {
    width: s(120),
    height: vs(222),
    backgroundColor: Colors.white,
    borderRadius: s(20),
    paddingTop: vs(10),
    paddingBottom: vs(10),
    paddingHorizontal: s(10),
    marginRight: s(20),
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: s(10),
    elevation: 5,
    justifyContent: "space-between",
    alignItems: "center",
  },

  // Grid Image Container - Centered and properly sized
  gridImageContainer: {
    width: s(100),
    height: vs(95),
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8F8F8", // Subtle background
    borderRadius: s(12),
    overflow: "hidden",
  },

  // Horizontal Image Container - Same as grid
  horizontalImageContainer: {
    width: s(100),
    height: vs(95),
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8F8F8",
    borderRadius: s(12),
    overflow: "hidden",
  },

  // Product Image - Centered and contained within image container
  productImage: {
    width: "90%",
    height: "90%",
  },

  // Grid Labels - Centered with proper spacing
  gridLabels: {
    width: "100%",
    alignItems: "center",
    justifyContent: "flex-start",
    paddingHorizontal: s(6),
    paddingTop: vs(4),
    paddingBottom: vs(2),
    minHeight: vs(68), // Fixed height to prevent overlap with button
  },

  // Horizontal Labels - Same structure as grid labels
  horizontalLabels: {
    width: "100%",
    alignItems: "center",
    justifyContent: "flex-start",
    paddingHorizontal: s(6),
    paddingTop: vs(4),
    paddingBottom: vs(2),
    minHeight: vs(68),
  },
  
  // Product Title - Same for all variants
  productTitle: {
    fontSize: 12,
    fontFamily: Fonts.primary,
    fontWeight: "600",
    color: "#1E1E1E",
    textAlign: "center",
    marginBottom: vs(2),
    lineHeight: 15,
  },

  // Product Subtitle - Same for all variants
  productSubtitle: {
    fontSize: 9,
    fontFamily: Fonts.primary,
    fontWeight: "500",
    color: "#666666",
    textAlign: "center",
    marginBottom: vs(1),
    lineHeight: 12,
  },

  // Product Weight - Same for all variants
  productWeight: {
    fontSize: 9,
    fontFamily: Fonts.primary,
    fontWeight: "500",
    color: "rgba(0, 0, 0, 0.5)",
    textAlign: "center",
    marginBottom: vs(1),
    lineHeight: 12,
  },

  productPrice: {
    fontSize: 14,
    fontFamily: Fonts.primary,
    fontWeight: Fonts.weights.semiBold,
    color: Colors.primary,
    textAlign: "center",
    marginTop: vs(1),
    lineHeight: 17,
  },

  // Grid-specific text styles - no longer needed, same as base
  productTitleGrid: {},
  productSubtitleGrid: {},
  productWeightGrid: {},
  productPriceGrid: {},
  
  // Add Button - Same for all variants
  addButton: {
    width: s(100),
    height: vs(32),
    backgroundColor: "#EBF3DA", // Figma green color
    borderRadius: s(8),
    justifyContent: "center",
    alignItems: "center",
    marginTop: vs(2), // Space for better fit within card boundaries
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: vs(2) },
    shadowOpacity: 0.15,
    shadowRadius: s(4),
    elevation: 2,
  },

  addButtonHorizontal: {
    // No differences - same as base
  },

  addButtonGrid: {
    // No differences - same as base
  },
  
  // Plus Icon - Larger and more visible
  plusIcon: {
    width: s(14),
    height: s(14),
    justifyContent: "center",
    alignItems: "center",
  },

  plusHorizontal: {
    position: "absolute",
    width: s(14),
    height: s(2.5),
    backgroundColor: Colors.primary,
    borderRadius: s(1.5),
  },

  plusVertical: {
    position: "absolute",
    width: s(2.5),
    height: s(14),
    backgroundColor: Colors.primary,
    borderRadius: s(1.5),
  },

  // Stock Badge - Overlay on top-right of image
  stockBadge: {
    position: "absolute",
    top: s(4),
    right: s(4),
    paddingHorizontal: s(6),
    paddingVertical: vs(2),
    borderRadius: s(6),
    shadowColor: "rgba(0, 0, 0, 0.3)",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 1,
    shadowRadius: 2,
    elevation: 3,
  },

  stockBadgeText: {
    fontSize: 8,
    fontFamily: Fonts.primary,
    fontWeight: "700",
    color: "#FFFFFF",
    textAlign: "center",
  },
});
