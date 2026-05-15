"use client";

import type { ChecklistSection } from "@/shared/types";

interface Props {
  sections: ChecklistSection[];
}

const GROUP_COLORS = [
  "#6366f1", "#22c55e", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4",
];

export function WeightSummaryBar({ sections }: Props) {
  const total = sections.reduce((sum, s) => sum + (s.weight ?? 0), 0);
  const isValid = total === 100;

  if (sections.length === 0) return null;

  return (
    <div className="space-y-2">
      {/* Visual bar */}
      <div className="flex h-3 rounded-full overflow-hidden bg-muted">
        {sections.map((s, i) => (
          <div
            key={s.id}
            style={{ flex: s.weight ?? 0, backgroundColor: s.group?.color ?? GROUP_COLORS[i % GROUP_COLORS.length] }}
            title={`${s.name}: ${s.weight}%`}
          />
        ))}
        {total < 100 && <div style={{ flex: 100 - total }} className="bg-muted-foreground/20" />}
      </div>

      {/* Labels */}
      <div className="flex flex-wrap gap-3 text-xs">
        {sections.map((s) => (
          <span key={s.id} className="flex items-center gap-1 text-muted-foreground">
            <span className="inline-block w-2 h-2 rounded-full"
              style={{ backgroundColor: s.group?.color ?? "#94a3b8" }} />
            {s.group?.code}: {s.weight}%
          </span>
        ))}
        <span className={`ml-auto font-semibold ${isValid ? "text-green-600" : "text-red-600"}`}>
          Tổng: {total}% {!isValid && "⚠️ Cần = 100%"}
        </span>
      </div>
    </div>
  );
}
