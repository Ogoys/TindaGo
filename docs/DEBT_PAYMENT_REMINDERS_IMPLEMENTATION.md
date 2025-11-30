# 🔔 Debt Payment Reminders - Implementation Guide

## 📊 Current Status

### ✅ **ALREADY IMPLEMENTED:**
- Cloud Functions for processing reminders (`functions/src/index.ts`)
- Auto-cancellation when debt is paid
- Expo Push Notification integration
- Scheduled execution (every 5 minutes)

### ❌ **MISSING:**
- Reminder creation when "Pay Later" order is placed
- Notification UI component for customers
- In-app notification center (optional)

---

## 🎯 Implementation Steps

### **STEP 1: Create Reminder When Order is Placed** ⚠️ CRITICAL

When a customer places an order with `paymentMethod = "Pay Later"`, we need to create a scheduled reminder.

#### **File to Update:** `src/api/orders/index.ts` or wherever order creation happens

Add this function:

```typescript
import { ref, set } from 'firebase/database';
import { database } from '../../../FirebaseConfig';

/**
 * Schedule a payment reminder for a Pay Later order
 * @param orderId - The order ID
 * @param customerId - The customer user ID
 * @param storeId - The store ID
 * @param dueDate - The due date for payment (ISO string)
 * @param reminderDaysBefore - Days before due date to send reminder (from store settings)
 */
export async function schedulePaymentReminder(
  orderId: string,
  customerId: string,
  storeId: string,
  dueDate: string,
  reminderDaysBefore: number = 3
): Promise<void> {
  try {
    // Calculate trigger time: dueDate minus reminderDaysBefore
    const dueDateMs = new Date(dueDate).getTime();
    const reminderMs = dueDateMs - (reminderDaysBefore * 24 * 60 * 60 * 1000);
    const triggerAt = new Date(reminderMs).toISOString();

    // Create scheduled reminder in Firebase
    const reminderRef = ref(database, `scheduledReminders/${orderId}`);
    await set(reminderRef, {
      userId: customerId,
      storeId: storeId,
      triggerAt: triggerAt,
      type: 'debt_due_reminder',
      processed: false,
      cancelled: false,
      createdAt: new Date().toISOString(),
      dueDate: dueDate,
      reminderDaysBefore: reminderDaysBefore,
    });

    console.log(`✅ Payment reminder scheduled for order ${orderId} at ${triggerAt}`);
  } catch (error) {
    console.error('❌ Error scheduling payment reminder:', error);
    // Don't throw - order should still be created even if reminder fails
  }
}
```

#### **Call This Function After Order Creation:**

```typescript
// In your order creation function (e.g., createOrder)
if (orderData.paymentMethod === 'Pay Later') {
  // Calculate due date based on store's maxDaysUntilDue setting
  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + storeSettings.maxDaysUntilDue);
  
  // Schedule reminder
  await schedulePaymentReminder(
    orderId,
    customerId,
    storeId,
    dueDate.toISOString(),
    storeSettings.reminderDaysBefore || 3
  );
}
```

---

### **STEP 2: Set Up Push Notifications** 📱

Customers need to have push tokens registered for notifications to work.

#### **File:** `src/lib/notifications/pushNotifications.ts` (create if doesn't exist)

```typescript
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { ref, update } from 'firebase/database';
import { database } from '../../../FirebaseConfig';

/**
 * Request push notification permissions and register token
 */
export async function registerPushToken(userId: string): Promise<string | null> {
  try {
    // Request permissions
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    if (finalStatus !== 'granted') {
      console.log('❌ Push notification permission denied');
      return null;
    }

    // Get push token
    const token = (await Notifications.getExpoPushTokenAsync()).data;
    console.log('✅ Push token obtained:', token);

    // Save token to Firebase
    const userRef = ref(database, `users/${userId}`);
    await update(userRef, {
      pushToken: token,
      pushTokenUpdatedAt: new Date().toISOString(),
    });

    return token;
  } catch (error) {
    console.error('❌ Error registering push token:', error);
    return null;
  }
}

/**
 * Configure notification handler
 */
export function configureNotifications() {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
    }),
  });
}
```

#### **Call This On App Start:**

In your main App component or UserContext:

```typescript
useEffect(() => {
  if (user?.id) {
    // Register push notifications
    configureNotifications();
    registerPushToken(user.id);
  }
}, [user?.id]);
```

---

### **STEP 3: Add In-App Notification UI** 🎨 (OPTIONAL)

Create a notification bell icon in the header that shows unread reminders.

#### **File:** `src/components/NotificationBell.tsx`

```typescript
import React, { useState, useEffect } from 'react';
import { TouchableOpacity, Text, View, StyleSheet } from 'react-native';
import { ref, onValue } from 'firebase/database';
import { database } from '../../FirebaseConfig';
import { router } from 'expo-router';

interface Props {
  userId: string;
}

export function NotificationBell({ userId }: Props) {
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const notificationsRef = ref(database, `notifications/${userId}`);
    const unsubscribe = onValue(notificationsRef, (snapshot) => {
      if (snapshot.exists()) {
        const notifications = snapshot.val();
        const unread = Object.values(notifications).filter(
          (n: any) => !n.read
        ).length;
        setUnreadCount(unread);
      }
    });

    return () => unsubscribe();
  }, [userId]);

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => router.push('/(main)/(customer)/notifications')}
    >
      <Text style={styles.bell}>🔔</Text>
      {unreadCount > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{unreadCount}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    padding: 8,
  },
  bell: {
    fontSize: 24,
  },
  badge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#E92B45',
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
});
```

---

## 🧪 Testing Guide

### **1. Test Reminder Creation**

```typescript
// In your dev/test environment
import { schedulePaymentReminder } from './src/api/orders';

// Test: Schedule a reminder for 1 minute from now
const testOrderId = 'test_order_123';
const testCustomerId = 'customer_abc';
const testStoreId = 'store_xyz';
const testDueDate = new Date(Date.now() + 4 * 60 * 1000); // 4 minutes from now

await schedulePaymentReminder(
  testOrderId,
  testCustomerId,
  testStoreId,
  testDueDate.toISOString(),
  0 // 0 days before = immediate when due
);

// Check Firebase Console: scheduledReminders/test_order_123 should exist
```

### **2. Test Cloud Function**

```bash
# Check Firebase Console > Functions > processDebtReminders
# Should show executions every 5 minutes
```

### **3. Test Notification Delivery**

1. Make sure customer has push token registered:
   ```
   Firebase Console > Database > users/{userId}/pushToken
   ```

2. Create a test reminder with `triggerAt` = 1 minute from now

3. Wait 5 minutes for Cloud Function to run

4. Customer should receive push notification

### **4. Test Auto-Cancel**

1. Create reminder for an order
2. Mark order as paid: `orders/{orderId}/paymentStatus = "PAID"`
3. Check: `scheduledReminders/{orderId}/cancelled` should be `true`

---

## 📱 Where Customers See Notifications

### **1. Push Notifications (Outside App)**
- Shows on lock screen
- Shows in notification center
- Format: "Payment reminder - Your Pay Later balance is due soon"

### **2. In-App Notifications (Optional)**
- Notification bell icon in header
- Badge shows unread count
- Tapping opens notifications list

### **3. Pay Later Screen**
- Show due date prominently
- Show days until due
- Show "Overdue" badge if past due

---

## 🔧 Configuration

Store owners can configure reminders in **Debt Settings**:

```typescript
// Store settings (already saved to Firebase)
debtSettings: {
  reminderDaysBefore: 3, // Send reminder 3 days before due date
  maxDaysUntilDue: 30,   // Customer has 30 days to pay
}
```

---

## 📊 Database Structure

### **scheduledReminders/{orderId}**
```json
{
  "userId": "customer123",
  "storeId": "store456",
  "triggerAt": "2025-12-07T10:00:00Z",
  "type": "debt_due_reminder",
  "processed": false,
  "cancelled": false,
  "createdAt": "2025-12-04T10:00:00Z",
  "dueDate": "2025-12-10T23:59:59Z",
  "reminderDaysBefore": 3
}
```

### **users/{userId}**
```json
{
  "pushToken": "ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]",
  "pushTokenUpdatedAt": "2025-12-04T10:00:00Z"
}
```

---

## 🚀 Quick Demo Steps

1. **Install Dependencies:**
   ```bash
   npm install expo-notifications
   ```

2. **Create Order with Pay Later:**
   - Customer selects "Pay Later" payment method
   - System calculates due date (e.g., 30 days)
   - System schedules reminder (e.g., 3 days before due)

3. **Wait for Reminder:**
   - Cloud Function runs every 5 minutes
   - When `triggerAt` time is reached, push notification sent

4. **Customer Receives Notification:**
   - Push notification shows on device
   - Customer taps to open app
   - Customer pays debt via Pay Later screen

5. **Reminder Auto-Cancels:**
   - When customer pays, reminder marked as cancelled
   - No more notifications sent for that order

---

## ✅ Verification Checklist

- [ ] Reminder created when Pay Later order placed
- [ ] Reminder saved to Firebase with correct `triggerAt` time
- [ ] Customer has push token registered
- [ ] Cloud Function runs every 5 minutes
- [ ] Push notification delivered at correct time
- [ ] Reminder cancelled when order is paid
- [ ] Store owner can configure `reminderDaysBefore` in settings
- [ ] Customer sees due date in Pay Later screen

---

## 🎯 Priority Implementation Order

1. **CRITICAL** - Add reminder creation in order flow
2. **HIGH** - Set up push token registration
3. **MEDIUM** - Add in-app notification UI
4. **LOW** - Add notification history screen

---

## 📝 Notes

- Cloud Functions already deployed ✅
- Uses Expo Push Notification service
- Runs every 5 minutes (configurable)
- Automatically cancels when paid
- No cost for push notifications (Expo free tier)
- Store owners configure via Debt Settings UI
