import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { CriteriaGroup } from "@/shared/types";
import { criteriaApi } from "../api/criteria.api";

export function useCriteriaGroups() {
  return useQuery<CriteriaGroup[]>({
    queryKey: ["criteria-groups"],
    queryFn: () => criteriaApi.getCriteriaGroups(),
    staleTime: 60_000,
  });
}

export function useCreateCriteriaGroup() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Parameters<typeof criteriaApi.createCriteriaGroup>[0]) =>
      criteriaApi.createCriteriaGroup(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["criteria-groups"] }),
  });
}

export function useUpdateCriteriaGroup() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: { id: string } & Parameters<typeof criteriaApi.updateCriteriaGroup>[1]) =>
      criteriaApi.updateCriteriaGroup(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["criteria-groups"] }),
  });
}
