# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

TindaGo is a React Native mobile application built with Expo that digitizes and modernizes the operations of Philippine sari-sari stores (neighborhood micro-retail shops). The platform bridges traditional community commerce with modern digital tools, focusing on inventory management, sales monitoring, order processing, and comprehensive transaction tracking.

### Core Mission
- **Digitize Sari-Sari Operations**: Transform manual processes into efficient digital workflows
- **Empower Store Owners**: Provide real-time visibility into inventory, sales, and financial performance
- **Simplify Customer Ordering**: Enable convenient, organized ordering from local neighborhood stores
- **Community-First Approach**: Designed for walkable neighborhoods with pickup-only fulfillment (no delivery logistics)

### Business Model
- **Revenue**: Transaction-based percentage fee on each product sold through the platform
- **Sustainability**: Fair, affordable fee structure that ensures long-term viability
- **Value Exchange**: Store owners gain digital tools and customer reach; platform earns small per-transaction fees

### Key Differentiators
- **Pickup-Only Model**: Optimized for sari-sari stores within walking distance of customers
- **Comprehensive Operations Management**: Beyond inventory - includes sales reporting, spoilage tracking, return management
- **Built for Philippine Market**: Supports GCash, PayMaya, cash payments; Philippine addressing and phone formats
- **Real-Time Insights**: Dynamic product listings, live inventory updates, trend analysis for purchasing decisions

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
  - `app/(main)/(customer)/` - Customer-specific screens (home, cart, orders, order-details, payment, category, see-more)
  - `app/(main)/(store-owner)/` - Store owner-specific screens (home, orders, wallet, category, profile/*)
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
- **Service layer**: Business logic in `src/services/` organized by domain:
  - `src/services/auth/` - PhoneVerificationService for SMS verification
  - `src/services/store/` - StoreRegistrationService for business registration
  - `src/services/notifications/` - NotificationService for push notifications
- **API layer**: Firebase operations in `src/api/` organized by resource:
  - `cart/`, `orders/`, `products/`, `reviews/`, `stores/`, `users/`
  - Centralizes database operations and data transformations
- **Type models**: TypeScript interfaces in `src/models/` for data structures:
  - `User.ts`, `Store.ts`, `Product.ts`, `Order.ts`, `Cart.ts`, `Review.ts`
  - Ensures type safety across Firebase operations
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
- Services initialized: Authentication (`getAuth`), Realtime Database (`getDatabase`), Firestore (`getFirestore`), Storage (`getStorage`), Functions (`getFunctions`)
- Database region: Asia Southeast (Singapore)
- **Environment Variables**: Required EXPO_PUBLIC_ prefixed variables in `.env` file:
  - `EXPO_PUBLIC_FIREBASE_API_KEY`
  - `EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN`
  - `EXPO_PUBLIC_FIREBASE_DATABASE_URL`
  - `EXPO_PUBLIC_FIREBASE_PROJECT_ID`
  - `EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET`
  - `EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
  - `EXPO_PUBLIC_FIREBASE_APP_ID`
  - `EXPO_PUBLIC_USE_FIREBASE_EMULATORS` (optional, set to 'true' for local emulator testing)
- **Note**: Use `.env.example` as template for local setup

### Firebase Emulators (Optional Development Setup)
For local development and testing without affecting production data:

1. Set `EXPO_PUBLIC_USE_FIREBASE_EMULATORS=true` in `.env`
2. Configure emulator connections in `FirebaseConfig.ts`:
   - Database Emulator: `localhost:9000`
   - Functions Emulator: `localhost:5001`
3. Start Firebase emulators (requires Firebase CLI)
4. App automatically connects to emulators when environment variable is set

**Note**: AsyncStorage warnings are intentionally suppressed in `FirebaseConfig.ts` - the app uses AsyncStorage correctly for auth persistence

### Authentication Flow
1. Email/password registration with Firebase Auth
2. Email verification (required before proceeding)
3. Phone verification (SMS-based with custom service)
4. User type selection (customer/store owner)
5. Additional business verification for store owners

### Database Structure
Firebase Realtime Database (JSON tree structure) with these main collections:

**Primary Collections:**

**User & Store Management:**
- **users/{uid}**: Customer and store owner profiles with role-based access
  - Fields: `uid, name, email, userType, emailVerified, profile{avatar, phone, address}, preferences`
- **store_registrations/{uid}**: Store owner registration data during approval process
  - `personalInfo, businessInfo{storeName, description, address, logo, coverImage}, documents{barangayBusinessClearance, businessPermit, dtiRegistration, validId}, bankDetails`
  - Status: `'pending' | 'approved' | 'rejected'`
- **stores/{storeId}**: Active store information after admin approval
  - Store profile, operating hours, location, contact details
  - `isOpen` boolean for real-time open/close toggle

**Product & Inventory:**
- **products/{productId}**: Product catalog with real-time inventory tracking
  - Fields: `productName, description, price, quantity, category, imageUrl, storeId`
  - Status: `'available' | 'out_of_stock'` (auto-updated based on quantity)
  - Inventory alerts when stock is low
- **inventory_logs/{logId}**: Purchase order and stock change history
  - Tracks: restocks, sales deductions, returns, spoilage adjustments
  - Used for trend analysis and reorder decisions

**Order & Sales Management:**
- **orders/{orderId}**: Customer orders with pickup-only fulfillment
  - Order items, totals, payment method, status tracking
  - Pickup time, customer notes, store information
- **sales/{saleId}**: Completed transaction records for financial reporting
  - Transaction amount, platform fee, store earnings
  - Links to order ID, customer ID, store ID
  - Timestamp for sales analytics and trend analysis

**Loss & Returns Tracking:**
- **return_goods/{returnId}**: Customer return requests and processing
  - Return reason, item details, approval status
  - Stock adjustment on accepted returns
  - Refund amount and processing status
- **damages_spoilage/{damageId}**: Damaged and spoiled inventory tracking
  - Loss type: `'damaged' | 'spoiled' | 'expired' | 'contaminated'`
  - Quantity lost, reason, financial impact
  - Used for loss analysis and prevention strategies

**Financial & Reviews:**
- **wallets/{storeId}**: Store owner earnings and withdrawal tracking
  - `available, pendingWithdrawal, totalWithdrawn, updatedAt`
- **payouts/{payoutId}**: Withdrawal requests and processing
  - Status: `'pending' | 'approved' | 'completed' | 'rejected'`
- **ledgers/stores/{storeId}/transactions**: Revenue split tracking
  - `amount` (total order), `storeAmount` (after platform fee)
  - Status: `'PAID' | 'SETTLED' | 'PENDING'`
- **reviews/{reviewId}**: Customer feedback and store ratings
  - Product and store quality ratings
  - Customer comments and timestamp

**Important Notes:**
- Store registration data remains in `store_registrations/{uid}` during approval process
- After approval, active store data moves to `stores/{storeId}` collection
- Documents stored as base64 strings in Realtime Database (not Firebase Storage)
- Product status automatically updates based on quantity (0 = out_of_stock)
- Platform revenue model: percentage fee deducted from each sale, tracked in ledgers
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
- `OrderCompleteModal.tsx` - Order confirmation modal
- `OrderErrorModal.tsx` - Order error handling modal

### Feature Components
- `onboarding/` - Onboarding flow components (HeroImageStack, OnboardingContent, ActionButtons)
- `phone-verification/` - SMS verification screens (PhoneVerificationScreen, PhoneVerificationCodeScreen)

### Services Layer (`src/services/`)
Services are organized by domain in subdirectories:

**Authentication Services** (`src/services/auth/`):
- **PhoneVerificationService**: SMS verification system
  - Development mode: Logs verification codes to console
  - Production ready: Supports Twilio/AWS SNS integration
  - Philippine phone number validation with international fallback
  - 4-digit codes with 5-minute expiry and 3-attempt limit

**Store Services** (`src/services/store/`):
- **StoreRegistrationService**: Handles store owner registration workflow
  - Multi-step registration (personal info, business info, documents, bank details)
  - Document upload with base64 encoding
  - Firebase Realtime Database integration

**Notification Services** (`src/services/notifications/`):
- **NotificationService**: Push notification handling (Expo Notifications)
  - Order status updates
  - Store approval notifications
  - Real-time event broadcasting

### API Layer (`src/api/`)
Firebase operations centralized by resource type for maintainability:

- **cart/** - Cart operations (add, remove, update quantities, clear)
- **orders/** - Order creation, status updates, history retrieval
- **products/** - Product CRUD operations, inventory updates
- **reviews/** - Customer feedback and ratings management
- **stores/** - Store profile and business information
- **users/** - User profile management and preferences

**Pattern**: Each API module exports functions that handle Firebase database operations and data transformations, keeping components clean and focused on UI logic.

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
Based on capstone project documentation, TindaGo is designed as a comprehensive sales and reporting system for sari-sari stores. Feature priorities:

**Phase 1: Foundation**
- Store registration with document verification (Barangay Business Clearance, Business Permit, DTI Registration, Valid ID)
- Admin approval system for store verification
- Customer registration and authentication
- Role-based access control (customer vs store owner)

**Phase 2: Core Operations & Sales System**
- **Inventory Management**: Real-time stock monitoring with automatic status updates
  - Product CRUD operations with quantity tracking
  - Low stock alerts and reorder suggestions
  - Inventory logging for purchase orders
  - Automatic out-of-stock status when quantity reaches zero
- **Customer Ordering** (Pickup-Only Model):
  - Dynamic product listings with real-time availability
  - Cart management with Firebase real-time sync
  - Order creation and status tracking (`src/api/orders/`)
  - Payment method selection (GCash, PayMaya, Cash on Pickup)
  - Itemized order details with status timeline
  - Payment processing with success/error handling
- **Sales Tracking & Revenue Management**:
  - Detailed transaction recording in `sales/` collection
  - Revenue monitoring with percentage-based platform fees
  - Store earnings calculation (order total minus platform fees)
  - Ledger system tracking payment splits (`ledgers/stores/{storeId}/transactions`)
  - Real-time sales analytics and reporting

**Phase 3: Advanced Operations & Loss Management**
- **Return Goods Tracking** (`return_goods/` collection):
  - Customer return requests and approvals
  - Stock adjustment on accepted returns
  - Return reason categorization
  - Refund processing integration
- **Damages & Spoilage Module** (`damages_spoilage/` collection):
  - Track damaged inventory (breakage, expiration, contamination)
  - Spoilage logging with reason codes
  - Loss impact on inventory and financial reporting
  - Trend analysis to minimize future losses
- **Trend Analysis & Insights**:
  - Sales patterns by product and time period
  - Inventory turnover rates
  - Customer ordering behavior
  - Purchase decision support (what to restock, what to discontinue)
  - Profit margin analysis per product

**Phase 4: Financial & Wallet Features**
- **Wallet Management** (Implemented):
  - Store owner earnings dashboard
  - Available balance tracking
  - Payout request system (pending, approved, completed)
  - Transaction history and withdrawal logs
- **Customer Reviews & Ratings**:
  - Post-purchase feedback system
  - Store and product ratings
  - Quality monitoring for store owners

## Order Management System

The app implements a comprehensive order management system with real-time synchronization between customers and store owners using Firebase Realtime Database.

### Order Status Flow

Orders follow this lifecycle with pickup-only fulfillment:

1. **pending** - Order placed by customer, awaiting store confirmation
2. **confirmed** - Store accepted the order (same as "preparing" in some contexts)
3. **preparing** - Store is actively preparing the order
4. **ready** - Order ready for customer pickup (also called "out_for_pickup")
5. **picked_up** - Customer has picked up the order
6. **completed** - Order successfully completed
7. **cancelled** - Order cancelled by either party

**CRITICAL**: Use exact status values as defined in `src/models/Order.ts` for cross-platform consistency.

### Customer-Side Order Screens

**Main Orders Screen** (`app/(main)/(customer)/orders.tsx`):
- **Current Status**: ✅ Implemented with real-time Firebase sync
- **Features**:
  - Displays all customer orders with expandable/collapsible cards
  - Real-time order updates via Firebase listeners
  - Shows order ID, date, items count, total price, pickup time
  - Expandable progress timeline (Order Confirmed → Preparing → Ready for Pickup)
  - Click card to navigate to full order details
  - Empty state with "Start Shopping" CTA
- **Figma**: Node 759-4131, Baseline 440x1219
- **Design Pattern**: 400x150px collapsed, 400x250px expanded cards

**Order Details Screen** (`app/(main)/(customer)/order-details.tsx`):
- **Current Status**: ✅ Implemented with real-time Firebase sync
- **Features**:
  - Complete order status timeline with 4 stages:
    1. Order Confirmed (checkmark icon)
    2. Preparing your Order (process icon)
    3. Ready to Pickup (pickup icon)
    4. Pickup Order (completion)
  - Itemized bill breakdown (items, subtotal, service fee, tax, grand total)
  - Payment method display (Cash/GCash/PayMaya with icons)
  - "View Invoice" link (placeholder)
  - Real-time status updates with visual indicators (active/inactive states)
- **Figma**: Node 759-4020, Baseline 440x956
- **Navigation**: Accessed from orders list via `/(main)/(customer)/order-details?id=${orderId}`

**Profile Order History** (`app/(main)/(customer)/profile/order-history.tsx`):
- **Current Status**: ⚠️ Implemented with mock data - **NEEDS FIREBASE INTEGRATION**
- **Features**:
  - Simple list of completed orders (no expandable cards)
  - Shows store name, date, address, total per order
  - 400x80px compact cards
  - Navigates to order-details-history screen
- **Figma**: Node 903-5683, Baseline 440x956
- **TODO**: Replace mock data with Firebase query filtered by customer ID and completed/cancelled status

**Profile Order Details History** (`app/(main)/(customer)/profile/order-details-history.tsx`):
- **Current Status**: ⚠️ Implemented with static mock data - **NEEDS FIREBASE INTEGRATION**
- **Features**:
  - Bill breakdown (items, subtotal, service fee, discount, grand total)
  - Order details card (Order ID, Date, Shop, Buyer)
  - Payment method display
  - "Reorder" button (placeholder functionality)
- **Figma**: Node 903-5770, Baseline 440x956
- **TODO**: Connect to Firebase, implement reorder functionality (copy order items to cart)

### Store Owner-Side Order Management

**Store Home Screen** (`app/(main)/(store-owner)/home.tsx`):
- **Current Status**: ⚠️ Partially implemented - **ORDER SECTIONS NEED FULL FUNCTIONALITY**
- **Features**:
  - Dashboard stats: Order count, Pending, Active, Completed
  - Filter tabs: Pending, Preparing, Out for Pickup, Pickup, Reject
  - Order cards showing: Order No, Customer Name, Phone, Price, Payment Method
  - Real-time store open/close toggle with product visibility sync
- **Current Limitation**: Order cards use mock data (#12345, static customer info)
- **TODO**: Connect to Firebase orders collection, filter by store ID and status

**Store Orders Screen** (`app/(main)/(store-owner)/orders.tsx`):
- **Current Status**: ❌ Placeholder only - **REQUIRES COMPLETE IMPLEMENTATION**
- **Required Features** (based on user requirements):
  1. **Pending Section**:
     - List of pending orders awaiting store confirmation
     - Order cards showing customer info, items, total, payment method
     - Navigate to "Pending Order Details" with "Accept" button
  2. **Preparing Section**:
     - List of accepted orders being prepared
     - "Ready to Pickup" button to advance order to next stage
  3. **Out for Pickup Section**:
     - List of orders ready for customer pickup
     - "Order Pickup" button to mark order as picked up
  4. **Pickup Section** (Completed):
     - List of picked up orders
     - Navigate to "Pickup Order Details" for historical view
     - Final state before completion
  5. **Cancel Section**:
     - List of cancelled orders with cancellation reasons
     - Archive of rejected/cancelled orders
- **Design Pattern**: Tab-based navigation or horizontal filter pills (like home screen)
- **Required Screens**:
  - `order-details-pending.tsx` - Pending order with Accept/Reject actions
  - `order-details-preparing.tsx` - Preparing order with "Ready to Pickup" action
  - `order-details-out-for-pickup.tsx` - Ready order with "Mark as Picked Up" action
  - `order-details-pickup.tsx` - Completed order details (read-only)
  - `order-details-cancelled.tsx` - Cancelled order details with reason

### Order API Layer (`src/api/orders/`)

**Current Implementation**:
```typescript
// Create a new order
createOrder(orderData: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>): Promise<string | null>

// Fetch user orders (customer-side)
fetchUserOrders(userId: string): Promise<Order[]>

// Update order status
updateOrderStatus(orderId: string, status: OrderStatus): Promise<boolean>
```

**Required Additions**:
```typescript
// Store-side order queries
fetchStoreOrders(storeId: string): Promise<Order[]>
fetchStoreOrdersByStatus(storeId: string, status: OrderStatus): Promise<Order[]>

// Order actions
acceptOrder(orderId: string): Promise<boolean> // pending → preparing
markReadyForPickup(orderId: string): Promise<boolean> // preparing → ready
markOrderPickedUp(orderId: string): Promise<boolean> // ready → picked_up
completeOrder(orderId: string): Promise<boolean> // picked_up → completed
cancelOrder(orderId: string, reason: string): Promise<boolean> // any → cancelled

// Order notifications
notifyCustomerOrderUpdate(orderId: string, status: OrderStatus): Promise<void>
notifyStoreNewOrder(storeId: string, orderId: string): Promise<void>
```

### Firebase Database Structure for Orders

**Orders Collection** (`orders/{orderId}`):
```typescript
{
  id: string;                    // Auto-generated Firebase key
  orderNumber: string;           // "ORD-2025-001" (display format)
  customerId: string;            // User ID of customer
  customerName: string;          // Customer display name
  customerPhone: string;         // Contact number
  storeId: string;               // Store owner's user ID
  storeName: string;             // Store display name
  items: OrderItem[];            // Array of products
  subtotal: number;              // Pre-tax/fee total
  tax: number;                   // Tax amount (if applicable)
  serviceFee: number;            // Platform service fee
  total: number;                 // Final total
  status: OrderStatus;           // Current order status
  pickupTime?: string;           // Scheduled pickup time (ISO string)
  notes?: string;                // Customer notes
  paymentMethod: 'cash' | 'online' | 'gcash' | 'paymaya';
  paymentStatus: 'pending' | 'paid' | 'refunded';
  createdAt: string;             // ISO timestamp
  updatedAt: string;             // ISO timestamp
  completedAt?: string;          // ISO timestamp (when picked_up)
  cancelledAt?: string;          // ISO timestamp
  cancellationReason?: string;   // Why order was cancelled
}
```

**Real-Time Sync Pattern**:
- Customer screens: `onValue(ref(database, 'orders'), callback)` filtered by `customerId`
- Store screens: `onValue(ref(database, 'orders'), callback)` filtered by `storeId`
- Status updates trigger automatic UI refresh on both sides
- Expected sync latency: < 3 seconds

### Implementation Recommendations

**Priority 1: Store Order Management Screens**
1. Implement tab-based navigation in `orders.tsx` (5 tabs: Pending, Preparing, Out for Pickup, Pickup, Cancel)
2. Create order detail screens for each status with appropriate action buttons
3. Connect to Firebase with real-time listeners for each order status
4. Add order acceptance workflow with confirmation dialogs
5. Implement status transition buttons with loading states

**Priority 2: Firebase API Enhancements**
1. Add store-side order query functions to `src/api/orders/`
2. Implement order status transition functions with validation
3. Add order history tracking for status changes
4. Integrate with NotificationService for push notifications

**Priority 3: Customer Order History Integration**
1. Replace mock data in profile order history screens
2. Connect to Firebase with proper filtering (completed/cancelled orders only)
3. Implement reorder functionality (copy items to cart)
4. Add order search/filter capabilities

**Priority 4: Advanced Features**
1. Order cancellation with reason selection (both customer and store)
2. Order modification requests (before preparing status)
3. Estimated pickup time calculator
4. Order analytics dashboard for store owners
5. Customer order rating/review system

### Testing Checklist

**Cross-Platform Order Sync**:
- [ ] Customer places order → appears in store pending list within 3 seconds
- [ ] Store accepts order → customer sees "Preparing" status update
- [ ] Store marks ready → customer receives pickup notification
- [ ] Customer order list updates automatically when store changes status
- [ ] Store order counts update in real-time on home dashboard

**Order Status Transitions**:
- [ ] Pending → Preparing (Accept button)
- [ ] Preparing → Ready (Ready to Pickup button)
- [ ] Ready → Picked Up (Order Pickup button)
- [ ] Picked Up → Completed (automatic or manual)
- [ ] Any → Cancelled (Cancel button with reason)

**Error Handling**:
- [ ] Network errors during order creation
- [ ] Duplicate order prevention
- [ ] Concurrent status updates (optimistic locking)
- [ ] Invalid status transitions blocked
- [ ] Empty order list states (no orders yet)

**Phase 3: Advanced Features**
- Return goods and spoilage tracking
- Damages and spoilage module for loss management
- Customer feedback and rating system
- Revenue tracking with percentage-based fees
- **Wallet Management** (Planned):
  - Store owner earnings dashboard
  - Transaction history and payout management
  - Revenue analytics and reporting
  - Placeholder screen at `app/(main)/(store-owner)/wallet.tsx`

### Testing Requirements
- **Jest** for backend/service testing
- **Black-box testing** for functionality validation
- **User acceptance testing** with actual sari-sari store owners
- **Cross-platform compatibility** testing (Android/iOS)

## Wallet & Payout Management

The project includes a store owner wallet system for managing earnings and payouts.

### Wallet Structure
Firebase Realtime Database path: `wallets/{storeId}`
```typescript
{
  available: number;           // Available balance for withdrawal
  pendingWithdrawal: number;   // Amount in pending/approved payouts
  totalWithdrawn: number;      // Lifetime withdrawn amount
  updatedAt: number;           // Timestamp
}
```

### Payout Structure
Firebase Realtime Database path: `payouts/{payoutId}`
```typescript
{
  id: string;
  storeId: string;
  amount: number;
  status: 'pending' | 'approved' | 'completed' | 'rejected';
  requestedAt: number;
  approvedAt?: number;
  completedAt?: number;
  bankDetails: object;         // Store's bank account info
}
```

### Ledger Structure
Firebase Realtime Database path: `ledgers/stores/{storeId}/transactions/{transactionId}`
```typescript
{
  orderId: string;
  amount: number;              // Total order amount
  storeAmount: number;         // Store's portion after fees
  status: 'PAID' | 'SETTLED' | 'PENDING';
  createdAt: number;
}
```

### Wallet Management Scripts
Located in `scripts/` directory, require firebase-admin setup:

**Setup for Scripts**:
```bash
# PowerShell
$env:GOOGLE_APPLICATION_CREDENTIALS="path\to\serviceAccount.json"
$env:FIREBASE_DATABASE_URL="https://your-project.firebaseio.com"

# OR in Bash
export GOOGLE_APPLICATION_CREDENTIALS="path/to/serviceAccount.json"
export FIREBASE_DATABASE_URL="https://your-project.firebaseio.com"
```

**Backfill Wallets** (`scripts/backfill-wallets.js`):
```bash
npm run backfill:wallets
```
- Recalculates wallet balances from ledgers and payouts
- Computes available, pending, and withdrawn amounts
- Use after manual database changes or data migration

**Approve Payout** (`scripts/approve-payout.js`):
```bash
npm run payout:approve -- --id=PAYOUT-123 --store=STORE_ID --amount=500
```
- Moves amount from available → pendingWithdrawal
- Sets payout status to 'approved'
- Logs approval event

**Complete Payout** (`scripts/complete-payout.js`):
```bash
npm run payout:complete -- --id=PAYOUT-123 --store=STORE_ID --amount=500
```
- Moves amount from pendingWithdrawal → totalWithdrawn
- Sets payout status to 'completed'
- Logs completion event

**Fix Product Status** (`scripts/fix-product-status.js`):
- One-time script to fix products with quantity=0 but status='available'
- Ensures out-of-stock products are properly marked
- Manual configuration required (update service account path and database URL)

### Wallet Calculation Logic
Available balance is computed as:
```
available = totalEarned - totalWithdrawn - pendingWithdrawal
```

Where:
- `totalEarned` = sum of all PAID/SETTLED ledger transactions (storeAmount field)
- `totalWithdrawn` = sum of all 'completed' payout amounts
- `pendingWithdrawal` = sum of all 'pending' + 'approved' payout amounts

### Testing Requirements
- **Jest** for backend/service testing
- **Black-box testing** for functionality validation
- **User acceptance testing** with actual sari-sari store owners
- **Cross-platform compatibility** testing (Android/iOS)

## Sales Analytics & Reporting System

TindaGo is designed as a comprehensive sales and reporting platform, not just an ordering app. Store owners gain business insights through real-time analytics.

### Sales Reporting Features

**Transaction Recording:**
- Every completed order automatically creates a `sales/` record
- Captures: order total, platform fee, store earnings, payment method
- Links to order, customer, and product details
- Timestamp for time-based analysis

**Revenue Analytics:**
- **Daily/Weekly/Monthly Reports**: Sales totals aggregated by time period
- **Product Performance**: Best-selling items, slow-moving inventory
- **Profit Margins**: Track earnings after platform fees
- **Payment Method Breakdown**: Cash vs GCash vs PayMaya distribution

**Inventory Intelligence:**
- **Turnover Rates**: How quickly products sell
- **Restock Recommendations**: Based on sales velocity and current stock
- **Low Stock Alerts**: Automatic notifications when inventory runs low
- **Out-of-Stock Impact**: Track lost sales opportunities

**Loss Management Reporting:**
- **Spoilage Tracking**: Monitor damaged/expired goods by category
- **Return Analysis**: Patterns in customer returns (reasons, products, frequency)
- **Loss Prevention**: Identify high-loss products to minimize future waste
- **Financial Impact**: Calculate cost of spoilage and returns

**Customer Insights:**
- **Ordering Patterns**: Peak ordering times, average order value
- **Repeat Customer Rate**: Customer retention metrics
- **Product Preferences**: What customers buy together
- **Review Trends**: Quality ratings over time

**Trend Analysis for Business Decisions:**
- **What to Restock**: Data-driven purchase decisions based on sales velocity
- **What to Discontinue**: Identify underperforming products
- **Pricing Optimization**: Compare sales at different price points
- **Seasonal Patterns**: Identify seasonal demand fluctuations

### Data-Driven Operations

The reporting system helps store owners transition from intuition-based to data-driven management:
- **Before TindaGo**: Guesswork on what to buy, manual counting, memory-based reordering
- **With TindaGo**: Real-time dashboards, automated alerts, trend-based predictions

This positions TindaGo as a modern business intelligence tool for traditional micro-retail, making sari-sari stores more competitive and sustainable.

## Payment Integration

The app supports multiple payment methods for customer orders:

### Supported Payment Methods
1. **Cash on Pickup** - Customer pays when collecting order
2. **GCash** - Philippine mobile wallet (via payment gateway)
3. **PayMaya** - Philippine mobile wallet (via payment gateway)

### Payment Gateway
- **Xendit** integration via `xendit-node` package
- Used for processing GCash and PayMaya payments
- Payment status tracked in order records: `'pending' | 'paid' | 'refunded'`

### Payment Flow
1. Customer selects payment method during checkout
2. For online payments (GCash/PayMaya):
   - Payment request sent to Xendit API
   - Customer redirected to payment gateway
   - Webhook/callback confirms payment
   - Order status updated to 'paid'
3. For cash payments:
   - Payment status remains 'pending' until pickup
   - Store confirms payment on collection

### Revenue Distribution
- Platform service fee deducted from order total
- Store receives `storeAmount` (order total minus fees)
- Ledger transactions track payment splits
- See Wallet & Payout Management section for details

## Pickup-Only Logistics Model

Unlike delivery-focused platforms, TindaGo is intentionally designed for **pickup-only** fulfillment. This reflects the reality of sari-sari store operations in Philippine communities.

### Why Pickup-Only?

**Community Context:**
- Sari-sari stores operate within **walking distance** of their customers (typically 1-5 minute walk)
- Customers already visit stores in person for immediate needs
- Neighborhood familiarity makes pickup natural and convenient

**Operational Benefits:**
- **Simplified for Store Owners**: No need to manage delivery logistics, drivers, or routing
- **Cost-Efficient**: Eliminates delivery fees, making orders more affordable
- **Faster Fulfillment**: No wait for delivery slots - customers pick up when ready
- **Lower Complexity**: Store owners can focus on product quality and inventory management

**Business Model Alignment:**
- Keeps platform fees low (no delivery infrastructure costs)
- Maintains sari-sari store's role as neighborhood hub
- Preserves face-to-face customer relationships
- Reduces operational overhead for micro-retailers

### Order Flow with Pickup
1. Customer browses products from nearby stores (map-based discovery)
2. Places order with preferred pickup time
3. Store receives order notification, prepares items
4. Customer receives "Ready for Pickup" notification
5. Customer walks to store, confirms order, pays (if cash), and collects items
6. Order marked as completed

This model keeps TindaGo focused on digitizing operations without disrupting the traditional community shopping experience.

## Location & Maps Integration

The app includes location-based features for store discovery and pickup coordination:

### Map Features
- **Store Locator**: Display nearby sari-sari stores on map (within walking distance)
- **Distance Calculation**: Using `geolib` for accurate distance measurements
- **Navigation**: Integration with `react-native-maps-directions` for walking directions to pickup location
- **Store Discovery**: Find stores within specific radius (typically 500m-1km)
- **Pickup Location**: Display exact store location with address for order collection
- **Store Proximity Filter**: Show only stores within practical walking distance

### Location-Based Features
- **Nearest Store First**: Sort product listings by store proximity
- **Walkability Indicators**: Show estimated walking time to each store
- **Neighborhood Boundaries**: Help customers find stores in their barangay/community
- **Pickup Reminders**: Location-based notifications when customer is near pickup location

### Required Permissions
- Location permissions (`expo-location`)
- Map rendering (`react-native-maps`)
- Philippine region optimized (GCash, PayMaya, local addressing)

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
  - `react-native-maps` - Location and map features
  - `xendit-node` - Payment gateway integration
  - `axios` - HTTP client for API requests
  - `geolib` - Geolocation calculations

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
- Order status: `"pending"`, `"confirmed"`, `"preparing"`, `"ready"`, `"completed"`, `"cancelled"`
  - Orders are pickup-only (no delivery status needed)
  - Payment methods: `"gcash"`, `"paymaya"`, `"cash"` (cash on pickup)

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
