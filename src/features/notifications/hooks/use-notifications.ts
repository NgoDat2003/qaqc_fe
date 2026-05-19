import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { NotificationDto } from "@/shared/types";
import { notificationsApi } from "../api/notifications.api";

export function useUnreadCount() {
  return useQuery<{ count: number }>({
    queryKey: ["notifications-count"],
    queryFn: () => notificationsApi.getUnreadCount(),
    staleTime: 30_000,
    refetchInterval: 60_000,
  });
}

export function useNotifications(unreadOnly?: boolean) {
  return useQuery<NotificationDto[]>({
    queryKey: ["notifications", unreadOnly ? "unread" : "all"],
    queryFn: () => notificationsApi.getNotifications(unreadOnly),
    staleTime: 30_000,
  });
}

export function useMarkRead() {
  const qc = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: (id) => notificationsApi.markRead(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["notifications-count"] });
      qc.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}

export function useMarkAllRead() {
  const qc = useQueryClient();
  return useMutation<void, Error, void>({
    mutationFn: () => notificationsApi.markAllRead(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["notifications-count"] });
      qc.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}
