"use client";

import { formatDateTime } from "@/lib/format";
import type { AuditResultDetail } from "@/shared/types";

interface AuditGeneralInfoProps {
  audit: AuditResultDetail;
}

interface InfoFieldProps {
  label: string;
  value: string;
}

function InfoField({ label, value }: InfoFieldProps) {
  return (
    <div className="space-y-0.5">
      <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">{label}</p>
      <p className="text-sm text-foreground font-medium">{value}</p>
    </div>
  );
}

export function AuditGeneralInfo({ audit }: AuditGeneralInfoProps) {
  return (
    <div className="rounded-xl border bg-card p-4">
      <h2 className="text-sm font-semibold text-foreground mb-3">Thông tin chung</h2>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <InfoField
          label="Cửa hàng"
          value={`${audit.store.name} (${audit.store.code})`}
        />
        <InfoField
          label="Người audit"
          value={audit.auditor.fullName ?? audit.auditor.email ?? "—"}
        />
        <InfoField
          label="Checklist"
          value={`${audit.checklist.name} v${audit.checklist.version}`}
        />
        <InfoField
          label="Ngày mở"
          value={formatDateTime(audit.submittedAt)}
        />
      </div>
    </div>
  );
}
