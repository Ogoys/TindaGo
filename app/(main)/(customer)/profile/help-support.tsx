import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  StatusBar,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { s, vs, ms } from '../../../../src/constants/responsive';
import { Colors } from '../../../../src/constants/Colors';
import { Fonts } from '../../../../src/constants/Fonts';

/**
 * CUSTOMER SUPPORT CENTER SCREEN
 * Figma: https://www.figma.com/design/8I1Nr3vQZllDDknSevstvH/TindaGo-Share?node-id=1196-5807
 * 
 * Features:
 * - Header with back button and title
 * - Search bar for support topics
 * - FAQ categories with expandable items
 * - Contact support options (Email, Phone, Chat)
 * - Social media links
 */

interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

interface FAQCategory {
  id: string;
  title: string;
  icon: string;
  items: FAQItem[];
}

export default function HelpSupportScreen() {
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  // FAQ Categories
  const faqCategories: FAQCategory[] = [
    {
      id: 'orders',
      title: 'Orders & Delivery',
      icon: 'cube-outline',
      items: [
        {
          id: 'order-1',
          question: 'How do I track my order?',
          answer: 'You can track your order by going to Order History in your profile. Click on the order to see real-time tracking updates.',
        },
        {
          id: 'order-2',
          question: 'What are the delivery hours?',
          answer: 'Our delivery hours are from 8:00 AM to 8:00 PM daily. Orders placed after 7:00 PM will be delivered the next day.',
        },
        {
          id: 'order-3',
          question: 'Can I change my delivery address?',
          answer: 'Yes, you can change your delivery address before the order is confirmed by the store. Go to your order details and tap "Change Address".',
        },
      ],
    },
    {
      id: 'payment',
      title: 'Payment & Refunds',
      icon: 'wallet-outline',
      items: [
        {
          id: 'payment-1',
          question: 'What payment methods are accepted?',
          answer: 'We accept Cash on Delivery (COD), GCash, PayMaya, and Credit/Debit Cards.',
        },
        {
          id: 'payment-2',
          question: 'How do I request a refund?',
          answer: 'If you received damaged or incorrect items, go to Order History, select the order, and tap "Request Refund". Refunds are processed within 3-5 business days.',
        },
        {
          id: 'payment-3',
          question: 'Is my payment information secure?',
          answer: 'Yes, all payment transactions are encrypted and secured. We do not store your credit card information.',
        },
      ],
    },
    {
      id: 'account',
      title: 'Account & Settings',
      icon: 'person-outline',
      items: [
        {
          id: 'account-1',
          question: 'How do I update my profile information?',
          answer: 'Go to Profile > My Account to update your name, email, phone number, and other details.',
        },
        {
          id: 'account-2',
          question: 'How do I change my password?',
          answer: 'Go to Profile > My Account > Change Password. You will need to enter your current password and new password.',
        },
        {
          id: 'account-3',
          question: 'Can I delete my account?',
          answer: 'Yes, you can request account deletion by contacting our support team. Note that this action is permanent and cannot be undone.',
        },
      ],
    },
    {
      id: 'products',
      title: 'Products & Stores',
      icon: 'storefront-outline',
      items: [
        {
          id: 'product-1',
          question: 'How do I find stores near me?',
          answer: 'The app automatically shows stores near your current location. You can also search for specific stores using the search bar.',
        },
        {
          id: 'product-2',
          question: 'Are the prices the same as in-store?',
          answer: 'Yes, prices on TindaGo are the same as in the physical stores. Some stores may offer exclusive online discounts.',
        },
        {
          id: 'product-3',
          question: 'What if a product is out of stock?',
          answer: 'If a product is out of stock, you can enable notifications to be alerted when it becomes available again.',
        },
      ],
    },
  ];

  // Toggle FAQ item expansion
  const toggleItem = (itemId: string) => {
    setExpandedItems(prev =>
      prev.includes(itemId)
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  // Handle contact actions
  const handleEmail = () => {
    Linking.openURL('mailto:support@tindago.com');
  };

  const handlePhone = () => {
    Linking.openURL('tel:+639123456789');
  };

  const handleChat = () => {
    // TODO: Open chat support
    console.log('Open chat support');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={ms(24)} color="#1E1E1E" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Support Center</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      >
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <Ionicons name="help-circle" size={ms(80)} color="#3BB77E" />
          <Text style={styles.heroTitle}>How can we help you?</Text>
          <Text style={styles.heroSubtitle}>
            Find answers to common questions or contact our support team
          </Text>
        </View>

        {/* Quick Contact Cards */}
        <View style={styles.quickContactSection}>
          <Text style={styles.sectionTitle}>Quick Contact</Text>
          <View style={styles.contactCards}>
            <TouchableOpacity
              style={styles.contactCard}
              onPress={handleEmail}
              activeOpacity={0.7}
            >
              <View style={styles.contactIconContainer}>
                <Ionicons name="mail-outline" size={ms(28)} color="#3BB77E" />
              </View>
              <Text style={styles.contactCardTitle}>Email Us</Text>
              <Text style={styles.contactCardSubtitle}>support@tindago.com</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.contactCard}
              onPress={handlePhone}
              activeOpacity={0.7}
            >
              <View style={styles.contactIconContainer}>
                <Ionicons name="call-outline" size={ms(28)} color="#3BB77E" />
              </View>
              <Text style={styles.contactCardTitle}>Call Us</Text>
              <Text style={styles.contactCardSubtitle}>+63 912 345 6789</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.contactCard}
              onPress={handleChat}
              activeOpacity={0.7}
            >
              <View style={styles.contactIconContainer}>
                <Ionicons name="chatbubble-outline" size={ms(28)} color="#3BB77E" />
              </View>
              <Text style={styles.contactCardTitle}>Live Chat</Text>
              <Text style={styles.contactCardSubtitle}>Available 8AM-8PM</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* FAQ Section */}
        <View style={styles.faqSection}>
          <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>

          {faqCategories.map((category) => (
            <View key={category.id} style={styles.faqCategory}>
              <View style={styles.categoryHeader}>
                <Ionicons name={category.icon as any} size={ms(24)} color="#3BB77E" />
                <Text style={styles.categoryTitle}>{category.title}</Text>
              </View>

              {category.items.map((item) => (
                <View key={item.id} style={styles.faqItem}>
                  <TouchableOpacity
                    style={styles.faqQuestion}
                    onPress={() => toggleItem(item.id)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.faqQuestionText}>{item.question}</Text>
                    <Ionicons
                      name={expandedItems.includes(item.id) ? 'chevron-up' : 'chevron-down'}
                      size={ms(20)}
                      color="#7A7B7B"
                    />
                  </TouchableOpacity>

                  {expandedItems.includes(item.id) && (
                    <View style={styles.faqAnswer}>
                      <Text style={styles.faqAnswerText}>{item.answer}</Text>
                    </View>
                  )}
                </View>
              ))}
            </View>
          ))}
        </View>

        {/* Still Need Help Section */}
        <View style={styles.stillNeedHelpSection}>
          <Text style={styles.stillNeedHelpTitle}>Still need help?</Text>
          <Text style={styles.stillNeedHelpText}>
            Our support team is available 8AM to 8PM daily
          </Text>
          <TouchableOpacity
            style={styles.contactSupportButton}
            onPress={handleEmail}
            activeOpacity={0.8}
          >
            <Text style={styles.contactSupportButtonText}>Contact Support</Text>
          </TouchableOpacity>
        </View>

        {/* Bottom Padding */}
        <View style={styles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: s(16),
    paddingVertical: vs(12),
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },

  backButton: {
    width: s(40),
    height: s(40),
    justifyContent: 'center',
    alignItems: 'center',
  },

  headerTitle: {
    fontSize: ms(18),
    fontFamily: Fonts.SEMIBOLD,
    color: '#1E1E1E',
  },

  headerSpacer: {
    width: s(40),
  },

  // Content
  content: {
    flex: 1,
  },

  contentContainer: {
    paddingBottom: vs(40),
  },

  // Hero Section
  heroSection: {
    alignItems: 'center',
    paddingVertical: vs(40),
    paddingHorizontal: s(20),
  },

  heroTitle: {
    fontSize: ms(24),
    fontFamily: Fonts.BOLD,
    color: '#1E1E1E',
    marginTop: vs(16),
    textAlign: 'center',
  },

  heroSubtitle: {
    fontSize: ms(14),
    fontFamily: Fonts.REGULAR,
    color: '#7A7B7B',
    marginTop: vs(8),
    textAlign: 'center',
    lineHeight: ms(20),
  },

  // Quick Contact Section
  quickContactSection: {
    paddingHorizontal: s(20),
    marginBottom: vs(32),
  },

  sectionTitle: {
    fontSize: ms(18),
    fontFamily: Fonts.SEMIBOLD,
    color: '#1E1E1E',
    marginBottom: vs(16),
  },

  contactCards: {
    flexDirection: 'row',
    gap: s(12),
  },

  contactCard: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    borderRadius: ms(12),
    padding: s(16),
    alignItems: 'center',
  },

  contactIconContainer: {
    width: s(56),
    height: s(56),
    borderRadius: s(28),
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: vs(12),
  },

  contactCardTitle: {
    fontSize: ms(14),
    fontFamily: Fonts.SEMIBOLD,
    color: '#1E1E1E',
    marginBottom: vs(4),
  },

  contactCardSubtitle: {
    fontSize: ms(11),
    fontFamily: Fonts.REGULAR,
    color: '#7A7B7B',
    textAlign: 'center',
  },

  // FAQ Section
  faqSection: {
    paddingHorizontal: s(20),
  },

  faqCategory: {
    marginBottom: vs(24),
  },

  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: vs(16),
    gap: s(12),
  },

  categoryTitle: {
    fontSize: ms(16),
    fontFamily: Fonts.SEMIBOLD,
    color: '#1E1E1E',
  },

  faqItem: {
    marginBottom: vs(12),
    backgroundColor: '#F5F5F5',
    borderRadius: ms(12),
    overflow: 'hidden',
  },

  faqQuestion: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: s(16),
  },

  faqQuestionText: {
    flex: 1,
    fontSize: ms(14),
    fontFamily: Fonts.MEDIUM,
    color: '#1E1E1E',
    marginRight: s(12),
  },

  faqAnswer: {
    paddingHorizontal: s(16),
    paddingBottom: s(16),
  },

  faqAnswerText: {
    fontSize: ms(13),
    fontFamily: Fonts.REGULAR,
    color: '#7A7B7B',
    lineHeight: ms(20),
  },

  // Still Need Help Section
  stillNeedHelpSection: {
    marginHorizontal: s(20),
    marginTop: vs(32),
    padding: s(24),
    backgroundColor: '#E8F5E9',
    borderRadius: ms(16),
    alignItems: 'center',
  },

  stillNeedHelpTitle: {
    fontSize: ms(18),
    fontFamily: Fonts.SEMIBOLD,
    color: '#1E1E1E',
    marginBottom: vs(8),
  },

  stillNeedHelpText: {
    fontSize: ms(14),
    fontFamily: Fonts.REGULAR,
    color: '#7A7B7B',
    textAlign: 'center',
    marginBottom: vs(16),
  },

  contactSupportButton: {
    backgroundColor: '#3BB77E',
    paddingHorizontal: s(32),
    paddingVertical: vs(12),
    borderRadius: ms(24),
  },

  contactSupportButtonText: {
    fontSize: ms(14),
    fontFamily: Fonts.SEMIBOLD,
    color: '#FFFFFF',
  },

  bottomPadding: {
    height: vs(20),
  },
});
