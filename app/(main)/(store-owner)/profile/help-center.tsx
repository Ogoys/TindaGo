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
import { ProfileScreenHeader } from '../../../../src/components/store-owner/ProfileScreenHeader';

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
      question: 'How do I add new products to my inventory?',
      answer: 'Go to the Inventory tab, tap "Manage Products", then tap the "+" button at the top right. Fill in the product details including name, price, quantity, and category.'
    },
    {
      question: 'How do I record a walk-in sale?',
      answer: 'Navigate to the Inventory tab and tap "Walk-in Sale" in Quick Actions. Select products, enter quantities, and complete the transaction.'
    },
    {
      question: 'What happens when a product expires?',
      answer: 'Expired products will appear in the "Expired Items" section with alerts in your Inventory Dashboard. You can record them as damages or spoilages to update your inventory.'
    },
    {
      question: 'How do I track low stock items?',
      answer: 'The Inventory Dashboard automatically tracks low stock items (quantity < 10). You\'ll see alerts and can tap to view all low stock products.'
    },
    {
      question: 'Where can I view my sales history?',
      answer: 'Go to Profile/Settings and tap "Sales History" to view all completed transactions from both walk-in sales and app orders.'
    },
    {
      question: 'How do I handle customer returns?',
      answer: 'Go to Profile/Settings, tap "Record Customer Return", select the order, and choose the items being returned. The system will update inventory and process the refund.'
    },
    {
      question: 'What payment methods are supported?',
      answer: 'TindaGo supports Cash (for walk-in sales), COD (Cash on Delivery), GCash, and PayMaya for online orders.'
    },
    {
      question: 'How is commission calculated?',
      answer: 'For app orders, a platform commission is deducted from the total sale. You can view the breakdown in Sales History for each transaction.'
    }
  ];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.backgroundGray} />
      
      <ProfileScreenHeader title="Help Center" />

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
              <Text style={styles.sectionSubtitle}>Common questions about using the app</Text>
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
              • You must be at least 18 years old to use this service
            </Text>

            <Text style={styles.contentSubtitle}>2. Store Operations</Text>
            <Text style={styles.contentText}>
              • Store owners must comply with local business regulations{'\n'}
              • Product listings must be accurate and truthful{'\n'}
              • All transactions must be completed in good faith
            </Text>

            <Text style={styles.contentSubtitle}>3. Platform Fees</Text>
            <Text style={styles.contentText}>
              • TindaGo charges a commission on app orders{'\n'}
              • Commission rates are transparently displayed in transaction details{'\n'}
              • Walk-in sales do not incur platform fees
            </Text>

            <Text style={styles.contentSubtitle}>4. Prohibited Activities</Text>
            <Text style={styles.contentText}>
              • Selling illegal or prohibited items{'\n'}
              • Fraudulent transactions or deceptive practices{'\n'}
              • Unauthorized access to other accounts
            </Text>

            <Text style={styles.contentSubtitle}>5. Liability</Text>
            <Text style={styles.contentText}>
              • TindaGo is not responsible for disputes between stores and customers{'\n'}
              • Store owners are responsible for product quality and safety{'\n'}
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
              • Business information (store name, location, license){'\n'}
              • Transaction data (orders, inventory, sales){'\n'}
              • Device information and usage analytics
            </Text>

            <Text style={styles.contentSubtitle}>2. How We Use Your Data</Text>
            <Text style={styles.contentText}>
              • To provide and improve our services{'\n'}
              • To process transactions and payments{'\n'}
              • To send important notifications and updates{'\n'}
              • To prevent fraud and ensure security
            </Text>

            <Text style={styles.contentSubtitle}>3. Data Sharing</Text>
            <Text style={styles.contentText}>
              • We do not sell your personal information{'\n'}
              • Customer data is shared only to fulfill orders{'\n'}
              • We may share data with payment processors{'\n'}
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
              • Close your account at any time
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
                <Text style={styles.guideStepTitle}>Inventory Management</Text>
                <Text style={styles.guideStepText}>
                  • Navigate to the Inventory tab{'\n'}
                  • View your inventory dashboard with statistics{'\n'}
                  • Tap "Manage Products" to add/edit products{'\n'}
                  • Monitor low stock and expired items
                </Text>
              </View>
            </View>

            <View style={styles.guideStep}>
              <View style={styles.guideStepNumber}>
                <Text style={styles.guideStepNumberText}>2</Text>
              </View>
              <View style={styles.guideStepContent}>
                <Text style={styles.guideStepTitle}>Recording Walk-in Sales</Text>
                <Text style={styles.guideStepText}>
                  • Go to Inventory → Walk-in Sale{'\n'}
                  • Search and select products{'\n'}
                  • Enter quantities and customer name{'\n'}
                  • Complete the transaction
                </Text>
              </View>
            </View>

            <View style={styles.guideStep}>
              <View style={styles.guideStepNumber}>
                <Text style={styles.guideStepNumberText}>3</Text>
              </View>
              <View style={styles.guideStepContent}>
                <Text style={styles.guideStepTitle}>Managing App Orders</Text>
                <Text style={styles.guideStepText}>
                  • Check the Orders tab for new orders{'\n'}
                  • Update order status (preparing, ready, completed){'\n'}
                  • View commission breakdown{'\n'}
                  • Track delivery or pickup
                </Text>
              </View>
            </View>

            <View style={styles.guideStep}>
              <View style={styles.guideStepNumber}>
                <Text style={styles.guideStepNumberText}>4</Text>
              </View>
              <View style={styles.guideStepContent}>
                <Text style={styles.guideStepTitle}>Recording Damages</Text>
                <Text style={styles.guideStepText}>
                  • Tap "Record Damage" in Inventory Quick Actions{'\n'}
                  • Select the damaged/spoiled product{'\n'}
                  • Enter quantity and reason{'\n'}
                  • Inventory automatically updates
                </Text>
              </View>
            </View>

            <View style={styles.guideStep}>
              <View style={styles.guideStepNumber}>
                <Text style={styles.guideStepNumberText}>5</Text>
              </View>
              <View style={styles.guideStepContent}>
                <Text style={styles.guideStepTitle}>Viewing Sales History</Text>
                <Text style={styles.guideStepText}>
                  • Go to Profile/Settings → Sales History{'\n'}
                  • Filter by type, payment method, or date{'\n'}
                  • Search by customer name{'\n'}
                  • Tap any transaction for details
                </Text>
              </View>
            </View>

            <View style={styles.guideStep}>
              <View style={styles.guideStepNumber}>
                <Text style={styles.guideStepNumberText}>6</Text>
              </View>
              <View style={styles.guideStepContent}>
                <Text style={styles.guideStepTitle}>Handling Returns</Text>
                <Text style={styles.guideStepText}>
                  • Profile/Settings → Record Customer Return{'\n'}
                  • Select the order to return{'\n'}
                  • Choose returned items and quantities{'\n'}
                  • System processes refund and updates inventory
                </Text>
              </View>
            </View>

            <Text style={styles.guideTip}>
              💡 Tip: Regularly check your Inventory Dashboard for alerts and insights to keep your store running smoothly!
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
  scrollContent: {
    paddingHorizontal: s(20),
    paddingTop: vs(20),
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
