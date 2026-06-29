import { useMutation } from '@tanstack/react-query';
import api from '../lib/axios';
import type { SignupRequest, LoginRequest } from '../lib/types';

/* =========================================
   Auth API hooks
   ========================================= */

/** POST /api/v1/auth/signup */
export function useSignup() {
  return useMutation({
    mutationFn: async (data: SignupRequest) => {
      const res = await api.post<string>('/api/v1/auth/signup', data);
      return res.data; // "User registered successfully."
    },
  });
}

/** POST /api/v1/auth/login */
export function useLogin() {
  return useMutation({
    mutationFn: async (data: LoginRequest) => {
      const res = await api.post<string>('/api/v1/auth/login', data);
      return res.data; // "Login successful"
    },
  });
}

/** POST /api/v1/auth/logout */
export function useLogout() {
  return useMutation({
    mutationFn: async () => {
      const res = await api.post<string>('/api/v1/auth/logout');
      return res.data; // "Logged out successfully"
    },
  });
}
