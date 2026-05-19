"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ListChecks, FileEdit, Clock, CheckCircle2 } from "lucide-react";
import { useActionPlans } from "@/features/audit";
import { DataTable, PageHeader, ScoreBadge, StatusBadge, MetricCard } from "@/shared/components";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { ColumnDef } from "@/shared/components/data-table";
import type { ActionPlanDetail, ActionPlanStatus } from "@/shared/types";

type FilterKey = "all" | ActionPlanStatus;

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: "all",       label: "Tất cả" },
  { key: "draft",     label: "Nháp" },
  { key: "submitted", label: "Đã nộp" },
  { key: "rejected",  label: "Bị từ chối" },
  { key: "closed",    label: "Đã đóng" },
];

const columns: ColumnDef<ActionPlanDetail>[] = [
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
    header: "Bài kiểm tra",
    hideOnMobile: true,
    cell: (row) => (
      <div>
        <div className="text-sm font-medium">{row.audit.checklist.name}</div>
        <div className="text-xs text-muted-foreground">v{row.audit.checklist.version}</div>
      </div>
    ),
  },
  {
    header: "Điểm",
    cell: (row) => <ScoreBadge score={row.audit.finalScore} />,
  },
  {
    header: "Trạng thái",
    cell: (row) => <StatusBadge status={row.status} />,
  },
  {
    header: "Người KT",
    hideOnMobile: true,
    cell: (row) => (
      <span className="text-sm text-muted-foreground">
        {row.audit.auditor.fullName ?? row.audit.auditor.email ?? "—"}
      </span>
    ),
  },
  {
    header: "Ngày nộp bài",
    hideOnMobile: true,
    cell: (row) => (
      <span className="text-sm text-muted-foreground">
        {formatDate(row.audit.submittedAt)}
      </span>
    ),
  },
];

export default function QcActionPlansPage() {
  const router = useRouter();
  const [filter, setFilter] = useState<FilterKey>("all");
  const { data: all = [], isLoading } = useActionPlans();

  const displayed = filter === "all" ? all : all.filter((ap) => ap.status === filter);

  const total     = all.length;
  const drafts    = all.filter((ap) => ap.status === "draft" || ap.status === "rejected").length;
  const submitted = all.filter((ap) => ap.status === "submitted").length;
  const closed    = all.filter((ap) => ap.status === "closed").length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Action Plan"
        subtitle="Kế hoạch khắc phục lỗi từ các bài kiểm tra"
      />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <MetricCard label="Tổng"               value={isLoading ? "—" : total}     icon={ListChecks}   variant="default" />
        <MetricCard label="Nháp / Bị từ chối" value={isLoading ? "—" : drafts}    icon={FileEdit}     variant="warning" />
        <MetricCard label="Đang chờ duyệt"     value={isLoading ? "—" : submitted} icon={Clock}        variant="info" />
        <MetricCard label="Đã đóng"            value={isLoading ? "—" : closed}    icon={CheckCircle2} variant="success" />
      </div>

      {/* Filter tabs */}
      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={cn(
              "px-3 py-1.5 rounded-md text-xs font-medium border transition-colors",
              filter === f.key
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-background text-muted-foreground border-border hover:bg-muted"
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      <DataTable
        columns={columns}
        data={displayed}
        isLoading={isLoading}
        onRowClick={(row) => router.push(`/action-plans/${row.id}`)}
        emptyTitle="Chưa có Action Plan"
        emptyDescription="Action Plan được tạo sau khi bài kiểm tra có lỗi."
      />
    </div>
  );
}
