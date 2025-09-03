import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
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
}

export const ProductCard: React.FC<ProductCardProps> = ({
  title,
  subtitle,
  weight,
  price,
  image,
  onAddPress,
  onPress,
  variant = "grid"
}) => {
  const cardStyles = variant === "grid" ? styles.gridCard : styles.horizontalCard;
  const imageStyles = variant === "grid" ? styles.gridImageContainer : styles.horizontalImageContainer;
  const labelStyles = variant === "grid" ? styles.gridLabels : styles.horizontalLabels;

  return (
    <TouchableOpacity style={cardStyles} onPress={onPress} activeOpacity={0.8}>
      {/* Product Image Container */}
      <View style={imageStyles}>
        <View style={styles.productImageBackground}>
          {image && <Image source={image} style={styles.productImage} />}
        </View>
      </View>
      
      {/* Product Labels */}
      <View style={labelStyles}>
        <Text style={styles.productTitle} numberOfLines={1}>
          {title}
        </Text>
        {subtitle && (
          <Text style={styles.productSubtitle} numberOfLines={1}>
            {subtitle}
          </Text>
        )}
        {weight && (
          <Text style={styles.productWeight} numberOfLines={1}>
            {weight}
          </Text>
        )}
        {price && (
          <Text style={styles.productPrice} numberOfLines={1}>
            {price}
          </Text>
        )}
      </View>
      
      {/* Add Button */}
      <TouchableOpacity 
        style={[styles.addButton, variant === "horizontal" && styles.addButtonHorizontal]}
        onPress={onAddPress}
        activeOpacity={0.7}
      >
        <View style={styles.plusIcon}>
          <View style={styles.plusHorizontal} />
          <View style={styles.plusVertical} />
        </View>
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  // Grid Card - Based on Figma: width:120, height:222
  gridCard: {
    width: s(120),
    height: vs(222),
    backgroundColor: Colors.white,
    borderRadius: s(20),
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: s(10),
    elevation: 5,
  },
  
  // Horizontal Card - For regular home screen
  horizontalCard: {
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
  
  // Grid Image Container - Figma: x:0, y:12, width:120, height:88
  gridImageContainer: {
    width: s(120),
    height: vs(88),
    marginTop: vs(12),
    paddingHorizontal: s(10),
  },
  
  // Horizontal Image Container
  horizontalImageContainer: {
    flex: 1,
    marginBottom: vs(8),
  },
  
  productImageBackground: {
    flex: 1,
    backgroundColor: "#E9E9E9", // Figma background color
    borderRadius: s(10),
    justifyContent: "center",
    alignItems: "center",
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: vs(4) },
    shadowOpacity: 0.25,
    shadowRadius: s(10),
    elevation: 5,
    overflow: "hidden",
  },
  
  productImage: {
    width: "100%",
    height: "100%",
    borderRadius: s(10),
  },
  
  // Grid Labels - Figma: x:27, y:111, width:65, height:66
  gridLabels: {
    paddingHorizontal: s(15),
    marginTop: vs(11),
    alignItems: "center",
    height: vs(66),
  },
  
  // Horizontal Labels
  horizontalLabels: {
    paddingHorizontal: s(5),
    marginBottom: vs(10),
  },
  
  productTitle: {
    fontSize: 16,
    fontFamily: Fonts.primary,
    fontWeight: Fonts.weights.medium,
    color: Colors.darkGray,
    textAlign: "center",
    lineHeight: 16 * 1.375,
    marginBottom: vs(2),
  },
  
  productSubtitle: {
    fontSize: 12,
    fontFamily: Fonts.primary,
    fontWeight: Fonts.weights.medium,
    color: Colors.darkGray,
    textAlign: "center",
    lineHeight: 12 * 1.8333,
    marginBottom: vs(2),
  },
  
  productWeight: {
    fontSize: 12,
    fontFamily: Fonts.primary,
    fontWeight: Fonts.weights.medium,
    color: "rgba(0, 0, 0, 0.5)",
    textAlign: "center",
    lineHeight: 12 * 1.8333,
  },
  
  productPrice: {
    fontSize: 16,
    fontFamily: Fonts.primary,
    fontWeight: Fonts.weights.semiBold,
    color: Colors.primary,
    textAlign: "center",
    marginTop: vs(4),
  },
  
  // Add Button - Figma: x:10, y:179, width:100, height:30
  addButton: {
    position: "absolute",
    left: s(10),
    bottom: vs(13),
    width: s(100),
    height: vs(30),
    backgroundColor: "#EBF3DA", // Figma button color
    borderRadius: s(5),
    justifyContent: "center",
    alignItems: "center",
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: s(5),
    elevation: 3,
  },
  
  addButtonHorizontal: {
    backgroundColor: Colors.lightGreen,
  },
  
  // Plus Icon
  plusIcon: {
    width: s(10),
    height: s(10),
    justifyContent: "center",
    alignItems: "center",
  },
  
  plusHorizontal: {
    position: "absolute",
    width: s(10),
    height: s(2),
    backgroundColor: Colors.primary,
    borderRadius: s(1),
  },
  
  plusVertical: {
    position: "absolute",
    width: s(2),
    height: s(10),
    backgroundColor: Colors.primary,
    borderRadius: s(1),
  },
});