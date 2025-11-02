#!/usr/bin/env node
/*
Approve a payout: moves amount from available → pendingWithdrawal and sets status=approved.
Usage (PowerShell):
  $env:GOOGLE_APPLICATION_CREDENTIALS="C:\\keys\\service.json"
  $env:FIREBASE_DATABASE_URL="https://<db>.firebasedatabase.app"
  npm run payout:approve -- --id=PAYOUT-123 --store=STORE_ID --amount=500
*/

const admin = require('firebase-admin');

function init() {
  if (admin.apps.length) return;
  const databaseURL = process.env.FIREBASE_DATABASE_URL;
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    databaseURL,
  });
}

function getArg(name, fallback) {
  const arg = process.argv.find(a => a.startsWith(`--${name}=`));
  return arg ? arg.split('=')[1] : fallback;
}

(async function main() {
  init();
  const db = admin.database();
  const payoutId = getArg('id');
  const storeId = getArg('store');
  const amountStr = getArg('amount');
  if (!payoutId || !storeId || !amountStr) {
    console.error('Missing args. Use: --id= --store= --amount=');
    process.exit(1);
  }
  const amount = Number(amountStr);
  if (!(amount > 0)) {
    console.error('Amount must be > 0');
    process.exit(1);
  }

  const updates = {};
  updates[`wallets/${storeId}/available`] = admin.database.ServerValue.increment(-amount);
  updates[`wallets/${storeId}/pendingWithdrawal`] = admin.database.ServerValue.increment(amount);
  updates[`wallets/${storeId}/updatedAt`] = Date.now();
  updates[`payouts/${payoutId}/status`] = 'approved';
  updates[`payouts/${payoutId}/approvedAt`] = Date.now();
  updates[`logs/${payoutId}/events/${Date.now()}`] = { action: 'approved', amount, storeId };

  await db.ref().update(updates);
  console.log(`Approved ${payoutId} for store ${storeId} amount ${amount}`);
  process.exit(0);
})().catch((e) => { console.error(e); process.exit(1); });
