# Debug Checklist: Image Not Displaying

## Issue: "I didn't see well the image"

This could mean:
1. Image is not uploading to Cloudinary
2. Image is not saving to Firebase
3. Image is not displaying in the app
4. Image quality is poor

---

## Step 1: Check Console Logs When Adding Product

When you add a product, you should see these logs in order:

```
📤 Uploading image to Cloudinary...
✅ Image uploaded successfully: https://res.cloudinary.com/dkkfzpmtt/...
💾 Saving product data to Firebase...
✅ Product saved successfully
```

### ❌ If you see errors:
- `❌ Failed to upload image` → Check internet connection
- `Cloudinary configuration missing` → Check `.env` file
- `Upload preset not found` → Check Cloudinary dashboard for upload presets

---

## Step 2: Verify Environment Variables

Check your `.env` file:

```bash
cat .env | findstr CLOUDINARY
```

Should show:
```
EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME=dkkfzpmtt
EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET_IMAGES=tindago_images
EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET_DOCUMENTS=tindago_documents
```

### ❌ If missing:
1. Open `.env` file
2. Add the three lines above
3. Restart Expo: `npx expo start --clear`

---

## Step 3: Check Firebase Console

1. Open: https://console.firebase.google.com/
2. Select your project
3. Go to **Realtime Database**
4. Navigate to `products` node
5. Find your newly added product
6. Check if it has:
   - ✅ `productImageUrl: "https://res.cloudinary.com/dkkfzpmtt/..."` (NEW - should be there)
   - ❌ `productImage: "data:image/jpeg;base64,..."` (OLD - should NOT be there for new products)

### ❌ If both are missing:
- Image upload failed completely
- Check console logs for errors

### ❌ If only `productImage` exists (base64):
- Cloudinary upload failed, but fallback saved the image
- App will work but image won't be optimized
- Check Cloudinary configuration

---

## Step 4: Test Image URL in Browser

1. Copy the `productImageUrl` from Firebase
2. Paste it in your browser
3. Image should load

Example URL:
```
https://res.cloudinary.com/dkkfzpmtt/image/upload/v1234567890/products/abc123.jpg
```

### ❌ If image doesn't load in browser:
- URL is broken
- Image was not actually uploaded
- Cloudinary account issue

---

## Step 5: Check Cloudinary Dashboard

1. Login to: https://console.cloudinary.com/
2. Go to **Media Library**
3. Look for folder: `products/`
4. You should see your uploaded images with timestamps

### ❌ If no images in Cloudinary:
- Upload is not working
- Check upload preset settings
- Check API configuration

---

## Step 6: Check App Display

Run the app and check each screen:

### Home Screen
- [ ] Selected Store Products section shows images
- [ ] Best Selling section shows images
- [ ] Popular Picks section shows images
- [ ] Fresh Finds section shows images

### Product Details
- [ ] Product image carousel shows image
- [ ] Related products show images

### Search
- [ ] Search results show product images

### Category
- [ ] Category products show images

### ❌ If images don't display in app but URL works in browser:
This means the fallback helper might not be working correctly.

---

## Common Issues & Solutions

### Issue 1: "Upload preset not found"
**Solution:**
1. Go to Cloudinary dashboard
2. Settings → Upload → Upload presets
3. Create preset named `tindago_images`
4. Set to "Unsigned"
5. Folder: `products`

### Issue 2: "Image is blurry or low quality"
**Possible causes:**
- Original image is low resolution
- React Native Image component needs `resizeMode` adjustment
- Network issue loading the image

**Solution:**
Check the ProductCard component uses:
```typescript
resizeMode="contain" // or "cover"
```

### Issue 3: "Old products show images but new ones don't"
**Cause:** Cloudinary upload is failing, but base64 fallback still works for old data

**Solution:**
1. Check console logs for upload errors
2. Verify Cloudinary credentials
3. Check upload preset configuration

### Issue 4: "Console shows 'Image uploaded' but Firebase has no productImageUrl"
**Cause:** Upload succeeds but Firebase save fails

**Solution:**
Check the add-product.tsx code around line 556:
```typescript
const productData = {
  // ... other fields
  productImageUrl: productImageUrl, // Make sure this line exists
  // ... other fields
};
```

---

## Quick Test Command

Run this to verify environment variables are loaded:

```bash
npx expo start --clear
```

Then in the Metro bundler terminal, press 'r' to reload.

---

## Need More Help?

Provide these details:
1. **Console logs** when adding a product (copy the full output)
2. **Firebase data** for the product (screenshot or copy JSON)
3. **Cloudinary dashboard** screenshot (Media Library)
4. **Specific error messages** you see
5. **Which screens** show/don't show images

This will help diagnose the exact issue!
