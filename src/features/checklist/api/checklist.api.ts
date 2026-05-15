import { apiClient } from "@/lib/api-client";
import type { ChecklistSummary, ChecklistDetail } from "@/shared/types";

export const checklistApi = {
  // ── Checklist CRUD ────────────────────────────────────────────────────────
  getChecklists: (status?: string) =>
    apiClient.get<ChecklistSummary[]>(`/checklists${status ? `?status=${status}` : ""}`),

  getChecklist: (id: string) =>
    apiClient.get<ChecklistDetail>(`/checklists/${id}`),

  createChecklist: (data: { name: string; version: string }) =>
    apiClient.post<ChecklistDetail>("/checklists", data),

  updateChecklist: (id: string, data: { name?: string; version?: string }) =>
    apiClient.patch<ChecklistDetail>(`/checklists/${id}`, data),

  // ── Sections ─────────────────────────────────────────────────────────────
  addSection: (checklistId: string, data: {
    name: string;
    groupId: string;
    weight: number;
    order?: number;
  }) => apiClient.post<ChecklistDetail>(`/checklists/${checklistId}/sections`, data),

  updateSection: (checklistId: string, sectionId: string, data: {
    name?: string;
    groupId?: string;
    weight?: number;
    order?: number;
  }) => apiClient.patch<ChecklistDetail>(`/checklists/${checklistId}/sections/${sectionId}`, data),

  // BE returns updated ChecklistDetail after deletion
  deleteSection: (checklistId: string, sectionId: string) =>
    apiClient.delete<ChecklistDetail>(`/checklists/${checklistId}/sections/${sectionId}`),

  // ── Section Items ─────────────────────────────────────────────────────────
  addSectionItem: (checklistId: string, sectionId: string, data: {
    criteriaId: string;
    order?: number;
  }) => apiClient.post<ChecklistDetail>(`/checklists/${checklistId}/sections/${sectionId}/items`, data),

  // BE returns updated ChecklistDetail after deletion
  deleteSectionItem: (checklistId: string, sectionId: string, itemId: string) =>
    apiClient.delete<ChecklistDetail>(`/checklists/${checklistId}/sections/${sectionId}/items/${itemId}`),

  // ── Lifecycle ─────────────────────────────────────────────────────────────
  publishChecklist: (id: string) =>
    apiClient.post<ChecklistDetail>(`/checklists/${id}/publish`, {}),

  archiveChecklist: (id: string) =>
    apiClient.post<ChecklistDetail>(`/checklists/${id}/archive`, {}),
};
