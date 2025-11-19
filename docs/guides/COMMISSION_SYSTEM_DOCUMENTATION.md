# TindaGo Commission System Documentation

## Overview
TindaGo operates as a **commission-based marketplace** for sari-sari stores in the Philippines. The platform charges a **1% commission** on each order, with no subscription fees.

---

## 💰 Commission Model

### Commission Rate
- **Platform Commission:** 1% of order total
- **No Subscription Fees:** Store owners pay nothing to join
- **Per-Transaction Basis:** Commission only charged when sales happen

### Why 1%?
Based on Philippine sari-sari store economics:
- Average sari-sari store profit margin: **10-20%**
- Average order: **₱500 - ₱1,000**
- Daily sales: **₱1,000 - ₱3,000**

**1% is fair because:**
- Store keeps **99% of sales** (vs 95% with 5% commission)
- Minimal impact on thin profit margins
- Competitive with other Philippine e-commerce platforms
- Sustainable for platform growth

---

## 📊 Money Flow Example

### Example Order: ₱500

**What Customer Sees:**
```
┌─────────────────────────────┐
│  ORDER RECEIPT              │
├─────────────────────────────┤
│  Subtotal:        ₱ 500.00  │
│  TOTAL:           ₱ 500.00  │  ← Customer pays this
└─────────────────────────────┘

❌ NO tax line shown (sari-sari stores include tax in prices)
❌ NO commission shown (hidden from customer)
```

**Behind the Scenes (Xendit Automatic Split):**
```
Customer Payment:     ₱ 500.00

Xendit Auto-Split:
├─ Platform Fee (1%): ₱   5.00  → Admin Wallet
└─ Store Owner Gets:  ₱ 495.00  → Store Wallet

Commission deducted automatically by Xendit!
```

**Store Owner Sees (in Wallet):**
```
┌─────────────────────────────┐
│  TRANSACTION BREAKDOWN      │
├─────────────────────────────┤
│  Order Total:     ₱ 500.00  │
│  Platform Fee:    ₱   5.00  │  ← Store sees commission
│  Net Earnings:    ₱ 495.00  │  ← Store receives
└─────────────────────────────┘
```

---

## 🎯 Tax System (Option 1 - IMPLEMENTED)

### No Tax Line in Receipt

**Why?**
- Most sari-sari stores have annual sales < ₱3,000,000
- Under Philippine law, they are **NOT required to collect VAT**
- Tax options for non-VAT stores:
  - **3% Percentage Tax** + Graduated Income Tax
  - **8% Flat Income Tax** (optional for sole proprietors)
- Sari-sari stores typically include tax in their product prices already

**What This Means:**
- Customer sees: **Subtotal = Total** (no tax added at checkout)
- Store owner handles BIR tax filing separately
- Matches how real sari-sari stores operate

---

## 📋 Alternative Tax System (Option 2 - SAVED FOR FUTURE)

### 3% Percentage Tax (Optional Feature)

For stores that want to show tax explicitly:

```typescript
// payment.tsx - OPTIONAL IMPLEMENTATION
const percentageTax = subtotal * 0.03;  // 3% for non-VAT stores
const total = subtotal + percentageTax;
```

**Customer Would See:**
```
┌─────────────────────────────┐
│  Subtotal:        ₱ 100.00  │
│  Percentage Tax:  ₱   3.00  │
├─────────────────────────────┤
│  TOTAL:           ₱ 103.00  │
└─────────────────────────────┘
```

**When to Implement:**
- If store owners request explicit tax display
- If BIR requires separate tax line for compliance
- If professors want to see tax calculation in capstone

**How to Enable:**
1. Add `showPercentageTax: boolean` to store settings
2. Calculate tax only if `store.showPercentageTax === true`
3. Display tax row conditionally in UI

---

## 🔧 Xendit Integration (How Commission Works)

### Sandbox Mode (For Capstone - FREE)

**Test Mode Features:**
```bash
✅ Unlimited test transactions (FREE!)
✅ Test GCash/PayMaya payments
✅ Commission splitting simulated
✅ No real money involved
✅ No gateway fees charged
```

**Test Mode Money Flow:**
```
Customer pays ₱100 (fake test transaction)
├─ Platform commission (1%): ₱1.00 → Admin wallet (simulated)
├─ Xendit gateway fee: ₱0.00 (NO FEE IN TEST MODE!)
└─ Store owner receives: ₱99.00 (simulated)

TOTAL COST: ₱0.00 (Completely FREE for capstone!)
```

### Production Mode (If Launching Commercially)

**Real Money Flow:**
```
Customer pays ₱100 (real money via GCash/PayMaya)
├─ Platform commission (1%): ₱1.00 → Your admin wallet
├─ Xendit gateway fee (3.5%): ₱3.50 → Xendit (your cost)
└─ Store owner receives: ₱95.50

Your NET: ₱1.00 - ₱3.50 = -₱2.50 LOSS per transaction
```

**Note:** In production, 1% commission would result in losses due to gateway fees. You would need to:
- Increase commission to 3-5% to cover costs + profit
- OR negotiate lower gateway fees with Xendit
- OR use different pricing model for large stores

**For Capstone: 1% is perfect since test mode is FREE!**

---

## 💻 Code Implementation

### Order Creation with 1% Commission

```typescript
// app/(main)/(customer)/payment.tsx

// Customer sees this:
const orderSummary = {
  subtotal: 500,
  discount: 0,
  grandTotal: 500,  // No tax added
};

// Order data sent to Firebase
const orderData = {
  subtotal: 500,
  total: 500,
  // Commission is NOT stored in order (handled by Xendit)
};

// Xendit automatically deducts 1% commission
// Store owner receives ₱495 in their wallet
// Admin receives ₱5 in admin wallet
```

### Xendit Commission Setup

```typescript
// When integrating Xendit (future implementation)
const xendit = new Xendit({ secretKey: 'xnd_test_...' });

const invoice = await xendit.invoice.createInvoice({
  amount: 500,  // Customer pays ₱500

  // THIS DEDUCTS 1% COMMISSION AUTOMATICALLY!
  fees: [{
    type: 'PLATFORM_FEE',
    value: 5  // ₱5 = 1% of ₱500
  }],

  // Customer invoice shows just total (no commission)
  items: [{ name: 'Products', price: 500 }]
});

// Result:
// - Customer sees invoice for ₱500
// - Xendit transfers ₱495 to store owner
// - Xendit transfers ₱5 to admin
// - All automatic, no manual calculation needed!
```

---

## 📈 Revenue Projections

### Monthly Example (100 orders)

**With 1% Commission:**
```
Orders: 100/month
Average: ₱500/order
Total Sales: ₱50,000

Your Commission: ₱500 (1% of ₱50,000)

IN TEST MODE:
Gateway Fees: ₱0 (FREE!)
NET PROFIT: ₱500

IN PRODUCTION:
Gateway Fees: ₱1,750 (3.5% of ₱50,000)
NET PROFIT: -₱1,250 (LOSS!)
```

**Conclusion:**
- 1% works perfectly for **capstone demo** (test mode)
- For **real business**, need 3-5% commission to be profitable

---

## 🎓 For Capstone Evaluation

### What to Show Professors

**1. Customer Experience:**
- Simple checkout (no confusing tax lines)
- Clear total = what customer pays
- Multiple payment methods (GCash, PayMaya, Cash)

**2. Store Owner Experience:**
- Transparent commission breakdown in wallet
- See earnings after platform fee
- Track transaction history

**3. Admin Dashboard:**
- View total commission earned
- Commission per transaction
- Monthly revenue reports

**4. Technical Implementation:**
- Real payment gateway integration (Xendit sandbox)
- Automatic commission splitting
- Firebase real-time order tracking
- No subscription model, purely commission-based

---

## 📚 Related Documentation

- See `firebase-database-structure.md` for wallet schema
- See `CLAUDE.md` for order management system
- See Xendit docs: https://developers.xendit.co/api-reference/

---

## 🔄 Future Enhancements

### Option 2: Percentage Tax System
If needed, implement 3% percentage tax:
1. Add `showPercentageTax` setting to store model
2. Calculate 3% tax at checkout if enabled
3. Display tax row in UI conditionally
4. Store owner handles BIR filing

### VAT System (for stores > ₱3M annual sales)
If store crosses VAT threshold:
1. Store registers for VAT with BIR
2. Platform enables 12% VAT calculation
3. Store collects VAT from customers
4. Store remits VAT to BIR quarterly

### Dynamic Commission Tiers
Adjust commission based on store volume:
- Small stores (< 100 orders/month): 1%
- Medium stores (100-500 orders/month): 2%
- Large stores (> 500 orders/month): 3%

---

**Last Updated:** January 2025
**Commission Rate:** 1% (for capstone demo)
**Tax System:** Option 1 (No tax line in receipt)
