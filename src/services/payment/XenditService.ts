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
  items: {
    name: string;
    quantity: number;
    price: number;
  }[];
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

export interface PurchaseOrderPaymentRequest {
  purchaseOrderId: string;
  purchaseOrderNumber: string;
  amount: number;
  storeOwnerEmail: string;
  storeOwnerName: string;
  storeOwnerPhone: string;
  storeId: string;
  storeName: string;
  supplierName: string;
  items: {
    name: string;
    quantity: number;
    price: number;
  }[];
  paymentMethod: 'gcash' | 'paymaya';
}

class PaymentService {
  /**
   * Create payment invoice via admin API
   */
  async createPayment(request: PaymentRequest): Promise<PaymentResponse> {
    try {
      console.log('[XenditService] Calling admin API:', ADMIN_API_BASE, 'with order:', request.orderNumber);
      const res = await fetch(`${ADMIN_API_BASE}/api/payments/invoice`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: request.orderId,
          orderNumber: request.orderNumber,
          total: request.amount,
          method: request.paymentMethod,
          store: { id: request.storeId, name: request.storeName },
          customer: { email: request.customerEmail, name: request.customerName, phone: request.customerPhone },
          items: request.items,
        }),
      });

      console.log('[XenditService] Admin API response status:', res.status);
      if (!res.ok) {
        const text = await res.text();
        console.error('[XenditService] Admin API error response:', text);
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
   * Create payment invoice for Purchase Order (B2B payment tracking)
   * Store owner pays supplier via Xendit for record keeping
   */
  async createPurchaseOrderPayment(request: PurchaseOrderPaymentRequest): Promise<PaymentResponse> {
    try {
      console.log('[XenditService] Creating Purchase Order payment:', request.purchaseOrderNumber);
      console.log('[XenditService] API Base URL:', ADMIN_API_BASE);
      console.log('[XenditService] Request payload:', JSON.stringify({
        purchaseOrderId: request.purchaseOrderId,
        purchaseOrderNumber: request.purchaseOrderNumber,
        total: request.amount,
        method: request.paymentMethod,
        store: { id: request.storeId, name: request.storeName },
      }));

      const res = await fetch(`${ADMIN_API_BASE}/api/payments/purchase-order-invoice`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          purchaseOrderId: request.purchaseOrderId,
          purchaseOrderNumber: request.purchaseOrderNumber,
          total: request.amount,
          method: request.paymentMethod,
          store: { id: request.storeId, name: request.storeName },
          storeOwner: {
            email: request.storeOwnerEmail,
            name: request.storeOwnerName,
            phone: request.storeOwnerPhone
          },
          supplierName: request.supplierName,
          items: request.items,
        }),
      });

      console.log('[XenditService] Purchase Order payment response status:', res.status);
      if (!res.ok) {
        const text = await res.text();
        console.error('[XenditService] Purchase Order payment error response:', text);
        console.error('[XenditService] Response headers:', JSON.stringify(res.headers));

        // Try to parse as JSON for better error message
        let errorMessage = text;
        try {
          const errorJson = JSON.parse(text);
          errorMessage = errorJson.error || errorJson.message || text;
        } catch {
          // Keep original text if not JSON
        }

        return { success: false, error: `HTTP ${res.status}: ${errorMessage}` };
      }

      const data = await res.json();
      console.log('[XenditService] Purchase Order payment success:', data);
      return {
        success: true,
        invoiceId: data.invoiceId,
        invoiceUrl: data.invoiceUrl,
        expiryDate: data.expiryDate,
      };
    } catch (error: any) {
      console.error('[XenditService] Purchase Order payment exception:', error);
      console.error('[XenditService] Error details:', {
        message: error?.message,
        stack: error?.stack,
        type: typeof error,
      });
      return { success: false, error: `Network error: ${error?.message || 'Unknown error'}` };
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
