import { useMutation, useQueryClient } from "@tanstack/react-query";
import { auditApi } from "../api/audit.api";
import type { AuditDraft } from "@/shared/types";

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
