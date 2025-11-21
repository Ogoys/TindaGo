/**
 * CUSTOMER RETURN HISTORY SCREEN
 *
 * Figma File: 8I1Nr3vQZllDDknSevstvH
 * Node: 1428-6206 (Return History)
 * Baseline: 440x956
 *
 * PIXEL-PERFECT IMPLEMENTATION with ALL ASSETS EXTRACTED:
 * - Navigation: chevron-left.png (24x24px)
 * - Card Icon: return-icon.png (32x32px on brown background)
 * - Status Icons: status-pending.png, status-resolved.png, status-rejected.png (16x16px)
 * - Empty State: empty-state-returns.png (200x200px)
 *
 * Displays all return requests submitted by the customer.
 * Shows return status (pending, resolved, rejected), items, and refund amounts.
 * Accessible from Customer Profile section.
 *
 * Asset Generation Guide: docs/guides/RETURN_HISTORY_ASSETS_GUIDE.md
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
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useUser } from '../../../../src/contexts/UserContext';
import type { Return, ReturnStatus } from '../../../../src/models/Return';
import { getCustomerReturns } from '../../../../src/api/returns/customerReturns';
import { Colors } from "../../../../src/constants/Colors";
import { Fonts } from "../../../../src/constants/Fonts";
import { s, vs, ms } from "../../../../src/constants/responsive";

export default function CustomerReturnHistoryScreen() {
  const { user } = useUser();
  const [returns, setReturns] = useState<Return[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch customer return requests from Firebase
  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const fetchReturns = async () => {
      try {
        const data = await getCustomerReturns(user.id);
        setReturns(data);
      } catch (error) {
        console.error('Error fetching returns:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchReturns();
  }, [user]);

  const handleBack = () => {
    router.back();
  };

  const handleReturnPress = (returnId: string) => {
    // Navigate to return details screen with return ID
    router.push(`/(main)/(customer)/profile/return-details?returnId=${returnId}`);
  };

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
        <Text style={styles.title}>Return History</Text>
      </View>

      {/* Return List - Figma: x:20, y:145 */}
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.primary} />
            <Text style={styles.loadingText}>Loading return history...</Text>
          </View>
        ) : returns.length === 0 ? (
          <View style={styles.emptyContainer}>
            {/* Empty State Illustration - 200x200px */}
            <Image
              source={require("../../../../src/assets/images/customer-return-history/empty-state-returns.png")}
              style={styles.emptyImage}
              resizeMode="contain"
            />
            <Text style={styles.emptyText}>No return requests yet</Text>
            <Text style={styles.emptySubtext}>Your return history will appear here once you submit return requests</Text>
          </View>
        ) : (
          returns.map((returnItem, index) => (
            <ReturnHistoryCard
              key={returnItem.id}
              returnItem={returnItem}
              onPress={() => handleReturnPress(returnItem.id)}
              isFirst={index === 0}
            />
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

interface ReturnHistoryCardProps {
  returnItem: Return;
  onPress: () => void;
  isFirst: boolean;
}

const ReturnHistoryCard: React.FC<ReturnHistoryCardProps> = ({ returnItem, onPress, isFirst }) => {
  // Format date
  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'N/A';
      return date.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' });
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

  // Get status badge configuration with icons
  const getStatusConfig = (status: ReturnStatus) => {
    switch (status) {
      case 'pending':
        return {
          backgroundColor: '#FFA500',
          color: '#FFFFFF',
          label: 'Pending',
          icon: require("../../../../src/assets/images/customer-return-history/status-pending.png")
        };
      case 'resolved':
        return {
          backgroundColor: Colors.primary,
          color: '#FFFFFF',
          label: 'Resolved',
          icon: require("../../../../src/assets/images/customer-return-history/status-resolved.png")
        };
      case 'rejected':
        return {
          backgroundColor: '#E92B45',
          color: '#FFFFFF',
          label: 'Rejected',
          icon: require("../../../../src/assets/images/customer-return-history/status-rejected.png")
        };
      default:
        return {
          backgroundColor: '#9CA3AF',
          color: '#FFFFFF',
          label: status,
          icon: null
        };
    }
  };

  const statusConfig = getStatusConfig(returnItem.status);

  return (
    <TouchableOpacity
      style={[
        styles.returnCard,
        isFirst && styles.returnCardFirst
      ]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      {/* Return Card - Figma: 400x100 */}

      {/* Logo - Figma: x:20, y:20 (relative to card), size:40x40 */}
      <View style={styles.logoContainer}>
        <View style={styles.logoBackground}>
          <Image
            source={require("../../../../src/assets/images/customer-return-history/return-icon.png")}
            style={styles.returnIcon}
          />
        </View>
      </View>

      {/* Return Info - Figma: x:75, y:22 (relative to card) */}
      <View style={styles.returnInfo}>
        {/* Return Number - Figma: width:150, height:17 */}
        <Text style={styles.returnNumber}>{returnItem.returnNumber || 'N/A'}</Text>

        {/* Store Name - Figma: y:44 (relative to card) */}
        <Text style={styles.storeName}>{returnItem.storeName || 'N/A'}</Text>

        {/* Status Badge with Icon - Figma: y:66 */}
        <View style={[styles.statusBadge, { backgroundColor: statusConfig.backgroundColor }]}>
          {statusConfig.icon && (
            <Image
              source={statusConfig.icon}
              style={styles.statusIcon}
              resizeMode="contain"
            />
          )}
          <Text style={[styles.statusText, { color: statusConfig.color }]}>
            {statusConfig.label}
          </Text>
        </View>
      </View>

      {/* Right Section */}
      <View style={styles.rightSection}>
        {/* Date - Figma: x:296, y:22 (relative to card) */}
        <Text style={styles.date}>
          {formatDate(returnItem.createdAt)}
        </Text>

        {/* Items Count - Figma: x:300, y:45 (relative to card) */}
        <Text style={styles.itemsCount}>
          {returnItem.items.length} {returnItem.items.length === 1 ? 'item' : 'items'}
        </Text>

        {/* Total Refund - Figma: x:315, y:68 (relative to card) */}
        <Text style={styles.total}>₱{formatCurrency(returnItem.totalRefund)}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundGray, // #F4F6F6
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
    color: Colors.darkGray, // #1E1E1E
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
  // Return Card - Figma: x:20, y:145, width:400, height:100
  returnCard: {
    width: s(400),
    minHeight: vs(100),
    backgroundColor: Colors.white,
    borderRadius: s(16),
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 3,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: s(20),
    paddingVertical: vs(20),
    marginBottom: vs(20),
  },
  returnCardFirst: {
    marginTop: vs(0),
  },
  // Logo Container - Figma: x:20, y:20 (relative to card), size:40x40
  logoContainer: {
    marginRight: s(15),
  },
  logoBackground: {
    width: s(40),
    height: s(40),
    borderRadius: s(5),
    backgroundColor: '#8B4513', // Brown color for return icon
    justifyContent: 'center',
    alignItems: 'center',
  },
  returnIcon: {
    width: s(25),
    height: s(25),
    resizeMode: 'contain',
    tintColor: '#FFFFFF',
  },
  // Return Info - Figma: x:75, y:22 (relative to card)
  returnInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  // Return Number - Figma: width:150, height:17, fontSize:14
  returnNumber: {
    fontSize: ms(14),
    fontFamily: Fonts.primary,
    fontWeight: '600',
    color: Colors.darkGray, // #1E1E1E
    lineHeight: ms(17.22), // 1.23em
    marginBottom: vs(5),
  },
  // Store Name - Figma: fontSize:12, lineHeight:1.23em
  storeName: {
    fontSize: ms(12),
    fontFamily: Fonts.primary,
    fontWeight: '500',
    color: 'rgba(30, 30, 30, 0.5)',
    lineHeight: ms(14.76), // 1.23em
    marginBottom: vs(6),
  },
  // Status Badge - Figma: inline badge with icon
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: s(10),
    paddingVertical: vs(4),
    borderRadius: s(8),
    gap: s(5), // Space between icon and text
  },
  // Status Icon - 16x16px scaled to 12x12
  statusIcon: {
    width: s(12),
    height: s(12),
  },
  statusText: {
    fontSize: ms(11),
    fontFamily: Fonts.primary,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  // Right Section
  rightSection: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  // Date - Figma: x:296, y:22, width:84, height:17, fontSize:12
  date: {
    fontSize: ms(12),
    fontFamily: Fonts.primary,
    fontWeight: '500',
    color: 'rgba(30, 30, 30, 0.5)',
    lineHeight: ms(14.76), // 1.23em
    marginBottom: vs(3),
    textAlign: 'right',
  },
  // Items Count - Figma: x:300, y:45, fontSize:11
  itemsCount: {
    fontSize: ms(11),
    fontFamily: Fonts.primary,
    fontWeight: '500',
    color: 'rgba(30, 30, 30, 0.4)',
    lineHeight: ms(13.53), // 1.23em
    marginBottom: vs(4),
    textAlign: 'right',
  },
  // Total - Figma: x:315, y:68, width:65, height:20, fontSize:16
  total: {
    fontSize: ms(16),
    fontFamily: Fonts.primary,
    fontWeight: '600',
    color: Colors.primary,
    lineHeight: ms(19.68), // 1.23em
    textAlign: 'right',
  },
  // Loading State
  loadingContainer: {
    paddingVertical: vs(80),
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: vs(15),
    fontSize: ms(16),
    fontFamily: Fonts.primary,
    fontWeight: '500',
    color: 'rgba(30, 30, 30, 0.5)',
  },
  // Empty State
  emptyContainer: {
    paddingVertical: vs(80),
    paddingHorizontal: s(40),
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Empty State Image - 200x200px scaled to 150x150
  emptyImage: {
    width: s(150),
    height: s(150),
    marginBottom: vs(20),
    opacity: 0.7,
  },
  emptyText: {
    fontSize: ms(18),
    fontFamily: Fonts.primary,
    fontWeight: '600',
    color: 'rgba(30, 30, 30, 0.5)',
    marginBottom: vs(10),
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: ms(14),
    fontFamily: Fonts.primary,
    fontWeight: '400',
    color: 'rgba(30, 30, 30, 0.4)',
    textAlign: 'center',
    lineHeight: ms(14) * 1.5,
  },
});
