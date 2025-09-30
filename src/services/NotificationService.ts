/**
 * Notification Service
 *
 * Handles push notifications for store registration status updates
 * and real-time notifications for the TindaGo app.
 */

import { ref, set, get } from 'firebase/database';
import { auth, database } from '../../FirebaseConfig';
import { STORE_STATUS, STATUS_LABELS } from '../constants/StoreStatus';
import Constants from 'expo-constants';

// Conditionally import notifications to avoid Expo Go issues
let Notifications: any = null;
let isNotificationSupported = false;

try {
  // Check if we're in Expo Go (appOwnership will be 'expo' in Expo Go)
  if (Constants.appOwnership !== 'expo') {
    Notifications = require('expo-notifications');
    isNotificationSupported = true;

    // Configure how notifications should be handled when the app is in foreground
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
      }),
    });
  } else {
    console.log('📱 Push notifications disabled in Expo Go - use development build for full functionality');
  }
} catch (error) {
  console.log('📱 Push notifications not available in this environment');
  isNotificationSupported = false;
}

export class NotificationService {

  /**
   * Setup push notifications and register device token
   */
  static async setupPushNotifications(): Promise<string | null> {
    try {
      if (!isNotificationSupported || !Notifications) {
        console.log('📱 Push notifications not supported in this environment');
        return null;
      }

      // Request permissions
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.warn('Push notification permission not granted');
        return null;
      }

      // Get the token that uniquely identifies this device
      const token = await Notifications.getExpoPushTokenAsync();

      // Save token to Firebase for admin to send notifications
      if (auth.currentUser) {
        const userId = auth.currentUser.uid;
        await set(ref(database, `users/${userId}/pushToken`), token.data);
        console.log('✅ Push token saved:', token.data);
      }

      return token.data;
    } catch (error) {
      console.error('❌ Error setting up push notifications:', error);
      return null;
    }
  }

  /**
   * Send local notification for status updates
   */
  static async sendStatusNotification(status: string, storeName?: string): Promise<void> {
    try {
      if (!isNotificationSupported || !Notifications) {
        console.log('📱 Notifications not supported - status update:', status);
        return;
      }

      let title = '';
      let body = '';
      let sound = true;

      switch (status) {
        case STORE_STATUS.APPROVED:
          title = '🎉 Store Approved!';
          body = `Your ${storeName || 'store'} has been approved and is now live on TindaGo!`;
          break;

        case STORE_STATUS.REJECTED:
          title = '📝 Application Update';
          body = `Your ${storeName || 'store'} application needs attention. Please check the details.`;
          break;

        case STORE_STATUS.ACTIVE:
          title = '🚀 Store is Live!';
          body = `${storeName || 'Your store'} is now active and ready for customers!`;
          break;

        case STORE_STATUS.DOCUMENTS_VERIFIED:
          title = '✅ Documents Verified';
          body = 'Your business documents have been verified successfully.';
          break;

        case STORE_STATUS.DOCUMENTS_REJECTED:
          title = '📄 Documents Need Attention';
          body = 'Some of your documents need to be updated. Please check the details.';
          break;

        default:
          title = 'Application Update';
          body = `Your store status has been updated to: ${STATUS_LABELS[status as keyof typeof STATUS_LABELS] || status}`;
      }

      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          sound,
          data: { status, storeName },
        },
        trigger: null, // Show immediately
      });

      console.log('✅ Local notification sent:', title);
    } catch (error) {
      console.error('❌ Error sending notification:', error);
    }
  }

  /**
   * Send notification when registration step is completed
   */
  static async sendStepCompletionNotification(step: string): Promise<void> {
    try {
      if (!isNotificationSupported || !Notifications) {
        console.log('📱 Notifications not supported - step completed:', step);
        return;
      }
      let title = '';
      let body = '';

      switch (step) {
        case 'store_details':
          title = '✅ Store Details Saved';
          body = 'Your store details have been saved. Next step: Upload documents.';
          break;

        case 'documents':
          title = '📄 Documents Uploaded';
          body = 'Your documents have been uploaded. Next step: Add payment details.';
          break;

        case 'payment':
          title = '💳 Registration Complete';
          body = 'Your store registration is complete! We\'ll review and notify you soon.';
          break;
      }

      if (title && body) {
        await Notifications.scheduleNotificationAsync({
          content: {
            title,
            body,
            sound: true,
            data: { step },
          },
          trigger: null,
        });
      }
    } catch (error) {
      console.error('❌ Error sending step completion notification:', error);
    }
  }

  /**
   * Get user's push token from Firebase
   */
  static async getUserPushToken(userId: string): Promise<string | null> {
    try {
      const tokenRef = ref(database, `users/${userId}/pushToken`);
      const snapshot = await get(tokenRef);
      return snapshot.exists() ? snapshot.val() : null;
    } catch (error) {
      console.error('❌ Error getting push token:', error);
      return null;
    }
  }

  /**
   * Send push notification to specific user (for admin use)
   */
  static async sendPushToUser(
    userId: string,
    title: string,
    body: string,
    data?: any
  ): Promise<boolean> {
    try {
      const pushToken = await this.getUserPushToken(userId);

      if (!pushToken) {
        console.warn('No push token found for user:', userId);
        return false;
      }

      const message = {
        to: pushToken,
        sound: 'default',
        title,
        body,
        data: data || {},
      };

      const response = await fetch('https://exp.host/--/api/v2/push/send', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Accept-encoding': 'gzip, deflate',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(message),
      });

      const result = await response.json();

      if (result.data && result.data.status === 'ok') {
        console.log('✅ Push notification sent successfully');
        return true;
      } else {
        console.error('❌ Push notification failed:', result);
        return false;
      }
    } catch (error) {
      console.error('❌ Error sending push notification:', error);
      return false;
    }
  }

  /**
   * Cancel all scheduled notifications
   */
  static async cancelAllNotifications(): Promise<void> {
    try {
      if (!isNotificationSupported || !Notifications) {
        console.log('📱 Notifications not supported - cannot cancel');
        return;
      }
      await Notifications.cancelAllScheduledNotificationsAsync();
      console.log('✅ All notifications cancelled');
    } catch (error) {
      console.error('❌ Error cancelling notifications:', error);
    }
  }

  /**
   * Get notification permissions status
   */
  static async getPermissionsStatus(): Promise<string> {
    try {
      if (!isNotificationSupported || !Notifications) {
        return 'unavailable';
      }
      const { status } = await Notifications.getPermissionsAsync();
      return status;
    } catch (error) {
      console.error('❌ Error getting permissions status:', error);
      return 'undetermined';
    }
  }

  /**
   * Setup notification listeners for when app is open
   */
  static setupNotificationListeners(
    onNotificationReceived?: (notification: any) => void,
    onNotificationResponse?: (response: any) => void
  ): () => void {
    if (!isNotificationSupported || !Notifications) {
      console.log('📱 Notification listeners not supported in this environment');
      return () => {}; // Return empty cleanup function
    }
    const receivedListener = Notifications.addNotificationReceivedListener(
      (notification: any) => {
        console.log('📱 Notification received:', notification);
        onNotificationReceived?.(notification);
      }
    );

    const responseListener = Notifications.addNotificationResponseReceivedListener(
      (response: any) => {
        console.log('👆 Notification tapped:', response);
        onNotificationResponse?.(response);
      }
    );

    // Return cleanup function
    return () => {
      receivedListener.remove();
      responseListener.remove();
    };
  }
}