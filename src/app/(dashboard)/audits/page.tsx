"use client";

import { useRouter } from "next/navigation";
import { AlertTriangle, CheckCircle2, ClipboardCheck, XCircle } from "lucide-react";
import { useAuditResults } from "@/features/audit";
import { MetricCard, PageHeader, ScoreBadge, SortableTable, StatusBadge } from "@/shared/components";
import { formatDate } from "@/lib/format";
import type { AppStatus, SortableColumnDef } from "@/shared/components";
import type { AuditResultListItem } from "@/shared/types";

const AP_FILTERS = [
  { value: "none", label: "Chưa tạo AP" },
  { value: "draft", label: "Nháp" },
  { value: "submitted", label: "Đã nộp" },
  { value: "rejected", label: "Bị từ chối" },
  { value: "closed", label: "Đã đóng" },
];

const CORRECTION_FILTERS = [
  { value: "pending", label: "Đang chờ QA" },
  { value: "none", label: "Không có yêu cầu" },
];

const columns: SortableColumnDef<AuditResultListItem>[] = [
  {
    header: "Cửa hàng",
    getSearchValue: (row) => `${row.store.name} ${row.store.code}`,
    cell: (row) => (
      <div>
        <div className="font-medium">{row.store.name}</div>
        <div className="font-mono text-xs text-muted-foreground">{row.store.code}</div>
      </div>
    ),
  },
  {
    header: "Người KT",
    hideOnMobile: true,
    getSearchValue: (row) => `${row.auditor.fullName ?? ""} ${row.auditor.email ?? ""}`,
    cell: (row) => (
      <span className="text-sm text-muted-foreground">
        {row.auditor.fullName ?? row.auditor.email ?? "—"}
      </span>
    ),
  },
  {
    header: "Biểu mẫu",
    hideOnMobile: true,
    getSearchValue: (row) => `${row.checklist.name} ${row.checklist.version}`,
    cell: (row) => (
      <div>
        <div className="text-sm font-medium">{row.checklist.name}</div>
        <div className="text-xs text-muted-foreground">v{row.checklist.version}</div>
      </div>
    ),
  },
  {
    header: "Điểm",
    getSortValue: (row) => row.finalScore,
    cell: (row) => <ScoreBadge score={row.finalScore} />,
  },
  {
    header: "Ngày nộp",
    hideOnMobile: true,
    getSortValue: (row) => new Date(row.submittedAt),
    cell: (row) => (
      <span className="text-sm text-muted-foreground">{formatDate(row.submittedAt)}</span>
    ),
  },
  {
    header: "AP",
    getFilterValue: (row) => row.actionPlan?.status ?? "none",
    filterOptions: AP_FILTERS,
    cell: (row) =>
      row.actionPlan ? (
        <StatusBadge status={row.actionPlan.status} />
      ) : (
        <span className="text-xs text-muted-foreground">—</span>
      ),
  },
  {
    header: "Yêu cầu sửa",
    getFilterValue: (row) => row.pendingCorrectionRequest ? "pending" : "none",
    filterOptions: CORRECTION_FILTERS,
    cell: (row) =>
      row.pendingCorrectionRequest ? (
        <StatusBadge status={"pending" as AppStatus} />
      ) : (
        <span className="text-xs text-muted-foreground">—</span>
      ),
  },
];

export default function QcResultsPage() {
  const router = useRouter();
  const { data: results = [], isLoading } = useAuditResults();

  const total = results.length;
  const passed = results.filter((result) =>
    ["excellent", "good", "pass"].includes(result.grade)
  ).length;
  const failed = results.filter((result) => result.grade === "fail").length;
  const alarm = results.filter(
    (result) => result.grade === "alarm" || result.isRiskTriggered
  ).length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Kết quả kiểm tra"
        subtitle="Danh sách bài kiểm tra đã hoàn thành"
      />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
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

      <SortableTable
        columns={columns}
        data={results}
        isLoading={isLoading}
        onRowClick={(row) => router.push(`/audits/${row.id}`)}
        mobileCard={{
          title: (row) => row.store.name,
          subtitle: (row) => `${row.store.code} · ${row.checklist.name} v${row.checklist.version}`,
          badges: (row) => [
            <ScoreBadge key="score" score={row.finalScore} />,
            row.actionPlan ? <StatusBadge key="ap" status={row.actionPlan.status} /> : null,
            row.pendingCorrectionRequest ? <StatusBadge key="correction" status={"pending" as AppStatus} /> : null,
          ],
          details: [
            { label: "Người KT", value: (row) => row.auditor.fullName ?? row.auditor.email ?? "—" },
            { label: "Ngày nộp", value: (row) => formatDate(row.submittedAt) },
          ],
        }}
        emptyTitle="Chưa có kết quả"
        emptyDescription="Kết quả các bài kiểm tra đã nộp sẽ hiển thị ở đây."
      />
    </div>
  );
}
