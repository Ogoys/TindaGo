/**
 * PendingApprovalDetails Component
 *
 * Displays business details for stores pending approval
 * Fetches data from the correct Firebase Realtime Database structure
 */

import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { ref, get } from 'firebase/database';
import { database } from '../../../FirebaseConfig';
import { Colors } from '@/constants/Colors';
import { Fonts } from '@/constants/Fonts';
import { s, vs } from '@/constants/responsive';

interface BusinessDetails {
  address: string;
  city: string;
  description: string;
  storeName: string;
}

interface PendingApprovalDetailsProps {
  storeOwnerId: string;
  onDataLoaded?: (data: BusinessDetails | null) => void;
}

export const PendingApprovalDetails: React.FC<PendingApprovalDetailsProps> = ({
  storeOwnerId,
  onDataLoaded
}) => {
  const [businessDetails, setBusinessDetails] = useState<BusinessDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBusinessDetails = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('🔍 [PendingApprovalDetails] Fetching data for storeOwnerId:', storeOwnerId);

      // First, try to get data from stores collection (primary source for approved/pending stores)
      const storeRef = ref(database, `stores/${storeOwnerId}`);
      const storeSnapshot = await get(storeRef);

      console.log('📊 [PendingApprovalDetails] Store data exists:', storeSnapshot.exists());

      let details: BusinessDetails | null = null;

      if (storeSnapshot.exists()) {
        const storeData = storeSnapshot.val();
        console.log('📋 [PendingApprovalDetails] Raw store data:', JSON.stringify(storeData, null, 2));

        // Map according to actual Firebase structure (with businessInfo nested object)
        const businessInfo = storeData.businessInfo || {};
        details = {
          address: businessInfo.address || '',
          city: businessInfo.city || '',
          description: businessInfo.description || '',
          storeName: businessInfo.storeName || 'Unknown Store'
        };

        console.log('🗺️ [PendingApprovalDetails] Mapped store details:', JSON.stringify(details, null, 2));
      } else {
        // Fallback to store_registrations if stores doesn't exist
        console.log('⚠️ [PendingApprovalDetails] Store not found, checking store_registrations...');

        const registrationRef = ref(database, `store_registrations/${storeOwnerId}`);
        const registrationSnapshot = await get(registrationRef);

        console.log('📊 [PendingApprovalDetails] Registration data exists:', registrationSnapshot.exists());

        if (registrationSnapshot.exists()) {
          const registrationData = registrationSnapshot.val();
          console.log('📋 [PendingApprovalDetails] Raw registration data:', JSON.stringify(registrationData, null, 2));

          // Map according to actual Firebase structure for store_registrations
          const businessInfo = registrationData.businessInfo || {};

          details = {
            address: businessInfo.address || '',
            city: businessInfo.city || '',
            description: businessInfo.description || 'Registration in progress',
            storeName: businessInfo.storeName || 'Unknown Store'
          };

          console.log('🗺️ [PendingApprovalDetails] Mapped registration details:', JSON.stringify(details, null, 2));
        }
      }

      // Try to extract city from address if full address contains comma
      if (details && details.address && details.address.includes(',')) {
        const addressParts = details.address.split(',').map(part => part.trim());
        if (addressParts.length >= 2) {
          details.address = addressParts.slice(0, -1).join(', ');
          details.city = addressParts[addressParts.length - 1];
          console.log('🏙️ [PendingApprovalDetails] Extracted city from address:', details.city);
        }
      }

      console.log('✅ [PendingApprovalDetails] Final details:', JSON.stringify(details, null, 2));

      setBusinessDetails(details);
      onDataLoaded?.(details);
    } catch (err: any) {
      console.error('❌ [PendingApprovalDetails] Error fetching business details:', err);
      setError(err.message || 'Failed to fetch business details');
      onDataLoaded?.(null);
    } finally {
      setLoading(false);
    }
  }, [storeOwnerId, onDataLoaded]);

  useEffect(() => {
    fetchBusinessDetails();
  }, [fetchBusinessDetails]);

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={Colors.primary} />
          <Text style={styles.loadingText}>Loading business details...</Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Error: {error}</Text>
        </View>
      </View>
    );
  }

  if (!businessDetails) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>No business details found</Text>
        </View>
      </View>
    );
  }

  // Combine address and city as requested
  const fullAddress = (() => {
    if (!businessDetails.address && !businessDetails.city) {
      return 'Address not provided';
    }

    // If city exists and address doesn't already end with the city
    if (businessDetails.city && !businessDetails.address.toLowerCase().includes(businessDetails.city.toLowerCase())) {
      return `${businessDetails.address}, ${businessDetails.city}`.replace(/^,\s*/, '').replace(/,\s*$/, '');
    }

    // Return the address as-is if it already contains the city or no city is available
    return businessDetails.address || businessDetails.city || 'Address not provided';
  })();

  const description = businessDetails.description || 'No business description provided';

  console.log('🏠 [PendingApprovalDetails] Final address display:', fullAddress);
  console.log('📝 [PendingApprovalDetails] Final description display:', description);

  return (
    <View style={styles.container}>
      {/* Business Details Section */}
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Business Details</Text>

        <View style={styles.detailRow}>
          <Text style={styles.label}>Store Name:</Text>
          <Text style={styles.value}>{businessDetails.storeName}</Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.label}>Address:</Text>
          <Text style={styles.value}>{fullAddress}</Text>
        </View>
      </View>

      {/* Business Description Section */}
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Business Description</Text>

        <View style={styles.descriptionContainer}>
          <Text style={styles.descriptionText}>{description}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.white,
    borderRadius: s(12),
    padding: s(16),
    marginVertical: vs(8),
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: s(4),
    elevation: 3,
  },

  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: vs(20),
  },

  loadingText: {
    fontFamily: Fonts.primary,
    fontSize: s(14),
    color: Colors.darkGray,
    marginLeft: s(8),
  },

  errorContainer: {
    alignItems: 'center',
    paddingVertical: vs(20),
  },

  errorText: {
    fontFamily: Fonts.primary,
    fontSize: s(14),
    color: Colors.red,
    textAlign: 'center',
  },

  sectionContainer: {
    marginBottom: vs(16),
  },

  sectionTitle: {
    fontFamily: Fonts.primary,
    fontSize: s(16),
    fontWeight: Fonts.weights.semiBold,
    color: Colors.darkGray,
    marginBottom: vs(12),
    borderBottomWidth: 1,
    borderBottomColor: Colors.lightGray || '#E5E5E5',
    paddingBottom: vs(8),
  },

  detailRow: {
    flexDirection: 'row',
    marginBottom: vs(8),
    alignItems: 'flex-start',
  },

  label: {
    fontFamily: Fonts.primary,
    fontSize: s(14),
    fontWeight: Fonts.weights.medium,
    color: Colors.darkGray,
    width: s(80),
    marginRight: s(12),
  },

  value: {
    fontFamily: Fonts.primary,
    fontSize: s(14),
    fontWeight: Fonts.weights.normal,
    color: Colors.darkGray,
    flex: 1,
    lineHeight: s(14) * 1.4,
  },

  descriptionContainer: {
    backgroundColor: Colors.backgroundGray || '#F8F9FA',
    borderRadius: s(8),
    padding: s(12),
    borderWidth: 1,
    borderColor: Colors.lightGray || '#E5E5E5',
  },

  descriptionText: {
    fontFamily: Fonts.primary,
    fontSize: s(14),
    fontWeight: Fonts.weights.normal,
    color: Colors.darkGray,
    lineHeight: s(14) * 1.4,
  },
});