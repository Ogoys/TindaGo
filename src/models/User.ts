/**
 * User Model
 *
 * Defines the user data structure for both customers and store owners
 */

export interface User {
  id: string;
  email: string;
  name: string;
  userType: 'customer' | 'store-owner';
  phoneNumber: string;
  emailVerified: boolean;
  phoneVerified: boolean;
  profileComplete: boolean;
  profile?: {
    avatar?: string;
    address?: string;
    dateOfBirth?: Date;
  };
  preferences?: {
    notifications?: boolean;
    location?: {
      lat: number;
      lng: number;
    };
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface UserProfile {
  avatar?: string;
  phone?: string;
  address?: string;
  dateOfBirth?: Date;
}

export type UserRole = 'customer' | 'store-owner';
