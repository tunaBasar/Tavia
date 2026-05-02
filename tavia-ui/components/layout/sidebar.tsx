"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  ShoppingCart,
  Package,
  Brain,
  Hexagon,
  LogOut,
  Coffee,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/lib/store/use-auth-store";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

const navItems = [
  {
    label: "Overview",
    href: "/",
    icon: LayoutDashboard,
  },
  {
    label: "Customers",
    href: "/customers",
    icon: Users,
  },
  {
    label: "Orders",
    href: "/orders",
    icon: ShoppingCart,
  },
  {
    label: "Products",
    href: "/products",
    icon: Coffee,
  },
  {
    label: "Inventory",
    href: "/inventory",
    icon: Package,
  },
  {
    label: "AI Insights",
    href: "/ai-insights",
    icon: Brain,
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const tenantName = useAuthStore((s) => s.tenantName);
  const plan = useAuthStore((s) => s.plan);
  const tenantCity = useAuthStore((s) => s.tenantCity);
  const logout = useAuthStore((s) => s.logout);

  function handleLogout() {
    logout();
    router.replace("/login");
  }

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-full w-[240px] flex-col border-r border-border/50 bg-sidebar">
      {/* Logo */}
      <div className="flex h-16 items-center gap-3 border-b border-border/50 px-6">
        <div className="flex size-8 items-center justify-center rounded-lg bg-primary">
          <Hexagon className="size-4 text-primary-foreground" />
        </div>
        <div>
          <h1 className="text-sm font-bold tracking-tight text-foreground">
            TAVIA V2
          </h1>
          <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
            Control Panel
          </p>
        </div>
      </div>

      {/* Tenant Info */}
      {tenantName && (
        <div className="border-b border-border/50 px-6 py-3">
          <p className="truncate text-xs font-semibold text-foreground">
            {tenantName}
          </p>
          <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
            {plan} Plan
          </p>
          {tenantCity && (
            <div className="mt-1.5 flex items-center gap-1.5">
              <span className="inline-flex items-center rounded-md bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
                📍 {tenantCity}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/70">
          Navigation
        </p>
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-primary/10 text-primary shadow-sm"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              )}
            >
              <item.icon
                className={cn(
                  "size-4 transition-colors",
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground group-hover:text-foreground"
                )}
              />
              {item.label}
              {isActive && (
                <span className="ml-auto size-1.5 rounded-full bg-primary" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-border/50 px-4 py-4 space-y-3">
        <div className="flex items-center gap-2 px-2">
          <span className="relative flex size-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
          </span>
          <span className="text-xs font-medium text-muted-foreground">
            System Online
          </span>
        </div>
        <Separator />
        <Button
          id="logout-btn"
          variant="ghost"
          size="sm"
          className="w-full justify-start gap-2 text-muted-foreground hover:text-destructive"
          onClick={handleLogout}
        >
          <LogOut className="size-4" />
          Çıkış Yap
        </Button>
      </div>
    </aside>
  );
}
