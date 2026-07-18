import type { CourseAmountResponseDto } from './types';

/* =========================================
   Razorpay Checkout Helper
   ========================================= */

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => RazorpayInstance;
  }
}

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description?: string;
  order_id: string;
  handler: (response: RazorpayResponse) => void;
  prefill?: { name?: string; email?: string };
  theme?: { color?: string };
  modal?: { ondismiss?: () => void };
}

interface RazorpayInstance {
  open: () => void;
  close: () => void;
}

export interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

/**
 * Open the Razorpay Checkout modal.
 *
 * @param orderData  - response from `POST /api/v1/payment/order/{courseId}`
 * @param onSuccess  - called with the Razorpay callback data after a successful payment
 * @param onDismiss  - called when the user closes the modal without paying
 * @param userName   - optional prefill for the customer name
 */
export function openRazorpayCheckout(
  orderData: CourseAmountResponseDto,
  onSuccess: (response: RazorpayResponse) => void,
  onDismiss?: () => void,
  onError?: (error: any) => void,
  userName?: string,
): void {
  const keyId = import.meta.env.VITE_RAZORPAY_KEY_ID as string | undefined;

  if (!keyId) {
    console.error('[LearnVault] VITE_RAZORPAY_KEY_ID is not set — cannot open checkout.');
    return;
  }

  if (typeof window.Razorpay === 'undefined') {
    console.error('[LearnVault] Razorpay SDK not loaded — make sure checkout.js is in index.html.');
    return;
  }

  const options: RazorpayOptions = {
    key: keyId,
    amount: orderData.amount,
    currency: orderData.currency,
    name: 'LearnVault',
    description: `Enroll in ${orderData.courseName}`,
    order_id: orderData.razorpayOrderId,
    handler: onSuccess,
    prefill: { name: userName },
    theme: { color: '#4F46E5' },
    modal: { ondismiss: onDismiss },
  };

  const rzp = new window.Razorpay(options);

  // By listening to payment.failed, Razorpay won't show the default native alert
  rzp.on('payment.failed', function (response: any) {
    if (onError) {
      onError(response.error);
    }
  });

  rzp.open();
}
