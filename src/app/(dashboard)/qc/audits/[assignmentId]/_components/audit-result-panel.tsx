import { formatScore, formatGrade } from "@/lib/format";
import { ScoreBadge } from "@/shared/components";
import type { SubmitAuditResponse } from "@/shared/types";

interface AuditResultPanelProps {
  result: SubmitAuditResponse;
}

export function AuditResultPanel({ result }: AuditResultPanelProps) {
  const ccpItems = result.repeatInfo.filter((r) => r.isCriticalTriggered);

  return (
    <div className="space-y-4">
      <div className="text-center py-4 space-y-2">
        <div className="text-5xl font-bold tabular-nums">{formatScore(result.finalScore)}</div>
        <ScoreBadge score={result.finalScore} />
        {result.isRiskTriggered && (
          <p className="text-sm font-semibold text-warning mt-1">
            ⚠ RISK — Toàn bài về 0
          </p>
        )}
        <p className="text-sm text-muted-foreground">{formatGrade(result.grade)}</p>
      </div>

      {ccpItems.length > 0 && (
        <div className="space-y-1.5 border-t pt-3">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Tiêu chí kích hoạt CCP
          </p>
          {ccpItems.map((r) => (
            <div key={r.criteriaId} className="text-sm text-destructive">
              Lần {r.repeatCount} · {r.numErrors} lỗi
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
