"use client";

import { useState, useEffect } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Terminal, TrendingUp, TrendingDown, AlertTriangle, Lightbulb } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AiFeedEntry } from "@/types";

/**
 * Static feed data with relative time offsets (in ms).
 * Timestamps are computed ONLY on the client after mount to prevent
 * React hydration mismatch between server and client renders.
 */
const FEED_TEMPLATES: Omit<AiFeedEntry, "timestamp">[] = [
  {
    id: "1",
    message: "Increased Latte price by 5% — low competition detected",
    type: "price_adjustment",
  },
  {
    id: "2",
    message: "Triggered 10% discount on Croissant due to high competition",
    type: "discount",
  },
  {
    id: "3",
    message: "Weather shift detected: SUNNY → RAINY — adjusting demand model",
    type: "alert",
  },
  {
    id: "4",
    message: "GOLD customer detected — applying loyalty multiplier 1.2x",
    type: "insight",
  },
  {
    id: "5",
    message: "Competitor intensity HIGH — activating defensive pricing strategy",
    type: "alert",
  },
  {
    id: "6",
    message: "Dynamic price for Americano set to ₺38.50 (+8.5%)",
    type: "price_adjustment",
  },
  {
    id: "7",
    message: "EXAM_WEEK event — predicted demand surge for caffeinated beverages",
    type: "insight",
  },
];

const TIME_OFFSETS = [120000, 90000, 60000, 45000, 30000, 15000, 5000];

const typeConfig = {
  price_adjustment: {
    icon: TrendingUp,
    color: "text-emerald-400",
    label: "PRICE",
  },
  discount: {
    icon: TrendingDown,
    color: "text-amber-400",
    label: "DISCOUNT",
  },
  alert: {
    icon: AlertTriangle,
    color: "text-red-400",
    label: "ALERT",
  },
  insight: {
    icon: Lightbulb,
    color: "text-cyan-400",
    label: "INSIGHT",
  },
};

function formatTime(isoString: string) {
  const d = new Date(isoString);
  return d.toLocaleTimeString("tr-TR", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

export function AiLiveFeed() {
  const [feed, setFeed] = useState<AiFeedEntry[]>([]);
  const [mounted, setMounted] = useState(false);

  // Build timestamped feed entries only on the client to avoid hydration mismatch
  useEffect(() => {
    const now = Date.now();
    const entries: AiFeedEntry[] = FEED_TEMPLATES.map((template, index) => ({
      ...template,
      timestamp: new Date(now - TIME_OFFSETS[index]).toISOString(),
    }));
    setFeed(entries);
    setMounted(true);
  }, []);

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-xl border border-border/50 bg-zinc-950">
      {/* Header */}
      <div className="flex items-center gap-2 border-b border-zinc-800 px-4 py-3">
        <Terminal className="size-4 text-emerald-400" />
        <span className="text-xs font-bold uppercase tracking-widest text-emerald-400">
          AI Live Feed
        </span>
        <span className="ml-auto flex items-center gap-1.5">
          <span className="relative flex size-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
          </span>
          <span className="text-[10px] text-zinc-500">LIVE</span>
        </span>
      </div>

      {/* Feed Content */}
      <ScrollArea className="flex-1">
        <div className="space-y-0.5 p-2">
          {!mounted ? (
            <div className="flex items-center justify-center py-8">
              <span className="text-xs text-zinc-600">Loading feed...</span>
            </div>
          ) : (
            feed.map((entry) => {
              const config = typeConfig[entry.type];
              const Icon = config.icon;
              return (
                <div
                  key={entry.id}
                  className="group flex items-start gap-2 rounded-md px-2 py-2 transition-colors hover:bg-zinc-900"
                >
                  <Icon
                    className={cn("mt-0.5 size-3.5 shrink-0", config.color)}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          "text-[10px] font-bold tracking-wider",
                          config.color
                        )}
                      >
                        [{config.label}]
                      </span>
                      <span className="text-[10px] tabular-nums text-zinc-600">
                        {formatTime(entry.timestamp)}
                      </span>
                    </div>
                    <p className="text-xs leading-relaxed text-zinc-300">
                      {entry.message}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
