"use client";

import { cn } from "@/lib/utils";
import type { ChecklistSectionItem, CriteriaRepeatState } from "@/shared/types";
import type { DraftViolation, ViolationAction } from "../_lib/violations-reducer";

interface CriteriaItemCardProps {
  item: ChecklistSectionItem;
  violation?: DraftViolation;
  repeatState?: CriteriaRepeatState;
  readOnly: boolean;
  onDispatch: (action: ViolationAction) => void;
  evidenceSlot?: React.ReactNode;
}

const FLAG_BORDER: Record<string, string> = {
  risk:     "border-l-4 border-l-warning",
  critical: "border-l-4 border-l-destructive",
  none:     "",
};

const FLAG_BADGE: Record<string, { label: string; className: string }> = {
  risk:     { label: "RISK", className: "bg-warning/10 text-warning" },
  critical: { label: "CCP",  className: "bg-destructive/10 text-destructive" },
};

export function CriteriaItemCard({
  item,
  violation,
  repeatState,
  readOnly,
  onDispatch,
  evidenceSlot,
}: CriteriaItemCardProps) {
  const criteria = item.criteria;
  if (!criteria) return null;

  const numErrors = violation?.numErrors ?? 0;
  const flagBadge = FLAG_BADGE[criteria.flag];

  return (
    <div className={cn("rounded-lg border bg-card p-4 space-y-3", FLAG_BORDER[criteria.flag] ?? "")}>
      {/* Criteria info */}
      <div className="flex items-start gap-2">
        <span className="text-xs font-mono text-muted-foreground mt-0.5 shrink-0">
          {criteria.code}
        </span>
        <p className="text-sm flex-1 leading-relaxed">{criteria.content}</p>
        {flagBadge && (
          <span className={cn("text-xs font-bold uppercase px-1.5 py-0.5 rounded shrink-0", flagBadge.className)}>
            {flagBadge.label}
          </span>
        )}
      </div>

      {/* Error counter + repeat badge */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          disabled={readOnly || numErrors === 0}
          onClick={() => onDispatch({ type: "SET_ERRORS", criteriaId: criteria.id, numErrors: numErrors - 1 })}
          className="w-8 h-8 rounded-full border flex items-center justify-center text-lg font-medium transition-colors hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed"
        >
          −
        </button>
        <span className="w-8 text-center font-bold text-xl tabular-nums">{numErrors}</span>
        <button
          type="button"
          disabled={readOnly}
          onClick={() => onDispatch({ type: "SET_ERRORS", criteriaId: criteria.id, numErrors: numErrors + 1 })}
          className="w-8 h-8 rounded-full border flex items-center justify-center text-lg font-medium transition-colors hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed"
        >
          +
        </button>

        {/* Repeat badge — chip với màu theo state */}
        {repeatState && numErrors > 0 && (
          <span
            className={cn(
              "text-xs font-semibold px-2 py-0.5 rounded-full",
              repeatState.isCriticalTriggered
                ? "bg-destructive/10 text-destructive"
                : repeatState.repeatCount >= 1
                  ? "bg-warning/10 text-warning"
                  : "bg-muted text-muted-foreground"
            )}
          >
            Lần {repeatState.repeatCount + 1}
            {repeatState.isCriticalTriggered && " · CCP"}
          </span>
        )}
      </div>

      {/* Note with label */}
      {numErrors > 0 && (
        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">Nguyên nhân lỗi</label>
          <textarea
            disabled={readOnly}
            placeholder="Mô tả nguyên nhân, hiện trường, người chứng kiến…"
            value={violation?.note ?? ""}
            onChange={(e) =>
              onDispatch({ type: "SET_NOTE", criteriaId: criteria.id, note: e.target.value || null })
            }
            rows={2}
            className="w-full text-sm border rounded-md px-3 py-2 resize-none bg-background disabled:opacity-50 focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>
      )}

      {numErrors > 0 && evidenceSlot}
    </div>
  );
}
