# Phase 02 — Execute page layout overhaul

## Context links
- Root plan: [plan.md](./plan.md)
- Page: `src/app/(dashboard)/qc/audits/[assignmentId]/page.tsx`
- Components dir: `src/app/(dashboard)/qc/audits/[assignmentId]/_components/`
- Types: `AuditSession`, `MyAssignment` ở `src/shared/types/index.ts`
- Helpers: `formatDate`, `formatDateTime` ở `src/lib/format.ts`

## Overview
- **Priority:** P1
- **Status:** pending
- **Effort:** ~45m
- **Mô tả:** Trang execute hiện chỉ có `PageHeader` + section tabs + danh sách card. Thiếu store info chi tiết, progress tracking và visual hierarchy. Build header dedicated + progress bar + meta strip.

## Key insights
- `AuditSession.assignment.store` đã có `id, code, name` (không có address — chấp nhận hiện tại).
- `AuditSession.assignment.plan` có `name, startDate, endDate, isAuditWindowOpen, status`.
- `AuditSession.checklist` có `name, version, sections[]`.
- Đã có `submittedAt` trong `audit` khi đã nộp.
- Progress = số criteria có `numErrors > 0` / tổng criteria (đã tính được, đang ở `submit-bar.tsx`).
- `loadingCount` global trong `ui.store.ts` không thay thế được status nháp dạng "Đã lưu" (phase 05 sẽ làm riêng).

## Requirements

### Functional
- Header trang gồm 2 hàng:
  - **Row 1 — primary**: nút back + tên cửa hàng (lớn) + store code (mono badge) + status badge bài.
  - **Row 2 — meta strip**: plan name, audit window dates, checklist name + version, draft-save indicator (placeholder cho phase 05).
- Progress bar: `X / Y tiêu chí được đánh giá` + thanh tiến độ với percentage (`completed` = criteria có numErrors ≥ 0 — tức đã touch; có thể đơn giản hoá thành `Y - chưa-chạm`).
- Khi `isReadOnly` → banner cảnh báo rõ ràng ngay dưới header (giữ logic cũ, đẹp hơn).
- Mobile-friendly: header co lại, meta strip wrap.

### Non-functional
- File `audit-header.tsx` ≤ 200 dòng.
- File `derive-progress.ts` ≤ 50 dòng — pure function dễ test.
- File `page.tsx` ≤ 200 dòng — phải gọn lại sau refactor.

## Architecture
```
page.tsx
├── <AuditHeader session={…} draftStatus={…} progress={…} />
│      ├── back + store name + code + status badge
│      ├── meta: plan / dates / checklist / DraftStatus
│      └── progress bar
├── <SectionTabBar … />
└── criteria list + SubmitBar
```

## Related code files

### Modify
- `src/app/(dashboard)/qc/audits/[assignmentId]/page.tsx` — thay block header bằng `<AuditHeader>`, truyền `progress` + `draftStatus`.

### Create
- `src/app/(dashboard)/qc/audits/[assignmentId]/_components/audit-header.tsx`
- `src/app/(dashboard)/qc/audits/[assignmentId]/_lib/derive-progress.ts`

### Delete
- (None)

## Implementation steps

1. **`derive-progress.ts`** — pure helper:
   ```ts
   import type { AuditSession } from "@/shared/types";
   import type { ViolationsState } from "./violations-reducer";

   export interface ProgressInfo {
     total: number;
     touched: number;   // criteria có numErrors > 0
     percentage: number; // touched/total * 100
   }

   export function deriveProgress(
     session: AuditSession,
     violations: ViolationsState
   ): ProgressInfo {
     const total = session.checklist.sections.reduce(
       (sum, s) => sum + (s.items?.length ?? 0),
       0
     );
     const touched = Object.values(violations).filter((v) => v.numErrors > 0).length;
     const percentage = total === 0 ? 0 : Math.round((touched / total) * 100);
     return { total, touched, percentage };
   }
   ```

2. **`audit-header.tsx`** — UI dedicated:
   ```tsx
   "use client";
   import Link from "next/link";
   import { ArrowLeft, Store, Calendar, FileText } from "lucide-react";
   import { StatusBadge } from "@/shared/components";
   import { formatDate } from "@/lib/format";
   import { cn } from "@/lib/utils";
   import type { AuditSession } from "@/shared/types";
   import type { ProgressInfo } from "../_lib/derive-progress";

   interface AuditHeaderProps {
     session: AuditSession;
     progress: ProgressInfo;
     isReadOnly: boolean;
     readOnlyReason?: string;
     draftStatusSlot?: React.ReactNode; // phase 05 mounts here
   }

   export function AuditHeader({ session, progress, isReadOnly, readOnlyReason, draftStatusSlot }: AuditHeaderProps) {
     const { assignment, checklist } = session;
     return (
       <header className="border-b bg-background px-4 py-3 space-y-3">
         {/* Row 1: back + name + status */}
         <div className="flex items-start gap-3">
           <Link href="/qc/my-assignments" className="mt-0.5 text-muted-foreground hover:text-foreground">
             <ArrowLeft className="w-5 h-5" />
           </Link>
           <div className="flex-1 min-w-0">
             <div className="flex items-center gap-2 flex-wrap">
               <h1 className="text-lg font-semibold leading-tight">{assignment.store.name}</h1>
               <span className="text-xs font-mono px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                 {assignment.store.code}
               </span>
             </div>
           </div>
           <StatusBadge status={assignment.status} />
         </div>

         {/* Row 2: meta strip */}
         <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground pl-8">
           <span className="inline-flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {assignment.plan.name}</span>
           <span>{formatDate(assignment.plan.startDate)} – {formatDate(assignment.plan.endDate)}</span>
           <span className="inline-flex items-center gap-1"><FileText className="w-3.5 h-3.5" /> {checklist.name} v{checklist.version}</span>
           {draftStatusSlot}
         </div>

         {/* Read-only banner */}
         {isReadOnly && readOnlyReason && (
           <p className="text-sm font-medium text-warning pl-8">{readOnlyReason}</p>
         )}

         {/* Progress bar */}
         <div className="pl-8 space-y-1">
           <div className="flex justify-between text-xs text-muted-foreground">
             <span>Tiến độ đánh giá</span>
             <span className="tabular-nums">{progress.touched}/{progress.total} ({progress.percentage}%)</span>
           </div>
           <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
             <div
               className={cn("h-full bg-primary transition-all", progress.percentage === 100 && "bg-success")}
               style={{ width: `${progress.percentage}%` }}
             />
           </div>
         </div>
       </header>
     );
   }
   ```

3. **Wire vào `page.tsx`:**
   - Import `AuditHeader`, `deriveProgress`.
   - Tính `progress = deriveProgress(session, violations)` trong render.
   - Tính `readOnlyReason` (string hiện tại).
   - Thay block `<div className="px-4 py-4 border-b …"> … </div>` bằng `<AuditHeader session={session} progress={progress} isReadOnly={isReadOnly} readOnlyReason={…} draftStatusSlot={<DraftStatus … />} />` (DraftStatus phase 05 — tạm `null`).

4. **Typecheck** + manual UI test mobile DevTools (375px).

## Todo list
- [ ] Tạo `derive-progress.ts`
- [ ] Tạo `audit-header.tsx`
- [ ] Refactor `page.tsx` dùng `AuditHeader`
- [ ] Xoá block header cũ inline trong page
- [ ] `npm run typecheck` pass
- [ ] Mobile DevTools test (375px, 768px)

## Success criteria
- Header có store name + code + status + plan dates + checklist name.
- Progress bar update real-time khi đánh dấu lỗi.
- Read-only banner vẫn hiển thị đúng khi out-of-window hoặc completed.
- Page không vỡ layout mobile.

## Risk assessment
| Risk | Mitigation |
|------|------------|
| Progress định nghĩa "đánh giá xong" mơ hồ — touched/total có thể gây hiểu lầm | Label rõ "Tiêu chí có lỗi / Tổng" hoặc đổi thành "Đã chạm tới" — defer poll user nếu UX team feedback |
| Header chiếm nhiều dọc trên mobile | Meta strip wrap, không sticky. SectionTabBar mới là sticky |
| `address` không có trong store payload | Bỏ qua, chỉ hiển thị name + code |

## Security considerations
- Không thay đổi quyền — read-only của BE vẫn quyết định.

## Next steps
- Phase 03 build `SectionTabBar` thành tab động (CCP/RISK virtual).
- Phase 05 mount `<DraftStatus>` vào slot.
