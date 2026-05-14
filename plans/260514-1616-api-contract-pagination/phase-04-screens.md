# Phase 04 — Screens: 7 List Pages

**Priority:** High
**Status:** ✅ done
**Effort:** ~1.5 h
**Depends on:** Phase 03 + Phase 05

## Overview

Cập nhật 7 list screens để:
1. Dùng `hook.data.data` (array) thay vì `hook.data` trực tiếp
2. Dùng `hook.data.meta.total` thay vì `data.length`
3. Đưa pagination state (`page`, `limit`) vào hook params
4. Chuyển filter server-side (status, storeId, brandId, isActive, groupId) từ `useMemo` sang hook params
5. Giữ text search client-side (BE chưa hỗ trợ)
6. Gắn `<PaginationControls>` vào `footerContent` của DataTable

## Pattern Chuẩn Cho Mọi Screen

```typescript
// Pagination state
const [page, setPage] = useState(1);
const LIMIT = 20;

// Hook với pagination params
const { data, isLoading } = useSomeList({ page, limit: LIMIT, /* filters */ });

const rows = data?.data ?? [];
const meta = data?.meta;

// Reset về page 1 khi filter thay đổi
useEffect(() => { setPage(1); }, [filterValue]);

// Render
<DataTable
  data={rows}
  columns={columns}
  isLoading={isLoading}
  footerContent={
    meta && meta.totalPages > 1 && (
      <PaginationControls
        page={meta.page}
        totalPages={meta.totalPages}
        total={meta.total}
        onPageChange={setPage}
      />
    )
  }
/>
```

## Screen-by-Screen

---

### 1. `src/app/(dashboard)/operations/audits/page.tsx`

**Filter changes:**
- `storeId` filter → server-side (thêm vào `useAudits` params)
- Text search → giữ client-side (`useMemo` trên `rows`)

**Key changes:**
```typescript
const [page, setPage] = useState(1);
const [storeId, setStoreId] = useState<string | undefined>();

const { data, isLoading } = useAudits({ page, limit: 20, storeId });
const rows = data?.data ?? [];
const meta = data?.meta;

// Text search vẫn client-side nếu có
const filtered = useMemo(() => rows.filter(/* text search */), [rows, searchText]);
```

**Xóa:** Bất kỳ `data.length` nào dùng làm tổng count → thay bằng `meta?.total ?? 0`.

---

### 2. `src/app/(dashboard)/operations/action-plan/page.tsx`

**Filter changes (quan trọng):**
- `status` filter → **server-side** (`useActionPlans({ status })`)
- `storeId` filter nếu có → server-side
- Text search (store name/code) → giữ client-side

```typescript
const [page, setPage] = useState(1);
const [statusFilter, setStatusFilter] = useState<"draft"|"submitted"|"rejected"|"closed"|undefined>();

const { data, isLoading } = useActionPlans({ page, limit: 20, status: statusFilter });
const rows = data?.data ?? [];
const meta = data?.meta;

// Reset page khi đổi status
useEffect(() => { setPage(1); }, [statusFilter]);

// Text search client-side
const filtered = useMemo(() => {
  if (!search) return rows;
  const q = search.toLowerCase();
  return rows.filter(p =>
    p.store?.name?.toLowerCase().includes(q) ||
    p.store?.code?.toLowerCase().includes(q)
  );
}, [rows, search]);
```

**Xóa:** `statusFilter !== "all"` logic từ `useMemo` — giờ server handle.

---

### 3. `src/app/(dashboard)/operations/audit-plans/page.tsx`

**Breaking change:** List response không còn `.assignments` array → xóa bất kỳ read nào từ `plan.assignments`.

```typescript
const [page, setPage] = useState(1);
const { data, isLoading } = useAuditPlans({ page, limit: 20 });
const rows = data?.data ?? []; // AuditPlanSummary[]
const meta = data?.meta;
```

**Column cần check:** Nếu có column hiện số assignments → dùng `plan._count.assignments` (đã có trong summary).

**KHÔNG được đọc:** `plan.assignments[0]`, `plan.assignments.length` từ list — phải gọi detail route nếu cần.

---

### 4. `src/app/(dashboard)/master-data/locations/page.tsx` (Stores + Brands)

**Stores tab:**
```typescript
const [storePage, setStorePage] = useState(1);
const [brandId, setBrandId] = useState<string | undefined>();
const [isActive, setIsActive] = useState<boolean | undefined>();

const { data: storeData, isLoading: storeLoading } = useStores({
  page: storePage, limit: 20, brandId, isActive
});
const stores = storeData?.data ?? [];
const storeMeta = storeData?.meta;

useEffect(() => { setStorePage(1); }, [brandId, isActive]);
```

**Brands tab:**
```typescript
const [brandPage, setBrandPage] = useState(1);
const { data: brandData, isLoading: brandLoading } = useBrands({ page: brandPage, limit: 20 });
const brands = brandData?.data ?? [];
const brandMeta = brandData?.meta;
```

**Text search trên stores/brands:** Giữ `useMemo` filter vì BE chưa có text search.

---

### 5. `src/app/(dashboard)/master-data/users/page.tsx`

```typescript
const [page, setPage] = useState(1);
const { data, isLoading } = useUsers({ page, limit: 20 });
const rows = data?.data ?? [];
const meta = data?.meta;
```

Text search client-side. **Check:** `roleAssignments` thay vì `roles` — đảm bảo column display dùng `user.roleAssignments`.

---

### 6. `src/app/(dashboard)/operations/checklists/page.tsx`

**Breaking change:** `rows` giờ là `ChecklistSummary[]`, không có `.sections`.

```typescript
const [page, setPage] = useState(1);
const [statusFilter, setStatusFilter] = useState<string | undefined>();

const { data, isLoading } = useChecklists({ page, limit: 20, status: statusFilter });
const rows = data?.data ?? []; // ChecklistSummary[]
const meta = data?.meta;

useEffect(() => { setPage(1); }, [statusFilter]);
```

**Column check:**
- Hiển thị số sections: dùng `checklist._count.sections` ✓
- Hiển thị số audit plans: dùng `checklist._count.auditPlans` ✓
- **KHÔNG đọc:** `checklist.sections`, `checklist.sections.length`

---

### 7. `src/app/(dashboard)/operations/criteria/page.tsx`

```typescript
const [page, setPage] = useState(1);
const [groupId, setGroupId] = useState<string | undefined>();

const { data, isLoading } = useCriteria({ page, limit: 20, groupId });
const rows = data?.data ?? [];
const meta = data?.meta;

useEffect(() => { setPage(1); }, [groupId]);
```

Group filter → server-side. Text search → client-side nếu có.

---

## DataTable footerContent Pattern

```tsx
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
```

Ẩn pagination nếu chỉ có 1 trang.

## Success Criteria

- [ ] 7 screens dùng `data?.data` cho rows, `data?.meta` cho pagination
- [ ] Không còn `hook.data` trực tiếp làm array
- [ ] `data.length` cho count đã thay bằng `meta?.total`
- [ ] Status/storeId/brandId/isActive/groupId filter → server-side
- [ ] Text search còn lại client-side (`useMemo`)
- [ ] `<PaginationControls>` mounted với `footerContent`
- [ ] Reset về page 1 khi filter thay đổi
- [ ] Không còn `plan.assignments` hay `checklist.sections` đọc từ list response
- [ ] `npm run typecheck` pass
