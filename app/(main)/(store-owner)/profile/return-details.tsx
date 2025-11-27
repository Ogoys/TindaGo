/**
 * STORE OWNER RETURN DETAILS SCREEN
 *
 * Figma File: 8I1Nr3vQZllDDknSevstvH
 * Node: 1428-6701 (Store Return Details)
 * Baseline: 440x956
 *
 * Displays detailed information about a customer return request for store owner review.
 * Shows all returned items, status, refund details, photos, and customer information.
 * 
 * Store Owner Actions:
 * - Inspect each product physically when customer brings it to store
 * - Mark each item as Sellable or Unsellable (tap to toggle)
 * - Approve request (processes refund and updates inventory based on conditions)
 * - Reject request (customer does not receive refund)
 * 
 * Inventory Logic:
 * - Cash Refund + Sellable: Restore to inventory
 * - Cash Refund + Unsellable: Discard (don't restore)
 * - Replace Product: Deduct 1 from stock (give new item, discard defective)
 * - No Refund + Sellable: Restore to inventory (free product for store)
 * - No Refund + Unsellable: Discard
 * 
 * Status synchronizes with customer return details view in real-time via Firebase.
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
import { ref, get } from 'firebase/database';
import { database } from '../../../../FirebaseConfig';
import { useUser } from '../../../../src/contexts/UserContext';
import type { Return } from '../../../../src/models/Return';
import { getReturnById } from '../../../../src/api/returns/customerReturns';
import {
  processReturnRequest,
  rejectReturnRequest
} from '../../../../src/api/returns/storeReturns';
import { RETURN_REASONS, REFUND_METHODS } from '../../../../src/models/Return';
import { getProductImageSource } from '../../../../src/lib/helpers/imageHelper';
import { Colors } from "../../../../src/constants/Colors";
import { Fonts } from "../../../../src/constants/Fonts";
import { s, vs, ms } from "../../../../src/constants/responsive";

type ItemCondition = 'sellable' | 'unsellable';

interface StockInfo {
  available: number;
  sufficient: boolean;
}

export default function StoreReturnDetailsScreen() {
  const params = useLocalSearchParams();
  const returnId = params.returnId as string;
  const { user } = useUser();
  const [returnData, setReturnData] = useState<Return | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [itemConditions, setItemConditions] = useState<Record<string, ItemCondition>>({});
  const [stockInfo, setStockInfo] = useState<Record<string, StockInfo>>({});

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

          // Initialize item conditions based on return reasons
          const initialConditions: Record<string, ItemCondition> = {};
          data.items.forEach((item, index) => {
            const itemKey = `${item.productId}_${index}`;
            // Automatically mark as unsellable if reason is expired or defective
            if (item.reason === 'expired' || item.reason === 'defective' || item.reason === 'quality_issues') {
              initialConditions[itemKey] = 'unsellable';
            } else {
              // Default to sellable for other reasons (wrong item, changed mind, etc.)
              initialConditions[itemKey] = 'sellable';
            }
          });
          setItemConditions(initialConditions);

          // For Replace Product refunds, fetch stock availability
          if (data.refundMethod === 'replace_product') {
            const stockInfoMap: Record<string, StockInfo> = {};
            
            for (const item of data.items) {
              try {
                const productRef = ref(database, `products/${item.productId}`);
                const productSnapshot = await get(productRef);
                
                if (productSnapshot.exists()) {
                  const product = productSnapshot.val();
                  const availableStock = product.quantity || 0;
                  const quantityNeeded = item.quantityReturned || item.quantity;
                  
                  stockInfoMap[item.productId] = {
                    available: availableStock,
                    sufficient: availableStock >= quantityNeeded
                  };
                }
              } catch (error) {
                console.error(`Error fetching stock for ${item.productId}:`, error);
              }
            }
            
            setStockInfo(stockInfoMap);
          }
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

  const handleToggleItemCondition = (itemKey: string) => {
    setItemConditions(prev => ({
      ...prev,
      [itemKey]: prev[itemKey] === 'sellable' ? 'unsellable' : 'sellable'
    }));
  };

  const handleApproveReturn = async () => {
    if (!returnData || !user) return;

    // For Replace Product refunds, check stock availability
    if (returnData.refundMethod === 'replace_product') {
      const insufficientStockItems: string[] = [];
      
      for (const item of returnData.items) {
        const stock = stockInfo[item.productId];
        if (stock && !stock.sufficient) {
          insufficientStockItems.push(`${item.productName} (Available: ${stock.available}, Needed: ${item.quantityReturned || item.quantity})`);
        }
      }

      if (insufficientStockItems.length > 0) {
        Alert.alert(
          "Insufficient Stock",
          `Cannot approve replacement. The following products don't have enough stock:\n\n${insufficientStockItems.join('\n')}`
        );
        return;
      }

      // Confirmation message for Replace Product
      const message = `Confirm approval of return request ${returnData.returnNumber}?\n\n` +
        `Refund Method: Replace Product\n` +
        `Items: ${returnData.items.length}\n\n` +
        `⚠️ New products will be given to customer\n` +
        `⚠️ Old products will be discarded\n` +
        `⚠️ Stock will decrease by ${returnData.items.reduce((sum, i) => sum + (i.quantityReturned || i.quantity), 0)} unit(s)`;

      Alert.alert(
        "Approve Return Request",
        message,
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Approve",
            style: "default",
            onPress: async () => {
              setProcessing(true);
              try {
                // For replace product, condition doesn't matter
                const updatedItems = returnData.items.map((item, index) => ({
                  ...item,
                  condition: 'unsellable' // Always unsellable for replace product
                }));

                const result = await processReturnRequest(returnId, user.id, updatedItems);
                if (result.success) {
                  Alert.alert(
                    "Success",
                    `Return approved! New products given to customer. Stock has been updated.`,
                    [{ text: "OK", onPress: () => router.back() }]
                  );
                } else {
                  Alert.alert("Error", result.error || "Failed to process return request");
                }
              } catch (error) {
                console.error("Error approving return:", error);
                Alert.alert("Error", "Failed to approve return request");
              } finally {
                setProcessing(false);
              }
            },
          },
        ]
      );
    } else {
      // Count sellable and unsellable items for Cash Refund and No Refund
      const sellableCount = Object.values(itemConditions).filter(c => c === 'sellable').length;
      const unsellableCount = Object.values(itemConditions).filter(c => c === 'unsellable').length;

      const refundMethodLabel = returnData.refundMethod === 'cash' ? 'Cash Refund' : 'No Refund';
      const message = `Confirm approval of return request ${returnData.returnNumber}?\n\n` +
        `Refund Method: ${refundMethodLabel}\n` +
        `• Sellable items: ${sellableCount} (will be restored to inventory)\n` +
        `• Unsellable items: ${unsellableCount} (will be discarded)\n\n` +
        `Total refund: ₱${formatCurrency(returnData.totalRefund)}`;

      Alert.alert(
        "Approve Return Request",
        message,
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Approve",
            style: "default",
            onPress: async () => {
              setProcessing(true);
              try {
                // Update items with their conditions
                const updatedItems = returnData.items.map((item, index) => ({
                  ...item,
                  condition: itemConditions[`${item.productId}_${index}`] || 'unsellable'
                }));

                const result = await processReturnRequest(returnId, user.id, updatedItems);
                if (result.success) {
                  Alert.alert(
                    "Success",
                    `Return approved!\n\n${sellableCount} sellable item(s) restored to inventory.\n${unsellableCount} unsellable item(s) discarded.`,
                    [{ text: "OK", onPress: () => router.back() }]
                  );
                } else {
                  Alert.alert("Error", result.error || "Failed to process return request");
                }
              } catch (error) {
                console.error("Error approving return:", error);
                Alert.alert("Error", "Failed to approve return request");
              } finally {
                setProcessing(false);
              }
            },
          },
        ]
      );
    }
  };

  const handleRejectReturn = async () => {
    if (!returnData || !user) return;

    Alert.alert(
      "Reject Return Request",
      `Are you sure you want to reject return request ${returnData.returnNumber}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reject",
          style: "destructive",
          onPress: async () => {
            setProcessing(true);
            try {
              const result = await rejectReturnRequest(returnId, user.id, "Rejected by store owner");
              if (result.success) {
                Alert.alert(
                  "Success",
                  "Return request has been rejected.",
                  [{ text: "OK", onPress: () => router.back() }]
                );
              } else {
                Alert.alert("Error", result.error || "Failed to reject return request");
              }
            } catch (error) {
              console.error("Error rejecting return:", error);
              Alert.alert("Error", "Failed to reject return request");
            } finally {
              setProcessing(false);
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
      case 'resolved':
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
      case 'resolved':
        return 'Approved & Resolved';
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
  const canProcess = returnData.status === 'pending';

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
        <Text style={styles.title}>Return Request Details</Text>
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

          {/* Customer Info */}
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Customer</Text>
            <Text style={styles.infoValue}>{returnData.customerName}</Text>
          </View>

          {/* Order Number */}
          {returnData.orderNumber && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Order Number</Text>
              <Text style={styles.infoValue}>{returnData.orderNumber}</Text>
            </View>
          )}

          {/* Refund Method */}
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Refund Method</Text>
            <Text style={styles.infoValue}>{getRefundMethodLabel(returnData.refundMethod)}</Text>
          </View>

          {/* Resolved Date */}
          {returnData.processedAt && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Resolved Date</Text>
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

          const itemKey = `${item.productId}_${index}`;
          const condition = itemConditions[itemKey] || 'unsellable';
          const isPending = returnData.status === 'pending';

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

                {/* For Replace Product: Show special message instead of condition toggle */}
                {isPending && returnData.refundMethod === 'replace_product' && (
                  <View style={styles.replacementInfoBox}>
                    <Text style={styles.replacementInfoText}>
                      → Customer will receive NEW product
                    </Text>
                    <Text style={styles.replacementInfoText}>
                      → Old product will be discarded
                    </Text>
                    {stockInfo[item.productId] && (
                      <Text style={[
                        styles.stockInfoText,
                        !stockInfo[item.productId].sufficient && styles.stockInfoTextWarning
                      ]}>
                        Stock: {stockInfo[item.productId].available} available
                        {!stockInfo[item.productId].sufficient && ' ⚠️ INSUFFICIENT'}
                      </Text>
                    )}
                  </View>
                )}

                {/* Condition Toggle (only for pending Cash Refund and No Refund) */}
                {isPending && returnData.refundMethod !== 'replace_product' && (
                  <TouchableOpacity
                    style={[
                      styles.conditionBadge,
                      condition === 'sellable' ? styles.conditionSellable : styles.conditionUnsellable
                    ]}
                    onPress={() => handleToggleItemCondition(itemKey)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.conditionText}>
                      {condition === 'sellable' ? '✓ Sellable' : '✗ Unsellable'}
                    </Text>
                    <Text style={styles.conditionHint}>Tap to change</Text>
                  </TouchableOpacity>
                )}

                {/* Show condition for non-pending returns */}
                {!isPending && item.condition && returnData.refundMethod !== 'replace_product' && (
                  <View
                    style={[
                      styles.conditionBadgeReadonly,
                      item.condition === 'sellable' ? styles.conditionSellable : styles.conditionUnsellable
                    ]}
                  >
                    <Text style={styles.conditionText}>
                      {item.condition === 'sellable' ? '✓ Sellable' : '✗ Unsellable'}
                    </Text>
                  </View>
                )}
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

        {/* Additional Details from Customer */}
        {returnData.additionalDetails && (
          <View style={styles.detailsCard}>
            <Text style={styles.cardTitle}>Customer Notes</Text>
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

        {/* Store Notes (if any) */}
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

        {/* Action Buttons (only for pending returns) */}
        {canProcess && (
          <View style={styles.actionsContainer}>
            <TouchableOpacity
              style={[styles.approveButton, processing && styles.buttonDisabled]}
              onPress={handleApproveReturn}
              disabled={processing}
              activeOpacity={0.7}
            >
              {processing ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.approveButtonText}>Approve & Process</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.rejectButton, processing && styles.buttonDisabled]}
              onPress={handleRejectReturn}
              disabled={processing}
              activeOpacity={0.7}
            >
              {processing ? (
                <ActivityIndicator color="#E92B45" />
              ) : (
                <Text style={styles.rejectButtonText}>Reject Request</Text>
              )}
            </TouchableOpacity>
          </View>
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
  // Condition Badge
  conditionBadge: {
    marginTop: vs(10),
    paddingVertical: vs(8),
    paddingHorizontal: s(12),
    borderRadius: s(10),
    alignSelf: 'flex-start',
  },
  conditionBadgeReadonly: {
    marginTop: vs(10),
    paddingVertical: vs(8),
    paddingHorizontal: s(12),
    borderRadius: s(10),
    alignSelf: 'flex-start',
    opacity: 0.7,
  },
  conditionSellable: {
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  conditionUnsellable: {
    backgroundColor: '#FEE2E2',
    borderWidth: 1,
    borderColor: '#E92B45',
  },
  conditionText: {
    fontSize: ms(12),
    fontFamily: Fonts.primary,
    fontWeight: '700',
    color: '#1E1E1E',
  },
  conditionHint: {
    fontSize: ms(9),
    fontFamily: Fonts.primary,
    fontWeight: '400',
    color: 'rgba(30, 30, 30, 0.5)',
    marginTop: vs(2),
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
  // Action Buttons
  actionsContainer: {
    marginTop: vs(10),
    gap: vs(12),
  },
  approveButton: {
    backgroundColor: Colors.primary,
    borderRadius: s(20),
    paddingVertical: vs(15),
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: 'rgba(59, 183, 126, 0.3)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: s(4),
    elevation: 4,
  },
  approveButtonText: {
    fontSize: ms(16),
    fontFamily: Fonts.primary,
    fontWeight: '600',
    color: Colors.white,
  },
  rejectButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#E92B45',
    borderRadius: s(20),
    paddingVertical: vs(15),
    alignItems: 'center',
    justifyContent: 'center',
  },
  rejectButtonText: {
    fontSize: ms(16),
    fontFamily: Fonts.primary,
    fontWeight: '600',
    color: '#E92B45',
  },
  buttonDisabled: {
    opacity: 0.6,
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
  // Replacement Info Box
  replacementInfoBox: {
    marginTop: vs(10),
    paddingVertical: vs(10),
    paddingHorizontal: s(12),
    borderRadius: s(10),
    backgroundColor: '#FFF8E1',
    borderWidth: 1,
    borderColor: '#FFA000',
  },
  replacementInfoText: {
    fontSize: ms(11),
    fontFamily: Fonts.primary,
    fontWeight: '500',
    color: '#1E1E1E',
    marginBottom: vs(3),
  },
  stockInfoText: {
    fontSize: ms(11),
    fontFamily: Fonts.primary,
    fontWeight: '600',
    color: Colors.primary,
    marginTop: vs(5),
  },
  stockInfoTextWarning: {
    color: '#E92B45',
    fontWeight: '700',
  },
});
