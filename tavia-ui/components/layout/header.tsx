"use client";

import { useEffect, useState } from "react";
import { Separator } from "@/components/ui/separator";
import { Activity, MapPin } from "lucide-react";
import { useAuthStore } from "@/lib/store/use-auth-store";

export function Header() {
  const [time, setTime] = useState<string>("");
  const [date, setDate] = useState<string>("");
  const tenantCity = useAuthStore((s) => s.tenantCity);
  const tenantName = useAuthStore((s) => s.tenantName);

  useEffect(() => {
    function updateClock() {
      const now = new Date();
      setTime(
        now.toLocaleTimeString("tr-TR", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })
      );
      setDate(
        now.toLocaleDateString("tr-TR", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      );
    }

    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border/50 bg-background/80 px-8 backdrop-blur-xl">
      {/* Left: Title + Tenant City Badge */}
      <div className="flex items-center gap-3">
        <Activity className="size-4 text-primary" />
        <h2 className="text-sm font-semibold text-foreground">
          Operational Dashboard
        </h2>
        <Separator orientation="vertical" className="!h-4" />
        <span className="text-xs text-muted-foreground">
          Real-time Intelligence
        </span>
        {tenantCity && (
          <>
            <Separator orientation="vertical" className="!h-4" />
            <span className="inline-flex items-center gap-1 rounded-md bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
              <MapPin className="size-3" />
              Active Tenant City: {tenantCity}
            </span>
          </>
        )}
      </div>

      {/* Right: Clock */}
      <div className="flex items-center gap-4">
        <div className="text-right">
          <p className="text-sm font-semibold tabular-nums text-foreground">
            {time}
          </p>
          <p className="text-[11px] text-muted-foreground">{date}</p>
        </div>
        <div className="flex size-8 items-center justify-center rounded-full border border-border/50 bg-accent/50">
          <span className="text-xs font-bold text-foreground">T</span>
        </div>
      </div>
    </header>
  );
}
