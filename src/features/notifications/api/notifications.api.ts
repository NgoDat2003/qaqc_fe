import { apiClient } from "@/lib/api-client";
import type { NotificationDto } from "@/shared/types";

export const notificationsApi = {
  getNotifications: (unreadOnly?: boolean, limit = 50) =>
    apiClient.get<NotificationDto[]>(
      `/notifications?limit=${limit}${unreadOnly ? "&unreadOnly=true" : ""}`
    ),

  getUnreadCount: () =>
    apiClient.get<{ count: number }>("/notifications/unread-count"),

  markRead: (id: string) =>
    apiClient.patch<void>(`/notifications/${id}/read`, {}),

  markAllRead: () =>
    apiClient.patch<void>("/notifications/read-all", {}),
};
