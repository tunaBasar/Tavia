import { create } from 'zustand';
import { isAxiosError } from 'axios';
import api from '@/lib/axios';
import { ApiResponse, CreateOrderRequest, OrderResponse } from '@/types';

interface OrderState {
  isSubmitting: boolean;
  lastOrder: OrderResponse | null;
  error: string | null;

  placeOrder: (request: CreateOrderRequest) => Promise<boolean>;
  clearOrderState: () => void;
}

export const useOrderStore = create<OrderState>((set) => ({
  isSubmitting: false,
  lastOrder: null,
  error: null,

  placeOrder: async (request: CreateOrderRequest) => {
    set({ isSubmitting: true, error: null });
    try {
      const response = await api.post<ApiResponse<OrderResponse>>(
        '/api/v1/orders',
        request
      );
      set({ lastOrder: response.data.data, isSubmitting: false });
      return true;
    } catch (err: unknown) {
      const message = extractError(err, 'Failed to place order.');
      set({ error: message, isSubmitting: false });
      return false;
    }
  },

  clearOrderState: () => {
    set({ lastOrder: null, error: null });
  },
}));

function extractError(err: unknown, fallback: string): string {
  if (isAxiosError(err) && err.response?.data) {
    if (err.response.data.detail) return err.response.data.detail;
    if (err.response.data.message) return err.response.data.message;
  }
  if (err instanceof Error) return err.message;
  return fallback;
}
