import { apiClient } from "@/lib/api-client";
import type { AnalyticsOverview } from "@/shared/types";

export const analyticsApi = {
  getOverview: () => apiClient.get<AnalyticsOverview>("/analytics/overview"),
};
