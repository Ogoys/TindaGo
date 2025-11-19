# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

TindaGo is a React Native mobile application built with Expo SDK 54 that digitizes Philippine sari-sari stores (neighborhood micro-retail shops). The platform provides inventory management, sales monitoring, order processing, and comprehensive transaction tracking with a pickup-only fulfillment model.

### Core Technologies
- **React Native 0.81.5** with **React 19.1.0**
- **Expo SDK 54** with file-based routing (expo-router v6.0.7)
- **Firebase 12.2.1** (Authentication, Realtime Database, Storage)
- **TypeScript** with strict mode and path aliases (@/* → src/*)
- **Payment**: Xendit for GCash/PayMaya integration
- **Maps**: react-native-maps with geolib for geolocation

## Getting Started

### Initial Setup
```bash
npm install
cp .env.example .env  # Add Firebase credentials
npm start             # Start development server
```

### Development Commands
- `npm start` or `npx expo start` - Start development server
- `npm run android` / `npm run ios` / `npm run web` - Run on platform
- `npm run lint` - ESLint code quality check
- `npx tsc --noEmit` - Type checking

### Expo Dev Server Options
Once running, press:
- `a` - Android emulator
- `i` - iOS simulator
- `w` - Web browser
- Scan QR code with Expo Go app for physical device

### Wallet Management Scripts
```bash
npm run backfill:wallets              # Recalculate wallet balances
npm run payout:approve -- --id=... --store=... --amount=...
npm run payout:complete -- --id=... --store=... --amount=...
```

Requires environment variables:
```bash
# PowerShell
$env:GOOGLE_APPLICATION_CREDENTIALS="path\to\serviceAccount.json"
$env:FIREBASE_DATABASE_URL="https://your-project.firebaseio.com"
```

## Architecture & Structure

### File-based Routing (Expo Router)
```
app/
├── (auth)/                          # Authentication flow
│   ├── (store-owner)/              # Store owner registration flow
│   │   ├── StoreRegistration.tsx
│   │   ├── StoreDetails.tsx
│   │   ├── DocumentUpload.tsx
│   │   ├── BankDetails.tsx
│   │   ├── set-store-location.tsx
│   │   └── RegistrationComplete.tsx
│   ├── onboarding.tsx
│   ├── signin.tsx
│   ├── register.tsx
│   ├── verify-email-code.tsx
│   ├── phone-verification-code.tsx
│   ├── complete-phone-registration.tsx
│   └── enable-location.tsx
│
├── (main)/                          # Main app screens
│   ├── (customer)/                  # Customer screens
│   │   ├── home.tsx
│   │   ├── cart.tsx
│   │   ├── category.tsx
│   │   ├── category-detail.tsx
│   │   ├── orders.tsx
│   │   ├── order-details.tsx
│   │   ├── payment.tsx
│   │   ├── invoice.tsx
│   │   ├── review.tsx
│   │   ├── search.tsx
│   │   ├── see-more.tsx
│   │   ├── stores-list.tsx
│   │   ├── stores-map.tsx
│   │   ├── track-store.tsx
│   │   └── profile/                 # Customer profile subroutes
│   │       ├── index.tsx
│   │       ├── order-history.tsx
│   │       ├── order-details-history.tsx
│   │       ├── account-settings.tsx
│   │       ├── help-center.tsx
│   │       └── terms-privacy.tsx
│   │
│   ├── (store-owner)/              # Store owner screens
│   │   ├── home.tsx
│   │   ├── inventory/              # Inventory management
│   │   │   ├── index.tsx
│   │   │   ├── add-product.tsx
│   │   │   ├── edit-product.tsx
│   │   │   ├── store-product.tsx
│   │   │   ├── expired-products.tsx
│   │   │   ├── record-damage.tsx
│   │   │   ├── damage-history.tsx
│   │   │   └── record-walk-in-sale.tsx
│   │   ├── orders/
│   │   │   ├── index.tsx
│   │   │   └── details.tsx
│   │   ├── wallet/
│   │   │   ├── index.tsx
│   │   │   ├── earnings.tsx
│   │   │   ├── payout-history.tsx
│   │   │   ├── payout-requests.tsx
│   │   │   └── transaction.tsx
│   │   └── profile/
│   │       ├── index.tsx
│   │       ├── my-account.tsx
│   │       ├── store-info.tsx
│   │       ├── view-store-location.tsx
│   │       ├── edit-store-location.tsx
│   │       ├── sales-dashboard.tsx
│   │       ├── sales-history.tsx
│   │       ├── inventory-dashboard.tsx
│   │       ├── purchase-order-history.tsx
│   │       ├── record-purchase-order.tsx
│   │       ├── walk-in-sales-history.tsx
│   │       ├── record-walk-in-sale.tsx
│   │       ├── return-history.tsx
│   │       ├── record-return.tsx
│   │       ├── ewallet-details.tsx
│   │       ├── reviews.tsx
│   │       └── help-center.tsx
│   │
│   └── shared/                      # Shared screens
│       ├── product-details.tsx
│       ├── store-details.tsx
│       └── profile.tsx
│
├── payment/                         # Payment result screens
│   ├── success.tsx
│   └── failed.tsx
│
├── _layout.tsx                      # Root layout with UserProvider
├── index.tsx                        # Entry point
└── role-selection.tsx               # User type selection
```

**Navigation Pattern:**
- Auto-redirects based on user state: no user → auth, no role → role-selection, role → home
- Customer screens use custom BottomNavigation component
- Store owner screens use nested layouts with profile subroutes

### Code Organization

```
src/
├── api/                    # Firebase operations by resource
│   ├── cart/
│   ├── damages/
│   ├── orders/
│   ├── products/
│   ├── purchaseOrders/
│   ├── returns/
│   ├── reviews/
│   ├── stores/
│   ├── users/
│   ├── walkInSales/
│   └── orderCancellation.ts
│
├── components/
│   ├── ui/                # Reusable UI components
│   │   ├── Button.tsx
│   │   ├── FormInput.tsx
│   │   ├── ProductCard.tsx
│   │   ├── StoreCard.tsx
│   │   ├── BottomNavigation.tsx
│   │   ├── StoreBottomNavigation.tsx
│   │   ├── GlassMorphismCard.tsx
│   │   ├── OrderCompleteModal.tsx
│   │   ├── OrderErrorModal.tsx
│   │   ├── PaymentMethodSelector.tsx
│   │   └── Toast.tsx
│   ├── common/            # Common components
│   │   └── PaymentMethodBadge.tsx
│   ├── maps/              # Map-related components
│   │   └── LocationPicker.tsx
│   ├── onboarding/        # Onboarding flow
│   ├── phone-verification/
│   ├── store-owner/
│   └── MapErrorBoundary.tsx
│
├── contexts/
│   └── UserContext.tsx    # Global user state with AsyncStorage persistence
│
├── models/                # TypeScript interfaces
│   ├── Cart.ts
│   ├── Damage.ts
│   ├── Order.ts
│   ├── Payout.ts
│   ├── Product.ts
│   ├── PurchaseOrder.ts
│   ├── Return.ts
│   ├── Review.ts
│   ├── Store.ts
│   ├── User.ts
│   └── WalkInSale.ts
│
├── services/              # Business logic layer
│   ├── auth/
│   │   └── PhoneVerificationService.ts
│   ├── commission/
│   │   └── CommissionService.ts
│   ├── notifications/
│   │   └── NotificationService.ts
│   ├── payment/
│   │   └── XenditService.ts
│   └── store/
│       └── StoreRegistrationService.ts
│
├── constants/             # Design system
│   ├── Colors.ts          # Color palette (primary: #3BB77E)
│   ├── Fonts.ts
│   ├── responsive.ts      # s(), vs(), ms() scaling functions
│   └── StoreStatus.ts
│
└── assets/
    └── images/
        └── [screen-name]/ # Organized by screen
```

### State Management
- **UserContext**: Global user state via React Context
  - Persisted to AsyncStorage
  - Provides: `user`, `isLoading`, `setUser`, `setUserRole`, `logout`, `updateUserProfile`
  - User roles: `'customer' | 'store-owner'`

### Critical Status Values
**ALWAYS use these exact values across all platforms:**
- Registration status: `"pending"`, `"approved"`, `"rejected"`
- Store status: `"active"`, `"inactive"`, `"suspended"`
- Order status: `"pending"`, `"confirmed"`, `"preparing"`, `"ready"`, `"picked_up"`, `"completed"`, `"cancelled"`
- Payment status: `"pending"`, `"paid"`, `"refunded"`
- Payment methods: `"cash"`, `"gcash"`, `"paymaya"`

## Firebase Integration

### Environment Variables
Required in `.env` (use `.env.example` as template):
```
EXPO_PUBLIC_FIREBASE_API_KEY
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN
EXPO_PUBLIC_FIREBASE_DATABASE_URL
EXPO_PUBLIC_FIREBASE_PROJECT_ID
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
EXPO_PUBLIC_FIREBASE_APP_ID
EXPO_PUBLIC_USE_FIREBASE_EMULATORS=false  # Set to 'true' for local testing
```

### Authentication Flow
1. Email/password registration → Email verification
2. Phone verification (SMS-based, 4-digit code, 5-min expiry)
3. User type selection (customer/store owner)
4. Store owners: additional business verification

### Database Structure
Firebase Realtime Database with main collections:

**User & Store Management:**
- `users/{uid}` - Customer and store owner profiles
- `store_registrations/{uid}` - Pending store owner registrations (status: pending/approved/rejected)
- `stores/{storeId}` - Active stores after admin approval (includes `isOpen` boolean)

**Products & Inventory:**
- `products/{productId}` - Product catalog (status auto-updates based on quantity)
- `inventory_logs/{logId}` - Stock change history
- `damages_spoilage/{damageId}` - Damaged/spoiled inventory tracking
- `purchase_orders/{orderId}` - Stock purchase records

**Orders & Sales:**
- `orders/{orderId}` - Customer orders (pickup-only model)
- `sales/{saleId}` - Completed transactions for reporting
- `walk_in_sales/{saleId}` - In-store cash sales (not app orders)
- `return_goods/{returnId}` - Customer return requests

**Financial:**
- `wallets/{storeId}` - Store owner earnings (available, pendingWithdrawal, totalWithdrawn)
- `payouts/{payoutId}` - Withdrawal requests (status: pending/approved/completed/rejected)
- `ledgers/stores/{storeId}/transactions` - Revenue split tracking (storeAmount = order total - platform fee)

**Reviews:**
- `reviews/{reviewId}` - Customer feedback and ratings

**Important Notes:**
- Documents stored as base64 strings in Realtime Database (not Firebase Storage)
- Product status automatically updates when quantity = 0
- See `firebase-database-structure.md` and `firebase-actual-database-structure.md` for complete schemas

## Responsive Design

### Design System
```typescript
import { s, vs, ms, responsive } from '@/constants/responsive';
// s() = scale, vs() = verticalScale, ms() = moderateScale
```

- **Baseline**: 440x956px (default) - **Check Figma file comments for per-screen baselines**
- **Colors**: Centralized in `src/constants/Colors.ts`
- **Positioning**: Use exact Figma coordinates with responsive scaling
- **Style Pattern**: Glassmorphism cards with expo-blur effects

### Component Documentation Format
Add at top of screen files:
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

## Development Workflow

### Adding New Screens
1. Create file in appropriate route group (`app/(auth)/` or `app/(main)/`)
2. Use kebab-case naming conventions
3. Use TypeScript with proper navigation typing
4. Import components using `@/` path alias
5. **ALWAYS use TindaGo Design-to-Code Agent** for Figma-based screens (see `doc/TindaGo-Design-to-Code-Agent.md`)

### Import Paths
- Use `@/` alias: `import { Button } from '@/components/ui'`
- **Exception**: Some components use relative paths for constants: `import { Colors } from "../../constants/Colors"`

### Creating Components
1. Place in `src/components/` with appropriate subfolder
2. Export from `index.ts` files for clean imports
3. Use responsive scaling functions consistently
4. Follow glassmorphism patterns
5. Use exact Figma coordinates with baseline scaling

## Business Features

### Pickup-Only Model
- **No delivery logistics** - customers walk to nearby stores (typically 500m-1km radius)
- Order flow: Browse → Cart → Order → Store Prepares → Pickup Notification → Customer Collects
- Map-based store discovery with walking distance indicators

### Revenue Model
- **Transaction-based fees**: Platform deducts percentage from each sale
- **Ledger system**: Tracks payment splits between platform and store
- **Wallet management**: Store owners request payouts from earnings

### Inventory Management
- **Real-time stock tracking** with automatic out-of-stock status
- **Multi-source sales**: App orders + walk-in sales tracking
- **Loss management**: Damages, spoilage, returns with reason codes
- **Purchase orders**: Record stock replenishment for trend analysis
- **Inventory intelligence**: Restock recommendations, turnover rates

### Order Management
Order lifecycle (pickup-only):
1. `pending` - Customer placed, awaiting store confirmation
2. `confirmed` - Store accepted
3. `preparing` - Store actively preparing
4. `ready` - Ready for pickup (customer notified)
5. `picked_up` - Customer collected order
6. `completed` - Transaction finalized
7. `cancelled` - Cancelled by either party

Real-time sync between customer and store owner screens via Firebase listeners.

### Payment Integration
- **Xendit**: Processes GCash and PayMaya payments
- **Cash on Pickup**: Payment status pending until collection
- **Commission Service**: Calculates platform fees (`src/services/commission/`)

### Analytics & Reporting
Store owners gain insights:
- Daily/weekly/monthly sales reports
- Product performance (best-sellers, slow-movers)
- Inventory turnover rates
- Loss analysis (spoilage, returns)
- Customer ordering patterns
- Revenue after platform fees

## Admin Dashboard Integration

### Separate Admin Project
**Location**: `../tindago-admin/` (sibling directory)

**Tech Stack**: Next.js 15.5.3 with React 19.1.0, Firebase 12.2.1, Tailwind CSS

**Commands**:
```bash
cd ../tindago-admin
npm install
npm run dev              # http://localhost:3000
npm run build
```

**Integration Flow**:
1. Store owner completes registration in mobile app
2. Data saved to `store_registrations/{uid}` with `status: "pending"`
3. Admin dashboard displays pending registration in real-time
4. Admin reviews and approves/rejects
5. Mobile app receives status update via Firebase listener (< 3s sync)
6. On approval: Data moved to `stores/{storeId}` collection

**Testing**: See `ADMIN_VERIFICATION_CHECKLIST.md` and `WEB_ADMIN_TESTING_GUIDE.md`

**Key Requirements**:
- Identical Firebase configuration across both apps
- Consistent status values
- Mobile uses `useStoreRegistration` hook for real-time sync

### Migration Scripts (in tindago-admin)
```bash
npm run migrate:usertype              # Migrate user type fields
npm run standardize:status            # Fix status inconsistencies
```

## Figma Integration

### MCP Configuration
- Figma Context MCP for design-to-code workflows
- Configuration in `.claude/mcp-settings.json`
- No Figma Pro plan required
- See `doc/README-MCP.md` for setup

### Design-to-Code Workflow
Use specialized agent from `doc/TindaGo-Design-to-Code-Agent.md`:
1. Extract design data via `mcp__Framelink_Figma_MCP__get_figma_data`
2. Download assets to `src/assets/images/[screen-name]/`
3. Create components with exact Figma coordinates + baseline scaling
4. Implement functionality (forms, navigation, validation)
5. Test spacing and adjust margins

**Critical Error Prevention**:
- ❌ Never use: `import { Colors } from "@/constants/Colors"`
- ✅ Always use: `import { Colors } from "../../constants/Colors"`

## Multi-Project Workspace

```
Projects/React Native Projects/
├── TindaGo/                    # React Native mobile app (this project)
└── tindago-admin/              # Next.js admin dashboard
```

Both share the same Firebase backend but have independent frontends.

## Code Quality

- **TypeScript strict mode** enabled
- **ESLint** with Expo config
- **Async/await patterns** for Firebase operations
- **Error handling** with user-friendly messages
- **Path aliases** configured in tsconfig.json

## Documentation Structure

### Root Directory (Essential Files)
- `README.md` - Project overview and getting started
- `CLAUDE.md` - This file - AI assistant guidance
- `SETUP.md` - Initial setup instructions
- `firebase-database-structure.md` - Complete database schema
- `firebase-actual-database-structure.md` - Actual implementation details

### Organized Documentation (`docs/`)

**Reference Guides** (`docs/guides/` - 20 files):
- `WALLET_SYSTEM_EXPLAINED.md` - Wallet & payout system architecture
- `COMMISSION_SYSTEM_DOCUMENTATION.md` - Revenue model and fee calculation
- `XENDIT_HOW_IT_WORKS.md` - Payment integration details
- `XENDIT_QUICK_START.md` - Quick payment setup
- `RESPONSIVE_DESIGN_EXPLANATION.md` - Design system and scaling
- `STANDARDIZED_BASELINE_GUIDE.md` - Figma baseline standards
- `MODAL_TYPES_EXPLAINED.md` - Modal component patterns
- `STORE_OWNER_WALLET_STRUCTURE.md` - Wallet database structure
- `FUTURE_ENHANCEMENTS.md` - Planned features
- `MISSING_FEATURES_CHECKLIST.md` - Feature completion status
- And 10 more reference guides...

**Testing Documentation** (`docs/testing/` - 14 files):
- `FINAL_TEST_GUIDE.md` - Comprehensive testing procedures
- `XENDIT_TESTING_GUIDE.md` - Payment testing
- `INVENTORY_TEST_GUIDE.md` - Inventory module testing
- `COMPLETE_PAYMENT_FLOW_TEST_GUIDE.md` - End-to-end payment testing
- `QA_CHECKLIST.md` - Quality assurance checklist
- And 9 more testing guides...

**Module Documentation** (`docs/modules/` - 6 files):
- `INVENTORY_MANAGEMENT_SYSTEM.md` - Inventory architecture
- `ORDER_TRACKING_AND_REVIEW_SYSTEM.md` - Order flow and reviews
- `DAMAGES_SPOILAGES_MODULE.md` - Loss management
- `RETURN_GOODS_MODULE.md` - Returns processing
- `PURCHASE_ORDER_MODULE.md` - Stock replenishment
- `SALES_MODULE.md` - Sales tracking

**Setup & Configuration** (`docs/setup/` - 7 files):
- `FIREBASE_RULES_UPDATE_GUIDE.md` - Security rules
- `FIREBASE_COST_OPTIMIZATION.md` - Cost management
- `COMPLETE_MAP_SETUP_STEPS.md` - Map integration setup
- `WALLET_FUNCTIONS_DEPLOY.md` - Wallet deployment
- And 3 more setup guides...

**Archived Documentation** (`docs/archived/`):
- `implementations/` - 35 completed implementation reports
- `fixes/` - 9 bug fix and hotfix reports
- `phases/` - Phase and objective completion reports

**Deprecated** (`docs/deprecated/` - 26 files):
- Outdated guides, completed refactors, old test results

### Figma & Agent Documentation (`doc/`)
- `TindaGo-Design-to-Code-Agent.md` - Figma conversion workflow
- `Agent-Evolution-Log.md` - Agent improvements log
- `README-MCP.md` - MCP setup instructions

## Testing Requirements

- **Jest** for backend/service testing
- **Black-box testing** for functionality validation
- **User acceptance testing** with actual sari-sari store owners
- **Cross-platform compatibility** (Android/iOS)
- **Real-time sync testing** (< 3s latency for Firebase updates)
