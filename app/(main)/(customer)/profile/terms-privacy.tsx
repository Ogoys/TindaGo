import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { s, vs, ms } from '../../../../src/constants/responsive';
import { Colors } from '../../../../src/constants/Colors';
import { Fonts } from '../../../../src/constants/Fonts';

/**
 * CUSTOMER TERMS & PRIVACY POLICY SCREEN
 * Figma: https://www.figma.com/design/8I1Nr3vQZllDDknSevstvH/TindaGo-Share?node-id=1196-5942
 * 
 * Features:
 * - Header with back button and title
 * - Tab navigation between Terms and Privacy Policy
 * - Scrollable content with sections
 * - Clean, readable layout
 */

type TabType = 'terms' | 'privacy';

export default function TermsPrivacyScreen() {
  const [activeTab, setActiveTab] = useState<TabType>('terms');

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
        <Text style={styles.headerTitle}>Terms & Privacy</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'terms' && styles.tabActive]}
          onPress={() => setActiveTab('terms')}
          activeOpacity={0.7}
        >
          <Text style={[styles.tabText, activeTab === 'terms' && styles.tabTextActive]}>
            Terms of Service
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'privacy' && styles.tabActive]}
          onPress={() => setActiveTab('privacy')}
          activeOpacity={0.7}
        >
          <Text style={[styles.tabText, activeTab === 'privacy' && styles.tabTextActive]}>
            Privacy Policy
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      >
        {activeTab === 'terms' ? <TermsContent /> : <PrivacyContent />}
      </ScrollView>
    </SafeAreaView>
  );
}

// Terms of Service Content
function TermsContent() {
  return (
    <View style={styles.textContent}>
      <Text style={styles.lastUpdated}>Last Updated: November 8, 2024</Text>

      <Text style={styles.sectionTitle}>1. Acceptance of Terms</Text>
      <Text style={styles.paragraph}>
        By accessing and using TindaGo ("the App"), you accept and agree to be bound by the terms
        and provisions of this agreement. If you do not agree to these Terms of Service, please do
        not use the App.
      </Text>

      <Text style={styles.sectionTitle}>2. Use of Service</Text>
      <Text style={styles.paragraph}>
        TindaGo provides a platform for customers to purchase products from local stores and for
        store owners to manage their inventory and sales. You agree to use the service only for
        lawful purposes and in accordance with these terms.
      </Text>

      <Text style={styles.subsectionTitle}>2.1 User Account</Text>
      <Text style={styles.paragraph}>
        You are responsible for maintaining the confidentiality of your account and password. You
        agree to accept responsibility for all activities that occur under your account.
      </Text>

      <Text style={styles.subsectionTitle}>2.2 Prohibited Activities</Text>
      <Text style={styles.paragraph}>
        You may not use the App to engage in any illegal activities, infringe on intellectual
        property rights, transmit harmful code, or interfere with the proper functioning of the
        service.
      </Text>

      <Text style={styles.sectionTitle}>3. Orders and Payments</Text>
      <Text style={styles.paragraph}>
        All orders placed through the App are subject to acceptance by the respective store owners.
        Prices are set by individual stores and may change without notice. Payment must be made
        through the available payment methods provided in the App.
      </Text>

      <Text style={styles.subsectionTitle}>3.1 Order Cancellation</Text>
      <Text style={styles.paragraph}>
        You may cancel an order before it is confirmed by the store. Once confirmed, cancellations
        are subject to the store's cancellation policy.
      </Text>

      <Text style={styles.subsectionTitle}>3.2 Refunds</Text>
      <Text style={styles.paragraph}>
        Refunds are processed according to the store's refund policy. In case of damaged or
        incorrect items, you may request a refund within 24 hours of delivery.
      </Text>

      <Text style={styles.sectionTitle}>4. Delivery</Text>
      <Text style={styles.paragraph}>
        Delivery times are estimates and may vary depending on store location, order volume, and
        other factors. TindaGo is not responsible for delays caused by circumstances beyond our
        control.
      </Text>

      <Text style={styles.sectionTitle}>5. Store Owner Responsibilities</Text>
      <Text style={styles.paragraph}>
        Store owners are responsible for maintaining accurate product information, managing
        inventory, fulfilling orders in a timely manner, and complying with all applicable laws
        and regulations.
      </Text>

      <Text style={styles.sectionTitle}>6. Intellectual Property</Text>
      <Text style={styles.paragraph}>
        The App and its original content, features, and functionality are owned by TindaGo and are
        protected by international copyright, trademark, and other intellectual property laws.
      </Text>

      <Text style={styles.sectionTitle}>7. Limitation of Liability</Text>
      <Text style={styles.paragraph}>
        TindaGo shall not be liable for any indirect, incidental, special, consequential, or
        punitive damages resulting from your use of or inability to use the service.
      </Text>

      <Text style={styles.sectionTitle}>8. Changes to Terms</Text>
      <Text style={styles.paragraph}>
        We reserve the right to modify these terms at any time. We will notify users of any
        material changes via the App or email. Your continued use of the service after such
        modifications constitutes your acceptance of the updated terms.
      </Text>

      <Text style={styles.sectionTitle}>9. Contact Information</Text>
      <Text style={styles.paragraph}>
        If you have any questions about these Terms of Service, please contact us at:
      </Text>
      <Text style={styles.contactText}>Email: support@tindago.com</Text>
      <Text style={styles.contactText}>Phone: +63 912 345 6789</Text>

      <View style={styles.bottomPadding} />
    </View>
  );
}

// Privacy Policy Content
function PrivacyContent() {
  return (
    <View style={styles.textContent}>
      <Text style={styles.lastUpdated}>Last Updated: November 8, 2024</Text>

      <Text style={styles.sectionTitle}>1. Information We Collect</Text>
      <Text style={styles.paragraph}>
        We collect information that you provide directly to us, including your name, email address,
        phone number, delivery address, and payment information. We also collect information about
        your use of the App, including your orders, searches, and interactions with stores.
      </Text>

      <Text style={styles.subsectionTitle}>1.1 Personal Information</Text>
      <Text style={styles.paragraph}>
        When you create an account, we collect your name, email address, phone number, and password.
        For deliveries, we collect your delivery address and location data.
      </Text>

      <Text style={styles.subsectionTitle}>1.2 Payment Information</Text>
      <Text style={styles.paragraph}>
        Payment information is processed securely through third-party payment processors. We do not
        store your complete credit card information on our servers.
      </Text>

      <Text style={styles.subsectionTitle}>1.3 Usage Data</Text>
      <Text style={styles.paragraph}>
        We automatically collect information about how you interact with the App, including pages
        viewed, features used, and time spent on the App.
      </Text>

      <Text style={styles.sectionTitle}>2. How We Use Your Information</Text>
      <Text style={styles.paragraph}>
        We use the information we collect to provide, maintain, and improve our services, process
        your orders, communicate with you, personalize your experience, and ensure the security
        of the App.
      </Text>

      <Text style={styles.subsectionTitle}>2.1 Service Provision</Text>
      <Text style={styles.paragraph}>
        We use your information to process and fulfill your orders, manage your account, provide
        customer support, and send you updates about your orders.
      </Text>

      <Text style={styles.subsectionTitle}>2.2 Communication</Text>
      <Text style={styles.paragraph}>
        We may send you service-related notifications, promotional offers, and updates about new
        features. You can opt out of promotional communications at any time.
      </Text>

      <Text style={styles.sectionTitle}>3. Information Sharing</Text>
      <Text style={styles.paragraph}>
        We do not sell your personal information. We share your information only with:
      </Text>
      <Text style={styles.bulletPoint}>• Store owners to fulfill your orders</Text>
      <Text style={styles.bulletPoint}>• Delivery partners to deliver your orders</Text>
      <Text style={styles.bulletPoint}>• Payment processors to process transactions</Text>
      <Text style={styles.bulletPoint}>• Service providers who assist in operating the App</Text>
      <Text style={styles.bulletPoint}>• Law enforcement when required by law</Text>

      <Text style={styles.sectionTitle}>4. Data Security</Text>
      <Text style={styles.paragraph}>
        We implement appropriate technical and organizational measures to protect your personal
        information against unauthorized access, alteration, disclosure, or destruction. However,
        no method of transmission over the internet is 100% secure.
      </Text>

      <Text style={styles.sectionTitle}>5. Your Rights</Text>
      <Text style={styles.paragraph}>
        You have the right to access, update, or delete your personal information. You can manage
        your account settings in the App or contact us for assistance.
      </Text>

      <Text style={styles.subsectionTitle}>5.1 Access and Update</Text>
      <Text style={styles.paragraph}>
        You can access and update your personal information at any time through your account
        settings.
      </Text>

      <Text style={styles.subsectionTitle}>5.2 Data Deletion</Text>
      <Text style={styles.paragraph}>
        You can request deletion of your account and personal data by contacting our support team.
        Note that some information may be retained for legal or administrative purposes.
      </Text>

      <Text style={styles.sectionTitle}>6. Children's Privacy</Text>
      <Text style={styles.paragraph}>
        TindaGo is not intended for users under the age of 18. We do not knowingly collect personal
        information from children. If you believe we have collected information from a child, please
        contact us immediately.
      </Text>

      <Text style={styles.sectionTitle}>7. Cookies and Tracking</Text>
      <Text style={styles.paragraph}>
        We use cookies and similar tracking technologies to track activity on our App and store
        certain information. You can instruct your browser to refuse all cookies or to indicate
        when a cookie is being sent.
      </Text>

      <Text style={styles.sectionTitle}>8. Changes to Privacy Policy</Text>
      <Text style={styles.paragraph}>
        We may update our Privacy Policy from time to time. We will notify you of any changes by
        posting the new Privacy Policy on this page and updating the "Last Updated" date.
      </Text>

      <Text style={styles.sectionTitle}>9. Contact Us</Text>
      <Text style={styles.paragraph}>
        If you have any questions about this Privacy Policy, please contact us:
      </Text>
      <Text style={styles.contactText}>Email: privacy@tindago.com</Text>
      <Text style={styles.contactText}>Phone: +63 912 345 6789</Text>
      <Text style={styles.contactText}>Address: Davao City, Philippines</Text>

      <View style={styles.bottomPadding} />
    </View>
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

  // Tab Navigation
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#F5F5F5',
    marginHorizontal: s(20),
    marginTop: vs(16),
    borderRadius: ms(12),
    padding: s(4),
  },

  tab: {
    flex: 1,
    paddingVertical: vs(12),
    paddingHorizontal: s(16),
    borderRadius: ms(10),
    alignItems: 'center',
  },

  tabActive: {
    backgroundColor: '#3BB77E',
  },

  tabText: {
    fontSize: ms(14),
    fontFamily: Fonts.MEDIUM,
    color: '#7A7B7B',
  },

  tabTextActive: {
    color: '#FFFFFF',
    fontFamily: Fonts.SEMIBOLD,
  },

  // Content
  content: {
    flex: 1,
  },

  contentContainer: {
    paddingBottom: vs(40),
  },

  textContent: {
    paddingHorizontal: s(20),
    paddingTop: vs(24),
  },

  lastUpdated: {
    fontSize: ms(12),
    fontFamily: Fonts.REGULAR,
    color: '#7A7B7B',
    marginBottom: vs(24),
  },

  sectionTitle: {
    fontSize: ms(18),
    fontFamily: Fonts.BOLD,
    color: '#1E1E1E',
    marginTop: vs(20),
    marginBottom: vs(12),
  },

  subsectionTitle: {
    fontSize: ms(16),
    fontFamily: Fonts.SEMIBOLD,
    color: '#1E1E1E',
    marginTop: vs(16),
    marginBottom: vs(8),
  },

  paragraph: {
    fontSize: ms(14),
    fontFamily: Fonts.REGULAR,
    color: '#4A4A4A',
    lineHeight: ms(22),
    marginBottom: vs(12),
    textAlign: 'justify',
  },

  bulletPoint: {
    fontSize: ms(14),
    fontFamily: Fonts.REGULAR,
    color: '#4A4A4A',
    lineHeight: ms(22),
    marginBottom: vs(8),
    marginLeft: s(8),
  },

  contactText: {
    fontSize: ms(14),
    fontFamily: Fonts.MEDIUM,
    color: '#3BB77E',
    lineHeight: ms(22),
    marginBottom: vs(4),
  },

  bottomPadding: {
    height: vs(40),
  },
});
