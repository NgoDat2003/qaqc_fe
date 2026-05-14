import { apiClient } from "@/lib/api-client";
import { buildQS } from "@/lib/build-qs";
import type { Audit, AuditPlan, AuditPlanSummary, AuditAssignment, ChecklistForm, AuditDraft, SubmitAuditResponse, ListResponse, ListParams } from "@/shared/types";

export const auditApi = {
  // Planning
  getPlans: (params?: ListParams): Promise<ListResponse<AuditPlanSummary>> =>
    apiClient.list<AuditPlanSummary>(`/audit-plans${buildQS(params)}`),
  getPlan: (id: string) => apiClient.get<AuditPlan>(`/audit-plans/${id}`),
  createPlan: (data: Partial<AuditPlan>) => apiClient.post<AuditPlan>("/audit-plans", data),
  closePlan: (id: string) => apiClient.post(`/audit-plans/${id}/close`, {}),

  // Assignments
  getMyAssignments: () => apiClient.get<AuditAssignment[]>("/audit-plans/my-assignments"),

  // Execution
  getAuditChecklist: (id: string) => apiClient.get<ChecklistForm>(`/audits/${id}/checklist`),
  submitAudit: (data: AuditDraft) => apiClient.post<SubmitAuditResponse>("/audits/submit", data),

  // Results
  getAudits: (params?: ListParams & { storeId?: string }): Promise<ListResponse<Audit>> =>
    apiClient.list<Audit>(`/audits${buildQS(params)}`),
  getAuditDetail: (id: string) => apiClient.get<Audit>(`/audits/${id}`),
};
