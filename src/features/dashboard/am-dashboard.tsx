"use client";
import { useAnalyticsOverview } from "./hooks/use-analytics";
import { MetricCard } from "@/shared/components/metric-card";
import { ApiClientError } from "@/lib/api-client";

export function AMDashboard() {
  const { data, isLoading, error } = useAnalyticsOverview();

  if (error instanceof ApiClientError && error.statusCode === 403) {
    return (
      <div className="flex items-center justify-center py-16 text-sm text-muted-foreground">
        Không có quyền truy cập analytics cho khu vực này.
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
    </div>
  );
}
