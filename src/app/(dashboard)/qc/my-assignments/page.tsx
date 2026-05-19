"use client";

import { useRouter } from "next/navigation";
import { ClipboardList, Clock, PlayCircle, CheckCircle2, ArrowRight } from "lucide-react";
import { useMyAssignments } from "@/features/audit";
import { DataTable, PageHeader, StatusBadge, MetricCard } from "@/shared/components";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import type { ColumnDef } from "@/shared/components/data-table";
import type { MyAssignment } from "@/shared/types";

function getAction(row: MyAssignment): { label: string; disabled: boolean; variant: "default" | "outline" } {
  if (row.status === "completed")    return { label: "Xem kết quả", disabled: false, variant: "outline" };
  if (!row.plan.isAuditWindowOpen)   return { label: "Hết hạn",     disabled: true,  variant: "outline" };
  if (row.status === "in_progress")  return { label: "Tiếp tục",    disabled: false, variant: "default" };
  return                                    { label: "Bắt đầu",     disabled: false, variant: "default" };
}

const columns: ColumnDef<MyAssignment>[] = [
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
    header: "Kế hoạch & Thời gian",
    hideOnMobile: true,
    className: "max-w-[240px]",
    cell: (row) => (
      <div className="min-w-0">
        <div className="font-medium text-sm truncate">{row.plan.name}</div>
        <div className="text-xs text-muted-foreground mt-0.5">
          {formatDate(row.plan.startDate)} – {formatDate(row.plan.endDate)}
        </div>
      </div>
    ),
  },

  {
    header: "Cửa sổ audit",
    hideOnMobile: true,
    cell: (row) => {
      if (row.status === "completed") return <span className="text-xs text-muted-foreground">—</span>;
      return row.plan.isAuditWindowOpen ? (
        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-success">
          <span className="w-1.5 h-1.5 rounded-full bg-success" />
          Đang mở
        </span>
      ) : (
        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
          <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground" />
          Đã đóng
        </span>
      );
    },
  },
  {
    header: "Trạng thái & Hành động",
    cell: (row) => {
      const action = getAction(row);
      return (
        <div className="flex items-center gap-2 flex-wrap">
          <StatusBadge status={row.status} />
          <Button
            size="sm"
            variant={action.variant}
            disabled={action.disabled}
            className={cn("gap-1 text-xs h-7 px-2.5 whitespace-nowrap", action.disabled && "opacity-50")}
            onClick={(e) => e.stopPropagation()}
          >
            {action.label}
            {!action.disabled && <ArrowRight className="w-3 h-3" />}
          </Button>
        </div>
      );
    },
  },
];

export default function MyAssignmentsPage() {
  const router = useRouter();
  const { data: assignments = [], isLoading } = useMyAssignments();

  const stats = {
    total:      assignments.length,
    pending:    assignments.filter((a) => a.status === "pending").length,
    inProgress: assignments.filter((a) => a.status === "in_progress").length,
    completed:  assignments.filter((a) => a.status === "completed").length,
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Việc của tôi"
        subtitle="Danh sách bài kiểm tra được giao cho bạn"
      />

      {/* Statistics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <MetricCard label="Tổng bài kiểm tra" value={isLoading ? "—" : stats.total}      icon={ClipboardList} variant="default" />
        <MetricCard label="Chờ thực hiện"      value={isLoading ? "—" : stats.pending}    icon={Clock}         variant="warning" />
        <MetricCard label="Đang thực hiện"     value={isLoading ? "—" : stats.inProgress} icon={PlayCircle}    variant="info" />
        <MetricCard label="Hoàn thành"         value={isLoading ? "—" : stats.completed}  icon={CheckCircle2}  variant="success" />
      </div>

      <DataTable
        columns={columns}
        data={assignments}
        isLoading={isLoading}
        onRowClick={(row) => {
          if (!getAction(row).disabled) router.push(`/qc/audits/${row.id}`);
        }}
        emptyTitle="Chưa có bài kiểm tra"
        emptyDescription="Khi QA Manager giao việc, bài kiểm tra sẽ xuất hiện ở đây."
      />
    </div>
  );
}
