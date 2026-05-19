"use client";

import { useRouter } from "next/navigation";
import { Info, AlertTriangle, Bell, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDateTime } from "@/lib/format";
import { useNotifications, useMarkRead, useMarkAllRead } from "@/features/notifications";
import type { NotificationDto } from "@/shared/types";

interface NotificationPanelProps {
  onClose: () => void;
}

function typeIcon(type: NotificationDto["type"]) {
  if (type === "alarm")   return <AlertTriangle className="w-4 h-4 text-danger flex-shrink-0" />;
  if (type === "warning") return <AlertTriangle className="w-4 h-4 text-warning flex-shrink-0" />;
  return <Info className="w-4 h-4 text-info flex-shrink-0" />;
}

export function NotificationPanel({ onClose }: NotificationPanelProps) {
  const router = useRouter();
  const { data: notifications = [], isLoading } = useNotifications();
  const markRead    = useMarkRead();
  const markAllRead = useMarkAllRead();

  async function handleClick(n: NotificationDto) {
    if (!n.isRead) await markRead.mutateAsync(n.id);
    if (n.link) {
      router.push(n.link);
      onClose();
    }
  }

  return (
    <div className="absolute right-0 top-10 z-50 w-80 rounded-xl border border-border bg-card shadow-lg overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border/50">
        <span className="text-sm font-semibold text-foreground">Thông báo</span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => markAllRead.mutate()}
            className="text-xs text-primary hover:underline"
          >
            Đọc tất cả
          </button>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* List */}
      <div className="max-h-96 overflow-y-auto divide-y divide-border/30">
        {isLoading ? (
          <div className="px-4 py-6 text-center text-sm text-muted-foreground">Đang tải…</div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center gap-2 px-4 py-8 text-muted-foreground">
            <Bell className="w-8 h-8 opacity-30" />
            <span className="text-sm">Không có thông báo</span>
          </div>
        ) : (
          notifications.map((n) => (
            <button
              key={n.id}
              onClick={() => handleClick(n)}
              className={cn(
                "w-full text-left px-4 py-3 flex items-start gap-3 transition-colors hover:bg-muted/40",
                !n.isRead && "bg-primary/5"
              )}
            >
              {typeIcon(n.type)}
              <div className="min-w-0 space-y-0.5">
                <p className={cn("text-sm leading-snug", !n.isRead && "font-semibold text-foreground")}>
                  {n.title}
                </p>
                <p className="text-xs text-muted-foreground line-clamp-2">{n.message}</p>
                <p className="text-[10px] text-muted-foreground">{formatDateTime(n.createdAt)}</p>
              </div>
              {!n.isRead && (
                <span className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-1" />
              )}
            </button>
          ))
        )}
      </div>
    </div>
  );
}
