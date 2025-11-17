# Payout Request Admin Workflow System

## Overview
The TindaGo payout system allows store owners to request withdrawal of their earnings, which then require admin approval before completion. The system tracks the complete lifecycle of a payout request from submission to completion or rejection.

## Payout Status Flow

```
pending → approved → completed
   ↓
rejected (terminal state)
```

### Status Definitions

1. **Pending**: Initial state when store owner submits payout request. Awaiting admin review.
2. **Approved**: Admin has approved the request and debited the store's wallet. Funds are being processed.
3. **Completed**: Funds have been transferred to the store owner's account. Final successful state.
4. **Rejected**: Admin has rejected the request with a reason. Terminal state.

## Firebase Data Structure

### Main Payout Record: `payouts/${payoutId}`
```typescript
{
  // Identification
  payoutId: string,              // e.g., "PAYOUT-1234567890"
  storeId: string,
  storeName: string,
  storeOwnerName: string,
  storeOwnerEmail?: string,
  
  // Payout Details
  amount: number,
  method: 'gcash' | 'paymaya' | 'bank',
  accountName: string,
  accountNumber: string,
  
  // Status Tracking
  status: 'pending' | 'approved' | 'completed' | 'rejected',
  createdAt: string,             // ISO timestamp
  requestedAt: string,           // ISO timestamp
  
  // Admin Workflow Fields
  approvedBy?: string | null,
  approvedAt?: string | null,
  rejectedBy?: string | null,
  rejectedAt?: string | null,
  rejectionReason?: string | null,
  completedBy?: string | null,
  completedAt?: string | null,
  completionNote?: string | null,
  
  // Audit Trail
  statusHistory: [
    {
      status: string,
      timestamp: string,
      note?: string,
      actionBy?: string
    }
  ]
}
```

### Indexed Collections

#### `payouts_by_store/${storeId}/${payoutId}`
Quick lookup for store-specific payouts:
```typescript
{
  amount: number,
  status: string,
  createdAt: string
}
```

#### `payouts_by_status/${status}/${payoutId}`
Enables admin dashboard filtering by status:
```typescript
{
  storeId: string,
  storeName: string,
  amount: number,
  createdAt: string
}
```

#### `admin_notifications/${timestamp}`
Alerts admin of new payout requests:
```typescript
{
  type: 'payout_request',
  payoutId: string,
  storeId: string,
  storeName: string,
  amount: number,
  method: string,
  status: 'unread' | 'read',
  createdAt: string
}
```

## Store Owner Workflow

### 1. Request Payout
**File**: `app/(main)/(store-owner)/wallet/payout-requests.tsx`

- Store owner navigates to Wallet → Request Payout
- Pre-filled with e-wallet details from registration
- Validates:
  - Amount > 0
  - Amount <= available balance
  - Amount >= minimum payout (₱100)
  - Payment method selected
  - Account details provided
- On submit:
  - Creates payout record with status "pending"
  - Fetches store info for admin reference
  - Creates admin notification
  - Indexes by store and status
  - Initializes status history

### 2. View Payout History
**File**: `app/(main)/(store-owner)/wallet/payout-history.tsx`

- Real-time listener on `payouts/` collection
- Filters by storeId
- Shows all payouts with status badges
- Filter tabs: All, Pending, Approved, Completed, Rejected
- Updates automatically when admin changes status

**Status Badge Colors**:
- Completed: Green (#34C759)
- Approved: Blue (#007AFF)
- Pending: Orange (#FF9500)
- Rejected: Red (#FF3B30)

## Admin Workflow

### 1. View Payout Requests
**File**: `tindago-admin/src/components/admin/PayoutManagement.tsx`

- Fetches all payouts via API route
- Search by store name, store ID, or account details
- Filter by status
- Pagination (10 per page)
- Stats dashboard:
  - Total requests
  - Pending count & amount
  - Approved count & amount
  - Completed count
  - Rejected count

### 2. Approve Payout
**Function**: `approvePayoutRequest()`
**File**: `tindago-admin/src/lib/payoutService.ts`

1. Validates payout exists and status is "pending"
2. Debits amount from store wallet
3. Updates payout record:
   - status = 'approved'
   - approvedBy = admin user ID
   - approvedAt = current timestamp
   - Adds entry to statusHistory
4. Updates indexes:
   - Moves from `payouts_by_status/pending/` to `/approved/`
   - Updates `payouts_by_store/${storeId}/${payoutId}/status`
5. Also updates legacy `payout_requests/` if exists

**Result**: Store owner sees status change to "Approved" in real-time

### 3. Reject Payout
**Function**: `rejectPayoutRequest()`
**File**: `tindago-admin/src/lib/payoutService.ts`

1. Validates payout exists and status is "pending"
2. Prompts admin for rejection reason (required)
3. Updates payout record:
   - status = 'rejected'
   - rejectedBy = admin user ID
   - rejectedAt = current timestamp
   - rejectionReason = admin's note
   - Adds entry to statusHistory
4. Updates indexes:
   - Moves from `payouts_by_status/pending/` to `/rejected/`
   - Updates `payouts_by_store/${storeId}/${payoutId}/status`
5. Does NOT refund wallet (wallet was never debited)

**Result**: Store owner sees status change to "Rejected" with reason

### 4. Complete Payout
**Function**: `completePayoutRequest()`
**File**: `tindago-admin/src/lib/payoutService.ts`

1. Validates payout exists and status is "approved"
2. Optional: Prompts admin for completion note
3. Updates payout record:
   - status = 'completed'
   - completedBy = admin user ID
   - completedAt = current timestamp
   - completionNote = admin's note
   - Adds entry to statusHistory
4. Updates indexes:
   - Moves from `payouts_by_status/approved/` to `/completed/`
   - Updates `payouts_by_store/${storeId}/${payoutId}/status`

**Result**: Store owner sees status change to "Completed"

### 5. Bulk Approve
**Function**: `handleBulkApprove()`
**File**: `tindago-admin/src/components/admin/PayoutManagement.tsx`

- Admin can select multiple pending payouts via checkboxes
- Shows total selected count and amount
- Confirms before processing
- Iterates through selected payouts calling `approvePayoutRequest()` for each
- Shows success/failure count

## Real-Time Updates

### Store Owner Side
Uses Firebase `onValue()` listener on `payouts/` collection:
- Automatically reflects status changes
- No manual refresh needed
- Filters to show only their payouts

### Admin Side
Uses periodic refresh (every 5 minutes) or manual refresh:
- Reduces Firebase read costs
- Suitable for admin dashboard use case

## API Routes

### GET `/api/admin/payouts`
**File**: `tindago-admin/src/app/api/admin/payouts/route.ts`

- Fetches all payouts from Firebase
- Tries new `payouts/` structure first
- Falls back to legacy `payout_requests/` if needed
- Returns normalized payout array
- Bypasses Firebase security rules

### GET `/api/admin/payouts/stats`
Returns statistics:
```typescript
{
  totalRequests: number,
  pendingRequests: number,
  approvedRequests: number,
  rejectedRequests: number,
  completedRequests: number,
  pendingAmount: number,
  totalAmount: number
}
```

## Security Considerations

1. **Store Owner Permissions**:
   - Can only create payouts for their own store
   - Can only view their own payout history
   - Real-time listener filters by storeId

2. **Admin Permissions**:
   - Role checked via `roles/${uid}` === 'admin'
   - All admin actions record user ID for audit
   - Wallet debit occurs on approval (atomic operation)

3. **Validation**:
   - Minimum payout amount enforced
   - Cannot exceed available balance
   - Status transitions validated (e.g., can't complete without approval)
   - Account details validated (11-digit mobile for GCash/PayMaya)

## Error Handling

### Store Owner Side
- Insufficient balance → Shows error message
- Below minimum → Shows minimum required
- Network error → Toast notification
- Validation errors → Inline error messages

### Admin Side
- Payout not found → Error notification
- Already processed → Prevents duplicate action
- Wallet debit fails → Rolls back approval
- Bulk failures → Shows count of successes/failures

## Status History Audit Trail

Every status change is recorded in `statusHistory` array:
```typescript
{
  status: 'approved',
  timestamp: '2024-01-15T10:30:00.000Z',
  note: 'Approved by admin',
  actionBy: 'admin_user_id'
}
```

This provides:
- Complete audit trail
- Timestamp for each transition
- Who performed the action
- Context notes (especially useful for rejections)

## E-Wallet Integration

Payout requests are pre-filled with e-wallet details from:
1. **Store Registration**: Initial payment info saved during onboarding
2. **E-Wallet Details Screen**: Store owner can update in Profile/Settings

**Files**:
- Display & Auto-fill: `app/(main)/(store-owner)/wallet/payout-requests.tsx`
- Edit Screen: `app/(main)/(store-owner)/profile/ewallet-details.tsx`

**Data Path**: `stores/${storeId}/paymentInfo/`

## Future Enhancements

1. **Email Notifications**: Notify store owners of status changes
2. **Push Notifications**: Real-time alerts on mobile
3. **Batch Transfer Integration**: Connect to actual payment gateway
4. **Receipt Generation**: PDF receipt for completed payouts
5. **Dispute System**: Allow stores to dispute rejections
6. **Auto-approval**: Set threshold for automatic approval of small amounts
7. **Scheduled Payouts**: Regular weekly/monthly payout schedules

## Testing Checklist

### Store Owner Tests
- [ ] Create payout request with valid data
- [ ] Reject request with amount > balance
- [ ] Reject request with amount < minimum
- [ ] View pending payout in history
- [ ] See status change when admin approves
- [ ] See status change when admin rejects
- [ ] See status change when admin completes
- [ ] Filter payout history by status
- [ ] Pre-filled e-wallet details work

### Admin Tests
- [ ] View all pending payouts
- [ ] Search payouts by store name
- [ ] Filter payouts by status
- [ ] Approve single payout (wallet debited)
- [ ] Reject single payout (with reason)
- [ ] Complete approved payout
- [ ] Bulk approve multiple payouts
- [ ] Cannot approve already processed payout
- [ ] Cannot complete non-approved payout
- [ ] Stats dashboard shows accurate counts

### Real-Time Tests
- [ ] Store owner sees immediate update after admin approval
- [ ] Store owner sees immediate update after admin rejection
- [ ] Multiple browser windows sync correctly
- [ ] Notifications created on payout request

## Migration Notes

The system supports both:
- **New Structure**: `payouts/${payoutId}` (comprehensive tracking)
- **Legacy Structure**: `payout_requests/${payoutId}` (backward compatibility)

All admin functions update both structures when legacy data exists.
