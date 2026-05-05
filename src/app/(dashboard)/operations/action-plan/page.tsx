"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Search, Clock, CheckCircle2, AlertTriangle, ChevronRight, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { useActionPlans } from "@/features/action-plan/hooks/use-action-plans";
import { PageHeader } from "@/shared/components/page-header";
import { useAuthStore } from "@/stores/auth.store";
import type { ActionPlan, ActionPlanStatus } from "@/shared/types";

// ---------------------------------------------------------------------------
// Status badge
// ---------------------------------------------------------------------------
const STATUS_CONFIG: Record<ActionPlanStatus, { label: string; className: string }> = {
  draft: { label: "Draft", className: "bg-muted text-muted-foreground" },
  submitted: { label: "Submitted", className: "bg-info-bg text-info border-info/20" },
  in_progress: { label: "In Progress", className: "bg-warning-bg text-warning border-warning/20" },
  closed: { label: "Closed", className: "bg-success-bg text-success border-success/20" },
};

function APStatusBadge({ status }: { status: ActionPlanStatus }) {
  const cfg = STATUS_CONFIG[status];
  return (
    <Badge className={`text-xs font-medium ${cfg.className}`}>
      {cfg.label}
    </Badge>
  );
}

function isOverdue(deadline: string | null | undefined, status: ActionPlanStatus) {
  if (!deadline || status === "closed") return false;
  return new Date(deadline) < new Date();
}

function TableSkeleton() {
  return (
    <>
      {Array.from({ length: 5 }).map((_, i) => (
        <TableRow key={i}>
          {Array.from({ length: 6 }).map((_, j) => (
            <TableCell key={j}><Skeleton className="h-4 w-full" /></TableCell>
          ))}
        </TableRow>
      ))}
    </>
  );
}

// ---------------------------------------------------------------------------
// Stat card
// ---------------------------------------------------------------------------
function Stat({ label, value, icon: Icon, color }: {
  label: string; value: number | string;
  icon: React.ElementType; color: string;
}) {
  return (
    <div className="bg-card border border-border rounded-xl p-4 flex items-center justify-between">
      <div>
        <p className="text-xs text-muted-foreground mb-1">{label}</p>
        <p className={`text-2xl font-semibold ${color}`}>{value}</p>
      </div>
      <div className={`h-10 w-10 rounded-xl flex items-center justify-center bg-current/10 ${color}`}>
        <Icon className="h-5 w-5" />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------
export default function ActionPlanPage() {
  const router = useRouter();
  const { activeRole } = useAuthStore();
  const { data: plans = [], isLoading } = useActionPlans();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<ActionPlanStatus | "all">("all");

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return plans.filter((p: ActionPlan) => {
      if (statusFilter !== "all" && p.status !== statusFilter) return false;
      if (q) {
        const storeName = p.store?.name?.toLowerCase() ?? "";
        const storeCode = p.store?.code?.toLowerCase() ?? "";
        if (!storeName.includes(q) && !storeCode.includes(q)) return false;
      }
      return true;
    });
  }, [plans, search, statusFilter]);

  const counts = useMemo(() => ({
    submitted: plans.filter((p: ActionPlan) => p.status === "submitted").length,
    in_progress: plans.filter((p: ActionPlan) => p.status === "in_progress").length,
    overdue: plans.filter((p: ActionPlan) => isOverdue(p.deadline, p.status)).length,
    closed: plans.filter((p: ActionPlan) => p.status === "closed").length,
  }), [plans]);

  const isQAM = activeRole === "qa_manager";

  return (
    <div className="space-y-5">
      {/* Header */}
      <PageHeader
        title="Action Plans"
        subtitle={`Track corrective action progress across all stores.${isQAM ? " You can close plans once evidence is submitted." : ""}`}
      />

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Stat label="Awaiting Review" value={counts.submitted} icon={ChevronRight} color="text-info" />
        <Stat label="In Progress" value={counts.in_progress} icon={Clock} color="text-warning" />
        <Stat label="Overdue" value={counts.overdue} icon={AlertTriangle} color="text-danger" />
        <Stat label="Closed" value={counts.closed} icon={CheckCircle2} color="text-success" />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by store name or code..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9 text-sm"
          />
        </div>
        <div className="flex gap-1">
          {(["all", "submitted", "in_progress", "closed"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                statusFilter === s
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-background text-muted-foreground border-border hover:border-primary/40"
              }`}
            >
              {s === "all" ? "All" : STATUS_CONFIG[s as ActionPlanStatus].label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40">
              <TableHead className="text-xs font-semibold uppercase tracking-wide text-foreground py-3">Store</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wide text-foreground py-3">Status</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wide text-foreground py-3">Audit Score</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wide text-foreground py-3">Deadline</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wide text-foreground py-3">Evidence</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wide text-foreground py-3 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableSkeleton />
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-12 text-sm">
                  No action plans found.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((plan: ActionPlan) => {
                const overdue = isOverdue(plan.deadline, plan.status);
                return (
                  <TableRow key={plan.id} className="hover:bg-muted/20 transition-colors">
                    <TableCell className="py-3">
                      <div className="font-medium text-sm text-foreground">
                        {plan.store?.name ?? "—"}
                      </div>
                      <div className="text-xs text-muted-foreground font-mono">
                        {plan.store?.code}
                      </div>
                    </TableCell>
                    <TableCell className="py-3">
                      <APStatusBadge status={plan.status} />
                    </TableCell>
                    <TableCell className="py-3">
                      {plan.audit ? (
                        <div>
                          <span className={`text-sm font-semibold ${
                            plan.audit.finalScore >= 85 ? "text-success" :
                            plan.audit.finalScore >= 70 ? "text-warning" : "text-danger"
                          }`}>
                            {plan.audit.finalScore.toFixed(1)}
                          </span>
                          <span className="text-xs text-muted-foreground ml-1">/ 100</span>
                        </div>
                      ) : "—"}
                    </TableCell>
                    <TableCell className="py-3">
                      {plan.deadline ? (
                        <div className={`flex items-center gap-1.5 text-xs font-medium ${overdue ? "text-danger" : "text-foreground"}`}>
                          <Clock className="h-3.5 w-3.5" />
                          {new Date(plan.deadline).toLocaleDateString()}
                          {overdue && <Badge className="bg-danger-bg text-danger text-[9px] font-semibold ml-1">Overdue</Badge>}
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="py-3">
                      <div className="flex items-center gap-2">
                        <Progress
                          value={(plan.evidences?.length ?? 0) > 0 ? 100 : 0}
                          className="h-1.5 w-16"
                        />
                        <span className="text-xs text-muted-foreground">
                          {plan.evidences?.length ?? 0} photo(s)
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="py-3 text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 text-xs gap-1"
                        onClick={() => router.push(`/operations/action-plan/${plan.id}`)}
                      >
                        View <ArrowUpRight className="h-3 w-3" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
        <div className="px-4 py-2 border-t border-border">
          <p className="text-xs text-muted-foreground">
            {filtered.length} action plan(s) shown
          </p>
        </div>
      </div>
    </div>
  );
}
