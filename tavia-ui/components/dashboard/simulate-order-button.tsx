"use client";

import { Play, Loader2, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSimulateOrder } from "@/lib/hooks/use-simulate-order";
import { cn } from "@/lib/utils";

export function SimulateOrderButton() {
  const { mutate, isPending, isSuccess, isError, reset } = useSimulateOrder();

  // Auto-reset status after 3 seconds
  if (isSuccess || isError) {
    setTimeout(() => reset(), 3000);
  }

  return (
    <Button
      id="simulate-order-btn"
      size="lg"
      onClick={() => mutate()}
      disabled={isPending}
      className={cn(
        "gap-2 font-semibold transition-all duration-300",
        isSuccess &&
          "border-emerald-500/30 bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30",
        isError &&
          "border-red-500/30 bg-red-500/20 text-red-400 hover:bg-red-500/30"
      )}
    >
      {isPending ? (
        <>
          <Loader2 className="size-4 animate-spin" />
          Sending...
        </>
      ) : isSuccess ? (
        <>
          <Check className="size-4" />
          Order Sent!
        </>
      ) : isError ? (
        <>
          <X className="size-4" />
          Failed
        </>
      ) : (
        <>
          <Play className="size-4" />
          Simulate Order
        </>
      )}
    </Button>
  );
}
