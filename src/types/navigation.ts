/**
 * Navigation type definitions for TindaGo app
 * Based on Expo Router file-based routing
 */

export type AuthStackParamList = {
  onboarding: undefined;
  register: undefined;
  signin: undefined;
};

export type RootStackParamList = {
  "(auth)": undefined;
  index: undefined;
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}