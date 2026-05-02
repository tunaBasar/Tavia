"use client";

import { CustomersCard } from "@/components/dashboard/customers-card";
import { ContextCard } from "@/components/dashboard/context-card";
import { AiLiveFeed } from "@/components/dashboard/ai-live-feed";
import { SimulateOrderButton } from "@/components/dashboard/simulate-order-button";
import { useOrderCount } from "@/lib/hooks/use-order-count";

export default function OverviewPage() {
  const { data: totalOrders, isLoading: isOrderCountLoading } = useOrderCount();

  return (
    <div className="space-y-8">
      {/* Page Header + Simulate Button */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Overview
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Real-time system state and AI decision stream
          </p>
        </div>
        <SimulateOrderButton />
      </div>

      {/* Grid Layout: Metrics + AI Feed */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left: Metrics Cards */}
        <div className="space-y-6 lg:col-span-2">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <CustomersCard />
            <ContextCard />
          </div>

          {/* Additional metrics area — ready for future expansion */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            <StatCard
              label="Total Orders"
              value={
                isOrderCountLoading
                  ? "..."
                  : totalOrders != null
                    ? totalOrders.toLocaleString()
                    : "0"
              }
              subtext={
                isOrderCountLoading
                  ? "Loading..."
                  : "All-time for this tenant"
              }
              gradient="from-amber-500 via-orange-500 to-red-500"
            />
            <StatCard
              label="AI Decisions"
              value="7"
              subtext="Last 24 hours"
              gradient="from-emerald-500 via-green-500 to-teal-500"
            />
            <StatCard
              label="Revenue Impact"
              value="—"
              subtext="Calculation pending"
              gradient="from-pink-500 via-rose-500 to-red-500"
            />
          </div>
        </div>

        {/* Right: AI Live Feed */}
        <div className="lg:col-span-1">
          <AiLiveFeed />
        </div>
      </div>
    </div>
  );
}

// ─── Small stat card helper ──────────────────────────────────────
function StatCard({
  label,
  value,
  subtext,
  gradient,
}: {
  label: string;
  value: string;
  subtext: string;
  gradient: string;
}) {
  return (
    <div className="relative overflow-hidden rounded-xl border border-border/50 bg-card p-5">
      <div className={`absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r ${gradient}`} />
      <p className="text-sm font-medium text-muted-foreground">{label}</p>
      <p className="mt-2 text-2xl font-bold tracking-tight text-foreground">
        {value}
      </p>
      <p className="mt-1 text-xs text-muted-foreground">{subtext}</p>
    </div>
  );
}
