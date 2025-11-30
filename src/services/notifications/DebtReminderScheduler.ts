/**
 * Debt Reminder Scheduler - Client-Side
 * 
 * Schedules local notifications on customer's device for Pay Later reminders
 * NO CLOUD FUNCTIONS NEEDED - Works on FREE Firebase Spark plan
 */

import * as Notifications from 'expo-notifications';
import { ref, set, remove } from 'firebase/database';
import { database } from '@/lib/firebase';

export interface ReminderSchedule {
  orderId: string;
  storeId: string;
  storeName: string;
  dueDate: string;
  reminderDaysBefore: number;
}

export class DebtReminderScheduler {
  /**
   * Schedule all reminders for a Pay Later order
   * Called when customer places order
   */
  static async scheduleReminders(schedule: ReminderSchedule): Promise<void> {
    try {
      const { orderId, storeName, dueDate, reminderDaysBefore } = schedule;
      const dueDateTime = new Date(dueDate);
      const now = new Date();

      console.log(`📅 Scheduling reminders for order ${orderId}`);

      // Calculate reminder times
      const reminders: Array<{
        type: 'initial' | 'final' | 'due';
        triggerDate: Date;
        title: string;
        body: string;
      }> = [];

      // STAGE 1: Initial reminder (based on store settings)
      if (reminderDaysBefore > 0) {
        const initialDate = new Date(dueDateTime);
        initialDate.setDate(initialDate.getDate() - reminderDaysBefore);
        initialDate.setHours(9, 0, 0, 0); // 9:00 AM

        if (initialDate > now) {
          reminders.push({
            type: 'initial',
            triggerDate: initialDate,
            title: '📅 Payment Reminder',
            body: `Your Pay Later balance from ${storeName} is due in ${reminderDaysBefore} days.`,
          });
        }
      }

      // STAGE 2: Final reminders (2 days before and 1 day before)
      for (let days = 2; days >= 1; days--) {
        const finalDate = new Date(dueDateTime);
        finalDate.setDate(finalDate.getDate() - days);
        finalDate.setHours(9, 0, 0, 0);

        if (finalDate > now && days < reminderDaysBefore) {
          reminders.push({
            type: 'final',
            triggerDate: finalDate,
            title: '⚠️ Payment Due Soon',
            body: `Your Pay Later debt from ${storeName} is due in ${days} ${days === 1 ? 'day' : 'days'}! Please pay now.`,
          });
        }
      }

      // STAGE 3: Due date reminder (on the day)
      const dueDateReminder = new Date(dueDateTime);
      dueDateReminder.setHours(9, 0, 0, 0);
      
      if (dueDateReminder > now) {
        reminders.push({
          type: 'due',
          triggerDate: dueDateReminder,
          title: '🚨 Payment Due Today',
          body: `Your Pay Later debt from ${storeName} is due TODAY! Please pay now to avoid issues.`,
        });
      }

      // Schedule all notifications
      const notificationIds: string[] = [];
      
      for (const reminder of reminders) {
        try {
          const notificationId = await Notifications.scheduleNotificationAsync({
            content: {
              title: reminder.title,
              body: reminder.body,
              sound: true,
              priority: Notifications.AndroidNotificationPriority.HIGH,
              data: {
                orderId,
                type: 'debt_reminder',
                reminderType: reminder.type,
              },
            },
            trigger: reminder.triggerDate,
          });

          notificationIds.push(notificationId);
          console.log(`✅ Scheduled ${reminder.type} reminder for ${reminder.triggerDate.toISOString()}`);
        } catch (error) {
          console.error(`❌ Failed to schedule ${reminder.type} reminder:`, error);
        }
      }

      // Save notification IDs to Firebase so we can cancel them later if needed
      if (notificationIds.length > 0) {
        await set(ref(database, `localReminders/${orderId}`), {
          notificationIds,
          scheduledAt: new Date().toISOString(),
          dueDate,
          storeName,
        });
      }

      console.log(`✅ Scheduled ${notificationIds.length} reminders for order ${orderId}`);
    } catch (error) {
      console.error('❌ Error scheduling reminders:', error);
      // Don't throw - order should still be created even if reminders fail
    }
  }

  /**
   * Cancel all reminders for an order
   * Called when customer pays debt
   */
  static async cancelReminders(orderId: string): Promise<void> {
    try {
      // Get notification IDs from Firebase
      const reminderRef = ref(database, `localReminders/${orderId}`);
      const { get } = await import('firebase/database');
      const snapshot = await get(reminderRef);

      if (snapshot.exists()) {
        const { notificationIds } = snapshot.val();

        if (notificationIds && Array.isArray(notificationIds)) {
          // Cancel all scheduled notifications
          for (const notificationId of notificationIds) {
            try {
              await Notifications.cancelScheduledNotificationAsync(notificationId);
            } catch (error) {
              console.error(`❌ Failed to cancel notification ${notificationId}:`, error);
            }
          }

          console.log(`✅ Canceled ${notificationIds.length} reminders for order ${orderId}`);
        }

        // Remove from Firebase
        await remove(reminderRef);
      }
    } catch (error) {
      console.error('❌ Error canceling reminders:', error);
    }
  }

  /**
   * Cancel all reminders for current user
   * Called on logout or when user wants to clear notifications
   */
  static async cancelAllReminders(): Promise<void> {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      console.log('✅ All reminders canceled');
    } catch (error) {
      console.error('❌ Error canceling all reminders:', error);
    }
  }

  /**
   * Get all scheduled reminders for debugging
   */
  static async getScheduledReminders(): Promise<Notifications.NotificationRequest[]> {
    try {
      const scheduled = await Notifications.getAllScheduledNotificationsAsync();
      console.log(`📋 ${scheduled.length} reminders currently scheduled`);
      return scheduled;
    } catch (error) {
      console.error('❌ Error getting scheduled reminders:', error);
      return [];
    }
  }
}
