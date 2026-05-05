import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { auditApi } from "../api/audit.api";
import type { AuditPlan } from "@/shared/types";

export function useAuditPlans() {
  return useQuery({
    queryKey: ["audit-plans"],
    queryFn: () => auditApi.getPlans(),
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
