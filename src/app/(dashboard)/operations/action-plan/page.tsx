"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Clock, CheckCircle2, AlertTriangle, ArrowUpRight, ClipboardList } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useActionPlans } from "@/features/action-plan/hooks/use-action-plans";
import {
  PageHeader, StatusBadge, MetricCard, SearchInput, DataTable, PaginationControls,
} from "@/shared/components";
import type { ColumnDef } from "@/shared/components";
import { useAuthStore } from "@/stores/auth.store";
import type { ActionPlan, ActionPlanStatus } from "@/shared/types";

// ---------------------------------------------------------------------------
// Domain helpers
// ---------------------------------------------------------------------------
function isOverdue(deadline: string | null | undefined, status: ActionPlanStatus) {
  if (!deadline || status === "closed") return false;
  return new Date(deadline) < new Date();
}

const STATUS_FILTER_LABELS: Record<ActionPlanStatus, string> = {
  draft: "Draft",
  submitted: "Submitted",
  rejected: "Rejected",
  closed: "Closed",
};

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------
export default function ActionPlanPage() {
  const router = useRouter();
  const { activeRole } = useAuthStore();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<ActionPlanStatus | "all">("all");
  const [page, setPage] = useState(1);

  const { data, isLoading } = useActionPlans({
    page,
    limit: 20,
    status: statusFilter !== "all" ? statusFilter : undefined,
  });
  const plans = data?.data ?? [];
  const meta = data?.meta;

  useEffect(() => { setPage(1); }, [statusFilter]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    if (!q) return plans;
    return plans.filter((p) => {
      const storeName = p.store?.name?.toLowerCase() ?? "";
      const storeCode = p.store?.code?.toLowerCase() ?? "";
      return storeName.includes(q) || storeCode.includes(q);
    });
  }, [plans, search]);

  const counts = useMemo(() => ({
    submitted: plans.filter((p) => p.status === "submitted").length,
    rejected: plans.filter((p) => p.status === "rejected").length,
    overdue: plans.filter((p) => isOverdue(p.deadline, p.status)).length,
    closed: plans.filter((p) => p.status === "closed").length,
  }), [plans]);

  const isQAM = activeRole === "qa_manager";

  const columns = useMemo((): ColumnDef<ActionPlan>[] => [
    {
      header: "Cửa hàng",
      cell: (p) => (
        <div>
          <div className="font-semibold text-foreground">{p.store?.name ?? "—"}</div>
          <div className="text-xs text-muted-foreground font-mono">{p.store?.code}</div>
        </div>
      ),
    },
    {
      header: "Trạng thái",
      cell: (p) => <StatusBadge status={p.status} />,
      className: "w-36",
    },
    {
      header: "Điểm audit",
      cell: (p) => p.audit ? (
        <div>
          <span className={`text-sm font-semibold ${
            p.audit.finalScore >= 85 ? "text-success" :
            p.audit.finalScore >= 70 ? "text-warning" : "text-danger"
          }`}>
            {p.audit.finalScore.toFixed(1)}
          </span>
          <span className="text-xs text-muted-foreground ml-1">/ 100</span>
        </div>
      ) : <span className="text-muted-foreground">—</span>,
      className: "w-32",
    },
    {
      header: "Deadline",
      cell: (p) => {
        const overdue = isOverdue(p.deadline, p.status);
        return p.deadline ? (
          <div className={`flex items-center gap-1.5 text-xs font-medium ${overdue ? "text-danger" : "text-foreground"}`}>
            <Clock className="h-3.5 w-3.5" />
            {new Date(p.deadline).toLocaleDateString("vi-VN")}
            {overdue && (
              <Badge className="bg-danger-bg text-danger text-[9px] font-semibold ml-1">Quá hạn</Badge>
            )}
          </div>
        ) : <span className="text-xs text-muted-foreground">—</span>;
      },
      className: "w-44",
    },
    {
      header: "Bằng chứng",
      hideOnMobile: true,
      cell: (p) => (
        <div className="flex items-center gap-2">
          <Progress value={(p.evidences?.length ?? 0) > 0 ? 100 : 0} className="h-1.5 w-16" />
          <span className="text-xs text-muted-foreground">{p.evidences?.length ?? 0} ảnh</span>
        </div>
      ),
      className: "w-36",
    },
    {
      header: "Xem",
      cell: (p) => (
        <Button
          variant="outline"
          size="sm"
          className="h-7 text-xs gap-1"
          onClick={(e) => { e.stopPropagation(); router.push(`/operations/action-plan/${p.id}`); }}
        >
          View <ArrowUpRight className="h-3 w-3" />
        </Button>
      ),
      className: "w-20",
    },
  ], [router]);

  return (
    <div className="space-y-5">
      <PageHeader
        title="Action Plans"
        subtitle={`Theo dõi tiến độ khắc phục sự cố trên toàn hệ thống.${isQAM ? " Bạn có thể đóng plan khi bằng chứng đã được nộp." : ""}`}
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <MetricCard label="Chờ duyệt" value={counts.submitted} icon={ClipboardList} variant="info" />
        <MetricCard label="Bị từ chối" value={counts.rejected} icon={AlertTriangle} variant="danger" />
        <MetricCard label="Quá hạn" value={counts.overdue} icon={Clock} variant="warning" />
        <MetricCard label="Đã đóng" value={counts.closed} icon={CheckCircle2} variant="success" />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Tìm theo tên hoặc mã cửa hàng..."
          className="flex-1 min-w-48"
        />
        <div className="flex gap-1">
          {(["all", "submitted", "rejected", "closed"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                statusFilter === s
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-background text-muted-foreground border-border hover:border-primary/40"
              }`}
            >
              {s === "all" ? "Tất cả" : STATUS_FILTER_LABELS[s as ActionPlanStatus]}
            </button>
          ))}
        </div>
      </div>

      <DataTable<ActionPlan>
        columns={columns}
        data={filtered}
        isLoading={isLoading}
        emptyTitle="Chưa có action plan"
        emptyDescription="Các action plan sẽ xuất hiện sau khi hoàn thành audit."
        footerContent={
          meta && meta.totalPages > 1 ? (
            <PaginationControls page={meta.page} totalPages={meta.totalPages} total={meta.total} onPageChange={setPage} />
          ) : (
            <p className="text-xs text-muted-foreground">{meta?.total ?? filtered.length} action plan(s)</p>
          )
        }
      />
    </div>
  );
}
