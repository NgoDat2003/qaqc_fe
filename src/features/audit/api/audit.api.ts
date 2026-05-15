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
    assignments: Array<{ storeId: string; auditorId: string; scheduledDate: string }>;
  }) => apiClient.post<AuditPlanFull>("/audit-plans", data),

  closeAuditPlan: (id: string) =>
    apiClient.post<AuditPlanFull>(`/audit-plans/${id}/close`, {}),

  // QC auditor only — BE reads x-user-id from cookie, no extra param needed
  getMyAssignments: () =>
    apiClient.get<MyAssignment[]>("/audit-plans/my-assignments"),
};
