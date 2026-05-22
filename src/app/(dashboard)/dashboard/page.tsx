"use client";

import * as React from "react";
import { useAuthStore } from "@/stores/auth.store";
import { BLANK_DASHBOARD, BLANK_FILTER_OPTIONS } from "@/features/dashboard/constants";
import type { AdminDashboardFilters, DashboardStatus, QamDashboardFilters, TimeRange } from "@/features/dashboard/types";
import { useDashboardData, useDashboardFilterOptions } from "@/features/dashboard/api";
import { buildOperationalKpis, DashboardMetricCard, DashboardPanel, EmptyBlock, FilterBar, RoleHeader } from "@/features/dashboard/components/dashboard-shared";
import { AdminDashboardView } from "@/features/dashboard/components/admin-dashboard";
import { AdminFilterBar } from "@/features/dashboard/components/admin-filter-bar";
import { QamDashboardView, QamFilterBar } from "@/features/dashboard/components/qam-dashboard";
import { RoleDashboardSections } from "@/features/dashboard/components/role-dashboard-sections";
import { getCurrentMonthRange, scopeFromRole } from "@/features/dashboard/utils";

export default function DashboardPage() {
  const activeRole = useAuthStore((state) => state.activeRole);
  const [timeRange, setTimeRange] = React.useState<TimeRange>("month");
  const [status, setStatus] = React.useState<DashboardStatus>("all");
  const [qamFilters, setQamFilters] = React.useState<QamDashboardFilters>(
    () => ({
      ...getCurrentMonthRange(),
      statusMode: "all",
    }),
  );
  const [adminFilters, setAdminFilters] = React.useState<AdminDashboardFilters>(
    () => ({
      ...getCurrentMonthRange(),
      statusMode: "all",
    }),
  );
  const scope = scopeFromRole(activeRole);
  const { data = BLANK_DASHBOARD, isLoading } = useDashboardData(
    scope,
    timeRange,
    status,
    qamFilters,
    adminFilters,
  );
  const { data: filterOptions = BLANK_FILTER_OPTIONS } =
    useDashboardFilterOptions(scope);
  const { summary, charts, tables } = data;

  const isAdmin = scope === "admin";
  const isQam = scope === "qam";
  const isQc = scope === "qc";
  const isAm = scope === "am";
  const isSm = scope === "sm";
  const kpis = buildOperationalKpis(summary);
  const resetQamFilters = () =>
    setQamFilters({ ...getCurrentMonthRange(), statusMode: "all" });
  const resetAdminFilters = () =>
    setAdminFilters({ ...getCurrentMonthRange(), statusMode: "all" });

  return (
    <div className="space-y-6">
      <RoleHeader
        role={activeRole}
        scope={scope}
        generatedAt={data.generatedAt}
        isLoading={isLoading}
      />
      {isAdmin ? (
        <AdminFilterBar
          filters={adminFilters}
          options={filterOptions}
          onChange={(patch) =>
            setAdminFilters((current) => ({ ...current, ...patch }))
          }
          onReset={resetAdminFilters}
        />
      ) : isQam ? (
        <QamFilterBar
          filters={qamFilters}
          options={filterOptions}
          onChange={(patch) =>
            setQamFilters((current) => ({ ...current, ...patch }))
          }
          onReset={resetQamFilters}
        />
      ) : (
        <FilterBar
          scope={scope}
          timeRange={timeRange}
          status={status}
          onTimeRangeChange={setTimeRange}
          onStatusChange={setStatus}
        />
      )}

      {isAdmin ? (
        <AdminDashboardView summary={summary} charts={charts} tables={tables} />
      ) : isQam ? (
        <QamDashboardView summary={summary} charts={charts} tables={tables} />
      ) : (
        <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
          {kpis.map((kpi) => (
            <DashboardMetricCard key={kpi.label} kpi={kpi} />
          ))}
        </section>
      )}

      <RoleDashboardSections
        summary={summary}
        charts={charts}
        tables={tables}
        isAdmin={false}
        isQc={isQc}
        isAm={isAm}
        isSm={isSm}
      />

      {!scope && (
        <DashboardPanel title="Chưa xác định role">
          <EmptyBlock text="Không tìm thấy dashboard scope cho active role hiện tại." />
        </DashboardPanel>
      )}
    </div>
  );
}
