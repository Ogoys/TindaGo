# Xendit Integration - Quick Start Checklist

Use this checklist to set up Xendit step-by-step. Check off each item as you complete it.

---

## 📋 **Setup Checklist (15 minutes)**

### **Phase 1: Account Setup (5 min)**

- [ ] **1.1** Go to https://dashboard.xendit.co/register
- [ ] **1.2** Sign up with your email
- [ ] **1.3** Verify email (check inbox)
- [ ] **1.4** Login to dashboard
- [ ] **1.5** Make sure **"Test Mode"** toggle is ON (green/blue)

### **Phase 2: Get API Keys (2 min)**

- [ ] **2.1** Click **"Settings"** in dashboard
- [ ] **2.2** Navigate to **"API Keys"**
- [ ] **2.3** Copy **TEST Secret Key** (starts with `xnd_development_`)
- [ ] **2.4** Copy **TEST Public Key** (if shown)
- [ ] **2.5** Save keys somewhere safe

### **Phase 3: Install Dependencies (3 min)**

Open terminal in TindaGo folder and run:

```bash
npm install xendit-node
npm install axios
```

- [ ] **3.1** Run `npm install xendit-node`
- [ ] **3.2** Run `npm install axios`
- [ ] **3.3** Wait for installation to complete (no errors)

### **Phase 4: Configure Environment (2 min)**

- [ ] **4.1** Open `.env` file in project root
- [ ] **4.2** Add these lines at the bottom:
  ```bash
  EXPO_PUBLIC_XENDIT_SECRET_KEY=xnd_development_YOUR_KEY_HERE
  EXPO_PUBLIC_XENDIT_PUBLIC_KEY=xnd_public_development_YOUR_KEY_HERE
  EXPO_PUBLIC_XENDIT_MODE=test
  EXPO_PUBLIC_PLATFORM_COMMISSION_RATE=0.01
  ```
- [ ] **4.3** Replace `YOUR_KEY_HERE` with your actual keys
- [ ] **4.4** Save file

### **Phase 5: Verify Files Created (1 min)**

- [ ] **5.1** File exists: `src/services/payment/XenditService.ts`
- [ ] **5.2** Payment screen updated: `app/(main)/(customer)/payment.tsx`
- [ ] **5.3** Order model updated: `src/models/Order.ts`
- [ ] **5.4** Testing guide exists: `XENDIT_TESTING_GUIDE.md`

### **Phase 6: Restart App (2 min)**

- [ ] **6.1** Stop Expo server (Ctrl+C in terminal)
- [ ] **6.2** Clear cache: `npx expo start --clear`
- [ ] **6.3** App loads without errors
- [ ] **6.4** Check console for "Xendit" related logs

---

## 🧪 **Testing Checklist (10 minutes)**

### **Test 1: GCash Payment**

- [ ] **T1.1** Add products to cart
- [ ] **T1.2** Go to payment screen
- [ ] **T1.3** Select **GCash** payment
- [ ] **T1.4** Click "Proceed to Checkout"
- [ ] **T1.5** Browser opens with Xendit invoice
- [ ] **T1.6** Complete test payment (use test credentials)
- [ ] **T1.7** Return to app
- [ ] **T1.8** Click "I Completed Payment"
- [ ] **T1.9** Success modal appears
- [ ] **T1.10** Order visible in Firebase

### **Test 2: PayMaya Payment**

- [ ] **T2.1** Add products to cart
- [ ] **T2.2** Select **PayMaya** payment
- [ ] **T2.3** Invoice created successfully
- [ ] **T2.4** Complete test payment
- [ ] **T2.5** Order confirmed

### **Test 3: Xendit Dashboard Verification**

- [ ] **T3.1** Go to https://dashboard.xendit.co
- [ ] **T3.2** Click "Invoices" section
- [ ] **T3.3** Find your test invoice
- [ ] **T3.4** Status shows "PAID"
- [ ] **T3.5** Platform Fee shows 1% commission
- [ ] **T3.6** Store Amount shows 99% of total

---

## 🎯 **Quick Test Commands**

```bash
# Start app with clear cache
npx expo start --clear

# Check if Xendit SDK installed
npm list xendit-node

# View environment variables
cat .env | grep XENDIT

# Restart and open on Android
npx expo start --clear --android

# Restart and open on iOS
npx expo start --clear --ios
```

---

## 📝 **Test Payment Credentials**

### **GCash Test:**
```
Phone: 09123456789
OTP: 123456
```

### **PayMaya Test:**
```
Card: 4000 0000 0000 0002
Expiry: 12/25
CVV: 123
```

---

## ✅ **Success Indicators**

You're done when you see:

✅ No errors in console about Xendit
✅ GCash payment works (invoice opens)
✅ PayMaya payment works (invoice opens)
✅ Browser opens payment page
✅ 1% commission calculated
✅ Invoice appears in Xendit dashboard
✅ Order saved to Firebase
✅ **Everything FREE in test mode!**

---

## 🐛 **Quick Troubleshooting**

| Problem | Solution |
|---------|----------|
| "Xendit not defined" error | Run `npm install xendit-node` |
| "Invalid API key" error | Check `.env` has correct key |
| Invoice doesn't open | Check internet connection |
| Can't find invoice in dashboard | Make sure Test Mode is ON |
| Commission not calculated | Check `EXPO_PUBLIC_PLATFORM_COMMISSION_RATE=0.01` |

---

## 📞 **Need Help?**

1. Check `XENDIT_TESTING_GUIDE.md` for detailed guide
2. Check console logs for errors
3. Verify all checklist items completed
4. Check Xendit docs: https://developers.xendit.co

---

**Setup Time:** ~15 minutes
**Testing Time:** ~10 minutes
**Total Time:** ~25 minutes

Let's go! 🚀
