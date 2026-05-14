import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import type { Brand, ListResponse, ListParams } from "@/shared/types";
import { masterApi } from "../api/master.api";

export function useBrands(params?: ListParams) {
  return useQuery<ListResponse<Brand>>({
    queryKey: ["brands", params],
    queryFn: () => masterApi.getBrands(params),
    placeholderData: keepPreviousData,
  });
}

export function useCreateBrand() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Brand>) => masterApi.createBrand(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["brands"] }),
  });
}

export function useUpdateBrand() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: Partial<Brand> & { id: string }) =>
      masterApi.updateBrand(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["brands"] }),
  });
}

export function useDeleteBrand() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => masterApi.deleteBrand(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["brands"] }),
  });
}
