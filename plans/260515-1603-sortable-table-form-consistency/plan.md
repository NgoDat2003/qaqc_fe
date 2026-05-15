---
title: SortableTable + Form Style Consistency
status: in_progress
priority: high
created: 2026-05-15
branch: dev
blockedBy: []
blocks: []
---

# SortableTable + Form Style Consistency

2 tasks độc lập, thực hiện tuần tự.

## Task 1 — `SortableTable<T>` component

**Mục tiêu:** 1 component duy nhất nhận full data + column defs, tự xử lý sort + pagination. Các trang chỉ cần pass `columns` và `data`.

**Hiện trạng:**
- `DataTable` — render only, không sort, không pagination
- `PaginationControls` — đã có Ant Design numbered pagination (1,2,3,...,last)
- Sort logic hiện nằm rải rác trong `organization/page.tsx` (sortByKey, SortHeader, sortPage state)

**Component API:**
```tsx
<SortableTable
  columns={[
    { header: "Tên", sortKey: "name", cell: (b) => b.name },
    { header: "Mã", cell: (b) => <code>{b.code}</code> },
    { header: "Trạng thái", cell: (b) => <StatusBadge ... /> },
  ]}
  data={brands}            // Brand[] — full dataset
  defaultPageSize={20}     // optional, default: 20
  emptyTitle="Chưa có dữ liệu"
/>
```

**ColumnDef mới:**
```ts
export interface SortableColumnDef<T> {
  header: string;          // plain string (dùng làm sort header button label)
  sortKey?: keyof T;       // nếu có → column này sortable
  cell: (item: T) => React.ReactNode;
  className?: string;
  hideOnMobile?: boolean;
}
```

**Nội tại component:**
- `useState` cho `sortKey`, `sortDir`, `page`
- `useMemo` → sort → paginate → render
- Sort header: click → toggle asc/desc, icon ChevronUp/Down/ChevronsUpDown
- Pagination: dùng lại `PaginationControls` đã có
- Loading state: skeleton rows (giống DataTable)

**File:** `src/shared/components/sortable-table.tsx` (~120 lines)

## Task 2 — Form style consistency

**Vấn đề:** Drawer dùng `font-black text-[11px] uppercase tracking-widest text-gray-400` cho label — trông rất khác với phần còn lại của UI (dùng system font sans-serif, weight bình thường).

**Fix:** Tạo constants file chung + update tất cả drawers.

**File mới:** `src/shared/styles/drawer-form-styles.ts`
```ts
// Consistent form label style across all drawers
export const LABEL_CLASS = "text-sm font-medium text-foreground";
export const INPUT_CLASS  = "h-10 rounded-lg";
export const SELECT_CLASS = "h-10 rounded-lg";
```

**Files cần update:**
- `src/features/master-data/components/store-drawer.tsx` — xóa LBL, INP, SEL constants cũ, import từ shared
- `src/features/master-data/components/brand-drawer.tsx` — update labels
- `src/features/master-data/components/user-drawer.tsx` — update labels (nếu có custom style)

## Phases

| Phase | Task | Files | Effort |
|-------|------|-------|--------|
| [Phase 1](phase-01-sortable-table.md) | Tạo SortableTable component | `sortable-table.tsx` | 30 min |
| [Phase 2](phase-02-update-organization-page.md) | Update organization/page.tsx dùng SortableTable | `organization/page.tsx` | 15 min |
| [Phase 3](phase-03-form-style-consistency.md) | Form style constants + update drawers | `drawer-form-styles.ts`, drawers | 20 min |

## Success Criteria

- [ ] `<SortableTable columns={...} data={...} />` hoạt động với sort + pagination
- [ ] Click header → toggle sort, icon hiện đúng
- [ ] Pagination numbered Ant Design style, default 20 per page
- [ ] Organization page bỏ được manual sort/pagination state
- [ ] Labels trong tất cả drawers dùng cùng 1 style, khớp với phần còn lại UI
- [ ] `npm run typecheck` clean, `npm run test -- --run` pass
