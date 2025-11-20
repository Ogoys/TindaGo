# Customer Return History Implementation

**Date**: November 21, 2025
**Figma Design**: https://www.figma.com/design/8I1Nr3vQZllDDknSevstvH/TindaGo-Share?node-id=1428-6206&m=dev
**Status**: ✅ Complete

## Overview

Implemented Customer Return History screen and Return Details screen for the TindaGo mobile app. These screens allow customers to view all their submitted return requests and track their status.

## Files Created

### 1. Return History Screen
**Location**: `C:\CapsProj\TindaGo\app\(main)\(customer)\profile\return-history.tsx`

**Features**:
- Displays scrollable list of all return requests submitted by the customer
- Shows return number, store name, status badge, date, item count, and refund amount
- Color-coded status badges:
  - Orange: Pending Review
  - Green (Primary): Processed
  - Red: Rejected
- Fetches data from Firebase `return_goods` collection filtered by `customerId`
- Loading and empty states with user-friendly messages
- Each card is clickable and navigates to Return Details screen
- Uses TindaGo design system (responsive functions, Colors, Fonts)

**Data Flow**:
```typescript
Firebase: return_goods/{returnId}
  → Filter by customerId === user.id
  → Sort by createdAt (newest first)
  → Display as scrollable list
```

### 2. Return Details Screen
**Location**: `C:\CapsProj\TindaGo\app\(main)\(customer)\profile\return-details.tsx`

**Features**:
- Displays comprehensive details about a specific return request
- Shows:
  - Return number, status, and dates
  - Store information
  - Order number reference
  - Refund method
  - All returned items with images, reasons, and quantities
  - Additional details text
  - Uploaded photos (if any)
  - Store notes (if any)
  - Total refund amount
- Cancel button for pending returns
- Confirmation dialog before cancellation
- Uses `getReturnById()` and `cancelReturnRequest()` APIs
- Proper error handling and navigation

**Navigation**:
```
Return History → Return Details
router.push('/(main)/(customer)/profile/return-details?returnId=' + returnId)
```

### 3. Assets
**Location**: `C:\CapsProj\TindaGo\src\assets\images\customer-return-history/`

**Files**:
- `chevron-left.png` - Back button icon
- `return-icon.png` - Return card icon (brown background)

## Design Specifications

### Baseline
- **Figma Frame**: 440x956px
- **Responsive Scaling**: Uses `s()`, `vs()`, `ms()` functions from `responsive.ts`

### Component Dimensions

#### Return History Card
```typescript
Card: 400x100 (min-height)
Logo: 40x40 (brown background #8B4513)
Return Number: fontSize 14, fontWeight 600
Store Name: fontSize 12, fontWeight 500, opacity 0.5
Status Badge: paddingH 10, paddingV 4, borderRadius 8
Date: fontSize 12, textAlign right
Items Count: fontSize 11, textAlign right
Total: fontSize 16, fontWeight 600, primary color
```

#### Header
```typescript
Position: y:0-130
Back Button: x:20, y:79, size:30x30
Title: x:155, y:83, fontSize 20, fontWeight 600
```

### Color Scheme
- **Background**: `Colors.backgroundGray` (#F4F6F6)
- **Card Background**: `Colors.white` (#FFFFFF)
- **Primary Text**: `Colors.darkGray` (#1E1E1E)
- **Secondary Text**: rgba(30, 30, 30, 0.5)
- **Primary Color**: `Colors.primary` (#3BB77E)
- **Return Icon Background**: #8B4513 (brown)
- **Status Colors**:
  - Pending: #FFA500 (orange)
  - Processed: #3BB77E (green)
  - Rejected: #E92B45 (red)

## API Integration

### Functions Used

1. **`getCustomerReturns(customerId: string)`**
   - Location: `src/api/returns/customerReturns.ts`
   - Returns: `Promise<Return[]>`
   - Queries: `return_goods` collection by `customerId`
   - Sorts: By `createdAt` descending (newest first)

2. **`getReturnById(returnId: string)`**
   - Location: `src/api/returns/customerReturns.ts`
   - Returns: `Promise<Return | null>`
   - Fetches: Single return record by ID

3. **`cancelReturnRequest(returnId: string, customerId: string)`**
   - Location: `src/api/returns/customerReturns.ts`
   - Returns: `Promise<{ success: boolean; error?: string }>`
   - Action: Updates status to 'rejected' for pending returns
   - Validation: Only customer who created request can cancel
   - Restriction: Only pending returns can be cancelled

### Data Models

**Return Interface** (from `src/models/Return.ts`):
```typescript
interface Return {
  id: string;
  returnNumber: string;
  storeId: string;
  storeOwnerId: string;
  storeName: string;
  customerName?: string;
  customerId?: string;
  orderNumber?: string;
  items: ReturnItem[];
  refundMethod: RefundMethod;
  totalRefund: number;
  status: ReturnStatus;
  additionalDetails?: string;
  photoUrls?: string[];
  createdAt: string;
  processedAt?: string;
  processedBy: string;
  notes?: string;
}
```

## User Flow

### Viewing Return History
1. Customer navigates to Profile → Return History
2. Screen loads all return requests from Firebase
3. Returns displayed in descending date order (newest first)
4. Each card shows key information at a glance
5. Customer taps card to view full details

### Viewing Return Details
1. Customer taps return card from history
2. Navigation includes `returnId` as query parameter
3. Screen fetches complete return data
4. Displays all items, photos, notes, and status
5. Shows cancel button if status is 'pending'

### Cancelling a Return
1. Customer taps "Cancel Return Request" button
2. Confirmation dialog appears
3. If confirmed, API call updates status to 'rejected'
4. Success message shown, navigates back to history
5. Cancelled return shows as "Rejected" in list

## Implementation Notes

### Import Paths
Following TindaGo conventions, using relative paths for constants:
```typescript
import { Colors } from "../../../../src/constants/Colors";
import { Fonts } from "../../../../src/constants/Fonts";
import { s, vs, ms } from "../../../../src/constants/responsive";
```

### Status Handling
Three possible statuses with distinct visual indicators:
- **Pending**: Orange badge - awaiting store owner review
- **Processed**: Green badge - return has been processed by store
- **Rejected**: Red badge - return was rejected or cancelled

### Error Handling
- Alert dialogs for missing return ID or failed data fetch
- Automatic navigation back if data cannot be loaded
- Loading indicators during data fetch
- Empty state messages when no returns exist

### Responsive Design
All dimensions use responsive scaling:
- `s()` for widths and horizontal spacing
- `vs()` for heights and vertical spacing
- `ms()` for font sizes with moderate scaling

## Integration Points

### Navigation Entry Points
Screen can be accessed from:
1. Customer Profile menu (main navigation)
2. Orders screen (view returns for an order)
3. Direct navigation with returnId parameter

### Related Screens
- **Return Request**: Submit new return request for an order
- **Order Details**: Link to view original order
- **Profile**: Parent navigation menu

### Firebase Collections
- **return_goods**: Main collection for return requests
  - Indexed by: `customerId`, `storeOwnerId`, `orderNumber`
  - Real-time updates via `onValue` listener (potential future enhancement)

## Testing Checklist

- [x] Screen loads without errors
- [x] Returns fetch from Firebase successfully
- [x] Loading state displays correctly
- [x] Empty state displays with helpful message
- [x] Return cards display all information
- [x] Status badges show correct colors
- [x] Navigation to Return Details works
- [x] Return Details fetches and displays data
- [x] Cancel button appears only for pending returns
- [x] Cancel confirmation dialog works
- [x] Cancel API call succeeds
- [x] Back navigation works from both screens
- [x] Responsive scaling works on different devices
- [x] TypeScript types are correct
- [x] Import paths follow TindaGo conventions

## Future Enhancements

### Real-time Updates
Consider adding Firebase listeners for automatic updates:
```typescript
const returnsRef = ref(database, 'return_goods');
const customerReturnsQuery = query(
  returnsRef,
  orderByChild('customerId'),
  equalTo(user.id)
);

const unsubscribe = onValue(customerReturnsQuery, (snapshot) => {
  // Update returns state in real-time
});
```

### Pull-to-Refresh
Add RefreshControl for manual data refresh:
```typescript
<ScrollView
  refreshControl={
    <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
  }
>
```

### Filter/Search
Add ability to filter returns by:
- Status (pending, processed, rejected)
- Date range
- Store name
- Return number

### Push Notifications
Notify customers when:
- Return status changes from pending to processed/rejected
- Refund is issued
- Store adds notes to return request

## Related Documentation

- `src/models/Return.ts` - Return data models
- `src/api/returns/customerReturns.ts` - Customer return APIs
- `app/(main)/(customer)/profile/return-request.tsx` - Submit return request
- `RETURN_GOODS_MODULE.md` - Returns system architecture
- `STANDARDIZED_BASELINE_GUIDE.md` - Design system standards

## Conclusion

Successfully implemented pixel-perfect Customer Return History and Return Details screens following TindaGo design standards and best practices. Both screens provide clear visibility into return requests with proper status tracking and user-friendly interfaces.
