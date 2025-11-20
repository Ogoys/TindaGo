# Return Request Screen: Dynamic Reasons and Loan Payment Date

**Date:** 2025-11-20
**Status:** Completed
**Type:** Feature Enhancement

## Overview

Updated the customer return request screen to support dynamic return reasons with custom text input, updated refund method options (removed App Wallet and Cash, added Loan), and implemented a loan payment date modal for customers choosing the loan refund option.

## Changes Made

### 1. New Component: LoanPaymentDateModal

**File:** `C:\CapsProj\TindaGo\src\components\ui\LoanPaymentDateModal.tsx`

**Features:**
- Modal dialog for selecting loan payment date
- Date picker with constraints (tomorrow to 30 days from today)
- Glassmorphism overlay background
- Responsive design with TindaGo styling
- Cancel and Proceed buttons
- Platform-specific date picker behavior (iOS spinner, Android calendar)
- Visual date display with calendar icon
- Info box explaining date range constraints

**Props:**
```typescript
interface LoanPaymentDateModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: (date: Date) => void;
  minDate?: Date;  // Default: tomorrow
  maxDate?: Date;  // Default: 30 days from today
}
```

**Design:**
- White modal card with rounded corners and shadow
- TindaGo green for Proceed button
- Calendar icon (📅) with white circular background
- Date displayed in readable format (e.g., "January 25, 2025")
- Responsive scaling using s(), vs(), ms() functions

### 2. Updated RefundMethodSelector Component

**File:** `C:\CapsProj\TindaGo\src\components\ui\RefundMethodSelector.tsx`

**Changes:**
- **Removed Options:**
  - App Wallet (💰)
  - Cash (₱)

- **Kept Options:**
  - GCash (with logo)
  - PayMaya (with logo)

- **Added Option:**
  - Loan (Pay Later) with credit card emoji (💳)
  - Includes subtext: "Choose repayment date"

**Updated Type:**
```typescript
export type RefundMethodType = 'gcash' | 'paymaya' | 'loan';
```

**Design:**
- Loan option uses green circular icon background (like previous wallet)
- Credit card emoji (💳) as icon
- Two-line text layout (main title + subtext)
- Maintains existing card-based selection UI with radio buttons

### 3. Enhanced Return Request Screen

**File:** `C:\CapsProj\TindaGo\app\(main)\(customer)\profile\return-request.tsx`

**New Features:**

#### A. Dynamic Return Reasons
- **Dropdown Selection:** Keeps existing RETURN_REASONS dropdown (no icons)
- **Custom Text Input:** New TextInput below dropdown
  - Placeholder: "Or type your own reason here..."
  - Multiline support (2 lines)
  - Always visible for all selected products
  - Custom text takes priority over dropdown selection

**Logic:**
```typescript
// Final reason logic
const finalReason = customReason.trim() || dropdownReason;
```

**Validation:**
- Must have either dropdown selection OR custom text
- If "Other (Specify Below)" is selected, custom text is required
- Shows specific error messages guiding user

#### B. Loan Payment Date Integration
- **Modal Trigger:** Automatically shows when loan is selected
- **Date Display:** Shows selected date below refund method selector
- **Change Button:** Allows user to modify selected date
- **Validation:** Requires date if loan is selected

**State Management:**
```typescript
const [loanPaymentDate, setLoanPaymentDate] = useState<Date | null>(null);
const [showLoanModal, setShowLoanModal] = useState(false);
const [customReasons, setCustomReasons] = useState<Map<string, string>>(new Map());
```

**Auto-trigger Effect:**
```typescript
useEffect(() => {
  if (refundMethod === 'loan' && !loanPaymentDate) {
    setShowLoanModal(true);
  }
}, [refundMethod]);
```

**Modal Close Behavior:**
- If user closes modal without selecting date → reverts to GCash
- If date already selected → keeps loan selection
- "Change" button allows date modification

#### C. Enhanced Validation
```typescript
// Check reason (dropdown or custom text)
const customReason = customReasons.get(productId);
const hasDropdownReason = item.returnReason && item.returnReason !== 'other';
const hasCustomReason = customReason && customReason.trim().length > 0;

if (!hasDropdownReason && !hasCustomReason) {
  Alert.alert("Error", "Please provide return reason...");
  return;
}

// Check loan date if loan selected
if (refundMethod === 'loan' && !loanPaymentDate) {
  Alert.alert("Error", "Please select a payment date for the loan");
  setShowLoanModal(true);
  return;
}
```

#### D. Updated Submit Data
```typescript
const submitData: any = {
  // ... existing fields
  refundMethod: refundMethod as 'gcash' | 'paymaya' | 'loan',
  // ... other fields
};

// Add loan payment date if applicable
if (refundMethod === 'loan' && loanPaymentDate) {
  submitData.loanPaymentDate = loanPaymentDate.toISOString();
}
```

### 4. Updated Data Model

**File:** `C:\CapsProj\TindaGo\src\models\Return.ts`

**Already Updated (no changes needed):**
- `RefundMethod` type: `'gcash' | 'paymaya' | 'loan'`
- `ReturnItem.reason`: `ReturnReason | string` (supports custom text)
- `Return.loanPaymentDate?: string` field exists
- `RETURN_REASONS` array has no icons
- `REFUND_METHODS` array updated

### 5. Package Installation

**Installed:** `@react-native-community/datetimepicker@^8.2.0`

**Purpose:** Platform-native date picker component for loan payment date selection

### 6. Component Index Export

**File:** `C:\CapsProj\TindaGo\src\components\ui\index.ts`

**Added:**
```typescript
export { LoanPaymentDateModal } from "./LoanPaymentDateModal";
```

## UI/UX Flow

### Customer Return Request Flow

1. **Select Products:** Customer checks products to return
2. **Choose Quantity:** Uses +/- buttons to select quantity
3. **Select Reason:**
   - Option A: Choose from dropdown (Defective, Expired, Wrong Item, etc.)
   - Option B: Type custom reason in text box
   - Option C: Select "Other" AND type in text box
   - Custom text always takes priority if provided
4. **Upload Photos (Optional):** Add up to 5 photos
5. **Choose Refund Method:**
   - GCash
   - PayMaya
   - Loan (Pay Later)
6. **If Loan Selected:**
   - Modal appears automatically
   - Customer selects date (tomorrow to 30 days)
   - Date displayed below refund method selector
   - "Change" button available to modify date
7. **Submit Request:**
   - Validates all fields
   - Submits to Firebase with loan date if applicable

### Loan Date Modal Flow

1. **Trigger:** User selects "Loan (Pay Later)" refund method
2. **Display:** Modal appears with date picker
3. **Constraints:**
   - Minimum: Tomorrow
   - Maximum: 30 days from today
   - Default: Tomorrow's date
4. **Actions:**
   - **Proceed:** Saves date, closes modal, shows date below selector
   - **Cancel:** Closes modal, reverts to GCash if no date selected
   - **Change (from main screen):** Reopens modal to modify date
5. **Validation:** Cannot submit return request without date if loan selected

## Validation Rules

### Return Reason Validation
- Must have dropdown selection OR custom text (at least one required)
- If "Other" selected in dropdown → custom text is REQUIRED
- Custom text takes priority over dropdown if both provided
- Validates per-product (each selected product must have reason)

### Loan Date Validation
- Required if refund method is 'loan'
- Must be between tomorrow and 30 days from today
- Shows modal again if user tries to submit without date
- Date stored as ISO string in Firebase

### Quantity Validation
- Between 1 and original ordered quantity
- Validates before submission

## Data Stored in Firebase

### Return Request Object
```typescript
{
  // ... existing fields
  refundMethod: 'gcash' | 'paymaya' | 'loan',
  items: [
    {
      returnReason: string, // Custom text OR predefined reason
      // ... other item fields
    }
  ],
  loanPaymentDate?: string, // ISO string, only if refundMethod is 'loan'
  // ... other fields
}
```

**Example Loan Payment Date:**
```json
"loanPaymentDate": "2025-01-25T00:00:00.000Z"
```

## Technical Implementation

### State Management
- Uses React useState for all new states
- Map for custom reasons (keyed by productId)
- Single loanPaymentDate state (applies to entire request)
- Boolean showLoanModal for modal visibility

### Responsive Design
- All components use s(), vs(), ms() scaling functions
- Follows TindaGo design system (Colors, Fonts)
- Glassmorphism effects on modal overlay
- Maintains existing UI patterns

### Platform Compatibility
- Date picker adapts to platform (iOS spinner, Android calendar)
- TextInput multiline support
- Proper keyboard handling

### Error Handling
- Clear validation error messages
- Guides user to fix specific issues
- Prevents submission with incomplete data
- Auto-triggers loan modal if date missing

## Files Modified

1. **New File:** `src/components/ui/LoanPaymentDateModal.tsx` (346 lines)
2. **Updated:** `src/components/ui/RefundMethodSelector.tsx` (removed 2 options, added 1)
3. **Updated:** `app/(main)/(customer)/profile/return-request.tsx` (added ~150 lines)
4. **Updated:** `src/components/ui/index.ts` (added export)

**Total Lines Changed:** ~500 lines added/modified

## Testing Checklist

### Return Reason Testing
- [ ] Select dropdown reason only → submits successfully
- [ ] Type custom text only → submits successfully
- [ ] Select dropdown + type custom text → custom text takes priority
- [ ] Select "Other" without custom text → shows error
- [ ] Leave both empty → shows error
- [ ] Custom text persists when changing dropdown selection

### Refund Method Testing
- [ ] Select GCash → no modal, submits successfully
- [ ] Select PayMaya → no modal, submits successfully
- [ ] Select Loan → modal appears automatically
- [ ] Cancel loan modal without date → reverts to GCash
- [ ] Select loan date → shows below selector
- [ ] Change loan date → modal reopens, allows modification
- [ ] Submit loan without date → shows error and modal

### Loan Date Modal Testing
- [ ] Default date is tomorrow
- [ ] Cannot select today or past dates
- [ ] Cannot select dates beyond 30 days
- [ ] Date displays in readable format
- [ ] Cancel button works correctly
- [ ] Proceed button saves and closes modal
- [ ] Change button on main screen works

### Integration Testing
- [ ] Complete flow: select products → reasons → loan → date → submit
- [ ] Multiple products with different custom reasons
- [ ] Photo upload works with loan refund
- [ ] Additional details field still functional
- [ ] Summary shows correct refund amount
- [ ] Firebase stores all data correctly

### Edge Cases
- [ ] Switch from loan to other method → date still saved but not submitted
- [ ] Switch back to loan → previous date shown
- [ ] Rapid refund method changes
- [ ] Very long custom reason text
- [ ] Special characters in custom reason

## Benefits

1. **Flexibility:** Customers can provide any return reason (not limited to predefined)
2. **Clarity:** Custom text ensures specific issues are communicated
3. **Loan Support:** Enables flexible refund options with payment plans
4. **User-Friendly:** Intuitive date selection with clear constraints
5. **Validation:** Prevents incomplete submissions
6. **Maintainable:** Clean separation of concerns, reusable modal component

## Future Enhancements

1. **Loan Interest:** Add interest calculation based on payment date
2. **Multiple Dates:** Support installment plans with multiple dates
3. **Date Presets:** Quick buttons for "1 week", "2 weeks", "1 month"
4. **SMS Reminders:** Send payment date reminders to customers
5. **Reason Analytics:** Track most common custom reasons for inventory insights
6. **Reason Suggestions:** Auto-suggest reasons based on product type

## Dependencies

- **@react-native-community/datetimepicker:** ^8.2.0 (newly installed)
- React Native core components (Modal, TextInput, etc.)
- Existing TindaGo components (Dropdown, QuantitySelector, etc.)

## Notes

- Default refund method changed from 'wallet' to 'gcash'
- Custom reason always takes priority over dropdown selection
- Loan date required validation happens at submission time
- Modal auto-triggers when loan selected (can be dismissed)
- Date stored as ISO string for timezone consistency
- Return reasons dropdown has no icons (as per existing model)

## Conclusion

Successfully implemented dynamic return reasons with custom text input and loan payment date selection. The feature provides flexibility for customers while maintaining clear validation and user guidance. The loan refund option enables extended payment plans while ensuring proper date tracking.
