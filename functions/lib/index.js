"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.recomputeWallet = exports.onPayoutUpdated = exports.onPayoutCreated = exports.onLedgerTxnWrite = void 0;
const v2_1 = require("firebase-functions/v2");
const database_1 = require("firebase-functions/v2/database");
const https_1 = require("firebase-functions/v2/https");
const app_1 = require("firebase-admin/app");
const database_2 = require("firebase-admin/database");
(0, v2_1.setGlobalOptions)({ region: 'asia-southeast1', maxInstances: 10 });
(0, app_1.initializeApp)();
const db = (0, database_2.getDatabase)();
async function recomputeWalletForStore(storeId) {
    const txnsSnap = await db.ref(`ledgers/stores/${storeId}/transactions`).get();
    let earned = 0; // paid + settled
    let pending = 0; // pending earnings
    if (txnsSnap.exists()) {
        txnsSnap.forEach((child) => {
            const txn = child.val();
            const amount = Number(txn.storeAmount || 0);
            const status = String(txn.status || '').toUpperCase();
            if (status === 'PENDING') {
                pending += amount;
            }
            else if (status === 'PAID' || status === 'SETTLED') {
                earned += amount;
            }
        });
    }
    const walletRef = db.ref(`wallets/${storeId}`);
    const walletSnap = await walletRef.get();
    const current = (walletSnap.exists() ? walletSnap.val() : {});
    const totalWithdrawn = Number(current.totalWithdrawn || 0);
    const pendingWithdrawal = Number(current.pendingWithdrawal || 0);
    const available = Math.max(earned - totalWithdrawn - pendingWithdrawal, 0);
    const updated = {
        available,
        pending,
        totalEarned: earned,
        totalWithdrawn,
        pendingWithdrawal,
        updatedAt: Date.now(),
    };
    await walletRef.update(updated);
    return updated;
}
exports.onLedgerTxnWrite = (0, database_1.onValueWritten)({
    ref: '/ledgers/stores/{storeId}/transactions/{txnId}',
    concurrency: 50,
}, async (event) => {
    const { storeId } = event.params;
    if (!storeId)
        return;
    await recomputeWalletForStore(storeId);
});
exports.onPayoutCreated = (0, database_1.onValueCreated)({
    ref: '/payouts/{payoutId}',
    concurrency: 50,
}, async (event) => {
    const payout = event.data?.val();
    const storeId = payout?.storeId;
    const amount = Number(payout?.amount || 0);
    if (!storeId || !amount || amount <= 0)
        return;
    const walletRef = db.ref(`wallets/${storeId}`);
    await walletRef.transaction((w) => {
        const wallet = (w || {});
        const available = Number(wallet.available || 0);
        const pendingWithdrawal = Number(wallet.pendingWithdrawal || 0);
        return {
            available: Math.max(available - amount, 0),
            pending: Number(wallet.pending || 0),
            totalEarned: Number(wallet.totalEarned || 0),
            totalWithdrawn: Number(wallet.totalWithdrawn || 0),
            pendingWithdrawal: pendingWithdrawal + amount,
            updatedAt: Date.now(),
        };
    });
});
exports.onPayoutUpdated = (0, database_1.onValueUpdated)({
    ref: '/payouts/{payoutId}',
    concurrency: 50,
}, async (event) => {
    const before = event.data?.before?.val();
    const after = event.data?.after?.val();
    const storeId = after?.storeId || before?.storeId;
    const amount = Number(after?.amount || before?.amount || 0);
    const prevStatus = String(before?.status || '').toLowerCase();
    const nextStatus = String(after?.status || '').toLowerCase();
    if (!storeId || !amount || amount <= 0 || prevStatus === nextStatus)
        return;
    const walletRef = db.ref(`wallets/${storeId}`);
    // completed: move from pendingWithdrawal -> totalWithdrawn
    if (nextStatus === 'completed') {
        await walletRef.transaction((w) => {
            const wallet = (w || {});
            const pendingWithdrawal = Number(wallet.pendingWithdrawal || 0);
            const totalWithdrawn = Number(wallet.totalWithdrawn || 0);
            return {
                available: Number(wallet.available || 0),
                pending: Number(wallet.pending || 0),
                totalEarned: Number(wallet.totalEarned || 0),
                totalWithdrawn: totalWithdrawn + amount,
                pendingWithdrawal: Math.max(pendingWithdrawal - amount, 0),
                updatedAt: Date.now(),
            };
        });
        return;
    }
    // rejected: release funds back to available
    if (nextStatus === 'rejected') {
        await walletRef.transaction((w) => {
            const wallet = (w || {});
            const pendingWithdrawal = Number(wallet.pendingWithdrawal || 0);
            const available = Number(wallet.available || 0);
            return {
                available: available + amount,
                pending: Number(wallet.pending || 0),
                totalEarned: Number(wallet.totalEarned || 0),
                totalWithdrawn: Number(wallet.totalWithdrawn || 0),
                pendingWithdrawal: Math.max(pendingWithdrawal - amount, 0),
                updatedAt: Date.now(),
            };
        });
        return;
    }
    // approved or other transitions: no wallet math change
});
exports.recomputeWallet = (0, https_1.onCall)(async (request) => {
    const data = request.data;
    const storeId = data?.storeId;
    if (storeId) {
        const updated = await recomputeWalletForStore(storeId);
        return { ok: true, storeId, wallet: updated };
    }
    // Recompute all wallets for all stores that have ledgers
    const storesSnap = await db.ref('ledgers/stores').get();
    if (!storesSnap.exists())
        return { ok: true, count: 0 };
    let count = 0;
    const tasks = [];
    storesSnap.forEach((child) => {
        const sid = child.key;
        count++;
        tasks.push(recomputeWalletForStore(sid));
    });
    await Promise.all(tasks);
    return { ok: true, count };
});
