import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Colors } from '../../../src/constants/Colors';
import { Fonts } from '../../../src/constants/Fonts';
import { s, vs } from '../../../src/constants/responsive';

interface CartItem {
  id: string;
  name: string;
  weight: string;
  price: number;
  image?: any;
}

const CartScreen = () => {
  const router = useRouter();
  const [notes, setNotes] = useState('');
  
  // Mock cart data based on Figma design
  const [cartItems, setCartItems] = useState<CartItem[]>([
    {
      id: '1',
      name: 'Assorted Capsicum',
      weight: '500g',
      price: 500.25,
    },
    {
      id: '2',
      name: 'Assorted Capsicum',
      weight: '500g',
      price: 500.25,
    },
    {
      id: '3',
      name: 'Assorted Capsicum',
      weight: '500g',
      price: 500.25,
    },
    {
      id: '4',
      name: 'Assorted Capsicum',
      weight: '500g',
      price: 500.25,
    },
    {
      id: '5',
      name: 'Assorted Capsicum',
      weight: '500g',
      price: 500.25,
    },
  ]);

  const removeItem = (id: string) => {
    setCartItems(cartItems.filter(item => item.id !== id));
  };

  const subtotal = cartItems.reduce((sum, item) => sum + item.price, 0);
  const serviceFee = 50.25;
  const discount = 50.25;
  const grandTotal = subtotal + serviceFee - discount;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Image
              source={require('../../../src/assets/images/product-chart/chevron-left.png')}
              style={styles.chevronIcon}
            />
          </TouchableOpacity>
          
          <Text style={styles.headerTitle}>Shopping Cart</Text>
          
          <TouchableOpacity style={styles.notificationButton}>
            <Image
              source={require('../../../src/assets/images/product-chart/notification-icon.png')}
              style={styles.notificationIcon}
            />
          </TouchableOpacity>
        </View>

        {/* Product Items */}
        <View style={styles.ordersContainer}>
          {cartItems.map((item, index) => (
            <View key={item.id} style={styles.orderItem}>
              <View style={styles.productImage} />
              
              <View style={styles.productInfo}>
                <Text style={styles.productName}>{item.name}</Text>
                <Text style={styles.productWeight}>{item.weight}</Text>
              </View>
              
              <Text style={styles.productPrice}>₱{item.price.toFixed(2)}</Text>
              
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => removeItem(item.id)}
              >
                <Image
                  source={require('../../../src/assets/images/product-chart/trash-icon.png')}
                  style={styles.trashIcon}
                />
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {/* Notes Section */}
        <View style={styles.notesSection}>
          <View style={styles.notesHeader}>
            <Text style={styles.notesTitle}>Notes</Text>
          </View>
          <View style={styles.notesInputContainer}>
            <TextInput
              style={styles.notesInput}
              placeholder="Type something you want here..."
              placeholderTextColor={Colors.textSecondary}
              value={notes}
              onChangeText={setNotes}
              multiline
            />
          </View>
        </View>

        {/* Discount Section */}
        <View style={styles.discountSection}>
          <Text style={styles.discountText}>Apply Discount</Text>
          <TouchableOpacity>
            <Image
              source={require('../../../src/assets/images/product-chart/chevron-right.png')}
              style={styles.chevronRightIcon}
            />
          </TouchableOpacity>
        </View>

        {/* Bill Section */}
        <View style={styles.billSection}>
          <View style={styles.billRow}>
            <Text style={styles.billLabel}>Sub Total</Text>
            <Text style={styles.billValue}>₱ {subtotal.toFixed(2)}</Text>
          </View>
          
          <View style={styles.billRow}>
            <Text style={styles.billLabel}>Service Fee</Text>
            <Text style={styles.billValue}>₱ {serviceFee.toFixed(2)}</Text>
          </View>
          
          <View style={styles.billRow}>
            <Text style={styles.billLabel}>Discount (20%)</Text>
            <Text style={styles.billValue}>₱ {discount.toFixed(2)}</Text>
          </View>
          
          <Text style={styles.discountNote}>
            Discount depend on what you are{'\n'}senior of pwd.
          </Text>
          
          <View style={styles.dottedLine} />
          
          <View style={styles.grandTotalRow}>
            <Text style={styles.grandTotalLabel}>Grand Total</Text>
            <Text style={styles.grandTotalValue}>₱ {grandTotal.toFixed(2)}</Text>
          </View>
        </View>

        {/* Spacer for bottom button */}
        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Proceed to Payment Button */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.proceedButton}
          onPress={() => {
            // Navigate to payment screen or handle payment logic
            console.log('Proceed to payment');
          }}
        >
          <Text style={styles.proceedButtonText}>Proceed to Payment</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundGray,
  },
  scrollView: {
    flex: 1,
  },
  // Header - Figma position: y: 74, height: 40
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: s(20),
    paddingTop: vs(20),
    paddingBottom: vs(20),
  },
  // Back button - Figma: x: 20, y: 79, width: 30, height: 30
  backButton: {
    width: s(30),
    height: vs(30),
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
    height: vs(15),
  },
  // Header title - Figma: x: 156, y: 83, width: 129, height: 22
  headerTitle: {
    fontFamily: Fonts.primary,
    fontSize: s(20),
    fontWeight: Fonts.weights.medium,
    color: Colors.darkGray,
    lineHeight: s(22),
  },
  // Notification - Figma: x: 375, y: 74, width: 40, height: 40
  notificationButton: {
    width: s(40),
    height: vs(40),
    borderRadius: s(20),
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10,
  },
  notificationIcon: {
    width: s(25),
    height: vs(25),
  },
  // Orders container - Figma: x: 20, y: 166, width: 400, height: 480
  ordersContainer: {
    paddingHorizontal: s(20),
    paddingBottom: vs(20),
  },
  // Order item - Figma: each item height: 80
  orderItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: s(20),
    padding: s(15),
    marginBottom: vs(20),
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 4,
  },
  // Product image - Figma: x: 35, y: 176, width: 60, height: 60
  productImage: {
    width: s(60),
    height: vs(60),
    borderRadius: s(14),
    backgroundColor: '#D9D9D9',
    marginRight: s(15),
  },
  // Product info - Figma: x: 105, y: 184, width: 124, height: 44
  productInfo: {
    flex: 1,
  },
  productName: {
    fontFamily: Fonts.primary,
    fontSize: s(14),
    fontWeight: Fonts.weights.medium,
    color: Colors.darkGray,
    lineHeight: s(22),
  },
  productWeight: {
    fontFamily: Fonts.primary,
    fontSize: s(14),
    fontWeight: Fonts.weights.medium,
    color: Colors.textSecondary,
    lineHeight: s(22),
  },
  // Product price - Figma: x: 306, y: 195, width: 57, height: 22
  productPrice: {
    fontFamily: Fonts.primary,
    fontSize: s(14),
    fontWeight: Fonts.weights.medium,
    color: '#02545F',
    lineHeight: s(22),
    marginRight: s(10),
  },
  // Delete button - Figma: x: 373, y: 191, width: 30, height: 30
  deleteButton: {
    width: s(30),
    height: vs(30),
    borderRadius: s(5),
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 5,
  },
  trashIcon: {
    width: s(20),
    height: vs(20),
  },
  // Notes section - Figma: x: 20, y: 666, width: 400, height: 150
  notesSection: {
    marginHorizontal: s(20),
    marginBottom: vs(20),
    backgroundColor: Colors.backgroundGray,
    borderRadius: s(20),
    overflow: 'hidden',
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 5,
  },
  notesHeader: {
    backgroundColor: Colors.white,
    paddingVertical: vs(9),
    paddingHorizontal: s(22),
    borderTopLeftRadius: s(20),
    borderTopRightRadius: s(20),
  },
  notesTitle: {
    fontFamily: Fonts.primary,
    fontSize: s(16),
    fontWeight: Fonts.weights.medium,
    color: '#FF8D2F',
    lineHeight: s(22),
  },
  notesInputContainer: {
    paddingHorizontal: s(10),
    paddingVertical: vs(16),
    backgroundColor: Colors.backgroundGray,
  },
  notesInput: {
    borderWidth: 1,
    borderColor: '#02545F',
    borderRadius: s(10),
    paddingHorizontal: s(12),
    paddingVertical: vs(12),
    fontFamily: Fonts.primary,
    fontSize: s(14),
    fontWeight: Fonts.weights.medium,
    color: Colors.darkGray,
    backgroundColor: Colors.backgroundGray,
    minHeight: vs(80),
    textAlignVertical: 'top',
  },
  // Discount section - Figma: x: 20, y: 836, width: 400, height: 80
  discountSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.white,
    borderRadius: s(20),
    paddingHorizontal: s(20),
    paddingVertical: vs(29),
    marginHorizontal: s(20),
    marginBottom: vs(20),
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 5,
  },
  discountText: {
    fontFamily: Fonts.primary,
    fontSize: s(14),
    fontWeight: Fonts.weights.medium,
    color: '#FF8D2F',
    lineHeight: s(22),
  },
  chevronRightIcon: {
    width: s(15),
    height: vs(15),
  },
  // Bill section - Figma: x: 20, y: 936, width: 400, height: 250
  billSection: {
    backgroundColor: Colors.white,
    borderRadius: s(20),
    paddingHorizontal: s(20),
    paddingVertical: vs(20),
    marginHorizontal: s(20),
    marginBottom: vs(20),
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 5,
  },
  billRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: vs(17),
  },
  billLabel: {
    fontFamily: Fonts.primary,
    fontSize: s(14),
    fontWeight: Fonts.weights.medium,
    color: Colors.darkGray,
    lineHeight: s(17),
  },
  billValue: {
    fontFamily: Fonts.primary,
    fontSize: s(14),
    fontWeight: Fonts.weights.medium,
    color: Colors.darkGray,
    lineHeight: s(17),
  },
  discountNote: {
    fontFamily: Fonts.primary,
    fontSize: s(12),
    fontWeight: Fonts.weights.medium,
    color: Colors.textSecondary,
    lineHeight: s(15),
    marginBottom: vs(20),
  },
  dottedLine: {
    height: vs(2),
    backgroundColor: Colors.textSecondary,
    marginBottom: vs(20),
  },
  grandTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  grandTotalLabel: {
    fontFamily: Fonts.primary,
    fontSize: s(14),
    fontWeight: Fonts.weights.medium,
    color: '#FF8D2F',
    lineHeight: s(17),
  },
  grandTotalValue: {
    fontFamily: Fonts.primary,
    fontSize: s(14),
    fontWeight: Fonts.weights.medium,
    color: '#FF8D2F',
    lineHeight: s(17),
  },
  bottomSpacer: {
    height: vs(100),
  },
  // Proceed button - Figma: x: 20, y: 1226, width: 400, height: 50
  buttonContainer: {
    paddingHorizontal: s(20),
    paddingBottom: vs(20),
    backgroundColor: Colors.backgroundGray,
  },
  proceedButton: {
    backgroundColor: Colors.primary,
    borderRadius: s(20),
    paddingVertical: vs(15),
    alignItems: 'center',
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
  proceedButtonText: {
    fontFamily: Fonts.primary,
    fontSize: s(20),
    fontWeight: Fonts.weights.medium,
    color: Colors.white,
    lineHeight: s(22),
  },
});

export default CartScreen;