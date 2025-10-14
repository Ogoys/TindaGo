# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

TindaGo is a React Native mobile application built with Expo, designed as a sari-sari store marketplace for ordering and inventory management. The app uses Firebase for backend services and is optimized for Philippine mobile commerce.

## Getting Started

### Initial Setup
1. `npm install` - Install dependencies
2. Copy `.env.example` to `.env` and add Firebase credentials
3. Ensure Firebase project is configured with Realtime Database enabled
4. `npm start` - Start development server

### Development Commands
- `npm start` or `npx expo start` - Start development server
- `npm run android` - Run on Android emulator
- `npm run ios` - Run on iOS simulator
- `npm run web` - Run in web browser
- `npm run lint` - Run ESLint for code quality
- `npm run reset-project` - Reset to blank app template (use with caution)

### TypeScript & Linting
- `npx tsc --noEmit` - Type checking without compilation
- `npx eslint . --ext .ts,.tsx` - Manual linting

### Development Server Options
Once `expo start` is running, you can:
- Press `a` - Open Android emulator
- Press `i` - Open iOS simulator
- Press `w` - Open web browser
- Scan QR code with Expo Go app for physical device testing

## Architecture & Structure

### File-based Routing (Expo Router v6.0.7)
The app uses file-based routing with nested route groups:
- `app/(auth)/` - Authentication flow screens (onboarding, signin, register, verification)
  - `app/(auth)/(store-owner)/` - Store owner registration flow (StoreRegistration, StoreDetails, DocumentUpload, BankDetails, RegistrationComplete)
- `app/(main)/` - Main app screens with role-based structure
  - `app/(main)/(customer)/` - Customer-specific screens (home, cart, orders, category, see-more)
  - `app/(main)/(store-owner)/` - Store owner-specific screens (home, orders, category, profile/*)
  - `app/(main)/shared/` - Shared screens (profile, product-details)
- `app/_layout.tsx` - Root layout with UserProvider context wrapper
- `app/(main)/_layout.tsx` - Main layout with auth/role validation and auto-routing
- `app/index.tsx` - Entry point that redirects to onboarding
- `app/role-selection.tsx` - User type selection screen

**Navigation Pattern:**
- Customer screens use Stack navigation with custom BottomNavigation component
- Store owner screens use nested layouts with profile subroutes
- Auto-redirects based on user state (no user → auth, no role → role-selection, role → home)

### Key Architectural Patterns
- **Component-first**: Reusable UI components in `src/components/ui/`
- **Service layer**: Business logic in `src/services/` (PhoneVerificationService, StoreRegistrationService, NotificationService)
- **Context-based state**: UserContext (`src/contexts/UserContext.tsx`) manages global user state with AsyncStorage persistence
- **Responsive design**: Figma baseline (440x956) with scaling functions
- **Type safety**: Full TypeScript with strict mode and path aliases (@/* → src/*)

### State Management
- **UserContext**: Global user state managed via React Context
  - User data persisted to AsyncStorage
  - Provides: `user`, `isLoading`, `setUser`, `setUserRole`, `logout`, `updateUserProfile`
  - User model: `{ id, email, role, phoneNumber, isEmailVerified, isPhoneVerified, profileComplete }`
  - Roles: `'customer' | 'store-owner'`

### Core Technologies
- **React Native 0.79.5** with **React 19.0.0**
- **Expo SDK 54** with file-based routing
- **Firebase 12.2.1** (Authentication, Realtime Database, Storage)
- **TypeScript** with path aliases configured in tsconfig.json

## Styling & Responsive Design

### Design System
- **Colors**: Centralized in `src/constants/Colors.ts` (primary: #3BB77E, green theme)
- **Responsive scaling**: Based on Figma baseline (440x956) in `src/constants/responsive.ts`
  - Note: Individual screens may have different baselines (e.g., customer home uses 440x1827)
  - Always check Figma file comments for actual baseline dimensions
- **Fonts**: Managed in `src/constants/Fonts.ts`
- **Constants**: Additional constants in `src/constants/StoreStatus.ts`

### Scaling Functions
```typescript
import { s, vs, ms, responsive } from '@/constants/responsive';
// s() = scale, vs() = verticalScale, ms() = moderateScale
```

### Component Positioning
Components use exact Figma positioning with responsive scaling:
- Glassmorphism cards use absolute positioning with Figma coordinates
- All dimensions scaled from baseline (440x956) using scaling functions
- Modern blur effects with expo-blur for glassmorphism aesthetic

## Firebase Integration

### Configuration
- Firebase config in `FirebaseConfig.ts` with v12+ SDK
- Services initialized: Authentication (`getAuth`), Realtime Database (`getDatabase`), Firestore (`getFirestore`), Storage (`getStorage`)
- Database region: Asia Southeast (Singapore)
- **Environment Variables**: Required EXPO_PUBLIC_ prefixed variables in `.env` file:
  - `EXPO_PUBLIC_FIREBASE_API_KEY`
  - `EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN`
  - `EXPO_PUBLIC_FIREBASE_DATABASE_URL`
  - `EXPO_PUBLIC_FIREBASE_PROJECT_ID`
  - `EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET`
  - `EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
  - `EXPO_PUBLIC_FIREBASE_APP_ID`
- **Note**: Use `.env.example` as template for local setup

### Authentication Flow
1. Email/password registration with Firebase Auth
2. Email verification (required before proceeding)
3. Phone verification (SMS-based with custom service)
4. User type selection (customer/store owner)
5. Additional business verification for store owners

### Database Structure
Firebase Realtime Database (JSON tree structure) with these main collections:

**Primary Collections:**
- **users/{uid}**: Customer and store owner profiles with role-based access
  - Fields: `uid, name, email, userType, emailVerified, profile{avatar, phone, address}, preferences`
- **store_registrations/{uid}**: Store owner registration data (separate from users)
  - `personalInfo, businessInfo{storeName, description, address, logo, coverImage}, documents{barangayBusinessClearance, businessPermit, dtiRegistration, validId}, bankDetails`
- **stores/{storeId}**: Active store information after approval
- **products/{productId}**: Product catalog with inventory levels, pricing, descriptions
- **orders/{orderId}**: Customer orders with pickup-only fulfillment
- **sales/{saleId}**: Transaction tracking and revenue monitoring
- **inventory_logs/{logId}**: Stock changes and purchase order history
- **return_goods/{returnId}**: Customer return tracking and stock adjustments
- **damages_spoilage/{damageId}**: Loss tracking for damaged/expired items
- **reviews/{reviewId}**: Customer feedback and store ratings

**Important Notes:**
- Store registration data is in `store_registrations/{uid}` during approval process
- Documents stored as base64 strings in Realtime Database (not Storage)
- See `firebase-database-structure.md` and `firebase-actual-database-structure.md` for complete schemas

## Component Architecture

### UI Components (`src/components/ui/`)
- `Button.tsx` - Primary/secondary buttons with responsive design
- `FormInput.tsx` - Form input fields
- `GlassMorphismCard.tsx` - Modern card designs with blur effects and absolute positioning
- `ProductCard.tsx`, `StoreCard.tsx` - Display cards for products and stores
- `Typography.tsx` - Text styling components
- `BottomNavigation.tsx` - Custom bottom tab navigation (replaces @react-navigation/bottom-tabs)
- `CheckboxWithText.tsx` - Checkbox component with text labels
- `UserTypePicker.tsx` - Role selection UI component
- `PendingApprovalDetails.tsx` - Store owner approval status display
- `StatusBar.tsx` - Custom status bar wrapper
- `SignInGlassCard.tsx` - Signin screen glass card component

### Feature Components
- `onboarding/` - Onboarding flow components (HeroImageStack, OnboardingContent, ActionButtons)
- `phone-verification/` - SMS verification screens (PhoneVerificationScreen, PhoneVerificationCodeScreen)

### Services Layer (`src/services/`)
- **PhoneVerificationService**: SMS verification system
  - Development mode: Logs verification codes to console
  - Production ready: Supports Twilio/AWS SNS integration
  - Philippine phone number validation with international fallback
  - 4-digit codes with 5-minute expiry and 3-attempt limit
- **StoreRegistrationService**: Handles store owner registration workflow
  - Multi-step registration (personal info, business info, documents, bank details)
  - Document upload with base64 encoding
  - Firebase Realtime Database integration
- **NotificationService**: Push notification handling (Expo Notifications)

### Asset Organization
- Assets stored in `src/assets/images/[screen-name]/` following Figma structure
- Images organized by feature (e.g., `customer-home/categories/`, `customer-home/nav-*.png`)
- Icons and images downloaded from Figma using MCP tools

## Development Workflow

### Adding New Screens
1. Create screen file in appropriate route group (`app/(auth)/` or `app/(main)/`)
2. Follow kebab-case naming conventions
3. Use TypeScript with proper navigation typing
4. Import components using `@/` path alias
5. **ALWAYS use the TindaGo Design-to-Code Agent** for Figma-based screens

### Creating Components
1. Place in `src/components/` with appropriate subfolder structure
2. Export from `index.ts` files for clean imports
3. Use responsive scaling functions for consistent design
4. Follow glassmorphism patterns for modern aesthetic
5. **Use exact Figma coordinates** with baseline scaling for positioning
6. Add Figma documentation comments at top of screen files:
```typescript
/**
 * SCREEN NAME - DESCRIPTION
 *
 * Figma File: [fileKey]
 * Node: [nodeId] (Node Name)
 * Baseline: [width]x[height]
 *
 * Additional notes...
 */
```

### Business Requirements Implementation
Based on capstone project documentation, prioritize features in this order:

**Phase 1: Foundation**
- Store registration with document verification (Barangay Business Clearance, Business Permit, DTI Registration, Valid ID)
- Admin approval system for store verification
- Customer registration and authentication

**Phase 2: Core Operations**
- Inventory management with real-time stock monitoring
- Low stock alerts and inventory logging
- Product listing and customer ordering (pickup-only)
- Sales tracking and transaction recording

**Phase 3: Advanced Features**
- Return goods and spoilage tracking
- Damages and spoilage module for loss management
- Customer feedback and rating system
- Revenue tracking with percentage-based fees

### Testing Requirements
- **Jest** for backend/service testing
- **Black-box testing** for functionality validation
- **User acceptance testing** with actual sari-sari store owners
- **Cross-platform compatibility** testing (Android/iOS)

## Important Conventions

### Import Paths
- Use `@/` alias for src imports: `import { Button } from '@/components/ui'`
- Path alias configured in tsconfig.json and works in all files
- Maintain clean import structure with index.ts exports
- **Exception**: Some existing components use relative paths for constants (e.g., `import { Colors } from "../../constants/Colors"`)

### Package Management
- Key dependencies:
  - `expo-router` (v6.0.7) - File-based routing
  - `firebase` (v12.2.1) - Backend services
  - `react-native-size-matters` - Responsive scaling utilities
  - `@react-native-async-storage/async-storage` - Local data persistence
  - `expo-blur` - Glassmorphism effects
  - `expo-image-picker`, `expo-document-picker` - File uploads
  - `figma-context-mcp` - Figma design integration

### Styling Patterns
- Always use responsive scaling functions (s, vs, ms)
- Follow established color scheme from Colors.ts
- Prefer glassmorphism card designs with blur effects
- Use absolute positioning with Figma coordinate scaling

### Code Quality
- TypeScript strict mode enabled
- ESLint with Expo config
- Consistent async/await patterns for Firebase operations
- Proper error handling with user-friendly messages

## Figma Integration & Design-to-Code Workflow

The project includes comprehensive Figma Context MCP integration with specialized agent workflows:

### MCP Configuration
- figma-context-mcp dependency for design-to-code workflows
- Configuration in `.claude/mcp-settings.json` using npx approach
- No Figma Pro plan required - works with free accounts
- Baseline design dimensions: 440x956px

### TindaGo Design-to-Code Specialist Agent
Use the specialized agent from `doc/TindaGo-Design-to-Code-Agent.md` for pixel-perfect conversions:

**Mandatory Workflow for Each Screen:**
1. Get Figma URL from design requirements
2. Extract design data using `mcp__Framelink_Figma_MCP__get_figma_data`
3. Download all assets to `src/assets/images/[screen-name]/`
4. Create components using exact Figma coordinates + baseline scaling
5. Implement functionality (forms, navigation, validation)
6. Test spacing and adjust margins if content gets cut off
7. Ensure pixel-perfect match to Figma design

**Critical Error Prevention:**
- ❌ Never use: `import { Colors } from "@/constants/Colors"`
- ✅ Always use: `import { Colors } from "../../constants/Colors"`
- Always use exact Figma coordinates with responsive scaling
- Never guess positioning - extract from Figma data
- Add Figma coordinate comments in styles

### Agent Evolution System
- Document new errors/solutions in `doc/Agent-Evolution-Log.md`
- Version the design agent with each improvement
- Continuous learning workflow for enhanced accuracy

## Admin Dashboard Integration

### Separate Admin Project
The project includes a companion web admin dashboard for store owner verification:

**Location**: `../tindago-admin/` (sibling directory to TindaGo)

**Tech Stack**:
- Next.js 15.5.3 with React 19.1.0
- Firebase 12.2.1 (shared database with mobile app)
- Tailwind CSS for styling
- TypeScript

### Admin Dashboard Commands
```bash
cd ../tindago-admin
npm install              # Install dependencies
npm run dev              # Start development server (http://localhost:3000)
npm run build            # Production build
npm run start            # Start production server
```

### Admin-Mobile Integration Flow
1. Store owner completes registration in mobile app
2. Registration data saved to Firebase `store_registrations/{uid}` with `status: "pending"`
3. Admin dashboard displays pending registration in real-time
4. Admin reviews business documents and information
5. Admin approves/rejects registration
6. Mobile app receives real-time status update via Firebase listener
7. Push notification sent to store owner
8. On approval: Store data moved to `stores/{storeId}` collection

### Testing Admin Integration
Refer to these comprehensive testing guides:
- `ADMIN_VERIFICATION_CHECKLIST.md` - Quick verification steps
- `WEB_ADMIN_TESTING_GUIDE.md` - Complete testing procedures

**Key Integration Points**:
- Both apps must use identical Firebase configuration
- Status values must be consistent: `"pending"`, `"approved"`, `"rejected"`
- Mobile app uses `useStoreRegistration` hook for real-time sync
- Admin uses Firebase Realtime Database listeners
- Expected sync time: < 3 seconds for status updates

### Admin Dashboard Structure
```
tindago-admin/
├── src/
│   ├── app/              # Next.js App Router pages
│   ├── components/       # React components (admin UI)
│   └── lib/             # Firebase config and utilities
├── scripts/             # Migration and utility scripts
│   ├── migrate-usertype-to-customer.js
│   └── standardize-status.js
└── public/              # Static assets
```

## Database Migration Scripts

### Admin Dashboard Scripts
Available in `tindago-admin/` directory:

**User Type Migration**:
```bash
npm run migrate:usertype              # Run migration
npm run migrate:usertype:dry-run      # Preview changes without applying
npm run migrate:usertype:backup       # Backup data only
npm run migrate:usertype:rollback     # Rollback migration
```

**Status Standardization**:
```bash
npm run standardize:status            # Standardize all status values
npm run standardize:status:check      # Check status inconsistencies (dry run)
```

**Purpose**: These scripts ensure data consistency between mobile app and admin dashboard, particularly for `userType` fields and registration status values.

## Multi-Project Workspace Structure

This is part of a larger workspace with two main applications:

```
Projects/React Native Projects/
├── TindaGo/                    # React Native mobile app (this project)
│   ├── app/                    # Expo Router screens
│   ├── src/                    # Components, services, assets
│   └── CLAUDE.md               # This file
│
└── tindago-admin/              # Next.js admin dashboard (sibling project)
    ├── src/app/                # Admin pages
    ├── src/components/         # Admin components
    └── CLAUDE.md               # Admin-specific documentation
```

**Important**: When working on admin-related features, you may need to switch between projects. Both share the same Firebase backend but have independent frontends.

## Critical Development Notes

### Cross-Platform Status Consistency
**ALWAYS use these exact status values across all platforms**:
- Registration status: `"pending"`, `"approved"`, `"rejected"` (never use `"pending_approval"` or other variants)
- Store status: `"active"`, `"inactive"`, `"suspended"`
- Order status: TBD (to be defined in Phase 2)

### Real-Time Sync Requirements
- Mobile app must implement Firebase listeners for status changes
- Admin dashboard must update database atomically
- Status updates should propagate within 3 seconds
- Use `useStoreRegistration` hook in mobile app for registration status
- Test with both apps running simultaneously

### Document Storage Strategy
- Documents stored as base64 strings in Realtime Database (not Firebase Storage)
- Structure: `store_registrations/{uid}/documents/{documentType}`
- Document types: `barangayBusinessClearance`, `businessPermit`, `dtiRegistration`, `validId`
- Admin dashboard must be able to decode and display base64 documents

### User Roles and Authentication
- User roles: `'customer'` and `'store-owner'` (stored as `userType` in some places)
- Admin authentication is separate from customer/store-owner auth
- Role selection happens after email/phone verification
- Store owners require additional business verification before accessing store features