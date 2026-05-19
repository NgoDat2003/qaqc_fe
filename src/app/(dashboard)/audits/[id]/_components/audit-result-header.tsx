"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { StatusBadge } from "@/shared/components";
import type { AuditResultDetail } from "@/shared/types";

interface AuditResultHeaderProps {
  audit: AuditResultDetail;
}

export function AuditResultHeader({ audit }: AuditResultHeaderProps) {
  return (
    <div className="space-y-1">
      <Link
        href="/audits"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-2"
      >
        <ArrowLeft className="w-4 h-4" />
        Quay lại danh sách
      </Link>

      {/* Title row: store code · Kết quả audit + AP status badge */}
      <div className="flex items-center gap-2 flex-wrap">
        <h1 className="text-xl font-bold text-foreground">
          {audit.store.code}
          <span className="font-normal text-muted-foreground"> · Kết quả audit</span>
        </h1>
        {audit.actionPlan && (
          <StatusBadge status={audit.actionPlan.status} />
        )}
      </div>

      {/* Subtitle: checklist name */}
      <p className="text-sm text-muted-foreground">
        Checklist:{" "}
        <span className="font-medium text-foreground">{audit.checklist.name}</span>
      </p>
    </div>
  );
}
