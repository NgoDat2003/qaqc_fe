import { apiClient } from "@/lib/api-client";
import type { ActionPlan } from "@/shared/types";

export const actionPlanApi = {
  getAll: (params?: Record<string, string>) => {
    const qs = params ? `?${new URLSearchParams(params).toString()}` : "";
    return apiClient.get<ActionPlan[]>(`/action-plans${qs}`);
  },
  getOne: (id: string) => apiClient.get<ActionPlan>(`/action-plans/${id}`),
  update: (id: string, data: { actionDescription: string; deadline?: string }) =>
    apiClient.patch<ActionPlan>(`/action-plans/${id}`, data),
  submit: (id: string) =>
    apiClient.post<ActionPlan>(`/action-plans/${id}/submit`, {}),
  // QAM review: action="confirm" closes AP, action="reject" rejects it
  review: (id: string, data: { action: "confirm" | "reject"; reviewNote?: string }) =>
    apiClient.post<ActionPlan>(`/action-plans/${id}/confirm`, data),
  close: (id: string) =>
    apiClient.post<ActionPlan>(`/action-plans/${id}/close`, {}),
};
