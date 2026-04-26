"use client";

import {
  CloudRain,
  Sun,
  Cloud,
  CloudSnow,
  Zap,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useCurrentContext } from "@/lib/hooks/use-context";

function getWeatherIcon(weather: string) {
  const w = weather?.toUpperCase() ?? "";
  if (w.includes("RAIN")) return CloudRain;
  if (w.includes("SNOW")) return CloudSnow;
  if (w.includes("CLOUD")) return Cloud;
  if (w.includes("STORM")) return Zap;
  return Sun;
}

function getCompetitorColor(intensity: string) {
  const i = intensity?.toUpperCase() ?? "";
  if (i === "HIGH") return "text-red-500 bg-red-500/10 border-red-500/20";
  if (i === "MEDIUM")
    return "text-amber-500 bg-amber-500/10 border-amber-500/20";
  return "text-emerald-500 bg-emerald-500/10 border-emerald-500/20";
}

export function ContextCard() {
  const { data, isLoading, isError, error } = useCurrentContext();

  const context = data?.data;

  return (
    <Card className="relative overflow-hidden">
      {/* Gradient accent */}
      <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500" />

      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          Current Context
        </CardTitle>
        <div className="flex size-8 items-center justify-center rounded-lg bg-violet-500/10">
          <Zap className="size-4 text-violet-500" />
        </div>
      </CardHeader>

      <CardContent>
        {isLoading ? (
          <div className="flex items-center gap-2">
            <Loader2 className="size-4 animate-spin text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Loading...</span>
          </div>
        ) : isError || !context ? (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <AlertCircle className="size-4 text-amber-500" />
              <span className="text-sm text-amber-500">
                Context unavailable
              </span>
            </div>
            {error && (
              <p className="text-xs text-muted-foreground">
                {error instanceof Error ? error.message : "Unknown error"}
              </p>
            )}
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {/* Weather */}
            {(() => {
              const WeatherIcon = getWeatherIcon(context.weather);
              return (
                <Badge
                  variant="outline"
                  className="gap-1.5 border-sky-500/20 bg-sky-500/10 text-sky-500"
                >
                  <WeatherIcon className="size-3" />
                  {context.weather}
                </Badge>
              );
            })()}

            {/* Event */}
            <Badge
              variant="outline"
              className="gap-1.5 border-amber-500/20 bg-amber-500/10 text-amber-500"
            >
              {context.activeEvent}
            </Badge>

            {/* Competitor */}
            <Badge
              variant="outline"
              className={`gap-1.5 border ${getCompetitorColor(
                context.competitorIntensity
              )}`}
            >
              {context.competitorIntensity}
            </Badge>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
