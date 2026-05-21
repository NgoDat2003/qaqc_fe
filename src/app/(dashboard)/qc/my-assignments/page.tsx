"use client";

import { ArrowRight, CalendarDays, CheckCircle2, ClipboardList, Clock, PlayCircle } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { useMyAssignments } from "@/features/audit";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import { MetricCard, PageHeader, SortableTable, StatusBadge } from "@/shared/components";
import type { SortableColumnDef } from "@/shared/components";
import type { MyAssignment } from "@/shared/types";

type AssignmentAction = {
  label: string;
  disabled: boolean;
  variant: "default" | "outline";
};

function getAction(row: MyAssignment): AssignmentAction {
  if (row.status === "completed") return { label: "Xem kết quả", disabled: false, variant: "outline" };
  if (!row.plan.isAuditWindowOpen) return { label: "Hết hạn", disabled: true, variant: "outline" };
  if (row.status === "in_progress") return { label: "Tiếp tục", disabled: false, variant: "default" };
  return { label: "Bắt đầu", disabled: false, variant: "default" };
}

function getWindowStatus(row: MyAssignment) {
  if (row.status === "completed") {
    return { label: "Đã hoàn tất", className: "text-muted-foreground", dotClassName: "bg-muted-foreground" };
  }

  if (row.plan.isAuditWindowOpen) {
    return { label: "Đang mở", className: "text-success", dotClassName: "bg-success" };
  }

  return { label: "Đã đóng", className: "text-muted-foreground", dotClassName: "bg-muted-foreground" };
}

function AssignmentActionButton({
  action,
  className,
  onClick,
}: {
  action: AssignmentAction;
  className?: string;
  onClick?: () => void;
}) {
  return (
    <Button
      size="sm"
      variant={action.variant}
      disabled={action.disabled}
      className={cn(
        "h-8 gap-1.5 rounded-md px-3 text-xs font-semibold whitespace-nowrap",
        action.variant === "default" && "bg-primary text-primary-foreground hover:bg-primary/90",
        action.variant === "outline" && "border-border bg-card hover:bg-muted",
        action.disabled && "opacity-50",
        className
      )}
      onClick={(event) => {
        event.stopPropagation();
        onClick?.();
      }}
    >
      {action.label}
      {!action.disabled && <ArrowRight className="size-3.5" />}
    </Button>
  );
}

function AssignmentDesktopTable({
  assignments,
  isLoading,
  onOpen,
}: {
  assignments: MyAssignment[];
  isLoading: boolean;
  onOpen: (row: MyAssignment) => void;
}) {
  const columns: SortableColumnDef<MyAssignment>[] = [
    {
      header: "Cửa hàng",
      getSearchValue: (row) => `${row.store.name} ${row.store.code}`,
      cell: (row) => (
        <div className="min-w-0">
          <div className="truncate font-semibold text-foreground">{row.store.name}</div>
          <div className="mt-1 font-mono text-xs text-muted-foreground">{row.store.code}</div>
        </div>
      ),
    },
    {
      header: "Kế hoạch",
      getSearchValue: (row) => `${row.plan.name} ${row.checklist.name} ${row.checklist.version}`,
      cell: (row) => (
        <div className="min-w-0">
          <div className="truncate font-medium text-foreground">{row.plan.name}</div>
          <div className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
            <CalendarDays className="size-3.5" />
            <span>{formatDate(row.plan.startDate)} - {formatDate(row.plan.endDate)}</span>
          </div>
        </div>
      ),
    },
    {
      header: "Cửa sổ audit",
      getFilterValue: (row) => getWindowStatus(row).label,
      filterOptions: [
        { value: "Đang mở", label: "Đang mở" },
        { value: "Đã đóng", label: "Đã đóng" },
        { value: "Đã hoàn tất", label: "Đã hoàn tất" },
      ],
      cell: (row) => {
        const windowStatus = getWindowStatus(row);
        return (
          <span className={cn("inline-flex items-center gap-1.5 text-xs font-semibold", windowStatus.className)}>
            <span className={cn("size-1.5 rounded-full", windowStatus.dotClassName)} />
            {windowStatus.label}
          </span>
        );
      },
      className: "w-40",
    },
    {
      header: "Trạng thái",
      filterKey: "status",
      filterOptions: [
        { value: "pending", label: "Chờ thực hiện" },
        { value: "in_progress", label: "Đang thực hiện" },
        { value: "completed", label: "Hoàn thành" },
      ],
      cell: (row) => <StatusBadge status={row.status} />,
      className: "w-36",
    },
    {
      header: "",
      cell: (row) => {
        const action = getAction(row);
        return (
          <div className="flex justify-end">
            <AssignmentActionButton action={action} onClick={() => !action.disabled && onOpen(row)} />
          </div>
        );
      },
      className: "w-36",
    },
  ];

  return (
    <SortableTable
      columns={columns}
      data={assignments}
      isLoading={isLoading}
      onRowClick={(row) => {
        if (!getAction(row).disabled) onOpen(row);
      }}
      mobileCard={{
        title: (row) => row.store.name,
        subtitle: (row) => `${row.store.code} · ${row.plan.name}`,
        badges: (row) => {
          const windowStatus = getWindowStatus(row);
          return [
            <StatusBadge key="status" status={row.status} />,
            <span key="window" className={cn("inline-flex items-center gap-1.5 text-xs font-semibold", windowStatus.className)}>
              <span className={cn("size-1.5 rounded-full", windowStatus.dotClassName)} />
              {windowStatus.label}
            </span>,
          ];
        },
        details: [
          { label: "Checklist", value: (row) => `${row.checklist.name} v${row.checklist.version}` },
          { label: "Thời hạn", value: (row) => `${formatDate(row.plan.startDate)} - ${formatDate(row.plan.endDate)}` },
        ],
        actions: (row) => {
          const action = getAction(row);
          return (
            <AssignmentActionButton
              action={action}
              className="w-full justify-center"
              onClick={() => !action.disabled && onOpen(row)}
            />
          );
        },
      }}
      emptyTitle="Chưa có bài kiểm tra"
      emptyDescription="Khi QA Manager giao việc, bài kiểm tra sẽ xuất hiện ở đây."
    />
  );
}

export default function MyAssignmentsPage() {
  const router = useRouter();
  const { data: assignments = [], isLoading } = useMyAssignments();

  const stats = {
    total: assignments.length,
    pending: assignments.filter((assignment) => assignment.status === "pending").length,
    inProgress: assignments.filter((assignment) => assignment.status === "in_progress").length,
    completed: assignments.filter((assignment) => assignment.status === "completed").length,
  };

  const openAssignment = (assignment: MyAssignment) => {
    router.push(`/qc/audits/${assignment.id}`);
  };

  return (
    <div className="space-y-5 md:space-y-6">
      <PageHeader
        title="Việc của tôi"
        subtitle="Theo dõi các bài kiểm tra được giao và bắt đầu audit trong thời hạn."
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <MetricCard label="Tổng bài kiểm tra" value={isLoading ? "-" : stats.total} icon={ClipboardList} variant="default" />
        <MetricCard label="Chờ thực hiện" value={isLoading ? "-" : stats.pending} icon={Clock} variant="warning" />
        <MetricCard label="Đang thực hiện" value={isLoading ? "-" : stats.inProgress} icon={PlayCircle} variant="info" />
        <MetricCard label="Hoàn thành" value={isLoading ? "-" : stats.completed} icon={CheckCircle2} variant="success" />
      </div>

      <AssignmentDesktopTable assignments={assignments} isLoading={isLoading} onOpen={openAssignment} />
    </div>
  );
}
