import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import type { Store, ListResponse, ListParams } from "@/shared/types";
import { masterApi } from "../api/master.api";

type StoreListParams = ListParams & { brandId?: string; isActive?: boolean };

export function useStores(params?: StoreListParams) {
  return useQuery<ListResponse<Store>>({
    queryKey: ["stores", params],
    queryFn: () => masterApi.getStores(params),
    placeholderData: keepPreviousData,
  });
}

export function useStore(id: string) {
  return useQuery({
    queryKey: ["stores", id],
    queryFn: () => masterApi.getStore(id),
    enabled: !!id,
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
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ["stores"] });
      qc.invalidateQueries({ queryKey: ["stores", data.id] });
    },
  });
}

export function useAssignAM() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, amId }: { id: string; amId: string }) =>
      masterApi.assignAM(id, amId),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ["stores"] });
      qc.invalidateQueries({ queryKey: ["stores", data.id] });
    },
  });
}
