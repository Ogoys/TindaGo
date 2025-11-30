# 🔔 Improved Debt Payment Reminder System

## 📊 What's Implemented

### ✅ **COMPLETED IMPROVEMENTS:**

1. **Smart Multi-Stage Reminders** - Respects store's `reminderDaysBefore` setting
2. **Daily Reminder Logic** - Sends daily reminders when debt is due soon or overdue
3. **Duplicate Prevention** - Tracks last sent date to avoid spam
4. **Push Notification Auto-Registration** - Users automatically registered when they log in
5. **Flexible Store Settings** - Each store controls their reminder timing

---

## 🎯 How It Works

### **Reminder Schedule (3 Stages)**

#### **STAGE 1: Initial Reminder** 🔔
- **When:** X days before due date (based on store's `reminderDaysBefore` setting)
- **Who configures:** Store owner in Debt Settings (1, 2, 3, 5, or 7 days)
- **Message:** "Your Pay Later balance from [Store] is due in X days. Due: [Date]"
- **Frequency:** Once only

#### **STAGE 2: Final Reminders** ⚠️
- **When:** Daily when within 2 days of due date
- **Example:** If due on Dec 10th, daily reminders on Dec 8th and 9th
- **Message:** "Your Pay Later debt from [Store] is due in X days! Please pay now."
- **Frequency:** Daily (maximum 2 reminders)

#### **STAGE 3: Overdue Reminders** 🚨
- **When:** Daily for up to 7 days after due date
- **Message:** "Your Pay Later debt from [Store] is X days overdue. Please pay immediately!"
- **Frequency:** Daily (maximum 7 reminders)
- **Auto-stops:** After 7 days overdue (prevent excessive notifications)

---

## 🎨 User Experience

### **For Customers:**

1. **Order Placed with "Pay Later"**
   - Customer receives immediate confirmation notification
   - Due date is set based on store's `maxDaysUntilDue` setting

2. **Initial Reminder (e.g., 3 days before)**
   - Push notification appears on their phone
   - Reminds them of upcoming payment

3. **Final Reminders (2 days before & 1 day before)**
   - Daily push notifications
   - More urgent tone

4. **Overdue Reminders (if unpaid)**
   - Daily urgent notifications
   - Stops after 7 days

5. **When Paid**
   - All reminders automatically stop
   - No further notifications

### **For Store Owners:**

Configure reminders in **Profile → Debt Settings**:
- `reminderDaysBefore`: Choose 1, 2, 3, 5, or 7 days before due date
- `maxDaysUntilDue`: Choose 7, 14, 30, 60, or 90 days payment deadline

---

## 🔧 Technical Implementation

### **Cloud Function: `sendDailyDebtReminders`**

**Schedule:** Runs daily at 9:00 AM Manila time

**Process:**
1. Fetches all unpaid "Pay Later" orders from Firebase
2. For each order:
   - Calculates days until due date
   - Fetches store's `debtSettings.reminderDaysBefore`
   - Checks if reminder was already sent today (prevents duplicates)
   - Determines reminder stage (initial, final, or overdue)
   - Sends push notification if applicable
   - Records reminder in `debtReminders/{orderId}` with timestamp

**Database Structure:**

```
debtReminders/
  {orderId}/
    lastSent: "2025-11-30" (YYYY-MM-DD)
    lastReminderType: "initial" | "final" | "overdue"
    lastSentAt: "2025-11-30T09:00:00Z" (ISO string)
    daysUntilDue: -2 (negative = overdue)
```

### **Push Token Registration**

**When:** Automatically when user logs in (UserContext)

**Process:**
1. User logs into app
2. `NotificationService.setupPushNotifications()` is called
3. Requests notification permissions from user
4. Gets Expo Push Token from device
5. Saves token to Firebase: `users/{userId}/pushToken`

**Code Location:** `src/contexts/UserContext.tsx` (lines 43-57)

### **Reminder Creation (Optional)**

The system **no longer requires** manual reminder creation when orders are placed. The Cloud Function automatically detects and processes all Pay Later orders daily.

**What was removed:**
- Old `scheduledReminders/{orderId}` creation in `payment.tsx` (lines 783-804)

**What happens now:**
- Cloud Function scans all orders daily
- Automatically sends reminders based on due date and store settings
- Simpler, more reliable approach

---

## 🧪 Testing Guide

### **Test Scenario 1: Initial Reminder**

1. **Setup:**
   - Store has `reminderDaysBefore: 3` (3 days before)
   - Customer places Pay Later order due on Dec 13th at 9:00 AM

2. **Expected Behavior:**
   - Dec 10th at 9:00 AM → Customer receives "Payment reminder - due in 3 days"
   - Dec 11th → No notification (only one initial reminder)

### **Test Scenario 2: Final Reminders**

1. **Setup:**
   - Order due on Dec 13th

2. **Expected Behavior:**
   - Dec 11th at 9:00 AM → "Payment due in 2 days! Please pay now."
   - Dec 12th at 9:00 AM → "Payment due in 1 day! Please pay now."

### **Test Scenario 3: Overdue Reminders**

1. **Setup:**
   - Order due on Dec 10th (unpaid)

2. **Expected Behavior:**
   - Dec 11th → "Payment 1 day overdue. Please pay immediately!"
   - Dec 12th → "Payment 2 days overdue. Please pay immediately!"
   - ...continues daily until Dec 17th (7 days overdue)
   - Dec 18th → No more notifications (stops at 7 days)

### **Test Scenario 4: Payment Stops Reminders**

1. **Setup:**
   - Order due on Dec 13th
   - Customer pays on Dec 11th

2. **Expected Behavior:**
   - Dec 11th morning → Final reminder sent
   - Customer pays during the day
   - Dec 12th morning → No notification (order marked as PAID)

### **Quick Test (Development)**

To test reminders immediately:

1. **Create a test order:**
   ```typescript
   // Set due date to tomorrow
   dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
   ```

2. **Temporarily change Cloud Function schedule:**
   ```typescript
   // In functions/src/index.ts, line 230
   // Change from "every day 09:00" to "every 5 minutes"
   export const sendDailyDebtReminders = onSchedule(
     { schedule: 'every 5 minutes', timeZone: 'Asia/Manila' },
     // ...
   ```

3. **Deploy and test:**
   ```bash
   firebase deploy --only functions
   # Wait 5 minutes, check if notification arrives
   ```

4. **Restore production schedule** after testing!

---

## 📱 Where Customers See Notifications

### **1. Push Notifications (Outside App)** 📲
- Lock screen
- Notification center
- Banner notifications

### **2. Pay Later Screen (In-App)** 💳
- Shows due date prominently
- Days remaining until due
- "Overdue" badge if late
- Direct "Pay Now" button

### **3. Optional: In-App Notification Center** 🔔
- Could add notification bell icon in header
- Shows notification history
- Badge with unread count
- (Not yet implemented, but documented in original guide)

---

## ⚙️ Configuration for Store Owners

### **Debt Settings Screen**
Location: `Profile → Debt Settings`

**Available Options:**

1. **Allow Debt Payments** (Toggle)
   - Enable/disable Pay Later for store

2. **Debt Limit per Customer** (Number)
   - Maximum amount a customer can owe
   - 0 = no limit

3. **Require Previous Payment** (Toggle)
   - Customer must pay existing debt before new purchases

4. **Maximum Due Date** (Select)
   - Options: 7, 14, 30, 60, 90 days
   - Maximum payment deadline customers can set

5. **Payment Reminder** (Select)
   - Options: 1, 2, 3, 5, 7 days before due date
   - When to send initial reminder

**Example Configuration:**
```typescript
debtSettings: {
  allowDebt: true,
  debtLimit: 5000,              // ₱5,000 max per customer
  requirePreviousDebtPayment: false,
  maxDaysUntilDue: 30,          // 30 days to pay
  reminderDaysBefore: 3,        // Reminder 3 days before due
}
```

**Customer Experience with Above Settings:**
- Customer can owe up to ₱5,000
- Has 30 days to pay from order date
- Receives reminder 27 days after order (3 days before due)
- Daily reminders when within 2 days of due date
- Daily overdue reminders if unpaid (up to 7 days)

---

## 🚀 Deployment Checklist

### **Before Deploying:**

- [ ] Push notification setup in UserContext ✅ (DONE)
- [ ] Cloud Function improved with multi-stage logic ✅ (DONE)
- [ ] Store debt settings UI complete ✅ (ALREADY EXISTS)
- [ ] `expo-notifications` package installed ✅ (ALREADY INSTALLED)
- [ ] Firebase Cloud Messaging configured (check with user)

### **Deploy Steps:**

1. **Deploy Cloud Functions:**
   ```bash
   cd functions
   npm install
   firebase deploy --only functions
   ```

2. **Verify Deployment:**
   - Check Firebase Console → Functions
   - `sendDailyDebtReminders` should show schedule: "every day 09:00"

3. **Test Push Notifications:**
   - Login to app as customer
   - Check Firebase Console → Database → `users/{userId}/pushToken`
   - Should see Expo push token saved

4. **Monitor Logs:**
   ```bash
   firebase functions:log --only sendDailyDebtReminders
   ```

---

## 📊 Benefits of This Approach

### **Compared to Previous Implementation:**

| Feature | Old Approach | New Approach |
|---------|-------------|--------------|
| Reminder frequency | One-time only | Multi-stage (3 stages) |
| Store control | Hardcoded 3 days | Respects store settings |
| Overdue handling | None | Daily reminders up to 7 days |
| Duplicate prevention | None | Tracks last sent date |
| Maintenance | Manual scheduledReminders | Automatic daily scan |
| Flexibility | Fixed schedule | Adapts to each order |

### **Key Advantages:**

1. **Better UX:** Customers get timely reminders without spam
2. **Store Control:** Each store sets their own reminder timing
3. **Reliability:** Daily scan ensures no reminders are missed
4. **Scalability:** No manual reminder creation needed
5. **Smart Logic:** Adapts reminder urgency based on due date proximity

---

## 🔍 Troubleshooting

### **Problem: Customer not receiving notifications**

**Check:**
1. Push token registered?
   - Firebase Console → `users/{userId}/pushToken` exists?
2. Notification permissions granted?
   - Check device settings
3. Push token valid?
   - Expo tokens expire, may need re-registration
4. Cloud Function running?
   - Check Firebase Console → Functions → Logs

### **Problem: Too many/duplicate notifications**

**Check:**
1. `debtReminders/{orderId}/lastSent` is being updated?
2. Cloud Function not running multiple times per day?
3. Correct timezone (Asia/Manila)?

### **Problem: Reminders not respecting store settings**

**Check:**
1. Store has `debtSettings` in Firebase?
   - `stores/{storeId}/debtSettings/reminderDaysBefore`
2. Default to 3 days if missing
3. Cloud Function fetching correct store settings?

---

## 📝 Summary

**What you asked:** Should we follow the debt-settings implementation?

**Answer:** ✅ **YES!** The improved system now:
- **Respects** each store's `reminderDaysBefore` setting (1-7 days)
- **Adds** daily reminders when payment is due soon (within 2 days)
- **Adds** daily reminders for overdue debts (up to 7 days)
- **Prevents** spam by tracking last sent date
- **Automatically** stops when customer pays

**Notification Frequency:**
- Initial reminder: **Once** (at store's configured days before due date)
- Final reminders: **Daily** (when within 2 days of due date)
- Overdue reminders: **Daily** (up to 7 days after due date)

**Best Practice:** This balanced approach keeps customers informed without overwhelming them with notifications.

---

## 🎯 Next Steps

1. **Deploy the Cloud Function** (`firebase deploy --only functions`)
2. **Test with a real Pay Later order**
3. **Optional:** Add in-app notification center (bell icon in header)
4. **Optional:** Add email reminders (in addition to push)
5. **Monitor:** Check Firebase Functions logs daily for any errors

---

**Questions?** Check the Firebase Console logs or review this documentation.
