"use client";
import { useAnalyticsOverview } from "./hooks/use-analytics";
import { MetricCard } from "@/shared/components/metric-card";
import { ApiClientError } from "@/lib/api-client";
import type { AnalyticsOverview } from "@/shared/types";

type RecentAudit = NonNullable<AnalyticsOverview["recentAudits"]>[number];

const GRADE_VARIANT: Record<string, "success" | "warning" | "danger"> = {
  excellent: "success",
  good: "success",
  pass: "warning",
  fail: "danger",
  alarm: "danger",
};

const GRADE_LABEL: Record<string, string> = {
  excellent: "Xuất sắc",
  good: "Tốt",
  pass: "Đạt",
  fail: "Không đạt",
  alarm: "Cảnh báo",
};

function GradeBadge({ grade }: { grade: string }) {
  const variant = GRADE_VARIANT[grade] ?? "warning";
  const classes = {
    success: "bg-green-100 text-green-700",
    warning: "bg-amber-100 text-amber-700",
    danger: "bg-red-100 text-red-700",
  }[variant];
  return (
    <span className={`inline-flex items-center rounded px-2 py-0.5 text-xs font-medium ${classes}`}>
      {GRADE_LABEL[grade] ?? grade}
    </span>
  );
}

function RecentAuditsTable({ audits }: { audits: RecentAudit[] }) {
  return (
    <div className="rounded-lg border bg-card">
      <div className="px-4 py-3 border-b">
        <h3 className="text-sm font-semibold text-foreground">Audit Gần Đây</h3>
      </div>
      <div className="divide-y">
        {audits.map((audit) => (
          <div key={audit.id} className="flex items-center justify-between px-4 py-3 text-sm">
            <span className="font-medium text-foreground">
              {audit.store?.name ?? audit.storeId}
            </span>
            <div className="flex items-center gap-3">
              <span className="text-muted-foreground">{audit.finalScore.toFixed(1)}</span>
              <GradeBadge grade={audit.grade} />
              <span className="text-xs text-muted-foreground">
                {new Date(audit.submittedAt).toLocaleDateString("vi-VN")}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function FullSystemDashboard() {
  const { data, isLoading, error } = useAnalyticsOverview();

  if (error instanceof ApiClientError && error.statusCode === 403) {
    return (
      <div className="flex items-center justify-center h-48 text-sm text-muted-foreground">
        Không có quyền truy cập dữ liệu tổng quan.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <MetricCard
          label="Tổng Audit"
          value={isLoading ? "—" : (data?.totalAudits ?? 0)}
        />
        <MetricCard
          label="Điểm Trung Bình"
          value={isLoading ? "—" : (data?.avgScore?.toFixed(1) ?? "—")}
        />
        <MetricCard
          label="Pass Rate"
          value={isLoading ? "—" : (data ? `${Math.round(data.passRate * 100)}%` : "—")}
          variant={data && data.passRate >= 0.8 ? "success" : "warning"}
        />
        <MetricCard
          label="Cần Cải Thiện"
          value={isLoading ? "—" : (data?.failCount ?? 0)}
          variant={data && data.failCount > 0 ? "danger" : "default"}
        />
      </div>
      {data?.recentAudits && data.recentAudits.length > 0 && (
        <RecentAuditsTable audits={data.recentAudits} />
      )}
    </div>
  );
}
