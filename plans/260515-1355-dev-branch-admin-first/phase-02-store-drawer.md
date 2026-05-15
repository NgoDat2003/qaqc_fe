# Phase 2 — StoreDrawer Rebuild

**Effort:** 45 min
**File:** `src/features/master-data/components/store-drawer.tsx`
**Depends on:** Phase 1 (BE role filter cho manager dropdown)

---

## Vấn đề cần fix

| Bug | Root cause | Fix |
|-----|-----------|-----|
| Brand dropdown hiện ID khi edit | Brands load async, SelectValue không tìm thấy match | Drawer tự gọi `useBrands({ limit: 100 })` |
| Region rỗng | Hardcode TODO | Dropdown 3 khu vực cố định |
| Province chỉ 2 tỉnh, sai value | `hcm`/`hn` không match DB | Dropdown 9 tỉnh MayCha, value = tên đầy đủ |
| Manager rỗng | Chưa gọi API | `useStoreManagers()` = users có role store_manager |
| Required quá nhiều | DB nullable nhưng form bắt buộc | Chỉ require: code, name, brandId, modelType |
| Design không nhất quán | Style khác BrandDrawer | Align theo BrandDrawer design system |

---

## Thay đổi hooks/api (làm trước)

### `src/features/master-data/api/master.api.ts`
```ts
// Thêm role param vào getUsers
getUsers: (params?: ListParams & { role?: string }): Promise<ListResponse<User>> =>
  apiClient.list<User>(`/users${buildQS(params)}`),
```

### `src/features/master-data/hooks/use-users.ts`
```ts
type UserListParams = ListParams & { role?: string };

export function useUsers(params?: UserListParams) {
  return useQuery<ListResponse<User>>({
    queryKey: ["users", params],
    queryFn: () => masterApi.getUsers(params),
    placeholderData: keepPreviousData,
  });
}

// Hook convenience cho manager dropdown
export function useStoreManagers() {
  return useUsers({ role: "store_manager", limit: 100 });
}
```

---

## StoreDrawer — Schema mới

```ts
const formSchema = z.object({
  code:      z.string().min(2, "Mã cửa hàng tối thiểu 2 ký tự"),
  name:      z.string().min(2, "Tên cửa hàng là bắt buộc"),
  brandId:   z.string().min(1, "Thương hiệu là bắt buộc"),
  modelType: z.enum(["standard", "cloud_kitchen"]),
  region:    z.string().optional(),
  province:  z.string().optional(),
  district:  z.string().optional(),
  ward:      z.string().optional(),
  address:   z.string().optional(),
  managerId: z.string().optional(),
  isActive:  z.boolean(),
});
```

**Đổi `brand` → `brandId`** — rõ nghĩa hơn, khớp với DB field name.

---

## Data constants (hardcode trong file)

```ts
const REGIONS = [
  { value: "Miền Nam",   label: "Miền Nam" },
  { value: "Miền Trung", label: "Miền Trung" },
  { value: "Miền Bắc",  label: "Miền Bắc" },
];

const PROVINCES = [
  "TP. Hồ Chí Minh",
  "Bình Dương",
  "Đồng Nai",
  "Long An",
  "Đà Nẵng",
  "Thừa Thiên Huế",
  "Lâm Đồng",
  "Cần Thơ",
  "Kiên Giang",
];
```

---

## StoreDrawer — Props mới

```ts
interface StoreDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: StoreFormValues) => Promise<void>;
  initialData?: Partial<StoreFormValues>;
  // Bỏ brands prop — drawer tự load
}
```

---

## Layout form (2-col grid)

```
[Mã cửa hàng *]       [Tên cửa hàng *]
[Thương hiệu *]        [Loại cửa hàng *]
[Khu vực]              [Tỉnh / Thành phố]
[Quận / Huyện]         [Xã / Phường]
[Địa chỉ đầy đủ ————————————— col-span-2]
[Quản lý cửa hàng ——————————— col-span-2]
[Trạng thái hoạt động ——————— col-span-2]
```

---

## Design system (từ BrandDrawer)

```tsx
// Label
<FormLabel className="font-black text-[11px] uppercase tracking-widest text-gray-400">

// Input
<Input className="h-11 rounded-xl border-gray-200 focus:border-primary shadow-sm" />

// Select trigger
<SelectTrigger className="h-11 rounded-xl border-gray-200 focus:ring-primary shadow-sm">

// Footer buttons
<Button variant="outline" className="rounded-xl font-bold h-11 px-6">Hủy</Button>
<Button className="bg-primary rounded-xl font-black h-11 min-w-[150px] shadow-lg shadow-primary/20">
  Lưu thông tin
</Button>
```

---

## Organization page — cần update sau khi đổi StoreDrawer

1. Xóa `brands={brandRows}` prop khỏi `<StoreDrawer>`
2. `storeInitialData`: đổi `brand:` → `brandId:`
3. `handleStoreSubmit`: đổi `data.brand` → `data.brandId`

---

## Checklist

- [ ] Thêm `role` param vào `masterApi.getUsers`
- [ ] Thêm `useStoreManagers` hook vào `use-users.ts`
- [ ] Rewrite `store-drawer.tsx`:
  - [ ] Bỏ `brands` prop, thêm `useBrands({ limit: 100 })` bên trong
  - [ ] Thêm `useStoreManagers()` bên trong
  - [ ] Schema mới: `brandId`, bỏ required cho location fields
  - [ ] REGIONS + PROVINCES constants
  - [ ] Layout 2-col theo spec
  - [ ] Design system align BrandDrawer
- [ ] Update `organization/page.tsx`: `storeInitialData` + `handleStoreSubmit`
- [ ] `npm run typecheck` clean
- [ ] Test thủ công: tạo store + edit store hoạt động đúng

## Notes

- District + ward để Input free-text (DB là String?, không cần cascading dropdown)
- `managerId` optional — có thể tạo store trước, assign sau
- AM assignment vẫn dùng flow riêng (assign-am route) — không đưa vào drawer này
- File phải < 200 lines — nếu vượt, tách constants ra file `store-drawer-constants.ts`
