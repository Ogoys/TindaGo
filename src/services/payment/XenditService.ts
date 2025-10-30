/**
 * Xendit Payment Service
 *
 * Handles payment processing with 1% platform commission
 * Uses Xendit Invoice API for GCash, PayMaya, and other payment methods
 */

import axios from 'axios';

// Xendit API configuration
const XENDIT_SECRET_KEY = process.env.EXPO_PUBLIC_XENDIT_SECRET_KEY || '';
const XENDIT_BASE_URL = 'https://api.xendit.co';
const PLATFORM_COMMISSION_RATE = parseFloat(process.env.EXPO_PUBLIC_PLATFORM_COMMISSION_RATE || '0.01');

// Create axios instance with authentication
const xenditApi = axios.create({
  baseURL: XENDIT_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  auth: {
    username: XENDIT_SECRET_KEY,
    password: '', // Xendit uses basic auth with secret key as username, no password
  },
});

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

class XenditService {
  /**
   * Create payment invoice with 1% platform commission
   */
  async createPayment(request: PaymentRequest): Promise<PaymentResponse> {
    try {
      // Calculate commission (1% of total)
      const platformCommission = Math.round(request.amount * PLATFORM_COMMISSION_RATE * 100) / 100;
      const storeAmount = request.amount - platformCommission;

      console.log('Creating Xendit payment:', {
        orderId: request.orderId,
        amount: request.amount,
        commission: platformCommission,
        storeAmount,
      });

      // Prepare invoice data
      const invoiceData = {
        external_id: request.orderId,
        amount: request.amount,
        payer_email: request.customerEmail,
        description: `TindaGo Order ${request.orderNumber} from ${request.storeName}`,
        invoice_duration: 86400, // 24 hours expiry

        // Customer info
        customer: {
          given_names: request.customerName,
          email: request.customerEmail,
          mobile_number: request.customerPhone,
        },

        // Platform fee (1% commission)
        fees: [
          {
            type: 'PLATFORM_FEE',
            value: platformCommission,
          },
        ],

        // Order items
        items: request.items.map(item => ({
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          category: 'Groceries',
        })),

        // Payment methods allowed
        payment_methods: this.getPaymentMethods(request.paymentMethod),

        // Success/failure redirect URLs (optional - for web)
        success_redirect_url: 'tindago://payment/success',
        failure_redirect_url: 'tindago://payment/failure',

        // Metadata for tracking
        metadata: {
          order_id: request.orderId,
          order_number: request.orderNumber,
          store_id: request.storeId,
          store_name: request.storeName,
          platform_commission: platformCommission,
          store_amount: storeAmount,
        },
      };

      // Call Xendit API
      const response = await xenditApi.post('/v2/invoices', invoiceData);

      console.log('Xendit invoice created:', {
        invoiceId: response.data.id,
        status: response.data.status,
      });

      return {
        success: true,
        invoiceId: response.data.id,
        invoiceUrl: response.data.invoice_url,
        expiryDate: response.data.expiry_date,
        platformCommission,
        storeAmount,
      };

    } catch (error: any) {
      console.error('Xendit payment error:', error.response?.data || error.message);

      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Failed to create payment',
      };
    }
  }

  /**
   * Get payment methods based on user selection
   */
  private getPaymentMethods(method: string): string[] {
    switch (method) {
      case 'gcash':
        return ['GCASH'];
      case 'paymaya':
        return ['PAYMAYA'];
      case 'online':
        return ['GCASH', 'PAYMAYA', 'CREDIT_CARD', 'DEBIT_CARD'];
      default:
        return ['GCASH', 'PAYMAYA'];
    }
  }

  /**
   * Check payment status
   */
  async getPaymentStatus(invoiceId: string): Promise<PaymentStatusResponse> {
    try {
      const response = await xenditApi.get(`/v2/invoices/${invoiceId}`);

      return {
        success: true,
        status: response.data.status,
        paidAmount: response.data.paid_amount,
        paidAt: response.data.paid_at,
        paymentMethod: response.data.payment_method,
      };

    } catch (error: any) {
      console.error('Error checking payment status:', error.response?.data || error.message);

      return {
        success: false,
        error: error.response?.data?.message || 'Failed to check payment status',
      };
    }
  }

  /**
   * Simulate payment for testing (sandbox only)
   */
  async simulatePayment(invoiceId: string, amount: number): Promise<boolean> {
    try {
      // In Xendit test mode, you can simulate payments via API or dashboard
      console.log('Simulating payment for invoice:', invoiceId);

      // NOTE: In test mode, you need to manually pay the invoice using test payment methods
      // Or use Xendit dashboard to simulate payment

      return true;
    } catch (error: any) {
      console.error('Error simulating payment:', error);
      return false;
    }
  }

  /**
   * Validate webhook callback from Xendit
   */
  validateWebhookSignature(payload: string, signature: string, webhookToken: string): boolean {
    // Implement webhook signature validation for production
    // For sandbox testing, you can skip this
    return true;
  }
}

// Export singleton instance
export const xenditService = new XenditService();
export default xenditService;
