#!/usr/bin/env node
/*
Backfill Wallets from ledgers + payouts (Realtime Database)

Usage:
  1) npm i -D firebase-admin
  2) Set credentials and database URL (one of):
     - set GOOGLE_APPLICATION_CREDENTIALS=path/to/serviceAccount.json
       and set FIREBASE_DATABASE_URL=https://<project-id>.firebaseio.com
     - or initialize with your preferred method in code
  3) npm run backfill:wallets
*/

const admin = require('firebase-admin');

function init() {
  if (admin.apps.length) return;
  const databaseURL = process.env.FIREBASE_DATABASE_URL;
  try {
    admin.initializeApp({
      credential: admin.credential.applicationDefault(),
      databaseURL,
    });
  } catch (e) {
    console.error('Init error. Ensure GOOGLE_APPLICATION_CREDENTIALS and FIREBASE_DATABASE_URL are set.');
    throw e;
  }
}

function num(n) {
  const x = Number(n);
  return isNaN(x) ? 0 : x;
}

async function computeForStore(db, storeId, ledgersByStore, payoutsByStore) {
  let earned = 0;
  // ledgers: sum storeAmount for PAID/SETTLED
  const txns = ((ledgersByStore[storeId] || {}).transactions) || {};
  for (const [, t] of Object.entries(txns)) {
    const s = String((t && t.status) || '').toUpperCase();
    const amt = num(t && (t.storeAmount ?? t.amount));
    if (s === 'PAID' || s === 'SETTLED') earned += amt;
  }

  // payouts: separate completed vs pending/approved
  let totalWithdrawn = 0;
  let pendingWithdrawal = 0;
  const list = payoutsByStore[storeId] || [];
  for (const p of list) {
    const s = String((p && p.status) || '').toLowerCase();
    const amt = num(p && p.amount);
    if (s === 'completed') totalWithdrawn += amt;
    else if (s === 'pending' || s === 'approved') pendingWithdrawal += amt;
  }

  const available = Math.max(earned - totalWithdrawn - pendingWithdrawal, 0);
  const wallet = {
    available,
    pendingWithdrawal,
    totalWithdrawn,
    updatedAt: Date.now(),
  };

  await db.ref(`wallets/${storeId}`).update(wallet);
  return { storeId, wallet };
}

async function main() {
  init();
  const db = admin.database();

  const [ledgersSnap, payoutsSnap] = await Promise.all([
    db.ref('ledgers/stores').get(),
    db.ref('payouts').get(),
  ]);

  const ledgersStores = ledgersSnap.exists() ? ledgersSnap.val() : {};
  const payouts = payoutsSnap.exists() ? payoutsSnap.val() : {};

  // group payouts by storeId
  const payoutsByStore = {};
  for (const [, p] of Object.entries(payouts)) {
    const sid = p && p.storeId;
    if (!sid) continue;
    if (!payoutsByStore[sid]) payoutsByStore[sid] = [];
    payoutsByStore[sid].push(p);
  }

  // union of storeIds from ledgers and payouts
  const storeIds = new Set([
    ...Object.keys(ledgersStores || {}),
    ...Object.keys(payoutsByStore || {}),
  ]);

  console.log(`Backfilling wallets for ${storeIds.size} store(s)...`);
  let count = 0;
  for (const storeId of storeIds) {
    // eslint-disable-next-line no-await-in-loop
    const res = await computeForStore(db, storeId, ledgersStores, payoutsByStore);
    count += 1;
    console.log(`${count}/${storeIds.size} -> ${storeId}`, res.wallet);
  }

  console.log('Done.');
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
