# Modal Types - When to Use Which Modal

## 🎯 Overview

There are **TWO DIFFERENT MODALS** in the TindaGo app for different stages of the order process.

---

## 📋 Modal Types

### 1️⃣ **OrderCompleteModal** - After Payment
**File**: `src/components/ui/OrderCompleteModal.tsx`

**When**: Shows immediately after customer **completes payment** in Xendit

**Used In**: `app/(main)/(customer)/payment.tsx`

**What it shows**:
```
┌─────────────────────────────────────┐
│   ✅ Thank you for your order!      │
│                                     │
│   Your order has been placed        │
│   successfully. Your order ID is    │
│   #ORD-2025-001234                  │
│                                     │
│   [Track Store]                     │
│   [Back to Home]                    │
└─────────────────────────────────────┘
```

**Buttons**:
- ✅ **Track Store** → Go to track-store screen to see order progress
- ✅ **Back to Home** → Return to customer home

**Why no feedback button?**
- Order just placed, store hasn't prepared it yet
- Customer hasn't received anything yet
- Too early to give feedback!

---

### 2️⃣ **OrderProcessCompleteModal** - After Pickup
**File**: `src/components/ui/OrderProcessCompleteModal.tsx`

**When**: Shows when order status becomes **"picked_up"** or **"completed"**

**Used In**: `app/(main)/(customer)/order-details.tsx`

**What it shows**:
```
┌─────────────────────────────────────┐
│   🎉 Order Process Complete!        │
│                                     │
│   Thank you for your order!         │
│   We hope you enjoyed our service.  │
│                                     │
│   [Track Store]                     │
│   [Give Feedback Now]               │
│   [Back to Home]                    │
└─────────────────────────────────────┘
```

**Buttons**:
- ✅ **Track Store** → Still can track the store
- ✅ **Give Feedback Now** → Rate and review the order (NOW it makes sense!)
- ✅ **Back to Home** → Return to customer home

**Why feedback button NOW?**
- Customer has RECEIVED the order
- They picked it up from the store
- Now they can rate their experience!

---

## 🔄 Complete Order Journey

### Stage 1: Payment ✅ (Just Implemented)
```
Customer → Pays in Xendit → OrderCompleteModal appears
                             ├─ Track Store (see progress)
                             └─ Back to Home
```

**Status**: `pending` → `preparing`

---

### Stage 2: Store Preparing 🛍️
```
Customer → Can track order in track-store screen
           (See: preparing → ready → picked_up)
```

**Status**: `preparing` → `ready`

---

### Stage 3: Pickup Complete 🎉
```
Customer → Picks up order → OrderProcessCompleteModal appears
                             ├─ Track Store (still available)
                             ├─ Give Feedback (⭐⭐⭐⭐⭐)
                             └─ Back to Home
```

**Status**: `picked_up` or `completed`

---

## 📱 Where Each Modal is Used

| Screen | Modal Type | Trigger | Buttons |
|--------|-----------|---------|---------|
| **payment.tsx** | `OrderCompleteModal` | Payment confirmed (`paymentStatus = 'PAID'`) | Track Store, Back to Home |
| **order-details.tsx** | `OrderProcessCompleteModal` | Order picked up (`status = 'picked_up'`) | Track Store, Give Feedback, Back to Home |

---

## ✅ Correct Implementation

### Payment Screen (Lines 38, 500)
```typescript
// ✅ CORRECT
import { OrderCompleteModal } from '../../../src/components/ui/OrderCompleteModal';

<OrderCompleteModal
  visible={showSuccessModal}
  onClose={() => setShowSuccessModal(false)}
  orderId={completedOrderId}
/>
```

### Order Details Screen (Lines 19, 413)
```typescript
// ✅ CORRECT
import { OrderProcessCompleteModal } from '../../../src/components/ui';

<OrderProcessCompleteModal
  visible={showCompleteModal}
  onClose={() => setShowCompleteModal(false)}
  orderId={order.id}
/>
```

---

## ❌ Common Mistakes

### Mistake #1: Wrong Modal After Payment
```typescript
// ❌ WRONG - Don't use this after payment!
import { OrderProcessCompleteModal } from '...';

// Shows "Give Feedback" too early
// Customer hasn't received order yet!
```

### Mistake #2: Wrong Modal After Pickup
```typescript
// ❌ WRONG - Don't use this after pickup!
import { OrderCompleteModal } from '...';

// Missing "Give Feedback" button
// Customer can't rate their experience!
```

---

## 🎯 User Experience Flow

### Right After Payment:
```
Customer thinking: 
"I just paid. Now I want to track when it's ready."

✅ Show: OrderCompleteModal
   - Track Store ✓
   - Back to Home ✓
   - Give Feedback ✗ (too early!)
```

### After Picking Up Order:
```
Customer thinking: 
"I got my order! It was great (or not). Let me rate it."

✅ Show: OrderProcessCompleteModal
   - Track Store ✓ (maybe check store for next time)
   - Give Feedback ✓ (perfect timing!)
   - Back to Home ✓
```

---

## 🧪 Testing

### Test OrderCompleteModal (Payment)
1. Place order as customer
2. Complete payment in Xendit
3. ✅ Should see "Thank you for your order!"
4. ✅ Should see 2 buttons: Track Store, Back to Home
5. ❌ Should NOT see "Give Feedback" button

### Test OrderProcessCompleteModal (Pickup)
1. Order status → `preparing` → `ready` → `picked_up`
2. Go to order-details screen
3. ✅ Should see "Order Process Complete!"
4. ✅ Should see 3 buttons: Track Store, Give Feedback, Back to Home
5. ✅ Can tap "Give Feedback" to rate order

---

## 📝 Summary

- **Payment Complete** = `OrderCompleteModal` (2 buttons)
  - Just paid, track progress
  - No feedback yet - haven't received order!

- **Order Complete** = `OrderProcessCompleteModal` (3 buttons)
  - Already picked up, can rate experience
  - Feedback makes sense now!

**Simple Rule**: 
- Paid but not picked up? → `OrderCompleteModal`
- Picked up and done? → `OrderProcessCompleteModal`

---

**Status**: ✅ Correctly Implemented  
**Date**: 2025-01-15
