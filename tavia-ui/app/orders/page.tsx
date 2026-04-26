"use client";

import { ShoppingCart } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function OrdersPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Orders
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Sipariş yönetimi ve geçmişi
        </p>
      </div>

      <Card>
        <CardContent className="flex flex-col items-center gap-4 py-16">
          <ShoppingCart className="size-12 text-muted-foreground/30" />
          <div className="text-center">
            <p className="text-lg font-medium text-muted-foreground">
              Sipariş listesi yakında burada
            </p>
            <p className="mt-1 text-sm text-muted-foreground/70">
              Siparişleri dashboard üzerinden &quot;Simulate Order&quot; butonu ile
              oluşturabilirsiniz.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
