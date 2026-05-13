"use client";

import {
  ShoppingCart,
  Loader2,
  AlertCircle,
  Receipt,
  Calendar,
  TrendingUp,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useOrders } from "@/lib/hooks/use-orders";

/**
 * Formats a BigDecimal price string or number to Turkish Lira display.
 */
function formatPrice(price: number | string): string {
  const num = typeof price === "string" ? parseFloat(price) : price;
  return `₺${num.toLocaleString("tr-TR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

/**
 * Formats an ISO datetime string to a readable Turkish locale date.
 */
function formatDate(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString("tr-TR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return dateStr;
  }
}

export default function OrdersPage() {
  const { data, isLoading, isError, error } = useOrders();

  const orders = data?.data ?? [];

  // Calculate summary stats
  const totalRevenue = orders.reduce((sum, o) => {
    const price = typeof o.price === "string" ? parseFloat(o.price) : o.price;
    return sum + price * o.quantity;
  }, 0);

  const totalItems = orders.reduce((sum, o) => sum + o.quantity, 0);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Orders
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Order management and history
          </p>
        </div>
        {!isLoading && !isError && orders.length > 0 && (
          <div className="flex items-center gap-2 rounded-lg border border-border/50 bg-card px-4 py-2">
            <Receipt className="size-4 text-muted-foreground" />
            <span className="text-sm font-semibold text-foreground">
              {orders.length}
            </span>
            <span className="text-sm text-muted-foreground">orders</span>
          </div>
        )}
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex items-center gap-3 py-12">
          <Loader2 className="size-5 animate-spin text-muted-foreground" />
          <span className="text-muted-foreground">Loading orders...</span>
        </div>
      ) : isError ? (
        <Card className="border-destructive/30">
          <CardContent className="flex items-center gap-3 py-8">
            <AlertCircle className="size-5 text-destructive" />
            <div>
              <p className="font-medium text-destructive">
                Failed to load orders
              </p>
              <p className="text-sm text-muted-foreground">
                {error instanceof Error ? error.message : "Unknown error"}
              </p>
            </div>
          </CardContent>
        </Card>
      ) : orders.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-4 py-16">
            <ShoppingCart className="size-12 text-muted-foreground/30" />
            <div className="text-center">
              <p className="text-lg font-medium text-muted-foreground">
                No orders yet
              </p>
              <p className="mt-1 text-sm text-muted-foreground/70">
                Create orders via the &quot;Simulate Order&quot; button on the
                Overview page.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <SummaryCard
              label="Total Orders"
              value={orders.length.toString()}
              gradient="from-amber-500 via-orange-500 to-red-500"
              icon={<ShoppingCart className="size-4" />}
            />
            <SummaryCard
              label="Total Revenue"
              value={formatPrice(totalRevenue)}
              gradient="from-emerald-500 via-green-500 to-teal-500"
              icon={<TrendingUp className="size-4" />}
            />
            <SummaryCard
              label="Items Sold"
              value={totalItems.toLocaleString("tr-TR")}
              gradient="from-blue-500 via-cyan-500 to-teal-500"
              icon={<Calendar className="size-4" />}
            />
          </div>

          {/* Orders Table */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Receipt className="size-4" />
                Order History
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border/50 text-left text-muted-foreground">
                      <th className="pb-3 pr-4 font-medium">Order ID</th>
                      <th className="pb-3 pr-4 font-medium">Customer</th>
                      <th className="pb-3 pr-4 font-medium">Product</th>
                      <th className="pb-3 pr-4 font-medium">Qty</th>
                      <th className="pb-3 pr-4 font-medium">Price</th>
                      <th className="pb-3 pr-4 font-medium">Total</th>
                      <th className="pb-3 pr-4 font-medium">Status</th>
                      <th className="pb-3 font-medium">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/30">
                    {orders.map((order) => {
                      const unitPrice =
                        typeof order.price === "string"
                          ? parseFloat(order.price)
                          : order.price;
                      const total = unitPrice * order.quantity;

                      return (
                        <tr
                          key={order.id}
                          className="group transition-colors hover:bg-accent/50"
                        >
                          <td className="py-3 pr-4">
                            <span className="font-mono text-xs text-muted-foreground">
                              {order.id.slice(0, 8)}…
                            </span>
                          </td>
                          <td className="py-3 pr-4">
                            <div className="flex flex-col">
                              <span className="font-medium text-foreground">
                                {order.customerName || "Anonymous"}
                              </span>
                              {order.loyaltyLevel && (
                                <span className="text-[10px] font-semibold tracking-wider text-muted-foreground">
                                  {order.loyaltyLevel}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-3 pr-4">
                            <span className="font-medium text-foreground">
                              {order.productName}
                            </span>
                          </td>
                          <td className="py-3 pr-4 tabular-nums text-foreground">
                            {order.quantity}
                          </td>
                          <td className="py-3 pr-4 tabular-nums text-muted-foreground">
                            {formatPrice(unitPrice)}
                          </td>
                          <td className="py-3 pr-4">
                            <Badge variant="secondary" className="tabular-nums">
                              {formatPrice(total)}
                            </Badge>
                          </td>
                          <td className="py-3 pr-4">
                            <Badge
                              variant="outline"
                              className={
                                order.status === "COMPLETED"
                                  ? "border-green-500/30 bg-green-500/10 text-green-500"
                                  : order.status === "PENDING"
                                  ? "border-yellow-500/30 bg-yellow-500/10 text-yellow-500"
                                  : order.status === "PREPARING"
                                  ? "border-blue-500/30 bg-blue-500/10 text-blue-500"
                                  : order.status === "CANCELLED"
                                  ? "border-red-500/30 bg-red-500/10 text-red-500"
                                  : ""
                              }
                            >
                              {order.status}
                            </Badge>
                          </td>
                          <td className="py-3 text-xs text-muted-foreground">
                            {formatDate(order.orderDate)}
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
  icon,
}: {
  label: string;
  value: string;
  gradient: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="relative overflow-hidden rounded-xl border border-border/50 bg-card p-5">
      <div
        className={`absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r ${gradient}`}
      />
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        <div className="flex size-8 items-center justify-center rounded-lg bg-accent text-muted-foreground">
          {icon}
        </div>
      </div>
      <p className="mt-2 text-2xl font-bold tracking-tight text-foreground">
        {value}
      </p>
    </div>
  );
}
