# Phase 05 — Pagination UI: PaginationControls Component

**Priority:** High (cần trước Phase 4)
**Status:** ✅ done
**Effort:** ~30 min
**Depends on:** Phase 01 (types)

## Overview

Tạo shared component `PaginationControls` với smart page number display kiểu Ant Design:
`1, 2, 3 … 6, 7, 8 … 11, 12` — tự động tính trang nào hiện, trang nào collapse thành `…`

**Không cần thêm thư viện** — dùng `Button` (shadcn/ui đã có) + `MoreHorizontal` (lucide đã có).

## Thư viện hiện tại có đủ không?

| Option | Verdict |
|--------|---------|
| `shadcn/ui` Pagination component (`npx shadcn add pagination`) | Có — nhưng thiết kế cho link-based nav (Next.js `<Link>`), không phù hợp callback API của DataTable |
| `@radix-ui` | Không có pagination primitive |
| **Build từ scratch** với `Button` + `MoreHorizontal` | ✅ **Đơn giản nhất, không dependency mới** |

→ **Chọn: build từ scratch.** 2 file, ~50 dòng code.

## Files

- `src/shared/components/pagination-controls.tsx` ← tạo mới
- `src/shared/components/index.ts` ← thêm export

## Implementation

### 1. Smart page algorithm (inline trong component)

```typescript
// Trả về array: number = trang hiển thị, "ellipsis" = dấu ...
function getPageRange(current: number, total: number): (number | "ellipsis")[] {
  // Ít trang → show all
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  const delta = 2; // số trang xung quanh current
  const left  = Math.max(2, current - delta);
  const right = Math.min(total - 1, current + delta);

  const middle: number[] = [];
  for (let i = left; i <= right; i++) middle.push(i);

  const result: (number | "ellipsis")[] = [1];
  if (left > 2) result.push("ellipsis");
  result.push(...middle);
  if (right < total - 1) result.push("ellipsis");
  result.push(total);
  return result;
}
```

**Ví dụ output:**
| current | total | Output |
|---------|-------|--------|
| 1 | 12 | 1, 2, 3, …, 12 |
| 7 | 12 | 1, …, 5, 6, 7, 8, 9, …, 12 |
| 11 | 12 | 1, …, 9, 10, 11, 12 |
| 3 | 6 | 1, 2, 3, 4, 5, 6 (≤7 nên show all) |

### 2. Component

```tsx
"use client";

import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PaginationControlsProps {
  page: number;
  totalPages: number;
  total: number;
  onPageChange: (page: number) => void;
}

function getPageRange(current: number, total: number): (number | "ellipsis")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const delta = 2;
  const left  = Math.max(2, current - delta);
  const right = Math.min(total - 1, current + delta);
  const middle: number[] = [];
  for (let i = left; i <= right; i++) middle.push(i);
  const result: (number | "ellipsis")[] = [1];
  if (left > 2) result.push("ellipsis");
  result.push(...middle);
  if (right < total - 1) result.push("ellipsis");
  result.push(total);
  return result;
}

export function PaginationControls({
  page,
  totalPages,
  total,
  onPageChange,
}: PaginationControlsProps) {
  if (totalPages <= 1) return null;

  const pages = getPageRange(page, totalPages);

  return (
    <div className="flex items-center justify-between px-2 py-2 text-sm text-muted-foreground">
      <span>
        Tổng <strong className="text-foreground">{total}</strong> bản ghi
      </span>
      <div className="flex items-center gap-1">
        {/* Prev */}
        <Button
          variant="outline"
          size="icon"
          className="h-7 w-7"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          aria-label="Trang trước"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        {/* Page numbers */}
        {pages.map((p, i) =>
          p === "ellipsis" ? (
            <span key={`e-${i}`} className="h-7 w-7 flex items-center justify-center text-muted-foreground">
              <MoreHorizontal className="h-3 w-3" />
            </span>
          ) : (
            <Button
              key={p}
              variant={p === page ? "default" : "outline"}
              size="icon"
              className="h-7 w-7 text-xs"
              onClick={() => onPageChange(p)}
              aria-current={p === page ? "page" : undefined}
            >
              {p}
            </Button>
          )
        )}

        {/* Next */}
        <Button
          variant="outline"
          size="icon"
          className="h-7 w-7"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          aria-label="Trang sau"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
```

### 3. Export từ `src/shared/components/index.ts`

```typescript
export { PaginationControls } from "./pagination-controls";
```

## Usage (Phase 4 reminder)

```tsx
import { PaginationControls } from "@/shared/components";

<DataTable
  data={rows}
  columns={columns}
  isLoading={isLoading}
  footerContent={
    meta && meta.totalPages > 1 ? (
      <PaginationControls
        page={meta.page}
        totalPages={meta.totalPages}
        total={meta.total}
        onPageChange={setPage}
      />
    ) : undefined
  }
/>
```

## Design Notes

- `totalPages <= 1` → component returns `null` (không render gì)
- `totalPages <= 7` → show all pages, no ellipsis
- Active page: `variant="default"` (primary color)
- Ellipsis: `MoreHorizontal` icon (lucide, đã có)
- Không cần install thêm bất kỳ package nào

## Success Criteria

- [x] `src/shared/components/pagination-controls.tsx` tạo đúng path
- [x] Export từ `index.ts`
- [x] `getPageRange(7, 12)` → `[1, "ellipsis", 5, 6, 7, 8, 9, "ellipsis", 12]`
- [x] `getPageRange(1, 6)` → `[1, 2, 3, 4, 5, 6]` (≤7 show all)
- [x] Active page highlighted, disabled state đúng
- [x] `npm run typecheck` pass (0 errors)
- [x] 77/77 tests pass
- [x] aria-label on all buttons
