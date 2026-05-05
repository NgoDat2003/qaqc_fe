import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { criteriaApi } from "../api/criteria.api";
import { Criteria } from "@/shared/types";

export function useCriteria(groupId?: string) {
  return useQuery({
    queryKey: ["criteria", groupId],
    queryFn: () => criteriaApi.getCriteria(groupId),
  });
}

export function useCreateCriteria() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Criteria>) => criteriaApi.createCriteria(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["criteria"] }),
  });
}

export function useUpdateCriteria() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: Partial<Criteria> & { id: string }) =>
      criteriaApi.updateCriteria(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["criteria"] }),
  });
}

export function useDeleteCriteria() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => criteriaApi.deleteCriteria(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["criteria"] }),
  });
}
