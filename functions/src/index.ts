import { setGlobalOptions } from 'firebase-functions/v2';
import { onValueWritten, onValueCreated, onValueUpdated } from 'firebase-functions/v2/database';
import { onCall } from 'firebase-functions/v2/https';
import { onSchedule } from 'firebase-functions/v2/scheduler';
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

// -----------------------------
// Debt reminders - Efficient approach using Firebase triggers
// -----------------------------

/**
 * Send immediate notification when Pay Later order is created
 * Triggered when: orders/{orderId} is created with paymentMethod = 'Pay Later'
 */
export const onPayLaterOrderCreated = onValueCreated(
  {
    ref: '/orders/{orderId}',
    concurrency: 50,
  },
  async (event) => {
    const order = event.data?.val() as any;
    const orderId = (event.params as any).orderId as string;
    
    // Only process Pay Later orders
    if (order?.paymentMethod !== 'Pay Later' || !order?.customerId) return;
    
    try {
      // Fetch customer push token
      const tokenSnap = await db.ref(`users/${order.customerId}/pushToken`).get();
      const pushToken = tokenSnap.exists() ? tokenSnap.val() : null;
      
      if (pushToken) {
        // Send immediate confirmation
        const message = {
          to: pushToken,
          sound: 'default',
          title: 'Order Confirmed - Pay Later',
          body: `Your order from ${order.storeName || 'store'} will be paid later. Due: ${order.dueDate ? new Date(order.dueDate).toLocaleDateString() : 'TBD'}`,
          data: { orderId, type: 'pay_later_order_created', storeId: order.storeId },
        };
        
        await fetch('https://exp.host/--/api/v2/push/send', {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(message),
        });
        
        console.log(`✅ Pay Later notification sent for order ${orderId}`);
      }
    } catch (error) {
      console.error(`❌ Error sending Pay Later notification:`, error);
    }
  }
);

/**
 * Send payment reminder 3 days before due date
 * Simple approach: Check daily at midnight and send reminders
 */
export const sendDailyDebtReminders = onSchedule(
  { schedule: 'every day 09:00', timeZone: 'Asia/Manila' },
  async () => {
    const now = new Date();
    const threeDaysFromNow = new Date(now);
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
    const threeDaysFromNowStr = threeDaysFromNow.toISOString().split('T')[0]; // YYYY-MM-DD
    
    console.log(`🔔 Checking debt reminders for due date: ${threeDaysFromNowStr}`);
    
    // Fetch all unpaid Pay Later orders
    const ordersSnap = await db.ref('orders').orderByChild('paymentMethod').equalTo('Pay Later').get();
    if (!ordersSnap.exists()) return;
    
    const tasks: Promise<any>[] = [];
    ordersSnap.forEach((child) => {
      const order = child.val() as any;
      const orderId = child.key as string;
      
      // Skip if already paid or no due date
      if (!order.dueDate || order.paymentStatus === 'PAID' || order.debtStatus === 'paid') return;
      
      // Check if due date matches (3 days from now)
      const orderDueDate = new Date(order.dueDate).toISOString().split('T')[0];
      if (orderDueDate !== threeDaysFromNowStr) return;
      
      tasks.push((async () => {
        try {
          // Fetch customer push token
          const tokenSnap = await db.ref(`users/${order.customerId}/pushToken`).get();
          const pushToken = tokenSnap.exists() ? tokenSnap.val() : null;
          
          if (pushToken) {
            const message = {
              to: pushToken,
              sound: 'default',
              title: '💰 Payment Reminder',
              body: `Your Pay Later balance from ${order.storeName || 'store'} is due in 3 days. Please settle to avoid late fees.`,
              data: { orderId, storeId: order.storeId, type: 'debt_due_reminder' },
            };
            
            await fetch('https://exp.host/--/api/v2/push/send', {
              method: 'POST',
              headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(message),
            });
            
            console.log(`✅ Reminder sent for order ${orderId}`);
          }
        } catch (error) {
          console.error(`❌ Error sending reminder for order ${orderId}:`, error);
        }
      })());
    });
    
    await Promise.all(tasks);
    console.log(`✅ Sent ${tasks.length} debt reminders`);
  }
);

/**
 * Cancel scheduled reminder when order is paid/settled (or debt marked paid)
 */
export const onDebtOrderPaid = onValueUpdated({ ref: '/orders/{orderId}' }, async (event) => {
  const before = event.data?.before?.val() as any;
  const after = event.data?.after?.val() as any;
  const prevPaid = String(before?.paymentStatus || '').toUpperCase();
  const nextPaid = String(after?.paymentStatus || '').toUpperCase();
  const prevDebt = String(before?.debtStatus || '').toLowerCase();
  const nextDebt = String(after?.debtStatus || '').toLowerCase();

  const paidNow = (prevPaid !== nextPaid && (nextPaid === 'PAID' || nextPaid === 'SETTLED'))
    || (prevDebt !== nextDebt && nextDebt === 'paid');
  if (!paidNow) return;

  const orderId = (event.params as any).orderId as string;
  await db.ref(`scheduledReminders/${orderId}`).update({ cancelled: true, processed: true, processedAt: Date.now() });
});

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
