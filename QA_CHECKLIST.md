# QA Checklist (Real Orders + Payout)

- Create/Pay Order
  - Place an order and complete payment (Xendit test/live).
  - Verify RTDB: ledgers/stores/{storeId}/transactions/{invoiceId} with status PAID/SETTLED and storeAmount.
  - App Wallet available increases (or fallback reflects it).

- Request Payout (Mobile)
  - Wallet → Request Payout (≥ ₱100).
  - Verify RTDB: payouts/{payoutId} and payouts_by_store/{storeId}/{payoutId} = true.
  - App Payout History shows the new entry as pending.

- Approve Payout (Admin)
  - tindago-admin → Payouts → Approve.
  - Verify RTDB: wallets/{storeId} available decreased, pendingWithdrawal increased; payouts/{payoutId}.status = approved; logs/{payoutId}/events appended.
  - App reflects approved status live.

- Complete Payout (Admin)
  - tindago-admin → Payouts → Mark Completed.
  - Verify RTDB: wallets/{storeId} pendingWithdrawal decreased, totalWithdrawn increased; payouts/{payoutId}.status = completed; logs updated.
  - App reflects completed status live.

- Filters & Roles
  - Payout History filters (all/pending/approved/completed/rejected) show correct counts.
  - Non-admin user (if any) cannot see Approve/Complete buttons in admin (roles/{uid} !== 'admin').

- Reconcile
  - Run nightly reconcile (optional): `npm run cron:reconcile` (admin) or `npm run backfill:wallets` (mobile repo) and confirm wallets remain consistent with ledgers+payouts.
