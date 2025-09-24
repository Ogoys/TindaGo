# TindaGo Firebase Realtime Database - Actual Implementation Structure

## Database Structure Based on Current Codebase

This document reflects the **actual** Firebase Realtime Database structure as implemented in the TindaGo codebase, extracted from the live application code.

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
        "address": null,
        "businessName": "Store Business Name",        // store_owner only
        "businessType": "Sari-Sari Store",          // store_owner only
        "businessAddress": "Complete Address",       // store_owner only
        "businessPermitNumber": "BP-2025-001",      // store_owner only
        "bankAccountNumber": "1234567890",          // store_owner only
        "bankName": "BDO Unibank",                  // store_owner only
        "businessComplete": false,                  // store_owner only
        "storeDetailsComplete": true                // store_owner only
      },
      "preferences": {
        "notifications": true,
        "theme": "light"
      }
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
  },

  "stores": {
    "store_owner_uid": {
      "storeId": "auto_generated_store_id",
      "storeName": "Store Name",
      "storeDescription": "Store description",
      "storeCategory": "Grocery Store",
      "storeAddress": "Complete store address",
      "ownerName": "Store Owner Name",
      "ownerMobile": "+639123456789",
      "storeOwnerId": "firebase_auth_uid",
      "createdAt": { ".sv": "timestamp" },
      "updatedAt": { ".sv": "timestamp" },
      "status": "pending_approval",
      "adminApproved": false,
      "businessDocuments": {
        "businessPermit": "base64_document_string",
        "validId": "base64_document_string",
        "barangayClearance": "base64_document_string",
        "dtiRegistration": "base64_document_string"
      },
      "bankDetails": {
        "accountNumber": "1234567890",
        "bankName": "BDO Unibank"
      }
    }
  },

  "store_registrations": {
    "store_owner_uid": {
      "personalDetails": {
        "businessName": "Business Name",
        "businessType": "Sari-Sari Store",
        "businessAddress": "Complete Address",
        "completedAt": { ".sv": "timestamp" }
      },
      "status": "personal_details_complete" | "store_details_complete" | "documents_uploaded" | "registration_complete",
      "updatedAt": { ".sv": "timestamp" }
    }
  }
}
```

## Database Paths and Operations

### 1. User Registration (Customer)
**Path:** `users/{firebase_auth_uid}`
**File:** `app/(auth)/register.tsx:172`

```javascript
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

### 2. Store Owner Registration
**Path:** `store_registrations/{firebase_auth_uid}`
**File:** `app/(auth)/(store-owner)/StoreRegistration.tsx:166`

```javascript
const storeOwnerData = {
  personalDetails: {
    businessName: formData.businessName.trim(),
    businessType: formData.businessType,
    businessAddress: formData.businessAddress.trim(),
    completedAt: serverTimestamp()
  },
  status: 'personal_details_complete',
  updatedAt: serverTimestamp()
};

const storeOwnerRef = ref(database, `store_registrations/${userId}`);
await update(storeOwnerRef, storeOwnerData);
```

### 3. Store Details Creation
**Path:** `stores/{store_owner_uid}`
**File:** `app/(auth)/(store-owner)/StoreDetails.tsx:174`

```javascript
const storeData = {
  storeId: generateStoreId(),
  storeName: formData.storeName,
  storeDescription: formData.storeDescription,
  storeCategory: formData.storeCategory,
  storeAddress: formData.storeAddress,
  ownerName: ownerName,
  ownerMobile: ownerMobile,
  storeOwnerId: userId,
  createdAt: serverTimestamp(),
  updatedAt: serverTimestamp(),
  status: 'pending_approval',
  adminApproved: false,
};

const storeRef = ref(database, `stores/${userId}`);
await set(storeRef, storeData);
```

### 4. Product Creation
**Path:** `products/{auto_generated_key}`
**File:** `app/(main)/(store-owner)/profile/add-product.tsx:187`

```javascript
const productData = {
  productName: productName.trim(),
  description: description.trim(),
  category: selectedCategory,
  price: Number(price),
  quantity: Number(quantity),
  productSize: productSize.trim(),
  unit: selectedUnit,
  productImage: selectedImage, // Base64 string
  storeOwnerId: currentUser.uid,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  status: 'active'
};

const productsRef = ref(database, 'products');
const newProductRef = push(productsRef);
await set(newProductRef, productData);
```

### 5. Product Query by Store Owner
**Path:** Query `products` by `storeOwnerId`
**File:** `app/(main)/(store-owner)/profile/store-product.tsx:146`

```javascript
const productsRef = ref(database, 'products');
const storeProductsQuery = query(
  productsRef,
  orderByChild('storeOwnerId'),
  equalTo(user.uid)
);
```

## Key Implementation Notes

### Data Types
- **Timestamps**: Using both `serverTimestamp()` and ISO strings
- **Images**: Stored as Base64 strings directly in database
- **IDs**: Firebase Auth UIDs for users, auto-generated keys for products/stores
- **Status**: String enums for tracking approval/completion states

### Predefined Categories
**Product Categories:**
- Fruit & Vegetable
- Dairy & Bakery
- Snacks
- Beverages
- Home & Kitchen
- Home Care
- Baby Care

**Product Units:**
- Count: pcs, pack, box, bottle, can, sachet
- Weight: g, kg
- Volume: ml, L
- Length: meter, cm

### Registration Flow
1. **Store Owner Personal Details** → `store_registrations/{uid}`
2. **Store Business Details** → `stores/{uid}`
3. **Document Upload** → Update `stores/{uid}` with documents
4. **Bank Details** → Update `stores/{uid}` with bank info
5. **User Profile Updates** → `users/{uid}/profile`

### Current Limitations
- **No Orders Collection**: Not yet implemented
- **No Reviews Collection**: Not yet implemented
- **No Cart Collection**: Not yet implemented
- **Image Storage**: Base64 in database (not Firebase Storage)
- **No Real-time Listeners**: Most operations use single reads

This structure reflects the current state of development and will evolve as more features are implemented.