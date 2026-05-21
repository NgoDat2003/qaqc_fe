import { useQuery } from '@tanstack/react-query';
import { ApiClientError, apiClient } from '@/lib/api-client';
import { buildQS } from '@/lib/build-qs';
import { BLANK_DASHBOARD, BLANK_FILTER_OPTIONS } from './constants';
import type { DashboardData, DashboardFilterOptions, DashboardScope, DashboardStatus, QamDashboardFilters, TimeRange } from './types';
import { getDateParams, getQamQueryParams } from './utils';

export function useDashboardData(
  scope: DashboardScope | null,
  range: TimeRange,
  status: DashboardStatus,
  qamFilters?: QamDashboardFilters,
) {
  return useQuery<DashboardData>({
    queryKey: ["dashboard", scope, range, status, qamFilters],
    enabled: !!scope,
    staleTime: 30_000,
    queryFn: async () => {
      if (!scope) return BLANK_DASHBOARD;
      try {
        const qs =
          scope === "qam" && qamFilters
            ? buildQS(getQamQueryParams(qamFilters))
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
    enabled: scope === "qam",
    staleTime: 60_000,
    queryFn: async () => {
      if (scope !== "qam") return BLANK_FILTER_OPTIONS;
      return await apiClient.get<DashboardFilterOptions>(
        "/dashboard/filters?scope=qam",
      );
    },
  });
}
