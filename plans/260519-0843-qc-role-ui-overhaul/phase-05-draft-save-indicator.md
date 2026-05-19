# Phase 05 — Draft save status indicator

## Context links
- Root plan: [plan.md](./plan.md)
- Hook: `useSaveDraft` ở `src/features/audit/hooks/use-audit-execution.ts`
- Page: `src/app/(dashboard)/qc/audits/[assignmentId]/page.tsx`
- Phase 02 (mount slot): `phase-02-execute-page-layout-overhaul.md`

## Overview
- **Priority:** P2
- **Status:** pending
- **Effort:** ~15m
- **Mô tả:** Auto-save nháp đang chạy debounce 1500ms nhưng người dùng không biết. Hiển thị trạng thái: `Idle | Saving… | Đã lưu HH:mm | Lỗi`.

## Key insights
- `useMutation` từ TanStack Query đã expose `isPending`, `isSuccess`, `isError`, `data`, `submittedAt`. Có thể đọc trực tiếp.
- Debounce timer trong page → khi user gõ, có khoảng `Idle → (debounce 1.5s) → Saving → Saved`. Nên show "Có thay đổi chưa lưu…" giữa lúc gõ và lúc kích hoạt mutation.
- Tránh duplicate state — derive từ mutation + một ref "dirty since last save".

## Requirements

### Functional
- Indicator hiển thị 4 trạng thái:
  - `Idle` (chưa có gì): không hiển thị hoặc text nhạt "Sẵn sàng".
  - `Dirty` (đã gõ, đang chờ debounce): "Có thay đổi chưa lưu" + spinner mờ.
  - `Saving`: "Đang lưu…" + spinner.
  - `Saved`: "Đã lưu lúc HH:mm" (timestamp từ client `new Date()` khi mutation success).
  - `Error`: "Lỗi lưu nháp — sẽ thử lại" (text destructive).
- Indicator gắn vào `draftStatusSlot` của `AuditHeader` (đã chuẩn bị Phase 02).
- Read-only → ẩn hẳn indicator.

### Non-functional
- Component nhỏ ≤ 80 dòng.
- Không tự gọi save — chỉ render state.

## Architecture
```
page.tsx
  ├─ const saveDraftMutation = useSaveDraft()
  ├─ const lastSavedAt = ref/state (set khi onSuccess)
  ├─ const dirty = useRef(false) — set true khi violations đổi, false khi mutation success
  └─ <DraftStatus mutation={…} lastSavedAt={…} dirty={…} />
```

## Related code files

### Modify
- `src/app/(dashboard)/qc/audits/[assignmentId]/page.tsx` — track `lastSavedAt` + `dirty`; pass DraftStatus vào header slot.
- `src/features/audit/hooks/use-audit-execution.ts` — optional: thêm `onSuccess` mặc định để cập nhật cache (không bắt buộc — page tự handle).

### Create
- `src/app/(dashboard)/qc/audits/[assignmentId]/_components/draft-status.tsx`

## Implementation steps

1. **`draft-status.tsx`:**
   ```tsx
   "use client";
   import { Check, Loader2, AlertCircle, Clock } from "lucide-react";
   import { cn } from "@/lib/utils";

   interface DraftStatusProps {
     isSaving: boolean;
     isError: boolean;
     isDirty: boolean;
     lastSavedAt: Date | null;
   }

   function formatHHmm(d: Date) {
     return d.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
   }

   export function DraftStatus({ isSaving, isError, isDirty, lastSavedAt }: DraftStatusProps) {
     if (isError) {
       return (
         <span className="inline-flex items-center gap-1 text-destructive">
           <AlertCircle className="w-3.5 h-3.5" /> Lỗi lưu nháp — sẽ thử lại
         </span>
       );
     }
     if (isSaving) {
       return (
         <span className="inline-flex items-center gap-1">
           <Loader2 className="w-3.5 h-3.5 animate-spin" /> Đang lưu…
         </span>
       );
     }
     if (isDirty) {
       return (
         <span className="inline-flex items-center gap-1 text-muted-foreground">
           <Clock className="w-3.5 h-3.5" /> Có thay đổi chưa lưu
         </span>
       );
     }
     if (lastSavedAt) {
       return (
         <span className={cn("inline-flex items-center gap-1 text-success")}>
           <Check className="w-3.5 h-3.5" /> Đã lưu lúc {formatHHmm(lastSavedAt)}
         </span>
       );
     }
     return null;
   }
   ```

2. **Wire `page.tsx`:**
   - Sửa `useSaveDraft` call để expose `isPending`, `isError`, `isSuccess`:
     ```ts
     const saveDraftMutation = useSaveDraft();
     const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
     const [isDirty, setIsDirty] = useState(false);
     ```
   - Trong `triggerDraftSave`, thay `saveDraft(…)` bằng:
     ```ts
     setIsDirty(true);
     draftTimer.current = setTimeout(() => {
       saveDraftMutation.mutate(
         { assignmentId, violations: violationList },
         {
           onSuccess: () => {
             setLastSavedAt(new Date());
             setIsDirty(false);
           },
         }
       );
     }, DRAFT_DEBOUNCE_MS);
     ```
   - Truyền vào header slot:
     ```tsx
     <AuditHeader
       …
       draftStatusSlot={
         !isReadOnly && (
           <DraftStatus
             isSaving={saveDraftMutation.isPending}
             isError={saveDraftMutation.isError}
             isDirty={isDirty}
             lastSavedAt={lastSavedAt}
           />
         )
       }
     />
     ```

3. **Verify draft save end-to-end:**
   - Mở DevTools Network → filter `PATCH /api/audits/draft`.
   - Click +1 trên 1 criteria → đợi 1.5s → thấy request đi → trả 200 → indicator chuyển sang "Đã lưu lúc HH:mm".
   - Reload page → reducer restore từ `session.audit.violations` (đã có sẵn) → indicator giữ trạng thái "Đã lưu" với timestamp `submittedAt` nếu có, hoặc reset null.

4. **Typecheck** + manual test theo flow trên.

## Todo list
- [ ] Tạo `draft-status.tsx`
- [ ] Refactor save flow trong `page.tsx`: thêm `lastSavedAt`, `isDirty`
- [ ] Mount `<DraftStatus>` vào `draftStatusSlot` của `AuditHeader`
- [ ] Verify network call thực sự đi & response 200
- [ ] `npm run typecheck` pass
- [ ] Test 4 trạng thái: idle → dirty → saving → saved → error (off network)

## Success criteria
- Khi đánh dấu lỗi, sau ~1.5s thấy indicator chuyển "Đang lưu…" rồi "Đã lưu lúc HH:mm".
- Lỗi network → "Lỗi lưu nháp — sẽ thử lại".
- Read-only → không hiển thị indicator.

## Risk assessment
| Risk | Mitigation |
|------|------------|
| Mutation `isError` không reset khi user thử lại | TanStack Query reset khi `mutate` được gọi lại — đủ trong trường hợp này |
| Restore từ session làm `isDirty=true` ngay sau load | `justRestored.current` đã skip; `setIsDirty(true)` chỉ chạy khi user thực sự dispatch — verify lại logic |
| Indicator nhảy quá nhanh khi save success | `setLastSavedAt(new Date())` đủ stable. Có thể thêm `setTimeout(() => setLastSavedAt(null), N)` nếu muốn fade — bỏ qua YAGNI |

## Security considerations
- N/A — chỉ phản ánh state mutation.

## Next steps
- Sau phase 05 → toàn bộ plan complete. Chạy `npm run check` + manual smoke test.
- Cân nhắc viết unit test cho `derive-progress.ts` và `build-virtual-sections.ts` ở phase ngoài.
