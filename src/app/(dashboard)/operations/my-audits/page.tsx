"use client";
import Link from "next/link";
import { Calendar, Store, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useMyAssignments } from "@/features/audit";
import type { AuditAssignment } from "@/shared/types";

const STATUS_BADGE: Record<
  AuditAssignment["status"],
  { label: string; cls: string }
> = {
  pending:     { label: "Chờ thực hiện", cls: "bg-amber-50 text-amber-700 border-amber-200" },
  in_progress: { label: "Đang làm",      cls: "bg-blue-50 text-blue-700 border-blue-200"   },
  completed:   { label: "Đã hoàn thành", cls: "bg-green-50 text-green-700 border-green-200" },
};

function AssignmentSkeleton() {
  return (
    <div className="rounded-xl border border-border bg-card p-4 space-y-2">
      <Skeleton className="h-5 w-48" />
      <Skeleton className="h-4 w-32" />
      <Skeleton className="h-4 w-24" />
    </div>
  );
}

export default function MyAuditsPage() {
  const { data: assignments, isLoading } = useMyAssignments();

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-semibold mb-1">Audit Của Tôi</h1>
      <p className="text-muted-foreground text-sm mb-6">
        Danh sách audit được giao cho tôi
      </p>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <AssignmentSkeleton key={i} />
          ))}
        </div>
      ) : !assignments?.length ? (
        <p className="text-muted-foreground text-sm">Không có audit nào được giao.</p>
      ) : (
        <div className="space-y-3">
          {assignments.map((a) => {
            const badge = STATUS_BADGE[a.status];
            const canExecute = a.status === "pending" || a.status === "in_progress";
            const card = (
              <div className="rounded-xl border border-border bg-card p-4 flex items-center gap-4 hover:bg-accent/50 transition-colors">
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-sm truncate">
                      {a.plan?.name ?? `Kế hoạch #${a.planId.slice(0, 6)}`}
                    </span>
                    <Badge
                      variant="outline"
                      className={`text-[10px] shrink-0 ${badge.cls}`}
                    >
                      {badge.label}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                    <span className="flex items-center gap-1">
                      <Store className="h-3 w-3" />
                      {a.store?.name ?? a.storeId}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(a.scheduledDate).toLocaleDateString("vi-VN")}
                    </span>
                  </div>
                </div>
                {canExecute && <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />}
              </div>
            );

            return canExecute ? (
              <Link key={a.id} href={`/operations/audits/${a.id}/execute`}>
                {card}
              </Link>
            ) : (
              <div key={a.id}>{card}</div>
            );
          })}
        </div>
      )}
    </div>
  );
}
