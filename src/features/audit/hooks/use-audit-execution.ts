import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { AuditSession, AuditHistoryBundle, AuditWriteBody, SubmitAuditResponse } from "@/shared/types";
import { auditApi } from "../api/audit.api";

export function useAuditSession(assignmentId: string) {
  return useQuery<AuditSession>({
    queryKey: ["audit-session", assignmentId],
    queryFn: () => auditApi.getAuditSession(assignmentId),
    staleTime: 0, // always fresh — avoids stale state after 409 refetch
    enabled: !!assignmentId,
  });
}

export function useAuditHistory(assignmentId: string, options?: { enabled?: boolean }) {
  return useQuery<AuditHistoryBundle>({
    queryKey: ["audit-history", assignmentId],
    queryFn: () => auditApi.getAuditHistory(assignmentId),
    staleTime: 60_000,
    enabled: !!assignmentId && (options?.enabled ?? true),
  });
}

export function useSaveDraft() {
  return useMutation<void, Error, AuditWriteBody>({
    mutationFn: auditApi.saveDraft,
    // fire-and-forget: no invalidation needed, FE holds local state
  });
}

export function useSubmitAudit() {
  const qc = useQueryClient();
  return useMutation<SubmitAuditResponse, Error, AuditWriteBody>({
    mutationFn: auditApi.submitAudit,
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ["audit-session", vars.assignmentId] });
      qc.invalidateQueries({ queryKey: ["my-assignments"] });
    },
  });
}
