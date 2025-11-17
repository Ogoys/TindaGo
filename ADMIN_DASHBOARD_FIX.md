# Admin Dashboard Data Fetching - FIXED ✅

## Problem
The tindago-admin dashboard was not displaying:
- Store Name, Owner Name, Email, Phone in Store Management table
- Business details in Pending Approval detail view  
- Submitted documents from Cloudinary in document viewer

## Root Cause
The API route `/api/admin/registrations/route.ts` was only mapping **flat legacy fields**, ignoring the **nested structure** that the React Native app saves to Firebase:

```typescript
// ❌ OLD CODE - Only flat fields
{
  storeName: registration.storeName || '',
  ownerName: registration.ownerName || '',
  email: registration.email || '',
  // Missing: personalInfo, businessInfo, documents with Cloudinary URLs
}
```

## What Was Fixed

### 1. API Route - `/api/admin/registrations/route.ts` (Lines 22-66)
**Changed from:** Only reading flat fields  
**Changed to:** Reading BOTH nested structure AND flat legacy fields

```typescript
// ✅ NEW CODE - Supports nested structure
const personalInfo = registration.personalInfo || {
  name: registration.ownerName || registration.name || '',
  email: registration.email || '',
  mobile: registration.phone || ''
};

const businessInfo = registration.businessInfo || {
  storeName: registration.storeName || '',
  description: registration.description || '',
  address: registration.address || registration.location?.address || '',
  city: registration.city || '',
  zipCode: registration.zipCode || '',
  businessType: registration.businessType || 'Sari-Sari Store',
  logo: registration.logo || null,
  coverImage: registration.coverImage || null
};

return {
  userId,
  personalInfo,          // ✅ Nested structure
  businessInfo,          // ✅ Nested structure  
  documents: registration.documents || {},  // ✅ With Cloudinary URLs
  paymentInfo: registration.paymentInfo || null,
  
  // Flat fields for backward compatibility
  storeName: businessInfo.storeName,
  ownerName: personalInfo.name,
  email: personalInfo.email,
  phone: personalInfo.mobile,
  address: businessInfo.address,
  // ...
};
```

### 2. Data Structure from Mobile App

#### Store Details (Mobile app saves to Firebase)
```json
{
  "store_registrations/{userId}": {
    "personalInfo": {
      "name": "Kenz Isuga",
      "email": "isugakenji576@gmail.com",
      "mobile": "09944528509"
    },
    "businessInfo": {
      "storeName": "Villa Abrille Store",
      "description": "A local sari-sari store",
      "address": "Villa Abrille Street, Poblacion District",
      "city": "Davao City",
      "zipCode": "8000",
      "businessType": "Sari-Sari Store",
      "logo": "https://res.cloudinary.com/dkkfzpmtt/...",
      "coverImage": "https://res.cloudinary.com/dkkfzpmtt/..."
    },
    "location": {
      "coordinates": { "latitude": 7.0731, "longitude": 125.6128 },
      "address": "Villa Abrille Street, Poblacion, Davao City",
      "formattedAddress": "..."
    },
    "documents": {
      "businessPermit": {
        "name": "permit.pdf",
        "url": "https://res.cloudinary.com/dkkfzpmtt/...",
        "type": "application/pdf",
        "size": 123456,
        "uploaded": true,
        "uploadedAt": 1731799999000
      },
      "validId": {
        "name": "valid-id.jpg",
        "url": "https://res.cloudinary.com/dkkfzpmtt/...",
        "type": "image/jpeg",
        "size": 234567,
        "uploaded": true,
        "uploadedAt": 1731799999000
      }
    },
    "status": "pending",
    "createdAt": "2025-11-17T00:00:00.000Z"
  }
}
```

#### Admin Dashboard Display (After fix)

**Store Management Table:**
| Store | Owner | Status | Joined |
|-------|-------|--------|--------|
| Villa Abrille Store | Kenz Isuga | Pending | Nov 17, 2025 |
| (email: isugakenji576@gmail.com) | (phone: 09944528509) | | |

**Pending Approval Detail:**
```
Business Owner:
  - Owner Name: Kenz Isuga  
  - Email: isugakenji576@gmail.com
  - Phone: 09944528509

Business Details:
  - Address: Villa Abrille Street, Poblacion District, Davao City
  - Business Type: Sari-Sari Store
  - Permit Type: Business Permit

Business Description:
  A local sari-sari store

Submitted Documents:
  ✅ Business Permit (permit.pdf) - View [Cloudinary URL]
  ✅ Valid ID (valid-id.jpg) - View [Cloudinary URL]
```

### 3. Component Support (Already Working)

The admin components were ALREADY checking for nested structure:
- `PendingApprovalDetail.tsx` lines 435-479: Reads `personalInfo` and `businessInfo`
- `StoreManagement.tsx` lines 122-161: Maps nested data to table
- Document viewer (line 835): Checks for Cloudinary `url` field

## Testing

1. **Register a store in mobile app** with:
   - Store details (name, description, address, logo, cover)
   - Location pin on map
   - Documents upload (business permit, valid ID)

2. **Open admin dashboard** at `tindago-admin.vercel.app/stores`
   - ✅ Store Management table shows: Store Name, Owner Name, Email, Phone, Address
   - ✅ Click "View All" on Pending (1) → Shows pending store
   - ✅ Click pending store → Shows all business details, owner info, documents

3. **Click "View" on documents**:
   - ✅ Opens Cloudinary URL in new tab
   - ✅ PDF documents open directly
   - ✅ Image documents display in browser

## Files Modified

1. `C:\CapsProj\tindago-admin\src\app\api\admin\registrations\route.ts` (Lines 22-66)
   - Added nested structure support
   - Maintains backward compatibility with flat fields

## Files Verified (No changes needed)

1. `C:\CapsProj\TindaGo\src\services\store\StoreRegistrationService.ts`
   - ✅ Saves nested structure correctly
   - ✅ Documents have Cloudinary `url` field

2. `C:\CapsProj\tindago-admin\src\components\admin\PendingApprovalDetail.tsx`
   - ✅ Already reads nested structure
   - ✅ Already supports Cloudinary URLs

3. `C:\CapsProj\tindago-admin\src\components\admin\StoreManagement.tsx`
   - ✅ Already maps nested data to table

## Summary

✅ **Fixed:** API route now reads nested `personalInfo` and `businessInfo`  
✅ **Fixed:** Documents with Cloudinary URLs properly fetched  
✅ **Result:** Admin dashboard displays all store registration data correctly  
✅ **Verified:** Mobile app saves data in correct nested structure  
✅ **Verified:** Admin components support nested structure  

**Status: PRODUCTION READY** 🚀
