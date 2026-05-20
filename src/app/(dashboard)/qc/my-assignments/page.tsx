"use client";

import { ArrowRight, CalendarDays, CheckCircle2, ClipboardList, Clock, PlayCircle } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { useMyAssignments } from "@/features/audit";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import { MetricCard, PageHeader, StatusBadge } from "@/shared/components";
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
  if (isLoading) {
    return (
      <div className="rounded-lg border border-border bg-card p-6 text-sm text-muted-foreground">
        Đang tải danh sách bài kiểm tra...
      </div>
    );
  }

  if (assignments.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border bg-card p-10 text-center">
        <div className="mx-auto mb-3 flex size-10 items-center justify-center rounded-lg bg-muted text-muted-foreground">
          <ClipboardList className="size-5" />
        </div>
        <h2 className="text-base font-semibold">Chưa có bài kiểm tra</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Khi QA Manager giao việc, bài kiểm tra sẽ xuất hiện ở đây.
        </p>
      </div>
    );
  }

  return (
    <div className="hidden overflow-hidden rounded-lg border border-border bg-card shadow-sm md:block">
      <table className="w-full table-fixed text-sm">
        <thead className="border-b border-border bg-muted/45">
          <tr className="text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            <th className="w-[28%] px-5 py-3.5">Cửa hàng</th>
            <th className="w-[31%] px-5 py-3.5">Kế hoạch & thời gian</th>
            <th className="w-[16%] px-5 py-3.5">Cửa sổ audit</th>
            <th className="w-[25%] px-5 py-3.5">Trạng thái & hành động</th>
          </tr>
        </thead>
        <tbody>
          {assignments.map((row) => {
            const action = getAction(row);
            const windowStatus = getWindowStatus(row);
            return (
              <tr
                key={row.id}
                className={cn(
                  "border-b border-border/70 transition-colors last:border-0",
                  !action.disabled && "cursor-pointer hover:bg-primary-light/55"
                )}
                onClick={() => {
                  if (!action.disabled) onOpen(row);
                }}
              >
                <td className="px-5 py-4 align-middle">
                  <div className="min-w-0">
                    <div className="truncate font-semibold text-foreground">{row.store.name}</div>
                    <div className="mt-1 font-mono text-xs text-muted-foreground">{row.store.code}</div>
                  </div>
                </td>
                <td className="px-5 py-4 align-middle">
                  <div className="min-w-0">
                    <div className="truncate font-medium text-foreground">{row.plan.name}</div>
                    <div className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                      <CalendarDays className="size-3.5" />
                      <span>
                        {formatDate(row.plan.startDate)} - {formatDate(row.plan.endDate)}
                      </span>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-4 align-middle">
                  <span className={cn("inline-flex items-center gap-1.5 text-xs font-semibold", windowStatus.className)}>
                    <span className={cn("size-1.5 rounded-full", windowStatus.dotClassName)} />
                    {windowStatus.label}
                  </span>
                </td>
                <td className="px-5 py-4 align-middle">
                  <div className="flex items-center justify-end gap-2">
                    <StatusBadge status={row.status} />
                    <AssignmentActionButton action={action} onClick={() => !action.disabled && onOpen(row)} />
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function AssignmentMobileList({
  assignments,
  isLoading,
  onOpen,
}: {
  assignments: MyAssignment[];
  isLoading: boolean;
  onOpen: (row: MyAssignment) => void;
}) {
  if (isLoading) {
    return (
      <div className="rounded-lg border border-border bg-card p-5 text-sm text-muted-foreground md:hidden">
        Đang tải danh sách bài kiểm tra...
      </div>
    );
  }

  if (assignments.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border bg-card p-6 text-center md:hidden">
        <div className="mx-auto mb-3 flex size-10 items-center justify-center rounded-lg bg-muted text-muted-foreground">
          <ClipboardList className="size-5" />
        </div>
        <h2 className="text-base font-semibold">Chưa có bài kiểm tra</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Khi QA Manager giao việc, bài kiểm tra sẽ xuất hiện ở đây.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3 md:hidden">
      {assignments.map((row) => {
        const action = getAction(row);
        const windowStatus = getWindowStatus(row);
        return (
          <article key={row.id} className="rounded-lg border border-border bg-card p-4 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h2 className="text-base font-semibold leading-tight text-foreground">{row.store.name}</h2>
                <p className="mt-1 font-mono text-xs text-muted-foreground">{row.store.code}</p>
              </div>
              <StatusBadge status={row.status} className="shrink-0" />
            </div>

            <div className="mt-4 space-y-3 rounded-md bg-muted/45 p-3">
              <div>
                <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Kế hoạch
                </div>
                <div className="mt-1 text-sm font-medium leading-snug text-foreground">{row.plan.name}</div>
              </div>
              <div className="flex items-center justify-between gap-3 text-xs">
                <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                  <CalendarDays className="size-3.5" />
                  {formatDate(row.plan.startDate)} - {formatDate(row.plan.endDate)}
                </span>
                <span className={cn("inline-flex items-center gap-1.5 font-semibold", windowStatus.className)}>
                  <span className={cn("size-1.5 rounded-full", windowStatus.dotClassName)} />
                  {windowStatus.label}
                </span>
              </div>
            </div>

            <AssignmentActionButton
              action={action}
              className="mt-4 w-full justify-center"
              onClick={() => !action.disabled && onOpen(row)}
            />
          </article>
        );
      })}
    </div>
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
      <AssignmentMobileList assignments={assignments} isLoading={isLoading} onOpen={openAssignment} />
    </div>
  );
}
