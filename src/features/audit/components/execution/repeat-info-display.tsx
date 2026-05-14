"use client";
import { AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { RepeatInfo } from "@/shared/types";

const LABEL_META: Record<string, { label: string; cls: string }> = {
  first:    { label: "Lần 1",          cls: "text-muted-foreground" },
  second:   { label: "Lặp lần 2",      cls: "text-amber-600"        },
  third:    { label: "Lặp lần 3",      cls: "text-orange-600"       },
  auto_ccp: { label: "CCP tự động",    cls: "text-red-600"          },
  reset:    { label: "Reset về lần 1", cls: "text-green-600"        },
};

export function RepeatInfoDisplay({ repeatInfo }: { repeatInfo: RepeatInfo[] }) {
  if (repeatInfo.length === 0) return null;

  const hasCCP = repeatInfo.some(
    (r) => r.isCriticalTriggered || r.repeatLabel === "auto_ccp"
  );

  return (
    <div className="space-y-3">
      {hasCCP && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
          <AlertTriangle className="h-4 w-4 flex-shrink-0" />
          <span className="font-medium">CCP kích hoạt — điểm nhóm bị đưa về 0</span>
        </div>
      )}
      <div className="space-y-2">
        {repeatInfo.map((r) => {
          const meta = LABEL_META[r.repeatLabel] ?? LABEL_META.first;
          return (
            <div
              key={r.criteriaId}
              className="flex items-center justify-between rounded-lg border border-border bg-card/50 px-3 py-2"
            >
              <span className="text-xs text-muted-foreground font-mono">
                {r.criteriaId.slice(0, 8)}…
              </span>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">{r.numErrors} lỗi</span>
                <Badge variant="outline" className={`text-[10px] ${meta.cls} border-current`}>
                  {meta.label}
                </Badge>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
