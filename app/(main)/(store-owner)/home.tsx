import React from "react";
import { Image, ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import { CustomStatusBar } from "../../../src/components/ui/StatusBar";
import { Typography } from "../../../src/components/ui/Typography";
import { Colors } from "../../../src/constants/Colors";
import { Fonts } from "../../../src/constants/Fonts";
import { s, vs, ms } from "../../../src/constants/responsive";

export default function StoreHomeScreen() {
  return (
    <View style={styles.container}>
      {/* Status Bar */}
      <CustomStatusBar />
      
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Header Section - Figma: Header with profile and notifications */}
        <View style={styles.header}>
          {/* Profile Section */}
          <View style={styles.profileSection}>
            <View style={styles.profileImageContainer}>
              <View style={styles.profileImage} />
            </View>
            <View style={styles.profileInfo}>
              <Typography variant="body" style={styles.greetingText}>
                Good Morning
              </Typography>
              <Typography variant="h2" style={styles.storeName}>
                TindaGO Store
              </Typography>
            </View>
          </View>
          
          {/* Notification Icon */}
          <TouchableOpacity style={styles.notificationButton}>
            <View style={styles.notificationIcon} />
            <View style={styles.notificationBadge} />
          </TouchableOpacity>
        </View>
        
        {/* Stats Cards Section */}
        <View style={styles.statsSection}>
          <Typography variant="h2" style={styles.sectionTitle}>
            Today&apos;s Overview
          </Typography>
          
          <View style={styles.statsGrid}>
            {/* Sales Card */}
            <View style={styles.statsCard}>
              <View style={[styles.statsIconContainer, { backgroundColor: Colors.primary }]}>
                <View style={styles.statsIcon} />
              </View>
              <Typography variant="h1" style={styles.statsValue}>
                ₱2,450
              </Typography>
              <Typography variant="body" style={styles.statsLabel}>
                Total Sales
              </Typography>
            </View>
            
            {/* Orders Card */}
            <View style={styles.statsCard}>
              <View style={[styles.statsIconContainer, { backgroundColor: '#FF6B6B' }]}>
                <View style={styles.statsIcon} />
              </View>
              <Typography variant="h1" style={styles.statsValue}>
                24
              </Typography>
              <Typography variant="body" style={styles.statsLabel}>
                Orders
              </Typography>
            </View>
            
            {/* Products Card */}
            <View style={styles.statsCard}>
              <View style={[styles.statsIconContainer, { backgroundColor: '#4ECDC4' }]}>
                <View style={styles.statsIcon} />
              </View>
              <Typography variant="h1" style={styles.statsValue}>
                156
              </Typography>
              <Typography variant="body" style={styles.statsLabel}>
                Products
              </Typography>
            </View>
            
            {/* Customers Card */}
            <View style={styles.statsCard}>
              <View style={[styles.statsIconContainer, { backgroundColor: '#FFE66D' }]}>
                <View style={styles.statsIcon} />
              </View>
              <Typography variant="h1" style={styles.statsValue}>
                89
              </Typography>
              <Typography variant="body" style={styles.statsLabel}>
                Customers
              </Typography>
            </View>
          </View>
        </View>
        
        {/* Quick Actions Section */}
        <View style={styles.quickActionsSection}>
          <Typography variant="h2" style={styles.sectionTitle}>
            Quick Actions
          </Typography>
          
          <View style={styles.quickActionsGrid}>
            <TouchableOpacity style={styles.actionButton}>
              <View style={[styles.actionIcon, { backgroundColor: Colors.primary }]} />
              <Typography variant="body" style={styles.actionLabel}>
                Add Product
              </Typography>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.actionButton}>
              <View style={[styles.actionIcon, { backgroundColor: '#FF6B6B' }]} />
              <Typography variant="body" style={styles.actionLabel}>
                View Orders
              </Typography>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.actionButton}>
              <View style={[styles.actionIcon, { backgroundColor: '#4ECDC4' }]} />
              <Typography variant="body" style={styles.actionLabel}>
                Inventory
              </Typography>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.actionButton}>
              <View style={[styles.actionIcon, { backgroundColor: '#FFE66D' }]} />
              <Typography variant="body" style={styles.actionLabel}>
                Analytics
              </Typography>
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Recent Activity Section */}
        <View style={styles.recentActivitySection}>
          <Typography variant="h2" style={styles.sectionTitle}>
            Recent Activity
          </Typography>
          
          <View style={styles.activityList}>
            {/* Activity Item 1 */}
            <View style={styles.activityItem}>
              <View style={[styles.activityIcon, { backgroundColor: Colors.primary }]} />
              <View style={styles.activityContent}>
                <Typography variant="body" style={styles.activityTitle}>
                  New order received
                </Typography>
                <Typography variant="caption" style={styles.activityTime}>
                  5 minutes ago
                </Typography>
              </View>
              <View style={styles.activityBadge}>
                <Typography variant="caption" style={styles.badgeText}>
                  ₱125
                </Typography>
              </View>
            </View>
            
            {/* Activity Item 2 */}
            <View style={styles.activityItem}>
              <View style={[styles.activityIcon, { backgroundColor: '#4ECDC4' }]} />
              <View style={styles.activityContent}>
                <Typography variant="body" style={styles.activityTitle}>
                  Product out of stock
                </Typography>
                <Typography variant="caption" style={styles.activityTime}>
                  15 minutes ago
                </Typography>
              </View>
              <View style={[styles.activityBadge, { backgroundColor: '#FF6B6B' }]}>
                <Typography variant="caption" style={styles.badgeText}>
                  Alert
                </Typography>
              </View>
            </View>
            
            {/* Activity Item 3 */}
            <View style={styles.activityItem}>
              <View style={[styles.activityIcon, { backgroundColor: '#FFE66D' }]} />
              <View style={styles.activityContent}>
                <Typography variant="body" style={styles.activityTitle}>
                  Payment received
                </Typography>
                <Typography variant="caption" style={styles.activityTime}>
                  1 hour ago
                </Typography>
              </View>
              <View style={styles.activityBadge}>
                <Typography variant="caption" style={styles.badgeText}>
                  ₱350
                </Typography>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F6F6', // Figma background color
  },
  
  scrollContent: {
    paddingBottom: vs(20),
  },
  
  // Header Section - Figma: Top section with profile and notification
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: s(20),
    paddingTop: vs(20),
    paddingBottom: vs(15),
  },
  
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  profileImageContainer: {
    marginRight: s(12),
  },
  
  profileImage: {
    width: s(48),
    height: s(48),
    borderRadius: s(24),
    backgroundColor: Colors.lightGray,
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  
  profileInfo: {
    justifyContent: 'center',
  },
  
  greetingText: {
    fontSize: s(14),
    color: Colors.textSecondary,
    fontFamily: Fonts.secondary,
    marginBottom: vs(2),
  },
  
  storeName: {
    fontSize: s(18),
    fontWeight: '600',
    color: Colors.darkGray,
    fontFamily: Fonts.primary,
  },
  
  notificationButton: {
    width: s(40),
    height: s(40),
    borderRadius: s(20),
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    position: 'relative',
  },
  
  notificationIcon: {
    width: s(20),
    height: s(20),
    backgroundColor: Colors.textSecondary,
    borderRadius: s(2),
  },
  
  notificationBadge: {
    position: 'absolute',
    top: s(8),
    right: s(8),
    width: s(8),
    height: s(8),
    borderRadius: s(4),
    backgroundColor: '#FF6B6B',
  },
  
  // Stats Section
  statsSection: {
    paddingHorizontal: s(20),
    marginBottom: vs(25),
  },
  
  sectionTitle: {
    fontSize: s(20),
    fontWeight: '600',
    color: Colors.darkGray,
    fontFamily: Fonts.primary,
    marginBottom: vs(15),
  },
  
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  
  statsCard: {
    width: s(180),
    backgroundColor: Colors.white,
    borderRadius: s(16),
    padding: s(20),
    marginBottom: vs(12),
    alignItems: 'center',
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  
  statsIconContainer: {
    width: s(48),
    height: s(48),
    borderRadius: s(24),
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: vs(12),
  },
  
  statsIcon: {
    width: s(24),
    height: s(24),
    backgroundColor: Colors.white,
    borderRadius: s(2),
  },
  
  statsValue: {
    fontSize: s(24),
    fontWeight: '700',
    color: Colors.darkGray,
    fontFamily: Fonts.primary,
    marginBottom: vs(4),
  },
  
  statsLabel: {
    fontSize: s(14),
    color: Colors.textSecondary,
    fontFamily: Fonts.secondary,
    textAlign: 'center',
  },
  
  // Quick Actions Section
  quickActionsSection: {
    paddingHorizontal: s(20),
    marginBottom: vs(25),
  },
  
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  
  actionButton: {
    width: s(80),
    alignItems: 'center',
    marginBottom: vs(15),
  },
  
  actionIcon: {
    width: s(60),
    height: s(60),
    borderRadius: s(16),
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: vs(8),
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  
  actionLabel: {
    fontSize: s(12),
    color: Colors.darkGray,
    fontFamily: Fonts.secondary,
    textAlign: 'center',
    fontWeight: '500',
  },
  
  // Recent Activity Section
  recentActivitySection: {
    paddingHorizontal: s(20),
  },
  
  activityList: {
    backgroundColor: Colors.white,
    borderRadius: s(16),
    padding: s(16),
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: vs(12),
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  
  activityIcon: {
    width: s(36),
    height: s(36),
    borderRadius: s(18),
    marginRight: s(12),
  },
  
  activityContent: {
    flex: 1,
  },
  
  activityTitle: {
    fontSize: s(15),
    fontWeight: '500',
    color: Colors.darkGray,
    fontFamily: Fonts.secondary,
    marginBottom: vs(2),
  },
  
  activityTime: {
    fontSize: s(12),
    color: Colors.textSecondary,
    fontFamily: Fonts.secondary,
  },
  
  activityBadge: {
    backgroundColor: Colors.primary,
    borderRadius: s(12),
    paddingHorizontal: s(8),
    paddingVertical: vs(4),
  },
  
  badgeText: {
    fontSize: s(11),
    color: Colors.white,
    fontFamily: Fonts.secondary,
    fontWeight: '600',
  },
});