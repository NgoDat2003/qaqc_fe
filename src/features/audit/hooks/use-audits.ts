import { useQuery } from "@tanstack/react-query";
import { auditApi } from "../api/audit.api";

export function useAudits(params?: Record<string, string>) {
  return useQuery({
    queryKey: ["audits", params],
    queryFn: () => auditApi.getAudits(params),
  });
}

export function useAudit(id: string) {
  return useQuery({
    queryKey: ["audits", id],
    queryFn: () => auditApi.getAuditDetail(id),
    enabled: !!id,
  });
}

export function useAuditChecklist(assignmentId: string) {
  return useQuery({
    queryKey: ["audit-checklist", assignmentId],
    queryFn: () => auditApi.getAuditChecklist(assignmentId),
    enabled: !!assignmentId,
  });
}
