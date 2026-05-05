import { apiClient } from "@/lib/api-client";
import { Criteria, CriteriaGroup } from "@/shared/types";

export const criteriaApi = {
  // Groups
  getGroups: () => apiClient.get<CriteriaGroup[]>("/criteria-groups"),
  createGroup: (data: Partial<CriteriaGroup>) => apiClient.post<CriteriaGroup>("/criteria-groups", data),
  updateGroup: (id: string, data: Partial<CriteriaGroup>) => apiClient.patch<CriteriaGroup>(`/criteria-groups/${id}`, data),
  deleteGroup: (id: string) => apiClient.delete(`/criteria-groups/${id}`),

  // Criteria
  getCriteria: (groupId?: string) => {
    const qs = groupId ? `?groupId=${groupId}` : "";
    return apiClient.get<Criteria[]>(`/criteria${qs}`);
  },
  createCriteria: (data: Partial<Criteria>) => apiClient.post<Criteria>("/criteria", data),
  updateCriteria: (id: string, data: Partial<Criteria>) => apiClient.patch<Criteria>(`/criteria/${id}`, data),
  deleteCriteria: (id: string) => apiClient.delete(`/criteria/${id}`),
};
