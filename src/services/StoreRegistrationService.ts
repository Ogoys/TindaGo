/**
 * Store Registration Service
 *
 * Centralized service for handling all store registration operations
 * with standardized data structure and Firebase integration.
 * Ensures consistency between React Native app and web admin dashboard.
 */

import { ref, set, update, get, onValue, serverTimestamp } from 'firebase/database';
import { auth, database } from '../../FirebaseConfig';
import { STORE_STATUS } from '../constants/StoreStatus';

// Types for store registration data
export interface StoreRegistrationData {
  personalInfo: {
    name: string;
    email: string;
    mobile: string;
  };
  businessInfo: {
    storeName: string;
    description: string;
    address: string;
    city: string;
    zipCode: string;
    businessType: string;
    logo?: string | null;
    coverImage?: string | null;
  };
  documents?: {
    barangayBusinessClearance?: DocumentInfo;
    businessPermit?: DocumentInfo;
    dtiRegistration?: DocumentInfo;
    validId?: DocumentInfo;
  };
  paymentInfo?: {
    method: 'gcash' | 'paymaya' | 'bank_transfer';
    accountName: string;
    accountNumber: string;
    verified: boolean;
  };
  status: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: number;
}

export interface DocumentInfo {
  name: string;
  uri: string;
  type: string;
  uploaded: boolean;
  uploadedAt: any; // Firebase serverTimestamp
}

export class StoreRegistrationService {

  /**
   * Submit complete store registration with standardized data structure
   */
  static async submitRegistration(registrationData: Partial<StoreRegistrationData>): Promise<void> {
    if (!auth.currentUser) {
      throw new Error('User not authenticated');
    }

    const userId = auth.currentUser.uid;
    const timestamp = new Date().toISOString();

    const registration: StoreRegistrationData = {
      personalInfo: {
        name: registrationData.personalInfo?.name || '',
        email: registrationData.personalInfo?.email || '',
        mobile: registrationData.personalInfo?.mobile || '',
      },
      businessInfo: {
        storeName: registrationData.businessInfo?.storeName || '',
        description: registrationData.businessInfo?.description || '',
        address: registrationData.businessInfo?.address || '',
        city: registrationData.businessInfo?.city || '',
        zipCode: registrationData.businessInfo?.zipCode || '',
        businessType: 'Sari-Sari Store',
        logo: registrationData.businessInfo?.logo || null,
        coverImage: registrationData.businessInfo?.coverImage || null,
      },
      documents: registrationData.documents,
      paymentInfo: registrationData.paymentInfo,
      status: STORE_STATUS.PENDING, // Standardized status
      createdAt: timestamp,
      updatedAt: timestamp,
      completedAt: Date.now(),
    };

    // Save to store_registrations collection for admin dashboard
    const registrationRef = ref(database, `store_registrations/${userId}`);
    await set(registrationRef, registration);

    // Also save to stores collection for app operations
    const storeRef = ref(database, `stores/${userId}`);
    await set(storeRef, {
      ...registration,
      isOpen: false,
      businessComplete: true,
      adminApproved: false,
    });

    console.log('✅ Store registration submitted successfully with status: pending');
  }

  /**
   * Update store details (step 1 of registration)
   */
  static async updateStoreDetails(storeData: {
    ownerName: string;
    ownerMobile: string;
    ownerEmail: string;
    storeName: string;
    description: string;
    storeAddress: string;
    city: string;
    zipCode: string;
    logo?: string | null;
    coverImage?: string | null;
  }): Promise<void> {
    if (!auth.currentUser) {
      throw new Error('User not authenticated');
    }

    const userId = auth.currentUser.uid;
    const timestamp = new Date().toISOString();

    const storeDetails = {
      personalInfo: {
        name: storeData.ownerName,
        email: storeData.ownerEmail,
        mobile: storeData.ownerMobile,
      },
      businessInfo: {
        storeName: storeData.storeName,
        description: storeData.description,
        address: storeData.storeAddress,
        city: storeData.city,
        zipCode: storeData.zipCode,
        businessType: 'Sari-Sari Store',
        logo: storeData.logo,
        coverImage: storeData.coverImage,
      },
      status: STORE_STATUS.PENDING_DOCUMENTS,
      createdAt: timestamp,
      updatedAt: timestamp,
      documentsUploaded: false,
      businessVerified: false,
      adminApproved: false,
    };

    // Debug logging
    console.log('📸 Saving store details with images:');
    console.log('  - Logo:', storeData.logo ? `${storeData.logo.substring(0, 50)}...` : 'null');
    console.log('  - Cover:', storeData.coverImage ? `${storeData.coverImage.substring(0, 50)}...` : 'null');
    console.log('  - Path: store_registrations/' + userId + '/businessInfo');

    // Update both collections
    const storeRef = ref(database, `stores/${userId}`);
    await set(storeRef, storeDetails);

    const registrationRef = ref(database, `store_registrations/${userId}`);
    await update(registrationRef, {
      personalInfo: storeDetails.personalInfo,
      businessInfo: storeDetails.businessInfo,
      status: STORE_STATUS.PENDING_DOCUMENTS,
      updatedAt: timestamp,
    });

    console.log('✅ Store details saved to Firebase successfully');
    console.log('  - Stores collection: stores/' + userId);
    console.log('  - Registrations collection: store_registrations/' + userId);

    // Update user profile
    const userRef = ref(database, `users/${userId}/profile`);
    await update(userRef, {
      phone: storeData.ownerMobile,
      storeDetailsComplete: true,
      businessComplete: false,
      updatedAt: timestamp,
    });
  }

  /**
   * Update documents (step 2 of registration)
   */
  static async updateDocuments(documents: {
    barangayBusinessClearance: any;
    businessPermit: any;
    dtiRegistration: any;
    validId: any;
  }): Promise<void> {
    if (!auth.currentUser) {
      throw new Error('User not authenticated');
    }

    const userId = auth.currentUser.uid;
    const timestamp = new Date().toISOString();

    // Debug logging for document upload status
    console.log('📄 Processing documents for Firebase:');
    console.log('  - Barangay Clearance:', documents.barangayBusinessClearance ? '✅ Uploaded' : '⏭️ Skipped (uploaded: false)');
    console.log('  - Business Permit:', documents.businessPermit ? '✅ Uploaded' : '❌ Missing (uploaded: false)');
    console.log('  - DTI Registration:', documents.dtiRegistration ? '✅ Uploaded' : '⏭️ Skipped (uploaded: false)');
    console.log('  - Valid ID:', documents.validId ? '✅ Uploaded' : '❌ Missing (uploaded: false)');

    // Build documents object - only mark as uploaded if document exists
    const documentsData = {
      documents: {
        barangayBusinessClearance: documents.barangayBusinessClearance ? {
          name: documents.barangayBusinessClearance.name || '',
          uri: documents.barangayBusinessClearance.uri || '',
          type: documents.barangayBusinessClearance.mimeType || '',
          uploaded: true,
          uploadedAt: serverTimestamp(),
        } : {
          name: '',
          uri: '',
          type: '',
          uploaded: false,
          uploadedAt: null,
        },
        businessPermit: documents.businessPermit ? {
          name: documents.businessPermit.name || '',
          uri: documents.businessPermit.uri || '',
          type: documents.businessPermit.mimeType || '',
          uploaded: true,
          uploadedAt: serverTimestamp(),
        } : {
          name: '',
          uri: '',
          type: '',
          uploaded: false,
          uploadedAt: null,
        },
        dtiRegistration: documents.dtiRegistration ? {
          name: documents.dtiRegistration.name || '',
          uri: documents.dtiRegistration.uri || '',
          type: documents.dtiRegistration.mimeType || '',
          uploaded: true,
          uploadedAt: serverTimestamp(),
        } : {
          name: '',
          uri: '',
          type: '',
          uploaded: false,
          uploadedAt: null,
        },
        validId: documents.validId ? {
          name: documents.validId.name || '',
          uri: documents.validId.uri || '',
          type: documents.validId.mimeType || '',
          uploaded: true,
          uploadedAt: serverTimestamp(),
        } : {
          name: '',
          uri: '',
          type: '',
          uploaded: false,
          uploadedAt: null,
        },
      },
      status: STORE_STATUS.PENDING, // Changed: DocumentUpload is now final step
      documentsUploaded: true,
      updatedAt: timestamp,
    };

    // Update both collections
    const storeRef = ref(database, `stores/${userId}`);
    await update(storeRef, documentsData);

    const registrationRef = ref(database, `store_registrations/${userId}`);
    await update(registrationRef, {
      documents: documentsData.documents,
      status: STORE_STATUS.PENDING, // Changed: Ready for admin review
      documentsUploadedAt: serverTimestamp(),
      updatedAt: timestamp,
    });

    // Update user profile
    const userRef = ref(database, `users/${userId}/profile`);
    await update(userRef, {
      documentsComplete: true,
      updatedAt: timestamp,
    });
  }

  /**
   * Update payment details (step 3 of registration)
   */
  static async updatePaymentDetails(paymentData: {
    paymentMethod: 'gcash' | 'paymaya' | 'bank_transfer';
    accountName: string;
    accountNumber: string;
  }): Promise<void> {
    if (!auth.currentUser) {
      throw new Error('User not authenticated');
    }

    const userId = auth.currentUser.uid;
    const timestamp = new Date().toISOString();

    const paymentInfo = {
      paymentInfo: {
        method: paymentData.paymentMethod,
        accountName: paymentData.accountName.trim(),
        accountNumber: paymentData.accountNumber.trim(),
        verified: false,
        addedAt: serverTimestamp(),
      },
      status: STORE_STATUS.PENDING, // Standardized status
      bankDetailsComplete: true,
      businessComplete: true,
      registrationCompletedAt: serverTimestamp(),
      updatedAt: timestamp,
    };

    // Update both collections
    const storeRef = ref(database, `stores/${userId}`);
    await update(storeRef, paymentInfo);

    const registrationRef = ref(database, `store_registrations/${userId}`);
    await update(registrationRef, {
      paymentInfo: paymentInfo.paymentInfo,
      status: STORE_STATUS.PENDING, // Standardized status
      paymentDetailsAt: serverTimestamp(),
      completedAt: Date.now(),
      updatedAt: timestamp,
    });

    // Update user profile
    const userRef = ref(database, `users/${userId}/profile`);
    await update(userRef, {
      bankDetailsComplete: true,
      businessComplete: true,
      updatedAt: timestamp,
    });
  }

  /**
   * Get current registration status
   */
  static async getRegistrationStatus(userId?: string): Promise<string | null> {
    const targetUserId = userId || auth.currentUser?.uid;
    if (!targetUserId) {
      throw new Error('User ID required');
    }

    const statusRef = ref(database, `store_registrations/${targetUserId}/status`);
    const snapshot = await get(statusRef);
    return snapshot.exists() ? snapshot.val() : null;
  }

  /**
   * Get complete registration data
   */
  static async getRegistrationData(userId?: string): Promise<StoreRegistrationData | null> {
    const targetUserId = userId || auth.currentUser?.uid;
    if (!targetUserId) {
      throw new Error('User ID required');
    }

    const registrationRef = ref(database, `store_registrations/${targetUserId}`);
    const snapshot = await get(registrationRef);
    return snapshot.exists() ? snapshot.val() : null;
  }

  /**
   * Subscribe to real-time status updates
   */
  static subscribeToStatusUpdates(
    userId: string,
    callback: (status: string | null) => void
  ): () => void {
    const statusRef = ref(database, `store_registrations/${userId}/status`);

    const unsubscribe = onValue(statusRef, (snapshot) => {
      const status = snapshot.exists() ? snapshot.val() : null;
      callback(status);
    });

    return unsubscribe;
  }

  /**
   * Subscribe to complete registration updates
   */
  static subscribeToRegistrationUpdates(
    userId: string,
    callback: (data: StoreRegistrationData | null) => void
  ): () => void {
    const registrationRef = ref(database, `store_registrations/${userId}`);

    const unsubscribe = onValue(registrationRef, (snapshot) => {
      const data = snapshot.exists() ? snapshot.val() : null;
      callback(data);
    });

    return unsubscribe;
  }

  /**
   * Check if registration is complete and ready for admin review
   */
  static async isRegistrationReadyForReview(userId?: string): Promise<boolean> {
    const status = await this.getRegistrationStatus(userId);
    return status === STORE_STATUS.PENDING;
  }

  /**
   * Admin function: Update store status (for web dashboard)
   */
  static async updateStoreStatus(
    userId: string,
    newStatus: string,
    adminNotes?: string
  ): Promise<void> {
    const timestamp = new Date().toISOString();

    const updateData = {
      status: newStatus,
      updatedAt: timestamp,
      lastReviewedAt: serverTimestamp(),
      ...(adminNotes && { adminNotes }),
      ...(newStatus === STORE_STATUS.APPROVED && { approvedAt: serverTimestamp() }),
      ...(newStatus === STORE_STATUS.REJECTED && { rejectedAt: serverTimestamp() }),
      ...(newStatus === STORE_STATUS.ACTIVE && {
        activatedAt: serverTimestamp(),
        isOpen: true,
        adminApproved: true
      }),
    };

    // Update both collections
    const registrationRef = ref(database, `store_registrations/${userId}`);
    await update(registrationRef, updateData);

    const storeRef = ref(database, `stores/${userId}`);
    await update(storeRef, updateData);
  }

  /**
   * Migration helper: Convert legacy statuses to new standardized ones
   */
  static async migrateLegacyStatuses(): Promise<void> {
    // This would be used to migrate existing registrations
    // Implementation would scan database for old statuses and update them
    console.log('Migration helper for legacy statuses - implement as needed');
  }
}