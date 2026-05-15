import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { User } from "@/shared/types";
import { masterApi } from "../api/master.api";

export function useUsers() {
  return useQuery<User[]>({
    queryKey: ["users"],
    queryFn: () => masterApi.getAllUsers(),
    staleTime: 30_000,
  });
}

// Scoped for dropdowns — load only users with a specific role
export function useUsersByRole(role: string, options?: { enabled?: boolean }) {
  return useQuery<User[]>({
    queryKey: ["users", "role", role],
    queryFn: () => masterApi.getAllUsers(role),
    staleTime: 60_000,
    enabled: !!role && (options?.enabled ?? true),
  });
}

export function useCreateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: unknown) => masterApi.createUser(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["users"] }),
  });
}

export function useUpdateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: Partial<User> & { id: string }) =>
      masterApi.updateUser(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["users"] }),
  });
}

export function useToggleUserActive() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      masterApi.toggleUserActive(id, isActive),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["users"] }),
  });
}
