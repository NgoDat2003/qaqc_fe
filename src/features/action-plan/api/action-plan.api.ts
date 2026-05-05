import { apiClient } from "@/lib/api-client";
import type { ActionPlan } from "@/shared/types";

export const actionPlanApi = {
  getAll: (params?: Record<string, string>) => {
    const qs = params ? `?${new URLSearchParams(params).toString()}` : "";
    return apiClient.get<ActionPlan[]>(`/action-plans${qs}`);
  },

  getOne: (id: string) =>
    apiClient.get<ActionPlan>(`/action-plans/${id}`),

  update: (id: string, data: { remediation?: string; deadline?: string }) =>
    apiClient.patch<ActionPlan>(`/action-plans/${id}`, data),

  // SM submits plan (draft → submitted)
  submit: (id: string) =>
    apiClient.post<ActionPlan>(`/action-plans/${id}/submit`, {}),

  // QAM confirms plan (submitted → in_progress)
  confirm: (id: string) =>
    apiClient.post<ActionPlan>(`/action-plans/${id}/confirm`, {}),

  // QAM closes plan (in_progress → closed) — requires evidence
  close: (id: string, data: { evidenceIds: string[]; note?: string }) =>
    apiClient.post<ActionPlan>(`/action-plans/${id}/close`, data),
};
