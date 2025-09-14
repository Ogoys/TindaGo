import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type UserRole = 'customer' | 'store-owner';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  phoneNumber?: string;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  profileComplete: boolean;
}

interface UserContextType {
  user: User | null;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setUserRole: (role: UserRole) => void;
  logout: () => void;
  updateUserProfile: (updates: Partial<User>) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

interface UserProviderProps {
  children: ReactNode;
}

export function UserProvider({ children }: UserProviderProps) {
  const [user, setUserState] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load user data from AsyncStorage on app start
  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const userData = await AsyncStorage.getItem('user');
      if (userData) {
        setUserState(JSON.parse(userData));
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const setUser = async (newUser: User | null) => {
    try {
      if (newUser) {
        await AsyncStorage.setItem('user', JSON.stringify(newUser));
      } else {
        await AsyncStorage.removeItem('user');
      }
      setUserState(newUser);
    } catch (error) {
      console.error('Error saving user data:', error);
    }
  };

  const setUserRole = async (role: UserRole) => {
    if (user) {
      const updatedUser = { ...user, role };
      await setUser(updatedUser);
    }
  };

  const updateUserProfile = async (updates: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...updates };
      await setUser(updatedUser);
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.multiRemove(['user', 'authToken']);
      setUserState(null);
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  const value: UserContextType = {
    user,
    isLoading,
    setUser,
    setUserRole,
    logout,
    updateUserProfile,
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}