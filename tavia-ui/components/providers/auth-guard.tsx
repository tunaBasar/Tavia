"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/lib/store/use-auth-store";

const PUBLIC_ROUTES = ["/login", "/register"];

/**
 * AuthGuard — prevents unauthenticated users from seeing the dashboard.
 *
 * Key fixes:
 * 1. Waits for Zustand persist hydration before making routing decisions,
 *    preventing a flash where `isAuthenticated === false` before localStorage
 *    is rehydrated.
 * 2. Validates that `tenantId` is present (not just `isAuthenticated`),
 *    ensuring users without a real active tenant cannot access protected routes.
 */
export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const tenantId = useAuthStore((s) => s.tenantId);

  // Track whether Zustand has finished rehydrating from localStorage.
  const [hasHydrated, setHasHydrated] = useState(false);

  useEffect(() => {
    // Zustand persist exposes onFinishHydration via rehydrate or we check
    // the persist API. The simplest reliable approach: subscribe once.
    const unsub = useAuthStore.persist.onFinishHydration(() => {
      setHasHydrated(true);
    });

    // If hydration already completed before this effect ran (common in dev)
    if (useAuthStore.persist.hasHydrated()) {
      setHasHydrated(true);
    }

    return unsub;
  }, []);

  useEffect(() => {
    if (!hasHydrated) return; // Don't redirect until store is ready

    const isPublicRoute = PUBLIC_ROUTES.includes(pathname);

    // A user is truly authenticated only if flag is true AND tenantId exists
    const isFullyAuthenticated = isAuthenticated && !!tenantId;

    if (!isFullyAuthenticated && !isPublicRoute) {
      router.replace("/login");
    }

    if (isFullyAuthenticated && isPublicRoute) {
      router.replace("/");
    }
  }, [hasHydrated, isAuthenticated, tenantId, pathname, router]);

  // While Zustand is rehydrating — show nothing (prevents flash)
  if (!hasHydrated) {
    return null;
  }

  const isPublicRoute = PUBLIC_ROUTES.includes(pathname);
  const isFullyAuthenticated = isAuthenticated && !!tenantId;

  // While redirecting — show nothing to prevent flash
  if (!isFullyAuthenticated && !isPublicRoute) {
    return null;
  }
  if (isFullyAuthenticated && isPublicRoute) {
    return null;
  }

  return <>{children}</>;
}
