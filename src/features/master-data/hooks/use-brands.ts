import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Brand } from "@/shared/types";
import { masterApi } from "../api/master.api";

export function useBrands() {
  return useQuery<Brand[]>({
    queryKey: ["brands"],
    queryFn: () => masterApi.getAllBrands(),
    staleTime: 30_000,
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
