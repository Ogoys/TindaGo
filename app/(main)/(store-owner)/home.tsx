import React, { useState, useEffect } from "react";
import { Image, ScrollView, StyleSheet, TouchableOpacity, View, Switch } from "react-native";
import { auth, database } from "../../../FirebaseConfig";
import { ref, get } from "firebase/database";
import { CustomStatusBar } from "../../../src/components/ui/StatusBar";
import { Typography } from "../../../src/components/ui/Typography";
import { Colors } from "../../../src/constants/Colors";
import { Fonts } from "../../../src/constants/Fonts";
import { s, vs, ms } from "../../../src/constants/responsive";
import { StoreRegistrationService } from "../../../src/services/StoreRegistrationService";

export default function StoreHomeScreen() {
  const [isStoreOpen, setIsStoreOpen] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState('Pending');

  // Store data from Firebase
  const [storeData, setStoreData] = useState({
    storeName: 'Store Owner',
    ownerName: 'Owner',
    storeAddress: 'Jacinto Street',
    city: 'Davao City',
    logo: null as string | null,
  });
  const [loading, setLoading] = useState(true);

  // Fetch store data from Firebase Realtime Database (store_registrations)
  useEffect(() => {
    const fetchStoreData = async () => {
      try {
        const user = auth.currentUser;
        console.log('🔥 Fetching store data for user:', user?.uid);

        if (user) {
          // Fetch from store_registrations collection
          const registrationData = await StoreRegistrationService.getRegistrationData(user.uid);

          if (registrationData) {
            console.log('✅ Store registration data found:', registrationData);

            const businessInfo = registrationData.businessInfo || {};
            const personalInfo = registrationData.personalInfo || {};

            setStoreData({
              storeName: businessInfo.storeName || 'Store Owner',
              ownerName: personalInfo.name || 'Owner',
              storeAddress: businessInfo.address || 'Jacinto Street',
              city: businessInfo.city || 'Davao City',
              logo: businessInfo.logo || null,
            });

            console.log('🏪 Store data updated:', {
              storeName: businessInfo.storeName,
              logo: businessInfo.logo ? 'Logo exists' : 'No logo'
            });
          } else {
            console.log('⚠️ No store registration data found, using defaults');
          }
        } else {
          console.log('❌ No authenticated user');
        }
      } catch (error) {
        console.error('💥 Error fetching store data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStoreData();
  }, []);

  const dashboardStats = [
    {
      id: 1,
      title: 'Order',
      count: '15',
      icon: require('../../../src/assets/images/store-owner-dashboard/purchase-order-icon.png'),
      color: '#02545F'
    },
    {
      id: 2,
      title: 'Pending',
      count: '15',
      icon: require('../../../src/assets/images/store-owner-dashboard/data-pending-icon.png'),
      color: '#02545F'
    },
    {
      id: 3,
      title: 'Active',
      count: '15',
      icon: require('../../../src/assets/images/store-owner-dashboard/check-mark-icon.png'),
      color: '#02545F'
    },
    {
      id: 4,
      title: 'Completed',
      count: '15',
      icon: require('../../../src/assets/images/store-owner-dashboard/approval-icon.png'),
      color: '#02545F'
    },
  ];

  const filterTabs = ['Pending', 'Preparing', 'Out for Pickup', 'Pickup', 'Reject'];

  return (
    <View style={styles.container}>
      {/* Custom Status Bar */}
      <CustomStatusBar />

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        bounces={false}
      >
        {/* Header Background Image - Figma: Rectangle 50 at 0,0 440x210 */}
        <View style={styles.headerBackground}>
          <Image
            source={require('../../../src/assets/images/store-owner-dashboard/header-background.png')}
            style={styles.headerBackgroundImage}
            resizeMode="cover"
          />

          {/* Profile Section - Figma: Profile Group at 20,74 165x42 */}
          <View style={styles.profileSection}>
            <View style={styles.profilePicture}>
              {/* Dynamic Logo from Firebase */}
              {storeData.logo ? (
                <Image
                  source={{ uri: storeData.logo }}
                  style={styles.profileImage}
                  resizeMode="cover"
                />
              ) : (
                <Image
                  source={require('../../../src/assets/images/store-owner-dashboard/profile-picture.png')}
                  style={styles.profileImage}
                  resizeMode="cover"
                />
              )}
            </View>
            <View style={styles.profileInfo}>
              {/* Welcome Text - Figma: 71,74 58x22 */}
              <Typography style={styles.welcomeText}>Welcome</Typography>
              {/* Store Name Text - Dynamic from Firebase (e.g., "Kelly Store") - Figma: 70,94 115x22 */}
              <Typography style={styles.storeOwnerText}>
                {loading ? 'Loading...' : storeData.storeName}
              </Typography>
            </View>
          </View>

          {/* Notification Button - Figma: Notif Group at 375,74 40x40 */}
          <TouchableOpacity style={styles.notificationButton}>
            <Image
              source={require('../../../src/assets/images/store-owner-dashboard/notification-icon.png')}
              style={styles.notificationIcon}
              resizeMode="contain"
            />
          </TouchableOpacity>

          {/* Current Location - Dynamic from Firebase - Figma: 176,126 88x22 and 123,148 193x22 */}
          <View style={styles.locationSection}>
            <Typography style={styles.currentLocationLabel}>Current Location</Typography>
            <Typography style={styles.locationText}>
              {loading
                ? 'Jacinto Street, Davao City'
                : `${storeData.storeAddress}, ${storeData.city}`
              }
            </Typography>
          </View>
        </View>

        {/* Available Status Card - Figma: AvailableStatus Group at 20,230 400x100 */}
        <View style={styles.availableStatusCard}>
          <View style={styles.availableStatusContent}>
            <View style={styles.statusTextSection}>
              {/* Available Status Text - Figma: 40,260 113x20 */}
              <Typography style={styles.availableStatusTitle}>Available Status</Typography>
              {/* Store Status Text - Dynamic based on switch state */}
              <Typography style={[
                styles.storeStatusText,
                { color: isStoreOpen ? '#3BB77E' : '#9CA3AF' }
              ]}>
                {isStoreOpen ? 'Store Open' : 'Store Closed'}
              </Typography>
            </View>
            {/* Toggle Switch - Figma: Off/On Group at 343,268 50x25 */}
            <View style={styles.switchContainer}>
              <Switch
                value={isStoreOpen}
                onValueChange={setIsStoreOpen}
                trackColor={{ false: '#E5E7EB', true: '#3BB77E' }}
                thumbColor={isStoreOpen ? '#FFFFFF' : '#9CA3AF'}
                style={styles.toggleSwitch}
              />
            </View>
          </View>
        </View>

        {/* Sales Analytics Card - Figma: Subtract at 20,350 400x140 */}
        <View style={styles.salesCard}>
          {/* Wallet Icon - Figma: 40,370 30x30 */}
          <Image
            source={require('../../../src/assets/images/store-owner-dashboard/wallet-icon.png')}
            style={styles.walletIcon}
            resizeMode="contain"
          />

          {/* Total Sales Header - Figma: 90,375 164x20 and 323,375 77x20 */}
          <View style={styles.salesHeader}>
            <Typography style={styles.salesTitle}>Total Sales For The Day</Typography>
            <Typography style={styles.salesAmount}>₱4,324.00</Typography>
          </View>

          {/* Separator Line - Figma: Vector 43 at 30,415 380x0 */}
          <View style={styles.salesSeparator} />

          {/* Sales Breakdown - Figma: Week/Month/Year Groups */}
          <View style={styles.salesBreakdown}>
            {/* This Week - Figma: 50,437 77x37 */}
            <View style={styles.salesPeriod}>
              <Typography style={styles.periodLabel}>This Week</Typography>
              <Typography style={styles.periodAmount}>₱4,324.00</Typography>
            </View>

            {/* This Month - Figma: 176,437 83x37 */}
            <View style={styles.salesPeriod}>
              <Typography style={styles.periodLabel}>This Month</Typography>
              <Typography style={styles.periodAmount}>₱14,324.00</Typography>
            </View>

            {/* This Year - Figma: 302,437 87x37 */}
            <View style={styles.salesPeriod}>
              <Typography style={styles.periodLabel}>This Year</Typography>
              <Typography style={styles.periodAmount}>₱43,324.00</Typography>
            </View>
          </View>
        </View>

        {/* Dashboard Stats Grid - Figma: Box 1-4 starting at 20,510 */}
        <View style={styles.statsContainer}>
          <View style={styles.statsGrid}>
            {dashboardStats.map((stat, index) => {
              const isLeftColumn = index % 2 === 0;
              const rowIndex = Math.floor(index / 2);

              return (
                <TouchableOpacity
                  key={stat.id}
                  style={[
                    styles.statsBox,
                    {
                      marginRight: isLeftColumn ? s(18) : 0, // 229 - 20 - 191 = 18px gap
                      marginBottom: rowIndex === 0 ? vs(20) : 0, // Gap between rows
                    }
                  ]}
                >
                  {/* Stats Box Background - Figma: Rectangle 61 191x160 with 16px radius */}
                  <View style={styles.statsBoxBackground} />

                  {/* Icon Container - Figma: Rectangle 63 at 161,520 40x40 (relative to box) */}
                  <View style={styles.statsIconContainer}>
                    <Image
                      source={stat.icon}
                      style={styles.statsIcon}
                      resizeMode="contain"
                    />
                  </View>

                  {/* Stats Label - Figma: Order label Group at 33,598 (relative to box) */}
                  <View style={styles.statsLabel}>
                    <Typography style={styles.statsTitle}>{stat.title}</Typography>
                    <Typography style={styles.statsNumber}>{stat.count}</Typography>
                  </View>

                  {/* Vertical Line - Figma: Vector 44 at 22,598 (relative to box) */}
                  <View style={styles.statsVerticalLine} />
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Order Update Section - Figma: Label Group at 23,870 395x24 */}
        <View style={styles.orderUpdateSection}>
          <View style={styles.orderUpdateHeader}>
            <Typography style={styles.orderUpdateTitle}>Order update</Typography>
            <TouchableOpacity>
              <Typography style={styles.seeMoreText}>See more</Typography>
            </TouchableOpacity>
          </View>

          {/* Filter Pills - Figma: Label for update Frame at -23,914 463x30 */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.filterScrollView}
            contentContainerStyle={styles.filterContainer}
          >
            {filterTabs.map((filter, index) => (
              <TouchableOpacity
                key={filter}
                style={[
                  styles.filterPill,
                  selectedFilter === filter && styles.filterPillActive
                ]}
                onPress={() => setSelectedFilter(filter)}
              >
                <Typography
                  style={[
                    styles.filterText,
                    selectedFilter === filter ? styles.filterTextActive : {}
                  ]}
                >
                  {filter}
                </Typography>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Order List Cards */}
        <View style={styles.orderListContainer}>
          {[0, 1].map((cardIndex) => (
            <TouchableOpacity
              key={cardIndex}
              style={styles.orderCard}
            >
              {/* Order Card Background - Figma: Rectangle 64 400x200 with 16px radius */}
              <View style={styles.orderCardBackground} />

              {/* Logo Section - Figma: Logo Group at 40,984 40x40 (relative to card) */}
              <View style={styles.orderLogo}>
                <View style={styles.orderLogoBackground} />
                <Image
                  source={require('../../../src/assets/images/store-owner-dashboard/cheque-icon.png')}
                  style={styles.orderLogoIcon}
                  resizeMode="contain"
                />
              </View>

              {/* Order Header - Figma: Order No at 95,986 and 1 min ago at 343,986 */}
              <View style={styles.orderHeader}>
                <View style={styles.orderHeaderLeft}>
                  <Typography style={styles.orderNoLabel}>Order No</Typography>
                  <Typography style={styles.orderNoValue}>#12345</Typography>
                </View>
                <Typography style={styles.orderTime}>1 min ago</Typography>
              </View>

              {/* Separator Line - Figma: Vector 43 at 30,1044 */}
              <View style={styles.orderSeparator} />

              {/* Order Details Row 1 - Customer Info */}
              <View style={styles.orderDetailsRow1}>
                {/* Customer Name - Figma: Name Group at 61,1062 116x34 */}
                <View style={styles.orderDetailCustomer}>
                  <Image
                    source={require('../../../src/assets/images/store-owner-dashboard/person-icon.png')}
                    style={styles.orderDetailIcon}
                    resizeMode="contain"
                  />
                  <View style={styles.orderDetailText}>
                    <Typography style={styles.customerName}>Dotarot{'\n'}Maynard</Typography>
                  </View>
                </View>

                {/* Phone Number - Figma: Call Group at 236,1059 142x40 */}
                <View style={styles.orderDetailPhone}>
                  <Image
                    source={require('../../../src/assets/images/store-owner-dashboard/phone-icon.png')}
                    style={styles.orderDetailIcon}
                    resizeMode="contain"
                  />
                  <View style={styles.orderDetailText}>
                    <Typography style={styles.phoneNumber}>+6398 032{'\n'}4213</Typography>
                  </View>
                </View>
              </View>

              {/* Order Details Row 2 - Payment Info */}
              <View style={styles.orderDetailsRow2}>
                {/* Price - Figma: Price Group at 61,1114 125x30 */}
                <View style={styles.orderDetailPrice}>
                  <Image
                    source={require('../../../src/assets/images/store-owner-dashboard/coin-wallet-icon.png')}
                    style={styles.orderDetailIcon}
                    resizeMode="contain"
                  />
                  <View style={styles.orderDetailText}>
                    <Typography style={styles.orderPrice}>₱589.00</Typography>
                  </View>
                </View>

                {/* Payment Method - Figma: Mode of payment Group at 236,1114 130x30 */}
                <View style={styles.orderDetailPayment}>
                  <Image
                    source={require('../../../src/assets/images/store-owner-dashboard/wallet-payment-icon.png')}
                    style={styles.orderDetailIcon}
                    resizeMode="contain"
                  />
                  <View style={styles.orderDetailText}>
                    <Typography style={styles.paymentMethod}>PAYMAYA</Typography>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F6F6', // Figma: fill_4NI1RY
  },

  // Fix ScrollView layout to allow proper scrolling
  scrollView: {
    flex: 1,
  },

  scrollContent: {
    flexGrow: 1,
    paddingBottom: vs(20), // Reduced padding since no navigation bar
  },

  // Header Background - Figma: Rectangle 50 at 0,0 440x210
  headerBackground: {
    position: 'relative',
    width: '100%',
    height: vs(210),
    marginBottom: vs(20),
  },

  headerBackgroundImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: vs(210),
  },

  // Profile Section - Figma: Profile Group at 20,74 165x42
  profileSection: {
    position: 'absolute',
    top: vs(74),
    left: s(20),
    flexDirection: 'row',
    alignItems: 'flex-start',
    width: s(165),
    height: vs(42),
  },

  // Profile Picture - Figma: Profile Picture Ellipse at 20,74 40x40
  profilePicture: {
    width: s(40),
    height: s(40),
    borderRadius: s(20),
    backgroundColor: '#FFFFFF',
    shadowColor: 'rgba(0, 0, 0, 0.25)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },

  profileImage: {
    width: s(40),
    height: s(40),
    borderRadius: s(20),
  },

  profileInfo: {
    marginLeft: s(11), // 51px from left - 40px width = 11px margin
    justifyContent: 'flex-start',
  },

  // Welcome Text - Figma: Welcome Text at 71,74 58x22
  welcomeText: {
    fontFamily: 'Clash Grotesk Variable',
    fontWeight: '400',
    fontSize: s(14),
    lineHeight: s(22),
    color: '#FFFFFF',
    height: vs(22),
  },

  // Store Owner Text - Figma: Store Owner Text at 70,94 115x22
  storeOwnerText: {
    fontFamily: 'Clash Grotesk Variable',
    fontWeight: '500',
    fontSize: s(20),
    lineHeight: s(22),
    color: '#FFFFFF',
    height: vs(22),
    marginTop: vs(0),
  },

  // Notification Button - Figma: Notif Group at 375,74 40x40
  notificationButton: {
    position: 'absolute',
    top: vs(74),
    left: s(375),
    width: s(40),
    height: s(40),
    borderRadius: s(20),
    backgroundColor: '#FFFFFF',
    shadowColor: 'rgba(0, 0, 0, 0.25)',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },

  notificationIcon: {
    width: s(25),
    height: s(25),
  },

  // Location Section - Figma: Current Location at 176,126 88x22 and Jacinto Street at 123,148 193x22
  locationSection: {
    position: 'absolute',
    top: vs(126), // Back to original position
    alignItems: 'center',
    width: '100%',
    height: vs(44), // Total height for both texts
  },

  currentLocationLabel: {
    fontFamily: 'Clash Grotesk Variable',
    fontWeight: '400',
    fontSize: s(12),
    lineHeight: s(22),
    color: '#FFFFFF',
    textAlign: 'center',
    height: vs(22),
  },

  locationText: {
    fontFamily: 'Clash Grotesk Variable',
    fontWeight: '600',
    fontSize: s(16),
    lineHeight: s(22),
    color: '#FFFFFF',
    textAlign: 'center',
    marginTop: vs(0),
    height: vs(22),
  },

  // Available Status Card - Figma: AvailableStatus Group at 20,230 400x100
  availableStatusCard: {
    marginHorizontal: s(20),
    marginBottom: vs(20),
    width: s(400),
    height: vs(100),
    backgroundColor: '#FFFFFF',
    borderRadius: s(20),
    shadowColor: 'rgba(0, 0, 0, 0.25)',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 5,
    elevation: 5,
  },

  availableStatusContent: {
    flex: 1,
    position: 'relative',
  },

  statusTextSection: {
    position: 'absolute',
    top: vs(30),
    left: s(20),
  },

  // Available Status Title - Figma: Available Status at 40,260 113x20
  availableStatusTitle: {
    fontFamily: 'Clash Grotesk Variable',
    fontWeight: '500',
    fontSize: s(16),
    lineHeight: s(20),
    color: '#000000',
    width: s(113),
    height: vs(20),
  },

  // Store Status Text - Dynamic color based on switch state
  storeStatusText: {
    fontFamily: 'Clash Grotesk Variable',
    fontWeight: '500',
    fontSize: s(12),
    lineHeight: s(15),
    // Color is now set dynamically in the component
    width: s(80), // Increased width to accommodate "Store Closed"
    height: vs(15),
    marginTop: vs(25),
  },

  // Switch Container - Figma: Off/On Group at 343,268 50x25
  switchContainer: {
    position: 'absolute',
    top: vs(38),
    right: s(27),
    width: s(50),
    height: vs(25),
  },

  toggleSwitch: {
    transform: [{ scaleX: 1.2 }, { scaleY: 1.2 }],
  },

  // Sales Card - Figma: Subtract at 20,350 400x140
  salesCard: {
    marginHorizontal: s(20),
    marginBottom: vs(20),
    width: s(400),
    height: vs(140),
    backgroundColor: '#FFFFFF',
    borderRadius: s(20),
    shadowColor: 'rgba(0, 0, 0, 0.25)',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 5,
    elevation: 5,
    padding: s(20),
  },

  // Wallet Icon - Figma: Wallet at 40,370 30x30 (relative to card: 20px from left edge)
  walletIcon: {
    position: 'absolute',
    top: vs(20),
    left: s(20),
    width: s(30),
    height: vs(30),
  },

  // Sales Header - Figma: Total Sales at 90,375 164x20 and ₱4,324.00 at 323,375 77x20
  salesHeader: {
    position: 'absolute',
    top: vs(25),
    left: s(70),
    right: s(20),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  salesTitle: {
    fontFamily: 'Clash Grotesk Variable',
    fontWeight: '500',
    fontSize: s(16),
    lineHeight: s(20),
    color: '#1E1E1E',
    width: s(164),
    height: vs(20),
  },

  salesAmount: {
    fontFamily: 'Clash Grotesk Variable',
    fontWeight: '500',
    fontSize: s(16),
    lineHeight: s(20),
    color: '#02545F',
    width: s(77),
    height: vs(20),
    textAlign: 'right',
  },

  // Sales Separator - Figma: Vector 43 at 30,415 380x0
  salesSeparator: {
    position: 'absolute',
    top: vs(65),
    left: s(10),
    width: s(380),
    height: 2,
    backgroundColor: '#02545F',
  },

  // Sales Breakdown - Figma: Week/Month/Year Groups starting at y:437
  salesBreakdown: {
    position: 'absolute',
    top: vs(87),
    left: s(30),
    right: s(30),
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  salesPeriod: {
    alignItems: 'flex-start',
  },

  periodLabel: {
    fontFamily: 'Clash Grotesk Variable',
    fontWeight: '400',
    fontSize: s(14),
    lineHeight: s(17),
    color: '#000000',
    height: vs(17),
  },

  periodAmount: {
    fontFamily: 'Clash Grotesk Variable',
    fontWeight: '500',
    fontSize: s(16),
    lineHeight: s(20),
    color: '#02545F',
    height: vs(20),
    marginTop: vs(0),
  },

  // Stats Container - Use flexbox instead of absolute positioning
  statsContainer: {
    paddingHorizontal: s(20),
    marginBottom: vs(20),
  },

  // Stats Grid - Use flexbox layout
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },

  // Stats Box - Figma: Box dimensions 191x160 with 16px radius
  statsBox: {
    width: s(191),
    height: vs(160),
    position: 'relative',
  },

  statsBoxBackground: {
    width: '100%',
    height: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: s(16),
    shadowColor: 'rgba(0, 0, 0, 0.25)',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 5,
    elevation: 5,
  },

  // Stats Icon Container - Figma: Rectangle 63 at 161,520 40x40 (relative to box)
  statsIconContainer: {
    position: 'absolute',
    top: vs(10),
    right: s(10),
    width: s(40),
    height: vs(40),
    backgroundColor: '#02545F',
    borderRadius: s(8),
    justifyContent: 'center',
    alignItems: 'center',
  },

  statsIcon: {
    width: s(25),
    height: vs(25),
  },

  // Stats Label - Figma: Order label Group at 33,598 (relative to box position)
  statsLabel: {
    position: 'absolute',
    bottom: vs(18),
    left: s(13),
    width: s(79), // Max width for text
    height: vs(54),
  },

  statsNumber: {
    fontFamily: 'Clash Grotesk Variable',
    fontWeight: '500',
    fontSize: s(28),
    lineHeight: s(34),
    color: '#02545F',
    height: vs(34),
  },

  statsTitle: {
    fontFamily: 'Clash Grotesk Variable',
    fontWeight: '500',
    fontSize: s(16),
    lineHeight: s(20),
    color: '#1E1E1E',
    height: vs(20),
    marginTop: vs(0),
  },

  // Stats Vertical Line - Figma: Vector 44 at 22,598 (relative to box)
  statsVerticalLine: {
    position: 'absolute',
    bottom: vs(18), // Align with label
    left: s(2),
    width: s(4),
    height: vs(51.5),
    backgroundColor: '#02545F',
  },

  // Order Update Section - Figma: Label Group at 23,870 395x24
  orderUpdateSection: {
    paddingHorizontal: s(23),
    marginBottom: vs(20),
  },

  orderUpdateHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: vs(20),
  },

  orderUpdateTitle: {
    fontFamily: 'Clash Grotesk Variable',
    fontWeight: '600',
    fontSize: s(20),
    lineHeight: s(22),
    color: '#1E1E1E',
    height: vs(22),
  },

  seeMoreText: {
    fontFamily: 'Clash Grotesk Variable',
    fontWeight: '500',
    fontSize: s(14),
    lineHeight: s(22),
    color: 'rgba(0, 0, 0, 0.5)',
    height: vs(22),
  },

  // Filter ScrollView
  filterScrollView: {
    height: vs(30),
  },

  filterContainer: {
    paddingHorizontal: s(0),
    gap: s(10),
  },

  filterPill: {
    backgroundColor: 'rgba(30, 30, 30, 0.5)',
    borderRadius: s(8),
    paddingHorizontal: s(15),
    paddingVertical: vs(5),
    marginRight: s(10),
  },

  filterPillActive: {
    backgroundColor: '#02545F',
  },

  filterText: {
    fontFamily: 'Clash Grotesk Variable',
    fontWeight: '500',
    fontSize: s(16),
    lineHeight: s(20),
    color: '#FFFFFF',
  },

  filterTextActive: {
    color: '#FFFFFF',
  },

  // Order List Container - Use flexbox instead of absolute positioning
  orderListContainer: {
    paddingHorizontal: s(20),
    gap: vs(20),
  },

  // Order Card - Remove absolute positioning
  orderCard: {
    width: s(400),
    height: vs(200),
    position: 'relative',
  },

  orderCardBackground: {
    width: '100%',
    height: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: s(16),
    shadowColor: 'rgba(0, 0, 0, 0.25)',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 5,
    elevation: 5,
  },

  // Order Logo - Figma: Logo Group at 40,984 40x40 (relative to card)
  orderLogo: {
    position: 'absolute',
    top: vs(20),
    left: s(20),
    width: s(40),
    height: vs(40),
  },

  orderLogoBackground: {
    width: '100%',
    height: '100%',
    backgroundColor: '#02545F',
    borderRadius: s(5),
  },

  orderLogoIcon: {
    position: 'absolute',
    top: vs(8),
    left: s(7),
    width: s(25),
    height: vs(25),
  },

  // Order Header - Figma: Order No at 95,986 and 1 min ago at 343,986
  orderHeader: {
    position: 'absolute',
    top: vs(22),
    left: s(75),
    right: s(20),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },

  orderHeaderLeft: {
    flex: 1,
  },

  orderNoLabel: {
    fontFamily: 'Clash Grotesk Variable',
    fontWeight: '500',
    fontSize: s(14),
    lineHeight: s(17),
    color: 'rgba(30, 30, 30, 0.5)',
    height: vs(17),
  },

  orderNoValue: {
    fontFamily: 'Clash Grotesk Variable',
    fontWeight: '500',
    fontSize: s(12),
    lineHeight: s(15),
    color: '#000000',
    height: vs(15),
    marginTop: vs(6),
  },

  orderTime: {
    fontFamily: 'Clash Grotesk Variable',
    fontWeight: '500',
    fontSize: s(14),
    lineHeight: s(17),
    color: 'rgba(30, 30, 30, 0.5)',
    textAlign: 'right',
    height: vs(17),
  },

  // Order Separator - Figma: Vector 43 at 30,1044 (relative to card)
  orderSeparator: {
    position: 'absolute',
    top: vs(80),
    left: s(10),
    width: s(380),
    height: 2,
    backgroundColor: '#02545F',
  },

  // Order Details Row 1 - Customer and Phone Info
  orderDetailsRow1: {
    position: 'absolute',
    top: vs(95), // Position after separator
    left: s(20),
    right: s(20),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },

  // Order Details Row 2 - Price and Payment Info
  orderDetailsRow2: {
    position: 'absolute',
    top: vs(140), // Position below first row
    left: s(20),
    right: s(20),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },

  // Customer Name Section
  orderDetailCustomer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    width: s(160), // More space for customer name
  },

  // Phone Number Section
  orderDetailPhone: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    width: s(160), // More space for phone
  },

  // Price Section
  orderDetailPrice: {
    flexDirection: 'row',
    alignItems: 'center',
    width: s(150), // Adequate space for price
  },

  // Payment Method Section
  orderDetailPayment: {
    flexDirection: 'row',
    alignItems: 'center',
    width: s(160), // Space for payment method
  },

  orderDetailIcon: {
    width: s(24),
    height: vs(24),
    marginRight: s(12),
    marginTop: vs(2), // Slight vertical adjustment for better alignment
  },

  orderDetailText: {
    flex: 1,
    justifyContent: 'center',
  },

  customerName: {
    fontFamily: 'Clash Grotesk Variable',
    fontWeight: '500',
    fontSize: s(14),
    lineHeight: s(17),
    color: '#000000',
  },

  phoneNumber: {
    fontFamily: 'Clash Grotesk Variable',
    fontWeight: '500',
    fontSize: s(16),
    lineHeight: s(20),
    color: '#1E1E1E',
  },

  orderPrice: {
    fontFamily: 'Clash Grotesk Variable',
    fontWeight: '500',
    fontSize: s(16),
    lineHeight: s(20),
    color: '#1E1E1E',
  },

  paymentMethod: {
    fontFamily: 'Clash Grotesk Variable',
    fontWeight: '500',
    fontSize: s(16),
    lineHeight: s(20),
    color: '#1E1E1E',
  },

});