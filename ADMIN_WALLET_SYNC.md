# Admin Wallet Sync Helpers

Use these server-side helpers (in tindago-admin) to keep `wallets/{storeId}` consistent when payouts are approved/completed.

## Approve payout (hold funds)
```js path=null start=null
// params: { payoutId, storeId, amount }
async function approvePayout(db, { payoutId, storeId, amount }) {
  const updates = {};
  // Move from available -> pendingWithdrawal
  updates[`wallets/${storeId}/available`] = admin.database.ServerValue.increment(-amount);
  updates[`wallets/${storeId}/pendingWithdrawal`] = admin.database.ServerValue.increment(amount);
  updates[`wallets/${storeId}/updatedAt`] = Date.now();
  updates[`payouts/${payoutId}/status`] = 'approved';
  updates[`payouts/${payoutId}/approvedAt`] = Date.now();
  await db.ref().update(updates);
}
```

## Complete payout (release)
```js path=null start=null
async function completePayout(db, { payoutId, storeId, amount }) {
  const updates = {};
  // Move from pendingWithdrawal -> totalWithdrawn
  updates[`wallets/${storeId}/pendingWithdrawal`] = admin.database.ServerValue.increment(-amount);
  updates[`wallets/${storeId}/totalWithdrawn`] = admin.database.ServerValue.increment(amount);
  updates[`wallets/${storeId}/updatedAt`] = Date.now();
  updates[`payouts/${payoutId}/status`] = 'completed';
  updates[`payouts/${payoutId}/completedAt`] = Date.now();
  await db.ref().update(updates);
}
```

## Reject payout (unhold)
```js path=null start=null
async function rejectPayout(db, { payoutId, storeId, amount, reason }) {
  const updates = {};
  // If you held on approve, reverse it here
  updates[`wallets/${storeId}/pendingWithdrawal`] = admin.database.ServerValue.increment(-amount);
  updates[`wallets/${storeId}/available`] = admin.database.ServerValue.increment(amount);
  updates[`wallets/${storeId}/updatedAt`] = Date.now();
  updates[`payouts/${payoutId}/status`] = 'rejected';
  updates[`payouts/${payoutId}/rejectedAt`] = Date.now();
  updates[`payouts/${payoutId}/rejectReason`] = reason || '';
  await db.ref().update(updates);
}
```

Notes
- Always validate the current status (e.g., pending -> approved -> completed) before updating.
- Wrap in a transaction or check-and-set if you need stronger guarantees across multiple admin workers.
- Keep Xendit payout/disbursement hooks in sync if you automate disbursements.
