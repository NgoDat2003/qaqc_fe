import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import type { AuditPlan, AuditPlanSummary, ListResponse, ListParams } from "@/shared/types";
import { auditApi } from "../api/audit.api";

export function useAuditPlans(params?: ListParams) {
  return useQuery<ListResponse<AuditPlanSummary>>({
    queryKey: ["audit-plans", params],
    queryFn: () => auditApi.getPlans(params),
    placeholderData: keepPreviousData,
  });
}

export function useAuditPlan(id: string) {
  return useQuery({
    queryKey: ["audit-plans", id],
    queryFn: () => auditApi.getPlan(id),
    enabled: !!id,
  });
}

export function useCreateAuditPlan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<AuditPlan>) => auditApi.createPlan(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["audit-plans"] }),
  });
}

export function useCloseAuditPlan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => auditApi.closePlan(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["audit-plans"] }),
  });
}

export function useMyAssignments() {
  return useQuery({
    queryKey: ["my-assignments"],
    queryFn: () => auditApi.getMyAssignments(),
  });
}
