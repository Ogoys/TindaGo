import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Colors } from '../../../../src/constants/Colors';
import { Fonts } from '../../../../src/constants/Fonts';
import { ms, s, vs } from '../../../../src/constants/responsive';

type SectionType = 'faqs' | 'terms' | 'privacy' | 'guide' | null;

const HelpCenterScreen = () => {
  const [expandedSection, setExpandedSection] = useState<SectionType>(null);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const handleSectionPress = (section: SectionType) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const handleFaqPress = (index: number) => {
    setExpandedFaq(expandedFaq === index ? null : index);
  };

  const faqs = [
    {
      question: 'How do I place an order?',
      answer: 'Browse stores or products on the Home screen, add items to your cart, then tap the cart icon. Review your order, select payment method and delivery option, then confirm your order.'
    },
    {
      question: 'What payment methods are available?',
      answer: 'TindaGo supports multiple payment methods: Cash on Delivery (COD), GCash, and PayMaya. Select your preferred method during checkout.'
    },
    {
      question: 'How do I track my order?',
      answer: 'Go to your Profile, tap "Order History", and select any order to view its current status and tracking details. You\'ll see updates as the store prepares and delivers your order.'
    },
    {
      question: 'Can I cancel or modify my order?',
      answer: 'You can cancel orders that are still "Pending" or "Confirmed". Once the order status changes to "Preparing", please contact the store directly to request modifications.'
    },
    {
      question: 'How do I return or exchange items?',
      answer: 'Contact the store within their return policy timeframe. Go to Order History, select the order, and use the contact information provided. Return policies vary by store.'
    },
    {
      question: 'What delivery options are available?',
      answer: 'Stores offer different delivery options including home delivery and store pickup. Delivery fees and estimated times are shown during checkout.'
    },
    {
      question: 'How do I save my favorite stores?',
      answer: 'Tap the heart icon on any store card to add it to your favorites. Access your saved stores quickly from the Home screen.'
    },
    {
      question: 'What if I have issues with my order?',
      answer: 'Contact the store directly through the order details page. If you need additional assistance, reach out to TindaGo support through this Help Center.'
    },
    {
      question: 'How do I update my account information?',
      answer: 'Go to Profile → My Account to update your name, email, phone number, and delivery addresses.'
    },
    {
      question: 'Are there any delivery fees?',
      answer: 'Delivery fees vary by store and distance. The exact fee will be displayed during checkout before you confirm your order.'
    }
  ];

  const handleBack = () => {
    router.back();
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.backgroundGray} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleBack}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={s(24)} color={Colors.darkGray} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Help Center</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Introduction */}
        <View style={styles.introSection}>
          <Text style={styles.introTitle}>How can we help you?</Text>
          <Text style={styles.introText}>
            Find answers to common questions, learn about our policies, and get guidance on using TindaGo.
          </Text>
        </View>

        {/* FAQs Section */}
        <TouchableOpacity 
          style={styles.sectionCard}
          onPress={() => handleSectionPress('faqs')}
          activeOpacity={0.7}
        >
          <View style={styles.sectionHeader}>
            <View style={styles.sectionIconContainer}>
              <Ionicons name="help-circle" size={s(24)} color={Colors.primary} />
            </View>
            <View style={styles.sectionTitleContainer}>
              <Text style={styles.sectionTitle}>FAQs</Text>
              <Text style={styles.sectionSubtitle}>Common questions about orders and payments</Text>
            </View>
            <Ionicons 
              name={expandedSection === 'faqs' ? 'chevron-up' : 'chevron-down'} 
              size={s(20)} 
              color={Colors.textSecondary} 
            />
          </View>
        </TouchableOpacity>

        {expandedSection === 'faqs' && (
          <View style={styles.contentSection}>
            {faqs.map((faq, index) => (
              <View key={index} style={styles.faqCard}>
                <TouchableOpacity
                  onPress={() => handleFaqPress(index)}
                  activeOpacity={0.7}
                >
                  <View style={styles.faqQuestion}>
                    <Text style={styles.faqQuestionText}>{faq.question}</Text>
                    <Ionicons 
                      name={expandedFaq === index ? 'chevron-up' : 'chevron-down'} 
                      size={s(18)} 
                      color={Colors.primary} 
                    />
                  </View>
                </TouchableOpacity>
                {expandedFaq === index && (
                  <Text style={styles.faqAnswer}>{faq.answer}</Text>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Terms & Conditions Section */}
        <TouchableOpacity 
          style={styles.sectionCard}
          onPress={() => handleSectionPress('terms')}
          activeOpacity={0.7}
        >
          <View style={styles.sectionHeader}>
            <View style={styles.sectionIconContainer}>
              <Ionicons name="document-text" size={s(24)} color={Colors.primary} />
            </View>
            <View style={styles.sectionTitleContainer}>
              <Text style={styles.sectionTitle}>Terms & Conditions</Text>
              <Text style={styles.sectionSubtitle}>Legal agreements and usage terms</Text>
            </View>
            <Ionicons 
              name={expandedSection === 'terms' ? 'chevron-up' : 'chevron-down'} 
              size={s(20)} 
              color={Colors.textSecondary} 
            />
          </View>
        </TouchableOpacity>

        {expandedSection === 'terms' && (
          <View style={styles.contentSection}>
            <Text style={styles.contentTitle}>Terms of Service</Text>
            <Text style={styles.contentText}>
              By using TindaGo, you agree to the following terms and conditions:
            </Text>
            
            <Text style={styles.contentSubtitle}>1. Account Registration</Text>
            <Text style={styles.contentText}>
              • You must provide accurate and complete information during registration{'\n'}
              • You are responsible for maintaining the security of your account{'\n'}
              • You must be at least 18 years old or have parental consent to use this service
            </Text>

            <Text style={styles.contentSubtitle}>2. Order Placement</Text>
            <Text style={styles.contentText}>
              • All orders are subject to product availability{'\n'}
              • Prices and product details are provided by individual stores{'\n'}
              • You agree to pay the stated price plus applicable fees
            </Text>

            <Text style={styles.contentSubtitle}>3. Payment</Text>
            <Text style={styles.contentText}>
              • Payment must be completed according to the selected method{'\n'}
              • For COD orders, payment is due upon delivery{'\n'}
              • Digital payment transactions are processed securely through third-party providers
            </Text>

            <Text style={styles.contentSubtitle}>4. Delivery & Pickup</Text>
            <Text style={styles.contentText}>
              • Delivery times are estimates and may vary{'\n'}
              • You must provide accurate delivery information{'\n'}
              • Failed deliveries due to incorrect information may incur additional fees
            </Text>

            <Text style={styles.contentSubtitle}>5. Returns & Refunds</Text>
            <Text style={styles.contentText}>
              • Return policies are set by individual stores{'\n'}
              • Refund processing times vary by payment method{'\n'}
              • Contact stores directly for return requests
            </Text>

            <Text style={styles.contentSubtitle}>6. Prohibited Activities</Text>
            <Text style={styles.contentText}>
              • Fraudulent orders or payment information{'\n'}
              • Abuse of return or refund policies{'\n'}
              • Harassment of store owners or delivery personnel
            </Text>

            <Text style={styles.contentSubtitle}>7. Liability</Text>
            <Text style={styles.contentText}>
              • TindaGo connects customers with local stores but is not responsible for product quality{'\n'}
              • Disputes should be resolved directly with stores{'\n'}
              • Platform availability is provided "as is" without guarantees
            </Text>
          </View>
        )}

        {/* Privacy Policy Section */}
        <TouchableOpacity 
          style={styles.sectionCard}
          onPress={() => handleSectionPress('privacy')}
          activeOpacity={0.7}
        >
          <View style={styles.sectionHeader}>
            <View style={styles.sectionIconContainer}>
              <Ionicons name="shield-checkmark" size={s(24)} color={Colors.primary} />
            </View>
            <View style={styles.sectionTitleContainer}>
              <Text style={styles.sectionTitle}>Privacy Policy</Text>
              <Text style={styles.sectionSubtitle}>How we handle your data</Text>
            </View>
            <Ionicons 
              name={expandedSection === 'privacy' ? 'chevron-up' : 'chevron-down'} 
              size={s(20)} 
              color={Colors.textSecondary} 
            />
          </View>
        </TouchableOpacity>

        {expandedSection === 'privacy' && (
          <View style={styles.contentSection}>
            <Text style={styles.contentTitle}>Privacy & Data Protection</Text>
            <Text style={styles.contentText}>
              TindaGo is committed to protecting your privacy and personal information.
            </Text>
            
            <Text style={styles.contentSubtitle}>1. Information We Collect</Text>
            <Text style={styles.contentText}>
              • Account information (name, email, phone number){'\n'}
              • Delivery addresses and location data{'\n'}
              • Order history and transaction data{'\n'}
              • Device information and usage analytics{'\n'}
              • Payment information (processed securely by third parties)
            </Text>

            <Text style={styles.contentSubtitle}>2. How We Use Your Data</Text>
            <Text style={styles.contentText}>
              • To process and deliver your orders{'\n'}
              • To provide customer support{'\n'}
              • To send order updates and notifications{'\n'}
              • To improve our services and user experience{'\n'}
              • To prevent fraud and ensure security
            </Text>

            <Text style={styles.contentSubtitle}>3. Data Sharing</Text>
            <Text style={styles.contentText}>
              • We share your order details with stores to fulfill purchases{'\n'}
              • Delivery information may be shared with logistics partners{'\n'}
              • Payment data is processed by secure third-party providers{'\n'}
              • We do not sell your personal information{'\n'}
              • Legal requirements may necessitate disclosure
            </Text>

            <Text style={styles.contentSubtitle}>4. Data Security</Text>
            <Text style={styles.contentText}>
              • All data is encrypted in transit and at rest{'\n'}
              • Regular security audits and updates{'\n'}
              • Access controls and authentication measures{'\n'}
              • Secure cloud infrastructure (Firebase)
            </Text>

            <Text style={styles.contentSubtitle}>5. Your Rights</Text>
            <Text style={styles.contentText}>
              • Access and download your data{'\n'}
              • Request data correction or deletion{'\n'}
              • Opt out of marketing communications{'\n'}
              • Close your account at any time{'\n'}
              • Control location and notification permissions
            </Text>

            <Text style={styles.contentSubtitle}>6. Cookies & Tracking</Text>
            <Text style={styles.contentText}>
              • We use analytics to understand app usage{'\n'}
              • Device identifiers help provide personalized experiences{'\n'}
              • You can manage tracking preferences in your device settings
            </Text>
          </View>
        )}

        {/* User Guide Section */}
        <TouchableOpacity 
          style={styles.sectionCard}
          onPress={() => handleSectionPress('guide')}
          activeOpacity={0.7}
        >
          <View style={styles.sectionHeader}>
            <View style={styles.sectionIconContainer}>
              <Ionicons name="book" size={s(24)} color={Colors.primary} />
            </View>
            <View style={styles.sectionTitleContainer}>
              <Text style={styles.sectionTitle}>User Guide / Tutorial</Text>
              <Text style={styles.sectionSubtitle}>Step-by-step instructions</Text>
            </View>
            <Ionicons 
              name={expandedSection === 'guide' ? 'chevron-up' : 'chevron-down'} 
              size={s(20)} 
              color={Colors.textSecondary} 
            />
          </View>
        </TouchableOpacity>

        {expandedSection === 'guide' && (
          <View style={styles.contentSection}>
            <Text style={styles.contentTitle}>Getting Started with TindaGo</Text>
            
            <View style={styles.guideStep}>
              <View style={styles.guideStepNumber}>
                <Text style={styles.guideStepNumberText}>1</Text>
              </View>
              <View style={styles.guideStepContent}>
                <Text style={styles.guideStepTitle}>Browsing Products</Text>
                <Text style={styles.guideStepText}>
                  • Open the Home screen to see nearby stores{'\n'}
                  • Browse by store or search for specific products{'\n'}
                  • Filter results by category or price{'\n'}
                  • Tap the heart icon to save favorite stores
                </Text>
              </View>
            </View>

            <View style={styles.guideStep}>
              <View style={styles.guideStepNumber}>
                <Text style={styles.guideStepNumberText}>2</Text>
              </View>
              <View style={styles.guideStepContent}>
                <Text style={styles.guideStepTitle}>Placing an Order</Text>
                <Text style={styles.guideStepText}>
                  • Tap on a product to view details{'\n'}
                  • Select quantity and add to cart{'\n'}
                  • Review items in your cart{'\n'}
                  • Choose payment method and delivery option{'\n'}
                  • Confirm order and wait for store acceptance
                </Text>
              </View>
            </View>

            <View style={styles.guideStep}>
              <View style={styles.guideStepNumber}>
                <Text style={styles.guideStepNumberText}>3</Text>
              </View>
              <View style={styles.guideStepContent}>
                <Text style={styles.guideStepTitle}>Payment Options</Text>
                <Text style={styles.guideStepText}>
                  • Cash on Delivery (COD) - Pay when you receive{'\n'}
                  • GCash - Digital payment via GCash app{'\n'}
                  • PayMaya - Digital payment via PayMaya app{'\n'}
                  • Payment is processed securely
                </Text>
              </View>
            </View>

            <View style={styles.guideStep}>
              <View style={styles.guideStepNumber}>
                <Text style={styles.guideStepNumberText}>4</Text>
              </View>
              <View style={styles.guideStepContent}>
                <Text style={styles.guideStepTitle}>Tracking Your Order</Text>
                <Text style={styles.guideStepText}>
                  • Go to Profile → Order History{'\n'}
                  • Select any order to view details{'\n'}
                  • Check current status (Pending, Preparing, Ready, etc.){'\n'}
                  • Receive notifications for status updates
                </Text>
              </View>
            </View>

            <View style={styles.guideStep}>
              <View style={styles.guideStepNumber}>
                <Text style={styles.guideStepNumberText}>5</Text>
              </View>
              <View style={styles.guideStepContent}>
                <Text style={styles.guideStepTitle}>Managing Your Account</Text>
                <Text style={styles.guideStepText}>
                  • Profile → My Account to update information{'\n'}
                  • Add or edit delivery addresses{'\n'}
                  • Update phone number and email{'\n'}
                  • Manage notification preferences
                </Text>
              </View>
            </View>

            <View style={styles.guideStep}>
              <View style={styles.guideStepNumber}>
                <Text style={styles.guideStepNumberText}>6</Text>
              </View>
              <View style={styles.guideStepContent}>
                <Text style={styles.guideStepTitle}>Handling Issues</Text>
                <Text style={styles.guideStepText}>
                  • Contact store directly through order details{'\n'}
                  • Request refunds or returns per store policy{'\n'}
                  • Report issues to TindaGo support if needed{'\n'}
                  • Check FAQs for common solutions
                </Text>
              </View>
            </View>

            <Text style={styles.guideTip}>
              💡 Tip: Enable notifications to get real-time updates on your orders and special offers from your favorite stores!
            </Text>
          </View>
        )}

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundGray,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: s(20),
    paddingTop: vs(60),
    paddingBottom: vs(20),
    backgroundColor: Colors.backgroundGray,
  },
  backButton: {
    width: s(40),
    height: s(40),
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontFamily: Fonts.primary,
    fontWeight: '600',
    fontSize: ms(20),
    color: Colors.darkGray,
  },
  headerSpacer: {
    width: s(40),
  },
  scrollContent: {
    paddingHorizontal: s(20),
    paddingBottom: vs(40),
  },
  introSection: {
    backgroundColor: Colors.white,
    borderRadius: s(16),
    padding: s(20),
    marginBottom: vs(20),
  },
  introTitle: {
    fontFamily: Fonts.primary,
    fontWeight: '700',
    fontSize: ms(22),
    color: Colors.darkGray,
    marginBottom: vs(10),
  },
  introText: {
    fontFamily: Fonts.primary,
    fontSize: ms(14),
    color: Colors.textSecondary,
    lineHeight: vs(20),
  },
  sectionCard: {
    backgroundColor: Colors.white,
    borderRadius: s(16),
    padding: s(16),
    marginBottom: vs(12),
    shadowColor: 'rgba(0, 0, 0, 0.1)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionIconContainer: {
    width: s(40),
    height: s(40),
    borderRadius: s(20),
    backgroundColor: `${Colors.primary}15`,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: s(12),
  },
  sectionTitleContainer: {
    flex: 1,
  },
  sectionTitle: {
    fontFamily: Fonts.primary,
    fontWeight: '600',
    fontSize: ms(16),
    color: Colors.darkGray,
    marginBottom: vs(2),
  },
  sectionSubtitle: {
    fontFamily: Fonts.primary,
    fontSize: ms(12),
    color: Colors.textSecondary,
  },
  contentSection: {
    backgroundColor: Colors.white,
    borderRadius: s(16),
    padding: s(20),
    marginBottom: vs(20),
  },
  contentTitle: {
    fontFamily: Fonts.primary,
    fontWeight: '700',
    fontSize: ms(18),
    color: Colors.darkGray,
    marginBottom: vs(12),
  },
  contentSubtitle: {
    fontFamily: Fonts.primary,
    fontWeight: '600',
    fontSize: ms(15),
    color: Colors.darkGray,
    marginTop: vs(16),
    marginBottom: vs(8),
  },
  contentText: {
    fontFamily: Fonts.primary,
    fontSize: ms(14),
    color: Colors.textSecondary,
    lineHeight: vs(22),
    marginBottom: vs(8),
  },
  faqCard: {
    backgroundColor: Colors.backgroundGray,
    borderRadius: s(12),
    padding: s(16),
    marginBottom: vs(10),
  },
  faqQuestion: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  faqQuestionText: {
    flex: 1,
    fontFamily: Fonts.primary,
    fontWeight: '600',
    fontSize: ms(14),
    color: Colors.darkGray,
    marginRight: s(10),
  },
  faqAnswer: {
    fontFamily: Fonts.primary,
    fontSize: ms(13),
    color: Colors.textSecondary,
    lineHeight: vs(20),
    marginTop: vs(12),
  },
  guideStep: {
    flexDirection: 'row',
    marginBottom: vs(20),
  },
  guideStepNumber: {
    width: s(32),
    height: s(32),
    borderRadius: s(16),
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: s(12),
  },
  guideStepNumberText: {
    fontFamily: Fonts.primary,
    fontWeight: '700',
    fontSize: ms(16),
    color: Colors.white,
  },
  guideStepContent: {
    flex: 1,
  },
  guideStepTitle: {
    fontFamily: Fonts.primary,
    fontWeight: '600',
    fontSize: ms(15),
    color: Colors.darkGray,
    marginBottom: vs(6),
  },
  guideStepText: {
    fontFamily: Fonts.primary,
    fontSize: ms(13),
    color: Colors.textSecondary,
    lineHeight: vs(20),
  },
  guideTip: {
    fontFamily: Fonts.primary,
    fontSize: ms(14),
    color: Colors.primary,
    backgroundColor: `${Colors.primary}10`,
    padding: s(12),
    borderRadius: s(10),
    marginTop: vs(10),
    lineHeight: vs(20),
  },
  bottomSpacer: {
    height: vs(20),
  },
});

export default HelpCenterScreen;
