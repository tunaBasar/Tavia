"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Separator } from "@/components/ui/separator";
import { Activity, LogOut, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/lib/store/use-auth-store";

export function Header() {
  const router = useRouter();
  const [time, setTime] = useState<string>("");
  const [date, setDate] = useState<string>("");
  const tenantCity = useAuthStore((s) => s.tenantCity);
  const tenantName = useAuthStore((s) => s.tenantName);
  const logout = useAuthStore((s) => s.logout);

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

  function handleLogout() {
    logout();
    router.replace("/login");
  }

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

      {/* Right: Clock + Logout */}
      <div className="flex items-center gap-4">
        <div className="text-right">
          <p className="text-sm font-semibold tabular-nums text-foreground">
            {time}
          </p>
          <p className="text-[11px] text-muted-foreground">{date}</p>
        </div>
        <Separator orientation="vertical" className="!h-6" />
        <Button
          id="header-logout-btn"
          variant="ghost"
          size="sm"
          className="gap-2 text-muted-foreground transition-colors hover:text-destructive"
          onClick={handleLogout}
          title="Çıkış Yap"
        >
          <LogOut className="size-4" />
          <span className="hidden sm:inline">Çıkış</span>
        </Button>
      </div>
    </header>
  );
}
