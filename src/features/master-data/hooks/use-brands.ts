import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { masterApi } from "../api/master.api";
import { Brand } from "@/shared/types";

export function useBrands() {
  return useQuery({
    queryKey: ["brands"],
    queryFn: () => masterApi.getBrands(),
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
