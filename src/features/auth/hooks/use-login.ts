import { useMutation } from "@tanstack/react-query";
import { authApi } from "../api/auth.api";
import { useAuthStore } from "@/stores/auth.store";
import type { LoginRequest } from "@/shared/types";

export function useLogin() {
  const setAuth = useAuthStore((state) => state.setAuth);
  const logout = useAuthStore((state) => state.logout);

  return useMutation({
    mutationFn: async (data: LoginRequest) => {
      // Fix Bug #15: Clear existing state before new login attempt
      logout();

      const response = await authApi.login(data);
      return response;
    },
    onSuccess: (data) => {
      setAuth(data.user, data.availableRoles, data.activeRole);
    },
  });
}
