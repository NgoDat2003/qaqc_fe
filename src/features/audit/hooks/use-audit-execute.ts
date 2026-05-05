import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { auditApi } from "../api/audit.api";
import { AuditDraft } from "@/shared/types";

export function useAuditChecklist(assignmentId: string) {
  return useQuery({
    queryKey: ["audit-checklist", assignmentId],
    queryFn: () => auditApi.getAuditChecklist(assignmentId),
    enabled: !!assignmentId,
  });
}

export function useSaveAuditDraft() {
  return useMutation({
    mutationFn: (data: AuditDraft) => auditApi.saveDraft(data),
  });
}

export function useSubmitAudit() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: AuditDraft) => auditApi.submitAudit(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["my-assignments"] });
      qc.invalidateQueries({ queryKey: ["audits"] });
    },
  });
}

export function useCalculateScore() {
  return useMutation({
    mutationFn: (data: AuditDraft) => auditApi.calculateScore(data),
  });
}
