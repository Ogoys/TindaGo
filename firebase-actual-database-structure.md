# TindaGo Firebase Realtime Database - Actual Implementation Structure

## Database Structure Based on Current Codebase

This document reflects the **actual** Firebase Realtime Database structure as implemented in the TindaGo codebase, including all external services and APIs integrated.

**Last Updated:** November 19, 2025

---

## 🔧 External Services & APIs

### Cloudinary (Image & Document Storage)
**Purpose:** Offload large files from Firebase to reduce database size and costs

- **Service:** Cloudinary Cloud Storage
- **Implementation:** `src/lib/upload/cloudinary.ts`
- **Configuration:** `.env`
  - `EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME`
  - `EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET_IMAGES`
  - `EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET_DOCUMENTS`

**Features:**
- Image optimization (WebP, AVIF auto-format)
- Automatic quality adjustment
- Responsive image transformations
- Thumbnail generation
- Retry logic with exponential backoff
- File validation (size, type, dimensions)

**Storage Strategy:**
- **Phase 1:** Base64 in Firebase (legacy)
- **Phase 2+:** Cloudinary URLs in Firebase (current)
- Product images: `productImageUrl` (Cloudinary) + `productImage` (base64 fallback)
- Store logos/covers: Cloudinary URLs
- Documents: Cloudinary URLs (PDFs, permits, IDs)

### Xendit (Payment Gateway)
**Purpose:** Process GCash and PayMaya payments

- **Service:** Xendit Payment API
- **Implementation:** `src/services/payment/XenditService.ts`
- **Admin API:** `tindago-admin` Next.js app handles secret keys
- **Configuration:** Admin `.env` (not in mobile app)

**Flow:**
1. Mobile app calls admin API (`EXPO_PUBLIC_ADMIN_API_BASE`)
2. Admin creates Xendit invoice (with secrets)
3. Mobile app opens invoice URL for payment
4. Xendit webhook notifies admin of payment status
5. Admin updates Firebase order status

**Fields Added to Orders:**
- `xenditInvoiceId` - Xendit invoice reference
- `paymentMethod` - `'gcash' | 'paymaya' | 'cash'`
- `paymentStatus` - `'pending' | 'paid' | 'refunded'`

### Maps & Geolocation
**Purpose:** Store location, customer location, distance calculation

- **Services:**
  - `react-native-maps` - Map display
  - `expo-location` - GPS coordinates
  - `geolib` - Distance calculations
  - Google Maps API - Optional navigation

- **Implementation:**
  - `src/components/maps/LocationPicker.tsx`
  - `src/utils/geocoding.ts`

**Store Location Data:**
```typescript
{
  coordinates: {
    lat: number,
    lng: number
  },
  address: string,
  city: string,
  barangay: string,
  zipCode: string
}
```

### Commission System
**Purpose:** Platform revenue calculation (1% fee)

- **Service:** Firebase Realtime Database
- **Implementation:** `src/services/commission/CommissionService.ts`
- **Path:** `settings/platform/commissionRate`
- **Default Rate:** 0.01 (1%)
- **Caching:** 5-minute cache to reduce Firebase reads

**Calculation:**
```typescript
platformCommission = orderTotal * 0.01
storeAmount = orderTotal - platformCommission
```

---

## Complete Database Schema

```json
{
  "users": {
    "firebase_auth_uid": {
      "uid": "firebase_auth_uid",
      "name": "User Full Name",
      "email": "user@example.com",
      "userType": "customer" | "store-owner",
      "createdAt": { ".sv": "timestamp" },
      "updatedAt": { ".sv": "timestamp" },
      "emailVerified": true,
      "profile": {
        "avatar": null | "https://res.cloudinary.com/...",
        "phone": "+639123456789",
        "address": "Complete Address",
        // Store owner only:
        "storeDetailsComplete": true,
        "documentsComplete": true,
        "bankDetailsComplete": true,
        "businessComplete": true
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
        "description": "Store description",
        "address": "Complete Store Address",
        "city": "Manila",
        "zipCode": "1000",
        "businessType": "Sari-Sari Store",
        "logo": "https://res.cloudinary.com/...",          // NEW: Cloudinary URL
        "coverImage": "https://res.cloudinary.com/...",    // NEW: Cloudinary URL
        "coordinates": {
          "lat": 14.5995,
          "lng": 120.9842
        }
      },
      "documents": {
        "barangayBusinessClearance": {
          "name": "barangay_clearance.pdf",
          "uri": "https://res.cloudinary.com/...",         // NEW: Cloudinary URL
          "type": "application/pdf",
          "uploaded": true,
          "uploadedAt": { ".sv": "timestamp" }
        },
        "businessPermit": { /* same structure */ },
        "dtiRegistration": { /* same structure */ },
        "validId": { /* same structure */ }
      },
      "paymentInfo": {
        "method": "gcash" | "paymaya" | "bank_transfer",
        "accountName": "Account Holder Name",
        "accountNumber": "09123456789",
        "verified": false,
        "addedAt": { ".sv": "timestamp" }
      },
      "status": "pending" | "approved" | "rejected",
      "createdAt": "2025-01-15T10:30:00.000Z",
      "updatedAt": "2025-01-15T10:30:00.000Z"
    }
  },

  "stores": {
    "firebase_auth_uid": {
      // Same as store_registrations structure
      "isOpen": true,                    // Store open/close toggle
      "adminApproved": true,
      "coordinates": {                   // NEW: Map integration
        "lat": 14.5995,
        "lng": 120.9842
      },
      "rating": 4.5,                     // Average from reviews
      "totalReviews": 42
    }
  },

  "products": {
    "auto_generated_product_key": {
      "productName": "Product Name",
      "description": "Product description",
      "category": "Fruit & Vegetable" | "Dairy & Bakery" | "Snacks" | "Beverages" | "Home & Kitchen" | "Home Care" | "Baby Care",
      "price": 99.99,
      "quantity": 50,
      "productSize": "250",
      "unit": "pcs" | "pack" | "box" | "bottle" | "can" | "sachet" | "g" | "kg" | "ml" | "L" | "meter" | "cm",
      "productImage": "data:image/jpeg;base64,...",                // LEGACY: Phase 1
      "productImageUrl": "https://res.cloudinary.com/...",        // NEW: Phase 2+
      "storeOwnerId": "firebase_auth_uid",
      "createdAt": "2025-01-15T10:30:00.000Z",
      "updatedAt": "2025-01-15T10:30:00.000Z",
      "status": "available" | "out_of_stock"            // Auto-updated when quantity = 0
    }
  },

  "carts": {
    "user_id": {
      "userId": "user_id",
      "storeId": "store_id",                              // Single-store cart enforcement
      "storeName": "Store Name",
      "items": [
        {
          "productId": "product_id",
          "productName": "Product Name",
          "productImage": "data:image/...",               // LEGACY
          "productImageUrl": "https://res.cloudinary...",  // NEW
          "storeId": "store_id",
          "storeName": "Store Name",
          "quantity": 2,
          "price": 99.99,
          "weight": "250",
          "unit": "g",
          "stock": 50,
          "subtotal": 199.98,
          "isAvailable": true
        }
      ],
      "subtotal": 199.98,
      "total": 199.98,
      "itemCount": 2,
      "updatedAt": "2025-01-15T10:30:00.000Z"
    }
  },

  "orders": {
    "order_id": {
      "id": "order_id",
      "orderNumber": "ORD-2025-001",
      "customerId": "user_id",
      "customerName": "Customer Name",
      "customerPhone": "+639123456789",
      "storeId": "store_id",
      "storeName": "Store Name",
      "items": [
        {
          "productId": "product_id",
          "productName": "Product Name",
          "productImage": "https://res.cloudinary...",
          "quantity": 2,
          "price": 99.99,
          "weight": "250g",
          "unit": "g",
          "subtotal": 199.98
        }
      ],
      "subtotal": 199.98,
      "total": 199.98,                                    // Customer pays this (commission NOT added)
      "xenditInvoiceId": "xendit_invoice_id",            // NEW: Payment integration
      "platformCommission": 1.99,                         // NEW: 1% platform fee
      "storeAmount": 197.99,                             // NEW: What store receives
      "status": "pending" | "confirmed" | "preparing" | "ready" | "picked_up" | "completed" | "cancelled",
      "pickupTime": "2025-01-15T15:00:00.000Z",
      "notes": "Customer notes",
      "paymentMethod": "cash" | "gcash" | "paymaya",      // NEW: Payment types
      "paymentStatus": "pending" | "paid" | "refunded",   // NEW: Payment tracking
      "createdAt": "2025-01-15T10:30:00.000Z",
      "updatedAt": "2025-01-15T10:30:00.000Z",
      "completedAt": "2025-01-15T16:00:00.000Z",
      "cancelledAt": null,
      "cancellationReason": null,
      "cancelledBy": null,
      "hasReview": false,                                // NEW: Review tracking
      "feedbackGiven": false,
      "reviewId": null,
      "reviewedAt": null
    }
  },

  "reviews": {
    "review_id": {
      "id": "review_id",
      "userId": "user_id",
      "userName": "Customer Name",
      "userAvatar": "https://res.cloudinary...",         // NEW: Cloudinary
      "productId": "product_id",
      "storeId": "store_id",
      "orderId": "order_id",
      "rating": 5,
      "comment": "Great product!",
      "images": [                                         // NEW: Review images
        "https://res.cloudinary..."
      ],
      "createdAt": "2025-01-15T17:00:00.000Z",
      "updatedAt": null,
      "helpful": 5,
      "reported": false
    }
  },

  "wallets": {
    "store_id": {
      "available": 5000.00,                             // Available for withdrawal
      "pendingWithdrawal": 1000.00,                     // In pending/approved payouts
      "totalWithdrawn": 10000.00,                       // Lifetime withdrawn
      "updatedAt": 1700000000000
    }
  },

  "payouts": {
    "payout_id": {
      "payoutId": "payout_id",
      "storeId": "store_id",
      "storeName": "Store Name",
      "storeOwnerName": "Owner Name",
      "storeOwnerEmail": "owner@email.com",
      "amount": 1000.00,
      "method": "gcash" | "paymaya" | "bank",
      "accountName": "Account Name",
      "accountNumber": "09123456789",
      "status": "pending" | "approved" | "completed" | "rejected",
      "createdAt": "2025-01-15T10:00:00.000Z",
      "requestedAt": "2025-01-15T10:00:00.000Z",
      "approvedBy": "admin_id",
      "approvedAt": "2025-01-15T11:00:00.000Z",
      "completedBy": "admin_id",
      "completedAt": "2025-01-16T10:00:00.000Z",
      "statusHistory": [
        {
          "status": "pending",
          "timestamp": "2025-01-15T10:00:00.000Z"
        },
        {
          "status": "approved",
          "timestamp": "2025-01-15T11:00:00.000Z",
          "actionBy": "admin_id"
        }
      ]
    }
  },

  "ledgers": {
    "stores": {
      "store_id": {
        "transactions": {
          "transaction_id": {
            "orderId": "order_id",
            "amount": 199.98,                           // Total order amount
            "storeAmount": 197.99,                      // Store receives (after 1% commission)
            "platformCommission": 1.99,                 // Platform's 1%
            "status": "PAID" | "SETTLED" | "PENDING",
            "createdAt": 1700000000000
          }
        }
      }
    }
  },

  "damages_spoilage": {
    "damage_id": {
      "id": "damage_id",
      "storeId": "store_id",
      "storeOwnerId": "owner_id",
      "storeName": "Store Name",
      "items": [
        {
          "productId": "product_id",
          "productName": "Product Name",
          "productImage": "https://res.cloudinary...",
          "quantity": 5,
          "price": 99.99,
          "totalLoss": 499.95,
          "productSize": "250g",
          "unit": "g",
          "reason": "expired" | "damaged" | "spoiled" | "broken" | "other",
          "notes": "Expired yesterday"
        }
      ],
      "totalLoss": 499.95,
      "createdAt": "2025-01-15T10:00:00.000Z",
      "recordedBy": "owner_id"
    }
  },

  "return_goods": {
    "return_id": {
      "id": "return_id",
      "returnNumber": "RET-2025-001",
      "storeId": "store_id",
      "storeOwnerId": "owner_id",
      "storeName": "Store Name",
      "customerName": "Customer Name",
      "customerId": "customer_id",
      "orderNumber": "ORD-2025-001",
      "items": [
        {
          "productId": "product_id",
          "productName": "Product Name",
          "productImage": "data:image...",                // LEGACY
          "productImageUrl": "https://res.cloudinary...",  // NEW
          "quantity": 1,
          "price": 99.99,
          "refundAmount": 99.99,
          "productSize": "250g",
          "unit": "g",
          "reason": "defective" | "expired" | "wrong_item" | "changed_mind" | "quality_issues" | "other",
          "condition": "sellable" | "unsellable",
          "notes": "Product defective",
          "restoreToInventory": false                      // true if sellable
        }
      ],
      "refundMethod": "cash" | "wallet" | "store_credit" | "none",
      "totalRefund": 99.99,
      "status": "pending" | "processed" | "rejected",
      "createdAt": "2025-01-15T10:00:00.000Z",
      "processedAt": "2025-01-15T11:00:00.000Z",
      "processedBy": "owner_id",
      "notes": "Refunded via cash"
    }
  },

  "purchase_orders": {
    "purchase_order_id": {
      "id": "purchase_order_id",
      "purchaseOrderNumber": "PO-2025-001",
      "storeId": "store_id",
      "storeOwnerId": "owner_id",
      "storeName": "Store Name",
      "supplierName": "Puregold",                        // Optional
      "supplierContact": "+639123456789",                // Optional
      "items": [
        {
          "productId": "product_id",
          "productName": "Product Name",
          "productImage": "https://res.cloudinary...",
          "quantity": 100,
          "costPerUnit": 80.00,                          // Cost from supplier
          "subtotal": 8000.00,
          "productSize": "250g",
          "unit": "g"
        }
      ],
      "totalCost": 8000.00,
      "status": "pending" | "received" | "cancelled",
      "purchaseDate": "2025-01-15",
      "receivedDate": "2025-01-15",
      "notes": "Bulk order for January",
      "createdAt": "2025-01-15T10:00:00.000Z",
      "updatedAt": "2025-01-15T10:00:00.000Z",
      "recordedBy": "owner_id"
    }
  },

  "walk_in_sales": {
    "sale_id": {
      "id": "sale_id",
      "saleType": "walk-in",
      "storeId": "store_id",
      "storeOwnerId": "owner_id",
      "storeName": "Store Name",
      "items": [
        {
          "productId": "product_id",
          "productName": "Product Name",
          "productImage": "data:image...",                // LEGACY
          "productImageUrl": "https://res.cloudinary...",  // NEW
          "quantity": 2,
          "price": 99.99,
          "subtotal": 199.98,
          "productSize": "250g",
          "unit": "g"
        }
      ],
      "totalAmount": 199.98,
      "paymentMethod": "cash",
      "customerName": "John Doe",                        // Optional
      "createdAt": "2025-01-15T14:00:00.000Z",
      "recordedBy": "owner_id"
    }
  },

  "settings": {
    "platform": {
      "commissionRate": 0.01                             // 1% platform fee (configurable)
    }
  }
}
```

---

## Key Changes from Previous Version

### ✅ **NEW Collections Implemented:**
1. **`carts/`** - Shopping cart with single-store enforcement
2. **`orders/`** - Customer orders with payment integration
3. **`reviews/`** - Product and store reviews with images
4. **`wallets/`** - Store owner earnings tracking
5. **`payouts/`** - Withdrawal requests and processing
6. **`ledgers/`** - Revenue split tracking (platform vs store)
7. **`damages_spoilage/`** - Loss tracking (expired, damaged, spoiled)
8. **`return_goods/`** - Customer returns with refund processing
9. **`purchase_orders/`** - Inventory restocking from suppliers
10. **`walk_in_sales/`** - Manual sales recording (not app orders)
11. **`settings/platform/`** - Configurable commission rate

### 🔄 **Image Storage Migration:**
- **Phase 1 (Legacy):** Base64 strings in Firebase
  - `productImage: "data:image/jpeg;base64,..."`
- **Phase 2+ (Current):** Cloudinary URLs
  - `productImageUrl: "https://res.cloudinary.com/..."`
- **Backward Compatibility:** Both fields exist for smooth migration

### 💰 **Payment & Commission:**
- Xendit integration for GCash/PayMaya payments
- `xenditInvoiceId` tracks payment reference
- `platformCommission` (1%) deducted from store earnings
- `storeAmount` = what store receives after commission
- Customer pays `total` (commission NOT added to customer bill)

### 📍 **Location Features:**
- Stores have `coordinates: { lat, lng }`
- Used for distance calculation and map display
- Walking distance filter (~500m-1km radius)

### 📊 **Review System:**
- Customers can review products/stores after order completion
- Reviews can include images (Cloudinary URLs)
- Orders track `hasReview`, `reviewId`, `reviewedAt`
- Stores have aggregated `rating` and `totalReviews`

---

## API Operations by Feature

### Products
**API:** `src/api/products/index.ts`
- `fetchProductById()` - Get single product
- Auto-update `status` when `quantity = 0`

### Cart
**API:** `src/api/cart/index.ts`
- `fetchCart()` - Get user's cart
- `addToCart()` - Add item (enforces single-store rule)
- `updateCartQuantity()` - Update item quantity
- `removeFromCart()` - Remove item
- `clearCart()` - Empty cart

### Orders
**API:** `src/api/orders/index.ts`
- `createOrder()` - Create new order
- `fetchUserOrders()` - Get customer orders
- `fetchStoreOrders()` - Get store orders
- `updateOrderStatus()` - Update order status
- Payment integration via XenditService
- Commission calculation via CommissionService

### Reviews
**API:** `src/api/reviews/index.ts`
- `createReview()` - Submit review
- `fetchProductReviews()` - Get product reviews
- `fetchStoreReviews()` - Get store reviews
- Cloudinary image upload support

### Damages/Spoilage
**API:** `src/api/damages/index.ts`
- `recordDamage()` - Record loss (auto-reduces inventory)
- `fetchDamages()` - Get damage history

### Returns
**API:** `src/api/returns/index.ts`
- `createReturn()` - Process return (auto-restores inventory if sellable)
- `fetchReturns()` - Get return history

### Purchase Orders
**API:** `src/api/purchaseOrders/index.ts`
- `createPurchaseOrder()` - Record restocking
- `markPurchaseOrderReceived()` - Mark as received (auto-adds inventory)
- `fetchPurchaseOrders()` - Get PO history

### Walk-In Sales
**API:** `src/api/walkInSales/index.ts`
- `recordWalkInSale()` - Record manual sale (auto-reduces inventory)
- `fetchWalkInSales()` - Get sales history

---

## Real-Time Sync Patterns

### Store Open/Close Toggle
```typescript
// Store owner toggles isOpen
ref(database, `stores/${storeId}/isOpen`)

// Customer app listens:
onValue(ref(database, `stores/${storeId}/isOpen`), (snapshot) => {
  const isOpen = snapshot.val();
  // Hide/show products based on store status
});
```

### Order Status Updates
```typescript
// Store owner updates order status
ref(database, `orders/${orderId}/status`)

// Customer app listens:
onValue(ref(database, `orders/${orderId}`), (snapshot) => {
  const order = snapshot.val();
  // Update UI with new status
});
```

### Cart Synchronization
```typescript
// Cart updates reflect immediately
ref(database, `carts/${userId}`)

// Real-time cart item availability checking
// Auto-remove items if store closes or product out of stock
```

---

## Environment Variables Required

```bash
# Firebase
EXPO_PUBLIC_FIREBASE_API_KEY=
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=
EXPO_PUBLIC_FIREBASE_DATABASE_URL=
EXPO_PUBLIC_FIREBASE_PROJECT_ID=
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
EXPO_PUBLIC_FIREBASE_APP_ID=

# Cloudinary
EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME=
EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET_IMAGES=
EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET_DOCUMENTS=

# Admin API (for Xendit payments)
EXPO_PUBLIC_ADMIN_API_BASE=http://localhost:3000  # or production URL
```

---

## Database Security Considerations

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
      "$storeId": {
        ".read": "auth != null",
        ".write": "$storeId === auth.uid"
      }
    },
    "products": {
      ".read": "auth != null",
      "$productId": {
        ".write": "data.child('storeOwnerId').val() === auth.uid || !data.exists()"
      }
    },
    "carts": {
      "$userId": {
        ".read": "$userId === auth.uid",
        ".write": "$userId === auth.uid"
      }
    },
    "orders": {
      "$orderId": {
        ".read": "data.child('customerId').val() === auth.uid || data.child('storeId').val() === auth.uid",
        ".write": "data.child('customerId').val() === auth.uid || data.child('storeId').val() === auth.uid"
      }
    },
    "reviews": {
      ".read": "auth != null",
      "$reviewId": {
        ".write": "data.child('userId').val() === auth.uid || !data.exists()"
      }
    },
    "wallets": {
      "$storeId": {
        ".read": "$storeId === auth.uid",
        ".write": false  // Only admin can write
      }
    },
    "settings": {
      ".read": "auth != null",
      ".write": false  // Only admin can write
    }
  }
}
```

---

## Performance Optimizations

### Cloudinary Image Optimization
```typescript
import { getOptimizedImageUrl, getProductImageUrl } from '@/lib/upload/cloudinary';

// Auto-format (WebP/AVIF), auto-quality, DPR optimization
const optimizedUrl = getOptimizedImageUrl(imageUrl, {
  width: 600,
  quality: 'auto',
  format: 'auto'
});

// Predefined sizes for product cards
const productUrl = getProductImageUrl(imageUrl, 'medium'); // 600px
```

### Commission Rate Caching
```typescript
// Cached for 5 minutes to reduce Firebase reads
const rate = await CommissionService.getCommissionRate();
```

### Indexed Queries
```typescript
// Products by store owner (indexed on 'storeOwnerId')
const query = query(
  ref(database, 'products'),
  orderByChild('storeOwnerId'),
  equalTo(ownerId)
);
```

---

## Migration Notes

### Migrating from Base64 to Cloudinary

**Products:**
```typescript
// Old products have: productImage (base64)
// New products have: productImageUrl (Cloudinary)
// Both fields can coexist during migration

if (product.productImageUrl) {
  // Use Cloudinary URL (Phase 2+)
  imageUrl = product.productImageUrl;
} else {
  // Fallback to base64 (Phase 1)
  imageUrl = product.productImage;
}
```

**Cart Items:**
```typescript
// Same pattern: productImageUrl (new) vs productImage (legacy)
```

---

## Testing & Development

### View Live Data
Firebase Console: https://console.firebase.google.com/

### Test Commission Calculation
```typescript
import { CommissionService } from '@/services/commission';

const { platformCommission, storeAmount } =
  await CommissionService.calculateCommission(1000.00);
// platformCommission: 10.00 (1%)
// storeAmount: 990.00
```

### Test Cloudinary Upload
```typescript
import { uploadImageToCloudinary } from '@/lib/upload/cloudinary';

const url = await uploadImageToCloudinary(localUri, 'products');
// Returns: https://res.cloudinary.com/.../products/image.jpg
```

---

This documentation reflects the **complete actual implementation** as of November 19, 2025, including all external services and APIs.
