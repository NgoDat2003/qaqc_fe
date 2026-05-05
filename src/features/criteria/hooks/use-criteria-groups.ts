import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { criteriaApi } from "../api/criteria.api";
import { CriteriaGroup } from "@/shared/types";

export function useCriteriaGroups() {
  return useQuery({
    queryKey: ["criteria-groups"],
    queryFn: () => criteriaApi.getGroups(),
  });
}

export function useCreateCriteriaGroup() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<CriteriaGroup>) => criteriaApi.createGroup(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["criteria-groups"] }),
  });
}

export function useUpdateCriteriaGroup() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: Partial<CriteriaGroup> & { id: string }) =>
      criteriaApi.updateGroup(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["criteria-groups"] }),
  });
}

export function useDeleteCriteriaGroup() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => criteriaApi.deleteGroup(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["criteria-groups"] }),
  });
}
