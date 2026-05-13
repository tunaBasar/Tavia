import { create } from 'zustand';
import { isAxiosError } from 'axios';
import api from '@/lib/axios';
import { ApiResponse, RecipeDto } from '@/types';

interface CatalogState {
  recipes: RecipeDto[];
  isLoading: boolean;
  error: string | null;

  fetchActiveRecipes: () => Promise<void>;
  clearCatalog: () => void;
}

export const useCatalogStore = create<CatalogState>((set) => ({
  recipes: [],
  isLoading: false,
  error: null,

  fetchActiveRecipes: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get<ApiResponse<RecipeDto[]>>(
        '/api/v1/catalog/recipes/active'
      );
      set({ recipes: response.data.data, isLoading: false });
    } catch (err: unknown) {
      const message = extractError(err, 'Failed to load menu.');
      set({ error: message, isLoading: false });
    }
  },

  clearCatalog: () => {
    set({ recipes: [], error: null });
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
