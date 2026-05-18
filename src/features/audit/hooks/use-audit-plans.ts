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

export function usePublishAuditPlan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => auditApi.publishAuditPlan(id),
    onSuccess: (_d, id) => {
      qc.invalidateQueries({ queryKey: ["audit-plans"] });
      qc.invalidateQueries({ queryKey: ["audit-plans", id] });
    },
  });
}

export function useUpdateAuditPlan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: { id: string; name?: string; formId?: string; startDate?: string; endDate?: string; assignments?: Array<{ storeId: string; auditorId: string }> }) =>
      auditApi.updateAuditPlan(id, data),
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ["audit-plans"] });
      qc.invalidateQueries({ queryKey: ["audit-plans", vars.id] });
    },
  });
}

export function useUpdateAssignment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ planId, assignmentId, auditorId }: { planId: string; assignmentId: string; auditorId: string }) =>
      auditApi.updateAssignment(planId, assignmentId, { auditorId }),
    onSuccess: (_d, vars) => qc.invalidateQueries({ queryKey: ["audit-plans", vars.planId] }),
  });
}

export function useRemoveAssignment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ planId, assignmentId }: { planId: string; assignmentId: string }) =>
      auditApi.removeAssignment(planId, assignmentId),
    onSuccess: (_d, vars) => qc.invalidateQueries({ queryKey: ["audit-plans", vars.planId] }),
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
