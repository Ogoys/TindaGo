# Order Tracking and Review System - Complete Implementation Guide

**Version:** 1.0  
**Date:** 2025-01-14  
**Status:** Design Complete - Ready for Implementation

---

## 📋 Table of Contents
1. [Overview](#overview)
2. [User Flow](#user-flow)
3. [Screen Details](#screen-details)
4. [Technical Architecture](#technical-architecture)
5. [Implementation Steps](#implementation-steps)
6. [Database Schema](#database-schema)
7. [API Requirements](#api-requirements)

---

## 🎯 Overview

This system implements a complete order tracking, navigation, and review flow that guides customers from payment completion to leaving feedback. The flow includes:

1. **Order Complete Screen** - Payment confirmation with "Track Store" button
2. **Track Store Screen** - Real-time map with route and order status
3. **Order Tracking Screen** - Detailed order view with invoice access
4. **Invoice Screen** - Detailed bill breakdown
5. **Order Complete Modal** - Feedback prompt
6. **Review Screen** - Rating and review submission
7. **Review Success Modal** - Confirmation and home navigation

---

## 🔄 User Flow

```
Payment Complete (Xendit)
         ↓
[Order Complete Screen]
  - Shows order confirmation
  - Payment success message
  - "Track Store" button
         ↓
[Track Store Screen]
  - Map with customer & store pins
  - Route visualization
  - "Show Route" button
  - "Navigate" button
  - Order status timeline below
  - "Order View Details" button
         ↓
[Order Tracking Screen]
  - Same as order-details.tsx
  - Order status timeline
  - Bill card with items
  - "View Invoice" button
  - Payment method display
         ↓
[Invoice Screen]
  - Complete itemized bill
  - Product list with quantities
  - Subtotals and taxes
  - Grand total
         ↓
[When Order Completed by Store]
         ↓
[Order Complete Modal]
  - "Your order is complete!" message
  - "Give Feedback Now" button
  - "Later" option
         ↓
[Review Screen]
  - Star rating (1-5 stars)
  - Comment text area
  - Image upload option
  - "Rate Now" button
  - "Back to Home" button
         ↓
[Review Success Modal]
  - "Thank you for your feedback!"
  - "Back to Home" button
         ↓
[Customer Home Screen]
```

---

## 📱 Screen Details

### 1. Order Complete Screen
**Figma:** Not linked yet  
**Route:** `/(main)/(customer)/order-complete`  
**Trigger:** After successful Xendit payment

#### Components:
- Success icon/animation
- Order confirmation message
- Order number display
- Payment confirmation
- **"Track Store" button** (primary action)
- "View Order Details" button (secondary)

#### State Management:
```typescript
interface OrderCompleteState {
  orderId: string;
  orderNumber: string;
  paymentStatus: 'PAID' | 'SETTLED';
  total: number;
  storeName: string;
  storeId: string;
}
```

---

### 2. Track Store Screen
**Figma:** https://www.figma.com/design/8I1Nr3vQZllDDknSevstvH/TindaGo-Share?node-id=1428-1585&m=dev  
**Route:** `/(main)/(customer)/track-store?orderId={orderId}`  
**Components:**

#### Top Section - Map (Similar to stores-map.tsx)
- **Map View:**
  - Customer location pin (blue dot)
  - Store location pin (red marker)
  - Route polyline between locations
  - Auto-zoom to show both pins

- **Action Buttons (2x2 grid):**
  - **Show Route** (blue) - Displays route polyline
  - **Navigate** (blue) - Opens Google Maps navigation
  - **View Products** (green) - Goes to store products
  - **Set as My Store** (green) - Saves store as favorite

#### Bottom Section - Order Status Timeline
- Same timeline as order-details.tsx:
  - Order Placed
  - Preparing Your Order
  - Ready for Pickup
  - Order Completed
- Each step shows timestamp
- Active/completed states with green checkmarks

#### Bottom Fixed Button:
- **"Order View Details"** button - navigates to Order Tracking screen

#### State Management:
```typescript
interface TrackStoreState {
  orderId: string;
  order: Order;
  customerLocation: {
    latitude: number;
    longitude: number;
  };
  storeLocation: {
    latitude: number;
    longitude: number;
  };
  routeCoordinates: LatLng[];
  showRoute: boolean;
}
```

---

### 3. Order Tracking Screen
**Figma:** https://www.figma.com/design/8I1Nr3vQZllDDknSevstvH/TindaGo-Share?node-id=1428-1668&m=dev  
**Route:** `/(main)/(customer)/order-tracking?orderId={orderId}`  
**Same as:** `order-details.tsx`

#### Components:
1. **Header:**
   - Back button
   - "Order Tracking" title
   - Notification icon

2. **Order Info:**
   - Order ID
   - Payment status badge (Paid/Pending)
   - Store name

3. **Status Timeline Card:**
   - 4-step progress indicator
   - Real-time status updates
   - Timestamps for each step

4. **Bill Card:**
   - Item count
   - Subtotal
   - Dashed divider
   - Grand Total
   - **"View Invoice" link** (underlined, teal color)

5. **Payment Method Card:**
   - Payment method label
   - Icon (Cash/GCash/PayMaya)
   - Method name

#### View Invoice Action:
- When clicked, navigates to Invoice Screen
- Passes order data via route params

---

### 4. Invoice Screen
**Figma:** https://www.figma.com/design/8I1Nr3vQZllDDknSevstvH/TindaGo-Share?node-id=1428-1813&m=dev  
**Route:** `/(main)/(customer)/invoice?orderId={orderId}`

#### Components:
1. **Header:**
   - Back button
   - "Invoice" title
   - Download/Share icon

2. **Invoice Details:**
   - Invoice number
   - Order date
   - Store information

3. **Product List:**
   - Each item row:
     - Product name
     - Quantity × Unit price
     - Subtotal
   - Scrollable list

4. **Totals Section:**
   - Subtotal
   - Service fee (if any)
   - Discount (if any)
   - Dashed divider
   - **Grand Total** (highlighted)

5. **Payment Information:**
   - Payment method
   - Payment status
   - Transaction ID

6. **Footer:**
   - Thank you message
   - Store contact info

#### State Management:
```typescript
interface InvoiceState {
  orderId: string;
  invoiceNumber: string;
  orderDate: string;
  storeName: string;
  storeAddress: string;
  items: InvoiceItem[];
  subtotal: number;
  serviceFee: number;
  discount: number;
  total: number;
  paymentMethod: string;
  paymentStatus: string;
  transactionId: string;
}

interface InvoiceItem {
  productName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}
```

---

### 5. Order Complete Modal
**Figma:** https://www.figma.com/design/8I1Nr3vQZllDDknSevstvH/TindaGo-Share?node-id=1428-1563&m=dev  
**Trigger:** When store owner marks order as "completed" (picked up)  
**Type:** Modal overlay

#### Components:
- **Icon:** Checkmark or celebration animation
- **Title:** "Your order is complete!"
- **Message:** "Thank you for shopping with us. How was your experience?"
- **Primary Button:** "Give Feedback Now" (green)
- **Secondary Button:** "Later" (gray/outline)

#### Behavior:
- Appears automatically when order status changes to "picked_up"
- Can be dismissed with "Later" button
- "Give Feedback Now" navigates to Review Screen
- Modal can be shown again later from order history

#### State Management:
```typescript
interface OrderCompleteModalProps {
  visible: boolean;
  orderId: string;
  storeName: string;
  onFeedbackPress: () => void;
  onLaterPress: () => void;
}
```

---

### 6. Review Screen (Give Feedback)
**Figma:** https://www.figma.com/design/8I1Nr3vQZllDDknSevstvH/TindaGo-Share?node-id=1428-1773&m=dev  
**Route:** `/(main)/(customer)/review?orderId={orderId}`

#### Components:

1. **Header:**
   - Back button
   - "Review" title

2. **Store Information:**
   - Store logo
   - Store name
   - Order number reference

3. **Star Rating Section:**
   - Label: "How would you rate your experience?"
   - 5-star rating component (interactive)
   - Stars change color on tap (gray → gold)
   - Can select 1-5 stars

4. **Comment Section:**
   - Label: "Share your thoughts"
   - Multiline text area
   - Placeholder: "Tell us about your experience..."
   - Character count (optional, e.g., 0/500)

5. **Image Upload Section:**
   - Label: "Add photos (optional)"
   - Image picker button with camera icon
   - Preview of selected images (thumbnail grid)
   - Up to 3 images allowed
   - Remove image option (X button on thumbnails)

6. **Action Buttons:**
   - **"Rate Now"** (primary, green) - Submits review
   - **"Back to Home"** (secondary, outline) - Cancel and go home

#### Validation:
- Star rating is required (1-5 stars)
- Comment is optional but recommended
- Images are optional
- Show error if no rating selected

#### State Management:
```typescript
interface ReviewState {
  orderId: string;
  storeId: string;
  storeName: string;
  rating: number; // 1-5
  comment: string;
  images: string[]; // URIs of selected images
  submitting: boolean;
}

interface ReviewSubmission {
  orderId: string;
  storeId: string;
  customerId: string;
  rating: number;
  comment: string;
  images: string[]; // Uploaded image URLs
  createdAt: string;
}
```

---

### 7. Review Success Modal
**Figma:** https://www.figma.com/design/8I1Nr3vQZllDDknSevstvH/TindaGo-Share?node-id=1439-184&m=dev  
**Trigger:** After successful review submission  
**Type:** Modal overlay

#### Components:
- **Icon:** Success checkmark or star animation
- **Title:** "Thank you for your feedback!"
- **Message:** "Your review helps us improve our service"
- **Button:** "Back to Home" (primary, green)

#### Behavior:
- Appears after successful review submission
- Auto-dismisses after 3 seconds OR
- User taps "Back to Home"
- Navigates to customer home screen
- Cannot be dismissed by tapping outside

---

## 🏗️ Technical Architecture

### File Structure

```
app/
├── (main)/
│   ├── (customer)/
│   │   ├── order-complete.tsx          # NEW - Payment success screen
│   │   ├── track-store.tsx             # NEW - Map + order tracking
│   │   ├── order-tracking.tsx          # NEW - Copy of order-details.tsx
│   │   ├── invoice.tsx                 # NEW - Detailed invoice view
│   │   └── review.tsx                  # NEW - Review submission
│   └── shared/
│       └── order-details.tsx           # EXISTING - Reference for order-tracking
│
src/
├── components/
│   ├── modals/
│   │   ├── OrderCompleteModal.tsx      # NEW - Order complete prompt
│   │   └── ReviewSuccessModal.tsx      # NEW - Review thank you
│   ├── tracking/
│   │   ├── OrderTimeline.tsx           # NEW - Reusable timeline
│   │   ├── TrackingMap.tsx             # NEW - Map with route
│   │   └── MapActionButtons.tsx        # NEW - Show Route, Navigate buttons
│   └── review/
│       ├── StarRating.tsx              # NEW - 5-star rating component
│       ├── ImagePicker.tsx             # NEW - Photo upload component
│       └── ReviewForm.tsx              # NEW - Complete review form
│
├── services/
│   ├── tracking.ts                     # NEW - Order tracking service
│   ├── review.ts                       # NEW - Review submission service
│   └── invoice.ts                      # NEW - Invoice generation service
│
└── models/
    ├── Review.ts                       # NEW - Review interface
    └── Invoice.ts                      # NEW - Invoice interface
```

---

## 💾 Database Schema

### Firebase Realtime Database Structure

```json
{
  "reviews": {
    "{reviewId}": {
      "orderId": "ORD-2025-xxx",
      "storeId": "store123",
      "customerId": "cust456",
      "customerName": "Juan Dela Cruz",
      "rating": 5,
      "comment": "Great service!",
      "images": [
        "https://storage.com/review1.jpg",
        "https://storage.com/review2.jpg"
      ],
      "createdAt": "2025-01-14T10:30:00Z",
      "status": "published"
    }
  },
  
  "orders": {
    "{orderId}": {
      // ... existing order fields ...
      "hasReview": false,
      "reviewId": null,
      "completedAt": "2025-01-14T10:00:00Z"
    }
  },
  
  "stores": {
    "{storeId}": {
      // ... existing store fields ...
      "rating": 4.5,
      "totalReviews": 120,
      "reviews": {
        "{reviewId}": true
      }
    }
  }
}
```

---

## 🔧 Implementation Steps

### Phase 1: Order Complete Screen (2-3 hours)
1. Create `order-complete.tsx` screen
2. Add payment success animation
3. Implement "Track Store" button
4. Connect to Xendit webhook for payment status
5. Test payment flow completion

### Phase 2: Track Store Screen (4-6 hours)
1. Create `track-store.tsx` with map view
2. Implement TrackingMap component
3. Add route polyline drawing
4. Create MapActionButtons (2x2 grid)
5. Integrate with Google Maps navigation
6. Add order status timeline below map
7. Implement "Order View Details" button
8. Test real-time location updates

### Phase 3: Order Tracking & Invoice (3-4 hours)
1. Create `order-tracking.tsx` (copy from order-details.tsx)
2. Create `invoice.tsx` screen
3. Implement "View Invoice" button action
4. Add invoice generation logic
5. Style invoice for print/download
6. Test invoice data accuracy

### Phase 4: Order Complete Modal (1-2 hours)
1. Create `OrderCompleteModal.tsx` component
2. Add order completion detection
3. Implement modal trigger logic
4. Add "Give Feedback Now" action
5. Add "Later" dismiss option
6. Test modal appearance timing

### Phase 5: Review Screen (4-5 hours)
1. Create `review.tsx` screen
2. Implement StarRating component
3. Create ImagePicker component
4. Build comment text area
5. Add image upload to Firebase Storage
6. Implement review submission
7. Add validation logic
8. Test complete review flow

### Phase 6: Review Success Modal (1 hour)
1. Create `ReviewSuccessModal.tsx` component
2. Add success animation
3. Implement navigation to home
4. Test modal appearance and dismissal

### Phase 7: Integration & Testing (2-3 hours)
1. Connect all screens in flow
2. Test complete user journey
3. Handle edge cases
4. Add error handling
5. Performance optimization
6. User acceptance testing

**Total Estimated Time:** 17-24 hours

---

## 📡 API Requirements

### 1. Order Tracking API
```typescript
// Get real-time order updates
const trackOrder = (orderId: string) => {
  const orderRef = ref(database, `orders/${orderId}`);
  return onValue(orderRef, (snapshot) => {
    const order = snapshot.val();
    // Update UI with order status
  });
};
```

### 2. Review Submission API
```typescript
interface SubmitReviewParams {
  orderId: string;
  storeId: string;
  customerId: string;
  rating: number;
  comment: string;
  images: File[];
}

const submitReview = async (params: SubmitReviewParams) => {
  // 1. Upload images to Firebase Storage
  const imageUrls = await uploadReviewImages(params.images);
  
  // 2. Create review in database
  const reviewId = await createReview({
    ...params,
    images: imageUrls,
  });
  
  // 3. Update order with review reference
  await updateOrder(params.orderId, {
    hasReview: true,
    reviewId,
  });
  
  // 4. Update store rating
  await updateStoreRating(params.storeId, params.rating);
  
  return reviewId;
};
```

### 3. Invoice Generation API
```typescript
const generateInvoice = async (orderId: string) => {
  const order = await getOrder(orderId);
  const invoiceNumber = `INV-${Date.now()}`;
  
  return {
    invoiceNumber,
    orderId: order.id,
    orderNumber: order.orderNumber,
    date: order.completedAt,
    store: order.storeName,
    items: order.items,
    subtotal: order.subtotal,
    total: order.total,
    paymentMethod: order.paymentMethod,
  };
};
```

---

## 🎨 Design Guidelines

### Colors
- **Primary Green:** `#3BB77E`
- **Success Green:** `#34C759`
- **Error Red:** `#E92B45`
- **Rating Gold:** `#FFD700`
- **Navigation Blue:** `#0066FF`
- **Text Primary:** `#1E1E1E`
- **Text Secondary:** `rgba(30, 30, 30, 0.5)`

### Typography
- **Font Family:** Clash Grotesk Variable
- **Headers:** 20-24px, weight 600
- **Body:** 14-16px, weight 400-500
- **Small Text:** 12px, weight 400

### Spacing
- **Card Padding:** 20px
- **Section Margin:** 20-30px
- **Button Height:** 50px
- **Border Radius:** 20px

---

## ✅ Testing Checklist

### Functionality
- [ ] Payment complete triggers order-complete screen
- [ ] Track Store button navigates correctly
- [ ] Map shows customer and store locations
- [ ] Route displays between locations
- [ ] Navigate button opens Google Maps
- [ ] Order status updates in real-time
- [ ] View Invoice shows complete bill
- [ ] Order complete modal appears on status change
- [ ] Star rating is interactive (1-5 stars)
- [ ] Image picker allows up to 3 images
- [ ] Review submission saves to database
- [ ] Store rating updates after review
- [ ] Success modal appears after submission
- [ ] Back to home navigation works

### Edge Cases
- [ ] No internet connection handling
- [ ] Invalid order ID handling
- [ ] Location permission denied
- [ ] Image upload failure
- [ ] Review submission error
- [ ] Modal dismissal behavior
- [ ] Order already reviewed
- [ ] Store no longer active

### Performance
- [ ] Map loads quickly
- [ ] Route rendering is smooth
- [ ] Image upload doesn't block UI
- [ ] Real-time updates don't lag
- [ ] Modal animations are smooth

---

## 📝 Notes for Implementation

1. **Reusability:**
   - Extract OrderTimeline into reusable component
   - Use same component in track-store and order-tracking
   - Share map logic with stores-map.tsx

2. **State Management:**
   - Use React Context for order tracking state
   - Implement real-time listeners for order updates
   - Clean up listeners on unmount

3. **Navigation:**
   - Use proper route params for orderId
   - Implement back navigation correctly
   - Handle deep linking to specific orders

4. **Offline Support:**
   - Cache order data locally
   - Queue review submissions
   - Show offline indicators

5. **Accessibility:**
   - Add proper labels for screen readers
   - Ensure star rating is keyboard accessible
   - Provide text alternatives for icons

---

## 🚀 Future Enhancements

1. **Push Notifications:**
   - Notify when order status changes
   - Remind to leave review after 24 hours

2. **Review Moderation:**
   - Admin review approval system
   - Report inappropriate reviews
   - Edit/delete reviews

3. **Advanced Analytics:**
   - Track review submission rate
   - Monitor average ratings per store
   - Analyze review sentiment

4. **Social Features:**
   - Share reviews on social media
   - Upvote helpful reviews
   - Reply to reviews (store owner)

---

## 📚 References

- **Figma Designs:** https://www.figma.com/design/8I1Nr3vQZllDDknSevstvH/TindaGo-Share
- **Existing Code:** `app/(main)/(customer)/order-details.tsx`
- **Map Reference:** `app/(main)/(customer)/stores-map.tsx`
- **Firebase Docs:** https://firebase.google.com/docs
- **React Native Maps:** https://github.com/react-native-maps/react-native-maps

---

**Document Status:** Ready for Implementation  
**Last Updated:** 2025-01-14  
**Maintained By:** Development Team
