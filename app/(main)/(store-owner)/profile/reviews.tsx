/**
 * STORE OWNER - REVIEWS SCREEN
 * 
 * Displays all customer reviews and ratings for the store owner's store
 * Shows rating distribution, average rating, and list of all reviews
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  RefreshControl,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useUser } from '../../../../src/contexts/UserContext';
import { fetchStoreReviews, getStoreRating } from '../../../../src/api/reviews';
import { s, vs, ms } from '../../../../src/constants/responsive';
import { Colors } from '../../../../src/constants/Colors';
import { ref, get, update } from 'firebase/database';
import { database } from '../../../../FirebaseConfig';

interface Review {
  id?: string;
  orderId?: string;
  customerId?: string;
  customerName?: string;
  storeId?: string;
  rating: number;
  comment: string;
  images: string[];
  createdAt: string;
  reply?: string;
  repliedAt?: string;
}

interface OrderDetails {
  id: string;
  items: Array<{
    productName: string;
    quantity: number;
    price: number;
  }>;
  totalAmount: number;
  orderDate: string;
  status: string;
}

interface StoreRating {
  storeId: string;
  averageRating: number;
  totalReviews: number;
  ratingDistribution: { [key: number]: number };
}

export default function ReviewsScreen() {
  const { user } = useUser();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [storeRating, setStoreRating] = useState<StoreRating | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<'all' | 1 | 2 | 3 | 4 | 5>('all');
  const [storeId, setStoreId] = useState<string | null>(null);
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);
  const [loadingOrder, setLoadingOrder] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [submittingReply, setSubmittingReply] = useState(false);

  // Fetch reviews and rating
  const fetchData = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      
      // In Firebase, the store ID IS the owner's user ID
      const ownerStoreId = user.id;
      
      // Check if store exists
      const storeRef = ref(database, `stores/${ownerStoreId}`);
      const storeSnapshot = await get(storeRef);
      
      if (!storeSnapshot.exists()) {
        console.log('⚠️ No store found for this owner');
        setLoading(false);
        return;
      }

      console.log('🏪 Found store for owner:', ownerStoreId);
      setStoreId(ownerStoreId);
      
      // Fetch reviews using storeId
      console.log('📥 Fetching reviews for store:', ownerStoreId);
      const reviewsData = await fetchStoreReviews(ownerStoreId);
      console.log('📊 Reviews fetched:', reviewsData.length);
      setReviews(reviewsData.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ));

      // Fetch rating stats using storeId
      const ratingData = await getStoreRating(ownerStoreId);
      console.log('⭐ Rating data:', ratingData);
      setStoreRating(ratingData);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user?.id]);

  // Pull to refresh
  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  // Filter reviews by rating
  const filteredReviews = filter === 'all' 
    ? reviews 
    : reviews.filter(review => review.rating === filter);

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: '2-digit', 
      year: 'numeric' 
    });
  };

  // Get time ago
  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins} ${diffMins === 1 ? 'minute' : 'minutes'} ago`;
    if (diffHours < 24) return `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`;
    if (diffDays < 7) return `${diffDays} ${diffDays === 1 ? 'day' : 'days'} ago`;
    return formatDate(dateString);
  };

  // Fetch order details
  const fetchOrderDetails = async (orderId: string) => {
    try {
      setLoadingOrder(true);
      const orderRef = ref(database, `orders/${orderId}`);
      const snapshot = await get(orderRef);
      
      if (snapshot.exists()) {
        const order = snapshot.val();
        setOrderDetails({
          id: orderId,
          items: order.items || [],
          totalAmount: order.totalAmount || 0,
          orderDate: order.createdAt,
          status: order.status,
        });
      }
    } catch (error) {
      console.error('Error fetching order details:', error);
    } finally {
      setLoadingOrder(false);
    }
  };

  // Open review detail
  const handleReviewPress = (review: Review) => {
    setSelectedReview(review);
    setReplyText(review.reply || '');
    if (review.orderId) {
      fetchOrderDetails(review.orderId);
    }
  };

  // Close review detail
  const handleCloseDetail = () => {
    setSelectedReview(null);
    setOrderDetails(null);
    setReplyText('');
  };

  // Submit reply
  const handleSubmitReply = async () => {
    if (!selectedReview?.id || !replyText.trim()) return;

    try {
      setSubmittingReply(true);
      const reviewRef = ref(database, `reviews/${selectedReview.id}`);
      await update(reviewRef, {
        reply: replyText.trim(),
        repliedAt: new Date().toISOString(),
      });

      Alert.alert('Success', 'Your reply has been posted!');
      handleCloseDetail();
      fetchData(); // Refresh reviews
    } catch (error) {
      console.error('Error submitting reply:', error);
      Alert.alert('Error', 'Failed to post reply. Please try again.');
    } finally {
      setSubmittingReply(false);
    }
  };

  // Render rating distribution bar
  const renderRatingBar = (stars: number) => {
    const count = storeRating?.ratingDistribution[stars] || 0;
    const percentage = storeRating ? (count / storeRating.totalReviews) * 100 : 0;
    
    return (
      <TouchableOpacity 
        key={stars}
        style={styles.ratingBarRow}
        onPress={() => setFilter(stars as 1 | 2 | 3 | 4 | 5)}
        activeOpacity={0.7}
      >
        <View style={styles.starsLabel}>
          {[...Array(stars)].map((_, i) => (
            <Ionicons key={i} name="star" size={s(12)} color="#FFB800" />
          ))}
        </View>
        <View style={styles.barContainer}>
          <View style={[styles.barFill, { width: `${percentage}%` }]} />
        </View>
        <Text style={styles.countText}>{count}</Text>
      </TouchableOpacity>
    );
  };

  // Render review card
  const renderReview = (review: Review) => {
    return (
      <TouchableOpacity 
        key={review.id} 
        style={styles.reviewCard}
        onPress={() => handleReviewPress(review)}
        activeOpacity={0.7}
      >
        {/* Customer info */}
        <View style={styles.reviewHeader}>
          <View style={styles.customerCircle}>
            <Ionicons name="person" size={s(20)} color="#FFFFFF" />
          </View>
          <View style={styles.reviewHeaderText}>
            <Text style={styles.customerName}>{review.customerName || 'Anonymous'}</Text>
            <View style={styles.ratingRow}>
              {[...Array(5)].map((_, i) => (
                <Ionicons 
                  key={i} 
                  name={i < review.rating ? "star" : "star-outline"} 
                  size={s(14)} 
                  color={i < review.rating ? "#FFB800" : "#D9D9D9"} 
                />
              ))}
              <Text style={styles.dateText}>{formatDate(review.createdAt)}</Text>
            </View>
          </View>
        </View>

        {/* Comment */}
        <Text style={styles.commentText}>{review.comment}</Text>

        {/* Images */}
        {review.images && review.images.length > 0 && (
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.imagesScroll}
          >
            {review.images.map((imageUrl, index) => (
              <Image 
                key={index}
                source={{ uri: imageUrl }}
                style={styles.reviewImage}
              />
            ))}
          </ScrollView>
        )}

        {/* Order ID */}
        {review.orderId && (
          <Text style={styles.orderIdText}>Order ID: {review.orderId.slice(0, 20)}...</Text>
        )}

        {/* Reply indicator */}
        {review.reply && (
          <View style={styles.replyBadge}>
            <Ionicons name="checkmark-circle" size={s(14)} color={Colors.primary} />
            <Text style={styles.replyBadgeText}>You replied</Text>
          </View>
        )}

        {/* Tap hint */}
        <View style={styles.tapHint}>
          <Text style={styles.tapHintText}>Tap for details</Text>
          <Ionicons name="chevron-forward" size={s(16)} color="#999999" />
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Loading reviews...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#1E1E1E" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Reviews</Text>
        <View style={styles.backButton} />
      </View>

      <ScrollView 
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Overall Rating Card */}
        {storeRating && storeRating.totalReviews > 0 ? (
          <>
            <View style={styles.overallCard}>
              <Text style={styles.overallTitle}>Overall Rating</Text>
              <View style={styles.ratingDisplay}>
                <Text style={styles.ratingNumber}>
                  {storeRating.averageRating.toFixed(1)}
                </Text>
                <View style={styles.starsColumn}>
                  <View style={styles.starsRow}>
                    {[...Array(5)].map((_, i) => (
                      <Ionicons 
                        key={i} 
                        name={i < Math.round(storeRating.averageRating) ? "star" : "star-outline"} 
                        size={s(20)} 
                        color="#FFB800" 
                      />
                    ))}
                  </View>
                  <Text style={styles.totalReviews}>
                    {storeRating.totalReviews} {storeRating.totalReviews === 1 ? 'review' : 'reviews'}
                  </Text>
                </View>
              </View>

              {/* Rating Distribution */}
              <View style={styles.distributionContainer}>
                {[5, 4, 3, 2, 1].map(stars => renderRatingBar(stars))}
              </View>
            </View>

            {/* Filter Pills */}
            <View style={styles.filterContainer}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <TouchableOpacity
                  style={[styles.filterPill, filter === 'all' && styles.filterPillActive]}
                  onPress={() => setFilter('all')}
                >
                  <Text style={[styles.filterText, filter === 'all' && styles.filterTextActive]}>
                    All ({reviews.length})
                  </Text>
                </TouchableOpacity>
                {[5, 4, 3, 2, 1].map(stars => {
                  const count = storeRating.ratingDistribution[stars] || 0;
                  if (count === 0) return null;
                  return (
                    <TouchableOpacity
                      key={stars}
                      style={[styles.filterPill, filter === stars && styles.filterPillActive]}
                      onPress={() => setFilter(stars as 1 | 2 | 3 | 4 | 5)}
                    >
                      <Ionicons name="star" size={s(14)} color={filter === stars ? "#FFFFFF" : "#FFB800"} />
                      <Text style={[styles.filterText, filter === stars && styles.filterTextActive]}>
                        {stars} ({count})
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>

            {/* Reviews List */}
            <View style={styles.reviewsContainer}>
              {filteredReviews.length > 0 ? (
                filteredReviews.map(review => renderReview(review))
              ) : (
                <View style={styles.emptyContainer}>
                  <Ionicons name="star-outline" size={s(60)} color="#D9D9D9" />
                  <Text style={styles.emptyText}>No {filter !== 'all' ? `${filter}-star ` : ''}reviews yet</Text>
                </View>
              )}
            </View>
          </>
        ) : (
          <View style={styles.emptyContainer}>
            <Ionicons name="star-outline" size={s(60)} color="#D9D9D9" />
            <Text style={styles.emptyText}>No reviews yet</Text>
            <Text style={styles.emptySubtext}>
              Reviews from customers will appear here
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Review Detail Modal */}
      <Modal
        visible={selectedReview !== null}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={handleCloseDetail}
      >
        <SafeAreaView style={styles.modalContainer} edges={['top']}>
          {/* Modal Header */}
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={handleCloseDetail}>
              <Ionicons name="close" size={28} color="#1E1E1E" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Review Details</Text>
            <View style={{ width: 28 }} />
          </View>

          <ScrollView style={styles.modalScroll}>
            {selectedReview && (
              <>
                {/* Customer Info */}
                <View style={styles.modalSection}>
                  <View style={styles.modalCustomerHeader}>
                    <View style={styles.customerCircleLarge}>
                      <Ionicons name="person" size={s(30)} color="#FFFFFF" />
                    </View>
                    <View style={styles.modalCustomerInfo}>
                      <Text style={styles.modalCustomerName}>{selectedReview.customerName || 'Anonymous'}</Text>
                      <Text style={styles.modalTimeAgo}>{getTimeAgo(selectedReview.createdAt)}</Text>
                    </View>
                  </View>
                </View>

                {/* Rating */}
                <View style={styles.modalSection}>
                  <View style={styles.modalStarsRow}>
                    {[...Array(5)].map((_, i) => (
                      <Ionicons 
                        key={i} 
                        name={i < selectedReview.rating ? "star" : "star-outline"} 
                        size={s(32)} 
                        color="#FFB800" 
                      />
                    ))}
                  </View>
                  <Text style={styles.modalRatingText}>{selectedReview.rating}.0 out of 5</Text>
                </View>

                {/* Comment */}
                <View style={styles.modalSection}>
                  <Text style={styles.modalSectionTitle}>Review</Text>
                  <Text style={styles.modalCommentText}>{selectedReview.comment}</Text>
                </View>

                {/* Images */}
                {selectedReview.images && selectedReview.images.length > 0 && (
                  <View style={styles.modalSection}>
                    <Text style={styles.modalSectionTitle}>Photos ({selectedReview.images.length})</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                      {selectedReview.images.map((imageUrl, index) => (
                        <Image 
                          key={index}
                          source={{ uri: imageUrl }}
                          style={styles.modalImage}
                        />
                      ))}
                    </ScrollView>
                  </View>
                )}

                {/* Order Details */}
                {loadingOrder ? (
                  <View style={styles.modalSection}>
                    <ActivityIndicator size="small" color={Colors.primary} />
                  </View>
                ) : orderDetails ? (
                  <View style={styles.modalSection}>
                    <Text style={styles.modalSectionTitle}>Order Details</Text>
                    <View style={styles.orderCard}>
                      <View style={styles.orderRow}>
                        <Text style={styles.orderLabel}>Order ID:</Text>
                        <Text style={styles.orderValue}>{orderDetails.id.slice(-8)}</Text>
                      </View>
                      <View style={styles.orderRow}>
                        <Text style={styles.orderLabel}>Order Date:</Text>
                        <Text style={styles.orderValue}>{formatDate(orderDetails.orderDate)}</Text>
                      </View>
                      <View style={styles.orderRow}>
                        <Text style={styles.orderLabel}>Status:</Text>
                        <Text style={[styles.orderValue, styles.orderStatus]}>{orderDetails.status}</Text>
                      </View>
                      
                      {orderDetails.items.length > 0 && (
                        <>
                          <View style={styles.orderDivider} />
                          <Text style={styles.orderItemsTitle}>Items Ordered:</Text>
                          {orderDetails.items.map((item, index) => (
                            <View key={index} style={styles.orderItem}>
                              <Text style={styles.orderItemName}>{item.productName}</Text>
                              <Text style={styles.orderItemDetail}>
                                {item.quantity}x • ₱{item.price.toFixed(2)}
                              </Text>
                            </View>
                          ))}
                          <View style={styles.orderDivider} />
                          <View style={styles.orderRow}>
                            <Text style={styles.orderTotalLabel}>Total Amount:</Text>
                            <Text style={styles.orderTotalValue}>₱{orderDetails.totalAmount.toFixed(2)}</Text>
                          </View>
                        </>
                      )}
                    </View>
                  </View>
                ) : null}

                {/* Existing Reply */}
                {selectedReview.reply && (
                  <View style={styles.modalSection}>
                    <Text style={styles.modalSectionTitle}>Your Reply</Text>
                    <View style={styles.existingReplyCard}>
                      <Text style={styles.existingReplyText}>{selectedReview.reply}</Text>
                      <Text style={styles.existingReplyDate}>
                        Replied {getTimeAgo(selectedReview.repliedAt || '')}
                      </Text>
                    </View>
                  </View>
                )}

                {/* Reply Section */}
                <View style={styles.modalSection}>
                  <Text style={styles.modalSectionTitle}>
                    {selectedReview.reply ? 'Update Reply' : 'Reply to Customer'}
                  </Text>
                  <TextInput
                    style={styles.replyInput}
                    placeholder="Write your reply here..."
                    placeholderTextColor="#999999"
                    multiline
                    numberOfLines={4}
                    value={replyText}
                    onChangeText={setReplyText}
                    textAlignVertical="top"
                  />
                  <TouchableOpacity 
                    style={[styles.replyButton, (!replyText.trim() || submittingReply) && styles.replyButtonDisabled]}
                    onPress={handleSubmitReply}
                    disabled={!replyText.trim() || submittingReply}
                  >
                    {submittingReply ? (
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                      <Text style={styles.replyButtonText}>
                        {selectedReview.reply ? 'Update Reply' : 'Post Reply'}
                      </Text>
                    )}
                  </TouchableOpacity>
                </View>
              </>
            )}
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F6F6',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: vs(10),
    fontSize: ms(14),
    color: '#666666',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: s(20),
    paddingVertical: vs(15),
    backgroundColor: '#FFFFFF',
  },
  backButton: {
    width: s(40),
    height: s(40),
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: ms(18),
    lineHeight: ms(24),
    fontWeight: '700',
    color: '#1E1E1E',
    includeFontPadding: false,
  },
  scrollView: {
    flex: 1,
  },
  overallCard: {
    backgroundColor: '#FFFFFF',
    margin: s(20),
    padding: s(20),
    borderRadius: s(15),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  overallTitle: {
    fontSize: ms(18),
    fontWeight: '700',
    color: '#1E1E1E',
    marginBottom: vs(15),
  },
  ratingDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: vs(20),
  },
  ratingNumber: {
    fontSize: ms(48),
    fontWeight: '700',
    color: '#1E1E1E',
    marginRight: s(15),
  },
  starsColumn: {
    flex: 1,
  },
  starsRow: {
    flexDirection: 'row',
    marginBottom: vs(5),
  },
  totalReviews: {
    fontSize: ms(13),
    color: '#666666',
  },
  distributionContainer: {
    marginTop: vs(10),
  },
  ratingBarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: vs(8),
  },
  starsLabel: {
    flexDirection: 'row',
    width: s(60),
  },
  barContainer: {
    flex: 1,
    height: vs(8),
    backgroundColor: '#F0F0F0',
    borderRadius: s(4),
    marginHorizontal: s(10),
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    backgroundColor: '#FFB800',
    borderRadius: s(4),
  },
  countText: {
    fontSize: ms(12),
    color: '#666666',
    width: s(30),
    textAlign: 'right',
  },
  filterContainer: {
    paddingHorizontal: s(20),
    marginBottom: vs(15),
  },
  filterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: s(15),
    paddingVertical: vs(8),
    backgroundColor: '#FFFFFF',
    borderRadius: s(20),
    marginRight: s(10),
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  filterPillActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterText: {
    fontSize: ms(13),
    color: '#666666',
    marginLeft: s(5),
  },
  filterTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  reviewsContainer: {
    paddingHorizontal: s(20),
    paddingBottom: vs(20),
  },
  reviewCard: {
    backgroundColor: '#FFFFFF',
    padding: s(15),
    borderRadius: s(12),
    marginBottom: vs(15),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: vs(10),
  },
  customerCircle: {
    width: s(40),
    height: s(40),
    borderRadius: s(20),
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: s(12),
  },
  reviewHeaderText: {
    flex: 1,
  },
  customerName: {
    fontSize: ms(15),
    fontWeight: '600',
    color: '#1E1E1E',
    marginBottom: vs(4),
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateText: {
    fontSize: ms(12),
    color: '#999999',
    marginLeft: s(10),
  },
  commentText: {
    fontSize: ms(14),
    color: '#333333',
    lineHeight: ms(14) * 1.5,
    marginBottom: vs(10),
  },
  imagesScroll: {
    marginBottom: vs(10),
  },
  reviewImage: {
    width: s(80),
    height: s(80),
    borderRadius: s(8),
    marginRight: s(10),
  },
  orderIdText: {
    fontSize: ms(12),
    color: '#999999',
    fontStyle: 'italic',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: vs(60),
  },
  emptyText: {
    fontSize: ms(16),
    fontWeight: '600',
    color: '#999999',
    marginTop: vs(15),
  },
  emptySubtext: {
    fontSize: ms(13),
    color: '#CCCCCC',
    marginTop: vs(5),
    textAlign: 'center',
  },
  replyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: vs(8),
    gap: s(5),
  },
  replyBadgeText: {
    fontSize: ms(12),
    color: Colors.primary,
    fontWeight: '600',
  },
  tapHint: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: vs(8),
    gap: s(5),
  },
  tapHintText: {
    fontSize: ms(12),
    color: '#999999',
    fontStyle: 'italic',
  },
  // Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: '#F4F6F6',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: s(20),
    paddingVertical: vs(15),
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  modalTitle: {
    fontSize: ms(18),
    fontWeight: '700',
    color: '#1E1E1E',
  },
  modalScroll: {
    flex: 1,
  },
  modalSection: {
    backgroundColor: '#FFFFFF',
    padding: s(20),
    marginBottom: vs(10),
  },
  modalCustomerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  customerCircleLarge: {
    width: s(60),
    height: s(60),
    borderRadius: s(30),
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: s(15),
  },
  modalCustomerInfo: {
    flex: 1,
  },
  modalCustomerName: {
    fontSize: ms(20),
    fontWeight: '700',
    color: '#1E1E1E',
    marginBottom: vs(5),
  },
  modalTimeAgo: {
    fontSize: ms(14),
    color: '#666666',
  },
  modalStarsRow: {
    flexDirection: 'row',
    gap: s(5),
    marginBottom: vs(10),
  },
  modalRatingText: {
    fontSize: ms(16),
    fontWeight: '600',
    color: '#666666',
  },
  modalSectionTitle: {
    fontSize: ms(16),
    fontWeight: '700',
    color: '#1E1E1E',
    marginBottom: vs(12),
  },
  modalCommentText: {
    fontSize: ms(15),
    color: '#333333',
    lineHeight: ms(15) * 1.6,
  },
  modalImage: {
    width: s(120),
    height: s(120),
    borderRadius: s(12),
    marginRight: s(10),
  },
  orderCard: {
    backgroundColor: '#F9F9F9',
    padding: s(15),
    borderRadius: s(12),
  },
  orderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: vs(8),
  },
  orderLabel: {
    fontSize: ms(14),
    color: '#666666',
  },
  orderValue: {
    fontSize: ms(14),
    fontWeight: '600',
    color: '#1E1E1E',
  },
  orderStatus: {
    color: Colors.primary,
    textTransform: 'capitalize',
  },
  orderDivider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginVertical: vs(12),
  },
  orderItemsTitle: {
    fontSize: ms(14),
    fontWeight: '600',
    color: '#1E1E1E',
    marginBottom: vs(10),
  },
  orderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: vs(8),
  },
  orderItemName: {
    fontSize: ms(14),
    color: '#333333',
    flex: 1,
  },
  orderItemDetail: {
    fontSize: ms(13),
    color: '#666666',
  },
  orderTotalLabel: {
    fontSize: ms(16),
    fontWeight: '700',
    color: '#1E1E1E',
  },
  orderTotalValue: {
    fontSize: ms(18),
    fontWeight: '700',
    color: Colors.primary,
  },
  existingReplyCard: {
    backgroundColor: '#E8F5E9',
    padding: s(15),
    borderRadius: s(12),
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary,
  },
  existingReplyText: {
    fontSize: ms(14),
    color: '#333333',
    lineHeight: ms(14) * 1.5,
    marginBottom: vs(8),
  },
  existingReplyDate: {
    fontSize: ms(12),
    color: '#666666',
  },
  replyInput: {
    backgroundColor: '#F9F9F9',
    borderRadius: s(12),
    padding: s(15),
    fontSize: ms(15),
    color: '#1E1E1E',
    minHeight: vs(100),
    marginBottom: vs(15),
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  replyButton: {
    backgroundColor: Colors.primary,
    paddingVertical: vs(15),
    borderRadius: s(12),
    alignItems: 'center',
  },
  replyButtonDisabled: {
    backgroundColor: '#CCCCCC',
  },
  replyButtonText: {
    color: '#FFFFFF',
    fontSize: ms(16),
    fontWeight: '600',
  },
});
