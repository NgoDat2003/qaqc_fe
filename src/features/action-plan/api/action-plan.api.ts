import { apiClient } from "@/lib/api-client";
import { buildQS } from "@/lib/build-qs";
import type { ActionPlan, ListResponse, ListParams } from "@/shared/types";

type ActionPlanStatus = "draft" | "submitted" | "rejected" | "closed";

export const actionPlanApi = {
  getAll: (params?: ListParams & { storeId?: string; status?: ActionPlanStatus }): Promise<ListResponse<ActionPlan>> =>
    apiClient.list<ActionPlan>(`/action-plans${buildQS(params)}`),
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
