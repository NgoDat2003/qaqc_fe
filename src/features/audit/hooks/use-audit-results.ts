import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  AuditResultListItem,
  AuditResultDetail,
  CorrectionRequestDto,
  AuditCorrectionResponse,
  ActionPlanDetail,
  AuditViolationWrite,
} from "@/shared/types";
import { auditApi } from "../api/audit.api";

export function useAuditResults() {
  return useQuery<AuditResultListItem[]>({
    queryKey: ["audit-results"],
    queryFn: () => auditApi.getAuditResults(),
    staleTime: 30_000,
  });
}

export function useAuditResultDetail(id: string) {
  return useQuery<AuditResultDetail>({
    queryKey: ["audit-results", id],
    queryFn: () => auditApi.getAuditResultDetail(id),
    staleTime: 0,
    enabled: !!id,
  });
}

export function useCreateCorrectionRequest() {
  const qc = useQueryClient();
  return useMutation<CorrectionRequestDto, Error, { auditId: string; reason: string }>({
    mutationFn: ({ auditId, reason }) => auditApi.createCorrectionRequest(auditId, reason),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ["audit-results", vars.auditId] });
      qc.invalidateQueries({ queryKey: ["audit-results"] });
    },
  });
}

export function useApproveCorrectionRequest() {
  const qc = useQueryClient();
  return useMutation<void, Error, { requestId: string; auditId: string; reviewNote?: string }>({
    mutationFn: ({ requestId, reviewNote }) =>
      auditApi.approveCorrectionRequest(requestId, reviewNote),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ["audit-results", vars.auditId] });
    },
  });
}

export function useRejectCorrectionRequest() {
  const qc = useQueryClient();
  return useMutation<void, Error, { requestId: string; auditId: string; reviewNote: string }>({
    mutationFn: ({ requestId, reviewNote }) =>
      auditApi.rejectCorrectionRequest(requestId, reviewNote),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ["audit-results", vars.auditId] });
    },
  });
}

export function useApplyAuditCorrection() {
  const qc = useQueryClient();
  return useMutation<
    AuditCorrectionResponse,
    Error,
    { auditId: string; editNote: string; violations: AuditViolationWrite[] }
  >({
    mutationFn: ({ auditId, editNote, violations }) =>
      auditApi.applyAuditCorrection(auditId, { editNote, violations }),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ["audit-results", vars.auditId] });
      qc.invalidateQueries({ queryKey: ["audit-results"] });
    },
  });
}

export function useCreateActionPlan() {
  const qc = useQueryClient();
  return useMutation<ActionPlanDetail, Error, { auditId: string }>({
    mutationFn: ({ auditId }) => auditApi.createActionPlan(auditId),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ["audit-results", vars.auditId] });
      qc.invalidateQueries({ queryKey: ["audit-results"] });
      qc.invalidateQueries({ queryKey: ["action-plans"] });
    },
  });
}
