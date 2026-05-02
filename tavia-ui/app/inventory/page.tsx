"use client";

import {
  Package,
  Loader2,
  AlertCircle,
  Boxes,
  ArrowUpDown,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useInventory } from "@/lib/hooks/use-inventory";

/**
 * Returns a visual indicator for stock health.
 */
function stockStatus(stockQuantity: number) {
  if (stockQuantity <= 0) return { label: "Out of Stock", variant: "destructive" as const };
  if (stockQuantity < 10) return { label: "Low Stock", variant: "destructive" as const };
  if (stockQuantity < 50) return { label: "Medium", variant: "secondary" as const };
  return { label: "In Stock", variant: "default" as const };
}

/**
 * Returns a gradient class based on quantity status.
 */
function stockGradient(stockQuantity: number) {
  if (stockQuantity < 10) return "from-red-500 via-rose-500 to-pink-500";
  if (stockQuantity < 50) return "from-amber-500 via-orange-500 to-yellow-500";
  return "from-emerald-500 via-green-500 to-teal-500";
}

export default function InventoryPage() {
  const { data, isLoading, isError, error } = useInventory();

  const items = data?.data ?? [];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Inventory
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Raw material stock levels for your cafe
          </p>
        </div>
        {!isLoading && !isError && (
          <div className="flex items-center gap-2 rounded-lg border border-border/50 bg-card px-4 py-2">
            <Boxes className="size-4 text-muted-foreground" />
            <span className="text-sm font-semibold text-foreground">
              {items.length}
            </span>
            <span className="text-sm text-muted-foreground">raw materials</span>
          </div>
        )}
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex items-center gap-3 py-12">
          <Loader2 className="size-5 animate-spin text-muted-foreground" />
          <span className="text-muted-foreground">
            Loading inventory...
          </span>
        </div>
      ) : isError ? (
        <Card className="border-destructive/30">
          <CardContent className="flex items-center gap-3 py-8">
            <AlertCircle className="size-5 text-destructive" />
            <div>
              <p className="font-medium text-destructive">
                Failed to load inventory
              </p>
              <p className="text-sm text-muted-foreground">
                {error instanceof Error ? error.message : "Unknown error"}
              </p>
            </div>
          </CardContent>
        </Card>
      ) : items.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-12">
            <Package className="size-10 text-muted-foreground/50" />
            <p className="text-muted-foreground">
              No inventory items yet.
            </p>
            <p className="text-sm text-muted-foreground/70">
              Products will appear here when added via the Inventory API.
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <SummaryCard
              label="Total Raw Materials"
              value={items.length.toString()}
              gradient="from-blue-500 via-cyan-500 to-teal-500"
            />
            <SummaryCard
              label="Low Stock Items"
              value={items.filter((i) => i.stockQuantity < 10).length.toString()}
              gradient="from-red-500 via-rose-500 to-pink-500"
            />
            <SummaryCard
              label="In Stock"
              value={items.filter((i) => i.stockQuantity >= 10).length.toString()}
              gradient="from-emerald-500 via-green-500 to-teal-500"
            />
          </div>

          {/* Inventory Table */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <ArrowUpDown className="size-4" />
                Stock Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border/50 text-left text-muted-foreground">
                      <th className="pb-3 pr-4 font-medium">Raw Material</th>
                      <th className="pb-3 pr-4 font-medium">Quantity</th>
                      <th className="pb-3 pr-4 font-medium">Unit</th>
                      <th className="pb-3 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/30">
                    {items.map((item) => {
                      const status = stockStatus(item.stockQuantity);
                      return (
                        <tr key={item.id} className="group transition-colors hover:bg-accent/50">
                          <td className="py-3 pr-4">
                            <div className="flex items-center gap-3">
                              <div
                                className={`size-2 rounded-full bg-gradient-to-r ${stockGradient(item.stockQuantity)}`}
                              />
                              <span className="font-medium text-foreground">
                                {item.name}
                              </span>
                            </div>
                          </td>
                          <td className="py-3 pr-4 tabular-nums text-foreground">
                            {item.stockQuantity.toLocaleString("tr-TR", {
                              maximumFractionDigits: 1,
                            })}
                          </td>
                          <td className="py-3 pr-4">
                            <span className="rounded-md bg-accent px-2 py-0.5 text-xs font-medium uppercase text-muted-foreground">
                              {item.unit}
                            </span>
                          </td>
                          <td className="py-3">
                            <Badge variant={status.variant}>
                              {status.label}
                            </Badge>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

// ─── Summary Card helper ─────────────────────────────────────────

function SummaryCard({
  label,
  value,
  gradient,
}: {
  label: string;
  value: string;
  gradient: string;
}) {
  return (
    <div className="relative overflow-hidden rounded-xl border border-border/50 bg-card p-5">
      <div
        className={`absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r ${gradient}`}
      />
      <p className="text-sm font-medium text-muted-foreground">{label}</p>
      <p className="mt-2 text-2xl font-bold tracking-tight text-foreground">
        {value}
      </p>
    </div>
  );
}
