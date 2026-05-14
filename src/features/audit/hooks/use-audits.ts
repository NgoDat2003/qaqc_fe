import { useQuery, keepPreviousData } from "@tanstack/react-query";
import type { ListResponse, Audit } from "@/shared/types";
import { auditApi } from "../api/audit.api";

type AuditListParams = { page?: number; limit?: number; storeId?: string };

export function useAudits(params?: AuditListParams) {
  return useQuery<ListResponse<Audit>>({
    queryKey: ["audits", params],
    queryFn: () => auditApi.getAudits(params),
    placeholderData: keepPreviousData,
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
