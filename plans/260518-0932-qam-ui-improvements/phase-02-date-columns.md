# Phase 2 — Cột Thời gian trong Audit Plan list

**Effort:** 10 phút | **Status:** pending

## Overview

Thêm cột "Thời gian" hiển thị `startDate` → `endDate` vào danh sách kế hoạch audit. Cho phép sort theo `startDate`. Ẩn trên mobile.

## Files

**Modify:**
- `src/app/(dashboard)/qam/audit-plans/page.tsx`

## Implementation steps

### 1. Import `format`

```tsx
import { format } from "date-fns";
```

### 2. Thêm cột vào `columns` array

Chèn sau cột "Kế hoạch" (index 0), trước "Tiến độ":

```tsx
{
  header: "Thời gian",
  sortKey: "startDate",
  cell: (p) => (
    <div className="text-xs text-muted-foreground space-y-0.5">
      <div>{p.startDate ? format(new Date(p.startDate), "dd/MM/yyyy") : "—"}</div>
      <div>{p.endDate ? format(new Date(p.endDate), "dd/MM/yyyy") : ""}</div>
    </div>
  ),
  className: "w-32",
  hideOnMobile: true,
},
```

### 3. Verify `AuditPlanFull` type có `startDate`/`endDate`

Đã có trong `src/shared/types/index.ts` (đã dùng trong `[id]/page.tsx`).

## Success criteria

- Cột hiển thị đúng định dạng `dd/MM/yyyy`
- Click header "Thời gian" sort theo `startDate` asc/desc
- Ẩn trên mobile (`hideOnMobile: true`)
- Không vỡ pagination/filter hiện có
- `npm run typecheck` pass
