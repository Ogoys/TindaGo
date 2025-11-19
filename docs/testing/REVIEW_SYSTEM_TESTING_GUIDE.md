# Review System Testing Guide - Real Data

**Date:** 2025-01-15  
**Purpose:** Step-by-step instructions to test the complete review system with real data

---

## 📋 Prerequisites Checklist

Before testing, ensure:

- [ ] Expo dev server is running (`npm start` or `npx expo start`)
- [ ] You have access to Firebase Console
- [ ] You have access to Cloudinary Dashboard
- [ ] You have at least 2 test accounts:
  - 1 Customer account
  - 1 Store Owner account
- [ ] At least 1 approved store exists
- [ ] Store has at least 1 product

---

## 🧪 Complete Testing Flow

### Phase 1: Setup & Preparation (5 minutes)

#### Step 1: Verify Cloudinary Configuration
```bash
# Check if Cloudinary env vars are set
# Open .env or app.config.js and verify:

EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET_IMAGES=your_upload_preset
```

**If missing:**
1. Go to https://cloudinary.com
2. Sign in to your account
3. Go to Settings → Upload
4. Create/note your upload preset name
5. Add to `.env` or `app.config.js`
6. Restart Expo dev server

#### Step 2: Open Firebase Console
1. Go to https://console.firebase.google.com
2. Select your project
3. Open **Realtime Database**
4. Keep this tab open for monitoring

#### Step 3: Open Cloudinary Dashboard
1. Go to https://cloudinary.com
2. Sign in
3. Go to **Media Library**
4. Keep this tab open to verify uploads

---

### Phase 2: Create Test Order (10 minutes)

#### Step 1: Login as Customer
```
1. Open TindaGo app
2. Sign in with customer account
3. Navigate to Home screen
```

#### Step 2: Place an Order
```
1. Browse stores or products
2. Add 2-3 products to cart
3. Proceed to checkout
4. Select payment method (e.g., Cash on Pickup)
5. Complete order
6. Note down the Order ID (e.g., ORD-2025-001234)
```

**Expected Result:**
- ✅ Order appears in Firebase under `orders/{orderId}`
- ✅ Order status: `pending`

#### Step 3: Process Order as Store Owner
```
1. Logout from customer account
2. Login as store owner
3. Navigate to Orders section
4. Find the test order
5. Update order status:
   - Tap "Accept Order" → Status: accepted
   - Tap "Prepare Order" → Status: preparing
   - Tap "Ready for Pickup" → Status: ready
   - Tap "Complete Order" → Status: completed
```

**Expected Result:**
- ✅ Order status changes in Firebase
- ✅ Customer can see status updates

---

### Phase 3: Submit Review (15 minutes)

#### Step 1: Access Review Screen

**Option A: Via Order Complete Modal (Automatic)**
```
1. As customer, when order status changes to "completed"
2. Order Complete Modal should appear automatically
3. Tap "Give Feedback Now"
```

**Option B: Via Order Details (Manual)**
```
1. As customer, go to Orders tab
2. Find completed order
3. Tap "Leave Review" button
4. (Or navigate directly: /(main)/(customer)/review?orderId=YOUR_ORDER_ID)
```

**Expected Result:**
- ✅ Review screen opens
- ✅ Store name and order number displayed
- ✅ Star rating section visible
- ✅ Comment text area visible
- ✅ Image upload section visible

#### Step 2: Fill Review Form - Without Images
```
Test 1: Basic Review (No Images)

1. Tap on stars to select rating (e.g., 5 stars)
2. Type comment in text area:
   "Excellent service! Fast preparation and friendly owner."
3. Do NOT add any images
4. Tap "Rate Now" button
```

**Expected Result:**
- ✅ Loading spinner appears briefly
- ✅ Success modal appears with "Thank you for your feedback!"
- ✅ Modal auto-dismisses after 3 seconds
- ✅ Navigates to home screen

**Verify in Firebase:**
```
Go to Firebase Console → Realtime Database → reviews/
Should see new review:
{
  "reviews": {
    "-ABC123XYZ": {
      "orderId": "ORD-2025-001234",
      "customerId": "customer_uid",
      "customerName": "Customer Name",
      "storeId": "store_uid",
      "storeName": "Store Name",
      "rating": 5,
      "comment": "Excellent service! Fast preparation...",
      "images": [],
      "createdAt": "2025-01-15T...",
      "updatedAt": "2025-01-15T..."
    }
  }
}
```

**Verify Order Updated:**
```
Go to orders/{orderId}
Should see:
{
  "hasReview": true,
  "reviewId": "-ABC123XYZ",
  "reviewedAt": "2025-01-15T...",
  "updatedAt": "2025-01-15T..."
}
```

**Verify Store Rating Updated:**
```
Go to stores/{storeId}
Should see:
{
  "rating": 5,          // Average of all reviews
  "totalReviews": 1,    // Count of reviews
  ... other fields
}
```

---

#### Step 3: Fill Review Form - With Images
```
Test 2: Review with Images

1. Place another test order (repeat Phase 2)
2. Complete the order
3. Go to review screen
4. Select 4 or 5 stars
5. Type comment: "Good quality products. See photos!"
6. Tap "Add Photo" button
7. Select 3 images from gallery
8. Verify thumbnails appear
9. Tap "Rate Now"
```

**Expected Result:**
- ✅ "Uploading images..." appears in console
- ✅ Each image uploads sequentially
- ✅ Loading takes a few seconds (depending on internet)
- ✅ Success modal appears
- ✅ Navigates to home

**Verify in Cloudinary:**
```
1. Go to Cloudinary Dashboard → Media Library
2. Navigate to folder: tindago/reviews/{customerId}/
3. Should see 3 uploaded images
4. Note the URLs (should start with https://res.cloudinary.com/...)
```

**Verify in Firebase:**
```
Go to reviews/{reviewId}
Should see:
{
  "images": [
    "https://res.cloudinary.com/your_cloud/image/upload/v1234567890/tindago/reviews/customer123/image1.jpg",
    "https://res.cloudinary.com/your_cloud/image/upload/v1234567890/tindago/reviews/customer123/image2.jpg",
    "https://res.cloudinary.com/your_cloud/image/upload/v1234567890/tindago/reviews/customer123/image3.jpg"
  ]
}
```

**Verify Store Rating Recalculated:**
```
Go to stores/{storeId}
If you had one 5-star and now one 4-star:
{
  "rating": 4.5,        // (5 + 4) / 2 = 4.5
  "totalReviews": 2
}
```

---

### Phase 4: View Reviews on Store Details (5 minutes)

#### Step 1: Navigate to Store Details
```
1. As customer (or any user)
2. Go to Home screen
3. Tap on a store that has reviews
4. Scroll down past products
```

**Expected Result:**
- ✅ Store rating displayed at top: "4.5 / 5.0 (2 reviews)"
- ✅ "Customer Reviews (2)" section appears
- ✅ Review cards displayed with:
  - Customer name
  - Star rating (⭐⭐⭐⭐⭐)
  - Comment text
  - Review images (if any) - scrollable horizontally
  - Review date

#### Step 2: Verify Review Images Load
```
1. Find a review with images
2. Images should display as thumbnails (80x80)
3. Scroll horizontally to see all images
4. Images should load from Cloudinary CDN
```

**Expected Result:**
- ✅ Images load quickly
- ✅ Images are optimized (Cloudinary auto-format)
- ✅ No broken image icons
- ✅ Smooth scrolling

---

### Phase 5: Edge Cases & Error Testing (10 minutes)

#### Test 1: Duplicate Review Prevention
```
1. Complete an order
2. Submit a review
3. Try to go back to review screen for same order
```

**Expected Result:**
- ✅ Review button disabled or hidden
- ✅ Shows "Already reviewed" message
- ✅ Cannot submit duplicate review

#### Test 2: Validation Errors
```
Test A: No Star Rating
1. Go to review screen
2. Type comment but do NOT select stars
3. Tap "Rate Now"
Expected: ✅ Alert: "Please select a star rating before submitting"

Test B: Empty Comment
1. Select 5 stars
2. Leave comment empty (or just spaces)
3. Tap "Rate Now"
Expected: ✅ Alert: "Please write a comment about your experience"

Test C: Image Limit
1. Try to add 4+ images
Expected: ✅ Alert: "You can only upload up to 3 images"
```

#### Test 3: Network Error Handling
```
1. Turn off Wi-Fi and mobile data
2. Fill review form with images
3. Tap "Rate Now"
Expected: ✅ Alert: "Network error. Please check your connection..."

4. Turn Wi-Fi/data back on
5. Try again
Expected: ✅ Review submits successfully
```

#### Test 4: Partial Image Upload Failure
```
(Advanced test - requires simulating Cloudinary failure)
Expected behavior:
- If 1 of 3 images fails → Review saves with 2 images
- User doesn't see error (graceful degradation)
- Console logs show which image failed
```

---

### Phase 6: Multiple Reviews & Rating Calculation (10 minutes)

#### Test Different Star Ratings
```
Create 5 test orders and complete them:

Order 1 → Review: 5 stars, "Perfect!"
Order 2 → Review: 4 stars, "Very good"
Order 3 → Review: 5 stars, "Excellent"
Order 4 → Review: 3 stars, "Good but could be better"
Order 5 → Review: 4 stars, "Satisfied"

Calculate expected average: (5+4+5+3+4) / 5 = 4.2
```

**Verify in Firebase:**
```
Go to stores/{storeId}
{
  "rating": 4.2,
  "totalReviews": 5
}
```

**Verify on Store Details Page:**
```
1. Navigate to store details
2. Should show: "4.2 / 5.0 (5 reviews)"
3. Scroll to reviews section
4. Should see all 5 reviews sorted by date (newest first)
```

---

## 🐛 Known Issues Checklist

If something doesn't work, check:

### Issue 1: Images Not Uploading
**Symptoms:** Loading forever, no success modal

**Debug:**
```
1. Check console logs for errors
2. Verify Cloudinary env vars are set
3. Check Cloudinary dashboard → Settings → Upload presets
4. Ensure upload preset is "unsigned" or has correct signing
5. Check internet connection
6. Try with smaller image files (<5MB)
```

**Fix:**
```
If env vars missing:
1. Add to .env or app.config.js
2. Restart Expo dev server (kill terminal, npm start)
3. Clear app cache: rm -rf .expo/
```

---

### Issue 2: Review Not Saving to Firebase
**Symptoms:** Success modal shows but no data in Firebase

**Debug:**
```
1. Check Firebase Console → Database → Rules
2. Ensure write permissions for authenticated users
3. Check console for permission errors
4. Verify user is logged in (check user context)
```

**Fix:**
```json
// Firebase Database Rules should include:
{
  "rules": {
    "reviews": {
      ".write": "auth != null",
      ".read": true
    }
  }
}
```

---

### Issue 3: Store Rating Not Updating
**Symptoms:** Review saves but store rating stays 0

**Debug:**
```
1. Check console logs after review submission
2. Look for "⭐ Updating store rating..."
3. Check if updateStoreRating() was called
4. Verify storeId exists in order data
```

**Fix:**
```
Verify in review.tsx line 195-199:
if (order?.storeId) {
  await updateStoreRating(order.storeId);
}
```

---

### Issue 4: Reviews Not Showing on Store Details
**Symptoms:** Store rating shows but no reviews list

**Debug:**
```
1. Check console logs on store-details page
2. Look for "💬 Reviews loaded: X"
3. Check if fetchStoreReviews() returns data
4. Verify reviews have correct storeId
```

**Fix:**
```
1. Go to Firebase → reviews/
2. Check each review has "storeId" field matching store
3. Run test query in Firebase Console:
   orderByChild('storeId').equalTo('your_store_id')
```

---

## 📊 Success Criteria

After completing all tests, you should have:

### ✅ Database State
- [ ] Multiple reviews in `reviews/` collection
- [ ] Each review has Cloudinary URLs (not local URIs)
- [ ] Orders have `hasReview: true` and `reviewId`
- [ ] Store has updated `rating` and `totalReviews`

### ✅ Cloudinary State
- [ ] Images visible in Media Library
- [ ] Images in folder: `tindago/reviews/{userId}/`
- [ ] Images load via HTTPS URLs

### ✅ App Functionality
- [ ] Review submission works with/without images
- [ ] Store rating displays correctly
- [ ] Reviews list shows on store details
- [ ] Review images display properly
- [ ] Validation prevents bad data
- [ ] Error messages are user-friendly

---

## 🎯 Quick Test Checklist

**Minimum Testing (5 minutes):**
1. [ ] Submit 1 review without images
2. [ ] Verify review appears in Firebase
3. [ ] Check store rating updated
4. [ ] View review on store details page

**Standard Testing (15 minutes):**
1. [ ] Submit 1 review without images
2. [ ] Submit 1 review with 3 images
3. [ ] Verify both in Firebase + Cloudinary
4. [ ] Check store rating calculated correctly
5. [ ] View reviews on store details page
6. [ ] Test 1 validation error (e.g., no stars)

**Complete Testing (45 minutes):**
- Follow entire guide from Phase 1-6
- Test all edge cases
- Verify all success criteria

---

## 📝 Test Data Template

Use this to document your tests:

```
Test Session: [Date/Time]
Tester: [Your Name]

Test Order IDs:
1. ORD-2025-_______ (5 stars, no images)
2. ORD-2025-_______ (4 stars, 3 images)
3. ORD-2025-_______ (3 stars, 1 image)

Review IDs Created:
1. -_______________ (linked to order 1)
2. -_______________ (linked to order 2)
3. -_______________ (linked to order 3)

Cloudinary Images:
- Folder checked: ✅ / ❌
- Images count: ___
- URLs working: ✅ / ❌

Store Rating:
- Before tests: ___
- After tests: ___
- Expected: ___
- Match: ✅ / ❌

Issues Found:
- [ ] None
- [ ] [Describe issue 1]
- [ ] [Describe issue 2]

Overall Result: PASS / FAIL
```

---

## 🚀 Ready to Test!

**Start with the Minimum Test** (5 minutes) to ensure basic functionality, then progress to more comprehensive testing.

**Remember:**
- Keep Firebase Console open to monitor real-time changes
- Keep Cloudinary Dashboard open to verify uploads
- Check console logs for detailed debugging info
- Take screenshots of any errors

**Good luck testing!** 🎉

---

**Last Updated:** 2025-01-15  
**Document Version:** 1.0
