import { create } from 'zustand';
import { City, TenantSummary, ApiResponse } from '@/types';
import api from '@/lib/axios';

interface DiscoveryState {
  /** Currently selected city for cafe discovery */
  selectedCity: City;
  /** List of tenants/cafes in the selected city */
  tenants: TenantSummary[];
  /** Loading state for API calls */
  isLoading: boolean;
  /** Error message from last failed fetch */
  error: string | null;

  /** Update the selected city */
  setCity: (city: City) => void;
  /** Fetch tenants for the currently selected city */
  fetchTenants: () => Promise<void>;
}

export const useDiscoveryStore = create<DiscoveryState>((set, get) => ({
  selectedCity: City.ISPARTA,
  tenants: [],
  isLoading: false,
  error: null,

  setCity: (city: City) => {
    set({ selectedCity: city });
  },

  fetchTenants: async () => {
    const { selectedCity } = get();
    set({ isLoading: true, error: null });

    try {
      const response = await api.get<ApiResponse<TenantSummary[]>>(
        '/api/v1/tenants',
        { params: { city: selectedCity } }
      );
      set({ tenants: response.data.data, isLoading: false });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to fetch cafes.';
      set({ tenants: [], error: message, isLoading: false });
    }
  },
}));
