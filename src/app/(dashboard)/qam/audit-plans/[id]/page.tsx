"use client";

import { useState, useMemo } from "react";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { format } from "date-fns";
import { Edit2, Send, Trash2, UserCog } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageHeader, MetricCard, SortableTable, RowActions, ConfirmDialog } from "@/shared/components";
import type { SortableColumnDef } from "@/shared/components";
import {
  useAuditPlan, usePublishAuditPlan, useRemoveAssignment,
} from "@/features/audit/hooks/use-audit-plans";
import type { AuditAssignmentSummary } from "@/shared/types";
import { EditPlanDialog } from "./_components/edit-plan-dialog";
import { ChangeAuditorDialog } from "./_components/change-auditor-dialog";

const STATUS_LABELS: Record<string, string> = {
  pending:     "Chưa bắt đầu",
  in_progress: "Đang làm",
  completed:   "Hoàn thành",
};

const STATUS_VARIANTS: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  pending:     "secondary",
  in_progress: "default",
  completed:   "outline",
};

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
      sortKey: "storeId",
      cell: (row) => (
        <div>
          <div className="font-medium">{row.store?.name}</div>
          <div className="font-mono text-xs text-muted-foreground">{row.store?.code}</div>
        </div>
      ),
    },
    {
      header: "QC phụ trách",
      cell: (row) => (
        <div>
          <div>{row.auditor?.fullName}</div>
          <div className="text-xs text-muted-foreground">{row.auditor?.email}</div>
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
      cell: (row) => (
        <Badge variant={STATUS_VARIANTS[row.status] ?? "secondary"}>
          {STATUS_LABELS[row.status] ?? row.status}
        </Badge>
      ),
      className: "w-36",
    },
    {
      header: "",
      cell: (row) => {
        if (row.status !== "pending" || row.auditId) return null;
        if (plan?.status === "closed") return null;
        return (
          <RowActions actions={[
            { label: "Đổi QC", icon: UserCog, onClick: () => setChangeAuditorState({ assignmentId: row.id, currentAuditorId: row.auditorId }) },
            { label: "Xóa khỏi kế hoạch", icon: Trash2, onClick: () => setRemovingId(row.id), variant: "destructive" as const },
          ]} />
        );
      },
      className: "w-16",
    },
  // eslint-disable-next-line react-hooks/exhaustive-deps
  ], [plan?.status]);

  if (isLoading) return <div className="p-6 text-muted-foreground">Đang tải...</div>;
  if (isError) return <div className="p-6 text-destructive">Không thể tải dữ liệu. Vui lòng thử lại.</div>;
  if (!plan) return <div className="p-6 text-muted-foreground">Không tìm thấy kế hoạch</div>;

  const dateRange = plan.startDate && plan.endDate
    ? `${format(new Date(plan.startDate), "dd/MM/yyyy")} – ${format(new Date(plan.endDate), "dd/MM/yyyy")}`
    : "—";
  const statusLabel = PLAN_STATUS_LABEL[plan.status] ?? plan.status;

  return (
    <div className="space-y-6 p-6 animate-in fade-in duration-500">
      <PageHeader
        title={plan.name}
        subtitle={`${plan.form?.name ?? "—"} v${plan.form?.version ?? ""} · ${dateRange} · ${statusLabel}`}
        backHref="/qam/audit-plans"
      >
        {plan.status === "draft" && (
          <div className="flex items-center gap-2">
            <Button variant="outline" className="gap-2 h-9" onClick={() => setEditPlanOpen(true)}>
              <Edit2 className="h-4 w-4" /> Chỉnh sửa
            </Button>
            <Button className="bg-primary gap-2 h-9 font-semibold" onClick={() => setConfirmPublish(true)}>
              <Send className="h-4 w-4" /> Giao việc
            </Button>
          </div>
        )}
        {plan.status === "open" && (
          <Button variant="outline" className="gap-2 h-9" onClick={() => setEditPlanOpen(true)}>
            <Edit2 className="h-4 w-4" /> Chỉnh sửa
          </Button>
        )}
      </PageHeader>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard label="Tổng" value={plan.progress?.total ?? 0} />
        <MetricCard label="Chưa bắt đầu" value={plan.progress?.pending ?? 0} />
        <MetricCard label="Đang làm" value={plan.progress?.inProgress ?? 0} />
        <MetricCard label="Hoàn thành" value={plan.progress?.completed ?? 0} />
      </div>

      <div className="bg-white rounded-2xl shadow-md border p-5">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">
          Danh sách kiểm tra
        </p>
        <SortableTable<AuditAssignmentSummary>
          columns={columns}
          data={plan.assignments ?? []}
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
