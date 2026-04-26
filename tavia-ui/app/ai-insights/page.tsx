"use client";

import { Brain } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { AiLiveFeed } from "@/components/dashboard/ai-live-feed";

export default function AiInsightsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          AI Insights
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          AI karar akışı ve analiz geçmişi
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* AI Feed - expanded view */}
        <div className="lg:col-span-1">
          <AiLiveFeed />
        </div>

        {/* Placeholder for future analytics */}
        <Card>
          <CardContent className="flex flex-col items-center gap-4 py-16">
            <Brain className="size-12 text-muted-foreground/30" />
            <div className="text-center">
              <p className="text-lg font-medium text-muted-foreground">
                AI Analytics yakında burada
              </p>
              <p className="mt-1 text-sm text-muted-foreground/70">
                Fiyatlandırma kararları, talep tahminleri ve performans
                metrikleri
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
