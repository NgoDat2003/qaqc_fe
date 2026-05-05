import { apiClient } from "@/lib/api-client";
import { Brand, Store, User } from "@/shared/types";

export const masterApi = {
  // Brands
  getBrands: () => apiClient.get<Brand[]>("/brands"),
  createBrand: (data: Partial<Brand>) => apiClient.post<Brand>("/brands", data),
  updateBrand: (id: string, data: Partial<Brand>) => apiClient.patch<Brand>(`/brands/${id}`, data),
  deleteBrand: (id: string) => apiClient.delete(`/brands/${id}`),

  // Stores
  getStores: (params?: Record<string, string>) => {
    const qs = params ? `?${new URLSearchParams(params).toString()}` : "";
    return apiClient.get<Store[]>(`/stores${qs}`);
  },
  getStore: (id: string) => apiClient.get<Store>(`/stores/${id}`),
  createStore: (data: Partial<Store>) => apiClient.post<Store>("/stores", data),
  updateStore: (id: string, data: Partial<Store>) => apiClient.patch<Store>(`/stores/${id}`, data),
  assignAM: (id: string, amId: string) => apiClient.patch<Store>(`/stores/${id}/assign-am`, { amId }),

  // Users
  getUsers: () => apiClient.get<User[]>("/users"),
  getUser: (id: string) => apiClient.get<User>(`/users/${id}`),
  createUser: (data: Partial<User>) => apiClient.post<User>("/users", data),
  updateUser: (id: string, data: Partial<User>) => apiClient.patch<User>(`/users/${id}`, data),
  toggleUserActive: (id: string, isActive: boolean) => apiClient.patch<User>(`/users/${id}/toggle-active`, { isActive }),
};
