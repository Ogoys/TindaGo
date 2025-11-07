/**
 * Store Information Screen - TindaGo Store Owner Profile
 * 
 * Displays detailed store information fetched from Firebase Realtime Database
 * Route: app/(main)/(store-owner)/profile/store-info.tsx
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Linking,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { auth, database } from '@/lib/firebase';
import { ref, get, onValue, off } from 'firebase/database';
import { Colors } from '@/constants/Colors';
import { ProfileScreenHeader } from '@/components/store-owner/ProfileScreenHeader';

interface StoreData {
  storeName: string;
  storeImage?: string;
  description?: string;
  category?: string;
  businessType?: string;
  phoneNumber?: string;
  email?: string;
  address?: string;
  city?: string;
  operatingHours?: {
    [key: string]: string;
  };
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  status?: string;
  isOpen?: boolean;
  ownerName?: string;
}

export default function StoreInfoScreen() {
  const [storeData, setStoreData] = useState<StoreData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStoreData = async () => {
      try {
        const user = auth.currentUser;
        if (!user) {
          setError('No authenticated user');
          setLoading(false);
          return;
        }

        console.log('🔍 Fetching store data for user:', user.uid);

        // Fetch store data from store_registrations
        const storeRegRef = ref(database, `store_registrations/${user.uid}`);
        const storeRegSnapshot = await get(storeRegRef);

        if (storeRegSnapshot.exists()) {
          const regData = storeRegSnapshot.val();
          console.log('✅ Store registration data found');

          // Fetch user data for email/phone
          const userRef = ref(database, `users/${user.uid}`);
          const userSnapshot = await get(userRef);
          const userData = userSnapshot.exists() ? userSnapshot.val() : {};

          // Map the data to our interface
          const mappedData: StoreData = {
            storeName: regData.businessInfo?.storeName || regData.storeName || 'My Store',
            storeImage: regData.businessInfo?.logo || regData.logo || null,
            description: regData.businessInfo?.description || regData.description || 'Welcome to our store! We offer quality products and excellent service.',
            category: regData.businessInfo?.businessType || regData.businessInfo?.storeType || 'Sari-Sari Store',
            businessType: regData.businessInfo?.businessType || 'Sari-Sari Store',
            phoneNumber: regData.businessInfo?.contactNumber || regData.contactNumber || userData.phoneNumber || user.phoneNumber || '',
            email: regData.businessInfo?.email || userData.email || user.email || '',
            address: regData.businessInfo?.address || regData.address || '',
            city: regData.businessInfo?.city || regData.city || 'Davao City',
            operatingHours: regData.operatingHours || {
              Monday: '8:00 AM - 6:00 PM',
              Tuesday: '8:00 AM - 6:00 PM',
              Wednesday: '8:00 AM - 6:00 PM',
              Thursday: '8:00 AM - 6:00 PM',
              Friday: '8:00 AM - 6:00 PM',
              Saturday: '9:00 AM - 5:00 PM',
              Sunday: 'Closed',
            },
            coordinates: regData.businessInfo?.coordinates || regData.coordinates || {
              latitude: 7.0731,
              longitude: 125.6128,
            },
            status: regData.status || 'active',
            isOpen: regData.isOpen ?? true,
            ownerName: userData.name || regData.ownerName || 'Store Owner',
          };

          setStoreData(mappedData);
          setError(null);

          // Set up real-time listener for store updates
          const storeListener = onValue(storeRegRef, (snapshot) => {
            if (snapshot.exists()) {
              const updatedData = snapshot.val();
              setStoreData(prev => ({
                ...prev!,
                isOpen: updatedData.isOpen ?? prev!.isOpen,
                status: updatedData.status || prev!.status,
                storeName: updatedData.businessInfo?.storeName || prev!.storeName,
              }));
            }
          });

          return () => {
            off(storeRegRef, 'value', storeListener);
          };
        } else {
          console.log('❌ No store registration data found');
          setError('Store information not found. Please complete your store registration.');
        }
      } catch (error) {
        console.error('💥 Error fetching store data:', error);
        setError('Failed to load store information');
      } finally {
        setLoading(false);
      }
    };

    fetchStoreData();
  }, []);

  const handleCall = () => {
    if (!storeData?.phoneNumber) {
      Alert.alert('No Phone Number', 'Phone number not available');
      return;
    }
    const phoneUrl = `tel:${storeData.phoneNumber}`;
    Linking.canOpenURL(phoneUrl).then((supported) => {
      if (supported) {
        Linking.openURL(phoneUrl);
      } else {
        Alert.alert('Error', 'Cannot make phone calls on this device');
      }
    });
  };

  const handleEmail = () => {
    if (!storeData?.email) {
      Alert.alert('No Email', 'Email address not available');
      return;
    }
    const emailUrl = `mailto:${storeData.email}`;
    Linking.canOpenURL(emailUrl).then((supported) => {
      if (supported) {
        Linking.openURL(emailUrl);
      }
    });
  };

  const handleDirections = () => {
    if (!storeData?.coordinates) {
      Alert.alert('No Location', 'Store location not available');
      return;
    }
    const scheme = Platform.select({
      ios: 'maps:',
      android: 'geo:',
    });
    const url = Platform.select({
      ios: `${scheme}?q=${storeData.coordinates.latitude},${storeData.coordinates.longitude}`,
      android: `${scheme}${storeData.coordinates.latitude},${storeData.coordinates.longitude}`,
    });

    if (url) {
      Linking.openURL(url);
    }
  };

  const handleBack = () => {
    router.back();
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor={Colors.backgroundGray} />
        <ProfileScreenHeader title="Store Information" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Loading store information...</Text>
        </View>
      </View>
    );
  }

  if (error || !storeData) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor={Colors.backgroundGray} />
        <ProfileScreenHeader title="Store Information" />
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={64} color="#FF4444" />
          <Text style={styles.errorText}>{error || 'Store information not found'}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => setLoading(true)}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.backgroundGray} />

      {/* Header */}
      <ProfileScreenHeader title="Store Information" />

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Store Image */}
        <View style={styles.imageContainer}>
          {storeData.storeImage ? (
            <Image
              source={{ uri: storeData.storeImage }}
              style={styles.storeImage}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.placeholderImage}>
              <Ionicons name="storefront" size={64} color="#CCCCCC" />
              <Text style={styles.placeholderText}>No Store Image</Text>
            </View>
          )}
        </View>

        {/* Store Basic Info */}
        <View style={styles.storeInfoSection}>
          <View style={styles.storeNameRow}>
            <Text style={styles.storeName}>{storeData.storeName}</Text>
            <View style={[
              styles.statusBadge,
              { backgroundColor: storeData.isOpen ? '#22C55E' : '#EF4444' }
            ]}>
              <Text style={styles.statusText}>
                {storeData.isOpen ? 'Open' : 'Closed'}
              </Text>
            </View>
          </View>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{storeData.category}</Text>
          </View>
        </View>

        {/* Description Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="information-circle" size={20} color={Colors.primary} />
            <Text style={styles.sectionTitle}>About</Text>
          </View>
          <Text style={styles.descriptionText}>{storeData.description}</Text>
        </View>

        {/* Contact Information Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="call" size={20} color={Colors.primary} />
            <Text style={styles.sectionTitle}>Contact Information</Text>
          </View>

          {/* Phone */}
          {storeData.phoneNumber && (
            <TouchableOpacity style={styles.contactItem} onPress={handleCall}>
              <View style={styles.contactIconContainer}>
                <Ionicons name="call-outline" size={20} color={Colors.primary} />
              </View>
              <View style={styles.contactTextContainer}>
                <Text style={styles.contactLabel}>Phone</Text>
                <Text style={styles.contactValue}>{storeData.phoneNumber}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#999999" />
            </TouchableOpacity>
          )}

          {/* Email */}
          {storeData.email && (
            <TouchableOpacity style={styles.contactItem} onPress={handleEmail}>
              <View style={styles.contactIconContainer}>
                <Ionicons name="mail-outline" size={20} color={Colors.primary} />
              </View>
              <View style={styles.contactTextContainer}>
                <Text style={styles.contactLabel}>Email</Text>
                <Text style={styles.contactValue}>{storeData.email}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#999999" />
            </TouchableOpacity>
          )}
        </View>

        {/* Operating Hours Section */}
        {storeData.operatingHours && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="time" size={20} color={Colors.primary} />
              <Text style={styles.sectionTitle}>Operating Hours</Text>
            </View>

            {Object.entries(storeData.operatingHours).map(([day, hours]) => (
              <View key={day} style={styles.hoursRow}>
                <Text style={styles.dayText}>{day}</Text>
                <Text
                  style={[
                    styles.hoursText,
                    hours === 'Closed' && styles.closedText,
                  ]}
                >
                  {hours}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Location Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="location" size={20} color={Colors.primary} />
            <Text style={styles.sectionTitle}>Location</Text>
          </View>

          <View style={styles.addressContainer}>
            {storeData.address && (
              <Text style={styles.addressText}>{storeData.address}</Text>
            )}
            {storeData.city && (
              <Text style={styles.cityText}>{storeData.city}</Text>
            )}
          </View>

          {/* Map Button */}
          {storeData.coordinates && (
            <TouchableOpacity
              style={styles.mapContainer}
              onPress={handleDirections}
            >
              <View style={styles.mapPlaceholder}>
                <Ionicons name="map" size={40} color={Colors.primary} />
                <Text style={styles.mapText}>Tap to view on map</Text>
              </View>
            </TouchableOpacity>
          )}
        </View>

        {/* Bottom Spacing */}
        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.actionButtonsContainer}>
        {storeData.phoneNumber && (
          <TouchableOpacity style={styles.actionButton} onPress={handleCall}>
            <Ionicons name="call" size={24} color="#FFFFFF" />
            <Text style={styles.actionButtonText}>Call</Text>
          </TouchableOpacity>
        )}

        {storeData.email && (
          <TouchableOpacity style={styles.actionButton} onPress={handleEmail}>
            <Ionicons name="mail" size={24} color="#FFFFFF" />
            <Text style={styles.actionButtonText}>Email</Text>
          </TouchableOpacity>
        )}

        {storeData.coordinates && (
          <TouchableOpacity style={styles.actionButton} onPress={handleDirections}>
            <Ionicons name="navigate" size={24} color="#FFFFFF" />
            <Text style={styles.actionButtonText}>Directions</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundGray,
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 24,
    paddingHorizontal: 32,
    paddingVertical: 12,
    backgroundColor: Colors.primary,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  imageContainer: {
    width: '100%',
    height: 200,
    backgroundColor: '#E5E5E5',
  },
  storeImage: {
    width: '100%',
    height: '100%',
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F0F0F0',
  },
  placeholderText: {
    marginTop: 8,
    fontSize: 14,
    color: '#999999',
  },
  storeInfoSection: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  storeNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  storeName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1E1E1E',
    flex: 1,
  },
  businessType: {
    fontSize: 14,
    color: '#666666',
    marginTop: 4,
    marginBottom: 8,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  categoryBadge: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  categoryText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  section: {
    backgroundColor: '#FFFFFF',
    marginTop: 8,
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E1E1E',
    marginLeft: 8,
  },
  descriptionText: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  contactIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F0F9F4',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  contactTextContainer: {
    flex: 1,
  },
  contactLabel: {
    fontSize: 12,
    color: '#999999',
    marginBottom: 2,
  },
  contactValue: {
    fontSize: 14,
    color: '#1E1E1E',
    fontWeight: '500',
  },
  hoursRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  dayText: {
    fontSize: 14,
    color: '#1E1E1E',
    fontWeight: '500',
  },
  hoursText: {
    fontSize: 14,
    color: '#666666',
  },
  closedText: {
    color: '#FF4444',
  },
  addressContainer: {
    marginBottom: 16,
  },
  addressText: {
    fontSize: 14,
    color: '#1E1E1E',
    marginBottom: 4,
  },
  cityText: {
    fontSize: 14,
    color: '#666666',
  },
  mapContainer: {
    width: '100%',
    height: 150,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#F0F9F4',
  },
  mapPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapText: {
    marginTop: 8,
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '500',
  },
  actionButtonsContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    borderRadius: 8,
    marginHorizontal: 4,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
});
