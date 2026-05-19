"use client";

import { useRouter } from "next/navigation";
import { ClipboardCheck, CheckCircle2, XCircle, AlertTriangle } from "lucide-react";
import { useAuditResults } from "@/features/audit";
import { DataTable, PageHeader, ScoreBadge, StatusBadge, MetricCard } from "@/shared/components";
import { formatDate } from "@/lib/format";
import type { ColumnDef } from "@/shared/components/data-table";
import type { AuditResultListItem } from "@/shared/types";

const columns: ColumnDef<AuditResultListItem>[] = [
  {
    header: "Cửa hàng",
    cell: (row) => (
      <div>
        <div className="font-medium">{row.store.name}</div>
        <div className="text-xs font-mono text-muted-foreground">{row.store.code}</div>
      </div>
    ),
  },
  {
    header: "Người KT",
    hideOnMobile: true,
    cell: (row) => (
      <span className="text-sm text-muted-foreground">
        {row.auditor.fullName ?? row.auditor.email ?? "—"}
      </span>
    ),
  },
  {
    header: "Biểu mẫu",
    hideOnMobile: true,
    cell: (row) => (
      <div>
        <div className="text-sm font-medium">{row.checklist.name}</div>
        <div className="text-xs text-muted-foreground">v{row.checklist.version}</div>
      </div>
    ),
  },
  {
    header: "Điểm",
    cell: (row) => <ScoreBadge score={row.finalScore} />,
  },
  {
    header: "Ngày nộp",
    hideOnMobile: true,
    cell: (row) => (
      <span className="text-sm text-muted-foreground">{formatDate(row.submittedAt)}</span>
    ),
  },
  {
    header: "AP",
    cell: (row) =>
      row.actionPlan ? (
        <StatusBadge status={row.actionPlan.status} />
      ) : (
        <span className="text-xs text-muted-foreground">—</span>
      ),
  },
  {
    header: "Yêu cầu sửa",
    cell: (row) =>
      row.pendingCorrectionRequest ? (
        <span className="inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium bg-warning-bg text-warning border-warning/20">
          Đang chờ QA
        </span>
      ) : null,
  },
];

export default function QcResultsPage() {
  const router = useRouter();
  const { data: results = [], isLoading } = useAuditResults();

  const total = results.length;
  const passed = results.filter((r) =>
    ["excellent", "good", "pass"].includes(r.grade)
  ).length;
  const failed = results.filter((r) => r.grade === "fail").length;
  const alarm = results.filter(
    (r) => r.grade === "alarm" || r.isRiskTriggered
  ).length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Kết quả kiểm tra"
        subtitle="Danh sách bài kiểm tra đã hoàn thành"
      />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <MetricCard
          label="Tổng bài kiểm tra"
          value={isLoading ? "—" : total}
          icon={ClipboardCheck}
          variant="default"
        />
        <MetricCard
          label="Đạt"
          value={isLoading ? "—" : passed}
          icon={CheckCircle2}
          variant="success"
        />
        <MetricCard
          label="Không đạt"
          value={isLoading ? "—" : failed}
          icon={XCircle}
          variant="danger"
        />
        <MetricCard
          label="Báo động"
          value={isLoading ? "—" : alarm}
          icon={AlertTriangle}
          variant="warning"
        />
      </div>

      <DataTable
        columns={columns}
        data={results}
        isLoading={isLoading}
        onRowClick={(row) => router.push(`/audits/${row.id}`)}
        emptyTitle="Chưa có kết quả"
        emptyDescription="Kết quả các bài kiểm tra đã nộp sẽ hiển thị ở đây."
      />
    </div>
  );
}
