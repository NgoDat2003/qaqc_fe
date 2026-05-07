import { apiClient } from "@/lib/api-client";
import { Audit, AuditPlan, AuditAssignment, ChecklistForm, AuditDraft, ScorePreview } from "@/shared/types";

export const auditApi = {
  // Planning
  getPlans: () => apiClient.get<AuditPlan[]>("/audit-plans"),
  getPlan: (id: string) => apiClient.get<AuditPlan>(`/audit-plans/${id}`),
  createPlan: (data: Partial<AuditPlan>) => apiClient.post<AuditPlan>("/audit-plans", data),
  closePlan: (id: string) => apiClient.post(`/audit-plans/${id}/close`, {}),
  
  // Assignments
  getMyAssignments: () => apiClient.get<AuditAssignment[]>("/audit-plans/my-assignments"),

  // Execution
  getAuditChecklist: (id: string) => apiClient.get<ChecklistForm>(`/audits/${id}/checklist`),
  calculateScore: (data: AuditDraft) => apiClient.post<ScorePreview[]>("/audits/calculate", data),
  saveDraft: (data: AuditDraft) => apiClient.patch<Audit>("/audits/draft", data),
  submitAudit: (data: AuditDraft) => apiClient.post<Audit>("/audits/submit", data),

  // Results
  getAudits: (params?: Record<string, string>) => {
    const qs = params ? `?${new URLSearchParams(params).toString()}` : "";
    return apiClient.get<Audit[]>(`/audits${qs}`);
  },
  getAuditDetail: (id: string) => apiClient.get<Audit>(`/audits/${id}`),
};
