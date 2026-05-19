"use client";

import { useRouter } from "next/navigation";
import { useMyAssignments } from "@/features/audit";
import { DataTable, PageHeader, StatusBadge } from "@/shared/components";
import { formatDate } from "@/lib/format";
import type { ColumnDef } from "@/shared/components/data-table";
import type { MyAssignment } from "@/shared/types";

const columns: ColumnDef<MyAssignment>[] = [
  {
    header: "Cửa hàng",
    cell: (row) => (
      <div>
        <div className="font-medium">{row.store.name}</div>
        <div className="text-xs text-muted-foreground">{row.store.code}</div>
      </div>
    ),
  },
  {
    header: "Kế hoạch kiểm tra",
    hideOnMobile: true,
    cell: (row) => (
      <div>
        <div className="font-medium">{row.plan.name}</div>
        <div className="text-xs text-muted-foreground">
          {formatDate(row.plan.startDate)} – {formatDate(row.plan.endDate)}
        </div>
      </div>
    ),
  },
  {
    header: "Biểu mẫu",
    hideOnMobile: true,
    cell: (row) => (
      <span className="text-sm">
        {row.checklist.name} <span className="text-muted-foreground">v{row.checklist.version}</span>
      </span>
    ),
  },
  {
    header: "Trạng thái",
    cell: (row) => (
      <div className="flex flex-col gap-1 items-start">
        <StatusBadge status={row.status} />
        {!row.plan.isAuditWindowOpen && row.status !== "completed" && (
          <span className="inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium bg-warning-bg text-warning border-warning/20">
            Ngoài cửa sổ audit
          </span>
        )}
      </div>
    ),
  },
];

export default function MyAssignmentsPage() {
  const router = useRouter();
  const { data: assignments, isLoading } = useMyAssignments();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Việc của tôi"
        subtitle="Danh sách bài kiểm tra được giao cho bạn"
      />
      <DataTable
        columns={columns}
        data={assignments}
        isLoading={isLoading}
        onRowClick={(row) => router.push(`/qc/audits/${row.id}`)}
        emptyTitle="Chưa có bài kiểm tra"
        emptyDescription="Khi QA Manager giao việc, bài kiểm tra sẽ xuất hiện ở đây."
      />
    </div>
  );
}
