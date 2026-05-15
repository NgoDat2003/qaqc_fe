import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { AuditPlanFull, MyAssignment } from "@/shared/types";
import { auditApi } from "../api/audit.api";

export function useAuditPlans() {
  return useQuery<AuditPlanFull[]>({
    queryKey: ["audit-plans"],
    queryFn: () => auditApi.getAuditPlans(),
    staleTime: 30_000,
  });
}

export function useAuditPlan(id: string) {
  return useQuery<AuditPlanFull>({
    queryKey: ["audit-plans", id],
    queryFn: () => auditApi.getAuditPlan(id),
    enabled: !!id,
  });
}

export function useCreateAuditPlan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Parameters<typeof auditApi.createAuditPlan>[0]) =>
      auditApi.createAuditPlan(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["audit-plans"] }),
  });
}

export function useCloseAuditPlan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => auditApi.closeAuditPlan(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["audit-plans"] }),
  });
}

// QC Auditor only
export function useMyAssignments() {
  return useQuery<MyAssignment[]>({
    queryKey: ["my-assignments"],
    queryFn: () => auditApi.getMyAssignments(),
    staleTime: 30_000,
  });
}
