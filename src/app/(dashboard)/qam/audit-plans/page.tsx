"use client";

import { useMemo, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { format } from "date-fns";
import { Plus, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageHeader, SortableTable, RowActions, ConfirmDialog } from "@/shared/components";
import type { SortableColumnDef } from "@/shared/components";
import type { AuditPlanFull } from "@/shared/types";
import { useAuditPlans, useCloseAuditPlan } from "@/features/audit";

function ProgressBar({ completed, total }: { completed: number; total: number }) {
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
  return (
    <div className="space-y-1">
      <div className="h-1.5 rounded-full bg-muted overflow-hidden">
        <div className="h-full rounded-full bg-success" style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs text-muted-foreground">{completed}/{total} hoàn thành</span>
    </div>
  );
}

export default function AuditPlansPage() {
  const router = useRouter();
  const [statusFilter, setStatusFilter] = useState("all");
  const [closingId, setClosingId] = useState<string | null>(null);

  const { data: plans = [], isLoading } = useAuditPlans();
  const closePlan = useCloseAuditPlan();

  const filtered = useMemo(() =>
    statusFilter === "all" ? plans : plans.filter((p) => p.status === statusFilter),
    [plans, statusFilter]
  );

  const handleClose = async () => {
    if (!closingId) return;
    try {
      await closePlan.mutateAsync(closingId);
      toast.success("Đã đóng kế hoạch audit");
    } catch (e: unknown) { toast.error(e instanceof Error ? e.message : "Có lỗi xảy ra"); }
    setClosingId(null);
  };

  const openClose = useCallback((id: string) => setClosingId(id), []);

  const columns = useMemo((): SortableColumnDef<AuditPlanFull>[] => [
    {
      header: "Kế hoạch",
      sortKey: "name",
      cell: (p) => (
        <div>
          <div className="font-semibold text-foreground">{p.name}</div>
          <div className="text-xs text-muted-foreground mt-0.5">{p.form.name} v{p.form.version}</div>
        </div>
      ),
    },
    {
      header: "Thời gian",
      sortKey: "startDate",
      hideOnMobile: true,
      cell: (p) => (
        <div className="text-sm">
          <div>{p.startDate ? format(new Date(p.startDate), "dd/MM/yyyy") : "—"}</div>
          <div className="text-muted-foreground text-xs">{p.endDate ? format(new Date(p.endDate), "dd/MM/yyyy") : ""}</div>
        </div>
      ),
    },
    {
      header: "Tiến độ",
      cell: (p) => <ProgressBar completed={p.progress.completed} total={p.progress.total} />,
      className: "w-44", hideOnMobile: true,
    },
    {
      header: "Trạng thái",
      sortKey: "status",
      filterKey: "status",
      filterOptions: [
        { value: "draft", label: "Bản nháp" },
        { value: "open", label: "Đang mở" },
        { value: "closed", label: "Đã đóng" },
      ],
      cell: (p) => (
        <Badge className={`text-xs ${p.status === "open" ? "bg-green-100 text-green-700" : p.status === "draft" ? "bg-yellow-100 text-yellow-700" : "bg-gray-100 text-gray-600"}`}>
          {p.status === "open" ? "Đang mở" : p.status === "draft" ? "Bản nháp" : "Đã đóng"}
        </Badge>
      ),
      className: "w-28",
    },
    {
      header: "",
      cell: (p) => (
        <RowActions actions={[
          ...(p.status === "open" ? [{ label: "Đóng kế hoạch", icon: XCircle, onClick: () => openClose(p.id), variant: "destructive" as const }] : []),
          { label: "Xem chi tiết", icon: CheckCircle2, onClick: () => router.push(`/qam/audit-plans/${p.id}`) },
        ]} />
      ),
      className: "w-16",
    },
  ], [openClose, router]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <PageHeader title="Kế hoạch Audit" subtitle="Quản lý và theo dõi các đợt kiểm tra chất lượng cửa hàng.">
        <Button onClick={() => router.push("/qam/audit-plans/new")} className="bg-primary hover:bg-primary/90 gap-2 font-bold">
          <Plus className="h-4 w-4" /> Tạo kế hoạch
        </Button>
      </PageHeader>

      <div className="bg-white rounded-2xl shadow-md border p-5 space-y-4">
        <div className="flex gap-2 border-b pb-3">
          {[["all", "Tất cả"], ["draft", "Bản nháp"], ["open", "Đang mở"], ["closed", "Đã đóng"]].map(([v, l]) => (
            <button key={v} onClick={() => setStatusFilter(v)}
              className={`text-xs font-semibold px-3 py-1.5 rounded-full transition-colors ${statusFilter === v ? "bg-primary text-white" : "bg-muted text-muted-foreground hover:bg-muted/70"}`}>
              {l}
            </button>
          ))}
        </div>

        <SortableTable columns={columns} data={filtered} isLoading={isLoading}
          emptyTitle="Chưa có kế hoạch audit nào" emptyDescription="Tạo kế hoạch đầu tiên để bắt đầu kiểm tra." />
      </div>

      <ConfirmDialog
        open={!!closingId}
        onOpenChange={(o) => !o && setClosingId(null)}
        title="Đóng kế hoạch audit?"
        description="Sau khi đóng, không thể tạo thêm audit mới cho kế hoạch này."
        confirmLabel="Đóng kế hoạch"
        onConfirm={handleClose}
      />
    </div>
  );
}
