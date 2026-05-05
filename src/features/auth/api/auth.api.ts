import { apiClient } from "@/lib/api-client";
import { LoginRequest, AuthResponse } from "@/shared/types";

export const authApi = {
  /**
   * Log in with email and password.
   */
  login: async (data: LoginRequest) => {
    return apiClient.post<AuthResponse>("/auth/login", data);
  },

  /**
   * Log out and clear session.
   */
  logout: async () => {
    return apiClient.post<null>("/auth/logout", {});
  },

  /**
   * Get current session info.
   */
  getMe: async () => {
    return apiClient.get<AuthResponse>("/auth/me");
  },
};
