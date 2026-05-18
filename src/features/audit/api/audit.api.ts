import { apiClient } from "@/lib/api-client";
import type { AuditPlanFull, MyAssignment } from "@/shared/types";

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
};
