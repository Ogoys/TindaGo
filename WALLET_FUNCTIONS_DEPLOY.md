# Wallet Functions Deployment Guide

This adds Firebase Cloud Functions that:
- Keep `wallets/{storeId}` in sync with `ledgers/stores/{storeId}/transactions`
- Lock funds on payout request, and finalize/release on status changes
- Provide a callable function to backfill/recompute wallets

What the wallet doc contains:
- available: totalEarned - totalWithdrawn - pendingWithdrawal
- pending: sum of storeAmount for transactions with status PENDING
- totalEarned: sum of storeAmount for PAID/SETTLED
- totalWithdrawn: sum of completed payouts (starts at 0)
- pendingWithdrawal: sum of payout requests in pending/approved

How to deploy:
1) Install Firebase tools (one-time):
   npm i -g firebase-tools

2) Login and pick your project:
   firebase login
   firebase use <your-project-id>

3) Install functions deps:
   cd functions && npm install && npm run build

4) Deploy functions only:
   firebase deploy --only functions

Backfill existing data:
- After deploy, call the callable function once from your app or shell to recompute all wallets:

Client example (RN/Expo):
```ts path=null start=null
import { getFunctions, httpsCallable } from 'firebase/functions';
const functions = getFunctions();
const recompute = httpsCallable(functions, 'recomputeWallet');
await recompute(); // recompute all stores
// or a single store
await recompute({ storeId: 'yourStoreId' });
```

Admin check:
- wallets/{storeId} will appear automatically after first ledger write or after backfill
- payout flows: create a node at payouts/{payoutId} with { storeId, amount, status }

Notes:
- Region is asia-southeast1
- If you later change commission handling or statuses, just adjust the reducer logic in functions/src/index.ts and redeploy.
