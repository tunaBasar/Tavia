"use client";

import { Users, Loader2, AlertCircle } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useCustomers } from "@/lib/hooks/use-customers";

export default function CustomersPage() {
  const { data, isLoading, isError, error } = useCustomers();

  const customers = data?.data ?? [];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Customers
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          CRM service üzerinden kayıtlı müşteriler
        </p>
      </div>

      {isLoading ? (
        <div className="flex items-center gap-3 py-12">
          <Loader2 className="size-5 animate-spin text-muted-foreground" />
          <span className="text-muted-foreground">
            Müşteriler yükleniyor...
          </span>
        </div>
      ) : isError ? (
        <Card className="border-destructive/30">
          <CardContent className="flex items-center gap-3 py-8">
            <AlertCircle className="size-5 text-destructive" />
            <div>
              <p className="font-medium text-destructive">
                Müşteriler yüklenemedi
              </p>
              <p className="text-sm text-muted-foreground">
                {error instanceof Error ? error.message : "Unknown error"}
              </p>
            </div>
          </CardContent>
        </Card>
      ) : customers.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-12">
            <Users className="size-10 text-muted-foreground/50" />
            <p className="text-muted-foreground">Henüz kayıtlı müşteri yok.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {customers.map((customer) => (
            <Card key={customer.id} className="relative overflow-hidden">
              <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-blue-500 via-cyan-500 to-teal-500" />
              <CardHeader className="pb-2">
                <CardTitle className="text-base">{customer.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-1 text-sm text-muted-foreground">
                <p>{customer.email}</p>
                <div className="flex items-center gap-2 pt-2">
                  <span className="rounded-md bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
                    {customer.loyaltyLevel}
                  </span>
                  {customer.city && (
                    <span className="rounded-md bg-accent px-2 py-0.5 text-xs font-medium text-foreground">
                      📍 {customer.city}
                    </span>
                  )}
                </div>
                <p className="text-xs pt-1">
                  ₺{customer.totalSpentInThisTenant?.toLocaleString("tr-TR") ?? "0"} harcama
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
