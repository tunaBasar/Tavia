import { create } from 'zustand';

interface ActiveTenantState {
  activeTenantId: string | null;
  setActiveTenantId: (id: string | null) => void;
}

export const useActiveTenantStore = create<ActiveTenantState>((set) => ({
  activeTenantId: null,
  setActiveTenantId: (id) => set({ activeTenantId: id }),
}));
