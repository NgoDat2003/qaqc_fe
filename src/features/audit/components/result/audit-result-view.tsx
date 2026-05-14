"use client";
import { CheckCircle2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RepeatInfoDisplay } from "@/features/audit/components/execution/repeat-info-display";
import type { SubmitAuditResponse, ScoreGrade } from "@/shared/types";

const GRADE_META: Record<ScoreGrade, { label: string; cls: string }> = {
  excellent: { label: "Xuất sắc",    cls: "text-green-600" },
  good:      { label: "Tốt",         cls: "text-green-500" },
  pass:      { label: "Đạt",         cls: "text-amber-600" },
  fail:      { label: "Không đạt",   cls: "text-red-600"   },
  alarm:     { label: "Cảnh báo",    cls: "text-red-700"   },
};

interface AuditResultViewProps {
  result: SubmitAuditResponse;
  onBack: () => void;
}

export function AuditResultView({ result, onBack }: AuditResultViewProps) {
  const grade = GRADE_META[result.grade] ?? GRADE_META.fail;
  const isPassing = result.grade === "excellent" || result.grade === "good" || result.grade === "pass";

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-border bg-card p-6 text-center space-y-2">
        {isPassing ? (
          <CheckCircle2 className="h-10 w-10 text-green-500 mx-auto" />
        ) : (
          <AlertTriangle className="h-10 w-10 text-red-500 mx-auto" />
        )}
        <p className="text-4xl font-bold tabular-nums">
          {result.finalScore.toFixed(1)}
        </p>
        <p className={`text-lg font-semibold ${grade.cls}`}>{grade.label}</p>
      </div>

      {result.isRiskTriggered && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
          <AlertTriangle className="h-4 w-4 flex-shrink-0" />
          <span className="font-medium">RISK kích hoạt — toàn bài về 0</span>
        </div>
      )}

      {result.repeatInfo.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">Thông tin lặp lỗi</p>
          <RepeatInfoDisplay repeatInfo={result.repeatInfo} />
        </div>
      )}

      <Button className="w-full" onClick={onBack}>
        Quay lại danh sách
      </Button>
    </div>
  );
}
