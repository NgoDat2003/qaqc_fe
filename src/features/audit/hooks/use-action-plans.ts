import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { ActionPlanDetail, ActionPlanStatus } from "@/shared/types";
import { ApiClientError } from "@/lib/api-client";
import { useAuthStore } from "@/stores/auth.store";
import { auditApi } from "../api/audit.api";

export function useActionPlans(status?: ActionPlanStatus) {
  return useQuery<ActionPlanDetail[]>({
    queryKey: ["action-plans", status ?? "all"],
    queryFn: async () => {
      try {
        return await auditApi.getActionPlans(status);
      } catch (err) {
        // Temporarily suppress 403 for qc_auditor only — BE hasn't granted this permission yet
        const role = useAuthStore.getState().activeRole;
        if (err instanceof ApiClientError && err.statusCode === 403 && role === "qc_auditor") return [];
        throw err;
      }
    },
    staleTime: 30_000,
  });
}

export function useActionPlan(id: string) {
  return useQuery<ActionPlanDetail>({
    queryKey: ["action-plans", id],
    queryFn: () => auditApi.getActionPlan(id),
    staleTime: 0,
    enabled: !!id,
  });
}

export function useUpdateActionPlan() {
  const qc = useQueryClient();
  return useMutation<
    ActionPlanDetail,
    Error,
    {
      id: string;
      items: Array<{
        itemId: string;
        rootCause?: string | null;
        remediation?: string | null;
        fixedAt?: string | null;
        assigneeName?: string | null;
        imageIds?: string[];
      }>;
    }
  >({
    mutationFn: ({ id, items }) => auditApi.updateActionPlan(id, items),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ["action-plans", vars.id] });
    },
  });
}

export function useSubmitActionPlan() {
  const qc = useQueryClient();
  return useMutation<ActionPlanDetail, Error, { id: string }>({
    mutationFn: ({ id }) => auditApi.submitActionPlan(id),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ["action-plans", vars.id] });
      qc.invalidateQueries({ queryKey: ["action-plans"] });
    },
  });
}

export function useRejectActionPlan() {
  const qc = useQueryClient();
  return useMutation<ActionPlanDetail, Error, { id: string; reviewNote: string }>({
    mutationFn: ({ id, reviewNote }) => auditApi.rejectActionPlan(id, reviewNote),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ["action-plans", vars.id] });
      qc.invalidateQueries({ queryKey: ["action-plans"] });
    },
  });
}

export function useCloseActionPlan() {
  const qc = useQueryClient();
  return useMutation<ActionPlanDetail, Error, { id: string }>({
    mutationFn: ({ id }) => auditApi.closeActionPlan(id),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ["action-plans", vars.id] });
      qc.invalidateQueries({ queryKey: ["action-plans"] });
    },
  });
}
