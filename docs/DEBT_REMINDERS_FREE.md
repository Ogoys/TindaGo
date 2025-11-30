# 🆓 FREE Debt Payment Reminder System
## No Cloud Functions • No Blaze Plan • 100% FREE

---

## 🎯 What's Implemented

This is a **completely FREE** alternative to Cloud Functions that works on **Firebase Spark Plan** (free tier).

### ✅ **COMPLETED:**

1. **Client-Side Local Notifications** - Scheduled directly on customer's device
2. **Multi-Stage Reminders** - Respects store's `reminderDaysBefore` setting
3. **Auto-Cancel When Paid** - Reminders stop automatically when customer pays
4. **Push Notification Setup** - Auto-registration when user logs in
5. **No Server Required** - Everything runs on the customer's phone

---

## 💡 How It Works

### **Local Notification Approach**

Instead of using Firebase Cloud Functions (which require paid Blaze plan), reminders are **scheduled locally** on the customer's device when they place a Pay Later order.

```
Customer places order → App schedules notifications on device → Device shows alerts at scheduled times
```

**Technology:** `expo-notifications` scheduleNotificationAsync

---

## 📅 Reminder Schedule

When customer places Pay Later order, the app schedules up to **4 notifications**:

### **Stage 1: Initial Reminder** 🔔
- **When:** X days before due date (based on store's setting)
- **Example:** If store sets 3 days, reminder on Day 27 (for 30-day due date)
- **Message:** "Your Pay Later balance from [Store] is due in 3 days."

### **Stage 2: Final Reminder (2 days before)** ⚠️
- **When:** 2 days before due date
- **Message:** "Your Pay Later debt from [Store] is due in 2 days! Please pay now."

### **Stage 3: Final Reminder (1 day before)** ⚠️
- **When:** 1 day before due date
- **Message:** "Your Pay Later debt from [Store] is due in 1 day! Please pay now."

### **Stage 4: Due Date Reminder** 🚨
- **When:** On the due date at 9:00 AM
- **Message:** "Your Pay Later debt from [Store] is due TODAY! Please pay now to avoid issues."

---

## ✅ Advantages of This Approach

### **Pros:**
- ✅ **100% FREE** - No Firebase billing, no Blaze plan needed
- ✅ **No server maintenance** - Everything runs on client
- ✅ **Works offline** - Once scheduled, notifications work even without internet
- ✅ **Respects store settings** - Uses `reminderDaysBefore` from debt settings
- ✅ **Auto-cancels** - Reminders stop when debt is paid

### **Cons:**
- ❌ **Requires app installed** - If customer uninstalls app, reminders are lost
- ❌ **No overdue reminders** - Can't send reminders after due date passes
- ❌ **Device-dependent** - Relies on customer's phone being on

---

## 🔧 Technical Implementation

### **Files Modified:**

1. **`src/services/notifications/DebtReminderScheduler.ts`** (NEW)
   - Main service for scheduling/canceling reminders
   - Uses `expo-notifications` API

2. **`app/(main)/(customer)/payment.tsx`**
   - Schedules reminders when Pay Later order is placed (line 786)
   - Cancels reminders when debt is paid (line 534)

3. **`src/contexts/UserContext.tsx`**
   - Auto-registers push token on login (line 47)

---

## 📱 How To Use (Customer)

### **Step 1: Place Pay Later Order**
1. Customer adds items to cart
2. Selects "Pay Later" payment method
3. Sets due date (within store's limit)
4. Completes order

### **Step 2: Automatic Reminder Setup**
- App immediately schedules notifications on device
- Customer sees confirmation: "Order placed! You'll receive payment reminders."

### **Step 3: Receive Reminders**
- Notifications appear at scheduled times
- Customer can tap notification to open app and pay

### **Step 4: Pay Debt**
- Customer pays debt online (GCash/PayMaya)
- App automatically cancels remaining reminders
- No more notifications for that order

---

## 🧪 Testing Guide

### **Test Scenario 1: Schedule Reminders**

1. **Place a Pay Later order:**
   ```
   - Store: reminderDaysBefore = 3
   - Due date: 7 days from now
   ```

2. **Check scheduled notifications:**
   ```typescript
   import { DebtReminderScheduler } from '@/services/notifications/DebtReminderScheduler';
   
   // In console or dev tools
   const reminders = await DebtReminderScheduler.getScheduledReminders();
   console.log('Scheduled reminders:', reminders);
   ```

3. **Expected:** Should show 3-4 scheduled notifications

### **Test Scenario 2: Cancel Reminders**

1. **Place Pay Later order** (as above)
2. **Pay the debt** via GCash/PayMaya
3. **Check scheduled notifications again**
4. **Expected:** Reminders for that order should be gone

### **Test Scenario 3: Notification Appears**

1. **Set up test order with due date = tomorrow:**
   ```typescript
   // In payment.tsx, temporarily change:
   const testDueDate = new Date();
   testDueDate.setDate(testDueDate.getDate() + 1); // Tomorrow
   testDueDate.setHours(9, 0, 0, 0); // 9:00 AM
   ```

2. **Place order**
3. **Wait until tomorrow at 9:00 AM**
4. **Expected:** Notification appears on device

### **Quick Debug Commands:**

```typescript
// View all scheduled reminders
await DebtReminderScheduler.getScheduledReminders();

// Cancel specific order's reminders
await DebtReminderScheduler.cancelReminders('order_123');

// Cancel ALL reminders
await DebtReminderScheduler.cancelAllReminders();
```

---

## 🚀 Deployment Steps

### **No deployment needed!** 

Unlike Cloud Functions, this solution requires **zero deployment**. Just:

1. ✅ Make sure code changes are saved
2. ✅ Restart the app (reload in Expo)
3. ✅ Test by placing a Pay Later order

**That's it!** No `firebase deploy`, no billing setup, no card required.

---

## 📊 Database Structure

### **localReminders/{orderId}**
```json
{
  "notificationIds": ["abc-123", "def-456", "ghi-789"],
  "scheduledAt": "2025-11-30T10:00:00Z",
  "dueDate": "2025-12-10T23:59:59Z",
  "storeName": "Sari-Sari Store"
}
```

**Purpose:** Track which notifications belong to which order so we can cancel them when paid.

---

## ⚙️ Store Settings

Store owners configure reminders in **Profile → Debt Settings**:

- `reminderDaysBefore`: 1, 2, 3, 5, or 7 days before due date
- `maxDaysUntilDue`: 7, 14, 30, 60, or 90 days payment deadline

**Example Configuration:**
```typescript
debtSettings: {
  allowDebt: true,
  debtLimit: 5000,              // ₱5,000 max per customer
  requirePreviousDebtPayment: false,
  maxDaysUntilDue: 30,          // 30 days to pay
  reminderDaysBefore: 3,        // Initial reminder 3 days before due
}
```

**Customer Experience:**
- Order placed on Dec 1st
- Due date: Dec 31st (30 days)
- Initial reminder: Dec 28th (3 days before)
- Final reminders: Dec 29th and Dec 30th
- Due date reminder: Dec 31st at 9:00 AM

---

## 🔍 Troubleshooting

### **Problem: Notifications not appearing**

**Check:**
1. Notification permissions granted?
   - Settings → TindaGo → Notifications → Allow
2. App has push token registered?
   - Firebase Console → Database → `users/{userId}/pushToken`
3. Reminders actually scheduled?
   - Use `DebtReminderScheduler.getScheduledReminders()` in console

### **Problem: Reminders not canceled when paid**

**Check:**
1. Look for error logs in console
2. Verify `localReminders/{orderId}` is deleted from Firebase
3. Check that `cancelReminders()` is being called (payment.tsx line 534)

### **Problem: Too many reminders**

**Fix:**
```typescript
// Cancel all reminders for current user
await DebtReminderScheduler.cancelAllReminders();
```

### **Problem: Wrong reminder timing**

**Check:**
1. Device time/timezone correct?
2. Store's `reminderDaysBefore` setting correct?
3. Order's due date correct?

---

## 🆚 Comparison: Cloud Functions vs Local Notifications

| Feature | Cloud Functions (Blaze) | Local Notifications (FREE) |
|---------|------------------------|---------------------------|
| **Cost** | $$$ (requires card) | FREE |
| **Setup** | Complex deployment | Instant (no setup) |
| **Reliability** | High (server-based) | Medium (device-based) |
| **Overdue reminders** | Yes (daily for 7 days) | No (stops at due date) |
| **Works if app uninstalled** | No notifications anyway | No notifications |
| **Internet required** | Only when checking | Not after scheduled |
| **Maintenance** | Server monitoring | None |

---

## 💡 Tips & Best Practices

### **For Store Owners:**

1. **Set appropriate due dates** - Don't make them too long (30 days is reasonable)
2. **Enable reminders** - Set `reminderDaysBefore` to 3 or 5 days
3. **Monitor debt payments** - Check debt records regularly

### **For Developers:**

1. **Test on real device** - Notifications behave differently on physical phones
2. **Handle edge cases** - App uninstall, permission denied, etc.
3. **Clear reminders on logout** - Call `cancelAllReminders()` in UserContext logout

### **For Customers:**

1. **Keep app installed** - Needed for reminders to work
2. **Allow notifications** - Grant permission when prompted
3. **Pay on time** - Avoid late fees and issues

---

## 📝 Summary

**What you get:**
- ✅ FREE debt reminders (no Cloud Functions)
- ✅ Works on Firebase Spark plan (free tier)
- ✅ Multi-stage reminder system
- ✅ Respects store settings
- ✅ Auto-cancels when paid
- ✅ Zero deployment or maintenance

**What you don't get:**
- ❌ Overdue reminders after due date
- ❌ Server-side reliability
- ❌ Works if app uninstalled

**Best for:**
- Apps on free Firebase plan
- No budget for server costs
- Customers who keep app installed

---

## 🎯 Next Steps

1. ✅ Test by placing a Pay Later order
2. ✅ Verify notifications are scheduled
3. ✅ Test payment and reminder cancellation
4. ⚠️ **Optional:** Add in-app reminder list to show upcoming payments
5. ⚠️ **Optional:** Add email reminders as backup (requires email service)

---

**Questions?** The code is self-contained and documented. Check:
- `src/services/notifications/DebtReminderScheduler.ts` for implementation
- Firebase Realtime Database `localReminders/` for scheduled reminders

**Need Cloud Function version?** See `DEBT_REMINDERS_IMPROVED.md` (requires Blaze plan).
