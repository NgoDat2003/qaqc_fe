"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDateTime } from "@/lib/format";
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

// content format: "Title\n- Bullet1\n- Bullet2" hoặc "\n- Bullet1\n- Bullet2"
// skipFirst=true khi name đã render riêng (bỏ dòng đầu không phải bullet)
function CriteriaContentBullets({ content, skipFirst }: { content: string; skipFirst?: boolean }) {
  const lines = content.split("\n").map((l) => l.trim()).filter(Boolean);
  const display = skipFirst ? lines.slice(1) : lines;
  const bullets = display.map((l) => l.replace(/^-\s*/, ""));
  if (bullets.length === 0) return null;
  if (bullets.length === 1) return <p className="text-sm text-muted-foreground leading-relaxed">{bullets[0]}</p>;
  return (
    <ul className="text-sm text-muted-foreground space-y-0.5">
      {bullets.map((p, i) => (
        <li key={i} className="flex gap-1.5">
          <span className="shrink-0 mt-1.5 w-1 h-1 rounded-full bg-muted-foreground/40 block" />
          <span>{p}</span>
        </li>
      ))}
    </ul>
  );
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
  const [showHistory, setShowHistory] = useState(false);

  const criteria = item.criteria;
  if (!criteria) return null;

  const numErrors = violation?.numErrors ?? 0;
  const flagBadge = FLAG_BADGE[criteria.flag];
  const hasHistory = (repeatState?.history?.length ?? 0) > 0;

  return (
    <div className={cn(
      "rounded-lg border bg-card p-4 space-y-3",
      FLAG_BORDER[criteria.flag] ?? "",
      numErrors > 0 && criteria.flag === "none" && "border-destructive"
    )}
      data-testid={`criteria-card-${criteria.id}`}
    >
      {/* Criteria info */}
      <div className="flex items-start gap-2">
        <span className="text-xs font-mono text-muted-foreground mt-0.5 shrink-0">
          {criteria.code}
        </span>
        <div className="flex-1 min-w-0 space-y-0.5">
          {criteria.name && (
            <p className="text-sm font-semibold leading-snug">{criteria.name}</p>
          )}
          <CriteriaContentBullets content={criteria.content} skipFirst={!!criteria.name} />
        </div>
        {flagBadge && (
          <span className={cn("text-xs font-bold uppercase px-1.5 py-0.5 rounded shrink-0", flagBadge.className)}>
            {flagBadge.label}
          </span>
        )}
      </div>

      {/* Scoring info: dbase + dmax — ẩn với CCP/RISK vì chúng không trừ điểm riêng */}
      <div className="flex items-center gap-3 text-xs text-muted-foreground">
        {criteria.flag === "none" ? (
          <>
            <span>
              Trừ{" "}
              <strong className="text-foreground tabular-nums">{criteria.deductionPerError}đ</strong>
              /lỗi
            </span>
            <span className="text-muted-foreground/30">·</span>
            <span>
              Tối đa{" "}
              <strong className="text-foreground tabular-nums">{criteria.maxDeduction}đ</strong>
            </span>
          </>
        ) : criteria.flag === "critical" ? (
          <span className="text-destructive font-medium">Vi phạm → toàn nhóm về 0 điểm</span>
        ) : (
          <span className="text-warning font-medium">Vi phạm → toàn bài về 0 điểm</span>
        )}

        {/* History toggle — shown when there are past violations */}
        {hasHistory && (
          <button
            type="button"
            onClick={() => setShowHistory((v) => !v)}
            className="ml-auto inline-flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            {showHistory ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            Lịch sử ({repeatState!.history.length} lần)
          </button>
        )}
      </div>

      {/* History panel — expandable */}
      {showHistory && hasHistory && (
        <div className="border rounded-md bg-muted/30 divide-y text-xs overflow-hidden">
          {[...repeatState!.history].reverse().map((entry) => (
            <div key={entry.auditId} className="px-3 py-2 space-y-0.5">
              <div className="flex items-center justify-between gap-2">
                <span className="text-muted-foreground">{formatDateTime(entry.submittedAt)}</span>
                <span className="text-muted-foreground shrink-0">Lần {entry.repeatCount}</span>
                <span className={cn(
                  "font-semibold tabular-nums shrink-0",
                  entry.numErrors > 0 ? "text-destructive" : "text-success"
                )}>
                  {entry.numErrors > 0 ? `${entry.numErrors} lỗi` : "Không lỗi"}
                </span>
              </div>
              {entry.note && (
                <p className="text-muted-foreground italic truncate">{entry.note}</p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Error counter + repeat badge */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          disabled={readOnly || numErrors === 0}
          onClick={() => onDispatch({ type: "SET_ERRORS", criteriaId: criteria.id, numErrors: numErrors - 1 })}
          aria-label={`Decrease errors for ${criteria.code}`}
          data-testid={`criteria-decrement-${criteria.id}`}
          className="w-8 h-8 rounded-full border flex items-center justify-center text-lg font-medium transition-colors hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed"
        >
          −
        </button>
        <span className="w-8 text-center font-bold text-xl tabular-nums">{numErrors}</span>
        <button
          type="button"
          disabled={readOnly}
          onClick={() => onDispatch({ type: "SET_ERRORS", criteriaId: criteria.id, numErrors: numErrors + 1 })}
          aria-label={`Increase errors for ${criteria.code}`}
          data-testid={`criteria-increment-${criteria.id}`}
          className="w-8 h-8 rounded-full border flex items-center justify-center text-lg font-medium transition-colors hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed"
        >
          +
        </button>

        {/* Repeat badge */}
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
            data-testid={`criteria-note-${criteria.id}`}
            onChange={(e) =>
              onDispatch({ type: "SET_NOTE", criteriaId: criteria.id, note: e.target.value || null })
            }
            rows={2}
            className={cn(
              "w-full text-sm border rounded-md px-3 py-2 resize-none bg-background disabled:opacity-50 focus:outline-none focus:ring-1",
              violation?.note
                ? "border-destructive focus:ring-destructive"
                : "focus:ring-ring"
            )}
          />
        </div>
      )}

      {numErrors > 0 && evidenceSlot}
    </div>
  );
}
