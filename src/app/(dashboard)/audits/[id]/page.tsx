"use client";

import { use } from "react";
import { Loader2 } from "lucide-react";
import { useAuditResultDetail } from "@/features/audit";
import type { ScoreGrade } from "@/shared/types";
import { AuditResultHeader } from "./_components/audit-result-header";
import { AuditInsightPanel } from "./_components/audit-insight-panel";
import { AuditGeneralInfo } from "./_components/audit-general-info";
import { AuditScoreTable } from "./_components/audit-score-table";
import { ViolationsList } from "./_components/violations-list";
import { CorrectionRequestPanel } from "./_components/correction-request-panel";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function AuditResultDetailPage({ params }: PageProps) {
  const { id } = use(params);
  const { data: audit, isLoading, isError } = useAuditResultDetail(id);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (isError || !audit) {
    return (
      <div className="flex items-center justify-center h-64 text-sm text-muted-foreground">
        Không thể tải kết quả kiểm tra. Vui lòng thử lại.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <AuditResultHeader audit={audit} />

      {audit.scoreBreakdown && (
        <AuditInsightPanel audit={audit} />
      )}

      <AuditGeneralInfo audit={audit} />

      {audit.scoreBreakdown && (
        <AuditScoreTable
          breakdown={audit.scoreBreakdown}
          finalScore={audit.finalScore}
          grade={audit.grade as ScoreGrade}
        />
      )}

      <ViolationsList violations={audit.violations} />

      <CorrectionRequestPanel audit={audit} />
    </div>
  );
}
