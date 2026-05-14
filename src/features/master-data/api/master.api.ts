import { apiClient } from "@/lib/api-client";
import { buildQS } from "@/lib/build-qs";
import type { Brand, Store, User, ListResponse, ListParams } from "@/shared/types";

export const masterApi = {
  // Brands
  getBrands: (params?: ListParams): Promise<ListResponse<Brand>> =>
    apiClient.list<Brand>(`/brands${buildQS(params)}`),
  createBrand: (data: Partial<Brand>) => apiClient.post<Brand>("/brands", data),
  updateBrand: (id: string, data: Partial<Brand>) => apiClient.patch<Brand>(`/brands/${id}`, data),
  deleteBrand: (id: string) => apiClient.delete(`/brands/${id}`),

  // Stores
  getStores: (params?: ListParams & { brandId?: string; isActive?: boolean }): Promise<ListResponse<Store>> =>
    apiClient.list<Store>(`/stores${buildQS(params)}`),
  getStore: (id: string) => apiClient.get<Store>(`/stores/${id}`),
  createStore: (data: Partial<Store>) => apiClient.post<Store>("/stores", data),
  updateStore: (id: string, data: Partial<Store>) => apiClient.patch<Store>(`/stores/${id}`, data),
  assignAM: (id: string, amId: string) => apiClient.patch<Store>(`/stores/${id}/assign-am`, { amId }),

  // Users
  getUsers: (params?: ListParams): Promise<ListResponse<User>> =>
    apiClient.list<User>(`/users${buildQS(params)}`),
  getUser: (id: string) => apiClient.get<User>(`/users/${id}`),
  createUser: (data: Partial<User>) => apiClient.post<User>("/users", data),
  updateUser: (id: string, data: Partial<User>) => apiClient.patch<User>(`/users/${id}`, data),
  toggleUserActive: (id: string, isActive: boolean) => apiClient.patch<User>(`/users/${id}/toggle-active`, { isActive }),
};
