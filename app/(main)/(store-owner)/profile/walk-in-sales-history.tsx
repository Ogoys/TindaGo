/**
 * WALK-IN SALES HISTORY SCREEN
 * 
 * Displays all recorded walk-in sales transactions
 * Shows date, items, total amount, and customer name
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  StatusBar,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { router } from 'expo-router';
import { auth } from '../../../../FirebaseConfig';
import { s, vs, ms } from '../../../../src/constants/responsive';
import { Colors } from '../../../../src/constants/Colors';
import { Fonts } from '../../../../src/constants/Fonts';
import { getWalkInSales } from '../../../../src/api/walkInSales';
import { WalkInSale } from '../../../../src/models/WalkInSale';
import { getProductImageSource } from '../../../../src/lib/helpers/imageHelper';

const WalkInSalesHistoryScreen = () => {
  const [sales, setSales] = useState<WalkInSale[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSale, setSelectedSale] = useState<WalkInSale | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  useEffect(() => {
    fetchSalesHistory();
  }, []);

  const fetchSalesHistory = async () => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        setLoading(false);
        return;
      }

      const salesData = await getWalkInSales(currentUser.uid);
      setSales(salesData);
    } catch (error) {
      console.error('Error fetching sales history:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    router.back();
  };

  const handleSalePress = (sale: WalkInSale) => {
    setSelectedSale(sale);
    setShowDetailsModal(true);
  };

  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.backgroundGray} />

      {/* Fixed Header */}
      <View style={styles.headerContainer}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack} activeOpacity={0.7}>
          <Image
            source={require('../../../../src/assets/images/store-product/chevron-left.png')}
            style={styles.backIcon}
          />
        </TouchableOpacity>
        <Text style={styles.title}>Walk-in Sales History</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {loading ? (
          <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: 40 }} />
        ) : sales.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No sales recorded yet</Text>
            <Text style={styles.emptyStateSubtext}>Walk-in sales will appear here</Text>
          </View>
        ) : (
          sales.map((sale) => (
            <TouchableOpacity
              key={sale.id}
              style={styles.saleCard}
              onPress={() => handleSalePress(sale)}
              activeOpacity={0.7}
            >
              <View style={styles.saleCardHeader}>
                <Text style={styles.saleDate}>{formatDate(sale.createdAt)}</Text>
                <Text style={styles.saleTotal}>₱{sale.totalAmount.toFixed(2)}</Text>
              </View>

              <View style={styles.saleCardBody}>
                <Text style={styles.saleItemsCount}>
                  {sale.items.length} item{sale.items.length > 1 ? 's' : ''}
                </Text>
                {sale.customerName && (
                  <Text style={styles.customerNameText}>Customer: {sale.customerName}</Text>
                )}
              </View>

              <View style={styles.saleCardFooter}>
                <Text style={styles.tapToViewText}>Tap to view details</Text>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      {/* Sale Details Modal */}
      <Modal
        visible={showDetailsModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowDetailsModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowDetailsModal(false)}
        >
          <View style={styles.detailsModal}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowDetailsModal(false)}
              activeOpacity={0.7}
            >
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>

            {selectedSale && (
              <ScrollView showsVerticalScrollIndicator={false}>
                <Text style={styles.modalTitle}>Sale Details</Text>

                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Date:</Text>
                  <Text style={styles.detailValue}>{formatDate(selectedSale.createdAt)}</Text>
                </View>

                {selectedSale.customerName && (
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Customer:</Text>
                    <Text style={styles.detailValue}>{selectedSale.customerName}</Text>
                  </View>
                )}

                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Payment:</Text>
                  <Text style={styles.detailValue}>Cash</Text>
                </View>

                <Text style={styles.itemsTitle}>Items:</Text>

                {selectedSale.items.map((item, index) => {
                  const imageSource = getProductImageSource({
                    productImageUrl: item.productImageUrl,
                    productImage: item.productImage
                  });
                  
                  return (
                    <View key={index} style={styles.itemCard}>
                      {imageSource ? (
                        <Image source={imageSource} style={styles.itemImage} />
                      ) : (
                        <View style={[styles.itemImage, styles.itemImagePlaceholder]}>
                          <Text style={styles.placeholderText}>No Image</Text>
                        </View>
                      )}
                      <View style={styles.itemInfo}>
                      <Text style={styles.itemName}>{item.productName}</Text>
                      <Text style={styles.itemSize}>
                        {item.productSize} {item.unit}
                      </Text>
                      <Text style={styles.itemPrice}>
                        {item.quantity} x ₱{item.price.toFixed(2)} = ₱{item.subtotal.toFixed(2)}
                        </Text>
                      </View>
                    </View>
                  );
                })}

                <View style={styles.totalRow}>
                  <Text style={styles.totalLabel}>Total Amount</Text>
                  <Text style={styles.totalValue}>₱{selectedSale.totalAmount.toFixed(2)}</Text>
                </View>
              </ScrollView>
            )}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundGray,
  },

  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: s(20),
    paddingTop: vs(79),
    paddingBottom: vs(20),
    backgroundColor: Colors.backgroundGray,
  },

  backButton: {
    width: s(30),
    height: s(30),
    justifyContent: 'center',
    alignItems: 'center',
  },

  backIcon: {
    width: s(30),
    height: s(30),
  },

  title: {
    fontFamily: Fonts.primary,
    fontWeight: '600',
    fontSize: ms(18),
    lineHeight: ms(24),
    color: Colors.darkGray,
    marginLeft: s(70),
    includeFontPadding: false,
  },

  scrollContent: {
    paddingHorizontal: s(20),
    paddingBottom: vs(40),
  },

  emptyState: {
    backgroundColor: Colors.white,
    borderRadius: s(16),
    paddingVertical: vs(60),
    alignItems: 'center',
    marginTop: vs(40),
  },

  emptyStateText: {
    fontFamily: Fonts.primary,
    fontWeight: '600',
    fontSize: ms(18),
    color: Colors.darkGray,
    marginBottom: vs(8),
  },

  emptyStateSubtext: {
    fontFamily: Fonts.primary,
    fontSize: ms(14),
    color: Colors.textSecondary,
  },

  saleCard: {
    backgroundColor: Colors.white,
    borderRadius: s(16),
    padding: s(15),
    marginBottom: vs(15),
    shadowColor: 'rgba(0, 0, 0, 0.25)',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 5,
    elevation: 5,
  },

  saleCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: vs(10),
  },

  saleDate: {
    fontFamily: Fonts.primary,
    fontWeight: '600',
    fontSize: ms(15),
    color: Colors.darkGray,
  },

  saleTotal: {
    fontFamily: Fonts.primary,
    fontWeight: '700',
    fontSize: ms(18),
    color: Colors.primary,
  },

  saleCardBody: {
    marginBottom: vs(10),
  },

  saleItemsCount: {
    fontFamily: Fonts.primary,
    fontSize: ms(14),
    color: Colors.textSecondary,
    marginBottom: vs(4),
  },

  customerNameText: {
    fontFamily: Fonts.primary,
    fontSize: ms(13),
    color: Colors.textSecondary,
  },

  saleCardFooter: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
    paddingTop: vs(10),
  },

  tapToViewText: {
    fontFamily: Fonts.primary,
    fontSize: ms(12),
    color: Colors.primary,
    textAlign: 'center',
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  detailsModal: {
    backgroundColor: Colors.white,
    borderRadius: s(20),
    width: '90%',
    maxHeight: '80%',
    padding: s(20),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },

  closeButton: {
    position: 'absolute',
    top: s(15),
    right: s(15),
    width: s(32),
    height: s(32),
    borderRadius: s(16),
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },

  closeButtonText: {
    fontSize: ms(18),
    fontWeight: '600',
    color: Colors.textSecondary,
  },

  modalTitle: {
    fontFamily: Fonts.primary,
    fontWeight: '700',
    fontSize: ms(22),
    color: Colors.darkGray,
    marginBottom: vs(20),
  },

  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: vs(12),
    paddingBottom: vs(12),
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.08)',
  },

  detailLabel: {
    fontFamily: Fonts.primary,
    fontWeight: '600',
    fontSize: ms(15),
    color: Colors.darkGray,
  },

  detailValue: {
    fontFamily: Fonts.primary,
    fontSize: ms(15),
    color: Colors.textSecondary,
  },

  itemsTitle: {
    fontFamily: Fonts.primary,
    fontWeight: '600',
    fontSize: ms(16),
    color: Colors.darkGray,
    marginTop: vs(10),
    marginBottom: vs(12),
  },

  itemCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0, 0, 0, 0.02)',
    borderRadius: s(12),
    padding: s(10),
    marginBottom: vs(10),
  },

  itemImage: {
    width: s(50),
    height: s(50),
    borderRadius: s(8),
  },

  itemImagePlaceholder: {
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
  },

  placeholderText: {
    fontFamily: Fonts.primary,
    fontSize: ms(10),
    color: Colors.textSecondary,
  },

  itemInfo: {
    flex: 1,
    marginLeft: s(10),
  },

  itemName: {
    fontFamily: Fonts.primary,
    fontWeight: '600',
    fontSize: ms(14),
    color: Colors.darkGray,
    marginBottom: vs(2),
  },

  itemSize: {
    fontFamily: Fonts.primary,
    fontSize: ms(12),
    color: Colors.textSecondary,
    marginBottom: vs(2),
  },

  itemPrice: {
    fontFamily: Fonts.primary,
    fontWeight: '600',
    fontSize: ms(13),
    color: Colors.primary,
  },

  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    borderRadius: s(12),
    padding: s(15),
    marginTop: vs(20),
  },

  totalLabel: {
    fontFamily: Fonts.primary,
    fontWeight: '600',
    fontSize: ms(16),
    color: Colors.white,
  },

  totalValue: {
    fontFamily: Fonts.primary,
    fontWeight: '700',
    fontSize: ms(22),
    color: Colors.white,
  },
});

export default WalkInSalesHistoryScreen;
