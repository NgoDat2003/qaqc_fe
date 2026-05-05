import { useQuery } from "@tanstack/react-query";
import { authApi } from "../api/auth.api";
import { useAuthStore } from "@/stores/auth.store";

export function useMe(enabled = true) {
  const { setAuth, logout } = useAuthStore();

  return useQuery({
    queryKey: ["auth-me"],
    queryFn: async () => {
      try {
        const data = await authApi.getMe();
        setAuth(data.user, data.availableRoles, data.activeRole);
        return data;
      } catch (error) {
        // If /me fails, clear auth state
        logout();
        throw error;
      }
    },
    enabled,
    retry: false,
    staleTime: Infinity, // Current user info is fairly static per session
  });
}
