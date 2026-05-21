import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { TONE_CLASSES } from '../constants';
import type { Kpi } from '../types';
import { DeltaText } from './dashboard-shared';

export function QamKpiCard({ kpi }: { kpi: Kpi }) {
  const Icon = kpi.icon;
  return (
    <Card className="border-border/80 bg-card shadow-sm">
      <CardContent className="flex min-h-[112px] items-center gap-4 p-4">
        <div
          className={cn(
            "flex h-12 w-12 shrink-0 items-center justify-center rounded-lg shadow-sm",
            TONE_CLASSES[kpi.tone ?? "default"],
          )}
        >
          <Icon className="h-6 w-6" />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase text-muted-foreground">
            {kpi.label}
          </p>
          <p className="mt-1 text-3xl font-semibold leading-none text-foreground">
            {kpi.value}
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
            <DeltaText value={kpi.delta} />
            {kpi.detail && (
              <span className="text-muted-foreground">{kpi.detail}</span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
