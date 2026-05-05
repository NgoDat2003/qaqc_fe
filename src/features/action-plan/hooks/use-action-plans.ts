import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { actionPlanApi } from "../api/action-plan.api";

export function useActionPlans(params?: Record<string, string>) {
  return useQuery({
    queryKey: ["action-plans", params],
    queryFn: () => actionPlanApi.getAll(params),
  });
}

export function useActionPlan(id: string) {
  return useQuery({
    queryKey: ["action-plans", id],
    queryFn: () => actionPlanApi.getOne(id),
    enabled: !!id,
  });
}

export function useUpdateActionPlan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: { id: string; remediation?: string; deadline?: string }) =>
      actionPlanApi.update(id, data),
    onSuccess: (_data, vars) =>
      qc.invalidateQueries({ queryKey: ["action-plans", vars.id] }),
  });
}

export function useSubmitActionPlan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => actionPlanApi.submit(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["action-plans"] }),
  });
}

export function useConfirmActionPlan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => actionPlanApi.confirm(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["action-plans"] }),
  });
}

export function useCloseActionPlan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: { id: string; evidenceIds: string[]; note?: string }) =>
      actionPlanApi.close(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["action-plans"] }),
  });
}
