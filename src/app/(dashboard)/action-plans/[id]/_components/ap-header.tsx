"use client";

import { ArrowLeft, AlertTriangle, CalendarDays, ClipboardList, Store } from "lucide-react";
import Link from "next/link";
import { StatusBadge } from "@/shared/components";
import { formatDate, formatScore } from "@/lib/format";
import type { ActionPlanDetail } from "@/shared/types";

interface ApHeaderProps {
  ap: ActionPlanDetail;
}

export function ApHeader({ ap }: ApHeaderProps) {
  return (
    <section className="rounded-lg border border-border bg-card p-5 shadow-sm">
      <Link
        href="/action-plans"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Action Plan
      </Link>

      <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 space-y-2">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-2xl font-semibold tracking-tight text-foreground lg:text-3xl">{ap.store.name}</h1>
            <span className="font-mono text-xs text-muted-foreground bg-muted px-2 py-1 rounded-md">
              {ap.store.code}
            </span>
            <StatusBadge status={ap.status} />
          </div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <CalendarDays className="h-4 w-4 text-primary" />
              {formatDate(ap.audit.submittedAt)}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <ClipboardList className="h-4 w-4 text-primary" />
              {ap.audit.checklist.name} v{ap.audit.checklist.version}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Store className="h-4 w-4 text-primary" />
              {ap.items.length} vi phạm cần khắc phục
            </span>
          </div>
        </div>

        <div className="rounded-lg border border-border bg-muted/35 px-4 py-3">
          <p className="text-xs text-muted-foreground">Điểm audit</p>
          <p className="mt-1 text-3xl font-semibold text-foreground">{formatScore(ap.audit.finalScore)}</p>
        </div>
      </div>

      {ap.reviewNote && (
        <div className="mt-4 flex items-start gap-2 rounded-lg border border-warning/30 bg-warning-bg px-4 py-3 text-sm text-warning">
          <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>
            <span className="font-semibold">Lý do từ chối: </span>
            {ap.reviewNote}
          </span>
        </div>
      )}
    </section>
  );
}
