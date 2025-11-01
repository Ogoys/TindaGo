# Store Owner Earnings Data Flow Audit (TindaGo app + tindago-admin)

Scope
- Repos scanned: C:\CapsProj\TindaGo (mobile) and tindago-admin (web admin)
- Goal: ensure store-side Earnings/Transactions/Wallet reflect live data from the same Firebase project during development

Project alignment
- Both projects configured to the same Firebase project ID: tindagoproject
- Mobile env keys present (.env user-provided)
- Admin .env present and matches project

Mobile app (TindaGo) – Store owner screens
- Earnings (app/(main)/(store-owner)/earnings/index.tsx)
  - Reads: ledgers/stores/{storeId}/transactions (real-time)
  - Reads: wallets/{storeId} (real-time) if present
  - Fallback: dynamically computes available + pending from ledgers + payouts when wallet node missing
  - Totals: totalEarned (paid|settled), thisMonth (by date)
- Transaction History (app/(main)/(store-owner)/earnings/transactions.tsx)
  - Reads: ledgers/stores/{storeId}/transactions (real-time)
  - Filters by status (All/Paid/Pending)
  - Shows Amount, Commission, Your Earning (storeAmount)
- Wallet (app/(main)/(store-owner)/wallet/index.tsx)
  - Reads: wallets/{storeId} if present
  - Fallback: dynamically computes
    - available = sum(paid|settled storeAmount) − totalWithdrawn − pendingWithdrawal
    - pending = sum(pending storeAmount)
    - totalWithdrawn = sum(payouts where status=completed) scoped to storeId
  - Actions link to payout-request and payout-history
- Payout Request (app/(main)/(store-owner)/wallet/payout-request.tsx)
  - Creates payouts/{payoutId} with fields: { storeId, amount, method, accountName, accountNumber, status: 'pending', createdAt }
- Payout History (app/(main)/(store-owner)/wallet/payout-history.tsx)
  - Reads payouts filtered by storeId; shows status badges

Admin web (tindago-admin)
- Firebase init: src/lib/firebase.js uses NEXT_PUBLIC_* keys that match tindagoproject
- Admin services focus on registrations/stores CRUD (no payment/webhook layer found in this repo):
  - src/lib/adminService.ts: reads/writes store_registrations, stores
  - src/lib/storeService.ts: reads/writes stores/*, plus auxiliary nodes (store_orders, store_verifications, store_subscriptions)
- Not found in this repo:
  - /api/payments/invoice or Xendit webhook endpoints
  - Any writer to ledgers/stores/{storeId}/transactions or payouts/{payoutId}
  - Conclusion: payment/webhook likely resides in another service (or not yet added here)

Data dependencies for live store earnings
- ledgers/stores/{storeId}/transactions/{invoiceId}
  - Required fields per txn: { orderNumber, amount, commission, storeAmount, status, method, paidAt|createdAt }
  - Status considered: PENDING, PAID, SETTLED
- payouts/{payoutId}
  - Required fields: { storeId, amount, status: 'pending'|'approved'|'completed'|'rejected', createdAt }
- wallets/{storeId} (optional)
  - If present, app reads it; else app computes dynamically from ledgers+payouts (already implemented)

Commission behavior (as implemented in mobile docs)
- Platform fee (default 1%)
- storeAmount = amount − commission
- Earnings screens read commission/storeAmount and do not hardcode

What’s missing / where to write data
- Admin repo does not include payment creation or webhook routes that write ledgers/payouts
- Ensure your actual webhook service (tindago-admin or separate backend) writes:
  1) On successful payment: ledgers/stores/{storeId}/transactions/{invoiceId}
  2) On payout lifecycle: create/update payouts/{payoutId} with status transitions

Cloud Functions status
- Wallet Cloud Functions were added in mobile repo (functions/src/index.ts) to auto-sync wallets from ledgers+payouts
- Deployment blocked by Blaze plan requirement; not necessary for dev because mobile now computes wallet fallback
- Once Blaze is enabled: deploy functions to tindagoproject and optionally stop using fallback (kept for resilience)

Exact nodes the app listens to
- ledgers/stores/{storeId}/transactions (real-time onValue)
- wallets/{storeId} (real-time onValue, if exists)
- payouts (fallback compute filters by storeId)

Minimal required writes from admin/webhook
- On payment success (Xendit webhook):
  Path: ledgers/stores/{storeId}/transactions/{invoiceId}
  Document example:
  {
    "orderNumber": "ORD-2025-0001",
    "amount": 100,
    "commission": 1,
    "storeAmount": 99,
    "status": "PAID",
    "method": "gcash",
    "paidAt": "2025-11-01T01:20:00Z",
    "createdAt": "2025-11-01T01:15:00Z"
  }
- On payout creation and updates (admin UI or process):
  Create: payouts/{payoutId}
  { "storeId": "STORE_ID", "amount": 500, "status": "pending", "createdAt": ISOString }
  Update status: approved|completed|rejected

Development setup for live reflection
- Use one Firebase project (tindagoproject) across mobile + admin + webhook
- Mobile already configured; admin .env confirmed
- Ensure webhook writes to the same project paths above
- Result: Store Earnings/Transactions/Wallet reflect live immediately

Action checklist
- [ ] Confirm webhook service writes ledgers on payment success
- [ ] Confirm admin (or process) creates/updates payouts
- [ ] If you want precomputed wallets in DB, upgrade to Blaze and deploy functions; otherwise keep fallback
- [ ] Test: complete payment → see ledger node → mobile updates → wallet reflects; create payout → wallet available adjusts in fallback computation

Notes
- Mobile fallback keeps UX live without server functions and matches admin data if both write/read the same paths
- When moving to prod, server-side wallets are recommended for auditability; fallback can remain as safety net
