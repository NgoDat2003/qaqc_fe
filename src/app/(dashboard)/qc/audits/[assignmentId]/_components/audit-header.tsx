"use client";

import Link from "next/link";
import { ArrowLeft, Calendar, FileText } from "lucide-react";
import { StatusBadge } from "@/shared/components";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { AuditSession } from "@/shared/types";
import type { ProgressInfo } from "../_lib/derive-progress";

interface AuditHeaderProps {
  session: AuditSession;
  progress: ProgressInfo;
  isReadOnly: boolean;
  readOnlyReason?: string;
  draftStatusSlot?: React.ReactNode;
}

export function AuditHeader({
  session,
  progress,
  isReadOnly,
  readOnlyReason,
  draftStatusSlot,
}: AuditHeaderProps) {
  const { assignment, checklist } = session;

  return (
    <header className="border-b bg-background px-4 py-3 space-y-3 shrink-0">
      {/* Row 1: back + store name + code + assignment status */}
      <div className="flex items-start gap-3">
        <Link
          href="/qc/my-assignments"
          className="mt-0.5 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-lg font-semibold leading-tight truncate">
              {assignment.store.name}
            </h1>
            <span className="text-xs font-mono px-1.5 py-0.5 rounded bg-muted text-muted-foreground shrink-0">
              {assignment.store.code}
            </span>
          </div>
        </div>
        <StatusBadge status={assignment.status} />
      </div>

      {/* Row 2: meta strip — plan name, dates, checklist, draft status */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground pl-8">
        <span className="inline-flex items-center gap-1">
          <Calendar className="w-3.5 h-3.5 shrink-0" />
          {assignment.plan.name}
        </span>
        <span>
          {formatDate(assignment.plan.startDate)} – {formatDate(assignment.plan.endDate)}
        </span>
        <span className="inline-flex items-center gap-1">
          <FileText className="w-3.5 h-3.5 shrink-0" />
          {checklist.name} v{checklist.version}
        </span>
        {draftStatusSlot}
      </div>

      {/* Read-only warning */}
      {isReadOnly && readOnlyReason && (
        <p className="text-sm font-medium text-warning pl-8">{readOnlyReason}</p>
      )}

      {/* Progress bar */}
      <div className="pl-8 space-y-1">
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Tiêu chí có lỗi</span>
          <span className="tabular-nums">
            {progress.touched}/{progress.total} ({progress.percentage}%)
          </span>
        </div>
        <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
          <div
            className={cn(
              "h-full transition-all duration-300",
              progress.percentage === 100 ? "bg-success" : "bg-primary"
            )}
            style={{ width: `${progress.percentage}%` }}
          />
        </div>
      </div>
    </header>
  );
}
