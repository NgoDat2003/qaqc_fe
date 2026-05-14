"use client";
import { useMyAssignments } from "@/features/audit/hooks/use-audit-plans";
import Link from "next/link";
import { Calendar, ChevronRight, ClipboardList } from "lucide-react";

export function QCDashboard() {
  const { data: assignments, isLoading } = useMyAssignments();
  const pending = assignments?.filter((a) => a.status === "pending") ?? [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16 text-sm text-muted-foreground">
        Đang tải...
      </div>
    );
  }

  if (pending.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 py-16 text-sm text-muted-foreground">
        <ClipboardList className="h-8 w-8 opacity-40" />
        <p>Không có audit nào đang chờ thực hiện.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h2 className="text-sm font-semibold text-foreground">
        Audit Đang Chờ ({pending.length})
      </h2>
      <div className="divide-y rounded-lg border bg-card">
        {pending.map((assignment) => (
          <Link
            key={assignment.id}
            href={`/operations/audits/${assignment.id}/execute`}
            className="flex items-center justify-between px-4 py-3 hover:bg-muted/50 transition-colors"
          >
            <div className="flex flex-col gap-0.5">
              <span className="text-sm font-medium text-foreground">
                {assignment.store?.name ?? assignment.storeId}
              </span>
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Calendar className="h-3 w-3" />
                {new Date(assignment.scheduledDate).toLocaleDateString("vi-VN")}
              </span>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </Link>
        ))}
      </div>
    </div>
  );
}
