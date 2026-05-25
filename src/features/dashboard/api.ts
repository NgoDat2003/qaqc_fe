import { useQuery } from "@tanstack/react-query";
import { ApiClientError, apiClient } from "@/lib/api-client";
import { buildQS } from "@/lib/build-qs";
import { BLANK_DASHBOARD, BLANK_FILTER_OPTIONS } from "./constants";
import type {
  AdminDashboardFilters,
  AmDashboardFilters,
  DashboardData,
  DashboardFilterOptions,
  DashboardScope,
  DashboardStatus,
  QamDashboardFilters,
  SmDashboardFilters,
  TimeRange,
} from "./types";
import {
  getAdminQueryParams,
  getAmQueryParams,
  getDateParams,
  getQamQueryParams,
  getSmQueryParams,
} from "./utils";

export function useDashboardData(
  scope: DashboardScope | null,
  range: TimeRange,
  status: DashboardStatus,
  qamFilters?: QamDashboardFilters,
  adminFilters?: AdminDashboardFilters,
  smFilters?: SmDashboardFilters,
  amFilters?: AmDashboardFilters,
) {
  return useQuery<DashboardData>({
    queryKey: [
      "dashboard",
      scope,
      range,
      status,
      qamFilters,
      adminFilters,
      smFilters,
      amFilters,
    ],
    enabled: !!scope,
    staleTime: 30_000,
    queryFn: async () => {
      if (!scope) return BLANK_DASHBOARD;
      try {
        let qs = buildQS({
          ...getDateParams(range),
          status: status === "all" ? undefined : status,
        });

        if (scope === "qam" && qamFilters) {
          qs = buildQS(getQamQueryParams(qamFilters));
        } else if (scope === "admin" && adminFilters) {
          qs = buildQS(getAdminQueryParams(adminFilters));
        } else if (scope === "sm" && smFilters) {
          qs = buildQS(getSmQueryParams(smFilters));
        } else if (scope === "am" && amFilters) {
          qs = buildQS(getAmQueryParams(amFilters));
        }

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
    enabled:
      scope === "qam" || scope === "admin" || scope === "sm" || scope === "am",
    staleTime: 60_000,
    queryFn: async () => {
      if (
        scope !== "qam" &&
        scope !== "admin" &&
        scope !== "sm" &&
        scope !== "am"
      ) {
        return BLANK_FILTER_OPTIONS;
      }
      return (
        (await apiClient.get<DashboardFilterOptions>(
          `/dashboard/filters?scope=${scope}`,
        )) ?? BLANK_FILTER_OPTIONS
      );
    },
  });
}
