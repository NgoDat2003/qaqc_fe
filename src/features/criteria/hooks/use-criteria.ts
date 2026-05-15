import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Criteria } from "@/shared/types";
import { criteriaApi } from "../api/criteria.api";

export function useCriteria(params?: { groupId?: string; isActive?: boolean }) {
  return useQuery<Criteria[]>({
    queryKey: ["criteria", params],
    queryFn: () => criteriaApi.getCriteria(params),
    staleTime: 30_000,
  });
}

export function useCreateCriteria() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Parameters<typeof criteriaApi.createCriteria>[0]) =>
      criteriaApi.createCriteria(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["criteria"] }),
  });
}

export function useUpdateCriteria() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: { id: string } & Parameters<typeof criteriaApi.updateCriteria>[1]) =>
      criteriaApi.updateCriteria(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["criteria"] }),
  });
}
