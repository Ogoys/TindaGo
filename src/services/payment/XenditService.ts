/**
 * Payment Service (calls admin API to create Xendit invoices)
 *
 * Moves all secret interaction to tindago-admin. Mobile only calls the admin endpoint
 * and opens the returned invoice URL.
 */

const ADMIN_API_BASE = process.env.EXPO_PUBLIC_ADMIN_API_BASE || 'http://localhost:3000';

export interface PaymentRequest {
  orderId: string;
  orderNumber: string;
  amount: number;
  customerEmail: string;
  customerName: string;
  customerPhone: string;
  storeId: string;
  storeName: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  paymentMethod: 'gcash' | 'paymaya' | 'online';
}

export interface PaymentResponse {
  success: boolean;
  invoiceId?: string;
  invoiceUrl?: string;
  expiryDate?: string;
  platformCommission?: number;
  storeAmount?: number;
  error?: string;
}

export interface PaymentStatusResponse {
  success: boolean;
  status?: 'PENDING' | 'PAID' | 'EXPIRED' | 'SETTLED';
  paidAmount?: number;
  paidAt?: string;
  paymentMethod?: string;
  error?: string;
}

class PaymentService {
  /**
   * Create payment invoice via admin API
   */
  async createPayment(request: PaymentRequest): Promise<PaymentResponse> {
    try {
      const res = await fetch(`${ADMIN_API_BASE}/api/payments/invoice`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderNumber: request.orderNumber,
          total: request.amount,
          method: request.paymentMethod,
          store: { id: request.storeId, name: request.storeName },
          customer: { email: request.customerEmail, name: request.customerName, phone: request.customerPhone },
          items: request.items,
        }),
      });

      if (!res.ok) {
        const text = await res.text();
        return { success: false, error: text || 'Failed to create invoice' };
      }

      const data = await res.json();
      return {
        success: true,
        invoiceId: data.invoiceId,
        invoiceUrl: data.invoiceUrl,
        expiryDate: data.expiryDate,
        platformCommission: data.commission,
        storeAmount: data.storeAmount,
      };
    } catch (error: any) {
      console.error('Admin invoice error:', error?.message || error);
      return { success: false, error: error?.message || 'Network error' };
    }
  }

  /**
   * Polling method can be implemented via admin later if needed
   */
  async getPaymentStatus(_invoiceId: string): Promise<PaymentStatusResponse> {
    return { success: true, status: 'PENDING' };
  }

  async simulatePayment(_invoiceId: string, _amount: number): Promise<boolean> {
    return true;
  }
}

export const xenditService = new PaymentService();
export default xenditService;
