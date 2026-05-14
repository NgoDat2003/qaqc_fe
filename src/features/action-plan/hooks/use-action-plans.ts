import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import type { ActionPlan, ListResponse, ListParams } from "@/shared/types";
import { actionPlanApi } from "../api/action-plan.api";

type ActionPlanStatus = "draft" | "submitted" | "rejected" | "closed";
type ActionPlanListParams = ListParams & { storeId?: string; status?: ActionPlanStatus };

export function useActionPlans(params?: ActionPlanListParams) {
  return useQuery<ListResponse<ActionPlan>>({
    queryKey: ["action-plans", params],
    queryFn: () => actionPlanApi.getAll(params),
    placeholderData: keepPreviousData,
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
    mutationFn: ({ id, ...data }: { id: string; actionDescription: string; deadline?: string }) =>
      actionPlanApi.update(id, data),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ["action-plans", vars.id] });
      qc.invalidateQueries({ queryKey: ["action-plans"] });
    },
  });
}

export function useSubmitActionPlan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => actionPlanApi.submit(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["action-plans"] }),
  });
}

export function useReviewActionPlan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, action, reviewNote }: { id: string; action: "confirm" | "reject"; reviewNote?: string }) =>
      actionPlanApi.review(id, { action, reviewNote }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["action-plans"] }),
  });
}

export function useCloseActionPlan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => actionPlanApi.close(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["action-plans"] }),
  });
}
