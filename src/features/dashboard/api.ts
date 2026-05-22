import { useQuery } from '@tanstack/react-query';
import { ApiClientError, apiClient } from '@/lib/api-client';
import { buildQS } from '@/lib/build-qs';
import { BLANK_DASHBOARD, BLANK_FILTER_OPTIONS } from './constants';
import type { AdminDashboardFilters, DashboardData, DashboardFilterOptions, DashboardScope, DashboardStatus, QamDashboardFilters, TimeRange } from './types';
import { getAdminQueryParams, getDateParams, getQamQueryParams } from './utils';

export function useDashboardData(
  scope: DashboardScope | null,
  range: TimeRange,
  status: DashboardStatus,
  qamFilters?: QamDashboardFilters,
  adminFilters?: AdminDashboardFilters,
) {
  return useQuery<DashboardData>({
    queryKey: ["dashboard", scope, range, status, qamFilters, adminFilters],
    enabled: !!scope,
    staleTime: 30_000,
    queryFn: async () => {
      if (!scope) return BLANK_DASHBOARD;
      try {
        const qs =
          scope === "qam" && qamFilters
            ? buildQS(getQamQueryParams(qamFilters))
            : scope === "admin" && adminFilters
              ? buildQS(getAdminQueryParams(adminFilters))
              : buildQS({
                  ...getDateParams(range),
                  status: status === "all" ? undefined : status,
                });
        return await apiClient.get<DashboardData>(`/dashboard/${scope}${qs}`);
      } catch (error) {
        if (
          error instanceof ApiClientError &&
          [403, 404].includes(error.statusCode)
        ) {
          return BLANK_DASHBOARD;
        }
        throw error;
      }
    },
  });
}

export function useDashboardFilterOptions(scope: DashboardScope | null) {
  return useQuery<DashboardFilterOptions>({
    queryKey: ["dashboard-filters", scope],
    enabled: scope === "qam" || scope === "admin",
    staleTime: 60_000,
    queryFn: async () => {
      if (scope !== "qam" && scope !== "admin") return BLANK_FILTER_OPTIONS;
      return await apiClient.get<DashboardFilterOptions>(
        `/dashboard/filters?scope=${scope}`,
      );
    },
  });
}
