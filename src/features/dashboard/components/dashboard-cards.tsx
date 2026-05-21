import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { TONE_CLASSES } from '../constants';
import type { Kpi } from '../types';
import { formatDelta } from '../utils';

export function DashboardMetricCard({ kpi }: { kpi: Kpi }) {
  const Icon = kpi.icon;
  return (
    <Card className="overflow-hidden border-border/80 bg-gradient-to-br from-card to-muted/20 shadow-sm">
      <CardContent className="flex min-h-[112px] items-center gap-4 p-4">
        <div
          className={cn(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
            TONE_CLASSES[kpi.tone ?? "default"],
          )}
        >
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase text-muted-foreground">
            {kpi.label}
          </p>
          <p className="mt-1 text-3xl font-semibold leading-none text-foreground">
            {kpi.value}
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
            {kpi.delta !== undefined && kpi.delta !== 0 && (
              <span
                className={cn(
                  "font-medium",
                  kpi.delta > 0 ? "text-success" : "text-danger",
                )}
              >
                {formatDelta(kpi.delta)}
              </span>
            )}
            {kpi.detail && (
              <span className="text-muted-foreground">{kpi.detail}</span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
