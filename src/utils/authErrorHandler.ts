import { router } from 'expo-router';
import { Alert } from 'react-native';
import { FirebaseError } from 'firebase/app';

/**
 * Error types for authentication flows
 */
export enum AuthErrorType {
  FIREBASE_AUTH = 'firebase_auth',
  DATABASE = 'database',
  EMAIL_VERIFICATION = 'email_verification',
  PHONE_VERIFICATION = 'phone_verification',
  NETWORK = 'network',
  VALIDATION = 'validation',
  UNKNOWN = 'unknown',
}

/**
 * Structured error information
 */
export interface AuthErrorInfo {
  type: AuthErrorType;
  code?: string;
  title: string;
  message: string;
  recoverable: boolean;
  actions?: ErrorAction[];
}

/**
 * Action buttons for error alerts
 */
export interface ErrorAction {
  text: string;
  onPress?: () => void;
  style?: 'default' | 'cancel' | 'destructive';
}

/**
 * Firebase Auth error code mappings
 */
const FIREBASE_AUTH_ERRORS: Record<string, Omit<AuthErrorInfo, 'type' | 'code'>> = {
  // Account existence errors
  'auth/email-already-in-use': {
    title: 'Email Already Exists',
    message: 'An account with this email already exists. Would you like to sign in instead?',
    recoverable: true,
    actions: [
      {
        text: 'Sign In',
        onPress: () => router.push('/(auth)/signin'),
      },
      {
        text: 'Try Different Email',
        style: 'cancel',
      },
    ],
  },
  'auth/user-not-found': {
    title: 'Account Not Found',
    message: 'No account found with this email or phone number. Would you like to register?',
    recoverable: true,
    actions: [
      {
        text: 'Register',
        onPress: () => router.push('/(auth)/register'),
      },
      {
        text: 'Try Again',
        style: 'cancel',
      },
    ],
  },
  'auth/invalid-credential': {
    title: 'Invalid Credentials',
    message: 'The email or password is incorrect. Please check your credentials and try again.',
    recoverable: true,
  },

  // Password errors
  'auth/wrong-password': {
    title: 'Incorrect Password',
    message: 'The password you entered is incorrect. Please try again or reset your password.',
    recoverable: true,
  },
  'auth/weak-password': {
    title: 'Weak Password',
    message: 'Password must be at least 6 characters with a mix of letters and numbers.',
    recoverable: true,
  },
  'auth/invalid-login-credentials': {
    title: 'Invalid Credentials',
    message: 'The credentials you provided are invalid. Please check and try again.',
    recoverable: true,
  },

  // Email validation errors
  'auth/invalid-email': {
    title: 'Invalid Email',
    message: 'The email address format is invalid. Please check and try again.',
    recoverable: true,
  },

  // Account status errors
  'auth/user-disabled': {
    title: 'Account Disabled',
    message: 'This account has been disabled. Please contact support for assistance.',
    recoverable: false,
  },

  // Rate limiting errors
  'auth/too-many-requests': {
    title: 'Too Many Attempts',
    message: 'Too many failed attempts. Your account has been temporarily locked. Please try again later or reset your password.',
    recoverable: true,
  },

  // Network errors
  'auth/network-request-failed': {
    title: 'Network Error',
    message: 'Unable to connect to the server. Please check your internet connection and try again.',
    recoverable: true,
  },

  // Service errors
  'auth/operation-not-allowed': {
    title: 'Service Unavailable',
    message: 'This authentication method is currently disabled. Please contact support.',
    recoverable: false,
  },
  'auth/app-deleted': {
    title: 'Service Error',
    message: 'Authentication service is unavailable. Please try again later.',
    recoverable: false,
  },
  'auth/invalid-api-key': {
    title: 'Configuration Error',
    message: 'App configuration error. Please contact support.',
    recoverable: false,
  },
  'auth/web-storage-unsupported': {
    title: 'Storage Error',
    message: "Your device doesn't support local storage. Please enable cookies/storage and try again.",
    recoverable: false,
  },

  // Additional errors
  'auth/popup-closed-by-user': {
    title: 'Authentication Cancelled',
    message: 'The authentication process was cancelled.',
    recoverable: true,
  },
  'auth/requires-recent-login': {
    title: 'Session Expired',
    message: 'Please sign in again to continue with this action.',
    recoverable: true,
  },
};

/**
 * Parse Firebase error into structured error info
 */
function parseFirebaseError(error: FirebaseError): AuthErrorInfo {
  const errorCode = error.code;
  const errorMapping = FIREBASE_AUTH_ERRORS[errorCode];

  if (errorMapping) {
    return {
      type: AuthErrorType.FIREBASE_AUTH,
      code: errorCode,
      ...errorMapping,
    };
  }

  // Unknown Firebase error
  return {
    type: AuthErrorType.FIREBASE_AUTH,
    code: errorCode,
    title: 'Authentication Error',
    message: `An authentication error occurred: ${error.message}`,
    recoverable: true,
  };
}

/**
 * Parse database error into structured error info
 */
function parseDatabaseError(error: Error): AuthErrorInfo {
  const message = error.message.toLowerCase();

  if (message.includes('permission')) {
    return {
      type: AuthErrorType.DATABASE,
      title: 'Permission Denied',
      message: 'You do not have permission to access this data. Your account may need additional setup.',
      recoverable: true,
    };
  }

  if (message.includes('network')) {
    return {
      type: AuthErrorType.NETWORK,
      title: 'Network Error',
      message: 'Network error while accessing the database. Please check your connection.',
      recoverable: true,
    };
  }

  return {
    type: AuthErrorType.DATABASE,
    title: 'Database Error',
    message: 'Failed to access account data. Please try again.',
    recoverable: true,
  };
}

/**
 * Parse generic error into structured error info
 */
export function parseAuthError(error: unknown): AuthErrorInfo {
  // Handle null/undefined
  if (!error) {
    return {
      type: AuthErrorType.UNKNOWN,
      title: 'Unknown Error',
      message: 'An unexpected error occurred. Please try again.',
      recoverable: true,
    };
  }

  // Handle Firebase errors
  if (typeof error === 'object' && 'code' in error && typeof error.code === 'string') {
    const firebaseError = error as FirebaseError;
    if (firebaseError.code.startsWith('auth/')) {
      return parseFirebaseError(firebaseError);
    }
  }

  // Handle Error objects
  if (error instanceof Error) {
    const message = error.message.toLowerCase();

    // Database errors
    if (message.includes('database')) {
      return parseDatabaseError(error);
    }

    // Email verification errors
    if (message.includes('verification') || message.includes('verify')) {
      return {
        type: AuthErrorType.EMAIL_VERIFICATION,
        title: 'Verification Error',
        message: 'Failed to send verification email. You can request a new one after signing in.',
        recoverable: true,
      };
    }

    // Phone errors
    if (message.includes('phone')) {
      return {
        type: AuthErrorType.PHONE_VERIFICATION,
        title: 'Phone Verification Error',
        message: error.message,
        recoverable: true,
      };
    }

    // Network errors
    if (message.includes('network') || message.includes('timeout') || message.includes('connection')) {
      return {
        type: AuthErrorType.NETWORK,
        title: 'Network Error',
        message: 'Unable to connect. Please check your internet connection and try again.',
        recoverable: true,
      };
    }

    // Generic error
    return {
      type: AuthErrorType.UNKNOWN,
      title: 'Error',
      message: error.message || 'An unexpected error occurred. Please try again.',
      recoverable: true,
    };
  }

  // Handle string errors
  if (typeof error === 'string') {
    return {
      type: AuthErrorType.UNKNOWN,
      title: 'Error',
      message: error,
      recoverable: true,
    };
  }

  // Unknown error type
  return {
    type: AuthErrorType.UNKNOWN,
    title: 'Unknown Error',
    message: 'An unexpected error occurred. Please try again.',
    recoverable: true,
  };
}

/**
 * Display error alert with appropriate actions
 */
export function showAuthError(errorInfo: AuthErrorInfo, additionalActions?: ErrorAction[]): void {
  const actions: ErrorAction[] = [];

  // Add custom actions from error info
  if (errorInfo.actions && errorInfo.actions.length > 0) {
    actions.push(...errorInfo.actions);
  } else if (additionalActions && additionalActions.length > 0) {
    // Add additional actions if no default actions
    actions.push(...additionalActions);
  } else {
    // Default actions
    actions.push({
      text: errorInfo.recoverable ? 'Try Again' : 'OK',
      style: 'default',
    });
    
    if (errorInfo.recoverable) {
      actions.push({
        text: 'Cancel',
        style: 'cancel',
      });
    }
  }

  Alert.alert(errorInfo.title, errorInfo.message, actions);
}

/**
 * Handle authentication error with consistent behavior
 * @param error - The error to handle
 * @param context - Context about where the error occurred (e.g., 'registration', 'sign-in')
 * @param customActions - Optional custom actions to show
 * @returns The parsed error info
 */
export function handleAuthError(
  error: unknown,
  context?: string,
  customActions?: ErrorAction[]
): AuthErrorInfo {
  const errorInfo = parseAuthError(error);

  // Show error to user (console.error removed to keep logs clean)
  showAuthError(errorInfo, customActions);

  return errorInfo;
}

/**
 * Create custom error with additional context
 */
export function createAuthError(
  type: AuthErrorType,
  title: string,
  message: string,
  recoverable: boolean = true,
  actions?: ErrorAction[]
): AuthErrorInfo {
  return {
    type,
    title,
    message,
    recoverable,
    actions,
  };
}

/**
 * Validation error helper
 */
export function createValidationError(message: string): AuthErrorInfo {
  return createAuthError(AuthErrorType.VALIDATION, 'Validation Error', message, true);
}
