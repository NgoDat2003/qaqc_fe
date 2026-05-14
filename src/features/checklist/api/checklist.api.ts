import { apiClient } from "@/lib/api-client";
import { buildQS } from "@/lib/build-qs";
import type {
  ChecklistForm,
  ChecklistSection,
  ChecklistSectionItem,
  ChecklistSummary,
  ListResponse,
  ListParams,
} from "@/shared/types";

export const checklistApi = {
  // Forms
  getForms: (params?: ListParams & { status?: string }): Promise<ListResponse<ChecklistSummary>> =>
    apiClient.list<ChecklistSummary>(`/checklists${buildQS(params)}`),
  getForm: (id: string) =>
    apiClient.get<ChecklistForm>(`/checklists/${id}`),
  createForm: (data: Pick<ChecklistForm, "name" | "version">) =>
    apiClient.post<ChecklistForm>("/checklists", data),
  updateForm: (id: string, data: Partial<Pick<ChecklistForm, "name" | "version">>) =>
    apiClient.patch<ChecklistForm>(`/checklists/${id}`, data),
  publishForm: (id: string) =>
    apiClient.post<ChecklistForm>(`/checklists/${id}/publish`, {}),
  archiveForm: (id: string) =>
    apiClient.patch<ChecklistForm>(`/checklists/${id}/archive`, {}),

  // Sections
  addSection: (formId: string, data: { name: string; groupId: string; order?: number }) =>
    apiClient.post<ChecklistSection>(`/checklists/${formId}/sections`, data),

  // Section Items
  addItem: (formId: string, sectionId: string, data: { criteriaId: string; order?: number }) =>
    apiClient.post<ChecklistSectionItem>(
      `/checklists/${formId}/sections/${sectionId}/items`,
      data
    ),
};
