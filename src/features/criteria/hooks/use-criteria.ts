import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import type { Criteria, ListResponse, ListParams } from "@/shared/types";
import { criteriaApi } from "../api/criteria.api";

type CriteriaListParams = ListParams & { groupId?: string };

export function useCriteria(params?: CriteriaListParams) {
  return useQuery<ListResponse<Criteria>>({
    queryKey: ["criteria", params],
    queryFn: () => criteriaApi.getCriteria(params),
    placeholderData: keepPreviousData,
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
