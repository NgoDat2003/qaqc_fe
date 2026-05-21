"use client";

import { useState, useMemo } from "react";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { format } from "date-fns";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  Clock3,
  Edit2,
  PlayCircle,
  Send,
  Store,
  Trash2,
  UserCog,
} from "lucide-react";
import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import { MetricCard, SortableTable, ConfirmDialog, StatusBadge } from "@/shared/components";
import type { AppStatus, SortableColumnDef } from "@/shared/components";
import {
  useAuditPlan, usePublishAuditPlan, useRemoveAssignment,
} from "@/features/audit/hooks/use-audit-plans";
import type { AuditAssignmentSummary } from "@/shared/types";
import { EditPlanDialog } from "./_components/edit-plan-dialog";
import { ChangeAuditorDialog } from "./_components/change-auditor-dialog";

const PLAN_STATUS_LABEL: Record<string, string> = {
  draft:  "Bản nháp",
  open:   "Đang mở",
  closed: "Đã đóng",
};

export default function AuditPlanDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: plan, isLoading, isError } = useAuditPlan(id);

  const [editPlanOpen, setEditPlanOpen] = useState(false);
  const [changeAuditorState, setChangeAuditorState] = useState<{ assignmentId: string; currentAuditorId: string } | null>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [confirmPublish, setConfirmPublish] = useState(false);

  const publishPlan = usePublishAuditPlan();
  const removeAssignment = useRemoveAssignment();

  const handlePublish = async () => {
    try {
      await publishPlan.mutateAsync(id);
      toast.success("Đã giao việc — kế hoạch đang mở");
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Có lỗi xảy ra");
    }
    setConfirmPublish(false);
  };

  const handleRemove = async () => {
    if (!removingId) return;
    try {
      await removeAssignment.mutateAsync({ planId: id, assignmentId: removingId });
      toast.success("Đã xóa cửa hàng khỏi kế hoạch");
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "";
      if (msg.includes("requires at least one assignment")) {
        toast.error("Không thể xóa: kế hoạch đang mở cần ít nhất 1 cửa hàng");
      } else {
        toast.error(msg || "Có lỗi xảy ra");
      }
    }
    setRemovingId(null);
  };

  const columns = useMemo((): SortableColumnDef<AuditAssignmentSummary>[] => [
    {
      header: "Cửa hàng",
      getSearchValue: (row) => `${row.store?.name ?? ""} ${row.store?.code ?? ""}`,
      cell: (row) => (
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary-light text-primary">
            <Store className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <div className="truncate font-semibold text-foreground">{row.store?.name}</div>
            <div className="font-mono text-xs text-muted-foreground">{row.store?.code}</div>
          </div>
        </div>
      ),
    },
    {
      header: "QC phụ trách",
      getSearchValue: (row) => `${row.auditor?.fullName ?? ""} ${row.auditor?.email ?? ""}`,
      cell: (row) => (
        <div className="min-w-0">
          <div className="truncate font-medium text-foreground">{row.auditor?.fullName}</div>
          <div className="truncate text-xs text-muted-foreground">{row.auditor?.email}</div>
        </div>
      ),
    },
    {
      header: "Trạng thái",
      filterKey: "status",
      filterOptions: [
        { value: "pending", label: "Chưa bắt đầu" },
        { value: "in_progress", label: "Đang làm" },
        { value: "completed", label: "Hoàn thành" },
      ],
      cell: (row) => <StatusBadge status={row.status as AppStatus} />,
      className: "w-36",
    },
    {
      header: "",
      cell: (row) => {
        if (row.status !== "pending" || row.auditId) return null;
        if (plan?.status === "closed") return null;
        return (
          <div className="flex items-center justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-8 gap-1.5 border-info/20 bg-info-bg/40 text-info hover:bg-info-bg"
              onClick={() => setChangeAuditorState({ assignmentId: row.id, currentAuditorId: row.auditorId })}
            >
              <UserCog className="h-3.5 w-3.5" />
              Đổi QC
            </Button>
            <Button
              variant="outline"
              size="icon-sm"
              aria-label="Xóa khỏi kế hoạch"
              className="border-danger/20 text-danger hover:bg-danger-bg"
              onClick={() => setRemovingId(row.id)}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        );
      },
      className: "w-40",
    },
  ], [plan?.status]);

  if (isLoading) return <div className="p-6 text-muted-foreground">Đang tải...</div>;
  if (isError) return <div className="p-6 text-destructive">Không thể tải dữ liệu. Vui lòng thử lại.</div>;
  if (!plan) return <div className="p-6 text-muted-foreground">Không tìm thấy kế hoạch</div>;

  const dateRange = plan.startDate && plan.endDate
    ? `${format(new Date(plan.startDate), "dd/MM/yyyy")} – ${format(new Date(plan.endDate), "dd/MM/yyyy")}`
    : "—";
  const statusLabel = PLAN_STATUS_LABEL[plan.status] ?? plan.status;
  const assignments = plan.assignments ?? [];
  const totalAssignments = plan.progress?.total ?? assignments.length;
  const completedAssignments = plan.progress?.completed ?? 0;
  const completionRate = totalAssignments > 0 ? Math.round((completedAssignments / totalAssignments) * 100) : 0;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <section className="rounded-lg border border-border bg-card p-5 shadow-sm">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0 space-y-3">
            <Link
              href="/qam/audit-plans"
              className={buttonVariants({
                variant: "ghost",
                size: "sm",
                className: "-ml-2 h-8 gap-1.5 text-muted-foreground hover:text-foreground",
              })}
            >
              <ArrowLeft className="h-4 w-4" />
              Kế hoạch Audit
            </Link>
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-semibold tracking-tight text-foreground lg:text-3xl">{plan.name}</h1>
                <StatusBadge status={plan.status as AppStatus} />
              </div>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
                <span className="inline-flex items-center gap-1.5">
                  <ClipboardList className="h-4 w-4 text-primary" />
                  {plan.form?.name ?? "—"} v{plan.form?.version ?? ""}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <CalendarDays className="h-4 w-4 text-primary" />
                  {dateRange}
                </span>
                <span>{statusLabel}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {plan.status === "draft" && (
              <>
                <Button variant="outline" className="gap-2" onClick={() => setEditPlanOpen(true)}>
                  <Edit2 className="h-4 w-4" /> Chỉnh sửa
                </Button>
                <Button className="gap-2 bg-primary font-semibold hover:bg-primary-hover" onClick={() => setConfirmPublish(true)}>
                  <Send className="h-4 w-4" /> Giao việc
                </Button>
              </>
            )}
            {plan.status === "open" && (
              <Button variant="outline" className="gap-2" onClick={() => setEditPlanOpen(true)}>
                <Edit2 className="h-4 w-4" /> Chỉnh sửa
              </Button>
            )}
          </div>
        </div>

        <div className="mt-5 rounded-lg border border-border bg-muted/35 p-3">
          <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
            <span>Tiến độ hoàn thành</span>
            <span className="font-medium text-foreground">{completionRate}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-border/70">
            <div className="h-full rounded-full bg-primary" style={{ width: `${completionRate}%` }} />
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Tổng cửa hàng" value={totalAssignments} icon={Store} description="Trong kế hoạch" />
        <MetricCard label="Chưa bắt đầu" value={plan.progress?.pending ?? 0} icon={Clock3} variant="warning" description="Chờ QC thực hiện" />
        <MetricCard label="Đang làm" value={plan.progress?.inProgress ?? 0} icon={PlayCircle} variant="info" description="Đang audit" />
        <MetricCard label="Hoàn thành" value={completedAssignments} icon={CheckCircle2} variant="success" description={`${completionRate}% hoàn tất`} />
      </div>

      <div className="rounded-lg border border-border bg-card p-5 shadow-sm">
        <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Danh sách kiểm tra
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Theo dõi cửa hàng, QC phụ trách và trạng thái audit của từng assignment.
            </p>
          </div>
          <div className="text-sm text-muted-foreground">
            {assignments.length} assignment
          </div>
        </div>

        <SortableTable<AuditAssignmentSummary>
          columns={columns}
          data={assignments}
          mobileCard={{
            leading: () => (
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary-light text-primary">
                <Store className="h-4 w-4" />
              </div>
            ),
            title: (assignment) => assignment.store?.name ?? "—",
            subtitle: (assignment) => assignment.store?.code ?? "—",
            badges: (assignment) => [
              <StatusBadge key="status" status={assignment.status as AppStatus} />,
            ],
            details: [
              { label: "QC phụ trách", value: (assignment) => assignment.auditor?.fullName ?? "—" },
              { label: "Email", value: (assignment) => assignment.auditor?.email ?? "—" },
            ],
            actions: (assignment) => {
              const canEditAssignment = assignment.status === "pending" && !assignment.auditId && plan.status !== "closed";
              if (!canEditAssignment) return null;
              return (
                <div className="grid grid-cols-[1fr_auto] gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5 border-info/20 bg-info-bg/40 text-info hover:bg-info-bg"
                    onClick={() => setChangeAuditorState({ assignmentId: assignment.id, currentAuditorId: assignment.auditorId })}
                  >
                    <UserCog className="h-3.5 w-3.5" />
                    Đổi QC
                  </Button>
                  <Button
                    variant="outline"
                    size="icon-sm"
                    aria-label="Xóa khỏi kế hoạch"
                    className="border-danger/20 text-danger hover:bg-danger-bg"
                    onClick={() => setRemovingId(assignment.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              );
            },
          }}
          emptyTitle="Chưa có cửa hàng nào"
          emptyDescription="Kế hoạch này chưa có assignment nào."
        />
      </div>

      {/* Dialogs */}
      <EditPlanDialog
        open={editPlanOpen}
        onOpenChange={setEditPlanOpen}
        plan={plan}
      />

      {changeAuditorState && (
        <ChangeAuditorDialog
          open={!!changeAuditorState}
          onOpenChange={(o) => { if (!o) setChangeAuditorState(null); }}
          planId={id}
          assignmentId={changeAuditorState.assignmentId}
          currentAuditorId={changeAuditorState.currentAuditorId}
        />
      )}

      <ConfirmDialog
        open={!!removingId}
        onOpenChange={(o) => { if (!o) setRemovingId(null); }}
        title="Xóa cửa hàng khỏi kế hoạch?"
        description="Assignment chưa bắt đầu này sẽ bị xóa. Hành động không thể hoàn tác."
        confirmLabel="Xóa"
        onConfirm={handleRemove}
      />

      <ConfirmDialog
        open={confirmPublish}
        onOpenChange={setConfirmPublish}
        title="Giao việc và mở kế hoạch?"
        description="Sau khi giao việc, QC sẽ thấy assignment và có thể bắt đầu audit. Bạn không thể thêm cửa hàng mới."
        confirmLabel="Giao việc"
        onConfirm={handlePublish}
      />
    </div>
  );
}
