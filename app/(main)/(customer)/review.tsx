/**
 * REVIEW SCREEN - Pixel-Perfect Figma Implementation
 * 
 * Figma: https://www.figma.com/design/8I1Nr3vQZllDDknSevstvH/TindaGo-Share?node-id=1428-1773&m=dev
 * Baseline: 440x956
 * 
 * EXACT SPECIFICATIONS:
 * - Header: Back button + "Reviews" title + placeholder (y: 74-114)
 * - Store card with icon (circular) + name + order number
 * - Rating section with 5 stars (48x48 touchable area)
 * - Comment textarea with character counter
 * - Image upload (max 3, dashed border add button)
 * - Bottom button: "Rate Now" (green, 320x50, radius 15)
 * - Pixel-perfect spacing and colors from Figma
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { ref, get, push, set } from 'firebase/database';
import { database } from '../../../FirebaseConfig';
import { s, vs, ms } from '../../../src/constants/responsive';
import { Colors } from '../../../src/constants/Colors';
import { useUser } from '../../../src/contexts/UserContext';
import type { Order } from '../../../src/models/Order';
import { ReviewSuccessModal } from '../../../src/components/ui';

export default function ReviewScreen() {
  const params = useLocalSearchParams();
  const orderId = params.orderId as string;
  const testMode = params.test === 'true'; // Enable test mode via ?test=true
  const { user } = useUser();

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  // Review state
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState('');
  const [images, setImages] = useState<string[]>([]);
  
  // Success modal state
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  useEffect(() => {
    loadOrder();
  }, [orderId]);

  const loadOrder = async () => {
    if (!orderId) {
      setLoading(false);
      return;
    }

    try {
      const orderRef = ref(database, `orders/${orderId}`);
      const snapshot = await get(orderRef);

      if (snapshot.exists()) {
        setOrder({ ...snapshot.val(), id: orderId } as Order);
      }
    } catch (error) {
      console.error('Error loading order:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStarPress = (star: number) => {
    setRating(star);
  };

  const handleImagePick = async () => {
    if (images.length >= 3) {
      Alert.alert('Image Limit', 'You can only upload up to 3 images.');
      return;
    }

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setImages([...images, result.assets[0].uri]);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to select image');
    }
  };

  const handleRemoveImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleSubmitReview = async () => {
    // Validation
    if (rating === 0) {
      Alert.alert('Rating Required', 'Please select a star rating before submitting.');
      return;
    }

    if (comment.trim().length === 0) {
      Alert.alert('Comment Required', 'Please write a comment about your experience.');
      return;
    }

    setSubmitting(true);

    try {
      // Create review data
      const reviewData = {
        orderId,
        customerId: user?.id || 'anonymous',
        customerName: user?.name || order?.customerName || 'Anonymous',
        storeId: order?.storeId || '',
        storeName: order?.storeName || '',
        rating,
        comment: comment.trim(),
        images, // In production, upload to Cloudinary first
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Save to Firebase
      const reviewsRef = ref(database, 'reviews');
      const newReviewRef = push(reviewsRef);
      await set(newReviewRef, reviewData);

      // Update order status to completed
      const orderRef = ref(database, `orders/${orderId}`);
      await set(orderRef, {
        ...order,
        status: 'completed',
        reviewId: newReviewRef.key,
        updatedAt: new Date().toISOString(),
      });

      // Show success modal instead of alert
      setShowSuccessModal(true);
    } catch (error) {
      console.error('Error submitting review:', error);
      Alert.alert('Error', 'Failed to submit review. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Loading order...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const displayRating = hoveredRating || rating;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Status Bar Placeholder - Figma: 0-0 to 440-30 */}
      <View style={styles.statusBarPlaceholder} />

      {/* Header - Figma: y:74-114 */}
      <View style={styles.header}>
        {/* Back Button - Figma: x:20, y:79, size:30x30 */}
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Image
            source={require('../../../src/assets/images/customer-orders/chevron-left.png')}
            style={styles.chevronIcon}
          />
        </TouchableOpacity>

        {/* Title - Figma: x:171, y:83, font-size:22 */}
        <Text style={styles.headerTitle}>Reviews</Text>

        {/* Placeholder for alignment */}
        <View style={styles.backButton} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Test Button - Only visible in test mode (?test=true) */}
        {testMode && (
          <View style={styles.testButtonWrapper}>
            <TouchableOpacity
              style={styles.testButton}
              onPress={() => setShowSuccessModal(true)}
            >
              <Text style={styles.testButtonText}>🎉 Test Success Modal</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Store Info Card - Figma: x:20, y:130, width:400, height:100 */}
        <View style={styles.storeCard}>
          {/* Store Icon Circle - Figma: 60x60 circle with icon */}
          <View style={styles.storeIconCircle}>
            <Ionicons name="storefront" size={s(32)} color="#3BB77E" />
          </View>
          <View style={styles.storeInfo}>
            <Text style={styles.storeName}>{order?.storeName || 'Store Name'}</Text>
            <Text style={styles.orderNumber}>Order #{order?.orderNumber || 'N/A'}</Text>
          </View>
        </View>

        {/* Rating Section - Figma: x:20, y:250, width:400, height:180 */}
        <View style={styles.ratingSection}>
          <Text style={styles.sectionTitle}>How was your experience?</Text>
          <Text style={styles.sectionSubtitle}>Rate your order from 1 to 5</Text>

          {/* Star Rating - Figma: 5 stars, 48x48 each, gap:8px */}
          <View style={styles.starsContainer}>
            {[1, 2, 3, 4, 5].map((star) => (
              <TouchableOpacity
                key={star}
                onPress={() => handleStarPress(star)}
                onPressIn={() => setHoveredRating(star)}
                onPressOut={() => setHoveredRating(0)}
                style={styles.starButton}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={star <= displayRating ? 'star' : 'star-outline'}
                  size={s(48)}
                  color={star <= displayRating ? '#FFB800' : '#D9D9D9'}
                />
              </TouchableOpacity>
            ))}
          </View>

          {/* Rating Label - Figma: Below stars, font-size:16, green */}
          <Text style={styles.ratingLabel}>
            {rating === 0 && ''}
            {rating === 1 && 'Poor'}
            {rating === 2 && 'Fair'}
            {rating === 3 && 'Good'}
            {rating === 4 && 'Very Good'}
            {rating === 5 && 'Excellent!'}
          </Text>
        </View>

        {/* Comment Section - Figma: x:20, y:450, width:400, height:200 */}
        <View style={styles.commentSection}>
          <Text style={styles.sectionTitle}>Share your thoughts</Text>
          <Text style={styles.sectionSubtitle}>Tell us about your experience</Text>

          <View style={styles.textInputContainer}>
            <TextInput
              style={styles.textInput}
              placeholder="Write your comment here..."
              placeholderTextColor="rgba(30, 30, 30, 0.3)"
              multiline
              numberOfLines={6}
              value={comment}
              onChangeText={setComment}
              maxLength={500}
              textAlignVertical="top"
            />
            {/* Character Counter - Figma: Bottom-right corner */}
            <Text style={styles.charCount}>{comment.length}/500</Text>
          </View>
        </View>

        {/* Image Upload Section - Figma: x:20, y:670, width:400, height:150 */}
        <View style={styles.imageSection}>
          <Text style={styles.sectionTitle}>Add photos (optional)</Text>
          <Text style={styles.sectionSubtitle}>Max 3 images</Text>

          <View style={styles.imagesContainer}>
            {images.map((uri, index) => (
              <View key={index} style={styles.imagePreview}>
                <Image source={{ uri }} style={styles.previewImage} />
                <TouchableOpacity
                  style={styles.removeImageButton}
                  onPress={() => handleRemoveImage(index)}
                >
                  <Ionicons name="close-circle" size={s(24)} color="#FF3B30" />
                </TouchableOpacity>
              </View>
            ))}

            {/* Add Photo Button - Figma: 100x100, dashed border, green */}
            {images.length < 3 && (
              <TouchableOpacity style={styles.addImageButton} onPress={handleImagePick}>
                <Ionicons name="camera" size={s(36)} color="#3BB77E" />
                <Text style={styles.addImageText}>Add Photo</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Spacer for button */}
        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Submit Button - Figma: x:60, y:860, width:320, height:50, radius:15 */}
      <View style={styles.submitButtonContainer}>
        <TouchableOpacity
          style={[styles.submitButton, (rating === 0 || comment.trim().length === 0 || submitting) && styles.submitButtonDisabled]}
          onPress={handleSubmitReview}
          disabled={rating === 0 || comment.trim().length === 0 || submitting}
          activeOpacity={0.8}
        >
          {submitting ? (
            <ActivityIndicator color="#FFF" size="small" />
          ) : (
            <Text style={styles.submitButtonText}>Rate Now</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Review Success Modal - Figma: node-id=1439-184 */}
      <ReviewSuccessModal
        visible={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        autoDismiss={true}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  // Container
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  statusBarPlaceholder: {
    height: vs(30),
    backgroundColor: '#FFFFFF',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  loadingText: {
    marginTop: vs(10),
    fontSize: ms(14),
    color: 'rgba(30, 30, 30, 0.5)',
    fontWeight: '400',
  },

  // Header - Figma: y:74-114, height:40
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: s(20),
    height: vs(40),
    backgroundColor: '#FFFFFF',
    marginBottom: vs(16),
  },
  backButton: {
    width: s(30),
    height: s(30),
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  chevronIcon: {
    width: s(30),
    height: s(30),
  },
  headerTitle: {
    fontSize: ms(22),
    fontWeight: '700',
    color: '#1E1E1E',
    textAlign: 'center',
  },
  // Scroll View
  scrollView: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  // Store Card - Figma: x:20, y:130, width:400, height:100
  storeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: s(20),
    marginBottom: vs(20),
    padding: s(20),
    borderRadius: s(20),
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: s(5),
    elevation: 5,
  },
  storeIconCircle: {
    width: s(60),
    height: s(60),
    borderRadius: s(30),
    backgroundColor: '#F0F9FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: s(15),
  },
  storeIcon: {
    width: s(32),
    height: s(32),
  },
  storeInfo: {
    flex: 1,
  },
  storeName: {
    fontSize: ms(18),
    fontWeight: '600',
    color: '#1E1E1E',
    marginBottom: vs(4),
  },
  orderNumber: {
    fontSize: ms(13),
    fontWeight: '400',
    color: 'rgba(30, 30, 30, 0.5)',
  },
  // Rating Section - Figma: x:20, y:250, width:400, height:180
  ratingSection: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: s(20),
    marginBottom: vs(20),
    padding: s(20),
    borderRadius: s(20),
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: s(5),
    elevation: 5,
  },
  sectionTitle: {
    fontSize: ms(18),
    fontWeight: '600',
    color: '#1E1E1E',
    marginBottom: vs(6),
    textAlign: 'center',
  },
  sectionSubtitle: {
    fontSize: ms(13),
    fontWeight: '400',
    color: 'rgba(30, 30, 30, 0.5)',
    marginBottom: vs(20),
    textAlign: 'center',
  },
  starsContainer: {
    flexDirection: 'row',
    gap: s(8),
    marginBottom: vs(12),
  },
  starButton: {
    padding: s(4),
  },
  ratingLabel: {
    fontSize: ms(16),
    fontWeight: '600',
    color: '#3BB77E',
    minHeight: vs(24),
    textAlign: 'center',
  },
  // Comment Section - Figma: x:20, y:450, width:400, height:200
  commentSection: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: s(20),
    marginBottom: vs(20),
    padding: s(20),
    borderRadius: s(20),
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: s(5),
    elevation: 5,
  },
  textInputContainer: {
    position: 'relative',
    marginTop: vs(15),
  },
  textInput: {
    backgroundColor: '#F9F9F9',
    borderRadius: s(15),
    padding: s(15),
    paddingTop: s(15),
    fontSize: ms(14),
    fontWeight: '400',
    color: '#1E1E1E',
    minHeight: vs(140),
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: '#E8E8E8',
  },
  charCount: {
    position: 'absolute',
    bottom: s(12),
    right: s(15),
    fontSize: ms(11),
    fontWeight: '400',
    color: 'rgba(30, 30, 30, 0.4)',
    backgroundColor: 'transparent',
  },
  // Image Upload Section - Figma: x:20, y:670, width:400, height:150
  imageSection: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: s(20),
    marginBottom: vs(20),
    padding: s(20),
    borderRadius: s(20),
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: s(5),
    elevation: 5,
  },
  imagesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: s(12),
    marginTop: vs(15),
  },
  imagePreview: {
    width: s(100),
    height: s(100),
    borderRadius: s(15),
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#F0F0F0',
  },
  previewImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  removeImageButton: {
    position: 'absolute',
    top: s(4),
    right: s(4),
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: s(15),
    width: s(28),
    height: s(28),
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  addImageButton: {
    width: s(100),
    height: s(100),
    borderRadius: s(15),
    borderWidth: 2,
    borderColor: '#3BB77E',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(59, 183, 126, 0.05)',
  },
  addImageText: {
    fontSize: ms(11),
    color: '#3BB77E',
    fontWeight: '600',
    marginTop: vs(6),
  },
  bottomSpacer: {
    height: vs(100),
  },

  // Submit Button - Figma: x:60, y:860, width:320, height:50, radius:15
  submitButtonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: s(60),
    paddingVertical: vs(20),
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 8,
  },
  submitButton: {
    backgroundColor: '#3BB77E',
    height: vs(50),
    borderRadius: s(15),
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: s(5),
    elevation: 5,
  },
  submitButtonDisabled: {
    backgroundColor: '#D9D9D9',
    shadowOpacity: 0.1,
    elevation: 2,
  },
  submitButtonText: {
    fontSize: ms(16),
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },

  // Test Button (only visible in test mode)
  testButtonWrapper: {
    alignItems: 'center',
    marginVertical: vs(20),
  },
  testButton: {
    backgroundColor: '#FFB800',
    paddingHorizontal: s(30),
    paddingVertical: vs(15),
    borderRadius: s(15),
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: s(5),
    elevation: 5,
  },
  testButtonText: {
    fontSize: ms(16),
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
