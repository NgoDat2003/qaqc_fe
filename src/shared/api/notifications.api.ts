import { apiClient } from "@/lib/api-client";
import { Notification } from "@/shared/types";

export const notificationsApi = {
  /**
   * Fetch current user's notifications.
   */
  getNotifications: async () => {
    return apiClient.get<Notification[]>("/notifications");
  },

  /**
   * Mark all notifications as read.
   */
  markAllAsRead: async () => {
    return apiClient.patch<null>("/notifications", {});
  },
};
