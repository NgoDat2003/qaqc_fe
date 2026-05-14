# Phase 06 — Consolidate: Merge Locations → Organization Page

**Priority:** Medium (UX cleanup)
**Status:** ✅ done
**Effort:** ~30 min
**Depends on:** Phase 04 (screens)

## Context

Hiện tại master-data có 2 menu trùng nội dung:
- **Brands & Stores** (`/master-data/organization`) — MetricCards + DataTable nhưng **không có CRUD**
- **Locations** (`/master-data/locations`) — **Full CRUD** (StoreDrawer, BrandDrawer, RegionDrawer) + tab "Địa bàn" WIP

Mục tiêu: Gộp vào 1 page duy nhất, xóa menu Locations, giữ lại tab "Địa bàn / Khu vực" đã có.

---

## Files thay đổi

| File | Action |
|------|--------|
| `src/app/(dashboard)/master-data/organization/page.tsx` | **Rewrite** — thay bằng nội dung locations + MetricCards |
| `src/app/(dashboard)/master-data/locations/page.tsx` | **Delete** |
| `src/shared/components/app-sidebar.tsx` | **Remove** Locations menu item |

---

## Implementation

### Step 1 — Rewrite `organization/page.tsx`

Lấy `locations/page.tsx` làm base, thêm MetricCards từ organization cũ.

**Thêm MetricCards (từ organization cũ):**
```tsx
// Dùng callback pattern đã có từ fix double-call
const [totalBrands, setTotalBrands] = useState(0);
const [totalStores, setTotalStores] = useState(0);

// Khi brands/stores data load, cập nhật totals:
// brands.data?.meta.total → setTotalBrands
// stores.data?.meta.total → setTotalStores
```

**Structure mới của page:**
```
OrganizationPage
├── PageHeader (title: "Thương hiệu & Cửa hàng")
├── MetricCards row (4 cards: tổng brands, brands active, tổng stores, stores active)
└── Tabs
    ├── "Thương hiệu" (brands CRUD — từ locations)
    ├── "Địa bàn / Khu vực" (WIP placeholder — giữ nguyên từ locations)
    └── "Danh sách cửa hàng" (stores CRUD — từ locations)
```

**MetricCards active counts:**
- "Thương hiệu hoạt động": `brandRows.filter(b => b.isActive).length` (client-side từ page 1)
- "Cửa hàng hoạt động": `storeRows.filter(s => s.isActive).length` (client-side từ page 1)
- Ghi chú: Đây là xấp xỉ (chỉ đúng với page 1). Acceptable cho MVP.

**Không thêm gì mới vào Regions tab** — giữ nguyên WIP placeholder, chờ BE implement.

### Step 2 — Delete `locations/page.tsx`

Xóa file `src/app/(dashboard)/master-data/locations/page.tsx`.
Route `/master-data/locations` sẽ tự 404 — không cần redirect (không có external links).

### Step 3 — Update `app-sidebar.tsx`

Xóa entry "Locations" (`/master-data/locations`) khỏi navigation array của `company_admin`.

```typescript
// Xóa dòng này:
{ title: "Locations", url: "/master-data/locations", icon: MapPin },
```

Cũng xóa `MapPin` khỏi lucide import nếu không còn dùng ở đâu.

---

## Final result

**Master-data navigation (company_admin):**
```
System Setup
├── Brands & Stores  (/master-data/organization)  ← Full CRUD + MetricCards + 3 tabs
├── Users            (/master-data/users)
└── Import Data      (/master-data/import)
```

---

## Success Criteria

- [x] `organization/page.tsx` có đủ: MetricCards, 3 tabs (Brands/Địa bàn/Stores), CRUD drawers
- [x] `locations/page.tsx` đã xóa
- [x] Sidebar không còn "Locations" entry
- [x] `npm run typecheck` pass (0 errors)
- [x] `npm run test` pass (77/77)
