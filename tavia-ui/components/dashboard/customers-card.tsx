"use client";

import { Users, Loader2, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCustomers } from "@/lib/hooks/use-customers";

export function CustomersCard() {
  const { data, isLoading, isError } = useCustomers();

  const count = data?.data?.length ?? 0;

  return (
    <Card className="relative overflow-hidden">
      {/* Gradient accent */}
      <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-blue-500 via-cyan-500 to-teal-500" />

      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          Total Customers
        </CardTitle>
        <div className="flex size-8 items-center justify-center rounded-lg bg-blue-500/10">
          <Users className="size-4 text-blue-500" />
        </div>
      </CardHeader>

      <CardContent>
        {isLoading ? (
          <div className="flex items-center gap-2">
            <Loader2 className="size-4 animate-spin text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Loading...</span>
          </div>
        ) : isError ? (
          <div className="flex items-center gap-2">
            <AlertCircle className="size-4 text-destructive" />
            <span className="text-sm text-destructive">Failed to load</span>
          </div>
        ) : (
          <>
            <p className="text-3xl font-bold tracking-tight text-foreground">
              {count}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Registered in CRM
            </p>
          </>
        )}
      </CardContent>
    </Card>
  );
}
