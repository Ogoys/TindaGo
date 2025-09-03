import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ImageSourcePropType,
} from 'react-native';
import { Colors } from '../../constants/Colors';
import { s, vs } from '../../constants/responsive';

export interface StoreCardProps {
  id: string | number;
  name: string;
  rating: string;
  distance: string;
  backgroundImage?: ImageSourcePropType;
  profileImage?: ImageSourcePropType;
  hasLowerPrice?: boolean;
  onPress?: () => void;
}

export const StoreCard: React.FC<StoreCardProps> = ({
  name,
  rating,
  distance,
  backgroundImage,
  profileImage,
  hasLowerPrice = false,
  onPress,
}) => {
  return (
    <TouchableOpacity 
      style={styles.storeCard} 
      onPress={onPress}
      activeOpacity={0.8}
    >
      {/* Store Background Image */}
      {backgroundImage && (
        <Image source={backgroundImage} style={styles.storeBackground} />
      )}
      
      {/* Store Profile */}
      <View style={styles.storeProfile}>
        {profileImage && (
          <Image source={profileImage} style={styles.storeProfileImage} />
        )}
      </View>
      
      {/* Store Information */}
      <View style={styles.storeInfo}>
        <Text style={styles.storeName}>{name}</Text>
        <View style={styles.storeMetrics}>
          <Image
            source={require('../../assets/images/product-details/star-icon.png')}
            style={styles.storeStarIcon}
          />
          <Text style={styles.storeRating}>{rating}</Text>
          <Text style={styles.storeDistance}>{distance}</Text>
        </View>
      </View>
      
      {/* Lower Price Badge */}
      {hasLowerPrice && (
        <View style={styles.lowerPriceBadge}>
          <Text style={styles.lowerPriceText}>Lower price</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  // Store Card - Figma: width:399, height:150
  storeCard: {
    width: '100%',
    height: vs(150),
    borderRadius: s(20),
    backgroundColor: Colors.white,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: vs(4) },
    shadowOpacity: 0.25,
    shadowRadius: s(10),
    elevation: 5,
    overflow: 'hidden',
    position: 'relative',
    marginBottom: vs(20),
  },

  storeBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: vs(90),
    borderTopLeftRadius: s(20),
    borderTopRightRadius: s(20),
  },

  // Store Profile - Figma: x:10.97, y:50, width:29.93, height:30
  storeProfile: {
    position: 'absolute',
    left: s(11),
    top: vs(50),
    width: s(30),
    height: s(30),
    borderRadius: s(15),
    overflow: 'hidden',
    backgroundColor: Colors.lightGray,
  },

  storeProfileImage: {
    width: '100%',
    height: '100%',
  },

  // Store Information - Figma: x:10.97, y:96
  storeInfo: {
    position: 'absolute',
    left: s(11),
    bottom: vs(22),
  },

  storeName: {
    fontSize: 20,
    fontWeight: '500',
    color: Colors.darkGray,
    lineHeight: 22,
    marginBottom: vs(4),
  },

  storeMetrics: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: s(5),
  },

  storeStarIcon: {
    width: s(10),
    height: s(10),
  },

  storeRating: {
    fontSize: 12,
    fontWeight: '400',
    color: 'rgba(0, 0, 0, 0.5)',
    lineHeight: 22,
  },

  storeDistance: {
    fontSize: 12,
    fontWeight: '400',
    color: 'rgba(0, 0, 0, 0.5)',
    lineHeight: 22,
  },

  // Lower Price Badge
  lowerPriceBadge: {
    position: 'absolute',
    right: s(20),
    top: vs(12),
    backgroundColor: Colors.lightGreen,
    paddingHorizontal: s(8),
    paddingVertical: vs(4),
    borderRadius: s(4),
  },

  lowerPriceText: {
    fontSize: 10,
    fontWeight: '500',
    color: Colors.primary,
  },
});