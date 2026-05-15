# UI Spec — Admin Role (Company Admin)

> Design từ DB schema + reference UAT screenshots. Không copy UI cũ — chỉ lấy nghiệp vụ.
> Stack: shadcn/ui + Tailwind v4 + Lucide icons. Màu dùng CSS variables.
> **Bỏ hoàn toàn:** Địa bàn (Province/Ward management riêng). Không có upload logo/avatar (không có trong DB).

## Observations từ UAT Reference

| Nhận xét | Quyết định của chúng ta |
|----------|------------------------|
| Brand có logo upload | ❌ Skip — không có field trong DB |
| Store có Email + Mật khẩu tạm (store account) | ❌ Skip — không có trong DB |
| Địa bàn là trang riêng (tỉnh/xã cascading) | ❌ Bỏ hoàn toàn — dùng free text |
| AM phụ trách trong create store form | ✅ Thêm vào StoreDrawer (dùng assign-am action) |
| Loại store: "Cửa hàng quản lý" / "Cloud Kitchen" | ✅ Dùng label này thay "Cửa hàng tiêu chuẩn" |
| Users table có "Bộ phận" badge (role) | ✅ Hiện badge role mỗi user |
| Bộ phận có thể multi-select (QAQC tag) | ✅ Multi-role support |
| Store table không có cột "Mã / Tên cửa hàng" riêng | Mình vẫn thêm — cần thiết hơn |
| User avatar circle với initials | ✅ Avatar initials (không upload) |

---

## Trang Organization (`/master-data/organization`)

### Layout tổng thể

```
[PageHeader: "Thương hiệu & Cửa hàng"] ————————————— [+ Thêm mới]

[MetricCard: Tổng TH] [MetricCard: Tổng CH]

[Tabs: Thương hiệu | Cửa hàng]
  ↳ Brands tab:
      [DataTable + Pagination]

  ↳ Stores tab:
      [SearchInput] [Filter: Thương hiệu dropdown]
      [DataTable + Pagination]
```

---

### Brands Table

| Cột | Hiển thị | Width |
|-----|---------|-------|
| **Thương hiệu** | Avatar circle (initials from `code`, 2 ký tự đầu) + `name` (bold) + `code` (text-xs, muted) | flex |
| **Trạng thái** | `StatusBadge` (active=green "Hoạt động" / inactive=gray "Ngừng hoạt động") | 130px |
| **Cập nhật** | `updatedAt` format `DD/MM/YYYY HH:mm` | 140px |
| **Thao tác** | Button "Sửa" (outline) | 80px |

**Thao tác Brand:** Chỉ có nút **"Sửa"** — toggle active làm trong drawer edit (isActive field).

**Avatar circle:** Màu nền random từ `code` string, text trắng, 2 chữ đầu uppercase. Ví dụ: "CL" (Cloud), "MC" (Maycha), "TA" (Tam Hảo).

**MetricCards:** Thương hiệu (total) | Đang hoạt động | Ngừng hoạt động

**Empty state:** "Chưa có thương hiệu nào" + button "Thêm thương hiệu đầu tiên"

---

### Stores Table

| Cột | Hiển thị | Width | Mobile |
|-----|---------|-------|--------|
| **AM phụ trách** | `am.fullName` (bold) + `am.email` (text-xs, muted) hoặc "Chưa phân công" (muted) | 180px | hide |
| **Loại store** | Badge: "Cửa hàng quản lý" (green) / "Cloud Kitchen" (blue) | 150px | ✅ |
| **Cửa hàng** | `name` (bold) + `code` (font-mono, text-xs) | flex | ✅ |
| **Tỉnh / Thành** | `province` hoặc "—" | 150px | hide |
| **Xã/Phường & Địa chỉ** | `ward` + `address` (2 dòng, text-xs cho address) | 200px | hide |
| **Quản lý CH** | `manager.fullName` hoặc chip "Chưa gán" (amber outline) | 150px | hide |
| **Trạng thái** | `StatusBadge` | 120px | ✅ |
| **Thao tác** | Button "Sửa" (outline) | 80px | ✅ |

**Loại store label mapping:**
- `modelType = "standard"` → **"Cửa hàng quản lý"** (badge green)
- `modelType = "cloud_kitchen"` → **"Cloud Kitchen"** (badge blue)

**Search placeholder:** "Tìm theo mã, tên, địa chỉ, tỉnh/thành hoặc xã/phường"

**Filter bar:**
- SearchInput → `?search=`
- Select "Tất cả thương hiệu" | [brands] → `?brandId=`

**MetricCards:** Cửa hàng (total) | Đang hoạt động | Cửa hàng quản lý (standard count) | Cloud Kitchen

**Thao tác Store:** Chỉ nút **"Sửa"** — toggle active làm trong drawer edit (isActive switch).

**Empty state:** "Chưa có cửa hàng nào"

---

### BrandDrawer

**Header:** "Thêm thương hiệu" / "Cập nhật thương hiệu" | Width: 450px

```
[Tên thương hiệu *]
  Input — placeholder: "Ví dụ: Maycha, The Coffee House"

[Mã thương hiệu *]
  Input font-mono — placeholder: "Ví dụ: MC, CLOUD"
  Hint: "Viết hoa, không dấu, ngắn gọn. Dùng để phân loại nội bộ."

[Trạng thái vận hành]
  Select — "Đang hoạt động" / "Ngừng khai thác"

[Footer] [Hủy] [Lưu thông tin]
```

**Validation:**
- `code` + `name`: required, min 1 char
- Error từ API (duplicate): toast.error

---

### StoreDrawer

**Header:** "Tạo cửa hàng mới" / "Cập nhật cửa hàng" | Width: 620px

```
Section: Thông tin cơ bản
━━━━━━━━━━━━━━━━━━━━━━━━━━
[Mã cửa hàng *]          [Tên cửa hàng *]
  Input font-mono           Input
  placeholder: "mc-018"     placeholder: "Maycha Vincom Thảo Điền"

[Thương hiệu *]           [Loại cửa hàng *]
  Select (load useBrands)   Select
  — Chọn thương hiệu        • Cửa hàng quản lý   (= standard)
                            • Cloud Kitchen       (= cloud_kitchen)

Section: Địa chỉ
━━━━━━━━━━━━━━━━━━━━━━━━━━
[Tỉnh / Thành phố]        [Xã / Phường]
  Select dropdown            Input free-text
  • TP. Hồ Chí Minh          placeholder: "Phường Tân Tạo"
  • Bình Dương
  • Đồng Nai
  • Long An
  • Đà Nẵng
  • Thừa Thiên Huế
  • Lâm Đồng
  • Cần Thơ
  • Kiên Giang

[Địa chỉ ——————————————————————————— col-span-2]
  Textarea 2 rows — placeholder: "159 Xa Lộ Hà Nội, TP. Thủ Đức"

Section: Phân công
━━━━━━━━━━━━━━━━━━━━━━━━━━
[AM phụ trách ————————————————————— col-span-2]
  Select (load useAreaManagers → ?role=am&limit=100)
  placeholder: "Chọn Area Manager phụ trách"

[Quản lý cửa hàng ————————————————— col-span-2]
  Select (load useStoreManagers → ?role=store_manager&limit=100)
  placeholder: "Chọn Quản lý cửa hàng (Store Manager)"

[Trạng thái hoạt động ——————————————— col-span-2]
  Switch + label "Cửa hàng đang hoạt động và tham gia Audit"

[Footer] [Hủy] [Tạo cửa hàng / Lưu thay đổi]
```

**Required:** code, name, brandId, modelType
**Optional:** province, ward, address, amId, managerId (có thể bổ sung sau)

**Business rules:**
- `cloud_kitchen` → Brand phải có code "CLOUD" → show warning nếu sai
- AM phụ trách: khi save drawer, gọi `PATCH /api/stores/[id]/assign-am` riêng nếu amId thay đổi
  (hoặc đơn giản hơn: bỏ amId khỏi drawer, để RowAction "Phân công AM" riêng)
- Bỏ hoàn toàn: district/ward separate field, region field, upload logo/email store

**Note về AM:** Nếu BE createStore không nhận `amId` → AM gán sau qua RowAction. Nếu BE PATCH nhận `amId` qua assign-am → đưa vào edit drawer. Cần kiểm tra lại.

---

## Trang Users (`/master-data/users`)

### Layout

```
[PageHeader: "Quản lý Người dùng"] ———————————— [+ Thêm người dùng]

[MetricCard: Tổng users] [MetricCard: Đang hoạt động]

[SearchInput] [Filter: Vai trò]
[DataTable + Pagination]
```

---

### Users Table

| Cột | Hiển thị | Width | Mobile |
|-----|---------|-------|--------|
| **Người dùng** | Avatar circle (initials) + `fullName` (bold) + `email` (text-xs, muted) | flex | ✅ |
| **Bộ phận** | Badge(s) roleKey — tối đa 2 hiện, còn lại "+N" | 160px | ✅ |
| **Điện thoại** | `phone` hoặc "—" | 130px | hide |
| **Trạng thái** | `StatusBadge` | 120px | ✅ |
| **Thao tác** | Button "Sửa" (outline) | 80px | ✅ |

**Avatar circle:** Lấy 2 chữ đầu của `fullName`, màu nền random từ string hash.

**Role badge label mapping:**
| roleKey | Label hiển thị | Color |
|---------|---------------|-------|
| `company_admin` | Quản trị | gold/primary |
| `qa_manager` | QA Manager | purple |
| `qc_auditor` | QAQC | amber |
| `am` | Area Manager | cyan |
| `store_manager` | Quản lý CH | green |
| `executive_viewer` | Xem báo cáo | gray |

**MetricCards:** Tổng user | Đang hoạt động | Ngừng hoạt động

**Thao tác User:** Chỉ nút **"Sửa"** — toggle active trong drawer edit.

---

### UserDrawer

**Header:** "Tạo người dùng mới" / "Cập nhật người dùng" | Width: 520px

```
[Họ và tên *]
  Input — placeholder: "Nguyễn Văn A"

[Email *]
  Input type="email" — placeholder: "qa.manager@maycha.com.vn"
  ⚠️ Không cho edit khi update (disabled + hint "Email không thể thay đổi")

[Số điện thoại]
  Input type="tel" — placeholder: "0901234567"

[Mật khẩu tạm *]  ← CHỈ hiện khi CREATE
  Input type="password" — placeholder: "Tối thiểu 6 ký tự"

Section: Bộ phận / Vai trò
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Bộ phận *
  Multi-select (Combobox hoặc checkbox list):
  ☐ Quản trị công ty   (company_admin)
  ☐ QA Manager         (qa_manager)
  ☐ QAQC Auditor       (qc_auditor)
  ☐ Area Manager       (am)
  ☐ Quản lý cửa hàng  (store_manager)
  ☐ Xem báo cáo        (executive_viewer)

  → Khi check "Quản lý cửa hàng": hiện thêm
    [Cửa hàng phụ trách]
      Select — load stores → storeId cho role assignment

[Trạng thái tài khoản]
  Select — "Hoạt động" / "Ngừng hoạt động"
  (default: Hoạt động)

[Footer] [Hủy] [Tạo người dùng / Lưu thay đổi]
```

**Required:** fullName, email, password (create only), ≥1 role
**Optional:** phone

**Payload gửi đi (POST):**
```ts
{
  fullName, email, password, phone,
  roleAssignments: [
    { roleKey: "store_manager", storeId: "xxx" },
    { roleKey: "am" }
  ]
}
```

**Khi update (PATCH):** Chỉ `fullName`, `phone`, `isActive` — không update email/password/roles qua drawer này (giữ đơn giản).

---

## Design System chung cho tất cả Drawers

```tsx
// FormLabel
className="font-black text-[11px] uppercase tracking-widest text-gray-400"

// Input / Textarea
className="h-11 rounded-xl border-gray-200 focus:border-primary shadow-sm"

// SelectTrigger
className="h-11 rounded-xl border-gray-200 focus:ring-primary shadow-sm"

// Section divider trong drawer
<div className="text-[10px] font-black uppercase tracking-widest text-gray-400 pt-2 pb-1 border-b">
  Tên section
</div>

// Footer buttons
<Button variant="outline" className="rounded-xl font-bold h-11 px-6">Hủy</Button>
<Button className="bg-primary rounded-xl font-black h-11 min-w-[150px] shadow-lg shadow-primary/20">
  Lưu thông tin
</Button>
```

---

## Data Loading Strategy

> **Pattern:** Load-all-once + client-side filter/sort/search (không phải server-side pagination)

```
Page mount → GET /api/stores (all) → cache trong useQuery
User search   → useMemo filter → instant (0ms)
User sort col → useMemo sort  → instant (0ms)
User filter   → useMemo filter → instant (0ms)
Pagination    → useMemo slice → client-side, instant
```

**Lý do:** UAT 300 records ≈ 300ms. Client-side filter nhanh hơn mỗi round-trip API.
**Giới hạn:** Phù hợp đến ~1000 records. Brands (~10), Stores (~300), Users (~250) = OK.

### Sort pattern (Ant Design style)

```ts
// State
const [sortKey, setSortKey] = useState<keyof Store>("code");
const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

// Toggle sort on column click
const handleSort = (key: keyof Store) => {
  if (sortKey === key) setSortDir(d => d === "asc" ? "desc" : "asc");
  else { setSortKey(key); setSortDir("asc"); }
};

// In useMemo
.sort((a, b) => {
  const cmp = String(a[sortKey]).localeCompare(String(b[sortKey]));
  return sortDir === "asc" ? cmp : -cmp;
})
```

### Column header với sort indicator

```tsx
// Sortable column header
<button onClick={() => handleSort("name")} className="flex items-center gap-1 hover:text-primary">
  Tên cửa hàng
  {sortKey === "name" ? (
    sortDir === "asc" ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />
  ) : (
    <ChevronsUpDown className="h-3 w-3 text-muted-foreground" />
  )}
</button>
```

**Columns có sort cho Stores table:** `name`, `code`, `province`, `modelType`, `isActive`
**Columns có sort cho Brands table:** `name`, `code`, `isActive`
**Columns có sort cho Users table:** `fullName`, `email`, `isActive`

---

## UX Patterns quan trọng

| Pattern | Cách làm |
|---------|---------|
| Loading state | Skeleton rows trong DataTable |
| Empty search | "Không tìm thấy cửa hàng nào với từ khóa ..." |
| Mutation success | `toast.success(...)` |
| Mutation error | `toast.error("Có lỗi xảy ra, vui lòng thử lại")` |
| API error message | Hiện message từ BE nếu có (duplicate code, brand isolation...) |
| Toggle confirm | Không cần dialog — action reversible, toast đủ |
| Required fields | `*` đỏ bên cạnh label |
| Pagination | `PaginationControls` component (đã có) |
