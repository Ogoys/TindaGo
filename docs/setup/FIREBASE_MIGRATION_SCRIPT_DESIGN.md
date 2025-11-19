# TindaGo Firebase Migration Script Design

**Goal:** When you are ready (later), migrate important data from the **old Firebase project** to the **new Firebase project**, while:

- Uploading images/PDFs to **Cloudinary** (or other storage).
- Storing only **URLs** in the new Realtime Database.
- Avoiding another spike of heavy downloads.

This document **does not** contain a finished script. It defines a safe design and structure so you can implement it when you have more time.

---

## 1. High-Level Strategy

We will build a **Node.js migration script** that runs on your machine or a server you control.

The script will:

1. Connect to the **old** Realtime Database via Firebase Admin SDK.
2. Connect to the **new** Realtime Database via another Admin app instance.
3. For each record (products, stores, registrations):
   - Read **only once** from the old database (preferably in batches).
   - For each image/document:
     - If it is stored as base64 in the old DB, upload it to Cloudinary.
     - Receive a URL from Cloudinary.
   - Write a **cleaned** record into the **new** DB:
     - Replace base64 fields with URL fields (e.g. `productImageUrl`).
     - Keep other fields (name, price, status, etc.) the same.
   - Mark migrated records so the script can be re-run safely.

We *do not* simply export/import JSON directly, because that would bring all base64 blobs into the new project again and recreate the download problem.

---

## 2. Data Model Overview

From the current TindaGo code and documentation, the main Realtime Database nodes are:

- `users/{uid}` – user profiles.
- `stores/{uid}` – store data, including:
  - `businessInfo.logo` (base64 image).
  - `businessInfo.coverImage` (base64 image).
- `store_registrations/{uid}` – registration data, including:
  - `documents.barangayBusinessClearance` (PDF or image).
  - `documents.businessPermit`.
  - `documents.dtiRegistration`.
  - `documents.validId`.
- `products/{productId}` – product data, including:
  - `productImage` (base64 image) or similar field.

Additional collections (orders, carts, etc.) exist, but **images/docs** live mostly in:

- Products → product images.
- Stores → logos & cover images.
- Store registrations → documents.

This first migration design focuses on those.

---

## 3. Configuration & Setup

### 3.1 Environment variables

Create a `.env.migration` file (not committed to git) for the script:

```env
# Old project
OLD_FIREBASE_DATABASE_URL=https://old-project-id.firebaseio.com
OLD_FIREBASE_SERVICE_ACCOUNT_PATH=./serviceAccountKey-old.json

# New project
NEW_FIREBASE_DATABASE_URL=https://new-project-id.firebaseio.com
NEW_FIREBASE_SERVICE_ACCOUNT_PATH=./serviceAccountKey-new.json

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
CLOUDINARY_UPLOAD_PRESET=optional_unsigned_preset
```

You will need two **service account JSON files**, one for each Firebase project.

### 3.2 Dependencies (Node.js)

In a separate folder (e.g. `tools/migration`), set up a small Node project:

```bash
npm init -y
npm install firebase-admin dotenv cloudinary
```

- `firebase-admin` – Admin SDK for Realtime Database.
- `dotenv` – load `.env.migration`.
- `cloudinary` – uploads images/docs.

---

## 4. Script Structure

Create `migrate.ts` or `migrate.js` in `tools/migration` with this high-level structure:

```ts
import * as admin from 'firebase-admin';
import { v2 as cloudinary } from 'cloudinary';
import * as dotenv from 'dotenv';
import fs from 'fs';

dotenv.config({ path: '.env.migration' });

// 1. Initialize Firebase Admin for OLD project
const oldServiceAccount = JSON.parse(fs.readFileSync(process.env.OLD_FIREBASE_SERVICE_ACCOUNT_PATH!, 'utf8'));
const oldApp = admin.initializeApp({
  credential: admin.credential.cert(oldServiceAccount),
  databaseURL: process.env.OLD_FIREBASE_DATABASE_URL,
}, 'old');

const oldDb = oldApp.database();

// 2. Initialize Firebase Admin for NEW project
const newServiceAccount = JSON.parse(fs.readFileSync(process.env.NEW_FIREBASE_SERVICE_ACCOUNT_PATH!, 'utf8'));
const newApp = admin.initializeApp({
  credential: admin.credential.cert(newServiceAccount),
  databaseURL: process.env.NEW_FIREBASE_DATABASE_URL,
}, 'new');

const newDb = newApp.database();

// 3. Initialize Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function main() {
  // TODO: call migration functions (products, stores, registrations)
}

main().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
```

This sets up connections to old and new databases plus Cloudinary.

---

## 5. Migrating Products

**Goal:** For each product in `products`:

- If it has a base64 `productImage` or similar field:
  - Upload to Cloudinary → get `secure_url`.
  - Write a new product record in the new DB with `productImageUrl` and **no base64**.
- Copy other metadata (name, price, storeId, etc.).
- Be idempotent: if product already migrated, skip.

### 5.1 Reading products in batches

If you have many products, avoid loading them all at once:

- Use `orderByKey` + `limitToFirst` and a `lastKey` cursor.
- Or read once if the dataset is small enough.

Example (simplified) reading all at once:

```ts
async function fetchAllProductsFromOld() {
  const snapshot = await oldDb.ref('products').once('value');
  return snapshot.exists() ? snapshot.val() as Record<string, any> : {};
}
```

### 5.2 Uploading a base64 image to Cloudinary

The product may store base64 as `data:image/jpeg;base64,....`.

Cloudinary allows passing base64 directly as `file`:

```ts
async function uploadBase64ImageToCloudinary(base64: string): Promise<string> {
  const res = await cloudinary.uploader.upload(base64, {
    folder: 'tindago/products',
    // resource_type: 'image' by default
  });
  return res.secure_url;
}
```

You should:

- Detect if a record already has `productImageUrl` and no base64 → skip upload.

### 5.3 Writing migrated product to new DB

```ts
async function migrateProducts() {
  const products = await fetchAllProductsFromOld();
  const newProductsRef = newDb.ref('products');

  for (const [productId, product] of Object.entries(products)) {
    try {
      // Check if already migrated in new project
      const newSnap = await newProductsRef.child(productId).once('value');
      if (newSnap.exists()) {
        console.log(`Product ${productId} already migrated, skipping.`);
        continue;
      }

      let imageUrl = product.productImageUrl;

      // If no URL but has base64 image, upload it
      if (!imageUrl && product.productImage && typeof product.productImage === 'string') {
        console.log(`Uploading image for product ${productId}...`);
        imageUrl = await uploadBase64ImageToCloudinary(product.productImage);
      }

      // Build new product object without base64
      const cleanedProduct = {
        ...product,
        productImageUrl: imageUrl || null,
      };

      // Remove base64 fields
      delete (cleanedProduct as any).productImage;
      delete (cleanedProduct as any).productImageBase64;

      await newProductsRef.child(productId).set(cleanedProduct);
      console.log(`Migrated product ${productId}`);
    } catch (e) {
      console.error(`Failed to migrate product ${productId}:`, e);
      // Optionally log to a file for retry
    }
  }
}
```

This function:

- Is **idempotent**: if a product already exists in the new DB, it does nothing.
- Removes base64 fields from the migrated record.

---

## 6. Migrating Stores (Logos & Cover Images)

**Goal:** For each store in `stores`:

- Find logo and cover image fields.
- Upload base64 strings to Cloudinary if needed.
- Write a new, cleaned record in the new DB.

### 6.1 Detecting image fields

From the current implementation, logos and cover images can be in:

- `store.logo`
- `store.coverImage`
- Or nested inside `store.businessInfo.logo` / `store.businessInfo.coverImage`.

The migration script should handle both.

### 6.2 Helper to upload store image

Reuse `uploadBase64ImageToCloudinary` with a folder like `tindago/stores`.

### 6.3 Migration logic for a single store

```ts
async function migrateStores() {
  const snapshot = await oldDb.ref('stores').once('value');
  if (!snapshot.exists()) return;

  const stores = snapshot.val() as Record<string, any>;
  const newStoresRef = newDb.ref('stores');

  for (const [storeId, store] of Object.entries(stores)) {
    try {
      const newSnap = await newStoresRef.child(storeId).once('value');
      if (newSnap.exists()) {
        console.log(`Store ${storeId} already migrated, skipping.`);
        continue;
      }

      const cleanedStore = { ...store } as any;

      // Handle logo
      let logoUrl = cleanedStore.logo || cleanedStore.businessInfo?.logo;
      if (!logoUrl && logoLooksLikeBase64(cleanedStore.businessInfo?.logo)) {
        logoUrl = await uploadBase64ImageToCloudinary(cleanedStore.businessInfo.logo);
      }

      // Handle cover image
      let coverUrl = cleanedStore.coverImage || cleanedStore.businessInfo?.coverImage;
      if (!coverUrl && logoLooksLikeBase64(cleanedStore.businessInfo?.coverImage)) {
        coverUrl = await uploadBase64ImageToCloudinary(cleanedStore.businessInfo.coverImage);
      }

      // Set URLs in both flat and nested positions for compatibility
      cleanedStore.logo = logoUrl || null;
      cleanedStore.coverImage = coverUrl || null;
      if (cleanedStore.businessInfo) {
        cleanedStore.businessInfo.logo = logoUrl || null;
        cleanedStore.businessInfo.coverImage = coverUrl || null;
      }

      // Remove raw base64 fields if you keep them separate (optional)

      await newStoresRef.child(storeId).set(cleanedStore);
      console.log(`Migrated store ${storeId}`);
    } catch (e) {
      console.error(`Failed to migrate store ${storeId}:`, e);
    }
  }
}

function logoLooksLikeBase64(value: any): boolean {
  return typeof value === 'string' && value.startsWith('data:image');
}
```

---

## 7. Migrating Store Registrations (Documents)

**Goal:** For each registration in `store_registrations`:

- For each document node:
  - `barangayBusinessClearance`
  - `businessPermit`
  - `dtiRegistration`
  - `validId`
- If it contains a base64 `uri`, upload it as `resource_type: 'raw'` (for PDFs) or `image`.
- Save Cloudinary URLs in the new record (e.g. `documentUrl`), and optionally clear base64 content.

### 7.1 Upload helper for documents

```ts
async function uploadBase64DocumentToCloudinary(base64: string, publicIdPrefix: string): Promise<string> {
  const res = await cloudinary.uploader.upload(base64, {
    folder: 'tindago/documents',
    public_id: publicIdPrefix,
    resource_type: 'raw', // works for PDFs and other docs
  });
  return res.secure_url;
}
```

### 7.2 Migration logic for registrations

```ts
async function migrateRegistrations() {
  const snapshot = await oldDb.ref('store_registrations').once('value');
  if (!snapshot.exists()) return;

  const regs = snapshot.val() as Record<string, any>;
  const newRegsRef = newDb.ref('store_registrations');

  for (const [userId, reg] of Object.entries(regs)) {
    try {
      const newSnap = await newRegsRef.child(userId).once('value');
      if (newSnap.exists()) {
        console.log(`Registration ${userId} already migrated, skipping.`);
        continue;
      }

      const cleanedReg = { ...reg } as any;
      cleanedReg.documents = cleanedReg.documents || {};

      const docFields = [
        'barangayBusinessClearance',
        'businessPermit',
        'dtiRegistration',
        'validId',
      ];

      for (const field of docFields) {
        const doc = cleanedReg.documents[field];
        if (doc && doc.uri && typeof doc.uri === 'string' && doc.uri.startsWith('data:')) {
          console.log(`Uploading ${field} for ${userId}...`);
          const url = await uploadBase64DocumentToCloudinary(doc.uri, `${userId}_${field}`);
          cleanedReg.documents[field] = {
            ...doc,
            uri: url,         // now URL instead of base64
            storage: 'cloudinary',
          };
        }
      }

      await newRegsRef.child(userId).set(cleanedReg);
      console.log(`Migrated registration ${userId}`);
    } catch (e) {
      console.error(`Failed to migrate registration ${userId}:`, e);
    }
  }
}
```

---

## 8. Running the Script

### 8.1 Dry run (read-only)

Before writing anything to the new DB, you can:

1. Run a **read-only** version of each migration function that:
   - Reads from the old DB.
   - Counts how many items have base64 images/docs.
   - Logs estimated total size or number of uploads.
2. Check logs and Cloudinary limits.

You can achieve this by commenting out the `set()` calls and just printing information.

### 8.2 Real run

Once you are confident:

1. Enable the `set()` calls.
2. In `main()` call migration functions in order, for example:

   ```ts
   async function main() {
     console.log('Starting TindaGo migration...');

     await migrateProducts();
     await migrateStores();
     await migrateRegistrations();

     console.log('Migration complete.');
   }
   ```

3. Run the script:

   ```bash
   node migrate.js          # or ts-node migrate.ts if using TypeScript
   ```

---

## 9. Safety and Best Practices

1. **Idempotency**
   - Always check if an entry already exists in the new DB before writing.
   - Prefer checking for presence of URL fields to skip re-uploading.

2. **Logging**
   - Log successes and failures (product/store/user IDs) to the console and optionally to a file.
   - For failures, later re-run the script on just the failed IDs.

3. **Rate limiting**
   - If you have many records, Cloudinary and Firebase may throttle.
   - Add `await new Promise(r => setTimeout(r, 100));` between uploads if needed.

4. **Backups**
   - Before running the migration, export old DB JSON from Firebase Console as a backup.

5. **Testing**
   - Test migration on a **small subset** (e.g., only a few products and one store) by filtering IDs in your script.
   - Verify the new project data works correctly in the TindaGo app and admin.

---

## 10. Summary

This design gives you a clear path to:

- Move from your current Firebase project (with embedded base64 images/docs) to a new project using Cloudinary URLs.
- Keep the new Realtime Database lightweight and friendly to the Spark (no‑cost) usage limits.
- Run the migration safely, in small steps, and re-run it if needed.

When you have time to implement this, use this document as the blueprint for the script, adapting field names to match any final schema changes you make before migration.
