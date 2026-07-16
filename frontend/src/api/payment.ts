import { useMutation } from '@tanstack/react-query';
import api from './axios';
import type { CourseAmountResponseDto, VerifyPaymentRequest } from '../lib/types';

/* =========================================
   Payment API hooks
   ========================================= */

/** POST /api/v1/payment/order/{courseId} — create Razorpay order */
export function useCreateOrder() {
  return useMutation({
    mutationFn: async (courseId: number) => {
      const res = await api.post<CourseAmountResponseDto>(
        `/api/v1/payment/order/${courseId}`,
      );
      return res.data;
    },
  });
}

/** POST /api/v1/payment/verify — verify payment after Razorpay callback */
export function useVerifyPayment() {
  return useMutation({
    mutationFn: async (data: VerifyPaymentRequest) => {
      const res = await api.post<string>('/api/v1/payment/verify', data);
      return res.data;
    },
  });
}
