# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

TindaGo is a React Native mobile application built with Expo, designed as a sari-sari store marketplace for ordering and inventory management. The app uses Firebase for backend services and is optimized for Philippine mobile commerce.

## Development Commands

### Essential Commands
- `npm install` - Install dependencies
- `npm start` - Start development server (alias for expo start)
- `npm run android` - Run on Android emulator
- `npm run ios` - Run on iOS simulator
- `npm run web` - Run in web browser
- `npm run lint` - Run ESLint for code quality

### TypeScript & Linting
- `npx tsc --noEmit` - Type checking without compilation
- `npx eslint . --ext .ts,.tsx` - Manual linting

## Architecture & Structure

### File-based Routing (Expo Router v5.1.4)
The app uses file-based routing with nested route groups:
- `app/(auth)/` - Authentication flow screens (onboarding, signin, signup, verification)
  - `app/(auth)/(store-owner)/` - Store owner registration flow
- `app/(main)/` - Main app screens with role-based structure
  - `app/(main)/(customer)/` - Customer-specific screens (home, cart, orders, category)
  - `app/(main)/(store-owner)/` - Store owner-specific screens (home, inventory)
  - `app/(main)/shared/` - Shared screens (profile, product-details)
- `app/_layout.tsx` - Root layout with navigation stack
- `app/index.tsx` - Entry point that redirects to onboarding
- `app/role-selection.tsx` - User type selection screen

### Key Architectural Patterns
- **Component-first**: Reusable UI components in `src/components/ui/`
- **Service layer**: Business logic in `src/services/` (e.g., PhoneVerificationService)
- **Responsive design**: Figma baseline (440x956) with scaling functions
- **Type safety**: Full TypeScript with strict mode and path aliases (@/* → src/*)

### Core Technologies
- **React Native 0.79.5** with **React 19.0.0**
- **Expo SDK 54** with file-based routing
- **Firebase 12.2.1** (Authentication, Realtime Database, Storage)
- **TypeScript** with path aliases configured in tsconfig.json

## Styling & Responsive Design

### Design System
- **Colors**: Centralized in `src/constants/Colors.ts` (primary: #3BB77E)
- **Responsive scaling**: Based on Figma baseline (440x956) in `src/constants/responsive.ts`
- **Fonts**: Managed in `src/constants/Fonts.ts`

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
- Services: Authentication, Realtime Database, Storage
- Database region: Asia Southeast (Singapore)
- **Environment Variables**: Required EXPO_PUBLIC_ prefixed variables:
  - `EXPO_PUBLIC_FIREBASE_API_KEY`
  - `EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN`
  - `EXPO_PUBLIC_FIREBASE_DATABASE_URL`
  - `EXPO_PUBLIC_FIREBASE_PROJECT_ID`
  - `EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET`
  - `EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
  - `EXPO_PUBLIC_FIREBASE_APP_ID`

### Authentication Flow
1. Email/password registration with Firebase Auth
2. Email verification (required before proceeding)
3. Phone verification (SMS-based with custom service)
4. User type selection (customer/store owner)
5. Additional business verification for store owners

### Database Structure
Firebase Firestore NoSQL collections based on capstone requirements:
- **Users**: Customer and store owner profiles with role-based access
- **Stores**: Store information, business documents, verification status
- **Products**: Product catalog with inventory levels, pricing, descriptions
- **Orders**: Customer orders with pickup-only fulfillment
- **Sales**: Transaction tracking and revenue monitoring
- **Inventory_Logs**: Stock changes and purchase order history
- **Return_Goods**: Customer return tracking and stock adjustments
- **Damages_Spoilage**: Loss tracking for damaged/expired items
- **Reviews**: Customer feedback and store ratings

See `firebase-database-structure.md` for complete schema details.

## Component Architecture

### UI Components (`src/components/ui/`)
- `Button.tsx` - Primary/secondary buttons with responsive design
- `FormInput.tsx` - Form input fields
- `GlassMorphismCard.tsx` - Modern card designs with blur effects and absolute positioning
- `ProductCard.tsx`, `StoreCard.tsx` - Display cards
- `Typography.tsx` - Text styling components

### Feature Components
- `onboarding/` - Onboarding flow components with hero images
- `phone-verification/` - SMS verification screens with custom service

### Phone Verification System
- Custom service at `src/services/PhoneVerificationService.ts`
- Development mode: Logs verification codes to console
- Production ready: Supports Twilio/AWS SNS integration
- Philippine phone number validation with international fallback
- 4-digit codes with 5-minute expiry and 3-attempt limit

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
- Path alias configured in tsconfig.json
- Maintain clean import structure with index.ts exports

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