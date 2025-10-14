/**
 * Store Model
 *
 * Defines the store (sari-sari store) data structure
 */

export interface Store {
  id: string;
  name: string;
  ownerId: string;
  description: string;
  address: StoreAddress;
  logoUrl: string;
  coverImageUrl: string;
  status: 'active' | 'inactive' | 'suspended';
  rating: number;
  totalReviews: number;
  totalOrders?: number;
  businessInfo?: {
    tin?: string;
    dtiRegistration?: string;
    businessPermit?: string;
    barangayClearance?: string;
  };
  operatingHours?: {
    monday?: { open: string; close: string };
    tuesday?: { open: string; close: string };
    wednesday?: { open: string; close: string };
    thursday?: { open: string; close: string };
    friday?: { open: string; close: string };
    saturday?: { open: string; close: string };
    sunday?: { open: string; close: string };
  };
  contact?: {
    phone?: string;
    email?: string;
    facebook?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface StoreAddress {
  street: string;
  barangay: string;
  city: string;
  province?: string;
  zipCode?: string;
  coordinates: {
    lat: number;
    lng: number;
  };
}

export interface StoreRegistration {
  uid: string;
  personalInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
  };
  businessInfo: {
    storeName: string;
    description: string;
    address: StoreAddress;
    logo?: string;
    coverImage?: string;
  };
  documents: {
    barangayBusinessClearance?: string;  // base64
    businessPermit?: string;             // base64
    dtiRegistration?: string;            // base64
    validId?: string;                    // base64
  };
  bankDetails: {
    bankName: string;
    accountName: string;
    accountNumber: string;
  };
  status: 'pending' | 'approved' | 'rejected';
  rejectionReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface StoreReview {
  id: string;
  storeId: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  orderId?: string;
  createdAt: Date;
}
