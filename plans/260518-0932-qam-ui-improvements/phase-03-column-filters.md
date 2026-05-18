# Phase 3 — Column Filter cho 3 bảng

**Effort:** 15 phút | **Status:** pending

## Overview

`SortableTable` đã hỗ trợ `filterKey` + `filterOptions` ở `SortableColumnDef`. Chỉ cần khai báo trên các cột cần lọc. Không thay đổi component dùng chung.

**Lưu ý quan trọng:** Cột "Trạng thái" của bảng users dùng field boolean `isActive`. Filter trong `SortableTable` so sánh `String(item[filterKey] ?? "")` — value của option phải là `"true"`/`"false"` (string), match với `String(true)`/`String(false)`.

## Files

**Modify:**
- `src/app/(dashboard)/qam/audit-plans/page.tsx`
- `src/app/(dashboard)/qam/criteria/page.tsx`
- `src/app/(dashboard)/master-data/users/page.tsx`

## Implementation steps

### 1. `audit-plans/page.tsx` — cột "Trạng thái"

```tsx
{
  header: "Trạng thái",
  sortKey: "status",
  filterKey: "status",
  filterOptions: [
    { value: "open", label: "Đang mở" },
    { value: "closed", label: "Đã đóng" },
  ],
  cell: (p) => ( /* unchanged */ ),
  className: "w-28",
},
```

Giữ tab pill `statusFilter` ở trên (không xóa) — đó là filter song song.

### 2. `qam/criteria/page.tsx`

**Cột "Nhóm"** — auto-derive option từ data (không cần `filterOptions`):

```tsx
{
  header: "Nhóm",
  filterKey: "groupId",
  filterOptions: groups.map((g) => ({ value: g.id, label: `${g.code} — ${g.name}` })),
  cell: (c) => <span className="text-sm font-medium">{c.group?.name ?? "—"}</span>,
  className: "w-28",
  hideOnMobile: true,
},
```

`groups` là dependency của `useMemo` columns — thêm `groups` vào deps array.

**Cột "Trạng thái"** — `isActive` là boolean, value option phải là string:

```tsx
{
  header: "Trạng thái",
  sortKey: "isActive",
  filterKey: "isActive",
  filterOptions: [
    { value: "true",  label: "Đang hoạt động" },
    { value: "false", label: "Vô hiệu hóa" },
  ],
  cell: (c) => <StatusBadge status={c.isActive ? "active" : "inactive"} />,
  className: "w-28",
},
```

Giữ nguyên Select dropdowns `groupFilter`/`statusFilter` phía trên — chúng độc lập.

### 3. `master-data/users/page.tsx` — cột "Trạng thái"

```tsx
{
  header: "Trạng thái",
  sortKey: "isActive",
  filterKey: "isActive",
  filterOptions: [
    { value: "true",  label: "Đang hoạt động" },
    { value: "false", label: "Đã khóa" },
  ],
  cell: (u) => <StatusBadge status={(u.isActive ? "active" : "locked") as AppStatus} />,
  className: "w-32",
},
```

Filter sẽ chạy `String(u.isActive)` → match `"true"`/`"false"`. Đã verify trong `sortable-table.tsx` line 175.

## Success criteria

- Mỗi cột có filter hiện icon `ListFilter` ở header
- Click → dropdown checkbox hiện đúng options
- Apply → bảng filter, badge số đếm hiện ở icon filter
- `npm run typecheck` pass
- Không xóa các Select/tab filter cũ — chúng tồn tại song song
