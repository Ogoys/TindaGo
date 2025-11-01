import { setGlobalOptions } from 'firebase-functions/v2';
import { onValueWritten, onValueCreated, onValueUpdated } from 'firebase-functions/v2/database';
import { onCall } from 'firebase-functions/v2/https';
import { initializeApp } from 'firebase-admin/app';
import { getDatabase } from 'firebase-admin/database';

setGlobalOptions({ region: 'asia-southeast1', maxInstances: 10 });
initializeApp();

const db = getDatabase();

type Txn = {
  status?: string;
  storeAmount?: number;
  paidAt?: string;
  createdAt?: string;
};

type Wallet = {
  available: number;
  pending: number; // pending earnings (from PENDING transactions)
  totalEarned: number;
  totalWithdrawn: number;
  pendingWithdrawal: number; // amounts locked by payout requests
  updatedAt: number;
};

async function recomputeWalletForStore(storeId: string): Promise<Wallet> {
  const txnsSnap = await db.ref(`ledgers/stores/${storeId}/transactions`).get();

  let earned = 0; // paid + settled
  let pending = 0; // pending earnings

  if (txnsSnap.exists()) {
    txnsSnap.forEach((child) => {
      const txn = child.val() as Txn;
      const amount = Number(txn.storeAmount || 0);
      const status = String(txn.status || '').toUpperCase();

      if (status === 'PENDING') {
        pending += amount;
      } else if (status === 'PAID' || status === 'SETTLED') {
        earned += amount;
      }
    });
  }

  const walletRef = db.ref(`wallets/${storeId}`);
  const walletSnap = await walletRef.get();
  const current = (walletSnap.exists() ? walletSnap.val() : {}) as Partial<Wallet>;

  const totalWithdrawn = Number(current.totalWithdrawn || 0);
  const pendingWithdrawal = Number((current as any).pendingWithdrawal || 0);

  const available = Math.max(earned - totalWithdrawn - pendingWithdrawal, 0);

  const updated: Wallet = {
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

export const onLedgerTxnWrite = onValueWritten(
  {
    ref: '/ledgers/stores/{storeId}/transactions/{txnId}',
    concurrency: 50,
  },
  async (event) => {
    const { storeId } = event.params as { storeId: string };
    if (!storeId) return;
    await recomputeWalletForStore(storeId);
  }
);

export const onPayoutCreated = onValueCreated(
  {
    ref: '/payouts/{payoutId}',
    concurrency: 50,
  },
  async (event) => {
    const payout = event.data?.val() as any;
    const storeId: string | undefined = payout?.storeId;
    const amount: number = Number(payout?.amount || 0);
    if (!storeId || !amount || amount <= 0) return;

    const walletRef = db.ref(`wallets/${storeId}`);
    await walletRef.transaction((w: any) => {
      const wallet = (w || {}) as Partial<Wallet>;
      const available = Number(wallet.available || 0);
      const pendingWithdrawal = Number((wallet as any).pendingWithdrawal || 0);
      return {
        available: Math.max(available - amount, 0),
        pending: Number(wallet.pending || 0),
        totalEarned: Number(wallet.totalEarned || 0),
        totalWithdrawn: Number(wallet.totalWithdrawn || 0),
        pendingWithdrawal: pendingWithdrawal + amount,
        updatedAt: Date.now(),
      } satisfies Wallet;
    });
  }
);

export const onPayoutUpdated = onValueUpdated(
  {
    ref: '/payouts/{payoutId}',
    concurrency: 50,
  },
  async (event) => {
    const before = event.data?.before?.val() as any;
    const after = event.data?.after?.val() as any;

    const storeId: string | undefined = after?.storeId || before?.storeId;
    const amount: number = Number(after?.amount || before?.amount || 0);
    const prevStatus: string = String(before?.status || '').toLowerCase();
    const nextStatus: string = String(after?.status || '').toLowerCase();

    if (!storeId || !amount || amount <= 0 || prevStatus === nextStatus) return;

    const walletRef = db.ref(`wallets/${storeId}`);

    // completed: move from pendingWithdrawal -> totalWithdrawn
    if (nextStatus === 'completed') {
      await walletRef.transaction((w: any) => {
        const wallet = (w || {}) as Partial<Wallet>;
        const pendingWithdrawal = Number((wallet as any).pendingWithdrawal || 0);
        const totalWithdrawn = Number(wallet.totalWithdrawn || 0);
        return {
          available: Number(wallet.available || 0),
          pending: Number(wallet.pending || 0),
          totalEarned: Number(wallet.totalEarned || 0),
          totalWithdrawn: totalWithdrawn + amount,
          pendingWithdrawal: Math.max(pendingWithdrawal - amount, 0),
          updatedAt: Date.now(),
        } satisfies Wallet;
      });
      return;
    }

    // rejected: release funds back to available
    if (nextStatus === 'rejected') {
      await walletRef.transaction((w: any) => {
        const wallet = (w || {}) as Partial<Wallet>;
        const pendingWithdrawal = Number((wallet as any).pendingWithdrawal || 0);
        const available = Number(wallet.available || 0);
        return {
          available: available + amount,
          pending: Number(wallet.pending || 0),
          totalEarned: Number(wallet.totalEarned || 0),
          totalWithdrawn: Number(wallet.totalWithdrawn || 0),
          pendingWithdrawal: Math.max(pendingWithdrawal - amount, 0),
          updatedAt: Date.now(),
        } satisfies Wallet;
      });
      return;
    }

    // approved or other transitions: no wallet math change
  }
);

export const recomputeWallet = onCall(async (request) => {
  const data = request.data as { storeId?: string } | undefined;
  const storeId = data?.storeId;

  if (storeId) {
    const updated = await recomputeWalletForStore(storeId);
    return { ok: true, storeId, wallet: updated };
  }

  // Recompute all wallets for all stores that have ledgers
  const storesSnap = await db.ref('ledgers/stores').get();
  if (!storesSnap.exists()) return { ok: true, count: 0 };

  let count = 0;
  const tasks: Promise<any>[] = [];
  storesSnap.forEach((child) => {
    const sid = child.key as string;
    count++;
    tasks.push(recomputeWalletForStore(sid));
  });
  await Promise.all(tasks);
  return { ok: true, count };
});
