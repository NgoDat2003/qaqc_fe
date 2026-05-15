import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Store } from "@/shared/types";
import { masterApi } from "../api/master.api";

export function useStores() {
  return useQuery<Store[]>({
    queryKey: ["stores"],
    queryFn: () => masterApi.getAllStores(),
    staleTime: 30_000,
  });
}

export function useCreateStore() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Store>) => masterApi.createStore(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["stores"] }),
  });
}

export function useUpdateStore() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: Partial<Store> & { id: string }) =>
      masterApi.updateStore(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["stores"] }),
  });
}

export function useAssignAM() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, amId }: { id: string; amId: string | null }) =>
      masterApi.assignAM(id, amId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["stores"] }),
  });
}
