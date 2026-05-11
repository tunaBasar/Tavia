import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '@/lib/axios';
import {
  ApiResponse,
  CustomerAuthResponse,
  CustomerLoginRequest,
  CustomerRegisterRequest,
} from '@/types';

interface CustomerAuthState {
  /** The authenticated customer, null if not logged in */
  customer: CustomerAuthResponse | null;
  /** Whether the store has been hydrated from AsyncStorage */
  isHydrated: boolean;
  /** Loading state for auth actions */
  isLoading: boolean;
  /** Last error message */
  error: string | null;

  /** Login with email/password */
  login: (request: CustomerLoginRequest) => Promise<boolean>;
  /** Register a new customer */
  register: (request: CustomerRegisterRequest) => Promise<boolean>;
  /** Clear auth state (logout) */
  logout: () => void;
  /** Mark hydration complete */
  setHydrated: () => void;
  /** Clear error */
  clearError: () => void;
}

export const useCustomerAuthStore = create<CustomerAuthState>()(
  persist(
    (set) => ({
      customer: null,
      isHydrated: false,
      isLoading: false,
      error: null,

      login: async (request: CustomerLoginRequest) => {
        set({ isLoading: true, error: null });
        try {
          const response = await api.post<ApiResponse<CustomerAuthResponse>>(
            '/api/v1/crm/auth/login',
            request
          );
          set({ customer: response.data.data, isLoading: false });
          return true;
        } catch (err: unknown) {
          const message = extractErrorMessage(err, 'Login failed. Please check your credentials.');
          set({ error: message, isLoading: false });
          return false;
        }
      },

      register: async (request: CustomerRegisterRequest) => {
        set({ isLoading: true, error: null });
        try {
          const response = await api.post<ApiResponse<CustomerAuthResponse>>(
            '/api/v1/crm/auth/register',
            request
          );
          set({ customer: response.data.data, isLoading: false });
          return true;
        } catch (err: unknown) {
          const message = extractErrorMessage(err, 'Registration failed.');
          set({ error: message, isLoading: false });
          return false;
        }
      },

      logout: () => {
        set({ customer: null, error: null });
      },

      setHydrated: () => {
        set({ isHydrated: true });
      },

      clearError: () => {
        set({ error: null });
      },
    }),
    {
      name: 'tavia-customer-auth',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ customer: state.customer }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated();
      },
    }
  )
);

import { isAxiosError } from 'axios';

/** Extract a user-friendly error message from Axios errors */
function extractErrorMessage(err: unknown, fallback: string): string {
  if (isAxiosError(err) && err.response?.data) {
    if (err.response.data.detail) {
      return err.response.data.detail;
    }
    if (err.response.data.message) {
      return err.response.data.message;
    }
  }
  if (err instanceof Error) {
    return err.message;
  }
  return fallback;
}
