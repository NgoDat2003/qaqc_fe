import { apiClient } from "@/lib/api-client";
import type { Brand, Store, User } from "@/shared/types";

export const masterApi = {
  // ── Brands ──────────────────────────────────────────────────────────────
  // GET /brands → { success: true, data: Brand[] } — no pagination, FE filters
  getAllBrands: () => apiClient.get<Brand[]>("/brands"),

  createBrand: (data: Partial<Brand>) =>
    apiClient.post<Brand>("/brands", data),

  updateBrand: (id: string, data: Partial<Brand>) =>
    apiClient.patch<Brand>(`/brands/${id}`, data),

  // ── Stores ──────────────────────────────────────────────────────────────
  // GET /stores → { success: true, data: Store[] } — no pagination, FE filters
  getAllStores: () => apiClient.get<Store[]>("/stores"),

  getStore: (id: string) => apiClient.get<Store>(`/stores/${id}`),

  createStore: (data: Partial<Store>) =>
    apiClient.post<Store>("/stores", data),

  updateStore: (id: string, data: Partial<Store>) =>
    apiClient.patch<Store>(`/stores/${id}`, data),

  assignAM: (id: string, amId: string | null) =>
    apiClient.patch<Store>(`/stores/${id}/assign-am`, { amId }),

  // ── Users ────────────────────────────────────────────────────────────────
  // GET /users?role=xxx → { success: true, data: User[] } — optional role filter
  getAllUsers: (role?: string) =>
    apiClient.get<User[]>(`/users${role ? `?role=${role}` : ""}`),

  createUser: (data: unknown) => apiClient.post<User>("/users", data),

  updateUser: (id: string, data: Partial<User>) =>
    apiClient.patch<User>(`/users/${id}`, data),

  toggleUserActive: (id: string, isActive: boolean) =>
    apiClient.patch<User>(`/users/${id}/toggle-active`, { isActive }),
};
