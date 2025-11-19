# TindaGo Firebase Improvement Plan

**Goal:** Keep using the Firebase Spark (no-cost) plan without hitting Realtime Database download limits, while preparing for a safe migration to a new Firebase project and Cloudinary for media storage.

This document is the main implementation guide. Follow the phases in order.

---

## Phase 0 – Prerequisites

Before changing anything:

1. **Make sure you can run the apps locally**
   - TindaGo mobile app (Expo / React Native).
   - `tindago-admin` Next.js admin dashboard.

2. **Know where Firebase config comes from**
   - **Mobile (`TindaGo`)**
     - `src/lib/firebase/config.ts` uses:
       - `EXPO_PUBLIC_FIREBASE_API_KEY`
       - `EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN`
       - `EXPO_PUBLIC_FIREBASE_DATABASE_URL`
       - `EXPO_PUBLIC_FIREBASE_PROJECT_ID`
       - `EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET`
       - `EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
       - `EXPO_PUBLIC_FIREBASE_APP_ID`
   - **Admin (`tindago-admin`)**
     - `src/lib/firebase.js` uses:
       - `NEXT_PUBLIC_FIREBASE_API_KEY`
       - `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
       - `NEXT_PUBLIC_FIREBASE_DATABASE_URL`
       - `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
       - `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
       - `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
       - `NEXT_PUBLIC_FIREBASE_APP_ID`

You will later point these env vars at the **new** Firebase project.

---

## Phase 1 – Eliminate Excessive Realtime Database Usage

**Objective:** Stop the current app from spamming Realtime Database with huge reads so the new project stays under quota.

### 1.1 Mobile app – Replace `onValue` streams with one‑time `get` calls

#### 1.1.1 Files to update

Customer views that read `products` and `stores`:

- `app/(main)/(customer)/home.tsx`
- `app/(main)/(customer)/stores-list.tsx`
- `app/(main)/(customer)/see-more.tsx`
- `app/(main)/(customer)/category-detail.tsx`
- `app/(main)/(customer)/search.tsx`

These files currently use patterns like:

```ts
import { ref, onValue, ... } from 'firebase/database';

useEffect(() => {
  const productsRef = ref(database, 'products');
  const unsubscribe = onValue(productsRef, (snapshot) => {
    const data = snapshot.val();
    // build list
    setAllProducts(...);
  });

  return () => unsubscribe();
}, []);
```

This keeps a **live subscription** open to entire collections (`products`, `stores`), and every small change causes a large re-download of all items (including images).

#### 1.1.2 New pattern: one‑time `get()`

For each of the files listed above:

1. **Change imports** to use `get` instead of `onValue`:

   ```ts
   // Before
   import { ref, onValue, ... } from 'firebase/database';

   // After
   import { ref, get, ... } from 'firebase/database';
   ```

2. **Replace the `useEffect` subscription** with a one‑time async loader:

   Example for `home.tsx` (conceptual):

   ```ts
   useEffect(() => {
     let cancelled = false;

     async function load() {
       try {
         // PRODUCTS (single read)
         const productsSnap = await get(ref(database, 'products'));
         if (!cancelled && productsSnap.exists()) {
           const data = productsSnap.val();
           const productsList = Object.keys(data)
             .map(id => ({ id, ...data[id] }))
             .filter(product =>
               product.status === 'available' &&
               product.storeIsOpen !== false
             );
           setAllProducts(productsList);
         } else if (!cancelled) {
           setAllProducts([]);
         }

         // STORES (single read)
         const storesSnap = await get(ref(database, 'stores'));
         if (!cancelled && storesSnap.exists()) {
           const data = storesSnap.val();
           const storesList = Object.keys(data)
             .map(id => {
               const storeData = data[id];
               return {
                 id,
                 storeName: storeData.storeName || storeData.businessInfo?.storeName || 'Unknown Store',
                 ownerName: storeData.ownerName || storeData.personalInfo?.name || 'Unknown Owner',
                 logo: storeData.logo || storeData.businessInfo?.logo || null,
                 coverImage: storeData.coverImage || storeData.businessInfo?.coverImage || null,
                 address: storeData.address || storeData.businessInfo?.address || '',
                 city: storeData.city || storeData.businessInfo?.city || '',
                 description: storeData.description || storeData.businessInfo?.description || '',
                 status: storeData.status || 'active',
                 isOpen: data[id]?.isOpen ?? true,
               };
             })
             .filter(store => {
               const isActive = store.status === 'approved' || store.status === 'active';
               const isOpen = data[store.id]?.isOpen !== false;
               return isActive && isOpen;
             });

           setAllStores(storesList);
         } else if (!cancelled) {
           setAllStores([]);
         }
       } catch (error) {
         console.error('Error loading home data:', error);
         if (!cancelled) {
           setAllProducts([]);
           setAllStores([]);
         }
       } finally {
         if (!cancelled) setLoading(false);
       }
     }

     load();
     return () => { cancelled = true; };
   }, []);
   ```

3. Keep existing pull‑to‑refresh behaviour. If desired, you can later reuse the same `load()` function when the user pulls to refresh.

4. Do the same conversion in the other listed screens, adjusting filters (category, search query, etc.) but always using `get(ref(...))` instead of `onValue`.

**Result:** Each screen performs **one read per open** instead of a continuous stream of full collections.

---

### 1.2 Admin app – Change `subscribeTo*` from live to one‑shot

The admin dashboard currently:

- Subscribes to large nodes (`admins`, `users`, `stores`, `store_registrations`, `customer_orders`).
- On each change, calls API routes that again fetch large datasets.

We keep the API structure but stop the constant streaming.

#### 1.2.1 Files to update

- `tindago-admin/src/lib/userManagementService.ts`
  - `subscribeToUsers`
  - `subscribeToUserStats`
- `tindago-admin/src/lib/storeService.ts`
  - `subscribeToStores`
  - `subscribeToStoreStats`
- `tindago-admin/src/lib/customerService.ts`
  - `subscribeToCustomers`
  - `subscribeToCustomerStats`

Each of these currently sets `onValue(...)` listeners and then calls `getAll*()` or `get*Stats()` on every change.

#### 1.2.2 New pattern: fetch once, no live listener

Example for `subscribeToStores`:

```ts
static subscribeToStores(
  callback: (stores: Store[]) => void
): () => void {
  this.getAllStoresWithRegistrations()
    .then(callback)
    .catch(error => console.error('Error in store subscription:', error));

  // No-op unsubscribe so UI code still works
  return () => {};
}
```

Apply the same idea to the other five subscription methods:

- Call the appropriate `get...`/`get...Stats()` method **once**.
- Call `callback` with the result.
- Return a no-op `() => {}` instead of unsubscribing from Firebase listeners.

**Result:** Admin screens still load data, but no longer continuously trigger re-download of entire collections.

---

## Phase 2 – Integrate Cloudinary for Media (Images, PDFs)

**Objective:** Stop storing large base64 image/PDF data inside Realtime Database. Store only URLs, and keep the heavy bytes in external storage.

### 2.1 Set up Cloudinary

1. Create a Cloudinary account (free tier is fine to start).
2. In Cloudinary dashboard:
   - Note your `cloud_name`.
   - Create an **upload preset** (unsigned for simplicity in dev, or signed for more security).
3. Add environment variables:

- **Mobile (`TindaGo`)**
  - In your Expo env (e.g. `.env` or app config):
    - `EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name`
    - `EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET=your_upload_preset`

- **Admin (`tindago-admin`)** (if you will upload from web as well):
  - `.env.local`:
    - `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name`
    - `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=your_upload_preset`

### 2.2 Create an upload helper (mobile)

Create a helper, e.g. `src/lib/upload/cloudinary.ts`:

```ts
export async function uploadImageToCloudinary(localUri: string): Promise<string> {
  const cloudName = process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

  if (!cloudName || !uploadPreset) {
    throw new Error('Cloudinary env vars not set');
  }

  const formData = new FormData();
  formData.append('file', {
    uri: localUri,
    name: 'upload.jpg',
    type: 'image/jpeg',
  } as any);
  formData.append('upload_preset', uploadPreset);

  const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: 'POST',
    body: formData,
  });

  const json = await res.json();
  if (!res.ok) {
    console.error('Cloudinary error:', json);
    throw new Error('Failed to upload to Cloudinary');
  }

  return json.secure_url as string; // URL to store in Realtime DB
}
```

For PDFs or other documents, use Cloudinary's `raw` resource type or an alternative file storage provider.

### 2.3 Use Cloudinary URLs instead of base64 in Realtime DB

Where you currently create a product (e.g. `app/(main)/(store-owner)/profile/add-product.tsx`):

1. After user selects an image, upload it to Cloudinary:

   ```ts
   const imageUrl = await uploadImageToCloudinary(selectedImageLocalUri);
   ```

2. When constructing `productData` to save in Realtime DB, store the URL, not base64:

   ```ts
   const productData = {
     productName: productName.trim(),
     description: description.trim(),
     // ... other fields
     productImageUrl: imageUrl,
     status: 'active',
   };
   ```

3. In product display components, use `productImageUrl`, but keep a fallback for old base64 data so existing records still render:

   ```ts
   const imageSource = product.productImageUrl
     ? { uri: product.productImageUrl }
     : product.productImage
       ? { uri: product.productImage } // legacy base64
       : undefined;
   ```

4. Apply similar patterns for:
   - Store logos and cover images (`stores/{uid}` and `store_registrations/{uid}`).
   - Registration documents (Cloudinary or other file storage). For documents, you store a URL field like `documentUrl` instead of embedding `data:application/pdf;base64,...`.

**Result:** Realtime Database stores only small strings (URLs) instead of huge base64 blobs, drastically reducing payload sizes.

---

## Phase 3 – Create a New Firebase Project (Fresh 10 GB)

**Objective:** Move the app to a brand‑new Firebase project with a fresh download quota, while using the improved access patterns and Cloudinary.

### 3.1 Create the new project

1. In Firebase Console → `Add project`.
2. Choose a name (e.g. `tindago-prod-v2` or `tindago-dev-new`).
3. Disable Google Analytics if not needed.
4. Once created:
   - Add a **Web app** (for admin) to get Firebase config.
   - For mobile, you can reuse the same config or create a separate app entry.

### 3.2 Enable services

1. **Realtime Database**
   - Go to Realtime Database → Create database.
   - Choose the same region as before if possible.
   - Set security rules similar to your current project (copy & adapt).

2. **Authentication**
   - Enable the auth providers you use (likely Email/Password).

You do **not** import existing data yet—the new DB starts empty.

### 3.3 Point the mobile app to the new project

Update your Expo env (e.g. `.env`) used by `src/lib/firebase/config.ts`:

```env
EXPO_PUBLIC_FIREBASE_API_KEY=...
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=...
EXPO_PUBLIC_FIREBASE_DATABASE_URL=https://your-new-project-id.firebaseio.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=...
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=...
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
EXPO_PUBLIC_FIREBASE_APP_ID=...
```

Values come from the Firebase console → Project settings → Your apps.

Then restart the mobile app so it picks up the new env vars.

### 3.4 Point the admin app to the new project

Update `.env.local` in `tindago-admin`:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://your-new-project-id.firebaseio.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
```

Restart the Next.js dev server so it uses the new environment.

**Result:** Both mobile and admin apps now talk to the **new** Realtime Database project with a fresh 10 GB monthly download quota.

---

## Phase 4 – Create Test Data in the New Project

**Objective:** Ensure everything works end‑to‑end with the new project + Cloudinary + reduced reads.

1. Run the mobile app against the new project.
2. Register a test user (customer) and test store owner.
3. As a store owner, complete the registration flow:
   - Store details (with logo & cover image → stored in Cloudinary).
   - Documents (PDF/ID) → stored in Cloudinary or other file storage.
4. Add a few products with images.
5. Run `tindago-admin` against the new project:
   - Verify users show up in the admin lists.
   - Verify store registrations and stores appear.
   - Approve a registration and see it reflected in `stores`.

Once this works, your new project is ready for real use.

---

## Phase 5 – Monitor New Project Usage

**Objective:** Confirm that the new design actually keeps Realtime Database usage low.

1. In the new Firebase project, go to **Usage → Realtime Database → Downloads**.
2. Use the app/admin normally for a few days.
3. Check:
   - Daily download usage should be **much lower** than with the old project.
   - No sudden spikes from list pages (home, stores, see‑more, admin tables).

If you remain well under 10 GB/month with real usage, you can stay on the Spark (no‑cost) plan.

---

## Phase 6 – Optional: Firestore / BigQuery for Analytics

If later you need more advanced reporting (e.g. monthly sales per store, customer lifetime value, etc.), you can add:

- **Cloud Functions** that listen to Realtime Database changes (orders, payouts, etc.) and:
  - Mirror summarized data into **Firestore** for complex querying, or
  - Stream events into **BigQuery** for analytics dashboards.

This is optional and not required to solve your current download quota issue. The most important improvements are **reducing chattiness (Phase 1)** and **moving heavy media out of RTDB (Phase 2)**.

---

## Quick Checklist

Use this section as a short to‑do list.

1. **Reduce Realtime DB reads**
   - [ ] Replace `onValue('products')` in all customer screens with one‑time `get()`.
   - [ ] Replace `onValue('stores')` in customer screens with one‑time `get()`.
   - [ ] Update all `subscribeTo*` methods in `tindago-admin` to fetch once instead of using `onValue`.

2. **Integrate Cloudinary**
   - [ ] Create Cloudinary account and upload preset.
   - [ ] Add Cloudinary env vars to mobile and admin.
   - [ ] Implement `uploadImageToCloudinary` helper.
   - [ ] Use Cloudinary URLs for **new product images** (stop writing base64).
   - [ ] Extend to store logos and documents.

3. **New Firebase project**
   - [ ] Create new project and enable Realtime Database + Auth.
   - [ ] Copy config into `EXPO_PUBLIC_FIREBASE_*` for mobile.
   - [ ] Copy config into `NEXT_PUBLIC_FIREBASE_*` for admin.
   - [ ] Restart both apps and ensure they connect.

4. **Smoke test**
   - [ ] Register test users and stores.
   - [ ] Add sample products and documents.
   - [ ] Verify everything appears in admin.

5. **Monitor**
   - [ ] Watch Realtime DB downloads for a few days.
   - [ ] Confirm monthly usage projection is safely under 10 GB.

With these steps completed, TindaGo should be able to run on the Spark plan without quickly hitting the Realtime Database download limits, and you’ll have a clean path to migrate old data later if needed.
