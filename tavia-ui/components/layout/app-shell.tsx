"use client";

import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";

const AUTH_ROUTES = ["/login", "/register"];

/**
 * Conditionally renders Sidebar + Header.
 * On auth pages (login/register) — renders children full-width without shell.
 */
export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthPage = AUTH_ROUTES.includes(pathname);

  if (isAuthPage) {
    return <>{children}</>;
  }

  return (
    <>
      <Sidebar />
      <div className="ml-[240px] flex min-h-screen flex-col">
        <Header />
        <main className="flex-1 p-8">{children}</main>
      </div>
    </>
  );
}
