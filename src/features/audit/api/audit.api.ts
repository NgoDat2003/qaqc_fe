import { apiClient } from "@/lib/api-client";
import type {
  AuditPlanFull,
  MyAssignment,
  AuditSession,
  AuditHistoryBundle,
  AuditWriteBody,
  SubmitAuditResponse,
  AuditResultListItem,
  AuditResultDetail,
  CorrectionRequestDto,
  AuditCorrectionResponse,
  ActionPlanDetail,
  ActionPlanStatus,
  AuditViolationWrite,
} from "@/shared/types";

export const auditApi = {
  getAuditPlans: () =>
    apiClient.get<AuditPlanFull[]>("/audit-plans"),

  getAuditPlan: (id: string) =>
    apiClient.get<AuditPlanFull>(`/audit-plans/${id}`),

  createAuditPlan: (data: {
    name: string;
    formId: string;
    startDate: string;
    endDate: string;
    assignments: Array<{ storeId: string; auditorId: string }>;
  }) => apiClient.post<AuditPlanFull>("/audit-plans", data),

  closeAuditPlan: (id: string) =>
    apiClient.post<AuditPlanFull>(`/audit-plans/${id}/close`, {}),

  updateAuditPlan: (id: string, data: {
    name?: string;
    formId?: string;
    startDate?: string;
    endDate?: string;
    assignments?: Array<{ storeId: string; auditorId: string }>;
  }) => apiClient.patch<AuditPlanFull>(`/audit-plans/${id}`, data),

  publishAuditPlan: (id: string) =>
    apiClient.post<AuditPlanFull>(`/audit-plans/${id}/publish`, {}),

  updateAssignment: (planId: string, assignmentId: string, data: { auditorId: string }) =>
    apiClient.patch<AuditPlanFull>(`/audit-plans/${planId}/assignments/${assignmentId}`, data),

  removeAssignment: (planId: string, assignmentId: string) =>
    apiClient.delete<AuditPlanFull>(`/audit-plans/${planId}/assignments/${assignmentId}`),

  // QC auditor only — BE reads x-user-id from cookie, no extra param needed
  getMyAssignments: () =>
    apiClient.get<MyAssignment[]>("/audit-plans/my-assignments"),

  // --- QC Audit Execution ---
  getAuditSession: (assignmentId: string) =>
    apiClient.get<AuditSession>(`/audits/assignments/${assignmentId}`),

  getAuditHistory: (assignmentId: string) =>
    apiClient.get<AuditHistoryBundle>(`/audits/assignments/${assignmentId}/history`),

  saveDraft: (body: AuditWriteBody) =>
    apiClient.patch<void>("/audits/draft", body),

  submitAudit: (body: AuditWriteBody) =>
    apiClient.post<SubmitAuditResponse>("/audits/submit", body),

  // --- Audit Results ---
  getAuditResults: () =>
    apiClient.get<AuditResultListItem[]>("/audits"),

  getAuditResultDetail: (id: string) =>
    apiClient.get<AuditResultDetail>(`/audits/${id}`),

  // --- Correction Requests ---
  createCorrectionRequest: (auditId: string, reason: string) =>
    apiClient.post<CorrectionRequestDto>(`/audits/${auditId}/correction-requests`, { reason }),

  approveCorrectionRequest: (requestId: string, reviewNote?: string) =>
    apiClient.post<void>(`/audit-correction-requests/${requestId}/approve`, { reviewNote }),

  rejectCorrectionRequest: (requestId: string, reviewNote: string) =>
    apiClient.post<void>(`/audit-correction-requests/${requestId}/reject`, { reviewNote }),

  applyAuditCorrection: (auditId: string, data: { editNote: string; violations: AuditViolationWrite[] }) =>
    apiClient.patch<AuditCorrectionResponse>(`/audits/${auditId}/correction`, data),

  // --- Action Plans ---
  createActionPlan: (auditId: string) =>
    apiClient.post<ActionPlanDetail>(`/audits/${auditId}/action-plan`, {}),

  getActionPlans: (status?: ActionPlanStatus) =>
    apiClient.get<ActionPlanDetail[]>(`/action-plans${status ? `?status=${status}` : ""}`),

  getActionPlan: (id: string) =>
    apiClient.get<ActionPlanDetail>(`/action-plans/${id}`),

  updateActionPlan: (
    id: string,
    items: Array<{
      itemId: string;
      rootCause?: string | null;
      remediation?: string | null;
      fixedAt?: string | null;
      assigneeName?: string | null;
      imageIds?: string[];
    }>
  ) => apiClient.patch<ActionPlanDetail>(`/action-plans/${id}`, { items }),

  submitActionPlan: (id: string) =>
    apiClient.post<ActionPlanDetail>(`/action-plans/${id}/submit`, {}),

  rejectActionPlan: (id: string, reviewNote: string) =>
    apiClient.post<ActionPlanDetail>(`/action-plans/${id}/reject`, { reviewNote }),

  closeActionPlan: (id: string) =>
    apiClient.post<ActionPlanDetail>(`/action-plans/${id}/close`, {}),
};
