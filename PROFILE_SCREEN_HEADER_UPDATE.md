# Profile Screen Header Standardization

## Overview
Created a reusable `ProfileScreenHeader` component to ensure consistent styling and behavior across all store owner profile screens.

## Component Location
- **File**: `src/components/store-owner/ProfileScreenHeader.tsx`
- **Purpose**: Provides standardized header with back button, title, and optional icon

## Features
- ✅ Consistent back button (white circular with shadow)
- ✅ Centered title with optional icon
- ✅ Responsive sizing using `s`, `vs`, `ms` functions
- ✅ TindaGo green color for icons (#3BB77E)
- ✅ Clean, modern design matching Figma specs

## Updated Screens

### 1. Store Information (`store-info.tsx`)
- **Icon**: `storefront` (🏪)
- **Title**: "Store Information"
- **Features**: Displays store details from Firebase Realtime Database

### 2. Store Product (`store-product.tsx`)
- **Icon**: `cube` (📦)
- **Title**: "Store Product"
- **Features**: Product catalog management with category filtering

### 3. Sales Dashboard (`sales-dashboard.tsx`)
- **Icon**: `stats-chart` (📊)
- **Title**: "Sales Dashboard"
- **Features**: Sales analytics and transaction summaries

### 4. Sales History (`sales-history.tsx`)
- **Icon**: `time` (🕐)
- **Title**: "Sales History"
- **Features**: Complete transaction records with search/filter
- **Note**: Special layout to accommodate filter button on the right

### 5. Record Walk-in Sale (`record-walk-in-sale.tsx`)
- **Icon**: `cash` (💵)
- **Title**: "Record Walk-in Sale"
- **Features**: Manual in-store sales recording

### 6. Record Damage & Spoilage (`record-damage.tsx`)
- **Icon**: `alert-circle` (⚠️)
- **Title**: "Record Damage & Spoilage"
- **Features**: Track damaged/expired inventory

## Usage Example

```typescript
import { ProfileScreenHeader } from '@/components/store-owner/ProfileScreenHeader';

// Basic usage
<ProfileScreenHeader title="Screen Title" icon="icon-name" />

// Custom back handler (optional)
<ProfileScreenHeader 
  title="Screen Title" 
  icon="icon-name" 
  onBack={() => {
    // Custom logic
    router.back();
  }}
/>
```

## Icon Options
All screens use Ionicons with relevant icons:
- `storefront` - Store/shop related screens
- `cube` - Product/inventory screens
- `stats-chart` - Analytics/dashboard screens
- `time` - History/records screens
- `cash` - Sales/transactions screens
- `alert-circle` - Warnings/damage screens

## Styling Details
- **Background**: `Colors.backgroundGray` (#F4F6F6)
- **Padding Top**: `vs(79)` - Ensures proper spacing for status bar
- **Padding Bottom**: `vs(20)` - Spacing before content
- **Back Button**: 30×30px white circle with shadow
- **Title**: Clash Grotesk 600, 20px, centered
- **Icon**: 22px, TindaGo green color

## Benefits
1. **Consistency**: All profile screens have identical header styling
2. **Maintainability**: Single component to update for design changes
3. **Reusability**: Easy to add new screens with same header
4. **Cleaner Code**: Reduced code duplication across files
5. **Better UX**: Familiar navigation pattern throughout the app

## Before vs After
**Before**: Each screen had its own header implementation with slight inconsistencies
**After**: All screens use the same component with appropriate icons

## Files Modified
- Created: `src/components/store-owner/ProfileScreenHeader.tsx`
- Updated: 6 profile screen files (store-info, store-product, sales-dashboard, sales-history, record-walk-in-sale, record-damage)
- Removed: ~200 lines of duplicated header styling code
