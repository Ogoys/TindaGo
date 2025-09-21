# TindaGo Firebase Realtime Database Structure

## Database JSON Structure

The Firebase Realtime Database uses a JSON tree structure. Here's how TindaGo data is organized:

```json
{
  "users": {
    "firebase_auth_uid_1": {
      "uid": "firebase_auth_uid_1",
      "name": "John Doe",
      "email": "john@example.com", 
      "userType": "customer",
      "createdAt": { ".sv": "timestamp" },
      "updatedAt": { ".sv": "timestamp" },
      "emailVerified": true,
      "profile": {
        "avatar": "https://storage.url/avatar.jpg",
        "phone": "+1234567890",
        "address": {
          "street": "123 Main St",
          "city": "Manila",
          "state": "NCR",
          "zipCode": "1000", 
          "country": "Philippines"
        }
      },
      "preferences": {
        "notifications": true,
        "theme": "light"
      }
    },
    "firebase_auth_uid_2": {
      "uid": "firebase_auth_uid_2",
      "name": "Jane Smith",
      "email": "jane@example.com",
      "userType": "store_owner",
      "createdAt": { ".sv": "timestamp" },
      "updatedAt": { ".sv": "timestamp" },
      "emailVerified": true,
      "profile": {
        "avatar": null,
        "phone": "+1234567891",
        "address": null
      },
      "preferences": {
        "notifications": true,
        "theme": "light"
      }
    }
  },

  "stores": {
    "store_id_1": {
      "storeId": "store_id_1",
      "ownerId": "firebase_auth_uid_2",
      "storeName": "Jane's Electronics",
      "description": "Best electronics in town",
      "category": "Electronics",
      "createdAt": { ".sv": "timestamp" },
      "updatedAt": { ".sv": "timestamp" },
      "status": "active",
      "contact": {
        "email": "store@example.com",
        "phone": "+1234567890",
        "address": {
          "street": "456 Business Ave",
          "city": "Manila",
          "state": "NCR",
          "zipCode": "1000",
          "country": "Philippines"
        }
      },
      "businessInfo": {
        "businessPermitNumber": "BP-2025-001",
        "tinNumber": "123-456-789",
        "verified": false
      },
      "images": {
        "logo": "https://storage.url/logo.jpg",
        "banner": "https://storage.url/banner.jpg",
        "gallery": [
          "https://storage.url/img1.jpg",
          "https://storage.url/img2.jpg"
        ]
      },
      "stats": {
        "totalProducts": 5,
        "totalOrders": 12,
        "rating": 4.5,
        "totalRatings": 8
      }
    }
  },

  "products": {
    "product_id_1": {
      "productId": "product_id_1", 
      "storeId": "store_id_1",
      "ownerId": "firebase_auth_uid_2",
      "name": "iPhone 15 Pro",
      "description": "Latest iPhone with advanced features",
      "category": "Electronics",
      "subCategory": "Smartphones",
      "price": 999.99,
      "currency": "PHP",
      "stock": 50,
      "images": [
        "https://storage.url/product1.jpg",
        "https://storage.url/product2.jpg"
      ],
      "specifications": {
        "brand": "Apple",
        "model": "iPhone 15 Pro",
        "color": "Natural Titanium", 
        "storage": "128GB"
      },
      "createdAt": { ".sv": "timestamp" },
      "updatedAt": { ".sv": "timestamp" },
      "status": "active",
      "featured": false,
      "stats": {
        "views": 150,
        "purchases": 3,
        "rating": 4.7,
        "totalRatings": 5
      }
    }
  },

  "orders": {
    "order_id_1": {
      "orderId": "order_id_1",
      "buyerId": "firebase_auth_uid_1",
      "storeId": "store_id_1", 
      "sellerId": "firebase_auth_uid_2",
      "status": "delivered",
      "items": [
        {
          "productId": "product_id_1",
          "name": "iPhone 15 Pro",
          "quantity": 1,
          "unitPrice": 999.99,
          "totalPrice": 999.99
        }
      ],
      "summary": {
        "subtotal": 999.99,
        "shippingFee": 100.00,
        "tax": 99.99,
        "total": 1199.98,
        "currency": "PHP"
      },
      "shipping": {
        "address": {
          "recipientName": "John Doe",
          "street": "123 Main St",
          "city": "Manila",
          "state": "NCR",
          "zipCode": "1000",
          "country": "Philippines"
        },
        "method": "standard",
        "estimatedDelivery": { ".sv": "timestamp" }
      },
      "payment": {
        "method": "cash_on_delivery",
        "status": "paid", 
        "transactionId": "txn_123456"
      },
      "timestamps": {
        "createdAt": { ".sv": "timestamp" },
        "confirmedAt": { ".sv": "timestamp" },
        "shippedAt": { ".sv": "timestamp" },
        "deliveredAt": { ".sv": "timestamp" }
      }
    }
  },

  "reviews": {
    "review_id_1": {
      "reviewId": "review_id_1",
      "productId": "product_id_1",
      "storeId": "store_id_1",
      "buyerId": "firebase_auth_uid_1",
      "orderId": "order_id_1",
      "rating": 5,
      "title": "Amazing product!",
      "comment": "Great quality and fast delivery",
      "images": ["https://storage.url/review1.jpg"],
      "createdAt": { ".sv": "timestamp" },
      "helpful": {
        "count": 2,
        "users": ["firebase_auth_uid_1", "firebase_auth_uid_2"]
      }
    }
  },

  "carts": {
    "firebase_auth_uid_1": {
      "userId": "firebase_auth_uid_1",
      "items": [
        {
          "productId": "product_id_2",
          "storeId": "store_id_1",
          "quantity": 2,
          "addedAt": { ".sv": "timestamp" }
        }
      ],
      "updatedAt": { ".sv": "timestamp" }
    }
  }
}
```

## Database References and Queries

### Common Database Operations:

#### 1. Create User (on registration)
```javascript
import { ref, set, serverTimestamp } from 'firebase/database';

const userData = {
  uid: user.uid,
  name: "John Doe",
  email: "john@example.com",
  userType: "customer",
  createdAt: serverTimestamp(),
  updatedAt: serverTimestamp(),
  // ... other fields
};

const userRef = ref(database, `users/${user.uid}`);
await set(userRef, userData);
```

#### 2. Get User Data (on sign in)
```javascript
import { ref, get } from 'firebase/database';

const userRef = ref(database, `users/${user.uid}`);
const snapshot = await get(userRef);
if (snapshot.exists()) {
  const userData = snapshot.val();
}
```

#### 3. Create Store
```javascript
const storeRef = ref(database, `stores/${storeId}`);
const storeData = {
  storeId: storeId,
  ownerId: user.uid,
  storeName: "My Store",
  // ... other fields
};
await set(storeRef, storeData);
```

#### 4. Query Products by Store
```javascript
import { ref, orderByChild, equalTo, query, get } from 'firebase/database';

const productsRef = ref(database, 'products');
const storeProductsQuery = query(productsRef, orderByChild('storeId'), equalTo(storeId));
const snapshot = await get(storeProductsQuery);
```

#### 5. Add to Cart
```javascript
const cartRef = ref(database, `carts/${userId}/items`);
const newItem = {
  productId: "product_id",
  storeId: "store_id", 
  quantity: 1,
  addedAt: serverTimestamp()
};
// Use push() to add new item or update existing
```

## Firebase Authentication
- **Email/Password Authentication**: Primary method
- **User Profile**: Linked to Realtime Database user node
- **Email Verification**: Required for account activation

## Firebase Storage Structure
```
/users/{userId}/
  - avatar.jpg
  - documents/
    - business_permit.pdf
    - valid_id.jpg

/stores/{storeId}/
  - logo.jpg
  - banner.jpg
  - gallery/
    - image1.jpg
    - image2.jpg

/products/{productId}/
  - image1.jpg  
  - image2.jpg
  - image3.jpg

/reviews/{reviewId}/
  - review_image1.jpg
  - review_image2.jpg
```

## Security Rules Example
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
      ".read": true,
      "$storeId": {
        ".write": "data.child('ownerId').val() === auth.uid"
      }
    },
    "products": {
      ".read": true,
      "$productId": {
        ".write": "data.child('ownerId').val() === auth.uid"
      }
    },
    "orders": {
      "$orderId": {
        ".read": "data.child('buyerId').val() === auth.uid || data.child('sellerId').val() === auth.uid",
        ".write": "data.child('buyerId').val() === auth.uid || data.child('sellerId').val() === auth.uid"
      }
    },
    "carts": {
      "$uid": {
        ".read": "$uid === auth.uid",
        ".write": "$uid === auth.uid"
      }
    }
  }
}
```

## Key Benefits of Realtime Database:
1. **Real-time updates**: Instant data synchronization
2. **Offline support**: Works offline with automatic sync
3. **Simple JSON structure**: Easy to understand and query
4. **Real-time listeners**: Live updates for orders, messages, etc.
5. **Scalable**: Handles TindaGo marketplace requirements efficiently

This structure supports all TindaGo marketplace functionality with real-time capabilities and proper data relationships.