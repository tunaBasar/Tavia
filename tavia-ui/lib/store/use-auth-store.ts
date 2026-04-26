import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { SubscriptionPlan, City } from "@/types";

interface Tenant {
  id: string;
  name: string;
  city: City;
  plan: SubscriptionPlan;
}

interface AuthState {
  tenantId: string | null;
  tenantName: string | null;
  plan: SubscriptionPlan | null;
  tenantCity: City | null;
  isAuthenticated: boolean;
  activeTenant: Tenant | null;

  login: (
    tenantId: string,
    tenantName: string,
    plan: SubscriptionPlan,
    city: City
  ) => void;
  logout: () => void;
  reset: () => void;
}

const initialState = {
  tenantId: null,
  tenantName: null,
  plan: null,
  tenantCity: null,
  isAuthenticated: false,
  activeTenant: null,
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      ...initialState,

      login: (tenantId, tenantName, plan, city) =>
        set({
          tenantId,
          tenantName,
          plan,
          tenantCity: city,
          isAuthenticated: true,
          activeTenant: { id: tenantId, name: tenantName, city, plan },
        }),

      logout: () => set({ ...initialState }),

      reset: () => set({ ...initialState }),
    }),
    {
      name: "tavia-auth",
    }
  )
);
