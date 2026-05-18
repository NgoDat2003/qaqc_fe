import { apiClient } from "@/lib/api-client";
import { buildQS } from "@/lib/build-qs";
import type { CriteriaGroup, Criteria } from "@/shared/types";

export const criteriaApi = {
  // ── Criteria Groups ──────────────────────────────────────────────────────
  getCriteriaGroups: () =>
    apiClient.get<CriteriaGroup[]>("/criteria-groups"),

  createCriteriaGroup: (data: {
    code: string;
    name: string;
    color?: string | null;
    isActive?: boolean;
  }) => apiClient.post<CriteriaGroup>("/criteria-groups", data),

  updateCriteriaGroup: (id: string, data: {
    name?: string;
    color?: string | null;
    isActive?: boolean;
  }) => apiClient.patch<CriteriaGroup>(`/criteria-groups/${id}`, data),

  // ── Criteria ─────────────────────────────────────────────────────────────
  getCriteria: (params?: { groupId?: string; isActive?: boolean }) =>
    apiClient.get<Criteria[]>(`/criteria${buildQS(params as Record<string, string | number | boolean | undefined>)}`),

  createCriteria: (data: {
    code: string;
    content: string;
    groupId?: string | null; // null for RISK (global, no group)
    deductionPerError?: number;
    maxDeduction?: number;
    flag?: "none" | "critical" | "risk";
    isActive?: boolean;
  }) => apiClient.post<Criteria>("/criteria", data),

  updateCriteria: (id: string, data: {
    content?: string;
    groupId?: string | null; // null for RISK
    deductionPerError?: number;
    maxDeduction?: number;
    flag?: "none" | "critical" | "risk";
    isActive?: boolean;
  }) => apiClient.patch<Criteria>(`/criteria/${id}`, data),
};
