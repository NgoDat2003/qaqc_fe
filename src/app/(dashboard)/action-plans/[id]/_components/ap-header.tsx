"use client";

import { ArrowLeft, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { StatusBadge } from "@/shared/components";
import { formatDate, formatScore } from "@/lib/format";
import type { ActionPlanDetail } from "@/shared/types";

interface ApHeaderProps {
  ap: ActionPlanDetail;
}

export function ApHeader({ ap }: ApHeaderProps) {
  return (
    <div className="space-y-4">
      <Link
        href="/action-plans"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Quay lại danh sách
      </Link>

      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-2xl font-bold text-foreground">{ap.store.name}</h1>
            <span className="font-mono text-sm text-muted-foreground bg-muted px-2 py-0.5 rounded">
              {ap.store.code}
            </span>
          </div>
          <p className="text-sm text-muted-foreground">
            Ngày kiểm tra:{" "}
            <span className="font-medium text-foreground">
              {formatDate(ap.audit.submittedAt)}
            </span>
          </p>
          <p className="text-sm text-muted-foreground">
            Biểu mẫu:{" "}
            <span className="font-medium text-foreground">
              {ap.audit.checklist.name} — v{ap.audit.checklist.version}
            </span>
          </p>
          <p className="text-sm text-muted-foreground">
            Điểm audit:{" "}
            <span className="font-medium text-foreground">
              {formatScore(ap.audit.finalScore)}
            </span>
          </p>
        </div>
        <div className="flex-shrink-0">
          <StatusBadge status={ap.status} className="text-sm px-3 py-1" />
        </div>
      </div>

      {ap.reviewNote && (
        <div className="flex items-start gap-2 rounded-lg border border-warning/30 bg-warning-bg px-4 py-3 text-sm text-warning">
          <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>
            <span className="font-semibold">Lý do từ chối: </span>
            {ap.reviewNote}
          </span>
        </div>
      )}
    </div>
  );
}
