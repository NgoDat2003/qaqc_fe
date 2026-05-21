"use client";

import { useRouter } from "next/navigation";
import { CheckCircle2, Clock, FileEdit, ListChecks } from "lucide-react";
import { useActionPlans } from "@/features/audit";
import { MetricCard, PageHeader, ScoreBadge, SortableTable, StatusBadge } from "@/shared/components";
import { formatDate } from "@/lib/format";
import type { SortableColumnDef } from "@/shared/components";
import type { ActionPlanDetail } from "@/shared/types";

const STATUS_FILTERS = [
  { value: "draft", label: "Nháp" },
  { value: "submitted", label: "Đã nộp" },
  { value: "rejected", label: "Bị từ chối" },
  { value: "closed", label: "Đã đóng" },
];

const columns: SortableColumnDef<ActionPlanDetail>[] = [
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
    header: "Bài kiểm tra",
    hideOnMobile: true,
    getSearchValue: (row) => `${row.audit.checklist.name} ${row.audit.checklist.version}`,
    cell: (row) => (
      <div>
        <div className="text-sm font-medium">{row.audit.checklist.name}</div>
        <div className="text-xs text-muted-foreground">v{row.audit.checklist.version}</div>
      </div>
    ),
  },
  {
    header: "Điểm",
    getSortValue: (row) => row.audit.finalScore,
    cell: (row) => <ScoreBadge score={row.audit.finalScore} />,
  },
  {
    header: "Trạng thái",
    getFilterValue: (row) => row.status,
    filterOptions: STATUS_FILTERS,
    cell: (row) => <StatusBadge status={row.status} />,
  },
  {
    header: "Người KT",
    hideOnMobile: true,
    getSearchValue: (row) => `${row.audit.auditor.fullName ?? ""} ${row.audit.auditor.email ?? ""}`,
    cell: (row) => (
      <span className="text-sm text-muted-foreground">
        {row.audit.auditor.fullName ?? row.audit.auditor.email ?? "—"}
      </span>
    ),
  },
  {
    header: "Ngày nộp bài",
    hideOnMobile: true,
    getSortValue: (row) => new Date(row.audit.submittedAt),
    cell: (row) => (
      <span className="text-sm text-muted-foreground">
        {formatDate(row.audit.submittedAt)}
      </span>
    ),
  },
];

export default function QcActionPlansPage() {
  const router = useRouter();
  const { data: all = [], isLoading } = useActionPlans();

  const total = all.length;
  const drafts = all.filter((ap) => ap.status === "draft" || ap.status === "rejected").length;
  const submitted = all.filter((ap) => ap.status === "submitted").length;
  const closed = all.filter((ap) => ap.status === "closed").length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Action Plan"
        subtitle="Kế hoạch khắc phục lỗi từ các bài kiểm tra"
      />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <MetricCard label="Tổng" value={isLoading ? "—" : total} icon={ListChecks} variant="default" />
        <MetricCard label="Nháp / Bị từ chối" value={isLoading ? "—" : drafts} icon={FileEdit} variant="warning" />
        <MetricCard label="Đang chờ duyệt" value={isLoading ? "—" : submitted} icon={Clock} variant="info" />
        <MetricCard label="Đã đóng" value={isLoading ? "—" : closed} icon={CheckCircle2} variant="success" />
      </div>

      <SortableTable
        columns={columns}
        data={all}
        isLoading={isLoading}
        onRowClick={(row) => router.push(`/action-plans/${row.id}`)}
        emptyTitle="Chưa có Action Plan"
        emptyDescription="Action Plan được tạo sau khi bài kiểm tra có lỗi."
      />
    </div>
  );
}
