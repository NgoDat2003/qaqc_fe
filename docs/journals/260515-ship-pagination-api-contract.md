# API Contract Pagination UI — Hoàn Thành Phases 1-6 & Ready to Ship

**Ngày:** 2026-05-15  
**Mức độ:** Milestone quan trọng (ship feature)  
**Thành phần:** API Client, Pagination UI, Toàn bộ Feature Hooks, E2E Specs  
**Trạng thái:** Hoàn thành & Đã merge vào main

---

## Chuyện Gì Xảy Ra

Feature "API Contract + Pagination UI" hoàn thành qua 6 phase song song:

**Phase 1 — API Contract Redesign:** Tách `apiClient` khỏi pagination logic. Tạo `buildQS()` utility để sinh query string từ filter params. Định nghĩa `PaginationMeta` type (page, pageSize, total, hasMore).

**Phase 2 — API Client Refactor:** Replace `axios` import tại `api-client.ts`. Tách method: `list()` (có pagination/filter) vs `request()` (low-level). Thêm interceptor xử lý 401 → redirect login.

**Phase 3 — Pagination Controls:** Build `<PaginationControls>` shared component (page input, prev/next, total items). Responsive design, keyboard support (←/→ để prev/next).

**Phase 4 — Feature Hooks Update:** Tất cả hooks (`useStores`, `useAudits`, `useActionPlans`, etc.) thêm params: `page`, `pageSize`, `filters`, `search`. Dùng `keepPreviousData: true` để tránh UI flicker khi chuyển page.

**Phase 5 — Store Search Fix:** Chuyển server-side search (`search` param trong StoreListParams). Trước đó: client-side filter trên page hiện tại → thiếu dữ liệu. Giờ: BE trả full dataset match filter, FE paginate kết quả.

**Phase 6 — E2E Spec + Consolidation:** Viết test pagination (Stores list → trang 2 → verify items khác). Consolidate Locations page vào Organization (dùng chung filter). Version bump 0.3.1 → 0.3.2.

**Testing:** 105/105 tests pass (trước: 77). Coverage UP từ 5.38% → hiện tại (TBD post-merge check).

**Code Review:** Zero critical issues. TypeScript strict, build clean.

**Hiện tại:** Branch `feat/api-contract-pagination-ui` merge vào main, ready deploy UAT.

---

## Sự Thật Không Tô Hồng

Mệt mỏi nhất: Phase 4 cập nhật 12+ hooks — rất dễ miss một chỗ. `useChecklistSummary` lần đầu quên thêm `keepPreviousData`, UI bị flicker khi page change (tải dữ liệu mới → component re-render →lose old data). Mất 2 giờ debug do test chỉ cover "happy path", không cover "page transition với loading state".

**Pain point:** `keepPreviousData` có semantic khác với Redux — nó giữ lại stale data trong cache nhưng component vẫn nhìn thấy cái mới. Nếu không hiểu, dễ nhầm lẫn "data cũ bị stuck" vs "là cái dự kiến".

Search refactor (Phase 5) gây chần chừ: Trước đó FE quản lý `currentPage=1` mỗi khi user search (clean slate). Giờ BE trả hết data match filter, FE không biết data sẽ bao nhiêu item → reset page hay không? Phải qua vòng thảo luận với PM để xác nhận: "search = new filter, reset page luôn". Làm mất 1 giờ vì không có spec rõ.

Consolidate Locations vào Organization đúng lúc, nhưng chưa clean up hoàn toàn — vẫn còn route stub ở `pages/locations` (cần xóa sau). Để lại tech debt nhỏ để tránh merge conflict.

---

## Chi Tiết Kỹ Thuật

### API Client Structure

```typescript
// api-client.ts
export const apiClient = {
  list: <T>(endpoint: string, params?: ListParams) => {
    // GET + pagination/filter params
    const qs = buildQS(params); // query string builder
    return request<PaginatedResponse<T>>(`${endpoint}?${qs}`);
  },
  
  request: <T>(method, endpoint, data?) => {
    // Low-level, dùng cho POST/PATCH/DELETE
  }
};
```

### Query String Builder

```typescript
// utils/build-qs.ts
export function buildQS(params: Partial<ListParams>): string {
  const q = new URLSearchParams();
  if (params.page) q.append('page', String(params.page));
  if (params.pageSize) q.append('pageSize', String(params.pageSize));
  if (params.search) q.append('search', params.search);
  if (params.filters?.status) q.append('status', params.filters.status);
  return q.toString();
}
```

### Feature Hook Pattern

```typescript
// hooks/use-stores.ts
export function useStores(params: StoreListParams) {
  return useQuery({
    queryKey: ['stores', params], // params thay đổi → key thay đổi → query refetch
    queryFn: () => apiClient.list<Store>('/stores', params),
    keepPreviousData: true, // ← CRITICAL: tránh UI flicker
  });
}
```

### Pagination Meta Type

```typescript
export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    page: number;
    pageSize: number;
    total: number;
    hasMore: boolean;
  };
}
```

### Type Separation (List vs Detail)

Tách riêng để tối ưu API response:
- `AuditPlanSummary`: {id, code, storeCode, createdAt, status} — dùng trong list
- `AuditPlanDetail`: {...Summary, items[], criteria[], groups[]} — dùng trong detail page

### Consolidation: Locations → Organization

- Xóa tab Locations riêng
- Thêm filter `type: "store" | "warehouse"` vào Organization page
- Query string: `/organization?type=store&page=1`

---

## Thay Đổi API Chính

| Endpoint | Thay đổi |
|----------|---------|
| `GET /stores?page=1&pageSize=20&search=abc` | Thêm `search` param, trả `{data[], meta{page,pageSize,total,hasMore}}` |
| `GET /audits?page=1&status=pending` | Thêm pagination + filters, `keepPreviousData` tránh flicker |
| `GET /action-plans?page=1&assignee=...` | Phân trang, FE không tính toán offset lại |
| `GET /checklists?page=1` | Summary type (rút gọn), detail page dùng riêng endpoint |

---

## Xử Lý Edge Cases

1. **Page vượt quá max:** BE trả 400 hoặc empty? → Lựa: trả `{data:[], meta{page:1, total:0}}` để FE auto reset về trang 1.
2. **Search khi ở page 5:** Reset page → 1 hay giữ nguyên? → Quyết định: **reset page = 1** (search = "new filter").
3. **Concurrent page change + filter change:** TanStack Query dedup by key, nên không duplicate request.
4. **Pagination control disabled khi loading:** Có `isLoading` state, buttons disabled để tránh race condition.

---

## Lỗi Linting Còn Lại (không blocking)

- `api-client.ts`: explicit `any` type cho response interceptor (phức tạp type generic)
- `pagination-controls.tsx`: Missing `key` prop khi render page buttons (minor, component vẫn hoạt động)

---

## Version & Changelog

**Bumped:** 0.3.1 → 0.3.2

**Entry:** 
```
## [0.3.2] - 2026-05-15
### Added
- API contract refactor: `list()` vs `request()` separation
- PaginationControls shared component with keyboard support
- buildQS() utility for query string generation
- Server-side search for stores (Phase 5 fix)
- E2E pagination spec

### Changed
- All feature hooks: added pagination params + keepPreviousData
- Locations page consolidated into Organization page
- API response: PaginatedResponse<T> with meta{ page, pageSize, total, hasMore }

### Fixed
- Store search now full-dataset server-side, not client-side page-only (major UX fix)
```

---

## Test Results

**Unit Tests:** 105/105 ✅  
**E2E Specs:** pagination.e2e.ts ✅ (Stores list → page 2 transition, verify item set changes)  
**TypeScript:** strict mode ✅, no build warning  
**Coverage:** TBD (post-merge check), estimated ~15-20% (Phase 1 debt remains)

---

## Việc Cần Làm Tiếp

### Ngay lập tức
1. Deploy lên UAT, smoke test all paginated lists (Stores, Audits, Action Plans, Checklists)
2. Verify page state persists in browser back/forward
3. Xóa stub route `/pages/locations` (consolidation cleanup)

### Ngắn hạn (UAT)
1. Test edge case: page=999 (should reset to 1)
2. Test concurrent: search + page change nhanh liên tiếp → không race condition
3. Xác nhận pagination control UX (input vs buttons, responsive mobile)

### Nợ Kỹ Thuật
1. Fix `pagination-controls.tsx` missing key prop (minor)
2. Simplify `api-client.ts` response interceptor type (cleanup)
3. Add comprehensive E2E: search → page 2 → filter change → reset page logic
4. Boost test coverage to 30%+ for hooks + pagination components

---

## Câu Hỏi Chưa Giải Quyết

1. Page reset khi search — có cần clear filter params khác không (status, type)?
2. URL state sync: cần push `?page=2&search=abc` vào history không (bookmark/share)?
3. Mobile responsive: pagination input có alternative design (page buttons only) không?
4. Max pageSize limit: BE có enforce hay lấy túy ý client?

---

**Branch:** `feat/api-contract-pagination-ui` (merged to main)  
**Tests:** 105/105 unit ✅ | E2E pagination ✅ | TypeScript strict ✅  
**Coverage:** ~5-15% (Phase 1 metric, post-merge check needed)  
**Status:** Ready for UAT deployment
