# 🚀 Testing Quick Reference

This document provides quick commands and references for testing the TindaGo payment system.

---

## 📋 Pre-Test Checklist

Before starting any test, ensure:

```powershell
# Run the status checker
.\check-test-status.ps1

# Or start all servers at once
.\start-test-servers.ps1
```

---

## 🎯 Quick Commands

### Start Admin Server
```powershell
cd C:\CapsProj\tindago-admin
npm run dev
# Wait for: "Ready on http://localhost:3000"
```

### Start Mobile App
```powershell
cd C:\CapsProj\TindaGo
npx expo start --clear
# Scan QR code with Expo Go app
```

### Check Running Servers
```powershell
# Check admin server (port 3000)
Get-NetTCPConnection -LocalPort 3000 -State Listen

# Check Expo server (port 8081)
Get-NetTCPConnection -LocalPort 8081 -State Listen
```

### Stop All Servers
```powershell
# Stop admin server
Stop-Process -Name "node" -Force

# Stop Expo
# Press Ctrl+C in the Expo terminal window
```

---

## 🔑 Test Credentials

### Xendit Test - GCash
- **Mobile:** `09171234567`
- **OTP:** `123456`

### Xendit Test - PayMaya
- **Email:** `test@paymaya.com`
- **Number:** `+639171234567`

---

## 🔍 Key Implementation Files

### Mobile App (TindaGo)
| File | Key Lines | Purpose |
|------|-----------|---------|
| `app/(main)/(customer)/payment.tsx` | 38 | Uses OrderCompleteModal (2 buttons) |
| | 302-323 | Real-time listener for payment status |
| | 413-421 | Processing state UI |
| | 388-390 | Disabled back button |
| `app/(main)/(customer)/order-details.tsx` | 19 | Uses OrderProcessCompleteModal (3 buttons) |
| | 102-106 | Shows modal on pickup/completed |

### Admin (tindago-admin)
| File | Key Lines | Purpose |
|------|-----------|---------|
| `src/app/api/webhooks/xendit/route.ts` | 51-59 | Payment method normalization |
| | 66-68 | Customer info handling |
| | 125-147 | Order update with normalized method |

---

## 🧪 Test Scenarios

### Scenario 1: GCash Payment (30 min)
1. Place order with 2+ items
2. Select GCash payment
3. **Verify:** "Waiting for payment..." screen appears
4. **Verify:** Back button is disabled
5. Complete payment in Xendit
6. **Verify:** Modal appears with 2 buttons (Track Store, Back to Home)
7. **Verify:** No "Give Feedback" button
8. Check Firebase: `paymentMethod = "gcash"` (NOT "EWALLET")

### Scenario 2: PayMaya Payment (30 min)
Same as Scenario 1, but use PayMaya

### Scenario 3: Order Pickup Flow (10 min)
1. Use existing paid order
2. In Firebase: Change status to "picked_up"
3. **Verify:** Different modal appears with 3 buttons
4. **Verify:** "Give Feedback Now" button present

### Scenario 4: Cash on Pickup (10 min)
1. Place order
2. Select "Cash on Pickup"
3. **Verify:** Modal appears immediately (no browser)
4. Check Firebase: `paymentMethod = "cash"`, `paymentStatus = "pending"`

---

## 🐛 Common Issues & Solutions

### Issue: Modal doesn't appear after payment

**Check:**
```
1. Console logs: Look for "[Payment] Payment confirmed!"
2. Firebase: Check if paymentStatus = "PAID"
3. Admin terminal: Check webhook logs
```

**Solution:**
- Verify `XENDIT_WEBHOOK_TOKEN` in `.env.local`
- Restart admin server
- Check Xendit webhook configuration

---

### Issue: Payment method shows "EWALLET"

**Check:**
```
Webhook code lines 51-59
Console log: payload.payment_channel
```

**Solution:**
- Ensure webhook receives `payment_channel` field
- Restart admin server
- Verify using latest code

---

### Issue: Back button still works during processing

**Check:**
```
payment.tsx lines 388-390
processing state should be true
```

**Solution:**
```typescript
<TouchableOpacity
  style={[styles.backButton, processing && styles.backButtonDisabled]}
  onPress={() => !processing && router.back()}
  disabled={processing}  // ✅ Must have this
>
```

---

### Issue: Customer info missing in ledger

**Check:**
```
Webhook lines 66-68
Invoice metadata includes customer info
```

**Solution:**
Verify invoice creation sends:
- customerEmail
- customerName  
- customerPhone

---

## 📊 Firebase Database Paths

### Orders
```
orders/{orderId}/
  ├─ orderNumber: "ORD-2025-001234"
  ├─ paymentStatus: "PAID" | "pending" | "REFUNDED"
  ├─ paymentMethod: "gcash" | "paymaya" | "cash"
  ├─ xenditInvoiceId: "XNDT-INV-..."
  └─ status: "pending" | "preparing" | "ready" | "picked_up"
```

### Ledgers
```
ledgers/stores/{storeId}/transactions/{invoiceId}/
  ├─ status: "PAID"
  ├─ method: "gcash" | "paymaya"
  ├─ customerName: "John Doe"
  ├─ customerEmail: "john@example.com"
  ├─ customerPhone: "+639123456789"
  └─ paidAt: "2025-01-15T..."
```

---

## 📱 Expected Console Logs

### During Payment:
```
Xendit invoice created: XNDT-INV-2025-001234
[Payment] Listener fired for orderId: -Oe8TE5MO...
[Payment] Order paymentStatus: pending
```

### After Payment Completes:
```
[Payment] Listener fired for orderId: -Oe8TE5MO...
[Payment] Order paymentStatus: PAID
[Payment] Payment confirmed! Showing modal...
```

### Admin Terminal (Webhook):
```
[Webhook] Received POST, token: present expected: set
[Webhook] Processing invoice: XNDT-INV-2025-001234 status: PAID
[Webhook] Normalizing payment method: PAYMAYA → paymaya
```

---

## 🎯 Success Indicators

### ✅ Payment Flow Working
- [ ] Modal appears automatically after payment
- [ ] Modal has correct 2 buttons (Track Store, Back to Home)
- [ ] Back button disabled during processing
- [ ] Real-time update works within 1-3 seconds

### ✅ Database Correct
- [ ] `paymentMethod` = "gcash" or "paymaya" (NOT "EWALLET")
- [ ] `paymentStatus` = "PAID"
- [ ] Customer info saved in ledger

### ✅ Display Correct
- [ ] Shows "GCash" or "PayMaya" with icon
- [ ] Admin dashboard shows colored badges
- [ ] Filters work correctly

### ✅ Pickup Flow Working
- [ ] Different modal appears on pickup
- [ ] 3 buttons present (including "Give Feedback")

---

## 📞 Useful Links

- **Firebase Console:** https://console.firebase.google.com
- **Admin Dashboard:** http://localhost:3000
- **Xendit Dashboard:** https://dashboard.xendit.co/
- **Test Guide:** `FINAL_TEST_GUIDE.md`
- **Test Results:** `TEST_EXECUTION_RESULTS.md`

---

## ⚡ Speed Testing Tips

1. **Use test mode:** Add `?test=true` to order-details URL for mock data
2. **Keep Firebase open:** Monitor real-time changes
3. **Use PowerShell scripts:** Automate server startup
4. **Take screenshots:** Document issues immediately
5. **Test in sequence:** GCash → PayMaya → Pickup → Cash

---

**⏰ Estimated Total Test Time: 90 minutes**

- Setup: 10 min
- Test 1 (GCash): 30 min
- Test 2 (PayMaya): 30 min  
- Test 3 (Pickup): 10 min
- Test 4 (Cash): 10 min
- Verification & Documentation: 10 min

---

**🎯 Remember:** Focus on the **critical test** in Step 3 - the "Waiting for payment confirmation..." screen with disabled back button is the key verification!
