import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import type { User, ListResponse, ListParams } from "@/shared/types";
import { masterApi } from "../api/master.api";

export function useUsers(params?: ListParams) {
  return useQuery<ListResponse<User>>({
    queryKey: ["users", params],
    queryFn: () => masterApi.getUsers(params),
    placeholderData: keepPreviousData,
  });
}

export function useUser(id: string) {
  return useQuery({
    queryKey: ["users", id],
    queryFn: () => masterApi.getUser(id),
    enabled: !!id,
  });
}

export function useCreateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<User>) => masterApi.createUser(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["users"] }),
  });
}

export function useUpdateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: Partial<User> & { id: string }) =>
      masterApi.updateUser(id, data),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ["users"] });
      qc.invalidateQueries({ queryKey: ["users", data.id] });
    },
  });
}

export function useToggleUserActive() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      masterApi.toggleUserActive(id, isActive),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ["users"] });
      qc.invalidateQueries({ queryKey: ["users", data.id] });
    },
  });
}
