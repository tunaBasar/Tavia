"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/lib/store/use-auth-store";

const PUBLIC_ROUTES = ["/login", "/register"];

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  useEffect(() => {
    const isPublicRoute = PUBLIC_ROUTES.includes(pathname);

    if (!isAuthenticated && !isPublicRoute) {
      router.replace("/login");
    }

    if (isAuthenticated && isPublicRoute) {
      router.replace("/");
    }
  }, [isAuthenticated, pathname, router]);

  const isPublicRoute = PUBLIC_ROUTES.includes(pathname);

  // While redirecting — show nothing to prevent flash
  if (!isAuthenticated && !isPublicRoute) {
    return null;
  }
  if (isAuthenticated && isPublicRoute) {
    return null;
  }

  return <>{children}</>;
}
