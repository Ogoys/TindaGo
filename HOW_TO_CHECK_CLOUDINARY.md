# How to Check Cloudinary Dashboard

## Step 1: Login to Cloudinary
1. Go to: https://cloudinary.com/
2. Click **Login** (top right)
3. Sign in with the Google account you used to create the account

## Step 2: View Media Library
Once logged in, you'll see the dashboard:

1. Click **Media Library** in the left sidebar (or top menu)
2. You'll see all uploaded images here

## Step 3: Check Upload Status
Look for images with names like:
- `products/[timestamp]` - Product images
- `stores/logos/[timestamp]` - Store logos
- `stores/documents/[timestamp]` - Documents

## Step 4: View Image Details
Click on any image to see:
- **Public URL** - The Cloudinary URL that should be saved in Firebase
- **File size** - How much space it's using
- **Upload date** - When it was uploaded
- **Transformations** - If any optimization was applied

## Step 5: Test Image URL
Copy the image URL and paste it in your browser:
```
https://res.cloudinary.com/dkkfzpmtt/image/upload/v[timestamp]/[public_id]
```

If the image loads in browser, then Cloudinary is working correctly.

---

## Quick Links
- Dashboard: https://console.cloudinary.com/
- Media Library: https://console.cloudinary.com/console/c-[id]/media_library
- Settings: https://console.cloudinary.com/console/c-[id]/settings

---

## What to Check If Images Don't Appear

### In Cloudinary Dashboard
- [ ] Are there any images in Media Library?
- [ ] Do the images have the correct folder structure? (products/, stores/logos/, etc.)
- [ ] Do the URLs start with `https://res.cloudinary.com/dkkfzpmtt/`?

### In Firebase
- [ ] Open Firebase Console → Realtime Database
- [ ] Find a product node
- [ ] Does it have `productImageUrl` field?
- [ ] Copy the URL and test in browser

### In App Console Logs
- [ ] When adding product, do you see: `📤 Uploading image to Cloudinary...`?
- [ ] Do you see: `✅ Image uploaded successfully: https://res.cloudinary.com/...`?
- [ ] Any error messages?
