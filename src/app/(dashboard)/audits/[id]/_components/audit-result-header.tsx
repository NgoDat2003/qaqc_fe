"use client";

import { ArrowLeft, ClipboardList, Store } from "lucide-react";
import Link from "next/link";
import { StatusBadge } from "@/shared/components";
import { formatScore } from "@/lib/format";
import type { AuditResultDetail } from "@/shared/types";

interface AuditResultHeaderProps {
  audit: AuditResultDetail;
}

export function AuditResultHeader({ audit }: AuditResultHeaderProps) {
  return (
    <section className="rounded-lg border border-border bg-card p-5 shadow-sm">
      <Link
        href="/audits"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Kết quả kiểm tra
      </Link>

      <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight text-foreground lg:text-3xl">
              {audit.store.name}
            </h1>
            <span className="rounded-md bg-muted px-2 py-1 font-mono text-xs text-muted-foreground">
              {audit.store.code}
            </span>
            {audit.actionPlan && <StatusBadge status={audit.actionPlan.status} />}
          </div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <ClipboardList className="h-4 w-4 text-primary" />
              {audit.checklist.name} v{audit.checklist.version}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Store className="h-4 w-4 text-primary" />
              Người audit: <span className="font-medium text-foreground">{audit.auditor.fullName ?? audit.auditor.email}</span>
            </span>
          </div>
        </div>

        <div className="rounded-lg border border-border bg-muted/35 px-4 py-3">
          <p className="text-xs text-muted-foreground">Điểm audit</p>
          <p className="mt-1 text-3xl font-semibold text-foreground">{formatScore(audit.finalScore)}</p>
        </div>
      </div>
    </section>
  );
}
