# Phase 6 — Notification Bell

**Effort:** 20m | **Depends on:** Phase 1

## Files

### New: `src/features/notifications/api/notifications.api.ts`
API methods đã define ở Phase 1.

### New: `src/features/notifications/hooks/use-notifications.ts`
```ts
export function useUnreadCount() — refetchInterval: 60_000
export function useNotifications(unreadOnly?: boolean)
export function useMarkRead()
export function useMarkAllRead()
```

### New: `src/shared/components/notification-panel.tsx`

Gắn vào bell icon trong `src/app/(dashboard)/layout.tsx` — hiện đang dùng `<Bell />` icon.

**Component:**
```tsx
"use client";

interface NotificationPanelProps {
  open: boolean;
  onClose: () => void;
}

// - useNotifications() để lấy list
// - useMarkAllRead() → nút "Đọc tất cả"
// - Mỗi item: click → useMarkRead(id) + navigate link nếu có
// - type "alarm" → bg-destructive/10, "warning" → bg-warning/10, "info" → default
```

### Modify: `src/app/(dashboard)/layout.tsx`

**Bell icon** hiện là `<Bell className="..." />` — cần:
1. Wrap trong `useState<boolean>` cho open/close panel
2. Hiển thị `useUnreadCount()` badge đỏ nếu count > 0
3. Mount `<NotificationPanel open={...} onClose={...} />`

```tsx
// Trong layout:
const { data: unreadData } = useUnreadCount();
const [notifOpen, setNotifOpen] = useState(false);

// Bell button:
<button onClick={() => setNotifOpen(v => !v)} className="relative ...">
  <Bell />
  {(unreadData?.count ?? 0) > 0 && (
    <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-destructive text-destructive-foreground text-[10px] flex items-center justify-center">
      {unreadData!.count > 9 ? "9+" : unreadData!.count}
    </span>
  )}
</button>
<NotificationPanel open={notifOpen} onClose={() => setNotifOpen(false)} />
```

## Verification

- `npm run typecheck`
- Smoke: badge hiện đúng count, click item mark read, count giảm
