/**
 * INVOICE SCREEN - Receipt-style invoice display
 * 
 * Figma: https://www.figma.com/design/8I1Nr3vQZllDDknSevstvH/TindaGo-Share?node-id=1428-1813&m=dev
 * 
 * Shows order invoice in receipt format with scalloped edges
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ref, get } from 'firebase/database';
import { database } from '../../../FirebaseConfig';
import { s, vs, ms } from '../../../src/constants/responsive';
import { Colors } from '../../../src/constants/Colors';
import type { Order } from '../../../src/models/Order';
import { Share, Linking } from 'react-native';

export default function InvoiceScreen() {
  const params = useLocalSearchParams();
  const orderId = params.id as string;
  const testMode = params.test === 'true';

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const invoiceRef = useRef<View>(null);

  useEffect(() => {
    if (testMode) {
      setOrder({
        id: 'TEST-ORDER-001',
        orderNumber: '213322RW23F5AWW',
        customerId: 'test-customer',
        customerName: 'Daniol Oppa',
        customerPhone: '+63 912 345 6789',
        storeId: 'test-store-123',
        storeName: 'Golis sari-sari store',
        items: [
          { productId: '1', productName: 'Product 1', productImage: '', quantity: 5, price: 100.05, subtotal: 500.25 },
          { productId: '2', productName: 'Product 2', productImage: '', quantity: 7, price: 0, subtotal: 0 },
        ],
        subtotal: 500.25,
        total: 50.25,
        status: 'preparing',
        paymentMethod: 'gcash',
        paymentStatus: 'paid',
        createdAt: '2025-08-08T09:00:00Z',
        updatedAt: new Date().toISOString(),
      } as Order);
      setLoading(false);
      return;
    }

    if (!orderId) {
      setLoading(false);
      return;
    }

    loadOrder();
  }, [orderId, testMode]);

  const loadOrder = async () => {
    try {
      const orderRef = ref(database, `orders/${orderId}`);
      const snapshot = await get(orderRef);
      if (snapshot.exists()) {
        setOrder({ ...snapshot.val(), id: orderId } as Order);
      }
    } catch (error) {
      console.error('Error loading order:', error);
      Alert.alert('Error', 'Failed to load invoice');
    } finally {
      setLoading(false);
    }
  };

  const handleShareText = async () => {
    try {
      setDownloading(true);

      // Generate shareable invoice text (no native modules needed)
      const invoiceText = `
🧾 INVOICE - ${order?.storeName || 'Store'}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Order #: ${order?.orderNumber || order?.id}
Date: ${formatDate(order?.createdAt || new Date().toISOString())}

📦 ITEMS:
${order?.items.map((item, i) => 
  `${i + 1}. ${item.productName}\n   Qty: ${item.quantity} × ₱${item.price.toFixed(2)} = ₱${item.subtotal.toFixed(2)}`
).join('\n\n')}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Subtotal: ₱${order?.subtotal.toFixed(2)}
TOTAL: ₱${order?.total.toFixed(2)}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Payment: ${order?.paymentMethod?.toUpperCase()}
Status: ${order?.paymentStatus?.toUpperCase()}

Thank you for your order! 🙏
      `.trim();

      // Use React Native's built-in Share API (works without rebuild)
      await Share.share(
        {
          message: invoiceText,
          title: `Invoice ${order?.orderNumber || order?.id}`,
        },
        {
          dialogTitle: 'Share Invoice',
        }
      );

      console.log('✅ Invoice shared successfully');
    } catch (error) {
      console.error('❌ Error sharing invoice:', error);
      Alert.alert('Share Failed', 'Could not share invoice. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

  const generateInvoiceImageUrl = () => {
    if (!order) return null;

    // Create simple text invoice for URL
    const invoiceText = [
      `🧾 INVOICE`,
      `━━━━━━━━━━━━━━━━━━`,
      `Order: ${order.orderNumber}`,
      `Date: ${formatDate(order.createdAt)}`,
      `Store: ${order.storeName}`,
      ``,
      `📦 ITEMS:`,
      ...order.items.map(item => `${item.productName} x${item.quantity} - ₱${item.subtotal.toFixed(2)}`),
      ``,
      `━━━━━━━━━━━━━━━━━━`,
      `Subtotal: ₱${order.subtotal.toFixed(2)}`,
      `TOTAL: ₱${order.total.toFixed(2)}`,
      `━━━━━━━━━━━━━━━━━━`,
      `Payment: ${order.paymentMethod?.toUpperCase()}`,
      `Status: ${order.paymentStatus?.toUpperCase()}`,
      ``,
      `Thank you! 🙏`,
    ].join('%0A');

    // Use Cloudinary's dynamic blank canvas with text overlay
    // This generates an image without uploading anything!
    const cloudName = process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME;
    
    // Generate invoice using Cloudinary's blank canvas feature
    const imageUrl = `https://res.cloudinary.com/${cloudName}/image/upload/` +
      `w_800,h_1400,` + // Canvas size
      `c_fill,` + // Fill canvas
      `b_rgb:ffffff,` + // White background
      `co_rgb:1e1e1e,` + // Dark text color
      `l_text:Arial_20_left:${encodeURIComponent(invoiceText)},` + // Text overlay
      `g_north_west,x_30,y_30/` + // Position text
      `v1/invoices/blank.png`; // Blank canvas (Cloudinary creates this automatically)

    return imageUrl;
  };

  const handleShareImage = async () => {
    try {
      setDownloading(true);
      
      const imageUrl = generateInvoiceImageUrl();
      if (!imageUrl) {
        Alert.alert('Error', 'Could not generate invoice image');
        return;
      }

      // Open Cloudinary image URL in browser - user can easily download from there
      const canOpen = await Linking.canOpenURL(imageUrl);
      if (canOpen) {
        await Linking.openURL(imageUrl);
        
        // Show helpful tip
        setTimeout(() => {
          Alert.alert(
            '📸 Save Invoice',
            'Long-press the image to save it to your Photos/Gallery',
            [{ text: 'Got it!' }]
          );
        }, 1000);
      } else {
        Alert.alert('Error', 'Could not open invoice image');
      }

      console.log('✅ Invoice image opened in browser');
    } catch (error) {
      console.error('❌ Error opening invoice:', error);
      Alert.alert('Error', 'Could not open invoice. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

  const handleDownload = () => {
    Alert.alert(
      'Share Invoice',
      'Choose how to share your invoice:',
      [
        {
          text: 'Share as Text',
          onPress: handleShareText,
        },
        {
          text: 'View as Image',
          onPress: handleShareImage,
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ]
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { day: '2-digit', month: 'long', year: 'numeric' });
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Loading invoice...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!order) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>Invoice not found</Text>
          <TouchableOpacity style={styles.errorButton} onPress={() => router.back()}>
            <Text style={styles.errorButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const itemCount = order.items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color="#1E1E1E" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Invoice</Text>
        <View style={styles.backBtn} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Receipt Card - Capturable View */}
        <View ref={invoiceRef} collapsable={false} style={styles.captureContainer}>
        <View style={styles.receiptCard}>
          {/* Scalloped Top */}
          <View style={styles.scallopTop}>
            {[...Array(13)].map((_, i) => (
              <View key={`top-${i}`} style={styles.scallopCircle} />
            ))}
          </View>

          {/* Bill Content */}
          <View style={styles.billContent}>
            <View style={styles.billRow}>
              <Text style={styles.billLabel}>Item Count</Text>
              <Text style={styles.billValue}>{itemCount} {itemCount === 1 ? 'item' : 'items'}</Text>
            </View>
            
            <View style={styles.billRow}>
              <Text style={styles.billLabel}>Subtotal</Text>
              <Text style={styles.billValue}>₱ {order.subtotal.toFixed(2)}</Text>
            </View>

            {/* Dashed Line */}
            <View style={styles.dashedContainer}>
              {[...Array(20)].map((_, i) => (
                <View key={i} style={styles.dash} />
              ))}
            </View>

            {/* Grand Total */}
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Grand Total</Text>
              <Text style={styles.totalValue}>₱ {order.total.toFixed(2)}</Text>
            </View>
          </View>

          {/* Scalloped Bottom */}
          <View style={styles.scallopBottom}>
            {[...Array(13)].map((_, i) => (
              <View key={`bot-${i}`} style={styles.scallopCircle} />
            ))}
          </View>
        </View>

        {/* Order Details Card */}
        <View style={styles.detailsCard}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Order ID</Text>
            <Text style={styles.detailColon}>:</Text>
            <Text style={styles.detailValue}>{order.orderNumber || order.id}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Date</Text>
            <Text style={styles.detailColon}>:</Text>
            <Text style={styles.detailValue}>{formatDate(order.createdAt)}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Shop</Text>
            <Text style={styles.detailColon}>:</Text>
            <Text style={styles.detailValue}>{order.storeName}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Buyer</Text>
            <Text style={styles.detailColon}>:</Text>
            <Text style={styles.detailValue}>{order.customerName}</Text>
          </View>
        </View>
        </View>
      </ScrollView>

      {/* Download Button */}
      <View style={styles.downloadContainer}>
        <TouchableOpacity 
          style={styles.downloadBtn} 
          onPress={handleDownload}
          disabled={downloading}
        >
          {downloading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <>
              <Ionicons name="share-outline" size={20} color="#FFF" style={{ marginRight: 8 }} />
              <Text style={styles.downloadText}>Share / Save Invoice</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F6F6',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: '#666',
  },
  errorText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
    marginBottom: 20,
  },
  errorButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 10,
  },
  errorButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: s(20),
    paddingVertical: vs(15),
    backgroundColor: '#FFF',
  },
  backBtn: {
    width: s(40),
    height: s(40),
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: ms(20),
    fontWeight: '600',
    color: '#1E1E1E',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: s(20),
    paddingBottom: vs(100),
  },
  captureContainer: {
    backgroundColor: '#F4F6F6',
  },
  receiptCard: {
    backgroundColor: '#FFF',
    borderRadius: s(20),
    marginBottom: vs(20),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  scallopTop: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    position: 'absolute',
    top: -10,
    left: 0,
    right: 0,
    height: 20,
    zIndex: 1,
  },
  scallopBottom: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    position: 'absolute',
    bottom: -10,
    left: 0,
    right: 0,
    height: 20,
    zIndex: 1,
  },
  scallopCircle: {
    width: s(26),
    height: vs(20),
    backgroundColor: '#F4F6F6',
    borderRadius: s(13),
  },
  billContent: {
    paddingHorizontal: s(20),
    paddingTop: vs(35),
    paddingBottom: vs(35),
  },
  billRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: vs(14),
  },
  billLabel: {
    fontSize: ms(14),
    fontWeight: '500',
    color: '#1E1E1E',
  },
  billValue: {
    fontSize: ms(14),
    fontWeight: '600',
    color: '#1E1E1E',
  },
  dashedContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: vs(18),
    paddingHorizontal: s(5),
  },
  dash: {
    width: s(7),
    height: 2,
    backgroundColor: '#1E1E1E',
    borderRadius: 1,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: vs(5),
  },
  totalLabel: {
    fontSize: ms(16),
    fontWeight: '600',
    color: '#FF8D2F',
  },
  totalValue: {
    fontSize: ms(18),
    fontWeight: '700',
    color: '#FF8D2F',
  },
  detailsCard: {
    backgroundColor: '#FFF',
    padding: s(20),
    borderRadius: s(20),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: vs(14),
  },
  detailLabel: {
    fontSize: ms(14),
    fontWeight: '600',
    color: '#1E1E1E',
    width: s(70),
  },
  detailColon: {
    fontSize: ms(14),
    fontWeight: '500',
    color: '#1E1E1E',
    marginHorizontal: s(8),
  },
  detailValue: {
    flex: 1,
    fontSize: ms(14),
    fontWeight: '400',
    color: '#555',
    lineHeight: ms(20),
  },
  downloadContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFF',
    paddingHorizontal: s(20),
    paddingVertical: vs(15),
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  downloadBtn: {
    backgroundColor: '#3BB77E',
    height: vs(50),
    borderRadius: s(15),
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  downloadText: {
    fontSize: ms(16),
    fontWeight: '600',
    color: '#FFF',
  },
});
