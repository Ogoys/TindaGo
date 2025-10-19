# Order Complete Modal - Integration Flow Diagram

## Complete User Journey

```
┌──────────────────────────────────────────────────────────────────────┐
│                      USER PAYMENT FLOW                                │
└──────────────────────────────────────────────────────────────────────┘

1. CART SCREEN
   ┌─────────────────┐
   │   Shopping Cart │
   │   - Item 1      │
   │   - Item 2      │
   │   - Item 3      │
   └────────┬────────┘
            │
            │ Tap "Checkout"
            │
            ▼
2. PAYMENT SCREEN
   ┌─────────────────┐
   │  Order Summary  │
   │  ───────────    │
   │  Items: 3       │
   │  Subtotal: ₱500 │
   │  Service: ₱25   │
   │  Total: ₱525    │
   │                 │
   │  Payment:       │
   │  ○ GCash        │
   │  ○ PayMaya      │
   │  ● Cash         │ ← User selects
   │                 │
   │  ┌───────────┐  │
   │  │ Checkout  │  │ ← User taps
   │  └───────────┘  │
   └────────┬────────┘
            │
            │ handleProceedToCheckout()
            │
            ▼
3. PROCESSING
   ┌─────────────────┐
   │   Processing    │
   │   ●  ●  ●       │ ← Loading indicator
   │                 │
   │ 1. Validate     │
   │ 2. Create Order │
   │ 3. Save to DB   │
   │ 4. Clear Cart   │
   │ 5. Generate ID  │
   └────────┬────────┘
            │
            │ Success!
            │
            ▼
4. ORDER COMPLETE MODAL
   ┌─────────────────────────┐
   │                         │
   │        ✓ Icon           │ ← 180×180px green checkmark
   │                         │
   │  Thank you for your     │
   │      order!             │
   │                         │
   │ Your order has been     │
   │ placed successfully.    │
   │ order ID is #ORD-123    │ ← Dynamic order ID
   │                         │
   │  ┌──────────────────┐   │
   │  │  Track Order     │   │ ← Option 1
   │  └──────────────────┘   │
   │                         │
   │  ┌──────────────────┐   │
   │  │  Back to Home    │   │ ← Option 2
   │  └──────────────────┘   │
   │                         │
   └─────────┬───────────────┘
             │
             │ User chooses:
             │
    ┌────────┴────────┐
    │                 │
    ▼                 ▼
OPTION A           OPTION B
┌────────┐      ┌──────────┐
│ Track  │      │   Home   │
│ Order  │      │  Screen  │
└────────┘      └──────────┘
```

## Technical Implementation Flow

```
┌──────────────────────────────────────────────────────────────────────┐
│                    COMPONENT LIFECYCLE                                │
└──────────────────────────────────────────────────────────────────────┘

PAYMENT SCREEN (payment.tsx)
│
├── STATE INITIALIZATION
│   ├── const [orderCompleteVisible, setOrderCompleteVisible] = useState(false)
│   └── const [completedOrderId, setCompletedOrderId] = useState('')
│
├── USER INTERACTION
│   └── handleProceedToCheckout() called
│       │
│       ├── Validate payment method selected
│       │   └── if (!selectedPayment) → Show error
│       │
│       ├── Validate user authenticated
│       │   └── if (!user) → Redirect to signin
│       │
│       └── Process payment
│           │
│           └── if (selectedPayment === 'cash')
│               │
│               ├── Generate Order ID
│               │   └── const orderId = `ORD-${year}-${timestamp}`
│               │
│               ├── Build Order Data
│               │   ├── userId
│               │   ├── items (from cart)
│               │   ├── totals (subtotal, fees, grand total)
│               │   ├── paymentMethod: 'cash'
│               │   ├── status: 'pending'
│               │   └── createdAt: timestamp
│               │
│               ├── Save to Firebase
│               │   └── await push(ref(database, 'orders'), orderData)
│               │
│               ├── Clear Cart
│               │   └── await remove(ref(database, `carts/${userId}`))
│               │
│               └── Show Modal
│                   ├── setCompletedOrderId(orderId)
│                   └── setOrderCompleteVisible(true) ◄─┐
│                                                        │
└────────────────────────────────────────────────────────┤
                                                         │
ORDER COMPLETE MODAL (OrderCompleteModal.tsx)           │
│                                                        │
├── PROPS RECEIVED ◄────────────────────────────────────┘
│   ├── visible: true
│   ├── onClose: () => setOrderCompleteVisible(false)
│   └── orderId: "ORD-2024-123456789"
│
├── COMPONENT MOUNT
│   ├── Initialize animation refs
│   │   ├── fadeAnim = new Animated.Value(0)
│   │   └── scaleAnim = new Animated.Value(0.8)
│   │
│   └── useEffect triggered (visible = true)
│       └── Start entrance animation
│           ├── Fade: 0 → 1 (300ms)
│           └── Scale: 0.8 → 1.0 (spring)
│
├── RENDER MODAL
│   ├── <Modal visible={true} transparent>
│   │   │
│   │   ├── Backdrop (full screen, dismissable)
│   │   │   │
│   │   │   └── <Pressable onPress={handleBackdropPress}>
│   │   │       └── Calls onClose() → visible = false
│   │   │
│   │   └── <Animated.View> (fade + scale applied)
│   │       │
│   │       └── Modal Content (400×500px white card)
│   │           │
│   │           ├── Icon (180×180px, approved-icon.png)
│   │           │
│   │           ├── Text: "Thank you for your order!"
│   │           │
│   │           ├── Text: "...order ID is #{orderId}"
│   │           │
│   │           ├── <Pressable onPress={handleTrackOrder}>
│   │           │   └── "Track Order" button
│   │           │       ├── Calls onClose()
│   │           │       └── router.push('/order-details?id=...')
│   │           │
│   │           └── <Pressable onPress={handleBackToHome}>
│   │               └── "Back to Home" button
│   │                   ├── Calls onClose()
│   │                   └── router.push('/home')
│   │
│   └── </Modal>
│
├── USER INTERACTION
│   │
│   ├── Option 1: Tap "Track Order"
│   │   ├── handleTrackOrder() called
│   │   ├── onClose() → setOrderCompleteVisible(false)
│   │   ├── useEffect (visible = false) → Exit animation
│   │   └── router.push with orderId parameter
│   │
│   ├── Option 2: Tap "Back to Home"
│   │   ├── handleBackToHome() called
│   │   ├── onClose() → setOrderCompleteVisible(false)
│   │   ├── useEffect (visible = false) → Exit animation
│   │   └── router.push to home screen
│   │
│   └── Option 3: Tap Backdrop
│       ├── handleBackdropPress() called
│       ├── onClose() → setOrderCompleteVisible(false)
│       └── useEffect (visible = false) → Exit animation
│
└── COMPONENT UNMOUNT/CLEANUP
    ├── Exit animation (200ms)
    │   ├── Fade: 1 → 0
    │   └── Scale: 1.0 → 0.8
    │
    └── Animation refs cleaned up (useEffect return)
```

## State Transition Diagram

```
┌──────────────────────────────────────────────────────────────────────┐
│                     MODAL STATE MACHINE                               │
└──────────────────────────────────────────────────────────────────────┘

                        ┌──────────────┐
                        │   INITIAL    │
                        │ visible=false│
                        └──────┬───────┘
                               │
                               │ Order placed successfully
                               │ setOrderCompleteVisible(true)
                               │
                        ┌──────▼───────┐
                        │  ANIMATING   │
                        │     IN       │
                        │  (300ms)     │
                        └──────┬───────┘
                               │
                               │ Animation complete
                               │
                        ┌──────▼───────┐
        ┌───────────────┤   VISIBLE    │◄──────────────┐
        │               │  (Interactive)│               │
        │               └──────┬───────┘               │
        │                      │                        │
        │                      │ User action:          │
        │                      │                        │
        │        ┌─────────────┼─────────────┐         │
        │        │             │             │         │
        │        │             │             │         │
        │   ┌────▼────┐   ┌────▼────┐   ┌────▼────┐  │
        │   │ Backdrop│   │  Track  │   │  Home   │  │
        │   │  Press  │   │  Order  │   │  Button │  │
        │   └────┬────┘   └────┬────┘   └────┬────┘  │
        │        │             │             │         │
        │        │             │             │         │
        │        └─────────────┼─────────────┘         │
        │                      │                        │
        │                      │ onClose() called      │
        │                      │                        │
        │               ┌──────▼───────┐               │
        │               │  ANIMATING   │               │
        │               │     OUT      │               │
        │               │  (200ms)     │               │
        │               └──────┬───────┘               │
        │                      │                        │
        │                      │ Animation complete    │
        │                      │                        │
        │               ┌──────▼───────┐               │
        │               │    HIDDEN    │               │
        │               │ visible=false│               │
        │               └──────┬───────┘               │
        │                      │                        │
        │                      │ (If navigation)       │
        │                      │                        │
        │               ┌──────▼───────┐               │
        │               │  NAVIGATED   │               │
        │               │  TO TARGET   │               │
        │               │   SCREEN     │               │
        │               └──────────────┘               │
        │                                               │
        └───────────────────────────────────────────────┘
                        (Modal can be shown again)
```

## Firebase Data Flow

```
┌──────────────────────────────────────────────────────────────────────┐
│                    FIREBASE OPERATIONS                                │
└──────────────────────────────────────────────────────────────────────┘

1. READ CART DATA
   ┌─────────────────────────────────────┐
   │  Firebase: carts/{userId}/items     │
   │  {                                  │
   │    item1: { name, price, qty },     │
   │    item2: { name, price, qty },     │
   │    item3: { name, price, qty }      │
   │  }                                  │
   └──────────────┬──────────────────────┘
                  │
                  │ get(cartRef)
                  │
                  ▼
2. CALCULATE TOTALS
   ┌─────────────────────────────────────┐
   │  subtotal = sum(item.price × qty)   │
   │  serviceFee = subtotal × 0.05       │
   │  discount = calculateDiscount()     │
   │  grandTotal = subtotal + fee - disc │
   └──────────────┬──────────────────────┘
                  │
                  │
                  ▼
3. CREATE ORDER
   ┌─────────────────────────────────────┐
   │  Firebase: orders/{generatedId}     │
   │  {                                  │
   │    userId: "user123",               │
   │    orderId: "ORD-2024-1729...",     │
   │    items: [...cartItems],           │
   │    subtotal: 500,                   │
   │    serviceFee: 25,                  │
   │    discount: 0,                     │
   │    grandTotal: 525,                 │
   │    paymentMethod: "cash",           │
   │    status: "pending",               │
   │    createdAt: 1729584000000         │
   │  }                                  │
   └──────────────┬──────────────────────┘
                  │
                  │ push(ordersRef, orderData)
                  │
                  ▼
4. CLEAR CART
   ┌─────────────────────────────────────┐
   │  Firebase: carts/{userId}/items     │
   │  DELETE                             │
   └──────────────┬──────────────────────┘
                  │
                  │ remove(cartRef)
                  │
                  ▼
5. SHOW SUCCESS
   ┌─────────────────────────────────────┐
   │  OrderCompleteModal                 │
   │  orderId: "ORD-2024-1729584000000"  │
   └─────────────────────────────────────┘
```

## Navigation Flow

```
┌──────────────────────────────────────────────────────────────────────┐
│                    NAVIGATION ROUTES                                  │
└──────────────────────────────────────────────────────────────────────┘

                    ┌──────────────────┐
                    │  Payment Screen  │
                    │  (current)       │
                    └────────┬─────────┘
                             │
                             │ Order placed
                             │
                    ┌────────▼─────────┐
                    │  Modal Appears   │
                    │  (overlay)       │
                    └────────┬─────────┘
                             │
                             │ User chooses:
                             │
                ┌────────────┴────────────┐
                │                         │
       ┌────────▼────────┐       ┌────────▼────────┐
       │  Track Order    │       │  Back to Home   │
       │  Button Tap     │       │  Button Tap     │
       └────────┬────────┘       └────────┬────────┘
                │                         │
                │ router.push()           │ router.push()
                │                         │
    ┌───────────▼──────────┐  ┌──────────▼───────────┐
    │  Order Details       │  │  Customer Home       │
    │  Screen              │  │  Screen              │
    │                      │  │                      │
    │  Route:              │  │  Route:              │
    │  /(main)/(customer)/ │  │  /(main)/(customer)/ │
    │  orders/             │  │  home                │
    │  order-details       │  │                      │
    │                      │  │                      │
    │  Params:             │  │  Back to shopping    │
    │  ?orderId=ORD-...    │  │  experience          │
    └──────────────────────┘  └──────────────────────┘

App Route Structure:
app/
├── (main)/
│   ├── (customer)/
│   │   ├── home.tsx ◄────────────────┐
│   │   ├── payment.tsx               │ (Back to Home)
│   │   └── orders/                   │
│   │       └── order-details.tsx ◄───┤
│   │           (needs creation)      │ (Track Order)
│   └── ...                           │
└── ...                               │
                                      │
OrderCompleteModal.tsx ───────────────┘
(navigates to both)
```

## Animation Timeline

```
┌──────────────────────────────────────────────────────────────────────┐
│                   ANIMATION TIMELINE                                  │
└──────────────────────────────────────────────────────────────────────┘

ENTRANCE (300ms total)
═══════════════════════════════════════════════════════════════════════

0ms    │ visible = true
       │ ▼ Trigger animations
       │
       │ Backdrop
       │ ═════════════════════════════════════════════════════
       │ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ (opacity: 0 → 1)
       │
       │ Modal Content (Fade)
       │ ═════════════════════════════════════════════════════
       │ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ (opacity: 0 → 1)
       │
       │ Modal Content (Scale Spring)
       │ ═════════════════════════════════════════════════════
       │ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ (scale: 0.8 → 1.0)
       │                                       ↑
       │                                       Spring bounce
100ms  │ ─────────────────────────────────────────────────────
       │
200ms  │ ─────────────────────────────────────────────────────
       │
300ms  │ ─────────────────────────────────────────────────────
       │ Animation complete
       │ User can interact
       ▼

EXIT (200ms total)
═══════════════════════════════════════════════════════════════════════

0ms    │ onClose() called
       │ ▼ Trigger exit animations
       │
       │ Modal Content (Fade)
       │ ═════════════════════════════════════════════════════
       │ ░░░░░░░░░░░░░░░░░░░░ (opacity: 1 → 0)
       │
       │ Modal Content (Scale)
       │ ═════════════════════════════════════════════════════
       │ ░░░░░░░░░░░░░░░░░░░░ (scale: 1.0 → 0.8)
       │
       │ Backdrop
       │ ═════════════════════════════════════════════════════
       │ ░░░░░░░░░░░░░░░░░░░░ (opacity: 1 → 0)
       │
100ms  │ ─────────────────────────────────────────────────────
       │
200ms  │ ─────────────────────────────────────────────────────
       │ Animation complete
       │ Modal hidden
       │ Navigation triggered (if applicable)
       ▼
```

## Error Handling Flow

```
┌──────────────────────────────────────────────────────────────────────┐
│                    ERROR SCENARIOS                                    │
└──────────────────────────────────────────────────────────────────────┘

handleProceedToCheckout()
│
├── Check 1: Payment method selected?
│   ├── NO → Alert: "Select Payment Method"
│   │       └── Stay on payment screen
│   └── YES → Continue
│
├── Check 2: User authenticated?
│   ├── NO → Alert: "Please sign in"
│   │       └── router.push('/signin')
│   └── YES → Continue
│
├── Try: Create order
│   │
│   ├── Firebase Error
│   │   ├── Catch error
│   │   ├── Log: console.error()
│   │   ├── Alert: "Failed to process payment"
│   │   └── setProcessing(false)
│   │       └── Stay on payment screen
│   │
│   └── Success
│       └── Show OrderCompleteModal
│
└── Finally: setProcessing(false)

OrderCompleteModal
│
├── Try: Navigate to order details
│   │
│   ├── Route doesn't exist
│   │   └── (expo-router handles gracefully)
│   │
│   └── Success
│       └── Show order details screen
│
└── Try: Navigate to home
    │
    ├── Route doesn't exist
    │   └── (expo-router handles gracefully)
    │
    └── Success
        └── Show home screen
```

---

## Summary

This comprehensive flow diagram shows:

1. **User Journey**: From cart to order confirmation
2. **Technical Flow**: Component lifecycle and state management
3. **State Machine**: Modal visibility states and transitions
4. **Firebase Operations**: Data reads, writes, and deletions
5. **Navigation**: Route structure and navigation paths
6. **Animations**: Entrance and exit animation timelines
7. **Error Handling**: Validation and error recovery flows

All flows are interconnected to provide a complete picture of how the OrderCompleteModal integrates with the payment system.
