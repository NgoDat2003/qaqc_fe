"use client";

import { useCallback, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { format } from "date-fns";
import { CheckCircle2, Plus, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConfirmDialog, PageHeader, RowActions, SortableTable, StatusBadge } from "@/shared/components";
import type { AppStatus, SortableColumnDef } from "@/shared/components";
import type { AuditPlanFull } from "@/shared/types";
import { useAuditPlans, useCloseAuditPlan } from "@/features/audit";

function ProgressBar({ completed, total }: { completed: number; total: number }) {
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
  return (
    <div className="space-y-1">
      <div className="h-1.5 overflow-hidden rounded-full bg-muted">
        <div className="h-full rounded-full bg-success" style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs text-muted-foreground">{completed}/{total} hoàn thành</span>
    </div>
  );
}

const STATUS_FILTERS = [
  { value: "draft", label: "Bản nháp" },
  { value: "open", label: "Đang mở" },
  { value: "closed", label: "Đã đóng" },
];

export default function AuditPlansPage() {
  const router = useRouter();
  const [closingId, setClosingId] = useState<string | null>(null);

  const { data: plans = [], isLoading } = useAuditPlans();
  const closePlan = useCloseAuditPlan();

  const handleClose = async () => {
    if (!closingId) return;
    try {
      await closePlan.mutateAsync(closingId);
      toast.success("Đã đóng kế hoạch audit");
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Có lỗi xảy ra");
    }
    setClosingId(null);
  };

  const openClose = useCallback((id: string) => setClosingId(id), []);

  const columns = useMemo((): SortableColumnDef<AuditPlanFull>[] => [
    {
      header: "Kế hoạch",
      getSearchValue: (plan) => `${plan.name} ${plan.form.name} ${plan.form.version}`,
      cell: (plan) => (
        <div>
          <div className="font-semibold text-foreground">{plan.name}</div>
          <div className="mt-0.5 text-xs text-muted-foreground">{plan.form.name} v{plan.form.version}</div>
        </div>
      ),
    },
    {
      header: "Thời gian",
      getSortValue: (plan) => new Date(plan.startDate),
      hideOnMobile: true,
      cell: (plan) => (
        <div className="text-sm">
          <div>{plan.startDate ? format(new Date(plan.startDate), "dd/MM/yyyy") : "—"}</div>
          <div className="text-xs text-muted-foreground">{plan.endDate ? format(new Date(plan.endDate), "dd/MM/yyyy") : ""}</div>
        </div>
      ),
    },
    {
      header: "Tiến độ",
      getSortValue: (plan) => plan.progress.total > 0 ? plan.progress.completed / plan.progress.total : 0,
      cell: (plan) => <ProgressBar completed={plan.progress.completed} total={plan.progress.total} />,
      className: "w-44",
      hideOnMobile: true,
    },
    {
      header: "Trạng thái",
      filterKey: "status",
      filterOptions: STATUS_FILTERS,
      cell: (plan) => <StatusBadge status={plan.status as AppStatus} />,
      className: "w-28",
    },
    {
      header: "",
      cell: (plan) => (
        <RowActions actions={[
          ...(plan.status === "open" ? [{ label: "Đóng kế hoạch", icon: XCircle, onClick: () => openClose(plan.id), variant: "destructive" as const }] : []),
          { label: "Xem chi tiết", icon: CheckCircle2, onClick: () => router.push(`/qam/audit-plans/${plan.id}`) },
        ]} />
      ),
      className: "w-16",
    },
  ], [openClose, router]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <PageHeader title="Kế hoạch Audit" subtitle="Quản lý và theo dõi các đợt kiểm tra chất lượng cửa hàng.">
        <Button onClick={() => router.push("/qam/audit-plans/new")} className="gap-2 bg-primary font-bold hover:bg-primary/90">
          <Plus className="h-4 w-4" /> Tạo kế hoạch
        </Button>
      </PageHeader>

      <div className="rounded-lg border border-border bg-card p-5 shadow-sm">
        <SortableTable
          columns={columns}
          data={plans}
          isLoading={isLoading}
          mobileCard={{
            title: (plan) => plan.name,
            subtitle: (plan) => `${plan.form.name} v${plan.form.version}`,
            badges: (plan) => [
              <StatusBadge key="status" status={plan.status as AppStatus} />,
            ],
            details: [
              {
                label: "Thời gian",
                value: (plan) => (
                  <span>
                    {plan.startDate ? format(new Date(plan.startDate), "dd/MM/yyyy") : "—"}
                    {plan.endDate ? ` - ${format(new Date(plan.endDate), "dd/MM/yyyy")}` : ""}
                  </span>
                ),
              },
            ],
            metrics: [
              {
                label: "Tiến độ",
                value: (plan) => <ProgressBar completed={plan.progress.completed} total={plan.progress.total} />,
              },
            ],
            actions: (plan) => (
              <RowActions actions={[
                ...(plan.status === "open" ? [{ label: "Đóng kế hoạch", icon: XCircle, onClick: () => openClose(plan.id), variant: "destructive" as const }] : []),
                { label: "Xem chi tiết", icon: CheckCircle2, onClick: () => router.push(`/qam/audit-plans/${plan.id}`) },
              ]} />
            ),
          }}
          emptyTitle="Chưa có kế hoạch audit nào"
          emptyDescription="Tạo kế hoạch đầu tiên để bắt đầu kiểm tra."
        />
      </div>

      <ConfirmDialog
        open={!!closingId}
        onOpenChange={(open) => !open && setClosingId(null)}
        title="Đóng kế hoạch audit?"
        description="Sau khi đóng, không thể tạo thêm audit mới cho kế hoạch này."
        confirmLabel="Đóng kế hoạch"
        onConfirm={handleClose}
      />
    </div>
  );
}
