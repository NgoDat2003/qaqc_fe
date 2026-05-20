"use client";

import { cn } from "@/lib/utils";
import type { AuditResultDetailViolation } from "@/shared/types";

interface ViolationsListProps {
  violations: AuditResultDetailViolation[];
}

const FLAG_LABELS: Record<string, string> = {
  none: "Thường",
  critical: "CCP",
  risk: "RISK",
};

const FLAG_CLASSES: Record<string, string> = {
  none: "bg-muted text-muted-foreground border-border",
  critical: "bg-warning-bg text-warning border-warning/20",
  risk: "bg-danger-bg text-danger border-danger/20",
};

// content format: "Title\n- Bullet1\n- Bullet2"; skipFirst=true khi name đã render riêng
function CriteriaContent({ content, skipFirst }: { content: string; skipFirst?: boolean }) {
  const lines = content.split("\n").map((l) => l.trim()).filter(Boolean);
  const display = skipFirst ? lines.slice(1) : lines;
  const bullets = display.map((l) => l.replace(/^-\s*/, ""));
  if (bullets.length === 0) return null;
  if (bullets.length === 1) return <span className="text-sm text-foreground">{bullets[0]}</span>;
  return (
    <ul className="text-sm text-foreground space-y-0.5 mt-0.5">
      {bullets.map((p, i) => (
        <li key={i} className="flex gap-1.5">
          <span className="shrink-0 mt-1.5 w-1 h-1 rounded-full bg-foreground/40 block" />
          <span>{p}</span>
        </li>
      ))}
    </ul>
  );
}

export function ViolationsList({ violations }: ViolationsListProps) {
  const totalImages = violations.reduce((sum, v) => sum + v.images.length, 0);

  return (
    <div className="rounded-xl border bg-card p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-foreground">Chi tiết các lỗi</h2>
        <span className="text-xs text-muted-foreground">
          {violations.length} lỗi · {totalImages} ảnh
        </span>
      </div>
      <p className="text-xs text-muted-foreground">
        Chi tiết từng tiêu chí vi phạm kèm ghi chú và ảnh minh chứng.
      </p>

      {violations.length === 0 ? (
        <p className="text-sm text-muted-foreground py-2">Không có lỗi vi phạm nào.</p>
      ) : (
        <div className="divide-y divide-border/40">
          {violations.map((v) => (
            <div key={v.id} className="py-3 space-y-1.5">
              <div className="flex items-start gap-2 flex-wrap">
                <span className="font-mono text-xs font-semibold text-muted-foreground shrink-0">
                  {v.criteria.code}
                </span>
                <span
                  className={cn(
                    "inline-flex items-center rounded-md border px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide shrink-0",
                    FLAG_CLASSES[v.criteria.flag] ?? FLAG_CLASSES.none
                  )}
                >
                  {FLAG_LABELS[v.criteria.flag] ?? v.criteria.flag}
                </span>
                <div className="flex flex-col gap-0.5 min-w-0">
                  <span className="text-sm font-semibold text-foreground">{v.criteria.name}</span>
                  <CriteriaContent content={v.criteria.content} skipFirst={!!v.criteria.name} />
                </div>
              </div>

              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span>
                  Số lỗi:{" "}
                  <span className="font-medium text-foreground">{v.numErrors}</span>
                </span>
                {v.repeatCount > 0 && (
                  <span>
                    Lặp lần:{" "}
                    <span className="font-medium text-foreground">{v.repeatCount}</span>
                  </span>
                )}
                {v.isCriticalTriggered && (
                  <span className="text-warning font-medium">CCP kích hoạt</span>
                )}
                {v.isRiskTriggered && (
                  <span className="text-danger font-medium">RISK kích hoạt</span>
                )}
              </div>

              {v.note && (
                <p className="text-xs text-muted-foreground italic">{v.note}</p>
              )}

              {v.images.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {v.images.map((img) => (
                    <a
                      key={img.id}
                      href={img.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-14 h-14 rounded-md overflow-hidden border block"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={img.url}
                        alt="Bằng chứng"
                        className="w-full h-full object-cover"
                      />
                    </a>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
