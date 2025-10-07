# TindaGo Firebase Realtime Database - Actual Implementation Structure

## Database Structure Based on Current Codebase

This document reflects the **actual** Firebase Realtime Database structure as implemented in the TindaGo codebase, extracted from the live application code.

Last Updated: 2025-10-07

---

## Complete Database Schema

```json
{
  "users": {
    "firebase_auth_uid": {
      "uid": "firebase_auth_uid",
      "name": "User Full Name",
      "email": "user@example.com",
      "userType": "customer" | "store_owner",
      "createdAt": { ".sv": "timestamp" },
      "updatedAt": { ".sv": "timestamp" },
      "emailVerified": false,
      "profile": {
        "avatar": null | "base64_image_string",
        "phone": null | "+639123456789",
        "address": null | "Complete Address",
        "storeDetailsComplete": true,          // store_owner only
        "documentsComplete": true,            // store_owner only
        "bankDetailsComplete": true,          // store_owner only
        "businessComplete": true              // store_owner only
      },
      "preferences": {
        "notifications": true,
        "theme": "light"
      }
    }
  },

  "store_registrations": {
    "firebase_auth_uid": {
      "personalInfo": {
        "name": "Owner Full Name",
        "email": "owner@example.com",
        "mobile": "+639123456789"
      },
      "businessInfo": {
        "storeName": "Sari-Sari Store Name",
        "description": "Store description text",
        "address": "Complete Store Address",
        "city": "Manila",
        "zipCode": "1000",
        "businessType": "Sari-Sari Store",
        "logo": "data:image/jpeg;base64,{base64_string}",
        "coverImage": "data:image/jpeg;base64,{base64_string}"
      },
      "documents": {
        "barangayBusinessClearance": {
          "name": "barangay_clearance.pdf",
          "uri": "data:application/pdf;base64,{base64_string}",
          "type": "application/pdf",
          "uploaded": true,
          "uploadedAt": { ".sv": "timestamp" }
        },
        "businessPermit": {
          "name": "business_permit.pdf",
          "uri": "data:application/pdf;base64,{base64_string}",
          "type": "application/pdf",
          "uploaded": true,
          "uploadedAt": { ".sv": "timestamp" }
        },
        "dtiRegistration": {
          "name": "dti_registration.pdf",
          "uri": "data:application/pdf;base64,{base64_string}",
          "type": "application/pdf",
          "uploaded": true,
          "uploadedAt": { ".sv": "timestamp" }
        },
        "validId": {
          "name": "valid_id.pdf",
          "uri": "data:image/jpeg;base64,{base64_string}",
          "type": "image/jpeg",
          "uploaded": true,
          "uploadedAt": { ".sv": "timestamp" }
        }
      },
      "paymentInfo": {
        "method": "gcash" | "paymaya" | "bank_transfer",
        "accountName": "Account Holder Name",
        "accountNumber": "09123456789",
        "verified": false,
        "addedAt": { ".sv": "timestamp" }
      },
      "status": "pending_documents" | "pending" | "approved" | "rejected" | "active",
      "createdAt": "2025-01-15T10:30:00.000Z",
      "updatedAt": "2025-01-15T10:30:00.000Z",
      "completedAt": 1736940600000,
      "documentsUploadedAt": { ".sv": "timestamp" },
      "paymentDetailsAt": { ".sv": "timestamp" }
    }
  },

  "stores": {
    "firebase_auth_uid": {
      "personalInfo": {
        "name": "Owner Full Name",
        "email": "owner@example.com",
        "mobile": "+639123456789"
      },
      "businessInfo": {
        "storeName": "Sari-Sari Store Name",
        "description": "Store description text",
        "address": "Complete Store Address",
        "city": "Manila",
        "zipCode": "1000",
        "businessType": "Sari-Sari Store",
        "logo": "data:image/jpeg;base64,{base64_string}",
        "coverImage": "data:image/jpeg;base64,{base64_string}"
      },
      "documents": {
        "barangayBusinessClearance": {
          "name": "barangay_clearance.pdf",
          "uri": "data:application/pdf;base64,{base64_string}",
          "type": "application/pdf",
          "uploaded": true,
          "uploadedAt": { ".sv": "timestamp" }
        },
        "businessPermit": {
          "name": "business_permit.pdf",
          "uri": "data:application/pdf;base64,{base64_string}",
          "type": "application/pdf",
          "uploaded": true,
          "uploadedAt": { ".sv": "timestamp" }
        },
        "dtiRegistration": {
          "name": "dti_registration.pdf",
          "uri": "data:application/pdf;base64,{base64_string}",
          "type": "application/pdf",
          "uploaded": true,
          "uploadedAt": { ".sv": "timestamp" }
        },
        "validId": {
          "name": "valid_id.pdf",
          "uri": "data:image/jpeg;base64,{base64_string}",
          "type": "image/jpeg",
          "uploaded": true,
          "uploadedAt": { ".sv": "timestamp" }
        }
      },
      "paymentInfo": {
        "method": "gcash" | "paymaya" | "bank_transfer",
        "accountName": "Account Holder Name",
        "accountNumber": "09123456789",
        "verified": false,
        "addedAt": { ".sv": "timestamp" }
      },
      "status": "pending_documents" | "pending" | "approved" | "rejected" | "active",
      "createdAt": "2025-01-15T10:30:00.000Z",
      "updatedAt": "2025-01-15T10:30:00.000Z",
      "isOpen": false,
      "businessComplete": true,
      "adminApproved": false,
      "documentsUploaded": true,
      "businessVerified": false,
      "bankDetailsComplete": true,
      "registrationCompletedAt": { ".sv": "timestamp" },
      "lastReviewedAt": { ".sv": "timestamp" },
      "approvedAt": { ".sv": "timestamp" },
      "rejectedAt": { ".sv": "timestamp" },
      "activatedAt": { ".sv": "timestamp" },
      "adminNotes": "Admin review comments"
    }
  },

  "products": {
    "auto_generated_product_key": {
      "productName": "Product Name",
      "description": "Product description text",
      "category": "Fruit & Vegetable" | "Dairy & Bakery" | "Snacks" | "Beverages" | "Home & Kitchen" | "Home Care" | "Baby Care",
      "price": 99.99,
      "quantity": 50,
      "productSize": "250",
      "unit": "pcs" | "pack" | "box" | "bottle" | "can" | "sachet" | "g" | "kg" | "ml" | "L" | "meter" | "cm",
      "productImage": "data:image/jpeg;base64,{base64_string}",
      "storeOwnerId": "firebase_auth_uid",
      "createdAt": "2025-01-15T10:30:00.000Z",
      "updatedAt": "2025-01-15T10:30:00.000Z",
      "status": "active"
    }
  }
}
```

---

## Database Operations by Feature

### 1. Customer Registration
**Path:** `users/{firebase_auth_uid}`
**File:** `app/(auth)/register.tsx:153-173`

```typescript
const userData = {
  uid: user.uid,
  name: formData.name.trim(),
  email: formData.emailOrPhone.trim(),
  userType: 'customer',
  createdAt: serverTimestamp(),
  updatedAt: serverTimestamp(),
  emailVerified: user.emailVerified,
  profile: {
    avatar: null,
    phone: null,
    address: null,
  },
  preferences: {
    notifications: true,
    theme: 'light'
  }
};

const userRef = ref(database, `users/${user.uid}`);
await set(userRef, userData);
```

### 2. Store Owner Registration Flow

#### Step 1: Store Details
**Paths:**
- `stores/{uid}`
- `store_registrations/{uid}`

**File:** `src/services/StoreRegistrationService.ts:108-171`

```typescript
await StoreRegistrationService.updateStoreDetails({
  ownerName: "Owner Name",
  ownerMobile: "+639123456789",
  ownerEmail: "owner@email.com",
  storeName: "Store Name",
  description: "Store description",
  storeAddress: "Complete address",
  city: "Manila",
  zipCode: "1000",
  logo: "data:image/jpeg;base64,...",          // REQUIRED
  coverImage: "data:image/jpeg;base64,...",    // REQUIRED
});

// Creates structure in both stores and store_registrations
// Logo and cover image are saved inside businessInfo object
// Both logo and coverImage are REQUIRED fields validated during registration
// Status: "pending_documents"
```

#### Step 2: Payment Details
**File:** `src/services/StoreRegistrationService.ts:248-295`

```typescript
await StoreRegistrationService.updatePaymentDetails({
  paymentMethod: 'gcash' | 'paymaya' | 'bank_transfer',
  accountName: "Account Name",
  accountNumber: "09123456789",
});

// Updates paymentInfo in both collections
// Status remains: "pending_documents"
```

#### Step 3: Document Upload
**File:** `src/services/StoreRegistrationService.ts:176-243`

```typescript
await StoreRegistrationService.updateDocuments({
  barangayBusinessClearance: documentInfo,
  businessPermit: documentInfo,
  dtiRegistration: documentInfo,
  validId: documentInfo,
});

// Updates documents object with base64 data
// Status changes to: "pending" (ready for admin review)
```

### 3. Product Management

#### Create Product
**Path:** `products/{auto_generated_key}`
**File:** `app/(main)/(store-owner)/profile/add-product.tsx:171-189`

```typescript
const productData = {
  productName: productName.trim(),
  description: description.trim(),
  category: selectedCategory, // From predefined list
  price: Number(price),
  quantity: Number(quantity),
  productSize: productSize.trim(),
  unit: selectedUnit, // From predefined list
  productImage: selectedImage, // Base64 data URL
  storeOwnerId: currentUser.uid,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  status: 'active'
};

const productsRef = ref(database, 'products');
const newProductRef = push(productsRef);
await set(newProductRef, productData);
```

#### Query Products by Store Owner
**File:** `app/(main)/(store-owner)/profile/store-product.tsx:146-150`

```typescript
const productsRef = ref(database, 'products');
const userProductsQuery = query(
  productsRef,
  orderByChild('storeOwnerId'),
  equalTo(currentUser.uid)
);
```

### 4. Admin Operations

#### Update Store Status
**File:** `src/services/StoreRegistrationService.ts:370-397`

```typescript
await StoreRegistrationService.updateStoreStatus(
  userId,
  'approved', // or 'rejected', 'active'
  'Admin review notes'
);

// Updates status in both stores and store_registrations
// Adds timestamps: lastReviewedAt, approvedAt/rejectedAt/activatedAt
// For 'active' status: sets isOpen: true, adminApproved: true
```

---

## Store Registration Status Flow

Based on `src/constants/StoreStatus.ts`:

```
1. Store Details Entered
   ↓
   status: "pending_documents"
   ↓
2. Payment Details Added
   ↓
   status: "pending_documents"
   ↓
3. Documents Uploaded
   ↓
   status: "pending" (ready for admin review)
   ↓
4. Admin Reviews
   ↓
   status: "approved" or "rejected"
   ↓
5. Store Activated (if approved)
   ↓
   status: "active"
   isOpen: true
   adminApproved: true
```

### Status Constants

```typescript
export const STORE_STATUS = {
  PENDING_DOCUMENTS: 'pending_documents',
  PENDING_BANK_DETAILS: 'pending_bank_details',
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  ACTIVE: 'active',
  DOCUMENTS_UPLOADED: 'documents_uploaded',
  DOCUMENTS_VERIFIED: 'documents_verified',
  DOCUMENTS_REJECTED: 'documents_rejected',
} as const;
```

---

## Predefined Data Constants

### Product Categories
From `app/(main)/(store-owner)/profile/add-product.tsx:41-49`:

1. Fruit & Vegetable
2. Dairy & Bakery
3. Snacks
4. Beverages
5. Home & Kitchen
6. Home Care
7. Baby Care

### Product Units
From `app/(main)/(store-owner)/profile/add-product.tsx:52-65`:

**Count-based:** pcs, pack, box, bottle, can, sachet
**Weight-based:** g, kg
**Volume-based:** ml, L
**Length-based:** meter, cm

### Payment Methods

1. **gcash** - GCash mobile wallet (11-digit format: 09XXXXXXXXX)
2. **paymaya** - PayMaya mobile wallet (11-digit format: 09XXXXXXXXX)
3. **bank_transfer** - Bank account (minimum 10 digits)

---

## Data Storage Patterns

### Image Storage
All images (products, store logos, documents) are stored as **Base64 data URLs** directly in the Realtime Database.

Format: `data:image/jpeg;base64,{base64_string}`

**Store Logo and Cover Image:**
- Stored inside `businessInfo` object (not at root level)
- Both are **REQUIRED fields** during store registration
- Validated in `StoreDetails.tsx` before allowing user to proceed
- Used for store branding on the dashboard and profile pages

**Files:**
- `app/(main)/(store-owner)/profile/add-product.tsx:92-99`
- `app/(auth)/(store-owner)/StoreDetails.tsx:124-131`
- `app/(auth)/(store-owner)/DocumentUpload.tsx:88-104`

### Timestamp Formats

Two timestamp formats are used:

1. **Firebase Server Timestamp:** `serverTimestamp()`
   - Used for: createdAt, updatedAt in users
   - Used for: uploadedAt, addedAt, lastReviewedAt, approvedAt

2. **ISO String:** `new Date().toISOString()`
   - Used for: createdAt, updatedAt in products
   - Used for: createdAt, updatedAt in store_registrations and stores

3. **Unix Timestamp (milliseconds):** `Date.now()`
   - Used for: completedAt in store_registrations

---

## Dual Collection Pattern

The app maintains **two parallel collections** for store data:

### `stores/{uid}`
- Used by **React Native app** for operational data
- Contains full store information including status flags
- Used for real-time store operations

### `store_registrations/{uid}`
- Used by **web admin dashboard** for registration review
- Contains registration-specific metadata
- Used for admin approval workflow

**Both collections are kept in sync** by `StoreRegistrationService`:
- `updateStoreDetails()` writes to both
- `updateDocuments()` writes to both
- `updatePaymentDetails()` writes to both
- `updateStoreStatus()` writes to both

**File:** `src/services/StoreRegistrationService.ts`

---

## Key Implementation Notes

### Service Layer
Centralized database operations through `StoreRegistrationService`:
- Ensures data consistency between `stores` and `store_registrations`
- Standardizes status management using `STORE_STATUS` constants
- Provides real-time subscription methods
- Handles admin operations

### User Profile Updates
The `users/{uid}/profile` node is updated in parallel with store operations to track completion flags:
- `storeDetailsComplete`
- `documentsComplete`
- `bankDetailsComplete`
- `businessComplete`

### Real-time Listeners
The service provides subscription methods:
```typescript
StoreRegistrationService.subscribeToStatusUpdates(userId, callback)
StoreRegistrationService.subscribeToRegistrationUpdates(userId, callback)
```

### Data Validation
- **Mobile numbers:** Philippine format 09XXXXXXXXX (11 digits)
- **Zip codes:** 4-digit format
- **Bank accounts:** Minimum 10 digits
- **Prices:** Numeric validation
- **Quantities:** Numeric validation
- **Images:** Base64 data URL format validation
- **Store Logo:** REQUIRED field in store registration (validated in StoreDetails.tsx)
- **Store Cover Image:** REQUIRED field in store registration (validated in StoreDetails.tsx)

---

## Not Yet Implemented

Based on the capstone requirements, these collections are **planned but not yet implemented**:

- ❌ `orders/{order_id}` - Customer orders
- ❌ `cart/{user_id}` - Shopping cart items
- ❌ `reviews/{review_id}` - Product reviews
- ❌ `sales/{sale_id}` - Sales transactions
- ❌ `inventory_logs/{log_id}` - Stock changes
- ❌ `return_goods/{return_id}` - Customer returns
- ❌ `damages_spoilage/{damage_id}` - Loss tracking

---

## Migration Notes

### Legacy Status Values
If migrating from older code, these legacy statuses may exist:
- `pending_approval` → Migrate to `pending`
- `completed_pending_approval` → Migrate to `pending`
- Old store registration fields without `personalInfo`/`businessInfo` structure

Use `StoreRegistrationService.migrateLegacyStatuses()` for batch migration.

---

## Database Security Considerations

### Current Implementation
- All operations require authenticated user (`auth.currentUser`)
- Store owners can only create/read their own products (filtered by `storeOwnerId`)
- Users can only modify their own user profile
- No Firebase Security Rules are documented in codebase

### Recommended Firebase Security Rules
```json
{
  "rules": {
    "users": {
      "$uid": {
        ".read": "$uid === auth.uid",
        ".write": "$uid === auth.uid"
      }
    },
    "stores": {
      "$uid": {
        ".read": "auth != null",
        ".write": "$uid === auth.uid"
      }
    },
    "store_registrations": {
      "$uid": {
        ".read": "auth != null",
        ".write": "$uid === auth.uid"
      }
    },
    "products": {
      ".read": "auth != null",
      "$productId": {
        ".write": "data.child('storeOwnerId').val() === auth.uid || !data.exists()"
      }
    }
  }
}
```

---

## Testing & Development

### Quick Test Commands
See `TESTING_GUIDE.md` and `QUICK_TEST_SCRIPT.md` for detailed testing procedures.

### Firebase Console
View live data at: https://console.firebase.google.com/

### Development Mode
The app logs detailed Firebase operations to console:
```
✅ Product saved to Firebase
✅ Store details saved successfully
✅ Documents uploaded
✅ Payment details saved
```

---

This documentation reflects the **actual implementation** as of the latest commit and will be updated as new features are added.
