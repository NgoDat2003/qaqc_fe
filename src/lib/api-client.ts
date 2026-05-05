import type { ApiResponse, ApiError } from "@/shared/types";

// FE → BE: qaqc-frontend (3001) calls qaqc-platform-clone (3000)
// Cookie "maycha_at" is set by BE, browser sends it automatically with credentials:"include"
const BE_URL = (process.env.NEXT_PUBLIC_BE_URL || "http://localhost:3000") + "/api";

class ApiClientError extends Error {
  constructor(
    public statusCode: number,
    message: string
  ) {
    super(message);
    this.name = "ApiClientError";
  }
}

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const res = await fetch(`${BE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    credentials: "include",
  });

  // Handle 401 Unauthorized globally
  if (res.status === 401) {
    if (typeof window !== "undefined" && !window.location.pathname.startsWith("/login")) {
      window.location.href = "/login";
    }
    throw new ApiClientError(401, "Unauthorized");
  }

  const json = await res.json().catch(() => ({}));

  // Handle Failure
  if (!res.ok || json.success === false) {
    const errorData = json as ApiError;
    const message = errorData.error?.message || "Request failed";
    const statusCode = errorData.error?.statusCode || res.status;
    
    throw new ApiClientError(statusCode, message);
  }

  // Handle Success
  const successData = json as ApiResponse<T>;
  return successData.data;
}

export const apiClient = {
  get: <T>(path: string, init?: RequestInit) =>
    request<T>(path, { method: "GET", ...init }),

  post: <T>(path: string, body: unknown, init?: RequestInit) =>
    request<T>(path, {
      method: "POST",
      body: JSON.stringify(body),
      ...init,
    }),

  patch: <T>(path: string, body: unknown, init?: RequestInit) =>
    request<T>(path, {
      method: "PATCH",
      body: JSON.stringify(body),
      ...init,
    }),

  put: <T>(path: string, body: unknown, init?: RequestInit) =>
    request<T>(path, {
      method: "PUT",
      body: JSON.stringify(body),
      ...init,
    }),

  delete: <T>(path: string, init?: RequestInit) =>
    request<T>(path, { method: "DELETE", ...init }),
};

export { ApiClientError };
