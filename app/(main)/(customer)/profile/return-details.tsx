/**
 * CUSTOMER RETURN DETAILS SCREEN
 *
 * Figma File: 8I1Nr3vQZllDDknSevstvH
 * Node: 1428-6206 (Return Details)
 * Baseline: 440x956
 *
 * Displays detailed information about a specific return request.
 * Shows all returned items, status, refund details, and photos if uploaded.
 * Allows customer to view full return request details and track status.
 */

import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { useUser } from '../../../../src/contexts/UserContext';
import type { Return } from '../../../../src/models/Return';
import { getReturnById, cancelReturnRequest } from '../../../../src/api/returns/customerReturns';
import { RETURN_REASONS, REFUND_METHODS } from '../../../../src/models/Return';
import { getProductImageSource } from '../../../../src/lib/helpers/imageHelper';
import { Colors } from "../../../../src/constants/Colors";
import { Fonts } from "../../../../src/constants/Fonts";
import { s, vs, ms } from "../../../../src/constants/responsive";

export default function ReturnDetailsScreen() {
  const params = useLocalSearchParams();
  const returnId = params.returnId as string;
  const { user } = useUser();
  const [returnData, setReturnData] = useState<Return | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  // Fetch return details from Firebase
  useEffect(() => {
    if (!returnId) {
      setLoading(false);
      Alert.alert("Error", "Return ID not provided");
      router.back();
      return;
    }

    const fetchReturnDetails = async () => {
      try {
        const data = await getReturnById(returnId);
        if (data) {
          setReturnData(data);
        } else {
          Alert.alert("Error", "Return request not found");
          router.back();
        }
      } catch (error) {
        console.error('Error fetching return details:', error);
        Alert.alert("Error", "Failed to load return details");
        router.back();
      } finally {
        setLoading(false);
      }
    };

    fetchReturnDetails();
  }, [returnId]);

  const handleBack = () => {
    router.back();
  };

  const handleCancelReturn = async () => {
    if (!returnData || !user) return;

    Alert.alert(
      "Cancel Return Request",
      "Are you sure you want to cancel this return request?",
      [
        { text: "No", style: "cancel" },
        {
          text: "Yes, Cancel",
          style: "destructive",
          onPress: async () => {
            setCancelling(true);
            try {
              const result = await cancelReturnRequest(returnId, user.id);
              if (result.success) {
                Alert.alert(
                  "Success",
                  "Your return request has been cancelled.",
                  [{ text: "OK", onPress: () => router.back() }]
                );
              } else {
                Alert.alert("Error", result.error || "Failed to cancel return request");
              }
            } catch (error) {
              console.error("Error cancelling return:", error);
              Alert.alert("Error", "Failed to cancel return request");
            } finally {
              setCancelling(false);
            }
          },
        },
      ]
    );
  };

  // Format date
  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'N/A';
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'N/A';
    }
  };

  // Safe currency formatter
  const formatCurrency = (value: number | undefined): string => {
    if (value === undefined || value === null || isNaN(value)) {
      return '0.00';
    }
    return value.toFixed(2);
  };

  // Get reason label
  const getReasonLabel = (reason: string) => {
    const reasonObj = RETURN_REASONS.find(r => r.value === reason);
    return reasonObj?.label || reason;
  };

  // Get refund method label
  const getRefundMethodLabel = (method: string) => {
    const methodObj = REFUND_METHODS.find(m => m.value === method);
    return methodObj?.label || method;
  };

  // Get status badge style
  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'pending':
        return { backgroundColor: '#FFA500', color: '#FFFFFF' };
      case 'processed':
        return { backgroundColor: Colors.primary, color: '#FFFFFF' };
      case 'rejected':
        return { backgroundColor: '#E92B45', color: '#FFFFFF' };
      default:
        return { backgroundColor: '#9CA3AF', color: '#FFFFFF' };
    }
  };

  // Get status label
  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Pending Review';
      case 'processed':
        return 'Processed';
      case 'rejected':
        return 'Rejected';
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Loading return details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!returnData) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loadingContainer}>
          <Text style={styles.errorText}>Return request not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  const statusStyle = getStatusStyle(returnData.status);
  const canCancel = returnData.status === 'pending';

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header - Figma: y:0-130 */}
      <View style={styles.header}>
        {/* Back Button - Figma: x:20, y:79, size:30x30 */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleBack}
        >
          <Image
            source={require("../../../../src/assets/images/customer-return-history/chevron-left.png")}
            style={styles.chevronIcon}
          />
        </TouchableOpacity>

        {/* Title - Figma: x:155, y:83 */}
        <Text style={styles.title}>Return Details</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Status Card */}
        <View style={styles.statusCard}>
          <View style={styles.statusHeader}>
            <View>
              <Text style={styles.returnNumber}>{returnData.returnNumber}</Text>
              <Text style={styles.dateText}>{formatDate(returnData.createdAt)}</Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: statusStyle.backgroundColor }]}>
              <Text style={[styles.statusText, { color: statusStyle.color }]}>
                {getStatusLabel(returnData.status)}
              </Text>
            </View>
          </View>

          {/* Store Info */}
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Store</Text>
            <Text style={styles.infoValue}>{returnData.storeName}</Text>
          </View>

          {/* Order Number */}
          {returnData.orderNumber && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Order Number</Text>
              <Text style={styles.infoValue}>{returnData.orderNumber}</Text>
            </View>
          )}

          {/* Loan Payment Date (if loan refund method) */}
          {returnData.refundMethod === 'loan' && returnData.loanPaymentDate && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Payment Date</Text>
              <Text style={styles.infoValue}>{formatDate(returnData.loanPaymentDate)}</Text>
            </View>
          )}

          {/* Refund Method */}
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Refund Method</Text>
            <Text style={styles.infoValue}>{getRefundMethodLabel(returnData.refundMethod)}</Text>
          </View>

          {/* Processed Date */}
          {returnData.processedAt && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Processed Date</Text>
              <Text style={styles.infoValue}>{formatDate(returnData.processedAt)}</Text>
            </View>
          )}
        </View>

        {/* Returned Items */}
        <Text style={styles.sectionTitle}>Returned Items</Text>
        {returnData.items.map((item, index) => {
          const imageSource = getProductImageSource({
            productImageUrl: item.productImageUrl,
            productImage: item.productImage
          }, 'small');

          return (
            <View key={index} style={styles.itemCard}>
              {/* Product Image */}
              <Image
                source={imageSource}
                style={styles.productImage}
                resizeMode="cover"
              />

              {/* Product Details */}
              <View style={styles.productDetails}>
                <Text style={styles.productName} numberOfLines={2}>
                  {item.productName}
                </Text>
                <Text style={styles.productInfo}>
                  {item.productSize} {item.unit}
                </Text>
                <Text style={styles.productReason}>
                  Reason: {getReasonLabel(item.reason)}
                </Text>
                <Text style={styles.productQuantity}>
                  Qty: {item.quantityReturned || item.quantity}
                </Text>
              </View>

              {/* Price */}
              <View style={styles.priceSection}>
                <Text style={styles.itemPrice}>
                  ₱{formatCurrency(item.refundAmount)}
                </Text>
              </View>
            </View>
          );
        })}

        {/* Additional Details */}
        {returnData.additionalDetails && (
          <View style={styles.detailsCard}>
            <Text style={styles.cardTitle}>Additional Details</Text>
            <Text style={styles.detailsText}>{returnData.additionalDetails}</Text>
          </View>
        )}

        {/* Photos */}
        {returnData.photoUrls && returnData.photoUrls.length > 0 && (
          <View style={styles.detailsCard}>
            <Text style={styles.cardTitle}>Photos</Text>
            <View style={styles.photoGrid}>
              {returnData.photoUrls.map((url, index) => (
                <Image
                  key={index}
                  source={{ uri: url }}
                  style={styles.photo}
                  resizeMode="cover"
                />
              ))}
            </View>
          </View>
        )}

        {/* Store Notes */}
        {returnData.notes && (
          <View style={styles.detailsCard}>
            <Text style={styles.cardTitle}>Store Notes</Text>
            <Text style={styles.detailsText}>{returnData.notes}</Text>
          </View>
        )}

        {/* Total Refund */}
        <View style={styles.totalCard}>
          <Text style={styles.totalLabel}>Total Refund</Text>
          <Text style={styles.totalValue}>₱{formatCurrency(returnData.totalRefund)}</Text>
        </View>

        {/* Cancel Button (only for pending returns) */}
        {canCancel && (
          <TouchableOpacity
            style={[styles.cancelButton, cancelling && styles.cancelButtonDisabled]}
            onPress={handleCancelReturn}
            disabled={cancelling}
            activeOpacity={0.7}
          >
            {cancelling ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.cancelButtonText}>Cancel Return Request</Text>
            )}
          </TouchableOpacity>
        )}

        {/* Bottom Padding */}
        <View style={styles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundGray,
  },
  // Header - Figma: y:0-130
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: s(20),
    paddingVertical: vs(25),
    backgroundColor: Colors.backgroundGray,
  },
  // Back Button - Figma: x:20, y:79, size:30x30
  backButton: {
    position: 'absolute',
    left: s(20),
    width: s(30),
    height: s(30),
    borderRadius: s(20),
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
  chevronIcon: {
    width: s(15),
    height: s(15),
    resizeMode: 'contain',
  },
  // Title - Figma: x:155, y:83, width:130, height:22
  title: {
    fontSize: ms(20),
    fontFamily: Fonts.primary,
    fontWeight: '600',
    color: Colors.darkGray,
    lineHeight: ms(22),
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: s(20),
    paddingBottom: vs(20),
  },
  // Status Card
  statusCard: {
    backgroundColor: Colors.white,
    borderRadius: s(20),
    padding: s(20),
    marginBottom: vs(20),
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: s(4),
    elevation: 3,
  },
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: vs(15),
    paddingBottom: vs(15),
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
  },
  returnNumber: {
    fontSize: ms(18),
    fontFamily: Fonts.primary,
    fontWeight: '700',
    color: Colors.darkGray,
    marginBottom: vs(5),
  },
  dateText: {
    fontSize: ms(12),
    fontFamily: Fonts.primary,
    fontWeight: '400',
    color: 'rgba(30, 30, 30, 0.5)',
  },
  statusBadge: {
    paddingHorizontal: s(12),
    paddingVertical: vs(6),
    borderRadius: s(10),
  },
  statusText: {
    fontSize: ms(12),
    fontFamily: Fonts.primary,
    fontWeight: '600',
  },
  infoRow: {
    marginBottom: vs(12),
  },
  infoLabel: {
    fontSize: ms(12),
    fontFamily: Fonts.primary,
    fontWeight: '500',
    color: 'rgba(30, 30, 30, 0.6)',
    marginBottom: vs(4),
  },
  infoValue: {
    fontSize: ms(15),
    fontFamily: Fonts.primary,
    fontWeight: '600',
    color: Colors.darkGray,
  },
  // Section Title
  sectionTitle: {
    fontSize: ms(16),
    fontFamily: Fonts.primary,
    fontWeight: '600',
    color: Colors.darkGray,
    marginBottom: vs(15),
  },
  // Item Card
  itemCard: {
    backgroundColor: Colors.white,
    borderRadius: s(15),
    padding: s(15),
    marginBottom: vs(15),
    flexDirection: 'row',
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: s(3),
    elevation: 2,
  },
  productImage: {
    width: s(70),
    height: s(70),
    borderRadius: s(10),
    marginRight: s(15),
  },
  productDetails: {
    flex: 1,
    justifyContent: 'center',
  },
  productName: {
    fontSize: ms(15),
    fontFamily: Fonts.primary,
    fontWeight: '600',
    color: Colors.darkGray,
    marginBottom: vs(4),
  },
  productInfo: {
    fontSize: ms(12),
    fontFamily: Fonts.primary,
    fontWeight: '400',
    color: 'rgba(30, 30, 30, 0.6)',
    marginBottom: vs(3),
  },
  productReason: {
    fontSize: ms(11),
    fontFamily: Fonts.primary,
    fontWeight: '500',
    color: 'rgba(30, 30, 30, 0.7)',
    marginBottom: vs(3),
  },
  productQuantity: {
    fontSize: ms(11),
    fontFamily: Fonts.primary,
    fontWeight: '500',
    color: 'rgba(30, 30, 30, 0.6)',
  },
  priceSection: {
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  itemPrice: {
    fontSize: ms(16),
    fontFamily: Fonts.primary,
    fontWeight: '700',
    color: Colors.primary,
  },
  // Details Card
  detailsCard: {
    backgroundColor: Colors.white,
    borderRadius: s(15),
    padding: s(20),
    marginBottom: vs(15),
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: s(3),
    elevation: 2,
  },
  cardTitle: {
    fontSize: ms(14),
    fontFamily: Fonts.primary,
    fontWeight: '600',
    color: Colors.darkGray,
    marginBottom: vs(10),
  },
  detailsText: {
    fontSize: ms(13),
    fontFamily: Fonts.primary,
    fontWeight: '400',
    color: 'rgba(30, 30, 30, 0.7)',
    lineHeight: ms(13) * 1.5,
  },
  // Photo Grid
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: s(10),
  },
  photo: {
    width: s(100),
    height: s(100),
    borderRadius: s(10),
  },
  // Total Card
  totalCard: {
    backgroundColor: Colors.primary,
    borderRadius: s(15),
    padding: s(20),
    marginBottom: vs(20),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: s(8),
    elevation: 6,
  },
  totalLabel: {
    fontSize: ms(16),
    fontFamily: Fonts.primary,
    fontWeight: '600',
    color: Colors.white,
  },
  totalValue: {
    fontSize: ms(24),
    fontFamily: Fonts.primary,
    fontWeight: '700',
    color: Colors.white,
  },
  // Cancel Button
  cancelButton: {
    backgroundColor: '#E92B45',
    borderRadius: s(20),
    paddingVertical: vs(15),
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: 'rgba(233, 43, 69, 0.3)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: s(4),
    elevation: 4,
    marginBottom: vs(20),
  },
  cancelButtonDisabled: {
    backgroundColor: '#9CA3AF',
    opacity: 0.6,
  },
  cancelButtonText: {
    fontSize: ms(16),
    fontFamily: Fonts.primary,
    fontWeight: '600',
    color: Colors.white,
  },
  // Loading & Error States
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: vs(80),
  },
  loadingText: {
    marginTop: vs(15),
    fontSize: ms(16),
    fontFamily: Fonts.primary,
    fontWeight: '500',
    color: 'rgba(30, 30, 30, 0.5)',
  },
  errorText: {
    fontSize: ms(18),
    fontFamily: Fonts.primary,
    fontWeight: '600',
    color: 'rgba(30, 30, 30, 0.5)',
    textAlign: 'center',
  },
  // Bottom Padding
  bottomPadding: {
    height: vs(40),
  },
});
